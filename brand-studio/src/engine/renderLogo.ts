/**
 * Logo rendern: Farben aufloesen (Kontrastregeln je Variante), Namensformat anwenden, Text als Pfad
 * setzen (mit Ersatzschriften, Umbruch, Akzenten, Eingriffen), Zeichen platzieren und die Layouts
 * Wortmarke, nebeneinander, gestapelt, Emblem und Siegel bauen (engine `Z` ... `Ti`).
 * Ergebnis: `{ body, width, height }` in SVG-Einheiten, mit Zwischenspeicher je FontStore.
 */
import type {
  BrandInput,
  LogoConcept,
  MonogramSymbol,
  Palette,
  TypoSplit,
} from "../types";
import type { Font } from "opentype.js";
import type { FontStore } from "./fontStore";
import type { RenderOptions } from "./logoTypes";
import {
  INLINE_GAPS,
  LARGE_SUFFIX_SCALE,
  STACK_SYMBOL,
  SUFFIX_SCALE_MIN,
  clampSuffixScale,
  defaultTracking,
  snapTracking,
} from "./tracking";
import { TITLE_RE, isPersonName, looksLikePerson } from "./personName";
import { applyCase, capHeight, textAdvance, textPath } from "./text";
import { applyEingriff, eingriffOf } from "./eingriffe";
import { cleanText } from "./cleanText";
import {
  contrast,
  ensureContrast,
  hexToHsl,
  luminance,
  readableAccent,
  safeHex,
  sanitizePalette,
} from "./color";
import { fmt, svgBounds } from "./svg";
import { fontCovers } from "./charset";
import { fontKey, getFont, supportsCapSharpS } from "./fonts";
import { getContainer, renderSymbol } from "../symbols/Icons";
import { initialsOf } from "../symbols/monogram";
import { renderSignature, signatureFonts } from "../signature/index";
import { signatureInitials } from "../signature/render";

export const CAP = 100;

let strokeBoost = 1;

const boostedTracking = (tracking: unknown) =>
  (Number.isFinite(Number(tracking)) ? Number(tracking) : 0) +
  (strokeBoost > 1 ? Math.min(0.04, (strokeBoost - 1) * 0.1) : 0);

let fallbackFonts: any[] = [];

let activeEingriff: any = null;

const outline = (
  font: Font,
  text: string,
  size: number,
  tracking: number = 0,
) =>
  textPath(
    font,
    text,
    size,
    tracking,
    fallbackFonts.filter((i) => i !== font),
  );

const advance = (
  font: Font,
  text: string,
  size: number,
  tracking: number = 0,
) =>
  textAdvance(
    font,
    text,
    size,
    tracking,
    fallbackFonts.filter((i) => i !== font),
  );

function fallbacksFor(concept: LogoConcept, fonts: FontStore) {
  const t = [];
  for (const i of [concept.body, concept.suffix?.font])
    try {
      if (i && fonts.has(i) && getFont(i.key).cat !== "script") {
        t.push(fonts.get(i));
      }
    } catch {}
  return t;
}

const boostStrokes = (markup: string) =>
  strokeBoost === 1
    ? markup
    : markup.replace(
        /stroke-width="([\d.]+)"/g,
        (n, t) => `stroke-width="${fmt(Number(t) * strokeBoost, 3)}"`,
      );

const isGrey = (hex: string) => hexToHsl(hex).s < 0.12;

function lightPaper(palette: Palette) {
  return luminance(palette.paper) > 0.8 ? palette.paper : "#FFFFFF";
}

function mostContrasting(palette: Palette, ground: string, light: string) {
  return [palette.ink, light, "#FFFFFF", "#111111"].reduce((i, a) =>
    contrast(a, ground) > contrast(i, ground) + 0.01 ? a : i,
  );
}

export function resolveColors(
  concept: LogoConcept,
  variant: string = "color",
  ground?: string,
) {
  const palette = sanitizePalette(concept.palette);
  const pick = (f: any, d: any, b: any) => (d.includes(f) ? f : b);
  const roles = {
    symbol: pick(
      concept.colors?.symbol,
      ["primary", "secondary", "accent", "ink"],
      "primary",
    ),
    name: pick(concept.colors?.name, ["primary", "ink"], "ink"),
    suffix: pick(
      concept.colors?.suffix,
      ["primary", "secondary", "accent", "ink"],
      "ink",
    ),
  };
  const splitRole = concept.typo?.split?.color
    ? pick(concept.typo.split.color, ["primary", "accent", "ink"], "primary")
    : null;
  const markRole = concept.typo?.markColor
    ? pick(concept.typo.markColor, ["primary", "accent"], "primary")
    : null;
  const groundColor =
    ground === undefined
      ? undefined
      : safeHex(
          ground,
          variant === "reverse" || variant === "mono-light"
            ? palette.ink
            : palette.paper,
        );
  switch (variant) {
    case "mono-dark": {
      const f = groundColor ?? palette.paper;
      return {
        ground: f,
        symbol: palette.ink,
        symbolAccent: palette.ink,
        name: palette.ink,
        suffix: palette.ink,
        divider: palette.ink,
        knockout: f,
        split: palette.ink,
        mark: palette.ink,
      };
    }
    case "mono-light": {
      const f = groundColor ?? palette.ink;
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
      const f = groundColor ?? palette.ink;
      const d = lightPaper(palette);
      const b = (T: any, K: any) =>
        contrast(T, f) >= K ? T : mostContrasting(palette, f, d);
      const z = (T: any, K: any) => {
        if (contrast(T, f) >= K) return T;
        if (isGrey(T)) return b(d, K);
        const F = ensureContrast(T, f, K, d);
        return contrast(F, f) >= K &&
          hexToHsl(F).l - hexToHsl(T).l <= 0.2 &&
          hexToHsl(F).s >= 0.12
          ? F
          : contrast(palette.accent, f) >= K && !isGrey(palette.accent)
            ? palette.accent
            : b(d, K);
      };
      const k = (palette as Record<string, any>)[roles.name];
      const v = contrast(k, f) >= 4.5 && !isGrey(k) ? k : b(d, 3);
      const M = (palette as Record<string, any>)[roles.suffix];
      const S = (concept.typo?.suffixScale ?? 0) >= 0.75 ? 3 : 4.5;
      const N = roles.suffix === "ink" || isGrey(M) ? b(d, S) : z(M, S);
      const A = z(
        (palette as Record<string, any>)[roles.symbol] === palette.ink
          ? d
          : (palette as Record<string, any>)[roles.symbol],
        3,
      );
      const R = readableAccent(palette, f, 3);
      const L = readableAccent(palette, f, 3);
      const E = splitRole
        ? splitRole === "ink" ||
          isGrey((palette as Record<string, any>)[splitRole])
          ? b(d, 3)
          : z((palette as Record<string, any>)[splitRole], 4.5)
        : v;
      const I =
        !markRole || isGrey((palette as Record<string, any>)[markRole])
          ? v
          : z((palette as Record<string, any>)[markRole], 3);
      return {
        ground: f,
        symbol: A,
        symbolAccent: R,
        name: v,
        suffix: N,
        divider: L,
        knockout: f,
        split: E,
        mark: I,
      };
    }
    default: {
      const f = groundColor ?? palette.paper;
      const d = readableAccent(palette, f, 3);
      const b =
        splitRole &&
        contrast((palette as Record<string, any>)[splitRole], f) >= 4.5
          ? (palette as Record<string, any>)[splitRole]
          : (palette as Record<string, any>)[roles.name];
      const z =
        markRole && contrast((palette as Record<string, any>)[markRole], f) >= 3
          ? (palette as Record<string, any>)[markRole]
          : (palette as Record<string, any>)[roles.name];
      const k = (concept.typo?.suffixScale ?? 0) >= 0.75 ? 3 : 4.5;
      const v = (N: any, A: any) =>
        contrast(N, f) >= A
          ? N
          : mostContrasting(palette, f, lightPaper(palette));
      const M = v((palette as Record<string, any>)[roles.name], 3);
      const S =
        contrast((palette as Record<string, any>)[roles.suffix], f) >= k
          ? (palette as Record<string, any>)[roles.suffix]
          : v(M, k);
      return {
        ground: f,
        symbol: (palette as Record<string, any>)[roles.symbol],
        symbolAccent: d,
        name: M,
        suffix: S,
        divider: d,
        knockout: f,
        split: v(b, 3),
        mark: v(z, 3),
      };
    }
  }
}

