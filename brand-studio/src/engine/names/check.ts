/**
 * Namen pruefen (nameFinder-Chunk: `gd`, `bd`, `wd`, `xn`, `zt`, `md`, `St`, `pd`, `vt`, `Wt`,
 * `Zd`).
 *
 * - `pruefeEigenenNamen`: der eigene Name in sieben Punkten (Laenge, Aussprache,
 *   Verwechslung, Domain, Mitbewerber-Test, Klischee, Merkbarkeit)
 * - `pruefeFremdnamen`: Namen von aussen (KI-Vorschlaege) mit denselben Sperren wie die
 *   eigenen Vorschlaege, bewertet und sortiert
 */
import { missingChars } from "../charset";
import { hash } from "../rng";
import type { NameKind } from "../../types";
import { flat, fold, letterCount } from "./fold";
import {
  clicheOf,
  competitorMatch,
  corpusMatch,
  isRetailBrand,
  offensiveOf,
  protectedTermOf,
  tradeBrandOf,
} from "./rules";
import { isTabu } from "./lexicon";
import { pronounceable, syllables } from "./quality";
import { hasBadEnding, negativePattern } from "./brandable";
import {
  isCompound,
  LEXICON_BY_KEY,
  REAL_COMPOUNDS,
  REAL_FOREIGN,
  WORD_ORIGIN,
  type NameStyle,
} from "./styles";
import {
  MAX_NAME_LENGTH,
  PARTICLES,
  parseCompany,
  parsePerson,
  PLACE_TOKENS,
  TITLE_RE,
} from "./person";
import {
  conflictHint,
  DEFAULT_STYLE,
  FUNCTION_IN_NAME,
  KNOWN_WORDS,
  lengthValue,
  REJECTED_NAMES,
  suffixFor,
  syllableValue,
} from "./candidate";
import { highendScore } from "./rating";
import { domainsFor } from "./domains";
import { inputSeed, styleOfName, type NameSuggestion } from "./batch";
import { buildProfile, type NameInput, type NameProfile } from "./profile";

// ---------------------------------------------------------------------------
// Fremde Namen (KI)

/** Vorschlag von aussen, z. B. aus der Namensfunktion. */
export interface ForeignName {
  name: string;
  /** Art in freier Schreibweise ("kreativ", "bildhaft", "personenbezogen" ...) */
  art?: string;
  bedeutung?: string;
  sprache?: string;
}

/** Namensart eines fremden Namens aus Angabe und Gestalt (`gd`). */
function kindOfForeign(art: string | undefined, name: string, p: NameProfile): NameKind {
  const a = fold(art ?? "");
  if (/person|eigen|nachname/.test(a)) return "person";
  if (/initial|monogramm/.test(a)) return "initialen";
  if (/ort|region|lokal|bezirk/.test(a)) return "ort";
  if (/klassisch|partner|kanzlei/.test(a)) return "klassisch";
  if (/abgewandelt|schreib|spelling|variant/.test(a)) return "abgewandelt";
  if (/fremd|latein|ital|franz|span|foreign/.test(a)) return "fremdsprachig";
  if (/bild|evok|metaph/.test(a)) return "bildhaft";
  if (/kurz|praegnant|short/.test(a)) return "kurz";
  if (/kreativ|brand|kunst|erfund|coin|markenfaehig/.test(a)) return "kunstwort";
  if (/zusammen|kombi|kompos|echt|wort|compound/.test(a)) return "kombination";
  const words = fold(name).split(/\s+/);
  if ((p.person?.tokens.map((t) => fold(t)) ?? []).some((t) => words.includes(t))) return "person";
  if (words.some((w) => PLACE_TOKENS.has(w))) return "ort";
  const lex = LEXICON_BY_KEY.get(fold(name));
  if (
    words.length === 1 &&
    letterCount(name) <= 5 &&
    syllables(name) <= 2 &&
    (lex || KNOWN_WORDS.has(fold(name)))
  )
    return "kurz";
  if (lex) return lex.lang === "de" ? "kombination" : "fremdsprachig";
  if (WORD_ORIGIN.get(fold(name)) === "fremd") return "fremdsprachig";
  return words.length > 1 || isCompound(name) ? "kombination" : "kunstwort";
}

