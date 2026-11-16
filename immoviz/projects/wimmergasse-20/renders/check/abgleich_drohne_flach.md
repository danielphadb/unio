# Abgleich Kamera `drohne_flach` gegen die 3D-Referenz

Stand 16.11.2026 09:58, erzeugt mit `immoviz.py referenz wimmergasse-20 --kamera drohne_flach`. Referenz: Google Photorealistic 3D Tiles, nur intern zum Vergleich (keine Geometrie, keine Textur im Modell). Bilder mit Google-Inhalt liegen nur in `renders/streetview/referenz_google/` (nicht im Repo). Das Prüfbild `abgleich_drohne_flach.jpg` zeigt nur das Modell mit Ampel je Gebäude.

## Kalibrierung

- Höhe: Wiener Null liegt 200,64 m über dem Ellipsoid (Wiener Null 156,68 m ü. A. plus Geoidundulation 43,96 m), bestimmt auf 181286 Fahrbahnpunkten im Umkreis 120 m, Streuung 0,88 m.
- Lage: Kacheln gegen die Stadtvermessung um x 0,32 m, y 0,00 m verschoben (Kreuzkorrelation der Hauskanten in der Draufsicht, lokales System); die Referenzkamera steht entsprechend versetzt.
- Kamera: Standpunkt [-50.0, -60.0, 30.0], Brennweite 28.0 mm, Sensor 36 mm, Bild 1200 x 800, Shift x 0,000, y -0,053 (in Cesium als symmetrisch höheres Bild gerendert und zugeschnitten).

## Gesamtwerte

- Kanten (Tiefensprünge und Flächenknicke): 61 % der Referenzkanten haben eine Modellkante in 2 px, 68 % der Modellkanten eine Referenzkante.
- Horizontlinie: mittlere Abweichung 4,9 px, 90 % unter 8,0 px.

## Befund je Gebäude

Vorzeichen: positiv = Modell höher als die Referenz. Höhen in m über Straßenniveau des Objekts (+29,13 WrN). Traufe = 20 %-Wert am freien Dachrand zur Straße, First = 99 %-Wert ohne Kamine (Öffnung 1,25 m), Dachkante = obere Silhouette im Kamerabild (Median). Toleranz: Pflichthäuser 0,5 m, übrige 1,5 m.

