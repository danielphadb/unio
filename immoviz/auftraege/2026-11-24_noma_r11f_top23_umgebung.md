# Auftrag noma_r11f_top23_umgebung

Status: in Arbeit (mac-neu, 24.11.2026 21:58)
Nachtrag cloud-neu 24.11.2026 spät: wird durch `noma_r11g_triiiple_stimmung` ersetzt (Nutzer: TrIIIple falsch, mehr Stimmung). Wenn der Render noch nicht weit ist: abbrechen und direkt r11g beginnen (Top 23-2 ist dort Schritt 5). Sonst fertig rendern, melden und danach r11g.
Erstellt: 24.11.2026, cloud-neu
Erledigt:

Start erst nach der laufenden Street-View-Verfeinerung der Nachbarhäuser (mac-neu, `r11e_*`), damit auch diese im
Fensterblick stecken, und sobald keine andere Mac-Arbeit läuft (`SITZUNGEN.md` "Laufend", `pgrep -f immoviz.py`). Zuerst in `SITZUNGEN.md`
anmelden und hier `Status: in Arbeit (<kennung>, <Datum Uhrzeit>)` setzen, pushen.

## Ziel
Die drei Innenbilder von Penthaus Top 23-2 (`r11c_innen/`) wurden vor der Korrektur `noma_r11d_dachblick` gerendert. Durch
Dachfenster und HST sieht man noch das Kegeldach der ÖAMTC-Zentrale ("Pagode") und die Hochhäuser als glatte Kästen. Der
Nutzer will, dass die Umgebung stimmt. Neu rendern mit dem jetzigen Modell (ÖAMTC Flachdach, `hochhaeuser`-Fassaden,
Stephansdom-Helm, Nachbarhäuser nach Street View), gleiche Kameras und Einstellungen wie r11c, nichts sonst ändern. Top 26-2 nicht nötig (dort nur ferne
Türme, die Veredelung deckt das ab).

## Befehle
Aus dem Repo-Ordner, nacheinander, nie parallel.

```bash
git pull --rebase
pgrep -f immoviz.py && echo "BELEGT: warten" || echo frei

# 1. 4k mit Ebenen, nur Top 23-2 (3 Kameras, rund 1 h). Erwartet: Planbeleg 3 x 0
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top23_2 --final --res 3840x2560 --samples 256 --out r11f_innen --ebenen 2>&1 | tee /tmp/r11f.log

# 2. JPG-Fassungen
for f in immoviz/projects/noma-shg13/renders/r11f_innen/*_final.png; do
  .venv-immoviz/bin/python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1][:-4] + '.jpg', quality=92)" "$f"
done

# 3. Einchecken: JPGs, Planbeleg, Ebenen ohne normalen.png
git add immoviz/projects/noma-shg13/renders/r11f_innen/*.jpg immoviz/projects/noma-shg13/renders/r11f_innen/planbeleg
git add -f $(ls immoviz/projects/noma-shg13/renders/r11f_innen/*_ebenen/* | grep -v normalen.png)
```

## Melden
- Zeit, Speicher, Planbeleg je Kamera.
- Sichtprüfung: im Fensterausschnitt kein Kegeldach mehr, Hochhäuser mit Geschoss- und Glasbändern; Raum sonst wie r11c.

## Ergebnis
(von der Mac-Sitzung auszufüllen)
