# Auftrag assets_test

Status: erledigt
Erstellt: 18.11.2026, Cloud-Sitzung
Erledigt: 18.11.2026, Mac-Sitzung

## Ziel
Die neue Objekt- und Materialbibliothek (README, Abschnitt "Objekt- und Materialbibliothek": natürliche Bäume je Art,
Autos mit Karosserie, Wiener Straßenleuchten aus dem Inventar, Straßenmöbel, Menschen-Platzhalter, Putz mit Schmutz
und Bevel, Asphalt mit Flickstellen, Interior Mapping hinter den Fenstern) in Endauflösung auf Metal prüfen. Danach
entscheidet die Cloud-Sitzung über Dichte der Kronen, Lichtstärken und ob die Mac-Renders künftig mit Texturen laufen.
Keine Higgsfield-Credits.

## Befehle
```bash
git pull --rebase
pgrep -f immoviz.py || echo frei          # nur rendern, wenn nichts läuft

# 0. Optionale CC0-Texturen laden (Poly Haven, rund 30 MB nach immoviz/assets/texturen/, gitignored)
.venv-immoviz/bin/python immoviz/immoviz.py texturen

# 1. Wimmergasse 20, Kamera ecke, golden_hour und herbst in 4k (Zeit messen)
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke --light golden_hour,herbst --res 3840x2560 --samples 256 --out assets_4k --no-blend \
    2>&1 | tee /tmp/assets_4k_wimmer.log

# 2. Noma, Außenkamera top3_aussen_gruendach, spaetsommer in 4k
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 \
    --cam top3_aussen_gruendach --light spaetsommer --res 3840x2560 --samples 256 --out assets_4k --no-blend \
    2>&1 | tee /tmp/assets_4k_noma.log

# 3. Nachtprobe Leuchten (klein reicht): Straßenleuchten an, Fenster beleuchtet
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke --light blaue_stunde --res 1920x1280 --samples 128 --out assets_4k --no-blend

# 4. JPG-Fassungen zum Einchecken (PNG unter renders/ ist gitignored)
for f in immoviz/projects/*/renders/assets_4k/*_final.png; do
  .venv-immoviz/bin/python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1][:-4] + '.jpg', quality=90)" "$f"
done
```

Die Platzhalter-Menschen sind im Bild (graue Silhouetten, nur für die KI). Eine Fassung ohne sie entsteht mit
`IMMOVIZ_MENSCHEN=aus` vor dem Render-Befehl; für diesen Test nicht nötig.

## Ausgabe
- `immoviz/projects/wimmergasse-20/renders/assets_4k/wimmergasse-20_ecke_golden_hour_final.png` und `.jpg`
- `immoviz/projects/wimmergasse-20/renders/assets_4k/wimmergasse-20_ecke_herbst_final.png` und `.jpg`
- `immoviz/projects/wimmergasse-20/renders/assets_4k/wimmergasse-20_ecke_blaue_stunde_final.png` und `.jpg`
- `immoviz/projects/noma-shg13/renders/assets_4k/noma-shg13_top3_aussen_gruendach_spaetsommer_final.png` und `.jpg`
Einchecken: nur die JPGs und diese Datei mit dem Ergebnis. Nichts aus `immoviz/assets/texturen/` einchecken.

## Melden
Unter "Ergebnis" eintragen und pushen:
1. Renderzeit je Bild (`"sekunden"` der Render-Ausgabe), maximaler Speicher (`maximum resident set size` aus
   `/usr/bin/time -l`), Gerät; ob die Texturen geladen waren (Schritt 0 ohne Fehler).
2. Sichtprüfung je Bild, kurz: Bäume (natürlich, zu licht oder zu dicht, Herbstfarben), Autos (Form, Farben, Räder),
   Seilleuchte über der Kreuzung (Teller, Seile, Wandhaken), Poller und Zeichen, Putz (Körnung, Schmutz unter Gesimsen
   und Fensterbänken, Kanten), Asphalt und Gehsteig (Flickstellen, Wiederholungsmuster sichtbar?), Fenster
   (Innenräume, Vorhänge, keine schwarzen Flächen), Nachtbild (Leuchten an, Lichtkegel, Fenster beleuchtet).
