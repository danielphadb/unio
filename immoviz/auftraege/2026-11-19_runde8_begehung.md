# Auftrag runde8_begehung

Status: offen
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
(von der Mac-Sitzung auszufüllen)
