# Auftrag wimmergasse_r11_fernsicht

Status: Probe fertig, 4k wartet auf Freigabe des Nutzers
Erstellt: 25.11.2026 (Nacht), cloud-neu
Erledigt: Probe 25.11.2026 01:10, mac-neu

Start erst nach `noma_r11g_triiiple_stimmung` und sobald keine andere Mac-Arbeit läuft (`SITZUNGEN.md` "Laufend",
`pgrep -f immoviz.py`). Zuerst in `SITZUNGEN.md` anmelden und hier `Status: in Arbeit (<kennung>, <Datum Uhrzeit>)` setzen,
pushen. Nie zwei Renders parallel. Keine Credits.

## Ziel
Nutzer 24.11.2026: Hochhäuser und Landmarken in der Umgebung müssen in allen Projekten stimmen (`REGELN.md` U12), sonst
keine High-End-Qualität. Neuer Befehl `immoviz.py landmarken <projekt>` listet je erhöhter Außenkamera die Wiener Landmarken
im Bildwinkel mit Bildposition x (0 links bis 1 rechts), Entfernung und Stand im Modell.

Befund Wimmergasse (25.11. Nacht, `landmarken`, Verdeckung nicht geprüft):

| Kamera | Landmarken im Bildwinkel (x) | Modell heute |
|---|---|---|
| drohne | Kahlenberg 0,29, Rathaus 0,45, Spittelau 0,46, Votivkirche 0,48, Millennium Tower 0,75, Stephansdom 0,82, Uniqa Tower 0,90, Donauturm 0,99 | Prismen, Stephansdom mit Helm |
| dachgeschoss | ähnlich drohne | Prismen |
| drohne_sued | Kahlenberg 0,75, Rathaus 0,93, Spittelau 0,96, Votivkirche 0,97 | Prismen |
| ausblick_terrasse (nur Vorschau) | Wienerberg Twin Towers 0,52 (2,1 km) | Prisma |

Sichtprüfung `drohne_golden_hour_r10b_final.jpg`: am Horizont hat die KI bei x rund 0,75 einen Fernsehturm gemalt; dort
steht der Millennium Tower (Glaszylinder mit Antenne). Bei x 0,45 bis 0,48 nur ein Turm statt Rathausturm und den zwei
Türmen der Votivkirche. Die KI bekommt Prismen und rät die Form.

## Schritte
1. `immoviz.py landmarken immoviz/projects/wimmergasse-20` ausführen, mit Probe-Render (960 x 640) je Kamera prüfen, welche
   Landmarken wirklich über die Dächer ragen.
2. Nur die sichtbaren als echte Form bauen (`fern_spitzen` erweitern oder `hochhaeuser.formen`), Maße aus Quellen, Details
   nach Street View oder Fotos, Quelle je Eintrag:
   - Rathaus: Mittelturm 98 m mit Rathausmann, vier Ecktürmchen [Stadt Wien].
   - Votivkirche: zwei durchbrochene neugotische Türme 99 m mit Helmen [ANN].
   - Millennium Tower: zwei versetzte Glaszylinder, Dachkrone und Antenne, 202 m [CTBUH].
   - Fernheizwerk Spittelau: Schornstein mit goldener Kugel, bunte Fassade [ANN].
   - Uniqa Tower: Glasturm mit Medienfassade [ANN].
   - Donauturm: Betonschaft mit Turmkorb und Antenne, 252 m [donauturm.at], nur wenn im Bild.
   - Wienerberg Twin Towers: zwei Glastürme, keilförmiger Grundriss, 138 m [CTBUH], für `ausblick_terrasse`.
   - Wienerwald-Horizont mit Kahlenberg-Sender: nur prüfen, ob die Geländekulisse stimmt.
3. Probe der Kameras drohne, dachgeschoss, drohne_sued neu; die alten Renders bleiben. 4k erst nach Freigabe des Nutzers
   (dann neue Veredelung nötig).

## Melden
- Je Landmarke: sichtbar ja oder nein, gebaut wie, Quelle; was unsicher bleibt.
- Probe-Kontaktbogen `renders/r11_fern_probe/kontaktbogen.jpg`.

## Ergebnis (mac-neu, 25.11.2026)
Neu in `project.yaml` Block `fern_landmarken` (Bauteile aus `lib/landmarken_bau.py`, aus `noma_r11g`); die Prismen des
Baukörpermodells werden je Eintrag über `ersetzt` ausgeblendet. Lage aus dem Baukörpermodell (fern.json), da die Lagen in
`landmarken` rund 20 bis 30 m abweichen. Probe 960 x 640, golden_hour, 96 Samples, Planbeleg drohne 77 x 0, drohne_sued
72 x 0. Kontaktbogen mit Ausschnitten `renders/r11_fern_probe/kontaktbogen.jpg`.

