# Auftrag noma_terrassen_r10

Status: in Arbeit (mac-neu, 2026-11-22 22:30, Neustart 2)
Erstellt: 22.11.2026, cloud-neu
Erledigt:
**Start erst, wenn `mac-neu` den Auftrag `2026-11-19_ki_lokal_test.md` abgeschlossen hat** (dort `Status: erledigt`,
in `SITZUNGEN.md` unter "Laufend" keine `mac-`Kennung, `pgrep -f immoviz.py` leer). Vorher nicht anfangen.

## Ziel
Die 8 Terrassenbilder Top 3 und Top 4 (wie `2026-11-20_noma_terrassen.md`) in 4k mit Ebenen neu rendern, auf dem
korrigierten Modell (Korrekturplan vom 21.11., Freigabe des Nutzers 22.11.):
- Top 4: weiße Wand 0,69 m vor der Ostfassade entfernt (Innenhülle jetzt hart auf die Pavillonfläche begrenzt,
  `huelle_px` in wohnungen.yaml).
- Innenraum hinter der HST mit echten Möbeln nach Verkaufsplan (Sofa, Couchtisch, Sideboard, runder Esstisch mit vier
  Stühlen, Pendelleuchte), Terrassen mit echten Modellen (Outdoor-Sofa, Sessel, Tisch und Stühle, Olivenbaum,
  Efeu am Rankgitter, Gräser in den Trögen) statt Kugeln und Quadern.
- Vor jedem Bild prüft `lib/planbeleg.py` automatisch: keine Bauteile ohne Planbeleg im Bild, Innenhülle vollständig
  innerhalb der Wohnung, Wohnfläche des Modells gegen den Verkaufsplan (62,80 m2, Toleranz 6 %). Bei einem Fehler
  bricht der Render ab. **Dann nicht umgehen** (`IMMOVIZ_PLANBELEG=warnen` nur auf Rückfrage), sondern Fehler melden.

Danach veredelt cloud-neu mit Higgsfield (gpt_image_2_6 4k), Schutz voll (neue Schutzklassen in project.yaml
`schutz`), Grading, Nachkontrolle. Keine Higgsfield-Credits auf dem Mac.

## Neustart (cloud-neu, 22.11.2026 abends)
Behoben seit der ersten Probe:
- `netto_flaeche()` zieht jetzt die ausgeräumten Öffnungen ab (Diagnose mac-neu, danke). Erwartet rund 63,6 m2 gegen
  62,80 m2, also innerhalb der 6 %.
- Optik: Efeu wächst aus den Trögen am Gitter hoch (zwei Felder über den Trögen, frei neben der Wandleuchte), Tröge mit
  grünem Strauch statt brauner Gräser, Olivenkübel anthrazit statt orange, Outdoor-Teppich Top 3 dunkler.
- Terrassenmöbel neu (Nutzer: Teak, Polster hellgrau, High-End): `lounge_sofa`, `lounge_sessel`, `esstuhl_aussen`,
  `esstisch_aussen`, dazu `strauch_trog`, `strauch_klein`: **vor Schritt 2 noch einmal `modelle-laden` ausführen.**
Bitte Schritt 2 (Probe) komplett neu, dann Schritt 3. Start weiterhin erst, wenn keine andere Mac-Arbeit läuft.

## Neustart 2 (cloud-neu, 22.11.2026 abends, Freigabe des Nutzers: "bitte alles umsetzen")
Neu seit dem 4k-Lauf von 20:08: Teakmöbel als Modelle (`lounge_sofa`, `lounge_sessel`, `esstisch_aussen`, `esstuhl_aussen`),
Pergola und Rankgitter matt (`aus_holz` rough 0.8, ohne Klarlack), Tröge offen mit Rand und sichtbarer Erde, Erde im
Olivenkübel, HST-Glas der Innenhülle entspiegelt (`glas_entspiegelt`, IOR 1,12) damit der Raum bei Tag lesbar ist.
Ablauf: `modelle-laden`, Schritt 2 (Probe) und Schritt 3 (4k) komplett neu, Ausgabe wie gehabt nach `r10_probe/` und
`r10_terrassen/` (alte Fassung vorher nach `r10_terrassen_alt/` umbenennen, nicht löschen).

## Befehle
Aus dem Repo-Ordner, nacheinander, nie parallel. Zuerst in `SITZUNGEN.md` anmelden und hier `Status: in Arbeit
(<kennung>, <Datum Uhrzeit>)` setzen, pushen.

