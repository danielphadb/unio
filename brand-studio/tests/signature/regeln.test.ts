// Designer-Regeln der Signature-Vorlagen, soweit sie aus Code und Daten der
// gesicherten Fassung erkennbar sind: Laufweiten, Abstände, Linien in Namensbreite,
// keine Überlappung des Zusatzes, gültige Bezüge, Paletten, Varianten.
import { beforeAll, describe, expect, it } from "vitest";
import { BRANDS, newStore } from "./helpers";
import * as sig from "../../src/signature";
import { basePalettes } from "../../src/engine/palettes";
import type { SignatureTemplate, TextElement } from "../../src/signature/types";

const store = newStore();
beforeAll(async () => {
  await store.ensure(
    sig.ALL_TEMPLATES.flatMap((t) =>
      BRANDS.flatMap((b) => sig.templateFontRefs(t, b)),
    ),
  );
}, 120_000);

const texts = (t: SignatureTemplate) =>
  t.elemente.filter((e): e is TextElement => e.typ === "text");
const isZusatz = (e: TextElement) => sig.ZUSATZ_FELDER.includes(e.feld);
const overlap = (a: sig.Rect, b: sig.Rect) =>
  a.x < b.x + b.w - 0.5 &&
  b.x < a.x + a.w - 0.5 &&
  a.y < b.y + b.h - 0.5 &&
  b.y < a.y + a.h - 0.5;

/** Alle Paare (Vorlage, Marke), bei denen die Vorlage passt (mit Einpassung). */
let passend: Array<[SignatureTemplate, (typeof BRANDS)[number]]> = [];
beforeAll(() => {
  passend = [];
  for (const t of sig.ALL_TEMPLATES)
    for (const b of BRANDS)
      if (sig.fits(t, b, store, { stil: false }).passt) passend.push([t, b]);
});

describe("Daten der Vorlagen", () => {
  it("jede Vorlage setzt den Namen (oder seine Buchstaben) in der Hauptschrift", () => {
    for (const t of sig.ALL_TEMPLATES)
      expect(
        texts(t).some((e) => e.schrift === "haupt"),
        t.id,
      ).toBe(true);
    // fast alle verlangen ihn als Pflichttext (Ausnahme: Buchstaben-Raster wie sig-wortquadrat)
    expect(
      sig.ALL_TEMPLATES.filter(
        (t) => !texts(t).some((e) => e.schrift === "haupt" && e.pflicht),
      ).map((t) => t.id),
    ).toEqual(["sig-wortquadrat"]);
  });
  it("Laufweiten: gemischt und klein höchstens 0,06 em, alles zwischen -0,05 und 0,5 em", () => {
    for (const t of sig.ALL_TEMPLATES)
      for (const e of texts(t)) {
        expect(e.laufweite, `${t.id} ${e.feld}`).toBeGreaterThanOrEqual(-0.05);
        expect(e.laufweite, `${t.id} ${e.feld}`).toBeLessThanOrEqual(0.5);
        if (e.schreibung !== "upper")
          expect(
            Math.abs(e.laufweite),
            `${t.id} ${e.feld}`,
          ).toBeLessThanOrEqual(0.06);
      }
  });
  it("Paletten der Vorlagen gibt es als Grundpalette", () => {
    const ids = new Set(basePalettes().map((p) => p.id.split("-")[0]));
    for (const t of sig.ALL_TEMPLATES)
      for (const p of t.farben.paletten)
        expect(ids.has(p), `${t.id} ${p}`).toBe(true);
  });
  it("Ausdrücke beziehen sich nur auf Elemente der Vorlage", () => {
    for (const t of sig.ALL_TEMPLATES) {
      const ids = new Set([
        "spiegel",
        "fundament",
        ...t.elemente.map((e) => e.id ?? (e.typ === "text" ? e.feld : "")),
      ]);
      const all = JSON.stringify(
        t.elemente.map((e) => ({ ...e, d: undefined, motiv: undefined })),
      );
      for (const m of all.matchAll(
        /(?:^|[^A-Za-z0-9_.])([A-Za-z_]\w*)\.(l|r|cx|w|t|b|cy|h|o|u|cap|a|sl|sr)\b/g,
      ))
        expect(ids.has(m[1]!), `${t.id}: ${m[1]}`).toBe(true);
    }
  });
  it("Schriften der Vorlagen stehen im Katalog und haben die Zeichen der Testmarken", () => {
    for (const t of sig.ALL_TEMPLATES)
      for (const b of BRANDS)
        for (const r of sig.templateFontRefs(t, b))
          expect(store.has(r), `${t.id} ${r.key}`).toBe(true);
  });
});

