// Gemeinsame Helfer fuer die Golden-Tests der Logo-Engine: Schriften aus public/ laden
// (statt fetch im Browser) und die Referenz-Laeufe aus tests/golden/logo lesen.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..", "..");
export const goldenDir = join(root, "tests", "golden");

/** fetch-Ersatz: `.../fonts/brand/<datei>` aus public/ lesen. */
export function installFontFetch(): void {
  const g = globalThis as { fetch?: unknown };
  g.fetch = async (url: string | URL) => {
    const u = String(url);
    const m = /fonts\/brand\/([^/?#]+)$/.exec(u);
    const file = m ? join(root, "public", "fonts", "brand", m[1]!) : "";
    if (!m || !existsSync(file))
      return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
    const b = readFileSync(file);
    const buf = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    return { ok: true, status: 200, arrayBuffer: async () => buf };
  };
}

export interface GoldenRun {
  generateConcepts: Record<string, unknown[]>;
  galeriePools: string[][];
  kuratiert: Array<{ id: string } & Record<string, unknown>>;
  svg: Record<string, { datei: string; sha256: string; bytes: number }>;
}
export interface GoldenLogo {
  marke: string;
  route: { id: string; territory: string };
  laeufe: Record<string, { input: any; seeds: Record<string, GoldenRun> }>;
}

export const BRANDS = [
  "anna-berger",
  "philipp-trattner",
  "wiener-wohnwerk",
  "seeblick-realitaeten",
  "kalmar",
  "lena-hofer-partner",
  "brandl-soehne",
  "gebrueder-kogler",
];

export const goldenInputs = JSON.parse(
  readFileSync(join(goldenDir, "inputs.json"), "utf8"),
) as {
  seeds: number[];
  einstellungen: { signatureEntwuerfe: boolean };
  galerie: { seiten: number; seitengroesse: number; svgJeLauf: number };
  generateConcepts: { count: number; pages: number[] };
};

export function goldenLogo(slug: string): GoldenLogo {
  return JSON.parse(readFileSync(join(goldenDir, "logo", `${slug}.json`), "utf8"));
}

export function goldenSvg(rel: string): string {
  return readFileSync(join(goldenDir, rel), "utf8");
}
