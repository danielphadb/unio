// @vitest-environment jsdom
// Namensfinder im direkten Vergleich mit den Funktionen der gesicherten Fassung
// (nameFinder-Chunk) fuer Eingaben, die die Referenz-Ausgaben nicht abdecken:
// Kreativitaet, Chips, Vorlieben, Ausschluesse, aehnliche Namen, fremde Namen, Firmen,
// Doppelnamen, Titel, Namenspruefung vieler Namen und die kleinen Helfer.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../../helpers/recovered";
import {
  alternativenFuer,
  generateNames,
  keywordFieldsFor,
  pruefeEigenenNamen,
  pruefeFremdnamen,
  similarNames,
  type NameInput,
  type NameOptions,
} from "../../../src/engine/names";
import {
  batchSeed,
  domainKey,
  fromSaved,
  inputNameKind,
  kindLabel,
  naeheHint,
  nameInput,
  toSaved,
  umlautDomain,
  NAME_CHIPS,
} from "../../../src/engine/names/finder";

let old: Record<string, any>;
beforeAll(async () => {
  old = await recovered("nameFinder");
}, 60000);

const plain = (x: unknown): string => JSON.stringify(x);

const INPUTS: Record<string, NameInput> = {
  person: {
    person: "Mag. Maria Theresia von Hohenberg-Lindner",
    region: "Döbling",
    focus: ["luxus", "haeuser"],
    styles: ["elegant"],
    keywords: ["Villa", "Garten"],
  },
  firma: {
    company: "Palais Kramer Immobilien GmbH",
    region: "1010",
    focus: ["anleger", "gewerbe"],
    styles: ["luxus"],
    keywords: ["Zinshaus", "Investment"],
  },
  ort: { region: "Salzkammergut", focus: ["land"], styles: ["natur"], keywords: ["See", "Berg"] },
  frei: { region: "Graz", focus: [], styles: [], keywords: [] },
  leer: { focus: [], styles: [], keywords: [] },
  route: {
    person: "Lukas Gruber",
    region: "Wachau",
    focus: ["wohnen"],
    styles: ["warm", "natur"],
    keywords: ["Wein", "Familie"],
    route: {
      territory: "nachbar",
      nameKinds: ["ort", "bildhaft", "kunstwort"],
      keywordFields: ["familie", "natur"],
      keywords: ["Heimat"],
      seed: 4242,
    },
  },
};

const OPTIONS: Array<[string, Omit<NameOptions, "count" | "page">]> = [
  ["Standard", { seed: 7 }],
  ["direkt", { seed: 11, creativity: "direkt" }],
  ["frei", { seed: 13, creativity: "frei" }],
  ["Arten", { seed: 17, kinds: ["kunstwort", "kurz", "abgewandelt"] }],
  ["Stile", { seed: 19, nameStyles: ["bildhaft", "satz"] }],
  ["Vorlieben", { seed: 23, liked: ["Raumwerk", "Lumora", "Berger"], disliked: ["Wohnwert"] }],
  ["Filter", { seed: 29, exclude: ["haus", "wert"], minLen: 5, maxLen: 9 }],
];

describe("generateNames wie kt", () => {
  for (const [name, input] of Object.entries(INPUTS))
    for (const [label, opts] of OPTIONS)
      it(`${name}, ${label}`, () => {
        for (const page of [0, 1, 3]) {
          const a = generateNames(input, { ...opts, count: 12, page });
          const b = old.kt(input, { ...opts, count: 12, page });
          expect(plain(a)).toBe(plain(b));
        }
      }, 30000);
});

describe("similarNames wie Id", () => {
  for (const [name, input] of Object.entries(INPUTS))
    it(
      name,
      () => {
        const first = generateNames(input, { count: 8, page: 0, seed: 3 });
        for (const anchor of first.slice(0, 3)) {
          const a = similarNames(anchor, input, 6, { page: 1 });
          const b = old.Id(anchor, input, 6, { page: 1 });
          expect(plain(a)).toBe(plain(b));
        }
      },
      30000,
    );
});

