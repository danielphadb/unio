/**
 * Route (Markenkompass) auf die Generierung anwenden: `routeOf`, `routedInput`, Sperren fuer Farben,
 * Themen, Schriftformen, Rahmen und Vorlagen (`templateBlocked`, `templateInRoute`), Achsen-Merkmale
 * und die Leit-Merkmale (`LEIT_KLASSE`, `leitMerkmale`, `leitAbstand`) (engine `se` ... `Gr`).
 */
import type {
  BrandInput,
  ColorMoodKey,
  FontRef,
  LogoConcept,
  Palette,
} from "../types";
import type { LeitMerkmale } from "./logoTypes";
import type { RouteParams } from "../strategy/types";
import { contrast } from "./color";
import { fontForm } from "./tracking";
import { getFont } from "./fonts";
import { moodOfPaletteId, paletteBaseId } from "./palettes";
import { splitVariantId } from "../signature/varianten";

export function routeOf(input: any): RouteParams | undefined {
  const n = input?.route;
  return n && typeof n == "object" ? n : undefined;
}

const ALL_MOODS = [
  "gold",
  "navy",
  "gruen",
  "terra",
  "schwarz",
  "blau",
  "bordeaux",
  "sand",
];

export function routedInput(input: BrandInput) {
  const n = routeOf(input);
  if (!n) return input;
  const t = new Set(n.avoidColorMoods ?? []);
  const r = new Set(n.avoidThemes ?? []);
  const i = input.styles.length ? input.styles : (n.styles ?? []).slice(0, 2);
  const a = input.colorMoods.length ? input.colorMoods : (n.colorMoods ?? []);
  const s = input.themes.length ? input.themes : (n.themes ?? []);
  return {
    ...input,
    styles: i,
    colorMoods: a.filter((o) => !t.has(o)),
    themes: s.filter((o) => !r.has(o)),
  };
}

export function allowedMoods(
  moods: string[],
  input: BrandInput,
): ColorMoodKey[] {
  const t = routeOf(input);
  if (!t?.avoidColorMoods?.length) return moods as ColorMoodKey[];
  const avoid: readonly string[] = t.avoidColorMoods;
  const r = moods.filter((a) => !avoid.includes(a));
  return (
    r.length ? r : ALL_MOODS.filter((a) => !avoid.includes(a))
  ) as ColorMoodKey[];
}

export function paletteBlocked(palette: Palette, input: BrandInput) {
  const t = routeOf(input);
  if (!t) return false;
  const r = paletteBaseId(palette);
  if (t.avoidPaletteIds?.some((o) => o === r || o === palette.id.split("-")[0]))
    return true;
  if (!t.avoidColorMoods?.length) return false;
  const i = moodOfPaletteId(r);
  return !!i && t.avoidColorMoods.includes(i);
}

export function themesBlocked(themes: readonly string[], input: BrandInput) {
  const t = routeOf(input);
  return (
    !!t?.avoidThemes?.length &&
    themes.some((i) => (t.avoidThemes as readonly string[]).includes(i))
  );
}

export function fontBlocked(font: any, input: BrandInput) {
  const t = routeOf(input);
  if (!t?.avoidFontForms?.length) return false;
  const r = getFont(typeof font == "string" ? font : font.key);
  return !!r.form && t.avoidFontForms.includes(r.form);
}

const SEAL_CONTAINERS = ["circle", "ring"];

export function containerBlocked(container: string, input: BrandInput) {
  const t = routeOf(input);
  return t
    ? container === "arch" &&
      t.avoidThemes?.some((a) => a === "haus" || a === "tuer" || a === "dach")
      ? true
      : t.avoidContainers?.length
        ? container === "seal"
          ? t.avoidContainers.some((a) => SEAL_CONTAINERS.includes(a))
          : (t.avoidContainers as readonly string[]).includes(container)
        : false
    : false;
}

export const templateBaseId = (id: string) => splitVariantId(id)[0];

export function templateInRoute(template: any, input: BrandInput) {
  const t = routeOf(input)?.signatureIds;
  return t
    ? t.includes(templateBaseId(template.id)) ||
        (!!template.variante && t.includes(template.variante.basis))
    : true;
}

const THEME_SIGNS = {
  natur: ["hoehenlinien", "spiegelung", "parzelle"],
  stadt: ["grundriss", "planachse"],
  tuer: ["bogen", "fenster"],
  haus: ["bogen", "fenster"],
};

