/** Bildgroesse aus einer data-URL lesen (PNG, JPEG, WebP), ohne das Bild zu dekodieren. */
import type { ImageSize } from "./drawTypes";

export const sizeCache = new Map<string, ImageSize | null>();
export function base64Bytes(b64: string, bytes: number) {
  const head = b64.slice(0, Math.ceil(bytes / 3) * 4);
  const bin =
    typeof atob == "function" ? atob(head) : Buffer.from(head, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export function jpegSize(bytes: Uint8Array): ImageSize | null | "more" {
  if (bytes[0] !== 255 || bytes[1] !== 216) return null;
  let pos = 2;
  while (pos + 9 < bytes.length) {
    if (bytes[pos] !== 255) return null;
    const marker = bytes[pos + 1];
    const len = (bytes[pos + 2]! << 8) | bytes[pos + 3]!;
    if (marker! >= 192 && marker! <= 207 && marker !== 196 && marker !== 200 && marker !== 204)
      return {
        h: (bytes[pos + 5]! << 8) | bytes[pos + 6]!,
        w: (bytes[pos + 7]! << 8) | bytes[pos + 8]!,
      };
    pos += 2 + len;
  }
  return "more";
}
export function imageSize(dataUrl: string): ImageSize | null {
  const key = `${dataUrl.length}|${dataUrl.slice(0, 80)}|${dataUrl.slice(-40)}`;
  if (sizeCache.has(key)) return sizeCache.get(key) ?? null;
  let size = null;
  const m = /^data:([^;,]+);base64,/.exec(dataUrl);
  if (m) {
    const data = dataUrl.slice(m[0].length);
    try {
      if (m[1] === "image/png") {
        const bytes = base64Bytes(data, 32);
        size = {
          w: (bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!,
          h: (bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!,
        };
      } else if (m[1] === "image/jpeg")
        for (const bytes of [4096, 70000, 400000]) {
          const kind = jpegSize(base64Bytes(data, bytes));
          if (kind !== "more") {
            size = kind;
            break;
          }
        }
      else if (m[1] === "image/webp") {
        const bytes = base64Bytes(data, 64);
        const kind = String.fromCharCode(bytes[12]!, bytes[13]!, bytes[14]!, bytes[15]!);
        if (kind === "VP8 ") {
          size = {
            w: ((bytes[27]! << 8) | bytes[26]!) & 16383,
            h: ((bytes[29]! << 8) | bytes[28]!) & 16383,
          };
        } else {
          if (kind === "VP8L") {
            size = {
              w: 1 + (((bytes[22]! & 63) << 8) | bytes[21]!),
              h: 1 + (((bytes[24]! & 15) << 10) | (bytes[23]! << 2) | ((bytes[22]! & 192) >> 6)),
            };
          } else {
            if (kind === "VP8X") {
              size = {
                w: 1 + (bytes[24]! | (bytes[25]! << 8) | (bytes[26]! << 16)),
                h: 1 + (bytes[27]! | (bytes[28]! << 8) | (bytes[29]! << 16)),
              };
            }
          }
        }
      }
    } catch {
      size = null;
    }
  }
  if (size && (!(size.w > 0) || !(size.h > 0))) {
    size = null;
  }
  sizeCache.set(key, size);
  return size;
}
