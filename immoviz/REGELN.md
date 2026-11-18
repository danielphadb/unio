# immoviz: Regelwerk (verbindlich)

Stand 18.11.2026 (V6, V7 Schutzmaske und Grading; V8 Schutz mit Toleranz, V9 Lizenzen lokale KI; P2, P3, U9 Plan-Soll-Liste). Abgeleitet aus allen Korrekturrunden bei NOMA Schlachthausgasse 13 (Runde 1 bis 4, Apartments
Variante 2) und Wimmergasse 20 (Umgebungsabgleich, Innenräume). Ziel: weniger Runden, weniger verworfene Credits,
jeder Fehler wird früh und möglichst automatisch gefunden.

Jede Regel nennt den Fehler, der sie ausgelöst hat (N = NOMA, W = Wimmergasse, mit Fundstelle in der Projektdoku),
und wie sie geprüft wird: **auto** = Befehl, **manuell** = Checkliste. Ablauf als Schleife: KONZEPT.md, Abschnitt
"Korrekturschleife".

## 0. Grundsätze

**G1 Quellen-Rangfolge.** Bei Widerspruch gilt die höhere Quelle. Jede Zahl im Modell nennt ihre Quelle.

| Rang | Quelle | Kürzel (Beispiele) | darf liefern |
|---|---|---|---|
| 1 | Einreichplan, Polier-/Verkaufsplan, Vermessung, Ansichten, Schnitte, BAB, Farbkonzept, Interior-Plan | `EIN S. 16`, `VP Top 3`, `ANS`, `GR`, `BAB 3.5`, `FK`, `INT S. 3`, `RAL 7012` | alles am Objekt: Maße, Öffnungen, Geländer, Tröge, Wege, Koten, Farben |
| 2 | Stadt Wien OGD: Orthofoto 2024, Dachmodell LOD2, Baukörpermodell, Baumkataster, Verkehrsflächen, Adressregister | `OGD`, `Orthofoto`, `LOD2`, `BKM`, `Kataster`, `ADR` | Umgebung: Lage, Höhen, Dächer, Gehsteige, Parkstreifen, Bäume, Hausnummern |
| 3 | Fotos und Angaben des Kunden | `Kunde`, `Foto` | Bestand, Hoffassaden, Details |
| 4 | 3D-Referenzen Google/Apple, Street View (nur intern ansehen, nie ins Bild, nie ins Repo) | `SV 05/2024`, `Google 3D`, `Apple 10` | Farben, Gliederung, Dachdeckung, Baumgrößen der Nachbarn |
| 5 | Visualisierungen, Vorlagen, Stimmungsbilder | `VIS`, `Hof_fin` | nur Mood, Licht, Möblierungsstil; nie Geometrie, nie Nachbarfarben |
| 9 | Annahme | `ANN <Begründung>` | nur wenn nichts anderes existiert, im Prüfbogen offen ausweisen |

Grund: N Runde 2 übernahm Nachbarfarben aus der Vorlage `Hof_fin-4` (lachsrot statt weiß, umgebung_abgleich.md
Abschnitt 7), Vorlagen zeigen Glas-Sheddächer und Bäume, die es nicht gibt (mood_vorlagen.md). Prüfung: auto,
`immoviz.py pruefen` meldet je Element den Rang und warnt, wenn eine Klasse unter ihrem Mindestrang liegt
(Geländer, Tröge, Wege, Fenster, Stuck, Großmöbel: Rang 1; Farben: Rang 3; Bäume, Nachbarn: Rang 4).

**G2 Vektor vor Pixel.** Maße und Farben aus PDF-Vektoren lesen (Linien, Füllungen, DeviceRGB, Bemaßung,
Koten), nicht aus gerenderten Pixeln oder beleuchteten Ansichten. Pixelmessung nur, wo kein Vektor existiert, und
dann mit Kalibrierung über ein bemaßtes Element. Grund: N Bordeaux aus beleuchteten Ansichten gemessen (#7A463B,
im Bild zu hell und zu orange), Palettenfarbe aus dem Inhaltsstrom ist #5C1727 (interior_v2.md 6.3); N
Verkaufspläne mit falscher Maßleiste (README Noma, "rund 1:60"). Prüfung: auto, `pruefen` warnt bei Farben,
deren Quelle "gemessen/abgelesen" sagt, aber keinen Farbcode oder Vektor nennt; manuell: Messmethode im YAML-Feld
`quelle` angeben (`"INT S. 6 Vektor"`).

