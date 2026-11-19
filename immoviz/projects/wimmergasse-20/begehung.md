# Begehung wimmergasse-20

Virtuelle Begehung (`immoviz.py begehung`, Regel U11), Stand 18.11.2026. 47 Street-View-Standorte entlang Wimmergasse
(WI01 bis WI24, y -98 bis +129) und Stolberggasse (ST01 bis ST23, x -107 bis +121), Umkreis 120 m um das Objekt, je
Richtung bis zum 4. bis 5. Haus und darüber, Kreuzung mit WI09 bis WI12, ST13 und ST14. Aufnahmen 05/2024 (Kreuzung,
Wimmergasse Nord) und 04/2026 (Enden). Je Standort 8 Ansichten (vorn, rechts, hinten, links zur Straßenachse, Neigung
-10 und +10 Grad) gegen das Modell. Bögen nur intern: `renders/streetview/begehung/<standort>/bogen.jpg` (nachher) und
`bogen_vorher.jpg` (Kreuzung vor der Korrektur). Karte und Vorprüfung: `renders/check/begehung_karte.jpg`,
`renders/check/begehung_auto.md`. Dazu das Kundenbild (Apple Look Around, Einfahrt an der Objektecke, nur intern).

Hinweis zur Lage: Das Kundenbild zeigt die Einfahrt vom Kreuzungsbereich nach Norden in die Wimmergasse (Einbahn nach
Süden, Radfahren gegen die Einbahn); das Eckhaus mit dem Lokal "Hinteralm" ist das Objekt (Tafel "5. Stolberggasse" über
dem Lokalportal), links Wimmergasse 17 / Stolberggasse 38.

Schwere: hoch = in einer Straßen- oder Luftkamera sichtbar falsch oder vom Kunden genannt; mittel = falsch, aber klein
oder weiter weg; niedrig = Detail; info = erwartete Abweichung (Planung statt Bestand, wechselnde Autos).

## Prüfpunkte

- Bordstein und Gehsteigkanten
- Querungen, Gehsteigüberfahrten, Schwellen, Rampen
- Bodenmarkierungen (Mittellinie, Radpiktogramme, Sperrflächen, Parkmarkierung)
- Verkehrszeichen (Lage, Art)
- Poller (Lage, Farbe, Anzahl)
- Leuchten
- Bäume
- Parkordnung
- Fahrrad- und Motorradabstellplätze
- Mistkübel, Hydranten, Schaltkästen
- Erdgeschosszonen (Lokale, Portale, Schilder ohne Text)
- Pflasterarten

## Abweichungen

