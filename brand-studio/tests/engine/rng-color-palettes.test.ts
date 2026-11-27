// Vergleich mit der gesicherten Fassung (svg-Chunk): Zufall, Hash, Farbe, Paletten.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import { hash, rng } from "../../src/engine/rng";
import * as color from "../../src/engine/color";
import * as pal from "../../src/engine/palettes";
import type { BrandInput, ColorMoodKey, StyleKey } from "../../src/types";

let old: Record<string, any>;
beforeAll(async () => {
  old = await recovered("svg");
});

const SEEDS = [
  0,
  1,
  2,
  7,
  42,
  20973,
  20261027,
  987654321,
  2 ** 31,
  2 ** 32 - 1,
  -1,
  -123456,
  3.7,
];
for (let i = 0; i < 200; i++)
  SEEDS.push((Math.imul(i + 1, 2654435761) >>> 0) ^ (i << 7));

const TEXTS = [
  "",
  "a",
  "Anna Berger",
  "Seeblick Realitäten",
  "Brandl & Söhne",
  "ẞ€😀́",
  "x".repeat(300),
];
for (let i = 0; i < 200; i++) TEXTS.push(`${i}|charge|${i * 31}`);

const HEXES: string[] = [];
{
  const r = rng(99);
  for (let i = 0; i < 400; i++)
    HEXES.push(
      "#" +
        Math.floor(r.next() * 0x1000000)
          .toString(16)
          .padStart(6, "0"),
    );
  HEXES.push(
    "#000000",
    "#FFFFFF",
    "#808080",
    "abc",
    "#ABC",
    " #1f3a5f ",
    "#FAF7F2",
  );
}

describe("rng und hash (bitgenau)", () => {
  it("next/int/pick/shuffle/chance wie et()", () => {
    for (const seed of SEEDS) {
      const a = rng(seed);
      const b = old.et(seed);
      const list = Array.from({ length: 17 }, (_, i) => i);
      for (let k = 0; k < 50; k++) {
        expect(a.next()).toBe(b.next());
        expect(a.int(-3, 11)).toBe(b.int(-3, 11));
        expect(a.pick(list)).toBe(b.pick(list));
        expect(a.chance(0.37)).toBe(b.chance(0.37));
        expect(a.shuffle(list)).toEqual(b.shuffle(list));
      }
    }
  });
  it("pick auf leerer Liste wie alt (undefined)", () => {
    expect(rng(1).pick([])).toBe(old.et(1).pick([]));
  });
  it("hash wie nt()", () => {
    for (const t of TEXTS) expect(hash(t)).toBe(old.nt(t));
  });
});

describe("Farbe (bitgenau)", () => {
  it("Umrechnungen, Mischen, Kontrast", () => {
    for (let i = 0; i < HEXES.length; i++) {
      const a = HEXES[i]!;
      const b = HEXES[(i * 7 + 3) % HEXES.length]!;
      expect(color.normalizeHex(a)).toBe(old.I(a));
      expect(color.hexToRgb(a)).toEqual(old.q(a));
      expect(color.hexToHsl(a)).toEqual(old.T(a));
      expect(color.hslToHex(color.hexToHsl(a))).toBe(old.W(old.T(a)));
      expect(
        color.hslToHex({
          h: i * 13 - 400,
          s: (i % 11) / 7 - 0.2,
          l: (i % 13) / 10,
        }),
      ).toBe(
        old.W({ h: i * 13 - 400, s: (i % 11) / 7 - 0.2, l: (i % 13) / 10 }),
      );
      expect(color.mix(a, b, (i % 10) / 9)).toBe(old.Q(a, b, (i % 10) / 9));
      expect(color.luminance(a)).toBe(old.G(a));
      expect(color.contrast(a, b)).toBe(old.Z(a, b));
      expect(color.isDark(a)).toBe(old.st(a));
      for (const ratio of [1.5, 3, 4.5, 7.2, 12])
        expect(color.ensureContrast(a, b, ratio)).toBe(old.L(a, b, ratio));
      expect(color.ensureContrast(a, b, 4.5, "#123456")).toBe(
        old.L(a, b, 4.5, "#123456"),
      );
      expect(color.capSaturation(a)).toBe(old.Y(a));
      expect(color.capSaturation(a, 0.4)).toBe(old.Y(a, 0.4));
      expect(color.clamp01(i / 100 - 1)).toBe(old.H(i / 100 - 1));
    }
  });
  it("safeHex und sanitizePalette", () => {
    const values: unknown[] = [
      undefined,
      null,
      3,
      "",
      "zz",
      "#abc",
      "abcdef",
      " #ABCDEF ",
      "#abcd",
      ...HEXES.slice(0, 20),
    ];
    for (const v of values) {
      expect(color.safeHex(v)).toBe(old.P(v));
      expect(color.safeHex(v, "#123")).toBe(old.P(v, "#123"));
      expect(color.safeHex(v, "kaputt")).toBe(old.P(v, "kaputt"));
    }
    const pals: unknown[] = [
      undefined,
      {},
      { id: 3, name: "x", primary: "#abc" },
      ...pal.PALETTES,
    ];
    for (const p of pals) expect(color.sanitizePalette(p)).toEqual(old.yt(p));
  });
  it("readableAccent wie gt()", () => {
    for (const p of pal.basePalettes())
      for (const bg of [
        p.paper,
        p.ink,
        p.primary,
        "#000000",
        "#FFFFFF",
        "#777777",
      ])
        for (const ratio of [3, 4.5])
          expect(color.readableAccent(p, bg, ratio)).toBe(old.gt(p, bg, ratio));
  });
});

