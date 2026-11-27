import { aA as D, aB as E, aC as O } from "./index-BER2gtDe.js";
import { n as c } from "./svg-CrwnZnJY.js";
function p(t) {
  let e = t.trim().replace(/^#/, "");
  return (
    e.length === 3 &&
      (e = e
        .split("")
        .map((n) => n + n)
        .join("")),
    [
      parseInt(e.slice(0, 2), 16) || 0,
      parseInt(e.slice(2, 4), 16) || 0,
      parseInt(e.slice(4, 6), 16) || 0,
    ]
  );
}
function R(t, e, n) {
  const i = (r) =>
    Math.round(Math.min(255, Math.max(0, r)))
      .toString(16)
      .padStart(2, "0");
  return `#${i(t)}${i(e)}${i(n)}`.toUpperCase();
}
function L(t, e, n) {
  const i = p(t),
    r = p(e);
  return R(i[0] + (r[0] - i[0]) * n, i[1] + (r[1] - i[1]) * n, i[2] + (r[2] - i[2]) * n);
}
function M(t) {
  const [e, n, i] = p(t).map((r) => {
    const s = r / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * e + 0.7152 * n + 0.0722 * i;
}
function X(t, e) {
  const n = M(t),
    i = M(e);
  return (Math.max(n, i) + 0.05) / (Math.min(n, i) + 0.05);
}
const _ = (t) => M(t) < 0.2;
function N(t) {
  const [e, n, i] = p(t).map((l) => l / 255),
    r = 1 - Math.max(e, n, i);
  if (r >= 0.999) return [0, 0, 0, 100];
  const s = (1 - e - r) / (1 - r),
    a = (1 - n - r) / (1 - r),
    o = (1 - i - r) / (1 - r);
  return [s, a, o, r].map((l) => Math.round(l * 100));
}
function U(t, e = "#000000") {
  if (typeof t != "string") return e;
  const n = t.trim();
  return /^#[0-9a-fA-F]{6}$/.test(n)
    ? n.toUpperCase()
    : /^#[0-9a-fA-F]{3}$/.test(n)
      ? `#${n
          .slice(1)
          .split("")
          .map((i) => i + i)
          .join("")}`.toUpperCase()
      : e;
}
function f(t) {
  return t === "none" || /^url\(#[A-Za-z0-9_-]+\)$/.test(t) ? t : U(t);
}
const Y = 6 * 0.3528,
  J = 7 * 0.3528,
  K = 8 * 0.3528,
  b = 200,
  A = new WeakMap(),
  j = new WeakMap();
function Q(t, e) {
  t !== e && j.set(t, e);
}
const x = (t, e) => e.trim() === "" || t.charToGlyphIndex(e) > 0;
function B(t, e) {
  const n = j.get(t);
  if (!n || [...e].every((r) => x(t, r))) return [{ font: t, text: e }];
  const i = [];
  for (const r of e) {
    const s = x(t, r) || !x(n, r) ? t : n,
      a = i[i.length - 1];
    a && a.font === s ? (a.text += r) : i.push({ font: s, text: r });
  }
  return i;
}
function z(t, e, n) {
  let i = A.get(t);
  i || ((i = new Map()), A.set(t, i));
  const r = `${n}|${e}`;
  let s = i.get(r);
  return (s || ((s = E(t, e, b, n)), i.set(r, s)), s);
}
function F(t, e, n, i = 0) {
  return B(t, e).length === 1
    ? (z(t, e, i).width * n) / b
    : d(t, e, { x: 0, y: 0, size: n, fill: "#000", tracking: i }).width;
}
function d(t, e, n) {
  const i = B(t, e);
  if (i.length > 1) return V(i, n);
  const r = z(t, e, n.tracking ?? 0),
    s = n.size / b,
    a = r.width * s;
  if (!r.d) return { svg: "", width: 0, ascent: 0, descent: 0 };
  const o = n.anchor === "middle" ? n.x - a / 2 : n.anchor === "end" ? n.x - a : n.x,
    l = n.y - r.ascent * s,
    $ = n.opacity !== void 0 && n.opacity < 1 ? ` opacity="${c(n.opacity)}"` : "";
  return {
    svg: `<path transform="translate(${c(o, 3)} ${c(l, 3)}) scale(${c(s, 6)})" d="${r.d}" fill="${f(n.fill)}"${$}/>`,
    width: a,
    ascent: r.ascent * s,
    descent: (r.height - r.ascent) * s,
  };
}
function V(t, e) {
  const n = e.tracking ?? 0,
    i = [];
  let r = 0,
    s = 0,
    a = 0;
  t.forEach(($, h) => {
    const u = O($.font, $.text, e.size, n),
      S = $.font.getPath($.text, 0, 0, e.size, { kerning: !0, letterSpacing: n }).getBoundingBox(),
      g = d($.font, $.text, { ...e, x: 0, y: 0, anchor: "start" });
    if (g.svg) {
      const w = isFinite(S.x1) ? S.x1 : 0;
      (h === 0 && (s = r + w),
        (a = r + w + g.width),
        i.push({
          svg: `<g transform="translate(${c(r + w, 4)} 0)">${g.svg}</g>`,
          asc: g.ascent,
          desc: g.descent,
        }));
    }
    r += u;
  });
  const o = a - s,
    l = (e.anchor === "middle" ? e.x - o / 2 : e.anchor === "end" ? e.x - o : e.x) - s;
  return {
    svg: `<g transform="translate(${c(l, 3)} ${c(e.y, 3)})">${i.map(($) => $.svg).join("")}</g>`,
    width: o,
    ascent: Math.max(0, ...i.map(($) => $.asc)),
    descent: Math.max(0, ...i.map(($) => $.desc)),
  };
}
function tt(t, e, n, i, r = 0, s = i * 0.4) {
  const a = F(t, e, i, r);
  return a <= n || a === 0 ? i : Math.max(s, (i * n) / a);
}
function W(t, e, n, i, r = 0) {
  const s = e.split(/\s+/).filter(Boolean),
    a = [];
  let o = "";
  for (const l of s) {
    const $ = o ? `${o} ${l}` : l;
    o && F(t, $, n, r) > i ? (a.push(o), (o = l)) : (o = $);
  }
  return (o && a.push(o), a);
}
const nt = (t, e) => D(t, e);
function et(t, e, n) {
  return d(t, e.toLocaleUpperCase("de-AT"), { tracking: 0.14, ...n });
}
function st(t, e, n) {
  const i = n.leading ?? n.size * 1.45,
    r = e
      .split(
        `
`,
      )
      .flatMap((a) => (a.trim() ? W(t, a, n.size, n.maxWidth, n.tracking ?? 0) : [""]));
  let s = "";
  return (
    r.forEach((a, o) => {
      a && (s += d(t, a, { ...n, y: n.y + o * i }).svg);
    }),
    { svg: s, h: (r.length - 1) * i, lines: r.length }
  );
}
const m = (t) =>
    t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
  it = m;
function H(t, e, n, i = {}) {
  const s =
      (i.unit ?? "px") === "mm"
        ? ` width="${c(t)}mm" height="${c(e)}mm"`
        : ` width="${c(t)}" height="${c(e)}"`,
    a = i.title ? `<title>${m(i.title)}</title>` : "",
    o = i.defs ? `<defs>${i.defs}</defs>` : "",
    l = i.background
      ? `<rect x="0" y="0" width="${c(t)}" height="${c(e)}" fill="${f(i.background)}"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${c(t)} ${c(e)}"${s}>${a}${o}${l}${n}</svg>`;
}
function I(t) {
  const e = t.match(/<svg\b[^>]*\bviewBox="([^"]+)"/);
  if (!e) return null;
  const [n, i, r, s] = e[1].split(/[\s,]+/).map(Number);
  return { x: n, y: i, w: r, h: s };
}
function rt(t, e, n) {
  return t.replace(
    /<svg\b([^>]*)>/,
    (i, r) => `<svg${r.replace(/\s(width|height)="[^"]*"/g, "")} width="${c(e)}" height="${c(n)}">`,
  );
}
let v = 0;
function T(t) {
  return ((v = (v + 1) % 1e9), `${t}${v.toString(36)}`);
}
const ct = (t, e, n, i, r, s = "") =>
    `<rect x="${c(t, 3)}" y="${c(e, 3)}" width="${c(n, 3)}" height="${c(i, 3)}" fill="${f(r)}"${s ? " " + s : ""}/>`,
  P = (t, e, n, i, r, s = "") =>
    `<line x1="${c(t, 3)}" y1="${c(n, 3)}" x2="${c(e, 3)}" y2="${c(n, 3)}" stroke="${f(i)}" stroke-width="${c(r, 3)}"${s ? " " + s : ""}/>`,
  C = (t, e, n, i, r, s = "") =>
    `<line x1="${c(t, 3)}" y1="${c(e, 3)}" x2="${c(t, 3)}" y2="${c(n, 3)}" stroke="${f(i)}" stroke-width="${c(r, 3)}"${s ? " " + s : ""}/>`,
  at = (t, e, n, i, r = "") =>
    `<circle cx="${c(t, 3)}" cy="${c(e, 3)}" r="${c(n, 3)}" fill="${f(i)}"${r ? " " + r : ""}/>`,
  ot = (t, e) => `<g transform="${t}">${e}</g>`;
function lt(t, e, n, i, r) {
  const s = Math.min(r, n / 2, i / 2);
  return `M${c(t + s, 3)} ${c(e, 3)}H${c(t + n - s, 3)}A${c(s, 3)} ${c(s, 3)} 0 0 1 ${c(t + n, 3)} ${c(e + s, 3)}V${c(e + i - s, 3)}A${c(s, 3)} ${c(s, 3)} 0 0 1 ${c(t + n - s, 3)} ${c(e + i, 3)}H${c(t + s, 3)}A${c(s, 3)} ${c(s, 3)} 0 0 1 ${c(t, 3)} ${c(e + i - s, 3)}V${c(e + s, 3)}A${c(s, 3)} ${c(s, 3)} 0 0 1 ${c(t + s, 3)} ${c(e, 3)}Z`;
}
function $t(t, e, n, i, r, s = 5, a = 1, o = 0.25) {
  const l = r + a,
    $ = "#000000",
    h = [];
  for (const u of [t, t + n])
    h.push(C(u, e - l - s, e - l, $, o), C(u, e + i + l, e + i + l + s, $, o));
  for (const u of [e, e + i])
    h.push(P(t - l - s, t - l, u, $, o), P(t + n + l, t + n + l + s, u, $, o));
  return h.join("");
}
function ut(t, e, n, i, r, s = "") {
  return /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/.test(t)
    ? `<image x="${c(e, 3)}" y="${c(n, 3)}" width="${c(i, 3)}" height="${c(r, 3)}" preserveAspectRatio="xMidYMid slice" href="${m(t)}" xlink:href="${m(t)}"${s ? " " + s : ""}/>`
    : "";
}
function ft(t, e, n, i) {
  const r = I(t) ?? { x: 0, y: 0, w: 100, h: 100 },
    s = t
      .replace(/^<svg\b[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/<title>[\s\S]*?<\/title>/, ""),
    a = i / r.w,
    o = T("em");
  return {
    svg: `<g transform="translate(${c(e, 3)} ${c(n, 3)}) scale(${c(a, 6)})"><defs><clipPath id="${o}"><rect x="${c(r.x)}" y="${c(r.y)}" width="${c(r.w)}" height="${c(r.h)}"/></clipPath></defs><g clip-path="url(#${o})">${s}</g></g>`,
    h: r.h * a,
  };
}
function ht(t, e, n, i) {
  const r = T("bd"),
    s = t + 2 * n,
    a = e + 2 * n;
  return H(
    s,
    a,
    `<defs><clipPath id="${r}"><rect x="${c(-n)}" y="${c(-n)}" width="${c(s)}" height="${c(a)}"/></clipPath></defs><g transform="translate(${c(n)} ${c(n)})"><g clip-path="url(#${r})">${i}</g></g>`,
    { unit: "mm" },
  );
}
const y = new Map();
function k(t, e) {
  const n = t.slice(0, Math.ceil(e / 3) * 4),
    i = typeof atob == "function" ? atob(n) : Buffer.from(n, "base64").toString("binary"),
    r = new Uint8Array(i.length);
  for (let s = 0; s < i.length; s++) r[s] = i.charCodeAt(s);
  return r;
}
function Z(t) {
  if (t[0] !== 255 || t[1] !== 216) return null;
  let e = 2;
  for (; e + 9 < t.length; ) {
    if (t[e] !== 255) return null;
    const n = t[e + 1],
      i = (t[e + 2] << 8) | t[e + 3];
    if (n >= 192 && n <= 207 && n !== 196 && n !== 200 && n !== 204)
      return { h: (t[e + 5] << 8) | t[e + 6], w: (t[e + 7] << 8) | t[e + 8] };
    e += 2 + i;
  }
  return "more";
}
function gt(t) {
  const e = `${t.length}|${t.slice(0, 80)}|${t.slice(-40)}`;
  if (y.has(e)) return y.get(e) ?? null;
  let n = null;
  const i = /^data:([^;,]+);base64,/.exec(t);
  if (i) {
    const r = t.slice(i[0].length);
    try {
      if (i[1] === "image/png") {
        const s = k(r, 32);
        n = {
          w: (s[16] << 24) | (s[17] << 16) | (s[18] << 8) | s[19],
          h: (s[20] << 24) | (s[21] << 16) | (s[22] << 8) | s[23],
        };
      } else if (i[1] === "image/jpeg")
        for (const s of [4096, 7e4, 4e5]) {
          const a = Z(k(r, s));
          if (a !== "more") {
            n = a;
            break;
          }
        }
      else if (i[1] === "image/webp") {
        const s = k(r, 64),
          a = String.fromCharCode(s[12], s[13], s[14], s[15]);
        a === "VP8 "
          ? (n = { w: ((s[27] << 8) | s[26]) & 16383, h: ((s[29] << 8) | s[28]) & 16383 })
          : a === "VP8L"
            ? (n = {
                w: 1 + (((s[22] & 63) << 8) | s[21]),
                h: 1 + (((s[24] & 15) << 10) | (s[23] << 2) | ((s[22] & 192) >> 6)),
              })
            : a === "VP8X" &&
              (n = {
                w: 1 + (s[24] | (s[25] << 8) | (s[26] << 16)),
                h: 1 + (s[27] | (s[28] << 8) | (s[29] << 16)),
              });
      }
    } catch {
      n = null;
    }
  }
  return (n && (!(n.w > 0) || !(n.h > 0)) && (n = null), y.set(e, n), n);
}
export {
  ft as A,
  J as B,
  Y as C,
  ot as D,
  $t as E,
  ht as F,
  K as P,
  X as a,
  L as b,
  nt as c,
  U as d,
  _ as e,
  ct as f,
  ut as g,
  lt as h,
  F as i,
  at as j,
  et as k,
  M as l,
  d as m,
  H as n,
  P as o,
  tt as p,
  gt as q,
  Q as r,
  rt as s,
  it as t,
  T as u,
  C as v,
  W as w,
  st as x,
  p as y,
  N as z,
};
