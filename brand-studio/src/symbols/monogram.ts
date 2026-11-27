/**
 * Monogramm aus einer Schrift: Buchstaben optisch ausgerichtet und unterschnitten (`fontMonogramSvg`,
 * index `p4`, Export `b0`) und Initialen aus einem Namen (`initialsOf`, index `ML`).
 */
import type { Font } from "opentype.js";
import { capHeight } from "../engine/text";

const GLYPH_SIZE = 100;

const PROFILE_ROWS = 24;

function sampleOutline(path: any) {
  const t = [];
  let n = 0;
  let r = 0;
  let s = 0;
  let i = 0;
  const a = (o: any, l: any) => {
    const u = Math.max(2, Math.ceil(l / 1.2));
    for (let c = 1; c <= u; c++) t.push(o(c / u));
  };
  for (const o of path.commands) {
    if (o.type === "M") {
      n = s = o.x;
      r = i = o.y;
      t.push([n, r]);
    } else if (o.type === "L" || o.type === "Z") {
      const l = o.type === "Z" ? s : o.x;
      const u = o.type === "Z" ? i : o.y;
      const c = n;
      const f = r;
      a(
        (d: any) => [c + (l - c) * d, f + (u - f) * d],
        Math.hypot(l - c, u - f),
      );
      n = l;
      r = u;
    } else if (o.type === "Q") {
      const l = n;
      const u = r;
      a(
        (c: any) => {
          const f = 1 - c;
          return [
            f * f * l + 2 * f * c * o.x1 + c * c * o.x,
            f * f * u + 2 * f * c * o.y1 + c * c * o.y,
          ];
        },
        Math.hypot(o.x1 - l, o.y1 - u) + Math.hypot(o.x - o.x1, o.y - o.y1),
      );
      n = o.x;
      r = o.y;
    } else if (o.type === "C") {
      const l = n;
      const u = r;
      a(
        (c: any) => {
          const f = 1 - c;
          return [
            f * f * f * l +
              3 * f * f * c * o.x1 +
              3 * f * c * c * o.x2 +
              c * c * c * o.x,
            f * f * f * u +
              3 * f * f * c * o.y1 +
              3 * f * c * c * o.y2 +
              c * c * c * o.y,
          ];
        },
        Math.hypot(o.x1 - l, o.y1 - u) +
          Math.hypot(o.x2 - o.x1, o.y2 - o.y1) +
          Math.hypot(o.x - o.x2, o.y - o.y2),
      );
      n = o.x;
      r = o.y;
    }
  }
  return t;
}

function glyphOutline(font: Font, ch: string) {
  const n = sampleOutline(font.getPath(ch, 0, 0, GLYPH_SIZE));
  if (!n.length)
    return {
      ch,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      pts: n,
    };
  let r = Infinity;
  let s = -Infinity;
  let i = Infinity;
  let a = -Infinity;
  for (const [o, l] of n) {
    r = Math.min(r, o!);
    s = Math.max(s, o!);
    i = Math.min(i, l!);
    a = Math.max(a, l!);
  }
  return {
    ch,
    minX: r,
    maxX: s,
    minY: i,
    maxY: a,
    pts: n,
  };
}

function sideProfile(glyph: any, cap: number, side: string) {
  const r = -cap * 1.02;
  const s = (cap * 1.04) / PROFILE_ROWS;
  const i = new Array(PROFILE_ROWS).fill(null);
  for (const [a, o] of glyph.pts) {
    const l = Math.floor((o - r) / s);
    if (l < 0 || l >= PROFILE_ROWS) continue;
    const u = i[l];
    if (u === null) {
      i[l] = a;
    } else {
      i[l] = side === "right" ? Math.max(u, a) : Math.min(u, a);
    }
  }
  return i;
}

const PAIR_GAP = {
  sans: {
    target: 0.14,
    min: 0.07,
  },
  display: {
    target: 0.11,
    min: 0.06,
  },
  serif: {
    target: 0.12,
    min: 0.045,
  },
  script: {
    target: -0.04,
    min: -0.3,
  },
};

