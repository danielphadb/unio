import { r as h, j as e, T as k, G as T, D as $, P as I, S as B } from "./index-BER2gtDe.js";
import { h as z } from "./engine-BhDRZEfO.js";
import { L as P } from "./LogoView-CG3DXWdO.js";
import { u as R, s as K, n as y, j as M, w as W, l as H } from "./nameFinder-CLppxXuz.js";
function O({ on: n }) {
  return e.jsx("svg", {
    className: "heart",
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    "aria-hidden": "true",
    focusable: "false",
    children: e.jsx("path", {
      d: "M10 17.2 3.4 10.8A4 4 0 0 1 10 5.1a4 4 0 0 1 6.6 5.7Z",
      fill: n ? "var(--signal)" : "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinejoin: "round",
    }),
  });
}
function D({ saved: n, onSave: a, onHide: s, name: l }) {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("button", {
        type: "button",
        className: "icon-btn heart-btn",
        "aria-pressed": n,
        "aria-label": n ? `Gemerkt: ${l}` : `Merken: ${l}`,
        title: n ? "Gemerkt" : "Merken",
        onClick: a,
        children: e.jsx(O, { on: n }),
      }),
      s &&
        e.jsx("button", {
          type: "button",
          className: "icon-btn hide-btn",
          "aria-label": `Weniger davon: ${l}`,
          title: "Weniger davon",
          onClick: s,
          children: e.jsx("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 18 18",
            "aria-hidden": "true",
            focusable: "false",
            children: e.jsx("path", {
              d: "M4 4 14 14M14 4 4 14",
              stroke: "currentColor",
              strokeWidth: "1.5",
              strokeLinecap: "round",
            }),
          }),
        }),
    ],
  });
}
function p({ s: n, concept: a, styles: s, className: l = "", part: d, caption: i }) {
  const o = h.useMemo(() => W(n, s), [n, s]),
    t = a ? z(a) : null;
  return e.jsxs("div", {
    className: `wm-face${(t == null ? void 0 : t.variant) === "reverse" ? " is-dark" : ""}${a ? "" : " riffel"} ${l}`,
    style: t ? { background: t.background } : void 0,
    children: [
      a &&
        e.jsx(P, {
          concept: a,
          input: o,
          variant: t == null ? void 0 : t.variant,
          ground: t == null ? void 0 : t.ground,
          part: d,
          animate: !0,
          priority: "high",
        }),
      i &&
        e.jsx("span", {
          className: "label wm-caption",
          style:
            (t == null ? void 0 : t.variant) === "reverse" && a
              ? { color: a.palette.paper }
              : void 0,
          children: i,
        }),
    ],
  });
}
function S({ title: n, children: a }) {
  const [s, l] = h.useState(!1);
  return e.jsxs("details", {
    className: "disclosure nd-fold",
    onToggle: (d) => l(d.currentTarget.open),
    children: [
      e.jsx("summary", { children: n }),
      s && e.jsx("div", { className: "disclosure-body", children: a }),
    ],
  });
}
function G({ s: n, concept: a, styles: s, onTake: l }) {
  const d = h.useMemo(() => H(n, a, s), [n, a, s]);
  return e.jsx("div", {
    className: "nd-forms",
    children: d.map((i) =>
      e.jsxs(
        "button",
        {
          type: "button",
          className: "nd-form",
          "aria-label": `Logos für diesen Namen, Form ${i.label}`,
          onClick: () => l(n, i.concept),
          children: [
            e.jsx(p, {
              s: n,
              concept: i.concept,
              styles: s,
              part: i.part,
              className: i.key === "profil" ? "is-round" : "",
            }),
            e.jsx("span", { className: "tile-name", children: i.label }),
          ],
        },
        i.key,
      ),
    ),
  });
}
function g({ label: n, ok: a, text: s }) {
  return e.jsxs("li", {
    className: "nd-check",
    children: [
      e.jsx("span", { className: "nd-check-label", children: n }),
      e.jsx("span", { className: "nd-check-state", children: a ? "Passt" : "Hinweis" }),
      s && e.jsx("span", { className: "small nd-check-text", children: s }),
    ],
  });
}
const N = ({ href: n, children: a }) =>
  e.jsxs("a", {
    href: n,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "nd-link",
    children: [
      a,
      " ",
      e.jsx("span", { "aria-hidden": "true", children: "↗" }),
      e.jsx("span", { className: "sr-only", children: " (öffnet ein neues Fenster)" }),
    ],
  });
