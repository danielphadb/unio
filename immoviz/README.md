# immoviz: Immobilien-Visualisierung aus Plänen

Werkzeug von UNIO und Ad Boutique, das aus Bauplänen, Stadtdaten, Blender und Higgsfield
maßhaltige, atmosphärische High-End-Visualisierungen für den Immobilienvertrieb erzeugt.

**Grundprinzip:** Blender liefert die Wahrheit (Geometrie, Kamera, Sonnenstand, Materialzonen),
Higgsfield liefert das Finish (Fotorealismus, Atmosphäre, Video). Damit stimmen Fensterachsen,
Geschosse und Dachkanten mit den Plänen überein, was reine KI-Bilder nicht leisten.

## Stufen

| Stufe | Inhalt | Werkzeug | Stand |
|---|---|---|---|
| 0 Intake | Pläne, Ansichten, BAB, Farbkonzept, Mood sammeln, Quellen in `quellen/` dokumentieren | Checkliste unten | aktiv |
| 1 Umgebung | Gebäudeblöcke, Straßen, Gehsteige, Bäume aus Stadt Wien Open Data, echte Dachflächen aus dem Dachmodell LOD2, Straßenausstattung (Überfahrten, Absenkungen, Abstellanlagen, Markierungen) | `immoviz.py geo`, `immoviz.py daecher`, Prüfung mit `immoviz.py strasse` und der virtuellen Begehung `immoviz.py begehung` | fertig |
| 2 Objekt außen | Fassaden, Fensterachsen, Gesimse, Dachgeschoss-Kubatur aus `project.yaml` | `lib/build.py` | fertig, wird je Objekt verfeinert |
| 3 Licht und Kamera | Sonnenstand nach Datum und Uhrzeit, Kamerasets mit stürzenden Linien korrigiert | `project.yaml` | fertig |
| 4 Rendering | Cycles, AgX-Farbmanagement, Vorschau und Final | `immoviz.py render` | fertig |
| 5 Veredelung | Fotorealismus, Bäume, Leben, Upscaling, Kamerafahrten | Higgsfield, siehe `higgsfield/LEITFADEN.md` | aktiv |
| 6 Innenräume | Grundriss zu Raum, Möblierung (Staging), Materialien aus BAB | `immoviz.py interior`, siehe `projects/<objekt>/WOHNUNGEN.md` | aktiv |
| 7 Freigabe | Abgleich Plan, BAB, Bauträger; Kennzeichnung „unverbindliche Visualisierung“ | manuell | offen |

## Installation

```bash
python3.13 -m venv .venv-immoviz
.venv-immoviz/bin/pip install bpy==5.2.4 pyyaml pillow numpy
```

Blender läuft als Python-Modul ohne Oberfläche. Die erzeugte `.blend`-Datei lässt sich in Blender 5.2
öffnen und dort von Hand weiterbearbeiten.

## Bedienung

```bash
# Umgebungsdaten laden (einmal pro Objekt)
.venv-immoviz/bin/python immoviz/immoviz.py geo immoviz/projects/wimmergasse-20

# Echte Dachflächen der Umgebung laden (einmal pro Objekt, nach geo): data/roofs.json
.venv-immoviz/bin/python immoviz/immoviz.py daecher immoviz/projects/wimmergasse-20 --cache /tmp/immoviz-kacheln

# Straßenabgleich (fester Schritt vor jedem Vertriebsbild): Parkordnung, Gehsteige, Bäume gegen das Orthofoto
.venv-immoviz/bin/python immoviz/immoviz.py strasse immoviz/projects/wimmergasse-20

# Pflichtliste: in jede Straßenrichtung die ersten Häuser je Straßenseite (ohne Blender)
.venv-immoviz/bin/python immoviz/immoviz.py sichtbar immoviz/projects/wimmergasse-20 --pflicht

# Fernsicht für Drohne und Terrasse: data/fern.json und markante Gebäude je Kamera
.venv-immoviz/bin/python immoviz/immoviz.py fernsicht immoviz/projects/wimmergasse-20

# Welche Nachbarhäuser sieht welche Kamera direkt (Bildanteil der Fassade je BEZUG)
.venv-immoviz/bin/python immoviz/immoviz.py sichtbar immoviz/projects/wimmergasse-20

# Schnelle Vorschau
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke --light golden_hour --preview

# Finale Bilder, mehrere Kameras und Lichtstimmungen
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke,drohne,wimmergasse --light golden_hour,blaue_stunde

# Auflösung, Samples und Unterordner nur für diesen Aufruf (statt project.yaml), z. B. Testrender auf dem Mac
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke --res 3840x2560 --samples 256 --out mac_test --no-blend
```

Ergebnisse landen in `projects/<objekt>/renders/`.

## Umgebung: Dächer, Nachbarn, Bäume

- **Dächer** (`lib/roofs.py`, Befehl `daecher`): Dachflächen aus dem Generalisierten Dachmodell LOD2 der Stadt Wien
  (CityGML je Blatt 1:1000), dem Baukörper zugeordnet, Material aus Neigung und mittlerer Farbe im Orthofoto 2024
  (Ziegel, Ziegel dunkel, Blech, Blech hell, Kies, Grün, Flach). `build_context` setzt sie auf alle Gebäude im
  Radius, `build_neighbours` ersetzt damit die Angabe `roof` der Nachbarfassaden. Ohne `data/roofs.json` gibt es
  Satteldächer mit First parallel zur Straße. Optional `site.roof_radius_m` (Standard `radius_m`).
- **Dachkorrekturen** (`roofs_override` am Ende von `project.yaml`, Auswertung in `lib/roofs.py`): je Gebäude
  (`bezug` oder `pos: [x, y]`) `material` (ziegel_rot, ziegel_rot_alt, ziegel_orange, ziegel_braun, schiefer_dunkel,
  blech, blech_hell, blech_dunkel, kupfer, kies, gruen, flach), `material_flach`, `mansarde` (true oder `traufe`,
  `hoehe`, `neigung`, `tiefe`, `material_oben`, `kamin`, `brandwand_material`; ersetzt Stufenvolumen bzw. Dachmodell
  durch ein Mansarddach mit Brandwänden), `gauben` und `dachfenster` (Anzahl je Dachseite, optional `reihen`,
  `breite`, `hoehe`, `lage`, `seiten`), `kamine` (Anzahl). Alles parametrische Geometrie; ein Schrägluftbild dient
  nur zum Ansehen. Ohne Eintrag wechselt der Ziegelton je Gebäude (rot, orange, braun).
- **Pflichthäuser** (Befehl `sichtbar --pflicht`, `lib/check.py`): in jede Straßenrichtung die ersten 5 Häuser je
  Straßenseite (`--anzahl`), unabhängig vom Bildanteil. `ohne_fassade` muss leer sein.
- **Fernsicht** (Befehl `fernsicht`, `lib/fern.py`): lädt hohe Baukörper (ab 33 m, Umkreis 7,5 km), Namen,
  Strukturdominanten und Höhenfestpunkte nach `data/fern.json` und listet je Kamera die markanten Gebäude im
  Sichtkegel. Im Modell: Fernzone als Blockränder mit Satteldächern auf grobem Gelände (bis `site.fernzone_bis_m`,
  Standard 2400 m), hohe Gebäude als Silhouette, Hügelkette als Kulisse. Optional `site.fern_radius_m`,
  `site.fern_min_hoehe_m`.
- **Direkt sichtbare Häuser** (Befehl `sichtbar`): Sehstrahlen je Kamera, Ergebnis je BEZUG mit Bildanteil und
  Entfernung. Jedes Haus mit mindestens 1 % Bildanteil und unter 80 m braucht einen Eintrag in
  `neighbour_facades` und eine frontale Ansicht in `streetview_checks`.
