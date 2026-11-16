# Abgleich Kamera `drohne_sued` gegen die 3D-Referenz

Stand 16.11.2026 09:58, erzeugt mit `immoviz.py referenz wimmergasse-20 --kamera drohne_sued`. Referenz: Google Photorealistic 3D Tiles, nur intern zum Vergleich (keine Geometrie, keine Textur im Modell). Bilder mit Google-Inhalt liegen nur in `renders/streetview/referenz_google/` (nicht im Repo). Das Prüfbild `abgleich_drohne_sued.jpg` zeigt nur das Modell mit Ampel je Gebäude.

## Kalibrierung

- Höhe: Wiener Null liegt 200,64 m über dem Ellipsoid (Wiener Null 156,68 m ü. A. plus Geoidundulation 43,96 m), bestimmt auf 181286 Fahrbahnpunkten im Umkreis 120 m, Streuung 0,88 m.
- Lage: Kacheln gegen die Stadtvermessung um x 0,32 m, y 0,00 m verschoben (Kreuzkorrelation der Hauskanten in der Draufsicht, lokales System); die Referenzkamera steht entsprechend versetzt.
- Kamera: Standpunkt [-15.0, -80.0, 40.0], Brennweite 35.0 mm, Sensor 36 mm, Bild 1200 x 800, Shift x 0,000, y -0,201 (in Cesium als symmetrisch höheres Bild gerendert und zugeschnitten).

## Gesamtwerte

- Kanten (Tiefensprünge und Flächenknicke): 70 % der Referenzkanten haben eine Modellkante in 2 px, 72 % der Modellkanten eine Referenzkante.
- Horizontlinie: mittlere Abweichung 4,9 px, 90 % unter 10,0 px.

## Befund je Gebäude

Vorzeichen: positiv = Modell höher als die Referenz. Höhen in m über Straßenniveau des Objekts (+29,13 WrN). Traufe = 20 %-Wert am freien Dachrand zur Straße, First = 99 %-Wert ohne Kamine (Öffnung 1,25 m), Dachkante = obere Silhouette im Kamerabild (Median). Toleranz: Pflichthäuser 0,5 m, übrige 1,5 m.

