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
Offen für B: Team-Anmeldung (bis dahin nur lokal),
Final-Rendering aus der Oberfläche, Export, Bearbeiten der Walkthrough-Pfade. Next.js laut Abschnitt 4 erst,
wenn die Oberfläche öffentlich erreichbar wird.

**Stand Phase C (14.11.2026):** Fassaden-Editor (Straßenansicht aus `checks.<fassade>` als Hintergrund im Maßstab,
Achsen, Geschosszeilen, Gesimse, Erdgeschoss-Overrides, Kalibrierung von `u0_px` per Klick, Raster 5 cm, Einrasten an
Höhenkoten und Linien), Dach-Editor (Listen walls, slopes, volumes, railings, slabs mit Ansichtsskizze je Fassade),
Planabgleich aus der Oberfläche über die Queue mit Schieberegler Plan/Modell, „Neues Objekt“ aus
`projects/_vorlage/project.yaml` mit optionalem `geo`-Lauf. Gespeichert wird blockweise mit
`yamledit.replace_blocks` (Kommentare und unveränderte Einträge bleiben, Sicherung in .history). Geprüft an Wimmergasse
20: die gespeicherten Achsen liegen über den Fensterachsen der Ansicht. Higgsfield aus der Oberfläche (Veredeln je
Blender-Bild, Video aus Start- und Endbild, Prompt aus `prompts.yaml`, Kosten in der Queue, Trockenlauf ohne Schlüssel);
API-Stand und Lücken in `higgsfield/API.md` (Nano-Banana-Pro-Pfad und Kling mit Endbild nicht öffentlich dokumentiert).
Offen für C: KI-Vorschlag der Achsen aus dem Vektor-PDF, Fenstertypen-Bibliothek und Stuckbausteine, Editor für
`neighbour_facades`, Schnitt als Hintergrund im Dach-Editor, 3D-Vorschau neben dem Editor, Freigabe-Knopf im Abgleich.

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
| **Straße vor dem Haus**: Parkordnung (längs, schräg, senkrecht), Stellplätze, Gehsteigbreite, Bordstein, Baumscheiben | Orthofoto Stadt Wien 2024 (5 cm je Pixel), Verkehrsflächen, Baumkataster | `immoviz.py strasse` (Prüfbild `renders/check/strasse_abgleich.jpg`, Tabelle `.md`), Parkordnung in `street.parking` |
| Gelände | Sockelhöhen Baukörpermodell plus Plankoten | Geländeebene im Modell |
| Nachbarfassaden, Straßenmöbel, Pflaster, Leuchten, Blickachsen | Google Street View (nur Referenz, nicht im Bild) | Abruf je Kameraposition |
| Dächer der Umgebung | Dachmodell LOD2 Stadt Wien, Farbe aus dem Orthofoto | `immoviz.py daecher`, Draufsicht gegen Orthofoto |
| Welche Häuser müssen stimmen | Pflichtliste: in jede Straßenrichtung die ersten 4 bis 5 Häuser je Straßenseite, dazu Sehstrahlen der Hauptkameras | `immoviz.py sichtbar --pflicht` (Liste je Richtung und Seite), `immoviz.py sichtbar` (Bildanteil je BEZUG, Pflichthäuser markiert) |
| Dachdeckung, Mansarden, Gauben, Dachfenster, Kamine, Brandwände | Schrägluftbild (nur ansehen), Street View | `roofs_override` in `project.yaml` (parametrisch, nichts abgepaust) |
| Fernsicht bei Luft- und Terrassenmotiven: markante Gebäude, Hügelkette, Dachlandschaft im Hintergrund | Baukörpermodell (hohe Teile), Strukturdominanten, Höhenfestpunkte der Stadt Wien | `immoviz.py fernsicht` (`data/fern.json`, Liste je Kamera) |
| Bäume | Baumkataster, Street View belaubt, Orthofoto | `trees_override` in `project.yaml` |
| **Jede Außenkamera gegen die 3D-Referenz**: Dachkanten, Traufen, Firste, Dachaufbauten, Silhouetten, Horizont und Fernsicht im exakt gleichen Blickwinkel | Google Photorealistic 3D Tiles (nur intern), kalibriert auf die Fahrbahn (Höhe) und die Hauskanten (Lage) | `immoviz.py referenz <projekt> --kamera <name>` (`renders/check/abgleich_<kamera>.md` und `.jpg`) |

