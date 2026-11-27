/**
 * Laufweite (Tracking) je Schriftform: erlaubte Bereiche, Einrasten auf Stufen, Laufweite
 * des Zusatzes und die Stufen fuer den Editor (engine-Chunk: `zi` ... `mn`, `ui`, `Et`, `zc`, `Em`).
 */
import type { FontRef } from "../types";
import { getFont } from "./fonts";

export const TRACKING_STEPS = Array.from(
  {
    length: 11,
  },
  (e, n) => Math.round((-0.04 + n * 0.03) * 100) / 100,
);

export const SUFFIX_CAPS_TRACKING = [0.1, 0.3];

export const SUFFIX_SCALE_STEPS = [0.3, 0.4, 0.55, 0.75];

export const SUFFIX_SCALE_MIN = 0.3;

const SUFFIX_SCALE_MAX = 0.75;

export const LARGE_SUFFIX_SCALE = 0.55;

export function clampSuffixScale(value: unknown) {
  const n = Number(value);
  if (!(value == null || !Number.isFinite(n)))
    return (
      Math.round(
        Math.min(SUFFIX_SCALE_MAX, Math.max(SUFFIX_SCALE_MIN, n)) * 100,
      ) / 100
    );
}

export const STACK_SYMBOL = {
  min: 2.3,
  typ: 3,
  gap: 0.7,
};

export const INLINE_GAPS = {
  gap: 0.32,
  lineGap: 0.3,
  textGap: 0.62,
};

const TRACKING_TOLERANCE = 0.006;

export function fontForm(key: string) {
  const n = getFont(key);
  return n.form
    ? n.form
    : n.cat === "serif"
      ? "antiqua"
      : n.cat === "script"
        ? "script"
        : n.cat === "display"
          ? "condensed"
          : "grotesk";
}

function isLightWeight(font: FontRef) {
  const n = getFont(font.key);
  return (
    font.weight <= 300 ||
    (n.cat === "sans" &&
      !!n.tags?.includes("fein") &&
      font.weight <= Math.min(...n.weights) &&
      font.weight <= 400)
  );
}

export function isCaps(font: FontRef, kase?: string) {
  return kase === "upper" || !!getFont(font.key).capsOnly;
}

export function trackingRanges(
  font: FontRef,
  kase: string | undefined,
  wide: boolean = false,
) {
  const r = baseTrackingRanges(font, kase);
  if (!isCaps(font, kase)) return r;
  const i = fontForm(font.key);
  const a =
    getFont(font.key).tags?.includes("schmal") && i !== "condensed"
      ? 0.01
      : i === "didone"
        ? -0.01
        : -0.03;
  const s = wide ? 0.26 : 0.2;
  const o = r
    .map(([u, m]) => [Math.max(u!, a), m! >= 0.2 ? s : Math.min(m!, s)])
    .filter(([u, m]) => u! <= m!);
  return o.length ? o : [[a, Math.max(a, 0.02)]];
}

function baseTrackingRanges(font: FontRef, kase?: string) {
  const t = fontForm(font.key);
  if (t === "script") return [[-0.02, 0.03]];
  if (kase === "lower" && !getFont(font.key).capsOnly) return [[-0.04, 0.01]];
  if (!isCaps(font, kase))
    return font.weight >= 600 && t !== "didone" && t !== "antiqua"
      ? [[-0.04, 0.02]]
      : [[-0.02, 0.02]];
  const r = isLightWeight(font);
  const i = font.weight >= 700;
  switch (t) {
    case "didone":
      return r
        ? [
            [-0.03, 0.03],
            [0.14, 0.2],
          ]
        : getFont(font.key).tags?.includes("kräftig")
          ? [
              [-0.04, 0.03],
              [0.08, 0.14],
            ]
          : [[-0.04, 0.03]];
    case "antiqua":
      return r
        ? [[0.14, 0.2]]
        : [
            [-0.03, 0.03],
            [0.06, 0.2],
          ];
    case "geometric":
      return r
        ? [[0.14, 0.22]]
        : i
          ? [
              [-0.07, 0],
              [0.09, 0.22],
            ]
          : [[0.09, 0.22]];
    case "condensed":
      return i
        ? [[-0.05, 0.04]]
        : [
            [-0.05, 0.04],
            [0.08, 0.14],
          ];
    case "mono":
      return [[-0.04, 0.06]];
    case "slab":
      return i
        ? [
            [-0.03, 0.03],
            [0.08, 0.14],
          ]
        : [
            [-0.02, 0.04],
            [0.08, 0.18],
          ];
    case "stencil":
      return [[-0.02, 0.06]];
    case "extended":
      return r ? [[0, 0.04]] : [[-0.02, 0.03]];
    default:
      return r
        ? [[0.14, 0.22]]
        : i
          ? [
              [-0.07, 0],
              [0.15, 0.18],
            ]
          : [
              [-0.03, 0.03],
              [0.09, 0.22],
            ];
  }
}

