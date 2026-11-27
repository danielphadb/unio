/**
 * Drei Routen aus dem Brief (kompass-Chunk: `Dn`, `Rn`, `Gn`, `Fn`, `Pn`, `An`, `In`, `Nn`,
 * `Kn`, `Ie`, `jn`, `Ve`, `Bn`, `se`, `Tn`, `Ln`).
 *
 * Nach docs/18, Abschnitt 6:
 * - Route A "sicher": das Territorium mit der besten Passung.
 * - Route B "mutig": das beste Territorium auf einer anderen Hauptachse, mit Marktabstand.
 * - Route C "ueberraschend": aus der Referenzwelt, moeglichst weit weg von A und B.
 * Die drei unterscheiden sich messbar (Schriftklasse, Logo-Art, Farbfamilie: 2 von 3).
 * Danach bekommt jede Route Signature-Vorlagen, die zu ihr und zum Namen passen, und eine
 * Rolle (mehr Wortmarke, mehr Vorlage oder Mitte), damit die Galerien sich unterscheiden.
 *
 * Gleiche Antworten ergeben gleiche Routen (Seed aus dem Brief). "Neue Vorschlaege" setzt
 * nur einen Zusatz-Seed und aendert damit die offenen Achsen.
 */
import { hash } from "../engine/rng";
import { ALL_TEMPLATES, fits, type SignatureTemplate } from "../signature";
import { templateBlocked } from "../engine/route";
import { axisDistance, briefSeed, briefToAxes } from "./axes";
import { TERRITORIES, VORLAGEN_GESPERRT } from "./territories";
import {
  FONT_FORM_AXES,
  clearlyDifferent,
  colorFamilyOf,
  fontCategoryOf,
  fontClassOf,
  resolveRouteParams,
  territoryFit,
  type FitContext,
  type ResolveOptions,
} from "./params";
import { routeTexts } from "./texts";
import type { BrandInput, InputNameKind, NameFocus, StyleKey } from "../types";
import type {
  BrandBrief,
  BrandRoute,
  RouteArt,
  RouteId,
  RouteParams,
  RouteRolle,
  Territory,
} from "./types";

/** Wie stark die Antworten das Territorium ueberstimmen, je Route (`Hn`). */
const ALPHA: Record<RouteArt, number> = { sicher: 0.7, mutig: 0.5, ueberraschend: 0.35 };

/** Mindestzahl passender Vorlagen je Route, damit sie eine Vorlagen-Rolle tragen kann (`j`). */
const MIN_VORLAGEN = 4;

/** Rollen-Verteilungen fuer A, B, C (`An`). */
const ROLLEN: readonly (readonly [RouteRolle, RouteRolle, RouteRolle])[] = [
  ["mitte", "wortmarke", "vorlage"],
  ["mitte", "vorlage", "wortmarke"],
  ["wortmarke", "vorlage", "mitte"],
  ["wortmarke", "mitte", "vorlage"],
  ["vorlage", "wortmarke", "mitte"],
  ["vorlage", "mitte", "wortmarke"],
];

/** Probe-Namen fuer die Eignung der Vorlagen, solange kein Name da ist (`Bn`). */
const PROBE_NAMEN: readonly ProbeName[] = [
  { name: "Anna Berger", nameKind: "person" },
  { name: "Wiener Wohnwerk", nameKind: "company" },
  { name: "Kalmar", nameKind: "company" },
];

interface ProbeName {
  name: string;
  nameKind: InputNameKind;
}

/** Route waehrend der Auswahl: Territorium, Art, aufgeloeste Parameter, Optionen. */
interface Kandidat {
  territory: Territory;
  art: RouteArt;
  id: RouteId;
  params: RouteParams;
  aufl: ResolveOptions;
}

export interface ChooseRoutesOptions {
  /** Zusatz-Seed fuer "Neue Vorschlaege"; fehlt = Seed aus dem Brief */
  seed?: number;
  /** -1 ruhiger bis 1 mutiger, je Route */
  mutiger?: Partial<Record<RouteId, number>>;
}

const baseId = (id: string): string => id.split("--")[0] as string;
const serifSign = (params: RouteParams): number =>
  Math.sign(FONT_FORM_AXES[params.fontForms[0] as keyof typeof FONT_FORM_AXES]?.serif ?? 0);

