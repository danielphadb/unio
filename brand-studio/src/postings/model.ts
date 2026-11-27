/**
 * Datenmodell der Postings (Ausbaustufe 6): Objekte der Bibliothek mit Status, Fotos mit
 * Bildausschnitt und Bildrechten, Auswahl je Posting (Anlass, Format, Look) und Zusatzangaben.
 */
import type { EnergyData, Fact } from "../types";

/** Status eines Objekts (Plattform: AVAILABLE, RESERVED, SOLD, RENTED ...). */
export type ObjectStatus = "neu" | "reserviert" | "verkauft" | "vermietet" | "preis-angepasst";
export type ObjectKind = "kauf" | "miete";
/** Herkunft: im Studio angelegt, aus dem Kit uebernommen oder von der UNIO-Plattform. */
export type ObjectSource = "studio" | "kit" | "unio";

/** Bildausschnitt: Mittelpunkt (0 bis 1) und Zoom (1 bis 2,5). */
export interface PhotoFocus {
  x: number;
  y: number;
  zoom: number;
}

/** Foto eines Objekts (Bilddaten im Foto-Speicher unter `id`). */
export interface LibraryPhoto {
  id: string;
  focus: PhotoFocus;
  /** Bildrechte bestaetigt, auch fuer Social Media */
  rights: boolean;
  /** virtuell moebliert (wird auf dem Bild gekennzeichnet) */
  virtual: boolean;
  /** Bildnachweis */
  credit: string;
}

/** Energieausweis wie gespeichert (alle Felder Pflicht, leer erlaubt). */
export type ObjectEnergy = Required<EnergyData>;

/** Objekt der Bibliothek. */
export interface LibraryObject {
  id: string;
  source: ObjectSource;
  externalId: string;
  title: string;
  address: string;
  /** Lage fuer Postings, z. B. "Wien-Neubau" (sonst aus der Adresse) */
  lage: string;
  kind: ObjectKind;
  status: ObjectStatus;
  /** Zeitpunkt des letzten Statuswechsels (ms) */
  statusSince: number;
  price: string;
  /** Preis vor der Anpassung (Anlass "Preis angepasst") */
  previousPrice: string;
  commission: string;
  description: string;
  facts: Fact[];
  energy: ObjectEnergy;
  photos: LibraryPhoto[];
  url: string;
  createdAt: number;
  updatedAt: number;
}

/** Objekt-Bibliothek eines Projekts. */
export interface Library {
  objects: LibraryObject[];
}
