import {
  u as C,
  r as m,
  j as e,
  W as B,
  P as g,
  T as P,
  D as S,
  G as N,
  R as $,
  M as D,
} from "./index-BER2gtDe.js";
import { d as E } from "./photoStore-D5-LfIN5.js";
import { u as F, d as L, r as k, p as T, a as w, S as A } from "./library-D1LkGQVN.js";
import { y as M, O as K, e as G } from "./ObjectEditor-2EvMWoQa.js";
/* empty css                 */ import "./energy-DRQ_36b-.js";
import "./objectData-DW9yI24T.js";
import "./svg-CrwnZnJY.js";
import "./imagesize-BHC6N02v.js";
function R({ o: s, cover: a, onEdit: r, onPost: j, onCopy: p, onDelete: b }) {
  const o = w(s),
    l = s.photos.filter((d) => !d.rights).length,
    c = G(s.energy) === "voll";
  return e.jsxs("article", {
    className: "ps-obj",
    "aria-label": s.title,
    children: [
      e.jsxs("button", {
        type: "button",
        className: "ps-obj-cover",
        onClick: r,
        "aria-label": `${s.title} ändern`,
        children: [
          a
            ? e.jsx("img", { src: a, alt: "" })
            : e.jsx("span", { className: "small", children: "Noch kein Foto" }),
          e.jsx("span", { className: `ps-status is-${s.status}`, children: A[s.status] }),
        ],
      }),
      e.jsxs("div", {
        className: "ps-obj-body",
        children: [
          e.jsx("h2", { className: "ps-obj-title", children: s.title }),
          e.jsx("p", {
            className: "small",
            children: [o, s.price, `${s.photos.length} ${s.photos.length === 1 ? "Foto" : "Fotos"}`]
              .filter(Boolean)
              .join(" · "),
          }),
          (!c || l > 0) &&
            e.jsx("p", {
              className: "small ps-obj-hint",
              children: [c ? "" : "Energieausweis fehlt", l ? `Bildrechte offen (${l})` : ""]
                .filter(Boolean)
                .join(" · "),
            }),
        ],
      }),
      e.jsxs("div", {
        className: "ps-obj-actions",
        children: [
          e.jsx(N, { onClick: j, children: "Posting erstellen" }),
          e.jsx(D, {
            label: `Mehr zu ${s.title}`,
            placement: "below-end",
            items: [
              { label: "Ändern", run: r },
              { label: "Kopieren", run: p },
              { label: "Löschen", run: b },
            ],
            children: "Mehr",
          }),
        ],
      }),
    ],
  });
}
function V({ projectId: s, objekt: a }) {
  var f;
  const { state: r, update: j, navigate: p, toast: b } = C(),
    o = r.projects[s],
    l = ((f = o.library) == null ? void 0 : f.objects) ?? [],
    [c, d] = m.useState(null),
    [v, x] = m.useState(!1),
    [h, u] = m.useState(null),
    y = M(
      l
        .map((t) => {
          var i;
          return (i = t.photos[0]) == null ? void 0 : i.id;
        })
        .filter((t) => !!t),
    );
  m.useEffect(() => {
    if (!a) return;
    const t = l.find((i) => i.id === a);
    t && d(t);
  }, [a]);
  const O = (t) => {
    j(s, (n) => ({ ...n, library: k(n.library ?? { objects: [] }, t.id) }));
    const i = Object.values(r.projects).map((n) =>
      n.id === s ? { ...n, library: k(n.library ?? { objects: [] }, t.id) } : n,
    );
    for (const n of t.photos) T(i, n.id) || E(n.id);
    b(`„${t.title}“ gelöscht.`);
  };
  return e.jsxs("div", {
    className: "container screen ps-screen",
    children: [
      e.jsx("a", { className: "back-link", href: `#/p/${s}/kit`, children: "← Brand Kit" }),
      e.jsxs("div", {
        className: "ps-head",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", { className: "h1", "data-title": "Objekte", children: "Deine Objekte" }),
              e.jsxs("p", {
                className: "lead",
                children: ["Fotos und Angaben für deine Postings. ", B(o), "."],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-flex",
            children: [
              e.jsx(g, { onClick: () => x(!0), children: "Objekt anlegen" }),
              e.jsx(P, {
                onClick: () => p({ name: "postings", id: s }),
                children: "Zu den Postings",
              }),
            ],
          }),
        ],
      }),
      l.length
        ? e.jsx("div", {
            className: "ps-obj-grid",
            children: l.map((t) =>
              e.jsx(
                R,
                {
                  o: t,
                  cover: t.photos[0] ? y[t.photos[0].id] : void 0,
                  onEdit: () => d(t),
                  onPost: () => p({ name: "postings", id: s, objekt: t.id }),
                  onCopy: () => {
                    (j(s, (i) => ({ ...i, library: F(i.library ?? { objects: [] }, L(t)) })),
                      b("Kopie angelegt."));
                  },
                  onDelete: () => u(t),
                },
                t.id,
              ),
            ),
          })
        : e.jsx("div", {
            className: "empty-state",
            children: e.jsx("p", {
              children:
                "Noch keine Objekte. Leg dein erstes Objekt mit Fotos an, dann entstehen daraus deine Postings.",
            }),
          }),
      e.jsx(K, { open: v || !!c, object: c, project: o, onClose: () => (x(!1), d(null)) }),
      e.jsx(S, {
        open: !!h,
        onClose: () => u(null),
        title: h ? `„${h.title}“ löschen?` : "",
        footer: e.jsxs(e.Fragment, {
          children: [
            e.jsx(N, { onClick: () => u(null), children: "Abbrechen" }),
            e.jsx(g, {
              knob: "×",
              onClick: () => {
                (h && O(h), u(null));
              },
              children: "Löschen",
            }),
          ],
        }),
        children: e.jsx("p", {
          children:
            "Das Objekt und seine Fotos werden aus diesem Browser entfernt. Heruntergeladene Postings bleiben erhalten.",
        }),
      }),
      e.jsx($, { children: e.jsx(g, { onClick: () => x(!0), children: "Objekt anlegen" }) }),
    ],
  });
}
export { V as default };
