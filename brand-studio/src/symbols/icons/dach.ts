/** Icons zum Thema "dach" (index-Chunk); `render` liefert SVG-Teile im 100er-Raster. */
import {
  circlePath,
  circleShape,
  fillPath,
  rectPath,
  roundedPolygon,
  strokePath,
} from "../geometry";

export const DACH_ICONS = [
  {
    id: "dach-fenster",
    label: "Dach mit Fenster",
    themes: ["dach", "haus"],
    styles: ["modern", "warm", "elegant"],
    keywords: ["dach", "fenster", "haus", "giebel", "zuhause"],
    form: "outline",
    render: (e: any) => {
      let i = "";
      for (const a of [0, 9.5 + 3]) {
        for (const o of [0, 9.5 + 3])
          i += rectPath(39 + a, 53 + o, 9.5, 9.5, 1);
      }
      return (
        strokePath("M11 60L50 24L89 60", e.main, 7.5) + fillPath(i, e.accent)
      );
    },
  },
  {
    id: "dach-doppelgiebel",
    label: "Doppelgiebel",
    themes: ["dach"],
    styles: ["modern", "elegant", "luxus"],
    keywords: ["dach", "giebel", "linien", "doppelt", "aufstieg"],
    form: "outline",
    render: (e: any) =>
      strokePath("M13 54L50 20L87 54", e.main) +
      strokePath("M13 80L50 46L87 80", e.main),
  },
  {
    id: "dach-sparren",
    label: "Gekreuzte Sparren",
    themes: ["dach", "haus"],
    styles: ["elegant", "natur", "warm"],
    keywords: ["dach", "sparren", "holz", "giebel", "kreuz", "zimmerei"],
    form: "outline",
    render: (e: any) =>
      strokePath("M13 82L55.5 27M87 82L44.5 27", e.main, 7.5) +
      circleShape(50, 62, 7, e.accent),
  },
  {
    id: "dach-tympanon",
    label: "Giebel mit Okulus",
    themes: ["dach", "stadt"],
    styles: ["elegant", "luxus"],
    keywords: [
      "giebel",
      "tympanon",
      "klassisch",
      "altbau",
      "palais",
      "rundfenster",
    ],
    form: "solid",
    render: (e: any) =>
      fillPath(
        roundedPolygon(
          [
            [50, 20],
            [92, 60],
            [8, 60],
          ],
          [3, 2, 2],
        ) + circlePath(50, 45, 7),
        e.main,
      ) + fillPath(rectPath(8, 67, 84, 9, 1.2), e.main),
  },
  {
    id: "dach-haeuserzeile",
    label: "Häuserzeile",
    themes: ["dach", "stadt", "haus"],
    styles: ["warm", "modern", "natur"],
    keywords: [
      "häuser",
      "reihenhaus",
      "siedlung",
      "dach",
      "nachbarschaft",
      "zeile",
    ],
    form: "outline",
    render: (e: any) =>
      strokePath(
        "M10 82V56L23 43L36 56V36L50 20L64 36V56L77 43L90 56V82ZM36 56V82M64 56V82",
        e.main,
        6.5,
      ),
  },
  {
    id: "dach-schornstein",
    label: "Dach mit Kamin",
    themes: ["dach", "haus"],
    styles: ["warm", "mutig", "modern"],
    keywords: ["dach", "kamin", "schornstein", "wärme", "heim", "zuhause"],
    form: "solid",
    render: (e: any) => {
      const t = (n: any) => 24 + ((n - 50) * 38) / 40;
      return (
        fillPath(
          roundedPolygon(
            [
              [9, 62],
              [50, 23],
              [91, 62],
              [91, 78],
              [50, 39],
              [9, 78],
            ],
            [1.5, 2.5, 1.5, 1.5, 0.5, 1.5],
          ),
          e.main,
        ) +
        fillPath(
          roundedPolygon(
            [
              [66, 20],
              [77, 20],
              [77, t(77) - 4.5],
              [66, t(66) - 4.5],
            ],
            [1.2, 1.2, 0, 0],
          ),
          e.main,
        )
      );
    },
  },
  {
    id: "dach-morgensonne",
    label: "Dach mit Sonne",
    themes: ["dach", "natur"],
    styles: ["warm", "natur"],
    keywords: ["sonne", "dach", "morgen", "licht", "horizont", "zuhause"],
    form: "outline",
    render: (e: any) =>
      strokePath("M10 54L50 18L90 54", e.main) +
      strokePath("M22 82H78", e.main) +
      fillPath("M33 74A17 17 0 0 1 67 74Z", e.accent),
  },
];
