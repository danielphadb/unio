/**
 * Interpreter der Signature-Vorlagen (engine-Chunk Zeilen 658 bis 1988):
 * Schriften wählen, Elemente der Reihe nach setzen (Ausdrücke über die Kanten
 * schon gesetzter Elemente), Farben auflösen, SVG ausgeben, Passung prüfen.
 *
 * Bitgenau wie die gesicherte Fassung: Rechenreihenfolge und Rundung bleiben gleich.
 */
import type { Font } from "opentype.js";
import type { BrandInput, CaseKey, FontRef, Palette } from "../types";
import type { SvgPart } from "../engine/svg";
import { fmt, svgBounds } from "../engine/svg";
import { fontKey, getFont } from "../engine/fonts";
import { fontCovers } from "../engine/charset";
import { applyCase, capHeight, textPath, type TextPath } from "../engine/text";
import { isPersonName } from "../engine/personName";
import { basePalettes } from "../engine/palettes";
import {
  cleanText,
  corpusTwinName,
  fontMonogramSvg,
  resolveColors,
} from "./uebergang";
import { nameParts, splitTitles, type NameParts } from "./nameParts";
import { partnerName, PARTNER_LABEL } from "./partner";
import type {
  Ausdruck,
  Element,
  FitOptions,
  FitResult,
  FormElement,
  Kante,
  Kanten,
  Rect,
  RenderOptions,
  Rolle,
  SignatureColors,
  SignatureFontSet,
  SignatureLayout,
  SignatureOp,
  SignatureParams,
  SignatureTemplate,
  TextElement,
} from "./types";

/** Schriftspeicher (FontStore oder gleichwertig). */
export interface FontSource {
  has(ref: FontRef): boolean;
  get(ref: FontRef): Font;
  version?: number;
}

export type SignatureInput = Pick<
  BrandInput,
  "name" | "suffix" | "place" | "nameKind" | "ort2" | "jahr" | "styles"
>;

/** Bezugsgröße: Versalhöhe des Namens in der Ausgabe (`ar`). */
const UNIT = 100;

const sameFont = (a: FontRef, b: FontRef): boolean => fontKey(a) === fontKey(b);

// ---------------------------------------------------------------------------
// Schriften

/**
 * Schriften für eine Marke wählen (`sr`, Export `H`): Wunsch aus `params`, wenn die
 * Vorlage ihn anbietet und er alle Zeichen hat, sonst die erste passende. Bei
 * `paare` gehören Neben- und Akzentschrift zur gewählten Hauptschrift.
 */
export function templateFonts(
  t: SignatureTemplate,
  input: SignatureInput,
  params: SignatureParams = {},
): SignatureFontSet {
  const f = nameParts(input);
  const texts = [f.name, f.zusatz, f.ort];
  const pick = (
    list: FontRef[] | undefined,
    wish: FontRef | undefined,
    fallback: FontRef,
    need: string[],
  ) => {
    const g = list?.length ? list : [fallback];
    return wish &&
      g.some((w) => sameFont(w, wish)) &&
      fontCovers(wish.key, ...need)
      ? wish
      : (g.find((w) => fontCovers(w.key, ...need)) ?? g[0]!);
  };
  const haupt = pick(
    t.schriften.haupt,
    params.haupt,
    t.schriften.haupt[0]!,
    texts,
  );
  if (t.schriften.paare) {
    const at = Math.max(
      0,
      t.schriften.haupt.findIndex((h) => sameFont(h, haupt)),
    );
    const paired = (
      list: FontRef[] | undefined,
      fallback: FontRef,
      wish: FontRef | undefined,
    ) => {
      if (
        wish &&
        list?.some((x) => sameFont(x, wish)) &&
        fontCovers(wish.key, ...texts)
      )
        return wish;
      const w = list?.[at];
      return w && fontCovers(w.key, ...texts)
        ? w
        : pick(list, undefined, fallback, texts);
    };
    return {
      haupt,
      neben: paired(t.schriften.neben, haupt, params.neben),
      akzent: paired(t.schriften.akzent, haupt, params.akzent),
    };
  }
  return {
    haupt,
    neben: pick(t.schriften.neben, params.neben, haupt, texts),
    akzent: pick(t.schriften.akzent, params.akzent, haupt, texts),
  };
}

/** Die gewählten Schriften ohne Doppelte (zum Laden) (`rs`). */
export function templateFontRefs(
  t: SignatureTemplate,
  input: SignatureInput,
  params: SignatureParams = {},
): FontRef[] {
  const r = templateFonts(t, input, params);
  const m = new Map<string, FontRef>();
  for (const f of [r.haupt, r.neben, r.akzent]) m.set(fontKey(f), f);
  return [...m.values()];
}

// ---------------------------------------------------------------------------
// Ausdrücke

/** Ein Ausdruck verweist auf ein Element, das (noch) fehlt (`Pt`). */
class MissingElement extends Error {}

function edge(k: Kanten, name: string): number {
  switch (name as Kante) {
    case "l":
      return k.l;
    case "r":
      return k.r;
    case "cx":
      return (k.l + k.r) / 2;
    case "w":
      return k.r - k.l;
    case "t":
      return k.t;
    case "b":
      return k.b;
    case "cy":
      return (k.t + k.b) / 2;
    case "h":
      return k.b - k.t;
    case "o":
      return k.o;
    case "u":
      return k.u;
    case "cap":
      return k.cap;
    case "a":
      return k.a ?? k.r;
    case "sl":
      return k.sl ?? 0;
    case "sr":
      return k.sr ?? 0;
    default:
      throw new Error(`Unbekannte Kante: ${name}`);
  }
}

/** Äußerster Umrisspunkt zwischen zwei Höhen (`Wo`). */
function outline(k: Kanten, right: boolean, y1: number, y2: number): number {
  const xs = (k.pts ?? [])
    .filter(([, y]) => y >= y1 && y <= y2)
    .map(([x]) => x);
  return xs.length
    ? right
      ? Math.max(...xs)
      : Math.min(...xs)
    : right
      ? k.r
      : k.l;
}

type Registry = Map<string, Kanten>;

