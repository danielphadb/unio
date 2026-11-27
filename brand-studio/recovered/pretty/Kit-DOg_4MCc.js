import {
  u as pe,
  r as o,
  K as lt,
  J as rt,
  V as Je,
  j as e,
  m as ot,
  D as me,
  G as V,
  W as ct,
  T as U,
  q as K,
  X as Pt,
  Y as Bt,
  Z as zt,
  _ as At,
  $ as Lt,
  a0 as Mt,
  S as ut,
  P as Y,
  a1 as Rt,
  a2 as $t,
  a3 as Wt,
  a4 as Kt,
  M as Oe,
  a5 as qe,
  a6 as Gt,
  a7 as Ut,
  R as Vt,
  a8 as Ht,
} from "./index-BER2gtDe.js";
import { l as Zt } from "./svg-CrwnZnJY.js";
import {
  h as he,
  u as dt,
  c as ht,
  m as mt,
  a as gt,
  d as _t,
  b as pt,
  f as Ie,
  k as ft,
  g as we,
  i as Jt,
  z as qt,
  j as Xt,
  l as Ee,
  n as Qt,
  o as Yt,
  s as en,
  p as tn,
  q as nn,
  r as sn,
  t as an,
  v as ln,
  T as bt,
} from "./kitAssets-CN7deWlx.js";
import { L as rn } from "./LogoView-CG3DXWdO.js";
import {
  e as Xe,
  s as on,
  v as cn,
  O as _,
  E as Qe,
  j as Ye,
  F as un,
  a as et,
  b as dn,
  d as hn,
  f as mn,
  c as gn,
} from "./objectData-DW9yI24T.js";
import { u as xt, d as tt, n as pn, p as fn, r as bn } from "./photoStore-D5-LfIN5.js";
import { p as xn } from "./library-D1LkGQVN.js";
import { p as jn } from "./prewarm-B0dvGBZL.js";
import { m as kn, a as vn, e as wn } from "./engine-BhDRZEfO.js";
/* empty css                 */ import "./imagesize-BHC6N02v.js";
import "./energy-DRQ_36b-.js";
const yn = [
    "Immobilienmakler",
    "Immobilienmaklerin",
    "Immobilienberater",
    "Immobilienberaterin",
    "Immobilientreuhänder",
    "Immobilientreuhänderin",
  ],
  Nn = "https://www.unio.at/maklerzuschnitt",
  be = new Map();
