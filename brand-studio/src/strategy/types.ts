/**
 * Markenkompass und Routen (Ausbaustufe 5, docs/18): gemeinsamer Vertrag.
 *
 * Datenfluss:
 *   BrandBrief (Antworten des Kompasses, alle optional)
 *     -> strategy/axes      Achsen aus dem Brief: AxisVector
 *     -> strategy/routes    chooseRoutes: drei BrandRoute (A sicher, B mutig, C ueberraschend)
 *     -> RouteParams        steuert Logo-Engine (BrandInput.route) und Namensfinder (route)
 *     -> RouteTexts         Kernidee, Claim, Story, Social-Kit (Regeln; KI nur innerhalb der Route)
 *
 * Abgeleitet aus der gesicherten Fassung: Pruefung des Briefs (index `Lg`), der Route
 * (`JT`, `Fg`, `YT`, `QT`), des Kompass-Zustands (`pC`), aus kompass `K` (Routen-Parameter)
 * und texts `xe` (Texte). Grenzen stehen jeweils dabei.
 */
import type {
  ColorMoodKey,
  ContainerKey,
  FontForm,
  NameFocus,
  NameKind,
  StyleKey,
  SymbolTheme,
} from "../types";

// ---------------------------------------------------------------------------
// Achsen

/** Gestaltungsachsen, je -1 bis 1. */
export type AxisKey =
  | "serif" /* -1 Grotesk, 1 Antiqua */
  | "contrast" /* -1 gleichmaessiger Strich, 1 hoher Strichkontrast */
  | "width" /* -1 schmal, 1 breit */
  | "weight" /* -1 leicht, 1 kraeftig */
  | "caps" /* -1 gemischt, 1 Versalien */
  | "tracking" /* -1 eng, 1 weit gesperrt */
  | "warmth" /* -1 kuehl, 1 warm */
  | "saturation" /* -1 gedeckt, 1 satt */
  | "dark" /* -1 heller Grund, 1 dunkler Grund */
  | "symbol"; /* -1 reine Wortmarke, 1 Zeichen oder Monogramm */

/** Reihenfolge wie in axes.json und in der Pruefung (`WT`). */
export const AXIS_KEYS: readonly AxisKey[] = [
  "serif",
  "contrast",
  "width",
  "weight",
  "caps",
  "tracking",
  "warmth",
  "saturation",
  "dark",
  "symbol",
];

export interface AxisValue {
  /** -1 bis 1 */
  v: number;
  /** 0 bis 1; 0 = offen (der Generator variiert diese Achse bewusst) */
  sicher: number;
}

export type AxisVector = Partial<Record<AxisKey, AxisValue>>;

// ---------------------------------------------------------------------------
// Brief (Antworten)

export type Architecture = "person" | "buero" | "person-dann-buero";
/** Wie lange schon am Markt. */
export type Erfahrung = "neu" | "einige" | "lange";
export type Segment = "einstieg" | "mitte" | "premium" | "luxus";
/** Wen der Kunde sonst nehmen wuerde. */
export type Alternative =
  | "franchise"
  | "bank"
  | "platzhirsch"
  | "online"
  | "privat";
/** Welten aus anderen Branchen (Referenzwahl). */
export type ReferenceWorld =
  | "verlag"
  | "uhrmacher"
  | "architektur"
  | "privatbank"
  | "hotel"
  | "cafe"
  | "galerie"
  | "tech"
  | "manufaktur"
  | "weingut"
  | "sport"
  | "mode";
/** Makler-Klischees fuer "Nicht ich" (harte Sperren). */
export type Cliche =
  | "gold-schwarz"
  | "haus-icon"
  | "skyline"
  | "schluessel"
  | "schreibschrift"
  | "monogramm-kreis";
/** Wunschkunden (hoechstens 2). */
export type Wunschkunde =
  | "erstkauf"
  | "familie"
  | "verkleinern"
  | "erbe"
  | "trennung"
  | "anleger"
  | "zuzug"
  | "landwunsch"
  | "unternehmer"
  | "bautraeger";
/** Werte (hoechstens 2). */
export type Wert =
  | "ehrlichkeit"
  | "verlaesslichkeit"
  | "genauigkeit"
  | "diskretion"
  | "naehe"
  | "tempo"
  | "gestaltung"
  | "mut"
  | "bestaendigkeit"
  | "offenheit";
/** Wirkung: wie man wirken will (`wirkung`) bzw. wie andere einen sehen (`fremdbild`), je hoechstens 2. */
export type Wirkung =
  | "aufrichtig"
  | "kompetent"
  | "kultiviert"
  | "begeisternd"
  | "bodenstaendig"
  | "ruhig"
  | "durchsetzungsstark"
  | "herzlich"
  | "organisiert";