/** Einen Ausdruck ohne Alternativen auswerten (`Po`). */
function evaluate(expr: string, reg: Registry): number {
  const s = expr.replace(/\s+/g, "");
  let i = 0;
  const fail = (): never => {
    throw new Error(`Ausdruck ungültig: ${expr}`);
  };
  const sum = (): number => {
    let v = product();
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i++];
      const w = product();
      v = op === "+" ? v + w : v - w;
    }
    return v;
  };
  const product = (): number => {
    let v = factor();
    while (s[i] === "*" || s[i] === "/") {
      const op = s[i++];
      const w = factor();
      v = op === "*" ? v * w : v / w;
    }
    return v;
  };
  const factor = (): number => {
    if (s[i] === "-") {
      i++;
      return -factor();
    }
    if (s[i] === "(") {
      i++;
      const v = sum();
      if (s[i++] !== ")") fail();
      return v;
    }
    const rest = s.slice(i);
    const num = rest.match(/^\d*\.?\d+/);
    if (num) {
      i += num[0].length;
      return Number(num[0]);
    }
    const side = rest.match(/^(rechts|links)\(([A-Za-z_]\w*),/);
    if (side) {
      i += side[0].length;
      const k = reg.get(side[2]!);
      if (!k) throw new MissingElement(side[2]);
      const a = sum();
      if (s[i++] !== ",") fail();
      const b = sum();
      if (s[i++] !== ")") fail();
      return outline(k, side[1] === "rechts", Math.min(a, b), Math.max(a, b));
    }
    const fn = rest.match(/^(max|min)\(/);
    if (fn) {
      i += fn[0].length;
      const args = [sum()];
      while (s[i] === ",") {
        i++;
        args.push(sum());
      }
      if (s[i++] !== ")") fail();
      return fn[1] === "max" ? Math.max(...args) : Math.min(...args);
    }
    const ref = rest.match(/^([A-Za-z_]\w*)\.([a-z]+)/);
    if (ref) {
      i += ref[0].length;
      const k = reg.get(ref[1]!);
      if (!k) throw new MissingElement(ref[1]);
      return edge(k, ref[2]!);
    }
    return fail();
  };
  const v = sum();
  if (i !== s.length || !Number.isFinite(v)) fail();
  return v;
}

/** Ausdruck mit Alternativen `a|b` auswerten (`nn`). */
function value(expr: Ausdruck, reg: Registry): number {
  if (typeof expr == "number") return expr;
  const alts = expr.split("|");
  for (let k = 0; k < alts.length; k++)
    try {
      return evaluate(alts[k]!, reg);
    } catch (e) {
      if (!(e instanceof MissingElement) || k === alts.length - 1) throw e;
    }
  throw new Error(`Ausdruck ungültig: ${expr}`);
}

// ---------------------------------------------------------------------------
// Geometrie

type Pt = [number, number];

/** Punkte eines Pfades (M, L, Q, C), verschoben um dx, dy (`is`). */
function pathSamples(d: string, dx: number, dy: number): Pt[] {
  const out: Pt[] = [];
  const re = /([MLQCZ])([^MLQCZ]*)/g;
  let m: RegExpExecArray | null;
  let x = 0;
  let y = 0;
  while ((m = re.exec(d))) {
    const n = (m[2]!.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
    if (m[1] === "M")
      for (let k = 0; k + 1 < n.length; k += 2)
        out.push([(x = n[k]!) + dx, (y = n[k + 1]!) + dy]);
    else if (m[1] === "L")
      for (let k = 0; k + 1 < n.length; k += 2) {
        const steps = Math.max(
          1,
          Math.ceil(Math.hypot(n[k]! - x, n[k + 1]! - y) / 6),
        );
        for (let h = 1; h <= steps; h++)
          out.push([
            x + ((n[k]! - x) * h) / steps + dx,
            y + ((n[k + 1]! - y) * h) / steps + dy,
          ]);
        x = n[k]!;
        y = n[k + 1]!;
      }
    else if (m[1] === "Q")
      for (let k = 0; k + 3 < n.length; k += 4) {
        for (let t = 0.25; t <= 1; t += 0.25) {
          const u = 1 - t;
          out.push([
            u * u * x + 2 * u * t * n[k]! + t * t * n[k + 2]! + dx,
            u * u * y + 2 * u * t * n[k + 1]! + t * t * n[k + 3]! + dy,
          ]);
        }
        x = n[k + 2]!;
        y = n[k + 3]!;
      }
    else if (m[1] === "C")
      for (let k = 0; k + 5 < n.length; k += 6) {
        for (let t = 0.2; t <= 1.0001; t += 0.2) {
          const u = 1 - t;
          out.push([
            u * u * u * x +
              3 * u * u * t * n[k]! +
              3 * u * t * t * n[k + 2]! +
              t * t * t * n[k + 4]! +
              dx,
            u * u * u * y +
              3 * u * u * t * n[k + 1]! +
              3 * u * t * t * n[k + 3]! +
              t * t * t * n[k + 5]! +
              dy,
          ]);
        }
        x = n[k + 4]!;
        y = n[k + 5]!;
      }
  }
  return out;
}

/** Teilpfade als Polygone (`or`). */
function polygons(d: string, dx = 0, dy = 0): Pt[][] {
  const out: Pt[][] = [];
  for (const part of d.split(/(?=M)/)) {
    if (!part.trim()) continue;
    const p = pathSamples(part.replace(/Z/g, ""), dx, dy);
    if (p.length > 2) out.push(p);
  }
  return out;
}

/** Innere Strecken einer waagrechten Linie bei Höhe y (Nonzero-Regel) (`ot`). */
function scanline(polys: Pt[][], y: number): Array<[number, number]> {
  const hits: Array<{ x: number; w: number }> = [];
  for (const p of polys)
    for (let k = 0; k < p.length; k++) {
      const [x1, y1] = p[k]!;
      const [x2, y2] = p[(k + 1) % p.length]!;
      if (y1 !== y2 && ((y >= y1 && y < y2) || (y >= y2 && y < y1)))
        hits.push({
          x: x1 + ((y - y1) * (x2 - x1)) / (y2 - y1),
          w: y2 > y1 ? 1 : -1,
        });
    }
  hits.sort((a, b) => a.x - b.x);
  const runs: Array<[number, number]> = [];
  let wind = 0;
  let start = 0;
  for (const h of hits) {
    const before = wind;
    wind += h.w;
    if (before === 0 && wind !== 0) start = h.x;
    else if (before !== 0 && wind === 0 && h.x - start > 0.2)
      runs.push([start, h.x]);
  }
  return runs;
}

/** Umfassender Rahmen, leere Rahmen zählen nicht (`lr`). */
function union(boxes: Array<Rect | null | undefined>): Rect | null {
  let x1 = 1 / 0;
  let y1 = 1 / 0;
  let x2 = -1 / 0;
  let y2 = -1 / 0;
  for (const b of boxes) {
    if (!b || !(b.w > 0 || b.h > 0)) continue;
    x1 = Math.min(x1, b.x);
    y1 = Math.min(y1, b.y);
    x2 = Math.max(x2, b.x + b.w);
    y2 = Math.max(y2, b.y + b.h);
  }
  return isFinite(x1) ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
}

const grow = (b: Rect, d: number): Rect => ({
  x: b.x - d,
  y: b.y - d,
  w: b.w + 2 * d,
  h: b.h + 2 * d,
});

/** Rahmen nach Drehung um (cx, cy) (`Si`). */
function rotatedBox(b: Rect, deg: number, cx: number, cy: number): Rect {
  if (!deg) return b;
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const pts = [
    [b.x, b.y],
    [b.x + b.w, b.y],
    [b.x, b.y + b.h],
    [b.x + b.w, b.y + b.h],
  ].map(([x, y]) => [
    cx + (x! - cx) * cos - (y! - cy) * sin,
    cy + (x! - cx) * sin + (y! - cy) * cos,
  ]);
  const xs = pts.map((p) => p[0]!);
  const ys = pts.map((p) => p[1]!);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

const rectPath = (x: number, y: number, w: number, h: number): string =>
  `M${fmt(x)} ${fmt(y)}H${fmt(x + w)}V${fmt(y + h)}H${fmt(x)}Z`;
const circlePath = (cx: number, cy: number, r: number): string =>
  `M${fmt(cx - r)} ${fmt(cy)}A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx + r)} ${fmt(cy)}A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx - r)} ${fmt(cy)}Z`;

// ---------------------------------------------------------------------------
// Zusatz

/** Felder des Zusatzes (Nebenschrift); hier wirken Zusatz-Größe und -Schreibung (`ur`, Export `Z`). */
export const ZUSATZ_FELDER: readonly string[] = [
  "zusatz",
  "ort",
  "zusatzOrt",
  "zusatzOderOrt",
  "ortOderZusatz",
  "ort2",
  "jahr",
  "partnerZeile",
];

/**
 * Schreibungen, die der Editor für den Zusatz anbietet (`qo`, Export `I`): aus der
 * Vorlage, sonst die der Zusatz-Texte; nur Versalien heißt: Versalien, Titel, klein.
 */
export function zusatzSchreibungen(t: SignatureTemplate): CaseKey[] {
  if (t.zusatzSchreibungen) return t.zusatzSchreibungen;
  const list = [
    ...new Set(
      t.elemente
        .filter(
          (e): e is TextElement =>
            e.typ === "text" &&
            e.schrift === "neben" &&
            ZUSATZ_FELDER.includes(e.feld) &&
            !e.nurMessen,
        )
        .map((e) => e.schreibung),
    ),
  ];
  return list.length
    ? list.length === 1 && list[0] === "upper"
      ? ["upper", "title", "lower"]
      : list
    : [];
}

// ---------------------------------------------------------------------------
// Layout

interface Ctx {
  fonts: FontSource;
  refs: SignatureFontSet;
  reg: Registry;
  ops: SignatureOp[];
  problems: string[];
  /** Versalhöhe des Namens (erster Haupttext) */
  unit: number;
  fields: NameParts;
  fieldsNoTitle: NameParts;
  params: SignatureParams;
  schreibungen: CaseKey[];
  boxes: SignatureLayout["boxes"];
  /** Unterkante und Grundlinie des Namens */
  mainU?: number;
  mainB?: number;
}

/** Schrift eines Textes mit Ersatzschriften (Neben-, Hauptschrift; keine Schreibschrift) (`Uo`). */
function fontFor(ctx: Ctx, rolle: TextElement["schrift"]) {
  const ref = ctx.refs[rolle];
  const font = ctx.fonts.get(ref);
  const fallbacks: Font[] = [];
  for (const r of [ctx.refs.neben, ctx.refs.haupt])
    if (!sameFont(r, ref))
      try {
        if (ctx.fonts.has(r) && getFont(r.key).cat !== "script")
          fallbacks.push(ctx.fonts.get(r));
      } catch {
        /* Schrift fehlt im Katalog */
      }
  return { font, ref, fallbacks };
}

/** Zweizeilig an der Wortgrenze mit der kürzesten längeren Zeile (`jo`). */
function breakLines(text: string, width: (s: string) => number): string[] {
  const words = text.split(" ");
  if (words.length < 2) return [text];
  let best = [text];
  let bestW = 1 / 0;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(" ");
    const b = words.slice(k).join(" ");
    const w = Math.max(width(a), width(b));
    if (w < bestW) {
      bestW = w;
      best = [a, b];
    }
  }
  return best;
}

/** Element überspringen (`wenn`, `wennNicht`, `wennFehlt`) (`_o`). */
function skipped(ctx: Ctx, e: Element): boolean {
  return !!(
    (e.wenn && !ctx.fields[e.wenn]) ||
    (e.wennNicht && ctx.fields[e.wennNicht]) ||
    (e.wennFehlt && ctx.reg.has(e.wennFehlt))
  );
}

/** Einen Text setzen (`as`). */
function placeText(ctx: Ctx, e: TextElement): void {
  if (e.nurMessen) {
    const keep = {
      ops: ctx.ops,
      unit: ctx.unit,
      boxes: ctx.boxes,
      mainU: ctx.mainU,
      mainB: ctx.mainB,
    };
    ctx.ops = [];
    ctx.boxes = [];
    try {
      placeText(ctx, { ...e, nurMessen: false, pflicht: false });
    } finally {
      ctx.ops = keep.ops;
      ctx.unit = keep.unit;
      ctx.boxes = keep.boxes;
      ctx.mainU = keep.mainU;
      ctx.mainB = keep.mainB;
    }
    return;
  }
  const id = e.id ?? e.feld;
  const ebene = e.ebene ?? 0;
  const source = (
    e.ohneTitel || e.feld === "erster" || e.feld === "rest"
      ? ctx.fieldsNoTitle
      : ctx.fields
  )[e.feld];
  if (!source) {
    if (e.pflicht) ctx.problems.push(`Platzhalter {${e.feld}} ist leer.`);
    return;
  }
  const { font, ref, fallbacks } = fontFor(ctx, e.schrift);
  const raw =
    e.fest !== undefined
      ? e.fest.replace(
          /\{(\w+)\}/g,
          (_, f: string) => ctx.fields[f as keyof NameParts] ?? "",
        )
      : source;
  const zusatz = e.schrift === "neben" && ZUSATZ_FELDER.includes(e.feld);
  const schreibung =
    zusatz &&
    ctx.params.zusatzSchreibung &&
    ctx.schreibungen.includes(ctx.params.zusatzSchreibung)
      ? ctx.params.zusatzSchreibung
      : e.schreibung;
  let text = applyCase(raw, schreibung, ref.key);
  const umlautAt = e.umlaut
    ? Array.from(text).findIndex((c) => /[ÄÖÜäöü]/.test(c))
    : -1;
  const umlautChar = umlautAt >= 0 ? Array.from(text)[umlautAt]! : "";
  if (e.umlaut && umlautAt < 0) {
    if (e.pflicht) ctx.problems.push(`{${e.feld}} hat keinen Umlaut.`);
    return;
  }
  // Umlaut ohne Punkte setzen, die Punkte zeichnet das Element selbst
  if (umlautAt >= 0)
    text = Array.from(text)
      .map((c, k) => (k === umlautAt ? c.normalize("NFD")[0]! : c))
      .join("");

  const versal = value(e.versal, ctx.reg);
  const massstab =
    e.schrift === "neben" && ctx.params.zusatzMassstab
      ? Math.min(1.6, Math.max(0.75, ctx.params.zusatzMassstab))
      : 1;
  const soll = versal * massstab;
  if (e.schrift === "haupt" && !ctx.unit) ctx.unit = soll;
  let cap = soll;
  // Laufweite: eigene Schreibung (nicht Versalien) höchstens 0,06 em
  let tracking =
    schreibung !== e.schreibung && schreibung !== "upper"
      ? Math.min(e.laufweite, 0.06)
      : e.laufweite;
  const size = (c: number) => c / capHeight(font, 1);
  const tp = (s: string, c: number, tr = tracking): TextPath =>
    textPath(font, s, size(c), tr, fallbacks);
  const fit = e.einpassen;
  const zeichen = !!e.zeichen;

  if (e.bogen) {
    const r = e.bogen.r;
    const span = (e.bogen.spanne * Math.PI) / 180;
    const w = tp(text, cap).width;
    if (w / r > span) cap = (cap * span * r) / w;
    const min = e.bogen.minVersal ?? soll * 0.6;
    if (cap < min - 0.01) {
      if (e.pflicht)
        ctx.problems.push(`{${e.feld}} ist zu lang für den Bogen.`);
      else return;
      cap = min;
    }
    placeArcText(
      ctx,
      e,
      id,
      font,
      fallbacks,
      text,
      cap,
      value(e.bogen.cx, ctx.reg),
      value(e.bogen.cy, ctx.reg),
      r,
      e.bogen.lage,
    );
    return;
  }

  let lines = [text];
  if (e.blocksatz) {
    const target = value(e.blocksatz.breite, ctx.reg);
    const w = tp(text, cap).width;
    cap = (cap * target) / w;
    if (
      cap < e.blocksatz.minVersal - 0.01 ||
      cap > e.blocksatz.maxVersal + 0.01
    ) {
      if (e.pflicht)
        ctx.problems.push(
          `{${e.feld}} lässt sich nicht im Blocksatz setzen (${cap < e.blocksatz.minVersal ? "zu lang" : "zu kurz"}).`,
        );
      else return;
      cap = Math.min(
        e.blocksatz.maxVersal,
        Math.max(e.blocksatz.minVersal, cap),
      );
    }
  }
  if (fit) {
    const max = value(fit.maxBreite, ctx.reg);
    let w = tp(text, cap).width;
    if (
      w > max &&
      fit.umbruch &&
      text.includes(" ") &&
      (cap * max) / w < soll * 0.86
    ) {
      lines = breakLines(text, (s) => tp(s, cap).width);
      w = Math.max(...lines.map((s) => tp(s, cap).width));
    }
    if (w > max) cap = (cap * max) / w;
    if (cap < fit.minVersal * Math.min(1, massstab) - 0.01) {
      if (e.pflicht)
        ctx.problems.push(
          `{${e.feld}} ist zu lang für diese Vorlage (Mindestgröße unterschritten).`,
        );
      else return;
      cap = fit.minVersal;
    }
  }
  if (e.austreiben !== undefined && lines.length === 1) {
    const target = value(e.austreiben, ctx.reg);
    const n = Array.from(text).length;
    const w = tp(text, cap).width;
    if (n > 1 && w < target) {
      const extra = (target - w) / (n - 1) / size(cap);
      if (tracking + extra <= 0.5) tracking += extra;
    }
  }

  const lineGap = (fit?.zeilenabstand ?? 1.4) * cap;
  const set = lines
    .map((s) => tp(s, cap))
    .map((s, k) => ({
      s,
      x:
        e.ausrichtung === "links"
          ? e.stift
            ? (s.left ?? 0)
            : 0
          : e.ausrichtung === "rechts"
            ? -s.width
            : -s.width / 2,
      base: k * lineGap,
    }));
  const rot = e.drehung ?? 0;
  const ax = value(e.x, ctx.reg);
  const ay = value(e.y, ctx.reg);
  // Größerer Zusatz unter dem Namen rückt mit, damit der Abstand gleich bleibt
  let baseY =
    (massstab !== 1 &&
    e.anker !== "oben" &&
    ctx.mainU !== undefined &&
    ay - versal > ctx.mainU - 2
      ? ay + soll - versal
      : ay) + (e.anker === "oben" ? cap : 0);
  // Kleiner Zusatz unter dem Namen: mindestens eine halbe Versalhöhe Abstand zur Unterlänge
  if (
    e.schrift === "neben" &&
    !rot &&
    cap <= 0.6 * (ctx.unit || UNIT) &&
    ctx.mainU !== undefined &&
    ctx.mainB !== undefined &&
    baseY - cap > ctx.mainB
  ) {
    const min = ctx.mainU + 0.5 * cap;
    if (baseY - cap < min) baseY = min + cap;
  }
  const transform = (dx: number, dy: number, extra = "") =>
    `translate(${fmt(ax)} ${fmt(baseY)})${rot ? ` rotate(${fmt(rot, 3)})` : ""} translate(${fmt(dx)} ${fmt(dy)})${extra}`;
  const toBox = (b: Rect) =>
    rotatedBox({ x: b.x + ax, y: b.y + baseY, w: b.w, h: b.h }, rot, ax, baseY);
  const lineBoxes: Rect[] = [];
  for (const { s, x, base } of set) {
    if (!s.d) continue;
    const top = base - s.ascent;
    const box = toBox({ x, y: top, w: s.width, h: s.height });
    lineBoxes.push(box);
    const mirror = e.spiegeln
      ? ` translate(${fmt(s.width)} 0) scale(-1 1)`
      : "";
    if (e.hof)
      ctx.ops.push({
        d: s.d,
        transform: transform(x, top, mirror),
        fill: "grund",
        stroke: "grund",
        sw: e.hof * 2,
        box: grow(box, e.hof),
        zeichen,
        ebene,
      });
    if (e.kontur)
      ctx.ops.push({
        d: s.d,
        transform: transform(x, top, mirror),
        fill: "none",
        stroke: e.rolle,
        sw: e.kontur,
        box: grow(box, e.kontur / 2),
        zeichen,
        ebene,
      });
    else
      ctx.ops.push({
        d: s.d,
        transform: transform(x, top, mirror),
        fill: e.rolle,
        box,
        zeichen,
        ebene,
      });
    for (const f of e.fugen ?? []) {
      const fy = base - f.bei * cap - f.staerke / 2;
      ctx.ops.push({
        d: rectPath(x, fy, s.width, f.staerke),
        transform: transform(0, 0),
        fill: "grund",
        box: null,
        zeichen,
        ebene,
      });
    }
  }

  const last = set[set.length - 1];
  if (e.spiegel && !rot && last?.s.d) {
    const { abstand, stauchung, linien } = e.spiegel;
    const top = baseY + last.base - last.s.ascent;
    const axis = baseY + last.base + abstand;
    const x0 = ax + last.x;
    const h = last.s.height * stauchung;
    const y0 = axis + stauchung * (axis - (top + last.s.height));
    const box = { x: x0, y: y0, w: last.s.width, h };
    ctx.ops.push({
      d: last.s.d,
      transform: `translate(${fmt(x0)} ${fmt(axis + stauchung * (axis - top))}) scale(1 ${fmt(-stauchung, 4)})`,
      fill: e.spiegel.rolle ?? e.rolle,
      box,
      zeichen,
      ebene,
    });
    const n = Math.max(1, linien);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.6) / (n + 0.3);
      const ly = y0 + h * t;
      const lh = Math.max(cap * 0.03, h * 0.06 * (0.7 + t));
      ctx.ops.push({
        d: rectPath(x0, ly - lh / 2, last.s.width, lh),
        fill: "grund",
        box: null,
        zeichen,
        ebene,
      });
    }
    ctx.reg.set("spiegel", {
      l: x0,
      r: x0 + last.s.width,
      t: y0,
      b: y0 + h,
      o: y0,
      u: y0 + h,
      cap: h,
    });
  }

  const box = union(lineBoxes);
  if (!box) return;
  ctx.boxes.push({ id, neben: e.schrift === "neben", box });
  if (e.schrift === "haupt" && ctx.mainU === undefined && !rot) {
    ctx.mainU = box.y + box.h;
    ctx.mainB = baseY + (lines.length - 1) * lineGap;
  }
  const extra = (lines.length - 1) * lineGap;
  const k: Kanten = rot
    ? {
        l: box.x,
        r: box.x + box.w,
        t: box.y,
        b: box.y + box.h,
        o: box.y,
        u: box.y + box.h,
        cap,
      }
    : {
        l: box.x,
        r: box.x + box.w,
        t: baseY - cap,
        b: baseY + extra,
        o: box.y,
        u: box.y + box.h,
        cap,
      };
  if (!rot && lines.length === 1) {
    const one = set[0]!;
    const start = ax + one.x - (one.s.left ?? 0);
    k.a = start + (one.s.advance ?? one.s.width);
    const flip = (p: Pt[]): Pt[] =>
      e.spiegeln ? p.map(([x, y]) => [k.l + k.r - x, y]) : p;
    k.pts = flip(pathSamples(one.s.d, ax + one.x, baseY - one.s.ascent));
    const polys = polygons(one.s.d, ax + one.x, baseY - one.s.ascent).map(flip);
    const runs = scanline(polys, baseY - 0.3 * cap);
    if (runs.length) {
      k.sl = runs[0]![1] - runs[0]![0];
      k.sr = runs[runs.length - 1]![1] - runs[runs.length - 1]![0];
    }
    const glyphAt = (at: number) => {
      const chars = Array.from(text);
      const g = tp(chars[at]!, cap);
      const adv = tp(chars.slice(0, at + 1).join(""), cap).advance ?? 0;
      const x0 = start + (at ? adv - (g.advance ?? 0) : 0) + (g.left ?? 0);
      return { g, x0, top: baseY - g.ascent };
    };
    if (e.markierung)
      drawMarkierung(
        ctx,
        e,
        text,
        start,
        baseY,
        cap,
        (s) => tp(s, cap),
        (s) => tp(s, cap).advance ?? 0,
        zeichen,
      );
    if (e.ohneQuerbalken)
      drawOhneQuerbalken(ctx, e, text, glyphAt, cap, zeichen);
    if (umlautAt >= 0 && e.umlaut)
      drawUmlaut(
        ctx,
        e,
        umlautChar,
        glyphAt(umlautAt),
        (s) => tp(s, cap),
        baseY,
        cap,
        zeichen,
      );
    if (
      e.fundament &&
      !drawFundament(ctx, e, text, glyphAt, baseY, cap, zeichen) &&
      e.pflicht
    )
      ctx.problems.push(
        `{${e.feld}} hat keinen Buchstaben mit geradem Stamm für das Fundament.`,
      );
  }
  ctx.reg.set(id, k);
}

