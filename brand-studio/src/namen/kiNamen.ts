/**
 * Namensideen der KI holen und pruefen (nameFinder-Chunk: `Hd`, `Gd`, `la`, `xd`, `Bt`, `Dr`,
 * `Pr`, `Ld`, `Ad`, `Ed`, `Md`, `ul`, `oa`, `Pd`, `sl`). Client fuer den Server
 * `/api/brand-namen` (server/brand-namen.js).
 *
 * Grundsaetze:
 * - Nur mit Einwilligung (Schalter "KI-Funktionen" in der Oberflaeche).
 * - Uebertragen werden Vor- und Nachname, Firma, Region, Ort, Stil, Stichworte, Arten,
 *   ausgeschlossene und gemerkte Namen; nie Kontaktdaten.
 * - Jeder Name der KI laeuft durch dieselben Sperren wie die eigenen Vorschlaege
 *   (`pruefeFremdnamen`). Ohne fetch, bei Fehler, Zeitueberschreitung oder Abbruch kommt
 *   `null` zurueck; die Oberflaeche zeigt dann nur die eigenen Vorschlaege.
 */
import {
  pruefeFremdnamen,
  type ForeignName,
  type NameInput,
  type NameSuggestion,
} from "../engine/names";
import { inputFromForm, type NameFinderForm } from "../engine/names/finder";
import type { StyleKey } from "../types";

/** Endpunkt der Vercel-Function (`Hd`). */
export const KI_NAMEN_ENDPOINT = "/api/brand-namen";
/** Zeitlimit des Aufrufs in Millisekunden (`Gd`). */
export const KI_NAMEN_TIMEOUT_MS = 55_000;
/** Mindest- und Hoechstzahl erbetener Namen (`la`, `xd`). */
export const KI_NAMEN_MIN = 20;
export const KI_NAMEN_MAX = 40;

/** Arten, die der Server liefern darf (`Bt`). */
export const KI_NAMEN_ARTEN = [
  "kreativ",
  "bildhaft",
  "zusammengesetzt",
  "abgewandelt",
  "fremdsprachig",
  "kurz",
  "personenbezogen",
  "ortsbezogen",
] as const;
export type KiNamenArt = (typeof KI_NAMEN_ARTEN)[number];

/** Marke in der Anfrage. */
export interface KiNamenMarke {
  vorname?: string;
  nachname?: string;
  firma?: string;
}

/** Anfrage an `/api/brand-namen`. */
export interface KiNamenRequest {
  marke?: KiNamenMarke;
  /** Pflicht: Region oder Bezirk */
  region: string;
  ort?: string;
  stil?: StyleKey;
  /** hoechstens 8, je bis 40 Zeichen */
  stichworte: string[];
  arten?: KiNamenArt[];
  /** schon gezeigte oder ausgeblendete Namen, hoechstens 100 */
  ausschluss?: string[];
  /** gemerkte Namen, hoechstens 20 */
  gemerkt?: string[];
  /** 20 bis 40 */
  anzahl: number;
}

/** Ein Name der KI. */
export interface KiName {
  name: string;
  art: KiNamenArt;
  bedeutung: string;
  sprache: string;
}

/** Antwort von `/api/brand-namen`. */
export interface KiNamenResponse {
  ok: true;
  namen: KiName[];
  modell?: string;
  testmodus?: boolean;
  nutzung?: { eingabe: number; ausgabe: number; cache: number };
}

/** Fehlerantwort; die Oberflaeche bleibt bei den eigenen Vorschlaegen. */
export interface KiNamenFehler {
  ok: false;
  fehler: string;
  fallback: "regel";
}

/** Text kuerzen (`Dr`). */
const cut = (value: string | undefined, max: number): string => (value ?? "").trim().slice(0, max);
/** Liste ohne Doppel und Leere, gekuerzt (`Pr`). */
const cutList = (values: readonly string[] | undefined, count: number, max: number): string[] =>
  [...new Set((values ?? []).map((v) => cut(v, max)).filter(Boolean))].slice(0, count);

/** Eingabe des Namensfinders aus der Anfrage (`Ld`), falls keine mitgegeben wird. */
export function inputFromRequest(request: Partial<KiNamenRequest>): NameInput {
  return {
    person:
      [request.marke?.vorname, request.marke?.nachname]
        .map((s) => (s ?? "").trim())
        .filter(Boolean)
        .join(" ") || undefined,
    company: request.marke?.firma?.trim() || undefined,
    region: (request.ort ?? "").trim() || (request.region ?? "").trim() || undefined,
    focus: [],
    styles: request.stil ? [request.stil] : [],
    keywords: cutList(request.stichworte, 8, 40),
  };
}

