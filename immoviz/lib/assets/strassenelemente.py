"""Straßenelemente: Gehsteigüberfahrt, Fahrbahnschwelle, Gehsteigabsenkung, Bodenmarkierungen, Schachtdeckel,
Straßenschild am Haus, Fahrradständer, Motorradabstellplatz (Markierung).

Quellen: `strassenelemente` in project.yaml (von Hand, z. B. aus der virtuellen Begehung) und automatisch aus den
Daten der Stadt Wien (`lib/strasse.ogd_elemente`: Flächenmehrzweckkarte, Gehsteigabsenkungen, Fahrradabstellanlagen,
Radfahren gegen die Einbahn, Hydranten). Abschalten je Art: `strassenelemente_auto: {<art>: false}`, ganz:
`strassenelemente_auto: {aus: true}`. Jeder Eintrag hat `typ` und `quelle`.

Einträge (lokales System, Meter):
  gehsteigueberfahrt  durchgezogener Gehsteig über eine Einmündung mit flachen Rampen auf beiden Seiten.
                      OGD: `rampen: [poly, poly]` (zwei Fahrbahnschwellen der FMZK), von Hand: `a`, `b` (Linie quer
                      über die Einmündung, Mitte des Plateaus), `tiefe` (Plateau entlang der Gasse), `rampe` (Länge je
                      Rampe), `breite` (über die Einmündung). `hoehe` (Standard 0,115, knapp unter Bordsteinoberkante).
                      Material laut Begehung: Plateau Asphalt (`material`), Rampe zur Kreuzung helle Betonplatten
                      (`material_rampe_aussen`), Rampe zur Gasse Asphalt (`material_rampe_innen`), optional `kante`.
  fahrbahnschwelle    Temposchwelle über die Fahrbahn: `poly` (FMZK) oder `a`, `b`, `tiefe`; `hoehe` 0,07
  gehsteigabsenkung   abgesenkter Bordstein (Rest 3 cm): `pos` (am Bordstein), `richtung` (zur Fahrbahn), `laenge`
  leitlinie           strichlierte Linie: `pts` (Polylinie), `strich`, `luecke`, `breite`
  linie               durchgezogene Linie (Haltelinie, Randlinie): `pts`, `breite`
  radpiktogramm       Fahrradsymbol (Seitenansicht, oben = Fahrtrichtung): `pos`, `richtung`, optional `pfeil`
  sperrflaeche        Umrandung und Schrägstreifen: `poly`, `abstand` (Standard 1,0), `winkel` (45)
  parkmarkierung      Trennlinien zwischen Stellplätzen eines Streifens laut street.parking (`markierung: true`)
  beet                offenes Beet (Erde) mit Granitkante: `poly` (konvex), `hoehe` (0,12)
  schachtdeckel       `pos`, `art`: rund (Kanal, 0,62 m) | einlauf (Straßeneinlauf am Bordstein, `drehung`) | klein
  strassenschild      Wiener Straßentafel am Haus, blau mit weißem Rand, ohne lesbare Schrift: `pos` (auf der
                      Fassadenflucht), `drehung` (Blickrichtung der Tafel in Grad), `z` (Unterkante über Gelände)
  fahrradstaender     Wiener Bügel quer zum Bordstein: `pos` (Mitte), `anzahl`, `entlang` (Richtung der Reihe), `abstand`
  motorradplatz       Markierung (Umriss) eines Motorradabstellplatzes: `pts` (Polygon) oder `pos`, `entlang`, `laenge`
  hydrant_ogd         Unterflurhydrant (Deckel) an der OGD-Lage
"""
from __future__ import annotations

import math

import bpy

from .. import meshkit as K
from . import form as F

UEBERFAHRT_HOEHE = 0.115     # Bordstein im Modell 0,12 m: Plateau 5 mm tiefer, kein Z-Fighting mit dem Gehsteig
MARK_DZ = 0.006


def _mats(mats):
    from .. import materials as M
    if "rampe" in mats:
        return
    mats["rampe"] = M.asphalt(bpy, "rampe", (0.075, 0.074, 0.072), flick=False)
    mats["markierung_neu"] = M.simple(bpy, "markierung_neu", (0.70, 0.70, 0.68), 0.55)
    mats["gusseisen"] = M.simple(bpy, "gusseisen", (0.035, 0.033, 0.031), 0.55, 0.6)
    mats["tafel_blau"] = M.simple(bpy, "tafel_blau", (0.012, 0.045, 0.22), 0.3)
    mats["tafel_weiss"] = M.simple(bpy, "tafel_weiss", (0.80, 0.80, 0.78), 0.3)
    mats["tafel_rot"] = M.simple(bpy, "tafel_rot", (0.40, 0.012, 0.015), 0.35)
    if "erde" not in mats:
        mats["erde"] = M.plaster(bpy, "erde", (0.035, 0.025, 0.018), var=0.3, bump=0.6, detail=False)
    for k in ("markierung", "randstein", "gehsteig", "edelstahl", "pflaster"):
        if k not in mats:
            mats[k] = M.simple(bpy, k, (0.5, 0.5, 0.5), 0.5)


