/**
 * Einstellungen (KI-Funktionen, intern, Signature-Entwürfe) mit Hook.
 * Gesicherte Fassung: NameCard-Chunk (E, q, J, Y).
 */
import { useSyncExternalStore } from "react";

export const SETTINGS_KEY = "unio-brand:einstellungen";

export const DEFAULT_SETTINGS = { kiFunktionen: false, intern: false, signatureEntwuerfe: false };

export function parseSettings(n: any) {
  if (!n) return { ...DEFAULT_SETTINGS };
  try {
    const a = JSON.parse(n);
    return !a || typeof a != "object" || Array.isArray(a)
      ? { ...DEFAULT_SETTINGS }
      : {
          kiFunktionen: a.kiFunktionen === true || a.kiVorauswahl === true,
          intern: a.intern === true,
          signatureEntwuerfe: a.intern === true && a.signatureEntwuerfe === true,
        };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function draftsFromQuery(n: any) {
  const a = new URLSearchParams(n).get("entwuerfe");
  return a === "1" ? true : a === "0" ? false : null;
}

export let current: any = null;

export const listeners = new Set<any>();

export function readSettings() {
  let n: any;
  try {
    n = parseSettings(typeof localStorage < "u" ? localStorage.getItem(SETTINGS_KEY) : null);
  } catch {
    n = { ...DEFAULT_SETTINGS };
  }
  const a = typeof location < "u" ? draftsFromQuery(location.search) : null;
  if (a !== null) {
    n = { ...n, intern: a, signatureEntwuerfe: a };
    writeSettings(n);
  }
  return n;
}

export function writeSettings(n: any) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(n));
  } catch {}
}

export function getSettings() {
  if (!current) {
    current = readSettings();
  }
  return current;
}

export function updateSettings(n: any) {
  const a: any = { ...getSettings(), ...n };
  if (!a.intern) {
    a.signatureEntwuerfe = false;
  }
  current = a;
  writeSettings(a);
  for (const s of listeners) s();
}

export function subscribeSettings(n: any) {
  listeners.add(n);
  return () => listeners.delete(n);
}

export function useSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings);
}
