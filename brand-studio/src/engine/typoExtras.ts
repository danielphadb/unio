/**
 * Typografische Details: Bezirkszahl, Stern, Grad, Klammer und Trenner (`applyTypoExtras`), Varianten
 * der Namenssetzung (Gewicht, Kursiv, Mix, Stapel, Punkt, Haarlinie, Buchstabentausch ...), deren Auswahl
 * und die Optionen im Editor (engine `Du` ... `Wu`, `kc` ... `Am`).
 */
import type { LogoConcept } from "../types";
import type { Rng } from "./rng";
import type { TypoOption, LogoInput } from "./logoTypes";
import { CONTAINERS } from "../symbols/containers";
import { HIGH_END_STYLES } from "./highend";
import {
  TRACKING_LEVELS,
  defaultTracking,
  fontForm,
  snapTracking,
} from "./tracking";
import { applyCase } from "./text";
import { cleanText } from "./cleanText";
import { contrast, sanitizePalette } from "./color";
import { fontCovers } from "./charset";
import { getFont, hasSerifItalic, italicVariant } from "./fonts";
import { isShortBrandName } from "./generator";
import { randomIn, round3, weightedPick, withId } from "./catalog";
import { splitLabels } from "./renderLogo";
import { splitSyllables } from "../signature/nameParts";

const DISTRICTS = [
  ["innere stadt", 1],
  ["leopoldstadt", 2],
  ["landstraße", 3],
  ["landstrasse", 3],
  ["wieden", 4],
  ["margareten", 5],
  ["mariahilf", 6],
  ["neubau", 7],
  ["josefstadt", 8],
  ["alsergrund", 9],
  ["favoriten", 10],
  ["simmering", 11],
  ["meidling", 12],
  ["hietzing", 13],
  ["penzing", 14],
  ["rudolfsheim-fünfhaus", 15],
  ["rudolfsheim", 15],
  ["fünfhaus", 15],
  ["ottakring", 16],
  ["hernals", 17],
  ["währing", 18],
  ["döbling", 19],
  ["brigittenau", 20],
  ["floridsdorf", 21],
  ["donaustadt", 22],
  ["liesing", 23],
];

function districtNumber(place: string | undefined) {
  const n = cleanText(place).toLocaleLowerCase("de-AT");
  if (!n) return null;
  const t = n.match(/\b1(\d{2})0\b/);
  if (t && +t[1]! >= 1 && +t[1]! <= 23) return +t[1]!;
  const r =
    n.match(/\b(\d{1,2})\.\s*bezirk\b/) ?? n.match(/\bwien\s*(\d{1,2})\b/);
  if (r && +r[1]! >= 1 && +r[1]! <= 23) return +r[1]!;
  for (const [i, a] of DISTRICTS) {
    if (n.includes(i as string)) return a;
  }
  return null;
}

function supText(art: string, input: LogoInput) {
  if (art === "stern") return "*";
  if (art === "grad") return "°";
  const t = districtNumber(input.place);
  return t === null ? null : String(t);
}

export function typoExtrasFit(extras: any, input: LogoInput) {
  return extras
    ? !(
        (extras.sup && supText(extras.sup, input) === null) ||
        ((extras.fussnote || extras.klammer || extras.trenner) &&
          !cleanText(input.suffix)) ||
        (extras.trenner &&
          cleanText(input.name).length + cleanText(input.suffix).length > 18)
      )
    : true;
}

export function applyTypoExtras(
  concept: LogoConcept,
  extras: any,
  input: LogoInput,
) {
  if (!extras) return concept;
  if (
    extras.sup === "bezirk" &&
    concept.nameFormat === "district" &&
    supText("bezirk", input) !== null
  ) {
    const a = {
      ...concept,
    };
    delete a.nameFormat;
    concept = a;
  }
  const r = {
    ...(concept.typo ?? {}),
  };
  const i = !!cleanText(input.suffix);
  if (extras.sup) {
    const a = supText(extras.sup, input);
    if (
      a &&
      (fontCovers(concept.name.font.key, a) ||
        fontCovers(concept.suffix.font.key, a))
    ) {
      r.sup = {
        art: extras.sup,
        text: a,
      };
      if (extras.fussnote && extras.sup === "stern" && i && !r.inlineSuffix) {
        r.fussnote = true;
      }
    }
  }
  if (extras.klammer && i && !r.inlineSuffix) {
    r.suffixWrap = "klammer";
  }
  if (extras.trenner && i && r.inlineSuffix) {
    r.inlineSep = extras.trenner;
  }
  return {
    ...concept,
    typo: Object.keys(r).length ? r : undefined,
  };
}

