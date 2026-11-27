/**
 * Sperr- und Naeheregeln (nameFinder-Chunk: `fu`, `ku`, `zu`, `Ge`, `Su`, `vu`, `$e`, `Au`,
 * `Hu`, `ka`, `va`, `Ue`, `Eu`, `wr`, `Mu`, `Te`, `yr`, `yn`, `Tu`, `_r`, `Re`, `Du`, `Pu`).
 *
 * - Klischees wie Traum, Premium, Top
 * - Mitbewerber (RE/MAX, EHL, Otto ...)
 * - Handels- und Konzernmarken (Hofer, Billa, Strabag ...)
 * - anstoessige Woerter
 * - geschuetzte Begriffe aus Handel und Aemtern (Bank, Notar, Amt ...)
 * - Naehe zu Marken des Korpus (`corpusMatch`) und zu Tech-Marken (`techMatch`)
 */
import { PLACES } from "../orte";
import { CORPUS_BRANDS, TECH_BRANDS } from "./corpusNames";
import { bitCount, fold, letterMask, levenshtein, levenshteinMax } from "./fold";

// ---------------------------------------------------------------------------
// Klischees

/** Makler-Klischees, Teilwort genuegt (`fu`). */
export const CLICHES: readonly string[] = [
  "traum",
  "dream",
  "premium",
  "top",
  "best",
  "beste",
  "home sweet",
  "sweet home",
  "luxus",
  "luxury",
  "lux",
  "exklusiv",
  "exclusive",
  "elite",
  "prestige",
  "royal",
  "deluxe",
  "supreme",
  "excellence",
  "exzellen",
  "exquisit",
  "perfekt",
  "perfect",
  "ideal",
  "optimal",
  "genial",
  "einzigartig",
  "unique",
  "super",
  "mega",
  "ultra",
  "maxi",
  "prime",
  "first",
  "nummer eins",
  "number one",
  "no 1",
  "nr 1",
  "vip",
  "star",
  "gold",
  "platin",
  "diamant",
  "juwel",
  "perle",
  "oase",
  "paradies",
  "paradise",
  "wohlfühl",
  "glück",
  "sorglos",
  "profi",
  "experte",
  "expert",
  "mehrwert",
  "hochwertig",
  "spitzen",
  "schönst",
  "feinst",
  "größt",
  "höchst",
  "allerbest",
  "immo",
  "heimat",
  "dein zuhause",
  "ihr zuhause",
  "herzstück",
  "schmuckstück",
  "kompetenz",
  "leidenschaft",
];
/** Klischees, die nur als eigenes Wort oder Wortanfang zaehlen (`ku`). */
const CLICHE_WORDS: ReadonlySet<string> = new Set([
  "top",
  "best",
  "lux",
  "vip",
  "star",
  "gold",
  "mega",
  "prime",
  "first",
  "super",
  "ultra",
  "maxi",
  "ideal",
  "immo",
  "elite",
]);
/** Woerter, die mit einem Klischee beginnen, aber keines sind (`zu`). */
const CLICHE_EXCEPT =
  /^(?:immobilie|topf|stopp|bestand|bestell|bestimm|goldegg|goldberg|elitär|superior)/;

