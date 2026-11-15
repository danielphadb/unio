# Umgebungsabgleich NOMA, Schlachthausgasse 13 / Würtzlerstraße 10

Stand 15.11.2026. Ablauf wie bei Wimmergasse 20 (KONZEPT.md, Abschnitt 7). Die Hauptmotive dieses Objekts liegen im
Hof und auf dem Dach, nicht auf der Straße. Geprüft wurde deshalb vor allem, was die Hof-, Garten- und Dachkameras sehen.

## 1. Datenquellen

| Thema | Quelle | Verwendung |
|---|---|---|
| Baukörper, Traufhöhen, Grundstücksgrenzen | Stadt Wien, Baukörpermodell `FMZKBKMOGD` | im Modell; Bestand auf dem Grundstück (BEZUG 005373, 504165) ausgeblendet |
| Dachflächen | Dachmodell LOD2 (MA 41), 2523 Flächen im Radius 420 m | im Modell (`data/roofs.json`) |
| Gehsteige, Parkstreifen | `FMZKVERKEHR1/2OGD` | im Modell |
| Straßenbäume | Baumkataster `BAUMKATOGD` | im Modell |
| Hof- und Gartenbäume, Rasenflächen, Dachgarten des Nachbarn | Orthofoto 2024 (abgelesen) | von Hand in `trees_override` und `neubau.flaechen` (Gruppe `nb_umgebung`) |
| Fernsicht | `immoviz.py fernsicht` (`data/fern.json`) | im Modell |
| Street View | nicht abgerufen | Hoffassaden sind von der Straße nicht einsehbar |

## 2. Straße (`immoviz.py strasse`)

Prüfbild `renders/check/strasse_abgleich.jpg`: Bordstein und Gehsteig (2,70 m vor dem Haus) decken sich mit dem
Orthofoto, Längsparker auf beiden Seiten der Schlachthausgasse (Automatik, keine Regel nötig). Keine Baumscheibe vor
dem Haus. Für die gewählten Motive ohne Bedeutung, aber Pflichtschritt erledigt.

## 3. Direkt sichtbare Häuser (`immoviz.py sichtbar`)

| Kamera | BEZUG | Bildanteil | modelliert als |
|---|---|---|---|
| garten_top3 | 005379 | 13,6 % | `hof_ost_005379` (Hoffassade, Annahme) |
| garten_top3 | 005382 | 4,8 % | Baukörper, verdeckt großteils durch Würtzlerstr. 10 |
| garten_top3, garten_top4 | 005380 | 3,4 bis 3,8 % | `hof_ost_005380` |
| garten_top4, terrasse_top3/4 | 005378 | 2,7 bis 5,9 % | `hof_ost_005378` |
| garten_top3 | 005387 | 1,7 % | `hof_sued_005387` |
| terrasse_top3_hof | 005363 | 28,4 % | `hof_west_005363`, `hof_west_005363_b` (Annahme moderner Block) |
| terrasse_top3 | 005362 | 3,2 % | Baukörper plus Dachgarten (Hofbau 4,8 m mit Rasen und Bäumen laut Orthofoto) |
| dachterrasse_stadt | 103626, 004968, 004970 | 1,2 bis 4,9 % | nur Baukörper und LOD2-Dach (Blick von 27 m Höhe auf die Dächer) |
| dachterrasse_hof | 005382, 005387 | 1,4 bis 1,7 % | wie oben |

Hoffassaden sind in Street View nicht zu sehen. Geschosszahl kommt aus der Traufhöhe, Fensterraster und Farbe sind
Annahmen. Vor der Freigabe für den Vertrieb: Schrägluftbild ansehen oder ein Foto aus dem Hof besorgen.

**Pflichthäuser an der Straße** (`sichtbar --pflicht`): 12 Häuser in der Schlachthausgasse ohne Fassadeneintrag
(004966 bis 004986, 005344, 005362, 005378, 211709, 211711, 520712). Für die Hof- und Dachmotive nicht relevant,
für ein späteres Straßenmotiv offen.

## 4. Fernsicht (`immoviz.py fernsicht`)