describe("Layout bei passenden Marken", () => {
  it("es gibt genug passende Fälle", () => {
    expect(passend.length).toBeGreaterThan(800);
  });
  it("Lage überall endlich, Name gesetzt, keine Probleme", () => {
    for (const [t, b] of passend) {
      const l = sig.layoutSignature(t, b, store);
      expect(l.problems, `${t.id} ${b.name}`).toEqual([]);
      for (const o of l.ops)
        if (o.box)
          for (const v of [o.box.x, o.box.y, o.box.w, o.box.h])
            expect(Number.isFinite(v), t.id).toBe(true);
      expect(
        l.boxes.some((x) => !x.neben),
        `${t.id} ${b.name}`,
      ).toBe(true);
    }
  });
  it("der Zusatz überlappt weder den Namen noch gefüllte Zeichen (Rahmen und Linien dürfen ihn umfassen, Siegel-Texte gehören zum Zeichen)", () => {
    for (const [t, b] of passend) {
      const l = sig.layoutSignature(t, b, store);
      const zusatzIds = new Set(
        texts(t)
          .filter((e) => isZusatz(e) && !e.zeichen)
          .map((e) => e.id ?? e.feld),
      );
      const zusatz = l.boxes.filter((x) => zusatzIds.has(x.id));
      const name = l.boxes.find((x) => x.id === "name");
      const marks = l.ops
        .filter(
          (o) => o.zeichen && o.box && o.fill !== "grund" && o.fill !== "none",
        )
        .map((o) => o.box!);
      for (const z of zusatz) {
        if (name)
          expect(
            overlap(z.box, name.box),
            `${t.id} ${b.name} ${z.id}/name`,
          ).toBe(false);
        for (const m of marks)
          expect(overlap(z.box, m), `${t.id} ${b.name} ${z.id}/zeichen`).toBe(
            false,
          );
      }
    }
  });
  it("Linien von name.l bis name.r sind genau so breit wie der Name", () => {
    let n = 0;
    for (const [t, b] of passend) {
      const f = sig.nameParts(b);
      const l = sig.layoutSignature(t, b, store);
      const lines = t.elemente.filter(
        (e) =>
          e.typ === "linie" &&
          e.x1 === "name.l" &&
          e.x2 === "name.r" &&
          e.y1 === e.y2 &&
          !(e.wenn && !f[e.wenn]) &&
          !(e.wennNicht && f[e.wennNicht]) &&
          !(e.wennFehlt && l.boxes.some((x) => x.id === e.wennFehlt)),
      );
      if (!lines.length) continue;
      const name = l.boxes.find((x) => x.id === "name")?.box;
      if (!name) continue;
      const strokes = l.ops.filter(
        (o) =>
          o.fill === "none" && o.stroke && o.box && /^M[^L]*L[^L]*$/.test(o.d),
      );
      const same = strokes.filter(
        (o) =>
          Math.abs(o.box!.x - name.x) < 0.01 &&
          Math.abs(o.box!.w - name.w) < 0.01,
      );
      expect(same.length, `${t.id} ${b.name}`).toBeGreaterThanOrEqual(1);
      n++;
    }
    expect(n).toBeGreaterThan(10);
  });
  it("kleiner Zusatz unter dem Namen hält eine halbe Versalhöhe Abstand zur Unterlänge", () => {
    for (const [t, b] of passend) {
      const l = sig.layoutSignature(t, b, store);
      const name = l.boxes.find((x) => x.id === "name" && !x.neben)?.box;
      if (!name) continue;
      for (const z of l.boxes.filter(
        (x) => x.neben && x.box.y > name.y + name.h,
      ))
        expect(
          z.box.y - (name.y + name.h),
          `${t.id} ${b.name} ${z.id}`,
        ).toBeGreaterThan(0);
    }
  });
});

describe("Varianten", () => {
  it("fein: Linien nie dünner als 2,4 (außer schon dünner), Zusatz-Laufweite bleibt 0,16 bis 0,28 em", () => {
    for (const t of sig.ALL_TEMPLATES)
      for (const v of sig.templateVariants(t)) {
        t.elemente.forEach((e, i) => {
          const w = v.elemente[i]!;
          if (
            "staerke" in e &&
            typeof e.staerke == "number" &&
            "staerke" in w
          ) {
            const s = w.staerke as number;
            expect(s >= Math.min(e.staerke, 2.4) - 1e-9, `${v.id}`).toBe(true);
          }
          if (
            e.typ === "text" &&
            w.typ === "text" &&
            isZusatz(e) &&
            e.schreibung === "upper" &&
            e.laufweite >= 0.16 &&
            e.laufweite <= 0.28
          ) {
            expect(w.laufweite).toBeGreaterThanOrEqual(0.16);
            expect(w.laufweite).toBeLessThanOrEqual(0.28);
          }
        });
      }
  });
  it("IDs <vorlage>--<code>, feine live wie die Vorlage, strukturelle als Entwurf", () => {
    for (const t of sig.ALL_TEMPLATES)
      for (const v of sig.templateVariants(t, true)) {
        expect(v.id).toBe(`${t.id}--${v.variante!.code}`);
        expect(sig.getSignatureTemplate(v.id)).toBe(
          t.id in sig.ZURUECKGEZOGEN ? undefined : v,
        );
        if (v.variante!.klasse === "fein") expect(v.freigabe).toBe(t.freigabe);
        else
          expect(v.freigabe).toBe(
            sig.STRUKTUR_FREIGEGEBEN.has(v.id) ? t.freigabe : "entwurf",
          );
      }
  });
});
