/**
 * Namensprofil aus der Eingabe (nameFinder-Chunk: `ti`, `jn`, `bi`, `wi`, `nr`).
 *
 * Das Profil buendelt alles, was die Generatoren brauchen: Person, Firma, Ort mit Lage,
 * Stichworte und ihre Felder, Route, Kreativitaet und Filter. Es ist fuer einen Lauf fest;
 * die Generatoren arbeiten mit Kopien, die Schalter wie `relaxed` setzen.
 */
import { missingChars } from "../charset";
import { isWineRegion, placeClass, resolvePlace, type PlaceClass, type PlaceRef } from "../orte";
import type { NameFocus, NameKind, StyleKey } from "../../types";
import type { RouteParams } from "../../strategy/types";
import { flat, fold } from "./fold";
import { keywordFieldById, keywordFieldsFor, type KeywordField } from "./kwFields";
import { clicheOf, competitorMatch, offensiveOf, protectedTermOf } from "./rules";
import { maxConsonantRun } from "./quality";
import {
  parseCompany,
  parsePerson,
  PLACE_TOKENS,
  type CompanyName,
  type PersonName,
} from "./person";
import { COMPOUND_HEADS, COMPOUND_TAILS, ROOTS, type Creativity, type NameStyle } from "./styles";

/** Namensarten mit Beschriftung (`ti`, auch `RouteParams.nameKinds`). */
export const NAME_KINDS: ReadonlyArray<{ key: NameKind; label: string; hint: string }> = [
  { key: "person", label: "Personenmarke", hint: "Personenmarke aus deinem Namen" },
  { key: "ort", label: "Ortsbezug", hint: "Mit deinem Bezirk, Ort oder deiner Region" },
  {
    key: "kombination",
    label: "Zusammengesetzt",
    hint: "Zusammengesetzte und echte Wörter, auch als Redewendung, wie Raumwerk oder Dach & Fach",
  },
  {
    key: "kunstwort",
    label: "Kreativ",
    hint: "Erfundene, gut sprechbare Kunstwörter mit 4 bis 7 Buchstaben, wie Valora oder Fundea",
  },
  {
    key: "bildhaft",
    label: "Bildhaft",
    hint: "Wörter, die ein Bild wecken, wie Weitblick oder Sicherer Hafen",
  },
  {
    key: "fremdsprachig",
    label: "Fremdsprachig",
    hint: "Latein, Italienisch, Französisch, wie Fondaco oder Valor",
  },
  { key: "abgewandelt", label: "Abgewandelt", hint: "Alte Schreibweise, wie Contor oder Werth" },
  {
    key: "kurz",
    label: "Kurz und prägnant",
    hint: "Ein bis zwei Silben, höchstens fünf Buchstaben, wie Areal oder Basis",
  },
  { key: "klassisch", label: "Klassisch", hint: "Realitäten, Kanzlei oder & Partner" },
  { key: "initialen", label: "Initialen", hint: "Deine Anfangsbuchstaben" },
];

/** Route, soweit der Namensfinder sie nutzt. */
export type NameRoute = Partial<
  Pick<RouteParams, "territory" | "nameKinds" | "keywordFields" | "keywords" | "seed">
>;

/** Eingabe des Namensfinders. */
export interface NameInput {
  person?: string;
  company?: string;
  region?: string;
  focus: NameFocus[];
  styles: StyleKey[];
  keywords: string[];
  /** Route aus dem Markenkompass */
  route?: NameRoute;
}

/** Bezugsname fuer "aehnliche Namen" (Anker). */
export interface NameAnchor {
  kind: NameKind;
  name: string;
  style?: NameStyle;
  suffix?: string;
}

/** Einstellungen eines Laufs. */
export interface ProfileOptions {
  creativity?: Creativity;
  nameStyles?: readonly NameStyle[];
  /** Woerter, die nicht vorkommen duerfen */
  exclude?: readonly string[];
  minLen?: number;
  maxLen?: number;
}

/** Feld eines Stichworts mit der Beschriftung, die in Begruendungen steht. */
export interface ProfileField {
  field: KeywordField;
  label: string;
  /** stammt aus der Route */
  route?: boolean;
}

