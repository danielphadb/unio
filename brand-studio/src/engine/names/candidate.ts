/**
 * Ein Namensvorschlag entsteht und wird bewertet (nameFinder-Chunk: `qa`, `ui`, `Ir`, `pi`,
 * `de`, `fi`, `ki`, `Se`, `ln`, `qe`, `_a`, `Ua`, `zi`, `Ca`, `ir`, `Oi`, `Ii`, `Zi`, `it`,
 * `Ja`, `Gi`, `Ie`, `Jn`, `xi`, `re`, `tr`, `_`, `Qa`, `Qr`, `Gr`, `er`, `hr`, `xr`, `Ce`,
 * `fr`, `rt`, `ur`, `sr`, `nt`, `je`).
 *
 * `makeCandidate` prueft einen Entwurf gegen alle Sperren (Laenge, Klischee, Marken, Handel
 * und Aemter, Maengelwoerter, App-Muster, Lage), waehlt den Zusatz und berechnet Punkte und
 * Rang. Die Generatoren liefern nur Entwuerfe.
 */
import { rng, hash } from "../rng";
import { missingChars } from "../charset";
import type { NameKind, StyleKey } from "../../types";
import { flat, fold, letterCount, memo } from "./fold";
import {
  clicheOf,
  competitorMatch,
  corpusMatch,
  isRetailBrand,
  offensiveOf,
  protectedTermOf,
  tradeBrandOf,
  type BrandMatch,
} from "./rules";
import { isTabu } from "./lexicon";
import {
  fieldFit,
  isGenericWord,
  isStrongCoinage,
  pronounceable,
  softness,
  syllables,
  wordClassOf,
  wordWeakness,
} from "./quality";
import { appRuleOf, techScore, TECH_RULES } from "./tech";
import { negativePattern } from "./brandable";
import {
  BILDWOERTER,
  BILDWORT,
  COINED,
  COMPOUND_HEADS,
  COMPOUND_TAILS,
  ECHTE_WOERTER,
  FOREIGN,
  isCompound,
  LEXICON_BY_KEY,
  placeFieldOfName,
  REAL_FOREIGN,
  ROOT_ENDS,
  ROOTS,
  SAETZE,
  type NameStyle,
  type StyleTag,
} from "./styles";
import { MAX_NAME_LENGTH, PLACE_TOKENS } from "./person";
import { FEATURE_INDEX, features, highendFromFeatures } from "./rating";
import type { NameProfile } from "./profile";

// ---------------------------------------------------------------------------
// Typen

/** Kurze Pruefung je Name (Namenskarte). */
export interface NameChecks {
  length: number;
  pronounceable: boolean;
  clicheFree: boolean;
  /** Hinweis auf Naehe zu einer Marke */
  conflict?: string;
}

/** Naehe zu einer Marke. */
export interface NameNaehe {
  marke: string;
  art: "gleich" | "teilwort" | "aehnlich";
}

/** Entwurf eines Generators. */
export interface Draft {
  name: string;
  suffix?: string;
  reason: string;
  /** kurze Begruendung ohne Satzende, fuer "passend zu deinem Stichwort" */
  short?: string;
  /** Grundqualitaet 0 bis 1 */
  q: number;
  /** Abstand zu ueblichen Namen 0 bis 1 */
  d: number;
  tags: StyleTag[];
  /** Merkmale wie `pat:nach`, `w:raum`, `r:terra`, `kw:Altbau` */
  parts: string[];
  /** eigener Name (Person oder Firma) */
  own?: boolean;
  /** Kunstwort oder Zusammensetzung */
  coined?: boolean;
  style?: NameStyle;
  /** Anteil der Laeufe, in denen der Entwurf vorkommt */
  rot?: number;
  later?: boolean;
  worn?: boolean;
  hint?: string;
  rankAdj?: number;
}

/** Bewerteter Kandidat. */
export interface Candidate {
  name: string;
  suffix?: string;
  kind: NameKind;
  reason: string;
  score: number;
  /** passt zu einem Stichwort */
  kwRel: boolean;
  /** eher spaeter zeigen */
  late?: true;
  rank: number;
  checks: NameChecks;
  parts: string[];
  /** Schluessel fuer Doppel */
  key: string;
  style: NameStyle;
  highend: number;
  hint?: string;
  naehe?: NameNaehe;
}

