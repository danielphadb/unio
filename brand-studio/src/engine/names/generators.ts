/**
 * Generatoren je Namensart (nameFinder-Chunk: `Li`, `Ai`, `Ei`, `Mi`, `Ya`, `Xa`, `Ri`,
 * `Ki`, `yi`, `Fr`, `Ti`, `Fi`, `Qn`, `Yn`, `Di`, `hn`, `Pi`, `qi`, `et`, `Xn`, `Vi`, `Kr`,
 * `_i`, `Ui`, `at`, `Ci`, `tt`, `ut`, `$i`, `ji`, `Ji`, `Qi`, `Yi`, `st`, `Xi`, `dt`, `ed`,
 * `rd`, `lt`, `td`, `Ze`).
 *
 * Jeder Generator liefert bewertete Kandidaten (`makeCandidate`) fuer ein Profil:
 * Personenmarke, Ort, Klassisch, Initialen, Zusammensetzungen, Bildwoerter, Saetze, echte
 * Woerter, Fremdwoerter, Wurzel- und freie Kunstwoerter, alte Schreibweisen, Woerter aus
 * Stichwort-Feldern und Kunstwoerter aus dem eigenen Namen.
 */
import { rng, hash } from "../rng";
import type { NameKind, StyleKey } from "../../types";
import { flat, fold, letterCount } from "./fold";
import { isCommonWord, LANG_NAMES, LEXICON, type LexiconWord } from "./lexicon";
import {
  isGenericWord,
  maxConsonantRun,
  maxVowelRun,
  pronounceable,
  softness,
  syllables,
  VOWELS,
  wordWeakness,
} from "./quality";
import {
  BRAND_RULES,
  brandableFrom,
  hasBadEnding,
  letterVariant,
  negativePattern,
  type BrandableWord,
} from "./brandable";
import {
  BILDWOERTER,
  BILDWORT,
  COINED,
  COMPOUND_HEADS,
  COMPOUND_PAIRS,
  COMPOUND_REASONS,
  COMPOUND_TAILS,
  ECHTE_WOERTER,
  FOREIGN,
  FREE_ENDS,
  FREE_MIDDLES,
  FREE_ONSETS,
  FREE_VOWELS,
  OLD_SPELLINGS,
  REAL_COMPOUNDS,
  REAL_FOREIGN,
  ROOT_BLENDS,
  ROOT_ENDS,
  ROOTS,
  SAETZE,
  TAKEN_COMPOUNDS,
  type NameStyle,
  type PartWord,
  type StyleTag,
  type StyleWord,
} from "./styles";
import { MAX_NAME_LENGTH, PLACE_TOKENS, shortForm, usableInitials } from "./person";
import {
  ALL_STYLES,
  chance,
  estateFits,
  fitsPlace,
  hitsKeyword,
  inSlot,
  isRealWord,
  KNOWN_WORDS,
  lucky,
  makeCandidate,
  overlaps,
  partsOf,
  placeName,
  profileKey,
  realitaetenFits,
  stylesFit,
  suffixFor,
  tagAllowed,
  tagFit,
  toneOf,
  type Candidate,
  type Draft,
} from "./candidate";
import type { NameProfile } from "./profile";

const capitalize = (s: string): string => s.charAt(0).toLocaleUpperCase("de-AT") + s.slice(1);
const isCandidate = (c: Candidate | null | false | undefined): c is Candidate => !!c;
const own = <T>(map: Readonly<Record<string, T>>, key: string): T | undefined =>
  Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;

// ---------------------------------------------------------------------------
// Firma und Person

/** Varianten des Firmennamens (`Li`). */
function companyNames(p: NameProfile): Array<Candidate | null> {
  const company = p.company;
  if (!company) return [];
  const tag = { s: ALL_STYLES, q: 0.8 };
  const place = placeName(p);
  const containsPlace = (s: string): boolean => !!place && fold(company.full).includes(fold(s));
  const add = (
    name: string,
    suffix: string | undefined,
    reason: string,
    pattern: string,
  ): Candidate | null =>
    makeCandidate(
      "person",
      {
        name,
        suffix,
        reason,
        q: 0.85,
        d: 0.65,
        tags: [tag],
        parts: [`pat:${pattern}`, "p:firma"],
        own: true,
        style: "echt",
        ...(/^firma(-ort|-kurz|-name|-kurz-fn|-fn)?$/.test(pattern) ? {} : { rot: 0.5 }),
      },
      p,
    );
  const fnSuffix = company.fn ?? suffixFor(p, company.core, true);
  return [
    add(
      company.core,
      fnSuffix,
      company.fn
        ? `Dein Firmenname bleibt, ${company.fn} steht klein darunter statt im Namen.`
        : "Dein Firmenname bleibt die Marke, die Funktion steht klein darunter.",
      "firma",
    ),
    place && !containsPlace(place)
      ? add(
          company.core,
          place,
          `Dein Firmenname trägt, ${place} im Zusatz zeigt, wo du zu Hause bist.`,
          "firma-ort",
        )
      : null,
    company.bare
      ? add(
          company.bare,
          place ?? fnSuffix,
          `Ohne Ortsableitung wird ${company.bare} kürzer und eigenständiger, der Ort steht im Zusatz.`,
          "firma-kurz",
        )
      : null,
    company.bare && place
      ? add(
          company.bare,
          fnSuffix,
          `${company.bare} allein trägt, die Funktion steht klein darunter.`,
          "firma-kurz-fn",
        )
      : null,
    company.fn
      ? add(
          company.core,
          company.fn === "Immobilien" ? "Realitäten" : "Immobilien",
          "Dieselbe Marke mit anderer Funktion im Zusatz, nie doppelt im Namen.",
          "firma-fn",
        )
      : null,
    company.tail
      ? add(
          company.tail,
          fnSuffix,
          `${company.tail} allein wirkt wie ein Familienname und trägt die Marke ruhig, die Funktion steht klein darunter.`,
          "firma-name",
        )
      : null,
    company.kern && company.kern !== company.core
      ? add(
          company.kern,
          fnSuffix,
          `${company.kern} ist das tragende Wort deines Firmennamens, allein wirkt es kürzer und markanter.`,
          "firma-kern",
        )
      : null,
    company.initials && company.core.length + company.initials.length + 1 <= MAX_NAME_LENGTH
      ? makeCandidate(
          "initialen",
          {
            name: company.initials,
            suffix: company.core,
            reason:
              "Die Anfangsbuchstaben als Zeichen, der Firmenname klein darunter: so arbeiten Architektur- und Designbüros.",
            q: 0.6,
            d: 0.45,
            tags: [tag],
            parts: ["pat:firma-ini"],
            own: true,
            later: true,
          },
          p,
        )
      : null,
  ];
}

/** Anteil der Laeufe fuer Nachname mit Zusatz, wenn Initialen frei sind (`Ai`). */
const ROTATION: Readonly<Record<string, number>> = {
  "nach-kw": 0.6,
  "nach-estates": 0.5,
  "nach-lieg": 0.5,
};
/** Feld-Zusaetze, die als Zusatz nicht taugen (`Ei`). */
const BAD_FIELD_SUFFIX =
  /^(Nachlass|Bewertung|Investment|International|Relocation|Landwirtschaft|Private Estates|Wohnen im Alter)$/;
/** Feld-Zusatz passt (`Mi`). */
const fieldSuffixFits = (suffix: string, p: NameProfile): boolean =>
  !BAD_FIELD_SUFFIX.test(suffix) &&
  (!/^(Anlageimmobilien|Vorsorgewohnungen)$/.test(suffix) || p.focus.includes("anleger"));

