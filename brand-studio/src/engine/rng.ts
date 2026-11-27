/**
 * Zufall mit Seed und Text-Hash (svg-Chunk: `et`, `nt`).
 *
 * Bitgenau wie die gesicherte Fassung: Konzept-IDs, Galerie-Seiten, Paletten,
 * Namens-Chargen und Routen haengen an diesen Folgen. Nichts an der Arithmetik
 * aendern (Reihenfolge der Operationen, `>>> 0`, `Math.imul`).
 */

export interface Rng {
  /** Gleichverteilt in [0, 1). */
  next(): number;
  /** Ganze Zahl von `min` bis `max` (beide eingeschlossen). */
  int(min: number, max: number): number;
  /** Ein Element (bei leerer Liste `undefined`). */
  pick<T>(items: readonly T[]): T;
  /** Gemischte Kopie (Fisher-Yates von hinten). */
  shuffle<T>(items: readonly T[]): T[];
  /** `true` mit Wahrscheinlichkeit `p`. */
  chance(p: number): boolean;
}

/** Mulberry32: kleiner, schneller Zufallsgenerator mit 32-Bit-Zustand. */
export function rng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let a = state;
    a = Math.imul(a ^ (a >>> 15), a | 1);
    a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T =>
      items[Math.floor(next() * items.length)] as T,
    shuffle: <T>(items: readonly T[]): T[] => {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j] as T, out[i] as T];
      }
      return out;
    },
    chance: (p) => next() < p,
  };
}

/** FNV-1a (32 Bit) ueber die UTF-16-Codeeinheiten, Ergebnis ohne Vorzeichen. */
export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
