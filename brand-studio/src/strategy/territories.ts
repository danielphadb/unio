/**
 * Territorien-Katalog (kompass-Chunk: `mn`, `ee`, `_n`, `fn`).
 *
 * Ein Territorium ist ein fester Parametersatz: Gegenbild zum Markt, Kernidee, erlaubte Stile,
 * Farben, Schriften, Bildthemen und Vorlagen, Namensarten, Ton, Leitplanken und Textbausteine
 * (docs/18, Abschnitt 6). Die Aufloesung zu Routenparametern steht in params.ts.
 *
 * Daten: territories.json (W1 aus dem Bundle gezogen, unveraendert).
 */
import territoryData from "./territories.json";
import type { Territory } from "./types";

/** Alle 12 Territorien in Katalog-Reihenfolge (`ee`). */
export const TERRITORIES = territoryData as unknown as readonly Territory[];

/** Territorium ueber seine ID (`_n`, Export `t`). */
export function territoryById(id: string): Territory | undefined {
  return TERRITORIES.find((t) => t.id === id);
}

/**
 * Signature-Vorlagen, die nie einer Route zugeteilt werden (`fn`): Haus-, Fenster- und
 * Siegelmotive, die als Makler-Klischee gelten oder zu nah am Markt liegen.
 */
export const VORLAGEN_GESPERRT: readonly string[] = [
  "sig-serliana",
  "sig-fensterpunkt",
  "sig-schlussstein",
  "sig-graetzlsiegel",
  "sig-luenette",
  "sig-kreisinitial",
  "sig-fundament",
  "sig-fuge",
];
