/**
 * Erzeugt die verdichteten Datendateien des Namensfinders aus den Referenzdaten:
 *
 *   src/engine/reference/names.json        ->  src/engine/names/wordsDb.data.json
 *   src/engine/reference/corpus.json       \
 *   src/engine/reference/corpus-tech.json  ->  src/engine/names/corpusNames.data.json
 *   src/engine/reference/corpus-tech.json  ->  src/engine/corpusTechMarks.data.json
 *
 * Aufruf:  npx vite-node scripts/names-db.ts           (schreibt die Dateien)
 *          npx vite-node scripts/names-db.ts --check   (vergleicht nur, Exit 1 bei Abweichung)
 *
 * Die Ausgabe ist byte-gleich mit den Dateien, die aus der gesicherten Fassung gezogen wurden
 * (nameFinder `kn`, `mu`, `pu`; engine `ds`).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ref = (name: string): string => join(root, "src", "engine", "reference", name);
const read = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8")) as T;

interface WordEntry {
  wort: string;
  sprache: string;
  bedeutung: string;
  feld: string;
  silben: number;
  buchstaben: number;
  spalte6: number;
  fokus: string[];
  flags: number;
}

interface Brand {
  id: string;
  name: string;
  kern: string;
  person?: boolean;
  schrift?: string;
  schreibung?: string;
  laufweite?: string;
  bildzeichen?: number;
  schriftform?: string;
}

/** Eine Zeile je Tupel, kompakt, wie die gezogenen Dateien. */
const rows = (items: unknown[]): string =>
  `[\n${items.map((r) => `  ${JSON.stringify(r)}`).join(",\n")}\n]\n`;

/** Wortdatenbank: neun Spalten, Fokus als Komma-Liste. */
function wordsDb(): string {
  const { eintraege } = read<{ eintraege: WordEntry[] }>(ref("names.json"));
  return rows(
    eintraege.map((e) => [
      e.wort,
      e.sprache,
      e.bedeutung,
      e.feld,
      e.silben,
      e.buchstaben,
      e.spalte6,
      e.fokus.join(","),
      e.flags,
    ]),
  );
}

/** Name und Kern je Marke, Person nur wenn gesetzt. */
const nameOnly = (b: Brand): Pick<Brand, "id" | "name" | "kern" | "person"> => ({
  id: b.id,
  name: b.name,
  kern: b.kern,
  ...(b.person ? { person: true } : {}),
});

/** Korpus-Namen fuer den Namensfinder. */
function corpusNames(): string {
  const corpus = read<{ marken: Brand[] }>(ref("corpus.json")).marken;
  const tech = read<{ marken: Brand[] }>(ref("corpus-tech.json")).marken;
  return `${JSON.stringify({ corpus: corpus.map(nameOnly), tech: tech.map(nameOnly) }, null, 2)}\n`;
}

/** Logo-Merkmale der Tech-Marken (Logo-Engine). */
function corpusTechMarks(): string {
  const tech = read<{ marken: Brand[] }>(ref("corpus-tech.json")).marken;
  return rows(
    tech
      .filter((b) => b.schrift !== undefined)
      .map((b) => [
        b.id,
        b.name,
        b.kern,
        b.schrift,
        b.schreibung,
        b.laufweite,
        b.bildzeichen,
        b.schriftform,
      ]),
  );
}

const targets: Array<[string, () => string]> = [
  ["src/engine/names/wordsDb.data.json", wordsDb],
  ["src/engine/names/corpusNames.data.json", corpusNames],
  ["src/engine/corpusTechMarks.data.json", corpusTechMarks],
];

const check = process.argv.includes("--check");
let failed = false;
for (const [file, make] of targets) {
  const path = join(root, file);
  const out = make();
  if (check) {
    const same = readFileSync(path, "utf8") === out;
    console.log(`${same ? "gleich " : "ANDERS "} ${file}`);
    failed ||= !same;
  } else {
    writeFileSync(path, out);
    console.log(`geschrieben ${file}`);
  }
}
if (failed) process.exit(1);
