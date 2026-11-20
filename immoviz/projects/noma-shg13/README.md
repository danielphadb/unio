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

**Runde 4 Apartments (15.11.2026), nur Modell und Blender-Vorschau:** Kundenfeedback "Küchen teilweise zu klein im
Maßstab, Stuck an der Deckenkante gibt es nicht, rote Farbe und Ecke Bett zum Gang nicht richtig". Details und Tabelle
Soll/Ist in `interior_v2.md` Abschnitt 6. Küchenzeile nach Derenko (Skizze S. 3, Ansicht S. 13) Hochschrank + 3 x 600 =
2,416 m statt 2,116 (Grundlage), drei offene Borde bis 2,31, Mikrowelle 1,58 bis 1,93, Arbeitsplatte 0,90; in `apt01`
Hochschrank wieder am Fensterende wie [INT] S. 13. Kein Stuck mehr, nur glatte Vorhangvoute mit LED an der Fensterwand
(Lichtkonzept S. 12 D). Alle Bordeaux-Flächen in der Palettenfarbe #5C1727. Trennwand als raumhohe Wand mit echtem
Viertelkreis (R 0,18/0,28, neuer Schlüssel `boegen` in `lib/interior.py`), Eichenverkleidung 1,47 läuft um die Rundung.

## Apartments Runde 6 (16.11.2026): APT. 06 unter dem Pavillon, Entscheidungen des Kunden

Grundlage: Abstimmungsseite des Kunden vom 16.11.2026 (Küchenzeile 2,42 bleibt, beide Kochfeld-Varianten ohne Laden
direkt unter dem Kochfeld, Bordeaux #5C1727, Einbauhöhen absolut, Fenster 1,60 x 1,50, Apartment sicher unter einem
Pavillon, Gang Terrazzo, Zimmer/Gang/Bad je eigener Boden). Details und Tabellen in `interior_v2.md` Abschnitt 7.

- **Apartment:** APT. 06 [EIN S. 15], Südreihe, 28,91 m², ganz unter Pavillon Top 3 (Trennwände a 5,49 / 10,98, Pavillon
  a 0 bis 11,95), Kote im Zimmer "ROK 3,34 RUK 3,14", Schnitt [EIN S. 23] RDUK +3,14: **Raumhöhe 3,14**. Gleicher Typ wie
  APT. 01 / Derenko Top 1, aber **gespiegelt** (Bad im Osten). Fenster zum Gartenstreifen (kein Lichthof).
- **Modell:** neue Einträge `wohnungen.yaml: apt06_v1` (Mappe 07.10.) und `apt06_v2` (Mappe 28.10.), Derenko-Top-1
  gespiegelt, jedes Element mit Feld `quelle` (`pruefen`: 0 % ohne Quelle, 0 % ANN in allen apt06-Kameras). `apt01`,
  `apt01_v2` bleiben als Referenz. Höhen absolut (Hochschrank und Garderobe 2,62, Borde 1,45 / 1,79 / 2,16, Verkleidung
  1,40), Fenster 1,60 an der Derenko-Lage (siehe offene Punkte), Küchenfronten mit Fugen und hellblauer Griffleiste,
  unter dem Kochfeld Drehtür. Böden: Zimmer Eiche Fischgrät, Bad Fliese bis unter das Türblatt, gangseitige Laibung der
  Eingangstür Terrazzo. `gang_v2` auf Terrazzo umgestellt (gleich `gang`), Quellen an den Gangwänden ergänzt.
  Pavillon `nb_top3` in den apt06-Bildern ausgeblendet (Unterkante +3,38 ragte in die Decke der Rechenhöhe).
- **Freigabe:** `freigabe.yaml` neu angelegt, `modell_freigegeben: ja` für `apt06_v1_gesamt|kueche|bett|bad`,
  `apt06_v2_gesamt|kueche|bett|bad|kueche_fliesen`, `gang_blick`, `gang_v2_blick` (Kunde, Abstimmungsseite 16.11.2026).
  Hinweis: Seit es die Datei gibt, sind alle anderen Kameras ohne Eintrag gesperrt (REGELN F2), auch die Außenkameras.
- **Selbstprüfung:** Wandabwicklungen S. 13 bis 16 aus dem Modell (orthografisch, zum Vergleich gespiegelt) neben Derenko:
  `scratchpad/noma/r6/apt/abwicklungen_r6.jpg`; Derenko zeichnet den Raum 3,22 bis 3,27 hoch, Modell 3,14, Einbauhöhen
  fluchten.
- **Veredelung:** nano_banana_pro 2k, Referenzen Blender-Vorschau, Derenkos Ansichten S. 13 bis 16 (gespiegelt wie
  APT. 06) und Farbbalken S. 6, frühere eigene Bilder nur als Material-/Lichtreferenz. Ab dem zweiten Versuch Vorschau mit
  Weißabgleich (Geometrie unverändert; die AgX-Vorschau ist so orange, dass die KI Bordeaux zu Holz/Creme machte) und
  Blickplan mit der Reihenfolge der Küchenelemente. Ergebnis `renders/innen/apt06_v1_{gesamt,kueche,bett,bad}_r6_hf.jpg`,
  `apt06_v2_{gesamt,kueche,bett,bad,kueche_fliesen}_r6_hf.jpg`, `gang_blick_r6_hf.jpg`, `gang_v2_blick_r6_hf.jpg`
  (Bad und Gang je ein Bild für beide Varianten, Modell identisch). 24 Aufträge, 15 verworfen, **48 Credits**.
  Vorbehalte (staging.json `runde_6`): V1 gesamt Mikrowelle im Oberschrank statt im Hochschrank; V2 gesamt
  Küchenreihenfolge im Anschnitt vertauscht und Garderobe fehlt; V2 Bett Garderobe mit Türen; Bad Fensteranschnitt am
  rechten Rand und Lichtvoute. Vergleichsbogen V1 | V2: `scratchpad/noma/r6/apartments_r6.jpg`.

