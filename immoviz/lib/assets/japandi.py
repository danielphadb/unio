"""Eigene Moebel und Leuchten im Japandi-Stil fuer Innenraeume (Noma Runde 12, Nachtrag Nutzer 25.11.2026).

Alles selbst erzeugte Geometrie (keine fremden Modelle, kein Download), damit Form und Mass frei waehlbar sind:
- sofa_niere:  geschwungenes, niedriges Nierensofa (Kidney-Form) mit Rundpolstern, Bezug Boucle
- pouf:        runder Polsterhocker im gleichen Stoff
- laterne:     Papierlaterne (Typ Akari) als Pendel, rund, oval oder zylindrisch, Kabel zur Decke oder Schraege
- stehleuchte: Stehleuchte mit Reispapier- oder Leinenschirm auf Holzfuss (Esche)
- tv:          flacher Fernseher an der Wand, optional mit niedrigem Lowboard Eiche und etwas Dekor
- kerzen:      Kerzengruppe (Wachs, Flamme leuchtet nur bei Innenlicht)
- plaid:       gefaltete Decke ueber einer Sofalehne

wohnungen.yaml <wohnung>.eigene_moebel: [{typ, c: [x, y], front: Grad (0 = +x, 90 = +y), ...}] in Projektkoordinaten
(manuelle Wohnungen) bzw. Planpixeln (Verkaufsplan, ueber apt.px_to_local). Leuchtstoffe (Papier innen, Flamme,
LED) haengen am Innenlicht der Lichtstimmung (materials.set_interior_emission, Eigenschaft immoviz_lampe).

blattschatten: [{fenster: [x, y, z ueber FOK], normal: [nx, ny] (aussen), abstand: m, groesse: m, dichte: 0..1}]: unsichtbare Blattmaske
draussen vor dem Fenster, je Kamera zur Sonne ausgerichtet (Lichtflecken und Blattschatten am Boden, Auftrag
noma_r12 Schritt 10). Nur fuer Schatten sichtbar, nicht fuer Kamera, Spiegelung und Glas.
"""
from __future__ import annotations

import math

from . import form as F

QUELLE = "Ausstattung Runde 12 Nachtrag (Nutzer 25.11.2026: Nierensofa, TV gegenueber, Japandi-Leuchten), eigene Geometrie"


# ------------------------------------------------------------------ Materialien
def _mat(bpy, mats, key, bau):
    if key not in mats:
        mats[key] = bau()
    return key


def _lampe_mat(bpy, name, color, k, papier=False):
    """Leuchtstoff: Papier (diffus plus durchscheinend) oder glatte Flaeche; Emission folgt dem Innenlicht."""
    from .. import materials as M
    m = M._new(bpy, name)
    N = M.Nodes(m)
    if papier:
        tc = N.new("ShaderNodeTexCoord")
        faser = N.noise(tc.outputs["Object"], 140.0, 4.0, 0.7)
        farbe = N.mix_rgb(N.math("MULTIPLY", faser.outputs["Fac"], 0.35), color, tuple(c * 0.88 for c in color))
        dif = N.new("ShaderNodeBsdfDiffuse")
        N.link(farbe, dif.inputs["Color"])
        tr = N.new("ShaderNodeBsdfTranslucent")
        N.link(farbe, tr.inputs["Color"])
        mix = N.new("ShaderNodeMixShader")
        mix.inputs[0].default_value = 0.45
        N.link(dif.outputs[0], mix.inputs[1])
        N.link(tr.outputs[0], mix.inputs[2])
        basis = mix.outputs[0]
    else:
        dif = N.new("ShaderNodeBsdfDiffuse")
        dif.inputs["Color"].default_value = (*color, 1.0)
        basis = dif.outputs[0]
    em = N.new("ShaderNodeEmission", name="lampe")
    em.inputs["Color"].default_value = (1.0, 0.72, 0.42, 1.0)       # rund 2700 K
    em.inputs["Strength"].default_value = 0.0
    add = N.new("ShaderNodeAddShader")
    N.link(basis, add.inputs[0])
    N.link(em.outputs[0], add.inputs[1])
    N.link(add.outputs[0], N.out.inputs["Surface"])
    m["immoviz_lampe"] = float(k)
    return m


