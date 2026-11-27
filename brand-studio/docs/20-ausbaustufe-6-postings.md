# 20 - Ausbaustufe 6: Posting-Generator mit UNIO-Objekten

Stand 26.10.2026. Plan zur Entscheidung durch den Owner. Grundlage: Recherche vom 26.10. (Bestand im Studio, UNIO-Plattform app.unio.at, Marktmuster, Rechtliches); Notizen im Scratchpad unter posting/notizen.md.

## 1. Ziel

Der Makler bekommt aus seiner Marke (Logo, Farben, Schriften, Personal-Brand-Richtung aus dem Kompass) fertige Postings für Instagram, Facebook und LinkedIn: zu Anlässen wie "Neu aufgenommen", "Verkauft" oder "Preis angepasst", in den Formaten Post, Story, Karussell und Reel-Cover. Er lädt eigene Fotos und Objektfotos hoch. Später schlägt das Studio zu den Objekten, die er im UNIO-Profil live hat, von selbst passende Postings vor.

## 2. Was es schon gibt

- Social-Vorlagen im eigenen Design und im UNIO-Design (`src/deliverables/items/social.ts`, `src/deliverables/unio/social.ts`): "Neu im Angebot", "Verkauft", "Besichtigung", "Über mich" (4:5), Story, Profilbild, Banner.
- Objektdaten (`ObjectData`) mit Titel, Adresse, Kennzahlen, Energie, Preis, bis zu 4 Fotos; Fotos im Browser gespeichert (`photoStore.ts`); ein Objekt je Projekt.
- Rendering als SVG, Export als PNG, PDF, ZIP im Hintergrund (`render.worker.ts`); Unterlagen können schon mehrere Seiten liefern (Grundlage für Karussells).
- Content-Säulen und Hooks aus der Personal-Brand-Richtung (`RouteTexts.socialKit`).

Lücken: kein 1:1-Post, kein Karussell, kein Reel-Cover; Anlässe "Vermietet", "Reserviert", "Preis angepasst", "Marktupdate" fehlen; keine Bildtexte und Hashtags; nur ein Objekt je Projekt; Bildausschnitt nicht wählbar.

## 3. UNIO-Plattform

- app.unio.at (Next.js, Anmeldung über Keycloak) hat eine öffentliche Objektsuche mit Status (`AVAILABLE`, `RESERVED`, `SOLD`, `RENTED` ...), Kennzahlen, Preis, Provision, Bildern (inkl. Kennzeichen für virtuell möbliert) und Energieausweis. Objekte kommen teils aus JUSTIMMO.
- Es fehlt: eine angemeldete Schnittstelle "meine Objekte" (auch verkaufte), Zeitpunkt des Statuswechsels und Preis-Historie, Benachrichtigung bei Änderungen, Bilder, die das Studio im Browser verarbeiten darf (CORS).
- Vorschlag (bauen müsste das Plattform-Team): `GET /api/agent/me/listings?status=...&updatedSince=...` mit Status, Statuswechsel, Adresse (Straße nur wenn öffentlich), Kennzahlen, Preis inkl. Vorpreis, Provision, Energie (HWB, EEB, Klasse, fGEE, Datum), Bildern mit Kennzeichen und Bildnachweis.
- Übergabe ans Studio: Das Studio läuft eingebettet in app.unio.at; die Plattform gibt die Objekte per Nachricht (`bs:objekte`) weiter. Das Studio braucht so keine eigene Anmeldung und keinen Server.
- Überschneidung: Die Werkbank (unio-gmbh/unio) hat einen kleinen Grafik-Generator und plant Posting-Planer und Meta-Anbindung. Es darf nicht zweimal gebaut werden.

## 4. Rechtliches (vor dem Livegang juristisch prüfen)

- **Energieausweis (EAVG-Novelle, seit 1.7.2026):** Inserate brauchen HWB sowie EEB samt Effizienzklasse; fGEE nur noch bei älteren Ausweisen ohne EEB. Gilt für Anlässe mit Angebot. Im heutigen Studio fehlt das EEB-Feld; die Korrektur ist bereits beauftragt (gilt auch für Flyer, Inserate, Exposés).
- **Bildrechte:** Häkchen beim Upload ("Ich habe die Rechte, auch für Social Media"), optional Bildnachweis; keine erkennbaren Personen ohne Einwilligung.
- **Virtuell möbliert:** deutlich auf dem Bild kennzeichnen (die Plattform liefert das Merkmal mit).
- **"Verkauft":** Standard ohne Preis und ohne genaue Adresse; Preis nur mit Zustimmung des Verkäufers.
- **Provision:** optionale Zeile aus den Objektdaten.

