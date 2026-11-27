/**
 * Logo-Generator: Konzepte erzeugen (`generateConcepts`), Galerie-Pools je Seite
 * (`curationCandidates` mit Rezepten, Signature-Vorlagen, gezeichneten Monogrammen und Eingriffen),
 * Kuratierung (`curateConcepts` mit Qualitaetsschwelle `qualityThreshold` und `leitPass`) und
 * Seiten-Pakete (`curatedPackage`). Bitgenau wie der engine-Chunk der gesicherten Fassung.
 */
import type {
  CaseKey,
  Eingriff,
  FontMeta,
  FontRef,
  LogoConcept,
  MonogramKonstruktion,
  Palette,
  SymbolTheme,
  TextStyle,
} from "../types";
import type {
  CandidateOptions,
  CurateOptions,
  GenerateOptions,
  LogoInput,
} from "./logoTypes";
import type { FontStore } from "./fontStore";
import type { Rng } from "./rng";
import { ALL_ICONS, getIcon, iconsFor } from "../symbols/Icons";
import {
  ALL_TEMPLATES,
  KIT_TEMPLATES,
  fits,
  getSignatureTemplate,
  signatureConcept,
  signatureFonts,
} from "../signature/index";
import {
  BLOCKED_ICONS,
  HIGH_END_STYLES,
  antiPatterns,
  corpusTwin,
  fontFamilies,
  legalProximity,
} from "./highend";
import {
  BODY_FONTS,
  LAYOUTS,
  MONOGRAM_SERIFS,
  STYLES,
  SUFFIX_FONTS,
  coveringFonts,
  fontWeightForStyle,
  fontsForStyle,
  heaviest,
  inputSeed,
  lightest,
  mixSeed,
  randomIn,
  round3,
  weightedPick,
  withId,
} from "./catalog";
import {
  CLICHE_THEMES,
  fontGroupOf,
  fontKey,
  getFont,
  getSelectableFont,
  hasSerifItalic,
  isSelectableVariant,
  italicVariant,
  supportsCapSharpS,
} from "./fonts";
import { CONTAINERS } from "../symbols/containers";
import {
  DETAIL_KINDS,
  allLongWords,
  applyTypoExtras,
  endingJoint,
  isLongWord,
  nameWords,
  pickTypo,
  typoExtrasFit,
  typoKind,
} from "./typoExtras";
import {
  EINGRIFFE_AUS,
  GEZEICHNET,
  eingriffOf,
  konstruktionOf,
  possibleEingriffe,
} from "./eingriffe";
import { GENERIC_WORDS, isPersonName } from "./personName";
import {
  KONSTRUKTIONEN,
  KONSTRUKTIONEN_AUS,
  availableKonstruktionen,
} from "../symbols/drawnMonogram";
import {
  LEIT_KLASSE,
  allowedMoods,
  axisFit,
  containerBlocked,
  fontAxes,
  fontBlocked,
  kindMixOf,
  leitAbstand,
  leitMerkmale,
  paletteAxes,
  paletteBlocked,
  routeFit,
  routeOf,
  routedInput,
  splitByShares,
  templateAxes,
  templateBaseId,
  templateBlocked,
  templateInRoute,
  themesBlocked,
} from "./route";
import { NAME_FONTS_PER_PAGE, extraCut, fontPlan } from "./nameCards";
import { RECIPES, getRecipe, recipeAcceptsFont } from "./recipes";
import {
  SEPARATOR_RE,
  applyNameFormat,
  conceptFonts,
  initials,
  renderLogo,
  resolveColors,
  typoFonts,
} from "./renderLogo";
import {
  TRACKING_STEPS,
  defaultTracking,
  fontForm,
  isCaps,
  snapTracking,
  suffixTracking,
} from "./tracking";
import {
  applySuffixPairing,
  suffixPairingOf,
  suffixPairingsFor,
} from "./suffixPairings";
import {
  basePalettes,
  moodOfPaletteId,
  moodsFor,
  paletteBaseId,
  paletteForMood,
} from "./palettes";
import { checkLogo } from "./logoCheck";
import { cleanText } from "./cleanText";
import { contrast, sanitizePalette } from "./color";
import { fontCovers } from "./charset";
import { hasYellowAndRed } from "../signature/render";
import { hash, rng } from "./rng";
import { qualityScore, scoreFeatures } from "./quality";
import { tasteFactor, tasteProfile, tasteScore } from "./taste";
import { templateVariants } from "../signature/varianten";

const RECIPE_SHARE = 0.88;

export function conceptKey(concept: LogoConcept) {
  const n =
    concept.layout === "wordmark"
      ? "-"
      : concept.symbol
        ? (concept.symbol.kind === "icon"
            ? concept.symbol.id
            : `m${concept.symbol.font.key}`) + concept.symbol.container
        : "-";
  return [
    concept.layout,
    n,
    concept.name.font.key,
    concept.name.case,
    typoKind(concept),
  ].join("|");
}

function capsTracking(font: FontRef, style: string, rnd: Rng) {
  const r = fontForm(font.key);
  const i = style === "luxus" || style === "elegant";
  let a;
  if (r === "didone") {
    a = randomIn(rnd, -0.03, 0.02);
  } else if (r === "antiqua") {
    a = rnd.chance(i ? 0.45 : 0.3)
      ? randomIn(rnd, -0.02, 0.02)
      : i
        ? randomIn(rnd, 0.1, 0.2)
        : randomIn(rnd, 0.08, 0.14);
  } else if (r === "condensed" || r === "mono") {
    a = randomIn(rnd, -0.02, 0.04);
  } else if (font.weight >= 700 && rnd.chance(style === "mutig" ? 0.6 : 0.3)) {
    a = randomIn(rnd, -0.05, -0.01);
  } else {
    a =
      style === "luxus"
        ? randomIn(rnd, 0.15, 0.22)
        : i || style === "modern"
          ? randomIn(rnd, 0.12, 0.2)
          : randomIn(rnd, 0.09, 0.16);
  }
  return snapTracking(font, "upper", a);
}

function nameTypography(meta: FontMeta, style: string, rnd: Rng): TextStyle {
  let r: CaseKey = "title";
  let i;
  const a =
    style === "mutig"
      ? 0.9
      : style === "modern"
        ? 0.08
        : style === "warm"
          ? 0.45
          : style === "natur"
            ? 0.06
            : 0.15;
  i = rnd.chance(a) ? heaviest(meta) : lightest(meta);
  if (meta.cat === "script")
    return {
      font: lightest(meta),
      case: "title",
      tracking: 0,
    };
  if (meta.capsOnly)
    return {
      font: i,
      case: "upper",
      tracking: capsTracking(i, style, rnd),
    };
  let o = {
    luxus: 0.6,
    elegant: 0.4,
    modern: 0.4,
    mutig: 0.55,
    warm: 0.15,
    natur: 0.3,
  }[style];
  if (
    ["italiana", "marcellus", "tenor", "cinzel", "bellefair"].includes(meta.key)
  ) {
    o = Math.max(o!, 0.6);
  }
  if (meta.cat === "serif" && (style === "luxus" || style === "elegant")) {
    o = Math.min(
      o!,
      fontForm(meta.key) === "didone" ||
        meta.key === "italiana" ||
        meta.key === "marcellus" ||
        meta.key === "bellefair"
        ? 0.45
        : 0.25,
    );
  }
  if (meta.key === "comfortaa") {
    o = 0;
  }
  if (rnd.chance(o!)) {
    r = "upper";
    if (
      style !== "mutig" &&
      fontForm(meta.key) !== "didone" &&
      rnd.chance(0.7)
    ) {
      i = lightest(meta);
    }
    return {
      font: i,
      case: r,
      tracking: capsTracking(i, style, rnd),
    };
  }
  if (
    meta.cat === "sans" &&
    (style === "modern" || style === "mutig") &&
    rnd.chance(0.15)
  ) {
    i = heaviest(meta);
    return {
      font: i,
      case: "lower",
      tracking: snapTracking(i, "lower", -0.03),
    };
  }
  const l =
    meta.cat === "serif"
      ? 0
      : i.weight >= 600
        ? randomIn(rnd, -0.04, -0.02)
        : randomIn(rnd, -0.02, 0);
  return {
    font: i,
    case: r,
    tracking: snapTracking(i, r, l),
  };
}

function pickFont(rnd: Rng, keys: string[]) {
  return getFont(rnd.pick(keys));
}

export function typography(
  meta: FontMeta,
  style: string,
  rnd: Rng,
  input?: LogoInput,
  slot?: any,
) {
  const a = nameTypography(meta, style, rnd);
  let s;
  let o;
  const l = cleanText(input?.suffix);
  const u = cleanText(input?.tagline);
  const m = coveringFonts(
    (SUFFIX_FONTS as Record<string, any>)[style].filter(
      (b: any) => b !== meta.key,
    ),
    l,
  );
  const h = fontCovers(meta.key, l);
  if (slot) {
    a.font = slot.name;
    o =
      (meta.cat === "serif" || meta.cat === "sans") &&
      meta.key !== "italiana" &&
      h &&
      !(meta.cat === "serif" && HIGH_END_STYLES.includes(style)) &&
      !(style === "mutig" && slot.name.weight >= 600) &&
      rnd.chance(meta.cat === "serif" ? 0.35 : 0.55)
        ? slot.name
        : slot.suffix;
    s = getFont(o.key);
  } else if (meta.cat === "script") {
    s = pickFont(rnd, m);
    o = lightest(s);
  } else if (meta.cat === "serif") {
    if (
      rnd.chance(0.3) &&
      !HIGH_END_STYLES.includes(style) &&
      meta.key !== "italiana" &&
      h
    ) {
      s = meta;
      o = lightest(s);
    } else {
      s = pickFont(rnd, m);
      o = lightest(s);
    }
  } else if (
    meta.cat === "sans" &&
    meta.weights.length > 1 &&
    h &&
    rnd.chance(0.6)
  ) {
    s = meta;
    o = lightest(s);
  } else {
    s = pickFont(rnd, m.length ? m : coveringFonts(SUFFIX_FONTS.modern, l));
    o = lightest(s);
  }
  let p = "upper";
  let g =
    style === "mutig"
      ? randomIn(rnd, 0.12, 0.22)
      : style === "luxus"
        ? randomIn(rnd, 0.18, 0.3)
        : randomIn(rnd, 0.14, 0.26);
  if (
    (style === "warm" || style === "natur" || style === "modern") &&
    !s.capsOnly &&
    rnd.chance(0.14) &&
    meta.cat !== "script" &&
    a.case !== "upper"
  ) {
    p = "title";
    g = 0.01;
  }
  if (s.key === "bebas") {
    g = Math.min(g, 0.2);
  }
  g = suffixTracking(p, g, o);
  const w = {
    font: o,
    case: p,
    tracking: g,
  };
  const x = [cleanText(input?.name), l, u];
  let y;
  if (s.body && fontCovers(s.key, ...x)) {
    y = {
      key: s.key,
      weight: Math.min(...s.weights),
    };
  } else if (meta.body && fontCovers(meta.key, ...x)) {
    y = {
      key: meta.key,
      weight: Math.min(...meta.weights),
    };
  } else {
    y = lightest(
      getFont(
        rnd.pick(
          coveringFonts((BODY_FONTS as Record<string, any>)[style], ...x),
        ),
      ),
    );
  }
  const d = {
    font: (s.body || s.cat === "sans") && fontCovers(s.key, u) ? o : y,
    case: "asis",
    tracking: 0.02,
  };
  return {
    name: a,
    suffix: w,
    tagline: d,
    body: y,
  };
}

const CONTAINER_BY_STYLE = {
  luxus: 1,
  elegant: 0.8,
  modern: 0.6,
  warm: 0.8,
  natur: 0.8,
  mutig: 1,
};

const CONTAINER_CHANCE = 0.3;

export function isClicheIcon(icon: any, themes: string[]) {
  return (
    icon.themes.some((t: any) => CLICHE_THEMES.includes(t)) &&
    !icon.themes.some((t: any) => themes.includes(t))
  );
}

export const FILLED_CHANCE = {
  luxus: 0.12,
  elegant: 0.15,
  modern: 0.25,
  warm: 0.2,
  natur: 0.2,
  mutig: 0.4,
};

export function initialIconFits(icon: any, name: string) {
  const t = /^initial-([a-z])(?:-|$)/.exec(icon.id);
  return t
    ? ((i) =>
        i
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase())(initials(name, 2)).includes(t[1])
    : !(icon.themes.length === 1 && icon.themes[0] === "initialen");
}

export function iconsForInput(
  themes: any,
  style: string,
  name: string = "",
  anyStyle: boolean = false,
  input?: any,
) {
  const a = iconCandidates(themes, style, name, anyStyle);
  return !input || !routeOf(input)
    ? a
    : a.filter(
        (s: any) =>
          !themesBlocked(s.themes, input) &&
          !ROUTE_BLOCKED_ICONS.test(s.id) &&
          !s.themes.some(
            (o: any) => CLICHE_THEMES.includes(o) && !themes.includes(o),
          ),
      );
}

const ROUTE_BLOCKED_ICONS =
  /^(natur-wellen|natur-zweig|abstrakt-kreissegmente)$|diamant/;

function iconCandidates(
  themes: any,
  style: string,
  name: string = "",
  anyStyle: boolean = false,
) {
  let i = themes.filter((o: any) => o !== "initialen");
  if (!i.length) {
    const o = ALL_ICONS.filter((u) => BLOCKED_ICONS.includes(u.id));
    const l = o.filter((u) => u.styles.includes(style));
    return (l.length >= 2 || !anyStyle) && l.length ? l : o;
  }
  const a = (o: any) =>
    o.filter(
      (l: any) =>
        initialIconFits(l, name) &&
        !isClicheIcon(l, themes) &&
        !(style === "luxus" && /diamant/.test(l.id)),
    );
  let s = a(iconsFor(i, anyStyle ? [] : [style]));
  if (!s.length) {
    s = a(iconsFor(i, []));
  }
  if (!s.length) {
    s = a(iconsFor([], [style]));
  }
  if (!s.length) {
    s = a(ALL_ICONS.slice());
  }
  if (!s.length) {
    s = ALL_ICONS.slice();
  }
  if (themes.includes("initialen"))
    for (const o of ALL_ICONS) {
      if (
        /^initial-/.test(o.id) &&
        initialIconFits(o, name) &&
        !s.includes(o)
      ) {
        s.push(o);
      }
    }
  return s;
}

function monogramChance(themes: string[]) {
  return themes.length
    ? themes.includes("initialen")
      ? themes.length === 1
        ? 1
        : 0.4
      : 0.08
    : 0.45;
}

export function containersForInput(
  style: string,
  themes: string[] = [],
  filled: boolean = false,
  input?: any,
) {
  const i = containerCandidates(style, themes, filled);
  if (!input || !routeOf(input)) return i;
  const a = i.filter((s) => !containerBlocked(s, input));
  return a.length ? a : i;
}

function containerCandidates(
  style: string,
  themes: string[] = [],
  filled: boolean = false,
) {
  const r = themes.some((o) => CLICHE_THEMES.includes(o as SymbolTheme));
  const i = (o: any) =>
    o !== "none" &&
    (r || (o !== "house" && o !== "shield")) &&
    (!filled || (o !== "square" && o !== "rounded")) &&
    !(
      (style === "luxus" || style === "elegant") &&
      (o === "diamond" || o === "hexagon" || o === "shield" || o === "house")
    );
  const a = CONTAINERS.filter((o) => i(o.key) && o.styles.includes(style)).map(
    (o) => o.key,
  );
  if (a.length) return a;
  const s = CONTAINERS.filter((o) => i(o.key)).map((o) => o.key);
  return s.length
    ? s
    : CONTAINERS.filter((o) => o.key !== "none").map((o) => o.key);
}

