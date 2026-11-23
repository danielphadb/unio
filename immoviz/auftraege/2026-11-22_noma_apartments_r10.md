# Auftrag noma_apartments_r10

Status: erledigt
Erstellt: 22.11.2026, cloud-neu
Erledigt: 23.11.2026, mac-neu

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
(mac-neu, 23.11.2026, Metal auf Apple M3 Max)

1. Probe 960 x 640, 32 Samples: 23 Kameras in 2345 s, 19,5 GB resident, 41,2 GB peak footprint, **Planbeleg 23 x 0 Fehler**, rc 0.
2. Sichtprüfung der Probe:
   - Fenster, Kochfeld ohne Laden darunter (V1 Drehtür neben der Garderobe, V2 drei Laden nur im Hochschrank), Küchenreihenfolge V1
     und V2, Mikrowelle und offene Garderobe wie `interior_v2.md` Abschnitt 5 und 6. Raumhöhe wirkt plausibel, Maße nicht am Bild gemessen.
   - **Farbstich:** alles stark orange. Bordeaux statt #5C1727 (Farbton 346) ziegelrot, V2 Bettwand RGB 99/18/0, Farbton 10,
     Blau auf 0; Wände rund 214/168/126. Wenn die Veredelung Farben vom Render übernimmt, kippt das Bordeaux.
   - **Stühle am Esstisch ohne Beine**, sie schweben als L-Form (Runde 6 ergänzte die KI die Beine). Bett, Bank, WC, Waschtisch als Blöcke.
   - **Bad:** Wände ohne Fliesenfugen, Duschwand ohne Beschläge; Waschtisch und WC unten angeschnitten (Runde 6 zeigte sie ganz).
   - V1 `gesamt` und `essplatz`: Fensterausblick fast weiß, Spiegelung der Pendel im Glas.
   - Lichtband entlang der Wand zum Fenster (V1 und V2 `kueche`, `fenster_gegenlicht`, oben links): bitte prüfen, ob Vorhangleiste
     oder die gestrichene Stuckleiste. Im Bad keine Lichtleiste und kein Fensterschimmer mehr zu sehen.
   - V2 `kueche_fliesen`: Fliesenspiegel als glatte rote Fläche ohne Fugen.
   - Kein Abbruchgrund, weil die Veredelung in Runde 6 Möbel und Farben aus demselben Blockmodell geholt hat.
3. 4k 3840 x 2560, 256 Samples, `--ebenen`: 23 Kameras in 10819 s (3 h 0 min, 00:12 bis 03:12), Metal GPU, 19,2 GB resident,
   38,4 GB peak footprint, rc 0. **Planbeleg 23 x 0 Fehler, 0 Hinweise** (`r10_apartments/planbeleg/`).
4. Ebenen: 23 Ordner, Schutz 100 %, `nicht_zugeordnet` leer, je rund 4 s. `normalen.png` nicht eingecheckt (Regel), PNG der
   Endbilder lokal, eingecheckt sind die JPG (q92) und `r10_apartments/kontaktbogen.jpg`.
5. Sichtprüfung 4k: Bild wie die Probe, nur rauschfrei; alle Hinweise aus Punkt 2 gelten weiter (Orangestich, Bordeaux
   ziegelrot, Stühle ohne Beine, Bad und V2-Fliesenspiegel ohne Fugen, Lichtband zum Fenster). Bad: Decke und Wandband bordeaux
   wie `wohnungen.yaml` [INT S. 10, 15], kein Fehler. Abendbilder (`*_abend`) sind innen fast so hell wie die Tagbilder, nur das
   Fenster ist dunkel. Keine Stuckleiste als Profil sichtbar.
6. Keine Credits verbraucht.