function opBox(op: any) {
  switch (op.k) {
    case "shape":
      if (op.rot) {
        const n = (op.rot.deg * Math.PI) / 180;
        const t = Math.cos(n);
        const r = Math.sin(n);
        const i = [
          [op.x, op.y],
          [op.x + op.w, op.y],
          [op.x, op.y + op.h],
          [op.x + op.w, op.y + op.h],
        ].map(([o, l]) => {
          const u = o - op.rot.cx;
          const m = l - op.rot.cy;
          return [op.rot.cx + u * t - m * r, op.rot.cy + u * r + m * t];
        });
        const a = i.map((o) => o[0]);
        const s = i.map((o) => o[1]);
        return {
          x: Math.min(...a),
          y: Math.min(...s),
          w: Math.max(...a) - Math.min(...a),
          h: Math.max(...s) - Math.min(...s),
        };
      }
      return {
        x: op.x,
        y: op.y,
        w: op.w,
        h: op.h,
      };
    case "rect":
      return {
        x: op.x,
        y: op.y,
        w: op.w,
        h: op.h,
      };
    case "circle":
      return {
        x: op.cx - op.r,
        y: op.cy - op.r,
        w: op.r * 2,
        h: op.r * 2,
      };
    case "stroke":
      return op.box;
    case "symbol":
      return {
        x: op.tx + op.ink.x * op.s,
        y: op.ty + op.ink.y * op.s,
        w: op.ink.w * op.s,
        h: op.ink.h * op.s,
      };
  }
}

function translateOps(ops: any[], dx: number, dy: number) {
  return ops.map((r) => {
    switch (r.k) {
      case "shape":
        return {
          ...r,
          x: r.x + dx,
          y: r.y + dy,
          rot: r.rot && {
            ...r.rot,
            cx: r.rot.cx + dx,
            cy: r.rot.cy + dy,
          },
        };
      case "rect":
        return {
          ...r,
          x: r.x + dx,
          y: r.y + dy,
        };
      case "circle":
        return {
          ...r,
          cx: r.cx + dx,
          cy: r.cy + dy,
        };
      case "stroke": {
        const i = r.markup;
        return {
          k: "stroke",
          markup: (a: any, s: any) => i(a + dx, s + dy),
          box: {
            ...r.box,
            x: r.box.x + dx,
            y: r.box.y + dy,
          },
        };
      }
      case "symbol":
        return {
          ...r,
          tx: r.tx + dx,
          ty: r.ty + dy,
        };
    }
  });
}

function opsBounds(ops: any[]) {
  let n = Infinity;
  let t = Infinity;
  let r = -Infinity;
  let i = -Infinity;
  for (const a of ops) {
    const s = opBox(a);
    if (s.w > 0 || s.h > 0) {
      n = Math.min(n, s.x);
      t = Math.min(t, s.y);
      r = Math.max(r, s.x + s.w);
      i = Math.max(i, s.y + s.h);
    }
  }
  return isFinite(n)
    ? {
        x: n,
        y: t,
        w: r - n,
        h: i - t,
      }
    : {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      };
}

function opMarkup(op: any, dx: number, dy: number) {
  switch (op.k) {
    case "shape":
      return op.d
        ? `<path transform="${op.rot ? `rotate(${fmt(op.rot.deg, 3)} ${fmt(op.rot.cx + dx)} ${fmt(op.rot.cy + dy)}) translate(${fmt(op.x + dx)} ${fmt(op.y + dy)})` : `translate(${fmt(op.x + dx)} ${fmt(op.y + dy)})`}" d="${op.d}" fill="${op.fill}"/>`
        : "";
    case "rect":
      return `<rect x="${fmt(op.x + dx)}" y="${fmt(op.y + dy)}" width="${fmt(op.w)}" height="${fmt(op.h)}"${op.rx ? ` rx="${fmt(op.rx)}"` : ""} fill="${op.fill}"/>`;
    case "circle":
      return `<circle cx="${fmt(op.cx + dx)}" cy="${fmt(op.cy + dy)}" r="${fmt(op.r)}" fill="${op.fill}"/>`;
    case "stroke":
      return op.markup(dx, dy);
    case "symbol":
      return `<g transform="translate(${fmt(op.tx + dx)} ${fmt(op.ty + dy)}) scale(${fmt(op.s, 4)})">${op.markup}</g>`;
  }
}

function opsToPart(ops: any[]) {
  const n = opsBounds(ops);
  return !n.w || !n.h
    ? {
        body: "",
        width: 0,
        height: 0,
      }
    : {
        body: ops.map((r) => opMarkup(r, -n.x, -n.y)).join(""),
        width: Math.round(n.w * 100) / 100,
        height: Math.round(n.h * 100) / 100,
      };
}

function sizeForCap(font: Font, key: string, cap: number) {
  const r = cap / capHeight(font, 1);
  return getFont(key).cat === "script" ? r * 1.18 : r;
}

function wrapText(
  font: Font,
  text: string,
  size: number,
  tracking: number,
  maxWidth: number,
  maxLines: number = 3,
) {
  const s = advance(font, text, size, tracking);
  if (s <= maxWidth) return [text];
  const o: any[] = [];
  for (let h = 1; h < text.length - 1; h++) {
    if (text[h] === " ") {
      o.push({
        at: h,
        keep: false,
      });
    } else if (text[h] === "-") {
      o.push({
        at: h + 1,
        keep: true,
      });
    }
  }
  if (!o.length) return [text];
  const l = (h: any) => {
    const p = [];
    let g = 0;
    for (const w of h) {
      p.push(text.slice(g, w.at).trim());
      g = w.keep ? w.at : w.at + 1;
    }
    p.push(text.slice(g).trim());
    return p.filter(Boolean);
  };
  let u = [text];
  let m = s;
  for (let h = 2; h <= maxLines; h++) {
    const p: any[] = [];
    const g = (w: any, x: any) => {
      if (x.length === h - 1) return void p.push(x);
      for (let y = w; y < o.length; y++) g(y + 1, [...x, o[y]]);
    };
    g(0, []);
    for (const w of p) {
      const x = l(w);
      const y = Math.max(...x.map((b) => advance(font, b, size, tracking)));
      const f = Math.min(...x.map((b) => advance(font, b, size, tracking)));
      const d = y + (y - f) * 0.15;
      if (d < m) {
        u = x;
        m = d;
      }
    }
    if (
      Math.max(...u.map((w) => advance(font, w, size, tracking))) <=
      maxWidth * 1.3
    )
      break;
  }
  return u;
}

export const SEPARATOR_RE = /[\u00B7\u2022\u2219|]/;

function firstSeparatorOnly(text: string) {
  let n = false;
  return text
    .replace(/\s*[\u00B7\u2022\u2219|]\s*/g, (t) => (n ? " " : ((n = true), t)))
    .replace(/\s+/g, " ")
    .trim();
}

function shareOfLetters(text: string, letters: string) {
  const t = Array.from(text).filter((r) => new RegExp("\\p{L}", "u").test(r));
  return t.length ? t.filter((r) => letters.includes(r)).length / t.length : 0;
}

const OPEN_BOTTOM_LETTERS = "OCGQSUJVWYTocesuvwtÖÜöü";

const OPEN_TOP_LETTERS = "OCGQSAocsaÖÄöä";

export function initials(name: string | undefined, count: number = 2) {
  const t = initialsOf(cleanText(name).normalize("NFC")) || "U";
  return count === 1 ? Array.from(t)[0] : t;
}

const isValidJoint = (joint: unknown, word: string | undefined) =>
  typeof joint == "number" &&
  !!word &&
  Number.isInteger(joint) &&
  joint >= 2 &&
  joint <= Array.from(word).length - 2;

function hasStyledTokens(concept: LogoConcept, input: BrandInput) {
  const t = concept.typo;
  if (!t) return false;
  const r = cleanText(input.name).split(" ");
  return (
    (!!t.split && (r.length > 1 || isValidJoint(t.split.joint, r[0]))) ||
    (!!t.ampersand && r.includes("&")) ||
    !!t.letterSwap ||
    (!!t.camel && r.length > 1) ||
    (t.mark === "hairline" && r.length > 1)
  );
}