| Nr. | Gebäude | BEZUG | Pflicht | Traufe Ref./Mod. | First Ref./Mod. | Dachkante im Bild | IoU | Befund |
|---|---|---|---|---|---|---|---|---|
| 1 | Wimmergasse 18 | 009453 | ja (1) | 18,8 / 18,9 | 22,5 / 22,4 | -0,31 m (-6 px) | 0,91 | in Toleranz |
| 2 | Wimmergasse 15 | 009479 | ja (2) | 16,7 / 17,3 | 20,0 / 19,9 | -0,09 m (-2 px) | 0,86 | Traufe 0,6 m zu hoch |
| 3 | Wimmergasse 16 | 009452 | ja (2) | 20,1 / 20,3 | 23,9 / 23,8 | 0,18 m (5 px) | 0,94 | Dach in echt geneigt, im Modell flach, Modell zu hoch: 2 Stellen, 33 m², bis 2,8 m |
| 4 | gegenueber_w_ecke | 547116 | ja (1) | 16,9 / 17,5 | 20,5 / 20,2 | 0,30 m (4 px) | 0,80 | Traufe 0,6 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 37 m², bis 6,4 m, Modell zu hoch: 4 Stellen, 76 m², bis 4,0 m |
| 5 | stolberggasse_34 | 547117 | ja (1) | 21,4 / 21,5 | 28,2 / 27,2 | 0,09 m (1 px) | 0,82 | First 1,1 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 9 Stellen, 31 m², bis 19,7 m, Modell zu hoch: 3 Stellen, 52 m², bis 13,4 m |
| 6 | Spengergasse 20 | 009458 | ja (2) | 4,1 / 3,0 | 26,1 / 25,9 | 0,00 m (0 px) | 0,74 | Traufe 1,1 m zu tief, Volumen fehlt: 18 Stellen, 369 m², bis 19,8 m |
| 7 | Stolberggasse 35 | 009446 | ja (2) | 18,6 / 18,6 | 22,9 / 22,8 | -0,33 m (-6 px) | 0,79 | Modell zu hoch: 3 Stellen, 16 m², bis 3,4 m |
| 8 | Wimmergasse 13 | 009478 | ja (3) | 18,4 / 18,4 | 23,2 / 21,5 | -0,36 m (-11 px) | 0,63 | First 1,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 19 m², bis 3,8 m, Modell zu hoch: 1 Stelle, 8 m², bis 2,2 m |
| 9 | Stolberggasse 32 | 009425 | ja (2) | 20,4 / 20,8 | 24,2 / 24,2 | -0,35 m (-4 px) | 0,87 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 13 m², bis 5,1 m |
| 10 | Wimmergasse 22 | 009428 | ja (1) | 16,8 / 17,0 | 23,6 / 23,2 | -0,10 m (-1 px) | 0,50 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 11 m², bis 2,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 2,2 m |
| 11 | Wimmergasse 26 | 009430 | ja (3) | 15,7 / 16,1 | 21,3 / 21,4 | 0,26 m (2 px) | 0,62 | Modell zu hoch: 1 Stelle, 7 m², bis 4,3 m |
| 12 | gegenueber_w_31 | 547115 | ja (3) | 15,1 / 14,5 | 19,9 / 19,9 | -0,11 m (-1 px) | 0,61 | Traufe 0,6 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 4,7 m, Modell zu hoch: 2 Stellen, 38 m², bis 3,0 m |
| 13 | Wimmergasse 24 | 009429 | ja (2) | 15,1 / 15,3 | 18,7 / 18,4 | 1,30 m (11 px) | 0,66 | Dachkante im Bild 1,3 m zu hoch |
| 14 | Wimmergasse 25 | 009484 | ja (5) | 7,2 / 7,1 | 17,3 / 17,0 | -0,96 m (-7 px) | 0,38 | Volumen fehlt: 2 Stellen, 52 m², bis 4,3 m, Dachkante im Bild 1,0 m zu tief |
| 15 | Wimmergasse 19 | 009481 | ja (2) | 14,7 / 14,8 | 19,4 / 18,5 | -0,31 m (-3 px) | 0,32 | First 0,9 m zu tief |
| 16 | Wimmergasse 28 | 009431 | ja (4) | 0,5 / 0,4 | 17,9 / 18,0 | 0,15 m (1 px) | 0,65 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 2 m², bis 1,3 m |
| 17 | Wimmergasse 30 | 009432 | ja (5) | 5,2 / 9,1 | 17,8 / 17,4 | -0,16 m (-1 px) | 0,71 | Traufe 3,9 m zu hoch, Modell zu hoch: 1 Stelle, 13 m², bis 9,5 m |
| 18 | Wimmergasse 23 | 009483 | ja (4) | 6,7 / 3,3 | 17,6 / 17,5 | -0,64 m (-5 px) | 0,08 | Traufe 3,3 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 9 m², bis 8,1 m, Dachkante im Bild 0,6 m zu tief |
| 19 | Stolberggasse 34 | 009426 | nein | 8,1 / 4,5 | 21,7 / 21,8 | -0,15 m (-1 px) | 0,57 | Traufe 3,6 m zu tief, Volumen fehlt: 1 Stelle, 176 m², bis 4,4 m, Modell zu hoch: 2 Stellen, 38 m², bis 19,2 m |
| 20 | Siebenbrunnengasse 21 | 009403 | nein | 16,4 / 15,8 | 30,5 / 28,8 | -0,89 m (-4 px) | 0,76 | Traufe 0,6 m zu tief, First 1,8 m zu tief, Volumen fehlt: 15 Stellen, 314 m², bis 15,6 m, Modell zu hoch: 17 Stellen, 390 m², bis 9,1 m, Dachkante im Bild 0,9 m zu tief |
| 21 | Ramperstorffergasse 19 | 009416 | nein | 20,7 / 21,1 | 25,4 / 24,6 | -0,63 m (-6 px) | 0,66 | First 0,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 6 Stellen, 18 m², bis 3,4 m, Modell zu hoch: 2 Stellen, 18 m², bis 6,3 m, Dachkante im Bild 0,6 m zu tief |
| 22 | Ramperstorffergasse 21 | 009417 | nein | 19,9 / 20,8 | 25,4 / 25,1 | -0,35 m (-3 px) | 0,64 | Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 23 m², bis 3,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 1,5 m |
| 23 | Ramperstorffergasse 25 | 009419 | nein | 17,7 / 17,7 | 23,9 / 23,4 | -0,46 m (-3 px) | 0,57 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 5,6 m |
| 24 | Siebenbrunnengasse 30 | 009067 | nein | 15,3 / 16,2 | 19,0 / 18,1 | -0,68 m (-3 px) | 0,65 | Traufe 1,0 m zu hoch, First 0,9 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 12 m², bis 1,7 m, Dachkante im Bild 0,7 m zu tief |
| 25 | Wimmergasse 33 | 009488 | nein | 14,4 / 14,4 | 18,3 / 17,6 | -0,60 m (-3 px) | 0,58 | First 0,8 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 9 m², bis 6,8 m, Modell zu hoch: 1 Stelle, 7 m², bis 3,4 m, Dachkante im Bild 0,6 m zu tief |
| 26 | Siebenbrunnengasse 27 | 009423 | nein | 16,1 / 16,7 | 20,4 / 19,4 | -0,42 m (-2 px) | 0,73 | Traufe 0,6 m zu hoch, First 1,0 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 18 m², bis 2,2 m, Modell zu hoch: 2 Stellen, 21 m², bis 2,5 m |
| 27 | Ramperstorffergasse 23 | 009418 | nein | 17,4 / 17,6 | 23,4 / 23,2 | -0,89 m (-6 px) | 0,33 | Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 7 m², bis 4,8 m, Modell zu hoch: 1 Stelle, 22 m², bis 1,3 m, Dachkante im Bild 0,9 m zu tief |
| 28 | Wimmergasse 29 | 009486 | nein | 2,5 / 1,6 | 19,2 / 18,6 | -0,49 m (-3 px) | 0,73 | Traufe 0,9 m zu tief, First 0,6 m zu tief, Volumen fehlt: 3 Stellen, 56 m², bis 14,6 m |
| 29 | Wimmergasse 36 | 009435 | nein | 11,5 / 11,5 | 15,0 / 14,7 | -0,41 m (-2 px) | 0,68 | in Toleranz |
| 30 | Ramperstorffergasse 27 | 009420 | nein | 18,5 / 19,6 | 22,9 / 22,2 | -0,90 m (-5 px) | 0,36 | Traufe 1,1 m zu hoch, First 0,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 5 Stellen, 71 m², bis 3,6 m, Modell zu hoch: 3 Stellen, 15 m², bis 2,7 m, Dachkante im Bild 0,9 m zu tief |
| 31 | Ramperstorffergasse 31 | 009422 | nein | 16,4 / 17,2 | 21,8 / 21,4 | -0,31 m (-2 px) | 0,64 | Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 42 m², bis 3,6 m, Modell zu hoch: 2 Stellen, 9 m², bis 10,8 m |
| 32 | Siebenbrunnengasse 22 | 009088 | nein | 18,3 / 18,1 | 19,6 / 19,9 | 0,00 m (0 px) | 0,69 | in Toleranz |
| 33 | Siebenbrunnengasse 32 | 009068 | nein | 12,7 / 13,5 | 13,1 / 15,4 | 1,99 m (9 px) | 0,35 | Traufe 0,7 m zu hoch, First 2,3 m zu hoch, Dach in echt geneigt, im Modell flach, Modell zu hoch: 1 Stelle, 44 m², bis 3,7 m, Dachkante im Bild 2,0 m zu hoch |
| 34 | Wimmergasse 32 | 009433 | nein | 14,7 / 14,9 | 16,5 / 16,4 | -0,17 m (-1 px) | 0,66 | in Toleranz |
| 35 | Wimmergasse 27 | 009485 | nein | 12,5 / 2,1 | 17,1 / 16,6 | -0,16 m (-1 px) | 0,46 | Traufe 10,3 m zu tief, First 0,5 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 15 m², bis 14,5 m |
| 36 | Ramperstorffergasse 30 | 009401 | nein | 17,4 / 17,1 | 20,8 / 19,9 | -0,79 m (-4 px) | 0,44 | First 1,0 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 8 Stellen, 40 m², bis 2,9 m, Dachkante im Bild 0,8 m zu tief |
| 37 | Ramperstorffergasse 28 | 009400 | nein | 17,1 / 17,1 | 21,8 / 19,8 | -1,68 m (-9 px) | 0,16 | First 2,1 m zu tief, Volumen fehlt: 2 Stellen, 110 m², bis 3,8 m, Dachkante im Bild 1,7 m zu tief |
| 38 | Wimmergasse 34 | 009434 | nein | 12,0 / 12,2 | 15,5 / 15,4 | -0,37 m (-2 px) | 0,58 | in Toleranz |
| 39 | Siebenbrunnengasse 28 | 009066 | nein | 13,9 / 14,2 | 17,4 / 17,2 | -0,23 m (-1 px) | 0,67 | Dach in echt geneigt, im Modell flach |
| 40 | B96959 | B96959 | nein | 13,6 / 12,8 | 18,0 / 17,1 | -1,09 m (-6 px) | 0,02 | Traufe 0,8 m zu tief, First 0,9 m zu tief, Volumen fehlt: 2 Stellen, 117 m², bis 5,4 m, Dachkante im Bild 1,1 m zu tief |
| 41 | Ramperstorffergasse 29 | 009421 | nein | 14,6 / 14,4 | 20,6 / 19,7 | - | 0,00 | First 1,0 m zu tief, Volumen fehlt: 3 Stellen, 246 m², bis 18,7 m, Modell zu hoch: 1 Stelle, 17 m², bis 2,9 m |
| 42 | Ramperstorffergasse 26 | 009399 | nein | 17,1 / 17,6 | 20,2 / 20,4 | -0,64 m (-4 px) | 0,05 | Traufe 0,5 m zu hoch, Dachkante im Bild 0,6 m zu tief |

