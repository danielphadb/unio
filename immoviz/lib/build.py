"""Baut die Blender-Szene aus project.yaml und context.json und rendert sie."""
from __future__ import annotations

import json
import math
import random
from pathlib import Path

import bpy
import bmesh
import yaml
from mathutils import Vector

from . import materials as M
from . import meshkit as K
from .sun import sun_position, sun_vector_local

LAST_TERRAIN = None
STREET_LAYERS = {"Fahrbahn", "Gehsteig", "Ruhender Verkehr", "Gehweg, Radweg", "Zebrastreifen",
                 "Sonstige Verkehrsfläche", "Befestigte Fläche", "Fahrbahnschwelle"}


def load_project(project_dir: Path):
    cfg = yaml.safe_load((project_dir / "project.yaml").read_text())
    ctx_path = project_dir / "data" / "context.json"
    ctx = json.loads(ctx_path.read_text()) if ctx_path.exists() else None
    return cfg, ctx


# ======================================================================= Held: Altbau
class Hero:
    def __init__(self, cfg, ctx, mats):
        self.cfg, self.ctx, self.mats = cfg, ctx, mats
        self.F = {k: K.Facade(k, tuple(v["a"]), tuple(v["b"])) for k, v in cfg["facades"].items()}
        self.rng = random.Random(20)
        self.mass = K.MeshBuilder("hero_masse", ["fassade"])
        self.orn = K.MeshBuilder("hero_stuck", ["stuck"])
        self.frames = K.MeshBuilder("hero_rahmen", ["fenster"])
        self.glass = K.MeshBuilder("hero_glas", ["glas"])
        self.inner = K.MeshBuilder("hero_innen", ["innen_a"])
        polys = [b["poly"] for b in ctx["hero"]] if ctx else []
        self.footprint = max(polys, key=lambda p: abs(K.polygon_area(p))) if polys else None

    # Ecke: welches Ende einer Fassade liegt am Treffpunkt mit einer anderen?
    def corner_ext(self, f):
        ends = []
        for end in (f.a, f.b):
            hit = any(o is not f and (math.dist(end, o.a) < 0.3 or math.dist(end, o.b) < 0.3)
                      for o in self.F.values())
            ends.append(hit)
        return tuple(ends)

    def card(self, f, ua, ub, za, zb, d):
        mat = self.rng.choices(["innen_a", "innen_b", "innen_c"], [0.45, 0.25, 0.30])[0]
        K.quad_plane(self.inner, f, ua - 0.5, ub + 0.5, za - 0.4, zb + 0.3, d, mat)

    def altbau(self):
        A = self.cfg["altbau"]
        H = A["height"]
        rows = A["rows"]
        for fname, fs in A["facades"].items():
            f = self.F[fname]
            L = f.length
            axes = fs["axes"]
            openings = []  # (typ, ua, ub, za, zb, surround)
            eg_map = {}
            for grp in fs.get("eg", []):
                for ax in grp["axes"]:
                    eg_map[ax] = grp
            for rname, r in rows.items():
                for i, uc in enumerate(axes):
                    typ, w, za, zb, sur = r["type"], r["w"], r["z"], r["z"] + r["h"], r["surround"]
                    if rname == "eg" and i in eg_map:
                        g = eg_map[i]
                        typ = g["type"]
                        if "z" in g:
                            za, zb = g["z"]
                        if typ == "haustor":
                            openings.append(("haustor", g["u"][0], g["u"][1], za, zb, None))
                            continue
                        if typ == "schaufenster":
                            sur = None
                        if g.get("keller"):
                            openings.append(("keller", uc - 0.36, uc + 0.36, 0.80, 1.25, None))
                    openings.append((typ, uc - w / 2, uc + w / 2, za, zb, sur))
            holes = [(o[1], o[2], o[3], o[4]) for o in openings]
            K.wall_with_holes(self.mass, f, 0.0, L, 0.0, H, 0.0, holes, "fassade",
                              reveal=0.30, reveal_mat="laibung")
            for typ, ua, ub, za, zb, sur in openings:
                if typ == "kastenfenster":
                    K.kastenfenster(self.frames, self.glass, f, ua, ub, za, zb, 0.0)
                elif typ == "schaufenster":
                    K.schaufenster(self.frames, self.glass, f, ua, ub, za, zb, 0.0)
                elif typ == "haustor":
                    K.haustor(self.frames, self.glass, f, ua, ub, za, zb, 0.0)
                elif typ == "keller":
                    K.modern_window(self.frames, self.glass, f, ua, ub, za, zb, 0.05, split=False)
                if sur:
                    K.surround(self.orn, f, ua, ub, za, zb, sur)
                if typ != "keller":
                    self.card(f, ua, ub, za, zb, 2.2)
            ext = self.corner_ext(f)
            for c in A["cornices"]:
                K.cornice(self.orn, f, 0.0, L, c["steps"], "stuck", ext)
                if "consoles" in c:
                    cs = c["consoles"]
                    for uc in axes:
                        for du in (-0.75, 0.75):
                            u = uc + du
                            if 0.2 < u < L - 0.2:
                                K.box(self.orn, f, u - cs["w"] / 2, u + cs["w"] / 2, -cs["proj"], 0.0,
                                      cs["z"][0], cs["z"][1], "stuck")
            for u in fs.get("endcaps", []):
                al = f.along
                n = (-al[0], -al[1], 0) if u < 0.1 else al
                P = f.p
                self.mass.poly([P(u, 0, 0), P(u, A["core_depth"], 0), P(u, A["core_depth"], H), P(u, 0, H)],
                               None, "putz_hof", n)
        if self.footprint:
            rules = [[k, "d", ">=", A["core_depth"]] for k in A["facades"]]
            core, lines = K.clip_polygon(self.footprint, rules, self.F)
            K.extrude(self.mass, core, 0.0, H, "putz_hof", "dach_flach", "innen", lines)
            for z in A["slabs"]:
                rules = [[k, "d", ">=", 0.3] for k in A["facades"]]
                sl, _ = K.clip_polygon(self.footprint, rules, self.F)
                K.extrude(self.mass, sl, z, z + 0.25, "innen", "innen")

    # ------------------------------------------------------------ Dachgeschosse
    def dach(self):
        D = self.cfg["dach"]
        A = self.cfg["altbau"]
        dm = D.get("material", "zink")
        for w in D.get("walls", []):
            f = self.F[w["facade"]]
            u0, u1 = w["u"]
            z0, z1 = w["z"]
            d = w["d"]
            wins = [(x["u"][0], x["u"][1], x["z"][0], x["z"][1]) for x in w.get("windows", [])]
            if w.get("axes_from") == "altbau":
                for uc in A["facades"][w["facade"]]["axes"]:
                    if u0 + 0.4 < uc < u1 - 0.4:
                        for za, zb in w["rows"]:
                            wins.append((uc - w["w"] / 2, uc + w["w"] / 2, za, zb))
            holes = list(wins)
            for lg in w.get("loggias", []):
                holes.append((lg["u"][0], lg["u"][1], lg["z"][0], lg["z"][1], lg["depth"]))
            K.wall_with_holes(self.mass, f, u0, u1, z0, z1, d, holes, dm, reveal=0.22)
            for (ua, ub, za, zb) in wins:
                K.modern_window(self.frames, self.glass, f, ua, ub, za, zb, d)
                self.card(f, ua, ub, za, zb, d + 1.2)
            for lg in w.get("loggias", []):
                ua, ub = lg["u"]
                za, zb = lg["z"]
                back = d + lg["depth"]
                s = lg["slab"]
                K.box(self.mass, f, ua, ub, d - 0.05, back, s, s + 0.22, dm)
                K.modern_window(self.frames, self.glass, f, ua + 0.1, ub - 0.1, za + 0.05, s - 0.05, back - 0.15)
                K.modern_window(self.frames, self.glass, f, ua + 0.1, ub - 0.1, s + 0.25, zb - 0.1, back - 0.15)
                self.card(f, ua, ub, za, zb, back + 1.0)
                r0, r1 = lg["rail"]
                K.box(self.frames, f, ua, ub, d - 0.02, d + 0.04, r1 - 0.05, r1, "rahmen_dunkel")
                n = int((ub - ua) / 0.12)
                for k in range(n + 1):
                    u = ua + 0.05 + k * (ub - ua - 0.1) / max(n, 1)
                    K.box(self.frames, f, u - 0.012, u + 0.012, d, d + 0.024, r0, r1, "rahmen_dunkel")
        for s in D.get("slopes", []):
            f = self.F[s["facade"]]
            u0, u1 = s["u"]
            z0, z1 = s["z"]
            d0, d1 = s["d"]
            K.slope(self.mass, f, u0, u1, z0, z1, d0, d1, dm)
            for rw in s.get("roof_windows", []):
                K.roof_window(self.frames, self.glass, f, rw["u"][0], rw["u"][1], rw["z"][0], rw["z"][1],
                              z0, z1, d0, d1)
        for r in D.get("railings", []):
            f = self.F[r["facade"]]
            u0, u1 = r["u"]
            z, d, h = r["z"], r["d"], r["h"]
            K.quad_plane(self.glass, f, u0, u1, z + 0.05, z + h - 0.05, d, "glas_gelaender")
            K.box(self.frames, f, u0, u1, d - 0.03, d + 0.03, z + h - 0.05, z + h, "rahmen_dunkel")
            K.box(self.frames, f, u0, u1, d - 0.03, d + 0.03, z, z + 0.06, "rahmen_dunkel")
        for v in D.get("volumes", []):
            poly, lines = K.clip_polygon(self.footprint, v["clip"], self.F)
            K.extrude(self.mass, poly, v["z"][0], v["z"][1], dm, "dach_flach", "innen", lines)
        for s in D.get("slabs", []):
            poly, _ = K.clip_polygon(self.footprint, s["clip"], self.F)
            K.extrude(self.mass, poly, s["z"] - s["t"], s["z"], dm, "terrasse")
        for b in D.get("boxes", []):
            f = self.F[b["facade"]]
            K.box(self.mass, f, b["u"][0], b["u"][1], b["d"][0], b["d"][1], b["z"][0], b["z"][1],
                  b.get("material", dm), skip_back=False)
        so = D.get("solar")
        if so:
            f = self.F[so["facade"]]
            d0, d1 = so["d"]
            step = (d1 - d0) / so["rows"]
            for k in range(so["rows"]):
                da = d0 + k * step
                K.box(self.mass, f, so["u"][0], so["u"][1], da, da + step * 0.7,
                      so["z"] + 0.25, so["z"] + 0.32, "solar", skip_back=False)

    def emit(self, coll):
        for mb in (self.mass, self.orn, self.frames, self.glass, self.inner):
            mb.to_object(bpy, self.mats, coll)


