# Auftrag runde7_basis

Status: offen
Erstellt: 18.11.2026, Cloud-Sitzung
Erledigt:

## Ziel
Basisbilder Runde 7 in 4k mit Render-Ebenen (inklusive Hintergrund-Durchgang) für die Veredelung mit Schutzmaske
(REGELN.md V6). Neu gegenüber den Aufträgen vom 18.11.: Geländer der Wimmergasse nach Plan (VSG an den französischen
Fenstern, Stabgeländer an Loggien und Terrassen, Loggien Stolberggasse, Eckaufbau DG3; umgebung_abgleich.md 13),
Poller der Südwestecke trianguliert und Kamera `ecke` 1,2 m versetzt (umgebung_abgleich.md 14), Nachtlicht neu
(Leuchtkörper gedämpft, Lichtkegel 115 Grad, 3000 K). Keine Higgsfield-Credits.

## Befehle
```bash
git pull --rebase
pgrep -f immoviz.py || echo frei          # nur rendern, wenn nichts läuft; nie zwei Renders gleichzeitig

# 0. Prüfung vor dem Rendern (ohne Blender): Geländer grün, "Soll gegen Modell" ohne Abweichung
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/wimmergasse-20 | grep -E "Gelaender|Soll gegen|FEHLER"
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/noma-shg13 | grep -E "Gelaender|Soll gegen|FEHLER"

# 1. Wimmergasse ecke: golden_hour, herbst, blaue_stunde
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke --light golden_hour,herbst,blaue_stunde --res 3840x2560 --samples 256 --out r7_basis --no-blend --ebenen \
    2>&1 | tee /tmp/r7_wimmer_ecke.log

# 2. Wimmergasse ecke_erhoeht, eg_lokal, drohne: golden_hour
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke_erhoeht,eg_lokal,drohne --light golden_hour --res 3840x2560 --samples 256 --out r7_basis --no-blend --ebenen \
    2>&1 | tee /tmp/r7_wimmer_weitere.log

# 3. Noma top3_aussen_gruendach, top3_terrasse_garten: spaetsommer
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 \
    --cam top3_aussen_gruendach,top3_terrasse_garten --light spaetsommer --res 3840x2560 --samples 256 --out r7_basis --no-blend --ebenen \
    2>&1 | tee /tmp/r7_noma.log

# 4. JPG-Fassungen (PNG unter renders/ ist gitignored)
for f in immoviz/projects/*/renders/r7_basis/*_final.png; do
  .venv-immoviz/bin/python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1][:-4] + '.jpg', quality=92)" "$f"
done

# 5. Einchecken: JPGs, ebenen.json und die Ebenen-PNGs (gitignored, daher -f), ohne normalen.png (gross, nur Analyse)
git add immoviz/projects/*/renders/r7_basis/*.jpg immoviz/projects/*/renders/r7_basis/*_ebenen/ebenen.json \
    immoviz/projects/*/renders/r7_basis/*_ebenen/hintergrund/ebenen.json immoviz/auftraege/2026-11-19_runde7_basis.md
find immoviz/projects/*/renders/r7_basis -path '*_ebenen*' -name '*.png' ! -name 'normalen.png' -print0 | xargs -0 git add -f
du -sh immoviz/projects/*/renders/r7_basis          # Groesse melden; ueber 400 MB je Push: je Projekt eigener Commit
```

## Ausgabe
- `immoviz/projects/wimmergasse-20/renders/r7_basis/wimmergasse-20_<kamera>_<licht>_final.png` und `.jpg`
  (ecke golden_hour, herbst, blaue_stunde; ecke_erhoeht, eg_lokal, drohne golden_hour) und je Bild
  `<kamera>_<licht>_ebenen/` (Masken, schutz.png, tiefe.png, kanten.png, klassen.png, ebenen.json, hintergrund/)
- `immoviz/projects/noma-shg13/renders/r7_basis/noma-shg13_top3_aussen_gruendach_spaetsommer_final.*`,
  `noma-shg13_top3_terrasse_garten_spaetsommer_final.*` mit Ebenen
- Eingecheckt: JPGs, Ebenen (ohne normalen.png), diese Datei mit dem Ergebnis. Nichts aus renders/streetview, mood,
  Referenzordnern oder assets/texturen.

## Melden
Unter "Ergebnis" eintragen und pushen (`git pull --rebase` vorher):
1. Ergebnis von Schritt 0 (Ampel Geländer, Zahl der Abweichungen).
2. Je Aufruf `"sekunden"` gesamt, davon Ebenen und Hintergrund (`renders[i].ebenen.sekunden`), maximaler Speicher
   (`maximum resident set size`), Gerät.
3. Je Bild aus `ebenen.json`: `schutz_anteil_prozent`, Anteil `gelaender` und `leuchten`, `nicht_zugeordnet` (alles
   über 0,1 %).
4. Sichtprüfung kurz je Bild:
   - Wimmergasse Dachgeschosse: DG2 Wimmergasse acht französische Fenster mit Glasbrüstung in der Leibung (VSG, kein
     Rahmen außen), Loggia mit Stabgeländer, DG3 links Stabgeländer vor der Terrasse Top 35, rechts Eckaufbau mit
     vier Fenstertüren und Glas; Stolberggasse DG1/DG2 mit Eckfenstern, zwei Loggien mit Stäben, DG3-Eckaufbau bündig.
     Schwarze Flächen, Lücken an den Seitenwangen des Eckaufbaus, schwebende Teile?
   - `ecke`: kein Poller mehr am rechten Bildrand; Poller der Südwestecke außerhalb des Bildes; Einbahnschild nicht im
     Bild. Ausschnitt sonst wie Runde 6 (etwas näher).
   - `ecke blaue_stunde`: Lichtkegel der Seilleuchten auf Fahrbahn und Gehsteig sichtbar? Teller leuchtend, aber nicht
     ausgebrannt? Lichtfarbe warmweiß (3000 K)? Zu hell oder zu dunkel (Cloud-Vorschau 900 x 600 wirkte richtig)?
   - Noma: unverändert gegenüber assets_4k (nur Prüfung und Quellen geändert), Geländer G3/G4 an der Terrasse.
5. Probleme mit genauer Fehlermeldung.

## Ergebnis
(von der Mac-Sitzung auszufüllen)
