// W1 Schritt 3: zieht alle Daten aus der gesicherten Fassung heraus.
//
// Vorgehen: Die instrumentierte Fassung (instrument.mjs) wird im Browser geladen.
// Jedes Modul liefert ueber `__recovered__` alle Bindungen der obersten Ebene.
// 1. Benannte Daten (Katalog unten) landen an ihrer frueheren Stelle unter src/.
//    Sie muessen reines JSON sein; sonst bricht das Skript ab.
// 2. Zusaetzlich wird JEDE Daten-Bindung jedes App-Moduls verlustfrei in
//    recovered/data-snapshot/<modul>.json abgelegt (Funktionen als Quelltext).
// 3. recovered/data-snapshot/REPORT.json haelt Zaehlungen gegen die bekannten Zahlen fest.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { openStudio, here, studioRoot } from "./lib.mjs";

const MODULES = {
  nf: "nameFinder-CLppxXuz.js",
  en: "engine-BhDRZEfO.js",
  ix: "index-BER2gtDe.js",
  ko: "kompass-bTkyDSpk.js",
  tx: "texts-B92agAAM.js",
  ka: "kitAssets-CN7deWlx.js",
  sv: "svg-CrwnZnJY.js",
  de: "describe-CrBWccON.js",
  li: "library-D1LkGQVN.js",
  od: "objectData-DW9yI24T.js",
  ow: "own-CMBusp3y.js",
  eg: "energy-DRQ_36b-.js",
  im: "imagesize-BHC6N02v.js",
  ps: "PostingsScreen-DENTHyqT.js",
  oe: "ObjectEditor-2EvMWoQa.js",
  nc: "NameCard-BpHDImep.js",
  ga: "Gallery-DQhL1__5.js",
  ed: "Editor-DVnOl_QT.js",
  kt: "Kit-DOg_4MCc.js",
  kp: "Kompass-15lKj4KF.js",
  rt: "Routes-DauRWys7.js",
  nfs: "NameFinder-a2JCuNBt.js",
  ss: "StyleScreen-C_6L_v_z.js",
  mg: "migrate-yTmcZ5Wq.js",
  pw: "prewarm-B0dvGBZL.js",
  ph: "photoStore-D5-LfIN5.js",
  os: "ObjectsScreen-Brex7erJ.js",
  pp: "ProjectPreview-C5WC5Zuf.js",
  lv: "LogoView-CG3DXWdO.js",
};