const inTrackingRanges = (value: number, ranges: number[][]) =>
  ranges.some(
    ([t, r]) =>
      value >= t! - TRACKING_TOLERANCE && value <= r! + TRACKING_TOLERANCE,
  );

export function defaultTracking(font: FontRef, kase?: string) {
  const t = fontForm(font.key);
  if (!isCaps(font, kase))
    return font.weight >= 600 && t !== "didone" && t !== "antiqua" ? -0.01 : 0;
  const r = trackingRanges(font, kase);
  if (t === "didone") return -0.01;
  if (t === "antiqua") return isLightWeight(font) ? 0.17 : 0.11;
  if (t === "condensed" || t === "mono" || t === "stencil" || t === "extended")
    return 0.02;
  if (t === "slab") return 0.1;
  const i = r[r.length - 1];
  return Math.min(i![1]!, Math.max(i![0]!, 0.15));
}

export function snapTracking(
  font: FontRef,
  kase: string | undefined,
  value: unknown,
  steps: readonly number[] | null = TRACKING_STEPS,
  wide: boolean = false,
): number {
  const a = Number.isFinite(Number(value)) ? Number(value) : 0;
  const s = trackingRanges(font, kase, wide);
  if (steps) {
    const l = steps.filter((u) => inTrackingRanges(u, s));
    if (l.length)
      return l.reduce(
        (u, m) => (Math.abs(m - a) < Math.abs(u - a) ? m : u),
        l[0]!,
      );
  }
  if (inTrackingRanges(a, s)) return a;
  let o = s[0]![0];
  for (const [l, u] of s) {
    for (const m of [l, u]) {
      if (Math.abs(m! - a) < Math.abs(o! - a)) {
        o = m;
      }
    }
  }
  return o!;
}

export function suffixTracking(
  kase: string | undefined,
  value: unknown,
  font?: FontRef,
  scale?: number,
): number {
  const i = Number.isFinite(Number(value)) ? Number(value) : 0;
  const a = kase === "upper" || (font && getFont(font.key).capsOnly);
  return a && (scale ?? 0) >= LARGE_SUFFIX_SCALE
    ? Math.min(0.2, Math.max(0.04, i))
    : a
      ? Math.min(
          SUFFIX_CAPS_TRACKING[1]!,
          Math.max(SUFFIX_CAPS_TRACKING[0]!, i),
        )
      : Math.min(0.02, Math.max(-0.02, i));
}

export const EDITOR_TRACKING_STEPS = TRACKING_STEPS;

export const TRACKING_LEVELS = {
  eng: -0.02,
  normal: 0,
  weit: 0.06,
  sehrWeit: 0.14,
};

export function nearestTrackingStep(value: unknown) {
  const n = Number.isFinite(Number(value)) ? Number(value) : 0;
  return EDITOR_TRACKING_STEPS.reduce(
    (t, r) => (Math.abs(r - n) < Math.abs(t! - n) ? r : t),
    EDITOR_TRACKING_STEPS[0],
  );
}

export function trackingStepIndex(value: unknown) {
  return EDITOR_TRACKING_STEPS.indexOf(nearestTrackingStep(value)!);
}
