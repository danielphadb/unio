// Erzeugt docs/23-modulkarte.md aus recovered/harness/modulkarte-roh.json (modulkarte-roh.mjs)
// und der Zuordnung unten (von Hand aus der Analyse; "?" = Vermutung, im Code pruefen).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { here, studioRoot } from "./lib.mjs";

const roh = JSON.parse(readFileSync(join(here, "modulkarte-roh.json"), "utf8"));
const sizes = JSON.parse(readFileSync(join(here, "survey.json"), "utf8"));

// Chunk -> Bereich, vermutete Originaldateien, Rolle
const CHUNKS = [
  ["engine", "Logo-Engine und Signature-Vorlagen", "src/engine/{generator,renderLogo,recipes,quality,highend,catalog,corpusMarks,corpusTechMarks,tracking,palettes,typoExtras,suffixPairings,route,eingriffe}.ts, src/signature/**, src/symbols/{monogram,boolean,drawnMonogram}.ts", "Konzepte erzeugen, Seiten-Pools, Kuratierung, Rendern (SVG-Pfade aus opentype), Qualitätsprüfung, Signature-Vorlagen (Daten + Layout-Interpreter), Routen-Filter"],
  ["nameFinder", "Namen", "src/engine/names.ts, src/engine/names/** (wordsDb, lexicon, rules, quality, tech, kwFields, brandable, styles, corpusNames, rating, wordsDbFormat), src/engine/nameCards.ts, src/engine/reference/{names,keyword-fields,naming-rules}.json, src/namen/kiNamen.ts", "Namensprofil, Chargen, Namensprüfung, Alternativen, Namenskarten mit finalen Logos"],
  ["kompass", "Strategie (Markenkompass)", "src/strategy/{axes,territories,routes,index}.ts, src/strategy/territories.json, src/engine/kompassProbe.ts", "Achsen aus dem Brief, Territorien, chooseRoutes, Route auf Eingaben anwenden"],
  ["texts", "Strategie: Katalog und Texte", "src/strategy/{catalog,texts,kiTexte,types}.ts", "Fragenkatalog des Kompass, Texte der Routen (Kernidee, Claim, Story, Formate)"],
  ["svg", "Gemeinsame Helfer", "src/engine/svg.ts, src/engine/palettes.ts (Farbe), src/engine/random.ts?", "Zufall (Seed), Hash, Farbe/Kontrast, Paletten, SVG-Dokument"],
  ["describe", "Logo-Beschreibung", "src/engine/describe.ts?", "Bezeichnungen für Layouts, Schriftklassen, Themen, Stile"],
  ["texts", null, null, null],
  ["kitAssets", "Unterlagen (Deliverables) und Kit", "src/deliverables/{items,unio,export}.ts, src/deliverables/lib/energy.ts, src/postings/render/* (teilweise), src/ui/kit/*", "Kit aus Konzept + Kontakt, Liste der Unterlagen, Vorschau/Seiten als SVG, PDF/ZIP-Export (Worker), QR-Code"],
  ["own", "Unterlagen: eigenes Design", "src/deliverables/own*.ts?", "Unterlagen im eigenen Design (OWN_DESIGN), E-Mail-Signatur"],
  ["imagesize", "Unterlagen: Bild- und Farbhelfer", "src/deliverables/lib/*?", "Farbmischung, Kontrast, Bildgrößen"],
  ["energy", "Energieausweis", "src/deliverables/lib/energy.ts, src/postings/energy.ts", "Energiezeile (HWB, fGEE, EEB, Klasse) und Pflichtprüfung"],
  ["PostingsScreen", "Postings (Ausbaustufe 6)", "src/postings/{occasions,copy,caption,deliverable,export}.ts, src/postings/render/*, src/ui/postings/PostingsScreen.tsx", "Anlässe, Formate, Looks, Rendern je Format/Seite, Bildtext, ZIP/Teilen"],
  ["ObjectEditor", "Postings: Objekte", "src/postings/{model,library}.ts, src/ui/postings/ObjectEditor.tsx", "Objekt-Editor, Foto-Fokus, Fakten"],
  ["library", "Postings: Objekt-Bibliothek", "src/postings/library.ts", "Objekt-Modell, Validierung, Grenzen"],
  ["objectData", "Postings: Objektdaten", "src/postings/model.ts?", "Felder, Platzhalter, Energieklassen"],
  ["photoStore", "Postings: Fotos", "src/postings/photoStore.ts?", "Fotos in IndexedDB"],
  ["ObjectsScreen", "Oberfläche", "src/ui/postings/ObjectsScreen.tsx", "Objektliste"],
  ["migrate", "Speicher", "src/ui/logic/migrate.ts?", "Projekt-Migration, Sicherung lesen"],
  ["index", "App-Kern und Bibliotheken", "src/ui/App.tsx, src/ui/logic/** (Store, Router, Speicher, Validierung), src/engine/fonts.ts + fonts.json + coverage.json, src/symbols/Icons.ts, src/engine/orte.ts, Bibliotheken React, opentype.js, polygon-clipping", "Start, Zustand, Navigation, Projekt anlegen, Schriftkatalog, Schrift-Laden, Icons, Orte, Validierung"],
  ["Gallery", "Oberfläche: Galerie", "src/ui/screens/Gallery.tsx", "Galerie mit Seiten, Kuratierung, 'Namen auf die Probe stellen', KI-Rangfolge (art director)"],
  ["Editor", "Oberfläche: Editor", "src/ui/editor/*", "Logo-Editor (Schrift, Symbol, Layout, Farben, Varianten)"],
  ["Kit", "Oberfläche: Kit", "src/ui/kit/*", "Kit-Seite, Downloads, Markenplattform"],
  ["Kompass", "Oberfläche: Markenkompass", "src/ui/screens/Kompass.tsx", "Fragen, Vorschauleiste"],
  ["Routes", "Oberfläche: drei Routen", "src/ui/screens/Routes.tsx", "Routen-Karten, Logos und Namen je Route"],
  ["NameFinder", "Oberfläche: Namensfinder", "src/ui/screens/NameFinder.tsx", "Formular, Chargen, Namenskarten"],
  ["NameCard", "Oberfläche: Namenskarte", "src/ui/components/NameCard.tsx, Einstellungen", "Karte, Herz, Ausblenden, Einstellungen (kiFunktionen, intern, signatureEntwuerfe)"],
  ["StyleScreen", "Oberfläche: Stilwahl (S2)", "src/ui/screens/StyleScreen.tsx", "Stilwahl mit Vorschau"],
  ["LogoView", "Oberfläche", "src/ui/components/LogoView.tsx", "Logo als SVG (Hook useLogoSvg)"],
  ["ProjectPreview", "Oberfläche", "src/ui/components/ProjectPreview.tsx", "Projekt-Vorschau"],
  ["prewarm", "Unterlagen", "src/deliverables/prewarm.ts?", "Vorwärmen der Exporte in Ruhephasen"],
];

