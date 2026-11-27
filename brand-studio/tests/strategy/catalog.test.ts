// Fragenkatalog des Markenkompass: Umfang, Zielfelder und Helfer zum Setzen und Lesen.
import { describe, expect, it } from "vitest";
import {
  ALTERNATIVEN,
  FARB_PAARE,
  FARB_WELTEN,
  FOKUS_OPTIONEN,
  FORMATE,
  KANAELE,
  KLISCHEES,
  KOMPASS,
  KOMPASS_INTRO,
  LOGO_PAARE,
  ONLYNESS_KARTEN,
  PERSOENLICHKEIT,
  REFERENZ_WELTEN,
  STIMM_PAARE,
  WERTE,
  WUNSCHKUNDEN,
  antwortLesen,
  antwortSetzen,
  frageById,
  frageSichtbar,
  kompassFortschritt,
} from "../../src/strategy/catalog";
import territories from "../../src/strategy/territories.json";
import type { BrandBrief } from "../../src/strategy/types";

const leer: BrandBrief = { version: 1 };
const fragen = KOMPASS.flatMap((s) => s.fragen);

describe("Katalog", () => {
  it("6 Schritte mit Fragen, jede mit Zielfeld und eindeutiger ID", () => {
    expect(KOMPASS.map((s) => s.nr)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const s of KOMPASS) expect(s.fragen.length).toBeGreaterThan(0);
    expect(new Set(fragen.map((f) => f.id)).size).toBe(fragen.length);
    for (const f of fragen) {
      expect(f.feld, f.id).toBeTruthy();
      if (f.pfad) expect(f.pfad.startsWith(`${f.feld}.`), f.id).toBe(true);
      if (["wahl", "chips", "mehrfach", "skala", "paar"].includes(f.typ))
        expect(f.optionen?.length, f.id).toBeGreaterThan(0);
    }
    expect(KOMPASS_INTRO.dauer).toBe("etwa 8 Minuten");
  });

  it("Kartenlisten in der Groesse aus docs/18", () => {
    expect(ONLYNESS_KARTEN).toHaveLength(12);
    expect(ALTERNATIVEN.map((a) => a.id)).toEqual(["franchise", "bank", "platzhirsch", "online", "privat"]);
    expect(REFERENZ_WELTEN).toHaveLength(12);
    expect(KLISCHEES.map((k) => k.id)).toEqual([
      "gold-schwarz",
      "haus-icon",
      "skyline",
      "schluessel",
      "schreibschrift",
      "monogramm-kreis",
    ]);
    expect(STIMM_PAARE.map((s) => s.pol)).toEqual(["formell", "ernst", "sachlich", "leise"]);
    expect(LOGO_PAARE.map((p) => p.id)).toEqual(["serif", "contrast", "caps", "width", "symbol", "dark"]);
    expect(FARB_PAARE.map((p) => p.id)).toEqual(["warmth", "saturation"]);
    expect(FARB_WELTEN).toHaveLength(8);
    expect(FOKUS_OPTIONEN).toHaveLength(7);
    expect(WUNSCHKUNDEN).toHaveLength(10);
    expect(WERTE).toHaveLength(10);
    expect(PERSOENLICHKEIT).toHaveLength(9);
    expect(FORMATE.map((f) => f.id)).toEqual(["reel", "karussell", "foto", "story", "text", "live"]);
    expect(KANAELE).toHaveLength(6);
  });

  it("Territorien in den Karten gibt es alle", () => {
    const ids = new Set(territories.map((t) => t.id));
    for (const k of [...WUNSCHKUNDEN, ...WERTE, ...PERSOENLICHKEIT])
      for (const t of k.territorien) expect(ids.has(t), `${k.id}: ${t}`).toBe(true);
  });

  it("Mehrfachwahl hat eine harte Obergrenze", () => {
    for (const f of fragen.filter((x) => x.typ === "mehrfach" || x.typ === "chips"))
      expect(f.max, f.id).toBeGreaterThan(0);
  });
});