**G3 Blender ist die Wahrheit, die Bild-KI nur Finish.** Was im Blender-Bild nicht stimmt, wird im Modell
korrigiert, nie per Prompt. Was die KI dazuerfindet, wird verworfen, nicht schöngeredet.

## 1. Intake

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| I1 | Auftrag in eigenen Worten zurückspiegeln, bevor modelliert wird: welche Einheiten, welche Motive, welcher Plan gehört wozu | N "Apartments" = Kurzzeitapartments im EG, die Verkaufspläne `01.pdf` gehören zu den Eigentumswohnungen (README Noma, Runde 2) | manuell: Auslegung im Projekt-README unter "Auftrag", Bestätigung des Kunden |
| I2 | Planstand je Dokument mit Datum erfassen, jüngster Stand gilt, Widersprüche notieren (EIN gegen VP) | N Top 4/4A im EIN anders als im VP | manuell: Quellentabelle im README |
| I3 | Seitenangaben immer als PDF-Seite, nie als gedruckte Blattnummer | N ab Runde 4 umgestellt, ältere Verweise meinen Blattnummer (README Noma, Runde 4) | manuell |
| I4 | Je Quelle Kürzel festlegen und im Kopf von `project.yaml` erklären (`[EIN]`, `[VP]`, ...) | Nachvollziehbarkeit | auto: `pruefen` erkennt Kürzel |
| I5 | Fehlende Unterlagen sofort anfordern: Polierplan, Schnitte mit Koten, Hoffotos, Farbkonzept mit Codes | N Raumhöhe APT. 01 und Hoffassaden blieben über Runden offen | manuell: Intake-Checkliste im Studio |

