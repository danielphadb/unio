/**
 * Logo-Check: Punkte fuer Zeichen, Lesbarkeit in kleinen Groessen, Kontrast, Eigenstaendigkeit,
 * Balance, Komplexitaet, Schriften und Laenge; Gesamtwert 0 bis 100 (engine `jn`, Export `K`).
 */
import type { Lockup, LogoInput } from "./logoTypes";
import type { LogoConcept, Palette, SymbolTheme } from "../types";
import type { FontStore } from "./fontStore";
import { CAP, renderLogo, resolveColors } from "./renderLogo";
import { CLICHE_THEMES, COMMON_FONTS, getFont } from "./fonts";
import { antiPatterns, corpusTwin } from "./highend";
import { cleanText } from "./cleanText";
import { contrast } from "./color";
import { countShapes } from "./svg";
import { getContainer, getIcon, renderSymbol } from "../symbols/Icons";
import { missingChars } from "./charset";

const CHECK_SIZES = {
  horizontal: 120,
  stacked: 64,
  monogram: 16,
};

const DEFAULT_WIDTH = CHECK_SIZES.horizontal;

const MIN_CAP_HORIZONTAL = 6;

const MIN_CAP_STACKED = 4.5;

const MIN_MONOGRAM_PX = 7;

const MAX_ICON_SHAPES = 8;

const CHECK_WEIGHTS = {
  zeichen: 10,
  lesbarkeit: 20,
  kontrast: 16,
  eigenstaendigkeit: 16,
  balance: 11,
  komplexitaet: 9,
  schriften: 11,
  laenge: 7,
};

function capHeightAt(
  concept: LogoConcept,
  input: LogoInput,
  fonts: FontStore,
  width: number = DEFAULT_WIDTH,
  lockup: Lockup = "auto",
) {
  const a = renderLogo(concept, input, fonts, {
    lockup,
  });
  return a.width
    ? ((concept.layout === "badge" &&
      concept.badge === "seal" &&
      lockup !== "horizontal" &&
      cleanText(input.suffix) &&
      cleanText(input.name).length <= 22
        ? CAP * 0.62
        : CAP) *
        width) /
        a.width
    : 0;
}

function isClicheSymbol(concept: LogoConcept) {
  const n = concept.symbol;
  if (!n || concept.layout === "wordmark") return false;
  if (n.container === "house" || n.container === "shield") return true;
  if (n.kind !== "icon") return false;
  try {
    const t = getIcon(n.id);
    return (
      t.themes.some((r) => CLICHE_THEMES.includes(r as SymbolTheme)) &&
      !t.themes.includes("abstrakt")
    );
  } catch {
    return false;
  }
}

function monogramPx(concept: LogoConcept) {
  const n = concept.symbol;
  if (!n || n.kind !== "monogram" || concept.layout === "wordmark")
    return CHECK_SIZES.monogram * 0.9;
  const t = getContainer(n.container)!.inner;
  const r = Math.min(t.w, t.h) / 100;
  const i = Math.max(1, n.letters.length);
  return CHECK_SIZES.monogram * r * 0.9 * (i > 1 ? 0.7 : 1);
}

