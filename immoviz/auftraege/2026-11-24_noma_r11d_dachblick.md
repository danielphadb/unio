# Auftrag noma_r11d_dachblick

Status: in Arbeit (mac-neu, 2026-11-24 17:20, ohne Google mit offenen Daten Wien, Wunsch des Nutzers)
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
