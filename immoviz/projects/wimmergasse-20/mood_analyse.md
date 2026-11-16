# Mood-Analyse: Das Wimmer (Wimmergasse 20, 1050 Wien)

Grundlage: Referenzordner in Google Drive (ID `1wOPgEK7o7V55qFRLjhspc_xi70PVLrod`), 76 Bilder direkt im Ordner (Unterordner "Renderbox..." ignoriert). Alle Bilder wurden einzeln angesehen. Die Bilder sind fremdes Referenzmaterial: Sie dienen nur als Stil-Vorlage und werden weder weitergegeben noch veröffentlicht oder ins Repo gelegt.

Hinweis Upload (Stand 16.11.2026): Der Kunde (Daniel, Chat 16.11.2026, weitergegeben über den Koordinator) erlaubt jetzt, die Referenzbilder als Stil- und Mood-Referenz zu Higgsfield hochzuladen (höchstens 2 je Auftrag, Blender-Vorschau bleibt Bild 1 und bestimmt die Geometrie, Prompt-Satz "style reference only, do not copy buildings, layout or objects from reference images", Drive-ID je Bild in staging.json). In Runde 6 wurde der Upload trotzdem nicht ausgeführt: Die Berechtigungsprüfung der Arbeitssitzung hat das Hochladen fremder Bilder blockiert, weil die Freigabe nicht direkt vom Nutzer in der Sitzung kam. Bis zur direkten Bestätigung werden die Referenzen weiter nur angesehen und im Prompt beschrieben.

Objekt: renoviertes Gründerzeit-Eckhaus, sandbeiger Putz, weiße Kastenfenster, Stuck, Dachausbau in anthrazitem Zink.

Hinweis zu Dateinamen: Viele Dateien heißen " -NN.jpg" (mit führendem Leerzeichen). Drei Originalnamen enthalten Gedankenstriche ("Gallery ... TMRW.jpg", "Vis-on Studio ...", "Frank Lloyd Wright Woning ..."); sie sind hier mit einfachem Bindestrich geschrieben. Eindeutig ist immer die Drive-ID.

---

## 1. Bildinventar

