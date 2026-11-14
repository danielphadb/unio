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


# ======================================================================= Umgebung
def build_context(ctx, mats, coll, radius=150.0, detail=110.0, hero_poly=None):
    rng = random.Random(7)
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
    for b in ctx["buildings"]:
        poly = b["poly"]
        if len(poly) < 3 or b["height"] < 1.0:
            continue
        cx = sum(p[0] for p in poly) / len(poly)
        cy = sum(p[1] for p in poly) / len(poly)
        dist = math.hypot(cx, cy)
        if dist > radius:
            continue
        if K.polygon_area(poly) < 0:
            poly = poly[::-1]
        h = b["height"]
        col = f"nachbar_{b['id'] % len(M.NEIGHBOUR_PALETTE)}"
        K.extrude(walls, poly, 0.0, h, col, "nachbar_dach", bottom=False)
        if dist > detail or h < 5.0 or b.get("klasse") != 11:
            continue
        n = len(poly)
        for i in range(n):
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
    walls.to_object(bpy, mats, coll)
    wins.to_object(bpy, mats, coll)
    roofs.to_object(bpy, mats, coll)

    ground = K.MeshBuilder("umgebung_boden", ["asphalt"])
    r = 4000.0
    ground.poly([(-r, -r, -0.02), (r, -r, -0.02), (r, r, -0.02), (-r, r, -0.02)], None, "asphalt", (0, 0, 1))
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
    far.to_object(bpy, mats, coll)
    spec = {"Fahrbahn": ("asphalt", 0.0, 0.0), "Gehsteig": ("gehsteig", 0.0, 0.12),
            "Gehweg, Radweg": ("gehsteig", 0.0, 0.12), "Ruhender Verkehr": ("parkstreifen", 0.004, 0.0),
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
    ground.to_object(bpy, mats, coll)

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
    me = bpy.data.meshes.new("baeume_kronen")
    me.from_pydata(cv, [], cf)
    me.materials.append(mats["laub"])
    ob = bpy.data.objects.new("baeume_kronen", me)
    coll.objects.link(ob)
    trunks.to_object(bpy, mats, coll)


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
        build_context(ctx, mats, ctx_coll, radius=cfg["site"].get("radius_m", 160) - 10,
                      detail=cfg["site"].get("detail_radius_m", 110), hero_poly=hero.footprint)
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
