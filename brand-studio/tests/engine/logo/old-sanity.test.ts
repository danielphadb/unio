// @vitest-environment jsdom
// Voraussetzung: die gesicherte Fassung reproduziert den Golden Master auch unter Node.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../../helpers/recovered";
import { goldenInputs, goldenLogo, goldenSvg, installFontFetch } from "../../helpers/goldenLogo";

let en: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  en = await recovered("engine");
  installFontFetch();
}, 60000);

describe("alte Engine unter Node", () => {
  it("anna-berger ohneRoute seed 1", async () => {
    const g = goldenLogo("anna-berger");
    const lauf = g.laeufe.ohneRoute!;
    const input = lauf.input;
    const run = lauf.seeds["1"]!;
    const seed = 1;
    const plain = (v: unknown) => JSON.parse(JSON.stringify(v ?? null));
    expect(plain(en.Ga(input, { count: 12, page: 0, seed }))).toEqual(run.generateConcepts.page0);
    const list: any[] = [];
    const pools: string[][] = [];
    for (let T = 0; T < goldenInputs.galerie.seiten; T++) {
      const { pkg } = en.cm(T);
      const pool = en.Tm(input, { page: pkg <= 0 ? 0 : pkg + 1, seed: (seed ^ en.dt(input)) >>> 0, signatureEntwuerfe: true });
      await en.pn.ensure(en.Xe(pool, "logo", input));
      const page = en.Rm(pool, input, en.pn, 6, { exclude: list.map((c) => c.id), pinFirst: false });
      list.push(...page);
      pools.push(pool.map((c: any) => c.id));
    }
    expect(pools).toEqual(run.galeriePools);
    expect(plain(list)).toEqual(run.kuratiert);
    const first = list.slice(0, 6);
    await en.pn.ensure(en.Xe(first, "logo", input));
    for (const c of first) expect(en.zm(c, input, { variant: "color" })).toBe(goldenSvg(run.svg[c.id]!.datei));
  }, 120000);
});
