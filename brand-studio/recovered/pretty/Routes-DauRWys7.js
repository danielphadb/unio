import {
  u as ne,
  r as v,
  al as ie,
  am as ae,
  a9 as z,
  j as e,
  T as G,
  D as re,
  G as le,
  P as Z,
  aa as W,
  a as q,
  a1 as ce,
} from "./index-BER2gtDe.js";
import { C as $ } from "./svg-CrwnZnJY.js";
import { B as oe, m as de, c as me, u as ue, b as he, f as fe } from "./kitAssets-CN7deWlx.js";
import { u as ge, K as xe, W as ke, H as je, N as pe } from "./NameCard-BpHDImep.js";
import { L as Y } from "./LogoView-CG3DXWdO.js";
import { h as Q } from "./engine-BhDRZEfO.js";
import { s as Ne, d as ee, i as ye } from "./nameFinder-CLppxXuz.js";
import {
  t as ve,
  r as Se,
  a as Ie,
  s as Te,
  c as J,
  f as be,
  d as we,
} from "./kompass-bTkyDSpk.js";
import { w as R, g as Ee, t as A, h as se } from "./texts-B92agAAM.js";
import "./imagesize-BHC6N02v.js";
import "./energy-DRQ_36b-.js";
const Re = "/api/brand-strategie",
  Ke = 55e3,
  De = [
    /[^\s@]+@[^\s@]+\.[^\s@]+/,
    /(?:\+|\b00|\b0)\d[\d\s/().-]{5,}\d/,
    /https?:\/\/|www\.|\.(?:at|de|com|net|org|ch|eu)\b/i,
  ],
  L = (s, t) => {
    const n = (s ?? "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim()
      .slice(0, t);
    return n && !De.some((c) => c.test(n)) ? n : void 0;
  };
function Me(s, t) {
  var S, b, j, I, w, p;
  if (!Array.isArray(t) || t.length !== 3) return null;
  const n = {},
    c = L((s.hasName ? s.name : void 0) ?? s.person ?? s.name, 60);
  c && (n.name = c);
  const a = L(s.place, 60);
  (a && (n.ort = a),
    s.architecture && (n.architektur = s.architecture),
    s.erfahrung && (n.erfahrung = s.erfahrung));
  for (const [d, m] of [
    ["wunschkunde", s.wunschkunde],
    ["werte", s.werte],
    ["wirkung", s.wirkung],
    ["fremdbild", s.fremdbild],
  ])
    m != null && m.length && (n[d] = [...new Set(m)].slice(0, 2));
  (s.segment && (n.segment = s.segment),
    typeof s.side == "number" &&
      Number.isInteger(s.side) &&
      Math.abs(s.side) <= 2 &&
      (n.seite = s.side),
    (S = s.focus) != null && S.length && (n.fokus = [...new Set(s.focus)].slice(0, 7)),
    s.alternative && (n.alternative = s.alternative),
    (b = s.onlyness) != null && b.length && (n.onlyness = [...new Set(s.onlyness)].slice(0, 2)));
  const u = L(s.onlynessText, 300);
  u && (n.onlynessText = u);
  const x = L(s.proof, 300);
  (x && (n.beleg = x),
    s.voice && Object.keys(s.voice).length && (n.stimme = { ...s.voice }),
    s.reference && (n.referenz = s.reference));
  const o = s.social;
  if (
    o &&
    (((j = o.channels) != null && j.length) || o.camera || ((I = o.never) != null && I.length))
  ) {
    const d = {};
    ((w = o.channels) != null && w.length && (d.kanaele = [...new Set(o.channels)].slice(0, 6)),
      o.camera && (d.kamera = o.camera),
      (p = o.never) != null && p.length && (d.nie = [...new Set(o.never)].slice(0, 5)),
      (n.social = d));
  }
  const h = (d, m, r) => d.map((g) => g.slice(0, r)).slice(0, m);
  return {
    brief: n,
    routen: t.map((d) => {
      var r;
      const m = ve(d.territory);
      return {
        id: d.id,
        art: d.art,
        territorium: d.territory.slice(0, 40),
        titel: d.titel.slice(0, 60),
        kernidee: d.texte.kernidee.slice(0, 300),
        schluesselwoerter: h(d.texte.schluesselwoerter, 5, 40),
        ...(m
          ? {
              gegenbild: {
                markt: m.gegenbild.markt.slice(0, 300),
                wir: m.gegenbild.wir.slice(0, 300),
              },
              verbote: h(m.verbote, 8, 120),
            }
          : { verbote: [] }),
        leitplanken: h(d.texte.leitplanken, 10, 200),
        sagen: h(d.texte.sagen, 6, 120),
        vermeiden: h(d.texte.vermeiden, 6, 120),
        saeulen: h(
          (((r = d.texte.socialKit) == null ? void 0 : r.saeulen) ?? []).map((g) => g.titel),
          3,
          60,
        ),
      };
    }),
  };
}
function Ce(s, t) {
  const n = new Set(t.match(/\d+/g) ?? []);
  return (s.match(/\d+/g) ?? []).every((c) => n.has(c));
}
const K = (s, t) => !!s && !se(s) && Ce(s, t);
function Oe(s, t) {
  if (!s || typeof s != "object") return {};
  const n = s,
    c = t.proof ?? "",
    a = {},
    u = (m) => (typeof n[m] == "string" ? A(n[m]) : ""),
    x = u("kernidee");
  K(x, c) && R(x) <= 30 && (a.kernidee = x);
  const o = u("onlyness");
  K(o, c) && R(o) <= 40 && (a.onlyness = o);
  const h = u("positionierung");
  K(h, c) &&
    R(h) <= 70 &&
    /^Für\b/.test(h) &&
    /Anders als/i.test(h) &&
    /\bWeil\b/.test(h) &&
    (a.positionierung = h);
  const S = u("claim").replace(/\.$/, "");
  Ee(S) && (a.claim = S);
  const b = u("storyKurz");
  K(b, c) && R(b) <= 35 && (a.storyKurz = b);
  const j = u("storyMittel");
  K(j, c) && R(j) >= 70 && R(j) <= 100 && (a.storyMittel = j);
  const I = Array.isArray(n.tonBeispiele)
    ? n.tonBeispiele
        .filter((m) => typeof m == "string")
        .map(A)
        .filter((m) => K(m, c) && R(m) <= 40)
    : [];
  I.length >= 2 && (a.tonBeispiele = I.slice(0, 2));
  const w = u("wunschkunde");
  K(w, c) && R(w) <= 35 && (a.wunschkunde = w);
  const p = u("versprechen");
  if (
    (K(p, c) &&
      R(p) <= 25 &&
      /\b(Sie|Ihr|Ihre|Ihren|Ihrem|Ihres|Ihrer)\b/.test(p) &&
      (a.versprechen = p),
    Array.isArray(n.persoenlichkeit))
  ) {
    const m = n.persoenlichkeit
      .map((r) => ({
        eigenschaft:
          typeof (r == null ? void 0 : r.eigenschaft) == "string" ? A(r.eigenschaft) : "",
        satz: typeof (r == null ? void 0 : r.satz) == "string" ? A(r.satz) : "",
      }))
      .filter(
        (r) =>
          r.eigenschaft &&
          R(r.eigenschaft) <= 3 &&
          K(r.eigenschaft, c) &&
          K(r.satz, c) &&
          R(r.satz) <= 20,
      );
    m.length >= 3 &&
      new Set(m.slice(0, 3).map((r) => r.eigenschaft)).size === 3 &&
      (a.persoenlichkeit = m.slice(0, 3));
  }
  const d = n.socialKit;
  if (d && Array.isArray(d.saeulen) && d.saeulen.length === 3 && typeof d.profiltext == "string") {
    const m = d.saeulen.map((g) => ({
        titel: typeof (g == null ? void 0 : g.titel) == "string" ? A(g.titel).slice(0, 60) : "",
        hooks: (Array.isArray(g == null ? void 0 : g.hooks) ? g.hooks : [])
          .filter((T) => typeof T == "string")
          .map(A)
          .filter((T) => K(T, c) && R(T) <= 25)
          .slice(0, 5),
      })),
      r = A(d.profiltext);
    m.every((g) => g.titel && !se(g.titel) && g.hooks.length >= 4) &&
      K(r, c) &&
      r.length <= 150 &&
      (a.socialKit = { saeulen: m, profiltext: r });
  }
  return a;
}
function Ae(s, t, n) {
  if (!t || typeof t != "object") return s;
  const c = t;
  return c.ok !== !0 || !Array.isArray(c.routen)
    ? s
    : s.map((a) => {
        const u = c.routen.find((o) => o && o.id === a.id),
          x = Oe(u == null ? void 0 : u.texte, n);
        return Object.keys(x).length ? { ...a, texte: { ...a.texte, ...x, quelle: "ki" } } : a;
      });
}
async function Fe(s, t, n) {
  var h, S, b;
  if (!n || n.einwilligung !== !0) return t;
  const c = Me(s, t);
  if (!c) return t;
  const a = n.fetchImpl ?? (typeof fetch == "function" ? fetch : void 0);
  if (!a || ((h = n.signal) != null && h.aborted)) return t;
  const u = new AbortController(),
    x = () => u.abort();
  (S = n.signal) == null || S.addEventListener("abort", x, { once: !0 });
  const o = setTimeout(x, Math.max(1, n.timeoutMs ?? Ke));
  try {
    const j = await a(n.endpoint ?? Re, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
      signal: u.signal,
      credentials: "same-origin",
    });
    if (!j.ok) return t;
    const I = await j.json();
    return u.signal.aborted ? t : Ae(t, I, s);
  } catch {
    return t;
  } finally {
    (clearTimeout(o), (b = n.signal) == null || b.removeEventListener("abort", x));
  }
}
const X = new Map(),
  Be = "./",
  Le = { sicher: "SICHER", mutig: "MUTIG", ueberraschend: "ÜBERRASCHEND" };
