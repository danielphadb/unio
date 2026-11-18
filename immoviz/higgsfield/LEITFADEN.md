# Higgsfield-Veredelung: Leitfaden

Stufe 5 der Pipeline. Eingang ist immer ein Blender-Rendering aus `projects/<objekt>/renders/`.
Higgsfield macht daraus ein fotorealistisches Bild. Die Geometrie aus Blender ist verbindlich:
Fensterachsen, Geschosshöhen, Gesimse und die Dachgeschoss-Kubatur dürfen sich nicht verändern.

## Ablauf

0. Vorab (REGELN.md, Phasen Freigabe und Veredelung): `immoviz.py prompt --projekt <p> --cam <kamera>` prüft die
   Modellfreigabe der Kamera in `freigabe.yaml` und gibt den Regelblock aus, der an den Prompt angehängt wird.
   Ist die Kamera nicht freigegeben, keine Credits ausgeben (Ausnahme nur bewusst mit `--force`).
0b. Render mit Ebenen: `immoviz.py render <p> --cam <k> --light <l> --ebenen` (Bild plus Klassenmasken, Tiefe,
   Normalen, Kanten, Schutzmaske in `renders/<unterordner>/<k>_<l>_ebenen/`). Final auf dem Mac (Auftrag in
   `immoviz/auftraege/`), Vorschau in der Cloud.
1. Rendering hochladen (`media_upload`, dann `curl -X PUT` und `media_confirm`).
2. Bild erzeugen mit dem Rendering als Referenz (Modell siehe unten), Seitenverhältnis 3:2. Budget je Bild ca. 2,5 Credits
   (nano_banana_pro 2k) einplanen, mit `get_cost: true` vorab prüfbar.
3. Ergebnis gegen das Rendering prüfen: zuerst automatisch mit
   `immoviz.py nachkontrolle --vorschau <blender.png> --veredelt <ergebnis.jpg>` (Markierungsbild daneben: rot neue
   gerade Kanten, blau fehlende, orange neue Rechtecke wie Türen oder Glasfronten; Status "zur Pruefung" ab Score
   400), dann Sichtprüfung der markierten Stellen: Achsen zählen, Gesimse, Dachkante, Ecklösung, Küche und
   Großmöbel an der Planwand, Bäume unverändert. Bei mehreren Varianten alle angeben, die Rangfolge nennt die
   beste zuerst. Weicht etwas ab, wird es verworfen und nicht „schön geredet“.
3b. Schutz-Kompositing (Pflicht, REGELN.md V6): `immoviz.py schutz --render <render.png> --ki <ergebnis.jpg>
   --ebenen <ordner>` richtet das KI-Bild aus, überträgt seine Farbstimmung auf die Blender-Pixel und setzt Gebäude,
   Fenster, Rahmen, Geländer, Leuchten, Straßenmöbel und Autos aus dem Render zurück. Danach Grading an die Leitbilder:
   `immoviz.py grading --bild <ergebnis_schutz.jpg> --projekt <p> --maske <ordner>/schutz.png`. Zum Schluss
   `immoviz.py nachkontrolle --vorschau <render.png> --veredelt <ergebnis_schutz_grading.jpg> --ebenen <ordner>`
   (Schutzzonen und Fensterzahl je Fassade). Damit darf der Prompt der KI mehr Freiheit bei Himmel, Bäumen, Menschen
   und Licht geben; was sie an der Architektur erfindet, wird ohnehin ersetzt.
4. Freigegebenes Bild auf 4K hochrechnen (`upscale_image`), falls die KI-Auflösung unter der Renderauflösung liegt,
   vor `schutz` (sonst wird beim Ausrichten hochskaliert).
5. Optional: kurze Kamerafahrt mit dem freigegebenen Bild als Startbild (`generate_video`).

## Modellwahl

