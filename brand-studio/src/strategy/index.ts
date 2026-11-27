/**
 * Markenkompass und drei Routen: oeffentliche Schnittstelle der Strategie (docs/18).
 *
 * Ablauf: Brief (Antworten) -> Achsen -> drei Routen (sicher, mutig, ueberraschend) mit
 * Parametern fuer Logo-Engine und Namensfinder und mit Regeltexten. Optional formuliert die
 * KI die Texte innerhalb der Routen neu (kiTexte, nur mit Einwilligung).
 */
import type { BrandBrief } from "./types";

export type * from "./types";
export { AXIS_KEYS } from "./types";

/** Leerer Brief, wie ihn der Kompass beim Start anlegt. */
export function emptyBrief(): BrandBrief {
  return { version: 1 };
}

export { briefToAxes, briefPreviewParams, briefSeed, axisDistance, stableKey } from "./axes";
export {
  chooseRoutes,
  routeToBrandInputPatch,
  routeToNameInput,
  type ChooseRoutesOptions,
  type RouteNameInput,
} from "./routes";
export { TERRITORIES, VORLAGEN_GESPERRT, territoryById } from "./territories";
export { territoryFit, resolveRouteParams, avoidFromBrief, clearlyDifferent } from "./params";
export {
  routeTexts,
  socialKit,
  persoenlichkeit,
  wunschkunde,
  versprechen,
  formate,
  cleanText,
  countWords,
  findCliche,
  isValidClaim,
  fillTemplate,
  GEDANKENSTRICH,
  KLISCHEE_MUSTER,
} from "./texts";
export {
  kiTexte,
  buildStrategieRequest,
  pruefeKiTexte,
  mergeKiTexte,
  hatKontaktdaten,
  KI_TEXTE_ENDPOINT,
  KI_TEXTE_TIMEOUT_MS,
  type KiTexteOptions,
  type StrategieRequest,
  type StrategieResponse,
  type StrategieFehler,
  type StrategieBrief,
  type StrategieRoute,
  type KiRoutenTexte,
} from "./kiTexte";
export {
  KOMPASS_INTRO,
  KOMPASS,
  ONLYNESS_KARTEN,
  ALTERNATIVEN,
  REFERENZ_WELTEN,
  KLISCHEES,
  STIMM_PAARE,
  LOGO_PAARE,
  FARB_PAARE,
  FARB_WELTEN,
  FOKUS_OPTIONEN,
  ARCHITEKTUR_OPTIONEN,
  ERFAHRUNG_OPTIONEN,
  SEGMENT_OPTIONEN,
  WUNSCHKUNDEN,
  WERTE,
  PERSOENLICHKEIT,
  FORMATE,
  KANAELE,
  antwortSetzen,
  antwortLesen,
  frageSichtbar,
  frageById,
  kompassFortschritt,
  type Antwort,
  type KompassFrage,
  type KompassOption,
  type KompassSchritt,
  type KompassIntro,
} from "./catalog";
