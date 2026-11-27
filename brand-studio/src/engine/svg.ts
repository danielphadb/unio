/**
 * SVG-Helfer (svg-Chunk): Zahlen formatieren, Dokument bauen, Teile platzieren,
 * und die Ausdehnung (Bounding Box) eines SVG-Ausschnitts schaetzen.
 *
 * Bitgenau wie die gesicherte Fassung (die Ausgaben stehen in den Referenz-SVGs).
 */
import { safeHex } from "./color";

/** Ein gezeichneter Teil: SVG-Inhalt ohne `<svg>` mit seiner Groesse. */
export interface SvgPart {
  body: string;
  width: number;
  height: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SvgDocumentOptions {
  /** Rand um den Inhalt (in Einheiten des Inhalts) */
  padding?: number;
  width?: number;
  height?: number;
  /** Hexfarbe fuer eine volle Hintergrundflaeche */
  background?: string;
}

/** Zahl mit hoechstens `digits` Nachkommastellen, ohne Nullen am Ende (`D`, Export `n`). */
export function fmt(value: number, digits = 2): string {
  const s = value.toFixed(digits);
  return s.includes(".") ? s.replace(/\.?0+$/, "") || "0" : s;
}

/** Vollstaendiges SVG-Dokument (`wt`, Export `t`). */
export function svgDocument(
  part: SvgPart,
  opts: SvgDocumentOptions = {},
): string {
  const pad = opts.padding ?? 0;
  const vw = Math.max(part.width + pad * 2, 0.01);
  const vh = Math.max(part.height + pad * 2, 0.01);
  let w = opts.width;
  let h = opts.height;
  if (w && !h) h = (w * vh) / vw;
  if (h && !w) w = (h * vw) / vh;
  const size = w && h ? ` width="${fmt(w)}" height="${fmt(h)}"` : "";
  const bg =
    typeof opts.background == "string" &&
    /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(opts.background.trim())
      ? `<rect x="0" y="0" width="${fmt(vw)}" height="${fmt(vh)}" fill="${safeHex(opts.background)}"/>`
      : "";
  const body = pad
    ? `<g transform="translate(${fmt(pad)} ${fmt(pad)})">${part.body}</g>`
    : part.body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(vw)} ${fmt(vh)}"${size}>${bg}${body}</svg>`;
}

/** Teil verschoben und skaliert als `<g>` (leer bei leerem Teil) (`Mt`, Export `q`). */
export function placePart(
  part: Pick<SvgPart, "body">,
  x: number,
  y: number,
  scale = 1,
): string {
  return part.body
    ? `<g transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(scale, 5)})">${part.body}</g>`
    : "";
}

// ---------------------------------------------------------------------------
// Bounding Box eines SVG-Ausschnitts (fuer Signature-Vorlagen und Symbole)

/** Affine Matrix [a, b, c, d, e, f] wie in SVG. */
export type Matrix = [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

/** `transform`-Attribut zu einer Matrix (`mt`). */
export function parseTransform(value: string | undefined): Matrix {
  if (!value) return IDENTITY;
  let m = IDENTITY;
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value))) {
    const a = (match[2] as string)
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    let t = IDENTITY;
    switch (match[1]) {
      case "matrix":
        t = [a[0], a[1], a[2], a[3], a[4], a[5]] as Matrix;
        break;
      case "translate":
        t = [1, 0, 0, 1, a[0] || 0, a[1] || 0];
        break;
      case "scale":
        t = [a[0] as number, 0, 0, (a[1] ?? a[0]) as number, 0, 0];
        break;
      case "rotate": {
        const rad = ((a[0] || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const cx = a[1] || 0;
        const cy = a[2] || 0;
        t = multiply(
          multiply([1, 0, 0, 1, cx, cy], [cos, sin, -sin, cos, 0, 0]),
          [1, 0, 0, 1, -cx, -cy],
        );
        break;
      }
      case "skewX":
        t = [1, 0, Math.tan(((a[0] || 0) * Math.PI) / 180), 1, 0, 0];
        break;
      case "skewY":
        t = [1, Math.tan(((a[0] || 0) * Math.PI) / 180), 0, 1, 0, 0];
        break;
    }
    m = multiply(m, t);
  }
  return m;
}

/** Attribute eines Tags, `style`-Eintraege werden als Attribute uebernommen (`pt`). */
export function parseAttributes(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)))
    out[match[1] as string] = match[3] ?? match[4] ?? "";
  if (out.style)
    for (const decl of out.style.split(";")) {
      const [k, v] = decl.split(":").map((s) => s?.trim());
      if (k && v) out[k] = v;
    }
  return out;
}

type Point = [number, number];

