// @vitest-environment jsdom
// Logo-Engine gegen den Golden Master (tests/golden/logo): generateConcepts, Galerie-Pools,
// Kuratierung und SVG-Strings, fuer alle Marken, beide Laeufe (ohne/mit Route) und alle Seeds.
import { beforeAll, describe, expect, it } from "vitest";
import {
  curateConcepts,
  curatedPackage,
  curationCandidates,
  fontsNeeded,
  fontStore,
  generateConcepts,
  inputSeed,
  renderLogoSvg,
} from "../../../src/engine";
import {
  BRANDS,
  goldenInputs,
  goldenLogo,
  goldenSvg,
  installFontFetch,
} from "../../helpers/goldenLogo";

beforeAll(() => installFontFetch());

const plain = (v: unknown) => JSON.parse(JSON.stringify(v ?? null));
const { seiten, seitengroesse, svgJeLauf } = goldenInputs.galerie;

describe.each(BRANDS)("Logo-Engine Golden Master: %s", (slug) => {
  const g = goldenLogo(slug);
  for (const [lauf, { input, seeds }] of Object.entries(g.laeufe))
    for (const [seedText, run] of Object.entries(seeds))
      it(`${lauf} seed ${seedText}`, async () => {
        const seed = Number(seedText);
        for (const page of goldenInputs.generateConcepts.pages)
          expect(
            plain(generateConcepts(input, { count: goldenInputs.generateConcepts.count, page, seed })),
            `generateConcepts page ${page}`,
          ).toEqual(run.generateConcepts[`page${page}`]);
        const list: any[] = [];
        const pools: string[][] = [];
        for (let T = 0; T < seiten; T++) {
          const { pkg } = curatedPackage(T);
          const pool = curationCandidates(input, {
            page: pkg <= 0 ? 0 : pkg + 1,
            seed: (seed ^ inputSeed(input)) >>> 0,
            signatureEntwuerfe: goldenInputs.einstellungen.signatureEntwuerfe,
          });
          await fontStore.ensure(fontsNeeded(pool, "logo", input));
          const page = curateConcepts(pool, input, fontStore, seitengroesse, {
            exclude: list.map((c) => c.id),
            pinFirst: false,
          });
          list.push(...page);
          pools.push(pool.map((c: any) => c.id));
        }
        expect(pools, "Galerie-Pools").toEqual(run.galeriePools);
        expect(plain(list), "Kuratierung").toEqual(run.kuratiert);
        const first = list.slice(0, svgJeLauf);
        await fontStore.ensure(fontsNeeded(first, "logo", input));
        for (const c of first)
          expect(renderLogoSvg(c, input, { variant: "color" }), `SVG ${c.id}`).toBe(
            goldenSvg(run.svg[c.id]!.datei),
          );
      }, 120000);
});
