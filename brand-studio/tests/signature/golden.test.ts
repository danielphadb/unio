// @vitest-environment jsdom
// Signature-Logos im Golden Master: Jedes Referenz-SVG eines Konzepts mit Vorlage
// (Galerie in tests/golden/logo, Namenskarten in tests/golden/names) entsteht mit dem
// neuen Code byte-gleich. Hülle wie die Logo-Engine (`zm`): svgDocument mit 2 % Rand.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import { newStore } from "./helpers";
import { renderSignature, signatureFonts } from "../../src/signature";
import { svgDocument } from "../../src/engine/svg";
import type { LogoConcept } from "../../src/types";

const golden = join(__dirname, "..", "golden");
const SLUGS = [
  "anna-berger",
  "philipp-trattner",
  "wiener-wohnwerk",
  "seeblick-realitaeten",
  "kalmar",
  "lena-hofer-partner",
  "brandl-soehne",
  "gebrueder-kogler",
];
const read = (rel: string) =>
  JSON.parse(readFileSync(join(golden, rel), "utf8"));
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

const store = newStore();

/** Wie die Logo-Engine (`zm`) ein Logo als Dokument ausgibt. */
async function logoSvg(
  c: LogoConcept,
  input: any,
  opts: { variant?: string; ground?: string },
) {
  await store.ensure(signatureFonts(c, input));
  const part = renderSignature(c, input, store, opts);
  if (!part || !part.width) return "";
  return svgDocument(part, {
    padding: Math.max(part.width, part.height) * 0.02,
  }).replace(
    "<svg ",
    '<svg aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet" ',
  );
}

let nf: Record<string, any>;
let en: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  en = await recovered("engine");
  nf = await recovered("nameFinder");
}, 120_000);

describe("Golden Master: Signature-Logos", () => {
  it("Galerie (logo/*.json)", async () => {
    let n = 0;
    for (const slug of SLUGS) {
      const g = read(`logo/${slug}.json`);
      for (const lauf of Object.values<any>(g.laeufe))
        for (const run of Object.values<any>(lauf.seeds))
          for (const c of run.kuratiert as LogoConcept[]) {
            const ref = run.svg[c.id];
            if (!c.signature || !ref) continue;
            const svg = await logoSvg(c, lauf.input, { variant: "color" });
            expect(sha(svg), `${slug} ${c.id}`).toBe(ref.sha256);
            n++;
          }
    }
    expect(n).toBeGreaterThan(20);
  });

  it("Namenskarten (names/*.json)", async () => {
    let n = 0;
    for (const slug of SLUGS) {
      const g = read(`names/${slug}.json`);
      for (const seed of Object.values<any>(g.laeufe))
        for (const lauf of Object.values<any>(seed)) {
          const styles = lauf.form.style !== "egal" ? [lauf.form.style] : [];
          const first = lauf.chargen[0] ?? [];
          const karten = lauf.karten as LogoConcept[];
          for (let i = 0; i < karten.length; i++) {
            const c = karten[i]!;
            const ref = lauf.kartenSvg?.[c?.id];
            if (!c?.signature || !ref) continue;
            n++;
            const input = nf.Gt(first[i], styles);
            const face = en.qs(c);
            const svg = await logoSvg(c, input, {
              variant: face?.variant,
              ground: face?.ground,
            });
            expect(sha(svg), `${slug} ${c.id}`).toBe(ref.sha256);
          }
        }
    }
    expect(n).toBeGreaterThan(5);
  });
});
