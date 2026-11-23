# Auftrag runde7_korrektur

Status: erledigt (überholt, mac-neu, 23.11.2026 auf Wunsch des Nutzers; nicht gerendert)
Erstellt: 18.11.2026, Cloud-Sitzung

## Ziel
Die Befunde aus den 4k-Bildern von `runde7_basis` sind im Modell behoben (Details: `projects/wimmergasse-20/
umgebung_abgleich.md` Abschnitt 15). Neu rendern in 4k mit Ebenen, damit die Veredelung auf korrigierten Basisbildern
aufsetzt. Keine Higgsfield-Credits.

Was sich geändert hat:
1. Noma: Geländer der `neubau`-Gruppen liegen jetzt in eigenen Objekten `<gruppe>_gelaender` (lib/neubau.py), die
   Render-Ebenen ordnen sie der Klasse `gelaender` zu (Cloud-Test 600 x 400: `gelaender` 1,05 %, vorher 0,00 %).
2. Wimmergasse `ecke`: Blick 1,5 Grad nach links (Ziel 5,43/7,47 statt 6,0/7,0). Der Poller am rechten Rand war der
   Poller -1,47/-13,06 der Südostnase (Lage am Bordstein laut OGD, Street View bestätigt Poller an dieser Nase); er
   stand angeschnitten am Bildrand und liegt jetzt außerhalb.
3. Asphalt (Fahrbahn, Gehsteig, Parkstreifen): Feinstruktur (Korn, Foto-Textur, Normal Map, Relief, Risse) wird mit
   Abstand und flachem Blickwinkel ausgeblendet (lib/materials.py `detail_faktor`), gegen die waagrechten Streifen.
4. Wimmergasse DG3: Einschnitt Terrasse Top 35 nach Straßenansicht und GR DG3 (u 17,26 bis 20,00, Fensterwand d 2,76,
   Oberkante z 23,46, darüber läuft die Dachfläche durch); die dunkle Wange über der Dachfläche ist weg. Eckaufbau
   0,5 m höher (Oberkante +53,91 WrN laut Straßenansicht, z 24,78).
5. Autos: Klassenverteilung (Alltag 70 %, SUV/Van 20 %, Oberklasse inklusive Sportwagen 10 %), Sportwagen nicht
   näher als 15 m an einer Straßenkamera; 8 neue kostenlose Alltagsmodelle in `lib/assets/autos_bibliothek.yaml`.

## Befehle
```bash
git pull --rebase
pgrep -f immoviz.py || echo frei          # nur rendern, wenn nichts läuft; nie zwei Renders gleichzeitig

# 1. Neue Automodelle laden (nur fehlende, kostenlos, ohne Konto) und die Bibliothek mit ALLEN Modellen neu bauen
#    (`autos-bibliothek` ohne --nur, sonst enthält die Bibliothek nur die genannten Modelle)
.venv-immoviz/bin/python immoviz/immoviz.py autos-laden 2>&1 | tee /tmp/r7k_autos_laden.log
.venv-immoviz/bin/python immoviz/immoviz.py autos-bibliothek 2>&1 | tee /tmp/r7k_autos_bibliothek.log

# 2. Prüfung ohne Blender: Geländer grün, "Soll gegen Modell" ohne Abweichung
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/wimmergasse-20 | grep -E "Gelaender|Soll gegen|FEHLER"
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/noma-shg13 | grep -E "Gelaender|Soll gegen|FEHLER"

# 3. Wimmergasse ecke golden_hour
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke --light golden_hour --res 3840x2560 --samples 256 --out r7_korrektur --no-blend --ebenen \
    2>&1 | tee /tmp/r7k_wimmer_ecke.log

# 4. Wimmergasse ecke_erhoeht golden_hour
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke_erhoeht --light golden_hour --res 3840x2560 --samples 256 --out r7_korrektur --no-blend --ebenen \
    2>&1 | tee /tmp/r7k_wimmer_erhoeht.log

# 5. Noma top3_terrasse_garten spaetsommer
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 \
    --cam top3_terrasse_garten --light spaetsommer --res 3840x2560 --samples 256 --out r7_korrektur --no-blend --ebenen \
    2>&1 | tee /tmp/r7k_noma.log

# 6. JPG-Fassungen (PNG unter renders/ ist gitignored)
for f in immoviz/projects/*/renders/r7_korrektur/*_final.png; do
  .venv-immoviz/bin/python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1][:-4] + '.jpg', quality=92)" "$f"
done

# 7. Einchecken: JPGs, Prüfbögen, ebenen.json und die Ebenen-PNGs (gitignored, daher -f), ohne normalen.png
git add immoviz/projects/*/renders/r7_korrektur/*.jpg immoviz/projects/*/renders/r7_korrektur/*_ebenen/ebenen.json \
    immoviz/projects/*/renders/r7_korrektur/*_ebenen/hintergrund/ebenen.json immoviz/auftraege/2026-11-19_runde7_korrektur.md
find immoviz/projects/*/renders/r7_korrektur -path '*_ebenen*' -name '*.png' ! -name 'normalen.png' -print0 | xargs -0 git add -f
du -sh immoviz/projects/*/renders/r7_korrektur      # Groesse melden; ueber 400 MB je Push: je Projekt eigener Commit
```

