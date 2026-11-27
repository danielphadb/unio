/**
 * Personennamen erkennen und zerlegen (index-Chunk: `TL`, `y0`, `v0`, `Ic`, `g0`).
 *
 * Genutzt von Logo-Engine (Namensformen wie Nachname, Initialen, Bezirk), Galerie und
 * Editor. Ein Name gilt als Person, wenn er aus zwei bis drei grossgeschriebenen
 * Woertern besteht (Adelspraefixe erlaubt) und nichts nach Firma klingt.
 */
import type { BrandInput } from "../types";

/** Akademische Titel am Namensanfang (`bS`, Export `a$`). */
export const TITLE_RE =
  /^(dr|mag|di|ing|prof|dipl|mmag|ddr|dkfm|kr|msc|mba)\.?$/i;

/** Branchenwoerter und Rechtsformen, die nie Teil eines Personennamens sind (`ES`, Export `b2`). */
export const GENERIC_WORDS: ReadonlySet<string> = new Set([
  "immobilien",
  "immobilie",
  "immo",
  "realitäten",
  "realitaeten",
  "realität",
  "real",
  "estate",
  "realestate",
  "wohnen",
  "wohnbau",
  "haus",
  "häuser",
  "home",
  "homes",
  "living",
  "invest",
  "investment",
  "projekt",
  "projekte",
  "partner",
  "partners",
  "raum",
  "räume",
  "werk",
  "wohnwerk",
  "bau",
  "group",
  "gruppe",
  "makler",
  "property",
  "properties",
  "objekt",
  "objekte",
  "gmbh",
  "og",
  "kg",
  "co",
  "büro",
  "agentur",
  "consulting",
  "service",
  "services",
  "team",
  "verwaltung",
  "grund",
  "boden",
]);

/** Weitere Woerter, die nach Firma oder Projekt klingen (`TS`). */
const COMPANY_WORDS: ReadonlySet<string> = new Set([
  "palais",
  "villa",
  "villen",
  "schloss",
  "residenz",
  "residence",
  "residences",
  "quartier",
  "quartiere",
  "atelier",
  "studio",
  "manufaktur",
  "kontor",
  "loft",
  "lofts",
  "domus",
  "casa",
  "capital",
  "holding",
  "estates",
  "realty",
  "development",
  "developments",
  "collection",
  "select",
  "prime",
  "premium",
  "exklusiv",
  "exclusive",
  "concept",
  "konzept",
  "wohnungen",
  "bauträger",
  "baumeister",
  "architektur",
  "edition",
  "maison",
  "domaine",
  "stiftung",
  "genossenschaft",
  "verein",
  "ag",
  "se",
  "llc",
  "ltd",
  "inc",
  "kollektiv",
]);

/** Ortsbildende Woerter am Anfang ("Hof Berger", "Park ...") (`CS`). */
const PLACE_HEADS: ReadonlySet<string> = new Set([
  "hof",
  "gut",
  "garten",
  "gärten",
  "park",
  "blick",
  "see",
  "berg",
  "tal",
  "land",
  "stadt",
  "markt",
  "platz",
  "turm",
  "haus",
  "villa",
]);

/** Endungen zusammengesetzter Firmennamen ("Wohnwerk", "Seeblick") (`LS`). */
const COMPANY_ENDINGS: readonly string[] = [
  "werk",
  "haus",
  "häuser",
  "bau",
  "blick",
  "hof",
  "raum",
  "räume",
  "wohnen",
  "immobilien",
  "realitäten",
  "gruppe",
  "group",
  "invest",
  "quartier",
  "garten",
  "park",
  "land",
  "stadt",
  "palais",
  "living",
  "home",
  "homes",
];

/** Herkunftsadjektive ("Wiener ...") (`FS`). */
const PLACE_ADJECTIVES: ReadonlySet<string> = new Set([
  "wiener",
  "grazer",
  "linzer",
  "salzburger",
  "innsbrucker",
  "klagenfurter",
  "villacher",
  "welser",
  "badener",
  "mödlinger",
  "tiroler",
  "kärntner",
  "steirer",
  "vorarlberger",
  "burgenländer",
  "niederösterreicher",
  "oberösterreicher",
  "döblinger",
  "hietzinger",
  "währinger",
  "josefstädter",
  "leopoldstädter",
  "alsergrunder",
  "favoritner",
  "floridsdorfer",
  "penzinger",
  "ottakringer",
  "meidlinger",
  "simmeringer",
  "liesinger",
  "hernalser",
  "brigittenauer",
  "donaustädter",
  "gmundner",
  "wachauer",
  "münchner",
  "berliner",
  "hamburger",
  "kölner",
  "zürcher",
  "züricher",
  "basler",
  "luzerner",
]);

/** NFC, lange Striche als Bindestrich, Leerraum zusammengefasst (`g0`). */
export function cleanName(text: string | undefined | null): string {
  return (text ?? "")
    .normalize("NFC")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Woerter des Namens ohne vorangestellte Titel (das letzte Wort bleibt immer) (`Ic`). */
export function nameTokens(text: string | undefined | null): string[] {
  return cleanName(text)
    .split(" ")
    .filter((w, i, all) => w && !(TITLE_RE.test(w) && i < all.length - 1));
}

/** Klingt nach Firma: &, +, Ziffern, Branchenwort, Herkunft, Ortswort, Firmenendung (`v0`). */
export function looksLikeCompany(text: string): boolean {
  const words = nameTokens(text);
  if (!words.length) return false;
  if (/&|\+|\d/.test(cleanName(text))) return true;
  const lower = words.map((w) =>
    w.toLocaleLowerCase("de-AT").replace(/[.,]$/, ""),
  );
  if (
    lower.some((w) => GENERIC_WORDS.has(w) || COMPANY_WORDS.has(w)) ||
    PLACE_ADJECTIVES.has(lower[0] as string) ||
    (words.length > 1 && PLACE_HEADS.has(lower[0] as string))
  )
    return true;
  const first = lower[0] as string;
  return COMPANY_ENDINGS.some(
    (e) => first.length >= e.length + 3 && first.endsWith(e),
  );
}

/**
 * Zwei bis drei Woerter, jedes gross mit Kleinbuchstaben (auch mit Bindestrich)
 * oder ein Namenszusatz wie "von", "de", "zu"; und nichts klingt nach Firma (`y0`, Export `bh`).
 */
export function looksLikePerson(text: string): boolean {
  const words = nameTokens(text);
  return words.length < 2 || words.length > 3 || looksLikeCompany(text)
    ? false
    : words.every((w) => {
        const lower = w.toLocaleLowerCase("de-AT");
        return (
          /^(\p{Lu}[\p{Ll}'’]+)(-\p{Lu}[\p{Ll}'’]+)*$/u.test(w) ||
          /^(von|van|de|der|zu|di|da|le|la)$/.test(lower)
        );
      });
}

/**
 * Personenmarke? Ausdruecklich `nameKind` beachten (Firma nie; Person ab zwei
 * Woertern), sonst nach dem Namen urteilen (`TL`, Export `i`).
 */
export function isPersonName(
  input: Pick<BrandInput, "name" | "nameKind">,
): boolean {
  return input.nameKind === "company"
    ? false
    : input.nameKind === "person"
      ? nameTokens(input.name).length >= 2
      : looksLikePerson(input.name);
}
