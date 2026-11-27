/**
 * Buchstaben-Eingriffe in Wortmarken (Querbalken, Fuge, Markierung, Fundament, Umlaut) und die
 * Schalter fuer gezeichnete Monogramme und Eingriffe (`GEZEICHNET`, `EINGRIFFE_AUS`, `markierungSinn`)
 * (engine `Bt` ... `ru`). Die Geometrie laeuft ueber polygon-clipping (src/symbols/boolean.ts).
 */
import type { CaseKey, FontRef, LogoConcept } from "../types";
import type { Font } from "opentype.js";
import type { Geom } from "../symbols/types";
import {
  difference,
  geomArea,
  geomBounds,
  geomToPath,
  pathToRings,
  polygonGeom,
  rectGeom,
  ringsToGeom,
  scanRow,
  translateGeom,
  union,
} from "../symbols/boolean";
import { fontForm } from "./tracking";
import { getFont } from "./fonts";

export const GEZEICHNET = {
  monogramme: false,
  eingriffe: false,
  markierungSinn: false,
};

export const EINGRIFFE_AUS = ["fuge", "fundament"];

const MARKIERUNG_WOERTER = [
  "see",
  "horizont",
  "blick",
  "ufer",
  "dach",
  "linie",
  "grat",
  "kamm",
  "ebene",
  "wiese",
  "feld",
  "steg",
  "brücke",
  "bruecke",
  "turm",
  "giebel",
  "first",
];

function markierungSpan(text: string) {
  const n = text.toLocaleLowerCase("de-AT");
  let t = null;
  for (const s of MARKIERUNG_WOERTER) {
    const o = n.indexOf(s);
    if (o >= 0 && (!t || o < t.at)) {
      t = {
        at: o,
        w: s,
      };
    }
  }
  if (!t) return null;
  const r = Array.from(n);
  let i = t.at;
  for (; i < t.at + t.w.length && !/[aeiouäöüy]/.test(r[i]!); ) i++;
  if (i >= t.at + t.w.length) return null;
  let a = i;
  for (; a + 1 < t.at + t.w.length && /[aeiouäöüy]/.test(r[a + 1]!); ) a++;
  return {
    von: i,
    bis: a,
    wort: t.w,
  };
}

export const eingriffOf = (concept: LogoConcept) => {
  return concept.typo?.eingriff;
};

export const konstruktionOf = (concept: LogoConcept) => {
  return concept.symbol?.kind === "monogram"
    ? concept.symbol.konstruktion
    : undefined;
};

const GROTESK_FORMS = ["grotesk", "geometric"];

const FUNDAMENT_LETTERS = "BDEFHKLMNPR";

export function possibleEingriffe(
  text: string,
  font: FontRef,
  kase: CaseKey,
  tracking: number,
) {
  const i = getFont(font.key);
  if (i.cat === "script" || /\s/.test(text.trim())) return [];
  const a = fontForm(font.key);
  const s = kase === "upper" || !!i.capsOnly;
  const o = s ? text.toLocaleUpperCase("de-AT") : text;
  const l = Array.from(o.replace(/[^\p{L}]/gu, ""));
  const u = [];
  if (s && /A/.test(o) && (GROTESK_FORMS.includes(a) || a === "antiqua")) {
    u.push("querbalken");
  }
  if (
    s &&
    l.length <= 16 &&
    !/[ÄÖÜ]/.test(o) &&
    [...GROTESK_FORMS, "condensed", "extended"].includes(a) &&
    font.weight >= 500
  ) {
    u.push("fuge");
  }
  if (markierungSpan(o) && !(s && tracking > 0.2)) {
    u.push("markierung");
  }
  if (
    s &&
    GROTESK_FORMS.includes(a) &&
    l.slice(Math.floor(l.length / 2)).some((m) => FUNDAMENT_LETTERS.includes(m))
  ) {
    u.push("fundament");
  }
  if (/[ÄÖÜäöü]/.test(o)) {
    u.push("umlaut");
  }
  return u;
}

