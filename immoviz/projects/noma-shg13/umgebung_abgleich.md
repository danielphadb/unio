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
| 15 | 172417 | Schlachthausgasse 3 / Schnirchgasse 1-7 | Gemeindebau-Riegel jenseits der Schnirchgasse | Runde 6: Westfassade `west_172417` EG + 9 OG, 28 Achsen, vier rotbraune Balkonstapel, Oberteil abgesetzt, Baumgruppe (Abschnitt 10) | LOD2/BKM (29,57 m, Stiegenkerne), Apple 8/9, Orthofoto 2024 | mittel | Ostfassade, Markisen-Lage, Farbe Oberteil |
| 16 | 229182 | Schnirchgasse 10 / Würtzlerstraße 1 (Rundbau) | Südost | runder Baukörper aus OGD/LOD2 | LOD2, Apple 8/9 (Bürorundturm mit Ringgeschoßen) | mittel | Ringgeschoße als Fassade |
| 17 | 504164 | Würtzlerstraße 18 (Wohnanlage, gegenüber) | Süd jenseits der Würtzlerstraße | nur Baukörper | LOD2 | niedrig | Fassaden (nur für Dachmotive relevant) |

Apple zeigt auf dem Noma-Grundstück noch den Bestand (langer Hoftrakt mit braunem Ziegeldach, Gastgarten mit Glasdach und weißen Schirmen, graue Blechdächer); das Modell zeigt den Neubau laut Einreichplan. Nicht als Datei vorhanden sind die vier Chatbilder des Kunden (Sichtung durch den Koordinator): Ihre Angaben (terrakotta Eckhaus, dunkles Bürogebäude mit Rasterfassade, Gemeindebau mit roten Balkonbändern) sind oben als "zu prüfen" vermerkt und nicht ins Modell übernommen.


Offen für alle Nummern: Fotos aus dem Hof (Hoffassaden, Erker, Feuermauern) und ein Schrägluftbild in höherer Auflösung;
Geschoßhöhen der Nachbarn sind aus der Traufhöhe (LOD2) gemittelt.

## 9. Runde 5: Innenhof nach den Vorlagen (Kameramatch, 16.11.2026)

Kundenfeedback: "Bei Noma bitte noch einmal den Innenhof ansehen, bitte von der originalen Visualisierung die Häuser
links und rechts übernehmen, ... sowohl rechts als auch links die Ecke ist hier noch nicht richtig."

**Ursache:** Die Kontrollkamera `hof_vorlage` (Runde 2) war geschätzt und stand rund 10 m neben dem Standpunkt der
Vorlage (26 statt 19 mm). Aus der falschen Kamera wirkten Nachbarn verschoben, und Angleichungen nach Augenmaß
(z. B. 005379 lachsrot in Runde 2) gingen in die falsche Richtung. Neues Werkzeug `immoviz.py kameramatch`
(README immoviz): Kamera aus Passpunkten am Neubau lösen, dann Nachbarn an Überlagerung, Drahtmodell und
Strahlschnitt (Pixelstrahl der gematchten Kamera geschnitten mit einer Fassadenebene) angleichen.

**Gematchte Kameras** (Punktdateien `kameramatch/*.yaml`, Vorlagen nur im Scratchpad):

| Vorlage | Kamera | Passpunkte | Reprojektionsfehler Mittel / Max | Standpunkt, Brennweite |
|---|---|---|---|---|
| `SHG13_Hof_fin` (1920 x 1080) | `hof_fin` | 17 (Attika Top 3/4, Balkonplatten Straßenhaus 2. OG bis 1. DG, Balkone Würtzlerstraße 10, Fassadenkante) | 4,9 px = 0,26 % / 10,8 px | 28,45 / -70,71 / +11,12, 19,1 mm, Shift 0,068 / -0,074; steht im Eckhaus Schnirchgasse 8 (005382), `clip_start` 2,7 m |
| `SHG13_Hof_fin-2` (1920 x 1284) | `hof_fin2` | 6 (Balkonplatten-Enden West/Ost, Fassadenkante, Fensterachse) | 6,5 px = 0,34 % / 16,8 px | 9,34 / -29,77 / +14,28, 19,4 mm, Shift 0,29 / 0,30 (Ausschnitt) |
| `SHG13_Hof_fin-3` (1920 x 1292) | `hof_fin3` | 10 (Fenster 1./2. OG rechte Achse, Attika und Badfenster Top 3) | 6,5 px = 0,34 % / 29,3 px (Badfenster Top 3, Vorlage abweichend) | 24,0 / -55,0 / +6,5 (Rastersuche im freien Hof, Tele fast eben), 102,6 mm |
| `SHG13_Hof_fin-4` (1920 x 1166) | `hof_fin4` | 10 (Attika, HST und Tür Top 4, weißer Kasten) | 12,9 px = 0,67 % / 42 px | 27,58 / -68,48 / +11,0, 52,1 mm: fast derselbe Standpunkt wie `hof_fin` (Ausschnitt mit längerer Brennweite) |

