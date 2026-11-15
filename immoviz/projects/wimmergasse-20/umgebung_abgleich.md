# Umgebungsabgleich Wimmergasse 20 / Stolberggasse 36

Stand 15.11.2026. Ziel laut Kunde: Gehsteige, Hausdächer und Fassaden der erweiterten Nachbarschaft
sollen passen. Fassaden nur dort genau, wo eine Kamera unmittelbar draufsieht, bei allen weiteren
Häusern sollen die Dächer halbwegs stimmen.

## 1. Datenquellen

| Thema | Quelle | Lizenz, Verwendung |
|---|---|---|
| Baukörper, Traufhöhen | Stadt Wien, Baukörpermodell `FMZKBKMOGD` (WFS) | CC BY 4.0, im Modell |
| Dachflächen | Stadt Wien MA 41, Generalisiertes Dachmodell LOD2, CityGML je Blatt 1:1000 (`.../ma41datenviewer/downloads/geodaten/lod2_gml/<blatt>_lod2_gml.zip`), Blätter 103076, 103077, 104076, 104077, Datenstand 2016 | CC BY 4.0, im Modell (`data/roofs.json`) |
| Dachfarbe, Gehsteige, Bäume von oben | Stadt Wien, Orthofoto 2024 (WMTS `lb2024`), echtes Orthofoto, Dächer liegen deckungsgleich über den Grundrissen | CC BY 4.0, nur abgetastet bzw. als Kontrolle |
| Gehsteig, Parkstreifen, Fahrbahn | Stadt Wien, `FMZKVERKEHR1/2OGD` | CC BY 4.0, im Modell |
| Bäume | Stadt Wien, Baumkataster `BAUMKATOGD`, korrigiert über `trees_override` | CC BY 4.0, im Modell |
| Fassaden, Baumgrößen | Google Street View 05/2024 (Static API) | nur interne Referenz, Bilder in `renders/streetview/` (nicht im Repo) |
| Dachlandschaft als Gegenprobe | Google Photorealistic 3D Tiles (Stufe geometricError 2 m, nur Geometrie) | nur interne Referenz, liegt ausschließlich im Scratchpad |

Geprüft und nicht verwendet: Oberflächenmodell DOM (`dom_tif/45_1_dom_tif.zip`, 0,5 m, Stand 2015) und
Geländemodell DGM sind erreichbar, aber älter als das Dachmodell und bringen keine zusätzliche Information.
Der WFS-Layer `DACHKATASTEROBJEKTEOGD` liefert für das Gebiet keine Objekte, `FMZKGEBOGD` nur Grundrisse
ohne Höhen oder Dachangaben.

Aus Google wurde nichts übernommen: keine Geometrie, keine Textur, keine abgepausten Flächen. Alle
Korrekturen stehen von Hand in `project.yaml` oder kommen aus den Wiener Daten.

## 2. Dächer

**Methode.** `immoviz.py daecher <projekt>` (Code `lib/roofs.py`) lädt die LOD2-Blätter im Radius, rechnet jede
Dachfläche ins lokale System, ordnet sie über einen Punkt im Inneren dem Baukörper (FMZK_ID) aus `context.json`
zu und speichert die Höhen relativ zum Sockel dieses Baukörpers. Im Modell endet die Wand an der tiefsten
Dachkante, darüber liegen die echten Dachflächen; freie Dachkanten bekommen senkrechte Flächen (Giebel,
Brandwände, Gaubenwangen). Für die einzeln modellierten Nachbarfassaden ersetzen die echten Dachflächen die grobe
Angabe `roof`. Das Objekt selbst (BEZUG 009427) bleibt ausgenommen.

**Material.** Neigung aus dem Dachmodell, Farbe als Median im Orthofoto 2024 je Dachfläche. Klassen:
`dach_ziegel`, `dach_ziegel_dunkel`, `dach_blech`, `dach_blech_hell`, `dach_kies`, `dach_gruen`, `dach_flach`.
Geneigte Flächen eines Gebäudes bekommen die flächengewichtete Mehrheit, damit die Schattenseite kein anderes
Material bekommt. Ergebnis im Radius 420 m: 1690 Ziegel, 122 Ziegel dunkel, 2983 Blech, 347 Blech hell,
36 Flachdachflächen.

