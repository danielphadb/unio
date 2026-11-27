/**
 * Gezeichnete Monogramme aus zwei Initialen: Konstruktionen Stamm, Ligatur, Verschraenkt, Negativ
 * (`KONSTRUKTIONEN_AUS`: in der gesicherten Fassung abgeschaltet) (index `Y4` ... `rT`).
 */
import type { Font } from "opentype.js";
import type { Geom } from "./types";
import {
  difference,
  dilateGeom,
  geomArea,
  geomBounds,
  geomCentroid,
  geomToPath,
  intersection,
  minStroke,
  rectGeom,
  scaleGeom,
  scanRow,
  textGeom,
  translateGeom,
  union,
  xor,
} from "./boolean";

export const KONSTRUKTIONEN = ["stamm", "ligatur", "verschraenkt", "negativ"];

const CAP = 100;

const FAVICON_PX = 16 * 0.8;

function capRatio(font: Font) {
  const t = font.getPath("H", 0, 0, 1e3).getBoundingBox();
  return t.y2 - t.y1 > 0 ? (t.y2 - t.y1) / 1e3 : 0.7;
}

function letterGeom(font: Font, letter: string, size: number) {
  const r = textGeom(font, letter, 0, 0, size);
  const s = geomBounds(r);
  return !s || !r.length
    ? null
    : {
        g: r,
        l: s.x,
        r: s.x + s.w,
        w: s.w,
        a: geomArea(r),
      };
}

function stemOf(letter: any, side: string) {
  const n = [];
  for (const a of [0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.8]) {
    const o = scanRow(letter.g, -CAP * a);
    if (!o.length) return null;
    n.push(side === "links" ? o[0] : o[o.length - 1]);
  }
  const r = n.map((a) => (side === "links" ? a![0] : a![1]));
  if (Math.max(...(r as number[])) - Math.min(...(r as number[])) > CAP * 0.03)
    return null;
  const s =
    side === "links"
      ? Math.min(...(r as number[]))
      : Math.max(...(r as number[]));
  if (Math.abs(s - (side === "links" ? letter.l : letter.r)) > CAP * 0.04)
    return null;
  const i = Math.min(...n.map((a) => a![1]! - a![0]!));
  return i <= 0 || i > CAP * 0.28
    ? null
    : side === "links"
      ? {
          x0: s,
          x1: s + i,
        }
      : {
          x0: s - i,
          x1: s,
        };
}

function pairContact(left: any, right: any, dx: number) {
  let r = Infinity;
  const s = [];
  for (let a = 1; a < 40; a++) {
    const o = -CAP * (a / 40);
    const l = scanRow(left.g, o);
    const u = scanRow(right.g, o);
    if (!l.length || !u.length) continue;
    const c = u[0]![0]! + dx - l[l.length - 1]![1]!;
    s.push(c);
    r = Math.min(r, c);
  }
  const i = s.filter((a) => a < r + CAP * 0.025).length / 39;
  return {
    min: r,
    contact: i,
  };
}

const partCount = (geom: Geom) => geom.length;

const ROUND_LETTERS = ["C", "D", "G", "O", "Q", "S", "U"];

