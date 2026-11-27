/**
 * Signature-Vorlagen: Datenformat der Vorlagen (src/signature/templates/*.json) und
 * Ergebnisse des Interpreters (render.ts).
 *
 * Eine Vorlage beschreibt ein Logo als Liste von Elementen (Texte, Linien, Pfade ...),
 * deren Lage über kleine Ausdrücke an den Kanten anderer Elemente hängt, z. B.
 * `"min(name.t,name.o)-100"` = 100 Einheiten über der Oberkante des Namens.
 * Einheit: die Versalhöhe des Namens ist 100 (`versal: 100`).
 */
import type {
  CaseKey,
  CardBackground,
  FontRef,
  SignatureParams,
  StyleKey,
} from "../types";
import type { FieldName } from "./nameParts";
import type { PartnerArt } from "./partner";

export type { SignatureParams } from "../types";
export type { FieldName, NameParts } from "./nameParts";
export type { PartnerArt } from "./partner";

// ---------------------------------------------------------------------------
// Ausdrücke und Kanten

/**
 * Zahl oder Ausdruck: `+ - * /`, Klammern, `min(...)`, `max(...)`, Kanten wie `name.r`
 * und `rechts(name, y1, y2)` / `links(name, y1, y2)` (äußerster Umrisspunkt des Namens
 * zwischen zwei Höhen). Mit `|` getrennte Alternativen gelten der Reihe nach, wenn ein
 * Element fehlt.
 */
export type Ausdruck = number | string;

/**
 * Kanten eines gesetzten Elements: `l`, `r`, `cx`, `w` (waagrecht), `t`, `b`, `cy`, `h`
 * (Versalhöhe bis Grundlinie), `o`, `u` (sichtbare Ober- und Unterkante), `cap`
 * (Schriftgröße), `a` (Ende des Vorschubs), `sl`, `sr` (Stammbreite links und rechts).
 */
export type Kante =
  | "l"
  | "r"
  | "cx"
  | "w"
  | "t"
  | "b"
  | "cy"
  | "h"
  | "o"
  | "u"
  | "cap"
  | "a"
  | "sl"
  | "sr";

/** Gespeicherte Lage eines Elements (für Ausdrücke anderer Elemente). */
export interface Kanten {
  l: number;
  r: number;
  t: number;
  b: number;
  o: number;
  u: number;
  cap: number;
  a?: number;
  sl?: number;
  sr?: number;
  /** Umrisspunkte (für `rechts(...)` und `links(...)`) */
  pts?: Array<[number, number]>;
}

// ---------------------------------------------------------------------------
// Elemente

/** Farbrolle eines Elements: `grund` = Hintergrund (Aussparung). */
export type Rolle = "name" | "neben" | "zeichen" | "akzent" | "grund";
/** Schrift eines Textes: Hauptschrift, Nebenschrift (Zusatz) oder Akzent. */
export type SchriftRolle = "haupt" | "neben" | "akzent";

interface ElementBasis {
  /** Name für Ausdrücke anderer Elemente (Texte: sonst das Feld) */
  id?: string;
  rolle: Rolle;
  /** gehört zum Bildzeichen (Ausschnitt "symbol", Monogramm-Lockup) */
  zeichen?: boolean;
  /** Zeichenreihenfolge, kleinere zuerst (Standard 0) */
  ebene?: number;
  /** nur, wenn das Feld gefüllt ist */
  wenn?: FieldName;
  /** nur, wenn das Feld leer ist */
  wennNicht?: FieldName;
  /** nur, wenn das Element mit dieser ID fehlt */
  wennFehlt?: string;
}

export interface Einpassen {
  /** größte Breite; der Text wird verkleinert */
  maxBreite: Ausdruck;
  /** kleinste Versalhöhe; darunter passt die Vorlage nicht (bei `pflicht`) */
  minVersal: number;
  /** zweizeilig umbrechen, wenn sonst kleiner als 86 % */
  umbruch?: boolean;
  /** Zeilenabstand in Versalhöhen (Standard 1,4) */
  zeilenabstand?: number;
}

