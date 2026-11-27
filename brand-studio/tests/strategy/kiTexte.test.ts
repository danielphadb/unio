// @vitest-environment jsdom
// KI-Texte: Einwilligung, Rueckfall auf Regeltexte, keine Kontaktdaten, Pruefung jedes Textes.
// Abgleich mit dem Client der gesicherten Fassung (Routes-Chunk `Me`, `Ae`).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { recovered } from "../helpers/recovered";
import { buildStrategieRequest, kiTexte, mergeKiTexte, pruefeKiTexte } from "../../src/strategy/kiTexte";
import type { BrandBrief, BrandRoute } from "../../src/strategy/types";

const golden = JSON.parse(
  readFileSync(join(__dirname, "..", "golden", "strategy", "routes.json"), "utf8"),
) as Record<string, { brief: BrandBrief; laeufe: Record<string, BrandRoute[]> }>;
const fall = golden["anna-berger"]!;
const routes = fall.laeufe.standard!;

const hooks = (n: number): string[] =>
  ["Erstens", "Zweitens", "Drittens", "Viertens", "Fuenftens"].slice(0, n).map((w) => `${w} ein Gedanke zu Häusern.`);
const woerter = (n: number): string => Array.from({ length: n }, () => "Wort").join(" ");

const gueltig = {
  kernidee: "Anna Berger berät zuerst und verkauft dann.",
  claim: "Rat, der hält.",
  positionierung: "Für Eigentümer in Wien. Anders als die großen Netzwerke berät sie zuerst. Weil Rat trägt.",
  storyKurz: woerter(30),
  storyMittel: woerter(80),
  tonBeispiele: ["Wir sagen offen, was geht.", "Erst der Plan, dann der Preis."],
  versprechen: "Sie bekommen zuerst einen Rat.",
  persoenlichkeit: [
    { eigenschaft: "Ruhig", satz: "Bleibt ruhig." },
    { eigenschaft: "Klar", satz: "Sagt es klar." },
    { eigenschaft: "Nah", satz: "Ist erreichbar." },
  ],
  socialKit: {
    profiltext: "Beratung vor dem Verkauf in Wien.",
    saeulen: [
      { titel: "Rat", hooks: hooks(5) },
      { titel: "Viertel", hooks: hooks(4) },
      { titel: "Verkauf", hooks: hooks(5) },
    ],
  },
};

const antwort = (texte: object) => ({
  ok: true,
  routen: [{ id: "A", texte }],
  modell: "claude-opus-5-5",
  nutzung: { eingabe: 1, ausgabe: 1, cache: 0 },
});

const okFetch = (body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));

let ro: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  ro = await recovered("Routes");
});

describe("Anfrage", () => {
  it("gleich wie die gesicherte Fassung", () => {
    for (const g of Object.values(golden))
      for (const r of Object.values(g.laeufe))
        expect(JSON.stringify(buildStrategieRequest(g.brief, r))).toBe(JSON.stringify(ro.Me(g.brief, r)));
  });

  it("ohne Kontaktdaten: Freitexte mit Mail, Telefon oder Web fallen weg", () => {
    const brief: BrandBrief = {
      ...fall.brief,
      proof: "Ruf an: +43 660 123 45 67",
      onlynessText: "Mehr auf www.beispiel.at",
      place: "anna@beispiel.at",
    };
    const req = buildStrategieRequest(brief, routes)!;
    expect(req.brief.beleg).toBeUndefined();
    expect(req.brief.onlynessText).toBeUndefined();
    expect(req.brief.ort).toBeUndefined();
    expect(req.brief.name).toBe("Anna Berger");
    expect(req.routen).toHaveLength(3);
  });

  it("nur mit genau drei Routen", () => {
    expect(buildStrategieRequest(fall.brief, routes.slice(0, 2))).toBeNull();
  });
});