const GENERIC_TAILS = new Set([
  "immobilien",
  "immobilie",
  "immo",
  "realitäten",
  "realitaeten",
  "real",
  "estate",
  "makler",
  "gmbh",
  "og",
  "kg",
  "group",
  "gruppe",
  "partner",
  "partners",
  "property",
  "properties",
  "verwaltung",
  "consulting",
  "service",
  "services",
]);

const WORD_ENDINGS = [
  "kontor",
  "werk",
  "wert",
  "form",
  "hof",
  "haus",
  "raum",
  "blick",
  "gut",
  "feld",
  "grund",
  "kern",
  "punkt",
  "puls",
  "sinn",
  "stein",
  "garten",
  "land",
  "stadt",
  "kante",
  "bilanz",
  "achse",
  "zeit",
  "licht",
  "bau",
  "heim",
  "weg",
  "platz",
  "quartier",
  "wohnen",
];

export function endingJoint(word: string) {
  const n = word.toLocaleLowerCase("de-AT");
  const t = Array.from(n);
  const r = WORD_ENDINGS.filter(
    (i) => n.endsWith(i) && t.length - Array.from(i).length >= 3,
  ).sort((i, a) => a.length - i.length)[0];
  return r ? t.length - Array.from(r).length : undefined;
}

export const isLongWord = (word: string | undefined, min: number) =>
  !!word && /^[A-Za-z]/.test(word) && Array.from(word).length >= min;

export const allLongWords = (words: string[]) =>
  words.length > 1 &&
  words
    .slice(1)
    .filter((n) => n !== "&")
    .every((n) => isLongWord(n, 4));

export const nameWords = (name: string | undefined) =>
  cleanText(name)
    .split(" ")
    .filter((n) => n && !/^(dr|mag|di|ing|prof|dipl)\.?$/i.test(n));

function syllableJoint(word: string) {
  const [n, t] = splitSyllables(word);
  if (!t) return;
  const r = Array.from(n).length;
  return r >= 2 && r <= Array.from(word).length - 2 ? r : undefined;
}

