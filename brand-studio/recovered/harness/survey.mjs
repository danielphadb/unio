// Uebersicht ueber alle Bindungen der obersten Ebene je Modul (Name, Art, Groesse,
// Anfang des Quelltexts, Exportname, Importe). Grundlage fuer docs/23-modulkarte.md.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as acorn from "acorn";
import { here } from "./lib.mjs";

const dir = join(here, "..", "build", "assets");
const result = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const src = readFileSync(join(dir, f), "utf8");
  const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module" });
  const exp = {};
  const imports = [];
  const decls = [];
  for (const n of ast.body) {
    if (n.type === "ExportNamedDeclaration" && !n.declaration)
      n.specifiers.forEach((s) => (exp[s.local.name] = s.exported.name ?? s.exported.value));
    if (n.type === "ImportDeclaration")
      imports.push({ from: n.source.value, names: n.specifiers.map((s) => [s.imported?.name ?? "*", s.local.name]) });
    const d = n.type === "ExportNamedDeclaration" ? n.declaration : n;
    if (!d) continue;
    if (d.type === "VariableDeclaration")
      for (const x of d.declarations) {
        if (x.id.type !== "Identifier") continue;
        const init = x.init;
        decls.push({ name: x.id.name, kind: init ? init.type : "undefined", start: x.start, end: x.end });
      }
    else if ((d.type === "FunctionDeclaration" || d.type === "ClassDeclaration") && d.id)
      decls.push({ name: d.id.name, kind: d.type, start: d.start, end: d.end });
  }
  result[f] = {
    bytes: src.length,
    module: imports.length > 0 || Object.keys(exp).length > 0,
    imports,
    exports: exp,
    decls: decls.map((d) => ({
      name: d.name,
      exportedAs: exp[d.name] ?? null,
      kind: d.kind,
      size: d.end - d.start,
      head: src.slice(d.start, d.start + 140).replace(/\s+/g, " "),
    })),
  };
}
writeFileSync(join(here, "survey.json"), JSON.stringify(result, null, 1));
for (const [f, r] of Object.entries(result))
  console.log(f, r.bytes, "decls", r.decls.length, "exports", Object.keys(r.exports).length);
