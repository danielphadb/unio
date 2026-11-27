/** Punkt `[x, y]` im 100er-Raster der Symbole. */
export type Pt = number[];
/** Ring (geschlossener Linienzug) aus Punkten. */
export type Ring = Pt[];
/** Polygon: Aussenring, danach Loecher (wie polygon-clipping). */
export type Polygon = Ring[];
/** Mehrere Polygone (MultiPolygon wie polygon-clipping). */
export type Geom = Polygon[];
