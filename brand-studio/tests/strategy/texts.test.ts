// Regeltexte der Routen: Regeln fuer jeden Text (keine Gedankenstriche, keine Ausrufezeichen,
// Claim hoechstens 5 Woerter) und die Textbausteine je Territorium.
import { describe, expect, it } from "vitest";
import territoryData from "../../src/strategy/territories.json";
import catalog from "../../src/strategy/catalog.json";
import snapshot from "../../src/strategy/texts.snapshot.json";
import inputs from "../golden/inputs.json";
import {
  GEDANKENSTRICH,
  cleanText,
  countWords,
  fillTemplate,
  findCliche,
  isValidClaim,
  mitPraeposition,
  routeTexts,
} from "../../src/strategy/texts";
import type { BrandBrief, RouteArt, RouteTexts, Territory } from "../../src/strategy/types";

const TERRITORIES = territoryData as unknown as Territory[];
const ARTEN: RouteArt[] = ["sicher", "mutig", "ueberraschend"];

const BRIEFE: BrandBrief[] = [
  { version: 1 },
  ...inputs.marken.map((m) => ({ version: 1 as const, ...(m.brief as object), hasName: true, name: m.rawName })),
  ...inputs.zusatzBriefe.map((z) => ({ version: 1 as const, ...(z.brief as object) })),
  {
    version: 1,
    architecture: "person",
    person: "Clara Wimmer",
    place: "Weinviertel",
    proof: "„Haus“ in Mistelbach – 3 Angebote! In 9 Wochen verkauft.",
    wunschkunde: ["familie", "landwunsch"],
    werte: ["naehe", "mut"],
    wirkung: ["herzlich"],
    fremdbild: ["ruhig", "aufrichtig"],
    avoidCliches: ["gold-schwarz", "haus-icon"],
    social: { channels: ["instagram", "linkedin"], camera: "objekte", hoursPerWeek: 0.5, formats: { reel: "gern", live: "nie" }, never: ["familie", "preise"] },
  },
] as BrandBrief[];

/** Alle Texte einer Route als flache Liste. */
function alleTexte(t: RouteTexts): string[] {
  return [
    t.kernidee,
    t.warum,
    t.onlyness,
    t.positionierung,
    t.claim,
    t.storyKurz,
    t.storyMittel,
    ...t.tonBeispiele,
    ...t.leitplanken,
    t.passtFuer,
    t.risiko,
    ...(t.socialKit?.saeulen.flatMap((s) => [s.titel, ...s.hooks]) ?? []),
    t.socialKit?.profiltext ?? "",
    ...(t.persoenlichkeit?.flatMap((p) => [p.eigenschaft, p.satz]) ?? []),
    t.wunschkunde ?? "",
    t.versprechen ?? "",
    ...(t.formate?.flatMap((f) => [f.format, f.rhythmus, f.satz]) ?? []),
  ];
}

describe("Textregeln", () => {
  it("Claim-Regel: 1 bis 5 Woerter, ohne Klischee, Gegensatz, Ziffern, ! ? und Gedankenstrich", () => {
    expect(isValidClaim("Rat, der sich bewährt")).toBe(true);
    expect(isValidClaim("Häuser kennen, Menschen kennen")).toBe(true);
    expect(isValidClaim("Sechs Wörter sind hier eins zuviel")).toBe(false);
    expect(isValidClaim("")).toBe(false);
    expect(isValidClaim("Ihr Traumhaus wartet")).toBe(false);
    expect(isValidClaim("Beraten statt verkaufen")).toBe(false);
    expect(isValidClaim("Erst fragen, dann bauen")).toBe(false);
    expect(isValidClaim("Seit 1990 da")).toBe(false);
    expect(isValidClaim("Gut verkauft!")).toBe(false);
    expect(isValidClaim("Ruhig – genau")).toBe(false);
  });

  it("Glaetten ersetzt Gedankenstriche und Ausrufezeichen", () => {
    expect(cleanText("Ruhig — genau!!  Und  gut ,, fertig .")).toBe("Ruhig, genau. Und gut, fertig.");
    expect(countWords("Ein Satz – mit 3 Teilen.")).toBe(5);
  });

  it("Klischee-Pruefung", () => {
    expect(findCliche("Ihre Traumimmobilie in bester Lage")).toBe("Traumimmobilie");
    expect(findCliche("Exklusiv wohnen")).toBe("Exklusiv");
    expect(findCliche("Ein ruhiger Verkauf")).toBeNull();
  });

  it("Ort mit Praeposition und Platzhalter", () => {
    expect(mitPraeposition("Weinviertel")).toBe("im Weinviertel");
    expect(mitPraeposition("Wachau")).toBe("in der Wachau");
    expect(mitPraeposition("Gmunden")).toBe("in Gmunden");
    expect(mitPraeposition("Wien")).toBe("in Wien");
    expect(fillTemplate("{marke} verkauft in {ort}.", "Kalmar", "Weinviertel")).toBe("Kalmar verkauft im Weinviertel.");
    expect(fillTemplate("{marke} verkauft in {ort}.", undefined, undefined)).toBe("Die Marke verkauft in der Region.");
    expect(fillTemplate("Bei {marke} zählt es.", undefined, "Wien", "Ihr Makler")).toBe("Bei Ihrem Makler zählt es.");
  });

  it("Daten ohne Gedankenstriche", () => {
    const daten = JSON.stringify([territoryData, catalog, snapshot]);
    expect(GEDANKENSTRICH.test(daten)).toBe(false);
  });
});

