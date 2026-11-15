# NOMA, Schlachthausgasse 13 & Würtzlerstraße 10, 1030 Wien

Zweites Objekt in immoviz. UNIO-Projekt, Bauträger Trattner & Söhne, Architektur Hawlik Gerginski.
Stand 15.11.2026, erste Vorschauen und veredelte Bilder.

## Auftrag des Kunden

> "Ich würde vor allem Renderings von den Apartments brauchen, von den Wohnungen 3 und 4, bei den letzten beiden vor
> allem Ansichten auch aus der Perspektive des anderen Gartens und Terrassenbilder. Außerdem vielleicht noch weitere
> Dachgeschoss/Penthouse-Renderings."

**Auslegung (Annahme):** Innenräume von Top 3 und Top 4 (die beiden Hofpavillons im 1. OG); Außenansichten der
Pavillons aus dem gegenüberliegenden Nachbargarten auf Augenhöhe (dorthin zeigen Schlafzimmer- und Wohnzimmerfenster);
Bilder auf den Terrassen von Top 3 und Top 4; Penthouse Top 26-2 innen (Wohnküche unter den Schrägen) und die
Dachterrasse Top 26-3 (Blick über die Dächer zur Stadt, Blick über den Hof, blaue Stunde). Die "Noma Apartments"
(Kurzzeitapartments im EG, Interior-Konzept Derenko) sind nicht Teil dieses Pakets.

## Quellen (`quellen/`, PDFs nicht im Repo)

| Kürzel | Datei | Verwendet für |
|---|---|---|
| EIN | `SHG13_Planungsmappe_Einreichung_2026-03-04.pdf` (Vorabzug, 30 Seiten) | S. 2 Lageplan/Widmung, S. 5 bis 6 Übersicht EG/1.OG 1:250, S. 8 EG und S. 9 1.OG Straßenhaus mit Hof 1:100 (Lage der Pavillons, Gartenstreifen, Grundgrenzen), S. 13 2.DG 1:100 (Top 26-2), S. 14 Dachdraufsicht, S. 16 1.OG Hof 1:100 (Pavillons, Terrassen, Weg, Gründach), S. 23/24 Schnitte 1:200 (Koten), S. 26 Ansicht SHG Hofseite, S. 28 Ansicht Würtzlerstraße Hofseite |
| VP | `VP_Top03.pdf`, `VP_Top04.pdf`, `VP_Top4A.pdf`, `VP_Top26_*.pdf`, `VP_Top23_*.pdf`, `VP_Top01.pdf` | Grundrisse Top 3/4 (Wandextraktion), Lage Top 4 und 4A, Dachterrassen |
| BAB | `BAB_SHG13_hofseitig_DG_Lofts_2026-02-02.pdf` (gilt für Top 3, 4, 23 bis 26) | Wildeiche-Landhausdiele, Wände gebrochenes Weiß, Kunststoff-Alu-Fenster, Hebeschiebetüren, Raffstore, Terrassen Platten 50 x 50, Stabgeländer pulverbeschichtet |
| BAB-S, BAB-A, BEM | straßenseitig, Apartments, Bemusterung | nur gesichtet |
| INT | `Interior_Derenko_Noma_Apartments_2026-10-07.pdf` | gilt nur für die Kurzzeitapartments, hier nicht verwendet |
| VIS | Fremdvisualisierungen (nur Scratchpad, nicht im Repo, nicht hochgeladen) | Referenz für Farbe der Hoffassaden (hellgrün-grau), Gestaltung Hof und Dachterrasse |
| OGD | Stadt Wien Open Data, Dachmodell LOD2, Orthofoto 2024 | Umgebung, siehe `umgebung_abgleich.md` |

Wichtige Befunde aus den Plänen:

- **Top 3 und Top 4 sind Hofpavillons** auf dem eingeschoßigen Hoftrakt (FOK +3,50, DUK +6,01, Attika +6,78, PV auf
  dem Flachdach). Fenster der Schlafzimmer und der Wohnküche zeigen nach Südwest zum Nachbargarten, die
  Hebeschiebetür der Wohnküche nach Südost auf die eigene Terrasse. Lageskizze der VP bestätigt "hofseitig".
