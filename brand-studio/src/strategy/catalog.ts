/**
 * Fragenkatalog des Markenkompass (texts-Chunk: `R`, `I`, `V`, `Z`, `_`, `C`, `U`, `J`, `q`,
 * `Y`, `K`, `L`, `y`, `T`, `ie`, `Re`) und die Helfer zum Setzen und Lesen der Antworten
 * (`re`, `Fe`, `le`, `Oe`, `F`).
 *
 * Daten: catalog.json (W1 aus dem Bundle gezogen, unveraendert). Jede Frage hat ein Zielfeld
 * im BrandBrief (`feld`, bei verschachtelten Feldern `pfad` wie `voice.formell`).
 */
import data from "./catalog.json";
import type { BrandBrief } from "./types";

/** Eine Antwortkarte oder Option. Zusatzfelder je Liste (z. B. `territorien`). */
export interface KompassOption {
  id: string;
  label: string;
  hint?: string;
}

export type FrageTyp = "wahl" | "text" | "chips" | "mehrfach" | "skala" | "paar";

export interface KompassFrage {
  id: string;
  /** Zielfeld im BrandBrief */
  feld: string;
  /** Verschachteltes Zielfeld, z. B. `voice.formell` oder `social.channels` */
  pfad?: string;
  typ: FrageTyp;
  titel: string;
  hilfe?: string;
  platzhalter?: string;
  optionen?: KompassOption[];
  /** Harte Obergrenze bei Mehrfachwahl */
  max?: number;
  optional?: boolean;
  /** Fakten, die aus dem Projekt vorbefuellt werden (nie Haltungen) */
  vorbefuellt?: boolean;
  /** Nur zeigen, wenn noch kein Name da ist */
  nurOhneName?: boolean;
  /** Nur zeigen, wenn ein anderes Feld einen dieser Werte hat */
  zeigenWenn?: { feld: string; werte: string[] };
}

export interface KompassSchritt {
  nr: number;
  titel: string;
  dauer: string;
  optional?: boolean;
  fragen: KompassFrage[];
}

export interface OnlynessKarte extends KompassOption {
  hint: string;
}

export interface Referenzwelt extends KompassOption {
  hint: string;
  /** Bildbeschreibung fuer die Karte */
  bild: string;
}

/** Stimmprobe: zwei Saetze, a = erster Pol (formell, ernst, sachlich, leise). */
export interface StimmPaar {
  pol: "formell" | "ernst" | "sachlich" | "leise";
  a: string;
  b: string;
}

/** Muster einer Logo-Probe mit dem eigenen Namen. */
export interface LogoMuster {
  font: string;
  weight: number;
  caps: boolean;
  tracking: number;
  symbol: boolean;
  dark: boolean;
}

export interface LogoPaar {
  id: "serif" | "contrast" | "caps" | "width" | "symbol" | "dark";
  frage: string;
  a: string;
  b: string;
  muster: { a: LogoMuster; b: LogoMuster };
}

export interface FarbPaar {
  id: "warmth" | "saturation";
  frage: string;
  a: string;
  b: string;
  farben: { a: string[]; b: string[] };
}

export interface WunschkundeKarte extends KompassOption {
  hint: string;
  /** Stichwort-Felder fuer den Namensgenerator */
  felder: string[];
  /** Territorien, zu denen dieser Kunde passt */
  territorien: string[];
  /** Satzteil fuer die Texte ("Paare, die ...") */
  wer: string;
}

export interface WertKarte extends KompassOption {
  hint: string;
  territorien: string[];
  /** Versprechen in Sie-Form */
  versprechen: string;
}

export interface PersoenlichkeitKarte extends KompassOption {
  eigenschaft: string;
  satz: string;
  territorien: string[];
}

export interface KompassIntro {
  text: string;
  dauer: string;
  hinweis: string;
}

interface CatalogData {
  schritte: KompassSchritt[];
  onlyness: OnlynessKarte[];
  alternativen: KompassOption[];
  referenzwelten: Referenzwelt[];
  klischees: KompassOption[];
  stimmproben: StimmPaar[];
  logoPaare: LogoPaar[];
  farbPaare: FarbPaar[];
  antiFarben: KompassOption[];
  fokus: KompassOption[];
  architektur: KompassOption[];
  erfahrung: KompassOption[];
  segment: KompassOption[];
  zielgruppen: WunschkundeKarte[];
  werte: WertKarte[];
  persoenlichkeit: PersoenlichkeitKarte[];
  kanaele: KompassOption[];
  einleitung: KompassIntro;
}

const CATALOG = data as unknown as CatalogData;