```bash
git pull --rebase
pgrep -f immoviz.py && echo "BELEGT: warten" || echo frei

# 1. Modelle laden (einmalig, rund 140 MB nach immoviz/assets/modelle/, gitignored; Poly Haven und BlenderKit ohne Konto)
.venv-immoviz/bin/python immoviz/immoviz.py modelle-laden

# 2. Vorprobe klein (rund 5 min): Planbeleg und Fläche je Kamera, ohne 4k. Erwartet: 0 Fehler in jedem
#    renders/r10_probe/planbeleg/*_planbeleg.md, Fläche Top 3 und Top 4 je rund 62 m2.
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/noma-shg13
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 --cam top3_terrasse_garten,top4_terrasse_garten,top3_pergola_detail,top4_pergola_detail --light spaetsommer --res 960x640 --samples 32 --out r10_probe --no-blend
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top03_terrasse --final --res 960x640 --samples 32 --out r10_probe
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top04_terrasse --final --res 960x640 --samples 32 --out r10_probe
grep -H "^Fehler\|FEHLER\|flaeche" immoviz/projects/noma-shg13/renders/r10_probe/planbeleg/*_planbeleg.md
```
Sichtprüfung der 8 Probebilder vor Schritt 3: Wand um die HST von Top 4 salbei (keine weiße Wand davor), Möbel im
Raum an der richtigen Wand (Sofa an der Ostwand rechts der HST, Küche an der Nordwand, Esstisch rund), Efeu am
Rankgitter, Olivenbaum im Kübel, keine schwebenden oder durch Wände ragenden Möbel. Bei Auffälligkeiten: Probebilder
und Planbeleg committen, hier unter "Ergebnis" beschreiben, **nicht** weiter mit Schritt 3.

```bash
# 3. 4k mit Ebenen (wie Runde 9: rund 1 h 50 min)
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/noma-shg13 --cam top3_terrasse_garten,top4_terrasse_garten,top3_pergola_detail,top4_pergola_detail --light spaetsommer --res 3840x2560 --samples 256 --out r10_terrassen --no-blend --ebenen
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top03_terrasse --final --res 3840x2560 --samples 256 --out r10_terrassen --ebenen
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/noma-shg13 --top top04_terrasse --final --res 3840x2560 --samples 256 --out r10_terrassen --ebenen
```

## Ausgabe
- `renders/r10_probe/`: 8 JPG-Fassungen der Probebilder, `planbeleg/` (json und md) einchecken.
- `renders/r10_terrassen/`: 8 Bilder 4k (JPG einchecken, PNG bleibt lokal), 8 Ebenen-Ordner ohne `normalen.png` mit
  `git add -f`, `planbeleg/`, Kontaktbogen der 8 JPGs als `r10_terrassen/kontaktbogen.jpg` (höchstens 7800 px hoch).
- Nichts aus `assets/modelle/` einchecken (Lizenz: Weitergabe der Modelldateien verboten, Repo öffentlich).

## Melden
- Zeiten je Bild, Gerät, max. Speicher; Ergebnis `modelle-laden` (alle 14 geladen?).
- Planbeleg je Kamera: Zahl der Fehler, Fläche Modell/Plan bei Top 3 und Top 4.
- `ebenen.json`: Anteile schutz, innenraum, stoffe, vegetation, ausstattung, nachbarn, nicht_zugeordnet.
- Sichtprüfung je Bild wie oben, dazu: Nachbarhäuser wie auf den Fotos vom 20.11., keine Leitern, Geländer nur laut Plan.

## Ergebnis
(mac-neu, 22.11.2026, nur Schritt 1 und 2; **kein 4k gerendert**)

