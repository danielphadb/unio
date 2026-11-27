/**
 * Feste Listen ohne Abhängigkeiten. Eigene Datei, damit index.ts sie beim Laden
 * nutzen kann, auch wenn render.ts im Importkreis mit der Logo-Engine
 * (render.ts, engine/renderLogo.ts, signature/index.ts) noch nicht ausgewertet ist.
 */

/** Felder des Zusatzes (Nebenschrift); hier wirken Zusatz-Größe und -Schreibung (`ur`, Export `Z`). */
export const ZUSATZ_FELDER: readonly string[] = [
  "zusatz",
  "ort",
  "zusatzOrt",
  "zusatzOderOrt",
  "ortOderZusatz",
  "ort2",
  "jahr",
  "partnerZeile",
];