| # | Dateiname | Drive-ID | Bildtyp | Licht | Jahreszeit | Kamera | Menschen | Feeling |
|---:|---|---|---|---|---|---|---|---|
| 1 | Gallery - TMRW.jpg | `1ITh4TX30NyK8Q8CfpWrN6Zr539u2fwD-` | Totale Straße (Platz) | Golden Hour Gegenlicht, Sonnenstern | Sommer | Augenhöhe leicht erhöht, Weitwinkel, übereck | ja viele | belebter Platz, warmes Gegenlicht durch Baumkronen, Sitzstufen Holz |
| 2 | Instagram-6.jpg | `1Ls2EVhj0hfx1nSyQwWoiQOmVQWdLA9kH` | Fassadenausschnitt (frontal) | diesig hell, weiches Morgenlicht | Spätsommer | Augenhöhe frontal, Tele, Spiegelung Kanal | ja wenige, Bewegungsunschärfe | Pariser Ruhe, helle Steinfassade, symmetrisch |
| 3 | All Posts • Instagram.jpg | `1E0kSisDmYGE35-8ETffXtZkolzJfV1Ft` | Totale Straße (Quartiersplatz) | bedeckt, weiches Streulicht | Frühling | Augenhöhe, Normal, übereck | ja viele, Gastro | belebtes Quartier, Ziegel und Altbau, gemütlich |
| 4 | -42.jpg | `1xgETY5CItbKE3klAgQiTTnycPDxLH_8-` | Totale Straße (Gassenflucht) | bedeckt | unbestimmt (keine Bäume), kühl | Augenhöhe, Weitwinkel, Fluchtperspektive | ja winzig | stille Wiener Innenstadt, weiße Fassaden, Kopfsteinpflaster |
| 5 | -41.jpg | `1kpqnJMgeq58Q6pmA3yBgG6JFhgOcHsXN` | Totale Straße (Eckhaus) | diesig hell, überstrahlt, Pastell | Sommer | Augenhöhe, übereck, Normal | ja wenige | luftiges Wiener Eckhaus mit Mansarde, hell ausgebleicht, edel |
| 6 | Instagram-5.jpg | `1KK-U5otaoxufWXb-0s2tO4eX0tFgCwsw` | Sonstiges (Villa mit Oldtimer) | bedeckt, weißer Himmel | Frühling | Augenhöhe, Normal, übereck | nein | ruhiger Luxus, Erdtöne, Editorial |
| 7 | Kop Zuidas, Amsterdam.jpg | `1oEKrfx27pGUTy9qspOGbPZluOmeM7FxJ` | Totale Straße (Hof-Schlucht) | Golden Hour, warmes Streiflicht auf Ziegel | Herbst (Birken gelb) | erhöht, Weitwinkel, zentrale Flucht | ja viele auf Laubengängen | warmes Ziegel-Quartier, Tiefe, nachbarschaftlich |
| 8 | -40.jpg | `1EKou2Yp9K_UOg9dHu0O05n2EvgLAQksj` | Totale Straße (Platz unter Pergola) | diesig Gegenlicht, goldener Dunst | Herbst (goldenes Laub, Blätter am Boden) | Augenhöhe, Rahmung durch Pergola | ja viele, Mäntel | herbstlicher Alltag, gemütlich, warm-golden |
| 9 | Guinness Quarter, FaulknerBrowns Architects.jpg | `1LViJtX5kTk75J1LwJpCsqEiqLx1KrW3W` | Totale Straße (Platz) | sonnig mit Wolken, weiches Seitenlicht | Frühling/Sommer | Augenhöhe, Weitwinkel, übereck | ja viele, Kinder am Wasserspiel | lebendiges Industrie-Quartier, Ziegel plus Glas, Vögel |
| 10 | My portfolio \| Andrii Savchenko.jpg | `1gxipWLUNu1mRDWW-bLjGXWiF4iwCoLuf` | Totale Straße (Wohnbau im Wald) | Golden Hour, weiches Abendlicht | Sommer | Augenhöhe, Tele | ja winzig | naturnahes Wohnen, Föhren, Holz, ruhig |
| 11 | Instagram-4.jpg | `1QJFE4u65_CW0h4TttG7rid621HeTaWfc` | Sonstiges (Berghotel) | bedeckt, Schneelicht, warme Innenbeleuchtung | Winter | erhöht, Normal | ja Skifahrer | alpines Winterhotel, warm leuchtende Fenster gegen kalten Schnee |
| 12 | Vertriebsstart.jpg | `1TwH2uq95nv2qooZWo-MkGDR5958cUe1P` | Totale Straße (Stadtvilla) | sonnig weich, leichte Wolken, Baumschatten | Spätsommer/Frühherbst (rotes Laub vereinzelt) | Augenhöhe, Normal, leicht übereck | nein (Fahrrad als Leben) | seriöse Stadtvilla, beige Putz, Bauträger-Standard |
| 13 | Жилой комплекс с бежевыми штукатурными фасадами и панорамными окнами.jpg | `1XDg3qnaVXqZoFxDCr_Z5u7VGCzbIirDt` | Totale Straße (Innenhof) | Golden Hour, tiefes Streiflicht, lange Schatten | Herbst (Ahorn rot/orange, Laub am Boden) | Augenhöhe, Normal, zentrale Flucht, Hochformat | nein | beige Putz plus Mansarde plus Herbstlaub: warm, ruhig, Pariser Hof, sehr nah an Wimmer-Palette |
| 14 | Architekturvisualisierungen BRUNECKY - 3D Visualisierung, Rendering, Visualization Zürich Schweiz.jpg | `1cB23ktITNqR6QLvG4pdpqfe1mquLXowM` | Totale Straße (Hochhaus an Kreuzung) | diesig hell, milchiger Himmel | Frühling (Kirschblüte) | Augenhöhe, Weitwinkel, übereck | ja wenige | frisch, pastellig, hell ausgewaschen |
| 15 | Rona torg.jpg | `1Yb8wUVJXhCZlk0LRrErvJ7RgAqbkMQJh` | Eingang/Erdgeschoss (Bäckerei am Platz) | sonnig weich, diesig | Spätsommer | Augenhöhe, Normal, Hochformat, Radfahrer angeschnitten im Vordergrund | ja viele, Familien | Nachbarschaft, Bäckerei als Herz, alltäglich und warm |
| 16 | -37.jpg | `1TzobevfaYaY0cP2WzyzN2SeOXOmQLkR0` | Sonstiges (Hotel am See, Berge) | Dämmerung, Nebel, warme Innenbeleuchtung | Herbst/kühl | erhöht, Normal | nein | dramatisch-mystisch, Nebel, warme Fenster |
| 17 | Instagram-3.jpg | `197MEs6R0rG4iKRs7lQxltFsJciI4QfjX` | Sonstiges (Berghotel) | bedeckt hell, Schneelicht | Winter | Drohne/erhöht | ja Skifahrer | klar, kühl, weiß, alpine Ruhe |
| 18 | Studieren­den­wohn­anlage - &MICA.jpg | `1w_EmZfY7QEByIVjgnVsr_QgUcTqIqmEF` | Totale Straße (Wohnbau im Park) | Gegenlicht, Sonnenstrahlen durch Laub | Sommer | Augenhöhe, Weitwinkel, Rahmung durch Bäume | ja (Spaziergänger, Hund) | grün eingebettet, Waldweg, atmosphärisch |
| 19 | Timber Clad Hotel Block Composition.jpg | `1RZyJv2GE5Ywmwwy5bs5HeZAjaJcasjYo` | Totale Straße (Straßenflucht) | Regen, Nebel, warme Schaufenster | Herbst (gelb-orange Laub) | Augenhöhe, Normal, übereck in die Flucht | ja (Schirme, Mäntel) | melancholisch-urban, nasser Asphalt mit Spiegelungen, warme Erdgeschosse |
| 20 | -36.jpg | `1H_hvznreNqXQ9fWRnbfF04sr-Zdji10Q` | Fassadenausschnitt (Terrassen) | Blaue Stunde früh, warme Innenbeleuchtung | Sommer (Dünengras) | Augenhöhe, Tele, übereck | nein | ruhiger Luxus, Travertin, Kühl-Warm-Kontrast |
| 21 | -39.jpg | `14UQKqIW5xi8USDVQvu6c0XPriMz7zuft` | Eingang/Erdgeschoss (Villa Zugang) | sonnig, gefiltertes Licht durch Laub | Sommer | Augenhöhe, Normal, frontal | nein | stille Editorial-Architektur, Licht-Schatten-Spiel |
| 22 | -34.jpg | `1G9Rw6SOAyZLqzVGcaBN5MoZKJ_F4H0B_` | Terrasse/Dach (Hof-Lounge) | sonnig, Golden Hour warm | Spätsommer | Augenhöhe, Normal, Hochformat | nein | wohnlicher Außenraum, Lounge, Lavendel, Holz |
| 23 | -35.jpg | `1Sq5Akxwh15eMExUqE5wKimfK0OUfHiVI` | Terrasse/Dach (Patio) | harte Sonne, klare Schatten | Sommer | Augenhöhe, Weitwinkel | nein | mediterran-minimalistisch, Sandtöne, Schattenkante |
| 24 | exterior visualization sunny residential building herzfeld.jpg | `1Ri_ZLm2JhjGerdnZ8Hj5IIT2oY2uvyPm` | Fassadenausschnitt (Gartenseite Balkone) | sonnig, leichte Wolken, weich | Sommer (Hortensien) | Augenhöhe, Normal, frontal | ja (Frau auf Dachterrasse) | freundlich, familiär, Garten in Blüte, Wimpelkette |
| 25 | -38.jpg | `1vFFNUOKp9ZE2GwWsHcs60tWhDI0R5PUb` | Totale Straße (Straßenflucht) | Sonnenuntergang Gegenlicht, Dämmerung, Innenlicht an | Sommer | Augenhöhe, Weitwinkel, übereck, Hochformat | ja wenige, Autos | urbane Abendstimmung, warmer Horizont, leuchtende Fenster |
| 26 | Luxury Residential Campaign Concept.jpg | `1K5rPGnU0DzOXDbvXyUi3hPRNXhQlfuTF` | Totale Luft (erhöht über Quartier) | sonnig weich, Wolken | Sommer | erhöht/Drohne niedrig, Hochformat | ja viele, Familien | Quartier als Lebensraum, üppiges Grün, Café, Bilderbuch |
| 27 | Saint-Vincent de Paul \| FBAA.jpg | `1S7t6WA-m59sBA5J-cm1Uc1GcwWYnzaBv` | Totale Straße (Platz) | diesig hell, Spätnachmittag | Herbst (Laub am Boden) | Augenhöhe, Weitwinkel, zentral | ja viele | helles Quartier mit Altbau-Bestand, entspannt |
| 28 | example-3.com | `1TAArj7TAXO-xRRC3SANx6PQ7ALzbAsmL` | Fassadenausschnitt (frontal Landhaus) | weiches Abendlicht, diesig | Spätsommer | Augenhöhe, frontal, Normal | nein | natürliche Materialien, Wohnlichkeit, warme Innenlichter |
| 29 | Instagram-2.jpg | `1nUiGlB_K0ZQpW9AJU9Lm9YQ9aNuMhZHh` | Eingang/Erdgeschoss (Café mit Markisen) | Dämmerung, warmes Innenlicht | Sommer/Spätsommer | Augenhöhe, Tele, Bewegungsunschärfe Autos im Vordergrund | ja (Kellner, Gäste, Büro oben) | urbanes Leben, Patina, Kinomoment, Pflanzen |
| 30 | example-2.com | `1oBkFu_SMeJvvfGlh9meE1KPShT5l1jmi` | Sonstiges (Landhäuser in Natur) | Golden Hour Gegenlicht, Dunst, Lichtstrahlen | Spätsommer | Augenhöhe, Weitwinkel, übereck | nein | nordisch-natürlich, Gräser, Holzsteg, poetisch |
| 31 | example-4.com | `1lOCYWmgqWXNFdIUogE0CWCvWYj9cJOUJ` | Architekturdetail (Garten, Steg, Trockenmauer) | Golden Hour Gegenlicht, Dunst | Spätsommer | leicht erhöht, Normal, Ausschnitt | nein | Materialtiefe und Gräser, ruhig und poetisch |
| 32 | example.com | `11PnlLFgkIblz1BHS-pC_Z4FJhL1lxaSR` | Sonstiges (Landhaus-Siedlung) | Golden Hour, Dunst | Spätsommer | Augenhöhe, Weitwinkel, Rahmung durch Baum | nein | nordische Siedlung, warm-diesig, Naturraum |
| 33 | -33.jpg | `1ZpfADIR4CArzhSi9mpVST2RUYsntOXOH` | Totale Straße (Kreuzung, zwei Baukörper) | bedeckt-dramatisch, Licht nach Regen, nasser Boden | Herbst (gelbes Laub, Blätter am Boden) | Augenhöhe, Weitwinkel, Rahmung durch Ast | ja viele kleine | stimmungsvoll-herbstlich, Kontrast dunkler Himmel zu gelbem Laub |
| 34 | Charging Station Social Housing Style Architecture Design Ideas.jpg | `1MyeoGG0U3NQVk7r37DoYIg0o7rVSAb_K` | Terrasse/Dach (Innenhof mit Pool) | sonnig hart | Sommer | Augenhöhe, Weitwinkel, zentral | nein | resorthaft, KI-typisch, wenig ortsbezogen |
| 35 | Mist Apartments Architectural Visualisation \| Nick_.. | `16VFiwKhh-SNzGxsM6maae5wWWARU4j6r` | Fassadenausschnitt (Altbau mit Dachaufbau frontal) | Blaue Stunde früh, Dämmerung, Innenlicht | Sommer | Augenhöhe, frontal, Tele | nein (Auto) | klassische Altbaufassade plus dunkler Dachaufbau: ruhig-elegant, sehr relevant |
| 36 | -32.jpg | `1oKrn3RJv7gUFgpp9tK8sfsy62glH6p_v` | Architekturdetail (Hauptgesims, Stuck, Dachausbau Glas) | bedeckt, kühles Streulicht | unbestimmt | Froschperspektive, Tele, übereck | nein | Wiener Palais mit modernem Dachaufsatz: Kontrast alt-neu, Stuck plastisch |
| 37 | Powerhouse Company - Merckt.jpg | `13uGgjlHkkxUIXRDEeL1BbKungK4WgzRU` | Fassadenausschnitt (Fassade in Flucht, Arkaden) | sonnig, hell, leicht ausgebleicht | Sommer | Augenhöhe, Weitwinkel, starke Flucht, Menschen angeschnitten im Vordergrund | ja (Passanten angeschnitten) | fotografisch-authentisch, Reportage-Look, helle Klinker, Messing |
| 38 | Luxus Immobilien in Wien \| The Real Estate Society \| CROWND Estates.jpg | `1l3rh3H2o_HWBU0Rec7IXmPAb3Rz8FMXS` | Totale Straße (Wiener Eckhaus mit Dachausbau) | sonnig klar, blauer Himmel, flaches Licht | Sommer | leicht erhöht, frontal-übereck, Normal | ja (ein Passant, Person auf Terrasse) | Wiener Gründerzeit plus begrünter Dachausbau, sauber, Vertriebs-Look, sehr relevant |
| 39 | -31.jpg | `125EcNmi47RtNqtlrAoPITalSzd5nbkQz` | Totale Straße (Wohnhaus mit Kupfer-Dach) | bedeckt, gedämpft, leichte Abendwärme | Sommer/Spätsommer | Augenhöhe, Normal, übereck, Rahmung durch Baumkronen | ja wenige, Oldtimer | gedämpfte, filmische Palette, Patina, europäische Ruhe |
| 40 | -30.jpg | `1u5rDgf0eOG1H7e3TZibnHnKGUVRNki83` | Fassadenausschnitt (frontal) | Golden Hour, Streiflicht, Schatten der Balkone, tiefblauer Himmel | Herbst (trockene Gräser) | Augenhöhe, frontal, Tele | ja (eine Frau) | grafisch, warmes Weiß gegen Blau, ruhig |
| 41 | BSB01.jpg | `1HIDPhXFRgxpM20GO8aKki5vadpxXLapa` | Eingang/Erdgeschoss (Ecke mit Arkaden, Café) | bedeckt, weißer Himmel | Frühling | Augenhöhe, Weitwinkel, übereck, Froschnähe | ja (Passantin Bewegungsunschärfe) | helle Materialität, Fotografie-Look, Café-Ecke, Kopfsteinpflaster |
| 42 | LH.jpg | `1J5E7lx6GmmtBTyxqtn6zXKcjcjRHpAv5` | Totale Straße (Altbau-Eckhaus mit Aufstockung) | harte Sonne, tiefblauer Himmel, Baumschatten | Frühling/Sommer | Augenhöhe, Weitwinkel, übereck auf Ecke | ja (Hundebesitzer, Radfahrerin) | Ecke mit Stuck und moderner Aufstockung, etwas älterer Render-Look |
| 43 | K&+ Architecture • Logements sociaux • Strasbourg - Hervé Marmillot.jpg | `1KIRTy5N8wG1akbw_GK3NHSXYuah3aHj_` | Totale Straße (Wohnhaus im Schnee) | bedeckt, Schneelicht, warme Fenster | Winter (Schnee, kahle Bäume) | Augenhöhe, Normal, übereck | ja (Rodel, Kinder, Mutter) | Winteridylle in der Stadt, kühl-weiß mit warmen Fenstern |
| 44 | Sergison Bates architects.jpg | `156jgBu3AKXxNFwg_VhiuYGhDlKvpdKY-` | Eingang/Erdgeschoss (Geschäftszone in Straße) | Sonne nach Regen, Streiflicht, dramatischer Himmel | Herbst (gelbe Bäume) | Augenhöhe, Normal, übereck, Person angeschnitten vorne | ja viele | lebendiger Stadtalltag, Ziegel, Schaufenster, Herbstwärme |
| 45 | -27.jpg | `1moY2Tb_wa7rV_6ss6pEBLwjGnF2iJGNH` | Eingang/Erdgeschoss (Ecke Sockel) | diesig hell, weich | Frühling | Augenhöhe, Normal, übereck | ja mehrere | nüchtern, urban, Klinker und Sockel, Alltag |
| 46 | -29.jpg | `1xgLHTJ4Npm3Y8jlL8lNA-k7229l4eN8Y` | Totale Straße (Pariser Altbau mit Zinkdach) | Abendlicht, sanft, Baustelle/Bestand | unbestimmt | Augenhöhe, frontal, Normal | nein | Pariser Altbau mit Zink-Mansarde: Vorbild Materialübergang, dokumentarisch |
| 47 | Cross Keys New Cross \| Contemporary Manchester Apartments.jpg | `1SNlpfpJq2IpaTEvYzfRa6EAXmrRKYu6N` | Eingang/Erdgeschoss (Lobby-Sockel) | diesig hell, warmes Innenlicht | Spätsommer | Augenhöhe, Normal, übereck | nein | edler Sockel, Lobby durchs Glas, Messing und Grün, ruhig |
| 48 | Instagram.jpg | `16rjo6DJmiaf8JjUVzKRBfOYwydLxwQsM` | Fassadenausschnitt (Hofseite mit Loggien, Teich) | weich, gefiltert durch Laub | Sommer | Augenhöhe, Normal, Rahmung durch Laub | ja wenige | grün eingebettetes Wohnen, Ruhe, Teich mit Seerosen |
| 49 | Architectuuratelier Huyghe (@atelierhuyghe) • Instagram-foto's en -video's.jpg | `1Z9WXiIPsx0tuRVhHYXmDSaIWhww6DSNv` | Eingang/Erdgeschoss (Restaurant, Glasfront) | bedeckt, warmes Innenlicht | Herbst (vereinzelt Laub am Boden) | Augenhöhe, Normal, frontal | ja (Gäste, Koch) | gemütliches Restaurant, warm innen gegen grau außen |
| 50 | -28.jpg | `1Gd032wZC6cucmovzgCGisSSLegyz-6dW` | Totale Straße (Quartiersecke) | Spätnachmittag diesig, warmes Streiflicht | Spätsommer/Herbst | Augenhöhe, Normal, übereck | ja mehrere | britischer Wohnbau, Ziegelsockel, ruhige Alltagsszene |
| 51 | -23.jpg | `1dvLW40NNCOlCn2tVNrQXxEiwy1v_7apb` | Totale Straße (Ecke in Altstadt) | bedeckt, weißer Himmel | Herbst (Laub am Boden, gelbe Blätter) | Augenhöhe, Weitwinkel, übereck | ja mehrere | Neubau fügt sich in Altstadt, Markisen, ruhig-alltäglich |
| 52 | -25.jpg | `1kFxp1G86Hcx9mlDiUae_880lVg1DK7ws` | Totale Straße (Solitär) | bedeckt, weißer Himmel, flach | Herbst (Blätter am Boden, nasser Boden) | Augenhöhe, Normal, übereck | nein | dokumentarisch-fotografisch, nüchtern, hell |
| 53 | -22.jpg | `1fxIQNkZFg48bCYVOr0pMoUpz59DFZ4FL` | Fassadenausschnitt (frontal, Zinkdach mit Gauben) | diesig, kühles Morgenlicht, Nebel | Herbst/Spätherbst (braunes Laub) | Augenhöhe, frontal, Tele | nein (Fahrrad) | ruhige Materialstudie, Zinkdach und Gauben, Eichentüren, kühle Eleganz |
| 54 | -26.jpg | `1w3l3czkVNbscSneWmpwuJNnCnAOOQHvZ` | Totale Straße (Platz frontal) | Gegenlicht nach Regen, nasser Platz, Spiegelungen, dramatischer Himmel | Herbst | Augenhöhe, frontal, Normal | ja mehrere (Mäntel) | britisch-melancholisch, Silhouetten, nasse Spiegelungen |
| 55 | -24.jpg | `1ht33gvw-PBpaIOo1UZVOtJQGVd0WGuJr` | Totale Straße (Eckhaus) | bedeckt, weißer Himmel | Sommer | Augenhöhe, Normal, übereck exakt auf die Ecke, viel Himmel | nein | nüchtern-elegant, Pariser Eckhaus neu, Holz-Erdgeschoss |
| 56 | Render CGI AWARD в Instagram_ «Visualization by @barbar_ro ...».jpg | `1fS7HlQxNl3E3JJpf3F4_ecxAGbGaGo-_` | Totale Straße (Solitär frontal) | Dämmerung nach Regen, nasser Boden, warmes Innenlicht | Spätherbst/Winter (kahle Bäume) | Augenhöhe, frontal, Normal | ja (Radfahrer Bewegungsunschärfe) | kühl-ruhig, Spiegelungen, kahle Bäume, Wettbewerbs-Ästhetik |
| 57 | -20.jpg | `1iD5RS4jPap2-yqYL6yqmAqSDtsyjEdaI` | Eingang/Erdgeschoss (Eingangshalle) | weich, diesig, warmes Innenlicht | Herbst (gelbes Laub) | Augenhöhe, Normal, frontal leicht übereck | ja mehrere, Radfahrer | öffentlich-einladend, Holz und Glas |
| 58 | -21.jpg | `1R6OuTPlBor-l39m8v-lAy9iOgCmXaJZk` | Fassadenausschnitt (frontal Steinfassade) | sonnig weich, blauer Himmel | Sommer/Frühling | Augenhöhe, frontal, Normal | ja viele (Business) | klar, plastische Steinfassade, City-Look, KI-typisch |
| 59 | -19.jpg | `1bAw2DFnQ1OHdFFp0sc8QiXuSM8PpQZOW` | Totale Straße (Solitär im Park) | bedeckt hell | Frühling (zartes Grün) | Augenhöhe, Normal, übereck | ja wenige | luftig, campus-artig, zartes Frühlingsgrün |
| 60 | -18.jpg | `15aFbBAUttLLCIQcWzUk4itgJtkha55cT` | Totale Straße (Platz mit Gastro, Turm) | diesig hell, weich | Sommer | Augenhöhe, Normal, Untersicht | ja viele (Gastro) | urbanes Leben, Café-Tische, helle Fassaden |
| 61 | Vivid Vision - We’ve been lucky to be part of Lumiere_.. | `1X_vYogABZxDPsLwxo7iEpo2sJFSiBEJj` | Eingang/Erdgeschoss (Platz mit Lobby und Café) | bedeckt, weiß, warmes Innenlicht | Herbst (orange Laub, Blätter am Boden) | Augenhöhe, Normal, frontal | ja viele (Mäntel, Hund) | herbstliches Stadtleben, gemütlich, warme Lichtinseln |
| 62 | Tom Darmon Architecture.jpg | `1FomBmnfcEP-wz5c4nDObjsfolmCP7I0R` | Totale Straße (Kreuzung, Eckbau) | Blaue Stunde, nasser Asphalt, warme Fenster und Laternen | Sommer | Augenhöhe, Weitwinkel, übereck, Rahmung durch Laub | ja viele, Fahrräder | Abend in der Stadt, Spiegelungen, Feierabend-Gefühl |
| 63 | Mountain Hotel with Panoramic Views \| Ukrainian Carpathians.jpg | `1J4hKL6cM_TKa_cYCeEmcOXWNRkX1jwxL` | Terrasse/Dach (Balkon mit Fernblick) | Golden Hour, Dunst, Gegenlicht | Sommer | Augenhöhe seitlich, Tele, Rückenfigur | ja (eine Rückenfigur) | kontemplativ, Weite, Sehnsucht, Blick |
| 64 | Lime Tower.jpg | `1O9RFhq_AAj2vvYHXeQ4ySvwU7AMcwJk-` | Terrasse/Dach (Blick vom Balkon) | Sonnenuntergang, orange Himmel | Herbst (Strickpullover) | Over-the-shoulder, Tele, geringe Schärfentiefe | ja (Rückenfigur unscharf) | Lifestyle, Abendruhe, Blick auf die Stadt |
| 65 | -16.jpg | `1-Q8ZI2el90fLbTeO_xUgz7PLk4c7F2hB` | Totale Straße (Ecke mit Aufstockung) | Golden Hour, warmes Streiflicht, blauer Himmel | Sommer | Augenhöhe, Normal, übereck, Hochformat | ja (Paar, Mutter mit Kind) | Sockel-Dach-Kontrast, Cortenaufbau, freundlich urban |
| 66 | Vis-on Studio - Architectural 3D Visualization.jpg (Originalname mit Geviertstrich) | `1D0xYh8FPaOVJJTnD2KtOqnjZunK3EsIP` | Sonstiges (Hochhaus Untersicht) | Gegenlicht, Sonnenstern, Golden Hour | Herbst (braunes Laub) | Froschperspektive, Weitwinkel, Rahmung durch Äste | ja winzig in Fenstern | dynamisch, aufstrebend, wenig passend für Altbau |
| 67 | Korpo.jpg | `1xAuxjuWgEhMpqHuex-dPLnFfZR8Vt4y-` | Architekturdetail (Rasterfassade gegen Himmel) | Golden Hour Streiflicht auf Kante, klarer Himmel | unbestimmt | Froschperspektive, Normal, diagonal | nein | grafisch-minimal, Fotografie, viel Negativraum |
| 68 | -17.jpg | `1H5gztwjQtPK9eYYFVJnf96wJmoYL2AYR` | Totale Straße (Fußgängerzone) | diesig, überstrahlter Himmel | Sommer | Augenhöhe, Normal | ja viele, Fahrräder | lebendig, holländisch, Ziegel, Alltag |
| 69 | ✨️.jpg | `1HsN5jx4Xc5biMGdYfPH1SDvabS12UcPL` | Eingang/Erdgeschoss (Gasse mit Café) | warmes Spätnachmittagslicht, diesig, Gegenlicht | Spätsommer | Augenhöhe, Normal, zentrale Flucht | ja (Paar von hinten) | entspannter Stadtspaziergang, warm, filmisch, Sand- und Beigetöne |
| 70 | -15.jpg | `1B3Vz-hbxlvRHoVXEFn6N5Udy_T2UHN_n` | Architekturdetail (Balkonbänder) | Golden Hour, warmes Licht, blauer Himmel | unbestimmt | Tele, Untersicht, Ausschnitt | nein | grafisch, Kupfer gegen Blau, Komplementärkontrast |
| 71 | -14.jpg | `1taFp2In-w5k1YIwWYxB9zAMDTPsaLeA2` | Architekturdetail (Fassadenkante gegen Himmel) | Golden Hour Streiflicht, Petrol-Himmel | unbestimmt | Froschperspektive, Weitwinkel, viel Negativraum | nein | minimalistisch, Fotografie, Teal-Orange-Look |
| 72 | -13.jpg | `128N_Kd8HnlksjdEMfwj9H0lYjWTB-bnN` | Architekturdetail (Untersicht Hochhäuser) | bedeckt, weißer Himmel | unbestimmt | Froschperspektive, Weitwinkel | nein | analoger Film-Look, entsättigt, Körnung, grafisch |
| 73 | Frank Lloyd Wright Woning - Oostduinkerke.jpg (Originalname mit Geviertstrich) | `1T1QtlyKsV_8Xq8El8jgjgLt9YoKMe5By` | Totale Straße (Wohnhaus hinter Kiefern) | diesig sonnig, Gegenlicht, unscharfer Vordergrund | Frühling | Augenhöhe, Tele, Rahmung durch unscharfes Laub | nein | echte Fotografie, beiläufig, warm-entsättigt, Absperrband als Realismus |
| 74 | -12.jpg | `1Z39Qb26HY08suaVByYIrHf8jwDXoaLJb` | Totale Straße (Wohnhof im Grünen) | Golden Hour Gegenlicht, Dunst | Sommer | Augenhöhe, Normal, Rahmung durch Laub oben | ja (eine Person) | ruhige Abendstimmung, grüne Oase, warme Fenster |
| 75 | -11.jpg | `1fTv9ZybpkzXrpvqmoZrWUGhthFWQ2_hT` | Eingang/Erdgeschoss (Haustür mit Laternen, Stuck) | Dämmerung, warmes Laternen- und Innenlicht | unbestimmt (Spätsommer) | Augenhöhe, frontal, Normal, symmetrisch | nein | klassische Eleganz, Townhouse, Lacktür, Messing, Willkommensgefühl |
| 76 | How much should an architectural rendering cost in 2026?.jpg | `1mJSaSoA-VW0j1G9XHkEJhyevk8Y2R2Mb` | Totale Straße (Wohnweg mit Grünzug) | sonnig, warmes Nachmittagslicht, Wolken | Frühsommer (Blüte) | Augenhöhe, Normal, Flucht | nein | grün, sonnig, wohnlich, Bauträger-Standard |