| Modell | Einsatz | Erfahrung |
|---|---|---|
| `nano_banana_pro` (`resolution: 2k`, Rolle `image_references`) | **Standard.** Hält Achsen, Gesimse, Dachkante und Kamera sehr eng, 2528 x 1696 px. **Kosten ca. 2,5 Credits je Bild** (gemessen 15.11.2026, NOMA: 42 Credits für 17 Bilder) | Test 14.11.2026: 3 von 3 Bildern geometrisch korrekt |
| `gpt_image_2_6` | Alternative. Unbedingt `quality: high` und `resolution: 2k` setzen, sonst 1K in niedriger Stufe | Test 14.11.2026: Geometrie korrekt, nur 1024 px wegen fehlender Parameter |
| `upscale_image` (4k) | Endausgabe | flacher Preis |

## Prompt-Regeln (automatisch angehängt)

Zentral in `higgsfield/prompt_regeln.yaml`, gültig für alle Projekte: Geometrie-Sperre (keine neuen Türen, Fenster,
Glasfronten), Kamerasperre (kein Zoom), keine neuen Geländer, Glasdächer, Tröge, `TREES ARE LOCKED`, Nachbarn
gesperrt, Parkordnung (aus dem geprüften Straßenabgleich `renders/check/strasse_abgleich.json`, sonst
`street.parking`), Möbelplan-Pflicht innen (`wohnungen.yaml`: `kameras.<k>.moebelplan`, sonst aus
`renders/innen/staging.json`), keine Stuckleisten, wenn der Plan keinen Stuck zeigt (Freigabe dafür: `stuck: true`
an der Wohnung oder Einbauten mit Stuckmaterial), Farben und Raumhöhe. Jede Regel nennt den Fehler, der sie
ausgelöst hat.

So kommen sie an den Prompt:

- **Studio** (Knopf „Veredeln“): Der Server hängt den Block beim Absenden an, falls die Marke `IMMOVIZ RULES` noch
  nicht im Prompt steht, und schreibt Warnungen (z. B. „Möbelplan fehlt“) ins Job-Log. Vorher prüft er die Freigabe
  der Kamera (`freigabe.yaml`): nicht freigegeben ergibt HTTP 409, außer im Trockenlauf, ohne `freigabe.yaml`
  (Altbestand, nur Warnung) oder mit dem Häkchen „force“ (wird in `index.json` protokolliert).
- **MCP/Kommandozeile**: `immoviz.py prompt --projekt <p> --cam <kamera>` gibt Freigabe, Warnungen und den Block aus;
  der Block kommt ans Ende des Prompts. Exit 1, wenn die Kamera gesperrt ist.

Neue Fehlerklasse: Regel in `prompt_regeln.yaml` ergänzen (mit `grund`) und in REGELN.md eintragen.

## Prompt-Bausteine

Objektbezogene, aus der Mood-Sammlung abgeleitete Bausteine stehen in `projects/<objekt>/mood_analyse.md`
(Abschnitt 5). Sie haben Vorrang vor den allgemeinen Bausteinen unten.

Der Prompt besteht immer aus vier Teilen. Die Teile in `[...]` kommen aus `project.yaml`.

**1. Auftrag und Treue (fix)**
> Turn this 3D render into a high-end architectural photograph. Keep the building geometry exactly as in the render: same number of window axes, same window positions, same storey heights, same cornices, same roofline and the same camera perspective. Do not add, remove or move any windows, balconies or floors.

**2. Objekt und Materialien (aus project.yaml)**
> A renovated Viennese Gründerzeit corner building from 1880, [Fassadenfarbe: warm sand beige plaster], white wooden box windows (RAL 9010), rich stucco: cornices, triangular pediments above the second-floor windows, brackets under the main cornice, rusticated ground and first floor. Modern rooftop extension in anthracite standing-seam zinc with large glazing and glass railings. [Erdgeschoss: shop windows at the corner, solid oak entrance door].

