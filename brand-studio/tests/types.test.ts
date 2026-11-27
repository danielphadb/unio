// @vitest-environment jsdom
// Der Vertrag (src/types.ts, src/strategy/types.ts) gegen die gesicherte Fassung:
// Wertelisten wie in den Pruefungen der alten Fassung, Referenzdaten laufen durch
// die alten Pruefungen und tragen nur Felder, die der Vertrag kennt.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "./helpers/recovered";
import {
  COLOR_MOOD_KEYS,
  FONT_FORMS,
  NAME_FOCUS,
  NAME_FORMATS,
  STYLE_KEYS,
  SYMBOL_THEMES,
  type BrandInput,
  type LogoConcept,
} from "../src/types";
import {
  AXIS_KEYS,
  type BrandRoute,
  type Territory,
} from "../src/strategy/types";
import territories from "../src/strategy/territories.json";

let old: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  old = await recovered("index");
});

const golden = join(__dirname, "golden");
const logoFiles = readdirSync(join(golden, "logo")).filter((f) =>
  f.endsWith(".json"),
);
const logos = logoFiles.map((f) =>
  JSON.parse(readFileSync(join(golden, "logo", f), "utf8")),
);

function concepts(): LogoConcept[] {
  const out: LogoConcept[] = [];
  for (const d of logos)
    for (const lauf of Object.values<any>(d.laeufe))
      for (const s of Object.values<any>(lauf.seeds)) {
        out.push(...s.kuratiert);
        for (const p of Object.values<any>(s.generateConcepts)) out.push(...p);
      }
  return out;
}

// Felder je Typ (muss zu den Interfaces passen; neue Felder hier und im Typ eintragen).
const CONCEPT_KEYS: Array<keyof LogoConcept> = [
  "id",
  "seed",
  "style",
  "layout",
  "symbol",
  "name",
  "suffix",
  "tagline",
  "body",
  "palette",
  "colors",
  "divider",
  "symbolFilled",
  "badge",
  "typo",
  "nameFormat",
  "cardBackground",
  "symbolPosition",
  "symbolSize",
  "recipeId",
  "signature",
  "legalNaehe",
];
const INPUT_KEYS: Array<keyof BrandInput> = [
  "name",
  "suffix",
  "tagline",
  "styles",
  "colorMoods",
  "themes",
  "place",
  "nameKind",
  "ort2",
  "jahr",
  "route",
];
const ROUTE_KEYS: Array<keyof BrandRoute> = [
  "id",
  "art",
  "territory",
  "titel",
  "params",
  "texte",
];
const TERRITORY_KEYS: Array<keyof Territory> = [
  "id",
  "titel",
  "hauptachse",
  "betonung",
  "basis",
  "marktabstand",
  "achsen",
  "architektur",
  "segmente",
  "fokus",
  "alternativen",
  "onlyness",
  "referenzen",
  "seite",
  "styles",
  "colorMoods",
  "fontForms",
  "themes",
  "meiden",
  "kindMix",
  "signatureStyles",
  "signatureIds",
  "signatureZweit",
  "nameKinds",
  "keywordFields",
  "formatVorliebe",
  "kernidee",
  "onlynessKern",
  "anders",
  "weil",
  "claims",
  "schluesselwoerter",
  "leitplanken",
  "verbote",
  "passtFuer",
  "risiko",
  "wunschkunde",
  "versprechen",
  "gegenbild",
  "persoenlichkeit",
  "story",
  "ton",
  "social",
];

describe("Wertelisten wie in der alten Pruefung", () => {
  it("Stile, Farbstimmungen, Themen, Schriftformen, Namensformen, Schwerpunkte, Achsen", () => {
    expect(STYLE_KEYS).toEqual(old.Za);
    expect(COLOR_MOOD_KEYS).toEqual(old.Ya);
    expect(SYMBOL_THEMES).toEqual(old.Fu);
    expect(FONT_FORMS).toEqual(old.Oh);
    expect(NAME_FORMATS).toEqual(old.CT);
    expect(NAME_FOCUS).toEqual(old.Cg);
    expect(AXIS_KEYS).toEqual(old.WT);
  });
});

describe("Referenzdaten passen zum Vertrag", () => {
  it("Konzepte: alte Pruefung (PL) laesst sie unveraendert, nur bekannte Felder", () => {
    const all = concepts();
    expect(all.length).toBeGreaterThan(1000);
    for (const c of all) {
      for (const k of Object.keys(c)) expect(CONCEPT_KEYS).toContain(k);
      expect(old.PL(c)).toEqual(c);
    }
  });
  it("Eingaben: alte Pruefung (DL) laesst sie unveraendert, nur bekannte Felder", () => {
    for (const d of logos)
      for (const lauf of Object.values<any>(d.laeufe)) {
        for (const k of Object.keys(lauf.input))
          expect(INPUT_KEYS).toContain(k);
        expect(old.DL(lauf.input)).toEqual(lauf.input);
      }
  });
  it("Routen: alte Pruefung (JT) laesst sie unveraendert", () => {
    const routes = JSON.parse(
      readFileSync(join(golden, "strategy", "routes.json"), "utf8"),
    );
    let n = 0;
    for (const m of Object.values<any>(routes))
      for (const lauf of Object.values<any>(m.laeufe))
        for (const r of lauf as BrandRoute[]) {
          expect(Object.keys(r).sort()).toEqual([...ROUTE_KEYS].sort());
          expect(old.JT(r)).toEqual(r);
          n++;
        }
    expect(n).toBeGreaterThan(20);
  });
  it("Territorien: nur bekannte Felder", () => {
    for (const t of territories)
      for (const k of Object.keys(t)) expect(TERRITORY_KEYS).toContain(k);
  });
});