3. Auffälligkeiten mit Bildausschnitt-Beschreibung (z. B. "Baum rechts: Blätter flimmern", "Rauschen in den Kronen bei
   256 Samples"), Fehlermeldungen wörtlich.

## Ergebnis

Gerät bei allen Bildern: Metal, Apple M3 Max (GPU, 30 Kerne), Blender 5.2.4 LTS. Schritt 0 ohne Fehler: 9 Dateien
(asphalt_02, concrete_pavement_02, white_stucco je diff, rough, nor in 2k, zusammen 28 MB) in `immoviz/assets/texturen/`,
`texturen.dateien()` findet alle drei Sätze. Das Render-Log meldet die Texturen nicht ausdrücklich. Kein Rauschen bei
256 Samples (OpenImageDenoise), keine Fehlermeldungen in den Logs.

### 1. Zeiten und Speicher

| Bild | "sekunden" | Bild gespeichert nach | max. Speicher (RSS) |
|---|---|---|---|
| Wimmergasse ecke golden_hour + herbst, 3840 x 2560, 256 Samples (ein Aufruf) | 556 | golden_hour 5:07 min (mit Szenenaufbau), herbst 4:10 min danach | 4,16 GB |
| Noma top3_aussen_gruendach spaetsommer, 3840 x 2560, 256 Samples | 358 | 5:58 min | 3,72 GB |
| Wimmergasse ecke blaue_stunde, 1920 x 1280, 128 Samples | 61 | 1:01 min | 4,16 GB |

Vergleich: derselbe Blick ohne neue Bibliothek (Testrender vom 18.11. vormittags) brauchte 219 s, mit Bibliothek
ohne Ebenen rund 307 s für das erste Bild (inklusive Szenenaufbau) bzw. 250 s für das zweite Licht. Der
Ebenen-Lauf (Auftrag ebenen_test) brauchte für dasselbe Bild 232 s gesamt; der erste Lauf mit den neuen Materialien
war also vermutlich durch das einmalige Übersetzen der Metal-Kernel länger.

### 2. Sichtprüfung

**Wimmergasse ecke golden_hour**
- Bäume: natürlich, Stamm und Äste sichtbar, Krone weder zu licht noch zu dicht. Blätter als runde Scheiben, die
  aus der Nähe (4k, Baum rechts vor der Fassade Stolberggasse) zu groß wirken, wie Münzen.
- Autos: als Autos erkennbar, Farben gemischt (rot, schwarz, silber, weiß, blau), Räder rund, Felgen als flache
  graue Scheiben. Kantig mit sichtbaren Flächen (Low-Poly). Auffällig: die Seitenscheiben des roten Autos links
  sind lila statt gläsern; die Heckflächen des schwarzen und des silbernen Autos rechts an der Ecke sind kupfer bis
  beige statt in Karosseriefarbe; das schwarze Auto rechts wirkt sehr lang (wie eine Stretchlimousine, eventuell
  zwei Autos ineinander).
- Seilleuchte über der Kreuzung: Teller und Seile da, Rand des Tellers in 4k sichtbar facettiert (rund 16
  Segmente). Zweite Leuchte rechts hinten ebenfalls am Seil. Wandhaken im Bild nicht zu erkennen.
- Poller und Zeichen: Poller grün mit weißen Ringen, Fahrverbotsschild rund, beides stimmig.
- Putz: sehr glatt, Körnung kaum sichtbar, Schmutz unter Gesimsen und Fensterbänken nicht erkennbar. Kanten
  scharf, Bevel kaum zu sehen.
- Asphalt und Gehsteig: Risse sichtbar, Flickstellen im Kreuzungsbereich nicht erkennbar. Im Mittelgrund des
  Asphalts (Kreuzung, flacher Blickwinkel) feine waagrechte Streifen (Moiré). Gehsteig körnig, keine Wiederholung
  zu sehen.
- Fenster: keine schwarzen Flächen. Interior Mapping im Erdgeschoss gut (warme Räume, Tiefe), oben Spiegelung
  und Innenraum gemischt. Vorhänge nicht eindeutig zu erkennen.
- Menschen-Platzhalter: graue Figur an der Ecke vor dem Erdgeschoss, wie beschrieben.

**Wimmergasse ecke herbst**: wie oben; Herbstfarben orange bis rostrot, natürlich, etwas einheitlich. Licht
heller und wärmer, Fassade leicht ausgebleicht.

**Noma top3_aussen_gruendach spaetsommer**: Baum im Hof natürlich. Das Gründach im Vordergrund ist eine flache
einheitlich grüne Fläche ohne Struktur (Pflanzen, Substrat). Kleiner kugelförmiger Strauch hinter dem Geländer
wirkt wie ein Platzhalter. Geländerschatten auf dem Dach sauber.

**Wimmergasse ecke blaue_stunde (Nacht)**: Seilleuchten an (Teller hell, auch hinten links und rechts). Ein
Lichtkegel auf der Fahrbahn ist praktisch nicht zu sehen, die Kreuzung bleibt sehr dunkel. Fenster beleuchtet,
fast alle gleich hell und gleich warmweiß (wirkt einheitlich). Bäume als dunkle Silhouette.

### 3. Auffälligkeiten
- Autos: lila Seitenscheiben (rotes Auto links), kupferfarbene Heckflächen (Autos rechts an der Ecke),
  überlanges schwarzes Auto rechts.
- Baum rechts: Blätter in 4k zu groß.
- Asphalt Mittelgrund: waagrechte Streifen.
- Putz: Schmutz und Körnung kaum sichtbar.
- Nacht: kein sichtbarer Lichtkegel der Seilleuchten auf dem Boden.
- Noma: Gründach ohne Struktur.
Fehlermeldungen: keine.
