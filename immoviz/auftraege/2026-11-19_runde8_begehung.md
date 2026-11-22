# Auftrag runde8_begehung

Status: erledigt (mac-neu, 2026-11-22; Auffälligkeiten unter Ergebnis Punkt 4 und 5)
Erstellt: 18.11.2026, Cloud-Sitzung

## Ziel
Kundenkritik 18.11.2026 (Einfahrt Wimmergasse Nord an der Objektecke: "weder Zebrastreifen noch harte Kante") ist über
die neue virtuelle Begehung (`immoviz.py begehung`, Regel U11) behoben: Gehsteigüberfahrt mit Rampen, Poller dunkelgrün
mit rot-weißen Ringen auf dem OGD-Bordstein, Leitlinien, Radpiktogramme, Parkmarkierung, Zeichen, Betonplatten auf den
Vorziehungen (Details `projects/wimmergasse-20/begehung.md`). Die Straßenkameras in 4k mit Ebenen neu rendern, damit die
Veredelung auf dem begangenen Modell aufsetzt. Keine Higgsfield-Credits.

## Befehle
```bash
git pull --rebase
pgrep -f immoviz.py || echo frei          # nur rendern, wenn nichts läuft; nie zwei Renders gleichzeitig

# 1. OGD-Straßenausstattung ist eingecheckt (data/strassen_ogd.json); Prüfung ohne Blender
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/wimmergasse-20 | grep -E "Strassenmoebel|Soll gegen"

# 2. Straßenkameras 4k mit Ebenen (golden_hour)
for cam in ecke ecke_erhoeht eg_lokal; do
  /usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
      --cam $cam --light golden_hour --res 3840x2560 --samples 256 --out r8_begehung --no-blend --ebenen \
      2>&1 | tee /tmp/r8_$cam.log
done

# 3. JPG-Fassungen (PNG unter renders/ ist gitignored)
for f in immoviz/projects/wimmergasse-20/renders/r8_begehung/*_final.png; do
  .venv-immoviz/bin/python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1][:-4] + '.jpg', quality=92)" "$f"
done

# 4. Optional, wenn ein Schlüssel in der Mac-Sitzung vorliegt (nur als Umgebungsvariable, nie in Dateien):
#    ganze Begehung auf der GPU nachrechnen (Fotos werden geladen, Bögen bleiben lokal und gitignored)
# GOOGLE_MAPS_API_KEY=... .venv-immoviz/bin/python immoviz/immoviz.py begehung --projekt immoviz/projects/wimmergasse-20

# 5. Einchecken: JPGs, Ebenen-JSON, Bericht und Karte der Begehung (keine Street-View-Bilder)
git add immoviz/projects/wimmergasse-20/renders/r8_begehung/*.jpg immoviz/projects/wimmergasse-20/renders/r8_begehung/*_ebenen/ebenen.json
git add immoviz/projects/wimmergasse-20/renders/check/begehung_auto.md immoviz/projects/wimmergasse-20/renders/check/begehung_karte.jpg
```

## Ausgabe
`renders/r8_begehung/wimmergasse-20_<kamera>_golden_hour_final.jpg` plus Ebenen; bei Schritt 4 neue
`renders/check/begehung_auto.md` und `begehung_karte.jpg`.

## Melden
Zeiten je Kamera, Gerät, Auffälligkeiten an der Kreuzung (Überfahrt, Rampen, Markierungen, Poller, Zeichen, Motorräder),
Fehlermeldungen wörtlich.

## Ergebnis
(mac-neu, 22.11.2026; Schritte 1 bis 5 erledigt, Gerät Metal auf Apple M3 Max, keine Higgsfield-Credits)

