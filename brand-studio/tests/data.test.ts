// Prueft die in W1 herausgezogenen Daten gegen die bekannten Zahlen.
import { describe, expect, it } from "vitest";
import names from "../src/engine/reference/names.json";
import wordsDb from "../src/engine/names/wordsDb.data.json";
import keywordFields from "../src/engine/reference/keyword-fields.json";
import namingRules from "../src/engine/reference/naming-rules.json";
import corpus from "../src/engine/reference/corpus.json";
import corpusTech from "../src/engine/reference/corpus-tech.json";
import recipes from "../src/engine/reference/recipes.json";
import fonts from "../src/engine/fonts.json";
import coverage from "../src/engine/coverage.json";
import territories from "../src/strategy/territories.json";
import elegant from "../src/signature/templates/elegant.json";
import luxus from "../src/signature/templates/luxus.json";
import modern from "../src/signature/templates/modern.json";
import mutig from "../src/signature/templates/mutig.json";
import natur from "../src/signature/templates/natur.json";
import warm from "../src/signature/templates/warm.json";
import kurz from "../src/signature/templates/kurz.json";
import mischung from "../src/signature/templates/mischung.json";
import kit from "../src/signature/templates/kit.json";
import partner from "../src/signature/templates/partner.json";

describe("Referenzdaten (W1)", () => {
  it("Wortdatenbank: 5342 Eintraege", () => {
    expect(wordsDb).toHaveLength(5342);
    expect(names.eintraege).toHaveLength(5342);
  });
  it("Stichwort-Felder: 79 Cluster", () => {
    expect(keywordFields.cluster).toHaveLength(79);
  });
  it("Benennungsregeln mit tech_muster", () => {
    expect(Object.keys(namingRules)).toContain("tech_muster");
  });
  it("Korpus: 330 Marken, Tech-Korpus: 192 eigene Marken (von 195)", () => {
    expect(corpus.marken).toHaveLength(330);
    expect(corpusTech.marken).toHaveLength(192);
  });
  it("Rezepte: 82 Eintraege (IDs R01 bis R84, R25 und R27 fehlen)", () => {
    expect(recipes).toHaveLength(82);
    const ids = new Set(recipes.map((r) => r.id));
    expect(ids.has("R25") || ids.has("R27")).toBe(false);
    expect(ids.has("R84")).toBe(true);
  });
  it("Schriften: 105 (inklusive Outfit), Abdeckung fuer jede", () => {
    expect(fonts).toHaveLength(105);
    expect(fonts.some((f) => f.key === "outfit")).toBe(true);
    for (const f of fonts) expect(coverage).toHaveProperty(f.key);
  });
  it("Territorien: 12", () => {
    expect(territories).toHaveLength(12);
  });
  it("Signature-Vorlagen: 86, davon 72 freigegeben, 12 Partner-Entwuerfe", () => {
    const all = [elegant, luxus, modern, mutig, natur, warm, kurz, mischung, kit, partner].flat();
    expect(all).toHaveLength(86);
    expect(all.filter((t) => t.freigabe === "freigegeben")).toHaveLength(72);
    expect(partner.filter((t) => t.freigabe === "entwurf")).toHaveLength(12);
  });
});
