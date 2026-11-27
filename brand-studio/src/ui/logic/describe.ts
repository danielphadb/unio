/**
 * Bezeichnungen für Layouts, Schriftklassen, Themen, Stile und eine Kurzbeschreibung je Logo.
 * Gesicherte Fassung: describe-Chunk.
 */
import { getFont } from "../../engine/fonts";
import { ALL_ICONS } from "../../symbols/Icons";

export const LAYOUT_LABELS: Record<string, any> = {
  inline: "Symbol links",
  stacked: "Symbol oben",
  wordmark: "Nur Schriftzug",
  badge: "Emblem",
};

export const FONT_CAT_LABELS: Record<string, any> = {
  serif: "Serif",
  sans: "Grotesk",
  display: "Display",
  script: "Schreibschrift",
};

export const THEME_LABELS = {
  haus: "Haus",
  dach: "Dach",
  schluessel: "Schlüssel",
  tuer: "Tür & Fenster",
  stadt: "Stadt",
  natur: "Natur",
  initialen: "Initialen",
  abstrakt: "Abstrakt",
};

export const ABSTRACT_THEMES = ["initialen", "abstrakt", "natur"];

export const HOUSE_THEMES = ["haus", "dach", "schluessel", "tuer", "stadt"];

export const STYLE_OPTIONS = [
  { key: "elegant", title: "Zeitlos-elegant", desc: "Klassisch, ruhig, vertrauensvoll." },
  { key: "modern", title: "Modern-klar", desc: "Reduziert, sachlich, präzise." },
  { key: "luxus", title: "Luxus", desc: "Exklusiv und edel, für Premium-Objekte." },
  { key: "warm", title: "Warm-nahbar", desc: "Freundlich, persönlich, offen." },
  { key: "mutig", title: "Mutig-urban", desc: "Kräftig, selbstbewusst, städtisch." },
  { key: "natur", title: "Natürlich-regional", desc: "Bodenständig, ländlich, verwurzelt." },
];

export const SURPRISE_OPTION = { title: "Überrasch mich", desc: "Bunt gemischt aus allen Stilen." };

export function symbolLabel(t: any) {
  if (!t.symbol || t.layout === "wordmark") return "ohne Symbol";
  if (t.symbol.kind === "monogram") return `Initialen ${t.symbol.letters}`;
  const e = t.symbol.id;
  return ALL_ICONS.find((s) => s.id === e)?.label ?? "Symbol";
}

export function fontCatLabel(t: any) {
  try {
    return FONT_CAT_LABELS[getFont(t.name.font.key).cat] ?? "Grotesk";
  } catch {
    return "Grotesk";
  }
}

export function fontFamilyLabel(t: any) {
  try {
    return getFont(t).family;
  } catch {
    return t;
  }
}

export const NAME_FORMAT_LABELS: Record<string, any> = {
  full: "Vor- und Nachname",
  upper: "In Versalien",
  surname: "Nachname und Zusatz",
  stacked: "Zweizeilig",
  initial: "Initial und Nachname",
  monogram: "Monogramm",
  district: "Mit Bezirk",
};

export function describeConcept(t: any, e: any) {
  const a = e ? `Logo-Konzept ${e}` : "Dein Logo";
  const s = t.symbol && t.layout !== "wordmark" ? `Symbol ${symbolLabel(t)}` : "nur Schriftzug";
  const r =
    t.nameFormat && t.nameFormat !== "full"
      ? `, Namensform ${NAME_FORMAT_LABELS[t.nameFormat]}`
      : "";
  return `${a}: ${s}, Schrift ${fontCatLabel(t)}, Farben ${t.palette.name}, ${LAYOUT_LABELS[t.layout]}${r}.`;
}