const OWN_NAMES = [
  "Anna Berger",
  "Dr. Peter Huber-Mayr",
  "Wiener Wohnwerk",
  "Traumhaus Immobilien",
  "Ihr Partner für Immobilien",
  "Seeblick Realitäten GmbH",
  "Hofer Immobilien",
  "Bank Austria Real",
  "Lumora",
  "ABC",
  "Ötztaler Bergwelt",
  "Engel & Kogler",
  "Remax Wien",
  "Zinshaus Kontor Wien",
  "Café Müller Immobilien",
  "Schönbrunner Adressen",
  "Klarwerck",
  "Flächenwerck",
  "",
  "!!",
];

describe("pruefeEigenenNamen und alternativenFuer wie Zd und _d", () => {
  for (const [name, input] of Object.entries(INPUTS))
    it(
      name,
      () => {
        for (const own of OWN_NAMES) {
          expect(plain(pruefeEigenenNamen(own, input))).toBe(plain(old.Zd(own, input)));
          expect(plain(alternativenFuer(own, input, 8))).toBe(plain(old._d(own, input, 8)));
        }
        expect(plain(pruefeEigenenNamen("Anna Berger"))).toBe(plain(old.Zd("Anna Berger")));
      },
      60000,
    );
});

describe("pruefeFremdnamen wie wd", () => {
  const ki = [
    { name: "Lumora", art: "kreativ", bedeutung: "aus lumen, Licht", sprache: "la" },
    { name: "Hofer Haus", art: "zusammengesetzt" },
    { name: "Traumvilla", art: "bildhaft" },
    { name: "Weitblick", art: "bildhaft", bedeutung: "der Blick in die Ferne." },
    { name: "Casa Nova", art: "fremdsprachig", sprache: "it" },
    { name: "Berger & Söhne", art: "klassisch" },
    { name: "Notarhaus", art: "echt" },
    { name: "Stripe", art: "kreativ" },
    { name: "Lumora", art: "kreativ" },
    { name: "Vinea", art: "markenfaehig" },
    { name: "Areal", art: "kurz" },
    { name: "Gruber Realitäten", art: "personenbezogen" },
    { name: "x".repeat(40) },
    null,
    { name: 5 },
  ];
  for (const [name, input] of Object.entries(INPUTS))
    it(name, () => {
      expect(plain(pruefeFremdnamen(ki, input))).toBe(plain(old.wd(ki, input)));
    });
  it("keine Liste", () => {
    expect(pruefeFremdnamen("nichts", INPUTS.leer!)).toEqual(old.wd("nichts", INPUTS.leer));
  });
});

describe("Helfer wie im Bundle", () => {
  it("keywordFieldsFor wie nn", () => {
    for (const kw of [
      "Investment",
      "zinshausmarkt",
      "See",
      "Weinviertel",
      "Familie",
      "xy",
      "Altbauwohnung",
    ])
      expect(plain(keywordFieldsFor(kw))).toBe(plain(old.nn(kw)));
  });
  it("Formular-Helfer", () => {
    const s = generateNames(INPUTS.person!, { count: 24, page: 0, seed: 5 });
    for (const x of s) {
      expect(kindLabel(x)).toBe(old.$d(x));
      expect(naeheHint(x)).toBe(old.tl(x));
      expect(umlautDomain(x.name)).toBe(old.nl(x.name));
      expect(domainKey(x.domains.at)).toBe(old.al(x.domains.at));
      expect(plain(toSaved(x))).toBe(plain(old.Qd(x)));
      expect(plain(fromSaved(toSaved(x)))).toBe(plain(old.Jd(old.Qd(x))));
      expect(plain(nameInput(x, ["elegant"]))).toBe(plain(old.Gt(x, ["elegant"])));
      expect(inputNameKind(x.kind)).toBe(old.xt(x.kind));
    }
    expect(batchSeed(42, 3)).toBe(old.el(42, 3));
    expect(plain(NAME_CHIPS)).toBe(plain(old.Ht));
  });
});