def materialien(bpy, mats):
    from .. import materials as M
    _mat(bpy, mats, "j_papier", lambda: _lampe_mat(bpy, "j_papier", (0.93, 0.90, 0.83), 9.0, papier=True))
    _mat(bpy, mats, "j_leinen_schirm", lambda: _lampe_mat(bpy, "j_leinen_schirm", (0.88, 0.84, 0.76), 5.0, papier=True))
    _mat(bpy, mats, "j_flamme", lambda: _lampe_mat(bpy, "j_flamme", (1.0, 0.85, 0.6), 60.0))
    _mat(bpy, mats, "j_led", lambda: _lampe_mat(bpy, "j_led", (0.9, 0.88, 0.84), 25.0))
    _mat(bpy, mats, "j_esche", lambda: M.oak(bpy, "j_esche", M.hex_rgb("#D2B48C"), rough=0.5, coat=0.1))
    _mat(bpy, mats, "j_eiche", lambda: M.oak(bpy, "j_eiche", M.hex_rgb("#B08A62"), rough=0.45, coat=0.15))
    _mat(bpy, mats, "j_tv_glas", lambda: M.simple(bpy, "j_tv_glas", (0.006, 0.007, 0.008), 0.05))
    _mat(bpy, mats, "j_tv_rahmen", lambda: M.simple(bpy, "j_tv_rahmen", (0.03, 0.03, 0.032), 0.35, 0.6))
    _mat(bpy, mats, "j_wachs", lambda: M.simple(bpy, "j_wachs", M.hex_rgb("#F1EADB"), 0.45,
                                                **{"Subsurface Weight": 0.6, "Subsurface Radius": (0.02, 0.015, 0.01)}))
    _mat(bpy, mats, "j_kabel", lambda: M.simple(bpy, "j_kabel", (0.02, 0.02, 0.02), 0.5))
    _mat(bpy, mats, "j_keramik", lambda: M.simple(bpy, "j_keramik", M.hex_rgb("#CFC4B3"), 0.55))
    _mat(bpy, mats, "j_keramik_dunkel", lambda: M.simple(bpy, "j_keramik_dunkel", M.hex_rgb("#3B3632"), 0.6))
    _mat(bpy, mats, "j_buch_a", lambda: M.simple(bpy, "j_buch_a", M.hex_rgb("#D9CFC0"), 0.7))
    _mat(bpy, mats, "j_buch_b", lambda: M.simple(bpy, "j_buch_b", M.hex_rgb("#8C7B68"), 0.7))
    _mat(bpy, mats, "j_buch_c", lambda: M.simple(bpy, "j_buch_c", M.hex_rgb("#56604F"), 0.7))


def _stoff(bpy, mats, farbe, art="boucle"):
    from .. import materials as M
    key = f"j_{art}_{farbe.lstrip('#')}"
    if art == "boucle":
        return _mat(bpy, mats, key, lambda: M.stoff(bpy, key, M.hex_rgb(farbe), 0.95, 160.0, 1.1, 0.35))
    return _mat(bpy, mats, key, lambda: M.stoff(bpy, key, M.hex_rgb(farbe), 0.9, 600.0, 0.5, 0.25))


# ------------------------------------------------------------------ Hilfen
def _objekt(bpy, mb, mats, coll, smooth=True, verschweissen=True):
    import bmesh
    ob = mb.to_object(bpy, mats, coll, smooth=smooth)
    if verschweissen:      # MeshBuilder legt Ecken je Flaeche an; fuer weiche Schattierung zusammenfuehren
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
        bm.to_mesh(ob.data)
        bm.free()
        if smooth:
            ob.data.polygons.foreach_set("use_smooth", [True] * len(ob.data.polygons))
            ob.data.update()
    ob["quelle"] = QUELLE
    return ob


def _rahmen(c, front_grad):
    w = math.radians(front_grad)
    f = (math.cos(w), math.sin(w))
    s = (-f[1], f[0])
    return f, s