/** Das erste Klischee im Text, "!" bei Ausrufe- oder Fragezeichen, sonst `null` (`Ge`). */
export function clicheOf(text: string): string | null {
  if (/[!?]/.test(text)) return "!";
  const low = text.toLocaleLowerCase("de-AT").replace(/[.\-&/]/g, " ");
  const words = low.split(/\s+/).filter(Boolean);
  for (const c of CLICHES) {
    if (!CLICHE_WORDS.has(c)) {
      if (low.includes(c)) return c;
      continue;
    }
    if (
      words.some(
        (w) => w === c || (w.startsWith(c) && w.length > c.length + 2 && !CLICHE_EXCEPT.test(w)),
      )
    )
      return c;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mitbewerber

export interface Competitor {
  label: string;
  cores: string[];
}

/** Grosse Makler in Oesterreich und ihre Wortkerne (`Su`). */
export const COMPETITORS: readonly Competitor[] = [
  { label: "RE/MAX", cores: ["remax"] },
  { label: "EHL", cores: ["ehl"] },
  { label: "Otto Immobilien", cores: ["otto"] },
  { label: "Engel & Völkers", cores: ["engelvoelkers", "engelundvoelkers", "voelkers"] },
  { label: "s REAL", cores: ["sreal"] },
  { label: "Raiffeisen Immobilien", cores: ["raiffeisen"] },
  { label: "ÖRAG", cores: ["oerag", "orag"] },
  { label: "Buwog", cores: ["buwog"] },
  { label: "Wienwert", cores: ["wienwert"] },
  { label: "Bundesimmobilien", cores: ["bundesimmobilien", "bundesimmo"] },
  { label: "Sotheby's", cores: ["sothebys", "sotheby"] },
  { label: "Immofinanz", cores: ["immofinanz"] },
  { label: "Erste", cores: ["erste"] },
  { label: "Bawag", cores: ["bawag"] },
  { label: "Wohnservice Wien", cores: ["wohnservice"] },
  { label: "Heimat Österreich", cores: ["heimatoesterreich", "heimat"] },
  { label: "Immowelt", cores: ["immowelt"] },
  { label: "willhaben", cores: ["willhaben"] },
  { label: "ImmoScout24", cores: ["immoscout", "immoscout24", "immobilienscout"] },
  { label: "Wiener Wohnen", cores: ["wienerwohnen"] },
  { label: "Wiener Stadtwerke", cores: ["stadtwerk", "stadtwerke"] },
  { label: "UNIO", cores: ["unio"] },
  { label: "UNIO CIRCLE", cores: ["circle", "uniocircle"] },
  { label: "ERA", cores: ["era"] },
  { label: "Century 21", cores: ["century21", "century"] },
  { label: "Coldwell Banker", cores: ["coldwellbanker", "coldwell"] },
  { label: "Immobilien Scout", cores: ["scout"] },
  { label: "JP Immobilien", cores: ["jp"] },
  { label: "Aurena", cores: ["aurena"] },
  { label: "Maison Berger", cores: ["maisonberger"] },
  { label: "Lumia", cores: ["lumia"] },
  { label: "Wienerberger", cores: ["wienerberger", "wienerberg"] },
];
/** Gattungswoerter, die beim Vergleich mit Mitbewerbern wegfallen (`vu`). */
const COMPETITOR_STOP: ReadonlySet<string> = new Set([
  "immobilien",
  "realitaeten",
  "real",
  "estate",
  "gmbh",
  "partner",
  "und",
  "co",
  "kg",
  "og",
  "eu",
  "ag",
  "haus",
  "studio",
  "atelier",
]);

export interface CompetitorMatch {
  label: string;
  level: "strong" | "weak";
  art: "gleich" | "teilwort" | "aehnlich";
}

const COMPETITOR_CACHE = new WeakMap<object, Map<string, CompetitorMatch | null>>();
const NO_IGNORE = {};

/**
 * Naehe zu einem Mitbewerber (`$e`); `ignore` sind gefaltete Woerter, die nicht zaehlen
 * (z. B. Ortsnamen).
 */
export function competitorMatch(
  text: string,
  ignore?: ReadonlySet<string>,
): CompetitorMatch | null {
  const key = ignore ?? NO_IGNORE;
  let cache = COMPETITOR_CACHE.get(key);
  if (!cache) COMPETITOR_CACHE.set(key, (cache = new Map()));
  const hit = cache.get(text);
  if (hit !== undefined) return hit;
  const out = competitorMatchUncached(text, ignore);
  if (cache.size > 20000) cache.clear();
  cache.set(text, out);
  return out;
}

function competitorMatchUncached(
  text: string,
  ignore?: ReadonlySet<string>,
): CompetitorMatch | null {
  const words = fold(text)
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !COMPETITOR_STOP.has(w) && !(ignore != null && ignore.has(w)));
  const joined = words.join("");
  const parts = words.length > 1 ? words.filter((w) => w.length >= 2) : [];
  let weak: CompetitorMatch | null = null;
  for (const comp of COMPETITORS)
    for (const core of comp.cores) {
      const short = core.length < 5;
      for (const w of [joined, ...parts]) {
        if (!w) continue;
        if (w === core)
          return { label: comp.label, level: "strong", art: w === joined ? "gleich" : "teilwort" };
        const dist = levenshtein(w, core);
        if (short) {
          if (core.length >= 4 && dist === 1 && w.length === core.length)
            return { label: comp.label, level: "strong", art: "aehnlich" };
          if (core.length >= 4 && w.startsWith(core))
            return { label: comp.label, level: "strong", art: "teilwort" };
          if (w.startsWith(core) && w.length <= core.length + 2)
            weak = weak ?? { label: comp.label, level: "weak", art: "teilwort" };
          continue;
        }
        if (dist <= 1) return { label: comp.label, level: "strong", art: "aehnlich" };
        if (
          w.length >= 5 &&
          (w.includes(core) || (core.includes(w) && w.length >= 6 && w.length >= core.length * 0.7))
        )
          return { label: comp.label, level: "strong", art: "teilwort" };
        if (dist <= 2 && Math.max(w.length, core.length) >= 7)
          weak = weak ?? { label: comp.label, level: "weak", art: "aehnlich" };
      }
    }
  return weak;
}

// ---------------------------------------------------------------------------
// Handels- und Konzernmarken

/** Bekannte oesterreichische Konzerne und Marken (`Hu`). */
export const KONZERNE: readonly string[] = [
  "Agrana",
  "Andritz",
  "Atomic",
  "Austrian",
  "Bawag",
  "Billa",
  "Blum",
  "Borealis",
  "Doppelmayr",
  "Egger",
  "Erste",
  "Fischer",
  "Gesiba",
  "Hofer",
  "Interspar",
  "Julius Meinl",
  "Kapsch",
  "Kika",
  "Leiner",
  "Lenzing",
  "Manner",
  "Merkur",
  "Meinl",
  "Novomatic",
  "OMV",
  "Palfinger",
  "Penny",
  "Porr",
  "Raiffeisen",
  "Rauch",
  "Red Bull",
  "Riedel",
  "Rosenbauer",
  "Semperit",
  "Signa",
  "Spar",
  "Strabag",
  "Swarovski",
  "Uniqa",
  "Verbund",
  "Vienna Insurance",
  "Voestalpine",
  "Wienerberger",
  "Zumtobel",
  "Kelly",
  "Almdudler",
  "Ottakringer",
  "Gösser",
  "Stiegl",
  "Zipfer",
  "Hartlauer",
  "Libro",
  "Thalia",
  "Lutz",
  "XXXLutz",
  "Mömax",
  "Bipa",
  "Müller",
  "Hervis",
  "Intersport",
  "Gigasport",
  "Sacher",
  "Demel",
  "Altana",
  "Allianz",
  "Aldi",
  "Adidas",
  "Audi",
  "BASF",
  "Bauhaus",
  "Bayer",
  "Beiersdorf",
  "Bosch",
  "Braun",
  "Continental",
  "Daimler",
  "Douglas",
  "Edeka",
  "Ergo",
  "Fresenius",
  "Haribo",
  "Henkel",
  "Hochtief",
  "Hornbach",
  "Hugo Boss",
  "Kaufland",
  "Knauf",
  "Leica",
  "Lidl",
  "Linde",
  "Lufthansa",
  "Merck",
  "Metro",
  "Miele",
  "Nivea",
  "Obi",
  "Otto",
  "Porsche",
  "Puma",
  "Quelle",
  "Rewe",
  "Rimowa",
  "Rossmann",
  "Siemens",
  "Sixt",
  "Tchibo",
  "Tesa",
  "Thyssenkrupp",
  "Trumpf",
  "Vaillant",
  "Viessmann",
  "Vonovia",
  "Würth",
  "Zalando",
  "Zeiss",
  "Amazon",
  "Apple",
  "Google",
  "Meta",
  "Microsoft",
  "Nike",
  "Ikea",
  "Lego",
  "Philips",
  "Sony",
  "Canon",
  "Nikon",
  "Shell",
  "Total",
  "Rolex",
  "Omega",
  "Tissot",
  "Swatch",
  "Lindt",
  "Milka",
  "Nestle",
  "Nespresso",
  "Samsung",
  "Tesla",
  "Toyota",
  "Volvo",
  "Vitra",
  "Hermes",
  "Dior",
  "Gucci",
  "Armani",
  "Versace",
  "Fendi",
  "Valentino",
  "Bulgari",
  "Tiffany",
  "Prada",
  "Chanel",
  "Cartier",
  "Hilton",
  "Marriott",
  "Hyatt",
  "Accor",
  "Kempinski",
  "Sacher",
  "Ritz",
  "Mandarin",
  "Fairmont",
  "Westin",
  "Sheraton",
  "Novotel",
  "Oracle",
  "Intel",
  "Cisco",
  "Adobe",
  "Salesforce",
  "Netflix",
  "Spotify",
  "Uber",
  "Airbnb",
  "Booking",
  "Expedia",
  "Visa",
  "Mastercard",
  "Atrium Ljungberg",
  "Aurora",
  "Solvay",
  "Saint-Gobain",
  "Sika",
  "Geberit",
  "Grohe",
  "Hansgrohe",
  "Villeroy",
  "Duravit",
  "Laufen",
];
/** Handelsketten, Banken, Versicherer: als Name nur mit Vornamen (`ka`). */
export const HANDELSKETTEN: readonly string[] = [
  "Hofer",
  "Billa",
  "Spar",
  "Interspar",
  "Merkur",
  "Penny",
  "Lidl",
  "Aldi",
  "Rewe",
  "Edeka",
  "Kaufland",
  "Bipa",
  "Libro",
  "Thalia",
  "Kika",
  "Leiner",
  "Lutz",
  "XXXLutz",
  "Mömax",
  "Hartlauer",
  "Hervis",
  "Obi",
  "Bauhaus",
  "Hornbach",
  "Erste",
  "Bawag",
  "Raiffeisen",
  "Uniqa",
  "Ikea",
  "Metro",
  "Rossmann",
  "Müller",
  "Norma",
  "Eurospar",
  "Maximarkt",
  "Unimarkt",
  "Adeg",
  "MPreis",
  "Nah und Frisch",
  "Lagerhaus",
  "Baumax",
  "Bauhof",
  "Hagebau",
  "Toom",
  "Hellweg",
  "Globus",
  "Netto",
  "Plus",
  "Zielpunkt",
  "Dayli",
  "Fussl",
  "Humanic",
  "Öamtc",
  "Arbö",
  "Öbb",
  "Westbahn",
  "Wiener Linien",
  "Wiener Wohnen",
  "Wien Energie",
  "Wiener Netze",
  "Wiener Städtische",
  "Wüstenrot",
  "Grawe",
  "Generali",
  "Zurich",
  "Helvetia",
  "Donau Versicherung",
  "Volksbank",
  "Hypo",
  "Oberbank",
  "Bank Austria",
  "Easybank",
  "Dadat",
  "Bawag Psk",
  "Psk",
  "Erste Bank",
  "S Real",
  "Immofinanz",
  "Buwog",
  "CA Immo",
  "Sozialbau",
  "Gesiba",
  "Wohnfonds",
  "Neue Heimat",
  "Heimat Österreich",
  "Migra",
  "Arwag",
  "Glorit",
  "Raiffeisen Immobilien",
  "Post",
  "A1",
  "Magenta",
  "Telekom",
  "Drei",
  "Ams",
  "Arbeiterkammer",
  "Wko",
  "Wirtschaftskammer",
  "Finanzamt",
  "Magistrat",
  "Caritas",
  "Volkshilfe",
  "Hilfswerk",
  "Rotes Kreuz",
  "Samariterbund",
  "Deutsche Wohnen",
  "Vonovia",
  "Tag Immobilien",
  "Migros",
  "Coop",
  "Denner",
  "Volg",
  "Ubs",
  "Credit Suisse",
];

const RETAIL_KEYS = new Set(HANDELSKETTEN.map((n) => fold(n).replace(/[\s-]+/g, "")));
const TRADE_NAMES = [...KONZERNE, ...HANDELSKETTEN];
const TRADE_KEYS = new Set(TRADE_NAMES.map((n) => fold(n).replace(/[\s-]+/g, "")));
/** Lange Marken, die auch als Wortanfang zaehlen ("Billahaus") (`xu`). */
const TRADE_PREFIXES = [...TRADE_KEYS].filter((k) => k.length >= 5);
const TRADE_TAIL =
  /^(s)?(haus|hof|werk|raum|gut|immobilien|immo|wohnen|bau|markt|center|zentrum|platz|park|welt|plus|home|living|real)$/;

/** Marke ist eine Handelskette (`va`). */
export function isRetailBrand(name: string): boolean {
  return RETAIL_KEYS.has(fold(name).replace(/[\s-]+/g, ""));
}

/** Handels- oder Konzernmarke im Namen, sonst `null` (`Ue`). */
export function tradeBrandOf(text: string): string | null {
  const words = fold(text)
    .split(/[\s&-]+/)
    .filter(Boolean);
  const label = (key: string): string =>
    TRADE_NAMES.find((n) => fold(n).replace(/[\s-]+/g, "") === key) ?? key;
  const pairs = words.slice(1).map((w, i) => words[i] + w);
  for (const w of [...words, ...pairs, words.join("")]) if (TRADE_KEYS.has(w)) return label(w);
  for (const w of words)
    for (const p of TRADE_PREFIXES)
      if (w.length > p.length && w.startsWith(p) && TRADE_TAIL.test(w.slice(p.length)))
        return label(p);
  return null;
}

// ---------------------------------------------------------------------------
// Anstoessiges

/** Teilwoerter, die in keinem Namen stehen duerfen (`Eu`). */
export const OFFENSIVE: readonly string[] = [
  "anal",
  "anus",
  "porn",
  "sex",
  "nazi",
  "hure",
  "kack",
  "fick",
  "arsch",
  "mord",
  "pest",
  "gift",
  "leich",
  "sarg",
  "puff",
  "titt",
  "pleite",
  "pfusch",
  "konkurs",
  "krebs",
  "aids",
  "virus",
  "terror",
  "hitler",
  "mist",
  "kot",
  "tod",
  "merd",
  "piss",
  "kaka",
  "caca",
  "puta",
  "culo",
  "cazz",
  "figa",
  "fica",
  "stron",
  "mort",
  "morb",
  "mala",
  "male",
  "malo",
  "dolor",
  "pena",
  "mona",
  "vacc",
  "lepra",
  "lues",
  "nekro",
  "necro",
  "isis",
  "depp",
  "trottel",
  "doof",
  "dumm",
  "geil",
  "porco",
  "vom",
  "mald",
  "kotz",
  "rotz",
  "gurg",
  "garg",
  "sabb",
  "furz",
  "pups",
  "eiter",
  "vene",
  "rost",
  "moder",
  "fies",
  "mies",
];

/** Anstoessiges Teilwort, sonst `null` (`wr`). */
export function offensiveOf(text: string): string | null {
  const key = fold(text).replace(/\s+/g, "");
  return OFFENSIVE.find((w) => key.includes(w)) ?? null;
}

// ---------------------------------------------------------------------------
// Geschuetzte Begriffe aus Handel und Aemtern

/**
 * Begriffe, die Berufsrecht, Bankwesen oder Behoerden vorbehalten sind (`Mu`): Bank, Notar,
 * Treuhand, Versicherung, Baumeister, Magistrat und so weiter.
 */
export const HANDEL_AMT: readonly string[] = [
  "bank",
  "sparkass",
  "notar",
  "treuhand",
  "anwalt",
  "advokat",
  "versicher",
  "assekur",
  "gutacht",
  "sachverst",
  "behoerd",
  "staatlich",
  "gemeinde",
  "republik",
  "bundes",
  "steuerberat",
  "wirtschaftspruef",
  "baumeister",
  "architekt",
  "ingenieur",
  "ziviltechn",
  "fonds",
  "genossenschaft",
  "gemeinnuetz",
  "kredit",
  "finanz",
  "polizei",
  "gericht",
  "ministeri",
  "magistrat",
  "stadtwien",
  "kammer",
  "verband",
  "institut",
];
const AMT_EXCEPT = new Set(["samt", "gesamt", "insgesamt"]);

/**
 * Geschuetzter Begriff im Namen (`Te`): einer aus `HANDEL_AMT`, "kanzlei" (ausser
 * Immobilienkanzlei), "amt", "oesterreich" am Anfang, mit `strictWien` auch "wien".
 */
export function protectedTermOf(text: string, strictWien = false): string | null {
  const folded = fold(text);
  const key = folded.replace(/\s+/g, "");
  for (const t of HANDEL_AMT) if (key.includes(t)) return t;
  if (key.replace(/(immobilien|realitaeten)kanzlei/g, "").includes("kanzlei")) return "kanzlei";
  if (
    folded
      .split(/\s+/)
      .filter(Boolean)
      .some(
        (w) =>
          !AMT_EXCEPT.has(w) &&
          (w === "amt" || w.startsWith("amt") || w.endsWith("amt") || w.includes("aemter")),
      )
  )
    return "amt";
  if (/^(oesterreich|austria|austrian)/.test(key)) return "oesterreich";
  return strictWien && key.includes("wien") ? "wien" : null;
}

// ---------------------------------------------------------------------------
// Naehe zum Marken-Korpus

export interface BrandMatch {
  label: string;
  art: "gleich" | "teilwort" | "aehnlich";
}

/** Woerter, die in Korpus-Namen nicht tragen (`Ku`). */
const CORPUS_STOP: ReadonlySet<string> = new Set([
  "the",
  "le",
  "la",
  "von",
  "de",
  "und",
  "and",
  "partner",
  "partners",
  "estates",
  "hotel",
  "studios",
  "architects",
  "international",
  "one",
  "six",
  "four",
  "house",
  "modern",
  "agency",
  "value",
  "john",
  "daniel",
  "douglas",
  "emile",
  "aaron",
  "marlies",
  "david",
]);
/** Ortswoerter: zaehlen im Korpus nicht als Kern (`yu`). */
const PLACE_WORDS = new Set(
  PLACES.flatMap((p) => [p.name, p.adj ?? ""])
    .flatMap((n) => fold(n).split(/\s+/))
    .filter((w) => w.length >= 4),
);

interface CorpusEntry {
  label: string;
  /** Schluessel fuer den Vergleich (Kernwort und zusammengeschriebener Kern) */
  tokens: string[];
  /** Woerter, die nur genau gleich zaehlen (Kerne aus mehreren Woertern) */
  exact: string[];
  person: boolean;
}

/** Korpus als Vergleichseintraege (`yr`). */
const CORPUS: readonly CorpusEntry[] = CORPUS_BRANDS.map((b) => {
  let words = fold(b.kern.replace(/[()|.+&]/g, " "))
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !CORPUS_STOP.has(w) && !PLACE_WORDS.has(w));
  if (b.person && words.length > 1) words = words.slice(-1);
  const joined = fold(b.kern.replace(/[()|.+&]/g, "")).replace(/\s+/g, "");
  const single = words.length === 1;
  return {
    label: b.kern,
    tokens: [...new Set([...(single ? words : []), ...(joined.length >= 4 ? [joined] : [])])],
    exact: single ? [] : words,
    person: !!b.person,
  };
});

