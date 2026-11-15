"""Neubau-Baukoerper aus project.yaml (Abschnitt `neubau`), fuer Objekte ohne Gruenderzeitfassade.

Ergaenzt den Altbau-Helden (lib/build.py, Hero) und wird nur gebaut, wenn `neubau` in project.yaml steht.
Alle Koordinaten im lokalen System des Projekts (Meter), z relativ zu +-0,00.

Bausteine (je Eintrag optional `gruppe`, Standard "neubau"; jede Gruppe wird zu eigenen Blender-Objekten
`<gruppe>_masse`, `_rahmen`, `_glas`, `_innen`, `_gruen`, damit Innenraumbilder einzelne Gruppen ausblenden koennen):

- koerper:   Prisma aus Grundriss-Polygon {poly, z: [z0, z1], wand, dach, ohne_kanten: [i, ...], boden: false}
- fassaden:  Wandflaeche mit Oeffnungen an einer Linie a -> b (Gebaeude links der Laufrichtung, wie meshkit.Facade)
             {a, b, z: [z0, z1], u: [u0, u1], d, wand, laibung, fenster: [{u, z, typ}], reihen: [{z, u: [[u0, u1], ...], typ}]}
             typ: fenster | tuer | hst (Hebeschiebetuer) | fix. Hinter jeder Oeffnung eine Innenraumkarte.
- boxen:     Quader an einer Linie {a, b, u, d, z, mat}
- gelaender: Polylinie {pts, z, h, typ: stab | glas | voll, mat}; Punkte [x, y, z] mit eigener Fusshoehe (Rampen)
- flaechen:  Platte aus Polygon {poly, z, dicke, mat}
- schraegen: beliebiges ebenes Polygon {pts: [[x, y, z], ...], mat}
- dachfenster: Fenster in einer schraegen Flaeche {pts: [4 Punkte im Uhrzeigersinn von unten links], mat}
- pv:        Modulreihen {a, b, u, d, z, reihen, neigung}
- straeucher: Kugelbuesche {pos, z, r, h}
- material:  zusaetzliche Materialien {name: {color, art: putz | einfach | metall | holz | platten | rasen | kies, rough}}
"""
from __future__ import annotations

import math
import random

from . import materials as M
from . import meshkit as K

GRUPPEN_TEILE = ("masse", "rahmen", "glas", "innen", "gruen")


def _mat_lib(bpy, mats: dict, spec: dict):
    """Materialien des Neubaus anlegen (nur fehlende)."""
    std = {
        "nb_rasen": {"color": "#55703A", "art": "rasen"},
        "nb_kies": {"color": "#9C978C", "art": "kies"},
        "nb_platten": {"color": "#B7B1A6", "art": "platten"},
        "nb_holzdeck": {"color": "#8A6A4C", "art": "holz"},
        "nb_metall": {"color": "#2F3133", "art": "metall"},
        "nb_attika": {"color": "#8E9194", "art": "metall"},
        "nb_busch": {"color": "#3E5A2A", "art": "rasen"},
        "nb_erde": {"color": "#5A4936", "art": "putz"},
    }
    std.update(spec or {})
    for name, s in std.items():
        if name in mats:
            continue
        c = M.hex_rgb(s["color"])
        c = tuple(v * s.get("faktor", 1.0) for v in c)
        art = s.get("art", "putz")
        if art == "putz":
            mats[name] = M.plaster(bpy, name, c, var=s.get("var", 0.05), bump=s.get("bump", 0.12))
        elif art == "einfach":
            mats[name] = M.simple(bpy, name, c, s.get("rough", 0.6))
        elif art == "metall":
            mats[name] = M.simple(bpy, name, c, s.get("rough", 0.4), s.get("metal", 0.5))
        elif art == "holz":
            mats[name] = M.oak(bpy, name, c)
        elif art == "zink":
            mats[name] = M.zinc(bpy, name, c)
        elif art == "platten":
            mats[name] = _platten(bpy, name, c, s.get("raster", 0.5))
        elif art in ("rasen", "kies"):
            mats[name] = M.plaster(bpy, name, c, var=0.25 if art == "rasen" else 0.15, bump=0.6 if art == "rasen" else 0.35)
        else:
            mats[name] = M.simple(bpy, name, c, 0.6)
    return mats