// ---------------------------------------------------------------------------
// Konstanten

/** Funktionswoerter im Namen (`qa`). */
export const FUNCTION_IN_NAME =
  /(immobilien|realitäten|real estate|estates|liegenschaften|kanzlei|büro)/i;
/** Zusatz, der nur die Funktion nennt (`ui`). */
const FUNCTION_SUFFIX = /^(Immobilien|Realitäten|Real Estate|Estates|Liegenschaften)$/;
/** Hinweis bei Naehe zu einer Marke (`Ir`). */
export const conflictHint = (label: string): string =>
  `Erinnert an „${label}“. Vor der Verwendung bitte Marken prüfen.`;

/** Alle Stile (`Gr`). */
export const ALL_STYLES: StyleKey[] = ["elegant", "modern", "luxus", "warm", "mutig", "natur"];

/** Zwei Woerter fuer den Klang je Stil (`pi`). */
const TONE_WORDS: Readonly<Record<StyleKey, string[]>> = {
  elegant: ["ruhig und gediegen", "zeitlos und souverän", "leise und stilvoll"],
  luxus: ["edel und zurückhaltend", "diskret und anspruchsvoll", "weltläufig und ruhig"],
  modern: ["klar und zeitgemäß", "reduziert und frisch", "sachlich und modern"],
  warm: ["nahbar und freundlich", "herzlich und offen", "persönlich und warm"],
  natur: ["bodenständig und naturnah", "erdig und ruhig", "ländlich und ehrlich"],
  mutig: ["selbstbewusst und direkt", "markant und wach", "stark und unverwechselbar"],
};

/** Benachbarter Stil (`rt`). */
export const STYLE_NEIGHBOR: Readonly<Record<StyleKey, StyleKey>> = {
  elegant: "luxus",
  luxus: "elegant",
  modern: "mutig",
  mutig: "modern",
  natur: "warm",
  warm: "natur",
};

/** Gemeinsames Element zweier Listen (`de`). */
export const overlaps = (list: readonly string[] | undefined, other: readonly string[]): boolean =>
  !!list && list.some((x) => other.includes(x));

const WATER_WORDS = new Set(["see", "ufer", "bucht", "riva", "rive", "lago", "seelage"]);
const HILL_WORDS = new Set(["berg", "mons"]);

type TaggedWord = StyleTag & { w?: string; root?: string };

/** Baustein passt zum Profil: Wasser- und Bergwoerter nur mit Lage, `x` nur bei Passung (`Se`). */
export function tagAllowed(tag: TaggedWord, p: NameProfile): boolean {
  const key = fold(tag.w ?? tag.root ?? "");
  if ((WATER_WORDS.has(key) && !p.water) || (HILL_WORDS.has(key) && !p.hills)) return false;
  if (!tag.x) return true;
  const word = tag.w ?? tag.root;
  if ((word && p.kwWords.has(fold(word))) || (!p.styles.length && !p.focus.length)) return true;
  return (
    overlaps(tag.s, [...p.styles, ...p.styles.map((s) => STYLE_NEIGHBOR[s])]) ||
    overlaps(tag.f, p.focus)
  );
}

/** Passung eines Bausteins zu Stil und Fokus, 0 bis 1 (`ln`). */
export function tagFit(tag: StyleTag, p: NameProfile): number {
  const style = p.styles.length ? (tag.s ? (overlaps(tag.s, p.styles) ? 1 : 0.25) : 0.6) : 0.75;
  const focus = p.focus.length ? (tag.f ? (overlaps(tag.f, p.focus) ? 1 : 0.35) : 0.6) : 0.75;
  return 0.55 * style + 0.45 * focus;
}

/** Klang fuer die Begruendung, z. B. "ruhig und gediegen" (`qe`). */
export function toneOf(tags: readonly StyleTag[], p: NameProfile, h: number): string {
  const tagStyles = tags.flatMap((t) => t.s ?? []);
  const style =
    p.styles.find((s) => tagStyles.includes(s)) ??
    p.styles[h % Math.max(1, p.styles.length)] ??
    tagStyles[0] ??
    "elegant";
  const words = TONE_WORDS[style];
  return words[(h >>> 3) % words.length]!;
}

