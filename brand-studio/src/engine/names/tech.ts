/**
 * Tech-Muster aus `naming-rules.json` (Abschnitt `tech_muster`) und ihre Anwendung
 * (nameFinder-Chunk: `Me`, `ts`, `us`, `dr`, `La`, `is`, `Dn`, `Aa`, `ds`).
 *
 * Kurze, kreative Tech-Namen tragen auch fuer Maklermarken, App-Endungen (-ify, -ly, -io
 * ...) und App-Muster (Binnenmajuskel, Ziffern, Domain im Namen) dagegen nicht.
 */
import rulesJson from "../reference/naming-rules.json";
import { fold, letters } from "./fold";

export interface AppEnding {
  e: string;
  /** zaehlt nur nach einem Mitlaut (z. B. -r in "Flickr") */
  nachKonsonant: boolean;
}

export interface AppPattern {
  re: RegExp;
  art: string;
  /** gilt nur fuer Kunstwoerter */
  nurKunstwort: boolean;
}

export interface WordField {
  feld: string;
  bild: string;
  woerter: string[];
}

export interface TechRules {
  appEnden: AppEnding[];
  appMuster: AppPattern[];
  /** Gewicht je Namenstechnik (echtes Wort, Fremdsprache, Kunstwort ...) */
  technik: Record<string, number>;
  /** Gewicht je Silbenzahl */
  silben: Record<number, number>;
  /** bevorzugte Folgen aus K(onsonant) und V(okal) */
  vokalmuster: Array<{ muster: string; g: number }>;
  endungen: Array<{ e: string; g: number }>;
  /** harte Verschlusslaute */
  hart: string[];
  hartMax: number;
  /** Wortfelder echter Woerter, die als Name tragen */
  felder: WordField[];
}

