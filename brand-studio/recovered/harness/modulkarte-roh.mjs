// Rohdaten fuer docs/23-modulkarte.md: je Modul alle Bindungen mit Art, Groesse, Export,
// genutzten Importen und einem Hinweis (erste deutschsprachige Zeichenkette im Rumpf).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { here } from "./lib.mjs";

const dir = join(here, "..", "build", "assets");
const LIBS = /^(html2canvas|index\.es|jspdf|purify|svg2pdf|render\.worker|zip\.worker)/;
const out = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith(".js") && !LIBS.test(x))) {
  const src = readFileSync(join(dir, f), "utf8");
  const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module" });
  const exp = {};
  const imp = {};
  for (const n of ast.body) {
    if (n.type === "ExportNamedDeclaration" && !n.declaration)
      n.specifiers.forEach((s) => (exp[s.local.name] = s.exported.name));
    if (n.type === "ImportDeclaration")
      n.specifiers.forEach((s) => (imp[s.local.name] = `${n.source.value.replace(/^\.\//, "").replace(/-[\w-]{8}\.js$/, "")}.${s.imported?.name ?? "*"}`));
  }
  const decls = [];
  const top = new Set();
  const pushDecl = (name, node, kind) => decls.push({ name, node, kind });
  for (const n of ast.body) {
    const d = n.type === "ExportNamedDeclaration" ? n.declaration : n;
    if (!d) continue;
    if (d.type === "VariableDeclaration")
      d.declarations.forEach((x) => x.id.type === "Identifier" && pushDecl(x.id.name, x, x.init?.type ?? "-"));
    else if ((d.type === "FunctionDeclaration" || d.type === "ClassDeclaration") && d.id) pushDecl(d.id.name, d, d.type);
  }
  decls.forEach((d) => top.add(d.name));
  const rows = decls.map(({ name, node, kind }) => {
    const usesImp = new Set();
    const usesTop = new Set();
    let hint = null;
    walk.full(node, (x) => {
      if (x.type === "Identifier") {
        if (imp[x.name]) usesImp.add(imp[x.name]);
        else if (top.has(x.name) && x.name !== name) usesTop.add(x.name);
      }
      if (!hint && (x.type === "Literal" || x.type === "TemplateElement")) {
        const v = x.type === "Literal" ? x.value : x.value.cooked;
        if (typeof v === "string" && /[A-Za-zÄÖÜäöüß]{4,}\s+[a-zäöüß]{3,}/.test(v) && v.length < 160) hint = v.trim();
      }
    });
    return {
      name,
      kind: kind.replace("Declaration", "").replace("Expression", ""),
      export: exp[name] ?? null,
      size: node.end - node.start,
      imports: [...usesImp].sort(),
      intern: [...usesTop].slice(0, 12),
      hint,
    };
  });
  out[f] = { bytes: src.length, exports: exp, importsFrom: [...new Set(Object.values(imp).map((x) => x.split(".")[0]))].sort(), rows };
}
writeFileSync(join(here, "modulkarte-roh.json"), JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, "Module");