export function monogramFont(
  font: FontRef,
  style: string,
  rnd: Rng,
  letters: string = "",
  planned?: any,
) {
  const a = getFont(font.key);
  if (planned?.length) {
    const o = planned.filter(
      (m: any) => getFont(m.key).cat !== "script" && fontCovers(m.key, letters),
    );
    const l = o.filter((m: any) => getFont(m.key).cat === "serif");
    const u = o.find(
      (m: any) => m.key === font.key && m.weight === font.weight,
    );
    if (
      u &&
      !(
        (style === "luxus" || style === "elegant") &&
        a.cat !== "serif" &&
        l.length &&
        rnd.chance(0.6)
      )
    )
      return u;
    if (
      (style === "luxus" || style === "elegant" || a.cat === "script") &&
      l.length
    )
      return rnd.pick(l);
    if (o.length) return u ?? o[0];
  }
  if (
    !fontCovers(a.key, letters) ||
    a.cat === "script" ||
    ((style === "luxus" || style === "elegant") &&
      a.cat !== "serif" &&
      rnd.chance(0.6))
  ) {
    const o = getFont(rnd.pick(coveringFonts(MONOGRAM_SERIFS, letters)));
    return style === "luxus"
      ? lightest(o)
      : rnd.pick([lightest(o), heaviest(o)]);
  }
  return a.cat === "sans" || a.cat === "display" ? heaviest(a) : font;
}

function pickSymbol(
  input: LogoInput,
  style: string,
  font: FontRef,
  rnd: Rng,
  icon: any,
  mono: any,
  planned: any,
) {
  const o = monogramLetters(input, style !== "mutig" && rnd.chance(0.5));
  const l =
    (mono ?? (!icon || rnd.chance(monogramChance(input.themes)))) &&
    (!!o || !icon);
  const u = containersForInput(style, input.themes, l, input);
  const h =
    l &&
    rnd.chance(
      CONTAINER_CHANCE * (CONTAINER_BY_STYLE as Record<string, any>)[style],
    )
      ? rnd.pick(u)
      : "none";
  const p =
    h !== "none" &&
    !["square", "rounded"].includes(h) &&
    rnd.chance((FILLED_CHANCE as Record<string, any>)[style]);
  if (l) {
    const g = o ?? initials(input.name, 1);
    return {
      symbol: {
        kind: "monogram",
        letters: g,
        container: h,
        font: monogramFont(font, style, rnd, g, planned),
      },
      filled: p,
    };
  }
  if (!icon) {
    const g = o ?? initials(input.name, 1);
    return {
      symbol: {
        kind: "monogram",
        letters: g,
        container: h,
        font: monogramFont(
          font,
          style,
          rng(hash(`${g}|${font.key}`)),
          g,
          planned,
        ),
      },
      filled: p,
    };
  }
  return {
    symbol: {
      kind: "icon",
      id: icon.id,
      container: h,
    },
    filled: p,
  };
}

const LAYOUT_WEIGHTS = {
  luxus: {
    inline: 0.2,
    stacked: 0.35,
    wordmark: 0.6,
    badge: 0,
  },
  elegant: {
    inline: 0.25,
    stacked: 0.35,
    wordmark: 0.4,
    badge: 0.03,
  },
  modern: {
    inline: 0.45,
    stacked: 0.25,
    wordmark: 0.25,
    badge: 0.04,
  },
  mutig: {
    inline: 0.4,
    stacked: 0.3,
    wordmark: 0.2,
    badge: 0.05,
  },
  warm: {
    inline: 0.35,
    stacked: 0.35,
    wordmark: 0.2,
    badge: 0.05,
  },
  natur: {
    inline: 0.3,
    stacked: 0.35,
    wordmark: 0.2,
    badge: 0,
  },
};

function pickBadge(style: string, hasSuffix: boolean, rnd: Rng) {
  const r =
    style === "mutig"
      ? {
          frame: 0,
          seal: 0.7,
          arch: 0.3,
        }
      : style === "warm" || style === "natur"
        ? {
            frame: 0,
            seal: 0.4,
            arch: 0.6,
          }
        : {
            frame: 0,
            seal: 0.5,
            arch: 0.5,
          };
  if (!hasSuffix) {
    r.seal = 0;
  }
  return weightedPick(
    rnd,
    ["frame", "arch", "seal"],
    (i) => (r as Record<string, any>)[i],
  );
}

export function pickDivider(
  layout: string,
  style: string,
  hasSuffix: boolean,
  kase: string,
  rnd: Rng,
) {
  const a = style === "luxus" || style === "elegant";
  if (layout === "inline")
    return !hasSuffix && kase !== "upper" && rnd.chance(0.15)
      ? "dot"
      : rnd.chance(a ? 0.5 : 0.35)
        ? "line"
        : "none";
  if (!hasSuffix) {
    const o = rnd.next();
    return o < 0.2 ? "line" : o < 0.38 && kase !== "upper" ? "dot" : "none";
  }
  const s = rnd.next();
  return s < (a ? 0.5 : 0.35) ? "line" : s < (a ? 0.7 : 0.55) ? "dot" : "none";
}

export function pickColors(palette: Palette, style: string, rnd: Rng) {
  const r = (l: any, u: any) => contrast(l, palette.paper) >= u;
  const i = r(palette.accent, 3) && rnd.chance(0.15) ? "accent" : "primary";
  const s =
    r(palette.primary, 4.5) &&
    rnd.chance(style === "mutig" || style === "modern" ? 0.45 : 0.3)
      ? "primary"
      : "ink";
  const o = [];
  if (s === "ink") {
    o.push("primary", "primary");
    if (r(palette.accent, 3)) {
      o.push("accent");
    }
    o.push("ink");
  } else {
    o.push("ink", "ink");
    if (r(palette.accent, 3)) {
      o.push("accent");
    }
  }
  return {
    symbol: i,
    name: s,
    suffix: rnd.pick(o),
  };
}

export function monogramLetters(input: any, pair: boolean = true) {
  const t = (m: any) => !!m && /^[A-HK-Z]$/.test(m);
  const r = input.themes.includes("initialen");
  const i = (m: any) => !!m && new RegExp("^\\p{Lu}$", "u").test(m);
  const a = (m: any) => {
    return Array.from<string>(
      m.replace(/^[^\p{L}]+/u, ""),
    )[0]?.toLocaleUpperCase("de-AT");
  };
  const s = nameWords(input.name).filter(
    (m) =>
      new RegExp("\\p{L}", "u").test(m) &&
      !GENERIC_WORDS.has(m.toLocaleLowerCase("de-AT")),
  );
  if (!s.length) return null;
  if (!isPersonName(input)) {
    const m = a(s[0]);
    return t(m) ? m : null;
  }
  const o = a(s[0]);
  const l = a(s[s.length - 1]);
  const u =
    s.length > 1 && (r ? i(o) && i(l) : t(o) && t(l)) ? `${o}${l}` : null;
  return pair && u ? u : t(o) ? o : t(l) ? l : u;
}

export function isShortBrandName(input: any) {
  const n = nameWords(input.name);
  if (n.length !== 1 || isPersonName(input)) return false;
  const t = Array.from(n[0]!).filter((r) =>
    new RegExp("\\p{L}", "u").test(r),
  ).length;
  return t >= 4 && t <= 8;
}

function pickCardBackground(palette: Palette, rnd: Rng) {
  const t = rnd.next();
  return t < 0.62
    ? "paper"
    : t < 0.84 || contrast(palette.primary, palette.paper) < 4.5
      ? "ink"
      : "primary";
}

function primaryCardReadable(palette: Palette) {
  return (
    Math.max(
      contrast(palette.paper, palette.primary),
      contrast("#FFFFFF", palette.primary),
      contrast(palette.ink, palette.primary),
      contrast("#111111", palette.primary),
    ) >= 4.5
  );
}

/** Kartenflaeche eines Konzepts: Hintergrund, Variante und Grund (`qs`, Export `h`). */
export function cardFace(concept: LogoConcept) {
  const n = sanitizePalette(concept.palette);
  return concept.cardBackground === "ink"
    ? {
        background: n.ink,
        variant: "reverse",
        ground: n.ink,
      }
    : concept.cardBackground === "primary"
      ? primaryCardReadable(n)
        ? {
            background: n.primary,
            variant: "reverse",
            ground: n.primary,
          }
        : {
            background: n.ink,
            variant: "reverse",
            ground: n.ink,
          }
      : {
          background: n.paper,
          variant: "color",
        };
}

/** Ein Konzept aus Stil, Layout, Schriften, Zeichen, Palette und Typo-Detail bauen, danach reparieren (`Zi`). */
export function buildConcept(input: LogoInput, seed: number, options: any) {
  const rnd = rng(seed);
  const style = options.style;
  const hasSuffix = !!cleanText(input.suffix);
  const nameMeta = options.slot
    ? getFont(options.slot.name.key)
    : (options.nameFont ??
      weightedPick(rnd, fontsForStyle(style, input), (T) =>
        fontWeightForStyle(T, style),
      ));
  const typo = typography(nameMeta, style, rnd, input, options.slot);
  const recipe = options.recipe;
  if (recipe) {
    applyRecipeTypography(typo, recipe, input, rnd);
  }
  const layoutWish =
    options.layout ??
    weightedPick(
      rnd,
      LAYOUTS,
      (T) => (LAYOUT_WEIGHTS as Record<string, any>)[style][T],
    );
  const icon =
    options.icon ??
    rnd.pick(iconsForInput(input.themes, style, input.name, false, input));
  const symbolPick = pickSymbol(
    input,
    style,
    typo.name.font,
    rnd,
    icon,
    options.mono,
    options.slot?.planned,
  );
  const sansName = !["antiqua", "didone"].includes(
    fontForm(typo.name.font.key),
  );
  const layout =
    !icon && !monogramLetters(input) && !options.noSymbol
      ? "wordmark"
      : layoutWish === "inline" &&
          symbolPick.symbol.kind === "monogram" &&
          sansName &&
          !options.noSymbol
        ? "stacked"
        : layoutWish;
  const palette =
    options.palette ??
    paletteForMood(
      rnd.pick(allowedMoods(moodsFor(input, style), input)),
      style,
      rnd,
    );
  const colors = pickColors(palette, style, rnd);
  const badge =
    layout === "badge" ? pickBadge(style, hasSuffix, rnd) : undefined;
  let symbol = symbolPick.symbol;
  let filled = symbolPick.filled;
  if (layout === "wordmark") {
    symbol = {
      kind: "monogram",
      letters: initials(input.name, 2),
      container: "none",
      font: typo.name.font,
    };
    filled = false;
  }
  if (layout === "badge") {
    symbol = {
      ...symbol,
      container: "none",
    };
    filled = rnd.chance((FILLED_CHANCE as Record<string, any>)[style] * 0.6);
  }
  const extra = options.slot
    ? options.slot.extra
    : extraCut(typo.name.font, rnd);
  const detail = pickTypo(
    {
      input,
      style,
      layout,
      name: typo.name,
      suffix: typo.suffix,
      palette,
      colors,
      extra,
      icon:
        symbolPick.symbol.kind === "icon" &&
        !options.noSymbol &&
        input.themes.some((T) => T !== "initialen")
          ? icon
          : undefined,
      district: options.nameFormat === "district" && !!cleanText(input.place),
      upperFormat: options.nameFormat === "upper",
    },
    rnd,
    options.typoUsage,
    options.typoKind,
    options.needDetail && !recipe?.extras?.sup,
    options.noMark,
    options.markFallback,
  );
  let divider = pickDivider(
    layout,
    style,
    hasSuffix,
    (detail.name ?? typo.name).case,
    rnd,
  );
  if (detail.divider) {
    divider = detail.divider;
  }
  if (detail.symbol) {
    symbol = detail.symbol;
    filled = false;
  }
  const isElegant = style === "luxus" || style === "elegant";
  let symbolPosition;
  let symbolSize;
  if (
    !options.noSymbol &&
    layout === "inline" &&
    rnd.chance(isElegant ? 0.12 : 0.2)
  ) {
    symbolPosition = "right";
  }
  if (!options.noSymbol && layout === "stacked") {
    if (!isElegant && rnd.chance(0.12)) {
      symbolPosition = "below";
    }
    const T = rnd.next();
    if (T < 0.22) {
      symbolSize = "small";
    } else if (T < (isElegant ? 0.42 : 0.36)) {
      symbolSize = "large";
    }
  }
  if (recipe) {
    if (recipe.divider) {
      divider = recipe.divider;
    }
    if (recipe.symbolPosition) {
      symbolPosition = recipe.symbolPosition;
    }
    if (recipe.symbolSize) {
      symbolSize = recipe.symbolSize;
    }
    if (recipe.container && symbol.kind === "monogram") {
      symbol = {
        ...symbol,
        container: recipe.container,
      };
    }
  }
  if (symbol.kind === "monogram" && layout === "inline") {
    if (symbolPosition === "right") {
      symbolPosition = undefined;
    }
    if (divider === "line") {
      divider = "none";
    }
  }
  const conceptColors = recipe ? recipeColors(recipe, colors, palette) : colors;
  const concept = {
    seed,
    style,
    layout,
    symbol: options.noSymbol ? null : symbol,
    name: detail.name ?? typo.name,
    suffix: typo.suffix,
    tagline: typo.tagline,
    body: typo.body,
    palette,
    colors: conceptColors,
    divider,
    symbolFilled: filled,
    ...(badge
      ? {
          badge: recipe?.badge ?? badge,
        }
      : {}),
    ...(detail.typo
      ? {
          typo: detail.typo,
        }
      : {}),
    cardBackground: pickCardBackground(palette, rnd),
    ...(options.nameFormat && options.nameFormat !== "full"
      ? {
          nameFormat: options.nameFormat,
        }
      : {}),
    ...(symbolPosition
      ? {
          symbolPosition,
        }
      : {}),
    ...(symbolSize
      ? {
          symbolSize,
        }
      : {}),
    ...(recipe && (recipe.typo === "plain" || detail.kind === recipe.typo)
      ? {
          recipeId: recipe.id,
        }
      : {}),
  };
  const withExtras = recipe?.extras
    ? applyTypoExtras(concept as LogoConcept, recipe.extras, input)
    : maybeSuffixPairing(concept as LogoConcept, input, options, seed);
  return withId(
    withLegalProximity(
      dropInvisibleAccents(
        avoidCorpusTwin(repairConcept(withExtras, input), input),
      ),
      input,
    ),
  );
}

export function finishConcept(concept: LogoConcept, input: LogoInput) {
  return withId(withLegalProximity(repairConcept(concept, input), input));
}

export function withLegalProximity(concept: LogoConcept, input: LogoInput) {
  const t = legalProximity(
    {
      ...concept,
      id: "",
    },
    input,
  );
  if (t)
    return {
      ...concept,
      legalNaehe: t,
    };
  if (!concept.legalNaehe) return concept;
  const r = {
    ...concept,
  };
  delete r.legalNaehe;
  return r;
}

const SUFFIX_PAIRING_CHANCE = 0.3;

