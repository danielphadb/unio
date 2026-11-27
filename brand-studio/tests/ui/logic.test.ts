// @vitest-environment jsdom
// Oberflaechen-Logik (src/ui/logic/*) im Vergleich mit den Funktionen der gesicherten Fassung
// (index-, NameCard-, describe- und kompass-Chunk): gleiche Eingaben, gleiche Ergebnisse.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { recovered } from "../helpers/recovered";
import * as contact from "../../src/ui/logic/contact";
import * as glyphs from "../../src/ui/logic/glyphs";
import * as text from "../../src/ui/logic/text";
import * as project from "../../src/ui/logic/project";
import * as persist from "../../src/ui/logic/persist";
import * as route from "../../src/ui/logic/route";
import * as nameDraft from "../../src/ui/logic/nameDraft";
import * as kompassDraft from "../../src/ui/logic/kompassDraft";
import * as kompass from "../../src/ui/logic/kompass";
import * as settings from "../../src/ui/logic/settings";
import * as describeLogic from "../../src/ui/logic/describe";
import { briefPreviewParams } from "../../src/strategy/axes";

let ix: Record<string, any>;
let nc: Record<string, any>;
let ds: Record<string, any>;
let kp: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  ix = await recovered("index");
  nc = await recovered("NameCard");
  ds = await recovered("describe");
  kp = await recovered("kompass");
}, 120000);

// Zufall und Uhr fest, damit Seeds und IDs in beiden Fassungen gleich sind
beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.3141);
  vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 9, 27, 9));
});
afterEach(() => vi.restoreAllMocks());

const root = join(__dirname, "..", "..");
const golden = (p: string) => JSON.parse(readFileSync(join(root, "tests", "golden", p), "utf8"));
const plain = (x: unknown): string => JSON.stringify(x === undefined ? "__undefined__" : x);
const same = (neu: (...a: any[]) => unknown, alt: (...a: any[]) => unknown, faelle: unknown[][]) => {
  for (const args of faelle) {
    let a: unknown;
    let b: unknown;
    try {
      a = neu(...args);
    } catch (e) {
      a = `Fehler: ${(e as Error).message}`;
    }
    try {
      b = alt(...args);
    } catch (e) {
      b = `Fehler: ${(e as Error).message}`;
    }
    expect(plain(a), `Eingabe ${plain(args)}`).toBe(plain(b));
  }
};

const MARKEN = golden("inputs.json").marken as Array<Record<string, any>>;
const ROUTEN = golden("strategy/routes.json") as Record<string, { brief: any; laeufe: any }>;
const BRIEFS = Object.values(ROUTEN).map((r) => r.brief);
const ROUTES = Object.values(ROUTEN).flatMap((r) => [...r.laeufe.standard, ...r.laeufe.seed7]);
const KONZEPTE = ["anna-berger", "wiener-wohnwerk", "kalmar"].flatMap((slug) => {
  const g = golden(`logo/${slug}.json`);
  return Object.values(g.laeufe as Record<string, any>).flatMap((l: any) =>
    Object.values(l.seeds as Record<string, any>).flatMap((s: any) => s.kuratiert.slice(0, 3)),
  );
});
const T = Date.UTC(2026, 9, 27, 9);

describe("Kontakt (contact.ts)", () => {
  const PHONES = ["", "0660 1234567", "+43 1 234 56 78", "0043 664 12 34 567", "089 12345", "abc", "+49 30 1234567", "0316 123456"];
  const MAILS = ["", "anna@berger.at", "anna@", "a b@c.at", "x@y.z"];
  const WEBS = ["", "https://berger-immobilien.at/", "www.bérger.at", "kein web", "a.b/c d"];
  it("Telefon, E-Mail, Web, Fehler, Saeubern", () => {
    same(contact.formatPhone, ix.u1, PHONES.map((p) => [p]));
    same(contact.isValidPhone, ix.c1, PHONES.map((p) => [p]));
    same(contact.isValidEmail, ix.f1, MAILS.map((p) => [p]));
    same(contact.groupDigits, ix.cd, [["1234"], ["12345678"], ["123456789"]]);
    const kontakte = PHONES.map((phone, i) => ({
      ...ix.e0(),
      person: i % 2 ? " Anna Berger " : "",
      phone,
      email: MAILS[i % MAILS.length]!,
      web: WEBS[i % WEBS.length]!,
      legal: i === 3 ? "x".repeat(170) : " Berger GmbH ",
    }));
    same(contact.contactErrors, ix.p1, kontakte.map((k) => [k]));
    same(contact.cleanContact, ix.qC, kontakte.map((k) => [k]));
    same(contact.hasContactBasics, ix.XC, [...kontakte.map((k) => [k]), [null]]);
    same(contact.personFromText, ix.ZC, [["Anna Berger"], ["Anna"], ["a b c d e"], [" Dr Anna  Berger "]]);
    same(contact.stripPostcode, ix.YC, [["1190 Wien"], ["A-1010 Wien"], ["Wien"]]);
    expect(plain(contact.emptyContact())).toBe(plain(ix.e0()));
  });
});

