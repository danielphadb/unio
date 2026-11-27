/**
 * Personen- und Firmennamen zerlegen, Kurzformen bilden (nameFinder-Chunk: `ze`, `Va`, `Cn`,
 * `gr`, `oi`, `ci`, `rr`, `Oa`, `gi`, `Hn`, `$n`, `Ia`, `Za`, `nd`, `ad`).
 *
 * "Mag. Anna Maria von Berger-Huber" wird zu Vornamen, Nachname mit Partikel, Kern,
 * Teilen des Doppelnamens und Initialen; Titel und Rechtsformen fallen weg.
 */
import { PLACES } from "../orte";
import { missingChars } from "../charset";
import { fold } from "./fold";
import { clicheOf, competitorMatch, offensiveOf, protectedTermOf } from "./rules";
import { isTabu } from "./lexicon";
import { maxConsonantRun } from "./quality";
import { COMPOUND_HEADS } from "./styles";

/** Hoechstlaenge eines Namens samt Zusatz (`xe`). */
export const MAX_NAME_LENGTH = 28;

/** Gefaltete Woerter aller Orte, Ortsadjektive und Teilorte (`ze`). */
export const PLACE_TOKENS: ReadonlySet<string> = new Set(
  PLACES.flatMap((p) => [
    p.name,
    p.adj ?? "",
    ...(p.marks ?? []).flatMap((m) => [m.name, m.adj ?? ""]),
  ])
    .flatMap((n) => fold(n).split(/\s+/))
    .filter((w) => w.length > 2),
);

// ---------------------------------------------------------------------------
// Personennamen

/** Akademische und Berufstitel (`Va`). */
export const TITLE_RE =
  /^(?:dr|mag|dipl|ing|di|prof|ddr|mmag|dkfm|kr|bakk|ba|ma|bsc|msc|mba|llm|phd|med|univ|ök|rer|nat|techn|pharm|vet|arch|bm|ökr|hr)(?:a|in|ina)?$/;
/** Rechtsformen und Branchenwoerter, die nicht zum Namen gehoeren (`Cn`). */
const NOT_NAME: ReadonlySet<string> = new Set([
  "gmbh",
  "og",
  "kg",
  "ag",
  "eu",
  "e.u.",
  "gesbr",
  "co",
  "co.",
  "&",
  "und",
  "immobilien",
  "realitäten",
  "real",
  "estate",
  "makler",
  "maklerin",
]);
/** Namenspartikel (`gr`). */
export const PARTICLES: ReadonlySet<string> = new Set([
  "von",
  "van",
  "de",
  "der",
  "di",
  "da",
  "zu",
  "del",
  "du",
  "la",
  "le",
  "ten",
  "vom",
]);
/** Zusaetze wie jun. und sen. (`oi`). */
const GENERATION_RE = /^(?:jun|sen|jr|sr|junior|senior)\.?$/i;

/** Ganz klein oder ganz gross geschriebene Namen normal schreiben (`ci`). */
const normalCase = (word: string): string =>
  word === word.toLocaleLowerCase("de-AT") || word === word.toLocaleUpperCase("de-AT")
    ? word
        .toLocaleLowerCase("de-AT")
        .split("-")
        .map((p) => p.charAt(0).toLocaleUpperCase("de-AT") + p.slice(1))
        .join("-")
    : word;

/** Zerlegter Personenname. */
export interface PersonName {
  /** erster Vorname */
  first?: string;
  /** alle Vornamen */
  firsts: string[];
  /** Nachname mit Partikel ("von Berger-Huber") */
  last: string;
  /** letzter Namensteil ("Berger-Huber") */
  lastCore: string;
  /** Teile eines Doppelnamens, sonst `[lastCore]` */
  lastParts: string[];
  /** Partikel vor dem Kern ("von") */
  particle?: string;
  /** voller Name ohne Titel */
  full: string;
  /** Initialen aus erstem Vornamen und Kern ("AB") */
  initials: string;
  /** alle Namensteile ohne Partikel, dazu die Teile eines Doppelnamens */
  tokens: string[];
}

const firstLetter = (word: string): string =>
  (word.match(/\p{L}/u)?.[0] ?? "").toLocaleUpperCase("de-AT");