Offene Punkte Runde 6: **Fensterlage** (Einreichplan zeichnet bei APT. 01 und 06 das Fenster unter der Badseite, Derenkos
Grundlage gegenüber vor der Küchenwand; Modell folgt Derenko, Fassade in `project.yaml` dem EIN); Kochfeld V2 (S. 3 zeigt
es dort, wo laut S. 13 der Hochschrank steht); lichte Breite APT. 06 laut Maßkette 5,06 (Modell 5,03 wie Derenko);
Gang-Türraster weiter Annahme; vier Bilder mit Vorbehalt nicht für den Vertrieb ohne Prüfung bzw. Retusche.

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

## Runde 4 (15.11.2026): EG und 1. OG nach Einreichplan, Verbindungsweg, Geländer

Feedback des Kunden: "Erster Stock und Erdgeschoss stimmen noch nicht, der Verbindungsweg zwischen den beiden Häusern ist
falsch und im ersten Stock auch zum Teil Handläufe an Stellen, wo keine sein sollten." Nur Modell, keine Veredelung.

**Seitenzählung:** ab Runde 4 gilt die PDF-Seite der Planungsmappe (EIN S. 16 = gedruckte Blattnummer 15). Ältere
Verweise in `project.yaml` (z. B. "S. 15" für den Pavillongrundriss, "S. 22" für Schnitt 1, "S. 25" für die Hofansicht)
meinen die gedruckte Blattnummer.

- **Methode:** Vektorpläne mit PyMuPDF ausgewertet (Außendämmung magenta als Außenkante, Linien, Beschriftungen), alle
  Blätter in den Hofrahmen entzerrt: S. 16 über die Pavillonecken (Maßstab 1:100 auf 0,2 % bestätigt, Außenkante
  11,97 x 6,64 = Maßkette), S. 15 = S. 16 verschoben (Schnittmarken A-05/A-07), S. 8/9 über die bestehende Abbildung
  im Projektkopf, S. 18 über die Schrägwand am Hoftraktende (4,29 Grad gedreht). Ansichten S. 26/28 über Fassadenkanten
  (F 18,79 / 12,44) und ±0,00.
- **EG Hoftrakt** (`nb_hof`, vorher ein Quader b 0 bis 15 mit Gründach über allem): zwei Apartmentreihen mit Mittelgang,
  Nordreihe bis zur Grundgrenze (Feuermauer b 14,86), drei offene Höfe (Gärten 42,09 / 31,17 / 29,91 m²) mit Fenstern,
  Gangtüren und Blumentrögen, Ostende schräg wie Top 4A, Gangausgang zum Hof Ost. Südfassade: 10 Fenster 1,60 x 1,50
  (FPH 0,90) an den Lücken der Außendämmung statt Raster 10,56.
- **Gartenstreifen** (`nb_garten`): Rasen an der Fassade, Rasensteinpflaster bis zum Zaun, drei Blumentröge (4,20 /
  4,20 / 3,40 m) statt eines durchgehenden Trogs, Zaun auf STB-Sockel. EG-Rücksprung unter dem Straßenhaus mit Tür zu
  Müllraum und Kellerstiege (Fahrradraum im KG) ergänzt.
- **Hof Ost** (EIN S. 18): Weg vom Gangausgang, Kinderspielplatz mit Sandkiste und Sonnensegel, Spielhügel (+1,16) hinter
  Stützmauer mit Geländer h 1,00, Garten BFL, Gitterrost der Brandrauchentlüftung, zwei Pflichtbäume r 2,50 m.
- **Verbindungsweg Straßenhaus zu den Pavillons** (vorher eben +3,50 ab der Fassade, also 0,46 m Stufe an der
  Stiegenhaustür, Breite 1,50 auf b 6,62 bis 8,12): Podest +3,96 vor der Stiegenhaustür (EI30-C 0,90 x 2,57) zwischen den
  Terrassen Top 2 und Top 5, Rampe 5 % von a -3,90 bis zur Rinne bei a 5,60, dann eben +3,50 entlang der Pavillon-Nordseiten
  über dem EG-Gang bis Top 4A; lichte Breite 1,34, Feinsteinzeug 50/50, nicht überdacht, keine Stufen. Zwischen den
  Pavillons verbreitert bis zur Terrassentrennung. Drei Stufen hinunter auf Gründach 61,26 (Wartung) und zwei Steigleitern
  "Dachausstieg über Leiter" an Top 3 Ost und Top 4 West.
- **Dächer 1. OG:** Gründach +3,96 (West, Attika +4,16), Gründach +3,06 über der Nordreihe (Attika +3,26 [ANN]),
  Terrassen +3,50 ohne Pflanztrog (Top 3: 20,91 m², Top 4: 15,45 m²), Terrassen Top 2 und Top 5 auf +3,96 an der
  Straßenhaus-Hoffassade (vorher Gründach), Terrasse Top 4A auf Stelzlagern. Pavillon-Attika umlaufend (vorher nur Süd
  und Nord).
- **Pavillons:** Top 4 auf a 15,90 (Abstand 3,93 laut EIN S. 16, vorher 16,04), Top 4A um 0,11 nach Westen; Badfenster
  Nord FPH 1,70, 1,42 x 0,78 (vorher Brüstung 0,90).
