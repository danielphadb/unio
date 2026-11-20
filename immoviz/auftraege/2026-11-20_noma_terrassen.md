# Auftrag noma_terrassen

Status: erledigt
Erstellt: 20.11.2026, Cloud-Sitzung
Erledigt: 20.11.2026, Mac-Sitzung (M3 Max, Metal)

## Ziel
Nur die Terrassenbilder von Top 3 und Top 4 (Noma) in 4k mit Render-Ebenen neu rendern, auf dem aktuellen Modell
(Hof und Nachbarn nach den Fotos vom 20.11., Leitern entfernt, Ausstattung mit Pergola, neue Objekt- und
Materialbibliothek). Noch keine KI-Veredelung: Die Renders sind die Grundlage für den KI-Schritt, sobald der Test
`2026-11-19_ki_lokal_test.md` entschieden hat, welches Verfahren wir nehmen. Kundenwunsch: nur Terrassen, sparsam.

## Befehle
Aus dem Repo-Ordner, nacheinander, nie parallel:

```
git pull
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/noma-shg13
```

1. Außenkameras (project.yaml), spaetsommer, 3840 x 2560, 256 Samples, mit Ebenen:
```
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 --cam top3_terrasse_garten,top4_terrasse_garten,top3_pergola_detail,top4_pergola_detail --light spaetsommer --res 3840x2560 --samples 256 --out r9_terrassen --no-blend --ebenen
```

2. Blick von der Terrassenecke durch die offene HST (wohnungen.yaml `top03_terrasse` / `top04_terrasse`, Kameras
`hst` und `abend`), gleiche Auflösung und Samples, Ausgabe ebenfalls nach `renders/r9_terrassen/`:
```
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top03_terrasse --final
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top04_terrasse --final
```
Der Befehl `interior` hat bisher kein `--ebenen`, `--res`, `--samples` und `--out`. Bitte wie bei `render` ergänzen
(gleiche Ebenen-Ausgabe über lib/ebenen.py, inklusive Hintergrund-Durchgang), damit auch diese vier Bilder Masken für
den KI-Schritt haben. Falls das zu aufwendig ist: ohne Ebenen rendern und im Ergebnis vermerken.

## Ausgabe
- `immoviz/projects/noma-shg13/renders/r9_terrassen/`: 8 Bilder (4 außen, 2 HST Tag, 2 HST Abend), JPG-Fassungen
  einchecken, Ebenen wie bisher mit `git add -f` (ohne `normalen.png`).
- Kontaktbogen der 8 JPGs (eine Datei, höchstens 7800 px hoch) als `r9_terrassen/kontaktbogen.jpg`.

## Melden
- Zeiten je Bild, Gerät, max. Speicher.
- `ebenen.json`: Anteile schutz, gelaender, vegetation, ausstattung, nicht_zugeordnet.
- Sichtprüfung je Bild: Nachbarhäuser wie auf den Fotos vom 20.11., keine Leitern, Geländer nur laut Plan,
  Pergola/Tröge/Möbel vorhanden, nichts Schwebendes, keine schwarzen Flächen.

## Ergebnis
Alle 8 Bilder in 3840 x 2560, 256 Samples, mit Ebenen, Gerät GPU (Metal, Apple M3 Max), nacheinander gerendert,
19:15 bis 20:02. `pruefen` vorab: Ampel rot wie bisher (ältere Fenster, Stuck, Farben ohne Quelle), keine neuen Befunde.

**`interior` erweitert** (wie im Auftrag erbeten): neue Optionen `--res`, `--samples`, `--out`, `--ebenen`. Die Ebenen
laufen über lib/ebenen.py wie bei `render` (Klassenmasken, Tiefe, Normalen, Kanten, Schutz, Hintergrund-Durchgang),
je Wohnung neu vorbereitet, sobald die Innenräume in der Szene stehen; Ordner `<wohnung>_<kamera>_<licht>_ebenen/`.
Die Innenräume (Collection `Innen`) zählen zum Objekt. Dazu: Verkaufspläne Top 3/4 aus Drive nach `quellen/`
(gitignored), Rastern ohne Poppler über PyMuPDF (in requirements.txt), sonst wie bisher `pdftoppm`.

