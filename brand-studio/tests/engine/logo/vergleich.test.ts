// @vitest-environment jsdom
// Logo-Engine Modul fuer Modul gegen die Funktionen der gesicherten Fassung (engine- und
// index-Chunk). Stichproben: alle Konzepte aus tests/golden/logo (Kuratierung und
// generateConcepts) mit ihrer Eingabe, dazu Eingaben mit Geschmack, Tagline und Seitenzahlen,
// die der Golden Master nicht abdeckt.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../../helpers/recovered";
import { BRANDS, goldenLogo, installFontFetch } from "../../helpers/goldenLogo";
import * as E from "../../../src/engine";
import * as S from "../../../src/symbols/Icons";
import { fontMonogramSvg, initialsOf } from "../../../src/symbols/monogram";
import {
  KONSTRUKTIONEN,
  availableKonstruktionen,
  drawnMonogram,
} from "../../../src/symbols/drawnMonogram";
import { CONTAINERS } from "../../../src/symbols/containers";
import { ALL_FONTS } from "../../../src/engine/fonts";
import type { BrandInput, LogoConcept } from "../../../src/types";

let en: Record<string, any>;
let ix: Record<string, any>;
const plain = (v: unknown) => JSON.parse(JSON.stringify(v ?? null));

interface Sample {
  concept: LogoConcept;
  input: BrandInput;
}
const samples: Sample[] = [];
const inputs: BrandInput[] = [];

beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  en = await recovered("engine");
  ix = await recovered("index");
  installFontFetch();
  for (const slug of BRANDS) {
    const g = goldenLogo(slug);
    for (const { input, seeds } of Object.values(g.laeufe)) {
      inputs.push(input);
      for (const run of Object.values(seeds)) {
        for (const c of run.kuratiert) samples.push({ concept: c as any, input });
        for (const page of Object.values(run.generateConcepts))
          for (const c of page.slice(0, 4)) samples.push({ concept: c as any, input });
      }
    }
  }
  for (const s of samples)
    await E.fontStore.ensure(E.fontsNeeded([s.concept], "all", s.input), [
      s.input.name,
      s.input.suffix,
    ]);
}, 120000);

const each = (fn: (s: Sample, i: number) => void) => samples.forEach(fn);

describe("Rendern und Farben (renderLogo.ts)", () => {
  it("resolveColors fuer alle Varianten und Gruende", () => {
    each(({ concept }) => {
      for (const v of ["color", "reverse", "mono-dark", "mono-light"])
        for (const g of [undefined, "#101820", "#F4F1EA"])
          expect(E.resolveColors(concept, v, g)).toEqual(en.Nn(concept, v, g));
    });
  });
  it("applyNameFormat, conceptFonts, typoFonts, initials", () => {
    each(({ concept, input }) => {
      expect(plain(E.applyNameFormat(concept, input))).toEqual(plain(en.kn(concept, input)));
      expect(E.conceptFonts(concept, input)).toEqual(en.wu(concept, input));
      expect(E.typoFonts(concept)).toEqual(en.Ti(concept));
      expect(E.initials(input.name, 1)).toBe(en.sn(input.name, 1));
    });
  });
  it("renderLogo mit Teilen, Anordnungen und Verstaerkung", () => {
    const opts = [
      {},
      { variant: "reverse", ground: "#101820" },
      { variant: "mono-dark" },
      { part: "symbol" },
      { part: "wordmark" },
      { lockup: "horizontal" },
      { lockup: "stacked" },
      { lockup: "monogram", boost: 1.6 },
    ] as const;
    each(({ concept, input }, i) => {
      if (i % 3) return;
      for (const o of opts)
        expect(E.renderLogo(concept, input, E.fontStore, o)).toEqual(
          en.Un(concept, input, E.fontStore, o),
        );
    });
  });
  it("renderTagline und renderLogoSvg mit Tagline", async () => {
    const tagged = samples.filter((_, i) => i % 7 === 0);
    for (const { concept, input } of tagged) {
      const refs = E.fontsForConcepts([concept], true, input);
      await E.fontStore.ensure(refs);
      await en.pn.ensure(refs); // renderLogoSvg der alten Fassung nutzt deren eigenen Speicher
    }
    tagged.forEach(({ concept, input }) => {
      const withTag = { ...input, tagline: "Ihr Zuhause in guten Händen" };
      expect(E.renderTagline(concept, withTag, E.fontStore, "color")).toEqual(
        en.yu(concept, withTag, E.fontStore, "color"),
      );
      expect(E.renderLogoSvg(concept, withTag, { tagline: true })).toBe(
        en.zm(concept, withTag, { tagline: true }),
      );
    });
  });
});

