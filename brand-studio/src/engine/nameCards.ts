/**
 * Konzepte fuer Namenskarten und Routen: Schriftplan je Seite mit Rotation (`fontPlan`),
 * Konzepte fuer einen Namen (`nameCardConcepts`) und je Karte (`nameCardConcept`, Budget je Seite)
 * (engine `qc` ... `Nm`, `Im`, `Om`, `Bm`, `Vm`).
 */
import type { BrandInput, FontMeta, FontRef, LogoConcept } from "../types";
import type { FontPlan, TasteProfile } from "./logoTypes";
import type { Rng } from "./rng";
import {
  COMMON_FONTS,
  FONTS,
  fontGroupOf,
  getFont,
  getSelectableFont,
  italicVariant,
} from "./fonts";
import { DETAIL_KINDS, allLongWords, nameWords, typoKind } from "./typoExtras";
import { LEIT_KLASSE, leitMerkmale, templateBaseId } from "./route";
import {
  RECIPE_EXTRA_STYLE,
  accentsVisible,
  allowsRule,
  buildConcept,
  dropInvisibleAccents,
  iconsForInput,
  lookKey,
  monogramLetters,
  pickRecipe,
  repairConcept,
  routeFontFactor,
  serifDecided,
  withLegalProximity,
} from "./generator";
import {
  STYLES,
  SUFFIX_FONTS,
  coveringFonts,
  fontWeightForStyle,
  fontsForStyle,
  heaviest,
  inputSeed,
  lightest,
  mixSeed,
  weightedPick,
  withId,
} from "./catalog";
import { cleanText } from "./cleanText";
import { contrast } from "./color";
import { fontCovers } from "./charset";
import { fontForm } from "./tracking";
import { hash, rng } from "./rng";
import { initials } from "./renderLogo";
import { recipeAcceptsFont } from "./recipes";
import { tasteFactor } from "./taste";

const EXTRA_CHANCE = 0.15;

const MONO_FONTS = ["dmmono", "geistmono", "plexmono"];

export const NAME_FONTS_PER_PAGE = 4;

export function extraCut(font: FontRef, rnd: Rng) {
  const t = getSelectableFont(font.key);
  const r = italicVariant(font.key, font.weight);
  const i = t.weights.find((s) => s !== font.weight);
  const a =
    i !== undefined && t.cat !== "script"
      ? {
          key: font.key,
          weight: i,
        }
      : null;
  return r && a
    ? rnd.chance(t.cat === "serif" ? 0.7 : 0.35)
      ? r
      : a
    : (r ?? a);
}

const uniqueByKey = <T extends { key: string }>(fonts: T[]): T[] => [
  ...new Map(fonts.map((n) => [n.key, n])).values(),
];

function cutForStyle(meta: FontMeta, style: string, rnd: Rng): FontRef {
  return meta.cat === "script" || style === "luxus" || style === "elegant"
    ? lightest(meta)
    : style === "mutig"
      ? heaviest(meta)
      : style === "modern" || style === "natur"
        ? meta.cat !== "serif" && style === "modern" && rnd.chance(0.06)
          ? heaviest(meta)
          : lightest(meta)
        : meta.cat === "serif"
          ? rnd.chance(0.3)
            ? heaviest(meta)
            : lightest(meta)
          : rnd.chance(0.5)
            ? heaviest(meta)
            : lightest(meta);
}