## Ausgabe
- `immoviz/projects/wimmergasse-20/renders/r7_korrektur/wimmergasse-20_ecke_golden_hour_final.png` und `.jpg`,
  `wimmergasse-20_ecke_erhoeht_golden_hour_final.*`, je Bild `<kamera>_<licht>_ebenen/` und `_autos_bogen.jpg`
- `immoviz/projects/noma-shg13/renders/r7_korrektur/noma-shg13_top3_terrasse_garten_spaetsommer_final.*` mit Ebenen
- Eingecheckt: JPGs, Prüfbögen, Ebenen (ohne normalen.png), diese Datei mit dem Ergebnis. Keine Modelldateien
  (immoviz/assets/autos ist gitignored), nichts aus renders/streetview, mood, Referenzordnern oder assets/texturen.

## Melden
Unter "Ergebnis" eintragen und pushen (`git pull --rebase` vorher):
1. `autos-laden`: Status je neuem Modell (geladen, vorhanden, nicht gefunden, kostenpflichtig) und MB;
   `autos-bibliothek`: je neuem Modell `vorne`, `lack` (Namensregel oder Liste), `masse_m`, Fehler. Auffällige
   Modelle (falsche Front, Lack nicht erkannt, Logo sichtbar) mit Namen nennen, nicht von Hand reparieren.
2. Schritt 2: Ampel Geländer, Zahl der Abweichungen "Soll gegen Modell".
3. Je Aufruf `"sekunden"` gesamt, davon Ebenen und Hintergrund, maximaler Speicher, Gerät; `autos-pruefen` Befunde.
4. Je Bild aus `ebenen.json`: `schutz_anteil_prozent`, Anteil `gelaender`, `leuchten`, `autos`, `nicht_zugeordnet`.
   Erwartung Noma top3_terrasse_garten: `gelaender` deutlich über 0 (Cloud-Vorschau 1,05 %).
5. Sichtprüfung kurz je Bild:
   - `ecke`: kein Poller am rechten Bildrand (die Gehsteignase rechts unten bleibt), links nichts Neues angeschnitten.
     Asphalt im Vordergrund ohne waagrechte Streifen? Körnung im Nahbereich noch sichtbar, weiter hinten ruhig?
   - `ecke_erhoeht`: DG3 links vom Eckaufbau: Terrasse als Einschnitt in der Dachfläche, über den Fenstern läuft das
     Dach durch, keine dunkle Wange über der Dachfläche. Eckaufbau mit Attika etwas höher als der First daneben.
     Schwarze Flächen, Lücken oder schwebende Teile?
   - Autos (beide Wimmergasse-Bilder): überwiegend Alltagsautos (Mittelklasse, Kompakt, SUV), kein Sportwagen im
     Vordergrund; Modelle mit falscher Ausrichtung oder fehlenden Rädern nennen (Prüfbogen).
   - Noma: Geländer G3/G4 an der Terrasse unverändert sichtbar, in `klassen.png` magenta (Klasse gelaender).
6. Probleme mit genauer Fehlermeldung.

## Ergebnis
(mac-neu, 23.11.2026) Nicht ausgeführt, überholt. Der Nutzer hat am 23.11.2026 bestätigt, den Auftrag zu schließen. Die
Modellkorrekturen sind in späteren Ständen enthalten: Basis der Wimmergasse ist seit 22.11.2026 `renders/r8_kreuzung/`
(Gelände glatt, Kreuzung ohne Stufen, Auftrag `runde8_begehung` Ergebnis Punkt 7), die übrigen Außenbilder kamen mit
`2026-11-23_wimmergasse_r10_aussen.md` (`renders/r10_aussen/`). Keine Credits.