describe("Pruefen und Bewerten (logoCheck, quality, highend, taste)", () => {
  it("checkLogo, qualityScore, antiPatterns, corpusTwin, legalProximity", () => {
    each(({ concept, input }) => {
      expect(E.checkLogo(concept, input, E.fontStore)).toEqual(
        en.jn(concept, input, E.fontStore),
      );
      expect(E.qualityScore(concept, input)).toBe(en._n(concept, input));
      expect(E.antiPatterns(concept, input)).toEqual(en.Ai(concept, input));
      expect(E.corpusTwin(concept, input)).toEqual(en.Ei(concept, input));
      expect(E.legalProximity(concept, input)).toEqual(en.Ml(concept, input));
    });
  });
  it("tasteProfile und tasteScore", () => {
    const liked = samples.slice(0, 5).map((s) => s.concept);
    const disliked = samples.slice(40, 43).map((s) => s.concept);
    const p = E.tasteProfile({ liked, disliked });
    const q = en.ni({ liked, disliked });
    expect([...p.scores]).toEqual([...q.scores]);
    each(({ concept }) => expect(E.tasteScore(concept, p)).toBe(en.Ou(concept, q)));
  });
});

describe("Karten, Varianten, Typo (generator, variations, typoExtras, nameCards)", () => {
  it("cardFace, withCardBackground, typoKind, nameCardKey, cardVariant, suffixPairingOf", () => {
    each(({ concept, input }) => {
      expect(E.cardFace(concept)).toEqual(en.qs(concept));
      for (const bg of ["paper", "ink", "primary"] as const)
        expect(plain(E.withCardBackground(concept, bg))).toEqual(plain(en.eo(concept, bg)));
      expect(E.typoKind(concept)).toBe(en.Ye(concept));
      expect(E.nameCardKey(concept)).toBe(en.Vm(concept));
      expect(plain(E.cardVariant(concept, input))).toEqual(plain(en.Im(concept, input)));
      expect(E.suffixPairingOf(concept)).toBe(en.ti(concept));
    });
  });
  it("similarConcepts und editorVariants", () => {
    each(({ concept, input }, i) => {
      if (i % 5) return;
      for (const axis of ["font", "symbol", "layout", "palette", "typo"])
        expect(plain(E.similarConcepts(concept, input, axis, 6))).toEqual(
          plain(en.Cr(concept, input, axis, 6)),
        );
      expect(plain(E.editorVariants(concept, input, 8))).toEqual(plain(en.Lm(concept, input, 8)));
    });
  });
  it("editorOptions (Typo im Editor)", () => {
    each(({ concept, input }, i) => {
      if (i % 4) return;
      expect(plain(E.editorOptions(concept, input))).toEqual(plain(en.Am(concept, input)));
    });
  });
  it("Namenskarten: nameCardConcepts, nameCardFonts, fontPlan", () => {
    for (const input of inputs)
      for (const seed of [1, 77]) {
        for (const name of ["Hofer Wohnen", "Lumen", input.name])
          expect(plain(E.nameCardConcepts(name, input, 6, seed))).toEqual(
            plain(en.Nm(name, input, 6, seed)),
          );
        expect(E.nameCardFonts(input, seed, 6)).toEqual(en.Om(input, seed, 6));
        for (const page of [0, 1, 4]) expect(E.fontPlan(input, seed, page)).toEqual(en.Xt(input, seed, page));
      }
  });
});