function maybeSuffixPairing(
  concept: LogoConcept,
  input: LogoInput,
  options: any,
  seed: number,
) {
  const i = cleanText(input.suffix);
  if (
    !i ||
    concept.layout === "badge" ||
    concept.typo?.inlineSuffix ||
    concept.nameFormat === "surname" ||
    concept.nameFormat === "district" ||
    (concept.typo?.split?.font &&
      concept.typo.split.font.key === concept.suffix.font.key)
  )
    return concept;
  const a = rng(mixSeed(seed, 24346));
  const s = options.recipe?.suffix.pairing;
  if (!s && !a.chance(SUFFIX_PAIRING_CHANCE)) return concept;
  const o = options.slot
    ? [
        ...options.slot.planned,
        ...(options.slot.pageExtra ? [options.slot.pageExtra] : []),
      ]
    : null;
  const l = suffixPairingsFor(concept, i, o, a).filter(
    (f) => !s || f.p.id === s,
  );
  if (!l.length) return concept;
  const u = a.pick(l);
  const m = applySuffixPairing(concept, u.p, u.font, a);
  const h = (f: any) =>
    antiPatterns(
      {
        ...f,
        id: "",
      },
      input,
    ).length;
  const p = (f: any) =>
    fontFamilies(
      {
        ...f,
      },
      input,
    ).size;
  return h(m) <= h(concept) && p(m) <= Math.max(2, p(concept)) ? m : concept;
}

function applyRecipeTypography(
  typo: any,
  recipe: any,
  input: LogoInput,
  rnd: Rng,
) {
  const i = getFont(typo.name.font.key);
  if (i.cat !== "script") {
    const s = i.capsOnly ? "upper" : recipe.name.case;
    typo.name = {
      ...typo.name,
      case: s,
      tracking: snapTracking(
        typo.name.font,
        s,
        randomIn(rnd, recipe.name.tracking[0], recipe.name.tracking[1]),
      ),
    };
  }
  const a = cleanText(input.suffix);
  if (
    recipe.suffix.font === "same" &&
    i.cat !== "script" &&
    typo.name.font.weight < 600 &&
    fontCovers(typo.name.font.key, a)
  ) {
    typo.suffix = {
      ...typo.suffix,
      font: typo.name.font,
    };
  }
  typo.suffix = {
    ...typo.suffix,
    case: recipe.suffix.case,
    tracking: suffixTracking(
      recipe.suffix.case,
      randomIn(rnd, recipe.suffix.tracking[0], recipe.suffix.tracking[1]),
      typo.suffix.font,
    ),
  };
}

function recipeColors(recipe: any, colors: any, palette: Palette) {
  return recipe.color === "mono"
    ? {
        ...colors,
        suffix: colors.name === "ink" ? "ink" : colors.name,
      }
    : recipe.color === "accent-suffix" &&
        colors.name === "ink" &&
        contrast(palette.primary, palette.paper) >= 4.5
      ? {
          ...colors,
          suffix: "primary",
        }
      : colors;
}

/** Regeln nach dem Bau: Layout, Schreibschrift, scharfes S, Laufweiten, Farben hochwertiger Marken (`pr`). */
export function repairConcept(
  concept: LogoConcept,
  input: LogoInput,
): LogoConcept {
  return fixSharpS(
    fixTypography(
      fixSharpS(fixScript(concept, input) as LogoConcept, input),
      input,
    ) as LogoConcept,
    input,
  );
}

export function allowsRule(input: LogoInput) {
  const n = nameWords(input.name);
  const t = Array.from(cleanText(input.name)).filter((r) =>
    new RegExp("\\p{L}", "u").test(r),
  ).length;
  return n.length >= 2 || t >= 9;
}

function selectableWeight(font: FontRef) {
  if (isSelectableVariant(font) || getFont(font.key).nurVorlage) return font;
  const n = getSelectableFont(font.key).weights;
  const t = n.reduce(
    (r, i) => (Math.abs(i - font.weight) < Math.abs(r! - font.weight) ? i : r),
    n[0],
  );
  return {
    key: font.key,
    weight: t,
  };
}

const NO_BADGE_ICONS = ["abstrakt-kreissegmente"];

const NO_STAMP_CONTAINERS = ["circle", "ring", "hexagon", "arch"];

function fixLayout(concept: LogoConcept, input: LogoInput): LogoConcept {
  let t: any = concept;
  if (t.symbol && NO_STAMP_CONTAINERS.includes(t.symbol.container)) {
    t = {
      ...t,
      symbol: {
        ...t.symbol,
        container: "none",
      },
      symbolFilled: false,
    };
  }
  if (t.layout === "badge" && t.badge === "arch")
    if (cleanText(input.suffix))
      t = {
        ...t,
        badge: "seal",
      };
    else {
      const g = {
        ...t,
        layout: "stacked",
      };
      delete g.badge;
      t = g;
    }
  if (
    t.layout === "badge" &&
    t.symbol?.kind === "icon" &&
    NO_BADGE_ICONS.includes(t.symbol.id)
  ) {
    const g = {
      ...t,
      layout: "wordmark",
      symbol: {
        kind: "monogram",
        letters: initials(input.name, 2),
        container: "none",
        font: t.name.font,
      },
    };
    delete g.badge;
    t = g;
  }
  if (t.divider === "dot" && cleanText(input.suffix)) {
    t = {
      ...t,
      divider: "none",
    };
  }
  if (
    !isSelectableVariant(t.name.font) ||
    !isSelectableVariant(t.suffix.font) ||
    (t.typo?.split?.font && !isSelectableVariant(t.typo.split.font))
  ) {
    t = {
      ...t,
      name: {
        ...t.name,
        font: selectableWeight(t.name.font),
      },
      suffix: {
        ...t.suffix,
        font: selectableWeight(t.suffix.font),
      },
    };
    const g = t.typo?.split;
    if (g?.font) {
      t = {
        ...t,
        typo: {
          ...t.typo,
          split: {
            ...g,
            font: selectableWeight(g.font),
          },
        },
      };
    }
  }
  if (!allowsRule(input)) {
    if (t.typo?.rule || t.typo?.mark === "macron") {
      const g = {
        ...t.typo,
      };
      delete g.rule;
      if (g.mark === "macron") {
        delete g.mark;
      }
      t = {
        ...t,
        typo: Object.keys(g).length ? g : undefined,
      };
    }
    if (t.divider === "line" && t.layout !== "inline") {
      t = {
        ...t,
        divider: "none",
      };
    }
  }
  const r = t.typo?.split;
  if (
    r?.font?.style === "italic" &&
    !hasSerifItalic(r.font.key) &&
    r.font.key === t.name.font.key
  ) {
    const { font, ...w } = r;
    const x = w.case || w.color || w.stack || w.tracking !== undefined;
    const y = {
      ...t.typo,
    };
    if (x) {
      y.split = w;
    } else {
      delete y.split;
    }
    t = {
      ...t,
      typo: Object.keys(y).length ? y : undefined,
    };
  }
  if (t.typo?.ampersand && !hasSerifItalic(t.typo.ampersand.key)) {
    const g = {
      ...t.typo,
    };
    delete g.ampersand;
    t = {
      ...t,
      typo: Object.keys(g).length ? g : undefined,
    };
  }
  return t;
}

function fixTypography(concept: LogoConcept, input: LogoInput) {
  const t = fixLayout(concept, input);
  const r = {
    ...t,
    name: {
      ...t.name,
      tracking: snapTracking(
        t.name.font,
        t.name.case,
        t.name.tracking,
        TRACKING_STEPS,
        isShortBrandName(input),
      ),
    },
  };
  const i = fontForm(r.name.font.key);
  if (
    (r.style === "modern" || r.style === "natur") &&
    i === "condensed" &&
    !getFont(r.name.font.key).capsOnly
  ) {
    r.name = {
      ...r.name,
      case: "upper",
      tracking: snapTracking(r.name.font, "upper", 0.11),
    };
  }
  if (r.style === "mutig") {
    if (
      i === "condensed" &&
      r.name.font.weight >= 600 &&
      r.name.case === "lower"
    ) {
      r.name = {
        ...r.name,
        case: "upper",
        tracking: snapTracking(r.name.font, "upper", 0),
      };
    }
    if (cleanText(input.suffix)) {
      r.suffix = {
        ...r.suffix,
        case: "upper",
        tracking: round3(Math.max(0.18, Math.min(0.3, r.suffix.tracking))),
      };
    }
    if (r.name.font.weight >= 600 && r.symbolFilled) {
      r.symbolFilled = false;
    }
  }
  const a = r.typo?.split;
  if (a && (a.case || a.tracking !== undefined || a.font)) {
    const y = a.font ?? r.name.font;
    const f = a.case ?? r.name.case;
    const d = a.tracking ?? r.name.tracking;
    const b = round3(
      (a.scale ?? 1) <= 0.8
        ? suffixTracking(f, d, y)
        : snapTracking(y, f, d, null),
    );
    if (a.tracking !== undefined || Math.abs(b - d) > 0.001) {
      r.typo = {
        ...r.typo,
        split: {
          ...a,
          tracking: b,
        },
      };
    }
  }
  r.suffix = {
    ...r.suffix,
    tracking: round3(
      suffixTracking(
        r.suffix.case,
        r.suffix.tracking,
        r.suffix.font,
        r.typo?.suffixScale,
      ),
    ),
  };
  if (r.name.case === "lower" && r.typo?.split?.color) {
    const { color, ...f } = r.typo.split;
    const d =
      f.font ||
      f.case ||
      f.stack ||
      f.tracking !== undefined ||
      f.scale !== undefined;
    const b = {
      ...r.typo,
      split: d ? f : undefined,
    };
    if (!d) {
      delete b.split;
    }
    r.typo = Object.keys(b).length ? b : undefined;
  }
  if (!HIGH_END_STYLES.includes(r.style)) {
    if (isCaps(r.name.font, r.name.case) && r.name.tracking >= 0.12) {
      const d = snapTracking(r.name.font, r.name.case, 0.1);
      const b = getFont(r.name.font.key).capsOnly;
      if (d < 0.12) {
        r.name = {
          ...r.name,
          tracking: d,
        };
      } else if (b) {
        if (
          getFont(r.suffix.font.key).cat !== "script" &&
          !getFont(r.suffix.font.key).capsOnly &&
          fontCovers(r.suffix.font.key, input.name)
        ) {
          r.name = {
            font: r.suffix.font,
            case: "title",
            tracking: snapTracking(r.suffix.font, "title", 0),
          };
        }
      } else {
        r.name = {
          ...r.name,
          case: "title",
          tracking: snapTracking(r.name.font, "title", 0),
        };
      }
    }
    const y = r.typo?.split;
    const f = y?.case ?? r.name.case;
    if (y && (y.case || y.font) && isCaps(y.font ?? r.name.font, f)) {
      const d = y.font ?? r.name.font;
      const b = y.tracking ?? r.name.tracking;
      let z =
        (y.scale ?? 1) <= 0.8
          ? Math.min(0.1, suffixTracking(f, b, d))
          : snapTracking(d, f, Math.min(b, 0.1), null);
      if (z >= 0.12) {
        z = snapTracking(d, f, -0.01, null);
      }
      r.typo = {
        ...r.typo,
        split:
          z < 0.12
            ? {
                ...y,
                tracking: round3(z),
              }
            : {
                ...y,
                case: undefined,
                font: undefined,
                tracking: undefined,
              },
      };
    }
    return r;
  }
  const s = r.symbol;
  if (
    s?.kind === "monogram" &&
    r.layout !== "wordmark" &&
    fontFamilies(r, input).size > 2
  ) {
    const y = [r.name.font, r.suffix.font].find(
      (f) => getFont(f.key).cat !== "script" && fontCovers(f.key, s.letters),
    );
    if (y) {
      r.symbol = {
        ...s,
        font: y,
      };
    }
  }
  if (r.style === "luxus" || r.style === "elegant") {
    const y = !!r.symbol && (r.layout !== "wordmark" || !!r.typo?.letterSwap);
    const f = () => {
      return new Set([
        r.colors.name,
        ...(cleanText(input.suffix) ? [r.colors.suffix] : []),
        ...(y ? [r.colors.symbol] : []),
        ...(r.typo?.split?.color ? [r.typo.split.color] : []),
        ...(r.typo?.markColor ? [r.typo.markColor] : []),
      ]);
    };
    if (f().size > 2) {
      const d =
        r.colors.suffix !== r.colors.name ? r.colors.suffix : r.colors.symbol;
      if (d === "primary" || d === "accent" || d === "secondary") {
        r.colors = {
          ...r.colors,
          symbol: d,
          suffix: r.colors.suffix === r.colors.name ? r.colors.suffix : d,
        };
      }
    }
    if (f().size > 2 && r.typo?.markColor) {
      r.typo = {
        ...r.typo,
        markColor: undefined,
      };
    }
    if (f().size > 2) {
      r.colors = {
        ...r.colors,
        suffix: r.colors.name,
      };
    }
    if (f().size > 2 && r.typo?.split?.color) {
      const { color, ...b } = r.typo.split;
      r.typo = {
        ...r.typo,
        split: b,
      };
    }
  }
  return r;
}

function fixSharpS(concept: LogoConcept, input: LogoInput) {
  const t = cleanText(input.name);
  if (!t.includes("ß")) return concept;
  let r = concept;
  const i = r.typo?.split;
  if (
    i?.case === "upper" &&
    !supportsCapSharpS((i.font ?? r.name.font).key, t)
  ) {
    const { case: o, ...l } = i;
    r = {
      ...r,
      typo: {
        ...r.typo,
        split: l,
      },
    };
  }
  if (supportsCapSharpS(r.name.font.key, t)) return r;
  if (getFont(r.name.font.key).capsOnly) {
    const o = [r.suffix.font, r.body].find(
      (l) =>
        !getFont(l.key).capsOnly &&
        getFont(l.key).cat !== "script" &&
        fontCovers(l.key, t),
    );
    if (o) {
      r = {
        ...r,
        name: {
          font: o,
          case: "title",
          tracking: snapTracking(o, "title", 0),
        },
      };
    }
  } else if (r.name.case === "upper") {
    r = {
      ...r,
      name: {
        ...r.name,
        case: "title",
        tracking: snapTracking(r.name.font, "title", 0),
      },
    };
  }
  return r;
}

function fixScript(concept: LogoConcept, input: LogoInput) {
  if (getFont(concept.name.font.key).cat !== "script") return concept;
  const t = concept.typo?.split;
  if (t?.font && getFont(t.font.key).cat !== "script") return concept;
  const r = [concept.suffix.font, concept.body].find(
    (s) =>
      getFont(s.key).cat !== "script" &&
      !getFont(s.key).capsOnly &&
      fontCovers(s.key, input.name),
  );
  if (!r) return concept;
  const i = concept.typo
    ? {
        ...concept.typo,
        split: undefined,
      }
    : undefined;
  if (i) {
    delete i.split;
  }
  return {
    ...concept,
    name: {
      font: r,
      case: "title",
      tracking: snapTracking(r, "title", 0),
    },
    typo: i && Object.keys(i).length ? i : undefined,
  };
}

function avoidCorpusTwin(concept: LogoConcept, input: LogoInput) {
  let t = concept;
  const r = (a: any) =>
    [a.suffix.font, a.body].find(
      (s) =>
        s.key !== a.name.font.key &&
        !getFont(s.key).capsOnly &&
        getFont(s.key).cat !== "script" &&
        fontCovers(s.key, input.name),
    );
  for (let a = 0; a < 3 && corpusTwin(t, input); a++) {
    const s = getFont(t.name.font.key);
    const o = isCaps(t.name.font, t.name.case) || t.nameFormat === "upper";
    if (o && !s.capsOnly && a === 0)
      t = {
        ...t,
        name: {
          ...t.name,
          case: "title",
          tracking: snapTracking(t.name.font, "title", 0),
        },
        nameFormat: t.nameFormat === "upper" ? undefined : t.nameFormat,
      };
    else if (!o && !s.noCaps && s.cat !== "script" && a === 0)
      t = {
        ...t,
        name: {
          ...t.name,
          case: "upper",
          tracking: defaultTracking(t.name.font, "upper"),
        },
      };
    else if (a === 2 && r(t)) {
      const l = r(t);
      t = {
        ...t,
        name: {
          ...t.name,
          font: l,
          case: "title",
          tracking: snapTracking(l, "title", 0),
        },
        nameFormat: t.nameFormat === "upper" ? undefined : t.nameFormat,
        typo: undefined,
      };
    } else {
      const l = t.name.tracking >= 0.09;
      const u = snapTracking(t.name.font, t.name.case, l ? -0.01 : 0.17);
      t = {
        ...t,
        name: {
          ...t.name,
          tracking: u,
        },
        typo: {
          ...(t.typo ?? {}),
          ...(t.typo?.mark
            ? {}
            : {
                rule: "over",
              }),
        },
      };
    }
  }
  return t;
}

