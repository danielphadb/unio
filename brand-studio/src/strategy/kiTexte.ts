/**
 * Texte der Routen mit KI formulieren (Routes-Chunk: `Re`, `Ke`, `De`, `L`, `Me`, `Ce`, `K`,
 * `Oe`, `Ae`, `Fe`). Client fuer den Server `/api/brand-strategie` (server/brand-strategie.js).
 *
 * Grundsaetze (docs/18, Abschnitt 6 und 11):
 * - Nur mit Einwilligung (gemeinsamer Schalter "KI-Funktionen"). Ohne Einwilligung, ohne
 *   fetch, bei Fehler, Zeitueberschreitung oder Abbruch bleiben die Regeltexte (Rueckfall).
 * - Uebertragen werden Antworten und Name, nie Kontaktdaten: Freitexte mit E-Mail,
 *   Telefonnummer oder Web-Adresse fallen weg.
 * - Die KI formuliert nur innerhalb der Route. Jeder Text wird geprueft (Laenge, Klischee,
 *   keine neuen Zahlen ausser denen aus dem eigenen Beleg, Claim-Regel). Was die Pruefung
 *   nicht besteht, bleibt beim Regeltext.
 */
import { cleanText, countWords, findCliche, isValidClaim } from "./texts";
import { territoryById } from "./territories";
import type { BrandBrief, BrandRoute, RouteTexts } from "./types";

/** Endpunkt der Vercel-Function (`Re`). */
export const KI_TEXTE_ENDPOINT = "/api/brand-strategie";
/** Zeitlimit des Aufrufs in Millisekunden (`Ke`). */
export const KI_TEXTE_TIMEOUT_MS = 55_000;

/** Kontaktdaten: E-Mail, Telefonnummer, Web-Adresse (`De`). */
const KONTAKT_MUSTER: readonly RegExp[] = [
  /[^\s@]+@[^\s@]+\.[^\s@]+/,
  /(?:\+|\b00|\b0)\d[\d\s/().-]{5,}\d/,
  /https?:\/\/|www\.|\.(?:at|de|com|net|org|ch|eu)\b/i,
];

/** Enthaelt der Text Kontaktdaten? Gleiche Regel wie auf dem Server. */
export function hatKontaktdaten(text: string): boolean {
  return KONTAKT_MUSTER.some((r) => r.test(text));
}