describe("Pruefung der KI-Texte", () => {
  it("gueltige Texte werden uebernommen, mit Quelle ki", () => {
    const neu = mergeKiTexte(routes, antwort(gueltig), fall.brief);
    expect(neu[0]!.texte.quelle).toBe("ki");
    expect(neu[0]!.texte.claim).toBe("Rat, der hält");
    expect(neu[0]!.texte.storyMittel).toBe(woerter(80));
    expect(neu[1]).toBe(routes[1]);
    expect(JSON.stringify(neu)).toBe(JSON.stringify(ro.Ae(routes, antwort(gueltig), fall.brief)));
  });

  it("Klischees, erfundene Zahlen, zu lange Texte und falsche Claims fallen weg", () => {
    const geprueft = pruefeKiTexte(
      {
        kernidee: "Ihr Partner für Traumimmobilien.",
        onlyness: "Seit 25 Jahren in Wien.",
        claim: "Beraten statt verkaufen",
        storyKurz: woerter(36),
        storyMittel: woerter(60),
        tonBeispiele: ["Nur einer."],
        versprechen: "Wir sind immer da.",
        persoenlichkeit: [
          { eigenschaft: "Ruhig", satz: "a" },
          { eigenschaft: "Ruhig", satz: "b" },
          { eigenschaft: "Klar", satz: "c" },
        ],
        socialKit: { profiltext: "x", saeulen: [{ titel: "A", hooks: hooks(3) }] },
      },
      fall.brief,
    );
    expect(geprueft).toEqual({});
  });

  it("Gedankenstriche und Ausrufezeichen werden geglaettet", () => {
    const geprueft = pruefeKiTexte({ kernidee: "Ruhig \u2013 und genau!" }, fall.brief);
    expect(geprueft.kernidee).toBe("Ruhig, und genau.");
  });

  it("Zahlen aus dem eigenen Beleg sind erlaubt", () => {
    const brief = { ...fall.brief, proof: "Zinshaus in Ottakring, 14 Parteien, in 9 Wochen verkauft." };
    expect(pruefeKiTexte({ kernidee: "14 Parteien in 9 Wochen." }, brief).kernidee).toBe("14 Parteien in 9 Wochen.");
    expect(pruefeKiTexte({ kernidee: "15 Parteien." }, brief).kernidee).toBeUndefined();
  });
});

describe("Aufruf mit Rueckfall", () => {
  it("ohne Einwilligung kein Aufruf", async () => {
    const f = okFetch(antwort(gueltig));
    expect(await kiTexte(fall.brief, routes, { einwilligung: false, fetchImpl: f })).toBe(routes);
    expect(await kiTexte(fall.brief, routes)).toBe(routes);
    expect(f).not.toHaveBeenCalled();
  });

  it("mit Einwilligung: POST an den Endpunkt, Texte uebernommen", async () => {
    const f = okFetch(antwort(gueltig));
    const neu = await kiTexte(fall.brief, routes, { einwilligung: true, fetchImpl: f });
    expect(f).toHaveBeenCalledOnce();
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/brand-strategie");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual(JSON.parse(JSON.stringify(buildStrategieRequest(fall.brief, routes))));
    expect(neu[0]!.texte.quelle).toBe("ki");
  });

  it("Fehler, Bremse, Abbruch und Zeitlimit: Regeltexte bleiben", async () => {
    const fehler = vi.fn(async () => new Response(JSON.stringify({ ok: false, fallback: "regel" }), { status: 503 }));
    expect(await kiTexte(fall.brief, routes, { einwilligung: true, fetchImpl: fehler })).toBe(routes);
    const wirft = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await kiTexte(fall.brief, routes, { einwilligung: true, fetchImpl: wirft })).toBe(routes);
    const haengt = vi.fn(
      (_u: string, init: RequestInit) =>
        new Promise<Response>((_r, reject) => init.signal!.addEventListener("abort", () => reject(new Error("abort")))),
    );
    expect(await kiTexte(fall.brief, routes, { einwilligung: true, fetchImpl: haengt as unknown as typeof fetch, timeoutMs: 5 })).toBe(routes);
    const ac = new AbortController();
    ac.abort();
    const f = okFetch(antwort(gueltig));
    expect(await kiTexte(fall.brief, routes, { einwilligung: true, fetchImpl: f, signal: ac.signal })).toBe(routes);
    expect(f).not.toHaveBeenCalled();
  });
});