---

## 2. Statistik

### Bildtypen

| Kategorie | Anzahl | Anteil |
|---|---:|---:|
| Totale Straße | 35 | 46 % |
| Eingang/Erdgeschoss | 12 | 16 % |
| Fassadenausschnitt | 10 | 13 % |
| Sonstiges | 7 | 9 % |
| Architekturdetail | 6 | 8 % |
| Terrasse/Dach | 5 | 7 % |
| Totale Luft | 1 | 1 % |

### Licht (Hauptkategorie je Bild)

| Kategorie | Anzahl | Anteil |
|---|---:|---:|
| Golden Hour / Gegenlicht | 23 | 30 % |
| Diesig / weiches Streulicht | 13 | 17 % |
| Bedeckt / heller Himmel | 16 | 21 % |
| Sonnig klar | 12 | 16 % |
| Blaue Stunde / Dämmerung | 8 | 11 % |
| Regen / nach Regen | 4 | 5 % |

### Jahreszeiten

| Kategorie | Anzahl | Anteil |
|---|---:|---:|
| Frühling | 9 | 12 % |
| Sommer | 26 | 34 % |
| Spätsommer | 11 | 14 % |
| Herbst | 19 | 25 % |
| Winter | 3 | 4 % |
| unbestimmt | 8 | 11 % |

