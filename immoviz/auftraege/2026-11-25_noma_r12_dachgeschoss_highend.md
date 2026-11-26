# Auftrag noma_r12_dachgeschoss_highend

Status: erledigt (mac-neu, 26.11.2026 04:15; Abendbilder siehe Ergebnis Punkt 6)
Erstellt: 25.11.2026 früh, cloud-neu
Erledigt: 26.11.2026 04:15, mac-neu

Start, sobald keine andere Mac-Arbeit läuft (`SITZUNGEN.md` "Laufend", `pgrep -f immoviz.py`). Zuerst anmelden, Status
setzen, pushen. Nie zwei Renders parallel. Vorher bzw. parallel `wimmergasse_r11b` beachten (Reihenfolge unten).

## Ziel
Nutzer 25.11.2026: "Dachansicht (alle 4 Wohnungen) bei Noma würde ich gern noch einmal machen, bitte auch andere Winkel
zusätzlich und versuchen, die Einrichtungsqualität zu erhöhen. Bei Top 23 und 26 bitte an den schon vorhandenen Innenvisus
anhalten, die als Referenz zur Verfügung gestellt wurden (vom Interior). Generell bei Materialien, Lichtstimmungen usw. noch
einen Step nach oben. Eventuell auch mit Personen (mit und ohne)."

Betroffen: Dachgeschoss Top 24, Top 25, Penthaus Top 23-2, Penthaus Top 26-2 (Wohnräume, Terrassen, Dachterrassen).

## Schritte
1. **Referenzen Interior (Top 23 und 26)**: die Penthaus- und Dachterrassen-Visualisierungen aus dem Kundenordner
   `08 Visualisierungen/` (siehe `mood_vorlagen.md`: "Penthouse und Dachterrasse nur zum Abgleich"), falls am Mac lokal
   vorhanden. Je Bild in `mood_vorlagen.md` neuer Abschnitt "Penthaus (Interior)": Möbel (Typ, Material, Farbe, Lage),
   Materialien (Boden, Wände, Küche, Stein), Leuchten, Deko, Licht, Kamera. Nur Stil, Möbel und Materialien übernehmen,
   nie Grundriss oder Fenster (Modell bleibt maßgeblich, REGELN V2). Bilder bleiben lokal. Falls nicht vorhanden: melden,
   cloud-neu holt sie über Google Drive oder vom Nutzer.
2. **Einrichtung Top 23-2 und 26-2 nach den Referenzen** umbauen (`wohnungen.yaml` `moebel`, Poly Haven CC0 oder eigene
   Geometrie): Sofa, Esstisch, Stühle, Küche, Leuchten, Teppich, Kunst, Vorhänge wie in den Referenzen; Lage nach Plan.
   Top 24 und 25: Einrichtung eine Stufe hochwertiger (Designer-Leuchten, Stein, Textilien, Kunst je Wohnung verschieden).
3. **Materialien eine Stufe höher**: Stein (Calacatta, Travertin), Eiche, Leinen, Bouclé, Messing mit echten Texturen
   (Poly Haven CC0, `immoviz.py texturen` erweitern, Lizenz in `assets/LIZENZEN.md`), Rauheit und Relief statt Flächenfarbe.
4. **Neue Winkel**: je Wohnung 2 bis 3 zusätzliche Kameras an der Clay-Vorschau prüfen (REGELN K1), z. B. Gegenschuss von
   der Terrasse in den Wohnraum, Küche/Insel als Detail (50 mm), Blick über das Sofa zum Fenster, Dachterrasse vom Whirlpool
   zur Lounge, Abendblick von außen in das beleuchtete Penthaus. Verworfene Standpunkte mit Grund im README.
5. **Licht**: je Hauptkamera drei Stimmungen: Morgen (weiches Seitenlicht), späte goldene Stunde, Abend/Blaue Stunde mit
   Innenlicht (2700 K, Pendel, Stehleuchte, indirekte Voutenbeleuchtung falls im Plan).
6. **Personen**: in je einer Variante pro Raum 1 bis 2 Platzhalter (`menschen`, `lib/assets/moebel.py`) an glaubwürdigen
   Stellen (am Esstisch, an der Insel, auf der Terrasse mit Glas); zweite Variante ohne (`IMMOVIZ_MENSCHEN=aus`). Die KI macht
   aus den Platzhaltern Personen ohne erkennbare Gesichter.
7. **Render**: Probe 960 x 640 aller Kameras (Kontaktbogen), dann 4k mit Ebenen nach `renders/r12_dg/`; Planbeleg je Kamera.

