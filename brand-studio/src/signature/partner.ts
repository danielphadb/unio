/**
 * Partner-Namen erkennen: "Hofer & Partner", "Brandl & Söhne", "Gebrüder Kogler",
 * "Berger & Huber", "Kogler Partners" (engine-Chunk `vi`, Zeilen 407 bis 533).
 *
 * Grundlage der Partner-Vorlagen (src/signature/templates/partner.json) und der
 * Felder `partnerName`, `partnerEndung`, `partnerVerbinder`, `partnerZweit`,
 * `partnerZeile`, `partnerInitial1`, `partnerInitial2` (siehe nameParts.ts).
 */
import { cleanText } from "./uebergang";

/** Art der Partner-Endung (`passt.partnerArten` einer Vorlage). */
export type PartnerArt =
  | "partner"
  | "soehne"
  | "toechter"
  | "co"
  | "kollegen"
  | "team"
  | "zwei"
  | "gebrueder"
  | "partners";

/** Zerlegter Partner-Name. */
export interface PartnerName {
  art: PartnerArt;
  /** Name vor dem Verbinder (bei Gebrüder: nach "Gebrüder") */
  haupt: string;
  /** "&", "+" oder "und"; leer bei Gebrüder und Partners */
  verbinder: string;
  /** "Partner", "Söhne", zweiter Name, "Gebrüder", "Partners" */
  endung: string;
  /** Firmenzusatz am Ende ("Immobilien", "GmbH") */
  nachsatz: string;
  /** alles rechts vom Verbinder */
  rechts: string;
}

/** Beispiel je Art, für Hinweise wie 'Vorlage braucht einen Namen mit "& Partner"' (`$o`). */
export const PARTNER_LABEL: Record<PartnerArt, string> = {
  partner: "& Partner",
  soehne: "& Söhne",
  toechter: "& Töchter",
  co: "& Co.",
  kollegen: "& Kollegen",
  team: "& Team",
  zwei: "A & B",
  gebrueder: "Gebrüder",
  partners: "Partners",
};

/** Wort vereinfacht: klein, Umlaute ausgeschrieben, Satzzeichen am Ende weg (`Rt`). */
const simple = (w: string): string =>
  w
    .toLocaleLowerCase("de-AT")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[.,]+$/, "");

/** Endungen nach dem Verbinder und ihre Art (`Ko`). */
const ENDUNGEN: Record<string, PartnerArt> = {
  partner: "partner",
  partnerin: "partner",
  partnerinnen: "partner",
  partners: "partner",
  soehne: "soehne",
  sohn: "soehne",
  toechter: "toechter",
  tochter: "toechter",
  co: "co",
  cie: "co",
  kollegen: "kollegen",
  kolleginnen: "kollegen",
  team: "team",
};

/** Vorsätze für Geschwister-Namen (`Go`). */
const GEBRUEDER = new Set(["gebrueder", "gebr", "brueder", "geschwister"]);

/** Firmenzusätze, die am Ende stehen dürfen und nicht zum Namen gehören (`Zo`). */
const NACHSATZ = new Set([
  "immobilien",
  "immobilie",
  "immo",
  "realitaeten",
  "real",
  "estate",
  "makler",
  "immobilientreuhand",
  "immobilienmakler",
  "wohnbau",
  "gmbh",
  "kg",
  "og",
  "ag",
  "eu",
  "e.u",
  "gruppe",
  "group",
]);

/** Beginnt mit Großbuchstaben (`vt`). */
const capital = (w: string): boolean => /^\p{Lu}/u.test(w);
/** Firmenzusatz (`Tt`). */
const isNachsatz = (w: string): boolean => NACHSATZ.has(simple(w));
const VERBINDER = /^(&|\+|und)$/i;

/** Firmenzusätze vom Ende abtrennen, mindestens ein Wort bleibt (`ua`). */
function splitNachsatz(words: string[]): {
  endung: string[];
  nachsatz: string[];
} {
  let n = words.length;
  while (n > 1 && isNachsatz(words[n - 1]!)) n--;
  return { endung: words.slice(0, n), nachsatz: words.slice(n) };
}

/** Partner-Name zerlegen oder `null`, wenn der Name keiner ist (`vi`). */
export function partnerName(name: string): PartnerName | null {
  const text = cleanText(name)
    .replace(/\s*&\s*/g, " & ")
    .replace(/\s*\+\s*/g, " + ")
    .trim();
  if (!text) return null;
  const words = text.split(" ").filter(Boolean);

  // Gebrüder Kogler (Immobilien)
  if (
    words.length >= 2 &&
    GEBRUEDER.has(simple(words[0]!)) &&
    capital(words[1]!)
  ) {
    const { endung, nachsatz } = splitNachsatz(words.slice(1));
    return endung.some((w) => VERBINDER.test(w))
      ? null
      : {
          art: "gebrueder",
          haupt: endung.join(" "),
          verbinder: "",
          endung: words[0]!,
          nachsatz: nachsatz.join(" "),
          rechts: "",
        };
  }

  // A & B, A & Partner, A und Söhne
  const at = words.findIndex(
    (w, i) => i > 0 && i < words.length - 1 && VERBINDER.test(w),
  );
  if (at > 0) {
    if (words.some((w, i) => i !== at && VERBINDER.test(w))) return null;
    const left = words.slice(0, at);
    const right = words.slice(at + 1);
    if (!capital(left[0]!) || !capital(right[0]!) || left.every(isNachsatz))
      return null;
    const verbinder = words[at]!.toLowerCase() === "und" ? "und" : words[at]!;
    const art = ENDUNGEN[simple(right[0]!)];
    if (art)
      return {
        art,
        haupt: left.join(" "),
        verbinder,
        endung: right[0]!,
        nachsatz: right.slice(1).join(" "),
        rechts: right.join(" "),
      };
    const { endung, nachsatz } = splitNachsatz(right);
    return endung.every(isNachsatz)
      ? null
      : {
          art: "zwei",
          haupt: left.join(" "),
          verbinder,
          endung: endung.join(" "),
          nachsatz: nachsatz.join(" "),
          rechts: right.join(" "),
        };
  }

  // Kogler Partners
  const p = words.findIndex((w, i) => i > 0 && simple(w) === "partners");
  if (p > 0) {
    const left = words.slice(0, p);
    return !capital(left[0]!) || left.every(isNachsatz)
      ? null
      : {
          art: "partners",
          haupt: left.join(" "),
          verbinder: "",
          endung: words[p]!,
          nachsatz: words.slice(p + 1).join(" "),
          rechts: "",
        };
  }
  return null;
}