class Boden:
    """Höhe der fertigen Bodenfläche über Strahl von oben auf die Dreiecke der Bodenfläche (gleiche Zerlegung wie im
    Rendering). Trifft der Strahl einen Gehsteig (Material gehsteig, randstein, ...), liefert z(nur_fahrbahn=True) die
    Fahrbahnhöhe darunter (Oberkante minus Bordstein 0,12 m). Ohne Bodenfläche: Gelände."""
    GEHSTEIG = ("gehsteig", "gehsteig_platten", "randstein", "hof")

    def __init__(self, boden_obj, terrain):
        self.terrain = terrain
        self.bvh = None
        if boden_obj is not None:
            from mathutils.bvhtree import BVHTree
            me = boden_obj.data
            me.calc_loop_triangles()
            verts = [v.co.copy() for v in me.vertices]
            tris = [tuple(t.vertices) for t in me.loop_triangles]
            namen = [m.name if m else "" for m in me.materials]
            self.geh = [namen[me.polygons[t.polygon_index].material_index].split(".")[0] in self.GEHSTEIG
                        for t in me.loop_triangles]
            self.bvh = BVHTree.FromPolygons(verts, tris)

    def z(self, x, y, nur_fahrbahn=True):
        from mathutils import Vector
        zt = self.terrain(x, y)
        if self.bvh is None:
            return zt
        loc, _n, idx, _d = self.bvh.ray_cast(Vector((x, y, zt + 5.0)), Vector((0, 0, -1)), 12.0)
        if loc is None:
            return zt
        if nur_fahrbahn and idx is not None and self.geh[idx]:
            return loc.z - 0.12
        return loc.z


def _streifen(poly):
    from .. import strasse as ST
    return ST._streifen_achse(poly)


def _in(poly, x, y):
    return K.point_in_poly(x, y, poly)


def _hoehenfeld(mb, x0, u, v, us, vs, z_fn, mat_fn, drin):
    """Gitterfläche im Rahmen (u, v) mit Höhe z_fn(x, y, uu, vv); nur Zellen, deren Mitte `drin` ist."""
    pts = {}

    def P(i, j):
        if (i, j) not in pts:
            uu, vv = us[i], vs[j]
            x, y = x0[0] + u[0] * uu + v[0] * vv, x0[1] + u[1] * uu + v[1] * vv
            pts[(i, j)] = (x, y, z_fn(x, y, uu, vv))
        return pts[(i, j)]
    n = 0
    for i in range(len(us) - 1):
        for j in range(len(vs) - 1):
            uc, vc = (us[i] + us[i + 1]) / 2, (vs[j] + vs[j + 1]) / 2
            xc, yc = x0[0] + u[0] * uc + v[0] * vc, x0[1] + u[1] * uc + v[1] * vc
            if not drin(xc, yc, uc, vc):
                continue
            q = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)]
            mb.poly(q, [(p[0], p[1]) for p in q], mat_fn(uc, vc), (0, 0, 1))
            n += 1
    return n


