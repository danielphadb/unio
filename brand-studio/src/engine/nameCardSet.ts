/**
 * Namenskarten mit finalen Logos (nameFinder-Chunk `Sd`, `Yd`, `Xd`, `rl`): je Name ein Logo,
 * abwechselnd Vorlage, Zeichen und Wortmarke, mit Schriftbudget je Seite (`pageFamilyLimit`),
 * Mindestqualitaet und Wechsel der Kartenflaeche; Ersatzkarte und Formen einer Karte.
 */
import type { LogoInput } from "./logoTypes";
import type { LogoConcept, StyleKey } from "../types";
import {
  ALL_TEMPLATES,
  KIT_TEMPLATES,
  fits,
  signatureConcept,
} from "../signature/index";
import { STYLES, conceptId } from "./catalog";
import {
  allowedMoods,
  kindMixOf,
  paletteBlocked,
  routedInput,
  splitByShares,
  templateBlocked,
  templateInRoute,
} from "./route";
import {
  basePalettes,
  moodOfPaletteId,
  moodsFor,
  paletteBaseId,
  paletteForMood,
} from "./palettes";
import {
  cardVariant,
  nameCardConcept,
  nameCardConcepts,
  nameCardFonts,
  nameCardKey,
} from "./nameCards";
import { cleanText } from "./cleanText";
import {
  fitsRoute,
  fontsNeeded,
  generateConcepts,
  hasSymbol,
  isShortBrandName,
  pickTemplateVariant,
  rankTemplates,
  templateConcept,
  templateWeight,
  withCardBackground,
} from "./generator";
import { fontCovers } from "./charset";
import { fontKey, getFont } from "./fonts";
import { hash, rng } from "./rng";
import { inputNameKind, nameInput, withRoute } from "./names/finder";
import { nameParts } from "../signature/nameParts";
import { qualityScore } from "./quality";
import { similarConcepts } from "./variations";
import { templateFonts } from "../signature/render";

const DEFAULT_MIN_QUALITY = 69;

function pageFamilyLimit(fontFiles: number) {
  return Math.max(4, Math.min(10, fontFiles - 4));
}

const CARD_BACKGROUND_CYCLE = ["paper", "ink", "primary", "paper"];

const KIT_TEMPLATE_IDS = new Set(KIT_TEMPLATES.map((e) => e.id));

function cardInput(name: any, input: LogoInput) {
  const n = name.kind ?? input.nameKind;
  return {
    ...input,
    name: cleanText(name.name),
    suffix: name.suffix !== undefined ? name.suffix : input.suffix,
    ...(n
      ? {
          nameKind: n,
        }
      : {}),
  };
}

