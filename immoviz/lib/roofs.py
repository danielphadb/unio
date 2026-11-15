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
def add_faces(mb_roof, mb_wall, faces, z_off: float, wall_top: float, wall_mat: str, mat_override=None, ov=None,
              seed=0):
    """Baut Dachflaechen und die Waende darunter (Giebel, Brandwaende, Gaubenwangen) in zwei MeshBuilder.

    z_off: Hoehe des Baukoerper-Sockels in der Szene; wall_top: Oberkante der extrudierten Wand (relativ zum Sockel).
    Freie Dachkanten bekommen eine senkrechte Flaeche bis wall_top, wenn sie darueber liegen.
    ov: Eintrag aus roofs_override (Material, Gauben, Dachfenster, Kamine); seed: waehlt den Ziegelton je Gebaeude."""
    ov = ov or {}
    m_steil = MAT.get(ov.get("material"), ov.get("material")) if ov.get("material") else None
    m_flach = MAT.get(ov.get("material_flach"), ov.get("material_flach")) if ov.get("material_flach") else None
    haupt = None
    for r in faces:
        p = r["p"]
        pts = [(x, y, z + z_off) for x, y, z in p]
        # UV: u entlang der Hoehenlinie, v in Falllinie (Stehfalz und Ziegelreihen laufen damit richtig)
        o = math.radians(r.get("o", 0.0))
        sl = math.cos(math.radians(min(r.get("s", 0.0), 80.0)))
        uv = [(x * math.cos(o) - y * math.sin(o), (x * math.sin(o) + y * math.cos(o)) / max(sl, 0.2)) for x, y, _ in p]
        steil = r.get("s", 0.0) >= FLACH_BIS_GRAD
        mat = mat_override or (m_steil if steil else m_flach) or material(r["m"], seed)
        if steil and haupt is None:
            haupt = mat
        mb_roof.poly(pts, uv, mat, (0, 0, 1))
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
    if ov:
        details(mb_roof, faces, ov, z_off, m_steil or haupt or "dach_blech")


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


# ---------------------------------------------------------------- roofs_override (project.yaml)
# Was dem Dachmodell fehlt (Deckung, Farbe, Mansarden, Gauben, Dachfenster, Kamine), steht je Gebaeude von Hand in
# project.yaml unter roofs_override. Alles wird parametrisch gebaut, nichts aus einem Referenzbild uebernommen.
MAT = {"ziegel": "dach_ziegel_rot", "ziegel_rot": "dach_ziegel_rot", "ziegel_orange": "dach_ziegel_orange",
       "ziegel_braun": "dach_ziegel_braun", "schiefer_dunkel": "dach_schiefer_dunkel", "blech": "dach_blech_grau",
       "blech_hell": "dach_blech_hellgrau", "blech_dunkel": "dach_blech_dunkel", "kies": "dach_kies",
       "ziegel_rot_alt": "dach_ziegel_rot_alt", "gruen": "dach_gruen", "flach": "dach_flach", "kupfer": "dach_kupfer"}
# Mischung der Ziegeltoene der Umgebung (Wiener Dachlandschaft: rot, orange, nachgedunkelt braun)
ZIEGEL_MIX = ("dach_ziegel_rot", "dach_ziegel_rot", "dach_ziegel_braun", "dach_ziegel_orange", "dach_ziegel_braun",
              "dach_ziegel_rot", "dach_ziegel_rot_alt")


def material(klasse: str, seed=0) -> str:
    """Blender-Material zu einer Dachklasse aus roofs.json; Ziegel wechselt je Gebaeude den Ton."""
    if klasse == "dach_ziegel":
        return ZIEGEL_MIX[int(seed) % len(ZIEGEL_MIX)]
    if klasse == "dach_ziegel_dunkel":
        return "dach_ziegel_braun"
    # Blech: die alten Materialien dach_blech und dach_blech_hell rendern fast weiss, daher die kalibrierten Toene
    return {"dach_blech": "dach_blech_grau", "dach_blech_hell": "dach_blech_hellgrau"}.get(klasse, klasse)