## Liste

- Gebäude 2 (Wimmergasse 15): Traufe 0,6 m zu hoch
- Gebäude 3 (Wimmergasse 16): Dach in echt geneigt, im Modell flach, Modell zu hoch: 2 Stellen, 33 m², bis 2,8 m
- Gebäude 4 (gegenueber_w_ecke): Traufe 0,6 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 37 m², bis 6,4 m, Modell zu hoch: 4 Stellen, 76 m², bis 4,0 m
- Gebäude 5 (stolberggasse_34): First 1,1 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 9 Stellen, 31 m², bis 19,7 m, Modell zu hoch: 3 Stellen, 52 m², bis 13,4 m
- Gebäude 6 (Spengergasse 20): Traufe 1,1 m zu tief, Volumen fehlt: 18 Stellen, 369 m², bis 19,8 m
- Gebäude 7 (Stolberggasse 35): Modell zu hoch: 3 Stellen, 16 m², bis 3,4 m
- Gebäude 8 (Wimmergasse 13): First 1,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 19 m², bis 3,8 m, Modell zu hoch: 1 Stelle, 8 m², bis 2,2 m
- Gebäude 9 (Stolberggasse 32): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 13 m², bis 5,1 m
- Gebäude 10 (Wimmergasse 22): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 11 m², bis 2,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 2,2 m
- Gebäude 11 (Wimmergasse 26): Modell zu hoch: 1 Stelle, 7 m², bis 4,3 m
- Gebäude 12 (gegenueber_w_31): Traufe 0,6 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 4,7 m, Modell zu hoch: 2 Stellen, 38 m², bis 3,0 m
- Gebäude 13 (Wimmergasse 24): Dachkante im Bild 1,3 m zu hoch
- Gebäude 14 (Wimmergasse 25): Volumen fehlt: 2 Stellen, 52 m², bis 4,3 m, Dachkante im Bild 1,0 m zu tief
- Gebäude 15 (Wimmergasse 19): First 0,9 m zu tief
- Gebäude 16 (Wimmergasse 28): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 2 m², bis 1,3 m
- Gebäude 17 (Wimmergasse 30): Traufe 3,9 m zu hoch, Modell zu hoch: 1 Stelle, 13 m², bis 9,5 m
- Gebäude 18 (Wimmergasse 23): Traufe 3,3 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 9 m², bis 8,1 m, Dachkante im Bild 0,6 m zu tief
- Gebäude 19 (Stolberggasse 34): Traufe 3,6 m zu tief, Volumen fehlt: 1 Stelle, 176 m², bis 4,4 m, Modell zu hoch: 2 Stellen, 38 m², bis 19,2 m
- Gebäude 20 (Siebenbrunnengasse 21): Traufe 0,6 m zu tief, First 1,8 m zu tief, Volumen fehlt: 15 Stellen, 314 m², bis 15,6 m, Modell zu hoch: 17 Stellen, 390 m², bis 9,1 m, Dachkante im Bild 0,9 m zu tief
- Gebäude 21 (Ramperstorffergasse 19): First 0,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 6 Stellen, 18 m², bis 3,4 m, Modell zu hoch: 2 Stellen, 18 m², bis 6,3 m, Dachkante im Bild 0,6 m zu tief
- Gebäude 22 (Ramperstorffergasse 21): Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 23 m², bis 3,6 m, Modell zu hoch: 1 Stelle, 5 m², bis 1,5 m
- Gebäude 23 (Ramperstorffergasse 25): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 25 m², bis 5,6 m
- Gebäude 24 (Siebenbrunnengasse 30): Traufe 1,0 m zu hoch, First 0,9 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 1 Stelle, 12 m², bis 1,7 m, Dachkante im Bild 0,7 m zu tief
- Gebäude 25 (Wimmergasse 33): First 0,8 m zu tief, Dach in echt geneigt, im Modell flach, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 9 m², bis 6,8 m, Modell zu hoch: 1 Stelle, 7 m², bis 3,4 m, Dachkante im Bild 0,6 m zu tief
- Gebäude 26 (Siebenbrunnengasse 27): Traufe 0,6 m zu hoch, First 1,0 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 3 Stellen, 18 m², bis 2,2 m, Modell zu hoch: 2 Stellen, 21 m², bis 2,5 m
- Gebäude 27 (Ramperstorffergasse 23): Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 7 m², bis 4,8 m, Modell zu hoch: 1 Stelle, 22 m², bis 1,3 m, Dachkante im Bild 0,9 m zu tief
- Gebäude 28 (Wimmergasse 29): Traufe 0,9 m zu tief, First 0,6 m zu tief, Volumen fehlt: 3 Stellen, 56 m², bis 14,6 m
- Gebäude 30 (Ramperstorffergasse 27): Traufe 1,1 m zu hoch, First 0,7 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 5 Stellen, 71 m², bis 3,6 m, Modell zu hoch: 3 Stellen, 15 m², bis 2,7 m, Dachkante im Bild 0,9 m zu tief
- Gebäude 31 (Ramperstorffergasse 31): Traufe 0,8 m zu hoch, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 4 Stellen, 42 m², bis 3,6 m, Modell zu hoch: 2 Stellen, 9 m², bis 10,8 m
- Gebäude 33 (Siebenbrunnengasse 32): Traufe 0,7 m zu hoch, First 2,3 m zu hoch, Dach in echt geneigt, im Modell flach, Modell zu hoch: 1 Stelle, 44 m², bis 3,7 m, Dachkante im Bild 2,0 m zu hoch
- Gebäude 35 (Wimmergasse 27): Traufe 10,3 m zu tief, First 0,5 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 2 Stellen, 15 m², bis 14,5 m
- Gebäude 36 (Ramperstorffergasse 30): First 1,0 m zu tief, Aufbau fehlt (Gaube, Liftturm, Dachterrasse): 8 Stellen, 40 m², bis 2,9 m, Dachkante im Bild 0,8 m zu tief
- Gebäude 37 (Ramperstorffergasse 28): First 2,1 m zu tief, Volumen fehlt: 2 Stellen, 110 m², bis 3,8 m, Dachkante im Bild 1,7 m zu tief
- Gebäude 39 (Siebenbrunnengasse 28): Dach in echt geneigt, im Modell flach
- Gebäude 40 (B96959): Traufe 0,8 m zu tief, First 0,9 m zu tief, Volumen fehlt: 2 Stellen, 117 m², bis 5,4 m, Dachkante im Bild 1,1 m zu tief
- Gebäude 41 (Ramperstorffergasse 29): First 1,0 m zu tief, Volumen fehlt: 3 Stellen, 246 m², bis 18,7 m, Modell zu hoch: 1 Stelle, 17 m², bis 2,9 m
- Gebäude 42 (Ramperstorffergasse 26): Traufe 0,5 m zu hoch, Dachkante im Bild 0,6 m zu tief

