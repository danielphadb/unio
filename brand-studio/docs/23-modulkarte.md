# 23 - Modulkarte der gesicherten Fassung

Stand 27.11.2026 (Etappe W1). Arbeitsgrundlage für W3: welche Datei im Bundle welchem früheren
Modul entspricht, welche Funktionen dort stecken und wie sie heißen dürften. Erzeugt mit
`recovered/harness/modulkarte-roh.mjs` und `modulkarte.mjs`; die Zuordnung der Namen ist
Handarbeit aus der Analyse (`?` = Vermutung). Lesbarer Code: `recovered/pretty/`.
Zugriff auf jede Funktion im Browser: `(await import("./assets/<datei>")).__recovered__.<Name>`
in der instrumentierten Fassung (`npm run recovered:instrument`).

## 1. Bibliotheken und Versionen

| Paket | Version | Beleg im Bundle | liegt in |
|---|---|---|---|
| react, react-dom | 18.3.1 | `.version="18.3.1"` | index |
| opentype.js | 1.3.4 | 98 % der Zeichenketten, 25 nur in 1.3.4 | index, render.worker |
| polygon-clipping | 0.15.7 | `POLYGON_CLIPPING_MAX_QUEUE_SIZE` (ab 0.15.x) | index, render.worker |
| jspdf | 4.2.1 | `Mt.version="4.2.1"` | jspdf.es.min |
| svg2pdf.js | 2.8.1 | Link-Rechteck mit `(n[1]+n[3])` (neu in 2.8.1), 2.9.0 erst 29.10. | svg2pdf.es.min |
| jszip | 3.10.1 | Banner | zip.worker |
| dompurify | 3.4.17 | Banner (Abhängigkeit von jspdf) | purify.es |
| html2canvas | 1.4.1 | Banner (Abhängigkeit von jspdf) | html2canvas.esm |
| canvg | 3.0.11 | Abhängigkeit von jspdf (`^3.0.11`) | index.es |
| core-js | 3.50.0 | `version:"3.50.0"` | index.es |
| Vite | 5.x (gewählt 5.4.21) | `__vite__mapDeps`, Worker als `new URL(..., import.meta.url)` | alle |

Markenschriften: 105 Familien aus `@fontsource/*` 5.3.0, 405 Dateien; 404 byte-gleich, eine
(`noto-serif-display-latin-ext-400-normal.woff`) aus dem Artifact (`recovered/fonts-override`).

## 2. Chunks im Überblick

