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
| Stolberggasse 34 | 547117 | 6 Geschosse, versetzte Lochblechbalkone und Eingang links stimmten. Falsch war das dunkle Erdgeschoss: in echt taupe mit dunklem Band nur unter dem 1. OG. Braunes Garagentor in Fassadenmitte ergänzt. Dach: zuerst Flachdach mit Rücksprung aus dem Baukörpermodell, seit dem Abgleich mit der Schrägansicht (Abschnitt 8) schwarzes Mansarddach mit Gauben und Brandwand | korrigiert |
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
(009415, war lachsfarben, in Street View weiß: jetzt als Pflichthaus `ramperstorffer_17` in Weiß modelliert, siehe Abschnitt 9).

## 5. Gehsteige und Parkstreifen

Draufsicht Modell (Gehsteig, Parkstreifen, Fahrbahn, Bordsteinlinien) über Orthofoto 2024, Zoom 21 (rund 5 cm
je Pixel), für die Kreuzung, die Wimmergasse vor dem Haus und die Stolberggasse bis Nr. 32:

- Bordsteinkanten, Gehsteigbreiten und Hauskanten liegen innerhalb von etwa 0,3 m auf dem Orthofoto. Keine
  Abweichung über 0,5 m gefunden.
- Die vier Gehsteigvorziehungen an der Kreuzung sind in den Wiener Daten enthalten und stimmen in Form und Lage.
- Parkordnung (Nachprüfung 15.11.2026 mit `immoviz.py strasse`, Prüfbild `renders/check/strasse_abgleich.jpg`):
  Wimmergasse Ostseite (vor dem Haus und südlich der Kreuzung) Schrägparker mit markierten Linien, rund 55 Grad,
  das bordsteinseitige Ende zeigt nach Süden; Wimmergasse Westseite längs; Stolberggasse beidseitig senkrecht
  (90 Grad), östlich und westlich der Kreuzung. Die frühere Ableitung aus der Streifenbreite traf das nicht
  (Stolberggasse wurde längs bzw. schräg gestellt, Wimmergasse in der falschen Schrägrichtung). Jetzt als Regeln in
  `street.parking` eingetragen, die Autos stehen auf den Stellplätzen des Prüfbilds.
- Gehsteigbreite im Modell vor dem Haus (Fassade bis Bordstein): Wimmergasse 1,96 bis 2,02 m, Stolberggasse 1,96
  bis 2,00 m. Vor dem Haus: Wimmergasse 7 Schrägplätze und eine Baumscheibe ohne Baum, Stolberggasse 4 Plätze
  senkrecht und eine Baumscheibe mit Baum.
- Baumscheiben liegen als Aussparungen in den Parkstreifen an den richtigen Stellen.
- Nicht modelliert (Street View): rot-weiße Poller an den Vorziehungen, Verkehrszeichen, Fahrradbügel an der
  Westecke, Sperrflächenmarkierung vor den Vorziehungen. Gehsteigbelag an den Vorziehungen ist Betonpflaster,
  im Modell einheitlich.

Korrekturen an den Flächen waren nicht nötig; ergänzt wurde die Parkordnung (`street.parking`).

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
  eigene Höhenstufe führt. Gauben sind generalisiert; Kamine, Dachfenster und zusätzliche Gauben gibt es nur dort,
  wo `roofs_override` sie nennt (Abschnitt 8).
- Dachfarbe: das Orthofoto ist dunstig, die Trennung Ziegel gegen dunkles Blech ist bei verschatteten Dächern
  unsicher; Eternit zählt als Blech.
- Stolberggasse 32: Achsenzahl geschätzt. Stolberggasse 40: Lamellen fehlen.
- Wimmergasse 17: Balkonstapel vereinfacht (gleiche Achsen in allen Geschossen, in echt leicht versetzt).
- Kamera `stolberggasse` steht 2,5 m neben dem Baum 33,5 / -15,0; dessen Stamm steht jetzt in echter Stärke im
  Bild. Empfehlung: Kamera um etwa 2 m Richtung Fahrbahnmitte versetzen.