| Nr. | Gebäude | BEZUG | Pflicht | Traufe Ref./Mod. | First Ref./Mod. | Dachkante im Bild | IoU | Befund |
|---|---|---|---|---|---|---|---|---|
| 1 | stolberggasse_41 | B96945 | ja (3) | 4,0 / 2,9 | 22,6 / 22,5 | -0,78 m (-20 px) | 0,87 | Traufe 1,1 m zu tief, Volumen fehlt: 5 Stellen, 163 m², bis 13,2 m, Dachkante im Bild 0,8 m zu tief |
| 2 | Wimmergasse 15 | 009479 | ja (2) | 16,7 / 17,3 | 20,0 / 19,9 | -0,14 m (-3 px) | 0,90 | Traufe 0,6 m zu hoch |
| 3 | Wimmergasse 13 | 009478 | ja (3) | 18,4 / 18,4 | 23,2 / 21,5 | -0,78 m (-26 px) | 0,85 | First 1,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 19 m², bis 3,8 m, Modell zu hoch: 1 Stelle, 8 m², bis 2,2 m, Dachkante im Bild 0,8 m zu tief |
| 4 | Wimmergasse 18 | 009453 | ja (1) | 18,8 / 18,9 | 22,5 / 22,4 | -0,28 m (-4 px) | 0,77 | in Toleranz |
| 5 | gegenueber_w_ecke | 547116 | ja (1) | 16,9 / 17,5 | 20,5 / 20,2 | 0,27 m (3 px) | 0,66 | Traufe 0,6 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 37 m², bis 6,4 m, Modell zu hoch: 4 Stellen, 76 m², bis 4,0 m |
| 6 | stolberggasse_34 | 547117 | ja (1) | 21,4 / 21,5 | 28,2 / 27,2 | -0,12 m (-1 px) | 0,69 | First 1,1 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 9 Stellen, 31 m², bis 19,7 m, Modell zu hoch: 3 Stellen, 52 m², bis 13,4 m |
| 7 | Spengergasse 20 | 009458 | ja (2) | 4,1 / 3,0 | 26,1 / 25,9 | -0,21 m (-3 px) | 0,75 | Traufe 1,1 m zu tief, Volumen fehlt: 18 Stellen, 369 m², bis 19,8 m |
| 8 | Wimmergasse 16 | 009452 | ja (2) | 20,1 / 20,3 | 23,9 / 23,8 | -0,05 m (-1 px) | 0,80 | Dach in echt geneigt, im Modell flach, Modell zu hoch: 2 Stellen, 33 m², bis 2,8 m |
| 9 | gegenueber_s_weiss | 212505 | ja (3) | 21,1 / 21,2 | 27,8 / 27,4 | -0,20 m (-2 px) | 0,80 | Volumen fehlt: 6 Stellen, 83 m², bis 2,8 m |
| 10 | Wimmergasse 22 | 009428 | ja (1) | 16,8 / 17,0 | 23,6 / 23,2 | -0,35 m (-3 px) | 0,61 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 11 m², bis 2,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 2,2 m |
| 11 | Stolberggasse 35 | 009446 | ja (2) | 18,6 / 18,6 | 22,9 / 22,8 | -0,49 m (-6 px) | 0,57 | Modell zu hoch: 3 Stellen, 16 m², bis 3,4 m |
| 12 | Stolberggasse 32 | 009425 | ja (2) | 20,4 / 20,8 | 24,2 / 24,2 | 0,00 m (0 px) | 0,82 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 13 m², bis 5,1 m |
| 13 | Ramperstorffergasse 17 | 009415 | ja (3) | 20,4 / 20,4 | 25,4 / 25,6 | -0,14 m (-1 px) | 0,74 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 3 m², bis 1,4 m, Modell zu hoch: 1 Stelle, 11 m², bis 2,9 m |
| 14 | stolberggasse_26 | Z78185 | ja (5) | 21,6 / 21,5 | 29,8 / 28,4 | -0,68 m (-4 px) | 0,60 | First 1,5 m zu tief, Dach in echt geneigt, im Modell flach, Volumen fehlt: 2 Stellen, 87 m², bis 4,8 m, Modell zu hoch: 2 Stellen, 429 m², bis 17,7 m, Dachkante im Bild 0,7 m zu tief |
| 15 | gegenueber_w_31 | 547115 | ja (3) | 15,1 / 14,5 | 19,9 / 19,9 | -0,23 m (-2 px) | 0,59 | Traufe 0,6 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 4,7 m, Modell zu hoch: 2 Stellen, 38 m², bis 3,0 m |
| 16 | Wimmergasse 26 | 009430 | ja (3) | 15,7 / 16,1 | 21,3 / 21,4 | 0,42 m (3 px) | 0,65 | Modell zu hoch: 1 Stelle, 7 m², bis 4,3 m |
| 17 | Ramperstorffergasse 18 | 009395 | ja (4) | 21,9 / 22,1 | 24,9 / 24,4 | -0,80 m (-5 px) | 0,74 | Dach in echt geneigt, im Modell flach, Dachkante im Bild 0,8 m zu tief |
| 18 | Wimmergasse 24 | 009429 | ja (2) | 15,1 / 15,3 | 18,7 / 18,4 | 1,15 m (9 px) | 0,62 | Dachkante im Bild 1,1 m zu hoch |
| 19 | Wimmergasse 19 | 009481 | ja (2) | 14,7 / 14,8 | 19,4 / 18,5 | -0,21 m (-2 px) | 0,38 | First 0,9 m zu tief |
| 20 | Wimmergasse 28 | 009431 | ja (4) | 0,5 / 0,4 | 17,9 / 18,0 | 0,16 m (1 px) | 0,70 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 2 m², bis 1,3 m |
| 21 | Wimmergasse 30 | 009432 | ja (5) | 5,2 / 9,1 | 17,8 / 17,4 | -0,17 m (-1 px) | 0,59 | Traufe 3,9 m zu hoch, Modell zu hoch: 1 Stelle, 13 m², bis 9,5 m |
| 22 | Wimmergasse 23 | 009483 | ja (4) | 6,7 / 3,3 | 17,6 / 17,5 | 0,26 m (2 px) | 0,36 | Traufe 3,3 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 9 m², bis 8,1 m |
| 23 | Wimmergasse 25 | 009484 | ja (5) | 7,2 / 7,1 | 17,3 / 17,0 | -0,55 m (-4 px) | 0,10 | Volumen fehlt: 2 Stellen, 52 m², bis 4,3 m, Dachkante im Bild 0,6 m zu tief |
| 24 | Siebenbrunnengasse 21 | 009403 | nein | 16,4 / 15,8 | 30,5 / 28,8 | -0,44 m (-2 px) | 0,68 | Traufe 0,6 m zu tief, First 1,8 m zu tief, Volumen fehlt: 15 Stellen, 314 m², bis 15,6 m, Modell zu hoch: 17 Stellen, 390 m², bis 9,1 m |
| 25 | Stolberggasse 34 | 009426 | nein | 8,1 / 4,5 | 21,7 / 21,8 | -0,18 m (-1 px) | 0,57 | Traufe 3,6 m zu tief, Volumen fehlt: 1 Stelle, 176 m², bis 4,4 m, Modell zu hoch: 2 Stellen, 38 m², bis 19,2 m |
| 26 | Siebenbrunnengasse 30 | 009067 | nein | 15,3 / 16,2 | 19,0 / 18,1 | -0,76 m (-3 px) | 0,61 | Traufe 1,0 m zu hoch, First 0,9 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 12 m², bis 1,7 m, Dachkante im Bild 0,8 m zu tief |
| 27 | Ramperstorffergasse 25 | 009419 | nein | 17,7 / 17,7 | 23,9 / 23,4 | -0,22 m (-1 px) | 0,49 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 5,6 m |
| 28 | Ramperstorffergasse 23 | 009418 | nein | 17,4 / 17,6 | 23,4 / 23,2 | -0,51 m (-3 px) | 0,01 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 7 m², bis 4,8 m, Modell zu hoch: 1 Stelle, 22 m², bis 1,3 m, Dachkante im Bild 0,5 m zu tief |
| 29 | Ramperstorffergasse 21 | 009417 | nein | 19,9 / 20,8 | 25,4 / 25,1 | -0,51 m (-3 px) | 0,20 | Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 23 m², bis 3,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 1,5 m, Dachkante im Bild 0,5 m zu tief |
| 30 | Wimmergasse 29 | 009486 | nein | 2,5 / 1,6 | 19,2 / 18,6 | -0,33 m (-2 px) | 0,57 | Traufe 0,9 m zu tief, First 0,6 m zu tief, Volumen fehlt: 3 Stellen, 56 m², bis 14,6 m |
| 31 | Vogelsanggasse 24 | 009476 | nein | 10,4 / 10,1 | 24,0 / 21,3 | - | 0,00 | First 2,7 m zu tief, Volumen fehlt: 2 Stellen, 215 m², bis 13,1 m, Modell zu hoch: 2 Stellen, 24 m², bis 4,9 m |
| 32 | Siebenbrunnengasse 32 | 009068 | nein | 12,7 / 13,5 | 13,1 / 15,4 | 1,40 m (6 px) | 0,34 | Traufe 0,7 m zu hoch, First 2,3 m zu hoch, Dach in echt geneigt, im Modell flach, Modell zu hoch: 1 Stelle, 44 m², bis 3,7 m, Dachkante im Bild 1,4 m zu hoch |
| 33 | Wimmergasse 36 | 009435 | nein | 11,5 / 11,5 | 15,0 / 14,7 | -0,43 m (-2 px) | 0,47 | in Toleranz |
| 34 | Ramperstorffergasse 31 | 009422 | nein | 16,4 / 17,2 | 21,8 / 21,4 | -0,52 m (-2 px) | 0,67 | Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 42 m², bis 3,6 m, Modell zu hoch: 2 Stellen, 9 m², bis 10,8 m, Dachkante im Bild 0,5 m zu tief |
| 35 | Wimmergasse 27 | 009485 | nein | 12,5 / 2,1 | 17,1 / 16,6 | -0,76 m (-5 px) | 0,20 | Traufe 10,3 m zu tief, First 0,5 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 15 m², bis 14,5 m, Dachkante im Bild 0,8 m zu tief |
| 36 | Siebenbrunnengasse 27 | 009423 | nein | 16,1 / 16,7 | 20,4 / 19,4 | -0,49 m (-2 px) | 0,48 | Traufe 0,6 m zu hoch, First 1,0 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 18 m², bis 2,2 m, Modell zu hoch: 2 Stellen, 21 m², bis 2,5 m |
| 37 | Wimmergasse 32 | 009433 | nein | 14,7 / 14,9 | 16,5 / 16,4 | -0,37 m (-2 px) | 0,63 | in Toleranz |
| 38 | Ramperstorffergasse 27 | 009420 | nein | 18,5 / 19,6 | 22,9 / 22,2 | -0,89 m (-4 px) | 0,40 | Traufe 1,1 m zu hoch, First 0,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 5 Stellen, 71 m², bis 3,6 m, Modell zu hoch: 3 Stellen, 15 m², bis 2,7 m, Dachkante im Bild 0,9 m zu tief |
| 39 | Wimmergasse 33 | 009488 | nein | 14,4 / 14,4 | 18,3 / 17,6 | -0,39 m (-2 px) | 0,32 | First 0,8 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 9 m², bis 6,8 m, Modell zu hoch: 1 Stelle, 7 m², bis 3,4 m |
| 40 | Wimmergasse 34 | 009434 | nein | 12,0 / 12,2 | 15,5 / 15,4 | -0,50 m (-2 px) | 0,32 | in Toleranz |
| 41 | Siebenbrunnengasse 28 | 009066 | nein | 13,9 / 14,2 | 17,4 / 17,2 | 0,00 m (0 px) | 0,28 | Dach in echt geneigt, im Modell flach |
| 42 | B96959 | B96959 | nein | 13,6 / 12,8 | 18,0 / 17,1 | -0,91 m (-5 px) | 0,00 | Traufe 0,8 m zu tief, First 0,9 m zu tief, Volumen fehlt: 2 Stellen, 117 m², bis 5,4 m, Dachkante im Bild 0,9 m zu tief |
| 43 | Siebenbrunnengasse 22 | 009088 | nein | 18,3 / 18,1 | 19,6 / 19,9 | -0,33 m (-1 px) | 0,33 | in Toleranz |

