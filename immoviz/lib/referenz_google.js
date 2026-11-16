#!/usr/bin/env node
/*
 * immoviz referenz: rendert Ansichten aus Google Photorealistic 3D Tiles mit CesiumJS in Chromium (Playwright).
 * Nur interne Referenz fuer den Abgleich (Google-Lizenz): nichts davon kommt ins Modell, ins Repo oder in ein
 * Vermarktungsbild. Aufgerufen von lib/referenz.py mit einer Auftragsdatei:
 *
 *   node lib/referenz_google.js auftrag.json
 *
 * Auftrag: {cesium: "<CDN-Basis mit fester Version>", chrome: "/usr/bin/google-chrome", sse: 4,
 *           views: [{name, kind: "persp"|"ortho", W, H, fov, width_m, pos: [ECEF], dir: [..], up: [..],
 *                    out_rgb, out_depth}]}
 * Je Ansicht entstehen ein Farbbild (PNG) und ein Tiefenbild (PNG, Abstand entlang der Blickachse in cm + 1,
 * kodiert als r + 256 g + 65536 b; 0 = Himmel).
 *
 * Der Schluessel kommt ausschliesslich aus der Umgebungsvariable GOOGLE_MAPS_API_KEY und wird nirgends gespeichert
 * oder ausgegeben.
 */
'use strict';
const fs = require('fs');
const path = require('path');

function loadPlaywright() {
  const tries = ['playwright', '/opt/node22/lib/node_modules/playwright'];
  try {
    const g = require('child_process').execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    tries.push(path.join(g, 'playwright'));
  } catch (e) { /* npm fehlt */ }
  for (const t of tries) {
    try { return require(t); } catch (e) { /* naechster Versuch */ }
  }
  throw new Error('playwright nicht gefunden (npm i -g playwright)');
}

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!KEY && !job.test) { console.error('GOOGLE_MAPS_API_KEY fehlt'); process.exit(2); }