function Ue(s, t) {
  const [n, c] = v.useState(null),
    a = JSON.stringify(t);
  return (
    v.useEffect(() => {
      let u = !0;
      const x = window.setTimeout(() => {
        try {
          const o = s();
          u && c({ key: a, value: o });
        } catch (o) {
          console.warn("Routen-Vorschau fehlgeschlagen", o);
        }
      }, 0);
      return () => {
        ((u = !1), clearTimeout(x));
      };
    }, [a]),
    n && n.key === a ? n.value : null
  );
}
const ze = v.memo(function ({ concept: t, input: n, label: c }) {
  const a = Q(t);
  return e.jsx("div", {
    className: "rt-logo",
    style: { background: a.background },
    children: e.jsx(Y, {
      concept: t,
      input: n,
      variant: a.variant,
      ground: a.ground,
      label: c,
      fallbackText: !0,
    }),
  });
});
function U({ title: s, children: t }) {
  return e.jsxs("section", {
    className: "rt-group",
    children: [e.jsx("h3", { className: "rt-group-title", children: s }), t],
  });
}
function D({ title: s, children: t }) {
  return e.jsxs("div", {
    className: "rt-sec",
    children: [e.jsx("h3", { className: "label rt-sec-title", children: s }), t],
  });
}
function H({ id: s, concept: t, input: n, label: c }) {
  const a = oe(s),
    u = v.useMemo(() => de(t, n, ce()), [t, n]),
    x = me(t, n),
    o = ue(!0),
    h = he(a, u, x && o.ready);
  return e.jsxs("figure", {
    className: "rt-ex",
    children: [
      e.jsx("div", {
        className: "rt-ex-img",
        children: h.svg
          ? e.jsx("div", {
              className: "mock-svg",
              role: "img",
              "aria-label": c,
              dangerouslySetInnerHTML: { __html: fe(h.svg) },
            })
          : e.jsx("div", { className: "riffel skeleton" }),
      }),
      e.jsx("figcaption", { className: "small", children: c }),
    ],
  });
}
function $e({ concept: s, input: t }) {
  const n = Q({ ...s, cardBackground: "paper" });
  return e.jsxs("div", {
    className: "rt-examples",
    children: [
      e.jsx(H, { id: "unio-sign", concept: s, input: t, label: "Schild „Zu verkaufen“" }),
      e.jsx(H, { id: "unio-social-intro", concept: s, input: t, label: "Instagram-Kachel" }),
      e.jsx(H, { id: "unio-business-card", concept: s, input: t, label: "Visitenkarte" }),
      e.jsxs("figure", {
        className: "rt-ex",
        children: [
          e.jsxs("div", {
            className: "rt-ex-img rt-lockup",
            style: { background: n.background },
            children: [
              e.jsx(Y, {
                concept: s,
                input: t,
                variant: "color",
                label: `${t.name} mit UNIO`,
                fallbackText: !0,
              }),
              e.jsx("span", { className: "rt-lockup-rule", "aria-hidden": "true" }),
              e.jsx("img", { src: `${Be}unio-logo-black.svg`, alt: "", width: 72, height: 18 }),
            ],
          }),
          e.jsx("figcaption", { className: "small", children: "Mit UNIO" }),
        ],
      }),
    ],
  });
}
function He({ concept: s, input: t }) {
  const [n, c] = v.useState(!1);
  return e.jsxs("details", {
    className: "disclosure rt-fold",
    onToggle: (a) => c(a.currentTarget.open),
    children: [
      e.jsx("summary", { children: "Beispiele: Schild, Instagram, Visitenkarte" }),
      n &&
        e.jsx("div", {
          className: "disclosure-body",
          children: s
            ? e.jsx($e, { concept: s, input: t })
            : e.jsx("p", { className: "small", children: "Die Logos werden noch entworfen." }),
        }),
    ],
  });
}
function Ge({
  route: s,
  texte: t,
  brief: n,
  gemerkt: c,
  mutiger: a,
  onSave: u,
  onShift: x,
  onDeepen: o,
  onName: h,
  savedNames: S,
  onSaveName: b,
  show: j,
}) {
  var k, f, y, P, _, V;
  const I = !!(n.hasName && (k = n.name) != null && k.trim()),
    w = s.params.styles.slice(0, 2),
    p = typeof matchMedia < "u" && matchMedia("(min-width: 760px)").matches,
    [d, m] = v.useState(() => new Set()),
    r = (j == null ? void 0 : j.names) ?? null,
    g = v.useMemo(() => {
      var l;
      return we(
        {
          name: ((l = n.name) == null ? void 0 : l.trim()) || "Dein Name",
          suffix: "",
          styles: [],
          colorMoods: [],
          themes: [],
        },
        s,
      );
    }, [n.name, s]),
    T = (j == null ? void 0 : j.logos) ?? null,
    M = I ? ((T == null ? void 0 : T[0]) ?? null) : ((r == null ? void 0 : r.concepts[0]) ?? null),
    N = I
      ? g
      : r != null && r.items[0]
        ? {
            name: r.items[0].name,
            suffix: r.items[0].suffix ?? "",
            styles: w,
            colorMoods: [],
            themes: [],
            nameKind: ee(r.items[0].kind),
          }
        : g,
    C = s.params.colorMoods.slice(0, 3),
    O = M == null ? void 0 : M.palette,
    F = M ? q(M.name.font.key).family : null,
    B = M ? q(M.body.key).family : null,
    i = `rt-${s.id}`;
  return e.jsxs("article", {
    className: "rt-card",
    "aria-labelledby": i,
    "data-route": s.id,
    "data-territory": s.territory,
    children: [
      e.jsxs("div", {
        className: "rt-head",
        children: [
          e.jsxs("p", {
            className: "label rt-art",
            children: [
              "RICHTUNG ",
              s.id,
              " · ",
              Le[s.art],
              t.quelle === "ki" ? " · TEXT VON DER KI" : "",
            ],
          }),
          e.jsx("button", {
            type: "button",
            className: "icon-btn heart-btn",
            "aria-pressed": c,
            "aria-label": c ? `Richtung ${s.titel} gemerkt` : `Richtung ${s.titel} merken`,
            title: c ? "Gemerkt" : "Merken",
            onClick: u,
            children: e.jsx(je, { on: c }),
          }),
        ],
      }),
      e.jsx("h2", { className: "h2 rt-title", id: i, children: s.titel }),
      e.jsx("p", { className: "rt-idea", children: t.kernidee }),
      t.schluesselwoerter.length > 0 &&
        e.jsx("ul", {
          className: "rt-keys",
          "aria-label": "Schlüsselwörter",
          children: t.schluesselwoerter.slice(0, 3).map((l) => e.jsx("li", { children: l }, l)),
        }),
      t.warum &&
        e.jsxs("p", {
          className: "small rt-why",
          children: [
            e.jsx("span", { className: "label", children: "WARUM DIESE RICHTUNG " }),
            t.warum,
          ],
        }),
      e.jsxs(U, {
        title: "Wofür du stehst",
        children: [
          t.versprechen &&
            e.jsx(D, {
              title: "DEIN VERSPRECHEN",
              children: e.jsx("p", { className: "rt-promise", children: t.versprechen }),
            }),
          t.positionierung &&
            e.jsx(D, {
              title: "POSITIONIERUNG",
              children: e.jsx("p", { children: t.positionierung }),
            }),
          t.wunschkunde &&
            e.jsx(D, {
              title: "DEIN WUNSCHKUNDE",
              children: e.jsx("p", { children: t.wunschkunde }),
            }),
          !!((f = t.persoenlichkeit) != null && f.length) &&
            e.jsx(D, {
              title: "PERSÖNLICHKEIT",
              children: e.jsx("ul", {
                className: "rt-traits",
                children: t.persoenlichkeit
                  .slice(0, 3)
                  .map((l) =>
                    e.jsxs(
                      "li",
                      {
                        children: [
                          e.jsx("strong", { children: l.eigenschaft }),
                          " ",
                          e.jsx("span", { className: "small", children: l.satz }),
                        ],
                      },
                      l.eigenschaft,
                    ),
                  ),
              }),
            }),
          t.tonBeispiele.length > 0 &&
            e.jsx(D, {
              title: "SO KLINGST DU",
              children: t.tonBeispiele
                .slice(0, 2)
                .map((l) => e.jsxs("p", { className: "rt-quote", children: ["„", l, "“"] }, l)),
            }),
        ],
      }),
      (!!((y = t.socialKit) != null && y.saeulen.length) ||
        !!((P = t.formate) != null && P.length)) &&
        e.jsxs(U, {
          title: "Worüber du postest",
          children: [
            !!((_ = t.socialKit) != null && _.saeulen.length) &&
              e.jsx(D, {
                title: "DREI THEMEN FÜR DEINE INHALTE",
                children: e.jsx("ol", {
                  className: "rt-pillars",
                  children: t.socialKit.saeulen
                    .slice(0, 3)
                    .map((l) =>
                      e.jsxs(
                        "li",
                        {
                          children: [
                            e.jsx("strong", { children: l.titel }),
                            l.hooks
                              .slice(0, 2)
                              .map((E) =>
                                e.jsxs(
                                  "span",
                                  { className: "small rt-hook", children: ["„", E, "“"] },
                                  E,
                                ),
                              ),
                          ],
                        },
                        l.titel,
                      ),
                    ),
                }),
              }),
            !!((V = t.formate) != null && V.length) &&
              e.jsx(D, {
                title: "FORMATE",
                children: e.jsx("ul", {
                  className: "rt-formats",
                  children: t.formate
                    .slice(0, 3)
                    .map((l) =>
                      e.jsxs(
                        "li",
                        {
                          children: [
                            e.jsx("strong", { children: l.format }),
                            " ",
                            e.jsx("span", {
                              className: "label rt-rhythm",
                              children: l.rhythmus.toLocaleUpperCase("de-AT"),
                            }),
                            e.jsx("span", { className: "small", children: l.satz }),
                          ],
                        },
                        l.format,
                      ),
                    ),
                }),
              }),
          ],
        }),
      e.jsxs(U, {
        title: "Wie du auftrittst",
        children: [
          e.jsx(D, {
            title: I ? "DEIN NAME IN DIESER RICHTUNG" : "NAMEN IN DIESER RICHTUNG",
            children: I
              ? e.jsx("div", {
                  className: "rt-logos",
                  children: T
                    ? T.map((l, E) =>
                        e.jsx(
                          ze,
                          { concept: l, input: g, label: `Logo-Idee ${E + 1} mit ${g.name}` },
                          l.id,
                        ),
                      )
                    : Array.from({ length: 3 }, (l, E) =>
                        e.jsx("div", { className: "rt-logo riffel" }, E),
                      ),
                })
              : e.jsx("div", {
                  className: "wm-grid rt-names",
                  children: r
                    ? r.items
                        .filter((l) => !d.has(l.id))
                        .map((l) =>
                          e.jsx(
                            pe,
                            {
                              s: l,
                              concept: r.concepts[r.items.indexOf(l)] ?? null,
                              styles: w,
                              saved: S.has(l.id),
                              desktop: p,
                              onOpen: (E) => h(E, r.concepts[r.items.indexOf(E)] ?? null),
                              onSave: b,
                              onHide: (E) => m((te) => new Set(te).add(E.id)),
                            },
                            l.id,
                          ),
                        )
                    : Array.from({ length: 4 }, (l, E) =>
                        e.jsx("div", { className: "wm-card riffel rt-skel" }, E),
                      ),
                }),
          }),
          e.jsxs(D, {
            title: "FARBWELT UND SCHRIFT",
            children: [
              e.jsxs("ul", {
                className: "rt-colors",
                children: [
                  C.map((l) =>
                    e.jsxs(
                      "li",
                      {
                        children: [
                          e.jsx("i", { style: { background: $[l].swatch }, "aria-hidden": "true" }),
                          e.jsxs("span", {
                            children: [
                              e.jsx("strong", { children: $[l].label }),
                              " ",
                              e.jsx("span", { className: "small", children: $[l].hint }),
                            ],
                          }),
                        ],
                      },
                      l,
                    ),
                  ),
                  !C.length &&
                    O &&
                    e.jsxs("li", {
                      children: [
                        e.jsx("span", {
                          className: "rt-swatches",
                          "aria-hidden": "true",
                          children: [O.primary, O.secondary, O.accent].map((l) =>
                            e.jsx("i", { style: { background: l } }, l),
                          ),
                        }),
                        e.jsx("span", {
                          className: "small",
                          children: "Farben aus den Logos dieser Richtung",
                        }),
                      ],
                    }),
                ],
              }),
              F &&
                B &&
                e.jsxs("p", {
                  className: "small rt-fonts",
                  children: [
                    "Schriften: ",
                    e.jsx("strong", { children: F }),
                    " für den Namen, ",
                    e.jsx("strong", { children: B }),
                    " für Texte",
                  ],
                }),
            ],
          }),
          e.jsx(He, { concept: M, input: N }),
        ],
      }),
      e.jsxs(U, {
        title: "Story und Leitplanken",
        children: [
          t.storyKurz &&
            e.jsx(D, {
              title: "KURZ-STORY",
              children: e.jsx("p", { className: "rt-story", children: t.storyKurz }),
            }),
          t.leitplanken.length > 0 &&
            e.jsx(D, {
              title: "DAS TUST DU IN DIESER RICHTUNG NIE",
              children: e.jsx("ul", {
                className: "rt-rules",
                children: t.leitplanken.slice(0, 4).map((l) => e.jsx("li", { children: l }, l)),
              }),
            }),
          (t.passtFuer || t.risiko) &&
            e.jsxs("dl", {
              className: "rt-fit",
              children: [
                t.passtFuer &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("dt", { className: "label", children: "PASST FÜR" }),
                      e.jsx("dd", { children: t.passtFuer }),
                    ],
                  }),
                t.risiko &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("dt", { className: "label", children: "RISIKO" }),
                      e.jsx("dd", { children: t.risiko }),
                    ],
                  }),
              ],
            }),
        ],
      }),
      e.jsxs("div", {
        className: "rt-actions",
        children: [
          e.jsx(Z, { onClick: o, children: "Diese Richtung vertiefen" }),
          e.jsxs("div", {
            className: "rt-shift",
            children: [
              e.jsx(G, { onClick: () => x(-1), disabled: a <= -1, children: "Ruhiger" }),
              e.jsx(G, { onClick: () => x(1), disabled: a >= 1, children: "Mutiger" }),
            ],
          }),
        ],
      }),
    ],
  });
}
function ss() {
  const { navigate: s, put: t, announce: n, toast: c } = ne(),
    [a, u] = v.useState(ie),
    x = v.useCallback((i) => {
      u((k) => {
        const f = i(k);
        return (ae(f), f);
      });
    }, []),
    o = a.brief,
    h = v.useMemo(() => Se(a), [a]),
    S = Ue(
      () => Ie(h, o, a.seed),
      [
        h.map((i) => `${i.id}|${i.territory}|${i.params.seed}|${JSON.stringify(i.params.axes)}`),
        o,
        a.seed,
      ],
    ),
    [b, j] = v.useState(0),
    I = v.useMemo(() => new Set(z().saved.map((i) => i.id)), [b]),
    w = ge(),
    p = w.kiFunktionen
      ? JSON.stringify([o, h.map((i) => `${i.id}|${i.territory}|${i.params.seed}`)])
      : null,
    [d, m] = v.useState(null),
    [r, g] = v.useState(!1);
  v.useEffect(() => {
    if (!p) return;
    const i = X.get(p);
    if (i) {
      m({ key: p, routes: i });
      return;
    }
    const k = new AbortController();
    return (
      g(!0),
      Fe(o, h, { einwilligung: !0, signal: k.signal }).then((f) => {
        k.signal.aborted ||
          (X.set(p, f),
          m({ key: p, routes: f }),
          g(!1),
          f.some((y) => y.texte.quelle === "ki") &&
            n("Die Texte der Routen sind jetzt von der KI formuliert."));
      }),
      () => {
        (k.abort(), g(!1));
      }
    );
  }, [p]);
  const T = (i) => {
      var k;
      return (
        (d && d.key === p
          ? (k = d.routes.find((f) => f.id === i.id)) == null
            ? void 0
            : k.texte
          : void 0) ?? i.texte
      );
    },
    M = !!d && d.key === p && d.routes.some((i) => i.texte.quelle === "ki"),
    [N, C] = v.useState(null),
    O = (i) => {
      var f;
      const k = { ...i, texte: T(i) };
      if (o.hasName && (f = o.name) != null && f.trim()) {
        const y = J(o, k, o.name);
        (t(y), s({ name: "auswahl", id: y.id, gemerkt: !1 }));
        return;
      }
      (W(be(z(), o, k)), s({ name: "names", gemerkt: !1, kinds: [] }));
    },
    F = () => {
      if (!N) return;
      const i = { ...N.route, texte: T(N.route) },
        k = J(o, i, N.s.name, {
          kind: ee(N.s.kind),
          suffix: N.s.suffix ?? "",
          card: N.c,
          fromFinder: !0,
        });
      (t(k), C(null), s({ name: "auswahl", id: k.id, gemerkt: !1 }));
    },
    B = (i) => {
      const k = z(),
        f = k.saved.some((y) => y.id === i.id);
      (W({ ...k, saved: f ? k.saved.filter((y) => y.id !== i.id) : [...k.saved, ye(i)] }),
        j((y) => y + 1),
        f || n(`„${i.name}“ gemerkt.`));
    };
  return e.jsxs("div", {
    className: "container screen rt-screen",
    children: [
      e.jsx("a", {
        className: "back-link",
        href: "#/kompass",
        onClick: (i) => {
          (i.preventDefault(), s({ name: "kompass", step: Math.min(6, Math.max(1, a.schritt)) }));
        },
        children: "← Zurück zum Kompass",
      }),
      e.jsx("h1", {
        className: "h1",
        "data-title": "Drei Richtungen",
        children: "Drei Richtungen für deine Personal Brand.",
      }),
      e.jsx("p", {
        className: "lead rt-lead",
        children:
          "Eine sichere, eine mutige und eine überraschende. Jede zeigt, wofür du stehst, worüber du postest und wie du auftrittst. Vertiefe die, die sich nach dir anfühlt.",
      }),
      e.jsxs("div", {
        className: "rt-tools",
        children: [
          e.jsx(G, {
            onClick: () => {
              (x((i) => ({ ...i, seed: (i.seed * 1103515245 + 12345) >>> 0 })),
                c("Neue Vorschläge in denselben Richtungen."));
            },
            children: "Neue Vorschläge",
          }),
          e.jsxs("details", {
            className: "rt-ki",
            children: [
              e.jsx("summary", {
                className: "btn btn-text",
                children: w.kiFunktionen ? "KI-Funktionen (an)" : "Texte mit KI formulieren",
              }),
              e.jsx(xe, {}),
            ],
          }),
        ],
      }),
      r &&
        e.jsx("p", {
          className: "small rt-ki-state",
          role: "status",
          children: "Die KI formuliert die Texte. Bis dahin siehst du unsere Texte.",
        }),
      !r &&
        w.kiFunktionen &&
        d &&
        d.key === p &&
        !M &&
        e.jsx("p", {
          className: "small muted rt-ki-state",
          role: "status",
          children: "KI-Texte gerade nicht verfügbar. Du siehst unsere Texte.",
        }),
      e.jsx("div", {
        className: "rt-grid",
        children: h.map((i, k) =>
          e.jsx(
            Ge,
            {
              route: i,
              texte: T(i),
              brief: o,
              gemerkt: a.gemerkt.includes(i.territory),
              mutiger: a.mutiger[i.id] ?? 0,
              onSave: () =>
                x((f) => ({
                  ...f,
                  gemerkt: f.gemerkt.includes(i.territory)
                    ? f.gemerkt.filter((y) => y !== i.territory)
                    : [...f.gemerkt, i.territory],
                })),
              onShift: (f) => {
                (x((y) => Te(y, i.id, f)),
                  n(f > 0 ? `Richtung ${i.id} mutiger.` : `Richtung ${i.id} ruhiger.`));
              },
              onDeepen: () => O(i),
              onName: (f, y) => C({ route: i, s: f, c: y }),
              savedNames: I,
              onSaveName: B,
              show: (S == null ? void 0 : S[k]) ?? null,
            },
            i.id,
          ),
        ),
      }),
      N &&
        e.jsx(re, {
          open: !0,
          onClose: () => C(null),
          title: [N.s.name, N.s.suffix].filter(Boolean).join(" "),
          size: "mid",
          className: "nd-dialog",
          footer: e.jsxs(e.Fragment, {
            children: [
              e.jsx(le, {
                onClick: () => {
                  const i = N.route;
                  (C(null), O(i));
                },
                children: "Mehr Namen in dieser Richtung",
              }),
              e.jsx(Z, { onClick: F, children: "Logos für diesen Namen" }),
            ],
          }),
          children: e.jsxs("div", {
            className: "nd-details",
            children: [
              e.jsxs("div", {
                className: "nd-hero",
                children: [
                  e.jsx(ke, {
                    s: N.s,
                    concept: N.c,
                    styles: N.route.params.styles.slice(0, 2),
                    className: "nd-mark",
                  }),
                  e.jsx("div", {
                    className: "nd-hero-row",
                    children: e.jsx("span", { className: "small nd-kind", children: Ne(N.s) }),
                  }),
                ],
              }),
              e.jsx("p", {
                className: "nd-reason",
                children: N.s.reason || `Ein Name in der Richtung ${N.route.titel}.`,
              }),
            ],
          }),
        }),
    ],
  });
}
export { ss as default };