- Kamera `ausblick_terrasse`: die Google-Referenz zeigt dort noch das alte Dach des Objekts, der Vergleich ist
  nur für `drohne` aussagekräftig.
- Poller, Schilder und Pflasterwechsel an den Gehsteigvorziehungen fehlen.

## 8. Abgleich Schrägansicht (Referenz Apple Maps, nur intern)

Der Kunde hat eine 3D-Schrägansicht von Südwesten auf die Ecke geschickt (`renders/streetview/referenz_apple/`,
nicht im Repo). Sie wird nur angesehen: nichts daraus ist Textur oder Geometrie im Modell, sie kommt in kein
Vermarktungsbild. Maße bleiben aus den Daten der Stadt Wien. Verglichen wurde mit einer temporären Kamera aus
derselben Richtung (Standpunkt lokal -125 / -135 / 113 m, Blick auf 12 / 14 / 20 m, 75 mm; nur im Scratchpad) und mit
der Kamera `drohne`. Die Referenz zeigt den Bestand: das Objekt hat dort noch das alte braune Ziegeldach, im Modell
steht der geplante Dachausbau.

Neu dafür: `roofs_override` am Ende von `project.yaml` (Deckung, Mansarde, Gauben, Dachfenster, Kamine je BEZUG,
alles parametrisch, Code in `lib/roofs.py`), neue Dachmaterialien in `lib/materials.py` und eine Ziegelmischung für
alle übrigen Dächer (rot, orange, braun wechselt je Gebäude statt eines einheitlichen Tons).

| Haus | BEZUG | Befund in der Schrägansicht | Korrektur | offen |
|---|---|---|---|---|
| Stolberggasse 34 | 547117 | weißer Neubau, dunkle Balkone, darüber schwarzes Mansarddach über zwei Geschosse mit zwei Reihen Gauben und Dachfenstern, helle Brandwand mit Kamin zum Objekt. Im Modell standen Stufenvolumen mit Flachdach | Mansarddach 20,69 bis 26,69 m, 68 Grad, Schiefer dunkel, je Seite 2 x 5 Gauben und 2 x 5 Dachfenster, Flachdach Blech dunkel, Brandwände an beiden Enden, zwei Kamine an der Brandwand zum Objekt | Gauben in echt unterschiedlich breit (oben drei große), im Modell gleich groß. Hofseite nicht einsehbar, gleich wie Straßenseite angenommen |
| Stolberggasse 32 | 009425 | cremegelbe Gründerzeitfassade, leuchtend oranges Ziegeldach | Dach Ziegel orange, 3 Kamine; Fassade stimmte | Achsenzahl weiter geschätzt |
| Ramperstorffergasse 17 (Ecke) | 009415 | weiße Fassade, rotes Ziegeldach mit Gauben | Dach Ziegel rot, 4 Gauben zur Stolberggasse, 3 Kamine; Fassade neu in Weiß (war lachsfarbener Baukörper) | Zahl der Gauben geschätzt |
| Wimmergasse 22 | 009428 | helle Fassade, hellgraues Blechdach mit Dachflächenfenstern | Dach Blech hell, 2 x 5 Dachfenster zur Straße | Fassade wirkt im Luftbild heller als das Gelb aus Street View; Street View gilt |
| Wimmergasse 24 | 009429 | braunes Ziegeldach | Dach Ziegel braun, 2 Kamine | |
| Wimmergasse 26 | 009430 | weiße Fassade, dunkles Schieferdach mit Gauben | Dach Schiefer dunkel, 4 Gauben und 4 Dachfenster zur Straße; Fassade neu in Weiß | |
| Wimmergasse 28, 30 | 009431, 009432 | braune Ziegeldächer | Dach Ziegel braun, je 2 Kamine | |
| Wimmergasse 17 (gegenüber, Ecke) | 547116 | grauer Neubau mit Balkonen, graues Blechdach mit Dachfenstern und Gauben | Dachschräge und Flachdach Blech grau statt schwarz, 6 Dachfenster je Front | Dachform bleibt die Annahme aus `neighbour_facades` (kein Dachmodell für den Neubau), Gauben fehlen |
| Wimmergasse 19 | 009481 | rotes Ziegeldach | Dach Ziegel rot, 2 Kamine | |
| Stolberggasse 40 (Bürohaus) | 009458 | dunkelgrauer Bau links unten | Dach Blech dunkel | Fassade im Luftbild dunkler als die helle Metallfarbe aus Street View; Lamellen fehlen |
| Wimmergasse 18 (gegenüber Stolberggasse) | 009453 | weiße Fassade, rotbraunes Ziegeldach mit Gauben | Dach Ziegel rot gealtert, 2 Gauben zur Wimmergasse, 2 Kamine | |
| Wimmergasse 16 | 009452 | Gründerzeit mit Stuck, hellgraues Blechdach mit Dachfenstern | Dach Blech hell, 3 Dachfenster je Seite; Fassade neu (Abschnitt 9) | |
| Wimmergasse 15 (schräg gegenüber) | 009479 | rotes Ziegeldach, mehrere Kamine, Brandwand | Dach Ziegel rot, 4 Kamine, 2 Dachfenster | graue Blechgaube auf der Hofseite fehlt |
| Hofgebäude hinter dem Objekt | 009426 | weißes Haus mit rotem Walmdach und Türmchen | Dach Ziegel rot, Fassade weiß (`neighbours`), 2 Kamine | Türmchen nicht modelliert |
| Höfe | | viel Grün hinter dem Objekt und hinter Stolberggasse 34 | vier Hofbäume in `trees_override` (`add`), Lage aus dem Orthofoto grob, Größe geschätzt | Zahl und Art der Hofbäume nicht erhoben |
| Eckbaum Stolberggasse | | groß, rund, dunkelgrün, Krone bis etwa 4. Geschoss | stimmte bereits (13,5 m, Krone 9,5 m) | Laub im Modell heller als in der Referenz (Lichtstimmung) |
| Parkplätze | | Autos stehen vor dem Objekt quer bzw. schräg zum Randstein | nicht Teil dieses Abgleichs, siehe Straßenabgleich (`immoviz.py strasse`) | |