/** Profil eines Laufs (`nr`). Die Schalter unten setzen die Generatoren auf Kopien. */
export interface NameProfile {
  styles: StyleKey[];
  focus: NameFocus[];
  person: PersonName | null;
  place: PlaceRef | null;
  /** gefaltete Stichworte */
  kw: string[];
  /** Stichworte als Bestimmungswort ("Altbau" in "Altbauwerk") */
  kwHeads: Array<{ w: string; q: number }>;
  seed: number;
  /** bekannte Woerter (Orte, eigener Name) gelten als aussprechbar */
  known: Set<string>;
  water: boolean;
  hills: boolean;
  /** Stichworte und ihre verwandten Woerter */
  kwWords: Set<string>;
  /** Stichworte wie eingegeben */
  kwLabels: string[];
  /** Woerter, die eine Begruendung "passend zu deinem Stichwort" tragen */
  kwClaim: Set<string>;
  kwFields: ProfileField[];
  /** Wort aus einem Feld (gefaltet, ohne Leerzeichen) und die Beschriftung seines Stichworts */
  kwFieldWords: Map<string, string>;
  /** Beschriftungen, die aus der Route kommen */
  routeLabels: Set<string>;
  /** Stichworte woertlich: so nie als Name */
  kwLiteral: Set<string>;
  routeKinds: Set<NameKind>;
  creativity: Creativity;
  nameStyles: Set<NameStyle> | null;
  exclude: string[];
  minLen: number;
  maxLen: number;
  wien: boolean;
  /** Merkmale des Ankers (aehnliche Namen) */
  anchor: Set<string>;
  company: CompanyName | null;
  cls: PlaceClass | null;
  wine: boolean;
  // Schalter der Generatoren
  /** alle Sperren fuer Stil, Eimer und Zufall lockern */
  relaxed?: boolean;
  /** weitere Stile zulassen (gelernte Vorlieben) */
  wide?: boolean;
  /** nur Zusammensetzungen, die echte Woerter sind */
  affine?: boolean;
  /** ohne Eimer (alle Kandidaten auf einmal) */
  noBucket?: boolean;
  /** alle Eimer zugleich */
  allSlots?: boolean;
  /** Anzahl Eimer */
  buckets?: number;
  /** aktueller Eimer */
  slot?: number;
}

/** Woerter, die ein Stichwort mitbringt (`jn`). */
const KEYWORD_WORDS: Readonly<Record<string, string[]>> = {
  familie: ["heim", "haus", "statt", "zuhause", "casa", "garten"],
  kinder: ["heim", "garten", "zuhause", "casa"],
  zuhause: ["heim", "haus", "statt", "zuhause", "casa"],
  heim: ["heim", "statt", "casa"],
  altbau: ["stein", "hof", "kontor", "domus"],
  gruenderzeit: ["stein", "hof", "kontor"],
  neubau: ["neu", "bau", "quartier", "nova", "form", "werk"],
  projekt: ["quartier", "werk", "bau", "nova"],
  garten: ["garten", "hof", "linden", "gut", "silva", "verde"],
  gruen: ["garten", "linden", "wald", "verde", "silva"],
  natur: ["garten", "linden", "wald", "silva", "verde", "terra", "gut"],
  wald: ["wald", "silva"],
  ruhe: ["hof", "linden", "grund", "gut"],
  licht: ["licht", "lumen"],
  hell: ["licht", "lumen"],
  stadt: ["stadt", "quartier"],
  urban: ["stadt", "quartier", "kante"],
  wert: ["wert", "kontor", "bilanz", "valor", "fundus"],
  rendite: ["wert", "bilanz", "kontor", "valor"],
  anlage: ["wert", "kontor", "bilanz", "valor", "fundus"],
  investment: ["wert", "kontor", "bilanz", "valor"],
  vertrauen: ["grund", "stein", "gut", "fundus"],
  tradition: ["hof", "kontor", "stein", "gut"],
  see: ["see", "ufer", "blick"],
  wasser: ["see", "ufer"],
  berg: ["berg", "mons"],
  alpen: ["berg", "mons"],
  aussicht: ["blick", "vista"],
  blick: ["blick", "vista"],
  buero: ["kontor", "objekt", "werk"],
  gewerbe: ["kontor", "objekt", "flaechen", "werk"],
  erde: ["terra", "grund"],
  boden: ["terra", "fundus", "grund"],
  grund: ["grund", "terra", "fundus"],
  neu: ["neu", "nova"],
  haus: ["haus", "casa", "domus"],
  hof: ["hof", "atrium"],
  tor: ["porta"],
  stark: ["fortis", "kern", "kante"],
  ort: ["locus"],
  lage: ["locus", "adresse"],
  villa: ["villa"],
  morgen: ["alba"],
  raum: ["raum"],
};
/** Woerter, die zu einem Stichwort als "passend" gelten (`bi`). */
const KEYWORD_CLAIMS: Readonly<Record<string, string[]>> = {
  familie: ["heim", "zuhause", "daheim", "casa", "statt"],
  kinder: ["heim", "garten", "zuhause"],
  zuhause: ["heim", "daheim", "casa", "statt"],
  garten: ["garten", "hortus"],
  gruen: ["garten", "verde", "linden"],
  natur: ["silva", "verde", "wald", "garten"],
  wald: ["silva", "wald"],
  licht: ["licht", "lumen"],
  hell: ["licht", "lumen"],
  wert: ["wert", "valor"],
  rendite: ["wert", "bilanz"],
  anlage: ["wert", "bilanz"],
  neubau: ["neu", "nova", "bau", "quartier"],
  see: ["see", "ufer"],
  berg: ["berg", "mons"],
  aussicht: ["blick", "vista"],
  blick: ["blick", "vista"],
  gewerbe: ["kontor", "objekt", "flaechen"],
  buero: ["kontor"],
  haus: ["haus", "casa", "domus"],
};

