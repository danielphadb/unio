# Auftrag noma_r11_penthaus_top24_25

Status: in Arbeit (mac-neu, 2026-11-24 11:26)
Erstellt: 24.11.2026, cloud-neu
Erledigt:

Start, sobald keine andere Mac-Arbeit läuft (`SITZUNGEN.md` "Laufend", `pgrep -f immoviz.py`). Zuerst in `SITZUNGEN.md`
anmelden und hier `Status: in Arbeit (<kennung>, <Datum Uhrzeit>)` setzen, pushen.

## Ziel
Nutzer 24.11.2026: "für die noma Penthäuser und auch die wohnungen 24 / 25 (hier Wohnzimmer und terrasse) renderings".
Die Planungsmappe (EIN, 30 S.) liegt seit heute in der Cloud; daraus neu bzw. neu vermessen (Vektor, 1:100, Lage im
Projektsystem auf 5 cm geprüft):
- **Top 24 und Top 25** (1. DG Straßenhaus hofseitig, FOK +18,94, RH 2,52): Wohnküche mit Schräge an der Hofwand (RH-Linien
  2,10/2,50, Nischen über Fenster und HST), Möbel nach EIN S. 12, Balkon/Terrasse mit Loungesesseln und Olivenbaum.
  Öffnungen sind Löcher in der Innenhülle, Rahmen und Glas kommen aus der Hoffassade.
- **Penthaus Top 26-2** (2. DG) neu vermessen: Wand zu Bad/Zimmer lag 0,47 m zu weit innen, Tür zum Gang lag im Liftschacht,
  Trennwand 0,13 m versetzt, Sofa verkehrt herum; jetzt echte Möbelmodelle statt Platzhalter.
- **Penthaus Top 23-2** (2. DG) neu, Aufbau wie Top 26-2 gespiegelt (Dachflächenfenster, Kniestock, Treppe aufs Dach [ANN]).
- **Dachterrassen 26-3 und 23-3**: Loungemöbel, Esstisch (23-3), Olivenbäume im Kübel; neue Kamera `dachterrasse_23`.
- Code: `lib/interior.py` ManualApartment liest optional `flaechen` (freie Flächen, hier die Schräge mit Nischen).
- Modell: Baukörper Straßenhaus (Block bis +21,00) als eigene Gruppe `nb_shg_koerper`; die Innenbilder im 1. DG blenden ihn
  aus (Oberseite lag 0,46 unter der Decke). Terrassenbilder als eigene Einträge `top24_terrasse`, `top25_terrasse`.