| Nr | Standort | Prüfpunkt | Beschreibung | Schwere | Korrektur | Stand |
|---|---|---|---|---|---|---|
| A1 | WI10, WI11, WI12, ST13, Kundenbild | Überfahrt, Schwelle, Rampe | Einfahrt Wimmergasse Nord ist eine Gehsteigüberfahrt: niveaugleiches Plateau auf Gehsteighöhe über die ganze Einmündung (Asphalt), zur Kreuzung eine flache Rampe aus hellen Betonplatten, zur Gasse eine flache Asphaltrampe (OGD: zwei Fahrbahnschwellen der FMZK, Absenkung "0 cm" an beiden Seiten). Modell: Fahrbahnschwellen nicht belegt, Loch im Boden als dunkle Rinne, dazwischen Fahrbahn, an beiden Seiten 12 cm Bordstein (harte Kante); die KI deutete es als Zebrastreifen und Pflaster | hoch | Fahrbahnschwelle als Fahrbahn im Boden (`lib/build.py`), Gehsteigüberfahrt automatisch aus OGD (`strassenelemente`, Plateau 11,5 cm Asphalt, Rampe zur Kreuzung Betonplatten, Rampe zur Gasse Asphalt); gleiche Überfahrt Wimmergasse/Jahngasse | behoben |
| A2 | alle vier Ecken der Kreuzung, Kundenbild | Poller Farbe | Poller dunkelgrün mit rot-weißem Reflexband, Modell grün mit weißen Ringen | hoch | neue Farbe `gruen_rot_weiss` (`lib/assets/moebel.py`) | behoben |
| A3 | WI10, WI11, ST13, ST14 | Poller Anzahl, Lage | Anzahl je Vorziehung NW 3, NE 4, SE 5, SW 3 (Modell NE 3, SE 3); Lage teils neben dem OGD-Bordstein (SW bis 0,6 m auf der Fahrbahn) | mittel | 15 Poller gleichmäßig auf dem OGD-Bordsteinbogen, 0,35 m hinter der Kante | behoben |
| A4 | WI01 bis WI24 | Markierung | Leitlinie strichliert in Fahrbahnmitte (Radfahren gegen die Einbahn, OGD) fehlte in Wimmergasse Nord und Süd | hoch | automatisch aus `RADGEGENEINBAHNOG` (Fahrbahnmitte aus FMZK, Strich 1,5 m, Lücke 3 m, Beginn hinter der Überfahrt) | behoben |
| A5 | WI05, WI07, WI11, WI13, WI18, Kundenbild | Markierung | Radpiktogramme in der Gegenrichtungsspur, erstes direkt hinter der Überfahrt, dann rund alle 25 m, fehlten | hoch | automatisch, `piktogramm_abstand: 25` | behoben |
| A6 | WI01 bis WI24 Ostseite | Parkmarkierung, Pflaster | Schrägparker auf Asphalt mit weißen Trennlinien und Randlinie zur Fahrbahn; Modell Granitpflaster ohne Linien | mittel | `street.parkstreifen_material` (Ostseite Asphalt), Parkregel `markierung: true`, `randlinie: true` | behoben |
| A7 | ST01 bis ST23 | Markierung | Leitlinie strichliert in der Stolberggasse (Gegenverkehr) fehlte | mittel | `strassenelemente_auto.leitlinie_strassen: [Stolberggasse]` | behoben |
| A8 | ST12, ST14, ST15 | Markierung | vor der Kreuzung je ein weißes Dreieck in der Fahrbahn (Spitze zur Kreuzung) und ein Radpiktogramm daneben fehlten | mittel | `strassenelemente` Fläche (Geometrie aus dem Orthofoto 2024) und Radpiktogramm | behoben |
| A9 | ST13, Kundenbild | Motorradabstellplatz | erste Bucht vor der Objektecke (Stolberggasse) mit Motorrädern, Modell Auto | mittel | Parkregel `art: keine` für die Bucht, zwei Motorrad-Platzhalter | behoben |
| A10 | WI10, WI11, WI12, ST13, Kundenbild | Verkehrszeichen | NE: Einfahrt verboten mit Zusatztafel "ausgenommen Rad" und Stop nach Norden am selben Steher, Gefahrzeichen Bodenschwelle fehlte; NW: Stop und Gefahrzeichen nach Norden fehlten; SW: Zusatztafel unter Einbahn fehlte | hoch | `strassenmoebel` (mehrere Tafeln je Steher, `vorrang` neu), Gefahrzeichen NE aus dem Schatten im Orthofoto | behoben |
| A11 | WI10, WI11, ST13, ST14, Kundenbild | Pflaster | Gehsteigvorziehungen mit Betonplatten (Kundenbild: Kopfsteinpflaster nur in der Motorradbucht vor dem Eckhaus), Modell Gussasphalt, KI machte daraus Kopfsteinpflaster | mittel | `street.belag` (vier Vorziehungen `gehsteig_platten`), Rampe der Überfahrt zur Kreuzung in Platten | behoben |
| A12 | WI11, WI12, ST14 | Fahrradabstellplatz | NW drei Bügel quer zum Bordstein auf der Abstellfläche (OGD Wimmergasse 17, 6 Räder), Modell 1,8 m daneben im Gehsteig | mittel | Bügel aus OGD `FAHRRADABSTELLANLAGEOGD` (alle 11 Anlagen im Umkreis), Hand-Einträge entfernt | behoben |
| A13 | WI09, WI10, WI11 | Mistkübel | grau-orange Mistkübel am NW- und am SE-Steher fehlten | niedrig | `mistkuebel` `grau_orange`, am Steher | behoben |
| A14 | ST13, WI10, Kundenbild | Straßentafel | Tafel "Stolberggasse" über dem Lokalportal des Objekts, zwei Tafeln am SE-Eckhaus fehlten | niedrig | `strassenschild` (blau, ohne Schrift) | behoben |
| A15 | WI09, WI10 | Absenkung | Querung Wimmergasse Süd zwischen SW- und SE-Vorziehung, Bordstein bis 3 cm abgesenkt (OGD) | niedrig | automatisch aus `SISGEHSTEIGABSOGD` (36 Absenkungen im Umkreis) | behoben |
| A16 | WI12, WI13 | Hydrant | Hydrant laut OGD an der NW-Abstellfläche (Unterflur, nur Deckel sichtbar) | niedrig | Deckel aus `HYDRANTOGD` | behoben |
| A17 | WI01 bis WI24, ST05 bis ST20 | Bäume, Baumscheiben | Baumscheiben sind bepflanzte Inseln bzw. offene Erde mit Kante, Modell Gussgitter | mittel | `strassenmoebel_auto.baumscheibe: erde` | behoben |
| A18 | ST13 | Schacht | großer Straßeneinlauf vor der Objektecke | niedrig | `schachtdeckel` `einlauf` | behoben |
| A19 | ST13, WI11, WI12, Kundenbild | Erdgeschosszone | Bestand: Lokal mit Holzportal über Eck (Stolberggasse Achsen 0 bis 1, Eingang an der Ecke, Vordach), daneben vergitterte Fenster; Modell ANN Schaufenster Achsen 0 bis 2 (Ansicht Stolberggasse fehlt) | mittel | offen: Frage an den Bauträger, ob das Lokal bleibt und wie das EG Stolberggasse geplant ist (Planung geht vor Bestand) | offen |
| A20 | ST06, ST07, ST08, ST17, ST18 | Markierung | Schulweg: rot umrandete Kinder-Piktogramme und "30" auf der Fahrbahn (x 45 bis 75 und -47 bis -57) | niedrig | offen, in keiner Kamera; Ziffern nur als Fläche ohne lesbare Schrift | offen |
| A21 | ST19, ST20 | Querung, Ampel, Haltestelle | Kreuzung Spengergasse: Schutzweg rot-weiß (FMZK vorhanden), Ampel und Wartehäuschen fehlen im Modell (AMPELOGD liefert dort nichts) | niedrig | offen, 85 m vom Objekt, in keiner Kamera | offen |
| A22 | alle | Leuchten | Seilleuchten wie im Inventar (Abschnitt 12), keine Abweichung | info | keine | geprüft |
| A23 | alle | Parkordnung | Stolberggasse senkrecht beidseitig auf Pflaster, Wimmergasse Ost schräg, West längs auf Pflaster; stimmt (Abschnitt 5) | info | keine | geprüft |
| A24 | alle mit Blick aufs Objekt | Dach, Erdgeschoss | Foto zeigt Bestand ohne Dachausbau, Modell die Planung | info | erwartet | geprüft |
| A25 | alle | Autos, Personen | geparkte Autos und Personen wechseln (Vorprüfung: Auto, Zweirad, Person nur Hinweis) | info | erwartet | geprüft |