## Liste

- Gebäude 1 (stolberggasse_41): Traufe 1,1 m zu tief, Volumen fehlt: 5 Stellen, 163 m², bis 13,2 m, Dachkante im Bild 0,8 m zu tief
- Gebäude 2 (Wimmergasse 15): Traufe 0,6 m zu hoch
- Gebäude 3 (Wimmergasse 13): First 1,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 19 m², bis 3,8 m, Modell zu hoch: 1 Stelle, 8 m², bis 2,2 m, Dachkante im Bild 0,8 m zu tief
- Gebäude 5 (gegenueber_w_ecke): Traufe 0,6 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 37 m², bis 6,4 m, Modell zu hoch: 4 Stellen, 76 m², bis 4,0 m
- Gebäude 6 (stolberggasse_34): First 1,1 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 9 Stellen, 31 m², bis 19,7 m, Modell zu hoch: 3 Stellen, 52 m², bis 13,4 m
- Gebäude 7 (Spengergasse 20): Traufe 1,1 m zu tief, Volumen fehlt: 18 Stellen, 369 m², bis 19,8 m
- Gebäude 8 (Wimmergasse 16): Dach in echt geneigt, im Modell flach, Modell zu hoch: 2 Stellen, 33 m², bis 2,8 m
- Gebäude 9 (gegenueber_s_weiss): Volumen fehlt: 6 Stellen, 83 m², bis 2,8 m
- Gebäude 10 (Wimmergasse 22): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 11 m², bis 2,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 2,2 m
- Gebäude 11 (Stolberggasse 35): Modell zu hoch: 3 Stellen, 16 m², bis 3,4 m
- Gebäude 12 (Stolberggasse 32): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 13 m², bis 5,1 m
- Gebäude 13 (Ramperstorffergasse 17): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 3 m², bis 1,4 m, Modell zu hoch: 1 Stelle, 11 m², bis 2,9 m
- Gebäude 14 (stolberggasse_26): First 1,5 m zu tief, Dach in echt geneigt, im Modell flach, Volumen fehlt: 2 Stellen, 87 m², bis 4,8 m, Modell zu hoch: 2 Stellen, 429 m², bis 17,7 m, Dachkante im Bild 0,7 m zu tief
- Gebäude 15 (gegenueber_w_31): Traufe 0,6 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 4,7 m, Modell zu hoch: 2 Stellen, 38 m², bis 3,0 m
- Gebäude 16 (Wimmergasse 26): Modell zu hoch: 1 Stelle, 7 m², bis 4,3 m
- Gebäude 17 (Ramperstorffergasse 18): Dach in echt geneigt, im Modell flach, Dachkante im Bild 0,8 m zu tief
- Gebäude 18 (Wimmergasse 24): Dachkante im Bild 1,1 m zu hoch
- Gebäude 19 (Wimmergasse 19): First 0,9 m zu tief
- Gebäude 20 (Wimmergasse 28): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 2 m², bis 1,3 m
- Gebäude 21 (Wimmergasse 30): Traufe 3,9 m zu hoch, Modell zu hoch: 1 Stelle, 13 m², bis 9,5 m
- Gebäude 22 (Wimmergasse 23): Traufe 3,3 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 9 m², bis 8,1 m
- Gebäude 23 (Wimmergasse 25): Volumen fehlt: 2 Stellen, 52 m², bis 4,3 m, Dachkante im Bild 0,6 m zu tief
- Gebäude 24 (Siebenbrunnengasse 21): Traufe 0,6 m zu tief, First 1,8 m zu tief, Volumen fehlt: 15 Stellen, 314 m², bis 15,6 m, Modell zu hoch: 17 Stellen, 390 m², bis 9,1 m
- Gebäude 25 (Stolberggasse 34): Traufe 3,6 m zu tief, Volumen fehlt: 1 Stelle, 176 m², bis 4,4 m, Modell zu hoch: 2 Stellen, 38 m², bis 19,2 m
- Gebäude 26 (Siebenbrunnengasse 30): Traufe 1,0 m zu hoch, First 0,9 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 12 m², bis 1,7 m, Dachkante im Bild 0,8 m zu tief
- Gebäude 27 (Ramperstorffergasse 25): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 5,6 m
- Gebäude 28 (Ramperstorffergasse 23): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 7 m², bis 4,8 m, Modell zu hoch: 1 Stelle, 22 m², bis 1,3 m, Dachkante im Bild 0,5 m zu tief
- Gebäude 29 (Ramperstorffergasse 21): Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 23 m², bis 3,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 1,5 m, Dachkante im Bild 0,5 m zu tief
- Gebäude 30 (Wimmergasse 29): Traufe 0,9 m zu tief, First 0,6 m zu tief, Volumen fehlt: 3 Stellen, 56 m², bis 14,6 m
- Gebäude 31 (Vogelsanggasse 24): First 2,7 m zu tief, Volumen fehlt: 2 Stellen, 215 m², bis 13,1 m, Modell zu hoch: 2 Stellen, 24 m², bis 4,9 m
- Gebäude 32 (Siebenbrunnengasse 32): Traufe 0,7 m zu hoch, First 2,3 m zu hoch, Dach in echt geneigt, im Modell flach, Modell zu hoch: 1 Stelle, 44 m², bis 3,7 m, Dachkante im Bild 1,4 m zu hoch
- Gebäude 34 (Ramperstorffergasse 31): Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 42 m², bis 3,6 m, Modell zu hoch: 2 Stellen, 9 m², bis 10,8 m, Dachkante im Bild 0,5 m zu tief
- Gebäude 35 (Wimmergasse 27): Traufe 10,3 m zu tief, First 0,5 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 15 m², bis 14,5 m, Dachkante im Bild 0,8 m zu tief
- Gebäude 36 (Siebenbrunnengasse 27): Traufe 0,6 m zu hoch, First 1,0 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 18 m², bis 2,2 m, Modell zu hoch: 2 Stellen, 21 m², bis 2,5 m
- Gebäude 38 (Ramperstorffergasse 27): Traufe 1,1 m zu hoch, First 0,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 5 Stellen, 71 m², bis 3,6 m, Modell zu hoch: 3 Stellen, 15 m², bis 2,7 m, Dachkante im Bild 0,9 m zu tief
- Gebäude 39 (Wimmergasse 33): First 0,8 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 9 m², bis 6,8 m, Modell zu hoch: 1 Stelle, 7 m², bis 3,4 m
- Gebäude 41 (Siebenbrunnengasse 28): Dach in echt geneigt, im Modell flach
- Gebäude 42 (B96959): Traufe 0,8 m zu tief, First 0,9 m zu tief, Volumen fehlt: 2 Stellen, 117 m², bis 5,4 m, Dachkante im Bild 0,9 m zu tief

