# NOMA, Schlachthausgasse 13 & Würtzlerstraße 10, 1030 Wien

Zweites Objekt in immoviz. UNIO-Projekt, Bauträger Trattner & Söhne, Architektur Hawlik Gerginski.
Stand 15.11.2026, zweite Runde (Apartments Derenko, Top 3/4 nach den Vorlagen, Nachbarhäuser korrigiert).

## Auftrag des Kunden

> "Ich würde vor allem Renderings von den Apartments brauchen, von den Wohnungen 3 und 4, bei den letzten beiden vor
> allem Ansichten auch aus der Perspektive des anderen Gartens und Terrassenbilder. Außerdem vielleicht noch weitere
> Dachgeschoss/Penthouse-Renderings."

**Auslegung (Annahme):** Innenräume von Top 3 und Top 4 (die beiden Hofpavillons im 1. OG); Außenansichten der
Pavillons aus dem gegenüberliegenden Nachbargarten auf Augenhöhe (dorthin zeigen Schlafzimmer- und Wohnzimmerfenster);
Bilder auf den Terrassen von Top 3 und Top 4; Penthouse Top 26-2 innen (Wohnküche unter den Schrägen) und die
Dachterrasse Top 26-3 (Blick über die Dächer zur Stadt, Blick über den Hof, blaue Stunde). Die "Noma Apartments"
(Kurzzeitapartments im EG, Interior-Konzept Derenko) waren nicht Teil der ersten Runde; ab Runde 2 enthalten (siehe unten).

## Runde 2 (15.11.2026)

Feedback des Kunden: Apartments genau im Design von Derenko, Top 3 und 4 an den Vorlagen (bestehende
Projektvisualisierungen) referenzieren, auch für die Moods, großzügige Blickwinkel, Häuser rundherum perfekt.

- **Kurzzeitapartments:** die 16 Apartments im EG des Hoftrakts (BAB Apartments: 20 bis 35 m², eigener Eingang). Die
  Verkaufspläne `06 Grundrisse/01.pdf` usw. gehören zu den Eigentumswohnungen (Top 1 dort = 1. OG, 47 m²), nicht zu den
  Apartments. Muster ist **APT. 01** (28,84 m² laut [EIN S. 8], Derenko "Top 1 Variante 2"): erstes Apartment der
  Südreihe, Eingang vom Gang, Fenster zum Gartenstreifen Süd.
- **Apartment Top 1** als Blender-Hülle `wohnungen.yaml: apt01` nach dem Möblierungsplan 1:50 [INT S. 3]: 5,03 x 5,936 m,
  Bad 2,515 x 1,80 m, Trennwand mit Rundung, Einbau-Garderobe mit Bank, Küchenzeile, Bett mit Holzverkleidung, runder Tisch,
  Sideboard, Fenster 1,70 m (Parapet 0,90). Raumhöhe 3,38 m (Rohdecke +3,38, keine abgehängte Decke wegen
  Betonkernaktivierung [BAB-A 3.10]). Gang als `gang` (Breite und Türraster Annahme, Decke +2,92 laut [EIN S. 8]).
  Neue, additive Schlüssel in `lib/interior.py` (nur aktiv, wenn gesetzt): `drehung_grad`/`ursprung_lokal` für
  ManualApartment, `einbauten`, `zylinder`, `leuchten`, `material_ersatz`, `materialien` (oberste Ebene).
- **Derenko-Referenzen in Higgsfield:** nur die eigenen Ansichten S. 13 bis 16 (Ausschnitte) und die Farbbalken S. 6;
  die Stimmungsbilder S. 5 bis 11 (fremde Herkunft, Hinweis S. 17) nur im Prompt beschrieben.
- **Vorlagen Top 3/4:** Look und Mood in `mood_vorlagen.md`; als Stilreferenz hochgeladen (nicht im Repo):
  `SHG13_Hof_fin`, `_Hof_fin-3`, `_Hof_fin-4`, `3Z HOF/Wohnzimmer`, `3Z HOF/Schlafzimmer`, `SHG13_TOP04_Loft_fin`.
  Top 3 im Stil 3Z HOF, Top 4 im Stil Loft.