**Abdeckung.** 5440 Dachflächen in den vier Blättern, 5069 übernommen. Verworfen: 121 ohne heutigen Baukörper,
244 veraltet (Baukörper heute mehr als 1,5 m höher als das Dach von damals, oder neue Gebäudenummer, die das
Dachmodell nicht kennt). Nach Grundfläche der Hauptgebäude (Klasse 11, höher als 8 m) haben echte Dächer:
87 % im Umkreis 120 m, 90 % im Umkreis 250 m, 87 % im ganzen Radius 410 m. Gebäude ohne Dachdaten sind fast
durchwegs Neubauten und behalten die Höhenstufen des Baukörpermodells mit Flachdach, was dem Bestand entspricht
(Stolberggasse 34, Wimmergasse 17, Wimmergasse 31). Ohne `roofs.json` baut das Modell Satteldächer mit First
parallel zur längsten Straßenkante (`heuristic_roof`) statt der früheren Walmstümpfe.

**Gegenprobe.** Draufsicht Dachmodell gegen Orthofoto: Dachkanten deckungsgleich, Abweichung unter 0,5 m.
Firsthöhen gegen die Google-3D-Kacheln: Wimmergasse 22 Modell 23,2 m, Referenz 23,7 m; Wimmergasse 15 Modell 20,1 m,
Referenz 20,9 m; Stolberggasse 34 Modell 27,1 m, Referenz 28,2 m (Attika und Aufbauten). Alle innerhalb etwa 1 m.

**Bauzeit der Szene.** 12,2 s vorher, 12,5 s nachher (gemessen am selben Rechner, `build_scene`). Der Abruf
`daecher` dauert rund 6 Minuten ohne und 5 Sekunden mit Kachel-Cache (`--cache <ordner>`).

## 3. Direkt sichtbare Häuser

Berechnet mit `immoviz.py sichtbar <projekt>` (`lib/check.py`, `visible_buildings`): je Kamera 240 x 160
Sehstrahlen, Bäume und Autos werden übersprungen, gezählt werden Treffer auf steilen Flächen (Fassade) je
Baukörper. Direkt sichtbar heißt: Fassade mindestens 1 % des Bildes und näher als 80 m.

| Kamera | BEZUG | Bildanteil Fassade | nächster Punkt | modelliert als | direkt |
|---|---|---|---|---|---|
| ecke | 547117 | 3,7 % | 33 m | stolberggasse_34 | ja |
| ecke | 009428 | 1,8 % | 43 m | wimmergasse_22 | ja |
| ecke | 009425 | 1,5 % | 59 m | stolberggasse_32 | ja |
| ecke | 009429 | 0,9 % | 60 m | wimmergasse_24 | knapp |
| ecke_orbit | 547117 | 10,0 % | 30 m | stolberggasse_34 | ja |
| ecke_orbit | 547116 | 2,5 % | 29 m | gegenueber_w_ecke, gegenueber_w_ecke_s | ja |
| ecke_orbit | 009481 | 1,1 % | 46 m | gegenueber_w_29 | ja |
| ecke_orbit | 009428 | 0,8 % | 45 m | wimmergasse_22 | knapp |
| wimmergasse | 009428 | 26,9 % | 13 m | wimmergasse_22 | ja |
| wimmergasse | 547116 | 8,0 % | 19 m | gegenueber_w_ecke, gegenueber_w_ecke_s | ja |
| wimmergasse | 009481 | 6,3 % | 12 m | gegenueber_w_29 | ja |
| wimmergasse | 009453 | 2,2 % | 62 m | gegenueber_s_ecke, gegenueber_s_ecke_w | ja |
| stolberggasse | 547117 | 27,8 % | 17 m | stolberggasse_34 | ja |
| stolberggasse | 009453 | 5,8 % | 20 m | gegenueber_s_ecke, gegenueber_s_ecke_w | ja |
| stolberggasse | 547116 | 2,1 % | 54 m | gegenueber_w_ecke, gegenueber_w_ecke_s | ja |
| stolberggasse | 009479 | 1,2 % | 51 m | diagonal_w, diagonal_s | ja |
| stolberggasse | 009458 | 1,0 % | 77 m | stolberggasse_40 | knapp |

## 4. Befund je Haus (Street View 05/2024 gegen Modell)

