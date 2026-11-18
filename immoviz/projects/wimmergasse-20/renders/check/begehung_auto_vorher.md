# Begehung, automatische Vorprüfung wimmergasse-20 _vorher

Erzeugt mit `immoviz.py begehung` am 18.11.2026 21:31. Standorte 47, Ansichten je Standort 8 (vorn, rechts, hinten, links relativ zur Straßenachse; Neigung -10 und +10 Grad; 90 Grad Bildwinkel). Klassen: SegFormer (nvidia/segformer-b2-finetuned-cityscapes-1024-1024). Lage aus Street-View-Metadaten, verschoben um die Kalibrierung [0.324, 0.003] m (`referenz`). Bögen (nur intern): `renders/streetview/begehung/<standort>/bogen_vorher.jpg`. Übersicht: `renders/check/begehung_karte.jpg`.

Die Vorprüfung lenkt die Sichtprüfung, sie ersetzt sie nicht: geparkte Autos, Personen, Jahreszeit und Baustellen weichen immer ab. Befunde "nur im Foto" heißen: im Modell fehlt etwas, "nur im Modell": das Modell zeigt etwas, das es nicht gibt (oder es ist verdeckt). Schwere hoch = Gehsteig, Fahrbahn oder Mast/Schild/Markierung in der unteren Bildhälfte (nah).

| Standort | Straße | Lage x / y | Aufnahme | Ausgleich Gier / Nick | Kanten (px) | hoch | mittel | niedrig |
|---|---|---|---|---|---|---|---|---|
| WI11 | Wimmergasse | -7.6 / -1.1 | 2024-05 | -1.79 / 0.9 | 5.1 | 31 | 8 | 7 |

## Befunde hoch und mittel je Standort

### WI11 (Wimmergasse, -7.6 / -1.1)

- vorn_u: Fahrbahn nur im Modell (hoch, 1.18 % des Bilds, Bereich [0, 320, 64, 384])
- vorn_u: Gebäude nur im Modell (mittel, 2.18 % des Bilds, Bereich [384, 256, 512, 320])
- vorn_o: Fahrbahn nur im Foto (hoch, 2.33 % des Bilds, Bereich [320, 384, 448, 448])
- vorn_o: Fahrbahn nur im Modell (hoch, 4.68 % des Bilds, Bereich [0, 384, 128, 512])
- vorn_o: Gebäude nur im Modell (mittel, 1.72 % des Bilds, Bereich [448, 384, 512, 512])
- rechts_u: Mast/Pfahl nur im Foto (hoch, 0.57 % des Bilds, Bereich [320, 192, 448, 384])
- rechts_u: Mast/Pfahl nur im Foto (hoch, 0.35 % des Bilds, Bereich [192, 256, 256, 384])
- rechts_u: Schild nur im Foto (hoch, 0.45 % des Bilds, Bereich [192, 128, 256, 320])
- rechts_u: Schild nur im Modell (hoch, 0.71 % des Bilds, Bereich [384, 192, 448, 320])
- rechts_u: Gehsteig nur im Foto (hoch, 8.12 % des Bilds, Bereich [192, 256, 512, 384])
- rechts_u: Fahrbahn nur im Modell (hoch, 8.56 % des Bilds, Bereich [128, 256, 384, 384])
- rechts_u: Gebäude nur im Modell (mittel, 1.55 % des Bilds, Bereich [0, 256, 64, 320])
- rechts_u: Gebäude nur im Modell (mittel, 1.22 % des Bilds, Bereich [192, 256, 256, 320])
- rechts_o: Mast/Pfahl nur im Foto (hoch, 0.67 % des Bilds, Bereich [128, 192, 256, 512])
- rechts_o: Schild nur im Foto (hoch, 0.84 % des Bilds, Bereich [128, 256, 256, 448])
- rechts_o: Schild nur im Modell (hoch, 0.49 % des Bilds, Bereich [384, 256, 448, 384])
- rechts_o: Gehsteig nur im Foto (hoch, 3.0 % des Bilds, Bereich [128, 320, 320, 448])
- rechts_o: Fahrbahn nur im Modell (hoch, 7.94 % des Bilds, Bereich [0, 384, 256, 512])
- rechts_o: Gebäude nur im Modell (mittel, 4.21 % des Bilds, Bereich [0, 384, 256, 448])
- hinten_u: Gebäude nur im Modell (mittel, 3.95 % des Bilds, Bereich [320, 64, 512, 192])
- hinten_o: Gebäude nur im Modell (mittel, 1.29 % des Bilds, Bereich [384, 256, 448, 320])
- links_u: Mast/Pfahl nur im Foto (hoch, 1.0 % des Bilds, Bereich [256, 128, 384, 384])
- links_u: Mast/Pfahl nur im Foto (hoch, 0.36 % des Bilds, Bereich [64, 256, 192, 384])
- links_u: Markierung nur im Modell (hoch, 0.49 % des Bilds, Bereich [64, 256, 256, 384])
- links_u: Gehsteig nur im Foto (hoch, 18.86 % des Bilds, Bereich [0, 256, 384, 448])
- links_u: Gehsteig nur im Modell (hoch, 3.12 % des Bilds, Bereich [384, 320, 512, 384])
- links_u: Fahrbahn nur im Modell (hoch, 14.82 % des Bilds, Bereich [0, 256, 256, 448])
- links_u: Fahrbahn nur im Modell (hoch, 3.1 % des Bilds, Bereich [256, 384, 448, 448])
- links_u: Fahrbahn nur im Modell (hoch, 1.11 % des Bilds, Bereich [448, 448, 512, 512])
- links_u: Gebäude nur im Foto (mittel, 1.52 % des Bilds, Bereich [192, 64, 256, 192])
- links_o: Mast/Pfahl nur im Foto (hoch, 1.17 % des Bilds, Bereich [320, 256, 384, 512])
- links_o: Mast/Pfahl nur im Foto (hoch, 0.32 % des Bilds, Bereich [0, 384, 64, 512])
- links_o: Mast/Pfahl nur im Modell (hoch, 0.48 % des Bilds, Bereich [256, 384, 320, 512])
- links_o: Schild nur im Foto (hoch, 0.33 % des Bilds, Bereich [256, 384, 320, 512])
- links_o: Markierung nur im Modell (hoch, 0.59 % des Bilds, Bereich [64, 320, 256, 512])
- links_o: Gehsteig nur im Foto (hoch, 5.04 % des Bilds, Bereich [0, 384, 192, 512])
- links_o: Gehsteig nur im Foto (hoch, 3.87 % des Bilds, Bereich [320, 384, 512, 512])
- links_o: Fahrbahn nur im Modell (hoch, 8.98 % des Bilds, Bereich [0, 384, 192, 512])
- links_o: Fahrbahn nur im Modell (hoch, 6.24 % des Bilds, Bereich [320, 384, 512, 512])

