/**
 * High-End-Wertung eines Namens (nameFinder-Chunk: `wu`, `Si`, `Ye`, `vi`, `$a`, `Wi`, `Bi`,
 * `ja`, `Hi`).
 *
 * Ein lineares Modell ueber 22 Merkmale (Personenmarke, Herkunft des Worts, Silben, Laenge,
 * Weichheit, Passung zur Lage, Zusatz, Naehe zu Marken) ergibt 0 bis 100 Punkte: wie sehr
 * der Name nach einer hochwertigen Maklermarke klingt.
 */
import { fold, letterCount, memo } from "./fold";
import { corpusMatchLabel, tradeBrandOf } from "./rules";
import { isTabu } from "./lexicon";
import { fieldFit, softness, syllables } from "./quality";
import { isCompound, placeFieldOfName, REAL_COMPOUNDS, WORD_ORIGIN } from "./styles";
import type { NameProfile } from "./profile";

/** Gewichte je Merkmal, das erste ist der Achsenabschnitt (`wu`). */
const WEIGHTS: readonly number[] = [
  3.715, 0.1613, 0.165, 0.0663, -0.0405, 0.0283, 0, 0.0554, 0.024, 0.0344, -0.1481, -0.081, -0.1414,
  -0.1272, -0.1238, -0.1163, 0.0077, -0.0905, 0.0608, 0.039, 0.026, -0.1179,
];

/** Namen der Merkmale (`Si`). */
export const FEATURES = [
  "bias",
  "voll",
  "nachname",
  "atelier",
  "initialPunkt",
  "initialen",
  "partner",
  "ortAdj",
  "ortsteil",
  "deutsch",
  "fremd",
  "kunst",
  "kompositum",
  "wert",
  "mehrwort",
  "silben",
  "laenge",
  "weich",
  "passung",
  "zusatzOrt",
  "zusatzRealitaeten",
  "konflikt",
] as const;
export type Feature = (typeof FEATURES)[number];

/** Index je Merkmal (`Ye`). */
export const FEATURE_INDEX = Object.fromEntries(FEATURES.map((f, i) => [f, i])) as Record<
  Feature,
  number
>;

const FEATURE_CACHE = new Map<string, number[]>();

/** Merkmale eines Namens im Profil, mit Zwischenspeicher (`$a`). */
export function features(profile: NameProfile, name: string, suffix?: string): number[] {
  const place = profile.place;
  const key = [
    place?.known ? place.place.name : (place?.name ?? ""),
    profile.person?.full ?? "",
    profile.company?.full ?? "",
    profile.cls ?? "",
    +profile.water,
    +profile.hills,
    +profile.wine,
    name,
    suffix ?? "",
  ].join("|");
  return memo(FEATURE_CACHE, key, () => computeFeatures(profile, name, suffix));
}

/** `Wi`: die 22 Merkmale in der Reihenfolge von `FEATURES`. */
function computeFeatures(profile: NameProfile, name: string, suffix?: string): number[] {
  const person = profile.person;
  const company = profile.company;
  const place = profile.place?.known ? profile.place.place : null;
  const words = name.split(/\s+/).filter((w) => w !== "&");
  const key = fold(name);
  const ownTokens = new Set(
    [
      ...(person?.tokens ?? []),
      ...(company ? [company.core, ...company.core.split(/\s+/)] : []),
    ].map((w) => fold(w)),
  );
  const hasOwn = words.some((w) => ownTokens.has(fold(w)));
  const initials = /^\p{Lu}{2,3}$/u.test(name);
  const initialDot = /^\p{Lu}\. /u.test(name);
  const atelier = hasOwn && /^(Atelier|Studio|Haus) /.test(name);
  const partner = /& (Partner|Söhne)/.test(name);
  const full = !!person && key === fold(person.full);
  const surname = hasOwn && !full && !initialDot && !atelier && !partner;
  const adjectives = place
    ? [place.adj, ...(place.marks ?? []).flatMap((m) => [m.adj])]
        .filter((a): a is string => !!a)
        .map(fold)
    : [];
  const placeAdj = !hasOwn && adjectives.includes(fold(words[0] ?? ""));
  const placeNames = place ? [place.name, ...(place.marks ?? []).map((m) => m.name)].map(fold) : [];
  const placePart = !hasOwn && !placeAdj && placeNames.includes(key);
  const word = !hasOwn && !initials && !placeAdj && !placePart;
  const origin = word
    ? (WORD_ORIGIN.get(key) ??
      (isCompound(name) || REAL_COMPOUNDS.has(key.replace(/\s+/g, ""))
        ? "komp"
        : words.length > 1
          ? "phrase"
          : "kunst"))
    : null;
  const field = word ? placeFieldOfName(name) : "neutral";
  const fit = word ? fieldFit(profile.cls, field, profile.water, profile.hills, profile.wine) : 0;
  const suffixPlace =
    suffix && place && [place.name, ...(place.marks ?? []).map((m) => m.name)].includes(suffix)
      ? 1
      : 0;
  const conflict =
    !hasOwn && (corpusMatchLabel(name) || tradeBrandOf(name) || words.some((w) => isTabu(w)))
      ? 1
      : 0;
  const syl = syllables(name);
  return [
    1,
    +full,
    +surname,
    +atelier,
    +initialDot,
    +initials,
    +partner,
    +placeAdj,
    +placePart,
    +(origin === "de"),
    +(origin === "fremd"),
    +(origin === "kunst"),
    +(origin === "komp"),
    +(word && /wert$/i.test(name)),
    +(word && words.length > 1),
    word ? Math.min(2, syl - 2) : 0,
    word ? (letterCount(name) - 8) / 4 : 0,
    word ? softness(name) - 0.5 : 0,
    fit,
    suffixPlace,
    +(suffix === "Realitäten"),
    conflict,
  ];
}

/** Gewichtete Summe (`Bi`). */
function linear(values: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += (WEIGHTS[i] ?? 0) * values[i]!;
  return sum;
}

/** Punkte 0 bis 100 aus den Merkmalen (`ja`). */
export function highendFromFeatures(values: readonly number[]): number {
  return Math.round(Math.max(0, Math.min(100, ((linear(values) - 3) / 1.4) * 100)));
}

/** High-End-Punkte eines Namens (`Hi`). */
export function highendScore(profile: NameProfile, name: string, suffix?: string): number {
  return highendFromFeatures(features(profile, name, suffix));
}
