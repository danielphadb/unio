/**
 * Regeln hochwertiger Marken: Anti-Muster (Laufweite, Zusatz, Rahmen, Farben, Schriftfamilien),
 * Aehnlichkeit zum Referenzkorpus (Zwilling, rechtliche Naehe) und Namenssperre fuer Vorlagen
 * (engine `Qe` ... `Al`). `NEUTRAL_ICONS` und `BLOCKED_ICONS` sind in der gesicherten Fassung leer.
 */
import type { LogoInput } from "./logoTypes";
import type { LogoConcept } from "../types";
import { CORPUS_MARKS } from "./corpusMarks";
import { CORPUS_TECH_MARKS } from "./corpusTechMarks";
import { GENERIC_WORDS } from "./personName";
import {
  LARGE_SUFFIX_SCALE,
  SUFFIX_CAPS_TRACKING,
  clampSuffixScale,
  fontForm,
  isCaps,
  suffixTracking,
  trackingRanges,
} from "./tracking";
import { applyNameFormat, typoFonts } from "./renderLogo";
import { cleanText } from "./cleanText";
import { getFont } from "./fonts";
import { getIcon } from "../symbols/Icons";

export const HIGH_END_STYLES = ["luxus", "elegant", "modern"];

const TOLERANCE = 0.006;

const inRanges = (value: number, ranges: number[][]) =>
  ranges.some(([t, r]) => value >= t! - TOLERANCE && value <= r! + TOLERANCE);

const HOUSE_THEMES = ["haus", "dach", "tuer", "schluessel"];

export const NEUTRAL_ICONS: string[] = [];

export const BLOCKED_ICONS: string[] = [];

const CHEAP_CONTAINERS = ["shield", "hexagon", "diamond", "house"];

export function fontFamilies(concept: LogoConcept, input: LogoInput) {
  const t = new Set([concept.name.font.key]);
  if (cleanText(input.suffix)) {
    t.add(concept.suffix.font.key);
  }
  for (const i of typoFonts(concept)) t.add(i.key);
  if (concept.layout !== "wordmark" && concept.symbol?.kind === "monogram") {
    t.add(concept.symbol.font.key);
  }
  return t;
}