/** Personenmarke (`Ya`): voller Name, Nachname mit Zusatz, Doppelname, Atelier ... */
export function personNames(p: NameProfile): Candidate[] {
  const out = companyNames(p).filter(isCandidate);
  const person = p.person;
  if (!person) return out;
  const last = person.last;
  const list: Array<Candidate | null> = [];
  const initialsTaken = !person.first || !usableInitials(person.initials);
  const rotation = (pattern: string): number | undefined =>
    initialsTaken ? undefined : own(ROTATION, pattern);
  const add = (
    name: string,
    reason: string,
    q: number,
    d: number,
    tag: StyleTag & { w?: string },
    pattern: string,
    suffix: string | undefined,
    extra: Partial<Draft> = {},
  ): void => {
    if (!tagAllowed(tag, p)) return;
    list.push(
      makeCandidate(
        "person",
        {
          name,
          suffix,
          reason,
          q,
          d,
          tags: [tag],
          parts: [`pat:${pattern}`, ...(name === last ? ["p:nach"] : [])],
          own: true,
          ...(rotation(pattern) ? { rot: rotation(pattern) } : {}),
          ...extra,
        },
        p,
      ),
    );
  };
  const tag = { s: ALL_STYLES, q: 0.8 };
  if (person.first && person.full !== last)
    add(
      person.full,
      "Dein voller Name ist die ehrlichste Marke: Kunden wissen sofort, mit wem sie es zu tun haben.",
      0.85,
      0.6,
      tag,
      "voll",
      suffixFor(p, person.full),
    );
  add(
    last,
    "Nur dein Nachname trägt die Marke, souverän und ruhig, so treten die großen Häuser auf.",
    0.85,
    0.6,
    tag,
    "nach",
    suffixFor(p, last, false),
  );
  const place = placeName(p);
  if (place)
    add(
      last,
      `Dein Nachname trägt, ${place} im Zusatz zeigt deine Spezialisierung ohne Klischee.`,
      0.8,
      0.6,
      tag,
      "nach-ort",
      place,
    );
  if (realitaetenFits(p))
    add(
      last,
      "Realitäten ist der österreichische Traditionsbegriff, klein unter deinem Namen wirkt das etabliert.",
      0.8,
      0.6,
      tag,
      "nach-real",
      "Realitäten",
    );
  for (const head of p.kwHeads) {
    const suffix = place ? `${head.w} ${place}` : `${head.w} Immobilien`;
    if (last.length + 1 + suffix.length <= MAX_NAME_LENGTH)
      add(
        last,
        `Dein Nachname trägt, ${suffix} im Zusatz sagt in zwei Wörtern, worauf du spezialisiert bist.`,
        0.8,
        0.6,
        tag,
        "nach-kw",
        suffix,
      );
  }
  for (const { field, label, route } of p.kwFields)
    if (
      field.zusatz &&
      !route &&
      fieldSuffixFits(field.zusatz, p) &&
      last.length + 1 + field.zusatz.length <= MAX_NAME_LENGTH
    )
      list.push(
        makeCandidate(
          "person",
          {
            name: last,
            suffix: field.zusatz,
            reason: `Dein Nachname trägt, ${field.zusatz} im Zusatz sagt sofort, worauf du spezialisiert bist.`,
            q: 0.8,
            d: 0.6,
            tags: [tag],
            parts: ["pat:nach-feld", "p:nach", `kwl:${label}`],
            own: true,
          },
          p,
        ),
      );
  if (p.styles.includes("luxus") && overlaps(["land", "haeuser"], p.focus))
    add(
      last,
      "Estates passt zu Landsitzen und Villen und gibt deinem Namen internationale Weite.",
      0.7,
      0.6,
      tag,
      "nach-estates",
      "Estates",
    );
  if (overlaps(["anleger", "land"], p.focus))
    add(
      last,
      "Liegenschaften ist der genaue österreichische Begriff für Grund und Haus, das wirkt sachkundig.",
      0.7,
      0.6,
      tag,
      "nach-lieg",
      "Liegenschaften",
    );
  const core = person.lastCore;
  if (core !== last)
    add(
      core,
      `Ohne „${person.particle}“ wirkt ${core} kürzer und trägt die Marke allein.`,
      0.8,
      0.6,
      tag,
      "nach-kern",
      suffixFor(p, core, false),
    );
  if (person.lastParts.length === 2) {
    for (const part of person.lastParts)
      if (letterCount(part) >= 4)
        add(
          part,
          `Nur ${part} aus deinem Doppelnamen: kürzer, leichter zu merken und trotzdem deiner.`,
          0.75,
          0.6,
          tag,
          "nach-teil",
          suffixFor(p, part, false),
          { rot: 0.7 },
        );
    const joined = person.lastParts[0]! + person.lastParts[1]!.toLocaleLowerCase("de-AT");
    if (
      letterCount(joined) <= 12 &&
      maxConsonantRun(joined.toLocaleLowerCase("de-AT")) <= 3 &&
      pronounceable(joined)
    )
      add(
        joined,
        "Beide Teile deines Doppelnamens in einem Wort: eigenständig wie eine Marke.",
        0.65,
        0.65,
        tag,
        "nach-zusammen",
        suffixFor(p, joined, false),
        { rot: 0.6 },
      );
  }
  if (person.firsts.length >= 2) {
    const second = person.firsts[1]!;
    const name =
      `${second} ${last}`.length <= MAX_NAME_LENGTH ? `${second} ${last}` : `${second} ${core}`;
    add(
      name,
      `Dein zweiter Vorname ${second} mit dem Nachnamen: persönlich und seltener als der Rufname.`,
      0.65,
      0.6,
      tag,
      "zweit",
      suffixFor(p, name),
      { rot: 0.6 },
    );
    const initial = (w: string): string =>
      (w.match(/\p{L}/u)?.[0] ?? "").toLocaleUpperCase("de-AT");
    add(
      `${person.firsts
        .slice(0, 2)
        .map((w) => `${initial(w)}.`)
        .join(" ")} ${core}`,
      "Beide Anfangsbuchstaben vor dem Nachnamen wirken förmlich und klassisch.",
      0.55,
      0.55,
      tag,
      "initial-voll",
      suffixFor(p, core),
      { rot: 0.5 },
    );
  }
  const short = last.length <= 12;
  if (person.first && short && /^[A-Z]/.test(person.first))
    add(
      `${person.first.charAt(0)}. ${last}`,
      "Mit Initial wirkt dein Name förmlicher und bekommt eine klassische Note.",
      0.6,
      0.55,
      tag,
      "initial",
      suffixFor(p, last),
    );
  if (short)
    add(
      `Atelier ${last}`,
      "Atelier ist ein Werkstattwort: Handarbeit und eine kleine, feine Auswahl statt Werbesprache.",
      0.7,
      0.7,
      { s: ["luxus", "elegant", "modern"], f: ["luxus", "wohnen"], x: true, q: 0.7 },
      "atelier",
      "Immobilien",
    );
  if (short)
    add(
      `Studio ${last}`,
      `Studio ${last} wirkt modern und zugänglich, ohne beliebig zu sein.`,
      0.6,
      0.6,
      { s: ["modern", "mutig"], x: true, q: 0.6 },
      "studio",
      "Immobilien",
      { later: true },
    );
  if (short)
    add(
      `Haus ${last}`,
      `Haus ${last} klingt nach Familienbetrieb und Beständigkeit.`,
      0.5,
      0.55,
      { s: ["warm", "natur"], f: ["haeuser", "land"], x: true, q: 0.5 },
      "haus",
      suffixFor(p, last),
      { later: true },
    );
  return [...out, ...list.filter(isCandidate)];
}

/** Initialen (`Xa`). */
export function initialNames(p: NameProfile): Candidate[] {
  const person = p.person;
  if (!person || !usableInitials(person.initials)) return [];
  const ini = person.initials;
  const tag = { s: ALL_STYLES, q: 0.5 };
  const add = (
    name: string,
    reason: string,
    q: number,
    pattern: string,
    suffix: string,
    extra: Partial<Draft> = {},
  ): Candidate | null =>
    makeCandidate(
      "initialen",
      {
        name,
        suffix,
        reason,
        q,
        d: 0.45,
        tags: [tag],
        parts: [`pat:${pattern}`],
        own: true,
        later: true,
        ...extra,
      },
      p,
    );
  const suffix =
    person.full.length + ini.length + 1 <= MAX_NAME_LENGTH ? person.full : suffixFor(p, ini);
  return [
    add(
      ini,
      "Deine Initialen als Zeichen, dein Name klein darunter: so arbeiten Architektur- und Designbüros.",
      0.6,
      "ini",
      suffix,
    ),
    add(
      `${ini} & Partner`,
      "Initialen mit Partner wirken etabliert, passen aber nur, wenn es wirklich Partner gibt.",
      0.45,
      "ini-partner",
      "Immobilien",
      { later: true, hint: "Nur verwenden, wenn es Partner gibt." },
    ),
    p.styles.some((s) => s === "modern" || s === "mutig")
      ? add(
          `Studio ${ini}`,
          "Kurz und grafisch, das wirkt modern und passt auf jedes Profilbild.",
          0.5,
          "ini-studio",
          "Immobilien",
          {
            later: true,
          },
        )
      : null,
  ].filter(isCandidate);
}

