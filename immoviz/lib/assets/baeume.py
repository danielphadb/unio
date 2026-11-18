"""Baumbibliothek: natuerliche Kronen aus Stamm, Haupt- und Nebenaesten, Zweigen und Blaettern.

Lage, Hoehe und Kronendurchmesser kommen unveraendert aus dem Baumkataster bzw. `trees_override` (lib/trees.py,
apply_override). Neu ist nur die Gestalt:

- Arten: linde, ahorn, platane, kastanie, saeule (Saeulenformen, z. B. Hainbuche 'Fastigiata'); die Art folgt aus dem
  Katasternamen (Tilia, Acer, Platanus, Aesculus, ...) oder aus `art` in trees_override, Saeulenform wie bisher aus
  `form`/Sortenname.
- Verzweigung: Leittrieb, Gerueststaemme nach Art (Winkel, Anzahl), Nebenaeste und Zweige wachsen bis an eine
  Kronenhuelle der Art (oval, rund, breit, Kuppel, Saeule) mit leicht gelapptem Rand. Die Blaetter sitzen in Bueschen an
  den Zweigen (echte kleine Blattflaechen in der Umrissform der Art, keine Transparenz), dazwischen bleiben Luecken.
- Jahreszeiten: Blattfarbe je Blatt aus einer Rampe je Art (Fruehling, Sommer, Spaetsommer, Herbst mit Gelb, Orange,
  Rot, Braun), im Herbst fallen 30 % der Blaetter, im Winter ist der Baum kahl (Objekte `baeume_kronen_*` ausgeblendet,
  Zweige bleiben). Gesteuert ueber materials.set_season.
- Vorlagen: je Art drei Varianten in typischer Groesse (Meter), jeder Baum ist eine skalierte, gedrehte Instanz.
  Stamm bis zum Kronenansatz je Baum einzeln (genaue Kronenansatzhoehe `base`).
"""
from __future__ import annotations

import math
import random

import bpy

from .. import materials as M
from .. import meshkit as K
from .. import trees as T
from . import form as F

# Huelle: Kronenradius (Anteil) ueber die relative Hoehe t (0 Kronenansatz, 1 Wipfel)
def _huelle(typ, t):
    if t < 0 or t > 1:
        return 0.0
    if typ == "oval":
        return max(0.0, math.sin(math.pi * min(1.0, t ** 0.85))) ** 0.75
    if typ == "rund":
        d = (t - 0.45) / (0.45 if t < 0.45 else 0.55)
        return max(0.0, 1 - d * d) ** 0.5
    if typ == "breit":
        d = (t - 0.48) / (0.48 if t < 0.48 else 0.52)
        return max(0.0, 1 - abs(d) ** 2.6) ** 0.5
    if typ == "kuppel":
        d = (t - 0.33) / (0.33 if t < 0.33 else 0.67)
        return max(0.0, 1 - d * d) ** 0.55
    # saeule
    return max(0.0, math.sin(math.pi * (0.06 + 0.9 * t ** 0.8))) ** 0.7


def _umriss(form, n=10):
    """Blattumriss in Blattkoordinaten: x 0 (Stiel) bis 1 (Spitze), y quer (Anteil der Laenge)."""
    if form == "herz":
        return [(0.0, 0.0), (0.12, -0.38), (0.42, -0.46), (0.75, -0.30), (1.0, 0.0), (0.75, 0.30), (0.42, 0.46), (0.12, 0.38)]
    if form in ("lappig", "finger"):
        tief, k = (0.45, 0.6) if form == "lappig" else (0.75, 2.0)
        pts = []
        for i in range(n):
            th = -math.pi + 2 * math.pi * (i + 0.5) / n
            r = (1 - tief) + tief * abs(math.cos(2.5 * th)) ** k
            pts.append((0.5 + 0.5 * r * math.cos(th), 0.5 * r * math.sin(th)))
        return pts
    return [(0.0, 0.0), (0.2, -0.26), (0.6, -0.28), (1.0, 0.0), (0.6, 0.28), (0.2, 0.26)]


