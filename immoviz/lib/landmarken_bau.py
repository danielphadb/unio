"""Fern-Landmarken als echte Form (REGELN.md U12): parametrische Bauwerke statt Prismen aus dem Baukoerpermodell.

project.yaml `fern_landmarken`: Liste von Eintraegen {typ, name, pos: [x, y] (lokal) oder lat/lon, quelle, ...}.
Hoehen in Metern ueber Grund (`grund` = z lokal des Gelaendes; ohne Angabe aus dem groben Fernzonen-Gelaende).
`ersetzt: {bezug, radius}` blendet die Prismen dieses BEZUG im Umkreis aus (fern.json hoch).

Typen:
- turm_korb:   Fernmeldeturm (Schaft, Turmkorb aus Scheiben, Antenne), z. B. Arsenalturm
- gasometer:   Ziegelzylinder mit Fensterreihen und flacher Kuppel; `zylinder: [[x, y], ...]` fuer mehrere
- kuppelkirche: Barockkirche mit ovaler Kuppel auf Tambour, Laterne, Portikus, Seitenpavillons (Karlskirche)
- steildach:   Langhaus mit hohem Satteldach (Stephansdom); `von`/`bis` = Achse (Westfassade bis Chorende)
- haube:       Turmhaube auf einem bestehenden Turmstumpf (Pyramide mit Knick)
- riesenrad:   Speichenrad mit Gondeln und Pylonen
- zylinderturm: Glaszylinder aus versetzten Kreisen mit Antenne (Millennium Tower)
- doppelturm:  zwei Tuerme mit Helmen an einer Fassade (Votivkirche)
- mittelturm:  Turm mit Helm auf einem Baukoerper (Rathaus)
- schornstein: Schornstein mit Kugel (Fernheizwerk Spittelau)
"""
from __future__ import annotations

import math


def _ring(cx, cy, rx, ry=None, seg=32, rot=0.0):
    ry = rx if ry is None else ry
    c, s = math.cos(rot), math.sin(rot)
    out = []
    for k in range(seg):
        t = 2 * math.pi * k / seg
        x, y = rx * math.cos(t), ry * math.sin(t)
        out.append((cx + x * c - y * s, cy + x * s + y * c))
    return out


def _zyl(mb, cx, cy, r0, z0, z1, mat, r1=None, seg=32, deckel=None, boden=False, ry=None, rot=0.0):
    """Zylinder oder Kegelstumpf (r0 unten, r1 oben), optional elliptisch (ry/rot)."""
    r1 = r0 if r1 is None else r1
    k0 = _ring(cx, cy, r0, None if ry is None else ry, seg, rot)
    k1 = _ring(cx, cy, r1, None if ry is None else ry * r1 / r0, seg, rot)
    for i in range(seg):
        a0, a1 = k0[i], k0[(i + 1) % seg]
        b0, b1 = k1[i], k1[(i + 1) % seg]
        mb.poly([(a0[0], a0[1], z0), (a1[0], a1[1], z0), (b1[0], b1[1], z1), (b0[0], b0[1], z1)], None, mat,
                ((a0[0] + a1[0]) / 2 - cx, (a0[1] + a1[1]) / 2 - cy, 0))
    if deckel:
        mb.poly([(x, y, z1) for x, y in k1], None, deckel, (0, 0, 1))
    if boden:
        mb.poly([(x, y, z0) for x, y in k0[::-1]], None, mat, (0, 0, -1))


def _kuppel(mb, cx, cy, rx, z0, h, mat, ry=None, rot=0.0, seg=32, stufen=8):
    """Halbellipsoid ueber einem (elliptischen) Ring."""
    ry = rx if ry is None else ry
    prev = None
    for j in range(stufen + 1):
        t = (math.pi / 2) * j / stufen
        f, z = math.cos(t), z0 + h * math.sin(t)
        ring = [(x, y, z) for x, y in _ring(cx, cy, max(rx * f, 0.01), max(ry * f, 0.01), seg, rot)]
        if prev:
            for i in range(seg):
                a0, a1, b0, b1 = prev[i], prev[(i + 1) % seg], ring[i], ring[(i + 1) % seg]
                mb.poly([a0, a1, b1, b0], None, mat, ((a0[0] + a1[0]) / 2 - cx, (a0[1] + a1[1]) / 2 - cy, 0.5))
        prev = ring


def _quader(mb, cx, cy, l, b, z0, z1, rot, mat, dach=None):
    c, s = math.cos(rot), math.sin(rot)
    P = [(cx + u * c - v * s, cy + u * s + v * c) for u, v in ((-l / 2, -b / 2), (l / 2, -b / 2), (l / 2, b / 2), (-l / 2, b / 2))]
    for i in range(4):
        (x1, y1), (x2, y2) = P[i], P[(i + 1) % 4]
        mb.poly([(x1, y1, z0), (x2, y2, z0), (x2, y2, z1), (x1, y1, z1)], None, mat, (y2 - y1, -(x2 - x1), 0))
    mb.poly([(x, y, z1) for x, y in P], None, dach or mat, (0, 0, 1))
    return P


