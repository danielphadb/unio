"""Damastmuster als eigene, nahtlose Rapport-Textur (Auftrag noma_tapete_bettwand, 25.11.2026).

Erzeugt eine Graustufenmaske (weiss = Ornament, schwarz = Grund) fuer einen Rapport von 53 cm (Standardbahn):
grosses, spiegelsymmetrisches Medaillon (Spitzbogen-Kontur, Mittelstiel mit Blattpaaren, Ranken mit Spiralen und
Blaettchen, Lilienkrone) in der Mitte, kleine Rosette in den Ecken (Versatz um eine halbe Bahn, klassischer Damast).
Keine Fremdvorlage; die Datei wird bei Bedarf neu erzeugt (immoviz/assets/texturen/damast_rapport.png).

Aufruf: python -m immoviz.lib.assets.damast  (oder erzeugen() aus materials.tapete_damast)
"""
from __future__ import annotations

import math
from pathlib import Path

DATEI = Path(__file__).resolve().parents[2] / "assets" / "texturen" / "damast_rapport.png"
N = 2048          # Zeichenaufloesung, gespeichert wird 1024


def _p(x, y):
    return (x * N, y * N)


def _strich(d, pts, breite):
    d.line([_p(*q) for q in pts], fill=255, width=max(1, int(breite * N)), joint="curve")
    r = breite * N / 2
    for q in (pts[0], pts[-1]):
        x, y = _p(*q)
        d.ellipse([x - r, y - r, x + r, y + r], fill=255)


def _blatt(d, cx, cy, laenge, breite, winkel):
    """Spitzes Blatt (zwei Kreisboegen) um (cx, cy), winkel in Grad (0 = nach oben)."""
    a = math.radians(winkel)
    ux, uy = math.sin(a), -math.cos(a)          # Blattachse
    vx, vy = -uy, ux
    pts = []
    for k in range(25):
        t = k / 24
        w = math.sin(math.pi * t) ** 0.8 * breite / 2
        pts.append((cx + ux * (t - 0.5) * laenge + vx * w, cy + uy * (t - 0.5) * laenge + vy * w))
    for k in range(24, -1, -1):
        t = k / 24
        w = math.sin(math.pi * t) ** 0.8 * breite / 2
        pts.append((cx + ux * (t - 0.5) * laenge - vx * w, cy + uy * (t - 0.5) * laenge - vy * w))
    d.polygon([_p(*q) for q in pts], fill=255)


def _spirale(d, cx, cy, r0, umlaeufe, start, richtung, breite):
    pts = []
    n = int(60 * umlaeufe)
    for k in range(n + 1):
        t = k / n
        a = math.radians(start) + richtung * 2 * math.pi * umlaeufe * t
        r = r0 * (1 - 0.82 * t)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    _strich(d, pts, breite * (1.0 - 0.0))
    return pts


def _bezier(p0, p1, p2, p3, n=40):
    out = []
    for k in range(n + 1):
        t = k / n
        a, b, c, e = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + e * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + e * p3[1]))
    return out


def _medaillon_links(d, cx, cy, s):
    """Linke Haelfte des grossen Medaillons (wird gespiegelt), s = Hoehe als Anteil des Rapports."""
    # Spitzbogen-Kontur (Ogee) als Doppellinie
    for off, b in ((0.0, 0.010), (0.028, 0.005)):
        k = _bezier((cx, cy - 0.50 * s + off), (cx - 0.20 * s, cy - 0.38 * s + off),
                    (cx - 0.36 * s + off, cy - 0.12 * s), (cx - 0.34 * s + off, cy + 0.08 * s))
        k += _bezier((cx - 0.34 * s + off, cy + 0.08 * s), (cx - 0.32 * s + off, cy + 0.30 * s),
                     (cx - 0.12 * s, cy + 0.42 * s - off), (cx, cy + 0.50 * s - off))[1:]
        _strich(d, k, b)
    # Mittelstiel
    _strich(d, [(cx, cy - 0.40 * s), (cx, cy + 0.36 * s)], 0.012)
    # Blattpaare am Stiel
    for t, l, w, a in ((-0.28, 0.16, 0.05, -38), (-0.12, 0.19, 0.06, -55), (0.05, 0.21, 0.065, -70),
                       (0.22, 0.17, 0.055, -112)):
        _blatt(d, cx - math.sin(math.radians(-a)) * l * s * 0.5, cy + t * s - math.cos(math.radians(a)) * l * s * 0.5 * 0,
               l * s, w * s, a)
    # grosse Ranke mit Spirale links
    r = _bezier((cx - 0.02 * s, cy + 0.12 * s), (cx - 0.16 * s, cy + 0.02 * s),
                (cx - 0.26 * s, cy - 0.10 * s), (cx - 0.20 * s, cy - 0.22 * s))
    _strich(d, r, 0.008)
    _spirale(d, cx - 0.155 * s, cy - 0.215 * s, 0.05 * s, 1.3, 180, 1, 0.007)
    _strich(d, _bezier((cx - 0.03 * s, cy + 0.30 * s), (cx - 0.18 * s, cy + 0.30 * s),
                       (cx - 0.26 * s, cy + 0.18 * s), (cx - 0.21 * s, cy + 0.10 * s)), 0.007)
    _spirale(d, cx - 0.185 * s, cy + 0.135 * s, 0.035 * s, 1.2, 200, -1, 0.006)
    # Blaettchen an den Ranken
    for (bx, by, a) in ((-0.24, -0.04, -150), (-0.27, 0.22, -20), (-0.10, -0.33, -30), (-0.13, 0.40, 200)):
        _blatt(d, cx + bx * s, cy + by * s, 0.07 * s, 0.026 * s, a)
    # Lilienkrone oben und Tropfen unten
    _blatt(d, cx, cy - 0.44 * s, 0.10 * s, 0.045 * s, 0)
    _blatt(d, cx - 0.04 * s, cy - 0.41 * s, 0.08 * s, 0.03 * s, -40)
    _blatt(d, cx, cy + 0.42 * s, 0.09 * s, 0.05 * s, 180)
    # Punkte entlang der Kontur
    for t in (0.18, 0.34, 0.5, 0.66, 0.82):
        q = _bezier((cx, cy - 0.47 * s), (cx - 0.22 * s, cy - 0.30 * s), (cx - 0.33 * s, cy + 0.10 * s),
                    (cx, cy + 0.47 * s), 100)[int(t * 100)]
        x, y = _p(q[0] + 0.012 * s, q[1])
        rr = 0.006 * s * N
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=255)


