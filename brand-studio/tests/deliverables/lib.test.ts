// @vitest-environment jsdom
// Zeichen- und Farbhelfer (lib/colors, lib/draw, lib/imagesize) gegen den imagesize-Chunk.
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import opentype, { type Font } from "opentype.js";
import { recovered } from "../helpers/recovered";
import * as C from "../../src/deliverables/lib/colors";
import * as D from "../../src/deliverables/lib/draw";
import { imageSize } from "../../src/deliverables/lib/imagesize";
import { rng } from "../../src/engine/rng";

let old: Record<string, any>;
const font = (f: string): Font => {
  const b = readFileSync(join(__dirname, "..", "..", "public", "fonts", f));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
let outfit: Font, outfitExt: Font, bodoni: Font;
beforeAll(async () => {
  document.body.innerHTML = "<div id=\"root\"></div>";
  old = await recovered("imagesize");
  outfit = font("brand/outfit-latin-400-normal.woff");
  outfitExt = font("brand/outfit-latin-ext-400-normal.woff");
  bodoni = font("brand/libre-bodoni-latin-500-normal.woff");
  D.setFallbackFont(outfit, outfitExt);
  old.Q(outfit, outfitExt);
}, 60000);

const TEXTE = ["", "Anna Berger", "Dachgeschoss mit Weitblick", "Łódź · Šibenik", "HWB 32 kWh/m²a, fGEE 0,78", "Ein längerer Absatz,\nder umbricht und noch weiter geht, bis die Zeile zu lang ist.", "€ 690.000"];
const FARBEN = ["#5A673C", "#fff", "#000000", "abc", "#E6E0CE", "none", "url(#g1)", "#2B2E22", 12 as unknown as string];

describe("lib: Farben", () => {
  it("wie alt", () => {
    for (const a of FARBEN)
      for (const b of FARBEN) {
        expect(C.normalizeHex(a, "#123456")).toBe(old.U(a, "#123456"));
        if (typeof a !== "string" || !/^#/.test(a) || typeof b !== "string" || !/^#/.test(b)) continue;
        expect(C.mixHex(a, b, 0.38)).toBe(old.L(a, b, 0.38));
        expect(C.contrastRatio(a, b)).toBe(old.X(a, b));
        expect(C.isDarkHex(a)).toBe(old._(a));
        expect(C.hexToCmyk(a)).toEqual(old.N(a));
        expect(C.luminanceOf(a)).toBe(old.M(a));
      }
    for (const a of FARBEN) if (typeof a === "string") expect(C.safeFill(a)).toBe(old.f(a));
  });
});

describe("lib: Zeichnen", () => {
  it("Text, Umbruch, Absatz, Formen wie alt", () => {
    const rr = rng(7);
    const r = () => rr.next();
    for (const f of [outfit, bodoni])
      for (const text of TEXTE)
        for (let k = 0; k < 6; k++) {
          const opts = { x: r() * 300, y: r() * 300, size: 8 + r() * 40, fill: FARBEN[k % 5]!, tracking: k % 2 ? 0.12 : 0, anchor: (["start", "middle", "end"] as const)[k % 3], opacity: k === 4 ? 0.6 : undefined };
          expect(D.drawText(f, text, opts)).toEqual(old.d(f, text, opts));
          expect(D.measureText(f, text, opts.size, opts.tracking)).toBe(old.F(f, text, opts.size, opts.tracking));
          expect(D.fitFontSize(f, text, 120, opts.size, opts.tracking)).toBe(old.tt(f, text, 120, opts.size, opts.tracking));
          expect(D.wrapLines(f, text, opts.size, 200, opts.tracking)).toEqual(old.W(f, text, opts.size, 200, opts.tracking));
          expect(D.paragraph(f, text, { ...opts, maxWidth: 180 })).toEqual(old.st(f, text, { ...opts, maxWidth: 180 }));
          expect(D.capsLabel(f, text, opts)).toEqual(old.et(f, text, opts));
          expect(D.capHeightOf(f, opts.size)).toBe(old.nt(f, opts.size));
          expect(D.rect(opts.x, opts.y, 10.12345, 4, opts.fill, k ? "rx=\"2\"" : "")).toBe(old.ct(opts.x, opts.y, 10.12345, 4, opts.fill, k ? "rx=\"2\"" : ""));
          expect(D.hLine(1, opts.x, opts.y, opts.fill, 0.3)).toBe(old.P(1, opts.x, opts.y, opts.fill, 0.3));
          expect(D.vLine(1, opts.x, opts.y, opts.fill, 0.3)).toBe(old.C(1, opts.x, opts.y, opts.fill, 0.3));
          expect(D.circle(opts.x, opts.y, 3, opts.fill)).toBe(old.at(opts.x, opts.y, 3, opts.fill));
          expect(D.roundedRectPath(opts.x, opts.y, 100, 40, k * 9)).toBe(old.lt(opts.x, opts.y, 100, 40, k * 9));
          expect(D.cropMarks(3, 3, 85, 55, 3)).toBe(old.$t(3, 3, 85, 55, 3));
        }
  });
  it("SVG-Dokument, Einbetten, Beschnitt, Bilder", () => {
    for (const o of [{}, { unit: "mm" as const, title: "A & <B>", defs: "<g/>", background: "#abc" }]) expect(D.svgDoc(85, 55, "<g/>", o)).toBe(old.H(85, 55, "<g/>", o));
    const svg = D.svgDoc(85, 55, "<rect/>", { title: "x" });
    expect(D.viewBoxOf(svg)).toEqual(old.I(svg));
    expect(D.resizeSvg(svg, 10, 20)).toBe(old.rt(svg, 10, 20));
    D.setIdCounter(0);
    const e1 = D.embedSvg(svg, 1, 2, 30);
    const e2 = old.ft(svg, 1, 2, 30);
    expect(e1.h).toBe(e2.h);
    expect(e1.svg.replace(/em[0-9a-z]+/g, "ID")).toBe(e2.svg.replace(/em[0-9a-z]+/g, "ID"));
    expect(D.bleedDocument(85, 55, 3, "<g/>").replace(/bd[0-9a-z]+/g, "ID")).toBe(old.ht(85, 55, 3, "<g/>").replace(/bd[0-9a-z]+/g, "ID"));
    const png = "data:image/png;base64," + Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 2, 128, 0, 0, 1, 224, 8, 6, 0, 0, 0]).toString("base64");
    for (const u of [png, "data:image/jpeg;base64,/9j/4AAQ", "data:text/plain;base64,QUJD", "keine"]) {
      expect(imageSize(u)).toEqual(old.gt(u));
      expect(D.imageTag(u, 1, 2, 3, 4, "x=\"1\"")).toBe(old.ut(u, 1, 2, 3, 4, "x=\"1\""));
    }
  });
});