- dachterrasse_stadt (Blick WNW über die Schlachthausgasse): Stephansdom (im Datensatz "Curhauskapelle", 136 m,
  3,0 km, Richtung 298 Grad, Bildmitte), Herz-Jesu-Kirche Erdberg (842 m, links), Hochhäuser 004017, 501526, 004590
  (1,4 bis 2,2 km, Mitte).
- dachterrasse_hof (Blick SO über den Hof): Hochhäuser Erdberg/Neu Marx B76421 (111 m, 450 m) und Z22087 (97 m),
  Z01437/Z01441 (Gasometer-Umfeld, 1,2 km, rechts), Rumänisch-orthodoxe Kirche (3,0 km).

## 5. Befund

- Grundstück: Straßenfront 18,48 m aus OGD deckt sich mit F 18,48 im Einreichplan; die Gartengrenze im EG-Plan
  (3,49 m vor dem Hoftrakt) trifft die OGD-Grenze auf 0,1 m.
- Der "andere Garten" besteht aus zwei Teilen: Dachgarten auf dem 4,8 m hohen Hofbau von Schlachthausgasse 11
  (gegenüber Top 3) und ebener Garten im Hof dahinter (gegenüber Top 4). Beides im Orthofoto eindeutig.
- Offen: Höhe des Nachbardachgartens (Baukörpermodell OK 4,64 m über +-0,00) und Baumhöhen dort sind geschätzt.

## 6. Runde 2: Häuser rundherum (Kundenwunsch "die Häuser rundherum perfekt")

Neue Hof- und Gartenkameras (`garten_top3_weit`, `garten_top4_weit`, `terrasse_top3_eck`, `terrasse_top4_eck`) und die
Kontrollkamera `hof_vorlage` (Standpunkt der Vorlage `SHG13_Hof_fin`, Balkon Würtzlerstraße 10). Direkt sichtbar laut
`immoviz.py sichtbar` (Bildanteil, kürzester Abstand):

| Kamera | BEZUG | Anteil | Abstand | modelliert als |
|---|---|---|---|---|
| hof_vorlage | 005379 | 13,5 % | 25 m | `hof_ost_005379` |
| hof_vorlage | 005362 | 13,1 % | 43 m | `hof_nord_005362` (neu, Fassadenkarte) |
| hof_vorlage | 005378, 005363 | 3,4 / 2,9 % | 45 / 59 m | `hof_ost_005378`, `hof_west_005363` |
| garten_top3_weit | 005378, 005379 | 8,3 / 7,6 % | 27 m | wie oben |
| garten_top3_weit | 005387, 005382, 005380 | 4,4 / 2,7 / 1,8 % | 40 bis 57 m | `hof_sued_005387`, 005382 nur Baukörper, `hof_ost_005380` |
| garten_top4_weit | 005387 | 10,0 % | 26 m | `hof_sued_005387` |
| garten_top4_weit | 005379, 005380, 005382 | 5,8 / 2,1 / 1,3 % | 37 bis 47 m | wie oben |
| terrasse_top3_eck | 005363, 005362 | 8,7 / 5,5 % | 38 / 19 m | `hof_west_005363`, `hof_nord_005362` |
| terrasse_top4_eck | 005363 | 4,3 % | 38 m | `hof_west_005363` |

Quellen: die vom Kunden bereitgestellten Projektvisualisierungen (`SHG13_Hof_fin`, `_Hof_fin-2`, `_Hof_fin-3`, `_Hof_fin-4`,
`SHG13_Exterior2_fin`) zeigen den Hof samt Nachbarn und sind die einzige Quelle für Hoffassaden. Orthofoto 2024 und LOD2
für Lage, Dachdeckung und Höhen. Google Street View nur intern (gitignored unter `renders/streetview/`): von der
Würtzlerstraße aus ist durch die Baulücke Nr. 10 nur die Feuermauer von Nr. 8 zu sehen, die Hoffassaden nicht; Street View
im Hof gibt es nicht (Abfrage ZERO_RESULTS). Google 3D Tiles nicht verwendet.

