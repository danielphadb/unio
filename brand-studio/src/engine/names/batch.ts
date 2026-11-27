/**
 * Die Mischmaschine einer Namensfolge (nameFinder-Chunk: `ud`, `aa`, `sd`, `id`, `ae`, `or`,
 * `dd`, `ld`, `hd`, `ta`, `ht`, `ot`, `ct`, `ua`, `od`, `on`, `gt`, `Ni`).
 *
 * `createStream` liefert Namen einzeln, gemischt nach Gewicht je Namensart. Die ersten zwoelf
 * (Seite 1) sind besonders streng: hoechstens zwei Kunstwoerter, mindestens fuenf Arten,
 * je Wortfeld und Endung nur einer, Personenmarke zuerst. Fehlt Vorrat, zieht die Maschine
 * weitere Eimer, lockert die Sperren und bildet zuletzt freie Kunstwoerter.
 */
import { rng, hash } from "../rng";
import type { NameKind } from "../../types";
import { fold, letterCount } from "./fold";
import { endingKey } from "./brandable";
import { isGenericWord, syllables } from "./quality";
import { domainsFor, type Domains } from "./domains";
import {
  BUCKET_KINDS,
  DEFAULT_BUCKETS,
  estateFits,
  partsOf,
  profileKey,
  chance,
  type Candidate,
  type NameChecks,
  type NameNaehe,
} from "./candidate";
import { ESTATE_WORDS, freeNames, GENERATORS, wordNames } from "./generators";
import {
  buildProfile,
  type NameAnchor,
  type NameInput,
  type NameProfile,
  type ProfileOptions,
} from "./profile";
import type { NameStyle } from "./styles";

/** Ein Namensvorschlag (Ergebnis des Namensfinders). */
export interface NameSuggestion {
  /** "nm-" und Hash aus Art und Name */
  id: string;
  name: string;
  suffix?: string;
  kind: NameKind;
  reason: string;
  /** 0 bis 100 */
  score: number;
  checks: NameChecks;
  style: NameStyle;
  domains: Domains;
  /** High-End-Wertung 0 bis 100 */
  highend: number;
  hint?: string;
  naehe?: NameNaehe;
}

/** Einstellungen einer Folge. */
export interface StreamOptions extends ProfileOptions {
  /** nur diese Arten */
  kinds?: readonly NameKind[];
  /** aehnliche Namen zu diesem Namen */
  anchor?: NameAnchor;
  /** gemerkte Namen: Merkmale werden bevorzugt */
  liked?: readonly string[];
  /** ausgeblendete Namen: Merkmale werden gemieden */
  disliked?: readonly string[];
}

/** Folge von Vorschlaegen; `next` liefert `null`, wenn nichts mehr kommt. */
export interface NameStream {
  items: NameSuggestion[];
  done: boolean;
  next: () => NameSuggestion | null;
}

/** Grundgewicht je Art nach Profil (`ud`). */
function kindWeights(p: NameProfile): Record<NameKind, number> {
  const has = (s: string): boolean => (p.styles as string[]).includes(s);
  const w: Record<NameKind, number> = {
    person: p.person || p.company ? 3 : 0,
    initialen: p.person?.initials.length === 2 || p.company?.initials ? 0.6 : 0,
    ort: p.place ? (has("warm") || has("natur") || p.focus.includes("land") ? 3 : 2.2) : 0,
    kunstwort:
      1.2 +
      (has("elegant") || has("luxus") || has("modern") || has("mutig") ? 0.3 : 0) -
      (has("warm") || has("natur") ? 0.3 : 0),
    kombination: 2,
    bildhaft: 0.9 + (has("warm") || has("natur") ? 0.3 : 0),
    fremdsprachig: 0.9 + (has("elegant") || has("luxus") ? 0.3 : 0),
    kurz: 1.5 + (has("modern") || has("mutig") ? 0.3 : 0),
    abgewandelt: 0.4,
    klassisch: p.person || p.place ? 1.3 : 0,
  };
  if (!p.person && !p.company) {
    w.kombination += 0.6;
    w.kunstwort += 0.3;
    w.bildhaft += 0.2;
    if (p.place) w.ort += 0.5;
  }
  if (p.creativity !== "frei") {
    w.person *= 1.25;
    w.ort *= 0.6;
    w.klassisch *= 0.7;
    w.kunstwort *= 0.8;
    w.fremdsprachig *= 0.8;
    w.initialen *= 0.35;
  }
  for (const k of p.routeKinds) if (w[k] > 0) w[k] = w[k] * 2.5 + 1.5;
  if (p.routeKinds.size && !p.routeKinds.has("person")) w.person *= 0.7;
  if (p.creativity === "direkt") {
    w.kunstwort *= 0.6;
    w.abgewandelt = 0;
    w.person *= 1.2;
    w.ort *= 1.15;
    w.klassisch *= 1.2;
  } else if (p.creativity === "frei") {
    w.kunstwort *= 1.4;
    w.abgewandelt *= 1.5;
    w.klassisch *= 0.7;
  }
  return w;
}

