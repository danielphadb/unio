/**
 * Stichwort-Felder (nameFinder-Chunk: `Bs`, `Ws`, `Es`, `Hs`, `He`, `Nn`, `Ka`, `Gs`, `xs`,
 * `Ls`, `As`, `Ms`, `vn`, `nn`, `Rs`, `Ks`, `mi`).
 *
 * Makler geben Stichworte ein (Investment, Zinshaus, See ...). Ein Stichwort trifft ein
 * Feld ueber dessen Ausloeser; das Feld liefert passende Woerter, Fremdwoerter, Bilder,
 * Wurzeln und Kunstwoerter. Die Felder entstehen aus der verdichteten Liste
 * `kwFields.data.json`, ergaenzt um `reference/keyword-fields.json`; kleine Felder erben
 * Woerter verwandter Felder.
 */
import compact from "./kwFields.data.json";
import reference from "../reference/keyword-fields.json";
import { fold } from "./fold";

export type KeywordWordArt = "wort" | "fremd" | "bild" | "wurzel" | "kunst";

export interface KeywordWord {
  w: string;
  lang: string;
  art: KeywordWordArt;
  /** Bedeutung */
  m: string;
  /** Wortstamm (nur Wurzeln) */
  stem?: string;
}

export interface KeywordField {
  id: string;
  label: string;
  /** gefaltete Ausloeser ohne Leerzeichen */
  triggers: string[];
  /** Zusatz unter dem Namen, z. B. "Anlageimmobilien" */
  zusatz?: string;
  words: KeywordWord[];
  /** IDs verwandter Felder */
  related?: string[];
  /** IDs zusammengelegter Felder */
  aliases?: string[];
}

/** Kuerzel der Wortart in der verdichteten Liste (`Ws`). */
const ART_CODES: Readonly<Record<string, KeywordWordArt>> = {
  w: "wort",
  f: "fremd",
  b: "bild",
  r: "wurzel",
  k: "kunst",
};

type CompactWord = [string, string, string, string] | [string, string, string, string, string];
interface CompactField {
  id: string;
  label: string;
  triggers: string[];
  zusatz?: string;
  words: CompactWord[];
}

/** Verdichtete Felder ausgepackt (`Es`). */
const BASE_FIELDS: KeywordField[] = (compact as CompactField[]).map((f) => ({
  ...f,
  words: f.words.map(([w, lang, code, m, stem]) => ({
    w,
    lang,
    art: ART_CODES[code]!,
    m,
    ...(stem ? { stem } : {}),
  })),
}));

const LANGS = new Set(["de", "la", "it", "fr", "es", "en"]);
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const strs = (...values: unknown[]): string[] =>
  values.flatMap((v) => (Array.isArray(v) ? v.map(str) : [str(v)])).filter(Boolean);