describe("Antworten setzen und lesen", () => {
  it("Wahl, Text, Skala und Mehrfachwahl", () => {
    let b = antwortSetzen(leer, "architecture", "buero");
    b = antwortSetzen(b, "place", "  Wien  ");
    b = antwortSetzen(b, "side", "-2");
    b = antwortSetzen(b, "onlyness", ["graetzl", "graetzl", "unbekannt", "bewertung", "diskret"]);
    expect(b).toEqual({
      version: 1,
      architecture: "buero",
      place: "Wien",
      side: -2,
      onlyness: ["graetzl", "bewertung"],
    });
    expect(antwortLesen(b, "side")).toBe("-2");
    expect(antwortLesen(b, "onlyness")).toEqual(["graetzl", "bewertung"]);
    expect(antwortLesen(b, "segment")).toBeUndefined();
    expect(leer).toEqual({ version: 1 });
  });

  it("unbekannte Option und unbekannte Frage aendern nichts", () => {
    expect(antwortSetzen(leer, "architecture", "villa")).toBe(leer);
    expect(antwortSetzen(leer, "gibtsnicht", "x")).toBe(leer);
  });

  it("Stimme und Paare als a, b, egal", () => {
    let b = antwortSetzen(leer, "voice.formell", "b");
    b = antwortSetzen(b, "voice.leise", "egal");
    b = antwortSetzen(b, "logoPairs.serif", "a");
    b = antwortSetzen(b, "colorPairs.warmth", "egal");
    expect(b.voice).toEqual({ formell: 1, leise: 0 });
    expect(b.logoPairs).toEqual({ serif: "a" });
    expect(antwortLesen(b, "voice.formell")).toBe("b");
    expect(antwortLesen(b, "voice.leise")).toBe("egal");
    expect(antwortLesen(b, "colorPairs.warmth")).toBe("egal");
    b = antwortSetzen(b, "voice.formell", undefined);
    expect(b.voice).toEqual({ leise: 0 });
  });

  it("Formate gern und nie schliessen sich aus", () => {
    let b = antwortSetzen(leer, "social.formats", ["reel", "foto"]);
    b = antwortSetzen(b, "social.formatsNie", ["foto", "live"]);
    expect(b.social?.formats).toEqual({ reel: "gern", foto: "nie", live: "nie" });
    expect(antwortLesen(b, "social.formats")).toEqual(["reel"]);
    expect(antwortLesen(b, "social.formatsNie")).toEqual(["foto", "live"]);
    b = antwortSetzen(b, "social.formatsNie", []);
    expect(b.social?.formats).toEqual({ reel: "gern" });
    b = antwortSetzen(b, "social.hoursPerWeek", "0.5");
    expect(b.social?.hoursPerWeek).toBe(0.5);
    expect(antwortLesen(b, "social.hoursPerWeek")).toBe("0.5");
  });

  it("Freitext wird gekuerzt", () => {
    const b = antwortSetzen(leer, "proof", "x".repeat(400));
    expect(b.proof).toHaveLength(300);
  });
});

describe("Sichtbarkeit und Fortschritt", () => {
  it("Name nur ohne eigenen Namen und nur bei Personenmarke", () => {
    const person = frageById("person")!;
    expect(frageSichtbar(person, leer)).toBe(false);
    expect(frageSichtbar(person, { version: 1, architecture: "person" })).toBe(true);
    expect(frageSichtbar(person, { version: 1, architecture: "buero" })).toBe(false);
    expect(frageSichtbar(person, { version: 1, architecture: "person", hasName: true })).toBe(false);
  });

  it("Fortschritt von 0 bis 1", () => {
    expect(kompassFortschritt(leer)).toBe(0);
    let b: BrandBrief = leer;
    for (const f of fragen.filter((x) => !x.optional)) {
      const opt = f.optionen?.[0]?.id;
      b = antwortSetzen(b, f.id, f.typ === "text" ? "Anna Berger" : f.typ === "chips" || f.typ === "mehrfach" ? [opt!] : opt);
    }
    expect(kompassFortschritt(b)).toBe(1);
    const halb = antwortSetzen(antwortSetzen(leer, "architecture", "buero"), "place", "Wien");
    expect(kompassFortschritt(halb)).toBeGreaterThan(0);
    expect(kompassFortschritt(halb)).toBeLessThan(1);
  });
});
