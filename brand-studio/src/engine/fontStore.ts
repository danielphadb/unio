/**
 * Schriften laden (index-Chunk: Klasse `r4`, `s4`, `CL`).
 *
 * Laedt je Schnitt die latin-Datei (opentype.js) und bei Bedarf die latin-ext-Datei;
 * deren Glyphen werden in die latin-Schrift uebernommen (nur Zeichen, die dort fehlen).
 * latin-ext wird erst geladen, wenn ein Text sie braucht (`setTexts`) oder `wantExt()`.
 */
import { parse, type Font, type Glyph } from "opentype.js";
import type { FontRef } from "../types";
import { needsExtendedCharset } from "./charset";
import { fontExtFileName, fontFileName, fontKey } from "./fonts";
import { forgetTextPaths } from "./text";

/** Liefert den Inhalt einer Schriftdatei (Dateiname wie `fontFileName`). */
export type FontLoader = (file: string) => Promise<ArrayBuffer>;

export class FontStore {
  private readonly fonts = new Map<string, Font>();
  private readonly pending = new Map<string, Promise<Font>>();
  private readonly extDone = new Set<string>();
  private readonly extPending = new Map<string, Promise<void>>();
  private extWanted = false;
  private readonly listeners = new Set<() => void>();
  /** Steigt, wenn sich geladene Glyphen aendern (latin-ext zusammengefuehrt). */
  version = 0;

  constructor(private readonly loader: FontLoader) {}

  /** Texte melden; brauchen sie latin-ext, wird es ab jetzt mitgeladen. */
  setTexts(...texts: Array<string | undefined | null>): void {
    if (!this.extWanted && texts.some((t) => !!t && needsExtendedCharset(t))) {
      this.extWanted = true;
      this.notify();
    }
  }

  wantExt(want = true): void {
    this.extWanted = want;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }

  private notify(): void {
    if (this.listeners.size)
      queueMicrotask(() => this.listeners.forEach((l) => l()));
  }

  get needsExt(): boolean {
    return this.extWanted;
  }

  /** Geladen (und, falls gewuenscht, mit latin-ext). */
  has(ref: FontRef): boolean {
    const k = fontKey(ref);
    return this.fonts.has(k) && (!this.extWanted || this.extDone.has(k));
  }

  get(ref: FontRef): Font {
    const font = this.fonts.get(fontKey(ref));
    if (!font)
      throw new Error(
        `Schrift nicht geladen: ${fontKey(ref)} (vorher ensure() aufrufen)`,
      );
    return font;
  }

  async ensure(
    refs: FontRef[],
    texts?: Array<string | undefined | null>,
  ): Promise<void> {
    if (texts) this.setTexts(...texts);
    await Promise.all(
      refs.map((ref) =>
        this.load(ref).then((font) =>
          this.extWanted ? this.loadExt(ref, font) : undefined,
        ),
      ),
    );
  }

  load(ref: FontRef): Promise<Font> {
    const k = fontKey(ref);
    const loaded = this.fonts.get(k);
    if (loaded) return Promise.resolve(loaded);
    let p = this.pending.get(k);
    if (!p) {
      p = this.loader(fontFileName(ref)).then((buf) => {
        const font = parse(buf);
        this.fonts.set(k, font);
        this.pending.delete(k);
        return font;
      });
      this.pending.set(k, p);
    }
    return p;
  }

  /** latin-ext laden und zusammenfuehren; Fehler beim Laden werden still uebergangen. */
  loadExt(ref: FontRef, font: Font): Promise<void> {
    const k = fontKey(ref);
    if (this.extDone.has(k)) return Promise.resolve();
    let p = this.extPending.get(k);
    if (!p) {
      const file = fontExtFileName(ref);
      p = (
        file
          ? this.loader(file).then(
              (buf) => void mergeGlyphs(font, parse(buf)),
              () => {},
            )
          : Promise.resolve()
      ).then(() => {
        forgetTextPaths(font);
        this.version++;
        this.extDone.add(k);
        this.extPending.delete(k);
        this.notify();
      });
      this.extPending.set(k, p);
    }
    return p;
  }
}

interface GlyphSetInternals {
  length: number;
  glyphs: Record<number, Glyph | (() => Glyph)>;
  get(index: number): Glyph;
}

/**
 * Glyphen aus `extra` in `font` uebernehmen, fuer alle Zeichen, die `font` fehlen
 * (gleiche unitsPerEm vorausgesetzt). Die Glyphen werden erst bei Bedarf gelesen.
 * Ergebnis: Anzahl der neu zugeordneten Zeichen (`s4`).
 */
export function mergeGlyphs(font: Font, extra: Font): number {
  if (font.unitsPerEm !== extra.unitsPerEm) return 0;
  const target = (
    font.tables.cmap as { glyphIndexMap?: Record<number, number> } | undefined
  )?.glyphIndexMap;
  const source = (
    extra.tables.cmap as { glyphIndexMap?: Record<number, number> } | undefined
  )?.glyphIndexMap;
  if (!target || !source) return 0;
  const glyphs = font.glyphs as unknown as GlyphSetInternals;
  const extraGlyphs = extra.glyphs as unknown as GlyphSetInternals;
  const mapped = new Map<number, number>();
  let count = 0;
  for (const [code, index] of Object.entries(source)) {
    const cp = Number(code);
    if (target[cp] || !index) continue;
    let newIndex = mapped.get(index);
    if (newIndex === undefined) {
      const at = glyphs.length;
      glyphs.glyphs[at] = () => {
        const g = extraGlyphs.get(index);
        g.index = at;
        return g;
      };
      newIndex = at;
      glyphs.length++;
      mapped.set(index, newIndex);
    }
    target[cp] = newIndex;
    count++;
  }
  (font as unknown as { numGlyphs: number }).numGlyphs = glyphs.length;
  return count;
}

/** FontStore, der die Markenschriften aus `<base>fonts/brand/` laedt (`CL`, Export `bv`). */
export function createFontStore(base = "./"): FontStore {
  return new FontStore(async (file) => {
    const res = await fetch(`${base}fonts/brand/${file}`);
    if (!res.ok)
      throw new Error(`Schrift konnte nicht geladen werden: ${file}`);
    return res.arrayBuffer();
  });
}