| Chunk | Größe | Bereich | vermutete Originaldateien | Aufgabe | importiert aus |
|---|---|---|---|---|---|
| engine | 406.0 KB | Logo-Engine und Signature-Vorlagen | src/engine/{generator,renderLogo,recipes,quality,highend,catalog,corpusMarks,corpusTechMarks,tracking,palettes,typoExtras,suffixPairings,route,eingriffe}.ts, src/signature/**, src/symbols/{monogram,boolean,drawnMonogram}.ts | Konzepte erzeugen, Seiten-Pools, Kuratierung, Rendern (SVG-Pfade aus opentype), Qualitätsprüfung, Signature-Vorlagen (Daten + Layout-Interpreter), Routen-Filter | index, svg |
| nameFinder | 1137.9 KB | Namen | src/engine/names.ts, src/engine/names/** (wordsDb, lexicon, rules, quality, tech, kwFields, brandable, styles, corpusNames, rating, wordsDbFormat), src/engine/nameCards.ts, src/engine/reference/{names,keyword-fields,naming-rules}.json, src/namen/kiNamen.ts | Namensprofil, Chargen, Namensprüfung, Alternativen, Namenskarten mit finalen Logos | engine, index, svg |
| kompass | 76.6 KB | Strategie (Markenkompass) | src/strategy/{axes,territories,routes,index}.ts, src/strategy/territories.json, src/engine/kompassProbe.ts | Achsen aus dem Brief, Territorien, chooseRoutes, Route auf Eingaben anwenden | engine, index, nameFinder, svg, texts |
| texts | 37.5 KB | Strategie: Katalog und Texte | src/strategy/{catalog,texts,kiTexte,types}.ts | Fragenkatalog des Kompass, Texte der Routen (Kernidee, Claim, Story, Formate) | svg |
| svg | 15.8 KB | Gemeinsame Helfer | src/engine/svg.ts, src/engine/palettes.ts (Farbe), src/engine/random.ts? | Zufall (Seed), Hash, Farbe/Kontrast, Paletten, SVG-Dokument |  |
| describe | 1.8 KB | Logo-Beschreibung | src/engine/describe.ts? | Bezeichnungen für Layouts, Schriftklassen, Themen, Stile | index |
| kitAssets | 277.9 KB | Unterlagen (Deliverables) und Kit | src/deliverables/{items,unio,export}.ts, src/deliverables/lib/energy.ts, src/postings/render/* (teilweise), src/ui/kit/* | Kit aus Konzept + Kontakt, Liste der Unterlagen, Vorschau/Seiten als SVG, PDF/ZIP-Export (Worker), QR-Code | energy, engine, imagesize, index, svg |
| own | 29.5 KB | Unterlagen: eigenes Design | src/deliverables/own*.ts? | Unterlagen im eigenen Design (OWN_DESIGN), E-Mail-Signatur | energy, imagesize, index, kitAssets, svg |
| imagesize | 8.0 KB | Unterlagen: Bild- und Farbhelfer | src/deliverables/lib/*? | Farbmischung, Kontrast, Bildgrößen | index, svg |
| energy | 1.3 KB | Energieausweis | src/deliverables/lib/energy.ts, src/postings/energy.ts | Energiezeile (HWB, fGEE, EEB, Klasse) und Pflichtprüfung |  |
| PostingsScreen | 53.8 KB | Postings (Ausbaustufe 6) | src/postings/{occasions,copy,caption,deliverable,export}.ts, src/postings/render/*, src/ui/postings/PostingsScreen.tsx | Anlässe, Formate, Looks, Rendern je Format/Seite, Bildtext, ZIP/Teilen | ObjectEditor, imagesize, index, kitAssets, library, svg, texts |
| ObjectEditor | 21.4 KB | Postings: Objekte | src/postings/{model,library}.ts, src/ui/postings/ObjectEditor.tsx | Objekt-Editor, Foto-Fokus, Fakten | energy, imagesize, index, library, objectData, photoStore, svg |
| library | 8.6 KB | Postings: Objekt-Bibliothek | src/postings/library.ts | Objekt-Modell, Validierung, Grenzen | index, objectData |
| objectData | 5.6 KB | Postings: Objektdaten | src/postings/model.ts? | Felder, Platzhalter, Energieklassen | energy, index |
| photoStore | 1.9 KB | Postings: Fotos | src/postings/photoStore.ts? | Fotos in IndexedDB | index |
| ObjectsScreen | 3.7 KB | Oberfläche | src/ui/postings/ObjectsScreen.tsx | Objektliste | ObjectEditor, index, library, photoStore |
| migrate | 4.4 KB | Speicher | src/ui/logic/migrate.ts? | Projekt-Migration, Sicherung lesen | index, library, objectData |
| index | 499.2 KB | App-Kern und Bibliotheken | src/ui/App.tsx, src/ui/logic/** (Store, Router, Speicher, Validierung), src/engine/fonts.ts + fonts.json + coverage.json, src/symbols/Icons.ts, src/engine/orte.ts, Bibliotheken React, opentype.js, polygon-clipping | Start, Zustand, Navigation, Projekt anlegen, Schriftkatalog, Schrift-Laden, Icons, Orte, Validierung |  |
| Gallery | 28.8 KB | Oberfläche: Galerie | src/ui/screens/Gallery.tsx | Galerie mit Seiten, Kuratierung, 'Namen auf die Probe stellen', KI-Rangfolge (art director) | NameCard, describe, engine, index, nameFinder, svg |
| Editor | 59.4 KB | Oberfläche: Editor | src/ui/editor/* | Logo-Editor (Schrift, Symbol, Layout, Farben, Varianten) | LogoView, describe, engine, index, kitAssets, objectData, photoStore, prewarm, svg |
| Kit | 43.8 KB | Oberfläche: Kit | src/ui/kit/* | Kit-Seite, Downloads, Markenplattform | LogoView, engine, index, kitAssets, library, objectData, photoStore, prewarm, svg |
| Kompass | 16.2 KB | Oberfläche: Markenkompass | src/ui/screens/Kompass.tsx | Fragen, Vorschauleiste | LogoView, engine, index, kompass, svg, texts |
| Routes | 17.9 KB | Oberfläche: drei Routen | src/ui/screens/Routes.tsx | Routen-Karten, Logos und Namen je Route | LogoView, NameCard, engine, index, kitAssets, kompass, nameFinder, svg, texts |
| NameFinder | 19.9 KB | Oberfläche: Namensfinder | src/ui/screens/NameFinder.tsx | Formular, Chargen, Namenskarten | NameCard, describe, index, nameFinder |
| NameCard | 11.4 KB | Oberfläche: Namenskarte | src/ui/components/NameCard.tsx, Einstellungen | Karte, Herz, Ausblenden, Einstellungen (kiFunktionen, intern, signatureEntwuerfe) | LogoView, engine, index, nameFinder |
| StyleScreen | 3.0 KB | Oberfläche: Stilwahl (S2) | src/ui/screens/StyleScreen.tsx | Stilwahl mit Vorschau | LogoView, describe, engine, index |
| LogoView | 0.7 KB | Oberfläche | src/ui/components/LogoView.tsx | Logo als SVG (Hook useLogoSvg) | engine, index |
| ProjectPreview | 0.6 KB | Oberfläche | src/ui/components/ProjectPreview.tsx | Projekt-Vorschau | LogoView, index |
| prewarm | 1.8 KB | Unterlagen | src/deliverables/prewarm.ts? | Vorwärmen der Exporte in Ruhephasen | kitAssets |
| render.worker | 815.1 KB | Unterlagen | src/deliverables/render.worker.ts | Rendern und PDF im Worker (enthält Engine, opentype, jsPDF) | (klassischer Worker) |
| zip.worker | 95.3 KB | Unterlagen | src/deliverables/zip.worker.ts? | ZIP im Worker (JSZip) | (klassischer Worker) |
| html2canvas, index.es, jspdf, purify, svg2pdf | | Bibliotheken | | von jspdf/svg2pdf nachgeladen | |

## 3. Kernfunktionen je Bereich

Diese Funktionen nutzt der Harness (`recovered/harness/golden.browser.js`); ihre Ausgaben liegen
als Referenz in `tests/golden/`.

### Logo-Engine (engine)

| Chunk | Name im Bundle | Export | vermuteter Originalname | Zweck |
|---|---|---|---|---|
| engine | Ga | g | generateConcepts(input, {count, page, seed, taste}) | Rezept-Konzepte einer Seite (StyleScreen ruft count 12, page 0) |
| engine | Tm | d | generatePage / Galerie-Pool(input, {page, seed, signatureEntwuerfe}) | Pool einer Galerie-Seite: Rezepte (pm), Signature (am), Monogramme (mm), Eingriffe (hm) |
| engine | pm | - | recipePool | Ga mit Auffüllen auf genug Formen |
| engine | am | - | signatureConcepts | Signature-Vorlagen als Konzepte, Varianten |
| engine | mm | - | drawnMonogramConcepts | gezeichnete Monogramme (nur bei zwei Initialen) |
| engine | hm | - | eingriffeConcepts | Buchstaben-Eingriffe (Feature-Flag Bt) |
| engine | Rm | b | curate(pool, input, fonts, n=6, {exclude, pinFirst}) | Kuratierung je Seite, Mischung nach Route (kindMix) |
| engine | cm | k | pageToPackage(page) | Seite -> Paket/Schritt |
| engine | zm | l | renderLogoSvg(concept, input, opts) mit LRU-Cache | SVG-String (LogoView-Weg) |
| engine | wm | - | renderLogo / layoutLogo | Layout und Glyphen-Pfade |
| engine | Gm | j | useLogoSvg (Hook) | rendert in Leerlaufzeiten mit Priorität |
| engine | Km | u | useFontsReady (Hook) |  |
| engine | pn | f | fontStore (Instanz von FontStore aus index) | lädt fonts/brand/*.woff, ensure(), has(), setTexts() |
| engine | Xe | r | fontsNeeded(concepts, 'logo'\|'all', input) |  |
| engine | dt | i | inputSeed(input) | Hash aus Name, Zusatz, Stilen, Farben, Themen |
| engine | tc / be | p / - | conceptId / withId | ID = 'c' + Hash des Konzepts ohne seed |
| engine | jn | K | checkLogo / quality | Qualitätspunkte ('Die Schriften enthalten alle Zeichen ...') |
| engine | gr, se, Oi, xn, Rs, gt, Is, Os, Vi, gm | L, -, N, O, -, U, a8, X, a0, a4 | route.ts: applyRoute, routeOf, Filter (Farben, Themen, Schriftformen, Signature), kindMix, passtZurRoute |  |
| engine | Cr | o | similarConcepts / variationsOf | 'Ähnlich wie Konzept' in der Galerie |
| engine | Lm | v | editorVariants | Varianten im Editor |
| engine | Nm | af | conceptsForName | Konzepte für einen Namen (Namenskarten, Routen) |
| engine | Am, Et, zc, Em, ui | x, T, A, y, z | tracking.ts: Optionen, Stufen (eng/normal/weit/sehrWeit), Einrasten |  |
| engine | $u, Cu, Gu | D, B, - | suffixPairings.ts | Zusatz-Paarungen (suffixPairings.json) |
| engine | qs, eo | h, R | cardFace, withCardBackground | Kartenfläche (paper/ink/primary) |
| engine | kn, Mn, sn, $ | q, ae, n, M | Namensformat, Namensteile, Initialen, Text säubern |  |
| engine | Nn, yu, wu | al, aj, ah | Farben auflösen, Tagline rendern, Schriften eines Konzepts |  |
| engine | cr, Ae, qt, ba, Js, sm, lm, um, Ul | V, G, W, J, ab, aa, ac, a9, - | signature/index.ts, render.ts, similarity.ts, varianten.ts | alle Vorlagen, holen, passt (inkl. Ähnlichkeitssperre zum Korpus), Parameter, Gewichtung |
| engine | Il, Ol, Bl, Vl, Zl, Cl, ws, Dl, Pl, Wl | -, ..., ad | signature/templates/{elegant,luxus,modern,mutig,natur,warm,kurz,mischung,kit,partner} | Vorlagen-Daten (siehe src/signature/templates/*.json) |
| engine | gs, ds, Bu, Gu, To/Io/Oo/Du | - | corpusMarks, corpusTechMarks, recipes.json, suffixPairings, signature/orte | Daten (siehe src/engine/*.data.json, src/signature/orte.json) |
| engine | xm, Zm, $m, Cm | e, c, m, a | Render-Warteschlange, Performance-Marken |  |

### Namen (nameFinder)

| Chunk | Name im Bundle | Export | vermuteter Originalname | Zweck |
|---|---|---|---|---|
| nameFinder | Rd | t | profileFromForm(form) | Profil aus Namensfinder-Formular |
| nameFinder | jd | e | generateNames(profile, {...form, seed}, batches) | Chargen (je 24 Namen, ha = 24) |
| nameFinder | Td, Kd | - | generateBatch, batchOptions |  |
| nameFinder | Yd | c | nameCards(names, seed, styles, entwuerfe, routeParams) | finale Logos je Name |
| nameFinder | Xd | b | fallbackCard | Karte, falls kein finales Logo |
| nameFinder | el | h | batchSeed(seed, i) | Hash `${seed}\|charge\|${i}` |
| nameFinder | Zd | p | pruefeEigenenNamen(name, ctx) | Länge, Aussprache, Verwechslung, Domain, Mitbewerber-Test, ... |
| nameFinder | _d | a | alternativenFuer(name, ctx, 6..12) |  |
| nameFinder | Gt | w | nameInput(name, styles) | LogoInput für Namenskarten |
| nameFinder | Fd, xt, Jd, Qd, $d | r, d, g, i, s | withRoute, kindToNameKind, toSaved, toCandidate, kindLabel |  |
| nameFinder | nn | o | keywordFieldsFor(stichwort) | kwFields.ts |
| nameFinder | kt, Id | q, m | brandable / Stil-Namen | Kunstwörter seitenweise (brandable.ts, styles.ts?) |
| nameFinder | rl, nl, al, tl, ul | l, u, j, n, k | Namen-Logoformen, Domain-Slug, Nähe-Marke, Ortsname |  |
| nameFinder | sl | f | kiNamenPruefung (src/namen/kiNamen.ts) | Server brand-namen, nur mit kiFunktionen |
| nameFinder | kn, vs, xa, mu, pu, Bs | - | wordsDb, keyword-fields.json, naming-rules.json, corpusNames, kwFields | Daten (src/engine/names/*.data.json, src/engine/reference/*.json) |

### Strategie (kompass, texts)

| Chunk | Name im Bundle | Export | vermuteter Originalname | Zweck |
|---|---|---|---|---|
| kompass | Dn | - (über r) | chooseRoutes(brief, {seed, mutiger}) | drei Routen A sicher, B mutig, C überraschend, mit Texten |
| kompass | Rn, Nn, In, Pn | - | pickRoutes, Signature-Zuteilung, Mischung |  |
| kompass | Yn | r | routesForState(state) |  |
| kompass | Qn | b | previewRoute(brief) | Vorschauleiste im Kompass |
| kompass | Pe, Ke, K, re | - | axesFromBrief, briefSeed, routeParams, territoryFit | axes.ts, territories.ts |
| kompass | nr | c | projectFromRoute(brief, route, name, opts) | 'Route vertiefen' mit eigenem Namen |
| kompass | rr | f | nameFinderFromRoute(form, brief, route) | 'Route vertiefen' ohne Namen |
| kompass | tr | a | routeLogos(routes, brief, seed, n=6) | Logos je Route |
| kompass | je, Zn, Xn, er, _n | d, k, p, s, t | applyRouteToInput, previewInput, mutiger, getTerritory |  |
| texts | xe | r | routeTexts(territory, brief, art, params) | Kernidee, Claim, Story, Formate |
| texts | R, Z, _, C, U, J, q, K, L, y, Re | K, R, d, S, L, F, e, W, i, P, b | catalog.ts: Schritte, Referenzwelten, Klischees, Stimmproben, Logo-/Farbpaare, Anti-Farben, Wunschkunden, Werte, Wirkung, Intro | Daten (src/strategy/catalog.json) |
| texts | re, Fe, le, Oe, ce, A, v, ge | f, a, c, k, h, w, t, g | Frage sichtbar, Antwort setzen/lesen, offene Fragen, Klischee finden, Wörter zählen, Text glätten, Claim-Regel (max. 5 Wörter) |  |

### Postings und Unterlagen

| Chunk | Name im Bundle | Export | vermuteter Originalname | Zweck |
|---|---|---|---|---|
| PostingsScreen | vn, De, xn | - | occasions.ts: ANLAESSE, FORMATE, LOOKS | Daten (src/postings/occasions.snapshot.json) |
| PostingsScreen | Pe, mt, Bt, Nt, ut, jn | - | defaultSelection, setOccasion, defaultOptions, Anlässe je Objekt, Checks |  |
| PostingsScreen | bt | - | renderPosting(kit, ctx, format, page) | SVG je Format und Seite |
| PostingsScreen | na, ea, ta, zt, Xn, Qe | - | Layout je Look (unio/eigen), Einzelbild, Karussell-Seiten |  |
| PostingsScreen | An, En, la, Pt, ca | - | caption.ts (Bildtext), ZIP, Teilen |  |
| kitAssets | ju | m | createKitAssets(concept, input, contact) | Kontext für Kit, Postings, Unterlagen |
| kitAssets | Et | M | buildKit(assets) | Farben, Schriften, Kontakt, Slug, Logo-Varianten (Cache) |
| kitAssets | la, ca, Fc, Kc | k, -, -, t | deliverables-Liste (unio/eigen), laden, Route-Unterlagen |  |
| kitAssets | Wu, Vu, cr | c, u, - | useKitFonts, useUnioFonts, UNIO-Schriften laden |  |
| kitAssets | Pu, lu, Ds, zc | - | ZIP/PDF-Export (Worker render.worker, zip.worker) |  |
| own | us, Ze, fs, ps, ns, Je | OWN_DESIGN, ... | eigenes Design, signatureHtml* |  |

### App-Kern (index)

| Chunk | Name im Bundle | Export | vermuteter Originalname | Zweck |
|---|---|---|---|---|
| index | Ik | b | createProject(form, time, id) | Projekt mit input (name, suffix, styles, ...) |
| index | i0, a0, s0, vo | c, -, -, - | Zusatz-Wahl, Rechtsform |  |
| index | Mg, rC, sC, iC, $L, _L, zL | -, -, a9, aa, ac, ad, ab | Namensfinder-Zustand (default, laden, speichern, Charge, Stichworte, gültig) |  |
| index | m1, hk, Mn, pk, Yn, gk, yk | - | fonts.ts (fonts.json, coverage.json, Dateinamen) |  |
| index | r4, CL, s4 | - | FontStore (opentype laden, Fallback-Glyphen) |  |
| index | iT, aT, lT, cT, hT, vT, xT, kT, fu | -, bt | symbols/Icons.ts, Container | Daten (src/symbols/*.json) |
| index | Yc, aC, oC, lC | - | engine/orte.ts | Daten (src/engine/orte.json) |
| index | Lg, ZT, Fg | aN, -, - | Validierung/Migration Kompass-Brief, Achsen, Route |  |
| index | e0, kL | -, J | Kontakt (leer), Kontakt des Projekts |  |
| index | HC, WC, VC | - | UI-Schriften (Power Grotesk, Outfit, JetBrains Mono) |  |

## 4. Daten (W1, verlustfrei gezogen)

| Datei | Quelle im Bundle | Zählung |
|---|---|---|
| src/engine/reference/names.json | nameFinder `kn` (verdichtet, 9 Spalten) | 5342 (Original-Felder teilweise verloren) |
| src/engine/names/wordsDb.data.json | nameFinder `kn` unverändert | 5342 |
| src/engine/reference/keyword-fields.json | nameFinder `vs` = {meta, cluster} | 79 Cluster |
| src/engine/reference/naming-rules.json | nameFinder `xa` (inkl. tech_muster) | 14 Abschnitte |
| src/engine/reference/corpus.json | nameFinder `mu` + engine `gs` | 330 Marken |
| src/engine/reference/corpus-tech.json | nameFinder `pu` + engine `ds` | 192 von 195 (3 nur im Hauptkorpus), 155 mit Logo-Merkmalen |
| src/engine/reference/recipes.json | engine `Bu` | 82 (IDs bis R84, R25 und R27 fehlen) |
| src/engine/fonts.json, coverage.json | index `m1`, `hk` | 105 (inkl. Outfit), 6 nur für Vorlagen |
| src/engine/palettes.json | svg `rt`, `ct`, `z` | Paletten und Farbstimmungen |
| src/symbols/icons.json, containers.snapshot.json | index `iT` ... `kT`, `fu` | Icons mit Zeichenfunktionen als Quelltext |
| src/signature/templates/*.json | engine `Il` ... `Wl` | 86 (72 freigegeben, 14 Entwürfe, davon 12 Partner) |
| src/strategy/territories.json, axes.json, catalog.json | kompass `mn` u. a., texts | 12 Territorien |
| recovered/data-snapshot/*.json | jede Daten-Bindung jedes App-Moduls | Funktionen als `{"$fn": Quelltext}` |

<!-- status-w3:start -->
## Status W3 (neuer Quellcode)

Von Hand gepflegt; `modulkarte.mjs` übernimmt diesen Abschnitt beim Neuerzeugen. Jede Entwicklerin
und jeder Entwickler trägt fertige Module hier ein. "bitgenau" = Tests vergleichen mit den
Funktionen der gesicherten Fassung (Test-Lader `tests/helpers/recovered.ts`:
`const old = await recovered("svg")` liefert alle Bindungen eines Chunks; für `index` und alles,
was index lädt, die Testdatei mit `// @vitest-environment jsdom` beginnen).

### Fundament (Teil 1)

| Modul | Stand | Exporte (alter Name im Bundle) | Tests |
|---|---|---|---|
| src/types.ts | fertig | Grundbegriffe `StyleKey`, `ColorMoodKey`, `SymbolTheme`, `ContainerKey`, `LayoutKey`, `BadgeKey`, `CaseKey`, `Divider`, `CardBackground`, `NameFormat`, `InputNameKind`, `NameKind`, `NameFocus`; Schriften `FontCat`, `FontForm`, `FontTag`, `FontRef`, `FontMeta`, `FontCoverage`; Farbe `Palette`, `PaletteRole`, `ConceptColors`, `SymbolColors`; Konzept `MonogramKonstruktion`, `IconSymbol`, `MonogramSymbol`, `SymbolSpec`, `TextStyle`, `TypoSup`, `TypoSplit`, `Eingriff`, `TypoDetails`, `SignatureRef`, `SignatureParams`, `LegalNaehe`, `LogoConcept`; `BrandInput`; `Contact`, `EnergyData`, `EnergyClass`, `Fact`, `ObjectData`, `KitObject`, `BrandAssets`, `NameCandidate`, `NameContext`; Wertelisten `STYLE_KEYS`, `COLOR_MOOD_KEYS`, `SYMBOL_THEMES`, `FONT_FORMS`, `NAME_FORMATS`, `NAME_FOCUS` (aus den Prüfungen `PL`, `IT`, `NT`, `OT`, `DL`, `UL`, objectData `L`) | tests/types.test.ts: Wertelisten wie alt, alle Referenz-Konzepte, Eingaben und Routen laufen unverändert durch die alten Prüfungen |
| src/strategy/types.ts | fertig | `AxisKey`, `AXIS_KEYS`, `AxisValue`, `AxisVector`, `Architecture`, `Erfahrung`, `Segment`, `Alternative`, `ReferenceWorld`, `Cliche`, `Wunschkunde`, `Wert`, `Wirkung`, `LogoPair`, `ColorPair`, `PairChoice`, `VoicePole`, `SocialBrief`, `BrandBrief`, `KompassState`, `KindMix`, `RouteParams`, `SocialKit`, `PersoenlichkeitsZug`, `FormatEmpfehlung`, `RouteTexts`, `RouteArt`, `RouteId`, `BrandRoute`, `Betonung`, `RouteRolle`, `Hauptachse`, `PostFormat`, `Territory` (aus `Lg`, `Fg`, `YT`, `JT`, `pC`, kompass `K`, texts `xe`) | wie oben |
| src/engine/rng.ts | fertig, bitgenau | `rng(seed): Rng` (`et`), `hash(text)` (`nt`) | tests/engine/rng-color-palettes.test.ts |
| src/engine/color.ts | fertig, bitgenau | `clamp01` (`H`), `normalizeHex` (`I`), `safeHex` (`P`), `sanitizePalette` (`yt`), `hexToRgb` (`q`), `rgbToHex` (`K`), `hexToHsl` (`T`), `hslToHex` (`W`), `mix` (`Q`), `luminance` (`G`), `contrast` (`Z`), `isDark` (`st`), `readableAccent` (`gt`), `ensureContrast` (`L`), `capSaturation` (`Y`) | dto. |
| src/engine/palettes.ts | fertig, bitgenau | `COLOR_MOODS` (`rt`), `COLOR_MOOD_KEYS` (`ot`), `STYLE_MOODS` (`ct`), `PALETTES` (`z`), `paletteBaseId` (`J`), `paletteMood` (`it`), `moodOfPaletteId` (`bt`), `finalizePalette` (`tt`), `jitterColor` (`j`), `varyPalette` (`U`), `pickPaletteForStyle` (`dt`), `paletteForMood` (`kt`), `moodsFor` (`ht`), `alternativePalettes` (`At`), `basePalettes` (`Et`); Typen `ColorMood`, `PaletteDef` | dto. |
| src/engine/svg.ts | fertig, bitgenau | `fmt` (`D`), `svgDocument` (`wt`), `placePart` (`Mt`), `parseTransform` (`mt`), `parseAttributes` (`pt`), `pathPoints` (`ft`), `arcPoints` (`Ft`), `svgBounds` (`xt`), `countShapes` (`Ct`); Typen `SvgPart`, `Box`, `Matrix`, `SvgDocumentOptions` | tests/engine/svg.test.ts (600 Referenz-SVGs, 400 Zufallspfade) |
| src/engine/fonts.ts | fertig, bitgenau | `ALL_FONTS` (`Mn`), `COVERAGE` (`hk`), `FONTS` (`pk`, wählbar), `getFont` (`Yn`), `getSelectableFont` (`QC`), `isSelectableVariant` (`JC`), `COMMON_FONTS` (`eL`), `CLICHE_THEMES` (`tL`), `fontFileName` (`gk`), `fontExtFileName` (`yk`), `fontKey` (`vk`), `hasSerifItalic` (`nL`), `italicVariant` (`rL`), `supportsCapSharpS` (`sL`), `FONT_GROUPS` (`iL`), `fontGroupOf` (`aL`) | tests/engine/fonts.test.ts |
| src/engine/charset.ts | fertig, bitgenau | `SUPPORTED_CHARS` (`kk`), `missingChars` (`pi`), `fontCovers` (`oL`), `needsExtendedCharset` (`Sk`) | dto. |
| src/engine/fontStore.ts | fertig, bitgenau | `class FontStore` (`r4`: `has`, `get`, `ensure`, `load`, `loadExt`, `setTexts`, `wantExt`, `subscribe`, `needsExt`, `version`), `mergeGlyphs` (`s4`), `createFontStore(base)` (`CL`), Typ `FontLoader`. Die Engine legt ihre Instanz selbst an (`pn = createFontStore()`) | dto. (Pfade mit und ohne latin-ext) |
| src/engine/text.ts | fertig, bitgenau | `applyCase` (`LL`), `normalizeText` (`pg`), `textPath` (`FL`), `textAdvance` (`o4`), `capHeight` (`ai`), `forgetTextPaths` (leert `Su`), Typ `TextPath` | dto. |
| src/engine/personName.ts | fertig, bitgenau | `TITLE_RE` (`bS`), `GENERIC_WORDS` (`ES`), `cleanName` (`g0`), `nameTokens` (`Ic`), `looksLikeCompany` (`v0`), `looksLikePerson` (`y0`), `isPersonName` (`TL`) | tests/engine/personName.test.ts |

Abweichungen zur Modulkarte oben: FontStore und Text-Pfade liegen in eigenen Dateien
(`fontStore.ts`, `text.ts`), damit es keinen Kreis zwischen Katalog und Zwischenspeicher gibt; der
Zufall heißt `rng.ts` (nicht `random.ts`), Farbe `color.ts` getrennt von `palettes.ts`.
Nicht im Fundament (bleiben bei der Logo-Engine): Symbole, Icons und Rahmen (`iT` ... `kT`, `fu`,
`ST`, `wT`, `OL`, `IL`), Monogramm aus Schrift (`p4`, `ML`), Polygon-Operationen (`xs`, `br`, ...).
Bei der Oberfläche: Projekt-Typ und Prüfungen (`Ik`, `PL`, `DL`, migrate `C`), Namens-Prüfung (`Tk`, `ou`).

### Signature-Vorlagen (src/signature, Entwickler "Signature")

Stand: fertig, bitgenau. Zuständig für engine-Chunk Zeilen 236 bis 2274 und 3495 bis 11069
(Abstimmung mit der Logo-Engine über den Koordinator). Die Logo-Engine importiert aus
`src/signature` (index.ts bündelt alle Module). Die Vorlagen bleiben Daten in
`src/signature/templates/<gruppe>.json` (elegant, luxus, modern, mutig, natur, warm, kurz,
mischung, kit, partner; `verworfen.json` = zurückgezogen).

| Modul | Stand | Exporte (alter Name im Bundle, Export-Buchstabe) | Tests |
|---|---|---|---|
| src/signature/types.ts | fertig | `SignatureTemplate`, `Element` = `TextElement` oder `FormElement` (`LinieElement`, `ZugElement`, `RechteckElement`, `KreisElement`, `BogenElement`, `PfadElement`, `ReiheElement`), `Passt` (inkl. `partnerArten`, `nameZuInitial`), `Freigabe`, `Merkmale`, `Schriften`, `Farben`, `Variante`, `Ausdruck`, `Kante`, `Kanten`, `Rolle`, `SignatureOp`, `SignatureLayout`, `SignatureFontSet`, `SignatureColors`, `FitResult`, `FitOptions`, `RenderOptions`, `Rect`; `SignatureParams` (mit `zusatzMassstab`, `zusatzSchreibung`) aus src/types.ts | tests/signature/signature.test.ts (Daten mit `toStrictEqual` gegen `Il` ... `Wl`) |
| src/signature/partner.ts | fertig, bitgenau | `partnerName` (`vi`), `PARTNER_LABEL` (`$o`), Typen `PartnerArt`, `PartnerName` | dto. |
| src/signature/orte.ts | fertig, bitgenau | `ORTE` (`ns`), `BEZIRKE`, `STAEDTE`, `ORTE_LAND` (`To`, `Io`, `Oo`), `BEZIRKSNUMMERN` (`Du`), `normOrt` (`Dt`), `findOrt` (`xi`), `koordinaten` (`Bo`), `postleitzahl` (`Vo`), `bezirksnummer` (`Fo`), `bezirkAusText` (`Hu`, Angebot an die Logo-Engine für die Hochzahl) | dto. |
| src/signature/nameParts.ts | fertig, bitgenau | `nameParts` (`Mn`, `ae`), `splitSyllables` (`ts`, Silbentrennung nach deutschen Regeln), `splitTitles` (`st`), `initialOf` (`We`), `partnerPair` (`Do`), Typen `NameParts`, `FieldName` | dto. |
| src/signature/render.ts | fertig, bitgenau | `layoutSignature` (`ft`), `renderTemplate` (`il`, mit Zwischenspeicher je Schriftspeicher), `templateFonts` (`sr`, `H`), `templateFontRefs` (`rs`), `signatureColors` (`tl`), `signatureInitials` (`os`), `hasYellowAndRed` (`ss`), `ZUSATZ_FELDER` (`ur`, `Z`), `zusatzSchreibungen` (`qo`, `I`), `checkFit` (`hl`), Typen `FontSource`, `SignatureInput` | dto.: Layout und SVG aller 86 Vorlagen und ihrer Varianten mit 25 Testmarken (auch Partner-Namen), mehrere Varianten und Ausschnitte |
| src/signature/varianten.ts | fertig, bitgenau | `FEINHEIT` (`ls`, f1 bis f4 live), `STRUKTUR` (`ms`, s1 bis s4 als Entwurf), `STRUKTUR_FREIGEGEBEN` (`gl`), `VARIANT_SEP`, `splitVariantId` (`hs`, `Y`), `buildVariant` (`fs`), `templateVariants` (`bl`), `varianteBleibtFrei` (`Yl`); IDs `<vorlage>--<code>` | dto. |
| src/signature/index.ts | fertig, bitgenau | `ALL_TEMPLATES` (`cr`, `V`), `TEMPLATE_GROUPS` (`Il` ... `Wl`), `KIT_TEMPLATES` = `KURZNAMEN` (`ws`, `ad`), `ZURUECKGEZOGEN` (`jl`), `withZusatzSchriften` (`Ul`), `getSignatureTemplate` (`Ae`, `G`), `fits` (`qt`, `W`), `signatureConcept` (`ba`, `J`), `renderSignature` (`Ql`), `signatureFonts` (`Ni`) | dto. und tests/signature/golden.test.ts (alle Signature-Logos in tests/golden/logo und tests/golden/names byte-gleich) |
| src/signature/uebergang.ts | Übergang | Kopien von `cleanText` (`$`), `resolveColors` (`Nn`), `corpusTwinName` (`Al`), `fontMonogramSvg` (index `p4`), bis die Logo-Engine sie liefert (src/engine/cleanText.ts, renderLogo.ts, highend.ts, src/symbols/monogram.ts); danach wird die Datei entfernt | bitgenau geprüft in signature.test.ts |

Designer-Regeln als Tests (tests/signature/regeln.test.ts): Laufweiten (gemischt und klein höchstens
0,06 em, alles zwischen -0,05 und 0,5 em), Paletten vorhanden, Ausdrücke beziehen sich nur auf
Elemente der Vorlage, bei passenden Marken keine Probleme und endliche Lage, der Zusatz überlappt
weder Namen noch gefüllte Zeichen, Linien von `name.l` bis `name.r` genau in Namensbreite, kleiner
Zusatz mit Abstand zur Unterlänge, feine Varianten mit Mindest-Linienstärke 2,4 und Zusatz-Laufweite
0,16 bis 0,28 em, Varianten-IDs und Freigabe.

Bleiben bei der Logo-Engine (hängen an Route und Galerie): `am`, `om`, `sm`, `lm`, `Js`, `um`,
`Qs`, `Hr` (Auswahl und Gewichtung der Vorlagen je Seite), Konzept-Ähnlichkeit `bs`, `Ei`, `Ml`
und die Ähnlichkeitssperre `Al` (highend.ts). `similarity.ts` entfällt deshalb in src/signature.

### Strategie (src/strategy, server, Entwickler "Strategie")

Abgleich: `chooseRoutes` gegen tests/golden/strategy/routes.json (10 Briefe, Standard-Seed und
Seed 7) bitgenau; dazu 1650 erfundene Briefe gegen die gesicherte Fassung (`Dn`, `Pe`, `Qn`,
`Oe`, `re`, `le`, `Fe`, Routes `Me`, `Ae`) ohne Abweichung.

| Modul | Stand | Exporte (alter Name im Bundle) | Tests |
|---|---|---|---|
| src/strategy/catalog.ts | fertig, bitgenau | `KOMPASS_INTRO` (`Re`), `KOMPASS` (`R`), `ONLYNESS_KARTEN` (`I`), `ALTERNATIVEN` (`V`), `REFERENZ_WELTEN` (`Z`), `KLISCHEES` (`_`), `STIMM_PAARE` (`C`), `LOGO_PAARE` (`U`), `FARB_PAARE` (`J`), `FARB_WELTEN` (`q`), `FOKUS_OPTIONEN` (`Y`), `ARCHITEKTUR_OPTIONEN` (`X`), `ERFAHRUNG_OPTIONEN` (`Q`), `SEGMENT_OPTIONEN` (`ee`), `WUNSCHKUNDEN` (`K`), `WERTE` (`L`), `PERSOENLICHKEIT` (`y`), `FORMATE` (`T`), `KANAELE` (`ie`), `frageById` (`F`), `frageSichtbar` (`re`), `antwortSetzen` (`Fe`), `antwortLesen` (`le`), `kompassFortschritt` (`Oe`) | tests/strategy/catalog.test.ts |
| src/strategy/texts.ts | fertig, bitgenau | `routeTexts` (`xe`), `socialKit` (`Pe`), `persoenlichkeit` (`ye`), `wunschkunde` (`Te`), `versprechen` (`Ke`), `formate` (`Ie`), `findCliche` (`ce`), `countWords` (`A`), `cleanText` (`v`), `isValidClaim` (`ge`), `GEDANKENSTRICH` (`de`), `KLISCHEE_MUSTER` (`he`), `fillTemplate` (`z`), `mitPraeposition` (`W`) | tests/strategy/texts.test.ts |
| src/strategy/territories.ts | fertig | `TERRITORIES` (`ee`), `territoryById` (`_n`), `VORLAGEN_GESPERRT` (`fn`) | |
| src/strategy/params.ts | fertig, bitgenau | `resolveRouteParams` (`K`), `territoryFit` (`re`), `avoidFromBrief` (`cn`), `goldPaletteIds` (`dn`), `clearlyDifferent` (`vn`), `fontClassOf` (`U`), `colorFamilyOf` (`ne`), `mainKindOf` (`ye`), `fontCategoryOf` (`zn`), `FONT_FORM_AXES` (`C`) | über routes/axes |
| src/strategy/axes.ts | fertig, bitgenau | `briefToAxes` (`Pe`), `briefSeed` (`Ke`), `stableKey` (`ie`), `axisDistance` (`Me`), `briefPreviewParams` (`Qn`), `AXIS_WEIGHTS` (`x`) | tests/strategy/axes.test.ts |
| src/strategy/routes.ts | fertig, bitgenau | `chooseRoutes` (`Dn` mit `Rn`, `Gn`, `Fn`, `Nn`, `In`, `Pn`), `routeToBrandInputPatch` (`Tn`), `routeToNameInput` (`Ln`) | tests/strategy/routes.test.ts |
| src/strategy/kiTexte.ts | fertig, bitgenau | `kiTexte` (Routes `Fe`), `buildStrategieRequest` (`Me`), `pruefeKiTexte` (`Oe`), `mergeKiTexte` (`Ae`), `hatKontaktdaten` (`De`), `KI_TEXTE_ENDPOINT` (`Re`), `KI_TEXTE_TIMEOUT_MS` (`Ke`) | tests/strategy/kiTexte.test.ts |
| src/strategy/index.ts | fertig | öffentliche API: `emptyBrief`, `briefToAxes`, `briefPreviewParams`, `chooseRoutes`, `routeToBrandInputPatch`, `routeToNameInput`, Katalog, Texte, KI-Texte | |
| server/brand-strategie.js (+ .d.ts) | neu (fehlte in der Sicherung) | Vercel-Function: `createHandler`, `readConfig`, `validateRequest`, `testAntwort`, `bremse`, `rufeModell`, `LEITFADEN`, `ANTWORT_SCHEMA`; Standard-Export ist der Handler | tests/strategy/server.test.ts |

Abweichung zur Modulkarte oben: `K` und `re` liegen in `params.ts` (nicht in axes.ts oder
territories.ts), damit territories.ts reine Daten bleibt und kein Kreis entsteht.
Erwartete Schnittstellen anderer Bereiche: `ALL_TEMPLATES` (alt `cr`), `fits`, Typ `SignatureTemplate`
aus `src/signature` (Signature), `templateBlocked(template, input)` aus `src/engine/route.ts`
(Logo-Engine, alt `Os`, Export `X`), `keywordFieldsFor(text)` aus `src/engine/names/kwFields.ts`
(Namen, alt `nn`, Export `o`, Ergebnis Cluster mit `id`). Nicht in der Strategie (Oberfläche oder
Engine): `routeLogos` (`tr`), `projectFromRoute` (`nr`), `nameFinderFromRoute` (`rr`),
`previewInput` (`Zn`, `Xn`), `applyRouteToInput` (`je`), `routesForState` (`Yn`), `shiftMutiger` (`er`).

### Namen (src/engine/names.ts, src/engine/names/**, src/namen, server, Entwickler "Namen")

Abgleich: tests/golden/names bitgenau (8 Marken, 3 Seeds, ohne und mit Route: Profil, alle
Chargen, `pruefeEigenenNamen`, `alternativenFuer` (12), Vergleich über JSON samt Feldreihenfolge);
dazu 63 Vergleiche mit der gesicherten Fassung (`kt` mit Kreativität, Chips, Vorlieben, Filtern;
`Id`, `Zd`, `_d`, `wd`, `nn`, Formular-Helfer) ohne Abweichung. Tempo: eine Charge mit 24 Namen
im Median etwa 37 ms (Node, warm; alte Fassung etwa 55 ms). Namenskarten (`Yd`, `Xd`, `rl`, `Sd`) liegen bei der
Logo-Engine (src/engine/nameCards.ts) und nutzen `nameInput`, `inputNameKind`, `batchSeed` aus
names/finder.ts.

| Modul | Stand | Exporte (alter Name im Bundle) | Tests |
|---|---|---|---|
| src/engine/names.ts | fertig, bitgenau | `generateNames` (`kt`, Export `q`), `similarNames` (`Id`, `m`), `alternativenFuer` (`_d`, `a`), Typ `NameOptions`; reicht weiter: `NAME_KINDS` (`ti`), `NameInput`, `NameSuggestion`, `pruefeEigenenNamen` (`Zd`, `p`), `NamensPunkt`, `NamensPruefung`, `pruefeFremdnamen` (`wd`), `parsePerson` (`rr`), `parseCompany` (`Hn`), `shortForm` (`ad`), `keywordFieldsFor` (`nn`, `o`), `NAME_STYLES` (`Pa`), `CREATIVITY` (`Od`, `C`), `domainsFor` (`fn`) | tests/engine/names/golden.test.ts, vergleich.test.ts, regeln.test.ts |
| src/engine/names/profile.ts | fertig, bitgenau | `buildProfile` (`nr`), `NAME_KINDS` (`ti`), Typen `NameInput`, `NameRoute`, `NameAnchor`, `NameProfile` | dto. |
| src/engine/names/person.ts | fertig, bitgenau | `parsePerson` (`rr`), `parseCompany` (`Hn`, `$n`), `shortForm` (`ad`), `usableInitials` (`Za`), `PLACE_TOKENS` (`ze`), `TITLE_RE` (`Va`), `PARTICLES` (`gr`), `MAX_NAME_LENGTH` (`xe`) | regeln.test.ts |
| src/engine/names/candidate.ts | fertig, bitgenau | `makeCandidate` (`re`), `suffixFor` (`_`), `tagAllowed` (`Se`), `tagFit` (`ln`), `toneOf` (`qe`), `displayKind` (`Jn`), `inSlot` (`xr`), `chance` (`Ce`), `lucky` (`tr`), `profileKey` (`hr`), `stylesFit` (`ur`), `estateFits` (`sr`), `fitsPlace` (`nt`), `partsOf` (`je`), `KNOWN_WORDS` (`ir`), `REJECTED_NAMES` (`Ca`) | dto. |
| src/engine/names/generators.ts | fertig, bitgenau | `GENERATORS` (`Ze`), `personNames` (`Ya`, `Li`), `initialNames` (`Xa`), `placeNames` (`Fr`), `classicNames` (`Fi`), `wordNames` (`ut`, `$i`), `freeNames` (`et`), `ownBrandNames` (`lt`), `ESTATE_WORDS` (`Xn`); intern `Yn`, `Pi`, `Kr`, `at`, `Ci`, `tt`, `Ji`, `Qi`, `Xi`, `rd`, `td` | dto. |
| src/engine/names/batch.ts | fertig, bitgenau | `createStream` (`on`), `toSuggestion` (`gt`), `inputSeed` (`Yr`), `routeSeed` (`bt`), `styleOfName` (`ct`), `PAGE_SIZE` (`ae`), Typen `NameSuggestion`, `NameStream`, `StreamOptions` | dto. |
| src/engine/names/check.ts | fertig, bitgenau | `pruefeEigenenNamen` (`Zd`), `pruefeFremdnamen` (`wd`, `gd`), `looksLikePersonName` (`vt`), `brandPart` (`Wt`), `GATTUNGSWOERTER` (`xn`), `FLOSKEL` (`zt`) | dto. |
| src/engine/names/finder.ts | fertig, bitgenau | `inputFromForm` (`Rd`, `t`), `generateBatches` (`jd`, `e`), `generateBatch` (`Td`), `batchOptions` (`Kd`), `splitList` (index `_L`), `BATCH_SIZE` (`ha`, `B`), `LEARN_AFTER` (`Ud`, `A`), `NAME_CHIPS` (`Ht`, `N`), `DISLIKE_REASONS` (`Cd`, `H`), `kindLabel` (`$d`, `s`), `fromSaved` (`Jd`, `g`), `toSaved` (`Qd`, `i`), `nameInput` (`Gt`, `w`), `withRoute` (`Fd`, `r`), `inputNameKind` (`xt`, `d`), `batchSeed` (`el`, `h`), `umlautDomain` (`nl`, `u`), `domainKey` (`al`, `j`), `naeheHint` (`tl`, `n`) | dto. |
| src/engine/names/rules.ts | fertig, bitgenau | `HANDEL_AMT` (`Mu`), `protectedTermOf` (`Te`), `KONZERNE` (`Hu`), `HANDELSKETTEN` (`ka`), `tradeBrandOf` (`Ue`), `isRetailBrand` (`va`), `CLICHES` (`fu`), `clicheOf` (`Ge`), `COMPETITORS` (`Su`), `competitorMatch` (`$e`), `OFFENSIVE` (`Eu`), `offensiveOf` (`wr`), `corpusMatch` (`_r`), `corpusMatchLabel` (`Tu`), `techMatch` (`Du`) | regeln.test.ts |
| src/engine/names/quality.ts | fertig, bitgenau | Wortfelder `placeFieldOf` (`pa`), `fieldFit` (`cn`), `wordClassOf` (`bu`); Laut `syllables` (`Le`), `pronounceable` (`lr`), `softness` (`Or`), `maxConsonantRun` (`Ve`), `maxVowelRun` (`Bn`), `nameWords` (`Na`); Sperren `wordWeakness` (`Da`, Maengelwoerter und -werck-Regel), `SPERRWOERTER` (`In`), `SCHWACHE_WOERTER` (`Zn`), `isGenericWord` (`Vr`), `isStrongCoinage` (`ai`) | dto. |
| src/engine/names/tech.ts | fertig, bitgenau | `TECH_RULES` (`dr`), `readTechRules` (`us`), `appRuleOf` (`is`), `techScore` (`ds`), `vowelPattern` (`Dn`), `hardCount` (`Aa`) | dto. |
| src/engine/names/brandable.ts | fertig, bitgenau | `BRAND_RULES` (`Ne`), `brandableFrom` (`$s`), `isBrandableWord` (`_s`), `hasBadEnding` (`Wn`), `negativePattern` (`vr`), `letterVariant` (`js`), `endingKey` (`On`) | über golden/vergleich |
| src/engine/names/styles.ts | fertig | `BILDWOERTER` (`zr`), `BILDWORT` (`mn`), `SAETZE` (`pn`), `ECHTE_WOERTER` (`Cr`), `FOREIGN` (`$r`), `COMPOUND_HEADS` (`ar`), `COMPOUND_TAILS` (`pr`), `ROOTS` (`kr`), `COINED` (`wn`), `OLD_SPELLINGS` (`Fn`), `NAME_STYLES` (`Pa`), `CREATIVITY` (`Od`), `WORD_ORIGIN` (`Fe`), `LEXICON_BY_KEY` (`Br`), `isCompound` (`Hr`), `placeFieldOfName` (`Gn`) | dto. |
| src/engine/names/kwFields.ts | fertig, bitgenau | `KEYWORD_FIELDS` (`vn`), `keywordFieldsFor` (`nn`), `keywordFieldById` (`mi`) | vergleich.test.ts |
| src/engine/names/lexicon.ts | fertig | `LEXICON` (`Sn`), `lexSkip` (Filter von `Sn`), `isTabu` (`Sr`), `isCommonWord` (`ks`), `LANG_NAMES` (`ms`), `FIELD_STYLES` (`qn`) | regeln.test.ts |
| src/engine/names/wordsDb.ts, wordsDbFormat.ts | fertig | `WORDS_DB` (`kn`), Typ `WordsDbRow`, `FLAG` (`Ea` ... `ws`), `level`, `isKeywordOnly`, `BIO_RE` (`fs`) | regeln.test.ts |
| src/engine/names/corpusNames.ts | fertig | `CORPUS_BRANDS` (`mu`), `TECH_BRANDS` (`pu`) | |
| src/engine/names/rating.ts | fertig, bitgenau | `highendScore` (`Hi`), `features` (`$a`, `Wi`), `highendFromFeatures` (`ja`), `FEATURES` (`Si`) | über golden |
| src/engine/names/fold.ts, domains.ts | fertig, bitgenau | `fold` (`g`), `flat` (`oe`), `letters` (`La`), `letterCount` (`ge`), `levenshtein` (`Bu`), `levenshteinMax` (`fa`), `memo` (`Jr`); `domainsFor` (`fn`), `slug` (`Pn`) | dto. |
| src/engine/orte.ts | fertig | aus index: `PLACES` (`uC`), `DISTRICTS` (`Yc`), `CITIES` (`oC`), `STATES` (`aC`), `REGIONS` (`lC`), `resolvePlace` (`GL`), `placeClass` (`HL`), `isWineRegion` (`WL`), `keywordsFromText` (`nC`), `PLACE_SUGGESTIONS` (`Nu`), `suggestedPlace` (`VL`) | über golden |
| src/namen/kiNamen.ts | fertig, bitgenau | `kiNamen` (`sl`, Export `f`), `fetchKiNamen` (`Md`), `requestFromForm` (`ul`, `k`), `normalizeRequest` (`Ad`), `parseResponse` (`Ed`), `inputFromRequest` (`Ld`), `KI_NAMEN_ENDPOINT` (`Hd`), `KI_NAMEN_TIMEOUT_MS` (`Gd`), `KI_NAMEN_ARTEN` (`Bt`) | tests/namen/kiNamen.test.ts |
| server/brand-namen.js (+ .d.ts) | neu (fehlte in der Sicherung) | Vercel-Function `/api/brand-namen`: `createHandler`, `readConfig`, `validateRequest`, `bereinigeNamen`, `testAntwort`, `bremse`, `rufeModell`, `LEITFADEN`, `ANTWORT_SCHEMA`; Standard-Export ist der Handler | tests/namen/kiNamen.test.ts |
| scripts/names-db.ts | fertig | erzeugt `wordsDb.data.json`, `corpusNames.data.json`, `corpusTechMarks.data.json` byte-gleich aus src/engine/reference; `--check` vergleicht (`npx vite-node scripts/names-db.ts`) | |

Abweichungen zur Modulkarte oben: `kt` ist `generateNames` (nicht "brandable"), `Id` sind ähnliche
Namen (nicht Stil-Namen). Zusätzliche Dateien gegenüber der Liste: profile, person, candidate,
generators, batch, check, finder, fold, domains (die frühere names.ts war ein großer Block).
`src/engine/orte.ts` (eigentlich index-Chunk) ist hier entstanden, weil der Namensfinder ihn
braucht; die Oberfläche nutzt ihn mit. Offen: `reference/names.json` hat nur die 9 Spalten der
verdichteten Datenbank (id, typ, position, stichwort_felder des Originals fehlen, Spalte 6 wird
nicht gelesen).

<!-- status-w3:end -->

## 5. Anhang: alle Exporte und größte Funktionen je Chunk

Spalten: Name im Bundle, Export, Art, Größe in Zeichen, Hinweis (erste deutsche Zeichenkette).

### nameFinder (1137.9 KB)

Importiert: engine, index, svg

Exporte (27):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| nn | o | Function | 110 |  |
| Od | C | Array | 237 | Mehr Kunstwörter und überraschende Ideen |
| kt | q | Function | 391 |  |
| Id | m | Function | 763 |  |
| Zd | p | Function | 7621 | Gib zuerst einen Namen ein, dann prüfen wir ihn in sieben Punkten. |
| _d | a | Function | 1924 | Nur der Rufname mit dem Nachnamen: kürzer und trotzdem ganz deiner. |
| ha | B | Literal | 5 |  |
| Ud | A | Literal | 4 |  |
| Ht | N | Array | 1149 | Kurz und prägnant |
| Cd | H | Array | 113 | Klingt komisch |
| $d | s | Function | 249 |  |
| Rd | t | Function | 488 |  |
| jd | e | Function | 68 |  |
| Jd | g | Function | 182 |  |
| Qd | i | ArrowFunction | 91 |  |
| Gt | w | Function | 148 |  |
| Fd | r | Function | 43 |  |
| xt | d | ArrowFunction | 54 |  |
| Yd | c | Function | 238 |  |
| Xd | b | Function | 243 |  |
| el | h | ArrowFunction | 31 |  |
| rl | l | Function | 1304 |  |
| nl | u | Function | 189 |  |
| al | j | ArrowFunction | 56 |  |
| tl | n | Function | 222 | gleich wie |
| ul | k | Function | 441 |  |
| sl | f | Function | 134 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| on | Function | 7333 | svg.d, svg.h |  |
| re | Function | 5938 | index.l, svg.d, svg.h | ist auch der Name eines bekannten Unternehmens. Mit Vornamen bleibt es eindeutig |
| Fr | Function | 3754 |  | Sagt in drei Wörtern, was du tust und wo, das versteht jeder sofort. |
| Ya | Function | 3597 |  | Dein voller Name ist die ehrlichste Marke: Kunden wissen sofort, mit wem sie es  |
| nr | Function | 3166 | index.aq, index.ar, index.as, index.l |  |
| Sd | Function | 2518 | engine.$, engine.L, engine.M, engine.R, engine._, engine.a0 | Keine Karte fuer |
| wd | Function | 2162 | index.l, svg.h | ist ein Vorschlag der Namensfunktion, geprüft mit denselben Regeln wie alle ande |
| Ns | Function | 2084 |  | hebt sich lesbar ab |
| Fi | Function | 1641 |  | Klassisch und etabliert, passt aber nur, wenn es wirklich Partner gibt. |
| Li | Function | 1559 |  | Dein Firmenname bleibt, |
| us | Function | 1458 |  |  |
| Bd | Function | 1458 | engine.H, engine.J, engine.O, engine.V, engine.W, engine.X |  |
| rd | Function | 1436 | svg.d, svg.h | Kunstwort aus |
| Pi | Function | 1412 | svg.d, svg.h | Abgeleitet von |
| Yn | Function | 1403 | svg.h | ergeben ein klares Bild |

### index (499.2 KB)

Importiert: -

Exporte (150):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| C | r | Member | 12 |  |
| y | j | Member | 12 |  |
| bt | az | Function | 1058 |  |
| e0 | a1 | ArrowFunction | 95 |  |
| u1 | Y | Function | 522 |  |
| c1 | X | Function | 130 |  |
| f1 | Z | Function | 81 |  |
| t0 | $ | Function | 77 |  |
| d1 | _ | Function | 91 |  |
| h1 | a0 | Literal | 6 |  |
| Ai | a3 | Object | 303 | Diese Nummer sieht unvollständig aus. Beispiel: +43 660 123 45 67 |
| p1 | a4 | Function | 169 |  |
| qC | V | Function | 248 |  |
| XC | K | Function | 83 |  |
| ZC | a2 | Function | 108 |  |
| YC | N | Function | 66 |  |
| pk | A | Call | 165 |  |
| QC | bo | Function | 39 |  |
| JC | ak | Function | 149 |  |
| eL | bk | Array | 85 |  |
| tL | bl | Array | 46 |  |
| Yn | a | Function | 92 |  |
| vk | z | Function | 72 |  |
| nL | bs | Function | 93 |  |
| rL | bm | Function | 191 |  |
| sL | bf | Function | 86 |  |
| iL | F | Array | 316 |  |
| aL | bn | Function | 63 |  |
| pi | l | Function | 215 |  |
| oL | k | Function | 166 |  |
| ou | I | Function | 297 | Unsere Logo-Schriften können |
| ua | v | ArrowFunction | 45 |  |
| Tk | E | Function | 127 |  |
| Lk | a5 | Function | 245 |  |
| lL | g | ArrowFunction | 31 |  |
| Mk | w | Function | 75 |  |
| r0 | aK | Literal | 4 |  |
| Rk | a_ | Array | 68 |  |
| uL | aV | Array | 60 |  |
| cL | aZ | Array | 71 |  |
| fL | ai | Function | 324 |  |
| dL | n | ArrowFunction | 141 |  |
| hL | d | Function | 211 |  |
| i0 | c | Function | 136 |  |
| o0 | aU | Function | 99 |  |
| Ik | b | Function | 932 |  |
| l0 | H | Function | 299 |  |
| pL | s | Function | 208 |  |
| mL | h | Function | 221 |  |
| u0 | e | ArrowFunction | 39 |  |
| gL | t | Function | 157 |  |
| vL | o | Function | 318 |  |
| yL | B | Function | 266 |  |
| xL | U | Function | 100 |  |
| kL | J | Function | 117 |  |
| lr | W | Function | 46 |  |
| _a | aE | Literal | 24 |  |
| Ak | aT | Literal | 22 |  |
| Mc | aD | Function | 133 |  |
| Wk | aS | Class | 24 |  |
| Vk | Q | Array | 40 |  |
| Kk | aW | Function | 174 |  |
| qk | an | Literal | 4 |  |
| za | f | Function | 1084 |  |
| Zt | u | Function | 94 | StudioProvider fehlt |
| Rc | D | Function | 1370 | small dlg-sub |
| Hr | P | Call | 337 |  |
| Yo | G | Call | 154 |  |
| Oc | T | Call | 153 |  |
| d0 | x | Function | 380 |  |
| nS | C | Function | 499 |  |
| SL | ah | Function | 297 |  |
| rS | m | Function | 476 |  |
| wL | L | Function | 225 |  |
| bL | S | Function | 283 |  |
| pd | q | Call | 549 | label field-label |
| sS | M | Function | 1361 |  |
| p0 | R | Function | 205 |  |
| oS | av | Function | 165 | Download nicht gespeichert: |
| uS | a8 | Function | 67 |  |
| vS | O | Function | 624 | btn btn-text save-status is-error |
| EL | a7 | Function | 811 | disclosure before-decide mark-legal |
| bS | a$ | Literal | 61 |  |
| ES | b2 | New | 452 |  |
| y0 | bh | Function | 245 |  |
| TL | i | Function | 102 |  |
| fu | bt | Array | 2073 |  |
| ii | ax | Call | 112 |  |
| s4 | ay | Function | 473 |  |
| CL | bv | Function | 183 | Schrift konnte nicht geladen werden: |
| LL | aw | Function | 402 |  |
| pg | be | Function | 72 |  |
| FL | aB | Function | 527 |  |
| o4 | aC | Function | 210 |  |
| ai | aA | Function | 106 |  |
| p4 | b0 | Function | 706 |  |
| ML | bg | Function | 520 |  |
| G4 | b4 | Function | 884 |  |
| Er | b9 | Function | 95 |  |
| H4 | b3 | Function | 333 |  |
| xs | b6 | ArrowFunction | 40 |  |
| br | b7 | ArrowFunction | 45 |  |
| bh | b8 | ArrowFunction | 57 |  |
| NL | bd | ArrowFunction | 21 |  |
| Ar | bc | ArrowFunction | 57 |  |
| ko | b5 | Function | 198 |  |
| li | ba | Function | 275 |  |
| wg | bb | Function | 257 |  |
| Y4 | bq | Array | 47 |  |
| nT | br | Array | 29 |  |
| RL | bu | Function | 199 |  |
| qc | p | Array | 52 |  |
| ST | b1 | Function | 103 |  |
| wT | bj | Function | 51 |  |
| OL | bp | Function | 135 |  |
| IL | bi | Function | 505 |  |
| se | aI | Class | 110 |  |
| ue | aF | Function | 86 |  |
| X | aG | Function | 255 |  |
| qe | aJ | Function | 99 |  |
| Vr | aL | Function | 93 |  |
| Y | aR | Function | 81 |  |
| Re | aY | Function | 139 |  |
| PL | aQ | Function | 1669 |  |
| DL | aH | Function | 672 |  |
| PT | y | Function | 110 |  |
| UL | aP | Function | 555 |  |
| AL | aX | Function | 301 |  |
| BL | aO | Function | 449 |  |
| Lg | aN | Function | 2517 |  |
| JT | aM | Function | 300 |  |
| $L | ac | Function | 190 |  |
| _L | ad | Function | 133 |  |
| nC | at | Function | 405 |  |
| zL | ab | ArrowFunction | 124 |  |
| sC | a9 | Function | 73 |  |
| iC | aa | Function | 70 |  |
| jL | aj | Function | 54 |  |
| uC | ap | Array | 28 |  |
| GL | aq | Function | 793 |  |
| HL | as | Function | 198 |  |
| WL | ar | Function | 37 |  |
| VL | au | ArrowFunction | 84 |  |
| dC | ae | Function | 1474 | z. B. Döbling oder Wienerwald |
| mC | al | Function | 73 |  |
| gC | am | Function | 70 |  |
| KL | ao | Function | 326 |  |
| yC | af | Function | 306 |  |
| xC | ag | Function | 121 |  |
| qL | a6 | Function | 118 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| _y | Function | 6969 |  |  |
| jn | Class | 5506 |  | Tried to create degenerate segment at [ |
| Ah | Function | 5341 |  | Speichern und weiter |
| Jp | Function | 5111 |  |  |
| Nd | Function | 4108 |  | : unknown operator 1200 |
| Ao | Function | 4100 |  |  |
| Qk | Function | 4010 |  |  |
| Kc | Class | 3392 |  |  |
| hb | Function | 3116 |  | Unicode ranges bits > 123 are reserved for internal usage |
| Bm | Function | 3040 |  |  |
| Wc | Function | 2774 |  | Unsupported OpenType flavor |
| Xf | Function | 2705 |  |  |
| ow | Function | 2527 |  | Adding CMAP format 12 (needed!) |
| dS | Function | 2505 |  | container screen |
| wS | Function | 2175 |  | label label-strong |

### engine (406.0 KB)

Importiert: index, svg

Exporte (76):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| Mm | S | Array | 18 |  |
| ht | E | Function | 123 |  |
| mn | F | Function | 221 |  |
| Mn | ae | Function | 1421 |  |
| sr | H | Function | 673 |  |
| ur | Z | Array | 92 |  |
| qo | I | Function | 279 |  |
| hs | Y | Function | 93 |  |
| ws | ad | Array | 20946 | Weit gesperrt |
| cr | V | Call | 72 |  |
| Ae | G | Function | 111 |  |
| qt | W | Function | 297 | Ähnlichkeitssperre: Der Name gleicht einer Referenzmarke ( |
| ba | J | Function | 817 |  |
| Z | ak | Literal | 5 |  |
| Nn | al | Function | 1952 |  |
| $ | M | Function | 58 |  |
| sn | n | Function | 90 |  |
| kn | q | Function | 1739 |  |
| Un | ai | Function | 373 |  |
| yu | aj | Function | 434 |  |
| wu | ah | Function | 205 |  |
| jn | K | Function | 6084 | Die Schriften enthalten alle Zeichen deines Namens. |
| _n | a6 | Function | 36 |  |
| $u | D | Function | 356 |  |
| Cu | B | Function | 241 |  |
| gr | L | Function | 343 |  |
| Oi | N | Function | 220 |  |
| xn | O | Function | 258 |  |
| gt | U | Function | 192 |  |
| Is | a8 | Function | 146 |  |
| Os | X | Function | 953 |  |
| Vi | a0 | Function | 332 |  |
| Ju | a1 | Function | 252 |  |
| Fi | _ | Array | 54 |  |
| dt | i | Function | 185 |  |
| tc | p | Function | 102 |  |
| Ln | P | Function | 532 |  |
| Pe | a7 | Function | 160 |  |
| Am | x | Function | 5769 | Sehr weit |
| ui | z | Identifier | 5 |  |
| Et | T | Object | 44 |  |
| zc | A | Function | 125 |  |
| Em | y | Function | 40 |  |
| qs | h | Function | 299 |  |
| Us | Q | Function | 42 |  |
| Ga | g | Function | 4206 |  |
| yt | a5 | ArrowFunction | 53 |  |
| Nm | af | Function | 1151 |  |
| Lm | v | Function | 629 |  |
| Cr | o | Function | 3550 |  |
| Xe | r | Function | 294 |  |
| kr | C | Literal | 4 |  |
| Rm | b | Function | 281 |  |
| sm | aa | Function | 196 |  |
| lm | ac | Function | 218 |  |
| Js | ab | Function | 274 |  |
| um | a9 | Function | 283 |  |
| cm | k | Function | 71 |  |
| Tm | d | Function | 344 |  |
| gm | a4 | Function | 533 |  |
| Im | ag | Function | 459 |  |
| Om | $ | Function | 215 |  |
| Bm | a2 | Function | 2316 |  |
| Vm | a3 | Function | 221 |  |
| eo | R | Function | 171 |  |
| pn | f | Call | 7 |  |
| no | w | Function | 91 |  |
| Gt | s | Function | 44 |  |
| Fm | t | Function | 35 |  |
| Km | u | Function | 406 |  |
| zm | l | Function | 343 | <svg aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet" |
| xm | e | Function | 163 |  |
| Gm | j | Function | 891 | Logo konnte nicht gezeichnet werden |
| Zm | c | Function | 65 |  |
| $m | m | Function | 47 |  |
| Cm | a | Function | 101 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| as | Function | 5483 | index.aA, index.aB, index.aw, svg.n | } ist zu lang für den Bogen. |
| hl | Function | 5400 | index.i, index.k | Kein Name eingegeben. |
| hr | Function | 4585 | index.a, index.aw, index.k |  |
| Ws | Function | 4561 | index.a, index.aw, index.bs, index.bt, svg.c |  |
| rm | Function | 3612 | index.bn, index.z |  |
| Tc | Function | 3262 | index.a, index.k |  |
| Ai | Function | 2988 | index.a, index.b1 | Laufweite passt nicht zur Schriftform. |
| cu | Function | 2477 |  |  |
| nl | Function | 2357 | svg.n, svg.r |  |
| Zi | Function | 2282 | index.a, svg.d, svg.f, svg.g |  |
| Pa | Function | 2199 | index.bn, index.z |  |
| Ru | Function | 1823 | index.a, index.i |  |
| mu | Function | 1814 | index.aw |  |
| Ss | Function | 1802 | index.b3, index.b4, index.b5, index.b6, index.b7, index.b8 |  |
| Xt | Function | 1772 | index.A, index.a, index.bk, index.bm, index.bn, index.k |  |

### kitAssets (277.9 KB)

Importiert: energy, engine, imagesize, index, svg

Exporte (69):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| xn | ae | Conditional | 109 |  |
| Oa | ad | Function | 101 |  |
| qt | _ | Function | 74 |  |
| pn | a0 | Function | 82 |  |
| ar | $ | Function | 50 |  |
| vi | Y | Function | 74 |  |
| oo | a4 | Function | 200 |  |
| ao | C | Function | 156 |  |
| so | U | Function | 598 |  |
| Ba | L | Function | 326 |  |
| co | e | Function | 198 |  |
| Et | M | Function | 1601 |  |
| _e | K | Function | 816 | Canvas nicht verfuegbar |
| _i | ab | Function | 185 |  |
| Qr | N | Function | 598 |  |
| jt | W | Object | 121 |  |
| Jr | a3 | Function | 80 |  |
| Qe | X | Function | 87 |  |
| Wa | V | Function | 88 |  |
| $i | ac | Function | 68 |  |
| Su | O | Function | 303 |  |
| Gt | P | Function | 288 |  |
| Au | Z | Function | 1194 | Objektfoto hier |
| Ua | a5 | Function | 639 |  |
| Eu | a6 | Function | 217 |  |
| Cu | a1 | Function | 994 |  |
| ho | a2 | Function | 115 |  |
| Fu | R | Function | 368 |  |
| qn | S | Function | 323 |  |
| wo | I | Function | 24 |  |
| Me | H | Function | 908 |  |
| E | D | Object | 206 |  |
| wt | G | Function | 767 | )"><stop offset="0" stop-color=" |
| St | F | Function | 475 |  |
| vn | E | Function | 249 |  |
| Cn | Q | Function | 308 |  |
| Bi | aa | Function | 761 |  |
| yc | a8 | Function | 342 |  |
| Iu | a7 | ArrowFunction | 65 |  |
| Ou | a9 | Object | 14 |  |
| zu | h | Function | 33 |  |
| xu | B | Function | 43 |  |
| Rc | J | Call | 9 |  |
| Kc | t | Function | 38 |  |
| Qo | g | Function | 510 | Diese Datei: welche Datei wofür. |
| Qi | z | Function | 304 |  |
| eu | A | Function | 260 |  |
| $r | w | Function | 38 |  |
| pu | v | Function | 39 |  |
| Mu | q | Function | 66 |  |
| hi | n | Function | 191 |  |
| mu | r | Function | 31 |  |
| la | k | Function | 42 |  |
| ca | y | Function | 51 |  |
| Tu | p | Function | 63 |  |
| Lu | s | Function | 87 |  |
| Pu | j | Function | 309 | ZIP im Worker fehlgeschlagen, erzeuge im Hauptthread |
| Bu | x | Function | 274 | Vorwaermen im Worker fehlgeschlagen |
| Du | o | Function | 24 |  |
| Nu | i | Function | 226 |  |
| Ru | l | Function | 128 |  |
| ju | m | Function | 156 |  |
| Wu | c | Function | 441 |  |
| Uu | d | Function | 47 |  |
| Hu | a | Function | 194 | Eigenes Design nicht geladen |
| eo | T | Literal | 6 |  |
| Zu | b | Function | 890 |  |
| Gu | f | Function | 217 | <svg preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" |
| Vu | u | Function | 273 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| nn | Function | 7255 |  | code length overflow. ( |
| uc | Function | 4619 |  | Erstellt mit dem UNIO Brand Studio am |
| ol | Function | 3300 | energy.b | Mehr Bilder online |
| Us | Function | 2650 | svg.n | Objektbeschreibung in zwei bis drei Sätzen: Lage, Aufteilung und Freiflächen. Di |
| Ds | Function | 2522 |  | Zum direkten Hochladen. Platzhalter vorher ersetzen. |
| ci | Function | 2414 |  | <span style="color: |
| bc | Function | 2018 | imagesize.h, imagesize.k, imagesize.m, imagesize.p, imagesize.x, index.a | abcdefghijklmnopqrstuvwxyz äöüß 0123456789 € |
| gc | Function | 1992 | imagesize.h, imagesize.j, imagesize.k, imagesize.u, svg.n | Nicht verzerren |
| ul | Function | 1848 | imagesize.m | erfolgreich verkaufen? |
| wc | Function | 1780 | imagesize.A, imagesize.h, imagesize.k, imagesize.u, imagesize.x, svg.n | Großzügige Ränder: mindestens der Schutzraum des Logos. |
| fc | Function | 1659 | imagesize.c, imagesize.h, imagesize.j, imagesize.k, imagesize.m, imagesize.x | x = eine Versalhöhe, also die Höhe eines Großbuchstabens im Namen. Diesen Abstan |
| Ll | Function | 1569 | imagesize.i |  |
| fs | Function | 1549 |  | length over |
| Uc | Function | 1427 |  | Story kurz |
| zc | Function | 1411 |  |  |

### kompass (76.6 KB)

Importiert: engine, index, nameFinder, svg, texts

Exporte (10):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| _n | t | Function | 43 |  |
| Qn | b | Function | 274 |  |
| Zn | k | Function | 78 |  |
| Xn | p | Function | 178 |  |
| Yn | r | Function | 66 |  |
| er | s | Function | 137 |  |
| je | d | Function | 148 |  |
| nr | c | Function | 666 |  |
| rr | f | Function | 339 |  |
| tr | a | Function | 1198 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| K | Function | 3688 | nameFinder.o, svg.d, svg.h, texts.W |  |
| Rn | Function | 1426 | svg.h |  |
| re | Function | 1159 | svg.d, svg.h, texts.P, texts.W, texts.i |  |
| Pe | Function | 976 |  |  |
| Pn | Function | 761 |  |  |
| cn | Function | 644 |  |  |
| In | Function | 597 |  |  |
| Nn | Function | 439 |  |  |
| Fn | Function | 410 |  |  |
| Ln | Function | 372 |  |  |
| Gn | Function | 338 |  |  |
| Kn | Function | 264 | engine.X |  |
| Ie | Function | 256 | engine.W |  |
| Ve | Function | 232 |  |  |
| ie | Function | 203 |  |  |

### Editor (59.4 KB)

Importiert: LogoView, describe, engine, index, kitAssets, objectData, photoStore, prewarm, svg

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| ba | default | Function | 645 | Dieses Logo gibt es nicht mehr. Hier sind deine Vorschläge. |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| na | Function | 9665 | describe.d, engine.K, engine.f, engine.m, engine.s, engine.t | Dein bearbeitetes Logo ist gemerkt. |
| zn | Function | 7145 | describe.f, index.D, index.G, index.L, index.P, index.S | Schriften gefunden. |
| an | Function | 3509 | index.D, index.T, index.j, index.m, index.r, kitAssets.a | Texte ändern |
| Nn | Function | 2749 | engine.o, index.G, index.M, index.j, index.q, index.r | Farben wählen |
| Tn | Function | 2439 | index.C, index.S, index.T, index.c, index.j, index.q | Schrift wählen |
| Cn | Function | 2216 | describe.L, index.L, index.S, index.j | Anordnung wählen |
| Pn | Function | 2183 | engine.A, engine.T, engine.x, engine.y, engine.z, index.T | small typo-note |
| jn | Function | 2062 | describe.Q, describe.T, describe.a, engine.o, index.G, index.L | tab-panel-inner stack |
| Un | Function | 1956 | engine.B, engine.D, engine.S, index.A, index.D, index.G | Zusatz aktuell: |
| on | Function | 1486 | index.G, index.T, index.j, index.r | wird geprüft |
| me | Function | 1413 | LogoView.L, engine.a, index.j, index.r, index.x | label tile-group-title |
| Bn | Function | 1285 | index.j, index.q, index.r, index.y | Gründungsjahr entfernt |
| Qn | Function | 1256 | engine.H, index.a, index.j, index.r, index.z | disclosure suffix-details |
| Mn | Function | 1205 | LogoView.L, engine.s, engine.w, index.j, index.r | tile has-name |
| In | Function | 924 | engine.p |  |

### PostingsScreen (53.8 KB)

Importiert: ObjectEditor, imagesize, index, kitAssets, library, svg, texts

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| ja | default | Function | 13277 | Noch nicht bereit: |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| An | Function | 3228 | ObjectEditor.c, library.a | Danke für das große Interesse |
| Qn | Function | 1969 | ObjectEditor.f, ObjectEditor.g, ObjectEditor.h, ObjectEditor.k, ObjectEditor.o, ObjectEditor.p | Hier steht das Zitat deiner Kundin oder deines Kunden. |
| jn | Function | 1459 | ObjectEditor.a, ObjectEditor.e | Objekt fehlt |
| Jn | Function | 1431 | ObjectEditor.f, ObjectEditor.g, ObjectEditor.h, ObjectEditor.s, imagesize.b, svg.n | Über mich |
| Xn | Function | 1234 |  | Was die Zahlen zeigen. |
| _n | Function | 1153 | ObjectEditor.f, ObjectEditor.g, ObjectEditor.h, ObjectEditor.i, ObjectEditor.s, ObjectEditor.t |  |
| Un | Function | 1144 | ObjectEditor.f, ObjectEditor.g, ObjectEditor.h, ObjectEditor.i, ObjectEditor.t |  |
| Rn | Function | 1090 | ObjectEditor.f, ObjectEditor.g, ObjectEditor.h, ObjectEditor.j, ObjectEditor.s |  |
| ta | Function | 1086 | ObjectEditor.h, ObjectEditor.q, ObjectEditor.r, ObjectEditor.t, ObjectEditor.u, imagesize.a |  |
| ea | Function | 980 | ObjectEditor.h, ObjectEditor.q, ObjectEditor.t, imagesize.a, imagesize.b, kitAssets.D |  |
| Vn | Function | 938 | ObjectEditor.f, ObjectEditor.g, ObjectEditor.h, ObjectEditor.i, ObjectEditor.t, imagesize.c |  |
| Zn | Function | 929 | ObjectEditor.g, ObjectEditor.h, ObjectEditor.j, ObjectEditor.k, ObjectEditor.o, ObjectEditor.p |  |
| Kn | Function | 812 | ObjectEditor.f, ObjectEditor.t, library.a | Lage auf Anfrage |
| Ln | Function | 758 | ObjectEditor.b, ObjectEditor.c, library.a | Termin folgt |
| Je | Function | 702 | ObjectEditor.t, imagesize.c, imagesize.i |  |

### Kit (43.8 KB)

Importiert: LogoView, engine, index, kitAssets, library, objectData, photoStore, prewarm, svg

Exporte (4):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| $n | purposeOf | Function | 211 |  |
| it | missingTips | Function | 223 |  |
| Un | metaOf | Function | 28 |  |
| ss | default | Function | 11237 | Unterlagen in deinem eigenen Design. |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| Dn | Function | 9111 | index.D, index.G, index.M, index.P, index.T, index.j | haben wir übernommen. |
| Cn | Function | 7483 | index.$, index.D, index.G, index.J, index.K, index.P | Gültige Angaben sind gespeichert. Bitte prüf die markierten Felder. |
| Fn | Function | 2810 | index.D, index.P, index.T, index.j, index.r, index.u | Signatur kopiert. Füge sie jetzt in deinem E-Mail-Programm ein. |
| Gn | Function | 2500 | engine.e, index.G, index.j, index.r, kitAssets.T, kitAssets.b | groß ansehen |
| Tn | Function | 1581 | index.D, index.G, index.j, index.m, index.r, kitAssets.f | Seite oder Variante |
| kt | Function | 1380 | index.G, index.M, index.P, index.T, index.j | Wird erstellt ... |
| En | Function | 544 |  | Bild nicht lesbar |
| Pn | Function | 535 | index.G, index.T, index.j, index.u | Fertige Bilder und Bildtext zu deinen Objekten: neu, reserviert, verkauft und me |
| De | Function | 360 |  |  |
| Kn | Function | 293 | index.r, kitAssets.l |  |
| Se | Function | 251 | kitAssets.k, kitAssets.r, kitAssets.t |  |
| An | Function | 227 |  |  |
| jt | Function | 176 |  |  |
| Ln | Function | 164 |  |  |
| On | Function | 152 |  |  |

### texts (37.5 KB)

Importiert: svg

Exporte (21):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| Z | R | Array | 1709 | Präzision bis ins Kleinste |
| _ | d | Array | 507 | Gold auf Schwarz |
| C | S | Array | 739 | Gerne bereite ich bis Donnerstag eine Bewertung Ihrer Wohnung vor und erläutere  |
| U | L | Array | 1005 | Welche Schrift wirkt mehr nach dir? |
| J | F | Array | 381 | Welche Farben ziehen dich an? |
| q | e | Array | 287 | Gold und Messing |
| K | W | Array | 2260 | Die erste eigene Wohnung |
| L | i | Array | 2150 | Du sagst auch, was nicht geht. |
| y | P | Array | 1755 | „Da weiß man, woran man ist.“ |
| Re | b | Object | 268 | Wofür du stehst, wen du erreichst und wie du auftrittst. Logo, Social Media und  |
| R | K | Array | 5644 | Wer steht im Mittelpunkt deiner Marke? |
| re | f | Function | 173 |  |
| Fe | a | Function | 1350 |  |
| le | c | Function | 687 |  |
| Oe | k | Function | 168 |  |
| de | j | New | 21 |  |
| ce | h | Function | 82 |  |
| A | w | Function | 75 |  |
| v | t | Function | 137 |  |
| ge | g | Function | 116 |  |
| xe | r | Function | 919 | . Anders als |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| ve | Function | 2384 |  | Eigentümer und Käufer gleichermaßen |
| Pe | Function | 834 |  |  |
| Ie | Function | 664 |  |  |
| We | Function | 652 |  |  |
| W | Function | 427 |  |  |
| ye | Function | 374 |  |  |
| z | Function | 371 |  |  |
| Te | Function | 358 |  |  |
| ze | Function | 334 |  | Eigentümer und Käufer |
| Ee | Function | 246 | svg.d |  |
| Se | Function | 234 |  | Ein Beispiel aus der Praxis: |
| Ke | Function | 213 |  |  |
| Ge | Function | 178 |  | einmal pro Woche |
| M | Function | 125 |  |  |
| S | Function | 95 |  |  |

### own (29.5 KB)

Importiert: energy, imagesize, index, kitAssets, svg

Exporte (6):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| Ze | signatureHtml | Function | 1957 | <span style="color: |
| ns | signatureText | Function | 401 |  |
| fs | signatureHtmlInline | Function | 135 |  |
| ps | signatureHtmlInlineAsync | Function | 115 |  |
| Je | eigenPath | Function | 94 |  |
| us | OWN_DESIGN | Call | 36 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| pn | Function | 2108 | imagesize.B, imagesize.C, imagesize.c, imagesize.f, imagesize.i, imagesize.k |  |
| mn | Function | 1762 | imagesize.B, imagesize.C, imagesize.f, imagesize.i, imagesize.k, imagesize.m | Alle Angaben ohne Gewähr |
| hn | Function | 1149 | imagesize.c, imagesize.f, imagesize.k, imagesize.m, imagesize.o, imagesize.p | Scannen und anrufen |
| me | Function | 1127 | imagesize.f, imagesize.k, imagesize.m, imagesize.p, kitAssets.C, kitAssets.P |  |
| Kn | Function | 1104 | imagesize.f, imagesize.k, imagesize.m, imagesize.o, imagesize.p, imagesize.w | Über mich |
| os | Function | 1062 | imagesize.i, imagesize.k, imagesize.m, imagesize.n, kitAssets.O, kitAssets.P |  |
| gn | Function | 1017 | imagesize.B, imagesize.C, imagesize.P, imagesize.c, imagesize.f, imagesize.k |  |
| qn | Function | 593 | imagesize.f, imagesize.m, imagesize.o, imagesize.p, kitAssets.Z |  |
| $n | Function | 565 | imagesize.f, imagesize.k, imagesize.m, imagesize.p, kitAssets.Z |  |
| Ke | Function | 522 | imagesize.D, imagesize.E, imagesize.m, imagesize.n, imagesize.u, svg.n |  |
| Un | Function | 508 | imagesize.f, imagesize.m, imagesize.p, kitAssets.Z | Erfolgreich vermittelt |
| Xe | Function | 448 | imagesize.D, imagesize.n, kitAssets.O, svg.n |  |
| Ce | Function | 437 | energy.e, imagesize.c, imagesize.h, imagesize.i, imagesize.k, imagesize.m |  |
| Qe | ArrowFunction | 400 | kitAssets.V, kitAssets.W, kitAssets.X | ", 60 x 40 cm, mit 3 mm Rand für den Zuschnitt. Für Fenster, Balkon und Bauzaun. |
| We | Function | 386 | imagesize.f, kitAssets.P, kitAssets.a5 |  |

### Gallery (28.8 KB)

Importiert: NameCard, describe, engine, index, nameFinder, svg

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| kt | default | Function | 7458 | neue Vorschläge geladen. |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| st | Function | 4021 | NameCard.N, NameCard.W, index.D, index.G, index.P, index.b | Alternativen ohne finale Logos |
| ut | Function | 1996 | NameCard.K, NameCard.s, NameCard.u, describe.N, describe.S, index.D | Alle zurücksetzen |
| lt | Function | 1908 | engine.a, engine.b, engine.e, engine.f, engine.m, index.r |  |
| ot | Function | 976 | engine.b, engine.f, engine.k, engine.r, index.r |  |
| Ie | Function | 853 |  |  |
| Dn | ArrowFunction | 788 |  | Vorschau braucht einen Browser |
| ht | Function | 711 | describe.N, describe.S, describe.T, svg.C |  |
| $n | Function | 690 |  |  |
| An | Function | 629 |  |  |
| ge | Function | 492 | engine.d, engine.i |  |
| nt | Function | 479 |  |  |
| Pn | Function | 407 |  |  |
| Wn | Function | 367 |  |  |
| ze | Function | 350 |  |  |
| H | Function | 298 | index.j | disclosure filter-group |

### ObjectEditor (21.4 KB)

Importiert: energy, imagesize, index, library, objectData, photoStore, svg

Exporte (27):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| Ye | e | ArrowFunction | 14 |  |
| ut | c | ArrowFunction | 14 |  |
| mt | b | ArrowFunction | 29 |  |
| gt | a | Function | 81 |  |
| pt | w | Function | 117 |  |
| M | h | ArrowFunction | 27 |  |
| J | r | ArrowFunction | 187 |  |
| ft | i | ArrowFunction | 130 |  |
| G | t | Function | 690 |  |
| Je | m | Function | 590 |  |
| bt | l | Function | 337 |  |
| Qe | f | Function | 97 |  |
| xt | g | Function | 104 |  |
| jt | s | ArrowFunction | 59 |  |
| Ne | n | Function | 581 |  |
| vt | p | Function | 406 |  |
| wt | k | Function | 626 | <stop offset=" |
| $t | o | ArrowFunction | 72 |  |
| kt | v | Function | 364 |  |
| Nt | d | Function | 236 |  |
| yt | j | Function | 289 |  |
| St | x | Function | 354 |  |
| Et | u | Function | 103 |  |
| Ft | q | Function | 92 |  |
| st | y | Function | 219 |  |
| zt | z | Function | 129 |  |
| Mt | O | Function | 12060 | haben wir übernommen. |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| lt | Function | 2001 | index.D, index.P, index.S, index.T, index.j, index.r | Tipp auf das Wichtigste im Bild. Es bleibt in allen Formaten im Blick. |
| et | Function | 503 |  | Bild nicht lesbar |
| $e | Function | 154 | imagesize.i |  |
| tt | Function | 109 | photoStore.g |  |
| U | ArrowFunction | 76 |  |  |
| W | ArrowFunction | 40 |  |  |
| we | ArrowFunction | 34 |  |  |

### NameFinder (19.9 KB)

Importiert: NameCard, describe, index, nameFinder

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| ds | default | Function | 17808 | Namensvorschläge geladen. |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| ss | Function | 670 | index.C, index.D, index.P, index.T, index.j, index.q | Was passt nicht? |
| G | ArrowFunction | 230 | index.ad |  |
| Xn | Function | 207 | index.r |  |
| es | Function | 192 |  |  |
| ns | Function | 98 |  |  |
| Qn | ArrowFunction | 70 |  |  |

### Routes (17.9 KB)

Importiert: LogoView, NameCard, engine, index, kitAssets, kompass, nameFinder, svg, texts

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| ss | default | Function | 4102 | Die Texte der Routen sind jetzt von der KI formuliert. |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| Ge | Function | 5956 | NameCard.H, NameCard.N, index.P, index.T, index.a, index.j | rt-logo riffel |
| Me | Function | 1870 | kompass.t |  |
| Oe | Function | 1766 | texts.g, texts.h, texts.t, texts.w |  |
| $e | Function | 780 | LogoView.L, engine.h, index.j |  |
| Fe | Function | 694 |  |  |
| H | Function | 441 | index.a1, index.j, index.r, kitAssets.B, kitAssets.b, kitAssets.c | riffel skeleton |
| He | Function | 399 | index.j, index.r | Die Logos werden noch entworfen. |
| Ue | Function | 295 | index.r | Routen-Vorschau fehlgeschlagen |
| Ae | Function | 267 |  |  |
| U | Function | 146 | index.j |  |
| D | Function | 144 | index.j |  |
| L | ArrowFunction | 124 |  |  |
| Ce | Function | 101 |  |  |
| K | ArrowFunction | 29 | texts.h |  |

### Kompass (16.2 KB)

Importiert: LogoView, engine, index, kompass, svg, texts

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| Ye | default | Function | 2420 | Deine drei Richtungen werden zusammengestellt. |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| qe | Function | 4601 | index.ae, index.ah, index.j, index.m, index.q, index.r |  |
| H | Function | 1092 | engine.L, engine.M, engine.N, engine.O, engine.P, engine.Q |  |
| Ke | Function | 675 | engine.g, index.j, index.r, kompass.b, kompass.k, kompass.p | Vorschau ohne Logos |
| T | Function | 569 | index.j, index.r, index.x |  |
| U | Function | 416 | index.j |  |
| B | Function | 267 | index.k |  |
| Pe | Function | 187 | index.j |  |
| Z | ArrowFunction | 154 | index.j |  |
| De | Function | 142 | index.j |  |
| L | ArrowFunction | 68 | engine.U, index.A, index.ak, index.k |  |
| h | ArrowFunction | 27 |  |  |

### svg (15.8 KB)

Importiert: -

Exporte (26):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| et | d | Function | 386 |  |
| nt | h | Function | 115 |  |
| P | u | Function | 135 |  |
| yt | s | Function | 260 |  |
| T | a | Function | 244 |  |
| W | b | Function | 285 |  |
| Q | m | Function | 105 |  |
| G | l | Function | 134 |  |
| Z | c | Function | 82 |  |
| st | j | ArrowFunction | 14 |  |
| gt | o | Function | 134 |  |
| L | e | Function | 326 |  |
| rt | C | Object | 605 | Champagner, Messing, Gold mit Anthrazit |
| ot | M | Call | 18 |  |
| J | p | Function | 40 |  |
| it | w | Function | 63 |  |
| kt | g | Function | 75 |  |
| ht | f | Function | 204 |  |
| At | x | Function | 662 |  |
| bt | k | Function | 85 |  |
| Et | i | Function | 39 |  |
| D | n | Function | 92 |  |
| wt | t | Function | 551 |  |
| Mt | q | Function | 115 |  |
| xt | r | Function | 1731 |  |
| Ct | v | Function | 101 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| ft | Function | 1423 |  |  |
| Ft | Function | 690 |  |  |
| mt | Function | 656 |  |  |
| U | Function | 420 |  |  |
| pt | Function | 261 |  |  |
| tt | Function | 245 |  |  |
| dt | Function | 227 |  |  |
| K | Function | 143 |  |  |
| _ | ArrowFunction | 140 |  |  |
| I | Function | 137 |  |  |
| j | Function | 129 |  |  |
| q | Function | 122 |  |  |
| Y | Function | 103 |  |  |
| H | ArrowFunction | 30 |  |  |

### NameCard (11.4 KB)

Importiert: LogoView, engine, index, nameFinder

Exporte (8):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| O | H | Function | 317 |  |
| p | W | Function | 559 |  |
| re | a | Function | 4920 | Ein eigenständiger Name, der zu deinen Angaben passt. |
| U | S | Function | 335 |  |
| J | s | Function | 102 |  |
| Y | u | Function | 50 |  |
| te | K | Function | 573 | noopener noreferrer |
| ie | N | Call | 1178 | wm-card name-card |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| D | Function | 624 | index.j | Weniger davon: |
| V | Function | 612 | index.j, nameFinder.s | . Als Ausgangspunkt nehmen |
| G | Function | 450 | index.j, index.r, nameFinder.l | Logos für diesen Namen, Form |
| g | Function | 276 | index.j |  |
| _ | Function | 270 |  |  |
| S | Function | 251 | index.j, index.r |  |
| N | ArrowFunction | 249 | index.j | noopener noreferrer |
| q | Function | 213 |  |  |
| Z | Function | 96 |  |  |
| L | Function | 68 |  |  |
| X | Function | 46 |  |  |
| A | Function | 33 |  |  |

### library (8.6 KB)

Importiert: index, objectData

Exporte (17):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| i | L | Object | 158 |  |
| z | b | Array | 63 |  |
| N | S | Object | 115 | Preis angepasst |
| v | D | Object | 20 |  |
| P | Z | Literal | 5 |  |
| V | e | Function | 345 |  |
| M | a | Function | 187 |  |
| U | l | Function | 319 |  |
| W | v | Function | 1059 |  |
| x | f | Function | 890 |  |
| J | u | Function | 185 |  |
| Y | r | Function | 62 |  |
| H | s | Function | 190 |  |
| X | m | Function | 134 |  |
| q | c | Function | 112 |  |
| Q | d | Function | 173 |  |
| ee | p | Function | 276 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| Z | Function | 1204 | index.aF, index.aG, index.aI, index.aJ, index.aR |  |
| F | Function | 537 |  |  |
| K | Function | 459 | index.aF, index.aG, index.aI, objectData.E |  |
| T | Function | 346 | index.aF, index.aG, index.aJ, index.aL |  |
| _ | Function | 220 | index.aF, index.aG, index.aI |  |
| j | Function | 89 |  |  |
| l | ArrowFunction | 33 |  |  |
| p | ArrowFunction | 30 |  |  |

### imagesize (8.0 KB)

Importiert: index, svg

Exporte (33):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| p | y | Function | 193 |  |
| L | b | Function | 105 |  |
| M | l | Function | 134 |  |
| X | a | Function | 82 |  |
| _ | e | ArrowFunction | 12 |  |
| N | z | Function | 191 |  |
| U | d | Function | 216 |  |
| Y | C | Binary | 9 |  |
| J | B | Binary | 9 |  |
| K | P | Binary | 9 |  |
| Q | r | Function | 34 |  |
| F | i | Function | 119 |  |
| d | m | Function | 482 | <path transform="translate( |
| tt | p | Function | 90 |  |
| W | w | Function | 177 |  |
| nt | c | ArrowFunction | 16 |  |
| et | k | Function | 80 |  |
| st | x | Function | 242 |  |
| it | t | Identifier | 4 |  |
| H | n | Function | 457 |  |
| rt | s | Function | 146 |  |
| T | u | Function | 57 |  |
| ct | f | ArrowFunction | 123 |  |
| P | o | ArrowFunction | 144 |  |
| C | v | ArrowFunction | 144 |  |
| at | j | ArrowFunction | 102 |  |
| ot | D | ArrowFunction | 40 |  |
| lt | h | Function | 335 |  |
| $t | E | Function | 228 |  |
| ut | g | Function | 265 | " preserveAspectRatio="xMidYMid slice" href=" |
| ft | A | Function | 412 |  |
| ht | F | Function | 272 |  |
| gt | q | Function | 806 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| V | Function | 668 | index.aC, svg.n |  |
| Z | Function | 251 |  |  |
| B | Function | 218 |  |  |
| k | Function | 213 |  |  |
| I | Function | 154 |  |  |
| R | Function | 143 |  |  |
| z | Function | 132 | index.aB |  |
| m | ArrowFunction | 93 |  |  |
| f | Function | 75 |  |  |
| x | ArrowFunction | 47 |  |  |

### objectData (5.6 KB)

Importiert: energy, index

Exporte (13):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| t | O | Object | 100 |  |
| k | E | Array | 42 |  |
| A | s | ArrowFunction | 81 |  |
| I | j | ArrowFunction | 81 |  |
| v | v | ArrowFunction | 24 |  |
| F | a | Array | 97 |  |
| T | F | Object | 208 |  |
| C | b | Function | 248 |  |
| L | o | Function | 1535 |  |
| W | d | Function | 868 |  |
| Z | e | ArrowFunction | 39 |  |
| _ | f | Function | 725 |  |
| V | c | Function | 153 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| K | Function | 217 |  |  |
| f | ArrowFunction | 33 |  |  |

### migrate (4.4 KB)

Importiert: index, library, objectData

Exporte (4):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| C | migrateProject | Function | 3172 |  |
| J | deserializeProject | Function | 38 |  |
| X | loadAll | Function | 185 |  |
| Q | readBackup | Function | 447 | Projekt unvollständig |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| V | Function | 107 | index.aR |  |
| Z | Function | 63 | library.l, objectData.o |  |

### ObjectsScreen (3.7 KB)

Importiert: ObjectEditor, index, library, photoStore

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| V | default | Function | 2172 | container screen ps-screen |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| R | Function | 1151 | ObjectEditor.e, index.G, index.M, index.j, library.S, library.a | Noch kein Foto |

### StyleScreen (3.0 KB)

Importiert: LogoView, describe, engine, index

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| W | default | Function | 2372 | gewählt. Logos werden entworfen. |

### photoStore (1.9 KB)

Importiert: index

Exporte (6):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| x | n | ArrowFunction | 74 |  |
| E | p | Function | 136 | Kein gültiges Bild |
| P | g | Function | 148 |  |
| M | d | Function | 68 |  |
| R | u | Function | 281 |  |
| O | r | Function | 598 | Bild nicht lesbar |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| y | Function | 259 |  |  |
| d | Function | 195 |  |  |

### describe (1.8 KB)

Importiert: index

Exporte (9):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| l | L | Object | 88 | Symbol links |
| h | T | Object | 141 |  |
| b | Q | Array | 34 |  |
| f | a | Array | 45 |  |
| y | S | Array | 462 | Exklusiv und edel, für Premium-Objekte. |
| k | M | Object | 65 | Überrasch mich |
| S | f | Function | 53 |  |
| c | N | Object | 174 | Nachname und Zusatz |
| g | d | Function | 284 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| u | Function | 227 | index.p |  |
| m | Function | 85 | index.a |  |

### prewarm (1.8 KB)

Importiert: kitAssets

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| E | p | Function | 843 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| M | Function | 461 |  |  |
| g | Function | 174 |  |  |
| v | ArrowFunction | 71 |  |  |

### energy (1.3 KB)

Importiert: -

Exporte (6):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| u | c | Literal | 14 |  |
| a | b | Function | 514 |  |
| E | e | Function | 52 |  |
| c | a | Function | 92 |  |
| d | E | Object | 377 |  |
| b | d | Function | 73 |  |

Größte interne Funktionen:

| Name | Art | Größe | nutzt | Hinweis |
|---|---|---|---|---|
| g | Function | 125 |  |  |
| s | ArrowFunction | 51 |  |  |

### LogoView (0.7 KB)

Importiert: engine, index

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| $ | L | Call | 626 |  |

### ProjectPreview (0.6 KB)

Importiert: LogoView, index

Exporte (1):

| Name | Export | Art | Größe | Hinweis |
|---|---|---|---|---|
| c | default | Function | 481 |  |