function styledTokens(concept: LogoConcept, input: BrandInput, colors: any) {
  const i = (cleanText(input.name) || "Name").split(" ");
  let a = 0;
  for (; a < i.length - 1 && TITLE_RE.test(i[a]!); ) a++;
  const s = concept.typo?.split;
  const o = {
    font: concept.name.font,
    case: concept.name.case,
    tracking: boostedTracking(concept.name.tracking),
    color: colors.name,
    scale: 1,
  };
  const l =
    s && (i.length > 1 || isValidJoint(s.joint, i[0]))
      ? {
          font: s.font ?? o.font,
          case: s.case ?? o.case,
          tracking:
            s.tracking !== undefined ? boostedTracking(s.tracking) : o.tracking,
          color: s.color ? colors.split : o.color,
          scale: Math.min(1.2, Math.max(0.4, Number(s.scale) || 1)),
        }
      : null;
  const u: any[] = [];
  const m = !!concept.typo?.camel && i.length > 1;
  if (i.length === 1 && s && isValidJoint(s.joint, i[0])) {
    const g = Array.from(i[0]!);
    const w = g.slice(0, s.joint).join("");
    const x = g.slice(s.joint).join("");
    const y = l && s.part === "first" ? l : o;
    const f = l && s.part === "rest" ? l : o;
    return [
      {
        text: applyCase(w, y.case, y.font.key),
        style: y,
        first: true,
        gap: "",
      },
      {
        text: applyCase(x, f.case === "title" ? "asis" : f.case, f.font.key),
        style: f,
        first: false,
        gap: "",
      },
    ];
  }
  i.forEach((g, w) => {
    const x = w <= a;
    let y = l && (s!.part === "first") === x ? l : o;
    if (g === "&" && concept.typo?.ampersand) {
      y = {
        ...y,
        font: concept.typo.ampersand,
        case: "asis",
        tracking: 0,
        color: concept.typo.markColor ? colors.mark : y.color,
      };
    }
    const f =
      m && y.case !== "upper"
        ? g.charAt(0).toLocaleUpperCase("de-AT") +
          g.slice(1).toLocaleLowerCase("de-AT")
        : g;
    const b = applyCase(
      f,
      m && y.case !== "upper" ? "asis" : y.case,
      y.font.key,
    ).split(new RegExp("(?<=-)"));
    b.forEach((k, v) =>
      u.push({
        text: k,
        style: y,
        first: x,
        gap: v < b.length - 1 || m ? "" : " ",
      }),
    );
  });
  if (u.length) {
    u[u.length - 1].gap = "";
  }
  return u;
}

function layoutLine(tokens: any[], fonts: FontStore, swap: any, hair: any) {
  const i = [];
  let a = 0;
  let s = Infinity;
  let o = -Infinity;
  let l = 0;
  let u = 0;
  let m = 0;
  let h = true;
  const p = (x: any, y: any) => {
    if (!x) return;
    const f = fonts.get(y.font);
    const d = sizeForCap(f, y.font.key, CAP * y.scale);
    const b = outline(f, x, d, y.tracking);
    const z = a + (b.left ?? 0);
    const k = Array.from(x as string).every(
      (M) => M === " " || f.charToGlyphIndex(M) > 0,
    );
    const v =
      activeEingriff && !activeEingriff.done && b.d && k
        ? applyEingriff(
            f,
            x,
            d,
            y.tracking,
            {
              left: b.left ?? 0,
              ascent: b.ascent,
              width: b.width,
              height: b.height,
            },
            activeEingriff.art,
          )
        : null;
    if (v && activeEingriff) {
      activeEingriff.done = true;
      const M = -b.ascent - v.top;
      const S = b.height + v.top + v.bottom;
      i.push({
        k: "shape",
        d: v.d,
        x: z,
        y: M,
        w: b.width,
        h: S,
        fill: y.color,
      });
      if (v.mark) {
        i.push({
          k: "shape",
          d: v.mark,
          x: z,
          y: M,
          w: b.width,
          h: S,
          fill: activeEingriff.mark,
        });
      }
      s = Math.min(s, z);
      o = Math.max(o, z + b.width);
      l = Math.max(l, b.ascent + v.top);
      u = Math.max(u, b.height - b.ascent + v.bottom);
    } else if (b.d) {
      i.push({
        k: "shape",
        d: b.d,
        x: z,
        y: -b.ascent,
        w: b.width,
        h: b.height,
        fill: y.color,
      });
      s = Math.min(s, z);
      o = Math.max(o, z + b.width);
      l = Math.max(l, b.ascent);
      u = Math.max(u, b.height - b.ascent);
    }
    a += b.advance ?? b.width;
  };
  let g = 0;
  for (; g < tokens.length; ) {
    const x = tokens[g].style;
    let y = "";
    let f = g;
    const d = (z: any) => !!swap && z === swap.token;
    const b = (z: any) =>
      d(z) || (hair?.hair !== undefined && z === hair.hair + 1);
    for (
      ;
      f < tokens.length &&
      tokens[f].style === x &&
      !(f > g && b(f)) &&
      !(f > g && d(f - 1));
    ) {
      y +=
        tokens[f].text +
        (f < tokens.length - 1 &&
        tokens[f + 1].style === x &&
        !b(f + 1) &&
        !d(f)
          ? tokens[f].gap
          : "");
      f++;
    }
    if (f === g) {
      f = g + 1;
    }
    if (swap && g === swap.token) {
      const z = tokens[g].text;
      const k = z.indexOf("O");
      const v = fonts.get(x.font);
      const M = sizeForCap(v, x.font.key, CAP * x.scale);
      const S = outline(v, "O", M, 0);
      const N = S.width / Math.max(1, S.height);
      if (N < 0.82 || N > 1.3 || !S.d) p(z, x);
      else {
        p(z.slice(0, k), x);
        const A = Math.min(S.width / swap.art.ink.w, S.height / swap.art.ink.h);
        const R = a + (S.left ?? 0) + S.width / 2;
        const L = -S.ascent + S.height / 2;
        i.push(placeSymbol(swap.art, R, L, A));
        s = Math.min(s, R - (swap.art.ink.w * A) / 2);
        o = Math.max(o, R + (swap.art.ink.w * A) / 2);
        l = Math.max(l, -L + (swap.art.ink.h * A) / 2);
        a += advance(v, "O", M, x.tracking);
        p(z.slice(k + 1), x);
      }
    } else p(y, x);
    m = Math.max(m, CAP * x.scale);
    for (let z = g; z < f; z++) {
      if (tokens[z].text !== tokens[z].text.toLocaleUpperCase("de-AT")) {
        h = false;
      }
    }
    if (hair?.hair !== undefined && f === hair.hair + 1 && f < tokens.length) {
      const z = CAP * 0.34;
      const k = Math.max(1.4, CAP * 0.022) * strokeBoost;
      i.push({
        k: "rect",
        x: a + z,
        y: -CAP * 1.1,
        w: k,
        h: CAP * 1.25,
        fill: hair.color,
      });
      l = Math.max(l, CAP * 1.1);
      u = Math.max(u, CAP * 0.15);
      a += z * 2 + k;
    } else if (f < tokens.length && tokens[f - 1].gap === " ") {
      const z = (v: any) => {
        const M = fonts.get(v.font);
        return advance(
          M,
          " ",
          sizeForCap(M, v.font.key, CAP * v.scale),
          v.tracking,
        );
      };
      const k = [tokens[f - 1], tokens[f]].every(
        (v) =>
          new RegExp("\\p{L}", "u").test(v.text) &&
          v.text === v.text.toLocaleUpperCase("de-AT"),
      );
      a += Math.max(
        z(tokens[f - 1].style),
        z(tokens[f].style),
        CAP * (k ? 0.5 : 0.33),
      );
    }
    g = f;
  }
  const w = tokens.some((x, y) => y < tokens.length - 1 && x.gap === " ");
  return isFinite(s)
    ? {
        ops: translateOps(i, -s, 0),
        width: o - s,
        ascent: l,
        descent: u,
        cap: m || CAP,
        upper: h,
        multi: w,
      }
    : {
        ops: [],
        width: 0,
        ascent: 0,
        descent: 0,
        cap: CAP,
        upper: h,
        multi: w,
      };
}

function breakLines(tokens: any[], options: any, layout: any): any {
  const r = tokens.filter((m) => m.first);
  const i = tokens.filter((m) => !m.first);
  if (options.stack && r.length && i.length) {
    const m = layout([r])[0];
    const h: any = breakLines(
      i,
      {
        ...options,
        stack: false,
        forceTwo: false,
      },
      (p: any) => layout([r, ...p]).slice(1),
    );
    return [m, ...h];
  }
  const a: any[] = [];
  tokens.forEach((m, h) => h < tokens.length - 1 && a.push(h + 1));
  const s = layout([tokens]);
  const o = tokens.map((m) => m.text).join(" ").length;
  if (
    !a.length ||
    (!options.forceTwo &&
      (o < options.minChars || s[0].width <= options.wrapAt * CAP))
  )
    return s;
  let l = s;
  let u = options.forceTwo ? Infinity : s[0].width;
  for (let m = 2; m <= (options.forceTwo ? 2 : 3); m++) {
    const h: any[] = [];
    const p = (g: any, w: any) => {
      if (w.length === m - 1) return void h.push(w);
      for (let x = g; x < a.length; x++) p(x + 1, [...w, a[x]]);
    };
    p(0, []);
    for (const g of h) {
      const w = [];
      let x = 0;
      for (const b of [...g, tokens.length]) {
        w.push(tokens.slice(x, b));
        x = b;
      }
      const y = layout(w);
      const f = Math.max(...y.map((b: any) => b.width));
      const d = f + (f - Math.min(...y.map((b: any) => b.width))) * 0.15;
      if (d < u) {
        l = y;
        u = d;
      }
    }
    if (Math.max(...l.map((g: any) => g.width)) <= options.wrapAt * CAP * 1.3)
      break;
  }
  return l;
}