## 2. Plan-Auswertung

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| P1 | Maßstab nie aus der Maßleiste, immer über zwei bemaßte Strecken kalibrieren und Abweichung notieren (< 0,5 %) | N Verkaufspläne rund 1:60 statt Maßleiste (README Noma) | manuell; Plancheck-Bilder `renders/check/plancheck_*.png` |
| P2 | Fensterraster, Türen und Öffnungen aus dem Plan lesen (Lücken der Außendämmung, Fensterlisten, FPH), nie im Raster schätzen; Anzahl je Fassade und Geschoss als Plan-Soll-Liste (`soll:`) | N EG-Südfassade: Raster 10,56 m und Fenstertüren geschätzt statt 10 Fenster 1,60 x 1,50 laut EIN S. 8/15; W 18.11.2026: Stolberggasse DG im Altbauraster (7 statt 5 Fenster, Loggien fehlten), DG3 Wimmergasse 8 statt 11 Öffnungen | auto: `pruefen` (Fenster mit `ANN` oder ohne Planquelle; Soll gegen Modell je Fassade und Geschoss, Abweichung = Fehler); `check` (Fassaden-Überlagerung) |
| P3 | Geländer, Tröge, Handläufe nur, wo der Plan sie zeigt; je Geländer eine Zeile mit Planstelle (G1, G2, ...), Typ (Stab, Glas/VSG, voll, Lochblech), Höhe und Farbe mit Quelle; Unbelegtes als ANN und als Frage an den Bauträger | N Geländer auf einem nicht existierenden Pflanztrog, Handläufe im 1. OG ohne Plan (README Noma, Runde 4); W Kunde 18.11.2026 "bei Laternen und Geländern genau den Plan beachten": 4 von 5 Geländern ohne Quelle, umlaufende Glasbrüstung statt VSG an französischen Fenstern und Stabgeländer laut ANS | auto: `pruefen` (Klasse Geländer/Tröge, Mindestrang Plan; Geländerfelder je Fassade gegen `soll:`) |
| P4 | Wege und Terrassen mit Koten modellieren: Stufe über 2 cm an einer Tür ist ein Fehler, Höhensprung braucht Podest, Rampe oder Stufen laut Plan | N Verbindungsweg eben +3,50, dadurch 0,46 m Stufe an der Stiegenhaustür (Runde 4) | manuell: Clay-Bild in Augenhöhe auf jedem Weg; auto: `pruefen` (Wege ohne Planquelle) |
| P5 | Raumhöhe aus Schnitt und Koten (RDUK/FOK), nie aus Ansichten; Ansichten "ohne Maßstab" vorher über bekannte Breiten prüfen | N Derenko-Ansichten zeichnen 3,22 bis 3,27 m statt 3,38 (interior_v2.md 6) | manuell |
| P6 | Einbauten (Küche, Hochschrank, Garderobe, Borde) nach bemaßtem Grundriss und Ansicht: Reihenfolge, Länge, Höhen je Element; Widerspruch zwischen Blättern notieren | N Küche vertauscht, 0,30 m zu kurz, oberstes Bord fehlte, Mikrowelle zu tief (interior_v2.md 5, 6.1) | manuell: Tabelle Soll/Ist; auto: `pruefen` (Großmöbel brauchen Quelle) |
| P7 | Stuck, Gesimse, Profile nur, wenn Grundriss oder Schnitt sie zeigen; Profil in einer Ansicht allein reicht nicht | N Kranzgesims aus Ansicht übernommen, Kunde schließt Stuck aus (interior_v2.md 6.2) | auto: `pruefen` (Klasse Stuck, Mindestrang Plan), Prompt-Regel `kein_stuck` |
| P8 | Gerundete Bauteile als echte Geometrie (Bogen, Radius gemessen), nicht als Ersatzkörper | N Rundsäule statt gerundeter Trennwand (interior_v2.md 6.4) | manuell |
| P9 | Farben aus Vektor/Palette/Farbcode (G2), Abweichung zwischen Palette und Materialkreis als Frage an den Planer | N Bordeaux #5C1727 gegen #5E2E24 | auto: `pruefen` (Farbe aus Pixeln gemessen?) |