| Haus | Quelle | Befund | Korrektur in project.yaml |
|---|---|---|---|
| 005379, Hoftrakt Schlachthausgasse 15 (Ostseite Hof, gegenüber Top 3/4) | Vorlage `Hof_fin-4` (oben rechts hinter dem Pavillon), LOD2 | Putz lachsrot, Fenster weiß gerahmt, regelmäßiges Raster | Farbe beige `#D9CFB8` auf `#D4927A`, Rahmen weiß (`frame: stuck`) |
| 005380, Hoftrakt Würtzlerstraße (Ostseite Hof, Süd) | Vorlage `Hof_fin` (rechter Bildrand), Orthofoto (Ziegeldach) | weißer Gründerzeit-Hoftrakt, weiße Fensterrahmen, Ziegeldach | Farbe beige `#D3C8AF` auf weiß `#ECE8DF`, Rahmen weiß |
| 005378, Schlachthausgasse 15 neben SHG 13 | Vorlage `Hof_fin-2` und `Hof_fin-3` (rechter Bildrand) | weiß, Fenster mit Faschen und Verdachung, Ziegeldach | Farbe auf `#EEEAE2`, Fenster mit `fasche_verdachung`, Rahmen weiß |
| 005362, Schlachthausgasse 11, Hoffassade über dem Hofbau mit Dachgarten | Vorlagen `Hof_fin`, `Hof_fin-2` (links von SHG 13) | lachsrosa Gründerzeithaus, weiß gerahmte Fenster, Mansarde mit Gauben (Dach aus LOD2) | neu `hof_nord_005362`: Fassadenkarte 5 cm vor dem Baukörper (eigener Schlüssel `005362_hof`, damit Hofbau und hohe Teile von 005362 nicht abgeschnitten werden), 11 Achsen, EG + 5 OG |
| Nachbargarten im Hof (gegenüber Top 4) | Orthofoto 2024, Vorlage `Hof_fin` | Rasen bis in den Südteil unter den Bäumen, langer niedriger Betonkörper (Lüftung oder Hochbeet) am Zaun | Rasen im Südteil erweitert, Betonkörper 15 x 2,6 m, Höhe 0,6 m [ANN] |
| Gartenstreifen Süd (eigenes Grundstück) | [EIN S. 8] | reicht unter dem Straßenhaus bis a = -11,7 (Fenster APT. 01) | eigene Gruppe `nb_garten`, verlängert |
| 005363, Wohnblock Erdbergstraße | Vorlage `Hof_fin` (links) | weiß, Fensterbänder mit grauen Feldern, modern | unverändert (passt), graue Felder nur im Prompt |
| 005387, Würtzlerstraße 8 Hofseite | keine Ansicht in den Vorlagen; Street View zeigt nur die Straßenfassade (hell beige) | Annahme bleibt | unverändert, offen |
| 005382, Würtzlerstraße/Ecke | Vorlage `Hof_fin` nicht eindeutig | 1 bis 3 % Bildanteil | nur Baukörper, offen |

Kontrollbild: `renders/noma-shg13_hof_vorlage_spaetsommer_vorschau.png` gegen `SHG13_Hof_fin.jpg`: Reihenfolge und Farben
der Nachbarn (links lachsrosa SHG 11, Mitte SHG 13 mit Balkonstapel, rechts lachsrote und weiße Hoftrakte) stimmen jetzt.
Die Vorlagen zeigen auf den Pavillons noch Glas-Sheddächer; das Modell bleibt beim Einreichplan (Flachdach mit PV).

## 7. Runde 3: Gärten, Bäume und Hofgebäude gegen Luftbild und Google 3D

Kundenhinweis: Gärten, Bäume, Grünstreifen und Hofgebäude stimmen zum Teil nicht. Abgleich am 15.11.2026 mit drei Quellen:
Orthofoto Wien 2024 (OGD, entzerrt, maßgeblich für Lage und Fläche), Google-Luftbild (Static Maps, Zoom 20, Sommer, für
Vegetation; leichte Gebäudeneigung) und Google Photorealistic 3D Tiles (Schrägsichten, für Fassadenfarbe, Geschosse,
Erker und Dachformen). Google nur als interne Referenz: Bilder im Scratchpad, nichts davon im Modell oder im Repo;
Geometrie selbst modelliert. Prüfbild Orthofoto | Modell-Draufsicht | Google: Scratchpad
`noma/r3/google/pruefbild_ortho_modell_google.jpg`, Schrägsichten `noma/r3/g3d/`.

