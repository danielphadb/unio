/**
 * Geometrie-Helfer der Symbole (index-Chunk): Zahlen, Punkte, abgerundete Polygone, Kreise, Boegen,
 * Striche und Flaechen im 100er-Raster.
 */
import type { Pt } from "./types";

const STROKE = 7;

export function num(value: number) {
  const t = Math.round(value * 100) / 100;
  return (Object.is(t, -0) ? 0 : t).toString();
}

const pt = (p: Pt) => `${num(p[0]!)} ${num(p[1]!)}`;

export function polyPath(points: Pt[], close: boolean = true) {
  return (
    points.map((n, r) => (r ? "L" : "M") + pt(n)).join("") + (close ? "Z" : "")
  );
}

export function roundedPolygon(points: Pt[], radius: any) {
  const n = points.length;
  let r = "";
  for (let s = 0; s < n; s++) {
    const i = points[(s - 1 + n) % n];
    const a = points[s];
    const o = points[(s + 1) % n];
    const l = Array.isArray(radius) ? (radius[s] ?? 0) : radius;
    const u = unit(sub(i!, a!));
    const c = unit(sub(o!, a!));
    const f = dist(i!, a!);
    const d = dist(o!, a!);
    const h = Math.max(-1, Math.min(1, u[0]! * c[0]! + u[1]! * c[1]!));
    const m = Math.acos(h);
    if (l <= 0 || m < 0.001 || Math.abs(Math.PI - m) < 0.001) {
      r += (s ? "L" : "M") + pt(a!);
      continue;
    }
    let x = l / Math.tan(m / 2);
    x = Math.min(x, f / 2, d / 2);
    const k = x * Math.tan(m / 2);
    const p = add(a!, scale(u, x));
    const g = add(a!, scale(c, x));
    const v =
      (a![0]! - i![0]!) * (o![1]! - a![1]!) -
      (a![1]! - i![1]!) * (o![0]! - a![0]!);
    r +=
      (s ? "L" : "M") +
      pt(p) +
      `A${num(k)} ${num(k)} 0 0 ${v > 0 ? 1 : 0} ` +
      pt(g);
  }
  return r + "Z";
}

export function rectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number = 0,
) {
  const i = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  return radius > 0 ? roundedPolygon(i, radius) : polyPath(i);
}

export function circlePath(cx: number, cy: number, radius: number) {
  return `M${num(cx - radius)} ${num(cy)}A${num(radius)} ${num(radius)} 0 1 0 ${num(cx + radius)} ${num(cy)}A${num(radius)} ${num(radius)} 0 1 0 ${num(cx - radius)} ${num(cy)}Z`;
}

export function strokePath(
  d: string,
  color: string,
  width: number = STROKE,
  cap: string = "round",
  join: string = "round",
) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${num(width)}" stroke-linecap="${cap}" stroke-linejoin="${join}"/>`;
}

export function fillPath(d: string, color: string) {
  return `<path d="${d}" fill="${color}" fill-rule="evenodd"/>`;
}

export function circleShape(
  cx: number,
  cy: number,
  radius: number,
  color: string,
) {
  return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(radius)}" fill="${color}"/>`;
}

export const add = (a: Pt, b: Pt) => [a[0]! + b[0]!, a[1]! + b[1]!];

const sub = (a: Pt, b: Pt) => [a[0]! - b[0]!, a[1]! - b[1]!];

export const scale = (a: Pt, f: number) => [a[0]! * f, a[1]! * f];

const dist = (a: Pt, b: Pt) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!);

const lerp = (a: Pt, b: Pt, f: number) => [
  a[0]! + (b[0]! - a[0]!) * f,
  a[1]! + (b[1]! - a[1]!) * f,
];

function unit(v: Pt) {
  const t = Math.hypot(v[0]!, v[1]!) || 1;
  return [v[0]! / t, v[1]! / t];
}

export function rotatePoint(p: Pt, deg: number, center: Pt = [50, 50]) {
  const r = (deg * Math.PI) / 180;
  const s = p[0]! - center[0]!;
  const i = p[1]! - center[1]!;
  return [
    center[0]! + s * Math.cos(r) - i * Math.sin(r),
    center[1]! + s * Math.sin(r) + i * Math.cos(r),
  ];
}

export const translatePoints = (points: Pt[], dx: number, dy: number) =>
  points.map((r) => [r[0]! + dx, r[1]! + dy]);

export function polar(center: Pt, radius: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  return [center[0]! + radius * Math.cos(r), center[1]! + radius * Math.sin(r)];
}

