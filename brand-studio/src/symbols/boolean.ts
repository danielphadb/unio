/**
 * Polygon-Operationen mit polygon-clipping 0.15.7: Glyphen in Ringe, Vereinigung, Differenz,
 * Schnitt, Verschiebung, Abtastung und Pfad-Ausgabe (index `G4` ... `wg`).
 */
import polygonClipping, { type Geom as PcGeom } from "polygon-clipping";
import type { Font } from "opentype.js";
import type { Geom } from "./types";

export function pathToRings(path: any, tolerance: number = 0.6) {
  const n: any[] = [];
  let r: any[] = [];
  let s = 0;
  let i = 0;
  let a = 0;
  let o = 0;
  const l = () => {
    if (r.length >= 3) {
      n.push(r);
    }
    r = [];
  };
  for (const u of path.commands) {
    if (u.type === "M") {
      l();
      s = a = u.x;
      i = o = u.y;
      r.push([s, i]);
    } else if (u.type === "L") {
      s = u.x;
      i = u.y;
      r.push([s, i]);
    } else if (u.type === "Q") {
      const c =
        Math.hypot(u.x1 - s, u.y1 - i) + Math.hypot(u.x - u.x1, u.y - u.y1);
      const f = Math.max(2, Math.ceil(c / tolerance));
      for (let d = 1; d <= f; d++) {
        const h = d / f;
        const m = 1 - h;
        r.push([
          m * m * s + 2 * m * h * u.x1 + h * h * u.x,
          m * m * i + 2 * m * h * u.y1 + h * h * u.y,
        ]);
      }
      s = u.x;
      i = u.y;
    } else if (u.type === "C") {
      const c =
        Math.hypot(u.x1 - s, u.y1 - i) +
        Math.hypot(u.x2 - u.x1, u.y2 - u.y1) +
        Math.hypot(u.x - u.x2, u.y - u.y2);
      const f = Math.max(3, Math.ceil(c / tolerance));
      for (let d = 1; d <= f; d++) {
        const h = d / f;
        const m = 1 - h;
        r.push([
          m * m * m * s +
            3 * m * m * h * u.x1 +
            3 * m * h * h * u.x2 +
            h * h * h * u.x,
          m * m * m * i +
            3 * m * m * h * u.y1 +
            3 * m * h * h * u.y2 +
            h * h * h * u.y,
        ]);
      }
      s = u.x;
      i = u.y;
    } else if (u.type === "Z") {
      s = a;
      i = o;
      l();
    }
  }
  l();
  return n.map((u) =>
    u.filter(
      (c: any, f: any) =>
        f === 0 ||
        Math.abs(c[0] - u[f - 1][0]) > 1e-6 ||
        Math.abs(c[1] - u[f - 1][1]) > 1e-6,
    ),
  );
}

function ringArea(ring: any) {
  let t = 0;
  for (let n = 0, r = ring.length - 1; n < ring.length; r = n++)
    t += (ring[r][0] + ring[n][0]) * (ring[r][1] - ring[n][1]);
  return t / 2;
}

export function geomArea(geom: Geom) {
  return geom.reduce(
    (t, n) =>
      t +
      n.reduce((r, s, i) => r + (i === 0 ? 1 : -1) * Math.abs(ringArea(s)), 0),
    0,
  );
}

export function ringsToGeom(rings: any) {
  if (!rings.length) return [];
  const t = rings.reduce((a: any, o: any) =>
    Math.abs(ringArea(o)) > Math.abs(ringArea(a)) ? o : a,
  );
  const n = Math.sign(ringArea(t)) || 1;
  const r = rings
    .filter((a: any) => Math.sign(ringArea(a)) === n)
    .map((a: any) => [a]);
  const s = rings
    .filter((a: any) => Math.sign(ringArea(a)) !== n)
    .map((a: any) => [a]);
  if (!r.length) return [];
  const i = r.length > 1 ? polygonClipping.union(r[0], ...r.slice(1)) : [r[0]];
  return s.length ? polygonClipping.difference(i, ...s) : i;
}

export function textGeom(
  font: Font,
  text: string,
  x: number,
  y: number,
  size: number,
  options: {
    kerning?: boolean;
    letterSpacing?: number;
  } = {},
) {
  return ringsToGeom(
    pathToRings(
      font.getPath(text, x, y, size, {
        kerning: options.kerning ?? true,
        letterSpacing: options.letterSpacing ?? 0,
      }),
    ),
  );
}

export const union = (geom: Geom, ...others: Geom[]) =>
  (others.length
    ? polygonClipping.union(geom as PcGeom, ...(others as PcGeom[]))
    : geom) as Geom;

export const difference = (geom: Geom, ...others: Geom[]) =>
  (others.length
    ? polygonClipping.difference(geom as PcGeom, ...(others as PcGeom[]))
    : geom) as Geom;

export const intersection = (geom: Geom, ...others: Geom[]) =>
  polygonClipping.intersection(geom as PcGeom, ...(others as PcGeom[])) as Geom;

export const xor = (geom: Geom, ...others: Geom[]) =>
  polygonClipping.xor(geom as PcGeom, ...(others as PcGeom[])) as Geom;

export const rectGeom = (x: number, y: number, w: number, h: number) => [
  [
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
      [x, y],
    ],
  ],
];

export const polygonGeom = (points: any) => [[[...points, points[0]]]];

export const translateGeom = (geom: Geom, dx: number, dy: number) =>
  geom.map((r) => r.map((s) => s.map(([i, a]) => [i! + dx, a! + dy])));