/** Freigegebene Vorlagen, die gemischt werden duerfen und nicht gesperrt sind (`se`). */
const FREIE_VORLAGEN: readonly SignatureTemplate[] = ALL_TEMPLATES.filter(
  (t) => t.freigabe === "freigegeben" && t.mischung !== false && !VORLAGEN_GESPERRT.includes(t.id),
);
const FREIE_VORLAGEN_BY_ID = new Map(FREIE_VORLAGEN.map((t) => [t.id, t]));

/** Namen, mit denen die Vorlagen geprueft werden: eigener Name, Person oder Proben (`Ve`). */
function probeNames(brief: BrandBrief): readonly ProbeName[] {
  const name = brief.hasName ? brief.name?.trim() : undefined;
  const person = brief.person?.trim();
  if (name)
    return [{ name, nameKind: brief.architecture === "buero" || name !== person ? "company" : "person" }];
  if (person) return [{ name: person, nameKind: "person" }];
  return PROBE_NAMEN;
}

const passtCache = new Map<string, boolean>();

/** Passt die Vorlage zu einem Namen (mit Zusatz "Immobilien")? Mit Cache (`Ie`). */
function templateFitsName(
  t: SignatureTemplate,
  probe: ProbeName,
  place: string | undefined,
  styles: readonly string[] = [],
): boolean {
  const key = `${t.id}|${probe.name}|${probe.nameKind}|${place ?? ""}|${styles.join(",")}`;
  let ok = passtCache.get(key);
  if (ok === undefined) {
    if (passtCache.size > 20000) passtCache.clear();
    const input = {
      name: probe.name,
      nameKind: probe.nameKind,
      suffix: "Immobilien",
      ...(place ? { place } : {}),
      styles: [...styles],
    } as unknown as BrandInput;
    ok = fits(t, input).passt;
    passtCache.set(key, ok);
  }
  return ok;
}

/** Vorlage fuer eine Route: nicht gesperrt und passt zu mindestens 2 Probe-Namen (`Kn`). */
function templateFitsRoute(
  t: SignatureTemplate,
  params: RouteParams,
  brief: BrandBrief,
  probes: readonly ProbeName[],
): boolean {
  const place = brief.place?.trim() || undefined;
  const first = probes[0] as ProbeName;
  const input = {
    name: first.name,
    nameKind: first.nameKind,
    styles: params.styles,
    colorMoods: params.colorMoods,
    themes: params.themes,
    route: params,
  } as unknown as BrandInput;
  if (templateBlocked(t, input)) return false;
  return probes.filter((p) => templateFitsName(t, p, place, params.styles)).length >= Math.min(2, probes.length);
}

/** Wie viele freie Vorlagen zum Namen passen, ohne Route (`jn`). */
function countFittingTemplates(brief: BrandBrief): number {
  const probes = probeNames(brief);
  const place = brief.place?.trim() || undefined;
  return FREIE_VORLAGEN.filter(
    (t) => probes.filter((p) => templateFitsName(t, p, place)).length >= Math.min(2, probes.length),
  ).length;
}

/**
 * Ist `params` verschieden genug von den schon gewaehlten Routen (`Fn`)? Die Stufe 1 bis 5
 * lockert die Bedingung schrittweise: 1 und 2 verlangen eine andere Farbfamilie (1 zusaetzlich
 * Abwechslung bei Schrift oder Serifen), 3 und 5 nur eine andere Schriftklasse, 4 nur die
 * Farbfamilie. Eine sichere Serifen-Antwort gilt bis Stufe 3.
 */
function differsEnough(
  params: RouteParams,
  chosen: readonly RouteParams[],
  stufe: number,
  serif: number,
  wenigeVorlagen: boolean,
): boolean {
  if (serif && stufe <= 3 && serifSign(params) !== serif) return false;
  const andereFarbe = chosen.every((c) => colorFamilyOf(c) !== colorFamilyOf(params));
  const andereSchrift = chosen.every((c) => fontClassOf(c) !== fontClassOf(params));
  if (stufe === 3 || stufe === 5) return andereSchrift;
  if (!andereFarbe || (wenigeVorlagen && stufe === 1 && !andereSchrift)) return false;
  if (stufe !== 1 || chosen.length < 2) return true;
  const alle = [...chosen, params];
  return serif ? new Set(alle.map(fontClassOf)).size >= 2 : new Set(alle.map(serifSign)).size >= 2;
}