# ------------------------------------------------------------------ Moebel
def sofa_niere(mb, mat, c, z0, front_grad, breite=2.5, tiefe=0.95, radius=2.2, sitz=0.42, lehne=0.74, kissen_mat=None):
    """Nierensofa: Querschnitt (Sitz und runde Lehne) entlang eines Bogens, Enden rund eingezogen. c = Mitte der
    Grundflaeche (Sehne), Front zeigt nach front_grad, die Enden schwingen nach vorn."""
    f, s = _rahmen(c, front_grad)
    D = tiefe
    phi_max = breite / 2 / radius
    wrap = radius * (1 - math.cos(phi_max))          # wie weit die Enden nach vorn schwingen
    # Mittelpunkt des Bogens vor dem Sofa, so dass die Grundflaeche (inkl. Enden) um c liegt
    rueck_mitte = (c[0] - f[0] * (D + wrap) / 2, c[1] - f[1] * (D + wrap) / 2)
    C = (rueck_mitte[0] + f[0] * radius, rueck_mitte[1] + f[1] * radius)
    # Profil (b = Abstand von der Rueckseite, z), geschlossen, gegen den Uhrzeigersinn in (b, z)
    prof = [(0.03, 0.0), (D - 0.05, 0.0), (D - 0.01, 0.06), (D, 0.18), (D - 0.01, sitz - 0.10), (D - 0.05, sitz - 0.02),
            (D - 0.13, sitz + 0.015), (0.36, sitz + 0.03), (0.27, sitz + 0.07), (0.22, sitz + 0.16), (0.20, lehne - 0.10),
            (0.17, lehne - 0.03), (0.10, lehne), (0.04, lehne - 0.04), (0.005, lehne - 0.14), (0.0, 0.20), (0.008, 0.05)]
    bc = sum(p[0] for p in prof) / len(prof)
    zc = sum(p[1] for p in prof) / len(prof)
    n = 44
    ende = 0.32                                       # Laenge der runden Einziehung an jedem Ende (m)
    schnitte = []
    for k in range(n + 1):
        t = -1 + 2 * k / n
        phi = t * phi_max
        bogen = abs(t) * breite / 2
        rest = breite / 2 - bogen
        q = 1.0 if rest >= ende else math.sqrt(max(0.0, 1 - ((ende - rest) / ende) ** 2))
        kb, kz = max(0.18, q), 0.62 + 0.38 * max(0.18, q)
        u = (-math.cos(phi) * f[0] + math.sin(phi) * s[0], -math.cos(phi) * f[1] + math.sin(phi) * s[1])
        ring = []
        for b, z in prof:
            b2 = bc + (b - bc) * kb
            z2 = z * kz if z > 0.02 else z
            r = radius - b2
            ring.append((C[0] + r * u[0], C[1] + r * u[1], z0 + z2))
        schnitte.append((ring, (C[0] + (radius - bc) * u[0], C[1] + (radius - bc) * u[1], z0 + zc * kz)))
    m = len(prof)
    for k in range(n):
        (r0, c0), (r1, _) = schnitte[k], schnitte[k + 1]
        for i in range(m):
            j = (i + 1) % m
            pts = [r0[i], r0[j], r1[j], r1[i]]
            mx = sum(p[0] for p in pts) / 4
            my = sum(p[1] for p in pts) / 4
            mz = sum(p[2] for p in pts) / 4
            mb.poly(pts, None, mat, (mx - c0[0], my - c0[1], mz - c0[2]))
    for idx, sg in ((0, -1), (n, 1)):
        ring, cc = schnitte[idx]
        tang = schnitte[min(n, idx + 1)][1] if sg < 0 else schnitte[idx - 1][1]
        nrm = (cc[0] - tang[0], cc[1] - tang[1], 0.0)
        mb.poly(list(ring), None, mat, nrm)
    # drei lose Rundkissen an der Lehne
    km = kissen_mat or mat
    for t in (-0.45, 0.0, 0.45):
        phi = t * phi_max
        u = (-math.cos(phi) * f[0] + math.sin(phi) * s[0], -math.cos(phi) * f[1] + math.sin(phi) * s[1])
        r = radius - 0.33
        F.kugel(mb, (C[0] + r * u[0], C[1] + r * u[1], z0 + sitz + 0.20), 0.19, km, seg=20, ringe=10, stauchung=0.62)
    return wrap


def pouf(mb, mat, c, z0, r=0.30, h=0.40):
    prof = [(0.0, 0.0), (r - 0.06, 0.0), (r - 0.01, 0.04), (r, 0.12), (r, h - 0.12), (r - 0.02, h - 0.04),
            (r - 0.08, h - 0.005), (0.0, h)]
    F.drehkoerper(mb, (c[0], c[1], z0), prof, mat, seg=32, kappen=False)


