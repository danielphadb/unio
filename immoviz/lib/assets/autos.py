"""Autos: echte Karosserieformen statt Kisten, auf genau den Stellplaetzen aus lib/strasse.py (street.parking).

Typen (Laenge, Breite, Hoehe, Radstand laut ueblichen Massen der Klasse): Kleinwagen, Kompakt, Kombi, SUV,
Transporter. Je Typ eine Vorlage aus Querschnitten entlang des Wagens (Unterbau mit Schulter, eingezogene
Fahrgastzelle, Motorhaube, geneigte Front- und Heckscheibe), dazu Raeder mit Felge, Radlaeufe, Scheinwerfer,
Rueckleuchten, Spiegel und weisse Kennzeichenfelder ohne Schrift. Lackfarbe je Auto als Objektfarbe (gedeckte
Farben in ueblicher Verteilung). Alles parametrisch, keine fremden Modelle.
"""
from __future__ import annotations

import math
import random

import bpy

from .. import meshkit as K
from .. import strasse as ST
from . import form as F

# Masse: L, W, H, Radstand, Radradius, Heck oben, Dach hinten, Dach vorne, Haube hinten, Haube, Front, Guertel,
# Einzug der Fahrgastzelle, C-Saeule
TYPEN = {
    "kleinwagen":  dict(L=3.80, W=1.70, H=1.48, rs=2.45, r=0.30, heck=0.98, dh=0.12, dv=0.48, hh=0.22, haube=0.92, front=0.74, belt=0.93, einzug=0.19, c=0.24),
    "kompakt":     dict(L=4.30, W=1.80, H=1.44, rs=2.65, r=0.32, heck=0.98, dh=0.16, dv=0.52, hh=0.29, haube=0.93, front=0.74, belt=0.94, einzug=0.21, c=0.28),
    "kombi":       dict(L=4.72, W=1.83, H=1.46, rs=2.80, r=0.33, heck=1.05, dh=0.06, dv=0.51, hh=0.27, haube=0.93, front=0.74, belt=0.94, einzug=0.20, c=0.14),
    "suv":         dict(L=4.55, W=1.87, H=1.67, rs=2.70, r=0.36, heck=1.18, dh=0.06, dv=0.44, hh=0.25, haube=1.10, front=0.96, belt=1.10, einzug=0.15, c=0.16),
    "transporter": dict(L=5.05, W=2.00, H=1.98, rs=3.10, r=0.34, heck=1.98, dh=0.0, dv=0.24, hh=0.11, haube=1.18, front=1.05, belt=1.22, einzug=0.06, c=0.0),
}
ANTEIL = {"kleinwagen": 0.20, "kompakt": 0.30, "kombi": 0.20, "suv": 0.20, "transporter": 0.10}
# Lackfarben (linear) mit Gewicht: grau, schwarz, weiss und silber ueberwiegen
FARBEN = [((0.012, 0.012, 0.013), 16), ((0.040, 0.042, 0.046), 14), ((0.12, 0.125, 0.13), 12), ((0.36, 0.37, 0.38), 12),
          ((0.68, 0.68, 0.67), 18), ((0.012, 0.022, 0.055), 7), ((0.055, 0.075, 0.095), 6), ((0.015, 0.035, 0.022), 4),
          ((0.075, 0.012, 0.016), 5), ((0.30, 0.26, 0.19), 3), ((0.20, 0.035, 0.02), 3)]


def _oben(T, a):
    """Oberkante des Wagens an der Laengsposition a (Heck -L/2 bis Front +L/2)."""
    L, H = T["L"], T["H"]
    pts = [(-L / 2, T["heck"]), (-L / 2 + 0.05, T["heck"] + 0.03),
           (-L / 2 + max(T["dh"] * L, 0.06), H), (L / 2 - T["dv"] * L, H),
           (L / 2 - T["hh"] * L, T["haube"]), (L / 2 - 0.07, T["front"]), (L / 2, T["front"] - 0.10)]
    if T["dh"] == 0.0:
        pts[1] = (-L / 2 + 0.03, H)
        pts[2] = (-L / 2 + 0.06, H)
    for (a0, z0), (a1, z1) in zip(pts, pts[1:]):
        if a0 <= a <= a1:
            t = (a - a0) / (a1 - a0 + 1e-9)
            t = t * t * (3 - 2 * t)          # weiche Uebergaenge
            return z0 + (z1 - z0) * t
    return pts[-1][1]


