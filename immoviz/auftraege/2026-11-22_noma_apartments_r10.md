# Auftrag noma_apartments_r10

Status: offen
Erstellt: 22.11.2026, cloud-neu
Erledigt:

Start nach dem Terrassen-Neurender (`2026-11-22_noma_terrassen_r10.md`, Neustart 2), sobald keine andere Mac-Arbeit läuft (`SITZUNGEN.md` "Laufend", `pgrep -f immoviz.py`).
Der Terrassen-Neurender läuft im eigenen Auftrag.

## Ziel
Noma Apartments im neuen Ablauf (Runde 10): 4k-Renders mit Ebenen als Grundlage für die Veredelung `ki_verzogen` in der
Cloud. Erster Schritt: das Standardzimmer **APT. 06** (Typ Derenko Top 1 gespiegelt, unter Pavillon Top 3, Raumhöhe 3,14,
Fenster zum Gartenstreifen) in beiden Varianten, die der Kunde freigegeben hat (V1 Mappe 07.10., V2 Mappe 28.10.),
mit 7 neuen Ansichten bzw. Stimmungen je Variante (fenster_gegenlicht, eingang_tiefe, essplatz, bett_diagonal, gesamt_morgen,
gesamt_abend, bett_abend; in der Cloud als Probe geprüft, Planbeleg 0 Fehler). Zusammen 23 Kameras.
Die Apartments mit Gartenblick (Nordreihe zu den Höfen) und das Eckapartment mit der Stufe innen folgen, sobald die
Pläne (EIN S. 8, S. 15, S. 23 und Derenko) in der Cloud vorliegen und modelliert sind.

## Befehle
```bash
git pull --rebase
pgrep -f immoviz.py && echo "BELEGT: warten" || echo frei
# 1. Probe klein (Planbeleg je Kamera, Sichtprüfung)
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top apt06_v1,apt06_v2 --final --res 960x640 --samples 32 --out r10_apt_probe
# 2. 4k mit Ebenen (23 Kameras, rund 2,5 h; Reihenfolge: zuerst der Terrassen-Neurender aus noma_terrassen_r10)
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top apt06_v1,apt06_v2 --final --res 3840x2560 --samples 256 --out r10_apartments --ebenen
```

## Ausgabe
- `renders/r10_apt_probe/`: JPG der Probe, `planbeleg/`.
- `renders/r10_apartments/`: 23 Bilder 4k (JPG einchecken, PNG lokal), Ebenen ohne `normalen.png` mit `git add -f`,
  `planbeleg/`, Kontaktbogen `r10_apartments/kontaktbogen.jpg`.

## Melden
- Zeiten, Gerät, Speicher; Planbeleg je Kamera.
- Sichtprüfung: Raumhöhe 3,14 sichtbar plausibel, Küchenzeile 2,42 m ohne Schubladen unter dem Kochfeld, Bordeaux #5C1727,
  Fenster 1,60 x 1,50, keine Stuckleiste, Bad mit Fliesen; Bekannte Restfehler Runde 6 (Mikrowelle V1, Küchenreihenfolge und
  Garderobe V2, Lichtleiste und Fensterschimmer im Bad) prüfen und notieren.

## Ergebnis
(von der Mac-Sitzung auszufüllen)
