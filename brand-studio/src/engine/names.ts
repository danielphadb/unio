/**
 * Namensfinder: oeffentliche Schnittstelle (nameFinder-Chunk: `wt`, `cr`, `cd`, `mt`, `pt`,
 * `ft`, `kt`, `Id`, `_d`; dazu die Exporte der Module unter `names/`).
 *
 * - `generateNames(input, options)`: eine Seite Namensvorschlaege
 * - `similarNames(anchor, input, count, options)`: Namen wie ein gemerkter Name
 * - `pruefeEigenenNamen(name, input)`: sieben Punkte zum eigenen Namen
 * - `alternativenFuer(name, input, count)`: Alternativen zum eigenen Namen
 * - `pruefeFremdnamen(names, input)`: KI-Vorschlaege mit denselben Regeln pruefen
 *
 * Gleiche Eingabe und gleicher Seed ergeben immer dieselben Namen. Namenskarten mit Logos
 * baut `nameCards.ts` (Logo-Engine); dieser Teil kommt ohne Logo-Engine aus.
 */
import type { NameKind } from "../types";
import { flat } from "./names/fold";
import {
  createStream,
  inputSeed,
  routeSeed,
  toSuggestion,
  type NameStream,
  type NameSuggestion,
  type StreamOptions,
} from "./names/batch";
import { ALL_STYLES, makeCandidate, suffixFor, type Candidate } from "./names/candidate";
import {
  GENERATORS,
  initialNames,
  ownBrandNames,
  personNames,
  placeNames,
} from "./names/generators";
import { buildProfile, type NameAnchor, type NameInput, type NameProfile } from "./names/profile";
import {
  looksLikePersonName,
  brandPart,
  cleanInput,
  FLOSKEL,
  GATTUNGSWOERTER,
} from "./names/check";
import {
  clicheOf,
  competitorMatch,
  corpusMatch,
  protectedTermOf,
  tradeBrandOf,
} from "./names/rules";
import { fold } from "./names/fold";
import { PLACE_TOKENS } from "./names/person";
import { hash } from "./rng";

export { NAME_KINDS, buildProfile } from "./names/profile";
export type {
  NameInput,
  NameRoute,
  NameAnchor,
  NameProfile,
  ProfileOptions,
} from "./names/profile";
export type { NameSuggestion, NameStream, StreamOptions } from "./names/batch";
export { createStream, inputSeed, routeSeed, styleOfName, PAGE_SIZE } from "./names/batch";
export type { NameChecks, NameNaehe } from "./names/candidate";
export { pruefeEigenenNamen, pruefeFremdnamen } from "./names/check";
export type { NamensPunkt, NamensPruefung, PunktId, PunktStatus, ForeignName } from "./names/check";
export { parsePerson, parseCompany, shortForm, MAX_NAME_LENGTH } from "./names/person";
export type { PersonName, CompanyName } from "./names/person";
export { keywordFieldsFor, KEYWORD_FIELDS } from "./names/kwFields";
export type { KeywordField, KeywordWord } from "./names/kwFields";
export { NAME_STYLES, CREATIVITY } from "./names/styles";
export type { NameStyle, Creativity } from "./names/styles";
export { domainsFor, slug } from "./names/domains";
export type { Domains } from "./names/domains";

/** Optionen fuer eine Seite. */
export interface NameOptions extends Omit<StreamOptions, "anchor"> {
  /** Namen je Seite */
  count: number;
  /** Seite ab 0 */
  page: number;
  /** fester Seed; fehlt er, kommt er aus der Eingabe */
  seed?: number;
}

/** Teile des Schluessels, die von der Route abhaengen (`wt`). */
const routeKey = (route: NameInput["route"]): unknown[] =>
  route
    ? [
        route.territory ?? "",
        route.nameKinds ?? [],
        route.keywordFields ?? [],
        route.keywords ?? [],
        route.seed ?? 0,
      ]
    : [];

/** Teile des Schluessels aus den Optionen (`ft`). */
const optionKey = (o: Partial<StreamOptions>): unknown[] => [
  o.nameStyles ? [...o.nameStyles].sort() : [],
  o.creativity ?? "ausgewogen",
  o.exclude ?? [],
  o.minLen ?? 0,
  o.maxLen ?? 0,
  o.liked ?? [],
  o.disliked ?? [],
];