type GlyphAt = (at: number) => { g: TextPath; x0: number; top: number };

/** Querbalken einzelner Buchstaben aussparen (`Yo`). */
function drawOhneQuerbalken(
  ctx: Ctx,
  e: TextElement,
  text: string,
  glyphAt: GlyphAt,
  cap: number,
  zeichen: boolean,
) {
  const chars = Array.from(text);
  for (let k = 0; k < chars.length; k++) {
    if (!e.ohneQuerbalken!.includes(chars[k]!)) continue;
    const { g, x0, top } = glyphAt(k);
    const polys = polygons(g.d);
    const asc = g.ascent;
    let upper = -1;
    let lower = -1;
    for (let y = asc - 0.06 * cap; y > asc - 0.8 * cap; y -= 0.5) {
      const n = scanline(polys, y).length;
      if (upper < 0) {
        if (n === 1 && y < asc - 0.12 * cap) upper = y;
      } else if (n >= 2) {
        lower = y;
        break;
      }
    }
    if (upper < 0 || lower < 0) continue;
    const a = scanline(polys, upper + 1.5);
    const b = scanline(polys, lower - 0.5);
    if (a.length < 2 || b.length < 2) continue;
    const ya = upper + 1.5;
    const yb = lower - 0.5;
    const pts = [
      [b[0]![1], yb],
      [b[b.length - 1]![0], yb],
      [a[a.length - 1]![0], ya],
      [a[0]![1], ya],
    ].map(([x, y]) => `${fmt(x! + x0)} ${fmt(y! + top)}`);
    ctx.ops.push({
      d: `M${pts.join("L")}Z`,
      fill: "grund",
      box: null,
      zeichen,
      ebene: e.ebene ?? 0,
    });
  }
}

