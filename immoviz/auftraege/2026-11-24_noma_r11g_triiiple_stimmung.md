# Auftrag noma_r11g_triiiple_stimmung

Status: in Arbeit (mac-neu, 24.11.2026 22:06)
Erstellt: 24.11.2026, cloud-neu
Erledigt:

Ersetzt `noma_r11f_top23_umgebung` (Top 23-2 innen ist hier Schritt 4). Start, sobald keine andere Mac-Arbeit läuft
(`SITZUNGEN.md` "Laufend", `pgrep -f immoviz.py`). Zuerst in `SITZUNGEN.md` anmelden und hier
`Status: in Arbeit (<kennung>, <Datum Uhrzeit>)` setzen, pushen. Nie zwei Renders parallel.

## Ziel
Nutzer 24.11.2026 zu den Dachterrassen nach r11e: "Das TrIIIple sieht noch immer nicht richtig aus, die Türme schauen in
echt von den Fassaden und den Kanten der Fassade anders aus, bitte darauf achten, auch in Zukunft bei anderen Projekten in
der Umgebung. Sonst bekommen wir hier nie eine High-End-Qualität hin." Und: "Im Rendering von den Terrassen noch etwas mehr
Stimmung, es soll noch mehr wie ein High-End-Penthouse aussehen."

Neue Regel dazu: `REGELN.md` U12 (Landmarken und Hochhäuser so genau wie die Nachbarn, echte Geometrie, Nebeneinander mit
Street View vor jedem Credit).

## Was über das TrIIIple veröffentlicht ist (Rang 3, bitte mit Street View prüfen)
- Henke Schreieck, fertig 2021, drei Türme, Stahlskelett, rund 100 bis 120 m (Turm 1 CTBUH 117,2 bzw. 120,2 m mit Spitze).
- Falter 17.03.2021 ("Manhattan in Erdberg"): die Türme "rauschen nicht glatt nach oben, sondern machen in verschiedenen
  Höhen einen Sprung zur Seite"; **burgunderrote Fassade hinter umlaufenden Glasbalkonen** (Zitat der roten Balkone des
  Gemeindebaus aus den 1960ern).
- Schüco-Referenz: Vor- und Rücksprünge spiegeln die Maßstäblichkeit der Stadt; Geberit: Gliederung in Höhenzonen, die drei
  Türme "im Dialog".
- Folgerung: Das jetzige Modell (r11e: Turm 1 "dunkles Glas mit dunklen Bändern", nur ein rostroter Eckschlitz, Türme 2 und
  3 als Prismen) widerspricht den Quellen. Der "Schlitz" war vermutlich die burgunderrote Fassade, die zwischen den Balkonen
  sichtbar ist.

## Schritte
1. **Street View gezielt auf das TrIIIple** (nur lokal, nie ins Repo): je Turm mindestens zwei Richtungen, davon eine aus der
   Nähe (Schnirchgasse / Erdberger Lände / Donaukanal) und eine aus der Ferne von Südwesten (Blickrichtung der Noma-Dachterrassen).
   Je Turm in Worten festhalten:
   - Höhenzonen: bei welchem Geschoss der Turm seitlich springt, in welche Richtung, um wie viel (Achsen zählen).
   - Balkone: umlaufend auf allen Seiten oder nur auf einzelnen; Plattenstärke, Auskragung, Farbe der Plattenstirn
     (weiß, grau, dunkel); Brüstung Glas klar oder getönt, mit oder ohne Handlauf.
   - Fassade hinter den Balkonen: Farbe (burgunder, Ton aus Street View), Fenster raumhoch oder mit Brüstung, Achsraster.
   - **Kanten und Ecken**: laufen die Balkone um die Ecke, sind die Ecken scharf, gerundet oder gefast, gibt es Eckloggien
     oder zurückgesetzte Ecken; wie sieht die Dachkante aus (Attika, Technikaufbau, Krone).
   - Unterschiede zwischen Turm 1, 2 und 3 (Büro oder Wohnen, Fassade, Höhe).
2. **Modell**: alle drei Türme als echte Geometrie in `hochhaeuser.formen` (Höhenzonen mit seitlichem Versatz, Balkonplatten
   je Geschoss mit Glasbrüstung als Bauteil, zurückgesetzte burgunderrote Fassade, Ecken wie in Street View), Stil-Einträge
   für Z43908 und die Nachbarteile entsprechend. Quellen und Annahmen mit `[SV 04/2026]`, `[Falter 2021]`, `[ANN]` im
   Kommentar. Wenn `lib/build.py` keine Balkonplatten je Geschoss kann: ergänzen (Platten als eigene Objekte, Glas als
   Glasmaterial), ohne die Detailzone der Nachbarn zu ändern.
3. **Nebeneinander-Prüfung** (lokal): Render aus mindestens zwei Street-View-Standpunkten (gleiche Richtung, Brennweite
   ungefähr) neben das Street-View-Bild legen. Je Turm Abweichungen in Worten melden; erst weiter, wenn Form, Balkone,
   Farbe und Kanten stimmen. Austro Tower nebenbei: Spitze verjüngt, wenn Street View das zeigt.
