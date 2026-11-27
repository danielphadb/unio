import {
  i as Ue,
  r as f,
  j as s,
  u as Se,
  D as Ce,
  G as J,
  P as pe,
  c as We,
  b as Je,
  n as Ze,
  d as qe,
  e as Q,
  t as Xe,
  o as Ye,
  T as W,
  g as je,
  h as Qe,
  S as en,
} from "./index-BER2gtDe.js";
import {
  a as Me,
  v as nn,
  C as tn,
  f as he,
  r as sn,
  b as Ee,
  e as Oe,
  m as an,
  i as rn,
  d as on,
  u as ln,
  h as cn,
  j as dn,
  k as un,
  l as hn,
} from "./engine-BhDRZEfO.js";
import { h as fe, M as fn, C as te } from "./svg-CrwnZnJY.js";
import { N as mn, W as gn, u as Te, H as pn, K as bn, s as yn } from "./NameCard-BpHDImep.js";
import { d as we, S as Fe, N as Ae, Q as xn, a as kn, T as $e } from "./describe-CrBWccON.js";
import { p as wn, a as vn, c as Nn, b as Sn, s as Cn, d as ve } from "./nameFinder-CLppxXuz.js";
import "./LogoView-CG3DXWdO.js";
const jn = "/api/brand-art-director",
  Mn = 55e3,
  be = 6,
  Re = 24,
  Le = 60 * 1024,
  En = /^[A-Za-z0-9_-]{1,40}$/,
  On = /^[A-Za-z0-9+/]+={0,2}$/;
function Tn(e) {
  const n = e.indexOf("base64,");
  return (e.startsWith("data:") && n >= 0 ? e.slice(n + 7) : e).replace(/\s+/g, "");
}
function Fn(e) {
  const n = e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0;
  return Math.floor((e.length * 3) / 4) - n;
}
function le(e, n) {
  const t = (e ?? "").trim();
  return t ? t.slice(0, n) : void 0;
}
function An(e) {
  if (!e || !e.profil || (e.profil.art !== "person" && e.profil.art !== "firma")) return null;
  const n = (e.marke ?? "").trim();
  if (!n || n.length > 80) return null;
  const t = Array.isArray(e.karten) ? e.karten : [];
  if (t.length < be || t.length > Re) return null;
  const r = new Set(),
    i = [];
  for (const d of t) {
    if (!d || !En.test(d.id) || r.has(d.id)) return null;
    r.add(d.id);
    const l = Tn(d.png ?? "");
    if (!l || !On.test(l) || Fn(l) > Le) return null;
    const c = { id: d.id, png: l },
      k = le(d.beschreibung, 200);
    (k && (c.beschreibung = k), i.push(c));
  }
  const o = { art: e.profil.art },
    u = le(e.profil.ort, 60),
    a = le(e.profil.zusatz, 60);
  return (u && (o.ort = u), a && (o.zusatz = a), { stil: e.stil, profil: o, marke: n, karten: i });
}
function Ie(e, n) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.ok !== !0 || !Array.isArray(t.rangfolge)) return null;
  const r = new Set(n),
    i = new Set(),
    o = [];
  for (const l of t.rangfolge) {
    if (!l || typeof l != "object") return null;
    const c = l;
    if (
      typeof c.id != "string" ||
      !r.has(c.id) ||
      i.has(c.id) ||
      typeof c.wert != "number" ||
      !Number.isFinite(c.wert) ||
      typeof c.grund != "string"
    )
      return null;
    i.add(c.id);
    const k = { id: c.id, wert: Math.max(0, Math.min(100, Math.round(c.wert))), grund: c.grund };
    (typeof c.ausschluss == "string" && c.ausschluss && (k.ausschluss = c.ausschluss), o.push(k));
  }
  if (!o.length) return null;
  const u = t.nutzung && typeof t.nutzung == "object" ? t.nutzung : {},
    a = (l) => (typeof l == "number" && Number.isFinite(l) ? l : 0),
    d = {
      rangfolge: o,
      modell: typeof t.modell == "string" ? t.modell : "",
      nutzung: { eingabe: a(u.eingabe), ausgabe: a(u.ausgabe), cache: a(u.cache) },
    };
  return (t.testmodus === !0 && (d.testmodus = !0), d);
}
async function $n(e, n = {}) {
  var a, d, l;
  const t = An(e);
  if (!t) return null;
  const r = n.fetchImpl ?? (typeof fetch == "function" ? fetch : void 0);
  if (!r || ((a = n.signal) != null && a.aborted)) return null;
  const i = new AbortController(),
    o = () => i.abort();
  (d = n.signal) == null || d.addEventListener("abort", o, { once: !0 });
  const u = setTimeout(o, Math.max(1, n.timeoutMs ?? Mn));
  try {
    const c = await r(n.endpoint ?? jn, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
      signal: i.signal,
      credentials: "same-origin",
    });
    if (!c.ok) return null;
    const k = await c.json();
    return i.signal.aborted
      ? null
      : Ie(
          k,
          t.karten.map((C) => C.id),
        );
  } catch {
    return null;
  } finally {
    (clearTimeout(u), (l = n.signal) == null || l.removeEventListener("abort", o));
  }
}
const Rn = 320,
  Ln = "#ffffff",
  ce = 160,
  In = 2e3;