/** Punkte entlang eines Pfads (Kurven abgetastet: kubisch 10, quadratisch 8 Schritte) (`ft`). */
export function pathPoints(d: string): Point[] {
  const pts: Point[] = [];
  const tokens =
    d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) ?? [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let cx = 0;
  let cy = 0;
  const num = () => Number(tokens[i++]);
  const hasNumber = () =>
    i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i] as string);
  const cubic = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ) => {
    for (let k = 1; k <= 10; k++) {
      const t = k / 10;
      const u = 1 - t;
      pts.push([
        u * u * u * x +
          3 * u * u * t * x1 +
          3 * u * t * t * x2 +
          t * t * t * x3,
        u * u * u * y +
          3 * u * u * t * y1 +
          3 * u * t * t * y2 +
          t * t * t * y3,
      ]);
    }
  };
  const quad = (x1: number, y1: number, x2: number, y2: number) => {
    for (let k = 1; k <= 8; k++) {
      const t = k / 8;
      const u = 1 - t;
      pts.push([
        u * u * x + 2 * u * t * x1 + t * t * x2,
        u * u * y + 2 * u * t * y1 + t * t * y2,
      ]);
    }
  };
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i] as string)) cmd = tokens[i++] as string;
    else if (!cmd) break;
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case "M":
        x = ox + num();
        y = oy + num();
        sx = x;
        sy = y;
        pts.push([x, y]);
        cmd = rel ? "l" : "L";
        cx = x;
        cy = y;
        break;
      case "L":
        x = ox + num();
        y = oy + num();
        pts.push([x, y]);
        cx = x;
        cy = y;
        break;
      case "H":
        x = ox + num();
        pts.push([x, y]);
        cx = x;
        cy = y;
        break;
      case "V":
        y = oy + num();
        pts.push([x, y]);
        cx = x;
        cy = y;
        break;
      case "C": {
        const x1 = ox + num();
        const y1 = oy + num();
        const x2 = ox + num();
        const y2 = oy + num();
        const x3 = ox + num();
        const y3 = oy + num();
        cubic(x1, y1, x2, y2, x3, y3);
        cx = x2;
        cy = y2;
        x = x3;
        y = y3;
        break;
      }
      case "S": {
        const x1 = 2 * x - cx;
        const y1 = 2 * y - cy;
        const x2 = ox + num();
        const y2 = oy + num();
        const x3 = ox + num();
        const y3 = oy + num();
        cubic(x1, y1, x2, y2, x3, y3);
        cx = x2;
        cy = y2;
        x = x3;
        y = y3;
        break;
      }
      case "Q": {
        const x1 = ox + num();
        const y1 = oy + num();
        const x2 = ox + num();
        const y2 = oy + num();
        quad(x1, y1, x2, y2);
        cx = x1;
        cy = y1;
        x = x2;
        y = y2;
        break;
      }
      case "T": {
        const x1 = 2 * x - cx;
        const y1 = 2 * y - cy;
        const x2 = ox + num();
        const y2 = oy + num();
        quad(x1, y1, x2, y2);
        cx = x1;
        cy = y1;
        x = x2;
        y = y2;
        break;
      }
      case "A": {
        const rx = Math.abs(num());
        const ry = Math.abs(num());
        const rot = num();
        const large = num();
        const sweep = num();
        const x2 = ox + num();
        const y2 = oy + num();
        arcPoints(x, y, rx, ry, rot, !!large, !!sweep, x2, y2, pts);
        x = x2;
        y = y2;
        cx = x;
        cy = y;
        break;
      }
      case "Z":
        x = sx;
        y = sy;
        cx = x;
        cy = y;
        break;
      default:
        i++;
    }
    if (cmd.toUpperCase() === "Z" && hasNumber()) cmd = "L";
  }
  return pts.filter(([px, py]) => isFinite(px) && isFinite(py));
}

