# Auftrag wimmergasse_r11_fernsicht

Status: offen
Erstellt: 25.11.2026 (Nacht), cloud-neu
Erledigt:

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
