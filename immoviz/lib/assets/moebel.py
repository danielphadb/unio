"""Strassenmoebel und Platzhalter fuer Menschen.

Strassenmoebel (`strassenmoebel` in project.yaml, je Eintrag `typ`, `pos`, optional `drehung` in Grad, `quelle`):
  poller          Wiener Poller (Stahlrohr 0,9 m), `farbe`: gruen_weiss (Standard), gruen_rot_weiss (dunkelgruen mit
                  rot-weissen Reflexringen, Wien 5. Bezirk laut Begehung), rot_weiss, grau
  fahrradbuegel   Wiener Buegel (Edelstahl, 0,8 m hoch, 0,75 m breit), `drehung` = Richtung des Buegels
  mistkuebel      Wiener Mistkuebel am Steher, `farbe`: orange (Standard) | grau_orange (grau mit orangem Rand)
  verkehrszeichen Steher 2,6 m mit Tafel ohne lesbare Schrift, `schild`: verbot | gebot | gefahr | stop | info | zusatz |
                  vorrang; `hoehe` = Mitte der Tafel ueber Boden (Standard 2,35), `steher: false` fuer eine zweite Tafel
                  am selben Steher
  motorrad        abgestelltes Motorrad (Platzhalter in Groesse und Lage, ohne Marke), `drehung` = Fahrtrichtung
  hydrant         Ueberflurhydrant (rot)
  baumscheibe     Baumscheibe mit Gussgitter (`art: gitter`) oder offener Erde mit Kante (`art: erde`), `groesse` in m
Automatisch (abschaltbar mit `strassenmoebel_auto: {baumscheiben: false}`): je Baum aus dem Kataster im Umkreis von
`umkreis_m` (Standard 90 m) eine Baumscheibe, wenn der Baum auf Gehsteig oder Parkstreifen steht (Quelle Kataster).

Menschen (`menschen` in project.yaml, je Eintrag `pos`, `hoehe` (Standard 1,75), `drehung`, `haltung`: stehen | gehen,
`quelle`): einfache graue Silhouetten in realistischer Groesse in der Sammlung `menschen_platzhalter`, nur zur
Steuerung von Lage und Massstab fuer die Bild-KI. Ausblenden: `assets: {menschen: aus}` in project.yaml oder
Umgebungsvariable IMMOVIZ_MENSCHEN=aus (z. B. fuer finale Renders ohne Platzhalter).
"""
from __future__ import annotations

import math
import os

import bpy

from .. import meshkit as K
from . import form as F


def _mats(mats):
    from .. import materials as M
    if "poller_gruen_weiss" in mats:
        return
    mats["poller_gruen_weiss"] = M.ring_material(bpy, "poller_gruen_weiss", (0.012, 0.035, 0.022), (0.75, 0.75, 0.72),
                                                 [(0.66, 0.72), (0.78, 0.84)])
    mats["poller_rot_weiss"] = M.ring_material(bpy, "poller_rot_weiss", (0.35, 0.02, 0.02), (0.75, 0.75, 0.72),
                                               [(0.36, 0.48), (0.60, 0.72)])
    mats["poller_grau"] = M.lack(bpy, "poller_grau", (0.06, 0.065, 0.07), 0.45)
    # dunkelgruen (RAL 6009 Tannengruen) mit Reflexband weiss-rot-weiss unter dem Kopf (Begehung 18.11.2026)
    mats["poller_gruen_rot_weiss"] = _ringe3(M, "poller_gruen_rot_weiss", (0.010, 0.028, 0.018),
                                             [((0.62, 0.66), (0.75, 0.75, 0.72)), ((0.66, 0.74), (0.42, 0.015, 0.015)),
                                              ((0.74, 0.78), (0.75, 0.75, 0.72))])
    mats["mistkuebel_grau"] = M.lack(bpy, "mistkuebel_grau", (0.16, 0.165, 0.17), 0.45)
    mats["moped_lack"] = M.lack(bpy, "moped_lack", (0.03, 0.035, 0.045), 0.3)
    mats["moped_reifen"] = M.simple(bpy, "moped_reifen", (0.015, 0.015, 0.015), 0.8)
    mats["schild_gelb"] = M.simple(bpy, "schild_gelb", (0.75, 0.50, 0.02), 0.35)
    mats["edelstahl"] = M.simple(bpy, "edelstahl", (0.55, 0.56, 0.57), 0.28, 1.0)
    mats["mistkuebel"] = M.lack(bpy, "mistkuebel", (0.55, 0.12, 0.012), 0.45)
    mats["steher"] = M.simple(bpy, "steher", (0.30, 0.31, 0.32), 0.4, 0.9)
    mats["schild_weiss"] = M.simple(bpy, "schild_weiss", (0.78, 0.78, 0.76), 0.35)
    mats["schild_rot"] = M.simple(bpy, "schild_rot", (0.45, 0.012, 0.015), 0.35)
    mats["schild_blau"] = M.simple(bpy, "schild_blau", (0.01, 0.06, 0.25), 0.35)
    mats["schild_rueck"] = M.simple(bpy, "schild_rueck", (0.25, 0.26, 0.27), 0.5, 0.8)
    mats["hydrant"] = M.lack(bpy, "hydrant", (0.40, 0.02, 0.015), 0.4)
    mats["gussgitter"] = _gitter(M)
    mats["erde"] = M.plaster(bpy, "erde", (0.035, 0.025, 0.018), var=0.3, bump=0.6, detail=False)
    mats["menschen_platzhalter"] = M.simple(bpy, "menschen_platzhalter", (0.30, 0.30, 0.31), 0.8)


