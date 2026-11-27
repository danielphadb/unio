// Regeln des Namensfinders: Sperren, Vielfalt auf Seite 1, Personennamen und Tempo.
import { describe, expect, it } from "vitest";
import {
  generateNames,
  parsePerson,
  parseCompany,
  pruefeEigenenNamen,
  shortForm,
  type NameInput,
} from "../../../src/engine/names";
import {
  corpusMatch,
  isRetailBrand,
  protectedTermOf,
  techMatch,
  tradeBrandOf,
} from "../../../src/engine/names/rules";
import { appRuleOf } from "../../../src/engine/names/tech";
import { wordWeakness } from "../../../src/engine/names/quality";
import { WORDS_DB } from "../../../src/engine/names/wordsDb";
import { level } from "../../../src/engine/names/wordsDbFormat";
import { LEXICON, lexSkip } from "../../../src/engine/names/lexicon";
import { batchOptions, generateBatch, type NameFinderForm } from "../../../src/engine/names/finder";

const WIEN: NameInput = {
  person: "Anna Berger",
  region: "Wien",
  focus: ["wohnen", "luxus"],
  styles: ["elegant"],
  keywords: ["Altbau"],
};

describe("Sperren", () => {
  it("Handel: Handelsketten und Konzerne", () => {
    expect(tradeBrandOf("Billa Haus")).toBe("Billa");
    expect(tradeBrandOf("Hoferhaus")).toBe("Hofer");
    expect(tradeBrandOf("Strabag")).toBe("Strabag");
    expect(tradeBrandOf("Lindenhof")).toBeNull();
    expect(isRetailBrand("Spar")).toBe(true);
    expect(isRetailBrand("Strabag")).toBe(false);
    const check = pruefeEigenenNamen("Billa Immobilien");
    expect(check.punkte.find((p) => p.id === "verwechslung")?.status).toBe("kritisch");
  });

  it("Aemter und geschuetzte Begriffe", () => {
    expect(protectedTermOf("Bankhaus")).toBe("bank");
    expect(protectedTermOf("Notariat")).toBe("notar");
    expect(protectedTermOf("Amtshaus")).toBe("amt");
    expect(protectedTermOf("Kanzlei Berger")).toBe("kanzlei");
    expect(protectedTermOf("Österreich Wohnen")).toBe("oesterreich");
    expect(protectedTermOf("Gesamtwerk")).toBeNull();
    expect(protectedTermOf("Immobilienkanzlei Berger")).toBeNull();
    expect(protectedTermOf("Wiener Raum")).toBeNull();
    expect(protectedTermOf("Wiener Raum", true)).toBe("wien");
    const check = pruefeEigenenNamen("Treuhand Wohnen");
    expect(check.punkte.find((p) => p.id === "verwechslung")?.text).toContain("geschützter");
  });

  it("Tech-Marken", () => {
    expect(techMatch("Stripe")).toEqual({ label: "Stripe", art: "gleich" });
    expect(techMatch("Strype")).toEqual({ label: "Stripe", art: "aehnlich" });
    expect(techMatch("Lindenhof")).toBeNull();
    // gleiche Tech-Marke geht einer Korpusnaehe vor
    expect(corpusMatch("Notion")).toEqual({ label: "Notion", art: "gleich" });
    expect(corpusMatch("Knight Frank")).toEqual({ label: "Knight Frank", art: "gleich" });
  });

  it("App-Endungen und App-Muster", () => {
    const kunst = { echt: false, kunst: true };
    const echt = { echt: true, kunst: false };
    expect(appRuleOf("Lumio", kunst)).toBe("endung-io");
    expect(appRuleOf("Wohnhub", kunst)).toBe("endung-hub");
    expect(appRuleOf("Hausbase", kunst)).toBe("endung-base");
    expect(appRuleOf("Strebr", kunst)).toBe("endung-r");
    expect(appRuleOf("Raumly", kunst)).toBe("y_statt_i");
    expect(appRuleOf("RaumWerk", echt)).toBe("binnenmajuskel");
    expect(appRuleOf("Haus24", echt)).toBe("ziffer");
    // echte Woerter: Endungen zaehlen nicht
    expect(appRuleOf("Lumio", echt)).toBeNull();
    expect(appRuleOf("Lumora", kunst)).toBeNull();
  });

  it("Maengelwoerter", () => {
    expect(wordWeakness("Befund")).toBe("sperre");
    expect(wordWeakness("Gutachten")).toBe("sperre");
    expect(wordWeakness("Mietrecht")).toBe("sperre");
    expect(wordWeakness("Steinguth")).toBe("sperre");
    expect(wordWeakness("Hofhof")).toBe("sperre");
    expect(wordWeakness("Kupfer")).toBe("schwach");
    expect(wordWeakness("Lumora")).toBeNull();
  });

  it("-werck nur hinter einem kurzen, einsilbigen Wort ohne Fugen-s", () => {
    expect(wordWeakness("Raumwerck")).toBeNull();
    expect(wordWeakness("Hauswerck")).toBe("sperre");
    expect(wordWeakness("Flaechenwerck")).toBe("sperre");
    expect(wordWeakness("Wohnungswerck")).toBe("sperre");
  });

  it("gesperrte Namen kommen nie als Vorschlag", () => {
    for (const seed of [1, 2, 3])
      for (const s of generateNames(WIEN, { count: 24, page: 0, seed })) {
        expect(tradeBrandOf(s.name)).toBeNull();
        expect(protectedTermOf(s.name)).toBeNull();
        expect(wordWeakness(s.name)).not.toBe("sperre");
        // eigene Namen duerfen einer Marke gleichen (mit Hinweis), alles andere nicht
        if (s.kind !== "person") expect(s.naehe?.art).not.toBe("gleich");
      }
  });
});