function pairOffset(left: any, right: any, cap: number, cat: string) {
  const s = sideProfile(left, cap, "right");
  const i = sideProfile(right, cap, "left");
  const a = [];
  for (let f = 0; f < PROFILE_ROWS; f++) {
    const d = s[f];
    const h = i[f];
    if (d !== null && h !== null) {
      a.push(h - d);
    }
  }
  const o = (PAIR_GAP as Record<string, any>)[cat];
  if (a.length < 4) return left.maxX - right.minX + o.target * cap;
  const l = Math.min(...a);
  const u = a.reduce((f, d) => f + d, 0) / a.length;
  let c = o.target * cap - (0.5 * l + 0.5 * u);
  if (l + c < o.min * cap) {
    c = o.min * cap - l;
  }
  return c;
}

function firstTwoLetters(text: string) {
  return Array.from(text.replace(/\s+/g, ""))
    .slice(0, 2)
    .map((n) => n.toLocaleUpperCase("de-AT").charAt(0))
    .join("");
}

export function fontMonogramSvg(
  font: Font,
  letters: string,
  box: any,
  fill: string,
  cat: string = "sans",
) {
  const i = Array.from(firstTwoLetters(letters));
  if (!i.length) return "";
  const a = capHeight(font, GLYPH_SIZE);
  const o = i.map((I) => glyphOutline(font, I));
  const l = [0];
  if (o.length === 2) {
    l.push(pairOffset(o[0], o[1], a, cat));
  }
  let u = Infinity;
  let c = -Infinity;
  let f = Infinity;
  let d = -Infinity;
  o.forEach((I, P) => {
    if (I.pts.length) {
      u = Math.min(u, I.minX + l[P]!);
      c = Math.max(c, I.maxX + l[P]!);
      f = Math.min(f, I.minY);
      d = Math.max(d, I.maxY);
    }
  });
  if (!isFinite(u)) return "";
  let h = -a;
  let m = 0;
  if (cat === "script") {
    h = f;
    m = d;
  } else {
    if (f < -a * 1.1) {
      h = (-a + f) / 2;
    }
    if (d > a * 0.08) {
      m = d / 2;
    }
  }
  const x = m - h;
  const k = c - u;
  const p = d - f;
  const g = o.length === 1;
  const v = Math.min(
    (box.w * (g ? 0.72 : cat === "script" ? 0.92 : 0.84)) / k,
    (box.h * (g || cat === "script" ? 0.66 : 0.6)) / x,
    (box.h * 0.9) / p,
  );
  const S = box.x + box.w / 2;
  const b = box.y + box.h / 2;
  const L = S - ((u + c) / 2) * v;
  const T = b - ((h + m) / 2) * v;
  return `<path d="${o.map((I, P) => font.getPath(I.ch, L + l[P]! * v, T, GLYPH_SIZE * v).toPathData(2)).join("")}" fill="${fill}"/>`;
}

const LEGAL_WORDS = new Set([
  "gmbh",
  "mbh",
  "ag",
  "kg",
  "og",
  "eu",
  "e.u.",
  "gesmbh",
  "ges.m.b.h.",
  "co",
  "co.",
  "&",
  "und",
  "ltd",
  "inc",
  "se",
  "gbr",
  "ohg",
  "kgaa",
]);

const TITLE_WORDS = new Set([
  "dr",
  "dra",
  "drin",
  "mag",
  "maga",
  "mmaga",
  "ing",
  "inga",
  "di",
  "dipl",
  "prof",
  "mba",
  "msc",
  "bsc",
  "ba",
  "ma",
  "mmag",
  "dkfm",
  "kr",
  "ddr",
  "llm",
]);

export function initialsOf(text: string) {
  const t = text
    .split(/[\s,/+]+/)
    .map((r) => r.trim())
    .filter((r) => {
      if (!r) return false;
      const s = r.toLocaleLowerCase("de-AT").replace(/\.$/, "");
      return LEGAL_WORDS.has(s) ||
        LEGAL_WORDS.has(r.toLocaleLowerCase("de-AT")) ||
        TITLE_WORDS.has(s.replace(/\./g, ""))
        ? false
        : new RegExp("\\p{L}", "u").test(r);
    });
  const n = (r: any) => {
    const s = r.match(new RegExp("\\p{L}", "u"));
    return s ? s[0].toLocaleUpperCase("de-AT").charAt(0) : "";
  };
  if (!t.length) {
    const r = text.match(/[\p{L}\p{N}]/u);
    return r ? r[0].toLocaleUpperCase("de-AT").charAt(0) : "";
  }
  return t.length === 1 ? n(t[0]) : n(t[0]) + n(t[t.length - 1]);
}