ARTEN = {
    "linde": {"huelle": "oval", "R": 3.6, "H": 8.0, "leit": 0.72, "aeste": 7, "winkel": (38, 62), "blatt": 0.15,
              "umriss": "herz", "rinde": (0.060, 0.052, 0.044), "dichte": 1.0,
              "farben": {"fruehling": [(0.10, 0.23, 0.03), (0.13, 0.27, 0.045), (0.08, 0.19, 0.03)],
                         "sommer": [(0.040, 0.095, 0.020), (0.058, 0.120, 0.028), (0.032, 0.078, 0.018)],
                         "spaetsommer": [(0.055, 0.095, 0.022), (0.075, 0.110, 0.028), (0.045, 0.080, 0.020)],
                         "herbst": [(0.42, 0.29, 0.035), (0.30, 0.19, 0.025), (0.11, 0.12, 0.028)]}},
    "ahorn": {"huelle": "rund", "R": 4.0, "H": 7.0, "leit": 0.5, "aeste": 6, "winkel": (32, 56), "blatt": 0.17,
              "umriss": "lappig", "rinde": (0.055, 0.050, 0.045), "dichte": 1.0,
              "farben": {"fruehling": [(0.12, 0.24, 0.035), (0.15, 0.27, 0.05), (0.09, 0.20, 0.03)],
                         "sommer": [(0.035, 0.085, 0.020), (0.052, 0.110, 0.026), (0.030, 0.070, 0.018)],
                         "spaetsommer": [(0.050, 0.090, 0.020), (0.068, 0.105, 0.025), (0.040, 0.075, 0.018)],
                         "herbst": [(0.48, 0.25, 0.02), (0.40, 0.08, 0.018), (0.34, 0.33, 0.04)]}},
    "platane": {"huelle": "breit", "R": 5.0, "H": 9.0, "leit": 0.55, "aeste": 6, "winkel": (24, 50), "blatt": 0.20,
                "umriss": "lappig", "rinde": (0.20, 0.19, 0.14), "platane": True, "dichte": 0.95,
                "farben": {"fruehling": [(0.11, 0.21, 0.04), (0.14, 0.24, 0.05), (0.09, 0.18, 0.035)],
                           "sommer": [(0.045, 0.090, 0.025), (0.060, 0.110, 0.030), (0.038, 0.075, 0.022)],
                           "spaetsommer": [(0.060, 0.090, 0.028), (0.080, 0.105, 0.032), (0.050, 0.075, 0.024)],
                           "herbst": [(0.24, 0.15, 0.05), (0.32, 0.23, 0.06), (0.11, 0.10, 0.035)]}},
    "kastanie": {"huelle": "kuppel", "R": 4.5, "H": 7.0, "leit": 0.45, "aeste": 7, "winkel": (28, 50), "blatt": 0.22,
                 "umriss": "finger", "rinde": (0.065, 0.055, 0.048), "dichte": 1.1,
                 "farben": {"fruehling": [(0.11, 0.22, 0.03), (0.14, 0.26, 0.04), (0.08, 0.18, 0.03)],
                            "sommer": [(0.032, 0.080, 0.018), (0.048, 0.100, 0.024), (0.028, 0.066, 0.016)],
                            "spaetsommer": [(0.060, 0.080, 0.020), (0.080, 0.090, 0.025), (0.045, 0.070, 0.018)],
                            "herbst": [(0.27, 0.10, 0.025), (0.36, 0.22, 0.04), (0.12, 0.10, 0.03)]}},
    "saeule": {"huelle": "saeule", "R": 1.7, "H": 8.5, "leit": 0.88, "aeste": 10, "winkel": (62, 80), "blatt": 0.11,
               "umriss": "oval", "rinde": (0.10, 0.10, 0.095), "dichte": 1.15,
               "farben": {"fruehling": [(0.10, 0.22, 0.035), (0.13, 0.26, 0.045), (0.08, 0.18, 0.03)],
                          "sommer": [(0.040, 0.092, 0.022), (0.055, 0.112, 0.028), (0.032, 0.076, 0.018)],
                          "spaetsommer": [(0.055, 0.092, 0.024), (0.072, 0.105, 0.028), (0.045, 0.080, 0.020)],
                          "herbst": [(0.36, 0.25, 0.04), (0.25, 0.15, 0.03), (0.10, 0.11, 0.03)]}},
}
VERLUST = {"herbst": 0.32, "spaetsommer": 0.0}
VARIANTEN = 3