export function templateBlocked(template: any, input: BrandInput) {
  const t = routeOf(input);
  if (!t) return false;
  if (
    t.avoidSignatureIds?.includes(templateBaseId(template.id)) ||
    t.avoidSignatureIds?.includes(template.id) ||
    (t.avoidContainers?.some((u) => SEAL_CONTAINERS.includes(u)) &&
      (/kreis|siegel/.test(template.id) ||
        template.merkmale.zeichen === "siegel" ||
        template.elemente.some((u: any) => u.typ === "kreis" && u.zeichen) ||
        template.elemente.some(
          (u: any) =>
            u.typ === "bogen" && u.zeichen && Math.abs(u.bis - u.von) >= 300,
        ))) ||
    t.avoidThemes?.some((u) =>
      ((THEME_SIGNS as Record<string, any>)[u] ?? []).includes(
        template.merkmale.zeichen ?? "",
      ),
    ) ||
    (t.avoidThemes?.some((u) => u === "haus" || u === "tuer" || u === "dach") &&
      /serliana|luenette|fensterpunkt|schlussstein|hausnummer/.test(
        template.id,
      ))
  )
    return true;
  if (t.avoidFontForms?.length) {
    const u = new Set(
      template.elemente.flatMap((m: any) =>
        m.typ === "text" ? [m.schrift] : [],
      ),
    );
    for (const m of u) {
      if (
        !(
          m === "akzent"
            ? (template.schriften.akzent ?? template.schriften.haupt)
            : template.schriften[m as string]
        ).some((p: any) => !fontBlocked(p, input))
      )
        return true;
    }
    if (
      t.avoidFontForms.includes("script") &&
      template.merkmale.schrift === "script"
    )
      return true;
  }
  return false;
}

const clampAxis = (value: number, min: number = -1, max: number = 1) =>
  Math.max(min, Math.min(max, value));

export function fontAxes(font: FontRef) {
  const n = getFont(font.key);
  const t =
    n.form ??
    (n.cat === "serif" ? "antiqua" : n.cat === "script" ? "script" : "grotesk");
  const r = n.tags ?? [];
  const i =
    n.cat === "serif"
      ? t === "slab"
        ? 0.5
        : t === "mono"
          ? 0.2
          : 1
      : n.cat === "script"
        ? 0
        : -1;
  const a =
    t === "didone"
      ? 1
      : t === "antiqua"
        ? r.includes("kontrastreich")
          ? 0.8
          : 0.1
        : t === "script"
          ? 0.3
          : t === "slab"
            ? -0.6
            : -1;
  const s =
    t === "condensed"
      ? -1
      : t === "extended"
        ? 1
        : r.includes("schmal")
          ? -0.6
          : r.includes("breit")
            ? 0.6
            : 0;
  const o = font.weight;
  const l = clampAxis(
    (o <= 300 ? -0.8 : o <= 400 ? -0.3 : o <= 500 ? 0 : o <= 600 ? 0.4 : 0.8) +
      (r.includes("kräftig") ? 0.3 : 0) -
      (r.includes("fein") ? 0.2 : 0),
  );
  return {
    serif: i,
    contrast: a,
    width: s,
    weight: l,
  };
}

function hexToHslTriple(hex: string) {
  const n = hex
    .replace("#", "")
    .match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!n) return [0, 0, 0];
  const [t, r, i] = [n[1], n[2], n[3]].map((h) => parseInt(h!, 16) / 255);
  const a = Math.max(t!, r!, i!);
  const s = Math.min(t!, r!, i!);
  const o = (a + s) / 2;
  if (a === s) return [0, 0, o];
  const l = a - s;
  const u = l / (1 - Math.abs(2 * o - 1));
  return [
    a === t
      ? ((r! - i!) / l + (r! < i! ? 6 : 0)) * 60
      : a === r
        ? ((i! - t!) / l + 2) * 60
        : ((t! - r!) / l + 4) * 60,
    u,
    o,
  ];
}

export function paletteAxes(palette: Palette) {
  const [n, t] = hexToHslTriple(palette.primary);
  const r = clampAxis(t! / 0.25, 0, 1);
  const i = clampAxis(Math.cos(((n! - 35) * Math.PI) / 180) * r);
  const a = clampAxis((t! - 0.35) / 0.3);
  return {
    warmth: i,
    saturation: a,
  };
}

const trackingAxis = (tracking: number) =>
  tracking >= 0.12
    ? 1
    : tracking >= 0.05
      ? 0.3
      : tracking <= -0.005
        ? -1
        : -0.4;

function conceptAxes(concept: LogoConcept) {
  const n =
    concept.name.case === "upper" ||
    concept.nameFormat === "upper" ||
    getFont(concept.name.font.key).capsOnly
      ? 1
      : -1;
  const t =
    concept.layout !== "wordmark" && concept.symbol
      ? 1
      : concept.typo?.letterSwap || concept.typo?.mark
        ? 0
        : -1;
  const r = (concept.cardBackground ?? "paper") === "paper" ? -1 : 1;
  return {
    ...fontAxes(concept.name.font),
    caps: n,
    tracking: trackingAxis(concept.name.tracking),
    symbol: t,
    dark: r,
    ...paletteAxes(concept.palette),
  };
}

export function templateAxes(template: any) {
  const n = template.schriften.haupt[0];
  const t = n ? fontAxes(n) : {};
  const r = template.elemente.find(
    (a: any) => a.typ === "text" && a.schrift === "haupt",
  );
  const i = r && r.typ === "text" ? r.laufweite : 0;
  return {
    ...t,
    serif:
      template.merkmale.schrift === "serif"
        ? 1
        : template.merkmale.schrift === "sans"
          ? -1
          : 0,
    caps: template.merkmale.schreibung === "upper" ? 1 : -1,
    tracking: trackingAxis(i),
    symbol:
      template.merkmale.zeichen &&
      /monogramm|initial|grundriss|hoehenlinien|parzelle|siegel|flaeche|raster|spiegel|fenster|bogen|muster|kuerzel/.test(
        template.merkmale.zeichen,
      )
        ? 1
        : template.merkmale.zeichen
          ? 0
          : -1,
    dark: template.farben.karte && template.farben.karte !== "paper" ? 1 : -1,
  };
}

