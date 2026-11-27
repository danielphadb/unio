/**
 * Text als Pfad (index-Chunk): Schreibung, Ersatzschriften je Zeichen,
 * Wortabstand, Versalhoehe und ein Zwischenspeicher je Schrift.
 *
 * Genutzt von Logo-Engine, Kit, Unterlagen und Postings. Ausgabe bitgenau wie die
 * gesicherte Fassung (gleiche opentype.js-Version 1.3.4, gleiche Rechenreihenfolge).
 */
import { Path, type Font } from "opentype.js";
import type { CaseKey } from "../types";
import { COVERAGE, getFont } from "./fonts";

/**
 * Schreibung anwenden. Versalschriften immer gross, Schreibschriften nie gross
 * (dann Wortanfaenge gross); ß wird zu ẞ, wenn die Schrift es hat (`LL`, Export `aw`).
 */
export function applyCase(
  text: string,
  kase: CaseKey | undefined,
  fontKey?: string,
): string {
  const meta = fontKey ? getFont(fontKey) : undefined;
  let c = kase;
  if (meta?.capsOnly) c = "upper";
  if (meta?.noCaps && c === "upper") c = "title";
  switch (c) {
    case "upper":
      return (
        fontKey && COVERAGE[fontKey]?.capSharpS ? text.replace(/ß/g, "ẞ") : text
      ).toLocaleUpperCase("de-AT");
    case "lower":
      return text.toLocaleLowerCase("de-AT");
    case "title":
      return text.replace(
        /\S+/g,
        (w) => w.charAt(0).toLocaleUpperCase("de-AT") + w.slice(1),
      );
    default:
      return text;
  }
}

/** NFC und lange Striche als Bindestrich (die Logo-Schriften setzen sie einheitlich) (`pg`, Export `be`). */
export function normalizeText(text: string): string {
  return text.normalize("NFC").replace(/[–—]/g, "-");
}

const hasGlyph = (font: Font, ch: string): boolean =>
  /\s/.test(ch) || font.charToGlyphIndex(ch) > 0;

interface Run {
  /** `null`: keine Schrift hat das Zeichen (Ersatzkaestchen) */
  font: Font | null;
  text: string;
}

/** Text in Abschnitte je Schrift zerlegen (Hauptschrift, sonst erste Ersatzschrift mit dem Zeichen). */
function runs(font: Font, text: string, fallbacks: Font[]): Run[] {
  const out: Run[] = [];
  for (const ch of Array.from(text)) {
    const f = hasGlyph(font, ch)
      ? font
      : (fallbacks.find((x) => hasGlyph(x, ch)) ?? null);
    const last = out[out.length - 1];
    if (last && last.font === f) last.text += ch;
    else out.push({ font: f, text: ch });
  }
  return out;
}

/** Groesse einer Ersatzschrift, damit ihre Versalhoehe zur Hauptschrift passt. */
function matchedSize(main: Font, other: Font, size: number): number {
  return other === main
    ? size
    : (size * capHeight(main, 1)) / capHeight(other, 1);
}

/** Ersatzkaestchen (Rahmen) fuer ein fehlendes Zeichen. */
function tofu(
  main: Font,
  x: number,
  y: number,
  size: number,
): { path: Path; advance: number } {
  const cap = capHeight(main, size);
  const w = cap * 0.62;
  const stroke = Math.max(cap * 0.08, 0.5);
  const path = new Path();
  const rect = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    cw: boolean,
  ) => {
    path.moveTo(x0, y0);
    if (cw) {
      path.lineTo(x1, y0);
      path.lineTo(x1, y1);
      path.lineTo(x0, y1);
    } else {
      path.lineTo(x0, y1);
      path.lineTo(x1, y1);
      path.lineTo(x1, y0);
    }
    path.close();
  };
  const left = x + cap * 0.08;
  rect(left, y - cap, left + w, y, true);
  rect(left + stroke, y - cap + stroke, left + w - stroke, y - stroke, false);
  return { path, advance: w + cap * 0.16 };
}

function runsPath(
  main: Font,
  parts: Run[],
  x: number,
  y: number,
  size: number,
  tracking: number,
): Path {
  if (parts.length === 1 && parts[0]!.font === main)
    return main.getPath(parts[0]!.text, x, y, size, {
      kerning: true,
      letterSpacing: tracking,
    });
  const path = new Path();
  let cx = x;
  for (const part of parts) {
    if (!part.font) {
      for (const _ of Array.from(part.text)) {
        const t = tofu(main, cx, y, size);
        path.extend(t.path);
        cx += t.advance + tracking * size;
      }
      continue;
    }
    const s = matchedSize(main, part.font, size);
    const opts = { kerning: true, letterSpacing: (tracking * size) / s };
    path.extend(part.font.getPath(part.text, cx, y, s, opts));
    cx += part.font.getAdvanceWidth(part.text, s, opts);
  }
  return path;
}

function runsAdvance(
  main: Font,
  parts: Run[],
  size: number,
  tracking: number,
): number {
  let w = 0;
  for (const part of parts) {
    if (!part.font) {
      w +=
        Array.from(part.text).length *
        (tofu(main, 0, 0, size).advance + tracking * size);
      continue;
    }
    const s = matchedSize(main, part.font, size);
    w += part.font.getAdvanceWidth(part.text, s, {
      kerning: true,
      letterSpacing: (tracking * size) / s,
    });
  }
  return w;
}