/** Laengenwert 0.4 bis 1 (`_a`). */
export function lengthValue(name: string, kind: string): number {
  const n = name.replace(/\s/g, "").length;
  if (kind === "kunstwort" && n < 5) return 0.7;
  if (kind === "initialen") return 0.8;
  return n <= 9 ? 1 : n <= 12 ? 0.9 : n <= 15 ? 0.78 : n <= 20 ? 0.6 : 0.4;
}

/** Silbenwert 0.55 bis 1 (`Ua`). */
export function syllableValue(n: number): number {
  return n >= 2 && n <= 4 ? 1 : n === 1 ? 0.75 : n === 5 ? 0.85 : n === 6 ? 0.7 : 0.55;
}

/** Abgegriffene Namen (`zi`). */
const WORN_NAMES = new Set(
  ["Opus", "Atrium", "Domizil", "Gründerzeit", "Wohnkultur", "Seehof", "Seeblick", "Palais"].map(
    fold,
  ),
);
/** Namen, die in Tests von Maklern durchgefallen sind (`Ca`). */
export const REJECTED_NAMES: ReadonlySet<string> = new Set(
  [
    "Abendlicht",
    "Heimweg",
    "Sonnwende",
    "Helle",
    "Flieder",
    "Eiche",
    "Buche",
    "Nussbaum",
    "Marmor",
    "Lindner",
    "Vestibül",
    "Bauhütte",
    "Lumond",
    "Wohnwerk",
  ].map(fold),
);

/** Alle Woerter der festen Listen (`ir`). */
export const KNOWN_WORDS: ReadonlySet<string> = new Set(
  [...ECHTE_WOERTER, ...BILDWOERTER, ...BILDWORT, ...SAETZE, ...FOREIGN, ...COINED].map((e) =>
    fold(e.w),
  ),
);
/** Woerter der Tech-Wortfelder (`Oi`). */
const TECH_FIELD_WORDS = new Set(TECH_RULES.felder.flatMap((f) => f.woerter).map((w) => fold(w)));
/** Stichwort-Felder je Tech-Wortfeld (`Ii`). */
const TECH_FIELD_TOPICS: Readonly<Record<string, string[]>> = {
  raum: ["zinshaus", "altbau", "luxus", "schloss", "ausstattung"],
  form: ["zinshaus", "altbau", "neubau", "loft", "holzbau", "handwerk"],
  orientierung: ["licht", "kapital", "stadt"],
  haltung: ["vertrauen", "kapital", "bewertung", "vorsorge", "handwerk", "erbe"],
  ankommen: ["familie", "wohnen", "senioren", "ruhe", "neubau"],
  landschaft: ["natur", "ruhe", "berg", "wasser", "ferien"],
  fremd_kurz: ["luxus", "vertrauen", "kunst"],
};
/** Stichwort-Felder je Wort eines Tech-Wortfelds (`Zi`). */
const TECH_WORD_TOPICS = new Map(
  TECH_RULES.felder.flatMap((f) =>
    f.woerter.map(
      (w) =>
        [
          fold(w),
          Object.prototype.hasOwnProperty.call(TECH_FIELD_TOPICS, f.feld)
            ? TECH_FIELD_TOPICS[f.feld]!
            : [],
        ] as const,
    ),
  ),
);

/** Echtes Wort (`it`). */
export const isRealWord = (name: string): boolean => {
  const key = fold(name);
  return REAL_FOREIGN.has(key) || LEXICON_BY_KEY.has(key) || KNOWN_WORDS.has(key);
};

/** Stil je Namensart, wenn der Entwurf keinen nennt (`Ja`). */
export const DEFAULT_STYLE: Readonly<Record<NameKind, NameStyle>> = {
  person: "echt",
  initialen: "markenfaehig",
  klassisch: "echt",
  ort: "bildhaft",
  kunstwort: "markenfaehig",
  kombination: "zusammengesetzt",
  bildhaft: "bildhaft",
  fremdsprachig: "fremdsprachig",
  abgewandelt: "abgewandelt",
  kurz: "echt",
};

