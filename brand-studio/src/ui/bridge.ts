/**
 * Brücke zur UNIO-Plattform, wenn das Studio eingebettet läuft: meldet sich bereit und gibt Logo und Name auf Anfrage weiter (bs:ready, bs:export).
 * Gesicherte Fassung: index-Chunk (FC, LC, qL).
 */

export const BRIDGE_VERSION = 1;

export const PARENT_ORIGINS = ["https://www.unio.at", "https://unio.at"];

export function isTrustedOrigin(
  origin: any,
  own: any = typeof location < "u" ? location.origin : "",
) {
  return !origin || origin === "null" ? false : origin === own || PARENT_ORIGINS.includes(origin);
}

export let exportData: any = null;

export const isEmbedded = () => typeof window < "u" && window.parent && window.parent !== window;

export function parentOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    return null;
  }
}

export function setExport(input: any, concept: any) {
  exportData = input
    ? {
        name: input.name,
        suffix: input.suffix ?? "",
        tagline: input.tagline ?? "",
        concept: concept,
      }
    : null;
}

export function sendExport() {
  const e = parentOrigin();
  if (!(!isEmbedded() || !e || !exportData || !isTrustedOrigin(e))) {
    window.parent.postMessage({ type: "bs:export", version: BRIDGE_VERSION, data: exportData }, e);
  }
}

export function initBridge() {
  if (!isEmbedded()) return;
  window.addEventListener("message", (t) => {
    if (t.source !== window.parent || !isTrustedOrigin(t.origin)) return;
    const n = t.data;
    if (!(!n || typeof n != "object" || n.type !== "bs:export")) {
      t.source.postMessage(
        { type: "bs:export", version: BRIDGE_VERSION, data: exportData },
        t.origin,
      );
    }
  });
  const e = parentOrigin();
  if (e && isTrustedOrigin(e)) {
    window.parent.postMessage({ type: "bs:ready", version: BRIDGE_VERSION }, e);
  }
}
