/**
 * Routenparameter aus Territorium und Brief (kompass-Chunk: `K`, `re`, `cn`, `dn`, `hn`, `Wn`,
 * `U`, `ne`, `ye`, `zn`, `vn` und die Tabellen `Be`, `kn`, `bn`, `wn`, `pn`, `C`, `Sn`, `yn`,
 * `Mn`, `En`).
 *
 * `resolveRouteParams` mischt ein Territorium mit den Achsen aus dem Brief und den harten
 * Sperren ("Nicht ich") zu den Parametern, die Logo- und Namensgenerator steuern.
 * `territoryFit` bewertet, wie gut ein Territorium zum Brief passt.
 *
 * Daten: axes.json (W1 aus dem Bundle gezogen). Bitgenau wie die gesicherte Fassung:
 * Reihenfolge der Zufallszahlen und Rundungen nicht aendern.
 */
import axisData from "./axes.json";
import { WUNSCHKUNDEN, WERTE, PERSOENLICHKEIT } from "./catalog";
import { hash, rng } from "../engine/rng";
import { hexToHsl, isDark } from "../engine/color";
import { basePalettes, paletteBaseId } from "../engine/palettes";
import { keywordFieldsFor } from "../engine/names/kwFields";
import type { ColorMoodKey, ContainerKey, FontForm, Palette, SymbolTheme } from "../types";
import { AXIS_KEYS } from "./types";
import type {
  AxisKey,
  AxisVector,
  BrandBrief,
  KindMix,
  RouteParams,
  RouteRolle,
  Territory,
} from "./types";

/** Achsen je Schriftform (`C`). */
export const FONT_FORM_AXES = axisData.schriftformen as Record<FontForm, Partial<Record<AxisKey, number>>>;

/** "Nicht ich" ausser Gold auf Schwarz (`hn`). */
const NICHT_ICH = axisData.nichtIch as Record<
  string,
  { avoidThemes?: SymbolTheme[]; avoidFontForms?: FontForm[]; avoidContainers?: ContainerKey[] }
>;

/** Stichwort-Felder je Onlyness-Karte (`yn`). */
const ONLYNESS_FELDER = axisData.onlynessFokus as Record<string, string[]>;

/** Schriftklasse je Schriftform, fuer die Verschiedenheit der Routen (`Be`). */
const SCHRIFTKLASSE: Record<FontForm, string> = {
  antiqua: "antiqua",
  didone: "didone",
  grotesk: "grotesk",
  geometric: "grotesk",
  condensed: "breitschmal",
  extended: "breitschmal",
  slab: "slab",
  mono: "slab",
  stencil: "slab",
  script: "script",
};

/** Farbfamilie je Stimmung (`kn`). */
const FARBFAMILIE: Record<ColorMoodKey, string> = {
  gold: "warm",
  terra: "warm",
  sand: "warm",
  bordeaux: "warm",
  navy: "kuehl",
  blau: "kuehl",
  gruen: "gruen",
  schwarz: "neutral",
};

/** Schriftkategorie je Schriftklasse, wie in den Signature-Vorlagen (`bn`). */
const KATEGORIE: Record<string, string> = {
  antiqua: "serif",
  didone: "serif",
  slab: "serif",
  grotesk: "sans",
  breitschmal: "sans",
  script: "script",
};

/** Waerme je Stimmung (`wn`). */
const WAERME: Record<ColorMoodKey, number> = {
  gold: 0.5,
  terra: 0.9,
  sand: 0.6,
  bordeaux: 0.4,
  gruen: 0.1,
  schwarz: 0,
  navy: -0.6,
  blau: -0.7,
};

/** Saettigung je Stimmung (`pn`). */
const SAETTIGUNG: Record<ColorMoodKey, number> = {
  gold: 0.2,
  terra: 0.6,
  sand: -0.7,
  bordeaux: 0.5,
  gruen: 0,
  schwarz: -0.8,
  navy: 0.1,
  blau: 0.5,
};

/** Stichwort-Feld je Objektart (`Sn`). */
const FOKUS_FELD: Record<string, string> = {
  wohnen: "wohnen",
  haeuser: "familie",
  luxus: "luxus",
  anleger: "kapital",
  gewerbe: "gewerbe",
  neubau: "neubau",
  land: "grund",
};

/** Territorien, die zur Erfahrung passen (`Mn`). */
const ERFAHRUNG_TERRITORIEN: Record<string, string[]> = {
  neu: ["herausforderer", "system", "graetzl"],
  einige: ["verlag", "haus_zahl", "handwerk"],
  lange: ["herkunft", "rat", "instanz"],
};