Ansichten in `streetview_checks` (`f_` frontal, `s_` schräg, dazu die bisherigen Straßenblicke), Paare in
`renders/streetview/<name>_vergleich.jpg`.

| Haus | BEZUG | Befund | Stand |
|---|---|---|---|
| Stolberggasse 34 | 547117 | 6 Geschosse, versetzte Lochblechbalkone und Eingang links stimmten. Falsch war das dunkle Erdgeschoss: in echt taupe mit dunklem Band nur unter dem 1. OG. Braunes Garagentor in Fassadenmitte ergänzt. Dach: Flachdach mit Rücksprung aus dem Baukörpermodell, das alte Satteldach aus dem Dachmodell wird verworfen | korrigiert |
| Stolberggasse 32 | 009425 | fehlte (nur Baukörper in Lachsrosa). Neu: Gründerzeit cremegelb, genutetes EG, EG + 4 OG, zwei Tore. Achsenzahl (8) hinter dem Baum geschätzt | ergänzt, Achsen offen |
| Wimmergasse 22 | 009428 | Achsen, Geschosse, Tor, Farbe stimmen. Dach jetzt aus dem Dachmodell statt Pultannahme | stimmt, Dach ersetzt |
| Wimmergasse 24 | 009429 | fehlte (weißer Baukörper mit 5 Achsen). Neu: hellgelb, Stuck abgeschlagen, EG + 3 OG, 9 Achsen, Tor am Südende | ergänzt |
| Wimmergasse 17, Front Wimmergasse | 547116 | umlaufende Balkonbänder waren falsch. In echt: heller Steinsockel, 1. OG mit französischen Fenstern, darüber Balkonstapel mit geschlossener Brüstung in der Mitte und am Nordende, dunkle Geschossfugen, weiße Fensterrahmen | korrigiert |
| Wimmergasse 17, Front Stolberggasse 38 | 547116 | fehlte ganz (geschlossene Wand). Neu: 7 Achsen, drei Balkonstapel, Eingang im Rücksprung | ergänzt |
| Wimmergasse 19 | 009481 | hatte 5 Fensterreihen und 6 Achsen, in echt EG + 3 OG und 8 Achsen, Tor am Nordende, Farbe dunkler greige | korrigiert |
| Wimmergasse 18, Front Stolberggasse | 009453 | hatte 6 Fensterreihen, in echt EG + 4 OG | korrigiert |
| Wimmergasse 18, Front Wimmergasse | 009453 | fehlte. Neu: weiß, große EG-Öffnungen (drei Schaufenster, Rolltor), 4 OG | ergänzt |
| Wimmergasse 15, beide Fronten | 009479 | war weiß und schlicht mit 5 Reihen. In echt Gründerzeit graugrün mit Stuck, genutetes EG, EG + 3 OG, kräftiges Hauptgesims | korrigiert |
| Stolberggasse 40 (Bürohaus) | 009458 | fehlte (beiger Lochfassaden-Baukörper). Neu vereinfacht: helle Metallfassade, verglastes EG, schmale dunkle Schlitze. Die senkrechten Lamellen sind nicht modelliert | ergänzt, vereinfacht |

Nicht direkt sichtbar und daher nur über Baukörper und Dach geprüft: Wimmergasse 21 bis 23 (`gegenueber_w_31`,
`gegenueber_w_33`), Stolberggasse 35 und 31 (`gegenueber_s_lachs`, `gegenueber_s_weiss`), Stolberggasse 30
(009415, im Modell lachsfarben, in Street View weiß: nur 0,8 % Bildanteil in `ecke`, offen).

## 5. Gehsteige und Parkstreifen

Draufsicht Modell (Gehsteig, Parkstreifen, Fahrbahn, Bordsteinlinien) über Orthofoto 2024, Zoom 21 (rund 5 cm
je Pixel), für die Kreuzung, die Wimmergasse vor dem Haus und die Stolberggasse bis Nr. 32:

- Bordsteinkanten, Gehsteigbreiten und Hauskanten liegen innerhalb von etwa 0,3 m auf dem Orthofoto. Keine
  Abweichung über 0,5 m gefunden.
- Die vier Gehsteigvorziehungen an der Kreuzung sind in den Wiener Daten enthalten und stimmen in Form und Lage.
- Parkordnung: Wimmergasse auf der Hausseite schräg, gegenüber längs; Stolberggasse beidseitig schräg bzw.
  senkrecht. Das Modell leitet das aus der Breite der Parkstreifen ab und trifft es.