/** Umlaut-Punkte als Quadrate (`Jo`). */
function drawUmlaut(
  ctx: Ctx,
  e: TextElement,
  ch: string,
  at: { g: TextPath; x0: number },
  tp: (s: string) => TextPath,
  baseY: number,
  cap: number,
  zeichen: boolean,
) {
  const withDots = tp(ch);
  const plain = tp(ch.normalize("NFD")[0]!);
  const limit = withDots.ascent - plain.ascent - 0.5;
  const dots = polygons(withDots.d)
    .filter((p) => Math.max(...p.map((q) => q[1])) < limit)
    .map((p) => {
      const xs = p.map((q) => q[0]);
      const ys = p.map((q) => q[1]);
      return {
        cx: (Math.min(...xs) + Math.max(...xs)) / 2,
        cy: (Math.min(...ys) + Math.max(...ys)) / 2,
      };
    })
    .sort((a, b) => a.cx - b.cx);
  if (dots.length < 2) return;
  const pair = [dots[0]!, dots[dots.length - 1]!];
  const size = e.umlaut!.kante * cap;
  const left = at.x0 - (plain.left ?? 0) + (withDots.left ?? 0);
  const top = baseY - withDots.ascent;
  for (const d of pair) {
    const x = left + d.cx - size / 2;
    const y = top + d.cy - size / 2;
    ctx.ops.push({
      d: rectPath(x, y, size, size),
      fill: e.umlaut!.rolle,
      box: { x, y, w: size, h: size },
      zeichen,
      ebene: e.ebene ?? 0,
    });
  }
}

