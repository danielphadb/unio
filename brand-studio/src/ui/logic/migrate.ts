// Platzhalter: Migration und Sicherung lesen (migrate-Chunk) folgen mit Objektdaten und Bibliothek
// aus src/postings (docs/23, Status W3 Oberflaeche). Bis dahin werden keine Projekte geladen.
export function loadAll(_store: Storage): { projects: any[]; broken: string[] } {
  return { projects: [], broken: [] };
}

export function readBackup(_text: string, _ids: string[] = []): any {
  throw new Error("Sicherung lesen folgt");
}
