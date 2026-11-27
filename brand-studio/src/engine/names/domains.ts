/**
 * Domain-Vorschlaege zu einem Namen (nameFinder-Chunk: `ls`, `Pn`, `fn`).
 */

/** Zeichen, die NFKD nicht zerlegt (`ls`). */
const SPECIAL: Readonly<Record<string, string>> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  ı: "i",
  ł: "l",
  đ: "d",
  ð: "d",
  þ: "th",
};

/** Domain-Teil: klein, nur a-z, 0-9 und Bindestrich, hoechstens 63 Zeichen (`Pn`). */
export function slug(text: string): string {
  return (
    text
      .toLocaleLowerCase("de-AT")
      .replace(/[äöüßæœøıłđðþ]/g, (c) => SPECIAL[c] ?? c)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " und ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 63)
      .replace(/-+$/, "") || "marke"
  );
}

export interface Domains {
  at: string;
  com: string;
  /** ohne Bindestrich, mit Zusatz */
  alt: string[];
}

/** .at, .com und Varianten (`fn`). */
export function domainsFor(name: string, suffix?: string): Domains {
  const base = slug(name);
  const alt: string[] = [];
  const joined = base.replace(/-/g, "");
  if (joined !== base) alt.push(`${joined}.at`);
  if (suffix) {
    const withSuffix = slug(`${name} ${suffix}`);
    alt.push(`${withSuffix}.at`, `${withSuffix}.com`);
  }
  return { at: `${base}.at`, com: `${base}.com`, alt };
}
