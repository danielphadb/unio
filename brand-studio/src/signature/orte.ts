/**
 * Orte für die Signature-Vorlagen: Wiener Bezirke, Städte und Orte im Salzkammergut
 * mit Koordinaten, Postleitzahl und Bezirksnummer (engine-Chunk `To`, `Io`, `Oo`,
 * `xi`, `Bo`, `Vo`, `Fo`; Daten in orte.json).
 *
 * Felder `koordinaten`, `plz` und `nummer` in nameParts.ts kommen von hier.
 */
import orteData from "./orte.json";
import { cleanText } from "./uebergang";

export interface Ort {
  name: string;
  alias?: string[];
  lat: number;
  lon: number;
  plz: string;
  /** Wiener Bezirksnummer 1 bis 23 */
  bezirk?: number;
}

/** Wiener Bezirke (`To`). */
export const BEZIRKE = orteData.bezirke as Ort[];
/** Städte (`Io`). */
export const STAEDTE = orteData.staedte as Ort[];
/** Orte im Salzkammergut (`Oo`). */
export const ORTE_LAND = orteData.orte as Ort[];
/** Alle Orte in Suchreihenfolge (`ns`). */
export const ORTE: Ort[] = [...BEZIRKE, ...STAEDTE, ...ORTE_LAND];
/** Bezirksnamen und ihre Nummer, für die Hochzahl der Logo-Engine (`Du`). */
export const BEZIRKSNUMMERN = orteData.bezirksnummern as Array<
  [string, number]
>;

/** Ortsname vereinheitlicht: klein, ß als ss, "Sankt" als "st." (`Dt`). */
export function normOrt(text: string): string {
  return text
    .toLocaleLowerCase("de-AT")
    .replace(/ß/g, "ss")
    .replace(/[-,/]+/g, " ")
    .replace(/\bsankt\b/g, "st.")
    .replace(/\bst\b(?!\.)/g, "st.")
    .replace(/\s+/g, " ")
    .trim();
}

/** Suchtabelle: Name, Alias und "N. Bezirk" (spätere Einträge gewinnen) (`Ht`). */
const INDEX = new Map<string, Ort>();
for (const ort of ORTE) {
  for (const n of [ort.name, ...(ort.alias ?? [])]) INDEX.set(normOrt(n), ort);
  if (ort.bezirk) INDEX.set(normOrt(`${ort.bezirk}. Bezirk`), ort);
}

/** Ort zu einer Eingabe: Name, Name ohne "Wien" oder Postleitzahl (`xi`). */
export function findOrt(text: string | undefined | null): Ort | null {
  if (!text) return null;
  const n = normOrt(text);
  if (!n) return null;
  const hit = INDEX.get(n);
  if (hit) return hit;
  const ohneWien = normOrt(n.replace(/\bwien\b/g, ""));
  if (ohneWien && ohneWien !== n) {
    const h = INDEX.get(ohneWien);
    if (h) return h;
  }
  const plz = n.match(/\b\d{4}\b/);
  return plz ? (ORTE.find((o) => o.plz === plz[0]) ?? null) : null;
}

const grad = (v: number): string => v.toFixed(2);

/** Koordinaten wie "48.21° N 16.37° E", leer wenn unbekannt (`Bo`). */
export function koordinaten(place: string | undefined): string {
  const o = findOrt(place);
  return o
    ? `${grad(Math.abs(o.lat))}° ${o.lat >= 0 ? "N" : "S"} ${grad(Math.abs(o.lon))}° ${o.lon >= 0 ? "E" : "W"}`
    : "";
}

/** Postleitzahl, leer wenn unbekannt (`Vo`). */
export function postleitzahl(place: string | undefined): string {
  return findOrt(place)?.plz ?? "";
}

/** Wiener Bezirksnummer als Text, leer außerhalb Wiens (`Fo`). */
export function bezirksnummer(place: string | undefined): string {
  const n = findOrt(place)?.bezirk;
  return n ? String(n) : "";
}

/**
 * Bezirksnummer aus freiem Text ("1180 Wien", "18. Bezirk", "Wien 18", "Währing")
 * oder `null` (`Hu`; die Logo-Engine nutzt sie für die Hochzahl).
 */
export function bezirkAusText(text: string | undefined): number | null {
  const n = cleanText(text).toLocaleLowerCase("de-AT");
  if (!n) return null;
  const plz = n.match(/\b1(\d{2})0\b/);
  if (plz && +plz[1]! >= 1 && +plz[1]! <= 23) return +plz[1]!;
  const nr =
    n.match(/\b(\d{1,2})\.\s*bezirk\b/) ?? n.match(/\bwien\s*(\d{1,2})\b/);
  if (nr && +nr[1]! >= 1 && +nr[1]! <= 23) return +nr[1]!;
  for (const [name, nummer] of BEZIRKSNUMMERN)
    if (n.includes(name)) return nummer;
  return null;
}
