/**
 * Markenfaehige Kunstwoerter aus Stamm und Endung (nameFinder-Chunk: `ys`, `Ts`, `Fs`, `Ds`,
 * `Vn`, `Ns`, `Vs`, `Os`, `Is`, `Ne`, `Fa`, `Zs`, `Wn`, `vr`, `_s`, `Us`, `Cs`, `$s`, `On`,
 * `js`).
 *
 * Die Regeln kommen aus `naming-rules.json` (Endungen nach Ton, verbotene Endungen,
 * Schreibvarianten, Klischee- und Anti-Muster, verbotene Lautfolgen, Wurzeln, Silben) und
 * ergaenzen feste Startwerte.
 */
import rulesJson from "../reference/naming-rules.json";
import { fold, letters } from "./fold";
import type { StyleKey } from "../../types";

export type Tone = "weich" | "klar" | "edel" | "warm";

export interface BrandEnding {
  e: string;
  q: number;
  ton?: Tone;
}

export interface Spelling {
  /** gefaltete Endung, die ersetzt wird */
  from: string;
  to: string;
  /** Begruendung */
  r: string;
  q: number;
}

export interface LetterRule {
  id: string;
  von: string;
  zu: string;
}

export interface NegativePattern {
  re: RegExp;
  art: string;
}

export interface SoundBan {
  re: RegExp;
  except: string[];
}

export interface BrandRoot {
  stem: string;
  lang: string;
  m: string;
  felder: string[];
  q: number;
}

export interface SyllableSet {
  onsets: Array<[string, number]>;
  nuclei: Array<[string, number]>;
  codas: Array<[string, number]>;
}

export interface BrandRules {
  ends: BrandEnding[];
  badEnds: string[];
  spellings: Spelling[];
  letterRules: LetterRule[];
  negative: NegativePattern[];
  soundBans: SoundBan[];
  roots: BrandRoot[];
  syllables: SyllableSet | null;
}

