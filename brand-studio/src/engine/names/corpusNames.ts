/**
 * Namen aus dem Marken-Korpus (nameFinder-Chunk: `mu`, `pu`). Quelle sind
 * `reference/corpus.json` und `reference/corpus-tech.json`; `scripts/names-db.ts` erzeugt
 * daraus `corpusNames.data.json`.
 *
 * Der Namensfinder sperrt Namen, die einer Marke des Korpus gleichen, und meldet Naehe.
 */
import data from "./corpusNames.data.json";

export interface CorpusName {
  id: string;
  /** voller Markenauftritt */
  name: string;
  /** tragender Teil, an dem verglichen wird */
  kern: string;
  /** Personenmarke (Familien- oder Gruendername) */
  person?: boolean;
}

/** 330 Immobilien-, Architektur-, Hotel- und Designmarken (`mu`). */
export const CORPUS_BRANDS: readonly CorpusName[] = data.corpus;

/** 192 Tech-Marken, die nicht im Hauptkorpus stehen (`pu`). */
export const TECH_BRANDS: readonly CorpusName[] = data.tech;