/** Personenname zerlegen (`rr`); ohne brauchbaren Namen `null`. */
export function parsePerson(input: string | undefined | null): PersonName | null {
  const text = (input ?? "")
    .replace(/[‒-―−]/g, "-")
    .replace(/[,;()]/g, " ")
    .trim();
  if (!text) return null;
  const raw = text.split(/\s+/).filter((w) => {
    const low = w.toLocaleLowerCase("de-AT");
    const bare = low.replace(/[.\-()]/g, "");
    return NOT_NAME.has(low) ||
      NOT_NAME.has(bare) ||
      TITLE_RE.test(bare) ||
      /^(?:dipl|mag|dr|ing)\./.test(low) ||
      GENERATION_RE.test(low)
      ? false
      : /\p{L}/u.test(w);
  });
  if (!raw.length) return null;
  const words = raw.map((w) =>
    PARTICLES.has(w.toLocaleLowerCase("de-AT")) ? w.toLocaleLowerCase("de-AT") : normalCase(w),
  );
  if (words.some((w) => !/^[\p{L}'’-]+$/u.test(w) || missingChars(w).length)) return null;
  let start = words.length - 1;
  while (start > 0 && PARTICLES.has(words[start - 1]!)) start--;
  const core = words[words.length - 1]!;
  const last = words.slice(start).join(" ");
  const first = start > 0 ? words[0] : undefined;
  const initials = first ? firstLetter(first) + firstLetter(core) : firstLetter(core);
  const firsts = words.slice(0, start).filter((w) => !PARTICLES.has(w));
  const particle = start < words.length - 1 ? words.slice(start, -1).join(" ") : undefined;
  const parts = core.split("-").filter((p) => p.length >= 2);
  const tokens = [
    ...new Set([...words.filter((w) => !PARTICLES.has(w)), ...(parts.length > 1 ? parts : [])]),
  ];
  return {
    first,
    firsts,
    last,
    lastCore: core,
    lastParts: parts.length > 1 ? parts : [core],
    ...(particle ? { particle } : {}),
    full: words.join(" "),
    initials,
    tokens,
  };
}

// ---------------------------------------------------------------------------
// Firmennamen

/** Vorsilben, nach denen ein Familienname folgt ("Palais Berger") (`Oa`). */
const HOUSE_WORDS: ReadonlySet<string> = new Set([
  "palais",
  "haus",
  "atelier",
  "studio",
  "kontor",
  "galerie",
  "villa",
  "maison",
  "kanzlei",
  "buero",
]);
/** Funktion am Ende ("Seeblick Realitäten") (`gi`). */
const FUNCTION_RE =
  /\s+(Immobilien|Realitäten|Real Estate|Estates|Liegenschaften|Immobilienkanzlei|Immobilienbüro|Realitätenbüro)$/i;
/** Kuerzel aus zwei Buchstaben, die belegt sind (IT, AG, KZ ...) (`Ia`). */
const TAKEN_INITIALS: ReadonlySet<string> = new Set([
  "IP",
  "IT",
  "PR",
  "KI",
  "AI",
  "EU",
  "US",
  "UK",
  "OK",
  "PC",
  "TV",
  "AG",
  "KG",
  "OG",
  "SS",
  "SA",
  "SD",
  "NS",
  "HJ",
  "KZ",
  "WC",
  "VW",
  "BH",
  "PS",
  "HP",
  "DB",
  "VP",
  "FP",
  "SP",
  "KP",
  "GV",
  "ID",
  "DJ",
  "XL",
  "XX",
  "AA",
  "ZZ",
  "UN",
  "AT",
  "DE",
  "CH",
  "MA",
]);

/** Zwei Versalien, frei verwendbar (`Za`). */
export const usableInitials = (text: string): boolean =>
  /^[A-Z]{2}$/.test(text) && !TAKEN_INITIALS.has(text) && !competitorMatch(text);

/** Zerlegter Firmenname. */
export interface CompanyName {
  /** ohne Rechtsform */
  full: string;
  /** ohne Funktion ("Seeblick") */
  core: string;
  /** Funktion am Ende ("Realitäten") */
  fn?: string;
  /** ohne Ortsadjektiv am Anfang ("Wiener Wohnwerk" wird "Wohnwerk") */
  bare?: string;
  /** Familienname nach Hauswort ("Palais Berger" wird "Berger") */
  tail?: string;
  /** Initialen zweier Woerter */
  initials?: string;
  /** laengstes tragendes Wort */
  kern?: string;
}

/** Tragendes Wort eines mehrteiligen Firmennamens (`$n`). */
function companyKern(words: string[], skip: boolean): string | undefined {
  return words.length < 2 || skip
    ? undefined
    : words
        .filter(
          (w) =>
            /^\p{Lu}\p{Ll}{3,}$/u.test(w) &&
            !HOUSE_WORDS.has(fold(w)) &&
            !PLACE_TOKENS.has(fold(w)) &&
            !/^(partner|partnerin|soehne|team|gruppe|service|consulting|immobilien|realitaeten)$/.test(
              fold(w),
            ),
        )
        .sort((a, b) => b.length - a.length)[0];
}

/** Firmenname zerlegen (`Hn`); zu lang oder nicht darstellbar ergibt `null`. */
export function parseCompany(input: string | undefined | null): CompanyName | null {
  let text = (input ?? "")
    .replace(/[‒-―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  text = text.replace(/[\s,]+(GmbH|KG|OG|AG|e\.\s?U\.|GesbR|& Co\.? KG)$/i, "").trim();
  if (!text || text.length > MAX_NAME_LENGTH || missingChars(text).length || !/\p{L}/u.test(text))
    return null;
  const fnMatch = FUNCTION_RE.exec(text);
  const core = fnMatch ? text.slice(0, fnMatch.index).trim() : text;
  if (!core) return null;
  const words = core.split(" ");
  const placeFirst = words.length >= 2 && PLACE_TOKENS.has(fold(words[0]!));
  const tail =
    words.length === 2 && HOUSE_WORDS.has(fold(words[0]!)) && /^\p{Lu}\p{Ll}{2,}$/u.test(words[1]!)
      ? words[1]
      : undefined;
  const initials =
    words.length === 2 ? words.map((w) => w.charAt(0).toLocaleUpperCase("de-AT")).join("") : "";
  const kern = companyKern(words, placeFirst || !!tail);
  return {
    full: text,
    core,
    ...(fnMatch ? { fn: fnMatch[1] } : {}),
    ...(placeFirst ? { bare: words.slice(1).join(" ") } : {}),
    ...(tail ? { tail } : {}),
    ...(/^[A-Z]{2}$/.test(initials) && !TAKEN_INITIALS.has(initials) && !competitorMatch(initials)
      ? { initials }
      : {}),
    ...(kern ? { kern } : {}),
  };
}

// ---------------------------------------------------------------------------
// Kurzformen

/** Silben, die als Kurzform nicht taugen (`nd`). */
const BAD_SHORT: ReadonlySet<string> = new Set([
  "muell",
  "mist",
  "pech",
  "gift",
  "kot",
  "tod",
  "mord",
  "sarg",
  "hass",
  "neid",
  "geiz",
  "frust",
  "krank",
  "kalt",
  "arm",
  "dumm",
  "doof",
  "faul",
  "fett",
  "lahm",
  "stur",
  "wut",
  "zorn",
  "leid",
  "not",
  "qual",
  "pein",
  "furz",
  "kack",
  "sau",
  "schwein",
  "hohn",
  "spott",
  "irr",
  "wirr",
  "bang",
  "schreck",
  "angst",
]);

/**
 * Kurzform aus der ersten Silbe (`ad`): "Trattner" wird "Tratt", "Kogler" wird "Kogl".
 * Vier bis sechs Buchstaben, endet auf einen Mitlaut, kein Klischee, kein belegtes Wort.
 */
export function shortForm(name: string): string | null {
  const text = name.trim();
  if (!/^\p{L}{5,}$/u.test(text)) return null;
  const low = text.toLocaleLowerCase("de-AT");
  const vowel = /[aeiouäöüy]/;
  const syllableEnd = (from: number): number => {
    let i = from;
    while (i < low.length && !vowel.test(low[i]!)) i++;
    while (i < low.length && vowel.test(low[i]!)) i++;
    const start = i;
    while (i < low.length && !vowel.test(low[i]!)) i++;
    const cluster = low.slice(start, i);
    const take = /^(sch|ch|ck)/.test(cluster)
      ? cluster.match(/^(sch|ch|ck)/)![0].length
      : cluster.length >= 2
        ? cluster.length - 1
        : cluster.length;
    return start + take;
  };
  let end = syllableEnd(0);
  if (end < 4) end = syllableEnd(end);
  const short = text.slice(0, end);
  const key = fold(short);
  return short.length < 4 ||
    short.length > 6 ||
    short.length >= text.length - 1 ||
    !vowel.test(short.slice(1)) ||
    vowel.test(low[end - 1] ?? "") ||
    BAD_SHORT.has(key) ||
    offensiveOf(short) ||
    clicheOf(short) ||
    protectedTermOf(short, true) ||
    isTabu(short) ||
    maxConsonantRun(key) > 3 ||
    COMPOUND_HEADS.some((h) => fold(h.w) === key) ||
    /[^aeiouäöü]s$/.test(key)
    ? null
    : short;
}
