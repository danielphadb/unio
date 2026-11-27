import {
  u as Cn,
  r as i,
  a9 as be,
  aa as Sn,
  ab as K,
  ac as E,
  ad as ve,
  j as s,
  q as W,
  v as P,
  ae as wn,
  P as Y,
  T as R,
  G as Ve,
  af as En,
  ag as Ln,
  R as An,
  D as ke,
  ah as In,
  C as Ze,
  m as Tn,
  c as Rn,
  b as Mn,
  ai as Dn,
  s as Fn,
  aj as zn,
} from "./index-BER2gtDe.js";
import {
  t as Ge,
  e as On,
  k as Bn,
  f as Hn,
  B as xe,
  c as We,
  b as Pe,
  g as $n,
  h as V,
  i as Kn,
  m as Vn,
  N as _e,
  A as qe,
  C as Gn,
  H as Wn,
} from "./nameFinder-CLppxXuz.js";
import { u as Pn, S as _n, K as qn, a as Un, N as Zn } from "./NameCard-BpHDImep.js";
import { S as Jn } from "./describe-CrBWccON.js";
import "./svg-CrwnZnJY.js";
import "./engine-BhDRZEfO.js";
import "./LogoView-CG3DXWdO.js";
const Yn = [
    { value: "wohnen", label: "Wohnungen" },
    { value: "haeuser", label: "Häuser" },
    { value: "luxus", label: "Luxus" },
    { value: "anleger", label: "Anleger" },
    { value: "gewerbe", label: "Gewerbe" },
  ],
  Qn = () => typeof matchMedia < "u" && matchMedia("(min-width: 760px)").matches;
function Xn() {
  const [r, h] = i.useState(Qn);
  return (
    i.useEffect(() => {
      const f = matchMedia("(min-width: 760px)"),
        k = () => h(f.matches);
      return (f.addEventListener("change", k), () => f.removeEventListener("change", k));
    }, []),
    r
  );
}
const G = (r) =>
    JSON.stringify([
      r.person.trim(),
      r.company.trim(),
      r.region.trim(),
      r.focus,
      r.style,
      r.keywords.trim(),
      r.description.trim(),
      r.chips,
      r.creativity,
      ve(r.exclude),
      r.maxLength,
      r.route ? `${r.route.territory}|${r.route.params.seed}` : "",
    ]),
  Ne = "unio-brand:namefinder-registry";