export function typoOptions(base: any, preferred?: any): TypoOption[] {
  const { input, style, layout, palette, colors, extra } = base;
  const l = base.upperFormat
    ? {
        ...base.name,
        case: "upper",
      }
    : base.name;
  const u = getFont(l.font.key);
  const m = nameWords(input.name);
  const h = m.length > 1;
  const p = !!cleanText(input.suffix);
  const g = layout === "wordmark" || layout === "stacked" || layout === "badge";
  const w =
    extra &&
    extra.key === l.font.key &&
    !(
      extra.weight === l.font.weight &&
      (extra.style ?? "normal") === (l.font.style ?? "normal")
    )
      ? extra
      : null;
  const x = u.cat === "script";
  const y = style === "luxus" || style === "elegant";
  const f = HIGH_END_STYLES.includes(style);
  const d =
    colors.name === "ink" &&
    contrast(palette.primary, palette.paper) >= 3 &&
    contrast(palette.primary, palette.ink) >= 1.7
      ? "primary"
      : undefined;
  const b: TypoOption[] = [
    {
      kind: "plain",
      weight: 2,
      make: () => ({
        kind: "plain",
      }),
    },
  ];
  const z = isLongWord(m[0], 3);
  const k =
    h &&
    m.slice(1).every((D) => GENERIC_TAILS.has(D.toLocaleLowerCase("de-AT")));
  const v =
    m.length === 1 && !x
      ? (endingJoint(m[0]!) ??
        (isShortBrandName(input) ? syllableJoint(m[0]!) : undefined))
      : undefined;
  const M =
    v !== undefined
      ? {
          joint: v,
        }
      : {};
  if (w && w.style !== "italic" && (h || v !== undefined) && !x) {
    const D = w.weight > l.font.weight;
    b.push({
      kind: "weight",
      weight: style === "mutig" || style === "modern" ? 2.2 : 1.4,
      make: () => ({
        kind: "weight",
        typo: {
          split: {
            part: D !== k ? "rest" : "first",
            font: w,
            tracking:
              l.case === "upper"
                ? undefined
                : D
                  ? round3(l.tracking - 0.01)
                  : undefined,
            ...M,
          },
        },
      }),
    });
  }
  const S =
    y ||
    style === "warm" ||
    style === "natur" ||
    (style === "mutig" && fontForm(l.font.key) === "didone");
  const N = w?.style === "italic" && hasSerifItalic(w.key);
  if (w?.style === "italic" && l.case !== "upper") {
    if (h && S && N) {
      b.push({
        kind: "italic",
        weight: 2.4,
        make: (D) => ({
          kind: "italic",
          typo: {
            split: {
              part: D.chance(0.65) ? "first" : "rest",
              font: w,
            },
          },
        }),
      });
    }
    if (S) {
      b.push({
        kind: "italicAll",
        weight: 1.2,
        make: () => ({
          kind: "italicAll",
          name: {
            ...l,
            font: w,
            tracking: Math.min(l.tracking, 0),
          },
        }),
      });
    }
    if (cleanText(input.name).split(" ").includes("&") && N) {
      b.push({
        kind: "amp",
        weight: 8,
        make: (D) => ({
          kind: "amp",
          typo: {
            ampersand: w,
            ...(d && D.chance(0.5)
              ? {
                  markColor: d,
                }
              : {}),
          },
        }),
      });
    }
  }
  const A = m.length === 2 && !x && !cleanText(input.name).includes("&");
  const R =
    HIGH_END_STYLES.includes(style) ||
    snapTracking(base.suffix.font, "upper", 0.1, null) < 0.12;
  if (
    preferred === "mix" &&
    A &&
    u.cat === "serif" &&
    w?.style === "italic" &&
    isLongWord(m[1], 4) &&
    getFont(base.suffix.font.key).cat === "sans" &&
    R
  ) {
    b.push({
      kind: "mix",
      weight: 1,
      make: (D) => ({
        kind: "mix",
        name: {
          ...l,
          font: w,
          case: "title",
          tracking: Math.min(l.tracking, 0),
        },
        typo: {
          split: {
            part: "rest",
            font: base.suffix.font,
            case: "upper",
            tracking: round3(randomIn(D, 0.08, 0.12)),
            scale: 1,
          },
        },
      }),
    });
  }
  if (
    preferred === "camel" &&
    A &&
    w &&
    (w.style !== "italic" || hasSerifItalic(w.key)) &&
    m.every((D) => Array.from(D).length >= 4) &&
    l.case !== "upper" &&
    l.case !== "lower"
  ) {
    b.push({
      kind: "camel",
      weight: 1,
      make: () => ({
        kind: "camel",
        name: {
          ...l,
          case: "title",
          tracking: Math.min(l.tracking, 0),
        },
        typo: {
          camel: true,
          split: {
            part:
              w.weight > l.font.weight && w.style !== "italic"
                ? "first"
                : "rest",
            font: w,
          },
        },
      }),
    });
  }
  const L = cleanText(input.name).split(" ").includes("&");
  if (h && g && !x && l.case !== "lower" && !L && k && allLongWords(m)) {
    b.push({
      kind: "stack",
      weight: 1,
      make: (D) => ({
        kind: "stack",
        typo: {
          split: {
            part: "rest",
            case: "upper",
            tracking: randomIn(D, 0.16, 0.24),
            scale: randomIn(D, 0.42, 0.5),
            stack: true,
          },
        },
      }),
    });
  }
  if (h && g && !x && l.case !== "lower" && !L && !k && z) {
    b.push({
      kind: "stack",
      weight:
        style === "natur" || style === "mutig"
          ? 0.5
          : style === "modern"
            ? 0.9
            : 1.4,
      make: (D) => ({
        kind: "stack",
        typo: {
          split: {
            part: "first",
            case: "upper",
            tracking:
              y || style === "modern"
                ? randomIn(D, 0.22, 0.3)
                : randomIn(D, 0.08, 0.11),
            scale: randomIn(D, 0.46, 0.54),
            stack: true,
          },
        },
      }),
    });
  }
  if (
    (((u.cat === "sans" || u.cat === "display") &&
      (style === "modern" || style === "mutig" || style === "warm")) ||
      (style === "natur" && fontForm(u.key) !== "condensed")) &&
    !u.capsOnly &&
    !base.upperFormat
  ) {
    b.push({
      kind: "lower",
      weight: 1,
      make: (D) => ({
        kind: "lower",
        name: {
          ...l,
          case: "lower",
          tracking:
            l.font.weight >= 600
              ? randomIn(D, -0.04, -0.025)
              : randomIn(D, -0.025, -0.01),
        },
        typo:
          style === "modern" && layout !== "badge" && D.chance(0.4)
            ? {
                rule: "over",
              }
            : undefined,
        divider: "none",
      }),
    });
  }
  if (
    (style === "elegant" ||
      style === "modern" ||
      style === "natur" ||
      style === "mutig") &&
    layout !== "badge"
  ) {
    b.push({
      kind: "rule",
      weight: 0.9,
      make: (D) => ({
        kind: "rule",
        typo: {
          rule: p || D.chance(0.5) ? "over" : "under",
        },
        divider: "none",
      }),
    });
  } else if (style === "luxus" && layout !== "badge") {
    b.push({
      kind: "rule",
      weight: 0.9,
      make: () => ({
        kind: "rule",
        typo: {
          rule: "over",
        },
        divider: "none",
      }),
    });
  }
  const I = applyCase(cleanText(input.name), "upper", l.font.key);
  const T = CONTAINERS.some((D) => D.key === "ring")
    ? "ring"
    : CONTAINERS.some((D) => D.key === "circle")
      ? "circle"
      : null;
  const K = !u.tags?.includes("schmal") && fontForm(u.key) !== "condensed";
  if (
    layout === "wordmark" &&
    base.icon &&
    T &&
    K &&
    /O/.test(I.slice(1)) &&
    !x &&
    !u.noCaps
  ) {
    b.push({
      kind: "swap",
      weight: 1.8,
      make: (D) => ({
        kind: "swap",
        name: {
          ...l,
          case: "upper",
          tracking: snapTracking(
            l.font,
            "upper",
            Math.max(
              l.tracking,
              y || style === "modern"
                ? randomIn(D, 0.08, 0.14)
                : randomIn(D, 0.06, 0.1),
            ),
          ),
        },
        symbol: {
          kind: "icon",
          id: base.icon.id,
          container: T,
        },
        typo: {
          letterSwap: true,
        },
        divider: "none",
      }),
    });
  }
  if (
    layout === "wordmark" &&
    p &&
    !base.district &&
    cleanText(input.name).length + cleanText(input.suffix).length <= 22
  ) {
    b.push({
      kind: "inline",
      weight: 1.1,
      make: () => ({
        kind: "inline",
        typo: {
          inlineSuffix: true,
        },
        divider: "none",
      }),
    });
  }
  if (!x && layout !== "badge") {
    b.push({
      kind: "dot",
      weight: (p ? 0.6 : 1.4) * (f ? 1.4 : 1),
      make: (D) => ({
        kind: "dot",
        typo: {
          mark: "dot",
          ...(d && D.chance(0.6)
            ? {
                markColor: d,
              }
            : {}),
        },
        divider: "none",
      }),
    });
  }
  if (
    h &&
    m.length <= 3 &&
    !x &&
    !cleanText(input.name).includes("&") &&
    f &&
    layout !== "badge" &&
    layout !== "inline"
  ) {
    b.push({
      kind: "hairline",
      weight: 1.3,
      make: (D) => ({
        kind: "hairline",
        typo: {
          mark: "hairline",
          ...(d && D.chance(0.3)
            ? {
                markColor: d,
              }
            : {}),
        },
      }),
    });
  }
  return b;
}