- **Kameras (großzügig):** innen 16 bis 18 mm aus der Raumecke oder dem Vorraum (`wohnkueche_ecke`, `wohnkueche_vr`),
  Terrassen diagonal aus der hinteren Ecke (`terrasse_top3_eck`, `terrasse_top4_eck`), Gärten mit Rasen im Vordergrund
  (`garten_top3_weit`, `garten_top4_weit`), Kontrollkamera `hof_vorlage` am Standpunkt der Vorlage `SHG13_Hof_fin`.
- **Nachbarhäuser:** siehe `umgebung_abgleich.md` Abschnitt 6 (005379 lachsrot, 005380 und 005378 weiß, neu SHG 11 Hof
  lachsrosa, Nachbargarten mit Rasen und Betonkörper, Gartenstreifen als Gruppe `nb_garten`).
- **Ergebnis:** 13 veredelte Bilder (5 Apartment inkl. Gang, je 2 innen Top 3/4, je 1 Terrasse, je 1 Garten), Jobs und
  verworfene Versuche in `renders/higgsfield/staging.json` und `renders/innen/staging.json` (`runde_2`). 22 Aufträge,
  6 verworfen (erfundene Glastür, Türlagen, Möbel an der falschen Wand). Guthaben 123,38 auf 85,38 Credits (38 verbraucht).

Offene Punkte Runde 2: Lage APT. 01 im Gesamtgrundriss und Raumhöhe (Deckensprung +3,38/+3,57) mit dem Polierplan
bestätigen; Gang (Breite, Türraster, Abschluss) ist Annahme; Hoffassaden 005387 (Würtzlerstraße 8) und 005382 ohne
Bildquelle; Vorlagen zeigen Glas-Sheddächer auf den Pavillons, Modell bleibt beim Einreichplan.

## Apartments Variante 2 (15.11.2026)

Kundenwunsch: "Für die Apartments bei Noma auch noch Varianten mit diesem Interior-Design machen, zusätzlich und
nicht statt den bisherigen." Grundlage ist die neue Derenko-Mappe Projekt 26127, Stand 28.10.2026 ([INT2], 17 Seiten A3,
nur im Scratchpad, nicht im Repo). Runde 2 bleibt unverändert bestehen.

- **Unterschiede zur Mappe vom 07.10.2026** (Tabelle in `interior_v2.md`): Grundriss Top 1, Farbpalette, Stimmungsbilder,
  Lichtkonzept, Möbel, Textilien und Bad unverändert. Neu ist mehr Bordeaux: Bettwand über der Eichenverkleidung bis zur
  Decke gedecktes Bordeaux (auch auf der Seitenwand im Bettbereich), Stuckleiste bordeaux im Bett- und Eingangsbereich,
  Küchenspiegel als glasierte bordeauxrote Rillenfliese statt Karo-Musterfliese. Gang S. 11 unverändert; das Titelbild
  S. 1 zeigt einen Flur mit rot-creme-blaugrauen Musterfliesen, für `gang_v2` als Bodenvariante übernommen (Annahme).
- **Modell:** `wohnungen.yaml: apt01_v2` (Kopie von `apt01` mit Bordeaux-Wand, Bordeaux-Leiste, Rillenfliese und
  Zusatzkamera `kueche_fliesen`) und `gang_v2` (Boden `zementfliese`), neue Materialien `bordeaux_wand`,
  `stuck_bordeaux`, `fliese_bordeaux`, `zementfliese`. `apt01`, `gang` und `lib/` unverändert.
- **Higgsfield:** gleiche Kameras wie Runde 2. Referenzen je Bild: Blender-Vorschau, das Bild aus Runde 2 mit gleicher
  Kamera, das erste gelungene Bild (`apt01v2_kueche`) als Anker, Derenkos Ansichten S. 13 bis 16 (Ausschnitte),
  Farbbalken S. 6, große Stimmungsbilder S. 8 bis 11 und Titelbild S. 1. Fremdfotos (S. 2, 5, 7, rechte Spalten) nicht
  hochgeladen.
- **Ergebnis:** `renders/innen/apt01v2_kueche_hf.jpg`, `_gesamt_hf.jpg`, `_bett_hf.jpg`, `_bad_hf.jpg`,
  `_kueche_fliesen_hf.jpg` (Zusatzblick auf die neue Küche) und `gang_v2_blick_hf.jpg`, Vorschauen daneben, Job-IDs in
  `renders/innen/staging.json` (`apt01_v2`). 7 Aufträge zu je 2 Credits, 1 verworfen (Bad: Kamera frontal statt
  diagonal), 14 Credits (Guthaben 85,38 auf 71,38).

