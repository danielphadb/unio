// Energie-Logik (EAVG) gegen die gesicherte Fassung, inkl. Stichtag 1.7.2026.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import * as e from "../../src/deliverables/lib/energy";

let old: Record<string, any>;
beforeAll(async () => {
  old = await recovered("energy");
});

const WERTE = ["", " ", "32", "0,78", "B", "B fossil", "x".repeat(40), "  32   kWh "];
const DATEN = [undefined, "", "2025-03-14", "2026-06-30", "2026-07-01", "2026-07-02", "2030-01-01"];

function* energien() {
  yield undefined;
  for (const hwb of ["", "32"])
    for (const fgee of ["", "0,78"])
      for (const klasse of ["", "B"])
        for (const eeb of [undefined, "", "45"])
          for (const eebKlasse of [undefined, "", "C fossil"])
            for (const ausweisDatum of DATEN) yield { hwb, fgee, klasse, eeb, eebKlasse, ausweisDatum };
  for (const w of WERTE) yield { hwb: w, fgee: w, klasse: w, eeb: w, eebKlasse: w };
}

describe("Energieausweis", () => {
  it("Konstanten", () => {
    expect(e.ENERGY_CUTOFF).toBe(old.u);
    expect(e.ENERGY_HINTS).toEqual(old.d);
    expect(e.ENERGY_PLACEHOLDER).toBe(old.E(undefined));
  });
  it("alle Kombinationen wie alt", () => {
    let n = 0;
    for (const energy of energien()) {
      const obj = energy === undefined ? {} : { energy };
      expect(e.energyMode(energy as never)).toBe(old.g(energy));
      expect(e.energyParts(obj as never)).toEqual(old.a(obj));
      expect(e.energyText(obj as never)).toBe(old.E(obj));
      expect(e.energyState(obj as never)).toBe(old.c(obj));
      expect(e.energyHint(obj as never)).toBe(old.b(obj));
      n++;
    }
    expect(e.energyHint(null)).toBe(old.b(null));
    expect(n).toBeGreaterThan(500);
  });
  it("Stichtag: fGEE nur vor dem 1.7.2026 und ohne EEB", () => {
    const base = { hwb: "32", fgee: "0,78", klasse: "B" };
    expect(e.energyMode({ ...base, ausweisDatum: "2026-06-30" })).toBe("fgee");
    expect(e.energyMode({ ...base, ausweisDatum: "2026-07-01" })).toBe("eeb");
    expect(e.energyMode({ ...base })).toBe("fgee");
    expect(e.energyMode({ ...base, eeb: "45" })).toBe("eeb");
  });
});
