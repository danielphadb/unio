# Higgsfield-API: Recherchestand für das Studio

Stand 14.11.2026. Grundlage ist die öffentliche Dokumentation unter docs.higgsfield.ai (abgerufen am 14.11.2026).
Umgesetzt im Adapter `studio/higgsfield.py`. Alles, was hier als **offen** markiert ist, steht im Code als
`TODO(API)` und ist bewusst nicht erfunden.

## Gesichert (mit Quelle)

| Thema | Inhalt | Quelle |
|---|---|---|
| Basis-URL | `https://api.higgsfield.ai` | docs.higgsfield.ai (Startseite), OpenAPI `servers` in docs.higgsfield.ai/docs/openapi.json |
| Anmeldung | Header `Authorization: Key <KEY_ID>:<KEY_SECRET>`. Schlüssel bestehen aus Key-ID und Secret, angelegt in der Konsole (console.higgsfield.ai). Kein Bearer-Token, Secret nicht im Browser- oder App-Code. Alte Header `hf-api-key` und `hf-secret` werden noch angenommen, neue Integrationen sollen `Authorization` nutzen. | docs.higgsfield.ai/docs/authentication.md, docs.higgsfield.ai/docs/help/faq |
| Ablauf | Asynchron: `POST /<modellpfad>` liefert `status` (`queued`), `request_id`, `status_url`, `cancel_url`, `expires_after` (Sekunden, Beispiel 604800 = 7 Tage). Empfohlen: Header `Idempotency-Key` beim Absenden. | docs.higgsfield.ai/docs/concepts/requests.md |
| Status | `GET /requests/<request_id>/status` (besser die gelieferte `status_url` verwenden). Werte: `queued`, `in_progress`, `completed`, `failed`, `nsfw`, `canceled`. Ergebnis: Bilder in `images[].url`, Video in `video.url`, Fehlertext in `error`, `expires_at` nach Abschluss. | requests.md, OpenAPI Schema `RequestStatus` |
| Abbrechen, Löschen | `POST /requests/<id>/cancel` (202, nur solange `queued`), `DELETE /requests/<id>` (200, 409 solange nicht fertig) | requests.md |
| Aufbewahrung | Ergebnisdateien mindestens 7 Tage abrufbar, danach selbst sichern (das Studio lädt sofort nach `renders/higgsfield/`). | docs.higgsfield.ai (Startseite) |
| Upload | 1. `POST /files/generate-upload-url` mit `{"content_type": "image/jpeg"}` liefert `public_url`, `upload_url`, `upload_headers` (u. a. `x-amz-tagging: retention=temporary`). 2. `PUT upload_url` mit der Datei und allen `upload_headers`, **ohne** Higgsfield-Anmeldung. 3. `public_url` als Eingabe-URL (`image_url` usw.) verwenden. Upload-URL gilt eine Stunde. Typen: jpeg, png, webp, gif, wav, mp4. | docs.higgsfield.ai/docs/concepts/file-uploads.md |
| Kling Bild zu Video | `POST /kling-video/v2.5-turbo/pro/image-to-video` (auch `.../standard/image-to-video`), Felder `prompt` (Pflicht), `image_url` (Pflicht), `duration` 5 oder 10, `cfg_scale` 0 bis 1, `negative_prompt` | OpenAPI docs.higgsfield.ai/docs/openapi.json |
| Weitere Modelle im OpenAPI | `/higgsfield-ai/soul/standard` (Text zu Bild: `prompt`, `num_images` 1 bis 4, `resolution` 2K/4K, `aspect_ratio` u. a. 3:2, 16:9), `/minimax/hailuo-2.3/standard/image-to-video` | OpenAPI |
| Kosten | Abgerechnet werden erfolgreiche Aufträge vom Kontoguthaben, Preis je Modell und Parametern. Schätzung vorab: `POST /estimate/<modellpfad>` mit denselben Parametern, Antwort in USD, z. B. `{"usd": "0.094"}` (Beispielwert). Guthaben verfällt ein Jahr nach Aufladung. | docs.higgsfield.ai/docs/concepts/billing-and-retention.md |

