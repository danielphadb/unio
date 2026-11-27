/**
 * Text saeubern: NFC, lange Striche als Bindestrich, Leerraum zusammenfassen (engine `$`, Export `M`).
 * Eigene Datei, damit Signature-Vorlagen und Engine sie ohne Import-Kreis nutzen.
 */
import { normalizeText } from "./text";

export function cleanText(e: any) {
  return normalizeText(e ?? "")
    .replace(/\s+/g, " ")
    .trim();
}
