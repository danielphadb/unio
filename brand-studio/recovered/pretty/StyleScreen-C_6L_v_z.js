import { u as k, r as N, j as s, f as b, s as w, a as c } from "./index-BER2gtDe.js";
import { g as S, c as $, m as C } from "./engine-BhDRZEfO.js";
import { L as u } from "./LogoView-CG3DXWdO.js";
import { S as h, M as i } from "./describe-CrBWccON.js";
import "./svg-CrwnZnJY.js";
const L = {
  elegant: (e) => c(e.name.font.key).cat === "serif" && e.name.case !== "upper",
  modern: (e) =>
    c(e.name.font.key).cat === "sans" && e.name.case !== "upper" && e.name.case !== "lower",
  luxus: (e) => e.name.case === "upper" && e.name.tracking >= 0.12,
  warm: (e) =>
    e.name.case !== "upper" &&
    (c(e.name.font.key).cat === "sans" || c(e.name.font.key).cat === "script"),
  mutig: (e) => e.name.font.weight >= 700 && c(e.name.font.key).cat !== "serif",
  natur: (e) =>
    e.name.case === "lower" || (c(e.name.font.key).cat === "sans" && e.name.case !== "upper"),
};
function W({ projectId: e }) {
  const { state: x, update: y, navigate: f, announce: j } = k(),
    r = x.projects[e],
    l = r.input,
    o = N.useMemo(() => {
      const a = { ...l, colorMoods: [], themes: [] },
        n = {};
      for (const t of h) {
        const d = S({ ...a, styles: [t.key] }, { count: 12, page: 0, seed: r.seed });
        n[t.key] = d.find(L[t.key]) ?? d[0];
      }
      return n;
    }, [l.name, l.suffix, r.seed]),
    p = (a, n) => {
      ($(),
        C("style:tap"),
        y(e, (t) => w(t, a)),
        j(`Stil ${n} gewählt. Logos werden entworfen.`),
        f({ name: "auswahl", id: e, gemerkt: !1 }));
    },
    m = r.styleChoice,
    g = [o.elegant, o.mutig, o.natur];
  return s.jsxs("div", {
    className: "container screen",
    children: [
      s.jsx("a", {
        className: "back-link mobile-only-inline",
        href: b({ name: "name", id: e }),
        children: "← Name ändern",
      }),
      s.jsx("h1", {
        className: "h1",
        "data-title": "Stil",
        children: "Welche Wirkung passt zu dir?",
      }),
      s.jsx("p", {
        className: "lead",
        style: { marginTop: 16 },
        children: "Tippe auf einen Stil. Du kannst ihn später jederzeit wechseln.",
      }),
      s.jsxs("div", {
        className: "style-grid",
        children: [
          h.map((a) => {
            const n = o[a.key],
              t = m === a.key;
            return s.jsxs(
              "button",
              {
                type: "button",
                className: `style-card${t ? " is-chosen" : ""}`,
                "aria-label": `${a.title}: ${a.desc}${t ? " (gewählt)" : ""}`,
                onClick: () => p(a.key, a.title),
                children: [
                  s.jsx("span", {
                    className: "sc-preview",
                    style: { background: n.palette.paper },
                    children: s.jsx(u, { concept: n, input: l, fallbackText: !0, priority: "low" }),
                  }),
                  s.jsxs("span", {
                    className: "sc-text",
                    children: [
                      s.jsx("span", { className: "sc-title", children: a.title }),
                      s.jsx("span", { className: "sc-desc", children: a.desc }),
                      t &&
                        s.jsxs("span", {
                          className: "sc-chosen label label-strong",
                          children: [
                            s.jsx("span", { className: "dot", "aria-hidden": "true" }),
                            "GEWÄHLT",
                          ],
                        }),
                    ],
                  }),
                ],
              },
              a.key,
            );
          }),
          s.jsxs("button", {
            type: "button",
            className: `style-card is-mix${m === "mix" ? " is-chosen" : ""}`,
            "aria-label": `${i.title}: ${i.desc}${m === "mix" ? " (gewählt)" : ""}`,
            onClick: () => p("mix", i.title),
            children: [
              s.jsx("span", {
                className: "sc-preview",
                children: s.jsx("span", {
                  className: "mix-strip",
                  children: g.map((a) =>
                    s.jsx(
                      "span",
                      {
                        style: {
                          background: a.palette.paper,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 10,
                        },
                        children: s.jsx(u, { concept: a, input: l, priority: "low" }),
                      },
                      a.id,
                    ),
                  ),
                }),
              }),
              s.jsxs("span", {
                className: "sc-text",
                children: [
                  s.jsx("span", { className: "sc-title", children: i.title }),
                  s.jsx("span", { className: "sc-desc", children: i.desc }),
                  m === "mix" &&
                    s.jsxs("span", {
                      className: "sc-chosen label label-strong",
                      children: [
                        s.jsx("span", { className: "dot", "aria-hidden": "true" }),
                        "GEWÄHLT",
                      ],
                    }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { W as default };