def ueberfahrt(mb, e, ctx, boden):
    """Gehsteigüberfahrt: Plateau auf Gehsteighöhe zwischen zwei flachen Rampen."""
    from .. import strasse as ST
    h = float(e.get("hoehe", UEBERFAHRT_HOEHE))
    if e.get("rampen"):
        A, B = _streifen(e["rampen"][0]), _streifen(e["rampen"][1])
        u, v = A["u"], A["v"]
        x0 = ((A["mitte"][0] + B["mitte"][0]) / 2, (A["mitte"][1] + B["mitte"][1]) / 2)
        V = lambda p: (p[0] - x0[0]) * v[0] + (p[1] - x0[1]) * v[1]
        U = lambda p: (p[0] - x0[0]) * u[0] + (p[1] - x0[1]) * u[1]
        ra = sorted(V(p) for p in e["rampen"][0])
        rb = sorted(V(p) for p in e["rampen"][1])
        if ra[0] > rb[0]:
            ra, rb = rb, ra
        va0, va1, vb0, vb1 = ra[0], ra[-1], rb[0], rb[-1]              # Rampe A unten, Plateau va1..vb0, Rampe B
        alle_u = [U(p) for r in e["rampen"] for p in r]
        u_min, u_max = min(alle_u) - 0.6, max(alle_u) + 0.6
        rampen = [p for p in e["rampen"]]
    else:
        a, b = e["a"], e["b"]
        L = math.dist(a, b)
        u = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
        v = (-u[1], u[0])
        x0 = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        t2, r = float(e.get("tiefe", 4.0)) / 2, float(e.get("rampe", 1.2))
        va0, va1, vb0, vb1 = -t2 - r, -t2, t2, t2 + r
        u_min, u_max = -L / 2 - 0.3, L / 2 + 0.3
        rampen = None
    fahr = ST._index(ctx, ("Fahrbahn", "Fahrbahnschwelle", "Zebrastreifen"))
    geh = ST._index(ctx, ("Gehsteig", "Gehweg, Radweg", "Sonstige Verkehrsfläche"))

    def profil(vv):
        if vv <= va0 or vv >= vb1:
            return 0.0
        if vv < va1:
            return h * (vv - va0) / (va1 - va0)
        if vv > vb0:
            return h * (vb1 - vv) / (vb1 - vb0)
        return h

    def drin(x, y, uu, vv):
        if not (va0 <= vv <= vb1 and u_min <= uu <= u_max):
            return False
        if rampen and (vv < va1 or vv > vb0):
            return any(_in(p, x, y) for p in rampen)
        if ST._in_layer(fahr, x, y):
            return True
        # Rand: 0,4 m in den Gehsteig hinein (liegt 5 mm unter dessen Oberkante), keine Spalte an den Bögen
        return ST._in_layer(geh, x, y) and any(ST._in_layer(fahr, x + dx, y + dy) for dx, dy in
                                                ((0.4, 0), (-0.4, 0), (0, 0.4), (0, -0.4)))

    # Material laut Begehung Wimmergasse Nord (WI10, WI11, Kundenbild): Plateau Asphalt wie die Fahrbahn, Rampe zur
    # Kreuzung (die breitere, sie fasst die Bordsteinbögen ein) helle Betonplatten, Rampe zur Gasse Asphalt
    breit_a = True
    if rampen:
        ua = [U(p) for p in rampen[0]]
        ub = [U(p) for p in rampen[1]]
        breit_a = (max(ua) - min(ua)) >= (max(ub) - min(ub))
        if V(rampen[0][0]) > V(rampen[1][0]):        # rampen[0] liegt oben (vb), nicht unten (va)
            breit_a = not breit_a
    kante = float(e.get("kante", 0.0))         # optional Granitkante am Übergang Rampe/Plateau
    platten = "gehsteig_platten" if "gehsteig_platten" in bpy.data.materials else "gehsteig"

    def mat(uu, vv):
        if va1 - 1e-6 <= vv <= vb0 + 1e-6:
            if kante and (vv < va1 + kante or vv > vb0 - kante):
                return "randstein"
            return e.get("material", "asphalt")
        aussen = (vv < va1) == breit_a
        return e.get("material_rampe_aussen", platten) if aussen else e.get("material_rampe_innen", "asphalt")
    step = float(e.get("raster", 0.2))
    us = [u_min + k * step for k in range(int((u_max - u_min) / step) + 2)]
    vs = sorted(set([va0, va1, vb0, vb1, va1 + kante, vb0 - kante] +
                    [va0 + k * step for k in range(int((vb1 - va0) / step) + 1)]))
    vs = [q for q in vs if va0 - 1e-6 <= q <= vb1 + 1e-6]
    return _hoehenfeld(mb, x0, u, v, us, vs, lambda x, y, uu, vv: boden.z(x, y) + profil(vv) + 0.002, mat, drin)


def schwelle(mb, e, boden):
    """Temposchwelle: Kosinusprofil quer über den Streifen, Höhe 7 cm."""
    h = float(e.get("hoehe", 0.07))
    if e.get("poly"):
        S = _streifen(e["poly"])
        u, v, x0 = S["u"], S["v"], S["mitte"]
        u0, u1, v0, v1 = S["u0"], S["u1"], S["v0"], S["v1"]
        poly = e["poly"]
        drin = lambda x, y, uu, vv: _in(poly, x, y)
    else:
        a, b = e["a"], e["b"]
        L = math.dist(a, b)
        u = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
        v = (-u[1], u[0])
        x0 = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        u0, u1, v0, v1 = -L / 2, L / 2, -float(e.get("tiefe", 1.5)) / 2, float(e.get("tiefe", 1.5)) / 2
        drin = lambda x, y, uu, vv: True
    prof = lambda vv: h * 0.5 * (1 - math.cos(2 * math.pi * min(1.0, max(0.0, (vv - v0) / (v1 - v0)))))
    us = [u0 + k * 0.25 for k in range(int((u1 - u0) / 0.25) + 2)]
    vs = [v0 + (v1 - v0) * k / 8 for k in range(9)]
    return _hoehenfeld(mb, x0, u, v, us, vs, lambda x, y, uu, vv: boden.z(x, y) + prof(vv) + 0.002,
                       lambda uu, vv: "rampe", drin)


