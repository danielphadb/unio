import {
  r as $,
  j as s,
  D as ge,
  S as ze,
  T as R,
  P as pe,
  u as Me,
  q as S,
  m as ie,
  M as Be,
  G as Le,
} from "./index-BER2gtDe.js";
import { g as fe, n as Oe, p as Pe, r as Ae, d as Ce } from "./photoStore-D5-LfIN5.js";
import { s as Te, E as re, j as oe, F as Ie, a as ce } from "./objectData-DW9yI24T.js";
import { a as We, b as be, e as Re } from "./energy-DRQ_36b-.js";
import {
  D as he,
  Z as De,
  e as de,
  L as w,
  b as Ue,
  S as Ge,
  s as Ke,
  m as X,
  c as C,
  v as He,
  f as Ze,
  u as _e,
  p as Ve,
} from "./library-D1LkGQVN.js";
import { n as b } from "./svg-CrwnZnJY.js";
import {
  u as q,
  t as xe,
  q as Xe,
  h as je,
  i as P,
  c as D,
  m as qe,
  a as ve,
  b as Y,
  w as ue,
} from "./imagesize-BHC6N02v.js";
const U = (t) => ({
    title: "",
    address: "",
    description: "",
    facts: [],
    photos: [],
    energy: { ...t },
  }),
  Ye = (t) => We(U(t)),
  ut = (t) => Re(U(t)),
  mt = (t) => be(U(t)).map((a) => a.text);
function gt(t) {
  return be(U(t))
    .filter((a) => a.missing)
    .map((a) => a.text.split(" ")[0]);
}
function pt(t, a, l) {
  return {
    W: t,
    H: a,
    safe: { x0: 0, y0: 0, x1: t, y1: a, ...l },
    out: [],
    checks: [],
    usedPhotos: new Set(),
    notes: new Set(),
  };
}
const M = (t, a) => void t.out.push(a),
  J = (t, a, l, n, r, h = 0, o = "") =>
    h > 0
      ? `<path d="${je(t, a, l, n, h)}" fill="${r}"${o ? ` ${o}` : ""}/>`
      : `<rect x="${b(t, 2)}" y="${b(a, 2)}" width="${b(l, 2)}" height="${b(n, 2)}" fill="${r}"${o ? ` ${o}` : ""}/>`,
  ft = (t, a, l, n, r = 1.5) =>
    `<line x1="${b(t, 2)}" y1="${b(a, 2)}" x2="${b(t + l, 2)}" y2="${b(a, 2)}" stroke="${n}" stroke-width="${b(r, 2)}"/>`,
  we = (t) => t.toLocaleUpperCase("de-AT");
function $e(t, a, l, n, r) {
  let h = a;
  for (; h.length > 1 && P(t, `${h} ...`, l, r) > n; )
    h = h.replace(/\s*\S+$/, "") || h.slice(0, -1);
  return `${h.replace(/[\s.,;:]+$/, "")} ...`;
}
function G(t, a, l, n, r, h, o) {
  const c = o.tracking ?? 0;
  let u = o.caps ? we(l) : l,
    i = h;
  if (o.maxWidth) {
    const j = P(a, u, i, c);
    j > o.maxWidth &&
      ((i = Math.max(h * (o.minScale ?? 0.8), (h * o.maxWidth) / j) * 0.999),
      P(a, u, i, c) > o.maxWidth && ((u = $e(a, u, i, o.maxWidth, c)), t.notes.add("gekuerzt")),
      i < h * 0.85 && t.notes.add("verkleinert"));
  }
  const f = D(a, i),
    g = r + f,
    m = qe(a, u, { x: n, y: g, size: i, fill: o.fill, tracking: c, anchor: o.anchor });
  if (!m.svg) return { w: 0, size: i, baseline: g, h: f };
  M(t, m.svg);
  const p = o.anchor === "middle" ? n - m.width / 2 : o.anchor === "end" ? n - m.width : n;
  return (
    t.checks.push({
      text: u,
      fill: o.fill,
      ground: o.ground,
      size: i,
      x0: p,
      x1: p + m.width,
      y0: g - Math.max(m.ascent, f),
      y1: g + m.descent,
      limit: o.limit ?? t.safe,
      base: g,
      capH: f,
    }),
    { w: m.width, size: i, baseline: g, h: f }
  );
}
function Je(t, a, l, n) {
  const r = n.tracking ?? 0,
    h = (n.caps ? we(a) : a).replace(/\s+/g, " ").trim(),
    o = l * (n.minScale ?? 0.75);
  let c = l,
    u = h
      .split(
        `
`,
      )
      .flatMap((p) => ue(t, p, c, n.maxWidth, r));
  const i = (p, j) => p.some((v) => P(t, v, j, r) > n.maxWidth);
  for (; (u.length > n.maxLines || i(u, c)) && c > o; )
    ((c = Math.max(o, c * 0.95)),
      (u = h
        .split(
          `
`,
        )
        .flatMap((p) => ue(t, p, c, n.maxWidth, r))));
  let f = !1;
  u.length > n.maxLines &&
    ((u = u.slice(0, n.maxLines)),
    (u[n.maxLines - 1] = $e(t, u[n.maxLines - 1], c, n.maxWidth, r)),
    (f = !0));
  const g = Math.max(0, ...u.map((p) => P(t, p, c, r)));
  g > n.maxWidth && (c *= (n.maxWidth / g) * 0.999);
  const m = (u.length - 1) * n.lh * c + D(t, c);
  return { rows: u, size: c, h: m, cut: f };
}
function bt(t, a, l, n, r, h, o) {
  const c = Je(a, l, h, o);
  (c.cut && t.notes.add("gekuerzt"), c.size < h * 0.85 && t.notes.add("verkleinert"));
  let u = { w: 0, baseline: r },
    i = 0;
  return (
    c.rows.forEach((f, g) => {
      ((u = G(t, a, f, n, r + g * o.lh * c.size, c.size, { ...o, caps: !1, maxWidth: void 0 })),
        (i = Math.max(i, u.w)));
    }),
    { w: i, size: c.size, baseline: u.baseline, h: c.h, lines: c.rows.length, lastW: u.w }
  );
}
function Qe(t, a) {
  let l = a,
    n = !0;
  for (const r of t) r && (n || (l += r.gap), r.draw(l), (l += r.h), (n = !1));
  return l;
}
function xt(t, a) {
  const l = t.filter((r) => !!r),
    n = l.reduce((r, h, o) => r + h.h + (o ? h.gap : 0), 0);
  return (Qe(l, a - n), a - n);
}
const jt = (t) => t.filter((a) => !!a).reduce((a, l, n) => a + l.h + (n ? l.gap : 0), 0),
  ke = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/;