def _ringe3(M, name, grund, ringe):
    """Poller mit mehreren farbigen Ringen (UV v = Hoehe): Liste ((z0, z1), Farbe)."""
    m = M._new(bpy, name)
    N = M.Nodes(m)
    tc, sep = N.uv()
    col = grund
    for (z0, z1), farbe in ringe:
        r = N.math("MULTIPLY", N.math("GREATER_THAN", sep.outputs["Y"], z0), N.math("LESS_THAN", sep.outputs["Y"], z1))
        col = N.mix_rgb(r, col, farbe)
    N.principled(col, rough=0.4, metal=0.3)
    return m


def _gitter(M):
    """Gussgitter der Baumscheibe: radiale Schlitze ueber Transparenz, Erde darunter (eigene Flaeche)."""
    m = M._new(bpy, "gussgitter")
    N = M.Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    o = N.sep(tc.outputs["Object"])
    r = N.math("SQRT", N.math("ADD", N.math("MULTIPLY", o[0], o[0]), N.math("MULTIPLY", o[1], o[1])))
    w = N.math("ARCTAN2", o[1], o[0])
    schlitz = N.math("GREATER_THAN", N.math("FRACT", N.math("MULTIPLY", w, 48 / (2 * math.pi))), 0.45)
    ring = N.math("GREATER_THAN", N.math("FRACT", N.math("MULTIPLY", r, 6.0)), 0.18)
    loch = N.math("MULTIPLY", N.math("MULTIPLY", schlitz, ring), N.math("GREATER_THAN", r, 0.3))
    p = N.new("ShaderNodeBsdfPrincipled")
    p.inputs["Base Color"].default_value = (0.03, 0.028, 0.026, 1.0)
    p.inputs["Roughness"].default_value = 0.6
    p.inputs["Metallic"].default_value = 0.6
    tp = N.new("ShaderNodeBsdfTransparent")
    mix = N.new("ShaderNodeMixShader")
    N.link(loch, mix.inputs["Fac"])
    N.link(p.outputs[0], mix.inputs[1])
    N.link(tp.outputs[0], mix.inputs[2])
    N.link(mix.outputs[0], N.out.inputs["Surface"])
    return m


def _poller(mb, x, y, z, farbe):
    mat = {"rot_weiss": "poller_rot_weiss", "grau": "poller_grau",
           "gruen_rot_weiss": "poller_gruen_rot_weiss"}.get(farbe, "poller_gruen_weiss")
    F.drehkoerper(mb, (x, y, z), [(0.065, 0.0), (0.065, 0.86), (0.055, 0.9), (0.0, 0.92)], mat, seg=14, kappen=True)


def _buegel(mb, x, y, z, dreh):
    w = math.radians(dreh)
    d = (math.cos(w), math.sin(w))
    pts = []
    for k in range(13):
        t = k / 12
        if t < 0.3:
            a, h = -0.375, 0.8 * t / 0.3 - 0.05
        elif t > 0.7:
            a, h = 0.375, 0.8 * (1 - t) / 0.3 - 0.05
        else:
            ang = math.pi * (t - 0.3) / 0.4
            a, h = -0.375 * math.cos(ang), 0.75 + 0.05 * math.sin(ang)
        pts.append((x + d[0] * a, y + d[1] * a, z + max(h, -0.05)))
    F.rohr(mb, pts, 0.024, "edelstahl", seg=8)