function nameLines(
  concept: LogoConcept,
  input: BrandInput,
  fonts: FontStore,
  options: any,
) {
  if (activeEingriff) {
    activeEingriff.done = false;
  }
  const i = concept.name.font;
  const a = fonts.get(i);
  const s = sizeForCap(a, i.key, CAP);
  if (hasStyledTokens(concept, input)) {
    const f = styledTokens(concept, input, options.colors);
    let d = -1;
    if (concept.typo?.letterSwap && options.swapArt)
      for (let M = f.length - 1; M >= 0 && d < 0; M--) {
        if (
          f[M].text.includes("O") &&
          f[M].text === f[M].text.toLocaleUpperCase("de-AT")
        ) {
          d = M;
        }
      }
    const b = concept.typo?.mark;
    let z = -1;
    if (b === "hairline")
      for (let M = 0; M < f.length - 1; M++) {
        if (f[M].first && !f[M + 1].first) {
          z = M;
        }
      }
    const k = (M: any) => {
      let S = 0;
      return M.map((N: any) => {
        const A =
          d >= S && d < S + N.length
            ? {
                token: d - S,
                art: options.swapArt,
              }
            : undefined;
        const R: { color: string; hair?: number } = {
          color: options.colors.mark,
        };
        if (z >= S && z < S + N.length - 1) {
          R.hair = z - S;
        }
        S += N.length;
        return layoutLine(N, fonts, A, R.hair !== undefined ? R : undefined);
      });
    };
    const v = breakLines(
      f,
      {
        stack: !!concept.typo?.split?.stack && options.wrapAt !== Infinity,
        forceTwo: !!options.forceTwoLines,
        wrapAt: options.wrapAt,
        minChars: options.minWrapChars ?? 0,
      },
      k,
    );
    return {
      size: s,
      lines: v,
      upper: v.every((M: any) => M.upper),
      swapped: d >= 0,
    };
  }
  const o = cleanText(input.name) || "Name";
  const l = applyCase(o, concept.name.case, i.key);
  const u = boostedTracking(concept.name.tracking);
  const m = options.forceTwoLines
    ? wrapText(a, l, s, u, 0, 2)
    : l.length < (options.minWrapChars ?? 0)
      ? [l]
      : wrapText(a, l, s, u, options.wrapAt * CAP);
  const h = l === l.toLocaleUpperCase("de-AT");
  const p = m.map((f) => {
    const d = outline(a, f, s, u);
    const b =
      activeEingriff &&
      !activeEingriff.done &&
      d.d &&
      Array.from(f).every((z) => z === " " || a.charToGlyphIndex(z) > 0)
        ? applyEingriff(
            a,
            f,
            s,
            u,
            {
              left: d.left ?? 0,
              ascent: d.ascent,
              width: d.width,
              height: d.height,
            },
            activeEingriff.art,
          )
        : null;
    if (b && activeEingriff) {
      activeEingriff.done = true;
      const z = -d.ascent - b.top;
      const k = d.height + b.top + b.bottom;
      const v = [
        {
          k: "shape",
          d: b.d,
          x: 0,
          y: z,
          w: d.width,
          h: k,
          fill: options.colors.name,
        },
      ];
      if (b.mark) {
        v.push({
          k: "shape",
          d: b.mark,
          x: 0,
          y: z,
          w: d.width,
          h: k,
          fill: activeEingriff.mark,
        });
      }
      return {
        ops: v,
        width: d.width,
        ascent: d.ascent + b.top,
        descent: d.height - d.ascent + b.bottom,
        cap: CAP,
        upper: h,
        multi: f.includes(" "),
      };
    }
    return {
      ops: [
        {
          k: "shape",
          d: d.d,
          x: 0,
          y: -d.ascent,
          w: d.width,
          h: d.height,
          fill: options.colors.name,
        },
      ],
      width: d.width,
      ascent: d.ascent,
      descent: d.height - d.ascent,
      cap: CAP,
      upper: h,
      multi: f.includes(" "),
    };
  });
  return {
    size: s,
    lines: p,
    upper: h,
    swapped: false,
  };
}

