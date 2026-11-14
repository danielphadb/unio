# Higgsfield-Veredelung: Leitfaden

Stufe 5 der Pipeline. Eingang ist immer ein Blender-Rendering aus `projects/<objekt>/renders/`.
Higgsfield macht daraus ein fotorealistisches Bild. Die Geometrie aus Blender ist verbindlich:
Fensterachsen, Geschosshöhen, Gesimse und die Dachgeschoss-Kubatur dürfen sich nicht verändern.

## Ablauf

1. Rendering hochladen (`media_upload`, dann `curl -X PUT` und `media_confirm`).
2. Bild erzeugen mit dem Rendering als Referenz (Modell siehe unten), Seitenverhältnis 3:2.
3. Ergebnis gegen das Rendering prüfen: Achsen zählen, Gesimse, Dachkante, Ecklösung.
   Weicht etwas ab, wird es verworfen und nicht „schön geredet“.
4. Freigegebenes Bild auf 4K hochrechnen (`upscale_image`).
5. Optional: kurze Kamerafahrt mit dem freigegebenen Bild als Startbild (`generate_video`).

## Modellwahl

| Modell | Einsatz | Erfahrung |
|---|---|---|
| `nano_banana_pro` (`resolution: 2k`, Rolle `image_references`) | **Standard.** Hält Achsen, Gesimse, Dachkante und Kamera sehr eng, 2528 x 1696 px | Test 14.11.2026: 3 von 3 Bildern geometrisch korrekt |
| `gpt_image_2_6` | Alternative. Unbedingt `quality: high` und `resolution: 2k` setzen, sonst 1K in niedriger Stufe | Test 14.11.2026: Geometrie korrekt, nur 1024 px wegen fehlender Parameter |
| `upscale_image` (4k) | Endausgabe | flacher Preis |

## Prompt-Bausteine

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