export interface Blocksatz {
  /** Zielbreite: die Größe wird so gewählt, dass der Text genau so breit ist */
  breite: Ausdruck;
  minVersal: number;
  maxVersal: number;
}

export interface TextBogen {
  cx: Ausdruck;
  cy: Ausdruck;
  r: number;
  /** größter Winkel des Textes in Grad */
  spanne: number;
  minVersal?: number;
  lage: "oben" | "unten";
}

export interface Spiegel {
  abstand: number;
  /** senkrechte Stauchung des Spiegelbilds */
  stauchung: number;
  /** Zahl der ausgesparten Wasserlinien */
  linien: number;
  rolle?: Rolle;
}

export interface Fuge {
  /** Höhe in Versalhöhen über der Grundlinie */
  bei: number;
  staerke: number;
}

export interface Markierung {
  /** Buchstabe: Index, erster Vokal oder letzter */
  an: number | "vokal1" | "letzter";
  rolle: Rolle;
  abstand: number;
  /** unter statt über dem Buchstaben */
  unten?: boolean;
  /** Balken dieser Stärke statt Motiv */
  balken?: number;
  /** SVG-Pfad des Motivs (um 0 0) */
  motiv?: string;
}

export interface UmlautMarke {
  /** Kantenlänge der Quadrate in Versalhöhen */
  kante: number;
  rolle: Rolle;
}

export interface Fundament {
  /** Buchstaben mit geradem Stamm */
  buchstaben: string;
  tiefe: number;
  rolle: Rolle;
}

export interface TextElement extends ElementBasis {
  typ: "text";
  feld: FieldName;
  /** fester Text mit Platzhaltern `{feld}` statt des Feldes */
  fest?: string;
  /** Titel (Dr., Mag. ...) weglassen */
  ohneTitel?: boolean;
  schrift: SchriftRolle;
  schreibung: CaseKey;
  /** Laufweite in em */
  laufweite: number;
  /** Versalhöhe */
  versal: Ausdruck;
  x: Ausdruck;
  /** Grundlinie (bei `anker: "oben"` die Versalhöhe) */
  y: Ausdruck;
  /** Standard: mitte */
  ausrichtung?: "links" | "mitte" | "rechts";
  /** bei linksbündig am ersten Strich statt am Vorschub ausrichten */
  stift?: boolean;
  anker?: "oben";
  /** ohne diesen Text passt die Vorlage nicht */
  pflicht?: boolean;
  /** nur messen (Kanten für andere Elemente), nicht zeichnen */
  nurMessen?: boolean;
  einpassen?: Einpassen;
  blocksatz?: Blocksatz;
  /** Laufweite erhöhen, bis der Text so breit ist (höchstens 0,5 em) */
  austreiben?: Ausdruck;
  /** Drehung in Grad um den Ankerpunkt */
  drehung?: number;
  bogen?: TextBogen;
  /** Spiegelbild unter der letzten Zeile (Wasser) */
  spiegel?: Spiegel;
  /** Text gespiegelt setzen */
  spiegeln?: boolean;
  /** Hof in Grundfarbe um die Buchstaben */
  hof?: number;
  /** nur Kontur dieser Stärke */
  kontur?: number;
  /** waagrechte Aussparungen durch den Text */
  fugen?: Fuge[];
  markierung?: Markierung;
  /** Buchstaben, deren Querbalken ausgespart wird */
  ohneQuerbalken?: string;
  /** Umlaut-Punkte als Quadrate (der Text braucht einen Umlaut) */
  umlaut?: UmlautMarke;
  /** Sockel unter einem Buchstaben mit geradem Stamm */
  fundament?: Fundament;
}

export interface LinieElement extends ElementBasis {
  typ: "linie";
  x1: Ausdruck;
  y1: Ausdruck;
  x2: Ausdruck;
  y2: Ausdruck;
  staerke: number;
}