describe("Namenspruefung und Texte (glyphs.ts, text.ts)", () => {
  const NAMEN = ["", "Anna Berger", "x".repeat(41), "!!!", "Zoë Ångström", "Łódź Ŧest", "Ǆ ǅ", "áb", "Berger​"];
  it("Problem, Text, Zusatz, Zeichen", () => {
    same(glyphs.nameProblem, ix.Tk, NAMEN.map((n) => [n]));
    same(glyphs.suffixProblem, ix.Mk, NAMEN.map((n) => [n]));
    for (const p of ["empty", "long", "chars", "glyphs"])
      same(glyphs.nameProblemText, ix.ou, NAMEN.map((n) => [p, n]));
    same(glyphs.describeChars, ix.Ek, [["ŦǄ"], ["á̂"], ["​"], ["ŦŊŋǄǅ​́"]]);
  });
  it("Gedankenstriche, Slug, Datum", () => {
    same(text.plainDashes, ix.ua, [["a – b — c − d"]]);
    same(text.slugify, ix.Lk, [["Anna Berger"], ["Müller & Söhne"], ["   "], ["Ærø Café"]]);
    same(text.padNumber, ix.lL, [[1], [42], [1234]]);
    for (const d of [0, 1, 2, 40]) same(text.formatSavedAt, ix.Fk, [[T - d * 864e5, T]]);
  });
});

describe("Projekt (project.ts)", () => {
  const FORMS = MARKEN.map((m, i) => ({
    rawName: i === 2 ? `${m.rawName} GmbH` : m.rawName,
    suffixChoice: ["Immobilien", "none", "custom", "Real Estate"][i % 4]!,
    customSuffix: " Wohnwerk ",
    keepLegalForm: i % 2 === 0,
    place: i === 1 ? " Graz " : m.place,
    nameKind: m.nameKind,
  }));
  it("Anlegen, Name, Stil, Filter, Favoriten, Editor, Kopie", () => {
    same(project.createProject, ix.Ik, FORMS.map((f, i) => [f, T, `id${i}`]));
    const projekte = FORMS.map((f, i) => ix.Ik(f, T, `id${i}`));
    same(project.applyNameForm, ix.l0, projekte.map((p, i) => [p, FORMS[(i + 1) % FORMS.length]]));
    same(project.chooseStyle, ix.pL, projekte.flatMap((p) => [[p, "elegant"], [p, "mix"]]));
    const filter = { wordmarkOnly: true, styles: ["modern"], colorMoods: ["navy"], themes: ["haus"] };
    same(project.applyFilters, ix.mL, projekte.map((p) => [p, filter]));
    const c = KONZEPTE[0];
    const d = KONZEPTE[1];
    same(project.toggleFavorite, ix.gL, projekte.map((p) => [p, c, 3]));
    same(project.toggleFavorite, ix.gL, [[ix.gL(projekte[0], c, 3), c, 3]]);
    same(project.startEditing, ix.vL, projekte.map((p) => [p, c, 2]));
    const ed = ix.vL(projekte[0], c, 2);
    same(project.updateEditing, ix.yL, [[ed, d], [projekte[0], d]]);
    same(project.selectEditing, ix.xL, [[ix.yL(ed, d)], [projekte[0]]]);
    same(project.projectStatus, ix.Dk, [[projekte[0]], [ed], [{ ...ed, kitDone: true }]]);
    same(project.duplicateProject, ix.Uk, [[projekte[0], T + 5, "kopie"]]);
    same(project.projectName, ix.lr, projekte.map((p) => [p]));
    same(project.withChosenName, ix.hL, [[projekte[0], { name: "Weitblick", suffix: "Realitäten", kind: "kunst" }, c]]);
  });
  it("Rechtsform, Zusatz, Kontext", () => {
    const RAW = ["Berger Immobilien GmbH", "Berger & Co KG", "Berger e.U.", "GmbH", "Anna Berger"];
    same(project.splitLegalForm, ix.vo, RAW.map((r) => [r]));
    same(project.logoNameOf, ix.a0, RAW.flatMap((r) => [[r, true], [r, false]]));
    same(project.suffixChoiceOf, ix.i0, [[""], ["Immobilien"], ["Haus & Hof"], [undefined]]);
    same(project.suffixOf, ix.s0, [["none", ""], ["custom", " x ".repeat(20)], ["Immobilien", ""]]);
    const ctx = [
      { person: " Anna ", keywords: ["Altbau", "Altbau", " ", "x".repeat(50)], focus: ["wohnen", "boote"] },
      {},
      { company: "Wohnwerk" },
    ];
    same(project.nameContextOf, ix.fL, ctx.map((c) => [c]));
  });
});

