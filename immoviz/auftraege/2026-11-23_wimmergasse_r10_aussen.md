# Auftrag wimmergasse_r10_aussen

Status: in Arbeit (mac-neu, 2026-11-23 20:17)
Erstellt: 23.11.2026, cloud-neu
Erledigt:

Start, sobald keine andere Mac-Arbeit läuft (`SITZUNGEN.md` "Laufend", `pgrep -f immoviz.py`). Zuerst in `SITZUNGEN.md`
anmelden und hier `Status: in Arbeit (<kennung>, <Datum Uhrzeit>)` setzen, pushen.

## Ziel
Wimmergasse auf den Stand von Noma Runde 10 bringen (Nutzer 23.11.: "bitte mit allem starten"). Die 6 Außenbilder aus
Runde 7 (ecke golden_hour, herbst, blaue_stunde; ecke_erhoeht, eg_lokal, drohne golden_hour) werden neu veredelt, im
Modus `ki_verzogen` (KI-Bild bleibt, nur ausgerichtet; Prüfung über das Kantenbild). Grundlage ist das korrigierte Modell
vom 22.11. (Gelände glatt, Schilder, Beet, `eg_lokal` versetzt).
- ecke, ecke_erhoeht, eg_lokal golden_hour liegen schon in `renders/r8_kreuzung/` (4k mit Ebenen). cloud-neu veredelt sie
  bereits; hier nur die Planbeleg-Prüfung nachholen (Schritt 1, klein).
- ecke herbst, ecke blaue_stunde und drohne golden_hour fehlen auf dem neuen Modell: 4k mit Ebenen (Schritt 2).

Vor jedem Bild prüft `lib/planbeleg.py` automatisch (REGELN P10). Bei einem Fehler bricht der Render ab: **nicht umgehen**
(`IMMOVIZ_PLANBELEG=warnen` nur auf Rückfrage), sondern hier melden und Status Problem setzen.

## Befehle
Aus dem Repo-Ordner, nacheinander, nie parallel.

```bash
git pull --rebase
pgrep -f immoviz.py && echo "BELEGT: warten" || echo frei

# 1. Probe klein mit Planbeleg für alle 6 Bilder (rund 10 min). Erwartet: 0 Fehler je renders/r10_probe/planbeleg/*.md
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke --light golden_hour,herbst,blaue_stunde --res 960x640 --samples 32 --out r10_probe --no-blend
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke_erhoeht,eg_lokal,drohne --light golden_hour --res 960x640 --samples 32 --out r10_probe --no-blend
grep -H "Fehler\|FEHLER" immoviz/projects/wimmergasse-20/renders/r10_probe/planbeleg/*.md

# 2. 4k mit Ebenen für die drei fehlenden Bilder (rund 1 h)
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam ecke --light herbst,blaue_stunde --res 3840x2560 --samples 256 --out r10_aussen --no-blend --ebenen \
    2>&1 | tee /tmp/r10_wimmer_ecke.log
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 \
    --cam drohne --light golden_hour --res 3840x2560 --samples 256 --out r10_aussen --no-blend --ebenen \
    2>&1 | tee /tmp/r10_wimmer_drohne.log

# 3. JPG-Fassungen (PNG unter renders/ ist gitignored)
for f in immoviz/projects/wimmergasse-20/renders/r10_aussen/*_final.png; do
  .venv-immoviz/bin/python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1][:-4] + '.jpg', quality=92)" "$f"
done

# 4. Für die Innenräume (nächster Auftrag): welche Plan-PDFs liegen lokal? Nur Dateinamen melden, nichts einchecken.
ls -la immoviz/projects/wimmergasse-20/quellen/ immoviz/projects/wimmergasse-20/data/plan_cache/ 2>&1

# 5. Einchecken: JPGs, Ebenen ohne normalen.png (git add -f), Planbeleg der Probe
git add immoviz/projects/wimmergasse-20/renders/r10_probe/*.jpg immoviz/projects/wimmergasse-20/renders/r10_probe/planbeleg
git add immoviz/projects/wimmergasse-20/renders/r10_aussen/*.jpg immoviz/projects/wimmergasse-20/renders/r10_aussen/planbeleg
git add -f $(ls immoviz/projects/wimmergasse-20/renders/r10_aussen/*_ebenen/* | grep -v normalen.png)
# Nachtrag: von r8_kreuzung (22.11.) ist nur ebenen.json eingecheckt, die Masken fehlen in der Cloud. Bitte nachreichen:
git add -f $(ls immoviz/projects/wimmergasse-20/renders/r8_kreuzung/*_ebenen/* | grep -v normalen.png)
```
**Schritt 5 bitte gleich zu Beginn ausführen (nur die r8_kreuzung-Zeile) und pushen**, dann kann cloud-neu die drei
schon veredelten Bilder prüfen, während der Mac rendert.

## Melden
- Zeiten, Gerät, Speicher; Planbeleg je Kamera (Probe und 4k).
- Sichtprüfung: Gelände an der Kreuzung ohne Stufen, Schilder, Beet; Drohne: Dachausbau und Nachbarn wie Runde 7.
- Schritt 4: Liste der lokalen Plan-PDFs Wimmergasse (Mappe 24.04., Nutzwertgutachten, Verkaufspläne Top 7, 12, 35).

## Ergebnis
(von der Mac-Sitzung auszufüllen)