def _mistkuebel(mb, x, y, z, dreh, farbe="orange", steher=True):
    w = math.radians(dreh)
    if steher:
        F.drehkoerper(mb, (x, y, z), [(0.035, 0.0), (0.035, 1.05)], "steher", seg=8)
    cx, cy = x + math.cos(w) * 0.22, y + math.sin(w) * 0.22
    if farbe == "grau_orange":
        F.drehkoerper(mb, (cx, cy, z + 0.45), [(0.0, 0.0), (0.17, 0.0), (0.19, 0.44), (0.0, 0.44)], "mistkuebel_grau",
                      seg=16, kappen=False)
        F.drehkoerper(mb, (cx, cy, z + 0.89), [(0.0, 0.0), (0.195, 0.0), (0.20, 0.07), (0.20, 0.11), (0.0, 0.13)],
                      "mistkuebel", seg=16, kappen=False)
        return
    F.drehkoerper(mb, (cx, cy, z + 0.45), [(0.0, 0.0), (0.17, 0.0), (0.19, 0.50), (0.20, 0.52), (0.20, 0.56), (0.0, 0.58)],
                  "mistkuebel", seg=16, kappen=False)


def _motorrad(mb, x, y, z, dreh):
    """Abgestelltes Motorrad als Platzhalter: zwei Raeder, Rahmen, Tank, Sitzbank, Lenker (Laenge 2,1 m)."""
    w = math.radians(dreh)
    f, s = (math.cos(w), math.sin(w)), (-math.sin(w), math.cos(w))
    P = lambda a, b, c: (x + f[0] * a + s[0] * b, y + f[1] * a + s[1] * b, z + c)
    for a in (-0.72, 0.72):
        F.drehkoerper(mb, P(a, -0.06, 0.32), [(0.0, 0.0), (0.32, 0.0), (0.32, 0.12), (0.0, 0.12)], "moped_reifen", seg=18,
                      achse=(s[0], s[1], 0.0), kappen=True)
    F.rohr(mb, [P(-0.72, 0.0, 0.32), P(-0.2, 0.0, 0.45), P(0.45, 0.0, 0.62), P(0.72, 0.0, 0.32)], 0.05, "moped_lack", seg=6)
    F.quader(mb, P(0.1, 0.0, 0.62), (0.55, 0.26, 0.26), "moped_lack", drehung=dreh)
    F.quader(mb, P(-0.4, 0.0, 0.72), (0.6, 0.24, 0.1), "moped_reifen", drehung=dreh)
    F.quader(mb, P(-0.1, 0.0, 0.38), (0.45, 0.22, 0.28), "steher", drehung=dreh)
    F.rohr(mb, [P(0.5, -0.36, 1.0), P(0.5, 0.36, 1.0)], 0.018, "steher", seg=6)
    F.rohr(mb, [P(0.72, 0.0, 0.32), P(0.5, 0.0, 1.0)], 0.03, "steher", seg=6)


def _zeichen(mb, x, y, z, dreh, schild, hoehe=2.35, steher=True):
    if steher:
        F.drehkoerper(mb, (x, y, z), [(0.03, 0.0), (0.03, max(2.75, hoehe + 0.4)), (0.0, max(2.77, hoehe + 0.42))],
                      "steher", seg=8)
    w = math.radians(dreh)
    n = (math.cos(w), math.sin(w), 0.0)       # Tafel blickt in diese Richtung
    t = (-n[1], n[0], 0.0)
    c = (x + n[0] * 0.04, y + n[1] * 0.04, z + hoehe)

    def poly(pts2, mat, off=0.0, gross=1.0):
        pts = [(c[0] + t[0] * u * gross + n[0] * off, c[1] + t[1] * u * gross + n[1] * off, c[2] + v * gross) for u, v in pts2]
        mb.poly(pts, None, mat, n)
        mb.poly(pts[::-1], None, "schild_rueck", (-n[0], -n[1], 0))

    rund = [(0.3 * math.cos(2 * math.pi * k / 24), 0.3 * math.sin(2 * math.pi * k / 24)) for k in range(24)]
    if schild in ("verbot", "gebot"):
        poly(rund, "schild_rot" if schild == "verbot" else "schild_blau")
        if schild == "verbot":
            mb.poly([(c[0] + t[0] * u * 0.78 + n[0] * 0.004, c[1] + t[1] * u * 0.78 + n[1] * 0.004, c[2] + v * 0.78) for u, v in rund],
                    None, "schild_weiss", n)
    elif schild == "gefahr":
        dr = [(-0.35, -0.2), (0.35, -0.2), (0.0, 0.41)]
        poly(dr, "schild_rot")
        mb.poly([(c[0] + t[0] * u * 0.7 + n[0] * 0.004, c[1] + t[1] * u * 0.7 + n[1] * 0.004, c[2] + v * 0.7) for u, v in dr],
                None, "schild_weiss", n)
    elif schild == "vorrang":                 # Vorrangstrasse: gelbe Raute mit weissem Rand
        raute = [(0.3, 0.0), (0.0, 0.3), (-0.3, 0.0), (0.0, -0.3)]
        poly(raute, "schild_weiss")
        mb.poly([(c[0] + t[0] * u * 0.7 + n[0] * 0.004, c[1] + t[1] * u * 0.7 + n[1] * 0.004, c[2] + v * 0.7) for u, v in raute],
                None, "schild_gelb", n)
    elif schild == "stop":
        poly([(0.3 * math.cos(math.pi / 8 + k * math.pi / 4), 0.3 * math.sin(math.pi / 8 + k * math.pi / 4)) for k in range(8)], "schild_rot")
    else:          # info / zusatz: blaues bzw. weisses Rechteck mit abstrakter Flaeche, keine Schrift
        bh = (0.3, 0.3) if schild == "info" else (0.3, 0.12)
        poly([(-bh[0], -bh[1]), (bh[0], -bh[1]), (bh[0], bh[1]), (-bh[0], bh[1])], "schild_blau" if schild == "info" else "schild_weiss")
        if schild == "info":
            mb.poly([(c[0] + t[0] * u + n[0] * 0.004, c[1] + t[1] * u + n[1] * 0.004, c[2] + v) for u, v in
                     ((-0.08, -0.2), (0.08, -0.2), (0.08, 0.15), (-0.08, 0.15))], None, "schild_weiss", n)


