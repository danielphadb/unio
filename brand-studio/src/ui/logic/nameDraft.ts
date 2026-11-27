/**
 * Zustand des Namensfinders im Browser (Formular, Chargen, Gemerkte, Lernsignale).
 * Gesicherte Fassung: index-Chunk (Mg, rC, sC, iC).
 */
import { keywordsFromText } from "../../engine/orte";
import { validateBrief, validateRoute } from "./validate";

export const NAME_FINDER_KEY = "unio-brand:namefinder";

export const FINDER_STYLES = ["elegant", "modern", "luxus", "warm", "mutig", "natur", "egal"];

export function emptyFinderState(
  seed: any = (Date.now() ^ Math.floor(Math.random() * 16777215)) >>> 0,
): any {
  return {
    person: "",
    company: "",
    region: "",
    focus: [],
    style: "egal",
    keywords: "",
    seed: seed,
    pages: 1,
    submitted: false,
    saved: [],
    chips: [],
    creativity: "ausgewogen",
    exclude: "",
    maxLength: null,
    description: "",
    hidden: [],
    learnIgnore: [],
    lenCap: null,
    autoExclude: [],
    damp: [],
    batches: [],
  };
}

export function finderPrefs(e: any) {
  return {
    liked: e.saved.filter((t: any) => !e.learnIgnore.includes(t.id)).map((t: any) => t.name),
    disliked: e.hidden.map((t: any) => t.name),
    lenCap: e.lenCap,
    autoExclude: [...e.autoExclude],
    damp: [...e.damp],
  };
}

export const isFinderComplete = (e: any) =>
  !!(
    e.person.trim() ||
    (e.company ?? "").trim() ||
    e.region.trim() ||
    e.keywords.trim() ||
    keywordsFromText(e.description ?? "").length ||
    e.route
  );

export const clip = (e: any, t: any) => (typeof e == "string" ? e.slice(0, t) : "");

export function parseFinderState(raw: any): any {
  const t = emptyFinderState();
  if (!raw) return t;
  try {
    const n = JSON.parse(raw);
    const r = Array.isArray(n.saved)
      ? n.saved
          .filter(
            (f: any) =>
              f &&
              typeof f.name == "string" &&
              typeof f.kind == "string" &&
              /^[a-z-]{1,30}$/.test(f.kind),
          )
          .slice(0, 200)
          .map((f: any) => ({
            id: clip(f.id, 96) || clip(f.name, 60),
            name: clip(f.name, 60),
            suffix: clip(f.suffix, 40),
            kind: f.kind,
            reason: clip(f.reason, 200) || undefined,
            ...(typeof f.style == "string" && /^[a-z]{1,30}$/.test(f.style)
              ? { style: f.style }
              : {}),
          }))
      : [];
    const s = (f: any, d: any, h: any) =>
      Array.isArray(f)
        ? f
            .filter((m) => typeof m == "string")
            .map((m) => m.slice(0, h))
            .slice(0, d)
        : [];
    const i = (f: any) => {
      if (!f || typeof f != "object") return null;
      const d = f;
      return {
        liked: s(d.liked, 200, 60),
        disliked: s(d.disliked, 400, 60),
        lenCap: a(d.lenCap),
        autoExclude: s(d.autoExclude, 20, 30),
        damp: s(d.damp, 10, 30),
      };
    };
    const a = (f: any) => (typeof f == "number" && f >= 3 && f <= 25 ? Math.round(f) : null);
    const o = Array.isArray(n.hidden)
      ? n.hidden
          .filter((f: any) => f && typeof f.name == "string")
          .slice(0, 400)
          .map((f: any) => ({
            id: clip(f.id, 96) || clip(f.name, 60),
            name: clip(f.name, 60),
            reason: clip(f.reason, 120) || undefined,
          }))
      : [];
    const l = n.creativity;
    let u: any;
    let c: any;
    try {
      if (n.route) {
        u = validateRoute(n.route);
      }
      if (n.brief) {
        c = validateBrief(n.brief);
      }
    } catch {
      u = undefined;
      c = undefined;
    }
    return {
      ...(u ? { route: u } : {}),
      ...(c ? { brief: c } : {}),
      chips: s(n.chips, 12, 30).filter((f) => /^[a-z-]{1,30}$/.test(f)),
      creativity: l === "direkt" || l === "frei" ? l : "ausgewogen",
      exclude: clip(n.exclude, 300),
      maxLength: a(n.maxLength),
      description: clip(n.description, 200),
      hidden: o,
      learnIgnore: s(n.learnIgnore, 200, 96),
      lenCap: a(n.lenCap),
      autoExclude: s(n.autoExclude, 20, 30),
      damp: s(n.damp, 10, 30),
      batches: Array.isArray(n.batches)
        ? n.batches
            .map(i)
            .filter((f: any) => !!f)
            .slice(0, 50)
        : [],
      person: clip(n.person, 80),
      company: clip(n.company, 80),
      region: clip(n.region, 60),
      focus: Array.isArray(n.focus)
        ? n.focus.filter((f: any) => typeof f == "string" && /^[a-z-]{1,30}$/.test(f)).slice(0, 10)
        : [],
      style: FINDER_STYLES.includes(n.style) ? n.style : "egal",
      keywords: clip(n.keywords, 60),
      seed: typeof n.seed == "number" && Number.isFinite(n.seed) ? n.seed >>> 0 : t.seed,
      pages: typeof n.pages == "number" && n.pages >= 1 && n.pages <= 50 ? Math.floor(n.pages) : 1,
      submitted: n.submitted === true,
      saved: r,
    };
  } catch {
    return t;
  }
}

export function loadFinderState() {
  try {
    return parseFinderState(localStorage.getItem(NAME_FINDER_KEY));
  } catch {
    return emptyFinderState();
  }
}

export function saveFinderState(state: any) {
  try {
    localStorage.setItem(NAME_FINDER_KEY, JSON.stringify(state));
  } catch {}
}

export function clearFinderState() {
  try {
    localStorage.removeItem(NAME_FINDER_KEY);
  } catch {}
}