const CESIUM = job.cesium;
const HTML = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${CESIUM}/Widgets/widgets.css">
<style>html,body{margin:0;padding:0;background:#000;overflow:hidden}#c{position:absolute;left:0;top:0}#cr{display:none}</style>
<script>window.CESIUM_BASE_URL = "${CESIUM}/";</script>
<script src="${CESIUM}/Cesium.js"></script></head>
<body><div id="c"></div><div id="cr"></div></body></html>`;

(async () => {
  const { chromium } = loadPlaywright();
  const maxW = Math.max(...job.views.map(v => v.W), 64);
  const maxH = Math.max(...job.views.map(v => v.H), 64);
  const browser = await chromium.launch({
    executablePath: job.chrome || '/usr/bin/google-chrome', headless: true,
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
           `--window-size=${maxW},${maxH}`],
  });
  const page = await browser.newPage({ viewport: { width: maxW, height: maxH }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('Seitenfehler:', String(e).slice(0, 300)));
  await page.route('https://immoviz.invalid/referenz.html', r => r.fulfill({ contentType: 'text/html', body: HTML }));
  await page.goto('https://immoviz.invalid/referenz.html', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!window.Cesium, null, { timeout: 120000 });

  const info = await page.evaluate(async ({ key, sse, test }) => {
    const C = window.Cesium;
    C.Ion.defaultAccessToken = '';
    const viewer = new C.Viewer('c', {
      globe: false, skyBox: false, skyAtmosphere: false, baseLayer: false, baseLayerPicker: false, geocoder: false,
      homeButton: false, sceneModePicker: false, navigationHelpButton: false, animation: false, timeline: false,
      fullscreenButton: false, infoBox: false, selectionIndicator: false, useDefaultRenderLoop: false,
      creditContainer: 'cr', msaaSamples: 1, useBrowserRecommendedResolution: false,
      contextOptions: { webgl: { preserveDrawingBuffer: true, alpha: false, antialias: false } },
    });
    const s = viewer.scene;
    s.fog.enabled = false;
    s.postProcessStages.fxaa.enabled = false;
    s.highDynamicRange = false;
    if (s.sun) s.sun.show = false;
    if (s.moon) s.moon.show = false;
    viewer.resolutionScale = 1.0;
    window._v = viewer;
    // Tiefe entlang der Blickachse in cm + 1 als 24 Bit; vor der sRGB-Umrechnung der Ausgabe linearisiert
    window._depthShader = new C.CustomShader({
      mode: C.CustomShaderMode.REPLACE_MATERIAL,
      lightingModel: C.LightingModel.UNLIT,
      fragmentShaderText: `
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          float d = max(-fsInput.attributes.positionEC.z, 0.0);
          float c = floor(d * 100.0 + 0.5) + 1.0;
          float b = floor(c / 65536.0);
          float r2 = c - b * 65536.0;
          float g = floor(r2 / 256.0);
          float r = r2 - g * 256.0;
          material.diffuse = czm_srgbToLinear(vec3(r, g, b) / 255.0);
          material.alpha = 1.0;
        }`,
    });
    if (test) return { cesium: C.VERSION };
    const ts = await C.Cesium3DTileset.fromUrl('https://tile.googleapis.com/v1/3dtiles/root.json?key=' + key, {
      maximumScreenSpaceError: sse, skipLevelOfDetail: false, preloadWhenHidden: false,
      cacheBytes: 3 * 1024 * 1024 * 1024, maximumCacheOverflowBytes: 1024 * 1024 * 1024,
      showCreditsOnScreen: true,
    });
    s.primitives.add(ts);
    window._ts = ts;
    return { cesium: C.VERSION };
  }, { key: KEY || '', sse: job.sse || 4, test: !!job.test });
  console.error('Cesium', info.cesium);

  const results = [];
  for (const v of job.views) {
    const t0 = Date.now();
    const r = await page.evaluate(async (v) => {
      const C = window.Cesium, viewer = window._v, s = viewer.scene, ts = window._ts;
      const el = document.getElementById('c');
      el.style.width = v.W + 'px';
      el.style.height = v.H + 'px';
      viewer.resize();
      const cam = s.camera;
      if (v.kind === 'ortho') {
        cam.frustum = new C.OrthographicFrustum({ width: v.width_m, aspectRatio: v.W / v.H, near: 1.0, far: 20000.0 });
      } else {
        cam.frustum = new C.PerspectiveFrustum({ fov: v.fov, aspectRatio: v.W / v.H, near: 0.5, far: 60000.0 });
      }
      cam.setView({
        destination: new C.Cartesian3(...v.pos),
        orientation: { direction: new C.Cartesian3(...v.dir), up: new C.Cartesian3(...v.up) },
      });
      // setView passt die Breite einer Orthogonalkamera an die Hoehe an: danach fest setzen
      if (v.kind === 'ortho') {
        cam.frustum.width = v.width_m;
        cam.frustum.aspectRatio = v.W / v.H;
      }
      const sleep = ms => new Promise(res => setTimeout(res, ms));
      async function settle(maxMs) {
        const t = Date.now();
        let ok = 0, frames = 0;
        while (Date.now() - t < maxMs) {
          viewer.render();
          frames++;
          if (ts && ts.tilesLoaded) { ok++; if (ok >= 4) break; } else ok = 0;
          await sleep(60);
        }
        return { frames, loaded: ts ? ts.tilesLoaded : true };
      }
      if (ts) ts.customShader = undefined;
      s.backgroundColor = C.Color.fromCssColorString('#cfd8e3');
      const st = await settle(v.timeout_ms || 420000);
      const canvas = viewer.canvas;
      const rgb = canvas.toDataURL('image/png');
      if (ts) ts.customShader = window._depthShader;
      s.backgroundColor = C.Color.BLACK;
      for (let i = 0; i < 4; i++) { viewer.render(); await sleep(30); }
      const depth = canvas.toDataURL('image/png');
      return { rgb, depth, w: canvas.width, h: canvas.height, ...st };
    }, v);
    for (const [k, out] of [['rgb', v.out_rgb], ['depth', v.out_depth]]) {
      if (out) fs.writeFileSync(out, Buffer.from(r[k].split(',')[1], 'base64'));
    }
    results.push({ name: v.name, w: r.w, h: r.h, frames: r.frames, loaded: r.loaded, sekunden: Math.round((Date.now() - t0) / 1000) });
    console.error('Ansicht', v.name, r.w + 'x' + r.h, 'geladen', r.loaded, Math.round((Date.now() - t0) / 1000) + ' s');
  }
  await browser.close();
  process.stdout.write(JSON.stringify({ cesium: info.cesium, views: results }));
})().catch(e => { console.error(String(e && e.stack || e).replace(/key=[^&\s"']+/g, 'key=***')); process.exit(1); });