**Grundregel (Daniel, 14.11.2026):** Die Häuser in der direkten Umgebung werden immer mitmodelliert und müssen
stimmen: mindestens beide angebauten Nachbarn je Straßenfront plus die Häuser gegenüber im Bildausschnitt der
Hauptkameras. Je Nachbar: Traufhöhe und Baukörper aus dem Baukörpermodell, Achsen, Geschosse, Erdgeschoss
(Tore, Portale, Lokale), Gesimse und Fensterumrahmungen, Balkone, Dachform und Farbe aus Street View. Eingetragen
wird das unter `neighbour_facades` in `project.yaml`, geprüft mit `immoviz.py svcheck`. Ohne bestandenen
Nachbarabgleich gibt es kein Rendering für den Vertrieb.

**Grundregel 3D-Referenzabgleich (Kunde, 16.11.2026):** Jede Außenkamera wird vor der Veredelung gegen die
3D-Referenz abgeglichen: `immoviz.py referenz <projekt> --kamera <name>` rendert denselben Blick (Standpunkt,
Brennweite, Bildformat, Shift) aus den Google Photorealistic 3D Tiles und vergleicht Gebäude für Gebäude.
Schwellwerte: Traufe, First und obere Dachkante im Bild der Pflichthäuser (erste 4 bis 5 Häuser je Richtung)
höchstens 0,5 m daneben, alle übrigen Häuser im Bild höchstens 1,5 m; keine fehlenden Dachaufbauten über 2 m² und
1 m Höhe bei den Pflichthäusern; Horizontlinie im Mittel unter 5 px bei 1200 px Bildbreite; markante Gebäude der
Fernsicht an der richtigen Stelle. Korrigiert wird parametrisch (`roofs_override` mit `dach`, `dz`, `aufbauten`,
`mansarde`; `neighbour_facades`; `fern_gipfel`, `fern_spitzen`), Maße bleiben aus den Daten der Stadt Wien, Google
liefert nur Messwerte. Danach `--nur-modell` wiederholen, bis die Liste in `renders/check/abgleich_<kamera>.md` für
die Pflichthäuser leer ist. Bilder mit Google-Inhalt bleiben in `renders/streetview/referenz_google/` (nicht im
Repo); das Prüfbild in `renders/check/` zeigt nur das Modell mit Ampel.

**Grundregel Referenzvisualisierungen (Kunde, 16.11.2026):** Liegen Referenzvisualisierungen vor, zuerst Kamera
matchen, dann Nachbarn an der Überlagerung angleichen. `immoviz.py kameramatch <projekt> --bild <vorlage> --punkte
<punkte.yaml> --kamera <name>` löst die Kamera aus Passpunkten am Neubau (Plan) und trägt sie in `project.yaml` ein;
gematcht ist sie erst bei einem mittleren Reprojektionsfehler unter 1 % der Bildbreite. Dann werden die Nachbarn
Element für Element an Überlagerung und Drahtmodell angeglichen (Baukörperkanten, Feuermauern, Traufhöhen,
Geschosse, Fensterachsen, Balkone, Erker, Dachformen, Farben aus mittleren Flächen, Vegetation), bis die Modellkanten
der Nachbarn aus jeder Vorlagenkamera weniger als 1 % der Bildbreite neben der Vorlage liegen. Die Vorlage hat
Vorrang für die Nachbarn, die sie zeigt; der Neubau bleibt beim Einreichplan. Widersprüche Vorlage gegen Plan oder
OGD werden im Umgebungsabgleich dokumentiert. Ohne Kameramatch wird nicht „nach Augenmaß“ angeglichen: bei NOMA
stand die Kontrollkamera `hof_vorlage` 10 m neben dem Standpunkt der Vorlage (26 statt 19 mm), alle Nachbarn lagen
dadurch scheinbar falsch.

