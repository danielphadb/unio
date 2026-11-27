/**
 * Hilfen des Namensfinders: Fokus-Optionen, Breite, Formular-Schlüssel, Register der gezeigten Namen.
 * Gesicherte Fassung: NameFinder-Chunk (Yn, Xn, G, es, ns, Ue).
 */
import { useEffect, useState } from "react";
import { CREATIVITY } from "../../engine/names";
import { splitList } from "../../engine/names/finder";

export const FOCUS_OPTIONS = [
  { value: "wohnen", label: "Wohnungen" },
  { value: "haeuser", label: "Häuser" },
  { value: "luxus", label: "Luxus" },
  { value: "anleger", label: "Anleger" },
  { value: "gewerbe", label: "Gewerbe" },
];

export const isWide = () => typeof matchMedia < "u" && matchMedia("(min-width: 760px)").matches;

export function useIsWide() {
  const [r, h] = useState(isWide);
  useEffect(() => {
    const f = matchMedia("(min-width: 760px)");
    const k = () => h(f.matches);
    f.addEventListener("change", k);
    return () => f.removeEventListener("change", k);
  }, []);
  return r;
}

export const formKey = (r: any) =>
  JSON.stringify([
    r.person.trim(),
    r.company.trim(),
    r.region.trim(),
    r.focus,
    r.style,
    r.keywords.trim(),
    r.description.trim(),
    r.chips,
    r.creativity,
    splitList(r.exclude),
    r.maxLength,
    r.route ? `${r.route.territory}|${r.route.params.seed}` : "",
  ]);

export const REGISTRY_KEY = "unio-brand:namefinder-registry";

export function readRegistry() {
  try {
    const r = sessionStorage.getItem(REGISTRY_KEY);
    const h = r ? JSON.parse(r) : [];
    return new Map(
      h
        .filter((f: any) => f && typeof f.id == "string" && typeof f.name == "string")
        .map((f: any) => [f.id, f]),
    );
  } catch {
    return new Map<any, any>();
  }
}

export function writeRegistry(r: any) {
  try {
    sessionStorage.setItem(REGISTRY_KEY, JSON.stringify([...r.values()].slice(-200)));
  } catch {}
}

export const CREATIVITY_OPTIONS = CREATIVITY.map((r) => ({
  key: r.key,
  label: r.label,
  hint:
    r.key === "direkt"
      ? "Naheliegende Namen, nah an deinen Angaben."
      : r.key === "frei"
        ? "Überraschende Ideen. Mehr Auswahl, mehr Ausreißer."
        : "Etwas kreativer, gut gemischt.",
}));