**3. Licht und Stimmung (aus dem Lichtszenario)**
- golden_hour: *Warm late afternoon sun from the southwest grazing the facade, long soft shadows, golden light on the upper floors and the roof, clear sky with a soft gradient.*
- blaue_stunde: *Blue hour shortly after sunset, deep blue sky, warm interior light in about a third of the windows, street lamps on, calm and premium.*
- vormittag: *Bright spring morning, soft clean light, crisp shadows, fresh green trees.*

**4. Umgebung und Qualität (fix)**
> Realistic Vienna street scene in the 5th district: mature street trees with detailed leaves, a few parked cars, two or three pedestrians, natural asphalt and pavement textures. Shot on a full-frame camera with a tilt-shift lens, vertical lines perfectly straight, natural colours, no oversaturation, no HDR look, magazine quality, photorealistic.

**Ausschlüsse (immer anhängen)**
> No text, no watermark, no logos, no extra floors, no distorted windows, no fantasy architecture.

## Rechtliches und Kennzeichnung

- Jedes veröffentlichte Bild trägt den Hinweis „Unverbindliche Visualisierung, Änderungen vorbehalten.“
- Umgebungsdaten: „Datenquelle: Stadt Wien, data.wien.gv.at“ im Impressum oder Exposé-Anhang.
- Google-Maps- oder Street-View-Bilder werden nicht in Visualisierungen verbaut (Lizenz). Sie dienen
  höchstens als interne Referenz für Lage, Ausblick und Nachbarfassaden.

## Testprotokoll

| Datum | Objekt | Eingang | Modell | Ergebnis |
|---|---|---|---|---|
| 14.11.2026 | Wimmergasse 20 | ecke, dunst_hell | nano_banana_pro 2k | 12 + 7 Achsen korrekt, Verdachungen und DG korrekt, Bäume, Autos, Menschen ergänzt |
| 14.11.2026 | Wimmergasse 20 | ecke, dunst_hell | gpt_image_2_6 (Standardparameter) | Geometrie korrekt, nur 1024 x 688 px |
| 14.11.2026 | Wimmergasse 20 | ecke, golden_hour | nano_banana_pro 2k | sehr stimmig, warmes Streiflicht, belebte Ecke |
| 14.11.2026 | Wimmergasse 20 | drohne, dunst_hell | nano_banana_pro 2k | Dachlandschaft und Wienerwald glaubwürdig, Objekt unverändert |
| 18.11.2026 | Wimmergasse 20 | ecke, golden_hour, Render 1200 x 800 mit Ebenen | vorhandenes R6-Bild (gpt_image_2_6), keine Credits | Kette render --ebenen, schutz, grading, nachkontrolle getestet: Kanten-F1 im Schutzbereich 0,79 auf 0,98, Lampen und Möbel hinter den Fenstern entfernt, Farbstimmung der KI übernommen |
| 18.11.2026 | Wimmergasse 20 | ecke, golden_hour, Render 4k mit 16 realistischen BlenderKit-Autos | nano_banana_pro 2k, 2 Credits | KI übernimmt die Blender-Autos fast unverändert; Schutz ohne Autoschutz: Kanten-F1 0,90 auf 0,99, Nachkontrolle erstmals ok. Bei realistischen Autos ersetzt der Hintergrund-Durchgang keine Autos mehr (ebenen.json `autos: modelle`) |
| 18.11.2026 | Wimmergasse 20, Noma | 8 Renders 4k mit Ebenen (r7_basis), voller Ablauf schutz, grading, nachkontrolle --ebenen | gpt_image_2_6 high 4k gegen nano_banana_pro 4k an ecke golden_hour, 55 Credits für 13 Aufträge | gpt_image_2_6 gewählt: nach schutz Kanten-F1 0,993 gegen 0,98, Nachkontrolle ok gegen 17 fehlende Fenster, bessere Stimmung. Passanten nur an Platzhaltern und in dunkler Kleidung, Blaue Stunde so dunkel wie der Render verlangen; Noma-Gründach war als gebaeude_objekt geschützt (Ebenen-Kopie mit Vegetation frei). Einzelheiten staging.json `runde_7_final` |
