/**
 * Farbe: Hex, HSL, Mischen, Leuchtdichte, Kontrast (svg-Chunk).
 *
 * Bitgenau wie die gesicherte Fassung (Paletten-IDs enthalten berechnete Hexwerte).
 */
import type { Palette } from "../types";

export type Rgb = [number, number, number];
export interface Hsl {
  /** Farbton in Grad (nicht normiert, kann negativ oder > 360 sein) */
  h: number;
  /** Saettigung 0 bis 1 */
  s: number;
  /** Helligkeit 0 bis 1 */
  l: number;
}

/** Begrenzt auf 0 bis 1 (`H`). */
export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** `#abc` oder `abcdef` zu `#AABBCC` (`I`, ohne Pruefung). */
export function normalizeHex(value: string): string {
  let hex = value.trim().replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  return `#${hex.slice(0, 6).toUpperCase()}`;
}

const HEX6 = /^#?[0-9a-f]{6}$/i;
const HEX3 = /^#?[0-9a-f]{3}$/i;

/** Gueltige Hexfarbe oder Ersatz (`P`, Export `u`). */
export function safeHex(value: unknown, fallback = "#000000"): string {
  if (typeof value == "string") {
    const v = value.trim();
    if (HEX6.test(v) || HEX3.test(v)) return normalizeHex(v);
  }
  return HEX6.test(fallback) ? normalizeHex(fallback) : "#000000";
}

/** Palette aus unsicheren Daten (Speicher, Import), fehlende Felder mit Standard (`yt`, Export `s`). */
export function sanitizePalette(value: unknown): Palette {
  const p = (value ?? {}) as Record<string, unknown>;
  return {
    id: typeof p.id == "string" ? p.id : "custom",
    name: typeof p.name == "string" ? p.name : "",
    primary: safeHex(p.primary, "#1F3A5F"),
    secondary: safeHex(p.secondary, "#E6E1D8"),
    accent: safeHex(p.accent, "#7E8696"),
    ink: safeHex(p.ink, "#111111"),
    paper: safeHex(p.paper, "#FFFFFF"),
  };
}

/** `q` */
export function hexToRgb(hex: string): Rgb {
  const h = normalizeHex(hex).slice(1);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** `K`: gerundet und begrenzt, Grossbuchstaben. */
export function rgbToHex(r: number, g: number, b: number): string {
  const part = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

/** `T`, Export `a` */
export function hexToHsl(hex: string): Hsl {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255) as Rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

/** `W`, Export `b` */
export function hslToHex({ h, s, l }: Hsl): string {
  const hue = (((h % 360) + 360) % 360) / 360;
  const sat = clamp01(s);
  const lig = clamp01(l);
  if (sat === 0) return rgbToHex(lig * 255, lig * 255, lig * 255);
  const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
  const p = 2 * lig - q;
  const channel = (t0: number) => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    return t < 1 / 6
      ? p + (q - p) * 6 * t
      : t < 1 / 2
        ? q
        : t < 2 / 3
          ? p + (q - p) * (2 / 3 - t) * 6
          : p;
  };
  return rgbToHex(
    channel(hue + 1 / 3) * 255,
    channel(hue) * 255,
    channel(hue - 1 / 3) * 255,
  );
}

/** Lineare Mischung in RGB, `t` = Anteil von `b` (`Q`, Export `m`). */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(
    x[0] + (y[0] - x[0]) * t,
    x[1] + (y[1] - x[1]) * t,
    x[2] + (y[2] - x[2]) * t,
  );
}

/** Relative Leuchtdichte nach WCAG 2 (`G`, Export `l`). */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Kontrastverhaeltnis 1 bis 21 (`Z`, Export `c`). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Dunkle Flaeche (Leuchtdichte unter 0,18) (`st`, Export `j`). */
export const isDark = (hex: string): boolean => luminance(hex) < 0.18;

/** Akzentfarbe, die auf `background` lesbar ist (`gt`, Export `o`). */
export function readableAccent(
  palette: Palette,
  background: string,
  minRatio = 3,
): string {
  if (contrast(palette.accent, background) >= minRatio) return palette.accent;
  const light = luminance(palette.paper) > 0.8 ? palette.paper : "#FFFFFF";
  return ensureContrast(
    palette.accent,
    background,
    minRatio,
    isDark(background) ? light : palette.ink,
  );
}

/**
 * Farbe so weit abdunkeln oder aufhellen, bis sie auf `background` mindestens
 * `minRatio` erreicht; danach Richtung `toward` mischen (`L`, Export `e`).
 */
export function ensureContrast(
  color: string,
  background: string,
  minRatio: number,
  toward?: string,
): string {
  if (contrast(color, background) >= minRatio) return normalizeHex(color);
  const hsl = hexToHsl(color);
  const lightBg = luminance(background) > 0.4;
  for (let i = 1; i <= 40; i++) {
    const l = lightBg ? hsl.l - i * 0.02 : hsl.l + i * 0.02;
    if (l < 0 || l > 1) break;
    const s = lightBg ? hsl.s : hsl.s * (1 - i * 0.012);
    const candidate = hslToHex({ h: hsl.h, s, l });
    if (contrast(candidate, background) >= minRatio) return candidate;
  }
  const target = toward ?? (lightBg ? "#000000" : "#FFFFFF");
  for (let t = 0.1; t <= 1.001; t += 0.1) {
    const candidate = mix(color, target, t);
    if (contrast(candidate, background) >= minRatio) return candidate;
  }
  return normalizeHex(target);
}

/** Saettigung deckeln (bei sehr hellen oder dunklen Farben etwas mehr erlaubt) (`Y`). */
export function capSaturation(hex: string, max = 0.62): string {
  const hsl = hexToHsl(hex);
  const limit = hsl.l > 0.3 && hsl.l < 0.7 ? max : Math.min(0.8, max + 0.12);
  return hsl.s > limit ? hslToHex({ ...hsl, s: limit }) : normalizeHex(hex);
}
