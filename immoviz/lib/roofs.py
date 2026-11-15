"""Echte Dachflaechen der Umgebung aus dem Dachmodell (LOD2) der Stadt Wien.

Quelle (Lizenz CC BY 4.0, "Datenquelle: Stadt Wien - data.wien.gv.at"):
- Generalisiertes Dachmodell LOD2 der MA 41 als CityGML, Kacheln im Blattschnitt der Mehrzweckkarte 1:1000
  (500 x 500 m, Bezeichnung RE/HO wie im WFS-Layer MZKBLATT1000OGD, z. B. 103077).
  Abruf: https://www.wien.gv.at/ma41datenviewer/downloads/geodaten/lod2_gml/<blatt>_lod2_gml.zip
  Inhalt je Gebaeude (gml:name = BEZUG des Baukoerpermodells): RoofSurface-Polygone mit Hoehen ueber Wiener Null,
  Dachneigung und Dachorientierung. Datenstand der Kacheln: 2016 (Befliegung davor).
- Orthofoto 2024 der Stadt Wien (WMTS) nur zum Abtasten der mittleren Dachfarbe je Dachflaeche.

Ablauf (`immoviz.py daecher <projekt>`): Kacheln im Radius laden, Dachflaechen ins lokale System umrechnen,
jede Flaeche dem Baukoerper (FMZK_ID) aus context.json zuordnen, Hoehen relativ zum Sockel dieses Baukoerpers
speichern, Material aus Neigung und Orthofoto-Farbe bestimmen. Ergebnis: data/roofs.json.

Wo das Dachmodell fehlt oder aelter ist als das Baukoerpermodell (Neubau, Aufstockung), bekommt das Gebaeude
eine heuristische Dachform (`heuristic_roof`) bzw. bleibt bei den Hoehenstufen des Baukoerpermodells.
"""
from __future__ import annotations

import io
import json
import math
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

LOD2_URL = "https://www.wien.gv.at/ma41datenviewer/downloads/geodaten/lod2_gml/{blatt}_lod2_gml.zip"
ORTHO_URL = "https://mapsneu.wien.gv.at/wmts/lb2024/farbe/google3857/{z}/{row}/{col}.jpeg"
NS = {"bldg": "http://www.opengis.net/citygml/building/1.0", "gml": "http://www.opengis.net/gml",
      "gen": "http://www.opengis.net/citygml/generics/1.0"}
B, G, GEN = "{%s}" % NS["bldg"], "{%s}" % NS["gml"], "{%s}" % NS["gen"]

# Materialklassen der Daecher (Namen der Blender-Materialien in lib/materials.py)
FLACH_BIS_GRAD = 8.0
KLASSEN = ("dach_ziegel", "dach_ziegel_dunkel", "dach_blech", "dach_blech_hell", "dach_kies", "dach_gruen",
           "dach_flach")