/**
 * Parameter eines Territoriums, die sich genug unterscheiden (`Gn`): zuerst die beste
 * Aufloesung, dann jede Kombination aus Schriftform und Farbstimmung als Vorgabe.
 */
function resolveDistinct(
  t: Territory,
  ctx: FitContext,
  opts: ResolveOptions,
  chosen: readonly RouteParams[],
  stufe: number,
  wenigeVorlagen = false,
): RouteParams | null {
  const best = resolveRouteParams(t, ctx.brief, ctx.axes, opts);
  if (!best) return null;
  const serif = ctx.axes.serif && ctx.axes.serif.sicher >= 0.8 ? Math.sign(ctx.axes.serif.v) : 0;
  for (const form of best.fontForms)
    for (const mood of best.colorMoods) {
      const params =
        form === best.fontForms[0] && mood === best.colorMoods[0]
          ? best
          : resolveRouteParams(t, ctx.brief, ctx.axes, { ...opts, primaer: mood, primaerForm: form });
      if (params && differsEnough(params, chosen, stufe, serif, wenigeVorlagen)) return params;
    }
  return null;
}

/**
 * Doppelte Vorlagen aufloesen (`Nn`): Jede Vorlage bleibt bei genau einer Route, bevorzugt
 * bei der, deren Territorium sie selbst nennt, sonst bei der mit der besseren Passung.
 */
function dedupeTemplates(routes: Kandidat[], ctx: FitContext): Kandidat[] {
  const fit = new Map(routes.map((r) => [r.id, territoryFit(r.territory, ctx)]));
  const owner = new Map<string, Kandidat>();
  for (const r of routes)
    for (const id of r.params.signatureIds ?? []) {
      const base = baseId(id);
      const bisher = owner.get(base);
      if (!bisher) {
        owner.set(base, r);
        continue;
      }
      const eigen = (k: Kandidat): boolean => k.territory.signatureIds.includes(base);
      const besser =
        eigen(r) !== eigen(bisher) ? eigen(r) : (fit.get(r.id) ?? 0) > (fit.get(bisher.id) ?? 0);
      if (besser) owner.set(base, r);
    }
  return routes.map((r) => ({
    ...r,
    params: {
      ...r.params,
      signatureIds: (r.params.signatureIds ?? []).filter((id) => owner.get(baseId(id)) === r),
    },
  }));
}

/**
 * Vorlagen je Route nach Eignung (`In`): Die Vorlagen des Territoriums bleiben, wenn sie zur
 * Schriftkategorie der Route und zum Namen passen. Reichen sie nicht (weniger als 4), kommen
 * freie Vorlagen dazu: erst passende Stile, dann beliebige Stile, zuletzt auch andere
 * Schriftkategorien. Keine Vorlage geht an zwei Routen.
 */
function assignTemplates(routes: Kandidat[], brief: BrandBrief): Kandidat[] {
  const probes = probeNames(brief);
  const vergeben = new Set(routes.flatMap((r) => (r.params.signatureIds ?? []).map(baseId)));
  return routes.map((r) => {
    const kategorie = fontCategoryOf(r.params);
    const geeignet = (t: SignatureTemplate | undefined, gleicheSchrift = true): t is SignatureTemplate =>
      !!t &&
      (!gleicheSchrift || !kategorie || t.merkmale.schrift === kategorie) &&
      templateFitsRoute(t, r.params, brief, probes);
    const ids = (r.params.signatureIds ?? []).filter((id) => geeignet(FREIE_VORLAGEN_BY_ID.get(baseId(id))));
    if (ids.length < MIN_VORLAGEN) {
      const stile = new Set<string>([...r.territory.styles, ...r.territory.signatureStyles]);
      const stufen: [boolean, boolean, number][] = [
        [true, true, MIN_VORLAGEN + 1],
        [false, true, MIN_VORLAGEN + 1],
        [false, false, MIN_VORLAGEN],
      ];
      for (const [nurStile, gleicheSchrift, ziel] of stufen)
        for (const t of FREIE_VORLAGEN) {
          if (ids.length >= ziel) break;
          if (vergeben.has(t.id)) continue;
          if (nurStile && !t.passt.stile.some((s) => stile.has(s))) continue;
          if (!geeignet(t, gleicheSchrift)) continue;
          ids.push(t.id);
          vergeben.add(t.id);
        }
    }
    return { ...r, params: { ...r.params, signatureIds: ids } };
  });
}