export function accentsVisible(concept: LogoConcept, background: any) {
  if (!concept.typo?.split?.color && !concept.typo?.markColor) return true;
  const t = {
    ...concept,
    cardBackground: background,
  };
  const r = cardFace(t);
  const i = resolveColors(t, r.variant, r.ground);
  return (
    (!concept.typo?.split?.color ||
      i.split.toLowerCase() !== i.name.toLowerCase()) &&
    (!concept.typo?.markColor || i.mark.toLowerCase() !== i.name.toLowerCase())
  );
}

export function dropInvisibleAccents(concept: LogoConcept) {
  const n = concept.typo?.split;
  if (!(!!n?.color || !!concept.typo?.markColor)) return concept;
  const r = (u: any) => {
    const m = cardFace(u);
    const h = resolveColors(u, m.variant, m.ground);
    return {
      split:
        !u.typo?.split?.color || h.split.toLowerCase() !== h.name.toLowerCase(),
      mark: !u.typo?.markColor || h.mark.toLowerCase() !== h.name.toLowerCase(),
    };
  };
  let i = concept;
  let a = r(i);
  if ((!a.split || !a.mark) && (i.cardBackground ?? "paper") !== "paper") {
    i = {
      ...i,
      cardBackground: "paper",
    };
    a = r(i);
  }
  if (!a.split && n) {
    const { color, ...m } = n;
    const h =
      m.font ||
      m.case ||
      m.stack ||
      m.tracking !== undefined ||
      m.scale !== undefined;
    const p = {
      ...i.typo,
    };
    if (h) {
      p.split = m;
    } else {
      delete p.split;
    }
    i = {
      ...i,
      typo: Object.keys(p).length ? p : undefined,
    };
  }
  if (!a.mark && i.typo?.markColor) {
    i = {
      ...i,
      typo: {
        ...i.typo,
        markColor: undefined,
      },
    };
  }
  return i;
}

/** Rezept-Konzepte einer Seite: Stile reihum, Arten (Wortmarke, Monogramm, Icon) nach Themen oder Route, Schriftplan, Rezepte, Paletten und Typo-Details; IDs ohne Seed (`Ga`, Export `g`). */
export function generateConcepts(
  rawInput: LogoInput,
  options: GenerateOptions,
) {
  const input = routedInput(rawInput);
  const route = routeOf(input);
  const seed = options.seed ?? inputSeed(input);
  const tasteProf = options.taste ? tasteProfile(options.taste) : null;
  const rnd = rng(mixSeed(seed, options.page, 31342));
  const styles = input.styles.length ? input.styles : STYLES;
  const styleOrder = rnd.shuffle(styles);
  const layoutUse = new Map();
  const iconUse = new Map();
  const paletteUse = new Map();
  const seenKeys = new Set();
  const concepts = [];
  const firstPage = options.page === 0;
  const mix = kindMixOf(input);
  const kinds = rnd.shuffle(
    mix
      ? kindsFromMix(options.count, mix, input)
      : kindsFromThemes(
          options.count,
          input.themes,
          firstPage,
          !!monogramLetters(input),
        ),
  );
  const wordBias = tasteProf
    ? (tasteProf.scores.get("symbol:no") ?? 0) -
      (tasteProf.scores.get("symbol:yes") ?? 0)
    : 0;
  const kindPlan = kinds.map((slot) =>
    slot !== "wordmark" && wordBias > 0.3 && rnd.chance(Math.min(0.8, wordBias))
      ? "wordmark"
      : slot,
  );
  const plan = fontPlan(input, seed, options.page, tasteProf);
  const formats = planNameFormats(
    kindPlan,
    input,
    rnd,
    plan.names.length,
    firstPage,
  );
  const plannedFonts = [...plan.names, plan.suffix];
  const fontUse = new Map();
  const typoUsage = new Map();
  const fontFormatUsed = new Set();
  const scriptOk = allLongWords(nameWords(input.name));
  const recipeUse = new Map();
  const otherCases = new Set();
  const lookUse = new Map();
  const shortName = isShortBrandName(input);
  const taste = options.taste ? tasteProfile(options.taste) : null;
  let detailCount = 0;
  let markCount = 0;
  for (let slot = 0; slot < options.count; slot++) {
    const style = styleOrder[slot % styleOrder.length];
    const slotRnd = rng(mixSeed(seed, options.page, slot, 423));
    const iconAsWord =
      style === "luxus" && kindPlan[slot] === "icon" && slotRnd.chance(0.5);
    const kind = iconAsWord ? "wordmark" : kindPlan[slot];
    const markFree = markCount < Math.floor(options.count / 6);
    const markKind =
      iconAsWord && markFree ? slotRnd.pick(["dot", "hairline"]) : undefined;
    const format = formats[slot];
    const needDetail =
      Math.min(4, options.count) - detailCount >= options.count - slot - 2;
    const recipeRnd = rng(mixSeed(seed, options.page, slot, 24257));
    const slotInfo = {
      style,
      kind,
      format,
      input,
      markFree,
      scriptOk,
      plan: plan.names,
      fontFormat: fontFormatUsed,
      used: recipeUse,
      taste,
      needDetail,
      extra: plan.extra,
      pageSuffix: plan.suffix,
      typoUsage,
      otherCase:
        otherCases.size < 2 && slot >= options.count - 3
          ? otherCases
          : undefined,
    };
    let recipe =
      shortName || recipeRnd.chance(RECIPE_SHARE)
        ? pickRecipe(recipeRnd, slotInfo)
        : undefined;
    let chosen = null;
    let lookFull = false;
    for (let attempt = 0; attempt < 8 && !chosen; attempt++) {
      if (lookFull && attempt >= 2 && attempt % 2 === 0) {
        recipe = pickRecipe(
          rng(mixSeed(seed, options.page, slot, attempt, 268)),
          slotInfo,
        );
      }
      const attemptSeed = mixSeed(seed, options.page, slot, attempt);
      const attemptRnd = rng(attemptSeed ^ 42405);
      const layoutChoices =
        kind === "wordmark"
          ? ["wordmark"]
          : LAYOUTS.filter((j) => j !== "wordmark");
      const layout = recipe
        ? recipe.layout
        : weightedPick(
            attemptRnd,
            layoutChoices,
            (j) =>
              (LAYOUT_WEIGHTS as Record<string, Record<string, number>>)[
                style!
              ]![j]! /
              (1 + (layoutUse.get(j) ?? 0) * 1.6),
          );
      const isWideCaps = (j: any) =>
        getFont(j.key).capsOnly && snapTracking(j, "upper", 0.1) >= 0.12;
      const nameFonts = plan.names.filter(
        (j) =>
          !fontFormatUsed.has(`${j.key}|${format}`) &&
          !(
            (format === "upper" || style === "luxus" || !scriptOk) &&
            getFont(j.key).cat === "script"
          ) &&
          !(!HIGH_END_STYLES.includes(style!) && isWideCaps(j)),
      );
      const unusedFonts = nameFonts.filter((j) => !fontUse.get(j.key));
      const styleFonts = nameFonts.filter((j) =>
        getFont(j.key).styles.includes(style!),
      );
      const anyFonts = plan.names.filter(
        (j) =>
          (HIGH_END_STYLES.includes(style!) || !isWideCaps(j)) &&
          !fontFormatUsed.has(`${j.key}|${format}`),
      );
      let candidates =
        unusedFonts.length && unusedFonts.length >= options.count - slot - 1
          ? unusedFonts
          : styleFonts.length
            ? styleFonts
            : nameFonts.length
              ? nameFonts
              : anyFonts.length
                ? anyFonts
                : plan.names;
      if (
        style === "mutig" &&
        !recipe &&
        (format === "stacked" || needDetail)
      ) {
        const j = candidates.filter((ke) => fontForm(ke.key) !== "didone");
        if (j.length) {
          candidates = j;
        }
      }
      const minUse = Math.min(
        ...candidates.map((j) => fontUse.get(j.key) ?? 0),
      );
      const activeRecipe = recipe;
      const recipeFonts = activeRecipe
        ? nameFonts.filter((j) => {
            return (
              recipeAcceptsFont(activeRecipe, j) &&
              getFont(j.key).styles.includes(style!) &&
              (!(RECIPE_EXTRA_STYLE as Record<string, any>)[
                activeRecipe.typo
              ] ||
                j.key === plan.extra?.key)
            );
          })
        : [];
      const pickByTaste = (j: any) =>
        taste
          ? weightedPick(
              attemptRnd,
              j,
              (ke: any) => tasteFactor(taste, `form:${fontForm(ke.key)}`) ** 2,
            )
          : attemptRnd.pick(j);
      const nameFont = recipeFonts.length
        ? pickByTaste(recipeFonts)
        : pickByTaste(
            candidates.filter(
              (j) =>
                (fontUse.get(j.key) ?? 0) === minUse || attempt > 3 || taste,
            ),
          );
      const fontSlot = {
        name: nameFont,
        suffix: plan.suffix,
        extra: plan.extra?.key === nameFont.key ? plan.extra : null,
        planned: plannedFonts,
        pageExtra: plan.extra,
      };
      const icons = iconsForInput(
        input.themes,
        style!,
        input.name,
        false,
        input,
      );
      let freshIcons = icons.filter((j: any) => !iconUse.has(j.id));
      if (!freshIcons.length) {
        freshIcons = iconsForInput(
          input.themes,
          style!,
          input.name,
          true,
          input,
        ).filter((j: any) => !iconUse.has(j.id));
      }
      const icon = weightedPick(
        attemptRnd,
        freshIcons.length ? freshIcons : icons,
        (j: any) => 1 / (1 + (iconUse.get(j.id) ?? 0) * 3),
      );
      const wantMonogram = recipe
        ? recipe.symbol === "monogram" ||
          (recipe.symbol === "icon" && !freshIcons.length)
        : kind === "monogram" || (kind === "icon" && !freshIcons.length);
      const moods = allowedMoods(moodsFor(input, style), input);
      const moodWeight = (j: any) => {
        return route?.colorMoods?.length
          ? ([3, 1.2, 0.8][route.colorMoods.indexOf(j)] ?? 0.5)
          : 1;
      };
      const pickMood = () => {
        return taste
          ? weightedPick(
              attemptRnd,
              moods,
              (ke) => tasteFactor(taste, `mood:${ke}`) * moodWeight(ke),
            )
          : route?.colorMoods?.length
            ? weightedPick(attemptRnd, moods, moodWeight)
            : attemptRnd.pick(moods);
      };
      let palette = paletteForMood(pickMood(), style!, attemptRnd);
      for (
        let j = 0;
        j < 4 && (paletteUse.get(paletteBaseId(palette)) ?? 0) > 0;
        j++
      )
        palette = paletteForMood(pickMood(), style!, attemptRnd);
      for (let j = 0; j < 8 && paletteBlocked(palette, input); j++)
        palette = paletteForMood(pickMood(), style!, attemptRnd);
      if (
        route &&
        (route.axes?.warmth?.sicher || route.axes?.saturation?.sicher)
      ) {
        const j = (ke: any) =>
          axisFit(route.axes, paletteAxes(ke), ["warmth", "saturation"]) -
          ((paletteUse.get(paletteBaseId(ke)) ?? 0) > 0 ? 0.5 : 0);
        for (let ke = 0; ke < 2; ke++) {
          const vr = paletteForMood(pickMood(), style!, attemptRnd);
          if (j(vr) > j(palette) && !paletteBlocked(vr, input)) {
            palette = vr;
          }
        }
      }
      const concept = buildConcept(input, attemptSeed, {
        style,
        layout,
        slot: fontSlot,
        icon,
        palette,
        mono: wantMonogram,
        typoUsage,
        nameFormat: format,
        needDetail,
        typoKind: recipe ? recipe.typo : markKind,
        noMark: !markFree,
        recipe,
      });
      const key = conceptKey(concept);
      const lookOk =
        (lookUse.get(lookKey(concept)) ?? 0) < Math.ceil(options.count / 5) ||
        attempt >= 6;
      lookFull = !lookOk;
      if ((!seenKeys.has(key) && lookOk) || attempt === 7) {
        chosen = concept;
        seenKeys.add(key);
      }
    }
    const picked = chosen!;
    lookUse.set(lookKey(picked), (lookUse.get(lookKey(picked)) ?? 0) + 1);
    concepts.push(picked);
    layoutUse.set(picked!.layout, (layoutUse.get(picked!.layout) ?? 0) + 1);
    fontUse.set(
      picked!.name.font.key,
      (fontUse.get(picked!.name.font.key) ?? 0) + 1,
    );
    typoUsage.set(typoKind(picked), (typoUsage.get(typoKind(picked)) ?? 0) + 1);
    fontFormatUsed.add(
      `${picked!.name.font.key}|${picked!.nameFormat ?? "full"}`,
    );
    if (DETAIL_KINDS.includes(typoKind(picked))) {
      detailCount++;
    }
    if (picked!.typo?.mark) {
      markCount++;
    }
    if (picked!.recipeId) {
      recipeUse.set(
        picked!.recipeId,
        (recipeUse.get(picked!.recipeId) ?? 0) + 1,
      );
    }
    otherCases.add(applyNameFormat(picked, input).concept.name.case);
    if (picked!.symbol?.kind === "icon" && picked!.layout !== "wordmark") {
      iconUse.set(picked!.symbol.id, (iconUse.get(picked!.symbol.id) ?? 0) + 1);
    }
    paletteUse.set(
      paletteBaseId(picked!.palette),
      (paletteUse.get(paletteBaseId(picked!.palette)) ?? 0) + 1,
    );
  }
  return spreadCardBackgrounds(concepts);
}

function recipeTypoKind(recipe: any, slot: any) {
  const t = {
    italic: "italic",
    weight: "weight",
    color: "color",
    stack: "stack",
    mix: "mix",
    camel: "camel",
    caps: "caps",
  };
  const r =
    recipe.typo === "rule"
      ? "rule"
      : recipe.typo === "dot"
        ? "dot"
        : recipe.typo === "hairline"
          ? "hairline"
          : recipe.divider === "line"
            ? "line"
            : "none";
  return Math.max(
    ...recipe.name.forms.map((i: any) => {
      return scoreFeatures({
        style: slot,
        form: i,
        weight:
          recipe.name.weight === "light"
            ? "light"
            : recipe.name.weight === "bold"
              ? "bold"
              : "regular",
        italic: recipe.typo === "italicAll" || recipe.typo === "italic",
        case:
          recipe.name.case === "upper"
            ? "upper"
            : recipe.name.case === "lower"
              ? "lower"
              : "mixed",
        split: (t as Record<string, any>)[recipe.typo] ?? "none",
        symbol: recipe.symbol,
        corpusIcon: recipe.symbol === "icon",
        container: !!recipe.container,
        filledSquare: false,
        layout: recipe.layout,
        badge: recipe.layout === "badge" ? (recipe.badge ?? "arch") : null,
        accent: r,
        format: recipe.formats?.[0] ?? "full",
        umlautInitial: false,
        scriptWhole: false,
        twoColorLower: false,
        recipe: true,
        issues: 0,
        twin: false,
      });
    }),
  );
}