export function fontPlan(
  input: BrandInput,
  seed: number,
  page: number,
  taste: TasteProfile | null = null,
): FontPlan {
  const i = input.styles.length ? input.styles : STYLES;
  const a = cleanText(input.suffix);
  let s = new Set();
  let o: FontPlan = {
    names: [],
    suffix: {
      key: "manrope",
      weight: 400,
    },
    extra: null,
  };
  const l = leitMerkmale(input).klasse;
  for (let u = 0; u <= page; u++) {
    const m = rng(mixSeed(seed, u, 61687));
    const h = m.shuffle(i);
    const p = [];
    const g = new Set();
    for (
      let v = 0;
      v < NAME_FONTS_PER_PAGE * 2 && p.length < NAME_FONTS_PER_PAGE;
      v++
    ) {
      const M = h[v % h.length];
      const S = fontsForStyle(M!, input).filter(
        (F) => !g.has(F.key) && F.cat !== "script",
      );
      let N = S;
      const A = N.filter((F) => !s.has(F.key));
      if (A.length) {
        N = A;
      }
      if (!N.length) continue;
      const R = new Set(p.map((F) => fontGroupOf(F.key)));
      const L = serifDecided(input) ? 2 : 3;
      let E = N.filter((F) => !R.has(fontGroupOf(F.key)));
      if (!E.length && R.size < L) {
        E = S.filter((F) => !R.has(fontGroupOf(F.key)));
      }
      if (!E.length && R.size < L) {
        E = h
          .flatMap((F) => fontsForStyle(F, input))
          .filter(
            (F) =>
              !g.has(F.key) && !R.has(fontGroupOf(F.key)) && F.cat !== "script",
          );
      }
      const I = l
        ? p.filter((F) => LEIT_KLASSE[fontForm(F.key)] === l).length
        : NAME_FONTS_PER_PAGE;
      let T =
        I < Math.ceil(NAME_FONTS_PER_PAGE / 2)
          ? N.filter((F) => LEIT_KLASSE[fontForm(F.key)] === l)
          : [];
      if (I < Math.ceil(NAME_FONTS_PER_PAGE / 2) && !T.length) {
        T = uniqueByKey(h.flatMap((F) => fontsForStyle(F!, input))).filter(
          (F) =>
            !g.has(F.key) &&
            F.cat !== "script" &&
            LEIT_KLASSE[fontForm(F.key)] === l,
        );
      }
      if (T.length) {
        N = T;
      } else if (R.size && R.size < L && E.length) {
        N = E;
      }
      const K = weightedPick(
        m,
        N,
        (F) =>
          fontWeightForStyle(F, M!) ** 2 *
          tasteFactor(taste, `form:${fontForm(F.key)}`) ** 3 *
          routeFontFactor(F, input),
      );
      g.add(K.key);
      p.push(cutForStyle(K, M!, m));
    }
    const w = new Map();
    for (const v of h) {
      for (const M of SUFFIX_FONTS[v]) w.set(M, (w.get(M) ?? 0) + 1);
    }
    const x = coveringFonts([...w.keys()], a, cleanText(input.name));
    let y = lightest(
      getFont(
        weightedPick(
          m,
          x,
          (v) => (w.get(v) ?? 1) * (COMMON_FONTS.includes(v) ? 0.6 : 1),
        ),
      ),
    );
    const f = rng(mixSeed(seed, u, hash(cleanText(input.name)), 12448));
    if (
      p.some(
        (v) => fontForm(v.key) === "didone" || fontForm(v.key) === "antiqua",
      ) &&
      h.some((v) => v === "luxus" || v === "elegant" || v === "modern") &&
      f.chance(EXTRA_CHANCE)
    ) {
      const v = MONO_FONTS.filter((M) =>
        fontCovers(M, a, cleanText(input.name)),
      );
      if (v.length) {
        y = lightest(getFont(f.pick(v)));
      }
    }
    s = new Set([...s, ...g]);
    if (s.size > FONTS.length - NAME_FONTS_PER_PAGE * 2) {
      s = new Set(g);
    }
    const b = m
      .shuffle(p)
      .map((v) => extraCut(v, m))
      .filter((v) => !!v);
    const z = cleanText(input.name).split(" ").includes("&");
    const k = p.map((v) => italicVariant(v.key, v.weight)).filter((v) => !!v);
    o = {
      names: p,
      suffix: y,
      extra:
        (z && k[0]) ||
        (k.length && m.chance(0.75) ? k[0] : null) ||
        (b[0] ?? null),
    };
  }
  return o;
}