export interface ZugElement extends ElementBasis {
  typ: "zug";
  punkte: Array<[Ausdruck, Ausdruck]>;
  staerke: number;
}

export interface RechteckElement extends ElementBasis {
  typ: "rechteck";
  x: Ausdruck;
  y: Ausdruck;
  /** Breite */
  b: Ausdruck;
  h: Ausdruck;
  /** nur Kontur dieser Stärke */
  kontur?: number;
}

export interface KreisElement extends ElementBasis {
  typ: "kreis";
  cx: Ausdruck;
  cy: Ausdruck;
  r: Ausdruck;
  kontur?: number;
}

export interface BogenElement extends ElementBasis {
  typ: "bogen";
  cx: Ausdruck;
  cy: Ausdruck;
  r: Ausdruck;
  /** Winkel in Grad (0 = rechts, im Uhrzeigersinn) */
  von: number;
  bis: number;
  staerke: number;
}

export interface PfadElement extends ElementBasis {
  typ: "pfad";
  /** SVG-Pfad um den Ankerpunkt */
  d: string;
  x: Ausdruck;
  y: Ausdruck;
  massstab?: Ausdruck;
  kontur?: number;
}

export interface ReiheElement extends ElementBasis {
  typ: "reihe";
  /** Bereich, in dem das Motiv mittig wiederholt wird */
  x1: Ausdruck;
  x2: Ausdruck;
  y: Ausdruck;
  motiv: string;
  /** Abstand der Wiederholungen */
  teilung: number;
  /** Motiv um 90 Grad gedreht, Reihe senkrecht (x1/x2 sind dann y-Werte) */
  senkrecht?: boolean;
  kontur?: number;
}

export type FormElement =
  | LinieElement
  | ZugElement
  | RechteckElement
  | KreisElement
  | BogenElement
  | PfadElement
  | ReiheElement;
export type Element = TextElement | FormElement;

// ---------------------------------------------------------------------------
// Vorlage

export type Freigabe = "freigegeben" | "entwurf";
export type Markenart = "person" | "firma";
/** Ort oder Zusatz: muss da sein, darf da sein, soll fehlen */
export type Profil = "pflicht" | "optional" | "nein";

/** Wann eine Vorlage zu einer Marke passt (geprüft in `checkFit`). */
export interface Passt {
  arten: Markenart[];
  profile: { ort: Profil; zusatz: Profil };
  /** Buchstaben im Namen (ohne Titel und Leerzeichen) */
  minZeichen: number;
  maxZeichen: number;
  /** Wörter im Namen (ohne Titel) */
  wortzahl: [number, number];
  /** nötige Initialen (0, 1, 2) */
  initialen: number;
  /** Stile, der erste ist der Hauptstil */
  stile: StyleKey[];
  /** nur ab so vielen Buchstaben, außer bei zwei Wörtern */
  nurLang?: number;
  /** genau diese Buchstabenzahlen */
  laengen?: number[];
  /** gesperrte Buchstabenzahlen (Abstand zu Referenzmarken) */
  laengenAus?: number[];
  /** gesperrte Anfangsbuchstaben */
  buchstabenAus?: string;
  /** `false`: Initialen mit Akzent (Ä, É ...) passen nicht */
  initialenAkzent?: boolean;
  /** Name höchstens so viel mal breiter als das Zeichen (große Initiale) */
  nameZuInitial?: number;
  /** gesperrte Werte je Feld */
  werteAus?: Partial<Record<FieldName, string[]>>;
  /** erlaubte Kennbuchstaben (siehe `kennbuchstabe`) */
  kennbuchstaben?: string;
  /** mindestens einer dieser Buchstaben im Namen */
  enthaelt?: string;
  /** zwei Partner (A & B) nötig */
  partner?: boolean;
  /** Partner-Endungen, die passen */
  partnerArten?: PartnerArt[];
  /** Umlaut im Namen nötig */
  umlaut?: boolean;
  /** Wortbrücke: letzter Buchstabe von teil1 und erster von teil2 */
  fuge?: { enden: string; anfaenge: string };
}

