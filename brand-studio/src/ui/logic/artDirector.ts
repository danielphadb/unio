/**
 * KI-Rangfolge in der Galerie: Karten wählen, Anfrage bauen, Ergebnis zwischenspeichern und Seite umsortieren.
 * Gesicherte Fassung: Gallery-Chunk (Gn, Hn, Un, Wn, qn, Yn).
 */
import { MAX_CARDS, MIN_CARDS, fetchRanking, parseResponse } from "../../artdirector/client";
import { thumbnails } from "../../artdirector/thumbnails";
import { isPersonName } from "../../engine/personName";
import { hash } from "../../engine/rng";

export const cardKey = (e: any) => `k${e}`;

export function mergeCards(e: any, n: any) {
  const t = new Set<any>();
  const r: any[] = [];
  for (const i of [...e, ...n]) t.has(i.id) || r.length >= MAX_CARDS || (t.add(i.id), r.push(i));
  return r.length >= MIN_CARDS ? r : [];
}

export function rankingKey(e: any, n: any) {
  const t = [
    e.name,
    e.suffix ?? "",
    e.place ?? "",
    e.nameKind ?? "",
    e.ort2 ?? "",
    e.jahr ?? "",
    e.styles.join(","),
  ].join("|");
  return `${hash(t).toString(36)}-${hash(n.map((r: any) => r.id).join(",")).toString(36)}`;
}

export function profileOf(e: any) {
  var t;
  var r;
  const n: any = { art: isPersonName(e) ? "person" : "firma" };
  if ((t = e.place) != null && t.trim()) {
    n.ort = e.place.trim();
  }
  if ((r = e.suffix) != null && r.trim()) {
    n.zusatz = e.suffix.trim();
  }
  return n;
}

export function applyRanking(e: any, n: any, t: any, r: any = new Set<any>()) {
  const i = new Map<string, any>(e.map((l: any, c: any) => [cardKey(c), l]));
  const o = new Set<any>();
  const u = new Map<any, any>();
  const a: any[] = [];
  for (const l of n.rangfolge) {
    const c = i.get(l.id);
    c && (l.ausschluss ? o.add(c.id) : a.push(c), l.grund && u.set(c.id, l.grund));
  }
  for (const l of e) !o.has(l.id) && !a.includes(l) && a.push(l);
  const d: any[] = [];
  for (const l of a) {
    if (d.length >= t) break;
    if (!r.has(l.id)) {
      d.push(l);
    }
  }
  return { page: d, reasons: u };
}

export const pending = new Map<any, any>();

export const results = new Map<any, any>();

export const CACHE_KEY = "unio-brand:ki:";

export function readCached(e: any) {
  try {
    const n = sessionStorage.getItem(CACHE_KEY + e);
    if (!n) return null;
    const t = JSON.parse(n);
    return parseResponse(
      t,
      t.rangfolge.map((r: any) => r.id),
    );
  } catch {
    return null;
  }
}

export function writeCached(e: any, n: any) {
  try {
    sessionStorage.setItem(CACHE_KEY + e, JSON.stringify({ ok: true, ...n }));
  } catch {}
}

export function rankOnce(e: any, n: any, t: any = {}) {
  let r = pending.get(e);
  const i = r ? null : readCached(e);
  if (i) {
    results.set(e, i);
    r = Promise.resolve(i);
    pending.set(e, r);
  }
  if (!r) {
    r = (async () => {
      const o = await n().catch(() => null);
      return o ? fetchRanking(o, { endpoint: t.endpoint }) : null;
    })().then((o) => (results.set(e, o), o && writeCached(e, o), o));
    pending.set(e, r);
  }
  return r;
}

export function cachedRanking(e: any) {
  return results.has(e) ? results.get(e) : undefined;
}

export async function buildRequest(e: any, n: any, t: any, r: any, i?: any) {
  const o: any[] = [];
  for (let a = 0; a < t.length; a++) {
    const d = await r(t[a]);
    if (d) {
      o.push({ id: cardKey(a), svg: d });
    }
  }
  const u = await thumbnails(o);
  return u.length < MIN_CARDS
    ? null
    : { stil: n, profil: profileOf(e), marke: e.name.trim(), karten: u };
}
