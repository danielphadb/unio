// @vitest-environment jsdom
// Signature-Vorlagen bitgenau gegen die gesicherte Fassung (engine-Chunk): Daten,
// Bausteine (Orte, Partner, Silben, Namensteile), Varianten, Schriften, Passung,
// Layout und SVG für alle 86 Vorlagen (und ihre Varianten) mit vielen Testmarken.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import { BRANDS, WORDS, loadFont, newStore } from "./helpers";
import * as sig from "../../src/signature";
import { cleanText } from "../../src/engine/cleanText";
import { resolveColors } from "../../src/engine/renderLogo";
import { corpusTwinName } from "../../src/engine/highend";
import { fontMonogramSvg } from "../../src/symbols/monogram";
import { basePalettes } from "../../src/engine/palettes";
import type { FontRef } from "../../src/types";
import type { SignatureTemplate } from "../../src/signature/types";

let old: Record<string, any>;
let oldIx: Record<string, any>;
const mine = newStore();
let theirs: any;

const GROUPS = [
  ["elegant", "Il"],
  ["luxus", "Ol"],
  ["modern", "Bl"],
  ["mutig", "Vl"],
  ["natur", "Zl"],
  ["warm", "Cl"],
  ["kurz", "ws"],
  ["mischung", "Dl"],
  ["kit", "Pl"],
  ["partner", "Wl"],
] as const;

/** Vorlagen und alle Varianten (auch strukturelle). */
const withVariants = (): SignatureTemplate[] =>
  sig.ALL_TEMPLATES.flatMap((t) => [t, ...sig.templateVariants(t, true)]);

/**
 * Prüffälle: jede Vorlage mit allen Testmarken, jede Variante mit jeder dritten
 * Testmarke (versetzt, damit alle Marken vorkommen). Hält die Laufzeit klein.
 */
const cases = (): Array<[SignatureTemplate, (typeof BRANDS)[number]]> => {
  const out: Array<[SignatureTemplate, (typeof BRANDS)[number]]> = [];
  sig.ALL_TEMPLATES.forEach((t, i) => {
    for (const inp of BRANDS) out.push([t, inp]);
    sig
      .templateVariants(t, true)
      .forEach((v, k) =>
        BRANDS.forEach((inp, j) => (j + i + k) % 3 === 0 && out.push([v, inp])),
      );
  });
  return out;
};

beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  oldIx = await recovered("index");
  old = await recovered("engine");
  theirs = new oldIx.r4(loadFont);
  const refs = new Map<string, FontRef>();
  for (const t of withVariants())
    for (const inp of BRANDS)
      for (const r of sig.templateFontRefs(t, inp))
        refs.set(`${r.key}@${r.weight}${r.style ?? ""}`, r);
  for (const t of sig.ALL_TEMPLATES)
    for (const list of [
      t.schriften.haupt,
      t.schriften.neben,
      t.schriften.akzent ?? [],
    ])
      for (const r of list) refs.set(`${r.key}@${r.weight}${r.style ?? ""}`, r);
  await mine.ensure([...refs.values()]);
  await theirs.ensure([...refs.values()]);
}, 120_000);

