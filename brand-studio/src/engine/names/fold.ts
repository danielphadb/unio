/**
 * Text-Helfer der Namensmaschine (nameFinder-Chunk: `g`, `Wu`, `oe`, `Ke`, `La`, `Tr`, `fa`,
 * `Bu`, `Ur`, `Ba`, `Jr`, `ge`).
 *
 * `fold` ist der Vergleichsschluessel fuer fast alle Listen: klein, Umlaute als ae/oe/ue/ss,
 * Akzente weg, "&" als "und", nur a-z, 0-9 und Leerzeichen.
 */

const FOLD_CACHE = new Map<string, string>();
const UMLAUT: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

function foldUncached(text: string): string {
  return text
    .toLocaleLowerCase("de-AT")
    .replace(/[äöüß]/g, (c) => UMLAUT[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9 ]+/g, "")
    .trim();
}

/** Vergleichsschluessel mit Zwischenspeicher (`g`). */
export function fold(text: string): string {
  const hit = FOLD_CACHE.get(text);
  if (hit !== undefined) return hit;
  const out = foldUncached(text);
  if (FOLD_CACHE.size > 50000) FOLD_CACHE.clear();
  FOLD_CACHE.set(text, out);
  return out;
}

/** `fold` ohne Leerzeichen (`oe`, `Ke`). */
export const flat = (text: string): string => fold(text).replace(/\s+/g, "");

/** Nur Buchstaben a-z (`La`, `Tr`). */
export const letters = (text: string): string => fold(text).replace(/[^a-z]/g, "");

/** Anzahl Buchstaben in jeder Schrift (`ge`). */
export const letterCount = (text: string): number => (text.match(/\p{L}/gu) ?? []).length;

/** Levenshtein mit Obergrenze: ueber `max` kommt `max + 1` (`fa`). */
export function levenshteinMax(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j]! + 1,
        row[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (row[j]! < best) best = row[j]!;
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length]!;
}

/** Levenshtein ohne Grenze (`Bu`). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++)
      row[j] = Math.min(
        prev[j]! + 1,
        row[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    prev = row;
  }
  return prev[b.length]!;
}

/** Bitmaske der vorkommenden Buchstaben a-z (`Ur`), fuer schnelle Vorfilter. */
export function letterMask(text: string): number {
  let mask = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) - 97;
    if (c >= 0 && c < 26) mask |= 1 << c;
  }
  return mask;
}

/** Anzahl gesetzter Bits (`Ba`). */
export function bitCount(mask: number): number {
  let n = 0;
  for (; mask; mask &= mask - 1) n++;
  return n;
}

/** Wert aus dem Zwischenspeicher oder neu berechnen; leert ab 50 000 Eintraegen (`Jr`). */
export function memo<K, V>(cache: Map<K, V>, key: K, make: () => V): V {
  let value = cache.get(key);
  if (value === undefined) {
    value = make();
    if (cache.size > 50000) cache.clear();
    cache.set(key, value);
  }
  return value;
}

/** Erster Buchstabe gross (de-AT). */
export const capitalize = (text: string): string =>
  text.charAt(0).toLocaleUpperCase("de-AT") + text.slice(1);
