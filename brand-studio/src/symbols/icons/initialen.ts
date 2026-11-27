/** Icons zum Thema "initialen" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import { fillPath, housePoints, roundedPolygon, strokePath } from "../geometry";

export const INITIALEN_ICONS = [
  {
    id: "initial-a-giebel",
    label: "A als Giebel",
    themes: ["initialen", "dach"],
    styles: ["modern", "elegant", "mutig"],
    keywords: ["a", "buchstabe", "giebel", "dach", "initiale"],
    form: "outline",
    render: (e: any) =>
      strokePath("M16 88L50 14L84 88", e.main, 7.5) +
      strokePath("M26.5 68L50 50L73.5 68", e.accent, 7.5),
  },
  {
    id: "initial-m-giebel",
    label: "M aus zwei Giebeln",
    themes: ["initialen", "dach", "haus"],
    styles: ["modern", "warm", "mutig"],
    keywords: [
      "m",
      "buchstabe",
      "zwei häuser",
      "doppelhaus",
      "giebel",
      "initiale",
    ],
    form: "outline",
    render: (e: any) =>
      strokePath("M14 81V39L32 19L50 39L68 19L86 39V81", e.main),
  },
  {
    id: "initial-h-haus",
    label: "H mit Dach",
    themes: ["initialen", "haus"],
    styles: ["modern", "elegant", "warm"],
    keywords: ["h", "buchstabe", "haus", "dach", "initiale"],
    form: "outline",
    render: (e: any) =>
      strokePath("M12 50L50 16L88 50", e.main) +
      strokePath("M26 40V86M74 40V86M26 64H74", e.main),
  },
  {
    id: "initial-u-haus",
    label: "U mit Haus",
    themes: ["initialen", "haus"],
    styles: ["modern", "warm", "elegant"],
    keywords: [
      "u",
      "buchstabe",
      "haus",
      "geborgenheit",
      "hand",
      "initiale",
      "unio",
    ],
    form: "outline",
    render: (e: any) =>
      strokePath("M24 16V56A26 26 0 0 0 76 56V16", e.main, 8) +
      fillPath(roundedPolygon(housePoints(50, 32, 44, 12, 64), 1.2), e.accent),
  },
];