- **Geländer:** nur noch, wo der Plan sie zeigt (Tabelle im Bericht Runde 4 und in `project.yaml` je Eintrag G1 bis G10,
  Z1 bis Z2). Entfernt: Geländer auf dem nicht vorhandenen Pflanztrog der Terrassen Top 3/4.
- **Fassaden:** Straßenhaus-Hoffassade 1. OG nach Ansicht S. 26 (8 Öffnungen, vorher zwei 2,20 m breite Türen),
  Sockelzone bis UK Erker in Baumit 1024 (dunkler); Würtzlerstraße 10 Hofseite nach S. 28 (EG: Hauseingang 1,40 m,
  drei Lüftungsgitter; 1. bis 5. OG: je zwei Balkontüren und zwei Fenster im Balkonfeld statt einer Mitteltür).
- **Nachbarn:** Dachdeckung von sechs Nachbarn nach den Apple-Ansichten des Kunden (`roofs_override`), nummerierte
  Übersicht und Hausnummern-Korrektur in `umgebung_abgleich.md` Abschnitt 8.
- **Neu in `lib/neubau.py` (additiv):** Geländerpunkte mit eigener Fußhöhe `[x, y, z]` für Rampen.
- **Prüfbilder** (Scratchpad, nicht im Repo): Draufsichten EG/1. OG/Dach halbtransparent über den entzerrten Planseiten,
  Clay-Bilder in Augenhöhe auf dem Weg, den Terrassen, im Hof und im Gartenstreifen, Ansichten neben S. 26/28,
  Kontaktbogen `kontaktbogen_modell_eg_1og.jpg`.

Offene Punkte Runde 4: Top 4A und der Wegabschnitt bis zur 4A-Terrasse folgen dem VP (im EIN noch Gründach mit Stufe);
Badfenster Top 3/4 (EIN FPH 1,70, VP zeigt "PH"); Attikahöhe über Gründach +3,06; Geländer an der Nordkante der
Terrasse Top 2 und zwischen Weg-Podest und den Terrassen Top 2/5 im Plan nicht eindeutig (nicht modelliert);
Spielhügel als Plateau vereinfacht; Gartenstreifen-Teilung (Rasen/Rasensteinpflaster) aus den Linien abgeleitet.

## Runde 5 (16.11.2026): Innenhof nach den Vorlagen, Kameramatch

Feedback des Kunden: "Bei Noma bitte noch einmal den Innenhof ansehen, bitte von der originalen Visualisierung die
Häuser links und rechts übernehmen, ... sowohl rechts als auch links die Ecke ist hier noch nicht richtig." Nur Modell,
keine Veredelung.

- **Ursache:** Die Kontrollkamera `hof_vorlage` war geschätzt und stand 10 m neben dem Standpunkt der Vorlage.
  Neues Werkzeug `immoviz.py kameramatch` (README immoviz): Kamera aus Passpunkten am Neubau lösen (Pavillon-Attika,
  Balkonplatten, Fenster, Fassadenkanten), dann Nachbarn an Überlagerung und Drahtmodell angleichen.
- **Kameras** `hof_fin`, `hof_fin2`, `hof_fin3`, `hof_fin4` (Vorlagen `SHG13_Hof_fin`, `-2`, `-3`, `-4`), alle gematcht
  (mittlerer Fehler 0,26 / 0,34 / 0,34 / 0,67 % der Bildbreite), Punktdateien in `kameramatch/`. Der Standpunkt von
  `SHG13_Hof_fin` liegt im Eckhaus Schnirchgasse 8 (`clip_start`), `-4` ist ein Ausschnitt fast vom selben Standpunkt.
- **Nachbarn nach der Vorlage** (Tabelle in `umgebung_abgleich.md` Abschnitt 9): rechte Ecke 005378 Traufe 19,0 mit
  Ziegeldach und geschlossener Nische neben dem Straßenhaus, 005379 Traufe 18,6, beide Erkertürme entfernt; linke Seite
  005363 auf 24,8 m mit Paneelstreifen, 005364 weiß mit dunkler Mansarde, 005387 Nordfassade 1,9 m südlicher, 005362
  lachs mit Geschossraster 2,75 und heller Mansarde; Nachbargarten: Kasten und zwei Bäume nach der Vorlage, Bäume am
  Dachgarten größer.
- **Neubau unverändert** (Einreichplan vor Vorlage): Sheddächer, fehlender Pavillon 4A, Dachgeschoss Straßenhaus,
  Balkontiefe Würtzlerstraße 10 und Lage der Pflichtbäume weichen in der Vorlage ab (älterer Entwurf).
- **Behoben:** schwarzes Flachdach Schlachthausgasse 15/17 (Deckel deckungsgleich mit dem LOD2-Dach, `lib/build.py`).
- Prüfbogen intern (Scratchpad `noma/r5/hof_abgleich.jpg`): Vorlage | Modell vorher | Modell nachher | Kanten.

Offene Punkte Runde 5: Auswahl der Vorlage für Bestandsbilder (die Nachbarn folgen jetzt der Vorlage, nicht in allem
dem Bestand laut Orthofoto/Apple); Pflichtbaum (20,1 / -60,2) steht in `hof_fin` groß im Vordergrund (Plan);
`hof_fin2` beruht nur auf Punkten der Straßenhausfassade (Shift 0,3), Nachbarn dort nur grob prüfbar.

## Runde 6 (16.11.2026): Obergeschoße und Dach nach Einreichplan, Nr. 15

Feedback des Kunden zu den Hof-Ansichten (`hof_fin` bis `hof_fin4`): "Das Modell stimmt so leider gar nicht. Balkone sind
falsch und Dach auch, wie kommt es zu dem? In den Plänen ist es anders und in der Visualisierung auch." Dazu Nr. 15: "das
Haus sieht in echt anders aus." Nur Modell, keine Veredelung.