def absenkung(mb, e, boden):
    """Abgesenkter Bordstein: Keil vor der Kante (Rest 3 cm), seitlich auslaufend, Granit."""
    (x, y), n = e["pos"], e["richtung"]
    t = (-n[1], n[0])
    L2, ueber, tief = float(e.get("laenge", 2.0)) / 2, 0.6, float(e.get("keil", 0.35))
    h = 0.12 - float(e.get("tiefe_cm", 3)) / 100.0

    def P(a, b, zz):
        px, py = x + t[0] * a + n[0] * b, y + t[1] * a + n[1] * b
        return (px, py, boden.z(px, py) + zz)
    for a0, a1, h0, h1 in ((-L2 - ueber, -L2, 0.0, h), (-L2, L2, h, h), (L2, L2 + ueber, h, 0.0)):
        q = [P(a0, 0.0, h0), P(a1, 0.0, h1), P(a1, tief, 0.002), P(a0, tief, 0.002)]
        mb.poly(q, [(p[0], p[1]) for p in q], "randstein", (0, 0, 1))
        mb.poly([P(a0, -0.02, h0), P(a1, -0.02, h1), P(a1, 0.0, h1), P(a0, 0.0, h0)], None, "randstein", (n[0], n[1], 0))


def _band(mb, a, b, breite, boden, mat="markierung_neu", dz=MARK_DZ):
    L = math.dist(a, b)
    if L < 1e-3:
        return
    t = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
    n = (-t[1] * breite / 2, t[0] * breite / 2)
    k = max(1, int(L / 1.0))
    for i in range(k):
        p0 = (a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k)
        p1 = (a[0] + (b[0] - a[0]) * (i + 1) / k, a[1] + (b[1] - a[1]) * (i + 1) / k)
        q = [(p0[0] - n[0], p0[1] - n[1]), (p1[0] - n[0], p1[1] - n[1]), (p1[0] + n[0], p1[1] + n[1]), (p0[0] + n[0], p0[1] + n[1])]
        mb.poly([(qx, qy, boden.z(qx, qy, False) + dz) for qx, qy in q], q, mat, (0, 0, 1))


def leitlinie(mb, e, boden, strichliert=True):
    pts = e["pts"]
    st, lu, br = float(e.get("strich", 1.5)), float(e.get("luecke", 3.0)), float(e.get("breite", 0.12))
    pos, an, start = 0.0, True, None
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        L = math.dist(a, b)
        s = 0.0
        while s < L - 1e-6:
            rest = (st if an else lu) - pos
            ds = min(rest, L - s) if strichliert else L - s
            p0 = (a[0] + (b[0] - a[0]) * s / L, a[1] + (b[1] - a[1]) * s / L)
            p1 = (a[0] + (b[0] - a[0]) * (s + ds) / L, a[1] + (b[1] - a[1]) * (s + ds) / L)
            if an or not strichliert:
                _band(mb, p0, p1, br, boden)
            s += ds
            pos += ds
            if strichliert and pos >= (st if an else lu) - 1e-6:
                an, pos = not an, 0.0


def _ring(mb, c, r0, r1, rot, boden, seg=28):
    for k in range(seg):
        w0, w1 = 2 * math.pi * k / seg, 2 * math.pi * (k + 1) / seg
        q = [rot(c[0] + r0 * math.cos(w0), c[1] + r0 * math.sin(w0)), rot(c[0] + r1 * math.cos(w0), c[1] + r1 * math.sin(w0)),
             rot(c[0] + r1 * math.cos(w1), c[1] + r1 * math.sin(w1)), rot(c[0] + r0 * math.cos(w1), c[1] + r0 * math.sin(w1))]
        mb.poly([(x, y, boden.z(x, y, False) + MARK_DZ) for x, y in q], q, "markierung_neu", (0, 0, 1))


