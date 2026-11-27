/** Typen der Zeichen-Helfer (lib/draw.ts) fuer Unterlagen und Postings. */
import type { Font } from "opentype.js";

export type Anchor = "start" | "middle" | "end";

/** Text als Pfad an Position (x, y = Grundlinie). */
export interface TextOptions {
  x: number;
  y: number;
  size: number;
  fill: string;
  /** Laufweite in em */
  tracking?: number;
  anchor?: Anchor;
  opacity?: number;
}

/** Absatz mit Umbruch auf `maxWidth`. */
export interface ParagraphOptions extends TextOptions {
  maxWidth: number;
  /** Zeilenabstand, Standard 1,45 x Groesse */
  leading?: number;
}

/** Ergebnis von drawText: SVG-Pfad und Masse. */
export interface DrawnText {
  svg: string;
  width: number;
  ascent: number;
  descent: number;
}

/** Abschnitt eines Textes in einer Schrift (Hauptschrift oder Ersatz). */
export interface FontRun {
  font: Font;
  text: string;
}

export interface SvgDocOptions {
  unit?: "px" | "mm";
  title?: string;
  defs?: string;
  background?: string;
}

export interface ImageSize {
  w: number;
  h: number;
}
