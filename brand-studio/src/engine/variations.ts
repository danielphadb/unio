/**
 * Varianten eines Konzepts: "Aehnlich wie" in der Galerie (`similarConcepts`) und Varianten im
 * Editor (`editorVariants`) (engine `Yc` ... `Qc`).
 */
import type {
  BrandInput,
  FontRef,
  IconSymbol,
  LogoConcept,
} from "../types";
import { ALL_ICONS } from "../symbols/Icons";
import {
  FILLED_CHANCE,
  conceptKey,
  containersForInput,
  iconsForInput,
  initialIconFits,
  isClicheIcon,
  monogramFont,
  pickColors,
  pickDivider,
  typography,
} from "./generator";
import { FONTS, getFont, getSelectableFont, italicVariant } from "./fonts";
import {
  LAYOUTS,
  fontFitsName,
  fontsForStyle,
  mixSeed,
  withId,
} from "./catalog";
import { alternativePalettes } from "./palettes";
import { cleanText } from "./cleanText";
import { extraCut } from "./nameCards";
import { hash, rng } from "./rng";
import { initials } from "./renderLogo";
import { typoOptions } from "./typoExtras";

function sharedTraits(first: LogoConcept, second: LogoConcept) {
  const t = (a: any) => [
    JSON.stringify(a.symbol),
    a.name.font.key,
    a.palette.id + a.palette.primary,
    a.layout,
  ];
  const r = t(first);
  const i = t(second);
  return r.filter((a, s) => a === i[s]).length;
}

export function editorVariants(
  concept: LogoConcept,
  input: BrandInput,
  count: number,
): LogoConcept[] {
  const i = rng(mixSeed(concept.seed, 61)).shuffle([
    ["font"],
    ["symbol"],
    ["layout"],
    ["font", "layout"],
    ["symbol", "font"],
    ["layout", "symbol"],
  ]);
  const a = Math.max(2, Math.ceil(count / i.length) + 1);
  const s = i.map((u) => {
    const m = similarConcepts(concept, input, u[0]!, a);
    return u.length === 1
      ? m
      : m
          .map((h, p) => similarConcepts(h, input, u[1]!, (p % 3) + 1)[p % 3])
          .filter(Boolean);
  });
  const o = [];
  const l = new Set([conceptKey(concept), concept.id]);
  for (let u = 0; o.length < count && u < a; u++) {
    for (const m of s) {
      if (o.length >= count) break;
      const h = m[u];
      if (
        !(
          !h ||
          l.has(h.id) ||
          l.has(conceptKey(h)) ||
          sharedTraits(concept, h) < 2
        )
      ) {
        l.add(h.id);
        l.add(conceptKey(h));
        o.push(h);
      }
    }
  }
  if (o.length < count)
    for (const u of similarConcepts(concept, input, "font", count * 3)) {
      if (o.length >= count) break;
      if (!(l.has(u.id) || l.has(conceptKey(u)))) {
        l.add(u.id);
        l.add(conceptKey(u));
        o.push(u);
      }
    }
  return o;
}