interface TokenRef {
  k: string;
  b: number;
  m: number;
}
/** Vergleichsschluessel nach Laenge (`mr`). */
const BY_LENGTH = new Map<number, TokenRef[]>();
/** Woerter mehrteiliger Kerne, die nur genau gleich zaehlen (`dn`). */
const EXACT = new Map<string, number>();
CORPUS.forEach((entry, i) => {
  for (const k of entry.tokens) {
    const list = BY_LENGTH.get(k.length) ?? [];
    list.push({ k, b: i, m: letterMask(k) });
    BY_LENGTH.set(k.length, list);
  }
  for (const w of entry.exact) if (!EXACT.has(w)) EXACT.set(w, i);
});
const MAX_TOKEN = Math.max(0, ...BY_LENGTH.keys());
/** Woerter, die bei Kunstwoertern nicht als Naehe zaehlen (`rn`). */
const CORPUS_SOFT: ReadonlySet<string> = new Set([
  "wohnen",
  "besser",
  "seit",
  "immobilien",
  "land",
  "studio",
  "estate",
  "site",
  "collection",
  "soehne",
]);

const CORPUS_CACHE = new Map<string, BrandMatch | null>();

/** Naechste Korpusmarke zum Namen, nur Name (`Tu`). */
export function corpusMatchLabel(text: string, loose = false): string | null {
  return corpusMatchCached(text, loose, false)?.label ?? null;
}

