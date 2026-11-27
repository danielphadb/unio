/**
 * Energieausweis in Inseraten und Unterlagen (EAVG-Novelle, seit 1.7.2026): Inserate brauchen
 * HWB sowie EEB samt Effizienzklasse; fGEE nur noch bei aelteren Ausweisen ohne EEB, die vor
 * dem Stichtag ausgestellt wurden (energy-Chunk der gesicherten Fassung).
 */
import type { EnergyData } from "../../types";

/** Stichtag der Novelle (`u`, Export `c`). */
export const ENERGY_CUTOFF = "2026-07-01";

/** Welche Angaben gelten: EEB (neu) oder fGEE (aelterer Ausweis). */
export type EnergyMode = "eeb" | "fgee";
/** Vollstaendigkeit der drei Pflichtwerte. */
export type EnergyState = "voll" | "teil" | "leer";

/** Eine Zeile der Energieangaben, z. B. "HWB 32 kWh/m²a". */
export interface EnergyPart {
  text: string;
  /** Erklaerung fuer Laien */
  sub: string;
  /** Wert fehlt (im Text steht "...") */
  missing: boolean;
}

/** Wert gekuerzt auf 24 Zeichen, Leerraum zusammengezogen (`s`). */
const clean = (value: string | undefined): string =>
  (value ?? "").replace(/\s+/g, " ").trim().slice(0, 24);

/** EEB, sobald EEB oder EEB-Klasse da ist; sonst fGEE bei aelterem Ausweis (`g`). */
export function energyMode(energy: EnergyData | undefined): EnergyMode {
  if (!energy || clean(energy.eeb) || clean(energy.eebKlasse)) return "eeb";
  const date = clean(energy.ausweisDatum);
  return clean(energy.fgee) && (!date || date < ENERGY_CUTOFF) ? "fgee" : "eeb";
}

/** Drei Teile der Energiezeile (`a`, Export `b`). */
export function energyParts(object: { energy?: EnergyData } | null | undefined): EnergyPart[] {
  const energy = object?.energy;
  const part = (label: string, value: string, unit: string, sub: string): EnergyPart => ({
    text: `${label} ${value || "..."}${unit ? ` ${unit}` : ""}`,
    sub,
    missing: !value,
  });
  return energyMode(energy) === "fgee"
    ? [
        part("HWB", clean(energy?.hwb), "kWh/m²a", "Heizwärmebedarf"),
        part("fGEE", clean(energy?.fgee), "", "Gesamtenergieeffizienz"),
        part("Klasse", clean(energy?.klasse), "", "Effizienzklasse"),
      ]
    : [
        part("HWB", clean(energy?.hwb), "kWh/m²a", "Heizwärmebedarf"),
        part("EEB", clean(energy?.eeb), "kWh/m²a", "Endenergiebedarf"),
        part("Klasse", clean(energy?.eebKlasse), "", "Effizienzklasse"),
      ];
}

/** Energiezeile als Text, z. B. "HWB 32 kWh/m²a, fGEE 0,78, Klasse B" (`E`, Export `e`). */
export function energyText(object: { energy?: EnergyData } | null | undefined): string {
  return energyParts(object)
    .map((p) => p.text)
    .join(", ");
}

/** Platzhalter-Zeile ohne Werte: "HWB ... kWh/m²a, EEB ... kWh/m²a, Klasse ..." */
export const ENERGY_PLACEHOLDER = energyText(undefined);

/** Wie viele der drei Werte vorhanden sind (`c`, Export `a`). */
export function energyState(object: { energy?: EnergyData } | null | undefined): EnergyState {
  const filled = energyParts(object).filter((p) => !p.missing).length;
  return filled === 3 ? "voll" : filled ? "teil" : "leer";
}

/** Hinweise je Zustand (`d`, Export `E`). */
export const ENERGY_HINTS: Record<Exclude<EnergyState, "voll">, string> = {
  leer: "Energieausweis fehlt: Trag HWB, EEB und Effizienzklasse in den Objektangaben ein. Sie sind in Objektwerbung Pflicht. Bis dahin lassen wir den Block in den Druckdateien weg.",
  teil: 'Energieausweis unvollständig: Ergänze HWB, EEB und Effizienzklasse (bei älteren Ausweisen ohne EEB: fGEE und Klasse) in den Objektangaben. Fehlende Werte stehen sonst als "..." im Druck.',
};

/** Hinweis fuer das Objekt, null wenn vollstaendig oder kein Objekt (`b`, Export `d`). */
export function energyHint(object: { energy?: EnergyData } | null | undefined): string | null {
  if (!object) return null;
  const state = energyState(object);
  return state === "voll" ? null : ENERGY_HINTS[state];
}