def _aussen_links(d, cx, cy, s):
    """Aeussere Akanthusranken links vom Medaillon (werden gespiegelt): grosses geschwungenes Blatt an der Taille,
    S-Ranken nach oben und unten zu den Rosetten, Blaettchen und Spiralen, damit die Flaeche dicht wird wie Damast."""
    # S-Ranke oben: von der Taille zur Rosette oben links
    r = _bezier((cx - 0.31 * s, cy - 0.02 * s), (cx - 0.46 * s, cy - 0.10 * s), (cx - 0.36 * s, cy - 0.40 * s),
                (cx - 0.50 * s, cy - 0.52 * s))
    _strich(d, r, 0.009)
    for k, a in ((10, -120), (20, -40), (30, -110)):
        _blatt(d, r[k][0] - 0.03 * s, r[k][1], 0.085 * s, 0.032 * s, a)
    _spirale(d, cx - 0.40 * s, cy - 0.30 * s, 0.045 * s, 1.25, 0, -1, 0.006)
    # S-Ranke unten
    r = _bezier((cx - 0.31 * s, cy + 0.10 * s), (cx - 0.47 * s, cy + 0.16 * s), (cx - 0.36 * s, cy + 0.44 * s),
                (cx - 0.50 * s, cy + 0.52 * s))
    _strich(d, r, 0.009)
    for k, a in ((12, -60), (24, -150), (32, -70)):
        _blatt(d, r[k][0] - 0.03 * s, r[k][1], 0.085 * s, 0.032 * s, a)
    _spirale(d, cx - 0.41 * s, cy + 0.33 * s, 0.045 * s, 1.25, 0, 1, 0.006)
    # grosses Akanthusblatt an der Taille, nach aussen gebogen (aus drei Lappen)
    for (dx, dy, l, w, a) in ((-0.42, 0.04, 0.17, 0.07, -95), (-0.40, -0.04, 0.12, 0.05, -60),
                               (-0.40, 0.12, 0.12, 0.05, -125)):
        _blatt(d, cx + dx * s, cy + dy * s, l * s, w * s, a)
    # Blumenkelch zwischen den Ranken
    for (dx, dy, a) in ((-0.47, -0.20, -20), (-0.47, 0.24, 200)):
        _blatt(d, cx + dx * s, cy + dy * s, 0.06 * s, 0.03 * s, a)


def _rosette(d, cx, cy, s):
    for a in range(0, 360, 90):
        _blatt(d, cx + math.sin(math.radians(a)) * 0.05 * s, cy - math.cos(math.radians(a)) * 0.05 * s,
               0.10 * s, 0.045 * s, a)
    for a in range(45, 360, 90):
        _blatt(d, cx + math.sin(math.radians(a)) * 0.045 * s, cy - math.cos(math.radians(a)) * 0.045 * s,
               0.07 * s, 0.025 * s, a)
    x, y = _p(cx, cy)
    rr = 0.022 * s * N
    d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=255)


def erzeugen(datei: Path = DATEI, neu: bool = False) -> Path:
    if datei.exists() and not neu:
        return datei
    from PIL import Image, ImageDraw, ImageFilter, ImageChops
    links = Image.new("L", (N, N), 0)
    d = ImageDraw.Draw(links)
    _medaillon_links(d, 0.5, 0.5, 0.86)
    _aussen_links(d, 0.5, 0.5, 0.86)
    rechts = links.transpose(Image.FLIP_LEFT_RIGHT)
    mitte = ImageChops.lighter(links.crop((0, 0, N // 2, N)).resize((N // 2, N)), Image.new("L", (N // 2, N), 0))
    bild = Image.new("L", (N, N), 0)
    bild.paste(mitte, (0, 0))
    bild.paste(rechts.crop((N // 2, 0, N, N)), (N // 2, 0))
    # Rosetten in den vier Ecken (je ein Viertel, ergibt beim Kacheln eine ganze Rosette)
    ecke = Image.new("L", (N, N), 0)
    _rosette(ImageDraw.Draw(ecke), 0.5, 0.5, 0.9)
    ecke = ecke.transform((N, N), Image.AFFINE, (1, 0, N // 2, 0, 1, N // 2), wrap=True) if False else \
        ImageChops.offset(ecke, N // 2, N // 2)
    bild = ImageChops.lighter(bild, ecke)
    bild = bild.filter(ImageFilter.GaussianBlur(2.2)).resize((1024, 1024), Image.LANCZOS)
    datei.parent.mkdir(parents=True, exist_ok=True)
    bild.save(datei)
    return datei


if __name__ == "__main__":
    print(erzeugen(neu=True))