### Kamera und Bildinhalt

| Merkmal | Anzahl | Anteil |
|---|---:|---:|
| Menschen im Bild | 49 | 64 % |
| Kamera auf Augenhöhe | 63 | 83 % |
| Übereck-Perspektive | 28 | 37 % |
| Frontal | 16 | 21 % |
| Erhöht / Drohne | 8 | 11 % |
| Froschperspektive / Untersicht | 8 | 11 % |
| Tele explizit | 12 | 16 % |
| Weitwinkel explizit | 21 | 28 % |
| Vordergrund-Rahmung (Laub, Passanten, Unschärfe) | 13 | 17 % |
| Warmes Innen-/Laternenlicht als Akzent | 13 | 17 % |

### Lesart der Zahlen

- **Die Sammlung ist eine Straßen-Sammlung.** Rund die Hälfte sind Totalen aus der Fußgängerperspektive, meist übereck. Echte Luftbilder gibt es praktisch nicht (nur "Luxury Residential Campaign Concept.jpg" als niedrige Drohne). Detailaufnahmen sind vorhanden, aber eher als grafische Fotografie (Korpo, -14, -15, -13) als als Stuck-Details. Die Detailmotive für Das Wimmer müssen wir also stilistisch ableiten, nicht kopieren.
- **Weiches Licht dominiert.** Golden Hour/Gegenlicht ist die größte Einzelgruppe, aber diesig, bedeckt und Dämmerung zusammen machen klar mehr aus. Harte Mittagssonne mit tiefblauem Himmel ist die Ausnahme und wirkt in der Sammlung oft am "renderhaftesten" (LH.jpg, Charging Station, -21).
- **Sommer und Herbst tragen die Sammlung.** Herbst ist auffällig stark vertreten (Laub am Boden, gelbe Kronen, Mäntel). Winter kommt fast nur in alpinen Hotel-Bildern vor, urban nur in "K&+ Architecture ... Strasbourg"; kahle Bäume im Spätherbst zeigt zusätzlich "Render CGI AWARD ...". Für die Winter-Variante gibt es also wenige direkte Vorlagen.
- **Menschen sind Standard,** aber klein, beiläufig, oft in Bewegung oder angeschnitten. Keine posierenden Models.
- **Wien-nahe Referenzen** (direkt übertragbar auf Altbau mit Dachausbau): -41.jpg (Pazelhof, Ecke mit Mansarde), -42.jpg (Gasse Innere Stadt), -32.jpg (Hauptgesims plus Glas-Dachaufsatz), "Luxus Immobilien in Wien ... CROWND Estates.jpg", LH.jpg, "Mist Apartments ...", -29.jpg (Pariser Altbau mit Zink-Mansarde), -22.jpg (Zinkdach mit Gauben), "Жилой комплекс ... .jpg" (beiger Putz plus Mansarde plus Herbstlaub), -11.jpg (Haustür, Stuck, Laternen).