def _satteldach(mb, cx, cy, l, b, z0, z1, rot, mat, giebel):
    """Satteldach ueber einem Rechteck (First entlang l)."""
    c, s = math.cos(rot), math.sin(rot)
    T = lambda u, v, z: (cx + u * c - v * s, cy + u * s + v * c, z)
    A, B, C, D = T(-l / 2, -b / 2, z0), T(l / 2, -b / 2, z0), T(l / 2, b / 2, z0), T(-l / 2, b / 2, z0)
    F1, F2 = T(-l / 2, 0, z1), T(l / 2, 0, z1)
    mb.poly([A, B, F2, F1], None, mat, (s, -c, 0.6))
    mb.poly([C, D, F1, F2], None, mat, (-s, c, 0.6))
    mb.poly([B, C, F2], None, giebel, (c, s, 0))
    mb.poly([D, A, F1], None, giebel, (-c, -s, 0))


def _pyr(mb, cx, cy, w, z0, z1, mat, rot=0.0, n=4):
    pts = _ring(cx, cy, w / 2 / math.cos(math.pi / n), seg=n, rot=rot + math.pi / n)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        mb.poly([(a[0], a[1], z0), (b[0], b[1], z0), (cx, cy, z1)], None, mat,
                ((a[0] + b[0]) / 2 - cx, (a[1] + b[1]) / 2 - cy, 0.3))


