# Nachtschicht 24./25.11.2026 (cloud-neu)

Auftrag des Nutzers (24.11. spät): "Bis morgen früh die vorhandenen Projekte so gut wie möglich in der Qualität verbessern:
Umgebung, Fernsicht, Materialien, Einrichtung analysieren, mit den Referenzen vergleichen, gerne recherchieren. Laufender
Prozess für die nächsten 8 h, laufend schauen, ob der Mac Neues geliefert hat."

Zeiten: Wien (MEZ). Takt: stündlicher Check (geplanter Task), dazwischen Überwachung des Mac-Branches alle 10 min.
Credits: nur die angekündigten 16 x 3,25 für die r11g-Veredelung; alles andere wird vorbereitet (Prompts, Mac-Aufträge),
nicht ohne Freigabe veredelt.

## Punkte (der Reihe nach, erledigte abhaken mit Uhrzeit und Ergebnis)

### Noma
- [x] N1 Fernsicht-Landmarken je Dachkamera berechnet (22:05): Stephansdom x 0,49, Karlskirche x 0,26 (stadt, 23),
  Riesenrad x 0,93 (vermutlich verdeckt), Gasometer x 0,67 und Kraftwerk Simmering x 0,48 (hof), Arsenalturm x 0,89
  (23_hof). Riesenrad fehlt im Modell, die anderen sind Prismen. Als Schritt 3b in `noma_r11g` an den Mac.
- [x] N2 Stimmungs-Prompts (22:15): Dach 5 und Innen 11 als Entwurf (lokal, cloud): goldene Stunde kurz vor Sonnenuntergang,
  warmes Innenlicht durch die Verglasung, Feuer, Windlichter, gedeckter Tisch, üppig bepflanzte vorhandene Tröge (keine
  neuen Tröge oder Möbel), TrIIIple burgunder hinter Glasbalkonen, Landmarken mit Stein, Ziegel, Beton; Blaue Stunde mit
  angestrahltem Dom. Bezug `mood_vorlagen.md` (Spätsommer, warm, Dunst, Terrakotta- und Salbei-Akzente).
- [x] N3 Innenräume (22:25): Gartentisch `esstisch_aussen` mit Lattenplatte in Top 24, 25, 23-2; keine Teppiche, Vorhänge,
  Kunst; überall dieselbe Pendelleuchte; Penthaus-Terrassenblicke fast leer. Als Schritt 4b in `noma_r11g` (massiver
  Eichentisch, Teppiche, Leinen-Stores, großformatige Kunst, Deko aus Poly Haven CC0, Lounge im Penthaus-Terrassenblick,
  Leuchten je Wohnung verschieden; `top26_2` neu rendern, Veredelung erst nach Freigabe).
- [~] N4 Nahbereich von oben (22:45): Orthofoto-Server der Stadt Wien ist aus der Cloud gesperrt (Proxy 403), Prüfung nur
  am Mac. Offen für den Mac: Farbe Brandwand 005362, heller glatter Baukörper links in `dachterrasse_23_hof` (Street View
  oder Orthofoto, Gauben, Dachterrassen, Kamine). Der Mac meldete Hof und Nachbarn deckungsgleich mit dem Orthofoto (r11d).
- [x] N5 r11g Dach veredelt und geliefert (23:20): 5 Bilder mit Stimmungs-Prompts; die drei Stadtblicke zweimal, weil die KI
  im ersten Durchgang Türme, Gasometer und Fernsehturm in den Horizont erfand (Auslöser: Landmarken-Liste im Prompt; neu:
  Horizontsperre je Blickrichtung). 8 x 3,25 = 26. Lehre: im Prompt nie Landmarken aufzählen, die nicht in dieser Kamera
  liegen. Innen folgt nach dem Mac.