# ======================================================================= Gelaende
def fit_terrain(ctx, ground_wn, anchors, radius=120.0):
    """Ebene z = a + b*x + c*y aus Gebaeude-Sockelhoehen (OGD) und Plankoten (stark gewichtet)."""
    import numpy as np
    rows, vals, w = [], [], []
    for b in ctx["buildings"]:
        if b.get("ground") is None or b.get("klasse") != 11:
            continue
        p = b["poly"]
        cx = sum(q[0] for q in p) / len(p)
        cy = sum(q[1] for q in p) / len(p)
        if math.hypot(cx, cy) < radius:
            rows.append([1, cx, cy]); vals.append(b["ground"] - ground_wn); w.append(1.0)
    for x, y, z in anchors or []:
        rows.append([1, x, y]); vals.append(z); w.append(25.0)
    if len(rows) < 3:
        return lambda x, y: 0.0
    A = np.array(rows) * np.array(w)[:, None]
    coef, *_ = np.linalg.lstsq(A, np.array(vals) * np.array(w), rcond=None)
    a, b, c = coef
    return lambda x, y: float(a + b * x + c * y)


def contour_terrain(ctx, ground_wn):
    """Gelaende aus Hoehenlinien: lineare Interpolation zwischen den zwei naechsten Hoehenstufen."""
    import numpy as np
    P = np.array(ctx.get("contours") or [])
    if len(P) < 10:
        return None
    X, Y, H = P[:, 0], P[:, 1], P[:, 2] - ground_wn

    def z(x, y):
        d = np.hypot(X - x, Y - y)
        i1 = int(np.argmin(d))
        h1, d1 = H[i1], d[i1]
        m = H != h1
        if not m.any():
            return float(h1)
        j = np.where(m)[0][np.argmin(d[m])]
        h2, d2 = H[j], d[j]
        return float((h1 * d2 + h2 * d1) / (d1 + d2 + 1e-6))
    return z


