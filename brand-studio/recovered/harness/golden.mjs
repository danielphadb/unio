// W2: Referenz-Ausgaben (Golden Master) aus der gesicherten Fassung.
//
//   node recovered/harness/golden.mjs           schreibt tests/golden/**
//   node recovered/harness/golden.mjs --check   erzeugt alles neu in einem Temp-Ordner
//                                               und vergleicht mit tests/golden/MANIFEST.json
//
// Voraussetzung: npm run recovered:fonts && npm run recovered:instrument
// Eingaben und Seeds: tests/golden/inputs.json (Beschreibung in tests/golden/README.md).
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { join, dirname, relative } from "node:path";
import { tmpdir } from "node:os";
import { openStudio, here, studioRoot } from "./lib.mjs";

const check = process.argv.includes("--check");
const goldenDir = join(studioRoot, "tests/golden");
const outDir = check ? join(tmpdir(), `golden-check-${process.pid}`) : goldenDir;
const cfg = JSON.parse(readFileSync(join(goldenDir, "inputs.json"), "utf8"));

const sha = (s) => createHash("sha256").update(s).digest("hex");
const write = (rel, data) => {
  const p = join(outDir, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, data);
};
const writeJson = (rel, obj) => write(rel, JSON.stringify(obj, null, 1) + "\n");
// SVG ablegen und durch Verweis ersetzen. gz: gzip ohne Zeitstempel (deterministisch).
const svgRef = (rel, svg, gz = false) => {
  if (typeof svg !== "string" || !svg) return { svg: null };
  write(gz ? `${rel}.gz` : rel, gz ? gzipSync(Buffer.from(svg), { level: 9 }) : svg);
  return { datei: gz ? `${rel}.gz` : rel, sha256: sha(svg), bytes: Buffer.byteLength(svg) };
};
const pad = (n) => String(n).padStart(2, "0");

if (check) rmSync(outDir, { recursive: true, force: true });
else
  for (const sub of ["logo", "names", "strategy", "postings", "unterlagen"])
    rmSync(join(goldenDir, sub), { recursive: true, force: true });

const s = await openStudio({ fixedTime: cfg.zeitpunkt, timezone: cfg.zeitzone });
await s.page.evaluate((e) => localStorage.setItem("unio-brand:einstellungen", JSON.stringify(e)), cfg.einstellungen);
await s.page.reload({ waitUntil: "load" });
await s.page.addScriptTag({ path: join(here, "golden.browser.js") });
const call = (fn, ...args) =>
  s.page.evaluate(({ fn, args }) => window.__golden[fn](...args), { fn, args });

// Logo-Engine
for (const brand of cfg.marken) {
  const r = await call("logo", cfg, brand);
  for (const [vk, lauf] of Object.entries(r.laeufe))
    for (const [seed, run] of Object.entries(lauf.seeds)) {
      const refs = {};
      Object.entries(run.svg).forEach(([id, svg], i) => {
        refs[id] = svgRef(`logo/svg/${brand.slug}/${vk}_${seed}_${pad(i + 1)}.svg`, svg);
      });
      run.svg = refs;
    }
  writeJson(`logo/${brand.slug}.json`, r);
  console.log("logo", brand.slug);
}

// Namen
for (const brand of cfg.marken) {
  const r = await call("names", cfg, brand);
  for (const [seed, byVariant] of Object.entries(r.laeufe))
    for (const [vk, run] of Object.entries(byVariant)) {
      const refs = {};
      Object.entries(run.kartenSvg).forEach(([id, svg], i) => {
        refs[id] = svgRef(`names/svg/${brand.slug}/${vk}_${seed}_${pad(i + 1)}.svg`, svg);
      });
      run.kartenSvg = refs;
    }
  writeJson(`names/${brand.slug}.json`, r);
  console.log("names", brand.slug);
}

// Strategie
writeJson("strategy/routes.json", await call("strategy", cfg));
console.log("strategy");

// Postings
{
  const r = await call("postings", cfg);
  for (const [key, v] of Object.entries(r.svg)) {
    if (!v) continue;
    const { svg, ...rest } = v;
    r.svg[key] = { ...rest, ...svgRef(`postings/svg/${key}.svg`, svg, true) };
  }
  writeJson("postings/index.json", r);
  console.log("postings", Object.keys(r.svg).length);
}

// Unterlagen
{
  const r = await call("unterlagen", cfg);
  for (const [set, items] of Object.entries(r.sets))
    for (const [id, it] of Object.entries(items))
      if (it.seiten)
        it.seiten = it.seiten.map((p, i) => ({
          label: p.label,
          ...svgRef(`unterlagen/svg/${set}/${id}${it.seiten.length > 1 ? `-${i + 1}` : ""}.svg`, p.svg, true),
        }));
  writeJson("unterlagen/index.json", r);
  console.log("unterlagen");
}

if (s.errors.length) console.warn("Browser-Meldungen:", s.errors.slice(0, 10));
await s.close();

// Manifest ueber alle erzeugten Dateien (ohne inputs.json, README, MANIFEST selbst).
const manifest = {};
const walk = (d) => {
  for (const f of readdirSync(d).sort()) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else {
      const rel = relative(outDir, p);
      if (["inputs.json", "README.md", "MANIFEST.json"].includes(rel)) continue;
      manifest[rel] = sha(readFileSync(p));
    }
  }
};
walk(outDir);
const summary = { dateien: Object.keys(manifest).length, gesamt: sha(JSON.stringify(manifest)) };

if (!check) {
  writeJson("MANIFEST.json", { ...summary, dateien_sha256: manifest });
  console.log("geschrieben:", summary);
} else {
  const ref = JSON.parse(readFileSync(join(goldenDir, "MANIFEST.json"), "utf8"));
  const diff = [];
  for (const k of new Set([...Object.keys(ref.dateien_sha256), ...Object.keys(manifest)]))
    if (ref.dateien_sha256[k] !== manifest[k]) diff.push(k);
  rmSync(outDir, { recursive: true, force: true });
  if (diff.length) {
    console.error(`ABWEICHUNG in ${diff.length} Dateien:`, diff.slice(0, 20));
    process.exit(1);
  }
  console.log("identisch mit tests/golden:", summary);
}