function cardSet(names: any, rawInput: LogoInput, options: any) {
  if (!names.length) return [];
  const input = routedInput(rawInput);
  const fontFiles = Math.max(6, options.maxFontFiles);
  const rnd = rng(options.seed ^ 23068);
  const styles = input.styles.length ? input.styles : STYLES;
  const cardInputs = names.map((z: any) => cardInput(z, input));
  const familyLimitBase = pageFamilyLimit(fontFiles);
  const plan = nameCardFonts(
    {
      ...input,
      name: cardInputs.map((z: any) => z.name).join(" "),
      suffix: cardInputs.map((z: any) => cleanText(z.suffix)).join(" "),
    },
    options.seed,
    familyLimitBase,
  );
  const kinds: any[] = [];
  const mix = kindMixOf(input);
  if (mix) {
    const [z, F, T] = splitByShares(names.length, [
      mix.vorlage,
      mix.monogramm + mix.zeichen,
      mix.wortmarke,
    ]);
    const Q = [
      ...Array(z).fill("vorlage"),
      ...Array(F).fill("zeichen"),
      ...Array(T).fill("wortmarke"),
    ];
    kinds.push(...rnd.shuffle(Q));
  } else {
    for (let z = 0; kinds.length < names.length; z++)
      kinds.push(...rnd.shuffle(["vorlage", "zeichen", "wortmarke"]));
    kinds.length = names.length;
  }
  const cards = [];
  const usedFiles = new Set();
  const usedKeys = new Set();
  const usedTemplates = new Set();
  const usedSigns = new Set();
  const recipeUse = new Map();
  const typoUsage = new Map();
  const familyUse = new Map();
  let symbolCount = 0;
  const qualities: any[] = [];
  const minQuality = () => {
    if (qualities.length < 3) return DEFAULT_MIN_QUALITY;
    const z = qualities.slice().sort((F, T) => F - T);
    return z[Math.floor(z.length / 2)];
  };
  let previousPalette = "";
  const filesOf = (z: any, F: any) => fontsNeeded([z], "logo", F).map(fontKey);
  const planFiles = new Set(
    [...plan.names, plan.suffix, ...(plan.extra ? [plan.extra] : [])].map(
      fontKey,
    ),
  );
  const filesOk = (z: any) =>
    new Set([...usedFiles, ...planFiles, ...z]).size <=
    Math.max(fontFiles, planFiles.size);
  const familyLimit = Math.max(2, Math.ceil(names.length / familyLimitBase));
  const fullFamilies = () =>
    new Set(
      [...familyUse.keys()]
        .map((z) => getFont(z).family)
        .filter(
          (z) =>
            [...familyUse]
              .filter(([F]) => getFont(F).family === z)
              .reduce((F, [, T]) => F + T, 0) >= familyLimit,
        ),
    );
  const familyCount = (z: any) => {
    const F = getFont(z).family;
    let T = 0;
    for (const [Q, $] of familyUse) {
      if (getFont(Q).family === F) {
        T += $;
      }
    }
    return T;
  };
  for (let z = 0; z < names.length; z++) {
    const F = cardInputs[z];
    const T = styles[z % styles.length];
    const Q = CARD_BACKGROUND_CYCLE[z % CARD_BACKGROUND_CYCLE.length];
    const $ = (hash(`${F.name}|${z}`) ^ options.seed) >>> 0;
    let N = null;
    const se = [
      kinds[z],
      ...["wortmarke", "zeichen", "vorlage"].filter((O) => O !== kinds[z]),
    ];
    for (const O of se) {
      if (O === "vorlage")
        N = templateCard(
          F,
          T!,
          z,
          previousPalette,
          options,
          usedFiles,
          filesOk,
          usedTemplates,
          usedSigns,
          usedKeys,
          familyCount,
          familyLimit,
        );
      else {
        for (let J = 0; J < 6 && !N; J++) {
          const I = cardPalette(F, T!, ($ + J * 7919) >>> 0, previousPalette);
          const ie = ["monogram", "icon", "line", "seal"];
          const Y =
            O === "wortmarke" ? "wordmark" : ie[(symbolCount + J) % ie.length];
          const ne = nameCardConcept(F, ($ + J * 104729) >>> 0, {
            style: T,
            plan,
            kind: Y,
            palette: I,
            recipeUse,
            typoUsage,
            nameUse: familyUse,
            fullFamilies: fullFamilies(),
          });
          if (!ne) continue;
          const le = nameCardKey(ne);
          if (
            !(
              usedKeys.has(le) ||
              !filesOk(filesOf(ne, F)) ||
              paletteBaseId(ne.palette) === previousPalette ||
              familyCount(ne.name.font.key) >= familyLimit ||
              !fitsRoute(ne, F) ||
              (hasSymbol(ne) && qualityScore(ne, F) < minQuality())
            )
          ) {
            N = ne;
          }
        }
        if (N && O === "zeichen") {
          symbolCount++;
        }
      }
      if (N) break;
    }
    if (!N) {
      const O = [];
      for (let Y = 0; Y < 20; Y++) {
        const ne = ($ + Y * 15485863) >>> 0;
        for (const le of Y < 16
          ? ["wordmark", "line"]
          : ["wordmark", "monogram", "line"]) {
          const be = nameCardConcept(F, ne, {
            style: T,
            plan,
            kind: le,
            palette: cardPalette(F, T!, ne, previousPalette),
            recipeUse,
            typoUsage,
            nameUse: familyUse,
            fullFamilies: fullFamilies(),
          });
          if (be) {
            O.push(be);
          }
        }
      }
      const J = (Y: any) => filesOk(filesOf(Y, F));
      const I = O.filter((Y) => fitsRoute(Y, F));
      const ie = I.length ? I : O;
      N =
        ie.find((Y) => J(Y) && familyCount(Y.name.font.key) < familyLimit) ??
        ie.find(J) ??
        ie[0] ??
        null;
    }
    if (!N) throw new Error(`Keine Karte fuer ${F.name}`);
    if (!N.signature && !hasSymbol(N)) {
      qualities.push(qualityScore(N, F));
    }
    const X = withCardBackground(N, Q);
    for (const O of filesOf(X, F)) usedFiles.add(O);
    familyUse.set(X.name.font.key, (familyUse.get(X.name.font.key) ?? 0) + 1);
    usedKeys.add(nameCardKey(X));
    previousPalette = paletteBaseId(X.palette);
    cards.push(X);
  }
  return cards;
}

