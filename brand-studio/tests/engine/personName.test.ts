// @vitest-environment jsdom
// Vergleich mit der gesicherten Fassung (index-Chunk): Personennamen.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import * as pn from "../../src/engine/personName";
import inputs from "../golden/inputs.json";

let old: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  old = await recovered("index");
});

const NAMES = [
  "",
  "   ",
  "Anna Berger",
  "anna berger",
  "Anna",
  "Mag. Anna Berger",
  "Dr. Ing. Lena Hofer-Kranz",
  "Lena Hofer & Partner",
  "Ludwig van Beethoven",
  "Maria de la Cruz",
  "Hans Peter Maria Huber",
  "Wiener Wohnwerk",
  "Seeblick Realitäten",
  "Hof Berger",
  "Gartenhaus Meier",
  "Seeblickhaus",
  "Kalmar",
  "Brandl & Söhne",
  "Gebrüder Kogler",
  "Anna O'Brien",
  "Anna O’Brien",
  "Anna – Berger",
  "Berger Immobilien",
  "Palais Coburg",
  "Max Mustermann 2",
  "Prof.",
  "ÖZTÜRK Ali",
  "Émile Zola",
  ...inputs.marken.map((m) => m.rawName),
];

describe("Personennamen (bitgenau)", () => {
  it("Listen und Regeln", () => {
    expect(pn.TITLE_RE.source).toBe(old.bS.source);
    expect([...pn.GENERIC_WORDS]).toEqual([...old.ES]);
  });
  it("cleanName, nameTokens, looksLikeCompany, looksLikePerson, isPersonName", () => {
    for (const n of NAMES) {
      expect(pn.cleanName(n)).toBe(old.g0(n));
      expect(pn.nameTokens(n)).toEqual(old.Ic(n));
      expect(pn.looksLikeCompany(n)).toBe(old.v0(n));
      expect(pn.looksLikePerson(n)).toBe(old.y0(n));
      for (const nameKind of [undefined, "person", "company"] as const) {
        const input = nameKind ? { name: n, nameKind } : { name: n };
        expect(pn.isPersonName(input)).toBe(old.TL(input));
      }
    }
    expect(pn.cleanName(undefined)).toBe(old.g0(undefined));
  });
});