export type LogoPair =
  | "serif"
  | "contrast"
  | "caps"
  | "width"
  | "symbol"
  | "dark";
export type ColorPair = "warmth" | "saturation";
/** Wahl in einem Paar: a = erster Pol (siehe Kompass), b = zweiter Pol, egal = Achse offen. */
export type PairChoice = "a" | "b" | "egal";
export type VoicePole = "formell" | "ernst" | "sachlich" | "leise";
export type SocialCamera = "gesicht" | "stimme" | "objekte";
export type FormatLiking = "gern" | "geht" | "nie";

export interface SocialBrief {
  /** IDs wie `instagram`, `linkedin`, `newsletter` (hoechstens 8, /^[a-z0-9._-]{1,40}$/) */
  channels?: string[];
  camera?: SocialCamera;
  /** 0 bis 40 */
  hoursPerWeek?: number;
  /** hoechstens 10 Formate */
  formats?: Partial<Record<string, FormatLiking>>;
  /** hoechstens 8 */
  never?: string[];
}

export interface BrandBrief {
  version: 1;
  /** Schritt 1 */
  architecture?: Architecture;
  erfahrung?: Erfahrung;
  /** Eigener Name (Personenmarke), bis 80 Zeichen */
  person?: string;
  hasName?: boolean;
  /** Vorhandener Markenname, bis 80 Zeichen */
  name?: string;
  /** Schritt 2: Ort, bis 60 Zeichen */
  place?: string;
  focus?: NameFocus[];
  segment?: Segment;
  /** -2 nur Eigentuemer bis 2 nur Kaeufer (ganzzahlig), fehlt = nicht beantwortet */
  side?: number;
  wunschkunde?: Wunschkunde[];
  /** Schritt 3 */
  alternative?: Alternative;
  /** IDs der Antwortkarten (hoechstens 2), siehe strategy/catalog */
  onlyness?: string[];
  /** bis 300 Zeichen */
  onlynessText?: string;
  /** Beleg, bis 300 Zeichen */
  proof?: string;
  werte?: Wert[];
  /** Schritt 4: -1 erster Pol (z. B. formell), 1 zweiter Pol (locker), 0 beides */
  voice?: Partial<Record<VoicePole, -1 | 0 | 1>>;
  wirkung?: Wirkung[];
  fremdbild?: Wirkung[];
  /** Schritt 5 */
  logoPairs?: Partial<Record<LogoPair, PairChoice>>;
  colorPairs?: Partial<Record<ColorPair, PairChoice>>;
  avoidColors?: ColorMoodKey[];
  avoidCliches?: Cliche[];
  reference?: ReferenceWorld;
  /** Schritt 6 (optional, fuer das Social-Kit) */
  social?: SocialBrief;
}

/** Zustand des Kompasses (localStorage `unio-brand:kompass`). */
export interface KompassState {
  brief: BrandBrief;
  /** ohne Vorzeichen (`>>> 0`) */
  seed: number;
  /** "Mutiger"-Regler je Route, -1 bis 1 in halben Schritten, 0 fehlt */
  mutiger: Partial<Record<RouteId, number>>;
  /** gemerkte IDs, hoechstens 30 */
  gemerkt: string[];
  /** 1 bis 7 */
  schritt: number;
}

// ---------------------------------------------------------------------------
// Route

/** Anteile der Logo-Arten auf einer Galerieseite (Summe beliebig, wird normiert). */
export interface KindMix {
  wortmarke: number;
  monogramm: number;
  zeichen: number;
  vorlage: number;
}

/**
 * Was eine Route an die Generatoren weitergibt. Alle Felder sind Vorlieben,
 * ausser `avoid*` (harte Sperren).
 */
export interface RouteParams {
  /** Territorium-ID, z. B. `rat` */
  territory: string;
  styles: StyleKey[];
  colorMoods: ColorMoodKey[];
  avoidColorMoods: ColorMoodKey[];
  themes: SymbolTheme[];
  avoidThemes: SymbolTheme[];
  fontForms: FontForm[];
  avoidFontForms: FontForm[];
  avoidContainers: ContainerKey[];
  axes: AxisVector;
  kindMix: KindMix;
  /** Signature-Vorlagen: bevorzugte Stile, leer = keine Vorliebe */
  signatureStyles: StyleKey[];
  /** Erlaubte Signature-Vorlagen (Basis-IDs); fehlt = alle (hoechstens 200) */
  signatureIds?: string[];
  avoidSignatureIds: string[];
  /** Gesperrte Paletten (Basis-ID oder volle ID), nur wenn vorhanden */
  avoidPaletteIds?: string[];
  /** Namensfinder */
  nameKinds: NameKind[];
  /** hoechstens 8 aus der Route, Pruefung erlaubt 40 */
  keywordFields: string[];
  keywords: string[];
  /** Seed-Anteil aus den Antworten (gleiche Antworten = gleiche Routen) */
  seed: number;
}

