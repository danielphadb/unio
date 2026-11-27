/** Icons zum Thema "stadt" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import type { Pt } from "../types";
import {
  archPath,
  circlePath,
  circleShape,
  fillPath,
  num,
  polar,
  polyPath,
  rectPath,
  roundedPolygon,
  strokePath,
} from "../geometry";

function windowGrid(e: any, t: any, n: any, r: any) {
  const s = Math.acos(n / (r - t));
  const i = n * Math.sin(s);
  const a = t + n * Math.cos(s);
  return `M${num(e)} ${num(r)}L${num(e - i)} ${num(a)}A${num(n)} ${num(n)} 0 1 1 ${num(e + i)} ${num(a)}Z`;
}

function skylinePoints(e: any, t: any, n: any, r: any, s: any) {
  const i = 1 - s;
  return [
    i * i * i * e[0] +
      3 * i * i * s * t[0] +
      3 * i * s * s * n[0] +
      s * s * s * r[0],
    i * i * i * e[1] +
      3 * i * i * s * t[1] +
      3 * i * s * s * n[1] +
      s * s * s * r[1],
  ];
}

export const STADT_ICONS = [
  {
    id: "stadt-silhouette",
    label: "Stadtsilhouette",
    themes: ["stadt"],
    styles: ["modern", "mutig", "warm"],
    keywords: [
      "stadt",
      "skyline",
      "silhouette",
      "wien",
      "urban",
      "kuppel",
      "turm",
    ],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(
          [
            [9, 88],
            [9, 62],
            [18.5, 52],
            [28, 62],
            [28, 88],
          ],
          [0, 0.8, 1, 0.8, 0],
        ) +
          rectPath(32, 28, 15, 60, 0.8) +
          "M51 88V57A10 10 0 0 1 71 57V88Z" +
          roundedPolygon(
            [
              [75, 88],
              [75, 38],
              [82.5, 12],
              [90, 38],
              [90, 88],
            ],
            [0, 0.5, 0.8, 0.5, 0],
          ),
        e.main,
      ),
  },
  {
    id: "stadt-dom",
    label: "Domspitze",
    themes: ["stadt"],
    styles: ["elegant", "luxus", "mutig"],
    keywords: [
      "dom",
      "turm",
      "spitze",
      "wien",
      "gotik",
      "innenstadt",
      "zentrum",
    ],
    form: "solid",
    render: (e: any) => {
      const t = (n: any, r: any, s: any, i: any) =>
        polyPath([
          [n, r - i],
          [n + s, r],
          [n, r + i],
          [n - s, r],
        ]);
      return (
        fillPath(
          roundedPolygon(
            [
              [50, 8],
              [58, 44],
              [58, 88],
              [42, 88],
              [42, 44],
            ],
            [0.6, 0.6, 0, 0, 0.6],
          ) + archPath(46.5, 53.5, 62, 76),
          e.main,
        ) +
        fillPath(
          roundedPolygon(
            [
              [12, 88],
              [12, 70],
              [37, 48],
              [37, 88],
            ],
            [0, 1, 0.6, 0],
          ) + t(25, 74, 4.2, 6.5),
          e.main,
        ) +
        fillPath(
          roundedPolygon(
            [
              [63, 48],
              [88, 70],
              [88, 88],
              [63, 88],
            ],
            [0.6, 1, 0, 0],
          ) + t(75, 74, 4.2, 6.5),
          e.main,
        )
      );
    },
  },
  {
    id: "stadt-tuerme",
    label: "Drei Türme",
    themes: ["stadt"],
    styles: ["modern", "mutig", "luxus"],
    keywords: [
      "hochhaus",
      "türme",
      "skyline",
      "modern",
      "projekt",
      "bauträger",
      "büro",
    ],
    form: "solid",
    render: (e: any) => {
      const t = (n: any, r: any) =>
        roundedPolygon(
          [
            [n, r],
            [n + 20, r - 9],
            [n + 20, 88],
            [n, 88],
          ],
          [1, 1, 0, 0],
        );
      return fillPath(t(14, 47) + t(40, 22) + t(66, 58), e.main);
    },
  },
  {
    id: "stadt-bruecke",
    label: "Brücke",
    themes: ["stadt", "natur"],
    styles: ["modern", "elegant", "natur"],
    keywords: ["brücke", "donau", "fluss", "verbindung", "wasser", "stadt"],
    form: "outline",
    render: (e: any) => {
      const t = [
        [18, 52],
        [30, 14],
        [70, 14],
        [82, 52],
      ];
      let n = "";
      for (const r of [0.25, 0.5, 0.75]) {
        const s = skylinePoints(...(t as [Pt, Pt, Pt, Pt]), r);
        n += `M${num(s[0]!)} ${num(s[1]!)}V52`;
      }
      return (
        strokePath("M18 52C30 14 70 14 82 52" + n, e.main, 6) +
        strokePath("M8 52H92M18 52V72M82 52V72", e.main, 6) +
        strokePath("M12 84Q21.5 78 31 84T50 84T69 84T88 84", e.accent, 6)
      );
    },
  },
  {
    id: "stadt-riesenrad",
    label: "Riesenrad",
    themes: ["stadt"],
    styles: ["warm", "mutig", "elegant"],
    keywords: ["riesenrad", "prater", "wien", "freizeit", "rad", "wahrzeichen"],
    form: "outline",
    render: (e: any) => {
      const t = [50, 38];
      let n = "";
      let r = "";
      for (let s = 0; s < 8; s++) {
        const i = polar(t, 27, s * 45 + 22.5);
        n += `M50 38L${num(i[0]!)} ${num(i[1]!)}`;
        r += circlePath(i[0]!, i[1]!, 4);
      }
      return (
        strokePath(n, e.main, 3.5) +
        strokePath(circlePath(50, 38, 27), e.main, 6) +
        fillPath(r, e.main) +
        strokePath("M50 38L33 88M50 38L67 88M24 88H76", e.main, 6) +
        circleShape(50, 38, 5, e.accent)
      );
    },
  },
  {
    id: "stadt-fassade",
    label: "Altbau-Fassade",
    themes: ["stadt", "haus"],
    styles: ["elegant", "warm", "luxus"],
    keywords: [
      "altbau",
      "fassade",
      "zinshaus",
      "gründerzeit",
      "wien",
      "wohnung",
      "fenster",
    ],
    form: "solid",
    render: (e: any) => {
      let t = "";
      for (const n of [26, 45.5, 65]) {
        t += archPath(n, n + 9, 38.5, 48);
        t += rectPath(n, 55, 9, 12, 0.6);
        t += rectPath(n, 73, 9, 12, 0.6);
      }
      return (
        fillPath(rectPath(12, 12, 76, 8, 1.2), e.main) +
        fillPath(rectPath(17, 24, 66, 66, 0.8) + t, e.main)
      );
    },
  },
  {
    id: "stadt-kompass",
    label: "Kompass",
    themes: ["stadt", "abstrakt"],
    styles: ["modern", "elegant", "natur"],
    keywords: [
      "kompass",
      "orientierung",
      "richtung",
      "lage",
      "navigation",
      "beratung",
    ],
    form: "outline",
    render: (e: any) =>
      strokePath(circlePath(50, 50, 38), e.main, 6) +
      fillPath(
        polyPath([
          [50, 20],
          [58.5, 50],
          [41.5, 50],
        ]),
        e.accent,
      ) +
      fillPath(
        polyPath([
          [41.5, 50],
          [58.5, 50],
          [50, 80],
        ]),
        e.main,
      ),
  },
  {
    id: "stadt-treppe",
    label: "Treppe",
    themes: ["stadt", "abstrakt"],
    styles: ["modern", "mutig"],
    keywords: [
      "treppe",
      "stufen",
      "aufstieg",
      "wachstum",
      "treppenhaus",
      "wertsteigerung",
    ],
    form: "outline",
    render: (e: any) =>
      strokePath(
        "M12 82H28V66H44V50H60V34H76V18H88",
        e.main,
        7.5,
        "square",
        "miter",
      ),
  },
  {
    id: "stadt-standort",
    label: "Standort",
    themes: ["stadt"],
    styles: ["modern", "warm", "natur"],
    keywords: ["standort", "pin", "lage", "karte", "adresse", "region"],
    form: "outline",
    render: (e: any) =>
      strokePath(windowGrid(50, 38, 27, 90), e.main) +
      circleShape(50, 38, 9, e.accent),
  },
];
