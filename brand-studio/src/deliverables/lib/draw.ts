/**
 * Zeichnen fuer Unterlagen und Postings (imagesize-Chunk der gesicherten Fassung): Text als Pfad
 * mit Ersatzschrift je Zeichen, Umbruch, SVG-Dokument, Formen, Bilder, Beschnitt und Schnittmarken.
 */
import type { Font } from "opentype.js";
import type { DrawnText, FontRun, ParagraphOptions, SvgDocOptions, TextOptions } from "./drawTypes";
import { capHeight, textAdvance, textPath, type TextPath } from "../../engine/text";
import { fmt } from "../../engine/svg";
import { safeFill } from "./colors";

/** 6 pt in mm (`Y`, Export `C`). */
export const PT6 = 6 * 0.3528;
/** 7 pt in mm (`J`, Export `B`). */
export const PT7 = 7 * 0.3528;
/** 8 pt in mm (`K`, Export `P`). */
export const PT8 = 8 * 0.3528;
/** Groesse, in der Textpfade zwischengespeichert werden (`b`). */
export const UNITS = 200;
/** Textpfade je Schrift (`A`). */
export const pathCache = new WeakMap<Font, Map<string, TextPath>>();
/** Ersatzschrift je Schrift (latin-ext) (`j`). */
export const fallbackFonts = new WeakMap<Font, Font>();
/** Ersatzschrift fuer fehlende Zeichen setzen (`Q`, Export `r`). */
export function setFallbackFont(font: Font, fallback: Font) {
  if (font !== fallback) {
    fallbackFonts.set(font, fallback);
  }
}
/** Schrift hat ein Zeichen fuer ch (`x`). */
export const hasGlyph = (font: Font, ch: string) =>
  ch.trim() === "" || font.charToGlyphIndex(ch) > 0;