describe("Regeltexte je Territorium", () => {
  it("jeder Text ohne Gedankenstrich und Ausrufezeichen, Claim hoechstens 5 Woerter", () => {
    for (const t of TERRITORIES)
      for (const brief of BRIEFE)
        for (const art of ARTEN) {
          const texte = routeTexts(t, brief, art, { seed: 1234 });
          const wo = `${t.id}/${art}/${brief.name ?? brief.person ?? "-"}`;
          for (const s of alleTexte(texte)) {
            expect(GEDANKENSTRICH.test(s), `${wo}: ${s}`).toBe(false);
            expect(s.includes("!"), `${wo}: ${s}`).toBe(false);
            expect(s.includes("{"), `${wo}: ${s}`).toBe(false);
          }
          expect(isValidClaim(texte.claim) || texte.claim === "Häuser, gut begleitet", wo).toBe(true);
          expect(countWords(texte.claim), wo).toBeLessThanOrEqual(5);
          expect(countWords(texte.storyKurz), wo).toBeLessThanOrEqual(35);
          expect(texte.positionierung.startsWith("Für "), wo).toBe(true);
          expect(texte.persoenlichkeit, wo).toHaveLength(3);
          expect(texte.socialKit!.saeulen, wo).toHaveLength(3);
          expect(texte.socialKit!.profiltext.length, wo).toBeLessThanOrEqual(150);
          expect(texte.quelle).toBe("regel");
        }
  });

  it("gleiche Eingaben ergeben gleiche Texte, der Seed waehlt den Claim", () => {
    const t = TERRITORIES[0]!;
    const brief = BRIEFE[1]!;
    expect(routeTexts(t, brief, "sicher", { seed: 7 })).toEqual(routeTexts(t, brief, "sicher", { seed: 7 }));
    const claims = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((s) => routeTexts(t, brief, "sicher", { seed: s }).claim));
    expect(claims.size).toBeGreaterThan(1);
  });

  it("Social-Kit beachtet Zeit, Kamera und was nie gezeigt wird", () => {
    const brief = BRIEFE[BRIEFE.length - 1]!;
    for (const t of TERRITORIES) {
      const texte = routeTexts(t, brief, "mutig", { seed: 1 });
      for (const s of texte.socialKit!.saeulen) {
        expect(s.hooks.length).toBeLessThanOrEqual(4);
        for (const h of s.hooks) expect(/famili|kinder|generation|preis|kosten|provision|€/i.test(h), h).toBe(false);
      }
      expect(texte.formate!.length).toBeLessThanOrEqual(2);
      expect(texte.formate!.some((f) => f.format === "Live")).toBe(false);
    }
  });

  it("Leitplanken enthalten die Sperren aus Nicht ich", () => {
    const brief = BRIEFE[BRIEFE.length - 1]!;
    const texte = routeTexts(TERRITORIES[2]!, brief, "sicher", { seed: 1 });
    expect(texte.leitplanken).toContain("Nie Gold auf Schwarz.");
    expect(texte.leitplanken).toContain("Kein Haus, kein Dach und keine Tür als Zeichen.");
  });

  it("Beleg: ohne Anfuehrungszeichen, Gedankenstrich und Ausrufezeichen", () => {
    const brief = BRIEFE[BRIEFE.length - 1]!;
    const texte = routeTexts(TERRITORIES[0]!, brief, "sicher", { seed: 1 });
    expect(texte.storyMittel).toContain("Ein Beispiel aus der Praxis: Haus in Mistelbach, 3 Angebote. In 9 Wochen verkauft.");
  });
});