- **Runde 11b** (Nutzer 24.11.2026, gleicher Tag: "high end designer Küche mit Steinplatte und designer Möbel, terrasse richtig
  gemütlich, Whirlpool besser zu sehen, ggf outdoor Küche, Blick Richtung Hofseite, Kamera maximal weit außen"):
  Küchen mit Steinplatte 6 cm, Wasserfall-Wange, Steinrückwand, Hochschrank, grifflosen Fronten und flächenbündigem Kochfeld;
  Designer-Lounge-Sessel, runder Couchtisch, Bogenleuchte, Zimmerpflanze, Wollteppich, Barhocker, Pendel über der Insel.
  Dachterrasse 23-3 mit Whirlpool (Teakverkleidung, Wasser, Stufe) in der Erweiterung zum Hof, Outdoor-Küche mit Einbaugrill,
  Tafel für sechs, Lounge mit Feuertisch; 26-3 Lounge mit Feuertisch und Tafel für vier; Balkone mit Teppich, Sesseln,
  Beistelltisch und Pflanzen. Dachkameras in die äußersten Ecken, neue Kamera `dachterrasse_23_hof` (Blick zum Hof).
  **Neue Modelle zuerst laden** (Schritt 0), sonst bricht der Aufbau ab.

In der Cloud gerendert (Probe 600 x 400, 8 Samples, Planbeleg): siehe Abschnitt "Cloud-Probe". Vor jedem Bild prüft
`lib/planbeleg.py`; bei einem Fehler **nicht umgehen**, sondern hier melden und Status Problem setzen.

## Befehle
Aus dem Repo-Ordner, nacheinander, nie parallel.

```bash
git pull --rebase
pgrep -f immoviz.py && echo "BELEGT: warten" || echo frei

# 0. Neue Modelle laden (Runde 11b, Poly Haven und BlenderKit, gitignored)
.venv-immoviz/bin/python immoviz/immoviz.py modelle-laden --nur lounge_designer,couchtisch_rund,zimmerpflanze,zimmerpflanze_klein,grill_einbau,barhocker,stehleuchte_bogen

# 1. Probe klein mit Planbeleg (14 Innen- und 5 Außenbilder, rund 25 min). Erwartet: 0 Fehler je planbeleg/*.md
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top24,top24_terrasse,top25,top25_terrasse,top26_2,top23_2 --final --res 960x640 --samples 32 --out r11_probe
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 --cam dachterrasse_stadt,dachterrasse_hof,dachterrasse_23,dachterrasse_23_hof --light golden_hour --res 960x640 --samples 32 --out r11_probe --no-blend
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 --cam dachterrasse_stadt --light blaue_stunde --res 960x640 --samples 32 --out r11_probe --no-blend
grep -H "Fehler\|FEHLER" immoviz/projects/noma-shg13/renders/r11_probe/planbeleg/*.md

# 2. 4k mit Ebenen (rund 3 h)
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top24,top24_terrasse,top25,top25_terrasse,top26_2,top23_2 --final --res 3840x2560 --samples 256 --out r11_innen --ebenen 2>&1 | tee /tmp/r11_innen.log
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 --cam dachterrasse_stadt,dachterrasse_hof,dachterrasse_23,dachterrasse_23_hof --light golden_hour --res 3840x2560 --samples 256 --out r11_dach --no-blend --ebenen 2>&1 | tee /tmp/r11_dach.log
/usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 --cam dachterrasse_stadt --light blaue_stunde --res 3840x2560 --samples 256 --out r11_dach --no-blend --ebenen 2>&1 | tee -a /tmp/r11_dach.log

# 3. JPG-Fassungen (PNG unter renders/ ist gitignored)
for f in immoviz/projects/noma-shg13/renders/r11_probe/*.png immoviz/projects/noma-shg13/renders/r11_innen/*_final.png immoviz/projects/noma-shg13/renders/r11_dach/*_final.png; do
  .venv-immoviz/bin/python -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1][:-4] + '.jpg', quality=92)" "$f"
done

# 4. Einchecken: JPGs, Planbeleg, Ebenen ohne normalen.png (git add -f)
git add immoviz/projects/noma-shg13/renders/r11_probe/*.jpg immoviz/projects/noma-shg13/renders/r11_probe/planbeleg
git add immoviz/projects/noma-shg13/renders/r11_innen/*.jpg immoviz/projects/noma-shg13/renders/r11_innen/planbeleg
git add immoviz/projects/noma-shg13/renders/r11_dach/*.jpg immoviz/projects/noma-shg13/renders/r11_dach/planbeleg
git add -f $(ls immoviz/projects/noma-shg13/renders/r11_innen/*_ebenen/* immoviz/projects/noma-shg13/renders/r11_dach/*_ebenen/* | grep -v normalen.png)
```

## Melden
- Zeiten, Gerät, Speicher; Planbeleg je Kamera (Probe und 4k).
- Sichtprüfung Top 24/25: Schräge an der Hofwand mit Nischen sauber (keine Spalten, kein Licht durch Kanten), HST und
  Fenster mit Rahmen und Glas aus der Fassade, kein doppeltes Glas; Balkon mit Sesseln und Olivenbaum; Abendbild mit Innenlicht.
- Penthäuser: Licht durch die Dachflächenfenster, Treppeneinhausung, Küche an der Feuermauer, Sofa mit Lehne zur Schräge.
- Dachterrassen: Möbel stehen auf dem Belag, nichts schwebt, Olivenbaum im Kübel; Whirlpool mit Wasserfläche gut sichtbar
  (`dachterrasse_23_hof`), Outdoor-Küche mit Grill.
- Küchen: Steinplatte und Wasserfall-Wange sichtbar, keine Lücken zwischen Fronten, Platte und Wange.

## Cloud-Probe
(cloud-neu, 24.11.2026, CPU 4 Kerne, 600 x 400, 8 Samples, `--out r11_cloudprobe`, nicht eingecheckt)
- 14 Innenkameras und 3 Dachterrassen: **Planbeleg 17 x 0 Fehler** (nach zwei Korrekturen: Trennwand Top 23-2 ragte 0,34 m aus
  der Hülle; Baukörper-Oberseite +21,00 als dunkle Decke im 1. DG, jetzt Gruppe `nb_shg_koerper` ausgeblendet).
- Sichtprüfung: Top 24/25 Schräge mit Nischen sauber, HST und Fenster mit Fassadenrahmen, Möbel in Planlage, Balkon mit
  Sesseln und Olivenbaum, Abendbild mit Innenlicht. Penthäuser: Licht durch die Dachflächenfenster, Kameras so gesetzt, dass
  die Treppeneinhausung [ANN] die HST nicht verdeckt; Einhausung bis x 7,10 bzw. 13,30 verlängert (die Wange des
  Dacheinschnitts stand sonst als dunkles Dreieck im Raum). Dachterrassen: Möbel und Kübel stehen auf dem Belag.
- Erwartung 4k: Penthäuser innen eher dunkel und warm (Belichtung jetzt 2,0); Orangestich wie bei APT. 06 korrigiert die Veredelung.

Runde 11b (cloud-neu, 24.11.2026, `--out r11b_cloudprobe`, 600 x 400): 14 Innen- und 4 Dachkameras, **Planbeleg 18 x 0 Fehler**.
Küchen mit Steinplatte, Wasserfall-Wange und dunklen bzw. cremefarbenen Fronten sichtbar; Designer-Lounge-Sessel, runde
Couchtische, Bogenleuchten, Pflanzen. 23-3: Esstisch aus der Sichtachse genommen, damit `dachterrasse_23_hof` den Whirlpool
mittig zeigt (Kamera in der äußersten Ecke an der Straßenseite, Blick diagonal über die ganze Terrasse zum Hof).

## Ergebnis
(von der Mac-Sitzung auszufüllen)