- **Verkaufspläne:** Die Maßleiste 0 bis 5 m stimmt nicht (der Plan ist rund 1:60). Kalibriert über Pavillonlänge
  11,95 m und Tiefe 6,62 m aus EIN S. 16, Raumflächen passen danach (Top 3/4 je 62,80 m²).
- **Top 4 im Verkaufsplan** ist grundrissgleich mit Top 3 (EIN zeigt noch einen anderen Grundriss mit 63,35 m²);
  maßgeblich ist der VP. **Top 4A** ist ein dritter Pavillon am Ostende (im EIN noch Gründach), aus VP Top 4A übernommen.
- **Pavillons stehen 6,44 Grad gedreht** zum Straßenhaus (Grundstück knickt), daher der Hilfsrahmen `hof` in project.yaml.
- **Top 26** ist eine Maisonette im Straßenhaus: 26-1 im 1.DG, 26-2 im 2.DG (FOK +21,82, Gaubengruppe mit drei
  Fenstertüren 0,94 x 2,52 zum Hof, Austritt auf die Terrasse 6,08 m²), 26-3 Dachterrasse 35,23 m² auf +25,30.
- **Der "andere Garten"** ist zweigeteilt (Orthofoto 2024, Baukörpermodell): gegenüber Top 3 ein Dachgarten auf dem
  4,8 m hohen Hofbau Schlachthausgasse 11, gegenüber Top 4 ein ebener Garten mit Rasen im Nachbarhof.
- Adresse für den Adressdienst nur als "Schlachthausgasse 13" (mit ", 1030 Wien" liefert er die Straßenmitte).

## Modell

- `project.yaml`, Abschnitt `neubau` (neues Modul `lib/neubau.py`): Straßenhaus mit Hoffassade, Balkonstapel,
  Mansarde mit Gauben und Dachterrassen; Hoftrakt EG mit Gartenstreifen und Zaun; Pavillons Top 3, 4, 4A mit
  Fenstern aus den VP; Gründach, Terrassen, Weg; Würtzlerstraße 10 mit Hoffassade; Nachbargärten.
- Hoffassaden der Nachbarn als `neighbour_facades` (Annahme, Hof nicht in Street View), Dächer aus LOD2.
- `wohnungen.yaml`: Top 3 und Top 4 aus den VP-Vektorplänen (Wandfarbe, Drehung und Ursprung als neue Planparameter),
  Top 26-2 von Hand aus EIN S. 13. Kontrollbilder Plan gegen Wände: `renders/check/plancheck_top03.png`, `_top04.png`.
- Erweiterungen in `lib` sind additiv (nur aktiv, wenn die neuen Schlüssel gesetzt sind): `build.py` (Altbau/Dach
  optional, Aufruf `neubau`), `interior.py` (`wand_farbe`, `drehung_grad`, `ursprung_lokal`, `slab_px`, `oeffnungen_px`,
  `oeffnung_max_m`, `fenster_stil: modern`, `objekt_ausblenden`, Plan-PDF relativ zum Projekt, `cache`),
  `trees.py` (`z` für Bäume auf Dachgärten).

## Annahmen

- **Stil Innen (Top 3, 4, 26):** aus BAB und den Fremdvisualisierungen abgeleitet: helle Wildeiche-Landhausdiele,
  Wände gebrochenes Weiß, warme Töne (Sand, Leinen, Cognac, Terrakotta), zeitgemäß und großzügig. Derenko-Konzept nicht.
- **Raumhöhen:** Pavillons 2,51 m (FOK +3,50 bis DUK +6,01 laut Schnitt). Top 26-2: 2,80 m im Flachteil, Kniestock
  1,10 m, Schrägen rund 54 Grad aus den RH-Linien 1,50 / 2,10 / 2,50 m. Fenster Pavillons Brüstung 0,90, Sturz 2,40.
