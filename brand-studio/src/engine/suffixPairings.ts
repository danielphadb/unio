/**
 * Paarungen fuer den Zusatz (Grotesk-Versalien, kursiv, mono, gross, Kapitaelchen ...) aus
 * src/engine/suffixPairings.json (engine `Ku` ... `Cu`).
 */
import suffixPairingsData from "./suffixPairings.json";
import type { FontRef, LogoConcept } from "../types";
import type { Rng } from "./rng";
import { FONTS, getFont, italicVariant } from "./fonts";
import {
  LARGE_SUFFIX_SCALE,
  clampSuffixScale,
  fontForm,
  suffixTracking,
} from "./tracking";
import { cleanText } from "./cleanText";
import { fontCovers } from "./charset";

const ALL_STYLES = ["elegant", "luxus", "modern", "warm", "mutig", "natur"];

const TEXT_FORMS = [
  "antiqua",
  "didone",
  "geometric",
  "grotesk",
  "condensed",
  "slab",
  "extended",
];

const SUFFIX_PAIRINGS = suffixPairingsData;

export function suffixPairingOf(concept: LogoConcept) {
  const n = clampSuffixScale(concept.typo?.suffixScale);
  const t = concept.suffix.font;
  const r = getFont(t.key);
  return (n ?? 0) >= LARGE_SUFFIX_SCALE
    ? "gross"
    : t.style === "italic"
      ? "kursiv"
      : fontForm(t.key) === "mono"
        ? "mono"
        : t.weight >= 600 && t.key !== concept.name.font.key
          ? "fett-klein"
          : r.capsOnly && r.cat === "serif" && concept.suffix.case !== "upper"
            ? "kapitaelchen"
            : t.key === concept.name.font.key
              ? "gleich"
              : concept.suffix.case !== "upper" && !r.capsOnly
                ? "gemischt"
                : "standard";
}

const between = (rnd: Rng, min: number, max: number) =>
  min + (max - min) * rnd.next();

const round2 = (e: any) => Math.round(e * 100) / 100;

function pairingFont(
  pairing: any,
  concept: LogoConcept,
  suffix: string,
  planned: any,
  rnd: Rng,
) {
  const a = concept.name.font;
  const s = (m: any) =>
    !!m && !getFont(m.key).nurVorlage && fontCovers(m.key, suffix);
  const o = (m: any) =>
    planned?.find((h: any) => h.key !== a.key && m(h) && s(h)) ?? null;
  const l = (m: any) => {
    if (planned) return null;
    const h = rnd.shuffle(
      pairing.vorschlaege.filter(
        (p: any) => p !== a.key && FONTS.some((g) => g.key === p),
      ),
    );
    for (const p of h) {
      const g = m(p);
      if (s(g)) return g;
    }
    return null;
  };
  const u = (m: any) => getFont(m);
  switch (pairing.font) {
    case "grotesk":
      return s(concept.suffix.font) ? concept.suffix.font : null;
    case "name":
      return u(a.key).cat === "script" ||
        a.weight >= 600 ||
        a.style === "italic"
        ? null
        : s(a)
          ? a
          : null;
    case "mono":
      return (
        o((m: any) => fontForm(m.key) === "mono" && m.style !== "italic") ??
        l((m: any) => ({
          key: m,
          weight: Math.min(...u(m).weights),
        }))
      );
    case "antiqua-kursiv":
      return (
        o((m: any) => m.style === "italic" && u(m.key).cat === "serif") ??
        l((m: any) => italicVariant(m))
      );
    case "grotesk-fett":
      return a.weight >= 600
        ? null
        : (o(
            (m: any) =>
              u(m.key).cat === "sans" &&
              m.weight >= 600 &&
              m.style !== "italic" &&
              fontForm(m.key) !== "mono",
          ) ??
            l((m: any) => ({
              key: m,
              weight: Math.max(...u(m).weights),
            })));
    case "kapitaelchen":
      return (
        o((m: any) => u(m.key).capsOnly === true && u(m.key).cat === "serif") ??
        l((m: any) => ({
          key: m,
          weight: Math.min(...u(m).weights),
        }))
      );
  }
}

export function applySuffixPairing(
  concept: LogoConcept,
  pairing: any,
  font: FontRef,
  rnd: Rng,
) {
  const i =
    concept.name.case === "upper" ||
    concept.nameFormat === "upper" ||
    !!getFont(concept.name.font.key).capsOnly;
  const a = pairing.caseWieName && i ? "upper" : pairing.case;
  const s = round2(between(rnd, pairing.scale[0], pairing.scale[1]));
  const o =
    a === "upper" || getFont(font.key).capsOnly
      ? between(rnd, pairing.tracking[0], pairing.tracking[1])
      : between(rnd, -0.01, 0.01);
  const l = round2(suffixTracking(a, o, font, s));
  return {
    ...concept,
    suffix: {
      font,
      case: a,
      tracking: l,
    },
    typo: {
      ...(concept.typo ?? {}),
      suffixScale: s,
    },
  };
}

export function suffixPairingsFor(
  concept: LogoConcept,
  suffix: string,
  planned: any,
  rnd: Rng,
) {
  const i = cleanText(suffix);
  if (!i) return [];
  const a = fontForm(concept.name.font.key);
  const s = [];
  for (const o of SUFFIX_PAIRINGS) {
    if (
      o.id === "standard" ||
      !o.nameForms.includes(a) ||
      !o.styles.includes(concept.style)
    )
      continue;
    const l = pairingFont(o, concept, i, planned, rnd);
    if (l) {
      s.push({
        p: o,
        font: l,
      });
    }
  }
  return s;
}