/** Markenfaehiges Kunstwort ausser der Kurzform des eigenen Namens (`aa`). */
const isBrandCoinage = (c: Candidate): boolean =>
  c.kind === "kunstwort" && c.style === "markenfaehig" && !c.parts.includes("pat:name-kurz");

/** Gewicht eines Merkmals bei der Wiederholungssperre (`sd`). */
const repeatWeight = (part: string): number =>
  part.startsWith("fld:")
    ? 40
    : part.startsWith("p:")
      ? 14
      : part.startsWith("g:")
        ? 3
        : part.startsWith("pat:") || part.startsWith("r:")
          ? 20
          : part.startsWith("m:")
            ? 15
            : part.startsWith("o:")
              ? 6
              : part.startsWith("w:")
                ? 9
                : part.startsWith("s:")
                  ? 1
                  : 7;

/** So weit sucht `best` in einer Liste (`id`). */
const SCAN_LIMIT = 80;
/** Groesse einer Seite (`ae`). */
export const PAGE_SIZE = 12;
/** Arten, die auf Seite 1 eine Quote haben (`or`). */
const QUOTA_KINDS: readonly NameKind[] = ["person"];
/** Hoechstens so viele Namen mit Wortfeld-Merkmal auf Seite 1 (`dd`). */
const MAX_FIELD = 2;
/** Hoechstens so viele Gattungswoerter auf Seite 1 (`ld`). */
const MAX_GENERIC = 2;
/** Hoechstzahl je Art auf Seite 1 (`hd`), sonst `PAGE_SIZE`. */
const KIND_CAP: Readonly<Partial<Record<NameKind, number>>> = {
  kunstwort: 3,
  abgewandelt: 1,
  bildhaft: 2,
  fremdsprachig: 2,
  kurz: 3,
  ort: 3,
  klassisch: 2,
};
/** Unter diesem Rang darf eine andere Art einspringen (`ta`). */
const RANK_FLOOR = 52;
/** Eimer brauchen so viele Namen je Eimer (`Ni`). */
const PER_BUCKET = 4;

/** Laengenklasse (`ht`). */
const lengthClass = (name: string): string => {
  const n = letterCount(name);
  return n <= 6 ? "kurz" : n <= 10 ? "mittel" : "lang";
};

/** Merkmale fuer Vorlieben (`ot`). */
function preferenceParts(c: Candidate): string[] {
  const out = c.parts.filter((x) => /^(w|r|e|l|pat):/.test(x));
  for (const x of c.parts) if (x.startsWith("kw:")) out.push(`w:${fold(x.slice(3))}`);
  out.push(`s:${c.style}`, `k:${c.kind}`, `len:${lengthClass(c.name)}`);
  return out;
}

/** Stil eines fremden Namens (`ct`). */
export function styleOfName(name: string): NameStyle {
  const words = name.trim().split(/\s+/);
  if (/&| auf | an /.test(name) || words.length >= 3) return "satz";
  if (words.length === 2) return "bildhaft";
  const parts = partsOf(name);
  return parts.some((x) => x.startsWith("r:"))
    ? "markenfaehig"
    : parts.filter((x) => x.startsWith("w:")).length >= 2
      ? "zusammengesetzt"
      : "echt";
}

/** Merkmale eines Namens, bekannt oder geschaetzt (`ua`). */
function namePreferenceParts(name: string, known: ReadonlyMap<string, Candidate>): string[] {
  const c = known.get(fold(name).replace(/\s+/g, ""));
  return c
    ? preferenceParts(c)
    : [...partsOf(name), `s:${styleOfName(name)}`, `len:${lengthClass(name)}`];
}