const own = <T>(map: Readonly<Record<string, T>>, key: string): T | undefined =>
  Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;

/** Stichwort taugt als Wortbaustein (`wi`). */
function usableKeyword(word: string): boolean {
  const low = word.toLocaleLowerCase("de-AT");
  return !/^\p{L}{3,12}$/u.test(word) ||
    !/[aeiouäöü]/.test(low) ||
    clicheOf(word) ||
    protectedTermOf(word, true) ||
    competitorMatch(word)?.art === "gleich" ||
    offensiveOf(word) ||
    missingChars(word).length ||
    (low.match(/[aeiouäöü]/g) ?? []).length / low.length < 0.15 ||
    /q(?!u)|[xy]/.test(low)
    ? false
    : maxConsonantRun(low.replace(/y/g, "c")) <= 3;
}

const capitalize = (s: string): string => s.charAt(0).toLocaleUpperCase("de-AT") + s.slice(1);

/** Profil bauen (`nr`). */
export function buildProfile(
  input: NameInput,
  seed: number,
  options: ProfileOptions = {},
): NameProfile {
  const kw: string[] = [];
  const literal = new Set<string>();
  const kwHeads: Array<{ w: string; q: number }> = [];
  const kwLabels: string[] = [];
  const kwWords = new Set<string>();
  const fields: ProfileField[] = [];
  let placeFromKeyword: PlaceRef | null = null;
  for (const raw of input.keywords ?? []) {
    const word = raw.trim();
    const stripped = word.replace(/(wohnungen|wohnung|häuser|immobilien|objekte)$/i, "");
    const base = stripped.length >= 4 && stripped !== word ? stripped : word;
    literal.add(flat(word));
    literal.add(flat(base));
    const place = resolvePlace(base);
    if (place?.known) {
      placeFromKeyword = placeFromKeyword ?? place;
      continue;
    }
    if (word.length >= 3 && word.length <= 30 && !missingChars(word).length) {
      const label = capitalize(word);
      for (const field of [...keywordFieldsFor(word), ...keywordFieldsFor(base)])
        if (!fields.some((f) => f.field.id === field.id)) fields.push({ field, label });
    }
    if (!usableKeyword(base)) continue;
    const key = fold(base);
    if (!kw.includes(key)) {
      kw.push(key);
      kwLabels.push(base);
      kwWords.add(key);
      for (const w of own(KEYWORD_WORDS, key) ?? []) kwWords.add(w);
      if (
        !COMPOUND_HEADS.some((h) => fold(h.w) === key) &&
        !COMPOUND_TAILS.some((t) => t.w === key) &&
        base.length <= 8 &&
        !/e$/i.test(base)
      )
        kwHeads.push({
          w: capitalize(base.charAt(0) + base.slice(1).toLocaleLowerCase("de-AT")),
          q: 0.7,
        });
    }
  }
  const routeLabels = new Set<string>();
  for (const raw of input.route?.keywords ?? []) {
    if (typeof raw !== "string") continue;
    const word = raw.trim();
    if (
      word.length < 3 ||
      word.length > 30 ||
      missingChars(word).length ||
      resolvePlace(word)?.known
    )
      continue;
    literal.add(flat(word));
    const label = capitalize(word);
    for (const field of keywordFieldsFor(word))
      if (!fields.some((f) => f.field.id === field.id)) {
        fields.push({ field, label, route: true });
        routeLabels.add(label);
      }
  }
  const routeFields = (input.route?.keywordFields ?? [])
    .map((id) => (typeof id === "string" ? keywordFieldById(id) : undefined))
    .filter((f): f is KeywordField => !!f);
  if (routeFields.length) {
    const first: ProfileField[] = [];
    for (const field of routeFields) {
      if (first.some((f) => f.field.id === field.id)) continue;
      const hit = fields.find((f) => f.field.id === field.id);
      if (!hit) routeLabels.add(field.label);
      first.push(hit ? { ...hit, route: true } : { field, label: field.label, route: true });
    }
    fields.splice(
      0,
      fields.length,
      ...first,
      ...fields.filter((f) => !first.some((x) => x.field.id === f.field.id)),
    );
  }
  const fieldWords = new Map<string, string>();
  for (const { field, label } of fields)
    for (const w of field.words) {
      if (w.art === "wurzel") {
        kwWords.add(fold(w.w));
        for (const root of ROOTS)
          if (root.stem === w.stem || root.root === fold(w.w)) kwWords.add(root.root);
        continue;
      }
      const key = fold(w.w).replace(/\s+/g, "");
      if (key.length >= 4 && !fieldWords.has(key)) fieldWords.set(key, label);
    }
  let person = parsePerson(input.person);
  if (person && (protectedTermOf(person.last) || clicheOf(person.last))) person = null;
  const place = resolvePlace(input.region) ?? placeFromKeyword;
  const known = new Set(PLACE_TOKENS);
  for (const w of [
    ...(person?.tokens ?? []),
    ...(place && !place.known ? place.name.split(/\s+/) : []),
  ])
    known.add(fold(w));
  const marks = place?.known ? (place.place.marks ?? []).map((m) => m.name) : [];
  const water =
    marks.some((m) => /see$|See$|Donau|Mur|Inn|Salzach|Bodensee/.test(m)) ||
    (!!place?.known && /See|see$/.test(place.place.name)) ||
    kwWords.has("see");
  const hills =
    (!!place?.known && !!place.place.rural) ||
    marks.some((m) => /berg|Berg|stein|Nordkette/.test(m)) ||
    kwWords.has("berg");
  return {
    styles: [...new Set(input.styles ?? [])],
    focus: [...new Set(input.focus ?? [])],
    person,
    place,
    kw,
    kwHeads,
    seed,
    known,
    water,
    hills,
    kwWords,
    kwLabels,
    kwClaim: new Set(kw.flatMap((k) => [k, ...(own(KEYWORD_CLAIMS, k) ?? [])])),
    kwFields: fields,
    kwFieldWords: fieldWords,
    routeLabels,
    kwLiteral: literal,
    routeKinds: new Set(
      (input.route?.nameKinds ?? []).filter((k) => NAME_KINDS.some((n) => n.key === k)),
    ),
    creativity: options.creativity ?? "ausgewogen",
    nameStyles: options.nameStyles?.length ? new Set(options.nameStyles) : null,
    exclude: (options.exclude ?? [])
      .map((e) => fold(e.replace(/[*-]/g, "")).replace(/\s+/g, ""))
      .filter((e) => e.length >= 2),
    minLen: Math.max(0, Math.floor(options.minLen ?? 0)),
    maxLen: Math.floor(options.maxLen ?? 99) || 99,
    wien: !!place?.known && (place.place.name === "Wien" || place.place.parent === "Wien"),
    anchor: new Set(),
    company: parseCompany(input.company),
    cls: place?.known ? placeClass(place.place) : null,
    wine: !!place?.known && isWineRegion(place.place),
  };
}
