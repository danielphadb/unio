"""Umgebungsdaten aus dem Open-Government-Data-Angebot der Stadt Wien laden.

Quellen (Lizenz CC BY 4.0, Namensnennung "Datenquelle: Stadt Wien - data.wien.gv.at"):
- FMZKBKMOGD: Baukoerpermodell der Flaechen-Mehrzweckkarte (Gebaeudebloecke mit Hoehen)
- BAUMKATOGD: Baumkataster (Strassenbaeume mit Hoehe und Kronendurchmesser)
- FMZKVERKEHR1OGD / FMZKVERKEHR2OGD: Verkehrsflaechen (Fahrbahn, Gehsteig, Parkstreifen, Zebrastreifen)
- GEBAEUDEINFOOGD: Gebaeudeinformation (Geschosszahl, Bautyp, Bauperiode)
- OGDAddressService: Adresssuche

Alle Koordinaten werden in ein lokales Meter-System umgerechnet:
Ursprung = Gebaeudeecke aus project.yaml, x-Achse entlang der in project.yaml genannten Fassade.
"""
from __future__ import annotations

import json
import math
import urllib.parse
import urllib.request
from pathlib import Path

WFS = "https://data.wien.gv.at/daten/geo"
ADDR = "https://data.wien.gv.at/daten/OGDAddressService.svc/GetAddressInfo"
CRS = "EPSG:31256"  # MGI / Austria GK East, Meter

LAYERS = {
    "buildings": "FMZKBKMOGD",
    "trees": "BAUMKATOGD",
    "traffic1": "FMZKVERKEHR1OGD",
    "traffic2": "FMZKVERKEHR2OGD",
    "info": "GEBAEUDEINFOOGD",
    "contours": "HOEHENLINIEOGD",   # Hoehenlinien 1 m, Hoehe ueber Wiener Null
}

# Klassen laut Baumkataster: Hoehe und Kronendurchmesser sind in Klassen angegeben
TREE_HEIGHT_M = {1: 4, 2: 8, 3: 13, 4: 18, 5: 23, 6: 28, 7: 33, 8: 38}
TREE_CROWN_M = {1: 2.5, 2: 5, 3: 8, 4: 11, 5: 14, 6: 17, 7: 20, 8: 23}


def _get_json(url: str, timeout: int = 90) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "immoviz/0.1"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def geocode(address: str, crs: str = CRS) -> tuple[float, float, dict]:
    q = urllib.parse.urlencode({"Address": address, "crs": crs})
    d = _get_json(f"{ADDR}?{q}")
    f = d["features"][0]
    x, y = f["geometry"]["coordinates"][:2]
    return x, y, f["properties"]


def geocode_wgs84(address: str) -> tuple[float, float]:
    x, y, _ = geocode(address, "EPSG:4326")
    return y, x  # lat, lon


def fetch_layer(layer: str, lat: float, lon: float, radius_m: float) -> list[dict]:
    dlat = radius_m / 111_320
    dlon = radius_m / (111_320 * math.cos(math.radians(lat)))
    # WFS 1.1.0 mit urn-CRS erwartet die Achsenreihenfolge lat,lon
    bbox = f"{lat - dlat},{lon - dlon},{lat + dlat},{lon + dlon},urn:ogc:def:crs:EPSG::4326"
    q = urllib.parse.urlencode({
        "service": "WFS", "version": "1.1.0", "request": "GetFeature",
        "typeName": f"ogdwien:{layer}", "srsName": CRS, "outputFormat": "json", "bbox": bbox,
    })
    return _get_json(f"{WFS}?{q}")["features"]


def _rings(geom: dict) -> list[list[list[float]]]:
    """Liefert die Aussenringe aller Polygone (Loecher werden ignoriert)."""
    if geom is None:
        return []
    if geom["type"] == "Polygon":
        return [geom["coordinates"][0]]
    if geom["type"] == "MultiPolygon":
        return [p[0] for p in geom["coordinates"]]
    return []


class LocalFrame:
    """Lokales Koordinatensystem: Ursprung an der Gebaeudeecke, x entlang einer Fassade."""

    def __init__(self, ox: float, oy: float, angle_deg: float):
        self.ox, self.oy = ox, oy
        self.a = math.radians(angle_deg)
        self.c, self.s = math.cos(self.a), math.sin(self.a)

    def __call__(self, x: float, y: float) -> tuple[float, float]:
        dx, dy = x - self.ox, y - self.oy
        return (round(dx * self.c + dy * self.s, 3), round(-dx * self.s + dy * self.c, 3))

    def to_dict(self) -> dict:
        return {"origin_gk": [self.ox, self.oy], "x_axis_deg": math.degrees(self.a), "crs": CRS}


def build_context(cfg: dict, out_path: Path) -> dict:
    """Laedt alle Layer, rechnet sie ins lokale System um und speichert context.json."""
    site = cfg["site"]
    lat, lon = geocode_wgs84(site["address"])
    radius = site.get("radius_m", 160)
    frame = LocalFrame(*site["origin_gk"], site["x_axis_deg"])

    raw = {k: fetch_layer(v, lat, lon, radius) for k, v in LAYERS.items()}
    hero_ids = set(site.get("hero_bezug", []))

    buildings, hero = [], []
    for f in raw["buildings"]:
        p = f["properties"]
        if p.get("O_KOTE") is None or p.get("T_KOTE") is None:
            continue
        h = round(p["O_KOTE"] - p["T_KOTE"], 2)
        for ring in _rings(f["geometry"]):
            poly = [frame(x, y) for x, y, *_ in ring][:-1]
            item = {"id": p["FMZK_ID"], "bezug": p.get("BEZUG"), "height": h,
                    "ground": p["T_KOTE"], "klasse": p.get("F_KLASSE"), "poly": poly}
            (hero if p.get("BEZUG") in hero_ids else buildings).append(item)

    surfaces = []
    for key in ("traffic1", "traffic2"):
        for f in raw[key]:
            for ring in _rings(f["geometry"]):
                surfaces.append({"layer": f["properties"]["LAYER"],
                                 "poly": [frame(x, y) for x, y, *_ in ring][:-1]})

    trees = []
    for f in raw["trees"]:
        p = f["properties"]
        x, y = f["geometry"]["coordinates"][:2]
        trees.append({"pos": frame(x, y), "species": p.get("GATTUNG_ART"),
                      "height": TREE_HEIGHT_M.get(p.get("BAUMHOEHE"), 8),
                      "crown": TREE_CROWN_M.get(p.get("KRONENDURCHMESSER"), 5)})

    contours = []
    for f in raw["contours"]:
        h = f["properties"].get("HOEHE_WIEN")
        g = f["geometry"]
        lines = [g["coordinates"]] if g["type"] == "LineString" else g.get("coordinates", [])
        for line in lines:
            for k, (x, y, *_) in enumerate(line):
                if k % 2 == 0:
                    contours.append([*frame(x, y), h])

    info = [{"acd": f["properties"]["ACD"], "street": f["properties"]["STRNAML"],
             "nr": f["properties"]["VONN"], "floors": f["properties"]["GESCH_ANZ"],
             "type": f["properties"]["L_BAUTYP"], "period": f["properties"]["L_BAUJ"]}
            for f in raw["info"]]

    ctx = {"frame": frame.to_dict(), "lat": lat, "lon": lon, "radius_m": radius,
           "source": "Datenquelle: Stadt Wien - data.wien.gv.at (CC BY 4.0)",
           "hero": hero, "buildings": buildings, "contours": contours, "surfaces": surfaces, "trees": trees, "info": info}
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(ctx, ensure_ascii=False))
    return ctx
