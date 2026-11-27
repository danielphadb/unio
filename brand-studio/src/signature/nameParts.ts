/**
 * Namensteile für die Platzhalter der Signature-Vorlagen: `{name}`, `{teil1}`,
 * `{silbe1}`, `{initialen}`, `{zusatzOrt}`, `{koordinaten}`, `{partnerName}` usw.
 * (engine-Chunk `st`, `We`, `ts`, `Mn`, `Do`, Zeilen 535 bis 657).
 */
import type { BrandInput } from "../types";
import { TITLE_RE, isPersonName } from "../engine/personName";
import { cleanText } from "./uebergang";
import { bezirksnummer, koordinaten, postleitzahl } from "./orte";
import { partnerName } from "./partner";

/** Alle Platzhalter einer Marke (leer = nicht vorhanden). */
export interface NameParts {
  /** voller Name (mit Titeln, außer bei `ohneTitel`) */
  name: string;
  /** alles bis auf das letzte Wort (bei einem Wort der ganze Name) */
  teil1: string;
  /** letztes Wort (nur bei zwei und mehr Wörtern) */
  teil2: string;
  /** erstes Zeichen und der Rest */
  erster: string;
  rest: string;
  /** zweites Zeichen und der Rest danach (leer, wenn das zweite ein Leerzeichen ist) */
  zweiter: string;
  rest2: string;
  /** Silbentrennung eines einzelnen Wortes (splitSyllables) */
  silbe1: string;
  silbe2: string;
  zusatz: string;
  ort: string;
  /** "Zusatz · Ort" */
  zusatzOrt: string;
  zusatzOderOrt: string;
  ortOderZusatz: string;
  initial1: string;
  initial2: string;
  initialen: string;
  koordinaten: string;
  plz: string;
  /** Wiener Bezirksnummer */
  nummer: string;
  ort2: string;
  /** Gründungsjahr, nur vierstellig */
  jahr: string;
  /** "A.B." */
  kuerzel: string;
  /** zwei Partner (nur bei "A & B" oder "A und B") */
  partner1: string;
  partner2: string;
  /** einzelne Buchstaben eines einzelnen Wortes */
  b1: string;
  b2: string;
  b3: string;
  b4: string;
  b5: string;
  b6: string;
  b7: string;
  b8: string;
  b9: string;
  /** Kennbuchstabe: bei Personen der Nachname, sonst der erste Buchstabe */
  kennbuchstabe: string;
  partnerName: string;
  partnerEndung: string;
  partnerVerbinder: string;
  /** "& Partner" */
  partnerZweit: string;
  /** "Zusatz (oder Nachsatz) · Ort" */
  partnerZeile: string;
  partnerInitial1: string;
  partnerInitial2: string;
}

export type FieldName = keyof NameParts;

/** Titel vorne abtrennen; das letzte Wort bleibt immer (`st`). */
export function splitTitles(name: string | undefined): {
  titles: string[];
  words: string[];
} {
  const words = cleanText(name).split(" ").filter(Boolean);
  const titles: string[] = [];
  let i = 0;
  while (i < words.length - 1 && TITLE_RE.test(words[i]!))
    titles.push(words[i++]!);
  return { titles, words: words.slice(i) };
}

/** Erster Buchstabe groß, leer ohne Buchstaben (`We`). */
export const initialOf = (w: string | undefined): string => {
  const m = (w ?? "").match(/\p{L}/u);
  return m ? m[0].toLocaleUpperCase("de-AT") : "";
};

const VOKAL = /[aeiouäöüyáàâéèêíìîóòôúùûæœ]/i;
/** Konsonantenfolgen, die am Silbenanfang stehen bleiben (`Co`). */
const ANLAUTE = new Set([
  "bl",
  "br",
  "pl",
  "pr",
  "kl",
  "kr",
  "gl",
  "gr",
  "fl",
  "fr",
  "dr",
  "tr",
  "zw",
  "schl",
  "schm",
  "schn",
  "schr",
  "schw",
  "sp",
  "spr",
  "spl",
]);

/**
 * Ein Wort nach deutschen Regeln in zwei Silben teilen (`ts`): nach dem ersten
 * Vokal (mit Dehnungs-h), "sch", "ch" und "ck" bleiben zusammen, die letzte
 * Konsonantengruppe oder ein Anlaut wie "br", "schw", "spr" geht zur zweiten Silbe.
 * Beide Teile mindestens zwei Zeichen, sonst `[wort, ""]`.
 */
