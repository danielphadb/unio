# Auftrag noma_tapete_bettwand

Status: erledigt (mac-neu, 26.11.2026 04:55)
Erstellt: 25.11.2026 23:30, cloud-neu
Erledigt: 26.11.2026 04:55, mac-neu

Start nach `noma_r12_dachgeschoss_highend` (r12h) und Wimmergasse `dachgeschoss_frei`/`_b`, sobald keine andere Mac-Arbeit
läuft. Zuerst anmelden, Status setzen, pushen. Nie zwei Renders parallel. Keine Credits.

## Ziel
Nutzer 25.11.2026 23:20: "Bitte 2 bis 3 Visualisierungen von den Noma-Apartments, wo statt der roten Wandfarbe hinter dem
Bett eine Tapete wie diese genutzt wird, idealerweise im Rot der derzeitigen Wandfarbe."

Vorlage des Nutzers (Bild bleibt lokal, nicht ins Repo): Damasttapete Ton in Ton, flächiges barockes Blumen- und
Rankenornament, samtig beflockt mit leichtem Schimmer, Muster nur wenig heller und dunkler als der Grund.

Betroffen: Variante 2 mit bordeauxroter Bettwand (`bordeaux_wand`, #5C1727, INT2 S. 6): `apt06_v2` (zuerst) und `apt01_v2`.

## Schritte
1. **Material `bordeaux_tapete`** (`lib/materials.py` oder `wohnungen.yaml` Materialliste): Grundfarbe #5C1727, Damastmuster
   als eigene nahtlose Textur (Ornament gespiegelt, z. B. per Skript erzeugt, keine Fremdtextur ohne Lizenz; falls CC0,
   Lizenz in `assets/LIZENZEN.md`). Rapport rund 53 cm (Standardbahn), Muster plus/minus 8 bis 12 % Helligkeit, Grund matt
   (Rauheit rund 0,85), Ornament samtig mit leichtem Glanz (Rauheit rund 0,55, Sheen), leichtes Relief (Bump 0,1 bis 0,2).
   UV in Weltmaß auf den Wandflächen, Muster läuft über Ecke und Rundung durch, saubere Kante an Decke und Holzverkleidung.
2. **Variante `apt06_v2_tapete`** (gleiche Hülle, Möbel, Kameras wie `apt06_v2`; nur `bordeaux_wand` auf den Bettwandflächen
   und der Rundung durch `bordeaux_tapete` ersetzt, z. B. über `material_ersatz`).
3. **Probe 960 x 640** von `bett`, `bett_diagonal`, `bett_abend`; Muster-Maßstab und Glanz prüfen (Rapport im Bild
   plausibel, kein Moiré, nicht rosa, nicht braun). Kontaktbogen neben die r10-Bilder mit Farbe.
4. **4k mit Ebenen** der drei Kameras nach `renders/r13_tapete/` (gleiche Lichtstimmungen wie r10), Planbeleg.
5. Wenn Zeit: dieselbe Variante für `apt01_v2` (Kamera Bettblick) als Probe.

## Melden
Probe-Kontaktbogen, Rapport und Materialwerte, Zeit, Planbeleg. Danach veredelt cloud-neu (vom Nutzer beauftragt).

## Stand cloud-neu
Schnelltest mit KI auf den gelieferten r10-Bildern (`apt06_v2_bett`, `bett_diagonal`, `bett_abend`), damit der Nutzer den
Look vorab sieht; der echte Render mit Material bleibt maßgeblich (REGELN: Geometrie und Material im Modell, nicht per Prompt).

## Ergebnis (mac-neu, 26.11.2026)

1. **Muster:** eigenes Damastmuster per Skript (`lib/assets/damast.py`, keine Fremdvorlage, Eintrag "Eigene Muster" in
   `assets/LIZENZEN.md`): gespiegeltes Medaillon mit Spitzbogen-Doppelkontur, Mittelstiel mit Blattpaaren, Ranken mit
   Spiralen, Lilienkrone, äußere Akanthus-S-Ranken, Rosette auf Versatz (halbe Bahn). Graustufen-Rapport 1024 px,
   wird bei Bedarf erzeugt (`assets/texturen/`, nicht im Repo).
2. **Material `bordeaux_tapete`** (`materials.tapete_damast`, `art: tapete` in der Materialliste): Grund #5C1727,
   Rapport 0,53 m in Weltmaß (Box-Projektion, läuft über Ecke und Rundung), Kontrast 0,075 (Muster etwa 8 % dunkler bzw.
   10 % heller; Probe mit 0,10 wirkte im Abendlicht leicht rosa in den Linien), Rauheit Grund 0,85, Ornament 0,55,
   Sheen 0,5 nur auf dem Ornament, Bump 0,15.
3. **Variante `apt06_v2_tapete`** (YAML-Anker auf `apt06_v2`, nur `material_ersatz bordeaux_wand: bordeaux_tapete`).
4. **Probe** 960 x 640 (`renders/r13_tapete_probe/`, lokal): Farbe Bordeaux, nicht rosa, nicht braun; Maßstab plausibel
   (etwa drei Medaillons über die Wandhöhe über der Verkleidung); in der kleinen Probe leichte Unruhe in feinen Linien.
5. **4k mit Ebenen** `renders/r13_tapete/`: `bett`, `bett_diagonal`, `bett_abend`, 3840 x 2560, 256 Samples, Lichtstimmungen
   wie r10. Zeit 23 Minuten für alle drei (04:30 bis 04:53). Planbeleg je 0 Fehler. In 4k kein Moiré, Muster scharf und
   Ton in Ton. `kontaktbogen_vorher_nachher.jpg` (r10 Wandfarbe links, Tapete rechts), `kontaktbogen_apt06_v2_tapete.jpg`.
   Bereit zur Veredelung durch cloud-neu.
6. `apt01_v2` noch nicht (optional, folgt als Probe, wenn die Nacht reicht).

Hinweis: Das Ornament wirkt eher wie ein grafisches Blatt- und Rankenmuster als ein dichter barocker Damast. Wenn der
Nutzer es dichter und flächiger will: in `damast.py` Strichbreiten erhöhen und Blätter füllen, dann neu erzeugen.