Dachfarben: die Lichtstimmungen belichten sehr hell, Dächer mit üblichen Farbwerten wurden rosa. Die neuen
Dachmaterialien sind deshalb an den Renderings kalibriert (sehr dunkle Grundfarben). In `dunst_hell` bleiben die
Ziegeldächer trotzdem heller und weniger gesättigt als in der Referenz; das ist die Lichtstimmung, nicht das Material.

## 9. Pflichthäuser: in jede Richtung die ersten 4 bis 5 Häuser

Vorgabe des Kunden (15.11.2026): von der Kreuzung aus müssen in alle vier Straßenrichtungen auf beiden
Straßenseiten jeweils die ersten 4 bis 5 Häuser passen. Die Liste erzeugt `immoviz.py sichtbar <projekt> --pflicht`
(`lib/check.py`, `pflicht_haeuser`): Mittellinie der Straße aus den Fassadenfluchten des Objekts, quer dazu der
erste Baukörper, je BEZUG einmal. Adresse und Geschosszahl aus der Gebäudeinformation der Stadt Wien. Ergebnis:
38 Einträge, 33 verschiedene Häuser (Eckhäuser zählen in zwei Richtungen). 13 hatten schon eine Fassade, 20 sind neu
(33 neue Einträge in `neighbour_facades` samt zweiter Front der Eckhäuser, 20 neue frontale Ansichten in
`streetview_checks`). `ohne_fassade` ist leer.

Spalten: Fassade = eigener Eintrag in `neighbour_facades`; SV = Front an unserer Straße frontal gegen Street View
geprüft (Geschosse, Achsen grob, Erdgeschoss, Farbe); Dach = Deckung gegen die Schrägansicht geprüft (sonst nur
Dachmodell und Farbklasse aus dem Orthofoto).