describe("Generator und Kuratierung ausserhalb des Golden Master", () => {
  it("generateConcepts mit Geschmack und spaeteren Seiten", () => {
    const liked = samples.slice(3, 6).map((s) => s.concept);
    const disliked = samples.slice(60, 62).map((s) => s.concept);
    for (const input of inputs.slice(0, 6))
      for (const page of [2, 5])
        expect(
          plain(E.generateConcepts(input, { count: 12, page, seed: 5, taste: { liked, disliked } })),
        ).toEqual(plain(en.Ga(input, { count: 12, page, seed: 5, taste: { liked, disliked } })));
  });
  it("curationCandidates ohne Entwuerfe und curateConcepts mit pinFirst", async () => {
    for (const input of inputs.slice(0, 8)) {
      for (const page of [0, 3]) {
        const a = E.curationCandidates(input, { page, seed: 9 });
        expect(plain(a)).toEqual(plain(en.Tm(input, { page, seed: 9 })));
        await E.fontStore.ensure(E.fontsNeeded(a, "logo", input));
        expect(plain(E.curateConcepts(a, input, E.fontStore, 6, { pinFirst: true }))).toEqual(
          plain(en.Rm(a, input, E.fontStore, 6, { pinFirst: true })),
        );
      }
    }
  }, 120000);
  it("curatedPackage, inputSeed, conceptId, routedInput, kindMixOf", () => {
    for (let p = 0; p < 8; p++) expect(E.curatedPackage(p)).toEqual(en.cm(p));
    for (const input of inputs) {
      expect(E.inputSeed(input)).toBe(en.dt(input));
      expect(E.routedInput(input)).toEqual(en.gr(input));
      expect(E.kindMixOf(input)).toEqual(en.Vi(input));
      expect(E.leitMerkmale(input)).toEqual(en.Ks(input));
    }
    each(({ concept }) => expect(E.conceptId(concept)).toBe(en.tc(concept)));
  });
});

describe("Laufweite (tracking.ts)", () => {
  it("Bereiche, Einrasten, Zusatz, Editor-Stufen fuer alle Schnitte", () => {
    expect(E.TRACKING_STEPS).toEqual(en.zi);
    for (const f of ALL_FONTS)
      for (const weight of f.weights)
        for (const kase of ["upper", "title", "lower", "asis"] as const) {
          const ref = { key: f.key, weight };
          expect(E.trackingRanges(ref, kase, false)).toEqual(en.Ct(ref, kase, false));
          expect(E.defaultTracking(ref, kase)).toBe(en.ir(ref, kase));
          for (const v of [-0.05, 0, 0.07, 0.15, 0.3])
            expect(E.snapTracking(ref, kase, v)).toBe(en.ae(ref, kase, v));
          for (const v of [0.05, 0.2, 0.4])
            for (const scale of [undefined, 0.4, 0.6])
              expect(E.suffixTracking(kase, v, ref, scale)).toBe(en.mn(kase, v, ref, scale));
        }
    for (const v of [-1, -0.03, 0, 0.05, 0.12, 0.5, "x", null])
      expect(E.nearestTrackingStep(v)).toBe(en.zc(v));
  });
});

describe("Symbole (src/symbols)", () => {
  it("alle Icons mit allen Rahmen, gefuellt und offen", () => {
    const colors = { main: "#254978", accent: "#C9CFD6", knockout: "#FAFAFA" };
    for (const icon of S.ALL_ICONS)
      for (const c of CONTAINERS)
        for (const filled of [false, true]) {
          const sym = { kind: "icon", id: icon.id, container: c.key } as const;
          expect(S.renderSymbol(sym, colors, E.fontStore, filled)).toBe(
            ix.IL(sym, colors, E.fontStore, filled),
          );
        }
    expect(S.iconsFor(["haus"], ["modern"]).map((i) => i.id)).toEqual(
      ix.OL(["haus"], ["modern"]).map((i: any) => i.id),
    );
  });
  it("Monogramm aus Schrift und gezeichnete Monogramme", async () => {
    const fonts = [
      { key: "bodoni", weight: 500 },
      { key: "manrope", weight: 700 },
      { key: "cormorant", weight: 500 },
      { key: "greatvibes", weight: 400 },
    ];
    await E.fontStore.ensure(fonts);
    const box = { x: 20, y: 20, w: 60, h: 60 };
    for (const f of fonts) {
      const font = E.fontStore.get(f);
      for (const letters of ["AB", "K", "MW", "ÖL", "CO"]) {
        for (const cat of ["sans", "serif", "script"])
          expect(fontMonogramSvg(font, letters, box, "#111", cat)).toBe(
            ix.p4(font, letters, box, "#111", cat),
          );
        expect(availableKonstruktionen(font, letters)).toEqual(ix.RL(font, letters));
        for (const k of KONSTRUKTIONEN)
          expect(plain(drawnMonogram(font, letters, k))).toEqual(plain(ix.bg(font, letters, k)));
      }
    }
    for (const t of ["Anna Berger", "Mag. Dr. Lena Hofer GmbH", "brandl & söhne", "  ", "4you"])
      expect(initialsOf(t)).toBe(ix.ML(t));
  });
});