**Grundregel Straßenabgleich (Kunde, 15.11.2026):** Parkplätze und Gehsteige vor dem jeweiligen Gebäude werden bei
jedem Objekt geprüft. Kein Rendering für den Vertrieb ohne Straßenabgleich: `immoviz.py strasse <projekt>` ausführen,
im Prüfbild kontrollieren, ob die eingezeichneten Stellplätze auf den Autos im Orthofoto liegen (Richtung und
Raster), ob Bordstein und Gehsteig decken und ob die Baumscheiben stimmen. Die Parkordnung je Streifen steht in
`street.parking` (`laengs`, `schraeg` mit Winkel, `senkrecht`); die Autos im Rendering stehen auf genau den
Stellplätzen, die das Prüfbild zeigt. Nach jeder Änderung an `street` oder `trees_override` und nach jedem neuen
`geo` wird das Prüfbild neu erzeugt und mit dem Projekt abgelegt. Beispiel Wimmergasse 20: Wimmergasse Hausseite
Schrägparker (rund 55 Grad), gegenüber Längsparker, Stolberggasse beidseitig 90 Grad.

**Feste Vorgabe Pflichthäuser (Kunde, 15.11.2026):** In jede Richtung müssen die ersten 4 bis 5 Häuser je
Straßenseite passen. Gemeint sind von der Kreuzung bzw. vom Objekt aus alle Straßenrichtungen (bei einem Eckhaus
vier), jeweils beide Straßenseiten, unabhängig davon, wie groß das Haus in einer Kamera erscheint. Je Haus:
Traufhöhe, Geschosszahl, Achsenzahl grob, Erdgeschoss-Typ, Fassadenfarbe, Dachform und Dachmaterial, markante
Aufbauten (Mansarde, Gauben), Balkone. `immoviz.py sichtbar <projekt> --pflicht` gibt die Liste aus (BEZUG,
Adresse, Flucht, Traufhöhe, vorhandene Fassade) und nennt unter `ohne_fassade` jedes Pflichthaus, das noch keinen
Eintrag in `neighbour_facades` hat; diese Liste muss leer sein. Jedes Pflichthaus bekommt eine frontale Ansicht in
`streetview_checks`. Alles dahinter: nur das Dach halbwegs.

**Feste Vorgabe Dächer und Fernsicht (Kunde, 15.11.2026):** In der Drohnenaufnahme sollen Dächer, Häuser in der
Gasse, Parkplätze und Straße so realitätsgetreu wie möglich sein, und in die weitere Distanz gehören markante
Gebäude und die Dachlandschaft dazu. Maße kommen weiter aus den Daten der Stadt Wien; ein Schrägluftbild (Apple
Maps, Google) wird nur angesehen und liefert, was den Daten fehlt: Deckung und Farbton, Mansarden, Gauben,
Dachfenster, Kamine, Brandwände, Fassadenfarben, Baumgrößen. Eingetragen wird das als Parameter in
`roofs_override`. Bei Luft- und Terrassenmotiven gehört die Fernsicht zum Pflichtabgleich: `immoviz.py fernsicht`
lädt die hohen Baukörper im Umkreis von 7,5 km und nennt je Kamera die markanten Gebäude im Sichtkegel; sie
müssen im Bild als Silhouette an der richtigen Stelle stehen, die Liste gehört in `umgebung_abgleich.md`.

**Abstufung (Kunde, 15.11.2026):** Über die Pflichthäuser hinaus müssen Fassaden dort stimmen, wo eine Kamera unmittelbar
draufsieht (mindestens 1 % Bildanteil, näher als 80 m, berechnet mit `sichtbar`). Für alle weiteren Häuser genügt, dass die
Dächer halbwegs stimmen; das leistet das Dachmodell LOD2 für rund 90 % der Gebäudefläche im Umkreis von 250 m.
Gehsteige und Parkstreifen kommen aus den Verkehrsflächen der Stadt Wien und werden gegen das Orthofoto gelegt
(Toleranz 0,5 m). Google-Daten (Street View, 3D Tiles) bleiben reine Referenz: nichts davon kommt ins Modell,
ins Repo oder in ein Vermarktungsbild. Ablauf und Befund je Objekt stehen in `umgebung_abgleich.md`.

