# Auftrag wimmergasse_r10_aussen

Status: erledigt
Erstellt: 23.11.2026, cloud-neu
Erledigt: 23.11.2026, mac-neu

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
(mac-neu, 23.11.2026, Metal GPU auf Apple M3 Max, 36 GB)

1. Schritt 5 vorgezogen (b577ad0): Masken und Planbeleg von `r8_kreuzung/` nachgereicht, je Kamera auch `hintergrund/`
   (zweiter Durchgang ohne Platzhalter, Autos, Bäume davor), ohne `normalen.png`.
2. Probe 960 x 640, 32 Samples: ecke 3 Lichter 278 s, ecke_erhoeht/eg_lokal/drohne 399 s; 17,9 GB resident, 43,6 GB peak.
   **Planbeleg 0 Fehler**: ecke 52, ecke_erhoeht 52, eg_lokal 30, drohne 77 sichtbare Objekte (`r10_probe/planbeleg/`).
3. 4k 3840 x 2560, 256 Samples, `--ebenen`: ecke herbst + blaue_stunde 846 s, drohne golden_hour 437 s (zusammen 21 min);
   20,3 GB resident, 43,6 GB peak, rc 0. **Planbeleg ecke 52 x 0, drohne 77 x 0.** Autoprüfung je Lauf 612 Autos, 0 Befunde.
   Ebenen: Schutz ecke 28,7 %, drohne 13,9 %, `nicht_zugeordnet` leer. Eingecheckt: JPG q92, Ebenen ohne `normalen.png`,
   Planbeleg; PNG lokal.
4. Sichtprüfung: Gelände an der Kreuzung glatt, keine Stufen, Gehsteigkanten durchgehend; Schilder (Fahrverbot, Vorrang geben)
   und Poller stehen. Beet NW liegt außerhalb dieser Bildausschnitte. Drohne: Dachausbau und Nachbarn wie Runde 7. Blaue Stunde
   sehr dunkel, Straße unter den Leuchten stark orange; Herbst mit orangem Baum, sonst wie golden_hour.
5. Lokale Plan-PDFs Wimmergasse (nur Dateinamen, nichts eingecheckt):
   - im Repo `quellen/`: `06_Wimmerg_Strassenansicht.pdf`, `260706_Nwga_Wimmergasse_20_01_inkl_Beilagen.pdf`
     (`data/plan_cache/` gibt es nicht).
   - auf dem Mac unter Downloads/Wimmergasse: `20260424_Mappe_Wimmerg20.pdf`, `20260410_Mappe_Wimmerg.20.pdf`,
     `260706 Nwga Wimmergasse 20_01 inkl. Beilagen .pdf`, `06_Wimmerg_Straßenansicht.pdf`, `20251107-08_TOP 2-Lokal.pdf`,
     `20251108-09_TOP 4-Lokal.pdf`, `260722 Das_Wimmer_Produktkatalog_reduziert.pdf`.
   - Verkaufsplan Top 7: `Wimmer20_Top07_1OG_Rahmen_richtig_2026-11-12.pdf` (nur als Mail-Anhang in Outlook), außerdem
     `Verkaufsplan-das-wimmer.pdf` (Masterlayout, mehrere Kopien in Downloads).
   - **Nicht gefunden:** Verkaufspläne Top 12 und Top 35, Mappe 30.04., EIN-Pläne 07.05.2025.
6. Keine Credits verbraucht.