1. `modelle-laden`: alle 14 Modelle geladen, 125 MB, 27 s. Gerät: Metal auf Apple M3 Max.
2. **Falsche Verkaufspläne auf dem Mac (wichtig).** Lokal lagen in `quellen/` andere Dateien als im Übergabe-ZIP:
   - `VP_Top04.pdf` lokal: Stand 04.03.2026 (GSPublisher 3405), **63,35 m2, Terrasse 19,85 m2**, ein Schlafzimmer,
     Küche mit Insel, TV an der Ostwand. ZIP-Fassung (GSPublisher 3560): **62,80 m2, Terrasse 15,45 m2**, zwei
     Schlafzimmer, runder Esstisch, Sofa an der Ostwand. `wohnungen.yaml` (corner_px, slab_px, huelle_px, Möbel,
     Titel) passt zur ZIP-Fassung.
   - In der alten Fassung liegt die Ostfassade bei Planpixel 4130. Genau dort fand die Wandsuche die "Wand" vor der
     Ostfassade. Mit hoher Wahrscheinlichkeit ist der falsche Plan die Ursache der weißen Wand und der zu großen Räume
     in Runde 9 (nicht nachgerendert, keine Gegenprobe). `huelle_px` bleibt als Schutz sinnvoll.
   - `VP_Top03.pdf`: gleicher Grundriss, kleine Textunterschiede (ein Maß 2,01 statt 1,76 m2).
   - Maßnahme: ZIP-Fassungen nach `quellen/` gelegt, alte Dateien unter `quellen/alt_2026-03-04/`, alte Plan-Bilder unter
     `data/plan_cache/alt_2026-03-04/` gesichert (alles lokal, gitignored).
   - Geklärt: der Nutzer hat am 2026-11-22 die ZIP-Fassung (62,80 m2) als gültigen Verkaufsplan von Top 4 bestätigt.
3. Außenkameras, 960 x 640, 32 Samples: **0 Planbeleg-Fehler** bei allen vier, 240 s gesamt (erster Lauf), 24,0 GB maximum resident.
4. Innenkameras `top03_terrasse` und `top04_terrasse`: **Abbruch, je 1 Fehler** (Planbeleg bricht vor dem ersten Bild ab,
   daher nur Kamera `hst` geprüft): Wohnfläche Modell 67,7 m2, Verkaufsplan 62,8 m2 (+8 %, erlaubt 6 %). Nicht umgangen.
   Je rund 80 s bis zum Abbruch, 19,8 GB maximum resident.
   Diagnose (nur gelesen): `netto_flaeche()` zählt die in `walls` ausgeräumten Öffnungen als freie Fläche mit. Summe der
   Öffnungen: Top 4 4,11 m2 (15 Öffnungen), Top 3 4,09 m2 (14). **Ohne Öffnungen 63,58 bzw. 63,64 m2, also +1,2 bzw.
   +1,3 %.** Vorschlag: Öffnungen in `netto_flaeche()` abziehen, Toleranz 6 % behalten. Mit der alten VP-Fassung wären
   68,7 m2 netto bzw. 65,4 m2 ohne Öffnungen herausgekommen (+4 %), der falsche Plan wäre also nicht aufgefallen.
   `pruefen --projekt` läuft mit Exit 1 (Ampel ROT wegen fehlender Quellenangaben bei Farben, Öffnungen und Stuck,
   Geländer- und Leuchtensoll ist erfüllt).
5. Sichtprüfung der 4 Außenprobebilder (960 x 640, JPG in `renders/r10_probe/`): keine weiße Wand, Wände salbei,
   Modelle vorhanden, nichts Schwebendes erkannt. Auffällig: Efeu hängt als Polster in der Wandmitte und ist nicht
   verwurzelt; die Gräser in den Trögen wirken wie braune Kugeln; der orange Olivenkübel dominiert; Top 3 Tisch und
   Teppich sehr hell. Nachbarhäuser nicht im Detail gegen die Fotos vom 20.11. verglichen. Innenraum von außen kaum zu
   sehen (dunkles Glas), die vier Innenmotive fehlen.
6. Nicht geprüft: Anteile `ebenen.json`, Schritt 3, Innenmotive.

Nächster Schritt: cloud-neu korrigiert die Flächenprüfung (oder gibt sie frei), dann Schritt 2 Innenkameras und Schritt 3 neu.

### Neustart (mac-neu, 22.11.2026 abends)
1. `modelle-laden`: rc 0, 16 Modelle, `strauch_trog` und `strauch_klein` neu geladen. Gerät Metal, M3 Max.
2. Probe 960 x 640: **alle 8 Kameras Planbeleg 0 Fehler**, Autoprüfung 233 Autos 0 Befunde (auch mit der geänderten
   `auf_boden_setzen()`). Fläche Modell/Plan: Top 3 63,64 / 62,80 m2, Top 4 63,58 / 62,80 m2 (je +1,3 %). Außen 268 s (4 Bilder),
   Top 3 183 s, Top 4 190 s, höchstens 19,4 GB resident. `pruefen` weiter Exit 1 (fehlende Quellen bei Farben), Geländer und Leuchten ok.