| Richtung, Seite | Nr. | Haus | BEZUG | Traufe | Fassade | SV | Dach | offen |
|---|---|---|---|---|---|---|---|---|
| Wimmergasse Südost, Hausseite | 1 | Wimmergasse 18 | 009453 | 17,3 m | ja | ja | ja | |
| | 2 | Wimmergasse 16 | 009452 | 16,3 m | neu | ja | ja | Front Quergasse ungeprüft |
| | 3 | Wimmergasse 14 | 009451 | 16,6 m | neu | ja | nein | Front Quergasse ungeprüft |
| | 4 | Wimmergasse 12 | 009450 | 17,2 m | neu | ja | nein | Front Quergasse ungeprüft |
| | 5 | Wimmergasse 10 | 009390 | 19,3 m | neu | ja | nein | Rundbogenportal fehlt |
| Wimmergasse Südost, gegenüber | 1 | Wimmergasse 17 | 547116 | 16,2 m | ja | ja | ja | Balkonstapel vereinfacht |
| | 2 | Wimmergasse 15 | 009479 | 15,9 m | ja | ja | ja | |
| | 3 | Wimmergasse 13 | 009478 | 16,4 m | neu | ja | nein | Dekorputz im EG als Nutung |
| | 4 | Wimmergasse 11 | 009534 | 15,7 m | neu | ja | nein | |
| | 5 | Wimmergasse 9 | 009533 | 15,8 m | neu | teils (Lkw verdeckt das EG) | nein | Erdgeschoss angenommen |
| Wimmergasse Nordwest, Hausseite | 1 | Wimmergasse 22 | 009428 | 16,7 m | ja | ja | ja | |
| | 2 | Wimmergasse 24 | 009429 | 16,6 m | ja | ja | ja | |
| | 3 | Wimmergasse 26 | 009430 | 16,6 m | neu | ja | ja | |
| | 4 | Wimmergasse 28 | 009431 | 16,8 m | neu | ja | ja | |
| | 5 | Wimmergasse 30 | 009432 | 16,8 m | neu | ja | ja (am Bildrand) | |
| Wimmergasse Nordwest, gegenüber | 1 | Wimmergasse 17 | 547116 | 16,2 m | ja | ja | ja | |
| | 2 | Wimmergasse 19 | 009481 | 16,0 m | ja | ja | ja | |
| | 3 | Wimmergasse 21 (Neubau) | 547115 | 16,0 m | ja | nur schräg | nein | frontale Ansicht fehlt |
| | 4 | Wimmergasse 23 | 009483 | 16,1 m | ja | nur schräg | nein | frontale Ansicht fehlt |
| | 5 | Wimmergasse 25 | 009484 | 16,0 m | neu | ja | nein | |
| Stolberggasse Nordost, Hausseite | 1 | Stolberggasse 34 | 547117 | 20,7 m | ja | ja | ja | Gauben vereinheitlicht |
| | 2 | Stolberggasse 32 | 009425 | 21,4 m | ja | ja | ja | Achsen geschätzt |
| | 3 | Ramperstorffergasse 17 | 009415 | 20,3 m | neu | ja | ja | Front Ramperstorffergasse ungeprüft |
| | 4 | Ramperstorffergasse 18 | 009395 | 22,7 m | neu | ja | nein | Front Ramperstorffergasse ungeprüft |
| | 5 | Gewerbebau (Z78185) | Z78185 | 22,6 m | neu | ja | nein | Fensterbänder vereinfacht, Staffelgeschoss nur als Volumen |
| Stolberggasse Nordost, gegenüber | 1 | Wimmergasse 18 | 009453 | 17,3 m | ja | ja | ja | |
| | 2 | Stolberggasse 35 | 009446 | 18,1 m | ja | nur schräg | nein | frontale Ansicht fehlt |
| | 3 | Wohnbau (212505) | 212505 | 20,0 m | ja | nur schräg | nein | frontale Ansicht fehlt |
| | 4 | Ramperstorffergasse 16 | 009394 | 21,2 m | neu | ja | nein | Front Ramperstorffergasse ungeprüft |
| | 5 | Stolberggasse 27 | 009407 | 20,9 m | neu | teils (Bäume) | nein | Achsen geschätzt |
| Stolberggasse Südwest, Hausseite | 1 | Wimmergasse 17 / Stolberggasse 38 | 547116 | 16,2 m | ja | ja | ja | |
| | 2 | Stolberggasse 40 (Spengergasse 20) | 009458 | 18,9 m | ja | ja | ja | Lamellen fehlen |
| | 3 | Wohnanlage (212506) | 212506 | 23,0 m | neu | ja | nein | Erker und Rundungen der Fassade fehlen, Achsen grob |
| Stolberggasse Südwest, gegenüber | 1 | Wimmergasse 18 | 009453 | 17,3 m | ja | ja | ja | |
| | 2 | Wimmergasse 15 | 009479 | 15,9 m | ja | ja | ja | |
| | 3 | Neubau (B96945) | B96945 | 15,9 m | neu | ja | nein | Rücksprung der Fassadenmitte und gelbe Fensterrahmen fehlen |
| | 4 | Spengergasse 16 | 009457 | 16,7 m | neu | ja | nein | senkrechte Lisenen fehlen |
| | 5 | Spengergasse 23 | 009503 | 20,8 m | neu | ja | nein | Rundbogenfenster im obersten Geschoss als Rechteck |

