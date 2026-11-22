# Auftrag noma_terrassen_r10

Status: offen
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
(von der Mac-Sitzung auszufüllen)