describe("Speicher (persist.ts)", () => {
  it("Sicherung, Index, Quota", () => {
    const p = ix.Ik({ rawName: "Anna Berger", suffixChoice: "Immobilien", customSuffix: "", keepLegalForm: false }, T, "p1");
    expect(persist.backupJson(p, T)).toBe(ix.Hk(p, T));
    expect(persist.serializeProject(p)).toBe(ix._k(p));
    same(persist.isQuotaError, ix.Gk, [[{ name: "QuotaExceededError" }], [{ name: "x" }], [null]]);
    const neu = new Map<string, string>();
    const alt = new Map<string, string>();
    const store = (m: Map<string, string>) => ({
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
    });
    persist.writeProject(store(neu), p);
    ix.zk(store(alt), p);
    persist.writeProject(store(neu), { ...p, id: "p2" });
    ix.zk(store(alt), { ...p, id: "p2" });
    persist.deleteProject(store(neu), "p1");
    ix.jk(store(alt), "p1");
    expect([...neu]).toEqual([...alt]);
    expect(persist.readIndex(store(neu))).toEqual(ix.Mc(store(alt)));
  });
});

describe("Router (route.ts)", () => {
  const HASHES = [
    "", "#/", "#/neu/name", "#/kompass", "#/kompass/3", "#/kompass/9", "#/kompass/routen",
    "#/neu/namen?art=kunst,person&ansicht=gemerkt&name=abc|x&mehr=1", "#/neu", "#/neu/namen?art=BAD",
    "#/p/abc/name", "#/p/abc/stil", "#/p/abc/auswahl?ansicht=gemerkt", "#/p/abc/logo/c123?tab=schriftdetails",
    "#/p/abc/logo/c123?tab=text", "#/p/abc/logo/c123?tab=anordnung&texte=1", "#/p/abc/logo",
    "#/p/abc/kit", "#/p/abc/postings?objekt=obj12345&anlass=verkauft", "#/p/abc/objekte?objekt=obj12345",
    "#/p/x%20y/kit", "#/unbekannt",
  ];
  it("Lesen, Schreiben, Schritte, Titel", () => {
    same(route.parseRoute, ix.wn, HASHES.map((h) => [h]));
    const routes = HASHES.map((h) => ix.wn(h));
    same(route.routeHash, ix.za, routes.map((r) => [r]));
    same(route.stepOf, ix.lu, routes.map((r) => [r]));
    same(route.routeTitles, ix.Jk, routes.map((r) => [r]));
    same(route.editorTabOf, ix.Kk, [["schrift"], ["schriftdetails"], ["anordnung"], ["text"], [null], ["xx"]]);
    const p = ix.Ik({ rawName: "Anna", suffixChoice: "none", customSuffix: "", keepLegalForm: false }, T, "p1");
    const ed = ix.vL({ ...p, styleChoice: "elegant", selected: KONZEPTE[0] }, KONZEPTE[0], 1);
    for (const step of [1, 2, 3, 4, 5, 6]) same(route.stepRoute, ix.gS, [[p, step], [ed, step]]);
  });
});

