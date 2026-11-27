// @vitest-environment jsdom
// Drei Routen: bitgenau gegen den Golden Master (tests/golden/strategy/routes.json) und gegen
// die gesicherte Fassung (kompass-Chunk `Dn`, `Pe`, `Qn`), dazu Eigenschaften aus docs/18:
// Rollen, Verschiedenheit, Sperren aus "Nicht ich", Vorlagen je Route nach Eignung, Seed.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import {
  TERRITORIES,
  VORLAGEN_GESPERRT,
  briefPreviewParams,
  briefSeed,
  briefToAxes,
  chooseRoutes,
  clearlyDifferent,
  emptyBrief,
  routeToBrandInputPatch,
  routeToNameInput,
} from "../../src/strategy";
import { ALL_TEMPLATES } from "../../src/signature";
import type { BrandBrief, BrandRoute } from "../../src/strategy/types";

interface GoldenLauf {
  brief: BrandBrief;
  laeufe: Record<string, BrandRoute[]>;
}
const golden = JSON.parse(
  readFileSync(join(__dirname, "..", "golden", "strategy", "routes.json"), "utf8"),
) as Record<string, GoldenLauf>;

const plain = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const seedOf = (lauf: string): { seed?: number } => (lauf === "standard" ? {} : { seed: Number(lauf.slice(4)) });

let ko: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  ko = await recovered("kompass");
});

describe("Golden Master", () => {
  for (const [slug, { brief, laeufe }] of Object.entries(golden))
    for (const [lauf, erwartet] of Object.entries(laeufe))
      it(`${slug} ${lauf}: Parameter und Texte bitgenau`, () => {
        expect(JSON.stringify(chooseRoutes(brief, seedOf(lauf)))).toBe(JSON.stringify(erwartet));
      });
});

/** Erfundene Briefe quer durch den Katalog (fester Zufall). */
function briefe(anzahl: number): { brief: BrandBrief; opts: Parameters<typeof chooseRoutes>[1] }[] {
  let s = 20261027;
  const r = (): number => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const pick = <T>(a: readonly T[]): T => a[Math.floor(r() * a.length)] as T;
  const some = <T>(a: readonly T[], max: number): T[] => [
    ...new Set(Array.from({ length: Math.floor(r() * (max + 1)) }, () => pick(a))),
  ];
  const out: { brief: BrandBrief; opts: Parameters<typeof chooseRoutes>[1] }[] = [];
  for (let i = 0; i < anzahl; i++) {
    const b: Record<string, unknown> = { version: 1 };
    if (r() < 0.8) b.architecture = pick(["person", "buero", "person-dann-buero"]);
    if (r() < 0.5) b.person = pick(["Anna Berger", "Lena Hofer", "Max Gruber"]);
    if (r() < 0.4) Object.assign(b, { hasName: true, name: pick(["Kalmar", "Wiener Wohnwerk", "Brandl & Söhne"]) });
    if (r() < 0.8) b.place = pick(["Wien", "Weinviertel", "Wachau", "Gmunden", "Graz", "Döbling"]);
    if (r() < 0.7) b.focus = some(["wohnen", "haeuser", "luxus", "anleger", "gewerbe", "neubau", "land"], 3);
    if (r() < 0.6) b.segment = pick(["einstieg", "mitte", "premium", "luxus"]);
    if (r() < 0.6) b.side = pick([-2, -1, 0, 1, 2]);
    if (r() < 0.6) b.alternative = pick(["franchise", "bank", "platzhirsch", "online", "privat"]);
    if (r() < 0.7) b.onlyness = some(["graetzl", "bewertung", "substanz", "diskret", "rendite", "region"], 2);
    if (r() < 0.5) b.werte = some(["ehrlichkeit", "naehe", "tempo", "mut", "offenheit"], 2);
    if (r() < 0.5) b.wunschkunde = some(["erstkauf", "familie", "erbe", "anleger", "landwunsch"], 2);
    if (r() < 0.6)
      b.voice = Object.fromEntries(some(["formell", "ernst", "sachlich", "leise"], 4).map((k) => [k, pick([-1, 0, 1])]));
    if (r() < 0.5)
      b.logoPairs = Object.fromEntries(
        some(["serif", "contrast", "caps", "width", "symbol", "dark"], 4).map((k) => [k, pick(["a", "b", "egal"])]),
      );
    if (r() < 0.4) b.colorPairs = Object.fromEntries(some(["warmth", "saturation"], 2).map((k) => [k, pick(["a", "b", "egal"])]));
    if (r() < 0.3) b.avoidColors = some(["gold", "navy", "gruen", "terra", "schwarz", "blau", "bordeaux", "sand"], 3);
    if (r() < 0.4)
      b.avoidCliches = some(["gold-schwarz", "haus-icon", "skyline", "schluessel", "schreibschrift", "monogramm-kreis"], 4);
    if (r() < 0.7) b.reference = pick(["verlag", "uhrmacher", "architektur", "privatbank", "cafe", "tech", "sport", "mode"]);
    if (r() < 0.4) b.social = { channels: some(["instagram", "linkedin", "tiktok"], 2), camera: pick(["gesicht", "objekte"]) };
    const opts = r() < 0.4 ? {} : { seed: Math.floor(r() * 1e6), ...(r() < 0.3 ? { mutiger: { A: 0.5, C: -1 } } : {}) };
    out.push({ brief: b as unknown as BrandBrief, opts });
  }
  return out;
}

