/**
 * Rahmen um Zeichen (Kreis, Ring, Quadrat, Bogen, Schild, Sechseck, Raute, Hausumriss) mit Innenflaeche
 * (index-Chunk `fu`).
 */
import {
  ALL_STYLES,
  CONTAINER_STROKE,
  archPath,
  circlePath,
  fillAttr,
  hexagonPoints,
  housePoints,
  roundedPolygon,
  shieldPath,
  strokePath,
} from "./geometry";

export const CONTAINERS = [
  {
    key: "none",
    label: "Ohne",
    styles: [...ALL_STYLES],
    inner: {
      x: 0,
      y: 0,
      w: 100,
      h: 100,
    },
    render: () => "",
  },
  {
    key: "circle",
    label: "Kreis",
    styles: ["modern", "warm", "natur", "elegant"],
    inner: {
      x: 20,
      y: 20,
      w: 60,
      h: 60,
    },
    render: (e: any, t: any) =>
      t
        ? `<circle cx="50" cy="50" r="48" ${fillAttr(e.main)}/>`
        : strokePath(circlePath(50, 50, 46), e.main, CONTAINER_STROKE),
  },
  {
    key: "ring",
    label: "Doppelter Ring",
    styles: ["elegant", "luxus", "natur"],
    inner: {
      x: 24,
      y: 24,
      w: 52,
      h: 52,
    },
    render: (e: any, t: any) =>
      t
        ? `<circle cx="50" cy="50" r="48" ${fillAttr(e.main)}/>` +
          strokePath(circlePath(50, 50, 42.5), e.knockout, 1.6)
        : strokePath(circlePath(50, 50, 46.5), e.main, 3) +
          strokePath(circlePath(50, 50, 40.5), e.main, 1.4),
  },
  {
    key: "square",
    label: "Quadrat",
    styles: ["modern", "mutig"],
    inner: {
      x: 20,
      y: 20,
      w: 60,
      h: 60,
    },
    render: (e: any, t: any) =>
      t
        ? `<rect x="4" y="4" width="92" height="92" ${fillAttr(e.main)}/>`
        : `<rect x="6" y="6" width="88" height="88" fill="none" stroke="${e.main}" stroke-width="${CONTAINER_STROKE}"/>`,
  },
  {
    key: "rounded",
    label: "Abgerundet",
    styles: ["modern", "warm", "mutig"],
    inner: {
      x: 20,
      y: 20,
      w: 60,
      h: 60,
    },
    render: (e: any, t: any) =>
      t
        ? `<rect x="4" y="4" width="92" height="92" rx="24" ${fillAttr(e.main)}/>`
        : `<rect x="6" y="6" width="88" height="88" rx="22" fill="none" stroke="${e.main}" stroke-width="${CONTAINER_STROKE}"/>`,
  },
  {
    key: "arch",
    label: "Rundbogen",
    styles: ["elegant", "luxus", "warm", "natur"],
    inner: {
      x: 23,
      y: 32,
      w: 54,
      h: 54,
    },
    render: (e: any, t: any) =>
      t
        ? `<path d="${archPath(8, 92, 50, 96)}" ${fillAttr(e.main)}/>`
        : strokePath(archPath(10, 90, 50, 94), e.main, CONTAINER_STROKE),
  },
  {
    key: "shield",
    label: "Schild",
    styles: ["luxus", "elegant", "mutig"],
    inner: {
      x: 24,
      y: 20,
      w: 52,
      h: 52,
    },
    render: (e: any, t: any) =>
      t
        ? `<path d="${shieldPath(0)}" ${fillAttr(e.main)}/>`
        : strokePath(shieldPath(2.2), e.main, CONTAINER_STROKE),
  },
  {
    key: "hexagon",
    label: "Sechseck",
    styles: ["modern", "mutig", "natur"],
    inner: {
      x: 24,
      y: 24,
      w: 52,
      h: 52,
    },
    render: (e: any, t: any) =>
      t
        ? `<path d="${roundedPolygon(hexagonPoints(48), 5)}" ${fillAttr(e.main)}/>`
        : strokePath(
            roundedPolygon(hexagonPoints(46), 4),
            e.main,
            CONTAINER_STROKE,
          ),
  },
  {
    key: "diamond",
    label: "Raute",
    styles: ["luxus", "mutig", "elegant"],
    inner: {
      x: 29,
      y: 29,
      w: 42,
      h: 42,
    },
    render: (e: any, t: any) => {
      const n = (r: any) => [
        [50, 50 - r],
        [50 + r, 50],
        [50, 50 + r],
        [50 - r, 50],
      ];
      return t
        ? `<path d="${roundedPolygon(n(48), 7)}" ${fillAttr(e.main)}/>`
        : strokePath(roundedPolygon(n(46), 6), e.main, CONTAINER_STROKE);
    },
  },
  {
    key: "house",
    label: "Hausumriss",
    styles: ["warm", "modern", "natur"],
    inner: {
      x: 25,
      y: 36,
      w: 50,
      h: 50,
    },
    render: (e: any, t: any) =>
      t
        ? `<path d="${roundedPolygon(housePoints(50, 4, 42, 46, 96), [5, 4, 5, 5, 4])}" ${fillAttr(e.main)}/>`
        : strokePath(
            roundedPolygon(housePoints(50, 7, 43, 44, 94), [3, 3, 4, 4, 3]),
            e.main,
            CONTAINER_STROKE,
          ),
  },
];