| Landmarke | sichtbar | gebaut | Quelle |
|---|---|---|---|
| Rathaus | ja, drohne und drohne_sued | bleibt `fern_spitzen` Rathausturm (Körper und Helm bis +93,7), als schlanker Turm mit Helm gut lesbar; Ecktürmchen nicht gebaut (unter einem Pixel) | Stadt Wien, Messung 3D-Abgleich 16.11. |
| Votivkirche | ja, beide | `doppelturm`: zwei Türme 99 m, Abstand 20,5 m, Achse nach BKM, Helme | ANN, BKM 128619 |
| Fernheizwerk Spittelau | ja, beide, Kugel als goldener Punkt erkennbar | `schornstein` 126 m, goldene Kugel r 7 m auf +98 m | ANN, BKM 142265 |
| Millennium Tower | ja, drohne | `zylinderturm` aus zwei versetzten Glaskreisen, Antenne, 202 m | CTBUH, BKM 063994 |
| Stephansdom | ja, drohne | unverändert (`fern_spitzen` Südturm mit Helm) | Messung 3D-Abgleich 16.11. |
| Donauturm | ja, drohne am rechten Rand | `turm_korb`: Schaft, Korb auf 0,6 H, Antenne, 252 m | donauturm.at, BKM 073723 |
| Uniqa Tower | ja, drohne, als Block | Prisma (3,5 km, Medienfassade ohne Wirkung bei Tag) | BKM 137033 |
| Sender Kahlenberg | kaum, unter einem Pixel breit (wie in echt bei 32 mm) | neu `schornstein` als Mast 165 m auf 484 m ü. A.; Lage nur auf rund 200 m genau, Farbe unsicher | ANN, Literatur |
| Wienerberg Twin Towers | nicht geprüft (nur Vorschau `ausblick_terrasse`) | Prisma | |

Unsicher bzw. offen:
- **Wienerwald-Kulisse**: Silhouette und Lage passen (Abgleich 16.11.), aber das Band aus senkrechten Flächen zeigt im
  Streiflicht harte hell-dunkel-Facetten (blau und grau). Die Veredelung sollte sie als dunstige Hügel malen; im Modell
  wäre ein einheitlich getöntes Band besser. Versuch 25.11. 01:07: Oberkante entlang des Sehstrahls 15 % zur Mitte
  gezogen (geneigter Hang, Silhouette gleich); Ergebnis fast schwarz statt dunstig, daher verworfen und nicht committed.
  Versuch 01:13: feste Schattierungsnormale nach oben im Material `fern_wald` ergab harte dreieckige Schattenflecken,
  ebenfalls verworfen. Nächster Weg: Dunstfarbe mit wenig Abhängigkeit vom Licht (Material), bei Tag in Ruhe testen,
  betrifft alle Projekte.
- **Kamera `dachgeschoss`**: bisher nie gerendert; sie steht in `nachbar_diagonal_s` und einer Ahornkrone, das Bild ist
  schwarz (Planbeleg: 3 Objekte). Vom Standpunkt +12 m ragen ohnehin keine Landmarken über die Traufen. Neue Position
  braucht eine Vorgabe (Motiv), daher nicht verschoben.
- Ecktürmchen des Rathauses und Turmhelme der Votivkirche sind bei 960 px nur wenige Pixel; in 4k prüfen.
- 4k erst nach Freigabe des Nutzers (dann neue Veredelung nötig); Befehl wie Probe mit `--res 3840x2560 --samples 256
  --ebenen --out r11_fern`.

## Vorschlag cloud-neu (25.11. 01:35) für die Wienerwald-Kulisse
Ziel: einheitlich dunstiger Ton ohne Facetten, unabhängig vom Sonnenstand. In `lib/materials.py` statt `simple(... "fern_wald")`:
- Mix Shader aus Diffuse (Farbe wie jetzt) und Emission (Dunstfarbe = Himmelsfarbe am Horizont je Licht, z. B. golden_hour
  warm-grau #B7B1A8, blaue_stunde #4A5566, Tag #A9B4BE), Faktor rund 0,7 zur Emission; Emissionsstärke an die Belichtung des
  Lichts koppeln (rund 0,6 bis 1,0), damit das Band nicht leuchtet und nicht schwarz wird.
- Optional Luftperspektive: Camera Data > View Distance über Map Range (2 bis 10 km auf 0,5 bis 0,9) als Mix-Faktor, so wird
  der Kamm mit der Entfernung heller und blasser.
- Kein Licht-abhängiger Schattenwurf auf dem Band (Objekt: Schatten empfangen aus, Ray Visibility Shadow aus), damit keine
  dreieckigen Flecken entstehen.
- Prüfen an `drohne` (Wimmergasse) und `dachterrasse_stadt` (Noma), golden_hour und blaue_stunde, Probe 960 x 640.