def _vorlage(typ, seed, mats):
    T = dict(TYPEN[typ])
    rng = random.Random(seed)
    for k in ("H", "heck", "haube", "front"):
        T[k] *= rng.uniform(0.97, 1.03)
    L, W = T["L"], T["W"]
    mb = K.MeshBuilder(f"auto_{typ}_{seed}", ["autolack"])
    n = 30
    secs = [-L / 2 * math.cos(math.pi * k / (n - 1)) for k in range(n)]
    ringe, info = [], []
    for a in secs:
        e = abs(a) / (L / 2)
        w = W / 2 * (1 - 0.05 * e ** 4) - (0.10 * (e - 0.97) / 0.03 if e > 0.97 else 0.0)
        zt = _oben(T, a)
        zb = 0.24 + 0.08 * max(0.0, (e - 0.8) / 0.2)
        belt = T["belt"] + 0.02 * a / (L / 2)
        gh = zt > belt + 0.08
        zbe = min(belt, zt - 0.04)
        wt = w - T["einzug"]
        half = [(0.0, zb), (w - 0.10, zb), (w - 0.01, zb + 0.10), (w, (zb + zbe) / 2), (w - 0.012, zbe - 0.03),
                (w - 0.045, zbe)]
        if gh:
            half += [(wt + (w - 0.045 - wt) * 0.18, zbe + (zt - zbe) * 0.86), (wt - 0.07, zt), (0.0, zt)]
        else:
            half += [(w - 0.09, zt - 0.015), (w - 0.20, zt), (0.0, zt)]
        ring = [(a, b, z) for b, z in half] + [(a, -b, z) for b, z in half[-2:0:-1]]
        ringe.append(ring)
        info.append((a, gh, zt))
    m = len(ringe[0])
    a_fen0 = -L / 2 + T["dh"] * L + T["c"]
    a_fen1 = L / 2 - T["dv"] * L - 0.04
    a_b = a_fen0 + (a_fen1 - a_fen0) * (0.52 if typ != "kleinwagen" else 0.62)
    for k in range(n - 1):
        a0, g0, _ = info[k]
        a1, g1, _ = info[k + 1]
        am = (a0 + a1) / 2
        for i in range(m):
            j = (i + 1) % m
            seg = i if i < 8 else (m - 1 - i)        # spiegelbildliche Segmentnummer 0 ... 7
            mat = "autolack"
            if seg in (0, 1):
                mat = "auto_kunststoff"
            elif seg == 5 and g0 and g1 and a_fen0 < am < a_fen1 and abs(am - a_b) > 0.06:
                mat = "autoglas"
            elif seg in (6, 7) and g0 and g1:
                if am > L / 2 - T["dv"] * L + 0.03 or (T["dh"] > 0 and am < -L / 2 + T["dh"] * L - 0.02):
                    mat = "autoglas"
            elif seg == 5 and typ == "transporter" and am > L / 2 - T["dv"] * L - 0.6 and g0 and g1:
                mat = "autoglas"
            mb.poly([ringe[k][i], ringe[k][j], ringe[k + 1][j], ringe[k + 1][i]], None, mat)
    mb.poly(ringe[0][::-1], None, "autolack", (-1, 0, 0))
    mb.poly(ringe[-1], None, "autolack", (1, 0, 0))
    # Front: Scheinwerfer, Kuehlergrill, Kennzeichen; Heck: Rueckleuchten, Kennzeichen, Stossfaenger
    af, ah = L / 2 + 0.004, -L / 2 - 0.004
    wf = W / 2 - 0.13
    zf = T["front"] - 0.12
    for s in (1, -1):
        mb.poly([(af, s * (wf - 0.30), zf - 0.12), (af, s * wf, zf - 0.10), (af, s * wf, zf), (af, s * (wf - 0.30), zf - 0.01)],
                None, "auto_licht_vorne", (1, 0, 0))
        zr = T["heck"] - 0.10
        mb.poly([(ah, s * (wf - 0.25), zr - 0.16), (ah, s * wf, zr - 0.16), (ah, s * wf, zr), (ah, s * (wf - 0.25), zr)],
                None, "auto_licht_hinten", (-1, 0, 0))
    mb.poly([(af, -0.34, 0.42), (af, 0.34, 0.42), (af, 0.34, zf - 0.13), (af, -0.34, zf - 0.13)], None, "auto_kunststoff", (1, 0, 0))
    for a_, z0 in ((af + 0.002, 0.30), (ah - 0.002, 0.46)):
        mb.poly([(a_, -0.26, z0), (a_, 0.26, z0), (a_, 0.26, z0 + 0.11), (a_, -0.26, z0 + 0.11)], None, "kennzeichen",
                (1 if a_ > 0 else -1, 0, 0))
    mb.poly([(ah, -W / 2 + 0.12, 0.30), (ah, W / 2 - 0.12, 0.30), (ah, W / 2 - 0.12, 0.42), (ah, -W / 2 + 0.12, 0.42)],
            None, "auto_kunststoff", (-1, 0, 0))
    # Raeder mit Radlauf, Spiegel
    r = T["r"]
    for aw in (L / 2 - 0.80 - (L - T["rs"] - 1.6) * 0.5, L / 2 - 0.80 - (L - T["rs"] - 1.6) * 0.5 - T["rs"]):
        for s in (1, -1):
            wb = W / 2 * (1 - 0.05 * (abs(aw) / (L / 2)) ** 4)
            bogen = [(aw + (r + 0.06) * math.cos(t), s * (wb + 0.003), r + (r + 0.06) * math.sin(t))
                     for t in (math.pi * q / 12 for q in range(13))]
            mb.poly(bogen, None, "auto_kunststoff", (0, s, 0))
            b0 = s * (wb + 0.006)
            F.drehkoerper(mb, (aw, b0 - s * 0.21, r),
                          [(r * 0.6, 0.0), (r * 0.94, 0.0), (r, 0.03), (r, 0.18), (r * 0.94, 0.21), (r * 0.6, 0.21)],
                          "reifen", seg=18, kappen=False, achse=(0.0, s, 0.0))
            F.drehkoerper(mb, (aw, b0 - s * 0.012, r), [(0.0, 0.0), (r * 0.6, 0.0)], "felge", seg=18, kappen=False,
                          achse=(0.0, s, 0.0))
    a_sp = L / 2 - T["dv"] * L + 0.02
    for s in (1, -1):
        F.quader(mb, (a_sp, s * (W / 2 + 0.07), T["belt"] + 0.09), (0.10, 0.16, 0.11), "autolack")
    for nm in ("autoglas", "auto_kunststoff", "reifen", "felge", "kennzeichen", "auto_licht_vorne", "auto_licht_hinten"):
        mb.mat(nm)
    return mb.to_mesh(bpy, mats, smooth=True)