/** Streuung und Stil-Bonus je Kreativitaet (`Gi`). */
const CREATIVITY_MIX: Readonly<
  Record<
    "direkt" | "ausgewogen" | "frei",
    { spread: number; style: Partial<Record<NameStyle, number>> }
  >
> = {
  direkt: {
    spread: 0.5,
    style: {
      echt: 6,
      zusammengesetzt: 4,
      satz: 2,
      markenfaehig: -6,
      fremdsprachig: -6,
      abgewandelt: -25,
    },
  },
  ausgewogen: { spread: 1, style: { abgewandelt: -6 } },
  frei: {
    spread: 2,
    style: {
      markenfaehig: 6,
      fremdsprachig: 6,
      abgewandelt: 8,
      bildhaft: 4,
      echt: -4,
      zusammengesetzt: -2,
    },
  },
};

/** Namensarten, die die Charge in Eimern zieht (`Ie`). */
export const BUCKET_KINDS: ReadonlySet<NameKind> = new Set<NameKind>([
  "kombination",
  "kunstwort",
  "bildhaft",
  "fremdsprachig",
  "abgewandelt",
  "kurz",
]);

/** Angezeigte Namensart aus Art und Stil (`Jn`): kurze Woerter werden "kurz". */
export function displayKind(kind: NameKind, style: NameStyle, name: string): NameKind {
  if (!BUCKET_KINDS.has(kind)) return kind;
  if (style === "abgewandelt") return "abgewandelt";
  if (style === "markenfaehig") return "kunstwort";
  if (style !== "satz" && !/[\s&]/.test(name) && letterCount(name) <= 5 && syllables(name) <= 2)
    return "kurz";
  if (style === "bildhaft") return "bildhaft";
  if (style === "fremdsprachig") return "fremdsprachig";
  return "kombination";
}

// ---------------------------------------------------------------------------
// Zufall im Profil

/** Schluessel des Profils fuer Zufall und Eimer (`hr`). */
export function profileKey(p: NameProfile): string {
  const place = p.place;
  const placeName = place ? (place.known ? place.place.name : place.name) : "";
  return fold(
    [
      placeName,
      p.company?.core ?? "",
      p.person?.full ?? "",
      p.styles.join(","),
      p.focus.join(","),
      p.kw.join(","),
      p.creativity,
    ].join("|"),
  );
}

/** Anzahl Eimer ohne Angabe (`er`). */
export const DEFAULT_BUCKETS = 10;

/** Name liegt im aktuellen Eimer (`xr`). */
export function inSlot(p: NameProfile, name: string): boolean {
  return p.relaxed || p.noBucket || p.allSlots || p.anchor.size
    ? true
    : Math.floor(
        rng(hash(`${fold(name)}|${profileKey(p)}`) ^ p.seed).next() *
          (p.buckets ?? DEFAULT_BUCKETS),
      ) === (p.slot ?? 0);
}

/** Zufall mit Wahrscheinlichkeit `chance`, fest je Profil und Schluessel (`Ce`). */
export function chance(p: NameProfile, key: string, probability: number): boolean {
  return rng(hash(`${key}|${profileKey(p)}`) ^ p.seed).next() < probability;
}

/** Wie `chance`, bei "frei" 30 Prozent hoeher, `relaxed` immer (`tr`). */
export function lucky(p: NameProfile, key: string, probability: number): boolean {
  return (
    !!p.relaxed ||
    rng(hash(key) ^ p.seed ^ 27421).next() <
      Math.min(1, probability * (p.creativity === "frei" ? 1.3 : 1))
  );
}

/** Name enthaelt ein Stichwort oder ein passendes Wort (`fr`). */
export function hitsKeyword(p: NameProfile, name: string): boolean {
  const key = fold(name).replace(/\s+/g, "");
  return (
    p.kw.some((k) => key.includes(k)) ||
    [...p.kwClaim].some((k) => k.length >= 4 && key.includes(k))
  );
}

/** Stile passen (die ersten zwei des Worts oder ein Nachbarstil) (`ur`). */
export function stylesFit(styles: readonly StyleKey[] | undefined, p: NameProfile): boolean {
  return (
    !!p.relaxed ||
    !p.styles.length ||
    (!!styles?.length &&
      (styles
        .slice(0, 2)
        .some((s) => p.styles.includes(s) || p.styles.some((x) => STYLE_NEIGHBOR[x] === s)) ||
        (!!p.wide && !!styles?.some((s) => p.styles.includes(s)))))
  );
}

