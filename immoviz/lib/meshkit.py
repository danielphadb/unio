"""Geometrie-Baukasten fuer Fassaden und Massenmodelle.

Alle Bausteine schreiben in einen MeshBuilder (Vertices, Flaechen, UVs in Metern, Materialindex).
Am Ende wird pro Builder genau ein Blender-Objekt erzeugt; das haelt Szenen mit tausenden
Einzelteilen (Fensterrahmen, Gesimse) schnell.

Koordinaten an einer Fassade: u entlang der Fassade, d nach innen (negativ = vor die Fassade), z Hoehe.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

Vec = tuple[float, float, float]


def _sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def _dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


class MeshBuilder:
    def __init__(self, name: str, materials: list[str]):
        self.name = name
        self.materials = list(materials)
        self.verts: list[Vec] = []
        self.faces: list[list[int]] = []
        self.uvs: list[list[tuple[float, float]]] = []
        self.mats: list[int] = []

    def mat(self, name: str) -> int:
        if name not in self.materials:
            self.materials.append(name)
        return self.materials.index(name)

    def poly(self, pts: list[Vec], uv: list[tuple[float, float]] | None = None,
             mat: str | int = 0, normal: Vec | None = None):
        """Fuegt ein Polygon hinzu. Mit normal wird die Orientierung bei Bedarf umgedreht."""
        if len(pts) < 3:
            return
        if uv is None:
            uv = [(p[0], p[2]) for p in pts]
        if normal is not None:
            n = _newell(pts)
            if _dot(n, normal) < 0:
                pts = pts[::-1]
                uv = uv[::-1]
        base = len(self.verts)
        self.verts.extend(pts)
        self.faces.append(list(range(base, base + len(pts))))
        self.uvs.append(list(uv))
        self.mats.append(self.mat(mat) if isinstance(mat, str) else mat)

    def merge(self, other: "MeshBuilder"):
        remap = [self.mat(m) for m in other.materials]
        base = len(self.verts)
        self.verts.extend(other.verts)
        for f, uv, m in zip(other.faces, other.uvs, other.mats):
            self.faces.append([i + base for i in f])
            self.uvs.append(uv)
            self.mats.append(remap[m])

    def to_object(self, bpy, materials: dict, collection=None, smooth: bool = False):
        mesh = bpy.data.meshes.new(self.name)
        mesh.from_pydata(self.verts, [], self.faces)
        uvl = mesh.uv_layers.new(name="UVMap")
        li = 0
        for poly_uv in self.uvs:
            for uv in poly_uv:
                uvl.data[li].uv = uv
                li += 1
        for name in self.materials:
            mesh.materials.append(materials[name])
        mesh.polygons.foreach_set("material_index", self.mats)
        if smooth:
            mesh.polygons.foreach_set("use_smooth", [True] * len(self.faces))
        mesh.validate(clean_customdata=False)
        mesh.update()
        obj = bpy.data.objects.new(self.name, mesh)
        (collection or bpy.context.scene.collection).objects.link(obj)
        return obj


def _newell(pts):
    nx = ny = nz = 0.0
    for i, a in enumerate(pts):
        b = pts[(i + 1) % len(pts)]
        nx += (a[1] - b[1]) * (a[2] + b[2])
        ny += (a[2] - b[2]) * (a[0] + b[0])
        nz += (a[0] - b[0]) * (a[1] + b[1])
    return (nx, ny, nz)


# ------------------------------------------------------------------ Fassadenachse
@dataclass
class Facade:
    name: str
    a: tuple[float, float]
    b: tuple[float, float]

    def __post_init__(self):
        dx, dy = self.b[0] - self.a[0], self.b[1] - self.a[1]
        self.length = math.hypot(dx, dy)
        self.t = (dx / self.length, dy / self.length)
        self.n = (self.t[1], -self.t[0])  # Aussennormale (Strassenseite)

    def p(self, u: float, d: float, z: float) -> Vec:
        return (self.a[0] + self.t[0] * u - self.n[0] * d,
                self.a[1] + self.t[1] * u - self.n[1] * d, z)

    def ud(self, x: float, y: float) -> tuple[float, float]:
        rx, ry = x - self.a[0], y - self.a[1]
        return rx * self.t[0] + ry * self.t[1], -(rx * self.n[0] + ry * self.n[1])

    @property
    def out(self) -> Vec:
        return (self.n[0], self.n[1], 0.0)

    @property
    def along(self) -> Vec:
        return (self.t[0], self.t[1], 0.0)


# ------------------------------------------------------------------ Grundbausteine an einer Fassade
def box(mb: MeshBuilder, f: Facade, u0, u1, d0, d1, z0, z1, mat, skip_back: bool = True):
    """Quader in Fassadenkoordinaten. d0 < d1, d0 negativ = auskragend."""
    P = f.p
    out, al = f.out, f.along
    up = (0, 0, 1)
    # Vorderseite (Strasse)
    mb.poly([P(u0, d0, z0), P(u1, d0, z0), P(u1, d0, z1), P(u0, d0, z1)],
            [(u0, z0), (u1, z0), (u1, z1), (u0, z1)], mat, out)
    if not skip_back:
        mb.poly([P(u0, d1, z0), P(u1, d1, z0), P(u1, d1, z1), P(u0, d1, z1)],
                [(u0, z0), (u1, z0), (u1, z1), (u0, z1)], mat, (-out[0], -out[1], 0))
    # Oben und unten
    mb.poly([P(u0, d0, z1), P(u1, d0, z1), P(u1, d1, z1), P(u0, d1, z1)],
            [(u0, d0), (u1, d0), (u1, d1), (u0, d1)], mat, up)
    mb.poly([P(u0, d0, z0), P(u1, d0, z0), P(u1, d1, z0), P(u0, d1, z0)],
            [(u0, d0), (u1, d0), (u1, d1), (u0, d1)], mat, (0, 0, -1))
    # Seiten
    mb.poly([P(u0, d0, z0), P(u0, d1, z0), P(u0, d1, z1), P(u0, d0, z1)],
            [(d0, z0), (d1, z0), (d1, z1), (d0, z1)], mat, (-al[0], -al[1], 0))
    mb.poly([P(u1, d0, z0), P(u1, d1, z0), P(u1, d1, z1), P(u1, d0, z1)],
            [(d0, z0), (d1, z0), (d1, z1), (d0, z1)], mat, al)


def wall_with_holes(mb: MeshBuilder, f: Facade, u0, u1, z0, z1, d, holes, mat,
                    reveal: float = 0.32, reveal_mat=None):
    """Wandflaeche mit rechteckigen Oeffnungen (ua, ub, za, zb) und Laibungen."""
    us = sorted({u0, u1, *[h[0] for h in holes], *[h[1] for h in holes]})
    zs = sorted({z0, z1, *[h[2] for h in holes], *[h[3] for h in holes]})
    us = [u for u in us if u0 <= u <= u1]
    zs = [z for z in zs if z0 <= z <= z1]
    P = f.p
    for i in range(len(us) - 1):
        for j in range(len(zs) - 1):
            ua, ub, za, zb = us[i], us[i + 1], zs[j], zs[j + 1]
            cu, cz = (ua + ub) / 2, (za + zb) / 2
            if any(h[0] < cu < h[1] and h[2] < cz < h[3] for h in holes):
                continue
            mb.poly([P(ua, d, za), P(ub, d, za), P(ub, d, zb), P(ua, d, zb)],
                    [(ua, za), (ub, za), (ub, zb), (ua, zb)], mat, f.out)
    rm = reveal_mat or mat
    al = f.along
    for h in holes:
        ua, ub, za, zb = h[:4]
        d1 = d + (h[4] if len(h) > 4 else reveal)
        mb.poly([P(ua, d, za), P(ua, d1, za), P(ua, d1, zb), P(ua, d, zb)],
                [(d, za), (d1, za), (d1, zb), (d, zb)], rm, al)
        mb.poly([P(ub, d, za), P(ub, d1, za), P(ub, d1, zb), P(ub, d, zb)],
                [(d, za), (d1, za), (d1, zb), (d, zb)], rm, (-al[0], -al[1], 0))
        mb.poly([P(ua, d, zb), P(ub, d, zb), P(ub, d1, zb), P(ua, d1, zb)],
                [(ua, d), (ub, d), (ub, d1), (ua, d1)], rm, (0, 0, -1))
        mb.poly([P(ua, d, za), P(ub, d, za), P(ub, d1, za), P(ua, d1, za)],
                [(ua, d), (ub, d), (ub, d1), (ua, d1)], rm, (0, 0, 1))


def quad_plane(mb: MeshBuilder, f: Facade, u0, u1, z0, z1, d, mat, facing_out: bool = True):
    P = f.p
    n = f.out if facing_out else (-f.out[0], -f.out[1], 0)
    mb.poly([P(u0, d, z0), P(u1, d, z0), P(u1, d, z1), P(u0, d, z1)],
            [(u0, z0), (u1, z0), (u1, z1), (u0, z1)], mat, n)


def prism_pediment(mb: MeshBuilder, f: Facade, u0, u1, z0, h, d0, d1, mat):
    """Dreiecksgiebel (Verdachung) als Prisma."""
    P = f.p
    um = (u0 + u1) / 2
    tri_front = [P(u0, d0, z0), P(u1, d0, z0), P(um, d0, z0 + h)]
    mb.poly(tri_front, [(u0, z0), (u1, z0), (um, z0 + h)], mat, f.out)
    for (ua, ub) in ((u0, um), (um, u1)):
        za = z0 if ua == u0 else z0 + h
        zb = z0 + h if ub == um else z0
        mb.poly([P(ua, d0, za), P(ub, d0, zb), P(ub, d1, zb), P(ua, d1, za)],
                [(ua, d0), (ub, d0), (ub, d1), (ua, d1)], mat, (0, 0, 1))


# ------------------------------------------------------------------ Fenster und Tueren
def kastenfenster(frames: MeshBuilder, glass: MeshBuilder, f: Facade, ua, ub, za, zb, d,
                  frame_mat="fenster", glass_mat="glas", transom: bool = True):
    """Gruenderzeit-Kastenfenster: Blendrahmen, Mittelstulp, Oberlicht, zwei Fluegel."""
    ft, fd = 0.075, 0.07
    dd = d + 0.12
    box(frames, f, ua, ub, dd, dd + fd, za, za + ft, frame_mat)
    box(frames, f, ua, ub, dd, dd + fd, zb - ft, zb, frame_mat)
    box(frames, f, ua, ua + ft, dd, dd + fd, za, zb, frame_mat)
    box(frames, f, ub - ft, ub, dd, dd + fd, za, zb, frame_mat)
    zt = zb - 0.52 if (transom and zb - za > 1.5) else zb
    if zt < zb:
        box(frames, f, ua, ub, dd, dd + fd, zt - ft / 2, zt + ft / 2, frame_mat)
    um = (ua + ub) / 2
    box(frames, f, um - 0.04, um + 0.04, dd - 0.015, dd + fd, za, zt, frame_mat)
    if zt < zb:
        box(frames, f, um - 0.025, um + 0.025, dd, dd + fd, zt, zb, frame_mat)
    # Fluegelrahmen
    sw = 0.05
    for (sa, sb) in ((ua + ft, um - 0.04), (um + 0.04, ub - ft)):
        za2, zb2 = za + ft, zt - ft / 2
        box(frames, f, sa, sb, dd - 0.02, dd + 0.02, za2, za2 + sw, frame_mat)
        box(frames, f, sa, sb, dd - 0.02, dd + 0.02, zb2 - sw, zb2, frame_mat)
        box(frames, f, sa, sa + sw, dd - 0.02, dd + 0.02, za2, zb2, frame_mat)
        box(frames, f, sb - sw, sb, dd - 0.02, dd + 0.02, za2, zb2, frame_mat)
        # Kaempfersprosse im unteren Drittel des Fluegels wie im Bestand
        zs = za2 + (zb2 - za2) * 0.62
        box(frames, f, sa, sb, dd - 0.01, dd + 0.02, zs - 0.02, zs + 0.02, frame_mat)
    quad_plane(glass, f, ua + ft, ub - ft, za + ft, zb - ft, dd + 0.035, glass_mat)
    # Blech-Fensterbank aussen
    box(frames, f, ua - 0.03, ub + 0.03, d - 0.06, dd, za - 0.035, za, "blech")


def modern_window(frames: MeshBuilder, glass: MeshBuilder, f: Facade, ua, ub, za, zb, d,
                  frame_mat="rahmen_dunkel", glass_mat="glas", split: bool = True):
    ft, fd = 0.06, 0.07
    dd = d + 0.08
    box(frames, f, ua, ub, dd, dd + fd, za, za + ft, frame_mat)
    box(frames, f, ua, ub, dd, dd + fd, zb - ft, zb, frame_mat)
    box(frames, f, ua, ua + ft, dd, dd + fd, za, zb, frame_mat)
    box(frames, f, ub - ft, ub, dd, dd + fd, za, zb, frame_mat)
    if split and ub - ua > 1.2:
        um = (ua + ub) / 2
        box(frames, f, um - 0.03, um + 0.03, dd, dd + fd, za, zb, frame_mat)
    quad_plane(glass, f, ua + ft, ub - ft, za + ft, zb - ft, dd + 0.035, glass_mat)


def schaufenster(frames: MeshBuilder, glass: MeshBuilder, f: Facade, ua, ub, za, zb, d):
    ft = 0.05
    dd = d + 0.1
    box(frames, f, ua, ub, dd, dd + 0.08, za, za + 0.35, "rahmen_dunkel")
    box(frames, f, ua, ub, dd, dd + 0.08, zb - ft, zb, "rahmen_dunkel")
    box(frames, f, ua, ua + ft, dd, dd + 0.08, za, zb, "rahmen_dunkel")
    box(frames, f, ub - ft, ub, dd, dd + 0.08, za, zb, "rahmen_dunkel")
    box(frames, f, ua, ub, dd, dd + 0.08, zb - 0.62, zb - 0.57, "rahmen_dunkel")
    quad_plane(glass, f, ua + ft, ub - ft, za + 0.35, zb - ft, dd + 0.04, "glas")


def haustor(frames: MeshBuilder, glass: MeshBuilder, f: Facade, ua, ub, za, zb, d):
    """Zweifluegeliges Holztor mit Kassetten und verglastem Oberlicht (Eiche)."""
    dd = d + 0.22
    zt = zb - 0.7
    box(frames, f, ua, ub, dd, dd + 0.08, zt - 0.08, zt, "haustor")
    box(frames, f, ua, ua + 0.1, dd, dd + 0.1, za, zb, "haustor")
    box(frames, f, ub - 0.1, ub, dd, dd + 0.1, za, zb, "haustor")
    box(frames, f, ua, ub, dd, dd + 0.08, zb - 0.08, zb, "haustor")
    um = (ua + ub) / 2
    for (sa, sb) in ((ua + 0.1, um - 0.01), (um + 0.01, ub - 0.1)):
        quad_plane(frames, f, sa, sb, za, zt - 0.08, dd + 0.05, "haustor")
        # Kassetten
        h = (zt - 0.08 - za)
        for k, (p0, p1) in enumerate(((0.06, 0.30), (0.36, 0.62), (0.68, 0.94))):
            box(frames, f, sa + 0.09, sb - 0.09, dd + 0.0, dd + 0.05, za + h * p0, za + h * p1, "haustor")
    quad_plane(glass, f, ua + 0.1, ub - 0.1, zt, zb - 0.08, dd + 0.06, "glas")
    box(frames, f, um - 0.03, um + 0.03, dd - 0.01, dd + 0.08, zt, zb - 0.08, "haustor")


# ------------------------------------------------------------------ Umrahmungen und Gesimse
def surround(mb: MeshBuilder, f: Facade, ua, ub, za, zb, kind: str, mat="stuck"):
    w = 0.14
    if kind in ("fasche", "fasche_verdachung", "aedikula"):
        box(mb, f, ua - w, ua, -0.035, 0.0, za - 0.02, zb + w, mat)
        box(mb, f, ub, ub + w, -0.035, 0.0, za - 0.02, zb + w, mat)
        box(mb, f, ua - w, ub + w, -0.035, 0.0, zb, zb + w, mat)
        # Sohlbank
        box(mb, f, ua - w - 0.08, ub + w + 0.08, -0.10, 0.0, za - 0.14, za - 0.02, mat)
    if kind == "fasche_verdachung":
        box(mb, f, ua - w - 0.08, ub + w + 0.08, -0.12, 0.0, zb + w + 0.02, zb + w + 0.16, mat)
        box(mb, f, ua - w - 0.04, ub + w + 0.04, -0.06, 0.0, zb + w, zb + w + 0.02, mat)
    if kind == "aedikula":
        pw = 0.15
        box(mb, f, ua - w - pw, ua - w, -0.07, 0.0, za - 0.14, zb + w, mat)
        box(mb, f, ub + w, ub + w + pw, -0.07, 0.0, za - 0.14, zb + w, mat)
        e0 = zb + w
        box(mb, f, ua - w - pw - 0.05, ub + w + pw + 0.05, -0.10, 0.0, e0, e0 + 0.20, mat)
        box(mb, f, ua - w - pw - 0.10, ub + w + pw + 0.10, -0.15, 0.0, e0 + 0.20, e0 + 0.27, mat)
        prism_pediment(mb, f, ua - w - pw - 0.10, ub + w + pw + 0.10, e0 + 0.27, 0.42, -0.15, 0.0, mat)
        # Brustungsfeld unter der Sohlbank
        box(mb, f, ua - 0.05, ub + 0.05, -0.02, 0.0, za - 0.62, za - 0.18, mat)


def cornice(mb: MeshBuilder, f: Facade, u0, u1, steps, mat="stuck", corner_ext=(0.0, 0.0)):
    """Gesims aus gestaffelten Quadern: steps = [[z0, z1, auskragung], ...]."""
    for z0, z1, proj in steps:
        box(mb, f, u0 - (proj if corner_ext[0] else 0.0), u1 + (proj if corner_ext[1] else 0.0),
            -proj, 0.0, z0, z1, mat)


# ------------------------------------------------------------------ Dachflaechen
def slope(mb: MeshBuilder, f: Facade, u0, u1, z0, z1, d0, d1, mat, caps=(True, True)):
    P = f.p
    nrm = (f.n[0] * (z1 - z0), f.n[1] * (z1 - z0), d1 - d0)
    mb.poly([P(u0, d0, z0), P(u1, d0, z0), P(u1, d1, z1), P(u0, d1, z1)],
            [(u0, 0.0), (u1, 0.0), (u1, math.hypot(z1 - z0, d1 - d0)), (u0, math.hypot(z1 - z0, d1 - d0))],
            mat, nrm)
    al = f.along
    if caps[0]:
        mb.poly([P(u0, d0, z0), P(u0, d1, z0), P(u0, d1, z1)], [(d0, z0), (d1, z0), (d1, z1)], mat,
                (-al[0], -al[1], 0))
    if caps[1]:
        mb.poly([P(u1, d0, z0), P(u1, d1, z0), P(u1, d1, z1)], [(d0, z0), (d1, z0), (d1, z1)], mat, al)


def roof_window(frames: MeshBuilder, glass: MeshBuilder, f: Facade, ua, ub, za, zb, z0, z1, d0, d1):
    """Dachflaechenfenster auf einer Schraegflaeche, leicht aufgesetzt."""
    k = (d1 - d0) / (z1 - z0)
    da, db = d0 + (za - z0) * k, d0 + (zb - z0) * k
    ln = math.hypot(1.0, k)
    off = 0.06
    ox, oy, oz = f.n[0] * off / ln, f.n[1] * off / ln, off * k / ln
    P = f.p

    def q(u, d, z, e=1.0):
        p = P(u, d, z)
        return (p[0] + ox * e, p[1] + oy * e, p[2] + oz * e)

    nrm = (f.n[0], f.n[1], k)
    fr = 0.07
    frames.poly([q(ua, da, za), q(ub, da, za), q(ub, db, zb), q(ua, db, zb)], None, "rahmen_dunkel", nrm)
    glass.poly([q(ua + fr, da, za + fr, 1.3), q(ub - fr, da, za + fr, 1.3),
                q(ub - fr, db, zb - fr, 1.3), q(ua + fr, db, zb - fr, 1.3)], None, "glas_dach", nrm)


# ------------------------------------------------------------------ Polygone und Volumen
def polygon_area(poly):
    a = 0.0
    for i, (x1, y1) in enumerate(poly):
        x2, y2 = poly[(i + 1) % len(poly)]
        a += x1 * y2 - x2 * y1
    return a / 2


def clip_halfplane(poly, fn):
    """Sutherland-Hodgman: behaelt Punkte mit fn(p) >= 0."""
    out = []
    n = len(poly)
    for i in range(n):
        cur, nxt = poly[i], poly[(i + 1) % n]
        fc, fnx = fn(cur), fn(nxt)
        if fc >= 0:
            out.append(cur)
        if (fc >= 0) != (fnx >= 0):
            t = fc / (fc - fnx)
            out.append((cur[0] + (nxt[0] - cur[0]) * t, cur[1] + (nxt[1] - cur[1]) * t))
    return out


def clip_polygon(poly, rules, facades: dict):
    lines = []
    for fac, kind, op, val in rules:
        f = facades[fac]
        sign = 1 if op == ">=" else -1

        def fn(p, f=f, kind=kind, sign=sign, val=val):
            u, d = f.ud(*p)
            return sign * ((d if kind == "d" else u) - val)
        poly = clip_halfplane(poly, fn)
        lines.append(fn)
        if len(poly) < 3:
            return [], lines
    return poly, lines


def extrude(mb: MeshBuilder, poly, z0, z1, mat_side="putz_hof", mat_top="dach_flach",
            mat_cut=None, cut_lines=(), bottom=True, uv_scale=1.0, top_dz=0.0):
    """Extrudiert ein 2D-Polygon. Flaechen auf Clip-Linien bekommen mat_cut. top_dz senkt den Deckel ab (unter einem
    deckungsgleichen Flachdach aus dem Dachmodell, sonst Z-Fighting)."""
    if len(poly) < 3:
        return
    if polygon_area(poly) < 0:
        poly = poly[::-1]
    n = len(poly)
    run = 0.0
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
        L = math.hypot(x2 - x1, y2 - y1)
        if L < 1e-4:
            continue
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        on_cut = any(abs(fn((mx, my))) < 1e-3 for fn in cut_lines)
        m = mat_cut if (on_cut and mat_cut) else mat_side
        nrm = (y2 - y1, -(x2 - x1), 0)
        mb.poly([(x1, y1, z0), (x2, y2, z0), (x2, y2, z1), (x1, y1, z1)],
                [(run, z0), (run + L, z0), (run + L, z1), (run, z1)], m, nrm)
        run += L
    mb.poly([(x, y, z1 + top_dz) for x, y in poly], [(x, y) for x, y in poly], mat_top, (0, 0, 1))
    if bottom:
        mb.poly([(x, y, z0) for x, y in poly], [(x, y) for x, y in poly], mat_top, (0, 0, -1))


def point_in_poly(x, y, poly):
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi:
            inside = not inside
        j = i
    return inside