/** Anteile Wortmarke und Vorlage je Rolle einer Route (`En`). */
const ROLLEN_MIX: Record<RouteRolle, { wortmarke: number; vorlage: number }> = {
  wortmarke: { wortmarke: 0.64, vorlage: 0.18 },
  vorlage: { wortmarke: 0.28, vorlage: 0.58 },
  mitte: { wortmarke: 0.45, vorlage: 0.4 },
};

const clamp = (v: number, min = -1, max = 1): number => Math.max(min, Math.min(max, v));
const round3 = (v: number): number => Math.round(v * 1e3) / 1e3;
const unique = <T>(items: readonly T[]): T[] => [...new Set(items)];

/** Schriftklasse der ersten Schriftform (`U`). */
export function fontClassOf(params: Pick<RouteParams, "fontForms">): string | undefined {
  const form = params.fontForms[0];
  return form ? SCHRIFTKLASSE[form] : undefined;
}

/** Farbfamilie der ersten Stimmung (`ne`). */
export function colorFamilyOf(params: Pick<RouteParams, "colorMoods">): string | undefined {
  const mood = params.colorMoods[0];
  return mood ? FARBFAMILIE[mood] : undefined;
}

/** Hauptart der Logos: der groesste Anteil im Mix (`ye`). */
export function mainKindOf(params: Pick<RouteParams, "kindMix">): string {
  return Object.entries(params.kindMix).reduce((best, e) => (e[1] > best[1] ? e : best))[0];
}

/** Schriftkategorie (serif, sans, script) der ersten Schriftform (`zn`). */
export function fontCategoryOf(params: Pick<RouteParams, "fontForms">): string | undefined {
  const form = params.fontForms[0];
  if (!form) return undefined;
  return form === "mono" || form === "stencil" ? "sans" : KATEGORIE[SCHRIFTKLASSE[form]];
}

/** Zwei Routen sind klar verschieden, wenn sie sich in 2 von 3 Merkmalen unterscheiden (`vn`). */
export function clearlyDifferent(a: RouteParams, b: RouteParams): boolean {
  return (
    Number(fontClassOf(a) !== fontClassOf(b)) +
      Number(mainKindOf(a) !== mainKindOf(b)) +
      Number(colorFamilyOf(a) !== colorFamilyOf(b)) >=
    2
  );
}

// --- Harte Sperren aus "Nicht ich" ---------------------------------------------------------

/** Warmer Goldton (`un`). */
function isGoldTone(hex: string): boolean {
  const { h, s, l } = hexToHsl(hex);
  return h >= 22 && h <= 50 && s >= 0.24 && s <= 0.7 && l >= 0.3 && l <= 0.7;
}

/** Dunkler, kuehler oder grauer Ton (`ln`). */
function isBlackTone(hex: string): boolean {
  const { h, s } = hexToHsl(hex);
  return isDark(hex) && (s < 0.25 || (h >= 190 && h <= 260));
}

/**
 * Paletten mit Gold; bei dunklem Grund alle, sonst nur Gold zusammen mit Schwarz (`dn`).
 */
export function goldPaletteIds(darkGround: boolean, palettes: Palette[] = basePalettes()): string[] {
  return palettes
    .filter((p) =>
      [p.primary, p.secondary, p.accent].some(isGoldTone)
        ? darkGround || [p.primary, p.secondary].some(isBlackTone)
        : false,
    )
    .map((p) => paletteBaseId(p));
}

export interface BriefAvoid {
  avoidColorMoods: ColorMoodKey[];
  avoidThemes: SymbolTheme[];
  avoidFontForms: FontForm[];
  avoidContainers: ContainerKey[];
  avoidPaletteIds: string[];
}

/** Harte Sperren aus "nie diese Farben" und "Nicht ich" (`cn`). */
export function avoidFromBrief(brief: BrandBrief, darkGround: boolean): BriefAvoid {
  const out: BriefAvoid = {
    avoidColorMoods: [...(brief.avoidColors ?? [])],
    avoidThemes: [],
    avoidFontForms: [],
    avoidContainers: [],
    avoidPaletteIds: [],
  };
  for (const klischee of brief.avoidCliches ?? []) {
    if (klischee === "gold-schwarz") {
      out.avoidColorMoods.push("gold");
      if (darkGround) out.avoidColorMoods.push("schwarz");
      out.avoidPaletteIds.push(...goldPaletteIds(darkGround));
      continue;
    }
    const sperre = NICHT_ICH[klischee];
    if (!sperre) continue;
    out.avoidThemes.push(...(sperre.avoidThemes ?? []));
    out.avoidFontForms.push(...(sperre.avoidFontForms ?? []));
    out.avoidContainers.push(...(sperre.avoidContainers ?? []));
  }
  return {
    avoidColorMoods: unique(out.avoidColorMoods),
    avoidThemes: unique(out.avoidThemes),
    avoidFontForms: unique(out.avoidFontForms),
    avoidContainers: unique(out.avoidContainers),
    avoidPaletteIds: unique(out.avoidPaletteIds),
  };
}

