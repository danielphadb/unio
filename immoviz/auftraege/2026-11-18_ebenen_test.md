# Auftrag ebenen_test

Status: erledigt
Erstellt: 18.11.2026, Cloud-Sitzung
Erledigt: 18.11.2026, Mac-Sitzung

## Ziel
Render-Ebenen und Schutz-Kompositing in Endauflösung prüfen: 4k-Render der Kamera `ecke` (Wimmergasse 20,
`golden_hour`) mit `--ebenen`, dann das vorhandene KI-Bild der Runde 6 per `schutz` darauf zurücksetzen. Danach
entscheidet die Cloud-Sitzung, ob die finalen Bilder künftig immer mit Ebenen gerendert werden (README, Abschnitt
"Render-Ebenen und Schutzmaske"; REGELN.md V6). Keine Higgsfield-Credits.

## Befehle
```bash
git pull --rebase
pgrep -f immoviz.py || echo frei          # nur rendern, wenn nichts läuft
.venv-immoviz/bin/python -c "import cv2, scipy; print(cv2.__version__, scipy.__version__)"   # beide nötig

# 1. 4k-Render mit Ebenen (Zeit messen; die JSON-Ausgabe enthält "sekunden" gesamt und je Ebenen-Schreibvorgang)
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke --light golden_hour --res 3840x2560 --samples 256 --out ebenen_4k --no-blend --ebenen \
    2>&1 | tee /tmp/ebenen_4k_render.log

# 2. Schutz-Kompositing mit dem Runde-6-Bild (älterer Modellstand, Abweichungen am Baum sind erwartet)
R=immoviz/projects/wimmergasse-20/renders/ebenen_4k/wimmergasse-20_ecke_golden_hour_final.png
E=immoviz/projects/wimmergasse-20/renders/ebenen_4k/ecke_golden_hour_ebenen
KI=immoviz/projects/wimmergasse-20/renders/higgsfield/ecke_golden_r6.jpg
time .venv-immoviz/bin/python immoviz/immoviz.py schutz --render $R --ki $KI --ebenen $E \
    --out immoviz/projects/wimmergasse-20/renders/ebenen_4k/ecke_golden_r6_schutz.jpg
time .venv-immoviz/bin/python immoviz/immoviz.py schutz --render $R --ki $KI --ebenen $E --ohne autos \
    --out immoviz/projects/wimmergasse-20/renders/ebenen_4k/ecke_golden_r6_schutz_ohne_autos.jpg

# 3. Nachkontrolle mit Ebenen (Schutzzonen, Fensterzahl je Fassade), vorher und nachher
for B in $KI immoviz/projects/wimmergasse-20/renders/ebenen_4k/ecke_golden_r6_schutz_ohne_autos.jpg; do
  .venv-immoviz/bin/python immoviz/immoviz.py nachkontrolle --vorschau $R --veredelt $B --ebenen $E \
      --aus immoviz/projects/wimmergasse-20/renders/ebenen_4k/nk_$(basename $B .jpg).jpg \
      > immoviz/projects/wimmergasse-20/renders/ebenen_4k/nk_$(basename $B .jpg).json
done
```

Grading nur, falls der Referenzordner auf dem Mac liegt (nie einchecken):
`IMMOVIZ_REFERENZ=<ordner> .venv-immoviz/bin/python immoviz/immoviz.py grading --bild <..._schutz_ohne_autos.jpg> --projekt immoviz/projects/wimmergasse-20 --maske $E/schutz.png`

## Ausgabe
Alles unter `immoviz/projects/wimmergasse-20/renders/ebenen_4k/`:
- `wimmergasse-20_ecke_golden_hour_final.png` und `ecke_golden_hour_ebenen/*.png` (gitignored, bleiben lokal)
- `ecke_golden_hour_ebenen/ebenen.json` (einchecken)
- `ecke_golden_r6_schutz*.jpg`, `*_pruefung.jpg`, `*.json` (einchecken)
- `nk_*.jpg`, `nk_*.json` (einchecken)

