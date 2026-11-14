# immoviz Studio: Konzept für das Visualisierungs-Tool mit eigener Oberfläche

Stand 14.11.2026, Arbeitsstand für Ad Boutique und UNIO. Grundlage ist der Prototyp in diesem Ordner
(Kommandozeile, erstes Objekt Wimmergasse 20).

## 1. Ziel

Aus Plänen, Ausstattung und Mood eines Objekts in wenigen Tagen ein vollständiges, maßhaltiges
Bildpaket für den Vertrieb erzeugen: Totalen, Architekturdetails, Ausblicke, Jahreszeiten und Tageszeiten,
dazu kurze Kamerafahrten. Jedes Bild ist gegen den Plan prüfbar.

**Grundprinzip bleibt:** Blender liefert die Wahrheit (Geometrie, Kamera, Sonne), die Bild-KI liefert das
Finish (Material, Atmosphäre, Leben). Die Oberfläche macht diesen Ablauf für das Team bedienbar, ohne
Blender- oder Programmierkenntnisse.

## 2. Ablauf für High-End-Renderings (10 Schritte)

| # | Schritt | Ergebnis | Wer / was |
|---|---|---|---|
| 1 | **Intake**: Pläne (Ansichten, Schnitte, Grundrisse, möglichst Vektor-PDF/DWG), BAB, Farbkonzept, Fotos, Mood hochladen | Quellenliste mit Stand und Lücken | Team, Checkliste im Tool |
| 2 | **Verortung**: Adresse eingeben, Gebäude im Luftbild anklicken, Fassaden wählen | Lokales Koordinatensystem, Umgebung (Gebäude, Gehsteige, Bäume, Gelände) | automatisch aus Stadt Wien Open Data |
| 3 | **Fassaden aufnehmen**: Ansicht als Hintergrund, Achsen, Geschosse, Gesimse, Fenstertypen einzeichnen | Fassadenmodell je Straßenseite | Editor, KI-Vorschlag aus Vektor-PDF |
| 4 | **Dach und Volumen**: Dachgeschosse, Rücksprünge, Terrassen, Schrägen aus Schnitt und DG-Grundrissen | Kubatur | Editor |
| 5 | **Planabgleich**: Orthogonal-Ansicht des Modells über die Ansicht legen | Abweichungen in cm, Freigabe des Modells | automatisch (`check`) |
| 6 | **Materialien**: Farbkonzept und BAB in Materialien übersetzen (Putz, Stuck, Fenster, Zink, Böden) | Materialbibliothek je Objekt | Bibliothek plus Farbwerte |
| 7 | **Shotlist**: Kameras auf der Karte setzen, Motivtyp wählen, Licht und Jahreszeit je Motiv | Shot-Matrix | Vorlagen je Gebäudetyp |
| 8 | **Rendering**: Vorschau (Sekunden bis Minuten), dann Final | maßhaltige Grundbilder | Render-Worker (Blender) |
| 9 | **Veredelung**: Bild-KI mit Mood-Bausteinen, Varianten, Geometrie-Prüfung, 4K-Upscale, optional Video | fotorealistische Bilder | Higgsfield, automatische Achsenprüfung, Mensch gibt frei |
| 10 | **Freigabe und Export**: Kunde kommentiert, Versionen, Export in Formate (Exposé, Web, Social, Bauzaun) | Bildpaket mit Kennzeichnung | Freigabe-Ansicht |

## 3. Oberfläche (Bildschirme)

1. **Projekte**: Kacheln je Objekt mit Fortschritt der 10 Schritte, letzte Bilder, offene Punkte.
2. **Intake**: Upload-Bereich, automatische Erkennung des Dokumenttyps (Ansicht, Schnitt, Grundriss, BAB),
   Checkliste mit Ampel, Quellen mit Datum. Fehlt etwas, erzeugt das Tool die Anfrage-Mail an den Bauträger.
