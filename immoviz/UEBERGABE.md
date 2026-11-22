# Übergabe von cloud-alt (Stand 22.11.2026)

Wissen aus dem ersten Cloud-Chat (14. bis 21.11.2026), das nicht schon in `README.md`, `REGELN.md`, `KONZEPT.md`,
`MAC_SETUP.md` oder den Projektdateien (`projects/*/README.md`, `umgebung_abgleich.md`, `staging.json`,
`interior_v2.md`, `mood_*.md`, `begehung.md`) steht. Das Repo ist öffentlich: hier stehen keine Schlüssel, keine
Freigabelinks auf Drive-Dateien, keine persönlichen Kontaktdaten. Kontakte stehen im Agency Hub.

## 1. Arbeitsweise und Vorlieben des Nutzers

- Antworten auf Deutsch, knapp und konkret, ohne Gedankenstriche (Organisationsregel). Ehrlich, auch wenn etwas
  nicht gut geworden ist; der Nutzer hat mehrfach Fehler selbst gefunden und will das künftig vermeiden.
- Ergebnisse immer: Kontaktbogen (Vorschau | Endbild) plus Einzelbilder, auf Wunsch als ZIP. Bilder mit bekanntem
  Fehler deutlich markieren (Dateiname `_VORBEHALT`) und nie ungeprüft als fertig liefern.
- **Keine Lieferung mit bekanntem Modellfehler.** Am 21.11. kritisiert: Runde 9 wurde geliefert, obwohl der
  Agent die falsche Wand bei Top 4 schon kannte. Erst Modell reparieren, dann veredeln.
- Kostenbewusst: fragt nach Claude-Nutzung in Prozent und nach Higgsfield-Credits. Vor größeren Läufen grob
  schätzen (Mac-Render kostet wenig Claude-Nutzung, Agenten mit vielen Bildansichten viel). Den echten Wert sieht
  nur der Nutzer unter Einstellungen, Nutzung.
- Will "echt High-End-Niveau", Maßstab sind die Referenzordner bzw. Projektvisualisierungen; später auch Videos
  (siehe Abschnitt 6).
- Entscheidungen gern gesammelt auf einer Abstimmungsseite (Artifact mit Datenbank, siehe Abschnitt 5).
- Agency Hub (Organisationsregel): erledigte Routinearbeit ohne Rückfrage mit `update_protokollieren` beim richtigen
  Kunden, ein Satz. Notizen, Tasks, Strategie nur nach ausdrücklichem Ja. Noma läuft beim Kunden
  **Trattner & Söhne** (nicht UNIO; das wurde am 15.11. korrigiert), Wimmergasse bei **UNIO**. IDs per `kunde_finden`.

## 2. Wimmergasse 20, 1050 Wien ("Das Wimmer", Bauträger VPH, Vermarktung UNIO)

### Stand
- Modell: Pflichthäuser je Richtung, Dächer per Google-3D-Abgleich (`referenz`), Fernsicht, Leuchten-Inventar
  (24 Seilleuchten), Poller, Begehung mit 47 Standorten abgeschlossen (`begehung.md`), Geländer 13/13 nach Plan,
  Plan-Soll-Prüfung 0 Abweichungen, Straßenkameras auf `augenhoehe: 1.6` (REGELN K5).
- Außenbilder: Runde 5 (13 Motive) und Runde 6 (19 Motive, gpt_image_2_6 4k, Mood nach Referenzordner) frei
  veredelt, also ohne Schutzmaske: Stimmung gut, Fenster und Dachgeschoss teils falsch. Runde 7 final (6 Motive) mit
  Schutzmaske: Geometrie richtig, Fassade flacher, weniger Leben. Toleranz-Test (`r7_toleranz/`): begrenzter Gewinn.
- Innen: Tops 7, 12, 35 (auch ohne Wandvertäfelung), Walkthrough Top 35, Schnittvideo, Projektseite `das-wimmer/`
  (Stand 14.11., alte Außenbilder).

### Entscheidungen und Rückmeldungen
- 14.11. Grundregeln Umgebung: erste 4 bis 5 Häuser je Straßenseite exakt, dahinter Dächer "halbwegs", in der
  Drohne markante Fernsicht, immer Prüfung von Parkordnung und Gehsteigen, Bäume an der richtigen Stelle.