function signedArea(points: Pt[]) {
  let t = 0;
  for (let n = 0; n < points.length; n++) {
    const r = points[n];
    const s = points[(n + 1) % points.length];
    t += r![0]! * s![1]! - s![0]! * r![1]!;
  }
  return t / 2;
}

function intersectLines(p: Pt, d: Pt, q: Pt, e: Pt) {
  const s = d[0]! * e[1]! - d[1]! * e[0]!;
  if (Math.abs(s) < 1e-9) return null;
  const i = ((q[0]! - p[0]!) * e[1]! - (q[1]! - p[1]!) * e[0]!) / s;
  return [p[0]! + d[0]! * i, p[1]! + d[1]! * i];
}

function offsetPolygon(points: Pt[], offsets: any) {
  const n = points.length;
  const r = signedArea(points) > 0;
  const s = points.map((i, a) => {
    const o = points[(a + 1) % n];
    const l = unit(sub(o!, i));
    const u = r ? [-l[1]!, l[0]] : [l[1], -l[0]!];
    const c = Array.isArray(offsets) ? offsets[a] : offsets;
    return {
      o: add(i, scale(u as Pt, c as number)),
      dir: l,
      nrm: u,
      di: c,
    };
  });
  return points.map((i, a) => {
    const o = s[(a - 1 + n) % n];
    const l = s[a];
    return (
      intersectLines(o!.o, o!.dir, l!.o, l!.dir) ??
      add(i, scale(l!.nrm as Pt, l!.di))
    );
  });
}

function onSegment(p: Pt, a: Pt, b: Pt) {
  const r = sub(b, a);
  const s = r[0]! * r[0]! + r[1]! * r[1]!;
  if (s < 1e-9) return false;
  const i = ((p[0]! - a[0]!) * r[0]! + (p[1]! - a[1]!) * r[1]!) / s;
  return i < -1e-6 || i > 1 + 1e-6
    ? false
    : dist(p, add(a, scale(r, i))) < 0.05;
}

export function tiledPolygons(polys: Pt[][], gap: number, radius: number = 0) {
  return polys
    .map((r, s) => {
      const i = r.map((o, l) => {
        const u = r[(l + 1) % r.length];
        const c = lerp(o, u!, 0.5);
        return polys.some(
          (d, h) =>
            h !== s &&
            d.some((m, x) => onSegment(c, m, d[(x + 1) % d.length]!)),
        )
          ? gap / 2
          : 0;
      });
      const a = offsetPolygon(r, i);
      return radius > 0 ? roundedPolygon(a, radius) : polyPath(a);
    })
    .join("");
}

export function thickPolyline(points: Pt[], width: number) {
  const n = width / 2;
  const r = [];
  const s = [];
  for (let i = 0; i < points.length; i++) {
    const a = i > 0 ? unit(sub(points[i]!, points[i - 1]!)) : null;
    const o =
      i < points.length - 1 ? unit(sub(points[i + 1]!, points[i]!)) : null;
    const l = a ? [-a[1]!, a[0]] : null;
    const u = o ? [-o[1]!, o[0]] : null;
    let c;
    if (l && u) {
      const f = unit(add(l as Pt, u as Pt));
      const d = f[0]! * u[0]! + f[1]! * u[1]!;
      c = scale(f, n / d);
    } else c = scale((l ?? u) as Pt, n);
    r.push(add(points[i]!, c));
    s.push(sub(points[i]!, c));
  }
  return polyPath([...r, ...s.reverse()]);
}

export function heartPath(cx: number, cy: number, size: number) {
  const r = size / 1.708;
  const s = cy + 0.07 * r;
  const i = (o: any, l: any) => [cx + o * r, s + l * r];
  const a = num(0.5 * r);
  return `M${pt(i(0, 0.707))}L${pt(i(-0.707, 0))}A${a} ${a} 0 0 1 ${pt(i(0, -0.707))}A${a} ${a} 0 0 1 ${pt(i(0.707, 0))}Z`;
}

export function lensPath(a: Pt, b: Pt, width: number) {
  const r = dist(a, b) / 2;
  const s = width / 2;
  const i = num((r * r + s * s) / (2 * s));
  return `M${pt(a)}A${i} ${i} 0 0 1 ${pt(b)}A${i} ${i} 0 0 1 ${pt(a)}Z`;
}