Die freie Lösung mit Kippung und Rollwinkel ist bei `hof_fin` nicht besser (4,7 px, Kippung -0,7 Grad): die Vorlage ist
eine waagrechte Kamera mit Shift. `hof_vorlage` bleibt als alter Eintrag, gilt aber als ersetzt.

**Geänderte Nachbarn** (Nummern wie Abschnitt 8; Vorlage hat Vorrang für die Nachbarn, Neubau bleibt beim Einreichplan):

| Nr | Haus | vorher (Runde 4) | nachher (Runde 5, Messung an der Vorlage) |
|---|---|---|---|
| 1 | 005378 Schlachthausgasse 11 / Schnirchgasse 2 | Hoffassade 21,6 m, Flachdach Kies (Apple) | Hoffassade Traufe 20,0 (Hofecke 20,2 gemessen), Ziegel-Mansarddach bis +23,5 (parametrisch), weiß `#F5F1EB`, Fensterreihen 5,3 / 8,4 / 11,5 / 14,6 (h 2,7) mit Faschen; neuer Baukörper mit Südfassade bei y -15,5 bis an die Ostkante des Straßenhauses (x 19,6), Traufe 19,0 (18,3 bis 19,1 gemessen), zwei Fensterachsen (die Vorlagen zeigen dort keine Nische) |
| 2 | 005379 Schnirchgasse 4 | Traufe 16,3 (LOD2), Erkerturm mit Zeltdach, `#ECE9E2` | Traufe 18,6 (Strahlschnitt an drei Stellen 18,5 bis 18,6), Ziegel-Mansarddach parametrisch bis +23 mit 4 Gauben, Erkerturm entfernt, weiß `#F4F1EC`, Fensterreihen Schritt 3,3 |
| 3 | 005380 Schnirchgasse 6 | Erkerturm mit Zeltdach, LOD2-Dach | Erkerturm entfernt (er stand 10 m vor der Kamera und verdeckte die ganze rechte Bildhälfte, die Vorlage zeigt ihn nicht), Dach parametrisch über dem an der Karte beschnittenen Grundriss |
| 5 | 005387 Würtzlerstraße 12, Hoftrakt | Nordfassade y -64,6 bis -63,9, 17,8 m | Nordfassade 1,9 m nach Süden (y -65,8 / -65,1), 19,5 m, Baukörper +1,7 (`dz`); die Vorlage zeigt die Nordostecke dort und die Ostwand über 18,7 m |
| 8 | 005364 Erdbergstraße 125 | modern hellgrau, LOD2-Dach | weiß mit weiß gerahmten Fenstern, Reihen Schritt 3,4 (Oberkanten 18,7 / 15,3 gemessen), dunkle Blechmansarde 20,8 bis 25 (Traufe 20,8 = OGD), Fassade endet bei y -55,8 |
| 9 | 005363 Erdbergstraße 123 | Ostfassade 19,9 m ab y -53,3, 4 Achsen, Raster 3,0 | 24,8 m (8 Geschosse + DG, Geschoss 2,9 m, gemessen 7,6 / 10,5 / 13,4 / 16,3 / 18,9), beginnt bei y -55,8, Fensterachsen 1,85 / 7,0 / 9,9 / 12,8, graubraune Paneelstreifen `#B9ADB2` zwischen den Fensterbändern, Baukörper +4,9 (`dz`); Rücksprung 23,4 statt 20,1 |
| 10 | 005362 Schlachthausgasse 15/17 | apricot `#DDA38A`, 6 OG im Raster 3,0, graue Blechmansarde | lachs `#D8957F` (Vorlage `#CD9987` Mitteltöne), Fensteroberkanten 6,6 bis 20,4 im Raster 2,75 (Traufe 21,4 bis 22,2 gemessen = OGD 21,8), Ostteil 3 Achsen, Mansarde helles Blech wie die Vorlage |
| | Nachbargarten | weißer Kasten 3 x 8 m bei x -4 bis -1 (Orthofoto) | Kasten 1,0 x 3,2 m, 1,2 m hoch bei x -10,9 bis -9,9 / y -41 bis -37,8 (in `Hof_fin` und `Hof_fin-4` gleich gemessen) |
| | Bäume | Dachgarten 10 m und 6 m | Dachgarten 15 m (Krone 9) und 9 m (Krone 6); zwei neue Laubbäume im Westteil des Nachbargartens (-14,7 / -43,5, 12 m; -13,8 / -33,6, 14 m), Stammfuß am Strahlschnitt |