def shift_z(mb, fn):
    mb.verts = [(x, y, z + fn(x, y)) for x, y, z in mb.verts]


# ======================================================================= Autos
CAR_COLORS = ["auto_dunkelgrau", "auto_schwarz", "auto_weiss", "auto_silber", "auto_blau", "auto_dunkelgrau",
              "auto_schwarz", "auto_weiss"]


def park_cars(ctx, rng, terrain, radius):
    cars = K.MeshBuilder("autos", ["auto_dunkelgrau"])
    for s in ctx["surfaces"]:
        if s["layer"] != "Ruhender Verkehr" or len(s["poly"]) < 3:
            continue
        poly = s["poly"]
        cx = sum(p[0] for p in poly) / len(poly)
        cy = sum(p[1] for p in poly) / len(poly)
        if math.hypot(cx, cy) > radius:
            continue
        # Hauptrichtung = laengste Kante; Breite quer dazu
        edges = [(poly[i], poly[(i + 1) % len(poly)]) for i in range(len(poly))]
        (p1, p2) = max(edges, key=lambda e: math.dist(*e))
        f = K.Facade("p", p1, p2)
        uds = [f.ud(*p) for p in poly]
        us = [u for u, _ in uds]
        ds = [d for _, d in uds]
        u0, u1, d0, d1 = min(us), max(us), min(ds), max(ds)
        width = d1 - d0
        if u1 - u0 < 4.0 or width < 1.7:
            continue
        angled = width > 4.2
        step = 2.75 if angled else 5.7
        n = int((u1 - u0 - (1.0 if angled else 0.3)) / step)
        for k in range(n):
            if rng.random() > 0.85:
                continue
            uc = u0 + (k + 0.5) * step + (0.5 if angled else 0.15)
            dc = (d0 + d1) / 2
            if not K.point_in_poly(*f.p(uc, dc, 0)[:2], poly):
                continue
            ang = math.radians(rng.choice([55, 58, 60]) if angled else 0) * (1 if rng.random() < 0.97 else -1)
            col = rng.choice(CAR_COLORS)
            L, W = rng.uniform(4.2, 4.8), rng.uniform(1.78, 1.9)
            ca, sa = math.cos(ang), math.sin(ang)
            # lokales Autosystem: Achse a entlang Fahrzeug, b quer
            ax = (f.t[0] * ca - f.n[0] * sa, f.t[1] * ca - f.n[1] * sa)
            bx = (-ax[1], ax[0])
            ox, oy, _ = f.p(uc, dc, 0)
            zg = terrain(ox, oy)
            def blk(la, lb, wa, wb, z0, z1, mat):
                P = lambda a_, b_, z_: (ox + ax[0] * a_ + bx[0] * b_, oy + ax[1] * a_ + bx[1] * b_, zg + z_)
                c = [(la, wa), (lb, wa), (lb, wb), (la, wb)]
                cars.poly([P(a_, b_, z1) for a_, b_ in c], None, mat, (0, 0, 1))
                for i in range(4):
                    (a1, b1), (a2, b2) = c[i], c[(i + 1) % 4]
                    nx, ny = (b2 - b1), -(a2 - a1)
                    cars.poly([P(a1, b1, z0), P(a2, b2, z0), P(a2, b2, z1), P(a1, b1, z1)], None, mat,
                              (ax[0] * nx + bx[0] * ny, ax[1] * nx + bx[1] * ny, 0))
            blk(-L / 2, L / 2, -W / 2, W / 2, 0.32, 0.95, col)
            blk(-L / 2 + 0.9, L / 2 - 1.15, -W / 2 + 0.08, W / 2 - 0.08, 0.95, 1.45, "autoglas")
            for wa in (-L / 2 + 0.75, L / 2 - 0.8):
                for wb in (-W / 2 + 0.05, W / 2 - 0.25):
                    blk(wa - 0.33, wa + 0.33, wb, wb + 0.2, 0.0, 0.62, "reifen")
    return cars