def radpiktogramm(mb, e, boden):
    """Fahrrad in Seitenansicht, flach auf der Fahrbahn; Oberkante der Zeichnung zeigt in Fahrtrichtung."""
    (x, y), d = e["pos"], e.get("richtung", [1.0, 0.0])
    s = float(e.get("groesse", 1.0))
    quer = (d[1], -d[0])                          # Zeichnung: a nach rechts (Vorderrad), b in Fahrtrichtung
    rot = lambda a, b: (x + (quer[0] * a + d[0] * b) * s, y + (quer[1] * a + d[1] * b) * s)
    _ring(mb, (-0.52, 0.0), 0.25, 0.32, rot, boden)
    _ring(mb, (0.52, 0.0), 0.25, 0.32, rot, boden)
    R_, C_, S_, H_, V_ = (-0.52, 0.0), (-0.02, 0.0), (-0.18, 0.46), (0.36, 0.46), (0.52, 0.0)
    for a, b in ((R_, C_), (C_, S_), (S_, H_), (H_, C_), (R_, S_), (H_, V_), ((-0.32, 0.52), (-0.06, 0.52)),
                 ((0.30, 0.62), (0.46, 0.62)), ((0.36, 0.46), (0.38, 0.62))):
        pa, pb = rot(*a), rot(*b)
        _band(mb, pa, pb, 0.06 * s, boden)
    if e.get("pfeil"):
        for a, b in (((0.0, 0.85), (0.0, 1.55)),):
            _band(mb, rot(*a), rot(*b), 0.14 * s, boden)
        spitze = [rot(-0.22, 1.5), rot(0.22, 1.5), rot(0.0, 1.95)]
        mb.poly([(qx, qy, boden.z(qx, qy, False) + MARK_DZ) for qx, qy in spitze], None, "markierung_neu", (0, 0, 1))


def flaeche(mb, e, boden):
    """Gefüllte Markierungsfläche (z. B. Dreieck in der Fahrbahn): `poly`, Raster 0,5 m für die Höhe."""
    poly = e["poly"]
    xs, ys = [p[0] for p in poly], [p[1] for p in poly]
    st = 0.25
    x0, y0 = min(xs), min(ys)
    for i in range(int((max(xs) - x0) / st) + 1):
        for j in range(int((max(ys) - y0) / st) + 1):
            q = [(x0 + i * st, y0 + j * st), (x0 + (i + 1) * st, y0 + j * st), (x0 + (i + 1) * st, y0 + (j + 1) * st),
                 (x0 + i * st, y0 + (j + 1) * st)]
            clip = q
            for k in range(len(poly)):          # Zelle mit dem (konvexen) Polygon schneiden
                a, b = poly[k], poly[(k + 1) % len(poly)]
                sg = 1.0 if K.polygon_area(poly) > 0 else -1.0
                clip = K.clip_halfplane(clip, lambda p, a=a, b=b, sg=sg: sg * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])))
                if len(clip) < 3:
                    break
            if len(clip) >= 3:
                mb.poly([(qx, qy, boden.z(qx, qy, False) + MARK_DZ) for qx, qy in clip], clip, "markierung_neu", (0, 0, 1))


def beet(mb, e, boden):
    """Offenes Beet (Erde) mit Granitkante rundum: `poly` (konvex), `hoehe` Oberkante Kante ueber Gelaende (0,12)."""
    poly = e["poly"] if K.polygon_area(e["poly"]) > 0 else e["poly"][::-1]
    h, st, br = float(e.get("hoehe", 0.12)), 0.5, float(e.get("kante", 0.12))
    xs, ys = [p[0] for p in poly], [p[1] for p in poly]
    T = boden.terrain
    for i in range(int((max(xs) - min(xs)) / st) + 1):
        for j in range(int((max(ys) - min(ys)) / st) + 1):
            x0, y0 = min(xs) + i * st, min(ys) + j * st
            clip = [(x0, y0), (x0 + st, y0), (x0 + st, y0 + st), (x0, y0 + st)]
            for k in range(len(poly)):
                a, b = poly[k], poly[(k + 1) % len(poly)]
                clip = K.clip_halfplane(clip, lambda p, a=a, b=b: (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]))
                if len(clip) < 3:
                    break
            if len(clip) >= 3:
                mb.poly([(qx, qy, T(qx, qy) + h - 0.03) for qx, qy in clip], clip, "erde", (0, 0, 1))
    for k in range(len(poly)):
        a, b = poly[k], poly[(k + 1) % len(poly)]
        L = math.dist(a, b)
        t = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
        n = (-t[1], t[0])                       # nach innen
        m = max(1, int(L / st))
        for q in range(m):
            p0 = (a[0] + t[0] * L * q / m, a[1] + t[1] * L * q / m)
            p1 = (a[0] + t[0] * L * (q + 1) / m, a[1] + t[1] * L * (q + 1) / m)
            i0, i1 = (p0[0] + n[0] * br, p0[1] + n[1] * br), (p1[0] + n[0] * br, p1[1] + n[1] * br)
            Z = lambda p, d: (p[0], p[1], T(*p) + d)
            uv = [(q, 0.0), (q + 1.0, 0.0), (q + 1.0, br), (q, br)]
            mb.poly([Z(p0, h + 0.002), Z(p1, h + 0.002), Z(i1, h + 0.002), Z(i0, h + 0.002)], uv, "randstein", (0, 0, 1))
            mb.poly([Z(p0, -0.02), Z(p1, -0.02), Z(p1, h + 0.002), Z(p0, h + 0.002)], uv, "randstein", (-n[0], -n[1], 0))
            mb.poly([Z(i0, h - 0.06), Z(i1, h - 0.06), Z(i1, h + 0.002), Z(i0, h + 0.002)], uv, "randstein", (n[0], n[1], 0))