**Kontrolle an Messpunkten in `hof_fin`** (Vorlagenpixel gegen projizierte Modellkante, 1920 px Breite):

| Kante | vorher (Runde 4) | nachher |
|---|---|---|
| 005363 Oberkante Ostfassade | 97 px = 5,0 % | 2 px = 0,1 % |
| 005363 Rücksprung Oberkante | 46 px = 2,4 % | 0 px |
| 005379 Traufe | 86 px = 4,5 % | 1 px = 0,1 % |
| 005378 Traufe Hofecke | 34 px = 1,8 % | rund 3 px = 0,2 % (Traufe 20,0) |
| 005387 Nordostecke (Bildspalte) | 57 px = 2,9 % | 3 px = 0,2 % |
| 005362 Traufe Ost, 005364 Traufe | je 7 px = 0,4 % | je 7 px = 0,4 % (OGD stimmte schon) |

Die automatische Kantenabweichung (Modellkanten zur nächsten Vorlagenkante im Bildbereich der Nachbarn) liegt vorher
und nachher bei 0,1 bis 0,2 % Median: Laub, Fenster und Texturen der Vorlage liefern überall nahe Kanten, das Maß
trennt deshalb nicht; maßgeblich sind Messpunkte und Überlagerung.

Farben aus mittleren Flächen der Vorlage (30. bis 80. Helligkeitsperzentil, ohne Fenster und Spitzlichter),
für Fassaden im Schatten (Ostseiten links) auf den unbeleuchteten Weißton zurückgerechnet.

**Widersprüche Vorlage gegen Plan und OGD** (dokumentiert, Neubau nicht geändert):

- Neubau, Vorlage älterer Entwurf: Glas-Sheddächer auf den Pavillons (Plan: Flachdach mit PV), kein Pavillon Top 4A
  (dort Gründach), Straßenhaus-Dachgeschoss mit Dachterrassen und Treppen statt Mansarde mit Gauben, linker Teil eine
  Traufe tiefer; Hoffassade endet in `Hof_fin` rund 1 m vor x 19,55 (in `Hof_fin-3` deckt sie sich mit dem Plan);
  Pflanztröge an den Balkonenden breiter; Würtzlerstraße 10: Balkone als geschlossene Kästen, rund 2,3 m tief statt
  1,30 m (oder Hoffassade 1 m weiter südlich), die Ostwand erscheint deshalb in der Vorlage schmal, im Modell breit.
- Pflichtbäume im Hof Ost (EIN S. 18): die Vorlage zeigt einen großen Baum bei rund (4 / -62) statt (8,4 / -63,6) und
  keinen Baum bei (20,1 / -60,2); im Modell bleiben Lage und Kronen laut Plan, der Baum bei (20,1 / -60,2) steht in
  `hof_fin` groß im Vordergrund.
- Nachbarn gegen OGD/Orthofoto/Apple (der Vorlage gefolgt): Traufen 005379 +2,3 m, 005378 -1,6 m mit Ziegeldach statt
  Flachdach, 005363 +4,9 m, Nordfassade 005387 1,9 m südlicher, Nische 005378 neben dem Straßenhaus geschlossen,
  Erkertürme 005379/005380 entfernt (Google 3D und Apple zeigen sie), weißer Kasten und zwei Bäume im Nachbargarten
  anders als im Orthofoto. Für Vertriebsbilder, die den Bestand zeigen sollen, ist diese Abweichung bewusst.