1. Schritt 1: Strassenmoebel 36/36 grün, Soll gegen Modell 0 Abweichungen.
2. Schritt 2, erster Versuch 16:30: alle drei Kameras abgebrochen. Wörtlich: `Autopruefung nicht bestanden, Render
   abgebrochen (renders/check/autos_pruefung.md): Ferrari Dodici Cilindri bei -13.61/140.87: schwebt bis 7 cm`.
   Bemerkt erst um 17:54 (Warteskript prüfte nur auf das Ende).
   - Messwerte der Räder -0,7 / 7,0 / 0,7 / -0,7 cm. Ursache: `auf_boden_setzen()` maß den Boden an den Radpunkten ohne
     Neigung, `pruefen()` an den geneigten Punkten; das Rad stand auf einer Kante.
   - Korrektur (Freigabe des Nutzers, `lib/assets/autos_bibliothek.py`): Boden zusätzlich an den geneigten Radpunkten
     messen, Grenze 3 cm unverändert. Danach 582 Autos, **0 Befunde**. Gegen den Lauf davor hat sich nur der Ferrari
     geändert (0,25 m in der Bucht verschoben). Prüfung nicht abgeschaltet. Bei Noma nicht getestet.
   - Die `renders/check/autos_*` Dateien dieser Läufe sind nicht eingecheckt.
3. Schritt 2, zweiter Versuch (3840x2560, 256 Samples, mit Ebenen), alle rc=0, Planbeleg je 0 Fehler:

   | Kamera | Zeit gesamt | max. resident | peak footprint | Schutzanteil |
   |---|---|---|---|---|
   | ecke | 507 s | 13,6 GB | 44,1 GB | 28,5 % |
   | ecke_erhoeht | 479 s | 17,3 GB | 43,5 GB | 32,3 % |
   | eg_lokal | 621 s | 16,2 GB | 43,1 GB | 75,0 % |

   `nicht_zugeordnet` bei allen leer. `eg_lokal` hat keinen Autobogen (nur `ecke` und `ecke_erhoeht`).
4. Sichtprüfung der Kreuzung (4k und Modellansichten WI11, ST13 gegen Street View):
   - In Ordnung: Überfahrt mit Plateau und Rampenstreifen, Poller mit rot-weißen Ringen, Leitlinien, Parkmarkierung,
     Mistkübel, Motorräder in der ersten Bucht (als grobe Platzhalter, in `eg_lokal` groß im Bild).
   - **Stufe im Parkstreifen Wimmergasse Ost** (`ecke`, vor dem weißen BMW): dunkle Bordsteinkante zwischen Fahrbahn und
     Schrägparkplatz, in Street View nicht zu sehen.
   - **Gehsteig an der Objektecke** (`eg_lokal`, rechts): Stufe mit dunklem, senkrecht gestreiftem Band zwischen
     Vorziehung und Gehsteig Stolberggasse (die schwarze Kante aus r7_basis), in Street View niveaugleich.
   - Bordstein der NW-Vorziehung ausgefranst (`ecke` unten links).
   - Stoppschilder: Rückseite rot statt grau, mit Flächenflimmern; in `eg_lokal` auch am Rand von Einfahrt verboten.
   - `eg_lokal`: Schild mit Steher und ein Menschen-Platzhalter stehen mitten vor dem Lokal, die Schilder sind
     angeschnitten. Kamera oder Platzhalter prüfen.
   - ST13: gestreifte, verzerrte Asphalttextur im Kreuzungsbereich (in `ecke` nicht aufgefallen).
   - NW-Vorziehung (WI11 links): bepflanztes Beet um den Baum fehlt, drei Poller im Foto gegen zwei sichtbare im Modell,
     Platten im Modell heller und größer.
   - WI11 vorn: Richtungspfeil hinter dem Radpiktogramm fehlt, Piktogramm sitzt einige Meter weiter nördlich als im Foto.
   - ST13: Straßeneinlauf rund 2 m neben der Lage im Foto (Street View selbst bis 1,5 m ungenau).
   - Schwarze senkrechte Fugen zwischen Nachbarhäusern der Wimmergasse (`ecke`, `ecke_erhoeht`).
   - `ecke_erhoeht`: große, eckige Blätter im Bild oben links.