def laterne(mb, c, z_mitte, z_oben, d=0.45, h=None, form="oval"):
    """Papierlaterne: Koerper (Papier) mit feinen Rippen, Kabel bis z_oben (Decke oder Schraege)."""
    r = d / 2
    h = h or (d * 1.25 if form == "oval" else d)
    if form == "zylinder":
        prof = [(0.0, -h / 2), (r * 0.92, -h / 2), (r, -h / 2 + 0.02), (r, h / 2 - 0.02), (r * 0.92, h / 2), (0.03, h / 2)]
    else:
        prof = []
        for k in range(13):
            a = -math.pi / 2 + math.pi * k / 12
            prof.append((max(0.012, r * math.cos(a)) if 0 < k < 12 else 0.012, (h / 2) * math.sin(a)))
    F.drehkoerper(mb, (c[0], c[1], z_mitte), prof, "j_papier", seg=36, kappen=False)
    oben = z_mitte + h / 2
    F.rohr(mb, [(c[0], c[1], oben), (c[0], c[1], z_oben)], 0.003, "j_kabel", seg=6)
    F.drehkoerper(mb, (c[0], c[1], z_oben - 0.02), [(0.05, 0.0), (0.05, 0.02)], "j_esche", seg=20)


def stehleuchte(mb, c, z0, h=1.5, d=0.42, schirm="j_papier"):
    """Holzfuss als Dreibein (Esche), Schirm oval aus Papier oder Leinen."""
    top = z0 + h - d * 0.55
    for k in range(3):
        a = math.radians(90 + 120 * k)
        fx, fy = c[0] + 0.22 * math.cos(a), c[1] + 0.22 * math.sin(a)
        F.rohr(mb, [(fx, fy, z0), (c[0] + 0.03 * math.cos(a), c[1] + 0.03 * math.sin(a), top)], [0.016, 0.012],
               "j_esche", seg=8, kappen=True)
    r = d / 2
    prof = []
    for k in range(11):
        a = -math.pi / 2 + math.pi * k / 10
        prof.append((max(0.015, r * math.cos(a)) if 0 < k < 10 else 0.015, d * 0.55 * math.sin(a)))
    F.drehkoerper(mb, (c[0], c[1], top + d * 0.05), prof, schirm, seg=32, kappen=False)


def tv(mb, c, z0, front_grad, breite=1.45, hoehe=0.83, unterkante=0.95, lowboard=None, deko=True):
    """Fernseher flach an der Wand (c = Wandpunkt, Front zeigt in den Raum), optional Lowboard darunter."""
    f, s = _rahmen(c, front_grad)
    dreh = math.degrees(math.atan2(s[1], s[0]))
    tiefe = 0.03
    m = (c[0] + f[0] * (tiefe / 2 + 0.01), c[1] + f[1] * (tiefe / 2 + 0.01), z0 + unterkante + hoehe / 2)
    F.quader(mb, m, (breite, tiefe, hoehe), "j_tv_rahmen", drehung=dreh)
    g = (m[0] + f[0] * (tiefe / 2 + 0.001), m[1] + f[1] * (tiefe / 2 + 0.001), m[2] + 0.004)
    F.quader(mb, g, (breite - 0.012, 0.002, hoehe - 0.02), "j_tv_glas", drehung=dreh)
    if lowboard:
        lb, lt, lh = lowboard.get("breite", 1.9), lowboard.get("tiefe", 0.42), lowboard.get("h", 0.45)
        lm = (c[0] + f[0] * lt / 2, c[1] + f[1] * lt / 2, z0 + 0.08 + (lh - 0.08) / 2)
        F.quader(mb, lm, (lb, lt, lh - 0.08), "j_eiche", drehung=dreh)
        sm = (c[0] + f[0] * (lt / 2 - 0.03), c[1] + f[1] * (lt / 2 - 0.03), z0 + 0.04)
        F.quader(mb, sm, (lb - 0.1, lt - 0.1, 0.08), "j_tv_rahmen", drehung=dreh)
        for k in range(1, 3):          # Fugen der Fronten
            o = -lb / 2 + lb * k / 3
            fm = (lm[0] + s[0] * o + f[0] * (lt / 2 + 0.001), lm[1] + s[1] * o + f[1] * (lt / 2 + 0.001), lm[2])
            F.quader(mb, fm, (0.004, 0.002, lh - 0.1), "j_tv_rahmen", drehung=dreh)
        if deko:
            oben = z0 + lh
            P = lambda a, b: (c[0] + s[0] * a + f[0] * b, c[1] + s[1] * a + f[1] * b)
            for k, (hk, mk) in enumerate(((0.035, "j_buch_a"), (0.03, "j_buch_b"), (0.028, "j_buch_c"))):
                q = P(-lb / 2 + 0.3, lt / 2)
                F.quader(mb, (q[0], q[1], oben + 0.035 * k + hk / 2), (0.30 - 0.02 * k, 0.22 - 0.01 * k, hk), mk,
                         drehung=dreh + 4 * k)
            v = P(lb / 2 - 0.25, lt / 2)
            F.drehkoerper(mb, (v[0], v[1], oben), [(0.0, 0.0), (0.06, 0.0), (0.10, 0.08), (0.09, 0.2), (0.04, 0.3),
                                                   (0.035, 0.34), (0.0, 0.34)], "j_keramik", seg=28, kappen=False)
            v2 = P(lb / 2 - 0.45, lt / 2 + 0.05)
            F.drehkoerper(mb, (v2[0], v2[1], oben), [(0.0, 0.0), (0.09, 0.0), (0.11, 0.05), (0.10, 0.09), (0.0, 0.09)],
                          "j_keramik_dunkel", seg=28, kappen=False)