class Override:
    """Nachschlagen der Eintraege aus roofs_override: ueber `pos` (Punkt im Grundriss) oder `bezug`."""

    def __init__(self, entries):
        self.by_bezug, self.by_pos = {}, []
        for e in entries or []:
            if e.get("pos"):
                self.by_pos.append(e)
            elif e.get("bezug") is not None:
                self.by_bezug[str(e["bezug"])] = e

    def find(self, b):
        for e in self.by_pos:
            if _pip(e["pos"][0], e["pos"][1], b["poly"]):
                return e
        return self.by_bezug.get(str(b.get("bezug")))

    def bezug(self, bezug):
        return self.by_bezug.get(str(bezug))


def _plane(p):
    """Ebene einer Dachflaeche: Normale (nz > 0), waagrechte Richtung h, Bergrichtung g, Steigung tan."""
    nx = ny = nz = 0.0
    for i in range(len(p)):
        a, b = p[i], p[(i + 1) % len(p)]
        nx += (a[1] - b[1]) * (a[2] + b[2])
        ny += (a[2] - b[2]) * (a[0] + b[0])
        nz += (a[0] - b[0]) * (a[1] + b[1])
    ln = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
    nx, ny, nz = nx / ln, ny / ln, nz / ln
    if nz < 0:
        nx, ny, nz = -nx, -ny, -nz
    hl = math.hypot(nx, ny)
    if hl < 1e-4 or nz < 1e-4:
        return None
    g = (-nx / hl, -ny / hl)           # waagrechte Richtung bergauf
    h = (-g[1], g[0])                  # entlang der Hoehenlinie
    return {"n": (nx, ny, nz), "g": g, "h": h, "tan": hl / nz, "p0": p[0]}


class _Face:
    """Dachflaeche mit Koordinaten (a entlang der Hoehenlinie, c bergauf, beides waagrecht gemessen)."""

    def __init__(self, r, z_off):
        self.r, self.pl = r, _plane(r["p"])
        self.ok = self.pl is not None
        if not self.ok:
            return
        g, h = self.pl["g"], self.pl["h"]
        self.ac = [(x * h[0] + y * h[1], x * g[0] + y * g[1]) for x, y, _ in r["p"]]
        self.a0, self.a1 = min(q[0] for q in self.ac), max(q[0] for q in self.ac)
        self.c0, self.c1 = min(q[1] for q in self.ac), max(q[1] for q in self.ac)
        self.z_off = z_off
        self.area = _area3(r["p"])

    def inside(self, a, c):
        return _pip(a, c, self.ac)

    def pt(self, a, c, lift=0.0, dz=0.0):
        g, h, n = self.pl["g"], self.pl["h"], self.pl["n"]
        x, y = a * h[0] + c * g[0], a * h[1] + c * g[1]
        x0, y0, z0 = self.pl["p0"]
        z = z0 - (n[0] * (x - x0) + n[1] * (y - y0)) / n[2]
        return (x + n[0] * lift, y + n[1] * lift, z + n[2] * lift + dz + self.z_off)


def _seite_ok(face, seiten):
    """Filter nach Dachseite: '+x', '-x', '+y', '-y' = Richtung, in die die Flaeche abfaellt (lokales System)."""
    if not seiten:
        return True
    gx, gy = -face.pl["g"][0], -face.pl["g"][1]
    best = max((("+x", gx), ("-x", -gx), ("+y", gy), ("-y", -gy)), key=lambda t: t[1])[0]
    return best in seiten


def _hauptflaechen(faces, z_off, min_grad=12.0, seiten=None):
    fs = [f for f in (_Face(r, z_off) for r in faces if r.get("s", 0) >= min_grad) if f.ok]
    if not fs:
        return []
    amax = max(f.area for f in fs)
    return [f for f in fs if f.area >= 0.35 * amax and f.a1 - f.a0 >= 4.0 and _seite_ok(f, seiten)]