/** Gut- und Seelage-Woerter passen (Land, Villen, ohne Ort mit passendem Fokus) (`sr`). */
export function estateFits(p: NameProfile): boolean {
  const place = p.place;
  if (place?.known && (place.place.rural || place.place.villa)) return true;
  if (place?.known) return false;
  return overlaps(["land", "haeuser", "luxus"], p.focus) || p.styles.includes("natur");
}

/** Wort passt zur Lage (`nt`). */
export function fitsPlace(p: NameProfile, name: string): boolean {
  return (
    !!p.cls &&
    p.styles.length > 0 &&
    fieldFit(p.cls, placeFieldOfName(name), p.water, p.hills, p.wine) > 0
  );
}

/** Merkmale eines Namens aus den festen Bausteinen (`je`). */
export function partsOf(name: string): string[] {
  const key = fold(name).replace(/\s+/g, "");
  const out = new Set<string>();
  for (const h of COMPOUND_HEADS) if (key.startsWith(fold(h.w))) out.add(`w:${fold(h.w)}`);
  for (const t of COMPOUND_TAILS) if (key.endsWith(t.w)) out.add(`w:${t.w}`);
  for (const r of ROOTS) if (key.startsWith(r.stem)) out.add(`r:${r.root}`);
  for (const e of ROOT_ENDS) if (key.endsWith(e.e) && !/\s/.test(name)) out.add(`e:${e.e}`);
  return [...out];
}

// ---------------------------------------------------------------------------
// Zusatz

/** Ortsname des Profils (`Qr`). */
export function placeName(p: NameProfile): string | undefined {
  const place = p.place;
  if (place) return place.known ? place.place.name : place.name;
  return undefined;
}

/** "Realitäten" passt (`Qa`). */
export const realitaetenFits = (p: NameProfile): boolean =>
  !p.styles.length ||
  p.styles.some((s) => s === "elegant" || s === "warm" || s === "natur") ||
  p.kw.includes("altbau");

/**
 * Zusatz unter dem Namen (`_`): mit `allowPlace` manchmal der Ort, sonst Immobilien,
 * Realitaeten (`allowReal`) oder bei Luxus Real Estate.
 */
export function suffixFor(
  p: NameProfile,
  name: string,
  allowReal = true,
  allowPlace = false,
): string {
  const h = hash(name);
  const place = placeName(p);
  if (allowPlace && place && h % 3 === 0 && name.length + 1 + place.length <= MAX_NAME_LENGTH)
    return place;
  const options = ["Immobilien", "Immobilien"];
  if (allowReal && realitaetenFits(p)) options.push("Realitäten");
  if (p.styles.includes("luxus")) options.push("Real Estate");
  return options[(h >>> 2) % options.length]!;
}

// ---------------------------------------------------------------------------
// Kandidat

const BLOCK_CACHE = new Map<string, boolean>();

/**
 * Entwurf pruefen und bewerten (`re`); `null`, wenn eine Sperre greift. Eigene Namen
 * (`own`) durchlaufen nur die Sperren, die auch einen Personennamen treffen duerfen.
 */
