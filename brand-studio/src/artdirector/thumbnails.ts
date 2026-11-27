/**
 * Vorschaubilder für die KI-Rangfolge: Logo-SVG als kleines PNG (Base64), höchstens 60 KB.
 * Gesicherte Fassung: Gallery-Chunk (Pn, Vn, Dn).
 */
import { MAX_PNG_BYTES } from "./client";

export const THUMB_WIDTH = 320;

export const THUMB_BACKGROUND = "#ffffff";

export const MIN_WIDTH = 160;

export const MAX_SIDE = 2e3;

export function svgAttr(e: any, n: any) {
  const t = new RegExp(`\\s${n}\\s*=\\s*["']([^"']*)["']`, "i").exec(e);
  return t ? t[1] : null;
}

export function svgSize(e: any) {
  const n = /<svg\b[^>]*>/i.exec(e)?.[0];
  if (!n) return null;
  const t = svgAttr(n, "viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  if (t && t.length === 4 && t[2]! > 0 && t[3]! > 0) return { breite: t[2], hoehe: t[3] };
  const r = parseFloat(svgAttr(n, "width") ?? "");
  const i = parseFloat(svgAttr(n, "height") ?? "");
  return r > 0 && i > 0 ? { breite: r, hoehe: i } : null;
}

export function sizedSvg(e: any, n: any, t: any) {
  return e.replace(/<svg\b[^>]*>/i, (r: any) => {
    const i = svgSize(r + "</svg>");
    let o = r.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, "");
    if (!svgAttr(r, "viewBox") && i) {
      o = o.replace(/<svg\b/i, `<svg viewBox="0 0 ${i.breite} ${i.hoehe}"`);
    }
    return o.replace(/<svg\b/i, `<svg width="${n}" height="${t}"`);
  });
}

export function toBase64(e: any) {
  let n = "";
  for (let t = 0; t < e.length; t += 32768) n += String.fromCharCode(...e.subarray(t, t + 32768));
  return btoa(n);
}

export async function toBytes(e: any) {
  return e instanceof Uint8Array ? e : new Uint8Array(await e.arrayBuffer());
}

export function loadImage(e: any) {
  return new Promise((n, t) => {
    const r = new Image();
    r.decoding = "async";
    r.onload = () => n(r);
    r.onerror = () => t(new Error("SVG konnte nicht gerastert werden"));
    r.src = e;
  });
}

export const rasterize = async (e: any, n: any, t: any, r: any) => {
  if (typeof Image > "u") throw new Error("Vorschau braucht einen Browser");
  const i = URL.createObjectURL(
    new Blob([sizedSvg(e, n, t)], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const o = (await loadImage(i)) as HTMLImageElement;
    if (typeof OffscreenCanvas < "u") {
      const l = new OffscreenCanvas(n, t);
      const c = l.getContext("2d");
      if (!c) throw new Error("Canvas nicht verfügbar");
      c.fillStyle = r;
      c.fillRect(0, 0, n, t);
      c.drawImage(o, 0, 0, n, t);
      return await l.convertToBlob({ type: "image/png" });
    }
    const u = document.createElement("canvas");
    u.width = n;
    u.height = t;
    const a = u.getContext("2d");
    if (!a) throw new Error("Canvas nicht verfügbar");
    a.fillStyle = r;
    a.fillRect(0, 0, n, t);
    a.drawImage(o, 0, 0, n, t);
    const d = await new Promise<Blob | null>((l) => u.toBlob(l, "image/png"));
    if (!d) throw new Error("PNG konnte nicht erstellt werden");
    return d;
  } finally {
    URL.revokeObjectURL(i);
  }
};

export async function svgToPng(e: any, n: any = {}) {
  const t = svgSize(e);
  if (!t) return null;
  const r = n.rasterisierer ?? rasterize;
  const i = n.hintergrund ?? THUMB_BACKGROUND;
  const o = n.maxBytes ?? MAX_PNG_BYTES;
  let u = Math.max(MIN_WIDTH, Math.round(n.breite ?? THUMB_WIDTH));
  for (let a = 0; a < 4; a++) {
    const d = Math.max(1, Math.min(MAX_SIDE, Math.round((u * t.hoehe!) / t.breite!)));
    try {
      const l = await toBytes(await r(e, u, d, i));
      if (l.length && l.length <= o) return toBase64(l);
    } catch {
      return null;
    }
    if (u <= MIN_WIDTH) break;
    u = Math.max(MIN_WIDTH, Math.round(u * 0.75));
  }
  return null;
}

export async function thumbnails(e: any, n: any = {}) {
  const t: any[] = [];
  for (const r of e) {
    const i = await svgToPng(r.svg, n);
    if (i) {
      t.push(
        r.beschreibung ? { id: r.id, png: i, beschreibung: r.beschreibung } : { id: r.id, png: i },
      );
    }
  }
  return t;
}