// ---------------------------------------------------------------------------
// Ort

/** Ortskombinationen wie "Döblinger Raumwerk" (`Ri`). */
const PLACE_COMBOS: ReadonlyArray<{ w: string; t: StyleTag }> = [
  { w: "Raumwerk", t: { s: ["modern", "mutig"], f: ["wohnen", "gewerbe", "neubau"], q: 0.8 } },
  { w: "Wohnwerk", t: { s: ["modern", "warm"], f: ["wohnen", "neubau"], q: 0.7 } },
  { w: "Wohnatelier", t: { s: ["luxus", "elegant"], f: ["luxus", "wohnen"], x: true, q: 0.75 } },
  { w: "Hofgut", t: { s: ["natur", "warm", "elegant"], f: ["land", "haeuser"], x: true, q: 0.7 } },
  { w: "Landgut", t: { s: ["natur", "warm"], f: ["land", "haeuser"], x: true, q: 0.7 } },
  {
    w: "Stadtkontor",
    t: { s: ["elegant", "modern"], f: ["anleger", "gewerbe"], x: true, q: 0.75 },
  },
  { w: "Wertkontor", t: { s: ["elegant", "modern"], f: ["anleger"], x: true, q: 0.7 } },
  { w: "Flächenwerk", t: { s: ["modern", "mutig"], f: ["gewerbe"], x: true, q: 0.65 } },
  { w: "Raumkante", t: { s: ["mutig"], f: ["gewerbe", "neubau"], x: true, q: 0.6 } },
];

/** Stil eines Ortsnamens nach Muster (`Ki`). */
function placeStyle(parts: readonly string[]): NameStyle {
  const has = (x: string): boolean => parts.includes(x);
  if (has("pat:wohnen-in") || has("pat:zuhause-in") || has("pat:daheim-in")) return "satz";
  if (has("pat:ort-kombi") || has("pat:ort-kw")) return "zusammengesetzt";
  if (has("pat:zinshaus") || has("pat:landhaus") || has("pat:quartiere") || has("pat:ort-funktion"))
    return "echt";
  return "bildhaft";
}

/** Adjektivische Stichworte passen nicht hinter ein Ortsadjektiv (`yi`). */
const ADJECTIVE_END = /(iv|al|isch|lich|ig|ret|ell|ant|ent|bar|sam|los|haft|ban|ital|ern)$/i;

/** Namen mit Ortsbezug (`Fr`). */
export function placeNames(p: NameProfile): Candidate[] {
  const ref = p.place;
  if (!ref) return [];
  const out: Array<Candidate | null> = [];
  const rankAdj = (parts: readonly string[]): number =>
    parts.includes("pat:ort-funktion") ? -6 : 0;
  const add = (
    name: string,
    reason: string,
    q: number,
    d: number,
    tag: StyleTag & { w?: string },
    parts: string[],
    suffix: string | null | undefined = suffixFor(p, name),
    later = false,
  ): void => {
    if (!tagAllowed(tag, p)) return;
    out.push(
      makeCandidate(
        "ort",
        {
          name,
          suffix: suffix ?? undefined,
          reason,
          q,
          d,
          tags: [tag],
          parts: [...parts, "o:ort"],
          style: placeStyle(parts),
          later,
          ...(rankAdj(parts) ? { rankAdj: rankAdj(parts) } : {}),
        },
        p,
      ),
    );
  };
  if (!ref.known) {
    add(
      `Wohnen in ${ref.name}`,
      "Sagt in drei Wörtern, was du tust und wo, das versteht jeder sofort.",
      0.45,
      0.3,
      { s: ["warm", "natur"], f: ["wohnen", "haeuser"], q: 0.45 },
      ["pat:wohnen-in"],
      null,
    );
    return out.filter(isCandidate);
  }
  const place = ref.place;
  const name = place.name;
  const adj = place.adj;
  const urban = !place.rural;
  if (adj)
    add(
      adj,
      `${adj} trägt, Realitäten steht klein darunter, ganz in österreichischer Tradition.`,
      0.7,
      0.5,
      { s: ALL_STYLES, q: 0.7 },
      ["pat:ort-funktion"],
      "Realitäten",
      true,
    );
  if (adj) {
    add(
      `${adj} Wohnkultur`,
      `Verbindet ${name} mit Lebensstil, das spricht Käufer mit Anspruch an.`,
      0.65,
      0.45,
      { s: ["elegant", "luxus", "warm"], f: ["wohnen", "luxus"], x: true, q: 0.6 },
      ["pat:wohnkultur", "w:kultur"],
      null,
    );
    add(
      `${adj} Adressen`,
      `Adressen klingt nach ausgewählten Objekten statt Massenangebot, mit klarem Bezug zu ${name}.`,
      0.8,
      0.6,
      { s: ["luxus", "elegant"], f: ["luxus", "wohnen", "haeuser"], x: true, q: 0.7 },
      ["pat:adressen", "w:adresse"],
      null,
    );
    add(
      `${adj} Residenzen`,
      "Residenzen klingt nach repräsentativem Wohnen und passt zu Neubau im gehobenen Segment.",
      0.5,
      0.5,
      { s: ["luxus"], f: ["luxus"], x: true, q: 0.5 },
      ["pat:residenzen", "w:residenz"],
      null,
    );
    if (place.rural)
      add(
        `${adj} Landhaus`,
        `Landhaus und ${name} zeigen sofort, wofür du stehst: Häuser mit Grund in der Region.`,
        0.6,
        0.45,
        { s: ["natur", "warm"], f: ["land", "haeuser"], x: true, q: 0.6 },
        ["pat:landhaus", "w:haus"],
        null,
      );
    if (urban)
      add(
        `${adj} Zinshaus`,
        `Zinshaus ist der Begriff, den Anleger in ${name} suchen, das wirkt fachkundig.`,
        0.55,
        0.45,
        { s: [], f: ["anleger"], x: true, q: 0.55 },
        ["pat:zinshaus"],
        null,
      );
    if (urban)
      add(
        `${adj} Quartiere`,
        "Quartiere denkt in Nachbarschaften und passt zu Projekten und Neubau.",
        0.5,
        0.45,
        { s: ["modern"], f: ["neubau", "gewerbe"], x: true, q: 0.5 },
        ["pat:quartiere", "w:quartier"],
        null,
      );
    for (const combo of PLACE_COMBOS)
      add(
        `${adj} ${combo.w}`,
        `${name} plus ein klares Wort: lokal verankert und trotzdem eigenständig.`,
        combo.t.q,
        0.6,
        combo.t,
        [`c:${combo.w}`, "pat:ort-kombi"],
        "Immobilien",
      );
    for (const head of p.kwHeads.filter(
      (h) => !ADJECTIVE_END.test(h.w) && !isGenericWord(h.w) && !wordWeakness(h.w),
    ))
      add(
        `${adj} ${head.w}`,
        `${name} und dein Schwerpunkt ${head.w} in zwei Wörtern, klarer geht eine lokale Marke kaum.`,
        0.7,
        0.55,
        { q: 0.7 },
        [`kw:${head.w}`, "pat:ort-kw"],
        "Immobilien",
        true,
      );
  }
  const loc = place.loc;
  if (loc.length <= 16)
    add(
      `Wohnen ${loc}`,
      "Sagt in wenigen Wörtern, was du tust und wo, das versteht jeder sofort.",
      0.45,
      0.3,
      { s: ["warm", "natur", "elegant"], f: ["wohnen", "haeuser", "land"], x: true, q: 0.45 },
      ["pat:wohnen-in"],
      null,
    );
  if (loc.length <= 15)
    add(
      `Daheim ${loc}`,
      "Daheim ist das österreichische Wort für Zuhause, das klingt herzlich und nach Nachbarschaft.",
      0.5,
      0.35,
      { s: ["warm", "natur"], f: ["wohnen", "haeuser", "land"], x: true, q: 0.5 },
      ["pat:daheim-in"],
      null,
    );
  if (loc.length <= 15)
    add(
      `Zuhause ${loc}`,
      "Klingt nahbar und persönlich, wie eine Empfehlung unter Nachbarn.",
      0.4,
      0.3,
      { s: ["warm"], f: ["wohnen", "haeuser"], x: true, q: 0.4 },
      ["pat:zuhause-in"],
      null,
    );
  if (!/\s/.test(name))
    add(
      `Atelier ${name}`,
      "Atelier klingt nach Auswahl statt Masse und gibt dem Ort eine feine Note.",
      0.5,
      0.55,
      { s: ["luxus", "elegant"], f: ["luxus"], x: true, q: 0.5 },
      ["pat:atelier-ort", "w:atelier"],
      "Immobilien",
    );
  for (const mark of place.marks ?? []) {
    add(
      `Wohnen ${mark.at}`,
      `Bild und Ort in einem, das weckt sofort eine Vorstellung, wenn du ${mark.at} verkaufst.`,
      0.5,
      0.45,
      { s: ["warm", "natur", "elegant"], f: ["wohnen", "haeuser", "land"], x: true, q: 0.5 },
      [`m:${mark.name}`, "pat:wohnen-in"],
      null,
    );
    if (mark.adj) {
      add(
        `${mark.adj} Adressen`,
        `${mark.name} hat einen Klang, Adressen macht daraus eine feine, lokale Marke.`,
        0.65,
        0.6,
        { s: ["luxus", "elegant"], f: ["luxus", "wohnen", "haeuser"], x: true, q: 0.7 },
        [`m:${mark.name}`, "pat:adressen"],
        null,
      );
      add(
        `${mark.adj} Wohnkultur`,
        `${mark.name} plus Wohnkultur: lokal, gediegen und sofort einzuordnen.`,
        0.55,
        0.5,
        { s: ["elegant", "warm", "luxus"], f: ["wohnen", "luxus"], x: true, q: 0.6 },
        [`m:${mark.name}`, "pat:wohnkultur"],
        null,
      );
    }
  }
  return out.filter(isCandidate);
}