/** Startwerte der Endungen (`ys`). */
const BASE_ENDS: BrandEnding[] = [
  { e: "a", q: 0.8, ton: "weich" },
  { e: "o", q: 0.75, ton: "klar" },
  { e: "an", q: 0.6, ton: "klar" },
  { e: "eo", q: 0.6, ton: "edel" },
  { e: "ea", q: 0.65, ton: "weich" },
  { e: "ora", q: 0.75, ton: "edel" },
  { e: "ara", q: 0.7, ton: "edel" },
  { e: "ina", q: 0.65, ton: "weich" },
  { e: "ino", q: 0.55, ton: "klar" },
  { e: "ano", q: 0.55, ton: "klar" },
  { e: "ena", q: 0.6, ton: "weich" },
  { e: "ero", q: 0.55, ton: "klar" },
  { e: "elle", q: 0.55, ton: "weich" },
  { e: "ond", q: 0.55, ton: "edel" },
  { e: "aro", q: 0.55, ton: "klar" },
  { e: "ura", q: 0.55, ton: "weich" },
];
/** Endungen, die nach Tech oder Pharma klingen (`Ts`). */
const TECH_ENDS: string[] = [
  "ion",
  "ex",
  "ix",
  "ax",
  "ox",
  "ux",
  "yx",
  "ys",
  "ify",
  "ly",
  "tron",
  "tec",
  "tek",
  "ics",
];
/** Erlaubte Doppel-Mitlaute am Wortanfang (`Fs`). */
const ONSET_CLUSTERS: ReadonlySet<string> = new Set([
  "bl",
  "br",
  "cl",
  "cr",
  "dr",
  "fl",
  "fr",
  "gl",
  "gr",
  "pl",
  "pr",
  "tr",
  "st",
  "sp",
  "sc",
]);
/** Echte Woerter und Namen, die kein Kunstwort sein koennen (`Ds`). */
const TAKEN_WORDS: ReadonlySet<string> = new Set([
  "firma",
  "forma",
  "norma",
  "basis",
  "cura",
  "solo",
  "sola",
  "fundo",
  "capo",
  "capa",
  "porto",
  "porta",
  "terra",
  "stabil",
  "valid",
  "solid",
  "solida",
  "solido",
  "aura",
  "aurora",
  "nova",
  "novo",
  "novum",
  "casa",
  "caso",
  "domo",
  "dona",
  "vale",
  "valle",
  "monte",
  "monti",
  "campo",
  "campus",
  "camper",
  "civis",
  "urban",
  "urbana",
  "lumen",
  "luca",
  "lucia",
  "lucio",
  "clara",
  "claro",
  "clarin",
  "marina",
  "fides",
  "certo",
  "certa",
  "tutor",
  "tuto",
  "cures",
  "curare",
  "curio",
  "provo",
  "proven",
  "fabrik",
  "fabio",
  "mercato",
  "merci",
  "portal",
  "porten",
  "signa",
  "signo",
  "dignum",
  "nobel",
  "nobile",
  "pala",
  "palo",
  "palme",
  "silva",
  "silvan",
  "verde",
  "verdi",
  "hortus",
  "prato",
  "prat",
  "riva",
  "rival",
  "lago",
  "lagos",
  "alpa",
  "alpen",
  "alpin",
  "census",
  "cento",
  "creo",
  "crema",
  "credo",
  "camera",
  "canon",
  "capri",
  "casino",
  "domina",
  "domino",
  "lumina",
  "solar",
  "firmen",
  "lagen",
  "silvia",
  "silvio",
  "fido",
  "signora",
  "curia",
  "digna",
  "casio",
  "novia",
  "fundus",
  "domus",
  "solum",
  "signum",
  "campus",
  "novus",
  "firmus",
  "dignus",
  "valium",
  "portia",
  "palio",
  "lagune",
  "laguna",
  "urbano",
  "lucano",
  "fidelio",
  "solea",
  "solano",
  "valeo",
  "valina",
  "alpina",
  "silvana",
  "romana",
  "montana",
  "montano",
  "campino",
  "casina",
  "lineal",
  "linea",
  "colon",
  "cola",
  "coma",
  "colle",
  "marin",
  "mara",
  "vivo",
  "viva",
  "vivian",
  "pace",
  "paco",
  "lara",
  "larissa",
  "orna",
  "canto",
  "canta",
  "alto",
  "alta",
  "arma",
  "armen",
  "flora",
  "floren",
  "laca",
  "lacan",
  "dime",
  "calma",
  "sera",
  "seren",
  "vera",
  "veran",
]);

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const num = (v: unknown, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const TONES = new Set(["weich", "klar", "edel", "warm"]);
/** Gewicht aus der Regeldatenbank auf die Endungs-Skala (`qs`). */
const endWeight = (g: number): number => Math.max(0.3, Math.min(0.85, 0.45 + 0.4 * g));

/** Regex aus einem Muster; Platzhalter in Versalien und Prosa sind keine Regex (`Vn`). */
function patternRegex(source: string): RegExp | null {
  if (
    !source ||
    /^[A-Z_]+$/.test(source) ||
    (/\s[a-zäöü]+\s/i.test(source) && !/[|^$\\[(]/.test(source))
  )
    return null;
  try {
    return new RegExp(source);
  } catch {
    return null;
  }
}

/** Regeldatenbank lesen (`Ns`). */
function readRules(source: unknown): Partial<BrandRules> {
  const r = obj(source);
  if (!Object.keys(r).length) return {};
  const out: Partial<BrandRules> = {};
  const ends: BrandEnding[] = [];
  const addEnd = (item: unknown, tone: string): void => {
    const o = obj(item);
    const e = letters(str(typeof item === "string" ? item : (o.endung ?? o.e)));
    if (e.length >= 1 && e.length <= 4)
      ends.push({
        e,
        q: endWeight(num(o.gewicht ?? o.q, 0.6)),
        ...(tone && TONES.has(tone) ? { ton: tone as Tone } : {}),
      });
  };
  for (const [tone, list] of Object.entries(obj(r.endungen_nach_ton)))
    for (const item of arr(list)) addEnd(item, tone);
  for (const item of arr(r.endungen ?? r.endings)) addEnd(item, str(obj(item).ton));
  if (ends.length) out.ends = ends;
  const bad = arr(r.verbotene_endungen ?? r.schlechte_endungen ?? r.bad_endings)
    .map((w) => letters(str(typeof w === "string" ? w : obj(w).endung)))
    .filter((w) => w.length >= 2);
  if (bad.length) out.badEnds = bad;
  const spellings: Spelling[] = [];
  const letterRules: LetterRule[] = [];
  for (const item of arr(r.schreibvarianten ?? r.spellings)) {
    const o = obj(item);
    if (o.erlaubt === false) continue;
    const from = str(o.von ?? o.from).toLocaleLowerCase("de-AT");
    const to = str(o.zu ?? o.to).toLocaleLowerCase("de-AT");
    if (typeof o.id === "string") letterRules.push({ id: o.id, von: from, zu: to });
    else if (/^[a-zäöü]{3,10}$/.test(from) && /^[a-zäöü]{2,10}$/.test(to) && from !== to)
      spellings.push({
        from: fold(from),
        to,
        r:
          str(o.grund ?? o.begruendung) ||
          `Die Schreibweise ${to} statt ${from} hebt sich lesbar ab`,
        q: 0.7,
      });
  }
  if (spellings.length) out.spellings = spellings;
  if (letterRules.length) out.letterRules = letterRules;
  const negative: NegativePattern[] = [];
  for (const item of arr(r.negative_muster ?? r.klischee_muster)) {
    const o = obj(item);
    const source = str(typeof item === "string" ? item : o.muster);
    if (source === "Binnenmajuskel") negative.push({ re: /\p{Ll}\p{Lu}/u, art: "anti_muster" });
    const re = patternRegex(source);
    if (re) negative.push({ re, art: str(o.art) || "klischee" });
  }
  if (negative.length) out.negative = negative;
  const soundBans: SoundBan[] = [];
  for (const item of arr(obj(r.lautfolgen).verboten)) {
    const o = obj(item);
    const re = patternRegex(str(o.muster));
    if (re) soundBans.push({ re, except: arr(o.ausnahmen).map(str).filter(Boolean) });
  }
  if (soundBans.length) out.soundBans = soundBans;
  const roots: BrandRoot[] = [];
  for (const item of arr(r.wurzeln)) {
    const o = obj(item);
    const stem = letters(str(o.wurzel ?? o.stamm));
    if (stem.length >= 2 && stem.length <= 6)
      roots.push({
        stem,
        lang: str(o.sprache) || "la",
        m: str(o.bedeutung) || stem,
        felder: arr(o.felder).map(str).filter(Boolean),
        q: num(o.gewicht, 0.5),
      });
  }
  if (roots.length) out.roots = roots;
  const blocks = obj(r.silbenbausteine);
  const sounds = (list: unknown): Array<[string, number]> =>
    arr(list)
      .map((o): [string, number] => [
        str(obj(o).laut).toLocaleLowerCase("de-AT"),
        num(obj(o).gewicht, 0),
      ])
      .filter(([s, g]) => g > 0.15 && /^[a-z]{0,3}$/.test(s));
  if (Object.keys(blocks).length)
    out.syllables = {
      onsets: sounds(blocks.anlaute),
      nuclei: sounds(blocks.kerne).filter(([s]) => s.length > 0),
      codas: sounds(blocks.auslaute),
    };
  return out;
}

/** Diese Endung der Regeldatenbank bleibt aussen vor (`Os`). */
const SKIP_ENDS = new Set(["ve"]);

/** Regeln zusammenfuehren (`Is`). */
function buildRules(read: Partial<BrandRules>): BrandRules {
  const badEnds = [...new Set([...TECH_ENDS, ...(read.badEnds ?? [])])];
  const ends = new Map(BASE_ENDS.map((e) => [e.e, e]));
  for (const e of read.ends ?? [])
    if (!SKIP_ENDS.has(e.e)) ends.set(e.e, { ...ends.get(e.e), ...e });
  return {
    ends: [...ends.values()].filter((e) => !badEnds.some((b) => e.e.endsWith(b)) && e.q > 0.3),
    badEnds,
    spellings: read.spellings ?? [],
    letterRules: read.letterRules ?? [],
    negative: read.negative ?? [],
    soundBans: read.soundBans ?? [],
    roots: read.roots ?? [],
    syllables: read.syllables ?? null,
  };
}

/** Geltende Regeln fuer Kunstwoerter (`Ne`). */
export const BRAND_RULES: BrandRules = buildRules(readRules(rulesJson));

const VOWEL = /[aeiou]/;
const vowelGroups = (text: string): number => (text.match(/[aeiou]+/g) ?? []).length;

/** Name endet auf eine verbotene Endung (`Wn`). */
export function hasBadEnding(name: string, rules: BrandRules = BRAND_RULES): boolean {
  const key = fold(name).replace(/\s+/g, "");
  return rules.badEnds.some((e) => key.endsWith(e));
}

/**
 * Klischee- oder Anti-Muster im Namen (`vr`), Ergebnis ist die Quelle des Musters.
 * `partial`: auch Teiltreffer in einem Wort zaehlen (sonst nur ganze Woerter).
 */
export function negativePattern(
  name: string,
  partial: boolean,
  rules: BrandRules = BRAND_RULES,
): string | null {
  const text = name.trim();
  const words = text
    .toLocaleLowerCase("de-AT")
    .split(/[\s&-]+/)
    .filter(Boolean);
  for (const { re, art } of rules.negative) {
    if (art === "anti_muster") {
      if (re.test(text) || re.test(text.toLocaleLowerCase("de-AT"))) return re.source;
      continue;
    }
    for (const w of words) {
      const m = w.match(re);
      if (m && (partial || (m.index === 0 && m[0].length === w.length))) return re.source;
    }
  }
  return null;
}

/** Kunstwort aus 4 bis 7 Buchstaben, gut sprechbar und frei (`_s`). */
export function isBrandableWord(word: string, rules: BrandRules = BRAND_RULES): boolean {
  const w = word.toLocaleLowerCase("de-AT");
  if (!/^[a-z]{4,7}$/.test(w) || /[qxyjwkzh]/.test(w) || /(.)\1/.test(w) || /c(?![aoulr])/.test(w))
    return false;
  const groups = vowelGroups(w);
  if (
    groups < 2 ||
    groups > 3 ||
    (w.match(/[aeiou]+/g) ?? []).some(
      (g) => g.length > 2 || (g.length === 2 && !["ia", "io", "ea", "eo"].includes(g)),
    ) ||
    (w.match(/[^aeiou]+/g) ?? []).some((g) => g.length > 2)
  )
    return false;
  const onset = w.match(/^[^aeiou]+/)?.[0] ?? "";
  if (onset.length === 2 && !ONSET_CLUSTERS.has(onset)) return false;
  const coda = w.match(/[^aeiou]+$/)?.[0] ?? "";
  if (
    (coda.length === 2 && !["nd", "rd", "nt", "rt", "ls", "ns", "rs"].includes(coda)) ||
    hasBadEnding(w, rules) ||
    TAKEN_WORDS.has(w) ||
    /(..)\1/.test(w)
  )
    return false;
  for (const { re, except } of rules.soundBans) {
    const m = w.match(re);
    if (m && !except.includes(m[0])) return false;
  }
  return negativePattern(w, true, rules) ? false : VOWEL.test(w.slice(-2)) || /[nlrsd]$/.test(w);
}

/** Stile, zu denen ein Ton passt (`Us`). */
const TONE_STYLES: Readonly<Record<Tone, StyleKey[]>> = {
  weich: ["warm", "natur"],
  warm: ["warm", "natur"],
  klar: ["modern", "mutig"],
  edel: ["elegant", "luxus"],
};
/** Ton passt zu einem der Stile (`Cs`). */
const toneFits = (tone: Tone | undefined, styles: readonly string[]): boolean =>
  !!tone && TONE_STYLES[tone].some((s) => styles.includes(s));

export interface BrandableWord {
  w: string;
  /** Endung */
  e: string;
  q: number;
}

/** Kunstwoerter aus einem Stamm mit allen passenden Endungen, beste zuerst (`$s`). */
export function brandableFrom(
  stem: string,
  styles: readonly string[] = [],
  rules: BrandRules = BRAND_RULES,
): BrandableWord[] {
  const base = letters(stem);
  if (base.length < 2 || VOWEL.test(base.slice(-1))) return [];
  const out: BrandableWord[] = [];
  for (const { e, q, ton } of rules.ends) {
    const w = base + e;
    if (isBrandableWord(w, rules))
      out.push({
        w: w.charAt(0).toLocaleUpperCase("de-AT") + w.slice(1),
        e,
        q: Math.min(0.9, q + (toneFits(ton, styles) ? 0.1 : 0)),
      });
  }
  return out.sort((a, b) => b.q - a.q || (a.w < b.w ? -1 : 1));
}

/** Die letzten zwei Buchstaben (`On`): auf Seite 1 je Endung nur ein Kunstwort. */
export const endingKey = (name: string): string => fold(name).replace(/\s+/g, "").slice(-2);

/** Schreibvariante "C statt K" (Regel SV01), z. B. "Kontor" wird "Contor" (`js`). */
export function letterVariant(
  name: string,
  rules: BrandRules = BRAND_RULES,
): { w: string; id: string } | null {
  return rules.letterRules.some((r) => r.id === "SV01") && /^K[ao]/.test(name) && name.length >= 6
    ? { w: `C${name.slice(1)}`, id: "SV01" }
    : null;
}
