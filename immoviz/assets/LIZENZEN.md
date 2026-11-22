# Objekt- und Materialbibliothek: Quellen und Lizenzen

Stand 18.11.2026. Grundsatz: nur selbst erzeugte Geometrie oder CC0-Material, keine fremden Modelle mit unklarer
Lizenz. Jede neue Quelle wird hier eingetragen, bevor sie verwendet wird.

## Geometrie (alles selbst erzeugt, parametrisch)

| Bereich | Code | Herkunft |
|---|---|---|
| Bäume (Linde, Ahorn, Platane, Kastanie, Säulenform) | `lib/assets/baeume.py` | eigener Verzweigungs-Algorithmus (Kronenhülle je Art, Gerüstäste, Zweige, Blattumrisse), keine Fremddaten |
| Autos (Kleinwagen, Kompakt, Kombi, SUV, Transporter) | `lib/assets/autos.py` | eigene Querschnitte nach üblichen Klassenmaßen, keine Fremdmodelle, Kennzeichen ohne Schrift |
| Wiener Straßenleuchten | `lib/assets/leuchten.py` | eigene Drehkörper und Rohre nach Bauart (Hängeleuchte, Peitschen-/Aufsatzmast, Wandarm, Altwiener Laterne), Lage aus dem Inventar je Projekt |
| Straßenmöbel, Platzhalter Menschen | `lib/assets/moebel.py` | eigene Grundformen; Verkehrszeichen ohne lesbare Schrift oder Symbole |
| Grundformen | `lib/assets/form.py` | eigener Code |

## Materialien

| Material | Herkunft | Lizenz |
|---|---|---|
| Putz, Stuck, Asphalt, Gehsteig, Granitpflaster, Granit, Zink, Glas, Lack, Holz, Interior Mapping, Laub, Rinde | prozedurale Shader-Knoten in `lib/materials.py` | eigener Code |
| `asphalt_02` (Asphalt, 3 m) | Poly Haven, https://polyhaven.com/a/asphalt_02 | CC0 1.0 (gemeinfrei) |
| `concrete_pavement_02` (Betonplatten, 1,8 m) | Poly Haven, https://polyhaven.com/a/concrete_pavement_02 | CC0 1.0 (gemeinfrei) |
| `white_stucco` (Putzkorn, 2 m) | Poly Haven, https://polyhaven.com/a/white_stucco | CC0 1.0 (gemeinfrei) |

Die drei Poly-Haven-Texturen sind optional: `immoviz.py texturen` lädt sie (2k, JPG: Farbe, Rauheit, Normalen) über die
öffentliche API nach `immoviz/assets/texturen/<id>/` (gitignored, rund 30 MB). Sie liefern nur Helligkeitsvariation,
Rauheit und Relief; die Farbe bleibt die des Materials. Ohne die Bilder rendern alle Materialien rein prozedural.
Lizenztext CC0: https://creativecommons.org/publicdomain/zero/1.0/ (Poly Haven: https://polyhaven.com/license).

## Fremdmodelle: Autos (BlenderKit / BlendKit)