Zusammenfassung: Südost 10 Einträge, Nordwest 10, Nordost 10, Südwest 8 (auf der Hausseite stehen bis 160 m nur
drei Häuser). Alle 33 Häuser haben eine eigene Fassade mit Traufhöhe aus dem Baukörpermodell und Geschosszahl aus
der Gebäudeinformation. 29 sind frontal gegen Street View geprüft (zwei davon nur teilweise einsehbar), 4 ältere
Einträge nur über die schrägen Straßenblicke. Die Dachdeckung ist für die 14 Häuser geprüft, die in der Schrägansicht
erkennbar sind; die übrigen 19 haben Dachform aus dem Dachmodell und eine Farbklasse aus dem Orthofoto, drei
Neubauten (Z78185, 212506, B96945) nur Flachdach aus dem Baukörpermodell. Fenstermaße und Geschosshöhen der neuen
Fassaden sind Regelwerte, nicht vermessen; die zweiten Fronten der Eckhäuser übernehmen die Gliederung der Hauptfront.

## 10. Fernsicht Drohne und Terrasse

Vorgabe des Kunden (15.11.2026): in der Drohnenansicht gehört die weitere Distanz dazu, also markante Gebäude und
Dächer. `immoviz.py fernsicht <projekt>` (`lib/fern.py`) lädt nach `data/fern.json`: 3665 Baukörperteile über 33 m
Höhe im Umkreis von 7,5 km (674 Gebäude), Namen aus den Layern Sehenswürdigkeiten und Religion (nächstgelegener
Eintrag bis 90 m), Strukturdominanten (`STRUKDOMINANTEOGD`: 152 Flächen mit Typ und Ordnung, ohne Namen) und 4345
Höhenfestpunkte.

Im Modell:
- Echte Dächer aus dem Dachmodell reichen wie bisher bis 410 m. Der Radius wurde nicht erhöht: Baukörper,
  Straßenflächen und Bäume hängen am selben Radius, eine Verdoppelung vervierfacht Datenmenge und Bauzeit.
- Fernzone 420 bis 2400 m: statt einheitlicher Blöcke mit Walmstumpf jetzt Blockränder aus vier Trakten um einen
  Hof, je Trakt zwei bis drei Häuser mit eigener Traufhöhe (rund 13 bis 25 m) und Satteldach; Ziegel rot, orange,
  braun und Blech hell, grau, dunkel gemischt. Die Blöcke stehen auf einem groben Gelände aus den Höhenfestpunkten
  (Anstieg zum Wienerberg, Gefälle zum Wiental), am Radius an das genaue Gelände angeschlossen.
- Markante Gebäude: alle hohen Baukörperteile als Volumen an ihrer echten Lage und mit echter Oberkante.
- Hügelkette: Kulisse aus den Höhenfestpunkten (größter Höhenwinkel je 3 Grad, geglättet). Für `drohne` liegt der
  Wienerwald von Nordwest bis Nord im Bild (Kompass 285 bis 354 Grad, rund 7 bis 10 km, bis etwa 270 m über dem
  Objekt, Kahlenberg in echt rund 300 m). Grob, weil Festpunkte an Straßen liegen und nicht auf den Gipfeln.
