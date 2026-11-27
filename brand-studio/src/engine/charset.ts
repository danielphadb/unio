/**
 * Zeichenumfang der Logo-Schriften (index-Chunk).
 *
 * Pruefumfang: druckbares ASCII, Latin-1 ohne weiches Trennzeichen, Latin
 * Extended-A, rumaenische Kommabuchstaben, typografische Striche, Anfuehrungszeichen,
 * Auslassungspunkte und Euro. Was eine einzelne Schrift davon nicht hat, steht in
 * coverage.json (`missing`).
 */
import { COVERAGE } from "./fonts";

function buildCharset(): Set<string> {
  const codes: number[] = [];
  for (let c = 32; c <= 126; c++) codes.push(c);
  for (let c = 160; c <= 255; c++) if (c !== 173) codes.push(c);
  for (let c = 256; c <= 383; c++) codes.push(c);
  codes.push(
    536,
    537,
    538,
    539,
    8211,
    8212,
    8216,
    8217,
    8218,
    8220,
    8221,
    8222,
    8230,
    8364,
  );
  return new Set(codes.map((c) => String.fromCodePoint(c)));
}

/** Alle Zeichen, die die Logo-Schriften grundsaetzlich abdecken (`kk`). */
export const SUPPORTED_CHARS: ReadonlySet<string> = buildCharset();

/**
 * Zeichen aus `text` (NFC), die nicht darstellbar sind: ausserhalb des
 * Pruefumfangs oder in der Schrift `fontKey` fehlend. Leerraum zaehlt nicht,
 * jedes Zeichen nur einmal (`pi`, Export `l`).
 */
export function missingChars(text: string, fontKey?: string): string[] {
  const out: string[] = [];
  const missing = fontKey ? (COVERAGE[fontKey]?.missing ?? "") : "";
  for (const ch of Array.from(text.normalize("NFC"))) {
    if (/^[ \t\n\r]$/.test(ch) || out.includes(ch)) continue;
    if (!SUPPORTED_CHARS.has(ch) || (missing && missing.includes(ch)))
      out.push(ch);
  }
  return out;
}

/**
 * Die Schrift kann alle Texte in jeder Schreibung (wie eingegeben, gross, klein)
 * darstellen (`oL`, Export `k`).
 */
export function fontCovers(
  fontKey: string,
  ...texts: Array<string | undefined | null>
): boolean {
  for (const t of texts) {
    if (!t) continue;
    const all = `${t}${t.toLocaleUpperCase("de-AT")}${t.toLocaleLowerCase("de-AT")}`;
    if (missingChars(all, fontKey).length) return false;
  }
  return true;
}

/**
 * Der Text braucht die latin-ext-Dateien (ß oder Buchstaben aus Latin Extended,
 * ausser ein paar Zeichen, die schon in latin liegen) (`Sk`).
 */
export function needsExtendedCharset(text: string): boolean {
  for (const ch of text.normalize("NFC")) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === 223) return true;
    if (
      !(c <= 255 || (c >= 8192 && c <= 8303)) &&
      ![
        305, 338, 339, 699, 700, 710, 730, 732, 8364, 8482, 8722, 65279,
      ].includes(c) &&
      ((c >= 256 && c <= 591) ||
        (c >= 7680 && c <= 7935) ||
        (c >= 11360 && c <= 11391) ||
        (c >= 42784 && c <= 43007))
    )
      return true;
  }
  return false;
}
