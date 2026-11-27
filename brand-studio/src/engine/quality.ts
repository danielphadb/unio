/**
 * Qualitaetsmodell: Merkmale eines Konzepts und gewichtete Summe (Score 0 bis 100) fuer die
 * Kuratierung (engine `Ru` ... `_n`).
 */
import type { BrandInput, LogoConcept } from "../types";
import { NEUTRAL_ICONS, antiPatterns, corpusTwin } from "./highend";
import { applyNameFormat } from "./renderLogo";
import { cleanText } from "./cleanText";
import { fontForm, isCaps } from "./tracking";
import { getFont } from "./fonts";
import { isFineWeight } from "./logoCheck";
import { isPersonName } from "./personName";

function qualityFeatures(concept: LogoConcept, input: BrandInput) {
  const { concept: t, input: r } = applyNameFormat(concept, input);
  const i = t.typo;
  const a = i?.split;
  const s = getFont(t.name.font.key);
  const o = isCaps(t.name.font, t.name.case);
  let l = "none";
  if (i?.camel) {
    l = "camel";
  } else if (a) {
    if (a.font?.style === "italic") {
      l = "italic";
    } else if (a.font && a.font.key !== t.name.font.key) {
      l = "mix";
    } else if (a.stack && ((a.scale ?? 1) < 0.95 || a.case !== undefined)) {
      l = "stack";
    } else if (a.stack && !a.color) {
      l = "none";
    } else if (a.font) {
      l = "weight";
    } else if (a.color) {
      l = "color";
    } else if (a.case && a.case !== t.name.case) {
      l = "caps";
    }
  }
  const u = !!t.symbol && t.layout !== "wordmark";
  const m = !!cleanText(r.suffix);
  let h = "none";
  if (i?.inlineSuffix && m) {
    h = "inline";
  } else if (i?.mark === "hairline") {
    h = "hairline";
  } else if (i?.mark === "dot" || i?.sup) {
    h = "dot";
  } else if (i?.rule || i?.mark === "macron") {
    h = "rule";
  } else if (m && t.divider === "line" && t.layout !== "inline") {
    h = "line";
  } else if (t.divider === "dot") {
    h = "dot";
  }
  const p =
    Array.from(
      cleanText(input.name)
        .split(" ")
        .find((x) => !/\.$/.test(x)) ?? "",
    )[0] ?? "";
  return {
    style: t.style,
    form: fontForm(t.name.font.key),
    weight: isFineWeight(t.name.font.key, t.name.font.weight)
      ? "light"
      : t.name.font.weight >= 600
        ? "bold"
        : "regular",
    italic: t.name.font.style === "italic" || a?.font?.style === "italic",
    case: o ? "upper" : t.name.case === "lower" ? "lower" : "mixed",
    split: l,
    symbol: u ? (t.symbol!.kind === "monogram" ? "monogram" : "icon") : "none",
    corpusIcon:
      u && t.symbol!.kind === "icon" && NEUTRAL_ICONS.includes(t.symbol!.id),
    container: u && t.symbol!.container !== "none",
    filledSquare:
      u &&
      !!t.symbolFilled &&
      (t.symbol!.container === "square" || t.symbol!.container === "rounded"),
    layout: t.layout,
    badge: t.layout === "badge" ? (t.badge ?? "frame") : null,
    accent: h,
    format: concept.nameFormat ?? "full",
    umlautInitial:
      (concept.nameFormat ?? "full") === "initial" && /[^A-Za-z]/.test(p),
    scriptWhole:
      s.cat === "script" && !(a?.font && getFont(a.font.key).cat !== "script"),
    twoColorLower: t.name.case === "lower" && !!a?.color,
    recipe: !!concept.recipeId,
    issues: antiPatterns(concept, input).length,
    twin: !!corpusTwin(concept, input),
    company: !isPersonName(input),
  };
}

const FEATURES = {
  luxe: (e: any) => +(e.style === "luxus" || e.style === "elegant"),
  serif: (e: any) => +(e.form === "didone" || e.form === "antiqua"),
  didone: (e: any) => +(e.form === "didone"),
  condensed: (e: any) => +(e.form === "condensed"),
  script: (e: any) => +(e.form === "script"),
  light: (e: any) => +(e.weight === "light"),
  bold: (e: any) => +(e.weight === "bold" && e.form !== "didone"),
  italic: (e: any) => +e.italic,
  accent: (e: any) =>
    +(e.accent === "line" || e.accent === "rule" || e.accent === "hairline"),
  icon: (e: any) => +(e.symbol === "icon"),
  mono: (e: any) => +(e.symbol === "monogram"),
  container: (e: any) => +(e.container || !!e.badge),
  personFmt: (e: any) => +(e.format === "initial" || e.format === "surname"),
  firmPerson: (e: any) =>
    +(
      !!e.company &&
      (e.format === "initial" ||
        e.format === "surname" ||
        e.format === "monogram")
    ),
  twoTone: (e: any) =>
    +(e.split === "color" || e.split === "caps" || e.split === "camel"),
  recipe: (e: any) => +e.recipe,
  scriptWhole: (e: any) => +e.scriptWhole,
  inline: (e: any) => +(e.accent === "inline"),
  issues: (e: any) => Math.min(3, e.issues),
};

const QUALITY_MODEL = {
  base: 3.34,
  w: {
    luxe: 0.2,
    serif: 0.15,
    didone: 0.18,
    condensed: -0.08,
    script: -0.18,
    light: 0.09,
    bold: -0.11,
    italic: 0.17,
    accent: 0.08,
    icon: 0,
    mono: -0.17,
    container: 0,
    personFmt: -0.17,
    firmPerson: 0,
    twoTone: 0,
    recipe: 0.04,
    scriptWhole: -0.07,
    inline: -0.1,
    issues: 0,
  },
};

function baseScore(features: any, model = QUALITY_MODEL) {
  let t = model.base;
  for (const r in FEATURES)
    t +=
      ((model.w as Record<string, any>)[r] ?? 0) *
      (FEATURES as Record<string, any>)[r](features);
  return t;
}

export function scoreFeatures(features: any, model = QUALITY_MODEL) {
  let t = baseScore(features, model);
  if (features.twin) {
    t -= 1;
  }
  if (features.filledSquare) {
    t -= 0.3;
  }
  if (features.badge === "frame") {
    t -= 0.4;
  }
  if (features.umlautInitial) {
    t -= 0.4;
  }
  if (features.twoColorLower) {
    t -= 0.3;
  }
  return Math.max(0, Math.min(100, Math.round(t * 20)));
}

export function qualityScore(concept: LogoConcept, input: BrandInput) {
  return scoreFeatures(qualityFeatures(concept, input));
}