function layoutNameBlock(
  concept: LogoConcept,
  input: BrandInput,
  fonts: FontStore,
  options: any,
) {
  const i = [];
  const { lines, size, upper } = nameLines(concept, input, fonts, options);
  const l = Math.max(...lines.map((L: any) => L.width));
  const u = (L: any) => (options.align === "center" ? -L / 2 : 0);
  let m = lines[0].cap;
  let h = -Infinity;
  let p = 0;
  for (let L = 0; L < lines.length; L++) {
    const E = lines[L];
    if (L > 0) {
      m += E.upper
        ? CAP * 0.42 + E.cap
        : Math.max(CAP * 0.5 + E.cap, size * 1.05 * (E.cap / CAP));
      const I = m - E.ascent;
      const T = E.ascent > E.cap * 1.12 ? CAP * 0.32 : CAP * 0.1;
      if (I < h + T) {
        m += h + T - I;
      }
    }
    i.push(...translateOps(E.ops, u(E.width), m));
    h = m + E.descent;
    p = u(E.width) + E.width;
  }
  const g = m;
  const w = h;
  let x = g;
  let y = CAP * 0.32;
  let f = options.align === "center" ? -l / 2 : 0;
  let d = options.align === "center" ? l / 2 : l;
  const b = options.divider;
  const z = Math.max(1.6, CAP * 0.028) * strokeBoost;
  const k = concept.typo;
  let v = firstSeparatorOnly(cleanText(input.suffix));
  if (v && k?.fussnote && k.sup?.art === "stern" && !k.inlineSuffix) {
    v = `${k.sup.text} ${v}`;
  }
  if (v && k?.suffixWrap === "klammer" && !k.inlineSuffix) {
    v = `(${v})`;
  }
  let M = -Infinity;
  if (k?.sup?.text) {
    const L = lines[lines.length - 1];
    const E = fontCovers(concept.name.font.key, k.sup.text)
      ? concept.name.font
      : concept.suffix.font;
    const I = fonts.get(E);
    const T = k.sup.art === "stern" ? 0.5 : k.sup.art === "grad" ? 0.36 : 0.42;
    const K = outline(
      I,
      k.sup.text,
      sizeForCap(I, E.key, L.cap * T),
      k.sup.art === "bezirk" ? 0.02 : 0,
    );
    if (K.d) {
      const F = p + L.cap * (k.sup.art === "bezirk" ? 0.1 : 0.07);
      const D = g - L.cap;
      i.push({
        k: "shape",
        d: K.d,
        x: F,
        y: D,
        w: K.width,
        h: K.height,
        fill:
          k.sup.art === "bezirk" ? options.colors.name : options.colors.mark,
      });
      M = F + K.width;
    }
  }
  const S = (L: any) => {
    const E = L.width;
    return {
      x: options.align === "center" ? -E / 2 : 0,
      w: E,
      h: z,
    };
  };
  if (k?.rule === "over" || (k?.mark === "macron" && !k.rule)) {
    const L = Math.min(0, ...i.map((I) => opBox(I).y));
    const E = S(lines[0]);
    i.push({
      k: "rect",
      x: E.x,
      y: L - CAP * 0.34 - E.h,
      w: E.w,
      h: E.h,
      fill: options.colors.divider,
    });
  }
  if (v && k?.inlineSuffix && lines.length === 1) {
    const L = concept.suffix.font;
    const E = fonts.get(L);
    const I = applyCase(
      k.inlineSep === "klammer" ? `(${v})` : v,
      concept.suffix.case,
      L.key,
    );
    const T = I === I.toLocaleUpperCase("de-AT");
    const K = clampSuffixScale(k.suffixScale) ?? (T ? 0.4 : 0.46);
    const F = outline(
      E,
      I,
      sizeForCap(E, L.key, CAP * K),
      Math.min(0.3, boostedTracking(concept.suffix.tracking)),
    );
    const D = Math.max(u(l) + l, M);
    const Y = CAP * 0.42;
    const _ = CAP * 1.05;
    const te = m - CAP / 2;
    const X = D + Y;
    let O = X + z + Y;
    if (k.inlineSep === "slash") {
      const ee = fonts.get(concept.name.font);
      const Q = outline(
        ee,
        "/",
        sizeForCap(ee, concept.name.font.key, CAP * 0.92),
      );
      i.push({
        k: "shape",
        d: Q.d,
        x: D + Y * 0.8,
        y: te - Q.height / 2,
        w: Q.width,
        h: Q.height,
        fill: options.colors.divider,
      });
      O = D + Y * 1.6 + Q.width;
    } else if (k.inlineSep === "klammer") {
      O = D + Y * 0.9;
    } else {
      i.push({
        k: "rect",
        x: X,
        y: te - _ / 2,
        w: z,
        h: _,
        fill: options.colors.divider,
      });
    }
    const H = te + (CAP * K) / 2;
    i.push({
      k: "shape",
      d: F.d,
      x: O,
      y: H - F.ascent,
      w: F.width,
      h: F.height,
      fill: options.colors.suffix,
    });
    const G = O + F.width - u(l);
    const U = options.align === "center" ? (l - G) / 2 : 0;
    return {
      ops: translateOps(i, U, 0),
      top: 0,
      bottom: m,
      left: u(l) + U,
      right: u(l) + U + G,
      nameWidth: l,
      suffixCap: CAP * K,
    };
  }
  if (v) {
    const L = concept.suffix.font;
    const E = fonts.get(L);
    const I = applyCase(v, concept.suffix.case, L.key);
    const T = I === I.toLocaleUpperCase("de-AT");
    let K = T ? (upper ? 0.42 : 0.4) : 0.45;
    if (getFont(concept.name.font.key).cat === "script") {
      K = T ? 0.36 : 0.42;
    }
    const F = clampSuffixScale(k?.suffixScale);
    if (F !== undefined) {
      K = F;
    }
    let D = boostedTracking(concept.suffix.tracking);
    const Y = l * (b === "line" ? 0.86 : 1);
    let _ = outline(E, I, sizeForCap(E, L.key, CAP * K), D);
    for (let he = 0; he < 16 && _.width > Y; he++) {
      if (D > 0.06) D = Math.max(0.06, D - 0.04);
      else if (K > SUFFIX_SCALE_MIN) K = Math.max(SUFFIX_SCALE_MIN, K - 0.02);
      else break;
      _ = outline(E, I, sizeForCap(E, L.key, CAP * K), D);
    }
    y = CAP * K;
    const te = Math.max(0, w - g);
    let X = Math.max(CAP * (T ? 0.42 : 0.36), te + CAP * 0.2);
    if (te < CAP * 0.05) {
      const he = cleanText(input.name).split(" ");
      const oe = he
        .slice(Math.floor((he.length * (lines.length - 1)) / lines.length))
        .join(" ");
      X *=
        1 -
        0.14 * shareOfLetters(oe, OPEN_BOTTOM_LETTERS) -
        0.08 * shareOfLetters(I, OPEN_TOP_LETTERS);
    }
    const O = F === undefined ? 0 : Math.max(0, _.ascent - y);
    X += O;
    if ((F ?? 0) >= LARGE_SUFFIX_SCALE) {
      X = Math.max(X, te + CAP * 0.3 + O);
    }
    const H = (l - _.width) / 2 - y * 1.2;
    const G = options.align === "center";
    const U = G && b === "line" && H > CAP * 0.35;
    const J = (b === "line" && !U) || (!G && b === "line");
    if (J) {
      X += CAP * 0.32;
    }
    const ee = g + X;
    const Q = ee + y;
    const me = G ? -_.width / 2 : 0;
    i.push({
      k: "shape",
      d: _.d,
      x: me,
      y: Q - _.ascent,
      w: _.width,
      h: _.height,
      fill: options.colors.suffix,
    });
    const fe = ee + y / 2;
    if (U && b === "line") {
      const he = y * 1.1;
      const oe = Math.min(H + y * 0.1, CAP * 2.6);
      i.push({
        k: "rect",
        x: me - he - oe,
        y: fe - z / 2,
        w: oe,
        h: z,
        fill: options.colors.divider,
      });
      i.push({
        k: "rect",
        x: me + _.width + he,
        y: fe - z / 2,
        w: oe,
        h: z,
        fill: options.colors.divider,
      });
    } else if (J) {
      const he = G ? Math.min(l * 0.3, CAP * 1.3) : Math.min(l * 0.22, CAP * 1);
      const oe =
        g +
        Math.max(
          te + CAP * 0.12,
          (X - z) / 2 + (te > CAP * 0.1 ? CAP * 0.06 : 0),
        );
      i.push({
        k: "rect",
        x: G ? -he / 2 : 0,
        y: Math.min(oe, ee - CAP * 0.2),
        w: he,
        h: z,
        fill: options.colors.divider,
      });
    }
    x = Q;
    f = Math.min(f, me);
    d = Math.max(d, me + _.width);
  }
  if (k?.mark === "dot" && !(v && k?.inlineSuffix && lines.length === 1)) {
    const L = lines[lines.length - 1];
    const E = concept.name.font.weight >= 600;
    const I = L.cap * (E ? 0.1 : 0.075);
    const T = p + L.cap * 0.1 + I;
    i.push({
      k: "circle",
      cx: T,
      cy: g - I,
      r: I,
      fill: options.colors.mark,
    });
    d = Math.max(d, T + I);
  }
  const N = k?.mark === "dot";
  if (!v && !N && b === "dot" && !upper) {
    const L = CAP * 0.085;
    const E = p + CAP * 0.1 + L;
    i.push({
      k: "circle",
      cx: E,
      cy: g - L,
      r: L,
      fill: options.colors.divider,
    });
    d = Math.max(d, E + L);
  } else if (
    !v &&
    !N &&
    (k?.rule === "under" ||
      (b === "line" &&
        options.align === "center" &&
        lines.length === 1 &&
        !upper))
  ) {
    const L = Math.max(0, w - g);
    const E = S(lines[lines.length - 1]);
    const I = g + Math.max(CAP * 0.38, L + CAP * 0.22);
    i.push({
      k: "rect",
      x: E.x,
      y: I,
      w: E.w,
      h: E.h,
      fill: options.colors.divider,
    });
    x = I + E.h;
  }
  d = Math.max(d, M);
  return {
    ops: i,
    top: 0,
    bottom: x,
    left: f,
    right: d,
    nameWidth: l,
    suffixCap: y,
  };
}

const symbolBoundsCache = new Map();

function symbolCacheKey(symbol: any, boost: boolean) {
  return symbol.kind === "icon"
    ? `i:${symbol.id}:${symbol.container}:${boost}`
    : `m:${symbol.letters}:${symbol.container}:${fontKey(symbol.font)}:${boost}`;
}

function fallbackMonogram(
  concept: LogoConcept,
  input: BrandInput,
): MonogramSymbol {
  return {
    kind: "monogram",
    letters: signatureInitials(input) ?? initials(input.name, 1),
    container: "none",
    font: concept.name.font,
  };
}

function renderSymbolArt(
  symbol: any,
  colors: any,
  fonts: FontStore,
  filled: boolean,
) {
  const i = boostStrokes(renderSymbol(symbol, colors, fonts, filled));
  const a = `${symbolCacheKey(symbol, filled)}:${strokeBoost}`;
  let s = symbolBoundsCache.get(a);
  if (s === undefined) {
    s = svgBounds(i);
    if (symbolBoundsCache.size > 2e3) {
      symbolBoundsCache.clear();
    }
    symbolBoundsCache.set(a, s);
  }
  return s
    ? {
        markup: i,
        ink: s,
        hasContainer:
          symbol.container !== "none" &&
          getContainer(symbol.container)!.key !== "none",
      }
    : null;
}

function symbolArt(
  concept: LogoConcept,
  input: BrandInput,
  fonts: FontStore,
  colors: any,
  filled: boolean,
) {
  const a = concept.symbol ?? fallbackMonogram(concept, input);
  try {
    return renderSymbolArt(a, colors, fonts, filled);
  } catch {
    try {
      return renderSymbolArt(
        fallbackMonogram(concept, input),
        colors,
        fonts,
        false,
      );
    } catch {
      return null;
    }
  }
}

function symbolScale(ink: any, height: number) {
  const t = Math.max(ink.h, Math.sqrt(ink.w * ink.h) * 0.95, ink.w * 0.74);
  return height / t;
}

function placeSymbol(art: any, cx: number, cy: number, scale: number) {
  return {
    k: "symbol",
    markup: art.markup,
    ink: art.ink,
    s: scale,
    tx: cx - (art.ink.x + art.ink.w / 2) * scale,
    ty: cy - (art.ink.y + art.ink.h / 2) * scale,
  };
}