# ======================================================================= Umgebung
def build_context(ctx, mats, coll, radius=150.0, detail=110.0, hero_poly=None, terrain=None, cfg=None):
    rng = random.Random(7)
    terrain = terrain or (lambda x, y: 0.0)
    streets = []
    for s in ctx["surfaces"]:
        if s["layer"] in STREET_LAYERS and len(s["poly"]) >= 3:
            xs = [p[0] for p in s["poly"]]
            ys = [p[1] for p in s["poly"]]
            streets.append((min(xs), max(xs), min(ys), max(ys), s["poly"]))

    def on_street(x, y):
        for x0, x1, y0, y1, poly in streets:
            if x0 <= x <= x1 and y0 <= y <= y1 and K.point_in_poly(x, y, poly):
                return True
        return False

    walls = K.MeshBuilder("umgebung_gebaeude", ["nachbar_0"])
    wins = K.MeshBuilder("umgebung_fenster", ["fenster_dunkel"])
    roofs = K.MeshBuilder("umgebung_daecher", ["nachbar_dach"])
    special = {str(v["bezug"]) for v in (cfg or {}).get("neighbour_facades", {}).values()}
    for b in ctx["buildings"]:
        poly = b["poly"]
        if len(poly) < 3 or b["height"] < 1.0 or str(b.get("bezug")) in special:
            continue
        cx = sum(p[0] for p in poly) / len(poly)
        cy = sum(p[1] for p in poly) / len(poly)
        dist = math.hypot(cx, cy)
        if dist > radius:
            continue
        if K.polygon_area(poly) < 0:
            poly = poly[::-1]
        zg = terrain(cx, cy)
        h = b["height"]
        col = f"nachbar_{b['id'] % len(M.NEIGHBOUR_PALETTE)}"
        nbc = (cfg or {}).get("neighbours", {}).get(str(b.get("bezug")))
        if nbc:
            col = f"nachbar_{b.get('bezug')}"
            if col not in mats:
                mats[col] = M.plaster(bpy, col, tuple(c * 0.72 for c in M.hex_rgb(nbc)), sockel=0.6)
        nb_w, nb_win, nb_r = K.MeshBuilder("t", walls.materials), K.MeshBuilder("t", wins.materials), K.MeshBuilder("t", roofs.materials)
        walls_, wins_, roofs_ = walls, wins, roofs
        walls, wins, roofs = nb_w, nb_win, nb_r
        K.extrude(walls, poly, -1.5, h, col, "nachbar_dach", bottom=False)
        n = len(poly)
        detailed = not (dist > detail or h < 5.0 or b.get("klasse") != 11)
        for i in (range(n) if detailed else []):
            p1, p2 = poly[i], poly[(i + 1) % n]
            L = math.dist(p1, p2)
            if L < 3.0:
                continue
            f = K.Facade("n", p1, p2)
            mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
            if not on_street(mx + f.n[0] * 2.5, my + f.n[1] * 2.5):
                continue
            floors = max(1, int((h - 1.5) / 3.3))
            cols = max(1, int((L - 0.8) / 2.1))
            sp = L / cols
            for fl in range(floors):
                if fl == 0:
                    za, zb = 1.1, 3.1
                else:
                    za = 4.3 + (fl - 1) * 3.3
                    zb = za + 1.75
                if zb > h - 0.6:
                    break
                for c in range(cols):
                    uc = (c + 0.5) * sp
                    ua, ub = uc - 0.55, uc + 0.55
                    K.quad_plane(wins, f, ua, ub, za, zb, -0.015, "fenster_dunkel")
                    K.box(wins, f, ua - 0.07, ub + 0.07, -0.03, 0.0, za - 0.07, za, "nachbar_rahmen")
                    K.box(wins, f, ua - 0.07, ub + 0.07, -0.03, 0.0, zb, zb + 0.07, "nachbar_rahmen")
                    K.box(wins, f, ua - 0.07, ua, -0.03, 0.0, za, zb, "nachbar_rahmen")
                    K.box(wins, f, ub, ub + 0.07, -0.03, 0.0, za, zb, "nachbar_rahmen")
                    K.box(wins, f, uc - 0.025, uc + 0.025, -0.02, 0.0, za, zb, "nachbar_rahmen")
            K.box(walls, f, 0.0, L, -0.35, 0.0, h - 0.55, h, col)
            K.box(walls, f, 0.0, L, -0.08, 0.0, 3.6, 3.9, col)
        if h > 8.0 and b.get("klasse") == 11:
            # Walmdach-Naeherung: zum Schwerpunkt skalierte Traufe, 1:1 verbundene Dachflaechen
            xs = [p[0] for p in poly]
            ys = [p[1] for p in poly]
            span = min(max(xs) - min(xs), max(ys) - min(ys))
            k = max(0.35, 1 - 2 * 2.6 / max(span, 1))
            rh = 2.2 + rng.random() * 1.6
            top = [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in poly]
            rm = "dach_ziegel" if rng.random() < 0.55 else "dach_blech"
            for i in range(n):
                a0, a1 = poly[i], poly[(i + 1) % n]
                t0, t1 = top[i], top[(i + 1) % n]
                roofs.poly([(*a0, h), (*a1, h), (*t1, h + rh), (*t0, h + rh)], None, rm,
                           (a1[1] - a0[1], -(a1[0] - a0[0]), 0.5))
            roofs.poly([(x, y, h + rh) for x, y in top], None, rm, (0, 0, 1))
        for mb_ in (walls, wins, roofs):
            mb_.verts = [(x, y, z + zg) for x, y, z in mb_.verts]
        walls_.merge(walls); wins_.merge(wins); roofs_.merge(roofs)
        walls, wins, roofs = walls_, wins_, roofs_
    walls.to_object(bpy, mats, coll)
    wins.to_object(bpy, mats, coll)
    roofs.to_object(bpy, mats, coll)

    ground = K.MeshBuilder("umgebung_boden", ["asphalt"])
    # Gelaenderaster (20 m) im Nahbereich, darunter eine tiefe Fernebene
    g, R0 = 8.0, 200.0
    nn = int(R0 / g)
    for i in range(-nn, nn):
        for j in range(-nn, nn):
            x0, y0 = i * g, j * g
            ground.poly([(x0, y0, -0.03), (x0 + g, y0, -0.03), (x0 + g, y0 + g, -0.03), (x0, y0 + g, -0.03)],
                        None, "asphalt", (0, 0, 1))
    far_ground = K.MeshBuilder("fernboden", ["asphalt"])
    r = 4000.0
    zf = min(terrain(R0 * math.cos(a), R0 * math.sin(a)) for a in [k * math.pi / 8 for k in range(16)]) - 0.3
    far_ground.poly([(-r, -r, zf), (r, -r, zf), (r, r, zf), (-r, r, zf)], None, "asphalt", (0, 0, 1))
    far_ground.to_object(bpy, mats, coll)
    # Fernzone: generische Wiener Blockrandbebauung bis 1,8 km, nur fuer Luft- und Dachansichten
    far = K.MeshBuilder("umgebung_fernzone", ["nachbar_0"])
    step = 78.0
    gi = int(1800 / step)
    for i in range(-gi, gi + 1):
        for j in range(-gi, gi + 1):
            cx0, cy0 = i * step + rng.uniform(-6, 6), j * step + rng.uniform(-6, 6)
            dd = math.hypot(cx0, cy0)
            if dd < radius + 25 or dd > 1800:
                continue
            w, l = rng.uniform(52, 64), rng.uniform(52, 64)
            hh = rng.uniform(15, 25)
            col = f"nachbar_{rng.randrange(len(M.NEIGHBOUR_PALETTE))}"
            outer = [(cx0 - w / 2, cy0 - l / 2), (cx0 + w / 2, cy0 - l / 2), (cx0 + w / 2, cy0 + l / 2), (cx0 - w / 2, cy0 + l / 2)]
            K.extrude(far, outer, 0.0, hh, col, "nachbar_dach", bottom=False)
            rm = "dach_ziegel" if rng.random() < 0.55 else "dach_blech"
            ins = [(cx0 - w / 2 + 6, cy0 - l / 2 + 6), (cx0 + w / 2 - 6, cy0 - l / 2 + 6),
                   (cx0 + w / 2 - 6, cy0 + l / 2 - 6), (cx0 - w / 2 + 6, cy0 + l / 2 - 6)]
            rh = rng.uniform(3, 5)
            for k in range(4):
                a0, a1 = outer[k], outer[(k + 1) % 4]
                t0, t1 = ins[k], ins[(k + 1) % 4]
                far.poly([(*a0, hh), (*a1, hh), (*t1, hh + rh), (*t0, hh + rh)], None, rm,
                         (a1[1] - a0[1], -(a1[0] - a0[0]), 0.5))
            far.poly([(x, y, hh + rh) for x, y in ins], None, "hof", (0, 0, 1))
    shift_z(far, terrain)
    far.to_object(bpy, mats, coll)
    spec = {"Fahrbahn": ("asphalt", 0.0, 0.0), "Gehsteig": ("gehsteig", 0.0, 0.12),
            "Gehweg, Radweg": ("gehsteig", 0.0, 0.12), "Ruhender Verkehr": ((cfg or {}).get("street", {}).get("parking_material", "parkstreifen"), 0.004, 0.0),
            "Zebrastreifen": ("zebra", 0.008, 0.0), "Innenhof": ("hof", 0.0, 0.05),
            "Befestigte Fläche": ("gehsteig", 0.0, 0.05), "Sonstige Verkehrsfläche": ("gehsteig", 0.0, 0.1)}
    for s in ctx["surfaces"]:
        if s["layer"] not in spec or len(s["poly"]) < 3:
            continue
        cx = sum(p[0] for p in s["poly"]) / len(s["poly"])
        cy = sum(p[1] for p in s["poly"]) / len(s["poly"])
        if math.hypot(cx, cy) > radius + 30:
            continue
        mat, z, h = spec[s["layer"]]
        if h > 0:
            K.extrude(ground, s["poly"], 0.0, h, "randstein", mat, bottom=False)
        else:
            poly = s["poly"] if K.polygon_area(s["poly"]) > 0 else s["poly"][::-1]
            ground.poly([(x, y, z) for x, y in poly], [(x, y) for x, y in poly], mat, (0, 0, 1))
    shift_z(ground, terrain)
    ground.to_object(bpy, mats, coll)
    # Seilleuchten
    cab = K.MeshBuilder("seilleuchten", ["seil"])
    for x0, y0, x1, y1 in (cfg or {}).get("street", {}).get("cables", []):
        f = K.Facade("c", (x0, y0), (x1, y1))
        L_ = f.length
        z0 = terrain((x0 + x1) / 2, (y0 + y1) / 2) + 7.5
        K.box(cab, f, 0.0, L_, -0.008, 0.008, z0 - 0.008, z0 + 0.008, "seil", skip_back=False)
        um = L_ / 2
        K.box(cab, f, um - 0.006, um + 0.006, -0.006, 0.006, z0 - 0.55, z0, "seil", skip_back=False)
        K.box(cab, f, um - 0.28, um + 0.28, -0.28, 0.28, z0 - 0.75, z0 - 0.55, "leuchte", skip_back=False)
    cab.to_object(bpy, mats, coll)
    park_cars(ctx, rng, terrain, min(radius, 200)).to_object(bpy, mats, coll)

    # Baeume aus dem Baumkataster. Kronen aus vielen kleinen Laubbueschen (Vorlage-Ikosaeder).
    tb = bmesh.new()
    bmesh.ops.create_icosphere(tb, subdivisions=1, radius=1.0)
    ico_v = [tuple(v.co) for v in tb.verts]
    ico_f = [[v.index for v in f.verts] for f in tb.faces]
    tb.free()
    cv, cf = [], []
    trunks = K.MeshBuilder("baeume_staemme", ["stamm"])
    for t in ctx["trees"]:
        x, y = t["pos"]
        if math.hypot(x, y) > min(radius, 260):
            continue
        if hero_poly and K.point_in_poly(x, y, hero_poly):
            continue
        H, C = t["height"], t["crown"]
        base = max(2.2, H - C * 0.95)
        rr = 0.08 + C * 0.012
        seg = 8
        for k in range(seg):
            a0, a1 = 2 * math.pi * k / seg, 2 * math.pi * (k + 1) / seg
            p = [(x + rr * math.cos(a0), y + rr * math.sin(a0)), (x + rr * math.cos(a1), y + rr * math.sin(a1))]
            trunks.poly([(*p[0], 0), (*p[1], 0), (*p[1], base + C * 0.3), (*p[0], base + C * 0.3)], None,
                        "stamm", (math.cos((a0 + a1) / 2), math.sin((a0 + a1) / 2), 0))
        cz = base + (H - base) / 2
        rx, rz = C / 2, (H - base) / 2
        for k in range(int(28 + C * 3)):
            while True:
                ox, oy, oz = (rng.random() * 2 - 1, rng.random() * 2 - 1, rng.random() * 2 - 1)
                if 0.35 < ox * ox + oy * oy + oz * oz <= 1.0:
                    break
            rs = 0.45 + rng.random() * (0.25 + C * 0.06)
            base_i = len(cv)
            cx_, cy_, cz_ = x + ox * rx * 0.85, y + oy * rx * 0.85, cz + oz * rz * 0.85
            for vx, vy, vz in ico_v:
                j = rs * (1 + (rng.random() - 0.5) * 0.5)
                cv.append((cx_ + vx * j, cy_ + vy * j, cz_ + vz * j * 0.8))
            cf.extend([[i + base_i for i in f] for f in ico_f])
    cv = [(x, y, z + terrain(x, y)) for x, y, z in cv]
    shift_z(trunks, terrain)
    me = bpy.data.meshes.new("baeume_kronen")
    me.from_pydata(cv, [], cf)
    me.materials.append(mats["laub"])
    ob = bpy.data.objects.new("baeume_kronen", me)
    coll.objects.link(ob)
    trunks.to_object(bpy, mats, coll)


