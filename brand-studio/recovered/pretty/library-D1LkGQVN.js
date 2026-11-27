import {
  _ as w,
  $ as k,
  aF as f,
  aI as m,
  aG as a,
  aR as g,
  aL as y,
  aJ as b,
} from "./index-BER2gtDe.js";
import "./energy-DRQ_36b-.js";
import { E as I } from "./objectData-DW9yI24T.js";
const i = {
    objects: 40,
    photos: 20,
    title: 80,
    address: 120,
    lage: 60,
    description: 600,
    price: 40,
    commission: 80,
    url: 200,
    credit: 80,
    factLabel: 30,
    factValue: 30,
    facts: 8,
    externalId: 80,
  },
  z = ["neu", "reserviert", "verkauft", "vermietet", "preis-angepasst"],
  N = {
    neu: "Neu",
    reserviert: "Reserviert",
    verkauft: "Verkauft",
    vermietet: "Vermietet",
    "preis-angepasst": "Preis angepasst",
  },
  E = ["kauf", "miete"],
  L = ["studio", "kit", "unio"],
  v = { x: 0.5, y: 0.5, zoom: 1 },
  P = 2.5,
  h = { hwb: "", fgee: "", klasse: "", eeb: "", eebKlasse: "", ausweisDatum: "" };