def kerzen(mb, c, z0, n=3, abstand=0.09):
    for k in range(n):
        a = 2 * math.pi * k / n + 0.4
        x, y = c[0] + abstand * math.cos(a) * (1 if n > 1 else 0), c[1] + abstand * math.sin(a) * (1 if n > 1 else 0)
        h = 0.12 + 0.05 * k
        F.drehkoerper(mb, (x, y, z0), [(0.0, 0.0), (0.035, 0.0), (0.035, h), (0.0, h)], "j_wachs", seg=20, kappen=False)
        F.kugel(mb, (x, y, z0 + h + 0.018), 0.007, "j_flamme", seg=8, ringe=5, stauchung=2.4)


def plaid(mb, mat, c, z0, front_grad, breite=0.5, laenge=0.9):
    """Gefaltete Decke ueber der Armlehne bzw. Sitzkante: drei leicht versetzte flache Lagen."""
    f, s = _rahmen(c, front_grad)
    dreh = math.degrees(math.atan2(s[1], s[0]))
    for k in range(3):
        F.quader(mb, (c[0] + f[0] * 0.015 * k, c[1] + f[1] * 0.015 * k, z0 + 0.012 + 0.022 * k),
                 (breite - 0.02 * k, laenge - 0.04 * k, 0.02), mat, drehung=dreh + 3 * k)


# ------------------------------------------------------------------ Aufbau aus wohnungen.yaml
def bauen(bpy, coll, apt, a: dict, name: str, mats: dict) -> list:
    eintraege = a.get("eigene_moebel") or []
    if not eintraege:
        return []
    from .. import meshkit as K
    materialien(bpy, mats)
    obs = []
    fz, hoch = a["floor_z"], a["height"]
    for i, e in enumerate(eintraege):
        typ = e["typ"]
        c = apt.px_to_local(*e["c"][:2])
        z0 = fz + e.get("z", 0.0)
        klasse = e.get("klasse", "stoffe" if typ in ("sofa_niere", "pouf", "plaid") else "innenraum")
        mb = K.MeshBuilder(f"{name}_j{i:02d}__{klasse}__{typ}", ["j_esche"])
        if typ == "sofa_niere":
            mat = _stoff(bpy, mats, e.get("farbe", "#E6DDCF"))
            km = _stoff(bpy, mats, e["kissen"]) if e.get("kissen") else None
            sofa_niere(mb, mat, c, z0, e.get("front", 0.0), e.get("breite", 2.5), e.get("tiefe", 0.95),
                       e.get("radius", 2.2), e.get("sitz", 0.42), e.get("lehne", 0.74), km)
        elif typ == "pouf":
            pouf(mb, _stoff(bpy, mats, e.get("farbe", "#E6DDCF")), c, z0, e.get("r", 0.30), e.get("h", 0.40))
        elif typ == "laterne":
            z_oben = fz + e.get("oben", hoch)
            laterne(mb, c, fz + e["z_mitte"], z_oben, e.get("d", 0.45), e.get("h"), e.get("form", "oval"))
        elif typ == "stehleuchte":
            stehleuchte(mb, c, z0, e.get("h", 1.5), e.get("d", 0.42),
                        "j_leinen_schirm" if e.get("schirm") == "leinen" else "j_papier")
        elif typ == "tv":
            tv(mb, c, z0, e.get("front", 0.0), e.get("breite", 1.45), e.get("hoehe", 0.83), e.get("unterkante", 0.95),
               e.get("lowboard"), e.get("deko", True))
        elif typ == "kerzen":
            kerzen(mb, c, z0, e.get("n", 3), e.get("abstand", 0.09))
        elif typ == "plaid":
            plaid(mb, _stoff(bpy, mats, e.get("farbe", "#B9A58C"), "leinen"), c, z0, e.get("front", 0.0),
                  e.get("breite", 0.5), e.get("laenge", 0.9))
        else:
            raise ValueError(f"eigene_moebel: unbekannter typ {typ}")
        ob = _objekt(bpy, mb, mats, coll, smooth=typ not in ("tv",), verschweissen=typ not in ("tv",))
        ob["quelle"] = e.get("quelle", QUELLE)
        obs.append(ob)
    return obs