Zebrastreifen: an der Kreuzung Wimmergasse/Stolberggasse gibt es keinen (FMZK und Begehung); die FMZK-Schutzwege liegen an
Spengergasse und Ramperstorffergasse (x -95 bis -86 und +91 bis +95), im Modell nur dort.

## Standorte

Die Vorprüfung (`begehung_auto.md`) liefert je Ansicht Bereiche mit Klassenunterschied; die Sichtprüfung je Standort:

| Standort | Lage | Befund (Sichtprüfung) |
|---|---|---|
| ST01 bis ST04 | Stolberggasse Ost, Ramperstorffergasse | Pflaster-Parkstreifen senkrecht, Leitlinie (A7), Schutzweg Ramperstorffergasse aus FMZK; keine weitere Abweichung |
| ST05 bis ST08 | Stolberggasse Ost | Schulweg-Markierungen (A20), Baumscheiben offen (A17), sonst wie Modell |
| ST09 bis ST11 | Stolberggasse vor Nr. 32 und 34 | Leitlinie (A7), Baumscheiben (A17), Parkordnung stimmt |
| ST12 | Stolberggasse vor dem Objekt | Dreieck und Radpiktogramm (A8), Baum in offener Baumscheibe (A17) |
| ST13 | Objektecke | Poller (A2, A3), Zeichen (A10), Motorräder (A9), Straßentafel (A14), Platten (A11), Einlauf (A18), Erdgeschoss (A19) |
| ST14 bis ST16 | Stolberggasse West | Dreieck und Radpiktogramm (A8), Leitlinie (A7), NW-Vorziehung mit Baumscheibe und Bügeln (A12) |
| ST17 bis ST20 | Stolberggasse West bis Spengergasse | Schulweg "30" (A20), Schutzweg rot-weiß, Ampel, Haltestelle (A21) |
| ST21 bis ST23 | Spengergasse und weiter | wie Modell, Leitlinie (A7) |
| WI01 bis WI04 | Wimmergasse Süd bis Vogelsanggasse | Schrägparker Ost mit Markierung (A6), Leitlinie und Piktogramme (A4, A5), Baumscheiben (A17) |
| WI05 bis WI08 | Wimmergasse Süd | wie WI01; Piktogramm bei y -38 und -63 |
| WI09 | vor der Kreuzung Süd | Stop und Mistkübel SE (A10, A13), Poller (A2, A3), Absenkungen (A15) |
| WI10 | Kreuzung | Überfahrt (A1), alle vier Vorziehungen (A2, A3, A11), Zeichen (A10) |
| WI11 | auf der Überfahrt | Überfahrt (A1), Piktogramm und Leitlinie (A4, A5), Bügel und Hydrant (A12, A16), Objektecke (A9, A19) |
| WI12 bis WI14 | Wimmergasse vor dem Objekt | Schrägparker auf Asphalt mit Linien (A6), Piktogramm bei y 29 (A5), Baumscheibe (A17), Erdgeschoss (A19) |
| WI15 bis WI24 | Wimmergasse Nord | wie WI12; Motorräder auf dem Längsparkstreifen wechseln (A25) |