function se(e, n) {
  const t = new RegExp(`\\s${n}\\s*=\\s*["']([^"']*)["']`, "i").exec(e);
  return t ? t[1] : null;
}
function ze(e) {
  var o, u;
  const n = (o = /<svg\b[^>]*>/i.exec(e)) == null ? void 0 : o[0];
  if (!n) return null;
  const t =
    (u = se(n, "viewBox")) == null
      ? void 0
      : u
          .trim()
          .split(/[\s,]+/)
          .map(Number);
  if (t && t.length === 4 && t[2] > 0 && t[3] > 0) return { breite: t[2], hoehe: t[3] };
  const r = parseFloat(se(n, "width") ?? ""),
    i = parseFloat(se(n, "height") ?? "");
  return r > 0 && i > 0 ? { breite: r, hoehe: i } : null;
}
function zn(e, n, t) {
  return e.replace(/<svg\b[^>]*>/i, (r) => {
    const i = ze(r + "</svg>");
    let o = r.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, "");
    return (
      !se(r, "viewBox") &&
        i &&
        (o = o.replace(/<svg\b/i, `<svg viewBox="0 0 ${i.breite} ${i.hoehe}"`)),
      o.replace(/<svg\b/i, `<svg width="${n}" height="${t}"`)
    );
  });
}
function _n(e) {
  let n = "";
  for (let t = 0; t < e.length; t += 32768) n += String.fromCharCode(...e.subarray(t, t + 32768));
  return btoa(n);
}
async function Bn(e) {
  return e instanceof Uint8Array ? e : new Uint8Array(await e.arrayBuffer());
}
function Kn(e) {
  return new Promise((n, t) => {
    const r = new Image();
    ((r.decoding = "async"),
      (r.onload = () => n(r)),
      (r.onerror = () => t(new Error("SVG konnte nicht gerastert werden"))),
      (r.src = e));
  });
}
const Dn = async (e, n, t, r) => {
  if (typeof Image > "u") throw new Error("Vorschau braucht einen Browser");
  const i = URL.createObjectURL(new Blob([zn(e, n, t)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const o = await Kn(i);
    if (typeof OffscreenCanvas < "u") {
      const l = new OffscreenCanvas(n, t),
        c = l.getContext("2d");
      if (!c) throw new Error("Canvas nicht verfügbar");
      return (
        (c.fillStyle = r),
        c.fillRect(0, 0, n, t),
        c.drawImage(o, 0, 0, n, t),
        await l.convertToBlob({ type: "image/png" })
      );
    }
    const u = document.createElement("canvas");
    ((u.width = n), (u.height = t));
    const a = u.getContext("2d");
    if (!a) throw new Error("Canvas nicht verfügbar");
    ((a.fillStyle = r), a.fillRect(0, 0, n, t), a.drawImage(o, 0, 0, n, t));
    const d = await new Promise((l) => u.toBlob(l, "image/png"));
    if (!d) throw new Error("PNG konnte nicht erstellt werden");
    return d;
  } finally {
    URL.revokeObjectURL(i);
  }
};
async function Pn(e, n = {}) {
  const t = ze(e);
  if (!t) return null;
  const r = n.rasterisierer ?? Dn,
    i = n.hintergrund ?? Ln,
    o = n.maxBytes ?? Le;
  let u = Math.max(ce, Math.round(n.breite ?? Rn));
  for (let a = 0; a < 4; a++) {
    const d = Math.max(1, Math.min(In, Math.round((u * t.hoehe) / t.breite)));
    try {
      const l = await Bn(await r(e, u, d, i));
      if (l.length && l.length <= o) return _n(l);
    } catch {
      return null;
    }
    if (u <= ce) break;
    u = Math.max(ce, Math.round(u * 0.75));
  }
  return null;
}
async function Vn(e, n = {}) {
  const t = [];
  for (const r of e) {
    const i = await Pn(r.svg, n);
    i &&
      t.push(
        r.beschreibung ? { id: r.id, png: i, beschreibung: r.beschreibung } : { id: r.id, png: i },
      );
  }
  return t;
}
const _e = (e) => `k${e}`;
function Gn(e, n) {
  const t = new Set(),
    r = [];
  for (const i of [...e, ...n]) t.has(i.id) || r.length >= Re || (t.add(i.id), r.push(i));
  return r.length >= be ? r : [];
}
function Hn(e, n) {
  const t = [
    e.name,
    e.suffix ?? "",
    e.place ?? "",
    e.nameKind ?? "",
    e.ort2 ?? "",
    e.jahr ?? "",
    e.styles.join(","),
  ].join("|");
  return `${fe(t).toString(36)}-${fe(n.map((r) => r.id).join(",")).toString(36)}`;
}
function Un(e) {
  var t, r;
  const n = { art: Ue(e) ? "person" : "firma" };
  return (
    (t = e.place) != null && t.trim() && (n.ort = e.place.trim()),
    (r = e.suffix) != null && r.trim() && (n.zusatz = e.suffix.trim()),
    n
  );
}
function Wn(e, n, t, r = new Set()) {
  const i = new Map(e.map((l, c) => [_e(c), l])),
    o = new Set(),
    u = new Map(),
    a = [];
  for (const l of n.rangfolge) {
    const c = i.get(l.id);
    c && (l.ausschluss ? o.add(c.id) : a.push(c), l.grund && u.set(c.id, l.grund));
  }
  for (const l of e) !o.has(l.id) && !a.includes(l) && a.push(l);
  const d = [];
  for (const l of a) {
    if (d.length >= t) break;
    r.has(l.id) || d.push(l);
  }
  return { page: d, reasons: u };
}
const de = new Map(),
  ae = new Map(),
  Be = "unio-brand:ki:";
function Jn(e) {
  try {
    const n = sessionStorage.getItem(Be + e);
    if (!n) return null;
    const t = JSON.parse(n);
    return Ie(
      t,
      t.rangfolge.map((r) => r.id),
    );
  } catch {
    return null;
  }
}
function Zn(e, n) {
  try {
    sessionStorage.setItem(Be + e, JSON.stringify({ ok: !0, ...n }));
  } catch {}
}
function qn(e, n, t = {}) {
  let r = de.get(e);
  const i = r ? null : Jn(e);
  return (
    i && (ae.set(e, i), (r = Promise.resolve(i)), de.set(e, r)),
    r ||
      ((r = (async () => {
        const o = await n().catch(() => null);
        return o ? $n(o, { endpoint: t.endpoint }) : null;
      })().then((o) => (ae.set(e, o), o && Zn(e, o), o))),
      de.set(e, r)),
    r
  );
}
function Xn(e) {
  return ae.has(e) ? ae.get(e) : void 0;
}
async function Yn(e, n, t, r, i) {
  const o = [];
  for (let a = 0; a < t.length; a++) {
    const d = await r(t[a]);
    d && o.push({ id: _e(a), svg: d });
  }
  const u = await Vn(o);
  return u.length < be ? null : { stil: n, profil: Un(e), marke: e.name.trim(), karten: u };
}
const Qn = { gut: "Gut", hinweis: "Hinweis", kritisch: "Kritisch" },
  et = { stark: "Starker Name", solide: "Solider Name", schwach: "Mit Schwächen" };
function nt(e) {
  var i, o, u, a;
  const n =
      ((i = e.nameContext) == null ? void 0 : i.person) ??
      (e.input.nameKind !== "company" ? e.rawName : void 0),
    t =
      ((o = e.nameContext) == null ? void 0 : o.company) ??
      (e.input.nameKind === "company" ? e.rawName : void 0),
    r = {
      ...(n ? { person: n } : {}),
      ...(t ? { company: t } : {}),
      ...(e.input.place ? { region: e.input.place } : {}),
      focus: ((u = e.nameContext) == null ? void 0 : u.focus) ?? [],
      styles: e.input.styles,
      keywords: ((a = e.nameContext) == null ? void 0 : a.keywords) ?? [],
    };
  return (e.route && (r.route = e.route.params), r);
}
function tt({ project: e }) {
  const [n, t] = f.useState(!1);
  return s.jsxs("details", {
    className: "disclosure name-probe",
    onToggle: (r) => t(r.currentTarget.open),
    children: [
      s.jsx("summary", { children: "Namen auf die Probe stellen" }),
      n && s.jsx("div", { className: "disclosure-body", children: s.jsx(st, { project: e }) }),
    ],
  });
}
function st({ project: e }) {
  const { update: n, put: t, toast: r, announce: i, navigate: o } = Se(),
    u = e.rawName || e.input.name,
    a = JSON.stringify(nt(e)),
    d = f.useMemo(() => JSON.parse(a), [a]),
    l = f.useMemo(() => wn(u, d), [u, d]),
    c = f.useMemo(() => vn(u, d, 12), [u, d]),
    k = e.input.styles,
    C = f.useMemo(() => fe(`${e.seed}|probe|${u}`), [e.seed, u]),
    m = f.useMemo(() => {
      var p;
      let g = [];
      try {
        g = Nn(c, C, k, !1, (p = e.route) == null ? void 0 : p.params);
      } catch (R) {
        console.warn("Alternativen ohne finale Logos", R);
      }
      return c.map((R, K) => g[K] ?? Sn(R, K, C, k));
    }, [c, C, k, e.route]),
    [T, $] = f.useState(() => new Set()),
    [O, F] = f.useState(null),
    I = f.useMemo(
      () => new Set(e.nameCandidates.map((g) => g.name.toLocaleLowerCase("de-AT"))),
      [e.nameCandidates],
    ),
    M = f.useCallback(
      (g) => {
        const p = g.name.toLocaleLowerCase("de-AT");
        (n(e.id, (R) => ({
          ...R,
          nameCandidates: R.nameCandidates.some((K) => K.name.toLocaleLowerCase("de-AT") === p)
            ? R.nameCandidates.filter((K) => K.name.toLocaleLowerCase("de-AT") !== p)
            : [...R.nameCandidates, { name: g.name, descriptor: g.suffix ?? "", kind: g.kind }],
        })),
          I.has(p) || i(`„${g.name}“ gemerkt.`));
      },
      [n, e.id, I, i],
    ),
    B = f.useCallback((g) => $((p) => new Set(p).add(g.id)), []),
    _ = f.useCallback((g) => F(c.findIndex((p) => p.id === g.id)), [c]),
    N = O !== null ? c[O] : null,
    w = O !== null ? (m[O] ?? null) : null,
    y = () => {
      if (!N) return;
      const g = Ze(e);
      (n(e.id, (p) => qe(p, { name: N.name, suffix: N.suffix, kind: ve(N.kind) }, w)),
        F(null),
        r(`Deine Marke heißt jetzt „${N.name}“.`, {
          label: "Rückgängig",
          run: () => n(e.id, (p) => ({ ...p, ...g })),
        }));
    },
    A = () => {
      if (!N) return;
      const g = We(N.suffix);
      let p = Je({
        rawName: N.name,
        suffixChoice: g.choice,
        customSuffix: g.custom,
        keepLegalForm: !0,
        nameKind: ve(N.kind),
        place: e.input.place,
      });
      ((p = {
        ...p,
        input: { ...p.input, styles: e.input.styles },
        styleChoice: e.styleChoice,
        pinned: w,
        favorites: w ? [w] : [],
        numbers: w ? { [w.id]: 1 } : {},
        ...(e.nameContext ? { nameContext: e.nameContext } : {}),
        ...(e.brief ? { brief: e.brief } : {}),
        ...(e.route ? { route: e.route } : {}),
        ui: { ...p.ui, route: `#/p/${p.id}/${e.styleChoice ? "auswahl" : "stil"}` },
      }),
        t(p),
        F(null),
        r(`Zweite Marke „${N.name}“ angelegt.`, {
          label: "Öffnen",
          run: () =>
            o(
              e.styleChoice
                ? { name: "auswahl", id: p.id, gemerkt: !1 }
                : { name: "stil", id: p.id },
            ),
        }));
    },
    S = c.filter((g) => !T.has(g.id)),
    j = typeof matchMedia < "u" && matchMedia("(min-width: 760px)").matches;
  return s.jsxs("div", {
    className: "probe",
    children: [
      l.punkte.length > 0 &&
        s.jsxs(s.Fragment, {
          children: [
            s.jsxs("p", {
              className: "probe-sum",
              children: [
                s.jsx("span", {
                  className: "label probe-gesamt",
                  "data-gesamt": l.gesamt,
                  children: et[l.gesamt],
                }),
                " ",
                l.zusammenfassung,
              ],
            }),
            s.jsx("ul", {
              className: "probe-list",
              children: l.punkte.map((g) =>
                s.jsxs(
                  "li",
                  {
                    className: "probe-item",
                    "data-status": g.status,
                    children: [
                      s.jsx("span", { className: "probe-dot", "aria-hidden": "true" }),
                      s.jsx("span", { className: "probe-title", children: g.titel }),
                      s.jsx("span", { className: "label probe-status", children: Qn[g.status] }),
                      s.jsx("span", { className: "small probe-text", children: g.text }),
                    ],
                  },
                  g.id,
                ),
              ),
            }),
          ],
        }),
      S.length > 0 &&
        s.jsxs("section", {
          "aria-labelledby": "probe-alt-h",
          children: [
            s.jsx("h3", {
              className: "h2 probe-alt-h",
              id: "probe-alt-h",
              children: "Alternativen zum Vergleich",
            }),
            s.jsx("p", {
              className: "small",
              children:
                "Tippe auf einen Namen, um mit ihm weiterzumachen oder ihn als zweite Marke anzulegen.",
            }),
            s.jsx("div", {
              className: "wm-grid nf-list probe-grid",
              children: S.map((g) => {
                const p = c.indexOf(g);
                return s.jsx(
                  mn,
                  {
                    s: g,
                    concept: m[p] ?? null,
                    styles: k,
                    saved: I.has(g.name.toLocaleLowerCase("de-AT")),
                    desktop: j,
                    onOpen: _,
                    onSave: M,
                    onHide: B,
                  },
                  g.id,
                );
              }),
            }),
          ],
        }),
      N &&
        s.jsx(Ce, {
          open: !0,
          onClose: () => F(null),
          title: [N.name, N.suffix].filter(Boolean).join(" "),
          size: "mid",
          className: "nd-dialog",
          footer: s.jsxs(s.Fragment, {
            children: [
              s.jsx(J, { onClick: A, children: "Als zweite Marke anlegen" }),
              s.jsx(pe, { onClick: y, children: "Mit diesem Namen weiter" }),
            ],
          }),
          children: s.jsxs("div", {
            className: "nd-details",
            children: [
              s.jsxs("div", {
                className: "nd-hero",
                children: [
                  s.jsx(gn, { s: N, concept: w, styles: k, className: "nd-mark" }),
                  s.jsx("div", {
                    className: "nd-hero-row",
                    children: s.jsx("span", { className: "small nd-kind", children: Cn(N) }),
                  }),
                ],
              }),
              s.jsx("p", {
                className: "nd-reason",
                children: N.reason || "Eine Alternative zu deinem Namen.",
              }),
              s.jsx("p", {
                className: "small",
                children: "Logo, Stil und Filter bleiben. Du kannst den Tausch rückgängig machen.",
              }),
            ],
          }),
        }),
    ],
  });
}
const z = tn,
  me = (e) => e.nameFormat ?? "full",
  at = ["full", "upper", "surname", "stacked", "initial", "monogram", "district"];
function rt(e) {
  return e.layout === "wordmark" && !e.symbol
    ? e
    : { ...e, id: `${e.id}w`, layout: "wordmark", symbol: null };
}
const Ne = new Map();
function ge(e, n, t, r, i, o = !1) {
  const u = JSON.stringify([
    e.name,
    e.suffix,
    e.place ?? "",
    e.nameKind ?? "",
    e.ort2 ?? "",
    e.jahr ?? "",
    e.route ? `${e.route.territory}|${e.route.seed}|${JSON.stringify(e.route.axes)}` : "",
    e.styles,
    e.colorMoods,
    e.themes,
    n,
    t,
    r,
    i,
    o,
  ]);
  let a = Ne.get(u);
  if (!a) {
    const d = (n ^ rn(e)) >>> 0;
    let l = on(e, { page: t <= 0 ? 0 : t + 1, seed: d, signatureEntwuerfe: o });
    if (r) {
      const c = new Set();
      l = l.map(rt).filter((k) => (c.has(k.id) ? !1 : (c.add(k.id), !0)));
    }
    (i.length && (l = l.filter((c) => i.includes(me(c)))), (a = l), Ne.set(u, a));
  }
  return a;
}
function ot(e, n, t, r, i, o, u, a) {
  const [d, l] = f.useState({ key: "", list: [], pools: [], loading: !0, error: !1 }),
    c = JSON.stringify([
      e.name,
      e.suffix,
      e.place ?? "",
      e.nameKind ?? "",
      e.ort2 ?? "",
      e.jahr ?? "",
      e.route ? `${e.route.territory}|${e.route.seed}|${JSON.stringify(e.route.axes)}` : "",
      e.styles,
      e.colorMoods,
      e.themes,
      n,
      t,
      r,
      i,
      (o == null ? void 0 : o.id) ?? "",
      u,
      a,
    ]);
  return (
    f.useEffect(() => {
      let k = !0;
      return (
        l((C) => ({ ...C, key: c, loading: !0, error: !1 })),
        (async () => {
          const C = [],
            m = [];
          for (let T = 0; T < t; T++) {
            const { pkg: $ } = un(T);
            let O = ge(e, n, $, r, i, a);
            for (let M = 1; i.length && O.length < z * 2 && M <= 6; M++)
              O = [...O, ...ge(e, n, $ + 100 + M, r, i, a)];
            const F = T === 0 && o ? o : null,
              I = F ? [F, ...O.filter((M) => M.id !== F.id)] : O;
            if ((await he.ensure(sn(I, "logo", e)), !k)) return;
            (C.push(...Ee(I, e, he, z, { exclude: C.map((M) => M.id), pinFirst: !!F })), m.push(I));
          }
          k && l({ key: c, list: C, pools: m, loading: !1, error: !1 });
        })().catch((C) => {
          (console.error(C), k && l((m) => ({ ...m, key: c, loading: !1, error: !0 })));
        }),
        () => {
          k = !1;
        }
      );
    }, [c]),
    { list: d.list, pools: d.pools, loading: d.loading || d.key !== c, error: d.error }
  );
}
const ee = (e) => e.map((n) => n.id).join(",");
function it(e, n) {
  return new Promise((t) => {
    Oe(() => {
      try {
        t(hn(e, n, { variant: "color" }));
      } catch {
        t("");
      }
    });
  });
}
function lt(e, n, t, r, i, o) {
  const [u, a] = f.useState(() => new Map()),
    [d, l] = f.useState(() => new Set()),
    [, c] = f.useState(0),
    k = f.useRef(0),
    C = f.useRef(new Map()),
    m = f.useRef(!0),
    T = f.useRef(new Set());
  f.useEffect(
    () => (
      (m.current = !0),
      () => {
        m.current = !1;
      }
    ),
    [],
  );
  const $ = f.useMemo(
    () => Array.from({ length: Math.ceil(t.length / z) }, (w, y) => t.slice(y * z, (y + 1) * z)),
    [t],
  );
  (f.useEffect(() => {
    const w = o.current;
    if (!w) return;
    const y = () => (k.current = performance.now()),
      A = ["pointerdown", "keydown", "wheel", "touchstart"];
    for (const S of A) w.addEventListener(S, y, { passive: !0 });
    return () => {
      for (const S of A) w.removeEventListener(S, y);
    };
  }),
    f.useEffect(() => {
      const w = performance.now();
      for (const y of $) C.current.has(ee(y)) || C.current.set(ee(y), w);
    }, [$]),
    f.useEffect(() => {
      if (!e || !i) return;
      const w = t.map((y) => y.id);
      $.forEach((y, A) => {
        const S = ee(y),
          j = r[A];
        !j ||
          T.current.has(S) ||
          y.length < z ||
          (T.current.add(S),
          Oe(() => {
            if (!m.current) return T.current.delete(S);
            let g = [];
            try {
              g = Ee(j, n, he, 18, { exclude: w });
            } catch {
              g = j.filter((P) => !w.includes(P.id));
            }
            const p = Gn(y, g);
            if (!p.length) return;
            const R = { sent: p, key: Hn(n, p) };
            a((P) => new Map(P).set(S, R));
            const K = n.styles[0] ?? y[0].style;
            (an(`ai:start:${R.key}`),
              qn(R.key, () => Yn(n, K, p, (P) => it(P, n))).then((P) => {
                (Me("ai:ranking", `ai:start:${R.key}`),
                  m.current &&
                    (P && k.current <= (C.current.get(S) ?? 0) && l((G) => new Set(G).add(R.key)),
                    c((G) => G + 1)));
              }));
          }));
      });
    }, [e, i, $, r]));
  const O = [],
    F = new Map(),
    I = new Set(),
    M = [];
  let B = !1;
  const _ = new Set();
  $.forEach((w) => {
    const y = e ? u.get(ee(w)) : void 0,
      A = y ? Xn(y.key) : void 0;
    y && A === null && (B = !0);
    let S = w.filter((j) => !_.has(j.id));
    if (y && A && d.has(y.key)) {
      const j = Wn(y.sent, A, w.length, _);
      ((S = j.page), j.reasons.forEach((g, p) => F.set(p, g)));
      for (const g of S) I.add(g.id);
    } else y && A && M.push(y.key);
    if (y && S.length < w.length)
      for (const j of y.sent) S.length < w.length && !_.has(j.id) && !S.includes(j) && S.push(j);
    for (const j of S) _.add(j.id);
    O.push(...S);
  });
  const N = () => l((w) => new Set([...w, ...M]));
  return {
    list: e ? O : t,
    reasons: F,
    aiIds: I,
    pending: e ? M.length : 0,
    unavailable: e && B,
    showAll: N,
  };
}
function ct() {
  const e = () => (innerWidth >= 1280 ? 3 : innerWidth >= 760 ? 2 : 1),
    [n, t] = f.useState(e);
  return (
    f.useEffect(() => {
      const r = () => t(e());
      return (window.addEventListener("resize", r), () => window.removeEventListener("resize", r));
    }, []),
    n
  );
}
const ue = f.memo(function ({
    concept: n,
    no: t,
    input: r,
    dark: i,
    fav: o,
    focusable: u,
    tag: a,
    note: d,
    reason: l,
    aiIn: c,
    onOpen: k,
    onFav: C,
    onSimilar: m,
    onFocusCard: T,
    onKeyDown: $,
    index: O,
    onReady: F,
  }) {
    const { ready: I } = ln([n], r),
      M = f.useMemo(
        () =>
          n.cardBackground
            ? cn(n)
            : i
              ? { background: n.palette.ink, variant: "reverse", ground: n.palette.ink }
              : { background: n.palette.paper, variant: "color" },
        [n, i],
      ),
      B = M.variant === "reverse",
      _ = f.useMemo(() => ({ variant: M.variant, ground: M.ground }), [M]),
      { svg: N, error: w, fresh: y, retry: A } = dn(n, r, _, I, "high");
    f.useEffect(() => {
      N && F && F(O);
    }, [N, F, O]);
    const S = je(t);
    return s.jsxs("article", {
      className: `logo-card${B ? " is-dark" : ""}${o ? " is-fav" : ""}${c ? " ai-in" : ""}`,
      style: { background: M.background },
      "aria-label": `Konzept ${S}`,
      "data-index": O,
      "data-id": n.id,
      "data-signature": n.signature ? "" : void 0,
      title: l,
      children: [
        !N && !w && s.jsx("div", { className: "skeleton-fill riffel", "aria-hidden": "true" }),
        w
          ? s.jsxs("div", {
              className: "card-error",
              children: [
                s.jsx("p", { children: "Konnte nicht gezeichnet werden." }),
                s.jsx(J, { onClick: A, children: "Neu laden" }),
              ],
            })
          : s.jsx("button", {
              type: "button",
              className: `open${B ? " on-dark" : ""}`,
              tabIndex: u ? 0 : -1,
              "aria-label": `Konzept ${S} öffnen. ${we(n, t)}`,
              onClick: () => k(n, t),
              onFocus: T,
              onKeyDown: $,
              "data-card": !0,
              children: N
                ? s.jsx("div", {
                    className: `logo-svg${y ? " is-fresh" : ""}`,
                    role: "img",
                    "aria-label": we(n, t),
                    dangerouslySetInnerHTML: { __html: N },
                    style: y ? { animationDelay: `${(O % z) * 40}ms` } : void 0,
                  })
                : s.jsx("div", { className: "logo-svg", "aria-hidden": "true" }),
            }),
        a &&
          s.jsx("span", { className: "chip-tag example-tag", "aria-hidden": "true", children: a }),
        d && s.jsx("span", { className: "chip-tag example-tag sig-note", children: d }),
        s.jsxs("div", {
          className: "card-actions",
          children: [
            m &&
              s.jsx("button", {
                type: "button",
                className: "btn card-similar",
                tabIndex: u ? 0 : -1,
                onClick: () => m(n, t),
                "aria-label": `Ähnliche wie Konzept ${S}`,
                children: "Ähnliche",
              }),
            s.jsx("button", {
              type: "button",
              className: "icon-btn heart-btn",
              "aria-pressed": o,
              tabIndex: u ? 0 : -1,
              "aria-label": o ? `Konzept ${S} gemerkt` : `Konzept ${S} merken`,
              title: o ? "Gemerkt" : "Merken",
              onClick: () => C(n, t),
              children: s.jsx(pn, { on: o }),
            }),
          ],
        }),
      ],
    });
  }),
  Z = "nur-schrift",
  dt = [
    { value: Z, label: "Nur Schrift" },
    ...[...xn, ...kn].map((e) => ({ value: e, label: $e[e] })),
  ];
function ne({ label: e, options: n, values: t, onToggle: r }) {
  return s.jsx("div", {
    className: "chips",
    role: "group",
    "aria-label": e,
    children: n.map((i) =>
      s.jsx(
        "button",
        {
          type: "button",
          className: "chip",
          "aria-pressed": t.includes(i.value),
          "aria-label": i.aria,
          onClick: () => r(i.value),
          children: i.label,
        },
        i.value,
      ),
    ),
  });
}
function ut({ open: e, project: n, formats: t, onClose: r, onApply: i }) {
  var C;
  const o = Ke(n),
    u = (m, T) => (m.includes(T) ? m.filter(($) => $ !== T) : [...m, T]),
    a = (m) => i({ ...o, ...m }),
    d = [...o.themes, ...(o.wordmarkOnly ? [Z] : [])],
    [l, c] = f.useState(null),
    k = Te();
  return s.jsxs(Ce, {
    open: e,
    onClose: r,
    title: "Filter",
    size: "mid",
    className: "filter-dialog",
    footer: s.jsxs(s.Fragment, {
      children: [
        s.jsx(W, {
          onClick: () =>
            i({ styles: [], colorMoods: [], themes: [], wordmarkOnly: !1, nameFormats: [] }),
          children: "Alle zurücksetzen",
        }),
        s.jsx(pe, { onClick: r, children: "Fertig" }),
      ],
    }),
    children: [
      s.jsx(H, {
        id: "stil",
        open: l,
        onOpen: c,
        title: `Stil${o.styles.length ? ` (${o.styles.length})` : ""}`,
        children: s.jsx(ne, {
          label: "Stil",
          options: Fe.map((m) => ({ value: m.key, label: m.title })),
          values: o.styles,
          onToggle: (m) => a({ styles: u(o.styles, m) }),
        }),
      }),
      s.jsx(H, {
        id: "farbe",
        open: l,
        onOpen: c,
        title: `Farbe${o.colorMoods.length ? ` (${o.colorMoods.length})` : ""}`,
        children: s.jsx(ne, {
          label: "Farbe",
          options: fn.map((m) => ({
            value: m,
            aria: te[m].label,
            label: s.jsxs(s.Fragment, {
              children: [
                s.jsx("span", {
                  className: "swatches",
                  "aria-hidden": "true",
                  children: s.jsx("i", { style: { background: te[m].swatch } }),
                }),
                te[m].label,
              ],
            }),
          })),
          values: o.colorMoods,
          onToggle: (m) => a({ colorMoods: u(o.colorMoods, m) }),
        }),
      }),
      s.jsx(H, {
        id: "symbol",
        open: l,
        onOpen: c,
        title: `Symbol${d.length ? ` (${d.length})` : ""}`,
        children: s.jsx(ne, {
          label: "Symbol",
          options: dt,
          values: d,
          onToggle: (m) =>
            a(m === Z ? { wordmarkOnly: !o.wordmarkOnly } : { themes: u(o.themes, m) }),
        }),
      }),
      t.length > 1 &&
        s.jsx(H, {
          id: "namensform",
          open: l,
          onOpen: c,
          title: `Namensform${(C = o.nameFormats) != null && C.length ? ` (${o.nameFormats.length})` : ""}`,
          children: s.jsx(ne, {
            label: "Namensform",
            options: t.map((m) => ({ value: m, label: Ae[m] })),
            values: o.nameFormats ?? [],
            onToggle: (m) => a({ nameFormats: u(o.nameFormats ?? [], m) }),
          }),
        }),
      s.jsx(H, {
        id: "ki",
        open: l,
        onOpen: c,
        title: `KI-Funktionen${k.kiFunktionen ? " (an)" : ""}`,
        children: s.jsx(bn, {}),
      }),
      k.intern &&
        s.jsx(H, {
          id: "intern",
          open: l,
          onOpen: c,
          title: "Intern",
          children: s.jsx(en, {
            checked: k.signatureEntwuerfe,
            onChange: (m) => yn({ signatureEntwuerfe: m }),
            children: "Signature-Entwürfe zeigen (intern)",
          }),
        }),
    ],
  });
}
function H({ id: e, title: n, open: t, onOpen: r, children: i }) {
  const o = t === e;
  return s.jsxs("details", {
    className: "disclosure filter-group",
    open: o,
    onToggle: (u) => {
      const a = u.currentTarget.open;
      a !== o && r(a ? e : null);
    },
    children: [
      s.jsx("summary", { children: n }),
      o && s.jsx("div", { className: "disclosure-body", children: i }),
    ],
  });
}
function Ke(e) {
  return {
    styles: e.input.styles,
    colorMoods: e.input.colorMoods,
    themes: e.input.themes,
    wordmarkOnly: e.wordmarkOnly,
    nameFormats: e.nameFormats,
  };
}
function ht(e) {
  const n = [],
    t = (i, o) => (i.length === 1 ? o(i[0]) : `${i.length} gewählt`);
  (e.input.styles.length &&
    n.push({
      key: "stil",
      label: `Stil: ${t(e.input.styles, (i) => {
        var o;
        return ((o = Fe.find((u) => u.key === i)) == null ? void 0 : o.title) ?? i;
      })}`,
      clear: { styles: [] },
    }),
    e.input.colorMoods.length &&
      n.push({
        key: "farbe",
        label: `Farbe: ${t(e.input.colorMoods, (i) => {
          var o;
          return ((o = te[i]) == null ? void 0 : o.label) ?? i;
        })}`,
        clear: { colorMoods: [] },
      }));
  const r = [...e.input.themes, ...(e.wordmarkOnly ? [Z] : [])];
  return (
    r.length &&
      n.push({
        key: "symbol",
        label: `Symbol: ${t(r, (i) => (i === Z ? "Nur Schrift" : ($e[i] ?? i)))}`,
        clear: { themes: [], wordmarkOnly: !1 },
      }),
    e.nameFormats.length &&
      n.push({
        key: "form",
        label: `Namensform: ${t(e.nameFormats, (i) => Ae[i] ?? i)}`,
        clear: { nameFormats: [] },
      }),
    n
  );
}
function kt({ projectId: e, gemerkt: n }) {
  const { state: t, update: r, navigate: i, announce: o, requestPersist: u } = Se(),
    a = t.projects[e],
    d = a.input,
    l = Math.max(1, Math.round(a.ui.galleryCount / z)),
    c = ct(),
    [k, C] = f.useState(!1),
    [m, T] = f.useState([]),
    [$, O] = f.useState(0),
    [F, I] = f.useState(0),
    M = f.useRef(null),
    B = f.useRef(0),
    _ = f.useRef(0),
    N = a.wordmarkOnly && d.themes.length > 0,
    w = a.nameFormats,
    y =
      a.pinned &&
      !a.wordmarkOnly &&
      !d.themes.length &&
      !d.colorMoods.length &&
      (!w.length || w.includes(me(a.pinned)))
        ? a.pinned
        : null,
    A = Te(),
    S = A.intern && A.signatureEntwuerfe,
    j = ot(d, a.seed, N ? 0 : l, a.wordmarkOnly, w, y, F, S),
    g = lt(A.kiFunktionen && !n && !N, d, N ? [] : j.list, j.pools, !j.loading, M),
    p = N ? [] : g.list,
    R = j.error,
    K = j.loading && !p.length,
    P = f.useMemo(() => {
      try {
        const h = new Set();
        for (const x of ge(d, a.seed, 0, a.wordmarkOnly, [])) h.add(me(x));
        return at.filter((x) => h.has(x));
      } catch {
        return [];
      }
    }, [d.name, d.suffix, d.place, d.styles, d.colorMoods, d.themes, a.seed, a.wordmarkOnly]),
    G = f.useRef(p.length);
  f.useEffect(() => {
    (p.length > G.current && o(`${p.length - G.current} neue Vorschläge geladen.`),
      (G.current = p.length));
  }, [p.length, o]);
  const re = f.useRef(new Set()),
    De = f.useCallback((h) => {
      h >= z ||
        re.current.size >= z ||
        (re.current.add(h), re.current.size === z && Me("gallery:first12", "style:tap"));
    }, []),
    q = f.useCallback(
      (h, x) => {
        const v = Q(a, h.id);
        (r(e, (b) => Xe(b, h, x)), v || (o(`Konzept ${x} gemerkt.`), u()));
      },
      [a, e, r, o, u],
    ),
    oe = f.useCallback(
      (h, x) => {
        (r(e, (v) => ({ ...Ye(v, h, x), ui: { ...v.ui, lastConceptIndex: x - 1 } })),
          i({ name: "logo", id: e, conceptId: h.id, tab: a.ui.editorTab ?? "symbol" }));
      },
      [e, r, i, a.ui.editorTab],
    ),
    ye = f.useCallback(
      (h, x) => {
        const v = nn(h, d, 6),
          b = Math.max(
            p.length,
            ...Object.values(a.numbers),
            ...m.flatMap((L) => L.items.map((V) => V.no)),
          ),
          D = v.map((L, V) => ({ concept: L, no: b + V + 1 }));
        B.current += 1;
        const E = { sourceId: h.id, sourceNo: x, items: D, key: B.current };
        ((_.current = E.key), T((L) => [E, ...L]), o("6 ähnliche Logos eingefügt."));
      },
      [d, p.length, a.numbers, m, o],
    ),
    Pe = () =>
      r(
        e,
        (h) => ({
          ...h,
          ui: { ...h.ui, galleryCount: (Math.max(1, Math.round(h.ui.galleryCount / z)) + 1) * z },
        }),
        !1,
      ),
    U = n ? null : p,
    Ve = (h) => {
      var v;
      const x =
        (v = M.current) == null ? void 0 : v.querySelector(`[data-index="${h}"] [data-card]`);
      x == null || x.focus();
    },
    Ge = (h, x, v) => (b) => {
      const D = U ?? [];
      let E = h;
      if (b.key === "ArrowRight") E = h + 1;
      else if (b.key === "ArrowLeft") E = h - 1;
      else if (b.key === "ArrowDown") E = h + c;
      else if (b.key === "ArrowUp") E = h - c;
      else if (b.key === "Home") E = 0;
      else if (b.key === "End") E = D.length - 1;
      else if (b.key === "m" || b.key === "M") {
        (b.preventDefault(), q(x, v));
        return;
      } else if ((b.key === "v" || b.key === "V") && !n) {
        (b.preventDefault(), ye(x, v));
        return;
      } else return;
      (b.preventDefault(), (E = Math.max(0, Math.min(D.length - 1, E))), O(E), Ve(E));
    },
    xe = (h) => h % 5 === 1 || h % 5 === 3,
    X = f.useMemo(() => {
      const h = [];
      a.selected &&
        !a.favorites.some((x) => {
          var v;
          return x.id === ((v = a.selected) == null ? void 0 : v.id);
        }) &&
        h.push({ concept: a.selected, no: a.numbers[a.selected.id] ?? 0, tag: "DEIN LOGO" });
      for (const x of a.favorites) h.push({ concept: x, no: a.numbers[x.id] ?? 0 });
      return h;
    }, [a.favorites, a.selected, a.numbers]),
    ke = (h) => i({ name: "auswahl", id: e, gemerkt: h }, { replace: !0 }),
    He = () => {
      if (!U) return null;
      const h = new Map();
      for (const v of m) {
        const b = U.findIndex((E) => E.id === v.sourceId);
        if (b < 0) continue;
        const D = Math.min(U.length - 1, Math.floor(b / c) * c + c - 1);
        h.set(D, [...(h.get(D) ?? []), v]);
      }
      const x = [];
      return (
        U.forEach((v, b) => {
          x.push(
            s.jsx(
              ue,
              {
                index: b,
                concept: v,
                no: b + 1,
                input: d,
                dark: xe(b),
                fav: Q(a, v.id),
                focusable: b === $,
                note: A.intern && v.signature ? `Vorlage ${v.signature.id}` : void 0,
                reason: g.reasons.get(v.id),
                aiIn: g.aiIds.has(v.id),
                onOpen: oe,
                onFav: q,
                onSimilar: ye,
                onFocusCard: () => O(b),
                onReady: De,
                onKeyDown: Ge(b, v, b + 1),
              },
              v.id + b,
            ),
          );
          const D = h.get(b);
          if (D)
            for (const E of D)
              x.push(
                s.jsxs(
                  "section",
                  {
                    className: "similar-block",
                    "aria-labelledby": `similar-${E.key}`,
                    children: [
                      s.jsxs("div", {
                        className: "head",
                        children: [
                          s.jsxs("h2", {
                            className: "h2",
                            id: `similar-${E.key}`,
                            tabIndex: -1,
                            ref: (L) => {
                              L &&
                                _.current === E.key &&
                                ((_.current = 0),
                                L.focus({ preventScroll: !0 }),
                                L.scrollIntoView({ block: "start", behavior: "auto" }));
                            },
                            children: ["Ähnlich wie Konzept ", je(E.sourceNo)],
                          }),
                          s.jsxs(W, {
                            onClick: () => T((L) => L.filter((V) => V.key !== E.key)),
                            children: [
                              s.jsx("span", {
                                className: "glyph",
                                "aria-hidden": "true",
                                children: "×",
                              }),
                              " ",
                              "Schließen",
                            ],
                          }),
                        ],
                      }),
                      s.jsx("div", {
                        className: "similar-grid",
                        children: E.items.map((L, V) =>
                          s.jsx(
                            ue,
                            {
                              index: V,
                              concept: L.concept,
                              no: L.no,
                              input: d,
                              dark: xe(V),
                              fav: Q(a, L.concept.id),
                              focusable: !0,
                              onOpen: oe,
                              onFav: q,
                            },
                            L.concept.id,
                          ),
                        ),
                      }),
                    ],
                  },
                  `s${E.key}`,
                ),
              );
        }),
        x
      );
    },
    Y = ht(a),
    ie = (h) => {
      (r(e, (x) => Qe(x, h)), T([]));
    };
  return s.jsxs("div", {
    className: "container screen gallery-screen",
    children: [
      s.jsxs("div", {
        className: "gallery-head",
        children: [
          s.jsx("h1", {
            className: "h1",
            "data-title": "Auswahl",
            children: n ? "Gemerkte Logos" : "Deine Logos",
          }),
          s.jsxs("div", {
            className: "gallery-tools",
            children: [
              !n &&
                s.jsxs(W, {
                  onClick: () => C(!0),
                  "aria-haspopup": "dialog",
                  className: "filter-btn",
                  children: ["Filter", Y.length ? ` (${Y.length})` : ""],
                }),
              (n || X.length > 0) &&
                s.jsx(W, {
                  onClick: () => ke(!n),
                  "aria-pressed": n,
                  children: n ? "Alle Vorschläge" : `Gemerkt (${X.length})`,
                }),
            ],
          }),
        ],
      }),
      !n &&
        Y.length > 0 &&
        s.jsx("div", {
          className: "chips active-filters",
          role: "group",
          "aria-label": "Gesetzte Filter",
          children: Y.slice(0, 4).map((h) =>
            s.jsxs(
              "button",
              {
                type: "button",
                className: "chip",
                onClick: () => ie({ ...Ke(a), ...h.clear }),
                "aria-label": `${h.label} entfernen`,
                children: [
                  h.label,
                  s.jsx("svg", {
                    width: "14",
                    height: "14",
                    viewBox: "0 0 18 18",
                    "aria-hidden": "true",
                    focusable: "false",
                    className: "chip-x",
                    children: s.jsx("path", {
                      d: "M4 4 14 14M14 4 4 14",
                      stroke: "currentColor",
                      strokeWidth: "1.6",
                      strokeLinecap: "round",
                    }),
                  }),
                ],
              },
              h.key,
            ),
          ),
        }),
      n
        ? X.length
          ? s.jsx("div", {
              className: "gallery-grid",
              children: X.map((h, x) =>
                s.jsx(
                  ue,
                  {
                    index: x,
                    concept: h.concept,
                    no: h.no,
                    input: d,
                    dark: !1,
                    fav: Q(a, h.concept.id) || !!h.tag,
                    focusable: !0,
                    tag: h.tag,
                    onOpen: (v, b) => {
                      if (h.tag && a.editing && a.selectedBaseId) {
                        i({
                          name: "logo",
                          id: e,
                          conceptId: a.selectedBaseId,
                          tab: a.ui.editorTab,
                        });
                        return;
                      }
                      oe(v, b);
                    },
                    onFav: (v, b) => (h.tag ? void 0 : q(v, b)),
                  },
                  h.concept.id,
                ),
              ),
            })
          : s.jsxs("div", {
              className: "empty-state",
              children: [
                s.jsx("h2", { className: "h2", children: "Noch nichts gemerkt." }),
                s.jsx("p", {
                  children:
                    "Tippe bei einem Logo auf das Herz. So findest du deine Favoriten hier wieder.",
                }),
                s.jsx(J, { onClick: () => ke(!1), children: "Alle Vorschläge ansehen" }),
              ],
            })
        : R
          ? s.jsxs("div", {
              className: "empty-state",
              role: "alert",
              children: [
                s.jsx("p", {
                  children:
                    "Die Vorschläge konnten nicht geladen werden. Prüf deine Verbindung und versuch es noch einmal.",
                }),
                s.jsx(J, { onClick: () => I((h) => h + 1), children: "Erneut versuchen" }),
              ],
            })
          : K
            ? s.jsx("div", {
                className: "gallery-grid",
                "aria-busy": "true",
                "aria-label": "Logo-Vorschläge werden entworfen",
                children: Array.from({ length: z }, (h, x) =>
                  s.jsx(
                    "div",
                    { className: "logo-card riffel skeleton-card", "aria-hidden": "true" },
                    x,
                  ),
                ),
              })
            : N || !p.length
              ? s.jsxs("div", {
                  className: "empty-state",
                  children: [
                    s.jsx("p", {
                      children:
                        "Zu dieser Kombination finden wir keine Logos. Lockere einen Filter.",
                    }),
                    s.jsx(J, {
                      onClick: () =>
                        ie({
                          styles: a.input.styles,
                          colorMoods: [],
                          themes: [],
                          wordmarkOnly: !1,
                          nameFormats: [],
                        }),
                      children: "Filter zurücksetzen",
                    }),
                  ],
                })
              : s.jsxs(s.Fragment, {
                  children: [
                    g.pending > 0 &&
                      s.jsxs("div", {
                        className: "ai-ready row",
                        role: "status",
                        children: [
                          s.jsx("span", { className: "small", children: "KI-Vorauswahl bereit." }),
                          s.jsx(W, { onClick: g.showAll, children: "Anzeigen" }),
                        ],
                      }),
                    g.unavailable &&
                      s.jsx("p", {
                        className: "small muted ai-off",
                        role: "status",
                        children: "KI-Vorauswahl gerade nicht verfügbar.",
                      }),
                    s.jsx("div", {
                      ref: M,
                      className: "gallery-grid",
                      "aria-busy": j.loading,
                      "aria-label": "Logo-Vorschläge",
                      role: "region",
                      children: He(),
                    }),
                    s.jsx("div", {
                      className: "gallery-more",
                      children: s.jsx(pe, {
                        onClick: Pe,
                        "aria-disabled": j.loading,
                        children: j.loading ? "Wird entworfen ..." : "6 weitere Vorschläge",
                      }),
                    }),
                  ],
                }),
      !n && !a.fromFinder && s.jsx(tt, { project: a }),
      s.jsx(ut, { open: k, project: a, formats: P, onClose: () => C(!1), onApply: ie }),
    ],
  });
}
export { kt as default };