const fontIds = new WeakMap<Font, number>();
let nextFontId = 1;
const fontId = (font: Font): number => {
  let id = fontIds.get(font);
  if (!id) fontIds.set(font, (id = nextFontId++));
  return id;
};

/** Ergebnis von `textPath`: Pfad nach links oben verschoben. */
export interface TextPath {
  /** SVG-Pfaddaten (1 Nachkommastelle), leer wenn nichts sichtbar */
  d: string;
  width: number;
  height: number;
  /** Abstand von der Oberkante zur Grundlinie */
  ascent: number;
  /** linker Rand der Zeichen relativ zum Startpunkt */
  left: number;
  /** Vorschub (mit Laufweite und Wortabstand) */
  advance: number;
}

/** Zwischenspeicher je Schrift (wird geleert, wenn latin-ext nachgeladen wird) (`Su`). */
const pathCache = new WeakMap<Font, Map<string, TextPath>>();

/** Gespeicherte Pfade einer Schrift verwerfen (FontStore nach dem Zusammenfuehren von latin-ext). */
export function forgetTextPaths(font: Font): void {
  pathCache.delete(font);
}

/**
 * Text als Pfad mit Groesse `size`, Laufweite `tracking` (em) und Ersatzschriften
 * (`FL`, Export `aB`). Bis 800 Eintraege je Schrift im Zwischenspeicher.
 */
export function textPath(
  font: Font,
  text: string,
  size: number,
  tracking = 0,
  fallbacks: Font[] = [],
): TextPath {
  const t = normalizeText(text);
  let cache = pathCache.get(font);
  if (!cache) pathCache.set(font, (cache = new Map()));
  const key = `${t}\0${size.toFixed(3)}\0${tracking}\0${fallbacks.map(fontId).join(",")}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const parts = runs(font, t, fallbacks);
  const extra = wordSpaceExtra(font, t, size, tracking);
  const build = (x: number, y: number) =>
    extra > 0
      ? spacedPath(font, t, fallbacks, x, y, size, tracking, extra)
      : runsPath(font, parts, x, y, size, tracking);
  const box = build(0, 0).getBoundingBox();
  const advance = textAdvance(font, t, size, tracking, fallbacks);
  const result: TextPath =
    !isFinite(box.x1) || box.x2 - box.x1 <= 0
      ? { d: "", width: 0, height: 0, ascent: 0, left: 0, advance }
      : {
          d: build(-box.x1, -box.y1).toPathData(1),
          width: box.x2 - box.x1,
          height: box.y2 - box.y1,
          ascent: -box.y1,
          left: box.x1,
          advance,
        };
  if (cache.size > 800) cache.clear();
  cache.set(key, result);
  return result;
}

/** Vorschub eines Textes (mit Laufweite und zusaetzlichem Wortabstand) (`o4`, Export `aC`). */
export function textAdvance(
  font: Font,
  text: string,
  size: number,
  tracking = 0,
  fallbacks: Font[] = [],
): number {
  const t = normalizeText(text);
  const parts = runs(font, t, fallbacks);
  const extra =
    (t.match(/ /g) ?? []).length * wordSpaceExtra(font, t, size, tracking);
  return parts.length <= 1 && (!parts.length || parts[0]!.font === font)
    ? font.getAdvanceWidth(t, size, {
        kerning: true,
        letterSpacing: tracking,
      }) + extra
    : runsAdvance(font, parts, size, tracking) + extra;
}

/**
 * Zusaetzlicher Wortabstand bei mehreren Woertern: Ziel ein Drittel der
 * Versalhoehe (bei Versalsatz die Haelfte), abzueglich normalem Leerzeichen.
 */
function wordSpaceExtra(
  font: Font,
  text: string,
  size: number,
  tracking: number,
): number {
  if (!text.includes(" ") || !text.trim().includes(" ")) return 0;
  const upper = /\p{L}/u.test(text) && text === text.toLocaleUpperCase("de-AT");
  const target =
    capHeight(font, size) * (upper ? 0.5 : 0.33) - Math.min(0, tracking) * size;
  const space = font.getAdvanceWidth(" ", size, { letterSpacing: tracking });
  return Math.max(0, target - space);
}

function spacedPath(
  font: Font,
  text: string,
  fallbacks: Font[],
  x: number,
  y: number,
  size: number,
  tracking: number,
  extra: number,
): Path {
  const path = new Path();
  let cx = x;
  const words = text.split(" ");
  words.forEach((word, i) => {
    if (word) {
      const parts = runs(font, word, fallbacks);
      path.extend(runsPath(font, parts, cx, y, size, tracking));
      cx +=
        parts.length <= 1 && (!parts.length || parts[0]!.font === font)
          ? font.getAdvanceWidth(word, size, {
              kerning: true,
              letterSpacing: tracking,
            })
          : runsAdvance(font, parts, size, tracking);
    }
    if (i < words.length - 1)
      cx +=
        font.getAdvanceWidth(" ", size, { letterSpacing: tracking }) + extra;
  });
  return path;
}

/** Versalhoehe bei Groesse `size` (OS/2 sCapHeight, sonst 70 % der Oberlaenge) (`ai`, Export `aA`). */
export function capHeight(font: Font, size: number): number {
  const os2 = font.tables.os2 as { sCapHeight?: number } | undefined;
  return ((os2?.sCapHeight || font.ascender * 0.7) / font.unitsPerEm) * size;
}