/**
 * Rollen verteilen (`Pn`): Nur Routen mit mindestens 4 Vorlagen koennen die Vorlagen-Rolle
 * tragen. Gewaehlt wird die Verteilung mit den meisten klar verschiedenen Paaren, dann mit
 * den meisten Routen in ihrer Wunschrolle (`betonung`).
 */
function assignRoles(routes: Kandidat[], ctx: FitContext, vorlagen: readonly number[]): Kandidat[] {
  const moeglich = vorlagen.some((n) => n >= MIN_VORLAGEN)
    ? ROLLEN.filter((rollen) => (vorlagen[rollen.indexOf("vorlage")] ?? 0) >= MIN_VORLAGEN)
    : [["wortmarke", "wortmarke", "wortmarke"] as const];
  let best: { routes: Kandidat[]; score: number } | null = null;
  for (const rollen of moeglich) {
    const mitRolle = routes.map((r, i) => {
      const aufl: ResolveOptions = {
        ...r.aufl,
        rolle: rollen[i] as RouteRolle,
        primaer: r.params.colorMoods[0],
        primaerForm: r.params.fontForms[0],
      };
      return {
        ...r,
        aufl,
        params: resolveRouteParams(r.territory, ctx.brief, ctx.axes, { ...aufl, mutiger: 0 }) ?? r.params,
      };
    });
    let verschieden = 0;
    for (let i = 0; i < mitRolle.length; i++)
      for (let j = i + 1; j < mitRolle.length; j++)
        if (clearlyDifferent((mitRolle[i] as Kandidat).params, (mitRolle[j] as Kandidat).params)) verschieden++;
    const wunsch = mitRolle.filter((r, i) => r.territory.betonung === rollen[i]).length;
    const mitte = rollen.indexOf("mitte");
    const score = verschieden * 10 + wunsch + (mitte >= 0 && (vorlagen[mitte] ?? 0) >= 3 ? 0.5 : 0);
    if (!best || score > best.score) best = { routes: mitRolle, score };
  }
  return (best as { routes: Kandidat[] }).routes.map((r, i) => {
    const params = r.aufl.mutiger
      ? (resolveRouteParams(r.territory, ctx.brief, ctx.axes, r.aufl) ?? r.params)
      : r.params;
    return { ...r, params: { ...params, signatureIds: (routes[i] as Kandidat).params.signatureIds } };
  });
}

