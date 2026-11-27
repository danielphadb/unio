/**
 * Helfer fuer das Namensfinder-Formular (nameFinder-Chunk: `ha`, `Ud`, `Ht`, `Cd`, `$d`, `Rd`,
 * `Kd`, `yd`, `Td`, `jd`, `Jd`, `Qd`, `Gt`, `Fd`, `xt`, `el`, `nl`, `al`, `tl`).
 *
 * Aus dem Formular wird eine `NameInput`; jede Charge (24 Namen) mischt die Vorschlaege
 * mehrerer Laeufe (Chips fuer Arten und Stile) ohne Doppel.
 */
import { keywordsFromText, suggestedPlace } from "../orte";
import { hash } from "../rng";
import type { BrandInput, InputNameKind, NameFocus, NameKind, StyleKey } from "../../types";
import type { RouteParams } from "../../strategy/types";
import { generateNames, type NameOptions } from "../names";
import type { NameSuggestion } from "./batch";
import type { NameInput } from "./profile";
import { NAME_STYLES, type Creativity, type NameStyle } from "./styles";

/** Namen je Charge (`ha`, Export `B`). */
export const BATCH_SIZE = 24;
/** Gemerkte Namen, ab denen gelernt wird (`Ud`, Export `A`). */
export const LEARN_AFTER = 5;

/** Chip im Formular: Arten oder ein Stil (`Ht`, Export `N`). */
export interface NameChip {
  slug: string;
  label: string;
  example: string;
  kinds?: NameKind[];
  style?: NameStyle;
  /** braucht Person oder Ort */
  needs?: "person" | "region";
  hint?: string;
}

export const NAME_CHIPS: readonly NameChip[] = [
  {
    slug: "personenmarke",
    label: "Personenmarke",
    example: "Z. B. BERGER IMMOBILIEN",
    kinds: ["person", "initialen"],
    needs: "person",
  },
  {
    slug: "ortsbezug",
    label: "Ortsbezug",
    example: "Z. B. DÖBLINGER WOHNEN",
    kinds: ["ort"],
    needs: "region",
  },
  {
    slug: "klassisch",
    label: "Klassisch",
    example: "Z. B. REALITÄTEN BERGER",
    kinds: ["klassisch"],
  },
  { slug: "echt", label: "Echte Wörter", example: "Z. B. HAUSBLICK", style: "echt" },
  {
    slug: "zusammengesetzt",
    label: "Zusammengesetzt",
    example: "Z. B. WOHNWERT",
    style: "zusammengesetzt",
  },
  {
    slug: "bildhaft",
    label: "Bildhaft",
    example: "Z. B. WEITBLICK IMMOBILIEN",
    style: "bildhaft",
  },
  { slug: "markenfaehig", label: "Markenfähig", example: "Z. B. DOMORA", style: "markenfaehig" },
  { slug: "kurz", label: "Kurz und prägnant", example: "Z. B. AREAL", kinds: ["kurz"] },
  { slug: "satz", label: "Kurzer Satz", example: "Z. B. ZUHAUSE IN WÄHRING", style: "satz" },
  {
    slug: "abgewandelt",
    label: "Abgewandelt",
    example: "Z. B. CASAVIO",
    style: "abgewandelt",
    hint: "Bewusst anders geschrieben. Gut unterscheidbar, wird aber oft falsch getippt.",
  },
  {
    slug: "fremdsprachig",
    label: "Fremdsprachig",
    example: "Z. B. VIVERE",
    style: "fremdsprachig",
    hint: "Wörter aus anderen Sprachen. Prüf, ob die Bedeutung passt.",
  },
];

/** Gruende beim Ausblenden (`Cd`, Export `H`). */
export const DISLIKE_REASONS: readonly string[] = [
  "Klingt komisch",
  "Zu verspielt",
  "Zu lang",
  "Schwer auszusprechen",
  "Passt nicht zu Immobilien",
  "Gibt es schon",
];

/** Beschriftung der Art eines Vorschlags (`$d`, Export `s`). */
export function kindLabel(s: Pick<NameSuggestion, "kind" | "style">): string {
  if (s.kind === "person") return "Personenmarke";
  const label =
    NAME_CHIPS.find((c) => c.style && c.style === s.style)?.label ??
    NAME_STYLES.find((c) => c.key === s.style)?.label;
  return s.kind === "initialen" ? (label ?? "Initialen") : (label ?? "Name");
}

