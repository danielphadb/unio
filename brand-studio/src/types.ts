/**
 * Gemeinsamer Vertrag des Brand Studios (Logo-Engine, Namen, Kit, Unterlagen, Postings, Oberflaeche).
 *
 * Abgeleitet aus der gesicherten Fassung vom 27.10.2026: vor allem aus den Pruefungen
 * beim Laden eines Projekts (index: `PL` Konzept, `IT` Typo, `NT` Symbol, `OT` Signature,
 * `DL` Eingabe, `UL` Kontakt; objectData `L`), aus `createProject` (`Ik`) und aus
 * `createKitAssets` (kitAssets `ju`). Grenzen (Laengen, Wertebereiche) stehen jeweils dabei.
 *
 * Der Vertrag des Markenkompasses (Brief, Achsen, Routen) liegt in `strategy/types.ts`.
 */
import type { FontStore } from "./engine/fontStore";
import type { BrandRoute, RouteParams } from "./strategy/types";

// ---------------------------------------------------------------------------
// Grundbegriffe

/** Stil (Schritt "Stil" und Kuratierung). */
export type StyleKey =
  | "elegant"
  | "modern"
  | "luxus"
  | "warm"
  | "mutig"
  | "natur";
export const STYLE_KEYS: readonly StyleKey[] = [
  "elegant",
  "modern",
  "luxus",
  "warm",
  "mutig",
  "natur",
];

/** Stilwahl im Projekt: ein Stil oder "mix" (alle). */
export type StyleChoice = StyleKey | "mix";

/** Farbstimmung (Paletten-Familie). */
export type ColorMoodKey =
  | "gold"
  | "navy"
  | "gruen"
  | "terra"
  | "schwarz"
  | "blau"
  | "bordeaux"
  | "sand";
export const COLOR_MOOD_KEYS: readonly ColorMoodKey[] = [
  "gold",
  "navy",
  "gruen",
  "terra",
  "schwarz",
  "blau",
  "bordeaux",
  "sand",
];

/** Bildthema der Symbole (`SymbolTheme`). */
export type SymbolTheme =
  | "haus"
  | "dach"
  | "schluessel"
  | "tuer"
  | "stadt"
  | "natur"
  | "initialen"
  | "abstrakt";
export const SYMBOL_THEMES: readonly SymbolTheme[] = [
  "haus",
  "dach",
  "schluessel",
  "tuer",
  "stadt",
  "natur",
  "initialen",
  "abstrakt",
];

/** Rahmen um ein Symbol (src/symbols/containers.snapshot.json). */
export type ContainerKey =
  | "none"
  | "circle"
  | "ring"
  | "square"
  | "rounded"
  | "arch"
  | "shield"
  | "hexagon"
  | "diamond"
  | "house";

/** Anordnung von Symbol und Schrift. */
export type LayoutKey = "inline" | "stacked" | "wordmark" | "badge";
/** Rahmen eines Badge-Layouts. */
export type BadgeKey = "frame" | "arch" | "seal";
/** Schreibung. */
export type CaseKey = "upper" | "title" | "asis" | "lower";
export type Divider = "none" | "line" | "dot";
/** Flaeche einer Karte (Galerie, Namenskarte). */
export type CardBackground = "paper" | "ink" | "primary";
/**
 * Namensform im Logo (Personenmarke): voller Name, Versalien, nur Nachname,
 * zweizeilig, Initiale, Monogramm, Bezirk.
 */
export type NameFormat =
  | "full"
  | "upper"
  | "surname"
  | "stacked"
  | "initial"
  | "monogram"
  | "district";
export const NAME_FORMATS: readonly NameFormat[] = [
  "full",
  "upper",
  "surname",
  "stacked",
  "initial",
  "monogram",
  "district",
];

/** Art des Markennamens in der Eingabe (Person oder Firma). */
export type InputNameKind = "person" | "company";

/** Namensarten des Namensfinders (auch `RouteParams.nameKinds`). */
export type NameKind =
  | "person"
  | "ort"
  | "kunstwort"
  | "kombination"
  | "bildhaft"
  | "fremdsprachig"
  | "abgewandelt"
  | "kurz"
  | "klassisch"
  | "initialen";

/** Schwerpunkt des Maklers (Namensfinder und Kompass). */
export type NameFocus =
  | "wohnen"
  | "haeuser"
  | "luxus"
  | "anleger"
  | "gewerbe"
  | "neubau"
  | "land";