**Ursache:** Straßenhaus ab 2. OG, Dach und die Balkone Würtzlerstraße 10 stammten aus Runde 1 (vereinfacht, ohne
Vektorauswertung, Seitenzählung nach Blattnummer) und wurden in Runde 4/5 nicht gegen Grundrisse, Schnitte und Ansichten
geprüft; Runde 5 hat die Abweichung zur Vorlage als "älteren Entwurf" eingeordnet, statt das Modell zu prüfen. Die
Passpunkte der Kameras an den Balkonplatten nutzten die falschen Modellkoordinaten.

**Methode:** Vektorauswertung (PyMuPDF) von EIN S. 10 (2. OG), S. 11 (RG 3. bis 5. OG), S. 12 (1. DG), S. 13 (2. DG),
S. 14 (Dachdraufsicht), S. 19 bis 22 (Würtzlerstraße RG, 1. DG, 2. DG, Dach), S. 23 (Schnitte, Koten) und der Ansichten
S. 26/28 (Glas, Rahmen, Platten, Geländer als Rechtecke in Metern). Grundrisse liegen im Projektsystem (Abbildung im Kopf
von `project.yaml`, für S. 10 bis 14 über BFL und Brandwände bestätigt), Würtzlerstraße in Fassadenkoordinaten (u ab
Ostende, d vor der BFL). Prüfbilder: orthogonale Modellansicht im Maßstab neben S. 26/28.

| Bauteil | vorher (Runde 1) | nachher (Plan) | Quelle |
|---|---|---|---|
| Straßenhaus Erker 2. OG bis 5. OG | kein Erker, Fenster an der BFL | Erker x 5,87 bis 14,11, 1,40 vor der BFL, UK +6,94, OK +18,93; Front mit Fenster 276/145 und 233/145 (FPH 0,90), zwei Türen 100/232 je Geschoß | S. 10/11, S. 23, S. 26 |
| Straßenhaus Balkonplatten | 1,12 tief, x 3,6 bis 16,1, zwei Stützen | 2,40 vor der BFL (1,00 vor dem Erker), Enden schräg (3,85/4,12 und 16,19/15,91), Platte 0,34, UK 7,06 / 9,94 / 12,82 / 15,70 / 18,59 | S. 11/12, S. 26 |
| Loggien | keine | x 3,85 bis 5,87 und 14,11 bis 16,19 zwischen BFL und Erker, Fenster 118/145, Wand "BA" 0,75 am Ende | S. 10/11 |
| Geländer Balkone | Stab über die ganze Länge | Stab x 5,06 bis 15,11 (OK 8,42 / 11,30 / 14,28 / 17,16 / 20,04), geschlossene Felder RAL 7012 x 4,10 bis 5,06 und 15,11 bis 16,07, Trennwand h 2,30/2,32 bei x 10,12 | S. 26, S. 11/12, BAB |
| 1. DG Hofseite | Fenster im Raster | an der BFL: 118/196 mit französischem Geländer GLH 1,12, 118/136 FPH 0,60, Hebeschiebetüren 260/230 und 248/230; Terrasse auf dem Erker | S. 12, S. 26 |
| Dach | Mansarde 67 Grad, zwei Kastengauben hofseitig, fünf Gauben straßenseitig, Flachdach +25,10 | Hofseite 45 Grad von +21,00 (BFL) bis +25,43 (4,40 tief), Straßenseite bis y -5,44; 2 x 3 Dachflächenfenster 0,94 x 2,52 hofseitig, 5 straßenseitig | S. 13/14, S. 23, S. 26 |
| Dacheinschnitt 2. DG | keiner | x 7,07 bis 13,33 (1/3 der Front), Terrasse +21,81 vor der Wand y -13,00 (2,00 tief), Hebeschiebetüren 260/230 und 248/230, Geländer OK +22,92, Trennwand h 2,32 | S. 13, S. 26 |
| Treppen aufs Dach | keine | zwei Treppen 17 Stg. 20/24 in der Dachfläche (x 5,65 bis 6,55 und 13,85 bis 14,75) mit Geländer; Wendel unten als Podest vereinfacht (ANN) | S. 13/14, S. 26 |
| Dachterrassen | Platten +25,30 an anderer Lage | Top 26-3 x 1,08 bis 7,0 und Top 23-3 x 10,95 bis 18,3 (mit Fortsetzung bis y -12,9), Kies an den Enden, Gründach mit Liftüberfahrt (+26,26), Dachausstieg, Außengeräte; Geländer OK +26,40 nur wo S. 14/26 sie zeigen | S. 14, S. 26 |
| Würtzlerstraße 10 Balkone | 1,30 tief, Fenster an der BFL, 5 Platten | Erker u 2,99 bis 9,42, 0,64 vor der BFL (UK +2,40) mit Türen 100/227 und Fenstern 135/140; Platten 2,54 tief (1,38 + 1,12) auf 1. OG bis 2. DG (6 Stück, UK 2,52 bis 16,93); Stab u 3,98 bis 8,46, geschlossene Felder RAL 7012 an den Enden, seitlich Stab, Trennwände h 2,53 und 2,30 | S. 19/20/21, S. 23, S. 28 |
| Würtzlerstraße 10 Dach | Mansarde 1,6 tief | 45 Grad von +17,28 bis +20,72 (3,42 tief), Mittelteil u 3,77 bis 7,91 als Wand mit zwei Türen 100/232, je zwei Dachflächenfenster, PV (Feld 1 laut S. 22, Felder 2/3 Lage aus S. 28, Tiefe ANN) | S. 21/22, S. 28 |

