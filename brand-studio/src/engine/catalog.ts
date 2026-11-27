/**
 * Katalog der Generierung: Stile und Layouts, Zufallshelfer, Saat und ID eines Konzepts, Schriftlisten
 * je Stil (Namen, Zusatz, Fliesstext, Monogramm) und ihre Gewichte (engine `Fi` ... `ct`).
 */
import type { LogoInput } from "./logoTypes";
import type {
  FontMeta,
  FontRef,
  LayoutKey,
  LogoConcept,
  StyleKey,
} from "../types";
import type { Rng } from "./rng";
import { COMMON_FONTS, FONTS } from "./fonts";
import { HIGH_END_STYLES } from "./highend";
import { cleanText } from "./cleanText";
import { fontBlocked, routeOf } from "./route";
import { fontCovers } from "./charset";
import { fontForm } from "./tracking";
import { hash } from "./rng";
import { weightClass } from "./recipes";

export const STYLES: StyleKey[] = [
  "elegant",
  "modern",
  "luxus",
  "warm",
  "mutig",
  "natur",
];

export const LAYOUTS: LayoutKey[] = ["inline", "stacked", "wordmark", "badge"];

export const mixSeed = (...parts: number[]) =>
  parts.reduce(
    (n, t) => Math.imul(n ^ (t >>> 0), 2654435761) >>> 0,
    625341585,
  ) >>> 0;

export function weightedPick<T>(
  rnd: Rng,
  items: readonly T[],
  weight: (item: T) => number,
): T {
  const r = items.map(weight);
  let i = rnd.next() * r.reduce((a, s) => a + s, 0);
  for (let a = 0; a < items.length; a++) {
    i -= r[a]!;
    if (i <= 0) return items[a]!;
  }
  return items[items.length - 1]!;
}

export const round3 = (e: any, n = 3) => Math.round(e * 10 ** n) / 10 ** n;

export const randomIn = (rnd: Rng, min: number, max: number) =>
  round3(min + rnd.next() * (max - min));

export const lightest = (font: FontMeta): FontRef => ({
  key: font.key,
  weight: Math.min(...font.weights),
});

export const heaviest = (font: FontMeta): FontRef => ({
  key: font.key,
  weight: Math.max(...font.weights),
});

export function inputSeed(input: LogoInput) {
  return hash(
    [
      cleanText(input.name).toLowerCase(),
      cleanText(input.suffix).toLowerCase(),
      [...input.styles].sort().join(","),
      [...input.colorMoods].sort().join(","),
      [...input.themes].sort().join(","),
    ].join("|"),
  );
}

export function conceptId(concept: any) {
  const { seed, ...t } = concept;
  const r = {
    ...t,
    id: undefined,
  };
  return `c${hash(JSON.stringify(r)).toString(36)}`;
}

export function withId(concept: any): LogoConcept {
  const n = {
    ...concept,
    id: "",
  };
  n.id = conceptId(n);
  return n;
}

const FONT_DAMPING = {
  ...Object.fromEntries(COMMON_FONTS.map((e) => [e, 0.12])),
  comfortaa: 0.25,
  quicksand: 0.5,
  syne: 0.7,
  greatvibes: 0.35,
  parisienne: 0.45,
  pinyon: 0.45,
  allura: 0.4,
  italianno: 0.4,
  cinzel: 0.5,
  unbounded: 0.5,
  fjalla: 0.6,
  bigshoulders: 0.7,
  poiret: 0.4,
  krona: 0.6,
  rozha: 0.7,
  abrilfatface: 0.8,
  yeseva: 0.8,
  funnel: 0.8,
  dmmono: 0.6,
  plexmono: 0.6,
  geistmono: 0.6,
};

const PREMIUM_FONTS = new Set([
  "playfair",
  "notoserifdisplay",
  "bodoni",
  "librebodoni",
  "ibarra",
  "caslontext",
  "crimson",
  "cormorant",
  "ebgaramond",
  "cormorantsc",
  "bellefair",
  "marcellus",
  "jost",
  "kumbh",
  "intertight",
  "geist",
  "hostgrotesk",
  "julius",
  "albertsans",
  "instrumentserif",
]);