Ausgewählt am 18.11.2026 vom Kunden. Kostenlose Modelle, geladen ohne Konto über die öffentliche API
(`immoviz.py autos-laden`), Dateien nur lokal in `immoviz/assets/autos/` (gitignored), je Modell `quelle.json` mit
Prüfsumme. Lizenzen: **BlenderKit Royalty Free** (kommerzielle Nutzung in Bildern und Videos ohne Namensnennung
erlaubt, Weiterverkauf oder Weitergabe der Modelldateien verboten: https://www.blenderkit.com/docs/licenses/) bzw.
**CC0 1.0**. Die Lizenzen betreffen das Urheberrecht am Modell, nicht die Marken der Hersteller: beim Aufbereiten
werden Logos, Embleme und Schriftzüge entfernt und der Lack vereinheitlicht (`lib/assets/autos_bibliothek.py`);
markante Formen bleiben erkennbar, für Werbung mit einem einzelnen Auto im Vordergrund vorher prüfen.

| Modell | Autor | Lizenz | Quelle |
|---|---|---|---|
| 2020 Audi Q3 Sportback | cgi Moon | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/b6b859bd-dc4b-4700-990e-0a95115cffca/ |
| Audi A7 55 TFSI | Nobody | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/816784a2-19a5-4d2b-9657-684204ef5277/ |
| Mercedes Benz EQS 2021 | Jayrenn Reeve | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/a908edf8-1e65-4a46-aef1-bacfab5686fc/ |
| Mercedes amg gt 63 | Jayrenn Reeve | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/2e34c4a5-44eb-4a57-bbca-b1d56a04d91d/ |
| Volvo S90 | Adam Wiese | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/b501e06a-f9fa-47b3-a164-de6300c64ac9/ |
| Hyundai veloster sport car | AmJViZ | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/1dcca4af-6e33-4225-8103-aee2ddf21cb1/ |
| Car 006 - audi rs6 avant 2020 | AmJViZ | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/7701f4be-16c6-4278-a8d2-66998f5c8d8f/ |
| Porsche 911 turbo s 992 2021 | Joe Naaman | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/4d1260af-df3b-4d42-ba0b-0a077eed0aec/ |
| Audi rs6 avant 2024 | Joe Naaman | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/8d28cc4d-d7d5-4289-884d-084e4c10907c/ |
| BMW M4 Competition | Seatla Morake | CC0 1.0 | https://www.blendkit.com/asset-gallery-detail/ade0d0cf-a3ec-4c9c-b242-a7b6abb27a9d/ |
| Ferrari Dodici Cilindri | Seatla Morake | CC0 1.0 | https://www.blendkit.com/asset-gallery-detail/828d733c-8af7-4bda-a638-e885deda9d3c/ |
| Aston Martin Valour | Seatla Morake | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/5fdcd0d1-65e6-420c-a408-567d4e883dbe/ |
| Bmw | 3d cars studio | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/0035b02c-6eec-4da4-85e5-1999082a0386/ |
| Audi e-tron GT quattro Black | Ibrohim Toxirov | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/c3c28d91-3547-4b7b-9cc3-68d00d7a6993/ |
| Bmw 5-series | AmJViZ | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/60e683e8-7cd1-4b4e-b142-91697f0a5bbe/ |
| Tesla Model S (2016) | Davide Tirindelli | BlenderKit Royalty Free | https://www.blendkit.com/asset-gallery-detail/433b7ea4-3fcd-46fd-ba8b-bc4bc1ff3ad7/ |

## Fremdmodelle: Möbel und Pflanzen (Poly Haven, BlenderKit / BlendKit)

Ausgewählt am 22.11.2026 (cloud-neu) für Noma Runde 10. Liste mit Verwendung: `lib/assets/modelle_bibliothek.yaml`.
Geladen über die öffentlichen APIs (`immoviz.py modelle-laden`, ohne Konto), Dateien nur lokal in
`immoviz/assets/modelle/` (gitignored), je Modell `quelle.json` mit Prüfsumme. Lizenzen: **CC0 1.0** (Poly Haven,
https://polyhaven.com/license) bzw. **BlenderKit Royalty Free** (kommerzielle Nutzung in Bildern und Videos ohne
Namensnennung, Weitergabe der Modelldateien verboten: https://www.blenderkit.com/docs/licenses/). Keine Marken oder
Logos an den Modellen; Stofffarben werden je Projekt gesetzt (`farbe`).

| Schlüssel | Modell | Quelle | Lizenz |
|---|---|---|---|
| sofa_cloud | Cloud sofa | BlenderKit bac5b260 | Royalty Free |
| couchtisch | Modern Coffee Table 01 | Poly Haven modern_coffee_table_01 | CC0 |
| sideboard | Modern Wooden Cabinet | Poly Haven modern_wooden_cabinet | CC0 |
| esstisch_rund | Round Wooden Table 02 | Poly Haven round_wooden_table_02 | CC0 |
| stuhl_boucle | Walnut bouclette dining chair | BlenderKit 63c86b3f | Royalty Free |
| stuhl_samt | Stella Velvet Dining Chair | BlenderKit 721d33e1 | Royalty Free |
| pendelleuchte | Modern Ceiling Lamp 01 | Poly Haven modern_ceiling_lamp_01 | CC0 |
| outdoor_sofa | Outdoor Sofa Cap-Antibes | BlenderKit c44a0e64 | Royalty Free |
| outdoor_sessel | Delhi Wooden Slat Lounge Chair | BlenderKit 78349060 | Royalty Free |
| outdoor_tisch | GUBI Rectangular Table | BlenderKit 57ecf4a0 | Royalty Free |
| outdoor_stuhl | Rattan and teak chair | BlenderKit d4fc6226 | Royalty Free |
| olivenbaum | Olive tree | BlenderKit 08bc3c6d | Royalty Free |
| efeu_wand | Dense Wall Ivy Climber | BlenderKit 538125fe | Royalty Free |
| graeser | Grass Medium 02 (nur Horst) | Poly Haven grass_medium_02 | CC0 |

Hinweis: Die Namen „Eichholtz“ (Outdoor-Sofa) und „GUBI“ (Tisch) stehen nur im Modelltitel des Katalogs; in Bildern
erscheinen keine Marken. Für Werbung mit einem Möbelstück im Vordergrund vorher prüfen.

## Referenzen, die nicht ins Modell gehen

Google Street View diente nur zum Ansehen (Leuchten-Inventar, Poller, Zeichen), Bilder in
`projects/<objekt>/renders/streetview/leuchten/` (gitignored, nie im Repo, nie im Bild). Übernommen werden nur Zahlen
(Lage, Höhe, Bauart) mit Quelle im Feld `quelle`.
