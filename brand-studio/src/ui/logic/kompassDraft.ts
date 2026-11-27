/**
 * Zustand des Markenkompass im Browser (Antworten, Seed, mutiger, Schritt).
 * Gesicherte Fassung: index-Chunk (Rg, pC, mC, gC, xC).
 */
import { validateBrief } from "./validate";

export const KOMPASS_KEY = "unio-brand:kompass";

export const ROUTE_IDS = ["A", "B", "C"];

export function emptyKompass(
  seed: any = (Date.now() ^ Math.floor(Math.random() * 16777215)) >>> 0,
): any {
  return { brief: { version: 1 }, seed: seed, mutiger: {}, gemerkt: [], schritt: 1 };
}

export function parseKompass(raw: any): any {
  const t = emptyKompass();
  if (!raw) return t;
  try {
    const n = JSON.parse(raw);
    if (!n || typeof n != "object" || Array.isArray(n)) return t;
    const r = validateBrief(n.brief ?? { version: 1 });
    const s = n.mutiger && typeof n.mutiger == "object" ? n.mutiger : {};
    const i: any = {};
    for (const l of ROUTE_IDS) {
      const u = s[l];
      if (typeof u == "number" && Number.isInteger(u * 2) && u >= -1 && u <= 1 && u !== 0) {
        i[l] = u;
      }
    }
    const a = Array.isArray(n.gemerkt)
      ? n.gemerkt.filter((l: any) => typeof l == "string" && /^[a-z0-9._-]{1,40}$/.test(l)).slice(0, 30)
      : [];
    const o =
      typeof n.schritt == "number" &&
      Number.isInteger(n.schritt) &&
      n.schritt >= 1 &&
      n.schritt <= 7
        ? n.schritt
        : 1;
    return {
      brief: r,
      seed: typeof n.seed == "number" && Number.isFinite(n.seed) ? n.seed >>> 0 : t.seed,
      mutiger: i,
      gemerkt: a,
      schritt: o,
    };
  } catch {
    return t;
  }
}

export function loadKompass() {
  try {
    return parseKompass(localStorage.getItem(KOMPASS_KEY));
  } catch {
    return emptyKompass();
  }
}

export function saveKompass(state: any) {
  try {
    localStorage.setItem(KOMPASS_KEY, JSON.stringify(state));
  } catch {}
}

export function withStartFields(brief: any, start: any) {
  var f;
  const n: any = { ...brief };
  const r = start.name?.trim().slice(0, 80);
  if (r) {
    n.hasName = true;
    n.name = r;
  }
  const s = start.person?.trim().slice(0, 80);
  if (s && !n.person) {
    n.person = s;
  }
  const i = start.place?.trim().slice(0, 60);
  if (i && !n.place) {
    n.place = i;
  }
  const a = ["wohnen", "haeuser", "luxus", "anleger", "gewerbe", "neubau", "land"];
  const o = (start.focus ?? []).filter((d: any) => a.includes(d)).slice(0, 3);
  if (o.length && !((f = n.focus) != null && f.length)) {
    n.focus = o;
  }
  return n;
}

export function kompassName(brief: any) {
  var n;
  var r;
  if (brief.hasName && (n = brief.name) != null && n.trim()) return brief.name.trim();
  const t = (brief.person ?? "")
    .trim()
    .split(/\s+/)
    .filter((s: any) => new RegExp("^\\p{L}", "u").test(s));
  return t.length >= 2
    ? `${t[0][0]}${t[t.length - 1][0]}`.toLocaleUpperCase("de-AT")
    : t.length === 1
      ? t[0]
      : (r = brief.place) != null && r.trim()
        ? brief.place.trim()
        : "Dein Name";
}

export function rememberStart(start: any, hasName: any = false) {
  const n = loadKompass();
  const r: any = { ...n.brief };
  if (hasName) {
    r.hasName = true;
  } else {
    delete r.hasName;
    delete r.name;
  }
  saveKompass({ ...n, brief: withStartFields(r, start) });
}