## Nachtrag Nutzer 25.11.2026 13:20 (vor dem 4k-Render einarbeiten; ist schon gerendert, als zusätzliche Versionen)
Wörtlich: "zum Teil weitwinkeligere Objektive gerade im Innenraum, damit die Wohnungen etwas größer und weniger
zusammengepfercht aussehen; mehr an Atmosphäre, Licht und generellem Interior arbeiten. Bei den DG-Wohnungen 23 und 26
Aufnahmen, die den Raum maximal groß wirken lassen, z. B. vom Eingang in den Hauptwohnbereich, auch bei 24 und 25. Bei 26
eine Version mit anders gestellten Möbeln: Küchenzeile unter den Fenstern mit Block davor, davor Tisch; Fernseher an der
Wand vom Lift und Sofa dahin ausgerichtet."

8. **Weitwinkel innen**: Hauptkameras zusätzlich mit 14 bis 16 mm (statt 18 bis 24 mm), Kamera in die Raumecke oder in
   den Türrahmen, Höhe rund 1,30 bis 1,45 m, senkrechte Linien gerade (Shift statt Kippen), Ränder ohne starke Verzerrung
   prüfen (keine Möbel stark gedehnt am Rand). Bestehende Kameras behalten, Weitwinkel als eigene Kameras `*_weit`.
9. **Raum maximal groß: Blick vom Eingang in den Hauptwohnbereich** für Top 23-2, 26-2, 24 und 25 (`*_eingang_weit`):
   Standpunkt in der Wohnungstür oder im Vorraum, Blick durch die ganze Wohnküche zur Verglasung/Terrasse, 14 bis 16 mm,
   möglichst viel Boden und Decke, Dachschrägen und Fensterreihe als Tiefenlinien.
10. **Atmosphäre und Licht**: weicher, tiefer Sonnenstand mit Lichtflecken und Blattschatten am Boden (wie Interior-Vorlage),
    indirektes Licht (LED unter Oberschränken, Voute falls im Plan), abends warme Inseln aus Pendel, Bogenleuchte, Kerzen;
    Interieur dichter und wohnlicher (Bücher, Keramik, Plaids, große Pflanze, Kunst), aber aufgeräumt.
11. **Top 26-2 Variante B Möblierung** (`top26_2_b`, eigene Möbelliste, gleiche Hülle): Küchenzeile unter den Fenstern
    (Dachflächenfenster/Gaupen laut Plan; Arbeitshöhe und Brüstung prüfen, Oberschränke entfallen dort), davor ein
    Kochblock/Insel, davor der Esstisch; Fernseher an der Wand zum Lift (TV-Board oder flach an der Wand, Steckdosen und
    Wandstärke laut Plan plausibel), Sofa gegenüber auf den Fernseher ausgerichtet, Lounge-Sessel und Teppich dazu. Kameras:
    `eingang_weit`, Hauptblick und ein Blick von der Sofa-Position zur Küche. Variante A (Vorlage) bleibt.

## Nachtrag Nutzer 25.11.2026 13:35: Sessel, Sofa, TV, Japandi-Leuchten (gilt für alle vier DG-Wohnungen)
Wörtlich: "Bei den Wohnungen, wo der Sessel vis-à-vis vom Sofa steht, finde ich den Sessel echt nicht schön, der passt gar
nicht zum Sofa. Hier z. B. die Sofa-Serie Alba von Westwing als Beispiel nehmen, eher auf die andere Seite einen Fernseher
hängen und gemütlich gestalten, auch z. B. bei den Lampen mit Japandi-Stil arbeiten."

12. **Sessel gegenüber dem Sofa entfernen** (Leder-Lounge-Sessel in Top 24, 23-2, 26-2 und überall, wo er dem Sofa
    gegenübersteht; auch der Teddy-Sessel der Interior-Vorlage fällt hier weg, der Nutzer geht vor).
13. **Sofa im Stil "Alba" (Westwing)**: geschwungenes, niedriges Nierensofa (Kidney-Form), weiche Rundungen, Bezug Teddy-
    Bouclé oder samtiger Stoff in Creme, Sand oder warmem Greige; passender Pouf statt Sessel, falls Platz (gleiche Serie,
    gleicher Stoff). Eigene Geometrie (geschwungener Körper, Rundpolster), kein Fremdmodell; im Prompt nur "kidney-shaped
    curved boucle sofa", kein Markenname im Bild.
14. **Fernseher an der gegenüberliegenden Wand**: flacher TV an der Wand (oder auf niedrigem Lowboard Eiche/Nuss), Sofa
    darauf ausgerichtet, Teppich verbindet beides; gemütlich: Plaids, Kissen, Pflanze, Leuchte neben dem Sofa.
15. **Leuchten Japandi**: Papier- oder Leinenlaternen (Typ Akari, rund oder oval) als Pendel über Tisch und Insel,
    Stehleuchte mit Reispapier- oder Leinenschirm auf Holzfuß, Wandleuchte Holz/Leinen; Holz hell (Esche, Eiche), warme
    2700 K; ersetzt Glaskugeln und Chrom-Bogenleuchte in den Wohnungen, wo es zum Stil passt (Top 23/26 Pendel mit drei
    Stoffzylindern aus der Vorlage darf bleiben).

