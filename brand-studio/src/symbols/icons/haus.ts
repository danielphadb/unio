/** Icons zum Thema "haus" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import {
  circlePath,
  fillPath,
  heartPath,
  housePoints,
  rectPath,
  roundedPolygon,
  strokePath,
  tiledPolygons,
  translatePoints,
} from "../geometry";

function stackedHouse(e: any, t: any) {
  const n = roundedPolygon(
    [
      [50, 10],
      [91, 46],
      [9, 46],
    ],
    [2.5, 1.5, 1.5],
  );
  const r = 46 + t;
  const s = (90 - r - t * (e - 1)) / e;
  let i = n;
  for (let a = 0; a < e; a++) i += rectPath(17, r + a * (s + t), 66, s, 1.2);
  return i;
}

export const HAUS_ICONS = [
  {
    id: "haus-negativraum",
    label: "Haus im Negativraum",
    themes: ["haus", "abstrakt"],
    styles: ["modern", "mutig", "luxus"],
    keywords: ["haus", "negativ", "quadrat", "tor", "modern", "zuhause"],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(
          [
            [12, 12],
            [88, 12],
            [88, 88],
            [67, 88],
            [67, 54],
            [50, 37],
            [33, 54],
            [33, 88],
            [12, 88],
          ],
          [7, 7, 7, 0, 0, 0.6, 0, 0, 7],
        ),
        e.main,
      ),
  },
  {
    id: "haus-sprossenfenster",
    label: "Haus mit Sprossenfenster",
    themes: ["haus"],
    styles: ["warm", "modern", "natur"],
    keywords: ["haus", "fenster", "zuhause", "heim", "familie"],
    form: "solid",
    render: (e: any) => {
      let i = "";
      for (const a of [0, 10 + 3.5]) {
        for (const o of [0, 10 + 3.5])
          i += rectPath(38.25 + a, 54.25 + o, 10, 10, 1.2);
      }
      return fillPath(
        roundedPolygon(housePoints(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) +
          i,
        e.main,
      );
    },
  },
  {
    id: "haus-herz",
    label: "Haus mit Herz",
    themes: ["haus"],
    styles: ["warm", "natur"],
    keywords: ["haus", "herz", "liebe", "familie", "zuhause", "geborgenheit"],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(housePoints(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) +
          heartPath(50, 65, 30),
        e.main,
      ),
  },
  {
    id: "haus-etagen",
    label: "Haus aus Etagen",
    themes: ["haus", "abstrakt"],
    styles: ["modern", "mutig"],
    keywords: ["haus", "etagen", "streifen", "linien", "wohnbau", "stockwerk"],
    form: "solid",
    render: (e: any) => fillPath(stackedHouse(3, 5), e.main),
  },
  {
    id: "haus-offen",
    label: "Offenes Haus",
    themes: ["haus", "dach"],
    styles: ["elegant", "modern", "warm"],
    keywords: ["haus", "offen", "willkommen", "tür", "dach", "linie"],
    form: "outline",
    render: (e: any) =>
      strokePath("M9 51L50 14L91 51", e.main) +
      strokePath("M23 39V86H41M59 86H77V39", e.main),
  },
  {
    id: "haus-3d",
    label: "Haus in Schrägansicht",
    themes: ["haus", "abstrakt"],
    styles: ["modern", "mutig", "warm"],
    keywords: ["haus", "3d", "raum", "perspektive", "bau", "objekt"],
    form: "solid",
    render: (e: any) => {
      const n = translatePoints(
        [
          [10, 52],
          [28, 29],
          [46, 52],
          [46, 89],
          [10, 89],
        ],
        0,
        -9,
      );
      const r = translatePoints(
        [
          [28, 29],
          [74, 29],
          [92, 52],
          [46, 52],
        ],
        0,
        -9,
      );
      const s = translatePoints(
        [
          [46, 52],
          [92, 52],
          [92, 89],
          [46, 89],
        ],
        0,
        -9,
      );
      return fillPath(
        tiledPolygons([n, r, s], 4.5) + circlePath(28, 55, 5.5),
        e.main,
      );
    },
  },
  {
    id: "haus-villa",
    label: "Moderne Villa",
    themes: ["haus"],
    styles: ["modern", "luxus", "mutig"],
    keywords: [
      "villa",
      "modern",
      "bauhaus",
      "architektur",
      "flachdach",
      "luxus",
    ],
    form: "solid",
    render: (e: any) =>
      fillPath(
        rectPath(26, 16, 66, 34, 1.5) + rectPath(34.5, 24.5, 49, 17, 0.8),
        e.main,
      ) +
      fillPath(rectPath(8, 55, 58, 33, 1.5), e.main) +
      fillPath(rectPath(72, 55, 7, 33, 1), e.accent),
  },
  {
    id: "haus-standort",
    label: "Standort Haus",
    themes: ["haus", "stadt"],
    styles: ["modern", "warm", "mutig"],
    keywords: ["standort", "pin", "lage", "karte", "haus", "adresse"],
    form: "solid",
    render: (e: any) => {
      const i = Math.acos(0.5849056603773585);
      const a = 31 * Math.sin(i);
      const o = 39 + 31 * Math.cos(i);
      const l = `M50 92L${(50 - a).toFixed(2)} ${o.toFixed(2)}A31 31 0 1 1 ${(50 + a).toFixed(2)} ${o.toFixed(2)}Z`;
      return fillPath(
        l + roundedPolygon(housePoints(50, 22, 36, 15, 55), 1.2),
        e.main,
      );
    },
  },
];
