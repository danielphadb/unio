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
| 1 Umgebung | Gebäudeblöcke, Straßen, Gehsteige, Bäume aus Stadt Wien Open Data, echte Dachflächen aus dem Dachmodell LOD2 | `immoviz.py geo`, `immoviz.py daecher` | fertig |
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

# Echte Dachflächen der Umgebung laden (einmal pro Objekt, nach geo): data/roofs.json
.venv-immoviz/bin/python immoviz/immoviz.py daecher immoviz/projects/wimmergasse-20 --cache /tmp/immoviz-kacheln

# Welche Nachbarhäuser sieht welche Kamera direkt (Bildanteil der Fassade je BEZUG)
.venv-immoviz/bin/python immoviz/immoviz.py sichtbar immoviz/projects/wimmergasse-20

# Schnelle Vorschau
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke --light golden_hour --preview

# Finale Bilder, mehrere Kameras und Lichtstimmungen
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke,drohne,wimmergasse --light golden_hour,blaue_stunde
```

Ergebnisse landen in `projects/<objekt>/renders/`.

## Umgebung: Dächer, Nachbarn, Bäume

- **Dächer** (`lib/roofs.py`, Befehl `daecher`): Dachflächen aus dem Generalisierten Dachmodell LOD2 der Stadt Wien
  (CityGML je Blatt 1:1000), dem Baukörper zugeordnet, Material aus Neigung und mittlerer Farbe im Orthofoto 2024
  (Ziegel, Ziegel dunkel, Blech, Blech hell, Kies, Grün, Flach). `build_context` setzt sie auf alle Gebäude im
  Radius, `build_neighbours` ersetzt damit die Angabe `roof` der Nachbarfassaden. Ohne `data/roofs.json` gibt es
  Satteldächer mit First parallel zur Straße. Optional `site.roof_radius_m` (Standard `radius_m`).
- **Direkt sichtbare Häuser** (Befehl `sichtbar`): Sehstrahlen je Kamera, Ergebnis je BEZUG mit Bildanteil und
  Entfernung. Jedes Haus mit mindestens 1 % Bildanteil und unter 80 m braucht einen Eintrag in
  `neighbour_facades` und eine frontale Ansicht in `streetview_checks`.
- **Bäume** (`lib/trees.py`): Kronenvorlagen (rundlich, säulenförmig) als Instanzen, Größe aus dem Baumkataster.
  Korrekturen in `trees_override` am Ende von `project.yaml`: Baum über die Position finden, `remove: true`,
  `height`, `crown`, `form` (rund, saeule), `base`, oder `add: true` für fehlende Bäume.
- Stand und Befund je Objekt: `projects/<objekt>/umgebung_abgleich.md`.

## Walkthrough (Kamerafahrt durch eine Wohnung)

Methode nach dem Praxisbeispiel in KONZEPT.md, Abschnitt 8: Blender gibt Geometrie und Kamerapfad vor,
die Bild-KI richtet ein, das Videomodell verbindet die Standbilder.

1. Kamerapfad in `wohnungen.yaml` unter `<top>.walkthrough.punkte` (Position, Blickziel, Brennweite, Zeitpunkt).
2. Standbilder je Wegpunkt rendern (und optional die Clay-Fahrt als Bewegungsvorlage):

```bash
.venv-immoviz/bin/python immoviz/immoviz.py walkthrough immoviz/projects/wimmergasse-20 --top top35 --anim
```

3. Ersten Wegpunkt in Higgsfield einrichten, mit festem Möbelplan im Prompt (was steht links, Mitte, rechts).
4. Alle weiteren Wegpunkte mit dem eingerichteten ersten Bild als Referenz ("SAME apartment as image 2"),
   damit Möbel und Materialien in jedem Bild gleich sind. Je Bild ausdrücklich sagen, welche Wände keine
   Fenster haben, sonst erfindet das Modell welche.
5. Kling 4.0, Modus `image-to-video`: `start_image` = Wegpunkt 1, `image_references` = mittlere Wegpunkte
   in Reihenfolge, `end_image` = letzter Wegpunkt, Dauer gleich der Pfaddauer (bis 30 s).

Ergebnisse liegen unter `renders/walkthrough/<top>/` (k = Blender, staging_k = eingerichtet, Video als MP4).

## Schnittansicht (Gebäude geschossweise aufgeschnitten)

Vorbild ist das Revit-Reel aus KONZEPT.md, Abschnitt 8: eine feste Axonometrie-Kamera von schräg oben auf die Ecke,
das Gebäude wird oberhalb einer Schnitthöhe entfernt, das Geschoss darunter ist von oben mit Innenwänden zu sehen.
Modellbau-Ästhetik (warmweißes Modell, geschnittene Wände dunkel, Böden hell), echte Sonne, Umgebung wie bei `render`.
Hervorgehobene Wohnungen liegen als Bodenfläche in UNIO-Signalfarbe #FFAA09 im Modell.

```bash
# nur Kontrollbilder Plan gegen extrahierte Wände (Sekunden)
.venv-immoviz/bin/python immoviz/immoviz.py schnitt immoviz/projects/wimmergasse-20 --nur-check
# Vorschau aller Zustände (640x400, 8 Samples), einzelne Zustände mit --zustand s01,s04
.venv-immoviz/bin/python immoviz/immoviz.py schnitt immoviz/projects/wimmergasse-20 --preview
# Final (1920x1080, 48 Samples, ca. 4 bis 5 Minuten je Bild auf 4 CPU-Kernen)
.venv-immoviz/bin/python immoviz/immoviz.py schnitt immoviz/projects/wimmergasse-20
```

Ergebnisse unter `renders/schnitt/`: `s00.png` bis `s05.png`, `uebersicht.jpg` (alle Zustände mit Titel und
Schnitthöhe), `check_<geschoss>.jpg` (Plan hell, Wände rot, Fenster blau, Türen grün, OGD-Umriss türkis,
Umrissergänzung violett, Wohnungen orange).

Konfiguration in `wohnungen.yaml` unter `schnitt:` (Code in `lib/section.py`):

| Schlüssel | Inhalt |
|---|---|
| `geschosse` | je Geschoss Planseite, `corner_px` (Gebäudeecke im Raster, je Blatt prüfen), `ffb` (Kote), `decke` [UK, OK], Fensterbrüstung und -sturz; Dachgeschoss als `typ: dach` aus der Dachkubatur plus Wohnung aus `wohnungen` |
| `umriss_plus` | Polygone, die der Plan als Gebäude zeigt, der OGD-Umriss aber nicht |
| `fassadenwand_m` | Straßenwände massiv mit den Öffnungen aus `altbau.rows` (wie die Fassade), Planwände erst dahinter |
| `wohnungen` | hervorgehobene Wohnungen: Geschoss, Polygon lokal (x Stolberggasse, y Wimmergasse), `ohne` für Aussparungen |
| `kamera` | Ziel, Azimut, Höhenwinkel, sichtbare Breite (orthografisch) |
| `zustaende` | Name, Titel, Geschoss, Schnitthöhe (FFB + 1,20 m), Wohnungen |
| `licht`, `exposure`, `farben` | Lichtstimmung aus `project.yaml`, Belichtung, Modellfarben |

Grenzen: Wände nur aus Vektorplänen mit grau gefüllten Wänden (wie `interior`); Treppen, Möbel und Schächte fehlen,
der Boden läuft über das Stiegenhaus. 1. und 2. DG haben keinen Grundriss und bleiben geschlossene Volumen; im 3. DG
gibt es nur die Wände von Top 35, die übrigen Flächen sind offen mit Außenwänden am Umriss. Deckenstärken und die
Kote des 2. OG sind Annahmen. Deckungsgleiche Flächen werden in Cycles schwarz, daher sind gleich hohe Platten um
Millimeter versetzt.

## Projekt-Website (anklickbare Wohnungen im Schnitt)

Statische Projektseite aus den vorhandenen Bildern, ohne Build-Schritt: Hero mit Hauptmotiv und Kennzahlen,
"Das Haus" (Außenbilder, Jahreszeiten), "Wohnungen" (Schnittbild mit Geschoss-Umschalter, Wohnungen als
SVG-Hotspots, Klick öffnet ein Seitenpanel, auf dem Handy ein Blatt von unten), "Bewegtbild", "Lage", Kontakt
(Platzhalter) und der Hinweis "Unverbindliche Visualisierung". Gestaltung nach UNIO-Designsystem, Power Grotesk
eingebettet, hell und dunkel, ab 360 px, Tastatur (Tab, Enter, Esc) und `prefers-reduced-motion`.

```bash
# Seite erzeugen: projects/<p>/website/index.html plus media/ (Bilder max 2000 px und 1000 px, Videos 1280 px H.264 crf 26)
.venv-immoviz/bin/python immoviz/immoviz.py website immoviz/projects/wimmergasse-20
# Hotspots aus der Schnittkamera neu berechnen (Blender ohne Rendering, Sekunden), danach Seite bauen
.venv-immoviz/bin/python immoviz/immoviz.py website immoviz/projects/wimmergasse-20 --hotspots
# Ansehen
cd immoviz/projects/wimmergasse-20/website && python3 -m http.server 8000
```

- Inhalte in `projects/<p>/website.yaml` (Texte, Kennzahlen, Bildzuordnung, Wohnungsdaten). Was nicht bekannt ist
  (Zimmer, Preise, Kontakt), steht dort als "auf Anfrage" oder Platzhalter und erscheint so auf der Seite.
- Hotspots: `lib/hotspots.py` projiziert die Polygone aus `wohnungen.yaml` (`schnitt.wohnungen`, Aussparungen
  `ohne` abgezogen) mit derselben Axonometrie-Kamera auf Bodenhöhe des Geschosses (FFB + 2 cm) in Pixel der
  Schnittbilder (1920 x 1080). Ergebnis `renders/schnitt/hotspots.json` (`zustaende.<zustand>.<top>`: Punkte x, y),
  Kontrolle `renders/schnitt/hotspots_check.jpg` (Umrisse in s01 und s04). Ändert sich die Kamera, `--hotspots`.
- Neue Wohnung: Polygon und Zustand in `wohnungen.yaml` (`schnitt`), Daten und Bilder in `website.yaml`
  (`wohnungen.<top>`, `zustand` = Schnittbild, in dem sie liegt).
- Code: `lib/website.py` (Generator), `lib/website_template.html` (Seite mit CSS und JS). `website/` ist Ausgabe
  und nicht im Repo.

## Studio-Oberfläche

Lokale Web-Oberfläche über dem Prototyp (Phase B und C laut `KONZEPT.md`), im UNIO-Design, hell und dunkel, bis 400 px Breite.

```bash
.venv-immoviz/bin/pip install fastapi uvicorn ruamel.yaml   # einmalig
.venv-immoviz/bin/python immoviz/immoviz.py studio      # http://127.0.0.1:8765
.venv-immoviz/bin/python immoviz/immoviz.py studio --dry-run   # Queue startet kein Blender (Test)
# Tests auf einer Kopie: andere Projektwurzel (Standard immoviz/projects)
.venv-immoviz/bin/python immoviz/immoviz.py studio --dry-run --projects /pfad/zur/kopie/projects
IMMOVIZ_PROJECTS=/pfad/zur/kopie/projects .venv-immoviz/bin/python immoviz/immoviz.py studio   # gleichwertig
```

| Bildschirm | Inhalt |
|---|---|
| Projekte | alle Ordner unter `projects/` mit `project.yaml`, Fortschritt der 10 Schritte, letzte Bilder |
| Übersicht | Status je Schritt, abgeleitet aus den Dateien; von Hand überschreibbar |
| Intake | Checkliste aus diesem README mit Ampel und Notiz, Upload per Drag and Drop nach `quellen/` mit Zuordnung zu einem Punkt, Anfrage-Text an den Bauträger |
| Shotlist | Matrix Motiv x Licht aus `cameras` und `lights`, Thumbnails, Knopf „Vorschau rendern“ |
| Kameras | Lageplan aus `data/context.json` (Objekt hervorgehoben, Gehsteige grau) mit allen Kameras und Blickkegel; Klick setzt Position, zweiter Klick das Ziel; anlegen, ändern, umbenennen, löschen |
| Licht | Lichtstimmungen aus `lights` anlegen, ändern, löschen; Sonnenhöhe und Azimut live (`lib/sun.py`), Sonnenrichtung über dem Lageplan, Uhrzeit-Schieberegler |
| Neues Objekt | Formular (Slug, Adresse, GK-Ursprung, Fassadenrichtung, Fassaden): legt `projects/<slug>/` aus `projects/_vorlage/` an, optional `immoviz.py geo` über die Queue, siehe unten |
| Fassaden | Straßenansicht aus `checks.<fassade>.pdf` als Hintergrund (pdftoppm, Cache `data/plan_cache/`), maßstäblich über `dpi`, `scale`, `u0_px`. Werkzeuge: Achsen (Klick setzt, Ziehen verschiebt, Entf löscht, Pfeiltasten 5 cm), Geschosse (`altbau.rows`, Band ziehen, Kanten ändern die Höhe), Gesimse (`altbau.cornices`, Ziehen verschiebt alle Stufen), Erdgeschoss (Override je Achse: Haustor, Schaufenster, Kastenfenster mit u- und z-Bereich, Keller), Plan kalibrieren (PDF, Seite, dpi, Maßstab, Klick auf u = 0 / z = 0, Ausschnitt, Höhenkoten). Raster 5 cm, Einrasten an Höhenkoten und vorhandenen Linien in 8 px Umkreis, Alt-Taste frei |
| Dach | Listen `dach.walls`, `slopes`, `volumes`, `railings`, `slabs` mit Formular je Eintrag (Paare als zwei Zahlen, Fenster und Clip-Regeln als JSON), neu, duplizieren, löschen; Ansichtsskizze je Fassade (u gegen z) mit Altbau, Achsen, Wänden, Fenstern, Schrägen, Geländern, Volumen |
| Abgleich | „Planabgleich prüfen“ startet `immoviz.py check <projekt> --facade <f>` über die Queue; Ergebnis als Plan und orthogonales Modell mit Schieberegler, dazu die rot/blaue Überlagerung aus `renders/check/` |
| Queue | ein Job gleichzeitig: `immoviz.py render <projekt> --cam <c> --light <l> --preview --no-blend`, Planabgleich, `geo`, Higgsfield-Aufträge mit geschätzten Credits; Status und Log |
| Galerie | alle Bilder und Videos unter `renders/`, Freigeben, Ablehnen, Kommentar; „Veredeln“ je Blender-Bild und „Video erzeugen“ (Higgsfield, siehe unten); Higgsfield-Bilder mit Verweis auf Original und Prompt; Videoplayer für `renders/video/` und `renders/walkthrough/<top>/`, Kamerapfade je Wohnung aus `wohnungen.yaml` (nur Anzeige); Kundenlinks erzeugen und widerrufen |
| Kundenansicht | `/kunde?p=<slug>&t=<token>`: nur freigegebene Bilder und Videos, Kunde kann Anmerkungen schreiben. Ohne Token nur von localhost |

Higgsfield-Veredelung (Knopf „Veredeln“ in Shotlist und Galerie): Prompt aus Bausteinen in `projects/<p>/prompts.yaml`
(Geometrie-Sperre, Objekt, Licht und Jahreszeit je Lichtstimmung über `zuordnung`, Umgebung, Negativ; innen Altbau oder
Dachgeschoss, Raum, Licht), vor dem Absenden editierbar; bis zu drei Referenzbilder aus der Galerie, Format, Auflösung,
geschätzte Credits (Bild ca. 1,5, Video Kling 5 s ca. 16), Bestätigung. Ergebnis in
`renders/higgsfield/<motiv>_<licht>_<zeit>.jpg`, Metadaten in `renders/higgsfield/index.json`. Video-Dialog: Start-,
End- und Zwischenbilder aus der Galerie, Dauer 5 oder 10 s, Prompt. Im Kopf steht das Guthaben bzw. „Trockenlauf“.
Schlüssel nur aus `HIGGSFIELD_API_KEY` und `HIGGSFIELD_API_SECRET`; ohne Schlüssel oder mit `--dry-run` Trockenlauf
(Ergebnis = Eingangsbild). Stand der API und offene Punkte: `higgsfield/API.md`.

Zuordnung in der Shotlist: Blender-Bilder nach `<slug>_<motiv>_<licht>_(vorschau|final)`, Higgsfield-Bilder in
`renders/higgsfield/` zusätzlich über Motiv- und Lichtnamen im Dateinamen (z. B. `herbst_ecke_orbit`, `ecke_dunst_nbpro`).

Datenhaltung je Projekt:

- `project.yaml`, Fassaden-, Dach-Editor und Neues Objekt: ersetzen nur die betroffenen Blöcke (z. B.
  `altbau.facades.<f>.axes`, `altbau.facades.<f>.eg`, `altbau.rows`, `altbau.cornices`, `checks.<f>`, `dach.<liste>`)
  mit `yamledit.replace_blocks`. Alles außerhalb bleibt zeichengenau; im Block bleiben unveränderte Einträge
  zeichengenau, Kommentare am Zeilenende und Kommentarzeilen wandern mit ihrem Eintrag, Zahlformate unveränderter Werte
  bleiben (4.40). Gegenprüfung über die ganze Datei, Sicherung in `.history/`, Prüfung der Werte im Server.
- `project.yaml`: Kamera- und Licht-Editor ändern nur den betroffenen Eintrag unter `cameras` bzw. `lights`
  (zeilengenau, Kommentare, Ausrichtung und alle anderen Zeilen bleiben, `studio/yamledit.py` mit ruamel.yaml).
  Vor dem Schreiben: Prüfung (Namen nur `[a-z0-9_]`, Zahlen in sinnvollen Grenzen, Pflichtfelder `pos`, `target`,
  `lens` bzw. `date`, `time`, `tz`; `season` aus fruehling, sommer, spaetsommer, herbst, winter), Gegenprüfung des
  Ergebnisses (alle anderen Abschnitte unverändert) und Sicherung nach `.history/project.<zeitstempel>.yaml`
  (nicht eingecheckt). Lichter, die `wohnungen.yaml` verwendet, lassen sich nicht löschen oder umbenennen.
  Neue Kameras und Lichter erscheinen sofort in Shotlist und Queue.
- `status.json`: von Hand gesetzter Schrittstatus (alternativ optionales Feld `status: {4: annahme}` in `project.yaml`)
- `intake.json`: Stand der Intake-Checkliste, unter `dateien` die Zuordnung hochgeladener Dateien zu Punkten
- `quellen/`: Upload PDF, DWG, JPG, PNG, XLSX, DOCX bis 100 MB; Dateiname wird gesäubert (Umlaute, Sonderzeichen,
  keine Pfade), bei gleichem Namen `_2`, `_3`; Inhalt muss zur Endung passen. `quellen/*.pdf` bleibt gitignored.
- `freigabe.json`: Freigabe, Ablehnung und Kommentare je Bild (Kundenkommentare mit `quelle: kunde`)
- `kundenlinks.json`: je Link nur SHA-256 des Tokens, Ablaufdatum, Notiz, Widerruf, letzter Zugriff. Das Token
  steht nur einmal in der Oberfläche (Galerie, Abschnitt Kundenlinks).

Zugriff: Anfragen von localhost dürfen alles. Alle anderen Anfragen (auch über einen Proxy mit `X-Forwarded-For`)
bekommen nur die Kundenansicht mit gültigem Token und die freigegebenen Dateien dieses Projekts, sonst 403.
Für Kunden außerhalb also das Studio hinter einem HTTPS-Proxy betreiben und im Kundenlink den Rechnernamen
durch die öffentliche Adresse ersetzen. Das Team arbeitet lokal (oder per SSH-Tunnel); eine Team-Anmeldung
gibt es noch nicht. Thumbnails und Job-Logs liegen in `immoviz/studio/.cache/` (nicht eingecheckt).

## Neues Objekt anlegen

Ziel: ein Objekt in etwa einem Tag aufnehmen, ohne YAML von Hand zu schreiben. Im Studio (`immoviz.py studio`):

1. **Projekte, „Neues Objekt“**: Slug, Name, Adresse, Gebäudeecke in GK Ost (`site.origin_gk`, aus dem Baukörpermodell
   oder ViennaGIS), Fassadenrichtung (`site.x_axis_deg`, Fassade A gegen Ost), Fassade A (entlang +x) und optional
   Fassade B an der Ecke (entlang +y zum Ursprung) mit Namen und Länge. Das Studio legt `projects/<slug>/` mit
   `quellen/`, `data/`, `renders/`, `project.yaml` aus `projects/_vorlage/project.yaml` (Beispielwerte mit
   Kommentaren, leere Achsen) und `prompts.yaml` an und startet auf Wunsch `immoviz.py geo` über die Queue.
2. **Intake**: Straßenansichten (Vektor-PDF 1:100), Schnitt, Grundrisse hochladen.
3. **Fassaden, „Plan kalibrieren“**: PDF, Seite, dpi und Maßstab wählen, im Plan auf u = 0 / z = 0 klicken, Ausschnitt
   und Höhenkoten setzen. Danach **Achsen** über die Fensterachsen klicken, **Geschosse** an die Fenster ziehen
   (Unterkante, Höhe, Breite, Typ, Umrahmung), **Gesimse** verschieben, **Erdgeschoss** je Achse festlegen. Jede
   Fassade einzeln; Geschosszeilen und Gesimse gelten für alle Fassaden.
4. **Dach**: Wände, Schrägen, Volumen, Geländer und Decken aus Schnitt und DG-Grundrissen eintragen, Skizze prüfen.
5. **Abgleich**: „Planabgleich prüfen“, mit dem Schieberegler Achsen, Gesimse und Dachkanten gegen den Plan prüfen.
6. Angebaute Nachbarn und Häuser gegenüber (`neighbour_facades`) weiterhin in `project.yaml` (noch ohne Editor),
   Kameras und Licht im Studio, Vorschau rendern, mit `svcheck` gegen Street View prüfen. Erst dann Higgsfield.

Ohne Studio: Ordner wie oben von Hand anlegen (am besten `_vorlage` kopieren), `site.origin_gk`, `x_axis_deg` und
`facades` nach `immoviz.py geo` aus dem Baukörpermodell ablesen. Jede Zahl bekommt im YAML-Kommentar ihre Quelle.

## Datenquellen

- Stadt Wien Open Data (CC BY 4.0): Baukörpermodell `FMZKBKMOGD`, Baumkataster `BAUMKATOGD`,
  Verkehrsflächen `FMZKVERKEHR1/2OGD`, Gebäudeinformation `GEBAEUDEINFOOGD`, Höhenlinien `HOEHENLINIEOGD`, Adressdienst.
- Stadt Wien MA 41 (CC BY 4.0): Generalisiertes Dachmodell LOD2 als CityGML je Blatt 1:1000
  (`https://www.wien.gv.at/ma41datenviewer/downloads/geodaten/lod2_gml/<blatt>_lod2_gml.zip`, Blattnummer
  RE = 100 + x/500, HO = y/500 - 600 in GK Ost, Datenstand 2016) und Orthofoto 2024 (WMTS
  `https://mapsneu.wien.gv.at/wmts/lb2024/farbe/google3857/{z}/{row}/{col}.jpeg`) für Dachfarbe und Kontrolle.
  Ebenfalls erreichbar, aber nicht genutzt: Oberflächenmodell `dom_tif/<blatt5000>_dom_tif.zip` (Stand 2015)
  und Geländemodell `dgm_tif`.
- Google Maps wird nicht verbaut (Lizenz), nur als interne Referenz: Street View über `svcheck`, Photorealistic
  3D Tiles nur als Gegenprobe der Dachhöhen außerhalb des Repos. Der Schlüssel steht ausschließlich in der
  Umgebungsvariable `GOOGLE_MAPS_API_KEY`.

## Intake-Checkliste je Objekt

- [ ] Straßenansichten aller Straßenfassaden, 1:100, als Vektor-PDF oder DWG
- [ ] Schnitt mit Höhenkoten (Wiener Null), Grundrisse aller Geschosse inkl. Dachgeschosse
- [ ] Farbkonzept mit Herstellerfarbtönen, Bau- und Ausstattungsbeschreibung
- [ ] Fotos vom Bestand (Fassade, Details, Ausblicke), falls vorhanden
- [ ] Mood-Referenzen: 15 bis 20 Bilder „so soll es wirken“, 3 bis 5 „so nicht“
- [ ] Kameras und Lichtstimmungen mit dem Vertrieb abgestimmt