// --- Passung -----------------------------------------------------------------------------------

export interface FitContext {
  brief: BrandBrief;
  axes: AxisVector;
  /** Seed aus dem Brief (briefSeed) */
  seed: number;
}

/**
 * Passung eines Territoriums zum Brief (`re`): Grundwert, Achsenabstand nach Sicherheit,
 * Onlyness, Mitbewerber, Segment, Fokus, Architektur, Seite, Wunschkunden, Werte,
 * Persoenlichkeit, Erfahrung und ein kleiner Zufallsanteil gegen Gleichstand.
 */
export function territoryFit(t: Territory, ctx: FitContext): number {
  const { brief, axes } = ctx;
  let summeSicher = 0;
  let treffer = 0;
  for (const k of AXIS_KEYS) {
    const a = axes[k];
    if (!a || a.sicher <= 0) continue;
    summeSicher += a.sicher;
    treffer += a.sicher * (1 - Math.abs(a.v - (t.achsen[k] ?? 0)) / 2);
  }
  let fit = t.basis;
  if (summeSicher > 0) fit += (treffer / summeSicher - 0.5) * 2 * Math.min(1, summeSicher / 5) * 0.5;
  for (const o of brief.onlyness ?? []) if (t.onlyness.includes(o)) fit += 0.15;
  if (brief.alternative) fit += t.alternativen.includes(brief.alternative) ? 0.08 : 0;
  if (brief.segment) fit += t.segmente.includes(brief.segment) ? 0.08 : -0.04;
  const fokus = brief.focus ?? [];
  const fokusTreffer = fokus.filter((f) => t.fokus.includes(f)).length;
  fit += fokus.length && !fokusTreffer ? -0.15 : Math.min(0.24, fokusTreffer * 0.12);
  if (brief.architecture && t.architektur && !t.architektur.includes(brief.architecture)) fit -= 0.2;
  if (typeof brief.side === "number") fit -= 0.03 * Math.abs(brief.side - t.seite);
  for (const id of brief.wunschkunde ?? [])
    if (WUNSCHKUNDEN.find((w) => w.id === id)?.territorien.includes(t.id)) fit += 0.08;
  for (const id of brief.werte ?? [])
    if (WERTE.find((w) => w.id === id)?.territorien.includes(t.id)) fit += 0.06;
  for (const id of brief.wirkung ?? [])
    if (PERSOENLICHKEIT.find((p) => p.id === id)?.territorien.includes(t.id)) fit += 0.07;
  for (const id of brief.fremdbild ?? [])
    if (PERSOENLICHKEIT.find((p) => p.id === id)?.territorien.includes(t.id)) fit += 0.05;
  if (brief.erfahrung && ERFAHRUNG_TERRITORIEN[brief.erfahrung]?.includes(t.id)) fit += 0.06;
  fit += rng(hash(`${ctx.seed}:${t.id}`)).next() * 0.01;
  return fit;
}

// --- Aufloesung einer Route -------------------------------------------------------------------

export interface ResolveOptions {
  /** Wie stark die Antworten das Territorium ueberstimmen (sicher 0,7, mutig 0,5, ueberraschend 0,35) */
  alpha: number;
  /** -1 ruhiger bis 1 mutiger */
  mutiger: number;
  /** Seed der Route (geht in die Parameter) */
  seed: number;
  /** Seed fuer offene Achsen ("Neue Vorschlaege" aendert nur diesen Anteil) */
  offenSeed: number;
  /** Bevorzugte erste Farbstimmung */
  primaer?: ColorMoodKey;
  /** Bevorzugte erste Schriftform */
  primaerForm?: FontForm;
  /** Rolle in der Dreiergruppe: mehr Wortmarke, mehr Vorlage oder Mitte */
  rolle?: RouteRolle;
}

/** Stichwort-Felder aus dem freien Onlyness-Satz, hoechstens 2 (`Wn`). */
function felderAusText(text: string | undefined): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const wort of text.split(/[^\p{L}]+/u).filter((w) => w.length >= 5)) {
    const felder = keywordFieldsFor(wort);
    if (felder[0]) out.push(felder[0].id);
    if (out.length >= 2) break;
  }
  return out;
}