export function splitSyllables(word: string): [string, string] {
  const chars = Array.from(word);
  const low = chars.map((c) => c.toLowerCase());
  let v = low.findIndex((c) => VOKAL.test(c));
  if (v < 0) return [word, ""];
  while (v + 1 < chars.length && VOKAL.test(low[v + 1]!)) v++;
  if (low[v + 1] === "h" && v + 2 < chars.length && !VOKAL.test(low[v + 2]!))
    v++;
  let i = v + 1;
  const groups: number[] = [];
  while (i < chars.length && !VOKAL.test(low[i]!)) {
    const three = low.slice(i, i + 3).join("");
    const two = low.slice(i, i + 2).join("");
    const len = three === "sch" ? 3 : two === "ch" || two === "ck" ? 2 : 1;
    groups.push(len);
    i += len;
  }
  if (i >= chars.length) return [word, ""];
  let cut = i - groups[groups.length - 1]!;
  for (let k = v + 1; k < i - 1; k++)
    if (ANLAUTE.has(low.slice(k, i).join(""))) {
      cut = k;
      break;
    }
  return cut < 2 || chars.length - cut < 2
    ? [word, ""]
    : [chars.slice(0, cut).join(""), chars.slice(cut).join("")];
}

/** Zwei Partner bei "A & B" und "A und B", sonst leer (`Do`). */
export function partnerPair(name: string): [string, string] {
  const p = partnerName(name);
  return p && (p.verbinder === "&" || p.verbinder === "und")
    ? [p.haupt, p.rechts]
    : ["", ""];
}

type NameInput = Pick<
  BrandInput,
  "name" | "suffix" | "place" | "nameKind" | "ort2" | "jahr"
>;

/** Alle Platzhalter einer Marke (`Mn`, Export `ae`); `ohneTitel` lässt Titel weg. */
export function nameParts(input: NameInput, ohneTitel = false): NameParts {
  const { titles, words } = splitTitles(input.name);
  const t = ohneTitel ? [] : titles;
  const zusatz = cleanText(input.suffix);
  const ort = cleanText(input.place);
  const multi = words.length >= 2;
  const chars = Array.from(words.join(" "));
  const [silbe1, silbe2] =
    words.length === 1 ? splitSyllables(words[0]!) : ["", ""];
  const letters =
    words.length === 1
      ? Array.from(words[0]!).filter((c) => /\p{L}/u.test(c))
      : [];
  const letter = (i: number): string => letters[i] ?? "";
  const [partner1, partner2] = partnerPair(input.name);
  const p = partnerName(input.name);
  const jahr = cleanText(input.jahr);
  const first = words[0];
  const last = words[words.length - 1];
  return {
    name: [...t, ...words].join(" "),
    teil1: multi
      ? [...t, ...words.slice(0, -1)].join(" ")
      : [...t, ...words].join(" "),
    teil2: multi ? last! : "",
    erster: chars[0] ?? "",
    rest: chars.slice(1).join(""),
    zweiter: chars[1] && chars[1] !== " " ? chars[1] : "",
    rest2: chars[1] && chars[1] !== " " ? chars.slice(2).join("") : "",
    silbe1,
    silbe2,
    zusatz,
    ort,
    zusatzOrt: [zusatz, ort].filter(Boolean).join(" · "),
    zusatzOderOrt: zusatz || ort,
    ortOderZusatz: ort || zusatz,
    initial1: initialOf(first),
    initial2: multi ? initialOf(last) : "",
    initialen: initialOf(first) + (multi ? initialOf(last) : ""),
    koordinaten: koordinaten(input.place),
    plz: postleitzahl(input.place),
    nummer: bezirksnummer(input.place),
    ort2: cleanText(input.ort2),
    jahr: /^\d{4}$/.test(jahr) ? jahr : "",
    kuerzel: multi ? `${initialOf(first)}.${initialOf(last)}.` : "",
    partner1,
    partner2,
    b1: letter(0),
    b2: letter(1),
    b3: letter(2),
    b4: letter(3),
    b5: letter(4),
    b6: letter(5),
    b7: letter(6),
    b8: letter(7),
    b9: letter(8),
    kennbuchstabe:
      isPersonName(input) && multi ? initialOf(last) : initialOf(first),
    partnerName: p?.haupt ?? "",
    partnerEndung: p?.endung ?? "",
    partnerVerbinder: p?.verbinder ?? "",
    partnerZweit: p ? [p.verbinder, p.endung].filter(Boolean).join(" ") : "",
    partnerZeile: p
      ? [zusatz || p.nachsatz, ort].filter(Boolean).join(" · ")
      : "",
    partnerInitial1: p ? initialOf(p.haupt.split(" ").pop()) : "",
    partnerInitial2: p ? initialOf(p.endung.split(" ").pop()) : "",
  };
}