# ======================================================================= Anschliessende Nachbarn
def build_neighbours(cfg, ctx, mats, coll, terrain):
    specs = cfg.get("neighbour_facades") or {}
    for name, sp in specs.items():
        f = K.Facade(name, tuple(sp["a"]), tuple(sp["b"]))
        L = f.length
        mx, my = (sp["a"][0] + sp["b"][0]) / 2, (sp["a"][1] + sp["b"][1]) / 2
        z0 = terrain(mx + f.n[0] * 2.5, my + f.n[1] * 2.5)
        H = sp["height"]
        col = f"nb_{name}"
        rust = sp.get("rustika")
        mats[col] = M.plaster(bpy, col, tuple(c * 0.74 for c in M.hex_rgb(sp["color"])),
                              rustika=(rust[0] + z0, rust[1] + z0, rust[2]) if rust else None, sockel=z0 + 0.6)
        mats[col + "_stuck"] = M.plaster(bpy, col + "_stuck", tuple(min(1, c * 0.8) for c in M.hex_rgb(sp.get("stuck_color", sp["color"]))), var=0.04, bump=0.1)
        mass = K.MeshBuilder(f"nachbar_{name}", [col])
        orn = K.MeshBuilder(f"nachbar_{name}_stuck", [col + "_stuck"])
        fr = K.MeshBuilder(f"nachbar_{name}_rahmen", ["fenster"])
        gl = K.MeshBuilder(f"nachbar_{name}_glas", ["glas"])
        inner = K.MeshBuilder(f"nachbar_{name}_innen", ["innen_a"])
        rng = random.Random(len(name))
        # Baukoerper aller Teile, an der Fassade 0,6 m zurueckgeschnitten
        for b in ctx["buildings"]:
            if str(b.get("bezug")) != str(sp["bezug"]) or b.get("klasse") != 11:
                continue
            poly, lines = K.clip_polygon(b["poly"], [[name, "d", ">=", 0.6]], {name: f})
            hb = b["height"]
            top_mat = "dach_flach"
            side = sp.get("upper_material") if (sp.get("upper_material") and hb > H + 1.0) else col
            K.extrude(mass, poly, z0 - 1.5, z0 + hb, side, top_mat, "innen", lines, bottom=False)
        holes, wins = [], []
        for ri, r in enumerate(sp["rows"]):
            for ai, uc in enumerate(sp["axes"]):
                if ri == 0 and sp.get("gate", {}).get("axis") == ai:
                    g = sp["gate"]
                    holes.append((uc - g["w"] / 2, uc + g["w"] / 2, z0, z0 + g["h"]))
                    continue
                if ri == 0 and sp.get("door") and sp["door"]["u"][0] - 0.3 < uc < sp["door"]["u"][1] + 0.3:
                    continue
                ua, ub = uc - r["w"] / 2, uc + r["w"] / 2
                za, zb = z0 + r["z"], z0 + r["z"] + r["h"]
                holes.append((ua, ub, za, zb))
                wins.append((ri, ai, ua, ub, za, zb, r.get("surround")))
        if sp.get("door"):
            d_ = sp["door"]
            holes.append((d_["u"][0], d_["u"][1], z0 + d_["z"][0], z0 + d_["z"][1]))
            K.schaufenster(fr, gl, f, d_["u"][0], d_["u"][1], z0 + d_["z"][0], z0 + d_["z"][1], 0.0)
        K.wall_with_holes(mass, f, 0.0, L, z0 - 1.5, z0 + H, 0.0, holes, col, reveal=0.28)
        for ri, ai, ua, ub, za, zb, sur in wins:
            if sp.get("style") == "modern":
                K.modern_window(fr, gl, f, ua, ub, za, zb, 0.0, frame_mat="rahmen_dunkel")
            else:
                K.kastenfenster(fr, gl, f, ua, ub, za, zb, 0.0)
            if sur:
                K.surround(orn, f, ua, ub, za, zb, sur, mat=col + "_stuck")
            K.quad_plane(inner, f, ua - 0.4, ub + 0.4, za - 0.3, zb + 0.3, 2.0,
                         rng.choice(["innen_a", "innen_b", "innen_c"]))
        if sp.get("gate"):
            g = sp["gate"]
            uc = sp["axes"][g["axis"]]
            mats[col + "_tor"] = M.oak(bpy, col + "_tor", M.hex_rgb(g["color"]))
            gtmp = K.MeshBuilder("t", ["haustor"])
            K.haustor(gtmp, gl, f, uc - g["w"] / 2, uc + g["w"] / 2, z0, z0 + g["h"], 0.0)
            gtmp.materials = [col + "_tor" if m == "haustor" else m for m in gtmp.materials]
            fr.merge(gtmp)
        for steps in sp.get("cornices", []):
            K.cornice(orn, f, 0.0, L, [[a + z0, b_ + z0, p] for a, b_, p in steps], col + "_stuck")
        if sp.get("consoles"):
            cs = sp["consoles"]
            for uc in sp["axes"]:
                for du in (-0.7, 0.7):
                    if 0.2 < uc + du < L - 0.2:
                        K.box(orn, f, uc + du - cs["w"] / 2, uc + du + cs["w"] / 2, -cs["proj"], 0.0,
                              z0 + cs["z"][0], z0 + cs["z"][1], col + "_stuck")
        for z_a, z_b, hexc in sp.get("bands", []):
            bm = f"{col}_band_{hexc[1:]}"
            mats[bm] = M.plaster(bpy, bm, tuple(c * 0.8 for c in M.hex_rgb(hexc)), var=0.04)
            # Band als duenne Vorsatzschale mit denselben Oeffnungen
            K.wall_with_holes(mass, f, 0.0, L, z0 + z_a, z0 + z_b, -0.015,
                              [h for h in holes if h[3] > z0 + z_a and h[2] < z0 + z_b], bm, reveal=0.02)
        K.box(mass, f, 0.0, L, 0.0, 0.65, z0 + H - 0.05, z0 + H, "dach_flach", skip_back=False)
        if sp.get("style") == "modern":
            K.box(mass, f, 0.0, L, -0.05, 0.6, z0 + H - 0.15, z0 + H + 0.15, "rahmen_dunkel")
        for bal in sp.get("balconies", []):
            r = sp["rows"][bal["row"]]
            zf = z0 + r["z"] - 0.15
            for ai in bal["axes"]:
                uc = sp["axes"][ai]
                ua, ub = uc - 1.15, uc + 1.15
                K.box(fr, f, ua, ub, -1.3, 0.0, zf - 0.18, zf, "rahmen_dunkel")
                K.box(fr, f, ua, ub, -1.32, -1.28, zf, zf + 1.05, "balkon_lochblech")
                K.box(fr, f, ua - 0.02, ua + 0.02, -1.3, 0.0, zf, zf + 1.05, "balkon_lochblech")
                K.box(fr, f, ub - 0.02, ub + 0.02, -1.3, 0.0, zf, zf + 1.05, "balkon_lochblech")
        rf = sp.get("roof")
        if rf:
            rm = "dach_ziegel" if rf.get("type") == "ziegel" else "dach_blech"
            K.slope(mass, f, 0.0, L, z0 + H, z0 + H + rf["rise"], -0.3, rf["depth"], rm, caps=(True, True))
        for mb in (mass, orn, fr, gl, inner):
            mb.to_object(bpy, mats, coll)