describe("gleich wie die gesicherte Fassung", () => {
  it("chooseRoutes, Achsen und Vorschau fuer 60 erfundene Briefe", () => {
    for (const { brief, opts } of briefe(60)) {
      const wo = JSON.stringify({ brief, opts });
      expect(JSON.stringify(chooseRoutes(brief, opts)), wo).toBe(JSON.stringify(ko.Dn(brief, opts)));
      expect(plain(briefToAxes(brief)), wo).toEqual(plain(ko.Pe(brief)));
      expect(JSON.stringify(briefPreviewParams(brief)), wo).toBe(JSON.stringify(ko.Qn(brief)));
    }
  });
});

describe("Eigenschaften", () => {
  const alle = Object.values(golden).flatMap((g) => [chooseRoutes(g.brief), chooseRoutes(g.brief, { seed: 7 })]);

  it("A sicher, B mutig, C ueberraschend, drei verschiedene Territorien", () => {
    for (const routes of alle) {
      expect(routes.map((r) => `${r.id}:${r.art}`)).toEqual(["A:sicher", "B:mutig", "C:ueberraschend"]);
      expect(new Set(routes.map((r) => r.territory)).size).toBe(3);
      for (const r of routes) expect(TERRITORIES.some((t) => t.id === r.territory && t.titel === r.titel)).toBe(true);
    }
  });

  it("Verschiedenheit: jedes Paar unterscheidet sich in 2 von 3 Merkmalen", () => {
    for (const [a, b, c] of alle) {
      expect(clearlyDifferent(a!.params, b!.params)).toBe(true);
      expect(clearlyDifferent(a!.params, c!.params)).toBe(true);
      expect(clearlyDifferent(b!.params, c!.params)).toBe(true);
    }
  });

  it("Rollen: Logo-Arten je Route, eine Route traegt die Vorlagen", () => {
    for (const routes of alle) {
      for (const r of routes) {
        const m = r.params.kindMix;
        expect(m.wortmarke + m.monogramm + m.zeichen + m.vorlage).toBeCloseTo(1, 2);
      }
      const mitVorlagen = routes.filter((r) => (r.params.signatureIds ?? []).length >= 4);
      if (mitVorlagen.length) expect(routes.some((r) => r.params.kindMix.vorlage >= 0.58)).toBe(true);
      else expect(routes.every((r) => r.params.kindMix.wortmarke >= 0.64)).toBe(true);
    }
  });

  it("Vorlagen je Route: freigegeben, nicht gesperrt, keine doppelt", () => {
    const freigegeben = new Set(ALL_TEMPLATES.filter((t) => t.freigabe === "freigegeben").map((t) => t.id));
    for (const routes of alle) {
      const ids = routes.flatMap((r) => r.params.signatureIds ?? []);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(freigegeben.has(id), id).toBe(true);
        expect(VORLAGEN_GESPERRT.includes(id), id).toBe(false);
      }
    }
  });

  it("Sperren aus Nicht ich gelten in jeder Route", () => {
    const brief: BrandBrief = {
      version: 1,
      architecture: "buero",
      place: "Salzburg",
      avoidColors: ["navy"],
      avoidCliches: ["gold-schwarz", "haus-icon", "schreibschrift", "monogramm-kreis", "skyline", "schluessel"],
    };
    for (const r of chooseRoutes(brief)) {
      const p = r.params;
      expect(p.colorMoods).not.toContain("gold");
      expect(p.colorMoods).not.toContain("navy");
      expect(p.avoidColorMoods).toEqual(expect.arrayContaining(["gold", "navy"]));
      for (const th of ["haus", "dach", "tuer", "stadt", "schluessel"] as const) {
        expect(p.themes).not.toContain(th);
        expect(p.avoidThemes).toContain(th);
      }
      expect(p.fontForms).not.toContain("script");
      expect(p.avoidFontForms).toContain("script");
      expect(p.avoidContainers).toEqual(expect.arrayContaining(["circle", "ring"]));
      expect(p.avoidPaletteIds?.length).toBeGreaterThan(0);
      expect(r.texte.leitplanken).toContain("Nie Gold auf Schwarz.");
    }
  });

  it("gleiche Antworten ergeben gleiche Routen, unabhaengig von der Reihenfolge der Felder", () => {
    const a: BrandBrief = { version: 1, place: "Wien", reference: "verlag", segment: "premium" };
    const b: BrandBrief = { segment: "premium", reference: "verlag", place: "Wien", version: 1 };
    expect(briefSeed(a)).toBe(briefSeed(b));
    expect(chooseRoutes(a)).toEqual(chooseRoutes(b));
    expect(chooseRoutes(a)[0]!.params.seed).toBe(briefSeed(a));
  });

  it("Neue Vorschlaege (Seed) behalten die Territorien und aendern offene Achsen", () => {
    for (const g of Object.values(golden)) {
      const standard = chooseRoutes(g.brief);
      const neu = chooseRoutes(g.brief, { seed: 99 });
      expect(neu.map((r) => r.territory)).toEqual(standard.map((r) => r.territory));
      expect(neu[0]!.params.seed).not.toBe(standard[0]!.params.seed);
    }
  });

  it("Mutiger verschiebt nur die eigene Route", () => {
    const brief = golden["anna-berger"]!.brief;
    const basis = chooseRoutes(brief);
    const mutig = chooseRoutes(brief, { mutiger: { B: 1 } });
    expect(mutig[0]!.params).toEqual(basis[0]!.params);
    expect(mutig[1]!.params.kindMix.vorlage).toBeGreaterThan(basis[1]!.params.kindMix.vorlage);
    expect(mutig[1]!.params.axes.saturation!.v).toBeGreaterThanOrEqual(basis[1]!.params.axes.saturation!.v);
  });

  it("leerer Brief: drei Routen mit Regeltexten", () => {
    const routes = chooseRoutes(emptyBrief());
    expect(routes).toHaveLength(3);
    for (const r of routes) expect(r.texte.quelle).toBe("regel");
  });
});