/**
 * Naehe zum Marken-Korpus oder zu Tech-Marken (`_r`): Korpus zuerst, eine gleiche
 * Tech-Marke geht einer nur aehnlichen Korpusmarke vor. `loose` (Kunstwoerter) laesst
 * Abstand 2 bei langen Namen gelten und ueberspringt weiche Woerter.
 */
export function corpusMatch(text: string, loose = false): BrandMatch | null {
  return corpusMatchCached(text, loose, true);
}

function corpusMatchCached(text: string, loose: boolean, withTech: boolean): BrandMatch | null {
  const key = `${loose ? 1 : 0}${withTech ? 1 : 0}|${text}`;
  const hit = CORPUS_CACHE.get(key);
  if (hit !== undefined) return hit;
  const out = withTech
    ? preferExact(corpusMatchUncached(text, loose, withTech), text, loose)
    : corpusMatchUncached(text, loose, withTech);
  if (CORPUS_CACHE.size > 20000) CORPUS_CACHE.clear();
  CORPUS_CACHE.set(key, out);
  return out;
}

/** `yn`: Index der besten Korpusmarke als gleich, aehnlich oder Teilwort. */
function corpusMatchUncached(text: string, loose: boolean, soft: boolean): BrandMatch | null {
  const words = fold(text)
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  const joined = words.join("");
  const keys = [...new Set([...words, joined])];
  let same = Infinity;
  let similar = Infinity;
  let part = Infinity;
  for (const w of keys) {
    const mask = letterMask(w);
    const exact = EXACT.get(w);
    if (exact !== undefined && !(soft && CORPUS_SOFT.has(w))) part = Math.min(part, exact);
    for (let len = w.length - 2; len <= w.length + 2; len++)
      for (const { k, b, m } of BY_LENGTH.get(len) ?? []) {
        if (soft && CORPUS_SOFT.has(k)) continue;
        if (w === k) {
          if (w === joined) same = Math.min(same, b);
          else part = Math.min(part, b);
        } else if (b < similar && Math.max(w.length, k.length) >= 5 && bitCount(mask ^ m) <= 4) {
          const dist = levenshteinMax(w, k, 2);
          if (
            dist <= 1 ||
            (loose && !CORPUS[b]!.person && Math.max(w.length, k.length) >= 6 && dist <= 2)
          )
            similar = b;
        }
      }
    for (let len = 5; len <= Math.min(w.length, MAX_TOKEN); len++)
      for (const { k, b } of BY_LENGTH.get(len) ?? [])
        if (b < part && w !== k && w.includes(k) && !(soft && CORPUS_SOFT.has(k))) part = b;
  }
  if (same !== Infinity) return { label: CORPUS[same]!.label, art: "gleich" };
  const best = Math.min(similar, part);
  return best === Infinity
    ? null
    : { label: CORPUS[best]!.label, art: best === similar ? "aehnlich" : "teilwort" };
}