## 3. Umgebung

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| U1 | Parkordnung je Straßenseite aus dem Orthofoto festlegen (`street.parking`), nie aus der Streifenbreite ableiten | W Stolberggasse längs statt 90 Grad, Wimmergasse falsche Schrägrichtung (umgebung_abgleich.md W 5) | auto: `immoviz.py strasse` (Prüfbild, Stellplätze auf den Autos) |
| U2 | Pflichthäuser: in jede Straßenrichtung die ersten 4 bis 5 Häuser je Seite mit Fassade, `ohne_fassade` muss leer sein | W drei direkt sichtbare Häuser fehlten, zwei zweite Fronten fehlten (W 4) | auto: `immoviz.py sichtbar --pflicht` |
| U3 | Jedes Haus ab 1 % Bildanteil unter 80 m bekommt einen Fassadeneintrag mit Quelle | W, N Hoffassaden | auto: `immoviz.py sichtbar` |
| U4 | Bäume: Lage aus Orthofoto/Kataster, Größe aus belaubter Ansicht; jeder Baum im Bild mit Quelle; keine Bäume aus Vorlagen | N zwei nicht existierende Bäume im Nachbargarten, Bäume 2 bis 3 m versetzt, einer auf Lichtkuppeln (N 7); W Kataster führt Säulenhainbuchen zu klein (W 6) | auto: `pruefen` (Bäume), `strasse` (Baumscheiben); manuell: Draufsicht gegen Orthofoto |
| U5 | Nachbarfarben und Gliederung aus Rang 1 bis 4, nie aus Visualisierungen; Bestand gegen Planung unterscheiden (Apple zeigt Bestand) | N lachsrot statt weiß nach Vorlage (N 7) | auto: `pruefen` (Rang je Nachbarfassade) |
| U6 | Hausnummern je BEZUG aus dem Adressregister (ADRESSENOGD), nie aus Bildern oder Erinnerung | N fünf Nachbarn falsch benannt (umgebung_abgleich.md N 8) | manuell: Spalte Adresse (OGD) in der Nachbarübersicht |
| U7 | Dachdeckung, Mansarden, Gauben aus Schrägluftbild als Parameter (`roofs_override`), nichts abpausen | W Dächer, N Runde 4 | manuell |
| U8 | Jede Außenkamera gegen die 3D-Referenz (Google, nur intern) und, wo der Kunde Vorlagen liefert, Kamera gegen Vorlage abgleichen, bevor der Prüfbogen rausgeht | N Runde 3 und 4 (Hoffassaden, Dächer, Standpunkt der Vorlage) | auto: `immoviz.py referenz <p> --kamera <k>`, `immoviz.py kameramatch <p> --bild --punkte --kamera` (paralleler Ausbau, Schwellen in KONZEPT.md Abschnitt 7) |
| U9 | Straßenleuchten nur aus dem Leuchten-Inventar `strassenleuchten` mit Feld `quelle` je Leuchte (Street View Blick nach oben, trianguliert; Plan für Hof und Terrassen). Typ (Seil-, Mast-, Wandleuchte, Laterne), Lage, Lichtpunkthöhe und bei Seilleuchten beide Aufhängepunkte; keine Leuchten aus Vorlagen oder nach Gefühl, kein Ersatz durch die Bild-KI | W Runde 6: Seilleuchte als schwarzer Kasten, Kunde 18.11.2026: Laternen hängend statt stehend (Prompt-Laternen) | auto: `pruefen` (Klasse Straßenleuchten, Warnung ohne Inventar oder ohne Aufhängepunkte; Leuchten je Straßenabschnitt gegen `soll:`), `immoviz.py leuchten <p>` (Prüfbild über Orthofoto) |
| U10 | Straßenmöbel (Poller, Zeichen ohne lesbare Schrift, Bügel, Mistkübel, Hydrant) nur mit Quelle (`strassenmoebel`, Street View oder Plan); Lage im Bildvordergrund aus zwei Panoramen triangulieren, nicht aus einem Bild schätzen; Baumscheiben nur an Katasterbäumen; Menschen nur als Platzhalter (`menschen`) für Lage und Maßstab, nie als Ersatz für die KI-Menschen | W Runde 5: Poller, Zeichen und Fahrradbügel fehlten im Modell (umgebung_abgleich.md 5); W 18.11.2026: Einbahnschild-Pfosten als Poller erfasst, Poller vor Kamera `ecke` 0,8 bis 1,4 m versetzt (umgebung_abgleich.md 14) | auto: `pruefen` (Klasse Straßenmöbel) |

## 4. Innen

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| R1 | Großmöbel und Einbauten (Küche, Hochschrank, Garderobe, Insel, Bett, TV-Wand) als Platzhalter in Blender (`einbauten`), damit Wand und Lage im Bild gesperrt und prüfbar sind | N Küche, TV-Wand, Hochschrank an der falschen Wand oder frei im Raum (staging.json, 6 verworfene Aufträge) | auto: `nachkontrolle` (fehlende/verschobene Kanten); manuell |
| R2 | Möbelplan je Kamera schriftlich (links/Mitte/rechts, welche Wand) in `wohnungen.yaml` unter `kameras.<k>.moebelplan` | dto. | auto: `immoviz.py prompt` warnt "Möbelplan fehlt" |
| R3 | Kein Rand ohne Grund: Planausschnitt darf keine Wand vor Fenstern erzeugen (`rand_offen`) | N Wand 1 m vor HST verdeckte Ausblicke (Runde 3) | manuell: Vorschau |
| R4 | Deckungsgleiche Flächen um 2 cm versetzen | N schwarze Flächen in Cycles | manuell |

