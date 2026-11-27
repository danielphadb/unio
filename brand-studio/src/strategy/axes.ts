/**
 * Achsen aus dem Brief (kompass-Chunk: `T`, `x`, `we`, `pe`, `ve`, `on`, `Pe`, `ie`, `Ke`, `Me`, `Qn`).
 *
 * Die Antworten ergeben 10 Gestaltungsachsen zwischen -1 und 1, jede mit einer Sicherheit
 * von 0 bis 1 (docs/18, Abschnitt 6). Gewichte: Logo- und Farbpaar 1, Referenzwelt 0,6,
 * Stimme 0,5, Segment 0,3. "Egal" laesst eine Achse bewusst offen (Sicherheit 0).
 *
 * Daten: axes.json (W1 aus dem Bundle gezogen). Rundung und Reihenfolge der Summen sind
 * bitgenau wie in der gesicherten Fassung, die Routen haengen daran.
 */
import data from "./axes.json";
import { hash } from "../engine/rng";
import { TERRITORIES } from "./territories";
import { resolveRouteParams, territoryFit } from "./params";
import { AXIS_KEYS } from "./types";
import type { AxisKey, AxisVector, BrandBrief, RouteParams } from "./types";

type AxisWeights = Partial<Record<AxisKey, number>>;

/** Die 10 Achsen in fester Reihenfolge (`T`). */
export { AXIS_KEYS };

/** Gewicht je Quelle (`x`). */
export const AXIS_WEIGHTS = data.gewichte as {
  logoPaar: number;
  farbPaar: number;
  referenz: number;
  stimme: number;
  segment: number;
};

/** Achsen je Referenzwelt (`we`). */
const REFERENZ_ACHSEN = data.referenzen as Record<string, AxisWeights>;
/** Achsen je Stimmpol, Vorzeichen aus der Antwort (`pe`). */
const STIMM_ACHSEN = data.stimme as Record<string, AxisWeights>;
/** Achsen je Preisband (`ve`). */
const SEGMENT_ACHSEN = data.segment as Record<string, AxisWeights>;
/** Achsen je Logo-Paar; Versalien ziehen die Laufweite mit (`on`). */
const LOGO_PAAR_ACHSEN: Record<string, AxisWeights> = {
  serif: { serif: 1 },
  contrast: { contrast: 1 },
  caps: { caps: 1, tracking: 0.8 },
  width: { width: 1 },
  symbol: { symbol: 1 },
  dark: { dark: 1 },
};

const clamp = (v: number, min = -1, max = 1): number => Math.max(min, Math.min(max, v));
const round3 = (v: number): number => Math.round(v * 1e3) / 1e3;

/** Achsen aus den Antworten (`Pe`). Achsen ohne jede Angabe fehlen im Ergebnis. */
export function briefToAxes(brief: BrandBrief): AxisVector {
  const beitraege = Object.fromEntries(AXIS_KEYS.map((k) => [k, [] as { w: number; v: number }[]])) as Record<
    AxisKey,
    { w: number; v: number }[]
  >;
  const offen = new Set<string>();
  const add = (werte: AxisWeights, gewicht: number, vorzeichen = 1): void => {
    for (const [k, v] of Object.entries(werte))
      if (v) beitraege[k as AxisKey].push({ w: gewicht, v: v * vorzeichen });
  };

  for (const [paar, wahl] of Object.entries(brief.logoPairs ?? {})) {
    const achsen = LOGO_PAAR_ACHSEN[paar];
    if (!achsen) continue;
    if (wahl === "egal") for (const k of Object.keys(achsen)) offen.add(k);
    else if (wahl === "a" || wahl === "b") add(achsen, AXIS_WEIGHTS.logoPaar, wahl === "a" ? -1 : 1);
  }
  for (const [paar, wahl] of Object.entries(brief.colorPairs ?? {})) {
    if (paar !== "warmth" && paar !== "saturation") continue;
    if (wahl === "egal") offen.add(paar);
    else if (wahl === "a" || wahl === "b") add({ [paar]: 1 }, AXIS_WEIGHTS.farbPaar, wahl === "a" ? -1 : 1);
  }
  const referenz = brief.reference ? REFERENZ_ACHSEN[brief.reference] : undefined;
  if (referenz) add(referenz, AXIS_WEIGHTS.referenz);
  for (const [pol, wert] of Object.entries(brief.voice ?? {})) {
    const achsen = STIMM_ACHSEN[pol];
    if (wert && achsen) add(achsen, AXIS_WEIGHTS.stimme, wert);
  }
  const segment = brief.segment ? SEGMENT_ACHSEN[brief.segment] : undefined;
  if (segment) add(segment, AXIS_WEIGHTS.segment);

  const out: AxisVector = {};
  for (const k of AXIS_KEYS) {
    const liste = beitraege[k];
    if (!liste.length) {
      if (offen.has(k)) out[k] = { v: 0, sicher: 0 };
      continue;
    }
    const summeW = liste.reduce((s, b) => s + b.w, 0);
    const summeWv = liste.reduce((s, b) => s + b.w * b.v, 0);
    const summeAbs = liste.reduce((s, b) => s + b.w * Math.abs(b.v), 0);
    const v = clamp(summeWv / summeW);
    // Einigkeit der Quellen: 1, wenn alle in dieselbe Richtung zeigen
    const einig = summeAbs > 0 ? Math.abs(summeWv) / summeAbs : 0;
    const sicher = offen.has(k) ? 0 : clamp(Math.min(1, summeAbs) * einig, 0, 1);
    out[k] = { v: round3(v), sicher: round3(sicher) };
  }
  return out;
}

/** Schluessel unabhaengig von der Reihenfolge der Felder; `undefined` faellt weg (`ie`). */
export function stableKey(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableKey).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj)
      .sort()
      .filter((k) => obj[k] !== undefined)
      .map((k) => `${k}:${stableKey(obj[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

/** Seed aus Name und Antworten: gleiche Antworten ergeben gleiche Routen (`Ke`). */
export function briefSeed(brief: BrandBrief): number {
  return hash(stableKey(brief));
}

/** Mittlerer Abstand zweier Achsensaetze, 0 (gleich) bis 1 (`Me`). */
export function axisDistance(a: AxisWeights, b: AxisWeights): number {
  return AXIS_KEYS.reduce((s, k) => s + Math.abs((a[k] ?? 0) - (b[k] ?? 0)) / 2, 0) / AXIS_KEYS.length;
}

/**
 * Vorschau im Kompass (`Qn`): Parameter des am besten passenden Territoriums mit voller
 * Gewichtung der Antworten. Ohne erlaubtes Territorium greift das beste ohne "Nicht ich".
 */
export function briefPreviewParams(brief: BrandBrief): RouteParams | null {
  const axes = briefToAxes(brief);
  const seed = briefSeed(brief);
  const ctx = { brief, axes, seed };
  const opts = { alpha: 1, mutiger: 0, seed, offenSeed: seed };
  const sortiert = TERRITORIES.map((t) => ({ t, fit: territoryFit(t, ctx) })).sort((a, b) => b.fit - a.fit);
  for (const { t } of sortiert) {
    const params = resolveRouteParams(t, brief, axes, opts);
    if (params) return params;
  }
  const erstes = sortiert[0];
  return erstes
    ? resolveRouteParams(erstes.t, { ...brief, avoidColors: [], avoidCliches: [] }, axes, opts)
    : null;
}