export const scaleGeom = (
  geom: Geom,
  factor: number,
  cx: number = 0,
  cy: number = 0,
) =>
  geom.map((s) =>
    s.map((i) =>
      i.map(([a, o]) => [cx + (a! - cx) * factor, cy + (o! - cy) * factor]),
    ),
  );

export function dilateGeom(geom: Geom, radius: number) {
  if (!geom.length) return geom;
  const n = [];
  for (let r = 0; r < 8; r++)
    n.push([
      Math.cos((r * Math.PI) / 4) * radius,
      Math.sin((r * Math.PI) / 4) * radius,
    ]);
  return polygonClipping.union(
    geom as PcGeom,
    ...n.map(([r, s]) => translateGeom(geom, r!, s!) as PcGeom),
  ) as Geom;
}

export function geomBounds(geom: Geom) {
  let t = Infinity;
  let n = Infinity;
  let r = -Infinity;
  let s = -Infinity;
  for (const i of geom) {
    for (const [a, o] of i[0] ?? []) {
      t = Math.min(t, a!);
      n = Math.min(n, o!);
      r = Math.max(r, a!);
      s = Math.max(s, o!);
    }
  }
  return isFinite(t)
    ? {
        x: t,
        y: n,
        w: r - t,
        h: s - n,
      }
    : null;
}

export function geomCentroid(geom: Geom) {
  let t = 0;
  let n = 0;
  let r = 0;
  for (const s of geom)
    s.forEach((i, a) => {
      const o = a === 0 ? 1 : -1;
      for (let l = 0, u = i.length - 1; l < i.length; u = l++) {
        const c = i[u]![0]! * i[l]![1]! - i[l]![0]! * i[u]![1]!;
        const f = (Math.sign(ringArea(i)) || 1) * o;
        t += (i[u]![0]! + i[l]![0]!) * c * f;
        n += (i[u]![1]! + i[l]![1]!) * c * f;
        r += c * f;
      }
    });
  if (Math.abs(r) < 1e-9) {
    const s = geomBounds(geom);
    return s ? [s.x + s.w / 2, s.y + s.h / 2] : [0, 0];
  }
  return [t / (3 * r), n / (3 * r)];
}

export function scanRow(geom: Geom, y: number) {
  const n = [];
  for (const s of geom) {
    for (const i of s) {
      for (let a = 0, o = i.length - 1; a < i.length; o = a++) {
        const [l, u] = i[o]! as [number, number];
        const [c, f] = i[a]! as [number, number];
        if ((u <= y && f > y) || (f <= y && u > y)) {
          n.push(l + ((y - u) / (f - u)) * (c - l));
        }
      }
    }
  }
  n.sort((s, i) => s - i);
  const r = [];
  for (let s = 0; s + 1 < n.length; s += 2) r.push([n[s], n[s + 1]]);
  return r;
}

function scanColumn(geom: Geom, x: number) {
  const n = geom.map((r) => r.map((s) => s.map(([i, a]) => [a, i])));
  return scanRow(n as Geom, x);
}

export function minStroke(geom: Geom, gaps: boolean = false) {
  const n = geomBounds(geom);
  if (!n) return 0;
  const r = [];
  const s = 48;
  for (let i = 1; i < s; i++) {
    const a = scanRow(geom, n.y + (n.h * i) / s);
    const o = scanColumn(geom, n.x + (n.w * i) / s);
    for (const l of [a, o]) {
      if (gaps)
        for (let u = 1; u < l.length; u++) r.push(l[u]![0]! - l[u - 1]![1]!);
      else for (const [u, c] of l) r.push(c! - u!);
    }
  }
  return r.length
    ? (r.sort((i, a) => i - a), r[Math.floor(r.length * 0.08)])
    : Infinity;
}

const fmt1 = (value: number) => String(Math.round(value * 10) / 10);

function simplifyRing(points: any, tolerance: number) {
  if (points.length < 4) return points;
  const n = new Uint8Array(points.length);
  n[0] = n[points.length - 1] = 1;
  const r = [[0, points.length - 1]];
  for (; r.length; ) {
    const [s, i] = r.pop()! as [number, number];
    const [a, o] = points[s];
    const [l, u] = points[i];
    const c = l - a;
    const f = u - o;
    const d = Math.hypot(c, f) || 1;
    let h = -1;
    let m = 0;
    for (let x = s + 1; x < i; x++) {
      const k =
        Math.abs(f * points[x][0] - c * points[x][1] + l * o - u * a) / d;
      if (k > m) {
        m = k;
        h = x;
      }
    }
    if (h >= 0 && m > tolerance) {
      n[h] = 1;
      r.push([s, h], [h, i]);
    }
  }
  return points.filter((s: any, i: any) => n[i]);
}

export function geomToPath(geom: Geom, tolerance: number = 0.12) {
  let n = "";
  for (const r of geom)
    r.forEach((s, i) => {
      const a = ringArea(s) > 0;
      const o = (i === 0) === a ? s : s.slice().reverse();
      const l = simplifyRing(o.slice(0, -1), tolerance);
      if (!(l.length < 3)) {
        n +=
          `M${fmt1(l[0][0])} ${fmt1(l[0][1])}` +
          l
            .slice(1)
            .map(([u, c]: any) => `L${fmt1(u)} ${fmt1(c)}`)
            .join("") +
          "Z";
      }
    });
  return n;
}