Hinweis der Doku: Das OpenAPI-Dokument ist nur eine ergänzende Referenz, kein verbindlicher Modellkatalog.
Der volle Katalog mit modellspezifischer Doku liegt in der Konsole (console.higgsfield.ai, Anmeldung nötig).

## Offen (nicht in der öffentlichen Doku gefunden)

| Thema | Stand | Im Code |
|---|---|---|
| Nano Banana Pro (Bild mit Referenzbildern) | Weder Pfad noch Parameter öffentlich dokumentiert. Die Modellübersicht (docs/models.md) nennt Soul, Grok, Recraft, Qwen Image, Ideogram, Z-Image, aber kein Nano Banana. Drittanbieter-Seiten nennen Pfade, die wir nicht übernehmen. | `HIGGSFIELD_IMAGE_ENDPOINT` muss gesetzt werden, sonst bricht der Live-Auftrag mit klarer Meldung ab. Feldnamen `image_urls`, `aspect_ratio`, `resolution` sind eine Annahme (TODO). |
| Kling mit Start- **und** Endbild, Zwischenbildern | Das dokumentierte Kling-2.5-Schema kennt nur `image_url`. Unser Ablauf (README, Walkthrough: `start_image`, `end_image`, `image_references`) stammt aus dem Higgsfield-MCP-Werkzeug, nicht aus der REST-Doku. | Live wird nur das Startbild gesendet, Hinweis im Job-Log. Anderer Pfad über `HIGGSFIELD_VIDEO_ENDPOINT`. |
| Guthaben/Credits abfragen | Kein Endpunkt dokumentiert. Abrechnung in USD, nicht in Credits. | `balance()` liefert live `None`, die Oberfläche zeigt „Guthaben unbekannt“. |
| Credits je Auftrag | Keine API-Angabe. Die Werte in der Oberfläche (Bild 2K ca. 1,5, 4K ca. 3 (Annahme), Video Kling 5 s ca. 16, 10 s ca. 32) sind Erfahrungswerte aus der Web-App. | `CREDITS` in `higgsfield.py`; `estimate()` für USD ist vorbereitet. |

Zum Vergleich: Das bisher genutzte Higgsfield-MCP-Werkzeug (LEITFADEN.md: `media_upload`, `generate_image` mit
`nano_banana_pro`, `generate_video`, `balance`) ist eine eigene Schnittstelle für Claude und keine REST-API für
das Studio. Was dort funktioniert, ist für die REST-Pfade kein Beleg.

## Betrieb im Studio

```bash
export HIGGSFIELD_API_KEY=<key-id>          # oder "<key-id>:<secret>"
export HIGGSFIELD_API_SECRET=<secret>
export HIGGSFIELD_IMAGE_ENDPOINT=/<pfad>    # erst nach Bestätigung in der Konsole
.venv-immoviz/bin/python immoviz/immoviz.py studio
```

- Ohne Schlüssel oder mit `--dry-run`: Trockenlauf. Es wird nichts gesendet, das Ergebnis ist das Eingangsbild
  (Video: Standbild-Video aus dem Startbild mit ffmpeg), Credits werden nur simuliert (100 zu Beginn).
- Schlüssel nie in Dateien, nur in der Umgebung. Der Browser bekommt den Schlüssel nie zu sehen, alle Aufrufe
  laufen über den Studio-Server.
- Aufträge laufen über die Queue (ein Job gleichzeitig), mit geschätzten Credits im Job.
- Ergebnis: `renders/higgsfield/<motiv>_<licht>_<JJJJMMTT-HHMMSS>.jpg` bzw. `.mp4`, Metadaten (Original, Referenzen,
  Prompt, Format, Modell, Credits, request_id, Trockenlauf) in `renders/higgsfield/index.json`.

## Vor dem ersten Live-Auftrag prüfen

1. In der Konsole den Modellpfad für Nano Banana Pro (oder Nachfolger) und die Feldnamen für Referenzbilder ablesen,
   `HIGGSFIELD_IMAGE_ENDPOINT` setzen, die Annahmen in `generate_image()` anpassen.
2. Ein Bild mit `estimate()` schätzen lassen und mit der Credit-Anzeige der Web-App vergleichen.
3. Für Video mit Endbild das passende Modell (Kling-Variante mit Endbild) in der Konsole suchen und
   `generate_video()` ergänzen.