def sperrflaeche(mb, e, boden):
    poly = e["poly"]
    br = float(e.get("breite", 0.15))
    for i in range(len(poly)):
        _band(mb, poly[i], poly[(i + 1) % len(poly)], br, boden)
    w = math.radians(float(e.get("winkel", 45)))
    t = (math.cos(w), math.sin(w))
    n = (-t[1], t[0])
    ds = [p[0] * n[0] + p[1] * n[1] for p in poly]
    ab = float(e.get("abstand", 1.0))
    k = math.floor(min(ds) / ab) + 1
    while k * ab < max(ds):
        c = k * ab
        # Schnitt der Geraden n.p = c mit dem Polygon
        sp = []
        for i in range(len(poly)):
            a, b = poly[i], poly[(i + 1) % len(poly)]
            da, db = a[0] * n[0] + a[1] * n[1] - c, b[0] * n[0] + b[1] * n[1] - c
            if (da > 0) != (db > 0):
                f = da / (da - db)
                sp.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
        sp.sort(key=lambda p: p[0] * t[0] + p[1] * t[1])
        for j in range(0, len(sp) - 1, 2):
            _band(mb, sp[j], sp[j + 1], br * 2.5, boden)
        k += 1


def schachtdeckel(mb, e, boden):
    x, y = e["pos"]
    art = e.get("art", "rund")
    z = boden.z(x, y, False) + 0.004
    if art == "einlauf":
        w = math.radians(float(e.get("drehung", 0)))
        c, s = math.cos(w), math.sin(w)
        q = [(x + c * a - s * b, y + s * a + c * b) for a, b in ((-0.25, -0.15), (0.25, -0.15), (0.25, 0.15), (-0.25, 0.15))]
        mb.poly([(qx, qy, z) for qx, qy in q], q, "gusseisen", (0, 0, 1))
        for k in range(5):                       # Schlitze als helle Stege
            a0 = -0.2 + k * 0.1
            st = [(x + c * a - s * b, y + s * a + c * b) for a, b in ((a0, -0.12), (a0 + 0.03, -0.12), (a0 + 0.03, 0.12), (a0, 0.12))]
            mb.poly([(qx, qy, z + 0.001) for qx, qy in st], st, "randstein", (0, 0, 1))
        return
    r = 0.31 if art == "rund" else 0.2
    seg = 24
    ring = [(x + r * math.cos(2 * math.pi * k / seg), y + r * math.sin(2 * math.pi * k / seg)) for k in range(seg)]
    mb.poly([(qx, qy, z) for qx, qy in ring], [(qx - x, qy - y) for qx, qy in ring], "gusseisen", (0, 0, 1))
    r2 = r + 0.05
    for k in range(seg):
        a0, a1 = 2 * math.pi * k / seg, 2 * math.pi * (k + 1) / seg
        q = [(x + r * math.cos(a0), y + r * math.sin(a0)), (x + r2 * math.cos(a0), y + r2 * math.sin(a0)),
             (x + r2 * math.cos(a1), y + r2 * math.sin(a1)), (x + r * math.cos(a1), y + r * math.sin(a1))]
        mb.poly([(qx, qy, z - 0.001) for qx, qy in q], None, "randstein", (0, 0, 1))


def strassenschild(mb, e, terrain):
    """Wiener Straßentafel (blau, weißer Rand, rote Bezirkszahl links) ohne lesbare Schrift, 0,62 x 0,24 m."""
    x, y = e["pos"]
    w = math.radians(float(e.get("drehung", 0)))
    n = (math.cos(w), math.sin(w))
    t = (-n[1], n[0])
    z0 = terrain(x, y) + float(e.get("z", 3.0))
    B, H = float(e.get("breite", 0.62)), float(e.get("hoehe", 0.24))
    d = 0.015

    def q(a0, a1, b0, b1, off, mat):
        p = [(x + t[0] * a + n[0] * off, y + t[1] * a + n[1] * off, z0 + b) for a, b in ((a0, b0), (a1, b0), (a1, b1), (a0, b1))]
        mb.poly(p, None, mat, (n[0], n[1], 0))
    q(-B / 2, B / 2, 0, H, d, "tafel_weiss")
    q(-B / 2 + 0.015, B / 2 - 0.015, 0.015, H - 0.015, d + 0.001, "tafel_blau")
    q(-B / 2 + 0.03, -B / 2 + 0.10, 0.05, H - 0.05, d + 0.002, "tafel_rot")          # Bezirkszahl als Fläche
    q(-B / 2 + 0.13, B / 2 - 0.06, H / 2 - 0.025, H / 2 + 0.025, d + 0.002, "tafel_weiss")   # Schriftzeile als Balken
    for a0, a1, b0, b1 in ((-B / 2, B / 2, 0, 0), (-B / 2, B / 2, H, H)):
        pass
    # Rand (Dicke)
    for (a0, b0), (a1, b1) in (((-B / 2, 0), (B / 2, 0)), ((B / 2, 0), (B / 2, H)), ((B / 2, H), (-B / 2, H)), ((-B / 2, H), (-B / 2, 0))):
        p = [(x + t[0] * a0, y + t[1] * a0, z0 + b0), (x + t[0] * a1, y + t[1] * a1, z0 + b1),
             (x + t[0] * a1 + n[0] * d, y + t[1] * a1 + n[1] * d, z0 + b1), (x + t[0] * a0 + n[0] * d, y + t[1] * a0 + n[1] * d, z0 + b0)]
        mb.poly(p, None, "tafel_weiss")


