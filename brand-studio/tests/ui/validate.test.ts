// @vitest-environment jsdom
// Pruefung gespeicherter Daten (src/ui/logic/validate.ts) gegen die gesicherte Fassung: gleiche
// Werte werden gleich angenommen (gleiches Ergebnis) oder gleich abgelehnt (gleicher Pfad).
// Neben den Referenz-Daten laufen je Eingabe viele gezielt verdorbene Abwandlungen durch.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import * as V from "../../src/ui/logic/validate";
import { rng } from "../../src/engine/rng";

let ix: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  ix = await recovered("index");
}, 120000);

const root = join(__dirname, "..", "..");
const golden = (p: string) => JSON.parse(readFileSync(join(root, "tests", "golden", p), "utf8"));

function outcome(fn: (...a: any[]) => unknown, args: unknown[]): string {
  try {
    return `ok ${JSON.stringify(fn(...args))}`;
  } catch (e) {
    return `fehler ${(e as Error).name} ${(e as Error).message}`;
  }
}

const BOESE: unknown[] = [
  undefined, null, "", "x".repeat(300), 0, -1, 1e20, Number.NaN, true, [], {}, "\u0007",
  "#12345", "#abc", "Ungueltig mit Zeichen <>", ["a"], { a: 1 },
];

/** Abwandlungen: je Pfad (bis Tiefe 3) Feld entfernen oder durch einen boesen Wert ersetzen. */
function abwandlungen(wert: unknown, seed: number, anzahl = 120): unknown[] {
  const pfade: string[][] = [];
  const sammle = (v: unknown, pfad: string[]) => {
    if (pfad.length > 3 || !v || typeof v !== "object") return;
    for (const k of Object.keys(v as object)) {
      pfade.push([...pfad, k]);
      sammle((v as Record<string, unknown>)[k], [...pfad, k]);
    }
  };
  sammle(wert, []);
  const r = rng(seed);
  const out: unknown[] = [];
  for (let i = 0; i < anzahl && pfade.length; i++) {
    const kopie = JSON.parse(JSON.stringify(wert));
    const pfad = pfade[Math.floor(r.next() * pfade.length)]!;
    let ziel = kopie;
    for (const k of pfad.slice(0, -1)) ziel = ziel[k];
    const last = pfad[pfad.length - 1]!;
    if (r.next() < 0.25) delete ziel[last];
    else ziel[last] = BOESE[Math.floor(r.next() * BOESE.length)];
    out.push(kopie);
  }
  return out;
}

const MARKEN = golden("inputs.json").marken as Array<Record<string, any>>;
const ROUTEN = golden("strategy/routes.json") as Record<string, { brief: any; laeufe: any }>;
const KONZEPTE = ["anna-berger", "philipp-trattner", "wiener-wohnwerk", "seeblick-realitaeten", "kalmar"].flatMap((slug) => {
  const g = golden(`logo/${slug}.json`);
  return Object.values(g.laeufe as Record<string, any>).flatMap((l: any) =>
    Object.values(l.seeds as Record<string, any>).flatMap((s: any) => s.kuratiert),
  );
});
const INPUTS = ["anna-berger", "wiener-wohnwerk", "kalmar"].flatMap((slug) =>
  Object.values(golden(`logo/${slug}.json`).laeufe as Record<string, any>).map((l: any) => l.input),
);

function vergleiche(neu: (...a: any[]) => unknown, alt: (...a: any[]) => unknown, werte: unknown[], extra: unknown[] = []) {
  let angenommen = 0;
  let abgelehnt = 0;
  for (const w of werte) {
    const a = outcome(neu, [w, ...extra]);
    const b = outcome(alt, [w, ...extra]);
    expect(a).toBe(b);
    if (a.startsWith("ok")) angenommen++;
    else abgelehnt++;
  }
  return { angenommen, abgelehnt };
}

describe("validate.ts wie in der gesicherten Fassung", () => {
  it("Logo-Konzepte (PL) mit Abwandlungen", () => {
    const werte = KONZEPTE.flatMap((c, i) => [c, ...abwandlungen(c, i + 1, 40)]);
    const z = vergleiche(V.validateConcept, ix.PL, werte);
    expect(z.angenommen).toBeGreaterThanOrEqual(KONZEPTE.length);
    expect(z.abgelehnt).toBeGreaterThan(100);
  });
  it("Eingaben (DL) und Namen (AL)", () => {
    const werte = INPUTS.flatMap((x, i) => [x, ...abwandlungen(x, 100 + i, 80)]);
    vergleiche(V.validateInput, ix.DL, werte);
    const namen = [
      [{ name: "Lume", descriptor: "Immobilien", kind: "kunst" }],
      [{ name: "", kind: "x" }],
      Array.from({ length: 40 }, (_, i) => ({ name: `N${i}`, kind: "wort" })),
      "x",
      null,
    ];
    vergleiche(V.validateNames, ix.AL, [...namen, ...abwandlungen(namen[0], 7, 30)]);
  });
  it("Kontakt (UL) und Namenskontext (BL)", () => {
    const k = {
      person: "Anna Berger", role: "Maklerin", phone: "+43 660 1234567", email: "anna@berger.at",
      web: "berger.at", street: "Hauptstraße 1", city: "1190 Wien", unioPartner: true, legal: "Berger GmbH",
      instagram: "anna.berger", linkedin: "https://linkedin.com/in/anna", photo: "data:image/png;base64,AAAA",
      founded: "2004",
    };
    vergleiche(V.validateContact, ix.UL, [k, ...abwandlungen(k, 11, 150)]);
    const ctx = { person: "Anna", company: "Berger GmbH", keywords: ["Altbau", "Garten"], focus: ["wohnen"] };
    vergleiche(V.validateNameContext, ix.BL, [ctx, ...abwandlungen(ctx, 12, 60)]);
  });
  it("Kompass-Briefe (Lg) und Routen (JT)", () => {
    const briefs = Object.values(ROUTEN).map((r) => ({ version: 1, ...r.brief }));
    const z = vergleiche(V.validateBrief, ix.Lg, briefs.flatMap((b, i) => [b, ...abwandlungen(b, 200 + i, 80)]));
    expect(z.angenommen).toBeGreaterThanOrEqual(briefs.length);
    const routes = Object.values(ROUTEN).flatMap((r) => r.laeufe.standard);
    const y = vergleiche(V.validateRoute, ix.JT, routes.flatMap((r, i) => [r, ...abwandlungen(r, 300 + i, 60)]));
    expect(y.angenommen).toBeGreaterThanOrEqual(routes.length);
  });
  it("Gruendungsjahr und Bilddaten", () => {
    for (const j of ["2004", "1799", "2999", "20", "abcd"]) expect(V.isFoundingYear(j, new Date(Date.UTC(2026, 10, 27)))).toBe(ix.PT(j, new Date(Date.UTC(2026, 10, 27))));
    for (const d of [undefined, "", "data:image/png;base64,AAAA", "data:image/gif;base64,AAAA", "javascript:x"])
      expect(outcome(V.imageData, [d, "foto"])).toBe(outcome(ix.UT, [d, "foto"]));
  });
});