export const RECIPE_EXTRA_STYLE = {
  italic: "italic",
  italicAll: "italic",
  amp: "italic",
  weight: "normal",
  mix: "italic",
};

function recipeTypoPossible(recipe: any, font: FontRef, slot: any) {
  const r = (RECIPE_EXTRA_STYLE as Record<string, any>)[recipe.typo];
  if (r) {
    const s = slot.extra;
    if (
      !s ||
      s.key !== font.key ||
      (s.style ?? "normal") !== r ||
      (r === "normal" && s.weight === font.weight)
    )
      return false;
  }
  const i = nameWords(slot.input.name);
  return !(
    (recipe.typo === "hairline" &&
      (i.length < 2 ||
        i.length > 3 ||
        !HIGH_END_STYLES.includes(slot.style))) ||
    ((recipe.typo === "stack" || recipe.typo === "mix") && i.length < 2) ||
    (recipe.typo === "mix" && (i.length !== 2 || !isLongWord(i[1], 4))) ||
    (recipe.typo === "camel" &&
      (i.length !== 2 ||
        !i.every((s) => Array.from(s).length >= 4) ||
        slot.extra?.key !== font.key)) ||
    (recipe.kurz && !isShortBrandName(slot.input)) ||
    (recipe.typo === "color" &&
      i.length < 2 &&
      endingJoint(i[0] ?? "") === undefined) ||
    (recipe.typo === "italic" && i.length < 2)
  );
}

function recipeSuffixPossible(recipe: any, slot: any) {
  const t = [
    ...slot.plan,
    ...(slot.pageSuffix ? [slot.pageSuffix] : []),
    ...(slot.extra ? [slot.extra] : []),
  ];
  switch (recipe.suffix.pairing) {
    case "mono":
      return t.some((r) => fontForm(r.key) === "mono");
    case "kursiv":
      return t.some(
        (r) => r.style === "italic" && getFont(r.key).cat === "serif",
      );
    case "fett-klein":
      return t.some(
        (r) =>
          getFont(r.key).cat === "sans" &&
          r.weight >= 600 &&
          r.style !== "italic" &&
          fontForm(r.key) !== "mono",
      );
    case "kapitaelchen":
      return t.some(
        (r) =>
          getFont(r.key).capsOnly === true && getFont(r.key).cat === "serif",
      );
    default:
      return true;
  }
}

export function pickRecipe(rnd: Rng, slot: any) {
  const t = nameWords(slot.input.name);
  const r = !!cleanText(slot.input.suffix);
  const i = cleanText(slot.input.name).split(" ").includes("&");
  const a = RECIPES.filter((l) => {
    return !l.styles.includes(slot.style) ||
      (slot.kind === "wordmark"
        ? l.symbol !== "none"
        : slot.kind === "monogram"
          ? l.symbol !== "monogram"
          : l.symbol === "none") ||
      (l.formats
        ? !l.formats.includes(slot.format)
        : slot.format === "monogram" && l.symbol !== "monogram") ||
      (slot.format === "upper" && l.name.case !== "upper") ||
      (l.person && !isPersonName(slot.input)) ||
      (l.symbol === "monogram" && !monogramLetters(slot.input)) ||
      (l.multi && t.length < 2) ||
      (l.amp && !i) ||
      (l.needsSuffix && !r) ||
      (l.suffix.pairing && !recipeSuffixPossible(l, slot)) ||
      (l.extras && !typoExtrasFit(l.extras, slot.input)) ||
      ((l.typo === "dot" || l.typo === "hairline") && !slot.markFree) ||
      (slot.needDetail && !DETAIL_KINDS.includes(l.typo) && !l.extras?.sup) ||
      (slot.otherCase &&
        slot.otherCase.has(l.name.case === "upper" ? "upper" : l.name.case)) ||
      (l.name.forms.includes("script") &&
        (!slot.scriptOk || slot.style === "luxus"))
      ? false
      : slot.plan.some(
          (m: any) =>
            recipeAcceptsFont(l, m) &&
            getFont(m.key).styles.includes(slot.style) &&
            !slot.fontFormat.has(`${m.key}|${slot.format}`) &&
            recipeTypoPossible(l, m, slot),
        );
  });
  if (!a.length) return;
  const s = isShortBrandName(slot.input) ? a.filter((l) => l.kurz) : [];
  if (s.length) {
    a.splice(0, a.length, ...s);
  }
  const o = (l: any) =>
    (l.gewicht ?? 1) *
    (slot.style === "luxus" || slot.style === "elegant"
      ? 1
      : Math.exp((recipeTypoKind(l, slot.style) - 72) / 3));
  return weightedPick(rnd, a, (l) => {
    const u = l.name.forms.reduce(
      (m, h) => Math.max(m, tasteFactor(slot.taste, `form:${h}`)),
      0,
    );
    return (
      routeRecipeFactor(l, slot.input) *
      o(l) *
      (1 / (1 + (slot.used.get(l.id) ?? 0) * 2.5)) *
      (1 /
        (1 +
          (slot.typoUsage.get(l.typo) ?? 0) * (l.typo === "plain" ? 3 : 6))) *
      tasteFactor(slot.taste, `recipe:${l.id}`) *
      u *
      tasteFactor(
        slot.taste,
        `case:${l.name.case === "upper" ? "upper" : l.name.case === "lower" ? "lower" : "mixed"}`,
      )
    );
  });
}

/** Hat das Konzept ein sichtbares Zeichen (keine Vorlage, kein reiner Schriftzug)? (`yt`, Export `a5`). */
export const hasSymbol = (concept: LogoConcept) =>
  !concept.signature && concept.layout !== "wordmark" && !!concept.symbol;

function medianQuality(
  concepts: LogoConcept[],
  input: LogoInput,
): number | null {
  const t = concepts
    .filter((r) => !r.signature && !hasSymbol(r))
    .map((r) => qualityScore(r, input))
    .sort((r, i) => r - i);
  return t.length ? t[Math.floor(t.length / 2)]! : null;
}

/** Qualitaetsschwelle: Konzepte mit Zeichen muessen mindestens den Median der Wortmarken erreichen (`Kc`). */
export function qualityThreshold(
  concepts: LogoConcept[],
  input: LogoInput,
  pinned: any,
  size: number = PAGE_SIZE,
) {
  const i = medianQuality(concepts, input);
  if (i === null) return concepts;
  const a = (u: any) => qualityScore(u, input);
  const s = new Set(
    concepts.filter((u) => u === pinned || !hasSymbol(u) || a(u) >= i),
  );
  const o = concepts.filter((u) => s.has(u));
  const l = concepts.filter((u) => !s.has(u)).sort((u, m) => a(m) - a(u));
  for (
    !routeOf(input) &&
    input.themes.some((u) => u !== "initialen") &&
    !o.some(hasSymbol) &&
    l.length &&
    s.add(l.shift()!);
    s.size < Math.min(size, concepts.length) && l.length;
  )
    s.add(l.shift()!);
  return concepts.filter((u) => s.has(u));
}

function spreadCardBackgrounds(concepts: LogoConcept[]) {
  if (concepts.length < 3) return concepts;
  const n = concepts.slice();
  const t = (i: any) => n.some((a) => (a.cardBackground ?? "paper") === i);
  const r = (i: any, a: any) =>
    (n[i] = withId({
      ...n[i],
      cardBackground: a,
    }));
  if (!t("primary")) {
    const i = n.findIndex(
      (a, s) =>
        s > 0 &&
        a.cardBackground !== "ink" &&
        contrast(a.palette.primary, a.palette.paper) >= 4.5 &&
        accentsVisible(a, "primary"),
    );
    if (i >= 0) {
      r(i, "primary");
    }
  }
  if (!t("ink")) {
    const i = n.findIndex(
      (a, s) =>
        s > 0 &&
        (a.cardBackground ?? "paper") === "paper" &&
        accentsVisible(a, "ink"),
    );
    if (i >= 0) {
      r(i, "ink");
    }
  }
  if (!t("paper")) {
    r(0, "paper");
  }
  return n;
}

export function serifDecided(input: any) {
  const n = routeOf(input)?.axes?.serif;
  return !!n && n.sicher >= 0.6 && Math.abs(n.v) >= 0.5;
}

export function routeFontFactor(meta: FontMeta, input: any) {
  const t = routeOf(input);
  return t
    ? Math.exp(
        2 *
          axisFit(t.axes, fontAxes(lightest(meta)), [
            "serif",
            "contrast",
            "width",
            "weight",
          ]),
      ) * leitKlasseFactor(fontForm(meta.key), t)
    : 1;
}

function leitKlasseFactor(form: string, route: any) {
  const t = route.fontForms ?? [];
  if (!t.length) return 1;
  const r = (LEIT_KLASSE as Record<string, any>)[form];
  return (LEIT_KLASSE as Record<string, any>)[t[0]] === r
    ? 4
    : t.some((i: any) => (LEIT_KLASSE as Record<string, any>)[i] === r)
      ? 1.8
      : 1;
}

const FORM_AXES = {
  didone: {
    serif: 1,
    contrast: 1,
  },
  antiqua: {
    serif: 1,
    contrast: 0.1,
  },
  slab: {
    serif: 0.5,
    contrast: -0.6,
  },
  geometric: {
    serif: -1,
    contrast: -1,
  },
  grotesk: {
    serif: -1,
    contrast: -1,
  },
  condensed: {
    serif: -1,
    contrast: -1,
    width: -1,
  },
  extended: {
    serif: -1,
    contrast: -1,
    width: 1,
  },
  mono: {
    serif: 0,
    contrast: -1,
  },
  script: {
    serif: 0,
    contrast: 0.3,
  },
};

function routeRecipeFactor(recipe: any, input: any) {
  const t = routeOf(input);
  if (!t) return 1;
  const r = recipe.name.forms
    .map((o: any) => (FORM_AXES as Record<string, any>)[o])
    .filter((o: any) => !!o);
  const i = (o: any) =>
    r.length
      ? r.reduce((l: any, u: any) => l + (u[o] ?? 0), 0) / r.length
      : undefined;
  const a = (recipe.name.tracking[0] + recipe.name.tracking[1]) / 2;
  const s = {
    caps: recipe.name.case === "upper" ? 1 : -1,
    tracking: a >= 0.12 ? 1 : a >= 0.05 ? 0.3 : a <= -0.005 ? -1 : -0.4,
    serif: i("serif"),
    contrast: i("contrast"),
    width: i("width"),
    weight:
      recipe.name.weight === "light"
        ? -0.8
        : recipe.name.weight === "bold"
          ? 0.8
          : recipe.name.weight === "regular"
            ? -0.2
            : undefined,
    symbol: recipe.symbol === "none" ? -1 : 1,
  };
  return Math.exp(2 * axisFit(t.axes, s));
}

function kindsFromMix(count: number, mix: any, input: LogoInput) {
  const [r, i, a] = splitByShares(count, [
    mix.wortmarke,
    mix.monogramm,
    mix.zeichen,
  ]);
  const s = input.themes.some((u) => u !== "initialen" && u !== "abstrakt");
  const o = !!monogramLetters(input);
  const l = [];
  for (let u = 0; u < r!; u++) l.push("wordmark");
  for (let u = 0; u < i!; u++) l.push(o ? "monogram" : s ? "icon" : "wordmark");
  for (let u = 0; u < a!; u++) l.push(s ? "icon" : o ? "monogram" : "wordmark");
  for (
    let u = l.length - 1;
    u >= 0 && l.filter((m) => m === "wordmark").length < Math.ceil(count / 3);
    u--
  ) {
    if (l[u] !== "wordmark") {
      l[u] = "wordmark";
    }
  }
  return l;
}

function kindsFromThemes(
  count: number,
  themes: string[],
  firstPage: boolean = false,
  monogramOk: boolean = true,
) {
  const i = themes.length === 1 && themes[0] === "initialen";
  const a = monogramOk
    ? themes.includes("initialen")
      ? Math.min(4, Math.round((count * 2) / 12))
      : firstPage && !themes.length
        ? 0
        : Math.min(1, count)
    : 0;
  const s =
    i && monogramOk
      ? 0
      : themes.length
        ? Math.max(
            0,
            count - a - Math.max(Math.min(4, count), Math.round(count / 3)),
          )
        : firstPage
          ? 0
          : Math.floor(count * 0.25);
  const o = Math.max(0, count - a - s);
  const l = [];
  for (let u = 0; u < count; u++)
    l.push(u < o ? "wordmark" : u < o + a ? "monogram" : "icon");
  return l;
}

function planNameFormats(
  kinds: string[],
  input: LogoInput,
  rnd: Rng,
  nameFonts: number = NAME_FONTS_PER_PAGE,
  firstPage: boolean = false,
) {
  const a = kinds.filter((x) => x !== "monogram").length;
  const s = nameWords(input.name);
  const o = isPersonName(input);
  const l = ["upper"];
  if (s.length >= 2) {
    l.push("stacked");
  }
  if (o && !/[^A-Za-z]/.test(Array.from(s[0] ?? "")[0] ?? "")) {
    l.push("initial");
  }
  if (o && cleanText(input.suffix) && !firstPage) {
    l.push("surname");
  }
  if (cleanText(input.place) && !SEPARATOR_RE.test(cleanText(input.suffix))) {
    l.push("district");
  }
  const u = [];
  for (let x = 0; x < Math.min(3, a); x++) u.push("full");
  for (const x of l) {
    if (u.length < a) {
      u.push(x);
    }
  }
  const m = isShortBrandName(input);
  const h = (x: any) =>
    x === "district"
      ? 2
      : x === "initial" || (x === "upper" && m)
        ? 1
        : nameFonts;
  const p = ["full", ...l];
  for (let x = 0; u.length < a && x < a * p.length; x++) {
    const y = p[x % p.length];
    if (u.filter((f) => f === y).length < h(y)) {
      u.push(y);
    }
  }
  for (; u.length < a; ) u.push("full");
  const g = rnd.shuffle(u);
  let w = 0;
  return kinds.map((x) => (x === "monogram" ? "monogram" : g[w++]));
}

/** Alle Schnitte, die die Konzepte brauchen (`logo`: ohne Fliesstext und Tagline) (`Xe`, Export `r`). */
export function fontsNeeded(
  concepts: LogoConcept[],
  scope = "all",
  input?: any,
): FontRef[] {
  const r = new Map();
  for (const a of concepts) {
    const s = a.signature
      ? signatureFonts(
          a,
          input ?? {
            name: "",
          },
        )
      : [];
    const o =
      scope === "logo"
        ? [
            a.name.font,
            a.suffix.font,
            ...typoFonts(a),
            ...(a.symbol?.kind === "monogram" ? [a.symbol.font] : []),
            ...s,
          ]
        : conceptFonts(a, input);
    for (const l of o) r.set(fontKey(l), l);
  }
  return [...r.values()];
}

const POOL_SIZE = 18;

export const PAGE_SIZE = 6;

const MIN_DIVERSE = 6;

const QUALITY_STEPS = [70, 65, 60, 55];

const CARD_BACKGROUNDS = ["paper", "ink", "primary"];

const isWordOnly = (e: any) => e.layout === "wordmark" || !e.symbol;

const nameFormatOf = (e: any) => e.nameFormat ?? "full";