describe("Paletten (bitgenau)", () => {
  const STYLES: StyleKey[] = [
    "elegant",
    "modern",
    "luxus",
    "warm",
    "mutig",
    "natur",
  ];
  it("Daten identisch", () => {
    expect(pal.COLOR_MOODS).toEqual(old.rt);
    expect(pal.COLOR_MOOD_KEYS).toEqual(old.ot);
    expect(pal.STYLE_MOODS).toEqual(old.ct);
    expect(pal.PALETTES).toEqual(old.z);
  });
  it("basePalettes, IDs und Stimmungen", () => {
    const now = pal.basePalettes();
    expect(now).toEqual(old.Et());
    for (const p of now) {
      expect(pal.paletteBaseId(p)).toBe(old.J(p));
      expect(pal.paletteMood(p)).toBe(old.it(p));
      expect(pal.moodOfPaletteId(p.id)).toBe(old.bt(p.id));
    }
    expect(pal.paletteMood({ id: "gibtsnicht-1" })).toBe(
      old.it({ id: "gibtsnicht-1" }),
    );
  });
  it("finalizePalette, jitterColor, varyPalette, paletteForMood", () => {
    for (const seed of SEEDS.slice(0, 60)) {
      for (const style of STYLES) {
        const a = rng(seed);
        const b = old.et(seed);
        const base = pal.PALETTES[Math.abs(Math.floor(seed)) % 24]!;
        expect(pal.jitterColor(base.primary, a, 1.3)).toBe(
          old.j(base.primary, b, 1.3),
        );
        expect(pal.varyPalette(base, style, a)).toEqual(old.U(base, style, b));
        expect(pal.varyPalette(base, style, a, 0)).toEqual(
          old.U(base, style, b, 0),
        );
        expect(pal.varyPalette(base, style, a, 1.5)).toEqual(
          old.U(base, style, b, 1.5),
        );
        for (const mood of pal.COLOR_MOOD_KEYS) {
          expect(pal.paletteForMood(mood, style, a)).toEqual(
            old.kt(mood, style, b),
          );
        }
        expect(pal.pickPaletteForStyle(pal.PALETTES, style, a)).toEqual(
          old.dt(old.z, style, b),
        );
      }
    }
  });
  it("moodsFor und alternativePalettes", () => {
    const inputs: Array<Pick<BrandInput, "colorMoods" | "styles">> = [
      { colorMoods: [], styles: [] },
      { colorMoods: [], styles: ["luxus"] },
      { colorMoods: [], styles: ["warm", "modern"] },
      { colorMoods: ["gold"], styles: ["elegant"] },
      { colorMoods: ["navy", "terra"] as ColorMoodKey[], styles: ["mutig"] },
    ];
    const start = pal.basePalettes();
    let n = 0;
    for (const input of inputs) {
      expect(pal.moodsFor(input)).toEqual(old.ht(input));
      for (const style of [undefined, ...STYLES]) {
        expect(pal.moodsFor(input, style)).toEqual(old.ht(input, style));
        for (const p of start.slice(n % 5, (n % 5) + 6)) {
          for (const count of [0, 4, 9, 30])
            expect(pal.alternativePalettes(p, input, count, style)).toEqual(
              old.At(p, input, count, style),
            );
        }
        n++;
      }
    }
    const custom = {
      id: "custom",
      name: "",
      primary: "#123456",
      secondary: "#EEEEEE",
      accent: "#888888",
      ink: "#111111",
      paper: "#FFFFFF",
    };
    expect(pal.alternativePalettes(custom, inputs[2]!, 12)).toEqual(
      old.At(custom, inputs[2], 12),
    );
  });
});