// ---------------------------------------------------------------------------
// Naehe zu Tech-Marken

interface TechEntry {
  label: string;
  flat: string;
  m: number;
  person: boolean;
}

/** Tech-Marken ab drei Buchstaben (`Re`). */
const TECH: readonly TechEntry[] = TECH_BRANDS.map((b) => {
  const flatKey = fold(b.kern.replace(/[()|.+&]/g, " ")).replace(/\s+/g, "");
  return { label: b.kern, flat: flatKey, m: letterMask(flatKey), person: !!b.person };
}).filter((e) => e.flat.length >= 3);
const TECH_INDEX = new Map<string, number>();
TECH.forEach((e, i) => {
  if (!TECH_INDEX.has(e.flat)) TECH_INDEX.set(e.flat, i);
});

/** Naehe zu einer Tech-Marke (`Du`). */
export function techMatch(text: string, loose = false): BrandMatch | null {
  const words = fold(text)
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  const joined = words.join("");
  const exact = TECH_INDEX.get(joined);
  if (exact !== undefined) return { label: TECH[exact]!.label, art: "gleich" };
  let similar = Infinity;
  let part = Infinity;
  for (const w of new Set([...words, joined])) {
    const idx = TECH_INDEX.get(w);
    if (idx !== undefined && w.length >= 4) part = Math.min(part, idx);
    const mask = letterMask(w);
    for (let i = 0; i < TECH.length && i < similar; i++) {
      const e = TECH[i]!;
      if (
        e.flat === w ||
        Math.abs(e.flat.length - w.length) > 2 ||
        Math.max(w.length, e.flat.length) < 6 ||
        bitCount(mask ^ e.m) > 4
      )
        continue;
      const dist = levenshteinMax(w, e.flat, 2);
      if (dist <= 1 || (loose && !e.person && Math.max(w.length, e.flat.length) >= 6 && dist <= 2))
        similar = i;
    }
    for (let i = 0; i < TECH.length && i < part; i++)
      if (TECH[i]!.flat.length >= 6 && w !== TECH[i]!.flat && w.includes(TECH[i]!.flat)) part = i;
  }
  const best = Math.min(similar, part);
  return best === Infinity
    ? null
    : { label: TECH[best]!.label, art: best === similar ? "aehnlich" : "teilwort" };
}

/** Korpus-Treffer, ausser eine Tech-Marke ist gleich (`Pu`). */
function preferExact(match: BrandMatch | null, text: string, loose: boolean): BrandMatch | null {
  if (match?.art === "gleich") return match;
  const tech = techMatch(text, loose);
  return tech?.art === "gleich" ? tech : (match ?? tech);
}