def fahrradstaender(mb, e, terrain):
    from . import moebel as MO
    x, y = e["pos"]
    t = e.get("entlang", [1.0, 0.0])
    n_ = int(e.get("anzahl", 1))
    ab = float(e.get("abstand", 1.0))
    dreh = math.degrees(math.atan2(-t[0], t[1])) if "drehung" not in e else float(e["drehung"])   # Bügel quer zur Reihe
    for k in range(n_):
        s = (k - (n_ - 1) / 2) * ab
        px, py = x + t[0] * s, y + t[1] * s
        MO._buegel(mb, px, py, terrain(px, py) + float(e.get("z", 0.12)), dreh)


def motorradplatz(mb, e, boden):
    if e.get("pts") and len(e["pts"]) >= 3:
        poly = e["pts"]
    else:
        x, y = e["pos"] if "pos" in e else e["pts"][0]
        t = e.get("entlang", [1.0, 0.0])
        n = (-t[1], t[0])
        L, B = float(e.get("laenge", 5.0)), float(e.get("tiefe", 2.0))
        poly = [(x + t[0] * a + n[0] * b, y + t[1] * a + n[1] * b) for a, b in ((-L / 2, 0), (L / 2, 0), (L / 2, B), (-L / 2, B))]
    for i in range(len(poly)):
        _band(mb, poly[i], poly[(i + 1) % len(poly)], 0.12, boden)


def hydrant_deckel(mb, e, boden):
    x, y = e["pos"]
    z = boden.z(x, y, False) + 0.004
    q = [(x - 0.2, y - 0.14), (x + 0.2, y - 0.14), (x + 0.2, y + 0.14), (x - 0.2, y + 0.14)]
    mb.poly([(qx, qy, z) for qx, qy in q], None, "gusseisen", (0, 0, 1))


def parkmarkierung(mb, cfg, ctx, boden, radius=160.0):
    """Trennlinien der Stellplätze laut street.parking für Regeln mit `markierung: true`."""
    from .. import strasse as ST
    regeln = {r.get("name"): r for r in ((cfg or {}).get("street") or {}).get("parking") or []}
    n = 0
    for s in ST.stellplaetze(ctx, cfg, radius):
        for ab in s["abschnitte"]:
            r = regeln.get(ab["regel"])
            if not r or not r.get("markierung") or ab["art"] == "laengs" or not ab["plaetze"]:
                continue
            for p in ab["plaetze"]:
                ek = ST.ecken(p, p["laenge"], p["breite"] + 0.2)
                for a, b in ((ek[0], ek[1]), (ek[3], ek[2])):          # Längsseiten = Trennlinien
                    _band(mb, a, b, 0.10, boden)
                    n += 1
    return n


def randlinien(mb, cfg, ctx, boden):
    """Durchgezogene Linie entlang der Fahrbahnkante eines Parkstreifens (Regel mit `randlinie: true`), 10 cm innen."""
    from .. import strasse as ST
    regeln = [r for r in ((cfg or {}).get("street") or {}).get("parking") or [] if r.get("randlinie")]
    if not regeln:
        return 0
    facades = {k: K.Facade(k, tuple(v["a"]), tuple(v["b"])) for k, v in ((cfg or {}).get("facades") or {}).items()}
    fahr = ST._index(ctx, ("Fahrbahn",))
    n = 0
    for s in ctx["surfaces"]:
        poly = s["poly"]
        if s["layer"] != ST.PARK_LAYER or len(poly) < 3 or math.hypot(*poly[0]) > 200:
            continue
        sg = 1.0 if K.polygon_area(poly) > 0 else -1.0
        for i in range(len(poly)):
            a, b = poly[i], poly[(i + 1) % len(poly)]
            L = math.dist(a, b)
            if L < 1.0:
                continue
            t = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
            nx, ny = t[1] * sg, -t[0] * sg                          # nach außen
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            if not ST._in_layer(fahr, mx + nx * 0.3, my + ny * 0.3):
                continue
            if not any(ST._passt(r, mx, my, t, facades) for r in regeln):
                continue
            _band(mb, (a[0] - nx * 0.1, a[1] - ny * 0.1), (b[0] - nx * 0.1, b[1] - ny * 0.1), 0.12, boden)
            n += 1
    return n


