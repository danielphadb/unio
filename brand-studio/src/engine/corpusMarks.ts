/**
 * Referenzkorpus der Logo-Merkmale (Immobilien und Luxus), aus dem engine-Chunk (`gs`).
 * Je Marke: ID, Name, Kern (Name ohne Zusatz), Schriftart, Schreibung, Laufweite,
 * Bildzeichen (1/0) und Schriftform. Genutzt fuer die Aehnlichkeitssperre (`highend.ts`).
 */
import corpusMarksData from "./corpusMarks.data.json";

/** `[id, name, kern, schrift, schreibung, laufweite, bildzeichen, form]` */
export type CorpusMark = [
  id: string,
  name: string,
  kern: string,
  schrift: string,
  schreibung: string,
  laufweite: string,
  bildzeichen: number,
  form: string,
];

export const CORPUS_MARKS = corpusMarksData as CorpusMark[];