| Bereich | Befund (Quelle) | Vorher im Modell | Korrektur in project.yaml |
|---|---|---|---|
| Nachbargarten Süd, Bäume | Keine Bäume im Südteil, dort Beet/Mulch mit Holzpergola und niedrigem Kasten (Orthofoto 2024 kahl ohne Kronen, Google Sommer) | zwei große Bäume 12 m und 10 m bei -9/-56 und -14,5/-57,5 | beide entfernt; Beetfläche `nb_mulch` x -17,3 bis -4,3 / y -53,7 bis -59,5, Kasten 1,75 x 3,7 m |
| Nachbargarten, Bestandsbaum Südost | Laubbaum, Krone rund 6,5 bis 7 m (Orthofoto kahl, Google belaubt) | 3,2/-53,6, Krone 6 | 2,8/-55,0, Krone 7, Höhe 10 [ANN] |
| Nachbargarten, Baum am Zaun | kleiner Laubbaum östlich des weißen Kastens (Google, Orthofoto) | fehlte | neu 1,0/-40,5, Krone 4, Höhe 6 [ANN] |
| Nachbargarten, Rasen | Rasen x -19,8 bis -4,3 / y -40 bis -53,7, Rasenstreifen am Westrand bis y -59,5 (Orthofoto, Google) | x -17 bis -7 / y -39,8 bis -50,6 und "Rasen unter Bäumen" im Südteil | Rasen neu begrenzt, Südteil Beet, Westrand Rasen mit Hecke (3 Sträucher) |
| Nachbargarten, Spielplatz | dunkle Fallschutzfläche x -19,6 bis -9,75 / y -33,6 bis -39,75 mit Holzspielturm, graue Blechhütte 2,0 x 3,6 m, Sandkiste (Google, Orthofoto) | Pflaster | `nb_fallschutz`, Hütte `nb_huette` 2,15 m [ANN Höhe]; Spielturm nur im Prompt |
| Nachbargarten, weißer Kasten | 3 x 8 m, helles Dach, x -4 bis -1 / y -37,5 bis -45,5; anschließend niedrige Mauer bis y -53,5 (Orthofoto, Google, Vorlage Hof_fin) | ein Betonkörper 2,6 x 15 m, 0,6 m hoch, x -5 bis -2,4 | Kasten 1,35 m `nb_weiss` plus Mauer 0,75 m [ANN Höhen] |
| Dachgarten Schlachthausgasse 11 (+4,66) | großer Laubbaum südlich (Krone 7,5), Zierbaum gelb, Baum Nordwest, Baum Mitte, runde Krone am Ostrand; zwei Lichtkuppeln (Orthofoto, Google) | Bäume teils 2 bis 3 m versetzt, ein Baum auf den Lichtkuppeln, Ostrand ohne Baum | 5 Bäume neu gesetzt (siehe `trees_override`), Rasen unverändert |
| Hof Schlachthausgasse 15 / Würtzlerstraße | Laubbaum Krone rund 6 m bei 25/-62 (Google, Orthofoto) | fehlte | neu, Höhe 9 [ANN] |
| Grünstreifen Süd (Noma) | [EIN S. 8]: Rasen mit 2 % Gefälle, Blumentrog 70 cm ü. FOK, 0,50 m breit entlang der EG-Fassade, je Apartment ein Fenster 1,60 x 1,50 (FPH 0,90), keine Fenstertüren; Zaun mit Sockel. Heute Bestand (Werkstatt), daher nicht im Luftbild prüfbar | fünf Kugelbüsche [ANN], Fenstertüren im Raster 5 m | Kugelbüsche entfernt, Blumentrog ab APT. 02, Fenster statt Türen (Lage APT. 02/05 aus EIN S. 8, weitere im Raster 10,56 [ANN]) |
| 005379 Hoftrakt Schlachthausgasse 15 | weiß, weiß gerahmte Fenster, Ziegeldach, polygonaler Erkerturm mit dunklem Zeltdach bei y -31 bis -38 (Google 3D, Orthofoto: Dach 6 m breit) | lachsrot (Runde 2 nach Vorlage Hof_fin-4, falsch), Erker vom Kartenschnitt entfernt | Farbe `#ECE9E2`; Erkerturm als Körper mit Fensterfront und Zeltdach (Spitze +19,3 [ANN]) |
| 005380 Hoftrakt Würtzlerstraße | weiß, Erkerturm mit Zeltdach bei y -52 bis -58 (Google 3D) | weiß, Erker fehlte | Erkerturm ergänzt (Spitze +18,9 [ANN]) |
| 005362 Hoffassade Schlachthausgasse 11 | kein Gründerzeithaus: 7 Geschosse, glatte Fenster, West- und Ostteil apricot, Mitte weiß mit Balkonstapel und vollen Brüstungen (Google 3D) | durchgehend lachsrosa, 6 Geschosse, weiß gerahmt | drei Karten (apricot / weiß / apricot), 7 Geschosse, Balkone x -18 bis -8 ab 2. OG [ANN Lage +-2 m] |
| 005387 Würtzlerstraße 8 Hofseite | heller, weiß-grau (Google 3D) | beige `#DCD3C0` | `#E6E2DA` |
| 005364 Erdbergstraße (Südwestecke) | moderner Block, hellgrau, Fensterbänder (Google 3D); 1,2 bis 3,1 % in den neuen Kameras | nur Baukörper | neu `hof_west_005364` |
| 005382 Eckhaus Würtzlerstraße | weißer Altbau hinter 005380 (Google 3D); 1,7 bis 4,6 % | nur Baukörper | neu `hof_nord_005382` |

