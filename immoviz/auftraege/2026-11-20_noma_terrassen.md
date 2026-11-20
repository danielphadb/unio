# Auftrag noma_terrassen

Status: offen
Erstellt: 20.11.2026, Cloud-Sitzung
Erledigt:

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
(von der Mac-Sitzung auszufüllen)