3. **Lage**: Luftbild der Stadt (oder Satellit außerhalb Wiens), Gebäude anklicken, Fassaden markieren,
   Umgebung laden. Anzeige von Gehsteigen, Parkstreifen, Bäumen zur Kontrolle (wie der Luftbild-Abgleich).
4. **Fassaden-Editor**: Plan-PDF im Maßstab als Hintergrund, Achsen per Klick, Geschosslinien an Höhenkoten
   einrasten, Fenstertypen aus einer Bibliothek (Kastenfenster, Schaufenster, Tor, modern), Stuckelemente
   (Gesims, Verdachung, Konsole) als Bausteine. Daneben live das 3D-Modell.
5. **Dach-Editor**: Schnitt als Hintergrund, Dachgeschosse als Ebenen mit Rücksprung, Schrägen, Terrassen,
   Geländer, Dachfenster.
6. **Planabgleich**: Überlagerung Plan und Modell mit Schieberegler, Liste der Abweichungen, Freigabe-Knopf.
7. **Material und Mood**: Farbfelder aus Farbkonzept, BAB-Positionen, Mood-Board aus der Referenzsammlung,
   daraus abgeleitete Bildregeln.
8. **Shotlist**: Karte mit Kamerakegeln, Liste der Motive (Totale, Detail, Luft, Ausblick, Abend), Matrix
   Motiv x Licht x Jahreszeit, Vorschau-Thumbnail je Zelle.
9. **Render- und KI-Queue**: Fortschritt, Kosten (Credits), automatische Prüfung (Achsen, Höhen), Varianten
   nebeneinander, Favorit wählen.
10. **Galerie und Freigabe**: Kunde sieht nur freigegebene Bilder, kann kommentieren, Versionen, Export.

## 4. Technische Architektur

| Baustein | Technik | Bemerkung |
|---|---|---|
| Oberfläche | Web-App (Next.js), im UNIO-Designsystem | läuft im Browser, auch für Kunden-Freigabe |
| Backend | Python (FastAPI) | nutzt die bestehenden Module `geo_wien`, `build`, `check` |
| Projektdaten | `project.yaml` je Objekt, versioniert | bleibt das Herzstück, Editor schreibt nur diese Datei |
| Render-Worker | Blender 5.2 als Python-Modul, GPU | Mac Studio im Büro oder Cloud-GPU auf Abruf; Vorschau in Sekunden |
| Bild-KI | Higgsfield API (Nano Banana Pro, Upscale, Video) | Prompt-Bausteine aus Mood und Lichtszenario |
| Geodaten | Stadt Wien Open Data, Luftbild Wien; außerhalb Wiens basemap.at und Landesdienste | Google Street View nur als Referenz (Lizenz) |
| Ablage | Google Drive (Projektordner) oder S3 | Pläne bleiben im Kundenordner |
| Agency Hub | Protokoll je Schritt, Tasks für fehlende Unterlagen | über die bestehende Schnittstelle |

## 5. Ausbaustufen

| Phase | Inhalt | Ergebnis |
|---|---|---|
| A (jetzt) | Kommandozeile, Claude als Operator, Objekt Wimmergasse | erstes Bildpaket, Prozess gelernt |
| B (Kern plus Editoren, 14.11.2026) | Web-Oberfläche: Projekte, Intake mit Upload, Shotlist, Kamera- und Licht-Editor, Render-Queue, Galerie, Freigabe mit Kundenlink | Team kann ohne Code arbeiten |
| C | Fassaden- und Dach-Editor mit Planüberlagerung, KI-Vorschlag aus Vektor-PDF | neues Objekt in einem Tag aufgenommen |
| D | Innenräume: Grundriss zu Raum, Staging, BAB-Materialien, Ausblick aus dem Fenster | Wohnungsbilder |
| E | Kamerafahrten, interaktive 360-Ansichten, Einbindung in Projekt-Websites | Bewegtbild und Web |