/** Gewicht eines Merkmals fuer Vorlieben (`od`). */
const preferenceWeight = (part: string): number =>
  part.startsWith("w:") || part.startsWith("r:")
    ? 6
    : part.startsWith("s:")
      ? 4
      : part.startsWith("k:") ||
          part.startsWith("pat:") ||
          part.startsWith("l:") ||
          part.startsWith("e:")
        ? 3
        : 2;

/** Kandidat als Vorschlag (`gt`). */
export function toSuggestion(c: Candidate): NameSuggestion {
  return {
    id: `nm-${hash(c.kind === "person" ? `${c.kind}|${c.name}|${c.suffix ?? ""}` : `${c.kind}|${c.name}`).toString(36)}`,
    name: c.name,
    ...(c.suffix ? { suffix: c.suffix } : {}),
    kind: c.kind,
    reason: c.reason,
    score: c.score,
    checks: c.checks,
    style: c.style,
    domains: domainsFor(c.name, c.suffix),
    highend: c.highend,
    ...(c.hint ? { hint: c.hint } : {}),
    ...(c.naehe ? { naehe: c.naehe } : {}),
  };
}

const byRank = (a: Candidate, b: Candidate): number => b.rank - a.rank || (a.key < b.key ? -1 : 1);

interface BestPick {
  i: number;
  v: number;
}

