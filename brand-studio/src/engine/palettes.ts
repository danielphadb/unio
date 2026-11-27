/**
 * Paletten und Farbstimmungen (svg-Chunk).
 *
 * Daten: palettes.json (W1 aus `rt`, `ct`, `z` gezogen). Die Paletten-ID einer
 * abgeleiteten Palette enthaelt berechnete Farben (`<basis>-<primary><accent 2 Stellen><paper 2 Stellen>`),
 * deshalb muss die Rechnung bitgenau bleiben.
 */
import type { BrandInput, ColorMoodKey, Palette, StyleKey } from "../types";
import data from "./palettes.json";
import {
  capSaturation,
  clamp01,
  ensureContrast,
  hexToHsl,
  hslToHex,
  mix,
  normalizeHex,
} from "./color";
import { hash, rng, type Rng } from "./rng";

export interface ColorMood {
  label: string;
  /** Farbmuster fuer die Auswahl */
  swatch: string;
  hint: string;
}

/** Grundpalette aus dem Katalog (mit Stimmung und passenden Stilen). */
export interface PaletteDef extends Palette {
  mood: ColorMoodKey;
  styles: StyleKey[];
}

/** Farbstimmungen (`rt`, Export `C`). */
export const COLOR_MOODS = data.moods as Record<ColorMoodKey, ColorMood>;
/** Schluessel der Farbstimmungen in fester Reihenfolge (`ot`, Export `M`). */
export const COLOR_MOOD_KEYS = Object.keys(COLOR_MOODS) as ColorMoodKey[];
/** Farbstimmungen je Stil (`ct`). */
export const STYLE_MOODS = data.stilMoods as Record<StyleKey, ColorMoodKey[]>;
/** Alle 24 Grundpaletten (`z`). */
export const PALETTES = data.paletten as PaletteDef[];

const BY_ID = new Map(PALETTES.map((p) => [p.id, p]));

/** Basis-ID einer (abgeleiteten) Palette: `navysand-1F3A5F7EF8` zu `navysand` (`J`, Export `p`). */
export function paletteBaseId(palette: Pick<Palette, "id">): string {
  return palette.id.split("-")[0] as string;
}

/** Stimmung einer Palette ueber ihre Basis-ID (`it`, Export `w`). */
export function paletteMood(
  palette: Pick<Palette, "id">,
): ColorMoodKey | undefined {
  return BY_ID.get(paletteBaseId(palette))?.mood;
}

/** Stimmung zu einer Paletten-ID (`bt`, Export `k`). */
export function moodOfPaletteId(id: string): ColorMoodKey | undefined {
  return PALETTES.find((p) => p.id === id.split("-")[0])?.mood;
}

/**
 * Palette lesbar machen: Text (ink) mit 7,2:1, Primaer 3,1:1, Akzent 3,05:1 auf
 * dem Papier; Saettigung gedeckelt; ID mit den berechneten Farben (`tt`).
 */
export function finalizePalette(
  base: Pick<Palette, "id" | "name">,
  colors: Pick<Palette, "primary" | "secondary" | "accent" | "ink" | "paper">,
): Palette {
  const paper = normalizeHex(colors.paper);
  const ink = ensureContrast(colors.ink, paper, 7.2);
  const primary = ensureContrast(capSaturation(colors.primary), paper, 3.1);
  const accent = ensureContrast(
    capSaturation(colors.accent, 0.55),
    paper,
    3.05,
  );
  const secondary = capSaturation(colors.secondary, 0.5);
  return {
    id: `${base.id}-${primary.slice(1)}${accent.slice(1, 3)}${paper.slice(5)}`,
    name: base.name,
    primary,
    secondary,
    accent,
    ink,
    paper,
  };
}

/** Farbe leicht verschieben (Ton, Saettigung, Helligkeit), Staerke `amount` (`j`). */
export function jitterColor(hex: string, r: Rng, amount: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({
    h: hsl.h + (r.next() - 0.5) * 10 * amount,
    s: clamp01(hsl.s * (1 + (r.next() - 0.5) * 0.2 * amount)),
    l: clamp01(hsl.l + (r.next() - 0.5) * 0.07 * amount),
  });
}

const WARM_PAPERS = ["#FAF7F2", "#F8F5EF", "#FBF9F5", "#F7F3EC"];
const COOL_PAPERS = ["#FFFFFF", "#F7F8FA", "#FAFAFA"];