function textColors(colors: any) {
  return {
    name: colors.name,
    suffix: colors.suffix,
    divider: colors.divider,
    split: colors.split,
    mark: colors.mark,
  };
}

function wordmarkOps(ctx: any, align = "center", lines = "auto") {
  const r =
    ctx.concept.typo?.letterSwap && ctx.concept.symbol
      ? (symbolArt(
          ctx.concept,
          ctx.input,
          ctx.fonts,
          ctx.symColors,
          ctx.filled,
        ) ?? undefined)
      : undefined;
  const i = (h: any, p: any) =>
    layoutNameBlock(h, ctx.input, ctx.fonts, {
      align,
      wrapAt: p,
      forceTwoLines: lines === "two",
      colors: textColors(ctx.vc),
      divider: h.divider,
      swapArt: r,
    }).ops;
  const a = i(ctx.concept, lines === "single" ? Infinity : 15);
  if (lines !== "auto") return a;
  const s = (h: any) => {
    const p = opsBounds(h);
    return p.w / Math.max(1, p.h);
  };
  if (s(a) <= 11) return a;
  const o = ctx.concept.typo?.inlineSuffix
    ? {
        ...ctx.concept.typo,
        inlineSuffix: false,
      }
    : ctx.concept.typo;
  const l = i(
    {
      ...ctx.concept,
      typo: o,
    },
    9,
  );
  return s(l) < s(a) ? l : a;
}

function inlineOps(ctx: any, single: boolean = false) {
  const t = inlineLockup(ctx, single ? Infinity : 12.5, 16);
  if (single) return t;
  const r = (a: any) => {
    const s = opsBounds(a);
    return s.w / Math.max(1, s.h);
  };
  if (r(t) <= 11) return t;
  const i = inlineLockup(ctx, 7, 0);
  return r(i) < r(t) ? i : t;
}

function inlineLockup(ctx: any, wrapAt: number, minWrapChars: number) {
  const r = symbolArt(
    ctx.concept,
    ctx.input,
    ctx.fonts,
    ctx.symColors,
    ctx.filled,
  );
  const i = ctx.concept.divider;
  const a = ctx.concept.symbolPosition === "right";
  const s = layoutNameBlock(ctx.concept, ctx.input, ctx.fonts, {
    align: "left",
    wrapAt,
    minWrapChars,
    colors: textColors(ctx.vc),
    divider: i === "line" ? "none" : i,
  });
  if (!r) return s.ops;
  const o = s.bottom - s.top;
  let u = !!cleanText(ctx.input.suffix) || o > CAP * 1.5 ? o * 1.08 : CAP * 1.5;
  if (r.hasContainer) {
    u *= 1.1;
  }
  u = Math.max(u, CAP * 1.4);
  const m = symbolScale(r.ink, u);
  const h = r.ink.w * m;
  const p = r.ink.h * m;
  const g = (s.top + s.bottom) / 2;
  const w =
    (
      ctx.concept.symbol ?? {
        kind: "monogram",
      }
    ).kind === "monogram" && !r.hasContainer;
  const x = i === "line" || w;
  const y = Math.max(1.6, CAP * 0.026) * strokeBoost;
  const f = Math.max(o, p * 0.9);
  const d = [];
  if (!a) {
    d.push(placeSymbol(r, h / 2, g, m));
    let z =
      h +
      CAP * (x ? INLINE_GAPS.lineGap : INLINE_GAPS.gap) +
      (r.hasContainer ? CAP * 0.08 : 0);
    if (x) {
      d.push({
        k: "rect",
        x: z,
        y: g - f / 2,
        w: y,
        h: f,
        fill: ctx.vc.divider,
      });
      z += y + CAP * INLINE_GAPS.textGap;
    }
    d.push(...translateOps(s.ops, z, 0));
    return d;
  }
  d.push(...s.ops);
  let b =
    s.right +
    CAP * (x ? INLINE_GAPS.textGap : INLINE_GAPS.gap) +
    (r.hasContainer ? CAP * 0.08 : 0);
  if (x) {
    d.push({
      k: "rect",
      x: b,
      y: g - f / 2,
      w: y,
      h: f,
      fill: ctx.vc.divider,
    });
    b += y + CAP * INLINE_GAPS.lineGap;
  }
  d.push(placeSymbol(r, b + h / 2, g, m));
  return d;
}

function stackedOps(ctx: any) {
  const n = symbolArt(
    ctx.concept,
    ctx.input,
    ctx.fonts,
    ctx.symColors,
    ctx.filled,
  );
  const t = layoutNameBlock(ctx.concept, ctx.input, ctx.fonts, {
    align: "center",
    wrapAt: 13,
    colors: textColors(ctx.vc),
    divider: ctx.concept.divider,
  });
  if (!n) return t.ops;
  const r = ctx.concept.symbolSize;
  let i =
    CAP *
    (r === "small" ? STACK_SYMBOL.min : r === "large" ? 4 : STACK_SYMBOL.typ);
  if (n.hasContainer) {
    i *= 1.06;
  }
  const a = t.right - t.left;
  let s = symbolScale(n.ink, i);
  const o = a * (r === "large" ? 1.3 : 0.9);
  if (n.ink.w * s > o) {
    s = Math.max(o / n.ink.w, symbolScale(n.ink, CAP * 1.6));
  }
  const l = n.ink.h * s;
  const u = CAP * (r === "large" ? 0.85 : STACK_SYMBOL.gap);
  if (ctx.concept.symbolPosition === "below") {
    const p = t.ops.reduce(
      (g, w) => Math.max(g, opBox(w).y + opBox(w).h),
      -Infinity,
    );
    return [...t.ops, placeSymbol(n, 0, Math.max(t.bottom, p) + u + l / 2, s)];
  }
  const m = t.ops.reduce((p, g) => Math.min(p, opBox(g).y), Infinity);
  const h = Math.min(t.top, m) - u - l / 2;
  return [placeSymbol(n, 0, h, s), ...t.ops];
}

function strokeRect(
  x: number,
  y: number,
  w: number,
  h: number,
  stroke: number,
  color: string,
  rx: number = 0,
) {
  return {
    k: "stroke",
    markup: (o: any, l: any) =>
      `<rect x="${fmt(x + o)}" y="${fmt(y + l)}" width="${fmt(w)}" height="${fmt(h)}"${rx ? ` rx="${fmt(rx)}"` : ""} fill="none" stroke="${color}" stroke-width="${fmt(stroke)}"/>`,
    box: {
      x: x - stroke / 2,
      y: y - stroke / 2,
      w: w + stroke,
      h: h + stroke,
    },
  };
}

function archOutline(x: number, y: number, w: number, h: number) {
  const i = w / 2;
  return (a: any, s: any) => {
    const o = x + a;
    const l = y + s;
    return `M${fmt(o)} ${fmt(l + h)}V${fmt(l + i)}A${fmt(i)} ${fmt(i)} 0 0 1 ${fmt(o + w)} ${fmt(l + i)}V${fmt(l + h)}Z`;
  };
}

function badgeKind(ctx: any) {
  const n = ctx.concept.badge ?? "frame";
  const t = cleanText(ctx.input.name);
  if (n === "seal") {
    const r = getFont(ctx.concept.name.font.key).cat === "script";
    if (!cleanText(ctx.input.suffix) || t.length > 22 || r) return "frame";
  }
  return n;
}

