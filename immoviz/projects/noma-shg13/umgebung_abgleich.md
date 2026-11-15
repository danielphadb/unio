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