/** Sockel unter einem Buchstaben mit geradem Stamm, von der Mitte aus gesucht (`Qo`). */
function drawFundament(
  ctx: Ctx,
  e: TextElement,
  text: string,
  glyphAt: GlyphAt,
  baseY: number,
  cap: number,
  zeichen: boolean,
): boolean {
  const chars = Array.from(text)
    .map((c, k) => ({ c, k }))
    .filter(({ c }) => c !== " ");
  const mid = Math.floor(chars.length / 2);
  const hit = [...chars.slice(mid), ...chars.slice(0, mid).reverse()].find(
    ({ c }) => e.fundament!.buchstaben.includes(c),
  );
  if (!hit) return false;
  const { g, x0 } = glyphAt(hit.k);
  const runs = scanline(polygons(g.d), g.ascent - 0.3 * cap);
  if (!runs.length) return false;
  const [a, b] = runs[0]!;
  const x = x0 + a;
  const w = b - a;
  const y = baseY - 1;
  const h = e.fundament!.tiefe + 1;
  ctx.ops.push({
    d: rectPath(x, y, w, h),
    fill: e.fundament!.rolle,
    box: { x, y, w, h },
    zeichen,
    ebene: e.ebene ?? 0,
  });
  ctx.reg.set("fundament", {
    l: x,
    r: x + w,
    t: y,
    b: y + h,
    o: y,
    u: y + h,
    cap: h,
  });
  return true;
}

/** Zeichen über oder unter einem Buchstaben (`Xo`). */
function drawMarkierung(
  ctx: Ctx,
  e: TextElement,
  text: string,
  start: number,
  baseY: number,
  cap: number,
  tp: (s: string) => TextPath,
  advance: (s: string) => number,
  zeichen: boolean,
) {
  const m = e.markierung!;
  const chars = Array.from(text);
  let at =
    m.an === "letzter"
      ? chars.length - 1
      : m.an === "vokal1"
        ? chars.findIndex((c) => /[aeiouAEIOU]/.test(c))
        : m.an;
  if (at < 0 || at >= chars.length) at = 0;
  const g = tp(chars[at]!);
  const cx =
    start +
    (at ? advance(chars.slice(0, at).join("")) : 0) +
    (g.left ?? 0) +
    g.width / 2;
  const push = (d: string, x: number, y: number, box: Rect) =>
    ctx.ops.push({
      d,
      transform: `translate(${fmt(x)} ${fmt(y)})`,
      fill: m.rolle,
      box,
      zeichen,
      ebene: e.ebene ?? 0,
    });
  if (m.unten) {
    const y = Math.max(baseY, baseY - g.ascent + g.height) + m.abstand;
    if (m.balken) {
      const w = g.width * 0.86;
      push(
        `M${fmt(-w / 2)} 0H${fmt(w / 2)}V${fmt(m.balken)}H${fmt(-w / 2)}Z`,
        cx,
        y,
        { x: cx - w / 2, y, w, h: m.balken },
      );
      return;
    }
    const b = svgBounds(`<path d="${m.motiv}"/>`);
    if (b) push(m.motiv!, cx, y, { x: cx + b.x, y: y + b.y, w: b.w, h: b.h });
    return;
  }
  const y = Math.min(baseY - g.ascent, baseY - cap * 0.5) - m.abstand;
  if (m.balken) {
    const w = g.width * 0.86;
    push(
      `M${fmt(-w / 2)} ${fmt(-m.balken)}H${fmt(w / 2)}V0H${fmt(-w / 2)}Z`,
      cx,
      y,
      {
        x: cx - w / 2,
        y: y - m.balken,
        w,
        h: m.balken,
      },
    );
    return;
  }
  const b = svgBounds(`<path d="${m.motiv}"/>`);
  if (b) push(m.motiv!, cx, y, { x: cx + b.x, y: y + b.y, w: b.w, h: b.h });
}

/** Text auf einem Bogen, Buchstabe für Buchstabe gedreht (`el`). */
function placeArcText(
  ctx: Ctx,
  e: TextElement,
  id: string,
  font: Font,
  fallbacks: Font[],
  text: string,
  cap: number,
  cx: number,
  cy: number,
  r: number,
  lage: "oben" | "unten",
) {
  const size = cap / capHeight(font, 1);
  const chars = Array.from(text);
  const adv = (s: string) =>
    textPath(font, s, size, e.laufweite, fallbacks).advance ?? 0;
  const angle = (adv(text) - e.laufweite * size) / r;
  const top = lage === "oben";
  const start = top ? -Math.PI / 2 - angle / 2 : Math.PI / 2 + angle / 2;
  const boxes: Rect[] = [];
  let before = "";
  for (const ch of chars) {
    const offset = before ? adv(before) : 0;
    before += ch;
    if (ch === " ") continue;
    const g = textPath(font, ch, size, 0, fallbacks);
    if (!g.d) continue;
    const w = g.advance ?? g.width;
    const da = (offset + w / 2) / r;
    const a = top ? start + da : start - da;
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    const deg = ((top ? a + Math.PI / 2 : a - Math.PI / 2) * 180) / Math.PI;
    const gx = px - g.width / 2;
    const gy = py - g.ascent;
    const box = rotatedBox(
      { x: gx, y: gy, w: g.width, h: g.height },
      deg,
      px,
      py,
    );
    boxes.push(box);
    ctx.ops.push({
      d: g.d,
      transform: `rotate(${fmt(deg, 3)} ${fmt(px)} ${fmt(py)}) translate(${fmt(gx)} ${fmt(gy)})`,
      fill: e.rolle,
      box,
      zeichen: !!e.zeichen,
      ebene: e.ebene ?? 0,
    });
  }
  const b = union(boxes);
  if (b)
    ctx.reg.set(id, {
      l: b.x,
      r: b.x + b.w,
      t: b.y,
      b: b.y + b.h,
      o: b.y,
      u: b.y + b.h,
      cap,
    });
}

/** Pfad oder Motiv an einem Punkt, optional skaliert und gedreht (`Lr`). */
function placePath(
  d: string,
  x: number,
  y: number,
  scale: number,
  kontur: number | undefined,
  rolle: Rolle,
  zeichen: boolean,
  ebene: number,
  deg = 0,
): SignatureOp {
  const b = svgBounds(`<path d="${d}"/>`);
  const s = b
    ? { x: b.x * scale, y: b.y * scale, w: b.w * scale, h: b.h * scale }
    : null;
  const box =
    s && rotatedBox({ x: x + s.x, y: y + s.y, w: s.w, h: s.h }, deg, x, y);
  const transform = `translate(${fmt(x)} ${fmt(y)})${deg ? ` rotate(${deg})` : ""}${scale !== 1 ? ` scale(${fmt(scale, 4)})` : ""}`;
  return kontur
    ? {
        d,
        transform,
        fill: "none",
        stroke: rolle,
        sw: kontur / scale,
        box: box && grow(box, kontur / 2),
        zeichen,
        ebene,
      }
    : { d, transform, fill: rolle, box, zeichen, ebene };
}

