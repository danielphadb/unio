/**
 * Typen der Logo-Engine, die nicht im gemeinsamen Vertrag (src/types.ts) stehen:
 * Optionen der Einstiegsfunktionen, Farbvarianten, Geschmacksprofil.
 */
import type { FontRef, LogoConcept } from "../types";
import type { Rng } from "./rng";

/** Farbvariante beim Rendern (`color` auf Papier, `reverse` auf dunkler Flaeche, einfarbig hell/dunkel). */
export type ColorVariant = "color" | "reverse" | "mono-dark" | "mono-light";

/** Welcher Teil des Logos gezeichnet wird. */
export type LogoPart = "full" | "symbol" | "wordmark";

/** Anordnung, die das Layout des Konzepts uebersteuert. */
export type Lockup = "auto" | "horizontal" | "stacked" | "monogram";

/** Optionen fuer `renderLogo` (Teil mit Breite und Hoehe). */
export interface RenderOptions {
  variant?: ColorVariant;
  part?: LogoPart;
  lockup?: Lockup;
  /** Hintergrundfarbe, gegen die Kontraste geprueft werden */
  ground?: string;
  /** Strichstaerken-Verstaerkung fuer kleine Groessen (1 = normal) */
  boost?: number;
}

/** Optionen fuer `renderLogoSvg` (fertiges SVG-Dokument, mit Cache). */
export interface SvgOptions {
  variant?: ColorVariant;
  part?: LogoPart;
  ground?: string;
  /** Tagline unter dem Logo setzen */
  tagline?: boolean;
}

/** Gemerkte und verworfene Konzepte (Herz/Ausblenden in der Galerie). */
export interface Taste {
  liked?: LogoConcept[];
  disliked?: LogoConcept[];
}

/** Optionen fuer `generateConcepts`. */
export interface GenerateOptions {
  count: number;
  page: number;
  seed?: number;
  taste?: Taste;
}

/** Optionen fuer `curationCandidates` (Pool einer Galerie-Seite). */
export interface CandidateOptions {
  page?: number;
  seed?: number;
  signatureEntwuerfe?: boolean;
  signatureVarianten?: boolean;
  pool?: number;
  taste?: Taste;
}

/** Optionen fuer `curateConcepts`. */
export interface CurateOptions {
  /** IDs, die schon auf frueheren Seiten stehen */
  exclude?: string[];
  /** Das erste Konzept des Pools fest an Platz 1 setzen */
  pinFirst?: boolean;
  /** Geschmack aus Herz/Ausblenden: verschiebt die Auswahl */
  taste?: Taste;
}

/** Gezeichneter Teil eines Logos (SVG-Inhalt ohne `<svg>`, Groesse in SVG-Einheiten). */
export interface LogoPartSvg {
  body: string;
  width: number;
  height: number;
}

/** Geschmacksprofil aus gemerkten/verworfenen Konzepten (`tasteProfile`). */
export interface TasteProfile {
  /** Merkmal (z. B. `form:didone`) -> Neigung von -1 bis 1 */
  scores: Map<string, number>;
  /** Anzahl der bewerteten Konzepte */
  n: number;
}

/** Schriften einer Galerie-Seite (`fontPlan`): Namensschriften, Zusatz, Zweitschnitt. */
export interface FontPlan {
  names: FontRef[];
  suffix: FontRef;
  extra: FontRef | null;
}

/** Leit-Merkmale einer Route (`leitMerkmale`): Schriftklasse, Farbfamilie, Logo-Art. */
export interface LeitMerkmale {
  klasse?: string;
  familie?: string;
  art?: string;
}

/** Ergebnis einer Typo-Variante (`typoOptions`): Art plus Teile, die das Konzept uebernimmt. */
export interface TypoChoice {
  kind: string;
  [part: string]: any;
}

/** Moegliche Typo-Variante mit Gewicht. */
export interface TypoOption {
  kind: string;
  weight: number;
  make: (rnd: Rng) => TypoChoice;
}