def build(cfg, ctx, mats, coll, terrain, boden_obj=None, log=None):
    """Baut alle Straßenelemente (von Hand plus OGD). Liefert die Anzahl je Typ."""
    from pathlib import Path
    from .. import strasse as ST
    eintraege = list((cfg or {}).get("strassenelemente") or [])
    auto = (cfg or {}).get("strassenelemente_auto") or {}
    if not auto.get("aus") and ctx and (cfg or {}).get("_project_dir"):
        p = Path(cfg["_project_dir"]) / ST.OGD_DATEI
        if p.exists():
            import json
            ogd = json.loads(p.read_text())
            eintraege += ST.ogd_elemente(ctx, cfg, ogd)
    # von Hand ersetzt automatisch: `ersetzt_ogd: true` bei einem Eintrag gleicher Art in der Nähe (5 m)
    hand = [e for e in (cfg or {}).get("strassenelemente") or [] if e.get("ersetzt_ogd")]

    def ersetzt(e):
        if e in hand or "pos" not in e:
            return False
        return any(h.get("typ") == e.get("typ") and "pos" in h and math.dist(h["pos"], e["pos"]) < 5.0 for h in hand)
    eintraege = [e for e in eintraege if not ersetzt(e)]
    if not eintraege and not any(r.get("markierung") for r in ((cfg or {}).get("street") or {}).get("parking") or []):
        return {}
    _mats(mats)
    boden = Boden(boden_obj, terrain)
    sub = bpy.data.collections.new("Strassenelemente")
    coll.children.link(sub)
    flaechen = K.MeshBuilder("strassenelemente_boden", ["gehsteig"])      # Überfahrten, Schwellen, Absenkungen
    mark = K.MeshBuilder("strassenelemente_markierung", ["markierung_neu"])
    teile = K.MeshBuilder("strassenmoebel_elemente", ["edelstahl"])        # Name: Ebene strassenmoebel
    zahl = {}
    moebel_extra = []                          # aus OGD abgeleitete Möbel (Zeichen) baut lib/assets/moebel.py
    for e in eintraege:
        typ = e.get("typ")
        try:
            if typ == "gehsteigueberfahrt":
                ueberfahrt(flaechen, e, ctx, boden)
            elif typ == "fahrbahnschwelle":
                schwelle(flaechen, e, boden)
            elif typ == "gehsteigabsenkung":
                absenkung(flaechen, e, boden)
            elif typ == "leitlinie":
                leitlinie(mark, e, boden)
            elif typ == "linie":
                leitlinie(mark, e, boden, strichliert=False)
            elif typ == "radpiktogramm":
                radpiktogramm(mark, e, boden)
            elif typ == "sperrflaeche":
                sperrflaeche(mark, e, boden)
            elif typ == "flaeche":
                flaeche(mark, e, boden)
            elif typ in ("poller", "verkehrszeichen", "mistkuebel", "motorrad", "hydrant"):
                moebel_extra.append(e)
            elif typ == "beet":
                beet(flaechen, e, boden)
            elif typ == "schachtdeckel":
                schachtdeckel(flaechen, e, boden)
            elif typ == "hydrant_ogd":
                hydrant_deckel(flaechen, e, boden)
            elif typ == "motorradplatz":
                motorradplatz(mark, e, boden)
            elif typ == "strassenschild":
                strassenschild(teile, e, terrain)
            elif typ == "fahrradstaender":
                fahrradstaender(teile, e, terrain)
            else:
                continue
        except Exception as ex:                    # ein fehlerhafter Eintrag darf die Szene nicht abbrechen
            if log:
                log(f"[strassenelemente] {typ} ausgelassen: {ex}")
            continue
        zahl[typ] = zahl.get(typ, 0) + 1
    zahl["parkmarkierung"] = parkmarkierung(mark, cfg, ctx, boden)
    zahl["randlinie"] = randlinien(mark, cfg, ctx, boden)
    if moebel_extra:
        from . import moebel as MO
        MO.build_moebel({"strassenmoebel": moebel_extra, "strassenmoebel_auto": {"baumscheiben": False}}, None, mats, sub,
                        terrain)
    for mb in (flaechen, mark, teile):
        if mb.faces:
            mb.to_object(bpy, mats, sub, smooth=(mb is teile))
    return zahl
