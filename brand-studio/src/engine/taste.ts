/**
 * Geschmack aus gemerkten und verworfenen Konzepten (Herz/Ausblenden): Profil und Faktoren fuer die
 * Auswahl von Schriftform, Stimmung und Zeichen (engine `Iu` ... `Dn`).
 */
import type { LogoConcept } from "../types";
import type { TasteProfile } from "./logoTypes";
import { fontForm, isCaps } from "./tracking";
import { paletteBaseId, paletteMood } from "./palettes";

const TASTE_WEIGHTS = {
  form: 1,
  recipe: 1,
  case: 0.7,
  track: 0.5,
  symbol: 0.8,
  mood: 0.6,
};

function tasteTokens(concept: LogoConcept) {
  const n =
    isCaps(concept.name.font, concept.name.case) ||
    concept.nameFormat === "upper";
  const t = Number(concept.name.tracking) || 0;
  const r = [
    `form:${fontForm(concept.name.font.key)}`,
    `case:${n ? "upper" : concept.name.case === "lower" ? "lower" : "mixed"}`,
    `track:${t < 0.03 ? "eng" : t < 0.09 ? "normal" : "weit"}`,
    `symbol:${concept.symbol && concept.layout !== "wordmark" ? "yes" : "no"}`,
    `mood:${paletteMood(concept.palette) ?? paletteBaseId(concept.palette)}`,
  ];
  if (concept.recipeId) {
    r.push(`recipe:${concept.recipeId}`);
  }
  return r;
}

export function tasteProfile(taste: any): TasteProfile {
  const n: Map<string, number> = new Map();
  const t = taste.liked ?? [];
  const r = taste.disliked ?? [];
  for (const s of t) {
    for (const o of tasteTokens(s)) n.set(o, (n.get(o) ?? 0) + 1);
  }
  for (const s of r) {
    for (const o of tasteTokens(s)) n.set(o, (n.get(o) ?? 0) - 1);
  }
  const i = t.length + r.length;
  const a: Map<string, number> = new Map();
  for (const [s, o] of n)
    a.set(s, Math.max(-1, Math.min(1, o / Math.max(2, Math.min(3, i)))));
  return {
    scores: a,
    n: i,
  };
}

export function tasteScore(concept: LogoConcept, profile: TasteProfile) {
  if (!profile.n) return 0;
  let t = 0;
  let r = 0;
  for (const i of tasteTokens(concept)) {
    const a = profile.scores.get(i) ?? 0;
    if (!a) continue;
    const s =
      (TASTE_WEIGHTS as Record<string, number>)[i.split(":")[0]!] ?? 0.5;
    t += a * s;
    r += s;
  }
  return r ? (t / r) * Math.min(1, r / 2) : 0;
}

export function tasteFactor(
  profile: TasteProfile | null | undefined,
  token: string,
) {
  return profile ? Math.exp(1.1 * (profile.scores.get(token) ?? 0)) : 1;
}
