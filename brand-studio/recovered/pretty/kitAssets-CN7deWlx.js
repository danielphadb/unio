const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./jspdf.es.min-B1MezrQ_.js",
      "./index-BER2gtDe.js",
      "./index-C94v3gle.css",
      "./svg2pdf.es.min-C0i_BZvn.js",
      "./engine-BhDRZEfO.js",
      "./svg-CrwnZnJY.js",
      "./imagesize-BHC6N02v.js",
      "./energy-DRQ_36b-.js",
      "./own-CMBusp3y.js",
    ]),
) => i.map((i) => d[i]);
import {
  a as Oe,
  z as Be,
  aw as ha,
  ax as bi,
  ay as ga,
  az as Or,
  av as pa,
  r as Qt,
} from "./index-BER2gtDe.js";
import {
  q as ma,
  n as ba,
  ah as no,
  ai as Hn,
  aj as wa,
  ak as zr,
  al as ya,
  w as ro,
  f as ge,
  e as va,
} from "./engine-BhDRZEfO.js";
import { o as wi, q as gn, n as I, t as io, l as ka, c as Er } from "./svg-CrwnZnJY.js";
import {
  d as sn,
  r as xr,
  e as _n,
  a as Vr,
  l as _a,
  b as Zn,
  s as $a,
  f as De,
  g as ir,
  u as te,
  h as Tt,
  i as Mt,
  j as Kr,
  k as _t,
  c as or,
  m as bt,
  n as ee,
  o as Gn,
  v as Vn,
  w as qr,
  p as ve,
  q as Sa,
  t as Aa,
  x as en,
  y as Ea,
  z as Ca,
  A as zn,
} from "./imagesize-BHC6N02v.js";
import { e as Yr, a as Fa, E as yi, b as Ia } from "./energy-DRQ_36b-.js";
var xn =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
      ? window
      : typeof global < "u"
        ? global
        : typeof self < "u"
          ? self
          : {};
function Oa(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
const yt = (t) => (t ?? "").trim();
function Xr(t) {
  return t ? !!yt(t.person) && (!!yt(t.phone) || !!yt(t.email)) : !1;
}
function za(t) {
  return t.split(/\s+/).filter((e) => e && !e.endsWith("."))[0] ?? "Anna";
}
function xa(t) {
  return t
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");
}
function Ma(t, n) {
  const e = t.name.trim().split(/\s+/),
    i =
      /^(immobilien|real|estate|gmbh|e\.u\.|og|kg|home|homes|wohnen|makler|group|partner|properties|invest|realty)$/i,
    o = e.length >= 2 && e.length <= 3 && !e.some((s) => i.test(s)),
    r = yt(n == null ? void 0 : n.person) || (o ? t.name.trim() : "Anna Muster"),
    a = xa(za(r)) || "anna";
  return {
    person: r,
    role: yt(n == null ? void 0 : n.role) || "Immobilienberaterin",
    phone: "+43 660 123 45 67",
    email: `${a}@beispiel.at`,
    web: "www.beispiel.at",
    street: "Musterstraße 1",
    city: "1010 Wien",
    unioPartner: (n == null ? void 0 : n.unioPartner) ?? !1,
    legal:
      yt(n == null ? void 0 : n.legal) ||
      "Muster Immobilien e.U. | FN 000000a | Handelsgericht Wien",
    photo: n == null ? void 0 : n.photo,
  };
}
function Ta(t, n) {
  return Xr(n) ? { contact: n, sample: !1 } : { contact: Ma(t, n), sample: !0 };
}
function qt(t) {
  return yt(t)
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}
function pn(t) {
  const n = yt(t);
  return n ? (/^https?:\/\//i.test(n) ? n : `https://${n}`) : "";
}
function La(t) {
  const n = yt(t).match(/^(?:[A-Z]{1,2}-)?(\d{4,5})\s+(.+)$/);
  return n ? { zip: n[1], locality: n[2] } : { zip: "", locality: yt(t) };
}
function ar(t) {
  return yt(t).replace(/[^\d+]/g, "");
}
function vi(t) {
  return [yt(t.street), yt(t.city)].filter(Boolean).join(", ");
}
function Pa(t) {
  return t
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function oo(t) {
  const n = yt(t).split(/\s+/).filter(Boolean),
    e = [];
  for (; n.length > 1 && /\.$/.test(n[0]); ) e.push(n.shift());
  const i = n.length > 1 ? n.pop() : "";
  return { prefix: e.join(" "), given: n.join(" "), family: i };
}
function ao(t) {
  const n = oo(t),
    e = n.given.charAt(0),
    i = n.family.charAt(0);
  return (e + i).toLocaleUpperCase("de-AT") || t.trim().charAt(0).toLocaleUpperCase("de-AT");
}
function so(t, n) {
  const e = Pa,
    i = oo(t.person),
    o = ["BEGIN:VCARD", "VERSION:3.0"];
  if (
    (o.push(`N:${e(i.family)};${e(i.given)};;${e(i.prefix)};`),
    o.push(`FN:${e(yt(t.person))}`),
    n && yt(n) && yt(n) !== yt(t.person) && o.push(`ORG:${e(yt(n))}`),
    yt(t.role) && o.push(`TITLE:${e(yt(t.role))}`),
    yt(t.phone) && o.push(`TEL;TYPE=CELL,VOICE:${ar(t.phone)}`),
    yt(t.email) && o.push(`EMAIL;TYPE=INTERNET,WORK:${e(yt(t.email))}`),
    yt(t.web) && o.push(`URL:${pn(t.web)}`),
    yt(t.street) || yt(t.city))
  ) {
    const { zip: r, locality: a } = La(t.city);
    o.push(`ADR;TYPE=WORK:;;${e(yt(t.street))};${e(a)};;${e(r)};`);
  }
  return (
    o.push("END:VCARD"),
    o.join(`\r
`)
  );
}
function Ba(t, n = "marke") {
  return (
    t
      .replace(/Ä/g, "Ae")
      .replace(/Ö/g, "Oe")
      .replace(/Ü/g, "Ue")
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/&/g, " und ")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || n
  );
}
const ki = new WeakMap(),
  Da = (t) => [
    t.concept,
    t.input,
    t.contact,
    t.fonts,
    t.input.name,
    t.input.suffix,
    t.input.tagline,
    JSON.stringify(t.contact ?? null),
    t.object,
    Be(lo(t.fonts, t.concept.body)),
  ];
function lo(t, n) {
  const i = [...Oe(n.key).weights].filter((o) => o > n.weight).sort((o, r) => o - r);
  for (const o of i)
    if (t.has({ key: n.key, weight: o, style: n.style }))
      return { key: n.key, weight: o, style: n.style };
  return n;
}
function co(t) {
  const n = new Map();
  for (const e of t) {
    const i = [...no(e)],
      o = Oe(e.body.key);
    for (const r of o.weights) i.push({ key: e.body.key, weight: r });
    for (const r of i) n.set(Be(r), r);
  }
  return [...n.values()];
}
class Na extends Error {
  constructor(n) {
    (super(
      `Export abgebrochen: Schrift fehlt (${n.map((e) => `${Oe(e.key).family} ${e.weight}${e.style === "italic" ? " kursiv" : ""}`).join(", ")}). Lade die Seite neu und versuch es noch einmal.`,
    ),
      (this.missing = n),
      (this.name = "MissingFontError"));
  }
}
function $n(t) {
  const n = new Set(),
    e = no(t.concept).filter((i) => !t.fonts.has(i) && !n.has(Be(i)) && !!n.add(Be(i)));
  if (e.length) throw new Na(e);
}
function Et(t) {
  const n = Da(t),
    e = ki.get(t);
  if (e && e.key.every((V, ft) => V === n[ft])) return e.kit;
  const { concept: i, input: o, fonts: r } = t,
    a = i.palette,
    s = {
      ...a,
      primary: sn(a.primary, "#333333"),
      secondary: sn(a.secondary, "#777777"),
      accent: sn(a.accent, "#999999"),
      ink: sn(a.ink, "#1A1A1A"),
      paper: sn(a.paper, "#F7F5F1"),
    },
    l = { ...i, palette: s },
    c = i.name.font,
    u = r.get(c),
    f = Oe(c.key),
    h = i.body,
    d = lo(r, h),
    b = r.get(h),
    g = r.get(d);
  xr(u, b);
  const y = f.cat === "script",
    m = y ? g : u,
    v = !y && !!f.capsOnly,
    k = (V) =>
      [V.name, V.suffix]
        .map((ft) => (ft ?? "").trim())
        .filter(Boolean)
        .join(" "),
    C = k(ma(l, o).input) || k(o),
    z = k(o),
    { contact: L, sample: A } = Ta(o, t.contact),
    O = _n(s.primary) && Vr(s.primary, "#FFFFFF") >= 7 ? s.primary : s.ink,
    $ = s.paper,
    x = _a($) > 0.8 ? $ : "#FFFFFF",
    P = wi(s, $),
    _ = wi(s, O),
    T = Zn(s.ink, $, 0.38),
    w = Zn(s.ink, $, 0.82),
    R = new Map(),
    Q = (V) => (V === "reverse" || V === "mono-light" ? O : $),
    N = (V = "color", ft = "full") => {
      const At = `${V}|${ft}`;
      let ct = R.get(At);
      return (
        ct || ((ct = Hn(l, o, r, { variant: V, part: ft, ground: Q(V) })), R.set(At, ct)),
        ct
      );
    },
    tt = new Map(),
    Z = (V = "color") => {
      let ft = tt.get(V);
      return (ft || ((ft = wa(l, o, r, V, Q(V))), tt.set(V, ft)), ft);
    },
    nt = ba(o.name, 2) || o.name.trim().charAt(0).toUpperCase() || "A",
    j = new Map(),
    D = (V, ft) => {
      const At = `${V}|${ft}`;
      let ct = j.get(At);
      return (
        ct || ((ct = Hn(l, o, r, { variant: V, ground: Q(V), lockup: ft })), j.set(At, ct)),
        ct
      );
    },
    et = (V) => (v ? ha(V, "upper", c.key) : V),
    X = {
      assets: t,
      concept: l,
      p: s,
      brandName: C,
      slug: Ba(z),
      display: u,
      displayRef: c,
      head: m,
      headCaps: v,
      body: b,
      bodyBold: g,
      bodyRef: h,
      bodyBoldRef: d,
      contact: L,
      sample: A,
      dark: O,
      paper: $,
      onDark: x,
      accentOnPaper: P,
      accentOnDark: _,
      muted: T,
      hairline: w,
      logo: N,
      tagline: Z,
      mark: (V = "color") => D(V, "monogram"),
      lockup: D,
      initials: nt,
      headText: et,
    };
  return (ki.set(t, { kit: X, key: n }), X);
}
const Pe = {};
function mn() {
  const t = globalThis.scheduler;
  return t != null && t.yield
    ? t.yield()
    : typeof MessageChannel > "u"
      ? new Promise((n) => setTimeout(n, 0))
      : new Promise((n) => {
          const e = new MessageChannel();
          ((e.port1.onmessage = () => {
            (e.port1.close(), n());
          }),
            e.port2.postMessage(0));
        });
}
function uo() {
  return typeof document < "u" && typeof Image < "u";
}
function Ra(t) {
  if (!uo()) throw new Error(`${t} braucht einen Browser (Canvas)`);
}
function ja(t) {
  return new Promise((n, e) => {
    const i = new Image();
    ((i.decoding = "async"),
      (i.onload = () => n(i)),
      (i.onerror = () => e(new Error("SVG konnte nicht gerastert werden"))),
      (i.src = t));
  });
}
async function _e(t, n, e, i) {
  if (Pe.png) return Pe.png(t, n, e, i);
  Ra("svgToPng");
  const o = Math.max(1, Math.round(n)),
    r = Math.max(1, Math.round(e)),
    a = $a(t, o, r),
    s = URL.createObjectURL(new Blob([a], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const l = await ja(s),
      c = document.createElement("canvas");
    ((c.width = o), (c.height = r));
    const u = c.getContext("2d");
    if (!u) throw new Error("Canvas nicht verfuegbar");
    ((u.imageSmoothingEnabled = !0),
      (u.imageSmoothingQuality = "high"),
      i && ((u.fillStyle = i), u.fillRect(0, 0, o, r)));
    const f = o * r > 15e5 ? Math.max(256, Math.floor(6e5 / o)) : r;
    for (let d = 0; d < r; d += f)
      (u.save(),
        u.beginPath(),
        u.rect(0, d, o, Math.min(f, r - d)),
        u.clip(),
        u.drawImage(l, 0, 0, o, r),
        u.restore(),
        d + f < r && (await mn()));
    const h = await new Promise((d) => c.toBlob(d, "image/png"));
    if (!h) throw new Error("PNG konnte nicht erstellt werden");
    return h;
  } finally {
    URL.revokeObjectURL(s);
  }
}
async function fo(t) {
  return new Uint8Array(await t.arrayBuffer());
}
async function _i(t) {
  const n = await fo(t);
  let e = "";
  for (let i = 0; i < n.length; i += 32768) e += String.fromCharCode(...n.subarray(i, i + 32768));
  return `data:${t.type || "image/png"};base64,${btoa(e)}`;
}
async function Mr(t, n = {}) {
  if (!t.length) throw new Error("svgToPdf: keine Seiten");
  if (Pe.pdf) return Pe.pdf(t, n);
  throw new Error("svgToPdf braucht einen Browser (DOM)");
}
function Qr(t) {
  const n = {
    id: t.id,
    group: t.group,
    label: t.label,
    description: t.description,
    sizeLabel: t.sizeLabel,
    formats: t.formats,
    needsContact: t.needsContact,
    preview: (e) => t.preview(Et(e)),
    plan: (e) => (t.available && !t.available(Et(e)) ? [] : t.files(Et(e))),
    exportFiles: async (e) => {
      $n(e);
      const i = t.available && !t.available(Et(e)) ? [] : t.files(Et(e)),
        o = [];
      for (const r of i) o.push({ path: r.path, mime: r.mime, data: await r.make() });
      return o;
    },
  };
  if (t.available) {
    const e = t.available;
    n.available = (i) => e(Et(i));
  }
  if (t.missingInfo) {
    const e = t.missingInfo;
    n.missingInfo = (i) => e(Et(i));
  }
  if (t.pages) {
    const e = t.pages;
    n.pages = (i) => e(Et(i));
  }
  return n;
}
const jt = {
  logo: "01_logo",
  icons: "01_logo/profilbild-und-icons",
  online: "02_online",
  print: "03_drucksachen",
  guide: "04_brand-guide",
};
function Jr(t, n, e) {
  return { path: t, note: n, mime: "image/svg+xml", make: async () => e() };
}
function Qe(t, n, e, i, o, r) {
  return { path: t, note: n, mime: "image/png", make: () => _e(e(), i, o, r) };
}
function Wa(t, n, e, i = {}) {
  return { path: t, note: n, mime: "application/pdf", make: () => Mr(e(), i) };
}
function $i(t, n, e, i) {
  return { path: t, note: n, mime: e, make: async () => i() };
}
function Su(t, n, e, i, o = "end") {
  const r = "BEISPIELDATEN",
    a = Mt(t.bodyBold, r, i, 0.12),
    s = i * 0.9,
    l = i * 2.2,
    c = a + s * 2,
    u = o === "end" ? n - c : n,
    f = bt(t.bodyBold, r, {
      x: u + s,
      y: e + l / 2 + or(t.bodyBold, i) / 2,
      size: i,
      fill: "#FFFFFF",
      tracking: 0.12,
    });
  return `<g data-role="beispieldaten"><path d="${Tt(u, e, c, l, l / 2)}" fill="#C0392B"/>${f.svg}</g>`;
}
function Gt(t, n, e, i, o, r = "middle", a = "middle") {
  if (!t.width || !t.height) return { svg: "", w: 0, h: 0, x: n, y: e };
  const s = Math.min(i / t.width, o / t.height),
    l = t.width * s,
    c = t.height * s,
    u = r === "start" ? n : r === "end" ? n + i - l : n + (i - l) / 2,
    f = a === "top" ? e : a === "bottom" ? e + o - c : e + (o - c) / 2;
  return { svg: gn(t, u, f, s), w: l, h: c, x: u, y: f };
}
function Au(t, n, e, i, o, r = {}) {
  const a = r.base ?? t.p.primary,
    s = _n(a),
    l = s ? "#FFFFFF" : t.p.ink,
    c = te("ph"),
    u = r.radius ?? 0,
    f = u ? Tt(n, e, i, o, u) : `M${I(n, 3)} ${I(e, 3)}h${I(i, 3)}v${I(o, 3)}h${I(-i, 3)}z`,
    h = Ua(n, e, i, o, l, 0.13),
    d = `<clipPath id="${c}"><path d="${f}"/></clipPath>`,
    b = r.text ?? "Objektfoto hier",
    g = r.labelSize ?? Math.min(i, o) * 0.045,
    y = Mt(t.bodyBold, b.toLocaleUpperCase("de-AT"), g, 0.14),
    m = g * 2.6,
    v = y + m + g * 3.6,
    k = g * 3.4,
    C = n + (i - v) / 2,
    z = e + (o - k) / 2,
    L = C + g * 1.4,
    A = z + (k - m * 0.78) / 2,
    O =
      `<path d="${Tt(L, A, m, m * 0.78, m * 0.1)}" fill="none" stroke="${l}" stroke-width="${I(g * 0.16, 3)}"/><path d="M${I(L + m * 0.12, 3)} ${I(A + m * 0.66, 3)}L${I(L + m * 0.4, 3)} ${I(A + m * 0.36, 3)}L${I(L + m * 0.6, 3)} ${I(A + m * 0.54, 3)}L${I(L + m * 0.72, 3)} ${I(A + m * 0.44, 3)}L${I(L + m * 0.9, 3)} ${I(A + m * 0.66, 3)}" fill="none" stroke="${l}" stroke-width="${I(g * 0.16, 3)}" stroke-linejoin="round" stroke-linecap="round"/>` +
      Kr(L + m * 0.7, A + m * 0.22, m * 0.08, l),
    $ = _t(t.bodyBold, b, {
      x: L + m + g * 1,
      y: z + k / 2 + or(t.bodyBold, g) / 2,
      size: g,
      fill: l,
    });
  return (
    `<g data-role="bildplatzhalter"><defs>${d}</defs><g clip-path="url(#${c})"><rect x="${I(n, 3)}" y="${I(e, 3)}" width="${I(i, 3)}" height="${I(o, 3)}" fill="${a}"/>` +
    h +
    `</g><path d="${Tt(C, z, v, k, k / 2)}" fill="${s ? "#000000" : "#FFFFFF"}" fill-opacity="${s ? 0.28 : 0.6}"/>${O}${$.svg}</g>`
  );
}
function Ua(t, n, e, i, o, r, a = Math.min(e, i) / 4.2) {
  const s = Math.max(3, Math.round(e / a)),
    l = e / s,
    c = Math.max(2, Math.round(i / (a * 1.35))),
    u = i / c,
    f = Math.max(a * 0.012, 0.15);
  let h = "";
  for (let b = 0; b < s; b++)
    for (let g = 0; g < c; g++) {
      const y = l * 0.42,
        m = u * 0.58,
        v = t + b * l + (l - y) / 2,
        k = n + g * u + u * 0.24,
        C = y / 2;
      h += `M${I(v, 2)} ${I(k + m, 2)}V${I(k + C, 2)}A${I(C, 2)} ${I(C, 2)} 0 0 1 ${I(v + y, 2)} ${I(k + C, 2)}V${I(k + m, 2)}Z`;
    }
  let d = "";
  for (let b = 1; b < c; b++) d += `M${I(t, 2)} ${I(n + b * u + u * 0.06, 2)}h${I(e, 2)}`;
  return `<path d="${h}" fill="none" stroke="${o}" stroke-opacity="${I(r, 3)}" stroke-width="${I(f, 3)}"/><path d="${d}" fill="none" stroke="${o}" stroke-opacity="${I(r * 0.6, 3)}" stroke-width="${I(f, 3)}"/>`;
}
function Eu(t, n, e, i, o) {
  return `<path d="M${I(t, 2)} ${I(n, 2)}L${I(t + e, 2)} ${I(n + e, 2)}M${I(t + e * 0.3, 2)} ${I(n + e, 2)}H${I(t + e, 2)}V${I(n + e * 0.3, 2)}" fill="none" stroke="${i}" stroke-width="${I(o, 2)}" stroke-linecap="square"/>`;
}
function Cu(t, n, e, i, o = {}) {
  var h;
  const r = o.h ?? (i * 4) / 3,
    a = o.ground ?? t.p.primary,
    s = te("pt"),
    l = o.radius ?? 0,
    c = l ? Tt(n, e, i, r, l) : `M${I(n, 3)} ${I(e, 3)}h${I(i, 3)}v${I(r, 3)}h${I(-i, 3)}z`,
    u = (h = t.assets.contact) == null ? void 0 : h.photo;
  let f;
  if (u) f = De(n, e, i, r, a) + ir(u, n, e, i, r, go(a));
  else {
    const b = _n(a) ? "#FFFFFF" : t.p.ink,
      g = o.initials ?? (ao(t.contact.person) || t.initials),
      y = i * 0.3,
      m = bt(t.display, g, {
        x: n + i / 2,
        y: e + r * 0.5 + or(t.display, y) / 2,
        size: y,
        fill: b,
        anchor: "middle",
        opacity: 0.9,
      }),
      v = n + i / 2,
      k = `<path d="M${I(n + i * 0.1, 3)} ${I(e + r, 3)}C${I(n + i * 0.14, 3)} ${I(e + r * 0.82, 3)} ${I(v - i * 0.2, 3)} ${I(e + r * 0.78, 3)} ${I(v, 3)} ${I(e + r * 0.78, 3)}C${I(v + i * 0.2, 3)} ${I(e + r * 0.78, 3)} ${I(n + i * 0.86, 3)} ${I(e + r * 0.82, 3)} ${I(n + i * 0.9, 3)} ${I(e + r, 3)}Z" fill="${b}" fill-opacity="0.08"/>`,
      C = o.showHint
        ? _t(t.body, "Porträt 3:4", {
            x: n + i / 2,
            y: e + r * 0.9,
            size: i * 0.045,
            fill: b,
            anchor: "middle",
            opacity: 0.7,
          }).svg
        : "";
    f = De(n, e, i, r, a) + k + m.svg + C;
  }
  return {
    svg: `<g data-role="portraet"><defs><clipPath id="${s}"><path d="${c}"/></clipPath></defs><g clip-path="url(#${s})">${f}</g></g>`,
    h: r,
  };
}
const Kn = { x: 0.5, yFromTop: 0.27 };
function ho(t, n, e) {
  const i = n / 0.66,
    o = (i * 4) / 3,
    r = n / 2 - i * Kn.x,
    a = n / 2 - o * Kn.yFromTop;
  return De(0, 0, n, n, e) + ir(t, r, a, i, o, go(e));
}
const go = (t) => `data-ground="${t}"`;
function Fu(t, n, e, i, o, r = "start") {
  if (!t.contact.unioPartner) return "";
  const a = "PARTNER IM",
    s = "UNIO CIRCLE",
    l = Mt(t.body, a, i, 0.16) + i * 0.62,
    c = Mt(t.bodyBold, s, i, 0.16),
    u = l + c,
    f = r === "middle" ? n - u / 2 : r === "end" ? n - u : n;
  return (
    '<g data-role="unio-circle">' +
    bt(t.body, a, { x: f, y: e, size: i, fill: o, tracking: 0.16, opacity: 0.8 }).svg +
    bt(t.bodyBold, s, { x: f + l, y: e, size: i, fill: o, tracking: 0.16 }).svg +
    "</g>"
  );
}
const Tr = {
    color: "farbig",
    reverse: "auf-dunkel",
    "mono-dark": "schwarz",
    "mono-light": "weiss",
  },
  po = {
    color: "Logo farbig",
    reverse: "Logo auf dunkel",
    "mono-dark": "Logo schwarz",
    "mono-light": "Logo weiß",
  },
  mo = ["color", "reverse", "mono-dark", "mono-light"],
  ti = (t) => t === "reverse" || t === "mono-light",
  Ha = {
    main: "logo",
    horizontal: "logo-liegend",
    stacked: "logo-gestapelt",
    monogram: "monogramm",
  },
  sr = { main: "Hauptlogo", horizontal: "Liegend", stacked: "Gestapelt", monogram: "Monogramm" },
  Za = {
    horizontal: { mm: 25, px: 120 },
    stacked: { mm: 14, px: 64 },
    monogram: { mm: 5, px: 16 },
  };
function Lr(t) {
  const n = t.concept.layout;
  return [
    ...(n === "inline" || n === "stacked" ? [] : ["main"]),
    "horizontal",
    "stacked",
    "monogram",
  ];
}
function lr(t, n, e) {
  return e === "main" ? t.logo(n, "full") : t.lockup(n, e);
}
function ei(t, n) {
  return n === "monogram" || n === "symbol" ? Math.max(t.width, t.height) / 3 : zr;
}
function Mn(t, n, e, i) {
  const o = lr(t, n, e);
  return io(o, { padding: ei(o, e), background: i });
}
function Ga(t, n, e) {
  const i = lr(t, n, e),
    o = ei(i, e);
  return { w: i.width + o * 2, h: i.height + o * 2 };
}
function Va(t, n) {
  const o = ti(n),
    r = o ? t.dark : n === "mono-dark" ? "#FFFFFF" : t.paper,
    a = o ? t.onDark : t.muted,
    s = o ? "#FFFFFF" : t.p.ink,
    l = Lr(t);
  let c = Gt(lr(t, n, l[0]), 220, 70, 760, 330).svg;
  const u = ["horizontal", "stacked", "monogram"],
    f = 1080 / 3,
    h = 500;
  return (
    (c += Gn(60, 1140, h - 30, s, 1.5, 'stroke-opacity="0.15"')),
    u.forEach((d, b) => {
      const g = 60 + b * f;
      b && (c += Vn(g, h, 750, s, 1.5, 'stroke-opacity="0.15"'));
      const y =
        d === "monogram"
          ? { w: 130, h: 130 }
          : d === "stacked"
            ? { w: 230, h: 150 }
            : { w: 300, h: 110 };
      ((c += Gt(t.lockup(n, d), g + (f - y.w) / 2, h + 10 + (150 - y.h) / 2, y.w, y.h).svg),
        (c += _t(t.body, sr[d], {
          x: g + f / 2,
          y: 742,
          size: 17,
          fill: a,
          anchor: "middle",
          tracking: 0.18,
        }).svg));
    }),
    ee(1200, 800, c, { background: r, title: `${t.brandName} ${po[n]}` })
  );
}
function Ka(t, n, e) {
  const r = ti(n) ? t.dark : n === "mono-dark" ? "#FFFFFF" : t.paper,
    a = e === "monogram" ? { w: 380, h: 380 } : { w: 860, h: 440 },
    s = Gt(lr(t, n, e), (1200 - a.w) / 2, (800 - a.h) / 2, a.w, a.h);
  return ee(1200, 800, s.svg, { background: r, title: `${t.brandName} ${sr[e]}` });
}
const Pr = {
  color: "auf hellem Grund",
  reverse: "für dunkle Flächen",
  "mono-dark": "einfarbig dunkel, z.B. für Stempel und Zeitungsinserate",
  "mono-light": "einfarbig weiß, für Fotos und dunkle Flächen",
};
function qa(t, n, e) {
  const i = `${t.slug}_${Ha[e]}_${Tr[n]}`,
    o = e === "main" ? "Logo" : e === "monogram" ? "Monogramm" : `Logo ${sr[e].toLowerCase()}`,
    r = `${o} ${Pr[n]}`,
    { w: a, h: s } = Ga(t, n, e),
    l = 2e3,
    c = Math.round((l * s) / a),
    u = e === "monogram" ? 60 : e === "stacked" ? 100 : 150,
    f = (u * s) / a,
    h = ti(n),
    d = [
      Jr(
        `${jt.logo}/svg/${i}.svg`,
        `${r}. Für Website und Grafiker, bleibt in jeder Größe scharf.`,
        () => Mn(t, n, e),
      ),
      Qe(
        `${jt.logo}/png/${i}.png`,
        `${r}. Für Word, PowerPoint, Social Media und WhatsApp (durchsichtiger Hintergrund).`,
        () => Mn(t, n, e),
        l,
        c,
      ),
    ];
  return (
    h &&
      d.push(
        Qe(
          `${jt.logo}/png/${i}_mit-hintergrund.png`,
          `${r}, mit dunklem Hintergrund in Markenfarbe.`,
          () => Mn(t, n, e, t.dark),
          l,
          c,
        ),
      ),
    d.push(
      Wa(
        `${jt.logo}/pdf/${i}.pdf`,
        h
          ? `${r}. Für die Druckerei (zur Ansicht mit dunklem Hintergrund).`
          : `${r}. Für die Druckerei.`,
        () => [{ svg: Mn(t, n, e, h ? t.dark : void 0), widthMm: u, heightMm: f }],
        { title: `${t.brandName} ${o}` },
      ),
    ),
    d
  );
}
function Ya(t) {
  return Qr({
    id: `logo-${t}`,
    group: "logo",
    label: po[t],
    description:
      t === "color"
        ? "Dein Logo für helle Hintergründe, liegend, gestapelt und als Monogramm."
        : t === "reverse"
          ? "Für dunkle Flächen, Fotos und dunkle Drucksachen."
          : t === "mono-dark"
            ? "Einfarbig dunkel, wenn nur eine Farbe gedruckt wird."
            : "Einfarbig weiß, für Fotos und dunkle Hintergründe.",
    sizeLabel: "liegend · gestapelt · Monogramm",
    formats: ["png", "svg", "pdf"],
    needsContact: !1,
    preview: (n) => Va(n, t),
    pages: (n) => Lr(n).map((e) => ({ label: sr[e], svg: Ka(n, t, e) })),
    files: (n) => Lr(n).flatMap((e) => qa(n, t, e)),
  });
}
function Si(t, n, e) {
  const o = Gt(t.logo(n, "symbol"), 150, 150, 700, 700);
  return ee(1e3, 1e3, o.svg, { background: e, title: `${t.brandName} Symbol` });
}
const Xa = Qr({
    id: "logo-symbol",
    group: "logo",
    label: "Symbol einzeln",
    description: "Nur das Symbol, quadratisch, z.B. für Stempel, Wasserzeichen und kleine Flächen.",
    sizeLabel: "1000 x 1000 px · 4 Farben",
    formats: ["png", "svg"],
    needsContact: !1,
    available: (t) => {
      var n;
      return ((n = t.concept.symbol) == null ? void 0 : n.kind) === "icon";
    },
    preview: (t) => {
      const i = Gt(t.logo("color", "symbol"), 130, 230, 340, 340).svg,
        o = Gt(t.logo("reverse", "symbol"), 730, 230, 340, 340).svg;
      return ee(
        1200,
        800,
        `<rect x="0" y="0" width="600" height="800" fill="${t.paper}"/><rect x="600" y="0" width="600" height="800" fill="${t.dark}"/>${i}${o}`,
        { title: `${t.brandName} Symbol` },
      );
    },
    files: (t) =>
      mo.flatMap((n) => [
        Jr(
          `${jt.logo}/svg/${t.slug}_symbol_${Tr[n]}.svg`,
          `Symbol ${Pr[n]}, quadratisch. Für Website und Grafiker.`,
          () => Si(t, n),
        ),
        Qe(
          `${jt.logo}/png/${t.slug}_symbol_${Tr[n]}.png`,
          `Symbol ${Pr[n]}, quadratisch, durchsichtiger Hintergrund.`,
          () => Si(t, n),
          1e3,
          1e3,
        ),
      ]),
  }),
  Qa = [...mo.map(Ya), Xa];
function Ja(t) {
  const n = t.length,
    e = 6 + 16 * n,
    i = e + t.reduce((s, l) => s + l.png.length, 0),
    o = new Uint8Array(i),
    r = new DataView(o.buffer);
  (r.setUint16(0, 0, !0), r.setUint16(2, 1, !0), r.setUint16(4, n, !0));
  let a = e;
  return (
    t.forEach((s, l) => {
      const c = 6 + 16 * l,
        u = s.size >= 256 ? 0 : s.size;
      ((o[c] = u),
        (o[c + 1] = u),
        (o[c + 2] = 0),
        (o[c + 3] = 0),
        r.setUint16(c + 4, 1, !0),
        r.setUint16(c + 6, 32, !0),
        r.setUint32(c + 8, s.png.length, !0),
        r.setUint32(c + 12, a, !0),
        o.set(s.png, a),
        (a += s.png.length));
    }),
    o
  );
}
function ts(t, n) {
  const e = n < 48 ? 1.2 : 1;
  return Hn(t.concept, t.assets.input, t.assets.fonts, {
    lockup: "monogram",
    variant: "reverse",
    ground: t.dark,
    boost: e,
  });
}
function Fe(t, n) {
  const i = n.px <= 48,
    o = i ? ts(t, n.px) : t.mark("reverse"),
    a = 512 * (n.px <= 16 ? 0.84 : n.px <= 32 ? 0.78 : i ? 0.72 : 0.56),
    s = n.rounded
      ? `<path d="${Tt(0, 0, 512, 512, 512 * 0.2)}" fill="${t.dark}"/>`
      : De(0, 0, 512, 512, t.dark);
  return ee(512, 512, s + Gt(o, (512 - a) / 2, (512 - a) / 2, a, a).svg, { title: "Icon" });
}
function es(t) {
  let i = De(0, 0, 1200, 800, t.paper);
  const o = (d, b, g, y) => {
      const m = d
        .replace(/^<svg[^>]*>/, "")
        .replace(/<\/svg>$/, "")
        .replace(/<title>.*?<\/title>/, "");
      return `<g transform="translate(${I(b)} ${I(g)}) scale(${I(y / 512, 5)})">${m}</g>`;
    },
    r = 80,
    a = 90;
  ((i += `<path d="${Tt(r, a, 520, 92, 18)}" fill="#FFFFFF"/>`),
    (i += `<path d="${Tt(r, a + 70, 1040, 230, 0)}" fill="#FFFFFF"/>`),
    (i += o(Fe(t, { px: 32, rounded: !0 }), r + 30, a + 26, 40)));
  const s = t.brandName,
    l = Math.min(30, (380 / Math.max(1, Mt(t.body, s, 30))) * 30);
  ((i += bt(t.body, s, { x: r + 92, y: a + 57, size: l, fill: t.p.ink }).svg),
    (i += `<rect x="${r + 40}" y="${a + 130}" width="560" height="18" rx="9" fill="${t.hairline}"/><rect x="${r + 40}" y="${a + 170}" width="420" height="18" rx="9" fill="${t.hairline}"/><rect x="${r + 40}" y="${a + 210}" width="480" height="18" rx="9" fill="${t.hairline}"/>`));
  const c = 80,
    u = 470,
    f = te("ai");
  ((i += `<defs><clipPath id="${f}"><path d="${Tt(c, u, 220, 220, 50)}"/></clipPath></defs><g clip-path="url(#${f})">${o(Fe(t, { px: 180 }), c, u, 220)}</g>`),
    (i += bt(t.body, "App-Icon", {
      x: c + 110,
      y: u + 262,
      size: 24,
      fill: t.muted,
      anchor: "middle",
    }).svg));
  let h = 400;
  for (const d of [48, 32, 16]) {
    const b = d * 3;
    ((i += o(Fe(t, { px: d, rounded: !0 }), h, u + 220 - b, b)),
      (i += bt(t.body, `${d} px`, {
        x: h + b / 2,
        y: u + 262,
        size: 24,
        fill: t.muted,
        anchor: "middle",
      }).svg),
      (h += b + 70));
  }
  return ee(1200, 800, i, { title: "Favicon und App-Icon" });
}
const ns = (t) =>
    JSON.stringify(
      {
        name: t.brandName,
        short_name: t.assets.input.name.trim().slice(0, 24),
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        theme_color: t.dark,
        background_color: t.paper,
        display: "standalone",
      },
      null,
      2,
    ),
  rs = `So baust du die Icons in deine Website ein (Dateien ins Hauptverzeichnis der Website legen):\r
\r
<link rel="icon" href="/favicon.ico" sizes="48x48">\r
<link rel="icon" href="/favicon.svg" type="image/svg+xml">\r
<link rel="apple-touch-icon" href="/apple-touch-icon.png">\r
<link rel="manifest" href="/site.webmanifest">\r
`,
  is = Qr({
    id: "favicon",
    group: "digital",
    label: "Favicon und App-Icon",
    description:
      "Das kleine Symbol im Browser-Tab und auf dem Handy-Startbildschirm. Für kleine Größen automatisch vereinfacht.",
    sizeLabel: "16 bis 512 px",
    formats: ["ico", "png", "svg"],
    needsContact: !1,
    preview: es,
    files: (t) => [
      {
        path: `${jt.icons}/favicon.ico`,
        mime: "image/x-icon",
        note: "Symbol für den Browser-Tab (16, 32 und 48 px in einer Datei).",
        make: async () => {
          const n = [];
          for (const e of [16, 32, 48])
            n.push({ size: e, png: await fo(await _e(Fe(t, { px: e, rounded: !0 }), e, e)) });
          return Ja(n);
        },
      },
      Jr(
        `${jt.icons}/favicon.svg`,
        "Symbol für den Browser-Tab, für moderne Browser, bleibt scharf.",
        () => Fe(t, { px: 32, rounded: !0 }),
      ),
      Qe(
        `${jt.icons}/apple-touch-icon.png`,
        "Icon für iPhone und iPad, wenn jemand deine Website auf den Startbildschirm legt.",
        () => Fe(t, { px: 180 }),
        180,
        180,
      ),
      Qe(
        `${jt.icons}/icon-192.png`,
        "Icon für Android-Handys.",
        () => Fe(t, { px: 192 }),
        192,
        192,
      ),
      Qe(
        `${jt.icons}/icon-512.png`,
        "Großes App-Icon, z.B. für Google oder App-Verzeichnisse.",
        () => Fe(t, { px: 512 }),
        512,
        512,
      ),
      $i(
        `${jt.icons}/site.webmanifest`,
        "Technische Datei für deine Website (nennt Name, Farben und Icons).",
        "application/manifest+json",
        () => ns(t),
      ),
      $i(
        `${jt.icons}/website-einbau.txt`,
        "Anleitung für deine Website: diese Zeilen kommen in den Kopf jeder Seite.",
        "text/plain;charset=utf-8",
        () => rs,
      ),
    ],
  }),
  nn = function (t, n) {
    let o = t;
    const r = fn[n];
    let a = null,
      s = 0,
      l = null;
    const c = [],
      u = {},
      f = function (A, O) {
        ((s = o * 4 + 17),
          (a = (function ($) {
            const x = new Array($);
            for (let P = 0; P < $; P += 1) {
              x[P] = new Array($);
              for (let _ = 0; _ < $; _ += 1) x[P][_] = null;
            }
            return x;
          })(s)),
          h(0, 0),
          h(s - 7, 0),
          h(0, s - 7),
          g(),
          b(),
          m(A, O),
          o >= 7 && y(A),
          l == null && (l = C(o, r, c)),
          v(l, O));
      },
      h = function (A, O) {
        for (let $ = -1; $ <= 7; $ += 1)
          if (!(A + $ <= -1 || s <= A + $))
            for (let x = -1; x <= 7; x += 1)
              O + x <= -1 ||
                s <= O + x ||
                ((0 <= $ && $ <= 6 && (x == 0 || x == 6)) ||
                (0 <= x && x <= 6 && ($ == 0 || $ == 6)) ||
                (2 <= $ && $ <= 4 && 2 <= x && x <= 4)
                  ? (a[A + $][O + x] = !0)
                  : (a[A + $][O + x] = !1));
      },
      d = function () {
        let A = 0,
          O = 0;
        for (let $ = 0; $ < 8; $ += 1) {
          f(!0, $);
          const x = Ae.getLostPoint(u);
          ($ == 0 || A > x) && ((A = x), (O = $));
        }
        return O;
      },
      b = function () {
        for (let A = 8; A < s - 8; A += 1) a[A][6] == null && (a[A][6] = A % 2 == 0);
        for (let A = 8; A < s - 8; A += 1) a[6][A] == null && (a[6][A] = A % 2 == 0);
      },
      g = function () {
        const A = Ae.getPatternPosition(o);
        for (let O = 0; O < A.length; O += 1)
          for (let $ = 0; $ < A.length; $ += 1) {
            const x = A[O],
              P = A[$];
            if (a[x][P] == null)
              for (let _ = -2; _ <= 2; _ += 1)
                for (let T = -2; T <= 2; T += 1)
                  _ == -2 || _ == 2 || T == -2 || T == 2 || (_ == 0 && T == 0)
                    ? (a[x + _][P + T] = !0)
                    : (a[x + _][P + T] = !1);
          }
      },
      y = function (A) {
        const O = Ae.getBCHTypeNumber(o);
        for (let $ = 0; $ < 18; $ += 1) {
          const x = !A && ((O >> $) & 1) == 1;
          a[Math.floor($ / 3)][($ % 3) + s - 8 - 3] = x;
        }
        for (let $ = 0; $ < 18; $ += 1) {
          const x = !A && ((O >> $) & 1) == 1;
          a[($ % 3) + s - 8 - 3][Math.floor($ / 3)] = x;
        }
      },
      m = function (A, O) {
        const $ = (r << 3) | O,
          x = Ae.getBCHTypeInfo($);
        for (let P = 0; P < 15; P += 1) {
          const _ = !A && ((x >> P) & 1) == 1;
          P < 6 ? (a[P][8] = _) : P < 8 ? (a[P + 1][8] = _) : (a[s - 15 + P][8] = _);
        }
        for (let P = 0; P < 15; P += 1) {
          const _ = !A && ((x >> P) & 1) == 1;
          P < 8
            ? (a[8][s - P - 1] = _)
            : P < 9
              ? (a[8][15 - P - 1 + 1] = _)
              : (a[8][15 - P - 1] = _);
        }
        a[s - 8][8] = !A;
      },
      v = function (A, O) {
        let $ = -1,
          x = s - 1,
          P = 7,
          _ = 0;
        const T = Ae.getMaskFunction(O);
        for (let w = s - 1; w > 0; w -= 2)
          for (w == 6 && (w -= 1); ; ) {
            for (let R = 0; R < 2; R += 1)
              if (a[x][w - R] == null) {
                let Q = !1;
                (_ < A.length && (Q = ((A[_] >>> P) & 1) == 1),
                  T(x, w - R) && (Q = !Q),
                  (a[x][w - R] = Q),
                  (P -= 1),
                  P == -1 && ((_ += 1), (P = 7)));
              }
            if (((x += $), x < 0 || s <= x)) {
              ((x -= $), ($ = -$));
              break;
            }
          }
      },
      k = function (A, O) {
        let $ = 0,
          x = 0,
          P = 0;
        const _ = new Array(O.length),
          T = new Array(O.length);
        for (let N = 0; N < O.length; N += 1) {
          const tt = O[N].dataCount,
            Z = O[N].totalCount - tt;
          ((x = Math.max(x, tt)), (P = Math.max(P, Z)), (_[N] = new Array(tt)));
          for (let et = 0; et < _[N].length; et += 1) _[N][et] = 255 & A.getBuffer()[et + $];
          $ += tt;
          const nt = Ae.getErrorCorrectPolynomial(Z),
            D = bn(_[N], nt.getLength() - 1).mod(nt);
          T[N] = new Array(nt.getLength() - 1);
          for (let et = 0; et < T[N].length; et += 1) {
            const X = et + D.getLength() - T[N].length;
            T[N][et] = X >= 0 ? D.getAt(X) : 0;
          }
        }
        let w = 0;
        for (let N = 0; N < O.length; N += 1) w += O[N].totalCount;
        const R = new Array(w);
        let Q = 0;
        for (let N = 0; N < x; N += 1)
          for (let tt = 0; tt < O.length; tt += 1)
            N < _[tt].length && ((R[Q] = _[tt][N]), (Q += 1));
        for (let N = 0; N < P; N += 1)
          for (let tt = 0; tt < O.length; tt += 1)
            N < T[tt].length && ((R[Q] = T[tt][N]), (Q += 1));
        return R;
      },
      C = function (A, O, $) {
        const x = Ai.getRSBlocks(A, O),
          P = Ei();
        for (let T = 0; T < $.length; T += 1) {
          const w = $[T];
          (P.put(w.getMode(), 4),
            P.put(w.getLength(), Ae.getLengthInBits(w.getMode(), A)),
            w.write(P));
        }
        let _ = 0;
        for (let T = 0; T < x.length; T += 1) _ += x[T].dataCount;
        if (P.getLengthInBits() > _ * 8)
          throw "code length overflow. (" + P.getLengthInBits() + ">" + _ * 8 + ")";
        for (P.getLengthInBits() + 4 <= _ * 8 && P.put(0, 4); P.getLengthInBits() % 8 != 0; )
          P.putBit(!1);
        for (; !(P.getLengthInBits() >= _ * 8 || (P.put(236, 8), P.getLengthInBits() >= _ * 8)); )
          P.put(17, 8);
        return k(P, x);
      };
    ((u.addData = function (A, O) {
      O = O || "Byte";
      let $ = null;
      switch (O) {
        case "Numeric":
          $ = os(A);
          break;
        case "Alphanumeric":
          $ = as(A);
          break;
        case "Byte":
          $ = ss(A);
          break;
        case "Kanji":
          $ = ls(A);
          break;
        default:
          throw "mode:" + O;
      }
      (c.push($), (l = null));
    }),
      (u.isDark = function (A, O) {
        if (A < 0 || s <= A || O < 0 || s <= O) throw A + "," + O;
        return a[A][O];
      }),
      (u.getModuleCount = function () {
        return s;
      }),
      (u.make = function () {
        if (o < 1) {
          let A = 1;
          for (; A < 40; A++) {
            const O = Ai.getRSBlocks(A, r),
              $ = Ei();
            for (let P = 0; P < c.length; P++) {
              const _ = c[P];
              ($.put(_.getMode(), 4),
                $.put(_.getLength(), Ae.getLengthInBits(_.getMode(), A)),
                _.write($));
            }
            let x = 0;
            for (let P = 0; P < O.length; P++) x += O[P].dataCount;
            if ($.getLengthInBits() <= x * 8) break;
          }
          o = A;
        }
        f(!1, d());
      }),
      (u.createTableTag = function (A, O) {
        ((A = A || 2), (O = typeof O > "u" ? A * 4 : O));
        let $ = "";
        (($ += '<table style="'),
          ($ += " border-width: 0px; border-style: none;"),
          ($ += " border-collapse: collapse;"),
          ($ += " padding: 0px; margin: " + O + "px;"),
          ($ += '">'),
          ($ += "<tbody>"));
        for (let x = 0; x < u.getModuleCount(); x += 1) {
          $ += "<tr>";
          for (let P = 0; P < u.getModuleCount(); P += 1)
            (($ += '<td style="'),
              ($ += " border-width: 0px; border-style: none;"),
              ($ += " border-collapse: collapse;"),
              ($ += " padding: 0px; margin: 0px;"),
              ($ += " width: " + A + "px;"),
              ($ += " height: " + A + "px;"),
              ($ += " background-color: "),
              ($ += u.isDark(x, P) ? "#000000" : "#ffffff"),
              ($ += ";"),
              ($ += '"/>'));
          $ += "</tr>";
        }
        return (($ += "</tbody>"), ($ += "</table>"), $);
      }),
      (u.createSvgTag = function (A, O, $, x) {
        let P = {};
        (typeof arguments[0] == "object" &&
          ((P = arguments[0]), (A = P.cellSize), (O = P.margin), ($ = P.alt), (x = P.title)),
          (A = A || 2),
          (O = typeof O > "u" ? A * 4 : O),
          ($ = typeof $ == "string" ? { text: $ } : $ || {}),
          ($.text = $.text || null),
          ($.id = $.text ? $.id || "qrcode-description" : null),
          (x = typeof x == "string" ? { text: x } : x || {}),
          (x.text = x.text || null),
          (x.id = x.text ? x.id || "qrcode-title" : null));
        const _ = u.getModuleCount() * A + O * 2;
        let T,
          w,
          R,
          Q,
          N = "",
          tt;
        for (
          tt = "l" + A + ",0 0," + A + " -" + A + ",0 0,-" + A + "z ",
            N += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',
            N += P.scalable ? "" : ' width="' + _ + 'px" height="' + _ + 'px"',
            N += ' viewBox="0 0 ' + _ + " " + _ + '" ',
            N += ' preserveAspectRatio="xMinYMin meet"',
            N +=
              x.text || $.text
                ? ' role="img" aria-labelledby="' + z([x.id, $.id].join(" ").trim()) + '"'
                : "",
            N += ">",
            N += x.text ? '<title id="' + z(x.id) + '">' + z(x.text) + "</title>" : "",
            N += $.text ? '<description id="' + z($.id) + '">' + z($.text) + "</description>" : "",
            N += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',
            N += '<path d="',
            R = 0;
          R < u.getModuleCount();
          R += 1
        )
          for (Q = R * A + O, T = 0; T < u.getModuleCount(); T += 1)
            u.isDark(R, T) && ((w = T * A + O), (N += "M" + w + "," + Q + tt));
        return ((N += '" stroke="transparent" fill="black"/>'), (N += "</svg>"), N);
      }),
      (u.createDataURL = function (A, O) {
        ((A = A || 2), (O = typeof O > "u" ? A * 4 : O));
        const $ = u.getModuleCount() * A + O * 2,
          x = O,
          P = $ - O;
        return ds($, $, function (_, T) {
          if (x <= _ && _ < P && x <= T && T < P) {
            const w = Math.floor((_ - x) / A),
              R = Math.floor((T - x) / A);
            return u.isDark(R, w) ? 0 : 1;
          } else return 1;
        });
      }),
      (u.createImgTag = function (A, O, $) {
        ((A = A || 2), (O = typeof O > "u" ? A * 4 : O));
        const x = u.getModuleCount() * A + O * 2;
        let P = "";
        return (
          (P += "<img"),
          (P += ' src="'),
          (P += u.createDataURL(A, O)),
          (P += '"'),
          (P += ' width="'),
          (P += x),
          (P += '"'),
          (P += ' height="'),
          (P += x),
          (P += '"'),
          $ && ((P += ' alt="'), (P += z($)), (P += '"')),
          (P += "/>"),
          P
        );
      }));
    const z = function (A) {
        let O = "";
        for (let $ = 0; $ < A.length; $ += 1) {
          const x = A.charAt($);
          switch (x) {
            case "<":
              O += "&lt;";
              break;
            case ">":
              O += "&gt;";
              break;
            case "&":
              O += "&amp;";
              break;
            case '"':
              O += "&quot;";
              break;
            default:
              O += x;
              break;
          }
        }
        return O;
      },
      L = function (A) {
        A = typeof A > "u" ? 1 * 2 : A;
        const $ = u.getModuleCount() * 1 + A * 2,
          x = A,
          P = $ - A;
        let _, T, w, R, Q;
        const N = { "██": "█", "█ ": "▀", " █": "▄", "  ": " " },
          tt = { "██": "▀", "█ ": "▀", " █": " ", "  ": " " };
        let Z = "";
        for (_ = 0; _ < $; _ += 2) {
          for (w = Math.floor((_ - x) / 1), R = Math.floor((_ + 1 - x) / 1), T = 0; T < $; T += 1)
            ((Q = "█"),
              x <= T &&
                T < P &&
                x <= _ &&
                _ < P &&
                u.isDark(w, Math.floor((T - x) / 1)) &&
                (Q = " "),
              x <= T && T < P && x <= _ + 1 && _ + 1 < P && u.isDark(R, Math.floor((T - x) / 1))
                ? (Q += " ")
                : (Q += "█"),
              (Z += A < 1 && _ + 1 >= P ? tt[Q] : N[Q]));
          Z += `
`;
        }
        return $ % 2 && A > 0
          ? Z.substring(0, Z.length - $ - 1) + Array($ + 1).join("▀")
          : Z.substring(0, Z.length - 1);
      };
    return (
      (u.createASCII = function (A, O) {
        if (((A = A || 1), A < 2)) return L(O);
        ((A -= 1), (O = typeof O > "u" ? A * 2 : O));
        const $ = u.getModuleCount() * A + O * 2,
          x = O,
          P = $ - O;
        let _, T, w, R;
        const Q = Array(A + 1).join("██"),
          N = Array(A + 1).join("  ");
        let tt = "",
          Z = "";
        for (_ = 0; _ < $; _ += 1) {
          for (w = Math.floor((_ - x) / A), Z = "", T = 0; T < $; T += 1)
            ((R = 1),
              x <= T && T < P && x <= _ && _ < P && u.isDark(w, Math.floor((T - x) / A)) && (R = 0),
              (Z += R ? Q : N));
          for (w = 0; w < A; w += 1)
            tt +=
              Z +
              `
`;
        }
        return tt.substring(0, tt.length - 1);
      }),
      (u.renderTo2dContext = function (A, O) {
        O = O || 2;
        const $ = u.getModuleCount();
        for (let x = 0; x < $; x++)
          for (let P = 0; P < $; P++)
            ((A.fillStyle = u.isDark(x, P) ? "black" : "white"), A.fillRect(P * O, x * O, O, O));
      }),
      u
    );
  };
nn.stringToBytes = function (t) {
  const n = [];
  for (let e = 0; e < t.length; e += 1) {
    const i = t.charCodeAt(e);
    n.push(i & 255);
  }
  return n;
};
nn.createStringToBytes = function (t, n) {
  const e = (function () {
      const o = us(t),
        r = function () {
          const l = o.read();
          if (l == -1) throw "eof";
          return l;
        };
      let a = 0;
      const s = {};
      for (;;) {
        const l = o.read();
        if (l == -1) break;
        const c = r(),
          u = r(),
          f = r(),
          h = String.fromCharCode((l << 8) | c),
          d = (u << 8) | f;
        ((s[h] = d), (a += 1));
      }
      if (a != n) throw a + " != " + n;
      return s;
    })(),
    i = 63;
  return function (o) {
    const r = [];
    for (let a = 0; a < o.length; a += 1) {
      const s = o.charCodeAt(a);
      if (s < 128) r.push(s);
      else {
        const l = e[o.charAt(a)];
        typeof l == "number"
          ? (l & 255) == l
            ? r.push(l)
            : (r.push(l >>> 8), r.push(l & 255))
          : r.push(i);
      }
    }
    return r;
  };
};
const Ut = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 },
  fn = { L: 1, M: 0, Q: 3, H: 2 },
  Se = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7,
  },
  Ae = (function () {
    const t = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170],
      ],
      n = 1335,
      e = 7973,
      i = 21522,
      o = {},
      r = function (a) {
        let s = 0;
        for (; a != 0; ) ((s += 1), (a >>>= 1));
        return s;
      };
    return (
      (o.getBCHTypeInfo = function (a) {
        let s = a << 10;
        for (; r(s) - r(n) >= 0; ) s ^= n << (r(s) - r(n));
        return ((a << 10) | s) ^ i;
      }),
      (o.getBCHTypeNumber = function (a) {
        let s = a << 12;
        for (; r(s) - r(e) >= 0; ) s ^= e << (r(s) - r(e));
        return (a << 12) | s;
      }),
      (o.getPatternPosition = function (a) {
        return t[a - 1];
      }),
      (o.getMaskFunction = function (a) {
        switch (a) {
          case Se.PATTERN000:
            return function (s, l) {
              return (s + l) % 2 == 0;
            };
          case Se.PATTERN001:
            return function (s, l) {
              return s % 2 == 0;
            };
          case Se.PATTERN010:
            return function (s, l) {
              return l % 3 == 0;
            };
          case Se.PATTERN011:
            return function (s, l) {
              return (s + l) % 3 == 0;
            };
          case Se.PATTERN100:
            return function (s, l) {
              return (Math.floor(s / 2) + Math.floor(l / 3)) % 2 == 0;
            };
          case Se.PATTERN101:
            return function (s, l) {
              return ((s * l) % 2) + ((s * l) % 3) == 0;
            };
          case Se.PATTERN110:
            return function (s, l) {
              return (((s * l) % 2) + ((s * l) % 3)) % 2 == 0;
            };
          case Se.PATTERN111:
            return function (s, l) {
              return (((s * l) % 3) + ((s + l) % 2)) % 2 == 0;
            };
          default:
            throw "bad maskPattern:" + a;
        }
      }),
      (o.getErrorCorrectPolynomial = function (a) {
        let s = bn([1], 0);
        for (let l = 0; l < a; l += 1) s = s.multiply(bn([1, Ce.gexp(l)], 0));
        return s;
      }),
      (o.getLengthInBits = function (a, s) {
        if (1 <= s && s < 10)
          switch (a) {
            case Ut.MODE_NUMBER:
              return 10;
            case Ut.MODE_ALPHA_NUM:
              return 9;
            case Ut.MODE_8BIT_BYTE:
              return 8;
            case Ut.MODE_KANJI:
              return 8;
            default:
              throw "mode:" + a;
          }
        else if (s < 27)
          switch (a) {
            case Ut.MODE_NUMBER:
              return 12;
            case Ut.MODE_ALPHA_NUM:
              return 11;
            case Ut.MODE_8BIT_BYTE:
              return 16;
            case Ut.MODE_KANJI:
              return 10;
            default:
              throw "mode:" + a;
          }
        else if (s < 41)
          switch (a) {
            case Ut.MODE_NUMBER:
              return 14;
            case Ut.MODE_ALPHA_NUM:
              return 13;
            case Ut.MODE_8BIT_BYTE:
              return 16;
            case Ut.MODE_KANJI:
              return 12;
            default:
              throw "mode:" + a;
          }
        else throw "type:" + s;
      }),
      (o.getLostPoint = function (a) {
        const s = a.getModuleCount();
        let l = 0;
        for (let f = 0; f < s; f += 1)
          for (let h = 0; h < s; h += 1) {
            let d = 0;
            const b = a.isDark(f, h);
            for (let g = -1; g <= 1; g += 1)
              if (!(f + g < 0 || s <= f + g))
                for (let y = -1; y <= 1; y += 1)
                  h + y < 0 ||
                    s <= h + y ||
                    (g == 0 && y == 0) ||
                    (b == a.isDark(f + g, h + y) && (d += 1));
            d > 5 && (l += 3 + d - 5);
          }
        for (let f = 0; f < s - 1; f += 1)
          for (let h = 0; h < s - 1; h += 1) {
            let d = 0;
            (a.isDark(f, h) && (d += 1),
              a.isDark(f + 1, h) && (d += 1),
              a.isDark(f, h + 1) && (d += 1),
              a.isDark(f + 1, h + 1) && (d += 1),
              (d == 0 || d == 4) && (l += 3));
          }
        for (let f = 0; f < s; f += 1)
          for (let h = 0; h < s - 6; h += 1)
            a.isDark(f, h) &&
              !a.isDark(f, h + 1) &&
              a.isDark(f, h + 2) &&
              a.isDark(f, h + 3) &&
              a.isDark(f, h + 4) &&
              !a.isDark(f, h + 5) &&
              a.isDark(f, h + 6) &&
              (l += 40);
        for (let f = 0; f < s; f += 1)
          for (let h = 0; h < s - 6; h += 1)
            a.isDark(h, f) &&
              !a.isDark(h + 1, f) &&
              a.isDark(h + 2, f) &&
              a.isDark(h + 3, f) &&
              a.isDark(h + 4, f) &&
              !a.isDark(h + 5, f) &&
              a.isDark(h + 6, f) &&
              (l += 40);
        let c = 0;
        for (let f = 0; f < s; f += 1) for (let h = 0; h < s; h += 1) a.isDark(h, f) && (c += 1);
        const u = Math.abs((100 * c) / s / s - 50) / 5;
        return ((l += u * 10), l);
      }),
      o
    );
  })(),
  Ce = (function () {
    const t = new Array(256),
      n = new Array(256);
    for (let i = 0; i < 8; i += 1) t[i] = 1 << i;
    for (let i = 8; i < 256; i += 1) t[i] = t[i - 4] ^ t[i - 5] ^ t[i - 6] ^ t[i - 8];
    for (let i = 0; i < 255; i += 1) n[t[i]] = i;
    const e = {};
    return (
      (e.glog = function (i) {
        if (i < 1) throw "glog(" + i + ")";
        return n[i];
      }),
      (e.gexp = function (i) {
        for (; i < 0; ) i += 255;
        for (; i >= 256; ) i -= 255;
        return t[i];
      }),
      e
    );
  })(),
  bn = function (t, n) {
    if (typeof t.length > "u") throw t.length + "/" + n;
    const e = (function () {
        let o = 0;
        for (; o < t.length && t[o] == 0; ) o += 1;
        const r = new Array(t.length - o + n);
        for (let a = 0; a < t.length - o; a += 1) r[a] = t[a + o];
        return r;
      })(),
      i = {};
    return (
      (i.getAt = function (o) {
        return e[o];
      }),
      (i.getLength = function () {
        return e.length;
      }),
      (i.multiply = function (o) {
        const r = new Array(i.getLength() + o.getLength() - 1);
        for (let a = 0; a < i.getLength(); a += 1)
          for (let s = 0; s < o.getLength(); s += 1)
            r[a + s] ^= Ce.gexp(Ce.glog(i.getAt(a)) + Ce.glog(o.getAt(s)));
        return bn(r, 0);
      }),
      (i.mod = function (o) {
        if (i.getLength() - o.getLength() < 0) return i;
        const r = Ce.glog(i.getAt(0)) - Ce.glog(o.getAt(0)),
          a = new Array(i.getLength());
        for (let s = 0; s < i.getLength(); s += 1) a[s] = i.getAt(s);
        for (let s = 0; s < o.getLength(); s += 1) a[s] ^= Ce.gexp(Ce.glog(o.getAt(s)) + r);
        return bn(a, 0).mod(o);
      }),
      i
    );
  },
  Ai = (function () {
    const t = [
        [1, 26, 19],
        [1, 26, 16],
        [1, 26, 13],
        [1, 26, 9],
        [1, 44, 34],
        [1, 44, 28],
        [1, 44, 22],
        [1, 44, 16],
        [1, 70, 55],
        [1, 70, 44],
        [2, 35, 17],
        [2, 35, 13],
        [1, 100, 80],
        [2, 50, 32],
        [2, 50, 24],
        [4, 25, 9],
        [1, 134, 108],
        [2, 67, 43],
        [2, 33, 15, 2, 34, 16],
        [2, 33, 11, 2, 34, 12],
        [2, 86, 68],
        [4, 43, 27],
        [4, 43, 19],
        [4, 43, 15],
        [2, 98, 78],
        [4, 49, 31],
        [2, 32, 14, 4, 33, 15],
        [4, 39, 13, 1, 40, 14],
        [2, 121, 97],
        [2, 60, 38, 2, 61, 39],
        [4, 40, 18, 2, 41, 19],
        [4, 40, 14, 2, 41, 15],
        [2, 146, 116],
        [3, 58, 36, 2, 59, 37],
        [4, 36, 16, 4, 37, 17],
        [4, 36, 12, 4, 37, 13],
        [2, 86, 68, 2, 87, 69],
        [4, 69, 43, 1, 70, 44],
        [6, 43, 19, 2, 44, 20],
        [6, 43, 15, 2, 44, 16],
        [4, 101, 81],
        [1, 80, 50, 4, 81, 51],
        [4, 50, 22, 4, 51, 23],
        [3, 36, 12, 8, 37, 13],
        [2, 116, 92, 2, 117, 93],
        [6, 58, 36, 2, 59, 37],
        [4, 46, 20, 6, 47, 21],
        [7, 42, 14, 4, 43, 15],
        [4, 133, 107],
        [8, 59, 37, 1, 60, 38],
        [8, 44, 20, 4, 45, 21],
        [12, 33, 11, 4, 34, 12],
        [3, 145, 115, 1, 146, 116],
        [4, 64, 40, 5, 65, 41],
        [11, 36, 16, 5, 37, 17],
        [11, 36, 12, 5, 37, 13],
        [5, 109, 87, 1, 110, 88],
        [5, 65, 41, 5, 66, 42],
        [5, 54, 24, 7, 55, 25],
        [11, 36, 12, 7, 37, 13],
        [5, 122, 98, 1, 123, 99],
        [7, 73, 45, 3, 74, 46],
        [15, 43, 19, 2, 44, 20],
        [3, 45, 15, 13, 46, 16],
        [1, 135, 107, 5, 136, 108],
        [10, 74, 46, 1, 75, 47],
        [1, 50, 22, 15, 51, 23],
        [2, 42, 14, 17, 43, 15],
        [5, 150, 120, 1, 151, 121],
        [9, 69, 43, 4, 70, 44],
        [17, 50, 22, 1, 51, 23],
        [2, 42, 14, 19, 43, 15],
        [3, 141, 113, 4, 142, 114],
        [3, 70, 44, 11, 71, 45],
        [17, 47, 21, 4, 48, 22],
        [9, 39, 13, 16, 40, 14],
        [3, 135, 107, 5, 136, 108],
        [3, 67, 41, 13, 68, 42],
        [15, 54, 24, 5, 55, 25],
        [15, 43, 15, 10, 44, 16],
        [4, 144, 116, 4, 145, 117],
        [17, 68, 42],
        [17, 50, 22, 6, 51, 23],
        [19, 46, 16, 6, 47, 17],
        [2, 139, 111, 7, 140, 112],
        [17, 74, 46],
        [7, 54, 24, 16, 55, 25],
        [34, 37, 13],
        [4, 151, 121, 5, 152, 122],
        [4, 75, 47, 14, 76, 48],
        [11, 54, 24, 14, 55, 25],
        [16, 45, 15, 14, 46, 16],
        [6, 147, 117, 4, 148, 118],
        [6, 73, 45, 14, 74, 46],
        [11, 54, 24, 16, 55, 25],
        [30, 46, 16, 2, 47, 17],
        [8, 132, 106, 4, 133, 107],
        [8, 75, 47, 13, 76, 48],
        [7, 54, 24, 22, 55, 25],
        [22, 45, 15, 13, 46, 16],
        [10, 142, 114, 2, 143, 115],
        [19, 74, 46, 4, 75, 47],
        [28, 50, 22, 6, 51, 23],
        [33, 46, 16, 4, 47, 17],
        [8, 152, 122, 4, 153, 123],
        [22, 73, 45, 3, 74, 46],
        [8, 53, 23, 26, 54, 24],
        [12, 45, 15, 28, 46, 16],
        [3, 147, 117, 10, 148, 118],
        [3, 73, 45, 23, 74, 46],
        [4, 54, 24, 31, 55, 25],
        [11, 45, 15, 31, 46, 16],
        [7, 146, 116, 7, 147, 117],
        [21, 73, 45, 7, 74, 46],
        [1, 53, 23, 37, 54, 24],
        [19, 45, 15, 26, 46, 16],
        [5, 145, 115, 10, 146, 116],
        [19, 75, 47, 10, 76, 48],
        [15, 54, 24, 25, 55, 25],
        [23, 45, 15, 25, 46, 16],
        [13, 145, 115, 3, 146, 116],
        [2, 74, 46, 29, 75, 47],
        [42, 54, 24, 1, 55, 25],
        [23, 45, 15, 28, 46, 16],
        [17, 145, 115],
        [10, 74, 46, 23, 75, 47],
        [10, 54, 24, 35, 55, 25],
        [19, 45, 15, 35, 46, 16],
        [17, 145, 115, 1, 146, 116],
        [14, 74, 46, 21, 75, 47],
        [29, 54, 24, 19, 55, 25],
        [11, 45, 15, 46, 46, 16],
        [13, 145, 115, 6, 146, 116],
        [14, 74, 46, 23, 75, 47],
        [44, 54, 24, 7, 55, 25],
        [59, 46, 16, 1, 47, 17],
        [12, 151, 121, 7, 152, 122],
        [12, 75, 47, 26, 76, 48],
        [39, 54, 24, 14, 55, 25],
        [22, 45, 15, 41, 46, 16],
        [6, 151, 121, 14, 152, 122],
        [6, 75, 47, 34, 76, 48],
        [46, 54, 24, 10, 55, 25],
        [2, 45, 15, 64, 46, 16],
        [17, 152, 122, 4, 153, 123],
        [29, 74, 46, 14, 75, 47],
        [49, 54, 24, 10, 55, 25],
        [24, 45, 15, 46, 46, 16],
        [4, 152, 122, 18, 153, 123],
        [13, 74, 46, 32, 75, 47],
        [48, 54, 24, 14, 55, 25],
        [42, 45, 15, 32, 46, 16],
        [20, 147, 117, 4, 148, 118],
        [40, 75, 47, 7, 76, 48],
        [43, 54, 24, 22, 55, 25],
        [10, 45, 15, 67, 46, 16],
        [19, 148, 118, 6, 149, 119],
        [18, 75, 47, 31, 76, 48],
        [34, 54, 24, 34, 55, 25],
        [20, 45, 15, 61, 46, 16],
      ],
      n = function (o, r) {
        const a = {};
        return ((a.totalCount = o), (a.dataCount = r), a);
      },
      e = {},
      i = function (o, r) {
        switch (r) {
          case fn.L:
            return t[(o - 1) * 4 + 0];
          case fn.M:
            return t[(o - 1) * 4 + 1];
          case fn.Q:
            return t[(o - 1) * 4 + 2];
          case fn.H:
            return t[(o - 1) * 4 + 3];
          default:
            return;
        }
      };
    return (
      (e.getRSBlocks = function (o, r) {
        const a = i(o, r);
        if (typeof a > "u") throw "bad rs block @ typeNumber:" + o + "/errorCorrectionLevel:" + r;
        const s = a.length / 3,
          l = [];
        for (let c = 0; c < s; c += 1) {
          const u = a[c * 3 + 0],
            f = a[c * 3 + 1],
            h = a[c * 3 + 2];
          for (let d = 0; d < u; d += 1) l.push(n(f, h));
        }
        return l;
      }),
      e
    );
  })(),
  Ei = function () {
    const t = [];
    let n = 0;
    const e = {};
    return (
      (e.getBuffer = function () {
        return t;
      }),
      (e.getAt = function (i) {
        const o = Math.floor(i / 8);
        return ((t[o] >>> (7 - (i % 8))) & 1) == 1;
      }),
      (e.put = function (i, o) {
        for (let r = 0; r < o; r += 1) e.putBit(((i >>> (o - r - 1)) & 1) == 1);
      }),
      (e.getLengthInBits = function () {
        return n;
      }),
      (e.putBit = function (i) {
        const o = Math.floor(n / 8);
        (t.length <= o && t.push(0), i && (t[o] |= 128 >>> (n % 8)), (n += 1));
      }),
      e
    );
  },
  os = function (t) {
    const n = Ut.MODE_NUMBER,
      e = t,
      i = {};
    ((i.getMode = function () {
      return n;
    }),
      (i.getLength = function (a) {
        return e.length;
      }),
      (i.write = function (a) {
        const s = e;
        let l = 0;
        for (; l + 2 < s.length; ) (a.put(o(s.substring(l, l + 3)), 10), (l += 3));
        l < s.length &&
          (s.length - l == 1
            ? a.put(o(s.substring(l, l + 1)), 4)
            : s.length - l == 2 && a.put(o(s.substring(l, l + 2)), 7));
      }));
    const o = function (a) {
        let s = 0;
        for (let l = 0; l < a.length; l += 1) s = s * 10 + r(a.charAt(l));
        return s;
      },
      r = function (a) {
        if ("0" <= a && a <= "9") return a.charCodeAt(0) - 48;
        throw "illegal char :" + a;
      };
    return i;
  },
  as = function (t) {
    const n = Ut.MODE_ALPHA_NUM,
      e = t,
      i = {};
    ((i.getMode = function () {
      return n;
    }),
      (i.getLength = function (r) {
        return e.length;
      }),
      (i.write = function (r) {
        const a = e;
        let s = 0;
        for (; s + 1 < a.length; ) (r.put(o(a.charAt(s)) * 45 + o(a.charAt(s + 1)), 11), (s += 2));
        s < a.length && r.put(o(a.charAt(s)), 6);
      }));
    const o = function (r) {
      if ("0" <= r && r <= "9") return r.charCodeAt(0) - 48;
      if ("A" <= r && r <= "Z") return r.charCodeAt(0) - 65 + 10;
      switch (r) {
        case " ":
          return 36;
        case "$":
          return 37;
        case "%":
          return 38;
        case "*":
          return 39;
        case "+":
          return 40;
        case "-":
          return 41;
        case ".":
          return 42;
        case "/":
          return 43;
        case ":":
          return 44;
        default:
          throw "illegal char :" + r;
      }
    };
    return i;
  },
  ss = function (t) {
    const n = Ut.MODE_8BIT_BYTE,
      e = nn.stringToBytes(t),
      i = {};
    return (
      (i.getMode = function () {
        return n;
      }),
      (i.getLength = function (o) {
        return e.length;
      }),
      (i.write = function (o) {
        for (let r = 0; r < e.length; r += 1) o.put(e[r], 8);
      }),
      i
    );
  },
  ls = function (t) {
    const n = Ut.MODE_KANJI,
      e = nn.stringToBytes;
    (function (r, a) {
      const s = e(r);
      if (s.length != 2 || ((s[0] << 8) | s[1]) != a) throw "sjis not supported.";
    })("友", 38726);
    const i = e(t),
      o = {};
    return (
      (o.getMode = function () {
        return n;
      }),
      (o.getLength = function (r) {
        return ~~(i.length / 2);
      }),
      (o.write = function (r) {
        const a = i;
        let s = 0;
        for (; s + 1 < a.length; ) {
          let l = ((255 & a[s]) << 8) | (255 & a[s + 1]);
          if (33088 <= l && l <= 40956) l -= 33088;
          else if (57408 <= l && l <= 60351) l -= 49472;
          else throw "illegal char at " + (s + 1) + "/" + l;
          ((l = ((l >>> 8) & 255) * 192 + (l & 255)), r.put(l, 13), (s += 2));
        }
        if (s < a.length) throw "illegal char at " + (s + 1);
      }),
      o
    );
  },
  bo = function () {
    const t = [],
      n = {};
    return (
      (n.writeByte = function (e) {
        t.push(e & 255);
      }),
      (n.writeShort = function (e) {
        (n.writeByte(e), n.writeByte(e >>> 8));
      }),
      (n.writeBytes = function (e, i, o) {
        ((i = i || 0), (o = o || e.length));
        for (let r = 0; r < o; r += 1) n.writeByte(e[r + i]);
      }),
      (n.writeString = function (e) {
        for (let i = 0; i < e.length; i += 1) n.writeByte(e.charCodeAt(i));
      }),
      (n.toByteArray = function () {
        return t;
      }),
      (n.toString = function () {
        let e = "";
        e += "[";
        for (let i = 0; i < t.length; i += 1) (i > 0 && (e += ","), (e += t[i]));
        return ((e += "]"), e);
      }),
      n
    );
  },
  cs = function () {
    let t = 0,
      n = 0,
      e = 0,
      i = "";
    const o = {},
      r = function (s) {
        i += String.fromCharCode(a(s & 63));
      },
      a = function (s) {
        if (s < 0) throw "n:" + s;
        if (s < 26) return 65 + s;
        if (s < 52) return 97 + (s - 26);
        if (s < 62) return 48 + (s - 52);
        if (s == 62) return 43;
        if (s == 63) return 47;
        throw "n:" + s;
      };
    return (
      (o.writeByte = function (s) {
        for (t = (t << 8) | (s & 255), n += 8, e += 1; n >= 6; ) (r(t >>> (n - 6)), (n -= 6));
      }),
      (o.flush = function () {
        if ((n > 0 && (r(t << (6 - n)), (t = 0), (n = 0)), e % 3 != 0)) {
          const s = 3 - (e % 3);
          for (let l = 0; l < s; l += 1) i += "=";
        }
      }),
      (o.toString = function () {
        return i;
      }),
      o
    );
  },
  us = function (t) {
    const n = t;
    let e = 0,
      i = 0,
      o = 0;
    const r = {};
    r.read = function () {
      for (; o < 8; ) {
        if (e >= n.length) {
          if (o == 0) return -1;
          throw "unexpected end of file./" + o;
        }
        const l = n.charAt(e);
        if (((e += 1), l == "=")) return ((o = 0), -1);
        if (l.match(/^\s$/)) continue;
        ((i = (i << 6) | a(l.charCodeAt(0))), (o += 6));
      }
      const s = (i >>> (o - 8)) & 255;
      return ((o -= 8), s);
    };
    const a = function (s) {
      if (65 <= s && s <= 90) return s - 65;
      if (97 <= s && s <= 122) return s - 97 + 26;
      if (48 <= s && s <= 57) return s - 48 + 52;
      if (s == 43) return 62;
      if (s == 47) return 63;
      throw "c:" + s;
    };
    return r;
  },
  fs = function (t, n) {
    const e = t,
      i = n,
      o = new Array(t * n),
      r = {};
    ((r.setPixel = function (c, u, f) {
      o[u * e + c] = f;
    }),
      (r.write = function (c) {
        (c.writeString("GIF87a"),
          c.writeShort(e),
          c.writeShort(i),
          c.writeByte(128),
          c.writeByte(0),
          c.writeByte(0),
          c.writeByte(0),
          c.writeByte(0),
          c.writeByte(0),
          c.writeByte(255),
          c.writeByte(255),
          c.writeByte(255),
          c.writeString(","),
          c.writeShort(0),
          c.writeShort(0),
          c.writeShort(e),
          c.writeShort(i),
          c.writeByte(0));
        const u = 2,
          f = s(u);
        c.writeByte(u);
        let h = 0;
        for (; f.length - h > 255; ) (c.writeByte(255), c.writeBytes(f, h, 255), (h += 255));
        (c.writeByte(f.length - h),
          c.writeBytes(f, h, f.length - h),
          c.writeByte(0),
          c.writeString(";"));
      }));
    const a = function (c) {
        const u = c;
        let f = 0,
          h = 0;
        const d = {};
        return (
          (d.write = function (b, g) {
            if (b >>> g) throw "length over";
            for (; f + g >= 8; )
              (u.writeByte(255 & ((b << f) | h)), (g -= 8 - f), (b >>>= 8 - f), (h = 0), (f = 0));
            ((h = (b << f) | h), (f = f + g));
          }),
          (d.flush = function () {
            f > 0 && u.writeByte(h);
          }),
          d
        );
      },
      s = function (c) {
        const u = 1 << c,
          f = (1 << c) + 1;
        let h = c + 1;
        const d = l();
        for (let v = 0; v < u; v += 1) d.add(String.fromCharCode(v));
        (d.add(String.fromCharCode(u)), d.add(String.fromCharCode(f)));
        const b = bo(),
          g = a(b);
        g.write(u, h);
        let y = 0,
          m = String.fromCharCode(o[y]);
        for (y += 1; y < o.length; ) {
          const v = String.fromCharCode(o[y]);
          ((y += 1),
            d.contains(m + v)
              ? (m = m + v)
              : (g.write(d.indexOf(m), h),
                d.size() < 4095 && (d.size() == 1 << h && (h += 1), d.add(m + v)),
                (m = v)));
        }
        return (g.write(d.indexOf(m), h), g.write(f, h), g.flush(), b.toByteArray());
      },
      l = function () {
        const c = {};
        let u = 0;
        const f = {};
        return (
          (f.add = function (h) {
            if (f.contains(h)) throw "dup key:" + h;
            ((c[h] = u), (u += 1));
          }),
          (f.size = function () {
            return u;
          }),
          (f.indexOf = function (h) {
            return c[h];
          }),
          (f.contains = function (h) {
            return typeof c[h] < "u";
          }),
          f
        );
      };
    return r;
  },
  ds = function (t, n, e) {
    const i = fs(t, n);
    for (let s = 0; s < n; s += 1) for (let l = 0; l < t; l += 1) i.setPixel(l, s, e(l, s));
    const o = bo();
    i.write(o);
    const r = cs(),
      a = o.toByteArray();
    for (let s = 0; s < a.length; s += 1) r.writeByte(a[s]);
    return (r.flush(), "data:image/gif;base64," + r);
  };
nn.stringToBytes;
function hs(t) {
  const n = new TextEncoder().encode(t);
  let e = "";
  for (const i of n) e += String.fromCharCode(i);
  return e;
}
function gs(t, n = "M") {
  const e = nn(0, n);
  return (
    e.addData(hs(t), "Byte"),
    e.make(),
    { size: e.getModuleCount(), dark: (i, o) => e.isDark(i, o) }
  );
}
function qn(t, n, e, i, o, r = "M") {
  const a = gs(t, r),
    s = i / a.size;
  let l = "";
  for (let c = 0; c < a.size; c++) {
    let u = 0;
    for (; u < a.size; ) {
      if (!a.dark(c, u)) {
        u++;
        continue;
      }
      const f = u;
      for (; u < a.size && a.dark(c, u); ) u++;
      l += `M${I(n + f * s, 3)} ${I(e + c * s, 3)}h${I((u - f) * s, 3)}v${I(s * 1.02, 3)}h${I(-(u - f) * s, 3)}z`;
    }
  }
  return { svg: `<path d="${l}" fill="${o}"/>`, module: s };
}
const Ee = {
  head: "ui/PowerGrotesk-Regular.woff",
  headBold: "ui/PowerGrotesk-Bold.woff",
  headFallback: "brand/hanken-grotesk-latin-400-normal.woff",
  headFallbackExt: "brand/hanken-grotesk-latin-ext-400-normal.woff",
  body: "brand/outfit-latin-400-normal.woff",
  bodyExt: "brand/outfit-latin-ext-400-normal.woff",
  bodyBold: "brand/outfit-latin-600-normal.woff",
  bodyBoldExt: "brand/outfit-latin-ext-600-normal.woff",
};
let ie = null,
  Ue = null;
function ps(t = "./") {
  return async (n) => {
    const e = await fetch(`${t}fonts/${n}`);
    if (!e.ok) throw new Error(`Schrift konnte nicht geladen werden: ${n}`);
    return e.arrayBuffer();
  };
}
async function ln(t, n, e) {
  const i = bi.parse(await t(n));
  if (e)
    try {
      ga(i, bi.parse(await t(e)));
    } catch {}
  return i;
}
function cr(t) {
  if (ie) return Promise.resolve(ie);
  if (Ue) return Ue;
  const n = ps();
  return (
    (Ue = (async () => {
      const [e, i] = await Promise.all([
        ln(n, Ee.body, Ee.bodyExt),
        ln(n, Ee.bodyBold, Ee.bodyBoldExt),
      ]);
      let o,
        r = !1;
      try {
        o = await ln(n, Ee.head);
      } catch {
        ((o = await ln(n, Ee.headFallback, Ee.headFallbackExt)), (r = !0));
      }
      let a = o;
      if (!r)
        try {
          a = await ln(n, Ee.headBold);
        } catch {}
      return (
        xr(o, e),
        a !== o && xr(a, i),
        (ie = {
          head: o,
          headBold: a,
          body: e,
          bodyBold: i,
          fallback: r,
          headFamily: r ? "Hanken Grotesk" : "Power Grotesk",
        }),
        ie
      );
    })()),
    Ue.catch(() => {
      Ue = null;
    }),
    Ue
  );
}
function wo() {
  return ie;
}
function Ci() {
  return {
    ready: !!ie,
    fallback: !!(ie != null && ie.fallback),
    headFamily: (ie == null ? void 0 : ie.headFamily) ?? "Power Grotesk",
  };
}
const ms =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" zoomAndPan="magnify" viewBox="0 0 1200 299.999988" height="400" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><g></g><clipPath id="fc0c12f68b"><rect x="0" width="833" y="0" height="275"></rect></clipPath><clipPath id="43d7c97a54"><rect x="0" width="431" y="0" height="275"></rect></clipPath><clipPath id="ee3ae5f6ba"><path d="M 75.335938 45.046875 L 252 45.046875 L 252 126 L 75.335938 126 Z M 75.335938 45.046875 " clip-rule="nonzero"></path></clipPath><clipPath id="3415d43f50"><path d="M 75.335938 161 L 253 161 L 253 242.296875 L 75.335938 242.296875 Z M 75.335938 161 " clip-rule="nonzero"></path></clipPath><clipPath id="cca9f6480e"><path d="M 254 154 L 254.585938 154 L 254.585938 156 L 254 156 Z M 254 154 " clip-rule="nonzero"></path></clipPath></defs><g transform="matrix(1, 0, 0, 1, 362, 25)"><g clip-path="url(#fc0c12f68b)"><g fill="#000000" fill-opacity="1"><g transform="translate(0.207983, 219.256984)"><g><path d="M 169.9375 -191.546875 L 169.9375 -81.546875 C 169.9375 -62.753906 166.238281 -47.15625 158.84375 -34.75 C 151.457031 -22.34375 141.648438 -13.082031 129.421875 -6.96875 C 117.203125 -0.863281 103.796875 2.1875 89.203125 2.1875 C 74.429688 2.1875 60.882812 -0.820312 48.5625 -6.84375 C 36.25 -12.863281 26.441406 -22.078125 19.140625 -34.484375 C 11.847656 -46.890625 8.203125 -62.578125 8.203125 -81.546875 L 8.203125 -191.546875 L 28.734375 -191.546875 L 28.734375 -81.265625 C 28.734375 -61.929688 34.160156 -46.515625 45.015625 -35.015625 C 55.867188 -23.523438 70.597656 -17.78125 89.203125 -17.78125 C 107.628906 -17.78125 122.222656 -23.390625 132.984375 -34.609375 C 143.753906 -45.828125 149.140625 -61.378906 149.140625 -81.265625 L 149.140625 -191.546875 Z M 169.9375 -191.546875 "></path></g></g></g><g fill="#000000" fill-opacity="1"><g transform="translate(225.965778, 219.256984)"><g></g></g></g><g fill="#000000" fill-opacity="1"><g transform="translate(361.144063, 219.256984)"><g></g></g></g><g fill="#000000" fill-opacity="1"><g transform="translate(496.329844, 219.256984)"><g><path d="M 8.203125 0 L 8.203125 -191.546875 L 28.734375 -191.546875 L 28.734375 0 Z M 8.203125 0 "></path></g></g></g><g fill="#000000" fill-opacity="1"><g transform="translate(580.884864, 219.256984)"><g><path d="M 195.109375 -95.78125 C 195.109375 -73.695312 190.910156 -55.445312 182.515625 -41.03125 C 174.128906 -26.625 162.863281 -15.863281 148.71875 -8.75 C 134.582031 -1.632812 118.847656 1.921875 101.515625 1.921875 C 84.367188 1.921875 68.726562 -1.632812 54.59375 -8.75 C 40.457031 -15.863281 29.191406 -26.625 20.796875 -41.03125 C 12.398438 -55.445312 8.203125 -73.695312 8.203125 -95.78125 C 8.203125 -112.5625 10.617188 -127.0625 15.453125 -139.28125 C 20.296875 -151.5 27.003906 -161.625 35.578125 -169.65625 C 44.148438 -177.6875 53.953125 -183.660156 64.984375 -187.578125 C 76.023438 -191.503906 87.65625 -193.46875 99.875 -193.46875 L 101.515625 -193.46875 C 118.847656 -193.28125 134.582031 -189.628906 148.71875 -182.515625 C 162.863281 -175.398438 174.128906 -164.679688 182.515625 -150.359375 C 190.910156 -136.046875 195.109375 -117.851562 195.109375 -95.78125 Z M 174.3125 -95.78125 C 174.3125 -112.195312 170.84375 -126.195312 163.90625 -137.78125 C 156.976562 -149.363281 147.992188 -158.207031 136.953125 -164.3125 C 125.921875 -170.425781 114.109375 -173.484375 101.515625 -173.484375 L 100.15625 -173.484375 C 91.582031 -173.484375 83.050781 -171.796875 74.5625 -168.421875 C 66.082031 -165.046875 58.421875 -160.03125 51.578125 -153.375 C 44.734375 -146.71875 39.257812 -138.550781 35.15625 -128.875 C 31.050781 -119.207031 29 -108.175781 29 -95.78125 C 29 -83.550781 31.003906 -72.601562 35.015625 -62.9375 C 39.035156 -53.269531 44.507812 -45.101562 51.4375 -38.4375 C 58.375 -31.78125 66.128906 -26.71875 74.703125 -23.25 C 83.273438 -19.789062 92.210938 -18.0625 101.515625 -18.0625 C 114.835938 -18.0625 126.96875 -21.113281 137.90625 -27.21875 C 148.851562 -33.332031 157.65625 -42.179688 164.3125 -53.765625 C 170.976562 -65.347656 174.3125 -79.351562 174.3125 -95.78125 Z M 174.3125 -95.78125 "></path></g></g></g></g></g><g transform="matrix(1, 0, 0, 1, 355, 0)"><g clip-path="url(#43d7c97a54)"><g fill="#000000" fill-opacity="1"><g transform="translate(430.376176, 55.739339)"><g><path d="M -169.9375 191.546875 L -169.9375 81.546875 C -169.9375 62.753906 -166.238281 47.15625 -158.84375 34.75 C -151.457031 22.34375 -141.648438 13.082031 -129.421875 6.96875 C -117.203125 0.863281 -103.796875 -2.1875 -89.203125 -2.1875 C -74.429688 -2.1875 -60.882812 0.820312 -48.5625 6.84375 C -36.25 12.863281 -26.441406 22.078125 -19.140625 34.484375 C -11.847656 46.890625 -8.203125 62.578125 -8.203125 81.546875 L -8.203125 191.546875 L -28.734375 191.546875 L -28.734375 81.265625 C -28.734375 61.929688 -34.160156 46.515625 -45.015625 35.015625 C -55.867188 23.523438 -70.597656 17.78125 -89.203125 17.78125 C -107.628906 17.78125 -122.222656 23.390625 -132.984375 34.609375 C -143.753906 45.828125 -149.140625 61.378906 -149.140625 81.265625 L -149.140625 191.546875 Z M -169.9375 191.546875 "></path></g></g></g><g fill="#000000" fill-opacity="1"><g transform="translate(170.138834, 55.739339)"><g></g></g></g></g></g><g clip-path="url(#ee3ae5f6ba)"><path fill="#ffaa09" d="M 76.855469 82.828125 C 98.375 54.144531 135.835938 41.078125 170.507812 46.097656 C 205.929688 51.222656 238.964844 75.253906 250.851562 120.484375 L 251.859375 124.324219 L 225.417969 124.324219 L 225.417969 125.511719 C 216.011719 91.960938 192.15625 75.410156 166.8125 71.742188 C 140.324219 67.910156 112.695312 78.175781 97.527344 98.398438 L 96.675781 99.53125 L 75.714844 84.351562 Z M 76.855469 82.828125 " fill-opacity="1" fill-rule="nonzero"></path></g><g clip-path="url(#3415d43f50)"><path fill="#ffaa09" d="M 251.15625 166.894531 C 238.238281 214.03125 203.710938 237.566406 167.542969 241.554688 C 132.335938 245.433594 94.859375 230.78125 75.359375 201.546875 L 75.335938 201.507812 L 96.492188 186.601562 L 96.859375 187.148438 C 110.1875 207.136719 137.558594 218.789062 164.714844 215.796875 C 190.585938 212.945312 215.636719 196.792969 225.847656 161.359375 L 252.671875 161.359375 Z M 251.15625 166.894531 " fill-opacity="1" fill-rule="nonzero"></path></g><g clip-path="url(#cca9f6480e)"><path fill="#ffaa09" d="M 254.578125 154.402344 L 254.257812 155.574219 L 254.257812 154.3125 Z M 254.578125 154.402344 " fill-opacity="1" fill-rule="nonzero"></path></g></svg>',
  bs =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" zoomAndPan="magnify" viewBox="0 0 1200 299.999988" height="400" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><g></g><clipPath id="2d44b7e9ed"><rect x="0" width="833" y="0" height="275"></rect></clipPath><clipPath id="bace53cbfd"><rect x="0" width="431" y="0" height="275"></rect></clipPath><clipPath id="9849d57342"><path d="M 75.335938 45.046875 L 252 45.046875 L 252 126 L 75.335938 126 Z M 75.335938 45.046875 " clip-rule="nonzero"></path></clipPath><clipPath id="ad11091c62"><path d="M 75.335938 161 L 253 161 L 253 242.296875 L 75.335938 242.296875 Z M 75.335938 161 " clip-rule="nonzero"></path></clipPath><clipPath id="2658e2d842"><path d="M 254 154 L 254.585938 154 L 254.585938 156 L 254 156 Z M 254 154 " clip-rule="nonzero"></path></clipPath></defs><g transform="matrix(1, 0, 0, 1, 362, 25)"><g clip-path="url(#2d44b7e9ed)"><g fill="#ffffff" fill-opacity="1"><g transform="translate(0.207983, 219.257005)"><g><path d="M 169.9375 -191.546875 L 169.9375 -81.546875 C 169.9375 -62.753906 166.238281 -47.15625 158.84375 -34.75 C 151.457031 -22.34375 141.648438 -13.082031 129.421875 -6.96875 C 117.203125 -0.863281 103.796875 2.1875 89.203125 2.1875 C 74.429688 2.1875 60.882812 -0.820312 48.5625 -6.84375 C 36.25 -12.863281 26.441406 -22.078125 19.140625 -34.484375 C 11.847656 -46.890625 8.203125 -62.578125 8.203125 -81.546875 L 8.203125 -191.546875 L 28.734375 -191.546875 L 28.734375 -81.265625 C 28.734375 -61.929688 34.160156 -46.515625 45.015625 -35.015625 C 55.867188 -23.523438 70.597656 -17.78125 89.203125 -17.78125 C 107.628906 -17.78125 122.222656 -23.390625 132.984375 -34.609375 C 143.753906 -45.828125 149.140625 -61.378906 149.140625 -81.265625 L 149.140625 -191.546875 Z M 169.9375 -191.546875 "></path></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(225.965778, 219.257005)"><g></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(361.144063, 219.257005)"><g></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(496.329844, 219.257005)"><g><path d="M 8.203125 0 L 8.203125 -191.546875 L 28.734375 -191.546875 L 28.734375 0 Z M 8.203125 0 "></path></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(580.884864, 219.257005)"><g><path d="M 195.109375 -95.78125 C 195.109375 -73.695312 190.910156 -55.445312 182.515625 -41.03125 C 174.128906 -26.625 162.863281 -15.863281 148.71875 -8.75 C 134.582031 -1.632812 118.847656 1.921875 101.515625 1.921875 C 84.367188 1.921875 68.726562 -1.632812 54.59375 -8.75 C 40.457031 -15.863281 29.191406 -26.625 20.796875 -41.03125 C 12.398438 -55.445312 8.203125 -73.695312 8.203125 -95.78125 C 8.203125 -112.5625 10.617188 -127.0625 15.453125 -139.28125 C 20.296875 -151.5 27.003906 -161.625 35.578125 -169.65625 C 44.148438 -177.6875 53.953125 -183.660156 64.984375 -187.578125 C 76.023438 -191.503906 87.65625 -193.46875 99.875 -193.46875 L 101.515625 -193.46875 C 118.847656 -193.28125 134.582031 -189.628906 148.71875 -182.515625 C 162.863281 -175.398438 174.128906 -164.679688 182.515625 -150.359375 C 190.910156 -136.046875 195.109375 -117.851562 195.109375 -95.78125 Z M 174.3125 -95.78125 C 174.3125 -112.195312 170.84375 -126.195312 163.90625 -137.78125 C 156.976562 -149.363281 147.992188 -158.207031 136.953125 -164.3125 C 125.921875 -170.425781 114.109375 -173.484375 101.515625 -173.484375 L 100.15625 -173.484375 C 91.582031 -173.484375 83.050781 -171.796875 74.5625 -168.421875 C 66.082031 -165.046875 58.421875 -160.03125 51.578125 -153.375 C 44.734375 -146.71875 39.257812 -138.550781 35.15625 -128.875 C 31.050781 -119.207031 29 -108.175781 29 -95.78125 C 29 -83.550781 31.003906 -72.601562 35.015625 -62.9375 C 39.035156 -53.269531 44.507812 -45.101562 51.4375 -38.4375 C 58.375 -31.78125 66.128906 -26.71875 74.703125 -23.25 C 83.273438 -19.789062 92.210938 -18.0625 101.515625 -18.0625 C 114.835938 -18.0625 126.96875 -21.113281 137.90625 -27.21875 C 148.851562 -33.332031 157.65625 -42.179688 164.3125 -53.765625 C 170.976562 -65.347656 174.3125 -79.351562 174.3125 -95.78125 Z M 174.3125 -95.78125 "></path></g></g></g></g></g><g transform="matrix(1, 0, 0, 1, 355, 0)"><g clip-path="url(#bace53cbfd)"><g fill="#ffffff" fill-opacity="1"><g transform="translate(430.376176, 55.739397)"><g><path d="M -169.9375 191.546875 L -169.9375 81.546875 C -169.9375 62.753906 -166.238281 47.15625 -158.84375 34.75 C -151.457031 22.34375 -141.648438 13.082031 -129.421875 6.96875 C -117.203125 0.863281 -103.796875 -2.1875 -89.203125 -2.1875 C -74.429688 -2.1875 -60.882812 0.820312 -48.5625 6.84375 C -36.25 12.863281 -26.441406 22.078125 -19.140625 34.484375 C -11.847656 46.890625 -8.203125 62.578125 -8.203125 81.546875 L -8.203125 191.546875 L -28.734375 191.546875 L -28.734375 81.265625 C -28.734375 61.929688 -34.160156 46.515625 -45.015625 35.015625 C -55.867188 23.523438 -70.597656 17.78125 -89.203125 17.78125 C -107.628906 17.78125 -122.222656 23.390625 -132.984375 34.609375 C -143.753906 45.828125 -149.140625 61.378906 -149.140625 81.265625 L -149.140625 191.546875 Z M -169.9375 191.546875 "></path></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(170.138834, 55.739397)"><g></g></g></g></g></g><g clip-path="url(#9849d57342)"><path fill="#ffaa09" d="M 76.855469 82.828125 C 98.375 54.144531 135.835938 41.078125 170.507812 46.097656 C 205.929688 51.222656 238.964844 75.253906 250.851562 120.484375 L 251.859375 124.324219 L 225.417969 124.324219 L 225.417969 125.511719 C 216.011719 91.960938 192.15625 75.410156 166.8125 71.742188 C 140.324219 67.910156 112.695312 78.175781 97.527344 98.398438 L 96.675781 99.53125 L 75.714844 84.351562 Z M 76.855469 82.828125 " fill-opacity="1" fill-rule="nonzero"></path></g><g clip-path="url(#ad11091c62)"><path fill="#ffaa09" d="M 251.15625 166.894531 C 238.238281 214.03125 203.710938 237.566406 167.542969 241.554688 C 132.335938 245.433594 94.859375 230.78125 75.359375 201.546875 L 75.335938 201.507812 L 96.492188 186.601562 L 96.859375 187.148438 C 110.1875 207.136719 137.558594 218.789062 164.714844 215.796875 C 190.585938 212.945312 215.636719 196.792969 225.847656 161.359375 L 252.671875 161.359375 Z M 251.15625 166.894531 " fill-opacity="1" fill-rule="nonzero"></path></g><g clip-path="url(#2658e2d842)"><path fill="#ffaa09" d="M 254.578125 154.402344 L 254.257812 155.574219 L 254.257812 154.3125 Z M 254.578125 154.402344 " fill-opacity="1" fill-rule="nonzero"></path></g></svg>',
  Ye = { x: 75.34, y: 45.05, w: 1062.65, h: 202.24 },
  ws = Ye.w / Ye.h,
  Fi = (t) => t.replace(/^[\s\S]*?<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, ""),
  ys = { black: Fi(ms), white: Fi(bs) };
function vs(t) {
  const n = [...t.matchAll(/\bid="([^"]+)"/g)].map((i) => i[1]);
  let e = t;
  for (const i of n) {
    const o = te("uw");
    e = e.split(`id="${i}"`).join(`id="${o}"`).split(`url(#${i})`).join(`url(#${o})`);
  }
  return e;
}
function xe(t, n, e, i = "black") {
  const o = e / Ye.h,
    r = Ye.w * o,
    a = t - Ye.x * o,
    s = n - Ye.y * o;
  return {
    svg: `<g data-role="unio-wortmarke" transform="translate(${I(a, 3)} ${I(s, 3)}) scale(${I(o, 6)})">${vs(ys[i])}</g>`,
    w: r,
    h: e,
  };
}
function ks(t, n) {
  const e = ka(n) > 0.4,
    i = e ? "color" : "reverse",
    o = ya(t.concept, i, n),
    r = Er(o.name, n) >= 4.5 && Er(o.suffix, n) >= 3,
    a = !t.concept.symbol || Er(o.symbol, n) >= 3;
  return r && a ? i : e ? "mono-dark" : "mono-light";
}
function _s(t) {
  const n = t.concept.layout;
  return n === "stacked" || n === "badge" ? "stacked" : "horizontal";
}
const $s = (t) => !!(t.assets.input.suffix ?? "").trim() || t.concept.nameFormat === "district";
function Tn(t, n, e, i, o = !1) {
  const r = o ? { ...t.assets.input, suffix: "", place: void 0 } : t.assets.input,
    a = o && t.concept.nameFormat === "district" ? { ...t.concept, nameFormat: "full" } : t.concept;
  return Hn(a, r, t.assets.fonts, { variant: n, lockup: e, ground: i });
}
function Me(t, n) {
  const e = ks(t, n.ground),
    i = n.w / n.h,
    o = _s(t);
  let r = i >= 3 ? "horizontal" : i <= 1.6 ? "stacked" : o;
  n.prefer && n.prefer !== "auto" && (r = n.prefer);
  const a = n.minSuffix ?? 3.1,
    s = $s(t),
    l = (C) => (C.width && C.height ? Math.min(n.w / C.width, n.h / C.height) : 0),
    c = (C) => !s || l(C) * zr * 0.32 >= a;
  let u = Tn(t, e, r, n.ground),
    f = !1;
  if (!c(u) && r === "horizontal") {
    const C = Tn(t, e, "stacked", n.ground);
    c(C) && ((u = C), (r = "stacked"));
  }
  if (r === "horizontal" && (!n.prefer || n.prefer === "auto") && l(u) * zr < n.h * 0.22) {
    const C = Tn(t, e, "stacked", n.ground);
    l(C) > l(u) * 1.15 && c(C) && ((u = C), (r = "stacked"));
  }
  c(u) || ((u = Tn(t, e, r, n.ground, !0)), (f = !0));
  const h = l(u),
    d = u.width * h,
    b = u.height * h,
    g = n.align ?? "start",
    y = n.valign ?? "middle",
    m = g === "start" ? n.x : g === "end" ? n.x + n.w - d : n.x + (n.w - d) / 2,
    v = y === "top" ? n.y : y === "bottom" ? n.y + n.h - b : n.y + (n.h - b) / 2,
    k = f ? "ohne-zusatz" : r !== o && r === "stacked" ? "untereinander" : null;
  return {
    svg: `<g data-role="makler-logo">${gn(u, m, v, h)}</g>`,
    x: m,
    y: v,
    w: d,
    h: b,
    variant: e,
    lockup: r,
    adjusted: k,
  };
}
function Ss(t) {
  return t
    ? t === "ohne-zusatz"
      ? "Dein Logo wurde für diese Vorlage ohne Zusatz gesetzt, damit es lesbar bleibt."
      : "Dein Logo wurde für diese Vorlage untereinander gesetzt, damit es lesbar bleibt."
    : null;
}
const wn = 25.4 / 72,
  E = {
    bg: "#F2EFE9",
    card: "#FBFAF6",
    ink: "#141210",
    text: "#3B3835",
    muted: "#6E6862",
    light: "#A19A91",
    amberText: "#B87400",
    amber: "#FFAA09",
    hair: "#E3DFD6",
    rule: "#E3E1DC",
    photo: "#E7E1D7",
    glass: "#F7F5F1",
    white: "#FFFFFF",
  },
  Xe = -0.02,
  Yn = 0.16,
  it = {
    claim: "RAUM. TECHNOLOGIE. MENSCH.",
    site: "UNIO.AT",
    circle: "Partner im UNIO CIRCLE",
    circleCaps: "PARTNER IM UNIO CIRCLE",
    personal: ["Ihre Immobilie.", "Mein Auftrag.", "Ihr Erfolg."],
    question: "Sie möchten Ihre Immobilie erfolgreich verkaufen?",
    pitch:
      "Der richtige Preis, die passende Strategie und eine starke Präsentation machen den Unterschied. Ich entwickle mit Ihnen ein Verkaufskonzept für Ihre Liegenschaft und positioniere sie gezielt am Markt.",
    cta: "Vereinbaren Sie einen unverbindlichen Bewertungstermin.",
    pillars: ["Der richtige Preis", "Die passende Strategie", "Eine starke Präsentation"],
  },
  yn = {
    title2: ["Objekttitel in", "zwei Zeilen."],
    title1: "Objekttitel in einer Zeile.",
    address:
      "Adresse, PLZ Ort. Kurzbeschreibung des Objekts in ein bis zwei Zeilen, zum Beispiel Lage, Bauweise und Freiflächen.",
    note: "Planungsstand ..., Flächen laut Planung ..., Änderungen vorbehalten. Visualisierungen beispielhaft. Alle Angaben ohne Gewähr.",
  },
  As = 150,
  Es = 300,
  Pt = (t, n, e, i, o, r, a = "") =>
    `<path d="${Tt(t, n, e, i, o)}" fill="${r}"${a ? " " + a : ""}/>`,
  Ct = (t, n, e, i, o) => Pt(t, n, e, i, o, E.card);
function ze(t, n, e, i, o) {
  return Pt(
    t,
    n,
    e,
    i,
    o,
    E.glass,
    `fill-opacity="0.74" stroke="${E.white}" stroke-opacity="0.5" stroke-width="0.6"`,
  );
}
const ce = (t, n, e, i = E.hair, o = 0.5) =>
  `<line x1="${I(t, 2)}" y1="${I(n, 2)}" x2="${I(t + e, 2)}" y2="${I(n, 2)}" stroke="${i}" stroke-width="${I(o, 2)}"/>`;
function wt(t, n, e, i = E.bg, o = 1) {
  const r = te("ug"),
    a = te("ug"),
    s = { cx: 0.15 * t, cy: -0.13333 * n, rx: 0.625 * t, ry: 0.83333 * n },
    l = { cx: 1.04286 * t, cy: 1.26 * n, rx: 0.71429 * t, ry: n },
    c = (u, f, h) =>
      `<radialGradient id="${u}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="matrix(${I(f.rx, 3)} 0 0 ${I(f.ry, 3)} ${I(f.cx, 3)} ${I(f.cy, 3)})"><stop offset="0" stop-color="${Zn(i, E.amber, h)}"/><stop offset="0.5" stop-color="${Zn(i, E.amber, h * 0.5)}"/><stop offset="1" stop-color="${i}"/></radialGradient>`;
  return `<g data-role="unio-verlauf"><defs>${c(r, s, 0.42 * o)}${c(a, l, 0.16 * o)}</defs><rect x="${I(-e, 3)}" y="${I(-e, 3)}" width="${I(t + 2 * e, 3)}" height="${I(n + 2 * e, 3)}" fill="url(#${r})"/><ellipse cx="${I(l.cx, 3)}" cy="${I(l.cy, 3)}" rx="${I(l.rx, 3)}" ry="${I(l.ry, 3)}" fill="url(#${a})"/></g>`;
}
function yo(t, n, e, i, o, r, a = 2400) {
  const s = a / Math.max(e, i),
    l = Math.round(e * s),
    c = Math.round(i * s);
  let u = "",
    f = `<rect width="${l}" height="${c}" fill="${r}"/>`;
  o.forEach((b, g) => {
    const y = b.a ?? 1,
      m = b.cx * l,
      v = b.cy * c;
    ((u += `<radialGradient id="g${g}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${I(m, 1)} ${I(v, 1)}) rotate(${b.rot ?? 0}) scale(${I(b.rx * l, 1)} ${I(b.ry * c, 1)})"><stop offset="0" stop-color="${b.color}" stop-opacity="${y}"/><stop offset="0.35" stop-color="${b.color}" stop-opacity="${I(y * 0.85, 3)}"/><stop offset="0.7" stop-color="${b.color}" stop-opacity="${I(y * 0.35, 3)}"/><stop offset="1" stop-color="${b.color}" stop-opacity="0"/></radialGradient>`),
      (f += `<rect width="${l}" height="${c}" fill="url(#g${g})"/>`));
  });
  const h = `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${c}" viewBox="0 0 ${l} ${c}"><defs>${u}</defs>${f}</svg>`,
    d = `data:image/svg+xml;base64,${Cs(h)}`;
  return `<g data-role="unio-verlauf"><image x="${I(t, 3)}" y="${I(n, 3)}" width="${I(e, 3)}" height="${I(i, 3)}" preserveAspectRatio="none" href="${d}" data-ground="${r}" data-max="${a}"/></g>`;
}
function Cs(t) {
  return typeof btoa == "function" ? btoa(t) : Buffer.from(t, "utf8").toString("base64");
}
const Xn = (t, n) => {
    const e = t.tables.os2;
    return (((e == null ? void 0 : e.sCapHeight) || t.ascender * 0.7) / t.unitsPerEm) * n;
  },
  vo = (t, n) => (n ? (t.f.headBold ?? t.f.head) : t.f.head);
function ni(t, n, e, i, o, r, a, s) {
  var u;
  let l = ve(n, e, i, o, r, o * a);
  const c = Mt(n, e, l, r);
  return (
    c > i && c > 0 && (l = l * (i / c) * 0.999),
    l < o * 0.85 && s && ((u = t.notes) == null || u.add(s)),
    l
  );
}
function at(t, n, e, i, o, r = {}) {
  const a = vo(t, r.bold),
    s = r.maxWidth ? ni(t, a, n, r.maxWidth, o, Xe, r.minScale ?? 0.85, r.field) : o,
    l = i + Xn(a, s),
    c = r.fill ?? E.ink,
    u = Mt(a, n, s, Xe),
    f = r.anchor === "middle" ? e - u / 2 : r.anchor === "end" ? e - u : e;
  if (r.dot && n.length > 1 && n.endsWith(".")) {
    const h = bt(a, n.slice(0, -1), { x: f, y: l, size: s, fill: c, tracking: Xe }).svg,
      d = bt(a, ".", { x: f + u, y: l, size: s, fill: E.amber, anchor: "end" }).svg;
    return { svg: h + d, w: u, size: s };
  }
  return { svg: bt(a, n, { x: f, y: l, size: s, fill: c, tracking: Xe }).svg, w: u, size: s };
}
function Kt(t, n, e, i, o, r, a = {}) {
  let s = o;
  if (a.maxWidth)
    for (const c of n)
      s = Math.min(s, ni(t, vo(t, a.bold), c, a.maxWidth, o, Xe, a.minScale ?? 0.85, a.field));
  let l = "";
  return (
    n.forEach((c, u) => {
      l += at(t, c, e, i + u * r * s, s, {
        ...a,
        maxWidth: void 0,
        dot: a.dot && u === n.length - 1,
      }).svg;
    }),
    { svg: l, bottom: i + (n.length - 1) * r * s + Xn(t.f.head, s), size: s }
  );
}
function ur(t, n, e, i, o, r, a, s, l = {}) {
  var b;
  let c = n.replace(/\s+/g, " ").trim();
  l.dot && c && !/[.!?:…]$/.test(c) && (c += ".");
  const u = l.minScale ?? 0.7;
  let f = o,
    h = Qn(t, c, f, a);
  for (; h.length > s && f > o * u; ) ((f *= 0.95), (h = Qn(t, c, f, a)));
  return (
    h.length > s && ((h = h.slice(0, s)), (h[s - 1] = h[s - 1].replace(/[\s.,;:]*$/, "") + " ...")),
    f < o * 0.85 && ((b = t.notes) == null || b.add(l.field ?? "titel")),
    { ...Kt(t, h, e, i, f, r, { ...l, maxWidth: a }), lines: h.length }
  );
}
function Qn(t, n, e, i) {
  return qr(t.f.head, n, e, i, Xe);
}
function U(t, n, e, i, o, r = {}) {
  var z, L, A;
  const a = r.bold ? t.f.bodyBold : t.f.body,
    s = r.caps ? n.toLocaleUpperCase("de-AT") : n,
    l = r.tracking ?? 0,
    c = Math.min(o, Math.max(o * (r.minScale ?? 0.8), r.min ?? 0));
  let u = o;
  r.fit &&
    (u = Math.min(
      ...s
        .split(
          `
`,
        )
        .map((O) => ni(t, a, O, r.fit, o, l, c / o, r.field)),
    ));
  const f = r.minHard && r.min ? Math.min(o, r.min) : 0;
  let h = !1;
  f && u < f && (u = f);
  let d = r.wrap
    ? s
        .split(
          `
`,
        )
        .flatMap((O) => qr(a, O, u, r.wrap, l))
    : s.split(`
`);
  if (
    (f &&
      r.fit &&
      !r.wrap &&
      (d = d.map((O) => (Mt(a, O, u, l) <= r.fit ? O : ((h = !0), Fs(a, O, u, r.fit, l))))),
    r.wrap)
  ) {
    const O = Math.max(0, ...d.map(($) => Mt(a, $, u, l)));
    if (O > r.wrap) {
      const $ = (r.wrap / O) * 0.999;
      (f && u * $ < f
        ? ((d = d.flatMap((x) => (Mt(a, x, u, l) > r.wrap ? Is(a, x, u, r.wrap, l) : [x]))),
          (h = !0))
        : (u *= $),
        r.field && ((z = t.notes) == null || z.add(r.field)));
    }
    if (r.maxLines && d.length > r.maxLines) {
      d = d.slice(0, r.maxLines);
      let $ = d[r.maxLines - 1].replace(/[\s.,;:]*$/, "");
      for (; $ && Mt(a, `${$} ...`, u, l) > r.wrap; ) $ = $.replace(/\s*\S+$/, "");
      ((d[r.maxLines - 1] = `${$} ...`), r.field && ((L = t.notes) == null || L.add(r.field)));
    }
  }
  h && r.field && ((A = t.notes) == null || A.add(r.field));
  const b = a.ascender / a.unitsPerEm,
    g = -a.descender / a.unitsPerEm,
    y = r.lh ?? b + g,
    m = y * u,
    v = i + ((y - b - g) * u) / 2 + b * u;
  let k = "",
    C = 0;
  return (
    d.forEach((O, $) => {
      const x = bt(a, O, {
        x: e,
        y: v + $ * m,
        size: u,
        fill: r.fill ?? E.muted,
        tracking: l,
        anchor: r.anchor,
      });
      ((k += x.svg), (C = Math.max(C, x.width)));
    }),
    { svg: k, bottom: i + d.length * m, lines: d.length, w: C, size: u }
  );
}
function Fs(t, n, e, i, o) {
  let r = n;
  for (; r.length > 1 && Mt(t, `${r}...`, e, o) > i; ) r = r.slice(0, -1);
  return `${r.replace(/[\s.,;:/-]+$/, "")}...`;
}
function Is(t, n, e, i, o) {
  const r = [];
  let a = n;
  for (; a && Mt(t, a, e, o) > i; ) {
    let s = a.length - 1;
    for (; s > 1 && Mt(t, a.slice(0, s), e, o) > i; ) s--;
    const l = Math.max(...["/", ".", "-", "@"].map((c) => a.lastIndexOf(c, s - 1)));
    (l > s * 0.5 && (s = l + 1), r.push(a.slice(0, s)), (a = a.slice(s)));
  }
  return (a && r.push(a), r);
}
const ue = (t) => `<g data-role="qr-hinweis">${t}</g>`,
  st = (t, n, e, i, o, r = E.light, a = "start") =>
    U(t, n, e, i, o, { bold: !0, caps: !0, tracking: Yn, fill: r, anchor: a }).svg;
function Ht(t, n, e, i) {
  return `<g data-role="unio-fusszeile">${st(t, it.claim, n, e, i)}${st(t, it.site, t.W - n, e, i, E.light, "end")}</g>`;
}
function Te(t, n, e, i, o, r, a = E.muted, s = "   |   ", l = 6) {
  const c = n.map((b) => (b ?? "").trim()).filter(Boolean),
    u = c.join(s),
    f = t.f.body,
    h = Math.min(o, l);
  let d;
  if (ve(f, u, r, o, 0, h) > h || Mt(f, u, h) <= r || c.length < 2)
    d = U(t, u, e, i, o, { fit: r, min: h, minScale: 0, fill: a, field: "kontakt" }).svg;
  else {
    const b = c.length > 2 ? 2 : 1,
      g = [c.slice(0, b).join(s), c.slice(b).join(s)].join(`
`);
    d = U(t, g, e, i - o * 0.35, h, {
      fit: r,
      min: h,
      minScale: 0,
      lh: 1.35,
      fill: a,
      field: "kontakt",
    }).svg;
  }
  return `<g data-role="kontakt">${u.includes(it.circle) ? me(d) : d}</g>`;
}
function Jn(t, n, e, i, o = !1) {
  const r = o ? t.f.bodyBold : t.f.body;
  if (Mt(r, n, e) <= i) return [n];
  const a = n.indexOf("@");
  if (a > 0) return [n.slice(0, a), n.slice(a)];
  const s = n.lastIndexOf("/");
  return s > 0 ? [n.slice(0, s), n.slice(s)] : qr(r, n, e, i);
}
const me = (t) => `<g data-role="unio-circle">${t}</g>`,
  Re = (t, n, e, i, o = E.muted) => me(st(t, it.circleCaps, n, e, i, o));
function Sn(t, n = !0, e = !1) {
  const i = t.kit.contact,
    o = [n ? i.person : "", n ? it.circle : "", i.phone, i.email];
  return (e && o.push(qt(i.web)), o);
}
const Br = (t) => qt(t).split(/[/?#]/)[0];
function Yt(t, n = "person") {
  var r, a;
  const e = n === "objekt" ? pn(((r = t.assets.object) == null ? void 0 : r.url) ?? "") : "";
  if (e)
    return {
      data: e,
      caption: Br(((a = t.assets.object) == null ? void 0 : a.url) ?? ""),
      web: !0,
      kind: "objekt",
    };
  const i = pn(t.contact.web);
  if (i) return { data: i, caption: Br(t.contact.web), web: !0, kind: "web" };
  const o = t.contact;
  return {
    data: so({ ...o, role: "", street: "", city: "", web: "" }),
    caption: "Kontakt speichern",
    web: !1,
    kind: "kontakt",
  };
}
function fr(t, n, e = "Mehr Informationen online", i = "Kontakt speichern") {
  return t === "objekt" ? n : t === "web" ? e : i;
}
function ne(t, n, e, i, o = "person", r = !1) {
  const a = Yt(t.kit, o);
  if (r) return `<g data-role="qr">${qn(a.data, n, e, i, E.ink, a.web ? "M" : "L").svg}</g>`;
  const s = i * 0.06;
  return `<g data-role="qr">${Pt(n, e, i, i, i * 0.065, E.white)}${qn(a.data, n + s, e + s, i - 2 * s, E.ink, a.web ? "M" : "L").svg}</g>`;
}
const ko = (t, n, e, i = E.amber) =>
  `<circle cx="${I(t, 2)}" cy="${I(n, 2)}" r="${I(e, 2)}" fill="${i}"/>`;
function Os(t, n) {
  var i;
  const e = (((i = t.kit.assets.object) == null ? void 0 : i.photos) ?? []).filter((o) =>
    /^data:image\/(png|jpe?g|webp);base64,/.test(o),
  );
  return e.length ? e[n % e.length] : void 0;
}
function zs(t, n, e, i) {
  var f;
  const o = Sa(n);
  if (!o) return 2400;
  const r = t.mmPerUnit;
  if (!r) return Math.min(4e3, Math.max(o.w, o.h));
  const a = e * r,
    s = i * r,
    c = 25.4 / Math.max(a / o.w, s / o.h);
  ((t.photoPpi = Math.min(t.photoPpi ?? 1 / 0, c)),
    c < As && ((f = t.missing) == null || f.add("foto")));
  const u = Math.max(o.w, o.h) * Math.min(1, Es / c);
  return Math.round(Math.min(4e3, Math.max(o.w, o.h), Math.max(800, u)));
}
function Lt(t, n, e, i, o, r, a = "Objektfoto", s = 0) {
  const l = Os(t, s);
  if (l)
    return `<g data-role="objektfoto">${Ne(n, e, i, o, r, Pt(n, e, i, o, 0, E.photo) + ir(l, n, e, i, o, `data-ground="${E.photo}" data-max="${zs(t, l, i, o)}"`))}</g>`;
  const c = Math.max(4.4, Math.min(i, o) * 0.045),
    u = a.toLocaleUpperCase("de-AT"),
    f = Mt(t.f.bodyBold, u, c, Yn),
    h = c * 1.1,
    d = n + (i - f - h - c * 0.8) / 2,
    b = e + o / 2;
  return (
    `<g data-role="bildplatzhalter">${Pt(n, e, i, o, r, E.photo)}` +
    ko(d + c * 0.4, b, c * 0.4) +
    U(t, u, d + c * 0.8 + h, b - c * 0.63, c, { bold: !0, tracking: Yn, fill: E.light }).svg +
    "</g>"
  );
}
function Ne(t, n, e, i, o, r) {
  const a = te("uc");
  return `<g><defs><clipPath id="${a}"><path d="${Tt(t, n, e, i, o)}"/></clipPath></defs><g clip-path="url(#${a})">${r}</g></g>`;
}
function _o(t, n, e, i, o, r) {
  const a = ao(t.kit.contact.person) || t.kit.initials,
    s = Math.min(r, i * 0.32, t.W * 0.14);
  return (
    `<rect x="${I(n, 2)}" y="${I(e, 2)}" width="${I(i, 2)}" height="${I(o, 2)}" fill="${E.photo}"/>` +
    at(t, a, n + i / 2, e + o * 0.46 - Xn(t.f.head, s) / 2, s, { anchor: "middle", fill: E.light })
      .svg +
    (Math.min(s * 0.16, t.W * 0.012) < 6
      ? ""
      : st(
          t,
          "Porträt 3:4",
          n + i / 2,
          e + o * 0.46 + Xn(t.f.head, s) / 2 + s * 0.35,
          Math.min(s * 0.16, t.W * 0.012),
          E.light,
          "middle",
        ))
  );
}
function An(t, n, e, i, o, r) {
  var f;
  const a = (f = t.kit.assets.contact) == null ? void 0 : f.photo;
  if (!a)
    return `<g data-role="portraet">${Ne(n, e, i, o, r, _o(t, n, e, i, o, Math.min(i, o) * 0.34))}</g>`;
  const s = Math.max(i, (o * 3) / 4),
    l = (s * 4) / 3,
    c = n + i / 2 - s * Kn.x;
  let u = e + o * 0.4 - l * Kn.yFromTop;
  return (
    (u = Math.min(e, Math.max(e + o - l, u))),
    `<g data-role="portraet">${Ne(n, e, i, o, r, `<rect x="${I(n, 2)}" y="${I(e, 2)}" width="${I(i, 2)}" height="${I(o, 2)}" fill="${E.photo}"/>` + ir(a, c, u, s, l, `data-ground="${E.photo}"`))}</g>`
  );
}
function En(t, n, e, i, o) {
  var c;
  const r = (c = t.kit.assets.contact) == null ? void 0 : c.photo,
    a = te("uc"),
    s = i / 2,
    l = r
      ? `<g transform="translate(${I(n - s, 3)} ${I(e - s, 3)})">${ho(r, i, E.photo)}</g>`
      : _o(t, n - s, e - s, i, i, i * 0.36);
  return `<g data-role="portraet"><circle cx="${I(n, 2)}" cy="${I(e + o * 0.35, 2)}" r="${I(s + o + o * 0.25, 2)}" fill="${E.ink}" fill-opacity="0.05"/><circle cx="${I(n, 2)}" cy="${I(e, 2)}" r="${I(s + o, 2)}" fill="${E.white}"/><defs><clipPath id="${a}"><circle cx="${I(n, 3)}" cy="${I(e, 3)}" r="${I(s, 3)}"/></clipPath></defs><g clip-path="url(#${a})">${l}</g></g>`;
}
function St(t, n, e, i, o, r, a, s = "black") {
  const l = Math.max(a * 0.9, 6),
    c = a * 5.2544,
    u = Me(t.kit, {
      x: n,
      y: e,
      w: o - c - 2 * l,
      h: i,
      ground: r,
      align: "start",
      valign: "middle",
    }),
    f = u.x + u.w + l,
    h = e + i / 2,
    d = Math.min(i, a * 2.4),
    b = `<line x1="${I(f, 2)}" y1="${I(h - d / 2, 2)}" x2="${I(f, 2)}" y2="${I(h + d / 2, 2)}" stroke="${s === "black" ? E.ink : E.white}" stroke-opacity="0.25" stroke-width="${I(Math.max(0.4, a * 0.06), 2)}"/>`,
    g = xe(f + l, h - a / 2, a, s);
  return {
    svg: `<g data-role="co-branding">${u.svg}${b}${g.svg}</g>`,
    w: f + l + g.w - n,
    logo: u,
  };
}
function ri(t) {
  var e;
  const n = Fa(t.kit.assets.object);
  return (
    n !== "voll" &&
      t.kit.assets.object &&
      ((e = t.missing) == null || e.add(n === "leer" ? "energie" : "energie-teil")),
    n !== "leer" || t.preview
  );
}
function ae(t, n, e, i, o, r = E.text) {
  if (!ri(t)) return "";
  const s = U(t, "ENERGIEAUSWEIS", n, e, i * 0.86, { bold: !0, tracking: Yn, fill: E.muted }),
    l = n + s.w + i * 1.4;
  return `<g data-role="energieausweis">${s.svg}${U(t, Yr(t.kit.assets.object), l, e - i * 0.07, i, { fill: r, fit: o - (l - n), minScale: 0.75 }).svg}</g>`;
}
function $o(t, n, e, i) {
  const o = "BEISPIELDATEN",
    r = Mt(t.f.bodyBold, o, i, 0.12),
    a = i * 2.2,
    s = r + i * 1.8,
    l = n - s;
  return `<g data-role="beispieldaten">${Pt(l, e, s, a, a / 2, "#C0392B")}${U(t, o, l + i * 0.9, e + (a - i * 1.26) / 2, i, { bold: !0, tracking: 0.12, fill: E.white }).svg}</g>`;
}
const dr = {
  A5: { w: 148, h: 210, unit: "mm" },
  A4: { w: 210, h: 297, unit: "mm" },
  A4quer: { w: 297, h: 210, unit: "mm" },
  A1: { w: 594, h: 841, unit: "mm" },
  Karte: { w: 85, h: 55, unit: "mm" },
  Schild: { w: 600, h: 400, unit: "mm" },
  Faltschild: { w: 500, h: 700, unit: "mm" },
  Banner: { w: 4e3, h: 2e3, unit: "mm" },
  Post: { w: 1080, h: 1350, unit: "px" },
  Story: { w: 1080, h: 1920, unit: "px" },
  Quadrat: { w: 1080, h: 1080, unit: "px" },
  LinkedIn: { w: 1584, h: 396, unit: "px" },
  Facebook: { w: 1640, h: 624, unit: "px" },
};
Object.fromEntries(Object.entries(dr).map(([t, n]) => [t, [n.w, n.h]]));
const xs = jt.print,
  So = jt.online,
  hr = 3,
  je = (t) => dr[t.format],
  Ao = (t) => je(t).unit === "px",
  tn = (t) => (t.units === "mm" ? 1 : 1 / wn);
function gr(t) {
  const n = je(t);
  return n.unit === "px" ? { W: n.w, H: n.h } : { W: n.w * tn(t), H: n.h * tn(t) };
}
function Ms(t) {
  const n = dr[t];
  return n.unit === "px" ? { W: n.w, H: n.h } : { W: n.w / wn, H: n.h / wn };
}
function vn(t, n, e) {
  const i = wo();
  if (!i) return null;
  const o = typeof n == "string" ? Ms(n) : gr(n),
    a =
      dr[typeof n == "string" ? n : n.format].unit === "px"
        ? void 0
        : typeof n == "string"
          ? wn
          : 1 / tn(n);
  return { kit: t, f: i, preview: e, ...o, notes: new Set(), missing: new Set(), mmPerUnit: a };
}
function Ts(t) {
  const n = {
      name: "Dein Name ist für diese Vorlage etwas lang. Wir haben ihn kleiner gesetzt. Prüf bitte die Vorschau.",
      kontakt:
        "Deine Kontaktdaten sind für diese Vorlage etwas lang. Wir haben sie kleiner gesetzt. Prüf bitte die Vorschau.",
      titel:
        "Der Objekttitel ist für diese Vorlage etwas lang. Wir haben ihn kleiner gesetzt oder gekürzt. Prüf bitte die Vorschau.",
      text: "Ein Text ist für diese Vorlage etwas lang. Wir haben ihn kleiner gesetzt. Prüf bitte die Vorschau.",
    },
    e = {
      name: "Dein Name",
      kontakt: "deine Kontaktdaten",
      titel: "der Objekttitel",
      text: "ein Text",
    },
    i = ["name", "kontakt", "titel", "text"].filter((a) => t.has(a));
  if (!i.length) return null;
  if (i.length === 1) return n[i[0]];
  const o = i.map((a, s) => (s === 0 ? e[a].replace(/^./, (l) => l.toUpperCase()) : e[a]));
  return `${`${o.slice(0, -1).join(", ")} und ${o[o.length - 1]}`} sind für diese Vorlage etwas lang. Wir haben sie kleiner gesetzt${t.has("titel") ? " oder gekürzt" : ""}. Prüf bitte die Vorschau.`;
}
function Ls(t, n = {}) {
  const e = [];
  if (
    (t.has("energie") ? e.push(yi.leer) : t.has("energie-teil") && e.push(yi.teil), t.has("foto"))
  ) {
    const i = n.photoPpi
      ? ` (etwa ${Math.round(n.photoPpi)} ppi, empfohlen mindestens 150 ppi)`
      : "";
    e.push(
      `Foto zu klein: Ein Objektfoto ist für ${n.label ?? "diese Vorlage"} zu klein${i} und wirkt im Druck unscharf. Lade ein größeres Foto hoch.`,
    );
  }
  return e.length ? e.join(" ") : null;
}
function Dr(t, n, e, i) {
  const o = je(t),
    { W: r, H: a } = gr(t);
  if (o.unit === "px") {
    const h = te("ub");
    return ee(
      r,
      a,
      `<defs><clipPath id="${h}"><rect x="0" y="0" width="${r}" height="${a}"/></clipPath></defs><g clip-path="url(#${h})">${n(0)}</g>`,
      { unit: "px", title: i },
    );
  }
  const s = tn(t),
    l = e * s,
    c = te("ub"),
    u = `<defs><clipPath id="${c}"><rect x="${I(-l, 3)}" y="${I(-l, 3)}" width="${I(r + 2 * l, 3)}" height="${I(a + 2 * l, 3)}"/></clipPath></defs><g clip-path="url(#${c})">${n(l)}</g>`,
    f = s === 1 ? "" : ` scale(${I(1 / s, 6)})`;
  return ee(
    o.w + 2 * e,
    o.h + 2 * e,
    `<g transform="translate(${I(e, 3)} ${I(e, 3)})${f}">${u}</g>`,
    { unit: "mm", title: i },
  );
}
function Ps(t) {
  const { W: n, H: e } = gr(t);
  return (i) =>
    `<g data-role="unio-laedt">${wt(n, e, i)}<rect x="${I(n * 0.07)}" y="${I(e * 0.3)}" width="${I(n * 0.86)}" height="${I(e * 0.4)}" rx="${I(Math.min(n, e) * 0.03)}" fill="${E.card}"/></g>`;
}
function ke(t, n, e, i = !0) {
  const o = vn(t, n, i),
    r = n.pages[e],
    a = `${n.label} · ${r.label} (UNIO-Vorlage)`;
  if (!o) return Dr(n, Ps(n), 0, a);
  const s = Math.min(o.W, o.H),
    l =
      i && t.sample && n.stamp !== !1
        ? $o(o, o.W - s * 0.025, s * 0.02, Math.max(s * 0.017, Ao(n) ? 14 : 5 * (tn(n) * wn)))
        : "";
  return Dr(n, (c) => r.draw(o, c) + l, 0, a);
}
function Bs(t, n, e) {
  const i = vn(t, n, !1);
  if (!i) throw new Error("UNIO-Schriften nicht geladen (vorher ensureUnioFonts() aufrufen)");
  const o = je(n),
    r = n.bleed ?? hr;
  return { svg: Dr(n, (a) => n.pages[e].draw(i, a), r), w: o.w + 2 * r, h: o.h + 2 * r, bleed: r };
}
function Ii(t, n, e) {
  var g;
  const i = vn(t, n, !1);
  if (!i) throw new Error("UNIO-Schriften nicht geladen (vorher ensureUnioFonts() aufrufen)");
  const o = je(n),
    r = e ?? n.bleed ?? hr,
    a = tn(n),
    s = r * a,
    l = n.pages.length,
    { W: c, H: u } = gr(n);
  let f = "";
  n.pages.forEach((y, m) => {
    const v = m === 0 ? -s : 0,
      k = m === l - 1 ? c + s : c + a,
      C = te("us");
    f += `<g transform="translate(${I(m * c, 3)} 0)"><defs><clipPath id="${C}"><rect x="${I(v, 3)}" y="${I(-s, 3)}" width="${I(k - v, 3)}" height="${I(u + 2 * s, 3)}"/></clipPath></defs><g clip-path="url(#${C})">${y.draw(i, s)}</g></g>`;
  });
  const h = a === 1 ? "" : ` scale(${I(1 / a, 6)})`,
    d = l * o.w + 2 * r,
    b = o.h + 2 * r;
  return {
    svg: ee(d, b, `<g transform="translate(${I(r, 3)} ${I(r, 3)})${h}">${f}</g>`, {
      unit: "mm",
      title: `${n.label} · ${((g = n.spread) == null ? void 0 : g.label) ?? "Bogen"} (UNIO-Vorlage)`,
    }),
    w: d,
    h: b,
    bleed: r,
  };
}
const Oi = 1240,
  He = (t) => async () => (await cr(), t());
function Ds(t, n) {
  var g, y;
  const e = je(t),
    i = t.pages.length,
    o = t.dir ?? (e.unit === "px" ? So : xs),
    r = `${o}/${n.slug}_${t.file}`,
    a = [];
  if (e.unit === "px")
    return (
      t.pages.forEach((m, v) => {
        const k = m.file ? `_${m.file}` : i > 1 ? `-${v + 1}` : "";
        (a.push({
          path: `${r}${k}.png`,
          mime: "image/png",
          note: `${t.label}${i > 1 ? `, ${m.label}` : ""} im UNIO-Design. ${t.note ?? "Zum direkten Hochladen. Platzhalter vorher ersetzen."}`,
          make: He(() => _e(ke(n, t, v, !1), e.w, e.h)),
        }),
          a.push({
            path: `${o}/svg/${n.slug}_${t.file}${k}.svg`,
            mime: "image/svg+xml",
            note: `${t.label}${i > 1 ? `, ${m.label}` : ""} als SVG, für Grafiker und zum Weiterbearbeiten.`,
            make: He(async () => ke(n, t, v, !1)),
          }));
      }),
      [...a, ...(((g = t.extraFiles) == null ? void 0 : g.call(t, n)) ?? [])]
    );
  const s = t.bleed ?? hr,
    l = t.pngWidth ?? (e.w <= 100 ? 1200 : e.w > 400 ? 2480 : 1240),
    c = Math.min(l, Math.round((Oi * e.w) / Math.max(e.w, e.h))),
    u = Math.round((c * e.h) / e.w),
    f = (m, v, k) => ({
      path: m,
      mime: "application/pdf",
      note: k,
      make: He(() =>
        Mr(
          v.map((C) => {
            const z = Bs(n, t, C);
            return s
              ? { svg: z.svg, widthMm: z.w, heightMm: z.h, trimInsetMm: s, bleedMm: s }
              : { svg: z.svg, widthMm: z.w, heightMm: z.h };
          }),
          {
            title: `${n.brandName} ${t.label} (UNIO-Vorlage)`,
            subject: "UNIO-Vorlage, Partner im UNIO CIRCLE",
          },
        ),
      ),
    }),
    h = s ? `, mit ${String(s).replace(".", ",")} mm Rand für den Zuschnitt` : "",
    d = t.note ?? "Platzhalter vorher ersetzen.";
  (t.pages.some((m) => m.file)
    ? t.pages.forEach((m, v) =>
        a.push(
          f(`${r}_${m.file}_druck.pdf`, [v], `${t.label}, ${m.label} (UNIO-Vorlage)${h}. ${d}`),
        ),
      )
    : a.push(
        f(
          `${r}${s ? "_druck" : ""}.pdf`,
          t.pages.map((m, v) => v),
          `${t.label} (UNIO-Vorlage, ${t.format === "A4quer" ? "A4 quer" : t.format}${i > 1 ? `, ${i} Seiten` : ""})${s ? " für die Druckerei" : ""}${h}. ${d}`,
        ),
      ),
    t.previews !== !1 &&
      !t.spread &&
      t.pages.forEach((m, v) => {
        const k = m.file ? `-${m.file}` : i > 1 ? `-seite-${v + 1}` : "";
        a.push({
          path: `${r}_vorschau${k}.png`,
          mime: "image/png",
          note: `Vorschau ${t.label}${i > 1 ? `, ${m.label}` : ""} (UNIO-Vorlage).`,
          make: He(() => _e(ke(n, t, v, !1), c, u)),
        });
      }));
  const b = t.spread;
  if (b) {
    const m = {
      title: `${n.brandName} ${t.label} ${b.label} (UNIO-Vorlage)`,
      subject: "UNIO-Vorlage, Partner im UNIO CIRCLE",
    };
    (a.push({
      path: `${r}_${b.file}_druck.pdf`,
      mime: "application/pdf",
      note: `${t.label}, ${b.label}: alle Teile auf einem Bogen (UNIO-Vorlage)${h}. ${d}`,
      make: He(() => {
        const v = Ii(n, t);
        return Mr(
          [{ svg: v.svg, widthMm: v.w, heightMm: v.h, trimInsetMm: v.bleed, bleedMm: v.bleed }],
          m,
        );
      }),
    }),
      t.previews !== !1 &&
        a.push({
          path: `${r}_vorschau-${b.file}.png`,
          mime: "image/png",
          note: `Vorschau ${t.label}, ${b.label} (UNIO-Vorlage).`,
          make: He(() => {
            const v = Math.min(1, (1.5 * Oi) / (c * i));
            return _e(Ii(n, t, 0).svg, c * i * v, u * v);
          }),
        }));
  }
  return [...a, ...(((y = t.extraFiles) == null ? void 0 : y.call(t, n)) ?? [])];
}
function Ns(t) {
  if (t.sizeLabel) return t.sizeLabel;
  const n = je(t),
    e = t.pages.length;
  if (n.unit === "px") return `${n.w} x ${n.h} px`;
  const i = t.format === "A4quer" ? "A4 quer" : /^A\d/.test(t.format) ? t.format : "";
  return `${i ? `${i} · ` : ""}${n.w} x ${n.h} mm${e > 1 ? ` · ${e} Seiten` : ""}${(t.bleed ?? hr) ? " · druckfertig" : ""}`;
}
function Bt(t) {
  const n = Ao(t),
    e = new WeakMap(),
    i = (s) => {
      const l = Et(s),
        c = e.get(l);
      if (c) return c;
      const u = vn(l, t, !1);
      if (!u) return null;
      t.pages.forEach((h) => h.draw(u, 0));
      const f = {
        notes: u.notes ?? new Set(),
        missing: u.missing ?? new Set(),
        photoPpi: u.photoPpi,
      };
      return (e.set(l, f), f);
    },
    o = (s) => Ds(t, s),
    r = (s) => t.pages.map((l, c) => ({ label: l.label, svg: ke(s, t, c, !0) })),
    a = {
      id: t.id,
      group: t.group ?? (n ? "social" : "print"),
      variant: "unio",
      label: t.label,
      description: t.description,
      sizeLabel: Ns(t),
      formats: n ? ["png", "svg"] : ["pdf", "png"],
      needsContact: t.needsContact ?? !0,
      preview: (s) => ke(Et(s), t, 0, !0),
      plan: (s) => o(Et(s)),
      exportFiles: async (s) => {
        ($n(s), await cr());
        const l = [];
        for (const c of o(Et(s))) l.push({ path: c.path, mime: c.mime, data: await c.make() });
        return l;
      },
      textAdjusted: (s) => {
        const l = i(s);
        return l ? Ts(l.notes) : null;
      },
      missingInfo: (s) => {
        const l = i(s);
        return l ? Ls(l.missing, { label: t.label, photoPpi: l.photoPpi }) : null;
      },
      logoAdjusted: (s) => {
        const l = Et(s),
          c = vn(l, t, !0);
        return c && t.logoCheck ? Ss(t.logoCheck(c)) : null;
      },
    };
  return ((a.pages = (s) => r(Et(s))), t.replaces && (a.replaces = t.replaces), a);
}
const Rs = [
    { label: "Wohnfläche", value: "... m²" },
    { label: "Zimmer", value: "..." },
    { label: "Grundstück", value: "... m²" },
    { label: "Freiflächen", value: "... m²" },
  ],
  Nr = (t) => (t ?? "").replace(/\s+/g, " ").trim(),
  Ze = (t, n = 600) =>
    Nr(t)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .slice(0, n);
function Zt(t) {
  const n = t.kit.assets.object,
    e = ((n == null ? void 0 : n.facts) ?? [])
      .map((l) => ({ label: Ze(l.label, 40), value: Ze(l.value, 40) }))
      .filter((l) => l.label || l.value),
    i = !!n && (!!Nr(n.title) || e.length > 0 || !!Nr(n.description)),
    o = Ze(n == null ? void 0 : n.title, 140),
    r = Ze(n == null ? void 0 : n.address, 140),
    a = Ze(n == null ? void 0 : n.description),
    s = i
      ? [r, a]
          .filter(Boolean)
          .map((l) => (/[.!?]$/.test(l) ? l : `${l}.`))
          .join(" ")
      : yn.address;
  return {
    has: i,
    title: o,
    address: r,
    description: a,
    lead: s,
    energy: Yr(n),
    price: Ze(n == null ? void 0 : n.price, 40) || "€ ...",
    url: qt((n == null ? void 0 : n.url) ?? ""),
    note: i
      ? "Alle Angaben ohne Gewähr, Änderungen vorbehalten. Visualisierungen beispielhaft."
      : yn.note,
    facts: (l) => (i ? e.slice(0, l) : Rs.slice(0, l)),
    more: (l, c) => (i ? e.slice(l, l + c) : []),
  };
}
function $e(t, n, e, i, o, r, a, s) {
  const l = Zt(t);
  return l.has && l.title
    ? ur(t, l.title, n, e, i, o, r, a, { dot: !0, field: "titel" })
    : Kt(t, s, n, e, i, o, { dot: !0, maxWidth: r });
}
function Dn(t, n, e, i, o, r, a, s, l = "#6E6862") {
  if (!n.length) return "";
  const c = o / n.length;
  let u = "";
  return (
    n.forEach((f, h) => {
      const d = e + h * c;
      ((u += U(t, f.label, d, i, r, {
        bold: !0,
        caps: !0,
        tracking: 0.16,
        fill: l,
        fit: c - 8,
        minScale: 0.7,
      }).svg),
        (u += at(t, f.value, d + 0.2, i + s, a, { maxWidth: c - 8, minScale: 0.6 }).svg));
    }),
    u
  );
}
const Xt = 40,
  we = { x: 14, y: 14, h: 632, r: 12 },
  Cr = 8,
  Eo = (t) => St(t, Xt, 29, 28, 330, E.bg, 10);
function js(t) {
  const n = Yt(t.kit, "objekt");
  if (n.web) return n.data;
  const e = ar(t.kit.contact.phone);
  return e ? `tel:${e}` : n.data;
}
function Ws(t, n, e, i) {
  const o = e * 0.2,
    r = `fill="none" stroke="${i}" stroke-width="${I(e * 0.08, 2)}"`;
  return `<circle cx="${I(t + o, 2)}" cy="${I(n + e * 0.25, 2)}" r="${I(o, 2)}" ${r}/><circle cx="${I(t + o, 2)}" cy="${I(n + e * 0.75, 2)}" r="${I(o, 2)}" ${r}/><path d="M${I(t + o * 1.8, 2)} ${I(n + e * 0.36, 2)}L${I(t + e, 2)} ${I(n + e * 0.78, 2)}M${I(t + o * 1.8, 2)} ${I(n + e * 0.64, 2)}L${I(t + e, 2)} ${I(n + e * 0.22, 2)}" ${r}/>`;
}
function ii(t, n, e, i, o, r = 1) {
  const a = (i - 24) / 4;
  let s = "";
  return (
    Zt(t)
      .facts(4)
      .forEach((l, c) => {
        const u = n + c * (a + 8),
          f = c === 0,
          h = f ? E.text : E.light;
        ((s += Pt(u, e, a, o, 8 * r, f ? E.amber : E.card)),
          (s += U(t, l.label, u + 8 * r, e + 7 * r, 4.4 * r, {
            bold: !0,
            caps: !0,
            tracking: 0.16,
            fill: h,
            fit: a - 16 * r,
            minScale: 0.75,
          }).svg),
          (s += at(t, l.value, u + 8.2 * r, e + 27.2 * r, 11.38 * r, {
            maxWidth: a - 16 * r,
            minScale: 0.6,
          }).svg));
      }),
    `<g data-role="kennzahlen">${s}</g>`
  );
}
function Co(t, n, e, i, o, r, a = "objekt") {
  const s = t.kit.contact,
    l = t.W;
  let c = En(t, n + 40, e + 40, 74, 3);
  const u = n + 96.4,
    f = 84,
    h = l - n - f - 16 - u;
  return (
    (c += at(t, i, u, e + 4, 12.81, { maxWidth: h }).svg),
    (c += U(t, o, u - 0.4, e + 22, 6.9, { lh: 1.52, wrap: h, maxLines: 2 }).svg),
    (c += U(t, r, u - 0.4, e + 44, 7.2, { bold: !0, lh: 1.45, fill: E.amberText, fit: h }).svg),
    (c += at(t, s.person, u, e + 61.2, 12.1, { maxWidth: h, minScale: 0.6, field: "name" }).svg),
    (c += me(
      U(
        t,
        [it.circle, s.phone, s.email].filter((d) => d.trim()).join("  |  "),
        u - 0.4,
        e + 78,
        6,
        { lh: 1.45, fit: h, min: 6, field: "kontakt" },
      ).svg,
    )),
    (c += ne(t, l - n - f, e, f, a)),
    (c += ue(
      U(t, Yt(t.kit, a).caption, l - n - f / 2, e + 88, 6, {
        bold: !0,
        lh: 1.45,
        fill: E.amberText,
        anchor: "middle",
        fit: f + 10,
        min: 6,
        minHard: !0,
      }).svg,
    )),
    c
  );
}
function Us(t, n) {
  const e = t.W,
    i = t.kit.contact,
    o = e - 2 * Xt;
  let r = `<rect x="${I(-n, 2)}" y="${I(-n, 2)}" width="${I(e + 2 * n, 2)}" height="${I(t.H + 2 * n, 2)}" fill="${E.white}"/>`;
  const a = e - 2 * we.x;
  ((r += Ne(
    we.x,
    we.y,
    a,
    we.h,
    we.r,
    `<g transform="translate(${we.x} ${we.y})">${wt(a, we.h, 0)}</g>`,
  )),
    (r += Eo(t).svg));
  const s = Zt(t);
  ((r += U(t, s.has ? s.address : "Adresse, PLZ Ort", e - Xt, 38, 5.6, {
    bold: !0,
    caps: !0,
    tracking: 0.16,
    fill: E.muted,
    anchor: "end",
    fit: 230,
    minScale: 0.75,
  }).svg),
    (r += Lt(t, Xt, 62, o, 232, 4)),
    (r += $e(t, Xt + 0.2, 310.2, 24.54, 1.073, 250, 2, ["Objekttitel in", "zwei Zeilen."]).svg));
  const l = s.has
    ? s.description
    : "Objektbeschreibung in zwei bis drei Sätzen: Lage, Aufteilung und Freiflächen. Dieser Text ist ein Platzhalter und wird vor dem Aushang ersetzt.";
  ((r += U(t, l, 308, 312, 7.4, { lh: 1.55, wrap: e - Xt - 308, maxLines: 4, fill: E.text }).svg),
    (r += ii(t, Xt, 368, o, 46)));
  const c = (o - 24) / 4,
    u = s.has
      ? s.more(4, 4).map((v) => [v.label, v.value].filter(Boolean).join(": "))
      : [1, 2, 3, 4].map((v) => `Ausstattungsmerkmal ${v}`);
  (u.length &&
    (r += st(t, s.has ? "Ausstattung" : "Ausstattung laut Planungsstand", Xt, 428, 5, E.muted)),
    u.forEach((v, k) => {
      const C = Xt + k * (c + 8);
      ((r += ko(C + 1.75, 445.25, 1.75)),
        (r += U(t, v, C + 8, 440, 7.2, {
          lh: 1.4,
          fit: c - 10,
          minScale: 0.75,
          fill: E.text,
        }).svg));
    }),
    (r += ae(t, Xt, 456.5, 6, o)),
    (r += ce(Xt, 470, o, E.ink, 0.6).replace("/>", ' stroke-opacity="0.14"/>')),
    (r += Co(
      t,
      Xt,
      486,
      "Besichtigung oder Exposé gewünscht?",
      "Ich sende Ihnen die Unterlagen und zeige Ihnen das Objekt gern persönlich vor Ort.",
      "Fragen Sie unverbindlich an.",
    )));
  const f = [
    s.has
      ? s.note
      : "Flächen laut Planung ..., Stand ..., Änderungen vorbehalten. Visualisierungen beispielhaft. Alle Angaben ohne Gewähr.",
    (i.legal ?? "").trim(),
  ]
    .filter(Boolean)
    .join(" ");
  r += U(t, f, Xt, 612, 4.6, { lh: 1.45, wrap: o, maxLines: 3, fill: E.light }).svg;
  const h = 664,
    d = t.H - 14,
    b = we.x,
    g = a / Cr;
  ((r += '<g data-role="abrissstreifen">'),
    (r += Ws(15, h - 5.5, 11, E.light)),
    (r += st(t, "Zum Mitnehmen: Streifen abreißen", 30, h - 11, 5, E.light)),
    (r += `<line x1="30" y1="${h}" x2="${I(b + a, 2)}" y2="${h}" stroke="${E.light}" stroke-width="0.75" stroke-dasharray="3 2"/>`));
  for (let v = 1; v < Cr; v++) {
    const k = b + v * g;
    r += `<line x1="${I(k, 2)}" y1="${h}" x2="${I(k, 2)}" y2="${I(d, 2)}" stroke="${E.light}" stroke-width="0.75" stroke-dasharray="3 2"/>`;
  }
  const y = js(t),
    m = s.has && s.title ? s.title : "Objekt kurz, z.B. Haus in ...";
  for (let v = 0; v < Cr; v++) {
    const k = b + v * g,
      C = k + (g - 44) / 2;
    r += Pt(C, h + 8, 44, 44, 3, E.white) + qn(y, C + 2.6, h + 10.6, 38.8, E.ink, "M").svg;
    const z = k + (g - 34) / 2,
      L = h + 60,
      A = d - L - 6;
    let O = U(t, m, 0, 0, 7.4, { bold: !0, fill: E.ink, fit: A, min: 6 }).svg;
    ((O += U(t, i.person, 0, 11.5, 7, { fill: E.text, fit: A, min: 6, field: "name" }).svg),
      (O += U(t, i.phone || i.email, 0, 22.5, 7, {
        fill: E.text,
        fit: A,
        min: 6,
        field: "kontakt",
      }).svg),
      (r += `<g transform="translate(${I(z, 2)} ${I(L + A, 2)}) rotate(-90)">${O}</g>`));
  }
  return ((r += "</g>"), r);
}
const Hs = {
    id: "unio-aushang-a4",
    file: "aushang-a4-abrisszettel",
    label: "Aushang A4 mit Abrisszetteln",
    description:
      "Für das Schwarze Brett im Supermarkt: Objekt oben, unten acht Streifen zum Abreißen mit QR-Code und deiner Nummer.",
    format: "A4",
    figma: ["450:7"],
    pages: [{ label: "Aushang", draw: Us }],
    logoCheck: (t) => Eo(t).logo.adjusted,
  },
  Zs = Bt(Hs),
  ot = 30,
  xt = (t) => t.W - 2 * ot,
  oi = (t, n) => {
    const e = (xt(t) - 16) / 3;
    return { x: ot + n * (e + 8), w: e };
  },
  ai = (t) => St(t, ot, 22, 24, 230, E.bg, 8.7);
function Gs(t, n, e, i, o, r) {
  const { x: a, w: s } = oi(t, n);
  let l = Ct(a, e, s, i, 10);
  return (
    (l += U(t, `0${n + 1}`, a + 11, e + 11, 5.6, {
      bold: !0,
      tracking: 0.08,
      fill: E.amberText,
    }).svg),
    (l += at(t, o, a + 11.3, e + 29.4, 9.55, { maxWidth: s - 22, minScale: 0.6 }).svg),
    r.length &&
      (l += U(
        t,
        r.join(`
`),
        a + 11,
        e + 44,
        6.2,
        { lh: 1.45, fit: s - 22, min: 6 },
      ).svg),
    l
  );
}
function Fo(t, n, e, i, o, r) {
  const a = Yt(t.kit, "objekt");
  let s = Ct(ot, n, xt(t), e, 10);
  const l = t.W - ot - 12 - r,
    c = n + (e - r) / 2;
  return (
    (s += at(t, fr(a.kind, i), ot + 14.3, n + e / 2 - 14.4, o, { maxWidth: l - ot - 30 }).svg),
    (s += ue(
      U(t, a.caption, ot + 14, n + e / 2 + 0.6, 6.5, {
        bold: !0,
        fill: E.amberText,
        fit: l - ot - 30,
        min: 6,
        minHard: !0,
      }).svg,
    )),
    (s += ne(t, l, c, r, "objekt")),
    s
  );
}
function Vs(t, n) {
  let e = wt(t.W, t.H, n);
  e += ai(t).svg;
  const i = Zt(t);
  return (
    (e += $e(t, ot + 0.5, 64.5, 23.68, 0.915, xt(t), 2, yn.title2).svg),
    (e += U(t, i.lead, ot, 114, 7, { lh: 1.5, wrap: 300, maxLines: 2 }).svg),
    (e += Lt(t, ot, 148, xt(t), 188, 10)),
    i.facts(3).forEach((o, r) => (e += Gs(t, r, 348, 76, o.value, [o.label]))),
    (e += ae(t, ot, 431, 5.6, xt(t))),
    (e += U(t, i.note, ot, 441, 4.8, { lh: 1.4, wrap: xt(t), maxLines: 1, fill: E.light }).svg),
    (e += Fo(t, 452, 66, "Pläne, Flächen und Vormerkung", 10.73, 46)),
    (e += Te(t, Sn(t), ot, 532, 6, xt(t))),
    (e += Ht(t, ot, 564.7, 4.8)),
    e
  );
}
function Ks(t, n, e, i, o) {
  const r = t.kit.contact,
    a = Math.min((o * 3) / 4, i * 0.5);
  let s = Pt(n, e, i, o, 10, E.card);
  s += Ne(n, e, i, o, 10, An(t, n + i - a, e, a, o, 0));
  const l = i - a - 32,
    c = 15,
    u = e + o - 52;
  return (
    (s += at(t, r.person, n + 16, u, c, { maxWidth: l, minScale: 0.6, field: "name" }).svg),
    r.role.trim() && (s += U(t, r.role, n + 16, u + 17, 6.6, { fit: l, min: 6 }).svg),
    (s += Re(t, n + 16, u + 31, 4.8, E.amberText)),
    s
  );
}
function qs(t, n) {
  let e = wt(t.W, t.H, n);
  ((e += ai(t).svg),
    (e += Kt(t, it.personal, ot + 0.75, 64.7, 25.83, 0.926, { dot: !0 }).svg),
    (e += Ks(t, ot, 152, xt(t), 196)));
  const i = 360;
  ((e += Ct(ot, i, xt(t), 150, 10)),
    (e += at(t, it.question, ot + 14.3, i + 15.6, 10.62, { maxWidth: 260 }).svg),
    (e += U(t, it.pitch, ot + 14, i + 32, 6.6, { lh: 1.5, wrap: 250 }).svg),
    (e += U(t, it.cta, ot + 14, i + 68, 6.8, { bold: !0, fill: E.amberText, fit: 250 }).svg));
  const o = 58;
  return (
    (e += ne(t, t.W - ot - 14 - o, i + 78, o)),
    (e += ue(
      U(t, Yt(t.kit).caption, ot + 14, i + 128, 6, {
        bold: !0,
        lh: 1.4,
        fill: E.amberText,
        fit: 240,
        min: 6,
        minHard: !0,
      }).svg,
    )),
    (e += Te(t, Sn(t), ot, 532, 6, xt(t))),
    (e += Ht(t, ot, 564.7, 4.8)),
    e
  );
}
const Io = (t) => St(t, ot + 18, 40, 22, 240, E.glass, 7.6);
function Ys(t, n) {
  let e = wt(t.W, t.H, n);
  e += Lt(t, ot, 28, xt(t), 262, 10);
  const i = Io(t);
  e += ze(ot + 10, 36, i.w + 16, 30, 8) + i.svg;
  const o = Zt(t),
    r = 218;
  return (
    (e += ze(ot + 14, r, xt(t) - 28, 58, 10)),
    (e += `<g data-role="kennzahlen">${Dn(t, o.facts(4), ot + 28, r + 14, xt(t) - 56, 4.6, 12, 14)}</g>`),
    (e += $e(t, ot + 0.4, 308.6, 19.47, 0.95, xt(t), 1, [yn.title1]).svg),
    (e += U(t, o.lead, ot, 334, 7, { lh: 1.5, wrap: xt(t), maxLines: 2 }).svg),
    [0, 1, 2].forEach((a) => {
      const s = oi(t, a);
      e += Lt(t, s.x, 368, s.w, 84, 10, `Objektfoto ${a + 2}`, a + 1);
    }),
    (e += ae(t, ot, 458.5, 5.4, xt(t))),
    (e += U(t, o.note, ot, 467, 4.8, { lh: 1.4, wrap: xt(t), maxLines: 1, fill: E.light }).svg),
    (e += Fo(t, 480, 48, "Pläne und Vormerkung", 10.3, 36)),
    (e += Te(t, Sn(t), ot, 538, 6, xt(t))),
    (e += Ht(t, ot, 564.7, 4.8)),
    e
  );
}
function Xs(t, n) {
  const e = t.kit.contact;
  let i = wt(t.W, t.H, n);
  const o = ot,
    r = 28,
    a = xt(t),
    s = 214,
    l = (s * 3) / 4;
  ((i += Pt(o, r, a, s, 10, E.card)),
    (i += Ne(o, r, a, s, 10, An(t, o + a - l, r, l, s, 0))),
    (i += xe(ot + 14, 43.95, 8.7).svg));
  const c = { x: ot + 14, y: 62, w: a - l - 28, h: 108, ground: E.card, align: "middle" };
  i += Me(t.kit, c).svg;
  const u = Math.min(Math.max(150, at(t, e.person, 0, 0, 10.08).w + 26), a - l - 28);
  ((i += ze(ot + 14, 190, u, 38, 10)),
    (i += at(t, e.person, ot + 26.3, 199.5, 10.08, {
      maxWidth: u - 26,
      minScale: 0.6,
      field: "name",
    }).svg),
    (i += Re(t, ot + 26, 213, 4.8, E.muted)),
    (i += Kt(t, it.personal, ot + 0.7, 260.6, 24.8, 0.926, { dot: !0 }).svg),
    it.pillars.forEach((h, d) => {
      const b = oi(t, d);
      ((i += Ct(b.x, 340, b.w, 50, 10)),
        (i += U(t, `0${d + 1}`, b.x + 11, 351, 5.6, {
          bold: !0,
          tracking: 0.08,
          fill: E.amberText,
        }).svg));
      const g = Qn(t, h, 9.56, b.w - 22);
      i += Kt(t, g, b.x + 11.3, 369.4, 9.56, 1.06).svg;
    }),
    (i += at(t, it.question, ot + 0.3, 405.4, 10.62, { maxWidth: 270 }).svg),
    (i += U(t, it.pitch, ot, 421, 6.6, { lh: 1.5, wrap: 260 }).svg),
    (i += U(t, it.cta, ot, 456, 6.8, { bold: !0, fill: E.amberText, fit: 270 }).svg));
  const f = t.W - ot - 78;
  return (
    (i += Ct(f, 404, 78, 96, 10)),
    (i += ne(t, f + 10, 414, 58)),
    (i += ue(
      U(t, Yt(t.kit).caption, f + 10, 477, 6, {
        bold: !0,
        lh: 1.3,
        fill: E.amberText,
        wrap: 58,
        maxLines: 2,
        min: 6,
        minHard: !0,
      }).svg,
    )),
    (i += Te(t, [e.phone, e.email, qt(e.web)], ot, 538, 6, xt(t))),
    (i += Ht(t, ot, 564.7, 4.8)),
    i
  );
}
const Qs = [
    { label: "Seite 1 · Objekt", draw: Vs },
    { label: "Seite 2 · Persönlich", draw: qs },
  ],
  Js = [
    { label: "Seite 1 · Objekt", draw: Ys },
    { label: "Seite 2 · Persönlich", draw: Xs },
  ],
  tl = {
    id: "unio-flyer-a5-v1",
    file: "flyer-a5-objekt-zuerst",
    label: "Flyer A5 · Objekt zuerst",
    description:
      "Postwurf-Flyer im UNIO-Design: vorne dein Objekt mit Flächen und QR-Code, hinten du persönlich.",
    format: "A5",
    figma: ["360:12", "360:53"],
    pages: Qs,
    logoCheck: (t) => ai(t).logo.adjusted,
  },
  el = {
    id: "unio-flyer-a5-v2",
    file: "flyer-a5-bild-zuerst",
    label: "Flyer A5 · Bild zuerst",
    description:
      "Postwurf-Flyer im UNIO-Design mit großem Objektbild, Flächentabelle und Bildreihe, hinten dein Porträt.",
    format: "A5",
    figma: ["360:82", "360:122"],
    pages: Js,
    logoCheck: (t) => Io(t).logo.adjusted,
  },
  nl = Bt(tl),
  rl = Bt(el),
  Ot = 32,
  Oo = (t) => St(t, Ot, 20, 26, 320, E.bg, 9.7);
function il(t, n, e, i, o, r, a, s) {
  const l = s ? E.text : E.light;
  let c = Pt(n, e, i, o, 10, s ? E.amber : E.card);
  return (
    (c += U(t, r, n + 10, e + 9, 4.8, {
      bold: !0,
      caps: !0,
      tracking: 0.16,
      fill: l,
      fit: i - 20,
      minScale: 0.7,
    }).svg),
    (c += at(t, a, n + 10.2, e + 26.6, 12.33, { maxWidth: i - 20, minScale: 0.6 }).svg),
    c
  );
}
function ol(t, n) {
  const e = t.W,
    i = t.kit.contact,
    o = e - 2 * Ot;
  let r = wt(e, t.H, n);
  r += Oo(t).svg;
  const a = Zt(t),
    s = Br(a.url || i.web);
  (s &&
    (r += U(t, s, e - Ot, 30, 6, {
      bold: !0,
      caps: !0,
      tracking: 0.16,
      fill: E.muted,
      anchor: "end",
      fit: 200,
      min: 6,
      minHard: !0,
    }).svg),
    (r += Lt(t, Ot, 52, o, 268, 12)),
    (r += ze(e - Ot - 12 - 72, 290, 72, 20, 10)),
    (r += U(t, "Mehr Bilder online", e - Ot - 12 - 36, 295, 5.4, {
      bold: !0,
      fill: E.ink,
      anchor: "middle",
    }).svg));
  const l = (o - 24) / 4;
  for (let y = 0; y < 4; y++) r += Lt(t, Ot + y * (l + 8), 328, l, 62, 8, `Bild ${y + 2}`, y + 1);
  ((r += Pt(Ot, 404, 23.52, 12.48, 6.24, E.amber, 'fill-opacity="0.18"')),
    (r += st(t, "Neu", Ot + 5.76, 406.6, 4.8, E.amberText)),
    (r += U(
      t,
      a.has ? `Zum Verkauf  |  ${a.address || "..."}` : "Zum Verkauf  |  Objektart  |  PLZ Ort",
      Ot + 31.52,
      406.6,
      4.8,
      { bold: !0, caps: !0, tracking: 0.16, fill: E.light, fit: 298, minScale: 0.8 },
    ).svg),
    (r += $e(t, Ot + 0.7, 425, 21.75, 1, 330, 1, ["Objekttitel in einer Zeile."]).svg));
  const c = a.has ? a.address || a.description : "Kurzbeschreibung des Objekts in einer Zeile";
  ((r += U(t, c, Ot, 452, 8.5, { lh: 1.45, wrap: 330, maxLines: 1 }).svg),
    a
      .facts(4)
      .forEach(
        (y, m) =>
          (r += il(
            t,
            Ot + (m % 2) * 169,
            474 + Math.floor(m / 2) * 54,
            161,
            48,
            y.label,
            y.value,
            m === 0,
          )),
      ),
    (r += at(t, "Über dieses Objekt", Ot + 0.3, 591.4, 10.2).svg));
  const f = a.has
    ? a.description || a.address
    : "Objektbeschreibung: Lage, Grundriss, Ausstattung und Besonderheiten in drei bis vier Sätzen. Dieser Text ist ein Platzhalter und wird vor der Veröffentlichung ersetzt.";
  if (
    ((r += U(t, f, Ot, 606, 7.4, { lh: 1.55, wrap: 330, maxLines: 6, fill: E.text }).svg), ri(t))
  ) {
    ((r += '<g data-role="energieausweis">'),
      (r += at(t, "Energieausweis", Ot + 0.2, 691.4, 10.53).svg));
    const y = Ia(t.kit.assets.object),
      m = 314 / 3;
    (y.forEach((v, k) => {
      const C = Ot + k * (m + 8);
      ((r += Ct(C, 706, m, 40, 10)),
        (r += U(t, v.text, C + 10, 713, 7.2, { bold: !0, fill: E.ink, lh: 1.45, fit: m - 20 }).svg),
        (r += st(t, v.sub, C + 10, 729, 4.4)));
    }),
      (r += "</g>"));
  }
  r += U(
    t,
    a.has
      ? a.note
      : "Flächen und Ausstattung laut Planung ..., Stand ..., Änderungen vorbehalten. Visualisierungen beispielhaft. Alle Angaben ohne Gewähr.",
    Ot,
    758,
    5,
    { lh: 1.4, wrap: 330, maxLines: 2, fill: E.light },
  ).svg;
  const h = e - Ot - 185;
  ((r += Ct(h, 404, 185, 170, 12)),
    (r += st(t, "Kaufpreis", h + 14, 418, 5)),
    (r += at(t, a.price, h + 14.4, 436.2 + 0.4, 18.84, { maxWidth: 157, minScale: 0.6 }).svg),
    a.has ||
      (r += U(t, "Zusatzinfo zum Preis, z.B. zzgl. Nebenkosten", h + 14, 456, 6.4, {
        lh: 1.45,
        fit: 157,
      }).svg),
    (r += Pt(h + 14, 476, 157, 22, 11, E.ink)),
    (r += U(t, "Exposé und Pläne anfordern", h + 14 + 78.5, 481.6, 6.8, {
      bold: !0,
      fill: E.white,
      anchor: "middle",
      lh: 1.3,
    }).svg),
    (r += ne(t, h + 14, 506, 56, "objekt")));
  const d = Yt(t.kit, "objekt"),
    b =
      d.kind === "objekt"
        ? `Scannen und alle Details auf ${d.caption}`
        : d.kind === "web"
          ? `Scannen und mehr auf ${d.caption}`
          : "Scannen und Kontakt direkt speichern";
  ((r += ue(
    U(t, b, h + 78, 512, 6.2, {
      lh: 1.45,
      wrap: 93,
      maxLines: 4,
      fill: E.text,
      min: 6,
      minHard: !0,
    }).svg,
  )),
    (r += Ct(h, 582, 185, 56, 12)),
    (r += En(t, h + 32, 610, 36.6, 1.7)),
    (r += at(t, i.person, h + 60.3, 597.3, 9.76, {
      maxWidth: 115,
      minScale: 0.6,
      field: "name",
    }).svg),
    (r += me(
      U(
        t,
        [it.circle, i.phone || i.email].filter(Boolean).join(`
`),
        h + 60,
        608,
        6,
        { lh: 1.4, fit: 115, min: 6, field: "kontakt" },
      ).svg,
    )),
    (r += Ct(h, 646, 185, 150, 12)),
    (r += at(t, "Ausstattung", h + 14.2, 659.1, 9.36).svg));
  const g = a.has
    ? a.facts(8)
    : [
        "Heizung",
        "Wärmeverteilung",
        "Strom",
        "Fenster",
        "Dach",
        "Raumhöhe",
        "Ebenen",
        "Planungsstand",
      ].map((y) => ({ label: y, value: "..." }));
  return (
    g.forEach((y, m) => {
      const v = 676 + m * 14.5;
      ((r += U(t, y.label, h + 14, v, 6, { lh: 1.45, fit: 70, min: 6 }).svg),
        (r += U(t, y.value, h + 171, v, 6, {
          lh: 1.45,
          bold: !0,
          fill: E.ink,
          anchor: "end",
          fit: 82,
          minScale: 0.7,
        }).svg),
        m < g.length - 1 && (r += ce(h + 14, v + 10.44, 157, E.rule)));
    }),
    (r += Ht(t, Ot, 809.8, 5)),
    r
  );
}
const al = {
    id: "unio-inserat-a4",
    file: "inserat-a4-detailseite",
    label: "Inserat A4 · Detailseite",
    description:
      "Inserat wie die Objektseite auf unio.at: Galerie, Kennzahlen, Beschreibung, Preis mit QR-Code und deine Kontaktkarte.",
    format: "A4",
    figma: ["380:11"],
    pages: [{ label: "Inserat", draw: ol }],
    logoCheck: (t) => Oo(t).logo.adjusted,
  },
  sl = Bt(al),
  pt = 40,
  zo = (t) => St(t, pt, 22, 26, 330, E.bg, 9.7);
function ll(t, n) {
  const e = t.W,
    i = e - 2 * pt;
  let o = wt(e, t.H, n);
  o += zo(t).svg;
  const r = Zt(t);
  ((o += U(t, r.has ? r.address : "Adresse, PLZ Ort", e - pt, 36, 5.6, {
    bold: !0,
    caps: !0,
    tracking: 0.16,
    fill: E.muted,
    anchor: "end",
    fit: 230,
    minScale: 0.75,
  }).svg),
    (o += Lt(t, pt, 60, i, 275, 6)),
    (o += st(t, r.has ? "Abb. 1" : "Abb. 1  Bildunterschrift", pt, 342, 4.6, E.light)),
    (o += $e(t, pt + 0.2, 362.4, 24.54, 1.073, 250, 2, ["Objekttitel in", "zwei Zeilen."]).svg));
  const a = r.has
    ? r.description
    : "Objektbeschreibung in zwei bis drei Sätzen: Lage, Aufteilung und Freiflächen. Dieser Text ist ein Platzhalter und wird vor der Veröffentlichung ersetzt.";
  ((o += U(t, a, 308, 366, 7.2, { lh: 1.55, wrap: e - pt - 308, maxLines: 5, fill: E.text }).svg),
    (o += ii(t, pt, 432, i, 46)),
    (o += ae(t, pt, 484, 5.6, i)),
    (o += U(
      t,
      r.has
        ? r.note
        : "Flächen laut Planung ..., Stand ..., Änderungen vorbehalten. Visualisierungen beispielhaft. Alle Angaben ohne Gewähr.",
      pt,
      493,
      4.6,
      { lh: 1.4, wrap: i, maxLines: 1, fill: E.light },
    ).svg));
  const s = (i - 16) / 3;
  return (
    ["Eingangsbereich", "Wohnküche", "Terrasse"].forEach((l, c) => {
      const u = pt + c * (s + 8);
      ((o += Lt(t, u, 508, s, 112, 6, `Objektfoto ${c + 2}`, c + 1)),
        (o += st(t, r.has ? `Abb. ${c + 2}` : `Abb. ${c + 2}  ${l}`, u, 626, 4.6, E.light)));
    }),
    (o += ce(pt, 645, i)),
    (o += Co(t, pt, 668, it.question, it.pitch, it.cta)),
    (o += Ht(t, pt, 803, 5)),
    o
  );
}
const cl = 470,
  xo = (t) => St(t, pt + 12, 34, 22, 280, E.glass, 8.5);
function ul(t, n) {
  const e = t.W,
    i = t.kit.contact,
    o = e - 2 * pt;
  let r = wt(e, t.H, n);
  r += An(t, -n, -n, e + 2 * n, cl + n, 0);
  const a = xo(t);
  r += ze(pt + 4, 29, a.w + 16, 32, 8) + a.svg;
  const s = Math.min(Math.max(190, at(t, i.person, 0, 0, 12).w + 30), 320);
  ((r += ze(pt, 386, s, 54, 10)),
    (r += at(t, i.person, pt + 15, 401, 12, {
      maxWidth: s - 30,
      minScale: 0.6,
      field: "name",
    }).svg),
    (r += Re(t, pt + 15, 420, 4.8, E.muted)));
  const l = `„${it.personal.join(" ")}“`,
    c = 20.5,
    u = 498,
    f = at(t, l, pt, u, c, { maxWidth: o }),
    h = l.slice(0, -2),
    d = u + f.size * 0.7;
  ((r += bt(t.f.head, h, { x: pt, y: d, size: f.size, fill: E.ink, tracking: -0.02 }).svg),
    (r += bt(t.f.head, ".“", {
      x: pt + f.w,
      y: d,
      size: f.size,
      fill: E.amber,
      anchor: "end",
      tracking: -0.02,
    }).svg),
    (r += Kt(
      t,
      ["Sie möchten Ihre Immobilie", "erfolgreich verkaufen?"],
      pt + 0.3,
      541,
      11.6,
      1.18,
      { maxWidth: 230 },
    ).svg),
    (r += U(t, it.pitch, 290, 540, 7.2, { lh: 1.5, wrap: e - pt - 290 }).svg),
    (r += U(t, it.cta, 290, 592, 7.2, { bold: !0, fill: E.amberText, fit: e - pt - 290 }).svg));
  const b = 628;
  ((r += Ct(pt, b, o, 150, 12)), (r += Lt(t, pt + 14, b + 14, 170, 122, 10)));
  const g = pt + 198,
    y = Zt(t),
    m = y.has
      ? y.address
        ? `Neu in ${y.address}: ${y.title}`
        : y.title
      : "Neu in ...: Objekttitel in zwei bis drei Zeilen.",
    v = ur(t, m, g, b + 17, 12.5, 1.15, 180, 3, { dot: !0, field: "titel" });
  r += v.svg;
  const k = y.has
    ? y.facts(3).map((L) => [L.label, L.value].filter(Boolean).join(": "))
    : [
        "Einheit 1: ... m² Grund, ... m² Nutzfläche",
        "Einheit 2: ... m² Grund, ... m² Nutzfläche",
        "Je ... m² Freiflächen",
      ];
  ((r += U(
    t,
    k.join(`
`),
    g,
    v.bottom + 8,
    6,
    { lh: 1.5, fill: E.text, fit: 200, min: 6 },
  ).svg),
    (r += ae(t, g, b + 108, 5.2, 205)),
    (r += U(
      t,
      y.has
        ? y.note
        : "Planungsstand ..., Änderungen vorbehalten. Visualisierungen beispielhaft. Alle Angaben ohne Gewähr.",
      g,
      b + 118,
      4.6,
      { lh: 1.4, wrap: 205, maxLines: 2, fill: E.light },
    ).svg));
  const C = 76,
    z = e - pt - 20 - C;
  return (
    (r += ne(t, z, b + 22, C, "objekt")),
    (r += ue(
      U(t, Yt(t.kit, "objekt").caption, z + C / 2, b + 108, 6, {
        bold: !0,
        fill: E.amberText,
        anchor: "middle",
        fit: C + 20,
        min: 6,
        minHard: !0,
      }).svg,
    )),
    (r += Te(t, [i.phone, i.email, qt(i.web)], pt, 788, 6.4, o, E.muted, "  |  ")),
    (r += Ht(t, pt, 803, 5)),
    r
  );
}
const fl = {
    id: "unio-magazin-a4",
    file: "inserat-a4-magazin",
    label: "Inserat A4 · Magazin",
    description:
      "Inserat im Magazin-Stil: große Bildstrecke mit Bildunterschriften, Kennzahlen und dein persönlicher Kontakt.",
    format: "A4",
    figma: ["381:10"],
    pages: [{ label: "Inserat", draw: ll }],
    logoCheck: (t) => zo(t).logo.adjusted,
  },
  dl = {
    id: "unio-gesicht-a4",
    file: "inserat-a4-gesicht",
    label: "Inserat A4 · Gesicht",
    description:
      "Inserat, das mit deinem Porträt beginnt: dein Gesicht groß, darunter dein Versprechen und das Objekt mit QR-Code.",
    format: "A4",
    figma: ["372:12"],
    pages: [{ label: "Inserat", draw: ul }],
    logoCheck: (t) => xo(t).logo.adjusted,
  },
  hl = Bt(fl),
  gl = Bt(dl),
  Vt = 120,
  Mo = (t) => St(t, Vt, 88, 130, 740, E.bg, 38.5);
function pl(t, n) {
  const e = t.W,
    i = t.kit.contact;
  let o = wt(e, t.H, n);
  ((o += Mo(t).svg),
    (o += An(t, e - Vt - 684, 112, 684, 1740, 34)),
    (o += Kt(
      t,
      ["Ihre", "Immobilie.", "Mein", "Auftrag.", "Ihr", "Erfolg."],
      Vt + 3.4,
      348,
      171.35,
      0.898,
      { dot: !0, maxWidth: 700 },
    ).svg),
    (o += Ct(Vt, 1600, 700, 252, 30)),
    (o += at(t, i.person, Vt + 45.9, 1660.9, 64.51, {
      maxWidth: 610,
      minScale: 0.55,
      field: "name",
    }).svg),
    (o += Re(t, Vt + 44, 1736, 20, E.muted)),
    (o += Te(t, [i.phone, i.email], Vt + 44, 1780, 24, 612, E.muted, "     ", 18)));
  const r = 1900;
  ((o += Ct(Vt, r, e - 2 * Vt, 330, 30)), (o += Lt(t, Vt + 26, r + 26, 520, 278, 22)));
  const a = Vt + 591.2,
    s = Zt(t);
  (s.has
    ? (o += ur(
        t,
        s.address ? `Neu in ${s.address}: ${s.title}` : s.title,
        a,
        r + 50.5,
        49.64,
        0.99,
        470,
        3,
        { dot: !0, field: "titel" },
      ).svg)
    : (o += Kt(t, ["Neu in ...:", "Objekttitel in", "drei Zeilen."], a, r + 50.5, 49.64, 0.99, {
        dot: !0,
        maxWidth: 470,
      }).svg),
    (o += ae(t, a - 1.2, r + 210, 17, 470)),
    (o += U(t, "Visualisierung beispielhaft. Alle Angaben ohne Gewähr.", a - 1.2, r + 238, 16, {
      fill: E.light,
      fit: 470,
    }).svg));
  const l = 230;
  return (
    (o += ne(t, e - Vt - 30 - l, r + 30, l, "objekt")),
    (o += ue(
      U(t, Yt(t.kit, "objekt").caption, e - Vt - 30 - l, r + 274, 19, {
        bold: !0,
        fill: E.amberText,
        fit: l,
        min: 17,
        minHard: !0,
      }).svg,
    )),
    (o += Ht(t, Vt, 2266, 16)),
    o
  );
}
const ml = {
    id: "unio-plakat-a1",
    file: "plakat-a1",
    label: "Plakat A1",
    description:
      "Großes Plakat für Schaufenster und Gemeindetafel: deine Botschaft, dein Porträt und ein Objekt mit QR-Code.",
    format: "A1",
    figma: ["361:25"],
    pages: [{ label: "Plakat", draw: pl }],
    logoCheck: (t) => Mo(t).logo.adjusted,
    pngWidth: 2384,
  },
  bl = Bt(ml),
  pr = "#F2EFE6",
  tr = ["Neugierig?", "Besichtige mich!"],
  Nn = (t, n, e = 1.26) => t + 0.694 * n - ((e - 1.26) / 2) * n - n;
function To(t) {
  const n = t.replace(/\s+/g, " ").trim(),
    e = n.lastIndexOf(" ");
  return e > 0
    ? `${n.slice(0, e)}
${n.slice(e + 1)}`
    : n;
}
const zi = (t, n, e) => t - ((e - 1.26) / 2) * n - n,
  xi = 636.7,
  cn = 19.5,
  Mi = 11,
  Ti = 6 * (25.4 / 72);
function wl(t, n, e) {
  var m, v;
  const i = t.kit.contact,
    o = t.f.body,
    r = i.email.trim(),
    a = qt(i.web),
    s = (k) => Math.min(cn, ...k.map((C) => ve(o, C, e, cn, 0, 0)));
  let l = [r, a].filter(Boolean),
    c = l.length ? s(l) : cn;
  if (c < Mi && r) {
    const k = [...Jn(t, r, Mi, e), a].filter(Boolean),
      C = s(k);
    C > c && ((l = k), (c = C));
  }
  ((c = Math.max(c, Ti)), c < cn * 0.85 && ((m = t.notes) == null || m.add("kontakt")));
  const u = 1.23;
  let f = "",
    h = xi;
  if (l.length) {
    const k = xi - (l.length - 1) * u * c;
    ((f += U(
      t,
      l.join(`
`),
      n,
      zi(k, c, u),
      c,
      { fit: e, min: Ti, minHard: !0, lh: u, fill: E.ink, field: "kontakt" },
    ).svg),
      (h = k - (43 - (cn - c) * 0.6)));
  }
  const d = 1.063,
    b = To(i.person),
    g = b.split(`
`),
    y = Math.min(31.5, ...g.map((k) => ve(o, k, e, 31.5, 0, 0)));
  return (
    y < 31.5 * 0.85 && ((v = t.notes) == null || v.add("name")),
    (f += U(t, b, n, zi(h - (g.length - 1) * d * y, y, d), y, {
      fit: e,
      lh: d,
      fill: E.ink,
      field: "name",
    }).svg),
    f
  );
}
const yl = [
    { cx: 0.49, cy: 0.428, rx: 0.538, ry: 0.65, rot: -13, color: "#F5DA7A", a: 1 },
    { cx: 0.464, cy: 0.901, rx: 0.737, ry: 0.465, rot: 12, color: "#F5D27F", a: 0.8 },
    { cx: 0.652, cy: 0.687, rx: 0.539, ry: 0.298, rot: 8, color: "#F2B21F", a: 1 },
    { cx: 0.425, cy: 0.61, rx: 0.409, ry: 0.181, rot: -5, color: "#F69F14", a: 1 },
    { cx: 0.454, cy: -0.053, rx: 1.5, ry: 0.163, rot: 2, color: "#F2F6F1", a: 0.72 },
    { cx: 0.203, cy: 0.787, rx: 0.164, ry: 0.461, rot: -84, color: "#EDBA08", a: 0.66 },
    { cx: 0.832, cy: 0.864, rx: 0.085, ry: 0.56, rot: 74, color: "#F0DC34", a: 0.32 },
  ],
  ye = 54,
  Ge = 374,
  Lo = (t) => St(t, ye, 30, 34, Ge, pr, 13);
function Li(t) {
  return (n, e) => {
    const { W: i, H: o } = n,
      r = n.kit.contact;
    let a = yo(-t * i - e, -e, 2 * i + 2 * e, o + 2 * e, yl, pr);
    ((a += Lo(n).svg),
      (a += at(n, tr[0], ye, 118.5, 45, { maxWidth: Ge, minScale: 0.6 }).svg),
      (a += at(n, tr[1], ye, 169.6, 45, { maxWidth: Ge, minScale: 0.6, bold: !0 }).svg));
    const s = r.phone.trim() || r.email.trim();
    ((a += U(n, s, ye + 2, Nn(230.3, 46), 46, {
      fit: Ge,
      minScale: 0.5,
      fill: E.ink,
      field: "kontakt",
    }).svg),
      (a += wl(n, ye, 308.3 - ye - 18)));
    const l = 119;
    ((a += ne(n, ye + Ge - l, 516.8, l, "objekt", !0)),
      (a += me(st(n, it.circleCaps, ye, 652, 8.5, E.text))));
    const c = Yt(n.kit, "objekt");
    return (
      (a += ue(
        st(
          n,
          fr(c.kind, "Objekt online ansehen", "Mehr Informationen online", "Kontakt speichern"),
          ye + Ge,
          652,
          8.5,
          E.text,
          "end",
        ),
      )),
      a
    );
  };
}
const vl = {
    id: "unio-faltschild",
    file: "faltschild-100x70",
    label: "Faltschild",
    description:
      "Aufsteller für Besichtigung und Open House: zwei Seiten 50 x 70 cm im UNIO-Design mit deiner Nummer und QR-Code.",
    format: "Faltschild",
    units: "mm",
    figma: ["Printfile 260716_Unio_Faltschild_v4-2"],
    pages: [
      { label: "Teil 1", draw: Li(0), file: "teil-1" },
      { label: "Teil 2", draw: Li(1), file: "teil-2" },
    ],
    spread: { file: "bogen-1000x700", label: "Bogen 100 x 70 cm" },
    bleed: 5,
    logoCheck: (t) => Lo(t).logo.adjusted,
    sizeLabel: "2 x 50 x 70 cm · druckfertig",
    pngWidth: 1500,
    note: "Für Aufsteller-Druckereien: entweder beide Teile einzeln oder den Bogen mit Falz in der Mitte bestellen.",
  },
  kl = [
    { cx: 0.444, cy: 0.362, rx: 0.479, ry: 0.669, rot: -6, color: "#F7CA45", a: 0.92 },
    { cx: 0.299, cy: 0.314, rx: 0.264, ry: 0.309, rot: 8, color: "#F89505", a: 0.97 },
    { cx: 0.689, cy: 0.581, rx: 0.348, ry: 0.296, rot: 2, color: "#F5A413", a: 1 },
    { cx: 0.322, cy: 0.809, rx: 0.303, ry: 0.223, rot: -6, color: "#F8BC12", a: 0.98 },
    { cx: 0.783, cy: 0.79, rx: 0.3, ry: 0.245, rot: -15, color: "#F2C222", a: 0.68 },
    { cx: 0.794, cy: 0.274, rx: 0.221, ry: 0.26, rot: 23, color: "#F5E294", a: 1 },
    { cx: 0.99, cy: 0.543, rx: 0.142, ry: 0.994, rot: -43, color: "#F1F1E2", a: 0.73 },
    { cx: 0.465, cy: 0.702, rx: 0.159, ry: 0.184, rot: -38, color: "#F99700", a: 0.66 },
  ],
  Ve = 190,
  Po = (t) => St(t, Ve, 140, 140, 1500, pr, 52);
function _l(t, n) {
  const { W: e, H: i } = t,
    o = t.kit.contact,
    r = e - 167;
  let a = yo(-n, -n, e + 2 * n, i + 2 * n, kl, pr, 2752);
  ((a += Po(t).svg),
    (a += at(t, tr[0], Ve + 6, 406, 293, { maxWidth: 2300, minScale: 0.6 }).svg),
    (a += at(t, tr[1], Ve + 6, 736, 293, { maxWidth: 2300, minScale: 0.6 }).svg));
  const s = o.phone.trim() || o.email.trim();
  ((a += U(t, s, Ve, Nn(1140, 182), 182, {
    fit: 1900,
    minScale: 0.5,
    fill: E.ink,
    field: "kontakt",
  }).svg),
    (a += me(st(t, it.circleCaps, r, 1290, 34, E.text, "end"))),
    (a += U(t, To(o.person), r, Nn(1392, 186, 0.92), 186, {
      fit: 2400,
      minScale: 0.5,
      lh: 0.92,
      fill: E.ink,
      field: "name",
      anchor: "end",
    }).svg));
  const l = [o.email.trim(), o.phone.trim(), qt(o.web)].filter(Boolean).join("  |  ");
  l &&
    (a += U(t, l, r, Nn(1850 - 0.694 * 48, 48), 48, {
      fit: 2900,
      minScale: 0.6,
      min: 6 * (25.4 / 72),
      fill: E.ink,
      field: "kontakt",
      anchor: "end",
    }).svg);
  const c = 170;
  a += ne(t, Ve + 2, 1857 - c, c, "objekt", !0);
  const u = Yt(t.kit, "objekt");
  return (
    (a += ue(
      st(
        t,
        fr(u.kind, "Objekt online ansehen", "Mehr Informationen online", "Kontakt speichern"),
        Ve + c + 50,
        1823,
        30,
        E.text,
      ),
    )),
    a
  );
}
const $l = {
    id: "unio-banner",
    file: "banner-400x200",
    label: "Banner 4 x 2 m",
    description:
      "Großes Banner für Bauzaun und Hausfassade: Besichtigung, deine Nummer aus der Entfernung lesbar, dazu Name, Kontakt und QR-Code.",
    format: "Banner",
    units: "mm",
    figma: ["Printfile 260716_UNIO BANNER_print4"],
    pages: [{ label: "Banner", draw: _l }],
    bleed: 5,
    logoCheck: (t) => Po(t).logo.adjusted,
    sizeLabel: "400 x 200 cm · druckfertig",
    pngWidth: 3e3,
    note: "Für Planen- bzw. Mesh-Druck. Ösen und Saum mit der Druckerei abstimmen.",
  },
  Sl = Bt(vl),
  Al = Bt($l),
  dt = 43,
  Rt = (t) => t.W - 2 * dt,
  mr = (t, n) => St(t, dt, 33, 32, n, E.bg, 12.2);
function Bo(t, n, e, i, o) {
  const a = Zt(t).facts(8);
  let s = Ct(n, e, i, o, 12);
  return (
    a.length <= 4
      ? (s += Dn(t, a, n + 16, e + o / 2 - 18, i - 32, 5.6, 12.94, 18, E.light))
      : ((s += Dn(t, a.slice(0, 4), n + 16, e + 10, i - 32, 5.6, 12.94, 15, E.light)),
        (s += ce(n + 16, e + o / 2, i - 32)),
        (s += Dn(t, a.slice(4, 8), n + 16, e + o / 2 + 8, i - 32, 5.6, 12.94, 15, E.light))),
    `<g data-role="kennzahlen">${s}</g>`
  );
}
function El(t, n, e, i, o) {
  let r = Ct(n, e, i, o, 12);
  return (
    (r += at(t, it.question, n + 16.3, e + 17.6, 11.63, { maxWidth: i - 32 }).svg),
    (r += U(t, it.pitch, n + 16, e + 35, 7.6, { lh: 1.5, wrap: i - 32 }).svg),
    (r += U(t, it.cta, n + 16, e + 74, 7.8, {
      bold: !0,
      fill: E.amberText,
      fit: i - 32,
      min: 6,
    }).svg),
    r
  );
}
function Cl(t, n) {
  const e = t.W;
  let i = wt(e, t.H, n);
  ((i += mr(t, 380).svg), (i += En(t, e - dt - 52, 82, 95.16, 4.42)));
  const o = Zt(t);
  ((i += $e(t, dt + 0.75, 99.6, 35, 0.915, e - dt - 104 - 20 - dt, 2, yn.title2).svg),
    (i += U(t, o.lead, dt, 176, 8.5, { lh: 1.5, wrap: 330, maxLines: 2 }).svg),
    (i += Lt(t, dt, 214, Rt(t), 238, 12)),
    (i += Bo(t, dt, 464, Rt(t), 90)),
    (i += ae(t, dt, 563, 6.4, Rt(t))),
    (i += U(t, o.note, dt, 574, 5.5, { lh: 1.4, wrap: Rt(t), maxLines: 1, fill: E.light }).svg),
    (i += at(t, it.personal.join(" "), dt + 0.5, 597, 18.19, { maxWidth: Rt(t) }).svg),
    (i += El(t, dt, 624, 330, 128)));
  const r = dt + 342,
    a = Rt(t) - 342;
  i += Ct(r, 624, a, 128, 12);
  const s = Yt(t.kit, "objekt"),
    l =
      s.kind === "objekt"
        ? ["Pläne, Flächen", "und Termin"]
        : s.kind === "web"
          ? ["Mehr", "Informationen"]
          : ["Kontakt", "speichern"];
  return (
    (i += Kt(t, l, r + 16.3, 642.4, 11.8, 1.24, { maxWidth: a - 32 }).svg),
    (i += ue(
      U(t, s.caption, r + 16, 672, 7, {
        bold: !0,
        fill: E.amberText,
        fit: a - 32,
        min: 6,
        minHard: !0,
      }).svg,
    )),
    (i += ne(t, e - dt - 16 - 62, 674, 62, "objekt")),
    (i += Te(t, Sn(t), dt, 764, 7.2, Rt(t))),
    (i += Ht(t, dt, 799.95, 5.5)),
    i
  );
}
function Fl(t, n) {
  const e = t.W;
  let i = wt(e, t.H, n);
  ((i += mr(t, 340).svg),
    (i += En(t, e - dt - 71, 111, 129.93, 6.03)),
    (i += Kt(t, it.personal, dt + 1.1, 96.1, 39.26, 0.926, { dot: !0 }).svg),
    (i += Kt(
      t,
      ["Sie möchten Ihre Immobilie", "erfolgreich verkaufen?"],
      dt + 0.3,
      234.4,
      14.14,
      1.14,
      { maxWidth: 225 },
    ).svg),
    (i += U(t, it.pitch, dt + 240, 234, 8.2, { lh: 1.5, wrap: 269 }).svg),
    (i += U(t, it.cta, dt + 240, 276, 8.4, { bold: !0, fill: E.amberText, fit: 269 }).svg),
    (i += ce(dt, 322, Rt(t))));
  const o = Zt(t),
    r = o.has
      ? [o.title, o.address].filter(Boolean).join(", ")
      : "Neu in ...: Objekttitel und Adresse in einer Zeile.";
  ((i += ur(t, r, dt + 0.4, 340.3, 14.15, 1.1, Rt(t), 1, { dot: !0, field: "titel" }).svg),
    (i += Lt(t, dt, 368, 333, 190, 12)),
    (i += Lt(t, dt + 345, 368, Rt(t) - 345, 89, 12, "Objektfoto 2", 1)),
    (i += Lt(t, dt + 345, 469, Rt(t) - 345, 89, 12, "Objektfoto 3", 2)),
    (i += Bo(t, dt, 570, Rt(t), 90)),
    (i += ae(t, dt, 664.5, 6.2, Rt(t))),
    (i += U(t, o.note, dt, 674.5, 5.5, { lh: 1.4, wrap: Rt(t), maxLines: 1, fill: E.light }).svg));
  const a = 686,
    s = Yt(t.kit, "objekt");
  return (
    (i += Ct(dt, a, Rt(t), 64, 12)),
    (i += at(t, fr(s.kind, "Pläne, Flächen und Ihr Bewertungstermin"), dt + 16.4, a + 17.4, 12.17, {
      maxWidth: Rt(t) - 110,
    }).svg),
    (i += ue(
      U(t, s.caption, dt + 16, a + 36, 7.5, {
        bold: !0,
        fill: E.amberText,
        fit: Rt(t) - 110,
        min: 6,
        minHard: !0,
      }).svg,
    )),
    (i += ne(t, e - dt - 14 - 50, a + 7, 50, "objekt")),
    (i += Te(t, Sn(t), dt, 764, 7.2, Rt(t))),
    (i += Ht(t, dt, 799.95, 5.5)),
    i
  );
}
const Il = {
    id: "unio-zeitung-a4-v1",
    file: "zeitung-a4-objekt-zuerst",
    label: "Zeitungsinserat A4 · Objekt zuerst",
    description:
      "Ganzseitiges Inserat für die Gemeindezeitung: Objekt groß, darunter du mit Porträt und QR-Code.",
    format: "A4",
    figma: ["357:10"],
    pages: [{ label: "Inserat", draw: Cl }],
    logoCheck: (t) => mr(t, 380).logo.adjusted,
  },
  Ol = {
    id: "unio-zeitung-a4-v2",
    file: "zeitung-a4-makler-zuerst",
    label: "Zeitungsinserat A4 · Makler zuerst",
    description:
      "Ganzseitiges Inserat für die Gemeindezeitung: zuerst du persönlich, darunter das Objekt mit Bildern und Flächen.",
    format: "A4",
    figma: ["357:59"],
    pages: [{ label: "Inserat", draw: Fl }],
    logoCheck: (t) => mr(t, 340).logo.adjusted,
  },
  zl = Bt(Il),
  xl = Bt(Ol);
function Cn(t, n = {}) {
  const e = [],
    i = (o) => (o ?? "").trim();
  return (
    i(t.phone) && e.push({ key: "T", value: i(t.phone) }),
    i(t.email) && e.push({ key: "E", value: i(t.email) }),
    i(t.web) && e.push({ key: "W", value: qt(t.web) }),
    n.address !== !1 &&
      (i(t.street) && e.push({ key: "", value: i(t.street) }),
      i(t.city) && e.push({ key: "", value: i(t.city) })),
    e
  );
}
const $t = 6,
  Nt = 16;
function Ml(t, n) {
  const { W: e, H: i } = t;
  let o = wt(e, i, n);
  o += Me(t.kit, {
    x: 26,
    y: 24,
    w: e - 52,
    h: 84,
    ground: E.bg,
    align: "middle",
    valign: "middle",
    prefer: "auto",
  }).svg;
  const r = i - Nt - 6;
  o += Re(t, Nt, r, $t, E.muted);
  const a = xe(e - Nt - 6.4 * 5.2544, r + 0.4, 6.4);
  return (
    (o += `<line x1="${I(e - Nt - a.w - 8, 2)}" y1="${I(r - 1, 2)}" x2="${I(e - Nt - a.w - 8, 2)}" y2="${I(r + 8, 2)}" stroke="${E.ink}" stroke-opacity="0.25" stroke-width="0.4"/>`),
    (o += a.svg),
    o
  );
}
function Tl(t, n) {
  const { W: e, H: i } = t,
    o = t.kit.contact;
  let r = wt(e, i, n, E.bg, 0.55);
  const a = 56,
    s = e - Nt - a,
    l = s - Nt - 10;
  ((r += at(t, o.person, Nt + 0.3, Nt, 11.5, { maxWidth: l, minScale: 0.62, field: "name" }).svg),
    o.role.trim() && (r += U(t, o.role, Nt, Nt + 13, $t + 0.5, { fit: l, minScale: 0.92 }).svg));
  let c = Nt + 33;
  const u = Cn(o).flatMap((h) =>
      Jn(t, h.value, $t, l - 9).map((d, b) => ({ key: b ? "" : h.key, value: d })),
    ),
    f = u.length > 5 ? 8.4 : 9.6;
  for (const h of u)
    (h.key && (r += U(t, h.key, Nt, c, $t, { bold: !0, fill: E.amberText }).svg),
      (r += U(t, h.value, Nt + 9, c, 6.6, {
        fill: E.text,
        fit: l - 9,
        min: $t,
        minScale: 0,
        field: "kontakt",
      }).svg),
      (c += f));
  return (
    (r += ne(t, s, Nt, a)),
    (r += st(
      t,
      Yt(t.kit).web ? "Website" : "Kontakt",
      s + a / 2,
      Nt + a + 4,
      $t,
      E.light,
      "middle",
    )),
    (r += Ht(t, Nt, i - Nt - 6, $t)),
    r
  );
}
const Rr = {
    id: "unio-business-card",
    file: "visitenkarte",
    label: "Visitenkarte",
    description: "Visitenkarte im UNIO-Design: vorn dein Logo groß, hinten Kontakt und QR-Code.",
    format: "Karte",
    figma: ["Stil der Figma-Vorlagen 344:6"],
    pages: [
      { label: "Vorderseite", draw: Ml },
      { label: "Rückseite", draw: Tl },
    ],
    logoCheck: (t) =>
      Me(t.kit, { x: 26, y: 24, w: t.W - 52, h: 84, ground: E.bg, align: "middle" }).adjusted,
    replaces: "business-card",
    sizeLabel: "85 x 55 mm · druckfertig",
    note: "Vorder- und Rückseite für Online-Druckereien.",
  },
  zt = (t) => t / (25.4 / 72);
function Ll(t, n) {
  const { W: e, H: i } = t,
    o = t.kit.contact,
    r = zt(25),
    a = zt(20);
  let s = wt(e, i, n, E.white, 0.45);
  s += St(t, r, zt(33) - 40, 40, zt(110), E.white, 9.5).svg;
  let l = [t.kit.brandName, vi(o)].filter(Boolean).join(" · ");
  Mt(t.f.body, l, $t) > zt(85) && (l = [o.person, vi(o)].filter(Boolean).join(" · "));
  const c = Mt(t.f.body, l, $t) > zt(85),
    u = U(
      t,
      l,
      r,
      zt(56.2) - (c ? $t * 1.3 : 0),
      $t,
      c ? { wrap: zt(85), maxLines: 2, lh: 1.3, fill: E.muted } : { fill: E.muted },
    );
  s += u.svg + ce(r, zt(60.6), Math.min(u.w, zt(85)), E.hair, 0.4);
  const f = zt(125),
    h = e - a - f;
  s += at(t, o.person, f, zt(50), 11, { maxWidth: h, minScale: 0.7, field: "name" }).svg;
  let d = zt(50) + 14;
  (o.role.trim() && ((s += U(t, o.role, f, d, 7.5, { fit: h, minScale: 0.85 }).svg), (d += 12)),
    (s += Re(t, f, d, $t, E.amberText)),
    (d += 14));
  const b = Cn(o).flatMap((L) =>
    Jn(t, L.value, $t, h - 11).map((A, O) => ({ key: O ? "" : L.key, value: A })),
  );
  for (const L of b)
    (L.key && (s += U(t, L.key, f, d, $t, { bold: !0, fill: E.amberText }).svg),
      (s += U(t, L.value, f + 11, d - 0.6, 7.5, {
        fill: E.text,
        fit: h - 11,
        min: $t,
        minScale: 0,
        field: "kontakt",
      }).svg),
      (d += 11.5));
  const g = (L, A) => ce(0, zt(L), zt(A), E.light, 0.5);
  s += g(105, 6) + g(210, 6) + g(148.5, 9);
  const y = zt(270);
  s += ce(r, y, e - r - a, E.hair, 0.5);
  const m = (e - r - a - 24) / 3,
    v = (L) => r + L * (m + 12),
    k = [t.kit.brandName, o.street, o.city].map((L) => (L ?? "").trim()).filter(Boolean);
  s += U(
    t,
    k.join(`
`),
    v(0),
    y + 7,
    6.5,
    { lh: 1.4, wrap: m, maxLines: 5 },
  ).svg;
  const C = [o.phone, o.email, qt(o.web)]
    .map((L) => L.trim())
    .filter(Boolean)
    .flatMap((L) => Jn(t, L, $t, m));
  s += U(
    t,
    C.join(`
`),
    v(1),
    y + 7,
    6.5,
    { lh: 1.4, fit: m, min: $t, minScale: 0, field: "kontakt" },
  ).svg;
  const z = (o.legal ?? "").trim();
  return (
    z &&
      (s += U(
        t,
        z.split(/\s*\|\s*/).join(`
`),
        v(2),
        y + 7,
        $t,
        { lh: 1.4, wrap: m, fill: E.muted },
      ).svg),
    (s += Ht(t, r, i - zt(8) - 6, $t)),
    s
  );
}
const Pl = {
  id: "unio-letterhead",
  file: "briefpapier",
  label: "Briefpapier A4",
  description:
    "Briefpapier im UNIO-Design nach DIN 5008, passt in Fensterkuverts. Mit deinem Logo und Kontakt.",
  format: "A4",
  figma: ["Stil der Figma-Vorlagen 344:6"],
  pages: [{ label: "Briefbogen", draw: Ll }],
  logoCheck: (t) => St(t, zt(25), zt(33) - 40, 40, zt(110), E.white, 9.5).logo.adjusted,
  replaces: "letterhead",
  note: "Für die Druckerei. Für den Bürodrucker die Vorschau-PNG oder die PDF ohne Beschnitt verwenden.",
};
function Bl(t, n) {
  const { W: e, H: i } = t,
    o = 43,
    r = e - 2 * o,
    a = t.kit.contact;
  let s = wt(e, i, n);
  ((s += St(t, o, 30, 34, 360, E.bg, 11).svg),
    (s += st(t, "Exposé", e - o, 42, 7, E.amberText, "end")),
    (s += Lt(t, o, 82, r, 330, 12)));
  const l = Zt(t);
  ((s += U(t, l.has ? l.address || "..." : "Objektart  |  Bezirk  |  PLZ Ort", o, 428, 6.5, {
    bold: !0,
    caps: !0,
    tracking: 0.16,
    fill: E.muted,
    fit: r,
    min: $t,
  }).svg),
    (s += $e(t, o + 0.5, 446, 32, 0.95, r, 2, ["Objekttitel in", "zwei Zeilen."]).svg),
    (s += U(
      t,
      l.has
        ? l.description
        : "Kurzbeschreibung in einer Zeile, zum Beispiel Lage, Ausblick, Besonderheit",
      o,
      512,
      9,
      { wrap: r, maxLines: 1 },
    ).svg),
    (s += ii(t, o, 536, r, 56, 1.43)),
    ri(t) &&
      ((s += Ct(o, 602, r, 40, 12)),
      (s += '<g data-role="energieausweis">'),
      (s += st(t, "Energieausweis  |  Pflichtangabe", o + 16, 611, $t, E.muted)),
      (s += U(t, Yr(t.kit.assets.object), o + 16, 622, 8.5, {
        bold: !0,
        fill: E.ink,
        fit: r - 32,
        min: $t,
      }).svg),
      (s += "</g>")));
  const c = 656;
  ((s += Ct(o, c, r, 112, 12)), (s += En(t, o + 52, c + 56, 72, 3)));
  const u = o + 106,
    f = 80,
    h = e - o - 16 - f - 16 - u;
  return (
    (s += at(t, a.person, u, c + 20, 14, { maxWidth: h, minScale: 0.6, field: "name" }).svg),
    (s += Re(t, u, c + 40, $t, E.amberText)),
    (s += U(
      t,
      [a.role, [a.phone, a.email].filter((d) => d.trim()).join("  |  "), qt(a.web)].filter((d) =>
        d.trim(),
      ).join(`
`),
      u,
      c + 54,
      7.5,
      { lh: 1.45, fit: h, minScale: 0.8 },
    ).svg),
    (s += ne(t, e - o - 16 - f, c + 16, f, "objekt")),
    (s += U(t, "Alle Angaben ohne Gewähr. Visualisierungen beispielhaft.", o, 778, $t, {
      fill: E.light,
    }).svg),
    (s += Ht(t, o, i - 36, $t)),
    s
  );
}
const Dl = {
  id: "unio-expose",
  file: "expose-deckblatt",
  label: "Exposé-Deckblatt A4",
  description:
    "Die erste Seite deines Exposés im UNIO-Design: Foto, Titel, Eckdaten, Energieausweis und dein Kontakt.",
  format: "A4",
  figma: ["380:11 (Stil Detailseite)"],
  pages: [{ label: "Deckblatt", draw: Bl }],
  logoCheck: (t) => St(t, 43, 30, 34, 360, E.bg, 11).logo.adjusted,
  replaces: "expose",
};
function Pi(t) {
  return (n, e) => {
    const { W: i, H: o } = n,
      r = n.kit.contact,
      a = 100;
    let s = wt(i, o, e);
    ((s += St(n, a, 80, 130, 900, E.bg, 34).svg),
      (s += at(n, t === "verkaufen" ? "Zu verkaufen." : "Zu vermieten.", a, 300, 200, {
        dot: !0,
        maxWidth: i - 2 * a - 440,
        minScale: 0.6,
      }).svg));
    const l = 300,
      c = i - a - l - 30;
    s += Ct(c - 30, 250, l + 60, l + 130, 30);
    const u = r.phone.trim(),
      f = u ? `tel:${ar(u)}` : pn(r.web) || `mailto:${r.email.trim()}`;
    ((s += `<g data-role="qr">${Pt(c, 280, l, l, 20, E.white)}${qn(f, c + 18, 298, l - 36, E.ink, "M").svg}</g>`),
      (s += st(
        n,
        u ? "Scannen und anrufen" : "Scannen",
        c + l / 2,
        280 + l + 30,
        22,
        E.amberText,
        "middle",
      )),
      (s += ae(n, a, 590, 30, i - 2 * a - 460)));
    const h = 700;
    ((s += Ct(a, h, i - 2 * a, 300, 34)),
      (s += st(
        n,
        t === "verkaufen" ? "Info und Besichtigung" : "Info und Termine",
        a + 50,
        h + 46,
        26,
        E.amberText,
      )));
    const d = u || r.email.trim();
    return (
      (s += at(n, d, a + 48, h + 96, 120, { maxWidth: i - 2 * a - 100, minScale: 0.45 }).svg),
      (s += me(
        U(
          n,
          [r.person, it.circle, qt(r.web)].filter((b) => b.trim()).join("   |   "),
          a + 50,
          h + 222,
          30,
          { fit: i - 2 * a - 100, minScale: 0.6, fill: E.muted },
        ).svg,
      )),
      (s += Ht(n, a, o - 80, 22)),
      s
    );
  };
}
const Nl = {
    id: "unio-sign",
    file: "schild-60x40",
    label: "Verkaufsschild",
    description:
      "Schild im UNIO-Design für Fenster, Balkon und Bauzaun. Deine Nummer ist auch aus der Entfernung lesbar.",
    format: "Schild",
    figma: ["Stil Plakat 361:25"],
    pages: [
      { label: "Zu verkaufen", draw: Pi("verkaufen"), file: "zu-verkaufen" },
      { label: "Zu vermieten", draw: Pi("vermieten"), file: "zu-vermieten" },
    ],
    logoCheck: (t) => St(t, 100, 80, 130, 900, E.bg, 34).logo.adjusted,
    replaces: "sign",
    sizeLabel: "60 x 40 cm · druckfertig",
    pngWidth: 3e3,
  },
  Rl = Bt(Rr),
  jl = Bt(Pl),
  Wl = Bt(Dl),
  Ul = Bt(Nl),
  lt = 64;
function br(t, n) {
  let e = St(t, lt, 50, 64, 640, E.bg, 21).svg;
  return (n && (e += st(t, n, t.W - lt, 74, 20, E.amberText, "end")), e);
}
const Hl = (t) => St(t, lt, 50, 64, 640, E.bg, 21);
function Zl(t, n, e) {
  return `<g data-role="unio-circle">${st(t, it.circleCaps, t.W - lt, n, e, E.muted, "end")}</g>`;
}
function wr(t) {
  const n = t.kit.contact,
    e = t.H - 112;
  return (
    U(t, [n.person, qt(n.web)].filter((i) => i.trim()).join("   |   "), lt, e, 24, {
      fill: E.muted,
      fit: t.W * 0.55,
      minScale: 0.6,
    }).svg +
    Zl(t, e + 4, 18) +
    Ht(t, lt, t.H - 60, 16)
  );
}
function Do(t) {
  var i;
  const n = Zt(t);
  if (!n.has)
    return [
      ["Wohnfläche", "... m²"],
      ["Zimmer", "..."],
      ["Kaufpreis", "€ ..."],
    ];
  const e = n.facts(3).map((o) => [o.label, o.value]);
  return (i = t.kit.assets.object) != null && i.price
    ? [...e.slice(0, 2), ["Kaufpreis", n.price]]
    : e;
}
function No(t, n, e) {
  const i = t.W - 2 * lt,
    o = 20,
    r = (i - o * (e.length - 1)) / e.length;
  let a = "";
  return (
    e.forEach(([s, l], c) => {
      const u = lt + c * (r + o);
      ((a += Pt(u, n, r, 128, 26, c === 0 ? E.amber : E.card)),
        (a += U(t, s, u + 26, n + 24, 17, {
          bold: !0,
          caps: !0,
          tracking: 0.16,
          fill: c === 0 ? E.text : E.light,
          fit: r - 52,
          minScale: 0.7,
        }).svg),
        (a += at(t, l, u + 26, n + 70, 36, { maxWidth: r - 52, minScale: 0.6 }).svg));
    }),
    a
  );
}
function Gl(t, n) {
  const e = t.W - 2 * lt;
  let i = wt(t.W, t.H, n);
  return (
    (i += br(t, "Neu im Angebot")),
    (i += Lt(t, lt, 150, e, 600, 26)),
    (i += $e(t, lt + 2, 800, 64, 0.95, e, 2, ["Objekttitel in", "zwei Zeilen."]).svg),
    (i += No(t, 960, Do(t))),
    (i += ae(t, lt, 1112, 19, e)),
    (i += wr(t)),
    i
  );
}
function Vl(t, n) {
  const e = t.W - 2 * lt;
  let i = wt(t.W, t.H, n);
  ((i += br(t, "Verkauft")),
    (i += Lt(t, lt, 150, e, 760, 26)),
    (i += ze(lt + 40, 660, e - 80, 210, 26)),
    (i += at(t, "Verkauft.", lt + 80, 702, 120, { dot: !0, maxWidth: e - 160 }).svg));
  const o = Zt(t);
  return (
    (i += U(
      t,
      o.has ? [o.title, o.address].filter(Boolean).join(", ") : "Objektart in Ort, ... m²",
      lt + 82,
      818,
      28,
      { fill: E.text, fit: e - 160, minScale: 0.6 },
    ).svg),
    (i += at(t, "Danke für Ihr Vertrauen.", lt + 2, 966, 52, { maxWidth: e }).svg),
    (i += U(
      t,
      "Sie überlegen, Ihre Immobilie zu verkaufen? Ich freue mich auf Ihre Nachricht.",
      lt,
      1040,
      28,
      { lh: 1.45, wrap: e, fill: E.muted },
    ).svg),
    (i += wr(t)),
    i
  );
}
function Kl(t, n) {
  const e = t.W - 2 * lt;
  let i = wt(t.W, t.H, n);
  return (
    (i += br(t, "Besichtigung")),
    (i += Lt(t, lt, 150, e, 530, 26)),
    (i += at(t, "Besichtigung.", lt + 2, 732, 96, { dot: !0, maxWidth: e }).svg),
    (i += Ct(lt, 862, e, 230, 26)),
    (i += st(t, "Termin", lt + 36, 896, 18, E.amberText)),
    (i += at(t, "Tag, ... um ... Uhr", lt + 36, 936, 54, { maxWidth: e - 72 }).svg),
    (i += U(t, Zt(t).address || "Adresse, PLZ Ort", lt + 36, 1012, 28, {
      fill: E.text,
      fit: e - 72,
      minScale: 0.6,
    }).svg),
    (i += U(t, `Anmeldung: ${t.kit.contact.phone || t.kit.contact.email}`, lt + 36, 1052, 24, {
      bold: !0,
      fill: E.amberText,
      fit: e - 72,
    }).svg),
    (i += ae(t, lt, 1126, 19, e)),
    (i += wr(t)),
    i
  );
}
function ql(t, n) {
  const e = t.kit.contact;
  let i = wt(t.W, t.H, n);
  i += br(t, "Über mich");
  const o = 520;
  i += An(t, lt, 150, o, (o * 4) / 3, 26);
  const r = lt + o + 44,
    a = t.W - lt - r;
  ((i += Kt(t, it.personal, r, 170, 54, 0.95, { dot: !0, maxWidth: a }).svg),
    (i += at(t, e.person, r, 380, 34, { maxWidth: a, minScale: 0.55, field: "name" }).svg),
    e.role.trim() && (i += U(t, e.role, r, 428, 24, { fit: a, fill: E.muted }).svg),
    (i += `<g data-role="unio-circle">${st(t, it.circleCaps, r, 472, 16, E.amberText)}</g>`),
    (i += U(t, it.pitch, r, 530, 24, { lh: 1.5, wrap: a, fill: E.text }).svg));
  const s = 890,
    l = t.W - 2 * lt,
    c = (l - 40) / 3;
  return (
    it.pillars.forEach((u, f) => {
      const h = lt + f * (c + 20);
      ((i += Ct(h, s, c, 150, 26)),
        (i += U(t, `0${f + 1}`, h + 28, s + 28, 18, {
          bold: !0,
          tracking: 0.08,
          fill: E.amberText,
        }).svg),
        (i += Kt(t, Qn(t, u, 30, c - 56), h + 28, s + 70, 30, 1.08).svg));
    }),
    (i += U(t, it.cta, lt, 1090, 26, { bold: !0, fill: E.amberText, fit: l }).svg),
    (i += wr(t)),
    i
  );
}
function Yl(t, n) {
  const e = t.kit.contact,
    i = t.W - 2 * lt;
  let o = wt(t.W, t.H, n);
  return (
    (o += St(t, lt, 220, 64, 640, E.bg, 21).svg),
    (o += st(t, "Neu im Angebot", t.W - lt, 244, 20, E.amberText, "end")),
    (o += Lt(t, lt, 330, i, 760, 30)),
    (o += $e(t, lt + 2, 1140, 72, 0.95, i, 2, ["Objekttitel in", "zwei Zeilen."]).svg),
    (o += No(t, 1320, Do(t))),
    (o += ae(t, lt, 1476, 20, i)),
    (o += ze(lt, 1530, i, 120, 26)),
    (o += at(t, e.person, lt + 36, 1562, 34, {
      maxWidth: i * 0.6,
      minScale: 0.55,
      field: "name",
    }).svg),
    (o += `<g data-role="unio-circle">${st(t, it.circleCaps, lt + 36, 1608, 16, E.muted)}</g>`),
    (o += U(t, e.phone || e.email, t.W - lt - 36, 1572, 28, {
      bold: !0,
      fill: E.amberText,
      anchor: "end",
      fit: i * 0.38,
    }).svg),
    (o += Ht(t, lt, 1720, 18)),
    o
  );
}
function Xl(t, n) {
  const { W: e, H: i } = t,
    o = t.kit.contact;
  let r = wt(e, i, n);
  const a = 560;
  return (
    (r += St(t, a, 48, 64, e - a - 64, E.bg, 20).svg),
    (r += at(t, it.personal.join(" "), a, 160, 50, { dot: !0, maxWidth: e - a - 64 }).svg),
    (r += U(t, [o.person, o.role].filter((s) => s.trim()).join("   |   "), a, 240, 24, {
      fill: E.muted,
      fit: e - a - 64,
    }).svg),
    (r += `<g data-role="unio-circle">${st(t, it.circleCaps, a, 286, 16, E.amberText)}</g>`),
    (r += st(t, it.claim, e - 64, i - 48, 14, E.light, "end")),
    r
  );
}
function Ql(t, n) {
  const { W: e, H: i } = t,
    o = t.kit.contact;
  let r = wt(e, i, n);
  const a = 260,
    s = e - 2 * a;
  return (
    (r += St(t, a, 110, 80, s, E.bg, 24).svg),
    (r += Kt(t, ["Ihre Immobilie. Mein Auftrag.", "Ihr Erfolg."], a, 250, 62, 0.98, {
      dot: !0,
      maxWidth: s,
    }).svg),
    (r += U(t, [o.person, o.phone, qt(o.web)].filter((l) => l.trim()).join("   |   "), a, 420, 26, {
      fill: E.muted,
      fit: s,
    }).svg),
    (r += `<g data-role="unio-circle">${st(t, it.circleCaps, a, 470, 17, E.amberText)}</g>`),
    (r += st(t, it.claim, e - a, 470, 17, E.light, "end")),
    r
  );
}
function Jl(t, n) {
  var s;
  const e = t.W,
    i = (s = t.kit.assets.contact) == null ? void 0 : s.photo;
  let o = wt(e, e, n);
  const r = e * 0.88,
    a = (e - r) / 2;
  return (
    i
      ? (o += Ne(
          a,
          a,
          r,
          r,
          r / 2,
          `<g data-role="portraet" transform="translate(${a} ${a})">${ho(i, r, E.photo)}</g>`,
        ))
      : ((o += Pt(a, a, r, r, r / 2, E.card)),
        (o += `<g data-role="makler-logo">${Gt(t.kit.mark("color"), e * 0.3, e * 0.3, e * 0.4, e * 0.4).svg}</g>`)),
    o
  );
}
const Ln = {
    format: "Post",
    figma: ["Stil Flyer 360:12, Social-Serie ui_kits/social"],
    logoCheck: (t) => Hl(t).logo.adjusted,
  },
  Rn = [
    {
      ...Ln,
      id: "unio-social-new",
      file: "instagram_neu-im-angebot",
      label: "Instagram-Post „Neu im Angebot“",
      description:
        "Für neue Objekte im UNIO-Design: Foto, Titel und Eckdaten einsetzen und posten.",
      pages: [{ label: "Post", draw: Gl }],
      replaces: "social-new",
    },
    {
      ...Ln,
      id: "unio-social-sold",
      file: "instagram_verkauft",
      label: "Instagram-Post „Verkauft“",
      description: "Zeig im UNIO-Design, was du vermittelt hast.",
      pages: [{ label: "Post", draw: Vl }],
      replaces: "social-sold",
    },
    {
      ...Ln,
      id: "unio-social-viewing",
      file: "instagram_besichtigung",
      label: "Instagram-Post „Besichtigung“",
      description: "Lade im UNIO-Design zu einem Besichtigungstermin ein.",
      pages: [{ label: "Post", draw: Kl }],
      replaces: "social-viewing",
    },
    {
      ...Ln,
      id: "unio-social-intro",
      file: "instagram_ueber-mich",
      label: "Instagram-Post „Über mich“",
      description: "Stell dich im UNIO-Design vor, mit deinem Porträt im Format 3:4.",
      pages: [{ label: "Post", draw: ql }],
      replaces: "social-intro",
    },
    {
      id: "unio-social-story",
      file: "instagram_story",
      label: "Instagram-Story",
      description:
        "Story im UNIO-Design für neue Objekte, mit Platz für Profilzeile und Antwortfeld.",
      format: "Story",
      figma: ["Stil Flyer 360:82"],
      pages: [{ label: "Story", draw: Yl }],
      replaces: "social-story",
      logoCheck: (t) => St(t, lt, 220, 64, 640, E.bg, 21).logo.adjusted,
    },
    {
      id: "unio-social-linkedin",
      file: "linkedin-banner",
      label: "LinkedIn-Banner",
      description:
        "Titelbild für LinkedIn im UNIO-Design. Links unten bleibt Platz für dein Profilbild.",
      format: "LinkedIn",
      figma: ["Stil Zeitung 357:59"],
      pages: [{ label: "Banner", draw: Xl }],
      replaces: "social-linkedin",
      logoCheck: (t) => St(t, 560, 48, 64, t.W - 624, E.bg, 20).logo.adjusted,
    },
    {
      id: "unio-social-facebook",
      file: "facebook-titelbild",
      label: "Facebook-Titelbild",
      description: "Titelbild für Facebook im UNIO-Design, Inhalt in der sicheren Mitte.",
      format: "Facebook",
      figma: ["Stil Zeitung 357:59"],
      pages: [{ label: "Titelbild", draw: Ql }],
      replaces: "social-facebook",
      logoCheck: (t) => St(t, 260, 110, 80, t.W - 520, E.bg, 24).logo.adjusted,
    },
    {
      id: "unio-social-profile",
      file: "profilbild_portraet",
      label: "Profilbild",
      description:
        "Dein Porträt als Profilbild für Instagram und LinkedIn, auf UNIO-Verlauf. Ohne Foto mit Initialen als Platzhalter.",
      format: "Quadrat",
      figma: ["Makler-Zuschnitt 3:4, Kreis um die Nasenspitze"],
      pages: [{ label: "Profilbild", draw: Jl }],
      replaces: "social-profile",
      dir: jt.icons,
      note: "Für Instagram, LinkedIn und WhatsApp. Die Plattform schneidet rund zu.",
      stamp: !1,
    },
  ],
  tc = Rn.map(Bt);
function ec(t) {
  let n = [1, 0, 0, 1, 0, 0];
  if (!t) return n;
  const e = (r, a) => [
      r[0] * a[0] + r[2] * a[1],
      r[1] * a[0] + r[3] * a[1],
      r[0] * a[2] + r[2] * a[3],
      r[1] * a[2] + r[3] * a[3],
      r[0] * a[4] + r[2] * a[5] + r[4],
      r[1] * a[4] + r[3] * a[5] + r[5],
    ],
    i = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  let o;
  for (; (o = i.exec(t)); ) {
    const r = o[2]
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    let a = [1, 0, 0, 1, 0, 0];
    if (o[1] === "matrix") a = [r[0], r[1], r[2], r[3], r[4], r[5]];
    else if (o[1] === "translate") a = [1, 0, 0, 1, r[0] || 0, r[1] || 0];
    else if (o[1] === "scale") a = [r[0], 0, 0, r[1] ?? r[0], 0, 0];
    else if (o[1] === "rotate") {
      const s = ((r[0] || 0) * Math.PI) / 180,
        l = Math.cos(s),
        c = Math.sin(s),
        u = r[1] || 0,
        f = r[2] || 0;
      a = e(e([1, 0, 0, 1, u, f], [l, c, -c, l, 0, 0]), [1, 0, 0, 1, -u, -f]);
    } else
      o[1] === "skewX"
        ? (a = [1, 0, Math.tan(((r[0] || 0) * Math.PI) / 180), 1, 0, 0])
        : o[1] === "skewY" && (a = [1, Math.tan(((r[0] || 0) * Math.PI) / 180), 0, 1, 0, 0]);
    n = e(n, a);
  }
  return n;
}
function nc(t, n) {
  const e = (o) => t.getAttribute(o),
    i = (o, r) => (e(o) !== null ? Number(e(o)) : r);
  return {
    fill: e("fill") ?? n.fill,
    stroke: e("stroke") ?? n.stroke,
    sw: i("stroke-width", n.sw),
    op: n.op * i("opacity", 1),
    fop: e("fill-opacity") !== null ? i("fill-opacity", 1) : n.fop,
    sop: e("stroke-opacity") !== null ? i("stroke-opacity", 1) : n.sop,
    cap: e("stroke-linecap") ?? n.cap,
    join: e("stroke-linejoin") ?? n.join,
    rule: e("fill-rule") === "evenodd" ? "evenodd" : n.rule,
  };
}
function rc(t) {
  const n = (i) => Number(t.getAttribute(i) ?? 0),
    e = new Path2D();
  switch (t.localName) {
    case "path":
      return new Path2D(t.getAttribute("d") ?? "");
    case "rect": {
      const i = n("rx");
      return (
        i > 0 && "roundRect" in e
          ? e.roundRect(n("x"), n("y"), n("width"), n("height"), i)
          : e.rect(n("x"), n("y"), n("width"), n("height")),
        e
      );
    }
    case "circle":
      return (e.arc(n("cx"), n("cy"), n("r"), 0, Math.PI * 2), e);
    case "ellipse":
      return (e.ellipse(n("cx"), n("cy"), n("rx"), n("ry"), 0, 0, Math.PI * 2), e);
    case "line":
      return (e.moveTo(n("x1"), n("y1")), e.lineTo(n("x2"), n("y2")), e);
    case "polygon":
    case "polyline": {
      const i = (t.getAttribute("points") ?? "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      for (let o = 0; o + 1 < i.length; o += 2) (o ? e.lineTo : e.moveTo).call(e, i[o], i[o + 1]);
      return (t.localName === "polygon" && e.closePath(), e);
    }
    default:
      return null;
  }
}
function Ro(t, n, e) {
  const i = n.localName;
  if (i === "defs" || i === "title" || i === "clipPath" || i === "linearGradient") return;
  const o = nc(n, e);
  t.save();
  const r = ec(n.getAttribute("transform"));
  if ((t.transform(r[0], r[1], r[2], r[3], r[4], r[5]), i === "g" || i === "svg"))
    for (const a of Array.from(n.children)) Ro(t, a, o);
  else {
    const a = rc(n);
    a &&
      (o.fill !== "none" &&
        i !== "line" &&
        i !== "polyline" &&
        ((t.globalAlpha = o.op * o.fop), (t.fillStyle = o.fill), t.fill(a, o.rule)),
      o.stroke !== "none" &&
        o.sw > 0 &&
        ((t.globalAlpha = o.op * o.sop),
        (t.strokeStyle = o.stroke),
        (t.lineWidth = o.sw),
        (t.lineCap = o.cap),
        (t.lineJoin = o.join),
        t.stroke(a)));
  }
  t.restore();
}
function Bi(t, n, e, i) {
  if (typeof document > "u" || typeof DOMParser > "u" || typeof Path2D > "u") return null;
  const o = new DOMParser().parseFromString(t, "image/svg+xml").documentElement;
  if (o.localName !== "svg") return null;
  const r = (o.getAttribute("viewBox") ?? `0 0 ${n} ${e}`).split(/[\s,]+/).map(Number),
    a = document.createElement("canvas");
  ((a.width = Math.round(n)), (a.height = Math.round(e)));
  const s = a.getContext("2d");
  if (!s) return null;
  ((s.fillStyle = i), s.fillRect(0, 0, a.width, a.height));
  const l = Math.min(a.width / r[2], a.height / r[3]);
  (s.translate((a.width - r[2] * l) / 2 - r[0] * l, (a.height - r[3] * l) / 2 - r[1] * l),
    s.scale(l, l));
  const c = {
    fill: "#000",
    stroke: "none",
    sw: 1,
    op: 1,
    fop: 1,
    sop: 1,
    cap: "butt",
    join: "miter",
    rule: "nonzero",
  };
  for (const u of Array.from(o.children)) Ro(s, u, c);
  return a.toDataURL("image/png");
}
const Di = "signatur-logo.png",
  Ni = "signatur-unio-wortmarke.png",
  jr = 11,
  he = Aa,
  Ri = "Outfit, 'Helvetica Neue', Helvetica, Arial, sans-serif";
function Fn(t) {
  const n = t.logo("color", "full"),
    e = n.width / n.height,
    i = Math.min(170, 60 * e);
  return { w: Math.round(i), h: Math.round(i / e) };
}
function si(t) {
  const n = t.logo("color", "full");
  return io(n, { padding: Math.max(n.width, n.height) * 0.04 });
}
function li() {
  const n = xe(0, 0, 40);
  return ee(n.w, 40, n.svg, { title: "UNIO" });
}
const yr = () => ({ w: Math.round(jr * ws), h: jr });
function ci(t, n, e, i = !0) {
  const o = t.contact,
    { w: r, h: a } = Fn(t),
    s = yr(),
    l = (C, z, L = "") => `<td${L} style="${C}">${z}</td>`,
    c = (C) => `<tr>${C}</tr>`,
    u = `font-family:${Ri};color:${E.ink};`,
    f = (C, z) => `<a href="${he(C)}" style="color:${E.ink};text-decoration:none;">${he(z)}</a>`,
    h = [];
  (h.push(
    c(
      l(
        `${u}font-size:16px;line-height:21px;letter-spacing:-0.2px;padding:0;`,
        he(o.person.trim()),
      ),
    ),
  ),
    o.role.trim() &&
      h.push(
        c(
          l(
            `${u}font-size:12px;line-height:17px;color:${E.muted};padding:0 0 8px 0;`,
            he(o.role.trim()),
          ),
        ),
      ));
  for (const C of Cn(o, { address: !1 })) {
    const z =
      C.key === "T"
        ? f(`tel:${ar(C.value)}`, C.value)
        : C.key === "E"
          ? f(`mailto:${C.value}`, C.value)
          : f(pn(o.web), qt(o.web));
    h.push(
      c(
        l(
          `${u}font-size:13px;line-height:19px;padding:0;`,
          `<span style="color:${E.amberText};font-size:10px;letter-spacing:1.5px;font-weight:bold;">${C.key}</span>&nbsp;&nbsp;${z}`,
        ),
      ),
    );
  }
  const d = [o.street.trim(), o.city.trim()].filter(Boolean).join(", ");
  d && h.push(c(l(`${u}font-size:13px;line-height:19px;color:${E.muted};padding:0;`, he(d))));
  const b = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${h.join("")}</table>`,
    g = `<img src="${he(n)}" width="${r}" height="${a}" alt="${he(t.brandName)}" style="display:block;border:0;outline:none;width:${r}px;height:${a}px;">`,
    y = `<img src="${he(e)}" width="${s.w}" height="${s.h}" alt="UNIO" style="display:inline-block;vertical-align:middle;border:0;outline:none;width:${s.w}px;height:${s.h}px;">`,
    m = `<span style="font-family:${Ri};font-size:10px;line-height:14px;letter-spacing:1.6px;color:${E.muted};vertical-align:middle;">PARTNER IM UNIO CIRCLE</span>`,
    v = (o.legal ?? "").trim(),
    k =
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${u}">` +
      c(
        l("padding:0 18px 0 0;vertical-align:middle;border-right:1px solid #D8D3CA;", g) +
          l("padding:0 0 0 18px;vertical-align:middle;", b),
      ) +
      c(
        l(
          "padding:12px 0 0 0;border-top:1px solid #E3DFD6;",
          `${m}&nbsp;&nbsp;&nbsp;${y}`,
          ' colspan="2"',
        ).replace("padding:12px 0 0 0;", "padding:12px 0 0 0;"),
      ) +
      (v
        ? c(
            l(
              `${u}font-size:10px;line-height:14px;color:${E.muted};padding:8px 0 0 0;`,
              he(v),
              ' colspan="2"',
            ),
          )
        : "") +
      "</table>";
  return i
    ? `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>E-Mail-Signatur ${he(t.brandName)} (UNIO)</title>
</head>
<body style="margin:0;padding:24px;background:#FFFFFF;">
${k}
</body>
</html>
`
    : k;
}
function ic(t) {
  const n = t.contact,
    e = [n.person.trim()];
  (n.role.trim() && e.push(n.role.trim()), e.push(""));
  for (const o of Cn(n, { address: !1 })) e.push(`${o.key}  ${o.value}`);
  const i = [n.street.trim(), n.city.trim()].filter(Boolean).join(", ");
  return (
    i && e.push(i),
    e.push(""),
    e.push(it.circle),
    (n.legal ?? "").trim() && e.push((n.legal ?? "").trim()),
    e.join(`\r
`) +
      `\r
`
  );
}
const ji = (t) => {
  const n = new TextEncoder().encode(t);
  let e = "";
  for (const i of n) e += String.fromCharCode(i);
  return typeof btoa == "function" ? btoa(e) : Buffer.from(e, "binary").toString("base64");
};
function oc(t) {
  const n = Et(t),
    { w: e, h: i } = Fn(n),
    o = yr(),
    r = si(n),
    a = li(),
    s = Bi(r, e * 2, i * 2, "#FFFFFF") ?? `data:image/svg+xml;base64,${ji(r)}`,
    l = Bi(a, o.w * 2, o.h * 2, "#FFFFFF") ?? `data:image/svg+xml;base64,${ji(a)}`;
  return ci(n, s, l, !1);
}
async function ac(t) {
  const n = Et(t),
    { w: e, h: i } = Fn(n),
    o = yr(),
    r = await _i(await _e(si(n), e * 2, i * 2, "#FFFFFF")),
    a = await _i(await _e(li(), o.w * 2, o.h * 2, "#FFFFFF"));
  return ci(n, r, a, !1);
}
function Wi(t) {
  const i = wo();
  if (!i)
    return ee(1200, 520, `<g data-role="unio-laedt">${wt(1200, 520, 0, E.white, 0.4)}</g>`, {
      title: "E-Mail-Signatur (UNIO)",
    });
  const o = { f: i },
    r = t.contact;
  let a = wt(1200, 520, 0, E.white, 0.4);
  a += U(o, "Freundliche Grüße", 60, 52, 26, { fill: E.muted }).svg;
  const s = 2,
    { w: l, h: c } = Fn(t),
    u = 130,
    f = 250,
    h = Me(t, {
      x: 60,
      y: u + (f - c * s) / 2,
      w: l * s,
      h: c * s,
      ground: E.white,
      prefer: "auto",
    });
  a += h.svg;
  const d = 60 + l * s + 36;
  a += `<line x1="${d}" y1="${u + 10}" x2="${d}" y2="${u + f - 10}" stroke="#D8D3CA" stroke-width="2"/>`;
  const b = d + 36;
  let g = u + 14;
  ((a += at(o, r.person, b, g, 30, { maxWidth: 1200 - b - 60, minScale: 0.6 }).svg),
    (g += 46),
    r.role.trim() && ((a += U(o, r.role, b, g, 22, { fill: E.muted }).svg), (g += 40)));
  for (const C of Cn(r, { address: !1 }))
    ((a += U(o, C.key, b, g + 3, 18, { bold: !0, fill: E.amberText, tracking: 0.1 }).svg),
      (a += U(o, C.value, b + 34, g, 24, { fill: E.ink, fit: 1200 - b - 94 }).svg),
      (g += 36));
  const y = u + f + 24;
  a += `<line x1="60" y1="${y}" x2="1140" y2="${y}" stroke="#E3DFD6" stroke-width="2"/>`;
  const m = st(o, it.circleCaps, 60, y + 24, 18, E.muted);
  a += me(m);
  const v = U(o, it.circleCaps, 0, 0, 18, { bold: !0, caps: !0, tracking: 0.16 }).w;
  a += xe(60 + v + 24, y + 26, jr * s).svg;
  const k = (r.legal ?? "").trim();
  return (
    k && (a += U(o, k, 60, y + 70, 18, { fill: E.muted, fit: 1080 }).svg),
    t.sample && (a += $o(o, 1160, 30, 16)),
    ee(1200, 520, a, { title: "E-Mail-Signatur (UNIO)" })
  );
}
function Ui(t) {
  const { w: n, h: e } = Fn(t),
    i = yr(),
    o = So;
  return [
    {
      path: `${o}/email-signatur.html`,
      mime: "text/html;charset=utf-8",
      note: "E-Mail-Signatur im UNIO-Design. Im Browser öffnen, alles markieren, kopieren und im E-Mail-Programm einfügen. Die beiden Bilder müssen im selben Ordner liegen.",
      make: async () => ci(t, Di, Ni),
    },
    {
      path: `${o}/${Di}`,
      mime: "image/png",
      note: "Dein Logo für die Signatur (doppelte Auflösung).",
      make: () => _e(si(t), n * 2, e * 2, "#FFFFFF"),
    },
    {
      path: `${o}/${Ni}`,
      mime: "image/png",
      note: "UNIO-Wortmarke für die Signatur (doppelte Auflösung, nicht verändern).",
      make: () => _e(li(), i.w * 2, i.h * 2, "#FFFFFF"),
    },
    {
      path: `${o}/email-signatur.txt`,
      mime: "text/plain;charset=utf-8",
      note: "Signatur als reiner Text mit Vermerk, für Programme ohne Formatierung.",
      make: async () => ic(t),
    },
    {
      path: `${o}/${t.slug}_kontakt.vcf`,
      mime: "text/vcard;charset=utf-8",
      note: "Deine digitale Visitenkarte zum Anhängen an E-Mails.",
      make: async () =>
        so(t.contact, t.brandName) +
        `\r
`,
    },
  ];
}
const sc = {
    id: "unio-email-signature",
    group: "digital",
    variant: "unio",
    replaces: "email-signature",
    label: "E-Mail-Signatur",
    description:
      "Deine Signatur im UNIO-Design mit Logo, Kontakt und dem Vermerk „Partner im UNIO CIRCLE“.",
    sizeLabel: "HTML · Text",
    formats: ["html", "png", "txt"],
    needsContact: !0,
    preview: (t) => Wi(Et(t)),
    pages: (t) => [{ label: "Signatur", svg: Wi(Et(t)) }],
    plan: (t) => Ui(Et(t)),
    exportFiles: async (t) => {
      ($n(t), await cr());
      const n = [];
      for (const e of Ui(Et(t))) n.push({ path: e.path, mime: e.mime, data: await e.make() });
      return n;
    },
    logoAdjusted: () => null,
  },
  lc = {
    "01_logo": "Dein Logo in allen Varianten. Für fast alles reicht PNG.",
    "02_online":
      "Für E-Mail, Instagram, LinkedIn und Facebook. In der richtigen Größe für jede Plattform.",
    "03_drucksachen":
      "Druckfertige PDF-Dateien. Gib sie einfach deiner Druckerei, der Rand für den Zuschnitt ist schon drin.",
    "04_brand-guide":
      "Alle Regeln deiner Marke auf einen Blick. Gib ihn weiter, wenn jemand für dich gestaltet.",
    schriften: "Lizenzen und Download-Links der Schriften in deinem Logo.",
  },
  vr = (t) => `${t.weight}${t.style === "italic" ? " kursiv" : ""}`;
function ui(t) {
  var o, r, a, s;
  const n = [
    ["Name im Logo", t.name.font],
    ["Zusatz im Logo", t.suffix.font],
    ["Slogan", t.tagline.font],
    ["Fließtext", t.body],
  ];
  ((r = (o = t.typo) == null ? void 0 : o.split) != null &&
    r.font &&
    n.push(["Namensteil (Schnittmischung)", t.typo.split.font]),
    (a = t.typo) != null && a.ampersand && n.push(["&-Zeichen", t.typo.ampersand]),
    ((s = t.symbol) == null ? void 0 : s.kind) === "monogram" &&
      n.push(["Initialen im Symbol", t.symbol.font]));
  const e = [],
    i = (l, c) => {
      l.cuts.some((u) => Be(u) === Be(c)) || l.cuts.push(c);
    };
  for (const [l, c] of n) {
    const u = Oe(c.key);
    let f = e.find((h) => h.family === u.family);
    if (
      (f
        ? f.role.includes(l) || (f.role += `, ${l}`)
        : ((f = { key: u.key, role: l, family: u.family, cuts: [], weights: [], pkg: u.pkg }),
          e.push(f)),
      i(f, c),
      l === "Fließtext")
    )
      for (const h of u.weights) i(f, { key: u.key, weight: h });
  }
  for (const l of e)
    (l.cuts.sort(
      (c, u) =>
        c.weight - u.weight || (c.style === "italic" ? 1 : 0) - (u.style === "italic" ? 1 : 0),
    ),
      (l.weights = [...new Set(l.cuts.map((c) => c.weight))]));
  return e;
}
function fi(t, n) {
  return {
    fontsource: `https://fontsource.org/fonts/${t}`,
    google: `https://fonts.google.com/specimen/${n.replace(/ /g, "+")}`,
  };
}
const cc = (t, n) => (t.length >= n ? t + "  " : t + " ".repeat(n - t.length));
function uc(t) {
  var s, l, c;
  const n = (t.date ?? new Date()).toLocaleDateString("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    e = [];
  (e.push(`DEIN BRAND KIT: ${t.brandName}`),
    e.push(`Erstellt mit dem UNIO Brand Studio am ${n}.`),
    e.push(""),
    e.push(
      "Hier ist alles, was du für deinen Auftritt brauchst. Jede Datei ist unten kurz erklärt.",
    ),
    e.push(""),
    e.push("SO FINDEST DU DICH ZURECHT"),
    e.push(""));
  for (const [u, f] of Object.entries(lc))
    t.plans.some((h) => h.path.startsWith(u)) && e.push(`${cc(u + "/", 18)}${f}`);
  (e.push(""),
    e.push("WELCHES FORMAT BRAUCHE ICH?"),
    e.push(""),
    e.push("PNG   Für Word, PowerPoint, Social Media und WhatsApp."),
    e.push("SVG   Für deine Website und für Grafiker, bleibt in jeder Größe scharf."),
    e.push("PDF   Für die Druckerei."),
    e.push("ICO   Das kleine Symbol im Browser-Tab (für deine Website)."),
    e.push("HTML  Deine E-Mail-Signatur zum Einfügen ins E-Mail-Programm."),
    e.push("TXT   Reiner Text, z.B. Signatur für Programme ohne Formatierung."),
    e.push(""),
    t.skippedContact &&
      (e.push("HINWEIS"),
      e.push(""),
      e.push(
        "Visitenkarte, Briefpapier, Verkaufsschild und E-Mail-Signatur fehlen in diesem Paket,",
      ),
      e.push(
        "weil noch keine Kontaktdaten eingetragen waren. Trag sie im Brand Studio ein und lade",
      ),
      e.push("das Brand Kit noch einmal herunter."),
      e.push("")));
  const i =
    ((s = t.design) == null ? void 0 : s.eigen) ?? t.plans.some((u) => /_eigen[._-]/.test(u.path));
  if (
    ((((l = t.design) == null ? void 0 : l.unio) ?? !1) &&
      (e.push("UNIO-DESIGN"),
      e.push(""),
      e.push(
        "Deine Drucksachen, Social-Vorlagen und die E-Mail-Signatur sind im UNIO-Design mit deinem Logo.",
      ),
      e.push(
        'Der Vermerk "Partner im UNIO CIRCLE" ist fester Bestandteil und bleibt immer stehen.',
      ),
      e.push(
        "Objektdaten (Titel, Adresse, Flächen, Preis, Energieausweis) und Objektfotos kommen aus deinen Objektangaben;",
      ),
      e.push('wo nichts eingetragen ist, stehen Platzhalter wie "Objekttitel" oder "... m²".'),
      e.push("Ersetze sie vor dem Druck, zum Beispiel mit deinem Grafiker oder deiner Druckerei."),
      e.push(
        "Die Angaben zum Energieausweis (HWB, EEB und Effizienzklasse, bei älteren Ausweisen ohne EEB HWB, fGEE und Klasse) sind in Objektwerbung Pflicht.",
      ),
      e.push(
        "Fehlen sie in deinen Objektangaben, lassen wir den Block in den Druckdateien weg: trag sie ein und lade neu herunter.",
      ),
      e.push(
        "Überschriften: Power Grotesk, die Hausschrift von UNIO (lizenziert, nicht frei verfügbar).",
      ),
      e.push(
        "Fließtext: Outfit (SIL Open Font License 1.1). Beide sind in den Dateien als Formen enthalten.",
      ),
      e.push("")),
    i &&
      (e.push("EIGENES DESIGN"),
      e.push(""),
      e.push(
        'Dateien mit "_eigen" im Namen sind in deinem eigenen Design (deine Farben und Schriften, ohne UNIO-Vermerk).',
      ),
      e.push(
        "Standard ist das UNIO-Design, seine Dateien tragen keinen Zusatz. Logo und Icons sind in beiden Fassungen gleich.",
      ),
      e.push("")),
    (c = t.hints) != null && c.length)
  ) {
    (e.push("HINWEISE VOR DEM DRUCK"), e.push(""));
    for (const u of t.hints) e.push(`- ${u}`);
    e.push("");
  }
  e.push("ALLE DATEIEN");
  let r = "";
  const a = (u) => u.path.split("/")[0];
  for (const u of [...t.plans].sort((f, h) => a(f).localeCompare(a(h)))) {
    const f = u.path.split("/")[0];
    (f !== r && ((r = f), e.push(""), e.push(`${f}/`)),
      e.push(`  ${u.path.slice(f.length + 1)}`),
      e.push(`      ${u.note}`));
  }
  (e.push(""),
    e.push("SCHRIFTEN"),
    e.push(""),
    e.push(
      "In allen Dateien ist die Schrift bereits in Formen umgewandelt. Du musst nichts installieren,",
    ),
    e.push(
      "damit alles richtig aussieht. Wenn du oder dein Grafiker neue Texte setzen wollt, braucht ihr",
    ),
    e.push("diese Schriften. Alle sind kostenlos und dürfen auch geschäftlich genutzt werden"),
    e.push("(SIL Open Font License 1.1):"),
    e.push(""));
  for (const u of ui(t.concept)) {
    const f = fi(u.pkg, u.family);
    (e.push(`${u.family} (Schnitt ${u.cuts.map(vr).join(", ")})`),
      e.push(`      Verwendet für: ${u.role}`),
      e.push(`      Download: ${f.fontsource}`),
      e.push(`      oder: ${f.google}`));
  }
  return (
    e.push(""),
    e.push("Lizenztext und Copyright je Schrift: Ordner schriften/ (OFL.txt, schriften.txt)."),
    e.push(""),
    e.push("TIPPS ZUM DRUCK"),
    e.push(""),
    e.push(
      "- Die druckfertigen Dateien haben 3 mm Rand für den Zuschnitt. Gib sie der Druckerei unverändert.",
    ),
    e.push(
      "- Die Visitenkarte gibt es zweimal: ohne Schnittmarken (für Online-Druckereien) und mit",
    ),
    e.push("  Schnittmarken (für die Druckerei vor Ort)."),
    e.push(
      "- Die Farben sind für den Bildschirm angelegt. Die Druckerei passt sie für den Druck an.",
    ),
    e.push("  Lass dir vor großen Auflagen einen Probedruck zeigen."),
    e.push('- Platzhalter wie "Objekttitel" oder "Objektfoto hier" ersetzt du vor der Nutzung.'),
    e.push(""),
    e.push(
      "Rechtliche Angaben (Impressum-Zeile) übernimmt das Studio so, wie du sie eingetragen hast.",
    ),
    e.push("Im Zweifel hilft dir die Wirtschaftskammer."),
    e.push(""),
    e.join(`\r
`)
  );
}
const oe = 297,
  Jt = 210,
  ht = 18,
  Wr = [
    "Logo und Schutzraum",
    "Mindestgröße",
    "Logo-Varianten",
    "Fehlanwendungen",
    "Farben",
    "Typografie",
    "Anwendung",
  ];
function We(t, n, e, i, o, r, a) {
  let s = De(0, 0, oe, Jt, t.paper);
  return (
    (s += _t(t.bodyBold, `${String(n).padStart(2, "0")}  ·  ${i}`, {
      x: ht,
      y: ht,
      size: 2.3,
      fill: t.accentOnPaper,
      tracking: 0.22,
    }).svg),
    (s += _t(t.body, t.brandName, {
      x: oe - ht,
      y: ht,
      size: 2.3,
      fill: t.muted,
      anchor: "end",
      tracking: 0.16,
    }).svg),
    (s += bt(t.head, t.headText(o), {
      x: ht,
      y: ht + 20,
      size: ve(t.head, t.headText(o), 150, 12),
      fill: t.p.ink,
    }).svg),
    r &&
      (s += en(t.body, r, {
        x: ht,
        y: ht + 38,
        size: 3.3,
        fill: t.muted,
        maxWidth: 82,
        leading: 5.1,
      }).svg),
    (s += Gn(ht, oe - ht, Jt - 13, t.hairline, 0.2)),
    (s += _t(t.body, "Markenhandbuch", {
      x: ht,
      y: Jt - 8,
      size: 2.12,
      fill: t.muted,
      tracking: 0.16,
    }).svg),
    (s += _t(t.body, `${String(n).padStart(2, "0")} / ${String(e).padStart(2, "0")}`, {
      x: oe - ht,
      y: Jt - 8,
      size: 2.12,
      fill: t.muted,
      anchor: "end",
      tracking: 0.16,
    }).svg),
    s + a
  );
}
const kr = { x: 112, y: 50, w: oe - 112 - ht, h: Jt - 50 - 21 };
function Hi(t) {
  let n = De(0, 0, oe, Jt, t.dark);
  const e = t.logo("reverse", "full"),
    i = Gt(e, ht + 6, 52, 150, 74, "start", "middle");
  n += i.svg;
  const o = t.tagline("reverse");
  (o.width && (n += Gt(o, ht + 6, i.y + i.h + 10, 150, 4.2, "start", "top").svg),
    (n += _t(t.bodyBold, "Markenhandbuch", {
      x: ht + 6,
      y: Jt - 34,
      size: 3,
      fill: t.accentOnDark,
      tracking: 0.24,
    }).svg));
  const r = new Date().toLocaleDateString("de-AT", { month: "long", year: "numeric" });
  n += bt(t.body, `Version 1.0  ·  ${r}`, {
    x: ht + 6,
    y: Jt - 27,
    size: 3.2,
    fill: t.onDark,
    opacity: 0.75,
  }).svg;
  const a = 205;
  return (
    (n += Vn(a - 10, 52, 52 + Wr.length * 9, t.onDark, 0.15, 'stroke-opacity="0.35"')),
    Wr.forEach((s, l) => {
      const c = 56 + l * 9;
      ((n += _t(t.body, String(l + 2).padStart(2, "0"), {
        x: a,
        y: c,
        size: 2.3,
        fill: t.accentOnDark,
        tracking: 0.1,
      }).svg),
        (n += bt(t.body, s, { x: a + 9, y: c, size: 3.3, fill: t.onDark }).svg));
    }),
    (n += _t(t.body, "Erstellt mit dem UNIO Brand Studio", {
      x: oe - ht,
      y: Jt - 27,
      size: 2.12,
      fill: t.onDark,
      anchor: "end",
      opacity: 0.6,
      tracking: 0.16,
    }).svg),
    n
  );
}
function fc(t, n, e, i = We) {
  const o = t.lockup("color", "horizontal"),
    r = ei(o, "horizontal"),
    a = kr;
  let s = `<path d="${Tt(a.x, a.y, a.w, a.h, 3)}" fill="${t.p.ink}" fill-opacity="0.035"/>`;
  const l = o.width + 2 * r,
    c = o.height + 2 * r,
    u = Math.min((a.w - 40) / l, (a.h - 30) / c),
    f = a.x + (a.w - l * u) / 2,
    h = a.y + (a.h - c * u) / 2,
    d = r * u,
    b = (m, v, k, C) =>
      `<rect x="${I(m, 3)}" y="${I(v, 3)}" width="${I(k, 3)}" height="${I(C, 3)}" fill="${t.accentOnPaper}" fill-opacity="0.10"/>`;
  ((s +=
    b(f, h, l * u, d) +
    b(f, h + c * u - d, l * u, d) +
    b(f, h + d, d, c * u - 2 * d) +
    b(f + l * u - d, h + d, d, c * u - 2 * d)),
    (s += `<rect x="${I(f, 3)}" y="${I(h, 3)}" width="${I(l * u, 3)}" height="${I(c * u, 3)}" fill="none" stroke="${t.accentOnPaper}" stroke-width="0.25" stroke-dasharray="1.2 0.9"/>`),
    (s += `<rect x="${I(f + d, 3)}" y="${I(h + d, 3)}" width="${I(o.width * u, 3)}" height="${I(o.height * u, 3)}" fill="none" stroke="${t.muted}" stroke-width="0.15"/>`),
    (s += gn(o, f + d, h + d, u)));
  const g = (m, v) => {
    const k = Math.min(d * 0.32, 3.2);
    return (
      Kr(m, v, k, t.paper, `stroke="${t.accentOnPaper}" stroke-width="0.2"`) +
      bt(t.bodyBold, "x", {
        x: m,
        y: v + or(t.bodyBold, k * 1.1) / 2,
        size: k * 1.1,
        fill: t.accentOnPaper,
        anchor: "middle",
      }).svg
    );
  };
  return (
    (s +=
      g(f + d / 2, h + (c * u) / 2) +
      g(f + l * u - d / 2, h + (c * u) / 2) +
      g(f + (l * u) / 2, h + d / 2) +
      g(f + (l * u) / 2, h + c * u - d / 2)),
    (s += en(
      t.body,
      "x = eine Versalhöhe, also die Höhe eines Großbuchstabens im Namen. Diesen Abstand halten Texte, Bildkanten und andere Logos rundum mindestens ein.",
      { x: ht, y: 120, size: 3, fill: t.p.ink, maxWidth: 78, leading: 4.6 },
    ).svg),
    (s += _t(t.body, "Die Dateien im Brand Kit enthalten den Schutzraum bereits als Rand.", {
      x: ht,
      y: 150,
      size: 2.12,
      fill: t.muted,
      tracking: 0.08,
    }).svg),
    i(
      t,
      n,
      e,
      "Logo",
      "Logo und Schutzraum",
      "Dein Logo braucht Luft. Der Schutzraum rund um das Logo bleibt frei, damit es immer klar und hochwertig wirkt.",
      s,
    )
  );
}
function dc(t, n, e, i = We) {
  const o = kr,
    r = [
      { lk: "horizontal", t: "Liegend" },
      { lk: "stacked", t: "Gestapelt" },
      { lk: "monogram", t: "Monogramm" },
    ],
    a = o.w / 3;
  let s = "";
  return (
    r.forEach((l, c) => {
      const u = o.x + c * a + 1.5,
        f = a - 3;
      s += `<path d="${Tt(u, o.y, f, o.h, 2.5)}" fill="${t.p.ink}" fill-opacity="0.035"/>`;
      const h = t.lockup("color", l.lk),
        d = Za[l.lk],
        b = d.mm,
        g = (b * h.height) / h.width,
        y = u + (f - b) / 2,
        m = o.y + 34 - g / 2;
      s += gn(h, y, m, b / h.width);
      const v = m - 5;
      ((s +=
        Gn(y, y + b, v, t.accentOnPaper, 0.2) +
        Vn(y, v - 1.2, v + 1.2, t.accentOnPaper, 0.2) +
        Vn(y + b, v - 1.2, v + 1.2, t.accentOnPaper, 0.2)),
        (s += _t(t.body, `${d.mm} mm`, {
          x: y + b / 2,
          y: v - 2,
          size: 2.12,
          fill: t.accentOnPaper,
          anchor: "middle",
          tracking: 0.1,
        }).svg));
      const k = d.px * 0.2,
        C = (k * h.height) / h.width;
      ((s += gn(h, u + (f - k) / 2, o.y + 82 - C / 2, k / h.width)),
        (s += Gn(u + 6, u + f - 6, o.y + 104, t.hairline, 0.2)),
        (s += _t(t.bodyBold, l.t, {
          x: u + 6,
          y: o.y + 113,
          size: 2.1,
          fill: t.p.ink,
          tracking: 0.16,
        }).svg),
        (s += bt(t.body, `Druck ab ${d.mm} mm Breite`, {
          x: u + 6,
          y: o.y + 120,
          size: 3,
          fill: t.p.ink,
        }).svg),
        (s += bt(t.body, `Bildschirm ab ${d.px} px Breite`, {
          x: u + 6,
          y: o.y + 125.5,
          size: 3,
          fill: t.muted,
        }).svg));
    }),
    (s += en(
      t.body,
      "Die oberen Beispiele sind in Originalgröße gedruckt. Wird es noch kleiner, nimm die nächstkleinere Anordnung: gestapelt statt liegend, Monogramm statt gestapelt.",
      { x: ht, y: 120, size: 3, fill: t.p.ink, maxWidth: 78, leading: 4.6 },
    ).svg),
    i(
      t,
      n,
      e,
      "Logo",
      "Mindestgröße",
      "So klein darf jede Anordnung deines Logos höchstens werden, damit alles lesbar bleibt.",
      s,
    )
  );
}
function hc(t, n, e, i = We) {
  const o = kr,
    r = [
      {
        t: "Farbig, liegend",
        d: "Standard auf hellem Grund",
        g: t.lockup("color", "horizontal"),
        bg: t.paper,
        fg: t.muted,
      },
      {
        t: "Auf dunkel",
        d: "Für dunkle Flächen und Fotos",
        g: t.lockup("reverse", "horizontal"),
        bg: t.dark,
        fg: t.onDark,
      },
      {
        t: "Schwarz",
        d: "Einfarbiger Druck, Stempel",
        g: t.lockup("mono-dark", "horizontal"),
        bg: "#FFFFFF",
        fg: t.muted,
      },
      {
        t: "Weiß",
        d: "Auf Markenfarbe und Fotos",
        g: t.lockup("mono-light", "horizontal"),
        bg: _n(t.p.primary) || Vr(t.p.primary, "#FFFFFF") >= 3 ? t.p.primary : t.dark,
        fg: "#FFFFFF",
      },
      {
        t: "Gestapelt",
        d: "Hochformate, Schilder, Profile",
        g: t.lockup("color", "stacked"),
        bg: t.paper,
        fg: t.muted,
      },
      {
        t: "Monogramm",
        d: "Favicon, Stempel, kleine Flächen",
        g: t.lockup("color", "monogram"),
        bg: t.paper,
        fg: t.muted,
      },
    ],
    a = o.w / 3,
    s = o.h / 2;
  let l = "";
  return (
    r.forEach((c, u) => {
      const f = o.x + (u % 3) * a + 1.5,
        h = o.y + Math.floor(u / 3) * s + 1.5,
        d = a - 3,
        b = s - 3;
      l += `<path d="${Tt(f, h, d, b, 2.5)}" fill="${c.bg}"${c.bg === t.paper || c.bg === "#FFFFFF" ? ` stroke="${t.hairline}" stroke-width="0.2"` : ""}/>`;
      const g =
        u === 5
          ? { w: d * 0.3, h: b * 0.36 }
          : u === 4
            ? { w: d * 0.55, h: b * 0.46 }
            : { w: d * 0.72, h: b * 0.42 };
      ((l += Gt(c.g, f + (d - g.w) / 2, h + (b - 12 - g.h) / 2, g.w, g.h).svg),
        (l += _t(t.bodyBold, c.t, {
          x: f + 5,
          y: h + b - 9,
          size: 2.12,
          fill: c.fg,
          tracking: 0.16,
        }).svg),
        (l += bt(t.body, c.d, {
          x: f + 5,
          y: h + b - 4.5,
          size: 2.4,
          fill: c.fg,
          opacity: 0.8,
        }).svg));
    }),
    i(
      t,
      n,
      e,
      "Logo",
      "Logo-Varianten",
      "Drei Anordnungen in vier Farbfassungen. Alle liegen im Brand Kit als PNG, SVG und PDF.",
      l,
    )
  );
}
function gc(t, n, e, i = We) {
  const o = kr,
    r = t.logo("color"),
    a = o.w / 2,
    s = o.h / 2,
    l = [
      {
        t: "Nicht verzerren",
        draw: (u, f, h, d) => {
          const b = h * 0.62,
            g = d * 0.42,
            y = Math.min(b / r.width, g / r.height),
            m = r.width * y * 1.35,
            v = r.height * y * 0.7;
          return `<g transform="translate(${I(u + (h - m) / 2, 3)} ${I(f + (d - v) / 2, 3)}) scale(${I(y * 1.35, 6)} ${I(y * 0.7, 6)})">${r.body}</g>`;
        },
      },
      {
        t: "Keine fremden Farben",
        draw: (u, f, h, d) => {
          const b = ["#E5007D", "#00A8E8", "#F2C500", "#46B500"],
            g = new Map(),
            y = r.body.replace(/#[0-9A-Fa-f]{6}\b/g, (m) => {
              const v = m.toUpperCase();
              return v === t.paper.toUpperCase()
                ? m
                : (g.has(v) || g.set(v, b[g.size % b.length]), g.get(v));
            });
          return Gt({ ...r, body: y }, u + h * 0.19, f + d * 0.29, h * 0.62, d * 0.42).svg;
        },
      },
      {
        t: "Nicht auf unruhigem Grund",
        draw: (u, f, h, d) => {
          const b = te("bz"),
            g = [t.p.primary, t.p.accent, t.p.secondary, "#6E8B74", "#C9A27E", "#3F5872"];
          let y = "";
          const m = 14;
          for (let v = -m; v < m * 2; v++)
            y += `<path d="M${I(u + v * (h / m), 2)} ${I(f + d, 2)}L${I(u + v * (h / m) + d, 2)} ${I(f, 2)}l${I(h / m, 2)} 0L${I(u + (v + 1) * (h / m), 2)} ${I(f + d, 2)}Z" fill="${g[(v + m * 3) % g.length]}"/>`;
          return (
            `<defs><clipPath id="${b}"><path d="${Tt(u, f, h, d, 2.5)}"/></clipPath></defs><g clip-path="url(#${b})">${y}</g>` +
            Gt(r, u + h * 0.19, f + d * 0.29, h * 0.62, d * 0.42).svg
          );
        },
      },
      {
        t: "Nicht drehen",
        draw: (u, f, h, d) =>
          `<g transform="rotate(-14 ${I(u + h / 2)} ${I(f + d / 2)})">${Gt(r, u + h * 0.21, f + d * 0.3, h * 0.58, d * 0.4).svg}</g>`,
      },
    ];
  let c = "";
  return (
    l.forEach((u, f) => {
      const h = o.x + (f % 2) * a + 1.5,
        d = o.y + Math.floor(f / 2) * s + 1.5,
        b = a - 3,
        g = s - 3;
      ((c += `<path d="${Tt(h, d, b, g, 2.5)}" fill="#FFFFFF" stroke="${t.hairline}" stroke-width="0.2"/>`),
        (c += u.draw(h, d, b, g)));
      const y = 3.2,
        m = h + b - 7,
        v = d + 7;
      ((c +=
        Kr(m, v, y, "#C0392B") +
        `<path d="M${I(m - 1.3)} ${I(v - 1.3)}L${I(m + 1.3)} ${I(v + 1.3)}M${I(m + 1.3)} ${I(v - 1.3)}L${I(m - 1.3)} ${I(v + 1.3)}" stroke="#FFFFFF" stroke-width="0.6" stroke-linecap="round"/>`),
        (c += `<path d="${Tt(h + 4, d + g - 10, 70, 7, 3.5)}" fill="#FFFFFF" fill-opacity="0.92"/>`),
        (c += _t(t.bodyBold, u.t, {
          x: h + 7,
          y: d + g - 5.4,
          size: 2.1,
          fill: t.p.ink,
          tracking: 0.14,
        }).svg));
    }),
    i(
      t,
      n,
      e,
      "Logo",
      "Fehlanwendungen",
      "Damit dein Auftritt hochwertig bleibt: das Logo nie verändern, sondern immer die Original-Dateien verwenden.",
      c,
    )
  );
}
const Zi = {
  primary: ["Hauptfarbe", "Symbol, große Flächen, Bildplatzhalter"],
  secondary: ["Zweitfarbe", "Zusatzzeile, ruhige Flächen"],
  accent: ["Akzent", "Kleine Details, Linien, Hervorhebungen"],
  ink: ["Schrift", "Texte und dunkle Flächen"],
  paper: ["Papier", "Heller Hintergrund"],
};
function pc(t, n, e, i = We) {
  const o = { x: ht, y: 52, w: oe - 2 * ht },
    r = ["primary", "secondary", "accent", "ink", "paper"],
    a = o.w / r.length;
  let s = "";
  return (
    r.forEach((l, c) => {
      const u = t.p[l].toUpperCase(),
        f = o.x + c * a,
        h = a - 4,
        d = 66;
      s += `<path d="${Tt(f, o.y, h, d, 2.5)}" fill="${u}"${l === "paper" ? ` stroke="${t.hairline}" stroke-width="0.25"` : ""}/>`;
      const b = _n(u) ? "#FFFFFF" : t.p.ink;
      ((s += _t(t.bodyBold, Zi[l][0], {
        x: f + 5,
        y: o.y + 9,
        size: 2.2,
        fill: b,
        tracking: 0.16,
      }).svg),
        (s += bt(t.head, u, { x: f + 5, y: o.y + d - 6, size: 6.2, fill: b }).svg));
      const [g, y, m] = Ea(u),
        [v, k, C, z] = Ca(u);
      let L = o.y + d + 9;
      const A = [
        ["HEX", u],
        ["RGB", `${g} ${y} ${m}`],
        ["CMYK", `${v} ${k} ${C} ${z}`],
      ];
      for (const [O, $] of A)
        ((s += _t(t.body, O, { x: f, y: L, size: 2.12, fill: t.muted, tracking: 0.16 }).svg),
          (s += bt(t.body, $, { x: f + 13, y: L, size: 3, fill: t.p.ink }).svg),
          (L += 6));
      ((L += 2),
        (s += en(t.body, Zi[l][1], {
          x: f,
          y: L,
          size: 2.6,
          fill: t.muted,
          maxWidth: h - 2,
          leading: 3.8,
        }).svg),
        l === "ink" &&
          (s += _t(
            t.body,
            `Kontrast zu Papier ${Vr(t.p.ink, t.p.paper).toFixed(1).replace(".", ",")} : 1`,
            { x: f, y: L + 9, size: 2.12, fill: t.accentOnPaper, tracking: 0.1 },
          ).svg));
    }),
    (s += _t(
      t.body,
      "CMYK-Werte sind eine Näherung ohne Farbprofil. Vor großen Auflagen einen Probedruck anfordern.",
      { x: ht, y: Jt - 19, size: 2.12, fill: t.muted, tracking: 0.06 },
    ).svg),
    i(t, n, e, "Farben", "Farben", "", s)
  );
}
const Gi = {
    upper: "Name in Versalien",
    surname: "Nachname mit Zusatz",
    stacked: "Name zweizeilig gestapelt",
    initial: "Initial und Nachname",
    monogram: "Monogramm als Bildmarke",
    district: "Zusatz mit Bezirk",
  },
  Fr = (t) => `${Oe(t.key).family} ${vr(t)}`;
function mc(t) {
  const n = t.concept,
    e = n.typo,
    i = [];
  if (
    (n.nameFormat && n.nameFormat !== "full" && Gi[n.nameFormat] && i.push(Gi[n.nameFormat]),
    e != null && e.split)
  ) {
    const o = e.split.part === "first" ? "erstes Wort" : "weitere Wörter";
    (e.split.font && i.push(`Schnittmischung: ${o} in ${Fr(e.split.font)}`),
      e.split.color &&
        i.push(
          `Farbteilung: ${o} in ${e.split.color === "accent" ? "Akzent" : e.split.color === "primary" ? "Hauptfarbe" : "Schriftfarbe"}`,
        ),
      e.split.stack && n.nameFormat !== "stacked" && i.push("Namensteile gestapelt"),
      e.split.scale &&
        e.split.scale !== 1 &&
        i.push(`${o} ${e.split.scale > 1 ? "größer" : "kleiner"} gesetzt`));
  }
  return (
    e != null && e.ampersand && i.push(`&-Zeichen aus ${Fr(e.ampersand)}`),
    e != null &&
      e.rule &&
      i.push(e.rule === "over" ? "Akzentstrich über dem Namen" : "Akzentstrich unter dem Namen"),
    e != null && e.letterSwap && i.push("ein O durch das Symbol ersetzt"),
    e != null && e.inlineSuffix && i.push("Zusatz neben dem Namen mit senkrechtem Strich"),
    e != null && e.camel && i.push("Binnenversal ohne Leerzeichen"),
    n.name.font.style === "italic" && i.push(`Name kursiv (${Fr(n.name.font)})`),
    i
  );
}
function bc(t, n, e, i = We) {
  const o = ui(t.concept),
    r = Oe(t.displayRef.key),
    a = Oe(t.bodyRef.key);
  let s = "";
  const l = (d, b, g, y, m, v) => {
      let k = `<path d="${Tt(d, 50, 124, 88, 3)}" fill="${t.p.ink}" fill-opacity="0.035"/>`;
      return (
        (k += bt(b, "Aa", { x: d + 8, y: 90, size: 36, fill: t.p.ink }).svg),
        (k += bt(t.bodyBold, g, {
          x: d + 56,
          y: 68,
          size: ve(t.bodyBold, g, 62, 4.6),
          fill: t.p.ink,
        }).svg),
        (k += _t(t.body, y, {
          x: d + 56,
          y: 75,
          size: 2.12,
          fill: t.accentOnPaper,
          tracking: 0.14,
        }).svg),
        (k += bt(t.body, m, { x: d + 56, y: 82, size: 2.8, fill: t.muted }).svg),
        (k += bt(b, "ABCDEFGHIJKLMNOPQRSTUVWXYZ ÄÖÜ", {
          x: d + 8,
          y: 106,
          size: ve(b, "ABCDEFGHIJKLMNOPQRSTUVWXYZ ÄÖÜ", 108, 4.4),
          fill: t.p.ink,
        }).svg),
        (k += bt(b, "abcdefghijklmnopqrstuvwxyz äöüß 0123456789 €", {
          x: d + 8,
          y: 114,
          size: ve(b, "abcdefghijklmnopqrstuvwxyz äöüß 0123456789 €", 108, 4.4),
          fill: t.p.ink,
        }).svg),
        (k += en(b, v, {
          x: d + 8,
          y: 125,
          size: 3.6,
          fill: t.muted,
          maxWidth: 108,
          leading: 5,
        }).svg),
        k
      );
    },
    c = (d, b) => {
      var g;
      return (((g = o.find((y) => y.family === d)) == null ? void 0 : g.cuts) ?? [b])
        .map(vr)
        .join(", ");
    },
    u = t.head === t.display;
  ((s += l(
    ht,
    t.display,
    r.family,
    u ? "Logo und Überschriften" : "Logo",
    `Schnitt ${c(r.family, t.displayRef)}`,
    "Altbauwohnung mit Balkon zum Hof",
  )),
    (s += l(
      ht + 131,
      t.body,
      a.family,
      u ? "Fließtext und Kontaktdaten" : "Fließtext, Kontakt, Überschriften",
      `Schnitt ${c(a.family, t.bodyRef)}`,
      "Besichtigung nach Vereinbarung. Die Unterlagen schicke ich Ihnen gern vorab.",
    )));
  const f = mc(t);
  let h = 146;
  (f.length
    ? ((s += _t(t.bodyBold, "Im Logo", {
        x: ht,
        y: h,
        size: 2.12,
        fill: t.accentOnPaper,
        tracking: 0.16,
      }).svg),
      (s += bt(t.body, f.join("  ·  "), {
        x: ht + 18,
        y: h,
        size: ve(t.body, f.join("  ·  "), oe - 2 * ht - 18, 3, 0, 2.12),
        fill: t.p.ink,
      }).svg),
      (h += 10))
    : (h += 6),
    (s += _t(t.bodyBold, "Freie Schriften", {
      x: ht,
      y: h,
      size: 2.1,
      fill: t.accentOnPaper,
      tracking: 0.16,
    }).svg),
    (h += 6),
    (s += bt(
      t.body,
      "Alle Schriften stehen unter der SIL Open Font License 1.1 und dürfen kostenlos, auch geschäftlich, genutzt werden.",
      { x: ht, y: h, size: 3, fill: t.p.ink },
    ).svg),
    (h += 6));
  for (const d of o) {
    const b = fi(d.pkg, d.family);
    ((s += bt(t.body, `${d.family}: ${b.fontsource.replace(/^https:\/\//, "")}`, {
      x: ht,
      y: h,
      size: 2.6,
      fill: t.muted,
    }).svg),
      (h += 4.4));
  }
  return i(t, n, e, "Typografie", "Typografie", "", s);
}
function wc(t, n, e, i, o) {
  var m;
  let r = "";
  const a = { x: ht, y: 50, w: oe - 2 * ht, h: 124 };
  r += `<path d="${Tt(a.x, a.y, a.w, a.h, 3)}" fill="${t.p.ink}" fill-opacity="0.035"/>`;
  const s = 70,
    l = t.sample ? a.y + (a.h - 6 - (s * 55) / 85) / 2 : a.y + 10,
    c = zn(o.cardFront(t), a.x + 12, l, s);
  if (
    ((r +=
      `<rect x="${a.x + 12.6}" y="${I(l + 1)}" width="${s}" height="${I(c.h)}" fill="#000" fill-opacity="0.08"/>` +
      c.svg),
    !t.sample)
  ) {
    const v = zn(o.cardBack(t), a.x + 12 + 18, l + c.h + 6, s);
    r +=
      `<rect x="${a.x + 30.6}" y="${I(l + c.h + 7)}" width="${s}" height="${I(v.h)}" fill="#000" fill-opacity="0.08"/>` +
      v.svg;
  }
  const u = 74,
    f = zn(o.post(t), a.x + 140, a.y + 12, u);
  r +=
    `<rect x="${a.x + 140.6}" y="${a.y + 13}" width="${u}" height="${I(f.h)}" fill="#000" fill-opacity="0.08"/>` +
    f.svg;
  const h = 30,
    d = te("pr"),
    b = zn(o.profile(t), a.x + 224, a.y + 12, h);
  ((r += `<defs><clipPath id="${d}"><circle cx="${I(a.x + 224 + h / 2)}" cy="${I(a.y + 12 + h / 2)}" r="${h / 2}"/></clipPath></defs><g clip-path="url(#${d})">${b.svg}</g>`),
    (r += _t(t.body, "Profilbild", {
      x: a.x + 224 + h / 2,
      y: a.y + 12 + h + 6,
      size: 2.12,
      fill: t.muted,
      anchor: "middle",
      tracking: 0.14,
    }).svg),
    (r += _t(t.body, "Visitenkarte  ·  85 x 55 mm", {
      x: a.x + 12,
      y: a.y + a.h - 6,
      size: 2.12,
      fill: t.muted,
      tracking: 0.14,
    }).svg),
    (r += _t(t.body, "Instagram  ·  1080 x 1350 px", {
      x: a.x + 140,
      y: a.y + a.h - 6,
      size: 2.12,
      fill: t.muted,
      tracking: 0.14,
    }).svg));
  const g = [
    "Flächen in Markenfarbe, Schrift in Papier- oder Schriftfarbe.",
    "Großzügige Ränder: mindestens der Schutzraum des Logos.",
    "Fotos hell und natürlich, keine Filter.",
  ];
  let y = a.y + 64;
  for (const v of g)
    ((r += en(t.body, v, {
      x: a.x + 224,
      y,
      size: 2.5,
      fill: t.p.ink,
      maxWidth: 33,
      leading: 3.6,
    }).svg),
      (y += 17));
  return (
    (t.contact.unioPartner || ((m = t.assets.contact) != null && m.unioPartner)) &&
      (r += _t(
        t.body,
        "Partner im UNIO CIRCLE: als dezente Zeile am Rand von Drucksachen, nie im Logo.",
        { x: ht, y: Jt - 19, size: 2.12, fill: t.muted, tracking: 0.06 },
      ).svg),
    i(t, n, e, "Anwendung", "Anwendung", "", r)
  );
}
function yc(t, n, e = We, i = Hi) {
  return [
    { label: "Titel", body: i(t), dark: i === Hi },
    { label: "Schutzraum", body: fc(t, 2, 8, e) },
    { label: "Mindestgröße", body: dc(t, 3, 8, e) },
    { label: "Varianten", body: hc(t, 4, 8, e) },
    { label: "Fehlanwendungen", body: gc(t, 5, 8, e) },
    { label: "Farben", body: pc(t, 6, 8, e) },
    { label: "Typografie", body: bc(t, 7, 8, e) },
    { label: "Anwendung", body: wc(t, 8, 8, e, n) },
  ];
}
const Vi = Wr,
  Iu = (t) => ee(oe, Jt, t.body, { unit: "mm", title: `Brand Guide ${t.label}` }),
  Ou = { w: oe, h: Jt },
  pe = 297,
  le = 210,
  kt = 18,
  er = 6 * (25.4 / 72);
function vc(t, n) {
  return (e, i, o, r, a, s, l) => {
    let c = wt(pe, le, n);
    return (
      (c += st(t, `${String(i).padStart(2, "0")}  ·  ${r}`, kt, kt - 2, 2.3, E.amberText)),
      (c += st(t, e.brandName, pe - kt, kt - 2, 2.3, E.muted, "end")),
      (c += at(t, a, kt, kt + 10, 12, { maxWidth: 150 }).svg),
      s && (c += U(t, s, kt, kt + 30, 3.3, { lh: 1.55, wrap: 82 }).svg),
      (c += ce(kt, le - 14, pe - 2 * kt, E.hair, 0.2)),
      (c += me(st(t, `Markenhandbuch  ·  ${it.circle}`, kt, le - 10.5, er, E.muted))),
      (c += xe(pe / 2 - 6.8, le - 10.4, 2.6).svg),
      (c += st(
        t,
        `${String(i).padStart(2, "0")} / ${String(o).padStart(2, "0")}`,
        pe - kt,
        le - 10.5,
        er,
        E.muted,
        "end",
      )),
      c + l
    );
  };
}
function kc(t, n) {
  return (e) => {
    let i = wt(pe, le, n);
    ((i += xe(kt + 6, kt, 3.4).svg),
      (i += st(t, it.circleCaps, pe - kt, kt + 0.4, 2.3, E.muted, "end")));
    const o = Me(e, {
      x: kt + 6,
      y: 48,
      w: 150,
      h: 74,
      ground: E.bg,
      align: "start",
      valign: "middle",
      prefer: "auto",
    });
    i += o.svg;
    const r = e.tagline("color");
    (r.width && (i += Gt(r, kt + 6, o.y + o.h + 8, 150, 4.2, "start", "top").svg),
      (i += st(t, "Markenhandbuch", kt + 6, le - 40, 3, E.amberText)));
    const a = new Date().toLocaleDateString("de-AT", { month: "long", year: "numeric" });
    i += U(t, `Version 1.0  ·  ${a}`, kt + 6, le - 34, 3.4, { fill: E.muted }).svg;
    const s = 196;
    return (
      (i += Pt(s - 10, 46, pe - kt - s + 10, 14 + Vi.length * 9, 3.5, E.card)),
      Vi.forEach((l, c) => {
        const u = 54 + c * 9;
        ((i += U(t, String(c + 2).padStart(2, "0"), s, u, 2.4, {
          bold: !0,
          fill: E.amberText,
          tracking: 0.08,
        }).svg),
          (i += U(t, l, s + 9, u - 0.6, 3.3, { fill: E.ink }).svg));
      }),
      (i += ce(kt, le - 14, pe - 2 * kt, E.hair, 0.2)),
      (i += st(t, "Erstellt mit dem UNIO Brand Studio", kt, le - 10.5, er, E.muted)),
      (i += st(t, it.claim, pe - kt, le - 10.5, er, E.light, "end")),
      i
    );
  };
}
const _c = {
    cardFront: (t) => ke(t, Rr, 0, !1),
    cardBack: (t) => ke(t, Rr, 1, !1),
    post: (t) => ke(t, Rn[0], 0, !1),
    profile: (t) => ke(t, Rn.find((n) => n.id === "unio-social-profile") ?? Rn[0], 0, !1),
  },
  Ki = new WeakMap();
function $c(t, n) {
  let e = Ki.get(t.kit);
  e || Ki.set(t.kit, (e = new Map()));
  const i = `${n}|${t.f.headFamily}`;
  let o = e.get(i);
  return (o || ((o = yc(t.kit, _c, vc(t, n), kc(t, n)).map((r) => r.body)), e.set(i, o)), o);
}
const Sc = [
    "Titel",
    "Schutzraum",
    "Mindestgröße",
    "Varianten",
    "Fehlanwendungen",
    "Farben",
    "Typografie",
    "Anwendung",
  ],
  Ac = {
    id: "unio-brand-guide",
    file: "brand-guide",
    label: "Brand Guide",
    description:
      "Alle Regeln deiner Marke im UNIO-Layout. Gib ihn weiter, wenn jemand für dich gestaltet.",
    format: "A4quer",
    units: "mm",
    figma: ["Stil der Figma-Vorlagen 344:6"],
    pages: Sc.map((t, n) => ({ label: t, draw: (e, i) => $c(e, i)[n] })),
    logoCheck: (t) => Me(t.kit, { x: kt + 6, y: 48, w: 150, h: 74, ground: E.bg }).adjusted,
    group: "guide",
    dir: jt.guide,
    replaces: "brand-guide",
    needsContact: !1,
    bleed: 0,
    sizeLabel: "PDF · A4 quer · 8 Seiten",
    note: "Dein Markenhandbuch im UNIO-Layout: Logo, Schutzzone, Farben, Schriften und Anwendung.",
    previews: !1,
  },
  Ec = Bt(Ac),
  jo = [nl, rl, zl, xl, sl, Zs, bl, hl, gl, Sl, Al],
  Wo = [sc, ...tc, Rl, jl, Wl, Ul, Ec],
  Uo = [...Wo, ...jo];
function Ho(t) {
  return Wo.find((n) => n.replaces === t);
}
function zu() {
  return Uo.length > 0;
}
function xu(t) {
  return Uo.find((n) => n.id === t);
}
const di = [...Qa, is],
  Cc = [
    "email-signature",
    "social-profile",
    "social-new",
    "social-sold",
    "social-viewing",
    "social-intro",
    "social-story",
    "social-linkedin",
    "social-facebook",
    "business-card",
    "letterhead",
    "expose",
    "sign",
    "brand-guide",
  ];
function Fc(t, n) {
  const e = Cc.map((i) => Ho(i)).filter((i) => !!i);
  return [...di, ...e, ...jo];
}
const Pn = 72 / 25.4;
async function Ic(t, n = {}) {
  if (!uo()) throw new Error("svgToPdf braucht einen Browser (DOM)");
  if (!t.length) throw new Error("svgToPdf: keine Seiten");
  const { jsPDF: e } = await Or(
    async () => {
      const { jsPDF: s } = await import("./jspdf.es.min-B1MezrQ_.js").then((l) => l.j);
      return { jsPDF: s };
    },
    __vite__mapDeps([0, 1, 2]),
    import.meta.url,
  );
  await Or(
    () => import("./svg2pdf.es.min-C0i_BZvn.js"),
    __vite__mapDeps([3, 0, 1, 2, 4, 5, 6, 7]),
    import.meta.url,
  );
  const i = t[0],
    o = (s) => (s.widthMm > s.heightMm ? "landscape" : "portrait"),
    r = typeof CompressionStream < "u",
    a = new e({
      unit: "mm",
      format: [i.widthMm, i.heightMm],
      orientation: o(i),
      compress: !r,
      putOnlyUsedFonts: !0,
    });
  a.setProperties({
    title: n.title ?? "",
    author: n.author ?? "",
    subject: n.subject ?? "",
    creator: "UNIO Brand Studio",
  });
  for (let s = 0; s < t.length; s++) {
    const l = t[s];
    s > 0 && a.addPage([l.widthMm, l.heightMm], o(l));
    const c = new DOMParser().parseFromString(l.svg, "image/svg+xml").documentElement;
    if (c.nodeName !== "svg") throw new Error("Ungueltiges SVG fuer PDF");
    await Tc(c);
    for (const u of Mc(c, xc))
      (await a.svg(u, { x: 0, y: 0, width: l.widthMm, height: l.heightMm }), await mn());
    (l.trimInsetMm !== void 0 && Dc(a, l), await mn());
  }
  return r ? new Blob([await zc(a.output())], { type: "application/pdf" }) : a.output("blob");
}
function Ir(t) {
  const n = new Uint8Array(t.length);
  for (let e = 0; e < t.length; e++) n[e] = t.charCodeAt(e) & 255;
  return n;
}
async function Oc(t) {
  const n = new CompressionStream("deflate"),
    e = new Blob([t]).stream().pipeThrough(n);
  return new Uint8Array(await new Response(e).arrayBuffer());
}
async function zc(t) {
  const n = () => Ir(t),
    e = t.lastIndexOf(`
xref
`),
    i = t.search(/\n\d+ 0 obj\b/);
  if (e < 0 || i < 0) return n();
  const o = [t.slice(0, i + 1)];
  let r = i + 1,
    a = i + 1;
  const s = new Map(),
    l = /(\d+) 0 obj\b/y,
    c = (k) => {
      for (
        ;
        t[k] ===
          `
` || t[k] === "\r";
      )
        k++;
      return k;
    };
  for (; r < e; ) {
    l.lastIndex = r;
    const k = l.exec(t);
    if (!k) return n();
    const C = Number(k[1]);
    s.set(C, a);
    const z = t.indexOf("endobj", r),
      L = t.indexOf(
        `stream
`,
        r,
      );
    if (z < 0) return n();
    if (L < 0 || L > z) {
      const w = c(z + 6);
      (o.push(t.slice(r, w)), (a += w - r), (r = w));
      continue;
    }
    const A = t.slice(r, L),
      O = /\/Length (\d+)(?![\d ]*R)/.exec(A);
    if (!O) return n();
    const $ = Number(O[1]),
      x = L + 7,
      P = t.indexOf("endobj", x + $);
    if (P < 0) return n();
    const _ = c(P + 6),
      T = t.slice(x + $, _);
    if (!/\/Filter\b/.test(A) && $ > 64) {
      const w = await Oc(Ir(t.slice(x, x + $))),
        R = `${A.replace(/\/Length \d+/, `/Length ${w.length} /Filter /FlateDecode`)}stream
`;
      (o.push(R, w, T), (a += R.length + w.length + T.length));
    } else (o.push(t.slice(r, _)), (a += _ - r));
    r = _;
  }
  const u = /xref\n0 (\d+)\n/.exec(t.slice(e)),
    f = t.indexOf("trailer", e);
  if (!u || f < 0) return n();
  const h = Number(u[1]);
  let d = `xref
0 ${h}
0000000000 65535 f 
`;
  for (let k = 1; k < h; k++) {
    const C = s.get(k);
    d +=
      C === void 0
        ? `0000000000 65535 f 
`
        : `${String(C).padStart(10, "0")} 00000 n 
`;
  }
  const b = a + 1,
    g = t.slice(f).replace(
      /startxref\s+\d+/,
      `startxref
${b}`,
    );
  o.push(`
${d}${g}`);
  const y = o.reduce((k, C) => k + C.length, 0),
    m = new Uint8Array(y);
  let v = 0;
  for (const k of o)
    typeof k == "string" ? (m.set(Ir(k), v), (v += k.length)) : (m.set(k, v), (v += k.length));
  return m;
}
const xc = 4e4,
  qi = new WeakMap();
function kn(t) {
  const n = qi.get(t);
  if (n !== void 0) return n;
  let e;
  if (!t.children.length) e = t.outerHTML.length;
  else {
    e = 2 * t.localName.length + 5;
    for (const i of Array.from(t.attributes)) e += i.name.length + i.value.length + 4;
    for (const i of Array.from(t.children)) e += kn(i);
  }
  return (qi.set(t, e), e);
}
function Zo(t, n) {
  if (kn(t) <= n || t.localName !== "g" || t.hasAttribute("opacity") || t.hasAttribute("mask"))
    return [t];
  const e = Array.from(t.children),
    i = e.filter((s) => s.localName === "defs"),
    o = [];
  let r = null,
    a = 0;
  for (const s of e)
    if (s.localName !== "defs")
      for (const l of Zo(s, n)) {
        const c = kn(l);
        if (!r || a + c > n) {
          r = t.cloneNode(!1);
          for (const u of i) r.appendChild(u.cloneNode(!0));
          (o.push(r), (a = 0));
        }
        (r.appendChild(l), (a += c));
      }
  return o.length ? o : [t];
}
function Mc(t, n) {
  if (kn(t) <= n) return [t];
  const e = Array.from(t.children),
    i = e.filter((s) => s.localName === "defs"),
    o = [];
  let r = null,
    a = 0;
  for (const s of e)
    if (!(s.localName === "defs" || s.localName === "title"))
      for (const l of Zo(s, n)) {
        const c = kn(l);
        if (!r || a + c > n) {
          r = t.cloneNode(!1);
          for (const u of i) r.appendChild(u.cloneNode(!0));
          (o.push(r), (a = 0));
        }
        (r.appendChild(l), (a += c));
      }
  return o.length ? o : [t];
}
const Yi = new Map();
async function Tc(t) {
  for (const n of Array.from(t.querySelectorAll("image[data-ground]"))) {
    const e = n.getAttribute("href") ?? n.getAttribute("xlink:href") ?? "",
      i = n.getAttribute("data-ground") ?? "#FFFFFF",
      o = Math.min(4e3, Math.max(200, Number(n.getAttribute("data-max")) || 1600));
    if (!e.startsWith("data:image/")) continue;
    const r = `${i}|${o}|${e.length}|${e.startsWith("data:image/svg+xml") ? Lc(e) : e.slice(-64)}`;
    let a = Yi.get(r);
    a || ((a = Bc(e, i, o)), Yi.set(r, a));
    const s = await a;
    (n.setAttribute("href", s), n.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", s));
  }
}
function Lc(t) {
  let n = 2166136261;
  for (let e = 0; e < t.length; e++) n = Math.imul(n ^ t.charCodeAt(e), 16777619);
  return (n >>> 0).toString(36);
}
async function Pc(t) {
  if (t.startsWith("data:image/svg+xml")) {
    const e = new Image();
    return (
      (e.src = t),
      await e.decode(),
      { width: e.naturalWidth || 1, height: e.naturalHeight || 1, src: e, close: () => {} }
    );
  }
  const n = await createImageBitmap(await (await fetch(t)).blob());
  return { width: n.width, height: n.height, src: n, close: () => n.close() };
}
async function Bc(t, n, e = 1600) {
  const i = await Pc(t),
    o = Math.min(1, e / Math.max(i.width, i.height)),
    r = document.createElement("canvas");
  ((r.width = Math.max(1, Math.round(i.width * o))),
    (r.height = Math.max(1, Math.round(i.height * o))));
  const a = r.getContext("2d");
  if (!a) return t;
  ((a.fillStyle = /^#[0-9a-fA-F]{6}$/.test(n) ? n : "#FFFFFF"),
    a.fillRect(0, 0, r.width, r.height),
    a.drawImage(i.src, 0, 0, r.width, r.height),
    i.close());
  const s = await new Promise((u) => r.toBlob(u, "image/jpeg", 0.9));
  if (!s) return t;
  const l = new Uint8Array(await s.arrayBuffer());
  let c = "";
  for (let u = 0; u < l.length; u += 32768) c += String.fromCharCode(...l.subarray(u, u + 32768));
  return `data:image/jpeg;base64,${btoa(c)}`;
}
function Dc(t, n) {
  const e = t.getCurrentPageInfo().pageContext,
    i = (r) => ({
      bottomLeftX: r * Pn,
      bottomLeftY: r * Pn,
      topRightX: (n.widthMm - r) * Pn,
      topRightY: (n.heightMm - r) * Pn,
    }),
    o = n.trimInsetMm ?? 0;
  ((e.trimBox = i(o)), (e.bleedBox = i(Math.max(0, o - (n.bleedMm ?? 0)))));
}
function Bn(t) {
  throw new Error(
    'Could not dynamically require "' +
      t +
      '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.',
  );
}
var Go = { exports: {} };
/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/ (function (t, n) {
  (function (e) {
    t.exports = e();
  })(function () {
    return (function e(i, o, r) {
      function a(c, u) {
        if (!o[c]) {
          if (!i[c]) {
            var f = typeof Bn == "function" && Bn;
            if (!u && f) return f(c, !0);
            if (s) return s(c, !0);
            var h = new Error("Cannot find module '" + c + "'");
            throw ((h.code = "MODULE_NOT_FOUND"), h);
          }
          var d = (o[c] = { exports: {} });
          i[c][0].call(
            d.exports,
            function (b) {
              var g = i[c][1][b];
              return a(g || b);
            },
            d,
            d.exports,
            e,
            i,
            o,
            r,
          );
        }
        return o[c].exports;
      }
      for (var s = typeof Bn == "function" && Bn, l = 0; l < r.length; l++) a(r[l]);
      return a;
    })(
      {
        1: [
          function (e, i, o) {
            var r = e("./utils"),
              a = e("./support"),
              s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            ((o.encode = function (l) {
              for (
                var c,
                  u,
                  f,
                  h,
                  d,
                  b,
                  g,
                  y = [],
                  m = 0,
                  v = l.length,
                  k = v,
                  C = r.getTypeOf(l) !== "string";
                m < l.length;
              )
                ((k = v - m),
                  (f = C
                    ? ((c = l[m++]), (u = m < v ? l[m++] : 0), m < v ? l[m++] : 0)
                    : ((c = l.charCodeAt(m++)),
                      (u = m < v ? l.charCodeAt(m++) : 0),
                      m < v ? l.charCodeAt(m++) : 0)),
                  (h = c >> 2),
                  (d = ((3 & c) << 4) | (u >> 4)),
                  (b = 1 < k ? ((15 & u) << 2) | (f >> 6) : 64),
                  (g = 2 < k ? 63 & f : 64),
                  y.push(s.charAt(h) + s.charAt(d) + s.charAt(b) + s.charAt(g)));
              return y.join("");
            }),
              (o.decode = function (l) {
                var c,
                  u,
                  f,
                  h,
                  d,
                  b,
                  g = 0,
                  y = 0,
                  m = "data:";
                if (l.substr(0, m.length) === m)
                  throw new Error("Invalid base64 input, it looks like a data url.");
                var v,
                  k = (3 * (l = l.replace(/[^A-Za-z0-9+/=]/g, "")).length) / 4;
                if (
                  (l.charAt(l.length - 1) === s.charAt(64) && k--,
                  l.charAt(l.length - 2) === s.charAt(64) && k--,
                  k % 1 != 0)
                )
                  throw new Error("Invalid base64 input, bad content length.");
                for (v = a.uint8array ? new Uint8Array(0 | k) : new Array(0 | k); g < l.length; )
                  ((c = (s.indexOf(l.charAt(g++)) << 2) | ((h = s.indexOf(l.charAt(g++))) >> 4)),
                    (u = ((15 & h) << 4) | ((d = s.indexOf(l.charAt(g++))) >> 2)),
                    (f = ((3 & d) << 6) | (b = s.indexOf(l.charAt(g++)))),
                    (v[y++] = c),
                    d !== 64 && (v[y++] = u),
                    b !== 64 && (v[y++] = f));
                return v;
              }));
          },
          { "./support": 30, "./utils": 32 },
        ],
        2: [
          function (e, i, o) {
            var r = e("./external"),
              a = e("./stream/DataWorker"),
              s = e("./stream/Crc32Probe"),
              l = e("./stream/DataLengthProbe");
            function c(u, f, h, d, b) {
              ((this.compressedSize = u),
                (this.uncompressedSize = f),
                (this.crc32 = h),
                (this.compression = d),
                (this.compressedContent = b));
            }
            ((c.prototype = {
              getContentWorker: function () {
                var u = new a(r.Promise.resolve(this.compressedContent))
                    .pipe(this.compression.uncompressWorker())
                    .pipe(new l("data_length")),
                  f = this;
                return (
                  u.on("end", function () {
                    if (this.streamInfo.data_length !== f.uncompressedSize)
                      throw new Error("Bug : uncompressed data size mismatch");
                  }),
                  u
                );
              },
              getCompressedWorker: function () {
                return new a(r.Promise.resolve(this.compressedContent))
                  .withStreamInfo("compressedSize", this.compressedSize)
                  .withStreamInfo("uncompressedSize", this.uncompressedSize)
                  .withStreamInfo("crc32", this.crc32)
                  .withStreamInfo("compression", this.compression);
              },
            }),
              (c.createWorkerFrom = function (u, f, h) {
                return u
                  .pipe(new s())
                  .pipe(new l("uncompressedSize"))
                  .pipe(f.compressWorker(h))
                  .pipe(new l("compressedSize"))
                  .withStreamInfo("compression", f);
              }),
              (i.exports = c));
          },
          {
            "./external": 6,
            "./stream/Crc32Probe": 25,
            "./stream/DataLengthProbe": 26,
            "./stream/DataWorker": 27,
          },
        ],
        3: [
          function (e, i, o) {
            var r = e("./stream/GenericWorker");
            ((o.STORE = {
              magic: "\0\0",
              compressWorker: function () {
                return new r("STORE compression");
              },
              uncompressWorker: function () {
                return new r("STORE decompression");
              },
            }),
              (o.DEFLATE = e("./flate")));
          },
          { "./flate": 7, "./stream/GenericWorker": 28 },
        ],
        4: [
          function (e, i, o) {
            var r = e("./utils"),
              a = (function () {
                for (var s, l = [], c = 0; c < 256; c++) {
                  s = c;
                  for (var u = 0; u < 8; u++) s = 1 & s ? 3988292384 ^ (s >>> 1) : s >>> 1;
                  l[c] = s;
                }
                return l;
              })();
            i.exports = function (s, l) {
              return s !== void 0 && s.length
                ? r.getTypeOf(s) !== "string"
                  ? (function (c, u, f, h) {
                      var d = a,
                        b = h + f;
                      c ^= -1;
                      for (var g = h; g < b; g++) c = (c >>> 8) ^ d[255 & (c ^ u[g])];
                      return -1 ^ c;
                    })(0 | l, s, s.length, 0)
                  : (function (c, u, f, h) {
                      var d = a,
                        b = h + f;
                      c ^= -1;
                      for (var g = h; g < b; g++) c = (c >>> 8) ^ d[255 & (c ^ u.charCodeAt(g))];
                      return -1 ^ c;
                    })(0 | l, s, s.length, 0)
                : 0;
            };
          },
          { "./utils": 32 },
        ],
        5: [
          function (e, i, o) {
            ((o.base64 = !1),
              (o.binary = !1),
              (o.dir = !1),
              (o.createFolders = !0),
              (o.date = null),
              (o.compression = null),
              (o.compressionOptions = null),
              (o.comment = null),
              (o.unixPermissions = null),
              (o.dosPermissions = null));
          },
          {},
        ],
        6: [
          function (e, i, o) {
            var r = null;
            ((r = typeof Promise < "u" ? Promise : e("lie")), (i.exports = { Promise: r }));
          },
          { lie: 37 },
        ],
        7: [
          function (e, i, o) {
            var r = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u",
              a = e("pako"),
              s = e("./utils"),
              l = e("./stream/GenericWorker"),
              c = r ? "uint8array" : "array";
            function u(f, h) {
              (l.call(this, "FlateWorker/" + f),
                (this._pako = null),
                (this._pakoAction = f),
                (this._pakoOptions = h),
                (this.meta = {}));
            }
            ((o.magic = "\b\0"),
              s.inherits(u, l),
              (u.prototype.processChunk = function (f) {
                ((this.meta = f.meta),
                  this._pako === null && this._createPako(),
                  this._pako.push(s.transformTo(c, f.data), !1));
              }),
              (u.prototype.flush = function () {
                (l.prototype.flush.call(this),
                  this._pako === null && this._createPako(),
                  this._pako.push([], !0));
              }),
              (u.prototype.cleanUp = function () {
                (l.prototype.cleanUp.call(this), (this._pako = null));
              }),
              (u.prototype._createPako = function () {
                this._pako = new a[this._pakoAction]({
                  raw: !0,
                  level: this._pakoOptions.level || -1,
                });
                var f = this;
                this._pako.onData = function (h) {
                  f.push({ data: h, meta: f.meta });
                };
              }),
              (o.compressWorker = function (f) {
                return new u("Deflate", f);
              }),
              (o.uncompressWorker = function () {
                return new u("Inflate", {});
              }));
          },
          { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 },
        ],
        8: [
          function (e, i, o) {
            function r(d, b) {
              var g,
                y = "";
              for (g = 0; g < b; g++) ((y += String.fromCharCode(255 & d)), (d >>>= 8));
              return y;
            }
            function a(d, b, g, y, m, v) {
              var k,
                C,
                z = d.file,
                L = d.compression,
                A = v !== c.utf8encode,
                O = s.transformTo("string", v(z.name)),
                $ = s.transformTo("string", c.utf8encode(z.name)),
                x = z.comment,
                P = s.transformTo("string", v(x)),
                _ = s.transformTo("string", c.utf8encode(x)),
                T = $.length !== z.name.length,
                w = _.length !== x.length,
                R = "",
                Q = "",
                N = "",
                tt = z.dir,
                Z = z.date,
                nt = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
              (b && !g) ||
                ((nt.crc32 = d.crc32),
                (nt.compressedSize = d.compressedSize),
                (nt.uncompressedSize = d.uncompressedSize));
              var j = 0;
              (b && (j |= 8), A || (!T && !w) || (j |= 2048));
              var D = 0,
                et = 0;
              (tt && (D |= 16),
                m === "UNIX"
                  ? ((et = 798),
                    (D |= (function (V, ft) {
                      var At = V;
                      return (V || (At = ft ? 16893 : 33204), (65535 & At) << 16);
                    })(z.unixPermissions, tt)))
                  : ((et = 20),
                    (D |= (function (V) {
                      return 63 & (V || 0);
                    })(z.dosPermissions))),
                (k = Z.getUTCHours()),
                (k <<= 6),
                (k |= Z.getUTCMinutes()),
                (k <<= 5),
                (k |= Z.getUTCSeconds() / 2),
                (C = Z.getUTCFullYear() - 1980),
                (C <<= 4),
                (C |= Z.getUTCMonth() + 1),
                (C <<= 5),
                (C |= Z.getUTCDate()),
                T && ((Q = r(1, 1) + r(u(O), 4) + $), (R += "up" + r(Q.length, 2) + Q)),
                w && ((N = r(1, 1) + r(u(P), 4) + _), (R += "uc" + r(N.length, 2) + N)));
              var X = "";
              return (
                (X += `
\0`),
                (X += r(j, 2)),
                (X += L.magic),
                (X += r(k, 2)),
                (X += r(C, 2)),
                (X += r(nt.crc32, 4)),
                (X += r(nt.compressedSize, 4)),
                (X += r(nt.uncompressedSize, 4)),
                (X += r(O.length, 2)),
                (X += r(R.length, 2)),
                {
                  fileRecord: f.LOCAL_FILE_HEADER + X + O + R,
                  dirRecord:
                    f.CENTRAL_FILE_HEADER +
                    r(et, 2) +
                    X +
                    r(P.length, 2) +
                    "\0\0\0\0" +
                    r(D, 4) +
                    r(y, 4) +
                    O +
                    R +
                    P,
                }
              );
            }
            var s = e("../utils"),
              l = e("../stream/GenericWorker"),
              c = e("../utf8"),
              u = e("../crc32"),
              f = e("../signature");
            function h(d, b, g, y) {
              (l.call(this, "ZipFileWorker"),
                (this.bytesWritten = 0),
                (this.zipComment = b),
                (this.zipPlatform = g),
                (this.encodeFileName = y),
                (this.streamFiles = d),
                (this.accumulate = !1),
                (this.contentBuffer = []),
                (this.dirRecords = []),
                (this.currentSourceOffset = 0),
                (this.entriesCount = 0),
                (this.currentFile = null),
                (this._sources = []));
            }
            (s.inherits(h, l),
              (h.prototype.push = function (d) {
                var b = d.meta.percent || 0,
                  g = this.entriesCount,
                  y = this._sources.length;
                this.accumulate
                  ? this.contentBuffer.push(d)
                  : ((this.bytesWritten += d.data.length),
                    l.prototype.push.call(this, {
                      data: d.data,
                      meta: {
                        currentFile: this.currentFile,
                        percent: g ? (b + 100 * (g - y - 1)) / g : 100,
                      },
                    }));
              }),
              (h.prototype.openedSource = function (d) {
                ((this.currentSourceOffset = this.bytesWritten), (this.currentFile = d.file.name));
                var b = this.streamFiles && !d.file.dir;
                if (b) {
                  var g = a(
                    d,
                    b,
                    !1,
                    this.currentSourceOffset,
                    this.zipPlatform,
                    this.encodeFileName,
                  );
                  this.push({ data: g.fileRecord, meta: { percent: 0 } });
                } else this.accumulate = !0;
              }),
              (h.prototype.closedSource = function (d) {
                this.accumulate = !1;
                var b = this.streamFiles && !d.file.dir,
                  g = a(d, b, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                if ((this.dirRecords.push(g.dirRecord), b))
                  this.push({
                    data: (function (y) {
                      return (
                        f.DATA_DESCRIPTOR +
                        r(y.crc32, 4) +
                        r(y.compressedSize, 4) +
                        r(y.uncompressedSize, 4)
                      );
                    })(d),
                    meta: { percent: 100 },
                  });
                else
                  for (
                    this.push({ data: g.fileRecord, meta: { percent: 0 } });
                    this.contentBuffer.length;
                  )
                    this.push(this.contentBuffer.shift());
                this.currentFile = null;
              }),
              (h.prototype.flush = function () {
                for (var d = this.bytesWritten, b = 0; b < this.dirRecords.length; b++)
                  this.push({ data: this.dirRecords[b], meta: { percent: 100 } });
                var g = this.bytesWritten - d,
                  y = (function (m, v, k, C, z) {
                    var L = s.transformTo("string", z(C));
                    return (
                      f.CENTRAL_DIRECTORY_END +
                      "\0\0\0\0" +
                      r(m, 2) +
                      r(m, 2) +
                      r(v, 4) +
                      r(k, 4) +
                      r(L.length, 2) +
                      L
                    );
                  })(this.dirRecords.length, g, d, this.zipComment, this.encodeFileName);
                this.push({ data: y, meta: { percent: 100 } });
              }),
              (h.prototype.prepareNextSource = function () {
                ((this.previous = this._sources.shift()),
                  this.openedSource(this.previous.streamInfo),
                  this.isPaused ? this.previous.pause() : this.previous.resume());
              }),
              (h.prototype.registerPrevious = function (d) {
                this._sources.push(d);
                var b = this;
                return (
                  d.on("data", function (g) {
                    b.processChunk(g);
                  }),
                  d.on("end", function () {
                    (b.closedSource(b.previous.streamInfo),
                      b._sources.length ? b.prepareNextSource() : b.end());
                  }),
                  d.on("error", function (g) {
                    b.error(g);
                  }),
                  this
                );
              }),
              (h.prototype.resume = function () {
                return (
                  !!l.prototype.resume.call(this) &&
                  (!this.previous && this._sources.length
                    ? (this.prepareNextSource(), !0)
                    : this.previous || this._sources.length || this.generatedError
                      ? void 0
                      : (this.end(), !0))
                );
              }),
              (h.prototype.error = function (d) {
                var b = this._sources;
                if (!l.prototype.error.call(this, d)) return !1;
                for (var g = 0; g < b.length; g++)
                  try {
                    b[g].error(d);
                  } catch {}
                return !0;
              }),
              (h.prototype.lock = function () {
                l.prototype.lock.call(this);
                for (var d = this._sources, b = 0; b < d.length; b++) d[b].lock();
              }),
              (i.exports = h));
          },
          {
            "../crc32": 4,
            "../signature": 23,
            "../stream/GenericWorker": 28,
            "../utf8": 31,
            "../utils": 32,
          },
        ],
        9: [
          function (e, i, o) {
            var r = e("../compressions"),
              a = e("./ZipFileWorker");
            o.generateWorker = function (s, l, c) {
              var u = new a(l.streamFiles, c, l.platform, l.encodeFileName),
                f = 0;
              try {
                (s.forEach(function (h, d) {
                  f++;
                  var b = (function (v, k) {
                      var C = v || k,
                        z = r[C];
                      if (!z) throw new Error(C + " is not a valid compression method !");
                      return z;
                    })(d.options.compression, l.compression),
                    g = d.options.compressionOptions || l.compressionOptions || {},
                    y = d.dir,
                    m = d.date;
                  d._compressWorker(b, g)
                    .withStreamInfo("file", {
                      name: h,
                      dir: y,
                      date: m,
                      comment: d.comment || "",
                      unixPermissions: d.unixPermissions,
                      dosPermissions: d.dosPermissions,
                    })
                    .pipe(u);
                }),
                  (u.entriesCount = f));
              } catch (h) {
                u.error(h);
              }
              return u;
            };
          },
          { "../compressions": 3, "./ZipFileWorker": 8 },
        ],
        10: [
          function (e, i, o) {
            function r() {
              if (!(this instanceof r)) return new r();
              if (arguments.length)
                throw new Error(
                  "The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.",
                );
              ((this.files = Object.create(null)),
                (this.comment = null),
                (this.root = ""),
                (this.clone = function () {
                  var a = new r();
                  for (var s in this) typeof this[s] != "function" && (a[s] = this[s]);
                  return a;
                }));
            }
            (((r.prototype = e("./object")).loadAsync = e("./load")),
              (r.support = e("./support")),
              (r.defaults = e("./defaults")),
              (r.version = "3.10.1"),
              (r.loadAsync = function (a, s) {
                return new r().loadAsync(a, s);
              }),
              (r.external = e("./external")),
              (i.exports = r));
          },
          { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 },
        ],
        11: [
          function (e, i, o) {
            var r = e("./utils"),
              a = e("./external"),
              s = e("./utf8"),
              l = e("./zipEntries"),
              c = e("./stream/Crc32Probe"),
              u = e("./nodejsUtils");
            function f(h) {
              return new a.Promise(function (d, b) {
                var g = h.decompressed.getContentWorker().pipe(new c());
                g.on("error", function (y) {
                  b(y);
                })
                  .on("end", function () {
                    g.streamInfo.crc32 !== h.decompressed.crc32
                      ? b(new Error("Corrupted zip : CRC32 mismatch"))
                      : d();
                  })
                  .resume();
              });
            }
            i.exports = function (h, d) {
              var b = this;
              return (
                (d = r.extend(d || {}, {
                  base64: !1,
                  checkCRC32: !1,
                  optimizedBinaryString: !1,
                  createFolders: !1,
                  decodeFileName: s.utf8decode,
                })),
                u.isNode && u.isStream(h)
                  ? a.Promise.reject(
                      new Error("JSZip can't accept a stream when loading a zip file."),
                    )
                  : r
                      .prepareContent(
                        "the loaded zip file",
                        h,
                        !0,
                        d.optimizedBinaryString,
                        d.base64,
                      )
                      .then(function (g) {
                        var y = new l(d);
                        return (y.load(g), y);
                      })
                      .then(function (g) {
                        var y = [a.Promise.resolve(g)],
                          m = g.files;
                        if (d.checkCRC32) for (var v = 0; v < m.length; v++) y.push(f(m[v]));
                        return a.Promise.all(y);
                      })
                      .then(function (g) {
                        for (var y = g.shift(), m = y.files, v = 0; v < m.length; v++) {
                          var k = m[v],
                            C = k.fileNameStr,
                            z = r.resolve(k.fileNameStr);
                          (b.file(z, k.decompressed, {
                            binary: !0,
                            optimizedBinaryString: !0,
                            date: k.date,
                            dir: k.dir,
                            comment: k.fileCommentStr.length ? k.fileCommentStr : null,
                            unixPermissions: k.unixPermissions,
                            dosPermissions: k.dosPermissions,
                            createFolders: d.createFolders,
                          }),
                            k.dir || (b.file(z).unsafeOriginalName = C));
                        }
                        return (y.zipComment.length && (b.comment = y.zipComment), b);
                      })
              );
            };
          },
          {
            "./external": 6,
            "./nodejsUtils": 14,
            "./stream/Crc32Probe": 25,
            "./utf8": 31,
            "./utils": 32,
            "./zipEntries": 33,
          },
        ],
        12: [
          function (e, i, o) {
            var r = e("../utils"),
              a = e("../stream/GenericWorker");
            function s(l, c) {
              (a.call(this, "Nodejs stream input adapter for " + l),
                (this._upstreamEnded = !1),
                this._bindStream(c));
            }
            (r.inherits(s, a),
              (s.prototype._bindStream = function (l) {
                var c = this;
                ((this._stream = l).pause(),
                  l
                    .on("data", function (u) {
                      c.push({ data: u, meta: { percent: 0 } });
                    })
                    .on("error", function (u) {
                      c.isPaused ? (this.generatedError = u) : c.error(u);
                    })
                    .on("end", function () {
                      c.isPaused ? (c._upstreamEnded = !0) : c.end();
                    }));
              }),
              (s.prototype.pause = function () {
                return !!a.prototype.pause.call(this) && (this._stream.pause(), !0);
              }),
              (s.prototype.resume = function () {
                return (
                  !!a.prototype.resume.call(this) &&
                  (this._upstreamEnded ? this.end() : this._stream.resume(), !0)
                );
              }),
              (i.exports = s));
          },
          { "../stream/GenericWorker": 28, "../utils": 32 },
        ],
        13: [
          function (e, i, o) {
            var r = e("readable-stream").Readable;
            function a(s, l, c) {
              (r.call(this, l), (this._helper = s));
              var u = this;
              s.on("data", function (f, h) {
                (u.push(f) || u._helper.pause(), c && c(h));
              })
                .on("error", function (f) {
                  u.emit("error", f);
                })
                .on("end", function () {
                  u.push(null);
                });
            }
            (e("../utils").inherits(a, r),
              (a.prototype._read = function () {
                this._helper.resume();
              }),
              (i.exports = a));
          },
          { "../utils": 32, "readable-stream": 16 },
        ],
        14: [
          function (e, i, o) {
            i.exports = {
              isNode: typeof Buffer < "u",
              newBufferFrom: function (r, a) {
                if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(r, a);
                if (typeof r == "number")
                  throw new Error('The "data" argument must not be a number');
                return new Buffer(r, a);
              },
              allocBuffer: function (r) {
                if (Buffer.alloc) return Buffer.alloc(r);
                var a = new Buffer(r);
                return (a.fill(0), a);
              },
              isBuffer: function (r) {
                return Buffer.isBuffer(r);
              },
              isStream: function (r) {
                return (
                  r &&
                  typeof r.on == "function" &&
                  typeof r.pause == "function" &&
                  typeof r.resume == "function"
                );
              },
            };
          },
          {},
        ],
        15: [
          function (e, i, o) {
            function r(z, L, A) {
              var O,
                $ = s.getTypeOf(L),
                x = s.extend(A || {}, u);
              ((x.date = x.date || new Date()),
                x.compression !== null && (x.compression = x.compression.toUpperCase()),
                typeof x.unixPermissions == "string" &&
                  (x.unixPermissions = parseInt(x.unixPermissions, 8)),
                x.unixPermissions && 16384 & x.unixPermissions && (x.dir = !0),
                x.dosPermissions && 16 & x.dosPermissions && (x.dir = !0),
                x.dir && (z = m(z)),
                x.createFolders && (O = y(z)) && v.call(this, O, !0));
              var P = $ === "string" && x.binary === !1 && x.base64 === !1;
              ((A && A.binary !== void 0) || (x.binary = !P),
                ((L instanceof f && L.uncompressedSize === 0) || x.dir || !L || L.length === 0) &&
                  ((x.base64 = !1),
                  (x.binary = !0),
                  (L = ""),
                  (x.compression = "STORE"),
                  ($ = "string")));
              var _ = null;
              _ =
                L instanceof f || L instanceof l
                  ? L
                  : b.isNode && b.isStream(L)
                    ? new g(z, L)
                    : s.prepareContent(z, L, x.binary, x.optimizedBinaryString, x.base64);
              var T = new h(z, _, x);
              this.files[z] = T;
            }
            var a = e("./utf8"),
              s = e("./utils"),
              l = e("./stream/GenericWorker"),
              c = e("./stream/StreamHelper"),
              u = e("./defaults"),
              f = e("./compressedObject"),
              h = e("./zipObject"),
              d = e("./generate"),
              b = e("./nodejsUtils"),
              g = e("./nodejs/NodejsStreamInputAdapter"),
              y = function (z) {
                z.slice(-1) === "/" && (z = z.substring(0, z.length - 1));
                var L = z.lastIndexOf("/");
                return 0 < L ? z.substring(0, L) : "";
              },
              m = function (z) {
                return (z.slice(-1) !== "/" && (z += "/"), z);
              },
              v = function (z, L) {
                return (
                  (L = L !== void 0 ? L : u.createFolders),
                  (z = m(z)),
                  this.files[z] || r.call(this, z, null, { dir: !0, createFolders: L }),
                  this.files[z]
                );
              };
            function k(z) {
              return Object.prototype.toString.call(z) === "[object RegExp]";
            }
            var C = {
              load: function () {
                throw new Error(
                  "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                );
              },
              forEach: function (z) {
                var L, A, O;
                for (L in this.files)
                  ((O = this.files[L]),
                    (A = L.slice(this.root.length, L.length)) &&
                      L.slice(0, this.root.length) === this.root &&
                      z(A, O));
              },
              filter: function (z) {
                var L = [];
                return (
                  this.forEach(function (A, O) {
                    z(A, O) && L.push(O);
                  }),
                  L
                );
              },
              file: function (z, L, A) {
                if (arguments.length !== 1)
                  return ((z = this.root + z), r.call(this, z, L, A), this);
                if (k(z)) {
                  var O = z;
                  return this.filter(function (x, P) {
                    return !P.dir && O.test(x);
                  });
                }
                var $ = this.files[this.root + z];
                return $ && !$.dir ? $ : null;
              },
              folder: function (z) {
                if (!z) return this;
                if (k(z))
                  return this.filter(function ($, x) {
                    return x.dir && z.test($);
                  });
                var L = this.root + z,
                  A = v.call(this, L),
                  O = this.clone();
                return ((O.root = A.name), O);
              },
              remove: function (z) {
                z = this.root + z;
                var L = this.files[z];
                if ((L || (z.slice(-1) !== "/" && (z += "/"), (L = this.files[z])), L && !L.dir))
                  delete this.files[z];
                else
                  for (
                    var A = this.filter(function ($, x) {
                        return x.name.slice(0, z.length) === z;
                      }),
                      O = 0;
                    O < A.length;
                    O++
                  )
                    delete this.files[A[O].name];
                return this;
              },
              generate: function () {
                throw new Error(
                  "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                );
              },
              generateInternalStream: function (z) {
                var L,
                  A = {};
                try {
                  if (
                    (((A = s.extend(z || {}, {
                      streamFiles: !1,
                      compression: "STORE",
                      compressionOptions: null,
                      type: "",
                      platform: "DOS",
                      comment: null,
                      mimeType: "application/zip",
                      encodeFileName: a.utf8encode,
                    })).type = A.type.toLowerCase()),
                    (A.compression = A.compression.toUpperCase()),
                    A.type === "binarystring" && (A.type = "string"),
                    !A.type)
                  )
                    throw new Error("No output type specified.");
                  (s.checkSupport(A.type),
                    (A.platform !== "darwin" &&
                      A.platform !== "freebsd" &&
                      A.platform !== "linux" &&
                      A.platform !== "sunos") ||
                      (A.platform = "UNIX"),
                    A.platform === "win32" && (A.platform = "DOS"));
                  var O = A.comment || this.comment || "";
                  L = d.generateWorker(this, A, O);
                } catch ($) {
                  (L = new l("error")).error($);
                }
                return new c(L, A.type || "string", A.mimeType);
              },
              generateAsync: function (z, L) {
                return this.generateInternalStream(z).accumulate(L);
              },
              generateNodeStream: function (z, L) {
                return (
                  (z = z || {}).type || (z.type = "nodebuffer"),
                  this.generateInternalStream(z).toNodejsStream(L)
                );
              },
            };
            i.exports = C;
          },
          {
            "./compressedObject": 2,
            "./defaults": 5,
            "./generate": 9,
            "./nodejs/NodejsStreamInputAdapter": 12,
            "./nodejsUtils": 14,
            "./stream/GenericWorker": 28,
            "./stream/StreamHelper": 29,
            "./utf8": 31,
            "./utils": 32,
            "./zipObject": 35,
          },
        ],
        16: [
          function (e, i, o) {
            i.exports = e("stream");
          },
          { stream: void 0 },
        ],
        17: [
          function (e, i, o) {
            var r = e("./DataReader");
            function a(s) {
              r.call(this, s);
              for (var l = 0; l < this.data.length; l++) s[l] = 255 & s[l];
            }
            (e("../utils").inherits(a, r),
              (a.prototype.byteAt = function (s) {
                return this.data[this.zero + s];
              }),
              (a.prototype.lastIndexOfSignature = function (s) {
                for (
                  var l = s.charCodeAt(0),
                    c = s.charCodeAt(1),
                    u = s.charCodeAt(2),
                    f = s.charCodeAt(3),
                    h = this.length - 4;
                  0 <= h;
                  --h
                )
                  if (
                    this.data[h] === l &&
                    this.data[h + 1] === c &&
                    this.data[h + 2] === u &&
                    this.data[h + 3] === f
                  )
                    return h - this.zero;
                return -1;
              }),
              (a.prototype.readAndCheckSignature = function (s) {
                var l = s.charCodeAt(0),
                  c = s.charCodeAt(1),
                  u = s.charCodeAt(2),
                  f = s.charCodeAt(3),
                  h = this.readData(4);
                return l === h[0] && c === h[1] && u === h[2] && f === h[3];
              }),
              (a.prototype.readData = function (s) {
                if ((this.checkOffset(s), s === 0)) return [];
                var l = this.data.slice(this.zero + this.index, this.zero + this.index + s);
                return ((this.index += s), l);
              }),
              (i.exports = a));
          },
          { "../utils": 32, "./DataReader": 18 },
        ],
        18: [
          function (e, i, o) {
            var r = e("../utils");
            function a(s) {
              ((this.data = s), (this.length = s.length), (this.index = 0), (this.zero = 0));
            }
            ((a.prototype = {
              checkOffset: function (s) {
                this.checkIndex(this.index + s);
              },
              checkIndex: function (s) {
                if (this.length < this.zero + s || s < 0)
                  throw new Error(
                    "End of data reached (data length = " +
                      this.length +
                      ", asked index = " +
                      s +
                      "). Corrupted zip ?",
                  );
              },
              setIndex: function (s) {
                (this.checkIndex(s), (this.index = s));
              },
              skip: function (s) {
                this.setIndex(this.index + s);
              },
              byteAt: function () {},
              readInt: function (s) {
                var l,
                  c = 0;
                for (this.checkOffset(s), l = this.index + s - 1; l >= this.index; l--)
                  c = (c << 8) + this.byteAt(l);
                return ((this.index += s), c);
              },
              readString: function (s) {
                return r.transformTo("string", this.readData(s));
              },
              readData: function () {},
              lastIndexOfSignature: function () {},
              readAndCheckSignature: function () {},
              readDate: function () {
                var s = this.readInt(4);
                return new Date(
                  Date.UTC(
                    1980 + ((s >> 25) & 127),
                    ((s >> 21) & 15) - 1,
                    (s >> 16) & 31,
                    (s >> 11) & 31,
                    (s >> 5) & 63,
                    (31 & s) << 1,
                  ),
                );
              },
            }),
              (i.exports = a));
          },
          { "../utils": 32 },
        ],
        19: [
          function (e, i, o) {
            var r = e("./Uint8ArrayReader");
            function a(s) {
              r.call(this, s);
            }
            (e("../utils").inherits(a, r),
              (a.prototype.readData = function (s) {
                this.checkOffset(s);
                var l = this.data.slice(this.zero + this.index, this.zero + this.index + s);
                return ((this.index += s), l);
              }),
              (i.exports = a));
          },
          { "../utils": 32, "./Uint8ArrayReader": 21 },
        ],
        20: [
          function (e, i, o) {
            var r = e("./DataReader");
            function a(s) {
              r.call(this, s);
            }
            (e("../utils").inherits(a, r),
              (a.prototype.byteAt = function (s) {
                return this.data.charCodeAt(this.zero + s);
              }),
              (a.prototype.lastIndexOfSignature = function (s) {
                return this.data.lastIndexOf(s) - this.zero;
              }),
              (a.prototype.readAndCheckSignature = function (s) {
                return s === this.readData(4);
              }),
              (a.prototype.readData = function (s) {
                this.checkOffset(s);
                var l = this.data.slice(this.zero + this.index, this.zero + this.index + s);
                return ((this.index += s), l);
              }),
              (i.exports = a));
          },
          { "../utils": 32, "./DataReader": 18 },
        ],
        21: [
          function (e, i, o) {
            var r = e("./ArrayReader");
            function a(s) {
              r.call(this, s);
            }
            (e("../utils").inherits(a, r),
              (a.prototype.readData = function (s) {
                if ((this.checkOffset(s), s === 0)) return new Uint8Array(0);
                var l = this.data.subarray(this.zero + this.index, this.zero + this.index + s);
                return ((this.index += s), l);
              }),
              (i.exports = a));
          },
          { "../utils": 32, "./ArrayReader": 17 },
        ],
        22: [
          function (e, i, o) {
            var r = e("../utils"),
              a = e("../support"),
              s = e("./ArrayReader"),
              l = e("./StringReader"),
              c = e("./NodeBufferReader"),
              u = e("./Uint8ArrayReader");
            i.exports = function (f) {
              var h = r.getTypeOf(f);
              return (
                r.checkSupport(h),
                h !== "string" || a.uint8array
                  ? h === "nodebuffer"
                    ? new c(f)
                    : a.uint8array
                      ? new u(r.transformTo("uint8array", f))
                      : new s(r.transformTo("array", f))
                  : new l(f)
              );
            };
          },
          {
            "../support": 30,
            "../utils": 32,
            "./ArrayReader": 17,
            "./NodeBufferReader": 19,
            "./StringReader": 20,
            "./Uint8ArrayReader": 21,
          },
        ],
        23: [
          function (e, i, o) {
            ((o.LOCAL_FILE_HEADER = "PK"),
              (o.CENTRAL_FILE_HEADER = "PK"),
              (o.CENTRAL_DIRECTORY_END = "PK"),
              (o.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07"),
              (o.ZIP64_CENTRAL_DIRECTORY_END = "PK"),
              (o.DATA_DESCRIPTOR = "PK\x07\b"));
          },
          {},
        ],
        24: [
          function (e, i, o) {
            var r = e("./GenericWorker"),
              a = e("../utils");
            function s(l) {
              (r.call(this, "ConvertWorker to " + l), (this.destType = l));
            }
            (a.inherits(s, r),
              (s.prototype.processChunk = function (l) {
                this.push({ data: a.transformTo(this.destType, l.data), meta: l.meta });
              }),
              (i.exports = s));
          },
          { "../utils": 32, "./GenericWorker": 28 },
        ],
        25: [
          function (e, i, o) {
            var r = e("./GenericWorker"),
              a = e("../crc32");
            function s() {
              (r.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0));
            }
            (e("../utils").inherits(s, r),
              (s.prototype.processChunk = function (l) {
                ((this.streamInfo.crc32 = a(l.data, this.streamInfo.crc32 || 0)), this.push(l));
              }),
              (i.exports = s));
          },
          { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 },
        ],
        26: [
          function (e, i, o) {
            var r = e("../utils"),
              a = e("./GenericWorker");
            function s(l) {
              (a.call(this, "DataLengthProbe for " + l),
                (this.propName = l),
                this.withStreamInfo(l, 0));
            }
            (r.inherits(s, a),
              (s.prototype.processChunk = function (l) {
                if (l) {
                  var c = this.streamInfo[this.propName] || 0;
                  this.streamInfo[this.propName] = c + l.data.length;
                }
                a.prototype.processChunk.call(this, l);
              }),
              (i.exports = s));
          },
          { "../utils": 32, "./GenericWorker": 28 },
        ],
        27: [
          function (e, i, o) {
            var r = e("../utils"),
              a = e("./GenericWorker");
            function s(l) {
              a.call(this, "DataWorker");
              var c = this;
              ((this.dataIsReady = !1),
                (this.index = 0),
                (this.max = 0),
                (this.data = null),
                (this.type = ""),
                (this._tickScheduled = !1),
                l.then(
                  function (u) {
                    ((c.dataIsReady = !0),
                      (c.data = u),
                      (c.max = (u && u.length) || 0),
                      (c.type = r.getTypeOf(u)),
                      c.isPaused || c._tickAndRepeat());
                  },
                  function (u) {
                    c.error(u);
                  },
                ));
            }
            (r.inherits(s, a),
              (s.prototype.cleanUp = function () {
                (a.prototype.cleanUp.call(this), (this.data = null));
              }),
              (s.prototype.resume = function () {
                return (
                  !!a.prototype.resume.call(this) &&
                  (!this._tickScheduled &&
                    this.dataIsReady &&
                    ((this._tickScheduled = !0), r.delay(this._tickAndRepeat, [], this)),
                  !0)
                );
              }),
              (s.prototype._tickAndRepeat = function () {
                ((this._tickScheduled = !1),
                  this.isPaused ||
                    this.isFinished ||
                    (this._tick(),
                    this.isFinished ||
                      (r.delay(this._tickAndRepeat, [], this), (this._tickScheduled = !0))));
              }),
              (s.prototype._tick = function () {
                if (this.isPaused || this.isFinished) return !1;
                var l = null,
                  c = Math.min(this.max, this.index + 16384);
                if (this.index >= this.max) return this.end();
                switch (this.type) {
                  case "string":
                    l = this.data.substring(this.index, c);
                    break;
                  case "uint8array":
                    l = this.data.subarray(this.index, c);
                    break;
                  case "array":
                  case "nodebuffer":
                    l = this.data.slice(this.index, c);
                }
                return (
                  (this.index = c),
                  this.push({
                    data: l,
                    meta: { percent: this.max ? (this.index / this.max) * 100 : 0 },
                  })
                );
              }),
              (i.exports = s));
          },
          { "../utils": 32, "./GenericWorker": 28 },
        ],
        28: [
          function (e, i, o) {
            function r(a) {
              ((this.name = a || "default"),
                (this.streamInfo = {}),
                (this.generatedError = null),
                (this.extraStreamInfo = {}),
                (this.isPaused = !0),
                (this.isFinished = !1),
                (this.isLocked = !1),
                (this._listeners = { data: [], end: [], error: [] }),
                (this.previous = null));
            }
            ((r.prototype = {
              push: function (a) {
                this.emit("data", a);
              },
              end: function () {
                if (this.isFinished) return !1;
                this.flush();
                try {
                  (this.emit("end"), this.cleanUp(), (this.isFinished = !0));
                } catch (a) {
                  this.emit("error", a);
                }
                return !0;
              },
              error: function (a) {
                return (
                  !this.isFinished &&
                  (this.isPaused
                    ? (this.generatedError = a)
                    : ((this.isFinished = !0),
                      this.emit("error", a),
                      this.previous && this.previous.error(a),
                      this.cleanUp()),
                  !0)
                );
              },
              on: function (a, s) {
                return (this._listeners[a].push(s), this);
              },
              cleanUp: function () {
                ((this.streamInfo = this.generatedError = this.extraStreamInfo = null),
                  (this._listeners = []));
              },
              emit: function (a, s) {
                if (this._listeners[a])
                  for (var l = 0; l < this._listeners[a].length; l++)
                    this._listeners[a][l].call(this, s);
              },
              pipe: function (a) {
                return a.registerPrevious(this);
              },
              registerPrevious: function (a) {
                if (this.isLocked)
                  throw new Error("The stream '" + this + "' has already been used.");
                ((this.streamInfo = a.streamInfo), this.mergeStreamInfo(), (this.previous = a));
                var s = this;
                return (
                  a.on("data", function (l) {
                    s.processChunk(l);
                  }),
                  a.on("end", function () {
                    s.end();
                  }),
                  a.on("error", function (l) {
                    s.error(l);
                  }),
                  this
                );
              },
              pause: function () {
                return (
                  !this.isPaused &&
                  !this.isFinished &&
                  ((this.isPaused = !0), this.previous && this.previous.pause(), !0)
                );
              },
              resume: function () {
                if (!this.isPaused || this.isFinished) return !1;
                var a = (this.isPaused = !1);
                return (
                  this.generatedError && (this.error(this.generatedError), (a = !0)),
                  this.previous && this.previous.resume(),
                  !a
                );
              },
              flush: function () {},
              processChunk: function (a) {
                this.push(a);
              },
              withStreamInfo: function (a, s) {
                return ((this.extraStreamInfo[a] = s), this.mergeStreamInfo(), this);
              },
              mergeStreamInfo: function () {
                for (var a in this.extraStreamInfo)
                  Object.prototype.hasOwnProperty.call(this.extraStreamInfo, a) &&
                    (this.streamInfo[a] = this.extraStreamInfo[a]);
              },
              lock: function () {
                if (this.isLocked)
                  throw new Error("The stream '" + this + "' has already been used.");
                ((this.isLocked = !0), this.previous && this.previous.lock());
              },
              toString: function () {
                var a = "Worker " + this.name;
                return this.previous ? this.previous + " -> " + a : a;
              },
            }),
              (i.exports = r));
          },
          {},
        ],
        29: [
          function (e, i, o) {
            var r = e("../utils"),
              a = e("./ConvertWorker"),
              s = e("./GenericWorker"),
              l = e("../base64"),
              c = e("../support"),
              u = e("../external"),
              f = null;
            if (c.nodestream)
              try {
                f = e("../nodejs/NodejsStreamOutputAdapter");
              } catch {}
            function h(b, g) {
              return new u.Promise(function (y, m) {
                var v = [],
                  k = b._internalType,
                  C = b._outputType,
                  z = b._mimeType;
                b.on("data", function (L, A) {
                  (v.push(L), g && g(A));
                })
                  .on("error", function (L) {
                    ((v = []), m(L));
                  })
                  .on("end", function () {
                    try {
                      var L = (function (A, O, $) {
                        switch (A) {
                          case "blob":
                            return r.newBlob(r.transformTo("arraybuffer", O), $);
                          case "base64":
                            return l.encode(O);
                          default:
                            return r.transformTo(A, O);
                        }
                      })(
                        C,
                        (function (A, O) {
                          var $,
                            x = 0,
                            P = null,
                            _ = 0;
                          for ($ = 0; $ < O.length; $++) _ += O[$].length;
                          switch (A) {
                            case "string":
                              return O.join("");
                            case "array":
                              return Array.prototype.concat.apply([], O);
                            case "uint8array":
                              for (P = new Uint8Array(_), $ = 0; $ < O.length; $++)
                                (P.set(O[$], x), (x += O[$].length));
                              return P;
                            case "nodebuffer":
                              return Buffer.concat(O);
                            default:
                              throw new Error("concat : unsupported type '" + A + "'");
                          }
                        })(k, v),
                        z,
                      );
                      y(L);
                    } catch (A) {
                      m(A);
                    }
                    v = [];
                  })
                  .resume();
              });
            }
            function d(b, g, y) {
              var m = g;
              switch (g) {
                case "blob":
                case "arraybuffer":
                  m = "uint8array";
                  break;
                case "base64":
                  m = "string";
              }
              try {
                ((this._internalType = m),
                  (this._outputType = g),
                  (this._mimeType = y),
                  r.checkSupport(m),
                  (this._worker = b.pipe(new a(m))),
                  b.lock());
              } catch (v) {
                ((this._worker = new s("error")), this._worker.error(v));
              }
            }
            ((d.prototype = {
              accumulate: function (b) {
                return h(this, b);
              },
              on: function (b, g) {
                var y = this;
                return (
                  b === "data"
                    ? this._worker.on(b, function (m) {
                        g.call(y, m.data, m.meta);
                      })
                    : this._worker.on(b, function () {
                        r.delay(g, arguments, y);
                      }),
                  this
                );
              },
              resume: function () {
                return (r.delay(this._worker.resume, [], this._worker), this);
              },
              pause: function () {
                return (this._worker.pause(), this);
              },
              toNodejsStream: function (b) {
                if ((r.checkSupport("nodestream"), this._outputType !== "nodebuffer"))
                  throw new Error(this._outputType + " is not supported by this method");
                return new f(this, { objectMode: this._outputType !== "nodebuffer" }, b);
              },
            }),
              (i.exports = d));
          },
          {
            "../base64": 1,
            "../external": 6,
            "../nodejs/NodejsStreamOutputAdapter": 13,
            "../support": 30,
            "../utils": 32,
            "./ConvertWorker": 24,
            "./GenericWorker": 28,
          },
        ],
        30: [
          function (e, i, o) {
            if (
              ((o.base64 = !0),
              (o.array = !0),
              (o.string = !0),
              (o.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u"),
              (o.nodebuffer = typeof Buffer < "u"),
              (o.uint8array = typeof Uint8Array < "u"),
              typeof ArrayBuffer > "u")
            )
              o.blob = !1;
            else {
              var r = new ArrayBuffer(0);
              try {
                o.blob = new Blob([r], { type: "application/zip" }).size === 0;
              } catch {
                try {
                  var a = new (
                    self.BlobBuilder ||
                    self.WebKitBlobBuilder ||
                    self.MozBlobBuilder ||
                    self.MSBlobBuilder
                  )();
                  (a.append(r), (o.blob = a.getBlob("application/zip").size === 0));
                } catch {
                  o.blob = !1;
                }
              }
            }
            try {
              o.nodestream = !!e("readable-stream").Readable;
            } catch {
              o.nodestream = !1;
            }
          },
          { "readable-stream": 16 },
        ],
        31: [
          function (e, i, o) {
            for (
              var r = e("./utils"),
                a = e("./support"),
                s = e("./nodejsUtils"),
                l = e("./stream/GenericWorker"),
                c = new Array(256),
                u = 0;
              u < 256;
              u++
            )
              c[u] = 252 <= u ? 6 : 248 <= u ? 5 : 240 <= u ? 4 : 224 <= u ? 3 : 192 <= u ? 2 : 1;
            c[254] = c[254] = 1;
            function f() {
              (l.call(this, "utf-8 decode"), (this.leftOver = null));
            }
            function h() {
              l.call(this, "utf-8 encode");
            }
            ((o.utf8encode = function (d) {
              return a.nodebuffer
                ? s.newBufferFrom(d, "utf-8")
                : (function (b) {
                    var g,
                      y,
                      m,
                      v,
                      k,
                      C = b.length,
                      z = 0;
                    for (v = 0; v < C; v++)
                      ((64512 & (y = b.charCodeAt(v))) == 55296 &&
                        v + 1 < C &&
                        (64512 & (m = b.charCodeAt(v + 1))) == 56320 &&
                        ((y = 65536 + ((y - 55296) << 10) + (m - 56320)), v++),
                        (z += y < 128 ? 1 : y < 2048 ? 2 : y < 65536 ? 3 : 4));
                    for (g = a.uint8array ? new Uint8Array(z) : new Array(z), v = k = 0; k < z; v++)
                      ((64512 & (y = b.charCodeAt(v))) == 55296 &&
                        v + 1 < C &&
                        (64512 & (m = b.charCodeAt(v + 1))) == 56320 &&
                        ((y = 65536 + ((y - 55296) << 10) + (m - 56320)), v++),
                        y < 128
                          ? (g[k++] = y)
                          : (y < 2048
                              ? (g[k++] = 192 | (y >>> 6))
                              : (y < 65536
                                  ? (g[k++] = 224 | (y >>> 12))
                                  : ((g[k++] = 240 | (y >>> 18)),
                                    (g[k++] = 128 | ((y >>> 12) & 63))),
                                (g[k++] = 128 | ((y >>> 6) & 63))),
                            (g[k++] = 128 | (63 & y))));
                    return g;
                  })(d);
            }),
              (o.utf8decode = function (d) {
                return a.nodebuffer
                  ? r.transformTo("nodebuffer", d).toString("utf-8")
                  : (function (b) {
                      var g,
                        y,
                        m,
                        v,
                        k = b.length,
                        C = new Array(2 * k);
                      for (g = y = 0; g < k; )
                        if ((m = b[g++]) < 128) C[y++] = m;
                        else if (4 < (v = c[m])) ((C[y++] = 65533), (g += v - 1));
                        else {
                          for (m &= v === 2 ? 31 : v === 3 ? 15 : 7; 1 < v && g < k; )
                            ((m = (m << 6) | (63 & b[g++])), v--);
                          1 < v
                            ? (C[y++] = 65533)
                            : m < 65536
                              ? (C[y++] = m)
                              : ((m -= 65536),
                                (C[y++] = 55296 | ((m >> 10) & 1023)),
                                (C[y++] = 56320 | (1023 & m)));
                        }
                      return (
                        C.length !== y && (C.subarray ? (C = C.subarray(0, y)) : (C.length = y)),
                        r.applyFromCharCode(C)
                      );
                    })((d = r.transformTo(a.uint8array ? "uint8array" : "array", d)));
              }),
              r.inherits(f, l),
              (f.prototype.processChunk = function (d) {
                var b = r.transformTo(a.uint8array ? "uint8array" : "array", d.data);
                if (this.leftOver && this.leftOver.length) {
                  if (a.uint8array) {
                    var g = b;
                    ((b = new Uint8Array(g.length + this.leftOver.length)).set(this.leftOver, 0),
                      b.set(g, this.leftOver.length));
                  } else b = this.leftOver.concat(b);
                  this.leftOver = null;
                }
                var y = (function (v, k) {
                    var C;
                    for (
                      (k = k || v.length) > v.length && (k = v.length), C = k - 1;
                      0 <= C && (192 & v[C]) == 128;
                    )
                      C--;
                    return C < 0 || C === 0 ? k : C + c[v[C]] > k ? C : k;
                  })(b),
                  m = b;
                (y !== b.length &&
                  (a.uint8array
                    ? ((m = b.subarray(0, y)), (this.leftOver = b.subarray(y, b.length)))
                    : ((m = b.slice(0, y)), (this.leftOver = b.slice(y, b.length)))),
                  this.push({ data: o.utf8decode(m), meta: d.meta }));
              }),
              (f.prototype.flush = function () {
                this.leftOver &&
                  this.leftOver.length &&
                  (this.push({ data: o.utf8decode(this.leftOver), meta: {} }),
                  (this.leftOver = null));
              }),
              (o.Utf8DecodeWorker = f),
              r.inherits(h, l),
              (h.prototype.processChunk = function (d) {
                this.push({ data: o.utf8encode(d.data), meta: d.meta });
              }),
              (o.Utf8EncodeWorker = h));
          },
          { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 },
        ],
        32: [
          function (e, i, o) {
            var r = e("./support"),
              a = e("./base64"),
              s = e("./nodejsUtils"),
              l = e("./external");
            function c(g) {
              return g;
            }
            function u(g, y) {
              for (var m = 0; m < g.length; ++m) y[m] = 255 & g.charCodeAt(m);
              return y;
            }
            (e("setimmediate"),
              (o.newBlob = function (g, y) {
                o.checkSupport("blob");
                try {
                  return new Blob([g], { type: y });
                } catch {
                  try {
                    var m = new (
                      self.BlobBuilder ||
                      self.WebKitBlobBuilder ||
                      self.MozBlobBuilder ||
                      self.MSBlobBuilder
                    )();
                    return (m.append(g), m.getBlob(y));
                  } catch {
                    throw new Error("Bug : can't construct the Blob.");
                  }
                }
              }));
            var f = {
              stringifyByChunk: function (g, y, m) {
                var v = [],
                  k = 0,
                  C = g.length;
                if (C <= m) return String.fromCharCode.apply(null, g);
                for (; k < C; )
                  (y === "array" || y === "nodebuffer"
                    ? v.push(String.fromCharCode.apply(null, g.slice(k, Math.min(k + m, C))))
                    : v.push(String.fromCharCode.apply(null, g.subarray(k, Math.min(k + m, C)))),
                    (k += m));
                return v.join("");
              },
              stringifyByChar: function (g) {
                for (var y = "", m = 0; m < g.length; m++) y += String.fromCharCode(g[m]);
                return y;
              },
              applyCanBeUsed: {
                uint8array: (function () {
                  try {
                    return (
                      r.uint8array &&
                      String.fromCharCode.apply(null, new Uint8Array(1)).length === 1
                    );
                  } catch {
                    return !1;
                  }
                })(),
                nodebuffer: (function () {
                  try {
                    return (
                      r.nodebuffer && String.fromCharCode.apply(null, s.allocBuffer(1)).length === 1
                    );
                  } catch {
                    return !1;
                  }
                })(),
              },
            };
            function h(g) {
              var y = 65536,
                m = o.getTypeOf(g),
                v = !0;
              if (
                (m === "uint8array"
                  ? (v = f.applyCanBeUsed.uint8array)
                  : m === "nodebuffer" && (v = f.applyCanBeUsed.nodebuffer),
                v)
              )
                for (; 1 < y; )
                  try {
                    return f.stringifyByChunk(g, m, y);
                  } catch {
                    y = Math.floor(y / 2);
                  }
              return f.stringifyByChar(g);
            }
            function d(g, y) {
              for (var m = 0; m < g.length; m++) y[m] = g[m];
              return y;
            }
            o.applyFromCharCode = h;
            var b = {};
            ((b.string = {
              string: c,
              array: function (g) {
                return u(g, new Array(g.length));
              },
              arraybuffer: function (g) {
                return b.string.uint8array(g).buffer;
              },
              uint8array: function (g) {
                return u(g, new Uint8Array(g.length));
              },
              nodebuffer: function (g) {
                return u(g, s.allocBuffer(g.length));
              },
            }),
              (b.array = {
                string: h,
                array: c,
                arraybuffer: function (g) {
                  return new Uint8Array(g).buffer;
                },
                uint8array: function (g) {
                  return new Uint8Array(g);
                },
                nodebuffer: function (g) {
                  return s.newBufferFrom(g);
                },
              }),
              (b.arraybuffer = {
                string: function (g) {
                  return h(new Uint8Array(g));
                },
                array: function (g) {
                  return d(new Uint8Array(g), new Array(g.byteLength));
                },
                arraybuffer: c,
                uint8array: function (g) {
                  return new Uint8Array(g);
                },
                nodebuffer: function (g) {
                  return s.newBufferFrom(new Uint8Array(g));
                },
              }),
              (b.uint8array = {
                string: h,
                array: function (g) {
                  return d(g, new Array(g.length));
                },
                arraybuffer: function (g) {
                  return g.buffer;
                },
                uint8array: c,
                nodebuffer: function (g) {
                  return s.newBufferFrom(g);
                },
              }),
              (b.nodebuffer = {
                string: h,
                array: function (g) {
                  return d(g, new Array(g.length));
                },
                arraybuffer: function (g) {
                  return b.nodebuffer.uint8array(g).buffer;
                },
                uint8array: function (g) {
                  return d(g, new Uint8Array(g.length));
                },
                nodebuffer: c,
              }),
              (o.transformTo = function (g, y) {
                if (((y = y || ""), !g)) return y;
                o.checkSupport(g);
                var m = o.getTypeOf(y);
                return b[m][g](y);
              }),
              (o.resolve = function (g) {
                for (var y = g.split("/"), m = [], v = 0; v < y.length; v++) {
                  var k = y[v];
                  k === "." ||
                    (k === "" && v !== 0 && v !== y.length - 1) ||
                    (k === ".." ? m.pop() : m.push(k));
                }
                return m.join("/");
              }),
              (o.getTypeOf = function (g) {
                return typeof g == "string"
                  ? "string"
                  : Object.prototype.toString.call(g) === "[object Array]"
                    ? "array"
                    : r.nodebuffer && s.isBuffer(g)
                      ? "nodebuffer"
                      : r.uint8array && g instanceof Uint8Array
                        ? "uint8array"
                        : r.arraybuffer && g instanceof ArrayBuffer
                          ? "arraybuffer"
                          : void 0;
              }),
              (o.checkSupport = function (g) {
                if (!r[g.toLowerCase()]) throw new Error(g + " is not supported by this platform");
              }),
              (o.MAX_VALUE_16BITS = 65535),
              (o.MAX_VALUE_32BITS = -1),
              (o.pretty = function (g) {
                var y,
                  m,
                  v = "";
                for (m = 0; m < (g || "").length; m++)
                  v +=
                    "\\x" + ((y = g.charCodeAt(m)) < 16 ? "0" : "") + y.toString(16).toUpperCase();
                return v;
              }),
              (o.delay = function (g, y, m) {
                setImmediate(function () {
                  g.apply(m || null, y || []);
                });
              }),
              (o.inherits = function (g, y) {
                function m() {}
                ((m.prototype = y.prototype), (g.prototype = new m()));
              }),
              (o.extend = function () {
                var g,
                  y,
                  m = {};
                for (g = 0; g < arguments.length; g++)
                  for (y in arguments[g])
                    Object.prototype.hasOwnProperty.call(arguments[g], y) &&
                      m[y] === void 0 &&
                      (m[y] = arguments[g][y]);
                return m;
              }),
              (o.prepareContent = function (g, y, m, v, k) {
                return l.Promise.resolve(y)
                  .then(function (C) {
                    return r.blob &&
                      (C instanceof Blob ||
                        ["[object File]", "[object Blob]"].indexOf(
                          Object.prototype.toString.call(C),
                        ) !== -1) &&
                      typeof FileReader < "u"
                      ? new l.Promise(function (z, L) {
                          var A = new FileReader();
                          ((A.onload = function (O) {
                            z(O.target.result);
                          }),
                            (A.onerror = function (O) {
                              L(O.target.error);
                            }),
                            A.readAsArrayBuffer(C));
                        })
                      : C;
                  })
                  .then(function (C) {
                    var z = o.getTypeOf(C);
                    return z
                      ? (z === "arraybuffer"
                          ? (C = o.transformTo("uint8array", C))
                          : z === "string" &&
                            (k
                              ? (C = a.decode(C))
                              : m &&
                                v !== !0 &&
                                (C = (function (L) {
                                  return u(
                                    L,
                                    r.uint8array ? new Uint8Array(L.length) : new Array(L.length),
                                  );
                                })(C))),
                        C)
                      : l.Promise.reject(
                          new Error(
                            "Can't read the data of '" +
                              g +
                              "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?",
                          ),
                        );
                  });
              }));
          },
          {
            "./base64": 1,
            "./external": 6,
            "./nodejsUtils": 14,
            "./support": 30,
            setimmediate: 54,
          },
        ],
        33: [
          function (e, i, o) {
            var r = e("./reader/readerFor"),
              a = e("./utils"),
              s = e("./signature"),
              l = e("./zipEntry"),
              c = e("./support");
            function u(f) {
              ((this.files = []), (this.loadOptions = f));
            }
            ((u.prototype = {
              checkSignature: function (f) {
                if (!this.reader.readAndCheckSignature(f)) {
                  this.reader.index -= 4;
                  var h = this.reader.readString(4);
                  throw new Error(
                    "Corrupted zip or bug: unexpected signature (" +
                      a.pretty(h) +
                      ", expected " +
                      a.pretty(f) +
                      ")",
                  );
                }
              },
              isSignature: function (f, h) {
                var d = this.reader.index;
                this.reader.setIndex(f);
                var b = this.reader.readString(4) === h;
                return (this.reader.setIndex(d), b);
              },
              readBlockEndOfCentral: function () {
                ((this.diskNumber = this.reader.readInt(2)),
                  (this.diskWithCentralDirStart = this.reader.readInt(2)),
                  (this.centralDirRecordsOnThisDisk = this.reader.readInt(2)),
                  (this.centralDirRecords = this.reader.readInt(2)),
                  (this.centralDirSize = this.reader.readInt(4)),
                  (this.centralDirOffset = this.reader.readInt(4)),
                  (this.zipCommentLength = this.reader.readInt(2)));
                var f = this.reader.readData(this.zipCommentLength),
                  h = c.uint8array ? "uint8array" : "array",
                  d = a.transformTo(h, f);
                this.zipComment = this.loadOptions.decodeFileName(d);
              },
              readBlockZip64EndOfCentral: function () {
                ((this.zip64EndOfCentralSize = this.reader.readInt(8)),
                  this.reader.skip(4),
                  (this.diskNumber = this.reader.readInt(4)),
                  (this.diskWithCentralDirStart = this.reader.readInt(4)),
                  (this.centralDirRecordsOnThisDisk = this.reader.readInt(8)),
                  (this.centralDirRecords = this.reader.readInt(8)),
                  (this.centralDirSize = this.reader.readInt(8)),
                  (this.centralDirOffset = this.reader.readInt(8)),
                  (this.zip64ExtensibleData = {}));
                for (var f, h, d, b = this.zip64EndOfCentralSize - 44; 0 < b; )
                  ((f = this.reader.readInt(2)),
                    (h = this.reader.readInt(4)),
                    (d = this.reader.readData(h)),
                    (this.zip64ExtensibleData[f] = { id: f, length: h, value: d }));
              },
              readBlockZip64EndOfCentralLocator: function () {
                if (
                  ((this.diskWithZip64CentralDirStart = this.reader.readInt(4)),
                  (this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8)),
                  (this.disksCount = this.reader.readInt(4)),
                  1 < this.disksCount)
                )
                  throw new Error("Multi-volumes zip are not supported");
              },
              readLocalFiles: function () {
                var f, h;
                for (f = 0; f < this.files.length; f++)
                  ((h = this.files[f]),
                    this.reader.setIndex(h.localHeaderOffset),
                    this.checkSignature(s.LOCAL_FILE_HEADER),
                    h.readLocalPart(this.reader),
                    h.handleUTF8(),
                    h.processAttributes());
              },
              readCentralDir: function () {
                var f;
                for (
                  this.reader.setIndex(this.centralDirOffset);
                  this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);
                )
                  ((f = new l({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(
                    this.reader,
                  ),
                    this.files.push(f));
                if (
                  this.centralDirRecords !== this.files.length &&
                  this.centralDirRecords !== 0 &&
                  this.files.length === 0
                )
                  throw new Error(
                    "Corrupted zip or bug: expected " +
                      this.centralDirRecords +
                      " records in central dir, got " +
                      this.files.length,
                  );
              },
              readEndOfCentral: function () {
                var f = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
                if (f < 0)
                  throw this.isSignature(0, s.LOCAL_FILE_HEADER)
                    ? new Error("Corrupted zip: can't find end of central directory")
                    : new Error(
                        "Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html",
                      );
                this.reader.setIndex(f);
                var h = f;
                if (
                  (this.checkSignature(s.CENTRAL_DIRECTORY_END),
                  this.readBlockEndOfCentral(),
                  this.diskNumber === a.MAX_VALUE_16BITS ||
                    this.diskWithCentralDirStart === a.MAX_VALUE_16BITS ||
                    this.centralDirRecordsOnThisDisk === a.MAX_VALUE_16BITS ||
                    this.centralDirRecords === a.MAX_VALUE_16BITS ||
                    this.centralDirSize === a.MAX_VALUE_32BITS ||
                    this.centralDirOffset === a.MAX_VALUE_32BITS)
                ) {
                  if (
                    ((this.zip64 = !0),
                    (f = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0)
                  )
                    throw new Error(
                      "Corrupted zip: can't find the ZIP64 end of central directory locator",
                    );
                  if (
                    (this.reader.setIndex(f),
                    this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),
                    this.readBlockZip64EndOfCentralLocator(),
                    !this.isSignature(
                      this.relativeOffsetEndOfZip64CentralDir,
                      s.ZIP64_CENTRAL_DIRECTORY_END,
                    ) &&
                      ((this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(
                        s.ZIP64_CENTRAL_DIRECTORY_END,
                      )),
                      this.relativeOffsetEndOfZip64CentralDir < 0))
                  )
                    throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
                  (this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),
                    this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),
                    this.readBlockZip64EndOfCentral());
                }
                var d = this.centralDirOffset + this.centralDirSize;
                this.zip64 && ((d += 20), (d += 12 + this.zip64EndOfCentralSize));
                var b = h - d;
                if (0 < b) this.isSignature(h, s.CENTRAL_FILE_HEADER) || (this.reader.zero = b);
                else if (b < 0)
                  throw new Error("Corrupted zip: missing " + Math.abs(b) + " bytes.");
              },
              prepareReader: function (f) {
                this.reader = r(f);
              },
              load: function (f) {
                (this.prepareReader(f),
                  this.readEndOfCentral(),
                  this.readCentralDir(),
                  this.readLocalFiles());
              },
            }),
              (i.exports = u));
          },
          {
            "./reader/readerFor": 22,
            "./signature": 23,
            "./support": 30,
            "./utils": 32,
            "./zipEntry": 34,
          },
        ],
        34: [
          function (e, i, o) {
            var r = e("./reader/readerFor"),
              a = e("./utils"),
              s = e("./compressedObject"),
              l = e("./crc32"),
              c = e("./utf8"),
              u = e("./compressions"),
              f = e("./support");
            function h(d, b) {
              ((this.options = d), (this.loadOptions = b));
            }
            ((h.prototype = {
              isEncrypted: function () {
                return (1 & this.bitFlag) == 1;
              },
              useUTF8: function () {
                return (2048 & this.bitFlag) == 2048;
              },
              readLocalPart: function (d) {
                var b, g;
                if (
                  (d.skip(22),
                  (this.fileNameLength = d.readInt(2)),
                  (g = d.readInt(2)),
                  (this.fileName = d.readData(this.fileNameLength)),
                  d.skip(g),
                  this.compressedSize === -1 || this.uncompressedSize === -1)
                )
                  throw new Error(
                    "Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)",
                  );
                if (
                  (b = (function (y) {
                    for (var m in u)
                      if (Object.prototype.hasOwnProperty.call(u, m) && u[m].magic === y)
                        return u[m];
                    return null;
                  })(this.compressionMethod)) === null
                )
                  throw new Error(
                    "Corrupted zip : compression " +
                      a.pretty(this.compressionMethod) +
                      " unknown (inner file : " +
                      a.transformTo("string", this.fileName) +
                      ")",
                  );
                this.decompressed = new s(
                  this.compressedSize,
                  this.uncompressedSize,
                  this.crc32,
                  b,
                  d.readData(this.compressedSize),
                );
              },
              readCentralPart: function (d) {
                ((this.versionMadeBy = d.readInt(2)),
                  d.skip(2),
                  (this.bitFlag = d.readInt(2)),
                  (this.compressionMethod = d.readString(2)),
                  (this.date = d.readDate()),
                  (this.crc32 = d.readInt(4)),
                  (this.compressedSize = d.readInt(4)),
                  (this.uncompressedSize = d.readInt(4)));
                var b = d.readInt(2);
                if (
                  ((this.extraFieldsLength = d.readInt(2)),
                  (this.fileCommentLength = d.readInt(2)),
                  (this.diskNumberStart = d.readInt(2)),
                  (this.internalFileAttributes = d.readInt(2)),
                  (this.externalFileAttributes = d.readInt(4)),
                  (this.localHeaderOffset = d.readInt(4)),
                  this.isEncrypted())
                )
                  throw new Error("Encrypted zip are not supported");
                (d.skip(b),
                  this.readExtraFields(d),
                  this.parseZIP64ExtraField(d),
                  (this.fileComment = d.readData(this.fileCommentLength)));
              },
              processAttributes: function () {
                ((this.unixPermissions = null), (this.dosPermissions = null));
                var d = this.versionMadeBy >> 8;
                ((this.dir = !!(16 & this.externalFileAttributes)),
                  d == 0 && (this.dosPermissions = 63 & this.externalFileAttributes),
                  d == 3 && (this.unixPermissions = (this.externalFileAttributes >> 16) & 65535),
                  this.dir || this.fileNameStr.slice(-1) !== "/" || (this.dir = !0));
              },
              parseZIP64ExtraField: function () {
                if (this.extraFields[1]) {
                  var d = r(this.extraFields[1].value);
                  (this.uncompressedSize === a.MAX_VALUE_32BITS &&
                    (this.uncompressedSize = d.readInt(8)),
                    this.compressedSize === a.MAX_VALUE_32BITS &&
                      (this.compressedSize = d.readInt(8)),
                    this.localHeaderOffset === a.MAX_VALUE_32BITS &&
                      (this.localHeaderOffset = d.readInt(8)),
                    this.diskNumberStart === a.MAX_VALUE_32BITS &&
                      (this.diskNumberStart = d.readInt(4)));
                }
              },
              readExtraFields: function (d) {
                var b,
                  g,
                  y,
                  m = d.index + this.extraFieldsLength;
                for (this.extraFields || (this.extraFields = {}); d.index + 4 < m; )
                  ((b = d.readInt(2)),
                    (g = d.readInt(2)),
                    (y = d.readData(g)),
                    (this.extraFields[b] = { id: b, length: g, value: y }));
                d.setIndex(m);
              },
              handleUTF8: function () {
                var d = f.uint8array ? "uint8array" : "array";
                if (this.useUTF8())
                  ((this.fileNameStr = c.utf8decode(this.fileName)),
                    (this.fileCommentStr = c.utf8decode(this.fileComment)));
                else {
                  var b = this.findExtraFieldUnicodePath();
                  if (b !== null) this.fileNameStr = b;
                  else {
                    var g = a.transformTo(d, this.fileName);
                    this.fileNameStr = this.loadOptions.decodeFileName(g);
                  }
                  var y = this.findExtraFieldUnicodeComment();
                  if (y !== null) this.fileCommentStr = y;
                  else {
                    var m = a.transformTo(d, this.fileComment);
                    this.fileCommentStr = this.loadOptions.decodeFileName(m);
                  }
                }
              },
              findExtraFieldUnicodePath: function () {
                var d = this.extraFields[28789];
                if (d) {
                  var b = r(d.value);
                  return b.readInt(1) !== 1 || l(this.fileName) !== b.readInt(4)
                    ? null
                    : c.utf8decode(b.readData(d.length - 5));
                }
                return null;
              },
              findExtraFieldUnicodeComment: function () {
                var d = this.extraFields[25461];
                if (d) {
                  var b = r(d.value);
                  return b.readInt(1) !== 1 || l(this.fileComment) !== b.readInt(4)
                    ? null
                    : c.utf8decode(b.readData(d.length - 5));
                }
                return null;
              },
            }),
              (i.exports = h));
          },
          {
            "./compressedObject": 2,
            "./compressions": 3,
            "./crc32": 4,
            "./reader/readerFor": 22,
            "./support": 30,
            "./utf8": 31,
            "./utils": 32,
          },
        ],
        35: [
          function (e, i, o) {
            function r(b, g, y) {
              ((this.name = b),
                (this.dir = y.dir),
                (this.date = y.date),
                (this.comment = y.comment),
                (this.unixPermissions = y.unixPermissions),
                (this.dosPermissions = y.dosPermissions),
                (this._data = g),
                (this._dataBinary = y.binary),
                (this.options = {
                  compression: y.compression,
                  compressionOptions: y.compressionOptions,
                }));
            }
            var a = e("./stream/StreamHelper"),
              s = e("./stream/DataWorker"),
              l = e("./utf8"),
              c = e("./compressedObject"),
              u = e("./stream/GenericWorker");
            r.prototype = {
              internalStream: function (b) {
                var g = null,
                  y = "string";
                try {
                  if (!b) throw new Error("No output type specified.");
                  var m = (y = b.toLowerCase()) === "string" || y === "text";
                  ((y !== "binarystring" && y !== "text") || (y = "string"),
                    (g = this._decompressWorker()));
                  var v = !this._dataBinary;
                  (v && !m && (g = g.pipe(new l.Utf8EncodeWorker())),
                    !v && m && (g = g.pipe(new l.Utf8DecodeWorker())));
                } catch (k) {
                  (g = new u("error")).error(k);
                }
                return new a(g, y, "");
              },
              async: function (b, g) {
                return this.internalStream(b).accumulate(g);
              },
              nodeStream: function (b, g) {
                return this.internalStream(b || "nodebuffer").toNodejsStream(g);
              },
              _compressWorker: function (b, g) {
                if (this._data instanceof c && this._data.compression.magic === b.magic)
                  return this._data.getCompressedWorker();
                var y = this._decompressWorker();
                return (
                  this._dataBinary || (y = y.pipe(new l.Utf8EncodeWorker())),
                  c.createWorkerFrom(y, b, g)
                );
              },
              _decompressWorker: function () {
                return this._data instanceof c
                  ? this._data.getContentWorker()
                  : this._data instanceof u
                    ? this._data
                    : new s(this._data);
              },
            };
            for (
              var f = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"],
                h = function () {
                  throw new Error(
                    "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                },
                d = 0;
              d < f.length;
              d++
            )
              r.prototype[f[d]] = h;
            i.exports = r;
          },
          {
            "./compressedObject": 2,
            "./stream/DataWorker": 27,
            "./stream/GenericWorker": 28,
            "./stream/StreamHelper": 29,
            "./utf8": 31,
          },
        ],
        36: [
          function (e, i, o) {
            (function (r) {
              var a,
                s,
                l = r.MutationObserver || r.WebKitMutationObserver;
              if (l) {
                var c = 0,
                  u = new l(b),
                  f = r.document.createTextNode("");
                (u.observe(f, { characterData: !0 }),
                  (a = function () {
                    f.data = c = ++c % 2;
                  }));
              } else if (r.setImmediate || r.MessageChannel === void 0)
                a =
                  "document" in r && "onreadystatechange" in r.document.createElement("script")
                    ? function () {
                        var g = r.document.createElement("script");
                        ((g.onreadystatechange = function () {
                          (b(),
                            (g.onreadystatechange = null),
                            g.parentNode.removeChild(g),
                            (g = null));
                        }),
                          r.document.documentElement.appendChild(g));
                      }
                    : function () {
                        setTimeout(b, 0);
                      };
              else {
                var h = new r.MessageChannel();
                ((h.port1.onmessage = b),
                  (a = function () {
                    h.port2.postMessage(0);
                  }));
              }
              var d = [];
              function b() {
                var g, y;
                s = !0;
                for (var m = d.length; m; ) {
                  for (y = d, d = [], g = -1; ++g < m; ) y[g]();
                  m = d.length;
                }
                s = !1;
              }
              i.exports = function (g) {
                d.push(g) !== 1 || s || a();
              };
            }).call(
              this,
              typeof xn < "u" ? xn : typeof self < "u" ? self : typeof window < "u" ? window : {},
            );
          },
          {},
        ],
        37: [
          function (e, i, o) {
            var r = e("immediate");
            function a() {}
            var s = {},
              l = ["REJECTED"],
              c = ["FULFILLED"],
              u = ["PENDING"];
            function f(m) {
              if (typeof m != "function") throw new TypeError("resolver must be a function");
              ((this.state = u), (this.queue = []), (this.outcome = void 0), m !== a && g(this, m));
            }
            function h(m, v, k) {
              ((this.promise = m),
                typeof v == "function" &&
                  ((this.onFulfilled = v), (this.callFulfilled = this.otherCallFulfilled)),
                typeof k == "function" &&
                  ((this.onRejected = k), (this.callRejected = this.otherCallRejected)));
            }
            function d(m, v, k) {
              r(function () {
                var C;
                try {
                  C = v(k);
                } catch (z) {
                  return s.reject(m, z);
                }
                C === m
                  ? s.reject(m, new TypeError("Cannot resolve promise with itself"))
                  : s.resolve(m, C);
              });
            }
            function b(m) {
              var v = m && m.then;
              if (m && (typeof m == "object" || typeof m == "function") && typeof v == "function")
                return function () {
                  v.apply(m, arguments);
                };
            }
            function g(m, v) {
              var k = !1;
              function C(A) {
                k || ((k = !0), s.reject(m, A));
              }
              function z(A) {
                k || ((k = !0), s.resolve(m, A));
              }
              var L = y(function () {
                v(z, C);
              });
              L.status === "error" && C(L.value);
            }
            function y(m, v) {
              var k = {};
              try {
                ((k.value = m(v)), (k.status = "success"));
              } catch (C) {
                ((k.status = "error"), (k.value = C));
              }
              return k;
            }
            (((i.exports = f).prototype.finally = function (m) {
              if (typeof m != "function") return this;
              var v = this.constructor;
              return this.then(
                function (k) {
                  return v.resolve(m()).then(function () {
                    return k;
                  });
                },
                function (k) {
                  return v.resolve(m()).then(function () {
                    throw k;
                  });
                },
              );
            }),
              (f.prototype.catch = function (m) {
                return this.then(null, m);
              }),
              (f.prototype.then = function (m, v) {
                if (
                  (typeof m != "function" && this.state === c) ||
                  (typeof v != "function" && this.state === l)
                )
                  return this;
                var k = new this.constructor(a);
                return (
                  this.state !== u
                    ? d(k, this.state === c ? m : v, this.outcome)
                    : this.queue.push(new h(k, m, v)),
                  k
                );
              }),
              (h.prototype.callFulfilled = function (m) {
                s.resolve(this.promise, m);
              }),
              (h.prototype.otherCallFulfilled = function (m) {
                d(this.promise, this.onFulfilled, m);
              }),
              (h.prototype.callRejected = function (m) {
                s.reject(this.promise, m);
              }),
              (h.prototype.otherCallRejected = function (m) {
                d(this.promise, this.onRejected, m);
              }),
              (s.resolve = function (m, v) {
                var k = y(b, v);
                if (k.status === "error") return s.reject(m, k.value);
                var C = k.value;
                if (C) g(m, C);
                else {
                  ((m.state = c), (m.outcome = v));
                  for (var z = -1, L = m.queue.length; ++z < L; ) m.queue[z].callFulfilled(v);
                }
                return m;
              }),
              (s.reject = function (m, v) {
                ((m.state = l), (m.outcome = v));
                for (var k = -1, C = m.queue.length; ++k < C; ) m.queue[k].callRejected(v);
                return m;
              }),
              (f.resolve = function (m) {
                return m instanceof this ? m : s.resolve(new this(a), m);
              }),
              (f.reject = function (m) {
                var v = new this(a);
                return s.reject(v, m);
              }),
              (f.all = function (m) {
                var v = this;
                if (Object.prototype.toString.call(m) !== "[object Array]")
                  return this.reject(new TypeError("must be an array"));
                var k = m.length,
                  C = !1;
                if (!k) return this.resolve([]);
                for (var z = new Array(k), L = 0, A = -1, O = new this(a); ++A < k; ) $(m[A], A);
                return O;
                function $(x, P) {
                  v.resolve(x).then(
                    function (_) {
                      ((z[P] = _), ++L !== k || C || ((C = !0), s.resolve(O, z)));
                    },
                    function (_) {
                      C || ((C = !0), s.reject(O, _));
                    },
                  );
                }
              }),
              (f.race = function (m) {
                var v = this;
                if (Object.prototype.toString.call(m) !== "[object Array]")
                  return this.reject(new TypeError("must be an array"));
                var k = m.length,
                  C = !1;
                if (!k) return this.resolve([]);
                for (var z = -1, L = new this(a); ++z < k; )
                  ((A = m[z]),
                    v.resolve(A).then(
                      function (O) {
                        C || ((C = !0), s.resolve(L, O));
                      },
                      function (O) {
                        C || ((C = !0), s.reject(L, O));
                      },
                    ));
                var A;
                return L;
              }));
          },
          { immediate: 36 },
        ],
        38: [
          function (e, i, o) {
            var r = {};
            ((0, e("./lib/utils/common").assign)(
              r,
              e("./lib/deflate"),
              e("./lib/inflate"),
              e("./lib/zlib/constants"),
            ),
              (i.exports = r));
          },
          {
            "./lib/deflate": 39,
            "./lib/inflate": 40,
            "./lib/utils/common": 41,
            "./lib/zlib/constants": 44,
          },
        ],
        39: [
          function (e, i, o) {
            var r = e("./zlib/deflate"),
              a = e("./utils/common"),
              s = e("./utils/strings"),
              l = e("./zlib/messages"),
              c = e("./zlib/zstream"),
              u = Object.prototype.toString,
              f = 0,
              h = -1,
              d = 0,
              b = 8;
            function g(m) {
              if (!(this instanceof g)) return new g(m);
              this.options = a.assign(
                {
                  level: h,
                  method: b,
                  chunkSize: 16384,
                  windowBits: 15,
                  memLevel: 8,
                  strategy: d,
                  to: "",
                },
                m || {},
              );
              var v = this.options;
              (v.raw && 0 < v.windowBits
                ? (v.windowBits = -v.windowBits)
                : v.gzip && 0 < v.windowBits && v.windowBits < 16 && (v.windowBits += 16),
                (this.err = 0),
                (this.msg = ""),
                (this.ended = !1),
                (this.chunks = []),
                (this.strm = new c()),
                (this.strm.avail_out = 0));
              var k = r.deflateInit2(
                this.strm,
                v.level,
                v.method,
                v.windowBits,
                v.memLevel,
                v.strategy,
              );
              if (k !== f) throw new Error(l[k]);
              if ((v.header && r.deflateSetHeader(this.strm, v.header), v.dictionary)) {
                var C;
                if (
                  ((C =
                    typeof v.dictionary == "string"
                      ? s.string2buf(v.dictionary)
                      : u.call(v.dictionary) === "[object ArrayBuffer]"
                        ? new Uint8Array(v.dictionary)
                        : v.dictionary),
                  (k = r.deflateSetDictionary(this.strm, C)) !== f)
                )
                  throw new Error(l[k]);
                this._dict_set = !0;
              }
            }
            function y(m, v) {
              var k = new g(v);
              if ((k.push(m, !0), k.err)) throw k.msg || l[k.err];
              return k.result;
            }
            ((g.prototype.push = function (m, v) {
              var k,
                C,
                z = this.strm,
                L = this.options.chunkSize;
              if (this.ended) return !1;
              ((C = v === ~~v ? v : v === !0 ? 4 : 0),
                typeof m == "string"
                  ? (z.input = s.string2buf(m))
                  : u.call(m) === "[object ArrayBuffer]"
                    ? (z.input = new Uint8Array(m))
                    : (z.input = m),
                (z.next_in = 0),
                (z.avail_in = z.input.length));
              do {
                if (
                  (z.avail_out === 0 &&
                    ((z.output = new a.Buf8(L)), (z.next_out = 0), (z.avail_out = L)),
                  (k = r.deflate(z, C)) !== 1 && k !== f)
                )
                  return (this.onEnd(k), !(this.ended = !0));
                (z.avail_out !== 0 && (z.avail_in !== 0 || (C !== 4 && C !== 2))) ||
                  (this.options.to === "string"
                    ? this.onData(s.buf2binstring(a.shrinkBuf(z.output, z.next_out)))
                    : this.onData(a.shrinkBuf(z.output, z.next_out)));
              } while ((0 < z.avail_in || z.avail_out === 0) && k !== 1);
              return C === 4
                ? ((k = r.deflateEnd(this.strm)), this.onEnd(k), (this.ended = !0), k === f)
                : C !== 2 || (this.onEnd(f), !(z.avail_out = 0));
            }),
              (g.prototype.onData = function (m) {
                this.chunks.push(m);
              }),
              (g.prototype.onEnd = function (m) {
                (m === f &&
                  (this.options.to === "string"
                    ? (this.result = this.chunks.join(""))
                    : (this.result = a.flattenChunks(this.chunks))),
                  (this.chunks = []),
                  (this.err = m),
                  (this.msg = this.strm.msg));
              }),
              (o.Deflate = g),
              (o.deflate = y),
              (o.deflateRaw = function (m, v) {
                return (((v = v || {}).raw = !0), y(m, v));
              }),
              (o.gzip = function (m, v) {
                return (((v = v || {}).gzip = !0), y(m, v));
              }));
          },
          {
            "./utils/common": 41,
            "./utils/strings": 42,
            "./zlib/deflate": 46,
            "./zlib/messages": 51,
            "./zlib/zstream": 53,
          },
        ],
        40: [
          function (e, i, o) {
            var r = e("./zlib/inflate"),
              a = e("./utils/common"),
              s = e("./utils/strings"),
              l = e("./zlib/constants"),
              c = e("./zlib/messages"),
              u = e("./zlib/zstream"),
              f = e("./zlib/gzheader"),
              h = Object.prototype.toString;
            function d(g) {
              if (!(this instanceof d)) return new d(g);
              this.options = a.assign({ chunkSize: 16384, windowBits: 0, to: "" }, g || {});
              var y = this.options;
              (y.raw &&
                0 <= y.windowBits &&
                y.windowBits < 16 &&
                ((y.windowBits = -y.windowBits), y.windowBits === 0 && (y.windowBits = -15)),
                !(0 <= y.windowBits && y.windowBits < 16) ||
                  (g && g.windowBits) ||
                  (y.windowBits += 32),
                15 < y.windowBits &&
                  y.windowBits < 48 &&
                  !(15 & y.windowBits) &&
                  (y.windowBits |= 15),
                (this.err = 0),
                (this.msg = ""),
                (this.ended = !1),
                (this.chunks = []),
                (this.strm = new u()),
                (this.strm.avail_out = 0));
              var m = r.inflateInit2(this.strm, y.windowBits);
              if (m !== l.Z_OK) throw new Error(c[m]);
              ((this.header = new f()), r.inflateGetHeader(this.strm, this.header));
            }
            function b(g, y) {
              var m = new d(y);
              if ((m.push(g, !0), m.err)) throw m.msg || c[m.err];
              return m.result;
            }
            ((d.prototype.push = function (g, y) {
              var m,
                v,
                k,
                C,
                z,
                L,
                A = this.strm,
                O = this.options.chunkSize,
                $ = this.options.dictionary,
                x = !1;
              if (this.ended) return !1;
              ((v = y === ~~y ? y : y === !0 ? l.Z_FINISH : l.Z_NO_FLUSH),
                typeof g == "string"
                  ? (A.input = s.binstring2buf(g))
                  : h.call(g) === "[object ArrayBuffer]"
                    ? (A.input = new Uint8Array(g))
                    : (A.input = g),
                (A.next_in = 0),
                (A.avail_in = A.input.length));
              do {
                if (
                  (A.avail_out === 0 &&
                    ((A.output = new a.Buf8(O)), (A.next_out = 0), (A.avail_out = O)),
                  (m = r.inflate(A, l.Z_NO_FLUSH)) === l.Z_NEED_DICT &&
                    $ &&
                    ((L =
                      typeof $ == "string"
                        ? s.string2buf($)
                        : h.call($) === "[object ArrayBuffer]"
                          ? new Uint8Array($)
                          : $),
                    (m = r.inflateSetDictionary(this.strm, L))),
                  m === l.Z_BUF_ERROR && x === !0 && ((m = l.Z_OK), (x = !1)),
                  m !== l.Z_STREAM_END && m !== l.Z_OK)
                )
                  return (this.onEnd(m), !(this.ended = !0));
                (A.next_out &&
                  ((A.avail_out !== 0 &&
                    m !== l.Z_STREAM_END &&
                    (A.avail_in !== 0 || (v !== l.Z_FINISH && v !== l.Z_SYNC_FLUSH))) ||
                    (this.options.to === "string"
                      ? ((k = s.utf8border(A.output, A.next_out)),
                        (C = A.next_out - k),
                        (z = s.buf2string(A.output, k)),
                        (A.next_out = C),
                        (A.avail_out = O - C),
                        C && a.arraySet(A.output, A.output, k, C, 0),
                        this.onData(z))
                      : this.onData(a.shrinkBuf(A.output, A.next_out)))),
                  A.avail_in === 0 && A.avail_out === 0 && (x = !0));
              } while ((0 < A.avail_in || A.avail_out === 0) && m !== l.Z_STREAM_END);
              return (
                m === l.Z_STREAM_END && (v = l.Z_FINISH),
                v === l.Z_FINISH
                  ? ((m = r.inflateEnd(this.strm)), this.onEnd(m), (this.ended = !0), m === l.Z_OK)
                  : v !== l.Z_SYNC_FLUSH || (this.onEnd(l.Z_OK), !(A.avail_out = 0))
              );
            }),
              (d.prototype.onData = function (g) {
                this.chunks.push(g);
              }),
              (d.prototype.onEnd = function (g) {
                (g === l.Z_OK &&
                  (this.options.to === "string"
                    ? (this.result = this.chunks.join(""))
                    : (this.result = a.flattenChunks(this.chunks))),
                  (this.chunks = []),
                  (this.err = g),
                  (this.msg = this.strm.msg));
              }),
              (o.Inflate = d),
              (o.inflate = b),
              (o.inflateRaw = function (g, y) {
                return (((y = y || {}).raw = !0), b(g, y));
              }),
              (o.ungzip = b));
          },
          {
            "./utils/common": 41,
            "./utils/strings": 42,
            "./zlib/constants": 44,
            "./zlib/gzheader": 47,
            "./zlib/inflate": 49,
            "./zlib/messages": 51,
            "./zlib/zstream": 53,
          },
        ],
        41: [
          function (e, i, o) {
            var r = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
            ((o.assign = function (l) {
              for (var c = Array.prototype.slice.call(arguments, 1); c.length; ) {
                var u = c.shift();
                if (u) {
                  if (typeof u != "object") throw new TypeError(u + "must be non-object");
                  for (var f in u) u.hasOwnProperty(f) && (l[f] = u[f]);
                }
              }
              return l;
            }),
              (o.shrinkBuf = function (l, c) {
                return l.length === c ? l : l.subarray ? l.subarray(0, c) : ((l.length = c), l);
              }));
            var a = {
                arraySet: function (l, c, u, f, h) {
                  if (c.subarray && l.subarray) l.set(c.subarray(u, u + f), h);
                  else for (var d = 0; d < f; d++) l[h + d] = c[u + d];
                },
                flattenChunks: function (l) {
                  var c, u, f, h, d, b;
                  for (c = f = 0, u = l.length; c < u; c++) f += l[c].length;
                  for (b = new Uint8Array(f), c = h = 0, u = l.length; c < u; c++)
                    ((d = l[c]), b.set(d, h), (h += d.length));
                  return b;
                },
              },
              s = {
                arraySet: function (l, c, u, f, h) {
                  for (var d = 0; d < f; d++) l[h + d] = c[u + d];
                },
                flattenChunks: function (l) {
                  return [].concat.apply([], l);
                },
              };
            ((o.setTyped = function (l) {
              l
                ? ((o.Buf8 = Uint8Array),
                  (o.Buf16 = Uint16Array),
                  (o.Buf32 = Int32Array),
                  o.assign(o, a))
                : ((o.Buf8 = Array), (o.Buf16 = Array), (o.Buf32 = Array), o.assign(o, s));
            }),
              o.setTyped(r));
          },
          {},
        ],
        42: [
          function (e, i, o) {
            var r = e("./common"),
              a = !0,
              s = !0;
            try {
              String.fromCharCode.apply(null, [0]);
            } catch {
              a = !1;
            }
            try {
              String.fromCharCode.apply(null, new Uint8Array(1));
            } catch {
              s = !1;
            }
            for (var l = new r.Buf8(256), c = 0; c < 256; c++)
              l[c] = 252 <= c ? 6 : 248 <= c ? 5 : 240 <= c ? 4 : 224 <= c ? 3 : 192 <= c ? 2 : 1;
            function u(f, h) {
              if (h < 65537 && ((f.subarray && s) || (!f.subarray && a)))
                return String.fromCharCode.apply(null, r.shrinkBuf(f, h));
              for (var d = "", b = 0; b < h; b++) d += String.fromCharCode(f[b]);
              return d;
            }
            ((l[254] = l[254] = 1),
              (o.string2buf = function (f) {
                var h,
                  d,
                  b,
                  g,
                  y,
                  m = f.length,
                  v = 0;
                for (g = 0; g < m; g++)
                  ((64512 & (d = f.charCodeAt(g))) == 55296 &&
                    g + 1 < m &&
                    (64512 & (b = f.charCodeAt(g + 1))) == 56320 &&
                    ((d = 65536 + ((d - 55296) << 10) + (b - 56320)), g++),
                    (v += d < 128 ? 1 : d < 2048 ? 2 : d < 65536 ? 3 : 4));
                for (h = new r.Buf8(v), g = y = 0; y < v; g++)
                  ((64512 & (d = f.charCodeAt(g))) == 55296 &&
                    g + 1 < m &&
                    (64512 & (b = f.charCodeAt(g + 1))) == 56320 &&
                    ((d = 65536 + ((d - 55296) << 10) + (b - 56320)), g++),
                    d < 128
                      ? (h[y++] = d)
                      : (d < 2048
                          ? (h[y++] = 192 | (d >>> 6))
                          : (d < 65536
                              ? (h[y++] = 224 | (d >>> 12))
                              : ((h[y++] = 240 | (d >>> 18)), (h[y++] = 128 | ((d >>> 12) & 63))),
                            (h[y++] = 128 | ((d >>> 6) & 63))),
                        (h[y++] = 128 | (63 & d))));
                return h;
              }),
              (o.buf2binstring = function (f) {
                return u(f, f.length);
              }),
              (o.binstring2buf = function (f) {
                for (var h = new r.Buf8(f.length), d = 0, b = h.length; d < b; d++)
                  h[d] = f.charCodeAt(d);
                return h;
              }),
              (o.buf2string = function (f, h) {
                var d,
                  b,
                  g,
                  y,
                  m = h || f.length,
                  v = new Array(2 * m);
                for (d = b = 0; d < m; )
                  if ((g = f[d++]) < 128) v[b++] = g;
                  else if (4 < (y = l[g])) ((v[b++] = 65533), (d += y - 1));
                  else {
                    for (g &= y === 2 ? 31 : y === 3 ? 15 : 7; 1 < y && d < m; )
                      ((g = (g << 6) | (63 & f[d++])), y--);
                    1 < y
                      ? (v[b++] = 65533)
                      : g < 65536
                        ? (v[b++] = g)
                        : ((g -= 65536),
                          (v[b++] = 55296 | ((g >> 10) & 1023)),
                          (v[b++] = 56320 | (1023 & g)));
                  }
                return u(v, b);
              }),
              (o.utf8border = function (f, h) {
                var d;
                for (
                  (h = h || f.length) > f.length && (h = f.length), d = h - 1;
                  0 <= d && (192 & f[d]) == 128;
                )
                  d--;
                return d < 0 || d === 0 ? h : d + l[f[d]] > h ? d : h;
              }));
          },
          { "./common": 41 },
        ],
        43: [
          function (e, i, o) {
            i.exports = function (r, a, s, l) {
              for (var c = (65535 & r) | 0, u = ((r >>> 16) & 65535) | 0, f = 0; s !== 0; ) {
                for (s -= f = 2e3 < s ? 2e3 : s; (u = (u + (c = (c + a[l++]) | 0)) | 0), --f; );
                ((c %= 65521), (u %= 65521));
              }
              return c | (u << 16) | 0;
            };
          },
          {},
        ],
        44: [
          function (e, i, o) {
            i.exports = {
              Z_NO_FLUSH: 0,
              Z_PARTIAL_FLUSH: 1,
              Z_SYNC_FLUSH: 2,
              Z_FULL_FLUSH: 3,
              Z_FINISH: 4,
              Z_BLOCK: 5,
              Z_TREES: 6,
              Z_OK: 0,
              Z_STREAM_END: 1,
              Z_NEED_DICT: 2,
              Z_ERRNO: -1,
              Z_STREAM_ERROR: -2,
              Z_DATA_ERROR: -3,
              Z_BUF_ERROR: -5,
              Z_NO_COMPRESSION: 0,
              Z_BEST_SPEED: 1,
              Z_BEST_COMPRESSION: 9,
              Z_DEFAULT_COMPRESSION: -1,
              Z_FILTERED: 1,
              Z_HUFFMAN_ONLY: 2,
              Z_RLE: 3,
              Z_FIXED: 4,
              Z_DEFAULT_STRATEGY: 0,
              Z_BINARY: 0,
              Z_TEXT: 1,
              Z_UNKNOWN: 2,
              Z_DEFLATED: 8,
            };
          },
          {},
        ],
        45: [
          function (e, i, o) {
            var r = (function () {
              for (var a, s = [], l = 0; l < 256; l++) {
                a = l;
                for (var c = 0; c < 8; c++) a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
                s[l] = a;
              }
              return s;
            })();
            i.exports = function (a, s, l, c) {
              var u = r,
                f = c + l;
              a ^= -1;
              for (var h = c; h < f; h++) a = (a >>> 8) ^ u[255 & (a ^ s[h])];
              return -1 ^ a;
            };
          },
          {},
        ],
        46: [
          function (e, i, o) {
            var r,
              a = e("../utils/common"),
              s = e("./trees"),
              l = e("./adler32"),
              c = e("./crc32"),
              u = e("./messages"),
              f = 0,
              h = 4,
              d = 0,
              b = -2,
              g = -1,
              y = 4,
              m = 2,
              v = 8,
              k = 9,
              C = 286,
              z = 30,
              L = 19,
              A = 2 * C + 1,
              O = 15,
              $ = 3,
              x = 258,
              P = x + $ + 1,
              _ = 42,
              T = 113,
              w = 1,
              R = 2,
              Q = 3,
              N = 4;
            function tt(p, H) {
              return ((p.msg = u[H]), H);
            }
            function Z(p) {
              return (p << 1) - (4 < p ? 9 : 0);
            }
            function nt(p) {
              for (var H = p.length; 0 <= --H; ) p[H] = 0;
            }
            function j(p) {
              var H = p.state,
                W = H.pending;
              (W > p.avail_out && (W = p.avail_out),
                W !== 0 &&
                  (a.arraySet(p.output, H.pending_buf, H.pending_out, W, p.next_out),
                  (p.next_out += W),
                  (H.pending_out += W),
                  (p.total_out += W),
                  (p.avail_out -= W),
                  (H.pending -= W),
                  H.pending === 0 && (H.pending_out = 0)));
            }
            function D(p, H) {
              (s._tr_flush_block(
                p,
                0 <= p.block_start ? p.block_start : -1,
                p.strstart - p.block_start,
                H,
              ),
                (p.block_start = p.strstart),
                j(p.strm));
            }
            function et(p, H) {
              p.pending_buf[p.pending++] = H;
            }
            function X(p, H) {
              ((p.pending_buf[p.pending++] = (H >>> 8) & 255),
                (p.pending_buf[p.pending++] = 255 & H));
            }
            function V(p, H) {
              var W,
                F,
                S = p.max_chain_length,
                M = p.strstart,
                G = p.prev_length,
                K = p.nice_match,
                B = p.strstart > p.w_size - P ? p.strstart - (p.w_size - P) : 0,
                q = p.window,
                J = p.w_mask,
                Y = p.prev,
                rt = p.strstart + x,
                vt = q[M + G - 1],
                gt = q[M + G];
              (p.prev_length >= p.good_match && (S >>= 2), K > p.lookahead && (K = p.lookahead));
              do
                if (
                  q[(W = H) + G] === gt &&
                  q[W + G - 1] === vt &&
                  q[W] === q[M] &&
                  q[++W] === q[M + 1]
                ) {
                  ((M += 2), W++);
                  do;
                  while (
                    q[++M] === q[++W] &&
                    q[++M] === q[++W] &&
                    q[++M] === q[++W] &&
                    q[++M] === q[++W] &&
                    q[++M] === q[++W] &&
                    q[++M] === q[++W] &&
                    q[++M] === q[++W] &&
                    q[++M] === q[++W] &&
                    M < rt
                  );
                  if (((F = x - (rt - M)), (M = rt - x), G < F)) {
                    if (((p.match_start = H), K <= (G = F))) break;
                    ((vt = q[M + G - 1]), (gt = q[M + G]));
                  }
                }
              while ((H = Y[H & J]) > B && --S != 0);
              return G <= p.lookahead ? G : p.lookahead;
            }
            function ft(p) {
              var H,
                W,
                F,
                S,
                M,
                G,
                K,
                B,
                q,
                J,
                Y = p.w_size;
              do {
                if (((S = p.window_size - p.lookahead - p.strstart), p.strstart >= Y + (Y - P))) {
                  for (
                    a.arraySet(p.window, p.window, Y, Y, 0),
                      p.match_start -= Y,
                      p.strstart -= Y,
                      p.block_start -= Y,
                      H = W = p.hash_size;
                    (F = p.head[--H]), (p.head[H] = Y <= F ? F - Y : 0), --W;
                  );
                  for (H = W = Y; (F = p.prev[--H]), (p.prev[H] = Y <= F ? F - Y : 0), --W; );
                  S += Y;
                }
                if (p.strm.avail_in === 0) break;
                if (
                  ((G = p.strm),
                  (K = p.window),
                  (B = p.strstart + p.lookahead),
                  (q = S),
                  (J = void 0),
                  (J = G.avail_in),
                  q < J && (J = q),
                  (W =
                    J === 0
                      ? 0
                      : ((G.avail_in -= J),
                        a.arraySet(K, G.input, G.next_in, J, B),
                        G.state.wrap === 1
                          ? (G.adler = l(G.adler, K, J, B))
                          : G.state.wrap === 2 && (G.adler = c(G.adler, K, J, B)),
                        (G.next_in += J),
                        (G.total_in += J),
                        J)),
                  (p.lookahead += W),
                  p.lookahead + p.insert >= $)
                )
                  for (
                    M = p.strstart - p.insert,
                      p.ins_h = p.window[M],
                      p.ins_h = ((p.ins_h << p.hash_shift) ^ p.window[M + 1]) & p.hash_mask;
                    p.insert &&
                    ((p.ins_h = ((p.ins_h << p.hash_shift) ^ p.window[M + $ - 1]) & p.hash_mask),
                    (p.prev[M & p.w_mask] = p.head[p.ins_h]),
                    (p.head[p.ins_h] = M),
                    M++,
                    p.insert--,
                    !(p.lookahead + p.insert < $));
                  );
              } while (p.lookahead < P && p.strm.avail_in !== 0);
            }
            function At(p, H) {
              for (var W, F; ; ) {
                if (p.lookahead < P) {
                  if ((ft(p), p.lookahead < P && H === f)) return w;
                  if (p.lookahead === 0) break;
                }
                if (
                  ((W = 0),
                  p.lookahead >= $ &&
                    ((p.ins_h =
                      ((p.ins_h << p.hash_shift) ^ p.window[p.strstart + $ - 1]) & p.hash_mask),
                    (W = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h]),
                    (p.head[p.ins_h] = p.strstart)),
                  W !== 0 && p.strstart - W <= p.w_size - P && (p.match_length = V(p, W)),
                  p.match_length >= $)
                )
                  if (
                    ((F = s._tr_tally(p, p.strstart - p.match_start, p.match_length - $)),
                    (p.lookahead -= p.match_length),
                    p.match_length <= p.max_lazy_match && p.lookahead >= $)
                  ) {
                    for (
                      p.match_length--;
                      p.strstart++,
                        (p.ins_h =
                          ((p.ins_h << p.hash_shift) ^ p.window[p.strstart + $ - 1]) & p.hash_mask),
                        (W = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h]),
                        (p.head[p.ins_h] = p.strstart),
                        --p.match_length != 0;
                    );
                    p.strstart++;
                  } else
                    ((p.strstart += p.match_length),
                      (p.match_length = 0),
                      (p.ins_h = p.window[p.strstart]),
                      (p.ins_h =
                        ((p.ins_h << p.hash_shift) ^ p.window[p.strstart + 1]) & p.hash_mask));
                else ((F = s._tr_tally(p, 0, p.window[p.strstart])), p.lookahead--, p.strstart++);
                if (F && (D(p, !1), p.strm.avail_out === 0)) return w;
              }
              return (
                (p.insert = p.strstart < $ - 1 ? p.strstart : $ - 1),
                H === h
                  ? (D(p, !0), p.strm.avail_out === 0 ? Q : N)
                  : p.last_lit && (D(p, !1), p.strm.avail_out === 0)
                    ? w
                    : R
              );
            }
            function ct(p, H) {
              for (var W, F, S; ; ) {
                if (p.lookahead < P) {
                  if ((ft(p), p.lookahead < P && H === f)) return w;
                  if (p.lookahead === 0) break;
                }
                if (
                  ((W = 0),
                  p.lookahead >= $ &&
                    ((p.ins_h =
                      ((p.ins_h << p.hash_shift) ^ p.window[p.strstart + $ - 1]) & p.hash_mask),
                    (W = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h]),
                    (p.head[p.ins_h] = p.strstart)),
                  (p.prev_length = p.match_length),
                  (p.prev_match = p.match_start),
                  (p.match_length = $ - 1),
                  W !== 0 &&
                    p.prev_length < p.max_lazy_match &&
                    p.strstart - W <= p.w_size - P &&
                    ((p.match_length = V(p, W)),
                    p.match_length <= 5 &&
                      (p.strategy === 1 ||
                        (p.match_length === $ && 4096 < p.strstart - p.match_start)) &&
                      (p.match_length = $ - 1)),
                  p.prev_length >= $ && p.match_length <= p.prev_length)
                ) {
                  for (
                    S = p.strstart + p.lookahead - $,
                      F = s._tr_tally(p, p.strstart - 1 - p.prev_match, p.prev_length - $),
                      p.lookahead -= p.prev_length - 1,
                      p.prev_length -= 2;
                    ++p.strstart <= S &&
                      ((p.ins_h =
                        ((p.ins_h << p.hash_shift) ^ p.window[p.strstart + $ - 1]) & p.hash_mask),
                      (W = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h]),
                      (p.head[p.ins_h] = p.strstart)),
                      --p.prev_length != 0;
                  );
                  if (
                    ((p.match_available = 0),
                    (p.match_length = $ - 1),
                    p.strstart++,
                    F && (D(p, !1), p.strm.avail_out === 0))
                  )
                    return w;
                } else if (p.match_available) {
                  if (
                    ((F = s._tr_tally(p, 0, p.window[p.strstart - 1])) && D(p, !1),
                    p.strstart++,
                    p.lookahead--,
                    p.strm.avail_out === 0)
                  )
                    return w;
                } else ((p.match_available = 1), p.strstart++, p.lookahead--);
              }
              return (
                p.match_available &&
                  ((F = s._tr_tally(p, 0, p.window[p.strstart - 1])), (p.match_available = 0)),
                (p.insert = p.strstart < $ - 1 ? p.strstart : $ - 1),
                H === h
                  ? (D(p, !0), p.strm.avail_out === 0 ? Q : N)
                  : p.last_lit && (D(p, !1), p.strm.avail_out === 0)
                    ? w
                    : R
              );
            }
            function mt(p, H, W, F, S) {
              ((this.good_length = p),
                (this.max_lazy = H),
                (this.nice_length = W),
                (this.max_chain = F),
                (this.func = S));
            }
            function Dt() {
              ((this.strm = null),
                (this.status = 0),
                (this.pending_buf = null),
                (this.pending_buf_size = 0),
                (this.pending_out = 0),
                (this.pending = 0),
                (this.wrap = 0),
                (this.gzhead = null),
                (this.gzindex = 0),
                (this.method = v),
                (this.last_flush = -1),
                (this.w_size = 0),
                (this.w_bits = 0),
                (this.w_mask = 0),
                (this.window = null),
                (this.window_size = 0),
                (this.prev = null),
                (this.head = null),
                (this.ins_h = 0),
                (this.hash_size = 0),
                (this.hash_bits = 0),
                (this.hash_mask = 0),
                (this.hash_shift = 0),
                (this.block_start = 0),
                (this.match_length = 0),
                (this.prev_match = 0),
                (this.match_available = 0),
                (this.strstart = 0),
                (this.match_start = 0),
                (this.lookahead = 0),
                (this.prev_length = 0),
                (this.max_chain_length = 0),
                (this.max_lazy_match = 0),
                (this.level = 0),
                (this.strategy = 0),
                (this.good_match = 0),
                (this.nice_match = 0),
                (this.dyn_ltree = new a.Buf16(2 * A)),
                (this.dyn_dtree = new a.Buf16(2 * (2 * z + 1))),
                (this.bl_tree = new a.Buf16(2 * (2 * L + 1))),
                nt(this.dyn_ltree),
                nt(this.dyn_dtree),
                nt(this.bl_tree),
                (this.l_desc = null),
                (this.d_desc = null),
                (this.bl_desc = null),
                (this.bl_count = new a.Buf16(O + 1)),
                (this.heap = new a.Buf16(2 * C + 1)),
                nt(this.heap),
                (this.heap_len = 0),
                (this.heap_max = 0),
                (this.depth = new a.Buf16(2 * C + 1)),
                nt(this.depth),
                (this.l_buf = 0),
                (this.lit_bufsize = 0),
                (this.last_lit = 0),
                (this.d_buf = 0),
                (this.opt_len = 0),
                (this.static_len = 0),
                (this.matches = 0),
                (this.insert = 0),
                (this.bi_buf = 0),
                (this.bi_valid = 0));
            }
            function Ft(p) {
              var H;
              return p && p.state
                ? ((p.total_in = p.total_out = 0),
                  (p.data_type = m),
                  ((H = p.state).pending = 0),
                  (H.pending_out = 0),
                  H.wrap < 0 && (H.wrap = -H.wrap),
                  (H.status = H.wrap ? _ : T),
                  (p.adler = H.wrap === 2 ? 0 : 1),
                  (H.last_flush = f),
                  s._tr_init(H),
                  d)
                : tt(p, b);
            }
            function fe(p) {
              var H = Ft(p);
              return (
                H === d &&
                  (function (W) {
                    ((W.window_size = 2 * W.w_size),
                      nt(W.head),
                      (W.max_lazy_match = r[W.level].max_lazy),
                      (W.good_match = r[W.level].good_length),
                      (W.nice_match = r[W.level].nice_length),
                      (W.max_chain_length = r[W.level].max_chain),
                      (W.strstart = 0),
                      (W.block_start = 0),
                      (W.lookahead = 0),
                      (W.insert = 0),
                      (W.match_length = W.prev_length = $ - 1),
                      (W.match_available = 0),
                      (W.ins_h = 0));
                  })(p.state),
                H
              );
            }
            function se(p, H, W, F, S, M) {
              if (!p) return b;
              var G = 1;
              if (
                (H === g && (H = 6),
                F < 0 ? ((G = 0), (F = -F)) : 15 < F && ((G = 2), (F -= 16)),
                S < 1 || k < S || W !== v || F < 8 || 15 < F || H < 0 || 9 < H || M < 0 || y < M)
              )
                return tt(p, b);
              F === 8 && (F = 9);
              var K = new Dt();
              return (
                ((p.state = K).strm = p),
                (K.wrap = G),
                (K.gzhead = null),
                (K.w_bits = F),
                (K.w_size = 1 << K.w_bits),
                (K.w_mask = K.w_size - 1),
                (K.hash_bits = S + 7),
                (K.hash_size = 1 << K.hash_bits),
                (K.hash_mask = K.hash_size - 1),
                (K.hash_shift = ~~((K.hash_bits + $ - 1) / $)),
                (K.window = new a.Buf8(2 * K.w_size)),
                (K.head = new a.Buf16(K.hash_size)),
                (K.prev = new a.Buf16(K.w_size)),
                (K.lit_bufsize = 1 << (S + 6)),
                (K.pending_buf_size = 4 * K.lit_bufsize),
                (K.pending_buf = new a.Buf8(K.pending_buf_size)),
                (K.d_buf = 1 * K.lit_bufsize),
                (K.l_buf = 3 * K.lit_bufsize),
                (K.level = H),
                (K.strategy = M),
                (K.method = W),
                fe(p)
              );
            }
            ((r = [
              new mt(0, 0, 0, 0, function (p, H) {
                var W = 65535;
                for (W > p.pending_buf_size - 5 && (W = p.pending_buf_size - 5); ; ) {
                  if (p.lookahead <= 1) {
                    if ((ft(p), p.lookahead === 0 && H === f)) return w;
                    if (p.lookahead === 0) break;
                  }
                  ((p.strstart += p.lookahead), (p.lookahead = 0));
                  var F = p.block_start + W;
                  if (
                    ((p.strstart === 0 || p.strstart >= F) &&
                      ((p.lookahead = p.strstart - F),
                      (p.strstart = F),
                      D(p, !1),
                      p.strm.avail_out === 0)) ||
                    (p.strstart - p.block_start >= p.w_size - P &&
                      (D(p, !1), p.strm.avail_out === 0))
                  )
                    return w;
                }
                return (
                  (p.insert = 0),
                  H === h
                    ? (D(p, !0), p.strm.avail_out === 0 ? Q : N)
                    : (p.strstart > p.block_start && (D(p, !1), p.strm.avail_out), w)
                );
              }),
              new mt(4, 4, 8, 4, At),
              new mt(4, 5, 16, 8, At),
              new mt(4, 6, 32, 32, At),
              new mt(4, 4, 16, 16, ct),
              new mt(8, 16, 32, 32, ct),
              new mt(8, 16, 128, 128, ct),
              new mt(8, 32, 128, 256, ct),
              new mt(32, 128, 258, 1024, ct),
              new mt(32, 258, 258, 4096, ct),
            ]),
              (o.deflateInit = function (p, H) {
                return se(p, H, v, 15, 8, 0);
              }),
              (o.deflateInit2 = se),
              (o.deflateReset = fe),
              (o.deflateResetKeep = Ft),
              (o.deflateSetHeader = function (p, H) {
                return p && p.state ? (p.state.wrap !== 2 ? b : ((p.state.gzhead = H), d)) : b;
              }),
              (o.deflate = function (p, H) {
                var W, F, S, M;
                if (!p || !p.state || 5 < H || H < 0) return p ? tt(p, b) : b;
                if (
                  ((F = p.state),
                  !p.output || (!p.input && p.avail_in !== 0) || (F.status === 666 && H !== h))
                )
                  return tt(p, p.avail_out === 0 ? -5 : b);
                if (((F.strm = p), (W = F.last_flush), (F.last_flush = H), F.status === _))
                  if (F.wrap === 2)
                    ((p.adler = 0),
                      et(F, 31),
                      et(F, 139),
                      et(F, 8),
                      F.gzhead
                        ? (et(
                            F,
                            (F.gzhead.text ? 1 : 0) +
                              (F.gzhead.hcrc ? 2 : 0) +
                              (F.gzhead.extra ? 4 : 0) +
                              (F.gzhead.name ? 8 : 0) +
                              (F.gzhead.comment ? 16 : 0),
                          ),
                          et(F, 255 & F.gzhead.time),
                          et(F, (F.gzhead.time >> 8) & 255),
                          et(F, (F.gzhead.time >> 16) & 255),
                          et(F, (F.gzhead.time >> 24) & 255),
                          et(F, F.level === 9 ? 2 : 2 <= F.strategy || F.level < 2 ? 4 : 0),
                          et(F, 255 & F.gzhead.os),
                          F.gzhead.extra &&
                            F.gzhead.extra.length &&
                            (et(F, 255 & F.gzhead.extra.length),
                            et(F, (F.gzhead.extra.length >> 8) & 255)),
                          F.gzhead.hcrc && (p.adler = c(p.adler, F.pending_buf, F.pending, 0)),
                          (F.gzindex = 0),
                          (F.status = 69))
                        : (et(F, 0),
                          et(F, 0),
                          et(F, 0),
                          et(F, 0),
                          et(F, 0),
                          et(F, F.level === 9 ? 2 : 2 <= F.strategy || F.level < 2 ? 4 : 0),
                          et(F, 3),
                          (F.status = T)));
                  else {
                    var G = (v + ((F.w_bits - 8) << 4)) << 8;
                    ((G |=
                      (2 <= F.strategy || F.level < 2
                        ? 0
                        : F.level < 6
                          ? 1
                          : F.level === 6
                            ? 2
                            : 3) << 6),
                      F.strstart !== 0 && (G |= 32),
                      (G += 31 - (G % 31)),
                      (F.status = T),
                      X(F, G),
                      F.strstart !== 0 && (X(F, p.adler >>> 16), X(F, 65535 & p.adler)),
                      (p.adler = 1));
                  }
                if (F.status === 69)
                  if (F.gzhead.extra) {
                    for (
                      S = F.pending;
                      F.gzindex < (65535 & F.gzhead.extra.length) &&
                      (F.pending !== F.pending_buf_size ||
                        (F.gzhead.hcrc &&
                          F.pending > S &&
                          (p.adler = c(p.adler, F.pending_buf, F.pending - S, S)),
                        j(p),
                        (S = F.pending),
                        F.pending !== F.pending_buf_size));
                    )
                      (et(F, 255 & F.gzhead.extra[F.gzindex]), F.gzindex++);
                    (F.gzhead.hcrc &&
                      F.pending > S &&
                      (p.adler = c(p.adler, F.pending_buf, F.pending - S, S)),
                      F.gzindex === F.gzhead.extra.length && ((F.gzindex = 0), (F.status = 73)));
                  } else F.status = 73;
                if (F.status === 73)
                  if (F.gzhead.name) {
                    S = F.pending;
                    do {
                      if (
                        F.pending === F.pending_buf_size &&
                        (F.gzhead.hcrc &&
                          F.pending > S &&
                          (p.adler = c(p.adler, F.pending_buf, F.pending - S, S)),
                        j(p),
                        (S = F.pending),
                        F.pending === F.pending_buf_size)
                      ) {
                        M = 1;
                        break;
                      }
                      ((M =
                        F.gzindex < F.gzhead.name.length
                          ? 255 & F.gzhead.name.charCodeAt(F.gzindex++)
                          : 0),
                        et(F, M));
                    } while (M !== 0);
                    (F.gzhead.hcrc &&
                      F.pending > S &&
                      (p.adler = c(p.adler, F.pending_buf, F.pending - S, S)),
                      M === 0 && ((F.gzindex = 0), (F.status = 91)));
                  } else F.status = 91;
                if (F.status === 91)
                  if (F.gzhead.comment) {
                    S = F.pending;
                    do {
                      if (
                        F.pending === F.pending_buf_size &&
                        (F.gzhead.hcrc &&
                          F.pending > S &&
                          (p.adler = c(p.adler, F.pending_buf, F.pending - S, S)),
                        j(p),
                        (S = F.pending),
                        F.pending === F.pending_buf_size)
                      ) {
                        M = 1;
                        break;
                      }
                      ((M =
                        F.gzindex < F.gzhead.comment.length
                          ? 255 & F.gzhead.comment.charCodeAt(F.gzindex++)
                          : 0),
                        et(F, M));
                    } while (M !== 0);
                    (F.gzhead.hcrc &&
                      F.pending > S &&
                      (p.adler = c(p.adler, F.pending_buf, F.pending - S, S)),
                      M === 0 && (F.status = 103));
                  } else F.status = 103;
                if (
                  (F.status === 103 &&
                    (F.gzhead.hcrc
                      ? (F.pending + 2 > F.pending_buf_size && j(p),
                        F.pending + 2 <= F.pending_buf_size &&
                          (et(F, 255 & p.adler),
                          et(F, (p.adler >> 8) & 255),
                          (p.adler = 0),
                          (F.status = T)))
                      : (F.status = T)),
                  F.pending !== 0)
                ) {
                  if ((j(p), p.avail_out === 0)) return ((F.last_flush = -1), d);
                } else if (p.avail_in === 0 && Z(H) <= Z(W) && H !== h) return tt(p, -5);
                if (F.status === 666 && p.avail_in !== 0) return tt(p, -5);
                if (p.avail_in !== 0 || F.lookahead !== 0 || (H !== f && F.status !== 666)) {
                  var K =
                    F.strategy === 2
                      ? (function (B, q) {
                          for (var J; ; ) {
                            if (B.lookahead === 0 && (ft(B), B.lookahead === 0)) {
                              if (q === f) return w;
                              break;
                            }
                            if (
                              ((B.match_length = 0),
                              (J = s._tr_tally(B, 0, B.window[B.strstart])),
                              B.lookahead--,
                              B.strstart++,
                              J && (D(B, !1), B.strm.avail_out === 0))
                            )
                              return w;
                          }
                          return (
                            (B.insert = 0),
                            q === h
                              ? (D(B, !0), B.strm.avail_out === 0 ? Q : N)
                              : B.last_lit && (D(B, !1), B.strm.avail_out === 0)
                                ? w
                                : R
                          );
                        })(F, H)
                      : F.strategy === 3
                        ? (function (B, q) {
                            for (var J, Y, rt, vt, gt = B.window; ; ) {
                              if (B.lookahead <= x) {
                                if ((ft(B), B.lookahead <= x && q === f)) return w;
                                if (B.lookahead === 0) break;
                              }
                              if (
                                ((B.match_length = 0),
                                B.lookahead >= $ &&
                                  0 < B.strstart &&
                                  (Y = gt[(rt = B.strstart - 1)]) === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  Y === gt[++rt])
                              ) {
                                vt = B.strstart + x;
                                do;
                                while (
                                  Y === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  Y === gt[++rt] &&
                                  rt < vt
                                );
                                ((B.match_length = x - (vt - rt)),
                                  B.match_length > B.lookahead && (B.match_length = B.lookahead));
                              }
                              if (
                                (B.match_length >= $
                                  ? ((J = s._tr_tally(B, 1, B.match_length - $)),
                                    (B.lookahead -= B.match_length),
                                    (B.strstart += B.match_length),
                                    (B.match_length = 0))
                                  : ((J = s._tr_tally(B, 0, B.window[B.strstart])),
                                    B.lookahead--,
                                    B.strstart++),
                                J && (D(B, !1), B.strm.avail_out === 0))
                              )
                                return w;
                            }
                            return (
                              (B.insert = 0),
                              q === h
                                ? (D(B, !0), B.strm.avail_out === 0 ? Q : N)
                                : B.last_lit && (D(B, !1), B.strm.avail_out === 0)
                                  ? w
                                  : R
                            );
                          })(F, H)
                        : r[F.level].func(F, H);
                  if (((K !== Q && K !== N) || (F.status = 666), K === w || K === Q))
                    return (p.avail_out === 0 && (F.last_flush = -1), d);
                  if (
                    K === R &&
                    (H === 1
                      ? s._tr_align(F)
                      : H !== 5 &&
                        (s._tr_stored_block(F, 0, 0, !1),
                        H === 3 &&
                          (nt(F.head),
                          F.lookahead === 0 &&
                            ((F.strstart = 0), (F.block_start = 0), (F.insert = 0)))),
                    j(p),
                    p.avail_out === 0)
                  )
                    return ((F.last_flush = -1), d);
                }
                return H !== h
                  ? d
                  : F.wrap <= 0
                    ? 1
                    : (F.wrap === 2
                        ? (et(F, 255 & p.adler),
                          et(F, (p.adler >> 8) & 255),
                          et(F, (p.adler >> 16) & 255),
                          et(F, (p.adler >> 24) & 255),
                          et(F, 255 & p.total_in),
                          et(F, (p.total_in >> 8) & 255),
                          et(F, (p.total_in >> 16) & 255),
                          et(F, (p.total_in >> 24) & 255))
                        : (X(F, p.adler >>> 16), X(F, 65535 & p.adler)),
                      j(p),
                      0 < F.wrap && (F.wrap = -F.wrap),
                      F.pending !== 0 ? d : 1);
              }),
              (o.deflateEnd = function (p) {
                var H;
                return p && p.state
                  ? (H = p.state.status) !== _ &&
                    H !== 69 &&
                    H !== 73 &&
                    H !== 91 &&
                    H !== 103 &&
                    H !== T &&
                    H !== 666
                    ? tt(p, b)
                    : ((p.state = null), H === T ? tt(p, -3) : d)
                  : b;
              }),
              (o.deflateSetDictionary = function (p, H) {
                var W,
                  F,
                  S,
                  M,
                  G,
                  K,
                  B,
                  q,
                  J = H.length;
                if (
                  !p ||
                  !p.state ||
                  (M = (W = p.state).wrap) === 2 ||
                  (M === 1 && W.status !== _) ||
                  W.lookahead
                )
                  return b;
                for (
                  M === 1 && (p.adler = l(p.adler, H, J, 0)),
                    W.wrap = 0,
                    J >= W.w_size &&
                      (M === 0 &&
                        (nt(W.head), (W.strstart = 0), (W.block_start = 0), (W.insert = 0)),
                      (q = new a.Buf8(W.w_size)),
                      a.arraySet(q, H, J - W.w_size, W.w_size, 0),
                      (H = q),
                      (J = W.w_size)),
                    G = p.avail_in,
                    K = p.next_in,
                    B = p.input,
                    p.avail_in = J,
                    p.next_in = 0,
                    p.input = H,
                    ft(W);
                  W.lookahead >= $;
                ) {
                  for (
                    F = W.strstart, S = W.lookahead - ($ - 1);
                    (W.ins_h = ((W.ins_h << W.hash_shift) ^ W.window[F + $ - 1]) & W.hash_mask),
                      (W.prev[F & W.w_mask] = W.head[W.ins_h]),
                      (W.head[W.ins_h] = F),
                      F++,
                      --S;
                  );
                  ((W.strstart = F), (W.lookahead = $ - 1), ft(W));
                }
                return (
                  (W.strstart += W.lookahead),
                  (W.block_start = W.strstart),
                  (W.insert = W.lookahead),
                  (W.lookahead = 0),
                  (W.match_length = W.prev_length = $ - 1),
                  (W.match_available = 0),
                  (p.next_in = K),
                  (p.input = B),
                  (p.avail_in = G),
                  (W.wrap = M),
                  d
                );
              }),
              (o.deflateInfo = "pako deflate (from Nodeca project)"));
          },
          {
            "../utils/common": 41,
            "./adler32": 43,
            "./crc32": 45,
            "./messages": 51,
            "./trees": 52,
          },
        ],
        47: [
          function (e, i, o) {
            i.exports = function () {
              ((this.text = 0),
                (this.time = 0),
                (this.xflags = 0),
                (this.os = 0),
                (this.extra = null),
                (this.extra_len = 0),
                (this.name = ""),
                (this.comment = ""),
                (this.hcrc = 0),
                (this.done = !1));
            };
          },
          {},
        ],
        48: [
          function (e, i, o) {
            i.exports = function (r, a) {
              var s, l, c, u, f, h, d, b, g, y, m, v, k, C, z, L, A, O, $, x, P, _, T, w, R;
              ((s = r.state),
                (l = r.next_in),
                (w = r.input),
                (c = l + (r.avail_in - 5)),
                (u = r.next_out),
                (R = r.output),
                (f = u - (a - r.avail_out)),
                (h = u + (r.avail_out - 257)),
                (d = s.dmax),
                (b = s.wsize),
                (g = s.whave),
                (y = s.wnext),
                (m = s.window),
                (v = s.hold),
                (k = s.bits),
                (C = s.lencode),
                (z = s.distcode),
                (L = (1 << s.lenbits) - 1),
                (A = (1 << s.distbits) - 1));
              t: do {
                (k < 15 && ((v += w[l++] << k), (k += 8), (v += w[l++] << k), (k += 8)),
                  (O = C[v & L]));
                e: for (;;) {
                  if (((v >>>= $ = O >>> 24), (k -= $), ($ = (O >>> 16) & 255) === 0))
                    R[u++] = 65535 & O;
                  else {
                    if (!(16 & $)) {
                      if (!(64 & $)) {
                        O = C[(65535 & O) + (v & ((1 << $) - 1))];
                        continue e;
                      }
                      if (32 & $) {
                        s.mode = 12;
                        break t;
                      }
                      ((r.msg = "invalid literal/length code"), (s.mode = 30));
                      break t;
                    }
                    ((x = 65535 & O),
                      ($ &= 15) &&
                        (k < $ && ((v += w[l++] << k), (k += 8)),
                        (x += v & ((1 << $) - 1)),
                        (v >>>= $),
                        (k -= $)),
                      k < 15 && ((v += w[l++] << k), (k += 8), (v += w[l++] << k), (k += 8)),
                      (O = z[v & A]));
                    n: for (;;) {
                      if (((v >>>= $ = O >>> 24), (k -= $), !(16 & ($ = (O >>> 16) & 255)))) {
                        if (!(64 & $)) {
                          O = z[(65535 & O) + (v & ((1 << $) - 1))];
                          continue n;
                        }
                        ((r.msg = "invalid distance code"), (s.mode = 30));
                        break t;
                      }
                      if (
                        ((P = 65535 & O),
                        k < ($ &= 15) &&
                          ((v += w[l++] << k), (k += 8) < $ && ((v += w[l++] << k), (k += 8))),
                        d < (P += v & ((1 << $) - 1)))
                      ) {
                        ((r.msg = "invalid distance too far back"), (s.mode = 30));
                        break t;
                      }
                      if (((v >>>= $), (k -= $), ($ = u - f) < P)) {
                        if (g < ($ = P - $) && s.sane) {
                          ((r.msg = "invalid distance too far back"), (s.mode = 30));
                          break t;
                        }
                        if (((T = m), (_ = 0) === y)) {
                          if (((_ += b - $), $ < x)) {
                            for (x -= $; (R[u++] = m[_++]), --$; );
                            ((_ = u - P), (T = R));
                          }
                        } else if (y < $) {
                          if (((_ += b + y - $), ($ -= y) < x)) {
                            for (x -= $; (R[u++] = m[_++]), --$; );
                            if (((_ = 0), y < x)) {
                              for (x -= $ = y; (R[u++] = m[_++]), --$; );
                              ((_ = u - P), (T = R));
                            }
                          }
                        } else if (((_ += y - $), $ < x)) {
                          for (x -= $; (R[u++] = m[_++]), --$; );
                          ((_ = u - P), (T = R));
                        }
                        for (; 2 < x; )
                          ((R[u++] = T[_++]), (R[u++] = T[_++]), (R[u++] = T[_++]), (x -= 3));
                        x && ((R[u++] = T[_++]), 1 < x && (R[u++] = T[_++]));
                      } else {
                        for (
                          _ = u - P;
                          (R[u++] = R[_++]), (R[u++] = R[_++]), (R[u++] = R[_++]), 2 < (x -= 3);
                        );
                        x && ((R[u++] = R[_++]), 1 < x && (R[u++] = R[_++]));
                      }
                      break;
                    }
                  }
                  break;
                }
              } while (l < c && u < h);
              ((l -= x = k >> 3),
                (v &= (1 << (k -= x << 3)) - 1),
                (r.next_in = l),
                (r.next_out = u),
                (r.avail_in = l < c ? c - l + 5 : 5 - (l - c)),
                (r.avail_out = u < h ? h - u + 257 : 257 - (u - h)),
                (s.hold = v),
                (s.bits = k));
            };
          },
          {},
        ],
        49: [
          function (e, i, o) {
            var r = e("../utils/common"),
              a = e("./adler32"),
              s = e("./crc32"),
              l = e("./inffast"),
              c = e("./inftrees"),
              u = 1,
              f = 2,
              h = 0,
              d = -2,
              b = 1,
              g = 852,
              y = 592;
            function m(_) {
              return (
                ((_ >>> 24) & 255) + ((_ >>> 8) & 65280) + ((65280 & _) << 8) + ((255 & _) << 24)
              );
            }
            function v() {
              ((this.mode = 0),
                (this.last = !1),
                (this.wrap = 0),
                (this.havedict = !1),
                (this.flags = 0),
                (this.dmax = 0),
                (this.check = 0),
                (this.total = 0),
                (this.head = null),
                (this.wbits = 0),
                (this.wsize = 0),
                (this.whave = 0),
                (this.wnext = 0),
                (this.window = null),
                (this.hold = 0),
                (this.bits = 0),
                (this.length = 0),
                (this.offset = 0),
                (this.extra = 0),
                (this.lencode = null),
                (this.distcode = null),
                (this.lenbits = 0),
                (this.distbits = 0),
                (this.ncode = 0),
                (this.nlen = 0),
                (this.ndist = 0),
                (this.have = 0),
                (this.next = null),
                (this.lens = new r.Buf16(320)),
                (this.work = new r.Buf16(288)),
                (this.lendyn = null),
                (this.distdyn = null),
                (this.sane = 0),
                (this.back = 0),
                (this.was = 0));
            }
            function k(_) {
              var T;
              return _ && _.state
                ? ((T = _.state),
                  (_.total_in = _.total_out = T.total = 0),
                  (_.msg = ""),
                  T.wrap && (_.adler = 1 & T.wrap),
                  (T.mode = b),
                  (T.last = 0),
                  (T.havedict = 0),
                  (T.dmax = 32768),
                  (T.head = null),
                  (T.hold = 0),
                  (T.bits = 0),
                  (T.lencode = T.lendyn = new r.Buf32(g)),
                  (T.distcode = T.distdyn = new r.Buf32(y)),
                  (T.sane = 1),
                  (T.back = -1),
                  h)
                : d;
            }
            function C(_) {
              var T;
              return _ && _.state
                ? (((T = _.state).wsize = 0), (T.whave = 0), (T.wnext = 0), k(_))
                : d;
            }
            function z(_, T) {
              var w, R;
              return _ && _.state
                ? ((R = _.state),
                  T < 0 ? ((w = 0), (T = -T)) : ((w = 1 + (T >> 4)), T < 48 && (T &= 15)),
                  T && (T < 8 || 15 < T)
                    ? d
                    : (R.window !== null && R.wbits !== T && (R.window = null),
                      (R.wrap = w),
                      (R.wbits = T),
                      C(_)))
                : d;
            }
            function L(_, T) {
              var w, R;
              return _
                ? ((R = new v()),
                  ((_.state = R).window = null),
                  (w = z(_, T)) !== h && (_.state = null),
                  w)
                : d;
            }
            var A,
              O,
              $ = !0;
            function x(_) {
              if ($) {
                var T;
                for (A = new r.Buf32(512), O = new r.Buf32(32), T = 0; T < 144; ) _.lens[T++] = 8;
                for (; T < 256; ) _.lens[T++] = 9;
                for (; T < 280; ) _.lens[T++] = 7;
                for (; T < 288; ) _.lens[T++] = 8;
                for (c(u, _.lens, 0, 288, A, 0, _.work, { bits: 9 }), T = 0; T < 32; )
                  _.lens[T++] = 5;
                (c(f, _.lens, 0, 32, O, 0, _.work, { bits: 5 }), ($ = !1));
              }
              ((_.lencode = A), (_.lenbits = 9), (_.distcode = O), (_.distbits = 5));
            }
            function P(_, T, w, R) {
              var Q,
                N = _.state;
              return (
                N.window === null &&
                  ((N.wsize = 1 << N.wbits),
                  (N.wnext = 0),
                  (N.whave = 0),
                  (N.window = new r.Buf8(N.wsize))),
                R >= N.wsize
                  ? (r.arraySet(N.window, T, w - N.wsize, N.wsize, 0),
                    (N.wnext = 0),
                    (N.whave = N.wsize))
                  : (R < (Q = N.wsize - N.wnext) && (Q = R),
                    r.arraySet(N.window, T, w - R, Q, N.wnext),
                    (R -= Q)
                      ? (r.arraySet(N.window, T, w - R, R, 0), (N.wnext = R), (N.whave = N.wsize))
                      : ((N.wnext += Q),
                        N.wnext === N.wsize && (N.wnext = 0),
                        N.whave < N.wsize && (N.whave += Q))),
                0
              );
            }
            ((o.inflateReset = C),
              (o.inflateReset2 = z),
              (o.inflateResetKeep = k),
              (o.inflateInit = function (_) {
                return L(_, 15);
              }),
              (o.inflateInit2 = L),
              (o.inflate = function (_, T) {
                var w,
                  R,
                  Q,
                  N,
                  tt,
                  Z,
                  nt,
                  j,
                  D,
                  et,
                  X,
                  V,
                  ft,
                  At,
                  ct,
                  mt,
                  Dt,
                  Ft,
                  fe,
                  se,
                  p,
                  H,
                  W,
                  F,
                  S = 0,
                  M = new r.Buf8(4),
                  G = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
                if (!_ || !_.state || !_.output || (!_.input && _.avail_in !== 0)) return d;
                ((w = _.state).mode === 12 && (w.mode = 13),
                  (tt = _.next_out),
                  (Q = _.output),
                  (nt = _.avail_out),
                  (N = _.next_in),
                  (R = _.input),
                  (Z = _.avail_in),
                  (j = w.hold),
                  (D = w.bits),
                  (et = Z),
                  (X = nt),
                  (H = h));
                t: for (;;)
                  switch (w.mode) {
                    case b:
                      if (w.wrap === 0) {
                        w.mode = 13;
                        break;
                      }
                      for (; D < 16; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      if (2 & w.wrap && j === 35615) {
                        ((M[(w.check = 0)] = 255 & j),
                          (M[1] = (j >>> 8) & 255),
                          (w.check = s(w.check, M, 2, 0)),
                          (D = j = 0),
                          (w.mode = 2));
                        break;
                      }
                      if (
                        ((w.flags = 0),
                        w.head && (w.head.done = !1),
                        !(1 & w.wrap) || (((255 & j) << 8) + (j >> 8)) % 31)
                      ) {
                        ((_.msg = "incorrect header check"), (w.mode = 30));
                        break;
                      }
                      if ((15 & j) != 8) {
                        ((_.msg = "unknown compression method"), (w.mode = 30));
                        break;
                      }
                      if (((D -= 4), (p = 8 + (15 & (j >>>= 4))), w.wbits === 0)) w.wbits = p;
                      else if (p > w.wbits) {
                        ((_.msg = "invalid window size"), (w.mode = 30));
                        break;
                      }
                      ((w.dmax = 1 << p),
                        (_.adler = w.check = 1),
                        (w.mode = 512 & j ? 10 : 12),
                        (D = j = 0));
                      break;
                    case 2:
                      for (; D < 16; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      if (((w.flags = j), (255 & w.flags) != 8)) {
                        ((_.msg = "unknown compression method"), (w.mode = 30));
                        break;
                      }
                      if (57344 & w.flags) {
                        ((_.msg = "unknown header flags set"), (w.mode = 30));
                        break;
                      }
                      (w.head && (w.head.text = (j >> 8) & 1),
                        512 & w.flags &&
                          ((M[0] = 255 & j),
                          (M[1] = (j >>> 8) & 255),
                          (w.check = s(w.check, M, 2, 0))),
                        (D = j = 0),
                        (w.mode = 3));
                    case 3:
                      for (; D < 32; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      (w.head && (w.head.time = j),
                        512 & w.flags &&
                          ((M[0] = 255 & j),
                          (M[1] = (j >>> 8) & 255),
                          (M[2] = (j >>> 16) & 255),
                          (M[3] = (j >>> 24) & 255),
                          (w.check = s(w.check, M, 4, 0))),
                        (D = j = 0),
                        (w.mode = 4));
                    case 4:
                      for (; D < 16; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      (w.head && ((w.head.xflags = 255 & j), (w.head.os = j >> 8)),
                        512 & w.flags &&
                          ((M[0] = 255 & j),
                          (M[1] = (j >>> 8) & 255),
                          (w.check = s(w.check, M, 2, 0))),
                        (D = j = 0),
                        (w.mode = 5));
                    case 5:
                      if (1024 & w.flags) {
                        for (; D < 16; ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        ((w.length = j),
                          w.head && (w.head.extra_len = j),
                          512 & w.flags &&
                            ((M[0] = 255 & j),
                            (M[1] = (j >>> 8) & 255),
                            (w.check = s(w.check, M, 2, 0))),
                          (D = j = 0));
                      } else w.head && (w.head.extra = null);
                      w.mode = 6;
                    case 6:
                      if (
                        1024 & w.flags &&
                        (Z < (V = w.length) && (V = Z),
                        V &&
                          (w.head &&
                            ((p = w.head.extra_len - w.length),
                            w.head.extra || (w.head.extra = new Array(w.head.extra_len)),
                            r.arraySet(w.head.extra, R, N, V, p)),
                          512 & w.flags && (w.check = s(w.check, R, V, N)),
                          (Z -= V),
                          (N += V),
                          (w.length -= V)),
                        w.length)
                      )
                        break t;
                      ((w.length = 0), (w.mode = 7));
                    case 7:
                      if (2048 & w.flags) {
                        if (Z === 0) break t;
                        for (
                          V = 0;
                          (p = R[N + V++]),
                            w.head &&
                              p &&
                              w.length < 65536 &&
                              (w.head.name += String.fromCharCode(p)),
                            p && V < Z;
                        );
                        if (
                          (512 & w.flags && (w.check = s(w.check, R, V, N)), (Z -= V), (N += V), p)
                        )
                          break t;
                      } else w.head && (w.head.name = null);
                      ((w.length = 0), (w.mode = 8));
                    case 8:
                      if (4096 & w.flags) {
                        if (Z === 0) break t;
                        for (
                          V = 0;
                          (p = R[N + V++]),
                            w.head &&
                              p &&
                              w.length < 65536 &&
                              (w.head.comment += String.fromCharCode(p)),
                            p && V < Z;
                        );
                        if (
                          (512 & w.flags && (w.check = s(w.check, R, V, N)), (Z -= V), (N += V), p)
                        )
                          break t;
                      } else w.head && (w.head.comment = null);
                      w.mode = 9;
                    case 9:
                      if (512 & w.flags) {
                        for (; D < 16; ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        if (j !== (65535 & w.check)) {
                          ((_.msg = "header crc mismatch"), (w.mode = 30));
                          break;
                        }
                        D = j = 0;
                      }
                      (w.head && ((w.head.hcrc = (w.flags >> 9) & 1), (w.head.done = !0)),
                        (_.adler = w.check = 0),
                        (w.mode = 12));
                      break;
                    case 10:
                      for (; D < 32; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      ((_.adler = w.check = m(j)), (D = j = 0), (w.mode = 11));
                    case 11:
                      if (w.havedict === 0)
                        return (
                          (_.next_out = tt),
                          (_.avail_out = nt),
                          (_.next_in = N),
                          (_.avail_in = Z),
                          (w.hold = j),
                          (w.bits = D),
                          2
                        );
                      ((_.adler = w.check = 1), (w.mode = 12));
                    case 12:
                      if (T === 5 || T === 6) break t;
                    case 13:
                      if (w.last) {
                        ((j >>>= 7 & D), (D -= 7 & D), (w.mode = 27));
                        break;
                      }
                      for (; D < 3; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      switch (((w.last = 1 & j), (D -= 1), 3 & (j >>>= 1))) {
                        case 0:
                          w.mode = 14;
                          break;
                        case 1:
                          if ((x(w), (w.mode = 20), T !== 6)) break;
                          ((j >>>= 2), (D -= 2));
                          break t;
                        case 2:
                          w.mode = 17;
                          break;
                        case 3:
                          ((_.msg = "invalid block type"), (w.mode = 30));
                      }
                      ((j >>>= 2), (D -= 2));
                      break;
                    case 14:
                      for (j >>>= 7 & D, D -= 7 & D; D < 32; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      if ((65535 & j) != ((j >>> 16) ^ 65535)) {
                        ((_.msg = "invalid stored block lengths"), (w.mode = 30));
                        break;
                      }
                      if (((w.length = 65535 & j), (D = j = 0), (w.mode = 15), T === 6)) break t;
                    case 15:
                      w.mode = 16;
                    case 16:
                      if ((V = w.length)) {
                        if ((Z < V && (V = Z), nt < V && (V = nt), V === 0)) break t;
                        (r.arraySet(Q, R, N, V, tt),
                          (Z -= V),
                          (N += V),
                          (nt -= V),
                          (tt += V),
                          (w.length -= V));
                        break;
                      }
                      w.mode = 12;
                      break;
                    case 17:
                      for (; D < 14; ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      if (
                        ((w.nlen = 257 + (31 & j)),
                        (j >>>= 5),
                        (D -= 5),
                        (w.ndist = 1 + (31 & j)),
                        (j >>>= 5),
                        (D -= 5),
                        (w.ncode = 4 + (15 & j)),
                        (j >>>= 4),
                        (D -= 4),
                        286 < w.nlen || 30 < w.ndist)
                      ) {
                        ((_.msg = "too many length or distance symbols"), (w.mode = 30));
                        break;
                      }
                      ((w.have = 0), (w.mode = 18));
                    case 18:
                      for (; w.have < w.ncode; ) {
                        for (; D < 3; ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        ((w.lens[G[w.have++]] = 7 & j), (j >>>= 3), (D -= 3));
                      }
                      for (; w.have < 19; ) w.lens[G[w.have++]] = 0;
                      if (
                        ((w.lencode = w.lendyn),
                        (w.lenbits = 7),
                        (W = { bits: w.lenbits }),
                        (H = c(0, w.lens, 0, 19, w.lencode, 0, w.work, W)),
                        (w.lenbits = W.bits),
                        H)
                      ) {
                        ((_.msg = "invalid code lengths set"), (w.mode = 30));
                        break;
                      }
                      ((w.have = 0), (w.mode = 19));
                    case 19:
                      for (; w.have < w.nlen + w.ndist; ) {
                        for (
                          ;
                          (mt = ((S = w.lencode[j & ((1 << w.lenbits) - 1)]) >>> 16) & 255),
                            (Dt = 65535 & S),
                            !((ct = S >>> 24) <= D);
                        ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        if (Dt < 16) ((j >>>= ct), (D -= ct), (w.lens[w.have++] = Dt));
                        else {
                          if (Dt === 16) {
                            for (F = ct + 2; D < F; ) {
                              if (Z === 0) break t;
                              (Z--, (j += R[N++] << D), (D += 8));
                            }
                            if (((j >>>= ct), (D -= ct), w.have === 0)) {
                              ((_.msg = "invalid bit length repeat"), (w.mode = 30));
                              break;
                            }
                            ((p = w.lens[w.have - 1]), (V = 3 + (3 & j)), (j >>>= 2), (D -= 2));
                          } else if (Dt === 17) {
                            for (F = ct + 3; D < F; ) {
                              if (Z === 0) break t;
                              (Z--, (j += R[N++] << D), (D += 8));
                            }
                            ((D -= ct), (p = 0), (V = 3 + (7 & (j >>>= ct))), (j >>>= 3), (D -= 3));
                          } else {
                            for (F = ct + 7; D < F; ) {
                              if (Z === 0) break t;
                              (Z--, (j += R[N++] << D), (D += 8));
                            }
                            ((D -= ct),
                              (p = 0),
                              (V = 11 + (127 & (j >>>= ct))),
                              (j >>>= 7),
                              (D -= 7));
                          }
                          if (w.have + V > w.nlen + w.ndist) {
                            ((_.msg = "invalid bit length repeat"), (w.mode = 30));
                            break;
                          }
                          for (; V--; ) w.lens[w.have++] = p;
                        }
                      }
                      if (w.mode === 30) break;
                      if (w.lens[256] === 0) {
                        ((_.msg = "invalid code -- missing end-of-block"), (w.mode = 30));
                        break;
                      }
                      if (
                        ((w.lenbits = 9),
                        (W = { bits: w.lenbits }),
                        (H = c(u, w.lens, 0, w.nlen, w.lencode, 0, w.work, W)),
                        (w.lenbits = W.bits),
                        H)
                      ) {
                        ((_.msg = "invalid literal/lengths set"), (w.mode = 30));
                        break;
                      }
                      if (
                        ((w.distbits = 6),
                        (w.distcode = w.distdyn),
                        (W = { bits: w.distbits }),
                        (H = c(f, w.lens, w.nlen, w.ndist, w.distcode, 0, w.work, W)),
                        (w.distbits = W.bits),
                        H)
                      ) {
                        ((_.msg = "invalid distances set"), (w.mode = 30));
                        break;
                      }
                      if (((w.mode = 20), T === 6)) break t;
                    case 20:
                      w.mode = 21;
                    case 21:
                      if (6 <= Z && 258 <= nt) {
                        ((_.next_out = tt),
                          (_.avail_out = nt),
                          (_.next_in = N),
                          (_.avail_in = Z),
                          (w.hold = j),
                          (w.bits = D),
                          l(_, X),
                          (tt = _.next_out),
                          (Q = _.output),
                          (nt = _.avail_out),
                          (N = _.next_in),
                          (R = _.input),
                          (Z = _.avail_in),
                          (j = w.hold),
                          (D = w.bits),
                          w.mode === 12 && (w.back = -1));
                        break;
                      }
                      for (
                        w.back = 0;
                        (mt = ((S = w.lencode[j & ((1 << w.lenbits) - 1)]) >>> 16) & 255),
                          (Dt = 65535 & S),
                          !((ct = S >>> 24) <= D);
                      ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      if (mt && !(240 & mt)) {
                        for (
                          Ft = ct, fe = mt, se = Dt;
                          (mt =
                            ((S = w.lencode[se + ((j & ((1 << (Ft + fe)) - 1)) >> Ft)]) >>> 16) &
                            255),
                            (Dt = 65535 & S),
                            !(Ft + (ct = S >>> 24) <= D);
                        ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        ((j >>>= Ft), (D -= Ft), (w.back += Ft));
                      }
                      if (((j >>>= ct), (D -= ct), (w.back += ct), (w.length = Dt), mt === 0)) {
                        w.mode = 26;
                        break;
                      }
                      if (32 & mt) {
                        ((w.back = -1), (w.mode = 12));
                        break;
                      }
                      if (64 & mt) {
                        ((_.msg = "invalid literal/length code"), (w.mode = 30));
                        break;
                      }
                      ((w.extra = 15 & mt), (w.mode = 22));
                    case 22:
                      if (w.extra) {
                        for (F = w.extra; D < F; ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        ((w.length += j & ((1 << w.extra) - 1)),
                          (j >>>= w.extra),
                          (D -= w.extra),
                          (w.back += w.extra));
                      }
                      ((w.was = w.length), (w.mode = 23));
                    case 23:
                      for (
                        ;
                        (mt = ((S = w.distcode[j & ((1 << w.distbits) - 1)]) >>> 16) & 255),
                          (Dt = 65535 & S),
                          !((ct = S >>> 24) <= D);
                      ) {
                        if (Z === 0) break t;
                        (Z--, (j += R[N++] << D), (D += 8));
                      }
                      if (!(240 & mt)) {
                        for (
                          Ft = ct, fe = mt, se = Dt;
                          (mt =
                            ((S = w.distcode[se + ((j & ((1 << (Ft + fe)) - 1)) >> Ft)]) >>> 16) &
                            255),
                            (Dt = 65535 & S),
                            !(Ft + (ct = S >>> 24) <= D);
                        ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        ((j >>>= Ft), (D -= Ft), (w.back += Ft));
                      }
                      if (((j >>>= ct), (D -= ct), (w.back += ct), 64 & mt)) {
                        ((_.msg = "invalid distance code"), (w.mode = 30));
                        break;
                      }
                      ((w.offset = Dt), (w.extra = 15 & mt), (w.mode = 24));
                    case 24:
                      if (w.extra) {
                        for (F = w.extra; D < F; ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        ((w.offset += j & ((1 << w.extra) - 1)),
                          (j >>>= w.extra),
                          (D -= w.extra),
                          (w.back += w.extra));
                      }
                      if (w.offset > w.dmax) {
                        ((_.msg = "invalid distance too far back"), (w.mode = 30));
                        break;
                      }
                      w.mode = 25;
                    case 25:
                      if (nt === 0) break t;
                      if (((V = X - nt), w.offset > V)) {
                        if ((V = w.offset - V) > w.whave && w.sane) {
                          ((_.msg = "invalid distance too far back"), (w.mode = 30));
                          break;
                        }
                        ((ft = V > w.wnext ? ((V -= w.wnext), w.wsize - V) : w.wnext - V),
                          V > w.length && (V = w.length),
                          (At = w.window));
                      } else ((At = Q), (ft = tt - w.offset), (V = w.length));
                      for (nt < V && (V = nt), nt -= V, w.length -= V; (Q[tt++] = At[ft++]), --V; );
                      w.length === 0 && (w.mode = 21);
                      break;
                    case 26:
                      if (nt === 0) break t;
                      ((Q[tt++] = w.length), nt--, (w.mode = 21));
                      break;
                    case 27:
                      if (w.wrap) {
                        for (; D < 32; ) {
                          if (Z === 0) break t;
                          (Z--, (j |= R[N++] << D), (D += 8));
                        }
                        if (
                          ((X -= nt),
                          (_.total_out += X),
                          (w.total += X),
                          X &&
                            (_.adler = w.check =
                              w.flags ? s(w.check, Q, X, tt - X) : a(w.check, Q, X, tt - X)),
                          (X = nt),
                          (w.flags ? j : m(j)) !== w.check)
                        ) {
                          ((_.msg = "incorrect data check"), (w.mode = 30));
                          break;
                        }
                        D = j = 0;
                      }
                      w.mode = 28;
                    case 28:
                      if (w.wrap && w.flags) {
                        for (; D < 32; ) {
                          if (Z === 0) break t;
                          (Z--, (j += R[N++] << D), (D += 8));
                        }
                        if (j !== (4294967295 & w.total)) {
                          ((_.msg = "incorrect length check"), (w.mode = 30));
                          break;
                        }
                        D = j = 0;
                      }
                      w.mode = 29;
                    case 29:
                      H = 1;
                      break t;
                    case 30:
                      H = -3;
                      break t;
                    case 31:
                      return -4;
                    case 32:
                    default:
                      return d;
                  }
                return (
                  (_.next_out = tt),
                  (_.avail_out = nt),
                  (_.next_in = N),
                  (_.avail_in = Z),
                  (w.hold = j),
                  (w.bits = D),
                  (w.wsize || (X !== _.avail_out && w.mode < 30 && (w.mode < 27 || T !== 4))) &&
                  P(_, _.output, _.next_out, X - _.avail_out)
                    ? ((w.mode = 31), -4)
                    : ((et -= _.avail_in),
                      (X -= _.avail_out),
                      (_.total_in += et),
                      (_.total_out += X),
                      (w.total += X),
                      w.wrap &&
                        X &&
                        (_.adler = w.check =
                          w.flags
                            ? s(w.check, Q, X, _.next_out - X)
                            : a(w.check, Q, X, _.next_out - X)),
                      (_.data_type =
                        w.bits +
                        (w.last ? 64 : 0) +
                        (w.mode === 12 ? 128 : 0) +
                        (w.mode === 20 || w.mode === 15 ? 256 : 0)),
                      ((et == 0 && X === 0) || T === 4) && H === h && (H = -5),
                      H)
                );
              }),
              (o.inflateEnd = function (_) {
                if (!_ || !_.state) return d;
                var T = _.state;
                return (T.window && (T.window = null), (_.state = null), h);
              }),
              (o.inflateGetHeader = function (_, T) {
                var w;
                return _ && _.state && 2 & (w = _.state).wrap ? (((w.head = T).done = !1), h) : d;
              }),
              (o.inflateSetDictionary = function (_, T) {
                var w,
                  R = T.length;
                return _ && _.state
                  ? (w = _.state).wrap !== 0 && w.mode !== 11
                    ? d
                    : w.mode === 11 && a(1, T, R, 0) !== w.check
                      ? -3
                      : P(_, T, R, R)
                        ? ((w.mode = 31), -4)
                        : ((w.havedict = 1), h)
                  : d;
              }),
              (o.inflateInfo = "pako inflate (from Nodeca project)"));
          },
          {
            "../utils/common": 41,
            "./adler32": 43,
            "./crc32": 45,
            "./inffast": 48,
            "./inftrees": 50,
          },
        ],
        50: [
          function (e, i, o) {
            var r = e("../utils/common"),
              a = [
                3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99,
                115, 131, 163, 195, 227, 258, 0, 0,
              ],
              s = [
                16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20,
                20, 20, 20, 21, 21, 21, 21, 16, 72, 78,
              ],
              l = [
                1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025,
                1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0,
              ],
              c = [
                16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25,
                25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
              ];
            i.exports = function (u, f, h, d, b, g, y, m) {
              var v,
                k,
                C,
                z,
                L,
                A,
                O,
                $,
                x,
                P = m.bits,
                _ = 0,
                T = 0,
                w = 0,
                R = 0,
                Q = 0,
                N = 0,
                tt = 0,
                Z = 0,
                nt = 0,
                j = 0,
                D = null,
                et = 0,
                X = new r.Buf16(16),
                V = new r.Buf16(16),
                ft = null,
                At = 0;
              for (_ = 0; _ <= 15; _++) X[_] = 0;
              for (T = 0; T < d; T++) X[f[h + T]]++;
              for (Q = P, R = 15; 1 <= R && X[R] === 0; R--);
              if ((R < Q && (Q = R), R === 0))
                return ((b[g++] = 20971520), (b[g++] = 20971520), (m.bits = 1), 0);
              for (w = 1; w < R && X[w] === 0; w++);
              for (Q < w && (Q = w), _ = Z = 1; _ <= 15; _++)
                if (((Z <<= 1), (Z -= X[_]) < 0)) return -1;
              if (0 < Z && (u === 0 || R !== 1)) return -1;
              for (V[1] = 0, _ = 1; _ < 15; _++) V[_ + 1] = V[_] + X[_];
              for (T = 0; T < d; T++) f[h + T] !== 0 && (y[V[f[h + T]]++] = T);
              if (
                ((A =
                  u === 0
                    ? ((D = ft = y), 19)
                    : u === 1
                      ? ((D = a), (et -= 257), (ft = s), (At -= 257), 256)
                      : ((D = l), (ft = c), -1)),
                (_ = w),
                (L = g),
                (tt = T = j = 0),
                (C = -1),
                (z = (nt = 1 << (N = Q)) - 1),
                (u === 1 && 852 < nt) || (u === 2 && 592 < nt))
              )
                return 1;
              for (;;) {
                for (
                  O = _ - tt,
                    x =
                      y[T] < A
                        ? (($ = 0), y[T])
                        : y[T] > A
                          ? (($ = ft[At + y[T]]), D[et + y[T]])
                          : (($ = 96), 0),
                    v = 1 << (_ - tt),
                    w = k = 1 << N;
                  (b[L + (j >> tt) + (k -= v)] = (O << 24) | ($ << 16) | x | 0), k !== 0;
                );
                for (v = 1 << (_ - 1); j & v; ) v >>= 1;
                if ((v !== 0 ? ((j &= v - 1), (j += v)) : (j = 0), T++, --X[_] == 0)) {
                  if (_ === R) break;
                  _ = f[h + y[T]];
                }
                if (Q < _ && (j & z) !== C) {
                  for (
                    tt === 0 && (tt = Q), L += w, Z = 1 << (N = _ - tt);
                    N + tt < R && !((Z -= X[N + tt]) <= 0);
                  )
                    (N++, (Z <<= 1));
                  if (((nt += 1 << N), (u === 1 && 852 < nt) || (u === 2 && 592 < nt))) return 1;
                  b[(C = j & z)] = (Q << 24) | (N << 16) | (L - g) | 0;
                }
              }
              return (j !== 0 && (b[L + j] = ((_ - tt) << 24) | (64 << 16) | 0), (m.bits = Q), 0);
            };
          },
          { "../utils/common": 41 },
        ],
        51: [
          function (e, i, o) {
            i.exports = {
              2: "need dictionary",
              1: "stream end",
              0: "",
              "-1": "file error",
              "-2": "stream error",
              "-3": "data error",
              "-4": "insufficient memory",
              "-5": "buffer error",
              "-6": "incompatible version",
            };
          },
          {},
        ],
        52: [
          function (e, i, o) {
            var r = e("../utils/common"),
              a = 0,
              s = 1;
            function l(S) {
              for (var M = S.length; 0 <= --M; ) S[M] = 0;
            }
            var c = 0,
              u = 29,
              f = 256,
              h = f + 1 + u,
              d = 30,
              b = 19,
              g = 2 * h + 1,
              y = 15,
              m = 16,
              v = 7,
              k = 256,
              C = 16,
              z = 17,
              L = 18,
              A = [
                0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
                0,
              ],
              O = [
                0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
                12, 12, 13, 13,
              ],
              $ = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
              x = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
              P = new Array(2 * (h + 2));
            l(P);
            var _ = new Array(2 * d);
            l(_);
            var T = new Array(512);
            l(T);
            var w = new Array(256);
            l(w);
            var R = new Array(u);
            l(R);
            var Q,
              N,
              tt,
              Z = new Array(d);
            function nt(S, M, G, K, B) {
              ((this.static_tree = S),
                (this.extra_bits = M),
                (this.extra_base = G),
                (this.elems = K),
                (this.max_length = B),
                (this.has_stree = S && S.length));
            }
            function j(S, M) {
              ((this.dyn_tree = S), (this.max_code = 0), (this.stat_desc = M));
            }
            function D(S) {
              return S < 256 ? T[S] : T[256 + (S >>> 7)];
            }
            function et(S, M) {
              ((S.pending_buf[S.pending++] = 255 & M),
                (S.pending_buf[S.pending++] = (M >>> 8) & 255));
            }
            function X(S, M, G) {
              S.bi_valid > m - G
                ? ((S.bi_buf |= (M << S.bi_valid) & 65535),
                  et(S, S.bi_buf),
                  (S.bi_buf = M >> (m - S.bi_valid)),
                  (S.bi_valid += G - m))
                : ((S.bi_buf |= (M << S.bi_valid) & 65535), (S.bi_valid += G));
            }
            function V(S, M, G) {
              X(S, G[2 * M], G[2 * M + 1]);
            }
            function ft(S, M) {
              for (var G = 0; (G |= 1 & S), (S >>>= 1), (G <<= 1), 0 < --M; );
              return G >>> 1;
            }
            function At(S, M, G) {
              var K,
                B,
                q = new Array(y + 1),
                J = 0;
              for (K = 1; K <= y; K++) q[K] = J = (J + G[K - 1]) << 1;
              for (B = 0; B <= M; B++) {
                var Y = S[2 * B + 1];
                Y !== 0 && (S[2 * B] = ft(q[Y]++, Y));
              }
            }
            function ct(S) {
              var M;
              for (M = 0; M < h; M++) S.dyn_ltree[2 * M] = 0;
              for (M = 0; M < d; M++) S.dyn_dtree[2 * M] = 0;
              for (M = 0; M < b; M++) S.bl_tree[2 * M] = 0;
              ((S.dyn_ltree[2 * k] = 1),
                (S.opt_len = S.static_len = 0),
                (S.last_lit = S.matches = 0));
            }
            function mt(S) {
              (8 < S.bi_valid
                ? et(S, S.bi_buf)
                : 0 < S.bi_valid && (S.pending_buf[S.pending++] = S.bi_buf),
                (S.bi_buf = 0),
                (S.bi_valid = 0));
            }
            function Dt(S, M, G, K) {
              var B = 2 * M,
                q = 2 * G;
              return S[B] < S[q] || (S[B] === S[q] && K[M] <= K[G]);
            }
            function Ft(S, M, G) {
              for (
                var K = S.heap[G], B = G << 1;
                B <= S.heap_len &&
                (B < S.heap_len && Dt(M, S.heap[B + 1], S.heap[B], S.depth) && B++,
                !Dt(M, K, S.heap[B], S.depth));
              )
                ((S.heap[G] = S.heap[B]), (G = B), (B <<= 1));
              S.heap[G] = K;
            }
            function fe(S, M, G) {
              var K,
                B,
                q,
                J,
                Y = 0;
              if (S.last_lit !== 0)
                for (
                  ;
                  (K = (S.pending_buf[S.d_buf + 2 * Y] << 8) | S.pending_buf[S.d_buf + 2 * Y + 1]),
                    (B = S.pending_buf[S.l_buf + Y]),
                    Y++,
                    K === 0
                      ? V(S, B, M)
                      : (V(S, (q = w[B]) + f + 1, M),
                        (J = A[q]) !== 0 && X(S, (B -= R[q]), J),
                        V(S, (q = D(--K)), G),
                        (J = O[q]) !== 0 && X(S, (K -= Z[q]), J)),
                    Y < S.last_lit;
                );
              V(S, k, M);
            }
            function se(S, M) {
              var G,
                K,
                B,
                q = M.dyn_tree,
                J = M.stat_desc.static_tree,
                Y = M.stat_desc.has_stree,
                rt = M.stat_desc.elems,
                vt = -1;
              for (S.heap_len = 0, S.heap_max = g, G = 0; G < rt; G++)
                q[2 * G] !== 0
                  ? ((S.heap[++S.heap_len] = vt = G), (S.depth[G] = 0))
                  : (q[2 * G + 1] = 0);
              for (; S.heap_len < 2; )
                ((q[2 * (B = S.heap[++S.heap_len] = vt < 2 ? ++vt : 0)] = 1),
                  (S.depth[B] = 0),
                  S.opt_len--,
                  Y && (S.static_len -= J[2 * B + 1]));
              for (M.max_code = vt, G = S.heap_len >> 1; 1 <= G; G--) Ft(S, q, G);
              for (
                B = rt;
                (G = S.heap[1]),
                  (S.heap[1] = S.heap[S.heap_len--]),
                  Ft(S, q, 1),
                  (K = S.heap[1]),
                  (S.heap[--S.heap_max] = G),
                  (S.heap[--S.heap_max] = K),
                  (q[2 * B] = q[2 * G] + q[2 * K]),
                  (S.depth[B] = (S.depth[G] >= S.depth[K] ? S.depth[G] : S.depth[K]) + 1),
                  (q[2 * G + 1] = q[2 * K + 1] = B),
                  (S.heap[1] = B++),
                  Ft(S, q, 1),
                  2 <= S.heap_len;
              );
              ((S.heap[--S.heap_max] = S.heap[1]),
                (function (gt, re) {
                  var rn,
                    de,
                    on,
                    It,
                    In,
                    Ar,
                    be = re.dyn_tree,
                    pi = re.max_code,
                    ua = re.stat_desc.static_tree,
                    fa = re.stat_desc.has_stree,
                    da = re.stat_desc.extra_bits,
                    mi = re.stat_desc.extra_base,
                    an = re.stat_desc.max_length,
                    On = 0;
                  for (It = 0; It <= y; It++) gt.bl_count[It] = 0;
                  for (be[2 * gt.heap[gt.heap_max] + 1] = 0, rn = gt.heap_max + 1; rn < g; rn++)
                    (an < (It = be[2 * be[2 * (de = gt.heap[rn]) + 1] + 1] + 1) &&
                      ((It = an), On++),
                      (be[2 * de + 1] = It),
                      pi < de ||
                        (gt.bl_count[It]++,
                        (In = 0),
                        mi <= de && (In = da[de - mi]),
                        (Ar = be[2 * de]),
                        (gt.opt_len += Ar * (It + In)),
                        fa && (gt.static_len += Ar * (ua[2 * de + 1] + In))));
                  if (On !== 0) {
                    do {
                      for (It = an - 1; gt.bl_count[It] === 0; ) It--;
                      (gt.bl_count[It]--, (gt.bl_count[It + 1] += 2), gt.bl_count[an]--, (On -= 2));
                    } while (0 < On);
                    for (It = an; It !== 0; It--)
                      for (de = gt.bl_count[It]; de !== 0; )
                        pi < (on = gt.heap[--rn]) ||
                          (be[2 * on + 1] !== It &&
                            ((gt.opt_len += (It - be[2 * on + 1]) * be[2 * on]),
                            (be[2 * on + 1] = It)),
                          de--);
                  }
                })(S, M),
                At(q, vt, S.bl_count));
            }
            function p(S, M, G) {
              var K,
                B,
                q = -1,
                J = M[1],
                Y = 0,
                rt = 7,
                vt = 4;
              for (
                J === 0 && ((rt = 138), (vt = 3)), M[2 * (G + 1) + 1] = 65535, K = 0;
                K <= G;
                K++
              )
                ((B = J),
                  (J = M[2 * (K + 1) + 1]),
                  (++Y < rt && B === J) ||
                    (Y < vt
                      ? (S.bl_tree[2 * B] += Y)
                      : B !== 0
                        ? (B !== q && S.bl_tree[2 * B]++, S.bl_tree[2 * C]++)
                        : Y <= 10
                          ? S.bl_tree[2 * z]++
                          : S.bl_tree[2 * L]++,
                    (q = B),
                    (vt =
                      (Y = 0) === J ? ((rt = 138), 3) : B === J ? ((rt = 6), 3) : ((rt = 7), 4))));
            }
            function H(S, M, G) {
              var K,
                B,
                q = -1,
                J = M[1],
                Y = 0,
                rt = 7,
                vt = 4;
              for (J === 0 && ((rt = 138), (vt = 3)), K = 0; K <= G; K++)
                if (((B = J), (J = M[2 * (K + 1) + 1]), !(++Y < rt && B === J))) {
                  if (Y < vt) for (; V(S, B, S.bl_tree), --Y != 0; );
                  else
                    B !== 0
                      ? (B !== q && (V(S, B, S.bl_tree), Y--), V(S, C, S.bl_tree), X(S, Y - 3, 2))
                      : Y <= 10
                        ? (V(S, z, S.bl_tree), X(S, Y - 3, 3))
                        : (V(S, L, S.bl_tree), X(S, Y - 11, 7));
                  ((q = B),
                    (vt =
                      (Y = 0) === J ? ((rt = 138), 3) : B === J ? ((rt = 6), 3) : ((rt = 7), 4)));
                }
            }
            l(Z);
            var W = !1;
            function F(S, M, G, K) {
              (X(S, (c << 1) + (K ? 1 : 0), 3),
                (function (B, q, J, Y) {
                  (mt(B),
                    et(B, J),
                    et(B, ~J),
                    r.arraySet(B.pending_buf, B.window, q, J, B.pending),
                    (B.pending += J));
                })(S, M, G));
            }
            ((o._tr_init = function (S) {
              (W ||
                ((function () {
                  var M,
                    G,
                    K,
                    B,
                    q,
                    J = new Array(y + 1);
                  for (B = K = 0; B < u - 1; B++)
                    for (R[B] = K, M = 0; M < 1 << A[B]; M++) w[K++] = B;
                  for (w[K - 1] = B, B = q = 0; B < 16; B++)
                    for (Z[B] = q, M = 0; M < 1 << O[B]; M++) T[q++] = B;
                  for (q >>= 7; B < d; B++)
                    for (Z[B] = q << 7, M = 0; M < 1 << (O[B] - 7); M++) T[256 + q++] = B;
                  for (G = 0; G <= y; G++) J[G] = 0;
                  for (M = 0; M <= 143; ) ((P[2 * M + 1] = 8), M++, J[8]++);
                  for (; M <= 255; ) ((P[2 * M + 1] = 9), M++, J[9]++);
                  for (; M <= 279; ) ((P[2 * M + 1] = 7), M++, J[7]++);
                  for (; M <= 287; ) ((P[2 * M + 1] = 8), M++, J[8]++);
                  for (At(P, h + 1, J), M = 0; M < d; M++)
                    ((_[2 * M + 1] = 5), (_[2 * M] = ft(M, 5)));
                  ((Q = new nt(P, A, f + 1, h, y)),
                    (N = new nt(_, O, 0, d, y)),
                    (tt = new nt(new Array(0), $, 0, b, v)));
                })(),
                (W = !0)),
                (S.l_desc = new j(S.dyn_ltree, Q)),
                (S.d_desc = new j(S.dyn_dtree, N)),
                (S.bl_desc = new j(S.bl_tree, tt)),
                (S.bi_buf = 0),
                (S.bi_valid = 0),
                ct(S));
            }),
              (o._tr_stored_block = F),
              (o._tr_flush_block = function (S, M, G, K) {
                var B,
                  q,
                  J = 0;
                (0 < S.level
                  ? (S.strm.data_type === 2 &&
                      (S.strm.data_type = (function (Y) {
                        var rt,
                          vt = 4093624447;
                        for (rt = 0; rt <= 31; rt++, vt >>>= 1)
                          if (1 & vt && Y.dyn_ltree[2 * rt] !== 0) return a;
                        if (Y.dyn_ltree[18] !== 0 || Y.dyn_ltree[20] !== 0 || Y.dyn_ltree[26] !== 0)
                          return s;
                        for (rt = 32; rt < f; rt++) if (Y.dyn_ltree[2 * rt] !== 0) return s;
                        return a;
                      })(S)),
                    se(S, S.l_desc),
                    se(S, S.d_desc),
                    (J = (function (Y) {
                      var rt;
                      for (
                        p(Y, Y.dyn_ltree, Y.l_desc.max_code),
                          p(Y, Y.dyn_dtree, Y.d_desc.max_code),
                          se(Y, Y.bl_desc),
                          rt = b - 1;
                        3 <= rt && Y.bl_tree[2 * x[rt] + 1] === 0;
                        rt--
                      );
                      return ((Y.opt_len += 3 * (rt + 1) + 5 + 5 + 4), rt);
                    })(S)),
                    (B = (S.opt_len + 3 + 7) >>> 3),
                    (q = (S.static_len + 3 + 7) >>> 3) <= B && (B = q))
                  : (B = q = G + 5),
                  G + 4 <= B && M !== -1
                    ? F(S, M, G, K)
                    : S.strategy === 4 || q === B
                      ? (X(S, 2 + (K ? 1 : 0), 3), fe(S, P, _))
                      : (X(S, 4 + (K ? 1 : 0), 3),
                        (function (Y, rt, vt, gt) {
                          var re;
                          for (
                            X(Y, rt - 257, 5), X(Y, vt - 1, 5), X(Y, gt - 4, 4), re = 0;
                            re < gt;
                            re++
                          )
                            X(Y, Y.bl_tree[2 * x[re] + 1], 3);
                          (H(Y, Y.dyn_ltree, rt - 1), H(Y, Y.dyn_dtree, vt - 1));
                        })(S, S.l_desc.max_code + 1, S.d_desc.max_code + 1, J + 1),
                        fe(S, S.dyn_ltree, S.dyn_dtree)),
                  ct(S),
                  K && mt(S));
              }),
              (o._tr_tally = function (S, M, G) {
                return (
                  (S.pending_buf[S.d_buf + 2 * S.last_lit] = (M >>> 8) & 255),
                  (S.pending_buf[S.d_buf + 2 * S.last_lit + 1] = 255 & M),
                  (S.pending_buf[S.l_buf + S.last_lit] = 255 & G),
                  S.last_lit++,
                  M === 0
                    ? S.dyn_ltree[2 * G]++
                    : (S.matches++,
                      M--,
                      S.dyn_ltree[2 * (w[G] + f + 1)]++,
                      S.dyn_dtree[2 * D(M)]++),
                  S.last_lit === S.lit_bufsize - 1
                );
              }),
              (o._tr_align = function (S) {
                (X(S, 2, 3),
                  V(S, k, P),
                  (function (M) {
                    M.bi_valid === 16
                      ? (et(M, M.bi_buf), (M.bi_buf = 0), (M.bi_valid = 0))
                      : 8 <= M.bi_valid &&
                        ((M.pending_buf[M.pending++] = 255 & M.bi_buf),
                        (M.bi_buf >>= 8),
                        (M.bi_valid -= 8));
                  })(S));
              }));
          },
          { "../utils/common": 41 },
        ],
        53: [
          function (e, i, o) {
            i.exports = function () {
              ((this.input = null),
                (this.next_in = 0),
                (this.avail_in = 0),
                (this.total_in = 0),
                (this.output = null),
                (this.next_out = 0),
                (this.avail_out = 0),
                (this.total_out = 0),
                (this.msg = ""),
                (this.state = null),
                (this.data_type = 2),
                (this.adler = 0));
            };
          },
          {},
        ],
        54: [
          function (e, i, o) {
            (function (r) {
              (function (a, s) {
                if (!a.setImmediate) {
                  var l,
                    c,
                    u,
                    f,
                    h = 1,
                    d = {},
                    b = !1,
                    g = a.document,
                    y = Object.getPrototypeOf && Object.getPrototypeOf(a);
                  ((y = y && y.setTimeout ? y : a),
                    (l =
                      {}.toString.call(a.process) === "[object process]"
                        ? function (C) {
                            process.nextTick(function () {
                              v(C);
                            });
                          }
                        : (function () {
                              if (a.postMessage && !a.importScripts) {
                                var C = !0,
                                  z = a.onmessage;
                                return (
                                  (a.onmessage = function () {
                                    C = !1;
                                  }),
                                  a.postMessage("", "*"),
                                  (a.onmessage = z),
                                  C
                                );
                              }
                            })()
                          ? ((f = "setImmediate$" + Math.random() + "$"),
                            a.addEventListener
                              ? a.addEventListener("message", k, !1)
                              : a.attachEvent("onmessage", k),
                            function (C) {
                              a.postMessage(f + C, "*");
                            })
                          : a.MessageChannel
                            ? (((u = new MessageChannel()).port1.onmessage = function (C) {
                                v(C.data);
                              }),
                              function (C) {
                                u.port2.postMessage(C);
                              })
                            : g && "onreadystatechange" in g.createElement("script")
                              ? ((c = g.documentElement),
                                function (C) {
                                  var z = g.createElement("script");
                                  ((z.onreadystatechange = function () {
                                    (v(C),
                                      (z.onreadystatechange = null),
                                      c.removeChild(z),
                                      (z = null));
                                  }),
                                    c.appendChild(z));
                                })
                              : function (C) {
                                  setTimeout(v, 0, C);
                                }),
                    (y.setImmediate = function (C) {
                      typeof C != "function" && (C = new Function("" + C));
                      for (var z = new Array(arguments.length - 1), L = 0; L < z.length; L++)
                        z[L] = arguments[L + 1];
                      var A = { callback: C, args: z };
                      return ((d[h] = A), l(h), h++);
                    }),
                    (y.clearImmediate = m));
                }
                function m(C) {
                  delete d[C];
                }
                function v(C) {
                  if (b) setTimeout(v, 0, C);
                  else {
                    var z = d[C];
                    if (z) {
                      b = !0;
                      try {
                        (function (L) {
                          var A = L.callback,
                            O = L.args;
                          switch (O.length) {
                            case 0:
                              A();
                              break;
                            case 1:
                              A(O[0]);
                              break;
                            case 2:
                              A(O[0], O[1]);
                              break;
                            case 3:
                              A(O[0], O[1], O[2]);
                              break;
                            default:
                              A.apply(s, O);
                          }
                        })(z);
                      } finally {
                        (m(C), (b = !1));
                      }
                    }
                  }
                }
                function k(C) {
                  C.source === a &&
                    typeof C.data == "string" &&
                    C.data.indexOf(f) === 0 &&
                    v(+C.data.slice(f.length));
                }
              })(typeof self > "u" ? (r === void 0 ? this : r) : self);
            }).call(
              this,
              typeof xn < "u" ? xn : typeof self < "u" ? self : typeof window < "u" ? window : {},
            );
          },
          {},
        ],
      },
      {},
      [10],
    )(10);
  });
})(Go);
var Nc = Go.exports;
const Rc = Oa(Nc),
  jc = `SIL OPEN FONT LICENSE

Version 1.1 - 26 February 2007

PREAMBLE

The goals of the Open Font License (OFL) are to stimulate worldwide development of collaborative font projects, to support the font creation efforts of academic and linguistic communities, and to provide a free and open framework in which fonts may be shared and improved in partnership with others.

The OFL allows the licensed fonts to be used, studied, modified and redistributed freely as long as they are not sold by themselves. The fonts, including any derivative works, can be bundled, embedded, redistributed and/or sold with any software provided that any reserved names are not used by derivative works. The fonts and derivatives, however, cannot be released under any other type of license. The requirement for fonts to remain under this license does not apply to any document created using the fonts or their derivatives.

DEFINITIONS

"Font Software" refers to the set of files released by the Copyright Holder(s) under this license and clearly marked as such. This may include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the copyright statement(s).

"Original Version" refers to the collection of Font Software components as distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting, or substituting -- in part or in whole -- any of the components of the Original Version, by changing formats or by porting the Font Software to a new environment.

"Author" refers to any designer, engineer, programmer, technical writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS

Permission is hereby granted, free of charge, to any person obtaining a copy of the Font Software, to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components, in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled, redistributed and/or sold with any software, provided that each copy contains the above copyright notice and this license. These can be included either as stand-alone text files, human-readable headers or in the appropriate machine-readable metadata fields within text or binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This restriction only applies to the primary font name as presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font Software shall not be used to promote, endorse or advertise any Modified Version, except to acknowledge the contribution(s) of the Copyright Holder(s) and the Author(s) or with their explicit written permission.

5) The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license, and must not be distributed under any other license. The requirement for fonts to remain under this license does not apply to any document created using the Font Software.

TERMINATION

This license becomes null and void if any of the above conditions are not met.

DISCLAIMER

THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.`;
function Wc(t) {
  const e = t.names.copyright;
  return e ? (e.en ?? Object.values(e)[0] ?? "").replace(/\s+/g, " ").trim() : "";
}
const Wt = 210,
  Le = 297,
  ut = 16,
  Xi = 6 * (25.4 / 72);
function Vo(t) {
  const n = t == null ? void 0 : t.texte.socialKit;
  return !n || !Array.isArray(n.saeulen) || !n.saeulen.length ? null : n;
}
const Ur = (t) => t.kit.assets.route;
function Ko(t, n, e, i, o) {
  let r = wt(Wt, Le, n);
  return (
    (r += xe(ut, ut - 1, 3).svg),
    (r += st(t, o, Wt - ut, ut - 0.6, 2.3, E.amberText, "end")),
    (r += ce(ut, Le - 14, Wt - 2 * ut, E.hair, 0.2)),
    (r += me(st(t, `Markenplattform  ·  ${it.circle}`, ut, Le - 10.5, Xi, E.muted))),
    (r += st(
      t,
      `${String(e).padStart(2, "0")} / ${String(i).padStart(2, "0")}`,
      Wt - ut,
      Le - 10.5,
      Xi,
      E.muted,
      "end",
    )),
    r
  );
}
function Ke(t, n, e, i, o, r, a = 3.4, s = 8) {
  if (!e.trim()) return { svg: "", bottom: o };
  let l = st(t, n, i, o, 2.2, E.amberText);
  const c = U(t, e, i, o + 5, a, { wrap: r, lh: 1.5, maxLines: s, fill: E.text, field: "text" });
  return ((l += c.svg), { svg: l, bottom: c.bottom });
}
function jn(t, n, e, i, o, r, a = 3.1) {
  const s = e
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (!s.length) return { svg: "", bottom: o };
  let l = st(t, n, i, o, 2.2, E.amberText),
    c = o + 5;
  for (const u of s) {
    l += `<circle cx="${(i + 0.9).toFixed(2)}" cy="${(c + a * 0.62).toFixed(2)}" r="0.7" fill="${E.amber}"/>`;
    const f = U(t, u, i + 4, c, a, {
      wrap: r - 4,
      lh: 1.4,
      maxLines: 3,
      fill: E.text,
      field: "text",
    });
    ((l += f.svg), (c = f.bottom + 1.6));
  }
  return { svg: l, bottom: c };
}
function Uc(t, n, e) {
  var g, y;
  const i = Ur(t);
  let o = Ko(t, n, 1, e, "MARKENPLATTFORM");
  if (!i) return o;
  const r = i.texte,
    a = t.kit,
    s = Me(a, {
      x: ut,
      y: 26,
      w: 84,
      h: 26,
      ground: E.bg,
      align: "start",
      valign: "middle",
      prefer: "auto",
    });
  ((o += s.svg),
    (o += st(t, `Route  ·  ${i.titel}`, Wt - ut, 30, 2.3, E.muted, "end")),
    r.schluesselwoerter.length &&
      (o += U(t, r.schluesselwoerter.slice(0, 3).join("  ·  "), Wt - ut, 35, 3, {
        fill: E.text,
        anchor: "end",
      }).svg));
  let l = 62;
  if (
    (r.claim.trim() &&
      ((o += at(t, r.claim.trim(), ut, l, 11, {
        maxWidth: Wt - 2 * ut,
        dot: !0,
        field: "text",
      }).svg),
      (l += 18)),
    r.onlyness.trim())
  ) {
    const m = U(t, r.onlyness, ut + 6, l + 6, 4, {
      wrap: Wt - 2 * ut - 12,
      lh: 1.45,
      maxLines: 4,
      fill: E.ink,
      field: "text",
    });
    ((o +=
      Pt(ut, l, Wt - 2 * ut, m.bottom - l + 6, 3, E.card) +
      st(t, "Nur wir", ut + 6, l + 1.6, 2, E.amberText) +
      m.svg),
      (l = m.bottom + 12));
  }
  const c = (Wt - 2 * ut - 10) / 2;
  if (((g = r.versprechen) != null && g.trim()) || ((y = r.wunschkunde) != null && y.trim())) {
    const m = Ke(t, "Versprechen", r.versprechen ?? "", ut, l, c, 3.4, 4),
      v = Ke(t, "Wunschkunde", r.wunschkunde ?? "", ut + c + 10, l, c, 3.4, 4);
    ((o += m.svg + v.svg), (l = Math.max(m.bottom, v.bottom) + 8));
  }
  const u = Ke(t, "Positionierung", r.positionierung, ut, l, c),
    f = Ke(t, "Story kurz", r.storyKurz, ut + c + 10, l, c);
  ((o += u.svg + f.svg), (l = Math.max(u.bottom, f.bottom) + 8));
  const h = Ke(t, "Story", r.storyMittel, ut, l, Wt - 2 * ut, 3.3, 9);
  ((o += h.svg), (l = h.bottom + 8));
  const d = jn(t, "So klingen wir", r.sagen, ut, l, c),
    b = jn(t, "Das sagen wir nie", r.vermeiden, ut + c + 10, l, c);
  return (
    (o += d.svg + b.svg),
    (l = Math.max(d.bottom, b.bottom) + 6),
    l < Le - 40 && (o += jn(t, "Leitplanken", r.leitplanken, ut, l, Wt - 2 * ut).svg),
    o
  );
}
function Hc(t, n, e) {
  var s;
  let i = Ko(t, n, 2, e, "SOCIAL-KIT");
  const o = Vo(Ur(t));
  if (!o) return i;
  i += at(t, "Worüber du postest.", ut, 28, 10, { maxWidth: Wt - 2 * ut, dot: !0 }).svg;
  let r = 48;
  for (const l of o.saeulen.slice(0, 3)) {
    const c = r;
    let u = st(t, l.titel, ut + 6, c + 5, 2.4, E.amberText),
      f = c + 11;
    for (const h of l.hooks.slice(0, 4)) {
      const d = U(t, `„${h.trim()}“`, ut + 6, f, 3.3, {
        wrap: Wt - 2 * ut - 12,
        lh: 1.4,
        maxLines: 2,
        fill: E.ink,
        field: "text",
      });
      ((u += d.svg), (f = d.bottom + 2));
    }
    ((i += Pt(ut, c, Wt - 2 * ut, f - c + 3, 3, E.card) + u), (r = f + 9));
  }
  const a = ((s = Ur(t)) == null ? void 0 : s.texte.formate) ?? [];
  if (a.length && r < Le - 70) {
    const l = a.slice(0, 3).map((u) => `${u.format} (${u.rhythmus}): ${u.satz}`),
      c = jn(t, "Formate", l, ut, r, Wt - 2 * ut, 3.2);
    ((i += c.svg), (r = c.bottom + 6));
  }
  return (
    o.profiltext.trim() &&
      r < Le - 40 &&
      (i += Ke(t, "Profiltext", o.profiltext, ut, r, Wt - 2 * ut, 3.4, 4).svg),
    i
  );
}
const Zc = (t) => !!Vo(t.route);
function qo(t) {
  const n = t ? 2 : 1,
    e = [{ label: "Markenplattform", draw: (i, o) => Uc(i, o, n) }];
  return (
    t && e.push({ label: "Social-Kit", draw: (i, o) => Hc(i, o, n) }),
    {
      id: "unio-markenplattform",
      file: "markenplattform",
      label: "Markenplattform",
      description:
        "Wofür deine Marke steht: Claim, Positionierung, Story und Ton auf einer Seite. Gib sie weiter, wenn jemand für dich textet.",
      format: "A4",
      units: "mm",
      figma: ["Stil der Figma-Vorlagen 344:6 (Brand Guide)"],
      pages: e,
      group: "guide",
      dir: jt.guide,
      needsContact: !1,
      bleed: 0,
      sizeLabel: t ? "PDF · A4 · 2 Seiten" : "PDF · A4 · 1 Seite",
      note: "Deine Markenplattform im UNIO-Layout: Claim, Positionierung, Story, Ton und Leitplanken.",
      previews: !1,
      stamp: !1,
    }
  );
}
const Yo = Bt(qo(!1)),
  Gc = Bt(qo(!0)),
  un = (t) => (Zc(t) ? Gc : Yo),
  Vc = {
    ...Yo,
    variant: void 0,
    available: (t) => !!t.route,
    preview: (t) => un(t).preview(t),
    pages: (t) => {
      var n, e;
      return t.route ? (((e = (n = un(t)).pages) == null ? void 0 : e.call(n, t)) ?? []) : [];
    },
    plan: (t) => {
      var n, e;
      return t.route ? (((e = (n = un(t)).plan) == null ? void 0 : e.call(n, t)) ?? []) : [];
    },
    exportFiles: async (t) => (t.route ? un(t).exportFiles(t) : []),
    textAdjusted: (t) => {
      var n, e;
      return t.route
        ? (((e = (n = un(t)).textAdjusted) == null ? void 0 : e.call(n, t)) ?? null)
        : null;
    },
    missingInfo: () => null,
    logoAdjusted: () => null,
  };
function Kc(t) {
  return t.route ? [Vc] : [];
}
function qc(t, n, e) {
  const i = e && Xr(n.contact),
    o = Kc(n).filter((r) => !t.includes(r));
  return [...t, ...o].filter((r) => i || !r.needsContact);
}
function Xo(t) {
  return `${Et(t).slug}_brand-kit`;
}
function Qo(t, n, e) {
  const i = qc(t, n, e),
    o = [],
    r = new Set();
  for (const u of i) {
    const f = u.plan ? u.plan(n) : [];
    for (const h of f) r.has(h.path) || (r.add(h.path), o.push(h));
  }
  const a = Et(n),
    s = i.length < t.length,
    l = { unio: i.some((u) => u.variant === "unio"), eigen: i.some((u) => u.variant === "eigen") };
  return (
    o.push(...Xc(n)),
    [
      {
        path: "LIESMICH.txt",
        mime: "text/plain;charset=utf-8",
        note: "Diese Datei: welche Datei wofür.",
        make: async () =>
          uc({
            brandName: a.brandName,
            root: Xo(n),
            concept: n.concept,
            plans: o,
            skippedContact: s,
            design: l,
            hints: Yc(i, n),
          }),
      },
      ...o,
    ]
  );
}
function Yc(t, n) {
  var i;
  const e = [];
  for (const o of t)
    try {
      const r = (i = o.missingInfo) == null ? void 0 : i.call(o, n);
      r && e.push(`${o.label}: ${r}`);
    } catch {}
  return e;
}
function Xc(t) {
  const n = () => {
    const e = [
      "SCHRIFTEN IN DEINER MARKE",
      "",
      "Alle Schriften stehen unter der SIL Open Font License 1.1 (siehe OFL.txt).",
      "Sie dürfen kostenlos genutzt werden, auch geschäftlich und für Logos.",
      "",
    ];
    for (const i of ui(t.concept)) {
      const o = i.cuts[0],
        r = t.fonts.has(o) ? t.fonts.get(o) : null,
        a = r ? Wc(r) : "",
        s = fi(i.pkg, i.family);
      (e.push(`${i.family} (Schnitt ${i.cuts.map(vr).join(", ")})`),
        e.push(`  Verwendet für: ${i.role}`),
        e.push(`  Copyright: ${a || "siehe Download-Seite"}`),
        e.push("  Lizenz: SIL Open Font License 1.1"),
        e.push(`  Download: ${s.fontsource}`),
        e.push(""));
    }
    return e.join(`\r
`);
  };
  return [
    {
      path: "schriften/schriften.txt",
      mime: "text/plain;charset=utf-8",
      note: "Welche Schriften deine Marke nutzt, mit Copyright und Download-Link.",
      make: async () => n(),
    },
    {
      path: "schriften/OFL.txt",
      mime: "text/plain;charset=utf-8",
      note: "Lizenztext der Schriften (SIL Open Font License 1.1).",
      make: async () =>
        jc.replace(
          /\n/g,
          `\r
`,
        ),
    },
  ];
}
const Jo = (t) => /^image\/png|^image\/jpeg|^application\/pdf|^image\/x-icon/.test(t),
  Hr = () => new DOMException("Abgebrochen", "AbortError");
async function ta(t, n) {
  if (typeof Worker < "u" && typeof window < "u") {
    let i = null;
    try {
      i = new Worker(
        new URL("" + new URL("zip.worker-jGvqp4Ko.js", import.meta.url).href, import.meta.url),
        { type: "module" },
      );
    } catch {
      i = null;
    }
    if (i) {
      const o = i;
      return new Promise((r, a) => {
        const s = () => {
          (o.terminate(), a(Hr()));
        };
        (n == null || n.addEventListener("abort", s, { once: !0 }),
          (o.onmessage = (c) => {
            (n == null || n.removeEventListener("abort", s),
              o.terminate(),
              c.data.ok && c.data.buf
                ? r(new Blob([c.data.buf], { type: "application/zip" }))
                : a(new Error(c.data.error ?? "ZIP fehlgeschlagen")));
          }),
          (o.onerror = (c) => {
            (n == null || n.removeEventListener("abort", s),
              o.terminate(),
              a(new Error(c.message || "ZIP-Worker fehlgeschlagen")));
          }));
        const l = t.map((c) => c.data).filter((c) => typeof c != "string");
        o.postMessage({ entries: t }, l);
      });
    }
  }
  const e = new Rc();
  for (const i of t)
    e.file(i.path, i.data, {
      compression: i.store ? "STORE" : "DEFLATE",
      binary: typeof i.data != "string",
    });
  return e.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}
let Wn = [];
const dn = new Map(),
  Qc = (t) => [
    t.concept,
    t.input,
    t.fonts,
    t.object,
    JSON.stringify(t.contact ?? null),
    JSON.stringify(t.input ?? null),
  ],
  ea = (t) => /^image\/|^application\/pdf/.test(t.mime) && t.path !== "LIESMICH.txt";
function na(t, n) {
  if (!ea(n)) return n.make();
  const e = Qc(t);
  (e.length !== Wn.length || e.some((o, r) => o !== Wn[r])) && (dn.clear(), (Wn = e));
  let i = dn.get(n.path);
  return (i || ((i = n.make()), dn.set(n.path, i), i.catch(() => dn.delete(n.path))), i);
}
function Jc() {
  (dn.clear(), (Wn = []));
}
const tu = () =>
  new Promise((t) => {
    const n = globalThis.requestIdleCallback;
    n ? n(() => t(), { timeout: 500 }) : t();
  });
function Qi(t) {
  const n = t.path;
  return n === "LIESMICH.txt"
    ? 60
    : t.mime === "application/pdf"
      ? /brand-guide/.test(n)
        ? 100
        : /bogen|banner|plakat|aushang|flyer|inserat|zeitung|expose/.test(n)
          ? 60
          : 40
      : /^image\/png/.test(t.mime)
        ? /vorschau-bogen|banner|instagram_story|vorschau/.test(n)
          ? 30
          : 20
        : /^image\//.test(t.mime)
          ? 10
          : 0;
}
async function eu(t, n, e) {
  var r;
  $n(n);
  const i = e.paths ? new Set(e.paths) : null,
    o = Qo(t, n, e.includeContact)
      .filter((a) => ea(a) && (!i || i.has(a.path)))
      .sort((a, s) => Qi(s) - Qi(a));
  await tu();
  for (const a of o) {
    if ((r = e.signal) != null && r.aborted) return;
    (await na(n, a), await mn());
  }
}
async function nu(t, n, e) {
  var l, c, u, f;
  $n(n);
  const i = Qo(t, n, e.includeContact),
    o = Xo(n),
    r = i.length,
    a = [];
  let s = 0;
  (l = e.onProgress) == null || l.call(e, 0, r);
  for (const h of i) {
    if ((c = e.signal) != null && c.aborted) throw Hr();
    const d = await na(n, h);
    if ((u = e.signal) != null && u.aborted) throw Hr();
    const b =
      typeof d == "string" ? d : d instanceof Blob ? await d.arrayBuffer() : d.slice().buffer;
    (a.push({ path: `${o}/${h.path}`, data: b, store: Jo(h.mime) }),
      s++,
      (f = e.onProgress) == null || f.call(e, s, r),
      await mn());
  }
  return ta(a, e.signal);
}
let Ie = null,
  qe = null,
  Ji = 1;
function ru() {
  const t = (typeof navigator < "u" && navigator.hardwareConcurrency) || 2;
  return Math.max(1, Math.min(3, t - 1));
}
function _r() {
  if (Ie) return Ie;
  if (typeof Worker > "u" || typeof window > "u") return null;
  const t = [];
  try {
    for (let n = 0; n < ru(); n++) {
      const e = {
        w: new Worker(
          new URL("" + new URL("render.worker-ibpAdE4g.js", import.meta.url).href, import.meta.url),
          { type: "module" },
        ),
        pending: new Map(),
      };
      ((e.w.onmessage = (i) => {
        var a;
        const o = i.data,
          r = e.pending.get(o.id);
        if (r) {
          if (o.type === "progress")
            return (a = r.progress) == null ? void 0 : a.call(r, o.done, o.total);
          (e.pending.delete(o.id),
            o.type === "error"
              ? r.reject(Object.assign(new Error(o.error), { aborted: o.aborted }))
              : r.resolve(o));
        }
      }),
        (e.w.onerror = () => iu()),
        t.push(e));
    }
  } catch {
    for (const n of t) n.w.terminate();
    return null;
  }
  return ((Ie = t), Ie);
}
function iu() {
  for (const t of Ie ?? []) {
    for (const n of t.pending.values()) n.reject(new Error("Export-Worker ausgefallen"));
    (t.pending.clear(), t.w.terminate());
  }
  ((Ie = null), (qe = Promise.resolve(!1)));
}
function nr(t, n, e, i) {
  const o = Ji++;
  return new Promise((r, a) => {
    if (i != null && i.aborted) return a(new DOMException("Abgebrochen", "AbortError"));
    (t.pending.set(o, { resolve: r, reject: a, progress: e }),
      i == null ||
        i.addEventListener(
          "abort",
          () => {
            (t.w.postMessage({ id: Ji++, type: "abort", target: o }),
              t.pending.delete(o),
              a(new DOMException("Abgebrochen", "AbortError")));
          },
          { once: !0 },
        ),
      t.w.postMessage({ ...n, id: o }));
  });
}
function ou() {
  if (qe) return qe;
  const t = _r();
  if (!t) return (qe = Promise.resolve(!1));
  const n = Promise.all(t.map((e) => nr(e, { type: "init" }).then((i) => !!i.ok))).then((e) =>
    e.every(Boolean),
  );
  return (
    (qe = Promise.race([n, new Promise((e) => setTimeout(() => e(!1), 15e3))]).catch(() => !1)),
    qe
  );
}
async function $r() {
  return await ou();
}
const Zr = new WeakMap();
let au = 1;
function ra(t) {
  let n = Zr.get(t);
  return (n || ((n = { ak: au++, msg: su(t) }), Zr.set(t, n)), n);
}
async function Sr(t, n, e, i, o) {
  const r = ra(n),
    a = t.ak === r.ak;
  t.ak = r.ak;
  try {
    return await nr(t, e(a ? { ak: r.ak } : { assets: r.msg, ak: r.ak }), i, o);
  } catch (s) {
    if (!a || !/ASSETS_FEHLEN/.test(String(s.message))) throw s;
    return nr(t, e({ assets: r.msg, ak: r.ak }), i, o);
  }
}
function su(t) {
  const n = new URL("./", typeof location < "u" ? location.href : "http://localhost/").href;
  return {
    input: t.input,
    concept: t.concept,
    contact: t.contact,
    object: t.object,
    ...(t.route ? { route: t.route } : {}),
    needsExt: t.fonts.needsExt ?? !0,
    base: n,
  };
}
function ia(t, n) {
  const e = new Array(n).fill(0),
    i = Array.from({ length: n }, () => []),
    o = t.map((r, a) => ({ p: r, i: a })).sort((r, a) => a.p.cost - r.p.cost || r.i - a.i);
  for (const { p: r } of o) {
    let a = 0;
    for (let s = 1; s < n; s++) e[s] < e[a] && (a = s);
    (i[a].push(r.path), (e[a] += 1 + r.cost));
  }
  return i;
}
async function oa(t, n, e, i, o) {
  const r = await Sr(
    t[0],
    n,
    (a) => ({ type: "plan", ...a, unio: e, includeContact: i }),
    void 0,
    o,
  );
  return { plan: r.plan ?? [], root: r.root ?? "brand-kit" };
}
async function lu(t, n) {
  var u;
  const e = _r();
  if (!e) throw new Error("Kein Worker");
  const { plan: i, root: o } = await oa(e, t, n.unio, n.includeContact, n.signal),
    r = ia(i, e.length),
    a = new Array(e.length).fill(0);
  (u = n.onProgress) == null || u.call(n, 0, i.length);
  const s = await Promise.all(
      e.map((f, h) =>
        r[h].length
          ? Sr(
              f,
              t,
              (b) => ({
                type: "files",
                ...b,
                unio: n.unio,
                includeContact: n.includeContact,
                paths: r[h],
              }),
              (b) => {
                var g;
                ((a[h] = b),
                  (g = n.onProgress) == null ||
                    g.call(
                      n,
                      a.reduce((y, m) => y + m, 0),
                      i.length,
                    ));
              },
              n.signal,
            )
          : Promise.resolve({ id: 0, type: "done", files: [] }),
      ),
    ),
    l = new Map();
  for (const f of s) for (const h of f.files ?? []) l.set(h.path, h.data);
  const c = i.map((f) => ({
    path: `${o}/${f.path}`,
    data: l.get(f.path) ?? "",
    store: Jo(f.mime),
  }));
  return ta(c, n.signal);
}
async function cu(t, n) {
  const e = _r();
  if (!e) throw new Error("Kein Worker");
  const { plan: i } = await oa(e, t, n.unio, n.includeContact, n.signal),
    o = ia(i, e.length);
  await Promise.all(
    e.map((r, a) =>
      o[a].length
        ? Sr(
            r,
            t,
            (s) => ({
              type: "prewarm",
              ...s,
              unio: n.unio,
              includeContact: n.includeContact,
              paths: o[a],
            }),
            void 0,
            n.signal,
          )
        : null,
    ),
  );
}
async function uu() {
  Ie && (await Promise.all(Ie.map((t) => nr(t, { type: "clear" }).catch(() => {}))));
}
const Un = new Map(),
  rr = new Map();
let Gr = -1,
  fu = 0;
function aa(t, n, e, i) {
  return `${t}|${n}|${e}|${Math.round(i)}`;
}
function du(t) {
  if (t === Gr) return;
  const n = [...rr.values()].map((e) => e.url);
  (setTimeout(() => n.forEach((e) => URL.revokeObjectURL(e)), 3e4),
    Un.clear(),
    rr.clear(),
    (Gr = t));
}
function hu(t, n, e) {
  const i = Zr.get(n);
  return i ? (rr.get(aa(i.ak, t, e.page ?? 0, e.width)) ?? null) : null;
}
function sa(t, n, e) {
  const i = _r();
  if (!i) return Promise.reject(new Error("Kein Worker"));
  const { ak: o } = ra(n);
  du(o);
  const r = aa(o, t, e.page ?? 0, e.width);
  let a = Un.get(r);
  if (!a) {
    const l = i[fu++ % i.length];
    ((a = Sr(l, n, (c) => ({
      type: "tile",
      ...c,
      deliverable: t,
      page: e.page,
      width: e.width,
    })).then((c) => {
      const u = URL.createObjectURL(c.png),
        f = c.w ?? 1,
        h = c.h ?? 1,
        b = {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f} ${h}" width="${f}" height="${h}"><image href="${u}" x="0" y="0" width="${f}" height="${h}"/></svg>`,
          url: u,
          w: f,
          h,
          pages: c.pages ?? 1,
          hints: c.hints ?? { logo: null, text: null, missing: null },
        };
      return (Gr === o && rr.set(r, b), b);
    })),
      Un.set(r, a),
      a.catch(() => Un.delete(r)));
  }
  if (!e.signal) return a;
  const s = e.signal;
  return new Promise((l, c) => {
    if (s.aborted) return c(new DOMException("Abgebrochen", "AbortError"));
    (s.addEventListener("abort", () => c(new DOMException("Abgebrochen", "AbortError")), {
      once: !0,
    }),
      a.then(l, c));
  });
}
async function gu(t, n, e) {
  await Promise.all(t.map((i) => sa(i, n, { width: e.width }).catch(() => {})));
}
Pe.pdf ?? (Pe.pdf = Ic);
function pu(t, n, e) {
  return hu(t.id, n, e);
}
async function Mu(t, n, e) {
  (await $r()) &&
    (await gu(
      t.map((i) => i.id),
      n,
      e,
    ));
}
let Je = null,
  to = null;
const hn = [...di];
async function hi() {
  return (
    Je ||
      (to ??
        (to = Or(
          () => import("./own-CMBusp3y.js"),
          __vite__mapDeps([8, 6, 1, 2, 5, 7, 4]),
          import.meta.url,
        )),
      (Je = await to),
      hn.length === di.length && hn.push(...Je.OWN_DESIGN)),
    hn
  );
}
function mu() {
  return Je !== null;
}
function gi() {
  if (!Je)
    throw new Error("Eigenes Design noch nicht geladen: vorher await loadOwnDesign() aufrufen");
  return Je;
}
function la(t = !1) {
  return t ? Fc() : (gi(), hn);
}
async function ca(t = !1) {
  return (t || (await hi()), la(t));
}
function Tu(t, n = !1) {
  return n ? oc(t) : gi().signatureHtmlInline(t);
}
async function Lu(t, n = !1) {
  return n ? ac(t) : (await hi(), gi().signatureHtmlInlineAsync(t));
}
async function Pu(t, n) {
  var e;
  if (await $r())
    try {
      return await lu(t, {
        includeContact: n.includeContact,
        unio: !!n.unio,
        signal: n.signal,
        onProgress: n.onProgress,
      });
    } catch (i) {
      if ((e = n.signal) != null && e.aborted) throw i;
      console.warn("ZIP im Worker fehlgeschlagen, erzeuge im Hauptthread", i);
    }
  return nu(await ca(!!n.unio), t, n);
}
async function Bu(t, n) {
  var e;
  if (await $r())
    try {
      return await cu(t, { includeContact: n.includeContact, unio: !!n.unio, signal: n.signal });
    } catch (i) {
      if ((e = n.signal) != null && e.aborted) return;
      console.warn("Vorwaermen im Worker fehlgeschlagen", i);
      return;
    }
  return eu(await ca(!!n.unio), t, n);
}
function Du() {
  (Jc(), uu());
}
async function bu(t, n, e) {
  var i;
  if (!(await $r())) return null;
  try {
    return await sa(t.id, n, e);
  } catch (o) {
    return (
      ((i = e.signal) != null && i.aborted) ||
        console.warn(`Kachel ${t.id} im Worker fehlgeschlagen`, o),
      null
    );
  }
}
function Nu(t, n = {}) {
  if (Xr(t.contact)) return { count: 0, labels: [], files: [] };
  const e = la(!!n.unio).filter((o) => o.needsContact),
    i = e.flatMap((o) => (o.plan ? o.plan(t).map((r) => r.path) : []));
  return { count: i.length, labels: e.map((o) => o.label), files: i };
}
function Ru(t) {
  const n = t.data instanceof Blob ? t.data : new Blob([t.data], { type: t.mime });
  pa(t.path.split("/").pop() ?? "download", n);
}
function ju(t, n, e) {
  return (
    ge.setTexts(
      n.name,
      n.suffix,
      n.tagline,
      ...Object.values(e).map((i) => (typeof i == "string" ? i : "")),
    ),
    { concept: t, input: n, contact: e, fonts: ge }
  );
}
function Wu(t, n) {
  const e = Qt.useMemo(() => (t ? [...ro([t], !1, n), ...co([t])] : []), [t, n]),
    [, i] = Qt.useState(0);
  Qt.useEffect(() => ge.subscribe(() => i((s) => s + 1)), []);
  const o = e.map(Be).join(",") + (ge.needsExt ? "+ext" : "") + `#${ge.version}`,
    [r, a] = Qt.useState(() => (e.every((s) => ge.has(s)) ? o : ""));
  return (
    Qt.useEffect(() => {
      if (!e.length) return;
      if (e.every((l) => ge.has(l))) {
        a(o);
        return;
      }
      let s = !0;
      return (
        ge.ensure(e).then(
          () => s && a(o),
          () => {},
        ),
        () => {
          s = !1;
        }
      );
    }, [o]),
    !!e.length && r === o
  );
}
const wu = (t) => hn.find((n) => n.id === t);
function Uu(t, n) {
  return (n ? Ho(t) : void 0) ?? wu(t);
}
function Hu(t) {
  const [n, e] = Qt.useState(mu);
  return (
    Qt.useEffect(() => {
      if (!t || n) return;
      let i = !0;
      return (
        hi().then(
          () => i && e(!0),
          (o) => console.warn("Eigenes Design nicht geladen", o),
        ),
        () => {
          i = !1;
        }
      );
    }, [t, n]),
    n
  );
}
const eo = 640;
function Zu(t, n, e, i = !1) {
  const [o, r] = Qt.useState({ svg: null, pages: null, error: !1 }),
    [a, s] = Qt.useState(0),
    [l, c] = Qt.useState(!1),
    u = !i && !l && t && n && e ? pu(t, n, { width: eo }) : null;
  return (
    Qt.useEffect(() => {
      if (!t || !n || !e || u) return;
      let f = !0;
      if (!i && !l) {
        const d = new AbortController();
        return (
          bu(t, n, { width: eo, signal: d.signal }).then((b) => {
            f && (b ? r({ svg: b.svg, pages: null, error: !1, hints: b.hints, id: t.id }) : c(!0));
          }),
          () => {
            ((f = !1), d.abort());
          }
        );
      }
      const h = va(() => {
        var d;
        if (f)
          try {
            const b = [...ro([n.concept], !1, n.input), ...co([n.concept])];
            if (!b.every((m) => ge.has(m))) {
              ge.ensure(b).then(
                () => f && s((m) => m + 1),
                () => {},
              );
              return;
            }
            const g = i && t.pages ? t.pages(n) : null,
              y = ((d = g == null ? void 0 : g[0]) == null ? void 0 : d.svg) ?? t.preview(n);
            r({ svg: y, pages: g, error: !1, id: t.id });
          } catch (b) {
            (console.warn(`Vorschau ${t.id} fehlgeschlagen`, b), r((g) => ({ ...g, error: !0 })));
          }
      });
      return () => {
        ((f = !1), h());
      };
    }, [t, n, e, i, a, l, u]),
    u && t ? { svg: u.svg, pages: null, error: !1, hints: u.hints, id: t.id } : o
  );
}
function Gu(t) {
  return t
    .replace(/<svg([^>]*?)\swidth="[^"]*"/, "<svg$1")
    .replace(/<svg([^>]*?)\sheight="[^"]*"/, "<svg$1")
    .replace(
      "<svg",
      '<svg preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"',
    );
}
function Vu(t) {
  const [n, e] = Qt.useState(() => ({ ...Ci(), error: !1 }));
  return (
    Qt.useEffect(() => {
      if (!t || n.ready) return;
      let i = !0;
      return (
        cr().then(
          () => i && e({ ...Ci(), error: !1 }),
          () => i && e((o) => ({ ...o, error: !0 })),
        ),
        () => {
          i = !1;
        }
      );
    }, [t, n.ready]),
    { ready: n.ready, fallback: n.fallback, error: n.error }
  );
}
export {
  ar as $,
  eu as A,
  xu as B,
  ao as C,
  E as D,
  vn as E,
  St as F,
  wt as G,
  Me as H,
  wo as I,
  Rc as J,
  _e as K,
  Ba as L,
  Et as M,
  Qr as N,
  Su as O,
  Gt as P,
  Cn as Q,
  Fu as R,
  qn as S,
  eo as T,
  so as U,
  Wa as V,
  jt as W,
  Qe as X,
  vi as Y,
  Au as Z,
  qt as _,
  Hu as a,
  pn as a0,
  Cu as a1,
  ho as a2,
  Jr as a3,
  oo as a4,
  Ua as a5,
  Eu as a6,
  Iu as a7,
  yc as a8,
  Ou as a9,
  Bi as aa,
  _i as ab,
  $i as ac,
  Oa as ad,
  xn as ae,
  Zu as b,
  Wu as c,
  Uu as d,
  co as e,
  Gu as f,
  Qo as g,
  zu as h,
  Nu as i,
  Pu as j,
  la as k,
  Ru as l,
  ju as m,
  hi as n,
  Du as o,
  Tu as p,
  Mu as q,
  mu as r,
  Lu as s,
  Kc as t,
  Vu as u,
  pu as v,
  $r as w,
  Bu as x,
  ca as y,
  Qi as z,
};
