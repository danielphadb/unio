# Wohnungsvisualisierungen Wimmergasse 20 (Stufe 6)

Annahme laut Daniel (14.11.2026): Wohnungen werden so gezeigt, als wären sie nach neuestem Stand eingerichtet,
im Charakter des Wiener Altbaus.

## Stand 14.11.2026

| Top | Lage | Fläche (NWG) | Hülle | Kameras | Staging |
|---|---|---|---|---|---|
| Top 7 | 1. OG, Straße Wimmergasse | 47,73 m² | automatisch aus Vektorplan | wohnkueche, wohnkueche_zurueck, zimmer | S1 bis S3 |
| Top 12 | 1. OG, Stolberggasse mit Loggia | 53,35 m² | automatisch aus Vektorplan | kueche, wohnen_loggia, zimmer_ecke | S4, S5 |
| Top 35 | 3. DG, Ecke, Terrassen | 60,85 m² + 6,93 m² Terrassen | von Hand aus der plangeprüften Dachkubatur | wohnen_terrasse, dachschraege, kuecheninsel | S6 bis S8 |

Staging nach `mood_interior.md` (Abschnitt 5 Prompt-Bausteine), je Bild Blender-Hülle plus zwei Mood-Referenzen.

## Bedienung

```bash
# Blender-Vorschau aller Kameras einer oder mehrerer Wohnungen
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/wimmergasse-20 --top top07,top12,top35

# Final (2400 x 1600)
.venv-immoviz/bin/python immoviz/immoviz.py interior immoviz/projects/wimmergasse-20 --top top07 --final
```

Konfiguration: `wohnungen.yaml`. Ergebnisse: `renders/innen/<top>_<kamera>_vorschau.png` (Blender) und
`renders/innen/<top>_<kamera>.jpg` (Higgsfield).

## Ablauf

1. **Plan lesen** (`lib/interior.py`): Mappe 24.04.2026, Seite 4 (1. OG) wird mit 300 dpi gerastert
   (1 px = 8,47 mm). Wände sind die grauen und gefüllten Flächen, Möblierung und Bemaßung fallen weg.
   Rasterzelle 2,5 cm. Öffnungen findet ein gerichtetes Schließen der Wandmaske (Tiefe bis 0,8 m).
   Ob eine Öffnung Fenster, Glastür oder Tür ist, steht über Bänder in `wohnungen.yaml` (Fassadenlinien).
2. **Hülle bauen**: Wände als Quader, Türsturz 2,20 m, Fenster mit Brüstung, Fensterbrett, Sturz und
   Kastenfenster (zwei Ebenen, Kämpfer, Mittelpfosten). Parkettboden und Decke. Der Ausschnitt wird am Rand
   geschlossen, Öffnungen bleiben bis zum Rand frei.
3. **Außen**: Das ganze Umgebungsmodell (Gelände, Nachbarn, Bäume) wird mitgeladen, nur das eigene Haus wird
   ausgeblendet. Durch die Fenster sieht man die echten Häuser gegenüber, die Sonne steht richtig.
4. **Kameras** in Planpixeln (Regelgeschoss) oder lokalen Metern (DG), Augenhöhe 1,45 m, 22 mm.
5. **Staging** mit Higgsfield `nano_banana_pro` (2k, 3:2), Blender-Bild als Referenz. Wände, Fenster,
   Türen und Raumhöhe bleiben, nur Möbel, Materialien und Licht kommen dazu.

Prüfbild für die Planerkennung: `debug_plan()` in `lib/interior.py` (Wände schwarz, Fenster blau,
Glastüren grün, Türen rot).

## Annahmen

- 1. OG Fußboden +4,65 m über Gelände (Rohdecke +4,40 plus Aufbau), lichte Raumhöhe 3,30 m (Altbau, Schnitt fehlt)
- Fenster 1. OG: Brüstung 0,92 m, Oberkante 2,93 m (aus der Straßenansicht, Fenster z 5,57 bis 7,58)
- Top 35: kein Vektorplan des DG3 vorhanden, Hülle aus der plangeprüften Dachkubatur (`project.yaml`,
  Straßenansicht) gebaut. Fußboden +21,07 m (Rohdecke DG3 +50,20 WrN), Raumhöhe 2,65 m (DG-Plan RH 2,52 bis 2,68),
  Glasfronten zu beiden Terrassen, Dachschräge mit Dachfenster. Innenwände des DG sind vereinfacht.
- Lichtstimmungen: Top 7 `mai_nachmittag` (20.05., 14:30; die Häuser gegenüber verschatten das 1. OG der
  Wimmergasse, direkte Sonne gibt es dort erst ab ca. 50 Grad Sonnenhöhe), Top 12 Vormittag (Sonne auf der
  Stolberggasse), Top 35 Golden Hour. Eigene Lichter stehen in `wohnungen.yaml` unter `lichter`.
- Flächen laut NWG wurden noch nicht rechnerisch gegen die erzeugte Hülle geprüft

