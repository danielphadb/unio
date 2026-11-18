# Auftrag ebenen_test

Status: offen
Erstellt: 18.11.2026, Cloud-Sitzung
Erledigt:

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
(von der Mac-Sitzung auszufüllen)