// Von Hand zugeordnete Funktionen: [Chunk, Name im Bundle, Export, vermuteter Originalname, Zweck]
const CORE = {
  "Logo-Engine (engine)": [
    ["engine", "Ga", "g", "generateConcepts(input, {count, page, seed, taste})", "Rezept-Konzepte einer Seite (StyleScreen ruft count 12, page 0)"],
    ["engine", "Tm", "d", "generatePage / Galerie-Pool(input, {page, seed, signatureEntwuerfe})", "Pool einer Galerie-Seite: Rezepte (pm), Signature (am), Monogramme (mm), Eingriffe (hm)"],
    ["engine", "pm", "-", "recipePool", "Ga mit Auffüllen auf genug Formen"],
    ["engine", "am", "-", "signatureConcepts", "Signature-Vorlagen als Konzepte, Varianten"],
    ["engine", "mm", "-", "drawnMonogramConcepts", "gezeichnete Monogramme (nur bei zwei Initialen)"],
    ["engine", "hm", "-", "eingriffeConcepts", "Buchstaben-Eingriffe (Feature-Flag Bt)"],
    ["engine", "Rm", "b", "curate(pool, input, fonts, n=6, {exclude, pinFirst})", "Kuratierung je Seite, Mischung nach Route (kindMix)"],
    ["engine", "cm", "k", "pageToPackage(page)", "Seite -> Paket/Schritt"],
    ["engine", "zm", "l", "renderLogoSvg(concept, input, opts) mit LRU-Cache", "SVG-String (LogoView-Weg)"],
    ["engine", "wm", "-", "renderLogo / layoutLogo", "Layout und Glyphen-Pfade"],
    ["engine", "Gm", "j", "useLogoSvg (Hook)", "rendert in Leerlaufzeiten mit Priorität"],
    ["engine", "Km", "u", "useFontsReady (Hook)", ""],
    ["engine", "pn", "f", "fontStore (Instanz von FontStore aus index)", "lädt fonts/brand/*.woff, ensure(), has(), setTexts()"],
    ["engine", "Xe", "r", "fontsNeeded(concepts, 'logo'|'all', input)", ""],
    ["engine", "dt", "i", "inputSeed(input)", "Hash aus Name, Zusatz, Stilen, Farben, Themen"],
    ["engine", "tc / be", "p / -", "conceptId / withId", "ID = 'c' + Hash des Konzepts ohne seed"],
    ["engine", "jn", "K", "checkLogo / quality", "Qualitätspunkte ('Die Schriften enthalten alle Zeichen ...')"],
    ["engine", "gr, se, Oi, xn, Rs, gt, Is, Os, Vi, gm", "L, -, N, O, -, U, a8, X, a0, a4", "route.ts: applyRoute, routeOf, Filter (Farben, Themen, Schriftformen, Signature), kindMix, passtZurRoute", ""],
    ["engine", "Cr", "o", "similarConcepts / variationsOf", "'Ähnlich wie Konzept' in der Galerie"],
    ["engine", "Lm", "v", "editorVariants", "Varianten im Editor"],
    ["engine", "Nm", "af", "conceptsForName", "Konzepte für einen Namen (Namenskarten, Routen)"],
    ["engine", "Am, Et, zc, Em, ui", "x, T, A, y, z", "tracking.ts: Optionen, Stufen (eng/normal/weit/sehrWeit), Einrasten", ""],
    ["engine", "$u, Cu, Gu", "D, B, -", "suffixPairings.ts", "Zusatz-Paarungen (suffixPairings.json)"],
    ["engine", "qs, eo", "h, R", "cardFace, withCardBackground", "Kartenfläche (paper/ink/primary)"],
    ["engine", "kn, Mn, sn, $", "q, ae, n, M", "Namensformat, Namensteile, Initialen, Text säubern", ""],
    ["engine", "Nn, yu, wu", "al, aj, ah", "Farben auflösen, Tagline rendern, Schriften eines Konzepts", ""],
    ["engine", "cr, Ae, qt, ba, Js, sm, lm, um, Ul", "V, G, W, J, ab, aa, ac, a9, -", "signature/index.ts, render.ts, similarity.ts, varianten.ts", "alle Vorlagen, holen, passt (inkl. Ähnlichkeitssperre zum Korpus), Parameter, Gewichtung"],
    ["engine", "Il, Ol, Bl, Vl, Zl, Cl, ws, Dl, Pl, Wl", "-, ..., ad", "signature/templates/{elegant,luxus,modern,mutig,natur,warm,kurz,mischung,kit,partner}", "Vorlagen-Daten (siehe src/signature/templates/*.json)"],
    ["engine", "gs, ds, Bu, Gu, To/Io/Oo/Du", "-", "corpusMarks, corpusTechMarks, recipes.json, suffixPairings, signature/orte", "Daten (siehe src/engine/*.data.json, src/signature/orte.json)"],
    ["engine", "xm, Zm, $m, Cm", "e, c, m, a", "Render-Warteschlange, Performance-Marken", ""],
  ],
  "Namen (nameFinder)": [
    ["nameFinder", "Rd", "t", "profileFromForm(form)", "Profil aus Namensfinder-Formular"],
    ["nameFinder", "jd", "e", "generateNames(profile, {...form, seed}, batches)", "Chargen (je 24 Namen, ha = 24)"],
    ["nameFinder", "Td, Kd", "-", "generateBatch, batchOptions", ""],
    ["nameFinder", "Yd", "c", "nameCards(names, seed, styles, entwuerfe, routeParams)", "finale Logos je Name"],
    ["nameFinder", "Xd", "b", "fallbackCard", "Karte, falls kein finales Logo"],
    ["nameFinder", "el", "h", "batchSeed(seed, i)", "Hash `${seed}|charge|${i}`"],
    ["nameFinder", "Zd", "p", "pruefeEigenenNamen(name, ctx)", "Länge, Aussprache, Verwechslung, Domain, Mitbewerber-Test, ..."],
    ["nameFinder", "_d", "a", "alternativenFuer(name, ctx, 6..12)", ""],
    ["nameFinder", "Gt", "w", "nameInput(name, styles)", "LogoInput für Namenskarten"],
    ["nameFinder", "Fd, xt, Jd, Qd, $d", "r, d, g, i, s", "withRoute, kindToNameKind, toSaved, toCandidate, kindLabel", ""],
    ["nameFinder", "nn", "o", "keywordFieldsFor(stichwort)", "kwFields.ts"],
    ["nameFinder", "kt, Id", "q, m", "brandable / Stil-Namen", "Kunstwörter seitenweise (brandable.ts, styles.ts?)"],
    ["nameFinder", "rl, nl, al, tl, ul", "l, u, j, n, k", "Namen-Logoformen, Domain-Slug, Nähe-Marke, Ortsname", ""],
    ["nameFinder", "sl", "f", "kiNamenPruefung (src/namen/kiNamen.ts)", "Server brand-namen, nur mit kiFunktionen"],
    ["nameFinder", "kn, vs, xa, mu, pu, Bs", "-", "wordsDb, keyword-fields.json, naming-rules.json, corpusNames, kwFields", "Daten (src/engine/names/*.data.json, src/engine/reference/*.json)"],
  ],
  "Strategie (kompass, texts)": [
    ["kompass", "Dn", "- (über r)", "chooseRoutes(brief, {seed, mutiger})", "drei Routen A sicher, B mutig, C überraschend, mit Texten"],
    ["kompass", "Rn, Nn, In, Pn", "-", "pickRoutes, Signature-Zuteilung, Mischung", ""],
    ["kompass", "Yn", "r", "routesForState(state)", ""],
    ["kompass", "Qn", "b", "previewRoute(brief)", "Vorschauleiste im Kompass"],
    ["kompass", "Pe, Ke, K, re", "-", "axesFromBrief, briefSeed, routeParams, territoryFit", "axes.ts, territories.ts"],
    ["kompass", "nr", "c", "projectFromRoute(brief, route, name, opts)", "'Route vertiefen' mit eigenem Namen"],
    ["kompass", "rr", "f", "nameFinderFromRoute(form, brief, route)", "'Route vertiefen' ohne Namen"],
    ["kompass", "tr", "a", "routeLogos(routes, brief, seed, n=6)", "Logos je Route"],
    ["kompass", "je, Zn, Xn, er, _n", "d, k, p, s, t", "applyRouteToInput, previewInput, mutiger, getTerritory", ""],
    ["texts", "xe", "r", "routeTexts(territory, brief, art, params)", "Kernidee, Claim, Story, Formate"],
    ["texts", "R, Z, _, C, U, J, q, K, L, y, Re", "K, R, d, S, L, F, e, W, i, P, b", "catalog.ts: Schritte, Referenzwelten, Klischees, Stimmproben, Logo-/Farbpaare, Anti-Farben, Wunschkunden, Werte, Wirkung, Intro", "Daten (src/strategy/catalog.json)"],
    ["texts", "re, Fe, le, Oe, ce, A, v, ge", "f, a, c, k, h, w, t, g", "Frage sichtbar, Antwort setzen/lesen, offene Fragen, Klischee finden, Wörter zählen, Text glätten, Claim-Regel (max. 5 Wörter)", ""],
  ],
  "Postings und Unterlagen": [
    ["PostingsScreen", "vn, De, xn", "-", "occasions.ts: ANLAESSE, FORMATE, LOOKS", "Daten (src/postings/occasions.snapshot.json)"],
    ["PostingsScreen", "Pe, mt, Bt, Nt, ut, jn", "-", "defaultSelection, setOccasion, defaultOptions, Anlässe je Objekt, Checks", ""],
    ["PostingsScreen", "bt", "-", "renderPosting(kit, ctx, format, page)", "SVG je Format und Seite"],
    ["PostingsScreen", "na, ea, ta, zt, Xn, Qe", "-", "Layout je Look (unio/eigen), Einzelbild, Karussell-Seiten", ""],
    ["PostingsScreen", "An, En, la, Pt, ca", "-", "caption.ts (Bildtext), ZIP, Teilen", ""],
    ["kitAssets", "ju", "m", "createKitAssets(concept, input, contact)", "Kontext für Kit, Postings, Unterlagen"],
    ["kitAssets", "Et", "M", "buildKit(assets)", "Farben, Schriften, Kontakt, Slug, Logo-Varianten (Cache)"],
    ["kitAssets", "la, ca, Fc, Kc", "k, -, -, t", "deliverables-Liste (unio/eigen), laden, Route-Unterlagen", ""],
    ["kitAssets", "Wu, Vu, cr", "c, u, -", "useKitFonts, useUnioFonts, UNIO-Schriften laden", ""],
    ["kitAssets", "Pu, lu, Ds, zc", "-", "ZIP/PDF-Export (Worker render.worker, zip.worker)", ""],
    ["own", "us, Ze, fs, ps, ns, Je", "OWN_DESIGN, ...", "eigenes Design, signatureHtml*", ""],
  ],
  "App-Kern (index)": [
    ["index", "Ik", "b", "createProject(form, time, id)", "Projekt mit input (name, suffix, styles, ...)"],
    ["index", "i0, a0, s0, vo", "c, -, -, -", "Zusatz-Wahl, Rechtsform", ""],
    ["index", "Mg, rC, sC, iC, $L, _L, zL", "-, -, a9, aa, ac, ad, ab", "Namensfinder-Zustand (default, laden, speichern, Charge, Stichworte, gültig)", ""],
    ["index", "m1, hk, Mn, pk, Yn, gk, yk", "-", "fonts.ts (fonts.json, coverage.json, Dateinamen)", ""],
    ["index", "r4, CL, s4", "-", "FontStore (opentype laden, Fallback-Glyphen)", ""],
    ["index", "iT, aT, lT, cT, hT, vT, xT, kT, fu", "-, bt", "symbols/Icons.ts, Container", "Daten (src/symbols/*.json)"],
    ["index", "Yc, aC, oC, lC", "-", "engine/orte.ts", "Daten (src/engine/orte.json)"],
    ["index", "Lg, ZT, Fg", "aN, -, -", "Validierung/Migration Kompass-Brief, Achsen, Route", ""],
    ["index", "e0, kL", "-, J", "Kontakt (leer), Kontakt des Projekts", ""],
    ["index", "HC, WC, VC", "-", "UI-Schriften (Power Grotesk, Outfit, JetBrains Mono)", ""],
  ],
};