## Melden
Unter "Ergebnis" eintragen und pushen:
1. Renderzeit gesamt (`"sekunden"` der Render-Ausgabe), davon Ebenen schreiben (`renders[0].ebenen.sekunden`),
   maximaler Speicher (`maximum resident set size` aus `/usr/bin/time -l`), Gerät (Metal, GPU-Name).
2. `schutz_anteil_prozent` und `nicht_zugeordnet` aus `ebenen.json` (alles mit Bildanteil über 0,1 % nennen).
3. Aus den `schutz`-JSONs: `ausrichtung` (Modell, Kantenabstand), `schutzbereich.kanten_vorher/nachher` (F1),
   Laufzeit von `schutz`.
4. Aus `nk_*.json`: `schutzzonen.zonen` (Status je Zone) und `schutzzonen.fenster_je_fassade`.
5. Probleme mit genauer Fehlermeldung (z. B. EXR-Fehler, Speicher, OpenCV); Sichtprüfung des Prüfbilds: Naht an der
   Maskenkante sichtbar? Fenster scharf? Farbstimmung passend?

## Ergebnis

cv2 5.0.0, scipy 1.18.1 (opencv-python-headless 5.0.0.93, siehe MAC_SETUP: 5.1 hat kein Wheel für macOS 14).
Grading nachgeholt am 18.11.2026 (Abschnitt 6), Leitbilder aus dem Drive-Ordner "Visualisierungen Datenbank".

### 1. Render mit Ebenen
- Gerät: Metal, Apple M3 Max (GPU, 30 Kerne), Blender 5.2.4 LTS.
- `"sekunden"` gesamt 232, davon Ebenen schreiben (`renders[0].ebenen.sekunden`) 9,6.
- Maximaler Speicher (RSS) 5,21 GB (ohne Ebenen 4,16 GB).
- Keine EXR-, Speicher- oder OpenCV-Fehler. 18 Ebenen-PNGs geschrieben (tiefe.png 3,9 MB, normalen.png 7,4 MB).

### 2. ebenen.json
- `schutz_anteil_prozent`: 29,4 (Schutzkante 2 px).
- `nicht_zugeordnet`: leer.
- Anteile über 0,1 %: himmel 33,0, boden 20,1, gebaeude_objekt 19,2, nachbarn 9,7, baeume 7,6, autos 3,9,
  fenster_glas 2,8, fenster_rahmen 1,9, strassenmoebel 0,64, leuchten 0,50, gelaender 0,50,
  menschen_platzhalter 0,13; sonstige 0,0.

### 3. schutz
| | mit Autos | `--ohne autos` |
|---|---|---|
| geschützt | 29,4 % | 25,5 % |
| Ausrichtung | Homographie, Maßstab 0,991, Schiebung 0,51 %, ECC 0,717, Kantenabstand Median 1,0 px, Mittel 0,92 px | gleich |
| Kanten F1 Schutzbereich vorher / nachher | 0,768 / 0,992 | 0,802 / 0,992 |
| Kantenabstand Mittel vorher / nachher | 1,13 / 0,30 px | 1,05 / 0,29 px |
| Farbabweichung dE vorher / nachher | 25,6 / 18,9 | 24,4 / 18,6 |
| Laufzeit | 16,3 s | 14,2 s |

F1 nachher je Klasse (ohne Autos): fenster_glas 0,980, fenster_rahmen 0,975, gelaender 0,990, leuchten 0,962
(vorher 0,486), gebaeude_objekt 0,979.

### 4. Nachkontrolle
| | KI-Bild Runde 6 (vorher) | nach `schutz --ohne autos` |
|---|---|---|
| Status, Score | zur Prüfung, 12 | zur Prüfung, 18 |
| Zone fenster (F1) | abweichung (0,795) | ok (0,988) |
| Zone leuchten | abweichung (0,515) | ok (0,974) |
| Zone gelaender | abweichung (0,853) | ok (0,989) |
| Zone gebaeude | abweichung (0,809) | ok (0,978) |
| Fenster wimmergasse Render / KI / neu / fehlt | 58 / 59 / 1 / 0 | 58 / 58 / 0 / 0 |
| Fenster stolberggasse Render / KI / neu / fehlt | 39 / 41 / 2 / 0 | 39 / 41 / 2 / 0 |
| neue gerade Kanten | 10 Stellen | 8 Stellen |