/** Werte, falls `tech_muster` fehlt (`Me`). */
const DEFAULTS: TechRules = {
  appEnden: ["ify", "ly", "io", "oo", "ist", "ful", "hub", "stack", "base", "labs", "ai", "app"]
    .map((e) => ({ e, nachKonsonant: false }))
    .concat([{ e: "r", nachKonsonant: true }]),
  appMuster: [
    { re: /[a-z][A-Z]/, art: "binnenmajuskel", nurKunstwort: false },
    { re: /[0-9]/, art: "ziffer", nurKunstwort: false },
    { re: /\.(com|ai|io|app|de|at)$/i, art: "domain", nurKunstwort: false },
    { re: /^(get|go|my|insta|open|smart|e-|i-)/i, art: "app_praefix", nurKunstwort: false },
    { re: /y(?=[^aeiou]|$)/i, art: "y_statt_i", nurKunstwort: true },
    { re: /(.)\1\1/i, art: "dreifach", nurKunstwort: false },
  ],
  technik: {
    "echtes-wort": 1,
    fremdsprache: 0.9,
    zusammensetzung: 0.8,
    personenname: 0.8,
    "echtes-wort-umgedeutet": 0.4,
    verkuerzung: 0.3,
    verschmelzung: 0.3,
    abgewandelt: 0.1,
    kunstwort: 0.1,
    satz: 0.2,
  },
  silben: { 1: 0.7, 2: 1, 3: 0.7, 4: 0.3 },
  vokalmuster: [
    { muster: "KVKKV", g: 1 },
    { muster: "KVKV", g: 0.9 },
    { muster: "KVKVK", g: 0.8 },
    { muster: "KVKKVK", g: 0.8 },
    { muster: "VKKV", g: 0.8 },
    { muster: "KKVKKV", g: 0.6 },
  ],
  endungen: [
    { e: "a", g: 0.9 },
    { e: "o", g: 0.8 },
    { e: "e", g: 0.7 },
    { e: "er", g: 0.6 },
    { e: "n", g: 0.6 },
    { e: "t", g: 0.5 },
    { e: "y", g: 0.1 },
    { e: "x", g: 0.1 },
  ],
  hart: ["k", "t", "p", "b", "d", "g"],
  hartMax: 1,
  felder: [],
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const num = (v: unknown, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

function regex(source: string): RegExp | null {
  if (!source) return null;
  try {
    return new RegExp(source);
  } catch {
    return null;
  }
}

/** `tech_muster` lesen; fehlende Teile kommen aus den Standardwerten (`us`). */
export function readTechRules(rules: unknown): TechRules {
  const tm = obj(obj(rules).tech_muster);
  if (!Object.keys(tm).length) return DEFAULTS;
  const appEnden = arr(tm.gesperrte_app_endungen)
    .map((c) => ({
      e: fold(str(obj(c).endung)).replace(/[^a-z]/g, ""),
      nachKonsonant: obj(c).nach_konsonant === true,
    }))
    .filter((c) => c.e.length >= 1);
  const appMuster = arr(tm.gesperrte_app_muster)
    .map((c): AppPattern | null => {
      const item = obj(c);
      const art = str(item.art);
      const re = regex(str(item.muster));
      return re
        ? {
            re: art === "app_praefix" || art === "domain" ? new RegExp(re.source, "i") : re,
            art,
            nurKunstwort: item.nur_kunstwort === true,
          }
        : null;
    })
    .filter((c): c is AppPattern => !!c);
  const technik: Record<string, number> = {};
  for (const c of arr(tm.techniken)) technik[str(obj(c).technik)] = num(obj(c).gewicht, 0.5);
  const silben: Record<number, number> = {};
  for (const c of arr(tm.silben)) silben[num(obj(c).silben, 0)] = num(obj(c).gewicht, 0.5);
  const vokalmuster = arr(tm.vokalmuster_bevorzugt)
    .map((c) => ({ muster: str(obj(c).muster).toUpperCase(), g: num(obj(c).gewicht, 0.5) }))
    .filter((c) => /^[KV]+$/.test(c.muster));
  const endungen = arr(tm.endungen)
    .map((c) => ({ e: fold(str(obj(c).endung)), g: num(obj(c).gewicht, 0.5) }))
    .filter((c) => c.e);
  const anlaut = obj(tm.anlaut);
  const hart = arr(anlaut.harte_verschlusslaute)
    .map(str)
    .filter((c) => /^[a-z]$/.test(c));
  const felder = arr(tm.wortfelder_echtes_wort)
    .map((c) => ({
      feld: str(obj(c).feld),
      bild: str(obj(c).bild),
      woerter: arr(obj(c).woerter).map(str).filter(Boolean),
    }))
    .filter((c) => c.feld && c.woerter.length);
  return {
    appEnden: appEnden.length ? appEnden : DEFAULTS.appEnden,
    appMuster: appMuster.length ? appMuster : DEFAULTS.appMuster,
    technik: Object.keys(technik).length ? { ...DEFAULTS.technik, ...technik } : DEFAULTS.technik,
    silben: Object.keys(silben).length ? silben : DEFAULTS.silben,
    vokalmuster: vokalmuster.length ? vokalmuster : DEFAULTS.vokalmuster,
    endungen: endungen.length
      ? endungen.sort((a, b) => b.e.length - a.e.length)
      : DEFAULTS.endungen,
    hart: hart.length ? hart : DEFAULTS.hart,
    hartMax: num(anlaut.max_harte_verschlusslaute, 1),
    felder,
  };
}

/** Geltende Tech-Regeln (`dr`). */
export const TECH_RULES: TechRules = readTechRules(rulesJson);

/**
 * App-Muster oder App-Endung im Namen, sonst `null` (`is`). `echt`: echtes Wort (App-Praefix
 * und Endungen zaehlen nicht), `kunst`: Kunstwort (auch Kunstwort-Muster und -r nach Mitlaut).
 */
export function appRuleOf(
  name: string,
  kind: { echt: boolean; kunst: boolean },
  rules: TechRules = TECH_RULES,
): string | null {
  const text = name.trim();
  for (const p of rules.appMuster) {
    if (p.nurKunstwort && !kind.kunst) continue;
    if (p.art === "app_praefix") {
      if (kind.echt) continue;
      const low = text.toLocaleLowerCase("de-AT");
      const m = low.match(p.re);
      if (m && low.length - m[0].length >= 3) return p.art;
      continue;
    }
    if (p.re.test(text)) return p.art;
  }
  if (kind.echt) return null;
  const key = letters(text);
  for (const { e, nachKonsonant } of rules.appEnden) {
    if (nachKonsonant) {
      if (kind.kunst && new RegExp(`[^aeiou]${e}$`).test(key) && !/(er|ar|or|ur|ir)$/.test(key))
        return `endung-${e}`;
      continue;
    }
    if (key.length > e.length + 1 && key.endsWith(e)) return `endung-${e}`;
  }
  return null;
}

/** Lautmuster aus K und V, Vokalfolgen zusammengezogen (`Dn`): "Lumond" wird "KVKVKK". */
export function vowelPattern(name: string): string {
  const key = fold(name)
    .replace(/[^a-z]/g, "")
    .replace(/sch/g, "S")
    .replace(/ch/g, "C")
    .replace(/ck/g, "K")
    .replace(/ph/g, "F")
    .replace(/qu/g, "Q");
  let out = "";
  for (const c of key) out += /[aeiouy]/.test(c) ? "V" : "K";
  return out.replace(/V{2,}/g, "V");
}

/** Anzahl harter Verschlusslaute (`Aa`). */
export function hardCount(name: string, rules: TechRules = TECH_RULES): number {
  const key = fold(name)
    .replace(/[^a-z]/g, "")
    .replace(/ck/g, "k")
    .replace(/c(?=[aou])/g, "k")
    .replace(/ch/g, "");
  let n = 0;
  for (const c of key) if (rules.hart.includes(c)) n++;
  return n;
}

/**
 * Punkte fuer einen Ein-Wort-Namen nach den Tech-Mustern (`ds`): Technik, Silben, Laenge,
 * Lautmuster, Endung, harte Laute; um 0 herum, etwa -10 bis +9.
 */
export function techScore(name: string, technik: string, rules: TechRules = TECH_RULES): number {
  if (name.trim().split(/\s+/).length > 1) return 0;
  const key = letters(name);
  const len = key.length;
  const syllables = (vowelPattern(name).match(/V/g) ?? []).length;
  const tech = rules.technik[technik] ?? 0.5;
  const syl = rules.silben[syllables] ?? 0.2;
  const size = len >= 4 && len <= 7 ? 1 : len <= 9 ? 0.6 : 0.3;
  const pattern = vowelPattern(name);
  const vowel = rules.vokalmuster.find((v) => v.muster === pattern)?.g ?? 0.5;
  const ending = rules.endungen.find((v) => key.endsWith(v.e))?.g ?? 0.5;
  const hard = hardCount(name, rules) > rules.hartMax ? -0.15 : 0;
  const total = 0.3 * tech + 0.2 * syl + 0.2 * size + 0.15 * vowel + 0.15 * ending + hard;
  return Math.round((total - 0.7) * 30);
}