export const NAME_FOCUS: readonly NameFocus[] = [
  "wohnen",
  "haeuser",
  "luxus",
  "anleger",
  "gewerbe",
  "neubau",
  "land",
];

// ---------------------------------------------------------------------------
// Schriften

/** Schriftklasse im Katalog. */
export type FontCat = "serif" | "sans" | "display" | "script";

/** Schriftform (feiner als die Klasse; Achsen und Routen arbeiten damit). */
export type FontForm =
  | "didone"
  | "antiqua"
  | "geometric"
  | "grotesk"
  | "condensed"
  | "mono"
  | "script"
  | "slab"
  | "stencil"
  | "extended";
export const FONT_FORMS: readonly FontForm[] = [
  "didone",
  "antiqua",
  "geometric",
  "grotesk",
  "condensed",
  "mono",
  "script",
  "slab",
  "stencil",
  "extended",
];

/** Merkmale einer Schrift (Katalog `tags`). */
export type FontTag =
  | "edel"
  | "kontrastreich"
  | "klassisch"
  | "fein"
  | "zeitlos"
  | "modern"
  | "sachlich"
  | "geometrisch"
  | "rund"
  | "freundlich"
  | "kräftig"
  | "schmal"
  | "breit"
  | "versalien"
  | "verspielt"
  | "handschriftlich"
  | "technisch";

/** Verweis auf einen Schriftschnitt. `style` fehlt bei normal. */
export interface FontRef {
  key: string;
  /** 100 bis 900, muss im Katalog stehen */
  weight: number;
  style?: "italic";
}

/** Eintrag im Schriftkatalog (src/engine/fonts.json). */
export interface FontMeta {
  key: string;
  family: string;
  /** Fontsource-Paket ohne `@fontsource/` (Dateinamen der woff-Dateien) */
  pkg: string;
  cat: FontCat;
  form: FontForm;
  weights: number[];
  /** Kursive Schnitte (Gewichte) */
  italics?: number[];
  styles: StyleKey[];
  tags: FontTag[];
  /** Als Fliesstext (Kit, Unterlagen) geeignet */
  body?: boolean;
  /** Nur in Versalien setzen */
  capsOnly?: boolean;
  /** Nie in Versalien (Schreibschriften) */
  noCaps?: boolean;
  /** Nur fuer Signature-Vorlagen, nicht frei waehlbar */
  nurVorlage?: boolean;
  /** Einzelne Schnitte nur fuer Vorlagen */
  nurVorlageSchnitte?: number[];
}

/** Zeichenabdeckung je Schrift (src/engine/coverage.json). */
export interface FontCoverage {
  /** Es gibt eine latin-ext-Datei */
  ext: boolean;
  /** Zeichen aus dem Pruefumfang, die trotzdem fehlen */
  missing: string;
  /** Hat ein grosses scharfes S (ẞ) */
  capSharpS: boolean;
}

// ---------------------------------------------------------------------------
// Farben

export interface Palette {
  /** Grundpaletten: `navysand`; abgeleitet: `navysand-1F3A5F7EF8` (bis 96 Zeichen) */
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  ink: string;
  paper: string;
}

/** Rolle einer Farbe im Konzept. */
export type PaletteRole = "primary" | "secondary" | "accent" | "ink";

export interface ConceptColors {
  symbol: PaletteRole;
  name: "primary" | "ink";
  suffix: PaletteRole;
}

/** Farben, mit denen ein Symbol gezeichnet wird (Icons, Rahmen). */
export interface SymbolColors {
  main: string;
  accent: string;
  /** Farbe fuer ausgesparte Flaechen (gefuellte Rahmen) */
  knockout: string;
}

// ---------------------------------------------------------------------------
// Symbol und Typografie eines Konzepts

/** Konstruktion eines Monogramms aus zwei Buchstaben (Logo-Engine, drawnMonogram). */
export type MonogramKonstruktion =
  | "stamm"
  | "ligatur"
  | "verschraenkt"
  | "negativ";

export interface IconSymbol {
  kind: "icon";
  /** ID aus src/symbols/icons.json, z. B. `abstrakt-raum` */
  id: string;
  container: ContainerKey;
}

export interface MonogramSymbol {
  kind: "monogram";
  /** 1 bis 3 Buchstaben, Ziffern oder & */
  letters: string;
  container: ContainerKey;
  font: FontRef;
  konstruktion?: MonogramKonstruktion;
}