/** Bogen (Endpunkt-Form nach SVG 1.1, F.6.5) in Punkte zerlegt, 15-Grad-Schritte (`Ft`). */
export function arcPoints(
  x1: number,
  y1: number,
  rx0: number,
  ry0: number,
  rotation: number,
  large: boolean,
  sweep: boolean,
  x2: number,
  y2: number,
  out: Point[],
): void {
  let rx = rx0;
  let ry = ry0;
  if (!rx || !ry) {
    out.push([x2, y2]);
    return;
  }
  const phi = (rotation * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const px = cos * dx + sin * dy;
  const py = -sin * dx + cos * dy;
  const lambda = (px * px) / (rx * rx) + (py * py) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * py * py - ry * ry * px * px;
  const den = rx * rx * py * py + ry * ry * px * px;
  let coef = Math.sqrt(Math.max(0, num / den));
  if (large === sweep) coef = -coef;
  const cxp = (coef * rx * py) / ry;
  const cyp = (-coef * ry * px) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const start = angle(1, 0, (px - cxp) / rx, (py - cyp) / ry);
  let delta = angle(
    (px - cxp) / rx,
    (py - cyp) / ry,
    (-px - cxp) / rx,
    (-py - cyp) / ry,
  );
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  const steps = Math.max(4, Math.ceil(Math.abs(delta) / (Math.PI / 12)));
  for (let k = 1; k <= steps; k++) {
    const a = start + (delta * k) / steps;
    const ex = rx * Math.cos(a);
    const ey = ry * Math.sin(a);
    out.push([cos * ex - sin * ey + cx, sin * ex + cos * ey + cy]);
  }
}

interface DrawState {
  m: Matrix;
  fill: string;
  stroke: string;
  sw: number;
  opacity: number;
}

/**
 * Ausdehnung eines SVG-Ausschnitts (Pfade, Kreise, Ellipsen, Rechtecke, Linien,
 * Polygone), mit Gruppen-Transformationen, Konturbreite und Deckkraft; `null`
 * wenn nichts Sichtbares (`xt`, Export `r`).
 */
export function svgBounds(svg: string): Box | null {
  let minX = 1 / 0;
  let minY = 1 / 0;
  let maxX = -1 / 0;
  let maxY = -1 / 0;
  const stack: DrawState[] = [
    { m: IDENTITY, fill: "#000", stroke: "none", sw: 1, opacity: 1 },
  ];
  const re = /<\s*(\/)?\s*([a-zA-Z]+)([^>]*?)(\/)?\s*>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg))) {
    const [, closing, tag, rest, selfClosing] = match as unknown as [
      string,
      string | undefined,
      string,
      string,
      string | undefined,
    ];
    if (closing) {
      if (tag === "g" && stack.length > 1) stack.pop();
      continue;
    }
    const attrs = parseAttributes(rest);
    const parent = stack[stack.length - 1] as DrawState;
    const state: DrawState = {
      m: multiply(parent.m, parseTransform(attrs.transform)),
      fill: attrs.fill ?? parent.fill,
      stroke: attrs.stroke ?? parent.stroke,
      sw:
        attrs["stroke-width"] !== undefined
          ? Number(attrs["stroke-width"])
          : parent.sw,
      opacity:
        parent.opacity *
        (attrs.opacity !== undefined ? Number(attrs.opacity) : 1),
    };
    if (tag === "g") {
      if (!selfClosing) stack.push(state);
      continue;
    }
    if (state.opacity <= 0) continue;
    const stroked =
      state.stroke !== "none" && state.stroke !== "transparent" && state.sw > 0;
    const filled = state.fill !== "none" && state.fill !== "transparent";
    if (!stroked && !filled) continue;
    const n = (key: string, fallback = 0) =>
      attrs[key] !== undefined ? Number(attrs[key]) : fallback;
    let pts: Point[] = [];
    switch (tag) {
      case "path":
        pts = pathPoints(attrs.d ?? "");
        break;
      case "circle":
      case "ellipse": {
        const rx = n(tag === "circle" ? "r" : "rx");
        const ry = n(tag === "circle" ? "r" : "ry");
        const cx = n("cx");
        const cy = n("cy");
        for (let k = 0; k < 24; k++) {
          const a = (k / 24) * Math.PI * 2;
          pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
        }
        break;
      }
      case "rect": {
        const x = n("x");
        const y = n("y");
        const w = n("width");
        const h = n("height");
        pts = [
          [x, y],
          [x + w, y],
          [x + w, y + h],
          [x, y + h],
        ];
        break;
      }
      case "line":
        pts = [
          [n("x1"), n("y1")],
          [n("x2"), n("y2")],
        ];
        break;
      case "polygon":
      case "polyline": {
        const nums = (attrs.points ?? "")
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number);
        for (let k = 0; k + 1 < nums.length; k += 2)
          pts.push([nums[k] as number, nums[k + 1] as number]);
        break;
      }
      default:
        continue;
    }
    if (!pts.length) continue;
    let x0 = 1 / 0;
    let y0 = 1 / 0;
    let x1 = -1 / 0;
    let y1 = -1 / 0;
    for (const [px, py] of pts) {
      x0 = Math.min(x0, px);
      y0 = Math.min(y0, py);
      x1 = Math.max(x1, px);
      y1 = Math.max(y1, py);
    }
    const half = stroked ? state.sw / 2 : 0;
    const m = state.m;
    const corners: Point[] =
      m[1] === 0 && m[2] === 0
        ? [
            [x0 - half, y0 - half],
            [x1 + half, y1 + half],
          ]
        : pts.flatMap(([px, py]): Point[] => [
            [px - half, py - half],
            [px + half, py + half],
            [px - half, py + half],
            [px + half, py - half],
          ]);
    for (const [px, py] of corners) {
      const tx = m[0] * px + m[2] * py + m[4];
      const ty = m[1] * px + m[3] * py + m[5];
      minX = Math.min(minX, tx);
      minY = Math.min(minY, ty);
      maxX = Math.max(maxX, tx);
      maxY = Math.max(maxY, ty);
    }
  }
  return !isFinite(minX) || maxX - minX <= 0 || maxY - minY <= 0
    ? null
    : { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Anzahl der Zeichenelemente in einem SVG-Ausschnitt (`Ct`, Export `v`). */
export function countShapes(svg: string): number {
  return (
    svg.match(/<\s*(path|circle|ellipse|rect|line|polygon|polyline)\b/g) ?? []
  ).length;
}