/** Linien, Flächen, Kreise, Bögen, Pfade und Reihen setzen (`nl`). */
function placeShape(ctx: Ctx, e: FormElement): void {
  const zeichen = !!e.zeichen;
  const ebene = e.ebene ?? 0;
  const v = (x: Ausdruck) => value(x, ctx.reg);
  const ops: SignatureOp[] = [];
  switch (e.typ) {
    case "linie":
    case "zug": {
      const pts: Pt[] =
        e.typ === "linie"
          ? [
              [v(e.x1), v(e.y1)],
              [v(e.x2), v(e.y2)],
            ]
          : e.punkte.map(([x, y]) => [v(x), v(y)]);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const half = e.staerke / 2;
      const box = grow(
        {
          x: Math.min(...xs),
          y: Math.min(...ys),
          w: Math.max(...xs) - Math.min(...xs),
          h: Math.max(...ys) - Math.min(...ys),
        },
        half,
      );
      // stumpfe Enden: waagrechte Linien nicht über die Enden hinaus
      if (pts.length === 2 && ys[0] === ys[1])
        Object.assign(box, { x: box.x + half, w: box.w - 2 * half });
      if (pts.length === 2 && xs[0] === xs[1])
        Object.assign(box, { y: box.y + half, h: box.h - 2 * half });
      ops.push({
        d: pts
          .map(([x, y], k) => `${k ? "L" : "M"}${fmt(x)} ${fmt(y)}`)
          .join(""),
        fill: "none",
        stroke: e.rolle,
        sw: e.staerke,
        box,
        zeichen,
        ebene,
      });
      break;
    }
    case "rechteck": {
      const x = v(e.x);
      const y = v(e.y);
      const w = v(e.b);
      const h = v(e.h);
      ops.push(
        e.kontur
          ? {
              d: rectPath(x, y, w, h),
              fill: "none",
              stroke: e.rolle,
              sw: e.kontur,
              box: grow({ x, y, w, h }, e.kontur / 2),
              zeichen,
              ebene,
            }
          : {
              d: rectPath(x, y, w, h),
              fill: e.rolle,
              box: { x, y, w, h },
              zeichen,
              ebene,
            },
      );
      break;
    }
    case "kreis": {
      const cx = v(e.cx);
      const cy = v(e.cy);
      const r = v(e.r);
      const box = { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
      ops.push(
        e.kontur
          ? {
              d: circlePath(cx, cy, r),
              fill: "none",
              stroke: e.rolle,
              sw: e.kontur,
              box: grow(box, e.kontur / 2),
              zeichen,
              ebene,
            }
          : { d: circlePath(cx, cy, r), fill: e.rolle, box, zeichen, ebene },
      );
      break;
    }
    case "bogen": {
      const cx = v(e.cx);
      const cy = v(e.cy);
      const r = v(e.r);
      const a1 = (e.von * Math.PI) / 180;
      const a2 = (e.bis * Math.PI) / 180;
      const p1: Pt = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      const p2: Pt = [cx + r * Math.cos(a2), cy + r * Math.sin(a2)];
      const large = Math.abs(e.bis - e.von) > 180 ? 1 : 0;
      const sweep = e.bis > e.von ? 1 : 0;
      const pts: Pt[] = [p1, p2];
      for (let a = Math.min(e.von, e.bis); a <= Math.max(e.von, e.bis); a += 3)
        pts.push([
          cx + r * Math.cos((a * Math.PI) / 180),
          cy + r * Math.sin((a * Math.PI) / 180),
        ]);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const box = grow(
        {
          x: Math.min(...xs),
          y: Math.min(...ys),
          w: Math.max(...xs) - Math.min(...xs),
          h: Math.max(...ys) - Math.min(...ys),
        },
        e.staerke / 2,
      );
      ops.push({
        d: `M${fmt(p1[0])} ${fmt(p1[1])}A${fmt(r)} ${fmt(r)} 0 ${large} ${sweep} ${fmt(p2[0])} ${fmt(p2[1])}`,
        fill: "none",
        stroke: e.rolle,
        sw: e.staerke,
        box,
        zeichen,
        ebene,
      });
      break;
    }
    case "pfad": {
      const x = v(e.x);
      const y = v(e.y);
      const s = e.massstab === undefined ? 1 : v(e.massstab);
      ops.push(placePath(e.d, x, y, s, e.kontur, e.rolle, zeichen, ebene));
      break;
    }
    case "reihe": {
      const x1 = v(e.x1);
      const x2 = v(e.x2);
      const y = v(e.y);
      const n = Math.max(0, Math.floor((x2 - x1) / e.teilung + 1e-6));
      const b = svgBounds(`<path d="${e.motiv}"/>`);
      const motivW = b ? b.x + b.w : e.teilung;
      const total = (n - 1) * e.teilung + motivW;
      const x0 = x1 + (x2 - x1 - total) / 2;
      for (let k = 0; k < n; k++)
        ops.push(
          e.senkrecht
            ? placePath(
                e.motiv,
                y,
                x0 + k * e.teilung,
                1,
                e.kontur,
                e.rolle,
                zeichen,
                ebene,
                90,
              )
            : placePath(
                e.motiv,
                x0 + k * e.teilung,
                y,
                1,
                e.kontur,
                e.rolle,
                zeichen,
                ebene,
              ),
        );
      break;
    }
  }
  ctx.ops.push(...ops);
  const b = union(ops.map((o) => o.box));
  if (e.id && b)
    ctx.reg.set(e.id, {
      l: b.x,
      r: b.x + b.w,
      t: b.y,
      b: b.y + b.h,
      o: b.y,
      u: b.y + b.h,
      cap: b.h,
    });
}

/**
 * Vorlage für eine Marke setzen (`ft`): Elemente in Reihenfolge, fehlende Bezüge
 * überspringen (bei Pflichttexten als Problem), Ausgabe nach Ebene sortiert.
 */
export function layoutSignature(
  t: SignatureTemplate,
  input: SignatureInput,
  fonts: FontSource,
  params: SignatureParams = {},
): SignatureLayout {
  const refs = templateFonts(t, input, params);
  const ctx: Ctx = {
    fonts,
    refs,
    reg: new Map(),
    ops: [],
    problems: [],
    unit: 0,
    fields: nameParts(input),
    fieldsNoTitle: nameParts(input, true),
    params,
    schreibungen: zusatzSchreibungen(t),
    boxes: [],
  };
  for (const e of t.elemente)
    if (!skipped(ctx, e))
      try {
        if (e.typ === "text") placeText(ctx, e);
        else placeShape(ctx, e);
      } catch (err) {
        if (err instanceof MissingElement) {
          if (e.typ === "text" && e.pflicht)
            ctx.problems.push(
              `Platzhalter {${e.feld}} hängt an einem fehlenden Element.`,
            );
          continue;
        }
        throw err;
      }
  return {
    ops: ctx.ops
      .map((o, i) => ({ o, i }))
      .sort((a, b) => a.o.ebene - b.o.ebene || a.i - b.i)
      .map((x) => x.o),
    problems: ctx.problems,
    unit: ctx.unit || UNIT,
    refs,
    boxes: ctx.boxes,
  };
}

// ---------------------------------------------------------------------------
// Farben und SVG

/** Farben je Rolle für eine Palette und Variante (`tl`). */
export function signatureColors(
  t: SignatureTemplate,
  palette: Palette,
  variant = "color",
  ground?: string,
): SignatureColors {
  const c = resolveColors(
    {
      palette,
      colors: {
        name: t.farben.name,
        suffix: t.farben.neben,
        symbol: t.farben.zeichen,
      },
      typo: { markColor: t.farben.akzent },
    },
    variant,
    ground,
  );
  return {
    name: c.name,
    neben: c.suffix,
    zeichen: c.symbol,
    akzent: c.mark,
    grund: c.knockout,
  };
}

/** Ein Teil als `<path>` (`rl`). */
function opSvg(o: SignatureOp, colors: SignatureColors, boost: number): string {
  const fill = o.fill === "none" ? "none" : colors[o.fill];
  const stroke = o.stroke
    ? ` stroke="${colors[o.stroke]}" stroke-width="${fmt((o.sw ?? 1) * boost, 3)}"${o.fill === "none" ? ' stroke-linecap="butt" stroke-linejoin="miter"' : ' stroke-linejoin="round"'}`
    : "";
  return `<path${o.transform ? ` transform="${o.transform}"` : ""} d="${o.d}" fill="${fill}"${stroke}/>`;
}

/** HSL einer Hexfarbe (eigene Fassung der Vorlagen, h in Grad) (`al`). */
function hsl(hex: string): [number, number, number] {
  const m = hex
    .replace("#", "")
    .match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return [0, 0, 0];
  const [r, g, b] = [m[1]!, m[2]!, m[3]!].map((h) => parseInt(h, 16) / 255) as [
    number,
    number,
    number,
  ];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  return [
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) * 60
      : max === g
        ? ((b - r) / d + 2) * 60
        : ((r - g) / d + 4) * 60,
    s,
    l,
  ];
}

