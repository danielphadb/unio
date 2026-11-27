/**
 * Schriften der Oberfläche: Outfit für Text, Power Grotesk nur für Überschriften.
 * Gesicherte Fassung: index-Chunk (HC, WC, VC).
 */

export const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

export const LATIN_EXT_RANGE =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

export const UI_FONTS = [
  {
    family: "Power Grotesk",
    file: "ui/PowerGrotesk-Regular.woff2",
    format: "woff2",
    weight: "400",
  },
  { family: "Power Grotesk", file: "ui/PowerGrotesk-Medium.woff2", format: "woff2", weight: "500" },
  {
    family: "Outfit",
    file: "ui/outfit-latin-100-900.woff2",
    format: "woff2",
    weight: "300 600",
    range: LATIN_RANGE,
  },
  {
    family: "Outfit",
    file: "brand/outfit-latin-ext-400-normal.woff",
    format: "woff",
    weight: "300 500",
    range: LATIN_EXT_RANGE,
  },
  {
    family: "Outfit",
    file: "brand/outfit-latin-ext-600-normal.woff",
    format: "woff",
    weight: "600",
    range: LATIN_EXT_RANGE,
  },
  {
    family: "JetBrains Mono",
    file: "ui/jetbrains-mono-latin-400-normal.woff2",
    format: "woff2",
    weight: "400",
  },
  {
    family: "JetBrains Mono",
    file: "ui/jetbrains-mono-latin-500-normal.woff2",
    format: "woff2",
    weight: "500",
  },
];

export function fontFaceCss(base: any) {
  return UI_FONTS.map(
    (t) =>
      `@font-face{font-family:"${t.family}";src:url("${base}fonts/${t.file}") format("${t.format}");font-weight:${t.weight};font-style:normal;font-display:swap;${t.range ? `unicode-range:${t.range};` : ""}}`,
  ).join(`
`);
}

export function installUiFonts(base: any = "./") {
  const t = document.createElement("style");
  t.dataset.uiFonts = "";
  t.textContent = fontFaceCss(base);
  document.head.appendChild(t);
  for (const n of ["ui/outfit-latin-100-900.woff2", "ui/PowerGrotesk-Medium.woff2"]) {
    const r = document.createElement("link");
    r.rel = "preload";
    r.as = "font";
    r.type = "font/woff2";
    r.crossOrigin = "anonymous";
    r.href = `${base}fonts/${n}`;
    document.head.appendChild(r);
  }
}
