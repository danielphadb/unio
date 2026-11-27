// Gemeinsame Helfer der Signature-Tests: Testmarken, Schriften aus public/ und
// Schriftspeicher (neu und alt) mit denselben Dateien.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FontStore } from "../../src/engine/fontStore";
import type { BrandInput, StyleKey } from "../../src/types";

const fontDir = join(__dirname, "..", "..", "public", "fonts", "brand");
export const loadFont = async (file: string): Promise<ArrayBuffer> => {
  const b = readFileSync(join(fontDir, file));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};

export const newStore = (): FontStore => new FontStore(loadFont);

type Brand = Pick<
  BrandInput,
  "name" | "suffix" | "place" | "nameKind" | "ort2" | "jahr" | "styles"
> &
  Partial<BrandInput>;

const b = (
  name: string,
  suffix = "",
  place = "",
  nameKind?: "person" | "company",
  styles: StyleKey[] = [],
  extra: Partial<BrandInput> = {},
): Brand => ({
  name,
  suffix,
  place,
  ...(nameKind ? { nameKind } : {}),
  styles,
  tagline: "",
  colorMoods: [],
  themes: [],
  ...extra,
});

/** Testmarken: Golden-Marken, Partner-Namen, kurze und lange Namen, Orte, Jahr, zweiter Ort. */
export const BRANDS: Brand[] = [
  b("Anna Berger", "Immobilien", "Wien", "person", ["elegant"]),
  b("Philipp Trattner", "Immobilien", "Graz", "person", ["modern"]),
  b("Wiener Wohnwerk", "", "Wien", "company", ["mutig"]),
  b("Seeblick Realitäten", "", "Gmunden", "company", ["natur"]),
  b("Kalmar", "Immobilien", "Salzburg", "company", ["luxus"]),
  b("Lena Hofer & Partner", "Immobilien", "Linz", "company", ["warm"]),
  b("Brandl & Söhne", "Immobilien", "Innsbruck", "company", [
    "elegant",
    "luxus",
  ]),
  b("Gebrüder Kogler", "Immobilien", "Klagenfurt", "company", [
    "warm",
    "modern",
  ]),
  b("Berger und Huber", "Realitäten", "1180 Wien", "company", []),
  b("Huber + Partner Immobilien GmbH", "", "Hietzing", "company", ["modern"]),
  b("Kogler Partners", "", "Bad Ischl", "company", []),
  b("Schwarz & Töchter", "", "Wieden", "company", ["luxus"]),
  b("Max Moser & Co", "Wohnbau", "", "company", ["mutig"]),
  b("Mag. Dr. Lena Hofer", "Immobilien", "Döbling", "person", ["elegant"], {
    jahr: "1998",
  }),
  b("Iris", "", "Josefstadt", "company", []),
  b("Lux", "Immobilien", "", "company", ["luxus"]),
  b("Öberg", "Realitäten", "St. Wolfgang", "company", ["natur"]),
  b(
    "Aurelia Nordheim",
    "Immobilien",
    "Innere Stadt",
    "person",
    ["luxus", "elegant"],
    { ort2: "Salzburg", jahr: "1924" },
  ),
  b("Haus am See", "", "Attersee", "company", ["natur", "warm"]),
  b("Novalis", "Immobilien", "Neubau", "company", ["modern", "mutig"], {
    jahr: "2011",
  }),
  b("Ella Lind", "", "Hallstatt", "person", ["warm"]),
  b("Ölmühle", "Immobilien", "1070", "company", []),
  b("Stadtblick", "Immobilien", "Wien 3", "company", ["mutig"]),
  b("Theo Grünwald", "Immobilien", "Altaussee", undefined, ["elegant"], {
    ort2: "Wien",
  }),
  b("NORDHAUS", "", "Mariahilf", "company", ["modern"]),
];

/** Fremde Namen für die Bausteine (Silben, Partner, Orte). */
export const WORDS = [
  "Berger",
  "Schwarz",
  "Kalmar",
  "Novalis",
  "Lux",
  "Öberg",
  "Iris",
  "Aurelia",
  "Strobl",
  "Fischer",
  "Brückner",
  "Achtung",
  "Hochstetter",
  "Wohnwerk",
  "Seeblick",
  "Spree",
  "Ute",
  "Xy",
  "Ahh",
  "Mueller",
  "Zwanzig",
  "Kirchschlager",
];
