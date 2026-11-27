/**
 * Client für /api/brand-art-director: Anfrage prüfen und kürzen, Antwort lesen, Abruf mit Zeitlimit.
 * Gesicherte Fassung: Gallery-Chunk (An, Ie, $n).
 */

export const ART_DIRECTOR_ENDPOINT = "/api/brand-art-director";

export const ART_DIRECTOR_TIMEOUT_MS = 55e3;

export const MIN_CARDS = 6;

export const MAX_CARDS = 24;

export const MAX_PNG_BYTES = 60 * 1024;

export const CARD_ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

export const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

export function stripDataUrl(e: any) {
  const n = e.indexOf("base64,");
  return (e.startsWith("data:") && n >= 0 ? e.slice(n + 7) : e).replace(/\s+/g, "");
}

export function base64Bytes(e: any) {
  const n = e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0;
  return Math.floor((e.length * 3) / 4) - n;
}

export function clipText(e: any, n: any) {
  const t = (e ?? "").trim();
  return t ? t.slice(0, n) : undefined;
}

export function normalizeRequest(e: any) {
  if (!e || !e.profil || (e.profil.art !== "person" && e.profil.art !== "firma")) return null;
  const n = (e.marke ?? "").trim();
  if (!n || n.length > 80) return null;
  const t = Array.isArray(e.karten) ? e.karten : [];
  if (t.length < MIN_CARDS || t.length > MAX_CARDS) return null;
  const r = new Set<any>();
  const i: any[] = [];
  for (const d of t) {
    if (!d || !CARD_ID_RE.test(d.id) || r.has(d.id)) return null;
    r.add(d.id);
    const l = stripDataUrl(d.png ?? "");
    if (!l || !BASE64_RE.test(l) || base64Bytes(l) > MAX_PNG_BYTES) return null;
    const c: any = { id: d.id, png: l };
    const k = clipText(d.beschreibung, 200);
    if (k) {
      c.beschreibung = k;
    }
    i.push(c);
  }
  const o: any = { art: e.profil.art };
  const u = clipText(e.profil.ort, 60);
  const a = clipText(e.profil.zusatz, 60);
  if (u) {
    o.ort = u;
  }
  if (a) {
    o.zusatz = a;
  }
  return { stil: e.stil, profil: o, marke: n, karten: i };
}

export function parseResponse(e: any, n: any) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.ok !== true || !Array.isArray(t.rangfolge)) return null;
  const r = new Set(n);
  const i = new Set<any>();
  const o: any[] = [];
  for (const l of t.rangfolge) {
    if (!l || typeof l != "object") return null;
    const c = l;
    if (
      typeof c.id != "string" ||
      !r.has(c.id) ||
      i.has(c.id) ||
      typeof c.wert != "number" ||
      !Number.isFinite(c.wert) ||
      typeof c.grund != "string"
    )
      return null;
    i.add(c.id);
    const k: any = {
      id: c.id,
      wert: Math.max(0, Math.min(100, Math.round(c.wert))),
      grund: c.grund,
    };
    if (typeof c.ausschluss == "string" && c.ausschluss) {
      k.ausschluss = c.ausschluss;
    }
    o.push(k);
  }
  if (!o.length) return null;
  const u = t.nutzung && typeof t.nutzung == "object" ? t.nutzung : {};
  const a = (l: any) => (typeof l == "number" && Number.isFinite(l) ? l : 0);
  const d: any = {
    rangfolge: o,
    modell: typeof t.modell == "string" ? t.modell : "",
    nutzung: { eingabe: a(u.eingabe), ausgabe: a(u.ausgabe), cache: a(u.cache) },
  };
  if (t.testmodus === true) {
    d.testmodus = true;
  }
  return d;
}

export async function fetchRanking(e: any, n: any = {}) {
  var a;
  var l;
  const t = normalizeRequest(e);
  if (!t) return null;
  const r = n.fetchImpl ?? (typeof fetch == "function" ? fetch : undefined);
  if (!r || ((a = n.signal) != null && a.aborted)) return null;
  const i = new AbortController();
  const o = () => i.abort();
  n.signal?.addEventListener("abort", o, { once: true });
  const u = setTimeout(o, Math.max(1, n.timeoutMs ?? ART_DIRECTOR_TIMEOUT_MS));
  try {
    const c = await r(n.endpoint ?? ART_DIRECTOR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
      signal: i.signal,
      credentials: "same-origin",
    });
    if (!c.ok) return null;
    const k = await c.json();
    return i.signal.aborted
      ? null
      : parseResponse(
          k,
          t.karten.map((C) => C.id),
        );
  } catch {
    return null;
  } finally {
    clearTimeout(u);
    if (!((l = n.signal) == null)) {
      l.removeEventListener("abort", o);
    }
  }
}
