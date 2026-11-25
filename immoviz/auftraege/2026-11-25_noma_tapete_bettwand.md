# Auftrag noma_tapete_bettwand

Status: offen
Erstellt: 25.11.2026 23:30, cloud-neu
Erledigt:

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