---

## 3. Abgeleitete Bildsprache: 9 verbindliche Regeln

**Regel 1: Licht ist tief, warm und weich, nie hart von oben.**
Standard ist später Nachmittag bis Golden Hour mit Streiflicht über die Fassade, alternativ diesiges, milchiges Licht. Die Sonne steht seitlich oder leicht im Gegenlicht, damit Stuck und Gesimse Schatten werfen und der Putz plastisch wird. Keine Mittagssonne mit tiefblauem Himmel.
Beispiele: "Жилой комплекс ... .jpg", -30.jpg, "Kop Zuidas, Amsterdam.jpg", "Gallery - TMRW.jpg", ✨️.jpg.

**Regel 2: Himmel hell, entsättigt, fast weiß bis Pastell.**
Der Himmel ist Bühne, nicht Motiv: blassblau, cremig oder milchig, gern leicht überstrahlt. Kein gesättigtes Postkartenblau, keine dramatischen Wolkentürme (Ausnahme: Regen-Variante). Das hält den sandbeigen Putz warm und edel.
Beispiele: -41.jpg, Instagram-6.jpg, -24.jpg, "Architekturvisualisierungen BRUNECKY ... .jpg", -19.jpg.

**Regel 3: Palette warm-neutral, Kontrast mittel, Schwarz nie ganz schwarz.**
Sand, Creme, Elfenbein, Messing, Eichenholz, dazu gedämpftes Grün. Anthrazit (Zinkdach, Fensterrahmen) ist der einzige dunkle Ton und wird als ruhiger Rahmen eingesetzt. Schatten leicht angehoben, matte Tiefen, keine HDR-Halos.
Beispiele: -31.jpg, -22.jpg, "Mist Apartments ...", "Cross Keys New Cross ... .jpg", Instagram-2.jpg.

**Regel 4: Warmes Innenlicht als Lebenszeichen.**
In fast jeder Dämmerungs- und Herbstszene glühen einzelne Fenster und das Erdgeschoss warm (2700 bis 3000 K). Nicht jedes Fenster, sondern unregelmäßig verteilt: 20 bis 40 Prozent, mit Vorhängen und Lampen dahinter. Das ist der stärkste Emotionshebel der Sammlung.
Beispiele: "Tom Darmon Architecture.jpg", -11.jpg, "K&+ Architecture ... Strasbourg ... .jpg", "Vivid Vision ... Lumiere_..", -36.jpg.