/** Stil je Art fuer fremde Namen (`bd`). */
const FOREIGN_STYLE: Readonly<Record<NameKind, NameStyle>> = {
  ...DEFAULT_STYLE,
  kombination: "echt",
};

/**
 * Fremde Namen pruefen und bewerten (`wd`): hoechstens 200, Doppel und gesperrte fallen
 * weg, der Rest kommt sortiert als Vorschlag zurueck.
 */
export function pruefeFremdnamen(names: unknown, input: NameInput): NameSuggestion[] {
  const p = buildProfile(input, inputSeed(input));
  const ownTokens = new Set((p.person?.tokens ?? []).map((t) => fold(t)));
  const seen = new Set<string>();
  const out: Array<NameSuggestion & { rank: number }> = [];
  for (const item of Array.isArray(names)
    ? (names.slice(0, 200) as Array<ForeignName | null>)
    : []) {
    if (!item || typeof item.name !== "string") continue;
    const name = item.name
      .replace(/[‒-―−]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
    const key = flat(name);
    if (
      !name ||
      !key ||
      seen.has(key) ||
      name.length > MAX_NAME_LENGTH ||
      missingChars(name).length ||
      !/\p{L}/u.test(name)
    )
      continue;
    const kind = kindOfForeign(typeof item.art === "string" ? item.art : undefined, name, p);
    const isOwn = fold(name)
      .split(/\s+/)
      .filter(Boolean)
      .some((w) => ownTokens.has(w));
    let rest = name;
    if (isOwn && p.person) for (const t of p.person.tokens) rest = rest.split(t).join(" ");
    const coined = kind === "kunstwort" || kind === "abgewandelt";
    if (
      clicheOf(rest) ||
      protectedTermOf(rest, coined) ||
      (coined && offensiveOf(name)) ||
      (!isOwn &&
        (name.split(/[\s&]+/).some((w) => w && isTabu(w)) ||
          tradeBrandOf(name) ||
          REJECTED_NAMES.has(fold(name))))
    )
      continue;
    const firstName = isOwn && p.person?.first ? fold(p.person.first) : "";
    const withoutFirst =
      (firstName &&
        name
          .split(/\s+/)
          .filter((w) => fold(w) !== firstName)
          .join(" ")) ||
      name;
    const competitor = competitorMatch(name, PLACE_TOKENS);
    const brand = corpusMatch(withoutFirst, coined);
    if (
      (!isOwn && (competitor?.art === "gleich" || brand?.art === "gleich")) ||
      (coined && hasBadEnding(name)) ||
      (!isOwn && negativePattern(name, coined))
    )
      continue;
    seen.add(key);
    const suffix = FUNCTION_IN_NAME.test(name)
      ? undefined
      : suffixFor(p, name, kind !== "kunstwort", true);
    const speakable = pronounceable(name, p.known);
    const highend = highendScore(p, name, suffix);
    const label =
      p.kwFieldWords.get(key) ??
      p.kwLabels.find((l) => key.includes(fold(l))) ??
      (p.kwLabels.length && [...p.kwClaim].some((c) => c.length >= 4 && key.includes(c))
        ? p.kwLabels[0]
        : undefined);
    const raw =
      0.13 * lengthValue(name, kind) +
      0.12 * (speakable ? syllableValue(syllables(name)) : 0.3) +
      0.15 * (competitor || brand ? 0.4 : 0.75) +
      0.25 * (label ? 0.9 : 0.6) +
      0.35 * 0.6;
    const score = Math.round(0.7 * Math.max(0, Math.min(100, raw * 100)) + 0.3 * highend);
    const meaning =
      typeof item.bedeutung === "string"
        ? item.bedeutung.replace(/\s+/g, " ").trim().slice(0, 120)
        : "";
    const base = meaning
      ? `${meaning.charAt(0).toLocaleUpperCase("de-AT")}${meaning.slice(1).replace(/[.!?]+$/, "")}`
      : `${name} ist ein Vorschlag der Namensfunktion, geprüft mit denselben Regeln wie alle anderen`;
    const reason = `${base}${label && !base.includes(label) ? `, passend zu deinem Stichwort „${label}“` : ""}.`;
    const near = (competitor?.level === "strong" ? competitor : null) ?? brand ?? competitor;
    out.push({
      id: `nm-${hash(`ext|${kind}|${name}`).toString(36)}`,
      name,
      ...(suffix ? { suffix } : {}),
      kind,
      reason,
      score,
      checks: {
        length: name.length,
        pronounceable: speakable,
        clicheFree: true,
        ...(competitor
          ? { conflict: conflictHint(competitor.label) }
          : brand
            ? { conflict: conflictHint(brand.label) }
            : {}),
      },
      style: kind === "kombination" ? styleOfName(name) : FOREIGN_STYLE[kind],
      domains: domainsFor(name, suffix),
      highend,
      ...(near ? { naehe: { marke: near.label, art: near.art } } : {}),
      rank: score + (label ? 8 : 0) + (speakable ? 0 : -15) + (near ? -4 : 0),
    });
  }
  return out
    .sort((a, b) => b.rank - a.rank || (a.name < b.name ? -1 : 1))
    .map(({ rank: _rank, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// Eigener Name

/** Gattungswoerter ohne Unterscheidungskraft (`xn`). */
export const GATTUNGSWOERTER: ReadonlySet<string> = new Set(
  `immobilien immobilie immo immos realitaeten realitaet real estate estates property properties makler maklerin maklerbuero
  immobilienbuero immobilienkanzlei immobilienmakler kanzlei buero haus haeuser wohnen wohnung wohnungen zuhause heim home homes
  living partner partnerin partners service services team gruppe group consulting consult center zentrum solutions experts
  experten experte expertin profi profis agentur objekt objekte projekt projekte wohnbau bau grund boden besitz eigentum raum
  wohnraum plus invest investment investments vermittlung verwaltung hausverwaltung management konzept concept ihr ihre dein
  deine unser unsere mein meine die der das und of the for fuer mit am an in im co gmbh og kg ag eu`
    .split(/\s+/)
    .filter(Boolean),
);
/** Floskeln wie "Ihr Partner", "Rundum", "24/7" (`zt`). */
export const FLOSKEL =
  /\b(ihr|dein|deine|ihre|unser|unsere|mein|meine)\s+(immobilien)?(partner|partnerin|makler|maklerin|experte|expertin|team|zuhause|berater|beraterin|profi)\b|\bimmo\s*-?\s*service\b|\bimmoservice\b|\bfull\s*service\b|\brundum\b|\bone\s*stop\b|24\s*\/\s*7|\b360\b/i;

export type PunktId =
  | "laenge"
  | "aussprache"
  | "verwechslung"
  | "domain"
  | "austauschbar"
  | "klischee"
  | "merkbarkeit";

/** Titel je Pruefpunkt (`md`). */
const TITEL: Readonly<Record<PunktId, string>> = {
  laenge: "Länge",
  aussprache: "Aussprache",
  verwechslung: "Verwechslung",
  domain: "Domain",
  austauschbar: "Mitbewerber-Test",
  klischee: "Klischee",
  merkbarkeit: "Merkbarkeit",
};

export type PunktStatus = "gut" | "hinweis" | "kritisch";

/** Ein Punkt der Namenspruefung. */
export interface NamensPunkt {
  id: PunktId;
  status: PunktStatus;
  titel: string;
  text: string;
}

/** Ergebnis der Namenspruefung. */
export interface NamensPruefung {
  name: string;
  punkte: NamensPunkt[];
  gesamt: "stark" | "solide" | "schwach";
  zusammenfassung: string;
}

/** Eingabe saeubern: Striche, Leerraum, hoechstens 80 Zeichen (`St`). */
export const cleanInput = (value: unknown): string =>
  (typeof value === "string" ? value : "")
    .replace(/[‒-―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

/** Name enthaelt einen akademischen Titel (`pd`). */
const hasTitle = (name: string): boolean =>
  name.split(/\s+/).some((w) => {
    const low = w.toLocaleLowerCase("de-AT");
    const bare = low.replace(/[.\-()]/g, "");
    return (
      (TITLE_RE.test(bare) && /\./.test(w)) ||
      /^(?:dipl|mag|dr|ing)\./.test(low) ||
      /^(di|ddr|dkfm|mmag|prof)$/.test(bare)
    );
  });

/** Eingabe ist ein Personenname (Vor- und Nachname, keine Gattungs- oder Ortswoerter) (`vt`). */
export function looksLikePersonName(name: string, p: NameProfile): boolean {
  const person = parsePerson(name);
  if (!person?.first) return false;
  const words = fold(person.full).split(/\s+/);
  if (
    words.length > 5 ||
    words.some(
      (w) =>
        GATTUNGSWOERTER.has(w) ||
        PLACE_TOKENS.has(w) ||
        LEXICON_BY_KEY.has(w) ||
        WORD_ORIGIN.has(w) ||
        REAL_FOREIGN.has(w) ||
        !!clicheOf(w) ||
        !!protectedTermOf(w),
    ) ||
    person.full.split(/\s+/).some((w) => isCompound(w)) ||
    (p.person && !words.some((w) => p.person!.tokens.some((t) => fold(t) === w)))
  )
    return false;
  return person.full.split(/\s+/).every((w) => PARTICLES.has(w) || /^\p{Lu}[\p{L}'’-]+$/u.test(w));
}

/** Name ohne Titel und Rechtsform (`Wt`). */
export function brandPart(name: string, isPerson: boolean): string {
  return isPerson
    ? (parsePerson(name)?.full ?? name)
    : (parseCompany(name)?.core ??
        name.replace(/[\s,]+(GmbH|KG|OG|AG|e\.\s?U\.|GesbR)$/i, "").trim());
}

const EMPTY_INPUT: NameInput = { focus: [], styles: [], keywords: [] };

/** Den eigenen Namen in sieben Punkten pruefen (`Zd`, Export `p`). */
export function pruefeEigenenNamen(input: unknown, context?: NameInput): NamensPruefung {
  const n = cleanInput(input);
  if (!n || !/\p{L}/u.test(n))
    return {
      name: n,
      punkte: [],
      gesamt: "schwach",
      zusammenfassung: "Gib zuerst einen Namen ein, dann prüfen wir ihn in sieben Punkten.",
    };
  const p = buildProfile(context ?? EMPTY_INPUT, inputSeed(context ?? EMPTY_INPUT));
  const isPerson = looksLikePersonName(n, p);
  const t = brandPart(n, isPerson) || n;
  const ownTokens = new Set(
    [...(p.person?.tokens ?? []), ...(isPerson ? (parsePerson(n)?.tokens ?? []) : [])].map((x) =>
      fold(x),
    ),
  );
  const isOwn = fold(t)
    .split(/[\s&/-]+/)
    .filter(Boolean)
    .some((w) => ownTokens.has(w));
  const known = new Set([...p.known, ...ownTokens]);
  const letters = letterCount(t);
  const wordCount = t.split(/\s+/).filter((w) => w !== "&").length;
  const syl = syllables(t);
  const punkte: NamensPunkt[] = [];
  const add = (id: PunktId, status: PunktStatus, text: string): void => {
    punkte.push({ id, status, titel: TITEL[id], text });
  };

  // Laenge
  const title = hasTitle(n);
  const titleNote = title
    ? " Titel wie Dr. oder Mag. gehören auf die Visitenkarte, nicht ins Logo."
    : "";
  const fn = isPerson ? undefined : parseCompany(n)?.fn;
  const fnNote = fn ? ` ohne „${fn}“, das klein in die zweite Zeile kann` : "";
  const shorter = isPerson
    ? "etwa nur der Nachname"
    : isOwn
      ? "etwa nur ein Teil deines Namens"
      : wordCount > 1
        ? "etwa ein Wort davon allein"
        : "etwa eine Silbe weniger";
  const size = `${letters} Buchstaben${fnNote}${wordCount > 1 ? ` in ${wordCount} Wörtern` : ""}`;
  if (letters <= 12 && wordCount <= 2)
    add(
      "laenge",
      title ? "hinweis" : "gut",
      `${size}: passt auf Schild, Visitenkarte und Profilbild.${titleNote}`,
    );
  else if (letters <= 18 && wordCount <= 3)
    add(
      "laenge",
      "hinweis",
      `${size}: Auf Schild und Profilbild wird die Schrift klein. Eine Kurzform hilft, ${shorter}.${titleNote}`,
    );
  else
    add(
      "laenge",
      "kritisch",
      `${size} sind für ein Logo zu lang. Kürze auf ein bis zwei Wörter, ${shorter}.${titleNote}`,
    );

  // Aussprache
  const speakable = pronounceable(t, known);
  const special = [
    ...new Set(
      (t.match(/[^\p{Script=Latin}\s&.'’-]|[^a-zA-ZäöüÄÖÜß\s&.'’-]/gu) ?? []).filter((c) =>
        /\p{L}/u.test(c),
      ),
    ),
  ];
  const spelled = !isOwn && /(ph|th|y|c[eiy]|qu|x|ae|oe)/i.test(fold(t).replace(/\s+/g, ""));
  if (!speakable)
    add(
      "aussprache",
      "kritisch",
      "Schwer auszusprechen: Zu viele Mitlaute oder Selbstlaute in Folge. Wer den Namen nur hört, kann ihn kaum schreiben.",
    );
  else if (special.length)
    add(
      "aussprache",
      "hinweis",
      `Sonderzeichen wie ${special.slice(0, 3).join(", ")} tippen viele ohne Akzent. Sag dazu, wie man den Namen spricht, und sichere die Schreibweise ohne.`,
    );
  else if (/ß/.test(t))
    add(
      "aussprache",
      "hinweis",
      "In Versalien wird ß zu SS. Prüf, ob dir das Schriftbild in Großbuchstaben gefällt.",
    );
  else if (spelled)
    add(
      "aussprache",
      "hinweis",
      "Gut zu sprechen, aber am Telefon musst du die Schreibweise buchstabieren (etwa ph, th, y oder c).",
    );
  else
    add(
      "aussprache",
      "gut",
      isOwn
        ? "Dein Name, so wie du ihn sagst: leicht zu sprechen und zu schreiben."
        : "Leicht auszusprechen und nach einmal Hören zu schreiben.",
    );

  // Verwechslung
  const first = p.person?.first ?? (isPerson ? parsePerson(n)?.first : undefined);
  const firstKey = first ? fold(first) : "";
  const withoutFirst =
    (isOwn &&
      firstKey &&
      t
        .split(/\s+/)
        .filter((w) => fold(w) !== firstKey)
        .join(" ")) ||
    t;
  let rest = t;
  for (const token of [
    ...(p.person?.tokens ?? []),
    ...(isPerson ? (parsePerson(n)?.tokens ?? []) : []),
  ])
    rest = rest.split(token).join(" ");
  const term = rest.trim() ? protectedTermOf(rest) : null;
  const competitor = competitorMatch(withoutFirst, PLACE_TOKENS);
  const brand = corpusMatch(withoutFirst, false);
  const trade = isOwn ? null : tradeBrandOf(t);
  const tabu = !isOwn && t.split(/[\s&]+/).find((w) => w && isTabu(w));
  const same =
    (competitor?.art === "gleich" ? competitor.label : null) ??
    (brand?.art === "gleich" ? brand.label : null) ??
    trade;
  const near = (competitor?.level === "strong" ? competitor : null) ?? brand ?? competitor;
  const ownTrade = isOwn ? tradeBrandOf(t) : null;
  const withFirst = !!firstKey && t.split(/\s+/).some((w) => fold(w) === firstKey);
  if (!term && ownTrade && isRetailBrand(ownTrade))
    withFirst
      ? add(
          "verwechslung",
          "hinweis",
          `„${ownTrade}“ ist auch eine bekannte Handels- oder Firmenmarke. Mit Vornamen bleibt dein Name eindeutig, trotzdem vor Nutzung prüfen lassen.`,
        )
      : add(
          "verwechslung",
          "kritisch",
          `„${ownTrade}“ allein ist eine bekannte Handels- oder Firmenmarke. Nutze den Namen nur mit Vornamen und lass ihn vor Nutzung prüfen.`,
        );
  else if (term)
    add(
      "verwechslung",
      "kritisch",
      `„${term}“ ist ein geschützter oder irreführender Begriff (wie Bank, Notar oder Treuhand). Ohne Berechtigung nicht verwenden, vor Nutzung prüfen lassen.`,
    );
  else if (same && !isOwn)
    add(
      "verwechslung",
      "kritisch",
      `Gleich wie die Marke „${same}“. So eher nicht verwenden, vor Nutzung prüfen lassen.`,
    );
  else if (same)
    add(
      "verwechslung",
      "hinweis",
      `Dein Name ist gleich wie die Marke „${same}“. Er bleibt dein Name, trotzdem vor Nutzung prüfen lassen.`,
    );
  else if (near)
    add("verwechslung", "hinweis", `Ähnlich zu „${near.label}“. Vor Nutzung prüfen lassen.`);
  else if (tabu)
    add(
      "verwechslung",
      "hinweis",
      `„${tabu}“ steht in unserer Namens-Datenbank als belegt oder heikel. Vor Nutzung prüfen lassen.`,
    );
  else
    add(
      "verwechslung",
      "gut",
      "Keine Nähe zu den geprüften Marken und Mitbewerbern gefunden. Eine Markenrecherche ersetzt das nicht.",
    );

  // Domain
  const domains = domainsFor(t);
  const domain = domains.at.replace(/\.at$/, "");
  const joined = domain.replace(/-/g, "");
  const notes: string[] = [];
  if (/[äöüß]/i.test(t))
    notes.push(
      `Umlaute werden zu ae, oe, ue oder ss (${domains.at}), sichere auch die Schreibweise mit Umlaut`,
    );
  else if (/[^\x00-\x7F]/.test(t.replace(/[’]/g, "")))
    notes.push(`Akzente fallen in der Domain weg (${domains.at})`);
  if (domain.includes("-"))
    notes.push(`ohne Bindestrich liest sich ${joined}.at leichter, sichere beide`);
  if (joined.length > 15) notes.push(`${joined.length} Zeichen sind lang zum Tippen`);
  const cap = (s: string): string => s.charAt(0).toLocaleUpperCase("de-AT") + s.slice(1);
  if (notes.length)
    add(
      "domain",
      notes.length > 1 && joined.length > 20 ? "kritisch" : "hinweis",
      `${notes.map(cap).join(". ")}. Ob sie frei ist, zeigt erst der Registrar.`,
    );
  else
    add(
      "domain",
      "gut",
      `${domains.at} und ${domains.com} sind leicht zu tippen. Ob sie frei sind, zeigt erst eine Abfrage beim Registrar.`,
    );

  // Mitbewerber-Test
  const words = fold(n)
    .replace(/[.,]/g, " ")
    .split(/[\s&/-]+/)
    .filter(Boolean);
  const isPlaceWord = (w: string): boolean =>
    PLACE_TOKENS.has(w) ||
    (!!p.place &&
      fold(p.place.known ? p.place.place.name : p.place.name)
        .split(/\s+/)
        .includes(w));
  const ownWords = words.filter(
    (w) => !GATTUNGSWOERTER.has(w) && !isPlaceWord(w) && !ownTokens.has(w),
  );
  const withPlace = words.some(isPlaceWord);
  const stock =
    ownWords.length > 0 &&
    ownWords.every(
      (w) =>
        isCompound(w.charAt(0).toLocaleUpperCase("de-AT") + w.slice(1)) || REAL_COMPOUNDS.has(w),
    );
  if (FLOSKEL.test(n))
    add(
      "austauschbar",
      "kritisch",
      "Diese Floskel könnte jeder Makler schreiben und sagt nicht, wofür gerade du stehst.",
    );
  else if (isOwn)
    add(
      "austauschbar",
      "gut",
      "Dein Name gehört nur dir: Kein Mitbewerber kann ihn genauso tragen.",
    );
  else if (ownWords.length)
    stock
      ? add(
          "austauschbar",
          "hinweis",
          `${t} ist aus Allerweltsteilen gebaut, ähnliche Namen gibt es oft.${withPlace ? " Der Ort macht ihn lokal, aber nicht einzigartig." : ""}`,
        )
      : ownWords.length < words.length - (withPlace ? 1 : 0) - 1
        ? add(
            "austauschbar",
            "hinweis",
            "Ein eigenes Wort trägt den Namen, die Gattungswörter darum herum könnten auch klein im Zusatz stehen.",
          )
        : add(
            "austauschbar",
            "gut",
            "Der Name hat ein eigenes Wort und passt nicht einfach auf jeden anderen Makler.",
          );
  else
    add(
      "austauschbar",
      "kritisch",
      `${n} würde genauso für jeden anderen Makler${withPlace ? " in der Gegend" : ""} passen: ${withPlace ? "Ort und Gattungswort" : "Gattungswörter"} allein unterscheiden dich nicht.`,
    );

  // Klischee
  const cliche = rest.trim() ? clicheOf(rest) : null;
  const pattern = !isOwn && !cliche ? negativePattern(t, false) : null;
  if (cliche)
    add(
      "klischee",
      "kritisch",
      `„${cliche}“ ist ein Makler-Klischee, das sehr viele verwenden. Es wirkt austauschbar und eher laut als hochwertig.`,
    );
  else if (pattern)
    add(
      "klischee",
      "hinweis",
      "Das Muster gilt als abgegriffen (etwa Superlativ, Gold, Schlüssel oder Immo am Anfang). Ein ruhigeres Wort wirkt hochwertiger.",
    );
  else add("klischee", "gut", "Kein Makler-Klischee wie Traum, Premium, Home oder Schlüssel.");

  // Merkbarkeit
  if (/^\p{Lu}{2,4}$/u.test(t.replace(/[.\s&]/g, "")))
    add(
      "merkbarkeit",
      "hinweis",
      "Initialen merkt sich nur, wer weiß, wofür sie stehen. Mit dem ausgeschriebenen Namen darunter funktioniert es.",
    );
  else if (isPerson && syl <= 6)
    add(
      "merkbarkeit",
      "gut",
      "Ein Personenname bleibt hängen, sobald man dich kennt: ideal für Empfehlungen.",
    );
  else if (syl <= 4)
    add(
      "merkbarkeit",
      "gut",
      `${syl} ${syl === 1 ? "Silbe" : "Silben"}: kurz genug, um ihn nach einmal Hören weiterzusagen.`,
    );
  else if (syl <= 6)
    add(
      "merkbarkeit",
      "hinweis",
      `Mit ${syl} Silben wird der Name im Gespräch gern abgekürzt. Überleg, welche Kurzform du selbst willst.`,
    );
  else
    add(
      "merkbarkeit",
      "kritisch",
      `Mit ${syl} Silben ist der Name schwer zu merken und wird sicher abgekürzt. Wähle die Kurzform lieber selbst.`,
    );

  const critical = punkte.filter((x) => x.status === "kritisch");
  const hints = punkte.filter((x) => x.status === "hinweis");
  const list = (items: NamensPunkt[]): string => {
    const titles = items.map((x) => x.titel);
    return titles.length > 1
      ? `${titles.slice(0, -1).join(", ")} und ${titles[titles.length - 1]}`
      : (titles[0] ?? "");
  };
  const gesamt = critical.length ? "schwach" : hints.length >= 2 ? "solide" : "stark";
  const zusammenfassung =
    gesamt === "schwach"
      ? `Schwach bei ${list(critical)}. Schau dir die Alternativen an, bevor du dich festlegst.`
      : gesamt === "solide"
        ? `Solide. Denk noch über ${list(hints)} nach.`
        : hints.length
          ? `Stark, mit einem Punkt zum Mitdenken: ${list(hints)}.`
          : "Stark: gut auszusprechen, eigenständig und ohne Klischee.";
  return { name: n, punkte, gesamt, zusammenfassung };
}
