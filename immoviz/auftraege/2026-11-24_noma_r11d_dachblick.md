# Auftrag noma_r11d_dachblick

Status: erledigt (mac-neu, 24.11.2026 18:05, ohne Google mit offenen Daten Wien)
Erstellt: 24.11.2026, cloud-neu
Erledigt:

Start nach dem laufenden Penthaus-Neurender (r11c), sobald keine andere Mac-Arbeit läuft (`SITZUNGEN.md` "Laufend",
`pgrep -f immoviz.py`). Zuerst in `SITZUNGEN.md` anmelden und hier `Status: in Arbeit (<kennung>, <Datum Uhrzeit>)` setzen, pushen.

## Ziel
Nutzer 24.11.2026 zu den Dachterrassen-Bildern Runde 11: "die Blickwinkel und Häuser, die man von oben von der Terrasse sieht,
stimmen nicht, bitte richtig ziehen, auch die Häuser aus dem Hof, die in unmittelbarer Nähe, sowie auch die Hochhäuser müssen
richtig sein."

Die Umgebung kommt aus den Daten der Stadt Wien (Baukörpermodell, Dachmodell LOD2 im Radius 420 m, Fernsicht hohe Teile ab
33 m bis 7,5 km) und für die Hoffassaden aus den Fotos vom 20.11. (aus Augenhöhe im Hof). Von oben wurde das nie geprüft.
Die Hochhäuser stehen als weiße Kästen im Modell (z. B. B76421 109,6 m und Z22087 95,8 m in 460 bis 520 m Entfernung,
Z01437 133,2 m in 1,26 km); ob Lage, Höhe, Anzahl und Form stimmen und ob Neubauten fehlen, ist offen.
Das Werkzeug dafür ist `immoviz.py referenz` (Google Photorealistic 3D Tiles, nur interne Referenz). Der Schlüssel liegt nur
auf dem Mac in der Umgebungsvariable `GOOGLE_MAPS_API_KEY`.

## Befehle
Aus dem Repo-Ordner, nacheinander.

```bash
git pull --rebase
pgrep -f immoviz.py && echo "BELEGT: warten" || echo frei
# Schlüssel nur als Umgebungsvariable in der Sitzung setzen, nie in Dateien, Logs oder Commits

# 1. Kalibrierung (erstes Mal für Noma) und Abgleich der vier Dachkameras
.venv-immoviz/bin/python immoviz/immoviz.py referenz immoviz/projects/noma-shg13 --kamera dachterrasse_stadt,dachterrasse_hof,dachterrasse_23,dachterrasse_23_hof --kalibrieren --licht golden_hour

# 2. Einchecken: nur die Abgleichbilder ohne Google-Inhalt und die Befunde (renders/streetview/ bleibt lokal)
git add immoviz/projects/noma-shg13/renders/check/abgleich_dachterrasse_*
```

## Danach (Mac, weil nur dort die Referenz sichtbar ist)
1. Google-Ansicht und Modell je Kamera nebeneinander anschauen (lokal) und hier in Worten melden, ohne Bild: welche Häuser
   im Hof und in unmittelbarer Nähe von oben falsch sind (Höhe, Dachform, Gauben, Dachterrassen, fehlende Baukörper),
   welche Hochhäuser falsch stehen, zu hoch oder zu niedrig sind, eine andere Form haben oder fehlen (mit Namen, wenn
   erkennbar), und ob die Horizontlinie passt.
2. Eindeutige Fehler direkt im Modell korrigieren, mit Quelle "Google 3D Tiles Abgleich 24.11.2026 (intern)":
   Dächer über `roofs_override`, Nachbarbaukörper im Hof über `neubau` (`nb_umgebung_*`), fehlende oder falsche Hochhäuser
   in der Fernsicht (Ergänzung neben `data/fern.json`, Lage und Höhe aus dem Abgleich). Danach `referenz --nur-modell` erneut
   und die Kennzahlen vorher/nachher melden.
3. 4k mit Ebenen neu: die vier Dachkameras golden_hour und `dachterrasse_stadt` blaue_stunde nach `renders/r11d_dach/`
   (wie im Auftrag noma_r11, Schritt 2 und 3), JPG und Ebenen ohne `normalen.png` einchecken.

## Melden
- Kennzahlen je Kamera (Kantendeckung, Horizont, je Gebäude Traufe/First/IoU) vorher und nachher.
- Liste der Änderungen mit Begründung; was unsicher bleibt.