def _hydrant(mb, x, y, z):
    F.drehkoerper(mb, (x, y, z), [(0.13, 0.0), (0.13, 0.06), (0.09, 0.08), (0.09, 0.62), (0.11, 0.64), (0.11, 0.7),
                                  (0.07, 0.78), (0.0, 0.82)], "hydrant", seg=14, kappen=True)
    for s in (1, -1):
        F.drehkoerper(mb, (x, y, z + 0.5), [(0.04, 0.0), (0.04, 0.13 * s if s > 0 else 0.13)], "hydrant", seg=8,
                      achse=(s, 0.0, 0.0))


def _baumscheibe(mb, x, y, z, groesse, art, dreh):
    g = groesse / 2
    w = math.radians(dreh)
    ca, sa = math.cos(w), math.sin(w)
    P = lambda a, b, h: (x + ca * a - sa * b, y + sa * a + ca * b, z + h)
    mb.poly([P(-g, -g, 0.005), P(g, -g, 0.005), P(g, g, 0.005), P(-g, g, 0.005)], None, "erde", (0, 0, 1))
    if art == "gitter":
        mb.poly([P(-g, -g, 0.02), P(g, -g, 0.02), P(g, g, 0.02), P(-g, g, 0.02)],
                [(-g, -g), (g, -g), (g, g), (-g, g)], "gussgitter", (0, 0, 1))
    for (a0, b0, a1, b1) in ((-g, -g, g, -g), (g, -g, g, g), (g, g, -g, g), (-g, g, -g, -g)):
        F.rohr(mb, [P(a0, b0, 0.03), P(a1, b1, 0.03)], 0.03, "randstein", seg=4)


def build_moebel(cfg, ctx, mats, coll, terrain):
    eintraege = list((cfg or {}).get("strassenmoebel") or [])
    auto = (cfg or {}).get("strassenmoebel_auto") or {}
    if auto.get("baumscheiben", True) and ctx:
        from .. import strasse as ST
        flaeche = ST._index(ctx, ("Gehsteig", "Gehweg, Radweg", "Ruhender Verkehr"))
        um = float(auto.get("umkreis_m", 90.0))
        for t in ctx.get("trees", []):
            x, y = t["pos"]
            if math.hypot(x, y) < um and ST._in_layer(flaeche, x, y):
                eintraege.append({"typ": "baumscheibe", "pos": [x, y], "art": auto.get("baumscheibe", "gitter"),
                                  "groesse": float(auto.get("groesse", 1.6)), "quelle": "Baumkataster (Lage)"})
    if not eintraege:
        return 0
    _mats(mats)
    sub = bpy.data.collections.new("Strassenmoebel")
    coll.children.link(sub)
    mb = K.MeshBuilder("strassenmoebel", ["steher"])
    for e in eintraege:
        x, y = e["pos"]
        z = terrain(x, y) + float(e.get("z", 0.12 if e.get("typ") != "baumscheibe" else 0.0))
        typ, dreh = e.get("typ"), float(e.get("drehung", 0.0))
        if typ == "poller":
            _poller(mb, x, y, z, e.get("farbe", "gruen_weiss"))
        elif typ == "fahrradbuegel":
            _buegel(mb, x, y, z, dreh)
        elif typ == "mistkuebel":
            _mistkuebel(mb, x, y, z, dreh, e.get("farbe", "orange"), e.get("steher", True))
        elif typ == "verkehrszeichen":
            _zeichen(mb, x, y, z, dreh, e.get("schild", "verbot"), float(e.get("hoehe", 2.35)), e.get("steher", True))
        elif typ == "motorrad":
            _motorrad(mb, x, y, z, dreh)
        elif typ == "hydrant":
            _hydrant(mb, x, y, z)
        elif typ == "baumscheibe":
            _baumscheibe(mb, x, y, z + float(e.get("z", 0.0)), float(e.get("groesse", 1.6)), e.get("art", "gitter"), dreh)
    mb.to_object(bpy, mats, sub, smooth=True)
    return len(eintraege)


