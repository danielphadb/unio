# Auftrag runde7_basis

Status: erledigt
Erstellt: 18.11.2026, Cloud-Sitzung
Erledigt: 18.11.2026, Mac-Sitzung

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

Gerät: Metal, Apple M3 Max (GPU, 30 Kerne), Blender 5.2.4 LTS. Neu seit dem Auftrag (Mac-Sitzung, 18.11.): die Szene
enthält die 16 realistischen Automodelle (lib/assets/autos_bibliothek.py), jeder `render` prüft sie vorher
(`autos-pruefen`, Abbruch bei Befund) und schreibt je Kamera `<kamera>_<licht>_autos_bogen.jpg`.

### 1. Schritt 0
- Wimmergasse: Geländer 13 Elemente grün; "Soll gegen Modell" 20 Zeilen, 0 Abweichungen (Geländer Wimmergasse Soll 17
  Ist 17, Stolberggasse Soll 11 Ist 11). Gesamtampel ROT (wie bisher: 30 Elemente ohne Quelle, v. a.
  Nachbarfassaden 25, Farben 4, Stuck 1), deshalb Exit 1.
- Noma: Geländer 65 Elemente grün; "Soll gegen Modell" 21 Zeilen, 0 Abweichungen. Gesamtampel ROT (7 ohne Quelle,
  Farben aus Hof_fin bzw. Apple 9 unter Mindestrang).
- `autos-pruefen`: Wimmergasse 580 Autos, Noma 233 Autos, je 0 Befunde (Räder ±3 cm, Neigung, Bucht,
  Überschneidungen, Hindernisse, Maßstab). Erster Lauf brach die Noma ab (Audi A7 bei 38/244 schwebte 63 cm: dort
  liegt die Fahrbahn bis 0,7 m unter dem groben Geländemodell, der Bodenstrahl fiel aufs Gelände zurück); behoben,
  der Strahl sucht jetzt die Bodenfläche bis 2 m unter dem Gelände und lässt die Bucht sonst frei. Die Wimmergasse-
  Bilder entstanden noch mit der Fassung davor (ebenfalls 0 Befunde, 578 Autos).

### 2. Zeiten und Speicher
| Aufruf | Bilder | "sekunden" gesamt | Ebenen je Bild | Hintergrund je Bild (Ausschnitt) | max. Speicher |
|---|---|---|---|---|---|
| Wimmergasse ecke | golden_hour, herbst, blaue_stunde | 1126 | 5,8 / 5,1 / 4,9 s | 74 / 75 / 84 s (62 %) | 20,6 GB |
| Wimmergasse weitere | ecke_erhoeht, eg_lokal, drohne | 1310 | 5,7 / 4,9 / 4,4 s | 94 (100 %) / 120 (100 %) / 192 s (13 %) | 21,3 GB |
| Noma | top3_aussen_gruendach, top3_terrasse_garten | 745 | 4,7 / 4,2 s | 30 / 25 s (17 %) | 16,4 GB |

Rund 6 bis 7 Minuten je 4k-Bild mit 256 Samples, Ebenen und Hintergrund-Durchgang.

### 3. ebenen.json
| Bild | schutz % | gelaender % | leuchten % | autos % | nicht_zugeordnet |
|---|---|---|---|---|---|
| ecke golden_hour | 28,37 | 1,30 | 0,58 | 3,80 | leer |
| ecke herbst | 28,54 | 1,30 | 0,58 | 3,80 | leer |
| ecke blaue_stunde | 28,54 | 1,30 | 0,58 | 3,80 | leer |
| ecke_erhoeht golden_hour | 31,87 | 1,61 | 0,54 | 5,09 | leer |
| eg_lokal golden_hour | 70,53 | 0,00 | 0,01 | 4,04 | leer |
| drohne golden_hour | 14,02 | 0,54 | 0,04 | 0,93 | leer |
| Noma top3_aussen_gruendach | 79,20 | **0,00** | 0,00 | 0,00 | leer |
| Noma top3_terrasse_garten | 79,84 | **0,00** | 0,00 | 0,00 | leer |

Befund Noma: die Geländer (im Bild deutlich, G3/G4 an der Terrasse) landen in `gebaeude_objekt`, nicht in
`gelaender`; geschützt sind sie damit, aber die Geländer-Kennzahl und die Schutzzone "gelaender" der Nachkontrolle
greifen bei der Noma nicht. Vermutlich passen die Objekt- und Materialnamen der `neubau`-Geländer nicht auf die Regel
in `lib/ebenen.py` (`gelaender|railing|handlauf|bruestung`).

### 4. Sichtprüfung
- Wimmergasse Dachgeschosse (ecke_erhoeht, ecke): französische Fenster mit Glasbrüstung in der Leibung, Loggia
  mit Stabgeländer, DG3 links Stabgeländer vor der Terrasse, rechts Eckaufbau mit vier Fenstern je Geschoss und Glas;
  Stolberggasse zwei Loggien mit Stäben. Keine schwarzen Flächen, nichts Schwebendes. Am linken Ende des
  Eckaufbaus steht eine dunkle Seitenwange über die Dachfläche hinaus (ecke_erhoeht, über der Loggia DG3 links):
  bitte gegen den Plan prüfen, ob sie so hoch sein soll.
- ecke: **am rechten Bildrand steht noch ein Poller** (grün-weiß, an der Gehsteignase rechts unten, neben dem
  blauen Mercedes AMG GT). Einbahnschild nicht im Bild; das runde Fahrverbotsschild an der Ecke ist da.
  Asphalt im Vordergrund rechts mit feinen waagrechten Streifen (Moiré der Asphalttextur bei flachem Blick).
- ecke blaue_stunde: Teller leuchtend, warmweiß, nicht ausgebrannt (Rand facettiert). Fahrbahn und Gehsteig
  gleichmäßig warm beleuchtet, einzelne Lichtkegel kaum abgegrenzt; Gesamteindruck eher orange als 3000 K neutral,
  Fassade gut lesbar. Fenster beleuchtet.
- Noma: unverändert gegenüber assets_4k, Geländer G3/G4 an der Terrasse vorhanden (siehe Befund Ebenen).
- Autos: in allen Wimmergasse-Bildern auf der Fahrbahn, Prüfbögen `*_autos_bogen.jpg` ohne Auffälligkeit (ecke 7,
  ecke_erhoeht und ecke herbst/blaue_stunde je Bild die sichtbaren Autos; drohne und eg_lokal ohne Bogen, dort keine
  Räder im Bild bzw. Autos über 70 m). Noma: keine Autos im Bild.

### 5. Probleme
- Erster Noma-Lauf: "Autopruefung nicht bestanden, Render abgebrochen: Audi A7 55 TFSI bei 38.05/244.46: schwebt bis
  63 cm" (behoben, siehe 1). Sonst keine Fehler.