## 5. Kameras

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| K1 | Kamera erst an der Clay-Vorschau prüfen: sieht sie das Verkaufsargument (Terrasse, Fassade, Ausblick)? Verworfene Standpunkte mit Grund im README | N Straßenhaus, Nachbargarten, Drohne Nord verworfen (Runde 3) | manuell |
| K2 | Nicht direkt neben Stämmen, Pfeilern oder Wänden; Kamera nicht in Möbeln | W Kamera 2,5 m neben Baumstamm (W 7) | manuell |
| K3 | Bei Vorlagen-Wunsch Standpunkt der Vorlage nachbauen und vergleichen | N `hof_vorlage` | auto: `kameramatch` (paralleler Ausbau) |
| K4 | Innenkameras diagonal mit Durchblick, Kameraname = Bildname (`<wohnung>_<kamera>`) | N Bad frontal statt diagonal verworfen | manuell |
| K5 | Straßenkameras mit `augenhoehe: 1.6` (Höhe über Gelände am Standpunkt), nie mit absolutem z; Kamerahöhe über Gelände im Bericht nennen | W `ecke` stand nur 0,5 m über dem Gehsteig, `ecke_tele` auf Bodenhöhe, `wimmergasse` 2,1 m (19.11.2026) | auto: `setup_camera` rechnet `augenhoehe` aus dem Gelände |

## 6. Freigabe (vor jedem Credit)

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| F1 | Erst Prüfbogen an den Kunden: Blender-Vorschau je Kamera, Draufsicht über Plan, offene Annahmen (Anteil ANN je Bild aus `pruefen`), Nachbarübersicht | N Runde 2 und 3 veredelt, Runde 4 korrigierte danach EG, Weg, Geländer, Küche, Stuck: Credits für veraltete Bilder | manuell: Prüfbogen; auto: `pruefen` liefert die Zahlen |
| F2 | Veredelung nur für Kameras mit `modell_freigegeben: ja` in `freigabe.yaml` (Datum, von wem) | dto. | auto: Studio sperrt (HTTP 409), `immoviz.py freigabe --projekt <p> --cam <k> --pruefen`; Ausnahme `--force`/`force: true`, wird protokolliert |
| F3 | Vor der Freigabe: `pruefen` ohne Rot (keine Elemente ohne Quelle im Bild), `strasse`, `sichtbar --pflicht` und `autos-pruefen` (ohne Befund) bestanden | alle Runden; W 18.11.2026: Autos schwebten bis 1 m bzw. standen halb auf dem Bordstein und in Pollern | auto |

## 7. Veredelung

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| V1 | Zentrale Prompt-Regeln immer anhängen (`higgsfield/prompt_regeln.yaml`: Geometrie- und Kamerasperre, keine neuen Bauteile, TREES ARE LOCKED, Nachbarn gesperrt, Parkordnung, Möbelplan, kein Stuck ohne Plan, Farben, Raumhöhe) | erfundene Türen, Fenster, Glasfronten, Geländer, Erker, Bäume (N Runde 1 bis 3, W top12/top35) | auto: Studio hängt an; CLI `immoviz.py prompt` |
| V2 | Bild 1 ist immer die Blender-Vorschau; Vorlagen und eigene veredelte Bilder nur als Stil- und Materialreferenz, nie Fremdbilder mit anderen Grundrissen als einzige Referenz | N Vorlagen mit älteren Grundrissen und Glasdächern | manuell |
| V3 | Zweiter Blick in denselben Raum mit dem ersten gelungenen Bild als Anker | Konsistenz Möbel und Material | manuell |
| V4 | Budget je Bild 2 bis 2,5 Credits (nano_banana_pro 2k), Varianten statt Wiederholung, wenn die Kamera schwierig ist | Leitfaden schätzte 1,5 | manuell |
| V5 | Fremdbilder (Moodboards anderer Herkunft) nicht hochladen, nur beschreiben | Rechte | manuell |
| V6 | KI-Bilder nur mit Schutzmaske verwenden: Render mit `--ebenen`, nach der Veredelung `immoviz.py schutz` (Gebäude, Fenster, Rahmen, Geländer, Leuchten, Straßenmöbel, Autos kommen pixelgenau aus Blender, die KI liefert Himmel, Vegetation, Menschen, Stimmung). Ausnahme (Klasse aus dem Schutz nehmen mit `--ohne`/`schutz: {minus: ...}`, oder Bild ohne `schutz`) nur mit schriftlicher Begründung in `project.yaml` bzw. `staging.json` | W Runde 5/6: springende Fenster, erfundene Küchen und Lampen hinter Fenstern, hängende statt stehende Laternen | auto: `schutz` (Exit 1 bei Kanten-F1 unter 0,95), `nachkontrolle --ebenen` (Schutzzonen, Fensterzahl je Fassade) |
| V7 | Look über `immoviz.py grading` an die Leitbilder angleichen (project.yaml `look`), nicht über Prompt-Wörter allein; Leitbilder bleiben lokal | W Runde 5: Himmel zu gesättigt, kein Grading (mood_analyse.md 6.2) | auto: `grading` (Abstand Lab-Mittel zum Leitbild) |