## Vorschlag für roofs_override (fehlende Aufbauten der Pflichthäuser)

Quader aus den Messwerten (Lage, Ausdehnung, Höhe relativ zum Sockel). Vor dem Eintragen am Bogen prüfen: Bäume über Dächern und Kräne erscheinen ebenfalls als fehlende Aufbauten. Mit bestehenden Einträgen desselben BEZUG zusammenführen.

```yaml
  - {bezug: "B96945", aufbauten: [{pos: [-40.1, -21.5], l: 8.7, b: 4.6, z0: 15.4, z1: 21.0, drehung: 3}, {pos: [-34.6, -32.5], l: 4.4, b: 3.4, z0: 1.4, z1: 14.9, drehung: 56}]}   # stolberggasse_41
  - {bezug: "009478", aufbauten: [{pos: [-22.6, -46.8], l: 4.1, b: 4.0, z0: 19.0, z1: 21.5, drehung: 102}, {pos: [-24.9, -51.7], l: 6.2, b: 2.3, z0: 15.9, z1: 19.6, drehung: 10}]}   # Wimmergasse 13
  - {bezug: "547116", aufbauten: [{pos: [-31.8, 12.7], l: 11.2, b: 4.0, z0: 16.8, z1: 19.4, drehung: 0}, {pos: [-24.3, 20.1], l: 9.7, b: 3.1, z0: 16.8, z1: 19.4, drehung: 85}, {pos: [-16.0, 4.4], l: 8.4, b: 1.8, z0: 17.4, z1: 19.7, drehung: 84}]}   # gegenueber_w_ecke
  - {bezug: "547117", aufbauten: [{pos: [22.6, 13.0], l: 4.8, b: 2.1, z0: 24.9, z1: 43.3, drehung: 13}, {pos: [38.5, 1.3], l: 3.1, b: 1.6, z0: 21.4, z1: 23.7, drehung: 6}, {pos: [21.7, 1.1], l: 3.5, b: 1.3, z0: 21.2, z1: 23.6, drehung: 178}, {pos: [27.1, 13.2], l: 3.8, b: 1.0, z0: 24.1, z1: 26.4, drehung: 0}, {pos: [27.1, 15.3], l: 3.8, b: 1.0, z0: 21.5, z1: 23.6, drehung: 180}, {pos: [37.7, 15.2], l: 3.0, b: 1.3, z0: 21.7, z1: 24.0, drehung: 1}, {pos: [37.8, 13.2], l: 3.0, b: 1.0, z0: 24.2, z1: 26.4, drehung: 0}]}   # stolberggasse_34
  - {bezug: "009458", aufbauten: [{pos: [-68.9, 75.5], l: 46.5, b: 1.0, z0: 26.2, z1: 29.6, drehung: 91}, {pos: [-44.0, 139.5], l: 26.3, b: 1.9, z0: 5.9, z1: 21.7, drehung: 89}, {pos: [-61.9, 3.6], l: 22.1, b: 9.2, z0: 23.1, z1: 27.1, drehung: 162}, {pos: [-53.5, 165.2], l: 21.3, b: 1.3, z0: 21.9, z1: 24.1, drehung: 171}, {pos: [-74.4, 106.8], l: 11.0, b: 1.3, z0: 21.2, z1: 29.0, drehung: 1}, {pos: [-66.9, 40.9], l: 17.2, b: 4.9, z0: 26.2, z1: 30.2, drehung: 109}, {pos: [-77.9, 7.0], l: 20.3, b: 7.7, z0: 23.1, z1: 24.8, drehung: 102}, {pos: [-52.0, 5.2], l: 20.3, b: 6.2, z0: 23.1, z1: 27.2, drehung: 18}, {pos: [-53.8, 16.8], l: 4.7, b: 2.9, z0: 26.8, z1: 30.1, drehung: 102}, {pos: [-55.9, 155.5], l: 3.5, b: 2.3, z0: 22.3, z1: 24.9, drehung: 175}, {pos: [-67.7, 34.2], l: 6.0, b: 2.0, z0: 29.3, z1: 35.2, drehung: 87}, {pos: [-77.1, 9.8], l: 12.5, b: 1.0, z0: 23.1, z1: 27.2, drehung: 90}]}   # Spengergasse 20
  - {bezug: "212505", aufbauten: [{pos: [59.4, -50.8], l: 18.2, b: 1.0, z0: 21.4, z1: 23.8, drehung: 0}, {pos: [43.1, -50.9], l: 7.5, b: 1.0, z0: 21.3, z1: 23.7, drehung: 0}]}   # gegenueber_s_weiss
  - {bezug: "009428", aufbauten: [{pos: [10.8, 34.3], l: 8.0, b: 2.8, z0: 19.6, z1: 22.7, drehung: 102}]}   # Wimmergasse 22
  - {bezug: "009425", aufbauten: [{pos: [52.9, 7.9], l: 5.3, b: 4.3, z0: 20.3, z1: 25.6, drehung: 149}]}   # Stolberggasse 32
  - {bezug: "547115", aufbauten: [{pos: [-20.0, 50.8], l: 14.8, b: 1.4, z0: 17.9, z1: 20.9, drehung: 91}, {pos: [-24.3, 53.8], l: 7.7, b: 3.4, z0: 17.6, z1: 20.4, drehung: 80}]}   # gegenueber_w_31
  - {bezug: "009483", aufbauten: [{pos: [-28.9, 60.2], l: 4.1, b: 3.2, z0: 4.2, z1: 11.5, drehung: 28}, {pos: [-35.2, 65.0], l: 3.2, b: 1.9, z0: 4.2, z1: 8.8, drehung: 100}]}   # Wimmergasse 23
```