## Einrichtungsstil (verbindlich laut `mood_interior.md`, Kunden-Referenzen i01 bis i17)

Allgemein:
- Nur Tageslicht, Nachmittag bis Golden Hour, harte Sonnenflecken und Lichtstreifen; Kunstlicht nur als eine
  skulpturale Pendelleuchte je Bild. Keine Abendvarianten, keine Downlight-Raster.
- Kamera 1,10 bis 1,50 m, 24 bis 35 mm (Detail 50 mm), Vertikalen gerade, oft Ein-Punkt-Perspektive.
- Palette: Off-White #E2DCD2, Greige #C6BDB3, Sand #C2B197, Taupe #A39581, Eiche #8D6845, Nuss #63452D,
  Espresso #291E16, Cognac #9A5F35, Rost #6E2E22 sparsam, Oliv #6E6F4A. Kein Reinweiß, keine kühlen Grautöne.
- Deko sehr reduziert: Zweige in Vasen statt Topfpflanzen, ein großes abstraktes Bild je Hauptwand,
  flach gewebter Teppich in Creme, keine Menschen, keine Alltagsspuren.
- Küche: Nuss (Kassettenfronten oder grifflos), Quarzit Taupe oder Calacatta bis Oberkante, Steininsel,
  Messingarmatur. Salbei und Eiche als Küchenfront entfallen.

Altbau 1. OG (Top 7, Top 12), Familie A:
- Wände warmes Off-White mit Wandkassetten auf ganzer Fläche, Stuckgesims, Rosette nur über dem Essplatz
- Eiche Fischgrät mittelbraun
- Ovaler Nusstisch, Bouclé- oder Wiener-Geflecht-Stühle, rundes Bouclé-Sofa, Cognac-Leder als Akzent
- Bodenlange Leinenvorhänge in Sand vor den Kastenfenstern (Fenster selbst bleiben laut Blender weiß)
- Weiße Kassetten-Flügeltüren, in mindestens einem Bild offen mit Durchblick
- Top 12 Loggia reduziert: zwei Stühle, kleiner Tisch, Olivenbaum im Topf

Dachgeschoss (Top 35), Familie B:
- Glatte warme Kalkputz-Optik, kein Stuck und keine Kassetten, eine Akzentwand in Nuss-Lamellen
- Breite helle Eichendielen
- Niedriges Leinensofa, Travertin-Couchtisch, Papierleuchte, Olivenbaum auf der Terrasse
- Fensterrahmen bleiben laut Blender; Mood bevorzugt warme dunkle Rahmen (mit Bauträger klären)

Bad: in der Mood nicht abgedeckt, Feinsteinzeug Greige oder Terrazzo in der Palette oben.

## Shotliste und Kameras

| Nr | Kamera | Motiv | Linse, Höhe |
|---|---|---|---|
| S1 | top07_wohnkueche | Essplatz zum Kastenfenster | 28 mm, 1,35 m |
| S2 | top07_wohnkueche_zurueck | Wohnen Gegenblick, offene Flügeltür | 28 mm, 1,25 m |
| S3 | top07_zimmer | Schlafzimmer, Bett frontal vor Kassettenwand, Fenster seitlich | 32 mm, 1,10 m |
| S4 | top12_kueche | Küche Nuss und Quarzit (Schrägblick, Nische nur 1,3 m tief) | 28 mm, 1,40 m |
| S5 | top12_wohnen_loggia | Wohnraum mit Blick durch die Loggia-Tür | 28 mm, 1,35 m |
| S6 | top35_dachschraege | Wohnküche unter der Schräge mit Terrassentüren | 24 mm, 1,30 m |
| S7 | top35_wohnen_terrasse | Essplatz mit Terrassenblick über die Dächer | 28 mm, 1,35 m |
| S8 | top35_kuecheninsel | Detail Kücheninsel, Ein-Punkt auf die Rückwand | 50 mm, 1,20 m |

Format: 3:2 quer, weil Blender-Hülle und Staging 1:1 übereinanderliegen müssen. Die Mood nennt 4:5 hoch als
Standard; Hochformate werden als eigene Blender-Kameras ergänzt, nicht aus dem Querbild beschnitten.

## Bekannte Schwächen

- Glastür zur Loggia (Top 12) wird als Tür erkannt, nicht als Glastür; Higgsfield setzt sie trotzdem richtig
- Feine Fugen zwischen Wandquadern in der Blender-Vorschau (verschwinden im Staging)
- Rauminhalt wie Küche und Bad gibt Blender nicht vor, die Lage kommt aus dem Plan nur über den Prompt

## Offene Punkte

- Hochformat-Kameras (4:5) für Social und Exposé
- Lichte Raumhöhe Regelgeschosse (Schnitt), Fensterbrüstungen und Türhöhen innen
- DG3-Grundriss als Vektor für eine automatische Hülle von Top 35
- Bestätigung der drei Tops und des Stils durch den Vertrieb