describe("Namensfinder-Zustand (nameDraft.ts)", () => {
  it("Leerzustand, Parser, Vorlieben", () => {
    same(nameDraft.emptyFinderState, ix.Mg, [[7], [123456]]);
    const roh = [
      null,
      "kaputt",
      JSON.stringify({ seed: 5, person: "Anna", saved: [{ name: "Lume", kind: "kunst", id: "x" }, { name: 3 }], chips: ["kurz", 4], focus: ["wohnen"], batches: [{ names: [] }], learn: { liked: ["a"], lenCap: 7 } }),
      JSON.stringify({ seed: -1, submitted: true, hidden: [{ name: "Haus", kind: "wort" }], maxLength: 99, creativity: "wild" }),
    ];
    for (const r of roh) {
      const a = nameDraft.parseFinderState(r);
      const b = ix.rC(r);
      expect(plain(a)).toBe(plain(b));
      expect(plain(nameDraft.finderPrefs(a))).toBe(plain(ix.$L(b)));
      expect(nameDraft.isFinderComplete(a)).toBe(ix.zL(b));
    }
  });
});

describe("Kompass-Zustand und Routen-Hilfen (kompassDraft.ts, kompass.ts)", () => {
  it("Leerzustand, Parser, Start, Name", () => {
    same(kompassDraft.emptyKompass, ix.Rg, [[9]]);
    for (const b of BRIEFS) {
      const raw = JSON.stringify({ brief: b, seed: 3, mutiger: { serif: 0.5 }, gemerkt: ["A"], schritt: 4 });
      expect(plain(kompassDraft.parseKompass(raw))).toBe(plain(ix.pC(raw)));
      same(kompassDraft.withStartFields, ix.vC, [[b, { name: " Weitblick ", person: "Anna", place: "Wien" }], [b, {}]]);
      same(kompassDraft.kompassName, ix.KL, [[b], [{ ...b, hasName: true, name: "Lume" }]]);
    }
    same(kompassDraft.parseKompass, ix.pC, [["{}"], [null], ["[]"], ['{"brief":{"version":2},"seed":"x"}']]);
  });
  it("Vorschau, Routen, mutiger, Projekt und Namensfinder aus einer Route", () => {
    for (const b of BRIEFS) {
      same(kompass.previewInput, kp.Zn, [[b]]);
      same(kompass.previewInputFor, kp.Xn, [[b, briefPreviewParams(b)]]);
      const state = { brief: b, seed: 11, mutiger: {}, gemerkt: [], schritt: 6 };
      same(kompass.routesForState, kp.Yn, [[state]]);
      same(kompass.shiftMutiger, kp.er, [[state, "serif", 1], [{ ...state, mutiger: { serif: 0.5 } }, "serif", -1]]);
    }
    for (const r of ROUTES.slice(0, 9)) {
      const b = BRIEFS[0];
      const a = kompass.projectFromRoute(b, r, "Berger Realitäten", { fromFinder: true });
      const o = kp.nr(b, r, "Berger Realitäten", { fromFinder: true });
      expect(plain({ ...a, id: 0, createdAt: 0, updatedAt: 0, seed: 0, ui: { ...a.ui, route: "" } })).toBe(
        plain({ ...o, id: 0, createdAt: 0, updatedAt: 0, seed: 0, ui: { ...o.ui, route: "" } }),
      );
      const form = ix.Mg(5);
      same(kompass.nameFinderFromRoute, kp.rr, [[form, b, r], [{ ...form, region: "Graz", keywords: "Altbau" }, b, r]]);
    }
  });
});

describe("Einstellungen und Beschreibungen (settings.ts, describe.ts)", () => {
  it("Einstellungen lesen", () => {
    same(settings.parseSettings, nc._, [[null], ["x"], ["[]"], ['{"kiVorauswahl":true}'], ['{"intern":true,"signatureEntwuerfe":true}'], ['{"signatureEntwuerfe":true}']]);
    same(settings.draftsFromQuery, nc.Z, [["?entwuerfe=1"], ["?entwuerfe=0"], [""]]);
  });
  it("Logo-Beschreibung", () => {
    for (const c of KONZEPTE) {
      same(describeLogic.describeConcept, ds.g, [[c, 3], [c, undefined]]);
      same(describeLogic.symbolLabel, ds.u, [[c]]);
      same(describeLogic.fontCatLabel, ds.m, [[c]]);
      same(describeLogic.fontFamilyLabel, ds.S, [[c.name.font.key], ["gibtsnicht"]]);
    }
  });
});