3. Sichtprüfung der Probe: Wand um die HST salbei, keine weiße Wand; Sideboard, runder Esstisch mit Stühlen, Pendelleuchte
   stehen; vom Sofa ist nur die Kante links im Bild zu sehen, die Küche liegt außerhalb des Bilds (Lage beider über den Planbeleg,
   0 Punkte außerhalb der Hülle, nicht über das Bild geprüft). Efeu wächst aus den Trögen, Olivenbaum im anthraziten Kübel,
   nichts schwebt. Hinweis: Olivenkrone liegt dicht an der Fassade. Abendbilder sind außerhalb der Leuchten sehr dunkel.
   Nachbarhäuser nicht im Detail gegen die Fotos vom 20.11. verglichen.
4. 4k mit Ebenen (3840x2560, 256 Samples), 20:08 bis 20:59, alle rc 0, **Planbeleg 8 x 0 Fehler**, 233 Autos 0 Befunde:

   | Lauf | Bilder | Zeit | max. resident | peak footprint |
   |---|---|---|---|---|
   | außen | 4 | 1472 s | 18,9 GB | 36,8 GB |
   | Top 3 HST und Abend | 2 | 779 s | 16,1 GB | 38,2 GB |
   | Top 4 HST und Abend | 2 | 793 s | 19,3 GB | 38,4 GB |

5. `ebenen.json` (Anteile in Prozent, `nicht_zugeordnet` überall leer):

   | Bild | schutz | innenraum | stoffe | vegetation | ausstattung | nachbarn |
   |---|---|---|---|---|---|---|
   | top3_terrasse_garten | 88,2 | 0 | 0,04 | 4,9 | 23,0 | 15,0 |
   | top4_terrasse_garten | 91,4 | 0 | 0 | 3,9 | 16,1 | 8,7 |
   | top3_pergola_detail | 82,4 | 0 | 0,07 | 17,1 | 40,8 | 16,3 |
   | top4_pergola_detail | 78,9 | 0 | 0 | 20,4 | 28,9 | 13,1 |
   | top03 hst und abend | 94,4 | 0 | 0,01 | 2,0 | 18,5 | 16,7 |
   | top04 hst und abend | 88,9 | 0 | 0 | 5,1 | 14,6 | 9,8 |

   **`innenraum` ist überall 0**: der Raum hinter der HST zählt als `fenster_glas` (14 bis 16 %), die Schutzklasse `innenraum`
   greift also nicht eigens. Bei geschütztem Glas ist der Raum mitgeschützt, sonst bitte prüfen. Der Schutz deckt 79 bis 94 %
   des Bilds, für die Veredelung bleibt wenig Fläche.
6. Sichtprüfung 4k: Wände salbei, keine weiße Wand, keine Leitern gesehen, Möbel und Pflanzen stehen. Hinweise:
   - Pergolaholz spiegelt zu stark: im Abendbild helle Rechtecke der beleuchteten Fenster auf Pfosten und Balken.
   - Pflanzkübel und Tröge sind geschlossene Körper ohne Erde, der Olivenstamm steht auf dem Deckel; Kübel sichtbar kantig.
   - Olivenkrone berührt fast die Fassade, dichte Kugelform. Efeublätter hängen alle nach unten.
   - In den Glasflächen spiegeln sich Sofa und Efeu kräftig (physikalisch richtig), der Raum ist bei Tag dadurch schwer lesbar.
   - Abendbilder abseits der Leuchten fast schwarz.
   - Geländer nur über `pruefen` (Soll gleich Ist) geprüft, Nachbarhäuser nicht im Detail gegen die Fotos vom 20.11.
7. Eingecheckt: 8 JPG, Kontaktbogen, Ebenen ohne `normalen.png`, Planbeleg. PNG der Bilder bleiben lokal. Lokale Pfade in den
   JSON entfernt. Keine Higgsfield-Credits.
8. **Überholt durch cddb7cf (20:21, während der 4k-Lauf seit 20:08 lief):** Probe und 4k zeigen noch `outdoor_sofa`,
   `outdoor_sessel`, `outdoor_tisch`, `outdoor_stuhl`, nicht die neuen Teakmöbel (`lounge_sofa`, `lounge_sessel`, `esstisch_aussen`,
   `esstuhl_aussen`). Während eines Renders wird hier nicht gepullt, deshalb erst danach gesehen. Alle 8 Motive zeigen
   Terrassenmöbel und müssen neu: `modelle-laden`, Probe, 4k (zusammen rund 1 h 10 min). Wände, Innenraum, Pflanzen und Planbeleg
   sind davon unabhängig geprüft.
