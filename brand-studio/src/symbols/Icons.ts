/**
 * Alle Icons, Suche nach Themen/Stilen und das Zeichnen eines Symbols samt Rahmen (`renderSymbol`)
 * (index `qc`, `ST`, `wT`, `OL`, `IL`).
 */
import type { FontStore } from "../engine/fontStore";
import { ABSTRAKT_ICONS } from "./icons/abstrakt";
import { CONTAINERS } from "./containers";
import { DACH_ICONS } from "./icons/dach";
import { HAUS_ICONS } from "./icons/haus";
import { INITIALEN_ICONS } from "./icons/initialen";
import { NATUR_ICONS } from "./icons/natur";
import { SCHLUESSEL_ICONS } from "./icons/schluessel";
import { STADT_ICONS } from "./icons/stadt";
import { TUER_ICONS } from "./icons/tuer";
import { drawnMonogramSvg } from "./drawnMonogram";
import { fontMonogramSvg } from "./monogram";
import { getFont } from "../engine/fonts";

export const ALL_ICONS = [
  ...HAUS_ICONS,
  ...DACH_ICONS,
  ...SCHLUESSEL_ICONS,
  ...TUER_ICONS,
  ...STADT_ICONS,
  ...NATUR_ICONS,
  ...ABSTRAKT_ICONS,
  ...INITIALEN_ICONS,
];

export const CONTAINER_KEYS = CONTAINERS.map((e) => e.key);

export function getIcon(id: string) {
  const t = ALL_ICONS.find((n) => n.id === id);
  if (!t) throw new Error(`Unbekanntes Symbol: ${id}`);
  return t;
}

export function getContainer(key: string) {
  return CONTAINERS.find((t) => t.key === key) ?? CONTAINERS[0];
}

export function iconsFor(themes: readonly string[], styles: readonly string[]) {
  return ALL_ICONS.filter(
    (n) =>
      (themes.length === 0 || n.themes.some((r) => themes.includes(r))) &&
      (styles.length === 0 || n.styles.some((r) => styles.includes(r))),
  );
}

function fontCategory(key: string) {
  try {
    return getFont(key).cat;
  } catch {
    return "sans";
  }
}

/** Symbol (Icon oder Monogramm, auch gezeichnet) mit Rahmen als SVG-Teil (`IL`, Export `bi`). */
export function renderSymbol(
  symbol: any,
  colors: any,
  fonts: FontStore,
  filled: boolean = false,
) {
  const container = getContainer(symbol.container);
  const knockout = filled && container!.key !== "none";
  const artColors = knockout
    ? {
        main: colors.knockout,
        accent: colors.knockout,
        knockout: colors.main,
      }
    : colors;
  const inner = container!.inner;
  let art;
  if (symbol.kind === "icon") {
    const u = inner.w / 100;
    const c = getIcon(symbol.id).render(artColors);
    art =
      u === 1 && inner.x === 0 && inner.y === 0
        ? c
        : `<g transform="translate(${inner.x} ${inner.y}) scale(${u} ${inner.h / 100})">${c}</g>`;
  } else {
    const u = symbol.konstruktion;
    art =
      (u
        ? drawnMonogramSvg(
            fonts.get(symbol.font),
            `${symbol.font.key}@${symbol.font.weight}${symbol.font.style ?? ""}`,
            symbol.letters,
            inner,
            artColors.main,
            u,
          )
        : "") ||
      fontMonogramSvg(
        fonts.get(symbol.font),
        symbol.letters,
        inner,
        artColors.main,
        fontCategory(symbol.font.key),
      );
  }
  return container!.render(colors, knockout) + art;
}
