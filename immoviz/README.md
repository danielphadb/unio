# immoviz: Immobilien-Visualisierung aus Plänen

Werkzeug von UNIO und Ad Boutique, das aus Bauplänen, Stadtdaten, Blender und Higgsfield
maßhaltige, atmosphärische High-End-Visualisierungen für den Immobilienvertrieb erzeugt.

**Grundprinzip:** Blender liefert die Wahrheit (Geometrie, Kamera, Sonnenstand, Materialzonen),
Higgsfield liefert das Finish (Fotorealismus, Atmosphäre, Video). Damit stimmen Fensterachsen,
Geschosse und Dachkanten mit den Plänen überein, was reine KI-Bilder nicht leisten.

## Stufen

| Stufe | Inhalt | Werkzeug | Stand |
|---|---|---|---|
| 0 Intake | Pläne, Ansichten, BAB, Farbkonzept, Mood sammeln, Quellen in `quellen/` dokumentieren | Checkliste unten | aktiv |
| 1 Umgebung | Gebäudeblöcke, Straßen, Gehsteige, Bäume aus Stadt Wien Open Data | `immoviz.py geo` | fertig |
| 2 Objekt außen | Fassaden, Fensterachsen, Gesimse, Dachgeschoss-Kubatur aus `project.yaml` | `lib/build.py` | fertig, wird je Objekt verfeinert |
| 3 Licht und Kamera | Sonnenstand nach Datum und Uhrzeit, Kamerasets mit stürzenden Linien korrigiert | `project.yaml` | fertig |
| 4 Rendering | Cycles, AgX-Farbmanagement, Vorschau und Final | `immoviz.py render` | fertig |
| 5 Veredelung | Fotorealismus, Bäume, Leben, Upscaling, Kamerafahrten | Higgsfield, siehe `higgsfield/LEITFADEN.md` | aktiv |
| 6 Innenräume | Grundriss zu Raum, Möblierung (Staging), Materialien aus BAB | `immoviz.py interior`, siehe `projects/<objekt>/WOHNUNGEN.md` | aktiv |
| 7 Freigabe | Abgleich Plan, BAB, Bauträger; Kennzeichnung „unverbindliche Visualisierung“ | manuell | offen |

## Installation

```bash
python3.13 -m venv .venv-immoviz
.venv-immoviz/bin/pip install bpy==5.2.4 pyyaml pillow numpy
```

Blender läuft als Python-Modul ohne Oberfläche. Die erzeugte `.blend`-Datei lässt sich in Blender 5.2
öffnen und dort von Hand weiterbearbeiten.

## Bedienung

```bash
# Umgebungsdaten laden (einmal pro Objekt)
.venv-immoviz/bin/python immoviz/immoviz.py geo immoviz/projects/wimmergasse-20

# Schnelle Vorschau
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke --light golden_hour --preview

# Finale Bilder, mehrere Kameras und Lichtstimmungen
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke,drohne,wimmergasse --light golden_hour,blaue_stunde
```

Ergebnisse landen in `projects/<objekt>/renders/`.

## Studio-Oberfläche

Lokale Web-Oberfläche über dem Prototyp (Phase B laut `KONZEPT.md`), im UNIO-Design, hell und dunkel, bis 400 px Breite.

```bash
.venv-immoviz/bin/pip install fastapi uvicorn          # einmalig
.venv-immoviz/bin/python immoviz/immoviz.py studio      # http://127.0.0.1:8765
.venv-immoviz/bin/python immoviz/immoviz.py studio --dry-run   # Queue startet kein Blender (Test)
```