export function pickTypo(
  base: any,
  rnd: Rng,
  usage: any,
  preferred: any,
  needDetail: boolean = false,
  noMark: boolean = false,
  markFallback: boolean = false,
) {
  const o = typoOptions(base, preferred);
  const l = (y: any) => y.kind === "dot" || y.kind === "hairline";
  let u = o.filter((y) => !noMark || !l(y));
  if (
    needDetail &&
    markFallback &&
    !u.some((y) => DETAIL_KINDS.includes(y.kind))
  ) {
    u = o;
  }
  const m = u.filter((y) => DETAIL_KINDS.includes(y.kind));
  const h = needDetail && m.length ? m : u;
  const p = preferred && h.find((y) => y.kind === preferred);
  const x = (
    (getFont(base.name.font.key).cat === "script"
      ? u.find((y) => y.kind === "mix")
      : undefined) ??
    p ??
    weightedPick(
      rnd,
      h,
      (y) =>
        y.weight /
        (1 + (usage?.get(y.kind) ?? 0) * (y.kind === "plain" ? 1.4 : 3.2)),
    )
  ).make(rnd);
  return x.kind === "plain" &&
    base.layout === "wordmark" &&
    (base.style === "elegant" ||
      base.style === "modern" ||
      base.style === "natur") &&
    rnd.chance(0.15)
    ? {
        kind: "rule",
        typo: {
          rule: "over",
        },
        divider: "none",
      }
    : x;
}