export function axisFit(axes: any, values: any, keys?: any): number {
  if (!axes) return 0;
  let r = 0;
  let i = 0;
  for (const a of Object.keys(axes)) {
    const s = axes[a];
    const o = values[a];
    if (
      !(!s || !(s.sicher > 0) || o === undefined || (keys && !keys.includes(a)))
    ) {
      r += s.sicher * (1 - Math.abs(s.v - o));
      i += s.sicher;
    }
  }
  return i > 0 ? r / i : 0;
}

export function routeFit(
  concept: LogoConcept,
  input: BrandInput,
  templateAxesOf?: any,
) {
  const r = routeOf(input);
  if (!r) return 0;
  const i = concept.signature
    ? {
        ...(templateAxesOf?.(concept.signature.id) ?? {}),
        ...paletteAxes(concept.palette),
        dark: (concept.cardBackground ?? "paper") === "paper" ? -1 : 1,
      }
    : conceptAxes(concept);
  return axisFit(r.axes, i);
}

export function kindMixOf(input: any) {
  const n = routeOf(input);
  if (!n?.kindMix) return null;
  const t = n.kindMix;
  const r =
    Math.max(0, t.wortmarke) +
    Math.max(0, t.monogramm) +
    Math.max(0, t.zeichen) +
    Math.max(0, t.vorlage);
  return r > 0
    ? {
        wortmarke: Math.max(0, t.wortmarke) / r,
        monogramm: Math.max(0, t.monogramm) / r,
        zeichen: Math.max(0, t.zeichen) / r,
        vorlage: Math.max(0, t.vorlage) / r,
      }
    : null;
}

export function splitByShares(total: number, shares: number[]) {
  const t = shares.reduce((o, l) => o + l, 0) || 1;
  const r = shares.map((o) => (total * o) / t);
  const i = r.map(Math.floor);
  let a = total - i.reduce((o, l) => o + l, 0);
  const s = r
    .map((o, l) => ({
      i: l,
      f: o - Math.floor(o),
    }))
    .sort((o, l) => l.f - o.f || o.i - l.i);
  for (const { i: o } of s) {
    if (a <= 0) break;
    i[o]!++;
    a--;
  }
  return i;
}

export const LEIT_KLASSE = {
  antiqua: "antiqua",
  didone: "didone",
  grotesk: "grotesk",
  geometric: "grotesk",
  condensed: "breitschmal",
  extended: "breitschmal",
  slab: "slab",
  mono: "slab",
  stencil: "slab",
  script: "script",
};

const MOOD_FAMILY = {
  gold: "warm",
  terra: "warm",
  sand: "warm",
  bordeaux: "warm",
  navy: "kuehl",
  blau: "kuehl",
  gruen: "gruen",
  schwarz: "neutral",
};

const klasseOf = (concept: LogoConcept) =>
  LEIT_KLASSE[fontForm(concept.name.font.key)];

const familieOf = (concept: LogoConcept) =>
  (MOOD_FAMILY as Record<string, string>)[
    moodOfPaletteId(paletteBaseId(concept.palette)) ?? ""
  ] ?? "neutral";

const artOf = (concept: LogoConcept) =>
  concept.signature
    ? "vorlage"
    : concept.layout !== "wordmark" && concept.symbol
      ? "zeichen"
      : "wortmarke";

export function leitMerkmale(input: any): LeitMerkmale {
  const n = routeOf(input);
  if (!n) return {};
  const t: LeitMerkmale = {};
  if (n.fontForms?.[0]) {
    t.klasse = LEIT_KLASSE[n.fontForms[0]];
  }
  if (n.colorMoods?.[0]) {
    t.familie = MOOD_FAMILY[n.colorMoods[0]];
  }
  const r = kindMixOf(input);
  if (r) {
    const s = r.monogramm + r.zeichen;
    t.art =
      r.vorlage > r.wortmarke && r.vorlage > s
        ? "vorlage"
        : s > r.wortmarke && s > r.vorlage
          ? "zeichen"
          : "wortmarke";
  }
  return t;
}

export function leitAbstand(concepts: LogoConcept[], leit: any) {
  const t = (r: any, i: any) => {
    if (!r) return 0;
    const a = new Map();
    for (const l of concepts) a.set(i(l), (a.get(i(l)) ?? 0) + 1);
    const s = a.get(r) ?? 0;
    const o = Math.max(
      0,
      ...[...a.entries()].filter(([l]) => l !== r).map(([, l]) => l),
    );
    return Math.max(0, o - s + 1);
  };
  return (
    t(leit.klasse, klasseOf) + t(leit.familie, familieOf) + t(leit.art, artOf)
  );
}