function re(n) {
  const { s: a, concept: s, styles: l } = n,
    d = [a.name, a.suffix].filter(Boolean).join(" "),
    i = a.name.replace(/[^\p{L}]/gu, "").length,
    o = a.domains,
    t = o ? R(a.name) : null,
    c = h.useRef(null),
    x = h.useRef(null),
    [f, m] = h.useState(n.mehr ? "more" : "none");
  h.useEffect(() => {
    (f === "more" &&
      n.mehr &&
      requestAnimationFrame(() => {
        var r;
        return (r = c.current) == null ? void 0 : r.focus();
      }),
      f === "back" &&
        !n.mehr &&
        requestAnimationFrame(() => {
          var r;
          return (r = document.querySelector(".nd-more-link")) == null ? void 0 : r.focus();
        }),
      f !== "none" && m("none"));
  }, [n.mehr, f]);
  const w = (r) => {
      r.target.closest("input, textarea, summary") ||
        r.altKey ||
        r.ctrlKey ||
        r.metaKey ||
        n.mehr ||
        (r.key === "ArrowLeft" && n.hasPrev
          ? (r.preventDefault(), n.onPrev())
          : r.key === "ArrowRight" && n.hasNext && (r.preventDefault(), n.onNext()));
    },
    u = e.jsxs("div", {
      className: "nd-details",
      children: [
        e.jsxs("div", {
          className: "nd-hero",
          children: [
            e.jsx(p, { s: a, concept: s, styles: l, className: "nd-mark" }),
            e.jsxs("div", {
              className: "nd-hero-row",
              children: [
                e.jsx("span", { className: "small nd-kind", children: K(a) }),
                e.jsx("span", { className: "spacer" }),
                e.jsx(D, {
                  saved: n.saved,
                  onSave: () => n.onSave(a),
                  onHide: () => n.onHide(a),
                  name: d,
                }),
              ],
            }),
          ],
        }),
        e.jsx("p", {
          className: "nd-reason",
          children: a.reason || "Ein eigenständiger Name, der zu deinen Angaben passt.",
        }),
        y(a) && e.jsx("p", { className: "small nd-naehe", children: y(a) }),
        (s == null ? void 0 : s.legalNaehe) &&
          e.jsx("p", {
            className: "small nd-naehe",
            children: `Logo ähnlich zu ${s.legalNaehe.marke}, vor Nutzung prüfen`,
          }),
        e.jsxs("div", {
          className: "row nd-actions",
          children: [
            e.jsx(k, {
              className: "nd-more-link",
              onClick: () => {
                (m("more"), n.onArea(!0));
              },
              children: "Mehr wie dieser",
            }),
            (n.hasPrev || n.hasNext) &&
              e.jsxs("span", {
                className: "nd-nav",
                children: [
                  e.jsx(k, {
                    onClick: n.onPrev,
                    disabled: !n.hasPrev,
                    "aria-label": "Vorheriger Name",
                    children: "←",
                  }),
                  e.jsx(k, {
                    onClick: n.onNext,
                    disabled: !n.hasNext,
                    "aria-label": "Nächster Name",
                    children: "→",
                  }),
                ],
              }),
          ],
        }),
        e.jsxs("div", {
          className: "nd-folds",
          children: [
            e.jsxs(S, {
              title: "Domain und Marke prüfen",
              children: [
                o &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("ul", {
                        className: "nd-domains",
                        children: [
                          o.at,
                          ...o.alt.filter((r) => r.endsWith(".at")),
                          o.com,
                          ...o.alt.filter((r) => r.endsWith(".com")),
                        ].map((r) =>
                          e.jsxs(
                            "li",
                            {
                              children: [
                                e.jsx("span", { className: "data", children: r }),
                                e.jsxs(k, {
                                  onClick: () => n.onDomain(r, r.endsWith(".com") ? "com" : "at"),
                                  children: [
                                    "Prüfen ",
                                    e.jsx("span", { "aria-hidden": "true", children: "↗" }),
                                    e.jsx("span", {
                                      className: "sr-only",
                                      children:
                                        " (kopiert die Adresse und öffnet ein neues Fenster)",
                                    }),
                                  ],
                                }),
                              ],
                            },
                            r,
                          ),
                        ),
                      }),
                      t &&
                        e.jsxs("p", {
                          className: "small",
                          children: [
                            t,
                            ": möglich, wird aber oft falsch getippt. Empfohlen: ",
                            o.at,
                          ],
                        }),
                      e.jsxs("p", {
                        className: "small nd-insta",
                        children: [
                          "Instagram: @",
                          M(o.at),
                          " · ",
                          e.jsx(N, {
                            href: `https://www.instagram.com/${M(o.at)}/`,
                            children: "Ansehen",
                          }),
                        ],
                      }),
                    ],
                  }),
                e.jsxs("p", {
                  className: "small",
                  children: [
                    "Marke: ",
                    e.jsx(N, { href: "https://seeip.patentamt.at", children: "see.ip" }),
                    " · ",
                    e.jsx(N, { href: "https://www.tmdn.org/tmview/", children: "TMview" }),
                    " · ",
                    e.jsx(N, { href: "https://firmen.wko.at", children: "WKO Firmen A-Z" }),
                  ],
                }),
                e.jsx("p", {
                  className: "small",
                  children: "Wir können das nicht für dich prüfen und geben keine Rechtsberatung.",
                }),
              ],
            }),
            e.jsx(S, {
              title: "Kurz-Check",
              children: e.jsxs("ul", {
                className: "nd-checks",
                children: [
                  e.jsx(g, {
                    label: "Länge",
                    ok: i <= 16,
                    text: `${i} Buchstaben${i > 16 ? ". Eher lang für Schild und Domain." : ""}`,
                  }),
                  e.jsx(g, { label: "Gut auszusprechen", ok: a.checks.pronounceable }),
                  e.jsx(g, { label: "Ohne abgegriffene Begriffe", ok: a.checks.clicheFree }),
                  e.jsx(g, {
                    label: "Abstand zu bekannten Marken",
                    ok: !a.checks.conflict,
                    text: a.checks.conflict,
                  }),
                ],
              }),
            }),
            e.jsx(S, {
              title: "So könnte dein Logo aussehen",
              children: s && e.jsx(G, { s: a, concept: s, styles: l, onTake: n.onTake }),
            }),
          ],
        }),
      ],
    }),
    F = e.jsxs("section", {
      className: "nd-variants",
      "aria-labelledby": "nd-more-h",
      children: [
        e.jsxs(k, {
          ref: x,
          onClick: () => {
            (m("back"), n.onArea(!1));
          },
          children: ["← Zurück zu ", a.name],
        }),
        e.jsxs("h3", {
          className: "h2",
          id: "nd-more-h",
          ref: c,
          tabIndex: -1,
          children: ["Ähnlich wie „", a.name, "“"],
        }),
        n.path.length > 1 &&
          e.jsx("nav", {
            className: "nd-path small",
            "aria-label": "Pfad",
            children: n.path.map((r, j) =>
              e.jsxs(
                "span",
                {
                  children: [
                    j > 0 && e.jsx("span", { "aria-hidden": "true", children: " → " }),
                    j < n.path.length - 1
                      ? e.jsx("button", {
                          type: "button",
                          className: "btn-link",
                          onClick: () => n.onPath(r),
                          children: r.name,
                        })
                      : e.jsx("span", { "aria-current": "true", children: r.name }),
                  ],
                },
                r.id,
              ),
            ),
          }),
        e.jsx("div", {
          className: "wm-grid nd-grid",
          children: n.variants.items.map((r, j) =>
            e.jsx(
              V,
              {
                s: r,
                concept: n.variants.conceptOf(r, j),
                styles: l,
                saved: n.savedIds.has(r.id),
                onOpen: () => n.onAnchor(r),
                onSave: () => n.onSave(r),
                onHide: () => n.onHide(r),
              },
              r.id,
            ),
          ),
        }),
        n.variants.canMore &&
          (n.variants.auto
            ? e.jsx(U, { onHit: n.variants.onMore }, n.variants.items.length)
            : e.jsx("div", {
                className: "gallery-more",
                children: e.jsx(T, {
                  onClick: n.variants.onMore,
                  children: "24 weitere Varianten",
                }),
              })),
      ],
    });
  return e.jsx($, {
    open: !0,
    onClose: n.onClose,
    title: d,
    size: "mid",
    className: "nd-dialog",
    footer: e.jsx(I, { onClick: () => n.onTake(a, s), children: "Logos für diesen Namen" }),
    children: e.jsx("div", { className: "nd-body", onKeyDown: w, children: n.mehr ? F : u }),
  });
}
function V({ s: n, concept: a, styles: s, saved: l, onOpen: d, onSave: i, onHide: o }) {
  const t = [n.name, n.suffix].filter(Boolean).join(" ");
  return e.jsxs("article", {
    className: "wm-card is-small",
    onKeyDown: (c) => {
      c.target.closest("input") ||
        c.ctrlKey ||
        c.metaKey ||
        c.altKey ||
        (c.key === "m" || c.key === "M"
          ? (c.preventDefault(), i())
          : (c.key === "x" || c.key === "X") && (c.preventDefault(), o()));
    },
    children: [
      e.jsx("button", {
        type: "button",
        className: "wm-open",
        "aria-label": `${t}. ${K(n)}. Als Ausgangspunkt nehmen`,
        onClick: d,
        children: e.jsx(p, { s: n, concept: a, styles: s }),
      }),
      e.jsx("div", {
        className: "wm-actions",
        children: e.jsx(D, { saved: l, onSave: i, name: t }),
      }),
    ],
  });
}
function U({ onHit: n }) {
  const a = h.useRef(null),
    s = h.useRef(n);
  return (
    (s.current = n),
    h.useEffect(() => {
      const l = a.current;
      if (!l) return;
      const d = new IntersectionObserver((i) => i.some((o) => o.isIntersecting) && s.current(), {
        rootMargin: "600px",
      });
      return (d.observe(l), () => d.disconnect());
    }, []),
    e.jsx("div", { ref: a, className: "nf-sentinel", "aria-hidden": "true" })
  );
}
const E = "unio-brand:einstellungen",
  b = { kiFunktionen: !1, intern: !1, signatureEntwuerfe: !1 };