export function nameCardConcepts(
  name: string,
  input: BrandInput,
  count: number,
  seed: number | undefined,
) {
  const i = {
    ...input,
    name: cleanText(name) || cleanText(input.name),
  };
  const a = seed ?? inputSeed(i);
  const s = fontPlan(i, a, 0);
  const o = [...s.names, s.suffix];
  const l = i.styles.length ? i.styles : STYLES;
  const m = rng(mixSeed(a, 119)).shuffle([
    "plain",
    "weight",
    "italic",
    "italicAll",
    "stack",
    "lower",
    "rule",
    "amp",
    "dot",
    "hairline",
  ]);
  const h = hash(`${cleanText(i.name)}|${a}`) % 3 === 0;
  const p = ["paper", "ink", "paper", "primary"];
  const g = [];
  const w = new Set();
  for (let y = 0; g.length < count && y < count * 8; y++) {
    const f = l[y % l.length];
    const d = f !== "luxus" && nameWords(i.name).length > 1;
    const b =
      s.names
        .map((L, E) => s.names[(y + E) % s.names.length])
        .find((L) => d || getFont(L!.key).cat !== "script") ??
      s.names[y % s.names.length];
    const z = {
      name: b,
      suffix: s.suffix,
      extra: s.extra?.key === b!.key ? s.extra : null,
      planned: o,
      pageExtra: s.extra,
    };
    const k = buildConcept(i, mixSeed(a, 153, y), {
      style: f,
      layout: "wordmark",
      slot: z,
      typoKind: m[y % m.length],
      noSymbol: true,
      needDetail: g.length % 2 === 1,
      noMark: true,
      markFallback: h && g.length === 1,
    });
    if (
      g.length % 2 === 1 &&
      !DETAIL_KINDS.includes(typoKind(k)) &&
      y < count * 6
    )
      continue;
    const v: any = p[g.length % p.length];
    const M = contrast(k.palette.primary, k.palette.paper) >= 4.5;
    if (v === "primary" && !M && y < count * 6) continue;
    const S: any = v === "primary" && !M ? "ink" : v;
    const N = withId({
      ...k,
      cardBackground: S,
    });
    const A: any = accentsVisible(N, S) ? N : withId(dropInvisibleAccents(N));
    const R = [typoKind(A), A.name.font.key, A.name.case].join("|");
    if (!w.has(R)) {
      w.add(R);
      g.push(A);
    }
  }
  return g;
}

export function cardVariant(concept: LogoConcept, input: BrandInput) {
  if (concept.layout === "badge") return concept;
  const t =
    concept.symbol &&
    !(concept.typo?.letterSwap && concept.layout === "wordmark")
      ? {
          ...concept.symbol,
          container: "none",
        }
      : {
          kind: "monogram",
          letters: initials(input.name, 2),
          container: "none",
          font: concept.name.font,
        };
  const r = {
    ...(concept.typo ?? {}),
  };
  delete r.inlineSuffix;
  delete r.letterSwap;
  delete r.rule;
  const { symbolPosition, symbolSize, ...s } = concept;
  return withId({
    ...s,
    layout: "badge",
    badge: "frame",
    symbol: t,
    symbolFilled: false,
    typo: Object.keys(r).length ? r : undefined,
  });
}

export function nameCardFonts(
  input: BrandInput,
  seed: number,
  count: number = NAME_FONTS_PER_PAGE,
) {
  const r = fontPlan(input, seed, 0);
  if (count <= NAME_FONTS_PER_PAGE) return r;
  const i = r.names.slice();
  for (let a = 1; a < 6 && i.length < count; a++) {
    for (const s of fontPlan(input, seed, a).names) {
      if (i.length < count && !i.some((o) => o.key === s.key)) {
        i.push(s);
      }
    }
  }
  return {
    ...r,
    names: i,
  };
}