function es() {
  try {
    const r = sessionStorage.getItem(Ne),
      h = r ? JSON.parse(r) : [];
    return new Map(
      h
        .filter((f) => f && typeof f.id == "string" && typeof f.name == "string")
        .map((f) => [f.id, f]),
    );
  } catch {
    return new Map();
  }
}
function ns(r) {
  try {
    sessionStorage.setItem(Ne, JSON.stringify([...r.values()].slice(-200)));
  } catch {}
}
function ss({ name: r, onSend: h, onClose: f }) {
  const [k, b] = i.useState(""),
    [_, g] = i.useState("");
  return s.jsx(ke, {
    open: !0,
    onClose: f,
    title: "Was passt nicht?",
    sub: `Zu „${r}“. Bleibt in deinem Browser. Damit lernen die nächsten Vorschläge.`,
    footer: s.jsxs("div", {
      className: "row",
      style: { justifyContent: "flex-end", gap: 12 },
      children: [
        s.jsx(R, { onClick: f, children: "Überspringen" }),
        s.jsx(Y, { onClick: () => h(k || null, _.trim()), children: "Senden" }),
      ],
    }),
    children: s.jsxs("div", {
      className: "reason-body",
      children: [
        s.jsx(Ze, {
          options: Wn.map((p) => ({ value: p, label: p })),
          value: k,
          onChange: b,
          label: "Grund",
        }),
        s.jsx(W, {
          label: "EIGENE WORTE (OPTIONAL)",
          maxLength: 120,
          value: _,
          onChange: (p) => g(P(p.target.value)),
        }),
      ],
    }),
  });
}
function ds({ route: r }) {
  var Be, He, $e;
  const { navigate: h, put: f, toast: k, announce: b, requestPersist: _ } = Cn(),
    { gemerkt: g } = r,
    p = Xn(),
    [t, Je] = i.useState(be),
    [je, M] = i.useState(!1),
    [Ye, ie] = i.useState(() => !be().submitted),
    [re, le] = i.useState(null),
    ye = i.useRef(null),
    Ce = i.useRef(null),
    c = i.useCallback((e) => {
      Je((n) => {
        const a = e(n);
        return (Sn(a), a);
      });
    }, []),
    oe = i.useRef(t);
  oe.current = t;
  const [d, Q] = i.useState(() => {
      const e = be();
      return e.submitted && K(e) ? { key: G(e), d: e } : null;
    }),
    ce = i.useCallback(
      (e) => {
        c((n) => {
          const a = { ...n, seed: e ? (n.seed * 1103515245 + 12345) >>> 0 : n.seed, submitted: !0 };
          return ((a.batches = [E(a)]), Q({ key: G(a), d: a }), a);
        });
      },
      [c],
    );
  i.useEffect(() => {
    if (!p || !K(t) || (d && d.key === G(t))) return;
    const e = setTimeout(() => ce(!1), 400);
    return () => clearTimeout(e);
  }, [p, G(t)]);
  const y = i.useMemo(() => (d && d.d.style !== "egal" ? [d.d.style] : []), [d]),
    C = i.useMemo(() => (d ? Ge(d.d) : null), [d]),
    X = t.batches.length ? t.batches : d ? [E(d.d)] : [],
    Qe = JSON.stringify(X),
    v = i.useMemo(() => (d && C ? On(C, { ...d.d, seed: t.seed }, X) : []), [d, C, t.seed, Qe]),
    Se = i.useMemo(() => new Set(t.hidden.map((e) => e.id)), [t.hidden]),
    we = i.useMemo(
      () => new Set(t.hidden.map((e) => e.name.toLocaleLowerCase("de-AT"))),
      [t.hidden],
    ),
    z = i.useCallback((e) => Se.has(e.id) || we.has(e.name.toLocaleLowerCase("de-AT")), [Se, we]),
    N = i.useMemo(() => v.flat().filter((e) => !z(e)), [v, z]),
    ee = v.reduce((e, n) => e + n.length, 0),
    ne = Pn(),
    D = ne.kiFunktionen && d && C ? JSON.stringify([d.key, t.seed]) : null,
    [L, Xe] = i.useState(null);
  i.useEffect(() => {
    if (!D || !d || !C) return;
    const e = Bn(
      d.d,
      (v[0] ?? []).map((a) => a.name),
      t.saved.map((a) => a.name),
    );
    if (!e) return;
    let n = !0;
    return (
      Hn(D, e, C).then((a) => n && Xe({ key: D, items: a })),
      () => {
        n = !1;
      }
    );
  }, [D]);
  const O = i.useMemo(() => {
      if (!L || L.key !== D || !L.items) return [];
      const e = new Set(N.map((n) => n.name.toLocaleLowerCase("de-AT")));
      return L.items.filter((n) => !z(n) && !e.has(n.name.toLocaleLowerCase("de-AT"))).slice(0, 12);
    }, [L, D, N, z]),
    en = !!L && L.key === D && L.items === null,
    nn = v.length > 0 && v[v.length - 1].length < xe,
    de = i.useRef(0);
  i.useEffect(() => {
    (ee > de.current && b(`${ee - de.current} Namensvorschläge geladen.`), (de.current = ee));
  }, [ee, b]);
  const B = i.useRef(new Map()),
    [, sn] = i.useState(0),
    q = ne.intern && ne.signatureEntwuerfe,
    F = (Be = d == null ? void 0 : d.d.route) == null ? void 0 : Be.params,
    H = (e) => `${e}|${y.join(",")}|${q ? "e" : ""}|${F ? `${F.territory}|${F.seed}` : ""}`,
    ue = i.useCallback((e) => B.current.get(H(e.id)) ?? null, [y, q, F]),
    se = i.useCallback(
      (e) => {
        const n = e.filter((l) => !B.current.has(H(l.s.id)));
        if (!n.length) return () => {};
        let a = 0;
        const m = requestAnimationFrame(() => {
          a = window.setTimeout(() => {
            const l = new Map();
            for (const o of n)
              B.current.has(H(o.s.id)) || l.set(o.seed, [...(l.get(o.seed) ?? []), o.s]);
            for (const [o, T] of l) {
              let x = [];
              try {
                x = We(T, o, y, q, F);
              } catch (j) {
                console.warn("Namenskarten ohne finale Logos", j);
              }
              T.forEach((j, Ke) => B.current.set(H(j.id), x[Ke] ?? Pe(j, Ke, o, y)));
            }
            sn((o) => o + 1);
          }, 0);
        });
        return () => {
          (cancelAnimationFrame(m), clearTimeout(a));
        };
      },
      [y, q, F],
    ),
    U = i.useMemo(() => t.saved.map($n), [t.saved]),
    tn = g ? U : N;
  i.useEffect(() => {
    const e = [];
    return (
      v.forEach((n, a) => n.forEach((m, l) => e.push({ s: m, i: l, seed: V(t.seed, a) }))),
      U.forEach((n, a) => e.push({ s: n, i: a, seed: V(t.seed, 99) })),
      O.forEach((n, a) => e.push({ s: n, i: a, seed: V(t.seed, 500) })),
      se(e)
    );
  }, [v, U, O, t.seed, se]);
  const A = i.useRef(es());
  for (const e of N) A.current.set(e.id, e);
  for (const e of O) A.current.set(e.id, e);
  for (const e of U) A.current.has(e.id) || A.current.set(e.id, e);
  const he = i.useMemo(() => new Set(t.saved.map((e) => e.id)), [t.saved]),
    an = E(t).liked.length,
    Ee = () => {
      if (!K(t)) {
        (M(!0),
          ie(!0),
          setTimeout(() => {
            var e;
            return (e = ye.current) == null ? void 0 : e.focus();
          }, 30),
          b(
            "Gib mindestens deinen Namen, deine Region oder ein Stichwort ein. Dann passen die Vorschläge zu dir.",
            !0,
          ));
        return;
      }
      (M(!1),
        ce(t.submitted),
        p ||
          (ie(!1),
          setTimeout(() => {
            var e;
            return (e = Ce.current) == null ? void 0 : e.focus();
          }, 60)));
    },
    Le = i.useCallback(
      (e) => {
        const n = oe.current.saved.some((a) => a.id === e.id);
        (c((a) => ({
          ...a,
          saved: n
            ? a.saved.filter((m) => m.id !== e.id)
            : [...a.saved.filter((m) => m.id !== e.id), Kn(e)],
        })),
          n || (b(`„${e.name}“ gemerkt.`), _()));
      },
      [c, b, _],
    ),
    rn = (e) => {
      const n = Array.from(document.querySelectorAll(".nf-main .wm-card")),
        a = n.findIndex((l) => l.dataset.id === e),
        m = n[a + 1] ?? n[a - 1];
      requestAnimationFrame(() => {
        var l;
        return (l = m == null ? void 0 : m.querySelector(".wm-open")) == null ? void 0 : l.focus();
      });
    },
    Ae = i.useCallback(
      (e) => {
        (rn(e.id),
          c((n) => ({
            ...n,
            hidden: [...n.hidden.filter((a) => a.id !== e.id), { id: e.id, name: e.name }],
            saved: n.saved.filter((a) => a.id !== e.id),
          })),
          b(`„${e.name}“ ausgeblendet.`),
          k(
            "Ausgeblendet. Wir zeigen dir weniger davon.",
            {
              label: "Rückgängig",
              run: () => c((n) => ({ ...n, hidden: n.hidden.filter((a) => a.id !== e.id) })),
            },
            { label: "Grund angeben", run: () => le(e) },
          ));
      },
      [c, b, k],
    ),
    ln = (e, n, a) => {
      (c((m) => {
        var T;
        const l = {
            ...m,
            hidden: m.hidden.map((x) =>
              x.id === e.id
                ? { ...x, reason: [n, a].filter(Boolean).join(": ").slice(0, 120) || void 0 }
                : x,
            ),
          },
          o = e.name.replace(/[^\p{L}]/gu, "").length;
        if (
          (n === "Zu lang" && (l.lenCap = Math.max(5, Math.min(l.lenCap ?? 25, o - 2))),
          n === "Zu verspielt" &&
            (l.damp = [...new Set([...l.damp, "markenfaehig", "abgewandelt", "satz"])]),
          n === "Gibt es schon")
        ) {
          const x =
            (T = e.name.split(/[\s&-]+/).find((j) => j.length >= 4)) == null
              ? void 0
              : T.toLocaleLowerCase("de-AT");
          x && (l.autoExclude = [...new Set([...l.autoExclude, x])].slice(0, 20));
        }
        return l;
      }),
        le(null),
        k("Danke. Die nächsten Vorschläge berücksichtigen das."));
    },
    on = () => {
      (c((e) => {
        const n = {
          ...e,
          learnIgnore: e.saved.map((a) => a.id),
          lenCap: null,
          damp: [],
          autoExclude: [],
        };
        return ((n.batches = [E(n)]), Q((a) => a && { ...a, d: { ...a.d } }), n);
      }),
        b("Gewichtung zurückgesetzt."));
    },
    Ie = i.useCallback(() => {
      c((e) =>
        e.batches.length >= 50
          ? e
          : { ...e, batches: [...(e.batches.length ? e.batches : [E(e)]), E(e)] },
      );
    }, [c]),
    cn = i.useCallback(
      (e, n = "at") => {
        var a;
        try {
          (a = navigator.clipboard) == null || a.writeText(e).catch(() => {});
        } catch {}
        (window.open(
          n === "com" ? "https://lookup.icann.org" : "https://www.nic.at",
          "_blank",
          "noopener,noreferrer",
        ),
          k(
            n === "com"
              ? `„${e}“ kopiert. Füge die Adresse bei ICANN Lookup ins Suchfeld ein.`
              : `„${e}“ kopiert. Füge die Adresse bei nic.at ins Suchfeld ein.`,
          ));
      },
      [k],
    ),
    dn = (e, n) => {
      const a = Rn(e.suffix),
        m = e.kind === "person" ? "person" : t.company.trim() ? "company" : void 0,
        l = Ge(t);
      let o = Mn({
        rawName: e.name,
        suffixChoice: a.choice,
        customSuffix: a.custom,
        keepLegalForm: !0,
        nameKind: m,
        place: l.region,
      });
      const T = Dn(l);
      ((o = {
        ...o,
        nameCandidates: t.saved.map((j) => ({ name: j.name, descriptor: j.suffix, kind: j.kind })),
        ...(T ? { nameContext: T } : {}),
        fromFinder: !0,
      }),
        t.route &&
          (o = {
            ...o,
            route: t.route,
            input: { ...o.input, route: t.route.params },
            ...(t.brief ? { brief: t.brief } : {}),
          }));
      const x = n ? n.style : t.style === "egal" ? null : t.style;
      (x && (o = Fn(o, x)),
        n && (o = { ...o, pinned: n, favorites: [n], numbers: { [n.id]: 1 } }),
        f(o),
        zn());
      try {
        sessionStorage.removeItem(Ne);
      } catch {}
      (h({ name: "name", id: o.id }, { replace: !0 }),
        h(x ? { name: "auswahl", id: o.id, gemerkt: !1 } : { name: "stil", id: o.id }));
    },
    S = { name: "names", gemerkt: g, kinds: r.kinds },
    me = i.useCallback((e, n) => h({ ...S, detail: e.id, mehr: n || void 0 }), [h, g]),
    un = i.useCallback((e) => me(e, !0), [me]),
    [hn, mn] = i.useState([]);
  i.useEffect(() => {
    const e = r.detail;
    mn((n) => {
      if (!e) return [];
      const a = n.indexOf(e);
      return a >= 0 ? n.slice(0, a + 1) : r.mehr && n.length ? [...n, e] : [e];
    });
  }, [r.detail, r.mehr]);
  const u = r.detail ? A.current.get(r.detail) : void 0,
    fe = i.useRef(void 0);
  (i.useEffect(() => {
    if (r.detail) {
      fe.current = r.detail;
      return;
    }
    const e = fe.current;
    e &&
      ((fe.current = void 0),
      requestAnimationFrame(() => {
        var n;
        return (n = document.querySelector(`.wm-card[data-id="${CSS.escape(e)}"] .wm-open`)) == null
          ? void 0
          : n.focus();
      }));
  }, [r.detail]),
    i.useEffect(() => {
      r.detail && !u && h(S, { replace: !0 });
    }, [r.detail, u]));
  const [te, Te] = i.useState(1);
  i.useEffect(() => Te(1), [r.detail]);
  const w = i.useMemo(() => {
    if (!u || !C) return [];
    const e = E(t),
      n = [];
    for (let a = 0; a < te; a++)
      n.push(
        ...Vn(u, C, xe, {
          page: a,
          creativity: "direkt",
          exclude: [...ve(t.exclude), ...e.autoExclude],
          disliked: e.disliked,
        }),
      );
    return n.filter((a) => !z(a));
  }, [u, C, te, z]);
  for (const e of w) A.current.set(e.id, e);
  i.useEffect(() => ns(A.current));
  const Re = u ? V(t.seed, 1e3 + (u.id.length % 7)) : 0;
  i.useEffect(() => se(w.map((e, n) => ({ s: e, i: n, seed: Re }))), [w, Re, se]);
  const Me = i.useRef(0);
  (i.useEffect(() => {
    (u && w.length && w.length !== Me.current && b(`Varianten von „${u.name}“ geladen.`),
      (Me.current = w.length));
  }, [w.length, u, b]),
    u &&
      !B.current.has(H(u.id)) &&
      B.current.set(H(u.id), We([u], V(t.seed, 0), y, q, F)[0] ?? Pe(u, 0, V(t.seed, 0), y)));
  const Z = g ? U : N,
    I = u ? Z.findIndex((e) => e.id === u.id) : -1,
    fn = p || Ye,
    gn = [t.person, t.region, t.keywords].filter((e) => e.trim()).join(" · "),
    J = t.maxLength ?? 25,
    ge = (e) => c((n) => ({ ...n, maxLength: e >= 25 ? null : Math.max(5, e) })),
    De = (He = Ue.find((e) => e.key === t.creativity)) == null ? void 0 : He.hint,
    [Fe, $] = i.useState(null),
    ze =
      (t.company.trim() ? 1 : 0) +
      t.focus.length +
      (t.style !== "egal" ? 1 : 0) +
      (t.creativity !== "ausgewogen" ? 1 : 0) +
      (t.exclude.trim() ? 1 : 0) +
      (t.maxLength ? 1 : 0) +
      (t.description.trim() ? 1 : 0),
    pn = s.jsxs("form", {
      className: "nf-bar",
      noValidate: !0,
      onSubmit: (e) => {
        (e.preventDefault(), Ee());
      },
      children: [
        s.jsx(W, {
          ref: ye,
          label: "DEIN NAME",
          autoComplete: "name",
          autoCapitalize: "words",
          placeholder: "z. B. Anna Berger",
          value: t.person,
          onChange: (e) => {
            (M(!1), c((n) => ({ ...n, person: P(e.target.value) })));
          },
          "aria-describedby": je ? "nf-error" : void 0,
        }),
        s.jsx(wn, {
          label: "REGION",
          placeholder: "z. B. Döbling",
          value: t.region,
          onChange: (e) => {
            (M(!1), c((n) => ({ ...n, region: e })));
          },
        }),
        s.jsx(W, {
          label: "STICHWORTE",
          placeholder: "z. B. Altbau, Familie",
          maxLength: 60,
          value: t.keywords,
          onChange: (e) => {
            (M(!1), c((n) => ({ ...n, keywords: P(e.target.value) })));
          },
        }),
        p &&
          s.jsx("div", {
            className: "nf-submit",
            children: s.jsx(Y, { type: "submit", children: "Vorschlagen" }),
          }),
        s.jsx("button", { type: "submit", hidden: !0 }),
      ],
    }),
    bn = ["personenmarke", "ortsbezug", "zusammengesetzt"],
    Oe = _e.filter((e) =>
      e.needs === "person"
        ? !!t.person.trim()
        : e.needs === "region"
          ? !!(t.region.trim() || t.description.trim())
          : !0,
    ),
    xn = Oe.filter((e) => bn.includes(e.slug)),
    pe = (e) =>
      c((n) => {
        const a = {
          ...n,
          chips:
            e === "alle"
              ? []
              : n.chips.includes(e)
                ? n.chips.filter((m) => m !== e)
                : [...n.chips, e],
        };
        return (!p && a.submitted && K(a) && ((a.batches = [E(a)]), Q({ key: G(a), d: a })), a);
      }),
    vn = t.chips.length
      ? t.chips.length === 1
        ? ((($e = _e.find((e) => e.slug === t.chips[0])) == null ? void 0 : $e.label) ??
          "1 gewählt")
        : `${t.chips.length} gewählt`
      : "Alle",
    kn = (e) => h({ name: "names", gemerkt: e, kinds: r.kinds }, { replace: !0 }),
    Nn = d && !g && N.length === 0 && ve(t.exclude).length > 0,
    ae = (e) =>
      s.jsx(
        Zn,
        {
          s: e,
          concept: ue(e),
          intern: ne.intern,
          styles: y,
          saved: he.has(e.id),
          desktop: p,
          onOpen: me,
          onSave: Le,
          onHide: Ae,
          onMore: un,
        },
        e.id,
      ),
    jn = s.jsxs("div", {
      className: "nf-tools",
      children: [
        s.jsx("div", {
          className: "chips nf-quick",
          role: "group",
          "aria-label": "Namensart, schnell",
          children: xn.map((e) =>
            s.jsx(
              "button",
              {
                type: "button",
                className: "chip",
                "aria-pressed": t.chips.includes(e.slug),
                onClick: () => pe(e.slug),
                children: e.label,
              },
              e.slug,
            ),
          ),
        }),
        s.jsxs(R, {
          onClick: () => $("art"),
          "aria-haspopup": "dialog",
          children: ["Namensart: ", vn],
        }),
        s.jsxs(R, {
          onClick: () => $("fein"),
          "aria-haspopup": "dialog",
          children: ["Feiner einstellen", ze ? ` (${ze})` : ""],
        }),
      ],
    }),
    yn = s.jsxs("section", {
      className: "nf-results",
      "aria-labelledby": "nf-results-h",
      children: [
        s.jsxs("div", {
          className: "nf-results-head",
          children: [
            s.jsx("h2", {
              className: "h2",
              id: "nf-results-h",
              ref: Ce,
              tabIndex: -1,
              children: g ? "Gemerkte Namen" : "Deine Namensvorschläge",
            }),
            (g || t.saved.length > 0) &&
              s.jsx(R, {
                onClick: () => kn(!g),
                "aria-pressed": g,
                children: g ? "Alle Vorschläge" : `Gemerkt (${t.saved.length})`,
              }),
          ],
        }),
        !g && jn,
        an >= 3 &&
          !g &&
          s.jsxs("p", {
            className: "small nf-learn",
            children: [
              "Vorschläge angepasst an deine Favoriten. ",
              s.jsx(R, { onClick: on, children: "Zurücksetzen" }),
            ],
          }),
        g
          ? t.saved.length
            ? s.jsx("div", { className: "wm-grid nf-list", children: tn.map(ae) })
            : s.jsx("div", {
                className: "empty-state",
                children: s.jsx("p", {
                  children: "Noch keinen Namen gemerkt. Tippe bei einem Vorschlag auf das Herz.",
                }),
              })
          : d
            ? Nn
              ? s.jsx("div", {
                  className: "empty-state",
                  children: s.jsx("p", {
                    children:
                      "Mit deiner Ausschlussliste bleibt kaum etwas übrig. Nimm ein Wort heraus oder stell die Kreativität auf „Frei“.",
                  }),
                })
              : N.length === 0
                ? s.jsxs("div", {
                    className: "empty-state",
                    children: [
                      s.jsx("p", {
                        children:
                          "Mit deinen Angaben finden wir für diese Namensart nichts. Probier eine andere oder ergänze ein Stichwort.",
                      }),
                      s.jsx(Ve, { onClick: () => pe("alle"), children: "Alle Namensarten zeigen" }),
                    ],
                  })
                : s.jsxs(s.Fragment, {
                    children: [
                      s.jsxs("div", {
                        className: "wm-grid nf-list nf-main",
                        children: [
                          (v[0] && O.length ? N.slice(0, v[0].length) : N).map(ae),
                          O.length > 0 &&
                            s.jsxs(s.Fragment, {
                              children: [
                                s.jsx("h3", {
                                  className: "label nf-ki-head",
                                  children: "IDEEN DER KI",
                                }),
                                O.map(ae),
                                N.slice(v[0].length).map(ae),
                              ],
                            }),
                        ],
                      }),
                      en &&
                        s.jsx("p", {
                          className: "small muted ai-off",
                          role: "status",
                          children: "KI-Namensideen gerade nicht verfügbar.",
                        }),
                      !nn &&
                        (X.length < qe
                          ? s.jsx(_n, { onHit: Ie }, X.length)
                          : s.jsx("div", {
                              className: "gallery-more",
                              children: s.jsx(Ve, { onClick: Ie, children: "24 weitere Namen" }),
                            })),
                    ],
                  })
            : s.jsx("div", {
                className: "nf-empty",
                children: s.jsx("p", {
                  className: "small",
                  children: "Hier erscheinen deine Namen, jeder gleich als fertiger Schriftzug.",
                }),
              }),
      ],
    });
  return s.jsxs("div", {
    className: "container screen nf-screen",
    children: [
      s.jsxs("div", {
        className: "nf-entry",
        children: [
          s.jsx("a", {
            className: "back-link",
            href: "#/neu/name",
            onClick: (e) => {
              (e.preventDefault(), h({ name: "new" }));
            },
            children: "Ich habe schon einen Namen →",
          }),
          s.jsx(En, {
            onStart: () => {
              const e = oe.current;
              (Ln({ person: e.person, place: e.region, focus: e.focus }),
                h({ name: "kompass", step: 1 }));
            },
          }),
        ],
      }),
      s.jsx("h1", {
        className: "h1",
        "data-title": "Namen finden",
        children: "Finde deinen Markennamen.",
      }),
      s.jsx("p", {
        className: "lead nf-lead",
        children: "Wir schlagen Namen vor und zeigen jeden gleich als Logo.",
      }),
      je &&
        s.jsx("p", {
          className: "field-error",
          role: "alert",
          id: "nf-error",
          children:
            "Gib mindestens deinen Namen, deine Region oder ein Stichwort ein. Dann passen die Vorschläge zu dir.",
        }),
      fn
        ? pn
        : s.jsxs("div", {
            className: "nf-summary",
            children: [
              s.jsx("span", { children: gn || "Deine Angaben" }),
              s.jsx(R, { onClick: () => ie(!0), children: "Ändern" }),
            ],
          }),
      t.route &&
        s.jsx("div", {
          className: "chips nf-route",
          role: "group",
          "aria-label": "Vorgabe aus dem Markenkompass",
          children: s.jsxs("button", {
            type: "button",
            className: "chip is-on",
            "aria-label": `Richtung ${t.route.titel} entfernen`,
            onClick: () => {
              (c((e) => {
                const { route: n, brief: a, ...m } = e,
                  l = { ...m, batches: e.submitted ? [E(m)] : [] };
                return (l.submitted && K(l) && Q({ key: G(l), d: l }), l);
              }),
                b("Richtung entfernt. Die Vorschläge sind wieder frei."));
            },
            children: [
              "Richtung: ",
              t.route.titel,
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
          }),
        }),
      yn,
      s.jsx(An, {
        children: s.jsx(Y, {
          onClick: Ee,
          children: t.submitted ? "Neue Vorschläge" : "Namen vorschlagen",
        }),
      }),
      s.jsx(ke, {
        open: Fe === "art",
        onClose: () => $(null),
        title: "Namensart",
        size: "mid",
        footer: s.jsx(Y, { onClick: () => $(null), children: "Fertig" }),
        children: s.jsx("div", {
          className: "option-list",
          role: "group",
          "aria-label": "Namensart",
          children: [
            { slug: "alle", label: "Alle", example: "Alle Stile gemischt", hint: void 0 },
            ...Oe,
          ].map((e) =>
            s.jsxs(
              "button",
              {
                type: "button",
                className: "option-row",
                "aria-pressed": e.slug === "alle" ? !t.chips.length : t.chips.includes(e.slug),
                onClick: () => pe(e.slug),
                children: [
                  s.jsx("span", { className: "opt-main", children: e.label }),
                  s.jsx("span", {
                    className: "small opt-ex",
                    children:
                      e.hint ??
                      e.example
                        .replace(/^Z\. B\. /, "z. B. ")
                        .replace(
                          /^z\. B\. (.*)$/,
                          (n, a) => `z. B. ${a.charAt(0)}${a.slice(1).toLocaleLowerCase("de-AT")}`,
                        ),
                  }),
                ],
              },
              e.slug,
            ),
          ),
        }),
      }),
      s.jsx(ke, {
        open: Fe === "fein",
        onClose: () => $(null),
        title: "Feiner einstellen",
        size: "mid",
        footer: s.jsx(Y, {
          onClick: () => {
            ($(null), !p && t.submitted && K(t) && ce(!1));
          },
          children: "Übernehmen",
        }),
        children: s.jsxs("div", {
          className: "stack nf-fine",
          children: [
            s.jsx(W, {
              label: "FIRMA (OPTIONAL)",
              placeholder: "z. B. Seeblick Realitäten",
              maxLength: 80,
              autoComplete: "organization",
              value: t.company,
              onChange: (e) => {
                (M(!1), c((n) => ({ ...n, company: P(e.target.value) })));
              },
              help: "Hast du schon eine Firma? Dann bauen wir Varianten davon.",
            }),
            s.jsxs("fieldset", {
              className: "field",
              children: [
                s.jsx("legend", { className: "label field-label", children: "DEIN SCHWERPUNKT" }),
                s.jsx(In, {
                  options: Yn,
                  values: t.focus,
                  onToggle: (e) =>
                    c((n) => ({
                      ...n,
                      focus: n.focus.includes(e) ? n.focus.filter((a) => a !== e) : [...n.focus, e],
                    })),
                  label: "Dein Schwerpunkt",
                }),
              ],
            }),
            s.jsxs("fieldset", {
              className: "field",
              children: [
                s.jsx("legend", { className: "label field-label", children: "WELCHE WIRKUNG?" }),
                s.jsx(Ze, {
                  options: [
                    { value: "egal", label: "Egal" },
                    ...Jn.map((e) => ({ value: e.key, label: e.title })),
                  ],
                  value: t.style,
                  onChange: (e) => c((n) => ({ ...n, style: e })),
                  label: "Welche Wirkung?",
                }),
              ],
            }),
            s.jsxs("div", {
              className: "field",
              children: [
                s.jsx("span", {
                  className: "label field-label",
                  id: "nf-creativity",
                  children: "WIE KREATIV?",
                }),
                s.jsx(Tn, {
                  options: Ue.map((e) => ({ value: e.key, label: e.label })),
                  value: t.creativity,
                  onChange: (e) => c((n) => ({ ...n, creativity: e })),
                  labelledBy: "nf-creativity",
                }),
                De && s.jsx("p", { className: "field-help", children: De }),
              ],
            }),
            s.jsx(W, {
              label: "WÖRTER, DIE NICHT VORKOMMEN SOLLEN",
              placeholder: "z. B. Immo, Home, Haus",
              maxLength: 300,
              value: t.exclude,
              onChange: (e) => c((n) => ({ ...n, exclude: P(e.target.value) })),
            }),
            s.jsxs("div", {
              className: "field nf-length",
              children: [
                s.jsx("label", {
                  className: "label field-label",
                  htmlFor: "nf-len",
                  children: t.maxLength ? `HÖCHSTENS ${t.maxLength} BUCHSTABEN` : "LÄNGE: EGAL",
                }),
                s.jsxs("div", {
                  className: "nf-length-row",
                  children: [
                    s.jsx(R, { onClick: () => ge(J - 1), disabled: J <= 5, children: "Kürzer" }),
                    s.jsx("input", {
                      id: "nf-len",
                      type: "range",
                      min: 5,
                      max: 25,
                      step: 1,
                      value: J,
                      "aria-valuetext": t.maxLength
                        ? `Höchstens ${t.maxLength} Buchstaben`
                        : "Länge egal",
                      onChange: (e) => ge(Number(e.target.value)),
                    }),
                    s.jsx(R, { onClick: () => ge(J + 1), disabled: J >= 25, children: "Länger" }),
                  ],
                }),
              ],
            }),
            s.jsx(W, {
              label: "BESCHREIBUNG (EIN SATZ)",
              placeholder: "z. B. Ich verkaufe Altbauwohnungen in Währing.",
              maxLength: 200,
              value: t.description,
              onChange: (e) => {
                (M(!1), c((n) => ({ ...n, description: P(e.target.value) })));
              },
              help: "Wir holen die wichtigsten Begriffe heraus.",
            }),
            s.jsx(qn, {}),
          ],
        }),
      }),
      u &&
        s.jsx(Un, {
          s: u,
          concept: ue(u),
          styles: y,
          saved: he.has(u.id),
          savedIds: he,
          mehr: !!r.mehr,
          desktop: p,
          path: hn.map((e) => A.current.get(e)).filter((e) => !!e),
          variants: {
            items: w,
            conceptOf: (e) => ue(e),
            canMore: w.length >= te * xe - 2,
            auto: te < qe,
            onMore: () => Te((e) => e + 1),
          },
          hasPrev: I > 0,
          hasNext: I >= 0 && I < Z.length - 1,
          onPrev: () => I > 0 && h({ ...S, detail: Z[I - 1].id }, { replace: !0 }),
          onNext: () =>
            I >= 0 && I < Z.length - 1 && h({ ...S, detail: Z[I + 1].id }, { replace: !0 }),
          onClose: () => h(S, { replace: !0 }),
          onSave: Le,
          onHide: (e) => {
            (Ae(e), e.id === u.id && h(S, { replace: !0 }));
          },
          onTake: dn,
          onArea: (e) => h({ ...S, detail: u.id, mehr: e || void 0 }, { replace: !0 }),
          onAnchor: (e) => h({ ...S, detail: e.id, mehr: !0 }),
          onPath: (e) => h({ ...S, detail: e.id, mehr: !0 }),
          onDomain: cn,
        }),
      re && s.jsx(ss, { name: re.name, onClose: () => le(null), onSend: (e, n) => ln(re, e, n) }),
    ],
  });
}
const Ue = Gn.map((r) => ({
  key: r.key,
  label: r.label,
  hint:
    r.key === "direkt"
      ? "Naheliegende Namen, nah an deinen Angaben."
      : r.key === "frei"
        ? "Überraschende Ideen. Mehr Auswahl, mehr Ausreißer."
        : "Etwas kreativer, gut gemischt.",
}));
export { ds as default };
