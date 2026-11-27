// Erzeugt eine "instrumentierte" Kopie der gesicherten Fassung (recovered/build):
// Jedes ES-Modul unter assets/ bekommt am Ende einen zusaetzlichen Export
// `__recovered__`, ein Objekt mit Gettern auf ALLE Bindungen der obersten Ebene.
// Damit sind auch nicht exportierte Konstanten und Funktionen im Browser
// erreichbar, ohne den Code sonst zu veraendern (Dateinamen bleiben gleich).
// Worker (klassische Skripte ohne import/export) bleiben unveraendert.
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as acorn from "acorn";

const here = dirname(fileURLToPath(import.meta.url));
const build = join(here, "..", "build");
const out = join(here, "instrumented");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(build, out, { recursive: true });

// Markenschriften (W1 Schritt 4) mitliefern, damit Logos mit echten Schriften rendern.
const brandFonts = join(here, "..", "..", "public", "fonts", "brand");
try {
  cpSync(brandFonts, join(out, "fonts", "brand"), { recursive: true });
} catch {
  console.warn("Hinweis: public/fonts/brand fehlt, erst `npm run recovered:fonts` ausfuehren.");
}

// Das Haupt-Stylesheet ist in index.html eingebettet; Vite verweist beim Nachladen
// (jsPDF, svg2pdf) trotzdem auf assets/index-C94v3gle.css. Ohne Datei bricht das
// Vorladen ab. Leere Datei anlegen (die Stile stehen schon im Dokument).
writeFileSync(join(out, "assets", "index-C94v3gle.css"), "/* eingebettet in index.html */\n");

const report = {};
for (const f of readdirSync(join(build, "assets"))) {
  if (!f.endsWith(".js")) continue;
  const src = readFileSync(join(build, "assets", f), "utf8");
  const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module" });
  const isModule = ast.body.some(
    (n) => n.type === "ImportDeclaration" || n.type.startsWith("Export"),
  );
  if (!isModule) {
    report[f] = { module: false };
    continue;
  }
  const names = new Set();
  const addPattern = (p) => {
    if (!p) return;
    if (p.type === "Identifier") names.add(p.name);
    else if (p.type === "ObjectPattern")
      p.properties.forEach((q) => addPattern(q.type === "RestElement" ? q.argument : q.value));
    else if (p.type === "ArrayPattern") p.elements.forEach(addPattern);
    else if (p.type === "RestElement") addPattern(p.argument);
    else if (p.type === "AssignmentPattern") addPattern(p.left);
  };
  for (const n of ast.body) {
    const d = n.type === "ExportNamedDeclaration" || n.type === "ExportDefaultDeclaration" ? n.declaration : n;
    if (!d) continue;
    if (d.type === "VariableDeclaration") d.declarations.forEach((x) => addPattern(x.id));
    else if ((d.type === "FunctionDeclaration" || d.type === "ClassDeclaration") && d.id) names.add(d.id.name);
    else if (d.type === "ImportDeclaration")
      d.specifiers.forEach((s) => names.add(s.local.name));
  }
  const getters = [...names].map((n) => `get ${JSON.stringify(n)}(){return ${n}}`).join(",");
  const extra = `\n;export const __recovered__={${getters}};\n`;
  writeFileSync(join(out, "assets", f), src + extra);
  report[f] = { module: true, bindings: names.size };
}
writeFileSync(join(out, "instrument-report.json"), JSON.stringify(report, null, 2));
console.log(`instrumentiert: ${Object.values(report).filter((r) => r.module).length} Module`);
