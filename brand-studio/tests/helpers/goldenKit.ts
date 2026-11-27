// Gemeinsame Helfer fuer die Golden-Tests von Postings und Unterlagen: Schriften aus public/
// laden (Marken- und UNIO-Schriften), Referenzen aus tests/golden/{postings,unterlagen} lesen.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const root = join(__dirname, "..", "..");
export const goldenDir = join(root, "tests", "golden");

/** fetch-Ersatz: `.../fonts/<ordner>/<datei>` aus public/fonts lesen. */
export function installKitFontFetch(): void {
  const g = globalThis as { fetch?: unknown };
  g.fetch = async (url: string | URL) => {
    const u = String(url);
    const m = /fonts\/((?:brand|ui)\/[^/?#]+)$/.exec(u);
    const file = m ? join(root, "public", "fonts", m[1]!) : "";
    if (!m || !existsSync(file))
      return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
    const b = readFileSync(file);
    const buf = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    return { ok: true, status: 200, arrayBuffer: async () => buf };
  };
}

export const goldenInputs = JSON.parse(readFileSync(join(goldenDir, "inputs.json"), "utf8"));

export function goldenJson(rel: string): any {
  return JSON.parse(readFileSync(join(goldenDir, rel), "utf8"));
}

/** SVG einer Referenz (gzip oder roh). */
export function goldenSvgFile(rel: string): string {
  const b = readFileSync(join(goldenDir, rel));
  return (rel.endsWith(".gz") ? gunzipSync(b) : b).toString("utf8");
}

/**
 * Vite laedt Chunks (z. B. das eigene Design) mit `<link rel="modulepreload">` vor und wartet auf
 * deren load-Ereignis. jsdom laedt keine Links: hier sofort ein load-Ereignis ausloesen.
 */
export function installPreloadShim(): void {
  const doc = (globalThis as { document?: Document }).document;
  if (!doc) return;
  const fire = (n: Node) => {
    if ((n as Element).tagName === "LINK")
      setTimeout(() => n.dispatchEvent(new Event("load")), 0);
  };
  new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach(fire))).observe(doc, {
    childList: true,
    subtree: true,
  });
}

/**
 * Laufende IDs (clipPath, Verlauf) haengen am globalen Zaehler der Sitzung. Fuer Vergleiche
 * ohne gleichen Zaehlerstand: IDs in Reihenfolge des Auftretens durch `id0`, `id1`, ... ersetzen.
 */
export function normalizeIds(svg: string): string {
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]!);
  let out = svg;
  ids.forEach((id, i) => {
    out = out.split(`"${id}"`).join(`"id${i}"`).split(`#${id})`).join(`#id${i})`).split(`"#${id}"`).join(`"#id${i}"`);
  });
  return out;
}

const ID_RE = /\bid="([a-z]{1,3})([0-9a-z]+)"/;

/** Zaehlerstand vor der ersten ID eines Referenz-SVG (Basis 36), sonst null. */
export function firstIdCounter(svg: string, prefixes: readonly string[]): number | null {
  for (const m of svg.matchAll(new RegExp(ID_RE.source, "g"))) {
    for (const p of prefixes) {
      const full = m[1]! + m[2]!;
      if (full.startsWith(p) && /^[0-9a-z]+$/.test(full.slice(p.length)))
        return parseInt(full.slice(p.length), 36) - 1;
    }
  }
  return null;
}

/** Uhr und Zeitzone wie bei der Aufzeichnung (inputs.json: zeitpunkt, zeitzone). */
export function fixClock(vi: { useFakeTimers: (o: object) => unknown; setSystemTime: (d: Date) => unknown }): void {
  process.env.TZ = goldenInputs.zeitzone;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(goldenInputs.zeitpunkt));
}