/** Formular des Namensfinders (Teil des App-Zustands). */
export interface NameFinderForm {
  person: string;
  company?: string;
  region: string;
  focus: NameFocus[];
  style: StyleKey | "egal";
  /** Stichworte, durch Komma getrennt */
  keywords: string;
  /** freie Beschreibung */
  description?: string;
  route?: { params: RouteParams };
  chips: string[];
  seed: number;
  creativity: Creativity;
  /** auszuschliessende Woerter, durch Komma getrennt */
  exclude: string;
  maxLength: number | null;
}

/** Gelerntes einer Charge. */
export interface BatchPrefs {
  liked: string[];
  disliked: string[];
  lenCap: number | null;
  autoExclude: string[];
  /** gedaempfte Stile */
  damp: string[];
}

/** Eingabe aus dem Formular (`Rd`, Export `t`). */
export function inputFromForm(form: NameFinderForm): NameInput {
  const keywords = form.keywords
    .split(/[,;\s]+/)
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 3);
  let region = form.region.trim() || undefined;
  for (const word of keywordsFromText(form.description ?? "")) {
    const place = suggestedPlace(word);
    if (place && !region) region = place;
    else if (
      !place &&
      !keywords.some((k) => k.toLocaleLowerCase("de-AT") === word.toLocaleLowerCase("de-AT"))
    )
      keywords.push(word);
  }
  return {
    person: form.person.trim() || undefined,
    company: form.company?.trim() || undefined,
    region,
    focus: form.focus,
    styles: form.style === "egal" ? [] : [form.style],
    keywords: keywords.slice(0, 7),
    ...(form.route ? { route: form.route.params } : {}),
  };
}

/** Liste aus einem Textfeld: klein, ab zwei Zeichen, ohne Doppel, hoechstens 20 (index `_L`). */
export function splitList(text: string): string[] {
  return [
    ...new Set(
      text
        .split(/[,;\n]+/)
        .map((t) => t.trim().toLocaleLowerCase("de-AT"))
        .filter((t) => t.length >= 2),
    ),
  ].slice(0, 20);
}

/** Laeufe einer Charge aus Chips und Gelerntem (`Kd`). */
export function batchOptions(
  form: NameFinderForm,
  prefs: BatchPrefs,
): Array<Omit<NameOptions, "count" | "page">> {
  const chips = NAME_CHIPS.filter((c) => form.chips.includes(c.slug));
  const kinds = chips.flatMap((c) => c.kinds ?? []);
  const styles = chips.map((c) => c.style).filter((s): s is NameStyle => !!s);
  const caps = [form.maxLength, prefs.lenCap].filter((n): n is number => typeof n === "number");
  const base: Omit<NameOptions, "count" | "page"> = {
    seed: form.seed,
    creativity: form.creativity,
    exclude: [...splitList(form.exclude), ...prefs.autoExclude],
    ...(caps.length ? { maxLen: Math.min(...caps) } : {}),
    liked: prefs.liked,
    disliked: prefs.disliked,
  };
  const allStyles = NAME_STYLES.map((s) => s.key);
  const undamped =
    !chips.length && prefs.damp.length ? allStyles.filter((s) => !prefs.damp.includes(s)) : null;
  if (!chips.length) return [undamped ? { ...base, nameStyles: undamped } : base];
  const out: Array<Omit<NameOptions, "count" | "page">> = [];
  if (kinds.length) out.push({ ...base, kinds });
  if (styles.length) out.push({ ...base, nameStyles: styles });
  return out;
}

/** Schluessel gegen Doppel in Chargen (`yd`). */
const batchKey = (name: string): string => name.toLocaleLowerCase("de-AT").replace(/\s+/g, "");

/** Eine Charge: Laeufe abwechselnd, je zwei Namen, ohne Doppel (`Td`). */
export function generateBatch(
  input: NameInput,
  runs: ReadonlyArray<Omit<NameOptions, "count" | "page">>,
  seen: Set<string>,
  size = BATCH_SIZE,
): NameSuggestion[] {
  const out: NameSuggestion[] = [];
  const state = runs.map(() => ({ page: 0, buf: [] as NameSuggestion[], done: false }));
  for (let round = 0; out.length < size && round < 40; round++) {
    let progress = false;
    for (let i = 0; i < runs.length && out.length < size; i++) {
      const s = state[i]!;
      if (!s.buf.length && !s.done) {
        const page = generateNames(input, { ...runs[i]!, count: BATCH_SIZE, page: s.page++ });
        if (!page.length || s.page > 8) s.done = true;
        s.buf.push(...page);
      }
      for (let taken = 0; taken < 2 && s.buf.length && out.length < size; ) {
        const item = s.buf.shift()!;
        const key = batchKey(item.name);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(item);
          taken++;
          progress = true;
        }
      }
    }
    if (!progress && state.every((s) => s.done && !s.buf.length)) break;
  }
  return out;
}