const isWord = (text: string): boolean => /^[\p{L}][\p{L} &'-]{1,29}$/u.test(text);

/** Wortart aus einer freien Angabe (`Gs`). */
function artOf(text: string, lang: string): KeywordWordArt {
  const key = fold(text);
  if (/wurzel|stamm|root|silbe/.test(key)) return "wurzel";
  if (/kunst|brand|erfund|coin/.test(key)) return "kunst";
  if (/bild|evok/.test(key)) return "bild";
  if (/fremd|latein|ital|franz|span|foreign/.test(key) || (lang && lang !== "de")) return "fremd";
  return "wort";
}

type Loose = Record<string, unknown>;

/** Ein Wort aus der ausfuehrlichen Liste (`xs`). */
function readWord(entry: unknown, defaultArt: string): KeywordWord | null {
  const item = (typeof entry === "string" ? { wort: entry } : entry) as Loose | null;
  if (!item || typeof item !== "object") return null;
  const word = str(item.wort ?? item.w ?? item.name ?? item.word);
  if (!isWord(word)) return null;
  const code = str(item.sprache ?? item.lang ?? item.language)
    .toLowerCase()
    .slice(0, 2);
  const lang = LANGS.has(code) ? code : "de";
  const art = artOf(str(item.art ?? item.typ ?? item.kategorie ?? item.type) || defaultArt, code);
  const stem = fold(str(item.stamm ?? item.stem)).replace(/\s+/g, "");
  const w = art === "wurzel" ? word : word.charAt(0).toLocaleUpperCase("de-AT") + word.slice(1);
  if (art === "wurzel" && !/^[a-z]{2,6}$/.test(stem || fold(w))) return null;
  return {
    w,
    lang: art === "fremd" && lang === "de" ? "la" : lang,
    art,
    m: str(item.bedeutung ?? item.m ?? item.meaning).slice(0, 120) || w,
    ...(art === "wurzel" ? { stem: stem || fold(w).slice(0, 4) } : {}),
  };
}

/** Felder aus der ausfuehrlichen Referenz in beliebiger Schreibweise lesen (`Ls`). */
function readFields(source: unknown): KeywordField[] {
  const root = source as Loose | unknown[] | null;
  const list: unknown[] = Array.isArray(root)
    ? root
    : root && typeof root === "object"
      ? (([
          "cluster",
          "clusters",
          "felder",
          "stichwortfelder",
          "keyword_fields",
          "fields",
          "eintraege",
        ]
          .map((k) => (root as Loose)[k])
          .find(Array.isArray) as unknown[] | undefined) ??
        (Object.values(root).find(
          (v) => Array.isArray(v) && v.length && typeof v[0] === "object",
        ) as unknown[] | undefined) ??
        [])
      : [];
  const out: KeywordField[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const t = entry as Loose;
    const id = fold(str(t.id ?? t.name ?? t.stichwort ?? t.cluster ?? t.bezeichnung)).replace(
      /\s+/g,
      "-",
    );
    const triggers = [
      ...new Set(
        strs(
          t.stichwoerter,
          t.stichwort,
          t.synonyme,
          t.keywords,
          t.trigger,
          t.ausloeser,
          t.begriffe,
        )
          .map((s) => fold(s).replace(/\s+/g, ""))
          .filter((s) => s.length >= 3),
      ),
    ];
    if (!id || !triggers.length) continue;
    const words: KeywordWord[] = [];
    const add = (items: unknown, art: string): void => {
      if (Array.isArray(items))
        for (const item of items) {
          const w = readWord(item, art);
          if (w) words.push(w);
        }
    };
    add(t.woerter ?? t.passend ?? t.passende_woerter ?? t.words, "wort");
    add(t.fremdwoerter ?? t.fremd, "fremd");
    add(t.bildhaft ?? t.evokativ, "bild");
    add(t.wurzeln ?? t.stammsilben ?? t.roots, "wurzel");
    add(t.kunstwoerter ?? t.brandable, "kunst");
    const zusatz = str(t.zusatz ?? t.suffix);
    const related = strs(t.verwandt, t.related).map((s) => fold(s).replace(/\s+/g, "-"));
    out.push({
      id,
      label: str(t.bezeichnung ?? t.label ?? t.name) || id,
      triggers,
      ...(zusatz && isWord(zusatz) ? { zusatz } : {}),
      words,
      ...(related.length ? { related } : {}),
    });
  }
  return out;
}

/** Felder zusammenlegen: gleiche ID oder gemeinsamer Ausloeser (`As`). */
function mergeFields(base: KeywordField[], extra: KeywordField[]): KeywordField[] {
  const out = base.map((f) => ({ ...f, triggers: [...f.triggers], words: [...f.words] }));
  for (const field of extra) {
    const target = out.find(
      (f) => f.id === field.id || f.triggers.some((t) => field.triggers.includes(t)),
    );
    if (!target) {
      out.push(field);
      continue;
    }
    for (const t of field.triggers) if (!target.triggers.includes(t)) target.triggers.push(t);
    if (field.id !== target.id) target.aliases = [...(target.aliases ?? []), field.id];
    if (field.related) target.related = [...new Set([...(target.related ?? []), ...field.related])];
    const seen = new Set(target.words.map((w) => `${w.art}|${fold(w.w)}`));
    for (const w of field.words)
      if (!seen.has(`${w.art}|${fold(w.w)}`)) {
        seen.add(`${w.art}|${fold(w.w)}`);
        target.words.push(w);
      }
    if (!target.zusatz && field.zusatz) target.zusatz = field.zusatz;
  }
  return out;
}

/** Felder mit weniger als 12 Woertern erben bis zu 20 Woerter verwandter Felder (`Ms`). */
function inheritRelated(fields: KeywordField[]): KeywordField[] {
  const byId = new Map(fields.flatMap((f) => [f.id, ...(f.aliases ?? [])].map((id) => [id, f])));
  return fields.map((field) => {
    if (field.words.filter((w) => w.art !== "wurzel").length >= 12 || !field.related?.length)
      return field;
    const seen = new Set(field.words.map((w) => fold(w.w)));
    const added: KeywordWord[] = [];
    for (const id of field.related)
      for (const w of byId.get(id) === field ? [] : (byId.get(id)?.words ?? []))
        if (
          !(
            added.length >= 20 ||
            seen.has(fold(w.w)) ||
            (w.art === "wurzel" && field.words.some((x) => x.art === "wurzel"))
          )
        ) {
          seen.add(fold(w.w));
          added.push(w);
        }
    return { ...field, words: [...field.words, ...added] };
  });
}

/** Alle Stichwort-Felder (`vn`). */
export const KEYWORD_FIELDS: readonly KeywordField[] = inheritRelated(
  mergeFields(BASE_FIELDS, readFields(reference)),
);

/** Endungen, mit denen ein Ausloeser noch trifft ("Zinshaus" trifft "zinshausmarkt") (`Rs`). */
const TRIGGER_TAIL =
  /^(?:e|en|er|es|n|s|ig|ige|igen|lich|liche|lichen)?$|^(?:immobilie|wohnung|haus|haeus|objekt|flaeche|bau|grund|lage|blick|stueck|bereich)/;

/** Ausloeser trifft Stichwort (`Ks`). */
function triggerHits(trigger: string, keyword: string): boolean {
  if (keyword === trigger) return true;
  if (keyword.startsWith(trigger))
    return trigger.length >= 6 || TRIGGER_TAIL.test(keyword.slice(trigger.length));
  return keyword.length >= 5 && trigger.startsWith(keyword) && trigger.length - keyword.length <= 2;
}

/** Felder zu einem Stichwort (`nn`, Export `o`). */
export function keywordFieldsFor(keyword: string): KeywordField[] {
  const key = fold(keyword).replace(/\s+/g, "");
  return key.length < 3
    ? []
    : KEYWORD_FIELDS.filter((f) => f.triggers.some((t) => triggerHits(t, key)));
}

/** Feld nach ID oder Alias (`mi`). */
export function keywordFieldById(id: string): KeywordField | undefined {
  return KEYWORD_FIELDS.find((f) => f.id === id || (f.aliases ?? []).includes(id));
}
