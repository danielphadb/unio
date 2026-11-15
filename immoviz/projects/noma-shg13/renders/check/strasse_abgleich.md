# Straßenabgleich noma-shg13

Erzeugt mit `immoviz.py strasse`. Prüfbild: `strasse_abgleich.jpg` (Orthofoto mit Überlagerung aus dem Modell).
Ausschnitt 120 m, 5 cm je Pixel. Orthofoto 2024 und Geodaten: Stadt Wien, data.wien.gv.at (CC BY 4.0).

## Vor dem Objekt

| Fassade | Länge | Gehsteigbreite im Modell (Fassade bis Bordstein, 5 Stellen) | Parkordnung Hausseite | Parkordnung gegenüber | Baumscheiben (davon mit Baum) |
|---|---|---|---|---|---|
| schlachthausgasse | 18,48 m | 2,70 / 2,70 / 2,70 / 2,70 / 2,70 m (min 2,70, max 2,70) | längs, 3 Plätze, Streifen 1,97 m (Automatik) | längs, 3 Plätze, Streifen 2,01 m (Automatik) | 0 (0) |

Messstellen bei 10, 30, 50, 70 und 90 % der Fassadenlänge. Größere Werte am Fassadenende zeigen eine Gehsteigvorziehung an der Kreuzung.

## Parkstreifen im Ausschnitt

| Streifen (Mitte lokal) | Abschnitt von | bis | Breite | Parkordnung | Raster | Plätze | Belegung | Regel |
|---|---|---|---|---|---|---|---|---|
| 45,1 / -57,6 | 48,1 / -73,2 | 42,7 / -42,9 | 1,99 m | längs | 5,70 m | 5 | 85 % | Automatik |
| 56,8 / -53,4 | 52,4 / -32,1 | 60,7 / -78,3 | 4,74 m | schräg 60 Grad | 2,89 m | 15 | 85 % | Automatik |
| 17,8 / 3,6 | 0,4 / 3,7 | 30,9 / 3,7 | 1,97 m | längs | 5,70 m | 5 | 85 % | Automatik |
| 48,8 / -13,6 | 50,3 / -21,2 | 47,7 / -5,7 | 2,00 m | längs | 5,70 m | 2 | 85 % | Automatik |
| 2,8 / 15,2 | 23,1 / 15,1 | -20,1 / 15,3 | 2,01 m | längs | 5,70 m | 7 | 85 % | Automatik |
| -14,0 / 3,5 | -6,8 / 3,7 | -21,0 / 3,8 | 2,00 m | längs | 5,70 m | 2 | 85 % | Automatik |
| -32,1 / 3,8 | -25,1 / 3,8 | -36,6 / 3,8 | 2,00 m | längs | 5,70 m | 1 | 85 % | Automatik |

## Prüfen

1. Liegen die Stellplatz-Rechtecke auf den Autos im Orthofoto (Richtung und Raster)? Sonst Regel in `street.parking` anpassen.
2. Liegen Bordsteinlinien und Gehsteigflächen auf dem Orthofoto (Abweichung unter 0,5 m)?
3. Stehen Baumkreise auf den Baumscheiben, stimmt die Kronengröße? Sonst `trees_override`.
4. Erst danach Renderings für den Vertrieb freigeben.