**Regel 5: Menschen ja, aber als Statisten des Alltags.**
Ein bis acht Personen, klein im Bild, in Bewegung, gern mit leichter Bewegungsunschärfe, von hinten oder seitlich. Typisch: Paar beim Spaziergang, Radfahrerin, Person mit Hund, Gäste im Schanigarten, eine Rückenfigur auf der Terrasse. Kleidung passend zur Jahreszeit, gedeckte Farben (Camel, Navy, Creme). Nie in die Kamera schauen, nie Stockfoto-Posen.
Beispiele: Powerhouse Company - Merckt.jpg, BSB01.jpg, LH.jpg, "Sergison Bates architects.jpg", "Mountain Hotel ... .jpg", Instagram-6.jpg.

**Regel 6: Vegetation rahmt und datiert das Bild.**
Ein Ast oder eine Baumkrone im oberen Bildrand oder an der Seite rahmt die Fassade und erzählt die Jahreszeit (frisches Grün, gelbes Laub, kahle Zweige). Am Boden: einzelne Blätter im Herbst, Gräser und Pflanztröge statt Rasenteppich. Vegetation darf Fassade anschneiden, aber nie Ecke, Haustor oder Dachausbau verdecken. Bei Das Wimmer nur so viel Straßengrün zeigen, wie real in der Wimmergasse plausibel ist (vorab vor Ort prüfen).
Beispiele: -33.jpg, "Studieren­den­wohn­anlage - &MICA.jpg", -31.jpg, "Vis-on Studio ...", Instagram.jpg, "Frank Lloyd Wright Woning ...".

**Regel 7: Bildausschnitt fotografisch: Augenhöhe, stürzende Linien korrigiert, Ecke übereck.**
Kamera auf 1,5 bis 1,7 m, Shift-Optik-Logik (Vertikalen gerade), Brennweite 28 bis 50 mm für Totalen, 85 bis 135 mm für Fassadenausschnitte und Details. Die Gebäudeecke ist das Hauptmotiv und steht leicht außermittig (Drittelregel). Hochformat 4:5 ist das häufigste Format der Sammlung und passt zu Social und Exposé.
Beispiele: -41.jpg, -24.jpg, "Luxus Immobilien in Wien ... .jpg", -16.jpg, -27.jpg.

**Regel 8: Kontext Stadt, nicht Isolation.**
Das Haus steht in seiner Straße: Nachbarhäuser angeschnitten, Kopfsteinpflaster oder Gehsteig, Laternen, Poller, Fahrräder, ein geparktes Auto (dezent, eher klassisch). Der Altbau-Kontext macht den Wert sichtbar.
Beispiele: -42.jpg, -23.jpg, -29.jpg, "Timber Clad Hotel Block Composition.jpg", ✨️.jpg.

**Regel 9: Postproduktion "Fotografie statt Rendering".**
Leichte Filmkörnung, minimale Vignette, sanfte Lichthöfe an Lichtquellen, Tiefenunschärfe nur bei Details und Over-the-shoulder-Bildern. Leicht warme Weißbalance, Grün entsättigt Richtung Oliv, Himmel cremig. Imperfektion zulassen: nasse Stellen, Blätter, ein Fahrrad am Gitter. Keine Lens-Flare-Effekte aus der Dose, keine übertriebene Schärfe, keine KI-Glätte.
Beispiele: "Frank Lloyd Wright Woning ...", -13.jpg, Instagram-2.jpg, BSB01.jpg, Lime Tower.jpg.

**Was wir bewusst nicht übernehmen:** alpine Hotel- und Naturbilder (Instagram-3, Instagram-4, -37, example.com, example-2.com, example-4.com), resorthafte Pool-Höfe (Charging Station ...), Hochhaus-Untersichten mit Weitwinkel (Vis-on Studio ..., -13.jpg) und den älteren Render-Look mit Hartlicht (LH.jpg). Diese Bilder liefern nur Lichtstimmung, nicht Komposition.

---

## 4. Shotlist "Das Wimmer"

Empfohlene Hauptkampagne: **Spätsommer bis Frühherbst, Golden Hour**. Dazu zwei saisonale Varianten (Frühling, Winter) für Social und Vertriebsphasen. Herbst ist die stärkste Saison der Sammlung und passt am besten zu sandbeigem Putz.

| # | Motiv | Kamera / Brennweite | Licht | Jahreszeit | Menschen | Stil-Vorlagen |
|---:|---|---|---|---|---|---|
| 1 | **Hero: Ecke auf Augenhöhe**, ganze Ecke inkl. Dachausbau, Ecke im linken oder rechten Drittel | 1,6 m, 35 mm Shift, übereck, Hochformat 4:5 | Golden Hour, Streiflicht auf der Sonnenseite, Schattenseite warm aufgehellt | Frühherbst (erste gelbe Blätter) | 2 bis 4 Passanten, Radfahrerin, Person mit Hund | -41.jpg, "Жилой комплекс ... .jpg", -24.jpg, LH.jpg, -16.jpg |
| 2 | **Straßenflucht Wimmergasse**, Haus als Abschluss oder Kante der Flucht, Nachbarhäuser im Kontext | 1,6 m, 28 mm, Fluchtpunkt außermittig | diesig hell, milchiger Himmel | Frühling (frisches Grün) | wenige, klein, in Bewegung | -42.jpg, -23.jpg, ✨️.jpg, "Timber Clad Hotel Block Composition.jpg" |
| 3 | **Drohne Dachlandschaft**, 45 Grad auf die Ecke, Zinkdach eingebettet in Margaretner Dächer, Blick Richtung Innenstadt | Drohne 30 bis 40 m, 35 mm, leicht übereck | Golden Hour, langer Schatten über Dächer | Spätsommer | nein (oder winzig auf der Terrasse) | "Luxury Residential Campaign Concept.jpg", "Luxus Immobilien in Wien ... .jpg" |
| 4 | **Frontalansicht Hauptfassade**, streng symmetrisch, Straße im Vordergrund | 1,6 m, 70 bis 85 mm Tele, frontal | diesiges Morgenlicht, sehr weich | Spätsommer | 1 Passant mit Bewegungsunschärfe | Instagram-6.jpg, "Mist Apartments ...", -29.jpg, -30.jpg |
| 5 | **Beletage-Fenster mit Dreiecksgiebel**, weiße Kastenfenster, Stuckverdachung, Spiegelung von Baum und Himmel im Glas | 1,6 m von der Gegenseite, 135 mm, leicht von unten | Streiflicht seitlich, Golden Hour | Herbst | nein | -32.jpg, -11.jpg, "Жилой комплекс ... .jpg" |
| 6 | **Haustor Eiche mit Steinportal**, Tür geöffnet oder mit Licht im Foyer, Hausnummer 20 lesbar | 1,5 m, 50 mm, frontal, symmetrisch | Blaue Stunde, warmes Foyerlicht, Wandleuchten | Herbst (Blätter auf der Stufe) | optional eine Person mit Schlüssel, von hinten | -11.jpg, -22.jpg, "Cross Keys New Cross ... .jpg" |
| 7 | **Hauptgesims mit Konsolen**, Untersicht gegen hellen Himmel, Zinkkante darüber angeschnitten | Untersicht, 85 bis 100 mm | Golden Hour Streiflicht, das die Konsolen modelliert | unbestimmt (Himmel pastell) | nein | -32.jpg, Korpo.jpg, -14.jpg, -15.jpg |
| 8 | **Übergang Altbau zu Dachausbau**, Gesims, Attika, Zinkfalz und Gauben in einem Bild, Material-Kontrast Putz zu Zink | 1,6 m von schräg gegenüber, 100 mm, übereck | diesig bis bedeckt, damit Zink nicht spiegelt, leicht warmer Ton | Spätsommer | nein | -32.jpg, -22.jpg, -29.jpg, "Mist Apartments ..." |
| 9 | **Dachterrasse mit Blick**, Rückenfigur am Geländer, Wiener Dächer und Kirchtürme in Dunst | 1,6 m, 50 mm, Tele-Kompression, Over-the-shoulder | Golden Hour Gegenlicht, Dunst | Spätsommer oder Herbst (Strick) | 1 bis 2 Personen, Rückenansicht | "Mountain Hotel ... Carpathians.jpg", Lime Tower.jpg, -34.jpg |
| 10 | **Erdgeschoss mit Leben**, Schaufenster oder Café an der Ecke, Schanigarten, Pflanzentröge, Markise | 1,4 m, 50 bis 85 mm, Autos oder Passanten unscharf im Vordergrund | später Nachmittag bis Dämmerung, warmes Innenlicht | Spätsommer | 4 bis 8 Personen, Kellner, Gäste | Instagram-2.jpg, ✨️.jpg, BSB01.jpg, "Rona torg.jpg", "Vivid Vision ... Lumiere_.." |
| 11 | **Abend: Ecke zur Blauen Stunde**, Himmel tiefblau-violett, 30 Prozent Fenster warm, Laternen an | 1,6 m, 35 mm, übereck | Blaue Stunde, nasser Gehsteig optional | Spätsommer | wenige Silhouetten | "Tom Darmon Architecture.jpg", -38.jpg, "Mist Apartments ...", -36.jpg |
| 12 | **Winter-Ecke**, kahle Bäume, leichter Schnee auf Gesimsen und Zinkdach, warme Fenster | 1,6 m, 35 mm, übereck | bedecktes Schneelicht, Spätnachmittag mit warmen Fenstern | Winter | Mutter mit Schlitten, Person mit Einkaufstasche | "K&+ Architecture ... Strasbourg ... .jpg", "Render CGI AWARD ...", Instagram-4.jpg |
| 13 | **Herbst nach dem Regen**, Straßenflucht mit nassem Kopfsteinpflaster, Spiegelung der Fassade, gelbes Laub | 1,6 m, 35 mm, Flucht | bedeckt mit Lichtbruch, Pfützen-Spiegelungen | Herbst | 3 bis 5 Personen mit Mänteln, ein Schirm | -33.jpg, "Timber Clad Hotel Block Composition.jpg", -26.jpg, "Sergison Bates architects.jpg" |
| 14 | **Kastenfenster-Detail**, ein Fenster mit Faschen, Fensterbank, Blumen oder Vorhang innen, warmes Licht im Raum | 1,6 m, 135 mm, frontal | Dämmerung, innen warm | Frühling oder Herbst | nein (Schatten einer Person innen optional) | -11.jpg, Instagram-6.jpg, -22.jpg |
| 15 | **Lifestyle-Ecke im Vorbeigehen**, Passanten angeschnitten im Vordergrund, Haus scharf dahinter | 1,5 m, 35 mm, geringe Schärfentiefe im Vordergrund | warmes Spätnachmittagslicht | Frühling oder Spätsommer | 2 bis 3 Personen angeschnitten | Powerhouse Company - Merckt.jpg, "Sergison Bates architects.jpg", BSB01.jpg |

