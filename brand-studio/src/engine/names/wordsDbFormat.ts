/**
 * Verdichtetes Format der Wortdatenbank (nameFinder-Chunk `kn`, Bit-Konstanten `Ea`, `hs`,
 * `os`, `cs`, `gs`, `bs`, `ws`).
 *
 * Jede Zeile ist ein Tupel mit neun Spalten (siehe `reference/names.json`, Feld `spalten`).
 * `scripts/names-db.ts` schreibt die Zeilen aus `reference/names.json`.
 */

/** Wort, Sprache, Bedeutung, Feld, Silben, Buchstaben, Spalte 6, Fokus (Komma-Liste), Flags. */
export type WordsDbRow = [
  wort: string,
  sprache: string,
  bedeutung: string,
  feld: string,
  silben: number,
  buchstaben: number,
  spalte6: number,
  fokus: string,
  flags: number,
];

/** Spaltennamen in `reference/names.json`. */
export const WORDS_DB_COLUMNS = [
  "wort",
  "sprache",
  "bedeutung",
  "feld",
  "silben",
  "buchstaben",
  "spalte6",
  "fokus",
  "flags",
] as const;

/** Bits der Spalte `flags`. */
export const FLAG = {
  /** gesperrt (Tabu als Namensteil, `Ea`) */
  TABU: 1,
  /** vom Namensvorrat ausgeschlossen (`hs`) */
  AUS_A: 2,
  /** vom Namensvorrat ausgeschlossen (`os`) */
  AUS_B: 8,
  /** zusammen mit `KW_B` Bedingung, dass ein `KW`-Wort doch frei ist (`cs`) */
  KW_A: 16,
  /** siehe `KW_A` (`gs`) */
  KW_B: 64,
  /** evokativ, gilt als bildhaft (`bs`) */
  EVO: 128,
  /** nur ueber ein passendes Stichwort (`ws`) */
  KW: 256,
} as const;

/** Stufe eines Worts in der Wortdatenbank. */
export type WordLevel = "gesperrt" | "ausgeschlossen" | "stichwort" | "frei";

/** Regex fuer Tiere und Pflanzen: solche `KW`-Woerter bleiben immer an Stichworte gebunden (`fs`). */
export const BIO_RE =
  /(vogel|tier|insekt|käfer|fisch|säuge|nager|raubtier|blume|blüte|pflanze|kraut|frucht|beere|gemüse|pilz|baum\b|strauch|getreide)/i;

/** Nur ueber Stichwort nutzbar (`kwOnly` im Lexikon). */
export function isKeywordOnly(flags: number, meaning: string): boolean {
  return (
    (flags & FLAG.KW) !== 0 &&
    ((flags & FLAG.KW_B) === 0 || (flags & FLAG.KW_A) === 0 || BIO_RE.test(meaning))
  );
}

/**
 * Stufe einer Zeile: gesperrt (Tabu), ausgeschlossen (nie im Vorrat), stichwort (nur mit
 * passendem Stichwort) oder frei.
 */
export function level(row: WordsDbRow): WordLevel {
  const flags = row[8];
  if (flags & FLAG.TABU) return "gesperrt";
  if (flags & (FLAG.AUS_A | FLAG.AUS_B)) return "ausgeschlossen";
  return isKeywordOnly(flags, row[2]) ? "stichwort" : "frei";
}
