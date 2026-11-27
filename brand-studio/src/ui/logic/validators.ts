/**
 * Grund-Helfer fuer die Pruefung gespeicherter Daten (index-Chunk der gesicherten Fassung).
 * Jede Pruefung wirft `ValidationError` mit dem Pfad des Feldes. Die Oberflaeche reicht sie in
 * `validate.ts` weiter; Objekt-Bibliothek und Objektdaten (src/postings) nutzen sie direkt.
 */

/** Ungueltiger Wert an `path` (`se`, Export `aI`). */
export class ValidationError extends Error {
  readonly path: string;
  constructor(path: string) {
    super(`Ungültiger Wert: ${path}`);
    this.path = path;
    this.name = "ValidationError";
  }
}

/** Ein einfaches Objekt (kein Array, nicht null) (`ue`, Export `aF`). */
export function obj(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError(path);
  return value as Record<string, unknown>;
}

export interface StrOptions {
  /** fehlend (null/undefined) ergibt "" */
  optional?: boolean;
  /** muss passen, wenn nicht leer */
  pattern?: RegExp;
}

/** Text bis `max` Zeichen ohne Steuerzeichen (`X`, Export `aG`). */
export function str(value: unknown, path: string, max: number, opts: StrOptions = {}): string {
  if (value == null) {
    if (opts.optional) return "";
    throw new ValidationError(path);
  }
  if (typeof value !== "string" || value.length > max) throw new ValidationError(path);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) throw new ValidationError(path);
  if (opts.pattern && value && !opts.pattern.test(value)) throw new ValidationError(path);
  return value;
}

/** Endliche Zahl zwischen `min` und `max` (`qe`, Export `aJ`). */
export function num(value: unknown, path: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max)
    throw new ValidationError(path);
  return value;
}

/** Wahrheitswert, fehlend ergibt `fallback` (`Vr`, Export `aL`). */
export function bool(value: unknown, path: string, fallback: boolean = false): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new ValidationError(path);
  return value;
}

/** Einer der erlaubten Werte (`Y`, Export `aR`). */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) throw new ValidationError(path);
  return value as T;
}

/** Liste erlaubter Werte, hoechstens so lang wie die Auswahl; fehlend ergibt [] (`Re`, Export `aY`). */
export function listOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > allowed.length) throw new ValidationError(path);
  return value.map((v, i) => oneOf(v, allowed, `${path}[${i}]`));
}

/** Webadresse ohne Protokoll und ohne Schraegstrich am Ende (`t0`, Export `$`). */
export function stripWeb(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

/** Webadresse lesbar (leer ist erlaubt) (`d1`, Export `_`). */
export function isWebOk(value: string): boolean {
  const s = stripWeb(value);
  return s ? /^([\p{L}\d-]+\.)+[\p{L}]{2,}(\/\S*)?$/iu.test(s) : true;
}