export type SymbolSpec = IconSymbol | MonogramSymbol;

/** Schrift, Schreibung und Laufweite eines Textteils (Name, Zusatz, Tagline). */
export interface TextStyle {
  font: FontRef;
  case: CaseKey;
  /** Laufweite in em, -0,5 bis 1 */
  tracking: number;
}

/** Hochgestelltes Zeichen am Namen: Stern (Fussnote), Grad, Wiener Bezirk. */
export interface TypoSup {
  art: "stern" | "grad" | "bezirk";
  /** `*`, `°` oder Bezirksnummer, 1 bis 4 Zeichen */
  text: string;
}

/** Zweiter Schnitt fuer einen Teil des Namens (erstes Wort oder Rest). */
export interface TypoSplit {
  part: "first" | "rest";
  font?: FontRef;
  case?: CaseKey;
  /** -0,5 bis 1 */
  tracking?: number;
  color?: "primary" | "accent" | "ink";
  /** Teile untereinander */
  stack?: boolean;
  /** Groesse des Teils, 0,3 bis 3 */
  scale?: number;
  /** Ueberlappung in Promille der Hoehe, 1 bis 80 */
  joint?: number;
}

/** Buchstaben-Eingriff (Logo-Engine `eingriffe.ts`, Feature-Flag). */
export type Eingriff =
  | "querbalken"
  | "fuge"
  | "markierung"
  | "fundament"
  | "umlaut";

/** Typografische Details eines Konzepts (Rezepte, Zusatz-Paarungen, Eingriffe). */
export interface TypoDetails {
  split?: TypoSplit;
  /** Eigene Schrift fuer `&` */
  ampersand?: FontRef;
  /** Linie ueber oder unter dem Namen */
  rule?: "over" | "under";
  /** Buchstaben getauscht (z. B. ligaturartig) */
  letterSwap?: boolean;
  /** Zusatz in derselben Zeile wie der Name */
  inlineSuffix?: boolean;
  /** BinnenMajuskel */
  camel?: boolean;
  /** Kleines Zeichen am Namen */
  mark?: "dot" | "hairline" | "macron";
  markColor?: "primary" | "accent";
  sup?: TypoSup;
  /** Stern am Namen wiederholt vor dem Zusatz (wie eine Fussnote) */
  fussnote?: boolean;
  /** Zusatz in Klammern */
  suffixWrap?: "klammer";
  /** Trenner bei Zusatz in der Zeile: Schraegstrich oder Klammer (sonst senkrechte Linie) */
  inlineSep?: "slash" | "klammer";
  /** Groesse des Zusatzes relativ zur Versalhoehe, 0,3 bis 0,75 (2 Nachkommastellen) */
  suffixScale?: number;
  eingriff?: Eingriff;
}

/** Signature-Vorlage im Konzept (src/signature/**). */
export interface SignatureRef {
  /** Vorlagen-ID, bei Varianten mit `--`, z. B. `sig-gesims--f3` */
  id: string;
  params?: SignatureParams;
}

export interface SignatureParams {
  haupt?: FontRef;
  neben?: FontRef;
  akzent?: FontRef;
  /** Groesse des Zusatzes, 0,75 bis 1,6 (2 Nachkommastellen) */
  zusatzMassstab?: number;
  zusatzSchreibung?: CaseKey;
}

/** Hinweis auf eine aehnliche bekannte Marke (Korpus-Pruefung). */
export interface LegalNaehe {
  marke: string;
  /** hoechstens 8 Merkmale */
  merkmale: string[];
}

/** Ein Logo-Konzept (Galerie, Editor, Favoriten, Kit). */
export interface LogoConcept {
  /** `c` + Hash des Konzepts ohne Seed, bei Vorlagen `sig-...`; bis 160 Zeichen */
  id: string;
  seed: number;
  style: StyleKey;
  layout: LayoutKey;
  symbol: SymbolSpec | null;
  name: TextStyle;
  suffix: TextStyle;
  tagline: TextStyle;
  /** Fliesstext-Schrift fuer Kit und Unterlagen */
  body: FontRef;
  palette: Palette;
  colors: ConceptColors;
  divider: Divider;
  symbolFilled?: boolean;
  badge?: BadgeKey;
  typo?: TypoDetails;
  nameFormat?: NameFormat;
  cardBackground?: CardBackground;
  symbolPosition?: "right" | "below";
  symbolSize?: "small" | "large";
  /** Rezept-ID, z. B. `R07` */
  recipeId?: string;
  signature?: SignatureRef;
  legalNaehe?: LegalNaehe;
}