- 15.11. Street View, Google 3D und Apple Maps nur interne Referenz; "Zwischenlösung" (Foto plus Modell) nur zum
  Vergleich, nie Vermarktung. Nutzer kennt die Lizenzlage.
- 16.11. Drohne 1:1 gegen Google-Blickwinkel abgleichen (umgesetzt). Außenbilder "clean" neu (Runde 5). Mood und
  Qualität nach Referenzordner, andere Winkel (Runde 6).
- 16.11. **Referenzbilder dürfen zu Higgsfield hochgeladen werden** (Nutzer, Chat). Der Upload wurde damals von der
  Berechtigungsprüfung der Sitzung abgelehnt und nie ausgeführt; bisher nur Beschreibung im Prompt.
- 18.11. Realistische Autos (BlenderKit, Auswahl durch den Nutzer in der Mac-Sitzung), Mischung Alltagsautos
  (70/20/10, keine Sportwagen nah an der Kamera).
- 18.11. Kritik: "reine Blender-Bilder zu schlecht, KI-Bilder stimmen nicht (Fenster)"; Schwelle in die Gasse falsch
  (Apple-Look-Around-Bild) daraus wurde die Begehung.
- Fragen an den Nutzer ohne Antwort: Farbwert Caparol Curcuma 60 (im Modell geschätzt #E2CFA8).

### Offene Fragen an den Bauträger
1. RAL-Farbe Geländer und Glas-Klemmprofile.
2. Datei "250507 W20_EIN_Ansichten; Schnitte" (12,3 MB) kleiner als 10 MB schicken (Drive-Connector-Grenze):
   Ansicht Stolberggasse, Schnitte, Geländertyp Stolberggasse.
3. Schnitt mit Koten durch das Dachgeschoss (Rinne 0,45 m laut Scan, Modell 0,7 m).
4. Geländer zwischen Terrassen Top 31 und Top 34? Fixteil DG3-Ecke Eckverglasung?
5. Erdgeschoss Stolberggasse: bleibt das Lokal (Holzportal über Eck), wie ist das EG geplant?
6. Caparol Curcuma 60 als Wert oder Farbmuster.

### Bekannte Fehler
- Innenmodell Top 35 hat noch die alte Glasfront bei d 1,8 (passt nicht zum korrigierten DG3-Einschnitt).
- Kamera `dachgeschoss` steht im Nachbarhaus Wimmergasse 15 (Bild schwarz).
- Nachkontrolle meldet "neue Fenster" als Fehlalarm, wenn `normalen.png` fehlt.
- Projektseite `das-wimmer/` und Studio-Seite zeigen alte Bilder.

### Nächste Schritte (Reihenfolge)
1. Ergebnis `auftraege/2026-11-19_ki_lokal_test.md` abwarten (SDXL vs FLUX auf dem Mac), dann Verfahren wählen.
2. `auftraege/2026-11-19_runde8_begehung.md` (4k-Neurender der Straßenkameras nach der Begehung).
3. Veredelung mit gewähltem Verfahren, Schutzmaske, Grading, Nachkontrolle; Nutzer-Abnahme.
4. Projektseite und Videos auf den neuen Stand.

## 3. Noma, Schlachthausgasse 13, 1030 Wien (Kunde Trattner & Söhne)

### Fokus des Nutzers (20.11.)
**Wichtig sind nur die Apartment-Renderings und die Terrassen von Top 3 und Top 4.** Rest (Penthouse, Gärten,
Straße) ruht. Keine Begehung der Noma-Straßen nötig.

### Stand
- Modell: EG/1.OG, Verbindungsweg, Obergeschoße Straßenhaus und Würtzlerstraße 10 nach Einreichplan; Geländer
  65/65; Plan-Soll 0 Abweichungen; Hof und Nachbarn nach Kundenfotos vom 20.11. (Mac-Sitzung, Runde 9 in
  `umgebung_abgleich.md` 12); Leitern Top 3/4 entfernt (Kundenwunsch 20.11.); Ausstattung Pergola, Rankgitter,
  Tröge, Möbel, Leuchten als eigene Ebene (`quelle: Ausstattung, Kundenwunsch`).
- Apartments: APT. 06 (unter Pavillon Top 3, Raumhöhe 3,14), Variante 1 (Derenko 07.10.) und 2 (Derenko 28.10.),
  Runde 6 veredelt, 4 Bilder mit Vorbehalt (siehe `staging.json` runde_6).
- Terrassen Top 3/4: Runde 7 (frei veredelt, 8 Motive) und **Runde 9** (`r9_terrassen`, 4k mit Ebenen, Higgsfield
  gpt_image_2_6, Schutz Toleranz, 34 Credits).

### Rückmeldungen und Entscheidungen
- 15.11. Annahmen bestätigt (Stil nach BAB und Vorlagen, Garten gegenüber, Top 26-2 zuerst). Apartments genau im
  Design von Derenko; Top 3/4 an den Projektvisualisierungen (Vorlagen) orientieren, auch für den Mood; großzügige
  Blickwinkel; Häuser rundherum perfekt. Vorlagen dürfen als Stilreferenz zu Higgsfield (nicht ins Repo).
- 15.11. Zusätzlich Apartment-Variante nach Derenko-Entwurf 28.10. (nicht statt).
- 16.11. Bei Küche "Größen stimmen nicht", Stuck an der Deckenkante gibt es nicht, rote Farbe und Ecke Bett/Gang
  falsch (umgesetzt in Runde 4/6).
- 16.11. Hof: "Häuser links und rechts aus der Original-Visualisierung übernehmen" (Kameramatch Runde 5). Seit den
  Fotos vom 20.11. gilt: **Fotos vor Apple vor Visualisierung.**
- 16.11. Abstimmungsseite (14 Antworten):
  - Küchenzeile 2,42 m (Derenko). Kochfeld: beide Derenko-Varianten darstellen, **keine Schubladen unter dem
    Kochfeld**. Bordeaux: Palette #5C1727. Einbauhöhen **absolut** (Hochschrank 2,62). Fenster **1,60** breit.
  - Ein Apartment wählen, das sicher unter einem Pavillon liegt (niedrigere Rohdecke) ergab APT. 06.
  - Gang Terrazzo; Böden je Raum unterscheiden (Zimmer Eiche Fischgrät, Gang Terrazzo, Bad Fliese).
  - Kein Geländer zwischen Podest und Terrassen Top 2/5.
  - Freigaben: Apartment V1 und V2 ok; EG/1.OG ok mit Wunsch Pflanztröge teilweise und Holzpergola an der Wand
    gegenüber der HST (als Ausstattung, so schön wie möglich); Top 3/4 Blickwinkel ok, "gerne weitere".
  - Nachbarn: "Modell stimmt gar nicht, Balkone und Dach falsch" (betraf die Neubau-Obergeschoße, behoben Runde 6).
    Nachbar Nr. 15 (Gemeindebau) "sieht in echt anders aus" (neu gebaut).
- 20.11. 75 Fotos und 3 Videos vom Hof (Drive), "Hof und Häuser 1:1 nachbilden" (Mac-Sitzung umgesetzt).
- 20.11. Nur Terrassen Top 3/4 rendern; Veredelung "ohne lokale KI", also Higgsfield (Runde 9).
- **21.11. Kritik an Runde 9:** zusätzliche Wand vor der Wand der Wohnung bei Top 4; Innenleben/Wohnzimmer viel zu
  groß; Artefakte; Häuser im Hintergrund teils falsch. Vorgeschlagener Plan (vom Nutzer noch nicht freigegeben):
  1. Modell: Innenhülle `vp_top4_aussen` liegt mit Innenwandmaterial vor der Pavillonfassade (Ursache der Wand),
     beheben; jede Kamera vor dem Render auf Bauteile ohne Planbeleg prüfen.
  2. Innenraum hinter der HST mit echten 3D-Möbeln nach Verkaufsplan (kostenlose Modelle wie bei den Autos),
     Pflanzen als echte 3D-Pflanzen statt Kugelformen, damit die KI nichts erfinden muss.
  3. Schutz ausweiten: Nachbarn, Innenraum und Glas geschützt (in Runde 9 war Glas freigegeben, daher der zu große
     Raum; Nachbarn waren bei Noma nicht geschützt).
  4. Kein Bild mit bekanntem Modellfehler in die Veredelung; jedes Endbild vor Versand selbst prüfen.

### Offene Fragen
- Fensterlage APT. 06: Einreichplan zeichnet das Fenster unter der Badseite, Derenko gegenüber bei Esstisch/TV.
  Modell folgt Derenko, Fassade dem Einreichplan. Mit Architekt und Derenko klären (wichtigste offene Frage).
- Kochfeld Variante 2: Derenko S. 3 zeichnet es dort, wo laut S. 13 der Hochschrank steht.
- Lichte Breite APT. 06 laut Maßkette 5,06, Modell 5,03 (Derenko Top 1).
- Penthouse 26-2: Schnitt mit Dachaufbau (Kniestock, Treppeneinhausung angenommen).
- Gemeindebau Nr. 15: oberes Drittel dunkler oder hell-bläulich?
- Pergola von Top 3 hängt an der Wand von Top 4: Eigentum klären.
- Tröge ohne Bepflanzung gelten als Planelement (geschützt), bepflanzte als Vegetation: vom Nutzer unbestätigt.
- FLUX.2-klein-Tiefen-LoRA (Community, Trainingsdaten offen) ist gesperrt, Freigabe des Nutzers fehlt.

### Bekannte Fehler
- Top 4: Innenhülle vor der Fassade (weiße Wand), siehe oben. Runde 9 hat die Farbe nur im Prompt korrigiert.
- Runde 9: Mischbild Esstisch im HST-Flügel Top 4, Spiegelstreifen im Glas Top 3, Wand an den Rankgitterrändern.
- Apartments Runde 6: Mikrowelle (V1 gesamt), Küchenreihenfolge und Garderobe (V2 gesamt), Garderobe mit Türen (V2
  bett), Fenster schimmert im Bad durch und Lichtleiste nicht im Plan (beide Bäder).
- Penthouse- und Dachterrassenbilder sind Stand Runde 1 (alte Gaube).

### Nächste Schritte (Reihenfolge)
1. Freigabe des Nutzers für den Plan vom 21.11. einholen.
2. Top-4-Innenhülle reparieren; Möbel und Pflanzen als 3D-Objekte; Schutzklassen anpassen.
3. Mac-Auftrag: 8 Terrassenkameras neu (wie `2026-11-20_noma_terrassen.md`).
4. Veredelung (Verfahren nach `ki_lokal_test`), Selbstprüfung, Lieferung.
5. Danach Apartments (APT. 06 V1/V2) im neuen Ablauf.

## 4. Aufträge in `auftraege/`

| Auftrag | Status | Gilt noch? |
|---|---|---|
| 2026-11-18_assets_test, 2026-11-18_ebenen_test, 2026-11-19_runde7_basis, 2026-11-20_noma_terrassen | erledigt | nein |
| 2026-11-19_ki_lokal_test (SDXL, FLUX.2 klein, FLUX.1 dev intern) | offen | **ja, nächster Mac-Auftrag** |
| 2026-11-19_runde8_begehung (4k Straßenkameras Wimmergasse nach Begehung) | offen | ja, nach dem KI-Test |
| 2026-11-19_runde7_korrektur | offen | **überholt** (Inhalt in Begehung und runde8 aufgegangen; nicht mehr starten) |

## 5. Verworfene Ansätze (mit Grund)

- Freie Higgsfield-Veredelung ohne Schutz: verschiebt Fenster, erfindet Dachgeschosse, Küchen hinter Glas, Gauben.
- Voller Schutz (Gebäude komplett aus Blender): plantreu, aber flach; nur so gut wie die Blender-Materialien.
- Schutz mit Toleranz an Higgsfield-Bildern: nur 8 bis 20 % der Schutzfläche bleiben KI, 85 bis 95 % der Fenster
  werden zurückgesetzt. Hilft wenig, solange die KI die Fassade stark verändert.
- nano_banana_pro gegen gpt_image_2_6 (Runde 6/7): gpt_image_2_6 4k gewinnt (Licht, Leben); nano_banana_pro
  schrumpft Bäume, flacher. `upscale_image`: weicher, nicht verwendet. Zweistufige Veredelung: kein Gewinn.
- Google 3D Tiles/Street View als Geometrie oder Textur: lizenzrechtlich ausgeschlossen, nur Abgleich.
- Unreal Engine jetzt: nein. Blender bleibt Kern (Automatisierung, Mac). Unreal/Twinmotion später als Ausgabeweg für
  Videos und Walkthroughs; braucht Windows mit RTX; laut Berichten unter 1 Mio. USD Jahresumsatz kostenlos (vor
  Nutzung bei Epic prüfen).
- FLUX.1 dev (Depth/Canny) kommerziell: Lizenz nicht kommerziell, nur interner Vergleich. SD 3.5: Umsatzgrenze.
- KI-Video (Kling) für Fahrten am Gebäude: Fassaden verändern sich von Bild zu Bild; nur für kurze Stimmungsclips.
- Vercel-Vorschau im Repo `unio-gmbh/unio`: blockiert, bis ein Org-Admin die Claude GitHub App installiert.

## 6. Ideen für später (vom Nutzer gewünscht oder angefragt)
- Videos auf High-End-Niveau: echte Drohnen-/Gimbal-Aufnahmen mit eingesetztem Neubau (Kamera-Tracking in Blender),
  berechnete Innenfahrten ggf. in Unreal.
- Pro Projekt Datenstufe A/B/C (Fotos, Drohne, nur Pläne) mit Fallbacks; Fotoprotokoll mit 360-Grad-HDRI je
  Kamerastandpunkt.

## 7. Zugänge und Werkzeuge (nur Ort und Art, keine Werte)

- **Higgsfield:** MCP-Connector im Claude-Konto des Nutzers, Abo "ultra". Stand 22.11.: rund 7.119 Credits.
  Kosten zuletzt: gpt_image_2_6 4k rund 4,25 je Bild, nano_banana_pro 2k rund 2. Ablauf media_upload, curl PUT,
  media_confirm, generate_image, jobs_wait. Nur mit Auftrag des Nutzers.
- **Google Maps Platform** (Street View Static, Metadata, Map Tiles/3D Tiles, Static Maps): Schlüssel vom Nutzer,
  nur als Umgebungsvariable `GOOGLE_MAPS_API_KEY` im Befehl, nie in Dateien, Logs oder Commits. Beim Nutzer erfragen;
  Empfehlung an den Nutzer: Schlüssel rotieren und auf die benötigten APIs beschränken (er stand im Chat).
- **Hugging Face:** für FLUX.1 dev auf dem Mac Lizenz auf der Modellseite bestätigen, Lese-Token, `hf auth login`
  (Stand unbekannt; ohne Zugang überspringt der Auftrag den Teil).
- **BlenderKit/Poly Haven:** Autos (`immoviz.py autos-laden`) und Texturen (`immoviz.py texturen`) werden per Skript
  geladen, Lizenzen in `assets/LIZENZEN.md`, Dateien nie ins Repo.
- **Stadt Wien OGD** (WFS, LOD2, Orthofoto): frei, ohne Schlüssel.
- **Google Drive** (Connector): Projektunterlagen, Grenze 10 MB je Datei beim Abruf.
- **Artifacts im ersten Konto** (für cloud-neu nicht erreichbar): immoviz-Studio-Übersicht, Projektseite "Das
  Wimmer", **Noma Abstimmung** (Datenbank mit den Antworten vom 16.11., Inhalt in Abschnitt 3 übernommen).
- **Agency Hub** (Connector "Agency Hub" bzw. boutique.OS): Kunden Trattner & Söhne (Noma), UNIO (Wimmergasse).

## 8. Dateien nur in der Umgebung von cloud-alt (nicht im Repo, nicht einchecken)

Pfade relativ zum Repo bzw. zum Scratchpad dieser Cloud-Sitzung. "Quelle" sagt, woher cloud-neu sie bekommt.

### Projektunterlagen (vom Nutzer hochladen oder aus Drive holen)
| Pfad | Größe | Inhalt | Quelle |
|---|---|---|---|
| `projects/noma-shg13/quellen/` (16 PDFs) | 22,7 MB | Planungsmappe Einreichung 04.03.2026, BAB (Apartments, hofseitig DG Lofts, straßenseitig), Bemusterung, Derenko Apartments 07.10.2026, Verkaufspläne Top 01, 03, 04, 4A, 23, 26 | Drive-Ordner Noma (vom Nutzer, Archiv.zip) |
| Scratchpad `noma/src/05 BAB`, `06 Grundrisse`, `08 Visualisierungen` | 18 + 22 + 97 MB | dieselben Unterlagen entpackt, dazu **Projektvisualisierungen (Vorlagen)**: Exterior, Hof_fin 1 bis 4, Wohnungstypen, Penthouse | Drive Noma, Archiv.zip |
| Scratchpad `noma/interior2/interior2.pdf` | 31 MB | Derenko Noma Apartments Entwurf 28.10.2026 | Drive-Link vom Nutzer (15.11.) |
| Scratchpad `noma/mappe/` | 22 MB | Seitenbilder Derenko 07.10. | aus der PDF erzeugbar |
| Mac: `projects/noma-shg13/renders/streetview/fotos_hof_2026-11-20/` | (auf dem Mac) | 75 Fotos, 3 Videos vom Hof | Drive des Nutzers, Mac-Sitzung |
| `projects/wimmergasse-20/quellen/06_Wimmerg_Strassenansicht.pdf` | 1,0 MB | Straßenansicht Buschina | Shared Drive "Wimmergasse 20, 1050 - VPH" |
| Wimmergasse weitere Unterlagen (Mappen 10.04., 24.04., 30.04., Nutzwertgutachten, Farbkonzept, Produktkatalog, Verkaufsplan Top 07) | nur über Drive abgerufen | siehe `projects/wimmergasse-20/quellen/README.md` | Shared Drive VPH |
| `projects/wimmergasse-20/mood/interior/` | 2,8 MB, 19 Bilder | Interior-Referenzen | Drive-Ordner "interior" (Nutzer, 14.11.) |
| Scratchpad `wimmer/referenz/` | 3,1 MB, 25 Bilder | Außenreferenzen (Auswahl aus 76) | Drive-Referenzordner, ID in `mood_analyse.md` |

### Interne Referenzen Dritter (nur Abgleich, nie Vermarktung)
| Pfad | Größe | Inhalt | Quelle |
|---|---|---|---|
| `projects/wimmergasse-20/renders/streetview/` | 472 MB, 1.286 Dateien | Street-View-Vergleiche, Begehung (376 Fotos), Poller, Leuchten, Google-3D-Referenz (`referenz_google/`), Apple-Screenshots (`referenz_apple/`), Kundenbild Look Around (`referenz_kunde/`), Zwischenlösung | Google-API (neu abrufbar mit Schlüssel), Apple-Screenshots vom Nutzer |
| `projects/noma-shg13/renders/streetview/` | 9,4 MB, 97 Dateien | Apple-Screenshots des Kunden (`referenz_apple_kunde/`), Leuchten-Street-View, Würtzlerstraße-Hof | Nutzer-Uploads im Chat, Google-API |
| Scratchpad `apple/`, `gtest/`, `ig/` | 25 + 12 + 18 MB | Apple-Screenshots, Google-Tests, Instagram-Reels (Analyse) | Nutzer bzw. neu abrufbar |

### Renders und Zwischenstände (regenerierbar)
| Pfad | Größe | Inhalt |
|---|---|---|
| `projects/*/renders/**/*.png` | rund 800 MB | PNG-Originale der Higgsfield-Bilder und Blender-Vorschauen (JPG-Fassungen sind im Repo) |
| `projects/wimmergasse-20/renders/walkthrough/top35/clay/` | 64 MB, 241 Bilder | Einzelbilder der Clay-Fahrt |
| `projects/wimmergasse-20/renders/*.blend`, `*.blend1` | 42 MB | Szenendateien |
| `projects/noma-shg13/renders/kameramatch/` | 25 MB | Überlagerungen mit Vorlagen (enthalten Vorlagen) |
| `projects/wimmergasse-20/website/` | 19 MB | gebaute Projektseite |
| `projects/*/data/ortho_cache/`, `plan_cache/` | 20 MB | Caches (neu erzeugbar) |
| `assets/texturen/` | 30 MB | Poly-Haven-Texturen (`immoviz.py texturen`) |
| `studio/.cache/` | 6 MB | Studio-Cache |
| Repo-Wurzel `*.zip` (8 Dateien) | 887 MB | an den Nutzer gelieferte ZIPs (Runden 5, 6, 7, 9, Noma aktuell, alle Bilder, Projektseite, Paket 14.11.) |
| Scratchpad `noma/r4` bis `r7`, `pipeline/`, `begehung/`, `export_alle/`, `int/` | rund 1,2 GB | Kontaktbögen, Prüfbilder, Zwischenrender (enthalten teils Vorlagen, Google-Bilder) |

**Für cloud-neu hochzuladen** (alles andere ist im Repo, neu abrufbar oder entbehrlich): Noma-Quellen-PDFs und
Vorlagen (Archiv.zip aus Drive), Derenko 28.10. (PDF), Wimmergasse-Straßenansicht und weitere Plan-PDFs aus dem VPH-
Drive, Referenzordner Wimmergasse, Interior-Mood Wimmergasse, Apple-Screenshots des Nutzers (Noma und Wimmergasse),
bei Bedarf die Hof-Fotos vom 20.11. Google-Bilder neu mit Schlüssel abrufen.