### Jahreszeiten-Varianten

| Variante | Charakter | Beste Motive | Begründung |
|---|---|---|---|
| **Herbst (Hauptkampagne)** | goldenes Laub, Blätter am Boden, Golden Hour, Mäntel und Strick, warme Fenster | 1, 5, 6, 9, 13 | Herbst ist in der Sammlung die zweitstärkste Saison und erzeugt mit sandbeigem Putz die wärmste, hochwertigste Wirkung. Haustor mit Laub und Dachterrasse im Gegenlicht sind die emotionalsten Bilder. |
| **Frühling** | frisches, helles Grün, diesiges Licht, leichte Kleidung, Blüten in Trögen | 2, 4, 10, 14, 15 | Weiches, helles Licht passt zu den Straßen- und Erdgeschossmotiven; gut für Vertriebsstart und "Neubeginn"-Botschaft. |
| **Winter** | kahle Bäume, dünne Schneeschicht auf Gesimsen und Zink, warme Fenster, frühe Dunkelheit | 6, 11, 12 | Der Kontrast aus kühlem Schnee und warmen Fenstern ist das stärkste Zuhause-Gefühl der Sammlung. Schnee betont Gesimse und Zinkfalze grafisch. |

Empfehlung zur Produktion: Motive 1, 6, 11 in allen drei Saisons rendern (gleiche Kamera, nur Licht und Vegetation tauschen). Das ergibt eine Saison-Serie für Social und eine einheitliche Bildfamilie im Exposé.

---

## 5. Prompt-Bausteine für Higgsfield (Englisch)

Bausteine je Lichtstimmung. Vor jeden Baustein den Objekt-Block setzen, danach Motiv und Kamera aus der Shotlist.

**Objekt-Block (immer davor):**
> A renovated Viennese Gründerzeit corner apartment building from around 1900, sand-beige lime plaster facade, white double casement windows, rich stucco with triangular pediments on the piano nobile, a strong main cornice with brackets, and a modern rooftop extension clad in anthracite standing-seam zinc. Located on a quiet street in Vienna's 5th district, with neighbouring historic facades, cobblestone and sidewalk details.

**Golden Hour (Hauptstimmung):**
> Late afternoon golden hour, low warm sun grazing the facade from the side so every cornice and stucco ornament casts a soft shadow. Pale creamy sky, gentle haze, warm highlights on the beige plaster and a few windows already glowing softly from inside. Photographic realism, shot on a full-frame camera with a shift lens, subtle film grain, lifted shadows, no oversaturation.

**Diesig / weiches Morgenlicht:**
> Soft hazy morning light, milky pale-blue sky, almost no hard shadows, the facade rendered in calm, even tones of sand and ivory. Air feels fresh and quiet, light mist softening the far end of the street. Muted natural colours, gentle contrast, editorial architectural photography.

**Bedeckt:**
> Bright overcast day, diffuse white sky acting as a giant softbox, true material colours of plaster, white window frames and dark zinc. Calm, documentary atmosphere like a real estate photograph by an architectural photographer, slightly desaturated greens, crisp but not harsh detail.

**Blaue Stunde:**
> Blue hour just after sunset, deep blue to soft violet sky, street lamps and the ground floor shop glowing warm at 2700 Kelvin. Around a third of the windows lit from inside with visible curtains and lamps, the stucco facade gently lit by warm spill light. Quiet evening mood, slight reflections on the pavement, cinematic but natural.

**Herbst nach Regen:**
> Autumn afternoon right after rain, wet cobblestones and sidewalk reflecting the facade and warm shop windows, yellow leaves scattered on the ground and on the trees. Overcast sky with a soft break of light, people in coats, one umbrella. Moody yet warm, muted palette of beige, ochre and slate grey.

**Winter / Schnee:**
> Calm winter late afternoon, bare trees, a thin layer of fresh snow on the cornices, window sills and the zinc roof, soft grey sky. Warm golden light glowing from many windows and the entrance, contrasting with the cool white street. Cosy, quiet, festive without decorations, photographic realism.

**Negativ-Baustein (immer anhängen):**
> Avoid: oversaturated blue sky, harsh midday sun, HDR look, plastic CGI surfaces, distorted vertical lines, posing models looking into the camera, futuristic glass towers, palm trees, text or logos.

---

## 6. Qualitätsabgleich Runde 5 gegen Referenzen

Stand 16.11.2026, Kundenwunsch (Chat 16.11.2026): "vom Mood der Renderings und von der Qualität noch einmal den Referenzordner checken, etwas drauflegen und ggf. andere Winkel probieren". Referenzordner neu geladen (Drive-Ordner `1wOPgEK7o7V55qFRLjhspc_xi70PVLrod`, 25 Außenbilder in voller Auflösung, nur im Scratchpad), direkt neben die 13 Außenbilder der Runde 5 (`renders/higgsfield/*_r5.jpg`) gelegt. Vergleichsbogen nur intern (Scratchpad, nicht im Repo).

### 6.1 Die zehn stärksten Außenreferenzen

