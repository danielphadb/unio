# Auftrag wimmergasse_r11b_fernsicht_4k

Status: erledigt (Kamera dachgeschoss wartet auf die Wahl des Nutzers)
Erstellt: 25.11.2026 früh, cloud-neu
Erledigt: 25.11.2026 10:10, mac-neu

Start, sobald keine andere Mac-Arbeit läuft. Zuerst anmelden, Status setzen, pushen. Nie zwei Renders parallel. Keine Credits.

## Freigaben des Nutzers (25.11.2026)
- Wienerwald-Kulisse: "Ja, testen" (Vorschlag in `2026-11-25_wimmergasse_r11_fernsicht.md`, Abschnitt Vorschlag cloud-neu).
- Wimmergasse Drohnenbilder: "Ja, beide Drohnen" in 4k, danach Veredelung durch cloud-neu (2 x 3,25).
- Kamera `dachgeschoss`: Probe vom Drohnenstandpunkt (Vorschlag ebenda); danach entscheidet der Nutzer, ob sie bleibt.

## Schritte
1. Wienerwald: Material `fern_wald` nach dem Vorschlag (Dunst-Emission je Licht, Luftperspektive, kein Schattenempfang),
   Probe 960 x 640 an `drohne` (Wimmergasse) und `dachterrasse_stadt` (Noma), golden_hour und blaue_stunde, vorher/nachher.
   Übernehmen, wenn ruhiger und dunstig; sonst melden.
2. Kamera `dachgeschoss`: `pos [-11.1, -12.9, 12.0]` (oder `[-9.6, -14.0, 12.0]`), Ziel unverändert, Probe 960 x 640.
3. 4k mit Ebenen: `drohne` und `drohne_sued` golden_hour nach `renders/r11_fern/` (`--res 3840x2560 --samples 256 --ebenen`),
   JPG, Planbeleg, einchecken.

## Melden
Vorher/nachher der Kulisse in Worten, Probe dachgeschoss, Zeit, Planbeleg.

## Ergebnis (mac-neu, 25.11.2026)

1. **Wienerwald-Kulisse übernommen.** `fern_wald` ist jetzt reine Emission in der Himmelsfarbe am Horizont in
   Blickrichtung (eigener Himmel im Material, `M.set_dunst` gleicht ihn in `setup_light` an Sonnenstand, Dunst und
   Himmelsstärke der Lichtstimmung an), abgedunkelt nach Entfernung (Map Range der View Distance 2 bis 12 km auf 0,40 bis
   0,72), leicht kühl getönt. Die Sonne beleuchtet das Band nicht mehr, deshalb keine Facetten und keine dreieckigen
   Schattenflecken. `IMMOVIZ_DUNST=aus` holt das alte Material zurück. Code: `lib/materials.py` (`fern_wald`, `set_dunst`),
   `lib/build.py` (eine Zeile in `setup_light`). Gilt für alle Projekte.
   - Vorher: blaugraue Wand mit sichtbaren Facetten, links hart gegen den Himmel; zur blauen Stunde schwarzer Kamm.
   - Probe 1 (0,55 bis 0,88): ruhig, aber zur goldenen Stunde fast unsichtbar.
   - Probe 2 (0,40 bis 0,72, übernommen): Kamm als dunstige Silhouette sichtbar, ruhig, zur blauen Stunde eine Stufe
     dunkler als der Himmel statt schwarz. Noma `dachterrasse_stadt` zeigt kaum Kulisse (Blick nach Norden), dort keine
     Verschlechterung.
   - Belege: `projects/wimmergasse-20/renders/r11b_probe/kontaktbogen_vorher_nachher.jpg`, `kontaktbogen_horizont.jpg`
     (Horizontstreifen vorher, Probe 1, Probe 2), `r11b_probe2/`, `projects/noma-shg13/renders/r11b_probe/`.
2. **Kamera dachgeschoss als Probe.** Neue Kameras `dachgeschoss_frei` (pos -11,1/-12,9/12,0) und `dachgeschoss_frei_b`
   (-9,6/-14,0/12,0), Ziel 3/4/21, 35 mm. Beide frei, Dachausbau vollständig vor dem Himmel, Planbeleg 15 bzw. 13 Objekte,
   0 Fehler. `dachgeschoss_frei` nimmt links mehr vom Bestand mit. `dachgeschoss` (im Haus 009479) bleibt bis zur Wahl
   des Nutzers stehen. Beleg: `r11b_probe/kontaktbogen_dachgeschoss.jpg`.
3. **4k mit Ebenen:** `renders/r11_fern/`, `drohne` und `drohne_sued` golden_hour, 3840 x 2560, 256 Samples.
   Planbeleg drohne 77 Objekte, drohne_sued 72 Objekte, je 0 Fehler, `nicht_zugeordnet` leer. Zeit 619 s für beide,
   Spitze 21,2 GB. JPG, Ebenen (ohne `normalen.png` und `hintergrund/`), `kontaktbogen.jpg` mit Horizontstreifen.
   Bereit zur Veredelung durch cloud-neu.
