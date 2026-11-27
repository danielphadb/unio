/**
 * Kompass-Hilfen der Oberfläche: Vorschau-Eingabe, Routen für den Zustand, mutiger, Projekt und Namensfinder aus einer Route.
 * Gesicherte Fassung: kompass-Chunk (Zn, Xn, Yn, er, nr, rr).
 */
import { applyRouteToInput } from "../../engine/kompassProbe";
import { withRoute } from "../../engine/names/finder";
import { chooseRoutes } from "../../strategy/routes";
import { kompassName } from "./kompassDraft";
import { finderPrefs, isFinderComplete } from "./nameDraft";
import { createProject, nameContextOf, suffixChoiceOf } from "./project";

export function previewInput(e: any) {
  return { name: kompassName(e), suffix: "", styles: [], colorMoods: [], themes: [] };
}

export function previewInputFor(e: any, n: any) {
  const r = n.styles.slice(0, 2);
  return withRoute(
    {
      ...previewInput(e),
      styles: r,
      colorMoods: n.colorMoods.slice(0, 2),
      themes: n.themes.filter((t: any) => !n.avoidThemes.includes(t)).slice(0, 2),
    },
    n,
  );
}

export function routesForState(e: any) {
  return chooseRoutes(e.brief, { seed: e.seed, mutiger: e.mutiger });
}

export function shiftMutiger(e: any, n: any, r: any) {
  const t = Math.max(-1, Math.min(1, (e.mutiger[n] ?? 0) + r * 0.5));
  const o: any = { ...e.mutiger };
  if (t) {
    o[n] = t;
  } else {
    delete o[n];
  }
  return { ...e, mutiger: o };
}

export const IMMOBILIEN_RE =
  /\b(immobilien|realitäten|realitaeten|real estate|immobilienberatung|immobilientreuhand|properties|estates?)\b/i;

export function projectFromRoute(e: any, n: any, r: any, t: any = {}) {
  const o = r.trim();
  const s = t.suffix !== undefined ? t.suffix : IMMOBILIEN_RE.test(o) ? "" : "Immobilien";
  const i = suffixChoiceOf(s);
  const l =
    t.kind ?? (e.architecture === "buero" ? "company" : e.architecture ? "person" : undefined);
  let u = createProject({
    rawName: o,
    suffixChoice: i.choice,
    customSuffix: i.custom,
    keepLegalForm: false,
    place: e.place,
    ...(l ? { nameKind: l } : {}),
  });
  const h = applyRouteToInput(u.input, n);
  const f = h.styles[0];
  u = {
    ...u,
    input: h,
    styleChoice: f ?? "mix",
    brief: e,
    route: n,
    ui: { ...u.ui, route: `#/p/${u.id}/auswahl` },
  };
  const k = nameContextOf({
    person: e.person,
    keywords: n.params.keywords.slice(0, 7),
    focus: e.focus,
  });
  if (k) {
    u = { ...u, nameContext: k };
  }
  if (t.fromFinder) {
    u = { ...u, fromFinder: true };
  }
  if (t.card) {
    u = { ...u, pinned: t.card, favorites: [t.card], numbers: { [t.card.id]: 1 } };
  }
  return u;
}

export function nameFinderFromRoute(e: any, n: any, r: any) {
  const t = e.person.trim() || n.person?.trim() || "";
  const o = e.region.trim() || n.place?.trim() || "";
  const s = e.focus.length ? e.focus : [...(n.focus ?? [])];
  const i = e.keywords.trim();
  const l = { ...e, person: t, region: o, focus: s, keywords: i, route: r, brief: n, chips: [] };
  const u = isFinderComplete(l);
  return { ...l, submitted: u, batches: u ? [finderPrefs(l)] : [] };
}