GATTUNG = [("tilia", "linde"), ("acer", "ahorn"), ("platanus", "platane"), ("aesculus", "kastanie"),
           ("carpinus", "ahorn"), ("celtis", "ahorn"), ("ulmus", "ahorn"), ("quercus", "ahorn"), ("fraxinus", "linde"),
           ("koelreuteria", "linde"), ("sophora", "linde"), ("styphnolobium", "linde"), ("gleditsia", "linde"),
           ("robinia", "linde"), ("prunus", "linde"), ("pyrus", "linde"), ("sorbus", "linde"), ("cercis", "linde"),
           ("corylus", "linde"), ("juglans", "ahorn"), ("ginkgo", "linde"), ("thuja", "saeule"), ("taxus", "saeule")]


def art_of(tree: dict) -> str:
    if tree.get("art") in ARTEN:
        return tree["art"]
    if T.form_of(tree) == "saeule":
        return "saeule"
    s = (tree.get("species") or "").lower().split()
    gattung = s[0] if s else ""
    for k, a in GATTUNG:
        if gattung.startswith(k):
            return a
    return "ahorn"


# ------------------------------------------------------------------ Vorlage
class _Vorlage:
    def __init__(self, art, seed, mats):
        self.A = ARTEN[art]
        self.art = art
        self.rng = random.Random(seed)
        self.R, self.H = self.A["R"], self.A["H"]
        self.holz = K.MeshBuilder(f"baum_holz_{art}_{seed}", [f"rinde_{art}"])
        self.laub = K.MeshBuilder(f"baum_laub_{art}_{seed}", [f"laub_{art}"])
        self.lappen = [(self.rng.uniform(0, 6.28), self.rng.uniform(0, 6.28), self.rng.randint(3, 5)) for _ in range(2)]
        self.umriss = _umriss(self.A["umriss"])
        self.blaetter = 0
        self.astpunkte = []        # Punkte der Haupt- und Nebenaeste (Ansatz fuer Fuellzweige)
        self.r_stamm = 0.034 * self.R + 0.010 * self.H

    def env(self, x, y, z):
        """Kronenradius an der Stelle (Winkel aus x, y), gelappter Rand (+-12 %)."""
        t = z / self.H
        th = math.atan2(y, x)
        lap = 1.0
        for ph, ph2, k in self.lappen:
            lap += 0.06 * math.sin(k * th + ph) * (0.6 + 0.4 * math.sin(4 * t + ph2))
        return self.R * _huelle(self.A["huelle"], t) * lap

    def innen(self, p):
        return math.hypot(p[0], p[1]) <= self.env(*p)

    def bis_huelle(self, p, d, maxl=None):
        maxl = maxl or 2.5 * self.R + self.H
        L, step = 0.0, 0.15
        while L < maxl:
            q = (p[0] + d[0] * (L + step), p[1] + d[1] * (L + step), p[2] + d[2] * (L + step))
            if not self.innen(q):
                return L
            L += step
        return maxl

    def _richtung(self, d, winkel, rauf=0.0, raus=None):
        """d um `winkel` Grad in zufaellige Richtung kippen, dazu Zug nach oben/aussen."""
        _, u, v = F.basis(d)
        a = self.rng.uniform(0, 2 * math.pi)
        w = math.radians(winkel)
        q = [d[i] * math.cos(w) + (u[i] * math.cos(a) + v[i] * math.sin(a)) * math.sin(w) for i in range(3)]
        q[2] += rauf
        if raus:
            q[0] += raus[0]
            q[1] += raus[1]
        L = math.sqrt(sum(c * c for c in q)) or 1.0
        return (q[0] / L, q[1] / L, q[2] / L)

    def ast(self, p0, d, laenge, r0, r1, seg, stufe, rauf=0.0):
        """Ast als leicht gekruemmte Linie; Rueckgabe der Punkte."""
        n = max(2, int(laenge / 0.6) + 1) if stufe < 3 else 2
        pts, p, dd = [p0], p0, d
        for k in range(n):
            dd = self._richtung(dd, self.rng.uniform(3, 11), rauf)
            p = (p[0] + dd[0] * laenge / n, p[1] + dd[1] * laenge / n, p[2] + dd[2] * laenge / n)
            pts.append(p)
        rad = [r0 + (r1 - r0) * (k / n) ** 0.8 for k in range(n + 1)]
        F.rohr(self.holz, pts, rad, f"rinde_{self.art}", seg=seg)
        if stufe in (1, 2):
            self.astpunkte.extend(pts[1:])
        return pts

    def blattbusch(self, c, n, groesse):
        """n Blaetter um den Punkt c in einer Kugel mit Radius `groesse`, eher nach aussen und oben gerichtet."""
        L0 = self.A["blatt"]
        for _ in range(n):
            o = [self.rng.gauss(0, 1) for _ in range(3)]
            lo = math.sqrt(sum(x * x for x in o)) or 1.0
            rr = groesse * self.rng.random() ** 0.6
            q = (c[0] + o[0] / lo * rr, c[1] + o[1] / lo * rr, c[2] + o[2] / lo * rr * 0.8)
            if not self.innen((q[0] * 0.95, q[1] * 0.95, q[2])):
                continue
            aus = math.hypot(q[0], q[1]) or 1.0
            nrm = F._norm((q[0] / aus * 0.6 + self.rng.gauss(0, 0.45), q[1] / aus * 0.6 + self.rng.gauss(0, 0.45),
                           0.75 + self.rng.gauss(0, 0.4)))
            _, a, b = F.basis(nrm)
            dreh = self.rng.uniform(0, 2 * math.pi)
            ax = tuple(a[i] * math.cos(dreh) + b[i] * math.sin(dreh) for i in range(3))
            bx = tuple(-a[i] * math.sin(dreh) + b[i] * math.cos(dreh) for i in range(3))
            L = L0 * self.rng.uniform(0.7, 1.3)
            hang = self.rng.uniform(-0.25, 0.1)       # Blattspitze leicht haengend
            pts = []
            for x, y in self.umriss:
                pts.append((q[0] + (ax[0] * (x - 0.15) + bx[0] * y) * L,
                            q[1] + (ax[1] * (x - 0.15) + bx[1] * y) * L,
                            q[2] + (ax[2] * (x - 0.15) + bx[2] * y) * L + hang * x * L))
            self.laub.poly(pts, [(x, y) for x, y in self.umriss], f"laub_{self.art}",
                           attr=(self.rng.random(), self.rng.random(), 0.0))
            self.blaetter += 1

    def bauen(self):
        A, rng = self.A, self.rng
        H, R = self.H, self.R
        rs = self.r_stamm
        # Leittrieb ab knapp unter dem Kronenansatz
        leit = self.ast((0.0, 0.0, -0.4), (0.0, 0.0, 1.0), H * A["leit"] + 0.4, rs, rs * 0.3, 10, 0, rauf=0.15)
        haupt = []
        n = A["aeste"]
        for i in range(n):
            f = 0.03 + (A["leit"] - 0.12) * (i + rng.uniform(0, 0.8)) / n
            z0 = H * f
            p0 = (leit[0][0], leit[0][1], z0)
            az = i * 2.39996 + rng.uniform(-0.35, 0.35)
            el = math.radians(rng.uniform(*A["winkel"]))
            d = (math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el))
            L = self.bis_huelle(p0, d) * rng.uniform(0.72, 0.9)
            r0 = rs * (0.62 - 0.3 * i / n)
            haupt.append((self.ast(p0, d, L, r0, r0 * 0.25, 8, 1, rauf=0.04 if A["huelle"] != "breit" else -0.01), r0))
        # oben am Leittrieb ebenfalls Nebenaeste fuer den Wipfel
        haupt.append((leit, rs * 0.3))
        for pts, r0 in haupt:
            self._nebenaeste(pts, r0)
        self._fuellen(int(A["dichte"] * 130 * (self.R / 4.0) * (self.H / 8.0) ** 0.5))
        return self.holz, self.laub

    def _fuellen(self, n):
        """Fuellzweige: Punkte nahe der Kronenhuelle, je ein Zweig vom naechsten Astpunkt mit Blattbusch. Schliesst
        die groessten Luecken, ohne die Krone zur Kugel zu machen (Huelle selbst ist gelappt)."""
        rng = self.rng
        if not self.astpunkte:
            return
        for _ in range(n):
            t = rng.uniform(0.08, 0.95)
            th = rng.uniform(0, 2 * math.pi)
            z = t * self.H
            r = self.env(math.cos(th), math.sin(th), z) * rng.uniform(0.62, 0.92)
            q = (math.cos(th) * r, math.sin(th) * r, z)
            a = min(self.astpunkte, key=lambda p: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2)
            d = (q[0] - a[0], q[1] - a[1], q[2] - a[2])
            L = math.sqrt(sum(c * c for c in d))
            if L < 0.2 or L > 3.5:
                continue
            tz = self.ast(a, F._norm(d), L, 0.014, 0.004, 3, 3)
            self.blattbusch(tz[-1], int(rng.uniform(18, 28) * self.A["dichte"]), 0.4)
            self.blattbusch(tuple((tz[0][i] + tz[-1][i]) / 2 for i in range(3)), int(10 * self.A["dichte"]), 0.3)

    def _nebenaeste(self, pts, r0):
        A, rng = self.A, self.rng
        m = rng.randint(5, 8)
        for j in range(m):
            f = 0.28 + 0.7 * (j + rng.random()) / m
            k = min(len(pts) - 2, int(f * (len(pts) - 1)))
            a, b = pts[k], pts[k + 1]
            p0 = tuple(a[i] + (b[i] - a[i]) * rng.random() for i in range(3))
            dpar = F._norm(tuple(b[i] - a[i] for i in range(3)))
            aus = math.hypot(p0[0], p0[1]) or 1.0
            d = self._richtung(dpar, rng.uniform(30, 55), rauf=0.15 if A["huelle"] in ("oval", "saeule") else 0.05,
                               raus=(p0[0] / aus * 0.35, p0[1] / aus * 0.35))
            L = min(self.bis_huelle(p0, d) * rng.uniform(0.75, 0.95), 0.6 * self.R + 1.2)
            if L < 0.3:
                continue
            nb = self.ast(p0, d, L, r0 * 0.42, 0.012, 5, 2, rauf=0.05)
            self._zweige(nb)

    def _zweige(self, pts):
        A, rng = self.A, self.rng
        n = max(4, int(rng.uniform(6, 10) * A["dichte"]))
        for j in range(n):
            f = 0.25 + 0.75 * (j + rng.random()) / n
            k = min(len(pts) - 2, int(f * (len(pts) - 1)))
            a, b = pts[k], pts[k + 1]
            p0 = tuple(a[i] + (b[i] - a[i]) * rng.random() for i in range(3))
            dpar = F._norm(tuple(b[i] - a[i] for i in range(3)))
            d = self._richtung(dpar, rng.uniform(25, 60), rauf=0.1)
            L = min(self.bis_huelle(p0, d, 2.0) * 0.95, rng.uniform(0.6, 1.5))
            if L < 0.15:
                L = 0.15
            tz = self.ast(p0, d, L, 0.012, 0.004, 3, 3)
            # Blattbuesche entlang des Zweigs und an der Spitze
            nb = max(2, int(L / 0.3))
            for q in range(nb):
                t = 0.35 + 0.65 * (q + 1) / nb
                c = tuple(tz[0][i] + (tz[-1][i] - tz[0][i]) * t for i in range(3))
                self.blattbusch(c, int(rng.uniform(20, 30) * A["dichte"]), 0.28 + 0.06 * self.R / 4)
        # Buesche an der Spitze des Nebenasts
        self.blattbusch(pts[-1], int(32 * A["dichte"]), 0.4)