## Nachlauf

Ablauf: Fotos und Standorte einmal geladen (rund 3 Minuten), Modell vorher für die Kreuzung (WI09 bis WI12, ST13), nach
den Korrekturen alle 47 Standorte neu (rund 95 Minuten Cloud, 4 Kerne), danach drei Nachläufe nur an der Kreuzung
(Überfahrt-Material, Gefahrzeichen). Vorher/Nachher der Kreuzung (nur intern): Bogen im Scratchpad der Sitzung
(`kreuzung_vorher_nachher.jpg`), Modellbilder `renders/streetview/begehung/<WI09|WI10|WI11|WI12|ST13>/*_modell_vorher.png`
und `*_modell.png`.

Vorprüfung (automatisch, `renders/check/begehung_auto.md`): an den fünf Kreuzungsstandorten Befunde "hoch" 50 vorher,
32 nachher; über alle 47 Standorte 230 "hoch", davon die meisten an den Nachbarkreuzungen Spengergasse und
Ramperstorffergasse (Ampeln, Haltestelle, Schilder, A21) und Lageversatz der Panoramen. Die Vorprüfung ist kalibriert
(Autos, Zweiräder und Personen zählen bei Fahrbahn, Gehsteig und Markierung nicht), bleibt aber ein Wegweiser: die
Street-View-Standorte liegen bis rund 1,5 m neben der GPS-Lage (umgebung_abgleich.md 15), deshalb sind nahe Befunde
"Gehsteig nur im Foto" / "Fahrbahn nur im Modell" in den Seitenansichten (z. B. WI11 links, ST13 rechts) meist
Lageversatz; geprüft gegen Orthofoto und OGD, dort keine Abweichung.

Ergebnis der Sichtprüfung nach der Korrektur: keine Abweichung "hoch" offen. Offen bleiben A19 (Frage an den Bauträger:
Erdgeschoss Stolberggasse, Lokal), A20 und A21 (außerhalb aller Kameras). Bestanden für die Straßen- und Luftkameras im
Sinn von Regel U11; 4k-Neurender per Mac-Auftrag `auftraege/2026-11-19_runde8_begehung.md`.