Alle neuen Einträge haben das Feld `quelle`; `pruefen`: `hof_fin` und `hof_fin2` ohne Elemente ohne Quelle (vorher 15 %
und 24 %). Die verbleibenden 11 fehlenden Quellen liegen in `wohnungen.yaml` (top26_2, apt01) und in alten
`materials`, nicht in Runde 6.

**Abgleich mit den Vorlagenkameras** (`kameramatch --nur-render`, Überlagerungen im Scratchpad `noma/r6/km/`): Übereinstimmung
von Plan und Vorlage und deckungsgleich im Modell: Erker mit Balkonband (Plattenhöhen, Fensterachsen 2. bis 5. OG, Fehler
der Fensterpasspunkte 1 bis 5 px), geschlossene dunkle Endfelder, Stabgeländer, 1. DG-Balkon über die Erkerbreite,
französische Fenster außen, Dacheinschnitt mit Terrasse und großen Verglasungen, zwei Treppen aufs Dach, Dachterrassen
mit Geländer, 45-Grad-Dachflächen seitlich, Würtzlerstraße-Balkone als tiefe Platten.

**Widersprüche Plan gegen Vorlage (Plan gilt, Modell nach Plan):**

- Dachflächenfenster: Vorlage `Hof_fin-2` zwei große Fenster je Seite, Plan drei Fenster 0,94 x 2,52 je Seite (S. 13/14/26).
- Dachhöhe: Vorlage zeigt Dach und Dachgeländer rund 1 m höher als OK Geländer +26,40 (S. 26); Balkonband und 1. DG decken sich.
- 1. DG Mitte: Vorlage drei Öffnungen, Plan zwei Hebeschiebetüren 260/230 und 248/230 (S. 12/26).
- Plattenenden: Vorlage bepflanzte Tröge, breiter und weiter vor (Kontrollpunkt `hof_fin3` 136 px), Plan geschlossene Felder
  RAL 7012 0,96 breit (S. 26) und Wand BA (S. 11); keine Bepflanzung modelliert.
- Würtzlerstraße 10: Vorlage geschlossene Brüstungskästen rund 2,3 m tief, Plan 2,54 tief mit Stabgeländer und
  geschlossenen Endfeldern (S. 19/28); Tiefe jetzt nahe an der Vorlage (vorher 1,30).
- Kameras: Mit plangerechten Passpunkten (Plattenecke 15,91/-17,41 statt 16,1/-16,12, Würtzlerstraße d -2,54) wird `hof_fin`
  kaum besser (4,95 auf 4,45 px, Standpunkt 3 m versetzt), `hof_fin2` schlechter (6,45 auf 8,54 px): die Plattenenden der
  Vorlage weichen vom Plan ab. Kameras bleiben wie Runde 5 (sonst verschieben sich die Nachbarn), korrigierte Punktdateien im
  Scratchpad `noma/r6/km_punkte/`.
- Unverändert aus Runde 5: Glas-Sheddächer, fehlender Pavillon 4A, Lage der Pflichtbäume.

**Nr. 15 Gemeindebau** (Schlachthausgasse 3 / Schnirchgasse 1-7, BEZUG 172417), umgebung_abgleich.md Abschnitt 10:
Westfassade als Karte `west_172417` (EG + 9 OG, Höhe 29,57 aus BKM/LOD2, 28 Achsen zu 3,02 m, weiß mit hellgrau-blauem
Oberteil ab +19,6), vier Balkonstapel rotbraun (9 je Stapel, 3,0 x 1,25, volle Brüstung) in den Achsen 4, 11, 18, 25
gegenüber den vier Stiegenkernen am Dach (LOD2), zwei Markisen, sieben Bäume zwischen Parkplatz und Fassade (Lage
Orthofoto 2024, Größe Apple 9/8). Parkplatz bleibt OGD-Fläche ohne Autos.

Prüfbögen (Scratchpad): `noma/r6/neubau_obergeschosse.jpg` (intern, mit Vorlagen und Apple),
`noma/r6/neubau_obergeschosse_ohne_fremd.jpg` (nur Modellbilder und Planausschnitte, für die Abstimmungsseite).

Offene Punkte Runde 6: `wohnungen.yaml: top26_2` (Innenraum 2. DG, Runde 1) folgt noch der alten Gaube und nicht dem
Dacheinschnitt; Kameras `dachterrasse_stadt` (steht im Gründach neben dem Lift) und `dachterrasse_hof` (steht auf der
straßenseitigen Dachfläche) neu setzen; Wendeltreppe unten, Höhen von Dachausstieg und Außengeräten, PV-Felder 2/3
Würtzlerstraße (Tiefe) sind Annahmen; Liftüberfahrt S. 14 +26,37 gegen S. 23/26 +26,26; Farbe Oberteil Nr. 15 (Apple
zeigt einen bläulich-hellen Ton, Vorgabe "dunkleres Oberteil").

## Runde 7 (16.11.2026): Ausstattung, Top 3/4 neu veredelt, weitere Blickwinkel

Feedback des Kunden (Abstimmungsseite): Top 3/4 Außen, Terrassen und Gärten freigegeben ("gerne weitere ergänzen"), EG/1. OG
freigegeben; Pflanztröge teilweise als Ausstattung, die Wand gegenüber der Hebeschiebetür mit Holzpergola oder Ähnlichem
verschönern ("so schön wie möglich, sodass die Leute sich vorstellen könnten, wie es sein kann").