- Sichtweite der Kameras von 2 km auf 30 km erhöht, sonst schneidet Blender alles dahinter ab.

Markante Gebäude im Sichtkegel (Richtung als Kompass, Höhe über Gelände laut Baukörpermodell). Namen in Klammern
sind nach Lage und Höhe zugeordnet, nicht aus den Daten:

| Kamera | Gebäude | BEZUG | Richtung | Entfernung | Höhe | im Modell |
|---|---|---|---|---|---|---|
| drohne (Blick Nord, 3 Grad) | (Stephansdom, Südturm; Datenname des nächsten Eintrags "Curhauskapelle") | 169932 | 23 Grad | 2,8 km | 136 m | ja |
| drohne | Donauturm | 073723 | 32 Grad, rechter Bildrand | 7,3 km | 250 m | ja |
| drohne | (Millennium Tower) | 063994 | 19 Grad | 6,5 km | 174 m | ja |
| drohne | Haus des Meeres (Flakturm Esterházypark) | 111431 | 344 Grad | 1,5 km | 56 m | ja |
| drohne | AKH | 139716 | 349 Grad | 4,0 km | 89 m | ja |
| drohne | (Schlot Fernwärme Spittelau) | 142265 | 1 Grad | 5,5 km | 126 m | ja |
| drohne | Rathaus | 100825 | 0 Grad | 2,9 km | 68 m | ja, Turmspitze fehlt im Baukörpermodell |
| drohne | Kunsthistorisches und Naturhistorisches Museum | 001065, 093881 | 6 und 0 Grad | 2,1 und 2,3 km | 59 m | ja |
| drohne | Karlskirche | 160756 | 34 Grad, knapp außerhalb rechts | 1,8 km | 64 m | ja |
| drohne | Hochhaus ohne Namen in den Daten | Z50679 | 26 Grad | 5,4 km | 100 m | ja |
| drohne | Wienerwald (Kahlenberg, Hermannskogel) | | 334 bis 354 Grad | rund 10 km | bis 270 m über Objekt | ja, als Kulisse |
| ausblick_terrasse (Blick Südsüdwest, 208 Grad) | (Hochhaus am Matzleinsdorfer Platz) | 009793 | 199 Grad | 0,5 km | 67 m | ja |
| ausblick_terrasse | Hochhaus ohne Namen in den Daten | 224668 | 198 Grad | 1,0 km | 72 m | ja |
| ausblick_terrasse | (Vienna Twin Tower, Wienerberg) | 166994 | 207 Grad | 2,2 km | 138 m | ja |
| ausblick_terrasse | (Hochhäuser Wienerberg City) | 219843, 219845, 219842, 219846 | 209 bis 211 Grad | 2,1 km | 59 bis 106 m | ja |
| ausblick_terrasse | Hochhaus ohne Namen in den Daten | 201494 | 206 Grad | 2,0 km | 86 m | ja |
| ausblick_terrasse | Turm ohne Namen in den Daten | 018242 | 192 Grad | 1,8 km | 56 m | ja |
| ausblick_terrasse | Pfarrkirche Maria vom Berge Karmel | 020296 | 182 Grad | 2,2 km | 44 m | ja |

Offen:
- Die hohen Gebäude sind Volumen ohne Fassade, Turmhelme und Kuppeln enden an der Oberkante des Baukörpermodells
  (Stephansdom, Karlskirche, Rathaus wirken daher kantig). Für ein Hauptmotiv mit Fernsicht einzeln nacharbeiten.
- Kamera `drohne`: der Horizont liegt am oberen Bildrand, die Silhouetten sind dort nur wenige Pixel hoch. Wer die
  Fernsicht zeigen will, muss die Kamera flacher stellen oder das Ziel höher legen (Entscheidung Bildausschnitt).
- Kein Dunst mit der Entfernung im Rendering; die Kulisse ist dafür hell eingefärbt.
- Zuordnung der Namen in Klammern am Bild gegenprüfen (Google 3D Tiles oder Foto vom Dach).
- Zwischen 2,4 km und den Hügeln steht außer den hohen Gebäuden nichts; bei flachem Blick fällt das kaum auf, bei
  steilem Blick aus großer Höhe schon.