5. Schritt 4 (Begehung mit Schlüssel des Nutzers, nur als Umgebungsvariable): 376 Fotos einmal geladen, 47 Standorte,
   1432 s gesamt, davon Modell 362 s, peak footprint 44,1 GB. Verschiebung [0.324, 0.003] wie im eingecheckten Bericht,
   lokal nachgetragen (`kalibrierung.json`, gitignored). Ausgabe mit Zusatz `_mac`, damit der geprüfte Bericht erhalten bleibt:
   `renders/check/begehung_auto_mac.md`, `begehung_karte_mac.jpg`.

   | | hoch | mittel | niedrig |
   |---|---|---|---|
   | eingecheckt (19.11.) | 230 | 1295 | 585 |
   | Mac (22.11.) | 216 | 950 | 555 |
   | nur die 37 lagegleichen Standorte, eingecheckt / Mac | 157 / 132 | 1012 / 695 | 447 / 439 |

   Kreuzung (WI09 bis WI12, ST13) "hoch": 32 / 30. Zehn Standorte (ST01 bis ST04, ST21 bis ST23, WI02 bis WI04) liegen
   0,5 bis 8 m anders. Nicht untersucht, warum "mittel" so viel niedriger ist (anderes Gerät, andere Standorte, neueres Modell).
   Keine Street-View-Bilder eingecheckt.
6. `ebenen.json`: Pfad `beauty` im eingecheckten Stand relativ zum Repo (lokal absolut).
7. **Nachtrag 22.11. abends: Kreuzung korrigiert (Auftrag des Nutzers), neue Basis für die Veredelung ist
   `renders/r8_kreuzung/`, `r8_begehung/` ist überholt.**
   - Ursache der Stufen: `contour_terrain()` springt, wo die zweitnächste Höhenstufe wechselt (43 cm an der Objektecke), und
     war je 2-m-Kachel konstant. Neu `smooth_terrain()` (TIN, geglättet) und Boden im 2-m-Raster vernetzt, Schalter
     `site.gelaende: glatt` (nur Wimmergasse, Noma unverändert). Kote Objektecke 0,77 (Plan 0,79, vorher 0,60), Nachbar
     Nr. 22 0,03 (Plan 0,00). Bodenflächen im Umkreis 60 m: Parkstreifen und Pflaster höchstens 0,8 cm neben Soll (vorher bis 55 cm).
   - Damit erledigt: Stufe Parkstreifen, Gehsteigstufe Objektecke, ausgefranster Bordstein NW, gestreifter Asphalt
     (Untergrundraster ohne UV stieß durch), Motorradbucht vom Gehsteig überdeckt. Innenhof 1 cm über die Gehsteigfläche gehoben.
   - `_zeichen()`: Rückseite 4 mm versetzt (grau, kein Flimmern). Neues Element `beet`, NW-Beet in der FMZK-Lücke.
   - `eg_lokal` neu: [-2.6, -4.6], Brennweite 24 (vorher [-5.0, -6.5], 30); ein Menschen-Platzhalter auf [-3.9, -0.5].
   - Erneute Begehung nur der Kreuzung (`begehung_auto_kreuzung.md`, vorhandene Fotos): "hoch" 25 (vorher 30).
   - Gilt für alle Kameras der Wimmergasse, ältere Renders passen am Boden nicht mehr pixelgenau. Probe `drohne` 0 Fehler,
     übrige Kameras nicht neu gerendert.

   | Kamera (4k, Ebenen) | Zeit | max. resident | Schutzanteil | Autos / Befunde | Planbeleg |
   |---|---|---|---|---|---|
   | ecke | 495 s | 19,5 GB | 28,5 % | 612 / 0 | 0 Fehler |
   | ecke_erhoeht | 479 s | 13,6 GB | 32,2 % | 612 / 0 | 0 Fehler |
   | eg_lokal | 539 s | 13,7 GB | 63,2 % | 612 / 0 | 0 Fehler |

   Offen: Plattenfarbe und Format der Vorziehungen, Radpiktogramm mit Pfeil (WI11), Straßeneinlauf, vierter Poller NW laut
   Street View (Modell drei), Beet SW nicht geprüft, schwarze Fugen zwischen Nachbarhäusern, große Blätter in `ecke_erhoeht`.