_CACHE: dict = {}


def _materialien(mats, art):
    A = ARTEN[art]
    if f"laub_{art}" not in mats:
        m = M.laub_art(bpy, f"laub_{art}", A["farben"]["sommer"])
        for s, cols in A["farben"].items():
            m[f"saison_{s}"] = [c for col in cols for c in col]
        for s, v in VERLUST.items():
            m[f"verlust_{s}"] = v
        mats[f"laub_{art}"] = m
    if f"rinde_{art}" not in mats:
        mats[f"rinde_{art}"] = M.rinde(bpy, f"rinde_{art}", A["rinde"], platane=A.get("platane", False))


def vorlagen(art, mats):
    if art not in _CACHE:
        _materialien(mats, art)
        out = []
        for k in range(VARIANTEN):
            v = _Vorlage(art, 1000 + 17 * k + sum(map(ord, art)), mats)
            holz, laub = v.bauen()
            out.append((holz.to_mesh(bpy, mats, smooth=True), laub.to_mesh(bpy, mats), v))
        _CACHE[art] = out
    return _CACHE[art]


def build(trees, mats, coll, terrain, radius: float, hero_poly=None):
    """Baut alle Baeume im Radius als Instanzen der Artvorlagen (Holz und Laub), Stamm bis zum Kronenansatz je Baum."""
    _CACHE.clear()
    _materialien(mats, "linde")
    sub = bpy.data.collections.new("Baumkronen")
    coll.children.link(sub)
    stamm = K.MeshBuilder("baeume_staemme", ["rinde_linde"])
    rng = random.Random(11)
    count = 0
    for t in trees:
        x, y = t["pos"]
        if math.hypot(x, y) > radius:
            continue
        if hero_poly and K.point_in_poly(x, y, hero_poly):
            continue
        H, C = float(t["height"]), float(t["crown"])
        art = art_of(t)
        if art == "saeule":
            C = max(1.8, C)
            base = t.get("base", max(1.6, H * 0.16))
        else:
            base = t.get("base", max(2.0, min(H * 0.42, H - C * 0.95)))
        base = min(base, H - 1.0)
        zg = float(t["z"]) if "z" in t else terrain(x, y)
        holz, laub, v = rng.choice(vorlagen(art, mats))
        sxy = C / 2 / v.R * rng.uniform(0.94, 1.06)
        sz = (H - base) / v.H
        rot = rng.uniform(0, 2 * math.pi)
        for me, name, ziel in ((holz, "baeume_holz", sub), (laub, f"baeume_kronen_{art}", sub)):
            ob = bpy.data.objects.new(name, me)
            ob.location = (x, y, zg + base)
            ob.scale = (sxy, sxy, sz)
            ob.rotation_euler = (0, 0, rot)
            ziel.objects.link(ob)
        # Stamm vom Boden bis zum Kronenansatz, Radius passend zum skalierten Leittrieb, mit Wurzelanlauf
        r = v.r_stamm * sxy
        F.rohr(stamm, [(x, y, zg - 0.1), (x, y, zg + 0.25), (x, y, zg + base * 0.5), (x, y, zg + base + 0.05)],
               [r * 1.45, r * 1.15, r * 1.05, r], f"rinde_{art}", seg=10)
        count += 1
    if stamm.faces:
        stamm.to_object(bpy, mats, coll, smooth=True)
    return count