function badgeOps(ctx: any) {
  const n = badgeKind(ctx);
  if (n === "seal") return sealOps(ctx);
  const { vc } = ctx;
  const r = !!ctx.concept.symbolFilled;
  const i = vc.symbol;
  const a = r
    ? {
        ...vc,
        name: vc.knockout,
        suffix: vc.knockout,
        divider: vc.knockout,
        symbol: vc.knockout,
        symbolAccent: vc.knockout,
        split: vc.knockout,
        mark: vc.knockout,
      }
    : vc;
  const s = r
    ? {
        main: vc.knockout,
        accent: vc.knockout,
        knockout: i,
      }
    : ctx.symColors;
  const o = layoutNameBlock(ctx.concept, ctx.input, ctx.fonts, {
    align: "center",
    wrapAt: n === "arch" ? 6.5 : 12,
    colors: textColors(a),
    divider: ctx.concept.divider,
  });
  const l = symbolArt(ctx.concept, ctx.input, ctx.fonts, s, false);
  const u = o.right - o.left;
  const m = opsBounds(o.ops);
  const h = [...o.ops];
  let p = Math.min(o.top, m.y);
  if (l) {
    let k = symbolScale(l.ink, l.hasContainer ? CAP * 1.7 : CAP * 1.5);
    if (l.ink.w * k > u * 0.7) {
      k = (u * 0.7) / l.ink.w;
    }
    const v = l.ink.h * k;
    const M = p - CAP * 0.45 - v / 2;
    h.push(placeSymbol(l, 0, M, k));
    p = M - v / 2;
  }
  const g = Math.max(o.bottom, m.y + m.h);
  const w = Math.max(2, CAP * 0.045) * strokeBoost;
  const x = CAP * 0.85;
  const y = CAP * 0.7;
  let f = Math.max(u, CAP * 3) + x * 2;
  const d = -f / 2;
  if (n === "arch" && f <= CAP * 10.5) {
    const k = f / 2;
    const v = p - y * 0.5 - k * 0.3;
    const S = g + y - v;
    const N = archOutline(d, v, f, Math.max(S, k + CAP));
    if (r) {
      h.unshift({
        k: "stroke",
        markup: (A: any, R: any) => `<path d="${N(A, R)}" fill="${i}"/>`,
        box: {
          x: d,
          y: v,
          w: f,
          h: Math.max(S, k + CAP),
        },
      });
    } else {
      h.unshift({
        k: "stroke",
        markup: (A: any, R: any) =>
          `<path d="${N(A, R)}" fill="none" stroke="${i}" stroke-width="${fmt(w)}"/>`,
        box: {
          x: d - w / 2,
          y: v - w / 2,
          w: f + w,
          h: Math.max(S, k + CAP) + w,
        },
      });
    }
    return h;
  }
  f = Math.max(f, g - p + y * 2);
  const b = p - y;
  const z = g + y - b;
  if (r)
    h.unshift({
      k: "rect",
      x: d,
      y: b,
      w: f,
      h: z,
      fill: i,
    });
  else {
    h.unshift(strokeRect(d, b, f, z, w, i));
    if (ctx.concept.style === "luxus" || ctx.concept.style === "elegant") {
      const k = CAP * 0.2;
      h.unshift(strokeRect(d + k, b + k, f - k * 2, z - k * 2, w * 0.45, i));
    }
  }
  return h;
}

function textOnArc(
  font: Font,
  text: string,
  size: number,
  tracking: number,
  cx: number,
  cy: number,
  radius: number,
  top: boolean,
  fill: string,
) {
  const u = [];
  const h = (advance(font, text, size, tracking) - tracking * size) / radius;
  const p = top ? -Math.PI / 2 - h / 2 : Math.PI / 2 + h / 2;
  for (let g = 0; g < text.length; g++) {
    const w = text[g];
    if (w === " ") continue;
    const x = g === 0 ? 0 : advance(font, text.slice(0, g), size, tracking);
    const y = advance(font, w!, size, 0);
    const f = outline(font, w!, size, 0);
    if (!f.d) continue;
    const d = (x + y / 2) / radius;
    const b = top ? p + d : p - d;
    const z = cx + radius * Math.cos(b);
    const k = cy + radius * Math.sin(b);
    const v = ((top ? b + Math.PI / 2 : b - Math.PI / 2) * 180) / Math.PI;
    u.push({
      k: "shape",
      d: f.d,
      x: z - f.width / 2,
      y: k - f.ascent,
      w: f.width,
      h: f.height,
      fill,
      rot: {
        deg: v,
        cx: z,
        cy: k,
      },
    });
  }
  return u;
}

function sealOps(ctx: any) {
  const { concept, input, fonts, vc } = ctx;
  const a = !!concept.symbolFilled;
  const s = vc.symbol;
  const o = a ? vc.knockout : vc.name;
  const l = a ? vc.knockout : vc.suffix;
  const u = concept.name.font;
  const m = fonts.get(u);
  const h = applyCase(cleanText(input.name), "upper", u.key);
  const p = CAP * 0.62;
  const g = sizeForCap(m, u.key, p);
  const w = Math.max(0.14, boostedTracking(concept.name.tracking));
  const x = concept.suffix.font;
  const y = fonts.get(x);
  const f = applyCase(
    firstSeparatorOnly(cleanText(input.suffix)),
    "upper",
    x.key,
  );
  const d = clampSuffixScale(concept.typo?.suffixScale);
  const b =
    p * (d === undefined ? 0.62 : Math.min(0.75, Math.max(0.45, d * 1.5)));
  const z = sizeForCap(y, x.key, b);
  const k = Math.max(0.2, boostedTracking(concept.suffix.tracking));
  const v = advance(m, h, g, w);
  const M = advance(y, f, z, k);
  const S = Math.max(
    CAP * 2.6,
    v / ((150 * Math.PI) / 180),
    M / ((110 * Math.PI) / 180),
  );
  const N = p * 1;
  const A = S + p / 2;
  const R = A + N / 2 + CAP * 0.32;
  const L = A - N / 2 - CAP * 0.3;
  const E = Math.max(2, CAP * 0.05) * strokeBoost;
  const I = [];
  if (a) {
    I.push({
      k: "circle",
      cx: 0,
      cy: 0,
      r: R + E / 2,
      fill: s,
    });
  } else {
    I.push({
      k: "stroke",
      markup: (te: any, X: any) =>
        `<circle cx="${fmt(te)}" cy="${fmt(X)}" r="${fmt(R)}" fill="none" stroke="${s}" stroke-width="${fmt(E)}"/>`,
      box: {
        x: -R - E / 2,
        y: -R - E / 2,
        w: 2 * R + E,
        h: 2 * R + E,
      },
    });
  }
  const T = a ? vc.knockout : s;
  const K = E * 0.5;
  I.push({
    k: "stroke",
    markup: (te: any, X: any) =>
      `<circle cx="${fmt(te)}" cy="${fmt(X)}" r="${fmt(L)}" fill="none" stroke="${T}" stroke-width="${fmt(K)}"/>`,
    box: {
      x: -L - K / 2,
      y: -L - K / 2,
      w: 2 * L + K,
      h: 2 * L + K,
    },
  });
  I.push(...textOnArc(m, h, g, w, 0, 0, A - p / 2, true, o));
  I.push(...textOnArc(y, f, z, k, 0, 0, A + b / 2, false, l));
  const F = CAP * 0.075;
  I.push({
    k: "circle",
    cx: -A,
    cy: 0,
    r: F,
    fill: a ? vc.knockout : vc.divider,
  });
  I.push({
    k: "circle",
    cx: A,
    cy: 0,
    r: F,
    fill: a ? vc.knockout : vc.divider,
  });
  const D = a
    ? {
        main: vc.knockout,
        accent: vc.knockout,
        knockout: s,
      }
    : ctx.symColors;
  const Y = symbolArt(concept, input, fonts, D, false);
  if (Y) {
    const te = symbolScale(Y.ink, L * (Y.hasContainer ? 1.15 : 0.85));
    I.push(placeSymbol(Y, 0, 0, te));
  }
  return I;
}

function renderContext(
  concept: LogoConcept,
  input: BrandInput,
  fonts: FontStore,
  variant: string,
  ground?: string,
) {
  const a = resolveColors(concept, variant, ground);
  return {
    concept,
    input,
    fonts,
    vc: a,
    symColors: {
      main: a.symbol,
      accent: a.symbolAccent,
      knockout: a.knockout,
    },
    filled: !!concept.symbolFilled,
  };
}

export function splitLabels(name: string, joint: number | undefined) {
  return looksLikePerson(name)
    ? ["Vorname", "Nachname"]
    : cleanText(name).split(" ").length > 1 || joint === undefined
      ? ["Erstes Wort", "Rest"]
      : ["Erster Teil", "Zweiter Teil"];
}

const displayName = (name: string | undefined) =>
  cleanText(name)
    .split(" ")
    .filter((n, t, r) => !(TITLE_RE.test(n) && t < r.length - 1))
    .join(" ");