Direkt sichtbar in den Kameras der Runde 3 (`immoviz.py sichtbar`, Bildanteil >= 1 %): top3_aussen_gruendach 005362 7,4 %,
005363 4,3 %; top4_aussen_gruendach 005362 5,8 %, 005363 5,5 %, 005364 1,2 %; pavillons_drohne_sued 005379 9,0 %, 005380 8,1 %,
005378 6,2 %, 005382 4,6 %, 005362 1,5 %; top3_terrasse_hst 005379 21,6 %, 005378 4,6 %; top4_terrasse_hst 005380 14,0 %,
005379 6,6 %; top3_terrasse_garten 005363 7,2 %, 005364 3,1 %; top4_terrasse_garten 005387 3,6 %, 005364 2,8 %; garten_top3_weit
und garten_top4_weit wie in Abschnitt 6 plus 005382 1,7 bis 1,8 %. 005362 ist über den eigenen Schlüssel `005362_hof`
modelliert (das Prüfwerkzeug zeigt deshalb "modelliert: []"). Alle anderen Häuser >= 1 % haben jetzt einen Eintrag.

Offen: Höhen von Kasten, Hütte, Erkerdächern und Bäumen sind geschätzt; Balkonlage an Schlachthausgasse 11 auf rund 2 m;
der Bestand auf dem Noma-Grundstück (Werkstatt) verdeckt im Luftbild den künftigen Grünstreifen.

## 8. Runde 4: nummerierte Nachbarübersicht für den Kunden

Prüfbild `umgebung_nummern.jpg` (Scratchpad, nicht im Repo): Draufsicht des Modells mit Nummern und je Gebäude ein
Modellausschnitt. Der Kunde kann je Nummer markieren, was falsch ist, und liefern, was fehlt.

**Hausnummern korrigiert** (Adressregister Stadt Wien `ADRESSENOGD` je BEZUG, 15.11.2026): Die Abschnitte 3, 6 und 7 und
Kommentare in `project.yaml` benennen einige Nachbarn falsch. Richtig ist: 005378 = Schlachthausgasse 11 / Schnirchgasse 2
(Eckhaus Ost, nicht "Schlachthausgasse 15"), 005379 = Schnirchgasse 4, 005380 = Schnirchgasse 6, 005362 = Schlachthausgasse
15/17 / Erdbergstraße 121 (Westnachbar mit Hofbau und Dachgarten, nicht "Schlachthausgasse 11"), 005387 = Würtzlerstraße 12
(nicht 8), 005382 = Schnirchgasse 8 / Würtzlerstraße 8. Die BEZUG-Schlüssel in `project.yaml` stimmen, nur die Namen in
Kommentaren und Texten waren vertauscht.