| Bild | Zeit (inkl. Ebenen) | max. Speicher | schutz % | gelaender % | vegetation % | ausstattung % | nicht zugeordnet |
|---|---|---|---|---|---|---|---|
| top3_terrasse_garten | 5:47 (mit Szenenaufbau) | 14,5 GB (Lauf außen) | 49,3 | 1,0 | 3,9 | 24,2 | 0,05 % (siehe unten) |
| top4_terrasse_garten | 5:13 | | 64,9 | 0,5 | 2,9 | 17,7 | 0,08 % |
| top3_pergola_detail | 5:49 | | 20,3 | 1,7 | 22,4 | 40,3 | 0,01 % |
| top4_pergola_detail | 5:27 | | 29,8 | 1,1 | 24,6 | 29,6 | 0 |
| top03_terrasse_hst (Tag) | 6:05 (mit Szenenaufbau) | 14,2 GB | 57,7 | 2,5 | 1,3 | 20,0 | 0 |
| top03_terrasse_abend | 5:20 | | 57,7 | 2,5 | 1,3 | 20,0 | 0 |
| top04_terrasse_hst (Tag) | 6:29 (mit Szenenaufbau) | 15,1 GB | 63,1 | 0,5 | 7,1 | 13,8 | 0 |
| top04_terrasse_abend | 6:20 | | 63,1 | 0,5 | 7,1 | 13,8 | 0 |

Gesamt 1 h 47 min. Hintergrund-Durchgang bei den 4 Außenbildern (Bäume vor dem Objekt), bei den HST-Bildern nicht
nötig (keine Platzhalter, Autos oder Bäume davor). Nicht zugeordnet war nur `nb_umgebung_005364_innen` (Innenkarten
hinter den neuen DG-Fenstern Erdbergstraße 125, Runde 9); lib/ebenen.py ordnet `nb_umgebung*` jetzt den Nachbarn zu,
wirkt ab dem nächsten Render (in diesen 8 Ebenen höchstens 0,08 % des Bildes).

**Sichtprüfung** (Kontaktbogen `r9_terrassen/kontaktbogen.jpg`):
- Nachbarhäuser wie auf den Fotos vom 20.11.: Erdbergstraße 125 weiß mit Glasbalkonen und Zinkmansarde, Erdbergstraße 123
  graue Felder mit weißen Lisenen und Attika (top3/top4_terrasse_garten, top4_pergola_detail), Schlachthausgasse 15/17
  lachs mit Westflügel (top03_terrasse_hst). Stimmt.
- Keine Leitern (Dachausstieg Top 3 Ost / Top 4 West auskommentiert). Stimmt.
- Geländer nur laut Plan (Terrassenränder G3/G4 bzw. G5/G6, GLH 1,02). Stimmt.
- Pergola, Rankgitter, Tröge, Möbel, Kübelbäume, Wandleuchten vorhanden. Stimmt.
- Nichts Schwebendes, keine schwarzen Flächen; Abendbilder: Fassaden dunkel (blaue Stunde), Innenräume und
  Wandleuchten an, gewollt.
- Auffällig, nicht Teil des Auftrags: Kletterpflanzen am Rankgitter und Kübelbäume sind einfache Kugelformen
  (Ausstattung Runde 7), die KI-Veredelung sollte sie ersetzen; die HST wirkt im Tagbild fast geschlossen (Spiegelung).

Eingecheckt: 8 JPGs, `kontaktbogen.jpg`, 8 Ebenen-Ordner ohne `normalen.png` (236 Dateien, 53 MB) mit `git add -f`.
PNG-Fassungen der Bilder bleiben lokal.