/** Die Palette hat ein kräftiges Gelb und ein kräftiges Rot (`ss`). */
export function hasYellowAndRed(p: Palette): boolean {
  const strong = [p.primary, p.secondary, p.accent, p.paper]
    .map(hsl)
    .filter(([, s, l]) => s >= 0.45 && l > 0.2 && l < 0.85);
  const yellow = strong.some(([h]) => h >= 40 && h <= 70);
  const red = strong.some(([h]) => h <= 15 || h >= 340);
  return yellow && red;
}

/** Zwischenspeicher je Schriftspeicher (`ma`). */
const cache = new WeakMap<FontSource, Map<string, SvgPart>>();

/**
 * Vorlage als SVG-Teil (`il`): Versalhöhe des Namens wird 100, Ausschnitt `symbol`
 * (nur Zeichen, sonst Monogramm aus der Hauptschrift) oder `wordmark` (ohne Zeichen).
 */
export function renderTemplate(
  t: SignatureTemplate,
  input: SignatureInput,
  fonts: FontSource,
  palette: Palette,
  variant = "color",
  opts: RenderOptions = {},
): SvgPart {
  let m = cache.get(fonts);
  if (!m) cache.set(fonts, (m = new Map()));
  const key = JSON.stringify([
    t,
    input.name,
    input.suffix ?? "",
    input.place ?? "",
    input.nameKind ?? "",
    input.ort2 ?? "",
    input.jahr ?? "",
    palette,
    variant,
    opts,
    fonts.version ?? 0,
  ]);
  const hit = m.get(key);
  if (hit) return { ...hit };
  const out = draw(t, input, fonts, palette, variant, opts);
  if (m.size > 400) m.clear();
  m.set(key, out);
  return { ...out };
}

function draw(
  t: SignatureTemplate,
  input: SignatureInput,
  fonts: FontSource,
  palette: Palette,
  variant: string,
  opts: RenderOptions,
): SvgPart {
  let pal = palette;
  if (t.farben.ohneGelbRot && hasYellowAndRed(pal)) {
    const all = basePalettes();
    pal =
      all.find((p) => p.id.split("-")[0] === t.farben.paletten[0]) ?? all[0]!;
  }
  const colors = signatureColors(t, pal, variant, opts.ground);
  const boost = opts.boost && opts.boost > 0 ? opts.boost : 1;
  const layout = layoutSignature(t, input, fonts, opts.params);
  const part = opts.part ?? "full";
  let ops = layout.ops;
  if (part === "symbol" || opts.lockup === "monogram") {
    const z = ops.filter((o) => o.zeichen);
    if (z.some((o) => o.box)) ops = z;
    else return monogram(t, input, fonts, layout.refs.haupt, colors);
  } else if (part === "wordmark") {
    const w = ops.filter((o) => !o.zeichen);
    if (w.some((o) => o.box)) ops = w;
  }
  const b = union(ops.map((o) => o.box));
  if (!b) return { body: "", width: 0, height: 0 };
  const s = UNIT / layout.unit;
  const body = ops.map((o) => opSvg(o, colors, boost)).join("");
  return {
    body: `<g transform="translate(${fmt(-b.x * s, 3)} ${fmt(-b.y * s, 3)}) scale(${fmt(s, 5)})">${body}</g>`,
    width: Math.round(b.w * s * 100) / 100,
    height: Math.round(b.h * s * 100) / 100,
  };
}

/**
 * Initialen für das Monogramm (`os`): bei Personen beide (wenn A bis Z), sonst
 * die erste; `null`, wenn keine einfache Initiale da ist.
 */
export function signatureInitials(
  input: Pick<
    BrandInput,
    "name" | "suffix" | "place" | "nameKind" | "ort2" | "jahr"
  >,
): string | null {
  const f = nameParts(input);
  const ok = (c: string) => /^[A-Z]$/.test(c);
  return isPersonName(input)
    ? ok(f.initial1) && (!f.initial2 || ok(f.initial2))
      ? f.initial1 + f.initial2
      : f.initial2 && ok(f.initial2)
        ? f.initial2
        : ok(f.initial1)
          ? f.initial1
          : null
    : ok(f.initial1)
      ? f.initial1
      : null;
}