// ---------------------------------------------------------------------------
// Klassisch

/** Grosse Staedte: keine "Immobilienkanzlei Wien" (`Ti`). */
const BIG_CITY = /^(Wien|Graz|Linz|Salzburg|Innsbruck|Klagenfurt)$/;

/** Klassische Formen: & Partner, & Söhne, Kanzlei, Büro, Teilort mit Realitäten (`Fi`). */
export function classicNames(p: NameProfile): Candidate[] {
  const out: Array<Candidate | null> = [];
  const add = (
    name: string,
    reason: string,
    q: number,
    d: number,
    tag: StyleTag & { w?: string },
    pattern: string,
    isOwn: boolean,
    suffix: string | undefined,
    extra: Partial<Draft> = {},
  ): void => {
    if (!tagAllowed(tag, p)) return;
    out.push(
      makeCandidate(
        "klassisch",
        {
          name,
          suffix,
          reason,
          q,
          d,
          tags: [tag],
          parts: [`pat:${pattern}`],
          own: isOwn,
          ...extra,
        },
        p,
      ),
    );
  };
  const person = p.person;
  if (person) {
    const last = person.last;
    add(
      `${last} & Partner`,
      "Klassisch und etabliert, passt aber nur, wenn es wirklich Partner gibt.",
      0.65,
      0.45,
      { s: ["elegant", "modern", "luxus"], q: 0.65 },
      "partner",
      true,
      "Immobilien",
      { later: true, hint: "Nur verwenden, wenn es Partner gibt." },
    );
    add(
      `${last} & Söhne`,
      "Die alte Handelshaus-Form wirkt glaubwürdig, aber nur bei echter Familiennachfolge.",
      0.5,
      0.45,
      { s: ["elegant", "warm"], q: 0.5 },
      "soehne",
      true,
      "Immobilien",
      { later: true, hint: "Nur bei echter Familiennachfolge verwenden." },
    );
    add(
      `Immobilienkanzlei ${last}`,
      "Kanzlei klingt nach Sorgfalt, Diskretion und persönlicher Beratung.",
      0.55,
      0.45,
      { s: ["elegant", "luxus"], q: 0.55 },
      "kanzlei",
      true,
      undefined,
      { later: true },
    );
    add(
      `Immobilienbüro ${last}`,
      "Schlicht und ehrlich: ein Büro mit deinem Namen, das jeder versteht.",
      0.45,
      0.35,
      { s: ["warm", "modern", "natur"], q: 0.45 },
      "buero",
      true,
      undefined,
      { later: true },
    );
  }
  const ref = p.place;
  if (ref?.known) {
    const place = ref.place;
    if (
      !/\s/.test(place.name) &&
      !BIG_CITY.test(place.name) &&
      place.kind !== "land" &&
      place.kind !== "region"
    )
      add(
        `Immobilienkanzlei ${place.name}`,
        `Kanzlei plus ${place.name}: sorgfältig, lokal und sofort einzuordnen.`,
        0.45,
        0.35,
        { s: ["elegant", "luxus"], f: ["anleger"], x: true, q: 0.45 },
        "ort-kanzlei",
        false,
        undefined,
        { later: true },
      );
    for (const mark of place.marks ?? [])
      if (!/\s/.test(mark.name) && mark.name.length >= 5)
        add(
          mark.name,
          `${mark.name} kennt jeder in der Gegend, mit Realitäten klein darunter wird daraus eine ruhige Hausmarke.`,
          0.6,
          0.55,
          { s: ["elegant", "warm", "natur", "luxus"], x: true, q: 0.6 },
          "m-realitaeten",
          false,
          "Realitäten",
          { later: /see$|See$|berg$|stein$/.test(mark.name), rot: 0.5 },
        );
  }
  return out.filter(isCandidate);
}

// ---------------------------------------------------------------------------
// Zusammensetzungen

/** Satzenden der Begruendung (`Qn`). */
const REASON_ENDS = [
  "und bleibt nach einmal Hören hängen.",
  "und passt auf jedes Schild.",
  "und ist trotzdem sofort verständlich.",
];

/** Stichwort taugt als Bestimmungswort vor werk oder atelier (`Di`). */
const shortHead = (w: string): boolean =>
  letterCount(w) <= 6 && syllables(w) <= 2 && !/(haus|hof|gut|bau|werk|raum|feld)$/i.test(w);