/** Freitext fuer die Anfrage: ohne Steuerzeichen, gekuerzt, ohne Kontaktdaten (`L`). */
function freitext(value: string | undefined, max: number): string | undefined {
  const t = (value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
  return t && !hatKontaktdaten(t) ? t : undefined;
}

/** Antworten, wie sie an den Server gehen (Feldnamen deutsch, alles optional). */
export interface StrategieBrief {
  name?: string;
  ort?: string;
  architektur?: string;
  erfahrung?: string;
  wunschkunde?: string[];
  werte?: string[];
  wirkung?: string[];
  fremdbild?: string[];
  segment?: string;
  /** -2 bis 2 */
  seite?: number;
  fokus?: string[];
  alternative?: string;
  onlyness?: string[];
  onlynessText?: string;
  beleg?: string;
  stimme?: Record<string, number>;
  referenz?: string;
  social?: { kanaele?: string[]; kamera?: string; nie?: string[] };
}

/** Eine Route, wie sie an den Server geht: Rahmen, innerhalb dessen die KI formuliert. */
export interface StrategieRoute {
  id: string;
  art: string;
  territorium: string;
  titel: string;
  kernidee: string;
  schluesselwoerter: string[];
  gegenbild?: { markt: string; wir: string };
  verbote: string[];
  leitplanken: string[];
  sagen: string[];
  vermeiden: string[];
  saeulen: string[];
}

/** Anfrage an `/api/brand-strategie`. */
export interface StrategieRequest {
  brief: StrategieBrief;
  /** genau drei Routen */
  routen: StrategieRoute[];
}

/** Texte, die die KI liefern darf (alle optional, jeder wird einzeln geprueft). */
export interface KiRoutenTexte {
  kernidee?: string;
  onlyness?: string;
  positionierung?: string;
  claim?: string;
  storyKurz?: string;
  storyMittel?: string;
  tonBeispiele?: string[];
  wunschkunde?: string;
  versprechen?: string;
  persoenlichkeit?: { eigenschaft: string; satz: string }[];
  socialKit?: { saeulen: { titel: string; hooks: string[] }[]; profiltext: string };
}

/** Antwort von `/api/brand-strategie` bei Erfolg. */
export interface StrategieResponse {
  ok: true;
  routen: { id: string; texte: KiRoutenTexte }[];
  modell: string;
  nutzung: { eingabe: number; ausgabe: number; cache: number };
  /** Antwort aus dem Testmodus (ohne Modellaufruf) */
  testmodus?: boolean;
}

/** Antwort bei Fehler oder Bremse: Die Oberflaeche bleibt bei den Regeltexten. */
export interface StrategieFehler {
  ok: false;
  fehler: string;
  fallback: "regel";
}

const bis = (liste: readonly string[], anzahl: number, laenge: number): string[] =>
  liste.map((s) => s.slice(0, laenge)).slice(0, anzahl);
const einmalig = <T>(liste: readonly T[], anzahl: number): T[] => [...new Set(liste)].slice(0, anzahl);

/** Anfrage aus Brief und Routen bauen; `null`, wenn es nicht genau drei Routen sind (`Me`). */
export function buildStrategieRequest(brief: BrandBrief, routes: readonly BrandRoute[]): StrategieRequest | null {
  if (!Array.isArray(routes) || routes.length !== 3) return null;
  const b: StrategieBrief = {};
  const name = freitext((brief.hasName ? brief.name : undefined) ?? brief.person ?? brief.name, 60);
  if (name) b.name = name;
  const ort = freitext(brief.place, 60);
  if (ort) b.ort = ort;
  if (brief.architecture) b.architektur = brief.architecture;
  if (brief.erfahrung) b.erfahrung = brief.erfahrung;
  for (const [feld, werte] of [
    ["wunschkunde", brief.wunschkunde],
    ["werte", brief.werte],
    ["wirkung", brief.wirkung],
    ["fremdbild", brief.fremdbild],
  ] as const)
    if (werte?.length) b[feld] = einmalig(werte, 2);
  if (brief.segment) b.segment = brief.segment;
  if (typeof brief.side === "number" && Number.isInteger(brief.side) && Math.abs(brief.side) <= 2)
    b.seite = brief.side;
  if (brief.focus?.length) b.fokus = einmalig(brief.focus, 7);
  if (brief.alternative) b.alternative = brief.alternative;
  if (brief.onlyness?.length) b.onlyness = einmalig(brief.onlyness, 2);
  const eigenerSatz = freitext(brief.onlynessText, 300);
  if (eigenerSatz) b.onlynessText = eigenerSatz;
  const beleg = freitext(brief.proof, 300);
  if (beleg) b.beleg = beleg;
  if (brief.voice && Object.keys(brief.voice).length) b.stimme = { ...brief.voice } as Record<string, number>;
  if (brief.reference) b.referenz = brief.reference;
  const s = brief.social;
  if (s && (s.channels?.length || s.camera || s.never?.length)) {
    const social: NonNullable<StrategieBrief["social"]> = {};
    if (s.channels?.length) social.kanaele = einmalig(s.channels, 6);
    if (s.camera) social.kamera = s.camera;
    if (s.never?.length) social.nie = einmalig(s.never, 5);
    b.social = social;
  }
  return {
    brief: b,
    routen: routes.map((r) => {
      const t = territoryById(r.territory);
      return {
        id: r.id,
        art: r.art,
        territorium: r.territory.slice(0, 40),
        titel: r.titel.slice(0, 60),
        kernidee: r.texte.kernidee.slice(0, 300),
        schluesselwoerter: bis(r.texte.schluesselwoerter, 5, 40),
        ...(t
          ? {
              gegenbild: { markt: t.gegenbild.markt.slice(0, 300), wir: t.gegenbild.wir.slice(0, 300) },
              verbote: bis(t.verbote, 8, 120),
            }
          : { verbote: [] }),
        leitplanken: bis(r.texte.leitplanken, 10, 200),
        sagen: bis(r.texte.sagen, 6, 120),
        vermeiden: bis(r.texte.vermeiden, 6, 120),
        saeulen: bis((r.texte.socialKit?.saeulen ?? []).map((x: { titel: string }) => x.titel), 3, 60),
      };
    }),
  };
}

/** Alle Zahlen im Text kommen auch im eigenen Beleg vor (`Ce`). */
function nurBelegteZahlen(text: string, beleg: string): boolean {
  const erlaubt = new Set(beleg.match(/\d+/g) ?? []);
  return (text.match(/\d+/g) ?? []).every((z) => erlaubt.has(z));
}

/** Grundpruefung jedes KI-Textes: nicht leer, kein Klischee, keine erfundenen Zahlen (`K`). */
const tragbar = (text: string, beleg: string): boolean => !!text && !findCliche(text) && nurBelegteZahlen(text, beleg);

/**
 * KI-Texte einer Route pruefen (`Oe`). Uebernommen wird nur, was die Regeln erfuellt:
 * Kernidee bis 30 Woerter, Onlyness bis 40, Positionierung bis 70 mit "Für", "Anders als"
 * und "Weil", Claim nach Claim-Regel, Story kurz bis 35 und mittel 70 bis 100 Woerter,
 * 2 Tonbeispiele bis 40, Wunschkunde bis 35, Versprechen bis 25 in Sie-Form,
 * 3 verschiedene Eigenschaften, Social-Kit mit 3 Saeulen zu je 4 bis 5 Hooks.
 */
export function pruefeKiTexte(roh: unknown, brief: BrandBrief): Partial<RouteTexts> {
  if (!roh || typeof roh !== "object") return {};
  const n = roh as Record<string, unknown>;
  const beleg = brief.proof ?? "";
  const out: Partial<RouteTexts> = {};
  const text = (feld: string): string => (typeof n[feld] === "string" ? cleanText(n[feld] as string) : "");

  const kernidee = text("kernidee");
  if (tragbar(kernidee, beleg) && countWords(kernidee) <= 30) out.kernidee = kernidee;
  const onlyness = text("onlyness");
  if (tragbar(onlyness, beleg) && countWords(onlyness) <= 40) out.onlyness = onlyness;
  const positionierung = text("positionierung");
  if (
    tragbar(positionierung, beleg) &&
    countWords(positionierung) <= 70 &&
    /^Für\b/.test(positionierung) &&
    /Anders als/i.test(positionierung) &&
    /\bWeil\b/.test(positionierung)
  )
    out.positionierung = positionierung;
  const claim = text("claim").replace(/\.$/, "");
  if (isValidClaim(claim)) out.claim = claim;
  const storyKurz = text("storyKurz");
  if (tragbar(storyKurz, beleg) && countWords(storyKurz) <= 35) out.storyKurz = storyKurz;
  const storyMittel = text("storyMittel");
  if (tragbar(storyMittel, beleg) && countWords(storyMittel) >= 70 && countWords(storyMittel) <= 100)
    out.storyMittel = storyMittel;
  const tonBeispiele = Array.isArray(n.tonBeispiele)
    ? n.tonBeispiele
        .filter((s): s is string => typeof s === "string")
        .map(cleanText)
        .filter((s) => tragbar(s, beleg) && countWords(s) <= 40)
    : [];
  if (tonBeispiele.length >= 2) out.tonBeispiele = tonBeispiele.slice(0, 2);
  const wunschkunde = text("wunschkunde");
  if (tragbar(wunschkunde, beleg) && countWords(wunschkunde) <= 35) out.wunschkunde = wunschkunde;
  const versprechen = text("versprechen");
  if (
    tragbar(versprechen, beleg) &&
    countWords(versprechen) <= 25 &&
    /\b(Sie|Ihr|Ihre|Ihren|Ihrem|Ihres|Ihrer)\b/.test(versprechen)
  )
    out.versprechen = versprechen;

  if (Array.isArray(n.persoenlichkeit)) {
    const liste = (n.persoenlichkeit as unknown[])
      .map((r) => {
        const e = r as { eigenschaft?: unknown; satz?: unknown } | null;
        return {
          eigenschaft: typeof e?.eigenschaft === "string" ? cleanText(e.eigenschaft) : "",
          satz: typeof e?.satz === "string" ? cleanText(e.satz) : "",
        };
      })
      .filter(
        (r) =>
          r.eigenschaft &&
          countWords(r.eigenschaft) <= 3 &&
          tragbar(r.eigenschaft, beleg) &&
          tragbar(r.satz, beleg) &&
          countWords(r.satz) <= 20,
      );
    if (liste.length >= 3 && new Set(liste.slice(0, 3).map((r) => r.eigenschaft)).size === 3)
      out.persoenlichkeit = liste.slice(0, 3);
  }

  const kit = n.socialKit as { saeulen?: unknown; profiltext?: unknown } | undefined;
  if (kit && Array.isArray(kit.saeulen) && kit.saeulen.length === 3 && typeof kit.profiltext === "string") {
    const saeulen = (kit.saeulen as unknown[]).map((x) => {
      const s = x as { titel?: unknown; hooks?: unknown } | null;
      return {
        titel: typeof s?.titel === "string" ? cleanText(s.titel).slice(0, 60) : "",
        hooks: (Array.isArray(s?.hooks) ? (s.hooks as unknown[]) : [])
          .filter((h): h is string => typeof h === "string")
          .map(cleanText)
          .filter((h) => tragbar(h, beleg) && countWords(h) <= 25)
          .slice(0, 5),
      };
    });
    const profiltext = cleanText(kit.profiltext);
    if (
      saeulen.every((s) => s.titel && !findCliche(s.titel) && s.hooks.length >= 4) &&
      tragbar(profiltext, beleg) &&
      profiltext.length <= 150
    )
      out.socialKit = { saeulen, profiltext };
  }
  return out;
}

/**
 * Gepruefte KI-Texte in die Routen uebernehmen (`Ae`). Routen, fuer die nichts besteht,
 * bleiben unveraendert; uebernommene Texte tragen `quelle: "ki"`.
 */
export function mergeKiTexte(routes: BrandRoute[], antwort: unknown, brief: BrandBrief): BrandRoute[] {
  if (!antwort || typeof antwort !== "object") return routes;
  const a = antwort as { ok?: unknown; routen?: unknown };
  if (a.ok !== true || !Array.isArray(a.routen)) return routes;
  const liste = a.routen as unknown[];
  return routes.map((r) => {
    const eintrag = liste.find((x) => !!x && (x as { id?: unknown }).id === r.id) as { texte?: unknown } | undefined;
    const texte = pruefeKiTexte(eintrag?.texte, brief);
    return Object.keys(texte).length ? { ...r, texte: { ...r.texte, ...texte, quelle: "ki" } } : r;
  });
}

export interface KiTexteOptions {
  /** Einwilligung der Person (Schalter "KI-Funktionen"); ohne sie kein Aufruf */
  einwilligung: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Routen-Texte mit KI formulieren lassen (`Fe`). Gibt immer Routen zurueck: bei jedem
 * Problem die unveraenderten Regeltexte.
 */
export async function kiTexte(
  brief: BrandBrief,
  routes: BrandRoute[],
  options?: KiTexteOptions,
): Promise<BrandRoute[]> {
  if (!options || options.einwilligung !== true) return routes;
  const body = buildStrategieRequest(brief, routes);
  if (!body) return routes;
  const doFetch = options.fetchImpl ?? (typeof fetch === "function" ? fetch : undefined);
  if (!doFetch || options.signal?.aborted) return routes;
  const controller = new AbortController();
  const abbrechen = (): void => controller.abort();
  options.signal?.addEventListener("abort", abbrechen, { once: true });
  const timer = setTimeout(abbrechen, Math.max(1, options.timeoutMs ?? KI_TEXTE_TIMEOUT_MS));
  try {
    const res = await doFetch(options.endpoint ?? KI_TEXTE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      credentials: "same-origin",
    });
    if (!res.ok) return routes;
    const json: unknown = await res.json();
    return controller.signal.aborted ? routes : mergeKiTexte(routes, json, brief);
  } catch {
    return routes;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abbrechen);
  }
}
