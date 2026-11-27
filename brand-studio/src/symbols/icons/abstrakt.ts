/** Icons zum Thema "abstrakt" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import {
  circleShape,
  fillPath,
  housePoints,
  num,
  rectPath,
  roundedPolygon,
  strokePath,
  tiledPolygons,
} from "../geometry";

function segmentRing(e: any, t: any, n: any) {
  const r = (n / 2) * Math.SQRT2;
  const s = (u: any) => {
    const c = u - 50;
    const f = (-c + Math.sqrt(2 * e * e - c * c)) / 2;
    const d = u + f;
    return {
      l: [50 - f, d],
      r: [50 + f, d],
      below: d > 50,
    };
  };
  const i = s(t - r);
  const a = s(t + r);
  const o = `M${num(i.l[0])} ${num(i.l[1])}L50 ${num(t - r)}L${num(i.r[0])} ${num(i.r[1])}A${e} ${e} 0 ${i.below ? 1 : 0} 0 ${num(i.l[0])} ${num(i.l[1])}Z`;
  const l = `M${num(a.l[0])} ${num(a.l[1])}L50 ${num(t + r)}L${num(a.r[0])} ${num(a.r[1])}A${e} ${e} 0 ${a.below ? 0 : 1} 1 ${num(a.l[0])} ${num(a.l[1])}Z`;
  return {
    cap: o,
    body: l,
  };
}

function spiralPoints(e: any, t: any, n: any) {
  const r = e * Math.tan(Math.PI / 6);
  const i = 50 - (2 * r + n * t) / 2 + r;
  const a = [
    [50, i - r],
    [50 + e, i],
    [50, i + r],
    [50 - e, i],
  ];
  const o = [];
  for (let l = 0; l < n; l++) {
    const u = l * t;
    const c = (l + 1) * t;
    o.push([
      [50 - e, i + u],
      [50, i + r + u],
      [50, i + r + c],
      [50 - e, i + c],
    ]);
    o.push([
      [50, i + r + u],
      [50 + e, i + u],
      [50 + e, i + c],
      [50, i + r + c],
    ]);
  }
  return {
    top: a,
    faces: o,
  };
}

export const ABSTRAKT_ICONS = [
  {
    id: "abstrakt-kreis-dach",
    label: "Kreis mit Dachfuge",
    themes: ["abstrakt", "dach"],
    styles: ["modern", "mutig", "warm"],
    keywords: ["kreis", "dach", "fuge", "geometrisch", "modern", "haus"],
    form: "solid",
    render: (e: any) => {
      const t = segmentRing(42, 34, 5.5);
      return fillPath(t.cap, e.main) + fillPath(t.body, e.main);
    },
  },
  {
    id: "abstrakt-quadrate",
    label: "Verschränkte Quadrate",
    themes: ["abstrakt"],
    styles: ["modern", "elegant", "luxus"],
    keywords: [
      "quadrate",
      "verbindung",
      "partner",
      "verschränkt",
      "geometrisch",
      "team",
    ],
    form: "outline",
    render: (e: any) =>
      strokePath(
        "M45 62H62V14H14V62H31M69 38H86V86H38V38H55",
        e.main,
        7,
        "butt",
        "miter",
      ),
  },
  {
    id: "abstrakt-linienbuendel",
    label: "Linienbündel",
    themes: ["abstrakt", "haus", "dach"],
    styles: ["modern", "elegant", "luxus"],
    keywords: ["linien", "bündel", "giebel", "haus", "minimal", "streifen"],
    form: "outline",
    render: (e: any) => {
      let t = "";
      for (let n = 14; n <= 86; n += 12)
        t += `M${n} 86V${14 + Math.abs(n - 50)}`;
      return strokePath(t, e.main, 6.5);
    },
  },
  {
    id: "abstrakt-diamant",
    label: "Diamant",
    themes: ["abstrakt"],
    styles: ["luxus", "elegant", "mutig"],
    keywords: ["diamant", "juwel", "luxus", "wert", "premium", "facetten"],
    form: "solid",
    render: (e: any) => {
      const t = [31, 17];
      const n = [69, 17];
      const r = [8, 40];
      const s = [92, 40];
      const i = [50, 89];
      const a = [31, 40];
      const o = [50, 40];
      const l = [69, 40];
      return fillPath(
        tiledPolygons(
          [
            [r, t, a],
            [t, o, a],
            [t, n, o],
            [n, l, o],
            [n, s, l],
            [r, a, i],
            [a, o, i],
            [o, l, i],
            [l, s, i],
          ],
          3.2,
        ),
        e.main,
      );
    },
  },
  {
    id: "abstrakt-quader",
    label: "Gestapelte Quader",
    themes: ["abstrakt", "stadt"],
    styles: ["modern", "mutig", "luxus"],
    keywords: [
      "quader",
      "bauträger",
      "projekt",
      "ebenen",
      "stockwerke",
      "entwicklung",
    ],
    form: "solid",
    render: (e: any) => {
      const t = spiralPoints(36, 13, 3);
      return fillPath(tiledPolygons([t.top, ...t.faces], 4.5), e.main);
    },
  },
  {
    id: "abstrakt-raum",
    label: "Raum",
    themes: ["abstrakt"],
    styles: ["modern", "elegant", "luxus"],
    keywords: ["raum", "ecken", "rahmen", "fläche", "minimal", "architektur"],
    form: "outline",
    render: (e: any) =>
      strokePath("M14 44V14H44M86 56V86H56", e.main, 7, "square", "miter") +
      circleShape(50, 50, 8.5, e.accent),
  },
  {
    id: "abstrakt-wuerfel",
    label: "Würfel",
    themes: ["abstrakt"],
    styles: ["modern", "mutig"],
    keywords: ["würfel", "kubus", "raum", "3d", "bau", "projekt"],
    form: "solid",
    render: (e: any) => {
      const t = spiralPoints(37, 42, 1);
      const n = tiledPolygons([t.top, ...t.faces], 4.5)
        .split("Z")
        .filter(Boolean);
      return (
        fillPath(n[0] + "Z", e.accent) +
        fillPath(n.slice(1).join("Z") + "Z", e.main)
      );
    },
  },
  {
    id: "abstrakt-raute-haus",
    label: "Raute mit Haus",
    themes: ["abstrakt", "haus"],
    styles: ["mutig", "modern", "luxus"],
    keywords: ["raute", "haus", "diamant", "negativ", "geometrisch"],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(
          [
            [50, 7],
            [93, 50],
            [50, 93],
            [7, 50],
          ],
          6,
        ) +
          roundedPolygon(
            housePoints(50, 31, 46, 15, 68),
            [1, 0.8, 0.8, 0.8, 0.8],
          ),
        e.main,
      ),
  },
  {
    id: "abstrakt-kreissegmente",
    label: "Kreissegmente",
    themes: ["abstrakt", "natur"],
    styles: ["modern", "elegant", "mutig"],
    keywords: [
      "kreis",
      "segmente",
      "geometrisch",
      "bauhaus",
      "quadrat",
      "blatt",
    ],
    form: "solid",
    render: (e: any) =>
      fillPath(
        "M47 47H9A38 38 0 0 1 47 9Z" +
          rectPath(53, 9, 38, 38, 1.5) +
          rectPath(9, 53, 38, 38, 1.5),
        e.main,
      ) + fillPath("M53 53H91A38 38 0 0 1 53 91Z", e.accent),
  },
];