describe("Daten", () => {
  it("Gruppen wie im Bundle (auch undefinierte Felder)", () => {
    for (const [g, name] of GROUPS)
      expect(sig.TEMPLATE_GROUPS[g], g).toStrictEqual(old[name]);
  });
  it("86 Vorlagen, 72 freigegeben, 14 Entwürfe (12 Partner)", () => {
    expect(sig.ALL_TEMPLATES).toHaveLength(86);
    expect(
      sig.ALL_TEMPLATES.filter((t) => t.freigabe === "freigegeben"),
    ).toHaveLength(72);
    expect(
      sig.ALL_TEMPLATES.filter((t) => t.freigabe === "entwurf"),
    ).toHaveLength(14);
    expect(
      sig.TEMPLATE_GROUPS.partner.filter((t) => t.freigabe === "entwurf"),
    ).toHaveLength(12);
  });
  it("Gesamtliste, Zurückgezogene, Kurznamen, Zusatzfelder", () => {
    expect(sig.ALL_TEMPLATES).toStrictEqual(old.cr);
    expect(sig.ZURUECKGEZOGEN).toStrictEqual(old.jl);
    expect(sig.KIT_TEMPLATES).toStrictEqual(old.ws);
    expect(sig.ZUSATZ_FELDER).toStrictEqual(old.ur);
    expect(sig.PARTNER_LABEL).toStrictEqual(old.$o);
    expect(sig.ORTE).toStrictEqual(old.ns);
    expect(sig.FEINHEIT).toStrictEqual(old.ls);
    expect(
      sig.STRUKTUR.map(({ code, titel, achsen }) => ({ code, titel, achsen })),
    ).toStrictEqual(
      old.ms.map(({ code, titel, achsen }: any) => ({ code, titel, achsen })),
    );
    expect([...sig.STRUKTUR_FREIGEGEBEN]).toStrictEqual([...old.gl]);
  });
  it("Nebenschriften ergänzen je Vorlage", () => {
    for (const [g] of GROUPS)
      for (const t of sig.TEMPLATE_GROUPS[g])
        expect(sig.withZusatzSchriften(t)).toStrictEqual(old.Ul(t));
  });
});

describe("Bausteine", () => {
  const places = [
    "",
    "Wien",
    "1180 Wien",
    "1180",
    "Wien 18",
    "18. Bezirk",
    "Hietzing",
    "Rudolfsheim-Fünfhaus",
    "Sankt Wolfgang",
    "St Gilgen",
    "Bad Ischl",
    "Wien Döbling",
    "Graz",
    "Unbekanntdorf",
    "Innere Stadt",
    "1. Bezirk",
    "4820",
    "Landstrasse",
    "Wien-Landstraße",
  ];
  it("Orte", () => {
    for (const p of places) {
      expect(sig.findOrt(p)).toStrictEqual(old.xi(p));
      expect(sig.koordinaten(p)).toBe(old.Bo(p));
      expect(sig.postleitzahl(p)).toBe(old.Vo(p));
      expect(sig.bezirksnummer(p)).toBe(old.Fo(p));
      expect(sig.bezirkAusText(p)).toBe(old.Hu(p));
    }
  });
  it("Partner-Namen", () => {
    const names = [
      ...BRANDS.map((x) => x.name),
      "Hofer & Partnerin",
      "Hofer und Kollegen",
      "Gebr. Moser",
      "Geschwister Lind & Co",
      "Moser & Moser & Co",
      "Huber & GmbH",
      "huber & partner",
      "Lind Partners Immobilien",
      "Brüder Grimm Immobilien GmbH",
      "Huber+Huber",
      "A & B",
      "",
      "Partners",
    ];
    for (const n of names)
      expect(sig.partnerName(n), n).toStrictEqual(old.vi(n));
  });
  it("Silbentrennung", () => {
    for (const w of [...WORDS, ...BRANDS.flatMap((x) => x.name.split(" "))])
      expect(sig.splitSyllables(w), w).toStrictEqual(old.ts(w));
  });
  it("Namensteile", () => {
    for (const inp of BRANDS)
      for (const ohne of [false, true])
        expect(sig.nameParts(inp, ohne)).toStrictEqual(old.Mn(inp, ohne));
    for (const w of WORDS)
      expect(sig.nameParts({ name: w, suffix: "" })).toStrictEqual(
        old.Mn({ name: w, suffix: "" }),
      );
  });
  it("Logo-Engine: cleanText, corpusTwinName", () => {
    for (const t of ["", "  a  b ", "Ä\u2013B", undefined])
      expect(cleanText(t)).toBe(old.$(t));
    const extra = [
      { name: "Savills", suffix: "" },
      { name: "savills", suffix: "" },
      { name: "Stripe", suffix: "" },
      { name: "Engel & Völkers", suffix: "" },
    ];
    for (const t of sig.ALL_TEMPLATES)
      for (const inp of [...BRANDS, ...extra])
        expect(corpusTwinName(t, inp)).toBe(old.Al(t, inp));
  });
  it("Logo-Engine: resolveColors und Farben der Vorlagen", () => {
    const pals = basePalettes();
    for (const p of pals) {
      expect(sig.hasYellowAndRed(p)).toBe(old.ss(p));
      for (const v of ["color", "reverse", "mono-dark", "mono-light"])
        for (const g of [undefined, "#123456", "#F4F1EA"]) {
          for (const t of sig.ALL_TEMPLATES.slice(0, 86).filter(
            (_, i) => i % 7 === 0,
          ))
            expect(sig.signatureColors(t, p, v, g)).toStrictEqual(
              old.tl(t, p, v, g),
            );
          const c = {
            palette: p,
            colors: { name: "primary", suffix: "accent", symbol: "secondary" },
            typo: {
              markColor: "accent",
              split: { color: "ink" },
              suffixScale: 0.75,
            },
          };
          expect(resolveColors(c as any, v, g)).toStrictEqual(old.Nn(c, v, g));
        }
    }
  });
});