/** Zusammensetzungen wie Raumwerk, Wohnwert, Altbauatelier (`Yn`). */
function compoundNames(p: NameProfile): Candidate[] {
  const out: Candidate[] = [];
  const heads: PartWord[] = [...COMPOUND_HEADS.filter((h) => tagAllowed(h, p)), ...p.kwHeads];
  const kwHeads = new Set(p.kwHeads.map((h) => h.w));
  for (const head of heads)
    for (const tail of COMPOUND_TAILS) {
      if (!tagAllowed(tail, p)) continue;
      const fromKw = kwHeads.has(head.w);
      if (tail.w === "wert" && !fromKw) continue;
      const anchored = [head, tail].some(
        (x) => p.kw.includes(fold(x.w)) || p.anchor.has(`w:${fold(x.w)}`),
      );
      if (
        !p.relaxed &&
        !fromKw &&
        !anchored &&
        (p.styles.length || p.focus.length) &&
        ![head, tail].some((x) => overlaps(x.s, p.styles) || overlaps(x.f, p.focus))
      )
        continue;
      const allowed = own(COMPOUND_PAIRS, tail.w);
      if (
        (!fromKw && allowed && !allowed.includes(head.w)) ||
        (fromKw && (!shortHead(head.w) || !["werk", "atelier"].includes(tail.w)))
      )
        continue;
      const name = head.w + tail.w;
      const low = name.toLocaleLowerCase("de-AT");
      if (
        (!fromKw &&
          !anchored &&
          (!inSlot(p, low) ||
            !lucky(p, low, 0.8) ||
            !(stylesFit(head.s, p) && stylesFit(tail.s, p)))) ||
        head.w.toLocaleLowerCase("de-AT") === tail.w ||
        TAKEN_COMPOUNDS.has(low) ||
        TAKEN_COMPOUNDS.has(fold(low)) ||
        name.length > 13 ||
        maxConsonantRun(name) > 3 ||
        maxVowelRun(name) > 2 ||
        /(.)\1\1/.test(low) ||
        head.w.slice(-1).toLocaleLowerCase("de-AT") === tail.w.charAt(0)
      )
        continue;
      const h = hash(low);
      const short =
        own(COMPOUND_REASONS, tail.w) ?? `${head.w} und ${tail.w} ergeben ein klares Bild`;
      const reason = `${short}, das klingt ${toneOf([head, tail], p, h)} ${REASON_ENDS[h % REASON_ENDS.length]}`;
      if (
        !p.relaxed &&
        !fromKw &&
        !anchored &&
        (tagFit(head, p) + tagFit(tail, p)) / 2 < (p.creativity === "frei" ? 0.45 : 0.55)
      )
        continue;
      const real = REAL_COMPOUNDS.has(low);
      if (
        (real && p.affine && !p.relaxed && !fromKw && !anchored) ||
        (!p.relaxed && (p.affine || !p.noBucket) && !real && !fromKw && !anchored)
      )
        continue;
      const c = makeCandidate(
        "kombination",
        {
          name,
          suffix: suffixFor(p, name, false, true),
          reason: capitalize(reason),
          short,
          q: (head.q + tail.q) / 2,
          d: real ? 0.4 : 0.8,
          tags: [head, tail],
          parts: [fromKw ? `kw:${head.w}` : `w:${fold(head.w)}`, `w:${tail.w}`, `c:${name}`],
          coined: true,
          style: real ? "echt" : "zusammengesetzt",
          ...(fromKw ? { later: true } : {}),
        },
        p,
      );
      if (c) out.push(c);
    }
  return out;
}

// ---------------------------------------------------------------------------
// Kunstwoerter aus Wurzeln

/** Kunstwort aus Wurzel taugt (`hn`). */
function coinable(name: string, maxSyllables: number): boolean {
  const low = name.toLocaleLowerCase("de-AT");
  if (low.length < 4 || low.length > 10) return false;
  const syl = syllables(name);
  return !(
    syl < 2 ||
    syl > maxSyllables ||
    maxConsonantRun(low) > 2 ||
    maxVowelRun(low) > 2 ||
    /(aa|ee|ii|oo|uu|uo|ou|ae|oe|ue|ei|au|eu|ie)/.test(low.replace(/^au/, "")) ||
    REAL_FOREIGN.has(low)
  );
}

/** Wurzel plus Endung (Terrana) und zwei Wurzeln (Novaterra) (`Pi`). */
function rootNames(p: NameProfile): Candidate[] {
  const out: Candidate[] = [];
  const fits = (r: StyleTag): boolean =>
    !!p.relaxed ||
    (!p.styles.length && !p.focus.length) ||
    overlaps(r.s, p.styles) ||
    overlaps(r.f, p.focus);
  const roots = ROOTS.filter((r) => tagAllowed(r, p));
  const kwWords = p.kwWords;
  const push = (
    name: string,
    reason: string,
    q: number,
    tags: StyleTag[],
    parts: string[],
    short?: string,
  ): void => {
    const c = makeCandidate(
      "kunstwort",
      {
        name,
        suffix: suffixFor(p, name, false, true),
        reason,
        q,
        d: 0.85,
        tags,
        parts,
        coined: true,
        short,
      },
      p,
    );
    if (c) out.push(c);
  };
  const copy = <T extends StyleTag>(r: T): T => ({ ...r, q: r.q });
  for (const root of roots) {
    const anchored = p.anchor.has(`r:${root.root}`);
    if (!fits(root) || (!kwWords.has(root.root) && !anchored && !lucky(p, root.root, 0.75)))
      continue;
    const ends = rng(hash(root.root) ^ p.seed).shuffle(ROOT_ENDS);
    let count = 0;
    for (const end of ends) {
      const stem = root.stem;
      const lastChar = stem.slice(-1);
      if (VOWELS.test(lastChar) && lastChar === end.e.charAt(0)) continue;
      const name = capitalize(stem + end.e);
      if (
        !coinable(name, 3) ||
        name.toLocaleLowerCase("de-AT") === root.root ||
        (/r$/.test(stem) && end.e.includes("r")) ||
        (/[^aeiou][^aeiou]$/.test(stem) && (end.e === "ira" || end.e === "ana") && !p.relaxed) ||
        (!p.relaxed && !anchored && count++ >= 1)
      )
        continue;
      const fromKw = kwWords.has(root.root);
      const tone = toneOf([root], p, hash(name));
      push(
        name,
        `Abgeleitet von ${root.m}: klingt ${tone} und ist als Neubildung frei von Klischees.`,
        (root.q + end.q) / 2,
        [copy(root)],
        [`r:${root.root}`, `e:${end.e}`, ...(fromKw ? [`kw:${root.root}`] : [])],
        `Abgeleitet von ${root.m}: klingt ${tone}`,
      );
    }
  }
  for (const blend of ROOT_BLENDS) {
    const a = roots.find((r) => r.root === blend.a);
    const b = roots.find((r) => r.root === blend.b);
    if (!a || !b || !(fits(a) || fits(b)) || !coinable(blend.w, 4) || !lucky(p, blend.w, 0.3))
      continue;
    const fromKw = kwWords.has(a.root) || kwWords.has(b.root);
    const tone = toneOf([a, b], p, hash(blend.w));
    push(
      blend.w,
      `Aus ${a.m} und ${b.m}: klingt ${tone} und erzählt in einem Wort, wofür du stehst.`,
      blend.q,
      [copy(a), copy(b)],
      [`r:${a.root}`, `r:${b.root}`, ...(fromKw ? [`kw:${a.root}`] : [])],
    );
  }
  return out;
}

/** Anlaute fuer freie Kunstwoerter: feste plus haeufige aus den Silbenbausteinen (`qi`). */
const FREE_ONSETS_ALL: readonly string[] = [
  ...new Set([
    ...FREE_ONSETS,
    ...(BRAND_RULES.syllables?.onsets ?? [])
      .filter(([s, g]) => g >= 0.5 && /^[bdflmnprstv]$/.test(s))
      .map(([s]) => s),
  ]),
];
/** Auslaute zweisilbiger freier Kunstwoerter (`ji`). */
const FREE_CODAS = ["", "", "", "n", "l", "r", "nd", "rd"];

/** Frei gebildete Kunstwoerter aus weichen Silben, Durchgang `round` (`et`). */
export function freeNames(p: NameProfile, round: number): Candidate[] {
  const r = rng((p.seed ^ Math.imul(round + 1, 2654435761)) >>> 0);
  const out: Candidate[] = [];
  const seen = new Set<string>();
  const free = p.creativity === "frei";
  for (let i = 0; i < 400; i++) {
    const onset = r.chance(0.25) ? "" : r.pick(FREE_ONSETS_ALL);
    const middle = r.pick(FREE_MIDDLES) || r.pick(FREE_ONSETS);
    let word: string;
    if (free && r.chance(0.4))
      word = onset + r.pick(FREE_VOWELS) + middle + r.pick(FREE_VOWELS) + r.pick(FREE_ENDS);
    else {
      const vowel = r.pick(FREE_VOWELS);
      const coda = r.pick(
        FREE_CODAS.filter((c) => !/d$/.test(c) || vowel === "a" || vowel === "o"),
      );
      word = onset + r.pick(FREE_VOWELS) + middle + vowel + coda;
    }
    const name = capitalize(word);
    if (
      seen.has(name) ||
      word.length < 4 ||
      !coinable(name, 4) ||
      /(.)\1/.test(word) ||
      /(..).*\1/.test(word) ||
      softness(word) < 0.55 ||
      hasBadEnding(word) ||
      negativePattern(word, true)
    )
      continue;
    seen.add(name);
    const tone = toneOf([], p, hash(name));
    const c = makeCandidate(
      "kunstwort",
      {
        name,
        suffix: suffixFor(p, name, false, true),
        reason: `Frei gebildet aus weichen Silben: klingt ${tone}, ist leicht auszusprechen und noch unverbraucht.`,
        q: 0.5,
        d: 0.8,
        tags: [],
        parts: ["pat:frei"],
        coined: true,
      },
      p,
    );
    if (c) out.push(c);
  }
  return out.sort((a, b) => b.rank - a.rank || (a.key < b.key ? -1 : 1));
}