### Wimmergasse 20
- [x] W1 Stand (22:30): Runde 10b geliefert (6 Außenbilder, 19,5 Credits), Innenräume warten auf Pläne.
- [x] W2 Fernsicht (22:35, `landmarken`): drohne mit Rathaus, Votivkirche, Spittelau, Millennium Tower, Stephansdom, Uniqa,
  Donauturm im Bildwinkel, alle Prismen außer Dom; im r10b-Drohnenbild malt die KI bei x 0,75 einen Fernsehturm, wo der
  Millennium Tower steht, und nur einen Turm statt Rathaus und Votivkirche. Auftrag `wimmergasse_r11_fernsicht` (nach Noma).
- [x] W3 Außenbilder r10b gegen `mood.md` (22:50): Licht, Farben, Passanten, Vertikalen passen zur Hauptreferenz (Pazelhof,
  diesig bis golden, warmweißer Putz). Schwach: Erdgeschoss-Lokale wirken leer und dunkel (Referenz: Leben im EG,
  beleuchtete Schaufenster); im Drohnenbild die Fernsicht (W2). Vorschlag an den Mac (nach Freigabe): Lokale mit
  Interior Mapping warm beleuchtet (Galerie oder Showroom, ohne Schrift), dann `eg_lokal` und `ecke` neu veredeln.
- [x] W4 Innenräume (23:35): `mood_interior.md` ist schon High-End (Nuss, Quarzit, Vorhänge, ein großes Bild, Hero-Leuchte);
  ergänzt um die Lehren aus Noma (kein Außenmöbel innen, Teppich, Vorhänge, Bild als Geometrie, Leuchten je Wohnung,
  Fensterblick nach U12). Rendern erst mit Plänen.

- [x] N6 Hofbilder Runde 10 (23:30): TrIIIple liegt laut `landmarken` im Bildwinkel der Hofkameras (x 0,41 bis 0,68,
  rund 160 m), in den sechs gelieferten r10-Bildern aber vom Nahbereich verdeckt oder über dem Bildrand; keine Änderung nötig.

### Runde 2 der Nacht
- [x] A2 `landmarken --innen` (00:35): Fensterblicke der Innenkameras aus `wohnungen.yaml` (Wohnungen ab 10 m). Noma: TrIIIple
  im Blick von top24/wohnzimmer_tv, top25/wohnzimmer und allen drei Top-23-2-Kameras; Stephansdom und Karlskirche von der
  Top-24-Terrasse; DC Tower, Donauturm und Millennium Tower von der Top-25-Terrasse.
- [x] N7 Innen-Prompts (00:40): Horizontsperre je Kamera; das TrIIIple steht nur in den Prompts der Kameras, in deren Blick
  es liegt (Lehre aus dem Dach: sonst erfindet die KI es).
- [x] N8 Innenbilder r11g veredelt (02:05): 11 Bilder mit Styling-Satz (Bild, Stores, Teppich, Bücher, Vasen, Eichentisch
  ohne Fugen) und Horizontsperre je Kamera; 11 x 3,25 = 35,75. Top 26-2 gerendert, Veredelung nach Freigabe.
- [x] W5/A3 Horizontsperre als zentrale Regel `horizont_sperre` in `higgsfield/prompt_regeln.yaml` (00:50): wird an jeden
  Veredelungs-Prompt angehängt (Studio, `immoviz.py prompt`), gilt damit auch für die Wimmergasse-Drohne.

- [x] W6 Mac-Probe Wimmergasse Fernsicht (01:50, mac-neu): Votivkirche Doppelturm, Spittelau-Schornstein mit goldener Kugel,
  Millennium Tower als Glaszylinder, Donauturm, Kahlenberg-Mast echt gebaut; 4k und Veredelung (drohne, drohne_sued) nach
  Freigabe. Offen: Wienerwald-Kulisse zeigt harte Facetten (lib/fern.py, alle Projekte), Kamera `dachgeschoss` steht in
  Nachbarhaus und Baumkrone (braucht neues Motiv).

### Werkzeug
- [x] A1 Befehl `immoviz.py landmarken <projekt>` (22:33): `lib/landmarken.py`, Liste `lib/landmarken_wien.yaml`
  (18 Landmarken mit Quelle); nur erhöhte Außenkameras ab 10 m, Verdeckung nicht geprüft.