Erkenntnisse Umgebungsabgleich Wimmergasse 20 (15.11.2026): drei direkt sichtbare Häuser fehlten als Fassade
(Stolberggasse 32, Wimmergasse 24, Stolberggasse 40), zwei Häuser hatten eine unmodellierte zweite Straßenfront,
vier hatten falsche Geschosszahl, Gliederung oder Farbe. Das Baumkataster führt alte Säulenhainbuchen zu klein;
belaubte Street-View-Bilder sind für Baumgrößen verlässlicher als das unbelaubte Orthofoto.

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

## 9. Korrekturschleife (Stand 16.11.2026)

Ziel: Fehler aus den Runden bei NOMA und Wimmergasse (falsche Parkordnung, erfundene Bäume, Geländer und Tröge,
Weg ohne Rampe, geschätzte Fensterraster, falscher Maßstab, vertauschte Küche, Stuck ohne Plan, Farben aus
beleuchteten Ansichten, Veredelung erfindet Türen und Fenster, Credits vor der Modellfreigabe) nicht mehr beim
Kunden finden, sondern vorher automatisch. Verbindliches Regelwerk mit Begründung je Regel: `REGELN.md`.

```
Plan auswerten (Vektor vor Pixel, Feld quelle je Element)
  -> Modell (Blender, Großmöbel als Platzhalter)
  -> automatische Prüfungen
       pruefen      Quellen je Element, Anteil Annahmen je Bild, Rang der Quelle, Farbe aus Pixeln
       sichtbar     Pflichthäuser und direkt sichtbare Nachbarn
       strasse      Parkordnung, Gehsteige, Baumscheiben gegen Orthofoto
       referenz     Kamera gegen Google 3D (paralleler Ausbau, siehe Abschnitt 7)
       kameramatch  Kamera gegen Vorlage des Kunden (paralleler Ausbau)
  -> Prüfbogen an den Kunden (Vorschau je Kamera, offene Annahmen, Nachbarübersicht)
  -> Freigabe je Kamera in freigabe.yaml (immoviz.py freigabe)
  -> Veredelung (Studio oder MCP; Gate und Regelblock aus higgsfield/prompt_regeln.yaml, immoviz.py prompt)
  -> nachkontrolle (Struktur-Diff Vorschau gegen Ergebnis, Markierungsbild, Score, Varianten-Rangfolge)
  -> Kunde
```

| Schritt | Befehl | Ergebnis | blockiert |
|---|---|---|---|
| Quellen | `immoviz.py pruefen --projekt <p>` | Liste ohne Quelle, Anteil ANN je Bild, Hinweise (Geländer ohne Plan, Farbe gemessen) | Exit 1 bei fehlenden Quellen; `--streng` verlangt das Feld `quelle` |
| Freigabe | `immoviz.py freigabe --projekt <p> --cam <k> --setzen ja --von <Name>` | `freigabe.yaml` mit Datum und Person | Studio: HTTP 409 für nicht freigegebene Kameras, außer Trockenlauf, Altbestand ohne Datei oder `force` |
| Veredelung | `immoviz.py prompt --projekt <p> --cam <k>` bzw. Studio | Regelblock am Prompt, Warnung bei fehlendem Möbelplan | Exit 1, wenn gesperrt |
| Nachkontrolle | `immoviz.py nachkontrolle --vorschau <png> --veredelt <jpg> [...]` | `<bild>_nachkontrolle.jpg`, JSON mit Score, Befunden, Öffnungskandidaten | Status "zur Pruefung" ab Score 400 |

Was die Schleife spart: Bei NOMA wurden 18 von 74 Aufträgen verworfen und mehrere übernommene Bilder durch spätere
Modellkorrekturen (Runde 4) überholt. Mit Quellenpflicht und Freigabe vor dem ersten Credit wären die Fehler
der Runden 2 bis 4 (Geländer, Trog, Weg, Küche, Stuck, Nachbarfarben, Bäume) im Prüfbogen aufgefallen; die
Nachkontrolle markiert erfundene Öffnungen, bevor der Kunde sie sieht (Testprotokoll in REGELN.md).
