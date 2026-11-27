/**
 * Kleine Text-Helfer: Gedankenstriche ersetzen, Dateinamen, Nummern, Speicherzeit.
 * Gesicherte Fassung: index-Chunk (ua, Lk, lL, Fk).
 */

export const plainDashes = (text: any) => text.replace(/[\u2012-\u2015\u2212]/g, "-");

export function slugify(name: any) {
  const t: Record<string, any> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", Ä: "ae", Ö: "oe", Ü: "ue" };
  return (
    name
      .replace(/[äöüßÄÖÜ]/g, (n: any) => t[n])
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, "und")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "marke"
  );
}

export const padNumber = (e: any) => String(e).padStart(3, "0");

export function formatSavedAt(time: any, now: any = Date.now()) {
  const n = new Date(time);
  const r = new Date(now);
  const s = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  const i = (o: any) => new Date(o.getFullYear(), o.getMonth(), o.getDate()).getTime();
  const a = Math.round((i(r) - i(n)) / 864e5);
  return a === 0
    ? `HEUTE, ${s}`
    : a === 1
      ? `GESTERN, ${s}`
      : `${String(n.getDate()).padStart(2, "0")}.${String(n.getMonth() + 1).padStart(2, "0")}.${n.getFullYear()}, ${s}`;
}