/** Gezeichnetes Monogramm aus zwei Initialen fuer eine Konstruktion, mit Mindestgroesse (`bg`). */
export function drawnMonogram(
  font: Font,
  letters: string,
  konstruktion: string,
) {
  const chars = Array.from(
    letters.replace(/\s+/g, "").toLocaleUpperCase("de-AT"),
  );
  if (chars.length !== 2 || !chars.every((p) => /^[A-Z]$/.test(p))) return null;
  const scale = CAP / capRatio(font);
  const first = letterGeom(font, chars[0]!, scale);
  const second = letterGeom(font, chars[1]!, scale);
  if (!first || !second) return null;
  const minWidth = Math.min(first.w, second.w);
  const minArea = Math.min(first.a, second.a);
  let geom = null;
  if (konstruktion === "stamm") {
    const p = stemOf(first, "rechts");
    const g = stemOf(second, "links");
    if (!p || !g || Math.abs(p.x1 - p.x0 - (g.x1 - g.x0)) > CAP * 0.05)
      return null;
    const v = p.x0 - g.x0;
    const S = translateGeom(second.g, v, 0);
    if (
      geomArea(difference(first.g, S)) < first.a * 0.4 ||
      geomArea(difference(S, first.g)) < second.a * 0.4
    )
      return null;
    geom = union(first.g, S);
  } else if (konstruktion === "ligatur") {
    const p = first.r - second.l;
    const g = pairContact(first, second, p);
    const v = p - g.min - CAP * 0.03;
    const S = pairContact(first, second, v);
    if (!(S.contact > 0.03 && S.contact <= 0.34)) return null;
    const b = translateGeom(second.g, v, 0);
    if (
      geomArea(difference(first.g, b)) < first.a * 0.8 ||
      geomArea(difference(b, first.g)) < second.a * 0.8 ||
      ((geom = union(first.g, b)),
      partCount(geom) > partCount(first.g) + partCount(second.g) - 1)
    )
      return null;
  } else if (konstruktion === "verschraenkt" || konstruktion === "negativ") {
    const p = konstruktion === "verschraenkt" ? 0.34 : 0.45;
    const g = first.r - p * minWidth - second.l;
    const v = translateGeom(second.g, g, 0);
    const S = geomArea(intersection(first.g, v));
    if (konstruktion === "verschraenkt") {
      if (
        !chars.some((q) => ROUND_LETTERS.includes(q)) ||
        S < minArea * 0.03 ||
        minWidth < CAP * 0.45
      )
        return null;
      const b = CAP * 0.05;
      const L = -CAP / 2;
      const T = rectGeom(-1e4, -1e4, 2e4, 1e4 + L);
      const E = rectGeom(-1e4, L, 2e4, 2e4);
      const I = union(first.g, difference(v, dilateGeom(first.g, b)));
      const P = union(v, difference(first.g, dilateGeom(v, b)));
      geom = union(intersection(I, T), intersection(P, E));
    } else {
      if (
        S < minArea * 0.06 ||
        S > minArea * 0.35 ||
        partCount(intersection(first.g, v)) > 2
      )
        return null;
      geom = xor(first.g, v);
    }
  }
  if (!geom || !geom.length) return null;
  const bounds = geomBounds(geom);
  if (!bounds) return null;
  const [centroidX] = geomCentroid(geom);
  const centerX = (bounds.x + bounds.w / 2 + centroidX!) / 2;
  const placed = translateGeom(geom, -(centerX - bounds.w / 2), -bounds.y);
  const stroke = minStroke(placed);
  const gap =
    konstruktion === "verschraenkt" || konstruktion === "negativ"
      ? minStroke(placed, true)
      : Infinity;
  const minPx =
    (Math.max(1 / stroke!, gap === Infinity ? 0 : 0.8 / gap!) *
      Math.max(bounds.w, bounds.h)) /
    0.8;
  return {
    minPx: Math.round(minPx * 10) / 10,
    konstruktion,
    geom: placed,
    d: geomToPath(placed),
    w: bounds.w,
    h: bounds.h,
    strich: stroke,
    luecke: gap,
    favicon: minPx <= FAVICON_PX / 0.8,
  };
}

const MAX_MIN_PX = 48;

export const KONSTRUKTIONEN_AUS = ["negativ", "verschraenkt"];

export function availableKonstruktionen(font: Font, letters: string) {
  let n = konstruktionCache.get(font);
  if (!n) {
    konstruktionCache.set(font, (n = new Map()));
  }
  const r = n.get(letters);
  if (r) return r;
  const s = KONSTRUKTIONEN.filter(
    (i) => !KONSTRUKTIONEN_AUS.includes(i),
  ).filter((i) => {
    const a = drawnMonogram(font, letters, i);
    return !!a && a.minPx <= MAX_MIN_PX;
  });
  n.set(letters, s);
  return s;
}

const konstruktionCache = new WeakMap();

const drawnCache = new Map();

export function drawnMonogramSvg(
  font: Font,
  fontId: string,
  letters: string,
  box: any,
  fill: string,
  konstruktion: string,
) {
  const a = `${fontId}|${letters}|${konstruktion}`;
  let o = drawnCache.get(a);
  if (o === undefined) {
    o = drawnMonogram(font, letters, konstruktion);
    if (drawnCache.size > 500) {
      drawnCache.clear();
    }
    drawnCache.set(a, o);
  }
  if (!o) return "";
  const l = Math.min((box.w * 0.86) / o.w, (box.h * 0.62) / o.h);
  const u = box.x + (box.w - o.w * l) / 2;
  const c = box.y + (box.h - o.h * l) / 2;
  return `<path d="${geomToPath(translateGeom(scaleGeom(o.geom, l), u, c), 0.12 * l)}" fill="${fill}"/>`;
}
