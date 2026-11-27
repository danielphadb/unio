# Referenz-Ausgaben (Golden Master, W2)

Aufgezeichnet aus der gesicherten Fassung vom 27.10.2026 (`recovered/build`), nicht aus neuem Code.
Der neue Code (W3) muss für dieselben Eingaben dieselben Ausgaben liefern.

## Erzeugen und prüfen

```
npm ci
npm run recovered:fonts        # Markenschriften nach public/fonts/brand (byte-gleich mit dem Artifact)
npm run recovered:instrument   # instrumentierte Kopie der gesicherten Fassung
npm run golden                 # schreibt tests/golden/** neu
npm run golden:check           # erzeugt alles in einem Temp-Ordner und vergleicht mit MANIFEST.json
```

Der Harness (`recovered/harness/golden.mjs` mit `golden.browser.js`) startet einen kleinen
statischen Server, öffnet die Fassung in Chromium (`/opt/pw-browsers/chromium`) und ruft die
Funktionen der Bundles direkt auf (Zugriff über den Zusatz-Export `__recovered__`, siehe
`instrument.mjs`). Uhr fest auf `2026-10-27T10:00:00+01:00`, Zeitzone `Europe/Vienna`,
Sprache `de-AT`, Einstellungen wie im Preset der Vorschau (`signatureEntwuerfe: true`).
Reproduzierbarkeit geprüft: zwei vollständige Läufe ergeben dasselbe MANIFEST
(Gesamt-SHA-256 im Kopf von `MANIFEST.json`).

## Eingaben

Alle in `inputs.json` (erfundene Marken, Personen, Kontakte, Objekt):

- 8 Marken: Anna Berger, Philipp Trattner, Wiener Wohnwerk, Seeblick Realitäten, Kalmar,
  Lena Hofer & Partner, Brandl & Söhne, Gebrüder Kogler, je mit Ort, Stil und Kompass-Brief.
- Seeds: 1, 20261027, 987654321.
- Route: jeweils Route A ("sicher") aus `chooseRoutes(brief)` (Standard-Seed des Briefs).

## Inhalt

| Ordner | Was | Funktionen der gesicherten Fassung |
|---|---|---|
| `logo/<marke>.json` | je Marke, ohne und mit Route, je Seed: `generateConcepts` (count 12, Seiten 0 und 1), Pools und Kuratierung der ersten 3 Galerie-Seiten (je 6), Verweise auf SVGs | engine `Ga` (generateConcepts), `Tm` (Seiten-Pool), `Rm` (Kuratierung), `zm` (renderLogo, Variante color) |
| `logo/svg/<marke>/` | die ersten 6 kuratierten Logos je Lauf als SVG | `zm` |
| `names/<marke>.json` | je Seed, ohne und mit Route: Profil, Namens-Chargen, Namenskarten (Konzepte), `pruefeEigenenNamen`, `alternativenFuer` (12) | nameFinder `Rd`, `jd`, `Yd`, `Zd`, `_d`; kompass `rr` |
| `names/svg/<marke>/` | die ersten 6 Namenskarten je Lauf als SVG (Eingabe wie NameCard: `Gt`, Fläche aus `qs`) | engine `zm` |
| `strategy/routes.json` | `chooseRoutes` für 10 Briefe (8 Marken mit Namen, 2 ohne), Standard-Seed und Seed 7, mit Texten | kompass `Dn` |
| `postings/index.json`, `postings/svg/<look>/<anlass>/<format>.svg.gz` | Postings je Look (unio, eigen), Anlass (9) und Format (5, Karussell je Seite) für das erfundene Objekt | PostingsScreen `bt`, `Pe`, `mt`; kitAssets `ju`, `Et` |
| `unterlagen/index.json`, `unterlagen/svg/<set>/<id>[-n].svg.gz` | alle Unterlagen der Sets unio und eigen, je Seite | kitAssets `ca`, `item.pages`/`item.preview` |

SVGs in `logo/` und `names/` liegen unkomprimiert, Postings und Unterlagen als gzip (ohne
Zeitstempel, deterministisch). Jeder Verweis trägt `sha256` und `bytes` des unkomprimierten SVG.

Hinweise:
- Konzept-IDs und Reihenfolgen sind Teil der Referenz. Zuerst diese angleichen, dann die SVGs.
- Namenskarten mit Variante `reverse` zeichnen in Papierfarbe; die dunkle Fläche liefert die Karte.
- Postings ohne Fotos zeigen die Platzhalter wie die Vorschau ohne hochgeladene Bilder.