**Quellen und Rangfolge:** Einreichplan/Vermessung > Orthofoto 2024 und Dachmodell LOD2 (OGD) > Apple-Maps-3D-Ansichten
des Kunden (`renders/streetview/referenz_apple_kunde/apple_8` bis `12`, gitignored, nur Ansicht) > Projektvisualisierungen
(`08 Visualisierungen`, künstlerisch, zeigen den geplanten Zustand; Apple zeigt noch den Bestand auf dem Noma-Grundstück).
Nichts davon ist im Modell als Textur oder Geometrie übernommen. Visualisierungen: Ext1 = `SHG13_Exterior1_fin` (und
`-2`), Ext2 = `SHG13_Exterior2_fin`, Hof = `SHG13_Hof_fin`, Hof2/3/4 = `SHG13_Hof_fin-2/-3/-4`, DT = `SHG13_TOP23_DT_fin`,
`dt people`, `dg people`, `Dachview`, `Dachterrasse` (Dachbilder sind KI-Montagen mit erfundener Fernsicht, für Nachbarn
nicht verwertbar), Innenbilder TOP07WK/TOP8_WK/TOP23_WK/TOP04_Loft (Fensterblick nur unscharf: weiße Gründerzeitfassaden
mit roten Ziegeldächern gegenüber, keine verwertbaren Details).