Auffällig: an der Stolberggasse bleiben auch nach `schutz` 2 neue Fenster gezählt, obwohl die Schutzzone
fenster ok ist; vermutlich liegen sie außerhalb der Maske (Nachbar oder vom Baum verdeckter Teil), bitte im
Prüfbild `nk_ecke_golden_r6_schutz_ohne_autos.jpg` ansehen.

### 5. Sichtprüfung `ecke_golden_r6_schutz_ohne_autos.jpg` und Prüfbild
- Fenster scharf, Achsen und Gesimse sauber aus dem Render, Farbstimmung an das KI-Bild angeglichen (warmes
  Abendlicht, passt). Seilleuchte und Seile aus dem Render übernommen.
- **Passanten aus dem KI-Bild werden abgeschnitten**: Frau mit Tasche und Mann vor dem Erdgeschoss an der Ecke
  zeigen nur Beine, der Oberkörper ist durch Fassade ersetzt. Die Schutzmaske braucht eine Ausnahme für Dinge,
  die die KI vor das Gebäude stellt (Menschen, Radfahrer), sonst taugt das Ergebnis so nicht für den Vertrieb.
- **Platzhalter-Silhouetten als Umriss in der Fassade**: an der Ecke und links am Erdgeschoss sind die Umrisse der
  grauen Menschen-Platzhalter als Linien im Putz zu sehen (die Platzhalter-Pixel sind nicht geschützt, die
  Fassade dahinter fehlt im Render).
- **Naht am unteren Maskenrand**: waagrechte Kante auf Sockelhöhe im Erdgeschoss, darunter der Steinsockel aus dem
  KI-Bild, darüber der Render; der Sockel springt sichtbar.
- **Baum** (älterer Modellstand, erwartet): wo die KI-Krone über der Fassade lag, der Render-Baum aber kleiner ist,
  bleiben fleckige Reste (graue Flecken wie abgeplatzter Putz neben den Fenstern links der Krone, 1. und 2. OG
  Stolberggasse).
- Sonst keine Naht an den Maskenkanten zu Himmel und Dach sichtbar.

### 6. Grading (nachgeholt)
- Leitbilder laut `project.yaml` `look:` (05 Pazelhof, 13 Herbsthof, 39 Rahmung), per Google-Drive-Connector aus
  dem Ordner "Visualisierungen Datenbank" geladen, lokal unter `~/Documents/Claudius/immoviz/referenzen/wimmer/referenz/`
  (außerhalb des Repos, `IMMOVIZ_REFERENZ=~/Documents/Claudius/immoviz/referenzen`). Nicht eingecheckt.
- Befehl: `grading --bild ecke_golden_r6_schutz_ohne_autos.jpg --projekt immoviz/projects/wimmergasse-20 --maske
  ecke_golden_hour_ebenen/schutz.png`, Laufzeit 5,3 s.
- Abstand Lab-Mittel zum Leitbild 8,1 vorher, 1,54 nachher. Lab-Mittel L/a/b vorher 64,6 / 3,9 / 9,3, nachher
  56,2 / 3,2 / 8,3, Leitbilder 56,9 / 2,6 / 7,1.
- Sichtprüfung `ecke_golden_r6_schutz_ohne_autos_grading_pruefung.jpg`: deutlich gedämpfter, Himmel cremig statt
  rosa, Gelb der Fassade zurückgenommen, Vignette und Korn dezent; Geometrie unverändert. Wirkt etwas dunkler und
  flauer als das Ausgangsbild, passt aber zur Filmpalette der Leitbilder. Die Fehler aus Abschnitt 5 (abgeschnittene
  Passanten, Platzhalter-Umrisse, Naht am Sockel) bleiben natürlich sichtbar.

### 7. Nachbesserung Schutz-Kompositing (18.11.2026, Mac-Sitzung)
Befund aus der Sichtprüfung: abgeschnittene Personen, Umrisse der Platzhalter in der Fassade, Naht auf Autohöhe,
Flecken neben dem Baum. Ursachen und Änderungen (Code in `lib/ebenen.py`, `lib/kompositing.py`, `lib/build.py`):