function curationFacts(
  concept: LogoConcept,
  input: LogoInput,
  fonts: FontStore,
  recipeId?: any,
) {
  const i = fontsNeeded([concept], "logo").every((u) =>
    getFont(u.key).styles.includes(concept.style),
  );
  const a = checkLogo(concept, input, fonts);
  const s = a.items.filter((u) => !u.pass && u.key !== "highend").length;
  const o = routeOf(input)
    ? routeFit(
        concept,
        input,
        (u: any) =>
          getSignatureTemplate(u) && templateAxes(getSignatureTemplate(u)),
      ) * 10
    : 0;
  return {
    value:
      qualityScore(concept, input) +
      (i ? 4 : 0) +
      (a.score - 90) * 0.2 -
      s * 12 +
      (recipeId ? tasteScore(concept, recipeId) * 12 : 0) +
      o,
    clean: s === 0,
    check: a.score,
  };
}

let shortNameMode = false;

/** Schluessel fuer den Look (Schriftklasse, Schreibung, Laufweite, Detail), fuer Vielfalt auf einer Seite (`xe`). */
export function lookKey(concept: LogoConcept, short: boolean = false) {
  if (concept.signature) return `sig|${templateBaseId(concept.signature.id)}`;
  if (shortNameMode && short) return shortLookKey(concept);
  const { concept: t } = applyNameFormat(concept, {
    name: "Name",
    suffix: "",
    tagline: "",
    styles: [],
    colorMoods: [],
    themes: [],
  });
  const r = fontForm(concept.name.font.key);
  const i =
    r === "antiqua" || r === "didone"
      ? "serif"
      : r === "geometric" || r === "grotesk"
        ? "sans"
        : r;
  const a =
    concept.name.font.style === "italic" ||
    t.typo?.split?.font?.style === "italic";
  return `${i}|${isCaps(t.name.font, t.name.case) ? "upper" : "mixed"}|${concept.name.font.weight >= 600 ? "bold" : "normal"}|${a ? "italic" : ""}|${short ? (proportionCache.get(concept.id) ?? "") : ""}`;
}

const proportionCache = new Map();

function measureProportion(
  concept: LogoConcept,
  input: LogoInput,
  fonts: FontStore,
) {
  if (proportionCache.has(concept.id)) return;
  if (proportionCache.size > 3e3) {
    proportionCache.clear();
  }
  const r = renderLogo(concept, input, fonts);
  const i = r.height > 0 ? r.width / r.height : 0;
  proportionCache.set(concept.id, i < 2.2 ? "block" : i < 4.5 ? "mid" : "line");
}

function typoFixes(concept: LogoConcept, input: LogoInput) {
  const t = [];
  const r = getFont(concept.name.font.key);
  const { concept: i } = applyNameFormat(concept, input);
  const a = isCaps(i.name.font, i.name.case);
  const s =
    concept.name.font.style !== "italic"
      ? italicVariant(concept.name.font.key, concept.name.font.weight)
      : null;
  const o = {
    ...concept,
    typo: concept.typo?.split
      ? {
          ...concept.typo,
          split: undefined,
        }
      : concept.typo,
  };
  if (s && !a && r.cat === "serif") {
    t.push({
      ...o,
      name: {
        ...concept.name,
        font: s,
        tracking: Math.min(concept.name.tracking, 0),
      },
      recipeId: undefined,
    });
  }
  if (a && !r.capsOnly && r.cat !== "script") {
    const u = concept.nameFormat === "upper" ? undefined : concept.nameFormat;
    if (s && r.cat === "serif") {
      t.push({
        ...o,
        nameFormat: u,
        name: {
          font: s,
          case: "title",
          tracking: snapTracking(s, "title", 0),
        },
        recipeId: undefined,
      });
    }
    t.push({
      ...o,
      nameFormat: u,
      name: {
        ...concept.name,
        case: "title",
        tracking: snapTracking(concept.name.font, "title", 0),
      },
      recipeId: undefined,
    });
  } else if (!a && !r.noCaps && r.cat !== "script") {
    t.push({
      ...o,
      name: {
        ...concept.name,
        case: "upper",
        tracking: defaultTracking(concept.name.font, "upper"),
      },
      recipeId: undefined,
    });
  }
  if (nameWords(input.name).length > 1) {
    t.push({
      ...concept,
      nameFormat: concept.nameFormat === "stacked" ? undefined : "stacked",
      recipeId: undefined,
    });
  }
  return t.map((u) => withId(repairConcept(u as LogoConcept, input)));
}

function shortLookKey(concept: LogoConcept) {
  const n = concept.name.tracking;
  const t =
    n < -0.005 ? "eng" : n < 0.04 ? "normal" : n < 0.12 ? "weit" : "sehr weit";
  return `${concept.name.case === "upper" || concept.nameFormat === "upper" ? "upper" : concept.name.case}|${t}|${typoKind(concept)}`;
}

const isItalic = (concept: LogoConcept) => {
  return (
    concept.name.font.style === "italic" ||
    concept.typo?.split?.font?.style === "italic"
  );
};

const hasLine = (concept: LogoConcept) => {
  return (
    !!concept.typo?.rule ||
    concept.typo?.mark === "hairline" ||
    concept.divider === "line"
  );
};

function distinctLooks(concepts: LogoConcept[]) {
  const n = new Set();
  for (const t of concepts) {
    const r = lookKey(t, true);
    if (n.has(r)) return false;
    n.add(r);
  }
  return true;
}

function lookIsNew(
  concept: LogoConcept,
  others: LogoConcept[],
  short: boolean = shortNameMode,
) {
  const r = shortNameMode;
  shortNameMode = short;
  try {
    const i = lookKey(concept, true);
    return others.every((a) => a === concept || lookKey(a, true) !== i);
  } finally {
    shortNameMode = r;
  }
}

let mixTargets: any = null;

function missingMix(
  concepts: LogoConcept[],
  size: number,
  wantSymbol: boolean = true,
  wantPairing: boolean = false,
) {
  if (size < 3) return [];
  if (mixTargets) {
    const l = mixTargets;
    const u = wantPairing
      ? Math.max(0, 2 - new Set(concepts.map(suffixPairingOf)).size)
      : 0;
    const m = new Set(concepts.map((x) => fontGroupOf(x.name.font.key))).size;
    const h = new Set(concepts.map(nameFormatOf)).size;
    const p = concepts.filter(isWordOnly).length;
    const g = Math.min(size - 1, Math.max(1, Math.round(size * l.word)));
    const w = Math.min(size - 2, Math.round(size * l.sym));
    return [
      Math.max(0, 2 - m),
      Math.max(0, Math.min(3, size - 1) - h),
      Math.max(0, g - p),
      Math.max(0, w - (concepts.length - p)),
      u,
    ];
  }
  const i = wantPairing
    ? Math.max(0, 2 - new Set(concepts.map(suffixPairingOf)).size)
    : 0;
  const a = new Set(concepts.map((l) => fontGroupOf(l.name.font.key))).size;
  const s = new Set(concepts.map(nameFormatOf)).size;
  const o = concepts.filter(isWordOnly).length;
  return [
    Math.max(0, 2 - a),
    Math.max(0, Math.min(3, size - 1) - s),
    Math.max(0, Math.ceil((size * 2) / 3) - o),
    wantSymbol ? Math.max(0, Math.min(1, size - 2) - (concepts.length - o)) : 0,
    i,
  ];
}

function mixOk(
  concepts: LogoConcept[],
  size: number,
  distinct: boolean = true,
  strict: boolean = true,
) {
  if (
    (distinct && !distinctLooks(concepts)) ||
    concepts.filter((a) => {
      return a.typo?.mark;
    }).length > Math.max(1, Math.floor(size / 6)) ||
    concepts.filter((a) => {
      return a.layout !== "wordmark" && a.symbol?.kind === "monogram";
    }).length >
      Math.max(
        1,
        Math.floor(size / 6),
        mixTargets ? Math.round(size * mixTargets.mono) : 0,
      ) ||
    concepts.filter((a) => a.nameFormat === "initial").length >
      Math.max(1, Math.floor(size / 6))
  )
    return false;
  const i = new Map();
  for (const a of concepts)
    i.set(
      fontGroupOf(a.name.font.key),
      (i.get(fontGroupOf(a.name.font.key)) ?? 0) + 1,
    );
  return (
    concepts.filter((a) => a.layout === "badge").length <= 1 &&
    (!strict ||
      [...i.values()].every(
        (a) =>
          a <=
          (mixTargets?.group ? Math.ceil((size * 2) / 3) : Math.ceil(size / 2)),
      )) &&
    fontsNeeded(concepts, "logo").length <= MIN_DIVERSE
  );
}

/** Kuratierung einer Seite aus dem Pool: Mischung nach Route (kindMix), Qualitaetsschwelle, Vielfalt, danach `leitPass` (`Rm`, Export `b`). */
export function curateConcepts(
  pool: LogoConcept[],
  rawInput: LogoInput,
  fonts: FontStore,
  size: number = PAGE_SIZE,
  options: CurateOptions = {},
) {
  const input = routedInput(rawInput);
  const mix = kindMixOf(input);
  if (!mix) return curateWithDrawn(pool, input, fonts, size, options, null);
  const total = mix.wortmarke + mix.monogramm + mix.zeichen || 1;
  const previous = mixTargets;
  mixTargets = {
    word: mix.wortmarke / total,
    sym: (mix.monogramm + mix.zeichen) / total,
    mono: mix.monogramm / total,
    group: serifDecided(input),
  };
  try {
    return leitPass(
      curateWithDrawn(
        pool,
        input,
        fonts,
        size,
        options,
        mix.vorlage,
      ) as LogoConcept[],
      pool,
      input,
      fonts,
      size,
      options,
    );
  } finally {
    mixTargets = previous;
  }
}

/** Tauscht Konzepte gegen Pool-Konzepte, bis die Seite die Leit-Merkmale der Route (Schriftklasse, Farbfamilie, Logo-Art) zeigt, ohne Qualitaet und Vielfalt zu verlieren (`tm`). */
export function leitPass(
  page: LogoConcept[],
  pool: LogoConcept[],
  input: LogoInput,
  fonts: FontStore,
  size: number,
  options: CurateOptions,
) {
  const s = leitMerkmale(input);
  let o = page.slice();
  if (o.length < 4 || leitAbstand(o, s) === 0) return o;
  const l = new Set(options.exclude ?? []);
  const u = excludedTemplateIds(l);
  const m =
    medianQuality(
      pool.filter((b) => !b.signature && !isDrawn(b)),
      input,
    ) ?? 0;
  const h = MIN_DIVERSE + MAX_SIGNATURE;
  const p = options.pinFirst ? 1 : 0;
  const g = new Map();
  const w = (b: any) =>
    g.get(b) ?? (g.set(b, qualityScore(b, input)), g.get(b));
  const x = new Map();
  const y = (b: any) => {
    const z = x.get(b);
    if (z !== undefined) return z;
    let k;
    if (b.signature) {
      const v = getSignatureTemplate(b.signature.id);
      k =
        !!v &&
        !u.has(templateBaseId(b.signature.id)) &&
        fits(v, input, fonts).passt &&
        checkLogo(b, input, fonts).score >= QUALITY_STEPS[0]!;
    } else
      k =
        (!hasSymbol(b) || w(b) >= m) &&
        checkLogo(b, input, fonts).score >= QUALITY_STEPS[1]!;
    x.set(b, k);
    return k;
  };
  const f = (b: any, z: any) => {
    const k = b.filter((M: any) => M.signature);
    if (z.signature) {
      if (
        k.length > size - 2 ||
        k.some(
          (S: any) =>
            S !== z &&
            templateBaseId(S.signature.id) === templateBaseId(z.signature.id),
        )
      )
        return false;
      const M =
        getSignatureTemplate(z.signature.id)?.merkmale.zeichen ?? "ohne";
      if (
        k.some((S: any) => {
          return (
            S !== z &&
            (getSignatureTemplate(S.signature.id)?.merkmale.zeichen ??
              "ohne") === M
          );
        })
      )
        return false;
    }
    return !lookIsNew(z, b) ||
      (!mixOk(
        b.filter((M: any) => !M.signature),
        size,
        true,
        false,
      ) &&
        mixOk(
          o.filter((M) => !M.signature),
          size,
          true,
          false,
        ))
      ? false
      : fontsNeeded(b, "logo", input).length <=
          Math.max(h, fontsNeeded(o, "logo", input).length);
  };
  const d = pool.filter((b) => !isDrawn(b) && !l.has(b.id));
  for (let b = 0; b < size; b++) {
    const z = leitAbstand(o, s);
    if (z === 0) break;
    const k = new Set(o.map((N) => N.id));
    const v = o.map((N, A) => A).filter((N) => N >= p && !isDrawn(o[N]!));
    const M = [];
    for (const N of d) {
      if (!k.has(N.id))
        for (const A of v) {
          const R = o.map((E, I) => (I === A ? N : E));
          const L = leitAbstand(R, s);
          if (L < z) {
            M.push({
              k: A,
              c: N,
              gap: L,
              loss: w(o[A]) - w(N),
            });
          }
        }
    }
    M.sort((N, A) => N.gap - A.gap || N.loss - A.loss);
    let S = false;
    for (const N of M) {
      if (!y(N.c)) continue;
      const A = withCardBackground(N.c, o[N.k]!.cardBackground ?? "paper");
      const R = o.map((L, E) => (E === N.k ? A : L));
      if (f(R, A)) {
        o = R;
        S = true;
        break;
      }
    }
    if (!S) break;
  }
  return o;
}

const isDrawn = (concept: LogoConcept) =>
  !!konstruktionOf(concept) || !!eingriffOf(concept);

function curateWithDrawn(
  pool: LogoConcept[],
  input: LogoInput,
  fonts: FontStore,
  size: number,
  options: CurateOptions,
  mix: any,
) {
  if (!pool.some(isDrawn))
    return curateWithSignature(pool, input, fonts, size, options, mix);
  const s = pool.filter((f) => !isDrawn(f) || drawnRenders(f, input, fonts));
  const o = curateWithSignature(s, input, fonts, size, options, mix);
  const l = new Set(options.exclude ?? []);
  const u =
    medianQuality(
      s.filter((f) => !f.signature && !isDrawn(f)),
      input,
    ) ?? 0;
  const m = s.filter(
    (f) =>
      isDrawn(f) &&
      !l.has(f.id) &&
      !o.includes(f) &&
      checkLogo(f, input, fonts).score >=
        QUALITY_STEPS[QUALITY_STEPS.length - 1]! &&
      (!hasSymbol(f) || qualityScore(f, input) >= u),
  );
  if (size < 4 || o.some((c) => isDrawn(c!)) || !m.length) return o;
  const h = MIN_DIVERSE + MAX_SIGNATURE;
  const p = options.pinFirst ? 1 : 0;
  const g = o
    .map((f, d) => ({
      c: f,
      k: d,
    }))
    .filter(({ c: f, k: d }) => d >= p && !f!.signature);
  const w = g.filter(({ c: f }) => {
    return f!.layout !== "wordmark" && f!.symbol?.kind === "monogram";
  });
  const x = [...w, ...g.filter((f) => !w.includes(f)).reverse()];
  const y = m
    .map((f) => ({
      c: f,
      v: qualityScore(f, input),
    }))
    .sort((f, d) => d.v - f.v);
  for (const { c } of y) {
    for (const { k: d } of x) {
      const b = o.map((z, k) => (k === d ? c : z));
      if (
        fontsNeeded(b as LogoConcept[], "logo", input).length <= h &&
        lookIsNew(c, b as LogoConcept[])
      )
        return b;
    }
  }
  return o;
}

