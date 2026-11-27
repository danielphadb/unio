// Achsen aus dem Brief und Vorschau im Kompass (kompass-Chunk `Pe`, `Ke`, `Qn`).
import { describe, expect, it } from "vitest";
import { AXIS_KEYS, axisDistance, briefPreviewParams, briefSeed, briefToAxes, stableKey } from "../../src/strategy/axes";
import { TERRITORIES } from "../../src/strategy/territories";
import type { BrandBrief } from "../../src/strategy/types";

const b = (x: Omit<BrandBrief, "version">): BrandBrief => ({ version: 1, ...x });

describe("briefToAxes", () => {
  it("ohne Antworten keine Achsen", () => {
    expect(briefToAxes(b({}))).toEqual({});
  });

  it("Logo-Paar setzt die Achse voll, Versalien ziehen die Laufweite mit", () => {
    expect(briefToAxes(b({ logoPairs: { serif: "b" } }))).toEqual({ serif: { v: 1, sicher: 1 } });
    expect(briefToAxes(b({ logoPairs: { serif: "a" } }))).toEqual({ serif: { v: -1, sicher: 1 } });
    expect(briefToAxes(b({ logoPairs: { caps: "b" } }))).toEqual({
      caps: { v: 1, sicher: 1 },
      tracking: { v: 0.8, sicher: 0.8 },
    });
  });

  it("Egal laesst die Achse offen (Sicherheit 0)", () => {
    expect(briefToAxes(b({ logoPairs: { dark: "egal" }, colorPairs: { warmth: "egal" } }))).toEqual({
      warmth: { v: 0, sicher: 0 },
      dark: { v: 0, sicher: 0 },
    });
    // auch wenn andere Quellen etwas sagen
    expect(briefToAxes(b({ logoPairs: { serif: "egal" }, reference: "verlag" })).serif).toEqual({ v: 0.8, sicher: 0 });
  });

  it("Gewichte: Referenzwelt 0,6, Stimme 0,5, Segment 0,3; Widerspruch senkt die Sicherheit", () => {
    const nurWelt = briefToAxes(b({ reference: "tech" }));
    expect(nurWelt.serif).toEqual({ v: -1, sicher: 0.6 });
    const gemischt = briefToAxes(b({ reference: "tech", logoPairs: { serif: "b" } }));
    expect(gemischt.serif!.v).toBe(0.25);
    expect(gemischt.serif!.sicher).toBeLessThan(0.5);
    const stimme = briefToAxes(b({ voice: { formell: 1 } }));
    expect(stimme.serif).toEqual({ v: -0.6, sicher: 0.3 });
    expect(briefToAxes(b({ voice: { formell: 0 } }))).toEqual({});
    expect(briefToAxes(b({ segment: "luxus" })).contrast).toEqual({ v: 0.7, sicher: 0.21 });
  });

  it("alle Werte zwischen -1 und 1, Sicherheit zwischen 0 und 1", () => {
    const axes = briefToAxes(
      b({
        logoPairs: { serif: "b", contrast: "b", caps: "b", width: "a", symbol: "b", dark: "b" },
        colorPairs: { warmth: "b", saturation: "a" },
        reference: "mode",
        voice: { formell: -1, ernst: 1, sachlich: 1, leise: -1 },
        segment: "luxus",
      }),
    );
    expect(Object.keys(axes).sort()).toEqual([...AXIS_KEYS].sort());
    for (const a of Object.values(axes)) {
      expect(Math.abs(a!.v)).toBeLessThanOrEqual(1);
      expect(a!.sicher).toBeGreaterThanOrEqual(0);
      expect(a!.sicher).toBeLessThanOrEqual(1);
    }
  });
});

describe("Seed und Abstand", () => {
  it("Seed haengt nicht an der Reihenfolge der Felder, undefined faellt weg", () => {
    expect(stableKey({ b: 1, a: [2, { d: undefined, c: "x" }] })).toBe('{a:[2,{c:"x"}],b:1}');
    expect(briefSeed(b({ place: "Wien", segment: "mitte" }))).toBe(briefSeed({ segment: "mitte", place: "Wien", version: 1 }));
    expect(briefSeed(b({ place: "Wien" }))).not.toBe(briefSeed(b({ place: "Graz" })));
  });

  it("Abstand zweier Territorien zwischen 0 und 1", () => {
    const [a, c] = [TERRITORIES[0]!, TERRITORIES[5]!];
    expect(axisDistance(a.achsen, a.achsen)).toBe(0);
    expect(axisDistance(a.achsen, c.achsen)).toBeGreaterThan(0);
    expect(axisDistance(a.achsen, c.achsen)).toBeLessThanOrEqual(1);
  });
});

describe("Vorschau im Kompass", () => {
  it("liefert Parameter des besten Territoriums und beachtet Nicht ich", () => {
    const p = briefPreviewParams(b({ reference: "tech", avoidCliches: ["gold-schwarz"], avoidColors: ["blau"] }))!;
    expect(TERRITORIES.some((t) => t.id === p.territory)).toBe(true);
    expect(p.colorMoods).not.toContain("gold");
    expect(p.colorMoods).not.toContain("blau");
  });
});