def _platten(bpy, name, color, raster):
    """Terrassenplatten im Raster (UV in Metern): helle Fugen."""
    m = M._new(bpy, name)
    N = M.Nodes(m)
    tc, sep = N.uv()
    fx = N.math("LESS_THAN", N.math("FRACT", N.math("DIVIDE", sep.outputs["X"], raster)), 0.012 / raster)
    fy = N.math("LESS_THAN", N.math("FRACT", N.math("DIVIDE", sep.outputs["Y"], raster)), 0.012 / raster)
    fuge = N.math("MAXIMUM", fx, fy)
    noise = N.new("ShaderNodeTexNoise", Scale=2.0, Detail=4.0)
    N.link(tc.outputs["UV"], noise.inputs["Vector"])
    base = N.mix_rgb(N.math("MULTIPLY", noise.outputs["Fac"], 0.2), color, tuple(c * 0.85 for c in color))
    base = N.mix_rgb(fuge, base, tuple(c * 0.55 for c in color))
    N.principled(base, rough=0.7)
    return m


class Neubau:
    def __init__(self, cfg: dict, mats: dict):
        import bpy
        self.N = cfg.get("neubau") or {}
        self.mats = _mat_lib(bpy, mats, self.N.get("material"))
        self.G: dict[str, dict] = {}
        self.rng = random.Random(13)
        self.fmat = self.N.get("fensterrahmen", "fenster")

    def g(self, item) -> dict:
        name = item.get("gruppe", "neubau") if isinstance(item, dict) else item
        if name not in self.G:
            self.G[name] = {t: K.MeshBuilder(f"{name}_{t}", ["innen"]) for t in GRUPPEN_TEILE}
        return self.G[name]

    # ------------------------------------------------------------ Bausteine
    def koerper(self, k):
        mb = self.g(k)["masse"]
        poly = [tuple(p) for p in k["poly"]]
        sg = 1.0 if K.polygon_area(poly) > 0 else -1.0       # Aussennormale je nach Umlaufsinn
        skip = set(k.get("ohne_kanten", []))                 # Kante i = Punkt i bis Punkt i+1
        z0, z1 = k["z"]
        wand, dach = k.get("wand", "fassade"), k.get("dach", "dach_flach")
        n, run = len(poly), 0.0
        for i in range(n):
            (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
            L = math.hypot(x2 - x1, y2 - y1)
            if L < 1e-4 or i in skip:
                run += L
                continue
            mb.poly([(x1, y1, z0), (x2, y2, z0), (x2, y2, z1), (x1, y1, z1)],
                     [(run, z0), (run + L, z0), (run + L, z1), (run, z1)], wand,
                     (sg * (y2 - y1), -sg * (x2 - x1), 0))
            run += L
        mb.poly([(x, y, z1) for x, y in poly], [(x, y) for x, y in poly], dach, (0, 0, 1))
        if k.get("boden", False):
            mb.poly([(x, y, z0) for x, y in poly], [(x, y) for x, y in poly], dach, (0, 0, -1))

    def fassade(self, fs):
        G = self.g(fs)
        f = K.Facade("nb", tuple(fs["a"]), tuple(fs["b"]))
        z0, z1 = fs["z"]
        u0, u1 = fs.get("u", [0.0, f.length])
        d = fs.get("d", 0.0)
        ops = []
        for o in fs.get("fenster", []):
            ops.append((o["u"][0], o["u"][1], o["z"][0], o["z"][1], o.get("typ", "fenster")))
        for r in fs.get("reihen", []):
            for uu in r["u"]:
                ops.append((uu[0], uu[1], r["z"][0], r["z"][1], r.get("typ", "fenster")))
        holes = [(a, b, c, e) for a, b, c, e, _ in ops]
        K.wall_with_holes(G["masse"], f, u0, u1, z0, z1, d, holes, fs.get("wand", "fassade"),
                          reveal=fs.get("laibung", 0.22), reveal_mat=fs.get("laibung_mat"))
        fm = fs.get("rahmen", self.fmat)
        for ua, ub, za, zb, typ in ops:
            dr = d + fs.get("laibung", 0.22) - 0.12
            if typ == "dunkel":
                K.quad_plane(G["rahmen"], f, ua, ub, za, zb, dr + 0.1, "fenster_dunkel")
                continue
            K.modern_window(G["rahmen"], G["glas"], f, ua, ub, za, zb, dr, frame_mat=fm, split=typ != "fix")
            if typ in ("fenster",) and fs.get("fensterbank", True):
                K.box(G["rahmen"], f, ua - 0.02, ub + 0.02, d - 0.05, dr + 0.08, za - 0.03, za, "blech")
            if typ == "hst":       # Hebeschiebetuer: zusaetzlicher Pfosten im Drittel
                K.box(G["rahmen"], f, ua + (ub - ua) * 0.5 - 0.04, ua + (ub - ua) * 0.5 + 0.04, dr, dr + 0.1, za, zb, fm)
            if fs.get("karten", True):
                mat = self.rng.choices(["innen_a", "innen_b", "innen_c"], [0.45, 0.25, 0.30])[0]
                K.quad_plane(G["innen"], f, ua - 0.4, ub + 0.4, za - 0.3, zb + 0.2, d + fs.get("karte_tiefe", 1.6), mat)

    def boxen(self, b):
        f = K.Facade("nb", tuple(b["a"]), tuple(b["b"]))
        u = b.get("u", [0.0, f.length])
        teil = b.get("teil", "masse")
        K.box(self.g(b)[teil], f, u[0], u[1], b["d"][0], b["d"][1], b["z"][0], b["z"][1], b.get("mat", "fassade"),
              skip_back=False)

    def gelaender(self, gl):
        G = self.g(gl)
        pts = gl["pts"]
        if any(len(p) > 2 for p in pts):
            # Punkte mit eigener Fusshoehe [x, y, z] (z. B. entlang einer Rampe): Abschnitte von hoechstens
            # 0,25 m mit konstanter Hoehe, bei 5 % Gefaelle sind die Stufen (1 cm) nicht sichtbar
            z0 = gl.get("z", 0.0)
            P = [(p[0], p[1], p[2] if len(p) > 2 else z0) for p in pts]
            for (xa, ya, za), (xb, yb, zb) in zip(P[:-1], P[1:]):
                n = max(1, int(math.ceil(math.hypot(xb - xa, yb - ya) / 0.25)))
                for k in range(n):
                    t0, t1 = k / n, (k + 1) / n
                    sub = dict(gl, pts=[[xa + (xb - xa) * t0, ya + (yb - ya) * t0], [xa + (xb - xa) * t1, ya + (yb - ya) * t1]],
                               z=za + (zb - za) * (t0 + t1) / 2)
                    self.gelaender(sub)
            return
        z, h = gl["z"], gl.get("h", 1.0)
        typ, mat = gl.get("typ", "stab"), gl.get("mat", "nb_metall")
        for (pa, pb) in zip(pts[:-1], pts[1:]):
            f = K.Facade("gl", tuple(pa), tuple(pb))
            L = f.length
            if L < 0.05:
                continue
            K.box(G["rahmen"], f, 0.0, L, -0.025, 0.025, z + h - 0.05, z + h, mat, skip_back=False)
            if typ == "glas":
                K.box(G["glas"], f, 0.0, L, -0.008, 0.008, z + 0.05, z + h - 0.05, "glas_gelaender", skip_back=False)
                K.box(G["rahmen"], f, 0.0, L, -0.02, 0.02, z, z + 0.06, mat, skip_back=False)
            elif typ == "voll":
                K.box(G["masse"], f, 0.0, L, -0.06, 0.06, z, z + h, mat, skip_back=False)
            else:
                K.box(G["rahmen"], f, 0.0, L, -0.02, 0.02, z + 0.08, z + 0.12, mat, skip_back=False)
                n = max(1, int(L / gl.get("abstand", 0.11)))
                for k in range(n + 1):
                    u = 0.02 + (L - 0.04) * k / n
                    K.box(G["rahmen"], f, u - 0.01, u + 0.01, -0.01, 0.01, z + 0.08, z + h - 0.05, mat, skip_back=False)

    def flaeche(self, fl):
        poly = [tuple(p) for p in fl["poly"]]
        z = fl["z"]
        t = fl.get("dicke", 0.05)
        teil = "gruen" if fl.get("mat", "").startswith(("nb_rasen", "nb_busch")) else "masse"
        K.extrude(self.g(fl)[teil], poly, z - t, z, fl.get("seite", fl.get("mat", "nb_kies")), fl.get("mat", "nb_kies"),
                  bottom=False)

    def schraege(self, s):
        pts = [tuple(p) for p in s["pts"]]
        n = K._newell(pts)
        mb = self.g(s)["masse"]
        # UV: entlang der ersten Kante und in Falllinie, in Metern (Stehfalz und Ziegelreihen laufen richtig)
        ax = K._sub(pts[1], pts[0])
        la = math.sqrt(K._dot(ax, ax)) or 1.0
        ax = tuple(v / la for v in ax)
        nn = math.sqrt(K._dot(n, n)) or 1.0
        nv = tuple(v / nn for v in n)
        bx = K._cross(nv, ax)
        uv = [(K._dot(K._sub(p, pts[0]), ax), K._dot(K._sub(p, pts[0]), bx)) for p in pts]
        mb.poly(pts, uv, s.get("mat", "zink"), n)

    def dachfenster(self, df):
        G = self.g(df)
        p = [tuple(q) for q in df["pts"]]
        n = K._newell(p)
        nn = math.sqrt(K._dot(n, n)) or 1.0
        o = tuple(v / nn * 0.05 for v in n)
        P = [tuple(a + b for a, b in zip(q, o)) for q in p]
        G["rahmen"].poly(P, None, df.get("rahmen", "rahmen_dunkel"), n)
        c = tuple(sum(q[i] for q in P) / 4 for i in range(3))
        Q = [tuple(c[i] + (q[i] - c[i]) * 0.86 + o[i] * 0.3 for i in range(3)) for q in P]
        G["glas"].poly(Q, None, "glas_dach", n)

    def pv(self, p):
        f = K.Facade("pv", tuple(p["a"]), tuple(p["b"]))
        u0, u1 = p.get("u", [0.0, f.length])
        d0, d1 = p["d"]
        n = p.get("reihen", 3)
        step = (d1 - d0) / n
        tilt = math.radians(p.get("neigung", 12))
        for k in range(n):
            da = d0 + k * step
            tiefe = step * 0.78
            za = p["z"] + 0.15
            zb = za + tiefe * math.sin(tilt)
            db = da + tiefe * math.cos(tilt)
            K.slope(self.g(p)["masse"], f, u0, u1, za, zb, da, db, "solar", caps=(True, True))
            K.box(self.g(p)["rahmen"], f, u0, u1, da - 0.02, da, p["z"], za, "nb_attika", skip_back=False)

    def strauch(self, s):
        import bpy
        import bmesh
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
        rng = random.Random(int(s["pos"][0] * 100 + s["pos"][1] * 7))
        r, h = s.get("r", 0.6), s.get("h", 0.9)
        mb = self.g(s)["gruen"]
        base = len(mb.verts)
        x0, y0, z0 = s["pos"][0], s["pos"][1], s.get("z", 0.0)
        for v in bm.verts:
            k = 1.0 + rng.uniform(-0.12, 0.12)
            mb.verts.append((x0 + v.co.x * r * k, y0 + v.co.y * r * k, z0 + h / 2 + v.co.z * h / 2 * k))
        for fc in bm.faces:
            mb.faces.append([base + v.index for v in fc.verts])
            mb.uvs.append([(mb.verts[base + v.index][0], mb.verts[base + v.index][1]) for v in fc.verts])
            mb.mats.append(mb.mat(s.get("mat", "nb_busch")))
        bm.free()

    # ------------------------------------------------------------ Hilfsrahmen
    def lokal(self, item):
        """Eintrag mit `rahmen: <name>`: Koordinaten (a, b) im Hilfsrahmen ins lokale System umrechnen.
        Rahmen = {ursprung: [x, y], drehung: Grad}; a laeuft entlang der Drehung, b 90 Grad links davon."""
        rn = item.get("rahmen")
        if not rn:
            return item
        R = self.N["rahmen"][rn]
        th = math.radians(R.get("drehung", 0.0))
        ox, oy = R.get("ursprung", (0.0, 0.0))
        c, s_ = math.cos(th), math.sin(th)
        T = lambda p: [ox + p[0] * c - p[1] * s_, oy + p[0] * s_ + p[1] * c, *p[2:]]
        out = dict(item)
        for k in ("poly", "pts"):
            if k in out:
                out[k] = [T(p) for p in out[k]]
        for k in ("a", "b", "pos"):
            if k in out:
                out[k] = T(out[k])
        return out

    # ------------------------------------------------------------ Ablauf
    def build(self, coll):
        import bpy
        N = {k: ([self.lokal(i) for i in v] if isinstance(v, list) else v) for k, v in self.N.items()}
        for k in N.get("koerper", []):
            self.koerper(k)
        for fs in N.get("fassaden", []):
            self.fassade(fs)
        for b in N.get("boxen", []):
            self.boxen(b)
        for gl in N.get("gelaender", []):
            self.gelaender(gl)
        for fl in N.get("flaechen", []):
            self.flaeche(fl)
        for s in N.get("schraegen", []):
            self.schraege(s)
        for df in N.get("dachfenster", []):
            self.dachfenster(df)
        for p in N.get("pv", []):
            self.pv(p)
        for s in N.get("straeucher", []):
            self.strauch(s)
        objs = []
        for name, parts in self.G.items():
            for t, mb in parts.items():
                if mb.faces:
                    objs.append(mb.to_object(bpy, self.mats, coll, smooth=(t == "gruen")))
        return objs


def build(cfg: dict, mats: dict, coll):
    """Einstieg fuer lib/build.py: baut den Abschnitt `neubau`, wenn vorhanden."""
    if not cfg.get("neubau"):
        return []
    return Neubau(cfg, mats).build(coll)