/** Alle Chargen eines Formulars (`jd`, Export `e`). */
export function generateBatches(
  input: NameInput,
  form: NameFinderForm,
  batches: readonly BatchPrefs[],
): NameSuggestion[][] {
  const seen = new Set<string>();
  return batches.map((prefs) => generateBatch(input, batchOptions(form, prefs), seen));
}

/** Gespeicherter Name im Projekt. */
export interface SavedName {
  id: string;
  name: string;
  suffix: string;
  kind: NameKind;
  reason: string;
  style: NameStyle;
}

/** Gespeicherten Namen wieder als Vorschlag (`Jd`, Export `g`). */
export function fromSaved(saved: {
  id: string;
  name: string;
  suffix?: string;
  kind: NameKind;
  reason?: string;
  style: NameStyle;
}): Omit<NameSuggestion, "domains" | "highend"> {
  return {
    id: saved.id,
    name: saved.name,
    suffix: saved.suffix || undefined,
    kind: saved.kind,
    reason: saved.reason ?? "",
    score: 0,
    checks: { length: saved.name.length, pronounceable: true, clicheFree: true },
    style: saved.style,
  };
}

/** Vorschlag zum Speichern (`Qd`, Export `i`). */
export const toSaved = (
  s: Pick<NameSuggestion, "id" | "name" | "suffix" | "kind" | "reason" | "style">,
): SavedName => ({
  id: s.id,
  name: s.name,
  suffix: s.suffix ?? "",
  kind: s.kind,
  reason: s.reason,
  style: s.style,
});

/** Art der Logo-Eingabe zur Namensart (`xt`, Export `d`). */
export const inputNameKind = (kind: NameKind): InputNameKind =>
  kind === "person" || kind === "initialen" ? "person" : "company";

/** Logo-Eingabe fuer eine Namenskarte (`Gt`, Export `w`). */
export function nameInput(
  s: { name: string; suffix?: string; kind?: NameKind },
  styles: StyleKey[],
): Pick<BrandInput, "name" | "styles" | "colorMoods" | "themes"> &
  Partial<Pick<BrandInput, "suffix" | "nameKind">> {
  const base = {
    name: s.name,
    ...(s.suffix ? { suffix: s.suffix } : {}),
    styles,
    colorMoods: [],
    themes: [],
  };
  return s.kind ? { ...base, nameKind: inputNameKind(s.kind) } : base;
}

/** Route an eine Eingabe haengen (`Fd`, Export `r`). */
export function withRoute<T extends object>(
  input: T,
  route?: RouteParams,
): T & { route?: RouteParams } {
  return route ? { ...input, route } : input;
}

/** Seed der Charge `index` (`el`, Export `h`). */
export const batchSeed = (seed: number, index: number): number => hash(`${seed}|charge|${index}`);

/** Domain mit Umlauten, falls der Name welche hat (`nl`, Export `u`). */
export function umlautDomain(name: string, _suffix?: string): string | null {
  return /[äöüÄÖÜ]/.test(`${name} `)
    ? `${`${name}`
        .toLocaleLowerCase("de-AT")
        .replace(/&/g, " und ")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9äöü]+/g, "-")
        .replace(/^-+|-+$/g, "")}.at`
    : null;
}

/** Kurzschluessel einer Domain (`al`, Export `j`). */
export const domainKey = (domain: string): string =>
  domain.replace(/\.at$/, "").replace(/-/g, "").slice(0, 30);

/** Hinweis zur Naehe einer Marke (`tl`, Export `n`). */
export function naeheHint(s: Pick<NameSuggestion, "naehe">): string | null {
  const n = s.naehe;
  if (!n || !n.marke?.trim()) return null;
  const marke = n.marke.trim().slice(0, 60);
  return n.art === "gleich"
    ? `gleich wie ${marke}, vor Nutzung prüfen`
    : `ähnlich zu ${marke}, vor Nutzung prüfen`;
}
