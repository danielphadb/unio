/**
 * Fotos im Browser (IndexedDB, mit Zwischenspeicher), Hook zum Laden, Verkleinern beim Hochladen
 * (photoStore-Chunk der gesicherten Fassung). Ohne IndexedDB (privates Fenster, Test) bleiben die
 * Fotos nur im Speicher der Sitzung.
 */
import * as React from "react";

/** Name der Datenbank (`b`). */
export const DB_NAME = "unio-brand-photos";
/** Objektspeicher (`h`). */
export const STORE = "photos";
/** Zwischenspeicher: Foto-ID zu data-URL (`s`). */
export const memory = new Map<string, string>();
/** Erlaubte Bilder als data-URL (`g`). */
export const DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;
/** Offene Datenbank, null ohne IndexedDB (`f`). */
export let dbPromise: Promise<IDBDatabase | null> | null = null;

/** Datenbank einmal oeffnen (`y`). */
export function openDb(): Promise<IDBDatabase | null> {
  if (!dbPromise)
    dbPromise = new Promise((resolve) => {
      try {
        if (typeof indexedDB === "undefined") return resolve(null);
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  return dbPromise;
}

/** Eine Anfrage im Objektspeicher; undefined bei Fehler oder ohne Datenbank (`d`). */
export function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise<T | undefined>((resolve) => {
        if (!db) return resolve(undefined);
        try {
          const req = run(db.transaction(STORE, mode).objectStore(STORE));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      }),
  );
}

/** Neue Foto-ID (Zeit und Zufall, Basis 36) (`x`, Export `n`). */
export const newPhotoId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Foto speichern; true, wenn es dauerhaft gespeichert wurde (`E`, Export `p`). */
export async function putPhoto(id: string, dataUrl: string): Promise<boolean> {
  if (!DATA_URL_RE.test(dataUrl)) throw new Error("Kein gültiges Bild");
  memory.set(id, dataUrl);
  return (await withStore("readwrite", (store) => store.put(dataUrl, id))) !== undefined;
}

/** Foto lesen (zuerst aus dem Zwischenspeicher) (`P`, Export `g`). */
export async function getPhoto(id: string): Promise<string | null> {
  const cached = memory.get(id);
  if (cached) return cached;
  const stored = await withStore("readonly", (store) => store.get(id));
  if (typeof stored === "string" && DATA_URL_RE.test(stored)) {
    memory.set(id, stored);
    return stored;
  }
  return null;
}

/** Foto loeschen (`M`, Export `d`). */
export async function deletePhoto(id: string): Promise<void> {
  memory.delete(id);
  await withStore("readwrite", (store) => store.delete(id));
}

/** React-Hook: Fotos zu den IDs als `{ id: dataUrl }` (`R`, Export `u`). */
export function usePhotos(ids: string[]): Record<string, string> {
  const key = ids.join(",");
  const [photos, setPhotos] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(ids.filter((id) => memory.has(id)).map((id) => [id, memory.get(id)!])),
  );
  React.useEffect(() => {
    let active = true;
    Promise.all(ids.map(async (id) => [id, await getPhoto(id)] as const)).then((list) => {
      if (active)
        setPhotos(
          Object.fromEntries(list.filter((e): e is readonly [string, string] => !!e[1])),
        );
    });
    return () => {
      active = false;
    };
  }, [key]);
  return photos;
}

/** Bild verkleinern (laengste Seite hoechstens `maxPx`), als JPEG auf weissem Grund (`O`, Export `r`). */
export async function shrinkImage(file: Blob, maxPx = 3000): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Bild nicht lesbar"));
      el.src = url;
    });
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext("2d");
    if (!g) throw new Error("Canvas nicht verfügbar");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