/** Abwandlung einer Grundpalette passend zum Stil (`U`). */
export function varyPalette(
  base: PaletteDef,
  style: StyleKey,
  r: Rng,
  amount = 1,
): Palette {
  let primary = jitterColor(base.primary, r, amount);
  let paper = base.paper;
  let ink = base.ink;
  if (amount > 0 && r.chance(0.35)) {
    const warm = hexToHsl(base.paper).h < 80 && hexToHsl(base.paper).s > 0.05;
    paper = r.pick(warm ? WARM_PAPERS : COOL_PAPERS);
  }
  if (style === "mutig") {
    paper = r.chance(0.6) ? "#FFFFFF" : paper;
    const hsl = hexToHsl(primary);
    primary = hslToHex({ ...hsl, s: Math.min(0.68, hsl.s * 1.08) });
  }
  if (style === "luxus") {
    ink = mix(ink, "#000000", 0.25);
    if (r.chance(0.5)) paper = r.pick(["#FFFFFF", "#FAFAF8"]);
  }
  return finalizePalette(base, {
    primary,
    secondary: jitterColor(base.secondary, r, amount * 0.6),
    accent: jitterColor(base.accent, r, amount * 0.6),
    ink,
    paper,
  });
}

/**
 * Grundpalette gewichtet waehlen: passender Stil 3, sonst 1; bei Luxus zaehlen
 * nur passende, sofern es welche gibt (`dt`).
 */
export function pickPaletteForStyle(
  candidates: PaletteDef[],
  style: StyleKey,
  r: Rng,
): PaletteDef {
  const luxusOnly =
    style === "luxus" && candidates.some((p) => p.styles.includes(style));
  const weights = candidates.map((p): number =>
    p.styles.includes(style) ? 3 : luxusOnly ? 0 : 1,
  );
  let roll = r.next() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i] as number;
    if (roll <= 0) return candidates[i] as PaletteDef;
  }
  return candidates[candidates.length - 1] as PaletteDef;
}

/** Abgewandelte Palette einer Stimmung (`kt`, Export `g`). */
export function paletteForMood(
  mood: ColorMoodKey,
  style: StyleKey,
  r: Rng,
): Palette {
  const candidates = PALETTES.filter((p) => p.mood === mood);
  return varyPalette(pickPaletteForStyle(candidates, style, r), style, r);
}

/**
 * Farbstimmungen fuer eine Eingabe: gewaehlte Stimmungen, sonst die Stimmungen
 * des Stils `style` bzw. aller gewaehlten Stile (Standard elegant, modern, warm) (`ht`, Export `f`).
 */
export function moodsFor(
  input: Pick<BrandInput, "colorMoods" | "styles">,
  style?: StyleKey,
): ColorMoodKey[] {
  if (input.colorMoods.length) return input.colorMoods;
  const styles: StyleKey[] = style
    ? [style]
    : input.styles.length
      ? input.styles
      : ["elegant", "modern", "warm"];
  const out: ColorMoodKey[] = [];
  for (const s of styles)
    for (const m of STYLE_MOODS[s]) if (!out.includes(m)) out.push(m);
  return out;
}

/**
 * Andere Paletten zu einer Palette (Editor "Farben"): erst gleiche Stimmung,
 * dann je eine aus den passenden Stimmungen, dann der Rest; Gold nur, wenn
 * gewaehlt oder schon Gold (`At`, Export `x`).
 */
export function alternativePalettes(
  current: Palette,
  input: Pick<BrandInput, "colorMoods" | "styles">,
  count: number,
  style?: StyleKey,
): Palette[] {
  const r = rng(hash(current.id) ^ 20973);
  const st = style ?? input.styles[0] ?? "elegant";
  const baseId = paletteBaseId(current);
  const mood = paletteMood(current);
  const moods = moodsFor(input, st);
  const others = COLOR_MOOD_KEYS.filter(
    (m) =>
      !moods.includes(m) &&
      (m !== "gold" || input.colorMoods.includes("gold") || mood === "gold"),
  );
  const order: PaletteDef[] = [];
  const add = (list: PaletteDef[]) =>
    list.forEach((p) => {
      if (p.id !== baseId && !order.includes(p)) order.push(p);
    });
  if (mood) add(r.shuffle(PALETTES.filter((p) => p.mood === mood)));
  const perMood = moods.map((m) =>
    r.shuffle(PALETTES.filter((p) => p.mood === m)),
  );
  for (let i = 0; i < 3; i++)
    for (const list of perMood) if (list[i]) add([list[i] as PaletteDef]);
  for (const m of others) add(r.shuffle(PALETTES.filter((p) => p.mood === m)));
  const out: Palette[] = [];
  for (const p of order) {
    if (out.length >= count) break;
    out.push(varyPalette(p, st, r, 0.6));
  }
  let tries = 0;
  while (out.length < count && tries < count * 4) {
    tries++;
    const base =
      BY_ID.get(baseId) ?? (PALETTES[tries % PALETTES.length] as PaletteDef);
    const p = varyPalette(base, st, r, 1.5);
    if (p.id !== current.id && !out.some((o) => o.id === p.id)) out.push(p);
  }
  return out;
}

/** Alle Grundpaletten lesbar gemacht, ohne Abwandlung (`Et`, Export `i`). */
export function basePalettes(): Palette[] {
  return PALETTES.map((p) => finalizePalette(p, p));
}