function Sn(n, c, s) {
  try {
    const m = n.getImageData(0, 0, c, s).data;
    for (let b = 3; b < m.length; b += 16) if (m[b] < 250) return !0;
    return !1;
  } catch {
    return !0;
  }
}
async function En(n, c = 1200) {
  const s = URL.createObjectURL(n);
  try {
    const m = await new Promise((u, r) => {
        const S = new Image();
        ((S.onload = () => u(S)),
          (S.onerror = () => r(new Error("Bild nicht lesbar"))),
          (S.src = s));
      }),
      b = Math.min(1, c / m.naturalHeight),
      g = Math.round(m.naturalWidth * b),
      x = Math.round(m.naturalHeight * b),
      w = document.createElement("canvas");
    ((w.width = g), (w.height = x));
    const t = w.getContext("2d");
    if (!t) throw new Error("Canvas nicht verfügbar");
    return (
      t.drawImage(m, 0, 0, g, x),
      Sn(t, g, x) ? w.toDataURL("image/png") : w.toDataURL("image/jpeg", 0.86)
    );
  } finally {
    URL.revokeObjectURL(s);
  }
}
function Cn({ open: n, onClose: c, project: s }) {
  const { update: m, toast: b, state: g, announce: x } = pe(),
    w = () => {
      const l = be.get(s.id);
      if (l) return l;
      const z = { ...Rt(), ...s.contact };
      return (z.person || (z.person = $t(s.input.name)), z);
    },
    [t, u] = o.useState(w),
    [r, S] = o.useState({}),
    [R, F] = o.useState(!!s.contact.legal),
    [y, P] = o.useState(!1),
    D = he() && s.templateSet === "unio",
    $ = dt(n && D),
    [j, f] = o.useState(null),
    [O, B] = o.useState("karte"),
    [N, k] = o.useState(!1),
    [A, I] = o.useState(!1),
    h = o.useRef({});
  o.useEffect(() => {
    n && (u(w()), S({}), I(!1));
  }, [n]);
  const C = (l) => u((z) => ({ ...z, ...l })),
    H = (l, z) => S((J) => ({ ...J, [l]: z ? void 0 : Wt[l] })),
    L = Object.values(g.projects)
      .filter((l) => l.id !== s.id && lt(l.contact))
      .sort((l, z) => z.updatedAt - l.updatedAt)[0],
    [ee, ue] = o.useState(t);
  o.useEffect(() => {
    const l = setTimeout(() => ue(t), 150);
    return () => clearTimeout(l);
  }, [t]);
  const q = s.selected,
    te = ht(n ? q : null, s.input),
    ne = o.useMemo(() => {
      if (!q) return null;
      const l = rt({ ...s, contact: Je(ee) });
      return mt(q, s.input, l);
    }, [q, s, ee]),
    a = gt(n && !D),
    d = _t(O === "karte" ? "business-card" : O === "brief" ? "letterhead" : "email-signature", D),
    v = pt(n ? d : void 0, ne, te && (D ? $.ready : a)),
    E = () => {
      const l = Kt(t);
      S(l);
      const z = Je(t);
      m(s.id, (ae) => ({ ...ae, contact: z, contactSaved: !0 }));
      const J = Object.keys(l)[0];
      if (J) {
        (I(!0),
          be.set(s.id, t),
          J === "legal" && F(!0),
          (J === "legal" || J === "web") && P(!0),
          setTimeout(() => {
            var ae;
            return (ae = h.current[J]) == null ? void 0 : ae.focus();
          }, 30),
          x("Gültige Angaben sind gespeichert. Bitte prüf die markierten Felder.", !0));
        return;
      }
      (be.delete(s.id), b("Kontaktdaten übernommen. Deine Drucksachen sind aktualisiert."), c());
    },
    T = () => {
      (be.set(s.id, t), c());
    },
    X = async (l) => {
      if (l) {
        if ((f(null), !/^image\//.test(l.type))) {
          f("Diese Datei ist kein Bild. Wähle ein Foto im Format JPG oder PNG.");
          return;
        }
        try {
          C({ photo: await En(l) });
        } catch {
          f(
            "Das Foto konnte nicht gelesen werden. Versuch es mit einem anderen Bild (JPG oder PNG).",
          );
        }
      }
    },
    se = e.jsxs("div", {
      className: "contact-preview",
      children: [
        e.jsx(ot, {
          options: [
            { value: "karte", label: "Visitenkarte" },
            { value: "signatur", label: "Signatur" },
            { value: "brief", label: "Briefpapier" },
          ],
          value: O,
          onChange: B,
          label: "Vorschau",
        }),
        e.jsx("div", {
          className: "pv",
          role: "img",
          "aria-label": `Vorschau ${O === "karte" ? "Visitenkarte" : O === "brief" ? "Briefpapier" : "Signatur"} mit deinen Daten`,
          children: v.svg
            ? e.jsx("div", {
                className: "mock-svg",
                dangerouslySetInnerHTML: { __html: Ie(v.svg) },
              })
            : e.jsx("div", {
                className: "riffel skeleton",
                style: { width: "100%", height: "100%" },
              }),
        }),
      ],
    });
  return e.jsx(me, {
    open: n,
    onClose: T,
    size: "wide",
    title: "Deine Kontaktdaten",
    sub: "Wir setzen sie automatisch in Visitenkarte, Briefpapier, Exposé und E-Mail-Signatur ein.",
    footer: e.jsxs(e.Fragment, {
      children: [
        e.jsx(V, { onClick: T, children: "Später" }),
        e.jsx(Y, { onClick: E, children: "Übernehmen" }),
      ],
    }),
    children: e.jsxs("div", {
      className: "contact-layout",
      children: [
        e.jsxs("form", {
          noValidate: !0,
          onSubmit: (l) => {
            (l.preventDefault(), E());
          },
          children: [
            A &&
              e.jsx("div", {
                className: "inline-note",
                role: "status",
                style: { marginBottom: 24 },
                children: e.jsx("p", {
                  children:
                    "Deine gültigen Angaben sind gespeichert und schon in den Drucksachen. Die markierten Felder lassen wir weg, bis du sie korrigierst. Du kannst auch „Später“ wählen.",
                }),
              }),
            L &&
              e.jsx("div", {
                style: { marginBottom: 24 },
                children: e.jsxs(V, {
                  onClick: () => {
                    (u({ ...L.contact, photo: L.contact.photo }), S({}));
                  },
                  children: ["Daten aus „", ct(L), "“ übernehmen"],
                }),
              }),
            e.jsxs("div", {
              className: "mobile-only",
              style: { marginBottom: 16 },
              children: [
                e.jsx(U, {
                  "aria-expanded": N,
                  onClick: () => k((l) => !l),
                  children: N ? "Vorschau ausblenden" : "Vorschau anzeigen",
                }),
                N && se,
              ],
            }),
            e.jsx(K, {
              label: "VOR- UND NACHNAME",
              autoComplete: "name",
              value: t.person,
              onChange: (l) => C({ person: l.target.value }),
            }),
            e.jsx(K, {
              label: "BERUFSBEZEICHNUNG",
              list: "role-suggestions",
              autoComplete: "organization-title",
              placeholder: "z. B. Immobilienmaklerin",
              value: t.role,
              onChange: (l) => C({ role: l.target.value }),
            }),
            e.jsx(K, {
              ref: (l) => (h.current.phone = l),
              label: "TELEFON",
              type: "tel",
              inputMode: "tel",
              autoComplete: "tel",
              value: t.phone,
              onChange: (l) => C({ phone: l.target.value }),
              onBlur: () => {
                const l = t.phone.trim(),
                  z = Pt(l);
                (z && l && C({ phone: Bt(l) }), H("phone", z));
              },
              error: r.phone,
              help: "Am besten deine Handynummer.",
            }),
            e.jsx(K, {
              ref: (l) => (h.current.email = l),
              label: "E-MAIL",
              type: "email",
              autoComplete: "email",
              value: t.email,
              onChange: (l) => C({ email: l.target.value }),
              onBlur: () => H("email", zt(t.email)),
              error: r.email,
            }),
            e.jsxs("details", {
              className: "disclosure contact-more",
              open: y,
              onToggle: (l) => P(l.currentTarget.open),
              children: [
                e.jsx("summary", { children: "Weitere Angaben" }),
                y &&
                  e.jsxs("div", {
                    className: "disclosure-body",
                    children: [
                      e.jsx(K, {
                        ref: (l) => (h.current.web = l),
                        label: "WEBSITE (OPTIONAL)",
                        inputMode: "url",
                        autoComplete: "url",
                        value: t.web,
                        onChange: (l) => C({ web: l.target.value }),
                        onBlur: () => {
                          const l = At(t.web);
                          (l && C({ web: Lt(t.web) }), H("web", l));
                        },
                        error: r.web,
                      }),
                      e.jsxs("fieldset", {
                        className: "field",
                        children: [
                          e.jsx("legend", {
                            className: "label field-label",
                            children: "ADRESSE (OPTIONAL)",
                          }),
                          e.jsxs("div", {
                            className: "field-pair",
                            children: [
                              e.jsx("input", {
                                className: "input",
                                "aria-label": "Straße und Hausnummer",
                                placeholder: "Straße und Hausnummer",
                                autoComplete: "street-address",
                                value: t.street,
                                onChange: (l) => C({ street: l.target.value }),
                              }),
                              e.jsx("input", {
                                className: "input",
                                "aria-label": "PLZ und Ort",
                                placeholder: "PLZ und Ort",
                                autoComplete: "postal-code",
                                value: t.city,
                                onChange: (l) => C({ city: l.target.value }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("fieldset", {
                        className: "field",
                        children: [
                          e.jsx("legend", {
                            className: "label field-label",
                            children: "PORTRÄT (OPTIONAL)",
                          }),
                          e.jsxs("div", {
                            className: "photo-row",
                            children: [
                              e.jsxs("div", {
                                className: "photo-box",
                                "aria-hidden": !t.photo,
                                children: [
                                  t.photo
                                    ? e.jsx("img", { src: t.photo, alt: "Dein Porträt" })
                                    : e.jsx("span", { className: "label", children: "3:4" }),
                                  e.jsx("span", {
                                    className: "photo-guide",
                                    "aria-hidden": "true",
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                className: "stack",
                                style: { flex: 1 },
                                children: [
                                  e.jsxs("label", {
                                    className: "btn btn-ghost file-btn",
                                    style: { alignSelf: "flex-start" },
                                    children: [
                                      t.photo ? "Anderes Foto wählen" : "Foto wählen",
                                      e.jsx("input", {
                                        type: "file",
                                        accept: "image/png,image/jpeg,image/webp",
                                        className: "file-overlay",
                                        onChange: (l) => {
                                          var z;
                                          return X((z = l.target.files) == null ? void 0 : z[0]);
                                        },
                                      }),
                                    ],
                                  }),
                                  t.photo &&
                                    e.jsx(U, {
                                      onClick: () => C({ photo: void 0 }),
                                      children: "Foto entfernen",
                                    }),
                                  e.jsx("p", {
                                    className: "small",
                                    children:
                                      "Hochformat 3:4. Deine Nasenspitze sitzt mittig, etwa auf Höhe der Markierung.",
                                  }),
                                  e.jsxs("p", {
                                    className: "small",
                                    children: [
                                      "Tipp: Bereite dein Porträt vorher mit dem",
                                      " ",
                                      e.jsx("a", {
                                        className: "link-44",
                                        href: Nn,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        children: "UNIO Makler-Zuschnitt",
                                      }),
                                      " ",
                                      "vor. Dann sitzt es überall richtig.",
                                    ],
                                  }),
                                  j && e.jsx("p", { className: "field-error", children: j }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "field",
                        children: R
                          ? e.jsx(K, {
                              ref: (l) => (h.current.legal = l),
                              label: "IMPRESSUM-ZEILE (OPTIONAL)",
                              value: t.legal ?? "",
                              onChange: (l) => C({ legal: l.target.value }),
                              onBlur: () => H("legal", (t.legal ?? "").length <= Mt),
                              error: r.legal,
                              help: "Steht klein im Briefpapier und in der Signatur, z. B. „Anna Berger Immobilien e.U., FN 123456a, Handelsgericht Wien“. Im Zweifel hilft dir die Wirtschaftskammer.",
                            })
                          : e.jsxs(U, {
                              onClick: () => F(!0),
                              children: [
                                e.jsx("span", {
                                  className: "glyph",
                                  "aria-hidden": "true",
                                  children: "+",
                                }),
                                " ",
                                "Impressum-Zeile ergänzen",
                              ],
                            }),
                      }),
                      !D &&
                        e.jsxs("div", {
                          className: "field",
                          children: [
                            e.jsx(ut, {
                              checked: t.unioPartner,
                              onChange: (l) => C({ unioPartner: l }),
                              describedBy: "circle-help",
                              children: "„Partner im UNIO CIRCLE“ auf Drucksachen zeigen",
                            }),
                            e.jsx("p", {
                              className: "field-help",
                              id: "circle-help",
                              children:
                                "Eine kleine Zeile am Rand von Visitenkarte, Briefpapier, Exposé und Schild.",
                            }),
                          ],
                        }),
                    ],
                  }),
              ],
            }),
            e.jsx("button", { type: "submit", hidden: !0 }),
            e.jsx("datalist", {
              id: "role-suggestions",
              children: yn.map((l) => e.jsx("option", { value: l }, l)),
            }),
          ],
        }),
        e.jsx("div", { className: "desk-only contact-preview-wrap", children: se }),
      ],
    }),
  });
}
const ye = new Map();
function Dn({ open: n, onClose: c, project: s }) {
  const { update: m, toast: b, state: g, announce: x } = pe(),
    w = () => ye.get(s.id) ?? s.object ?? dn(),
    [t, u] = o.useState(w),
    [r, S] = o.useState({}),
    [R, F] = o.useState(null),
    [y, P] = o.useState(!1),
    [D, $] = o.useState(!1),
    j = xt(t.photoIds),
    f = o.useRef(null),
    O = o.useRef(null),
    B = o.useId(),
    N = o.useId();
  o.useEffect(() => {
    n && (u(w()), S({}), F(null));
  }, [n]);
  const k = (a) => u((d) => ({ ...d, ...a })),
    A = (a) => u((d) => ({ ...d, energy: { ...d.energy, ...a } })),
    I = (a, d) =>
      u((v) => ({ ...v, facts: v.facts.map((E, T) => (T === a ? { ...E, ...d } : E)) })),
    h = async (a) => {
      if (!(a != null && a.length)) return;
      F(null);
      const d = _.photos - t.photoIds.length,
        v = Array.from(a).filter((X) => /^image\/(jpeg|png|webp)$/.test(X.type));
      (v.length < a.length && F("Nur Fotos im Format JPG, PNG oder WebP."),
        v.length > d && F(`Höchstens ${_.photos} Fotos. Die ersten ${d} haben wir übernommen.`),
        P(!0));
      const E = [];
      let T = !1;
      for (const X of v.slice(0, Math.max(0, d)))
        try {
          const se = pn();
          ((await fn(se, await bn(X))) || (T = !0), E.push(se));
        } catch {
          F("Ein Foto konnte nicht gelesen werden. Versuch es mit einem anderen Bild.");
        }
      (P(!1),
        T &&
          F(
            "Dein Browser speichert hier keine Fotos dauerhaft. Sie bleiben, bis du die Seite neu lädst.",
          ),
        E.length &&
          (u((X) => ({ ...X, photoIds: [...X.photoIds, ...E].slice(0, _.photos) })),
          x(`${E.length === 1 ? "1 Foto" : `${E.length} Fotos`} hinzugefügt.`)),
        f.current && (f.current.value = ""));
    },
    C = (a, d) =>
      u((v) => {
        const E = [...v.photoIds],
          [T] = E.splice(a, 1);
        return (E.splice(Math.max(0, Math.min(E.length, d)), 0, T), { ...v, photoIds: E });
      }),
    H = (a) => xn(Object.values(g.projects), a, { projectId: s.id, kit: !0 }),
    L = (a) => {
      var v;
      const d = t.photoIds[a];
      (k({ photoIds: t.photoIds.filter((E, T) => T !== a) }),
        !((v = s.object) != null && v.photoIds.includes(d)) && !H(d) && tt(d),
        x("Foto entfernt."));
    },
    ee = () => {
      var E;
      const a = hn(t);
      S(a);
      const d = Object.keys(a)[0];
      if (d) {
        ((d === "description" || d === "url" || d === "facts") && $(!0),
          d === "title" &&
            setTimeout(() => {
              var T;
              return (T = O.current) == null ? void 0 : T.focus();
            }, 30),
          x("Bitte prüf die markierten Felder.", !0));
        return;
      }
      const v = mn(t);
      for (const T of ((E = s.object) == null ? void 0 : E.photoIds) ?? [])
        !v.photoIds.includes(T) && !H(T) && tt(T);
      (m(s.id, (T) => ({ ...T, object: v })),
        ye.delete(s.id),
        b(
          Xe(v)
            ? "Objekt übernommen. Deine Vorlagen sind aktualisiert."
            : "Objekt übernommen. Für Anzeigen fehlt noch der Energieausweis.",
        ),
        c());
    },
    ue = () => {
      (ye.set(s.id, t), c());
    },
    q = !Xe(t),
    te = on(t.energy.eebKlasse ?? ""),
    ne = cn(t.energy.ausweisDatum) || (!!t.energy.fgee.trim() && !(t.energy.eeb ?? "").trim());
  return e.jsx(me, {
    open: n,
    onClose: ue,
    size: "mid",
    title: "Objekt eintragen",
    sub: "Für Flyer, Exposé, Inserate und Posts.",
    footer: e.jsxs(e.Fragment, {
      children: [
        e.jsx(V, { onClick: ue, children: "Später" }),
        e.jsx(Y, { onClick: ee, children: "Übernehmen" }),
      ],
    }),
    children: e.jsxs("form", {
      noValidate: !0,
      className: "object-form",
      onSubmit: (a) => {
        (a.preventDefault(), ee());
      },
      children: [
        e.jsxs("fieldset", {
          className: "field",
          children: [
            e.jsxs("legend", {
              className: "label field-label",
              children: ["FOTOS (BIS ZU ", _.photos, ")"],
            }),
            e.jsxs("div", {
              className: "obj-photos",
              children: [
                t.photoIds.map((a, d) =>
                  e.jsxs(
                    "figure",
                    {
                      className: "obj-photo",
                      children: [
                        j[a]
                          ? e.jsx("img", {
                              src: j[a],
                              alt: d === 0 ? "Titelbild" : `Foto ${d + 1}`,
                            })
                          : e.jsx("div", { className: "riffel skeleton" }),
                        d === 0 &&
                          e.jsx("figcaption", { className: "obj-cover", children: "Titelbild" }),
                        e.jsx(Oe, {
                          label: `Foto ${d + 1} bearbeiten`,
                          className: "btn btn-text obj-photo-menu",
                          placement: "below-end",
                          items: [
                            { label: "Als Titelbild", run: () => C(d, 0), show: d > 0 },
                            { label: "Nach vorn", run: () => C(d, d - 1), show: d > 1 },
                            {
                              label: "Nach hinten",
                              run: () => C(d, d + 1),
                              show: d < t.photoIds.length - 1,
                            },
                            { label: "Entfernen", run: () => L(d) },
                          ],
                          children: e.jsxs("svg", {
                            "aria-hidden": "true",
                            width: "16",
                            height: "4",
                            viewBox: "0 0 16 4",
                            children: [
                              e.jsx("circle", { cx: "2", cy: "2", r: "1.5", fill: "currentColor" }),
                              e.jsx("circle", { cx: "8", cy: "2", r: "1.5", fill: "currentColor" }),
                              e.jsx("circle", {
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
                    a,
                  ),
                ),
                t.photoIds.length < _.photos &&
                  e.jsxs("label", {
                    className: "obj-add btn btn-ghost file-btn",
                    children: [
                      y
                        ? "Wird verkleinert ..."
                        : t.photoIds.length
                          ? "Foto hinzufügen"
                          : "Fotos wählen",
                      e.jsx("input", {
                        ref: f,
                        type: "file",
                        multiple: !0,
                        accept: "image/jpeg,image/png,image/webp",
                        className: "file-overlay",
                        onChange: (a) => h(a.target.files),
                        disabled: y,
                      }),
                    ],
                  }),
              ],
            }),
            e.jsx("p", {
              className: "field-help",
              children: "Das erste Foto ist das Titelbild. Fotos bleiben in diesem Browser.",
            }),
            R && e.jsx("p", { className: "field-help", role: "status", children: R }),
          ],
        }),
        e.jsx(K, {
          ref: O,
          label: "TITEL",
          placeholder: "z. B. Dachgeschoss mit Weitblick",
          maxLength: _.title,
          value: t.title,
          onChange: (a) => (
            k({ title: a.target.value }),
            r.title && S((d) => ({ ...d, title: void 0 }))
          ),
          error: r.title,
        }),
        e.jsx(K, {
          label: "LAGE ODER ADRESSE",
          placeholder: "z. B. Währinger Straße 12, 1180 Wien",
          maxLength: _.address,
          autoComplete: "off",
          value: t.address,
          onChange: (a) => k({ address: a.target.value }),
          error: r.address,
        }),
        e.jsx(K, {
          label: "PREIS (OPTIONAL)",
          placeholder: "z. B. € 590.000 oder auf Anfrage",
          maxLength: _.price,
          value: t.price,
          onChange: (a) => k({ price: a.target.value }),
          error: r.price,
        }),
        e.jsxs("fieldset", {
          className: "field",
          "aria-describedby": N,
          children: [
            e.jsx("legend", { className: "label field-label", children: "ENERGIEAUSWEIS" }),
            e.jsxs("div", {
              className: "obj-energy",
              children: [
                e.jsx(K, {
                  label: "HWB (kWh/m²a)",
                  inputMode: "decimal",
                  placeholder: "z. B. 45",
                  value: t.energy.hwb,
                  onChange: (a) => A({ hwb: a.target.value }),
                  error: r.hwb,
                }),
                e.jsx(K, {
                  label: "EEB (kWh/m²a)",
                  inputMode: "decimal",
                  placeholder: "z. B. 62",
                  value: t.energy.eeb ?? "",
                  onChange: (a) => A({ eeb: a.target.value }),
                  error: r.eeb,
                }),
                e.jsxs("div", {
                  className: "field",
                  children: [
                    e.jsx("label", {
                      className: "label field-label",
                      htmlFor: `${N}-ek`,
                      children: "KLASSE",
                    }),
                    e.jsxs("select", {
                      id: `${N}-ek`,
                      className: "input",
                      value: te.klasse,
                      onChange: (a) => A({ eebKlasse: Ye(a.target.value, te.zusatz) }),
                      "aria-invalid": r.eebKlasse ? !0 : void 0,
                      children: [
                        e.jsx("option", { value: "", children: "Wählen" }),
                        Qe.map((a) => e.jsx("option", { value: a, children: a }, a)),
                      ],
                    }),
                  ],
                }),
                e.jsx(K, {
                  label: "ZUSATZ",
                  placeholder: "z. B. fossil",
                  maxLength: 20,
                  value: te.zusatz,
                  onChange: (a) => A({ eebKlasse: Ye(te.klasse, a.target.value) }),
                  error: r.eebKlasse,
                }),
                e.jsx(K, {
                  label: "AUSGESTELLT AM",
                  type: "date",
                  value: t.energy.ausweisDatum ?? "",
                  onChange: (a) => A({ ausweisDatum: a.target.value }),
                  error: r.ausweisDatum,
                }),
              ],
            }),
            ne &&
              e.jsxs("div", {
                className: "obj-energy obj-energy-alt",
                children: [
                  e.jsx("p", {
                    className: "small obj-energy-note",
                    children:
                      "Dein Ausweis ist vor dem 1. Juli 2026 ausgestellt. Nennt er noch keinen EEB, trag stattdessen fGEE und Klasse ein.",
                  }),
                  e.jsx(K, {
                    label: "fGEE",
                    inputMode: "decimal",
                    placeholder: "z. B. 0,85",
                    value: t.energy.fgee,
                    onChange: (a) => A({ fgee: a.target.value }),
                    error: r.fgee,
                  }),
                  e.jsxs("div", {
                    className: "field",
                    children: [
                      e.jsx("label", {
                        className: "label field-label",
                        htmlFor: `${N}-k`,
                        children: "ALTE KLASSE",
                      }),
                      e.jsxs("select", {
                        id: `${N}-k`,
                        className: "input",
                        value: t.energy.klasse,
                        onChange: (a) => A({ klasse: a.target.value }),
                        children: [
                          e.jsx("option", { value: "", children: "Wählen" }),
                          Qe.map((a) => e.jsx("option", { value: a, children: a }, a)),
                        ],
                      }),
                      r.klasse && e.jsx("p", { className: "field-error", children: r.klasse }),
                    ],
                  }),
                ],
              }),
            e.jsx("p", {
              className: "field-help",
              id: N,
              children: q
                ? "Seit 1. Juli 2026 gehören HWB, EEB und Effizienzklasse in jede Immobilienanzeige (Energieausweis-Vorlage-Gesetz). Du findest die Werte auf Seite 1 deines Energieausweises."
                : "Steht in allen Objekt-Vorlagen.",
            }),
          ],
        }),
        e.jsxs("details", {
          className: "disclosure contact-more",
          open: D,
          onToggle: (a) => $(a.currentTarget.open),
          children: [
            e.jsx("summary", { children: "Kennzahlen und weitere Angaben" }),
            D &&
              e.jsxs("div", {
                className: "disclosure-body",
                children: [
                  e.jsxs("fieldset", {
                    className: "field",
                    children: [
                      e.jsx("legend", { className: "label field-label", children: "KENNZAHLEN" }),
                      e.jsx("div", {
                        className: "obj-facts",
                        children: t.facts.map((a, d) =>
                          e.jsxs(
                            "div",
                            {
                              className: "obj-fact",
                              children: [
                                e.jsx("input", {
                                  className: "input",
                                  "aria-label": `Kennzahl ${d + 1}, Bezeichnung`,
                                  list: B,
                                  maxLength: _.factLabel,
                                  value: a.label,
                                  onChange: (v) => I(d, { label: v.target.value }),
                                }),
                                e.jsx("input", {
                                  className: "input",
                                  "aria-label": `Kennzahl ${d + 1}, Wert`,
                                  placeholder: un[a.label] ?? "Wert",
                                  maxLength: _.factValue,
                                  value: a.value,
                                  onChange: (v) => I(d, { value: v.target.value }),
                                }),
                                e.jsx(U, {
                                  className: "obj-fact-x",
                                  "aria-label": `Kennzahl ${a.label || d + 1} entfernen`,
                                  onClick: () => k({ facts: t.facts.filter((v, E) => E !== d) }),
                                  children: e.jsx("svg", {
                                    "aria-hidden": "true",
                                    width: "12",
                                    height: "12",
                                    viewBox: "0 0 12 12",
                                    children: e.jsx("path", {
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
                      e.jsx("datalist", {
                        id: B,
                        children: et.map((a) => e.jsx("option", { value: a }, a)),
                      }),
                      t.facts.length < _.facts &&
                        e.jsx(U, {
                          onClick: () =>
                            k({
                              facts: [
                                ...t.facts,
                                {
                                  label: et.find((a) => !t.facts.some((d) => d.label === a)) ?? "",
                                  value: "",
                                },
                              ],
                            }),
                          children: "Kennzahl hinzufügen",
                        }),
                      r.facts && e.jsx("p", { className: "field-error", children: r.facts }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "field",
                    children: [
                      e.jsx("label", {
                        className: "label field-label",
                        htmlFor: `${B}-d`,
                        children: "BESCHREIBUNG (OPTIONAL)",
                      }),
                      e.jsx("textarea", {
                        id: `${B}-d`,
                        className: "input",
                        rows: 4,
                        maxLength: _.description,
                        placeholder: "Zwei bis vier Sätze zum Objekt.",
                        value: t.description,
                        onChange: (a) => k({ description: a.target.value }),
                      }),
                      r.description &&
                        e.jsx("p", { className: "field-error", children: r.description }),
                    ],
                  }),
                  e.jsx(K, {
                    label: "OBJEKTSEITE (OPTIONAL)",
                    inputMode: "url",
                    placeholder: "z. B. berger-immobilien.at/objekt-12",
                    value: t.url,
                    onChange: (a) => k({ url: a.target.value }),
                    error: r.url,
                    help: "Ziel des QR-Codes auf Flyer und Inserat.",
                  }),
                ],
              }),
          ],
        }),
        e.jsx("button", { type: "submit", hidden: !0 }),
      ],
    }),
  });
}
const oe = [
  {
    key: "outlook-win",
    label: "Outlook (Windows)",
    steps: [
      "Öffne Outlook und klicke auf „Datei“ und dann „Optionen“.",
      "Wähle „E-Mail“ und dann „Signaturen“.",
      "Klicke auf „Neu“ und gib einen Namen ein, z. B. „Standard“.",
      "Klicke ins große Feld und füge ein (Strg+V).",
      "Wähle die Signatur rechts oben als Standard aus und klicke „OK“.",
    ],
  },
  {
    key: "outlook-mac",
    label: "Outlook (Mac)",
    steps: [
      "Öffne Outlook und klicke oben auf „Outlook“ und dann „Einstellungen“.",
      "Wähle „Signaturen“ und klicke auf „+“.",
      "Füge die Signatur ins Feld ein (Cmd+V).",
      "Wähle sie unten als Standard für neue Nachrichten.",
    ],
  },
  {
    key: "apple",
    label: "Apple Mail",
    steps: [
      "Öffne Mail, dann „Mail“ und „Einstellungen“.",
      "Wähle „Signaturen“ und klicke auf „+“.",
      "Entferne das Häkchen bei „Immer meine Standardschrift verwenden“.",
      "Füge die Signatur rechts ein (Cmd+V).",
    ],
  },
  {
    key: "gmail",
    label: "Gmail",
    steps: [
      "Öffne Gmail im Browser und klicke auf das Zahnrad, dann „Alle Einstellungen aufrufen“.",
      "Scrolle zu „Signatur“ und klicke auf „Neu erstellen“.",
      "Klicke ins Textfeld und füge ein (Strg+V oder Cmd+V).",
      "Klicke ganz unten auf „Änderungen speichern“. Fehlt das Logo? Füge im Signatur-Feld über das Bild-Symbol die Datei „signatur-logo.png“ aus deinem Brand Kit ein.",
    ],
  },
  {
    key: "iphone",
    label: "iPhone",
    steps: [
      "Öffne diese Seite am iPhone und tippe auf „Signatur kopieren“.",
      "Öffne „Einstellungen“, dann „Apps“, „Mail“ und „Signatur“.",
      "Lösche den alten Text und füge ein.",
      "Ist die Formatierung weg? Schüttle das iPhone und wähle „Attribute widerrufen“.",
    ],
  },
];
function On() {
  const n = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(n)
    ? "iphone"
    : /Macintosh/.test(n)
      ? "apple"
      : /Windows/.test(n)
        ? "outlook-win"
        : "gmail";
}
const In = (n) => {
  const c = document.createElement("div");
  return ((c.innerHTML = n), c.innerText || c.textContent || "");
};
function Fn({ open: n, onClose: c, loadHtml: s, onDownload: m }) {
  const { toast: b } = pe(),
    [g, x] = o.useState(null),
    [w, t] = o.useState(!1),
    [u, r] = o.useState(On),
    [S, R] = o.useState(!1),
    F = o.useRef(null),
    y = o.useRef({});
  o.useEffect(() => {
    if (!n) return;
    (R(!1), t(!1));
    let j = !0;
    return (
      s().then(
        (f) => j && x(f),
        () => j && t(!0),
      ),
      () => {
        j = !1;
      }
    );
  }, [n, s]);
  const P = async () => {
      if (g)
        try {
          if (navigator.clipboard && typeof ClipboardItem < "u") {
            (await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": new Blob([g], { type: "text/html" }),
                "text/plain": new Blob([In(g)], { type: "text/plain" }),
              }),
            ]),
              b("Signatur kopiert. Füge sie jetzt in deinem E-Mail-Programm ein."));
            return;
          }
          throw new Error("Clipboard API fehlt");
        } catch {
          const j = F.current;
          if (j) {
            const f = document.createRange();
            f.selectNodeContents(j);
            const O = window.getSelection();
            (O == null || O.removeAllRanges(), O == null || O.addRange(f));
            let B = !1;
            try {
              B = document.execCommand("copy");
            } catch {
              B = !1;
            }
            if ((O == null || O.removeAllRanges(), B)) {
              b("Signatur kopiert. Füge sie jetzt in deinem E-Mail-Programm ein.");
              return;
            }
          }
          R(!0);
        }
    },
    D = oe.findIndex((j) => j.key === u),
    $ = oe[D];
  return e.jsxs(me, {
    open: n,
    onClose: c,
    title: "E-Mail-Signatur einrichten",
    size: "mid",
    children: [
      e.jsx("div", {
        className: "sig-render",
        ref: F,
        children: g
          ? e.jsx("div", { dangerouslySetInnerHTML: { __html: g } })
          : w
            ? e.jsx("p", { children: "Diese Datei konnte nicht erstellt werden." })
            : e.jsx("div", { className: "riffel skeleton", style: { height: 120 } }),
      }),
      e.jsx("div", {
        className: "row",
        style: { marginTop: 20 },
        children: e.jsx(Y, { onClick: P, "aria-disabled": !g, children: "Signatur kopieren" }),
      }),
      S &&
        e.jsx("p", {
          className: "inline-note",
          role: "alert",
          style: { marginTop: 12 },
          children: "Markiere die Signatur oben und kopiere sie mit Strg+C (Mac: Cmd+C).",
        }),
      e.jsxs("div", {
        style: { marginTop: 28 },
        children: [
          e.jsx("div", {
            className: "tabs",
            role: "tablist",
            "aria-label": "E-Mail-Programm",
            style: { position: "static", margin: 0, padding: 0 },
            onKeyDown: (j) => {
              var O;
              let f = D;
              if (j.key === "ArrowRight") f = (D + 1) % oe.length;
              else if (j.key === "ArrowLeft") f = (D - 1 + oe.length) % oe.length;
              else return;
              (j.preventDefault(), r(oe[f].key), (O = y.current[oe[f].key]) == null || O.focus());
            },
            children: oe.map((j) =>
              e.jsxs(
                "button",
                {
                  ref: (f) => (y.current[j.key] = f),
                  type: "button",
                  role: "tab",
                  className: "tab",
                  id: `sig-tab-${j.key}`,
                  "aria-selected": j.key === u,
                  "aria-controls": "sig-panel",
                  tabIndex: j.key === u ? 0 : -1,
                  onClick: () => r(j.key),
                  children: [e.jsx("span", { className: "dot", "aria-hidden": "true" }), j.label],
                },
                j.key,
              ),
            ),
          }),
          e.jsx("div", {
            role: "tabpanel",
            id: "sig-panel",
            "aria-labelledby": `sig-tab-${u}`,
            style: { marginTop: 12 },
            children: e.jsx("ol", {
              className: "steps-list",
              children: $.steps.map((j, f) =>
                e.jsxs(
                  "li",
                  {
                    children: [
                      e.jsx("span", {
                        className: "label",
                        "aria-hidden": "true",
                        children: String(f + 1).padStart(2, "0"),
                      }),
                      e.jsx("span", { children: j }),
                    ],
                  },
                  f,
                ),
              ),
            }),
          }),
        ],
      }),
      e.jsxs("p", {
        style: { marginTop: 24 },
        children: [
          "Lieber als Datei?",
          " ",
          e.jsx(U, {
            onClick: m,
            style: { padding: "10px 0" },
            children: "Signatur als HTML herunterladen",
          }),
        ],
      }),
    ],
  });
}
function Tn({
  open: n,
  list: c,
  index: s,
  onIndex: m,
  onClose: b,
  assets: g,
  sample: x,
  meta: w,
  renderDownload: t,
}) {
  const u = c[s],
    [r, S] = o.useState(0);
  o.useEffect(() => S(0), [s]);
  const R = o.useMemo(() => {
    if (!u || !g || !n) return [];
    try {
      return u.pages ? u.pages(g) : [{ label: u.label, svg: u.preview(g) }];
    } catch (y) {
      return (console.warn(y), []);
    }
  }, [u, g, n]);
  if (
    (o.useEffect(() => {
      if (!n) return;
      const y = (P) => {
        P.target.closest('[role="radiogroup"], input') ||
          (P.key === "ArrowRight" && s < c.length - 1
            ? m(s + 1)
            : P.key === "ArrowLeft" && s > 0 && m(s - 1));
      };
      return (
        window.addEventListener("keydown", y),
        () => window.removeEventListener("keydown", y)
      );
    }, [n, s, c.length, m]),
    !u)
  )
    return null;
  const F = R[Math.min(r, R.length - 1)];
  return e.jsxs(me, {
    open: n,
    onClose: b,
    title: u.label,
    sub: u.description,
    size: "xl",
    footer: e.jsxs(e.Fragment, {
      children: [
        e.jsx(V, {
          "aria-disabled": s === 0,
          onClick: () => s > 0 && m(s - 1),
          children: "← Vorherige",
        }),
        e.jsx(V, {
          "aria-disabled": s >= c.length - 1,
          onClick: () => s < c.length - 1 && m(s + 1),
          children: "Nächste →",
        }),
        e.jsx("span", { className: "spacer" }),
        t(u),
      ],
    }),
    children: [
      R.length > 1 &&
        e.jsx("div", {
          style: { marginBottom: 16 },
          children: e.jsx(ot, {
            options: R.map((y, P) => ({ value: String(P), label: y.label })),
            value: String(r),
            onChange: (y) => S(Number(y)),
            label: "Seite oder Variante",
          }),
        }),
      e.jsxs("div", {
        className: "big-preview",
        role: "img",
        "aria-label": `Vorschau ${u.label}${F ? `, ${F.label}` : ""}`,
        children: [
          x(u) && e.jsx("span", { className: "example-tag", children: "BEISPIELDATEN" }),
          F
            ? e.jsx("div", {
                className: "mock-svg",
                dangerouslySetInnerHTML: { __html: Ie(F.svg) },
              })
            : e.jsx("p", { children: "Diese Datei konnte nicht erstellt werden." }),
        ],
      }),
      w && e.jsx("p", { className: "label preview-meta", children: w(u) }),
    ],
  });
}
function Pn({ projectId: n, objects: c }) {
  const { navigate: s } = pe();
  return e.jsxs("div", {
    className: "ps-entry",
    id: "kit-postings",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("h3", { children: "Postings" }),
          e.jsx("p", {
            className: "small",
            children:
              "Fertige Bilder und Bildtext zu deinen Objekten: neu, reserviert, verkauft und mehr.",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "row",
        children: [
          e.jsx(V, {
            onClick: () => s({ name: "postings", id: n }),
            children: "Postings erstellen",
          }),
          e.jsx(U, {
            onClick: () => s({ name: "objekte", id: n }),
            children: c ? `Objekte (${c})` : "Objekt anlegen",
          }),
        ],
      }),
    ],
  });
}
const Ne = 3,
  nt = [
    {
      key: "logo",
      no: "01",
      title: "Logo",
      intro: "Dein Logo in allen Varianten. Für fast alles reicht PNG.",
    },
    {
      key: "online",
      no: "02",
      title: "Online",
      intro: "Für E-Mail, Instagram, LinkedIn und Facebook.",
    },
    {
      key: "druck",
      no: "03",
      title: "Drucksachen",
      intro: "Druckfertige PDFs, der Rand für den Zuschnitt ist schon drin.",
    },
    {
      key: "guide",
      no: "04",
      title: "Brand Guide",
      intro: "Alle Regeln deiner Marke auf einen Blick.",
    },
  ],
  ce = (n) => /signatur|signature/i.test(`${n.id} ${n.label}`),
  Bn = (n) => /profil|profile|favicon|icon/i.test(n.id);
function zn(n) {
  return n.group === "logo" || Bn(n)
    ? "logo"
    : n.group === "social" || n.group === "digital"
      ? "online"
      : n.group === "print"
        ? "druck"
        : "guide";
}
const Ce = (n) => n.variant === "unio";
function Se(n, c, s = !1) {
  const m = (g) => {
    if (!c || !g.available) return !0;
    try {
      return g.available(c);
    } catch {
      return !0;
    }
  };
  if (!s && !sn()) return [];
  const b = [...ft(s), ...(c ? an(c) : [])].filter((g) => zn(g) === n && m(g));
  return n === "online" ? [...b.filter(ce), ...b.filter((g) => !ce(g))] : b;
}
function An(n, c) {
  const s = n.formats.filter((b) => b !== "txt"),
    m = n.group === "print" && !/druckfertig/i.test(n.sizeLabel) ? " · DRUCKFERTIG" : "";
  return `${s.join(" · ").toUpperCase()} · ${n.sizeLabel.toUpperCase().replace(/ X /g, " × ")}${m}`;
}
const st = (n) => {
    var c;
    return ((c = n.split(".").pop()) == null ? void 0 : c.toLowerCase()) ?? "";
  },
  at = new Map();
async function De(n, c, s, m) {
  const b = `${m}|${n.id}|${s ?? "*"}`,
    g = at.get(b);
  if (g) return g;
  let x = n.plan ? n.plan(c) : null,
    w;
  if (x) {
    if (s) {
      const t = x.filter((u) => st(u.path) === s);
      x = n.group === "logo" ? t.slice(0, 1) : t;
    }
    w = [];
    for (const t of x) w.push({ path: t.path, mime: t.mime, data: await t.make() });
  } else ((w = await n.exportFiles(c)), s && (w = w.filter((t) => st(t.path) === s)));
  return (at.set(b, w), w);
}
function Ln(n) {
  const c = n.reduce(
    (s, m) =>
      s +
      (m.mime.includes("png")
        ? 0.12
        : m.mime.includes("pdf")
          ? 0.15
          : m.mime.includes("svg")
            ? 0.03
            : 0.01),
    0,
  );
  return Math.max(1, Math.round(c));
}
const Mn = () =>
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
  Rn = {
    "logo-color": "Für helle Flächen, Word und Web.",
    "logo-reverse": "Für dunkle Flächen und Fotos.",
    "logo-mono-dark": "Für Druck in nur einer Farbe.",
    "logo-mono-light": "Einfarbig weiß, für Fotos.",
    "logo-symbol": "Für Stempel und kleine Flächen.",
    favicon: "Für Browser-Tab und Handy.",
    "email-signature": "Für Outlook, Apple Mail und Gmail.",
    "social-profile": "Für Instagram, LinkedIn, WhatsApp.",
    "social-new": "Für neue Objekte auf Instagram.",
    "social-sold": "Zeig, was du vermittelt hast.",
    "social-viewing": "Lade zur Besichtigung ein.",
    "social-intro": "Stell dich mit Porträt vor.",
    "social-story": "Hochformat für Storys.",
    "social-linkedin": "Das Bild oben im LinkedIn-Profil.",
    "social-facebook": "Titelbild deiner Facebook-Seite.",
    "business-card": "Für die Druckerei, mit QR-Code.",
    letterhead: "Für Angebote und Briefe.",
    expose: "Die erste Seite deines Exposés.",
    sign: "Für Fenster, Balkon und Bauzaun.",
    "brand-guide": "Für alle, die für dich gestalten.",
    markenplattform: "Claim, Story und Ton für Texter.",
    "flyer-a5-v1": "Postwurf-Flyer, Objekt zuerst.",
    "flyer-a5-v2": "Postwurf-Flyer mit großem Bild.",
    "zeitung-a4-v1": "Für die Gemeindezeitung.",
    "zeitung-a4-v2": "Gemeindezeitung, du zuerst.",
    "inserat-a4": "Wie die Objektseite auf unio.at.",
    "aushang-a4": "Fürs Schwarze Brett, zum Abreißen.",
    "plakat-a1": "Groß, für das Schaufenster.",
    "magazin-a4": "Im Magazin-Stil mit Bildstrecke.",
    "gesicht-a4": "Beginnt mit deinem Porträt.",
    faltschild: "Aufsteller für Besichtigung und Open House.",
    banner: "Für Bauzaun und Fassade, weit lesbar.",
  };
function $n(n) {
  const c = n.id.replace(/^unio-/, ""),
    s = Rn[c];
  if (s) return s;
  const m = n.description.split(new RegExp("(?<=\\.)\\s"))[0] ?? n.description;
  return m.length <= 34 ? m : `${m.slice(0, 31).replace(/\s+\S*$/, "")} ...`;
}
function jt(n) {
  return n.group === "logo"
    ? "png"
    : n.group === "print" || n.group === "guide"
      ? n.formats.includes("pdf")
        ? "pdf"
        : null
      : n.group === "social" && n.formats.includes("png")
        ? "png"
        : null;
}
const Wn = {
  png: "für Word und WhatsApp",
  svg: "für Website und Grafiker",
  pdf: "für die Druckerei",
  ico: "für den Browser",
};
function Kn(n, c, s) {
  const [m, b] = o.useState(!1),
    [g, x] = o.useState(!1);
  return {
    busy: m,
    error: g,
    run: async (t) => {
      (b(!0), x(!1));
      try {
        const u = await De(n, c, t, s);
        if (!u.length) throw new Error("Keine Datei");
        for (const [r, S] of u.entries()) setTimeout(() => Ee(S), r * 350);
      } catch (u) {
        (console.warn(u), x(!0));
      } finally {
        b(!1);
      }
    },
  };
}
function kt({ d: n, assets: c, cacheKey: s, fmt: m, withMenu: b = !0, primary: g }) {
  const { busy: x, error: w, run: t } = Kn(n, c, s),
    u = n.formats.filter((S) => !["txt", "html"].includes(S)),
    r = n.sizeLabel.replace(/ x /gi, " × ");
  return g
    ? e.jsxs(e.Fragment, {
        children: [
          e.jsx(Y, {
            onClick: () => !x && t(m),
            "aria-disabled": x,
            "aria-label": `${n.label} herunterladen${m ? ` als ${m.toUpperCase()}` : ""}`,
            children: x ? "Wird erstellt ..." : "Herunterladen",
          }),
          w &&
            e.jsx("span", {
              role: "alert",
              className: "small",
              children: "Diese Datei konnte nicht erstellt werden.",
            }),
        ],
      })
    : e.jsxs(e.Fragment, {
        children: [
          e.jsxs("span", {
            className: "split-btn",
            children: [
              e.jsx(V, {
                onClick: () => !x && t(m),
                "aria-disabled": x,
                "aria-label": `${n.label} herunterladen${m ? ` als ${m.toUpperCase()}` : ""}`,
                children: x ? "Wird erstellt ..." : "Herunterladen",
              }),
              b &&
                u.length > 1 &&
                e.jsx(Oe, {
                  label: `Andere Formate für ${n.label}`,
                  className: "btn btn-ghost split-arrow",
                  placement: "below-end",
                  items: u.map((S) => ({
                    label: `${S.toUpperCase()} · ${Wn[S] ?? r}`,
                    run: () => t(S),
                  })),
                  children: e.jsx("svg", {
                    "aria-hidden": "true",
                    width: "12",
                    height: "12",
                    viewBox: "0 0 12 12",
                    children: e.jsx("path", {
                      d: "M2.5 4.5 6 8l3.5-3.5",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "1.5",
                    }),
                  }),
                }),
            ],
          }),
          w &&
            e.jsxs("span", {
              role: "alert",
              className: "row",
              children: [
                e.jsx("span", {
                  className: "small",
                  style: { color: "var(--ink)" },
                  children: "Diese Datei konnte nicht erstellt werden.",
                }),
                e.jsx(U, { onClick: () => t(m), children: "Erneut versuchen" }),
              ],
            }),
        ],
      });
}
function it(n) {
  return n.split(new RegExp("(?<=\\.) (?=[A-ZÄÖÜ][^:.]{2,24}: )")).map((c) => {
    const s = c.split(":")[0].trim();
    return {
      label: s && s.length <= 24 && s !== c.trim() ? s.toLocaleUpperCase("de-AT") : "ANGABE FEHLT",
      text: c.trim(),
    };
  });
}
function Gn({
  d: n,
  assets: c,
  ready: s,
  needsContact: m,
  sample: b,
  cacheKey: g,
  onOpen: x,
  onContact: w,
  onSignature: t,
  ownLabel: u,
}) {
  const r = o.useRef(null),
    [S, R] = o.useState(null),
    F = S === n.id || (!!c && s && !!ln(n, c, { width: bt }));
  o.useEffect(() => {
    const k = r.current;
    if (!k) return;
    const A = n.id,
      I = new IntersectionObserver(
        (h) => h.some((C) => C.isIntersecting) && (R(A), I.disconnect()),
        { rootMargin: "400px" },
      );
    return (I.observe(k), () => I.disconnect());
  }, [n.id]);
  const y = pt(F ? n : void 0, c, s),
    P = !!y.svg && y.id === n.id,
    D = !!y.svg && !P && !y.error,
    $ = P,
    j = ce(n),
    f = Ce(n),
    O = b && !f && (n.needsContact || j),
    [B, N] = o.useState(null);
  return (
    o.useEffect(() => {
      if ((N(null), !s || !F || (!f && !n.missingInfo) || !$)) return;
      if (y.hints) {
        const I = y.hints,
          h = [];
        (I.missing && h.push(...it(I.missing)),
          f && I.logo && h.push({ label: "LOGO ANGEPASST", text: I.logo }),
          f && I.text && h.push({ label: "TEXT VERKLEINERT", text: I.text }),
          N(h));
        return;
      }
      let k = !0;
      const A = wn(() => {
        var h, C, H;
        if (!k) return;
        const I = [];
        try {
          const L = (h = n.missingInfo) == null ? void 0 : h.call(n, c);
          L && I.push(...it(L));
        } catch {}
        if (!f) return N(I);
        try {
          const L = (C = n.logoAdjusted) == null ? void 0 : C.call(n, c);
          L && I.push({ label: "LOGO ANGEPASST", text: L });
        } catch {}
        try {
          const L = (H = n.textAdjusted) == null ? void 0 : H.call(n, c);
          L && I.push({ label: "TEXT VERKLEINERT", text: L });
        } catch {}
        N(I);
      });
      return () => {
        ((k = !1), A());
      };
    }, [f, s, F, n, c, y.hints, $]),
    e.jsxs("article", {
      className: "kit-tile",
      ref: r,
      id: `tile-${n.id}`,
      tabIndex: -1,
      "aria-label": n.label,
      children: [
        e.jsxs("button", {
          type: "button",
          className: D ? "kt-preview is-stale" : "kt-preview",
          "aria-busy": D || void 0,
          onClick: x,
          "aria-label": `${n.label} groß ansehen`,
          children: [
            O && e.jsx("span", { className: "example-tag", children: "BEISPIELDATEN" }),
            y.svg && (P || D)
              ? e.jsx("div", {
                  className: "mock-svg",
                  dangerouslySetInnerHTML: { __html: Ie(y.svg) },
                })
              : y.error
                ? e.jsx("span", { className: "small", children: "Vorschau nicht verfügbar" })
                : e.jsx("div", {
                    className: "riffel skeleton",
                    style: { width: "100%", height: "100%" },
                  }),
          ],
        }),
        e.jsxs("div", {
          className: "kt-body",
          children: [
            u && e.jsx("p", { className: "label kt-own", children: "EIGENES DESIGN" }),
            e.jsx("h3", { className: "kt-title", children: n.label }),
            e.jsx("p", {
              className: "small kt-purpose",
              children: m ? "Braucht noch deine Kontaktdaten." : $n(n),
            }),
            B == null
              ? void 0
              : B.map((k) =>
                  e.jsxs(
                    "span",
                    {
                      className: "label tip kt-tip",
                      tabIndex: 0,
                      "data-tip": k.text,
                      children: [
                        k.label,
                        e.jsxs("span", { className: "sr-only", children: [": ", k.text] }),
                      ],
                    },
                    k.label,
                  ),
                ),
          ],
        }),
        e.jsx("div", {
          className: "kt-actions",
          children: m
            ? e.jsx(V, { onClick: () => w(r.current), children: "Ergänzen" })
            : j
              ? e.jsx(V, { onClick: t, children: "Signatur einrichten" })
              : e.jsx(kt, { d: n, assets: c, cacheKey: g, fmt: jt(n) }, n.id),
        }),
      ],
    })
  );
}
function Un(n) {
  return An(n);
}
function ss({ projectId: n }) {
  var Ge, Ue, Ve;
  const {
      state: c,
      update: s,
      navigate: m,
      toast: b,
      announce: g,
      requestPersist: x,
      setHelpOpen: w,
    } = pe(),
    t = c.projects[n],
    u = t.selected;
  o.useEffect(() => {
    u || m({ name: "auswahl", id: n, gemerkt: !1 }, { replace: !0 });
  }, [u, m, n]);
  const r = he() && t.templateSet === "unio",
    S = !!(
      ((Ge = t.selected) != null && Ge.signature) ||
      (t.editing &&
        t.editing.concept.id === ((Ue = t.selected) == null ? void 0 : Ue.id) &&
        t.editing.base.signature)
    ),
    [R, F] = o.useState(!1);
  o.useEffect(() => {
    if (r || !he()) return;
    const i = setTimeout(() => F(!0), 1500);
    return () => clearTimeout(i);
  }, [r]);
  const y = dt(r || R),
    P = gt(!r),
    D = r || P,
    [$, j] = o.useState(r);
  D && $ !== r && j(r);
  const f = o.useMemo(() => (D ? ft(r) : []), [r, D]),
    O = (i) => {
      (s(n, (p) => ({ ...p, templateSet: i, templateChosen: !0 })),
        i !== t.templateSet &&
          g(i === "own" ? "Unterlagen in deinem eigenen Design." : "Unterlagen im UNIO-Design."));
    },
    B = o.useMemo(() => rt(t), [t.contact, t.legalForm, t.legalFormInLogo, t.rawName]),
    N = lt(t.contact),
    k = ht(u, t.input),
    A = xt(((Ve = t.object) == null ? void 0 : Ve.photoIds) ?? []),
    I = o.useMemo(() => gn(t.object, A), [t.object, A]),
    h = o.useMemo(
      () =>
        u
          ? {
              ...mt(u, t.input, B),
              ...(I ? { object: I } : {}),
              ...(t.route ? { route: t.route } : {}),
            }
          : null,
      [u, t.input, B, I, t.route],
    ),
    C = o.useMemo(
      () => JSON.stringify([u, t.input, B, t.object, Object.keys(A).length]),
      [u, t.input, B, t.object, A],
    ),
    [H, L] = o.useState(!1),
    ee = o.useRef(null),
    [ue, q] = o.useState(!1),
    [te, ne] = o.useState(!1),
    [a, d] = o.useState(null),
    [v, E] = o.useState({ phase: "idle" }),
    [T, X] = o.useState(!1),
    [se, l] = o.useState(!1),
    [z, J] = o.useState(!1),
    [ae, vt] = o.useState({}),
    Fe = o.useRef(null),
    xe = o.useRef(0),
    wt = o.useMemo(() => {
      if (!h || !k) return [];
      try {
        return we(f, h, !0);
      } catch (i) {
        return (console.warn("Dateiplan nicht verfügbar", i), []);
      }
    }, [h, k, f]),
    yt = o.useMemo(() => {
      if (!h || !k) return [];
      try {
        return we(f, h, !1);
      } catch (i) {
        return (console.warn("Dateiplan nicht verfügbar", i), []);
      }
    }, [h, k, f]),
    fe = N ? wt : yt,
    Te = o.useMemo(() => {
      const i = N ? [] : f.filter((p) => p.needsContact);
      if (h && k)
        try {
          if (!D) throw new Error("Eigenes Design wird geladen");
          const p = Jt(h, { unio: r });
          return { count: p.count, labels: p.labels };
        } catch (p) {
          console.warn("Zählung fehlender Dateien", p);
        }
      return { count: i.length, labels: i.map((p) => p.label) };
    }, [h, k, N, f, r, D]),
    Pe = N ? 0 : Te.count,
    je = N ? "" : Te.labels.join(", "),
    de = (i) => {
      ((ee.current = i ?? null), L(!0));
    },
    Nt = () => {
      L(!1);
      const i = ee.current;
      setTimeout(() => {
        var p;
        i && i.isConnected
          ? i.focus()
          : (p =
              document.getElementById("contact-enter") ??
              document.querySelector(".kit-head .menu-wrap > button")) == null || p.focus();
      }, 80);
    },
    ke = o.useCallback(
      async (i) => {
        if (!h) return;
        ne(!1);
        const p = new AbortController();
        ((Fe.current = p), (xe.current = 0));
        let M = [];
        try {
          M = we(f, h, i).map((G) => 1 + qt(G));
        } catch {
          M = [];
        }
        const le = M.reduce((G, W) => G + W, 0),
          Z = (G, W) => {
            if (M.length !== W || !le) return W ? (G / W) * 100 : 0;
            let re = 0;
            for (let Q = 0; Q < G; Q++) re += M[Q];
            return (re / le) * 100;
          };
        (E({ phase: "running", done: 0, total: fe.length || 1, pct: 0 }), kn("kit:zip:start"));
        try {
          const G = await Xt(h, {
            includeContact: i,
            unio: r,
            signal: p.signal,
            onProgress: (Q, He) => {
              if (p.signal.aborted) return;
              const Ze = Z(Q, He);
              E({ phase: "running", done: Q, total: He, pct: Ze });
              const ve = [25, 50, 75].find((_e) => Ze >= _e && xe.current < _e);
              ve && ((xe.current = ve), g(`ZIP ${ve} Prozent erstellt.`));
            },
          });
          if (p.signal.aborted) return;
          vn("kit:zip", "kit:zip:start");
          const W = `${qe(`${t.input.name} ${t.input.suffix ?? ""}`)}_brand-kit.zip`;
          (Ee({ path: W, data: G, mime: "application/zip" }), E({ phase: "done" }), Gt());
          const re =
            !i && je
              ? `Fertig. Die ZIP-Datei liegt in deinen Downloads. Ohne Kontaktdaten fehlen noch: ${je}.`
              : "Fertig. Die ZIP-Datei liegt in deinen Downloads.";
          (b(re, i ? void 0 : { label: "Kontaktdaten eintragen", run: () => de(null) }),
            g(re),
            t.kitDone || X(!0),
            s(n, (Q) => ({ ...Q, kitDone: !0, persistRequested: !0 })),
            x());
        } catch (G) {
          if (p.signal.aborted) {
            E({ phase: "idle" });
            return;
          }
          (console.error(G), E({ phase: "error" }));
        }
      },
      [h, fe.length, f, t.input, t.kitDone, n, s, b, g, x, je, r],
    ),
    Be = v.phase === "running",
    ze = o.useRef(r);
  o.useEffect(() => {
    if (!h || !k || !D || Be) return;
    const i = new AbortController(),
      p = () =>
        jn(h, { includeContact: N, unio: r }, i.signal).catch((Z) => {
          i.signal.aborted || console.warn("ZIP-Vorbereitung abgebrochen", Z);
        }),
      M = ze.current !== r;
    ze.current = r;
    const le = M ? setTimeout(p, 2e3) : (p(), void 0);
    return () => {
      (clearTimeout(le), i.abort());
    };
  }, [h, k, D, N, r, Be]);
  const Ae = !r || se;
  (o.useEffect(() => {
    if (!Ae || !h || !k || !he()) return;
    let i = !0;
    const p = () => {
        if (!i) return;
        const le = nt
          .filter((Z) => Z.key !== "logo")
          .flatMap((Z) => Se(Z.key, h, !r).slice(0, ae[Z.key] ? void 0 : Ne));
        nn(le, h, { width: bt }).catch(() => {});
      },
      M = setTimeout(() => (r ? Qt().then(p, () => {}) : p()), r ? 0 : 1e3);
    return () => {
      ((i = !1), clearTimeout(M));
    };
  }, [Ae, r, h, k, ae]),
    o.useEffect(() => () => Yt(), [n]));
  const St = () => {
      v.phase !== "running" && (!N && Pe > 0 ? ne(!0) : ke(N));
    },
    Le = () => {
      var i;
      ((i = Fe.current) == null || i.abort(), E({ phase: "idle" }));
    },
    ge = f.find(ce),
    Me = o.useCallback(async () => {
      if (!h) throw new Error("Kein Logo");
      try {
        return await en(h, r);
      } catch (M) {
        console.warn("Signatur mit PNG-Logo nicht möglich", M);
      }
      try {
        return tn(h, r);
      } catch (M) {
        console.warn("Signatur nicht möglich", M);
      }
      if (!ge) throw new Error("Signatur fehlt");
      const p = (await De(ge, h, "html", C))[0];
      if (!p) throw new Error("Signatur fehlt");
      return typeof p.data == "string" ? p.data : await new Blob([p.data]).text();
    }, [h, C, r, ge]),
    Et = async () => {
      try {
        if (ge && h) {
          const i = await De(ge, h, "html", C);
          if (i[0]) return Ee(i[0]);
        }
        Ht(`${qe(t.input.name)}_email-signatur.html`, await Me(), "text/html");
      } catch {
        b("Diese Datei konnte nicht erstellt werden.");
      }
    };
  if (!u || !h) return null;
  const ie = v.phase === "running",
    Re = ie ? Math.round(v.pct) : 0,
    Ct = ie ? `Wird erstellt: ${v.done} von ${v.total}` : "Alles herunterladen",
    Dt = fe.length ? `Alles in einer ZIP-Datei · ca. ${Ln(fe)} MB` : "Alles in einer ZIP-Datei",
    $e = (i) =>
      e.jsxs(Y, {
        onClick: St,
        busy: ie,
        "aria-describedby": i ? void 0 : "zip-meta",
        knob: ie ? `${Re}` : "→",
        style: i ? void 0 : { position: "relative", overflow: "hidden" },
        children: [
          i && !ie ? "Alles herunterladen" : Ct,
          ie &&
            e.jsx("span", {
              className: "progress-line",
              style: { width: `${Re}%` },
              "aria-hidden": "true",
            }),
        ],
      }),
    We = Zt(u.palette.primary) < 0.2 ? u.palette.primary : u.palette.ink,
    Ot = a ? Se(a.section, h, $) : [],
    Ke =
      r && y.fallback
        ? "Die UNIO-Hausschrift ist gerade nicht verfügbar. Die Vorschau zeigt eine ähnliche Schrift."
        : r && y.error
          ? "Die UNIO-Schriften konnten nicht geladen werden. Lade die Seite neu."
          : null,
    It = (i) => !N && !Ce(i) && (i.needsContact || ce(i)),
    Ft = () => m({ name: "logo", id: n, conceptId: t.selectedBaseId ?? u.id, tab: t.ui.editorTab }),
    Tt = e.jsx(Oe, {
      label: "Mehr",
      menuLabel: "Mehr zum Brand Kit",
      placement: "below-start",
      items: [
        { label: "Logo bearbeiten", run: Ft },
        { label: "Kontaktdaten ändern", run: () => de(null), show: N },
        { label: t.object ? "Objekt ändern" : "Objekt eintragen", run: () => J(!0), show: r },
        { label: "Weitere Optionen", run: () => l(!0) },
      ],
    });
  return e.jsxs("div", {
    className: "screen kit-screen",
    children: [
      e.jsxs("div", {
        className: "container",
        children: [
          e.jsxs("div", {
            className: "kit-head",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h1", {
                    className: "h1",
                    "data-title": "Brand Kit",
                    children: "Dein Brand Kit ist bereit.",
                  }),
                  e.jsx("p", {
                    className: "lead kit-lead",
                    children: "Alles für deinen Auftritt, als ZIP oder einzeln.",
                  }),
                  e.jsxs("div", {
                    className: "actions",
                    children: [
                      e.jsx("span", { className: "desk-flex", children: $e(!1) }),
                      ie &&
                        e.jsx(U, { onClick: Le, className: "desk-only", children: "Abbrechen" }),
                      Tt,
                    ],
                  }),
                  e.jsx("p", { className: "small zip-note", id: "zip-meta", children: Dt }),
                  S && e.jsx(Ut, {}),
                  e.jsxs("div", {
                    "aria-live": "polite",
                    children: [
                      v.phase === "error" &&
                        e.jsxs("div", {
                          className: "inline-note",
                          role: "alert",
                          style: { marginTop: 12 },
                          children: [
                            e.jsx("p", {
                              children:
                                "Das ZIP konnte nicht erstellt werden. Versuch es noch einmal oder lade die Dateien einzeln herunter.",
                            }),
                            e.jsx(V, { onClick: () => ke(N), children: "Erneut versuchen" }),
                          ],
                        }),
                      v.phase === "done" &&
                        Mn() &&
                        e.jsx("p", {
                          className: "inline-note",
                          style: { marginTop: 12 },
                          children:
                            "Auf iPhone und iPad findest du die Datei in der App „Dateien“ unter „Downloads“.",
                        }),
                      T &&
                        e.jsx("p", {
                          className: "small",
                          style: { marginTop: 12 },
                          children:
                            "Gut gemacht. Deine Marke bleibt in diesem Browser gespeichert.",
                        }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                className: "kit-hero",
                style: { background: We },
                children: e.jsx(rn, {
                  concept: u,
                  input: t.input,
                  tagline: t.showTaglineInLogo,
                  variant: "reverse",
                  ground: We,
                  label: `Dein Logo: ${ct(t)}`,
                  fallbackText: !0,
                }),
              }),
            ],
          }),
          !N &&
            e.jsxs("div", {
              className: "contact-line",
              children: [
                e.jsx("p", {
                  children: "Für Visitenkarte und Signatur fehlen noch deine Kontaktdaten.",
                }),
                e.jsx(V, {
                  id: "contact-enter",
                  onClick: (i) => de(i.currentTarget),
                  children: "Eintragen",
                }),
              ],
            }),
          nt.map((i) => {
            var G;
            const p = Se(i.key, h, $),
              M = !!ae[i.key],
              le = M ? p : p.slice(0, Ne),
              Z = i.key !== "logo";
            return e.jsxs(
              "section",
              {
                className: "kit-section",
                id: `kit-${i.key}`,
                "aria-labelledby": `kit-h-${i.key}`,
                children: [
                  i.key === "online" &&
                    he() &&
                    !$ &&
                    e.jsxs("div", {
                      className: "own-line",
                      children: [
                        e.jsx("p", { children: "Deine Unterlagen sind im eigenen Design." }),
                        e.jsx(U, {
                          onClick: () => O("unio"),
                          children: "Zum UNIO-Design wechseln",
                        }),
                      ],
                    }),
                  e.jsxs("div", {
                    className: "sec-head",
                    children: [
                      e.jsxs("h2", {
                        className: "h2",
                        id: `kit-h-${i.key}`,
                        tabIndex: -1,
                        children: [i.no, " ", i.title],
                      }),
                      e.jsx("p", { className: "small", children: i.intro }),
                      i.key === "logo" &&
                        e.jsx(U, {
                          className: "sec-help",
                          onClick: () => w(!0, "format"),
                          children: "Welches Format?",
                        }),
                      Z && Ke && e.jsx("p", { className: "small", children: Ke }),
                      i.key === "druck" &&
                        r &&
                        e.jsxs("p", {
                          className: "small obj-line",
                          children: [
                            t.object
                              ? `Objekt: ${t.object.title}`
                              : "Flyer und Inserate zeigen ein Beispielobjekt.",
                            " ",
                            e.jsx(U, {
                              onClick: () => J(!0),
                              children: t.object ? "Ändern" : "Objekt eintragen",
                            }),
                          ],
                        }),
                    ],
                  }),
                  p.length
                    ? e.jsxs(e.Fragment, {
                        children: [
                          e.jsx("div", {
                            className: "kit-grid",
                            children: le.map((W, re) =>
                              e.jsx(
                                Gn,
                                {
                                  d: W,
                                  assets: h,
                                  ready: k && (!Ce(W) || y.ready),
                                  ownLabel: Z && !$ && he(),
                                  needsContact: !N && (W.needsContact || ce(W)),
                                  sample: !N,
                                  cacheKey: C,
                                  onOpen: () => d({ section: i.key, index: re }),
                                  onContact: (Q) => de(Q),
                                  onSignature: () => q(!0),
                                },
                                Z ? `${i.key}-${re}` : W.id,
                              ),
                            ),
                          }),
                          p.length > Ne &&
                            e.jsx(V, {
                              className: "kit-all",
                              "aria-expanded": M,
                              onClick: () => vt((W) => ({ ...W, [i.key]: !M })),
                              children: M ? "Weniger zeigen" : `Alle ${p.length} zeigen`,
                            }),
                        ],
                      })
                    : e.jsx("p", { className: "small", children: "Wird gerade vorbereitet." }),
                  i.key === "online" &&
                    e.jsx(Pn, {
                      projectId: n,
                      objects: ((G = t.library) == null ? void 0 : G.objects.length) ?? 0,
                    }),
                ],
              },
              i.key,
            );
          }),
        ],
      }),
      e.jsx(me, {
        open: se,
        onClose: () => l(!1),
        title: "Weitere Optionen",
        size: "mid",
        footer: e.jsx(Y, { onClick: () => l(!1), children: "Fertig" }),
        children: e.jsxs("div", {
          className: "stack",
          children: [
            e.jsx(ut, {
              checked: !r,
              onChange: (i) => O(i ? "own" : "unio"),
              describedBy: "own-design-help",
              children: "Eigenes Design nutzen",
            }),
            e.jsx("p", {
              className: "small",
              id: "own-design-help",
              children:
                "Statt der UNIO-Vorlagen: alles in deinen eigenen Farben und Schriften. Dein Logo bleibt gleich.",
            }),
          ],
        }),
      }),
      e.jsxs(Vt, {
        children: [ie ? e.jsx(U, { onClick: Le, children: "Abbrechen" }) : null, $e(!0)],
      }),
      e.jsx(Cn, { open: H, onClose: Nt, project: t }),
      e.jsx(Dn, { open: z, onClose: () => J(!1), project: t }),
      e.jsx(Fn, { open: ue, onClose: () => q(!1), loadHtml: Me, onDownload: Et }),
      e.jsx(me, {
        open: te,
        onClose: () => ne(!1),
        title: `${Pe} Dateien brauchen noch deine Kontaktdaten`,
        footer: e.jsxs(e.Fragment, {
          children: [
            e.jsx(V, { onClick: () => ke(!1), children: "Ohne diese Dateien herunterladen" }),
            e.jsx(Y, {
              onClick: () => {
                (ne(!1), de(null));
              },
              children: "Kontaktdaten eintragen",
            }),
          ],
        }),
        children: e.jsx("p", {
          children:
            "Visitenkarte, Briefpapier, Exposé-Deckblatt und E-Mail-Signatur wären sonst leer. Trag deine Daten ein oder lade erst einmal alles andere herunter.",
        }),
      }),
      e.jsx(Tn, {
        open: !!a,
        list: Ot,
        index: (a == null ? void 0 : a.index) ?? 0,
        onIndex: (i) => d((p) => p && { ...p, index: i }),
        onClose: () => d(null),
        assets: h,
        sample: It,
        meta: Un,
        renderDownload: (i) =>
          !N && (i.needsContact || ce(i))
            ? e.jsx(Y, {
                onClick: () => {
                  (d(null), de(null));
                },
                children: "Kontaktdaten eintragen",
              })
            : ce(i)
              ? e.jsx(Y, {
                  onClick: () => {
                    (d(null), q(!0));
                  },
                  children: "Signatur einrichten",
                })
              : e.jsx(kt, { d: i, assets: h, cacheKey: C, fmt: jt(i), primary: !0 }),
      }),
    ],
  });
}
export { ss as default, Un as metaOf, it as missingTips, $n as purposeOf };