/** Monogramm aus der Hauptschrift, wenn die Vorlage kein Zeichen hat (`ol`). */
function monogram(
  t: SignatureTemplate,
  input: SignatureInput,
  fonts: FontSource,
  haupt: FontRef,
  colors: SignatureColors,
): SvgPart {
  const initials = signatureInitials(input);
  if (!initials) return { body: "", width: 0, height: 0 };
  const kind = getFont(haupt.key).cat === "serif" ? "serif" : "sans";
  const svg = fontMonogramSvg(
    fonts.get(haupt),
    initials,
    { x: 0, y: 0, w: 100, h: 100 },
    colors[t.farben.zeichen === "ink" ? "name" : "zeichen"],
    kind,
  );
  const b = svgBounds(svg);
  if (!b) return { body: "", width: 0, height: 0 };
  const s = (UNIT * 3) / Math.max(b.w, b.h);
  return {
    body: `<g transform="translate(${fmt(-b.x * s, 3)} ${fmt(-b.y * s, 3)}) scale(${fmt(s, 5)})">${svg}</g>`,
    width: Math.round(b.w * s * 100) / 100,
    height: Math.round(b.h * s * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Passung

/** Buchstaben im Namen ohne Titel und Leerzeichen (`ll`). */
function letterCount(name: string): number {
  return Array.from(splitTitles(name).words.join("")).filter((c) =>
    /\p{L}/u.test(c),
  ).length;
}

/** Gesperrte Buchstabenpaare an der Wortbrücke (`ul`). */
const FUGE_GESPERRT = ["TL"];
/** Gesperrte Kennbuchstaben (Nähe zu bekannten Monogrammen) (`cl`). */
const KENN_GESPERRT = "CDFGL";
/** Gründe für leere Pflichtfelder (`ml`). */
const FELD_GRUND: Partial<Record<keyof NameParts, string>> = {
  koordinaten:
    "Für diesen Ort sind keine Koordinaten hinterlegt (Ortstabelle: Wiener Bezirke und größere Orte).",
  plz: "Für diesen Ort ist keine eindeutige Postleitzahl hinterlegt.",
  nummer: "Vorlage braucht einen Wiener Bezirk als Ort.",
  ort2: "Vorlage braucht einen zweiten Ort.",
  jahr: "Vorlage braucht ein echtes Gründungsjahr (vierstellig).",
  kuerzel: "Vorlage braucht zwei Initialen.",
  partner1: "Vorlage braucht zwei Partner im Namen (A & B).",
  partner2: "Vorlage braucht zwei Partner im Namen (A & B).",
  teil2: "Vorlage braucht einen Namen aus mindestens zwei Wörtern.",
  partnerName:
    'Vorlage braucht einen Namen mit Partner-Endung (z.B. "& Partner", "& Söhne").',
  partnerEndung:
    'Vorlage braucht einen Namen mit Partner-Endung (z.B. "& Partner", "& Söhne").',
  partnerVerbinder: "Vorlage braucht einen Verbinder im Namen (&, und).",
  partnerZweit:
    'Vorlage braucht einen Namen mit Partner-Endung (z.B. "& Partner", "& Söhne").',
};

const no = (grund: string): FitResult => ({ passt: false, grund });

/**
 * Passt die Vorlage zur Marke (`hl`)? Erst die Regeln aus `passt`, Pflichtfelder,
 * Stil und Zeichenvorrat; mit geladenen Schriften auch die Einpassung (Probleme
 * des Layouts, Zusatz vorhanden, Verhältnis Name zu Initiale).
 */
export function checkFit(
  t: SignatureTemplate,
  input: SignatureInput,
  fonts?: FontSource | null,
  opts: FitOptions = {},
): FitResult {
  const name = cleanText(input.name);
  if (!name) return no("Kein Name eingegeben.");
  const art = isPersonName(input) ? "person" : "firma";
  const p = t.passt;
  if (!p.arten.includes(art))
    return no(
      art === "person"
        ? "Vorlage ist für Firmenmarken gedacht."
        : "Vorlage ist für Personenmarken gedacht.",
    );
  const words = splitTitles(name).words.length;
  const [min, max] = p.wortzahl;
  if (words < min || words > max)
    return no(
      min === max
        ? `Vorlage braucht einen Namen mit ${min} ${min === 1 ? "Wort" : "Wörtern"}.`
        : `Vorlage braucht ${min} bis ${max} Wörter im Namen.`,
    );
  const letters = letterCount(name);
  if (p.nurLang && letters < p.nurLang && words < 2)
    return no(
      `Vorlage nur für längere Marken (ab ${p.nurLang} Buchstaben oder zwei Wörtern).`,
    );
  if (letters < p.minZeichen)
    return no(
      `Name zu kurz für diese Vorlage (mindestens ${p.minZeichen} Buchstaben).`,
    );
  if (letters > p.maxZeichen)
    return no(
      `Name zu lang für diese Vorlage (höchstens ${p.maxZeichen} Buchstaben).`,
    );
  const f = nameParts(input);
  if (p.initialen >= 2 && !f.initial2)
    return no("Vorlage braucht zwei Initialen.");
  if (p.initialen >= 1 && !f.initial1)
    return no("Vorlage braucht eine Initiale.");
  if (
    p.buchstabenAus &&
    f.erster &&
    p.buchstabenAus.includes(f.erster.toLocaleUpperCase("de-AT"))
  )
    return no(
      `Mit dem Anfangsbuchstaben ${f.erster.toLocaleUpperCase("de-AT")} trägt diese Vorlage nicht.`,
    );
  if (
    p.initialenAkzent === false &&
    /[^A-Z]/.test(f.initialen + f.erster.toLocaleUpperCase("de-AT"))
  )
    return no("Initialen mit Akzent kollidieren in diesem Zeichen.");
  if (p.profile.ort === "pflicht" && !f.ort)
    return no("Vorlage braucht einen Ort oder Bezirk.");
  if (p.profile.zusatz === "pflicht" && !f.zusatz)
    return no("Vorlage braucht einen Zusatz (z.B. Immobilien).");
  if (p.laengen && !p.laengen.includes(letters))
    return no(
      `Vorlage braucht einen Namen mit ${p.laengen.join(", ").replace(/, (\d+)$/, " oder $1")} Buchstaben.`,
    );
  if (p.laengenAus?.includes(letters))
    return no(
      `Namen mit ${letters} Buchstaben sind für diese Vorlage gesperrt (Abstand zu einer Referenzmarke).`,
    );
  if (p.umlaut && !/[ÄÖÜäöü]/.test(splitTitles(name).words.join(" ")))
    return no("Vorlage braucht einen Umlaut im Namen (Ä, Ö, Ü).");
  if (
    p.enthaelt &&
    !Array.from(
      splitTitles(name).words.join("").toLocaleUpperCase("de-AT"),
    ).some((c) => p.enthaelt!.includes(c))
  )
    return no(
      `Vorlage braucht einen dieser Buchstaben im Namen: ${Array.from(p.enthaelt).join(", ")}.`,
    );
  if (p.kennbuchstaben) {
    const k = f.kennbuchstabe;
    if (KENN_GESPERRT.includes(k))
      return no(
        `Mit dem Buchstaben ${k} ist diese Vorlage gesperrt (Nähe zu bekannten Monogrammen).`,
      );
    if (!k || !p.kennbuchstaben.includes(k))
      return no(
        `Mit dem Buchstaben ${k || "?"} trägt diese Vorlage nicht (nur ${Array.from(p.kennbuchstaben).join(", ")}).`,
      );
  }
  if (p.partner && !f.partner2)
    return no("Vorlage braucht zwei Partner im Namen (A & B).");
  if (p.partnerArten) {
    const pn = partnerName(name);
    if (!pn || !p.partnerArten.includes(pn.art))
      return no(
        `Vorlage braucht einen Namen mit ${p.partnerArten
          .map((a) => `"${PARTNER_LABEL[a]}"`)
          .join(", ")
          .replace(/, ([^,]+)$/, " oder $1")}.`,
      );
  }
  if (p.fuge) {
    const nt = nameParts(input, true);
    const end = Array.from(nt.teil1).pop()?.toLocaleUpperCase("de-AT") ?? "";
    const start = Array.from(nt.teil2)[0]?.toLocaleUpperCase("de-AT") ?? "";
    if (FUGE_GESPERRT.includes(end + start))
      return no(
        `Das Buchstabenpaar ${end}-${start} ist gesperrt (Nähe zu einer bekannten Marke).`,
      );
    if (
      !end ||
      !start ||
      !p.fuge.enden.includes(end) ||
      !p.fuge.anfaenge.includes(start)
    )
      return no(
        "Die Wortbrücke braucht am Wortübergang zwei senkrechte Stämme (z.B. N und H).",
      );
  }
  for (const [feld, werte] of Object.entries(p.werteAus ?? {}))
    if (werte!.includes(f[feld as keyof NameParts]))
      return no(
        `Der Wert ${f[feld as keyof NameParts]} ist für diese Vorlage gesperrt (Nähe zu einer bekannten Marke).`,
      );
  for (const e of t.elemente) {
    if (
      e.typ !== "text" ||
      !e.pflicht ||
      e.wennFehlt ||
      (e.wenn && !f[e.wenn]) ||
      (e.wennNicht && f[e.wennNicht])
    )
      continue;
    if (
      !(
        e.ohneTitel || e.feld === "erster" || e.feld === "rest"
          ? nameParts(input, true)
          : f
      )[e.feld]
    )
      return no(FELD_GRUND[e.feld] ?? `Platzhalter {${e.feld}} ist leer.`);
  }
  if (
    (opts.stil ?? input.styles.length > 0) &&
    input.styles.length &&
    !input.styles.some((s) => p.stile.includes(s))
  )
    return no("Stil passt nicht zur Vorlage.");
  const refs = templateFonts(t, input, opts.params);
  if (
    !fontCovers(refs.haupt.key, f.name) ||
    !fontCovers(refs.neben.key, f.zusatz, f.ort)
  )
    return no(
      "Ein Zeichen im Namen kann keine erlaubte Schrift dieser Vorlage darstellen.",
    );
  if (fonts) {
    if (templateFontRefs(t, input, opts.params).every((r) => fonts.has(r))) {
      const l = layoutSignature(t, input, fonts, opts.params);
      if (l.problems.length) return no(l.problems[0]!);
      const zusatz = t.elemente.filter(
        (e) =>
          e.typ === "text" &&
          ZUSATZ_FELDER.includes(e.feld) &&
          !e.nurMessen &&
          !(e.wenn && !f[e.wenn]) &&
          !(e.wennNicht && f[e.wennNicht]) &&
          !!f[e.feld],
      ) as TextElement[];
      if (
        zusatz.length &&
        !zusatz.some((e) => l.boxes.some((b) => b.id === (e.id ?? e.feld)))
      )
        return no("Der Zusatz passt bei diesem Namen nicht in die Vorlage.");
      if (p.nameZuInitial) {
        const nameBox = l.boxes.find((b) => b.id === "name")?.box;
        const marks = l.ops
          .filter((o) => o.zeichen && o.box)
          .map((o) => o.box!);
        const markW = marks.length
          ? Math.max(...marks.map((b) => b.x + b.w)) -
            Math.min(...marks.map((b) => b.x))
          : 0;
        if (nameBox && markW > 0 && nameBox.w / markW > p.nameZuInitial)
          return no(
            "Der Name ist für die große Initiale zu lang (sie würde wie durchgestrichen wirken).",
          );
      }
      return { passt: true, grund: "Passt." };
    }
    return {
      passt: true,
      grund:
        "Passt nach Regeln (Schriften noch nicht geladen, Einpassung ungeprüft).",
    };
  }
  return { passt: true, grund: "Passt nach Regeln (Einpassung ungeprüft)." };
}

/** Ähnlichkeitssperre: gleicher Name und gleiche Merkmale wie eine Korpusmarke (`Al`, aus der Logo-Engine). */
export { corpusTwinName };