def _dachfenster(mb, f, a, c, w=0.8, l=1.2):
    """Dachflaechenfenster: dunkler Rahmen und Glas, wenige Zentimeter ueber der Dachhaut."""
    k = 1.0 / math.sqrt(1.0 + f.pl["tan"] ** 2)       # waagrechte Laenge je Meter in Falllinie
    lc = l * k
    if not all(f.inside(a + da, c + dc) for da in (-w / 2, w / 2) for dc in (0.0, lc)):
        return False
    n = f.pl["n"]
    for e, lift, mat in ((0.0, 0.05, "rahmen_dunkel"), (0.07, 0.08, "fenster_dunkel")):
        mb.poly([f.pt(a - w / 2 + e, c + e * k, lift), f.pt(a + w / 2 - e, c + e * k, lift),
                 f.pt(a + w / 2 - e, c + lc - e * k, lift), f.pt(a - w / 2 + e, c + lc - e * k, lift)], None, mat, n)
    return True


def _gaube(mb, f, a, c, w, hg, mat_dach):
    """Schleppgaube: senkrechte Front mit Fenster, Deckel waagrecht nach hinten bis zur Dachflaeche, zwei Wangen."""
    tan = f.pl["tan"]
    if tan < 0.25:
        return False
    run = hg / tan
    if not all(f.inside(a + da, c + dc) for da in (-w / 2, w / 2) for dc in (0.0, run)):
        return False
    g, h = f.pl["g"], f.pl["h"]
    fl, fr = f.pt(a - w / 2, c), f.pt(a + w / 2, c)
    tl, tr = (fl[0], fl[1], fl[2] + hg), (fr[0], fr[1], fr[2] + hg)
    ov = 0.12                                              # Deckel steht vorne leicht ueber
    dl = (tl[0] - g[0] * ov, tl[1] - g[1] * ov, tl[2] + 0.06)
    dr = (tr[0] - g[0] * ov, tr[1] - g[1] * ov, tr[2] + 0.06)
    bl, br = f.pt(a - w / 2, c + run, dz=0.06), f.pt(a + w / 2, c + run, dz=0.06)
    out = (-g[0], -g[1], 0.0)
    mb.poly([fl, fr, tr, tl], None, "fenster", out)
    e = 0.12

    def fp(u, z):       # Punkt auf der Front, 2 cm davor
        return (fl[0] + h[0] * u - g[0] * 0.02, fl[1] + h[1] * u - g[1] * 0.02, fl[2] + z)
    mb.poly([fp(e, e), fp(w - e, e), fp(w - e, hg - e), fp(e, hg - e)], None, "fenster_dunkel", out)
    mb.poly([dl, dr, br, bl], None, mat_dach, (0, 0, 1))
    mb.poly([fl, tl, bl], None, mat_dach, (-h[0], -h[1], 0))
    mb.poly([fr, tr, br], None, mat_dach, (h[0], h[1], 0))
    return True


def _quader(mb, o, ex, ey, lx, ly, z0, z1, mat, mat_top=None):
    """Quader mit Grundflaeche o + ex*[0, lx] + ey*[0, ly] (Kamin, Brandwand)."""
    c = [(o[0], o[1]), (o[0] + ex[0] * lx, o[1] + ex[1] * lx),
         (o[0] + ex[0] * lx + ey[0] * ly, o[1] + ex[1] * lx + ey[1] * ly), (o[0] + ey[0] * ly, o[1] + ey[1] * ly)]
    cx, cy = sum(q[0] for q in c) / 4, sum(q[1] for q in c) / 4
    for i in range(4):
        p, q = c[i], c[(i + 1) % 4]
        mx, my = (p[0] + q[0]) / 2 - cx, (p[1] + q[1]) / 2 - cy
        mb.poly([(p[0], p[1], z0), (q[0], q[1], z0), (q[0], q[1], z1), (p[0], p[1], z1)], None, mat, (mx, my, 0))
    mb.poly([(x, y, z1) for x, y in c], None, mat_top or mat, (0, 0, 1))