- **Fassadenfarben:** Hof hellgrün-grau (Baumit 1026 laut Ansicht, Farbwert geschätzt), Erker und Geländer RAL 7012.
- **Mansarde Straßenhaus** vereinfacht (eine Neigung je Seite), Straßenfassade nur als Kulisse.
- **EG-Hoftrakt:** Lage der Fenstertüren zum Gartenstreifen im Raster 5 m geschätzt.
- Gartenbäume und Rasenflächen der Nachbarn aus dem Orthofoto, Höhen geschätzt.

## Licht (Sonnenstand für 48,1955 N, 16,4087 O)

| Name | Datum, Zeit | Sonne | Einsatz |
|---|---|---|---|
| `spaetsommer` | 27.08.2026, 16:20 | 32,6 Grad, Azimut 246 Grad | Garten, Terrassen, Pavillons innen (Sonne fällt in die Südwestfenster; ab etwa 17 Uhr liegen die Pavillons im Schatten der Nachbarblöcke) |
| `golden_hour` | 27.08.2026, 18:40 | 10 Grad, Azimut 274 Grad | Dachterrasse |
| `blaue_stunde` | 27.08.2026, 20:15 | -5,4 Grad | Dachterrasse Stadtblick |
| `spaetsommer_mittag` | 27.08.2026, 13:15 | rund 50 Grad aus Süd | Top 26-2 innen (Gauben zeigen nach Südost) |

## Kameras

| Kamera | Inhalt |
|---|---|
| `garten_top3` | Nachbar-Dachgarten (+4,66), Augenhöhe 1,6 m, 24 mm, Blick auf Top 3 |
| `garten_top4` | Nachbargarten im Hof (Erdgeschoß), Augenhöhe 1,6 m, 30 mm, Blick über den Zaun auf Top 4 |
| `terrasse_top3`, `terrasse_top4` | auf der Terrasse, 22 mm, Hebeschiebetür und Blick über das Gründach in den Hof |
| `terrasse_top3_hof` | Terrasse Top 3, Blick zum Nachbargarten |
| `dachterrasse_stadt` | Dachterrasse Top 26-3, Blick WNW über die Dächer, Stephansdom in Bildmitte |
| `dachterrasse_hof` | Dachterrasse Top 26-3, Blick SO über Gründach Richtung Erdberg |
| `hof_uebersicht` | erhöhter Blick über den Hof (Kontrolle) |
| innen `top03_*`, `top04_*` | `wohnkueche` (Essplatz Richtung Küche und Terrasse), `wohnkueche_sued` (zum Südfenster), `schlafzimmer` |
| innen `top26_2_*` | `wohnkueche_gauben` (Gaubengruppe, Schräge), `wohnkueche_terrasse` (Gegenblick zum Terrassenaustritt) |

Ergebnisse: Blender-Vorschauen in `renders/` und `renders/innen/`, veredelt in `renders/higgsfield/` (außen) und
`renders/innen/*_hf.jpg` (innen), Job-IDs und Prompts in `renders/higgsfield/staging.json` bzw. `renders/innen/staging.json`.

## Offene Punkte

- Freigabe der Auslegung "anderer Garten" mit dem Kunden; der Nachbargarten ist fremder Grund (nur Blickpunkt).
- Stand der Pläne: Einreichung ist Vorabzug 04.03.2026, VP sind jünger (Top 4 und 4A abweichend). Aktuellen Polierplan anfordern.
- Mansarde und Gauben Straßenhaus genauer aus Ansicht S. 24/26 und Schnitt 2 aufnehmen (heute vereinfacht).
- Hoffassaden der Nachbarn und Höhe des Nachbar-Dachgartens prüfen (Foto aus dem Hof oder Schrägluftbild).
- 12 Pflichthäuser an der Schlachthausgasse ohne Fassadeneintrag (nur für ein späteres Straßenmotiv nötig).
- Möblierung der Innenbilder ist Staging; Küchenlage laut VP, Fronten und Geräte laut Bemusterung noch abgleichen.
- Kennzeichnung "Unverbindliche Visualisierung" bei jeder Veröffentlichung.