// ---------------------------------------------------------------------------
// Feste Wortlisten

/** Woerter, die nur zu Gut- und Seelagen passen (`Xn`). */
export const ESTATE_WORDS: ReadonlySet<string> = new Set(
  [...BILDWOERTER, ...ECHTE_WOERTER, ...FOREIGN].filter((e) => e.estate).map((e) => fold(e.w)),
);

/** Wort aus einer festen Liste passt zum Profil (`Vi`). */
function listWordFits(word: StyleWord, p: NameProfile): boolean {
  if ((word.wien && !p.wien) || (!p.relaxed && word.estate && !estateFits(p))) return false;
  if (fitsPlace(p, word.w)) return true;
  if (!stylesFit(word.s, p) && !p.kwWords.has(fold(word.w))) return false;
  const tag = { s: word.s, f: word.f, q: word.q, x: true };
  return p.relaxed || p.kwWords.has(fold(word.w)) ? true : tagAllowed(tag, p);
}

/** Woerter einer festen Liste (`Kr`). */
function listNames(
  p: NameProfile,
  list: readonly StyleWord[],
  style: NameStyle,
  group: string,
): Candidate[] {
  const out: Candidate[] = [];
  for (const word of list) {
    if (
      !listWordFits(word, p) ||
      (!hitsKeyword(p, word.w) &&
        (!inSlot(p, word.w) || !lucky(p, word.w, style === "echt" ? 0.85 : 0.6)))
    )
      continue;
    const tag = { s: word.s, f: word.f, q: word.q };
    const c = makeCandidate(
      "kombination",
      {
        name: word.w,
        suffix: suffixFor(p, word.w, true, !word.estate || estateFits(p)),
        reason: word.r,
        later: word.later,
        q: word.q,
        d: style === "echt" ? 0.55 : 0.7,
        tags: [tag],
        parts: [`g:${group}`, `c:${word.w}`, ...partsOf(word.w)],
        style,
        short: word.r.slice(0, -1),
        ...(word.wien && !hitsKeyword(p, word.w) ? { rot: 0.5 } : {}),
      },
      p,
    );
    if (c) out.push(c);
  }
  return out;
}

/** Beschriftung je Wortfeld des Lexikons (`_i`). */
const FIELD_LABELS: Readonly<Record<string, string>> = {
  bau: "Bauwort",
  raum: "Raumwort",
  material: "Materialwort",
  licht: "Lichtwort",
  landschaft: "Landschaftswort",
  wohnen: "Wohnwort",
};

/** Lexikonwoerter, die in keiner festen Liste stehen, deutsch und fremd (`Ui`). */
const LEXICON_SPLIT = (() => {
  const words = LEXICON.filter((e) => {
    const key = fold(e.w);
    return (
      !KNOWN_WORDS.has(key) &&
      !PLACE_TOKENS.has(key) &&
      pronounceable(e.w) &&
      maxConsonantRun(e.w) <= 3
    );
  });
  return { de: words.filter((e) => e.lang === "de"), fremd: words.filter((e) => e.lang !== "de") };
})();

/** Echte Woerter aus dem Lexikon (`at`). */
function lexiconNames(p: NameProfile, kind: "kombination" | "kunstwort"): Candidate[] {
  const out: Candidate[] = [];
  for (const word of LEXICON_SPLIT[kind === "kunstwort" ? "fremd" : "de"] as LexiconWord[]) {
    const foreign = word.lang !== "de";
    if (word.kwOnly && !hitsKeyword(p, word.w)) continue;
    const tag = { s: word.s, f: word.f, q: 0.55, x: true };
    if (
      (!p.relaxed && !fitsPlace(p, word.w) && (!stylesFit(word.s, p) || !tagAllowed(tag, p))) ||
      (!hitsKeyword(p, word.w) && !inSlot(p, word.w))
    )
      continue;
    const short = foreign
      ? `${LANG_NAMES[word.lang]} für „${word.m}“: klingt ${toneOf([tag], p, hash(word.w))}`
      : `${word.w} heißt „${word.m}“`;
    const reason = foreign
      ? `${short} und bleibt trotzdem verständlich.`
      : `${short}, ein echtes ${FIELD_LABELS[word.feld]}: ruhig, verständlich und ohne Werbesprache.`;
    const c = makeCandidate(
      kind,
      {
        name: word.w,
        suffix: suffixFor(p, word.w, !foreign, true),
        reason,
        q: 0.55,
        d: 0.7,
        tags: [tag],
        parts: ["g:lex", `l:${word.lang}`, `c:${word.w}`, ...partsOf(word.w)],
        style: foreign ? "fremdsprachig" : word.evo ? "bildhaft" : "echt",
        short,
      },
      p,
    );
    if (c) out.push(c);
  }
  return out;
}

/** Fremdwoerter (`Ci`). */
function foreignNames(p: NameProfile): Candidate[] {
  const out: Candidate[] = [];
  for (const word of FOREIGN) {
    const tag = { s: word.s, f: word.f, q: word.q, x: true };
    if (
      (!p.relaxed && ((word.estate && !estateFits(p)) || !stylesFit(word.s, p))) ||
      !(p.relaxed || tagAllowed(tag, p)) ||
      (!hitsKeyword(p, word.w) && (!inSlot(p, word.w) || !lucky(p, word.w, word.worn ? 0.5 : 0.85)))
    )
      continue;
    const tone = toneOf([tag], p, hash(word.w));
    const short = `${word.lang} für „${word.m}“: klingt ${tone}`;
    const c = makeCandidate(
      "kunstwort",
      {
        name: word.w,
        suffix: suffixFor(p, word.w, false, !word.estate || estateFits(p)),
        later: word.later,
        reason: `${short} und bleibt trotzdem verständlich.`,
        q: word.q,
        d: 0.75,
        tags: [{ s: word.s, f: word.f, q: word.q }],
        parts: ["g:fremd", `l:${word.lang}`, ...partsOf(word.w)],
        style: "fremdsprachig",
        short,
        worn: word.worn,
      },
      p,
    );
    if (c) out.push(c);
  }
  return out;
}