- Baumscheiben liegen als Aussparungen in den Parkstreifen an den richtigen Stellen.
- Nicht modelliert (Street View): rot-weiße Poller an den Vorziehungen, Verkehrszeichen, Fahrradbügel an der
  Westecke, Sperrflächenmarkierung vor den Vorziehungen. Gehsteigbelag an den Vorziehungen ist Betonpflaster,
  im Modell einheitlich.

Korrekturen an `street` waren nicht nötig.

## 6. Bäume

- Form: `lib/trees.py`. Krone aus Füllkörpern und rund 60 verformten Laubballen auf einer Hüllform, weich
  schattiert, Laubmaterial mit Löchern in Weltkoordinaten. Fünf rundliche und drei säulenförmige Vorlagen, jeder
  Baum ist eine skalierte und gedrehte Instanz. Stamm mit Verjüngung und drei bis fünf Hauptästen.
- Säulensorten (Fastigiata, Columnare, Säulen...) werden nur schmal gebaut, solange die Krone höchstens 45 % der
  Höhe misst; alte Säulenhainbuchen gehen in die Breite und werden rundlich.
- Alle 14 Katasterbäume im Umkreis von 60 m gegen Street View 05/2024 und Orthofoto geprüft, Ergebnis in
  `trees_override`:

| Position lokal | Kataster | Befund | Korrektur |
|---|---|---|---|
| 8,5 / -3,8 | Säulenhainbuche, 13 m, Krone 8 m | breite dichte Krone bis über das 3. OG | 13,5 m, Krone 9,5 m, rundlich |
| -4,0 / 24,3 | Jungbaum wird gepflanzt | Baumscheibe ohne Baum | entfernt |
| -16,4 / -15,0 | 8 m, Krone 8 m | reicht bis zum Hauptgesims von Wimmergasse 15 | 13 m, Krone 9 m |
| -36,7 / -14,9 | 8 m, Krone 8 m | großer Baum | 12 m, Krone 8 m |
| -35,9 / -3,7 | Schlanke Säulenhainbuche, 8 m, Krone 2,5 m | Krone breiter | 9 m, Krone 4,5 m |
| 33,5 / -15,0 | 8 m, Krone 5 m | bis 4. Geschoss | 13 m, Krone 8 m |
| 47,7 / -3,7 | 8 m, Krone 5 m | verdeckt Stolberggasse 32 bis zum 3. OG | 13 m, Krone 9 m |
| 47,4 / -15,0 | 8 m, Krone 5 m | groß | 12 m, Krone 8 m |
| 8,4 / -14,9 | 4 m, Krone 2,5 m | Jungbaum, lichte Krone | 6,5 m, Krone 3 m |
| -16,5 / -3,9, -3,5 / -38,0, -4,8 / 55,0, -60,1 / -4,0, -2,8 / -60,9 | Jungbäume 4 m | im Orthofoto klein, passt | unverändert |

## 7. Bekannte Restabweichungen

- Dachmodell Stand 2016: Dachausbauten und Aufstockungen seither fehlen, sofern das Baukörpermodell sie nicht als
  eigene Höhenstufe führt. Gauben sind generalisiert, Kamine und Dachfenster fehlen.
- Dachfarbe: das Orthofoto ist dunstig, die Trennung Ziegel gegen dunkles Blech ist bei verschatteten Dächern
  unsicher; Eternit zählt als Blech.
- Stolberggasse 32: Achsenzahl geschätzt. Stolberggasse 30: Farbe offen. Stolberggasse 40: Lamellen fehlen.
- Wimmergasse 17: Balkonstapel vereinfacht (gleiche Achsen in allen Geschossen, in echt leicht versetzt).
- Kamera `stolberggasse` steht 2,5 m neben dem Baum 33,5 / -15,0; dessen Stamm steht jetzt in echter Stärke im
  Bild. Empfehlung: Kamera um etwa 2 m Richtung Fahrbahnmitte versetzen.
- Kamera `ausblick_terrasse`: die Google-Referenz zeigt dort noch das alte Dach des Objekts, der Vergleich ist
  nur für `drohne` aussagekräftig.
- Poller, Schilder und Pflasterwechsel an den Gehsteigvorziehungen fehlen.