## Reihenfolge am Mac
1. `wimmergasse_r11b` (Wienerwald-Test, Kamera dachgeschoss als Probe, Drohnen 4k), 2. dieser Auftrag.

## Melden
Referenz-Abgleich in Worten, Liste der Kameras mit Probe, Zeit, Planbeleg. Danach veredelt cloud-neu (Anzahl und Credits
vorher mit dem Nutzer abgestimmt).

## Ergebnis (mac-neu, 26.11.2026)

1. **Referenzen und Einrichtung (Schritte 1 bis 3, 12 bis 15):** Referenzabgleich der Interior-Visualisierungen in
   `mood_vorlagen.md` (Bilder bleiben lokal). Einrichtung Top 23-2, 26-2, 24, 25 neu: Nierensofa in Bouclé mit Pouf (eigene
   Geometrie in `lib/assets/japandi.py`, kein Fremdmodell, statt Poly Haven), Sessel gegenüber dem Sofa entfernt, TV an der
   Gegenwand mit Lowboard, Japandi-Leuchten (Papierlaternen rund und oval, Pendel mit drei Stoffzylindern in Top 23/26).
   Top 25 ohne TV (keine passende Gegenwand ohne Tür oder Fenster).
2. **Runde 12h, neuer Standard des Nutzers (25.11.2026 21:30, REGELN R5, R6, K6):** hell, weiß, lichtdurchflutet wie die
   Kundenvisualisierungen, nie bläulich (Lichtstimmung `hell_vormittag`, Weißabgleich 5900 K, AgX Base Contrast, Leuchten
   tagsüber aus); Türblätter weiß und flächenbündig mit schwarzem Drücker und Schattenfuge; keine freie Stehleuchte,
   weniger Laternen; Fronten weiß bzw. Eiche hell, Parkett und Tische Eiche hell, Wände wärmer weiß. Die Stimmungen
   Morgen und goldene Stunde aus Schritt 5 sind damit für die Tagbilder ersetzt.
3. **Kameras (Schritte 4, 8, 9, 11):** Raumblicke 15 mm (`*_weit`, `*_eingang_weit`, Nachtrag 2 mit 1,60 bis 1,65 m:
   `*_hoch`), Detailblicke 35 bis 45 mm mit Blende 2,8. Verworfen nach Probe: alle `kueche_detail`, `insel_detail`,
   `sofa_detail` Top 24/25, `esstisch_detail` Top 26-2 B, `essplatz_dachfenster` Top 26-2 (nur Arbeitsplatte und Wand,
   brauchen Deko auf der Arbeitsplatte, folgt). Top 26-2 Variante B: Küchenzeile unter den Dachflächenfenstern, Kopfhöhe
   über der Arbeitsplatte dort nur 1,54 m (Schräge laut Plan), daher Block davor und Tisch davor wie bestellt.
4. **4k mit Ebenen** `renders/r12h_4k/` (3840 x 2560, 256 Samples), Teil-Pushes je Wohnung: Top 24 7 Bilder (00:12),
   Top 25 5 (00:58), Top 26-2 9 (02:21), Top 23-2 6 (03:16), Top 26-2 B 3 (03:45), Abend 3 (04:12); 33 Bilder,
   Planbeleg 33 x 0 Fehler. Helligkeit (Median) 151 bis 208 von 255, Blau minus Rot -12 bis -45 (Ziel -35 bis -15;
   knapp darüber nur einzelne Bilder mit viel Himmel). Kontaktbogen je Wohnung.
5. **Personen (Schritt 6):** Kamera `top26_2_wohnkueche_vorlage_personen` angelegt, nicht in `r12h_4k`.
6. **Abendbilder:** `top24_wohnzimmer_abend` war mit den hellen Materialien überbelichtet (Median 203),
   `top26_2_terrasse_abend` fast schwarz (Median 12, Terrasse tief im Dacheinschnitt). cloud-neu hat beide bereits
   veredelt (Belichtung von der KI gerettet). Belichtung in `wohnungen.yaml` angepasst (0,9 auf 0,3; 0,8 auf 1,3;
   Terrasse Lichtstimmung `abend`, 3,4); lokale Probe `renders/r12h_abend_probe/`, neue 4k nur nach Wunsch des Nutzers.
7. Offen: Küchen- und Inseldetails mit Deko (Schale, Vase, Brett, Kräuter) neu proben; Top 24 `gang_tuer_hoch` ähnelt
   `wohnzimmer_weit`, Top 25 `eingang_weit` mit Wand im linken Drittel, beide bei Bedarf neu setzen.