- **Ausstattung als eigene Ebene** (`project.yaml: neubau.ausstattung`, Gruppen `ausstattung_top3` / `ausstattung_top4`, jede
  Zeile `quelle: "Ausstattung, Kundenwunsch 16.11.2026"`, nicht Teil der Planung, keine Geländer, keine Wände). Je Terrasse:
  Holz-Rankgitter (2,50 hoch, b 0,45 bis 5,25) an der Wand gegenüber der HST (Top 3: Westwand Top 4 bei a 15,90; Top 4:
  Westwand 4A bei a 30,77), Wandpergola 1,30 tief mit zwei Pfosten 9/9 und Lattendach, zwei Pflanztröge Faserzement
  anthrazit (gegenüber der HST und in der Südecke) mit Bepflanzung und Kletterpflanzen am Gitter, Olivenbaum im Terrakottatopf,
  drei Wandleuchten Bronze (zwei an der HST, eine an der Pergolawand). Top 3 Lounge (Sofa unter der Pergola, Couchtisch, zwei
  Sessel, Teppich), Top 4 Essplatz (Tisch 0,90 x 1,60, vier Stühle, halb unter der Pergola). Blick aus der Wohnküche durch die
  HST geprüft (Kamera `hst_aussicht`): Trog, Gitter mit Kletterpflanzen und Pergola mittig im Ausblick. Erzeugt mit
  Scratchpad `noma/r7/tools/ausstattung_yaml.py`.
- **Neu in `lib`** (additiv): `neubau.py` Schlüssel `ausstattung` (Typen quader, zylinder, pflanze, gitter, tisch, sitz,
  leuchte) und Materialart `leuchte`; `materials.py` schaltet `aus_leuchte*` mit dem Innenlicht des Lichts (blaue Stunde an,
  tagsüber aus); `interior.py` Großmöbel in Planpixeln für VP-Wohnungen (`einbauten: [{px: ...}]`, `zylinder: [{c_px: ...}]`)
  und Schrägen mit echten Ausschnitten für `roof_windows` (vorher nur Glas vor einer geschlossenen Fläche).
- **Großmöbel Top 3/4 als Platzhalter laut VP** (Küchenzeile Nordwand 3,63 m, runder Esstisch, Sofa Ostwand, Couchtisch,
  Sideboard), Möbelplan je Kamera in `wohnungen.yaml`. Damit steht die Küche in `wohnkueche_rueckwand` an der Nordwand (Runde 3:
  Küche an der HST-Wand). Kamera `wohnkueche_rueckwand` vor das Sideboard verschoben (stand im Möbel).
- **Korrektur:** Innenhülle Top 4 lag 0,14 m neben der Fassade (VP-Ursprung bei a 16,04, Pavillon seit Runde 4 bei a 15,90);
  `vp_top4` / `vp_top4_aussen` auf a 15,90.
- **Kameras:** Terrassenkameras `top3/4_terrasse_garten` auf b 5,3 innerhalb des Geländers G3/G5 (vorher auf dem Weg),
  Terrassen-HST-Kameras in die Ecke Nord-Ost (Süd-Ost ist jetzt Sofa bzw. Stuhl und Trog). Neu: `top3/4_pergola_detail`,
  `weg_pavillons` (vom Verbindungsweg zwischen den Pavillons über die Terrasse Top 3: links Pergolawand Top 4, rechts HST Top 3),
  `top03/04_terrasse.abend` (blaue Stunde, Leuchten an, Innenlicht), `top03/04.hst_aussicht`; `hof_fin` veredelt (gematchte
  Kamera, direkt mit `SHG13_Hof_fin` vergleichbar). Verworfen an der Vorschau: Weg a -1,5 und Podest a -3,0 entlang der
  Pavillons (nur die Nordwand Top 3 sichtbar, Top 4 verdeckt).
- **Dachterrasse Top 26-3:** `dachterrasse_stadt` (6,4 / -10,0, Ecke Süd-Ost) und `dachterrasse_hof` (1,7 / -6,0, Ecke
  Nord-West) auf die Terrassenfläche +25,32 gesetzt, Augenhöhe 1,60 (vorher im Gründach bzw. auf der straßenseitigen
  Dachfläche). Nur Vorschau (`renders/noma-shg13_dachterrasse_*_golden_hour_vorschau_r7.png`).
- **Top 26-2** an das Dach nach Runde 6 angepasst (EIN S. 13/14/26): Kniestock 0,86 an der Dachdämmung y -12,42, Schräge 45 Grad
  aus den RH-Linien bis +24,62, drei Dachflächenfenster 0,94 x 2,52 (x 1,96 bis 5,02) als Ausschnitte, HST 260/230 in der Wand
  zum Dacheinschnitt, Treppeneinhausung x 5,63 bis 7,07 [ANN], Großmöbel nach EIN S. 13; Kameras `wohnkueche_dachfenster` und
  `wohnkueche_terrasse` (statt `wohnkueche_gauben`). Hofschrägen als Gruppe `nb_shg_dach_hof` (Innenbild blendet sie aus).
  Nur Vorschau.
- **Freigabe:** 19 Kameras in `freigabe.yaml` (Kunde, Abstimmungsseite 16.11.2026), bestehende Einträge unverändert.
- **Veredelung:** nano_banana_pro 2k (Drohne 4k), Regelblock aus `immoviz.py prompt`, Ausstattung im Prompt erlaubt und
  beschrieben, Vorlagen nur als Mood-Referenz. 39 Aufträge, 84 Credits, 19 Bilder übernommen (Liste, Job-IDs, verworfene
  Versuche in `renders/higgsfield/staging.json` und `renders/innen/staging.json`, Block `runde_7`).