const esc = (s) => String(s ?? "").replace(/[\u2013\u2014]/g, "-").replace(/\|/g, "\\|").replace(/\n/g, " ");
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const short = (f) => f.replace(/-[\w-]{8}\.js$/, "");

let md = `# 23 - Modulkarte der gesicherten Fassung

Stand 27.11.2026 (Etappe W1). Arbeitsgrundlage für W3: welche Datei im Bundle welchem früheren
Modul entspricht, welche Funktionen dort stecken und wie sie heißen dürften. Erzeugt mit
\`recovered/harness/modulkarte-roh.mjs\` und \`modulkarte.mjs\`; die Zuordnung der Namen ist
Handarbeit aus der Analyse (\`?\` = Vermutung). Lesbarer Code: \`recovered/pretty/\`.
Zugriff auf jede Funktion im Browser: \`(await import("./assets/<datei>")).__recovered__.<Name>\`
in der instrumentierten Fassung (\`npm run recovered:instrument\`).

## 1. Bibliotheken und Versionen

| Paket | Version | Beleg im Bundle | liegt in |
|---|---|---|---|
| react, react-dom | 18.3.1 | \`.version="18.3.1"\` | index |
| opentype.js | 1.3.4 | 98 % der Zeichenketten, 25 nur in 1.3.4 | index, render.worker |
| polygon-clipping | 0.15.7 | \`POLYGON_CLIPPING_MAX_QUEUE_SIZE\` (ab 0.15.x) | index, render.worker |
| jspdf | 4.2.1 | \`Mt.version="4.2.1"\` | jspdf.es.min |
| svg2pdf.js | 2.8.1 | Link-Rechteck mit \`(n[1]+n[3])\` (neu in 2.8.1), 2.9.0 erst 29.10. | svg2pdf.es.min |
| jszip | 3.10.1 | Banner | zip.worker |
| dompurify | 3.4.17 | Banner (Abhängigkeit von jspdf) | purify.es |
| html2canvas | 1.4.1 | Banner (Abhängigkeit von jspdf) | html2canvas.esm |
| canvg | 3.0.11 | Abhängigkeit von jspdf (\`^3.0.11\`) | index.es |
| core-js | 3.50.0 | \`version:"3.50.0"\` | index.es |
| Vite | 5.x (gewählt 5.4.21) | \`__vite__mapDeps\`, Worker als \`new URL(..., import.meta.url)\` | alle |

Markenschriften: 105 Familien aus \`@fontsource/*\` 5.3.0, 405 Dateien; 404 byte-gleich, eine
(\`noto-serif-display-latin-ext-400-normal.woff\`) aus dem Artifact (\`recovered/fonts-override\`).

## 2. Chunks im Überblick

| Chunk | Größe | Bereich | vermutete Originaldateien | Aufgabe | importiert aus |
|---|---|---|---|---|---|
`;
const seen = new Set();
for (const [c, bereich, orig, rolle] of CHUNKS) {
  if (!bereich || seen.has(c)) continue;
  seen.add(c);
  const f = Object.keys(roh).find((x) => short(x) === c);
  if (!f) continue;
  md += `| ${c} | ${kb(roh[f].bytes)} | ${bereich} | ${esc(orig)} | ${esc(rolle)} | ${roh[f].importsFrom.join(", ")} |\n`;
}
md += `| render.worker | ${kb(sizes["render.worker-ibpAdE4g.js"].bytes)} | Unterlagen | src/deliverables/render.worker.ts | Rendern und PDF im Worker (enthält Engine, opentype, jsPDF) | (klassischer Worker) |
| zip.worker | ${kb(sizes["zip.worker-jGvqp4Ko.js"].bytes)} | Unterlagen | src/deliverables/zip.worker.ts? | ZIP im Worker (JSZip) | (klassischer Worker) |
| html2canvas, index.es, jspdf, purify, svg2pdf | | Bibliotheken | | von jspdf/svg2pdf nachgeladen | |

## 3. Kernfunktionen je Bereich

Diese Funktionen nutzt der Harness (\`recovered/harness/golden.browser.js\`); ihre Ausgaben liegen
als Referenz in \`tests/golden/\`.
`;
for (const [area, rows] of Object.entries(CORE)) {
  md += `\n### ${area}\n\n| Chunk | Name im Bundle | Export | vermuteter Originalname | Zweck |\n|---|---|---|---|---|\n`;
  for (const r of rows) md += `| ${r.map(esc).join(" | ")} |\n`;
}