describe("Route auf Eingaben anwenden", () => {
  it("Logo-Eingabe: Stile, Farben, Themen ohne Sperren, Route", () => {
    const route = chooseRoutes(golden["wiener-wohnwerk"]!.brief)[0]!;
    const patch = routeToBrandInputPatch(route);
    expect(patch.styles).toEqual(route.params.styles.slice(0, 2));
    expect(patch.colorMoods).toEqual(route.params.colorMoods);
    for (const th of patch.themes) expect(route.params.avoidThemes).not.toContain(th);
    expect(patch.route).toBe(route.params);
  });

  it("Namensfinder: Person, Firma und Region nach Architektur", () => {
    const route = chooseRoutes(golden["anna-berger"]!.brief)[0]!;
    expect(routeToNameInput(route, { version: 1, architecture: "person", person: " Anna Berger ", place: "Wien" })).toMatchObject({
      person: "Anna Berger",
      region: "Wien",
      keywords: [],
    });
    expect(
      routeToNameInput(route, { version: 1, architecture: "buero", hasName: true, name: "Kalmar", person: "Anna" }),
    ).toMatchObject({ company: "Kalmar" });
    expect(routeToNameInput(route, { version: 1, hasName: true, name: "Kalmar" })).toMatchObject({ company: "Kalmar" });
    const ohne = routeToNameInput(route, { version: 1 });
    expect(ohne.person).toBeUndefined();
    expect(ohne.company).toBeUndefined();
    expect(ohne.route).toBe(route.params);
  });
});