export function makeCandidate(kind: NameKind, draft: Draft, p: NameProfile): Candidate | null {
  const name = draft.name.replace(/\s+/g, " ").trim();
  let suffix = draft.suffix;
  if (!name || name.length > MAX_NAME_LENGTH || /[!?]/.test(name)) return null;
  if (suffix && FUNCTION_IN_NAME.test(name) && FUNCTION_SUFFIX.test(suffix)) suffix = placeName(p);
  if (suffix && name.length + 1 + suffix.length > MAX_NAME_LENGTH) suffix = undefined;
  if (missingChars(name + (suffix ?? "")).length) return null;
  const style = draft.style ?? DEFAULT_STYLE[kind];
  if (p.nameStyles && !p.nameStyles.has(style)) return null;
  if (!p.relaxed) {
    const free = p.creativity === "frei" || !!p.wide;
    if (
      draft.later ||
      draft.worn ||
      (!draft.own && /ß/.test(name)) ||
      (!draft.own && WORN_NAMES.has(fold(name))) ||
      (draft.rot !== undefined && !chance(p, `${name}|${suffix ?? ""}`, draft.rot)) ||
      (!draft.own &&
        draft.rot === undefined &&
        isGenericWord(name) &&
        !p.kwLiteral.has(flat(name)) &&
        !chance(p, `gat|${name}`, 0.45))
    )
      return null;
    if (!draft.own && kind !== "initialen") {
      const letters = letterCount(name);
      const syl = syllables(name);
      const words = name.split(/\s+/).filter((w) => w !== "&").length;
      if (
        letters < 4 ||
        letters > 12 ||
        words > 2 ||
        syl < 1 ||
        syl > (free ? 4 : 3) ||
        (style === "abgewandelt" && !free)
      )
        return null;
      const brand = draft.parts.includes("pat:brand");
      if (
        kind === "kunstwort" &&
        style === "markenfaehig" &&
        !free &&
        (brand ? syl < 2 || syl > 3 || softness(name) < 0.5 : syl !== 2 || softness(name) < 0.55)
      )
        return null;
    }
  }
  let rest = name;
  if (draft.own && p.person) for (const t of p.person.tokens) rest = rest.split(t).join(" ");
  if (suffix && clicheOf(suffix)) return null;
  let retailHint: string | undefined;
  if (draft.own) {
    if (
      clicheOf(rest) ||
      protectedTermOf(rest, draft.coined) ||
      (draft.coined && offensiveOf(name))
    )
      return null;
    const trade = tradeBrandOf(name);
    if (trade && isRetailBrand(trade)) {
      if (p.person && !p.person.firsts.some((f) => name.split(/\s+/).includes(f))) return null;
      retailHint = `${trade} ist auch der Name eines bekannten Unternehmens. Mit Vornamen bleibt es eindeutig, vor Nutzung prüfen lassen.`;
    }
  } else if (
    memo(
      BLOCK_CACHE,
      `${name}|${draft.coined ? 1 : 0}|${style === "markenfaehig" ? 1 : 0}`,
      () =>
        !!clicheOf(name) ||
        !!protectedTermOf(name, draft.coined) ||
        name.split(/[\s&]+/).some((w) => w && isTabu(w)) ||
        (!!draft.coined && !!offensiveOf(name)) ||
        !!negativePattern(name, !!draft.coined || style === "markenfaehig"),
    )
  )
    return null;
  let weak = false;
  if (!draft.own && kind !== "person" && kind !== "initialen" && p.kwLiteral.has(flat(name)))
    return null;
  if (!draft.own && kind !== "person" && kind !== "initialen") {
    const weakness = wordWeakness(name);
    if (weakness === "sperre") return null;
    if (weakness === "schwach") {
      if (!p.relaxed) return null;
      weak = true;
    }
    if (
      (draft.coined && style === "markenfaehig" && !isStrongCoinage(name)) ||
      appRuleOf(name, {
        echt: !draft.coined && isRealWord(name),
        kunst: !!draft.coined && (style === "markenfaehig" || style === "abgewandelt"),
      })
    )
      return null;
  }
  const firstName = draft.own && p.person?.first ? fold(p.person.first) : "";
  const withoutFirst =
    (firstName &&
      name
        .split(/\s+/)
        .filter((w) => fold(w) !== firstName)
        .join(" ")) ||
    name;
  const competitor = competitorMatch(name, PLACE_TOKENS);
  if (competitor?.art === "gleich" && !draft.own) return null;
  const brand: BrandMatch | null = corpusMatch(
    withoutFirst,
    !!draft.coined || kind === "kunstwort",
  );
  if (brand?.art === "gleich" && !draft.own) return null;
  const brandLabel = brand?.label ?? null;
  const near = (competitor?.level === "strong" ? competitor : null) ?? brand ?? competitor;
  const naehe = near ? { marke: near.label, art: near.art } : undefined;
  if (
    (style === "satz" && name.split(/\s+/).filter((w) => w !== "&").length > 3) ||
    (!draft.own && tradeBrandOf(name)) ||
    (!draft.own && (REJECTED_NAMES.has(fold(name)) || (p.wien && fold(name) === "kontor")))
  )
    return null;
  const fit =
    !draft.own &&
    (kind === "kombination" || kind === "kunstwort") &&
    !draft.parts.some((x) => x.startsWith("kw:"))
      ? fieldFit(p.cls, placeFieldOfName(name), p.water, p.hills, p.wine)
      : 0;
  if (fit < 0) return null;
  const knownPlace = p.place?.known ? p.place.place : null;
  if (
    suffix &&
    knownPlace &&
    !draft.own &&
    suffix === knownPlace.name &&
    suffix.split(/\s+/).some((w) => w.length >= 4 && fold(name).includes(fold(w)))
  )
    suffix = "Immobilien";
  const letters = letterCount(name);
  if (letters < p.minLen || letters > p.maxLen) return null;
  if (p.exclude.length) {
    const key = fold(name).replace(/\s+/g, "");
    if (p.exclude.some((x) => key.includes(x))) return null;
    if (suffix && p.exclude.some((x) => fold(suffix!).replace(/\s+/g, "").includes(x)))
      suffix = undefined;
  }
  const speakable = pronounceable(name, p.known);
  const tagScore = draft.tags.length
    ? draft.tags.reduce((s, t) => s + tagFit(t, p), 0) / draft.tags.length
    : 0.6;
  const folded = fold(name);
  const key = folded.replace(/\s+/g, "");
  const kwPart = draft.parts.find((x) => x.startsWith("kw:"));
  const topics = draft.own ? undefined : TECH_WORD_TOPICS.get(fold(name));
  const fieldLabel =
    draft.parts.find((x) => x.startsWith("kwl:"))?.slice(4) ??
    (draft.own ? undefined : p.kwFieldWords.get(flat(name))) ??
    (topics
      ? p.kwFields.find(
          (f) =>
            topics.includes(f.field.id) || (f.field.aliases ?? []).some((a) => topics.includes(a)),
        )?.label
      : undefined);
  const kwRelated =
    !!kwPart ||
    !!fieldLabel ||
    p.kw.some((k) => k.length >= 3 && key.includes(k)) ||
    draft.parts.some((x) => p.kwWords.has(fold(x.slice(x.indexOf(":") + 1))));
  const fitScore = Math.min(1, tagScore + (kwRelated ? 0.3 : 0));
  const routeField = !!fieldLabel && p.kwFields.some((f) => f.route && f.label === fieldLabel);
  const distance = draft.d * (competitor ? 0.5 : 1);
  const raw =
    0.13 * lengthValue(name, kind) +
    0.12 * (speakable ? syllableValue(syllables(name)) : 0.3) +
    0.15 * distance +
    0.25 * fitScore +
    0.35 * draft.q;
  const quality = Math.max(0, Math.min(100, raw * 100));
  const lex = LEXICON_BY_KEY.get(fold(name));
  const wordClass =
    !draft.own && (kind === "kombination" || kind === "kunstwort") && !kwRelated
      ? wordClassOf(name, lex?.feld, lex?.m)
      : null;
  const cls = kind === "kunstwort" && wordClass === "bau" ? null : wordClass;
  if (
    suffix &&
    knownPlace &&
    !draft.own &&
    (kind === "kombination" || kind === "kunstwort") &&
    !kwRelated &&
    suffix === knownPlace.name &&
    !(cls === "bau" && fit > 0)
  ) {
    suffix = suffixFor(p, name, style === "echt" || style === "bildhaft", false);
    if (p.exclude.some((x) => fold(suffix!).replace(/\s+/g, "").includes(x))) suffix = undefined;
  }
  const feats = features(p, name, suffix);
  const highend = highendFromFeatures(feats);
  const generic =
    !draft.own &&
    !kwRelated &&
    !draft.parts.includes("pat:brand") &&
    (kind === "kunstwort" ||
      (kind === "kombination" && cls !== "bau" && !!feats[FEATURE_INDEX.kompositum]));
  const fieldTag =
    cls === "material" || cls === "garten" || cls === "abstrakt" || cls === "heim"
      ? cls
      : generic
        ? "generisch"
        : null;
  const known = KNOWN_WORDS.has(fold(name));
  const fieldPenalty =
    cls === "bau" ? (known ? -10 : -2) : fieldTag === "abstrakt" ? 16 : fieldTag ? 14 : 0;
  const bonus =
    12 * (kwRelated ? 1 : fit * feats[FEATURE_INDEX.deutsch]!) -
    6 *
      (feats[FEATURE_INDEX.fremd]! + feats[FEATURE_INDEX.kunst]! + feats[FEATURE_INDEX.mehrwort]!) -
    8 * (feats[FEATURE_INDEX.kompositum] && !kwPart ? 1 : 0) -
    fieldPenalty;
  const score = Math.round(0.7 * quality + 0.3 * highend);
  const mix = CREATIVITY_MIX[p.creativity];
  const spread =
    (!draft.own && (kind === "kombination" || kind === "kunstwort") && cls !== "bau" && !kwRelated
      ? 24
      : cls === "bau"
        ? 16
        : 8) * mix.spread;
  const jitter =
    (rng(hash(`${folded}|${profileKey(p)}`) ^ p.seed).next() - 0.5) * spread +
    (mix.style[style] ?? 0) +
    bonus;
  const shown = displayKind(kind, style, name);
  const technik =
    style === "fremdsprachig"
      ? "fremdsprache"
      : style === "abgewandelt"
        ? "abgewandelt"
        : style === "markenfaehig"
          ? "kunstwort"
          : style === "satz"
            ? "satz"
            : isCompound(name)
              ? "zusammensetzung"
              : "echtes-wort";
  const techBonus = p.anchor.size
    ? 0
    : (shown === "kurz" ||
      shown === "bildhaft" ||
      shown === "fremdsprachig" ||
      (shown === "kombination" && !draft.own && style !== "zusammengesetzt")
        ? techScore(name, technik)
        : 0) + (!draft.own && TECH_FIELD_WORDS.has(folded) ? 6 : 0);
  let reason = draft.reason;
  const claimed =
    p.kw.some((k) => k.length >= 3 && key.includes(k)) ||
    (!!kwPart && p.kw.includes(fold(kwPart.slice(3)))) ||
    draft.parts.some((x) => p.kwClaim.has(fold(x.slice(x.indexOf(":") + 1)))) ||
    [...p.kwClaim].some((k) => k.length >= 4 && key.includes(k));
  if (kwRelated && (claimed || fieldLabel) && (fieldLabel || p.kwLabels.length)) {
    const label = fieldLabel ?? p.kwLabels.find((l) => key.includes(fold(l))) ?? p.kwLabels[0]!;
    const tail = p.routeLabels.has(label)
      ? `, passend zur Richtung deiner Route „${label}“.`
      : `, passend zu deinem Stichwort „${label}“.`;
    const joined = `${reason.slice(0, -1)}${tail}`;
    if (reason.includes(`„${label}“`)) reason = draft.reason;
    else if (draft.short && (draft.short + tail).length <= 140) reason = `${draft.short}${tail}`;
    else if (joined.length <= 140) reason = joined;
  }
  return {
    name,
    suffix,
    kind: displayKind(kind, style, name),
    reason,
    score,
    kwRel: kwRelated && (claimed || !!fieldLabel),
    ...(draft.later || draft.worn || weak ? { late: true as const } : {}),
    rank:
      0.3 * quality +
      0.7 * highend +
      jitter +
      (kwRelated ? (claimed || fieldLabel ? 12 : 6) : 0) +
      (routeField ? 8 : 0) +
      (draft.rankAdj ?? 0) -
      (weak ? 25 : 0) +
      techBonus,
    checks: {
      length: name.length,
      pronounceable: speakable,
      clicheFree: true,
      ...(competitor
        ? { conflict: conflictHint(competitor.label) }
        : brandLabel
          ? { conflict: conflictHint(brandLabel) }
          : {}),
    },
    parts: [...draft.parts, `s:${style}`, ...(fieldTag ? [`fld:${fieldTag}`] : [])],
    key:
      kind === "person"
        ? fold(`${name} ${suffix ?? ""}`).replace(/\s+/g, "")
        : folded.replace(/\s+/g, ""),
    style,
    highend,
    ...(draft.hint || retailHint ? { hint: draft.hint ?? retailHint } : {}),
    ...(naehe ? { naehe } : {}),
  };
}