## Ergebnis
mac-neu, 24.11.2026:
1. Playwright fehlte auf dem Mac; mit Zustimmung des Nutzers installiert (`npm i -g playwright@1.65.1`, ohne eigenen
   Browser). Chrome über `IMMOVIZ_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
2. **Blocker:** `tile.googleapis.com/v1/3dtiles/root.json` antwortet mit HTTP 403 PERMISSION_DENIED: "satellite tiles and
   3D tiles are not available for your account and region" (Google-Regel für Konten im EWR, siehe
   developers.google.com/maps/comms/eea/map-tiles). `referenz` bricht daher in Cesium ab ("page.evaluate: Xq"). Mit diesem
   Schlüssel ist kein Google-Abgleich möglich; nichts gerendert, nichts am Modell geändert.
3. Entscheidung beim Nutzer: andere Referenz (Fotos von der Dachterrasse, offene Daten wie basemap.at-Orthofoto und
   Stadt-Wien-Daten, ein Konto außerhalb des EWR) oder Abgleich ohne Referenz nur gegen die Stadt-Wien-Daten.
4. **Abgleich ohne Google** (Nutzer: "Offene Daten Wien"): Baukörpermodell [OGD] über das Orthofoto 2024 der Stadt Wien
   (WMTS lb2024, Zoom 18 und 20) gelegt, dazu eine Draufsicht des Modells (240 m, lokal, nicht eingecheckt).
   - Nahbereich und Hof: Blockränder, Hofhäuser (Schnirchgasse 4/6, Würtzlerstraße, Erdbergstraße), Dachfarben und
     Dachformen decken sich mit dem Orthofoto; keine fehlenden oder abgerissenen Baukörper gefunden.
   - Hochhäuser: Lage und Höhe passen: TrIIIple (BKM Z43908) 110,8 bis 120,3 m, veröffentlicht 108/117/120 m (CTBUH);
     Austro Tower (Z80306, Schnirchgasse 17) 135,1 m, veröffentlicht 135 bis 136,6 m (Stadt Wien, CTBUH); weitere Türme
     B76421 109,7 m, Z22087 95,8 m, in 1,2 km Z01437/Z01440/Z01441 112 bis 133 m. Stephansdom (169932, in den
     Strukturdaten als "Curhauskapelle") 136,2 m über Sockel, stimmt.
   - Fehler 1: Außerhalb `detail_radius_m` (120 m) und in der Fernsicht waren alle Hochhäuser glatte beige bzw. graue
     Kästen ohne Fenster.
   - Fehler 2: ÖAMTC-Zentrale Baumgasse 129 (Rundbau, 2017) hatte aus dem LOD2 (Stand 2016, Bauzustand) ein Kegeldach bis
     +41,8, das von der Terrasse als "Pagode" erschien; Orthofoto 2024 zeigt Flachdach mit Hubschrauberlandeplatz.
   - Fehler 3: Stephansdom nur als dünne Säule ohne Helm.
5. **Korrekturen** (Quelle in `project.yaml`):
   - Neu `hochhaeuser` in `project.yaml` und `lib/build.py` (`_hochhaus_spec`, `_hochhaus_fassade`), `lib/fern.py`
     (`markante(..., fassade)`): Geschossbänder, Glasbänder, Pfosten rundum für alle Baukörper ab 40 m bis 2 km.
     TrIIIple mit weißen umlaufenden Balkonbändern (3,1 m Geschoss, 1,2 m Auskragung), Austro Tower Glasfassade blaugrau,
     ÖAMTC runder Glasbau. Farben und Raster [ANN nach Orthofoto/Bildern], ohne Eintrag bleibt alles wie bisher.
   - `roofs_override` 229182 (ÖAMTC): Flachdach je Baukörperteil auf BKM-Höhe statt Kegel.
   - `fern_spitzen` 169932: Stephansdom-Südturm mit Helm (Turm bis +81, Spitze +147,3 lokal).
6. **4k mit Ebenen** (`renders/r11d_dach/`, 3840 x 2560, 256 Samples, `--no-blend`): 4 Kameras golden_hour in 810 s,
   `dachterrasse_stadt` blaue_stunde in 181 s, Peak 41,6 GB. **Planbeleg 5 x 0** (stadt 25, hof 39, 23 20, 23_hof 52
   sichtbare Objekte), Ebenen `nicht_zugeordnet: []`, Schutz 52 bis 77 %. Kontaktbogen `r11d_dach/kontaktbogen.jpg`.
   Proben `r11d_probe/` (1500 x 1000). Keine Higgsfield-Credits.
7. **Unsicher:** Farben und Fassadenraster der Hochhäuser sind angenommen (kein Foto von oben); ob von der Terrasse
   weitere Neubauten nach dem Stand des Baukörpermodells sichtbar wären, lässt sich ohne Schrägbild nicht prüfen. Der
   helle glatte Baukörper links in `dachterrasse_23_hof` liegt im Nahbereich und wurde nicht weiter untersucht. Die
   Kennzahlen des Werkzeugs `referenz` (Kantendeckung, Horizont) fehlen, weil es nur mit Google arbeitet.