md += `
## 4. Daten (W1, verlustfrei gezogen)

| Datei | Quelle im Bundle | Zählung |
|---|---|---|
| src/engine/reference/names.json | nameFinder \`kn\` (verdichtet, 9 Spalten) | 5342 (Original-Felder teilweise verloren) |
| src/engine/names/wordsDb.data.json | nameFinder \`kn\` unverändert | 5342 |
| src/engine/reference/keyword-fields.json | nameFinder \`vs\` = {meta, cluster} | 79 Cluster |
| src/engine/reference/naming-rules.json | nameFinder \`xa\` (inkl. tech_muster) | 14 Abschnitte |
| src/engine/reference/corpus.json | nameFinder \`mu\` + engine \`gs\` | 330 Marken |
| src/engine/reference/corpus-tech.json | nameFinder \`pu\` + engine \`ds\` | 192 von 195 (3 nur im Hauptkorpus), 155 mit Logo-Merkmalen |
| src/engine/reference/recipes.json | engine \`Bu\` | 82 (IDs bis R84, R25 und R27 fehlen) |
| src/engine/fonts.json, coverage.json | index \`m1\`, \`hk\` | 105 (inkl. Outfit), 6 nur für Vorlagen |
| src/engine/palettes.json | svg \`rt\`, \`ct\`, \`z\` | Paletten und Farbstimmungen |
| src/symbols/icons.json, containers.snapshot.json | index \`iT\` ... \`kT\`, \`fu\` | Icons mit Zeichenfunktionen als Quelltext |
| src/signature/templates/*.json | engine \`Il\` ... \`Wl\` | 86 (72 freigegeben, 14 Entwürfe, davon 12 Partner) |
| src/strategy/territories.json, axes.json, catalog.json | kompass \`mn\` u. a., texts | 12 Territorien |
| recovered/data-snapshot/*.json | jede Daten-Bindung jedes App-Moduls | Funktionen als \`{"$fn": Quelltext}\` |

## 5. Anhang: alle Exporte und größte Funktionen je Chunk

Spalten: Name im Bundle, Export, Art, Größe in Zeichen, Hinweis (erste deutsche Zeichenkette).
`;
for (const [f, r] of Object.entries(roh).sort((a, b) => b[1].bytes - a[1].bytes)) {
  md += `\n### ${short(f)} (${kb(r.bytes)})\n\nImportiert: ${r.importsFrom.join(", ") || "-"}\n\n`;
  const exp = r.rows.filter((x) => x.export);
  if (exp.length) {
    md += `Exporte (${exp.length}):\n\n| Name | Export | Art | Größe | Hinweis |\n|---|---|---|---|---|\n`;
    for (const x of exp) md += `| ${esc(x.name)} | ${esc(x.export)} | ${x.kind} | ${x.size} | ${esc((x.hint ?? "").slice(0, 80))} |\n`;
  }
  const big = r.rows.filter((x) => !x.export && /Function|Class/.test(x.kind)).sort((a, b) => b.size - a.size).slice(0, 15);
  if (big.length) {
    md += `\nGrößte interne Funktionen:\n\n| Name | Art | Größe | nutzt | Hinweis |\n|---|---|---|---|---|\n`;
    for (const x of big) md += `| ${esc(x.name)} | ${x.kind} | ${x.size} | ${esc(x.imports.slice(0, 6).join(", "))} | ${esc((x.hint ?? "").slice(0, 80))} |\n`;
  }
}
writeFileSync(join(studioRoot, "docs/23-modulkarte.md"), md);
console.log("docs/23-modulkarte.md geschrieben", md.length, "Zeichen");