/** Regelverstoesse hochwertiger Marken mit Regel-Code und Hinweis (`Ai`). */
export function antiPatterns(concept: LogoConcept, input: LogoInput) {
  if (concept.signature) return [];
  const { concept: t, input: r } = applyNameFormat(concept, input);
  const i = [];
  const a = t.style;
  const s = a === "luxus" || a === "elegant";
  const o = HIGH_END_STYLES.includes(a);
  const l = getFont(t.name.font.key);
  const u = !!cleanText(r.suffix);
  const m = !!t.symbol && t.layout !== "wordmark";
  if (!inRanges(t.name.tracking, trackingRanges(t.name.font, t.name.case))) {
    i.push({
      rule: "L03",
      hint: "Laufweite passt nicht zur Schriftform.",
    });
  }
  const h = t.typo?.split;
  if (h && (h.case || h.tracking !== undefined || h.font)) {
    const k = h.font ?? t.name.font;
    const v = h.case ?? t.name.case;
    const M = h.tracking ?? t.name.tracking;
    if (
      !((h.scale ?? 1) <= 0.8
        ? Math.abs(suffixTracking(v, M, k) - M) < TOLERANCE
        : inRanges(M, trackingRanges(k, v)))
    ) {
      i.push({
        rule: "L03",
        hint: "Laufweite eines Namensteils passt nicht zur Schriftform.",
      });
    }
  }
  const p = clampSuffixScale(t.typo?.suffixScale);
  const g = (p ?? 0) >= LARGE_SUFFIX_SCALE;
  if (
    u &&
    t.suffix.case === "upper" &&
    (g
      ? Math.abs(
          suffixTracking("upper", t.suffix.tracking, t.suffix.font, p) -
            t.suffix.tracking,
        ) > TOLERANCE
      : !inRanges(t.suffix.tracking, [SUFFIX_CAPS_TRACKING]))
  ) {
    i.push({
      rule: "L05",
      hint: g
        ? "Grosser Zusatz in Versalien 0,04 bis 0,20 em sperren."
        : "Zusatz in Versalien 0,10 bis 0,30 em sperren.",
    });
  }
  if (m && t.symbol!.kind === "icon" && t.symbol!.container !== "none") {
    i.push({
      rule: "A07",
      hint: "Ein Symbol in einer Form wirkt wie ein Stock-Logo. Lass das Zeichen frei stehen.",
    });
  }
  if (
    m &&
    t.symbolFilled &&
    (t.symbol!.container === "square" || t.symbol!.container === "rounded")
  ) {
    i.push({
      rule: "A12",
      hint: "Ein gefülltes Quadrat wirkt wie ein App-Icon, nicht wie eine Marke.",
    });
  }
  if (
    t.layout === "badge" &&
    t.symbol?.kind === "icon" &&
    t.symbol.id === "abstrakt-kreissegmente"
  ) {
    i.push({
      rule: "A07",
      hint: "Fenster-Quadranten im Emblem wirken wie ein Stock-Logo.",
    });
  }
  if (t.layout === "badge" && (t.badge ?? "frame") === "frame") {
    i.push({
      rule: "L10",
      hint: "Ein Rahmen um alles wirkt wie ein Absender. Eine freie Wortmarke ist hochwertiger.",
    });
  }
  if (!o) return i;
  if (
    u &&
    l.cat === "serif" &&
    getFont(t.suffix.font.key).cat === "serif" &&
    !t.typo?.inlineSuffix &&
    !(g && t.suffix.font.key === t.name.font.key)
  ) {
    i.push({
      rule: "L05",
      hint: "Unter einem Antiqua-Namen steht der Zusatz in Grotesk.",
    });
  }
  if (fontFamilies(t, r).size > 2) {
    i.push({
      rule: "L13",
      hint: "Höchstens zwei Schriftfamilien.",
    });
  }
  const w =
    l.cat === "script" && !!h?.font && getFont(h.font.key).cat !== "script";
  if (l.cat === "script" && !w) {
    i.push({
      rule: "A10",
      hint: "Schreibschrift nur als Akzent, nicht für den ganzen Namen.",
    });
  }
  if (
    a === "luxus" &&
    t.layout === "badge" &&
    t.badge !== undefined &&
    t.badge !== "frame"
  ) {
    i.push({
      rule: "L10",
      hint: "Emblem wirkt wie ein Absender, nicht wie eine Luxusmarke.",
    });
  }
  if (s && m && CHEAP_CONTAINERS.includes(t.symbol!.container)) {
    i.push({
      rule: "A07",
      hint: "Schild, Sechseck, Raute und Hausform wirken billig.",
    });
  }
  if (a === "luxus" && m && t.symbol!.kind === "icon") {
    let k: any[] = [];
    try {
      k = getIcon(t.symbol!.id).themes;
    } catch {
      k = [];
    }
    if (
      !NEUTRAL_ICONS.includes(t.symbol!.id) &&
      k.some((v) => HOUSE_THEMES.includes(v))
    ) {
      i.push({
        rule: "A01",
        hint: "Haus, Dach, Tür oder Schlüssel als Zeichen kommen im Luxus nicht vor.",
      });
    }
  }
  if (s) {
    const k = new Set<string>([t.colors.name]);
    if (h?.color) {
      k.add(h.color);
    }
    if (u) {
      k.add(t.colors.suffix);
    }
    if (m || t.typo?.letterSwap) {
      k.add(t.colors.symbol);
    }
    if (t.typo?.markColor) {
      k.add(t.typo.markColor);
    }
    if (k.size > 2) {
      i.push({
        rule: "L02",
        hint: "Eine Farbe und höchstens ein Akzent.",
      });
    }
  }
  return i;
}

function foldName(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ø/gi, "o")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const withoutGenericWords = (text: string) =>
  text
    .split(/\s+/)
    .filter((n) => n && !GENERIC_WORDS.has(n.toLocaleLowerCase("de-AT")))
    .join(" ");