function j() {
  return `o${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
function V(e = Date.now(), t = j()) {
  return {
    id: t,
    source: "studio",
    externalId: "",
    title: "",
    address: "",
    lage: "",
    kind: "kauf",
    status: "neu",
    statusSince: e,
    price: "",
    previousPrice: "",
    commission: "",
    description: "",
    facts: [
      { label: "Wohnfläche", value: "" },
      { label: "Zimmer", value: "" },
      { label: "Freifläche", value: "" },
    ],
    energy: { ...h },
    photos: [],
    url: "",
    createdAt: e,
    updatedAt: e,
  };
}
function M(e) {
  const t = e.lage.replace(/\s+/g, " ").trim();
  if (t) return t;
  const s = e.address
    .split(",")
    .map((r) => r.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return s.length < 2 ? "" : s[s.length - 1];
}
const O = /^[a-z0-9]{6,40}$/,
  B = /^[a-z0-9]{4,40}$/,
  d = /^\d{1,4}([.,]\d{1,2})?$/,
  A = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  D = /^(A\+\+|A\+|A|B|C|D|E|F|G)( [a-zäöüß]{3,20})?$/i,
  l = (e) => e.replace(/\s+/g, " ").trim();
function K(e, t) {
  const s = f(e, t),
    r = (n, o) => {
      const u = a(n, o, 3, { optional: !0 });
      if (u && !I.includes(u)) throw new m(o);
      return u;
    };
  return {
    hwb: a(s.hwb, `${t}.hwb`, 7, { optional: !0, pattern: d }),
    klasse: r(s.klasse, `${t}.klasse`),
    eeb: a(s.eeb, `${t}.eeb`, 7, { optional: !0, pattern: d }),
    eebKlasse: a(s.eebKlasse, `${t}.eebKlasse`, 30, { optional: !0, pattern: D }),
    fgee: a(s.fgee, `${t}.fgee`, 7, { optional: !0, pattern: d }),
    ausweisDatum: a(s.ausweisDatum, `${t}.ausweisDatum`, 10, { optional: !0, pattern: A }),
  };
}
function T(e, t) {
  const s = f(e, t),
    r = s.focus === void 0 ? v : f(s.focus, `${t}.focus`);
  return {
    id: a(s.id, `${t}.id`, 40, { pattern: O }),
    focus: {
      x: b(r.x, `${t}.focus.x`, 0, 1),
      y: b(r.y, `${t}.focus.y`, 0, 1),
      zoom: b(r.zoom, `${t}.focus.zoom`, 1, P),
    },
    rights: y(s.rights, `${t}.rights`),
    virtual: y(s.virtual, `${t}.virtual`),
    credit: a(s.credit, `${t}.credit`, i.credit, { optional: !0 }),
  };
}
function _(e, t) {
  if (!Array.isArray(e) || e.length > i.facts) throw new m(t);
  return e.map((s, r) => {
    const n = f(s, `${t}.${r}`);
    return {
      label: a(n.label, `${t}.${r}.label`, i.factLabel),
      value: a(n.value, `${t}.${r}.value`, i.factValue),
    };
  });
}
function Z(e, t) {
  const s = f(e, t);
  if (!Array.isArray(s.photos) || s.photos.length > i.photos) throw new m(`${t}.photos`);
  const r = s.photos.map((o, u) => T(o, `${t}.photos.${u}`));
  if (new Set(r.map((o) => o.id)).size !== r.length) throw new m(`${t}.photos`);
  const n = (o) => (o === void 0 ? 0 : b(o, t, 0, 1e14));
  return {
    id: a(s.id, `${t}.id`, 40, { pattern: B }),
    source: g(s.source ?? "studio", L, `${t}.source`),
    externalId: a(s.externalId, `${t}.externalId`, i.externalId, {
      optional: !0,
      pattern: /^[A-Za-z0-9_.:-]+$/,
    }),
    title: a(s.title, `${t}.title`, i.title),
    address: a(s.address, `${t}.address`, i.address, { optional: !0 }),
    lage: a(s.lage, `${t}.lage`, i.lage, { optional: !0 }),
    kind: g(s.kind ?? "kauf", E, `${t}.kind`),
    status: g(s.status ?? "neu", z, `${t}.status`),
    statusSince: n(s.statusSince),
    price: a(s.price, `${t}.price`, i.price, { optional: !0 }),
    previousPrice: a(s.previousPrice, `${t}.previousPrice`, i.price, { optional: !0 }),
    commission: a(s.commission, `${t}.commission`, i.commission, { optional: !0 }),
    description: a(s.description, `${t}.description`, i.description, { optional: !0 }),
    facts: s.facts === void 0 ? [] : _(s.facts, `${t}.facts`),
    energy: s.energy === void 0 ? { ...h } : K(s.energy, `${t}.energy`),
    photos: r,
    url: a(s.url, `${t}.url`, i.url, { optional: !0 }),
    createdAt: n(s.createdAt),
    updatedAt: n(s.updatedAt),
  };
}
function U(e, t, s = "projekt.library") {
  if (e == null) return { objects: t ? [F(t)] : [] };
  const r = f(e, s);
  if (!Array.isArray(r.objects) || r.objects.length > i.objects) throw new m(`${s}.objects`);
  const n = r.objects.map((o, u) => Z(o, `${s}.objects.${u}`));
  if (new Set(n.map((o) => o.id)).size !== n.length) throw new m(`${s}.objects`);
  return { objects: n };
}
function F(e, t = Date.now()) {
  return {
    id: "kitobjekt",
    source: "kit",
    externalId: "",
    title: e.title,
    address: e.address,
    lage: "",
    kind: "kauf",
    status: "neu",
    statusSince: 0,
    price: e.price,
    previousPrice: "",
    commission: "",
    description: e.description,
    facts: e.facts.map((s) => ({ ...s })),
    energy: {
      ...h,
      hwb: e.energy.hwb,
      fgee: e.energy.fgee,
      klasse: e.energy.klasse,
      eeb: e.energy.eeb ?? "",
      eebKlasse: e.energy.eebKlasse ?? "",
      ausweisDatum: e.energy.ausweisDatum ?? "",
    },
    photos: e.photoIds.map((s) => ({
      id: s,
      focus: { ...v },
      rights: !1,
      virtual: !1,
      credit: "",
    })),
    url: e.url,
    createdAt: t,
    updatedAt: t,
  };
}
const c = {
  title: "Gib dem Objekt einen kurzen Titel, z. B. „Dachgeschoss mit Weitblick“.",
  address: `Die Adresse ist zu lang (höchstens ${i.address} Zeichen).`,
  lage: `Die Lage ist zu lang (höchstens ${i.lage} Zeichen).`,
  price: `Der Preis ist zu lang (höchstens ${i.price} Zeichen).`,
  previousPrice: "Trag den bisherigen Preis ein, z. B. € 590.000.",
  commission: `Die Provision ist zu lang (höchstens ${i.commission} Zeichen).`,
  description: `Die Beschreibung ist zu lang (höchstens ${i.description} Zeichen).`,
  url: "Diese Adresse sieht nicht wie eine Website aus, z. B. „beispiel-immobilien.at/objekt-12“.",
  hwb: "Gib den HWB als Zahl ein, z. B. 45 oder 45,3.",
  eeb: "Gib den EEB als Zahl ein, z. B. 62 oder 62,4.",
  eebKlasse: "Wähle die Klasse aus deinem Energieausweis, z. B. C oder C fossil.",
  fgee: "Gib den fGEE als Zahl ein, z. B. 0,85.",
  ausweisDatum: "Gib das Datum aus dem Energieausweis ein.",
  facts: `Kennzahlen höchstens ${i.factValue} Zeichen je Feld.`,
  photos: `Höchstens ${i.photos} Fotos je Objekt.`,
};
function W(e) {
  const t = {};
  return (
    (!l(e.title) || e.title.length > i.title) && (t.title = c.title),
    e.address.length > i.address && (t.address = c.address),
    e.lage.length > i.lage && (t.lage = c.lage),
    e.price.length > i.price && (t.price = c.price),
    (e.previousPrice.length > i.price || (e.status === "preis-angepasst" && !l(e.previousPrice))) &&
      (t.previousPrice = c.previousPrice),
    e.commission.length > i.commission && (t.commission = c.commission),
    e.description.length > i.description && (t.description = c.description),
    e.url && (!w(e.url) || e.url.length > i.url) && (t.url = c.url),
    e.energy.hwb.trim() && !d.test(e.energy.hwb.trim()) && (t.hwb = c.hwb),
    e.energy.eeb.trim() && !d.test(e.energy.eeb.trim()) && (t.eeb = c.eeb),
    e.energy.fgee.trim() && !d.test(e.energy.fgee.trim()) && (t.fgee = c.fgee),
    e.energy.eebKlasse.trim() && !D.test(e.energy.eebKlasse.trim()) && (t.eebKlasse = c.eebKlasse),
    e.energy.ausweisDatum && !A.test(e.energy.ausweisDatum) && (t.ausweisDatum = c.ausweisDatum),
    (e.facts.length > i.facts ||
      e.facts.some((s) => s.label.length > i.factLabel || s.value.length > i.factValue)) &&
      (t.facts = c.facts),
    e.photos.length > i.photos && (t.photos = c.photos),
    t
  );
}
const p = (e) => e.trim().replace(".", ",");
function x(e, t = Date.now()) {
  return {
    ...e,
    externalId: e.externalId.slice(0, i.externalId),
    title: l(e.title).slice(0, i.title),
    address: l(e.address).slice(0, i.address),
    lage: l(e.lage).slice(0, i.lage),
    price: l(e.price).slice(0, i.price),
    previousPrice: l(e.previousPrice).slice(0, i.price),
    commission: l(e.commission).slice(0, i.commission),
    description: e.description.trim().slice(0, i.description),
    facts: e.facts
      .map((s) => ({
        label: l(s.label).slice(0, i.factLabel),
        value: l(s.value).slice(0, i.factValue),
      }))
      .filter((s) => s.label && s.value)
      .slice(0, i.facts),
    energy: {
      ...e.energy,
      hwb: p(e.energy.hwb),
      eeb: p(e.energy.eeb),
      fgee: p(e.energy.fgee),
      eebKlasse: e.energy.eebKlasse
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^(\S+)(.*)$/, (s, r, n) => r.toUpperCase() + n.toLocaleLowerCase("de-AT")),
    },
    photos: e.photos
      .slice(0, i.photos)
      .map((s) => ({ ...s, credit: l(s.credit).slice(0, i.credit) })),
    url: e.url && w(e.url) ? k(e.url).slice(0, i.url) : "",
    updatedAt: t,
  };
}
function J(e, t) {
  const s = e.objects.filter((n) => n.id !== t.id);
  return e.objects.findIndex((n) => n.id === t.id) >= 0
    ? { objects: e.objects.map((n) => (n.id === t.id ? t : n)) }
    : { objects: [t, ...s].slice(0, i.objects) };
}
function Y(e, t) {
  return { objects: e.objects.filter((s) => s.id !== t) };
}
function H(e, t, s = Date.now()) {
  if (e.status === t) return e;
  const r = t === "preis-angepasst" && !e.previousPrice ? e.price : e.previousPrice;
  return { ...e, status: t, statusSince: s, previousPrice: r, updatedAt: s };
}
function X(e, t, s) {
  const r = [...e.photos],
    [n] = r.splice(t, 1);
  return n ? (r.splice(Math.max(0, Math.min(r.length, s)), 0, n), { ...e, photos: r }) : e;
}
function q(e, t, s) {
  return {
    ...e,
    photos: e.photos.map((r) =>
      r.id === t ? { ...r, ...s, focus: { ...r.focus, ...(s.focus ?? {}) } } : r,
    ),
  };
}
function Q(e, t = Date.now()) {
  return {
    ...JSON.parse(JSON.stringify(e)),
    id: j(),
    source: "studio",
    externalId: "",
    title: `${e.title} (Kopie)`.slice(0, i.title),
    createdAt: t,
    updatedAt: t,
  };
}
function ee(e, t, s) {
  return e.some((r) => {
    var o, u;
    const n = s && r.id === s.projectId;
    return (o = r.object) != null && o.photoIds.includes(t) && !(n && s != null && s.kit)
      ? !0
      : (((u = r.library) == null ? void 0 : u.objects) ?? []).some(
          ($) =>
            !(n && $.id === (s == null ? void 0 : s.objectId)) && $.photos.some((S) => S.id === t),
        );
  });
}
export {
  v as D,
  i as L,
  N as S,
  P as Z,
  M as a,
  z as b,
  q as c,
  Q as d,
  V as e,
  x as f,
  U as l,
  X as m,
  ee as p,
  Y as r,
  H as s,
  J as u,
  W as v,
};