describe("Varianten", () => {
  it("IDs, Varianten je Vorlage, Abruf", () => {
    for (const id of ["sig-gesims", "sig-gesims--f3", "a--b--c", "--x"])
      expect(sig.splitVariantId(id)).toStrictEqual(old.hs(id));
    for (const t of sig.ALL_TEMPLATES)
      for (const s of [false, true])
        expect(sig.templateVariants(t, s)).toStrictEqual(old.bl(t, s));
    const ids = [
      ...sig.ALL_TEMPLATES.map((t) => t.id),
      ...withVariants().map((t) => t.id),
      "sig-unbekannt",
      "sig-gesims--f9",
    ];
    for (const id of ids)
      expect(sig.getSignatureTemplate(id), id).toStrictEqual(old.Ae(id));
  });
});

describe("Schriften und Passung", () => {
  const params = (t: SignatureTemplate) => [
    {},
    { haupt: t.schriften.haupt[t.schriften.haupt.length - 1] },
    { haupt: t.schriften.haupt[1], neben: t.schriften.neben[1] },
    { neben: { key: "dmmono", weight: 300 }, akzent: t.schriften.akzent?.[0] },
    { zusatzMassstab: 1.3, zusatzSchreibung: "title" as const },
    { zusatzMassstab: 0.5, zusatzSchreibung: "lower" as const },
  ];
  it("Schriften, Schreibungen des Zusatzes", () => {
    for (const t of withVariants()) {
      expect(sig.zusatzSchreibungen(t)).toStrictEqual(old.qo(t));
      for (const inp of BRANDS)
        for (const p of params(t)) {
          expect(sig.templateFonts(t, inp, p)).toStrictEqual(old.sr(t, inp, p));
          expect(sig.templateFontRefs(t, inp, p)).toStrictEqual(
            old.rs(t, inp, p),
          );
        }
    }
  });
  it("Passung ohne Schriften (Regeln)", () => {
    for (const t of withVariants())
      for (const inp of BRANDS)
        for (const o of [{}, { stil: false }, { stil: true }]) {
          expect(
            sig.checkFit(t, inp, undefined, o),
            `${t.id} ${inp.name}`,
          ).toStrictEqual(old.hl(t, inp, undefined, o));
          expect(sig.fits(t, inp, undefined, o)).toStrictEqual(
            old.qt(t, inp, undefined, o),
          );
        }
  });
  it("Passung mit Schriften (Einpassung, Varianten ohne neue Überlappung)", () => {
    for (const [t, inp] of cases())
      expect(
        sig.fits(t, inp, mine, { stil: false }),
        `${t.id} ${inp.name}`,
      ).toStrictEqual(old.qt(t, inp, theirs, { stil: false }));
  });
});