## 5. Etappen

| Etappe | Inhalt | Aufwand |
|---|---|---|
| 6.1 Grundlage | Objekt-Bibliothek je Marke (mehrere Objekte, 10 bis 20 Fotos, Bildausschnitt wählbar), Bildrechte-Häkchen, Kennzeichnung virtuell möbliert, Karussell als mehrseitige Vorlage, JPEG-Export | mittel |
| 6.2 Vorlagen-Set | 9 Anlässe (Neu aufgenommen, Reserviert, Verkauft, Vermietet, Preis angepasst, Besichtigung, Marktupdate, Über mich, Kundenstimme) in 4:5, 1:1, Story, Karussell (5 bis 8 Slides: Hook, Fotos, Kennzahlen, Lage, Aufruf), Reel-Cover; im Look der eigenen Marke und im UNIO-Design; Bildtext und Hashtags aus der Personal-Brand-Richtung (Regeltext, KI optional); Download als ZIP und "Teilen" am Handy | groß |
| 6.3 UNIO-Anbindung | Einbettung in app.unio.at, Übergabe der Objekte, Felder zuordnen, Titel bereinigen, Bilder über die Plattform laden; auf der Plattform die Schnittstelle "meine Objekte" | mittel (Studio) plus mittel (Plattform-Team) |
| 6.4 Vorschläge | Beim Öffnen: neue und geänderte Objekte erkennen und passende Postings vorschlagen ("Neu aufgenommen", "Reserviert", "Verkauft", "Preis angepasst"); später Benachrichtigung über die Plattform | klein, dann mittel |
| 6.5 optional Direkt-Posten | Meta-App mit Prüfung durch Meta, Server mit verschlüsselten Zugängen, Planung und Freigabe; Zwischenlösung Download bzw. Planungs-Tool per CSV | groß |

Muster aus dem Markt: Statuswechsel erzeugt einen Entwurf (Lofty, Xara), Freigabe vor dem Posten ist im Premium-Segment Standard (Luxury Presence), je Anlass eine kleine Serie statt eines Einzelbilds, Bildtext in der Markenstimme, wenige Optionen mit klarer Empfehlung.

## 6. Entscheidungen beim Owner

1. Wer baut den Posting-Generator: Brand Studio (Empfehlung, weil Marke, Vorlagen und Export hier liegen), Werkbank oder app.unio.at?
2. Wer baut auf der Plattform die Schnittstelle "meine Objekte" (Plattform-Team), und kommt das Studio eingebettet in app.unio.at?
3. Standard-Design der Postings: eigene Marke, UNIO-Design oder Co-Branding; Freigabe durch das UNIO-Team nötig?
4. Zuerst nur Download und Teilen (Empfehlung) oder gleich Direkt-Posten über Meta?
5. KI-Bildtexte ja oder nein (Kosten, Einwilligung)?
6. Standards bei "Verkauft" (Preis, Adresse) und Provisionszeile.

Empfehlung: 6.1 und 6.2 sofort im Studio (ohne Plattform), parallel Gespräch mit dem Plattform-Team über die Schnittstelle, dann 6.3 und 6.4; 6.5 erst, wenn Download und Teilen genutzt werden.

## 7. Entscheidungen des Owners (26.10.2026)

- Gebaut wird im Brand Studio.
- 6.1 und 6.2 starten sofort, Objekte per Upload; die UNIO-Anbindung folgt, sobald das Plattform-Team die Schnittstelle liefert.
- Beide Looks: UNIO-Design und eigene Marke mit UNIO-Hinweis ("Partner im UNIO CIRCLE"), der Makler wählt je Posting.
- Zuerst Download und Teilen, kein Direkt-Posten.
- Offen: KI-Bildtexte (bis dahin Regeltexte aus der Personal-Brand-Richtung), Standards bei "Verkauft" (bis dahin ohne Preis und ohne genaue Adresse), Provisionszeile (optional, aus).
