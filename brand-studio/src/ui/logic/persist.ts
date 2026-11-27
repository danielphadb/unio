/**
 * Speichern im Browser (localStorage), Sicherungsdatei und Downloads.
 * Gesicherte Fassung: index-Chunk (zk, jk, Mc, Hk, oS).
 */
import { SCHEMA_VERSION, projectName } from "./project";
import { slugify } from "./text";

export const PROJECT_KEY = "unio-brand:project:";

export const INDEX_KEY = "unio-brand:index";

export const BACKUP_KIND = "unio-brand-studio";

export const BACKUP_EXT = ".unio-brand.json";

export function openStorage() {
  try {
    const e = window.localStorage;
    const t = "unio-brand:probe";
    e.setItem(t, "1");
    e.removeItem(t);
    return e;
  } catch {
    return null;
  }
}

export function serializeProject(e: any) {
  return JSON.stringify(e);
}

export function readIndex(store: any) {
  const t = store.getItem(INDEX_KEY);
  if (!t) return [];
  const n = JSON.parse(t);
  return Array.isArray(n) ? n.filter((r) => typeof r == "string") : [];
}

export function writeProject(store: any, project: any) {
  store.setItem(PROJECT_KEY + project.id, serializeProject(project));
  const n = readIndex(store);
  if (!n.includes(project.id)) {
    store.setItem(INDEX_KEY, JSON.stringify([...n, project.id]));
  }
}

export function deleteProject(store: any, id: any) {
  store.removeItem(PROJECT_KEY + id);
  store.setItem(INDEX_KEY, JSON.stringify(readIndex(store).filter((n) => n !== id)));
}

export function isQuotaError(error: any) {
  const t = error?.name;
  return t === "QuotaExceededError" || t === "NS_ERROR_DOM_QUOTA_REACHED";
}

export function backupJson(project: any, time: any = Date.now()) {
  return JSON.stringify(
    { kind: BACKUP_KIND, version: SCHEMA_VERSION, exportedAt: time, project: project },
    null,
    2,
  );
}

export class BackupError extends Error {}

export const BACKUP_ERRORS = {
  foreign:
    "Diese Datei ist keine Brand-Studio-Sicherung. Wähle eine Datei, die auf .unio-brand.json endet.",
  invalid:
    "Diese Sicherung enthält ungültige oder veränderte Daten und wurde deshalb nicht geöffnet. Nimm eine Sicherung, die du direkt im Brand Studio heruntergeladen hast.",
};

export let downloadsApiPromise: any = null;

export function downloadsApi() {
  if (!downloadsApiPromise) {
    const e = (globalThis as any).claude;
    downloadsApiPromise =
      typeof e?.use == "function"
        ? e.use("downloads").then(
            (t: any) => t ?? null,
            () => null,
          )
        : Promise.resolve(null);
  }
  return downloadsApiPromise;
}

export function downloadViaLink(filename: any, blob: any) {
  const n = URL.createObjectURL(blob);
  const r = document.createElement("a");
  r.href = n;
  r.download = filename;
  document.body.appendChild(r);
  r.click();
  r.remove();
  setTimeout(() => URL.revokeObjectURL(n), 2e3);
}

export async function saveDownload(filename: any, blob: any) {
  const n = await downloadsApi();
  if (!n) return downloadViaLink(filename, blob);
  try {
    await n.save({ filename: filename, data: blob });
  } catch (r) {
    console.info("Download nicht gespeichert:", (r as any).code ?? r);
  }
}

export function downloadText(filename: any, text: any, type: any = "application/json") {
  saveDownload(filename, new Blob([text], { type: type }));
}

export function downloadBackup(project: any) {
  downloadText(`${slugify(projectName(project))}${BACKUP_EXT}`, backupJson(project));
}
