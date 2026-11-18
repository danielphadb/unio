# Objekt- und Materialbibliothek: Quellen und Lizenzen

Stand 18.11.2026. Grundsatz: nur selbst erzeugte Geometrie oder CC0-Material, keine fremden Modelle mit unklarer
Lizenz. Jede neue Quelle wird hier eingetragen, bevor sie verwendet wird.

## Geometrie (alles selbst erzeugt, parametrisch)

| Bereich | Code | Herkunft |
|---|---|---|
| Bäume (Linde, Ahorn, Platane, Kastanie, Säulenform) | `lib/assets/baeume.py` | eigener Verzweigungs-Algorithmus (Kronenhülle je Art, Gerüstäste, Zweige, Blattumrisse), keine Fremddaten |
| Autos (Kleinwagen, Kompakt, Kombi, SUV, Transporter) | `lib/assets/autos.py` | eigene Querschnitte nach üblichen Klassenmaßen, keine Fremdmodelle, Kennzeichen ohne Schrift |
| Wiener Straßenleuchten | `lib/assets/leuchten.py` | eigene Drehkörper und Rohre nach Bauart (Hängeleuchte, Peitschen-/Aufsatzmast, Wandarm, Altwiener Laterne), Lage aus dem Inventar je Projekt |
| Straßenmöbel, Platzhalter Menschen | `lib/assets/moebel.py` | eigene Grundformen; Verkehrszeichen ohne lesbare Schrift oder Symbole |
| Grundformen | `lib/assets/form.py` | eigener Code |

## Materialien

| Material | Herkunft | Lizenz |
|---|---|---|
| Putz, Stuck, Asphalt, Gehsteig, Granitpflaster, Granit, Zink, Glas, Lack, Holz, Interior Mapping, Laub, Rinde | prozedurale Shader-Knoten in `lib/materials.py` | eigener Code |
| `asphalt_02` (Asphalt, 3 m) | Poly Haven, https://polyhaven.com/a/asphalt_02 | CC0 1.0 (gemeinfrei) |
| `concrete_pavement_02` (Betonplatten, 1,8 m) | Poly Haven, https://polyhaven.com/a/concrete_pavement_02 | CC0 1.0 (gemeinfrei) |
| `white_stucco` (Putzkorn, 2 m) | Poly Haven, https://polyhaven.com/a/white_stucco | CC0 1.0 (gemeinfrei) |

Die drei Poly-Haven-Texturen sind optional: `immoviz.py texturen` lädt sie (2k, JPG: Farbe, Rauheit, Normalen) über die
öffentliche API nach `immoviz/assets/texturen/<id>/` (gitignored, rund 30 MB). Sie liefern nur Helligkeitsvariation,
Rauheit und Relief; die Farbe bleibt die des Materials. Ohne die Bilder rendern alle Materialien rein prozedural.
Lizenztext CC0: https://creativecommons.org/publicdomain/zero/1.0/ (Poly Haven: https://polyhaven.com/license).

## Referenzen, die nicht ins Modell gehen

Google Street View diente nur zum Ansehen (Leuchten-Inventar, Poller, Zeichen), Bilder in
`projects/<objekt>/renders/streetview/leuchten/` (gitignored, nie im Repo, nie im Bild). Übernommen werden nur Zahlen
(Lage, Höhe, Bauart) mit Quelle im Feld `quelle`.