/** Einleitung vor dem ersten Schritt (`Re`). */
export const KOMPASS_INTRO: KompassIntro = CATALOG.einleitung;
/** Die 6 Schritte mit ihren Fragen (`R`). */
export const KOMPASS: readonly KompassSchritt[] = CATALOG.schritte;
/** "Was kannst du, was der nicht kann?" (`I`) */
export const ONLYNESS_KARTEN: readonly OnlynessKarte[] = CATALOG.onlyness;
/** "Wen wuerde dein Kunde sonst nehmen?" (`V`) */
export const ALTERNATIVEN: readonly KompassOption[] = CATALOG.alternativen;
/** 12 Welten aus anderen Branchen (`Z`) */
export const REFERENZ_WELTEN: readonly Referenzwelt[] = CATALOG.referenzwelten;
/** "Nicht ich": 6 Makler-Klischees (`_`) */
export const KLISCHEES: readonly KompassOption[] = CATALOG.klischees;
/** 4 Satzpaare zur Stimme (`C`) */
export const STIMM_PAARE: readonly StimmPaar[] = CATALOG.stimmproben;
/** 6 Logo-Paare, gezeigt mit dem eigenen Namen (`U`) */
export const LOGO_PAARE: readonly LogoPaar[] = CATALOG.logoPaare;
/** 2 Farbpaare: warm oder kuehl, gedeckt oder satt (`J`) */
export const FARB_PAARE: readonly FarbPaar[] = CATALOG.farbPaare;
/** Farbwelten fuer "nie diese Farben" (`q`) */
export const FARB_WELTEN: readonly KompassOption[] = CATALOG.antiFarben;
/** Objektarten (`Y`) */
export const FOKUS_OPTIONEN: readonly KompassOption[] = CATALOG.fokus;
/** Person, Buero oder erst Person und spaeter Buero (`X`) */
export const ARCHITEKTUR_OPTIONEN: readonly KompassOption[] = CATALOG.architektur;
/** Jahre im Beruf (`Q`) */
export const ERFAHRUNG_OPTIONEN: readonly KompassOption[] = CATALOG.erfahrung;
/** Preisband (`ee`) */
export const SEGMENT_OPTIONEN: readonly KompassOption[] = CATALOG.segment;
/** Wunschkunden nach Lebenslage (`K`) */
export const WUNSCHKUNDEN: readonly WunschkundeKarte[] = CATALOG.zielgruppen;
/** Werte mit Versprechen (`L`) */
export const WERTE: readonly WertKarte[] = CATALOG.werte;
/** Fremdbild und Wirkung als Kundensaetze (`y`) */
export const PERSOENLICHKEIT: readonly PersoenlichkeitKarte[] = CATALOG.persoenlichkeit;
/** Social-Kanaele (`ie`) */
export const KANAELE: readonly KompassOption[] = CATALOG.kanaele;

/** Alle Fragen in Reihenfolge (`te`). */
const FRAGEN: readonly KompassFrage[] = KOMPASS.flatMap((s) => s.fragen);

/** Eine Frage ueber ihre ID, z. B. `voice.formell` (`F`). */
export function frageById(id: string): KompassFrage | undefined {
  return FRAGEN.find((f) => f.id === id);
}

/** Inhaltsformate (`T`); dieselbe Liste wie in den Fragen "gern" und "nie". */
export const FORMATE: readonly KompassOption[] = frageById("social.formats")?.optionen ?? [];

/** Ob eine Frage beim aktuellen Stand gezeigt wird (`re`). */
export function frageSichtbar(frage: KompassFrage, brief: BrandBrief): boolean {
  if (frage.nurOhneName && brief.hasName) return false;
  if (frage.zeigenWenn) {
    const wert = (brief as unknown as Record<string, unknown>)[frage.zeigenWenn.feld];
    if (typeof wert !== "string" || !frage.zeigenWenn.werte.includes(wert)) return false;
  }
  return true;
}

/** Antwort im Kompass: Text, eine Option oder mehrere Optionen; leer = Antwort entfernen. */
export type Antwort = string | string[] | undefined;

const PAAR_WERT = { a: -1, b: 1, egal: 0 } as const;
const PAAR_WAHL: Record<string, "a" | "b" | "egal"> = { "-1": "a", "1": "b", "0": "egal" };
/** Freitexte werden getrimmt und auf 300 Zeichen gekuerzt. */
const FREITEXT = new Set(["person", "place", "onlynessText", "proof", "name"]);

type Formats = Record<string, "gern" | "geht" | "nie">;

/**
 * Antwort setzen (`Fe`): unveraenderlich, prueft Optionen und Obergrenzen.
 * Unbekannte Fragen und unbekannte Einzeloptionen lassen den Brief unveraendert.
 */
