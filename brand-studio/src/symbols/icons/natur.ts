/** Icons zum Thema "natur" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import {
  add,
  circleShape,
  fillPath,
  housePoints,
  lensPath,
  lineIntersection,
  quadPoint,
  rectPath,
  rotatePoint,
  roundedPolygon,
  scale,
  splitLensPath,
  strokePath,
  thickPolyline,
  wavePath,
} from "../geometry";

function leafPath() {
  const e = [
    {
      apex: 8,
      top: 8,
      base: 33,
      k: 0.64,
    },
    {
      apex: 19,
      top: 37.5,
      base: 58,
      k: 0.7,
    },
    {
      apex: 30,
      top: 62.5,
      base: 82,
      k: 0.76,
    },
  ];
  let t = "";
  for (const n of e) {
    const r = (n.top - n.apex) * n.k;
    const s = (n.base - n.apex) * n.k;
    const i =
      r < 0.5
        ? [
            [50, n.top],
            [50 + s, n.base],
            [50 - s, n.base],
          ]
        : [
            [50 - r, n.top],
            [50 + r, n.top],
            [50 + s, n.base],
            [50 - s, n.base],
          ];
    t += roundedPolygon(i, 1.2);
  }
  return t + rectPath(46, 86, 8, 6, 0.8);
}

function branchPath() {
  const e = [8, 86];
  const t = [38, 16];
  const n = [68, 86];
  const r = 4.5;
  const s = (p: any) =>
    t[0]! - ((t[0]! - e[0]!) * (p - t[1]!)) / (e[1]! - t[1]!);
  const i = (p: any) =>
    t[0]! + ((n[0]! - t[0]!) * (p - t[1]!)) / (n[1]! - t[1]!);
  const a = (p: any) => [
    [s(40 + p), 40 + p],
    [31, 47 + p],
    [38, 40 + p],
    [45, 47 + p],
    [i(40 + p), 40 + p],
  ];
  const o = [t, ...a(-r / 2).reverse()];
  const l = [...a(r / 2), n, e];
  const u = [70, 38];
  const c = [92, 86];
  const f = [44, 86];
  const d = [0.915, -0.404];
  const h = add(t, scale(d, r));
  const m = add(n, scale(d, r));
  const x = lineIntersection(h, m, u, f);
  const k = lineIntersection(h, m, [0, 86], [100, 86]);
  return (
    roundedPolygon(o, [0.8, 0, 0, 0, 0, 0]) +
    roundedPolygon(l, 0) +
    roundedPolygon([u, c, k, x], [0.8, 0, 0, 0])
  );
}

function wavePaths(e: any) {
  const t = [30, 90];
  const n = [40, 46];
  const r = [70, 14];
  let s = "";
  const i = [
    {
      t: 0.3,
      side: 1,
    },
    {
      t: 0.42,
      side: -1,
    },
    {
      t: 0.6,
      side: 1,
    },
    {
      t: 0.72,
      side: -1,
    },
  ];
  for (const o of i) {
    const { p, tan } = quadPoint(t, n, r, o.t);
    const c = rotatePoint(tan, o.side * 48, [0, 0]);
    s += lensPath(p, add(p, scale(c, 24)), 10.5);
  }
  const a = quadPoint(t, n, r, 1);
  s += lensPath(a.p, add(a.p, scale(a.tan, 20)), 10);
  return fillPath(s, e);
}

export const NATUR_ICONS = [
  {
    id: "natur-haus-blatt",
    label: "Haus mit Blatt",
    themes: ["natur", "haus"],
    styles: ["natur", "warm", "modern"],
    keywords: ["haus", "blatt", "grün", "nachhaltig", "öko", "garten", "natur"],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(housePoints(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) +
          splitLensPath([36, 80], [64, 52], 20, 3.2),
        e.main,
      ),
  },
  {
    id: "natur-blattdach",
    label: "Blatt mit Dachlinien",
    themes: ["natur", "dach"],
    styles: ["natur", "warm", "elegant"],
    keywords: ["blatt", "dach", "nachhaltig", "grün", "wachstum", "natur"],
    form: "solid",
    render: (e: any) =>
      fillPath(
        lensPath([50, 8], [50, 92], 54) +
          thickPolyline(
            [
              [35, 47],
              [50, 33],
              [65, 47],
            ],
            5,
          ) +
          thickPolyline(
            [
              [31, 69],
              [50, 51],
              [69, 69],
            ],
            5,
          ) +
          thickPolyline(
            [
              [50, 70],
              [50, 84],
            ],
            5,
          ),
        e.main,
      ),
  },
  {
    id: "natur-huegel-sonne",
    label: "Hügel und Sonne",
    themes: ["natur"],
    styles: ["natur", "warm", "elegant"],
    keywords: ["hügel", "sonne", "landschaft", "land", "weinberg", "ruhe"],
    form: "outline",
    render: (e: any) =>
      circleShape(57, 31, 13, e.accent) +
      strokePath("M9 70C24 54 40 53 56 66M42 84C56 68 76 66 91 78", e.main),
  },
  {
    id: "natur-wellen",
    label: "Wellen",
    themes: ["natur", "abstrakt"],
    styles: ["natur", "modern", "elegant"],
    keywords: ["welle", "wasser", "donau", "see", "fluss", "meer", "ruhe"],
    form: "outline",
    render: (e: any) =>
      strokePath(
        wavePath(10, 90, 32, 40, 5) +
          wavePath(10, 90, 50, 40, 5) +
          wavePath(10, 90, 68, 40, 5),
        e.main,
      ),
  },
  {
    id: "natur-haus-wasser",
    label: "Wohnen am Wasser",
    themes: ["natur", "dach"],
    styles: ["natur", "elegant", "modern"],
    keywords: ["wasser", "see", "donau", "dach", "haus", "welle", "ufer"],
    form: "outline",
    render: (e: any) =>
      strokePath("M12 50L50 16L88 50", e.main) +
      strokePath(
        wavePath(18, 82, 66, 32, 4.5) + wavePath(18, 82, 83, 32, 4.5),
        e.accent,
      ),
  },
  {
    id: "natur-tanne",
    label: "Tanne",
    themes: ["natur"],
    styles: ["natur", "warm", "mutig"],
    keywords: ["tanne", "baum", "wald", "alpen", "natur", "berg", "land"],
    form: "solid",
    render: (e: any) => fillPath(leafPath(), e.main),
  },
  {
    id: "natur-berge",
    label: "Bergpanorama",
    themes: ["natur"],
    styles: ["natur", "mutig", "modern"],
    keywords: [
      "berg",
      "alpen",
      "gipfel",
      "panorama",
      "land",
      "tirol",
      "salzburg",
    ],
    form: "solid",
    render: (e: any) => fillPath(branchPath(), e.main),
  },
  {
    id: "natur-zweig",
    label: "Zweig",
    themes: ["natur"],
    styles: ["elegant", "luxus", "natur"],
    keywords: ["zweig", "olive", "blatt", "natur", "garten", "eleganz"],
    form: "solid",
    render: (e: any) =>
      strokePath("M30 90Q40 46 70 14", e.main, 4.5) + wavePaths(e.main),
  },
  {
    id: "natur-haus-baum",
    label: "Haus im Grünen",
    themes: ["natur", "dach", "haus"],
    styles: ["natur", "warm"],
    keywords: [
      "baum",
      "haus",
      "garten",
      "grün",
      "familie",
      "eigenheim",
      "land",
    ],
    form: "outline",
    render: (e: any) =>
      strokePath("M9 76H91M16 76V46L36 28L56 46V76M74 76V56", e.main) +
      circleShape(74, 45, 14, e.accent),
  },
];
