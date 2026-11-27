# 22 - Wiederherstellung des Quellcodes

Stand 27.11.2026. Der Quellcode des Brand Studios ging verloren: Die Cloud-Umgebung wurde ersetzt, bevor die Arbeit auf GitHub hochgeladen werden konnte (Push-Fehler 403 bis dahin). Gesichert sind die gebaute Fassung vom 27.10.2026 (`recovered/build`), die Pläne docs/18 und docs/20 sowie die veröffentlichten Seiten (Vorschau-App, Bewertungsseite mit Daten, Plan-Seite).

Ziel: lesbarer, getesteter TypeScript-Quellcode, der sich genauso verhält wie die gesicherte Fassung. Danach wird nach jedem Schritt sofort auf GitHub hochgeladen.

## Etappen

| Etappe | Inhalt |
|---|---|
| W1 Analyse und Daten | Bundles lesbar formatieren, Modulgrenzen und Abhängigkeiten (mit Versionen) bestimmen, alle Daten verlustfrei herausziehen: Wortdatenbank, Stichwort-Felder, Benennungsregeln samt tech_muster, Korpus, Tech-Korpus, Rezepte, Schriftkatalog, Abdeckung, Paletten, Symbole, Signature-Vorlagen samt Partner-Entwürfe, Territorien, Kompass-Katalog, Texte. Projektgerüst (Vite, React, TypeScript, Vitest, Playwright). |
| W2 Referenz-Ausgaben | Die gesicherte Fassung im Browser laufen lassen und für feste Eingaben und Seeds die Ergebnisse aufzeichnen (Logos als SVG, Namenslisten, Routen, Texte, Postings, Unterlagen). Diese Aufzeichnungen sind die Prüfsteine für den neuen Code. |
| W3 Module neu schreiben | Je Bereich (Logo-Engine, Signature-Vorlagen, Namen, Strategie, Postings, Unterlagen, Oberfläche) lesbarer Code nach der früheren Architektur, geprüft gegen die Referenz-Ausgaben. |
| W4 Tests, Doku, Vorschau | Tests, Dokumentation (docs/06, 19, 21 neu aus Daten und Berichten), Vorschau-App aus dem neuen Code, Abgleich mit der gesicherten Fassung. |