/** Logo-Check mit Punkten je Pruefung und Gesamtwert 0 bis 100 (`jn`, Export `K`). */
export function checkLogo(
  concept: LogoConcept,
  input: LogoInput,
  fonts: FontStore,
) {
  const r = [];
  const i = renderLogo(concept, input, fonts);
  const a = concept.palette;
  const s = !!cleanText(input.suffix);
  const o = cleanText(input.name);
  const l = new Set([
    ...missingChars(
      `${o}${o.toLocaleUpperCase("de-AT")}`,
      concept.name.font.key,
    ),
    ...(s
      ? missingChars(
          `${cleanText(input.suffix)}${cleanText(input.suffix).toLocaleUpperCase("de-AT")}`,
          concept.suffix.font.key,
        )
      : []),
    ...(concept.symbol?.kind === "monogram" && concept.layout !== "wordmark"
      ? missingChars(concept.symbol.letters, concept.symbol.font.key)
      : []),
  ]);
  const u = l.size === 0;
  r.push({
    key: "zeichen",
    label: "Alle Zeichen",
    pass: u,
    hint: u
      ? "Die Schriften enthalten alle Zeichen deines Namens."
      : `Der gewählten Schrift fehlen Zeichen (${[...l].join(" ")}). Sie werden aus einer Ersatzschrift gesetzt. Wähl eine Schrift, die deinen Namen vollständig enthält.`,
  });
  const m = capHeightAt(
    concept,
    input,
    fonts,
    CHECK_SIZES.horizontal,
    "horizontal",
  );
  const h = capHeightAt(concept, input, fonts, CHECK_SIZES.stacked, "stacked");
  let p = true;
  if (concept.symbol?.kind === "icon" && concept.layout !== "wordmark")
    try {
      const ie = renderSymbol(
        concept.symbol,
        {
          main: "#000000",
          accent: "#000000",
          knockout: "#FFFFFF",
        },
        fonts,
        !!concept.symbolFilled,
      );
      p = countShapes(ie) <= MAX_ICON_SHAPES;
    } catch {
      p = true;
    }
  else p = monogramPx(concept) >= MIN_MONOGRAM_PX;
  const g = concept.typo?.split;
  const w = concept.name.font.style === "italic" || g?.font?.style === "italic";
  const x = Math.min(concept.name.font.weight, g?.font?.weight ?? 999) <= 300;
  const y =
    (1 + (w ? 0.12 : 0) + (x ? 0.08 : 0)) *
    (Math.abs(concept.name.tracking) > 0.25 ? 1.05 : 1);
  const f = g?.scale && g.scale < 1 ? g.scale : 1;
  const d = (m * f) / y;
  const b = (h * f) / y;
  const z = [];
  if (d < MIN_CAP_HORIZONTAL * (f < 1 ? 0.8 : 1)) {
    z.push(`liegend bei ${CHECK_SIZES.horizontal} px`);
  }
  if (b < MIN_CAP_STACKED * (f < 1 ? 0.8 : 1)) {
    z.push(`gestapelt bei ${CHECK_SIZES.stacked} px`);
  }
  if (!p) {
    z.push(`als Monogramm bei ${CHECK_SIZES.monogram} px`);
  }
  const k = z.length === 0;
  r.push({
    key: "lesbarkeit",
    label: "Lesbarkeit in klein",
    pass: k,
    hint: k
      ? `Dein Logo bleibt in allen Formen lesbar: liegend ab ${CHECK_SIZES.horizontal} px, gestapelt ab ${CHECK_SIZES.stacked} px, Monogramm ab ${CHECK_SIZES.monogram} px.`
      : `Dein Logo wird ${z.join(", ")} schwer lesbar. Probier ein kürzeres Monogramm, eine kräftigere Schrift oder einen Zeilenumbruch im Namen.`,
  });
  const v = resolveColors(concept, "color");
  const M = resolveColors(concept, "reverse");
  const S = (ie: any) => [
    {
      part: "Name",
      hex: ie.name,
      on: true,
    },
    {
      part: "Zusatz",
      hex: ie.suffix,
      on: s,
    },
    {
      part: "Symbol",
      hex: ie.symbol,
      on: concept.layout !== "wordmark",
    },
    {
      part: "Akzent",
      hex: ie.divider,
      on: concept.divider !== "none",
    },
  ];
  const N = S(v)
    .filter((ie) => ie.on && contrast(ie.hex, v.ground) < 3)
    .map((ie) => ie.part);
  const A = S(M)
    .filter((ie) => ie.on && contrast(ie.hex, M.ground) < 3)
    .map((ie) => ie.part);
  const R = !N.length && !A.length && contrast(a.ink, a.paper) >= 7;
  r.push({
    key: "kontrast",
    label: "Farbkontrast",
    pass: R,
    hint: R
      ? "Alle Farben heben sich klar ab, auf hellem und auf dunklem Grund."
      : `${[...new Set([...N, ...A])].join(" und ")} heben sich ${N.length ? "auf hellem" : "auf dunklem"} Grund zu wenig ab. Wähl eine kräftigere Farbe oder eine andere Palette.`,
  });
  const L = getFont(concept.name.font.key);
  const E = COMMON_FONTS.includes(L.key);
  const I = isClicheSymbol(concept);
  const T =
    concept.layout !== "wordmark" && concept.symbol?.kind === "icon" && !I;
  const K = !E && L.cat !== "script";
  let F = true;
  let D =
    "Dein Logo hat eine eigene Handschrift: Schrift und Zeichen sieht man nicht bei jedem Makler.";
  if (E && I) {
    F = false;
    D =
      "Haus-Symbol und eine sehr verbreitete Schrift sieht man bei vielen Maklern. Probier eine eigenständigere Schrift oder lass das Symbol weg: Dein Name ist das stärkste Merkmal.";
  } else if (!T && !K) {
    F = false;
    D =
      "Kreis, Rahmen, Punkt oder Linie allein machen ein Logo noch nicht unverwechselbar. Eine charaktervolle Schrift für deinen Namen hilft mehr.";
  } else if (I) {
    D =
      "Die Schrift trägt, das Haus-Motiv ist allerdings ein häufiges Branchenmotiv. Ohne Symbol wirkt dein Name oft eigenständiger.";
  }
  r.push({
    key: "eigenstaendigkeit",
    label: "Eigenständigkeit",
    pass: F,
    hint: D,
  });
  const Y = i.height ? i.width / i.height : 0;
  const _ = {
    inline: [1.6, 7.5],
    stacked: [0.7, 4.2],
    wordmark: [1.4, 9],
    badge: [0.6, 3.2],
  };
  const [te, X] = _[concept.layout] ?? [0.6, 8];
  const O = Y >= te! && Y <= X!;
  r.push({
    key: "balance",
    label: "Proportionen",
    pass: O,
    hint: O
      ? "Das Logo ist ausgewogen und passt gut in Kopfzeilen, Schilder und Profilbilder."
      : Y > X!
        ? "Dein Logo ist sehr breit. Ein gestapeltes Layout oder ein Zeilenumbruch macht es kompakter."
        : "Dein Logo ist sehr hoch. Ein Layout mit Symbol links macht es breiter und ruhiger.",
  });
  let H = true;
  if (concept.symbol && concept.layout !== "wordmark")
    try {
      const ie = renderSymbol(
        concept.symbol,
        {
          main: "#000000",
          accent: "#000000",
          knockout: "#FFFFFF",
        },
        fonts,
        !!concept.symbolFilled,
      );
      const Ne = concept.symbol.kind === "monogram" ? 6e3 : 3500;
      H = ie.length <= Ne && countShapes(ie) <= 14;
    } catch {
      H = true;
    }
  r.push({
    key: "komplexitaet",
    label: "Einfaches Zeichen",
    pass: H,
    hint: H
      ? "Dein Zeichen ist klar und funktioniert auch als Favicon oder Stempel."
      : "Dein Zeichen hat viele Details, die in klein verschwimmen. Wähl eine ruhigere Bildmarke.",
  });
  const G = getFont(concept.suffix.font.key);
  const U = (ie: any) => ie === "script" || ie === "display";
  let J = true;
  let ee =
    "Die Schriften ergänzen sich: eine Charakterschrift für den Namen, eine ruhige für den Zusatz.";
  if (s && U(L.cat) && U(G.cat) && L.key !== G.key) {
    J = false;
    ee =
      "Zwei auffällige Schriften konkurrieren miteinander. Setz den Zusatz in eine ruhige Sans.";
  } else if (s && G.cat === "script") {
    J = false;
    ee =
      "Schreibschrift ist für den kleinen Zusatz schwer lesbar. Nimm eine schlichte Sans.";
  } else if (getFont(concept.body.key).body) {
    if (L.cat === "script" && concept.name.case === "upper") {
      J = false;
      ee =
        "Schreibschrift in Großbuchstaben ist schwer lesbar. Setz deinen Namen in normaler Schreibweise.";
    } else if (L.cat === "script") {
      ee =
        "Schreibschrift wirkt persönlich, ist aber in klein schwerer lesbar. Prüf dein Logo auch auf der Visitenkarte.";
    }
  } else {
    J = false;
    ee =
      "Die Fließtextschrift ist für längere Texte nicht ideal. Wähl eine gut lesbare Textschrift.";
  }
  r.push({
    key: "schriften",
    label: "Schriftharmonie",
    pass: J,
    hint: ee,
  });
  const Q = cleanText(input.name).length;
  const me = Q <= 24 || (concept.layout !== "inline" && Q <= 32);
  r.push({
    key: "laenge",
    label: "Namenslänge",
    pass: me,
    hint: me
      ? Q <= 14
        ? "Kurzer, einprägsamer Name, ideal für ein starkes Logo."
        : "Dein Name hat eine gute Länge für ein Logo."
      : 'Dein Name ist recht lang. Überleg, einen Teil in den Zusatz zu verschieben (z.B. "Immobilien").',
  });
  const fe = antiPatterns(concept, input);
  const he = corpusTwin(concept, input);
  r.push({
    key: "highend",
    label: "High-End",
    pass: !fe.length && !he,
    hint: he
      ? "Dein Logo kommt einer bekannten Marke sehr nahe. Wähl eine andere Schreibweise oder Schrift."
      : fe.length
        ? fe[0]!.hint
        : "Laufweite, Zusatz, Farben und Zeichen folgen den Regeln hochwertiger Marken.",
  });
  let oe = 0;
  for (const ie of r) {
    if (ie.pass) {
      oe += (CHECK_WEIGHTS as Record<string, any>)[ie.key] ?? 0;
    }
  }
  if (k && m < MIN_CAP_HORIZONTAL * 1.3) {
    oe -= 4;
  }
  if (O && (Y < te! * 1.15 || Y > X! * 0.85)) {
    oe -= 3;
  }
  if (F && I) {
    oe -= 6;
  }
  if (L.cat === "script") {
    oe -= 3;
  }
  oe -= Math.min(8, fe.length * 3) + (he ? 10 : 0);
  if (!u) {
    oe = Math.min(oe, 40);
  }
  return {
    score: Math.max(0, Math.min(100, Math.round(oe))),
    items: r,
  };
}

export const isFineWeight = (key: string, weight: number) => {
  const t = getFont(key);
  return (
    weight <= 300 ||
    (!!t.tags?.includes("fein") &&
      weight <= Math.min(...t.weights) &&
      weight <= 400)
  );
};