function Ne(t, a, l, n, r, h, o = 0) {
  if (!ke.test(t)) return "";
  const c = Xe(t) ?? { w: 1600, h: 1067 },
    u = Math.max(n / c.w, r / c.h) * Math.max(1, h.zoom),
    i = c.w * u,
    f = c.h * u,
    g = Math.min(a, Math.max(a + n - i, a + n / 2 - h.x * i)),
    m = Math.min(l, Math.max(l + r - f, l + r / 2 - h.y * f)),
    p = q("pc"),
    j =
      o > 0
        ? `<path d="${je(a, l, n, r, o)}"/>`
        : `<rect x="${b(a, 2)}" y="${b(l, 2)}" width="${b(n, 2)}" height="${b(r, 2)}"/>`,
    v = xe(t);
  return `<g><defs><clipPath id="${p}">${j}</clipPath></defs><g clip-path="url(#${p})"><image x="${b(g, 2)}" y="${b(m, 2)}" width="${b(i, 2)}" height="${b(f, 2)}" preserveAspectRatio="none" href="${v}" xlink:href="${v}"/></g></g>`;
}
function vt(t, a, l, n, r, h, o) {
  const c = o.r ?? 0;
  if ((M(t, J(l, n, r, h, o.base, c)), a && ke.test(a.href))) {
    (t.usedPhotos.add(a.id),
      M(t, `<g data-role="objektfoto">${Ne(a.href, l, n, r, h, a.focus, c)}</g>`));
    return;
  }
  const u = Math.max(18, Math.min(24, Math.min(r, h) * 0.04));
  (M(t, '<g data-role="bildplatzhalter">'),
    G(t, o.label, "Objektfoto", l + r / 2, n + h / 2 - u / 2, u, {
      fill: o.labelFill,
      ground: o.base,
      caps: !0,
      tracking: 0.16,
      anchor: "middle",
    }),
    M(t, "</g>"));
}
function wt(t, a, l, n, r, h, o) {
  const c = q("sc"),
    u = r - l,
    i = o
      .map(
        ([g, m]) =>
          `<stop offset="${b(Math.min(1, Math.max(0, (g - l) / u)), 4)}" stop-color="${h}" stop-opacity="${b(m, 3)}"/>`,
      )
      .join("");
  return (
    M(
      t,
      `<g data-role="verlauf"><defs><linearGradient id="${c}" x1="0" y1="${b(l, 2)}" x2="0" y2="${b(r, 2)}" gradientUnits="userSpaceOnUse">${i}</linearGradient></defs><rect x="${b(a, 2)}" y="${b(l, 2)}" width="${b(n, 2)}" height="${b(u, 2)}" fill="url(#${c})"/></g>`,
    ),
    {
      alphaAt: (g) => {
        if (g <= o[0][0]) return o[0][1];
        for (let m = 1; m < o.length; m++) {
          const [p, j] = o[m - 1],
            [v, F] = o[m];
          if (g <= v) return j + ((F - j) * (g - p)) / Math.max(1e-6, v - p);
        }
        return o[o.length - 1][1];
      },
      color: h,
    }
  );
}
const $t = (t, a, l = "#FFFFFF") => Y(l, t.color, Math.min(t.alphaAt(a), t.alphaAt(a + 1)));
function kt(t, a, l, n, r, h, o, c = {}) {
  const u = c.size ?? 20,
    i = "VIRTUELL MÖBLIERT",
    f = P(a, i, u, 0.14),
    g = u * 0.9,
    m = u * 2.3,
    p = f + g * 2,
    j = c.inset ?? 24,
    v = o === "tl" || o === "bl" ? l + j : l + r - j - p,
    F = o === "tl" || o === "tr" ? n + j : n + h - j - m,
    A = c.fill ?? "#141210",
    T = c.ink ?? "#FFFFFF";
  (M(t, `<g data-role="virtuell-moebliert">${J(v, F, p, m, A, m / 2)}`),
    G(t, a, i, v + g, F + (m - D(a, u)) / 2, u, { fill: T, ground: A, tracking: 0.14 }),
    M(t, "</g>"));
}
function Nt(t, a, l, n, r, h, o, c) {
  const u = `${String(l).padStart(2, "0")} / ${String(n).padStart(2, "0")}`,
    i = 20,
    f = P(a, u, i, 0.1),
    g = 14,
    m = i * 2.1;
  (M(t, J(r - f - 2 * g, h, f + 2 * g, m, o, m / 2)),
    G(t, a, u, r - g, h + (m - D(a, i)) / 2, i, {
      fill: c,
      ground: o,
      tracking: 0.1,
      anchor: "end",
    }));
}
function yt(t, a, l, n) {
  return `<g data-role="wischen" fill="none" stroke="${n}" stroke-width="${b(l * 0.09, 2)}" stroke-linecap="round" stroke-linejoin="round"><path d="M${b(t, 2)} ${b(a, 2)}H${b(t + l, 2)}M${b(t + l * 0.62, 2)} ${b(a - l * 0.36, 2)}L${b(t + l, 2)} ${b(a, 2)}L${b(t + l * 0.62, 2)} ${b(a + l * 0.36, 2)}"/></g>`;
}
function St(t, a) {
  const l = q("pf");
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${t.W} ${t.H}" width="${t.W}" height="${t.H}"><title>${xe(a)}</title><defs><clipPath id="${l}"><rect x="0" y="0" width="${t.W}" height="${t.H}"/></clipPath></defs><g clip-path="url(#${l})">${t.out.join("")}</g></svg>`;
}
function Et(t, a = "#FFFFFF", l = 4.6) {
  let n = t;
  for (let r = 0; r < 20 && ve(n, a) < l; r++) n = Y(n, "#000000", 0.12);
  return n;
}
function Ft(t, a, l = 4.6) {
  let n = t;
  for (let r = 0; r < 24 && ve(n, a) < l; r++) n = Y(n, "#000000", 0.1);
  return n;
}
const me = new Map();
async function et(t, a) {
  const l = await new Promise((o, c) => {
      const u = new Image();
      ((u.onload = () => o(u)), (u.onerror = () => c(new Error("Bild nicht lesbar"))), (u.src = t));
    }),
    n = Math.min(1, a / Math.max(l.naturalWidth, l.naturalHeight));
  if (n >= 1) return t;
  const r = document.createElement("canvas");
  ((r.width = Math.max(1, Math.round(l.naturalWidth * n))),
    (r.height = Math.max(1, Math.round(l.naturalHeight * n))));
  const h = r.getContext("2d");
  return h
    ? ((h.imageSmoothingQuality = "high"),
      h.drawImage(l, 0, 0, r.width, r.height),
      r.toDataURL("image/jpeg", 0.82))
    : t;
}
function tt(t, a = 1400) {
  let l = me.get(t);
  return (l || ((l = fe(t).then((n) => (n ? et(n, a).catch(() => n) : null))), me.set(t, l)), l);
}
function st(t) {
  const a = t.join(","),
    [l, n] = $.useState({});
  return (
    $.useEffect(() => {
      let r = !0;
      return (
        Promise.all(t.map(async (h) => [h, await tt(h)])).then((h) => {
          r && n(Object.fromEntries(h.filter(([, o]) => !!o)));
        }),
        () => {
          r = !1;
        }
      );
    }, [a]),
    l
  );
}
async function zt(t) {
  const a = await Promise.all(t.map(async (l) => [l, await fe(l)]));
  return Object.fromEntries(a.filter(([, l]) => !!l));
}
const at = [
    ["4:5", 80, 100],
    ["1:1", 90, 90],
    ["9:16", 64, 114],
  ],
  W = (t, a = 0, l = 1) => Math.min(l, Math.max(a, t));
function lt({ open: t, photo: a, href: l, onClose: n, onChange: r, virtual: h, onVirtual: o }) {
  const [c, u] = $.useState((a == null ? void 0 : a.focus) ?? he);
  $.useEffect(() => {
    t && a && u(a.focus);
  }, [t, a == null ? void 0 : a.id]);
  const i = (m) => {
      (u(m), r(m));
    },
    f = (m) => {
      const p = m.currentTarget.getBoundingClientRect();
      i({ ...c, x: W((m.clientX - p.left) / p.width), y: W((m.clientY - p.top) / p.height) });
    },
    g = (m) => {
      const p = m.shiftKey ? 0.1 : 0.02,
        v = { ArrowLeft: [-p, 0], ArrowRight: [p, 0], ArrowUp: [0, -p], ArrowDown: [0, p] }[m.key];
      v && (m.preventDefault(), i({ ...c, x: W(c.x + v[0]), y: W(c.y + v[1]) }));
    };
  return s.jsx(ge, {
    open: t,
    onClose: n,
    size: "mid",
    title: "Bildausschnitt",
    sub: "Tipp auf das Wichtigste im Bild. Es bleibt in allen Formaten im Blick.",
    footer: s.jsx(pe, { onClick: n, children: "Fertig" }),
    children: l
      ? s.jsxs("div", {
          className: "ps-focus",
          children: [
            s.jsxs("div", {
              className: "ps-focus-img",
              role: "slider",
              tabIndex: 0,
              "aria-label": "Schwerpunkt im Bild, mit den Pfeiltasten verschieben",
              "aria-valuetext": `${Math.round(c.x * 100)} Prozent von links, ${Math.round(c.y * 100)} Prozent von oben`,
              onPointerDown: f,
              onKeyDown: g,
              children: [
                s.jsx("img", { src: l, alt: "", draggable: !1 }),
                s.jsx("span", {
                  className: "ps-focus-dot",
                  style: { left: `${c.x * 100}%`, top: `${c.y * 100}%` },
                  "aria-hidden": "true",
                }),
              ],
            }),
            s.jsxs("div", {
              className: "field",
              children: [
                s.jsx("label", {
                  className: "label field-label",
                  htmlFor: "ps-zoom",
                  children: "ZOOM",
                }),
                s.jsx("input", {
                  id: "ps-zoom",
                  type: "range",
                  min: 1,
                  max: De,
                  step: 0.05,
                  value: c.zoom,
                  onChange: (m) => i({ ...c, zoom: Number(m.target.value) }),
                }),
              ],
            }),
            s.jsx("div", {
              className: "ps-crops",
              "aria-label": "Vorschau der Zuschnitte",
              children: at.map(([m, p, j]) =>
                s.jsxs(
                  "figure",
                  {
                    children: [
                      s.jsx("svg", {
                        viewBox: `0 0 ${p} ${j}`,
                        width: p,
                        height: j,
                        role: "img",
                        "aria-label": `Zuschnitt ${m}`,
                        dangerouslySetInnerHTML: { __html: Ne(l, 0, 0, p, j, c) },
                      }),
                      s.jsx("figcaption", { className: "small", children: m }),
                    ],
                  },
                  m,
                ),
              ),
            }),
            s.jsxs("div", {
              className: "row",
              children: [
                s.jsx(ze, { checked: h, onChange: o, children: "Virtuell möbliert" }),
                s.jsx(R, { onClick: () => i({ ...he }), children: "Zurücksetzen" }),
              ],
            }),
          ],
        })
      : s.jsx("div", { className: "riffel skeleton", style: { height: 240 } }),
  });
}
function Mt({ open: t, onClose: a, project: l, object: n, onSaved: r }) {
  const { update: h, toast: o, announce: c, state: u } = Me(),
    [i, f] = $.useState(() => n ?? de()),
    [g, m] = $.useState({}),
    [p, j] = $.useState(!1),
    [v, F] = $.useState(null),
    [A, T] = $.useState(!1),
    [ye, Q] = $.useState(null),
    [ee, te] = $.useState(!1),
    B = $.useRef([]),
    K = $.useRef(null),
    se = $.useRef(null),
    N = $.useId(),
    H = st(i.photos.map((e) => e.id));
  $.useEffect(() => {
    t && (f(n ?? de()), m({}), F(null), j(!1), (B.current = []));
  }, [t, n == null ? void 0 : n.id]);
  const E = (e) => f((d) => ({ ...d, ...e })),
    O = (e) => f((d) => ({ ...d, energy: { ...d.energy, ...e } })),
    ae = (e, d) =>
      f((x) => ({ ...x, facts: x.facts.map((y, k) => (k === e ? { ...y, ...d } : y)) })),
    Se = Object.values(u.projects),
    Ee = async (e) => {
      if (!(e != null && e.length)) return;
      F(null);
      const d = w.photos - i.photos.length,
        x = Array.from(e).filter((L) => /^image\/(jpeg|png|webp)$/.test(L.type));
      (x.length < e.length && F("Nur Fotos im Format JPG, PNG oder WebP."),
        x.length > d &&
          F(`Höchstens ${w.photos} Fotos je Objekt. Die ersten ${d} haben wir übernommen.`),
        T(!0));
      const y = [];
      let k = !1;
      for (const L of x.slice(0, Math.max(0, d)))
        try {
          const V = Oe();
          ((await Pe(V, await Ae(L))) || (k = !0),
            B.current.push(V),
            y.push({
              id: V,
              focus: { x: 0.5, y: 0.5, zoom: 1 },
              rights: !0,
              virtual: !1,
              credit: "",
            }));
        } catch {
          F("Ein Foto konnte nicht gelesen werden. Versuch es mit einem anderen Bild.");
        }
      (T(!1),
        k &&
          F(
            "Dein Browser speichert hier keine Fotos dauerhaft. Sie bleiben, bis du die Seite neu lädst.",
          ),
        y.length &&
          (f((L) => ({ ...L, photos: [...L.photos, ...y].slice(0, w.photos) })),
          c(`${y.length === 1 ? "1 Foto" : `${y.length} Fotos`} hinzugefügt.`)),
        K.current && (K.current.value = ""));
    },
    Z = (e) => {
      Ve(Se, e, { projectId: l.id, objectId: i.id }) || Ce(e);
    },
    Fe = (e) => {
      (E({ photos: i.photos.filter((d) => d.id !== e) }),
        B.current.includes(e) && ((B.current = B.current.filter((d) => d !== e)), Z(e)),
        c("Foto entfernt."));
    },
    le = () => {
      const e = He(i);
      m(e);
      const d = Object.keys(e)[0];
      if (d) {
        (["description", "url", "facts", "commission"].includes(d) && te(!0),
          d === "title" &&
            setTimeout(() => {
              var k;
              return (k = se.current) == null ? void 0 : k.focus();
            }, 30),
          c("Bitte prüf die markierten Felder.", !0));
        return;
      }
      const x = Ze(i),
        y = (n == null ? void 0 : n.photos.map((k) => k.id)) ?? [];
      h(l.id, (k) => ({ ...k, library: _e(k.library ?? { objects: [] }, x) }));
      for (const k of y) x.photos.some((L) => L.id === k) || Z(k);
      ((B.current = []),
        o(
          Ye(x.energy) === "voll"
            ? "Objekt gespeichert."
            : "Objekt gespeichert. Für Angebots-Postings fehlt noch der Energieausweis.",
        ),
        r == null || r(x),
        a());
    },
    ne = () => {
      for (const e of B.current) Z(e);
      ((B.current = []), a());
    },
    I = Te(i.energy.eebKlasse),
    _ = i.photos.filter((e) => !e.rights).length,
    z = i.photos.find((e) => e.id === ye) ?? null;
  return s.jsxs(s.Fragment, {
    children: [
      s.jsx(ge, {
        open: t,
        onClose: ne,
        size: "wide",
        title: n ? "Objekt ändern" : "Objekt anlegen",
        sub: "Für Postings, Flyer und Inserate. Fotos bleiben in diesem Browser.",
        closeLabel: "Abbrechen",
        footer: s.jsxs(s.Fragment, {
          children: [
            s.jsx(Le, { onClick: ne, children: "Abbrechen" }),
            s.jsx(pe, { onClick: le, children: "Speichern" }),
          ],
        }),
        children: s.jsxs("form", {
          noValidate: !0,
          className: "object-form ps-object-form",
          onSubmit: (e) => {
            (e.preventDefault(), le());
          },
          children: [
            s.jsx(S, {
              ref: se,
              label: "TITEL",
              placeholder: "z. B. Gartenwohnung mit Terrasse",
              maxLength: w.title,
              value: i.title,
              onChange: (e) => (
                E({ title: e.target.value }),
                g.title && m((d) => ({ ...d, title: void 0 }))
              ),
              error: g.title,
            }),
            s.jsxs("div", {
              className: "field",
              children: [
                s.jsx("span", {
                  className: "label field-label",
                  id: `${N}-st`,
                  children: "STATUS",
                }),
                s.jsx(ie, {
                  scroll: !0,
                  labelledBy: `${N}-st`,
                  value: i.status,
                  onChange: (e) => f((d) => Ke(d, e)),
                  options: Ue.filter((e) =>
                    i.kind === "miete" ? e !== "verkauft" : e !== "vermietet",
                  ).map((e) => ({ value: e, label: Ge[e] })),
                }),
              ],
            }),
            s.jsxs("div", {
              className: "ps-two",
              children: [
                s.jsxs("div", {
                  className: "field",
                  children: [
                    s.jsx("span", {
                      className: "label field-label",
                      id: `${N}-kind`,
                      children: "ART",
                    }),
                    s.jsx(ie, {
                      labelledBy: `${N}-kind`,
                      value: i.kind,
                      onChange: (e) => E({ kind: e }),
                      options: [
                        { value: "kauf", label: "Kauf" },
                        { value: "miete", label: "Miete" },
                      ],
                    }),
                  ],
                }),
                s.jsx(S, {
                  label: i.kind === "miete" ? "MIETE" : "PREIS",
                  placeholder: i.kind === "miete" ? "z. B. € 1.250 mtl." : "z. B. € 549.000",
                  maxLength: w.price,
                  value: i.price,
                  onChange: (e) => E({ price: e.target.value }),
                  error: g.price,
                }),
              ],
            }),
            i.status === "preis-angepasst" &&
              s.jsx(S, {
                label: "BISHERIGER PREIS",
                placeholder: "z. B. € 590.000",
                maxLength: w.price,
                value: i.previousPrice,
                onChange: (e) => E({ previousPrice: e.target.value }),
                error: g.previousPrice,
              }),
            s.jsxs("div", {
              className: "ps-two",
              children: [
                s.jsx(S, {
                  label: "LAGE (ÖFFENTLICH)",
                  placeholder: "z. B. Wien Döbling",
                  maxLength: w.lage,
                  value: i.lage,
                  onChange: (e) => E({ lage: e.target.value }),
                  error: g.lage,
                  help: "Erscheint auf den Bildern. Ohne Straße.",
                }),
                s.jsx(S, {
                  label: "ADRESSE (OPTIONAL)",
                  placeholder: "z. B. Beispielgasse 7, 1190 Wien",
                  autoComplete: "off",
                  maxLength: w.address,
                  value: i.address,
                  onChange: (e) => E({ address: e.target.value }),
                  error: g.address,
                  help: "Nur wenn du sie im Posting einschaltest.",
                }),
              ],
            }),
            s.jsxs("fieldset", {
              className: "field",
              children: [
                s.jsxs("legend", {
                  className: "label field-label",
                  children: ["FOTOS (BIS ZU ", w.photos, ")"],
                }),
                s.jsxs("label", {
                  className: "ps-check",
                  children: [
                    s.jsx("input", {
                      type: "checkbox",
                      checked: p,
                      onChange: (e) => j(e.target.checked),
                    }),
                    s.jsx("span", {
                      children:
                        "Ich habe die Rechte an den Fotos, die ich jetzt hochlade, auch für Social Media. Erkennbare Personen nur mit deren Einwilligung.",
                    }),
                  ],
                }),
                s.jsxs("div", {
                  className: "obj-photos ps-photos",
                  children: [
                    i.photos.map((e, d) =>
                      s.jsxs(
                        "figure",
                        {
                          className: "obj-photo",
                          children: [
                            H[e.id]
                              ? s.jsx("img", {
                                  src: H[e.id],
                                  alt: d === 0 ? "Titelbild" : `Foto ${d + 1}`,
                                })
                              : s.jsx("div", { className: "riffel skeleton" }),
                            d === 0 &&
                              s.jsx("figcaption", {
                                className: "obj-cover",
                                children: "Titelbild",
                              }),
                            s.jsxs("span", {
                              className: "ps-photo-tags",
                              children: [
                                e.virtual &&
                                  s.jsx("span", {
                                    className: "ps-tag",
                                    children: "Virtuell möbliert",
                                  }),
                                !e.rights &&
                                  s.jsx("span", {
                                    className: "ps-tag is-warn",
                                    children: "Rechte offen",
                                  }),
                              ],
                            }),
                            s.jsx(Be, {
                              label: `Foto ${d + 1} bearbeiten`,
                              className: "btn btn-text obj-photo-menu",
                              placement: "below-end",
                              items: [
                                { label: "Ausschnitt wählen", run: () => Q(e.id) },
                                {
                                  label: "Als Titelbild",
                                  run: () => f((x) => X(x, d, 0)),
                                  show: d > 0,
                                },
                                {
                                  label: "Nach vorn",
                                  run: () => f((x) => X(x, d, d - 1)),
                                  show: d > 1,
                                },
                                {
                                  label: "Nach hinten",
                                  run: () => f((x) => X(x, d, d + 1)),
                                  show: d < i.photos.length - 1,
                                },
                                {
                                  label: e.virtual
                                    ? "Nicht virtuell möbliert"
                                    : "Virtuell möbliert",
                                  run: () => f((x) => C(x, e.id, { virtual: !e.virtual })),
                                },
                                {
                                  label: "Bildrechte bestätigen",
                                  run: () => f((x) => C(x, e.id, { rights: !0 })),
                                  show: !e.rights,
                                },
                                { label: "Entfernen", run: () => Fe(e.id) },
                              ],
                              children: s.jsxs("svg", {
                                "aria-hidden": "true",
                                width: "16",
                                height: "4",
                                viewBox: "0 0 16 4",
                                children: [
                                  s.jsx("circle", {
                                    cx: "2",
                                    cy: "2",
                                    r: "1.5",
                                    fill: "currentColor",
                                  }),
                                  s.jsx("circle", {
                                    cx: "8",
                                    cy: "2",
                                    r: "1.5",
                                    fill: "currentColor",
                                  }),
                                  s.jsx("circle", {
                                    cx: "14",
                                    cy: "2",
                                    r: "1.5",
                                    fill: "currentColor",
                                  }),
                                ],
                              }),
                            }),
                          ],
                        },
                        e.id,
                      ),
                    ),
                    i.photos.length < w.photos &&
                      s.jsxs("label", {
                        className: `obj-add btn btn-ghost file-btn${p ? "" : " is-disabled"}`,
                        "aria-disabled": !p || void 0,
                        children: [
                          A
                            ? "Wird verkleinert ..."
                            : i.photos.length
                              ? "Fotos hinzufügen"
                              : "Fotos wählen",
                          s.jsx("input", {
                            ref: K,
                            type: "file",
                            multiple: !0,
                            accept: "image/jpeg,image/png,image/webp",
                            className: "file-overlay",
                            "aria-describedby": `${N}-ph`,
                            onChange: (e) => Ee(e.target.files),
                            disabled: A || !p,
                          }),
                        ],
                      }),
                  ],
                }),
                s.jsx("p", {
                  className: "field-help",
                  id: `${N}-ph`,
                  children: p
                    ? "Das erste Foto ist das Titelbild. Über ⋯ wählst du Ausschnitt, Reihenfolge und „virtuell möbliert“."
                    : "Bestätige zuerst die Bildrechte, dann kannst du Fotos wählen.",
                }),
                _ > 0 &&
                  s.jsxs("p", {
                    className: "field-help",
                    role: "status",
                    children: [
                      _ === 1 ? "Für 1 Foto" : `Für ${_} Fotos`,
                      " sind die Bildrechte noch offen.",
                      " ",
                      s.jsx(R, {
                        onClick: () =>
                          f((e) => ({ ...e, photos: e.photos.map((d) => ({ ...d, rights: !0 })) })),
                        children: "Rechte für alle bestätigen",
                      }),
                    ],
                  }),
                v && s.jsx("p", { className: "field-help", role: "status", children: v }),
              ],
            }),
            s.jsxs("fieldset", {
              className: "field",
              children: [
                s.jsx("legend", { className: "label field-label", children: "ENERGIEAUSWEIS" }),
                s.jsxs("div", {
                  className: "obj-energy ps-energy",
                  children: [
                    s.jsx(S, {
                      label: "HWB (kWh/m²a)",
                      inputMode: "decimal",
                      placeholder: "z. B. 45",
                      value: i.energy.hwb,
                      onChange: (e) => O({ hwb: e.target.value }),
                      error: g.hwb,
                    }),
                    s.jsx(S, {
                      label: "EEB (kWh/m²a)",
                      inputMode: "decimal",
                      placeholder: "z. B. 62",
                      value: i.energy.eeb,
                      onChange: (e) => O({ eeb: e.target.value }),
                      error: g.eeb,
                    }),
                    s.jsxs("div", {
                      className: "field",
                      children: [
                        s.jsx("label", {
                          className: "label field-label",
                          htmlFor: `${N}-ek`,
                          children: "KLASSE (EEB)",
                        }),
                        s.jsxs("select", {
                          id: `${N}-ek`,
                          className: "input",
                          value: I.klasse,
                          onChange: (e) => O({ eebKlasse: oe(e.target.value, I.zusatz) }),
                          children: [
                            s.jsx("option", { value: "", children: "Wählen" }),
                            re.map((e) => s.jsx("option", { value: e, children: e }, e)),
                          ],
                        }),
                      ],
                    }),
                    s.jsx(S, {
                      label: "ZUSATZ (OPTIONAL)",
                      placeholder: "z. B. fossil",
                      value: I.zusatz,
                      onChange: (e) => O({ eebKlasse: oe(I.klasse, e.target.value) }),
                      error: g.eebKlasse,
                    }),
                    s.jsx(S, {
                      label: "AUSGESTELLT AM",
                      type: "date",
                      value: i.energy.ausweisDatum,
                      onChange: (e) => O({ ausweisDatum: e.target.value }),
                      error: g.ausweisDatum,
                    }),
                  ],
                }),
                s.jsxs("details", {
                  className: "disclosure",
                  children: [
                    s.jsx("summary", { children: "Älterer Ausweis ohne EEB" }),
                    s.jsxs("div", {
                      className: "disclosure-body obj-energy",
                      children: [
                        s.jsx(S, {
                          label: "fGEE",
                          inputMode: "decimal",
                          placeholder: "z. B. 0,85",
                          value: i.energy.fgee,
                          onChange: (e) => O({ fgee: e.target.value }),
                          error: g.fgee,
                        }),
                        s.jsxs("div", {
                          className: "field",
                          children: [
                            s.jsx("label", {
                              className: "label field-label",
                              htmlFor: `${N}-k`,
                              children: "KLASSE",
                            }),
                            s.jsxs("select", {
                              id: `${N}-k`,
                              className: "input",
                              value: i.energy.klasse,
                              onChange: (e) => O({ klasse: e.target.value }),
                              children: [
                                s.jsx("option", { value: "", children: "Wählen" }),
                                re.map((e) => s.jsx("option", { value: e, children: e }, e)),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                s.jsx("p", {
                  className: "field-help",
                  children:
                    "Pflicht in jedem Angebots-Posting. Du findest die Werte auf Seite 1 deines Energieausweises.",
                }),
              ],
            }),
            s.jsxs("details", {
              className: "disclosure contact-more",
              open: ee,
              onToggle: (e) => te(e.currentTarget.open),
              children: [
                s.jsx("summary", { children: "Kennzahlen, Beschreibung und mehr" }),
                ee &&
                  s.jsxs("div", {
                    className: "disclosure-body",
                    children: [
                      s.jsxs("fieldset", {
                        className: "field",
                        children: [
                          s.jsx("legend", {
                            className: "label field-label",
                            children: "KENNZAHLEN",
                          }),
                          s.jsx("div", {
                            className: "obj-facts",
                            children: i.facts.map((e, d) =>
                              s.jsxs(
                                "div",
                                {
                                  className: "obj-fact",
                                  children: [
                                    s.jsx("input", {
                                      className: "input",
                                      "aria-label": `Kennzahl ${d + 1}, Bezeichnung`,
                                      list: `${N}-fl`,
                                      maxLength: w.factLabel,
                                      value: e.label,
                                      onChange: (x) => ae(d, { label: x.target.value }),
                                    }),
                                    s.jsx("input", {
                                      className: "input",
                                      "aria-label": `Kennzahl ${d + 1}, Wert`,
                                      placeholder: Ie[e.label] ?? "Wert",
                                      maxLength: w.factValue,
                                      value: e.value,
                                      onChange: (x) => ae(d, { value: x.target.value }),
                                    }),
                                    s.jsx(R, {
                                      className: "obj-fact-x",
                                      "aria-label": `Kennzahl ${e.label || d + 1} entfernen`,
                                      onClick: () =>
                                        E({ facts: i.facts.filter((x, y) => y !== d) }),
                                      children: s.jsx("svg", {
                                        "aria-hidden": "true",
                                        width: "12",
                                        height: "12",
                                        viewBox: "0 0 12 12",
                                        children: s.jsx("path", {
                                          d: "M2 2l8 8M10 2l-8 8",
                                          stroke: "currentColor",
                                          strokeWidth: "1.5",
                                        }),
                                      }),
                                    }),
                                  ],
                                },
                                d,
                              ),
                            ),
                          }),
                          s.jsx("datalist", {
                            id: `${N}-fl`,
                            children: ce.map((e) => s.jsx("option", { value: e }, e)),
                          }),
                          i.facts.length < w.facts &&
                            s.jsx(R, {
                              onClick: () =>
                                E({
                                  facts: [
                                    ...i.facts,
                                    {
                                      label:
                                        ce.find((e) => !i.facts.some((d) => d.label === e)) ?? "",
                                      value: "",
                                    },
                                  ],
                                }),
                              children: "Kennzahl hinzufügen",
                            }),
                          g.facts && s.jsx("p", { className: "field-error", children: g.facts }),
                        ],
                      }),
                      s.jsxs("div", {
                        className: "field",
                        children: [
                          s.jsx("label", {
                            className: "label field-label",
                            htmlFor: `${N}-d`,
                            children: "BESCHREIBUNG (OPTIONAL)",
                          }),
                          s.jsx("textarea", {
                            id: `${N}-d`,
                            className: "input",
                            rows: 4,
                            maxLength: w.description,
                            placeholder: "Zwei bis vier Sätze zum Objekt und zur Lage.",
                            value: i.description,
                            onChange: (e) => E({ description: e.target.value }),
                          }),
                        ],
                      }),
                      s.jsx(S, {
                        label: "PROVISION (OPTIONAL)",
                        placeholder: "z. B. 3 % zzgl. 20 % USt.",
                        maxLength: w.commission,
                        value: i.commission,
                        onChange: (e) => E({ commission: e.target.value }),
                        error: g.commission,
                        help: "Erscheint nur, wenn du sie im Posting einschaltest.",
                      }),
                      s.jsx(S, {
                        label: "OBJEKTSEITE (OPTIONAL)",
                        inputMode: "url",
                        placeholder: "z. B. beispiel-immobilien.at/objekt-12",
                        value: i.url,
                        onChange: (e) => E({ url: e.target.value }),
                        error: g.url,
                      }),
                      i.photos.length > 0 &&
                        s.jsxs("fieldset", {
                          className: "field",
                          children: [
                            s.jsx("legend", {
                              className: "label field-label",
                              children: "BILDNACHWEIS (OPTIONAL)",
                            }),
                            i.photos.map((e, d) =>
                              s.jsx(
                                S,
                                {
                                  label: `FOTO ${d + 1}`,
                                  placeholder: "z. B. Studio Beispiel",
                                  maxLength: w.credit,
                                  value: e.credit,
                                  onChange: (x) => f((y) => C(y, e.id, { credit: x.target.value })),
                                },
                                e.id,
                              ),
                            ),
                          ],
                        }),
                    ],
                  }),
              ],
            }),
            s.jsx("button", { type: "submit", hidden: !0 }),
          ],
        }),
      }),
      s.jsx(lt, {
        open: !!z,
        photo: z,
        href: z ? H[z.id] : void 0,
        onClose: () => Q(null),
        onChange: (e) => z && f((d) => C(d, z.id, { focus: e })),
        virtual: (z == null ? void 0 : z.virtual) ?? !1,
        onVirtual: (e) => z && f((d) => C(d, z.id, { virtual: e })),
      }),
    ],
  });
}
export {
  Mt as O,
  gt as a,
  mt as b,
  ut as c,
  Nt as d,
  Ye as e,
  Qe as f,
  xt as g,
  M as h,
  ft as i,
  yt as j,
  wt as k,
  bt as l,
  Je as m,
  Ne as n,
  $t as o,
  vt as p,
  Ft as q,
  J as r,
  jt as s,
  G as t,
  Et as u,
  kt as v,
  pt as w,
  St as x,
  st as y,
  zt as z,
};