## Fernsicht: markante Gebäude im Bild

Höchster Punkt im Bild im Umkreis der Lage (max. 40 m bzw. 2 % der Entfernung), m über Straßenniveau des Objekts.

| Gebäude | BEZUG | Richtung | Entfernung | Daten (Baukörpermodell) | Referenz | Modell |
|---|---|---|---|---|---|---|
| Curhauskapelle | 169932 | 23 Grad | 2,8 km | 122,4 | 107,4 | 118,7 |
| Donauturm | 073723 | 32 Grad | 7,3 km | 229,8 | 166,3 | 207,3 |
| Haus des Meeres | 111431 | 345 Grad | 1,5 km | 63,5 | 63,1 | 63,1 |
| - | 063994 | 19 Grad | 6,5 km | 150,4 | 143,9 | 143,9 |
| AKH-Neubau Ebene 5 | 139716 | 349 Grad | 4,0 km | 98,4 | 101,3 | 97,1 |
| - | Z49637 | 332 Grad | 1,9 km | 59,7 | 63,0 | 59,7 |
| - | 142265 | 1 Grad | 5,6 km | 106,3 | 101,0 | 101,0 |
| - | 212474 | 355 Grad | 1,9 km | 56,6 | 58,4 | 56,4 |
| Pfarrkirche Schottenfeld | 011873 | 332 Grad | 2,2 km | 56,9 | 65,4 | 55,5 |
| Karlskirche | 160756 | 33 Grad | 1,8 km | 51,2 | 51,7 | 50,0 |
| Rathaus | 100825 | 360 Grad | 2,9 km | 63,6 | 79,4 | 82,5 |
| - | 104416 | 342 Grad | 1,9 km | 51,6 | 62,2 | 50,8 |
| - | 094162 | 337 Grad | 1,6 km | 47,5 | 46,7 | 46,5 |
| Kunsthistorisches Museum | 001065 | 6 Grad | 2,2 km | 54,0 | 55,2 | 52,9 |
| - | 011298 | 347 Grad | 1,8 km | 49,1 | 50,0 | 47,9 |
| Naturhistorisches Museum | 093881 | 3 Grad | 2,3 km | 54,0 | 54,3 | 51,8 |
| - | 518006 | 335 Grad | 3,4 km | 63,7 | 62,0 | 62,0 |
| - | 099187 | 333 Grad | 1,6 km | 45,1 | 45,8 | 44,3 |
| - | 010505 | 341 Grad | 1,6 km | 45,7 | 48,9 | 45,7 |
| - | 219655 | 35 Grad | 6,9 km | 96,2 | 86,5 | 92,9 |
| Pfarrkirche Mariahilf | 010532 | 346 Grad | 1,7 km | 45,4 | 58,8 | 45,2 |
| Pfarrkirche Altlerchenfeld | 012270 | 336 Grad | 2,7 km | 55,4 | 69,0 | 64,1 |
| Don-Bosco-Schwestern Niederlassung Pfeilgasse | 012961 | 343 Grad | 2,7 km | 53,5 | 51,7 | 51,6 |
| - | 207116 | 334 Grad | 5,2 km | 73,5 | - | 73,4 |
| - | 209641 | 352 Grad | 1,6 km | 43,8 | 45,6 | 43,7 |
