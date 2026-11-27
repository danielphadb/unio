/**
 * Wortdatenbank des Namensfinders (nameFinder-Chunk `kn`): 5342 Woerter mit Sprache,
 * Bedeutung, Wortfeld, Silben, Fokus und Flags. Format in `wordsDbFormat.ts`.
 */
import rows from "./wordsDb.data.json";
import type { WordsDbRow } from "./wordsDbFormat";

export const WORDS_DB: readonly WordsDbRow[] = rows as WordsDbRow[];