def bauen(mb, liste, ground, mat, lage=None):
    """Baut alle Eintraege. mat(hex, rough) -> Materialname; lage(lat, lon) -> (x, y) lokal; ground(x, y) -> z."""
    for e in liste or []:
        if e.get("pos"):
            x, y = e["pos"]
        elif lage and e.get("lat") is not None:
            x, y = lage(e["lat"], e["lon"])
        else:
            continue
        g = float(e["grund"]) if e.get("grund") is not None else ground(x, y)
        rot = math.radians(float(e.get("achse_grad", 0.0)))
        typ = e["typ"]
        if typ == "turm_korb":
            H = float(e.get("hoehe", 155.0))
            weiss = mat(e.get("farbe", "#D9D8D3"), 0.6)
            dunkel = mat("#2A2E33", 0.3)
            k0 = float(e.get("korb_unten", 0.62)) * H
            _zyl(mb, x, y, float(e.get("schaft_r", 4.6)), g - 3, g + k0 + 2, weiss, r1=float(e.get("schaft_r_oben", 3.6)), seg=20)
            rk = float(e.get("korb_r", 10.5))
            z = g + k0
            _zyl(mb, x, y, rk * 1.12, z, z + 1.6, weiss, seg=32, deckel=weiss, boden=True)       # untere Plattform
            z += 1.6
            for i in range(int(e.get("korb_geschosse", 4))):                                 # Geschosse mit Fensterband
                _zyl(mb, x, y, rk * 0.97, z, z + 2.2, dunkel, seg=32)
                _zyl(mb, x, y, rk, z + 2.2, z + 3.6, weiss, seg=32, deckel=weiss, boden=True)
                z += 3.6
            _zyl(mb, x, y, rk * 0.62, z, z + 4.0, weiss, seg=24)
            _kuppel(mb, x, y, rk * 0.62, z + 4.0, rk * 0.35, weiss, seg=24, stufen=5)
            _zyl(mb, x, y, 0.9, z + 4.0, g + H, mat("#9EA2A5", 0.4), r1=0.35, seg=8)          # Antenne
        elif typ == "gasometer":
            zyl = e.get("zylinder") or [[x, y]]
            r, H = float(e.get("r", 32.5)), float(e.get("hoehe", 70.0))
            ziegel = mat(e.get("farbe", "#8E4E39"), 0.85)
            fenster = mat("#2B2523", 0.5)
            dach = mat(e.get("dach_farbe", "#7A8086"), 0.35)
            for zx, zy in zyl:
                gz = float(e["grund"]) if e.get("grund") is not None else ground(zx, zy)
                _zyl(mb, zx, zy, r, gz - 3, gz + H, ziegel, seg=48)
                for zb in (0.30, 0.55, 0.78):                    # drei Reihen hoher Rundbogenfenster (Rechteck genaehert)
                    for k in range(24):
                        t = 2 * math.pi * (k + 0.5) / 24
                        wx, wy = zx + (r + 0.05) * math.cos(t), zy + (r + 0.05) * math.sin(t)
                        tx, ty = -math.sin(t), math.cos(t)
                        z0, z1 = gz + H * zb, gz + H * zb + H * 0.13
                        mb.poly([(wx - tx * 1.6, wy - ty * 1.6, z0), (wx + tx * 1.6, wy + ty * 1.6, z0),
                                 (wx + tx * 1.6, wy + ty * 1.6, z1), (wx - tx * 1.6, wy - ty * 1.6, z1)], None, fenster,
                                (math.cos(t), math.sin(t), 0))
                _zyl(mb, zx, zy, r + 0.8, gz + H - 1.5, gz + H, ziegel, seg=48, boden=True)      # Gesims
                _kuppel(mb, zx, zy, r * 0.98, gz + H, float(e.get("kuppel", 7.0)), dach, seg=48, stufen=5)
        elif typ == "kuppelkirche":
            stein = mat(e.get("farbe", "#DCD3C2"), 0.7)
            kupfer = mat(e.get("kuppel_farbe", "#5E8E7C"), 0.5)
            kx, ky = e.get("kuppel_pos", [x, y])
            rk = e.get("kuppel_r", [13.0, 16.0])
            _quader(mb, kx, ky, float(e.get("schiff_l", 52.0)), float(e.get("schiff_b", 30.0)), g - 2, g + 26, rot, stein)
            _zyl(mb, kx, ky, rk[0] + 1.0, g + 26, g + 40, stein, seg=32, ry=rk[1] + 1.0, rot=rot)          # Tambour
            _kuppel(mb, kx, ky, rk[0], g + 40, float(e.get("kuppel_h", 19.0)), kupfer, ry=rk[1], rot=rot, seg=32)
            zt = g + 40 + float(e.get("kuppel_h", 19.0))
            _zyl(mb, kx, ky, 2.6, zt - 1, zt + 5.5, stein, seg=12)                                   # Laterne
            _kuppel(mb, kx, ky, 2.6, zt + 5.5, 2.2, kupfer, seg=12, stufen=3)
            fx, fy = e.get("front_pos", [x, y])                                                       # Portikus
            _quader(mb, fx, fy, 14.0, 22.0, g - 2, g + 20, rot, stein)
            c, s = math.cos(rot), math.sin(rot)
            T = lambda u, v: (fx + u * c - v * s, fy + u * s + v * c)
            P1, P2, P3 = T(7, -11), T(7, 11), T(7, 0)
            mb.poly([(P1[0], P1[1], g + 20), (P2[0], P2[1], g + 20), (P3[0], P3[1], g + 26)], None, stein, (c, s, 0))
            for sv in (-1, 1):                                                                        # Seitenpavillons
                px, py = T(-2, sv * float(e.get("pavillon_abstand", 30.0)))
                _quader(mb, px, py, 12.0, 12.0, g - 2, g + 30, rot, stein)
                _kuppel(mb, px, py, 4.2, g + 30, 4.5, kupfer, seg=16, stufen=4)
        elif typ == "steildach":
            (x0, y0), (x1, y1) = e["von"], e["bis"]
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            L = math.dist((x0, y0), (x1, y1))
            r_ = math.atan2(y1 - y0, x1 - x0)
            B = float(e.get("breite", 34.0))
            stein = mat(e.get("farbe", "#BDB3A0"), 0.75)
            dach = mat(e.get("dach_farbe", "#6B6446"), 0.55)
            te, tf = g + float(e.get("traufe", 26.0)), g + float(e.get("first", 62.0))
            _quader(mb, cx, cy, L, B, g - 2, te, r_, stein, dach)
            _satteldach(mb, cx, cy, L, B, te, tf, r_, dach, stein)
        elif typ == "haube":
            z0, z1 = float(e["z"][0]), float(e["z"][1])
            w = float(e.get("breite", 10.0))
            m_ = mat(e.get("farbe", "#4C5A55"), 0.5)
            zk = z0 + (z1 - z0) * 0.45
            _zyl(mb, x, y, w / 2, z0, zk, m_, r1=w * 0.32, seg=8)
            _pyr(mb, x, y, w * 0.64, zk, z1, m_, rot, n=8)
        elif typ == "riesenrad":
            H, D = float(e.get("hoehe", 64.75)), float(e.get("durchmesser", 60.96))
            stahl = mat("#4A3B33", 0.5)
            rot_ = rot
            c, s = math.cos(rot_), math.sin(rot_)
            zc = g + H - D / 2
            P = lambda u, z: (x + u * c, y + u * s, z)
            n = 60
            for k in range(n):                                                       # Radkranz als duenne Flaechen
                t0, t1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
                for rr in (D / 2, D / 2 - 1.2):
                    a, b = P(rr * math.cos(t0), zc + rr * math.sin(t0)), P(rr * math.cos(t1), zc + rr * math.sin(t1))
                    mb.poly([(a[0] - s * 0.4, a[1] + c * 0.4, a[2]), (b[0] - s * 0.4, b[1] + c * 0.4, b[2]),
                             (b[0] + s * 0.4, b[1] - c * 0.4, b[2]), (a[0] + s * 0.4, a[1] - c * 0.4, a[2])], None, stahl, (0, 0, 1))
            for k in range(15):                                                      # Gondeln
                t = 2 * math.pi * k / 15
                gx_, gy_, gz_ = P(D / 2 * math.cos(t), zc + D / 2 * math.sin(t))
                _quader(mb, gx_, gy_, 2.6, 5.5, gz_ - 4.0, gz_ - 1.0, rot_, mat("#B33A2E", 0.5))
            for sv in (-1, 1):                                                       # Pylone
                for du in (-12, 12):
                    a, b = P(du, g), P(0, zc)
                    mb.poly([(a[0] - s * 3 * sv, a[1] + c * 3 * sv, a[2]), (a[0] - s * 3.6 * sv, a[1] + c * 3.6 * sv, a[2]),
                             (b[0] - s * 3.6 * sv, b[1] + c * 3.6 * sv, b[2]), (b[0] - s * 3 * sv, b[1] + c * 3 * sv, b[2])], None, stahl, (c, s, 0))
        elif typ == "zylinderturm":
            H = float(e.get("hoehe", 202.0))
            glas = mat(e.get("farbe", "#5C7286"), 0.15)
            for (dx, dy, r, h) in e.get("kreise", [[0, 0, 19.0, 0.86], [9.0, 6.0, 17.0, 0.80]]):
                _zyl(mb, x + dx, y + dy, r, g - 2, g + H * h, glas, seg=36, deckel=glas)
            _zyl(mb, x, y, 1.2, g + H * 0.86, g + H, mat("#A0A4A8", 0.4), r1=0.4, seg=8)
        elif typ == "doppelturm":
            stein = mat(e.get("farbe", "#C9C1B0"), 0.75)
            dach = mat(e.get("dach_farbe", "#59605E"), 0.6)
            H, abst, w = float(e.get("hoehe", 99.0)), float(e.get("abstand", 26.0)), float(e.get("breite", 10.0))
            c, s = math.cos(rot), math.sin(rot)
            _quader(mb, x - c * 30, y - s * 30, 60.0, 30.0, g - 2, g + 24, rot, stein)
            _satteldach(mb, x - c * 30, y - s * 30, 60.0, 30.0, g + 24, g + 40, rot, dach, stein)
            for sv in (-1, 1):
                tx_, ty_ = x - s * sv * abst / 2, y + c * sv * abst / 2
                _quader(mb, tx_, ty_, w, w, g - 2, g + H * 0.55, rot, stein)
                _pyr(mb, tx_, ty_, w * 0.85, g + H * 0.55, g + H, dach, rot, n=8)
        elif typ == "mittelturm":
            stein = mat(e.get("farbe", "#C7BFAE"), 0.75)
            dach = mat(e.get("dach_farbe", "#55605C"), 0.6)
            H, w = float(e.get("hoehe", 98.0)), float(e.get("breite", 12.0))
            _quader(mb, x, y, w, w, g - 2, g + H * 0.62, rot, stein)
            _pyr(mb, x, y, w * 0.8, g + H * 0.62, g + H * 0.95, dach, rot, n=8)
            _zyl(mb, x, y, 0.5, g + H * 0.95, g + H, dach, seg=6)
        elif typ == "schornstein":
            H = float(e.get("hoehe", 126.0))
            _zyl(mb, x, y, float(e.get("r", 4.0)), g - 2, g + H, mat(e.get("farbe", "#C9C4BB"), 0.7), r1=float(e.get("r_oben", 3.0)), seg=20)
            if e.get("kugel_r"):
                kr, kz = float(e["kugel_r"]), g + float(e.get("kugel_z", H * 0.72))
                gold = mat("#C9A34A", 0.3)
                _kuppel(mb, x, y, kr, kz, kr, gold, seg=24, stufen=6)
                _kuppel(mb, x, y, kr, kz, -kr, gold, seg=24, stufen=6)


def ersetzt(liste, lage=None) -> list:
    """(bezug, x, y, radius) aller Eintraege mit `ersetzt` fuer das Ausblenden der Prismen in fern.markante."""
    out = []
    for e in liste or []:
        er = e.get("ersetzt")
        if not er:
            continue
        pts = e.get("zylinder") or [e.get("pos") or (lage(e["lat"], e["lon"]) if lage else None)]
        for p in pts:
            if p:
                out.append((str(er["bezug"]), float(p[0]), float(p[1]), float(er.get("radius", 20.0))))
    return out