// Benannte Daten: Ziel (relativ zu brand-studio/) -> Ausdruck ueber die Modul-Kuerzel.
// "plain": muss reines JSON sein. "snapshot": darf Funktionen enthalten (als $fn).
const CATALOG = [
  // Namen
  ["src/engine/reference/keyword-fields.json", "M.nf.vs", "plain"],
  ["src/engine/reference/naming-rules.json", "M.nf.xa", "plain"],
  ["src/engine/names/wordsDb.data.json", "M.nf.kn", "plain"],
  ["src/engine/names/kwFields.data.json", "M.nf.Bs", "plain"],
  ["src/engine/names/corpusNames.data.json", "({ corpus: M.nf.mu, tech: M.nf.pu })", "plain"],
  // Korpus und Rezepte (Logo-Engine)
  ["src/engine/corpusMarks.data.json", "M.en.gs", "plain"],
  ["src/engine/corpusTechMarks.data.json", "M.en.ds", "plain"],
  ["src/engine/reference/recipes.json", "M.en.Bu", "plain"],
  ["src/engine/suffixPairings.json", "M.en.Gu", "plain"],
  // Schriften, Abdeckung, Paletten
  ["src/engine/fonts.json", "M.ix.m1", "plain"],
  ["src/engine/coverage.json", "M.ix.hk", "plain"],
  ["src/engine/palettes.json", "({ moods: M.sv.rt, stilMoods: M.sv.ct, paletten: M.sv.z })", "plain"],
  // Symbole und Orte
  [
    "src/symbols/icons.json",
    "({ haus: M.ix.iT, dach: M.ix.aT, schluessel: M.ix.lT, tuer: M.ix.cT, stadt: M.ix.hT, natur: M.ix.vT, abstrakt: M.ix.xT, initialen: M.ix.kT })",
    "snapshot",
  ],
  ["src/symbols/containers.snapshot.json", "M.ix.fu", "snapshot"],
  ["src/engine/orte.json", "({ bezirke: M.ix.Yc, laender: M.ix.aC, staedte: M.ix.oC, regionen: M.ix.lC })", "snapshot"],
  // Signature-Vorlagen (Reihenfolge wie im Bundle: cr = [...Il, ...Ol, ...Bl, ...Vl, ...Zl, ...Cl, ...ws, ...Dl, ...Pl, ...Wl])
  ["src/signature/templates/elegant.json", "M.en.Il", "plain"],
  ["src/signature/templates/luxus.json", "M.en.Ol", "plain"],
  ["src/signature/templates/modern.json", "M.en.Bl", "plain"],
  ["src/signature/templates/mutig.json", "M.en.Vl", "plain"],
  ["src/signature/templates/natur.json", "M.en.Zl", "plain"],
  ["src/signature/templates/warm.json", "M.en.Cl", "plain"],
  ["src/signature/templates/kurz.json", "M.en.ws", "plain"],
  ["src/signature/templates/mischung.json", "M.en.Dl", "plain"],
  ["src/signature/templates/kit.json", "M.en.Pl", "plain"],
  ["src/signature/templates/partner.json", "M.en.Wl", "plain"],
  ["src/signature/templates/verworfen.json", "M.en.jl", "plain"],
  ["src/signature/orte.json", "({ bezirke: M.en.To, staedte: M.en.Io, orte: M.en.Oo, bezirksnummern: M.en.Du })", "plain"],
  ["src/signature/varianten.snapshot.json", "({ feinheit: M.en.ls, varianten: M.en.ms })", "snapshot"],
  // Strategie (Markenkompass)
  ["src/strategy/territories.json", "M.ko.mn", "plain"],
  [
    "src/strategy/axes.json",
    "({ achsen: M.ko.T, gewichte: M.ko.x, referenzen: M.ko.we, stimme: M.ko.pe, segment: M.ko.ve, schriftformen: M.ko.C, nichtIch: M.ko.hn, onlynessFokus: M.ko.yn })",
    "plain",
  ],
  [
    "src/strategy/catalog.json",
    "({ schritte: M.tx.R, onlyness: M.tx.I, alternativen: M.tx.V, referenzwelten: M.tx.Z, klischees: M.tx._, stimmproben: M.tx.C, logoPaare: M.tx.U, farbPaare: M.tx.J, antiFarben: M.tx.q, fokus: M.tx.Y, architektur: M.tx.X, erfahrung: M.tx.Q, segment: M.tx.ee, zielgruppen: M.tx.K, werte: M.tx.L, persoenlichkeit: M.tx.y, kanaele: M.tx.ie, einleitung: M.tx.Re })",
    "plain",
  ],
  [
    "src/strategy/texts.snapshot.json",
    "({ klischeeMuster: M.tx.he, alternativeText: M.tx.O, referenzGenitiv: M.tx.me, achsenText: M.tx.B, onlynessSatz: M.tx.fe, onlynessNutzen: M.tx.be, nichtIchText: M.tx.pe, themen: M.tx.Ae, formate: M.tx.Ne })",
    "snapshot",
  ],
  // Postings (Ausbaustufe 6)
  [
    "src/postings/occasions.snapshot.json",
    "({ anlaesse: M.ps.vn, formate: M.ps.De, looks: M.ps.xn, cta: M.ps.Et, bezirke: M.ps.Ht, objektarten: M.ps.Tn, masse: M.ps.P })",
    "snapshot",
  ],
];

// Tabellen (Arrays aus Arrays) eine Zeile je Eintrag, sonst normal eingerueckt.
const fmt = (data) =>
  Array.isArray(data) && data.length && data.every(Array.isArray)
    ? "[\n" + data.map((r) => "  " + JSON.stringify(r)).join(",\n") + "\n]"
    : JSON.stringify(data, null, 2);
const writeJson = (rel, data, compactTop = false) => {
  const p = join(studioRoot, rel);
  mkdirSync(dirname(p), { recursive: true });
  const text = compactTop
    ? "{\n" + Object.entries(data).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}"
    : fmt(data);
  writeFileSync(p, text + "\n");
};

const s = await openStudio();
await s.page.addScriptTag({ content: readFileSync(join(here, "serialize.js"), "utf8") });
const res = await s.page.evaluate(
  async ({ MODULES, CATALOG }) => {
    const M = {};
    for (const [k, f] of Object.entries(MODULES)) M[k] = (await import("./assets/" + f)).__recovered__;
    const named = {};
    for (const [target, expr, mode] of CATALOG) {
      try {
        const v = new Function("M", `return (${expr});`)(M);
        named[target] = { mode, ...__serialize(v) };
      } catch (e) {
        named[target] = { mode, error: String(e) };
      }
    }
    return { named };
  },
  { MODULES, CATALOG },
);
const snapshot = {};
for (const [k, f] of Object.entries(MODULES)) {
  snapshot[f] = await s.page.evaluate(async (f) => {
    const L = (await import("./assets/" + f)).__recovered__;
    const out = {};
    for (const name of Object.keys(L)) {
      let v;
      try {
        v = L[name];
      } catch (e) {
        out[name] = { $error: String(e) };
        continue;
      }
      if (typeof v === "function") continue;
      out[name] = __serialize(v, { maxDepth: 40, maxNodes: 400_000 }).json;
    }
    return out;
  }, f);
}
res.snapshot = snapshot;
await s.close();

