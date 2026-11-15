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