/** Die drei Routen mit Parametern, ohne Texte (`Rn`). */
function pickRoutes(brief: BrandBrief, options: ChooseRoutesOptions = {}): Kandidat[] {
  const axes = briefToAxes(brief);
  const seed = briefSeed(brief);
  const ctx: FitContext = { brief, axes, seed };
  const offenSeed = options.seed === undefined ? seed : hash(`${seed}:${options.seed}`);
  const optsFor = (art: RouteArt, id: RouteId): ResolveOptions => ({
    alpha: ALPHA[art],
    mutiger: options.mutiger?.[id] ?? 0,
    seed: offenSeed,
    offenSeed,
  });

  const erlaubt = TERRITORIES.filter((t) => resolveRouteParams(t, brief, axes, optsFor("sicher", "A")) !== null)
    .map((t) => ({ t, fit: territoryFit(t, ctx) }))
    .sort((a, b) => b.fit - a.fit);
  const rangliste =
    erlaubt.length >= 3
      ? erlaubt
      : TERRITORIES.map((t) => ({ t, fit: territoryFit(t, ctx) })).sort((a, b) => b.fit - a.fit);
  const bester = (rangliste[0] as { fit: number }).fit;
  const wenigeVorlagen = countFittingTemplates(brief) < 2 * MIN_VORLAGEN;

  const gewaehlt: Kandidat[] = [];
  const waehle = (art: RouteArt, id: RouteId, liste: readonly { t: Territory }[]): void => {
    const schon = gewaehlt.map((g) => g.params);
    const opts = optsFor(art, id);
    for (const stufe of [1, 2, 3, 4, 5])
      for (const { t } of liste) {
        if (gewaehlt.some((g) => g.territory.id === t.id)) continue;
        const params = resolveDistinct(t, ctx, opts, schon, stufe, wenigeVorlagen);
        if (params) {
          gewaehlt.push({ territory: t, art, id, params, aufl: opts });
          return;
        }
      }
    // Notfall: erstes freies Territorium, notfalls ohne "Nicht ich"
    for (const { t } of liste) {
      if (gewaehlt.some((g) => g.territory.id === t.id)) continue;
      const params =
        resolveRouteParams(t, brief, axes, opts) ??
        resolveRouteParams(t, { ...brief, avoidColors: [], avoidCliches: [] }, axes, opts);
      if (params) {
        gewaehlt.push({ territory: t, art, id, params, aufl: opts });
        return;
      }
    }
  };

  // A: beste Passung
  waehle("sicher", "A", rangliste);
  const a = gewaehlt[0] as Kandidat;

  // B: andere Hauptachse, Marktabstand zaehlt mit
  const mutig = rangliste
    .filter((r) => r.t.hauptachse !== a.territory.hauptachse)
    .map((r) => ({ ...r, s: r.fit + 0.3 * r.t.marktabstand }))
    .sort((x, y) => y.s - x.s);
  waehle("mutig", "B", mutig.length ? mutig : rangliste);
  const b = gewaehlt[1];

  // C: Referenzwelt, Abstand zu A und B, Marktabstand, noch passend
  const referenz = brief.reference;
  const ueberraschend = rangliste
    .filter((r) => r.fit >= bester - 0.6)
    .map((r) => ({
      ...r,
      s:
        (referenz && r.t.referenzen.includes(referenz) ? 0.5 : 0) +
        0.35 * axisDistance(r.t.achsen, a.territory.achsen) +
        0.15 * (b ? axisDistance(r.t.achsen, b.territory.achsen) : 0) +
        0.15 * r.t.marktabstand +
        0.3 * r.fit,
    }))
    .sort((x, y) => y.s - x.s);
  waehle("ueberraschend", "C", ueberraschend.length ? [...ueberraschend, ...rangliste] : rangliste);

  const mitVorlagen = assignTemplates(dedupeTemplates(gewaehlt, ctx), brief);
  return assignRoles(
    mitVorlagen,
    ctx,
    mitVorlagen.map((r) => (r.params.signatureIds ?? []).length),
  );
}

/** Drei Routen mit Parametern und Regeltexten (`Dn`). */
export function chooseRoutes(brief: BrandBrief, options: ChooseRoutesOptions = {}): BrandRoute[] {
  const benutzt = new Set<string>();
  return pickRoutes(brief, options).map((r) => ({
    id: r.id,
    art: r.art,
    territory: r.territory.id,
    titel: r.territory.titel,
    params: r.params,
    texte: routeTexts(r.territory, brief, r.art, r.params, benutzt),
  }));
}

/** Was eine Route an der Logo-Eingabe aendert: Stile, Farben, Themen und die Route (`Tn`). */
export function routeToBrandInputPatch(
  route: Pick<BrandRoute, "params">,
): Pick<BrandInput, "styles" | "colorMoods" | "themes" | "route"> {
  const p = route.params;
  return {
    styles: p.styles.slice(0, 2),
    colorMoods: [...p.colorMoods],
    themes: p.themes.filter((t) => !p.avoidThemes.includes(t)),
    route: p,
  };
}

/** Eingabe des Namensgenerators, soweit sie aus Route und Brief kommt. */
export interface RouteNameInput {
  focus: NameFocus[];
  styles: StyleKey[];
  keywords: string[];
  route: RouteParams;
  person?: string;
  company?: string;
  region?: string;
}

/** Eingabe fuer den Namensgenerator aus Route und Brief (`Ln`). */
export function routeToNameInput(route: Pick<BrandRoute, "params">, brief: BrandBrief): RouteNameInput {
  const p = route.params;
  const out: RouteNameInput = {
    focus: [...(brief.focus ?? [])],
    styles: p.styles.slice(0, 2),
    keywords: [],
    route: p,
  };
  const person = brief.person?.trim();
  const name = brief.hasName ? brief.name?.trim() : undefined;
  if (brief.architecture === "buero") {
    if (name) out.company = name;
  } else if (person) out.person = person;
  else if (name && brief.architecture) out.person = name;
  else if (name) out.company = name;
  if (brief.place?.trim()) out.region = brief.place.trim();
  return out;
}
