"""Schnittansicht: Gebäude Geschoss für Geschoss aufgeschnitten (Phase E, Reel 2 in KONZEPT.md).

Ablauf:
1. Je Regelgeschoss die Planseite rastern (300 dpi) und die Wände extrahieren, wie in interior.py, aber für
   das ganze Geschoss: Ausschnitt = Gebäudeumriss aus ctx["hero"] plus Rand, nur Wände innerhalb des Umrisses
   (Straßenfassaden ab 3 cm hinter der Flucht, damit die Hero-Fassade davor sichtbar bleibt).
2. Öffnungen wie in interior.find_openings. Liegt eine Öffnung nahe am Umriss, ist sie ein Fenster
   (Brüstung und Sturz werden ergänzt), sonst eine Tür (Sturz ab 2,20 m).
3. Wände als Volumen von Fußbodenoberkante (Kote laut Plan) bis Unterkante der nächsten Decke, Decken als
   Platten aus dem Umriss. Dachgeschosse aus der Dachkubatur (project.yaml dach) und Top 35 aus wohnungen.yaml.
4. Schnitt: alles über der Schnitthöhe entfällt. Eigene Volumen werden analytisch gekappt und bekommen eine
   dunkle Schnittfläche, Hero-Teile (Fassade, Stuck, Fenster, Dach) werden polygonweise an der Ebene z = Schnitt
   abgeschnitten. Die Umgebung aus build_scene bleibt unverändert.
5. Modellbau-Ästhetik: das Objekt in warmweißen Modellmaterialien, Wohnungen in UNIO-Signalfarbe #FFAA09.

Plan zu lokal (je Planseite eigene Ecke): x = (ecke_py - py) * s, y = (ecke_px - px) * s.
"""
from __future__ import annotations

import copy
import math
from pathlib import Path

import numpy as np
import yaml
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

from . import meshkit as K
from .interior import raster_page, wall_mask, to_cells, rects_from_mask, find_openings

UNIO_ORANGE = "#FFAA09"


# ------------------------------------------------------------------ Geometrie-Hilfen
def _box(mb, x0, x1, y0, y1, z0, z1, side, top, bottom=False):
    """Quader mit eigenem Material für die Oberseite (Schnittfläche oder Boden)."""
    if z1 - z0 < 1e-4:
        return
    x0, x1 = min(x0, x1), max(x0, x1)
    y0, y1 = min(y0, y1), max(y0, y1)
    P = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    mb.poly([(x, y, z1) for x, y in P], [(x, y) for x, y in P], top, (0, 0, 1))
    if bottom:
        mb.poly([(x, y, z0) for x, y in P], [(x, y) for x, y in P], side, (0, 0, -1))
    run = 0.0
    for i in range(4):
        (ax, ay), (bx, by) = P[i], P[(i + 1) % 4]
        L = math.hypot(bx - ax, by - ay)
        mb.poly([(ax, ay, z0), (bx, by, z0), (bx, by, z1), (ax, ay, z1)],
                [(run, z0), (run + L, z0), (run + L, z1), (run, z1)], side, (by - ay, -(bx - ax), 0))
        run += L


def _extrude(mb, poly, z0, z1, side, top, bottom=True):
    """Prisma aus einem Polygon, Oberseite mit eigenem Material."""
    if len(poly) < 3 or z1 - z0 < 1e-4:
        return
    if K.polygon_area(poly) < 0:
        poly = poly[::-1]
    run = 0.0
    n = len(poly)
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
        L = math.hypot(x2 - x1, y2 - y1)
        if L < 1e-4:
            continue
        mb.poly([(x1, y1, z0), (x2, y2, z0), (x2, y2, z1), (x1, y1, z1)],
                [(run, z0), (run + L, z0), (run + L, z1), (run, z1)], side, (y2 - y1, -(x2 - x1), 0))
        run += L
    mb.poly([(x, y, z1) for x, y in poly], [(x, y) for x, y in poly], top, (0, 0, 1))
    if bottom:
        mb.poly([(x, y, z0) for x, y in poly], [(x, y) for x, y in poly], side, (0, 0, -1))