| V8 | `schutz --modus toleranz` (KI je Bauteil behalten, wenn Kantenabstand, Kanten-F1, Versatz, Fensterglas und Sprossen in der Toleranz liegen) nur nach Sichtprüfung des Komponentenbilds; Standard bleibt `voll`, bis der Kunde die Toleranz-Fassung freigibt | W 18.11.2026: Kunde "Blender-Bilder zu schlecht, KI-Bilder stimmen nicht"; Runde 7 genau, aber Putz und Licht flacher als Runde 6 | auto: `_komponenten.jpg/.json` (grün KI, rot Render), Exit 1 unter F1 0,90; manuell: Kachelübergänge, Fenster |
| V9 | Lokale Bild-KI (`ki-lokal`) nur mit Modellen, deren Lizenz kommerzielle Nutzung erlaubt und dokumentiert ist (`lib/ki_lokal.py` MODELLE: SDXL Open RAIL++-M, ControlNet-Union Apache-2.0, VAE MIT); keine FLUX.1-dev-Gewichte oder -Ableger, kein SD 3.5 ohne Lizenzprüfung, Feinabstimmungen ohne offengelegte Trainingsdaten nur nach Freigabe | Lizenzrisiko bei Vertriebsbildern | auto: `--modell` nur aus der Liste, Lizenz steht im Ergebnis-JSON |
## 8. Nachkontrolle (nach jedem Auftrag)

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| N1 | Jedes veredelte Bild gegen die Vorschau prüfen: `immoviz.py nachkontrolle --vorschau <png> --veredelt <jpg>` (mit Ebenen zusätzlich `--ebenen <ordner>`: Schutzzonen und Fensterzahl je Fassade); Status "zur Prüfung" heißt Sichtprüfung der markierten Stellen (rot neu, blau fehlt, orange Rechteck) | 18 von 74 Aufträgen bei Noma verworfen (staging.json, README Noma), teils erst nach Kundenhinweis | auto (Score, Markierungsbild), manuell (Entscheidung) |
| N2 | Mehrere Varianten derselben Kamera vergleichen lassen und die mit dem kleinsten Score zuerst ansehen: `--veredelt a.jpg b.jpg` | Rangfolge stimmt an den Testfällen in 9 von 13 Paaren | auto |
| N3 | Checkliste je Bild: Achsen/Öffnungen zählen, geschlossene Wände geschlossen, Küche/Großmöbel an der Planwand, Bäume gleich groß und am Ort, Geländer nur laut Plan, Ausschnitt gleich, keine Stuckleisten ohne Plan | wie V1 | manuell |
| N4 | Vorbehalte nicht stillschweigend übernehmen: Bild mit bekanntem Fehler bekommt `vorbehalt` in staging.json und geht nicht an den Vertrieb | N `pavillons_drohne_sued`, `*_wohnkueche_aussicht` | manuell |

## 9. Dokumentation