export function splitLensPath(from: Pt, to: Pt, width: number, gap: number) {
  const s = dist(from, to) / 2;
  const i = width / 2;
  const a = (s * s + i * i) / (2 * i);
  const o = unit(sub(to, from));
  const l = [-o[1]!, o[0]];
  const u = lerp(from, to, 0.5);
  const c = a - i + gap / 2;
  const f = Math.sqrt(Math.max(0, a * a - c * c));
  const d = (h: any) => {
    const m = add(u, scale(l as Pt, (h * gap) / 2));
    const x = sub(m, scale(o, f));
    const k = add(m, scale(o, f));
    return `M${pt(x)}A${num(a)} ${num(a)} 0 0 ${h > 0 ? 0 : 1} ${pt(k)}Z`;
  };
  return d(1) + d(-1);
}

export function keyholePath(
  cx: number,
  cy: number,
  radius: number,
  height: number,
  half: number,
) {
  const i = radius * 0.45;
  const a = cy + Math.sqrt(radius * radius - i * i);
  return `M${pt([cx - i, a])}A${num(radius)} ${num(radius)} 0 1 1 ${pt([cx + i, a])}L${pt([cx + half, cy + height])}L${pt([cx - half, cy + height])}Z`;
}

export function housePoints(
  cx: number,
  top: number,
  eave: number,
  half: number,
  bottom: number,
) {
  return [
    [cx, top],
    [cx + half, eave],
    [cx + half, bottom],
    [cx - half, bottom],
    [cx - half, eave],
  ];
}

function arcSegment(
  center: Pt,
  radius: number,
  from: number,
  to: number,
  move: boolean = true,
) {
  const i = polar(center, radius, from);
  const a = polar(center, radius, to);
  const o = to - from;
  const l = Math.abs(o) > 180 ? 1 : 0;
  const u = o > 0 ? 1 : 0;
  return (
    (move ? `M${pt(i)}` : `L${pt(i)}`) +
    `A${num(radius)} ${num(radius)} 0 ${l} ${u} ${pt(a)}`
  );
}

export function ringSegmentPath(
  center: Pt,
  inner: number,
  outer: number,
  from: number,
  to: number,
) {
  return (
    arcSegment(center, outer, from, to) +
    arcSegment(center, inner, to, from, false) +
    "Z"
  );
}

export function archPath(
  left: number,
  right: number,
  spring: number,
  bottom: number,
  close: boolean = true,
) {
  const i = num((right - left) / 2);
  return (
    `M${num(left)} ${num(bottom)}V${num(spring)}A${i} ${i} 0 0 1 ${num(right)} ${num(spring)}V${num(bottom)}` +
    (close ? "Z" : "")
  );
}

export function lineIntersection(a: Pt, b: Pt, c: Pt, d: Pt) {
  return intersectLines(a, sub(b, a), c, sub(d, c)) ?? a;
}

export function quadPoint(p0: Pt, p1: Pt, p2: Pt, t: number) {
  const s = 1 - t;
  const i = [
    s * s * p0[0]! + 2 * s * t * p1[0]! + t * t * p2[0]!,
    s * s * p0[1]! + 2 * s * t * p1[1]! + t * t * p2[1]!,
  ];
  const a = unit([
    2 * s * (p1[0]! - p0[0]!) + 2 * t * (p2[0]! - p1[0]!),
    2 * s * (p1[1]! - p0[1]!) + 2 * t * (p2[1]! - p1[1]!),
  ]);
  return {
    p: i,
    tan: a,
  };
}

export function wavePath(
  x0: number,
  x1: number,
  y: number,
  length: number,
  amp: number,
) {
  const i = length / 2;
  let a = `M${num(x0)} ${num(y)}Q${num(x0 + i / 2)} ${num(y - amp * 2)} ${num(x0 + i)} ${num(y)}`;
  for (let o = x0 + i; o + i <= x1 + 0.01; o += i)
    a += `T${num(o + i)} ${num(y)}`;
  return a;
}

export const CONTAINER_STROKE = 4;

export const ALL_STYLES = [
  "elegant",
  "modern",
  "luxus",
  "warm",
  "mutig",
  "natur",
];

export const shieldPath = (inset: number) => {
  const t = 4 + inset;
  const n = 96 - inset * 1.1;
  const r = 10 + inset;
  const s = 90 - inset;
  return `M50 ${num(t)}L${num(s)} ${num(t + 10)}V46C${num(s)} ${num(72 - inset * 0.6)} ${num(74 - inset * 0.6)} ${num(87 - inset * 0.6)} 50 ${num(n)}C${num(26 + inset * 0.6)} ${num(87 - inset * 0.6)} ${num(r)} ${num(72 - inset * 0.6)} ${num(r)} 46V${num(t + 10)}Z`;
};

export const hexagonPoints = (r: number) =>
  [0, 1, 2, 3, 4, 5].map((t) => polar([50, 50], r, -90 + t * 60));

export const fillAttr = (color: string) => `fill="${color}"`;