def _edge_wall(mb, a, b, t, z0, z1, side, top):
    """Wandscheibe der Stärke t links neben der Kante a->b (bei Polygon gegen den Uhrzeigersinn: innen)."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy)
    if L < 0.05:
        return
    nx, ny = -dy / L * t, dx / L * t
    _extrude(mb, [a, b, (b[0] + nx, b[1] + ny), (a[0] + nx, a[1] + ny)], z0, z1, side, top, bottom=False)


def _fbox(mb, f, u0, u1, d0, d1, z0, z1, side, top):
    """Quader in Fassadenkoordinaten (u entlang, d nach innen), Oberseite mit eigenem Material."""
    if z1 - z0 < 1e-4 or u1 - u0 < 1e-4:
        return
    P = f.p
    mb.poly([P(u0, d0, z1), P(u1, d0, z1), P(u1, d1, z1), P(u0, d1, z1)], None, top, (0, 0, 1))
    al, out = f.along, f.out
    for (ua, da), (ub, db), n in (((u0, d0), (u1, d0), out), ((u1, d1), (u0, d1), (-out[0], -out[1], 0)),
                                  ((u0, d1), (u0, d0), (-al[0], -al[1], 0)), ((u1, d0), (u1, d1), al)):
        L = math.hypot(ub - ua, db - da)
        mb.poly([P(ua, da, z0), P(ub, db, z0), P(ub, db, z1), P(ua, da, z1)],
                [(0, z0), (L, z0), (L, z1), (0, z1)], side, n)


def facade_holes(cfg, fname):
    """Öffnungen einer Straßenfassade wie in build.Hero.altbau: (ua, ub, za, zb)."""
    A = cfg["altbau"]
    fs = A["facades"][fname]
    eg_map = {ax: g for g in fs.get("eg", []) for ax in g["axes"]}
    holes = []
    for rname, r in A["rows"].items():
        for i, uc in enumerate(fs["axes"]):
            w, za, zb = r["w"], r["z"], r["z"] + r["h"]
            if rname == "eg" and i in eg_map:
                g = eg_map[i]
                if "z" in g:
                    za, zb = g["z"]
                if g["type"] == "haustor":
                    holes.append((g["u"][0], g["u"][1], za, zb))
                    continue
                if g.get("keller"):
                    holes.append((uc - 0.36, uc + 0.36, 0.80, 1.25))
            holes.append((uc - w / 2, uc + w / 2, za, zb))
    return holes


def facade_wall(mb, f, holes, z_lo, z_hi, d0, d1, zc, M_):
    """Massive Straßenwand mit den Fensteröffnungen der Ansicht, an zc gekappt."""
    cuts = sorted({0.0, f.length} | {min(max(h[i], 0.0), f.length) for h in holes for i in (0, 1)})
    for ua, ub in zip(cuts, cuts[1:]):
        if ub - ua < 1e-4:
            continue
        um = (ua + ub) / 2
        hz = sorted((h[2], h[3]) for h in holes if h[0] <= um <= h[1])
        z = z_lo
        solids = []
        for a, b in hz:
            if a > z:
                solids.append((z, a))
            z = max(z, b)
        if z < z_hi:
            solids.append((z, z_hi))
        for a, b in solids:
            c = _cut(a, b, zc)
            if c:
                _fbox(mb, f, ua, ub, d0, d1, c[0], c[1], M_["wand"], M_["schnitt"] if c[2] else M_["wand"])


def _cut(z0, z1, zc):
    """Höhenbereich an der Schnitthöhe kappen: (z0, z1_neu, geschnitten) oder None."""
    if zc is None or z1 <= zc:
        return z0, z1, False
    if z0 >= zc:
        return None
    return z0, zc, True


def clip_builder(mb: K.MeshBuilder, zc: float | None, name: str | None = None) -> K.MeshBuilder:
    """Schneidet jedes Polygon an der Ebene z = zc ab (Sutherland-Hodgman, UV interpoliert)."""
    out = K.MeshBuilder(name or mb.name, list(mb.materials))
    for f, uv, m in zip(mb.faces, mb.uvs, mb.mats):
        pts = [mb.verts[i] for i in f]
        if zc is None or max(p[2] for p in pts) <= zc:
            out.poly(pts, uv, m)
            continue
        if min(p[2] for p in pts) >= zc:
            continue
        P, U = [], []
        n = len(pts)
        for i in range(n):
            a, b = pts[i], pts[(i + 1) % n]
            ua, ub = uv[i], uv[(i + 1) % n]
            ina, inb = a[2] <= zc, b[2] <= zc
            if ina:
                P.append(a)
                U.append(ua)
            if ina != inb:
                t = (zc - a[2]) / (b[2] - a[2])
                P.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, zc))
                U.append((ua[0] + (ub[0] - ua[0]) * t, ua[1] + (ub[1] - ua[1]) * t))
        if len(P) >= 3:
            out.poly(P, U, m)
    return out


# ------------------------------------------------------------------ Regelgeschoss aus der Planseite
class PlanFloor:
    """Wände, Öffnungen und Gebäudemaske eines ganzen Geschosses aus der Vektor-Planseite."""

    def __init__(self, key: str, g: dict, S: dict, footprint, facades: dict, cache: Path, extra=()):
        self.key, self.g = key, g
        self.s = S["m_per_px"]
        self.cell_px = S.get("cell_px", 3)
        self.cell_m = self.s * self.cell_px
        self.ex, self.ey = g["corner_px"]
        xs = [p[0] for p in footprint]
        ys = [p[1] for p in footprint]
        m = S.get("rand_m", 1.0)
        self.x0 = int(self.ex - (max(ys) + m) / self.s)
        self.y0 = int(self.ey - (max(xs) + m) / self.s)
        x1 = int(self.ex - (min(ys) - m) / self.s)
        y1 = int(self.ey - (min(xs) - m) / self.s)
        rgb = raster_page(Path(S["pdf"]), g["page"], S.get("dpi", 300), cache)
        self.rgb = rgb[self.y0:y1, self.x0:x1]
        sub = wall_mask(self.rgb)
        for sx0, sy0, sx1, sy1 in g.get("solid_px", []):
            sub[sy0 - self.y0:sy1 - self.y0, sx0 - self.x0:sx1 - self.x0] = True
        for sx0, sy0, sx1, sy1 in g.get("clear_px", []):
            sub[sy0 - self.y0:sy1 - self.y0, sx0 - self.x0:sx1 - self.x0] = False
        cells = to_cells(sub, self.cell_px)
        cells = ndimage.binary_opening(cells, structure=np.ones((2, 2), bool))
        # kleine Löcher in Wänden (Kaminsymbole, Beschriftung) schließen
        holes = ndimage.binary_fill_holes(cells) & ~cells
        lab, n = ndimage.label(holes)
        if n:
            sizes = ndimage.sum(holes, lab, range(1, n + 1))
            small = [i + 1 for i, sz in enumerate(sizes) if sz * self.cell_m ** 2 < 0.15]
            cells |= np.isin(lab, small)
        lab, n = ndimage.label(cells)
        sizes = ndimage.sum(cells, lab, range(1, n + 1))
        cells = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz * self.cell_m ** 2 >= 0.03])
        H, W = cells.shape
        # Gebäudemaske aus dem Umriss, Rückseiten (Hof, Feuermauern) um rand_hof_m erweitert,
        # Straßenseiten hart an der Fassadenflucht (d >= 3 cm) begrenzt
        self.inside = self.poly_mask(footprint, (H, W))
        for poly in extra:          # Ergänzung des OGD-Umrisses aus dem Plan (umriss_plus)
            self.inside |= self.poly_mask(poly, (H, W))
        r = max(1, int(round(S.get("rand_hof_m", 0.25) / self.cell_m)))
        hull = ndimage.binary_dilation(self.inside, structure=np.ones((2 * r + 1, 2 * r + 1), bool))
        X, Y = self.cell_grid((H, W))
        for f in facades.values():
            d = -((X - f.a[0]) * f.n[0] + (Y - f.a[1]) * f.n[1])
            u = (X - f.a[0]) * f.t[0] + (Y - f.a[1]) * f.t[1]
            hull &= ~((d < S.get("fassadenwand_m", 0.65)) & (u > -1.0) & (u < f.length + 1.0))
        self.hull = hull
        self.walls = cells & hull
        self.openings = find_openings(self.walls, self.cell_m)
        self.dist_out = ndimage.distance_transform_edt(self.inside) * self.cell_m
        fz = S.get("fenster_zone_m", 1.0)
        for op in self.openings:
            rc = ((op["r0"] + op["r1"]) // 2, (op["c0"] + op["c1"]) // 2)
            op["kind"] = "fenster" if self.dist_out[rc] < fz else "tuer"

    # Planpixel und Zellen <-> lokal
    def px_to_local(self, px, py):
        return ((self.ey - py) * self.s, (self.ex - px) * self.s)

    def local_to_cell(self, x, y):
        px = self.ex - y / self.s
        py = self.ey - x / self.s
        return ((px - self.x0) / self.cell_px, (py - self.y0) / self.cell_px)

    def cell_xy(self, r, c):
        return self.px_to_local(self.x0 + c * self.cell_px, self.y0 + r * self.cell_px)

    def cell_grid(self, shape):
        H, W = shape
        rr, cc = np.mgrid[0:H, 0:W]
        px = self.x0 + (cc + 0.5) * self.cell_px
        py = self.y0 + (rr + 0.5) * self.cell_px
        return (self.ey - py) * self.s, (self.ex - px) * self.s

    def poly_mask(self, poly, shape):
        H, W = shape
        im = Image.new("L", (W, H), 0)
        ImageDraw.Draw(im).polygon([self.local_to_cell(x, y) for x, y in poly], fill=1)
        return np.array(im, bool)

    # Geometrie
    def build(self, mb, z0, z1, zc, fenster: dict, mats: dict):
        """Wände von z0 bis z1, an zc gekappt. Rückgabe: Anzahl Wandquader und Öffnungen."""
        cut = _cut(z0, z1, zc)
        if cut is None:
            return {}
        z0, ztop, is_cut = cut
        top = mats["schnitt"] if is_cut else mats["wand"]
        n = 0
        for (r0, r1, c0, c1) in rects_from_mask(self.walls):
            xa, ya = self.cell_xy(r0, c0)
            xb, yb = self.cell_xy(r1, c1)
            _box(mb, xa, xb, ya, yb, z0, ztop, mats["wand"], top)
            n += 1
        sill, head = fenster.get("bruestung", 0.9), fenster.get("sturz", 2.6)
        stats = {"waende": n, "fenster": 0, "tuer": 0}
        for op in self.openings:
            stats[op["kind"]] += 1
            xa, ya = self.cell_xy(op["r0"], op["c0"])
            xb, yb = self.cell_xy(op["r1"], op["c1"])
            parts = [(z0 + head, z1)] if op["kind"] == "fenster" else [(z0 + 2.2, z1)]
            if op["kind"] == "fenster" and sill > 0.05:
                parts.append((z0, z0 + sill))
            for a, b in parts:
                c = _cut(a, b, zc)
                if c is None:
                    continue
                _box(mb, xa, xb, ya, yb, c[0], c[1], mats["wand"], mats["schnitt"] if c[2] else mats["wand"])
        return stats

    def floor_cells(self, poly, without=()):
        m = self.poly_mask(poly, self.walls.shape) & ~self.walls & self.inside & self.hull
        for w in without:
            m &= ~self.poly_mask(w, self.walls.shape)
        return m

    def build_cells(self, mb, mask, z0, z1, mat):
        for (r0, r1, c0, c1) in rects_from_mask(mask):
            xa, ya = self.cell_xy(r0, c0)
            xb, yb = self.cell_xy(r1, c1)
            _box(mb, xa, xb, ya, yb, z0, z1, mat, mat)

    # Kontrollbild: Plan hell, Wände rot, Fenster blau, Türen grün, Umriss türkis, Wohnungen orange
    def check_image(self, out: Path, footprint, highlights=(), extra=()):
        base = (self.rgb.astype(np.float32) * 0.45 + 140).clip(0, 255).astype(np.uint8)
        img = Image.fromarray(base)
        H, W = self.walls.shape
        cp = self.cell_px

        def layer(mask, rgba):
            a = np.zeros((H, W, 4), np.uint8)
            a[mask] = rgba
            return Image.fromarray(a).resize((W * cp, H * cp), Image.NEAREST)
        for mask in highlights:
            img.paste(layer(mask, (255, 170, 9, 150)), (0, 0), layer(mask, (255, 170, 9, 150)))
        wl = layer(self.walls, (200, 20, 20, 150))
        img.paste(wl, (0, 0), wl)
        om = {"fenster": np.zeros((H, W), bool), "tuer": np.zeros((H, W), bool)}
        for op in self.openings:
            om[op["kind"]][op["r0"]:op["r1"], op["c0"]:op["c1"]] = True
        for k, col in (("fenster", (30, 90, 255, 220)), ("tuer", (0, 170, 60, 220))):
            ly = layer(om[k], col)
            img.paste(ly, (0, 0), ly)
        d = ImageDraw.Draw(img)
        for poly, col in [(footprint, (0, 170, 190))] + [(e, (150, 60, 200)) for e in extra]:
            pts = []
            for x, y in poly:
                c, r = self.local_to_cell(x, y)
                pts.append((c * cp, r * cp))
            d.line(pts + pts[:1], fill=col, width=5)
        img = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
        out.parent.mkdir(parents=True, exist_ok=True)
        img.convert("RGB").save(out, quality=88)
        return str(out)


# ------------------------------------------------------------------ Materialien (Modellbau)
def build_model_materials(bpy, S: dict) -> dict:
    from . import materials as M
    farben = S.get("farben", {})
    c = lambda k, d: M.hex_rgb(farben.get(k, d))
    mats = {
        "wand": M.plaster(bpy, "modell_wand", c("wand", "#E9E5DE"), var=0.012, bump=0.015),
        "boden": M.plaster(bpy, "modell_boden", c("boden", "#F3F0EA"), var=0.01, bump=0.01),
        "schnitt": M.simple(bpy, "modell_schnitt", c("schnitt", "#2E2C2A"), 0.9),
        "dach": M.plaster(bpy, "modell_dach", c("dach", "#B9B3AA"), var=0.015, bump=0.015),
        "rahmen": M.simple(bpy, "modell_rahmen", c("rahmen", "#F6F4EF"), 0.5),
        "wohnung": M.simple(bpy, "modell_wohnung", M.hex_rgb(UNIO_ORANGE), 0.55,
                            **{"Emission Color": (*M.hex_rgb(UNIO_ORANGE), 1.0), "Emission Strength": 0.15}),
    }
    return mats


def remap_materials(names, mats: dict, lib: dict) -> dict:
    """Hero-Materialnamen auf Modellmaterialien abbilden (Glas bleibt Glas)."""
    out = {}
    for n in names:
        if "glas" in n:
            out[n] = lib[n]
        elif n in ("zink", "rahmen_dunkel", "solar", "kamin", "dach_flach", "blech", "terrasse"):
            out[n] = mats["dach"]
        elif n in ("fenster", "haustor"):
            out[n] = mats["rahmen"]
        else:
            out[n] = mats["wand"]
    return out


# ------------------------------------------------------------------ Szene je Zustand
def build_state(bpy, cfg, ctx, W, S, floors, mats, lib, coll, state):
    from .build import Hero
    zc = state.get("schnitt")
    geschoss = state.get("geschoss")
    G = S["geschosse"]
    F = {k: K.Facade(k, tuple(v["a"]), tuple(v["b"])) for k, v in cfg["facades"].items()}
    footprint = max((b["poly"] for b in ctx["hero"]), key=lambda p: abs(K.polygon_area(p)))
    inner, _ = K.clip_polygon(footprint, [[k, "d", ">=", S.get("fassade_abstand_m", 0.03)] for k in F], F)
    plates = [inner] + list(S.get("umriss_plus", []))
    M_ = {"wand": "modell_wand", "boden": "modell_boden", "schnitt": "modell_schnitt", "dach": "modell_dach",
          "wohnung": "modell_wohnung"}
    mb = K.MeshBuilder("schnitt_modell", list(M_.values()))
    hl = K.MeshBuilder("schnitt_wohnungen", ["modell_wohnung"])
    stats = {}

    # Sockel bis Fußboden EG
    eg = G[S["reihenfolge"][0]]
    c = _cut(S.get("sockel_unten", -0.5), eg["ffb"], zc)
    if c:
        for pl in plates:
            _extrude(mb, pl, c[0], c[1], M_["wand"], M_["schnitt"] if c[2] else M_["boden"])
    # massive Straßenwände mit den Öffnungen der Straßenansicht
    for fname in cfg["altbau"]["facades"]:
        facade_wall(mb, F[fname], facade_holes(cfg, fname), S.get("sockel_unten", -0.5), cfg["altbau"]["height"],
                    0.01, S.get("fassadenwand_m", 0.65), zc, M_)
    # Regelgeschosse: Wände und Decke darüber
    for key in S["reihenfolge"]:
        g = G[key]
        if g.get("typ") == "dach":
            continue
        fl = floors[key]
        uk, ok = g["decke"]
        stats[key] = fl.build(mb, g["ffb"], uk, zc, g.get("fenster", {}), M_)
        c = _cut(uk, ok, zc)
        if c:
            for pl in plates:
                _extrude(mb, pl, c[0], c[1], M_["wand"], M_["schnitt"] if c[2] else M_["boden"])
        if key == geschoss:
            for wk in state.get("wohnungen", []):
                h = S["wohnungen"][wk]
                mask = fl.floor_cells(h["polygon"], h.get("ohne", []))
                fl.build_cells(hl, mask, g["ffb"] + 0.003, g["ffb"] + 0.02, "modell_wohnung")

    # Hero: Fassaden, Stuck, Fenster (ohne Kernvolumen und Altbau-Decken), Dach ohne Volumen und Platten
    hcfg = copy.deepcopy(cfg)
    D = hcfg["dach"]
    vols, slabs = D.get("volumes", []), D.get("slabs", [])
    D["volumes"], D["slabs"] = [], []
    hero = Hero(hcfg, None, lib)
    hero.altbau()
    dach_z0 = min(w["z"][0] for w in D.get("walls", [])) if D.get("walls") else 1e9
    if zc is None or zc > dach_z0:
        hero.dach()
        dg = next((G[k] for k in S["reihenfolge"] if G[k].get("typ") == "dach"), {})
        keep = set(dg.get("volumen_behalten", range(len(vols))))
        for i, v in enumerate(vols):
            poly, lines = K.clip_polygon(footprint, v["clip"], F)
            if not poly:
                continue
            if zc is None or i in keep:
                c = _cut(v["z"][0], v["z"][1], zc)
                if c:
                    _extrude(mb, poly, c[0], c[1], M_["dach"], M_["schnitt"] if c[2] else M_["dach"])
                continue
            # entfernter Innenraum im Dach: nur Außenwände am Umriss (Hof, Feuermauer) stehen lassen
            c = _cut(v["z"][0], v["z"][1], zc)
            if not c:
                continue
            if K.polygon_area(poly) < 0:
                poly = poly[::-1]
            for j in range(len(poly)):
                a, b = poly[j], poly[(j + 1) % len(poly)]
                mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
                if any(abs(fn(mid)) < 1e-3 for fn in lines):
                    continue
                _edge_wall(mb, a, b, dg.get("aussenwand_m", 0.35), c[0], c[1], M_["wand"],
                           M_["schnitt"] if c[2] else M_["wand"])
        for s in slabs:
            poly, _ = K.clip_polygon(footprint, s["clip"], F)
            c = _cut(s["z"] - s["t"], s["z"], zc)
            if poly and c:
                _extrude(mb, poly, c[0], c[1], M_["dach"], M_["schnitt"] if c[2] else M_["boden"])
        if dg and zc is not None:
            _manual_walls(mb, W["wohnungen"][dg["wohnung"]], dg, zc, M_)
            if geschoss in G and G[geschoss].get("typ") == "dach":
                for wk in state.get("wohnungen", []):
                    h = S["wohnungen"][wk]
                    _extrude(hl, h["polygon"], dg["ffb"] + 0.003, dg["ffb"] + 0.02, "modell_wohnung",
                             "modell_wohnung")
    objs = []
    for b in (hero.mass, hero.orn, hero.frames, hero.glass):
        cb = clip_builder(b, zc, "schnitt_" + b.name)
        if cb.faces:
            objs.append(cb.to_object(bpy, remap_materials(cb.materials, mats, lib), coll))
    allm = {v.name: v for v in mats.values()}
    for b in (mb, hl):
        if b.faces:
            objs.append(b.to_object(bpy, allm, coll))
    return objs, stats


def _manual_walls(mb, apt: dict, dg: dict, zc, M_):
    """Innenwände einer Dachwohnung aus wohnungen.yaml (ManualApartment), ohne Glasfronten (die liefert der Hero)."""
    z0 = apt["floor_z"]
    for w in apt["walls"]:
        ops = w.get("openings", [])
        if dg.get("ohne_glasfronten", True) and any(o.get("type") == "glastuer" for o in ops):
            continue
        z1 = z0 + w.get("h", apt["height"])
        x0, y0, x1, y1 = w["rect"]
        along_y = (y1 - y0) >= (x1 - x0)
        a, b = (y0, y1) if along_y else (x0, x1)
        ops = sorted(ops, key=lambda o: o["span"][0])
        cuts = [a] + [v for o in ops for v in o["span"]] + [b]
        segs = [(cuts[i], cuts[i + 1], z0, z1) for i in range(0, len(cuts), 2)]
        segs += [(o["span"][0], o["span"][1], z0 + o.get("z", [0.0, 2.1])[1], z1) for o in ops]
        for s0, s1, za, zb in segs:
            c = _cut(za, zb, zc)
            if c is None or s1 - s0 < 1e-3:
                continue
            top = M_["schnitt"] if c[2] else M_["wand"]
            if along_y:
                _box(mb, x0, x1, s0, s1, c[0], c[1], M_["wand"], top)
            else:
                _box(mb, s0, s1, y0, y1, c[0], c[1], M_["wand"], top)


# ------------------------------------------------------------------ Kamera
def setup_axo_camera(bpy, scene, k: dict):
    from mathutils import Vector
    tx, ty, tz = k["ziel"]
    az, el = math.radians(k["azimut"]), math.radians(k["hoehe"])
    dist = k.get("abstand", 200.0)
    d = Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)))
    cam = bpy.data.cameras.get("schnitt") or bpy.data.cameras.new("schnitt")
    cam.type = "ORTHO"
    cam.ortho_scale = k["breite"]
    cam.clip_start = 1.0
    cam.clip_end = dist + 400
    cam.shift_x = k.get("shift_x", 0.0)
    cam.shift_y = k.get("shift_y", 0.0)
    ob = bpy.data.objects.get("KAM_schnitt") or bpy.data.objects.new("KAM_schnitt", cam)
    if ob.name not in scene.collection.objects:
        scene.collection.objects.link(ob)
    ob.location = Vector((tx, ty, tz)) + d * dist
    ob.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    scene.camera = ob
    return ob


# ------------------------------------------------------------------ Ablauf
def load_floors(project_dir: Path, cfg, ctx, S):
    F = {k: K.Facade(k, tuple(v["a"]), tuple(v["b"])) for k, v in cfg["facades"].items()}
    footprint = max((b["poly"] for b in ctx["hero"]), key=lambda p: abs(K.polygon_area(p)))
    cache = project_dir / "data" / "plan_cache"
    floors = {}
    for key in S["reihenfolge"]:
        g = S["geschosse"][key]
        if g.get("typ") != "dach":
            floors[key] = PlanFloor(key, g, S, footprint, F, cache, S.get("umriss_plus", []))
    return floors, footprint


def write_checks(project_dir: Path, S, floors, footprint):
    out_dir = project_dir / "renders" / "schnitt"
    res = {}
    for key, fl in floors.items():
        hls = []
        for wk, h in S["wohnungen"].items():
            if h["geschoss"] == key:
                hls.append(fl.floor_cells(h["polygon"], h.get("ohne", [])))
        res[key] = fl.check_image(out_dir / f"check_{key}.jpg", footprint, hls, S.get("umriss_plus", []))
    return res


def render_section(project_dir: Path, preview: bool = True, only: list[str] | None = None, checks: bool = True):
    import bpy
    from . import build as B
    W = yaml.safe_load((project_dir / "wohnungen.yaml").read_text())
    S = W["schnitt"]
    S["pdf"] = S.get("pdf") or W["plaene"][S.get("plan_von", "og1")]["pdf"]
    cfg, ctx = B.load_project(project_dir)
    cfg["lights"].update(W.get("lichter", {}))
    cfg["lights"].update(S.get("lichter", {}))
    floors, footprint = load_floors(project_dir, cfg, ctx, S)
    out_dir = project_dir / "renders" / "schnitt"
    out_dir.mkdir(parents=True, exist_ok=True)
    result = {"checks": write_checks(project_dir, S, floors, footprint) if checks else {}, "bilder": []}

    scene = B.build_scene(cfg, ctx)
    objekt = bpy.data.collections.get("Objekt")
    if objekt:        # Bestands-Hero aus build_scene wird durch das Schnittmodell ersetzt
        for o in list(objekt.objects):
            bpy.data.objects.remove(o, do_unlink=True)
    lib = {m.name: m for m in bpy.data.materials}
    mats = build_model_materials(bpy, S)
    coll = bpy.data.collections.new("Schnitt")
    scene.collection.children.link(coll)
    R = S["render"]
    res = R["preview_resolution"] if preview else R["resolution"]
    smp = R["preview_samples"] if preview else R["samples"]
    B.setup_render(scene, tuple(res), smp)
    B.setup_light(scene, cfg, ctx, S.get("licht", "vormittag"))
    if "exposure" in S:
        scene.view_settings.exposure = S["exposure"]
    setup_axo_camera(bpy, scene, S["kamera"])
    for st in S["zustaende"]:
        if only and st["name"] not in only:
            continue
        for o in list(coll.objects):
            me = o.data
            bpy.data.objects.remove(o, do_unlink=True)
            if me is not None and me.users == 0:
                bpy.data.meshes.remove(me)
        _, stats = build_state(bpy, cfg, ctx, W, S, floors, mats, lib, coll, st)
        p = out_dir / f"{st['name']}.png"
        scene.render.filepath = str(p)
        bpy.ops.render.render(write_still=True)
        result["bilder"].append({"datei": str(p), "titel": st["titel"], "schnitt": st.get("schnitt"),
                                 "geschoss": st.get("geschoss"), "statistik": stats})
    if not only:
        result["uebersicht"] = contact_sheet([(b["datei"], b["titel"], b["schnitt"]) for b in result["bilder"]],
                                             out_dir / "uebersicht.jpg")
    return result


def contact_sheet(items, out: Path, cols: int = 3, width: int = 960):
    """Übersicht aller Zustände mit Beschriftung (Titel und Schnitthöhe)."""
    ims = [Image.open(p).convert("RGB") for p, _, _ in items]
    h = round(width * ims[0].height / ims[0].width)
    bar = 56
    rows = math.ceil(len(ims) / cols)
    sheet = Image.new("RGB", (cols * width, rows * (h + bar)), (250, 248, 244))
    try:
        fb = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", 24)
        fr = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Regular.otf", 20)
    except OSError:
        fb = fr = ImageFont.load_default()
    d = ImageDraw.Draw(sheet)
    for i, (im, (_, titel, zc)) in enumerate(zip(ims, items)):
        x, y = (i % cols) * width, (i // cols) * (h + bar)
        sheet.paste(im.resize((width, h), Image.LANCZOS), (x, y))
        d.rectangle([x, y + h, x + 10, y + h + bar], fill=(255, 170, 9))
        d.text((x + 22, y + h + 12), f"{i:02d}  {titel}", font=fb, fill=(30, 30, 30))
        info = "ohne Schnitt" if zc is None else f"Schnitt z = {zc:.2f} m"
        d.text((x + width - 20, y + h + 15), info, font=fr, fill=(110, 105, 100), anchor="ra")
    sheet.save(out, quality=90)
    return str(out)