# ======================================================================= Szene, Licht, Kamera
def build_scene(cfg, ctx):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    cm = dict(cfg["materials"])
    alt = cfg["altbau"]
    cm["_altbau"] = {"rustika": (*alt["rustika"]["z"], alt["rustika"]["spacing"]), "sockel": alt["sockel"]}
    mats = M.build_library(bpy, cm)
    scene = bpy.context.scene
    hero_coll = bpy.data.collections.new("Objekt")
    ctx_coll = bpy.data.collections.new("Umgebung")
    scene.collection.children.link(hero_coll)
    scene.collection.children.link(ctx_coll)
    hero = Hero(cfg, ctx, mats)
    hero.altbau()
    hero.dach()
    hero.emit(hero_coll)
    if ctx:
        raw = contour_terrain(ctx, cfg["site"].get("ground_wn", 0.0)) or \
            fit_terrain(ctx, cfg["site"].get("ground_wn", 0.0), cfg["site"].get("terrain_anchors"))

        cache = {}

        def terrain(x, y, r=400.0):
            d = math.hypot(x, y)
            if d > r:
                x, y = x * r / d, y * r / d
            key = (round(x / 2.0), round(y / 2.0))
            if key not in cache:
                cache[key] = raw(key[0] * 2.0, key[1] * 2.0)
            return cache[key]
        global LAST_TERRAIN
        LAST_TERRAIN = terrain
        build_neighbours(cfg, ctx, mats, ctx_coll, terrain)
        build_context(ctx, mats, ctx_coll, radius=cfg["site"].get("radius_m", 160) - 10,
                      detail=cfg["site"].get("detail_radius_m", 110), hero_poly=hero.footprint, terrain=terrain, cfg=cfg)
    return scene