let failed = 0;
const report = { named: {}, snapshot: {} };
for (const [target, r] of Object.entries(res.named)) {
  if (r.error || (r.mode === "plain" && r.special > 0)) {
    console.error("FEHLER", target, r.error ?? `${r.special} nicht-JSON-Werte`);
    failed++;
    continue;
  }
  writeJson(target, r.json);
  report.named[target] = {
    eintraege: Array.isArray(r.json) ? r.json.length : Object.keys(r.json).length,
    markierungen: r.special,
  };
}
for (const [f, out] of Object.entries(res.snapshot)) {
  writeJson(`recovered/data-snapshot/${f.replace(/-[\w-]{8}\.js$/, "")}.json`, out, true);
  report.snapshot[f] = Object.keys(out).length;
}
// Abgeleitete Referenzdateien: Die Original-JSONs (names.json, corpus.json,
// corpus-tech.json) kamen nur in verdichteter Form ins Bundle. Sie werden aus
// diesen Formen so weit wie moeglich zurueckgebaut; die verdichteten Formen
// selbst liegen unveraendert daneben (*.data.json) und sind massgeblich.
const get = (t) => res.named[t].json;
const kn = get("src/engine/names/wordsDb.data.json");
writeJson("src/engine/reference/names.json", {
  meta: {
    hinweis:
      "Rekonstruiert am 27.11.2026 aus der verdichteten Wortdatenbank (src/engine/names/wordsDb.data.json, 9 Spalten je Wort). Felder des Originals, die nicht ins Bundle kamen (z. B. id, typ, position, stichwort_felder), fehlen. Spalte 6 wird im Bundle nicht gelesen, ihre Bedeutung ist offen. flags ist eine Bitmaske: 1 gesperrt/Tabu (Ra), 2 und 8 vom Namensvorrat ausgeschlossen, 16 und 64 Bedingung fuer kwOnly, 128 evo, 256 nur ueber Stichwort (kwOnly).",
    spalten: ["wort", "sprache", "bedeutung", "feld", "silben", "buchstaben", "spalte6", "fokus", "flags"],
    anzahl: kn.length,
  },
  eintraege: kn.map(([wort, sprache, bedeutung, feld, silben, buchstaben, spalte6, fokus, flags]) => ({
    wort,
    sprache,
    bedeutung,
    feld,
    silben,
    buchstaben,
    spalte6,
    fokus: fokus ? fokus.split(",") : [],
    flags,
  })),
});
const cn = get("src/engine/names/corpusNames.data.json");
const rowsToMap = (rows) => new Map(rows.map((r) => [r[0], r]));
const markFields = (r) =>
  r
    ? { schrift: r[3], schreibung: r[4], laufweite: r[5], bildzeichen: r[6], schriftform: r[7] }
    : {};
const gsMap = rowsToMap(get("src/engine/corpusMarks.data.json"));
const dsMap = rowsToMap(get("src/engine/corpusTechMarks.data.json"));
writeJson("src/engine/reference/corpus.json", {
  meta: {
    hinweis:
      "Rekonstruiert am 27.11.2026 aus corpusNames (Name, Kern, Person) und corpusMarks (Logo-Merkmale). Weitere Felder des Originals (Analyse, Anti-Muster, Quellen) kamen nicht ins Bundle.",
    anzahl: cn.corpus.length,
  },
  marken: cn.corpus.map((m) => ({ ...m, ...markFields(gsMap.get(m.id)) })),
});
writeJson("src/engine/reference/corpus-tech.json", {
  meta: {
    hinweis:
      "Rekonstruiert am 27.11.2026 aus corpusNames.tech und corpusTechMarks. Laut naming-rules hatte das Original 195 Marken, davon 192 nicht im Hauptkorpus; nur diese 192 stehen im Bundle. Logo-Merkmale liegen fuer die Marken vor, die corpusTechMarks enthaelt.",
    anzahl: cn.tech.length,
    mitLogoMerkmalen: cn.tech.filter((m) => dsMap.has(m.id)).length,
  },
  marken: cn.tech.map((m) => ({ ...m, ...markFields(dsMap.get(m.id)) })),
});
writeJson("recovered/data-snapshot/_named.json", report);
console.log(JSON.stringify(report, null, 1));
if (failed) process.exit(1);