/** Anfrage in Grenzen bringen (`Ad`); ohne Region `null`. */
export function normalizeRequest(
  request: Partial<KiNamenRequest> | null | undefined,
): KiNamenRequest | null {
  if (!request || typeof request.region !== "string" || !request.region.trim()) return null;
  const out: KiNamenRequest = {
    region: cut(request.region, 60),
    stichworte: cutList(request.stichworte, 8, 40),
    anzahl: Math.max(
      KI_NAMEN_MIN,
      Math.min(KI_NAMEN_MAX, Math.round(Number(request.anzahl) || KI_NAMEN_MIN)),
    ),
  };
  const marke: KiNamenMarke = {};
  for (const key of ["vorname", "nachname", "firma"] as const) {
    const v = cut(request.marke?.[key], 60);
    if (v) marke[key] = v;
  }
  if (Object.keys(marke).length) out.marke = marke;
  const ort = cut(request.ort, 60);
  if (ort) out.ort = ort;
  if (request.stil) out.stil = request.stil;
  const arten = (request.arten ?? []).filter((a) =>
    (KI_NAMEN_ARTEN as readonly string[]).includes(a),
  );
  if (arten.length) out.arten = [...new Set(arten)];
  const ausschluss = cutList(request.ausschluss, Number.MAX_SAFE_INTEGER, 60);
  if (ausschluss.length) out.ausschluss = ausschluss.slice(-100);
  const gemerkt = cutList(request.gemerkt, 20, 60);
  if (gemerkt.length) out.gemerkt = gemerkt;
  return out;
}

/** Antwort lesen (`Ed`); ein ungueltiger Eintrag verwirft die ganze Antwort. */
export function parseResponse(data: unknown): KiName[] | null {
  if (!data || typeof data !== "object") return null;
  const r = data as { ok?: unknown; namen?: unknown };
  if (r.ok !== true || !Array.isArray(r.namen)) return null;
  const out: KiName[] = [];
  for (const item of r.namen) {
    if (!item || typeof item !== "object") return null;
    const n = item as Record<string, unknown>;
    if (
      typeof n.name !== "string" ||
      !n.name.trim() ||
      typeof n.art !== "string" ||
      !(KI_NAMEN_ARTEN as readonly string[]).includes(n.art)
    )
      return null;
    out.push({
      name: n.name.trim(),
      art: n.art as KiNamenArt,
      bedeutung: typeof n.bedeutung === "string" ? n.bedeutung : "",
      sprache: typeof n.sprache === "string" ? n.sprache : "",
    });
  }
  return out;
}

/** Pruefung der KI-Namen, z. B. `pruefeFremdnamen`. */
export type KiNamenPruefung = (names: ForeignName[], input: NameInput) => NameSuggestion[];

export interface KiNamenOptions {
  pruefe: KiNamenPruefung;
  /** Eingabe fuer die Pruefung; fehlt sie, kommt sie aus der Anfrage */
  nameInput?: NameInput;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
  endpoint?: string;
}

/** Namen beim Server holen und pruefen (`Md`); bei jedem Fehler `null`. */
export async function fetchKiNamen(
  request: Partial<KiNamenRequest>,
  options: KiNamenOptions,
): Promise<NameSuggestion[] | null> {
  if (!options || typeof options.pruefe !== "function") return null;
  const body = normalizeRequest(request);
  if (!body) return null;
  const doFetch = options.fetchImpl ?? (typeof fetch === "function" ? fetch : undefined);
  if (!doFetch || options.signal?.aborted) return null;
  const controller = new AbortController();
  const abort = (): void => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, Math.max(1, options.timeoutMs ?? KI_NAMEN_TIMEOUT_MS));
  try {
    const res = await doFetch(options.endpoint ?? KI_NAMEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const names = parseResponse(await res.json());
    if (!names || controller.signal.aborted) return null;
    const checked = options.pruefe(names, options.nameInput ?? inputFromRequest(request));
    return Array.isArray(checked) ? checked : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}

/**
 * Anfrage aus dem Formular (`ul`, Export `k`): Vorname aus allen Woertern ausser dem letzten,
 * Nachname aus dem letzten. Ohne Region `null`.
 */
export function requestFromForm(
  form: NameFinderForm,
  excluded: readonly string[],
  saved: readonly string[],
): KiNamenRequest | null {
  const input = inputFromForm(form);
  const region = (input.region ?? "").trim();
  if (!region) return null;
  const words = form.person.trim().split(/\s+/).filter(Boolean);
  const marke: KiNamenMarke = {};
  if (words.length > 1) marke.vorname = words.slice(0, -1).join(" ");
  if (words.length) marke.nachname = words[words.length - 1];
  if ((form.company ?? "").trim()) marke.firma = (form.company ?? "").trim();
  return {
    ...(Object.keys(marke).length ? { marke } : {}),
    region,
    stichworte: input.keywords ?? [],
    ...(form.style !== "egal" ? { stil: form.style } : {}),
    ausschluss: excluded.slice(0, 100),
    gemerkt: saved.slice(0, 20),
    anzahl: 24,
  };
}

/** Laufende und fertige Abrufe je Schluessel (`oa`). */
const CACHE = new Map<string, Promise<NameSuggestion[] | null>>();

/** Standard-Pruefung (`Pd`). */
const defaultCheck = (): KiNamenPruefung | null =>
  typeof pruefeFremdnamen === "function" ? pruefeFremdnamen : null;

/**
 * KI-Namen fuer einen Schluessel holen, einmal je Schluessel (`sl`, Export `f`). Ohne
 * Pruefung kommt sofort `null`.
 */
export function kiNamen(
  key: string,
  request: Partial<KiNamenRequest>,
  input?: NameInput,
  pruefe: KiNamenPruefung | null = defaultCheck(),
): Promise<NameSuggestion[] | null> {
  if (!pruefe) return Promise.resolve(null);
  let pending = CACHE.get(key);
  if (!pending) {
    pending = fetchKiNamen(request, { pruefe, nameInput: input });
    CACHE.set(key, pending);
  }
  return pending;
}