/** Alte Schreibweisen guter echter Woerter und Zusammensetzungen (`tt`). */
function spellingNames(p: NameProfile, base: readonly Candidate[]): Candidate[] {
  if (p.creativity === "direkt" && !p.relaxed) return [];
  const out: Candidate[] = [];
  for (const c of base) {
    if (
      (!p.relaxed && !p.anchor.size && !chance(p, `abg|${c.key}`, 0.45)) ||
      (c.style !== "zusammengesetzt" && c.style !== "echt") ||
      /[\s&]/.test(c.name) ||
      c.score < 55 ||
      c.parts.some((x) => x.startsWith("kw:"))
    )
      continue;
    for (const sp of [...OLD_SPELLINGS, ...BRAND_RULES.spellings]) {
      if (!c.name.toLocaleLowerCase("de-AT").endsWith(sp.from)) continue;
      const name = capitalize(c.name.slice(0, c.name.length - sp.from.length) + sp.to);
      const v = makeCandidate(
        "kombination",
        {
          name,
          suffix: c.suffix === "Realitäten" ? suffixFor(p, name, false, true) : c.suffix,
          reason: `${sp.r}, aus ${c.name} wird ${name}.`,
          q: (c.score / 100) * sp.q * 0.95,
          d: 0.75,
          tags: [],
          parts: [...c.parts.filter((x) => !x.startsWith("s:")), "pat:abgewandelt"],
          coined: true,
          style: "abgewandelt",
          short: sp.r,
        },
        p,
      );
      if (v) out.push(v);
    }
    const variant = c.parts.includes("g:lex") ? null : letterVariant(c.name);
    if (
      variant &&
      !OLD_SPELLINGS.some(
        (sp) =>
          c.name.toLocaleLowerCase("de-AT").endsWith(sp.from) &&
          variant.w.toLocaleLowerCase("de-AT").endsWith(sp.to),
      )
    ) {
      const v = makeCandidate(
        "kombination",
        {
          name: variant.w,
          suffix: c.suffix === "Realitäten" ? suffixFor(p, variant.w, false, true) : c.suffix,
          reason: `Mit C statt K wirkt ${c.name} romanisch und bleibt lesbar, aus ${c.name} wird ${variant.w}.`,
          q: (c.score / 100) * 0.6,
          d: 0.75,
          tags: [],
          parts: [
            ...c.parts.filter((x) => !x.startsWith("s:")),
            "pat:abgewandelt",
            `sv:${variant.id}`,
          ],
          coined: true,
          style: "abgewandelt",
          short: "Mit C statt K wirkt der Name romanisch",
        },
        p,
      );
      if (v) out.push(v);
    }
  }
  return out;
}

const WORD_CACHE = new WeakMap<NameProfile, Candidate[]>();

/** Echte Woerter, Zusammensetzungen, Bilder und Saetze, je Profil zwischengespeichert (`ut`). */
export function wordNames(p: NameProfile): Candidate[] {
  const hit = WORD_CACHE.get(p);
  if (hit) return hit;
  const out = wordNamesUncached(p);
  WORD_CACHE.set(p, out);
  return out;
}

/** `$i` */
function wordNamesUncached(p: NameProfile): Candidate[] {
  const compounds = compoundNames({ ...p, nameStyles: null });
  return [
    ...compounds.filter((c) => !p.nameStyles || p.nameStyles.has(c.style)),
    ...spellingNames(
      p,
      p.creativity === "frei" && !p.relaxed && !p.noBucket
        ? compoundNames({ ...p, nameStyles: null, noBucket: true })
        : compounds,
    ),
    ...listNames(p, BILDWOERTER, "bildhaft", "bildhaft"),
    ...listNames(p, BILDWORT, "bildhaft", "bildwort"),
    ...listNames(p, SAETZE, "satz", "satz"),
    ...listNames(p, ECHTE_WOERTER, "echt", "echt"),
    ...lexiconNames(p, "kombination"),
  ];
}

/** Fertige Kunstwoerter (`Ji`). */
function coinedNames(p: NameProfile): Candidate[] {
  const out: Candidate[] = [];
  for (const word of COINED) {
    const root = ROOTS.find((r) => r.root === word.root);
    if (!root || !tagAllowed(root, p)) continue;
    const fits =
      !!p.relaxed ||
      (p.styles.length ? stylesFit(root.s, p) : !p.focus.length || overlaps(root.f, p.focus));
    const kw = p.kwWords.has(root.root) || p.anchor.has(`r:${root.root}`);
    if (!fits || (!kw && (!inSlot(p, word.w) || !lucky(p, word.w, 0.85)))) continue;
    const tone = toneOf([root], p, hash(word.w));
    const c = makeCandidate(
      "kunstwort",
      {
        name: word.w,
        suffix: suffixFor(p, word.w, false, true),
        reason: `Abgeleitet von ${word.m}: zweisilbig und weich, klingt ${tone}.`,
        short: `Abgeleitet von ${word.m}: zweisilbig und weich`,
        q: word.q,
        d: 0.85,
        tags: [{ ...root }],
        parts: [`r:${root.root}`, ...(p.kwWords.has(root.root) ? [`kw:${root.root}`] : [])],
        coined: true,
        later: word.later,
      },
      p,
    );
    if (c) out.push(c);
  }
  return out;
}

/** Kunstwoerter aller Quellen (`Qi`). */
function coinedAll(p: NameProfile): Candidate[] {
  const wide = p.relaxed || p.creativity === "frei" || !!p.wide;
  return [
    ...coinedNames(p),
    ...(wide ? rootNames(p) : []),
    ...foreignNames(p),
    ...lexiconNames(p, "kunstwort"),
    ...(p.creativity === "frei" && !p.relaxed ? freeNames(p, 999) : []),
  ];
}

// ---------------------------------------------------------------------------
// Stichwort-Felder

/** Bildwoerter ohne Leerzeichen (`Yi`). */
const IMAGE_KEYS = new Set(BILDWOERTER.map((e) => fold(e.w).replace(/\s+/g, "")));
/** Sprachnamen der Feldwoerter (`st`). */
const FIELD_LANGS: Readonly<Record<string, string>> = {
  la: "Latein",
  it: "Italienisch",
  fr: "Französisch",
  es: "Spanisch",
  en: "Englisch",
  de: "Deutsch",
};

/** Woerter aus den Stichwort-Feldern, je Feld hoechstens 30 (`Xi`). */
function fieldNames(p: NameProfile): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const { field, label } of p.kwFields) {
    let count = 0;
    for (const word of field.words) {
      if (
        word.art === "wurzel" ||
        word.lang === "en" ||
        count >= 30 ||
        !pronounceable(word.w) ||
        word.w.split(/\s+/).some((x) => maxConsonantRun(x.toLocaleLowerCase("de-AT")) > 3) ||
        /^(top|best|lux|star|gold|prime|vip|first|super|ultra|maxi|mega|elite|immo)/i.test(
          fold(word.w),
        )
      )
        continue;
      count++;
      const key = flat(word.w);
      if (seen.has(key) || (!p.relaxed && !p.anchor.size && !chance(p, `kwf|${key}`, 0.6)))
        continue;
      seen.add(key);
      const foreign = word.art === "fremd";
      const art = word.art === "kunst";
      if (
        (foreign &&
          !KNOWN_WORDS.has(fold(word.w)) &&
          (letterCount(word.w) < 6 || /[^a-zA-Z\s]/.test(word.w))) ||
        (!KNOWN_WORDS.has(fold(word.w)) && isCommonWord(word.w))
      )
        continue;
      const image = word.art === "bild" || IMAGE_KEYS.has(key);
      const style: NameStyle = art
        ? "markenfaehig"
        : foreign
          ? "fremdsprachig"
          : image
            ? "bildhaft"
            : /[\s&]/.test(word.w)
              ? "satz"
              : "echt";
      const short = foreign
        ? `${FIELD_LANGS[word.lang] ?? "Fremdsprachig"} für „${word.m}“`
        : art
          ? `Kunstwort: ${word.m}`
          : image
            ? `${word.w} weckt ein Bild: ${word.m}`
            : `${word.w} steht für ${word.m}`;
      const c = makeCandidate(
        foreign || art ? "kunstwort" : "kombination",
        {
          name: word.w,
          suffix: suffixFor(p, word.w, !foreign && !art, true),
          reason: `${short}.`,
          short,
          q: 0.7,
          d: 0.65,
          tags: [{ q: 0.7 }],
          parts: ["g:kwf", `kwf:${field.id}`, `kwl:${label}`, `c:${word.w}`, ...partsOf(word.w)],
          style,
          coined: art,
        },
        p,
      );
      if (c) out.push(c);
    }
  }
  return out;
}

const BRANDABLE_CACHE = new Map<string, BrandableWord[]>();

/** Kunstwoerter aus einem Stamm ohne echte Woerter, zwischengespeichert (`dt`). */
function brandable(stem: string, styles: readonly StyleKey[]): BrandableWord[] {
  const key = `${stem}|${[...styles].sort().join(",")}`;
  let out = BRANDABLE_CACHE.get(key);
  if (!out)
    BRANDABLE_CACHE.set(key, (out = brandableFrom(stem, styles).filter((w) => !isRealWord(w.w))));
  return out;
}

