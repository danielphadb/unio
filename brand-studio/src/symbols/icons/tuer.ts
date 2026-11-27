/** Icons zum Thema "tuer" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import {
  archPath,
  circlePath,
  circleShape,
  fillPath,
  num,
  polar,
  rectPath,
  ringSegmentPath,
  roundedPolygon,
  strokePath,
} from "../geometry";

function doorRing(e: any, t: any, n: any, r: any) {
  const s = ((r / ((t + n) / 2)) * 180) / Math.PI;
  const i = (180 - 4 * s) / 5;
  let a = "";
  let o = "";
  for (let l = 0; l < 5; l++) {
    const u = 180 + l * (i + s);
    const c = ringSegmentPath(e, t, n, u, u + i);
    if (l === 2) {
      o = c;
    } else {
      a += c;
    }
  }
  return {
    side: a,
    key: o,
  };
}

export const TUER_ICONS = [
  {
    id: "tuer-gruenderzeit",
    label: "Gründerzeit-Portal",
    themes: ["tuer", "stadt"],
    styles: ["elegant", "luxus", "warm"],
    keywords: [
      "tür",
      "portal",
      "altbau",
      "gründerzeit",
      "wien",
      "eingang",
      "oberlicht",
    ],
    form: "outline",
    render: (e: any) => {
      const t = [50, 41];
      const n = [225, 270, 315]
        .map((r) => {
          const s = polar(t, 24, r);
          return `M50 41L${num(s[0]!)} ${num(s[1]!)}`;
        })
        .join("");
      return (
        strokePath(archPath(26, 74, 41, 87, false), e.main, 6) +
        strokePath("M26 41H74M50 41V87" + n, e.main, 6) +
        circleShape(44.5, 64, 2.6, e.accent) +
        circleShape(55.5, 64, 2.6, e.accent)
      );
    },
  },
  {
    id: "tuer-offen",
    label: "Offene Tür",
    themes: ["tuer", "haus"],
    styles: ["modern", "warm", "mutig"],
    keywords: ["tür", "offen", "willkommen", "eingang", "einzug", "zuhause"],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(
          [
            [20, 90],
            [20, 10],
            [80, 10],
            [80, 90],
            [70, 90],
            [70, 20],
            [30, 20],
            [30, 90],
          ],
          [0, 2.5, 2.5, 0, 0, 0.5, 0.5, 0],
        ),
        e.main,
      ) +
      fillPath(
        roundedPolygon(
          [
            [34.5, 24],
            [57, 31],
            [57, 83],
            [34.5, 90],
          ],
          0.8,
        ) + circlePath(51.5, 58, 2.8),
        e.main,
      ),
  },
  {
    id: "tuer-arkaden",
    label: "Arkaden",
    themes: ["tuer", "stadt"],
    styles: ["elegant", "luxus", "natur"],
    keywords: [
      "arkaden",
      "bogen",
      "säulengang",
      "innenhof",
      "palais",
      "architektur",
    ],
    form: "outline",
    render: (e: any) => {
      const t = 13.333333333333334;
      const n = [10, 10 + 2 * t, 10 + 4 * t, 90];
      const r = `M10 47A${num(t)} ${num(t)} 0 0 1 ${num(n[1]!)} 47A${num(t)} ${num(t)} 0 0 1 ${num(n[2]!)} 47A${num(t)} ${num(t)} 0 0 1 90 47`;
      return strokePath(
        "M10 83V17H90V83" + r + `M${num(n[1]!)} 47V83M${num(n[2]!)} 47V83`,
        e.main,
        6,
      );
    },
  },
  {
    id: "tuer-portal",
    label: "Portal mit Bögen",
    themes: ["tuer"],
    styles: ["elegant", "luxus", "modern"],
    keywords: ["portal", "bogen", "tür", "eingang", "tor", "durchgang"],
    form: "solid",
    render: (e: any) =>
      strokePath(archPath(17.5, 82.5, 48, 88, false), e.main, 7, "butt") +
      strokePath(archPath(29.5, 70.5, 48, 88, false), e.main, 7, "butt") +
      fillPath(archPath(38, 62, 48, 88), e.main),
  },
  {
    id: "tuer-sprossenfenster",
    label: "Sprossenfenster",
    themes: ["tuer", "haus"],
    styles: ["warm", "natur", "elegant"],
    keywords: ["fenster", "sprossen", "altbau", "licht", "aussicht", "wohnung"],
    form: "outline",
    render: (e: any) =>
      strokePath(rectPath(26, 9, 48, 66, 2.5), e.main) +
      strokePath("M50 9V75M26 31H74", e.main) +
      fillPath(rectPath(17, 82, 66, 8, 2), e.main),
  },
  {
    id: "tuer-torbogen",
    label: "Torbogen mit Schlussstein",
    themes: ["tuer", "stadt"],
    styles: ["elegant", "luxus", "natur"],
    keywords: [
      "torbogen",
      "schlussstein",
      "stein",
      "tor",
      "durchgang",
      "altbau",
    ],
    form: "solid",
    render: (e: any) => {
      const t = doorRing([50, 51], 22, 36, 3.5);
      return (
        fillPath(
          t.side +
            rectPath(14, 54.5, 14, 31.5, 0.8) +
            rectPath(72, 54.5, 14, 31.5, 0.8),
          e.main,
        ) + fillPath(t.key, e.accent)
      );
    },
  },
];