def build(ctx, rng, terrain, radius, cfg, mats, coll):
    """Autos auf den Stellplaetzen (Parkordnung laut street.parking). Liefert die Zahl der Autos."""
    typen = list(ANTEIL)
    gew = [ANTEIL[t] for t in typen]
    vorlagen = {t: [_vorlage(t, 70 + k * 13 + i, mats) for k in range(2)] for i, t in enumerate(typen)}
    sub = bpy.data.collections.new("Autos")
    coll.children.link(sub)
    plaetze = [(ab, p) for s in ST.stellplaetze(ctx, cfg, radius) for ab in s["abschnitte"] for p in ab["plaetze"]]
    n = 0
    for ab, platz in plaetze:
        if rng.random() > ab["belegung"]:
            continue
        typ = rng.choices(typen, gew)[0]
        if platz["art"] != "laengs" and typ == "transporter" and rng.random() < 0.6:
            typ = "kompakt"
        col = rng.choices([c for c, _ in FARBEN], [w for _, w in FARBEN])[0]
        dw = math.radians(rng.uniform(-2.5, 2.5))
        ax = platz["achse"]
        ax = (ax[0] * math.cos(dw) - ax[1] * math.sin(dw), ax[0] * math.sin(dw) + ax[1] * math.cos(dw))
        vor = rng.uniform(-0.15, 0.15)
        ox, oy = platz["pos"][0] + ax[0] * vor, platz["pos"][1] + ax[1] * vor
        ob = bpy.data.objects.new("autos", rng.choice(vorlagen[typ]))
        ob.location = (ox, oy, terrain(ox, oy))
        ob.rotation_euler = (0, 0, math.atan2(ax[1], ax[0]))
        ob.color = (*col, 1.0)
        sub.objects.link(ob)
        n += 1
    return n