## Vorschlag für roofs_override (fehlende Aufbauten der Pflichthäuser)

Quader aus den Messwerten (Lage, Ausdehnung, Höhe relativ zum Sockel). Vor dem Eintragen am Bogen prüfen: Bäume über Dächern und Kräne erscheinen ebenfalls als fehlende Aufbauten. Mit bestehenden Einträgen desselben BEZUG zusammenführen.

```yaml
  - {bezug: "547116", aufbauten: [{pos: [-31.8, 12.7], l: 11.2, b: 4.0, z0: 16.8, z1: 19.4, drehung: 0}, {pos: [-24.3, 20.1], l: 9.7, b: 3.1, z0: 16.8, z1: 19.4, drehung: 85}, {pos: [-16.0, 4.4], l: 8.4, b: 1.8, z0: 17.4, z1: 19.7, drehung: 84}]}   # gegenueber_w_ecke
  - {bezug: "547117", aufbauten: [{pos: [22.6, 13.0], l: 4.8, b: 2.1, z0: 24.9, z1: 43.3, drehung: 13}, {pos: [38.5, 1.3], l: 3.1, b: 1.6, z0: 21.4, z1: 23.7, drehung: 6}, {pos: [21.7, 1.1], l: 3.5, b: 1.3, z0: 21.2, z1: 23.6, drehung: 178}, {pos: [27.1, 13.2], l: 3.8, b: 1.0, z0: 24.1, z1: 26.4, drehung: 0}, {pos: [27.1, 15.3], l: 3.8, b: 1.0, z0: 21.5, z1: 23.6, drehung: 180}, {pos: [37.7, 15.2], l: 3.0, b: 1.3, z0: 21.7, z1: 24.0, drehung: 1}, {pos: [37.8, 13.2], l: 3.0, b: 1.0, z0: 24.2, z1: 26.4, drehung: 0}]}   # stolberggasse_34
  - {bezug: "009458", aufbauten: [{pos: [-68.9, 75.5], l: 46.5, b: 1.0, z0: 26.2, z1: 29.6, drehung: 91}, {pos: [-44.0, 139.5], l: 26.3, b: 1.9, z0: 5.9, z1: 21.7, drehung: 89}, {pos: [-61.9, 3.6], l: 22.1, b: 9.2, z0: 23.1, z1: 27.1, drehung: 162}, {pos: [-53.5, 165.2], l: 21.3, b: 1.3, z0: 21.9, z1: 24.1, drehung: 171}, {pos: [-74.4, 106.8], l: 11.0, b: 1.3, z0: 21.2, z1: 29.0, drehung: 1}, {pos: [-66.9, 40.9], l: 17.2, b: 4.9, z0: 26.2, z1: 30.2, drehung: 109}, {pos: [-77.9, 7.0], l: 20.3, b: 7.7, z0: 23.1, z1: 24.8, drehung: 102}, {pos: [-52.0, 5.2], l: 20.3, b: 6.2, z0: 23.1, z1: 27.2, drehung: 18}, {pos: [-53.8, 16.8], l: 4.7, b: 2.9, z0: 26.8, z1: 30.1, drehung: 102}, {pos: [-55.9, 155.5], l: 3.5, b: 2.3, z0: 22.3, z1: 24.9, drehung: 175}, {pos: [-67.7, 34.2], l: 6.0, b: 2.0, z0: 29.3, z1: 35.2, drehung: 87}, {pos: [-77.1, 9.8], l: 12.5, b: 1.0, z0: 23.1, z1: 27.2, drehung: 90}]}   # Spengergasse 20
  - {bezug: "009478", aufbauten: [{pos: [-22.6, -46.8], l: 4.1, b: 4.0, z0: 19.0, z1: 21.5, drehung: 102}, {pos: [-24.9, -51.7], l: 6.2, b: 2.3, z0: 15.9, z1: 19.6, drehung: 10}]}   # Wimmergasse 13
  - {bezug: "009425", aufbauten: [{pos: [52.9, 7.9], l: 5.3, b: 4.3, z0: 20.3, z1: 25.6, drehung: 149}]}   # Stolberggasse 32
  - {bezug: "009428", aufbauten: [{pos: [10.8, 34.3], l: 8.0, b: 2.8, z0: 19.6, z1: 22.7, drehung: 102}]}   # Wimmergasse 22
  - {bezug: "547115", aufbauten: [{pos: [-20.0, 50.8], l: 14.8, b: 1.4, z0: 17.9, z1: 20.9, drehung: 91}, {pos: [-24.3, 53.8], l: 7.7, b: 3.4, z0: 17.6, z1: 20.4, drehung: 80}]}   # gegenueber_w_31
  - {bezug: "009483", aufbauten: [{pos: [-28.9, 60.2], l: 4.1, b: 3.2, z0: 4.2, z1: 11.5, drehung: 28}, {pos: [-35.2, 65.0], l: 3.2, b: 1.9, z0: 4.2, z1: 8.8, drehung: 100}]}   # Wimmergasse 23
```