describe("Wortdatenbank und Lexikon", () => {
  it("Stufen und Lexikon passen zusammen", () => {
    const stufen = WORDS_DB.map(level);
    expect(stufen.filter((s) => s === "gesperrt").length).toBe(
      WORDS_DB.filter((r) => r[8] & 1).length,
    );
    expect(LEXICON.length).toBe(WORDS_DB.filter((r) => !lexSkip(r)).length);
    for (const [i, row] of WORDS_DB.entries())
      if (!lexSkip(row)) expect(["frei", "stichwort"]).toContain(stufen[i]);
    expect(LEXICON.filter((w) => w.kwOnly).length).toBeGreaterThan(0);
  });
});

describe("Vielfalt auf Seite 1", () => {
  const INPUTS: NameInput[] = [
    WIEN,
    {
      company: "Seeblick Realitäten",
      region: "Wörthersee",
      focus: ["haeuser"],
      styles: ["natur"],
      keywords: [],
    },
    { region: "Graz", focus: [], styles: ["modern"], keywords: ["Neubau"] },
    {
      person: "Lukas Gruber",
      region: "Wachau",
      focus: ["land"],
      styles: ["warm"],
      keywords: ["Wein"],
    },
  ];
  for (const [i, input] of INPUTS.entries())
    it(`Eingabe ${i + 1}: mindestens 5 Arten, hoechstens 2 Kunstwoerter`, () => {
      for (const seed of [1, 2, 3, 4, 5]) {
        const page = generateNames(input, { count: 12, page: 0, seed });
        expect(page).toHaveLength(12);
        expect(new Set(page.map((s) => s.kind)).size).toBeGreaterThanOrEqual(5);
        expect(page.filter((s) => s.kind === "kunstwort").length).toBeLessThanOrEqual(2);
        expect(new Set(page.map((s) => s.name.toLocaleLowerCase("de-AT"))).size).toBe(12);
      }
    });
});

describe("Personennamen zerlegen", () => {
  it("Titel, Vornamen, Partikel und Doppelname", () => {
    expect(parsePerson("Mag. Anna Maria von Berger-Huber")).toEqual({
      first: "Anna",
      firsts: ["Anna", "Maria"],
      last: "von Berger-Huber",
      lastCore: "Berger-Huber",
      lastParts: ["Berger", "Huber"],
      particle: "von",
      full: "Anna Maria von Berger-Huber",
      initials: "AB",
      tokens: ["Anna", "Maria", "Berger-Huber", "Berger", "Huber"],
    });
  });

  it("Versalien, Zusaetze und Rechtsformen", () => {
    const p = parsePerson("ANNA BERGER jun.");
    expect(p?.full).toBe("Anna Berger");
    expect(p?.initials).toBe("AB");
    const firm = parsePerson("Berger GmbH");
    expect(firm?.first).toBeUndefined();
    expect(firm?.last).toBe("Berger");
    expect(parsePerson("")).toBeNull();
    expect(parsePerson("Dr. Mag.")).toBeNull();
  });

  it("Kurzformen aus der ersten Silbe", () => {
    expect(shortForm("Trattner")).toBe("Tratt");
    expect(shortForm("Gruber")).toBe("Grub");
    expect(shortForm("Lindner")).toBe("Lind");
    expect(shortForm("Pichler")).toBe("Pich");
    expect(shortForm("Berger")).toBeNull();
    expect(shortForm("Huber")).toBeNull();
    expect(shortForm("Abc")).toBeNull();
  });

  it("Firmennamen", () => {
    expect(parseCompany("Seeblick Realitäten GmbH")).toEqual({
      full: "Seeblick Realitäten",
      core: "Seeblick",
      fn: "Realitäten",
    });
    expect(parseCompany("Wiener Wohnwerk")?.bare).toBe("Wohnwerk");
    expect(parseCompany("Palais Kramer")?.tail).toBe("Kramer");
  });

  it("Personenmarke steht vorn", () => {
    const page = generateNames(WIEN, { count: 12, page: 0, seed: 9 });
    expect(page[0]?.kind).toBe("person");
    expect(page.filter((s) => s.kind === "person").length).toBeGreaterThanOrEqual(3);
  });
});

describe("Tempo", () => {
  it("eine Charge mit 24 Namen im Median unter 80 ms (warm)", () => {
    const form: NameFinderForm = {
      person: "Anna Berger",
      region: "Wien",
      focus: ["wohnen", "luxus"],
      style: "elegant",
      keywords: "Altbau, Innenhof",
      chips: [],
      seed: 1,
      creativity: "ausgewogen",
      exclude: "",
      maxLength: null,
    };
    const prefs = { liked: [], disliked: [], lenCap: null, autoExclude: [], damp: [] };
    const input: NameInput = { ...WIEN, keywords: ["Altbau", "Innenhof"] };
    // aufwaermen
    generateBatch(input, batchOptions({ ...form, seed: 999 }, prefs), new Set());
    const times: number[] = [];
    for (let i = 0; i < 9; i++) {
      const t = performance.now();
      const out = generateBatch(input, batchOptions({ ...form, seed: 1000 + i }, prefs), new Set());
      times.push(performance.now() - t);
      expect(out).toHaveLength(24);
    }
    times.sort((a, b) => a - b);
    expect(times[4]).toBeLessThan(80);
  }, 60000);
});