def details(mb, faces, ov, z_off, mat_dach):
    """Gauben, Dachfenster und Kamine laut roofs_override auf den Hauptflaechen eines Dachs verteilen.

    gauben:      {anzahl: je Dachseite, breite, hoehe, reihen, seiten: ['-x', ...]} oder nur eine Zahl
    dachfenster: {anzahl: je Dachseite, reihen, seiten} oder nur eine Zahl
    kamine:      Anzahl je Gebaeude, nahe am First der groessten Dachflaechen"""
    if not ov or not faces:
        return
    ga, df, ka = ov.get("gauben"), ov.get("dachfenster"), ov.get("kamine")
    ga = {"anzahl": ga} if isinstance(ga, (int, float)) else ga
    df = {"anzahl": df} if isinstance(df, (int, float)) else df
    if ga and ga.get("anzahl"):
        w, hg, rows = ga.get("breite", 1.3), ga.get("hoehe", 1.4), int(ga.get("reihen", 1))
        for f in _hauptflaechen(faces, z_off, 20.0, ga.get("seiten")):
            n = int(ga["anzahl"])
            run = hg / f.pl["tan"]
            for k in range(rows):
                c = f.c0 + (f.c1 - f.c0) * (ga.get("lage", 0.18) + k * 0.80 / rows)
                c = min(c, f.c1 - run - 0.3)
                for i in range(n):
                    _gaube(mb, f, f.a0 + (f.a1 - f.a0) * (i + 0.5) / n, c, w, hg, ga.get("material") and MAT.get(ga["material"], ga["material"]) or mat_dach)
    if df and df.get("anzahl"):
        rows = int(df.get("reihen", 1))
        for f in _hauptflaechen(faces, z_off, 12.0, df.get("seiten")):
            n = int(df["anzahl"])
            for k in range(rows):
                c = f.c0 + (f.c1 - f.c0) * (df.get("lage", 0.45) + k * 0.5 / rows)
                off = 0.5 if (ga and ga.get("anzahl")) else 0.0      # zwischen die Gauben setzen
                for i in range(n):
                    _dachfenster(mb, f, f.a0 + (f.a1 - f.a0) * (i + 0.5 + off) / n, c)
    if ka:
        fs = sorted(_hauptflaechen(faces, z_off, 12.0), key=lambda f: -f.area)[:2]
        if fs:
            per = [int(ka) - int(ka) // 2, int(ka) // 2] if len(fs) > 1 else [int(ka)]
            for f, n in zip(fs, per):
                for i in range(n):
                    a = f.a0 + (f.a1 - f.a0) * (i + 0.5) / n
                    c = f.c1 - 0.9
                    if not f.inside(a, c) or not f.inside(a + 1.1, c):
                        c = (f.c0 + f.c1) / 2
                        if not f.inside(a, c) or not f.inside(a + 1.1, c):
                            continue
                    base = f.pt(a, c)
                    top = max(q[2] for q in f.r["p"]) + f.z_off + 0.9
                    _quader(mb, (base[0], base[1]), f.pl["h"], f.pl["g"], 1.1, 0.5, base[2] - 0.4, top, "kamin", "dach_flach")


def mansarde(mb_roof, mb_wall, polys, ov, z_off, wall_mat, achse=None, traufe=None):
    """Mansarddach ueber dem Umriss-Rechteck eines Gebaeudes (alle Baukoerperteile eines BEZUG).

    mansarde: true oder {traufe, hoehe, neigung, tiefe, material_oben, brandwand: [a, b], kamin: a|b|beide}
    Steile Flaechen zur Strasse und zum Hof, oben ein flaches Dach, an beiden Enden Brandwaende. `achse` ist die
    Strassenflucht (a, b) wie in neighbour_facades; ohne Angabe die laengste Kante der Grundrisse."""
    m = ov.get("mansarde")
    m = {} if m is True else dict(m)
    pts = [q for p in polys for q in p]
    if len(pts) < 3:
        return
    if achse is None:
        achse = max(((p[i], p[(i + 1) % len(p)]) for p in polys for i in range(len(p))), key=lambda e: math.dist(*e))
    (ax, ay), (bx, by) = achse
    L = math.hypot(bx - ax, by - ay)
    t = ((bx - ax) / L, (by - ay) / L)
    n = (t[1], -t[0])                       # zur Strasse
    ud = [((x - ax) * t[0] + (y - ay) * t[1], -((x - ax) * n[0] + (y - ay) * n[1])) for x, y in pts]
    u0, u1 = min(q[0] for q in ud), max(q[0] for q in ud)
    d0 = m.get("vorne", 0.0)
    d1 = d0 + m["tiefe"] if m.get("tiefe") else max(q[1] for q in ud)
    T = m.get("traufe", traufe)
    hm, ang = m.get("hoehe", 4.5), m.get("neigung", 70.0)
    run = hm / math.tan(math.radians(ang))
    if d1 - d0 < 2 * run + 1.0:
        return
    mat = MAT.get(ov.get("material", "schiefer_dunkel"), ov.get("material"))
    mat_top = MAT.get(m.get("material_oben", "blech_dunkel"), m.get("material_oben"))

    def P(u, d, z):
        return (ax + t[0] * u - n[0] * d, ay + t[1] * u - n[1] * d, z)

    faces = []
    for da, db, o in ((d0, d0 + run, 0.0), (d1, d1 - run, 180.0)):
        quad = [P(u0, da, T), P(u1, da, T), P(u1, db, T + hm), P(u0, db, T + hm)]
        faces.append({"p": quad, "s": ang, "o": o, "m": mat, "e": []})
    top = {"p": [P(u0, d0 + run, T + hm), P(u1, d0 + run, T + hm), P(u1, d1 - run, T + hm), P(u0, d1 - run, T + hm)],
           "s": 0.0, "o": 0.0, "m": mat_top, "e": []}
    sl = math.hypot(run, hm)
    for f in faces:
        mb_roof.poly([(x, y, z + z_off) for x, y, z in f["p"]], [(u0, 0.0), (u1, 0.0), (u1, sl), (u0, sl)], f["m"], (0, 0, 1))
    mb_roof.poly([(x, y, z + z_off) for x, y, z in top["p"]], None, mat_top, (0, 0, 1))
    # Attika-Kante am oberen Knick
    for da in (d0 + run, d1 - run - 0.25):
        _quader(mb_roof, P(u0, da + 0.25, 0)[:2], t, n, u1 - u0, 0.25, T + hm - 0.05 + z_off, T + hm + 0.18 + z_off, mat_top)
    # Brandwaende an beiden Enden: Profil des Dachs, 0,45 m ueberstehend, 0,3 m stark
    ue = m.get("brandwand_ueber", 0.45)
    wm = m.get("brandwand_material", wall_mat)
    for uu, sgn in ((u0, 1.0), (u1, -1.0)):
        prof = [(d0 - 0.05, T - 0.3), (d1 + 0.05, T - 0.3), (d1 + 0.05, T + ue), (d1 - run, T + hm + ue),
                (d0 + run, T + hm + ue), (d0 - 0.05, T + ue)]
        ua, ub = uu, uu + 0.3 * sgn
        for u_, nn in ((ua, -sgn), (ub, sgn)):
            mb_wall.poly([P(u_, d, z + z_off) for d, z in prof], [(d, z) for d, z in prof], wm, (t[0] * nn, t[1] * nn, 0))
        for i in range(len(prof)):
            (da, za), (db, zb) = prof[i], prof[(i + 1) % len(prof)]
            mx, mz = (da + db) / 2 - (d0 + d1) / 2, (za + zb) / 2 - (T + hm / 2)
            mb_wall.poly([P(ua, da, za + z_off), P(ub, da, za + z_off), P(ub, db, zb + z_off), P(ua, db, zb + z_off)],
                         None, wm, (-n[0] * mx, -n[1] * mx, mz))
    # Kamine an den Brandwaenden (parametrisch: a = Anfang der Flucht, b = Ende)
    km = m.get("kamin")
    for key, uu in (("a", u0 + 0.3), ("b", u1 - 0.3 - 0.7)):
        if km in (key, "beide"):
            for dk in (d0 + run + 0.4, (d0 + d1) / 2):
                o = P(uu, dk + 1.6, 0)
                _quader(mb_wall, o[:2], t, n, 0.7, 1.6, T + hm - 0.2 + z_off, T + hm + 1.7 + z_off, "kamin", "dach_flach")
    details(mb_roof, faces, ov, z_off, mat)