describe("Layout und SVG", () => {
  it("layoutSignature für alle Vorlagen und Varianten", () => {
    let n = 0;
    for (const [t, inp] of cases())
      for (const p of [
        {},
        { zusatzMassstab: 1.4, zusatzSchreibung: "lower" as const },
      ]) {
        let a: unknown;
        let b: unknown;
        try {
          a = sig.layoutSignature(t, inp, mine, p);
        } catch (e) {
          a = String(e);
        }
        try {
          b = old.ft(t, inp, theirs, p);
        } catch (e) {
          b = String(e);
        }
        expect(a, `${t.id} ${inp.name}`).toStrictEqual(b);
        n++;
      }
    expect(n).toBeGreaterThan(4000);
  });
  it("renderTemplate je Variante und Ausschnitt", () => {
    const pals = basePalettes();
    let k = 0;
    for (const [t, inp] of cases()) {
      const p = pals[k++ % pals.length]!;
      for (const [v, o] of [
        ["color", {}],
        ["reverse", { ground: "#20242B" }],
        ["mono-dark", { part: "symbol" }],
        ["color", { part: "wordmark", boost: 1.6 }],
        ["mono-light", { lockup: "monogram" }],
      ] as const)
        // Varianten: zwei der fünf Fälle je Marke (wechselnd), Vorlagen: alle
        if (!t.variante || (k + v.length) % 2 === 0)
          expect(
            sig.renderTemplate(t, inp, mine, p, v, o),
            `${t.id} ${inp.name} ${v}`,
          ).toStrictEqual(old.il(t, inp, theirs, p, v, o));
    }
  });
  it("Konzept, Rendern über das Konzept, Schriften, Initialen", () => {
    const pals = basePalettes();
    let k = 0;
    for (const [t, inp] of cases().filter((_, i) => i % 4 === 0)) {
      const p = pals[k++ % pals.length]!;
      for (const [params, style] of [
        [{}, undefined],
        [{ haupt: t.schriften.haupt[1] }, "warm"],
        [{ zusatzMassstab: 1.2 }, t.passt.stile[1]],
      ] as const) {
        const c = sig.signatureConcept(t, inp, p, params as any, style as any);
        expect(c).toStrictEqual(old.ba(t, inp, p, params, style));
        expect(sig.signatureFonts(c, inp)).toStrictEqual(old.Ni(c, inp));
        for (const o of [
          {},
          { variant: "reverse" },
          { part: "symbol" as const },
          { lockup: "monogram" },
        ])
          expect(sig.renderSignature(c, inp, mine, o)).toStrictEqual(
            old.Ql(c, inp, theirs, o),
          );
      }
    }
    for (const inp of BRANDS)
      expect(sig.signatureInitials(inp)).toBe(old.os(inp));
  });
  it("Logo-Engine: Monogramm aus Schrift", () => {
    const refs: FontRef[] = [
      { key: "cormorant", weight: 500 },
      { key: "jost", weight: 500 },
      { key: "dmmono", weight: 300 },
      { key: "ebgaramond", weight: 400, style: "italic" },
    ];
    for (const r of refs)
      for (const txt of ["AB", "Q", "äö", "W M", ""])
        for (const kind of ["sans", "serif", "script", "display"])
          expect(
            fontMonogramSvg(
              mine.get(r),
              txt,
              { x: 0, y: 0, w: 100, h: 100 },
              "#123456",
              kind,
            ),
          ).toBe(
            oldIx.p4(
              theirs.get(r),
              txt,
              { x: 0, y: 0, w: 100, h: 100 },
              "#123456",
              kind,
            ),
          );
  });
});