export interface Schriften {
  haupt: FontRef[];
  neben: FontRef[];
  akzent?: FontRef[];
  /** Neben- und Akzentschrift an derselben Stelle wie die gewählte Hauptschrift */
  paare?: boolean;
}

export interface Farben {
  name: "ink" | "primary";
  neben: "ink" | "primary" | "secondary" | "accent";
  zeichen: "primary" | "secondary" | "accent" | "ink";
  akzent: "primary" | "accent";
  /** Grundpaletten-IDs, die erste ist die Standard-Palette */
  paletten: string[];
  karte?: CardBackground;
  /** keine Palette mit Gelb und Rot zugleich */
  ohneGelbRot?: boolean;
}

/** Merkmale für Ähnlichkeitsprüfung, Routen und die Prüfseite. */
export interface Merkmale {
  zeichen: string | null;
  position: string | null;
  schrift: "serif" | "sans";
  schreibung: "upper" | "mixed" | "lower";
  layout: "stacked" | "wordmark" | "inline" | "badge";
  kunstgriff?: string;
}

/** Herkunft einer Variante (siehe varianten.ts). */
export interface Variante {
  basis: string;
  code: string;
  klasse: "fein" | "strukturell";
  titel: string;
  achsen: string[];
}

export interface SignatureTemplate {
  /** `sig-...`; Varianten `<vorlage>--<code>` */
  id: string;
  titel: string;
  idee: string;
  herleitung: string;
  /** Referenzmarken, an denen sich die Vorlage orientiert */
  referenzen: string[];
  abgrenzung: string;
  legal: "gruen" | "gelb";
  /** Referenzmarken, denen die Vorlage nahe kommt */
  nahe?: string[];
  passt: Passt;
  schriften: Schriften;
  farben: Farben;
  merkmale: Merkmale;
  elemente: Element[];
  freigabe: Freigabe;
  quelle: "team";
  /** `false`: nicht in der gemischten Galerie */
  mischung?: boolean;
  /** Schreibungen, die der Zusatz annehmen darf (sonst aus den Elementen) */
  zusatzSchreibungen?: CaseKey[];
  variante?: Variante;
}

// ---------------------------------------------------------------------------
// Ergebnisse

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Ein gezeichneter Teil (Pfad) des Layouts. */
export interface SignatureOp {
  d: string;
  transform?: string;
  fill: Rolle | "none";
  stroke?: Rolle;
  sw?: number;
  box: Rect | null;
  zeichen: boolean;
  ebene: number;
}

/** Gewählte Schriften einer Vorlage. */
export interface SignatureFontSet {
  haupt: FontRef;
  neben: FontRef;
  akzent: FontRef;
}

export interface SignatureLayout {
  ops: SignatureOp[];
  /** Gründe, warum der Name nicht in die Vorlage passt */
  problems: string[];
  /** Versalhöhe des Namens (Maßstab beim Rendern) */
  unit: number;
  refs: SignatureFontSet;
  /** Rahmen der gesetzten Texte */
  boxes: Array<{ id: string; neben: boolean; box: Rect }>;
}

/** Farben je Rolle. */
export type SignatureColors = Record<Rolle, string>;

export interface FitResult {
  passt: boolean;
  grund: string;
}

export interface FitOptions {
  /** Stil prüfen (Standard: wenn die Eingabe Stile hat) */
  stil?: boolean;
  params?: SignatureParams;
}

export type LogoVariant = "color" | "reverse" | "mono-dark" | "mono-light";

export interface RenderOptions {
  part?: "full" | "symbol" | "wordmark";
  lockup?: string;
  /** Linienstärke verstärken (kleine Größen) */
  boost?: number;
  /** eigene Grundfarbe */
  ground?: string;
  params?: SignatureParams;
}
