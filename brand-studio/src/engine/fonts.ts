/**
 * Schriftkatalog (index-Chunk, Daten in fonts.json und coverage.json).
 *
 * Reihenfolge und Inhalt des Katalogs sind Teil der Referenz: Konzept-IDs,
 * Kuratierung und Schriftwahl haengen daran. Die Daten kommen unveraendert aus der
 * gesicherten Fassung (W1).
 */
import type {
  FontCat,
  FontCoverage,
  FontMeta,
  FontRef,
  SymbolTheme,
} from "../types";
import catalog from "./fonts.json";
import coverageData from "./coverage.json";

/** Alle 105 Schriften, auch die nur fuer Signature-Vorlagen (`m1`/`Mn`). */
export const ALL_FONTS = catalog as FontMeta[];

/** Zeichenabdeckung je Schrift (`hk`/`go`). */
export const COVERAGE = coverageData as Record<string, FontCoverage>;

/**
 * Frei waehlbare Schriften (Editor, Generator): ohne `nurVorlage`, ohne Schnitte
 * aus `nurVorlageSchnitte` (`pk`, Export `A`).
 */
export const FONTS: FontMeta[] = ALL_FONTS.filter((f) => !f.nurVorlage).map(
  (f) =>
    f.nurVorlageSchnitte?.length
      ? {
          ...f,
          weights: f.weights.filter((w) => !f.nurVorlageSchnitte!.includes(w)),
        }
      : f,
);

const SELECTABLE = new Map(FONTS.map((f) => [f.key, f]));
const BY_KEY = new Map(ALL_FONTS.map((f) => [f.key, f]));

/** Schrift aus dem ganzen Katalog; wirft bei unbekanntem Schluessel (`Yn`, Export `a`). */
export function getFont(key: string): FontMeta {
  const f = BY_KEY.get(key);
  if (!f) throw new Error(`Unbekannte Schrift: ${key}`);
  return f;
}

/** Waehlbare Fassung einer Schrift (ohne Vorlagen-Schnitte), sonst Katalogeintrag (`QC`, Export `bo`). */
export function getSelectableFont(key: string): FontMeta {
  return SELECTABLE.get(key) ?? getFont(key);
}

/** Schnitt frei waehlbar (Gewicht bzw. kursives Gewicht vorhanden) (`JC`, Export `ak`). */
export function isSelectableVariant(ref: FontRef): boolean {
  const f = SELECTABLE.get(ref.key);
  if (!f) return false;
  return ref.style === "italic"
    ? !!f.italics?.includes(ref.weight)
    : f.weights.includes(ref.weight);
}

/** Allerwelts-Schriften: der Generator setzt sie seltener ein (`eL`, Export `bk`). */
export const COMMON_FONTS: readonly string[] = [
  "montserrat",
  "poppins",
  "inter",
  "raleway",
  "nunito",
  "oswald",
  "playfair",
  "worksans",
];

/** Makler-Klischee-Themen (Haus, Dach, Schluessel, Tuer, Stadt) (`tL`, Export `bl`). */
export const CLICHE_THEMES: readonly SymbolTheme[] = [
  "haus",
  "dach",
  "schluessel",
  "tuer",
  "stadt",
];

/** Dateiname der latin-Datei, z. B. `playfair-display-latin-700-normal.woff` (`gk`). */
export function fontFileName(ref: FontRef): string {
  return `${getFont(ref.key).pkg}-latin-${ref.weight}-${ref.style === "italic" ? "italic" : "normal"}.woff`;
}

/** Dateiname der latin-ext-Datei oder `null`, wenn die Schrift keine hat (`yk`). */
export function fontExtFileName(ref: FontRef): string | null {
  return COVERAGE[ref.key]?.ext
    ? `${getFont(ref.key).pkg}-latin-ext-${ref.weight}-${ref.style === "italic" ? "italic" : "normal"}.woff`
    : null;
}

/** Schluessel eines Schnitts, z. B. `playfair@700i` (`vk`, Export `z`). */
export function fontKey(ref: FontRef): string {
  return `${ref.key}@${ref.weight}${ref.style === "italic" ? "i" : ""}`;
}

/** Antiqua mit kursiven Schnitten (`nL`, Export `bs`). */
export function hasSerifItalic(key: string): boolean {
  const f = getFont(key);
  return f.cat === "serif" && !!f.italics?.length;
}

/** Kursiver Schnitt, der `weight` am naechsten liegt (bzw. der erste), sonst `null` (`rL`, Export `bm`). */
export function italicVariant(key: string, weight?: number): FontRef | null {
  const italics = getFont(key).italics;
  if (!italics?.length) return null;
  const w =
    weight === undefined
      ? (italics[0] as number)
      : italics.reduce(
          (best, i) =>
            Math.abs(i - weight) < Math.abs(best - weight) ? i : best,
          italics[0] as number,
        );
  return { key, weight: w, style: "italic" };
}

/** Text ohne ß oder Schrift mit grossem ẞ (fuer Versalsatz) (`sL`, Export `bf`). */
export function supportsCapSharpS(key: string, text?: string): boolean {
  return !(text ?? "").includes("ß") || !!COVERAGE[key]?.capSharpS;
}

/** Gruppe in der Schriftauswahl. */
export type FontGroupKey = "serif" | "grotesk" | "display" | "script";

export interface FontGroup {
  key: FontGroupKey;
  label: string;
  fonts: FontMeta[];
}

const byFamily = (a: FontMeta, b: FontMeta) =>
  a.family.localeCompare(b.family, "de");

/** Gruppen der Schriftauswahl (ganzer Katalog, nach Familienname) (`iL`, Export `F`). */
export const FONT_GROUPS: FontGroup[] = [
  {
    key: "serif",
    label: "Serif",
    fonts: ALL_FONTS.filter((f) => f.cat === "serif").sort(byFamily),
  },
  {
    key: "grotesk",
    label: "Grotesk",
    fonts: ALL_FONTS.filter((f) => f.cat === "sans").sort(byFamily),
  },
  {
    key: "display",
    label: "Display",
    fonts: ALL_FONTS.filter((f) => f.cat === "display").sort(byFamily),
  },
  {
    key: "script",
    label: "Schreibschrift",
    fonts: ALL_FONTS.filter((f) => f.cat === "script").sort(byFamily),
  },
];

/** Gruppe einer Schrift (`aL`, Export `bn`). */
export function fontGroupOf(key: string): FontGroupKey {
  const cat: FontCat = getFont(key).cat;
  return cat === "sans" ? "grotesk" : cat;
}