def _get(url: str, timeout: int = 180) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "immoviz/0.1"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def blaetter(origin_gk, radius_m: float) -> list[str]:
    """Blattnummern 1:1000 (500 m Raster in GK Ost): RE = 100 + x/500, HO = y/500 - 600."""
    ox, oy = origin_gk
    out = []
    for i in range(int((ox - radius_m) // 500), int((ox + radius_m) // 500) + 1):
        for j in range(int((oy - radius_m) // 500), int((oy + radius_m) // 500) + 1):
            out.append(f"{100 + i:03d}{j - 600:03d}")
    return out


def _parse_gml(fh, frame, radius_m: float):
    """Liefert je Gebaeude (bezug, [Dachflaeche]) mit Punkten im lokalen System und Hoehe ueber Wiener Null."""
    for _, el in ET.iterparse(fh, events=("end",)):
        if el.tag != B + "Building":
            continue
        bezug = (el.findtext(G + "name") or "").strip()
        faces = []
        for rs in el.iter(B + "RoofSurface"):
            attr = {a.get("name"): a.findtext(GEN + "value") for a in rs.iter(GEN + "stringAttribute")}
            for pl in rs.iter(G + "posList"):
                v = [float(t) for t in (pl.text or "").split()]
                pts = [(*frame(v[k], v[k + 1]), v[k + 2]) for k in range(0, len(v) - 2, 3)]
                if len(pts) > 1 and pts[0] == pts[-1]:
                    pts = pts[:-1]
                if len(pts) < 3:
                    continue
                cx = sum(p[0] for p in pts) / len(pts)
                cy = sum(p[1] for p in pts) / len(pts)
                if math.hypot(cx, cy) > radius_m:
                    continue
                faces.append({"pts": pts, "slope": float(attr.get("Dachneigung") or 0.0),
                              "ori": float(attr.get("Dachorientierung") or 0.0)})
        el.clear()
        if faces:
            yield bezug, faces


def _pip(x, y, poly):
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi:
            inside = not inside
        j = i
    return inside


class _Index:
    """Raster-Index der Baukoerper fuer die Zuordnung Dachflaeche zu Baukoerper."""

    def __init__(self, buildings, cell=25.0):
        self.cell, self.grid, self.b = cell, {}, buildings
        for k, b in enumerate(buildings):
            xs = [p[0] for p in b["poly"]]
            ys = [p[1] for p in b["poly"]]
            for i in range(int(min(xs) // cell), int(max(xs) // cell) + 1):
                for j in range(int(min(ys) // cell), int(max(ys) // cell) + 1):
                    self.grid.setdefault((i, j), []).append(k)

    def find(self, x, y, bezug=None):
        """Baukoerper, der den Punkt enthaelt: zuerst gleicher BEZUG, sonst der hoechste."""
        hits = [self.b[k] for k in self.grid.get((int(x // self.cell), int(y // self.cell)), [])
                if _pip(x, y, self.b[k]["poly"])]
        if not hits:
            return None
        same = [b for b in hits if str(b.get("bezug")) == str(bezug)]
        return max(same or hits, key=lambda b: b["height"])


def _inner_point(pts):
    """Punkt sicher innerhalb des Polygons (Schwerpunkt, sonst Mitte eines Ohr-Dreiecks)."""
    xy = [(p[0], p[1]) for p in pts]
    cx = sum(p[0] for p in xy) / len(xy)
    cy = sum(p[1] for p in xy) / len(xy)
    if _pip(cx, cy, xy):
        return cx, cy
    n = len(xy)
    for i in range(n):
        a, b, c = xy[i - 1], xy[i], xy[(i + 1) % n]
        mx, my = (a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3
        if _pip(mx, my, xy):
            return mx, my
    return cx, cy


# ---------------------------------------------------------------- Orthofoto-Farbe
class Ortho:
    """Mosaik des Orthofotos Wien (WMTS, Web-Mercator) ueber den Radius, abgetastet im lokalen System."""

    def __init__(self, ctx, radius_m: float, zoom: int = 19, cache_dir: Path | None = None):
        import numpy as np
        from PIL import Image
        from pyproj import Transformer
        self.np, self.zoom = np, zoom
        fr = ctx["frame"]
        self.ox, self.oy = fr["origin_gk"]
        self.a = math.radians(fr["x_axis_deg"])
        self.tr = Transformer.from_crs("EPSG:31256", "EPSG:3857", always_xy=True)
        self.world = 2 * math.pi * 6378137.0
        self.res = self.world / (256 * 2 ** zoom)       # Meter (Mercator) je Pixel
        corners = [self._merc(x, y) for x in (-radius_m, radius_m) for y in (-radius_m, radius_m)]
        c0 = int(min(self._px(*c)[0] for c in corners) // 256)
        c1 = int(max(self._px(*c)[0] for c in corners) // 256)
        r0 = int(min(self._px(*c)[1] for c in corners) // 256)
        r1 = int(max(self._px(*c)[1] for c in corners) // 256)
        self.c0, self.r0 = c0, r0
        self.img = Image.new("RGB", ((c1 - c0 + 1) * 256, (r1 - r0 + 1) * 256), (128, 128, 128))
        self.fehlend = 0
        def lade(rc):
            row, col = rc
            cf = cache_dir / f"{zoom}_{row}_{col}.jpeg" if cache_dir else None
            try:
                if cf and cf.exists():
                    return rc, cf.read_bytes()
                data = _get(ORTHO_URL.format(z=zoom, row=row, col=col), 40)
                if cf:
                    cf.parent.mkdir(parents=True, exist_ok=True)
                    cf.write_bytes(data)
                return rc, data
            except Exception:
                return rc, None

        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(8) as ex:
            for (row, col), data in ex.map(lade, [(r, c) for r in range(r0, r1 + 1) for c in range(c0, c1 + 1)]):
                if data is None:
                    self.fehlend += 1
                    continue
                self.img.paste(Image.open(io.BytesIO(data)).convert("RGB"), ((col - c0) * 256, (row - r0) * 256))
        self.arr = np.asarray(self.img)

    def _merc(self, x, y):
        gx = self.ox + x * math.cos(self.a) - y * math.sin(self.a)
        gy = self.oy + x * math.sin(self.a) + y * math.cos(self.a)
        return self.tr.transform(gx, gy)

    def _px(self, mx, my):
        return (mx + self.world / 2) / self.res, (self.world / 2 - my) / self.res

    def pixel(self, x, y):
        """Pixelkoordinate im Mosaik zu einem lokalen Punkt."""
        px, py = self._px(*self._merc(x, y))
        return px - self.c0 * 256, py - self.r0 * 256

    def mean_rgb(self, pts):
        """Median-Farbe innerhalb eines lokalen Polygons (None, wenn zu klein oder ausserhalb)."""
        from PIL import Image, ImageDraw
        np = self.np
        pp = [self.pixel(p[0], p[1]) for p in pts]
        x0, y0 = int(min(p[0] for p in pp)), int(min(p[1] for p in pp))
        x1, y1 = int(max(p[0] for p in pp)) + 1, int(max(p[1] for p in pp)) + 1
        if x0 < 0 or y0 < 0 or x1 > self.arr.shape[1] or y1 > self.arr.shape[0] or x1 - x0 < 2 or y1 - y0 < 2:
            return None
        m = Image.new("L", (x1 - x0, y1 - y0), 0)
        ImageDraw.Draw(m).polygon([(p[0] - x0, p[1] - y0) for p in pp], fill=255)
        mask = np.asarray(m) > 0
        if mask.sum() < 4:
            return None
        return [float(v) for v in np.median(self.arr[y0:y1, x0:x1][mask], axis=0)]


def klassifiziere(slope: float, rgb) -> str:
    """Materialklasse aus Neigung und Orthofoto-Farbe (0 bis 255). Ohne Farbe entscheidet nur die Neigung."""
    flach = slope < FLACH_BIS_GRAD
    if rgb is None:
        return "dach_flach" if flach else ("dach_blech" if slope < 25 else "dach_ziegel")
    r, g, b = rgb
    v = max(r, g, b) / 255.0
    s = (max(r, g, b) - min(r, g, b)) / (max(r, g, b) + 1e-6)
    # Das Orthofoto ist dunstig und kontrastarm: Ziegel liegt nur 5 bis 20 Prozent ueber Gruen und Blau
    rot = r > g * 1.05 and r > b * 1.10
    gruen = g > r * 1.04 and g > b * 1.10
    if flach:
        if gruen and s > 0.12:
            return "dach_gruen"
        if rot and s > 0.2:
            return "dach_ziegel"
        return "dach_kies" if v > 0.55 else "dach_flach"
    if rot:
        return "dach_ziegel" if (r > g * 1.09 and v > 0.55) else "dach_ziegel_dunkel"
    if gruen and s > 0.16:
        return "dach_gruen" if slope < 15 else "dach_blech"
    return "dach_blech_hell" if v > 0.68 else "dach_blech"


# ---------------------------------------------------------------- Abruf
def fetch(cfg: dict, ctx: dict, out_path: Path, cache_dir: Path | None = None, ortho: bool = True) -> dict:
    """Laedt das Dachmodell im Radius, ordnet es den Baukoerpern zu und schreibt roofs.json."""
    from .geo_wien import LocalFrame
    site = cfg["site"]
    radius = float(site.get("roof_radius_m", site.get("radius_m", 300)))
    frame = LocalFrame(*site["origin_gk"], site["x_axis_deg"])
    hero_ids = {str(h) for h in site.get("hero_bezug", [])}
    bkm = [b for b in ctx["buildings"] if len(b["poly"]) >= 3 and b["height"] >= 1.0]
    index = _Index(bkm)
    ort = None
    if ortho:
        try:
            ort = Ortho(ctx, radius + 20, 19, cache_dir / "ortho" if cache_dir else None)
        except Exception as e:      # Farbe ist Zusatz, Dachform geht vor
            print("Orthofoto nicht verfuegbar:", e)
    namen = set()
    roofs, stats = [], {"blaetter": [], "flaechen_lod2": 0, "ohne_baukoerper": 0, "veraltet": 0, "objekt": 0}
    for blatt in blaetter(site["origin_gk"], radius):
        cf = cache_dir / f"{blatt}_lod2_gml.zip" if cache_dir else None
        try:
            if cf and cf.exists():
                data = cf.read_bytes()
            else:
                data = _get(LOD2_URL.format(blatt=blatt))
                if cf:
                    cf.parent.mkdir(parents=True, exist_ok=True)
                    cf.write_bytes(data)
        except Exception as e:
            stats["blaetter"].append({"blatt": blatt, "fehler": str(e)})
            continue
        zf = zipfile.ZipFile(io.BytesIO(data))
        n0 = len(roofs)
        for name in zf.namelist():
            if not name.lower().endswith(".gml"):
                continue
            with zf.open(name) as fh:
                for bezug, faces in _parse_gml(fh, frame, radius):
                    namen.add(bezug)
                    stats["flaechen_lod2"] += len(faces)
                    if bezug in hero_ids:
                        stats["objekt"] += len(faces)
                        continue
                    # freie Kanten: Kanten, die nur eine Dachflaeche des Gebaeudes hat (Giebel, Brandwand, Traufe)
                    cnt = {}
                    for f in faces:
                        p = f["pts"]
                        for i in range(len(p)):
                            a, b_ = p[i], p[(i + 1) % len(p)]
                            k = tuple(sorted(((round(a[0], 1), round(a[1], 1), round(a[2], 1)),
                                              (round(b_[0], 1), round(b_[1], 1), round(b_[2], 1)))))
                            cnt[k] = cnt.get(k, 0) + 1
                    for f in faces:
                        p = f["pts"]
                        ix, iy = _inner_point(p)
                        b = index.find(ix, iy, bezug)
                        if b is None:
                            stats["ohne_baukoerper"] += 1
                            continue
                        top_abs = b["ground"] + b["height"]
                        zmax = max(q[2] for q in p)
                        if zmax < top_abs - 1.5:      # Baukoerper heute hoeher als das Dach von damals
                            stats["veraltet"] += 1
                            continue
                        free = []
                        for i in range(len(p)):
                            a, b_ = p[i], p[(i + 1) % len(p)]
                            k = tuple(sorted(((round(a[0], 1), round(a[1], 1), round(a[2], 1)),
                                              (round(b_[0], 1), round(b_[1], 1), round(b_[2], 1)))))
                            if cnt[k] == 1:
                                free.append(i)
                        rgb = ort.mean_rgb(p) if ort else None
                        roofs.append({"id": b["id"], "bezug": str(b.get("bezug")), "lod2": bezug,
                                      "s": round(f["slope"], 1), "o": round(f["ori"], 0),
                                      "rgb": [round(c) for c in rgb] if rgb else None,
                                      "p": [[round(q[0], 2), round(q[1], 2), round(q[2] - b["ground"], 2)] for q in p],
                                      "e": free})
        stats["blaetter"].append({"blatt": blatt, "flaechen": len(roofs) - n0})
    # Baukoerper mit neuer Nummer, die das Dachmodell nicht kennt, sind seither neu gebaut: altes Dach verwerfen
    n0 = len(roofs)
    roofs = [r for r in roofs if r["lod2"] == r["bezug"] or r["bezug"] in namen]
    stats["veraltet"] += n0 - len(roofs)
    _materialien(roofs)
    mit = {r["id"] for r in roofs}
    haupt = [b for b in bkm if b.get("klasse") == 11 and b["height"] > 8.0
             and str(b.get("bezug")) not in hero_ids
             and math.hypot(sum(p[0] for p in b["poly"]) / len(b["poly"]),
                            sum(p[1] for p in b["poly"]) / len(b["poly"])) <= radius]
    stats.update({"flaechen": len(roofs), "gebaeude_mit_dach": len(mit),
                  "hauptgebaeude": len(haupt), "hauptgebaeude_mit_dach": sum(1 for b in haupt if b["id"] in mit),
                  "material": {k: sum(1 for r in roofs if r["m"] == k) for k in KLASSEN},
                  "orthofoto_kacheln_fehlend": ort.fehlend if ort else None})
    out = {"source": "Datenquelle: Stadt Wien - data.wien.gv.at (CC BY 4.0), Generalisiertes Dachmodell LOD2 (MA 41), "
                     "Dachfarbe aus Orthofoto 2024",
           "radius_m": radius, "stats": stats, "roofs": roofs}
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    return out


def _materialien(roofs):
    """Material je Dachflaeche; geneigte Flaechen eines Gebaeudes bekommen die flaechengewichtete Mehrheit,
    damit Schattenseiten im Orthofoto nicht zu einem anderen Material fuehren."""
    by = {}
    for r in roofs:
        r["m"] = klassifiziere(r["s"], r.get("rgb"))
        if r["s"] >= FLACH_BIS_GRAD:
            by.setdefault((r["lod2"], r["bezug"]), []).append(r)
    for group in by.values():
        w = {}
        for r in group:
            w[r["m"]] = w.get(r["m"], 0.0) + _area3(r["p"])
        ziegel = sum(v for k, v in w.items() if k.startswith("dach_ziegel"))
        blech = sum(v for k, v in w.items() if k.startswith("dach_blech"))
        if ziegel >= blech * 0.6:      # Schattenseiten verlieren im Orthofoto den Rotton
            best = "dach_ziegel" if w.get("dach_ziegel", 0) >= w.get("dach_ziegel_dunkel", 0) * 0.5 else "dach_ziegel_dunkel"
        else:
            best = "dach_blech_hell" if w.get("dach_blech_hell", 0) > w.get("dach_blech", 0) else "dach_blech"
        for r in group:
            # Ziegeldach: auch die Schattenseite ist Ziegel, nur deutlich helles Blech (Gauben, Aufbauten) bleibt
            if _area3(r["p"]) < 25.0 or r["m"][:10] == best[:10] or \
                    (best.startswith("dach_ziegel") and r["m"] == "dach_blech" and r["s"] >= 20):
                r["m"] = best


def _area3(p):
    nx = ny = nz = 0.0
    for i in range(len(p)):
        a, b = p[i], p[(i + 1) % len(p)]
        nx += (a[1] - b[1]) * (a[2] + b[2])
        ny += (a[2] - b[2]) * (a[0] + b[0])
        nz += (a[0] - b[0]) * (a[1] + b[1])
    return 0.5 * math.sqrt(nx * nx + ny * ny + nz * nz)


def load(project_dir: Path) -> dict:
    """roofs.json als Nachschlagetabelle {FMZK_ID: [Dachflaeche]} und {BEZUG: [Dachflaeche]}."""
    p = project_dir / "data" / "roofs.json"
    if not p.exists():
        return {"by_id": {}, "by_bezug": {}}
    d = json.loads(p.read_text())
    by_id, by_bezug = {}, {}
    for r in d["roofs"]:
        by_id.setdefault(r["id"], []).append(r)
        by_bezug.setdefault(r["bezug"], []).append(r)
    return {"by_id": by_id, "by_bezug": by_bezug, "stats": d.get("stats")}


# ---------------------------------------------------------------- Geometrie fuer Blender
def add_faces(mb_roof, mb_wall, faces, z_off: float, wall_top: float, wall_mat: str, mat_override=None):
    """Baut Dachflaechen und die Waende darunter (Giebel, Brandwaende, Gaubenwangen) in zwei MeshBuilder.

    z_off: Hoehe des Baukoerper-Sockels in der Szene; wall_top: Oberkante der extrudierten Wand (relativ zum Sockel).
    Freie Dachkanten bekommen eine senkrechte Flaeche bis wall_top, wenn sie darueber liegen."""
    for r in faces:
        p = r["p"]
        pts = [(x, y, z + z_off) for x, y, z in p]
        # UV: u entlang der Hoehenlinie, v in Falllinie (Stehfalz und Ziegelreihen laufen damit richtig)
        o = math.radians(r.get("o", 0.0))
        sl = math.cos(math.radians(min(r.get("s", 0.0), 80.0)))
        uv = [(x * math.cos(o) - y * math.sin(o), (x * math.sin(o) + y * math.cos(o)) / max(sl, 0.2)) for x, y, _ in p]
        mb_roof.poly(pts, uv, mat_override or r["m"], (0, 0, 1))
        for i in r.get("e", []):
            a, b = p[i], p[(i + 1) % len(p)]
            if max(a[2], b[2]) <= wall_top + 0.08:
                continue
            za, zb = min(a[2], wall_top), min(b[2], wall_top)
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            if L < 0.02:
                continue
            quad = [(a[0], a[1], za + z_off), (b[0], b[1], zb + z_off), (b[0], b[1], b[2] + z_off), (a[0], a[1], a[2] + z_off)]
            mb_wall.poly(quad, [(0, za), (L, zb), (L, b[2]), (0, a[2])], wall_mat)


def wall_top(height: float, faces) -> float:
    """Oberkante der Wandextrusion: Traufhoehe des Baukoerpermodells, hoechstens die tiefste Dachkante."""
    if not faces:
        return height
    return max(2.0, min(height, min(q[2] for r in faces for q in r["p"])))


def heuristic_roof(mb_roof, mb_wall, poly, h: float, z_off: float, mat: str, wall_mat: str,
                   street_edges=None, pitch_deg: float = 38.0, max_rise: float = 5.5):
    """Satteldach ohne Dachdaten: First parallel zur laengsten (Strassen-)Kante, Giebel als Brandwaende.

    Das Polygon wird im System der Firstrichtung in Streifen quer zum First zerlegt; jede Dachflaeche steigt
    von der Traufe zur Mittellinie mit pitch_deg (typisch Wien 35 bis 40 Grad), gedeckelt bei max_rise."""
    n = len(poly)
    if n < 3:
        return
    edges = [(poly[i], poly[(i + 1) % n]) for i in range(n)]
    cand = [edges[i] for i in (street_edges or range(n))] or edges
    a, b = max(cand, key=lambda e: math.dist(*e))
    L = math.dist(a, b)
    if L < 1e-3:
        return
    tx, ty = (b[0] - a[0]) / L, (b[1] - a[1]) / L
    uv = [((x - a[0]) * tx + (y - a[1]) * ty, -(x - a[0]) * ty + (y - a[1]) * tx) for x, y in poly]
    v0, v1 = min(v for _, v in uv), max(v for _, v in uv)
    vm, half = (v0 + v1) / 2, (v1 - v0) / 2
    if half < 1.5:
        return
    tan = math.tan(math.radians(pitch_deg))
    rise = min(half * tan, max_rise)
    run = rise / tan          # waagrechte Tiefe der Dachflaeche; dazwischen bleibt ein flacher Firststreifen

    def z(v):
        return h + min(rise, max(0.0, (min(v - v0, v1 - v) / run) * rise))

    def clip(pts, lo, hi):
        for bound, keep in ((lo, 1), (hi, -1)):
            out = []
            for i in range(len(pts)):
                p, q = pts[i], pts[(i + 1) % len(pts)]
                dp, dq = (p[1] - bound) * keep, (q[1] - bound) * keep
                if dp >= 0:
                    out.append(p)
                if (dp >= 0) != (dq >= 0):
                    t = dp / (dp - dq)
                    out.append((p[0] + (q[0] - p[0]) * t, bound))
            pts = out
            if len(pts) < 3:
                return []
        return pts

    def world(u, v, zz):
        return (a[0] + u * tx - v * ty, a[1] + u * ty + v * tx, zz + z_off)

    for lo, hi in ((v0, v0 + run), (v0 + run, v1 - run), (v1 - run, v1)):
        if hi - lo < 0.05:
            continue
        part = clip(list(uv), lo, hi)
        if part:
            mb_roof.poly([world(u, v, z(v)) for u, v in part], [(u, v) for u, v in part], mat, (0, 0, 1))
    # Giebel- und Brandwaende: jede Grundrisskante bis zur Dachflaeche hochziehen
    for i in range(n):
        (u1, w1), (u2, w2) = uv[i], uv[(i + 1) % n]
        cuts = sorted({0.0, 1.0, *[(c - w1) / (w2 - w1) for c in (v0 + run, v1 - run)
                                    if abs(w2 - w1) > 1e-6 and 0 < (c - w1) / (w2 - w1) < 1]})
        for t0, t1 in zip(cuts, cuts[1:]):
            pa = (u1 + (u2 - u1) * t0, w1 + (w2 - w1) * t0)
            pb = (u1 + (u2 - u1) * t1, w1 + (w2 - w1) * t1)
            if max(z(pa[1]), z(pb[1])) <= h + 0.05:
                continue
            mb_wall.poly([world(*pa, h), world(*pb, h), world(*pb, z(pb[1])), world(*pa, z(pa[1]))], None, wall_mat)