/** Die letzten zwoelf Folgen (`cr`, `cd`). */
const STREAMS = new Map<string, NameStream>();
const MAX_STREAMS = 12;

/** Folge aus dem Zwischenspeicher oder neu (`mt`). */
function cachedStream(key: string, make: () => NameStream): NameStream {
  let stream = STREAMS.get(key);
  if (!stream) {
    stream = make();
    STREAMS.set(key, stream);
    if (STREAMS.size > MAX_STREAMS) STREAMS.delete(STREAMS.keys().next().value as string);
  }
  return stream;
}

/** Seite einer Folge, als Kopien (`pt`). */
function pageOf(stream: NameStream, page: number, count: number): NameSuggestion[] {
  const end = (page + 1) * count;
  while (stream.items.length < end && !stream.done) {
    const item = stream.next();
    if (item) stream.items.push(item);
  }
  return stream.items.slice(page * count, end).map((s) => ({
    ...s,
    checks: { ...s.checks },
    domains: s.domains && { ...s.domains, alt: [...s.domains.alt] },
  }));
}

/** Eine Seite Namensvorschlaege (`kt`, Export `q`). */
export function generateNames(input: NameInput, options: NameOptions): NameSuggestion[] {
  const count = Math.max(0, Math.floor(options.count));
  const page = Math.max(0, Math.floor(options.page));
  if (!count) return [];
  const seed = routeSeed((options.seed ?? inputSeed(input)) >>> 0, input.route);
  const kinds = options.kinds?.length ? [...new Set(options.kinds)].sort() : undefined;
  const key = JSON.stringify([
    "gen",
    input.person ?? "",
    input.company ?? "",
    input.region ?? "",
    input.focus,
    input.styles,
    input.keywords,
    seed,
    kinds ?? [],
    ...optionKey(options),
    ...routeKey(input.route),
  ]);
  return pageOf(
    cachedStream(key, () => createStream(input, seed, { ...options, kinds })),
    page,
    count,
  );
}

/** Namen wie ein Bezugsname, erst gleiche Art, dann gemischt (`Id`, Export `m`). */
export function similarNames(
  anchor: NameAnchor,
  input: NameInput,
  count: number,
  options: Partial<NameOptions> = {},
): NameSuggestion[] {
  const n = Math.max(0, Math.floor(count));
  if (!n) return [];
  const page = Math.max(0, Math.floor(options.page ?? 0));
  const seed = (options.seed ?? hash(`${anchor.kind}|${anchor.name}`)) >>> 0;
  const key = JSON.stringify([
    "mlt",
    anchor.kind,
    anchor.name,
    anchor.style ?? "",
    input.person ?? "",
    input.region ?? "",
    input.focus,
    input.styles,
    input.keywords,
    seed,
    ...optionKey(options),
    ...routeKey(input.route),
  ]);
  const stream = cachedStream(key, () => {
    const same = createStream(input, seed, { ...options, kinds: [anchor.kind], anchor });
    const mixed = createStream(input, (seed ^ 12059) >>> 0, { ...options, anchor });
    const keyOf = (s: { kind: NameKind; name: string; suffix?: string }): string =>
      fold(s.kind === "person" ? `${s.name} ${s.suffix ?? ""}` : s.name).replace(/\s+/g, "");
    const seen = new Set([keyOf(anchor)]);
    const out: NameStream = {
      items: [],
      done: false,
      next: () => {
        for (;;) {
          const s = (!same.done && same.next()) || (!mixed.done && mixed.next()) || null;
          if (!s) {
            if (same.done && mixed.done) {
              out.done = true;
              return null;
            }
            continue;
          }
          const k = keyOf(s);
          if (!seen.has(k)) {
            seen.add(k);
            return s;
          }
        }
      },
    };
    return out;
  });
  return pageOf(stream, page, n);
}

const byRank = (a: Candidate, b: Candidate): number => b.rank - a.rank || (a.key < b.key ? -1 : 1);
const EMPTY_INPUT: NameInput = { focus: [], styles: [], keywords: [] };

/**
 * Alternativen zum eigenen Namen (`_d`, Export `a`): Personenmarke, Kurzformen, Ort,
 * Initialen, Arten der Route, danach Vorschlaege des Generators. 6 bis 12 Namen.
 */