/** Text in Abschnitte je Schrift zerlegen (`B`). */
export function fontRuns(font: Font, text: string): FontRun[] {
  const fallback = fallbackFonts.get(font);
  if (!fallback || [...text].every((ch) => hasGlyph(font, ch))) return [{ font, text }];
  const runs: FontRun[] = [];
  for (const ch of text) {
    const use = hasGlyph(font, ch) || !hasGlyph(fallback, ch) ? font : fallback;
    const last = runs[runs.length - 1];
    if (last && last.font === use) {
      last.text += ch;
    } else {
      runs.push({ font: use, text: ch });
    }
  }
  return runs;
}
/** Textpfad aus dem Zwischenspeicher (`z`). */
export function cachedPath(font: Font, text: string, tracking: number) {
  let cache = pathCache.get(font);
  if (!cache) {
    cache = new Map<string, TextPath>();
    pathCache.set(font, cache);
  }
  const key = `${tracking}|${text}`;
  let path = cache.get(key);
  if (!path) {
    path = textPath(font, text, UNITS, tracking);
    cache.set(key, path);
  }
  return path;
}
/** Breite eines Textes (`F`, Export `i`). */
export function measureText(font: Font, text: string, size: number, tracking: number = 0) {
  return fontRuns(font, text).length === 1
    ? (cachedPath(font, text, tracking).width * size) / UNITS
    : drawText(font, text, { x: 0, y: 0, size, fill: "#000", tracking }).width;
}
/** Text als SVG-Pfad (`d`, Export `m`). */
export function drawText(font: Font, text: string, opts: TextOptions): DrawnText {
  const runs = fontRuns(font, text);
  if (runs.length > 1) return drawRuns(runs, opts);
  const path = cachedPath(font, text, opts.tracking ?? 0);
  const scale = opts.size / UNITS;
  const width = path.width * scale;
  if (!path.d) return { svg: "", width: 0, ascent: 0, descent: 0 };
  const x =
    opts.anchor === "middle" ? opts.x - width / 2 : opts.anchor === "end" ? opts.x - width : opts.x;
  const y = opts.y - path.ascent * scale;
  const opacity =
    opts.opacity !== undefined && opts.opacity < 1 ? ` opacity="${fmt(opts.opacity)}"` : "";
  return {
    svg: `<path transform="translate(${fmt(x, 3)} ${fmt(y, 3)}) scale(${fmt(scale, 6)})" d="${path.d}" fill="${safeFill(opts.fill)}"${opacity}/>`,
    width,
    ascent: path.ascent * scale,
    descent: (path.height - path.ascent) * scale,
  };
}
/** Text mit mehreren Schriften als SVG (`V`). */
export function drawRuns(runs: FontRun[], opts: TextOptions): DrawnText {
  const tracking = opts.tracking ?? 0;
  const parts: Array<{ svg: string; asc: number; desc: number }> = [];
  let pen = 0;
  let start = 0;
  let end = 0;
  runs.forEach((run, index) => {
    const advance = textAdvance(run.font, run.text, opts.size, tracking);
    const box = run.font
      .getPath(run.text, 0, 0, opts.size, { kerning: true, letterSpacing: tracking })
      .getBoundingBox();
    const drawn = drawText(run.font, run.text, { ...opts, x: 0, y: 0, anchor: "start" });
    if (drawn.svg) {
      const offset = isFinite(box.x1) ? box.x1 : 0;
      if (index === 0) {
        start = pen + offset;
      }
      end = pen + offset + drawn.width;
      parts.push({
        svg: `<g transform="translate(${fmt(pen + offset, 4)} 0)">${drawn.svg}</g>`,
        asc: drawn.ascent,
        desc: drawn.descent,
      });
    }
    pen += advance;
  });
  const width = end - start;
  const x =
    (opts.anchor === "middle"
      ? opts.x - width / 2
      : opts.anchor === "end"
        ? opts.x - width
        : opts.x) - start;
  return {
    svg: `<g transform="translate(${fmt(x, 3)} ${fmt(opts.y, 3)})">${parts.map((run) => run.svg).join("")}</g>`,
    width,
    ascent: Math.max(0, ...parts.map((run) => run.asc)),
    descent: Math.max(0, ...parts.map((run) => run.desc)),
  };
}
/** Schriftgroesse, damit der Text in maxWidth passt (nicht unter minSize) (`tt`, Export `p`). */
export function fitFontSize(
  font: Font,
  text: string,
  maxWidth: number,
  size: number,
  tracking: number = 0,
  minSize: number = size * 0.4,
) {
  const width = measureText(font, text, size, tracking);
  return width <= maxWidth || width === 0 ? size : Math.max(minSize, (size * maxWidth) / width);
}
/** Text in Zeilen umbrechen (`W`, Export `w`). */
export function wrapLines(
  font: Font,
  text: string,
  size: number,
  maxWidth: number,
  tracking: number = 0,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measureText(font, next, size, tracking) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}
