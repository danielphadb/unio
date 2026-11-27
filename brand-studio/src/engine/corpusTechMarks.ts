/**
 * Tech-Korpus der Logo-Merkmale (engine-Chunk `ds`), gleiche Spalten wie `CORPUS_MARKS`.
 * Ergaenzt die Aehnlichkeitssperre um bekannte Software- und Tech-Marken.
 */
import corpusTechMarksData from "./corpusTechMarks.data.json";
import type { CorpusMark } from "./corpusMarks";

export const CORPUS_TECH_MARKS = corpusTechMarksData as CorpusMark[];