**Nebenbefund schwarzes Dach Schlachthausgasse 15/17** (offen aus Runde 4): kein Problem der Fassadenkarte bei
y -15,05, sondern das Flachdach des hohen Teils von 005362 (+26,75): der dunkle Deckel des Baukörpers lag deckungsgleich
mit der Dachfläche aus LOD2 und gewann stellenweise. Behoben in `lib/build.py`/`lib/meshkit.py` (Deckel unter einem
Dach aus dem Dachmodell 5 cm tiefer, gilt für alle Projekte). Seit der Änderung des Wimmergasse-Agenten stehen alle
Nachbarn auf der Sockelkote T_KOTE; die Vorher-Bilder des Prüfbogens sind mit diesem Stand gerechnet.

Prüfbogen (intern, enthält die Vorlagen): Scratchpad `noma/r5/hof_abgleich.jpg`, je Vorlage Vorlage | Modell vorher |
Modell nachher | Kantenüberlagerung nachher.

## 10. Runde 6: Nr. 15 Gemeindebau Schlachthausgasse 3 / Schnirchgasse 1-7 (BEZUG 172417)

Kundenfeedback: "15 das Haus sieht in echt anders aus." Vorher stand nur der Baukörper aus dem BKM (85 x 11 m, 29,57 m)
mit Standardfenstern. Quellen: BKM/LOD2 (Höhe, vier Stiegenkerne am Dach bei y -21 / -42 / -63 / -84), Apple 8/9 des
Kunden (nur intern: Geschoße, Achsen, Balkonstapel, Farben), Orthofoto 2024 (Bäume, Parkplatz).

| Merkmal | Modell Runde 6 | Quelle |
|---|---|---|
| Geschoße, Höhe | EG + 9 OG, Fensterreihen ab +1,0 und +3,9 im Raster 2,80, Oberkante 29,57 | BKM/LOD2, Apple 9 (neun Balkone je Stapel) |
| Achsen | 28 Achsen zu 3,02 m über die Westfassade (Karte 5 cm vor dem Baukörper, `bezug: 172417_west`) | Apple 9 (3 Achsen bis zum ersten Stapel, je 6 dazwischen) |
| Balkonstapel | vier Stapel in den Achsen 4, 11, 18, 25 (u 10,6 / 31,7 / 52,8 / 73,9), je 9 Balkone 3,0 x 1,25 mit voller rotbrauner Brüstung 1,0 | Apple 9/8; Lage deckt sich auf rund 1 m mit den Stiegenkernen (LOD2) |
| Farben | Fassade weiß/hellgrau `#E8E6E1`, Oberteil ab +19,6 hellgrau-blau `#A9AEB6`, Balkone rotbraun, Markisen orange-beige (zwei) | Apple 9 (Farbwerte geschätzt, im Sonnenlicht gerechnet) |
| Dach | Flachdach mit den vier Stiegenkernen aus LOD2 | LOD2, Apple 9 |
| Umfeld | sieben Laubbäume 15 bis 17 m zwischen Parkplatz und Fassade (`trees_override`), Parkplatz als OGD-Fläche | Orthofoto 2024 (Lage), Apple 9/8 (Größe) |

Offen: Ostfassade (nicht modelliert, aus den Hofkameras nicht sichtbar), genaue Lage der Markisen, Farbe des Oberteils
(Apple zeigt die oberen drei Geschoße bläulich-hell, Vorgabe war "dunkleres Oberteil"; im Modell leicht dunkler abgesetzt).


## Straßenleuchten (18.11.2026)

Erhoben aus Street View 04/2026 (nur intern, `renders/streetview/leuchten/`), Inventar `strassenleuchten` in
`project.yaml`, Prüfbild `renders/check/leuchten_abgleich.jpg`:

- Schlachthausgasse vor dem Objekt (x -38 bis 27): 7 Hängeleuchten an den Querseilen der Straßenbahn-Überspannung,
  alle über der Fahrspur an der Objektseite (y 4 bis 5), Abstand 9 bis 13 m, Lichtpunkthöhe 8,4 m (trianguliert).
- Würtzlerstraße: an der Objektseite (Nr. 10, Baulücke) keine Leuchten; an der Südseite 4 Straßenbahnmasten mit
  Leuchtenausleger (Peitschenmast, Lage entlang der Straße +-2 m, Höhe 8 m geschätzt).
- Hof und Terrassen: der Einreichplan zeigt keine Außenleuchten (Textsuche der Planungsmappe ohne Treffer); die
  Wandleuchten an den Terrassen Top 3 und Top 4 stehen als Ausstattung in `neubau.ausstattung` (Kundenwunsch).