/**
 * Territorium plus Brief zu Routenparametern (`K`). `null`, wenn "Nicht ich" alle Farben
 * oder alle Schriftformen des Territoriums sperrt.
 */
export function resolveRouteParams(
  t: Territory,
  brief: BrandBrief,
  axes: AxisVector,
  opts: ResolveOptions,
): RouteParams | null {
  const mutiger = clamp(opts.mutiger);
  const zufall = rng(hash(`${opts.offenSeed}:${t.id}`));

  // Achsen: offene Achsen streuen um das Territorium, sonst Mischung nach alpha und Sicherheit
  const achsen: AxisVector = {};
  for (const k of AXIS_KEYS) {
    const basis = t.achsen[k] ?? 0;
    const antwort = axes[k];
    const r = zufall.next();
    let v: number;
    let sicher: number;
    if (antwort && antwort.sicher === 0) {
      v = clamp(basis + (r - 0.5) * 0.8);
      sicher = 0;
    } else {
      const s = antwort?.sicher ?? 0;
      const gewicht = opts.alpha * s;
      v = gewicht * (antwort?.v ?? 0) + (1 - gewicht) * basis;
      sicher = 0.5 + 0.5 * s;
    }
    if (mutiger) {
      v = v * (1 + 0.35 * mutiger);
      if (k === "symbol") v += 0.3 * mutiger;
      if (k === "saturation" || k === "contrast") v += 0.2 * mutiger;
      if (k === "weight") v += 0.15 * mutiger;
    }
    achsen[k] = { v: round3(clamp(v)), sicher: round3(sicher) };
  }

  // Harte Sperren aus dem Brief und aus dem Territorium
  const dunkel = (achsen.dark?.v ?? 0) > 0.15 || t.colorMoods[0] === "schwarz";
  const sperren = avoidFromBrief(brief, dunkel);
  const avoidColorMoods = unique([...sperren.avoidColorMoods, ...(t.meiden.colorMoods ?? [])]);
  const avoidThemes = unique([...sperren.avoidThemes, ...(t.meiden.themes ?? [])]);
  const avoidFontForms = unique([...sperren.avoidFontForms, ...(t.meiden.fontForms ?? [])]);
  const avoidContainers = unique([...sperren.avoidContainers, ...(t.meiden.containers ?? [])]);

  // Farben: nach Waerme und Saettigung der Antworten sortiert, Katalogreihenfolge als Grundwert
  let colorMoods = t.colorMoods.filter((m) => !avoidColorMoods.includes(m));
  if (!colorMoods.length) return null;
  const waerme = axes.warmth;
  const saettigung = axes.saturation;
  const farbAbstand = (m: ColorMoodKey, i: number): number =>
    i * 0.25 +
    (waerme && waerme.sicher >= 0.5 ? Math.abs(WAERME[m] - waerme.v) * waerme.sicher : 0) +
    (saettigung && saettigung.sicher >= 0.5
      ? Math.abs(SAETTIGUNG[m] - saettigung.v) * saettigung.sicher * 0.6
      : 0);
  colorMoods = colorMoods
    .map((m, i) => [m, farbAbstand(m, i)] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([m]) => m);
  if (opts.primaer && colorMoods.includes(opts.primaer))
    colorMoods = [opts.primaer, ...colorMoods.filter((m) => m !== opts.primaer)];

  // Schriftformen: sichere Serifen-Antwort filtert, dann nach Abstand zu den Achsen
  const formen = t.fontForms.filter((f) => !avoidFontForms.includes(f));
  if (!formen.length) return null;
  const sichereRichtung = (k: AxisKey): number => {
    const a = axes[k];
    return a && a.sicher >= 0.8 ? Math.sign(a.v) : 0;
  };
  const serif = sichereRichtung("serif");
  const passend = serif ? formen.filter((f) => Math.sign(FONT_FORM_AXES[f].serif ?? 0) === serif) : formen;
  const kandidaten = passend.length ? passend : formen;
  const formAbstand = (f: FontForm, i: number): number => {
    let d = i * 0.15;
    for (const [k, v] of Object.entries(FONT_FORM_AXES[f]))
      d += Math.abs((achsen[k as AxisKey]?.v ?? 0) - v) * (achsen[k as AxisKey]?.sicher ?? 0) * 0.25;
    return d;
  };
  let fontForms = kandidaten
    .map((f, i) => [f, formAbstand(f, i)] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([f]) => f);
  if (opts.primaerForm && fontForms.includes(opts.primaerForm))
    fontForms = [opts.primaerForm, ...fontForms.filter((f) => f !== opts.primaerForm)];

  // Die gewaehlte Schriftform zieht offene Achsen (Serifen, Breite, Kontrast) zu sich
  const erste = FONT_FORM_AXES[fontForms[0] as FontForm];
  for (const k of ["serif", "width", "contrast"] as const) {
    const ziel = erste[k];
    if (ziel === undefined || sichereRichtung(k) || Math.abs(ziel) < 0.5) continue;
    const a = achsen[k] as { v: number; sicher: number };
    achsen[k] = { v: round3(clamp(0.75 * ziel + 0.25 * a.v)), sicher: round3(Math.max(a.sicher, 0.7)) };
  }

  let themes = t.themes.filter((th) => !avoidThemes.includes(th));
  if (!themes.length) themes = (["initialen", "abstrakt"] as SymbolTheme[]).filter((th) => !avoidThemes.includes(th));

  // Logo-Arten: Rolle setzt Wortmarke und Vorlage, der Rest teilt sich in Monogramm und Zeichen
  const rolle = ROLLEN_MIX[opts.rolle ?? "mitte"];
  let wortmarke = rolle.wortmarke;
  let vorlage = rolle.vorlage;
  const kanaele = brief.social?.channels ?? [];
  if (kanaele.some((c) => c === "linkedin" || c === "newsletter")) wortmarke += 0.02;
  if (brief.social?.camera === "gesicht") wortmarke += 0.02;
  if (mutiger) {
    const shift = 0.08 * mutiger;
    wortmarke -= shift;
    vorlage += shift;
  }
  const rest = Math.max(0, 1 - wortmarke - vorlage);
  const zeichenLust = (achsen.symbol?.v ?? 0) * (achsen.symbol?.sicher ?? 0);
  let monogramm = (t.kindMix.monogramm || 0.01) * (1 + 0.3 * zeichenLust);
  let zeichen = (t.kindMix.zeichen || 0.01) * (1 + 0.3 * zeichenLust);
  if (kanaele.some((c) => ["instagram", "tiktok", "facebook", "youtube"].includes(c))) monogramm *= 1.25;
  if (brief.social?.camera === "objekte") zeichen *= 1.4;
  const kindMix: KindMix = {
    wortmarke: round3(wortmarke),
    monogramm: round3((rest * monogramm) / (monogramm + zeichen)),
    zeichen: round3((rest * zeichen) / (monogramm + zeichen)),
    vorlage: round3(vorlage),
  };

  // Namensarten nach Architektur und Erfahrung
  let nameKinds = [...t.nameKinds];
  if (brief.architecture === "person") nameKinds = unique(["person", ...nameKinds, "initialen"]);
  else if (brief.architecture === "person-dann-buero") nameKinds = unique([...nameKinds, "person"]);
  else if (brief.architecture === "buero") nameKinds = nameKinds.filter((k) => k !== "person");
  if (brief.erfahrung === "lange") nameKinds = unique([...nameKinds, "klassisch"]);
  else if (brief.erfahrung === "neu")
    nameKinds = unique([...nameKinds.filter((k) => k !== "klassisch"), "kunstwort"]);
  if (!nameKinds.length) nameKinds = ["kombination"];

  // Stichwort-Felder: Fokus, Wunschkunden, Territorium, Onlyness, eigener Satz, Ort
  const onlynessFelder = (brief.onlyness ?? []).flatMap((o) => ONLYNESS_FELDER[o] ?? []);
  const ortFelder = brief.place ? keywordFieldsFor(brief.place).map((f) => f.id).slice(0, 1) : [];
  const kundenFelder = (brief.wunschkunde ?? []).flatMap(
    (id) => WUNSCHKUNDEN.find((w) => w.id === id)?.felder ?? [],
  );
  const keywordFields = unique([
    ...(brief.focus ?? []).map((f) => FOKUS_FELD[f] as string),
    ...kundenFelder,
    ...t.keywordFields,
    ...onlynessFelder,
    ...felderAusText(brief.onlynessText),
    ...ortFelder,
  ]).slice(0, 8);

  return {
    territory: t.id,
    styles: t.styles.slice(0, 2),
    colorMoods,
    avoidColorMoods,
    themes,
    avoidThemes,
    fontForms,
    avoidFontForms,
    avoidContainers,
    axes: achsen,
    kindMix,
    signatureStyles: [...t.signatureStyles],
    signatureIds: unique([...t.signatureIds, ...t.signatureZweit]),
    avoidSignatureIds: [],
    ...(sperren.avoidPaletteIds.length ? { avoidPaletteIds: sperren.avoidPaletteIds } : {}),
    nameKinds,
    keywordFields,
    keywords: [],
    seed: opts.seed,
  };
}
