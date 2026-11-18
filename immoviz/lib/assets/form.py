"""Geometrie-Grundformen fuer die Objektbibliothek (schreiben in einen meshkit.MeshBuilder).

Alle Formen sind selbst erzeugt (keine fremden Modelle). UV: bei Drehkoerpern und Rohren u = Umfang in Metern,
v = Hoehe bzw. Laenge ab dem Fusspunkt in Metern (Ringe am Poller, Rinde), bei Quadern Meter je Flaeche.
"""
from __future__ import annotations

import math


def _norm(v):
    L = math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) or 1.0
    return (v[0] / L, v[1] / L, v[2] / L)


def _cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def basis(achse):
    """Zwei Einheitsvektoren senkrecht zur Achse."""
    ax = _norm(achse)
    ref = (0.0, 0.0, 1.0) if abs(ax[2]) < 0.9 else (1.0, 0.0, 0.0)
    u = _norm(_cross(ax, ref))
    v = _cross(ax, u)
    return ax, u, v


def drehkoerper(mb, mitte, profil, mat, seg=16, kappen=True, achse=(0.0, 0.0, 1.0), smooth_uv=True):
    """Drehkoerper um eine Achse durch `mitte`: profil = [(radius, hoehe), ...] von unten nach oben."""
    ax, u, v = basis(achse)
    ringe = []
    for r, h in profil:
        c = (mitte[0] + ax[0] * h, mitte[1] + ax[1] * h, mitte[2] + ax[2] * h)
        ringe.append([(c[0] + r * (math.cos(a) * u[0] + math.sin(a) * v[0]),
                       c[1] + r * (math.cos(a) * u[1] + math.sin(a) * v[1]),
                       c[2] + r * (math.cos(a) * u[2] + math.sin(a) * v[2]))
                      for a in (2 * math.pi * i / seg for i in range(seg))])
    for k in range(len(profil) - 1):
        r0, h0 = profil[k]
        r1, h1 = profil[k + 1]
        for i in range(seg):
            j = (i + 1) % seg
            if r0 < 1e-6 and r1 < 1e-6:
                continue
            uvs = [(i / seg * 2 * math.pi * r0, h0), (j / seg * 2 * math.pi * r0 if j else 2 * math.pi * r0, h0),
                   (j / seg * 2 * math.pi * r1 if j else 2 * math.pi * r1, h1), (i / seg * 2 * math.pi * r1, h1)]
            pts = [ringe[k][i], ringe[k][j], ringe[k + 1][j], ringe[k + 1][i]]
            if r0 < 1e-6:
                pts, uvs = [pts[0], pts[2], pts[3]], [uvs[0], uvs[2], uvs[3]]
            elif r1 < 1e-6:
                pts, uvs = pts[:3], uvs[:3]
            mb.poly(pts, uvs, mat)
    if kappen:
        if profil[0][0] > 1e-6:
            mb.poly(ringe[0][::-1], [(p[0], p[1]) for p in ringe[0][::-1]], mat)
        if profil[-1][0] > 1e-6:
            mb.poly(ringe[-1], [(p[0], p[1]) for p in ringe[-1]], mat)


def rohr(mb, punkte, radien, mat, seg=8, kappen=False):
    """Rohr entlang einer Polylinie (Stamm, Ast, Seil, Mast, Buegel). radien: Zahl oder je Punkt."""
    if isinstance(radien, (int, float)):
        radien = [radien] * len(punkte)
    n = len(punkte)
    if n < 2:
        return
    ringe, laenge = [], [0.0]
    for k in range(1, n):
        laenge.append(laenge[-1] + math.dist(punkte[k], punkte[k - 1]))
    prev_u = None
    for k in range(n):
        a = punkte[max(0, k - 1)]
        b = punkte[min(n - 1, k + 1)]
        t = _norm((b[0] - a[0], b[1] - a[1], b[2] - a[2]))
        if prev_u is None:
            _, u, v = basis(t)
        else:      # Rahmen mitfuehren (keine Verdrehung)
            d = sum(prev_u[i] * t[i] for i in range(3))
            u = _norm((prev_u[0] - t[0] * d, prev_u[1] - t[1] * d, prev_u[2] - t[2] * d))
            v = _cross(t, u)
        prev_u = u
        r = radien[k]
        c = punkte[k]
        ringe.append([(c[0] + r * (math.cos(al) * u[0] + math.sin(al) * v[0]),
                       c[1] + r * (math.cos(al) * u[1] + math.sin(al) * v[1]),
                       c[2] + r * (math.cos(al) * u[2] + math.sin(al) * v[2]))
                      for al in (2 * math.pi * i / seg for i in range(seg))])
    for k in range(n - 1):
        for i in range(seg):
            j = (i + 1) % seg
            umf0, umf1 = 2 * math.pi * radien[k], 2 * math.pi * radien[k + 1]
            mb.poly([ringe[k][i], ringe[k][j], ringe[k + 1][j], ringe[k + 1][i]],
                    [(i / seg * umf0, laenge[k]), ((i + 1) / seg * umf0, laenge[k]),
                     ((i + 1) / seg * umf1, laenge[k + 1]), (i / seg * umf1, laenge[k + 1])], mat)
    if kappen:
        mb.poly(ringe[0][::-1], None, mat)
        mb.poly(ringe[-1], None, mat)