- **Erkenntnis:** Bei fernen Blickwinkeln (Gründach, Gärten, Drohne, `hof_fin`) erfindet Higgsfield mit ausführlicher
  Ausstattungsbeschreibung und Terrassen-Vorlagen als Referenz Terrassen, Pergolen und Möbel an anderen Stellen, ersetzt Rasen durch
  Pflaster und verkleinert Bäume. Abhilfe: nur ein kurzer Satz zur Ausstattung ("so klein wie in Bild 1, sonst nichts"), eigener
  Baumsatz, nur `Hof_fin` als Referenz. Ein Küchenblock ohne Geräte wird als Sideboard gelesen: Küche im Prompt mit Spüle, Kochfeld,
  Backofen beschreiben. Die Nachkontrolle meldete die meisten Erfindungen nicht (Drohne mit Parkplatz: Score 294 "ok").

| Motiv | Bild | Hinweis |
|---|---|---|
| Top 3 von außen | `renders/higgsfield/top3_aussen_gruendach_spaetsommer_r7.jpg` | |
| Top 4 von außen | `renders/higgsfield/top4_aussen_gruendach_spaetsommer_r7.jpg` | Rankgitter neben der HST ergänzt |
| Drohne beide Pavillons (4K) | `renders/higgsfield/pavillons_drohne_sued_spaetsommer_r7.jpg` | |
| Verbindungsweg (neu) | `renders/higgsfield/weg_pavillons_spaetsommer_r7.jpg` | |
| Terrasse Top 3, Lounge | `renders/higgsfield/top3_terrasse_garten_spaetsommer_r7.jpg` | zweiter Olivenbaum vor der HST |
| Terrasse Top 4, Essplatz | `renders/higgsfield/top4_terrasse_garten_spaetsommer_r7.jpg` | |
| Detail Pergola Top 3 (neu) | `renders/higgsfield/top3_pergola_detail_spaetsommer_r7.jpg` | |
| Detail Pergola Top 4 (neu) | `renders/higgsfield/top4_pergola_detail_spaetsommer_r7.jpg` | |
| Terrasse Top 3 zur HST | `renders/innen/top03_terrasse_hst_r7_hf.jpg` | zweiter Olivenbaum |
| Terrasse Top 4 zur HST | `renders/innen/top04_terrasse_hst_r7_hf.jpg` | |
| Abend Top 3 (neu) | `renders/innen/top03_terrasse_abend_r7_hf.jpg` | |
| Abend Top 4 (neu) | `renders/innen/top04_terrasse_abend_r7_hf.jpg` | |
| Top 3 innen, Küche Nordwand | `renders/innen/top03_wohnkueche_rueckwand_r7_hf.jpg` | Ausschnitt 5 % weiter |
| Top 4 innen, Küche Nordwand | `renders/innen/top04_wohnkueche_rueckwand_r7_hf.jpg` | |
| Top 3 innen durch die HST (neu) | `renders/innen/top03_hst_aussicht_r7_hf.jpg` | |
| Top 4 innen durch die HST (neu) | `renders/innen/top04_hst_aussicht_r7_hf.jpg` | Wandleuchten innen ergänzt |
| Garten Top 3 weit | `renders/higgsfield/garten_top3_weit_spaetsommer_r7.jpg` | **Vorbehalt**: Essplatz vor der Südfassade erfunden |
| Garten Top 4 weit | `renders/higgsfield/garten_top4_weit_spaetsommer_r7.jpg` | **Vorbehalt**: Rasen gepflastert, Rankgitter an der EG-Fassade |
| Hof aus `hof_fin` (neu) | `renders/higgsfield/hof_fin_spaetsommer_r7.jpg` | **Vorbehalt**: Pflichtbaum vorne rechts kleiner |

Kontaktbogen intern: Scratchpad `noma/r7/kontaktbogen_r7.jpg`. Vorschauen mit Suffix `_vorschau_r7.png` in `renders/` und
`renders/innen/`.

Offene Punkte Runde 7: drei Bilder mit Vorbehalt (nach je drei Versuchen), für Gärten gilt weiter Runde 3; Ausstattung (Lage
der Tröge, Pergola, Leuchten) vom Kunden bestätigen lassen; die Pergola Top 3 steht an der Wand von Top 4 (Eigentum/Widmung
klären); Top 26-2 Kniestock und Treppeneinhausung aus dem Plan abgeleitet [ANN], Schnitt mit Dachaufbau anfordern;
`hof_fin`-Pflichtbaum (Plan) verdeckt in der Vorlagenperspektive die Pavillons.

## Geländer nach Plan (18.11.2026)

Kundenkritik Wimmergasse ("bei Laternen und Geländern bitte genau den Plan beachten") auch hier geprüft. Die Geländer G1
bis G10 und Z1/Z2 aus Runde 4 sind belegt; geprüft wurde, ob im Modell zusätzliche Geländer stehen.

| Gruppe | Einträge | Plan (Soll) | Ergebnis |
|---|---|---|---|
| `nb_shg` Balkone Straßenhaus Hofseite | 27 | EIN S. 26, S. 11/12: 2. bis 5. OG je Stab, 2 volle Felder RAL 7012, 2 Seiten; 1. DG dazu 2 französische Fenster GLH 1,12 | stimmt |
| `nb_shg_dach` Dach und 2. DG | 8 | EIN S. 13/14/26: 4 Treppengeländer, 3 Dachterrassen OK +26,40, Terrasse 2. DG OK +22,92 | stimmt |
| `nb_wue` Würtzlerstraße 10 Hofseite | 30 | EIN S. 28, S. 19 bis 21: 6 Balkone (1. OG bis 2. DG) je Stab, 2 volle Felder, 2 Seiten | stimmt |
| `nb_hof` G1 bis G9 | 9 | Geländertabelle Runde 4 (EIN S. 9/16, VP Top 3/4/4A) | stimmt, jetzt mit Feld `quelle` statt Kommentar |
| `nb_garten` G10, Z1, Z2 | 9 | EIN S. 8/15/18 (Stützmauer h 1,00, Zäune Sockel +0,50 und Stab OK +1,02) | stimmt, jetzt mit Feld `quelle` |
| `nb_umgebung` volle Brüstungen Schlachthausgasse 11 | 5 | Nachbar, kein Planelement (Google 3D) | zählt jetzt als Nachbarfassade, nicht als Geländer |
| `ausstattung_top3/4` | 0 Geländer | Rankgitter, Pergola, Tröge, Möbel, Leuchten (Kundenwunsch 16.11.) | keine Geländer, keine zusätzlichen Absturzsicherungen |
| `wohnungen.yaml` | 0 | | keine Geländer in den Innenräumen |

