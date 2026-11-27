/**
 * ÜBERGANG: Kopien von Funktionen, die die Logo-Engine liefert, bis deren Module
 * gepusht sind. Danach wird diese Datei entfernt und die Importe zeigen auf:
 *
 * - `cleanText` (engine `$`): src/engine/cleanText.ts
 * - `resolveColors` (engine `Nn`, Export `al`): src/engine/renderLogo.ts
 * - `corpusTwinName` (engine `Al`): src/engine/highend.ts
 * - `fontMonogramSvg` (index `p4`, Export `b0`): src/symbols/monogram.ts
 *
 * Abstimmung über den Koordinator (Status W3 in docs/23). Bitgenau wie die alte Fassung.
 */
import type { Font, Path } from "opentype.js";
import type { LogoConcept, Palette, TypoDetails } from "../types";
import {
  contrast,
  ensureContrast,
  hexToHsl,
  luminance,
  readableAccent,
  safeHex,
  sanitizePalette,
} from "../engine/color";
import { capHeight, normalizeText } from "../engine/text";
import corpusMarks from "../engine/corpusMarks.data.json";
import corpusTechMarks from "../engine/corpusTechMarks.data.json";

// ---------------------------------------------------------------------------
// cleanText (engine `$`)

/** Text säubern: NFC, Leerraum zusammenfassen, außen kürzen. */
export function cleanText(text: string | undefined | null): string {
  return normalizeText(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// resolveColors (engine `Nn`)

export type ColorVariant = "color" | "reverse" | "mono-dark" | "mono-light";

export interface ResolvedColors {
  ground: string;
  symbol: string;
  symbolAccent: string;
  name: string;
  suffix: string;
  divider: string;
  knockout: string;
  split: string;
  mark: string;
}

type ColorSource = {
  palette: Palette;
  colors?: Partial<LogoConcept["colors"]>;
  typo?: Pick<TypoDetails, "split" | "markColor" | "suffixScale">;
};

const lightPaper = (p: Palette): string =>
  luminance(p.paper) > 0.8 ? p.paper : "#FFFFFF";
const bestOn = (p: Palette, ground: string, light: string): string =>
  [p.ink, light, "#FFFFFF", "#111111"].reduce((best, c) =>
    contrast(c, ground) > contrast(best, ground) + 0.01 ? c : best,
  );
const grey = (hex: string): boolean => hexToHsl(hex).s < 0.12;

export function resolveColors(
  c: ColorSource,
  variant: ColorVariant | string = "color",
  groundHex?: string,
): ResolvedColors {
  const r = sanitizePalette(c.palette) as Palette & Record<string, string>;
  const pick = <T extends string>(
    v: string | undefined,
    allowed: T[],
    fallback: T,
  ): T => (allowed.includes(v as T) ? (v as T) : fallback);
  const roles = {
    symbol: pick(
      c.colors?.symbol,
      ["primary", "secondary", "accent", "ink"],
      "primary",
    ),
    name: pick(c.colors?.name, ["primary", "ink"], "ink"),
    suffix: pick(
      c.colors?.suffix,
      ["primary", "secondary", "accent", "ink"],
      "ink",
    ),
  };
  const splitRole = c.typo?.split?.color
    ? pick(c.typo.split.color, ["primary", "accent", "ink"], "primary")
    : null;
  const markRole = c.typo?.markColor
    ? pick(c.typo.markColor, ["primary", "accent"], "primary")
    : null;
  const ground =
    groundHex === undefined
      ? undefined
      : safeHex(
          groundHex,
          variant === "reverse" || variant === "mono-light" ? r.ink : r.paper,
        );
  switch (variant) {
    case "mono-dark": {
      const f = ground ?? r.paper;
      return {
        ground: f,
        symbol: r.ink,
        symbolAccent: r.ink,
        name: r.ink,
        suffix: r.ink,
        divider: r.ink,
        knockout: f,
        split: r.ink,
        mark: r.ink,
      };
    }
    case "mono-light": {
      const f = ground ?? r.ink;
      const d = "#FFFFFF";
      return {
        ground: f,
        symbol: d,
        symbolAccent: d,
        name: d,
        suffix: d,
        divider: d,
        knockout: f,
        split: d,
        mark: d,
      };
    }
    case "reverse": {
      const f = ground ?? r.ink;
      const d = lightPaper(r);
      const b = (t: string, k: number) =>
        contrast(t, f) >= k ? t : bestOn(r, f, d);
      const z = (t: string, k: number) => {
        if (contrast(t, f) >= k) return t;
        if (grey(t)) return b(d, k);
        const e = ensureContrast(t, f, k, d);
        return contrast(e, f) >= k &&
          hexToHsl(e).l - hexToHsl(t).l <= 0.2 &&
          hexToHsl(e).s >= 0.12
          ? e
          : contrast(r.accent, f) >= k && !grey(r.accent)
            ? r.accent
            : b(d, k);
      };
      const k = r[roles.name];
      const v = contrast(k, f) >= 4.5 && !grey(k) ? k : b(d, 3);
      const m = r[roles.suffix];
      const s = (c.typo?.suffixScale ?? 0) >= 0.75 ? 3 : 4.5;
      const suffix = roles.suffix === "ink" || grey(m) ? b(d, s) : z(m, s);
      const symbol = z(r[roles.symbol] === r.ink ? d : r[roles.symbol], 3);
      const symbolAccent = readableAccent(r, f, 3);
      const divider = readableAccent(r, f, 3);
      const split = splitRole
        ? splitRole === "ink" || grey(r[splitRole])
          ? b(d, 3)
          : z(r[splitRole], 4.5)
        : v;
      const mark = !markRole || grey(r[markRole]) ? v : z(r[markRole], 3);
      return {
        ground: f,
        symbol,
        symbolAccent,
        name: v,
        suffix,
        divider,
        knockout: f,
        split,
        mark,
      };
    }
    default: {
      const f = ground ?? r.paper;
      const d = readableAccent(r, f, 3);
      const b =
        splitRole && contrast(r[splitRole], f) >= 4.5
          ? r[splitRole]
          : r[roles.name];
      const z =
        markRole && contrast(r[markRole], f) >= 3 ? r[markRole] : r[roles.name];
      const k = (c.typo?.suffixScale ?? 0) >= 0.75 ? 3 : 4.5;
      const v = (n: string, a: number) =>
        contrast(n, f) >= a ? n : bestOn(r, f, lightPaper(r));
      const name = v(r[roles.name], 3);
      const suffix =
        contrast(r[roles.suffix], f) >= k ? r[roles.suffix] : v(name, k);
      return {
        ground: f,
        symbol: r[roles.symbol],
        symbolAccent: d,
        name,
        suffix,
        divider: d,
        knockout: f,
        split: v(b, 3),
        mark: v(z, 3),
      };
    }
  }
}

// ---------------------------------------------------------------------------
// corpusTwinName (engine `Al`, mit `hn`, `ks`)

type CorpusRow = [string, string, string, string, string, ...unknown[]];
const CORPUS = [
  ...(corpusMarks as unknown as CorpusRow[]),
  ...(corpusTechMarks as unknown as CorpusRow[]),
];

const norm = (t: string): string =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ø/gi, "o")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Korpusmarke mit gleichem Namen und gleicher Schrift und Schreibung, sonst `null`. */
export function corpusTwinName(
  t: { merkmale: { schrift: string; schreibung: string } },
  input: { name: string },
): string | null {
  const n = norm(cleanText(input.name));
  if (n.length < 2) return null;
  for (const [id, a, b, schrift, schreibung] of CORPUS)
    if (
      !(norm(a) !== n && norm(b) !== n) &&
      schrift === t.merkmale.schrift &&
      schreibung === t.merkmale.schreibung
    )
      return id;
  return null;
}

// ---------------------------------------------------------------------------
// fontMonogramSvg (index `p4` mit `u4`, `c4`, `lh`, `d4`, `f4`, `h4`)

const UNIT = 100;
const ROWS = 24;
type Pt = [number, number];
interface Glyph {
  ch: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  pts: Pt[];
}

function samplePath(path: Path): Pt[] {
  const out: Pt[] = [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  const add = (f: (t: number) => Pt, len: number) => {
    const n = Math.max(2, Math.ceil(len / 1.2));
    for (let i = 1; i <= n; i++) out.push(f(i / n));
  };
  for (const c of path.commands as Array<
    Record<string, number> & { type: string }
  >)
    if (c.type === "M") {
      x = sx = c.x!;
      y = sy = c.y!;
      out.push([x, y]);
    } else if (c.type === "L" || c.type === "Z") {
      const ex = c.type === "Z" ? sx : c.x!;
      const ey = c.type === "Z" ? sy : c.y!;
      const x0 = x;
      const y0 = y;
      add(
        (t) => [x0 + (ex - x0) * t, y0 + (ey - y0) * t],
        Math.hypot(ex - x0, ey - y0),
      );
      x = ex;
      y = ey;
    } else if (c.type === "Q") {
      const x0 = x;
      const y0 = y;
      add(
        (t) => {
          const u = 1 - t;
          return [
            u * u * x0 + 2 * u * t * c.x1! + t * t * c.x!,
            u * u * y0 + 2 * u * t * c.y1! + t * t * c.y!,
          ];
        },
        Math.hypot(c.x1! - x0, c.y1! - y0) +
          Math.hypot(c.x! - c.x1!, c.y! - c.y1!),
      );
      x = c.x!;
      y = c.y!;
    } else if (c.type === "C") {
      const x0 = x;
      const y0 = y;
      add(
        (t) => {
          const u = 1 - t;
          return [
            u * u * u * x0 +
              3 * u * u * t * c.x1! +
              3 * u * t * t * c.x2! +
              t * t * t * c.x!,
            u * u * u * y0 +
              3 * u * u * t * c.y1! +
              3 * u * t * t * c.y2! +
              t * t * t * c.y!,
          ];
        },
        Math.hypot(c.x1! - x0, c.y1! - y0) +
          Math.hypot(c.x2! - c.x1!, c.y2! - c.y1!) +
          Math.hypot(c.x! - c.x2!, c.y! - c.y2!),
      );
      x = c.x!;
      y = c.y!;
    }
  return out;
}

function glyphOf(font: Font, ch: string): Glyph {
  const pts = samplePath(font.getPath(ch, 0, 0, UNIT));
  if (!pts.length) return { ch, minX: 0, maxX: 0, minY: 0, maxY: 0, pts };
  let minX = 1 / 0;
  let maxX = -1 / 0;
  let minY = 1 / 0;
  let maxY = -1 / 0;
  for (const [px, py] of pts) {
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  }
  return { ch, minX, maxX, minY, maxY, pts };
}

function profile(
  g: Glyph,
  cap: number,
  side: "left" | "right",
): Array<number | null> {
  const top = -cap * 1.02;
  const step = (cap * 1.04) / ROWS;
  const rows: Array<number | null> = new Array(ROWS).fill(null);
  for (const [px, py] of g.pts) {
    const i = Math.floor((py - top) / step);
    if (i < 0 || i >= ROWS) continue;
    const v = rows[i]!;
    rows[i] =
      v === null ? px : side === "right" ? Math.max(v, px) : Math.min(v, px);
  }
  return rows;
}

const GAP: Record<string, { target: number; min: number }> = {
  sans: { target: 0.14, min: 0.07 },
  display: { target: 0.11, min: 0.06 },
  serif: { target: 0.12, min: 0.045 },
  script: { target: -0.04, min: -0.3 },
};

function pairOffset(a: Glyph, b: Glyph, cap: number, kind: string): number {
  const ra = profile(a, cap, "right");
  const lb = profile(b, cap, "left");
  const gaps: number[] = [];
  for (let i = 0; i < ROWS; i++) {
    const p = ra[i]!;
    const q = lb[i]!;
    if (p !== null && q !== null) gaps.push(q - p);
  }
  const g = GAP[kind]!;
  if (gaps.length < 4) return a.maxX - b.minX + g.target * cap;
  const min = Math.min(...gaps);
  const avg = gaps.reduce((s, v) => s + v, 0) / gaps.length;
  let off = g.target * cap - (0.5 * min + 0.5 * avg);
  if (min + off < g.min * cap) off = g.min * cap - min;
  return off;
}

const initialsOf = (t: string): string =>
  Array.from(t.replace(/\s+/g, ""))
    .slice(0, 2)
    .map((c) => c.toLocaleUpperCase("de-AT").charAt(0))
    .join("");

/** Monogramm aus ein bis zwei Buchstaben einer Schrift, eingepasst in `box` (`p4`). */
export function fontMonogramSvg(
  font: Font,
  text: string,
  box: { x: number; y: number; w: number; h: number },
  fill: string,
  kind = "sans",
): string {
  const chars = Array.from(initialsOf(text));
  if (!chars.length) return "";
  const cap = capHeight(font, UNIT);
  const glyphs = chars.map((c) => glyphOf(font, c));
  const offs = [0];
  if (glyphs.length === 2)
    offs.push(pairOffset(glyphs[0]!, glyphs[1]!, cap, kind));
  let minX = 1 / 0;
  let maxX = -1 / 0;
  let minY = 1 / 0;
  let maxY = -1 / 0;
  glyphs.forEach((g, i) => {
    if (g.pts.length) {
      minX = Math.min(minX, g.minX + offs[i]!);
      maxX = Math.max(maxX, g.maxX + offs[i]!);
      minY = Math.min(minY, g.minY);
      maxY = Math.max(maxY, g.maxY);
    }
  });
  if (!isFinite(minX)) return "";
  let top = -cap;
  let bottom = 0;
  if (kind === "script") {
    top = minY;
    bottom = maxY;
  } else {
    if (minY < -cap * 1.1) top = (-cap + minY) / 2;
    if (maxY > cap * 0.08) bottom = maxY / 2;
  }
  const hh = bottom - top;
  const ww = maxX - minX;
  const fullH = maxY - minY;
  const one = glyphs.length === 1;
  const scale = Math.min(
    (box.w * (one ? 0.72 : kind === "script" ? 0.92 : 0.84)) / ww,
    (box.h * (one || kind === "script" ? 0.66 : 0.6)) / hh,
    (box.h * 0.9) / fullH,
  );
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const x0 = cx - ((minX + maxX) / 2) * scale;
  const y0 = cy - ((top + bottom) / 2) * scale;
  return `<path d="${glyphs.map((g, i) => font.getPath(g.ch, x0 + offs[i]! * scale, y0, UNIT * scale).toPathData(2)).join("")}" fill="${fill}"/>`;
}