def quader(mb, mitte, groesse, mat, drehung=0.0, kippen=None):
    """Quader um `mitte` (x, y, z der Mitte), groesse (l, b, h), Drehung um z in Grad. kippen: (ax, ay) fuer
    beliebige Achsen statt drehung (Laengsachse ax, Querachse ay, beide waagrecht)."""
    l2, b2, h2 = groesse[0] / 2, groesse[1] / 2, groesse[2] / 2
    if kippen:
        ax, ay = kippen
    else:
        w = math.radians(drehung)
        ax, ay = (math.cos(w), math.sin(w), 0.0), (-math.sin(w), math.cos(w), 0.0)
    az = (0.0, 0.0, 1.0)

    def P(a, b, c):
        return (mitte[0] + ax[0] * a + ay[0] * b + az[0] * c, mitte[1] + ax[1] * a + ay[1] * b + az[1] * c,
                mitte[2] + ax[2] * a + ay[2] * b + az[2] * c)
    flaechen = [((-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)), ((-1, 1, -1), (1, 1, -1), (1, -1, -1), (-1, -1, -1)),
                ((-1, -1, -1), (1, -1, -1), (1, -1, 1), (-1, -1, 1)), ((1, 1, -1), (-1, 1, -1), (-1, 1, 1), (1, 1, 1)),
                ((1, -1, -1), (1, 1, -1), (1, 1, 1), (1, -1, 1)), ((-1, 1, -1), (-1, -1, -1), (-1, -1, 1), (-1, 1, 1))]
    for f in flaechen:
        pts = [P(a * l2, b * b2, c * h2) for a, b, c in f]
        if f[0][2] == f[2][2]:      # waagrecht
            uv = [(a * l2, b * b2) for a, b, c in f]
        elif f[0][1] == f[2][1]:
            uv = [(a * l2, c * h2 + h2) for a, b, c in f]
        else:
            uv = [(b * b2, c * h2 + h2) for a, b, c in f]
        mb.poly(pts, uv, mat)


def kugel(mb, mitte, radius, mat, seg=10, ringe=6, stauchung=1.0):
    profil = []
    for k in range(ringe + 1):
        a = -math.pi / 2 + math.pi * k / ringe
        profil.append((radius * math.cos(a), radius * math.sin(a) * stauchung))
    drehkoerper(mb, mitte, profil, mat, seg=seg, kappen=False)


def scheibe(mb, mitte, radius, mat, normal=(0.0, 0.0, 1.0), seg=16):
    ax, u, v = basis(normal)
    pts = [(mitte[0] + radius * (math.cos(a) * u[0] + math.sin(a) * v[0]),
            mitte[1] + radius * (math.cos(a) * u[1] + math.sin(a) * v[1]),
            mitte[2] + radius * (math.cos(a) * u[2] + math.sin(a) * v[2]))
           for a in (2 * math.pi * i / seg for i in range(seg))]
    mb.poly(pts, None, mat, normal)


def flaeche(mb, pts, mat, normal=None, uv=None):
    mb.poly(pts, uv, mat, normal)


def kettenlinie(a, b, durchhang, n=10):
    """Seil zwischen zwei Punkten mit Durchhang (Parabel als Naeherung der Kettenlinie)."""
    out = []
    for k in range(n + 1):
        t = k / n
        out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t,
                    a[2] + (b[2] - a[2]) * t - 4 * durchhang * t * (1 - t)))
    return out
