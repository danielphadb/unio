/** Farbhelfer der Unterlagen (imagesize-Chunk der gesicherten Fassung): Hex, Mischung, Kontrast, CMYK. */

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((n) => n + n)
      .join("");
  }
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
}
export function rgbToHex(r: number, g: number, b: number) {
  const hex2 = (r: number) =>
    Math.round(Math.min(255, Math.max(0, r)))
      .toString(16)
      .padStart(2, "0");
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
}
export function mixHex(a: string, b: string, amount: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(
    ca[0] + (cb[0] - ca[0]) * amount,
    ca[1] + (cb[1] - ca[1]) * amount,
    ca[2] + (cb[2] - ca[2]) * amount,
  );
}
export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
export function contrastRatio(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
export const isDarkHex = (hex: string) => luminance(hex) < 0.2;
export function hexToCmyk(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const k = 1 - Math.max(r!, g!, b!);
  if (k >= 0.999) return [0, 0, 0, 100];
  const c = (1 - r! - k) / (1 - k);
  const m = (1 - g! - k) / (1 - k);
  const y = (1 - b! - k) / (1 - k);
  return [c, m, y, k].map((v) => Math.round(v * 100));
}
export function normalizeHex(value: unknown, fallback: string = "#000000") {
  if (typeof value != "string") return fallback;
  const s = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(s)
    ? s.toUpperCase()
    : /^#[0-9a-fA-F]{3}$/.test(s)
      ? `#${s
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("")}`.toUpperCase()
      : fallback;
}
export function safeFill(color: string) {
  return color === "none" || /^url\(#[A-Za-z0-9_-]+\)$/.test(color) ? color : normalizeHex(color);
}