| ID | Regel | Grund (Fehler) | Prüfung |
|---|---|---|---|
| D1 | Neue Elemente bekommen ein Feld `quelle` (`"EIN S. 16"`, `"OGD Orthofoto"`, `"ANN Raster 5 m"`); Kommentare mit `[Kürzel]` zählen für den Altbestand nur als Warnung | Nachvollziehbarkeit, schnellere Korrektur | auto: `immoviz.py pruefen --projekt <p>` (Exit 1 bei fehlenden Quellen, `--streng` verlangt das Feld) |
| D2 | Jede Runde: Befund, Korrektur und offene Punkte im Projekt-README; Aufträge, verworfene Versuche mit Grund in `staging.json` | Lernschleife für dieses Regelwerk | manuell |
| D3 | Neue Fehlerklasse = neue Regel hier plus, wenn möglich, eine automatische Prüfung | | manuell |
| D4 | Kennzeichnung "Unverbindliche Visualisierung" bei jeder Veröffentlichung | Recht | manuell |

## Befehle der Korrekturschleife

```bash
PY=.venv-immoviz/bin/python
$PY immoviz/immoviz.py pruefen --projekt immoviz/projects/<p>            # Quellen je Element, ANN je Bild (Text, --json)
$PY immoviz/immoviz.py strasse immoviz/projects/<p>                      # Parkordnung, Gehsteige, Baumscheiben
$PY immoviz/immoviz.py sichtbar immoviz/projects/<p> --pflicht           # Pflichthäuser
$PY immoviz/immoviz.py autos-pruefen immoviz/projects/<p>               # Autos: Räder auf Fahrbahn, Bucht, Poller, Maßstab
$PY immoviz/immoviz.py freigabe --projekt immoviz/projects/<p>           # Stand je Kamera
$PY immoviz/immoviz.py freigabe --projekt immoviz/projects/<p> --cam ecke --setzen ja --von "Kunde, Mail 16.11."
$PY immoviz/immoviz.py prompt --projekt immoviz/projects/<p> --cam ecke  # Gate plus Regelblock für MCP/Higgsfield
$PY immoviz/immoviz.py render immoviz/projects/<p> --cam ecke --light golden_hour --ebenen   # Bild plus Masken, Schutzmaske
$PY immoviz/immoviz.py schutz --render <render.png> --ki <veredelt.jpg> --ebenen <ordner>      # V6
$PY immoviz/immoviz.py grading --bild <bild_schutz.jpg> --projekt immoviz/projects/<p>       # V7, Leitbilder aus look
$PY immoviz/immoviz.py nachkontrolle --vorschau <vorschau.png> --veredelt <bild.jpg> [<variante2.jpg> ...] [--ebenen <ordner>]
```

Dazu `referenz` (Google-3D-Gegenprobe) und `kameramatch` (Kamera gegen Vorlage), beide parallel entstanden;
Aufruf und Schwellen in README und KONZEPT.md Abschnitt 7.

## Testprotokoll Nachkontrolle (16.11.2026)

33 Bildpaare (Blender-Vorschau gegen veredeltes Bild) aus Noma und Wimmergasse: 14 verworfene Aufträge aus
`staging.json` (Bilder im Scratchpad), 5 übernommene mit dokumentiertem Vorbehalt, 14 übernommene. Schwelle 400:
11 von 14 Fehlfällen "zur Prüfung" (nicht erkannt: Geländer am Weg, Eingangstür an der Fassade, Baum verkleinert,
alle drei klein im Bild), 4 von 5 Vorbehalten erkannt. Von 14 übernommenen Bildern landen 8 ebenfalls "zur
Prüfung" und eines ist "nicht pruefbar" (Wimmergasse `top12_kueche`: Vorschau fast schwarz). Die meisten sind
Innenräume aus leerer Vorschau (Möbel erst durch die Veredelung); echte Abweichungen darunter: Noma
`top3_aussen_gruendach` mit deutlich anderem Ausschnitt (Maßstab 0,78) und Wimmergasse `top07` mit Wandpaneelen und
Deckenrosette, die gegen den Plan zu prüfen sind. Rangfolge bei Varianten derselben Kamera: in 9 von 13 Paaren hat
der verworfene Versuch den höheren Score. Die Nachkontrolle lenkt also die Sichtprüfung, sie ersetzt sie nicht;
mit Großmöbeln als Platzhalter (R1) und heller Vorschau sinken die Fehlalarme.