// ---------------------------------------------------------------------------
// Eingabe

/** Eingabe fuer Logo-Engine und Kit (Projekt `input`). */
export interface BrandInput {
  /** Markenname, bis 80 Zeichen */
  name: string;
  /** Zusatz wie "Immobilien", bis 40 Zeichen, leer = keiner */
  suffix: string;
  /** bis 120 Zeichen */
  tagline: string;
  styles: StyleKey[];
  colorMoods: ColorMoodKey[];
  themes: SymbolTheme[];
  /** Ort oder Bezirk, bis 60 Zeichen */
  place?: string;
  nameKind?: InputNameKind;
  /** Zweiter Ort (Signature-Vorlagen), bis 60 Zeichen */
  ort2?: string;
  /** Gruendungsjahr, vier Ziffern, 1800 bis heute */
  jahr?: string;
  /** Vorlieben und Sperren aus einer Kompass-Route */
  route?: RouteParams;
}

// ---------------------------------------------------------------------------
// Kontakt, Objekt, Kit

/** Kontakt fuer Kit und Unterlagen (Laengen in Klammern). */
export interface Contact {
  person: string; // 120
  role: string; // 80
  phone: string; // 40
  email: string; // 120
  web: string; // 200, kein javascript:/data:/vbscript:
  street: string; // 120
  city: string; // 120
  unioPartner: boolean;
  /** Firmenwortlaut fuers Impressum */
  legal: string; // 200
  instagram?: string; // 120
  linkedin?: string; // 200
  /** Portraet als data:image/(png|jpeg|webp);base64 */
  photo?: string;
}

/** Energieausweis (Werte als Text wie eingegeben, Komma als Dezimaltrennzeichen). */
export interface EnergyData {
  /** Heizwaermebedarf kWh/m²a */
  hwb: string;
  /** Gesamtenergieeffizienz-Faktor (aeltere Ausweise) */
  fgee: string;
  /** Effizienzklasse A++ bis G */
  klasse: string;
  /** Endenergiebedarf kWh/m²a */
  eeb?: string;
  /** Klasse zum EEB mit optionalem Zusatz, z. B. "B fossil" */
  eebKlasse?: string;
  /** JJJJ-MM-TT */
  ausweisDatum?: string;
}

export type EnergyClass =
  | "A++"
  | "A+"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G";

export interface Fact {
  label: string; // 30
  value: string; // 30
}

/** Objekt im Projekt (Kit: Expose, Inserat), Fotos als IDs im Foto-Speicher. */
export interface ObjectData {
  title: string; // 80
  address: string; // 120
  description: string; // 600
  /** hoechstens 8 */
  facts: Fact[];
  energy: EnergyData;
  price: string; // 40
  url: string; // 200
  /** hoechstens 4, je /^[a-z0-9]{6,40}$/ */
  photoIds: string[];
}

/** Objekt, wie es an Kit, Unterlagen und Worker geht (Fotos aufgeloest als data-URLs). */
export interface KitObject {
  title: string;
  address: string;
  description: string;
  facts: Fact[];
  energy: EnergyData;
  price?: string;
  url?: string;
  photos: string[];
}

/** Alles, was Kit, Unterlagen und Postings aus einem Konzept brauchen (kitAssets `ju`). */
export interface BrandAssets {
  concept: LogoConcept;
  input: BrandInput;
  contact: Contact;
  fonts: FontStore;
  object?: KitObject;
  /** Route aus dem Markenkompass (Markenplattform, Social-Kit) */
  route?: BrandRoute;
}

/** Gespeicherter Name (Namensfinder, Projekt `nameCandidates`). */
export interface NameCandidate {
  name: string; // 60
  descriptor: string; // 40
  /** /^[a-z-]{1,30}$/ */
  kind: string;
}

/** Kontext aus dem Namensfinder fuer ein Projekt (Projekt `nameContext`). */
export interface NameContext {
  person?: string;
  company?: string;
  /** hoechstens 7, je bis 40 Zeichen */
  keywords: string[];
  focus: NameFocus[];
}
