// W1 Schritt 4: Markenschriften aus den @fontsource-Paketen nach public/fonts/brand,
// UI-Schriften und Logos aus der gesicherten Fassung nach public/.
// Die Dateiliste ergibt sich wie im Bundle aus fonts.json und coverage.json
// (gk/yk in index: <pkg>-latin[-ext]-<gewicht>-<normal|italic>.woff).
// Schreibt public/fonts/manifest.json (Groesse und SHA-256 je Datei).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { studioRoot } from "./lib.mjs";

const fonts = JSON.parse(readFileSync(join(studioRoot, "src/engine/fonts.json"), "utf8"));
const coverage = JSON.parse(readFileSync(join(studioRoot, "src/engine/coverage.json"), "utf8"));
const out = join(studioRoot, "public/fonts/brand");
mkdirSync(out, { recursive: true });

const files = [];
for (const f of fonts) {
  const ext = coverage[f.key]?.ext;
  const add = (w, style) => {
    files.push({ pkg: f.pkg, file: `${f.pkg}-latin-${w}-${style}.woff` });
    if (ext) files.push({ pkg: f.pkg, file: `${f.pkg}-latin-ext-${w}-${style}.woff` });
  };
  for (const w of f.weights) add(w, "normal");
  for (const w of f.italics ?? []) add(w, "italic");
}
const missing = [];
for (const { pkg, file } of files) {
  const src = join(studioRoot, "node_modules/@fontsource", pkg, "files", file);
  if (!existsSync(src)) missing.push(file);
  else copyFileSync(src, join(out, file));
}

// Dateien, die sich aus keiner Fontsource-Version byte-gleich ergeben, kommen aus
// dem veroeffentlichten Artifact (recovered/fonts-override, siehe README dort).
const override = join(studioRoot, "recovered/fonts-override");
for (const f of readdirSync(override).filter((x) => x.endsWith(".woff")))
  copyFileSync(join(override, f), join(out, f));

// Abgleich mit den SHA-256-Werten des Artifacts.
const ref = JSON.parse(readFileSync(join(studioRoot, "recovered/fonts-artifact-sha256.json"), "utf8")).dateien;

const build = join(studioRoot, "recovered/build");
mkdirSync(join(studioRoot, "public/fonts/ui"), { recursive: true });
for (const f of readdirSync(join(build, "fonts/ui")))
  copyFileSync(join(build, "fonts/ui", f), join(studioRoot, "public/fonts/ui", f));
for (const f of ["unio-logo-black.svg", "unio-logo-white.svg"])
  copyFileSync(join(build, f), join(studioRoot, "public", f));

const manifest = {};
for (const sub of ["brand", "ui"]) {
  const dir = join(studioRoot, "public/fonts", sub);
  for (const f of readdirSync(dir).sort()) {
    const buf = readFileSync(join(dir, f));
    manifest[`fonts/${sub}/${f}`] = { bytes: statSync(join(dir, f)).size, sha256: createHash("sha256").update(buf).digest("hex") };
  }
}
writeFileSync(join(studioRoot, "public/fonts/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Markenschriften: ${files.length - missing.length} von ${files.length} kopiert`);
const abweichend = Object.entries(ref).filter(([k, v]) => manifest[k]?.sha256 !== v.sha256).map(([k]) => k);
console.log(`Abgleich mit dem Artifact: ${Object.keys(ref).length - abweichend.length} von ${Object.keys(ref).length} byte-gleich`);
if (abweichend.length) {
  console.error("Abweichend:", abweichend);
  process.exit(1);
}
if (missing.length) {
  console.error("Fehlen im Paket:", missing);
  process.exit(1);
}