export interface SocialSaeule {
  titel: string; // 60
  /** hoechstens 10, je bis 300 Zeichen */
  hooks: string[];
}

export interface SocialKit {
  /** hoechstens 4 */
  saeulen: SocialSaeule[];
  profiltext: string; // 600
}

export interface PersoenlichkeitsZug {
  eigenschaft: string; // 60
  satz: string; // 300
}

export interface FormatEmpfehlung {
  /** z. B. "Bilderstrecke" */
  format: string; // 60
  /** z. B. "einmal pro Woche" */
  rhythmus: string; // 80
  satz: string; // 300
}

/** Texte einer Route (Regeln; `quelle` "ki" wenn von der KI umformuliert). */
export interface RouteTexts {
  kernidee: string; // 600
  /** hoechstens 8 */
  schluesselwoerter: string[];
  warum: string; // 600
  onlyness: string; // 600
  positionierung: string; // 900
  /** hoechstens 5 Woerter, bis 120 Zeichen */
  claim: string;
  storyKurz: string; // 600
  storyMittel: string; // 1600
  /** hoechstens 6 */
  tonBeispiele: string[];
  /** hoechstens 12 */
  sagen: string[];
  /** hoechstens 12 */
  vermeiden: string[];
  /** hoechstens 12 */
  leitplanken: string[];
  passtFuer: string; // 500
  risiko: string; // 500
  quelle: "regel" | "ki";
  socialKit?: SocialKit;
  /** hoechstens 5 */
  persoenlichkeit?: PersoenlichkeitsZug[];
  wunschkunde?: string; // 400
  versprechen?: string; // 400
  /** hoechstens 5 */
  formate?: FormatEmpfehlung[];
}

export type RouteArt = "sicher" | "mutig" | "ueberraschend";
export type RouteId = "A" | "B" | "C";

export interface BrandRoute {
  id: RouteId;
  art: RouteArt;
  territory: string;
  /** Titel des Territoriums, bis 120 Zeichen */
  titel: string;
  params: RouteParams;
  texte: RouteTexts;
}

// ---------------------------------------------------------------------------
// Territorien (src/strategy/territories.json)

/** Schwerpunkt der Logo-Arten einer Route. */
export type Betonung = "wortmarke" | "vorlage" | "mitte";
/** Rolle einer Route beim Verteilen der Logo-Arten (gleiche Werte wie `Betonung`). */
export type RouteRolle = Betonung;
export type Hauptachse = "autoritaet" | "moderne" | "naehe";
export type PostFormat = "foto" | "karussell" | "reel" | "story" | "text";

/** Eine strategische Position mit Gestaltung, Namen und Texten. Platzhalter: `{marke}`, `{ort}`. */
export interface Territory {
  id: string;
  titel: string;
  hauptachse: Hauptachse;
  betonung: Betonung;
  /** Grundwert der Passung */
  basis: number;
  /** Abstand zum ueblichen Marktauftritt, 0 bis 1 */
  marktabstand: number;
  achsen: Record<AxisKey, number>;
  architektur?: Architecture[];
  segmente: Segment[];
  fokus: NameFocus[];
  alternativen: Alternative[];
  onlyness: string[];
  referenzen: ReferenceWorld[];
  /** -2 Eigentuemer bis 2 Kaeufer */
  seite: number;
  styles: StyleKey[];
  colorMoods: ColorMoodKey[];
  fontForms: FontForm[];
  themes: SymbolTheme[];
  meiden: {
    colorMoods?: ColorMoodKey[];
    themes?: SymbolTheme[];
    fontForms?: FontForm[];
    containers?: ContainerKey[];
  };
  kindMix: KindMix;
  signatureStyles: StyleKey[];
  signatureIds: string[];
  signatureZweit: string[];
  nameKinds: NameKind[];
  keywordFields: string[];
  formatVorliebe: PostFormat[];
  kernidee: string;
  onlynessKern: string;
  anders: string;
  weil: string;
  claims: string[];
  schluesselwoerter: string[];
  leitplanken: string[];
  verbote: string[];
  passtFuer: string;
  risiko: string;
  wunschkunde: string;
  versprechen: string;
  gegenbild: { markt: string; wir: string };
  persoenlichkeit: PersoenlichkeitsZug[];
  story: {
    problem: string;
    empathie: string;
    plan: string;
    schritte: string;
    aufruf: string;
    gefahr: string;
    erfolg: string;
    zusatz: string;
  };
  ton: { beispiele: string[]; sagen: string[]; vermeiden: string[] };
  social: {
    profiltext: string;
    saeulen: Array<{
      art: "immobilien" | "lokal" | "persoenlich";
      titel: string;
      hooks: string[];
    }>;
  };
}