function cardPalette(
  input: LogoInput,
  style: string,
  seed: number,
  previous: string,
) {
  const u = rng(seed ^ 39454);
  const t = allowedMoods(moodsFor(input, style as StyleKey), input);
  let s = paletteForMood(u.pick(t), style as StyleKey, u);
  for (
    let d = 0;
    d < 8 && (paletteBaseId(s) === previous || paletteBlocked(s, input));
    d++
  )
    s = paletteForMood(u.pick(t), style as StyleKey, u);
  return s;
}

const SECOND_CUTS_ONLY_FIRST = new Set(["dmmono@300", "ebgaramond@400i"]);

function templateFontChoices(template: any, input: LogoInput) {
  const n = nameParts(input);
  const a = (i: any) => fontCovers(i.key, n.name, n.zusatz, n.ort);
  const u = (i: any, h: any) =>
    (i ?? []).filter(
      (l: any, c: any) =>
        a(l) && (h ? true : c === 0 || !SECOND_CUTS_ONLY_FIRST.has(fontKey(l))),
    );
  const t = [{}];
  const s = u(template.schriften.haupt, true).slice(0, 4);
  const d = template.schriften.paare
    ? []
    : u(template.schriften.neben, false).slice(0, 3);
  for (const i of s) {
    t.push({
      haupt: i,
    });
    for (const h of d)
      t.push({
        haupt: i,
        neben: h,
      });
  }
  return t;
}

function templateCard(
  input: LogoInput,
  style: string,
  index: number,
  previousPalette: string,
  options: any,
  usedFiles: any,
  filesOk: any,
  usedTemplates: any,
  usedSigns: any,
  usedKeys: any,
  familyUse: any,
  familyLimit: number,
) {
  const b = isShortBrandName(input);
  const w = ALL_TEMPLATES.filter(
    (A) =>
      (options.signatureEntwuerfe ? true : A.freigabe === "freigegeben") &&
      A.mischung !== false &&
      !usedTemplates.has(A.id) &&
      !usedSigns.has(A.merkmale.zeichen ?? "ohne") &&
      fits(A, input).passt &&
      !templateBlocked(A, input) &&
      templateInRoute(A, input),
  );
  if (!w.length) return null;
  const o = input.styles.filter((A) => A !== style);
  const p = rankTemplates(
    w,
    input,
    (options.seed ^ hash(`k${index}`)) >>> 0,
    (A) => (b && KIT_TEMPLATE_IDS.has(A.id) ? 0 : 1),
    (A) => templateWeight(A, input, [style as StyleKey, ...o]),
  ).map((A: any) => ({
    t: A,
  }));
  const v = basePalettes();
  let B: any = null;
  p.forEach(({ t: A }: any, P: any) => {
    if (P > 24) return;
    const q =
      options.signatureVarianten === false
        ? A
        : pickTemplateVariant(A, input, (options.seed ^ index) >>> 0, false);
    const V = q.farben.paletten;
    const E = V.filter((T: any) =>
      input.colorMoods.includes(moodOfPaletteId(T)!),
    );
    const H = (E.length ? E : V).filter((T: any) => T !== previousPalette);
    const y = H[(index + P) % Math.max(1, H.length)] ?? V[0];
    const K = v.find((T) => T.id.split("-")[0] === y) ?? v[0];
    if (paletteBaseId(K!) === previousPalette || paletteBlocked(K!, input))
      return;
    const W =
      input.styles.find((T) => q.passt.stile.includes(T)) ??
      (q.passt.stile.includes(style) ? style : undefined);
    const M = b && KIT_TEMPLATE_IDS.has(q.variante?.basis ?? q.id) ? 0 : 1;
    const z = new Set();
    for (const T of templateFontChoices(q, input)) {
      const Q = templateFonts(q, input, T);
      const $ = [Q.haupt, Q.neben, Q.akzent].map(fontKey).join("|");
      if (z.has($)) continue;
      z.add($);
      const N = Object.keys(T).length
        ? signatureConcept(q, input, K!, T, W as StyleKey | undefined)
        : templateConcept(q, input, K!, W);
      if (!N || usedKeys.has(nameCardKey(N)) || !fitsRoute(N, input)) continue;
      const se = fontsNeeded([N], "logo", input).map(fontKey);
      if (!filesOk(se)) continue;
      const X = se.filter((I) => !usedFiles.has(I)).length;
      const O = familyUse(Q.haupt.key);
      if (O >= familyLimit) continue;
      const J = X * 3 + O * 1.5 + P * 0.25 + (Object.keys(T).length ? 0.3 : 0);
      if (!B || M < B.kz || (M === B.kz && J < B.score)) {
        B = {
          c: N,
          t: q,
          score: J,
          kz: M,
        };
      }
    }
  });
  if (!B) return null;
  const x = B;
  usedTemplates.add(x.t.variante?.basis ?? x.t.id);
  usedSigns.add(x.t.merkmale.zeichen ?? "ohne");
  return x.c;
}