export function fontWeightForStyle(font: FontMeta, style: string) {
  let t = (FONT_DAMPING as Record<string, any>)[font.key] ?? 1;
  const r = fontForm(font.key);
  if (style === "modern" || style === "natur") {
    if (r === "condensed" || Math.min(...font.weights) >= 600) {
      t *= 0.3;
    }
    if (r === "antiqua" || r === "didone") {
      t *= style === "natur" ? 2.5 : 0.3;
    }
    if (
      style === "natur" &&
      font.cat !== "serif" &&
      weightClass(lightest(font)) !== "light"
    ) {
      t *= 0.15;
    }
    if (style === "natur" && font.tags?.includes("kräftig")) {
      t *= 0.3;
    }
    if (
      style === "modern" &&
      font.tags?.includes("breit") &&
      font.tags?.includes("kräftig")
    ) {
      t *= 0.3;
    }
    if (r === "script") {
      t *= 0.3;
    }
    if (weightClass(lightest(font)) === "light") {
      t *= 3;
    }
  }
  if (style === "mutig" && r === "didone") {
    t *= 6;
  }
  if (style === "mutig" && r === "condensed") {
    t *= 0.4;
  }
  if (HIGH_END_STYLES.includes(style) && PREMIUM_FONTS.has(font.key)) {
    t *= 1.5;
  }
  return (style === "luxus" || style === "elegant") && font.cat === "serif"
    ? t * 1.6
    : t;
}

export const SUFFIX_FONTS = {
  luxus: [
    "tenor",
    "raleway",
    "josefin",
    "montserrat",
    "manrope",
    "hanken",
    "instrumentsans",
    "jost",
    "geist",
    "julius",
    "albertsans",
  ],
  elegant: [
    "raleway",
    "josefin",
    "tenor",
    "montserrat",
    "worksans",
    "manrope",
    "hanken",
    "instrumentsans",
    "jost",
    "geist",
    "kumbh",
  ],
  modern: [
    "inter",
    "manrope",
    "dmsans",
    "montserrat",
    "lexend",
    "jakarta",
    "worksans",
    "hanken",
    "schibsted",
    "figtree",
    "mona",
    "geist",
    "intertight",
    "hostgrotesk",
    "kumbh",
  ],
  warm: [
    "dmsans",
    "jakarta",
    "worksans",
    "poppins",
    "karla",
    "montserrat",
    "figtree",
    "albertsans",
    "hostgrotesk",
  ],
  mutig: [
    "montserrat",
    "inter",
    "archivo",
    "manrope",
    "spacegrotesk",
    "schibsted",
    "mona",
    "intertight",
    "hostgrotesk",
  ],
  natur: [
    "worksans",
    "karla",
    "josefin",
    "dmsans",
    "raleway",
    "albertsans",
    "hanken",
  ],
};

export const BODY_FONTS = {
  luxus: [
    "manrope",
    "inter",
    "lora",
    "worksans",
    "ebgaramond",
    "hanken",
    "geist",
    "crimson",
    "jost",
  ],
  elegant: [
    "lora",
    "manrope",
    "worksans",
    "inter",
    "spectral",
    "newsreader",
    "hanken",
    "crimson",
    "caslontext",
    "geist",
  ],
  modern: [
    "inter",
    "manrope",
    "dmsans",
    "lexend",
    "jakarta",
    "hanken",
    "schibsted",
    "figtree",
    "mona",
    "instrumentsans",
    "geist",
    "intertight",
    "hostgrotesk",
  ],
  warm: ["lora", "dmsans", "jakarta", "nunito", "karla", "castoro", "figtree"],
  mutig: ["inter", "archivo", "montserrat", "manrope", "schibsted", "mona"],
  natur: ["lora", "karla", "worksans", "dmsans", "albertsans", "spectral"],
};

export const MONOGRAM_SERIFS = [
  "bodoni",
  "cormorant",
  "playfair",
  "cinzel",
  "marcellus",
  "dmserif",
  "baskerville",
  "gilda",
  "caslon",
  "ebgaramond",
  "gloock",
  "librebodoni",
  "notoserifdisplay",
  "ibarra",
];

export function fontFitsName(font: FontMeta, input: LogoInput) {
  const t = cleanText(input.name);
  return fontCovers(font.key, t) && !(font.cat === "script" && t.length >= 25);
}

function fontFitsStyle(font: FontMeta, style: string) {
  const t = fontForm(font.key);
  return style === "luxus" && font.cat !== "serif"
    ? t === "geometric" &&
        (weightClass(lightest(font)) === "light" || !!font.capsOnly)
    : style === "mutig" && t === "antiqua"
      ? false
      : style === "mutig" && t === "didone"
        ? !!font.tags?.includes("kräftig")
        : true;
}

export function fontsForStyle(style: string, input?: LogoInput): FontMeta[] {
  const t = FONTS.filter(
    (o) =>
      o.styles.includes(style as StyleKey) &&
      !(style === "luxus" && o.cat === "script") &&
      fontFitsStyle(o, style),
  );
  if (!input) return t;
  const r = routeOf(input) ? t.filter((o) => !fontBlocked(o.key, input)) : t;
  const i = (o: any) => fontFitsName(o, input);
  const a = r.filter(i);
  if (a.length) return a;
  const s = FONTS.filter((o) => i(o) && !fontBlocked(o.key, input));
  return s.length ? s : r.length ? r : t;
}

export function coveringFonts(keys: string[], ...texts: string[]) {
  const t = keys.filter((r) => fontCovers(r, ...texts));
  return t.length ? t : keys;
}