## Fernsicht: markante Gebäude im Bild

Höchster Punkt im Bild im Umkreis der Lage (max. 40 m bzw. 2 % der Entfernung), m über Straßenniveau des Objekts.

| Gebäude | BEZUG | Richtung | Entfernung | Daten (Baukörpermodell) | Referenz | Modell |
|---|---|---|---|---|---|---|
| Haus des Meeres | 111431 | 343 Grad | 1,5 km | 63,5 | 64,1 | 62,8 |
| AKH-Neubau Ebene 5 | 139716 | 348 Grad | 4,0 km | 98,4 | 97,4 | 97,4 |
| - | 152566 | 311 Grad | 4,6 km | 101,8 | 100,6 | 100,8 |
| - | 142265 | 0 Grad | 5,6 km | 106,3 | 100,2 | 104,5 |
| - | 211834 | 327 Grad | 2,0 km | 62,3 | 62,4 | 60,6 |
| - | Z49637 | 331 Grad | 1,9 km | 59,7 | 62,8 | 59,6 |
| - | 212474 | 354 Grad | 1,9 km | 56,6 | 58,5 | 55,6 |
| - | 097568 | 322 Grad | 2,3 km | 58,6 | 57,1 | 57,1 |
| Rathaus | 100825 | 359 Grad | 2,9 km | 63,6 | 80,8 | 85,3 |
| Pfarrkirche Schottenfeld | 011873 | 331 Grad | 2,2 km | 56,9 | 66,0 | 56,7 |
| Pfarrkirche Sandleiten | 209272 | 317 Grad | 5,8 km | 84,8 | - | - |
| Pfarrkirche Neuottakring | A01313 | 318 Grad | 4,5 km | 71,2 | 94,8 | 69,2 |
| - | 213315 | 312 Grad | 4,9 km | 74,4 | - | 71,0 |
| - | 518006 | 334 Grad | 3,4 km | 63,7 | 63,4 | 63,4 |
| - | 049518 | 308 Grad | 5,2 km | 75,1 | - | 71,6 |
| Schwestern vom Göttlichen Erlöser Gemeinschaft Hannah | 102073 | 323 Grad | 2,1 km | 54,2 | 54,2 | 54,2 |
| - | 207116 | 333 Grad | 5,2 km | 73,5 | 71,3 | 71,2 |
| - | 099191 | 317 Grad | 1,8 km | 52,0 | 52,1 | 51,9 |
| - | Z50406 | 316 Grad | 2,1 km | 53,5 | 55,2 | 53,5 |
| - | 104416 | 341 Grad | 1,9 km | 51,6 | 62,8 | 51,4 |
| Naturhistorisches Museum | 093881 | 2 Grad | 2,3 km | 54,0 | 55,6 | 53,9 |
| - | Z50405 | 315 Grad | 2,1 km | 52,6 | 55,1 | 53,4 |
| Pfarrkirche Altlerchenfeld | 012270 | 335 Grad | 2,8 km | 55,4 | 70,8 | 66,0 |
| - | 011298 | 346 Grad | 1,8 km | 49,1 | 49,0 | 48,9 |
| Pfarrkirche Breitenfeld | 013435 | 335 Grad | 3,4 km | 56,9 | 66,0 | 65,8 |