export function applyEingriff(
  font: Font,
  text: string,
  size: number,
  tracking: number,
  metrics: any,
  art: any,
) {
  const s = font.getPaths(text, 0, 0, size, {
    kerning: true,
    letterSpacing: tracking,
  });
  const o = Array.from(text);
  if (s.length !== o.length) return null;
  const l: any[] = [];
  s.forEach((f, d) => {
    const b = ringsToGeom(pathToRings(f));
    const z = geomBounds(b);
    if (z) {
      l.push({
        k: d,
        ch: o[d],
        g: b,
        l: z.x,
        r: z.x + z.w,
      });
    }
  });
  if (!l.length) return null;
  let u = union(l[0].g, ...l.slice(1).map((f) => f.g));
  const m = geomBounds(u);
  if (
    !m ||
    Math.abs(m.w - metrics.width) > 0.8 ||
    Math.abs(m.h - metrics.height) > 0.8 ||
    Math.abs(m.x - metrics.left) > 0.8
  )
    return null;
  const h = capRatio(font) * size;
  let p = null;
  const g = (f: any, d = 0) => l.find((b, z) => z >= d && f.test(b.ch));
  if (art === "querbalken") {
    const f = g(/A/);
    if (!f) return null;
    const d = crossbarCut(f.g, h);
    if (!d) return null;
    u = difference(u, d);
  } else if (art === "fuge") {
    const f = h * 0.07;
    u = difference(u, rectGeom(m.x - 5, -h * 0.56 - f / 2, m.w + 10, f));
    if (
      geomArea(u) <
      geomArea(union(l[0].g, ...l.slice(1).map((d) => d.g))) * 0.8
    )
      return null;
  } else if (art === "markierung") {
    const f = markierungSpan(text);
    if (!f) return null;
    const d = l.filter((k) => k.k >= f.von && k.k <= f.bis);
    if (!d.length) return null;
    const b = Math.min(...d.map((k) => geomBounds(k.g)!.y));
    const z = h * 0.065;
    p = rectGeom(d[0].l, b - h * 0.14 - z, d[d.length - 1].r - d[0].l, z);
  } else if (art === "fundament") {
    const f = Math.floor(l.length / 2);
    const d = l.find((v, M) => M >= f && FUNDAMENT_LETTERS.includes(v.ch));
    if (!d) return null;
    const b = [0.3, 0.5, 0.7]
      .map((v) => scanRow(d.g, -h * v)[0])
      .filter(Boolean);
    if (b.length < 3) return null;
    const z = Math.min(...b.map((v) => v![0]!));
    const k = Math.min(...b.map((v) => v![1]! - v![0]!));
    if (Math.max(...b.map((v) => v![0]!)) - z > h * 0.03) return null;
    u = union(u, rectGeom(z, -1, k, h * 0.3 + 1));
  } else if (art === "umlaut") {
    const f = g(/[ÄÖÜäöü]/);
    if (!f) return null;
    const d = f.g.filter((z: any) => {
      const k = geomBounds([z]);
      return !!k && k.y + k.h < -h * 0.72 && k.w < h * 0.3;
    });
    if (d.length !== 2) return null;
    const b = d.map((z: any) => {
      const k = geomBounds([z]);
      const v = Math.max(k!.w, k!.h) * 1.15;
      return rectGeom(k!.x + k!.w / 2 - v / 2, k!.y + k!.h / 2 - v / 2, v, v);
    });
    u = union(
      difference(
        u,
        d.map((z: any) => [z]).reduce((z: any, k: any) => union(z, k)),
      ),
      ...b,
    );
  }
  const w = geomBounds(p ? union(u, p) : u);
  const x = -metrics.left;
  const y = -Math.min(w!.y, m.y);
  return {
    d: geomToPath(translateGeom(u, x, y), 0.08),
    mark: p ? geomToPath(translateGeom(p, x, y), 0.05) : undefined,
    top: Math.max(0, m.y - w!.y),
    bottom: Math.max(0, w!.y + w!.h - (m.y + m.h)),
  };
}

function capRatio(font: Font) {
  const n = font.getPath("H", 0, 0, 1e3).getBoundingBox();
  return n.y2 - n.y1 > 0 ? (n.y2 - n.y1) / 1e3 : 0.7;
}

function crossbarCut(geom: Geom, cap: number) {
  const t = cap / 80;
  const r = [];
  for (let h = -cap * 0.15; h >= -cap * 0.68; h -= t)
    r.push({
      y: h,
      runs: scanRow(geom, h),
    });
  const i = r.filter((h) => h.runs.length === 1);
  const a = r.filter((h) => h.runs.length === 2);
  if (!i.length || a.length < 4) return null;
  const s = Math.min(...i.map((h) => h.y));
  const o = Math.max(...i.map((h) => h.y));
  const l = a.filter((h) => h.y < s).sort((h, p) => p.y - h.y)[0];
  const u = a.filter((h) => h.y > o).sort((h, p) => h.y - p.y)[0];
  if (!l || !u || o - s > cap * 0.25) return null;
  const m = t * 1.5;
  return polygonGeom([
    [l.runs[0]![1], s - m],
    [l.runs[1]![0], s - m],
    [u.runs[1]![0], o + m],
    [u.runs[0]![1], o + m],
  ]);
}
