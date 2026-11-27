import { _ as z, $ as E, aF as w, aI as d, aG as i } from "./index-BER2gtDe.js";
import { a as D, c as j } from "./energy-DRQ_36b-.js";
const t = {
    title: 80,
    address: 120,
    description: 600,
    price: 40,
    url: 200,
    factLabel: 30,
    factValue: 30,
    facts: 8,
    photos: 4,
  },
  k = ["A++", "A+", "A", "B", "C", "D", "E", "F", "G"],
  B = /^(A\+\+|A\+|A|B|C|D|E|F|G)( [a-zäöüß]{3,20})?$/i,
  y = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  A = (e) => {
    const [s = "", ...r] = e.trim().split(/\s+/);
    return { klasse: s, zusatz: r.join(" ") };
  },
  I = (e, s) => [e.trim(), s.trim().toLocaleLowerCase("de-AT")].filter(Boolean).join(" "),
  v = (e) => !!e && y.test(e) && e < j,
  F = [
    "Wohnfläche",
    "Zimmer",
    "Freifläche",
    "Baujahr",
    "Grundfläche",
    "Stockwerk",
    "Stellplatz",
    "Heizung",
  ],
  T = {
    Wohnfläche: "z. B. 84 m²",
    Zimmer: "z. B. 3",
    Freifläche: "z. B. 12 m² Balkon",
    Baujahr: "z. B. 1908",
    Grundfläche: "z. B. 640 m²",
    Stockwerk: "z. B. 3. Stock",
    Stellplatz: "z. B. Tiefgarage",
    Heizung: "z. B. Fernwärme",
  };
function C() {
  return {
    title: "",
    address: "",
    description: "",
    facts: [
      { label: "Wohnfläche", value: "" },
      { label: "Zimmer", value: "" },
      { label: "Freifläche", value: "" },
    ],
    energy: { hwb: "", fgee: "", klasse: "", eeb: "", eebKlasse: "", ausweisDatum: "" },
    price: "",
    url: "",
    photoIds: [],
  };
}
const S = /^[a-z0-9]{6,40}$/,
  b = /^\d{1,4}([.,]\d{1,2})?$/;
function L(e, s = "projekt.object") {
  if (e == null) return null;
  const r = w(e, s),
    c = new Set(["title", "address", "description", "facts", "energy", "price", "url", "photoIds"]),
    o = new Set(["hwb", "fgee", "klasse", "eeb", "eebKlasse", "ausweisDatum"]);
  for (const n of Object.keys(r)) if (!c.has(n)) throw new d(`${s}.${n}`);
  if (!Array.isArray(r.facts) || r.facts.length > t.facts) throw new d(`${s}.facts`);
  const p = r.facts.map((n, g) => {
      const $ = w(n, `${s}.facts.${g}`);
      return {
        label: i($.label, `${s}.facts.${g}.label`, t.factLabel),
        value: i($.value, `${s}.facts.${g}.value`, t.factValue),
      };
    }),
    l = w(r.energy, `${s}.energy`);
  for (const n of Object.keys(l)) if (!o.has(n)) throw new d(`${s}.energy.${n}`);
  const u = i(l.klasse, `${s}.energy.klasse`, 3);
  if (u && !k.includes(u)) throw new d(`${s}.energy.klasse`);
  if (!Array.isArray(r.photoIds) || r.photoIds.length > t.photos) throw new d(`${s}.photoIds`);
  const m = r.photoIds.map((n, g) => i(n, `${s}.photoIds.${g}`, 40, { pattern: S }));
  if (new Set(m).size !== m.length) throw new d(`${s}.photoIds`);
  return {
    title: i(r.title, `${s}.title`, t.title),
    address: i(r.address, `${s}.address`, t.address),
    description: i(r.description, `${s}.description`, t.description),
    facts: p,
    energy: {
      hwb: i(l.hwb, `${s}.energy.hwb`, 7, { pattern: b }),
      fgee: i(l.fgee, `${s}.energy.fgee`, 7, { pattern: b }),
      klasse: u,
      eeb: i(l.eeb, `${s}.energy.eeb`, 7, { optional: !0, pattern: b }),
      eebKlasse: i(l.eebKlasse, `${s}.energy.eebKlasse`, 30, { optional: !0, pattern: B }),
      ausweisDatum: i(l.ausweisDatum, `${s}.energy.ausweisDatum`, 10, { optional: !0, pattern: y }),
    },
    price: i(r.price, `${s}.price`, t.price),
    url: i(r.url, `${s}.url`, t.url),
    photoIds: m,
  };
}
const a = {
    title: "Gib dem Objekt einen kurzen Titel, z. B. „Dachgeschoss mit Weitblick“.",
    address: `Die Adresse ist zu lang (höchstens ${t.address} Zeichen).`,
    description: `Die Beschreibung ist zu lang (höchstens ${t.description} Zeichen).`,
    price: `Der Preis ist zu lang (höchstens ${t.price} Zeichen).`,
    url: "Diese Adresse sieht nicht wie eine Website aus, z. B. „berger-immobilien.at/objekt-12“.",
    hwb: "Gib den HWB als Zahl ein, z. B. 45 oder 45,3.",
    fgee: "Gib den fGEE als Zahl ein, z. B. 0,85.",
    klasse: "Wähle die Klasse aus deinem Energieausweis.",
    eeb: "Gib den EEB als Zahl ein, z. B. 62 oder 61,8.",
    eebKlasse: "Wähle die Klasse zum EEB. Der Zusatz ist ein Wort, z. B. fossil.",
    ausweisDatum: "Gib das Datum wie auf dem Ausweis ein.",
    facts: `Kennzahlen höchstens ${t.factValue} Zeichen je Feld.`,
    photos: `Höchstens ${t.photos} Fotos.`,
  },
  f = (e) => e.replace(/\s+/g, " ").trim();
