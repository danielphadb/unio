// @vitest-environment jsdom
// Vergleich mit der gesicherten Fassung (index-Chunk): Schriftkatalog, Abdeckung,
// Schriftspeicher (latin + latin-ext) und Text als Pfad.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import * as fonts from "../../src/engine/fonts";
import * as charset from "../../src/engine/charset";
import * as text from "../../src/engine/text";
import { FontStore, mergeGlyphs } from "../../src/engine/fontStore";
import type { CaseKey, FontRef } from "../../src/types";

let old: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  old = await recovered("index");
});

const fontDir = join(__dirname, "..", "..", "public", "fonts", "brand");
const load = async (file: string): Promise<ArrayBuffer> => {
  const b = readFileSync(join(fontDir, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};

const TEXTS = [
  "",
  " ",
  "Anna Berger",
  "Seeblick Realitäten",
  "Brandl & Söhne",
  "Gebrüder Kogler",
  "GROSSE STRASSE ß",
  "Łódź Ševčík Đorđe",
  "Ştefan Țară",
  "Ĳssel ŉ ſ",
  "„Zitat“ – Strich — Ende…",
  "Café 1180 Wien",
  "日本 😀 ́e",
  "Mag. Dr. Anna-Lena von Berg",
  "a­b\tc\nd",
];

describe("Schriftkatalog (bitgenau)", () => {
  it("Daten und Auswahl", () => {
    expect(fonts.ALL_FONTS).toEqual(old.Mn);
    expect(fonts.COVERAGE).toEqual(old.hk);
    expect(fonts.FONTS).toEqual(old.pk);
    expect(fonts.COMMON_FONTS).toEqual(old.eL);
    expect(fonts.CLICHE_THEMES).toEqual(old.tL);
    expect(fonts.FONT_GROUPS).toEqual(old.iL);
  });
  it("Einzelfunktionen fuer jeden Schnitt", () => {
    for (const f of fonts.ALL_FONTS) {
      expect(fonts.getFont(f.key)).toEqual(old.Yn(f.key));
      expect(fonts.getSelectableFont(f.key)).toEqual(old.QC(f.key));
      expect(fonts.hasSerifItalic(f.key)).toBe(old.nL(f.key));
      expect(fonts.fontGroupOf(f.key)).toBe(old.aL(f.key));
      for (const w of [undefined, 100, 300, 450, 700, 900])
        expect(fonts.italicVariant(f.key, w)).toEqual(old.rL(f.key, w));
      for (const t of [undefined, "", "Straße", "STRASSE"])
        expect(fonts.supportsCapSharpS(f.key, t)).toBe(old.sL(f.key, t));
      for (const w of [100, 200, 300, 400, 500, 600, 700, 800, 900])
        for (const style of [undefined, "italic"] as const) {
          const ref: FontRef = style
            ? { key: f.key, weight: w, style }
            : { key: f.key, weight: w };
          expect(fonts.isSelectableVariant(ref)).toBe(old.JC(ref));
          expect(fonts.fontKey(ref)).toBe(old.vk(ref));
          expect(fonts.fontFileName(ref)).toBe(old.gk(ref));
          expect(fonts.fontExtFileName(ref)).toBe(old.yk(ref));
        }
    }
    expect(() => fonts.getFont("gibtsnicht")).toThrow(
      "Unbekannte Schrift: gibtsnicht",
    );
    expect(fonts.isSelectableVariant({ key: "michroma", weight: 400 })).toBe(
      old.JC({ key: "michroma", weight: 400 }),
    );
  });
});

describe("Zeichenumfang (bitgenau)", () => {
  it("missingChars, fontCovers, needsExtendedCharset", () => {
    expect([...charset.SUPPORTED_CHARS]).toEqual([...old.kk]);
    for (const t of TEXTS) {
      expect(charset.missingChars(t)).toEqual(old.pi(t));
      expect(charset.needsExtendedCharset(t)).toBe(old.Sk(t));
      for (const f of fonts.ALL_FONTS) {
        expect(charset.missingChars(t, f.key)).toEqual(old.pi(t, f.key));
        expect(charset.fontCovers(f.key, t, undefined, "Ŧest")).toBe(
          old.oL(f.key, t, undefined, "Ŧest"),
        );
      }
    }
  });
});

describe("Schriftspeicher und Text als Pfad (bitgenau)", () => {
  const REFS: FontRef[] = [
    { key: "playfair", weight: 700 },
    { key: "cormorant", weight: 500, style: "italic" },
    { key: "dmserif", weight: 400 },
    { key: "jost", weight: 500 },
    { key: "montserrat", weight: 400 },
    { key: "cinzel", weight: 700 },
    { key: "pinyon", weight: 400 },
    { key: "dmmono", weight: 300 },
    { key: "bebas", weight: 400 },
  ].filter((r) => fonts.getFont(r.key).weights.includes(r.weight)) as FontRef[];

  it("applyCase und normalizeText", () => {
    const cases: Array<CaseKey | undefined> = [
      undefined,
      "asis",
      "upper",
      "lower",
      "title",
    ];
    for (const t of TEXTS)
      for (const c of cases) {
        expect(text.applyCase(t, c)).toBe(old.LL(t, c));
        for (const k of ["playfair", "cinzel", "pinyon", "dmserif", "bebas"])
          expect(text.applyCase(t, c, k)).toBe(old.LL(t, c, k));
      }
    for (const t of TEXTS) expect(text.normalizeText(t)).toBe(old.pg(t));
  });

  for (const ext of [false, true]) {
    it(`gleiche Pfade wie die alte Fassung (latin-ext ${ext ? "an" : "aus"})`, async () => {
      const mine = new FontStore(load);
      const theirs = new old.r4(load);
      if (ext) {
        mine.setTexts("Łódź");
        theirs.setTexts("Łódź");
        expect(mine.needsExt).toBe(true);
      }
      await mine.ensure(REFS);
      await theirs.ensure(REFS);
      for (const r of REFS) {
        expect(mine.has(r)).toBe(true);
        expect(theirs.has(r)).toBe(true);
      }
      expect(mine.version).toBe(theirs.version);
      const fb = (s: FontStore | any) => [s.get(REFS[3]), s.get(REFS[2])];
      for (const r of REFS) {
        const a = mine.get(r);
        const b = theirs.get(r);
        expect(a.numGlyphs).toBe(b.numGlyphs);
        for (const t of TEXTS)
          for (const [size, tr] of [
            [100, 0],
            [37.5, 0.12],
            [12, -0.03],
          ] as const) {
            expect(text.textPath(a, t, size, tr)).toEqual(
              old.FL(b, t, size, tr),
            );
            expect(text.textPath(a, t, size, tr, fb(mine))).toEqual(
              old.FL(b, t, size, tr, fb(theirs)),
            );
            expect(text.textAdvance(a, t, size, tr)).toBe(
              old.o4(b, t, size, tr),
            );
            expect(text.textAdvance(a, t, size, tr, fb(mine))).toBe(
              old.o4(b, t, size, tr, fb(theirs)),
            );
          }
        expect(text.capHeight(a, 50)).toBe(old.ai(b, 50));
      }
    });
  }

  it("mergeGlyphs zaehlt wie die alte Fassung und Zwischenspeicher wird geleert", async () => {
    const { parse } = await import("opentype.js");
    const ref: FontRef = { key: "montserrat", weight: 400 };
    const latin = await load(fonts.fontFileName(ref));
    const ext = await load(fonts.fontExtFileName(ref)!);
    const a = parse(latin.slice(0));
    const b = old.ii.parse(latin.slice(0));
    const before = text.textPath(a, "Łódź", 40).d;
    expect(mergeGlyphs(a, parse(ext.slice(0)))).toBe(
      old.s4(b, old.ii.parse(ext.slice(0))),
    );
    expect(a.numGlyphs).toBe(b.numGlyphs);
    // Ohne Leeren bliebe der alte Pfad (Ersatzkaestchen) im Speicher.
    expect(text.textPath(a, "Łódź", 40).d).toBe(before);
    text.forgetTextPaths(a);
    expect(text.textPath(a, "Łódź", 40)).toEqual(old.FL(b, "Łódź", 40));
    expect(text.textPath(a, "Łódź", 40).d).not.toBe(before);
  });

  it("Fehler und Laden ohne Datei", async () => {
    const store = new FontStore(async () => {
      throw new Error("weg");
    });
    expect(() => store.get({ key: "jost", weight: 500 })).toThrow(
      "Schrift nicht geladen: jost@500 (vorher ensure() aufrufen)",
    );
    await expect(store.ensure([{ key: "jost", weight: 500 }])).rejects.toThrow(
      "weg",
    );
    const calls: string[] = [];
    const counting = new FontStore(async (f) => (calls.push(f), load(f)));
    let notified = 0;
    counting.subscribe(() => notified++);
    await Promise.all([
      counting.ensure([{ key: "jost", weight: 500 }], ["Ševčík"]),
      counting.ensure([{ key: "jost", weight: 500 }]),
    ]);
    expect(calls).toEqual([
      "jost-latin-500-normal.woff",
      "jost-latin-ext-500-normal.woff",
    ]);
    await Promise.resolve();
    expect(notified).toBeGreaterThan(0);
    expect(counting.version).toBe(1);
  });
});