let corpusIndexCache: any = null;

const corpusIndex = () =>
  corpusIndexCache ??
  (corpusIndexCache = [...CORPUS_MARKS, ...CORPUS_TECH_MARKS].map((e) => ({
    row: e,
    names: new Set(
      [
        foldName(e[1]!),
        foldName(e[2]!),
        foldName(withoutGenericWords(e[2]!)),
      ].filter((n) => n.length >= 2),
    ),
  })));

const trackingClass = (tracking: number) =>
  tracking < 0.03 ? 0 : tracking < 0.09 ? 1 : 2;

/** Marke aus dem Korpus, der das Konzept in allen Merkmalen gleicht (`Ei`). */
export function corpusTwin(concept: LogoConcept, input: LogoInput) {
  return corpusMatch(concept, input)?.twin ?? null;
}

/** Rechtliche Naehe: Korpus-Marke mit gleichem Namen und aehnlichem Auftritt (`Ml`). */
export function legalProximity(concept: LogoConcept, input: LogoInput) {
  const t = corpusMatch(concept, input);
  return t && !t.twin ? t.near : null;
}

function corpusMatch(concept: LogoConcept, input: LogoInput) {
  if (concept.signature) return null;
  const { concept: t, input: r } = applyNameFormat(concept, input);
  const name = cleanText(r.name);
  const nameKeys = new Set(
    [foldName(name), foldName(withoutGenericWords(name))].filter(
      (g) => g.length >= 2,
    ),
  );
  if (!nameKeys.size) return null;
  const meta = getFont(t.name.font.key);
  const schrift =
    meta.cat === "serif" ? "serif" : meta.cat === "script" ? "script" : "sans";
  const schreibung = isCaps(t.name.font, t.name.case)
    ? "upper"
    : t.name.case === "lower"
      ? "lower"
      : "mixed";
  const trackingStufe = trackingClass(t.name.tracking);
  const isWordmark = t.layout === "wordmark" || !t.symbol;
  const form = fontForm(t.name.font.key);
  let near = null;
  for (const { row, names } of corpusIndex()) {
    if (![...nameKeys].some((S) => names.has(S))) continue;
    const [x, , , y, f, d, b, z] = row;
    const k = d === "eng" ? 0 : d === "normal" ? 1 : 2;
    const v = ["Name"];
    if (y === schrift) {
      v.push("Schriftart");
    }
    if (z && z === form) {
      v.push("Schriftform");
    }
    if (f === schreibung) {
      v.push("Schreibung");
    }
    if (k === trackingStufe) {
      v.push("Laufweite");
    }
    if (!!b == !isWordmark) {
      v.push(isWordmark ? "ohne Bildzeichen" : "mit Bildzeichen");
    }
    if (v.length === 6)
      return {
        twin: x,
        near: {
          marke: x,
          merkmale: v,
        },
      };
    let M = 0;
    if (y === schrift) {
      M += 1;
    }
    if (f === schreibung) {
      M += 1;
    }
    M += k === trackingStufe ? 1 : Math.abs(k - trackingStufe) === 1 ? 0.5 : 0;
    if (!b && isWordmark) {
      M += 0.5;
    }
    if (!near && f === schreibung && M >= 2.5) {
      near = {
        marke: x,
        merkmale: v,
      };
    }
  }
  return near
    ? {
        twin: null,
        near: near,
      }
    : null;
}

/** Sperre fuer Vorlagen: Korpus-Marke mit gleichem Namen und gleicher Schrift/Schreibung (`Al`). */
export function corpusTwinName(template: any, input: Pick<LogoInput, "name">) {
  const t = foldName(cleanText(input.name));
  if (t.length < 2) return null;
  for (const [r, i, a, s, o] of [...CORPUS_MARKS, ...CORPUS_TECH_MARKS]) {
    if (
      !(foldName(i!) !== t && foldName(a!) !== t) &&
      s === template.merkmale.schrift &&
      o === template.merkmale.schreibung
    )
      return r;
  }
  return null;
}