export function typoKind(concept: LogoConcept) {
  const n = concept.typo;
  if (n?.letterSwap) return "swap";
  if (n?.mark === "macron") return "rule";
  if (n?.mark === "hairline") return "hairline";
  if (n?.mark === "dot") return "dot";
  if (n?.sup) return "sup";
  if (n?.camel) return "camel";
  if (n?.inlineSuffix) return "inline";
  if (n?.ampersand) return "amp";
  const t = n?.split;
  if (t) {
    if (t.stack && t.font && t.font.key !== concept.name.font.key) return "mix";
    if (t.stack) return "stack";
    if (t.font?.style === "italic") return "italic";
    if (t.font && t.font.key !== concept.name.font.key) return "mix";
    if (t.font) return "weight";
    if (t.color) return "color";
    if (t.case) return "caps";
  }
  return concept.name.font.style === "italic"
    ? "italicAll"
    : concept.name.case === "lower"
      ? "lower"
      : n?.rule
        ? "rule"
        : "plain";
}

export function editorOptions(concept: LogoConcept, input: LogoInput) {
  const t = getFont(concept.name.font.key);
  const r = t.cat === "script";
  const i = nameWords(input.name);
  const a = concept.typo?.split?.joint;
  const s = i.length > 1 || (typeof a == "number" && a > 1);
  const [o, l] = splitLabels(input.name, a);
  const u = concept.typo?.split;
  const m = (G: any) =>
    withId({
      ...concept,
      ...G,
    });
  const h = (G: any, U: any) => {
    const J = {
      ...(concept.typo ?? {}),
    };
    if (U === null) {
      delete J.split;
    } else {
      J.split = {
        ...(u && u.part === G
          ? u
          : {
              part: G,
              ...(a
                ? {
                    joint: a,
                  }
                : {}),
            }),
        ...U,
        part: G,
      };
    }
    return m({
      typo: Object.keys(J).length ? J : undefined,
    });
  };
  const p = (G: any) => {
    if (!u) return concept;
    const U = {
      ...u,
    };
    for (const Q of G) delete (U as Record<string, any>)[Q];
    const J =
      U.font || U.case || U.color || U.stack || U.tracking !== undefined;
    const ee = {
      ...(concept.typo ?? {}),
      ...(J
        ? {
            split: U,
          }
        : {}),
    };
    if (!J) {
      delete ee.split;
    }
    return m({
      typo: Object.keys(ee).length ? ee : undefined,
    });
  };
  const g = [];
  const w = (G: any, U: any) => Math.abs(G - U) < 0.015;
  const x = [
    ["eng", "Eng", TRACKING_LEVELS.eng],
    ["normal", "Normal", TRACKING_LEVELS.normal],
    ["weit", "Weit", TRACKING_LEVELS.weit],
    ["sehrweit", "Sehr weit", TRACKING_LEVELS.sehrWeit],
  ]
    .filter(
      ([G]) => !(G === "sehrweit" && (r || concept.name.case === "lower")),
    )
    .map(([G, U, J]) => ({
      key: G,
      label: U,
      concept: m({
        name: {
          ...concept.name,
          tracking: J,
        },
      }),
      active: w(concept.name.tracking, J),
    }));
  g.push({
    key: "tracking",
    label: "LAUFWEITE",
    choices: x,
    note:
      r || concept.name.case === "lower"
        ? "Sehr weit passt nicht zu Kleinbuchstaben und Handschrift."
        : undefined,
  });
  const y = [];
  if (!t.capsOnly) {
    y.push({
      key: "normal",
      label: "Normal",
      concept: m({
        name: {
          ...concept.name,
          case: "title",
        },
      }),
      active: concept.name.case === "title" && !u?.case,
    });
  }
  const f =
    concept.name.case === "upper"
      ? snapTracking(concept.name.font, "upper", concept.name.tracking)
      : defaultTracking(concept.name.font, "upper");
  if (!r && !t.noCaps) {
    y.push({
      key: "upper",
      label: "VERSAL",
      concept: m({
        name: {
          ...concept.name,
          case: "upper",
          tracking: f,
        },
      }),
      active: concept.name.case === "upper",
    });
  }
  if (!t.capsOnly && !r) {
    y.push({
      key: "lower",
      label: "klein",
      concept: m({
        name: {
          ...concept.name,
          case: "lower",
          tracking: snapTracking(
            concept.name.font,
            "lower",
            concept.name.tracking,
          ),
        },
      }),
      active: concept.name.case === "lower",
    });
  }
  if (s && !r && !t.capsOnly) {
    y.push({
      key: "mixed",
      label: `${o} normal, ${l!.toLocaleUpperCase("de-AT")} VERSAL`,
      concept: h("rest", {
        case: "upper",
        tracking: 0.12,
        scale: 0.8,
      }),
      active: u?.part === "rest" && u.case === "upper",
    });
  }
  g.push({
    key: "case",
    label: "SCHREIBWEISE",
    choices: y,
    note: r
      ? "Handschrift wird nie in Versalien gesetzt."
      : s
        ? undefined
        : "Gemischt geht nur bei Namen aus mehreren Teilen.",
  });
  const d = italicVariant(concept.name.font.key, concept.name.font.weight);
  const b = {
    key: concept.name.font.key,
    weight: concept.name.font.weight,
  };
  if (d && !r) {
    const G = [
      {
        key: "none",
        label: "Nicht kursiv",
        concept:
          u?.font?.style === "italic"
            ? p(["font"])
            : m({
                name: {
                  ...concept.name,
                  font: b,
                },
              }),
        active:
          concept.name.font.style !== "italic" && u?.font?.style !== "italic",
      },
      {
        key: "all",
        label: "Ganzer Name kursiv",
        concept: m({
          name: {
            ...concept.name,
            font: d,
          },
        }),
        active: concept.name.font.style === "italic",
      },
    ];
    if (s) {
      G.push({
        key: "first",
        label: `${o} kursiv`,
        concept: h("first", {
          font: d,
        }),
        active: u?.part === "first" && u.font?.style === "italic",
      });
      G.push({
        key: "rest",
        label: `${l} kursiv`,
        concept: h("rest", {
          font: d,
        }),
        active: u?.part === "rest" && u.font?.style === "italic",
      });
    }
    g.push({
      key: "italic",
      label: "KURSIV",
      choices: G,
    });
  } else
    g.push({
      key: "italic",
      label: "KURSIV",
      choices: [],
      note: "Diese Schrift hat keine Kursive.",
    });
  const z = [...t.weights].sort((G, U) => G - U);
  if (z.length > 1 && s && !r) {
    const G = {
      key: t.key,
      weight: z[0],
    };
    const U = {
      key: t.key,
      weight: z[z.length - 1],
    };
    g.push({
      key: "weight",
      label: "SCHNITTMISCHUNG",
      choices: [
        {
          key: "uniform",
          label: "Einheitlich",
          concept: u?.font && u.font.style !== "italic" ? p(["font"]) : concept,
          active: !u?.font || u.font.style === "italic",
        },
        {
          key: "lightheavy",
          label: `${o} leicht, ${l} kräftig`,
          concept: withId({
            ...h("rest", {
              font: U,
            }),
            name: {
              ...concept.name,
              font: G,
            },
          }),
          active:
            concept.name.font.weight === G.weight &&
            u?.part === "rest" &&
            u.font?.weight === U.weight,
        },
        {
          key: "heavylight",
          label: `${o} kräftig, ${l} leicht`,
          concept: withId({
            ...h("rest", {
              font: G,
            }),
            name: {
              ...concept.name,
              font: U,
            },
          }),
          active:
            concept.name.font.weight === U.weight &&
            u?.part === "rest" &&
            u.font?.weight === G.weight,
        },
      ],
    });
  } else
    g.push({
      key: "weight",
      label: "SCHNITTMISCHUNG",
      choices: [],
      note:
        z.length < 2
          ? "Diese Schrift hat nur einen Schnitt."
          : "Dein Name hat nur einen Teil.",
    });
  const k = sanitizePalette(concept.palette);
  if (
    s &&
    contrast(k.primary, k.paper) >= 4.5 &&
    contrast(k.primary, k[concept.colors.name]) >= 1.5
  ) {
    g.push({
      key: "color",
      label: "FARBTEILUNG",
      choices: [
        {
          key: "mono",
          label: "Einfarbig",
          concept: u?.color ? p(["color"]) : concept,
          active: !u?.color,
        },
        {
          key: "first",
          label: `${o} in Akzentfarbe`,
          concept: h("first", {
            color: "primary",
          }),
          active: u?.part === "first" && !!u.color,
        },
        {
          key: "rest",
          label: `${l} in Akzentfarbe`,
          concept: h("rest", {
            color: "primary",
          }),
          active: u?.part === "rest" && !!u.color,
        },
      ],
    });
  } else {
    g.push({
      key: "color",
      label: "FARBTEILUNG",
      choices: [],
      note: s
        ? "Die Akzentfarbe ist für Text zu hell oder zu nah an der Namensfarbe."
        : "Dein Name hat nur einen Teil.",
    });
  }
  const M = [];
  const S = () => {
    const G = {
      ...(concept.typo ?? {}),
    };
    delete G.rule;
    delete G.mark;
    if (!G.ampersand) {
      delete G.markColor;
    }
    return G;
  };
  const N = (G: any, U = {}) =>
    m({
      typo: {
        ...S(),
        ...G,
      },
      ...U,
    });
  const A = concept.typo?.mark;
  if (concept.layout !== "badge") {
    const G = S();
    M.push({
      key: "none",
      label: "Ohne",
      concept: m({
        typo: Object.keys(G).length ? G : undefined,
      }),
      active: !concept.typo?.rule && !A,
    });
    M.push({
      key: "over",
      label: "Linie darüber",
      concept: N(
        {
          rule: "over",
        },
        {
          divider: "none",
        },
      ),
      active: concept.typo?.rule === "over",
    });
    M.push({
      key: "under",
      label: "Linie darunter",
      concept: N(
        {
          rule: "under",
        },
        {
          divider: "none",
        },
      ),
      active: concept.typo?.rule === "under",
    });
    if (!r) {
      M.push({
        key: "dot",
        label: "Punkt am Ende",
        concept: N(
          {
            mark: "dot",
          },
          {
            divider: "none",
          },
        ),
        active: A === "dot",
      });
    }
    if (i.length > 1 && !r) {
      M.push({
        key: "hairline",
        label: `Haarlinie zwischen ${o} und ${l}`,
        concept: N({
          mark: "hairline",
        }),
        active: A === "hairline",
      });
    }
  }
  if (d && cleanText(input.name).split(" ").includes("&")) {
    M.push({
      key: "amp",
      label: "& in Kursiv",
      concept: m({
        typo: {
          ...(concept.typo ?? {}),
          ampersand: d,
        },
      }),
      active: !!concept.typo?.ampersand,
    });
  }
  g.push({
    key: "accent",
    label: "AKZENT",
    choices: M,
    note:
      concept.layout === "badge"
        ? "Im Emblem gibt es keine Akzentlinie."
        : undefined,
  });
  return g;
}

export const DETAIL_KINDS = [
  "weight",
  "italic",
  "italicAll",
  "amp",
  "mix",
  "color",
  "rule",
  "camel",
  "dot",
  "hairline",
  "sup",
];
