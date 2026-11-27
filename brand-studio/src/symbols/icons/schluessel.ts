/** Icons zum Thema "schluessel" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import {
  archPath,
  circlePath,
  fillPath,
  housePoints,
  keyholePath,
  polyPath,
  rectPath,
  roundedPolygon,
  strokePath,
} from "../geometry";

const keyBit = (e: any) => `<g transform="rotate(-45 50 50)">${e}</g>`;

export const SCHLUESSEL_ICONS = [
  {
    id: "schluessel-hausreide",
    label: "Schlüssel mit Hausreide",
    themes: ["schluessel", "haus"],
    styles: ["modern", "warm", "elegant"],
    keywords: ["schlüssel", "haus", "übergabe", "kauf", "einzug", "zuhause"],
    form: "outline",
    render: (e: any) =>
      strokePath(polyPath(housePoints(50, 9, 29, 21, 51)), e.main) +
      strokePath("M50 51V91M50 73H62M50 84H62", e.main),
  },
  {
    id: "schluesselloch-bogen",
    label: "Schlüsselloch im Bogen",
    themes: ["schluessel", "tuer"],
    styles: ["elegant", "luxus", "modern"],
    keywords: [
      "schlüsselloch",
      "bogen",
      "tür",
      "sicherheit",
      "vertrauen",
      "eingang",
    ],
    form: "solid",
    render: (e: any) =>
      fillPath(
        archPath(21, 79, 43, 88) + keyholePath(50, 48, 9.5, 25, 6.5),
        e.main,
      ),
  },
  {
    id: "schluessel-klassisch",
    label: "Klassischer Schlüssel",
    themes: ["schluessel"],
    styles: ["elegant", "luxus", "warm"],
    keywords: ["schlüssel", "klassisch", "vintage", "übergabe", "tradition"],
    form: "outline",
    render: (e: any) =>
      keyBit(
        strokePath(circlePath(50, 25, 15), e.main) +
          `<circle cx="50" cy="25" r="4.5" fill="${e.accent}"/>` +
          strokePath("M50 40V90M50 70H63V86H50", e.main),
      ),
  },
  {
    id: "haus-schluesselloch",
    label: "Haus mit Schlüsselloch",
    themes: ["schluessel", "haus"],
    styles: ["modern", "mutig", "warm"],
    keywords: ["haus", "schlüsselloch", "sicherheit", "eigentum", "zuhause"],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(housePoints(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) +
          keyholePath(50, 59, 9, 21, 6),
        e.main,
      ),
  },
  {
    id: "dach-schluesselloch",
    label: "Dach mit Schlüsselloch",
    themes: ["schluessel", "dach"],
    styles: ["modern", "elegant", "luxus"],
    keywords: ["dach", "schlüsselloch", "haus", "sicherheit", "makler"],
    form: "outline",
    render: (e: any) =>
      strokePath("M11 54L50 18L89 54", e.main, 7.5) +
      fillPath(keyholePath(50, 57, 10, 28, 7), e.accent),
  },
  {
    id: "schluessel-hausbart",
    label: "Schlüsselbart als Haus",
    themes: ["schluessel", "haus"],
    styles: ["modern", "mutig", "warm"],
    keywords: ["schlüssel", "bart", "haus", "übergabe", "einzug", "kauf"],
    form: "solid",
    render: (e: any) =>
      fillPath(circlePath(25, 61, 17) + circlePath(25, 61, 7), e.main) +
      fillPath(rectPath(38, 56, 54, 10, 3), e.main) +
      fillPath(
        roundedPolygon(housePoints(78, 24, 38, 14, 58), [1.5, 1, 0, 0, 1]) +
          rectPath(74.5, 40, 7, 7, 0.6),
        e.main,
      ),
  },
];