/** Versalhoehe bei der Groesse (`nt`, Export `c`). */
export const capHeightOf = (font: Font, size: number) => capHeight(font, size);
/** Text in Versalien mit Laufweite 0,14 (`et`, Export `k`). */
export function capsLabel(
  font: Font,
  text: string,
  opts: Omit<TextOptions, "tracking"> & { tracking?: number },
) {
  return drawText(font, text.toLocaleUpperCase("de-AT"), { tracking: 0.14, ...opts });
}
/** Absatz mit Umbruch (`st`, Export `x`). */
export function paragraph(font: Font, text: string, opts: ParagraphOptions) {
  const leading = opts.leading ?? opts.size * 1.45;
  const lines = text
    .split(
      `
`,
    )
    .flatMap((line) =>
      line.trim() ? wrapLines(font, line, opts.size, opts.maxWidth, opts.tracking ?? 0) : [""],
    );
  let svg = "";
  lines.forEach((line, index) => {
    if (line) {
      svg += drawText(font, line, { ...opts, y: opts.y + index * leading }).svg;
    }
  });
  return { svg, h: (lines.length - 1) * leading, lines: lines.length };
}
/** XML maskieren (`m`). */
export const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** wie escapeXml (`it`, Export `t`). */
export const esc = escapeXml;
/** SVG-Dokument (px oder mm) (`H`, Export `n`). */
export function svgDoc(w: number, h: number, body: string, opts: SvgDocOptions = {}) {
  const size =
    (opts.unit ?? "px") === "mm"
      ? ` width="${fmt(w)}mm" height="${fmt(h)}mm"`
      : ` width="${fmt(w)}" height="${fmt(h)}"`;
  const title = opts.title ? `<title>${escapeXml(opts.title)}</title>` : "";
  const defs = opts.defs ? `<defs>${opts.defs}</defs>` : "";
  const background = opts.background
    ? `<rect x="0" y="0" width="${fmt(w)}" height="${fmt(h)}" fill="${safeFill(opts.background)}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${fmt(w)} ${fmt(h)}"${size}>${title}${defs}${background}${body}</svg>`;
}
/** viewBox eines SVG (`I`). */
export function viewBoxOf(svg: string): { x: number; y: number; w: number; h: number } | null {
  const m = svg.match(/<svg\b[^>]*\bviewBox="([^"]+)"/);
  if (!m) return null;
  const [x, y, w, h] = m[1]!.split(/[\s,]+/).map(Number) as [number, number, number, number];
  return { x, y, w, h };
}
/** Breite und Hoehe eines SVG setzen (`rt`, Export `s`). */
export function resizeSvg(svg: string, w: number, h: number) {
  return svg.replace(
    /<svg\b([^>]*)>/,
    (_tag, attrs) =>
      `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")} width="${fmt(w)}" height="${fmt(h)}">`,
  );
}
/** Zaehler der laufenden IDs (`v`). */
export let idCounter = 0;
/** Laufende ID mit Praefix (Basis 36) (`T`, Export `u`). */
export function uid(prefix: string) {
  idCounter = (idCounter + 1) % 1000000000;
  return `${prefix}${idCounter.toString(36)}`;
}
/** Rechteck (`ct`, Export `f`). */
export const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  attrs: string = "",
) =>
  `<rect x="${fmt(x, 3)}" y="${fmt(y, 3)}" width="${fmt(w, 3)}" height="${fmt(h, 3)}" fill="${safeFill(fill)}"${attrs ? " " + attrs : ""}/>`;
/** Waagrechte Linie (`P`, Export `o`). */
export const hLine = (
  x1: number,
  x2: number,
  y: number,
  stroke: string,
  width: number,
  attrs: string = "",
) =>
  `<line x1="${fmt(x1, 3)}" y1="${fmt(y, 3)}" x2="${fmt(x2, 3)}" y2="${fmt(y, 3)}" stroke="${safeFill(stroke)}" stroke-width="${fmt(width, 3)}"${attrs ? " " + attrs : ""}/>`;
/** Senkrechte Linie (`C`, Export `v`). */
export const vLine = (
  x: number,
  y1: number,
  y2: number,
  stroke: string,
  width: number,
  attrs: string = "",
) =>
  `<line x1="${fmt(x, 3)}" y1="${fmt(y1, 3)}" x2="${fmt(x, 3)}" y2="${fmt(y2, 3)}" stroke="${safeFill(stroke)}" stroke-width="${fmt(width, 3)}"${attrs ? " " + attrs : ""}/>`;
/** Kreis (`at`, Export `j`). */
export const circle = (cx: number, cy: number, r: number, fill: string, attrs: string = "") =>
  `<circle cx="${fmt(cx, 3)}" cy="${fmt(cy, 3)}" r="${fmt(r, 3)}" fill="${safeFill(fill)}"${attrs ? " " + attrs : ""}/>`;