| Bildschirm | Inhalt |
|---|---|
| Projekte | alle Ordner unter `projects/` mit `project.yaml`, Fortschritt der 10 Schritte, letzte Bilder |
| Übersicht | Status je Schritt, abgeleitet aus den Dateien; von Hand überschreibbar |
| Intake | Checkliste aus diesem README mit Ampel und Notiz, Dateien in `quellen/`, Anfrage-Text an den Bauträger |
| Shotlist | Matrix Motiv x Licht aus `cameras` und `lights`, Thumbnails, Knopf „Vorschau rendern“ |
| Queue | ein Job gleichzeitig: `immoviz.py render <projekt> --cam <c> --light <l> --preview --no-blend`, Status und Log |
| Galerie | alle Bilder und Videos unter `renders/`, Freigeben, Ablehnen, Kommentar |
| Kundenansicht | `/kunde?p=<slug>`: nur freigegebene Bilder, Kunde kann Anmerkungen schreiben |

Zuordnung in der Shotlist: Blender-Bilder nach `<slug>_<motiv>_<licht>_(vorschau|final)`, Higgsfield-Bilder in
`renders/higgsfield/` zusätzlich über Motiv- und Lichtnamen im Dateinamen (z. B. `herbst_ecke_orbit`, `ecke_dunst_nbpro`).

Datenhaltung je Projekt, `project.yaml` wird nur gelesen:

- `status.json`: von Hand gesetzter Schrittstatus (alternativ optionales Feld `status: {4: annahme}` in `project.yaml`)
- `intake.json`: Stand der Intake-Checkliste
- `freigabe.json`: Freigabe, Ablehnung und Kommentare je Bild (Kundenkommentare mit `quelle: kunde`)

Thumbnails und Job-Logs liegen in `immoviz/studio/.cache/` (nicht eingecheckt). Die Oberfläche hat noch keine
Anmeldung: nur lokal oder im Büronetz betreiben, Kundenlink nicht öffentlich teilen.

## Neues Objekt anlegen

1. Ordner `projects/<slug>/` mit `project.yaml`, `quellen/`, `data/`, `renders/` anlegen
   (am besten `wimmergasse-20` kopieren).
2. Gebäudeecke und Fassadenrichtung bestimmen: Adresse eintragen, `immoviz.py geo` ausführen,
   im Baukörpermodell die Ecke und die Fassadenlinien ablesen (`site.origin_gk`, `x_axis_deg`, `facades`).
3. Aus der Straßenansicht (1:100) übertragen: Fensterachsen je Fassade, Geschosshöhen, Fenstergrößen,
   Gesimse. Jede Zahl bekommt im YAML-Kommentar ihre Quelle.
4. Dachgeschoss aus Ansicht und DG-Grundrissen: Wände (`walls`), Schrägen (`slopes`), Volumen, Decken.
5. Angebaute Nachbarn und Häuser gegenüber modellieren (Pflicht): `neighbour_facades` mit Fassadenlinie,
   Höhe, Achsen, Geschossen, Erdgeschoss, Gesimsen, Balkonen, Dach und Farbe nach Street View.
6. Vorschau rendern, gegen Plan und mit `svcheck` gegen Street View prüfen, nachschärfen. Erst dann Higgsfield.

## Datenquellen

- Stadt Wien Open Data (CC BY 4.0): Baukörpermodell `FMZKBKMOGD`, Baumkataster `BAUMKATOGD`,
  Verkehrsflächen `FMZKVERKEHR1/2OGD`, Gebäudeinformation `GEBAEUDEINFOOGD`, Adressdienst.
- Google Maps wird nicht verbaut (Lizenz), nur als interne Referenz.

## Intake-Checkliste je Objekt

- [ ] Straßenansichten aller Straßenfassaden, 1:100, als Vektor-PDF oder DWG
- [ ] Schnitt mit Höhenkoten (Wiener Null), Grundrisse aller Geschosse inkl. Dachgeschosse
- [ ] Farbkonzept mit Herstellerfarbtönen, Bau- und Ausstattungsbeschreibung
- [ ] Fotos vom Bestand (Fassade, Details, Ausblicke), falls vorhanden
- [ ] Mood-Referenzen: 15 bis 20 Bilder „so soll es wirken“, 3 bis 5 „so nicht“
- [ ] Kameras und Lichtstimmungen mit dem Vertrieb abgestimmt