/** Folge erzeugen (`on`). */
export function createStream(input: NameInput, seed: number, options: StreamOptions): NameStream {
  const a = buildProfile(input, seed, options);
  if (options.anchor) a.anchor = new Set(partsOf(options.anchor.name));
  if (options.liked?.length) a.noBucket = true;
  const all: NameProfile = { ...a, allSlots: true };
  if (!a.noBucket && !options.anchor) {
    const n = wordNames(all).filter((c) => !c.parts.some((x) => x.startsWith("fld:"))).length;
    a.buckets = Math.max(3, Math.min(DEFAULT_BUCKETS, Math.floor(n / PER_BUCKET)));
  }
  const bucketOf = (name: string): number =>
    Math.floor(
      rng(hash(`${fold(name)}|${profileKey(a)}`) ^ a.seed).next() * (a.buckets ?? DEFAULT_BUCKETS),
    );
  const inBucket = (kind: NameKind, bucket: number): Candidate[] =>
    GENERATORS[kind](all).filter((c) => bucketOf(c.name) === bucket);
  const weights = kindWeights(a);
  const mixer = rng(seed ^ 334462);
  const kindAllowed = (k: NameKind): boolean => !options.kinds || options.kinds.includes(k);
  /** Vorrat je Art, nach Rang */
  const pools = new Map<NameKind, Candidate[]>();
  /** Gewichtete Warteschlange je Art (glatte Rundlauf-Gewichtung) */
  const credit = new Map<NameKind, number>();
  /** schon gezeigte Schluessel */
  const used = new Set<string>();
  /** Haeufigkeit der Merkmale bisher */
  const partCount = new Map<string, number>();
  let active: NameKind[] = [];
  let stage = -1;
  let bucket = 0;
  let freeRound = 0;
  let shown = 0;
  const personOk = !a.routeKinds.size || a.routeKinds.has("person");
  let quota =
    options.kinds || a.nameStyles || options.anchor
      ? 0
      : a.person
        ? personOk
          ? 5
          : 2
        : a.company
          ? personOk
            ? 3
            : 1
          : 0;
  let quotaUsed = 0;
  const firstPageNames = new Set<string>();
  let fieldCount = 0;
  let genericCount = 0;
  let coinageCount = 0;
  let lichtCount = 0;
  const strict = !options.kinds && !a.nameStyles && !options.anchor;
  let kindTarget = 0;
  let kwTarget = 0;
  let kwShown = 0;
  const kindsShown = new Set<NameKind>();
  const kindCount = new Map<NameKind, number>();
  const nextBucket = new Map<NameKind, number>();

  /** Weiteren Eimer einer Art nachladen (`$`). */
  const refill = (k: NameKind): boolean => {
    if (!BUCKET_KINDS.has(k) || a.noBucket || options.anchor || stage >= 1) return false;
    const pool = pools.get(k) ?? [];
    const keys = new Set(pool.map((c) => c.key));
    for (let b = (nextBucket.get(k) ?? 0) + 1; b < (a.buckets ?? DEFAULT_BUCKETS); b++) {
      nextBucket.set(k, b);
      const fresh = inBucket(k, b).filter((c) => !used.has(c.key) && !keys.has(c.key));
      if (fresh.length) {
        if (likes.size) for (const c of fresh) c.rank += preference(c);
        pools.set(k, [...pool, ...fresh].sort(byRank));
        return true;
      }
    }
    return false;
  };
  const kindCap = (k: NameKind): number =>
    (KIND_CAP[k] ?? PAGE_SIZE) * (a.routeKinds.has(k) ? 2 : 1);
  const kindFull = (k: NameKind): boolean =>
    !((likes.get(`k:${k}`) ?? 0) > 0) &&
    (kindCount.get(k) ?? 0) >=
      (a.routeKinds.size && !a.routeKinds.has(k) && !QUOTA_KINDS.includes(k)
        ? Math.min(2, kindCap(k))
        : kindCap(k));
  const ending = new Map<number, Set<string>>();
  const firstPools = new Map<NameKind, Candidate[]>();
  for (const k of Object.keys(weights) as NameKind[])
    if (weights[k] > 0 && kindAllowed(k)) firstPools.set(k, GENERATORS[k](a));
  const knownByKey = new Map<string, Candidate>();
  for (const list of firstPools.values())
    for (const c of list) if (!knownByKey.has(c.key)) knownByKey.set(c.key, c);
  /** gelernte Vorlieben je Merkmal */
  const likes = new Map<string, number>();
  const learn = (name: string, amount: number): void => {
    for (const x of new Set(namePreferenceParts(name, knownByKey)))
      likes.set(x, (likes.get(x) ?? 0) + amount);
    used.add(fold(name).replace(/\s+/g, ""));
  };
  for (const name of options.liked ?? []) learn(name, 1);
  for (const name of options.disliked ?? []) learn(name, -1.2);
  if (options.anchor) learn(options.anchor.name, 3);
  const prefCap = options.anchor ? 60 : 30;
  const anchorParts = new Set(
    options.anchor
      ? namePreferenceParts(options.anchor.name, knownByKey).filter((x) =>
          /^(w|r|e|pat|s):/.test(x),
        )
      : [],
  );
  const preference = (c: Candidate): number => {
    let sum = 0;
    for (const x of preferenceParts(c)) sum += (likes.get(x) ?? 0) * preferenceWeight(x);
    return Math.max(-prefCap, Math.min(prefCap, sum));
  };
  const widened: NameProfile = { ...a, affine: true, wide: true };
  for (const k of Object.keys(weights) as NameKind[]) {
    const like = likes.get(`k:${k}`) ?? 0;
    if (like) weights[k] *= Math.max(0.3, Math.min(3, 1 + 0.25 * like));
    const pool = firstPools.get(k);
    if (like > 0 && pool && options.liked?.length) {
      const keys = new Set(pool.map((c) => c.key));
      for (const c of GENERATORS[k](widened))
        if (!keys.has(c.key)) {
          keys.add(c.key);
          pool.push(c);
        }
    }
  }
  /** Vorrat einer Art setzen und die Art einreihen (`ve`). */
  const setPool = (k: NameKind, list: Candidate[]): void => {
    const fresh = list.filter((c) => !used.has(c.key));
    if (likes.size) for (const c of fresh) c.rank += preference(c);
    pools.set(k, fresh.sort(byRank));
    if (fresh.length) {
      active.push(k);
      credit.set(k, mixer.next() * weights[k]);
    }
  };
  /** Naechste Stufe: Erstvorrat, Eimer, gelockert, freie Kunstwoerter (`we`). */
  const advance = (): boolean => {
    active = [];
    if (stage < 0) {
      stage = 0;
      for (const [k, list] of firstPools) setPool(k, list);
      quota = Math.min(
        quota,
        new Set((firstPools.get("person") ?? []).map((c) => fold(c.name))).size,
      );
      if (strict) {
        const relaxed: NameProfile = { ...a, relaxed: true };
        const noEstate = !!a.place?.known && !estateFits(a);
        for (const k of Object.keys(weights) as NameKind[]) {
          if (!(weights[k] > 0) || active.includes(k) || k === "initialen" || k === "klassisch")
            continue;
          if (BUCKET_KINDS.has(k) && !a.noBucket) {
            const n = a.buckets ?? DEFAULT_BUCKETS;
            const offset = (seed >>> 3) % Math.max(1, n - 1);
            for (let i = 0; i < n - 1 && !active.includes(k); i++) {
              const b = 1 + ((i + offset) % (n - 1));
              nextBucket.set(k, b);
              setPool(k, inBucket(k, b));
            }
          }
          const compact = (c: Candidate): boolean => {
            const words = c.name.split(/\s+/).filter((w) => w !== "&");
            const main = c.kind === "ort" && words.length === 2 ? words[1]! : c.name;
            return words.length <= 2 && letterCount(main) <= 12 && syllables(main) <= 3;
          };
          if (!active.includes(k))
            setPool(
              k,
              GENERATORS[k](relaxed).filter(
                (c) =>
                  !c.late &&
                  compact(c) &&
                  !(noEstate && ESTATE_WORDS.has(fold(c.name))) &&
                  (!BUCKET_KINDS.has(k) || chance(a, `fb|${c.key}`, 0.5)),
              ),
            );
        }
        for (const k of a.routeKinds)
          if (BUCKET_KINDS.has(k) && active.includes(k))
            for (let i = 0; i < 3 && (pools.get(k)?.length ?? 0) < 8 && refill(k); i++);
        kindTarget = Math.min(5, active.length);
        const kwNames = new Set(
          [...firstPools.values()]
            .flat()
            .filter((c) => c.kwRel)
            .map((c) => fold(c.name)),
        );
        kwTarget = a.kw.length || a.kwFields.length ? Math.min(4, kwNames.size) : 0;
      }
      if (active.length) return true;
    }
    if (stage < 0.3) {
      stage = 0.3;
      return advance();
    }
    while (stage < 1 && bucket < (a.buckets ?? DEFAULT_BUCKETS) - 1) {
      stage = 0.5;
      bucket++;
      const any = !!a.noBucket || (!!a.nameStyles && !a.nameStyles.has("echt"));
      for (const k of BUCKET_KINDS)
        if (
          (any || (k !== "kunstwort" && k !== "fremdsprachig")) &&
          weights[k] > 0 &&
          kindAllowed(k)
        )
          setPool(k, inBucket(k, bucket));
      if (active.length) return true;
    }
    if (stage < 1) {
      stage = 1;
      const relaxed: NameProfile = { ...a, relaxed: true };
      const noEstate = !!a.place?.known && !estateFits(a);
      for (const k of Object.keys(weights) as NameKind[])
        if (weights[k] > 0 && kindAllowed(k))
          setPool(
            k,
            GENERATORS[k](relaxed).filter((c) => !(noEstate && ESTATE_WORDS.has(fold(c.name)))),
          );
      if (active.length) return true;
    }
    stage = 2;
    if (!kindAllowed("kunstwort") || (a.nameStyles && !a.nameStyles.has("markenfaehig")))
      return false;
    for (let i = 0; i < 50 && !active.length; i++) setPool("kunstwort", freeNames(a, freeRound++));
    return active.length > 0;
  };
  /** Bester Kandidat einer Art unter den Sperren (`me`). */
  const best = (
    k: NameKind,
    filter?: (c: Candidate) => boolean,
    ignoreEnding = false,
    probe = false,
  ): BestPick => {
    const list = pools.get(k)!;
    let index = -1;
    let value = -Infinity;
    const endings = ending.get(Math.floor(shown / PAGE_SIZE));
    for (let j = 0; j < list.length && j < SCAN_LIMIT; j++) {
      const c = list[j]!;
      if (used.has(c.key)) {
        list.splice(j--, 1);
        continue;
      }
      if (
        (shown < PAGE_SIZE && firstPageNames.has(fold(c.name))) ||
        (stage < 1 &&
          shown < PAGE_SIZE &&
          !likes.size &&
          c.parts.some(
            (x) => x.startsWith("fld:") && ((partCount.get(x) ?? 0) > 0 || fieldCount >= MAX_FIELD),
          )) ||
        (shown < PAGE_SIZE &&
          !likes.size &&
          k !== "person" &&
          genericCount >= MAX_GENERIC &&
          isGenericWord(c.name)) ||
        (strict &&
          shown < PAGE_SIZE &&
          !likes.size &&
          ((isBrandCoinage(c) && coinageCount >= (a.creativity === "frei" ? 3 : 2)) ||
            k === "abgewandelt" ||
            (lichtCount >= 1 && /licht$/i.test(c.name)))) ||
        (filter && !filter(c)) ||
        (!ignoreEnding && k === "kunstwort" && endings != null && endings.has(endingKey(c.name)))
      )
        continue;
      const v =
        c.rank -
        c.parts.reduce(
          (s, x) => s + (partCount.get(x) ?? 0) * repeatWeight(x) * (anchorParts.has(x) ? 0.25 : 1),
          0,
        );
      if (v > value) {
        value = v;
        index = j;
      }
    }
    return index < 0 &&
      !ignoreEnding &&
      !probe &&
      k === "kunstwort" &&
      endings != null &&
      endings.size
      ? best(k, filter, true)
      : { i: index, v: value };
  };
  /** Beste Art unter einer Bedingung, die gewuenschte zuerst (`Je`). */
  const bestOf = (
    k: NameKind,
    filter: (c: Candidate, kind: NameKind) => boolean,
  ): (BestPick & { k: NameKind }) | null => {
    let out: (BestPick & { k: NameKind }) | null = null;
    for (const other of [k, ...active.filter((x) => x !== k)]) {
      if (!active.includes(other)) continue;
      const pick = best(other, (c) => filter(c, other));
      if (pick.i >= 0 && other === k) return { k: other, ...pick };
      if (pick.i >= 0 && (!out || pick.v > out.v)) out = { k: other, ...pick };
    }
    return out;
  };
  /** Kandidat entnehmen und Merkmale zaehlen (`pe`). */
  const take = (k: NameKind, index: number): Candidate => {
    const [c] = pools.get(k)!.splice(index, 1);
    used.add(c!.key);
    for (const x of c!.parts) partCount.set(x, (partCount.get(x) ?? 0) + 1);
    return c!;
  };
  let widenedOwn = false;
  /** Ab Seite 2 eigene Formen gelockert nachladen (`De`). */
  const widenOwn = (): void => {
    widenedOwn = true;
    if (options.anchor) return;
    const relaxed: NameProfile = { ...a, relaxed: true };
    for (const k of ["person", "initialen", "ort", "klassisch"] as NameKind[]) {
      if (!(weights[k] > 0) || !kindAllowed(k)) continue;
      const keys = new Set((pools.get(k) ?? []).map((c) => c.key));
      const fresh = GENERATORS[k](relaxed).filter((c) => !used.has(c.key) && !keys.has(c.key));
      if (!fresh.length) continue;
      if (likes.size) for (const c of fresh) c.rank += preference(c);
      pools.set(k, [...(pools.get(k) ?? []), ...fresh].sort(byRank));
      if (!active.includes(k)) {
        active.push(k);
        credit.set(k, mixer.next() * weights[k]);
      }
    }
  };
  const stream: NameStream = {
    items: [],
    done: false,
    next: () => {
      for (;;) {
        if (!widenedOwn && shown >= PAGE_SIZE) widenOwn();
        if (!active.length && !advance()) {
          stream.done = true;
          return null;
        }
        const total = active.reduce((s, k) => s + weights[k], 0);
        let k = active[0]!;
        for (const x of active) {
          credit.set(x, credit.get(x)! + weights[x]);
          if (credit.get(x)! > credit.get(k)!) k = x;
        }
        if (!shown && active.includes("person") && personOk) k = "person";
        else if (!shown && a.routeKinds.size)
          k =
            active.filter((x) => a.routeKinds.has(x)).sort((x, y) => weights[y] - weights[x])[0] ??
            k;
        let forced = false;
        if (
          shown < PAGE_SIZE &&
          (personOk || shown > 0) &&
          quotaUsed < quota &&
          quotaUsed < Math.ceil((quota * (shown + 1)) / PAGE_SIZE) &&
          !QUOTA_KINDS.includes(k)
        ) {
          const q = QUOTA_KINDS.find((x) => active.includes(x) && best(x).i >= 0);
          if (q) {
            k = q;
            forced = true;
          }
        }
        credit.set(k, credit.get(k)! - total);
        let pick = best(k);
        if (k === "kunstwort" && pick.i >= 0 && best(k, undefined, false, true).i < 0) {
          if (refill(k)) {
            credit.set(k, credit.get(k)! + total);
            continue;
          }
          const other = bestOf(k, (_c, kind) => kind !== "kunstwort");
          if (other && other.k !== "kunstwort") {
            k = other.k;
            pick = { i: other.i, v: other.v };
          }
        }
        if (pick.i < 0) {
          if (refill(k)) continue;
          active = active.filter((x) => x !== k);
          continue;
        }
        if (shown < PAGE_SIZE && strict && !forced && kindFull(k)) {
          const other = bestOf(k, (_c, kind) => !kindFull(kind));
          if (other) {
            k = other.k;
            pick = { i: other.i, v: other.v };
          }
        }
        if (shown < PAGE_SIZE && (kindTarget || kwTarget)) {
          const nth = shown + 1;
          const needKind =
            kindsShown.size < Math.min(kindTarget, Math.ceil((kindTarget * nth) / 10));
          const needKw = kwShown < Math.min(kwTarget, Math.ceil((kwTarget * (nth - 1)) / 9));
          const filters: Array<(c: Candidate, kind: NameKind) => boolean> = forced
            ? needKw
              ? [(c) => !!c.kwRel]
              : []
            : [
                ...(needKind && needKw
                  ? [(c: Candidate, kind: NameKind) => !kindsShown.has(kind) && !!c.kwRel]
                  : []),
                ...(needKind ? [(_c: Candidate, kind: NameKind) => !kindsShown.has(kind)] : []),
                ...(needKw
                  ? [
                      (c: Candidate, kind: NameKind) => !!c.kwRel && !kindFull(kind),
                      (c: Candidate) => !!c.kwRel,
                    ]
                  : []),
              ];
          for (const f of filters) {
            const hit = forced ? { k, ...best(k, (c) => f(c, k)) } : bestOf(k, f);
            if (hit && hit.i >= 0) {
              k = hit.k;
              pick = { i: hit.i, v: hit.v };
              forced = true;
              break;
            }
          }
        }
        if (
          pick.v < RANK_FLOOR &&
          !forced &&
          !(strict && BUCKET_KINDS.has(k) && k !== "kombination") &&
          !(QUOTA_KINDS.includes(k) && quotaUsed < quota) &&
          !((likes.get(`k:${k}`) ?? 0) > 0)
        )
          for (const other of active) {
            if (other === k) continue;
            const alt = best(other);
            if (alt.i >= 0 && alt.v >= RANK_FLOOR + 5 && alt.v > pick.v + 8) {
              k = other;
              pick = alt;
              break;
            }
          }
        if (QUOTA_KINDS.includes(k)) quotaUsed++;
        shown++;
        const c = take(k, pick.i);
        if (shown <= PAGE_SIZE) {
          kindsShown.add(c.kind);
          kindCount.set(c.kind, (kindCount.get(c.kind) ?? 0) + 1);
          if (c.kwRel) kwShown++;
        }
        if (c.kind === "kunstwort") {
          const page = Math.floor((shown - 1) / PAGE_SIZE);
          if (!ending.has(page)) ending.set(page, new Set());
          ending.get(page)!.add(endingKey(c.name));
        }
        if (shown <= PAGE_SIZE) firstPageNames.add(fold(c.name));
        if (shown <= PAGE_SIZE && c.parts.some((x) => x.startsWith("fld:"))) fieldCount++;
        if (shown <= PAGE_SIZE && c.kind !== "person" && isGenericWord(c.name)) genericCount++;
        if (shown <= PAGE_SIZE && isBrandCoinage(c)) coinageCount++;
        if (shown <= PAGE_SIZE && /licht$/i.test(c.name)) lichtCount++;
        return toSuggestion(c);
      }
    },
  };
  return stream;
}

/** Seed aus der Eingabe, wenn keiner angegeben ist (`Yr`). */
export function inputSeed(
  input: Pick<NameInput, "person" | "region" | "focus" | "styles" | "keywords">,
): number {
  const list = (items: readonly string[] | undefined): string =>
    [...(items ?? [])]
      .map((s) => s.trim().toLocaleLowerCase("de-AT"))
      .sort()
      .join(",");
  return hash(
    [
      input.person?.trim().toLocaleLowerCase("de-AT") ?? "",
      input.region?.trim().toLocaleLowerCase("de-AT") ?? "",
      list(input.focus),
      list(input.styles),
      list(input.keywords),
    ].join("|"),
  );
}

/** Seed mit Route: Seed der Route und Territorium mischen (`bt`). */
export function routeSeed(seed: number, route?: NameInput["route"]): number {
  if (!route) return seed >>> 0;
  const r = Number.isFinite(route.seed) ? Math.floor(route.seed!) : 0;
  return (seed ^ Math.imul(r | 0, 2654435761) ^ hash(`route|${route.territory ?? ""}`)) >>> 0;
}