- **Bäume** (`lib/trees.py` Lage und Korrekturen, Gestalt `lib/assets/baeume.py`, siehe "Objekt- und
  Materialbibliothek"): Größe aus dem Baumkataster. Korrekturen in `trees_override` am Ende von `project.yaml`: Baum
  über die Position finden, `remove: true`, `height`, `crown`, `form` (rund, saeule), `base`, `art` (linde, ahorn,
  platane, kastanie, saeule), oder `add: true` für fehlende Bäume.
- Stand und Befund je Objekt: `projects/<objekt>/umgebung_abgleich.md`.

## Objekt- und Materialbibliothek

Ziel: Das Blender-Bild ist schon fotorealistisch, die Bild-KI bearbeitet nur noch Himmel, Vegetation, Menschen und
Stimmung. Alles ist selbst erzeugte, parametrische Geometrie oder CC0-Material (Quellen und Lizenzen:
`assets/LIZENZEN.md`). Code in `lib/assets/` (Objekte) und `lib/materials.py` (Materialien), eingebunden in
`build_context`. Bestehende Projekte laufen ohne Änderung; jeder Teil lässt sich in `project.yaml` auf die alte Fassung
zurückschalten:

```yaml
assets: {baeume: natur, autos: modelle, leuchten: bibliothek, innenraum: an, menschen: an}
# autos: modelle = realistische Modelle (assets/autos/bibliothek.blend), ohne Bibliothek automatisch karosserie
# alte Fassung: {baeume: einfach, autos: kisten, leuchten: einfach, innenraum: aus}; menschen: aus blendet die Platzhalter aus
```

| Bereich | Inhalt | Steuerung |
|---|---|---|
| Bäume (`assets/baeume.py`) | Stamm, Gerüstäste, Nebenäste, Zweige und rund 20.000 bis 45.000 Blätter je Vorlage in der Umrissform der Art; Kronenhülle je Art (Linde oval, Ahorn rund, Platane breit mit Fleckenrinde, Kastanie Kuppel, Säulenform), gelappter Rand, Lücken zwischen den Blattbüschen. Drei Vorlagen je Art, jeder Baum ist eine Instanz; Lage, Höhe, Kronendurchmesser und Kronenansatz unverändert aus Kataster und `trees_override` | Art aus dem Katasternamen (Tilia, Acer, Platanus, Aesculus; übrige Gattungen nach Wuchsform) oder `art` in `trees_override`. Jahreszeit aus der Lichtstimmung (`season`): Frühling, Sommer, Spätsommer, Herbst (Gelb, Orange, Rot, Braun je Art, 32 % Blattverlust), Winter kahl |
| Autos, realistisch (`assets/autos_bibliothek.py`, Standard) | 16 Modelle aus BlenderKit/BlendKit (kostenlos, Royalty Free oder CC0, Liste mit Autor und Lizenz in `lib/assets/autos_bibliothek.yaml`): einheitlich aufbereitet (Front +X, Herstellerlänge, gemeinsamer Klarlack mit Farbe je Auto, Logos, Embleme und Schriftzüge entfernt, Kennzeichen weiß ohne Schrift, Leuchten aus, Unterteilung höchstens 1 Stufe); als Collection-Instanzen, gleiche Autos in jedem Bild (eigener Zufall je Projekt), Sportwagen selten (`gewicht`) | `immoviz.py autos-laden` (rund 300 MB nach `assets/autos/`, gitignored, ohne Konto), dann `immoviz.py autos-bibliothek` (rund 20 s); Schräg- und Senkrechtparker nur Modelle mit 10 cm Luft zur Nachbarbucht, Längsparker nach Länge. Jedes Auto steht auf vier Radaufstandspunkten (je Modell aus Reifen und Felgen ermittelt): Höhe, Längs- und Querneigung aus der Oberfläche unter jedem Rad (Strahl von oben, Autos werden durchstoßen), höchstens 4 Grad quer und 6 Grad längs; liegt ein Rad mehr als 3 cm daneben oder steht das Auto in einem Poller, Schild oder Stamm, wird es in der Bucht um bis zu 0,5 m verschoben, sonst bleibt die Bucht frei (Nachlauf am Ende von `build_scene`). Prüfung in drei Stufen: (1) `immoviz.py autos-pruefen <projekt>` und automatisch vor jedem `render` (Abbruch bei Befund, nur zum Testen `IMMOVIZ_AUTOS_PRUEFUNG=aus`): Räder gegen Oberfläche, Neigung, Bucht, Überschneidungen, Hindernisse, Maßstab je Modell, freie Buchten mit Grund (`renders/check/autos_pruefung.md`, `.json`, `autos_lage.json`); (2) `immoviz.py strasse` zeichnet die gesetzten Autos (violett, Strich zur Front) und die freien Buchten (Kreuz: grau Zufallsbelegung, rot Rad auf Kante, orange uneben, pink Hindernis) über das Orthofoto; (3) jeder `render` schreibt `<kamera>_<licht>_autos_bogen.jpg`: Nahaufnahmen der Autos, deren Räder die Kamera sieht, Marken unter den Aufstandspunkten. Nach der Veredelung `schutz --autos beide`: zwei Fassungen (`_modelle`: Blender-Autos geschützt, gleich in jedem Bild; `_ki`: Autos aus dem KI-Bild) und `_autos_vergleich.jpg`. Rund 10 Mio. Flächen, Render-Speicher rund 20 GB (Mac) |
| Autos, parametrisch (`assets/autos.py`) | Kleinwagen, Kompakt, Kombi, SUV, Transporter mit Karosserie aus Querschnitten (Schulter, eingezogene Fahrgastzelle, geneigte Scheiben), Rädern mit Felge, Radläufen, Scheinwerfern, Rückleuchten, Spiegeln, Kennzeichenfeld ohne Schrift; gedeckte Lackfarben je Auto | Stellplätze und Parkordnung wie bisher aus `street.parking` (`lib/strasse.py`) |
| Straßenleuchten (`assets/leuchten.py`) | Seil-/Überspannungsleuchte (Wiener Hängeleuchte, Querseil mit Wandhaken und Spannschloss, Abspannung an Kreuzungen, Längsseil je Strang), Peitschenmast, Aufsatzmast, Wandausleger, Altwiener Laterne; Licht 3000 K (Blackbody), Spot nach unten mit 115 Grad Kegel und 1800 W (Seil/Peitsche), Leuchtkörper mit geringer Leuchtdichte (`DIFFUSOR_AN` 0,5) und Lichtquelle für die Kamera unsichtbar (Nachtprobe 18.11.2026), an bei Sonnenhöhe unter 2 Grad oder mit `strassenlicht: an` in der Lichtstimmung (`aus` erzwingt aus) | nur aus dem Inventar `strassenleuchten` (siehe unten), ohne Inventar Fallback aus `street.cables` mit Warnung in `pruefen` |
| Straßenmöbel (`assets/moebel.py`) | Poller (grün-weiß, dunkelgrün mit rot-weißen Reflexringen `gruen_rot_weiss`, rot-weiß, grau), Fahrradbügel, Mistkübel (orange oder grau mit orangem Rand, auch am Zeichensteher), Verkehrszeichen ohne lesbare Schrift (Verbot, Gebot, Gefahr, Stop, Vorrang, Info, Zusatz; mehrere Tafeln an einem Steher mit `hoehe` und `steher: false`), Hydrant, Baumscheibe mit Gussgitter oder Erde, abgestelltes Motorrad (Platzhalter) | `strassenmoebel` (Liste mit `typ`, `pos`, `drehung`, `quelle`); Baumscheiben automatisch je Katasterbaum auf Gehsteig/Parkstreifen (`strassenmoebel_auto: {baumscheiben: true, baumscheibe: gitter, umkreis_m: 90}`) |
| Straßenelemente (`assets/strassenelemente.py`) | Gehsteigüberfahrt (durchgezogener Gehsteig über eine Einmündung, Plateau 5 mm unter Bordsteinoberkante, flache Rampen auf beiden Seiten; Material je Teil: Plateau, Rampe zur Kreuzung, Rampe zur Gasse, optional Granitkante), Fahrbahnschwelle (Kosinusprofil 7 cm), Gehsteigabsenkung (Bordstein auf 3 cm, seitlich auslaufend), Bodenmarkierungen (Leitlinie strichliert, durchgezogene Linie, Radpiktogramm mit optionalem Pfeil, Sperrfläche, gefüllte Fläche wie Dreiecke, Parkmarkierung und Randlinie je Parkregel), Schachtdeckel und Straßeneinlauf, Wiener Straßentafel am Haus (blau, weißer Rand, ohne Schrift), Fahrradständer, Motorradabstellplatz (Umriss), Unterflurhydrant. Höhe jedes Elements aus der fertigen Bodenfläche (Strahl von oben), Markierungen 6 mm darüber | `strassenelemente` (von Hand, je Eintrag `typ`, `quelle`) plus automatisch aus OGD (`lib/strasse.ogd_elemente`, abschaltbar je Art mit `strassenelemente_auto: {<art>: false}`, ganz mit `{aus: true}`); Belag je Teilfläche: `street.belag` (Rechteck, z. B. Betonplatten auf Gehsteigvorziehungen), `street.parkstreifen_material` (Belag je Parkstreifen), Parkregel `markierung: true`, `randlinie: true`. Zebrastreifen nur aus der FMZK (`Zebrastreifen`) oder als Eintrag nach der Begehung |
| Menschen (`assets/moebel.py`) | graue Silhouetten in realistischer Größe (stehen, gehen), Sammlung `menschen_platzhalter`, nur Lage und Maßstab für die Bild-KI | `menschen` (Liste mit `pos`, `hoehe`, `drehung`, `haltung`, `quelle`); ausblenden mit `assets: {menschen: aus}` oder `IMMOVIZ_MENSCHEN=aus` vor dem Befehl |
| Materialien (`materials.py`) | Putz mit Körnung, Kellenstruktur, Fleckigkeit, Schmutz in Kehlen und unter Gesimsen und Fensterbänken (Umgebungsverdeckung), Laufspuren, gerundeten Kanten (Bevel-Shader 2 cm); Stuck; Zink mit Falzen; Floatglas (IOR 1,52, leichte Unruhe), Kastenfenster mit zwei Ebenen; lackierte Rahmen mit gerundeten Kanten; Asphalt mit Gesteinskorn, Flickstellen mit Naht und Rissen; Gehsteig als Gussasphalt oder Betonplatten; Granit-Kleinsteinpflaster mit Farbe je Stein; Bordstein Granit; Holztor; Metall | Gehsteig: `street.gehsteig: asphalt | platten` (`platten_raster: [0.5, 0.5]`); Variation gegen Wiederholung über Objekt-Zufall und mehrere Rauschebenen |
| Innenräume hinter Fenstern (`materials.innenraum`, `meshkit.innen_karte`) | Interior Mapping: aus einer Fläche in der Fensteröffnung rechnet der Shader einen Raum (Rückwand mit Möbel-Silhouette, Bild oder Tür, Seitenwände, Parkett, Decke), Vorhänge (Schals oder Store), Tageslicht nach hinten abfallend, zufällig Licht an (12 % am Tag, bis 55 % nachts, Stärke aus `interior` der Lichtstimmung). Für das Objekt, die Nachbarfassaden, die Fenster der Umgebung (mit eigener Spiegelung) und `neubau` | eigene Wohnungen mit Möblierung bleiben in `wohnungen.yaml` (`interior`) |
| Texturen (`assets/texturen.py`) | optionale CC0-Texturen von Poly Haven (Asphalt, Betonplatten, Putzkorn) als Helligkeits-, Rauheits- und Reliefvariation | `immoviz.py texturen` lädt sie nach `assets/texturen/` (gitignored); ohne sie rein prozedural |

**Leuchten-Inventar** (`strassenleuchten` in `project.yaml`, Regel U9 in `REGELN.md`): je Leuchte `id`, `typ`
(`seil`, `mast_peitsche`, `mast_aufsatz`, `wandausleger`, `altwiener_laterne`), Lage (`leuchte` bzw. `pos`, lokal),
`hoehe` (Lichtpunkthöhe über Gelände), bei Seilleuchten beide Aufhängepunkte `a` und `b` (x, y, Höhe) oder an
Kreuzungen `abspannung` (Liste), optional `strang` (Längsseil), bei Mast und Wandarm `ausleger` und `richtung`, immer
`quelle`. Erhebung aus Street View (nur intern, Bilder in `renders/streetview/leuchten/`): je Panorama ein Blick
senkrecht nach oben, die Lage folgt aus dem Versatz der Leuchte in zwei Nachbarpanoramen (Abstand d der Panoramen,
Bildversatz v1, v2 in Pixeln, f = Bildbreite / 2 / tan(60 Grad) bei 120 Grad Bildwinkel): Höhe über Kamera
h = d * f / (v1 - v2), Lage = Panorama plus v * h / f; Wandhaken als Strahl quer zur Straße bis zur Fassade laut
Baukörpermodell. Prüfen mit

```bash
.venv-immoviz/bin/python immoviz/immoviz.py leuchten immoviz/projects/wimmergasse-20   # renders/check/leuchten_abgleich.jpg und .md
.venv-immoviz/bin/python immoviz/immoviz.py texturen                                     # optionale CC0-Texturen laden
```

Das Prüfbild zeigt das Orthofoto 2024 mit Leuchten (Farbe je Typ, ID, Höhe), Querseilen und Haken, Längsseilen und
Auslegern. Stand: Wimmergasse 20 mit 24 Seilleuchten (Wimmergasse und Stolberggasse je Richtung bis zum 4. bis 5. Haus,
vier Kreuzungen mit Abspannung), Noma mit 7 Seilleuchten an der Straßenbahn-Überspannung der Schlachthausgasse und
4 Peitschenmasten an der Südseite der Würtzlerstraße; Hof- und Terrassenleuchten der Noma sind Ausstattung
(`neubau.ausstattung`, typ leuchte), der Einreichplan zeigt keine Außenleuchten.

Render-Ebenen (`render --ebenen`, `lib/ebenen.py`) ordnen die Bibliothek über die Objektnamen zu: `baeume_*`,
`autos`, `strassenleuchten*`, `strassenmoebel`, `menschen_platzhalter`. Rechenzeit Vorschau 960 x 640, 32 Samples auf
4 CPU-Kernen: Wimmergasse `ecke` rund 110 s (vorher 47 s), davon Szenenaufbau rund 50 s (Baumvorlagen, Autos, Texturen).

## Straßenabgleich: Parkplätze und Gehsteige vor dem Haus

Fester Prüfschritt je Objekt (`lib/strasse.py`, Befehl `strasse`). Kein Rendering für den Vertrieb ohne dieses Prüfbild.

```bash
.venv-immoviz/bin/python immoviz/immoviz.py strasse immoviz/projects/wimmergasse-20
```

Braucht kein Blender und dauert wenige Sekunden. Ergebnis in `projects/<objekt>/renders/check/`:

- `strasse_abgleich.jpg`: Orthofoto der Stadt Wien 2024 (Umkreis 60 m um das Objekt, 5 cm je Pixel, ins lokale
  System gedreht) mit Überlagerung aus dem Modell: Umriss des Objekts, Bordsteinlinien, Gehsteigflächen,
  Parkstreifen mit Stellplätzen als Rechtecke (Farbe je Parkordnung), Bäume als Kreise in Kronengröße,
  Baumscheiben laut Kataster, Gehsteigbreiten, Maßstab, Nordpfeil, Legende, Quellenangabe.
- `strasse_abgleich.md` und `.json`: je Fassade die Gehsteigbreite im Modell (Fassade bis Bordstein, fünf
  Messstellen), Parkordnung und Zahl der Stellplätze auf der Hausseite und gegenüber, Baumscheiben; dazu alle
  Parkstreifen im Ausschnitt mit Breite, Parkordnung, Raster und angewandter Regel.

Geprüft wird am Bild: Liegen die Rechtecke auf den Autos (Richtung, Raster)? Decken Bordstein und Gehsteig
(Toleranz 0,5 m)? Stimmen Baumscheiben und Kronen? Die Autos im Rendering (`park_cars` in `lib/build.py`) stehen
auf genau diesen Stellplätzen.

**Parkordnung einstellen** in `project.yaml` unter `street.parking`. Die erste passende Regel gilt:

```yaml
street:
  parking:
    - {name: Wimmergasse Hausseite, strasse: wimmergasse, seite: haus, art: schraeg, winkel: -55, raster: 2.35}
    - {name: Wimmergasse gegenueber, strasse: wimmergasse, seite: gegenueber, art: laengs}
    - {name: Stolberggasse beidseitig, strasse: stolberggasse, art: senkrecht, raster: 2.6}
    - {name: Ladezone, bereich: [10.0, -6.0, 16.0, -2.0], art: keine}      # Rechteck im lokalen System
```

| Schlüssel | Bedeutung |
|---|---|
| `strasse`, `seite` | Name einer Fassade aus `facades`: alle Streifen parallel zu dieser Flucht. `seite: haus` (bis 8 m vor der Flucht) oder `gegenueber` (8 bis 30 m); die Grenze ändert `grenze` |
| `bereich` oder `polygon` | Rechteck `[x0, y0, x1, y1]` bzw. Polygon im lokalen System; ein langer Streifen kann so in Abschnitte mit verschiedener Parkordnung zerfallen. Mehrere Angaben in einer Regel müssen alle zutreffen |
| `art` | `laengs`, `schraeg`, `senkrecht` oder `keine` (kein Parken, z. B. Ladezone) |
| `winkel` | nur `schraeg`: Grad zur Bordsteinlinie (Standard 60). Positiv: schräg in Fahrtrichtung bei Rechtsverkehr. Negativ: umgekehrt, z. B. Einbahn mit Parkstreifen links |
| `raster` | Stellplatzbreite in m (Standard 2,5), bei `laengs` die Stellplatzlänge (Standard 5,7) |
| `belegung` | Anteil belegter Plätze im Rendering (Standard 0,85); das Prüfbild zeigt immer alle Plätze |

Ohne Regel entscheidet die Breite des Streifens: unter 3,4 m längs, 3,4 bis 4,0 m schräg 45 Grad, 4,0 bis 4,8 m
schräg 60 Grad, darüber senkrecht. Baumscheiben laut Baumkataster und Aussparungen im Streifen bleiben frei.
Optional `street.parking_check: {umkreis_m: 60, m_je_pixel: 0.05}`. Die Orthofoto-Kacheln werden in
`data/ortho_cache/` zwischengespeichert (nicht im Repo). Orthofoto und Geodaten: Stadt Wien, data.wien.gv.at
(CC BY 4.0), das Prüfbild darf ins Repo.

Ist `GOOGLE_MAPS_API_KEY` gesetzt, holt `strasse` zusätzlich je Fassade zwei Street-View-Bilder entlang des
Gehsteigs und legt sie neben ein Modell-Rendering derselben Ansicht (`renders/streetview/strasse_<fassade>_a|b_vergleich.jpg`,
nicht im Repo, nur interne Referenz; braucht Blender). `--ohne-streetview` lässt das aus.

## 3D-Referenzabgleich je Kamera (`referenz`, Google Photorealistic 3D Tiles, nur intern)

Fester Prüfschritt für jede Außenkamera vor der Veredelung (`lib/referenz.py`, `lib/referenz_google.js`). Das Werkzeug
rendert denselben Blick wie die Blender-Kamera aus den Google Photorealistic 3D Tiles und vergleicht Gebäude für
Gebäude. Google bleibt reine Referenz: keine Geometrie, keine Textur, kein Bild davon kommt ins Modell, ins Repo
oder in ein Vermarktungsbild. Korrigiert wird von Hand in `roofs_override`, `neighbour_facades`, `fern_gipfel` und
`fern_spitzen`, gegengeprüft mit den Daten der Stadt Wien.

```bash
# Schlüssel nur als Umgebungsvariable im Befehl, nie in Dateien
GOOGLE_MAPS_API_KEY=... .venv-immoviz/bin/python immoviz/immoviz.py referenz immoviz/projects/wimmergasse-20 --kamera drohne
# nach Korrekturen am Modell: Google-Bilder wiederverwenden, nur Blender neu (rund 1,5 Minuten)
GOOGLE_MAPS_API_KEY=... .venv-immoviz/bin/python immoviz/immoviz.py referenz --projekt immoviz/projects/wimmergasse-20 --kamera drohne --nur-modell
# Probekamera ohne Eintrag in project.yaml (name:Standpunkt:Ziel:Brennweite)
... referenz immoviz/projects/wimmergasse-20 --kamera drohne --test-kamera drohne_w:-75,-20,45:6,10,20:30
```

Ablauf:

1. **Kalibrierung** (einmal je Projekt, `--kalibrieren` erzwingt sie neu): Draufsicht der Kacheln als
   Orthogonalkamera (360 x 360 m, 0,25 m je Pixel, Farb- und Tiefenbild) gegen die Draufsicht des Modells.
   Höhe: Median der Differenz auf allen Fahrbahnflächen im Umkreis 120 m ergibt die ellipsoidische Höhe von
   Wiener Null (156,68 m ü. A. plus Geoidundulation; EGM2008 nennt für Wien 44,8 m, gemessen wurden 43,96 m, also
   eine Kachelabweichung von rund 0,9 m, die die Kalibrierung mit erfasst). Lage: Kreuzkorrelation der Hauskanten
   (Gradient der Höhenbilder). Ergebnis in `renders/streetview/referenz_google/kalibrierung.json`.
2. **Google-Ansicht**: CesiumJS 1.120 (feste CDN-URL) in Chromium über Playwright (Node, `require('playwright')`,
   Chrome mit SwiftShader). Kamera aus dem lokalen System über GK Ost (EPSG:31256), WGS84 und ECEF; Brennweite und
   Sensor 36 mm wie Blender (Öffnung der längeren Bildseite), senkrechte Korrektur (Shift) der Blender-Kamera als
   symmetrisch höheres Bild gerendert und zugeschnitten. Je Ansicht Farbbild und Tiefenbild (Custom Shader, Abstand
   entlang der Blickachse in Zentimetern als 24 Bit).
3. **Modell**: dieselbe Kamera in Blender (Vorschau, Licht `--licht`, Standard `dunst_hell`) und ein Tiefenbild
   (Ersatzmaterial mit „View Z Depth“, 1 Sample), dazu die Draufsicht des Modells als Höhenbild.
4. **Auswertung**: beide Tiefenbilder werden in 3D-Punkte zurückgerechnet und über die Grundrisse des
   Baukörpermodells den Gebäuden (BEZUG) zugeordnet. Je Gebäude: Traufe (20-%-Wert am freien Dachrand), First
   (99-%-Wert), Firstrichtung (Hauptachse der höchsten Dachzone), fehlende oder zu hohe Flächen (Aufbau fehlt,
   Volumen fehlt, Modell zu hoch) aus der Draufsicht; IoU der Gebäudemaske und Abweichung der oberen Dachkante
   (Pixel und Meter) im Kamerabild; Horizontlinie; höchster Punkt der markanten Gebäude der Fernsicht.

Ausgabe:

| Datei | Inhalt | Repo |
|---|---|---|
| `renders/check/abgleich_<kamera>.md` | Kalibrierung, Kantendeckung, Horizont, Tabelle und Liste je Gebäude („Gebäude 3: Traufe 1,2 m zu hoch, Firstrichtung falsch, Aufbau fehlt“), Fernsicht | ja |
| `renders/check/abgleich_<kamera>.jpg` | Modellbild mit Ampel je Gebäude (grün in Toleranz, gelb bis 1,5 m, rot darüber) und Nummern wie in der Liste, ohne Google-Inhalt | ja |
| `renders/streetview/referenz_google/abgleich_<kamera>_bogen.jpg` | Google, Modell, Überblendung 50 %, Kanten (rot Referenz, cyan Modell, weiß deckungsgleich) | nein (gitignored) |
| `renders/streetview/referenz_google/*` | Google-Farb- und Tiefenbilder, Draufsichten, Kalibrierung, JSON je Lauf | nein |

Schwellwerte: Dachkanten (Traufe, First, Dachkante im Bild) der Pflichthäuser unter 0,5 m, übrige Häuser im Bild
unter 1,5 m; die Kanten sind geometrisch (Tiefensprünge und Flächenknicke), nicht aus den Texturen. Optionen:
`--tag _vorher` hängt an Bogen, Kantenbild und JSON einen Zusatz an (Vorher/Nachher), `--sse` setzt die Detailstufe
der Kacheln (Standard 4 Pixel), `--google-neu` rendert die Google-Ansichten neu. Laufzeit Wimmergasse 20, Kamera
`drohne`: Draufsicht und Kalibrierung unter 1 Minute, Google-Ansicht rund 3,5 Minuten (Chrome mit SwiftShader, ohne
GPU), Blender rund 1 Minute; mit `--nur-modell` rund 1,5 Minuten je Durchgang. Voraussetzungen: Node mit Playwright, Chrome unter
`/usr/bin/google-chrome` (oder `IMMOVIZ_CHROME`), Python-Pakete `pyproj` und `scipy` im venv.

Dachkorrekturen aus dem Abgleich (`roofs_override`, Code `lib/roofs.py`): `dz` (Dachmodell heben oder senken),
`dach` (parametrisches Dach statt Dachmodell: `form` sattel, walm, pult, flach oder mansarde, `traufe`, `first`,
`richtung`, `neigung`, `min_hoehe`), `aufbauten` (Quader für Liftturm, Stiegenhaus, Dachterrasse: `pos`, `l`, `b`,
`z0`, `z1`, `drehung`, `material`). Fernsicht: `fern_gipfel` (Gipfel mit Höhe ü. A. für die Hügelkette) und
`fern_spitzen` (Turmhelme auf markanten Gebäuden). Seit dem Abgleich stehen Baukörper und Dächer auf der
Sockelhöhe des Baukörpermodells (T_KOTE) statt auf dem Gelände am Schwerpunkt (`site.hoehen_absolut`, Standard an):
das Gelände lag dort im Mittel 0,44 m, bis 1 m höher, alle Dächer standen entsprechend zu hoch.

## Virtuelle Begehung (`begehung`, Street View gegen das Modell, nur intern)

Fester Prüfschritt vor jeder Veredelung einer Straßen- oder Luftkamera (Regel U11 in `REGELN.md`, `lib/begehung.py`).
Das Werkzeug "geht" die Straßen um das Objekt ab und stellt an jedem Standort das Street-View-Foto neben dieselbe
Ansicht aus dem Modell. So fallen Details auf, die weder Plan noch Orthofoto zeigen: Gehsteigüberfahrten, Schwellen,
Absenkungen, Markierungen, Poller, Zeichen, Abstellplätze, Pflaster, Erdgeschosszonen.

```bash
# Schlüssel nur als Umgebungsvariable im Befehl, nie in Dateien
GOOGLE_MAPS_API_KEY=... .venv-immoviz/bin/python immoviz/immoviz.py begehung --projekt immoviz/projects/wimmergasse-20
# Umkreis, Abstand und Straßen (Standard aus project.yaml `begehung:`, sonst 120 m, 10 m, alle Straßen im Umkreis)
... begehung --projekt <p> --radius 120 --schritt 10 --strassen Wimmergasse,Stolberggasse
# nach Korrekturen am Modell: Fotos wiederverwenden, nur Modell und Vorprüfung neu, einzelne Standorte
.venv-immoviz/bin/python immoviz/immoviz.py begehung --projekt <p> --nur-modell --nur WI10,WI11,ST13
# Vorher/Nachher-Bogen eines Standorts (Modellbilder mit --tag _vorher und ohne Tag vorhanden)
.venv-immoviz/bin/python immoviz/immoviz.py begehung --projekt <p> --vorher-nachher WI10:vorn_u,vorn_o:_vorher: --out <datei.jpg>
```

Ablauf:

1. **Standorte**: Straßenachsen aus dem Straßengraphen der Stadt Wien (`STRASSENGRAPHOGD`) im Umkreis um das Objekt,
   alle `--schritt` Meter eine Abfrage der Street-View-Metadaten (kostenlos: Standort, Aufnahmedatum, Panorama-ID).
   Doppelte Panoramen fallen weg, jüngere Aufnahmen haben Vorrang, Mindestabstand 0,7 x Schritt. Lage ins lokale System
   über die Kalibrierung aus `referenz` (`kalibrierung.json`, Lageversatz der Google-Daten gegen die Stadtvermessung).
   Ergebnis `renders/streetview/begehung/standorte.json`, Nummern je Straße (`WI01`, `ST13`, ...).
2. **Fotos**: je Standort 8 Ansichten über die Static API (vorn, rechts, hinten, links relativ zur Straßenachse;
   Bildwinkel 90 Grad; Neigung -10 und +10 Grad; 640 x 640), einmal geladen und wiederverwendet.
3. **Modell**: dieselben Ansichten in Blender, Kamera 2,5 m über Gelände (Google-Auto), gleiche Kompassrichtung,
   Neigung und Brennweite, 6 Grad Rand. Der Rand gleicht einen kleinen Richtungsfehler des Panoramas aus: gemeinsamer
   Bildversatz aller Ansichten eines Standorts über Kantenabgleich (Chamfer), im Bericht als Gier/Nick in Grad.
   Menschen-Platzhalter sind ausgeblendet, Licht `dunst_hell`, 8 Samples, wenige Bounces.
4. **Vorprüfung**: Kanten (Canny) und Klassenkarten für Foto und Modell mit SegFormer B2 (Cityscapes, über `torch`
   und `transformers`, CPU; ohne die Pakete nur Kanten): Fahrbahn, Gehsteig, Markierung (helle Farbe auf der Fahrbahn),
   Mast/Pfahl, Schild, Vegetation, Auto, Zweirad, Gebäude, Himmel. Je Ansicht Raster 8 x 8: Bereiche, in denen eine
   Klasse nur im Foto (fehlt im Modell) oder nur im Modell vorkommt, mit Schwere (hoch: Gehsteig, Fahrbahn, Mast,
   Schild, Markierung in der unteren Bildhälfte; Autos und Personen nur Hinweis; wo Foto oder Modell ein Auto, Zweirad
   oder eine Person zeigen, zählen Fahrbahn, Gehsteig und Markierung nicht). Die Panoramen liegen bis rund 1,5 m neben
   ihrer GPS-Lage: nahe Befunde "Gehsteig nur im Foto" oder "Fahrbahn nur im Modell" in Seitenansichten gegen Orthofoto
   und OGD prüfen, bevor korrigiert wird.
5. **Sichtprüfung**: die Bögen ansehen und `begehung.md` im Projekt ausfüllen (wird beim ersten Lauf mit allen
   Standorten und Prüfpunkten angelegt): je Abweichung Standort, Prüfpunkt, Beschreibung, Schwere, Korrektur, Stand.
   Korrigieren im Modell (OGD, `strassenmoebel`, `strassenelemente`, `street`), dann `--nur-modell` erneut, bis keine
   Abweichung "hoch" mehr offen ist.

| Datei | Inhalt | Repo |
|---|---|---|
| `renders/streetview/begehung/<standort>/bogen<tag>.jpg` | je Ansicht: Foto, Modell, Überblendung mit Kanten (rot Foto, cyan Modell), Klassen Foto, Klassen Modell, Befund-Rahmen | nein (gitignored) |
| `renders/streetview/begehung/<standort>/*_foto.jpg`, `*_modell<tag>.png`, `vorpruefung<tag>.json` | Fotos, Modellbilder, Befunde je Ansicht | nein |
| `renders/check/begehung_karte<tag>.jpg` | Orthofoto (OGD) mit Standorten, Straßenachse, Ampel aus der Vorprüfung | ja |
| `renders/check/begehung_auto<tag>.md` | Tabelle je Standort (Aufnahme, Ausgleich, Kanten, Befunde hoch/mittel/niedrig) und Befundliste | ja |
| `begehung.md` | Prüfliste und Abweichungen (Sichtprüfung) | ja |

Laufzeit Wimmergasse 20 (Wimmergasse und Stolberggasse, Umkreis 120 m, 47 Standorte, 376 Ansichten), Cloud mit 4
CPU-Kernen: Standorte und Fotos rund 3 Minuten (einmalig), Szenenaufbau rund 1,5 Minuten, Modell rund 13 Sekunden je
Ansicht (rund 1,7 Minuten je Standort, alle Standorte 80 Minuten, mit Vorprüfung 95 Minuten), Vorprüfung rund 5 Sekunden je Standort. Für
Nachläufe nur die betroffenen Standorte mit `--nur`. Kosten: Metadaten frei, Static API rund 0,007 USD je Bild (376
Bilder rund 2,60 USD). Voraussetzungen: Blender-Modul, `pyproj`, `scipy`, `opencv-python-headless`; für die Klassen
`torch` (CPU-Wheel) und `transformers`, das Modell lädt beim ersten Lauf (rund 110 MB, Hugging Face Cache).

**OGD-Straßenausstattung** (`lib/strasse.ogd_laden`, `data/strassen_ogd.json`, Felder geprüft mit
DescribeFeatureType): Gehsteigabsenkungen `SISGEHSTEIGABSOGD` (Punkte, "0 cm" bzw. "bis 3 cm abgesenkt"),
Fahrradabstellanlagen `FAHRRADABSTELLANLAGEOGD` (Punkt, Anzahl Räder), Motorradabstellplätze `MOTORRADABSTELLPLATZOGD`,
Radfahren gegen die Einbahn `RADGEGENEINBAHNOG` (Linien je Graphkante), Einbahnen `EINBAHNOGD` (Richtung zur Kante),
Begegnungszonen `BEGEGNUNGSZONEOGD`, Kurzparkstreifen `KURZPARKSTREIFENOGD`, Behindertenparkplätze
`BEHINDERTENPARKPLATZOGD`, Hydranten `HYDRANTOGD`, Ladezonen `LADEZONEOGD`, Straßengraph `STRASSENGRAPHOGD`. Daraus
(`ogd_elemente`): Gehsteigüberfahrt, wo zwei Fahrbahnschwellen der FMZK eine Einmündung einfassen und eine Absenkung
"0 cm" dazwischen liegt; Fahrbahnschwellen; Gehsteigabsenkungen am nächsten Bordstein; Fahrradbügel (je zwei Räder ein
Bügel, quer zum Bordstein); Leitlinie in Fahrbahnmitte und Radpiktogramme auf der Gegenrichtungsseite (alle
`piktogramm_abstand` Meter) bei Radfahren gegen die Einbahn; Leitlinie weiterer Straßen laut Begehung
(`strassenelemente_auto.leitlinie_strassen`); Zusatztafel an Behindertenparkplätzen; Unterflurhydranten. `strasse`
lädt die Daten mit.

## Kamera einer Referenzvisualisierung matchen (`kameramatch`)

Liegen Visualisierungen des Architekten oder Bauträgers vor (Kundenwunsch „Häuser wie im Original“), wird zuerst
deren Kamera gelöst und dann das Modell an der Überlagerung angeglichen (`lib/kameramatch.py`). Die Vorlage selbst
bleibt außerhalb des Repos; im Repo liegen nur die Punktdatei und der Kameraeintrag.

```bash
.venv-immoviz/bin/python immoviz/immoviz.py kameramatch immoviz/projects/noma-shg13 \
    --bild <vorlage.jpg> --punkte immoviz/projects/noma-shg13/kameramatch/hof_fin.yaml --kamera hof_fin
# nur lösen und Fehler ansehen (nichts schreiben, kein Blender)
... kameramatch ... --nur-loesen
# nach Änderungen am Modell: Kamera aus project.yaml, nur Modellbild und Überlagerung neu (rund 2 Minuten)
... kameramatch ... --nur-render
```

Punktdatei (YAML): `groesse` (Pixelgröße, in der gemessen wurde) und `punkte`, je Punkt `name`, `px: [u, v]`
(Bildpixel der Vorlage) und `xyz: [x, y, z]` (lokales Projektsystem; mit `rahmen: hof` als a, b, z im Hilfsrahmen
aus `neubau.rahmen`). Optional `gewicht`, `kontrolle: true` (nur Fehler anzeigen, nicht im Ausgleich) und
`nur_u: true` (senkrechte Kante, Höhe unbekannt: nur die Bildspalte zählt). `standpunkt_wie: <kamera>` übernimmt
den Standpunkt einer gematchten Kamera (Ausschnitt derselben Visualisierung mit längerer Brennweite). `standpunkt: [x, y, z]` gibt ihn fest vor: bei fast ebenen Punkten im Tele (Fassadenausschnitt) sind Standpunkt und Brennweite entlang einer Linie gleich gut; dann den Standpunkt per Rastersuche im freien Raum (außerhalb der Baukörper) wählen und eintragen. Passpunkte
nur an Bauteilen, die laut Plan feststehen (Attikaecken, Balkonplatten, Fensterecken, Fassadenkanten des Neubaus),
mindestens sechs mit voller Lage, über Bildbreite und Tiefe verteilt; Nachbarn sind das, was angeglichen wird,
und liefern keine Passpunkte.

Lösung: Kameramodell wie Blender (`setup_camera`, Sensor 36 mm an der längeren Bildseite). Startwerte aus OpenCV
`solvePnP` (SQPnP, dann iterativ) über 48 Brennweiten von 8 bis 400 mm, Ausgleich mit scipy `least_squares`
(robust, soft L1) für Standpunkt, Blickrichtung, Brennweite und Shift bei waagrechter Kamera (Architektur-
visualisierungen haben senkrechte Kanten, also Shift statt Kippung). Zur Kontrolle wird die freie Lösung mit
Kippung und Rollwinkel mitgerechnet (`frei_mit_kippung`): ist sie kaum besser, stimmt die Annahme. Ein schwacher
Zug zu kleinem Shift verhindert bei fast ebenen Punktwolken (Fassadenausschnitt im Tele) Scheinlösungen.
**Gematcht ist eine Kamera erst, wenn der mittlere Reprojektionsfehler unter 1 % der Bildbreite liegt.**

Ergebnis:

| Ausgabe | Inhalt | Repo |
|---|---|---|
| `project.yaml` `cameras.<name>` | `pos`, `target` (waagrecht), `lens`, `shift: [x, y]`, `format: [b, h]` (Seitenverhältnis der Vorlage), `clip_start`, falls der Standpunkt in einem Nachbarbaukörper liegt (Vorlagen blenden nahe Nachbarteile oft aus), `ausblenden: [<Namensanfang>]` für Objekte, die nur diese Kamera nicht rendert (z. B. `nb_umgebung_erker_`), `roll` (Grad, nur mit `vertical: false`) für gematchte Handyfotos, Kommentar mit Fehler | ja |
| `project.yaml` `baukoerper` | `[{id, poly, quelle}]`: Grundriss eines Baukörpers aus `data/context.json` ersetzen (z. B. offene Balkontürme, die das Baukörpermodell als massive Vorsprünge führt) | nein |
| Konsole (JSON) | Reprojektionsfehler je Punkt in Pixeln, Mittel, Maximum, Prozent der Bildbreite, `gematcht`, Kantenabweichung gesamt und bei Nachbarn | |
| `renders/kameramatch/<name>_modell.png` | Blender-Vorschau aus der gematchten Kamera im Format der Vorlage | nein (PNG) |
| `renders/kameramatch/<name>_ueberlagerung.png` | drei Felder: Vorlage und Modell 50 % überblendet; Kanten (Vorlage rot, Modell blau, deckungsgleich violett); Passpunkte (Vorlage grün, Modell gelb) | nein (enthält die Vorlage) |
| `renders/kameramatch/<name>_drahtmodell.png` | Baukörper des Baukörpermodells (BEZUG) und Nachbarfassaden (schwarz, mit Namen) als Drahtmodell über der Vorlage, ohne Blender: zeigt Element für Element, wo die Vorlage von OGD und Modell abweicht | nein (enthält die Vorlage) |

Angleichen an der Überlagerung: Höhen und Lagen aus der Vorlage misst man mit dem Strahlschnitt (Pixelstrahl der
gematchten Kamera geschnitten mit der Ebene einer Nachbarfassade oder einer Höhe), Farben aus mittleren,
unbeleuchteten Flächen der Vorlage (nicht aus Schatten oder Spitzlichtern). Eingetragen wird parametrisch in
`neighbour_facades` (Lage, Höhe, Achsen, Reihen, Farbe), `roofs_override` (`dz`, `dach`, Material, Gauben) und
`neubau` (Gruppe `nb_umgebung` für Erker, Paneele, Gartenobjekte). Der Neubau bleibt beim Einreichplan; jeder
Widerspruch Vorlage gegen Plan oder OGD wird im Umgebungsabgleich des Projekts dokumentiert. Die
Kantenabweichung ist die Entfernung der Modellkanten zur nächsten Vorlagenkante (Median, Prozent der Bildbreite),
„bei Nachbarn“ nur im Bildbereich der Nachbarbaukörper; Vegetation und Texturen der Vorlage machen sie zu einem
groben Maß, maßgeblich ist der Blick auf die Überlagerung.

## Walkthrough (Kamerafahrt durch eine Wohnung)

Methode nach dem Praxisbeispiel in KONZEPT.md, Abschnitt 8: Blender gibt Geometrie und Kamerapfad vor,
die Bild-KI richtet ein, das Videomodell verbindet die Standbilder.

1. Kamerapfad in `wohnungen.yaml` unter `<top>.walkthrough.punkte` (Position, Blickziel, Brennweite, Zeitpunkt).
2. Standbilder je Wegpunkt rendern (und optional die Clay-Fahrt als Bewegungsvorlage):

```bash
.venv-immoviz/bin/python immoviz/immoviz.py walkthrough immoviz/projects/wimmergasse-20 --top top35 --anim
```

3. Ersten Wegpunkt in Higgsfield einrichten, mit festem Möbelplan im Prompt (was steht links, Mitte, rechts).
4. Alle weiteren Wegpunkte mit dem eingerichteten ersten Bild als Referenz ("SAME apartment as image 2"),
   damit Möbel und Materialien in jedem Bild gleich sind. Je Bild ausdrücklich sagen, welche Wände keine
   Fenster haben, sonst erfindet das Modell welche.
5. Kling 4.0, Modus `image-to-video`: `start_image` = Wegpunkt 1, `image_references` = mittlere Wegpunkte
   in Reihenfolge, `end_image` = letzter Wegpunkt, Dauer gleich der Pfaddauer (bis 30 s).

Ergebnisse liegen unter `renders/walkthrough/<top>/` (k = Blender, staging_k = eingerichtet, Video als MP4).

## Schnittansicht (Gebäude geschossweise aufgeschnitten)

Vorbild ist das Revit-Reel aus KONZEPT.md, Abschnitt 8: eine feste Axonometrie-Kamera von schräg oben auf die Ecke,
das Gebäude wird oberhalb einer Schnitthöhe entfernt, das Geschoss darunter ist von oben mit Innenwänden zu sehen.
Modellbau-Ästhetik (warmweißes Modell, geschnittene Wände dunkel, Böden hell), echte Sonne, Umgebung wie bei `render`.
Hervorgehobene Wohnungen liegen als Bodenfläche in UNIO-Signalfarbe #FFAA09 im Modell.

```bash
# nur Kontrollbilder Plan gegen extrahierte Wände (Sekunden)
.venv-immoviz/bin/python immoviz/immoviz.py schnitt immoviz/projects/wimmergasse-20 --nur-check
# Vorschau aller Zustände (640x400, 8 Samples), einzelne Zustände mit --zustand s01,s04
.venv-immoviz/bin/python immoviz/immoviz.py schnitt immoviz/projects/wimmergasse-20 --preview
# Final (1920x1080, 48 Samples, ca. 4 bis 5 Minuten je Bild auf 4 CPU-Kernen)
.venv-immoviz/bin/python immoviz/immoviz.py schnitt immoviz/projects/wimmergasse-20
```

Ergebnisse unter `renders/schnitt/`: `s00.png` bis `s05.png`, `uebersicht.jpg` (alle Zustände mit Titel und
Schnitthöhe), `check_<geschoss>.jpg` (Plan hell, Wände rot, Fenster blau, Türen grün, OGD-Umriss türkis,
Umrissergänzung violett, Wohnungen orange).

Konfiguration in `wohnungen.yaml` unter `schnitt:` (Code in `lib/section.py`):

| Schlüssel | Inhalt |
|---|---|
| `geschosse` | je Geschoss Planseite, `corner_px` (Gebäudeecke im Raster, je Blatt prüfen), `ffb` (Kote), `decke` [UK, OK], Fensterbrüstung und -sturz; Dachgeschoss als `typ: dach` aus der Dachkubatur plus Wohnung aus `wohnungen` |
| `umriss_plus` | Polygone, die der Plan als Gebäude zeigt, der OGD-Umriss aber nicht |
| `fassadenwand_m` | Straßenwände massiv mit den Öffnungen aus `altbau.rows` (wie die Fassade), Planwände erst dahinter |
| `wohnungen` | hervorgehobene Wohnungen: Geschoss, Polygon lokal (x Stolberggasse, y Wimmergasse), `ohne` für Aussparungen |
| `kamera` | Ziel, Azimut, Höhenwinkel, sichtbare Breite (orthografisch) |
| `zustaende` | Name, Titel, Geschoss, Schnitthöhe (FFB + 1,20 m), Wohnungen |
| `licht`, `exposure`, `farben` | Lichtstimmung aus `project.yaml`, Belichtung, Modellfarben |

Grenzen: Wände nur aus Vektorplänen mit grau gefüllten Wänden (wie `interior`); Treppen, Möbel und Schächte fehlen,
der Boden läuft über das Stiegenhaus. 1. und 2. DG haben keinen Grundriss und bleiben geschlossene Volumen; im 3. DG
gibt es nur die Wände von Top 35, die übrigen Flächen sind offen mit Außenwänden am Umriss. Deckenstärken und die
Kote des 2. OG sind Annahmen. Deckungsgleiche Flächen werden in Cycles schwarz, daher sind gleich hohe Platten um
Millimeter versetzt.

## Projekt-Website (anklickbare Wohnungen im Schnitt)

Statische Projektseite aus den vorhandenen Bildern, ohne Build-Schritt: Hero mit Hauptmotiv und Kennzahlen,
"Das Haus" (Außenbilder, Jahreszeiten), "Wohnungen" (Schnittbild mit Geschoss-Umschalter, Wohnungen als
SVG-Hotspots, Klick öffnet ein Seitenpanel, auf dem Handy ein Blatt von unten), "Bewegtbild", "Lage", Kontakt
(Platzhalter) und der Hinweis "Unverbindliche Visualisierung". Gestaltung nach UNIO-Designsystem, Power Grotesk
eingebettet, hell und dunkel, ab 360 px, Tastatur (Tab, Enter, Esc) und `prefers-reduced-motion`.

```bash
# Seite erzeugen: projects/<p>/website/index.html plus media/ (Bilder max 2000 px und 1000 px, Videos 1280 px H.264 crf 26)
.venv-immoviz/bin/python immoviz/immoviz.py website immoviz/projects/wimmergasse-20
# Hotspots aus der Schnittkamera neu berechnen (Blender ohne Rendering, Sekunden), danach Seite bauen
.venv-immoviz/bin/python immoviz/immoviz.py website immoviz/projects/wimmergasse-20 --hotspots
# Ansehen
cd immoviz/projects/wimmergasse-20/website && python3 -m http.server 8000
```

- Inhalte in `projects/<p>/website.yaml` (Texte, Kennzahlen, Bildzuordnung, Wohnungsdaten). Was nicht bekannt ist
  (Zimmer, Preise, Kontakt), steht dort als "auf Anfrage" oder Platzhalter und erscheint so auf der Seite.
- Hotspots: `lib/hotspots.py` projiziert die Polygone aus `wohnungen.yaml` (`schnitt.wohnungen`, Aussparungen
  `ohne` abgezogen) mit derselben Axonometrie-Kamera auf Bodenhöhe des Geschosses (FFB + 2 cm) in Pixel der
  Schnittbilder (1920 x 1080). Ergebnis `renders/schnitt/hotspots.json` (`zustaende.<zustand>.<top>`: Punkte x, y),
  Kontrolle `renders/schnitt/hotspots_check.jpg` (Umrisse in s01 und s04). Ändert sich die Kamera, `--hotspots`.
- Neue Wohnung: Polygon und Zustand in `wohnungen.yaml` (`schnitt`), Daten und Bilder in `website.yaml`
  (`wohnungen.<top>`, `zustand` = Schnittbild, in dem sie liegt).
- Code: `lib/website.py` (Generator), `lib/website_template.html` (Seite mit CSS und JS). `website/` ist Ausgabe
  und nicht im Repo.

## Studio-Oberfläche

Lokale Web-Oberfläche über dem Prototyp (Phase B und C laut `KONZEPT.md`), im UNIO-Design, hell und dunkel, bis 400 px Breite.

```bash
.venv-immoviz/bin/pip install fastapi uvicorn ruamel.yaml   # einmalig
.venv-immoviz/bin/python immoviz/immoviz.py studio      # http://127.0.0.1:8765
.venv-immoviz/bin/python immoviz/immoviz.py studio --dry-run   # Queue startet kein Blender (Test)
# Tests auf einer Kopie: andere Projektwurzel (Standard immoviz/projects)
.venv-immoviz/bin/python immoviz/immoviz.py studio --dry-run --projects /pfad/zur/kopie/projects
IMMOVIZ_PROJECTS=/pfad/zur/kopie/projects .venv-immoviz/bin/python immoviz/immoviz.py studio   # gleichwertig
```

| Bildschirm | Inhalt |
|---|---|
| Projekte | alle Ordner unter `projects/` mit `project.yaml`, Fortschritt der 10 Schritte, letzte Bilder |
| Übersicht | Status je Schritt, abgeleitet aus den Dateien; von Hand überschreibbar |
| Intake | Checkliste aus diesem README mit Ampel und Notiz, Upload per Drag and Drop nach `quellen/` mit Zuordnung zu einem Punkt, Anfrage-Text an den Bauträger |
| Shotlist | Matrix Motiv x Licht aus `cameras` und `lights`, Thumbnails, Knopf „Vorschau rendern“ |
| Kameras | Lageplan aus `data/context.json` (Objekt hervorgehoben, Gehsteige grau) mit allen Kameras und Blickkegel; Klick setzt Position, zweiter Klick das Ziel; anlegen, ändern, umbenennen, löschen |
| Licht | Lichtstimmungen aus `lights` anlegen, ändern, löschen; Sonnenhöhe und Azimut live (`lib/sun.py`), Sonnenrichtung über dem Lageplan, Uhrzeit-Schieberegler |
| Neues Objekt | Formular (Slug, Adresse, GK-Ursprung, Fassadenrichtung, Fassaden): legt `projects/<slug>/` aus `projects/_vorlage/` an, optional `immoviz.py geo` über die Queue, siehe unten |
| Fassaden | Straßenansicht aus `checks.<fassade>.pdf` als Hintergrund (pdftoppm, Cache `data/plan_cache/`), maßstäblich über `dpi`, `scale`, `u0_px`. Werkzeuge: Achsen (Klick setzt, Ziehen verschiebt, Entf löscht, Pfeiltasten 5 cm), Geschosse (`altbau.rows`, Band ziehen, Kanten ändern die Höhe), Gesimse (`altbau.cornices`, Ziehen verschiebt alle Stufen), Erdgeschoss (Override je Achse: Haustor, Schaufenster, Kastenfenster mit u- und z-Bereich, Keller), Plan kalibrieren (PDF, Seite, dpi, Maßstab, Klick auf u = 0 / z = 0, Ausschnitt, Höhenkoten). Raster 5 cm, Einrasten an Höhenkoten und vorhandenen Linien in 8 px Umkreis, Alt-Taste frei |
| Dach | Listen `dach.walls`, `slopes`, `volumes`, `railings`, `slabs` mit Formular je Eintrag (Paare als zwei Zahlen, Fenster und Clip-Regeln als JSON), neu, duplizieren, löschen; Ansichtsskizze je Fassade (u gegen z) mit Altbau, Achsen, Wänden, Fenstern, Schrägen, Geländern, Volumen |
| Abgleich | „Planabgleich prüfen“ startet `immoviz.py check <projekt> --facade <f>` über die Queue; Ergebnis als Plan und orthogonales Modell mit Schieberegler, dazu die rot/blaue Überlagerung aus `renders/check/`. Darunter „Straße prüfen“: startet `immoviz.py strasse <projekt> --ohne-streetview` über die Queue und zeigt das Prüfbild mit Gehsteigbreiten und Parkordnung je Fassade |
| Queue | ein Job gleichzeitig: `immoviz.py render <projekt> --cam <c> --light <l> --preview --no-blend`, Planabgleich, `geo`, Higgsfield-Aufträge mit geschätzten Credits; Status und Log |
| Galerie | alle Bilder und Videos unter `renders/`, Freigeben, Ablehnen, Kommentar; „Veredeln“ je Blender-Bild und „Video erzeugen“ (Higgsfield, siehe unten); Higgsfield-Bilder mit Verweis auf Original und Prompt; Videoplayer für `renders/video/` und `renders/walkthrough/<top>/`, Kamerapfade je Wohnung aus `wohnungen.yaml` (nur Anzeige); Kundenlinks erzeugen und widerrufen |
| Kundenansicht | `/kunde?p=<slug>&t=<token>`: nur freigegebene Bilder und Videos, Kunde kann Anmerkungen schreiben. Ohne Token nur von localhost |

Higgsfield-Veredelung (Knopf „Veredeln“ in Shotlist und Galerie): Prompt aus Bausteinen in `projects/<p>/prompts.yaml`
(Geometrie-Sperre, Objekt, Licht und Jahreszeit je Lichtstimmung über `zuordnung`, Umgebung, Negativ; innen Altbau oder
Dachgeschoss, Raum, Licht), vor dem Absenden editierbar; bis zu drei Referenzbilder aus der Galerie, Format, Auflösung,
geschätzte Credits (Bild ca. 1,5, Video Kling 5 s ca. 16), Bestätigung. Ergebnis in
`renders/higgsfield/<motiv>_<licht>_<zeit>.jpg`, Metadaten in `renders/higgsfield/index.json`. Video-Dialog: Start-,
End- und Zwischenbilder aus der Galerie, Dauer 5 oder 10 s, Prompt. Im Kopf steht das Guthaben bzw. „Trockenlauf“.
Schlüssel nur aus `HIGGSFIELD_API_KEY` und `HIGGSFIELD_API_SECRET`; ohne Schlüssel oder mit `--dry-run` Trockenlauf
(Ergebnis = Eingangsbild). Stand der API und offene Punkte: `higgsfield/API.md`.

Zuordnung in der Shotlist: Blender-Bilder nach `<slug>_<motiv>_<licht>_(vorschau|final)`, Higgsfield-Bilder in
`renders/higgsfield/` zusätzlich über Motiv- und Lichtnamen im Dateinamen (z. B. `herbst_ecke_orbit`, `ecke_dunst_nbpro`).

Datenhaltung je Projekt:

- `project.yaml`, Fassaden-, Dach-Editor und Neues Objekt: ersetzen nur die betroffenen Blöcke (z. B.
  `altbau.facades.<f>.axes`, `altbau.facades.<f>.eg`, `altbau.rows`, `altbau.cornices`, `checks.<f>`, `dach.<liste>`)
  mit `yamledit.replace_blocks`. Alles außerhalb bleibt zeichengenau; im Block bleiben unveränderte Einträge
  zeichengenau, Kommentare am Zeilenende und Kommentarzeilen wandern mit ihrem Eintrag, Zahlformate unveränderter Werte
  bleiben (4.40). Gegenprüfung über die ganze Datei, Sicherung in `.history/`, Prüfung der Werte im Server.
- `project.yaml`: Kamera- und Licht-Editor ändern nur den betroffenen Eintrag unter `cameras` bzw. `lights`
  (zeilengenau, Kommentare, Ausrichtung und alle anderen Zeilen bleiben, `studio/yamledit.py` mit ruamel.yaml).
  Vor dem Schreiben: Prüfung (Namen nur `[a-z0-9_]`, Zahlen in sinnvollen Grenzen, Pflichtfelder `pos`, `target`,
  `lens` bzw. `date`, `time`, `tz`; `season` aus fruehling, sommer, spaetsommer, herbst, winter), Gegenprüfung des
  Ergebnisses (alle anderen Abschnitte unverändert) und Sicherung nach `.history/project.<zeitstempel>.yaml`
  (nicht eingecheckt). Lichter, die `wohnungen.yaml` verwendet, lassen sich nicht löschen oder umbenennen.
  Neue Kameras und Lichter erscheinen sofort in Shotlist und Queue.
- `status.json`: von Hand gesetzter Schrittstatus (alternativ optionales Feld `status: {4: annahme}` in `project.yaml`)
- `intake.json`: Stand der Intake-Checkliste, unter `dateien` die Zuordnung hochgeladener Dateien zu Punkten
- `quellen/`: Upload PDF, DWG, JPG, PNG, XLSX, DOCX bis 100 MB; Dateiname wird gesäubert (Umlaute, Sonderzeichen,
  keine Pfade), bei gleichem Namen `_2`, `_3`; Inhalt muss zur Endung passen. `quellen/*.pdf` bleibt gitignored.
- `freigabe.json`: Freigabe, Ablehnung und Kommentare je Bild (Kundenkommentare mit `quelle: kunde`)
- `kundenlinks.json`: je Link nur SHA-256 des Tokens, Ablaufdatum, Notiz, Widerruf, letzter Zugriff. Das Token
  steht nur einmal in der Oberfläche (Galerie, Abschnitt Kundenlinks).

Zugriff: Anfragen von localhost dürfen alles. Alle anderen Anfragen (auch über einen Proxy mit `X-Forwarded-For`)
bekommen nur die Kundenansicht mit gültigem Token und die freigegebenen Dateien dieses Projekts, sonst 403.
Für Kunden außerhalb also das Studio hinter einem HTTPS-Proxy betreiben und im Kundenlink den Rechnernamen
durch die öffentliche Adresse ersetzen. Das Team arbeitet lokal (oder per SSH-Tunnel); eine Team-Anmeldung
gibt es noch nicht. Thumbnails und Job-Logs liegen in `immoviz/studio/.cache/` (nicht eingecheckt).

## Neues Objekt anlegen

Ziel: ein Objekt in etwa einem Tag aufnehmen, ohne YAML von Hand zu schreiben. Im Studio (`immoviz.py studio`):

1. **Projekte, „Neues Objekt“**: Slug, Name, Adresse, Gebäudeecke in GK Ost (`site.origin_gk`, aus dem Baukörpermodell
   oder ViennaGIS), Fassadenrichtung (`site.x_axis_deg`, Fassade A gegen Ost), Fassade A (entlang +x) und optional
   Fassade B an der Ecke (entlang +y zum Ursprung) mit Namen und Länge. Das Studio legt `projects/<slug>/` mit
   `quellen/`, `data/`, `renders/`, `project.yaml` aus `projects/_vorlage/project.yaml` (Beispielwerte mit
   Kommentaren, leere Achsen) und `prompts.yaml` an und startet auf Wunsch `immoviz.py geo` über die Queue.
2. **Intake**: Straßenansichten (Vektor-PDF 1:100), Schnitt, Grundrisse hochladen.
3. **Fassaden, „Plan kalibrieren“**: PDF, Seite, dpi und Maßstab wählen, im Plan auf u = 0 / z = 0 klicken, Ausschnitt
   und Höhenkoten setzen. Danach **Achsen** über die Fensterachsen klicken, **Geschosse** an die Fenster ziehen
   (Unterkante, Höhe, Breite, Typ, Umrahmung), **Gesimse** verschieben, **Erdgeschoss** je Achse festlegen. Jede
   Fassade einzeln; Geschosszeilen und Gesimse gelten für alle Fassaden.
4. **Dach**: Wände, Schrägen, Volumen, Geländer und Decken aus Schnitt und DG-Grundrissen eintragen, Skizze prüfen.
5. **Abgleich**: „Planabgleich prüfen“, mit dem Schieberegler Achsen, Gesimse und Dachkanten gegen den Plan prüfen.
   Danach „Straße prüfen“: Parkordnung, Gehsteige und Bäume vor dem Haus gegen das Orthofoto, Korrekturen in
   `street.parking` und `trees_override`.
6. Angebaute Nachbarn und Häuser gegenüber (`neighbour_facades`) weiterhin in `project.yaml` (noch ohne Editor),
   Kameras und Licht im Studio, Vorschau rendern, dann die virtuelle Begehung (`begehung`, `begehung.md` ohne offene
   Abweichung "hoch"). Erst dann Higgsfield (Regel U11: jede Straßen- und Luftkamera erst nach bestandener Begehung
   veredeln).

Ohne Studio: Ordner wie oben von Hand anlegen (am besten `_vorlage` kopieren), `site.origin_gk`, `x_axis_deg` und
`facades` nach `immoviz.py geo` aus dem Baukörpermodell ablesen. Jede Zahl bekommt im YAML-Kommentar ihre Quelle.

## Neubauten und Hoftrakte (`neubau`, erstes Objekt NOMA Schlachthausgasse 13)

Objekte ohne Gründerzeitfassade beschreiben ihre Baukörper in `project.yaml` unter `neubau` (Code `lib/neubau.py`,
nur aktiv, wenn der Abschnitt vorhanden ist; `altbau` und `dach` sind dann optional): `koerper` (Prismen mit
`ohne_kanten`), `fassaden` (Wand mit Fenstern an einer Linie a nach b, `reihen` wie bei Fensterachsen), `boxen`,
`gelaender` (Stab, Glas, voll), `flaechen` (Gründach, Terrassen, Rasen), `schraegen` (Mansarde), `pv`, `straeucher`.
Jeder Eintrag gehört zu einer `gruppe` (eigene Blender-Objekte), `rahmen: <name>` rechnet Koordinaten eines gedrehten
Hilfsrahmens (`neubau.rahmen`) ins Lokalsystem. Innenräume blenden mit `objekt_ausblenden: [<gruppe>]` nur die eigene
Hülle aus. Verkaufspläne mit Volltonwänden: in `wohnungen.yaml` unter `plaene` `wand_farbe`, `drehung_grad`,
`ursprung_lokal`, `cache`; je Wohnung `slab_px`, `oeffnungen_px`, `oeffnung_max_m`, `fenster_stil: modern`.
Bäume auf Dachgärten: `trees_override` mit `z`. Beispiel und Befunde: `projects/noma-shg13/README.md`.

## Datenquellen

- Stadt Wien Open Data (CC BY 4.0): Baukörpermodell `FMZKBKMOGD`, Baumkataster `BAUMKATOGD`,
  Verkehrsflächen `FMZKVERKEHR1/2OGD`, Gebäudeinformation `GEBAEUDEINFOOGD`, Höhenlinien `HOEHENLINIEOGD`, Adressdienst.
- Stadt Wien MA 41 (CC BY 4.0): Generalisiertes Dachmodell LOD2 als CityGML je Blatt 1:1000
  (`https://www.wien.gv.at/ma41datenviewer/downloads/geodaten/lod2_gml/<blatt>_lod2_gml.zip`, Blattnummer
  RE = 100 + x/500, HO = y/500 - 600 in GK Ost, Datenstand 2016) und Orthofoto 2024 (WMTS
  `https://mapsneu.wien.gv.at/wmts/lb2024/farbe/google3857/{z}/{row}/{col}.jpeg`) für Dachfarbe und Kontrolle.
  Ebenfalls erreichbar, aber nicht genutzt: Oberflächenmodell `dom_tif/<blatt5000>_dom_tif.zip` (Stand 2015)
  und Geländemodell `dgm_tif`.
- Google Maps wird nicht verbaut (Lizenz), nur als interne Referenz: Street View über `svcheck`, Photorealistic
  3D Tiles über `referenz` (Bilder nur in `renders/streetview/referenz_google/`, nicht im Repo). Der Schlüssel steht ausschließlich in der
  Umgebungsvariable `GOOGLE_MAPS_API_KEY`.

## Intake-Checkliste je Objekt

- [ ] Straßenansichten aller Straßenfassaden, 1:100, als Vektor-PDF oder DWG
- [ ] Schnitt mit Höhenkoten (Wiener Null), Grundrisse aller Geschosse inkl. Dachgeschosse
- [ ] Farbkonzept mit Herstellerfarbtönen, Bau- und Ausstattungsbeschreibung
- [ ] Fotos vom Bestand (Fassade, Details, Ausblicke), falls vorhanden
- [ ] Mood-Referenzen: 15 bis 20 Bilder „so soll es wirken“, 3 bis 5 „so nicht“
- [ ] Kameras und Lichtstimmungen mit dem Vertrieb abgestimmt

## Korrekturschleife: Regeln, Freigabe, Nachkontrolle

Verbindliches Regelwerk mit Begründung je Regel in `REGELN.md`, Ablauf in `KONZEPT.md` Abschnitt 9. Ohne Blender,
Sekunden je Aufruf:

```bash
.venv-immoviz/bin/python immoviz/immoviz.py pruefen --projekt immoviz/projects/noma-shg13        # Quellen je Element
.venv-immoviz/bin/python immoviz/immoviz.py freigabe --projekt immoviz/projects/noma-shg13       # Modellfreigabe je Kamera
GOOGLE_MAPS_API_KEY=... .venv-immoviz/bin/python immoviz/immoviz.py begehung --projekt immoviz/projects/wimmergasse-20  # U11, mit Blender
.venv-immoviz/bin/python immoviz/immoviz.py prompt --projekt immoviz/projects/noma-shg13 --cam garten_top4_weit
.venv-immoviz/bin/python immoviz/immoviz.py nachkontrolle --vorschau <vorschau.png> --veredelt <bild.jpg>
```

- Neue Elemente in `project.yaml` und `wohnungen.yaml` bekommen ein Feld `quelle` (`"EIN S. 16"`, `"OGD Orthofoto"`,
  `"ANN Raster 5 m"`), Beispiele in `projects/_vorlage/project.yaml`. Kommentare mit `[Kürzel]` zählen für den
  Altbestand als Warnung.
- **Plan-Soll-Liste** (Block `soll:` in `project.yaml`, `lib/soll.py`, seit 18.11.2026): Anzahl Fenster je Fassade
  und Geschoss, Geländerfelder je Fassade bzw. Gruppe, Straßenleuchten je Straßenabschnitt, aus dem Plan gezählt.
  `pruefen` zählt dasselbe im Modell (gleiche Logik wie `build.py`/`neubau.py`, ohne Blender) und meldet jede
  Abweichung als FEHLER (Ampel rot, Exit 1); Geländer im Modell ohne Soll-Zeile sind ebenfalls Fehler. Geschoss nach
  Unterkante der Öffnung (`geschosse`, je Fassade überschreibbar), Neubau-Fassaden über `fassaden: {name: {gruppen,
  linien, dachfenster_bereich}}`, Leuchten über `strang` und `bereich`. Beispiele: Wimmergasse (ANS, GR, DG-Grundrisse)
  und Noma (EIN S. 26/28, Geländertabelle G1 bis G10). Die Klassenampel (`gruen`/`gelb`/`rot`) steht je Klasse in der
  Tabelle; "Geländer grün" heißt: jedes Geländer mit Feld `quelle`.
- Dach-Geländer (`dach.railings`): `typ: vsg` (Ganzglas in der Fensterleibung, französisches Fenster), `stab`, `glas`;
  `felder: [[u0, u1], ...]` für mehrere gleiche Felder; Loggien `rails: [{z: [z0, z1], typ, quelle}]`; Material
  `gelaender_metall` (Farbe `materials.gelaender`), damit die Ebenen sie als Klasse `gelaender` schützen.
- `freigabe.yaml` je Projekt (Vorlage in `projects/_vorlage/`): Veredelung im Studio nur für freigegebene Kameras.
- Prompt-Regeln für alle Projekte: `higgsfield/prompt_regeln.yaml`, werden automatisch angehängt (LEITFADEN).
- Code: `lib/quellen.py`, `lib/soll.py`, `lib/freigabe.py`, `lib/nachkontrolle.py` (numpy, scipy, Pillow).

## Render-Ebenen und Schutzmaske (`render --ebenen`, `schutz`)

Prinzip wie Element Preservation in Profi-Werkzeugen: Gebäude und Planelemente kommen pixelgenau aus Blender, die
Bild-KI darf nur Himmel, Vegetation, Menschen, Boden und Stimmung bearbeiten. Grund: springende Fenster, erfundene
Küchen hinter Fenstern, hängende statt stehende Laternen in den Runden 5 und 6 (REGELN.md V6).

```bash
# 1. Render mit Ebenen (zusätzlich zum Bild, kostet nur das Schreiben der Passes)
.venv-immoviz/bin/python immoviz/immoviz.py render immoviz/projects/wimmergasse-20 --cam ecke --light golden_hour --ebenen
# 2. Veredelung wie bisher (Higgsfield, Bild 1 = Render)
# 3. Gebäude und Planelemente aus dem Render zurücksetzen, Farbstimmung der KI übernehmen
.venv-immoviz/bin/python immoviz/immoviz.py schutz --render <render.png> --ki <veredelt.jpg> --ebenen <ordner> [--out x.jpg]
```

**Ebenen** (`lib/ebenen.py`): Cycles schreibt Tiefe, Normalen, Objekt- und Material-Index; jedes Objekt und jedes
Material bekommt einen eindeutigen Pass-Index, die Klasse je Paar (Objekt, Material) kommt aus der Tabelle `REGELN`
in `lib/ebenen.py` (Namensmuster auf Objekt, Material und Collection, erste passende Regel gilt). Die Passes werden
als unkomprimierte EXR zwischengespeichert, mit einem eigenen Leser (nur numpy) gelesen und als PNG abgelegt in
`renders/<unterordner>/<kamera>_<licht>_ebenen/` (PNG nicht im Repo):

| Datei | Inhalt |
|---|---|
| `<klasse>.png` | Maske je Klasse: gebaeude_objekt, fenster_glas (auch Innenraum hinter Glas), fenster_rahmen (auch Tore, Bleche), gelaender, leuchten, strassenmoebel, autos, baeume, vegetation (Gründach, Pflanzen, bepflanzte Tröge, Hecken, Sträucher; Neubau-Teil `<gruppe>_gruen`), ausstattung (Terrassenmöbel, Pergola, Kissen, Kübel; `neubau.ausstattung`), menschen_platzhalter, nachbarn, boden, himmel, sonstige |
| `klassen.png` | Übersicht, eine Farbe je Klasse |
| `tiefe.png` | 16 Bit, logarithmisch 0,1 m bis 30 km (`d = 0,1 * 300000^(v/65535)`), Himmel 65535 |
| `normalen.png` | Weltnormalen (Projektsystem), `n = rgb/127,5 - 1`, Himmel schwarz |
| `kanten.png` | Tiefensprünge (zweite Differenz über 3 %), Normalenknicke über 25 Grad, Rand zum Himmel |
| `schutz.png` | Vereinigung der geschützten Klassen mit 2 px weicher Kante |
| `ebenen.json` | Bildanteil je Klasse, Schutzklassen, Kodierungen, Fassadennormalen, Brennweite in Pixeln (`kamera_intern.f_px`), `nicht_zugeordnet` (Objekt/Material ohne Regel mit Bildanteil) |
| `hintergrund/` | zweiter Durchgang ohne Menschen-Platzhalter und Autos, nur im Ausschnitt um diese Objekte (Border-Render): `beauty.png`, dieselben Ebenen, `bereich.png`; liefert die Fassade und den Boden dahinter. Abschalten mit `IMMOVIZ_HINTERGRUND=aus` |

Geschützt sind standardmäßig gebaeude_objekt, fenster_glas, fenster_rahmen, gelaender, leuchten, strassenmoebel und
autos. Nicht geschützt (die KI darf sie realistisch zeichnen, Blender gibt Lage und Größe vor): baeume, vegetation,
ausstattung, Menschen, Boden, Himmel, Nachbarn. Ein Trogkörper bleibt Planelement (Gebäude); nur Pflanzen, Substrat
und Objekte oder Materialien mit `bepflanzt` zählen als vegetation. Je Projekt in `project.yaml`: `schutz: [..]` oder `schutz: {klassen: [...], plus: [nachbarn], minus: [autos],
kante_px: 2}`; Abweichungen nur mit Begründung im Kommentar. Neue Assets (Straßenleuchten, Bänke, Menschen-Platzhalter,
Bäume aus `lib/assets/`) werden über ihre Namen erkannt (`leuchte|laterne|lampe|mast`, `bank|poller|schild|fahrrad`,
`mensch|person|figur`, `baum|krone|stamm|laub|rinde`, Collection-Namen zählen auch, Collection-Instanzen erben die
Klasse des Platzhalter-Empties); steht etwas unter `nicht_zugeordnet`, Muster in `REGELN` ergänzen.

**Schutz-Kompositing** (`lib/kompositing.py`):

1. Ausrichtung: Ähnlichkeitstransformation aus der Nachkontrolle, dann OpenCV ECC (Homographie, `--ausrichtung
   aehnlich|affin|homographie`) auf Gradientenbildern, nur auf der Architektur des Objekts; gilt nur, wenn der
   Kantenabstand kleiner wird.
2. Farbabgleich: lokale Lab-Statistik (Mittelwert, Streuung; Gauss-Fenster 6 % und nahe der Maskenkante 1,5 % der
   Bildbreite) der KI auf die Blender-Pixel, getrennt für Glas, Autos und übrige Schutzklassen, Streuungsverhältnis
   0,5 bis 2. Ändert nur Farbe und Helligkeit, nicht die Kanten. `--farbe 0..1` regelt die Stärke.
   Pixel, die stark von der KI abweichen (dE über 20, z. B. KI-Laub oder Personen vor der Fassade), zählen nicht
   in die Statistik, sonst färben sie die Fassade fleckig ein.
3. Hintergrund: hinter Menschen-Platzhaltern, Bäumen vor dem Objekt und Platzhalter-Autos (wenn nicht geschützt)
   kommt die Fassade aus dem zweiten Durchgang `hintergrund/`; realistische Autos (`ebenen.json` `autos: modelle`)
   werden nicht ersetzt, die KI übernimmt sie. Ohne ihn blieben dort KI-Pixel stehen: sichtbare Umrisse der Platzhalter und eine
   Naht auf Autohöhe.
4. KI-Vordergrund erhalten (`vordergrund_finden`, abschaltbar mit `--ohne-vordergrund`): Personen, Radfahrer und
   Autos, die die KI vor die geschützte Fassade stellt, bleiben KI. Auf 1920 px Breite: dE zwischen KI und
   farbangeglichenem Render über 14 (auf Glas über 26, geschützte Autos nie), Öffnen mit einer Scheibe von 4 px Radius
   (Fensterrahmen, Stangen, Kanten fallen weg). Ein Fleck zählt, wenn er die geschützte Fläche berührt, mit mindestens
   60 px auf dem Boden steht, sein Fußpunkt laut Render-Tiefe mindestens 0,4 m vor der Fassadenbasis liegt; erhalten
   wird er bis 2,4 m über dem Fußpunkt (Höhe aus Tiefe und Brennweite). Erfundene Fenster, Erker oder Bäume an der
   Fassade stehen nicht am Boden vor der Fassade und werden weiter zurückgesetzt. Ausnahme Menschen-Platzhalter (seit
   18.11.2026): Flecken in einer Zone um jeden Platzhalter (seitlich eine Platzhalterbreite, oben 25 %) sind die Person,
   die die KI dort einsetzen soll, und bleiben ohne Boden- und Tiefenprüfung KI (sonst blieben bei Personen dicht an der
   Fassade nur die Beine). Helle Mäntel vor hellem Putz fallen teils weg: im Prompt dunkle Kleidung verlangen.
   Parameter in `VG`.
5. Ergebnis = Schutzmaske (ohne Vordergrund, 2 px weiche Kante) x Blender (farbangeglichen) + Rest x KI. Schatten,
   Spiegelungen, Menschen und Bäume der KI außerhalb des Schutzbereichs bleiben.
6. Ausgabe `<ki>_schutz.jpg` (oder `--out`), daneben `_pruefung.jpg` (Render mit Hintergrund, KI ausgerichtet, Maske
   rot und erhaltener KI-Vordergrund grün, Ergebnis) und `.json` (zusätzlich `hintergrund` und `vordergrund` mit den
   erhaltenen und verworfenen Flecken): Ausrichtung (Modell, Maßstab, Verschiebung, ECC, Kantenabstand Render zu KI in px), Schutzbereich
   vorher/nachher (Kanten: Präzision = starke Kanten nahe einer Render-Kante, Vollständigkeit = Render-Kanten im
   Bild, F1; mittlerer Kantenabstand; Gradientenkorrelation; Farbabweichung dE), dieselben Kanten je Klasse, Anteil
   der geschützten Fläche. Exit 1, wenn Kanten-F1 nachher unter 0,95.

**Schutz mit Toleranz** (`schutz ... --modus toleranz`, seit 18.11.2026, Standard bleibt `voll` bis zur Freigabe):
statt den ganzen Schutzbereich aus dem Render zu nehmen, bleibt die KI je Bauteil, wenn sie geometrisch passt.

1. Elastische Feinausrichtung nach der Homographie (`fein_ausrichten`): die Bild-KI verzieht die Fassade örtlich
   (gpt_image_2_6, 4k: Median 2 px, 90 % unter 6,5 px). Optischer Fluss (OpenCV DIS) auf ausgeglichenen Graubildern,
   kantengewichtet geglättet (6 px), höchstens 10 px, außerhalb des Bauteilbereichs auslaufend.
2. Komponenten (`komponenten_bilden`): je Fenster (Glas plus Rahmen; Glasfronten gekachelt), Geländerfeld,
   Leuchte, Straßenmöbel; Gebäudeflächen als Segmente zwischen Tiefen- und Normalensprüngen (`kanten.png`), als
   Dachfläche (Normale aus der Render-Tiefe näher als 50 Grad an "oben" = Bodennormale), Gesims (flach und lang) oder
   Fassadenfeld, alle Flächen in Kacheln von 256 px.
3. Je Komponente (4k-Pixel, `TOL` in `lib/kompositing.py`): Kantenabstand Render zu KI (Mittel, höchstens 1,5 px),
   Kanten-F1 der Bauteilkanten (Bilder geglättet, damit Putzkorn und Ornament der KI nicht zählen, mindestens 0,9,
   Toleranz 2 px), örtlicher Versatz (Gradienten-Korrelation, nur bei zweidimensionaler Struktur, höchstens 1,5 px),
   flache Felder: starke KI-Kanten ohne Render-Kante (erfundene Bauteile). Fenster zusätzlich: Lage und Fläche des
   Glases (gleiches Farbmodell Rahmen gegen Glas auf Render und KI), Sprossen und Riegel (Anzahl und Lage), Innenleben:
   Glas mit großer Helligkeitsabweichung (mehr als 30 % der Pixel über 22 L) oder hellem Fleck (Lampe, Küche) wird
   allein zurückgesetzt. Fensterreihen: ab der Hälfte zurückgesetzter Fenster die ganze Reihe.
4. Zusammensetzen: zurückgesetzte Komponenten aus dem Render (Farbabgleich neu, feine Statistik an der Grenze zur
   behaltenen KI), Naht nach außen in die KI (Fenster 2 px, Flächen 16 px), alles innerhalb der Schutzmaske.
5. Ausgabe `<ki>_toleranz.jpg` (oder `--out`) mit `_pruefung.jpg`, `.json` (Abschnitt `toleranz`: Anteile je Typ,
   Gründe, Fensterreihen, `ki_behalten_prozent_schutz`; `ausrichtung.fein`), `_komponenten.jpg` (grün KI behalten,
   rot Render, orange nur Glas Render) und `_komponenten.json` (Kennzahlen je Komponente). Exit 1 unter Kanten-F1 0,90.

Test 18.11.2026 (Cloud, R7-KI-Rohbilder gpt_image_2_6, Render und Ebenen aus `r7_basis`, rund 60 s je Bild auf 4
CPU-Kernen; Bogen Runde 6 | Runde 7 | Runde 7 Toleranz im Scratchpad `pipeline/toleranz_test.jpg`, Ergebnisse in
`renders/higgsfield/r7_toleranz/`):

| Bild | KI behalten (Schutzbereich) | Fenster KI / Render / nur Glas | Fassadenfelder KI / Render | Kanten-F1 vorher / nachher |
|---|---|---|---|---|
| ecke golden_hour | 19,5 % | 16 / 96 / 7 | 304 / 290 | 0,85 / 0,97 |
| ecke herbst | 20,3 % | 15 / 93 / 5 | 296 / 302 | 0,86 / 0,97 |
| ecke_erhoeht golden_hour | 17,3 % | 17 / 111 / 6 | 269 / 344 | 0,83 / 0,97 |
| drohne golden_hour | 7,8 % | 7 / 119 / 6 | 121 / 107 | 0,81 / 0,98 |

Befund: Die freien KI-Bilder weichen auch nach der Feinausrichtung bei den meisten Fenstern ab (Sprossen und Riegel
anders, Rahmenprofile, Vorhänge, Lampen und Möbel hinter Glas), deshalb kommen 85 bis 95 % der Fenster weiter aus dem
Render. Behalten werden vor allem glatte Fassadenfelder, Dachflächen, Gesimsbänder und Seile; dort zeigt das Bild
Putz und Licht der KI. Gewinn gegenüber Runde 7 sichtbar, aber begrenzt; an Kachelgrenzen zwischen KI- und
Render-Putz bleiben weiche Übergänge sichtbar. Der größere Hebel ist eine KI, die die Geometrie von vornherein hält
(`ki-lokal`, unten); deren Ergebnis läuft durch denselben Toleranz-Schritt.

`--ohne autos` (bzw. `--klassen`) nimmt Klassen aus dem Schutz, z. B. solange die Autos in Blender nur Platzhalter
sind. Grenzen: KI-Bäume vor geschützten Flächen werden abgeschnitten, wo der Blender-Baum kleiner ist (Abhilfe:
Bäume im Modell richtig groß); Personen vor geschützten Autos bleiben nur mit `--ohne autos` ganz; Teile einer Person,
die farblich fast wie die Fassade aussehen, können fehlen (Prüfbild, grüne Fläche); Putz- und Stuckdetail der KI im Schutzbereich geht verloren, das Gebäude
ist das Blender-Material in der Farbstimmung der KI, gute Materialien in Blender sind also Pflicht; Ebenen und Render
müssen aus demselben Aufruf stammen.

**Nachkontrolle mit Ebenen**: `immoviz.py nachkontrolle --vorschau <render.png> --veredelt <bild.jpg> --ebenen <ordner>`
meldet zusätzlich unter `schutzzonen` je Zone (Fenster, Leuchten, Geländer, Gebäude) Kantenpräzision und
-vollständigkeit (Grenzen 0,90 / 0,85 / 0,90 / 0,85) und die Fensterzahl je Fassade: Fenster = Komponenten von Glas
plus Rahmen im Render, Fassade über die Normalen; im KI-Bild gilt ein Fenster als gefunden, wenn sein Glas wie das
Glas der KI aussieht (Lab-Klassifikator je Fassade, trainiert auf den Masken) oder sich deutlich von der Wand
abhebt; glasartige Flecken auf der Wand zählen als neue Fenster. Befund ab 2 neuen oder mehr als 8 % fehlenden
Fenstern. Bei 1200 px Breite auf etwa +-3 Fenster genau, bei 4k genauer.

Test 18.11.2026 (Wimmergasse `ecke`, `golden_hour`, 1200 x 800, 16 Samples, 36 s auf 4 CPU-Kernen; KI-Bild
`ecke_golden_r6.jpg` aus älterem Modellstand): Ausrichtung Homographie, Kantenabstand 0,8 px; geschützt 27 %;
Kanten-F1 im Schutzbereich vorher 0,79, nachher 0,98; Fensterzone Präzision 0,79 auf 0,98 (die KI hatte Lampen und
Möbel hinter die Fenster gesetzt), Fensterzahl Wimmergasse 58/57, Stolberggasse 22/22. Mit geschützten
Platzhalter-Autos sieht die Straße schlecht aus, deshalb im Test zusätzlich `--ohne autos`.

Test 18.11.2026 auf dem Mac (4k, 256 Samples, Metal; Hintergrund, Vordergrund und Laub wie oben): Render mit Ebenen
278 s (davon Hintergrund 64 s), `schutz` rund 30 s; Kanten-F1 im Schutzbereich 0,81 auf 0,99, alle Schutzzonen der
Nachkontrolle ok; Personen, Radfahrer und KI-Krone bleiben ganz, keine Umrisse der Platzhalter, keine Naht auf
Autohöhe (Einzelheiten `auftraege/2026-11-18_ebenen_test.md`, Abschnitt 7).

## Grading (`grading`)

Farbangleich an Leitbilder aus dem Referenzordner, danach dezente Objektivwirkung (`lib/grading.py`). Nur Farbe,
deshalb nach `schutz` anwendbar; Geometrie bleibt.

```bash
.venv-immoviz/bin/python immoviz/immoviz.py grading --bild <bild.jpg> --leitbild <ref1.jpg> [<ref2.jpg> ...] [--staerke 0.6]
# Leitbilder und Parameter aus project.yaml (look:), Referenzordner lokal über Umgebungsvariable
IMMOVIZ_REFERENZ=/pfad/zu/referenzen .venv-immoviz/bin/python immoviz/immoviz.py grading --bild <bild.jpg> \
    --projekt immoviz/projects/wimmergasse-20 --maske <ebenen>/schutz.png
```

Verfahren: Lab-Statistik der Leitbilder (zusammengelegt), Übertragung von Mittelwert (höchstens L +-12, a/b +-8) und
Streuung (Faktor 0,7 bis 1,4), Histogramm-Abgleich je Kanal mit Gewicht `histogramm` (0,5) und höchstens L +-10,
a/b +-6, Mischung mit `staerke` (0,6; mit `--maske` im Schutzbereich halb), dann Glow (helle Stellen, Screen),
Vignette, Filmkorn (Mitteltöne, fester Seed). Optionen `--vignette`, `--glow`, `--korn`. Ausgabe `<bild>_grading.jpg`,
`_pruefung.jpg` (vorher/nachher, ohne Leitbilder) und `.json` (Lab-Mittel und -Streuung vorher, nachher, Leitbild,
Abstand zum Leitbild).

```yaml
look:                                    # in project.yaml; Leitbilder bleiben außerhalb des Repos
  ordner: ${IMMOVIZ_REFERENZ}/wimmer/referenz
  leitbilder: [05_m41_pazelhof__....jpg, 13_zhiloy_herbsthof__....jpg]
  staerke: 0.5
  vignette: 0.12
  glow: 0.08
  korn: 0.008
```

Test 18.11.2026: Leitbilder 05, 13, 39 (Wimmergasse), Abstand Lab-Mittel zum Leitbild 5,7 auf 1,7.

## Lokaler KI-Schritt (`ki-lokal`, Mac)

Alternative zu Higgsfield: ein offenes Diffusionsmodell veredelt den Render auf dem Mac (M3 Max, Metal/MPS) mit
geringer Veränderungsstärke und wird dabei von Tiefe und Kanten aus den Render-Ebenen geführt. Die Geometrie bleibt
damit pixelgenau, Putz, Licht und Glas werden fotografisch. Danach `schutz --modus toleranz` und `grading`.
Installation zusätzlich zu `requirements.txt`: `requirements_ki.txt` (torch, diffusers, transformers, accelerate);
Modelle lädt der erste Lauf nach `~/.cache/huggingface` (rund 10 GB, nie ins Repo).

```bash
.venv-immoviz/bin/python immoviz/immoviz.py ki-lokal --render <render.png> --ebenen <kamera_licht_ebenen> \
    --staerke 0.3 [--modell sdxl_union|flux2_klein|flux1_dev_depth|flux1_dev_canny] [--prompt "..."] \
    [--steuerung tiefe,kanten] [--inpaint himmel,baeume,vegetation] [--offload aus|modell|sequenziell] \
    [--quant aus|int8|fp8] [--out x.jpg]
```

| Teil | Modell | Lizenz |
|---|---|---|
| Basis (Standard `sdxl`) | stabilityai/stable-diffusion-xl-base-1.0 | CreativeML Open RAIL++-M: kommerziell erlaubt, keine Rechte des Lizenzgebers an den Ausgaben, Nutzungsbeschränkungen Anhang A |
| Steuerung | xinsir/controlnet-union-sdxl-1.0, ProMax (Tiefe 1, Kanten 3, Tile 6, Inpaint 7) | Apache-2.0 |
| VAE | madebyollin/sdxl-vae-fp16-fix (fp16 ohne NaN auf MPS) | MIT |
| optional `realvisxl` | SG161222/RealVisXL_V5.0 (fotorealistische SDXL-Feinabstimmung) | openrail++ laut Modellkarte, Trainingsdaten nicht offengelegt: nur nach Freigabe |
| `flux2_klein` | black-forest-labs/FLUX.2-klein-4B (destilliert, Textkodierer Qwen3-4B), diffusers `Flux2KleinInpaintPipeline` (ab 0.38) mit voller Maske = Bild zu Bild, Render zusätzlich als Referenzbild | Apache-2.0, nicht gated: kommerziell frei |
| `flux2_klein --steuerung tiefe` (Versuch) | black-forest-labs/FLUX.2-klein-base-4B plus Gemeinschafts-LoRA thedeoxen/refcontrol-FLUX.2-klein-4B-reference-depth-lora (Referenz plus Tiefenbild) | Basis Apache-2.0; LoRA Apache-2.0 laut Modellkarte, Trainingsdaten nicht offengelegt: nur intern bis Freigabe |
| `flux1_dev_depth`, `flux1_dev_canny` | black-forest-labs/FLUX.1-Depth-dev bzw. FLUX.1-Canny-dev, `FluxControlImg2ImgPipeline` | FLUX.1 [dev] Non-Commercial License, gated: **nur interner Qualitätsvergleich**, gesperrt (siehe unten) |

FLUX.2 hat in diffusers keine Tiefen- oder Kantensteuerung (kein ControlNet, kein Control-Modell, Stand 0.43);
`flux2_klein` verfeinert deshalb ohne Steuerung mit niedriger Stärke, die Geometrie halten die geringe Stärke und das
Referenzbild. Nicht gewählt: FLUX.2 klein 9B und FLUX.2 dev (nicht kommerziell), SD 3.5 (Community License mit
Umsatzgrenze 1 Mio. USD). Z-Image Turbo mit Fun-ControlNet-Union (Apache-2.0) bleibt Kandidat für später.

Sperre für FLUX.1 dev (REGELN.md V9): Ausgaben tragen `_NUR_INTERN_nichtkommerziell` im Dateinamen, das JSON
`lizenz_kommerziell: false`; `schutz` und `grading` übernehmen die Markierung in ihre Ausgaben und lehnen jedes Ziel
unter `renders/higgsfield/` ab (`ki_lokal.lizenz_ziel`). Zugang: auf der Modellseite angemeldet die Lizenz bestätigen,
Lese-Token anlegen, `hf auth login` (früher `huggingface-cli login`); ohne Zugang endet `ki-lokal` mit Code 3.

Speicher (M3 Max, 36 GB): SDXL fp16 rund 10 GB. FLUX in bf16. `flux2_klein` rund 16 GB (Transformer 4B plus
Qwen3-4B), ohne Auslagern. `flux1_dev_*`: Prompt einmal auf der CPU mit CLIP und T5-XXL kodieren, Textkodierer
freigeben, auf der GPU nur Transformer 12B (bf16 rund 24 GB, `--quant int8` mit optimum-quanto rund 12 GB) und VAE;
`--offload modell|sequenziell` nur als Notlösung (langsam). Kacheln immer 1024 px.

Verfahren (`lib/ki_lokal.py`): Steuerbilder aus den Ebenen (inverse Tiefe, nah hell; Canny des Renders plus
`kanten.png`), Kacheln 1024 px (SDXL-Grundgröße) mit 256 px Überlappung und linearer Überblendung, je Kachel Lab-Mittel
und -Streuung halb an den Render (`--farbe-halten`, gegen Kachelnähte), Prompt kurz (SDXL liest höchstens 77 Token;
die Geometrie kommt aus der Steuerung). `--inpaint` zeichnet nur freigegebene Klassen neu (himmel, baeume, vegetation,
menschen_platzhalter, ausstattung; Gebäudeklassen werden abgelehnt), danach folgt das Verfeinern (`--nur-inpaint`
ohne; nur `sdxl_union`). Ausgabe `<render>_ki_lokal_<modell>_s<stärke>.jpg`, `_pruefung.jpg`, `.json` (Parameter, Zeiten je Kachel,
Speicher, Versionen, Lizenzen). `--modell test` ist ein winziges Zufallsmodell für den Funktionstest ohne
Grafikeinheit (Cloud 18.11.2026: 512 px, 6 Kacheln, Inpaint und Verfeinern laufen durch, 2 min auf CPU). FLUX-Wege
in der Cloud am 19.11.2026 nur auf Syntax, Import und Pipeline-Signaturen geprüft (diffusers 0.43.0, keine Modelle
geladen). Erster echter Lauf auf dem Mac mit Vergleich SDXL | FLUX.2 klein | FLUX.1 dev (intern):
`auftraege/2026-11-19_ki_lokal_test.md`.