# ------------------------------------------------------------------ Menschen-Platzhalter
def _mensch(mb, x, y, z, h, dreh, haltung, seed):
    """Einfache Silhouette (Beine, Rumpf, Arme, Kopf), Proportionen nach Koerperhoehe h."""
    w = math.radians(dreh)
    f = (math.cos(w), math.sin(w))          # Blickrichtung
    s = (-f[1], f[0])                        # seitlich
    k = h / 1.75
    schritt = 0.18 * k if haltung == "gehen" else 0.0
    P = lambda a, b, c: (x + f[0] * a + s[0] * b, y + f[1] * a + s[1] * b, z + c)
    huefte, schulter = 0.92 * k, 1.42 * k
    for sb, sa in ((0.09 * k, schritt), (-0.09 * k, -schritt)):
        F.rohr(mb, [P(sa, sb, 0.0), P(sa * 0.5, sb, 0.48 * k), P(0.0, sb * 0.9, huefte)], [0.06 * k, 0.065 * k, 0.085 * k],
               "menschen_platzhalter", seg=8, kappen=True)
        F.quader(mb, P(sa + 0.06 * k, sb, 0.04 * k), (0.25 * k, 0.10 * k, 0.08 * k), "menschen_platzhalter", drehung=dreh)
    F.rohr(mb, [P(0.0, 0.0, huefte - 0.05 * k), P(0.01, 0.0, huefte + 0.25 * k), P(0.0, 0.0, schulter)],
           [0.15 * k, 0.14 * k, 0.17 * k], "menschen_platzhalter", seg=10, kappen=True)
    for sb, sa in ((0.2 * k, -schritt * 0.7), (-0.2 * k, schritt * 0.7)):
        F.rohr(mb, [P(0.0, sb, schulter - 0.02 * k), P(sa * 0.5, sb * 1.05, schulter - 0.32 * k), P(sa, sb * 1.05, schulter - 0.62 * k)],
               [0.045 * k, 0.04 * k, 0.035 * k], "menschen_platzhalter", seg=6, kappen=True)
    F.rohr(mb, [P(0.0, 0.0, schulter), P(0.0, 0.0, schulter + 0.1 * k)], 0.05 * k, "menschen_platzhalter", seg=6)
    F.kugel(mb, P(0.01, 0.0, h - 0.11 * k), 0.105 * k, "menschen_platzhalter", seg=10, ringe=6, stauchung=1.15)


def build_menschen(cfg, mats, coll, terrain):
    eintraege = list((cfg or {}).get("menschen") or [])
    if not eintraege:
        return 0
    _mats(mats)
    sub = bpy.data.collections.new("menschen_platzhalter")
    coll.children.link(sub)
    mb = K.MeshBuilder("menschen_platzhalter", ["menschen_platzhalter"])
    for k, e in enumerate(eintraege):
        x, y = e["pos"]
        z = float(e["z"]) if "z" in e else terrain(x, y) + float(e.get("dz", 0.12))
        _mensch(mb, x, y, z, float(e.get("hoehe", 1.75)), float(e.get("drehung", 0.0)), e.get("haltung", "stehen"), k)
    ob = mb.to_object(bpy, mats, sub, smooth=True)
    aus = str((((cfg or {}).get("assets") or {}).get("menschen", "an"))).lower() in ("aus", "false", "nein") or \
        os.environ.get("IMMOVIZ_MENSCHEN", "").lower() in ("aus", "0", "nein", "false")
    ob.hide_render = aus
    sub.hide_render = aus
    return len(eintraege)