def setup_render(scene, res, samples):
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
    scene.cycles.max_bounces = 8
    scene.cycles.transparent_max_bounces = 12
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "AgX"
    for look in ("AgX - Medium High Contrast", "AgX - Base Contrast"):
        try:
            scene.view_settings.look = look
            break
        except TypeError:
            continue
    scene.render.image_settings.file_format = "PNG"


def setup_light(scene, cfg, ctx, name):
    L = cfg["lights"][name]
    lat = ctx["lat"] if ctx else 48.2
    lon = ctx["lon"] if ctx else 16.37
    elev, az = sun_position(lat, lon, L["date"], L["time"], L["tz"])
    sx, sy, sz = sun_vector_local(elev, az, cfg["site"]["x_axis_deg"])
    world = bpy.data.worlds.get("Welt") or bpy.data.worlds.new("Welt")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_elevation = math.radians(elev)
    sky.sun_rotation = math.atan2(sx, sy)
    sky.sun_disc = elev > -1
    sky.air_density = L.get("air", 1.0)
    sky.aerosol_density = L.get("aerosol", 1.2)
    bg.inputs["Strength"].default_value = L.get("sky_strength", 0.35 if elev > 3 else 0.6)
    nt.links.new(sky.outputs[0], bg.inputs[0])
    nt.links.new(bg.outputs[0], out.inputs[0])
    scene.view_settings.exposure = L.get("exposure", 0.0)
    M.set_interior_emission(bpy, L.get("interior", 0.0))
    M.set_season(bpy, L.get("season", "sommer"))
    return elev, az