# ------------------------------------------------------------------ Blattschatten (unsichtbare Maske vor dem Fenster)
def _blatt_mat(bpy, dichte):
    from .. import materials as M
    name = f"j_blattmaske_{int(dichte * 100)}"
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = M._new(bpy, name)
    N = M.Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    vor = N.new("ShaderNodeTexVoronoi", Scale=6.0)
    vor.feature = "F1"
    verz = N.noise(tc.outputs["Object"], 1.6, 3.0, 0.6)
    vm = N.new("ShaderNodeVectorMath", operation="ADD")
    N.link(tc.outputs["Object"], vm.inputs[0])
    sc = N.new("ShaderNodeVectorMath", operation="SCALE")
    N.link(verz.outputs["Color"], sc.inputs[0])
    sc.inputs["Scale"].default_value = 0.35
    N.link(sc.outputs[0], vm.inputs[1])
    N.link(vm.outputs[0], vor.inputs["Vector"])
    grob = N.noise(tc.outputs["Object"], 0.9, 2.0, 0.5)
    # Blatt, wo Voronoi-Abstand klein ist; grobe Flecken (Aeste, Luecken) ueberlagert
    blatt = N.math("LESS_THAN", vor.outputs["Distance"], 0.36 + 0.25 * dichte)
    luecke = N.math("GREATER_THAN", grob.outputs["Fac"], 0.42 - 0.25 * dichte)
    maske = N.math("MULTIPLY", blatt, luecke)
    tr = N.new("ShaderNodeBsdfTransparent")
    dif = N.new("ShaderNodeBsdfDiffuse")
    dif.inputs["Color"].default_value = (0.02, 0.03, 0.015, 1.0)
    mix = N.new("ShaderNodeMixShader")
    N.link(maske, mix.inputs[0])
    N.link(tr.outputs[0], mix.inputs[1])
    N.link(dif.outputs[0], mix.inputs[2])
    N.link(mix.outputs[0], N.out.inputs["Surface"])
    return m


def blattschatten(bpy, scene, apt, a: dict, name: str, sonne) -> list:
    """Masken je Eintrag zur Sonne ausrichten (sonne: Einheitsvektor zur Sonne, lokales System). Rueckgabe Objekte."""
    eintraege = a.get("blattschatten") or []
    coll = bpy.data.collections.get("Atmosphaere")
    if coll is None:
        coll = bpy.data.collections.new("Atmosphaere")
        scene.collection.children.link(coll)
    for o in list(coll.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    if not eintraege or sonne[2] <= 0.0:
        return []
    from mathutils import Vector
    obs = []
    v = Vector(sonne).normalized()
    for i, e in enumerate(eintraege):
        n = e.get("normal")            # Aussenrichtung des Fensters: Maske nur, wenn die Sonne hineinscheint
        if n and sonne[0] * n[0] + sonne[1] * n[1] <= 0.05:
            continue
        x, y = apt.px_to_local(*e["fenster"][:2])
        p = Vector((x, y, a["floor_z"] + e["fenster"][2])) + v * e.get("abstand", 2.5)
        g = e.get("groesse", 3.0)
        me = bpy.data.meshes.new(f"{name}_blattmaske_{i}")
        me.from_pydata([(-g / 2, -g / 2, 0), (g / 2, -g / 2, 0), (g / 2, g / 2, 0), (-g / 2, g / 2, 0)], [], [[0, 1, 2, 3]])
        me.materials.append(_blatt_mat(bpy, e.get("dichte", 0.5)))
        ob = bpy.data.objects.new(f"{name}_blattmaske_{i}", me)
        ob.location = p
        ob.rotation_euler = v.to_track_quat("Z", "Y").to_euler()
        for attr in ("visible_camera", "visible_glossy", "visible_transmission", "visible_diffuse",
                     "visible_volume_scatter"):
            setattr(ob, attr, False)
        ob.visible_shadow = True
        coll.objects.link(ob)
        obs.append(ob)
    return obs
