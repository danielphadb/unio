# Auftrag noma_r12_dachgeschoss_highend

Status: in Arbeit (mac-neu, seit 25.11.2026 10:00; Referenzabgleich erledigt)
Erstellt: 25.11.2026 früh, cloud-neu
Erledigt:

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

## Reihenfolge am Mac
1. `wimmergasse_r11b` (Wienerwald-Test, Kamera dachgeschoss als Probe, Drohnen 4k), 2. dieser Auftrag.

## Melden
Referenz-Abgleich in Worten, Liste der Kameras mit Probe, Zeit, Planbeleg. Danach veredelt cloud-neu (Anzahl und Credits
vorher mit dem Nutzer abgestimmt).