export function antwortSetzen(brief: BrandBrief, frageId: string, wert: Antwort): BrandBrief {
  const frage = frageById(frageId);
  if (!frage) return brief;
  const leer = wert === undefined || wert === "" || (Array.isArray(wert) && wert.length === 0);
  let v = wert;
  if (Array.isArray(v)) {
    const erlaubt = frage.optionen ? new Set(frage.optionen.map((o) => o.id)) : null;
    v = [...new Set(v)].filter((x) => !erlaubt || erlaubt.has(x));
    if (frage.max) v = v.slice(0, frage.max);
  } else if (typeof v === "string" && frage.optionen && !frage.optionen.some((o) => o.id === v)) {
    return brief;
  }
  const out = { ...brief } as unknown as Record<string, unknown>;
  const [feld, teil] = (frage.pfad ?? frage.feld).split(".") as [string, string | undefined];

  if (feld === "voice" && teil) {
    const voice = { ...((out.voice as Record<string, number> | undefined) ?? {}) };
    if (leer) delete voice[teil];
    else voice[teil] = PAAR_WERT[v as keyof typeof PAAR_WERT];
    out.voice = voice;
    return out as unknown as BrandBrief;
  }
  if ((feld === "logoPairs" || feld === "colorPairs") && teil) {
    const paare = { ...((out[feld] as Record<string, string> | undefined) ?? {}) };
    if (leer) delete paare[teil];
    else paare[teil] = v as string;
    out[feld] = paare;
    return out as unknown as BrandBrief;
  }
  if (feld === "social" && teil) {
    const social = { ...((out.social as Record<string, unknown> | undefined) ?? {}) };
    const formats = (social.formats as Formats | undefined) ?? {};
    if (leer && (teil === "formats" || teil === "formatsNie")) {
      const stufe = teil === "formats" ? "gern" : "nie";
      const rest = Object.entries(formats).filter(([, s]) => s !== stufe);
      if (rest.length) social.formats = Object.fromEntries(rest);
      else delete social.formats;
    } else if (leer) delete social[teil];
    else if (teil === "hoursPerWeek") social.hoursPerWeek = Number(v);
    else if (teil === "camera") social.camera = v;
    else if (teil === "formats" || teil === "formatsNie") {
      const stufe = teil === "formats" ? "gern" : "nie";
      // Einzelwert wie eine Liste behandeln (die gesicherte Fassung brach hier ab)
      const liste = Array.isArray(v) ? v : [v as string];
      const rest = Object.entries(formats).filter(([f, s]) => s !== stufe && !liste.includes(f));
      social.formats = Object.fromEntries([...rest, ...liste.map((f) => [f, stufe])]);
    } else social[teil] = v;
    out.social = social;
    return out as unknown as BrandBrief;
  }
  if (leer) {
    delete out[feld];
    return out as unknown as BrandBrief;
  }
  if (feld === "side") out.side = Math.max(-2, Math.min(2, Number(v)));
  else if (FREITEXT.has(feld)) out[feld] = String(v).trim().slice(0, 300);
  else out[feld] = v;
  return out as unknown as BrandBrief;
}

/** Antwort lesen (`le`): Zahlen als Text, Paare als a, b oder egal. */
export function antwortLesen(brief: BrandBrief, frageId: string): Antwort {
  const frage = frageById(frageId);
  if (!frage) return undefined;
  const b = brief as unknown as Record<string, unknown>;
  const [feld, teil] = (frage.pfad ?? frage.feld).split(".") as [string, string | undefined];
  if (feld === "voice" && teil) {
    const wert = (b.voice as Record<string, number> | undefined)?.[teil];
    return wert === undefined ? undefined : PAAR_WAHL[String(wert)];
  }
  if ((feld === "logoPairs" || feld === "colorPairs") && teil)
    return (b[feld] as Record<string, string> | undefined)?.[teil];
  if (feld === "social" && teil) {
    const social = b.social as Record<string, unknown> | undefined;
    if (!social) return undefined;
    if (teil === "hoursPerWeek")
      return social.hoursPerWeek === undefined ? undefined : String(social.hoursPerWeek);
    if (teil === "formats" || teil === "formatsNie") {
      const stufe = teil === "formats" ? "gern" : "nie";
      const liste = Object.entries((social.formats as Formats | undefined) ?? {})
        .filter(([, s]) => s === stufe)
        .map(([f]) => f);
      return liste.length ? liste : undefined;
    }
    return social[teil] as Antwort;
  }
  const wert = b[feld];
  if (wert === undefined) return undefined;
  if (typeof wert === "number") return String(wert);
  if (Array.isArray(wert) || typeof wert === "string") return wert as Antwort;
  return undefined;
}

/**
 * Anteil der beantworteten Pflichtfragen, 0 bis 1 (`Oe`). Optionale Schritte und Fragen
 * sowie unsichtbare Fragen zaehlen nicht.
 */
export function kompassFortschritt(brief: BrandBrief): number {
  const pflicht = KOMPASS.filter((s) => !s.optional)
    .flatMap((s) => s.fragen)
    .filter((f) => !f.optional && frageSichtbar(f, brief));
  if (!pflicht.length) return 0;
  return pflicht.filter((f) => antwortLesen(brief, f.id) !== undefined).length / pflicht.length;
}