function curateWithSignature(
  pool: LogoConcept[],
  input: LogoInput,
  fonts: FontStore,
  size: number,
  options: CurateOptions,
  mix: any,
) {
  const s = pool.filter((E) => E.signature);
  if (!s.length) return curateRecipes(pool, input, fonts, size, options);
  const o = new Set(options.exclude ?? []);
  const l = options.pinFirst && pool[0] ? pool[0] : null;
  const u = l?.signature ? l : null;
  const m = size - (u ? 1 : 0);
  const h =
    mix !== null
      ? Math.max(
          Math.min(size >= 6 ? 2 : 1, size - 2),
          Math.min(size - 2, Math.round(size * mix)),
        )
      : size >= 9
        ? 4
        : size >= 6
          ? 3
          : Math.floor(size / 2);
  const p = excludedTemplateIds(o);
  const g: any[] = [];
  for (const E of s) {
    let I = E;
    if (o.has(I.id) || I === l) continue;
    const T = (F: any) => templateBaseId(F.signature.id);
    if (p.has(T(I)) && s.filter((F) => !p.has(T(F))).length >= h) continue;
    let K = getSignatureTemplate(I.signature!.id);
    if (K?.variante && !fits(K, input, fonts).passt) {
      const F = getSignatureTemplate(K.variante.basis);
      if (F) {
        const D = templateConcept(F, input, I.palette, I.style);
        if (D && !o.has(D.id)) {
          I = D;
          K = F;
        }
      }
    }
    if (!(!K || !fits(K, input, fonts).passt)) {
      measureProportion(I, input, fonts);
      if (!(checkLogo(I, input, fonts).score < QUALITY_STEPS[0]!)) {
        g.push(I);
      }
    }
  }
  const w = pool.filter((E) => !E.signature);
  const x = u
    ? {
        ...options,
        pinFirst: false,
      }
    : options;
  const y = (E: any) => new Set(fontsNeeded(E, "logo", input).map(fontKey));
  const f = MIN_DIVERSE + MAX_SIGNATURE;
  const d = isShortBrandName(input);
  const b = (E: any) => KIT_TEMPLATE_IDS.has(templateBaseId(E.signature.id));
  const z = new Map();
  for (const E of g)
    z.set(
      E,
      g.filter((I) => I !== E && b(I) === b(E) && g.indexOf(I) < g.indexOf(E))
        .length,
    );
  const k = [...p].filter((E) => KIT_TEMPLATE_IDS.has(E as string)).length;
  const v = (E: any, I: any) => {
    const T = u ? [u] : [];
    const K = new Set(
      T.map((Y) => {
        return (
          getSignatureTemplate(Y.signature!.id)?.merkmale.zeichen ?? "ohne"
        );
      }),
    );
    const F = g.slice();
    for (; T.length - (u ? 1 : 0) < I; ) {
      const Y = y([...E, ...T]);
      const _ = (O: any) => [...y([O])].filter((H) => !Y.has(H)).length;
      const te = d && k + T.filter(b).length < 2;
      const X = F.map((O) => ({
        c: O,
        k: d && !te ? z.get(O) * (b(O) ? 2 : 1) + (b(O) ? 1 : 0) : g.indexOf(O),
        x: _(O) + (te && !b(O) ? 100 : 0),
      }))
        .filter(({ c: O }) => {
          return (
            !K.has(
              getSignatureTemplate(O.signature.id)?.merkmale.zeichen ?? "ohne",
            ) && lookIsNew(O, [...T, ...E], d)
          );
        })
        .filter(({ x: O }) => Y.size + (O % 100) <= f)
        .sort((O, H) => O.x + O.k / 3 - (H.x + H.k / 3) || O.k - H.k)[0];
      if (!X) break;
      T.push(X.c);
      K.add(getSignatureTemplate(X.c.signature.id)?.merkmale.zeichen ?? "ohne");
      F.splice(F.indexOf(X.c), 1);
    }
    return T.filter((Y) => Y !== u);
  };
  const M = Math.min(h, m - 1, g.length);
  let S = curateRecipes(w, input, fonts, m - M, x);
  let N = v(S, M);
  for (let E = 0; E < 3 && N.length < M; E++) {
    S = curateRecipes(w, input, fonts, m - N.length, x);
    const I = v(S, N.length);
    if (I.length === N.length) break;
    N = I;
  }
  const A = S.slice();
  const R = l && !u ? 1 : 0;
  const L = (E: any) => fontGroupOf(E.name.font.key);
  N.forEach((E, I) => {
    const T = Math.max(
      R,
      Math.min(A.length, Math.floor(((I + 0.5) * m) / Math.max(1, N.length))),
    );
    const F =
      [T, T + 1, T - 1]
        .filter((D) => D >= Math.max(R, 1) && D <= A.length)
        .find(
          (D) => L(A[D - 1]) !== L(E) && (D >= A.length || L(A[D]) !== L(E)),
        ) ?? T;
    A.splice(F, 0, E);
  });
  if (u) {
    A.unshift(u);
  }
  return A.slice(0, size);
}

function excludedTemplateIds(ids: Set<string>) {
  const n = new Set();
  for (const t of ids) {
    if (!t.startsWith("sig-sig-")) continue;
    let r = "";
    for (const i of ALL_TEMPLATES) {
      if (
        (t.startsWith(`sig-${i.id}-`) || t.startsWith(`sig-${i.id}--`)) &&
        i.id.length > r.length
      ) {
        r = i.id;
      }
    }
    if (r) {
      n.add(r);
    }
  }
  return n;
}

const KIT_TEMPLATE_IDS = new Set(KIT_TEMPLATES.map((e) => e.id));

const MAX_SIGNATURE = 4;

function curateRecipes(
  pool: LogoConcept[],
  input: LogoInput,
  fonts: FontStore,
  size: number = PAGE_SIZE,
  options: CurateOptions = {},
) {
  shortNameMode = isShortBrandName(input);
  try {
    return curatePage(pool, input, fonts, size, options);
  } finally {
    shortNameMode = false;
  }
}

function curatePage(
  pool: LogoConcept[],
  input: LogoInput,
  fonts: FontStore,
  size: number = PAGE_SIZE,
  options: CurateOptions = {},
) {
  const a = new Set(options.exclude ?? []);
  const s = (S: any) =>
    a.has(S.id) ||
    CARD_BACKGROUNDS.some((N) =>
      a.has(
        withId({
          ...S,
          cardBackground: N,
        }).id,
      ),
    );
  const o = options.pinFirst && pool[0] && !s(pool[0]) ? pool[0] : null;
  const l = new Set();
  const u = pool.filter(
    (S) => !l.has(S.id) && l.add(S.id) && (S === o || !s(S)),
  );
  const m = qualityThreshold(u, input, o, size);
  if (size <= 0 || !m.length) return [];
  const h = options.taste ? tasteProfile(options.taste) : null;
  const p = input.themes.length > 0;
  const g = !!cleanText(input.suffix);
  const w = new Map(m.map((S) => [S.id, curationFacts(S, input, fonts, h)]));
  for (const S of m) measureProportion(S, input, fonts);
  const x = new Map([...w].map(([S, N]) => [S, N.value]));
  const y = new Map([...w].map(([S, N]) => [S, N.clean]));
  const f = new Map([...w].map(([S, N]) => [S, N.check]));
  if (isShortBrandName(input) && size >= 3) {
    const S = (A: any) => {
      return (
        x.get(A.id)! + (getRecipe(A.recipeId)?.kurz ? 20 : A.recipeId ? 8 : 0)
      );
    };
    const N = m
      .filter(
        (A) =>
          A !== o && f.get(A.id)! >= QUALITY_STEPS[QUALITY_STEPS.length - 1]!,
      )
      .sort((A, R) => S(R) - S(A));
    for (const A of [true, false]) {
      const R = o ? [o] : [];
      for (const L of N) {
        if (R.length >= size) break;
        const E = [...R, L];
        if (
          !(
            new Set(E.map(shortLookKey)).size < E.length ||
            !mixOk(E, size, false, A)
          )
        ) {
          R.push(L);
        }
      }
      if (
        R.length >= size &&
        new Set(R.map((L) => fontGroupOf(L.name.font.key))).size >= 2 &&
        (!g || new Set(R.map(suffixPairingOf)).size >= 2)
      )
        return balanceFontGroups(
          spreadDarkCards(R, o ? 1 : 0),
          (L: any) => x.get(L.id) ?? 0,
          !!o,
        );
    }
  }
  let d = QUALITY_STEPS[0];
  const b = isShortBrandName(input);
  const z = (S: any, N: any) =>
    x.get(S.id)! -
    15 * N.filter((A: any) => A.name.font.key === S.name.font.key).length -
    10 * N.filter((A: any) => nameFormatOf(A) === nameFormatOf(S)).length -
    14 * N.filter((A: any) => lookKey(A, true) === lookKey(S, true)).length +
    (isItalic(S) && !N.some(isItalic) ? 6 : 0) -
    (hasLine(S) ? 5 * Math.max(0, N.filter(hasLine).length - 1) : 0) -
    (b
      ? 30 * N.filter((A: any) => shortLookKey(A) === shortLookKey(S)).length
      : 0);
  let k = o ? [o] : [];
  const v = QUALITY_STEPS.flatMap((S) => [
    {
      min: S,
      clean: true,
    },
  ]).concat(
    QUALITY_STEPS.map((S) => ({
      min: S,
      clean: false,
    })),
  );
  for (const { min, clean } of v) {
    k = o ? [o] : [];
    d = min;
    const A = m.filter(
      (R) => R !== o && f.get(R.id)! >= min && (!clean || y.get(R.id)),
    );
    for (; k.length < size; ) {
      const R = A.filter((K) => !k.includes(K) && mixOk([...k, K], size));
      if (!R.length) break;
      const L = size - k.length - 1;
      const E = R.filter((K) =>
        missingMix([...k, K], size, p, g).every((F) => F <= L),
      );
      const T = (E.length ? E : R).reduce((K, F) =>
        z(F, k) > z(K, k) ? F : K,
      );
      k.push(T);
    }
    if (k.length >= size && missingMix(k, size, p, g).every((R) => R === 0))
      break;
  }
  if (k.length < size) {
    const S = m.filter((A) => !k.includes(A)).sort((A, R) => z(R, k) - z(A, k));
    for (const A of S) {
      if (k.length < size && mixOk([...k, A], size)) {
        k.push(A);
      }
    }
    for (const A of S) {
      if (
        k.length < size &&
        !k.includes(A) &&
        mixOk([...k, A], size, false) &&
        !k.some(
          (R) =>
            R.name.font.key === A.name.font.key &&
            lookKey(R, true) === lookKey(A, true),
        )
      ) {
        k.push(A);
      }
    }
    const N = (A: any) => {
      return (
        !A.typo?.mark ||
        k.filter((L) => {
          return L.typo?.mark;
        }).length < Math.max(1, Math.floor(size / 6))
      );
    };
    for (const A of S) {
      if (k.length < size && !k.includes(A) && N(A)) {
        k.push(A);
      }
    }
    for (const A of S) {
      if (k.length < size && !k.includes(A)) {
        k.push(A);
      }
    }
  }
  for (
    let S = 0;
    S < size && missingMix(k, size, p, g).some((N) => N > 0);
    S++
  ) {
    const N = missingMix(k, size, p, g).reduce((R, L) => R + L, 0);
    let A = null;
    for (let R = o ? 1 : 0; R < k.length; R++) {
      for (const L of m) {
        if (k.includes(L) || f.get(L.id)! < d!) continue;
        const E = k.map((T, K) => (K === R ? L : T));
        if (
          !mixOk(E, size) ||
          missingMix(E, size, p, g).reduce((T, K) => T + K, 0) >= N
        )
          continue;
        const I = x.get(L.id)! - x.get(k[R]!.id)!;
        if (!A || I > A.v) {
          A = {
            at: R,
            c: L,
            v: I,
          };
        }
      }
    }
    if (!A) break;
    k[A.at] = A.c;
  }
  const M = new Set(fontsNeeded(m, "logo").map(fontKey));
  for (let S = 0; S < size && !distinctLooks(k); S++) {
    const N = k
      .map((L, E) => ({
        c: L,
        k: E,
      }))
      .filter(
        ({ c: L, k: E }) =>
          E >= (o ? 1 : 0) &&
          k.some((I, T) => T !== E && lookKey(I, true) === lookKey(L, true)),
      )
      .sort((L, E) => (x.get(L.c.id) ?? 0) - (x.get(E.c.id) ?? 0));
    let A = false;
    const R = missingMix(k, size, p, g).reduce((L, E) => L + E, 0);
    for (const [L, E] of [
      [true, 0],
      [false, 0],
      [false, 1],
    ] as const) {
      for (const { k: I } of N) {
        let T = null;
        for (const K of m) {
          if (k.includes(K) || f.get(K.id)! < d!) continue;
          const F = k.map((D, Y) => (Y === I ? K : D));
          if (
            !(
              !mixOk(F, size, true, L) ||
              missingMix(F, size, p, g).reduce((D, Y) => D + Y, 0) > R + E
            )
          ) {
            if (!T || x.get(K.id)! > T.v!) {
              T = {
                c: K,
                v: x.get(K.id),
              };
            }
          }
        }
        if (T) {
          k = k.map((K, F) => (F === I ? T.c : K));
          A = true;
          break;
        }
      }
      if (A) break;
    }
    if (!A) {
      for (const { c, k: E } of N) {
        for (const I of typoFixes(c, input)) {
          if (!fontsNeeded([I], "logo").every((K) => M.has(fontKey(K))))
            continue;
          measureProportion(I, input, fonts);
          const T = k.map((K, F) => (F === E ? I : K));
          if (
            !(
              !distinctLooks(T) ||
              !mixOk(T, size) ||
              checkLogo(I, input, fonts).score < d!
            )
          ) {
            k = T;
            x.set(I.id, curationFacts(I, input, fonts, h).value);
            A = true;
            break;
          }
        }
        if (A) break;
      }
      if (!A) break;
    }
  }
  k = spreadDarkCards(k, o ? 1 : 0);
  return balanceFontGroups(k, (S: any) => x.get(S.id) ?? 0, !!o);
}

function spreadDarkCards(concepts: LogoConcept[], from: number) {
  if (concepts.length < 2) return concepts;
  const t = concepts.slice();
  const r = (a: any) => (a.cardBackground ?? "paper") !== "paper";
  const i = (a: any) => {
    for (let s = t.length - 1; s >= from; s--) {
      const o = t.filter((l, u) => u !== s);
      if (
        (a === "ink"
          ? !r(t[s]) && o.some((l) => !r(l))
          : r(t[s]) && o.some(r)) &&
        accentsVisible(t[s]!, a) &&
        !(a === "ink" && hasOutlinedText(t[s]!))
      ) {
        t[s] = withId({
          ...t[s],
          cardBackground: a,
        });
        return;
      }
    }
  };
  if (!t.some(r)) {
    i("ink");
  }
  if (!t.some((a) => !r(a))) {
    i("paper");
  }
  return t;
}

function balanceFontGroups(
  concepts: LogoConcept[],
  score: any,
  pinFirst: boolean,
) {
  const r = (o: any) => fontGroupOf(o.name.font.key);
  const i = (pinFirst ? concepts.slice(1) : concepts.slice()).sort(
    (o, l) => score(l) - score(o),
  );
  const a = pinFirst ? [concepts[0]] : [];
  const s = (o: any, l: any) => {
    const u = new Map();
    for (const m of o) u.set(r(m), (u.get(r(m)) ?? 0) + 1);
    return [...u].every(
      ([m, h]) =>
        h <= (m === l ? Math.floor(o.length / 2) : Math.ceil(o.length / 2)),
    );
  };
  for (; i.length; ) {
    const o = a.length ? r(a[a.length - 1]) : null;
    let l = i.findIndex(
      (u, m) =>
        r(u) !== o &&
        s(
          i.filter((h, p) => p !== m),
          r(u),
        ),
    );
    if (l < 0) {
      l = i.findIndex((u) => r(u) !== o);
    }
    a.push(i.splice(Math.max(0, l), 1)[0]);
  }
  return a;
}