**Stand Phase B (14.11.2026):** `immoviz.py studio` startet die lokale Oberfläche (FastAPI plus statisches
HTML/CSS/JS im UNIO-Design, kein Build-Schritt, Code in `studio/`). Fertig: Projekte, Übersicht mit 10 Schritten
(abgeleitet, von Hand überschreibbar), Intake-Checkliste, Shotlist-Matrix mit Thumbnails, Render-Queue (ein Job
gleichzeitig, Vorschau ohne .blend), Galerie mit Freigabe und Kommentar, Kundenansicht mit nur freigegebenen Bildern.
Zweite Ausbaustufe B (14.11.2026): Kamera-Editor mit Lageplan aus context.json (Klick setzt Position und Ziel,
Blickkegel aus der Brennweite), Licht-Editor mit live berechnetem Sonnenstand, beide schreiben zeilengenau in
project.yaml (Kommentare bleiben, Prüfung, Sicherung in .history). Upload im Intake mit Zuordnung zu Punkten.
Kundenlink mit Token (nur Hash gespeichert, Ablauf, Widerruf); ohne Token nur noch localhost, von außen nur
Kundenansicht und freigegebene Dateien. Galerie mit Videoplayer und Kamerapfaden der Walkthroughs.
Offen für B: Team-Anmeldung (bis dahin nur lokal), Higgsfield-Aufträge und Kosten in der Queue,
Final-Rendering aus der Oberfläche, Export, Bearbeiten der Walkthrough-Pfade. Next.js laut Abschnitt 4 erst,
wenn die Oberfläche öffentlich erreichbar wird.

**Stand Phase E (14.11.2026):** `walkthrough` (Reel 1) und `schnitt` (Reel 2) laufen auf der Kommandozeile.
`schnitt` rendert aus einer festen Axonometrie sechs Zustände (ganzes Haus, Schnitt im 3. DG, 3., 2., 1. OG, EG)
im Modellbau-Look; Innenwände aus den Vektor-Grundrissen EG bis 3. OG, Dachgeschosse aus der Dachkubatur,
Top 7, Top 12 und Top 35 in #FFAA09. Kontrolle je Geschoss über `check_<geschoss>.jpg`. Neu: `website` erzeugt
die Projektseite (Vorlage Das Wimmer, `website.yaml`) mit Schnittbild, Geschoss-Umschalter und anklickbaren
Wohnungen; die Hotspots projiziert `lib/hotspots.py` mit der Schnittkamera aus den Wohnungspolygonen
(`renders/schnitt/hotspots.json`). Offen: Treppen und Grundrisse 1. bis 3. DG, weitere Wohnungen im Schnitt,
Zimmeranzahl, Preise und Kontakt (heute "auf Anfrage" bzw. Platzhalter, später aus dem Hub), Veröffentlichung
der Seite, 360-Ansichten.

## 6. Bildpaket je Objekt (Standard)

Die objektbezogene Shotlist steht in `projects/<objekt>/mood_analyse.md` (für Das Wimmer: 15 Motive,
Herbst als Hauptkampagne, Frühling und Winter als Varianten; Motive Ecke, Haustor und Abend in allen
Jahreszeiten mit gleicher Kamera). Standardumfang:

- 4 Totalen: Ecke auf Augenhöhe, Straßenflucht, Gegenseite, Luft
- 6 Architekturdetails: Beletage mit Verdachung, Eingang/Haustor, Gesims und Übergang zum Dachausbau,
  Loggia/Terrasse, Erdgeschoss mit Leben, Material-Nahaufnahme
- 2 Ausblicke: von der Dachterrasse, aus einer Regelgeschoss-Wohnung
- Lichtvarianten: diesiger Tag, Golden Hour, Blaue Stunde
- Jahreszeiten: Frühling (frisches Grün), Spätsommer, Herbst (goldenes Laub), Winter (kahle Bäume, warme Fenster)

## 7. Realitätsabgleich (fester Schritt vor jedem Rendering)