`immoviz.py pruefen`: Klasse Geländer 65 von 65 mit Feld `quelle`, Ampel grün (vorher 23 nur Kommentar und 5
Nachbarbrüstungen mit Rang 3D-Referenz). Neu ist die Plan-Soll-Liste (`soll:` in `project.yaml`): Öffnungen je Geschoss
der Hoffassaden aus EIN S. 26 (Straßenhaus, 1. OG bis 2. DG je 8, 8, 8, 8, 8, 6, 8) und S. 28 (Würtzlerstraße, EG 4,
1. OG bis 2. DG je 6), Geländer je Gruppe wie oben, Straßenleuchten Schlachthausgasse 7 und Würtzlerstraße 4:
21 Zeilen, 0 Abweichungen. Die Gesamtampel bleibt rot wegen älterer Fenster, Stuck und Farben ohne Quelle (nicht Teil
dieser Runde).

## Weg, Geländer und Leitern nach Plan und BAB (20.11.2026)

Kundenauftrag: "bab und den plan bei noma noch einmal im detail vergleichen, damit sowohl der weg am noma projekt vorbei
die richtige größe hat als auch geländer richtig positioniert werden, bitte die leitern bei einheit 3 und 4 nicht
einzeichnen".

**Unterlagen:** Für das 1. OG gibt es keinen neueren Plan als die Einreichmappe 04.03.2026 (in Drive als "Planungsmappe
gesamt", 01.04.2026, gleicher Stand; die Installationspläne 1. OG vom 22.05.2026 sind Küchenpläne). Der Polierplan EG
(SHG13-260522-PP-EG-Index A) betrifft nur das Erdgeschoss. Neueste BAB hofseitig/DG/Lofts vom 07.07.2026:
Terrassen und Balkone Plattenbelag 50 x 50 auf Kiesbett, Geländer pulverbeschichtet (keine Angaben zum Weg).

**Vergleich:** Modell (Weg, Terrassen, Pavillons, Geländer G1 bis G7) als Linien deckungsgleich über die vektorielle
Planseite 1. OG gelegt (Entwurf 20.02.2026 S. 10/11, Registrierung an den Außenecken Pavillon Top 4; Einreichmappe 04.03.
liegt nur als Text vor). Ergebnis:

| Prüfpunkt | Plan / BAB | Modell | Ergebnis |
|---|---|---|---|
| Weg Breite | 1,34 licht, 1,50 am Westende, GLH 1,02 an der Nordkante | Streifen b 6,62 bis 8,09 (1,47) mit G1 bei b 8,03 | stimmt |
| Weg Fläche | "Weg Feinst. 46,80 m²", Rampe 5 % | 46 bis 47 m² ohne Podest und ohne das Stück vor der Terrasse Top 3 | stimmt |
| Belag | Feinsteinzeug, Platten 50 x 50 (BAB) | `nb_platten` Raster 0,50 | stimmt |
| G1 Weg Nord, G2 Weg Süd West, G3/G4 Terrasse Top 3, G5/G6 Terrasse Top 4 | GLH 1,02 | Lage innerhalb rund 0,1 m deckungsgleich | stimmt |
| Stufen vom Weg aufs Gründach 61,26 | a 15,0 bis 15,8 | a 15,0 bis 15,9 | stimmt |
| Stufen bei a 25,8 bis 26,6 | nur im Entwurf Februar (dort Gründach statt Pavillon 4A) | keine | nicht übernommen, Einreichmappe und VP 4A haben dort die Terrasse 4A |
| Leitern Dachausstieg Top 3 Ost / Top 4 West | im Plan "über Leiter Dachausstieg" | jetzt auskommentiert | auf Kundenwunsch nicht gezeichnet |

Die hölzernen Rankgitter an den Terrassenwänden Top 3/4 (Ausstattung, Kundenwunsch 16.11.) bleiben.

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
- **Mansarde Straßenhaus** vereinfacht (eine Neigung je Seite), Straßenfassade nur als Kulisse. Ab Runde 6 Dach nach Plan.
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
- Mansarde und Gauben Straßenhaus genauer aus Ansicht S. 24/26 und Schnitt 2 aufnehmen: erledigt in Runde 6 (Dach nach S. 13/14/23/26).
- Hoffassaden der Nachbarn und Höhe des Nachbar-Dachgartens prüfen (Foto aus dem Hof oder Schrägluftbild).
- 12 Pflichthäuser an der Schlachthausgasse ohne Fassadeneintrag (nur für ein späteres Straßenmotiv nötig).
- Möblierung der Innenbilder ist Staging; Küchenlage laut VP, Fronten und Geräte laut Bemusterung noch abgleichen.
- Kennzeichnung "Unverbindliche Visualisierung" bei jeder Veröffentlichung.