3b. **Nachtrag cloud-neu 24.11. spät: Fernsicht-Landmarken nach U12** (vor dem 4k-Render, damit nur einmal gerendert und
   veredelt wird). Berechnet aus Kameraposition, Blickrichtung und 20 mm (x = Bildposition von links, 0 bis 1; Lage über
   den Stephansdom aus `fern.json` verankert, ±20 m):
   | Landmarke | Kamera | x | Entfernung | heute im Modell |
   |---|---|---|---|---|
   | Stephansdom | stadt, 23 | 0,49 | 3,0 km | Turm mit Helm (r11d); Langhausdach fehlt als hohes Steildach |
   | Karlskirche | stadt, 23 | 0,26 | 2,7 km | Prisma |
   | Riesenrad | stadt, 23 | 0,93 | 2,5 km | fehlt ganz (nicht im BKM) |
   | Gasometer Simmering | hof | 0,67 | 1,4 km | Prisma bis 49 m |
   | Kraftwerk Simmering | hof | 0,48 | 2,8 km | nur niedrige Baukörper, kein Schornstein |
   | Arsenalturm (Fernmeldeturm) | 23_hof | 0,89 | 2,0 km | dünner Stab |
   Je Landmarke zuerst prüfen, ob sie im Bild überhaupt sichtbar ist (Probe 960 x 640 oder Objekt-ID-Ebene); nur sichtbare
   bauen, als echte Form, Maße aus Quellen, Details nach Street View oder Fotos:
   - Riesenrad: 64,75 m hoch, Rad 60,96 m Durchmesser, 15 Gondeln [wien.info, austria.info]; Speichenrad mit
     Stahlpylonen, im Bild rechts vermutlich vom Nachbarhaus verdeckt: dann weglassen und melden.
   - Karlskirche: ovale Kuppel (rund 72 m), zwei Triumphsäulen, Portikus, zwei Seitentürme [ANN aus Fotos].
   - Gasometer: vier Zylinder aus Ziegel, rund 70 m hoch, rund 65 m Durchmesser, Rundbogenfenster, flache Kuppeldächer
     [ANN, mit Street View prüfen].
   - Arsenalturm: Stahlbetonschaft, 155 m [Structurae], Betriebsgeschosse und Antenne nach Street View.
   - Kraftwerk Simmering: Schornsteine (Anzahl, Höhe, rot-weiße Ringe ja oder nein) nach Street View; Höhe in den
     Quellen nicht gefunden.
   - Stephansdom: hohes Steildach (Ziegelmuster, rund 38 m über Gewölbe) und Nordturm-Stumpf mit Haube [ANN aus Fotos].
   Außerhalb der 7,5 km (Kahlenberg, Leopoldsberg) nur prüfen, ob der Wienerwald-Horizont im Stadtblick sichtbar ist.
4. **Stimmung für die Terrassen** (Nutzer: mehr High-End-Penthouse), nur Licht und Ausstattung, keine Geometrie:
   - golden_hour: Sonne tiefer und wärmer (Höhe rund 5 bis 8 Grad), lange Schatten über die Terrasse, Himmel mit warmem
     Verlauf am Horizont.
   - In den Penthäusern Top 23-2 und 26-2 hinter den Glasflächen warmes Innenlicht an (2700 K, Pendel- und Stehleuchten),
     so dass von der Terrasse ein warmes Leuchten durch die Verglasung sichtbar ist.
   - Feuertisch mit sichtbarer Flamme (Emission), Whirlpool mit Unterwasserlicht, Outdoor-Küche mit dezenter Unterbauleuchte,
     2 bis 3 Windlichter oder Laternen auf Tisch und Boden, wo Props in der Bibliothek vorhanden sind (sonst melden).
   - blaue_stunde für `dachterrasse_stadt` etwas heller als r11e (der Render war fast schwarz), Innenlicht und Feuer an.
5. **4k mit Ebenen neu**, nacheinander:
   - Dach: die vier Dachkameras golden_hour und `dachterrasse_stadt` blaue_stunde nach `renders/r11g_dach/`
     (Befehle wie `noma_r11_penthaus_top24_25` Schritt 2, `--out r11g_dach`, `--no-blend --ebenen`).
   - Innen: `--top top24,top24_terrasse,top25,top25_terrasse,top23_2 --final --res 3840x2560 --samples 256 --out r11g_innen --ebenen`
     (Top 24/25 wegen TrIIIple im Fensterblick, Top 23-2 wegen der alten "Pagode" aus r11c).
   - JPG-Fassungen, Kontaktbögen, einchecken: JPGs, Planbeleg, Ebenen ohne `normalen.png`.

## Melden
- Je Turm: was Street View zeigt (Höhenzonen, Balkone, Farbe, Ecken) und was im Modell jetzt so gebaut ist; was unsicher bleibt.
- Nebeneinander-Befund je Standpunkt in Worten (ohne Bild im Repo).
- Zeit, Speicher, Planbeleg je Kamera, Ebenen `nicht_zugeordnet`.
- Danach veredelt cloud-neu: 5 Dach, 8 Top 24/25, 3 Top 23-2 mit Stimmungs-Prompts (16 x 3,25 = 52 Credits).