| Prüfung | Quelle | Werkzeug |
|---|---|---|
| Höhen, Achsen, Gesimse | Straßenansicht des Architekten | `immoviz.py check` (Überlagerung im Maßstab 1:100) |
| Gebäudeumrisse, Gehsteige, Parkstreifen, Bäume | Luftbild Stadt Wien (7,5 cm), Mehrzweckkarte | Luftbild-Überlagerung |
| Gelände | Sockelhöhen Baukörpermodell plus Plankoten | Geländeebene im Modell |
| Nachbarfassaden, Straßenmöbel, Pflaster, Leuchten, Blickachsen | Google Street View (nur Referenz, nicht im Bild) | Abruf je Kameraposition |

**Grundregel (Daniel, 14.11.2026):** Die Häuser in der direkten Umgebung werden immer mitmodelliert und müssen
stimmen: mindestens beide angebauten Nachbarn je Straßenfront plus die Häuser gegenüber im Bildausschnitt der
Hauptkameras. Je Nachbar: Traufhöhe und Baukörper aus dem Baukörpermodell, Achsen, Geschosse, Erdgeschoss
(Tore, Portale, Lokale), Gesimse und Fensterumrahmungen, Balkone, Dachform und Farbe aus Street View. Eingetragen
wird das unter `neighbour_facades` in `project.yaml`, geprüft mit `immoviz.py svcheck`. Ohne bestandenen
Nachbarabgleich gibt es kein Rendering für den Vertrieb.

Erkenntnisse Wimmergasse 20 (14.11.2026): Höhen exakt laut Plan; Korrekturen an DG3 links (Terrasse statt
Schräge), EG-Türen, Gelände (+0,79 m zur Ecke), Schrägparker, Granitpflaster, Seilleuchten, Nachbarfarben.

## 8. Referenzen aus der Praxis (Instagram-Reels, 14.11.2026)

**Reel 1, Plan zu Walkthrough (Claude, Blender, Seedance 2.5).** Vier Schritte: (1) echtes 3D-Modell aus dem Grundriss,
grob reicht; (2) eine Kameralinie auf 1,5 m durch alle Räume über den Grundriss ziehen; (3) jeden Raum als Standbild
"einfrieren" (Material-Callouts wie Sichtbeton, helle Kiefer, weißes Leinen, weiches Tageslicht), alle Räume im selben
Stil, damit es wie ein Haus wirkt; (4) das Videomodell bekommt die Blender-Kamerafahrt als Bewegungsvorlage plus
Start- und Endbild und folgt ihr. Kernaussage: Das Videomodell erfindet den Grundriss nie, Wände und Türen kommen aus
dem Plan. Das ist genau unser Prinzip, nur für Innenräume in Bewegung.

Übernahme bei uns (Phase E, neuer Befehl `walkthrough`): Kamerapfad je Wohnung in `wohnungen.yaml`
(Punkte auf 1,5 m), Blender rendert die Fahrt als Clay-Video und Standbilder an jedem Raumwechsel, Higgsfield
veredelt die Standbilder mit den Interior-Regeln (`mood_interior.md`), das Videomodell verbindet je zwei Standbilder
mit der Clay-Fahrt als Bewegungsreferenz. Erster Kandidat: Top 35 (Dachgeschoss mit Terrassen).

**Reel 2, Revit zu Projekt-Website (Claude, Revit MCP, Higgsfield).** Claude wählt aus dem 3D-Modell die besten
Ansichten, erzeugt ein Schnittvideo (Gebäude wird Geschoss für Geschoss aufgeschnitten), schlägt Website-Entwürfe vor
und baut sie: Luftbild bei Dämmerung, isometrischer Schnitt mit anklickbaren Wohnungen (Top-Nummer, Fläche, Preis),
Straßenansicht. Übernahme bei uns (Phase E): Blender kann denselben Schnitt (Schnittebene je Geschoss, Wohnungen
farbig aus den Grundrissen), daraus Schnittvideo und eine Projektseite im UNIO-Design mit Wohnungsauswahl.
Revit brauchen wir nicht, unser Modell kommt aus `project.yaml`.