const SIGNATURE_PER_PACKAGE = [12, 8];

/** Signature-Vorlagen eines Pakets als Konzepte (12, dann 8): passende Vorlagen, Variante, Palette und Stil gewichtet (`am`). */
export function signatureConcepts(
  input: LogoInput,
  pkg: number,
  entwuerfe: boolean = false,
  seed: number | undefined,
  varianten: boolean = true,
) {
  const a = SIGNATURE_PER_PACKAGE[pkg] ?? 0;
  if (!a) return [];
  const s = routedInput(input);
  const o = routeOf(s);
  const l = ALL_TEMPLATES.filter(
    (y) =>
      (entwuerfe ? true : y.freigabe === "freigegeben") &&
      y.mischung !== false &&
      fits(y, s).passt &&
      !templateBlocked(y, s) &&
      templateInRoute(y, s),
  );
  const u = isShortBrandName(s) ? KIT_TEMPLATE_IDS : null;
  const m = seed ?? inputSeed(s);
  const h = rankTemplates(
    l,
    s,
    m,
    (y) => (u?.has(y.id) ? 0 : 1),
    o ? (y) => templateWeight(y, s) : undefined,
  );
  const p = pkg === 0 ? 0 : 6;
  const g =
    pkg === 0 ? Math.min(a, Math.max(6, Math.round(h.length * 0.7))) : a;
  const w = Array.from(
    {
      length: Math.min(g, h.length),
    },
    (y, f) => h[(p + f) % h.length],
  );
  const x: any[] = [];
  w.forEach((y, f) => {
    const d = varianten ? pickTemplateVariant(y, s, m, entwuerfe) : y;
    const b = templatePalettes(d, s, f + pkg);
    const z = s.styles.find((v) => d.passt.stile.includes(v));
    const k = templateConcept(d, s, b!, z);
    if (k) {
      x.push(k);
    }
  });
  return x;
}

export function pickTemplateVariant(
  template: any,
  input: LogoInput,
  seed: number,
  entwuerfe: boolean = false,
) {
  const i = [
    template,
    ...templateVariants(template, entwuerfe).filter(
      (s) => entwuerfe || s.freigabe === "freigegeben",
    ),
  ];
  if (i.length < 2) return template;
  const a = rng(
    mixSeed(hash(`${cleanText(input.name)}|${template.id}`), seed >>> 0, 31345),
  );
  return i[a.int(0, i.length - 1)];
}

function templatePalettes(template: any, input: LogoInput, seed: number) {
  const r = basePalettes();
  const i = (w: any) => r.find((x) => x.id.split("-")[0] === w);
  const a = routeOf(input);
  let s = template.farben.paletten;
  if (a) {
    s = s.filter((w: any) => {
      const x = i(w);
      return x && !paletteBlocked(x, input);
    });
    if (a.axes?.warmth?.sicher || a.axes?.saturation?.sicher) {
      const w = (x: any) =>
        axisFit(a.axes, paletteAxes(i(x)!), ["warmth", "saturation"]);
      s = s.slice().sort((x: any, y: any) => w(y) - w(x));
    }
    if (!s.length) {
      const w = allowedMoods(moodsFor(input, template.passt.stile[0]), input);
      const x = r.filter(
        (y) => !paletteBlocked(y, input) && w.includes(moodOfPaletteId(y.id)!),
      );
      return (
        x[seed % Math.max(1, x.length)] ??
        r.find((y) => !paletteBlocked(y, input)) ??
        r[0]
      );
    }
  }
  if (a?.colorMoods?.length) {
    const w = a.colorMoods.filter((d) => {
      return !a.avoidColorMoods?.includes(d);
    });
    const x = w[seed % 3 === 2 && w.length > 1 ? 1 : 0];
    const y = s.filter((d: any) => moodOfPaletteId(d) === x);
    if (y.length) return i(y[seed % y.length]) ?? r[0];
    const f = r.filter(
      (d) =>
        moodOfPaletteId(d.id) === x &&
        !paletteBlocked(d, input) &&
        !(template.farben.ohneGelbRot && hasYellowAndRed(d)),
    );
    if (f.length) return f[seed % f.length];
  }
  const o = s.filter((w: any) =>
    input.colorMoods.includes(moodOfPaletteId(w)!),
  );
  const l = (o.length ? o : s)[seed % (o.length || s.length)];
  return i(l) ?? r[0];
}

export function templateWeight(
  template: any,
  input: LogoInput,
  styles = input.styles,
) {
  const r = routeOf(input);
  const i = styleBalance(template, styles);
  if (!r) return i;
  const a = r.signatureStyles ?? [];
  const s = a.includes(template.passt.stile[0])
    ? 1.6
    : a.some((o) => template.passt.stile.includes(o))
      ? 1.25
      : 1;
  return i * s * Math.exp(1.5 * axisFit(r.axes, templateAxes(template)));
}

export function templateConcept(
  template: any,
  input: LogoInput,
  palette: Palette,
  style: any,
) {
  const i = signatureConcept(template, input, palette, {}, style);
  if (!routeOf(input)) return i;
  const a = (s: any) =>
    !signatureFonts(s, input).some((o) => fontBlocked(o, input));
  if (a(i)) return i;
  for (const s of template.schriften.haupt) {
    for (const o of [undefined, ...template.schriften.neben]) {
      const l = signatureConcept(
        template,
        input,
        palette,
        o
          ? {
              haupt: s,
              neben: o,
            }
          : {
              haupt: s,
            },
        style,
      );
      if (a(l)) return l;
    }
  }
  return null;
}

const TEMPLATES_PER_STYLE = (() => {
  const e = new Map();
  for (const n of ALL_TEMPLATES) {
    if (n.freigabe === "freigegeben" && n.mischung !== false) {
      e.set(n.passt.stile[0], (e.get(n.passt.stile[0]) ?? 0) + 1);
    }
  }
  return e;
})();

function styleBalance(template: any, styles: any) {
  const t = [...TEMPLATES_PER_STYLE.values()];
  const r = t.reduce((o, l) => o + l, 0) / Math.max(1, t.length);
  const i = (o: any) => Math.min(1, (TEMPLATES_PER_STYLE.get(o) ?? 0) / r);
  if (!styles.length)
    return Math.min(
      2,
      Math.max(
        0.6,
        r / Math.max(1, TEMPLATES_PER_STYLE.get(template.passt.stile[0]) ?? 1),
      ),
    );
  const a = styles.indexOf(template.passt.stile[0]);
  if (a >= 0) return a === 0 ? 1 : 0.8;
  const s = styles.filter((o: any) => template.passt.stile.includes(o));
  return s.length
    ? Math.max(...s.map((o: any) => 0.55 + 0.4 * (1 - i(o))))
    : 0.15;
}

export function rankTemplates(
  templates: any,
  input: LogoInput,
  seed: number,
  bonus: (t: any) => number = () => 0,
  weight: (t: any) => number = (a) => styleBalance(a, input.styles),
) {
  const a = cleanText(input.name);
  const s = (o: any) => {
    const l = Math.max(
      1e-9,
      rng(mixSeed(hash(`${a}|${o.id}`), seed >>> 0, 20903)).next(),
    );
    return Math.log(l) / Math.max(1e-6, weight(o));
  };
  return templates
    .map((o: any) => ({
      t: o,
      g: bonus(o),
      k: s(o),
    }))
    .sort(
      (o: any, l: any) => o.g - l.g || l.k - o.k || (o.t.id < l.t.id ? -1 : 1),
    )
    .map((o: any) => o.t);
}

/** Galerie-Seite -> Paket und Schritt (Seite 0 und 1 sind Paket 0) (`cm`, Export `k`). */
export function curatedPackage(page: number) {
  return page <= 1
    ? {
        pkg: 0,
        step: Math.max(0, page),
      }
    : {
        pkg: page - 1,
        step: 0,
      };
}

/** Pool einer Galerie-Seite: Rezept-Konzepte, gezeichnete Monogramme und Eingriffe, Signature-Vorlagen; mit Route gefiltert und abgedunkelt (`Tm`, Export `d`). */
export function curationCandidates(
  input: LogoInput,
  options: CandidateOptions = {},
) {
  const { pkg } = curatedPackage(options.page ?? 0);
  const routed = routedInput(input);
  const signature = signatureConcepts(
    routed,
    pkg,
    !!options.signatureEntwuerfe,
    options.seed,
    options.signatureVarianten !== false,
  );
  const recipes = recipePool(routed, pkg, options);
  const drawn = [
    ...(options.signatureEntwuerfe || GEZEICHNET.monogramme
      ? drawnMonogramConcepts(
          routed,
          recipes,
          options.seed ?? inputSeed(routed),
        )
      : []),
    ...(options.signatureEntwuerfe ||
    GEZEICHNET.eingriffe ||
    GEZEICHNET.markierungSinn
      ? eingriffeConcepts(routed, recipes, options.seed ?? inputSeed(routed))
      : []),
  ];
  const pool = [...recipes, ...drawn, ...signature];
  return routeOf(routed)
    ? darkenForRoute(
        pool.filter((l) => fitsRoute(l, routed)),
        routed,
      )
    : pool;
}

function drawnMonogramConcepts(
  input: LogoInput,
  pool: LogoConcept[],
  seed: number,
) {
  const r = monogramLetters(input, true);
  if (!r || Array.from(r).length !== 2) return [];
  const i = [];
  const a = new Set();
  const o = rng(mixSeed(seed, 54439)).shuffle(
    KONSTRUKTIONEN.filter((l) => !KONSTRUKTIONEN_AUS.includes(l)),
  );
  for (const l of pool) {
    if (a.size >= 3) break;
    const u = l.name.font;
    if (getFont(u.key).cat === "script" || a.has(u.key)) continue;
    a.add(u.key);
    const { recipeId, symbolPosition, ...p } = l;
    for (const g of o)
      i.push(
        finishConcept(
          {
            ...p,
            layout: "stacked",
            symbol: {
              kind: "monogram",
              letters: r,
              container: "none",
              font: u,
              konstruktion: g as MonogramKonstruktion,
            },
            symbolFilled: false,
            symbolSize: "large",
            typo: undefined,
            nameFormat: undefined,
          },
          input,
        ),
      );
  }
  return i;
}

function eingriffeConcepts(
  input: LogoInput,
  pool: LogoConcept[],
  seed: number,
) {
  if (nameWords(input.name).length !== 1) return [];
  const i = [];
  const a = rng(mixSeed(seed, 57769));
  const s = new Set();
  for (const o of pool) {
    if (i.length >= 3) break;
    if (o.layout !== "wordmark" || o.typo) continue;
    const { concept } = applyNameFormat(o, input);
    const u = possibleEingriffe(
      cleanText(input.name),
      concept.name.font,
      concept.name.case as CaseKey,
      concept.name.tracking,
    ).filter(
      (h) =>
        !s.has(h) &&
        !EINGRIFFE_AUS.includes(h) &&
        (h === "markierung" || GEZEICHNET.eingriffe),
    );
    if (!u.length) continue;
    const m = a.pick(u);
    s.add(m);
    i.push(
      finishConcept(
        {
          ...o,
          typo: {
            ...(m === "markierung"
              ? {
                  markColor: "accent",
                }
              : {}),
            eingriff: m as Eingriff,
          },
        },
        input,
      ),
    );
  }
  return i;
}

function drawnRenders(
  concept: LogoConcept,
  input: LogoInput,
  fonts: FontStore,
) {
  const r = konstruktionOf(concept);
  if (r && concept.symbol?.kind === "monogram")
    return fonts.has(concept.symbol.font)
      ? availableKonstruktionen(
          fonts.get(concept.symbol.font),
          concept.symbol.letters,
        ).includes(r)
      : false;
  if (eingriffOf(concept)) {
    const a = {
      ...concept,
      typo: undefined,
    };
    try {
      return (
        renderLogo(concept, input, fonts).body !==
        renderLogo(a, input, fonts).body
      );
    } catch {
      return false;
    }
  }
  return true;
}

/** Passt das Konzept zur Route (Palette, Schriften, Vorlage, Zeichen)? (`gm`, Export `a4`). */
export function fitsRoute(concept: LogoConcept, input: LogoInput) {
  if (!routeOf(input)) return true;
  if (
    paletteBlocked(concept.palette, input) ||
    fontsNeeded([concept], "logo", input).some((a) => fontBlocked(a, input))
  )
    return false;
  if (concept.signature) {
    const a = getSignatureTemplate(concept.signature.id);
    return !a || (!templateBlocked(a, input) && templateInRoute(a, input));
  }
  const t = concept.layout !== "wordmark" && !!concept.symbol;
  if (
    (t &&
      concept.symbol &&
      containerBlocked(concept.symbol.container, input)) ||
    (concept.layout === "badge" &&
      concept.badge === "seal" &&
      containerBlocked("seal", input)) ||
    (concept.layout === "badge" &&
      (concept.badge ?? "frame") === "arch" &&
      containerBlocked("arch", input))
  )
    return false;
  if (concept.symbol?.kind === "icon" && (t || concept.typo?.letterSwap)) {
    const a = getIcon(concept.symbol.id);
    if (a && themesBlocked(a.themes, input)) return false;
  }
  return true;
}

function darkenForRoute(concepts: LogoConcept[], input: LogoInput) {
  const t = routeOf(input)?.axes?.dark;
  if (!t || !(t.sicher > 0)) return concepts;
  const r = Math.max(0, Math.min(1, 0.35 + 0.55 * t.v * t.sicher));
  return concepts.map((s) => {
    const o = (s.cardBackground ?? "paper") !== "paper";
    const l = (hash(s.id) % 1e3) / 1e3 < r;
    return o === l ? s : withCardBackground(s, l ? "ink" : "paper");
  });
}

function recipePool(input: LogoInput, page: number, options: CandidateOptions) {
  const r = options.pool ?? POOL_SIZE;
  const i = generateConcepts(input, {
    count: r,
    page,
    seed: options.seed,
    taste: options.taste,
  });
  const a = new Set(i.map((u) => lookKey(u)));
  if (a.size >= Math.ceil(r / 2)) return i;
  const s = new Set(i.map((u) => u.id));
  const o = generateConcepts(input, {
    count: r * 2,
    page,
    seed: options.seed,
    taste: options.taste,
  }).filter((u) => !s.has(u.id));
  const l = [];
  for (const u of o) {
    if (l.length >= 6) break;
    const m = lookKey(u);
    if (!a.has(m)) {
      a.add(m);
      l.push(u);
    }
  }
  return [...i, ...l];
}

function hasOutlinedText(concept: LogoConcept) {
  const n = concept.signature
    ? getSignatureTemplate(concept.signature.id)
    : undefined;
  return !!n?.elemente.some((t) => t.typ === "text" && !!t.kontur);
}

/** Konzept auf andere Kartenflaeche setzen; Akzente, die dort nicht sichtbar waeren, fallen weg (`eo`, Export `R`). */
export function withCardBackground(concept: LogoConcept, background: any) {
  const t = hasOutlinedText(concept) ? "paper" : background;
  const r = contrast(concept.palette.primary, concept.palette.paper) >= 4.5;
  const i = t === "primary" && !r ? "ink" : t;
  const a = withId({
    ...concept,
    cardBackground: i,
  });
  return accentsVisible(a, i) ? a : withId(dropInvisibleAccents(a));
}