| Nr | BEZUG | Adresse (OGD) | Lage | Modell heute | Quellen | Sicherheit | Was fehlt / bitte liefern |
|---|---|---|---|---|---|---|---|
| 1 | 005378 | Schlachthausgasse 11 / Schnirchgasse 2 | Eckhaus Ost, Feuermauer zum Straßenhaus | Hoffassade weiß mit Faschen (`hof_ost_005378`), 21,6 m; Runde 4: Dach flach/Kies statt Blech (Dachterrassen) | LOD2, Apple 9/10/11 (weißer Bau, Flachdach mit Terrassen und Aufbauten), Visualisierung Ext1/Ext2 (Straßenfront gelb mit Stuck und Apotheke, links von Noma), Hof_fin-2/-3 (rechter Rand, weiß) | mittel | Hofansicht mit Geschoßzahl und Fensterachsen, Dachaufbauten; Straßenfassade gelb nicht modelliert (nur für Straßenmotive) |
| 2 | 005379 | Schnirchgasse 4 | Hoftrakt Ost gegenüber Top 3 | weiß, Erkerturm mit Zeltdach; Runde 4: Ziegel rotbraun mit 4 Gauben zum Hof und 3 Kaminen (LOD2 Ziegel) | Apple 10 (achteckiges Zeltdach, rotbraune Ziegel, Gauben), Google 3D (Runde 3), Hof_fin-4 | hoch | Fensterraster und Erkerhöhe aus einem Hoffoto |
| 3 | 005380 | Schnirchgasse 6 | Hoftrakt Ost gegenüber Top 4 | weiß, Erkerturm; Runde 4: Ziegel rotbraun mit 3 Gauben (vorher Ziegel dunkel) | Apple 10 (zweiter Erker mit spitzem Walm, Ziegeldach mit Gauben), Hof_fin (rechter Rand) | mittel | Erkerdach im Modell Zeltdach statt spitzem Walm; Fensterraster |
| 4 | 005382 | Schnirchgasse 8 / Würtzlerstraße 8 | Eckhaus Südost | weiß, Stuckrahmen (`hof_nord_005382`); Runde 4: Ziegel rot, 2 Kamine | Apple 10 (Ecke mit rotem Ziegeldach), LOD2 | mittel | Hoffassade nur geschätzt |
| 5 | 005387 | Würtzlerstraße 12 (vorher fälschlich "Würtzlerstraße 8") | Süd, gegenüber Nachbargarten | hell weiß-grau (`hof_sued_005387`); Runde 4: Dach Blech hell (flach mit Aufbauten) | Apple 9/10 (heller Bau mit Dachaufbauten), Google 3D | mittel | Geschoßzahl und Fenster der Nordfassade |
| 6 | 520711 | ohne Adresse (Nebengebäude im Nachbarhof Süd) | Südende Nachbargarten | Baukörper 3,6 m, flach | LOD2, Apple 10 (niedriger Bau mit rotem Dach an der Südgrenze, unscharf) | niedrig | Dachform und Farbe |
| 7 | 005365 | Erdbergstraße 127 / Würtzlerstraße 14 | Eckhaus Südwest | nur Baukörper und LOD2-Dach (Blech) | LOD2, Apple 9/12 (graue Mansarde); Chatbild des Kunden laut Sichtung: Eckhaus mit terrakotta Fassadenfeldern (nicht als Datei vorhanden, nicht übernommen) | niedrig | Hoffassade, Farbe (terrakotta?) |
| 8 | 005364 | Erdbergstraße 125 | West, Südteil | `hof_west_005364` modern hellgrau | Google 3D (Runde 3), Apple 12 (weißer hoher Block) | mittel | Fensterbänder und Balkone |
| 9 | 005363 | Erdbergstraße 123 | West, gegenüber Terrassen | `hof_west_005363` weiß mit Fensterbändern | Hof_fin (links), Apple 12 (weißer Block mit Balkonstapel) | mittel | Balkonstapel und graue Felder nicht modelliert |
| 10 | 005362 | Schlachthausgasse 15/17 / Erdbergstraße 121 (vorher fälschlich "Schlachthausgasse 11") | Westnachbar mit Hofbau und Dachgarten | drei Karten apricot/weiß/apricot, 7 Geschoße, Balkone; Runde 4: graue Blechmansarde mit 8 Gauben zum Hof | Apple 9/10/11 (lachs/apricot, weißer Mittelteil, graue Mansarde mit Gauben und Terrassen, Dachgarten mit Bäumen und Lichtkuppeln), Ext1 (Straßenfront orange-rot mit weißem Glaserker, rechts von Noma), Hof_fin/-2 | hoch | Straßenfront (orange-rot, Glaserker) nur für Straßenmotive; Balkonlage ±2 m |
| 11 | 004967 | Schlachthausgasse 10 | gegenüber | nur Baukörper und LOD2-Dach | LOD2, Apple 9/10 (Gründerzeit weiß/creme, Ziegeldach) | niedrig | Straßenfassade (nur für Straßen- und Dachmotive relevant) |
| 12 | 004968 | Schlachthausgasse 12 | gegenüber | dto. | LOD2, Apple 9/10 | niedrig | dto. |
| 13 | 004966 | Schlachthausgasse 8 | gegenüber | dto. | LOD2, Apple 9/10 | niedrig | dto. |
| 14 | 004969 | Erdbergstraße 119 / Schlachthausgasse 14 | gegenüber Ecke | dto. | LOD2, Apple 9 | niedrig | dto. |
| 15 | 172417 | Schlachthausgasse 3 / Schnirchgasse 1-7 | Gemeindebau-Riegel jenseits der Schnirchgasse | weißer Baukörper 32 m, LOD2-Dach hell | LOD2, Apple 9/10 (9 bis 10 Geschoße, rote Balkonbänder, Baumgruppe davor) | mittel | rote Balkonbänder und Fensterraster nicht modelliert |
| 16 | 229182 | Schnirchgasse 10 / Würtzlerstraße 1 (Rundbau) | Südost | runder Baukörper aus OGD/LOD2 | LOD2, Apple 8/9 (Bürorundturm mit Ringgeschoßen) | mittel | Ringgeschoße als Fassade |
| 17 | 504164 | Würtzlerstraße 18 (Wohnanlage, gegenüber) | Süd jenseits der Würtzlerstraße | nur Baukörper | LOD2 | niedrig | Fassaden (nur für Dachmotive relevant) |

Apple zeigt auf dem Noma-Grundstück noch den Bestand (langer Hoftrakt mit braunem Ziegeldach, Gastgarten mit Glasdach und weißen Schirmen, graue Blechdächer); das Modell zeigt den Neubau laut Einreichplan. Nicht als Datei vorhanden sind die vier Chatbilder des Kunden (Sichtung durch den Koordinator): Ihre Angaben (terrakotta Eckhaus, dunkles Bürogebäude mit Rasterfassade, Gemeindebau mit roten Balkonbändern) sind oben als "zu prüfen" vermerkt und nicht ins Modell übernommen.


Offen für alle Nummern: Fotos aus dem Hof (Hoffassaden, Erker, Feuermauern) und ein Schrägluftbild in höherer Auflösung;
Geschoßhöhen der Nachbarn sind aus der Traufhöhe (LOD2) gemittelt.