export function applyNameFormat(
  concept: LogoConcept,
  input: BrandInput,
): { concept: LogoConcept; input: BrandInput } {
  const format = concept.nameFormat ?? "full";
  const name = cleanText(input.name);
  const suffix = cleanText(input.suffix);
  const place = cleanText(input.place);
  const words = displayName(name).split(" ").filter(Boolean);
  switch (format) {
    case "upper": {
      const h = getFont(concept.name.font.key);
      if (h.noCaps || h.cat === "script")
        return {
          input,
          concept,
        };
      if (!supportsCapSharpS(concept.name.font.key, name))
        return {
          input: {
            ...input,
            name: displayName(name),
          },
          concept,
        };
      const p = concept.name.font;
      const g =
        concept.style === "elegant" ||
        concept.style === "luxus" ||
        concept.style === "modern";
      const w =
        concept.name.case === "upper" || h.capsOnly
          ? Number(concept.name.tracking) || 0
          : g
            ? defaultTracking(p, "upper")
            : 0.1;
      const x = snapTracking(p, "upper", g ? w : Math.min(w, 0.1));
      return !g && x >= 0.12 && !h.capsOnly
        ? {
            input: {
              ...input,
              name: displayName(name),
            },
            concept,
          }
        : {
            input: {
              ...input,
              name: displayName(name),
            },
            concept: {
              ...concept,
              name: {
                ...concept.name,
                case: "upper",
                tracking: x,
              },
            },
          };
    }
    case "surname":
      if (!suffix || !isPersonName(input))
        return {
          input,
          concept,
        };
      if (concept.symbol && concept.layout !== "wordmark")
        return {
          input: {
            ...input,
            name: words[words.length - 1]!,
          },
          concept,
        };
      {
        const h = concept.typo?.split;
        const p =
          !!h?.font &&
          h.font.style !== "italic" &&
          h.font.weight < concept.name.font.weight;
        const g = h && (p || (h.scale ?? 1) < 1) ? "rest" : "first";
        const w: LogoConcept =
          h && h.part !== g
            ? {
                ...concept,
                typo: {
                  ...concept.typo,
                  split: {
                    ...h,
                    part: g,
                  },
                },
              }
            : concept;
        return {
          input: {
            ...input,
            name: `${words[words.length - 1]} ${suffix}`,
            suffix: "",
          },
          concept: w,
        };
      }
    case "initial":
      return !isPersonName(input) ||
        /[^A-Za-z]/.test(Array.from(words[0] ?? "")[0] ?? "")
        ? {
            input,
            concept,
          }
        : {
            input: {
              ...input,
              name: `${Array.from(words[0]!)[0]}. ${words.slice(1).join(" ")}`,
            },
            concept,
          };
    case "stacked": {
      if (
        words.length < 2 &&
        !isValidJoint(concept.typo?.split?.joint, words[0])
      )
        return {
          input,
          concept,
        };
      const h: TypoSplit = {
        part: "first",
        ...(concept.typo?.split ?? {}),
        stack: true,
      };
      return {
        input,
        concept: {
          ...concept,
          typo: {
            ...(concept.typo ?? {}),
            split: h,
          },
        },
      };
    }
    case "district":
      return place
        ? {
            input: {
              ...input,
              name: displayName(name),
              suffix: suffix
                ? firstSeparatorOnly(
                    SEPARATOR_RE.test(suffix)
                      ? `${suffix} ${place}`
                      : `${suffix} · ${place}`,
                  )
                : place,
            },
            concept,
          }
        : {
            input,
            concept,
          };
    case "monogram":
      return {
        input: {
          ...input,
          name: displayName(name),
        },
        concept,
      };
    default:
      return {
        input,
        concept,
      };
  }
}

export function renderLogo(
  concept: LogoConcept,
  input: BrandInput,
  fonts: FontStore,
  options: RenderOptions = {},
) {
  let cache = renderCache.get(fonts);
  if (!cache) {
    renderCache.set(fonts, (cache = new Map()));
  }
  const version = fonts.version ?? 0;
  const fallbackCount = fallbacksFor(concept, fonts).length;
  const key = JSON.stringify([
    concept,
    input.name,
    input.suffix ?? "",
    input.place ?? "",
    options.variant,
    options.part,
    options.lockup,
    options.ground,
    options.boost,
    version,
    fallbackCount,
  ]);
  const cached = cache.get(key);
  if (cached)
    return {
      ...cached,
    };
  strokeBoost = options.boost && options.boost > 0 ? options.boost : 1;
  fallbackFonts = fallbacksFor(concept, fonts);
  try {
    const result = renderUncached(concept, input, fonts, options);
    if (cache.size > 400) {
      cache.clear();
    }
    cache.set(key, result);
    return {
      ...result,
    };
  } finally {
    strokeBoost = 1;
    fallbackFonts = [];
    activeEingriff = null;
  }
}

const renderCache = new WeakMap();

function renderUncached(
  concept: LogoConcept,
  input: BrandInput,
  fonts: FontStore,
  options: RenderOptions,
) {
  const signatureSvg = renderSignature(concept, input, fonts, {
    variant: options.variant,
    part: options.part,
    lockup: options.lockup,
    boost: options.boost,
    ground: options.ground,
  });
  if (signatureSvg) return signatureSvg;
  const { concept: a, input: s } = applyNameFormat(concept, input);
  const lockup = options.lockup ?? "auto";
  const isWordmark = a.layout === "wordmark";
  const hasSwap = !!a.typo?.letterSwap && a.symbol?.kind === "icon";
  const drawnConcept =
    isWordmark &&
    !hasSwap &&
    (lockup === "monogram" || options.part === "symbol")
      ? {
          ...a,
          symbol: fallbackMonogram(a, s),
          symbolFilled: false,
        }
      : a;
  const ctx = renderContext(
    drawnConcept,
    s,
    fonts,
    options.variant ?? "color",
    options.ground,
  );
  const eingriff = eingriffOf(a);
  activeEingriff = eingriff
    ? {
        art: eingriff,
        mark: ctx.vc.mark,
        done: false,
      }
    : null;
  const part = options.part ?? "full";
  if (part === "symbol" || lockup === "monogram") {
    const y = symbolArt(drawnConcept, s, fonts, ctx.symColors, ctx.filled);
    return y
      ? opsToPart([placeSymbol(y, 0, 0, symbolScale(y.ink, CAP * 3))])
      : {
          body: "",
          width: 0,
          height: 0,
        };
  }
  if (part === "wordmark")
    return opsToPart(
      wordmarkOps(
        ctx,
        a.layout === "inline" && lockup !== "stacked" ? "left" : "center",
      ),
    );
  if (lockup === "horizontal")
    return opsToPart(
      isWordmark ? wordmarkOps(ctx, "center", "single") : inlineOps(ctx, true),
    );
  if (lockup === "stacked")
    return opsToPart(
      isWordmark
        ? wordmarkOps(ctx, "center", "two")
        : a.layout === "badge"
          ? badgeOps(ctx)
          : stackedOps(ctx),
    );
  if (!a.symbol && a.layout !== "badge") return opsToPart(wordmarkOps(ctx));
  switch (a.layout) {
    case "inline":
      return opsToPart(inlineOps(ctx));
    case "stacked":
      return opsToPart(stackedOps(ctx));
    case "badge":
      return opsToPart(badgeOps(ctx));
    default:
      return opsToPart(wordmarkOps(ctx));
  }
}

export function renderTagline(
  concept: LogoConcept,
  input: BrandInput,
  fonts: FontStore,
  variant: string = "color",
  ground?: string,
) {
  const a = cleanText(input.tagline);
  if (!a)
    return {
      body: "",
      width: 0,
      height: 0,
    };
  const s = resolveColors(concept, variant, ground);
  const o = sanitizePalette(concept.palette);
  let l = s.name;
  if (variant === "color") {
    l = contrast(s.suffix, s.ground) >= 4.5 ? s.suffix : o.ink;
  }
  if (variant === "reverse") {
    l = s.suffix;
  }
  const u = concept.tagline.font;
  const m = fonts.get(u);
  fallbackFonts = fallbacksFor(concept, fonts);
  try {
    const h = outline(
      m,
      applyCase(a, concept.tagline.case, u.key),
      sizeForCap(m, u.key, CAP),
      boostedTracking(concept.tagline.tracking),
    );
    return opsToPart([
      {
        k: "shape",
        d: h.d,
        x: 0,
        y: 0,
        w: h.width,
        h: h.height,
        fill: l,
      },
    ]);
  } finally {
    fallbackFonts = [];
  }
}

export function conceptFonts(
  concept: LogoConcept,
  input: BrandInput | undefined,
) {
  const t = [
    concept.name.font,
    concept.suffix.font,
    concept.tagline.font,
    concept.body,
    ...typoFonts(concept),
  ];
  if (concept.symbol?.kind === "monogram") {
    t.push(concept.symbol.font);
  }
  if (concept.signature) {
    t.push(...signatureFonts(concept, input ?? EMPTY_INPUT));
  }
  return t;
}

const EMPTY_INPUT: BrandInput = {
  name: "",
  suffix: "",
  tagline: "",
  styles: [],
  colorMoods: [],
  themes: [],
};

export function typoFonts(concept: LogoConcept) {
  const n = [];
  if (concept.typo?.split?.font) {
    n.push(concept.typo.split.font);
  }
  if (concept.typo?.ampersand) {
    n.push(concept.typo.ampersand);
  }
  return n;
}