function withoutInlineSuffix(concept: LogoConcept) {
  if (!concept.typo?.inlineSuffix) return concept;
  const { inlineSuffix, ...n } = concept.typo;
  return refreshId({
    ...concept,
    typo: Object.keys(n).length ? n : undefined,
  });
}

export function nameCards(
  names: any,
  seed: number,
  styles: any,
  entwuerfe: boolean = false,
  routeParams?: any,
) {
  if (!names.length) return [];
  const t = withRoute(
    {
      name: "",
      styles,
      colorMoods: [],
      themes: [],
    },
    routeParams,
  );
  const s = names.map((d: any) => ({
    name: d.name,
    suffix: d.suffix ?? "",
    kind: inputNameKind(d.kind),
  }));
  return cardSet(s, t, {
    seed,
    maxFontFiles: 14,
    signatureEntwuerfe: entwuerfe,
  }).map(withoutInlineSuffix);
}

export function fallbackCard(
  name: any,
  index: number,
  seed: number,
  styles: any,
) {
  const u = index % 4;
  const t = nameCardConcepts(name.name, nameInput(name, styles), u + 1, seed);
  const s = t[u] ?? t[t.length - 1] ?? null;
  if (s?.typo?.inlineSuffix) {
    const { inlineSuffix, ...h } = s.typo;
    return refreshId({
      ...s,
      typo: Object.keys(h).length ? h : undefined,
    });
  }
  return s;
}

const refreshId = (concept: any) => ({
  ...concept,
  id: conceptId(concept),
});

export function cardForms(name: any, concept: LogoConcept, styles: any) {
  const a = nameInput(name, styles.length ? styles : [concept.style]);
  const u = generateConcepts(a, {
    count: 12,
    page: 0,
    seed: hash(`${name.id}|formen`),
  });
  const t = (p: any) =>
    p.find((v: any) => {
      return v.symbol?.kind === "icon" && v.layout === "inline";
    }) ??
    p.find((v: any) => {
      return v.symbol?.kind === "icon";
    });
  const s =
    t(u) ??
    t(
      similarConcepts(
        {
          ...concept,
          layout: "inline",
        },
        a,
        "symbol",
        12,
      ),
    );
  const d = u.find((p) => p.layout === "badge");
  const i = u.find((p) => {
    return p.symbol?.kind === "monogram";
  });
  const h = (p: any, v: Partial<LogoConcept> = {}) => {
    const B = concept.typo
      ? {
          ...concept.typo,
        }
      : undefined;
    if (B && (v.layout ?? p.layout) === "badge") {
      delete B.rule;
      if (B.split?.stack) {
        delete B.split;
      }
    }
    const { nameFormat, ...D } = p;
    return refreshId({
      ...D,
      name: concept.name,
      palette: concept.palette,
      colors: concept.colors,
      cardBackground: concept.cardBackground,
      typo: B && Object.keys(B).length ? B : undefined,
      ...v,
    });
  };
  const l = [
    {
      key: "schrift",
      label: "Schriftzug",
      concept,
      part: "full",
    },
  ];
  if (s) {
    l.push({
      key: "symbol",
      label: "Mit Symbol",
      concept: h(s, {
        layout: "inline",
      }),
      part: "full",
    });
  }
  let c = d ? h(d) : cardVariant(concept, a);
  if (c.typo?.split?.stack) {
    const { split, ...v } = c.typo;
    c = refreshId({
      ...c,
      typo: Object.keys(v).length ? v : undefined,
    });
  }
  l.push({
    key: "emblem",
    label: "Emblem",
    concept: c,
    part: "full",
  });
  if (i && i.symbol?.kind === "monogram") {
    l.push({
      key: "profil",
      label: "Profilbild",
      concept: h(i, {
        layout: "stacked",
        symbol: {
          ...i.symbol,
          container: "circle",
        },
      }),
      part: "symbol",
    });
  }
  return l;
}