| # | Datei (Drive-ID) | warum stark | was wir übernehmen |
|---:|---|---|---|
| 5 | -41.jpg, Pazelhof (`1kpqnJMgeq58Q6pmA3yBgG6JFhgOcHsXN`) | Wiener Eckhaus füllt rund 70 % des Bildes, Augenhöhe, diesiges Licht, Stuck plastisch, Boden nur ein schmaler Streifen | Bildaufbau: Haus groß, wenig Straße, Himmel cremig |
| 13 | Жилой комплекс ... (`1XDg3qnaVXqZoFxDCr_Z5u7VGCzbIirDt`) | tiefes Streiflicht mit langen Schatten über das Pflaster, rotes und gelbes Laub als Rahmen, Laub am Boden, warmes Innenlicht im EG | Herbstlicht, Schatten am Boden, Laubrahmung, Hochformat |
| 1 | Gallery - TMRW.jpg (`1ITh4TX30NyK8Q8CfpWrN6Zr539u2fwD-`) | Gegenlicht durch Baumkronen, Sonnenstern, Dunst, viele Menschen in mehreren Bildebenen | Gegenlicht und Luftperspektive, Menschen in Vorder-, Mittel- und Hintergrund |
| 62 | Tom Darmon Architecture.jpg (`1FomBmnfcEP-wz5c4nDObjsfolmCP7I0R`) | blaue Stunde, nasser Asphalt mit Spiegelungen, warmes EG, Laub oben als Rahmen, Radfahrer und Fußgänger | Abendmotiv: Spiegelungen, warmes Innenlicht, Rahmung |
| 38 | Luxus Immobilien in Wien ... CROWND (`1l3rh3H2o_HWBU0Rec7IXmPAb3Rz8FMXS`) | Wiener Gründerzeit mit Dachausbau, leicht erhöhter Standpunkt, gerade Vertikalen | erhöhter Blick übereck, Dachausbau als Krone |
| 2 | Instagram-6.jpg (`1Ls2EVhj0hfx1nSyQwWoiQOmVQWdLA9kH`) | frontal und ruhig, diesig, Passant mit Bewegungsunschärfe, Innenräume hinter den Fenstern sichtbar (Vorhänge, Menschen) | Frontalmotiv, Leben hinter den Fenstern, Bewegungsunschärfe |
| 44 | Sergison Bates architects.jpg (`156jgBu3AKXxNFwg_VhiuYGhDlKvpdKY-`) | gelbe Straßenbäume vor der Fassade, Licht nach Regen nur im unteren Teil, viele Passanten, angeschnittene Figur vorne, Schaufenster hell | Herbststraße mit Leben, Vordergrundfigur |
| 29 | Instagram-2.jpg (`1nUiGlB_K0ZQpW9AJU9Lm9YQ9aNuMhZHh`) | Lokal mit Gästen und Kellner, warmes Innenlicht, Autos unscharf im Vordergrund, Tele-Kompression | EG-Leben, Bewegungsunschärfe, Wärme |
| 33 | -33.jpg (`1ZpfADIR4CArzhSi9mpVST2RUYsntOXOH`) | Ast als Rahmen oben, nasser Boden mit Laub, dramatischer, aber entsättigter Himmel | Vordergrundrahmung, Bodenreflexe |
| 39 | -31.jpg (`125EcNmi47RtNqtlrAoPITalSzd5nbkQz`) | Kronen links und rechts rahmen das Haus, gedämpfte Filmpalette, Vorhänge in den Fenstern | Farbgrading, Rahmung, Fensterinnenleben |

Weitere für einzelne Motive: BSB01.jpg (EG-Ecke, Bewegungsunschärfe), ✨️.jpg (Gasse mit Café), -42.jpg (Wiener Gasse), -11.jpg (Haustür mit Laternen), -32.jpg (Hauptgesims), "Mountain Hotel ..." und Lime Tower.jpg (Rückenfigur Terrasse), "K&+ Architecture ..." (Winter).

### 6.2 Was Runde 5 gegenüber den Referenzen fehlt

| Merkmal | Referenzen | Runde 5 | Ursache |
|---|---|---|---|
| Bildaufbau | Haus füllt 60 bis 75 % der Fläche, 28 bis 50 mm, oft Hochformat, Boden höchstens 15 % | Eckmotive mit 20 mm: Haus rund 40 % der Fläche, untere 30 bis 35 % leere Kreuzung, Haus mittig und klein | Kameras `ecke`, `ecke_orbit` sehr weitwinklig und tief |
| Vordergrundrahmung | 6 von 10: Ast, Laub, Person oder Auto unscharf im Vordergrund | keine | Kamera auf freier Kreuzung |
| Lichtführung | Streif- oder Gegenlicht, Schatten auf dem Pflaster, Lichtstrahlen | Herbst und Golden Hour: Sonne im Rücken der Kamera, Wimmergassen-Fassade frontal angestrahlt, flach | Ecke von Südwesten gesehen, Sonne steht im Südwesten |
| Atmosphäre, Tiefe | Dunst, Luftperspektive, ferne Straße heller und weicher | ferne Straße genauso scharf und kontrastreich wie das Haus | Prompt verlangte "sharp, crisp detail everywhere" |
| Himmel, Farbgrading | cremig bis milchig, Schatten angehoben, warm-neutral, Grün oliv, leichte Körnung | gesättigtes Blau (Herbst, Blaue Stunde), Orangeverlauf (Golden Hour), sehr sauber digital | Prompt, kein Grading-Baustein |
| Fassade, Putz | Putzstruktur und Stuck mit Schattenkanten, leichte Patina | Putz fast weiß überstrahlt, Stuck verwaschen, wenig Mikrokontrast | Frontlicht, KI-Glätte bei 2k |
| Fenster | Spiegelungen von Himmel und Bäumen, Vorhänge, Lampen, Menschen innen | Glas grau oder schwarz, ohne Innenleben (außer Blaue Stunde) | Vorschau ohne Innenleben, Prompt ohne Hinweis |
| Innenlicht | warme Fenster und Lokale auch tagsüber in Herbst und Dämmerung | nur Blaue Stunde und Winter | Lichtszenario und Prompt |
| Menschen | 3 bis 20, verschiedene Größen, in Bewegung, angeschnitten, Radfahrer | 1 bis 3 winzige Passanten | Prompt "a few pedestrians" |
| Bewegungsunschärfe | Passanten, Autos, Radfahrer | keine | Prompt |
| Vegetation | lockere, unregelmäßige Kronen mit Durchblicken, Farbverlauf grün-gelb-orange | Eckbaum als symmetrische Kugel, gleichmäßig gelb; in Golden Hour 30 % schmaler | Kugelkrone in der Blender-Vorschau |
| Boden | Pflaster, nasse Stellen, Licht- und Schattenflecken, Laub | glatter, gleichmäßiger Asphalt, wenig Laub | Vorschau, Prompt |
| Autos | dezent, teils unscharf, Klassiker | gleichförmige Reihen moderner Kompaktwagen, teils Typenschriftzüge | Kisten in der Vorschau |
| Schärfe, Auflösung | ruhige Fotoschärfe | 2528 px mit KI-Glätte (Bodenbilder), Drohnen nativ 4k | Auflösung 2k |
| Details | Haustür, Gesims, Fenster mit Licht und Tiefe | Detailbilder flach frontal, Haustor ohne Stimmung | Kamera und Licht |

### 6.3 Folgerungen für Runde 6

1. Neue Kameras mit 28 bis 35 mm, teils Hochformat 4:5, Haus groß im Bild, Boden knapp; bestehende Weitwinkelmotive bleiben als Serie, bekommen aber Belebung, Licht und Grading.
2. Licht nach Himmelsrichtung wählen: Streiflicht auf der Stolberggassen-Fassade im Herbst, Gegenlicht die Wimmergasse hinunter am Herbstmorgen, Abend mit warmen Fenstern.
3. Blender-Vorschau: Baumkronen gelappt statt Kugel (gleiche Lage, Höhe und Kronengröße), Autos mit Karosserieform statt Kisten.
4. Prompt-Bausteine "Atmosphäre und Belebung": 3 bis 8 Passanten in Bewegung (teils Bewegungsunschärfe, keine Gesichter erkennbar), warmes Licht in 20 bis 30 % der Fenster, Vorhänge und Lampen hinter dem Glas, Spiegelungen, leichter Dunst, angehobene Schatten, feine Körnung; keine lesbare Schrift, keine Logos, Kennzeichen leer, keine Verkehrsschilder.
5. Verfahren und Modell an einem Motiv testen (Abschnitt 6.4).