function _(n) {
  if (!n) return { ...b };
  try {
    const a = JSON.parse(n);
    return !a || typeof a != "object" || Array.isArray(a)
      ? { ...b }
      : {
          kiFunktionen: a.kiFunktionen === !0 || a.kiVorauswahl === !0,
          intern: a.intern === !0,
          signatureEntwuerfe: a.intern === !0 && a.signatureEntwuerfe === !0,
        };
  } catch {
    return { ...b };
  }
}
function Z(n) {
  const a = new URLSearchParams(n).get("entwuerfe");
  return a === "1" ? !0 : a === "0" ? !1 : null;
}
let v = null;
const C = new Set();
function q() {
  let n;
  try {
    n = _(typeof localStorage < "u" ? localStorage.getItem(E) : null);
  } catch {
    n = { ...b };
  }
  const a = typeof location < "u" ? Z(location.search) : null;
  return (a !== null && ((n = { ...n, intern: a, signatureEntwuerfe: a }), L(n)), n);
}
function L(n) {
  try {
    localStorage.setItem(E, JSON.stringify(n));
  } catch {}
}
function A() {
  return (v || (v = q()), v);
}
function J(n) {
  const a = { ...A(), ...n };
  (a.intern || (a.signatureEntwuerfe = !1), (v = a), L(a));
  for (const s of C) s();
}
function X(n) {
  return (C.add(n), () => C.delete(n));
}
function Y() {
  return h.useSyncExternalStore(X, A, A);
}
const Q = "https://www.unio.at/datenschutz";
function te() {
  const n = Y(),
    a = h.useId();
  return e.jsxs("div", {
    className: "stack ki-consent",
    children: [
      e.jsx(B, {
        checked: n.kiFunktionen,
        onChange: (s) => J({ kiFunktionen: s }),
        describedBy: a,
        children: "KI-Funktionen",
      }),
      e.jsxs("p", {
        className: "small",
        id: a,
        children: [
          "Schaltet die KI-Vorauswahl der Logos, KI-Namensideen und KI-Texte zu deinen Markenrouten frei. Name, Region, Stichworte, deine Antworten im Markenkompass und Logo-Bilder werden dafür an Anthropic übertragen, Kontaktdaten nicht.",
          " ",
          e.jsx("a", {
            href: Q,
            target: "_blank",
            rel: "noopener noreferrer",
            children: "Datenschutz",
          }),
        ],
      }),
    ],
  });
}
const ie = h.memo(function ({
  s: a,
  concept: s,
  styles: l,
  saved: d,
  desktop: i,
  onOpen: o,
  onSave: t,
  onHide: c,
  onMore: x,
  intern: f,
}) {
  const m = [a.name, a.suffix].filter(Boolean).join(" "),
    w = (u) => {
      u.target.closest("input, textarea") ||
        u.ctrlKey ||
        u.metaKey ||
        u.altKey ||
        (u.key === "m" || u.key === "M"
          ? (u.preventDefault(), t(a))
          : u.key === "x" || u.key === "X"
            ? (u.preventDefault(), c(a))
            : (u.key === "v" || u.key === "V") && x && (u.preventDefault(), x(a)));
    };
  return e.jsxs("article", {
    className: "wm-card name-card",
    "aria-label": m,
    onKeyDown: w,
    "data-name": a.name,
    "data-kind": a.kind,
    "data-id": a.id,
    children: [
      e.jsx("h3", { className: "sr-only nc-name", children: m }),
      e.jsx("button", {
        type: "button",
        className: "wm-open",
        "aria-label": `${m}. ${K(a)}. Details öffnen`,
        onClick: () => o(a, !1),
        children: e.jsx(p, { s: a, concept: s, styles: l }),
      }),
      e.jsx("div", {
        className: "wm-actions",
        children: e.jsx(D, {
          saved: d,
          onSave: () => t(a),
          onHide: i ? () => c(a) : void 0,
          name: m,
        }),
      }),
      y(a) && e.jsx("p", { className: "small nc-naehe", children: y(a) }),
      (s == null ? void 0 : s.legalNaehe) &&
        e.jsx("p", { className: "small nc-naehe", children: `ähnlich zu ${s.legalNaehe.marke}` }),
      f &&
        (s == null ? void 0 : s.signature) &&
        e.jsx("span", {
          className: "chip-tag example-tag nc-vorlage",
          children: `Vorlage ${s.signature.id}`,
        }),
    ],
  });
});
export { O as H, te as K, ie as N, U as S, p as W, re as a, J as s, Y as u };