Offene Punkte Variante 2: Deckenfläche im Eingangsbereich bordeaux oder nur die Leiste; Format und Produkt der
Rillenfliese; Gangboden Terrazzo (S. 11) oder Musterfliese (S. 1); Stimmungsbild S. 9 zeigt noch die alte Karofliese.

**Korrektur Maße (15.11.2026), gilt für `apt01` und `apt01_v2`:** Prüfung gegen Grundriss und Ansichten Derenko
[INT S. 3, 13, 15] und Einreichung [EIN S. 8, 23], Tabelle Plan gegen Modell in `interior_v2.md` Abschnitt 5.
Küche war vertauscht: richtig ist vom Eingang zum Fenster Garderobe, Hochschrank mit Mikrowelle (y 3,438 bis 4,038),
Zeile mit Spüle und Fliesenspiegel (y 1,922 bis 3,438, gesamt 2,116 m, 1,92 m frei zur Fensterwand). Fenster 1,70 breit,
Höhe 0,90 bis 2,40 (EIN S. 8: 1,60 x 1,50, FPH 0,90). Bett 1,80 breit, Bank in Bettbreite, Trennwand bis y 3,30,
Sideboard 485 tief, WC und Dusche nach S. 3. Bad: Decke und 0,55 m Wandband in rostigem Bordeaux #6B3426 matt
(vorher #641C24, im Bild fast schwarz-lila), nur schlankes Profil; gleiche Farbe im Gang. **Raumhöhe bleibt 3,38:**
laut EIN S. 23 haben die ersten Apartments am Straßenhaus RDUK +3,38, unter den Pavillons +3,14, unter Terrassen +2,92.
Neu veredelt mit Suffix `_k` (alte Bilder bleiben): `apt01_kueche_k`, `_gesamt_k`, `_bad_k`, `apt01v2_kueche_k`,
`_gesamt_k`, `_bad_k` (gleiches Bild wie Variante 1, das Bad ist in beiden Mappen gleich), `_kueche_fliesen_k`,
`gang_v2_blick_k`. 9 Aufträge, 2 verworfen (Hochschrank frei im Raum, Hochschrank mitten in der Zeile), 18 Credits.
Offen: **Lage APT. 01 bestätigen; liegt es unter einem Pavillon, gilt 3,14**; Fensterbreite 1,70 oder 1,60; Kochfeld
(S. 3 und S. 13 widersprechen sich); `gang` (Variante 1) ist im Modell mit der neuen Deckenfarbe, aber nicht neu veredelt.

## Runde 3 (15.11.2026): Top 3 und Top 4, bessere Winkel

Feedback des Kunden: "Gerade für 3 und 4 noch bessere Winkel mit den Terrassen und auch von den Einheiten (von außen) selbst
bzw. auch von innen für die Aussicht auf die Terrasse und z.B. den Innenhof." Zusatz: Garten-, Baum- und Hofdaten der
Umgebung mit Google prüfen, Gebäude im Innenhof korrigieren, Feeling der Vorlagen nochmals ansehen.

- **Umgebung zuerst korrigiert** (Details `umgebung_abgleich.md` Abschnitt 7, Feeling `mood_vorlagen.md`): zwei nicht
  existierende Bäume im Nachbargarten entfernt, Bäume am Dachgarten neu gesetzt, drei Bäume ergänzt; Nachbargarten mit
  Rasen, Spielfläche, Hütte, weißem Kasten und Beet nach Orthofoto/Luftbild; Grünstreifen Noma laut EIN S. 8 (Rasen,
  Blumentrog 70 cm, EG-Fenster statt Fenstertüren); Hoftrakte Schlachthausgasse 15 weiß statt lachsrot, zwei Erkertürme
  mit Zeltdach; Hoffassade Schlachthausgasse 11 mit weißem Balkonstapel; neue Karten 005364 und 005382. Google (Static
  Maps Satellit, Photorealistic 3D Tiles) nur als interne Referenz im Scratchpad, nichts davon im Modell.
- **Standpunkte Einheit außen** (geprüft an der Blender-Vorschau): Gründach nordöstlich des Pavillons in Augenhöhe
  gewählt (ganze Nordfassade, Ecke, Hebeschiebetür und Terrasse in einem Bild). Verworfen: Straßenhaus 3./4. OG (sieht
  nur Dächer, Terrassen verdeckt, weil die HST vom Straßenhaus wegzeigt), Nachbargarten EG (nur EG-Wand und
  Pavillon-Oberteil), Drohne Nord 13,5 m (PV-Dach füllt das Bild). Übersicht: Drohne 14 m über dem Nachbargarten.
- **Terrassen:** (a) von der Außenecke zurück auf die offene HST mit echter Innenhülle (neue Einträge
  `wohnungen.yaml: top03_terrasse`, `top04_terrasse`, Hülle 2 cm versetzt gegen deckungsgleiche Flächen), (b) aus der
  Ecke neben der HST Richtung Nachbargarten mit Lounge bzw. Essplatz. Blick NNO in den Innenhof verworfen (Schlitz
  zwischen zwei Wänden, 4,1 bzw. 2,9 m breit).
- **Innen mit Aussicht:** Kamera `wohnkueche_aussicht` (Südwestecke, 20 mm, 1,5 m) durch die HST. Neuer Schlüssel
  `rand_offen` in `lib/interior.py` (additiv): ohne ihn stand am Rand des Planausschnitts eine Wand 1 m vor HST und
  Südfenstern, die auch die Ausblicke der Runde 2 verdeckt hat.
- **Ergebnis:** 11 veredelte Bilder (Liste und Job-IDs in `renders/higgsfield/staging.json` und
  `renders/innen/staging.json`, Block `runde_3`). 19 Aufträge zu je 2 Credits = 38 Credits, 8 verworfen (erfundene Tür,
  Geländer, zweite Fensterreihe, vergrößerte HST, Eckfenster, Küche an der falschen Wand, verkleinerter Baum).
- **Vorbehalte:** `pavillons_drohne_sued` (EG-Fensterraster gleichmäßig statt paarweise), `top03/top04_wohnkueche_aussicht_hf`
  (Küche auf der HST-Wand statt an der Nordwand, nach zwei Versuchen). Vorschlag ohne Veredelung: Kamera
  `wohnkueche_rueckwand` (Vorschau in `renders/innen/`), Küche dort eindeutig als linke Seitenwand.

| Motiv | Kamera | Ergebnis |
|---|---|---|
| Top 3 von außen | `top3_aussen_gruendach` | `renders/higgsfield/top3_aussen_gruendach_spaetsommer.jpg` |
| Top 4 von außen | `top4_aussen_gruendach` | `renders/higgsfield/top4_aussen_gruendach_spaetsommer.jpg` |
| Übersicht beide Pavillons | `pavillons_drohne_sued` | `renders/higgsfield/pavillons_drohne_sued_spaetsommer.jpg` (Vorbehalt) |
| Terrasse Top 3, zurück auf die HST | `top03_terrasse.hst` | `renders/innen/top03_terrasse_hst_hf.jpg` |
| Terrasse Top 4, zurück auf die HST | `top04_terrasse.hst` | `renders/innen/top04_terrasse_hst_hf.jpg` |
| Terrasse Top 3, Lounge, Nachbargarten | `top3_terrasse_garten` | `renders/higgsfield/top3_terrasse_garten_spaetsommer.jpg` |
| Terrasse Top 4, Essplatz, Nachbargarten | `top4_terrasse_garten` | `renders/higgsfield/top4_terrasse_garten_spaetsommer.jpg` |
| Top 3 innen, Blick auf Terrasse und Hof | `top03.wohnkueche_aussicht` | `renders/innen/top03_wohnkueche_aussicht_hf.jpg` (Vorbehalt) |
| Top 4 innen, Blick auf Terrasse und Hof | `top04.wohnkueche_aussicht` | `renders/innen/top04_wohnkueche_aussicht_hf.jpg` (Vorbehalt) |
| Garten Top 3 nach Umgebungskorrektur | `garten_top3_weit` | `renders/higgsfield/garten_top3_weit_r3_spaetsommer.jpg` |
| Garten Top 4 nach Umgebungskorrektur | `garten_top4_weit` | `renders/higgsfield/garten_top4_weit_r3_spaetsommer.jpg` |

Schlafzimmer mit Hofblick nicht umgesetzt: die Schlafzimmerfenster zeigen zum Nachbar-Dachgarten bzw. Nachbargarten
(bereits in Runde 1 als `schlafzimmer` vorhanden), Budget für die Wiederholungen verwendet.

## Quellen (`quellen/`, PDFs nicht im Repo)

| Kürzel | Datei | Verwendet für |
|---|---|---|
| EIN | `SHG13_Planungsmappe_Einreichung_2026-03-04.pdf` (Vorabzug, 30 Seiten) | S. 2 Lageplan/Widmung, S. 5 bis 6 Übersicht EG/1.OG 1:250, S. 8 EG und S. 9 1.OG Straßenhaus mit Hof 1:100 (Lage der Pavillons, Gartenstreifen, Grundgrenzen), S. 13 2.DG 1:100 (Top 26-2), S. 14 Dachdraufsicht, S. 16 1.OG Hof 1:100 (Pavillons, Terrassen, Weg, Gründach), S. 23/24 Schnitte 1:200 (Koten), S. 26 Ansicht SHG Hofseite, S. 28 Ansicht Würtzlerstraße Hofseite |
| VP | `VP_Top03.pdf`, `VP_Top04.pdf`, `VP_Top4A.pdf`, `VP_Top26_*.pdf`, `VP_Top23_*.pdf`, `VP_Top01.pdf` | Grundrisse Top 3/4 (Wandextraktion), Lage Top 4 und 4A, Dachterrassen |
| BAB | `BAB_SHG13_hofseitig_DG_Lofts_2026-02-02.pdf` (gilt für Top 3, 4, 23 bis 26) | Wildeiche-Landhausdiele, Wände gebrochenes Weiß, Kunststoff-Alu-Fenster, Hebeschiebetüren, Raffstore, Terrassen Platten 50 x 50, Stabgeländer pulverbeschichtet |
| BAB-S, BAB-A, BEM | straßenseitig, Apartments, Bemusterung | nur gesichtet |
| INT | `Interior_Derenko_Noma_Apartments_2026-10-07.pdf` | Kurzzeitapartments: Grundriss Top 1 S. 3, Lichtkonzept S. 12, Ansichten S. 13 bis 16 (Runde 2) |
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
| `hof_uebersicht` | erhöhter Blick über den Hof (nur Kontrolle, nicht gerendert) |
| innen `top03_*`, `top04_*` | `wohnkueche` (Essplatz Richtung Küche und Terrasse), `wohnkueche_sued` (zum Südfenster), `schlafzimmer` |
| innen `top26_2_*` | `wohnkueche_gauben` (Gaubengruppe, Schräge), `wohnkueche_terrasse` (Gegenblick zum Terrassenaustritt) |

Ergebnisse: Blender-Vorschauen in `renders/` und `renders/innen/` (PNG, nicht im Repo), veredelt in
`renders/higgsfield/` (außen, 8 Bilder) und `renders/innen/*_hf.jpg` (innen, 8 Bilder), Job-IDs, Möbelpläne und
Referenzen in `renders/higgsfield/staging.json` bzw. `renders/innen/staging.json`.

Higgsfield: nano_banana_pro 2k, 17 Aufträge (16 übernommen, 1 verworfen: erfundene Glasfront in Top 26-2),
42 Credits verbraucht (rund 2,5 je Bild, nicht 1,5 wie im Leitfaden geschätzt). Zweite Ansichten desselben Raums
(Top 3/4 Südfenster, Top 26-2 Gegenblick, Dachterrasse blaue Stunde, Terrasse Top 3 Hofblick) mit dem ersten
veredelten Bild als Referenz.

## Offene Punkte

- Freigabe der Auslegung "anderer Garten" mit dem Kunden; der Nachbargarten ist fremder Grund (nur Blickpunkt).
- Stand der Pläne: Einreichung ist Vorabzug 04.03.2026, VP sind jünger (Top 4 und 4A abweichend). Aktuellen Polierplan anfordern.
- Mansarde und Gauben Straßenhaus genauer aus Ansicht S. 24/26 und Schnitt 2 aufnehmen (heute vereinfacht).
- Hoffassaden der Nachbarn und Höhe des Nachbar-Dachgartens prüfen (Foto aus dem Hof oder Schrägluftbild).
- 12 Pflichthäuser an der Schlachthausgasse ohne Fassadeneintrag (nur für ein späteres Straßenmotiv nötig).
- Möblierung der Innenbilder ist Staging; Küchenlage laut VP, Fronten und Geräte laut Bemusterung noch abgleichen.
- Kennzeichnung "Unverbindliche Visualisierung" bei jeder Veröffentlichung.