function sameJson(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function similarConcepts(
  concept: LogoConcept,
  input: BrandInput,
  axis: string,
  count: number,
): LogoConcept[] {
  const i = rng(mixSeed(concept.seed, hash(axis)));
  const a: any[] = [];
  const s = new Set([concept.id]);
  const o = (f: any) => {
    const d = withId(f);
    if (!(s.has(d.id) || a.length >= count)) {
      s.add(d.id);
      a.push(d);
    }
  };
  const l = concept.style;
  const u = !!cleanText(input.suffix);
  if (axis === "symbol") {
    const f = concept.layout === "wordmark" ? "stacked" : concept.layout;
    const d = f === "badge";
    const b = i.shuffle(iconsForInput(input.themes, l, input.name));
    const z = i.shuffle(
      ALL_ICONS.filter(
        (S) =>
          !b.includes(S) &&
          initialIconFits(S, input.name) &&
          !isClicheIcon(S, input.themes),
      ),
    );
    const k = ["none", ...containersForInput(l, input.themes)];
    const v = ["none", ...containersForInput(l, input.themes, true)];
    const M: Array<{ symbol: any; filled: boolean }> = [];
    for (const S of [...b, ...z] as any[]) {
      const N = d ? "none" : i.pick(k);
      M.push({
        symbol: {
          kind: "icon",
          id: S.id,
          container: N,
        },
        filled: N !== "none" && i.chance(FILLED_CHANCE[l]),
      });
    }
    for (const S of v) {
      for (const N of [initials(input.name, 2), initials(input.name, 1)])
        M.splice(Math.min(M.length, 1 + a.length * 2 + i.int(0, 3)), 0, {
          symbol: {
            kind: "monogram",
            letters: N,
            container: d ? "none" : S,
            font: monogramFont(concept.name.font, l, i, N),
          },
          filled: S !== "none" && i.chance(0.4),
        });
    }
    if (concept.symbol && !d)
      for (const S of k) {
        M.push({
          symbol: {
            ...concept.symbol,
            container: S,
          },
          filled: false,
        });
        M.push({
          symbol: {
            ...concept.symbol,
            container: S,
          },
          filled: true,
        });
      }
    for (const S of M) {
      if (
        !(
          sameJson(S.symbol, concept.symbol) &&
          !!S.filled == !!concept.symbolFilled
        )
      ) {
        o({
          ...concept,
          layout: f,
          symbol: S.symbol,
          symbolFilled: d
            ? concept.symbolFilled
            : S.filled && S.symbol.container !== "none",
        });
      }
    }
    return a;
  }
  if (axis === "font") {
    const f = fontsForStyle(l, input).filter(
      (z) => z.key !== concept.name.font.key,
    );
    const d = FONTS.filter(
      (z) =>
        !f.includes(z) &&
        z.key !== concept.name.font.key &&
        fontFitsName(z, input),
    );
    const b = [...i.shuffle(f), ...i.shuffle(d)];
    for (let z = 0; a.length < count && z < 3; z++) {
      for (const k of b) {
        if (a.length >= count) break;
        const v = typography(
          k,
          l,
          rng(mixSeed(concept.seed, hash(k.key), z)),
          input,
        );
        const M = carryTypo(concept, v.name.font, v.suffix.font);
        const { typo, ...N } = concept;
        o({
          ...N,
          name: v.name,
          suffix: v.suffix,
          tagline: v.tagline,
          body: v.body,
          ...(M
            ? {
                typo: M,
              }
            : {}),
        });
      }
    }
    return a;
  }
  if (axis === "typo") {
    const f = extraCut(concept.name.font, i);
    const d =
      concept.symbol?.kind === "icon"
        ? ALL_ICONS.find((M) => M.id === (concept.symbol as IconSymbol).id)
        : undefined;
    const b = {
      input,
      style: l,
      layout: concept.layout,
      name: concept.name,
      suffix: concept.suffix,
      palette: concept.palette,
      colors: concept.colors,
      extra: f,
      icon: d,
    };
    const z = i.shuffle(typoOptions(b).filter((M) => M.kind !== "swap"));
    const k = getFont(concept.name.font.key);
    const v = (M: any, S: any) => ({
      kind: "plain",
      weight: 1,
      make: () => ({
        kind: "plain",
        name: {
          ...concept.name,
          case: M,
          tracking: S,
        },
      }),
    });
    if (k.cat !== "script") {
      if (!k.capsOnly) {
        z.push(
          v("title", k.cat === "serif" ? -0.005 : -0.03),
          v("title", 0.02),
        );
      }
      if (!k.noCaps) {
        z.push(v("upper", 0.08), v("upper", 0.16), v("upper", 0.26));
      }
    }
    for (let M = 0; a.length < count && M < 6; M++) {
      for (const S of z) {
        if (a.length >= count) break;
        const N = S.make(rng(mixSeed(concept.seed, hash(S.kind), M)));
        const { typo, ...R } = concept;
        o({
          ...R,
          name: N.name ?? concept.name,
          divider: N.divider ?? concept.divider,
          ...(N.typo
            ? {
                typo: N.typo,
              }
            : {}),
        });
      }
    }
    return a;
  }
  if (axis === "palette") {
    for (const f of alternativePalettes(concept.palette, input, count + 4, l))
      o({
        ...concept,
        palette: f,
        colors: pickColors(f, l, rng(mixSeed(concept.seed, hash(f.id)))),
      });
    return a;
  }
  const m = [];
  const h = concept.name.case;
  const p = {
    ...concept,
    symbolPosition: undefined,
    symbolSize: undefined,
  };
  for (const f of i.shuffle(LAYOUTS.filter((d) => d !== concept.layout))) {
    const d = rng(mixSeed(concept.seed, hash(f)));
    if (f === "badge")
      for (const b of ["frame", "arch", "seal"]) {
        if (!(b === "seal" && !u)) {
          m.push({
            ...p,
            layout: f,
            badge: b,
            divider: pickDivider(f, l, u, h, d),
            symbolFilled: false,
          });
        }
      }
    else {
      const { badge, ...z } = p;
      m.push({
        ...z,
        layout: f,
        divider: pickDivider(f, l, u, h, d),
      });
    }
  }
  const g = [];
  const w = new Set();
  for (const f of m) {
    if (!w.has(f.layout)) {
      w.add(f.layout);
      g.push(f);
    }
  }
  for (const f of g) o(f);
  if (concept.symbol) {
    const { badge, ...d } = p;
    const b = [
      {
        layout: "stacked",
        symbolSize: "small",
      },
      {
        layout: "inline",
        symbolPosition: "right",
      },
      {
        layout: "stacked",
        symbolSize: "large",
      },
      {
        layout: "stacked",
        symbolPosition: "below",
      },
    ];
    for (const z of b)
      o({
        ...d,
        ...z,
        divider: z.layout === "inline" ? concept.divider : d.divider,
      });
  }
  for (const f of m) o(f);
  const x = ["none", "line", "dot"];
  for (const f of LAYOUTS) {
    for (const d of x) {
      if (f === "inline" && d === "dot" && u) continue;
      const b = {
        ...concept,
        layout: f,
        divider: d,
      };
      if (f === "badge")
        for (const z of ["frame", "arch", "seal"]) {
          if (!(z === "seal" && !u)) {
            o({
              ...b,
              badge: z,
              symbolFilled: false,
            });
            o({
              ...b,
              badge: z,
              symbolFilled: true,
            });
          }
        }
      else {
        const { badge, ...k } = b;
        o(k);
      }
    }
  }
  return a;
}

function carryTypo(concept: LogoConcept, font: FontRef, suffixFont?: FontRef) {
  const r = concept.typo;
  if (!r) return;
  const i = (s: any) => {
    if (!s) return;
    if (s.key === concept.suffix.font.key) return suffixFont;
    if (s.style === "italic")
      return italicVariant(font.key, font.weight) ?? undefined;
    const l = getSelectableFont(font.key).weights.find(
      (u) => u !== font.weight,
    );
    return l !== undefined
      ? {
          key: font.key,
          weight:
            s.weight > concept.name.font.weight
              ? Math.max(l, font.weight)
              : Math.min(l, font.weight),
        }
      : undefined;
  };
  const a = {
    ...r,
  };
  if (r.split) {
    const s = i(r.split.font);
    const o = {
      ...r.split,
      font: s,
    };
    if (!s) {
      delete o.font;
    }
    if (
      !o.font &&
      !o.case &&
      !o.color &&
      o.tracking === undefined &&
      !o.stack
    ) {
      delete a.split;
    } else {
      a.split = o;
    }
  }
  if (r.ampersand) {
    const s = italicVariant(font.key, font.weight);
    if (s) {
      a.ampersand = s;
    } else {
      delete a.ampersand;
    }
  }
  return Object.keys(a).length ? a : undefined;
}