export function nameCardConcept(input: BrandInput, seed: number, options: any) {
  const r = rng(mixSeed(seed, 51837));
  const i = [...options.plan.names, options.plan.suffix];
  const a = (A: any) => fontCovers(A.key, input.name, input.suffix);
  const s = options.plan.names.filter(
    (A: any) =>
      a(A) &&
      !(
        getFont(A.key).cat === "script" &&
        (options.style === "luxus" || nameWords(input.name).length < 2)
      ),
  );
  if (!s.length) return null;
  const o = options.fullFamilies?.size
    ? s.filter((A: any) => !options.fullFamilies.has(getFont(A.key).family))
    : s;
  const l = o.length ? o : s;
  const u =
    options.kind === "icon"
      ? "icon"
      : options.kind === "monogram"
        ? "monogram"
        : "wordmark";
  if (
    (options.kind === "icon" && !input.themes.some((A) => A !== "initialen")) ||
    (options.kind === "monogram" && !monogramLetters(input)) ||
    (options.kind === "line" && !allowsRule(input)) ||
    (options.kind === "seal" &&
      (options.style === "luxus" ||
        !cleanText(input.suffix) ||
        cleanText(input.name).length > 22))
  )
    return null;
  const m = {
    style: options.style,
    kind: u,
    format: "full",
    input,
    markFree: true,
    scriptOk: allLongWords(nameWords(input.name)),
    plan: l,
    fontFormat: new Set(),
    used: options.recipeUse,
    taste: null,
    needDetail: options.kind === "wordmark",
    extra: options.plan.extra,
    pageSuffix: options.plan.suffix,
    typoUsage: options.typoUsage,
  };
  const h = (A: any) => {
    return options.nameUse?.get(A.key) ?? 0;
  };
  const p = options.nameUse
    ? [...new Set<number>(l.map(h))].sort((A, R) => A - R)
    : [Infinity];
  let g;
  let w = l;
  for (const A of p) {
    w = l.filter((L: any) => h(L) <= A);
    const R = w.some((L: any) => getFont(L.key).styles.includes(options.style));
    g =
      options.kind === "seal" || options.kind === "line"
        ? undefined
        : pickRecipe(r, {
            ...m,
            plan: w,
          });
    if (options.kind === "wordmark" ? g : R || A === p[p.length - 1]) break;
  }
  if (options.kind === "wordmark" && !g) return null;
  const x = g
    ? w.filter((A: any) => {
        return (
          recipeAcceptsFont(g, A) &&
          getFont(A.key).styles.includes(options.style) &&
          (!(RECIPE_EXTRA_STYLE as Record<string, any>)[g.typo] ||
            A.key === options.plan.extra?.key)
        );
      })
    : [];
  const y = w.filter((A: any) => getFont(A.key).styles.includes(options.style));
  const f: any = r.pick(x.length ? x : y.length ? y : w);
  const d = {
    name: f,
    suffix: options.plan.suffix,
    extra: options.plan.extra?.key === f.key ? options.plan.extra : null,
    planned: i,
    pageExtra: options.plan.extra,
  };
  const b = iconsForInput(
    input.themes,
    options.style,
    input.name,
    false,
    input,
  );
  const z = b.length ? r.pick(b) : undefined;
  const k = g
    ? g.layout
    : options.kind === "seal"
      ? "badge"
      : options.kind === "line"
        ? "wordmark"
        : r.pick(["inline", "stacked"]);
  let v = buildConcept(input, seed, {
    style: options.style,
    layout: k,
    slot: d,
    icon: z,
    palette: options.palette,
    mono: options.kind === "monogram",
    noSymbol:
      options.kind === "line" ||
      (options.kind === "wordmark" && k === "wordmark"),
    typoUsage: options.typoUsage,
    needDetail: options.kind === "wordmark",
    typoKind: g ? g.typo : options.kind === "line" ? "rule" : undefined,
    recipe: g,
  });
  if (options.kind === "seal") {
    v = withId(
      withLegalProximity(
        {
          ...v,
          badge: "seal",
        },
        input,
      ),
    );
  }
  if (options.kind === "line" && !v.typo?.rule && v.divider !== "line") {
    v = withId(
      withLegalProximity(
        repairConcept(
          {
            ...v,
            divider: "line",
          },
          input,
        ),
        input,
      ),
    );
  }
  if (v.recipeId) {
    options.recipeUse.set(
      v.recipeId,
      (options.recipeUse.get(v.recipeId) ?? 0) + 1,
    );
  }
  options.typoUsage.set(
    typoKind(v),
    (options.typoUsage.get(typoKind(v)) ?? 0) + 1,
  );
  return v;
}

export function nameCardKey(concept: LogoConcept) {
  if (concept.signature) return `sig|${templateBaseId(concept.signature.id)}`;
  const n =
    concept.layout === "wordmark" || !concept.symbol
      ? "ohne"
      : concept.layout === "badge"
        ? `badge-${concept.badge ?? "frame"}`
        : `${concept.symbol.kind}-${concept.layout}`;
  return `${lookKey(concept)}|${n}|${typoKind(concept)}`;
}
