// Laedt Module der gesicherten Fassung (recovered/build/assets) fuer Vergleichstests.
// Wie recovered/harness/instrument.mjs: jedes Modul bekommt einen Zusatz-Export
// `__recovered__` mit Gettern auf alle Bindungen der obersten Ebene. Die Kopie liegt
// in recovered/harness/.cache/vitest (nicht im Repo) und wird bei Bedarf neu erzeugt.
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as acorn from "acorn";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const build = join(root, "recovered", "build", "assets");
const cache = join(root, "recovered", "harness", ".cache", "vitest");

function bindings(src: string): string[] {
  const ast = acorn.parse(src, {
    ecmaVersion: "latest",
    sourceType: "module",
  }) as unknown as {
    body: Array<Record<string, unknown>>;
  };
  const names = new Set<string>();
  const add = (p: unknown): void => {
    const n = p as {
      type?: string;
      name?: string;
      [k: string]: unknown;
    } | null;
    if (!n) return;
    if (n.type === "Identifier") names.add(n.name as string);
    else if (n.type === "ObjectPattern")
      (
        n.properties as Array<{
          type: string;
          argument?: unknown;
          value?: unknown;
        }>
      ).forEach((q) => add(q.type === "RestElement" ? q.argument : q.value));
    else if (n.type === "ArrayPattern") (n.elements as unknown[]).forEach(add);
    else if (n.type === "RestElement") add(n.argument);
    else if (n.type === "AssignmentPattern") add(n.left);
  };
  for (const node of ast.body) {
    const d = (
      node.type === "ExportNamedDeclaration" ||
      node.type === "ExportDefaultDeclaration"
        ? node.declaration
        : node
    ) as {
      type?: string;
      declarations?: Array<{ id: unknown }>;
      id?: { name: string };
      specifiers?: Array<{ local: { name: string } }>;
    } | null;
    if (!d) continue;
    if (d.type === "VariableDeclaration")
      d.declarations!.forEach((x) => add(x.id));
    else if (
      (d.type === "FunctionDeclaration" || d.type === "ClassDeclaration") &&
      d.id
    )
      names.add(d.id.name);
    else if (d.type === "ImportDeclaration")
      d.specifiers!.forEach((s) => names.add(s.local.name));
  }
  return [...names];
}

function prepare(): void {
  mkdirSync(cache, { recursive: true });
  for (const f of readdirSync(build)) {
    if (!f.endsWith(".js")) continue;
    const target = join(cache, f);
    if (existsSync(target)) continue;
    const src = readFileSync(join(build, f), "utf8");
    let extra = "";
    try {
      const names = bindings(src);
      extra = `\n;export const __recovered__={${names
        .map((n) => `get ${JSON.stringify(n)}(){return ${n}}`)
        .join(",")}};\n`;
    } catch {
      // klassischer Worker oder nicht parsebar: unveraendert
    }
    writeFileSync(target, src + extra);
  }
}

/** Alle Bindungen eines Chunks, z. B. `await recovered("svg")`. */
export async function recovered(chunk: string): Promise<Record<string, any>> {
  prepare();
  // Der App-Start (index) laedt Module vor und fragt den Server; im Test ins Leere laufen lassen.
  const g = globalThis as { fetch?: unknown; __recoveredFetch?: boolean };
  if (!g.__recoveredFetch) {
    g.fetch = () => new Promise(() => {});
    g.__recoveredFetch = true;
  }
  const file = readdirSync(build).find(
    (f) => f.startsWith(`${chunk}-`) && f.endsWith(".js"),
  );
  if (!file) throw new Error(`Chunk nicht gefunden: ${chunk}`);
  const mod = (await import(
    /* @vite-ignore */ pathToFileURL(join(cache, file)).href
  )) as {
    __recovered__: Record<string, any>;
  };
  return mod.__recovered__;
}