/** Wurzelfelder der Regeldatenbank je Stichwort-Feld (`ed`). */
const FIELD_ROOT_TOPICS: Readonly<Record<string, string[]>> = {
  kapital: ["wert"],
  vorsorge: ["wert"],
  zinshaus: ["wert", "bau"],
  vertrauen: ["wert"],
  gewerbe: ["bau"],
  neubau: ["bau", "raum"],
  natur: ["landschaft"],
  grund: ["landschaft", "wert"],
  wasser: ["landschaft"],
  berg: ["landschaft"],
  licht: ["licht"],
  familie: ["wohnen"],
  luxus: ["kultur", "wohnen"],
  stadt: ["bau", "raum"],
  altbau: ["bau", "kultur"],
};

interface StemSource {
  root: string;
  stem: string;
  /** Bedeutung fuer die Begruendung */
  m: string;
  /** Stichwort-Beschriftung */
  label?: string;
  tags: StyleTag[];
}

/** Markenfaehige Kunstwoerter aus Wurzeln der Felder, der Regeldatenbank und der Liste (`rd`). */
function brandNames(p: NameProfile): Candidate[] {
  const out: Candidate[] = [];
  const sources: StemSource[] = [];
  for (const { field, label } of p.kwFields)
    for (const w of field.words)
      if (w.art === "wurzel" && w.stem && !sources.some((s) => s.stem === w.stem))
        sources.push({ root: fold(w.w), stem: w.stem, m: `${w.w} (${w.m})`, label, tags: [] });
  const fits = (t: StyleTag): boolean =>
    !!p.relaxed ||
    (!p.styles.length && !p.focus.length) ||
    overlaps(t.s, p.styles) ||
    overlaps(t.f, p.focus);
  const topicLabel = new Map<string, string>();
  for (const { field, label } of p.kwFields)
    for (const topic of own(FIELD_ROOT_TOPICS, field.id) ?? [])
      if (!topicLabel.has(topic)) topicLabel.set(topic, label);
  for (const root of BRAND_RULES.roots) {
    if (sources.some((s) => s.stem === root.stem)) continue;
    const label = root.felder.map((f) => topicLabel.get(f)).find(Boolean);
    if (!label && (root.q < 0.5 || (!p.relaxed && !chance(p, `brand|${root.stem}`, 0.5)))) continue;
    sources.push({
      root: root.stem,
      stem: root.stem,
      m: `${root.stem}- (${FIELD_LANGS[root.lang] ?? "Latein"} für ${root.m})`,
      ...(label ? { label } : {}),
      tags: [],
    });
  }
  for (const root of ROOTS)
    if (
      tagAllowed(root, p) &&
      fits(root) &&
      !sources.some((s) => s.stem === root.stem) &&
      (p.relaxed || p.allSlots || chance(p, `brand|${root.root}`, 0.5))
    )
      sources.push({ root: root.root, stem: root.stem, m: root.m, tags: [root] });
  for (const source of sources) {
    const words = brandable(source.stem, p.styles).filter((w) => fold(w.w) !== source.root);
    const picked = rng(hash(`${source.root}|brand|${profileKey(p)}`) ^ p.seed).shuffle(
      words.slice(0, 12),
    );
    const max = p.relaxed ? 5 : p.allSlots ? 2 : source.label ? 3 : 1;
    for (const w of picked.slice(0, max)) {
      const tone = toneOf(source.tags, p, hash(w.w));
      const c = makeCandidate(
        "kunstwort",
        {
          name: w.w,
          suffix: suffixFor(p, w.w, false, true),
          reason: `Kunstwort aus ${source.m}: klingt ${tone}, ist gut zu sprechen und noch unverbraucht.`,
          short: `Kunstwort aus ${source.m}`,
          q: Math.min(0.75, 0.45 + w.q * 0.35),
          d: 0.85,
          tags: source.tags,
          parts: [
            "pat:brand",
            `r:${source.root}`,
            `e:${w.e}`,
            ...(source.label ? [`kwl:${source.label}`] : []),
          ],
          coined: true,
          style: "markenfaehig",
        },
        p,
      );
      if (c) out.push(c);
    }
  }
  return out;
}

/** Kurzform und Kunstwoerter aus dem eigenen Namen (`lt`). */
export function ownBrandNames(p: NameProfile): Candidate[] {
  const person = p.person;
  const company = p.company;
  const bases = [
    ...new Set([
      ...(person
        ? [person.lastCore, ...(person.lastParts.length > 1 ? person.lastParts : [])]
        : []),
      ...(company?.kern
        ? [company.kern]
        : company && !/\s/.test(company.core)
          ? [company.core]
          : []),
    ]),
  ].filter((b) => /^\p{L}{4,}$/u.test(b));
  const out: Candidate[] = [];
  for (const base of bases) {
    const short = shortForm(base);
    if (short && short !== base) {
      const c = makeCandidate(
        "kunstwort",
        {
          name: short,
          suffix: suffixFor(p, short, false, true),
          reason: `Die erste Silbe von ${base}: kurz, eigenständig und trotzdem deiner.`,
          short: `Die erste Silbe von ${base}`,
          q: 0.65,
          d: 0.8,
          tags: [],
          parts: ["pat:name-kurz", `b:${fold(base)}`],
          own: true,
          style: "markenfaehig",
        },
        p,
      );
      if (c) out.push(c);
    }
    const stem = fold(base).match(/^[^aeiou]*[aeiou][^aeiou]/);
    if (!stem) continue;
    const words = brandable(stem[0], p.styles).filter((w) => fold(w.w) !== fold(base));
    const picked = rng(hash(`${base}|namebrand|${profileKey(p)}`) ^ p.seed).shuffle(
      words.slice(0, 10),
    );
    for (const w of picked.slice(0, p.relaxed || p.allSlots ? 4 : 2)) {
      const c = makeCandidate(
        "kunstwort",
        {
          name: w.w,
          suffix: suffixFor(p, w.w, false, true),
          reason: `Kunstwort mit ${base} als Basis: klingt nach dir und ist trotzdem eine eigene Marke.`,
          short: `Kunstwort mit ${base} als Basis`,
          q: Math.min(0.75, 0.45 + w.q * 0.35),
          d: 0.85,
          tags: [],
          parts: ["pat:brand", "pat:name-brand", `e:${w.e}`, `b:${fold(base)}`],
          coined: true,
          style: "markenfaehig",
        },
        p,
      );
      if (c) out.push(c);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Alle Wortnamen und Generator je Art

const ALL_CACHE = new WeakMap<NameProfile, Candidate[]>();

/** Alle Wortnamen, je Schluessel der bestbewertete (`td`). */
function allWordNames(p: NameProfile): Candidate[] {
  const hit = ALL_CACHE.get(p);
  if (hit) return hit;
  const words = wordNames(p);
  const fields = fieldNames(p);
  const all = [
    ...words,
    ...fields,
    ...spellingNames(p, [...fields, ...words.filter((c) => c.style === "echt")]),
    ...coinedAll(p),
    ...brandNames(p),
    ...ownBrandNames(p),
  ];
  const best = new Map<string, Candidate>();
  for (const c of all) {
    const prev = best.get(c.key);
    if (!prev || c.rank > prev.rank) best.set(c.key, c);
  }
  const out = [...best.values()].filter((c) => !p.nameStyles || p.nameStyles.has(c.style));
  ALL_CACHE.set(p, out);
  return out;
}

const ofKind =
  (kind: NameKind) =>
  (p: NameProfile): Candidate[] =>
    allWordNames(p).filter((c) => c.kind === kind);

/** Generator je Namensart (`Ze`). */
export const GENERATORS: Readonly<Record<NameKind, (p: NameProfile) => Candidate[]>> = {
  person: personNames,
  ort: placeNames,
  kunstwort: ofKind("kunstwort"),
  kombination: ofKind("kombination"),
  bildhaft: ofKind("bildhaft"),
  fremdsprachig: ofKind("fremdsprachig"),
  abgewandelt: ofKind("abgewandelt"),
  kurz: ofKind("kurz"),
  klassisch: classicNames,
  initialen: initialNames,
};