export function alternativenFuer(name: unknown, context?: NameInput, count = 12): NameSuggestion[] {
  const max = Math.max(6, Math.min(12, Math.floor(Number.isFinite(count) ? count : 12) || 12));
  const n = cleanInput(name);
  const base = context ?? EMPTY_INPUT;
  const isPerson = !!n && looksLikePersonName(n, buildProfile(base, 0));
  const words = fold(n)
    .split(/[\s&/.,-]+/)
    .filter(Boolean);
  const isCompany =
    !!n &&
    !FLOSKEL.test(n) &&
    !clicheOf(n) &&
    !protectedTermOf(n) &&
    !tradeBrandOf(n) &&
    [n, ...n.split(/\s+/)].every(
      (w) => competitorMatch(w)?.art !== "gleich" && corpusMatch(w)?.art !== "gleich",
    ) &&
    words.some((w) => !GATTUNGSWOERTER.has(w) && !PLACE_TOKENS.has(w));
  const input: NameInput = {
    ...base,
    person: isPerson ? n : base.person,
    company: isPerson ? undefined : isCompany ? n : base.company,
  };
  const seed = routeSeed((inputSeed(input) ^ hash(`alt|${n}`)) >>> 0, base.route);
  const p = buildProfile(input, seed);
  const relaxed: NameProfile = { ...p, relaxed: true };
  const taken = new Set(
    [
      n,
      brandPart(n, isPerson),
      p.person && isPerson ? p.person.full : "",
      p.company?.core ?? "",
      p.company?.full ?? "",
    ]
      .filter(Boolean)
      .map(flat),
  );
  const company = p.company;
  const shortCompany = company && !company.kern && (company.bare ?? company.tail);
  const brandProfile: NameProfile =
    shortCompany && !/\s/.test(shortCompany)
      ? { ...buildProfile({ ...input, company: shortCompany }, seed), relaxed: true }
      : relaxed;
  const person = p.person;
  const extra: Candidate[] = [];
  if (person && person.firsts.length >= 2) {
    const c = makeCandidate(
      "person",
      {
        name: `${person.firsts[0]} ${person.last}`,
        suffix: suffixFor(p, person.last),
        reason: "Nur der Rufname mit dem Nachnamen: kürzer und trotzdem ganz deiner.",
        q: 0.8,
        d: 0.6,
        tags: [{ s: ALL_STYLES, q: 0.8 }],
        parts: ["pat:ruf"],
        own: true,
      },
      relaxed,
    );
    if (c) extra.push(c);
  }
  const places = placeNames(p);
  const groups = [
    { list: [...extra, ...personNames(relaxed)].sort(byRank), max: 4 },
    { list: [...ownBrandNames(brandProfile)].sort(byRank), max: 3 },
    {
      list: [
        ...(places.length
          ? places
          : placeNames(relaxed).filter((c) => !c.late && !c.parts.includes("pat:ort-funktion"))),
      ].sort(byRank),
      max: 2,
    },
    { list: [...initialNames(relaxed)].sort(byRank), max: 1 },
    {
      list: [...p.routeKinds]
        .filter((k) => k !== "person" && k !== "initialen")
        .flatMap((k) => GENERATORS[k](p))
        .sort(byRank),
      max: 3,
    },
  ];
  const picked: Candidate[] = [];
  const seen = new Set(taken);
  const counts = groups.map(() => 0);
  const fresh = (c: Candidate): boolean =>
    !seen.has(flat(c.name)) && !c.naehe?.art?.startsWith("gleich");
  for (let round = 0; picked.length < max && round < 12; round++) {
    let any = false;
    for (const [i, group] of groups.entries()) {
      if (picked.length >= max || counts[i]! >= group.max) continue;
      const c = group.list.find(fresh);
      if (c) {
        seen.add(flat(c.name));
        picked.push(c);
        counts[i]!++;
        any = true;
      }
    }
    if (!any) break;
  }
  const out = picked.map(toSuggestion);
  for (let pageNo = 0; out.length < max && pageNo < 4; pageNo++)
    for (const s of generateNames(input, { count: 12, page: pageNo, seed })) {
      if (out.length >= max) break;
      if (!seen.has(flat(s.name))) {
        seen.add(flat(s.name));
        out.push(s);
      }
    }
  return out;
}