def setup_camera(scene, cfg, name):
    c = cfg["cameras"][name]
    cam = bpy.data.cameras.get(name) or bpy.data.cameras.new(name)
    ob = bpy.data.objects.get(f"KAM_{name}") or bpy.data.objects.new(f"KAM_{name}", cam)
    if ob.name not in scene.collection.objects:
        scene.collection.objects.link(ob)
    px, py, pz = c["pos"]
    tx, ty, tz = c["target"]
    dx, dy, dz = tx - px, ty - py, tz - pz
    r = math.hypot(dx, dy)
    cam.lens = c.get("lens", 24)
    cam.sensor_width = 36
    cam.clip_end = 2000
    yaw = math.atan2(-dx, dy)
    if c.get("vertical", True):
        ob.rotation_euler = (math.radians(90), 0, yaw)
        aspect = scene.render.resolution_x / scene.render.resolution_y
        cam.shift_y = max(-1.0, min(1.0, (dz / r) * cam.lens / 36 * (1 if aspect >= 1 else aspect)))
        cam.shift_x = 0
    else:
        ob.rotation_euler = (math.radians(90) + math.atan2(dz, r), 0, yaw)
    ob.location = (px, py, pz)
    scene.camera = ob
    return ob


def render(project_dir: Path, cams: list[str], lights: list[str], preview: bool, save_blend: bool = True):
    cfg, ctx = load_project(project_dir)
    scene = build_scene(cfg, ctx)
    R = cfg["render"]
    res = R["preview_resolution"] if preview else R["resolution"]
    smp = R["preview_samples"] if preview else R["samples"]
    setup_render(scene, res, smp)
    out_dir = project_dir / "renders"
    out_dir.mkdir(exist_ok=True)
    results = []
    for ln in lights:
        elev, az = setup_light(scene, cfg, ctx, ln)
        for cn in cams:
            setup_camera(scene, cfg, cn)
            tag = "vorschau" if preview else "final"
            path = out_dir / f"{cfg['project']['slug']}_{cn}_{ln}_{tag}.png"
            scene.render.filepath = str(path)
            bpy.ops.render.render(write_still=True)
            results.append({"file": str(path), "camera": cn, "light": ln, "sun_elev": round(elev, 1),
                            "sun_az": round(az, 1)})
    if save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=str(project_dir / "renders" / f"{cfg['project']['slug']}.blend"))
    return results