| Fehler | Ursache | Änderung |
|---|---|---|
| Personen ohne Oberkörper | Schutzmaske ersetzt alles vor der Fassade | `vordergrund_finden`: KI-Flecken vor der Fassade, die am Boden stehen (Fußpunkt laut Tiefe mindestens 0,4 m vor der Fassadenbasis, höchstens 2,4 m hoch, eigener Fußpunkt je Teil), bleiben KI; Glas mit höherer Schwelle, dünne Strukturen fallen beim Öffnen weg; `--ohne-vordergrund` schaltet ab |
| Umrisse der Platzhalter, Naht auf Autohöhe | hinter Platzhaltern und Blender-Autos gibt es im Render keine Fassade, dort blieb KI | `render --ebenen` rendert zusätzlich `hintergrund/` (Platzhalter, Autos, Bäume vor dem Objekt ausgeblendet, nur im Ausschnitt, 96 Samples); `schutz` setzt dort die Fassade ein, Helligkeit lokal an das Hauptbild angeglichen |
| Flecken neben dem Baum | KI-Baum steht anders als der Blender-Baum; KI-Fassadenstücke in Blattform, KI-Laub färbte die Farbstatistik | `laub_finden`: Laubmodell (Lab, Struktur), Lücken zwischen den Blättern geschlossen, die ganze KI-Krone bleibt KI, Naht am Außenrand der Blätter; Farbstatistik ohne Ausreißer (dE über 20) |

Zeiten (Metal, M3 Max): Render mit Ebenen und Hintergrund 278 s gesamt (Hintergrund 64 s, 55 % Bildausschnitt
wegen des Baums), max. Speicher 5,7 GB; `schutz` 28 bis 32 s statt 15 s.

Kennzahlen neu (`--ohne autos`, Klammer: mit Autos): geschützt 24,8 % (28,1 %), Kanten-F1 Schutzbereich 0,807
auf 0,994 (0,773 auf 0,994), dE 24,1 auf 18,0; Hintergrund eingesetzt 7,6 % des Bildes (3,6 %), erhaltener
KI-Vordergrund 5,3 % (4,7 %), davon Laub 4,2 %. Nachkontrolle nachher: alle vier Schutzzonen ok (Fenster 0,974,
Leuchten 0,975, Geländer 0,983, Gebäude 0,961); Fenster Wimmergasse 58/59 (1 neu), Stolberggasse 39/42 (3 neu,
vorher 2): vermutlich KI-Fenster, die innerhalb der erhaltenen KI-Krone durch die Blätter zu sehen sind. Grading
danach: Abstand zum Leitbild 8,1 auf 1,45.

Sichtprüfung: Frau, Mann vor dem Erdgeschoss und Radfahrer vollständig, keine Umrisse der Platzhalter, keine Naht
auf Autohöhe, Krone als Ganzes aus der KI. Rest: links an der Krone ein schmaler heller Streifen neben einem
Fenster im 1. OG (Fassade aus dem Hintergrund-Durchgang neben verschatteter Fassade des Hauptbilds), nur in der
4k-Vergrößerung sichtbar; tritt auf, weil das KI-Bild aus einem älteren Modellstand mit anders stehendem Baum
stammt. Mit geschützten Autos (Standard) liegen die kantigen Blender-Autos über den KI-Autos; solange die Autos in
Blender Platzhalter sind, `--ohne autos` verwenden (Vorschlag: `schutz: {minus: [autos]}` in `project.yaml`).

Umgesetzt am 18.11.2026 auf Kundenwunsch ("realistische Autos verwenden"): `project.yaml` der Wimmergasse hat
`schutz: {minus: [autos]}` mit Begründung (REGELN V6), `schutz` braucht damit kein `--ohne autos` mehr (ab dem
nächsten `render --ebenen`; der Hintergrund-Durchgang liefert dann auch die Fassade hinter den Blender-Autos).
Der Baustein `umgebung` in `prompts.yaml` sagt der KI, dass die Autos in Bild 1 Platzhalter sind und als
realistische europäische Alltagsautos auf denselben Stellplätzen in derselben Ausrichtung erscheinen sollen.