/** Gruppe mit Transformation (`ot`, Export `D`). */
export const group = (transform: string, body: string) => `<g transform="${transform}">${body}</g>`;
/** Pfad eines abgerundeten Rechtecks (`lt`, Export `h`). */
export function roundedRectPath(x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.min(radius, w / 2, h / 2);
  return `M${fmt(x + r, 3)} ${fmt(y, 3)}H${fmt(x + w - r, 3)}A${fmt(r, 3)} ${fmt(r, 3)} 0 0 1 ${fmt(x + w, 3)} ${fmt(y + r, 3)}V${fmt(y + h - r, 3)}A${fmt(r, 3)} ${fmt(r, 3)} 0 0 1 ${fmt(x + w - r, 3)} ${fmt(y + h, 3)}H${fmt(x + r, 3)}A${fmt(r, 3)} ${fmt(r, 3)} 0 0 1 ${fmt(x, 3)} ${fmt(y + h - r, 3)}V${fmt(y + r, 3)}A${fmt(r, 3)} ${fmt(r, 3)} 0 0 1 ${fmt(x + r, 3)} ${fmt(y, 3)}Z`;
}
/** Schnittmarken (`$t`, Export `E`). */
export function cropMarks(
  x: number,
  y: number,
  w: number,
  h: number,
  bleed: number,
  length = 5,
  gap = 1,
  stroke = 0.25,
) {
  const offset = bleed + gap;
  const color = "#000000";
  const out = [];
  for (const v of [x, x + w])
    out.push(
      vLine(v, y - offset - length, y - offset, color, stroke),
      vLine(v, y + h + offset, y + h + offset + length, color, stroke),
    );
  for (const v of [y, y + h])
    out.push(
      hLine(x - offset - length, x - offset, v, color, stroke),
      hLine(x + w + offset, x + w + offset + length, v, color, stroke),
    );
  return out.join("");
}
/** Bild (nur PNG, JPEG, WebP als data-URL) (`ut`, Export `g`). */
export function imageTag(href: string, x: number, y: number, w: number, h: number, attrs = "") {
  return /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/.test(href)
    ? `<image x="${fmt(x, 3)}" y="${fmt(y, 3)}" width="${fmt(w, 3)}" height="${fmt(h, 3)}" preserveAspectRatio="xMidYMid slice" href="${escapeXml(href)}" xlink:href="${escapeXml(href)}"${attrs ? " " + attrs : ""}/>`
    : "";
}
/** SVG in Breite einbetten (mit Ausschnitt) (`ft`, Export `A`). */
export function embedSvg(svg: string, x: number, y: number, width: number) {
  const box = viewBoxOf(svg) ?? { x: 0, y: 0, w: 100, h: 100 };
  const inner = svg
    .replace(/^<svg\b[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title>[\s\S]*?<\/title>/, "");
  const scale = width / box.w;
  const clipId = uid("em");
  return {
    svg: `<g transform="translate(${fmt(x, 3)} ${fmt(y, 3)}) scale(${fmt(scale, 6)})"><defs><clipPath id="${clipId}"><rect x="${fmt(box.x)}" y="${fmt(box.y)}" width="${fmt(box.w)}" height="${fmt(box.h)}"/></clipPath></defs><g clip-path="url(#${clipId})">${inner}</g></g>`,
    h: box.h * scale,
  };
}
/** SVG in mm mit Beschnitt (`ht`, Export `F`). */
export function bleedDocument(w: number, h: number, bleed: number, body: string) {
  const clipId = uid("bd");
  const outerW = w + 2 * bleed;
  const outerH = h + 2 * bleed;
  return svgDoc(
    outerW,
    outerH,
    `<defs><clipPath id="${clipId}"><rect x="${fmt(-bleed)}" y="${fmt(-bleed)}" width="${fmt(outerW)}" height="${fmt(outerH)}"/></clipPath></defs><g transform="translate(${fmt(bleed)} ${fmt(bleed)})"><g clip-path="url(#${clipId})">${body}</g></g>`,
    { unit: "mm" },
  );
}

/** Zaehler der laufenden IDs setzen (Tests: gleicher Stand wie bei der Aufzeichnung). */
export function setIdCounter(value: number): void {
  idCounter = value;
}
