# Auftrag assets_test

Status: offen
Erstellt: 18.11.2026, Cloud-Sitzung
Erledigt:

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
(von der Mac-Sitzung auszufüllen)