function W(e) {
  const s = {};
  ((!f(e.title) || e.title.length > t.title) && (s.title = a.title),
    e.address.length > t.address && (s.address = a.address),
    e.description.length > t.description && (s.description = a.description),
    e.price.length > t.price && (s.price = a.price),
    e.url && (!z(e.url) || e.url.length > t.url) && (s.url = a.url));
  const r = e.energy.hwb.trim(),
    c = e.energy.fgee.trim();
  (r && !b.test(r) && (s.hwb = a.hwb),
    c && !b.test(c) && (s.fgee = a.fgee),
    e.energy.klasse && !k.includes(e.energy.klasse) && (s.klasse = a.klasse));
  const o = (e.energy.eeb ?? "").trim(),
    p = (e.energy.eebKlasse ?? "").trim(),
    l = (e.energy.ausweisDatum ?? "").trim();
  return (
    o && !b.test(o) && (s.eeb = a.eeb),
    p && !B.test(p) && (s.eebKlasse = a.eebKlasse),
    l && !y.test(l) && (s.ausweisDatum = a.ausweisDatum),
    (e.facts.length > t.facts ||
      e.facts.some((u) => u.label.length > t.factLabel || u.value.length > t.factValue)) &&
      (s.facts = a.facts),
    e.photoIds.length > t.photos && (s.photos = a.photos),
    s
  );
}
const Z = (e) => !!e && D({ energy: e.energy }) === "voll";
function _(e) {
  return {
    title: f(e.title).slice(0, t.title),
    address: f(e.address).slice(0, t.address),
    description: e.description.trim().slice(0, t.description),
    facts: e.facts
      .map((s) => ({
        label: f(s.label).slice(0, t.factLabel),
        value: f(s.value).slice(0, t.factValue),
      }))
      .filter((s) => s.label && s.value)
      .slice(0, t.facts),
    energy: {
      hwb: e.energy.hwb.trim().replace(".", ","),
      fgee: e.energy.fgee.trim().replace(".", ","),
      klasse: e.energy.klasse,
      eeb: (e.energy.eeb ?? "").trim().replace(".", ","),
      eebKlasse: (() => {
        const s = A(e.energy.eebKlasse ?? "");
        return I(s.klasse.toUpperCase(), s.zusatz);
      })(),
      ausweisDatum: (e.energy.ausweisDatum ?? "").trim(),
    },
    price: f(e.price).slice(0, t.price),
    url: e.url && z(e.url) ? E(e.url).slice(0, t.url) : "",
    photoIds: e.photoIds.slice(0, t.photos),
  };
}
function K(e, s) {
  if (e)
    return {
      title: e.title,
      address: e.address,
      description: e.description,
      facts: e.facts,
      energy: e.energy,
      ...(e.price ? { price: e.price } : {}),
      ...(e.url ? { url: e.url } : {}),
      photos: e.photoIds.map((r) => s[r]).filter((r) => !!r),
    };
}
let h = null;
function V(e, s) {
  const r = e ? e.photoIds.map((o) => (s[o] ? o : "-")).join(",") : "";
  if (h && h.o === e && h.key === r) return h.data;
  const c = K(e, s);
  return ((h = { o: e, key: r, data: c }), c);
}
export {
  k as E,
  T as F,
  t as O,
  F as a,
  C as b,
  V as c,
  W as d,
  Z as e,
  _ as f,
  I as j,
  L as o,
  A as s,
  v,
};
