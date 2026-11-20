"""Innenräume aus dem Vektor-Grundriss (Stufe 6).

Ablauf je Wohnung:
1. Planseite rastern (300 dpi), Wandmaske aus grau gefüllten und farbig markierten Wänden.
2. Öffnungen finden: Lücken in Wandzügen, die ein Richtungs-Closing schließt und deren Tiefe
   höchstens einer Wandstärke entspricht. Lage in einem Außenwand-Band = Fenster, sonst Tür.
3. Wände als Quader extrudieren (Lauflängen-Rechtecke), Brüstungen und Stürze über Öffnungen,
   Kastenfenster in Fensteröffnungen, Boden- und Deckenplatte.
4. Die Hülle sitzt im lokalen Koordinatensystem des Projekts, die Außenwelt aus build_scene
   liefert Sonne und echten Ausblick. Das Bestandsgebäude (Sammlung "Objekt") wird ausgeblendet.

Plan-zu-Welt: x_lokal = (ecke_py - py) * s, y_lokal = (ecke_px - px) * s, s = Meter pro Pixel.
"""
from __future__ import annotations

import math
import shutil
import subprocess
from pathlib import Path

import numpy as np
import yaml
from PIL import Image
from scipy import ndimage

from . import meshkit as K


# ------------------------------------------------------------------ Plan lesen
def plan_pdf(project_dir: Path, P: dict) -> Path:
    """PDF-Pfad aus wohnungen.yaml: absolut oder relativ zum Projektordner (z. B. quellen/plan.pdf)."""
    p = Path(P["pdf"])
    return p if p.is_absolute() else Path(project_dir) / p


def raster_page(pdf: Path, page: int, dpi: int, cache: Path, tag: str | None = None) -> np.ndarray:
    # tag (wohnungen.yaml plaene.<x>.cache): eigener Cachename, wenn mehrere PDFs dieselbe Seitenzahl haben
    out = cache / (f"plan_{tag}_p{page}_{dpi}.png" if tag else f"plan_p{page}_{dpi}.png")
    if not out.exists():
        cache.mkdir(parents=True, exist_ok=True)
        if shutil.which("pdftoppm"):
            subprocess.run(["pdftoppm", "-r", str(dpi), "-png", "-singlefile", "-f", str(page), "-l", str(page),
                            str(pdf), str(out.with_suffix(""))], check=True)
        else:      # Mac ohne Poppler: PyMuPDF (gleiche Pixelgroesse wie pdftoppm bei gleicher dpi)
            import pymupdf
            doc = pymupdf.open(str(pdf))
            doc[page - 1].get_pixmap(matrix=pymupdf.Matrix(dpi / 72.0, dpi / 72.0), alpha=False).save(str(out))
    return np.array(Image.open(out).convert("RGB")).astype(np.int16)


def wall_mask(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    grey = (mx >= 120) & (mx <= 210) & ((mx - mn) < 25)
    sat = (mx - mn) > 60
    blue = (b > r + 40) & (b > g + 20)
    purple = (r > 90) & (b > 90) & (g < 80)
    return grey | (sat & ~blue & ~purple & (mx > 120))


def color_mask(rgb: np.ndarray, hexcol: str, tol: int = 30) -> np.ndarray:
    """Wände in einer Volltonfarbe (z. B. Verkaufspläne mit dunkelgrünen Wänden), Abstand je Kanal <= tol."""
    h = hexcol.lstrip("#")
    c = np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)])
    return np.abs(rgb - c).max(-1) <= tol


def to_cells(mask: np.ndarray, cell_px: int) -> np.ndarray:
    h, w = (mask.shape[0] // cell_px) * cell_px, (mask.shape[1] // cell_px) * cell_px
    m = mask[:h, :w].reshape(h // cell_px, cell_px, w // cell_px, cell_px).mean(axis=(1, 3))
    return m > 0.5


def run_length(a: np.ndarray, axis: int) -> np.ndarray:
    """Länge des True-Laufs, zu dem jede Zelle gehört (entlang axis)."""
    a = np.moveaxis(a, axis, -1)
    out = np.zeros(a.shape, dtype=np.int32)
    for idx in np.ndindex(a.shape[:-1]):
        row = a[idx]
        i, n = 0, len(row)
        while i < n:
            if row[i]:
                j = i
                while j < n and row[j]:
                    j += 1
                out[idx][i:j] = j - i
                i = j
            else:
                i += 1
    return np.moveaxis(out, -1, axis)


def find_openings(walls: np.ndarray, cell_m: float, max_span=1.6, max_depth=0.8, min_len=0.5):
    L = int(max_span / cell_m)
    D = int(max_depth / cell_m)
    found = []
    for axis, struct in ((1, np.ones((1, L), bool)), (0, np.ones((L, 1), bool))):
        closed = ndimage.binary_closing(walls, structure=struct)
        gap = closed & ~walls
        depth = run_length(walls | gap, 1 - axis)
        cand = gap & (depth <= D)
        lab, n = ndimage.label(cand)
        for k in range(1, n + 1):
            ys, xs = np.nonzero(lab == k)
            span = (xs.max() - xs.min() + 1) if axis == 1 else (ys.max() - ys.min() + 1)
            if span * cell_m < min_len:
                continue
            found.append({"axis": axis, "r0": ys.min(), "r1": ys.max() + 1, "c0": xs.min(), "c1": xs.max() + 1})
    return found


def rects_from_mask(m: np.ndarray):
    """Zerlegt eine Maske in Rechtecke (Zeilenläufe, vertikal zusammengefasst)."""
    rects, active = [], {}
    for r in range(m.shape[0]):
        row = m[r]
        runs, c = [], 0
        while c < len(row):
            if row[c]:
                c0 = c
                while c < len(row) and row[c]:
                    c += 1
                runs.append((c0, c))
            else:
                c += 1
        new_active = {}
        for run in runs:
            if run in active:
                new_active[run] = active.pop(run)
            else:
                new_active[run] = r
        for (c0, c1), r0 in active.items():
            rects.append((r0, r, c0, c1))
        active = new_active
    for (c0, c1), r0 in active.items():
        rects.append((r0, m.shape[0], c0, c1))
    return rects


# ------------------------------------------------------------------ Geometrie
def box_xy(mb, x0, x1, y0, y1, z0, z1, mat):
    x0, x1 = min(x0, x1), max(x0, x1)
    y0, y1 = min(y0, y1), max(y0, y1)
    P = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    mb.poly([(x, y, z1) for x, y in P], None, mat, (0, 0, 1))
    mb.poly([(x, y, z0) for x, y in P], None, mat, (0, 0, -1))
    for i in range(4):
        (ax, ay), (bx, by) = P[i], P[(i + 1) % 4]
        mb.poly([(ax, ay, z0), (bx, by, z0), (bx, by, z1), (ax, ay, z1)],
                [(0, z0), (math.hypot(bx - ax, by - ay), z0), (math.hypot(bx - ax, by - ay), z1), (0, z1)],
                mat, (by - ay, -(bx - ax), 0))


class Apartment:
    def __init__(self, cfg: dict, plan_rgb: np.ndarray, proj: dict):
        self.c = cfg
        self.proj = proj
        self.s = proj["m_per_px"]
        self.cell_px = proj.get("cell_px", 3)
        self.cell_m = self.s * self.cell_px
        x0, y0, x1, y1 = cfg["region_px"]
        self.ox, self.oy = x0, y0
        sub = wall_mask(plan_rgb[y0:y1, x0:x1]) if not proj.get("wand_farbe") else \
            color_mask(plan_rgb[y0:y1, x0:x1], proj["wand_farbe"], proj.get("wand_toleranz", 30))
        for sx0, sy0, sx1, sy1 in cfg.get("solid_px", []):
            sub[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = True
        for sx0, sy0, sx1, sy1 in cfg.get("clear_px", []):
            sub[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = False
        cells = to_cells(sub, self.cell_px)
        cells = ndimage.binary_opening(cells, structure=np.ones((2, 2), bool))
        lab, n = ndimage.label(cells)
        sizes = ndimage.sum(cells, lab, range(1, n + 1))
        keep = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz * self.cell_m ** 2 >= 0.03])
        self.walls = keep
        self.openings = find_openings(self.walls, self.cell_m, max_span=cfg.get("oeffnung_max_m", 1.6))
        # oeffnungen_px: Oeffnungen von Hand (Planpixel), wenn die Lueckensuche sie nicht findet
        for o in cfg.get("oeffnungen_px", []):
            ox0, oy0, ox1, oy1 = o["px"]
            self.openings.append({"axis": 1 if (ox1 - ox0) >= (oy1 - oy0) else 0, "type": o.get("type", "fenster"),
                                  "r0": (oy0 - y0) // self.cell_px, "r1": (oy1 - y0) // self.cell_px,
                                  "c0": (ox0 - x0) // self.cell_px, "c1": (ox1 - x0) // self.cell_px})
        # Ausschnitt schliessen: Randwand, Fenster- und Türöffnungen bleiben frei
        b = max(2, int(0.06 / self.cell_m))
        if not cfg.get("rand_offen"):    # optional: keine Randwand am Ausschnitt (Plan zeigt die Aussenwaende vollstaendig)
            self.walls[:b, :] = True
            self.walls[-b:, :] = True
            self.walls[:, :b] = True
            self.walls[:, -b:] = True
        H, W = self.walls.shape
        m = b + int(0.6 / self.cell_m)   # Öffnungen nahe am Rand bis zum Rand freihalten (Fenster in der Außenwand)
        for op in self.openings:
            r0, r1, c0, c1 = op["r0"], op["r1"], op["c0"], op["c1"]
            r0 = 0 if r0 <= m else r0
            r1 = H if r1 >= H - m else r1
            c0 = 0 if c0 <= m else c0
            c1 = W if c1 >= W - m else c1
            self.walls[r0:r1, c0:c1] = False

    # Planpixel der Zelle -> lokale Weltkoordinaten
    def cell_xy(self, r, c):
        px = self.ox + c * self.cell_px
        py = self.oy + r * self.cell_px
        return self._raw(px, py)

    def _raw(self, px, py):
        ex, ey = self.proj["corner_px"]
        return ((ey - py) * self.s, (ex - px) * self.s)

    def _dreh(self, x, y):
        """Optional: Plan gegen das lokale System gedreht (drehung_grad) und verschoben (ursprung_lokal)."""
        a = math.radians(self.proj.get("drehung_grad", 0.0))
        ox, oy = self.proj.get("ursprung_lokal", (0.0, 0.0))
        return (ox + x * math.cos(a) - y * math.sin(a), oy + x * math.sin(a) + y * math.cos(a))

    def px_to_local(self, px, py):
        return self._dreh(*self._raw(px, py))

    def transform(self, mbs):
        """Gebaute Hülle (im Plansystem) ins lokale System drehen; ohne drehung_grad/ursprung_lokal unverändert."""
        if not (self.proj.get("drehung_grad") or self.proj.get("ursprung_lokal")):
            return
        for mb in mbs:
            mb.verts = [(*self._dreh(x, y), z) for x, y, z in mb.verts]

    def classify(self, op):
        if op.get("type"):
            return op["type"]
        cy = self.oy + (op["r0"] + op["r1"]) / 2 * self.cell_px
        cx = self.ox + (op["c0"] + op["c1"]) / 2 * self.cell_px
        for band in self.c.get("bands", []):
            x0, y0, x1, y1 = band["px"]
            if x0 <= cx <= x1 and y0 <= cy <= y1:
                return band["type"]
        return "tuer"

    def build(self, mb_wall, mb_frame, mb_glass):
        z0 = self.c["floor_z"]
        h = self.c["height"]
        z1 = z0 + h
        for (r0, r1, c0, c1) in rects_from_mask(self.walls):
            xa, ya = self.cell_xy(r0, c0)
            xb, yb = self.cell_xy(r1, c1)
            box_xy(mb_wall, xa, xb, ya, yb, z0, z1, "innen_wand")
        win = self.c.get("window", {"sill": 0.92, "top": 2.93})
        self.modern = self.c.get("fenster_stil") == "modern"
        stats = {"fenster": 0, "tuer": 0, "glastuer": 0}
        for op in self.openings:
            kind = self.classify(op)
            stats[kind] = stats.get(kind, 0) + 1
            xa, ya = self.cell_xy(op["r0"], op["c0"])
            xb, yb = self.cell_xy(op["r1"], op["c1"])
            if kind == "tuer":
                box_xy(mb_wall, xa, xb, ya, yb, z0 + 2.2, z1, "innen_wand")
                continue
            sill = 0.0 if kind == "glastuer" else win["sill"]
            top = win["top"] if kind == "fenster" else min(win["top"], 2.6)
            if sill > 0:
                box_xy(mb_wall, xa, xb, ya, yb, z0, z0 + sill, "innen_wand")
                # Fensterbrett innen
                box_xy(mb_frame, xa, xb, ya, yb, z0 + sill - 0.03, z0 + sill, "fensterbrett")
            box_xy(mb_wall, xa, xb, ya, yb, z0 + top, z1, "innen_wand")
            self._window(mb_frame, mb_glass, xa, xb, ya, yb, z0 + sill, z0 + top, kind)
        self.einbauten_px(mb_wall, mb_glass)
        return stats

    def einbauten_px(self, mw, mg):
        """Optional (wohnungen.yaml, Runde 7 Noma): Grossmoebel als Platzhalter in Planpixeln, damit Higgsfield Kueche,
        Tisch und Sofa nicht an andere Waende verschiebt (REGELN R1). einbauten: [{px: [x0, y0, x1, y1], z, mat}],
        zylinder: [{c_px: [x, y], r (m), z, mat}]. Gleiche Felder wie bei ManualApartment, nur Lage in Planpixeln."""
        conv = {"floor_z": self.c["floor_z"], "einbauten": [], "zylinder": []}
        for e in self.c.get("einbauten", []):
            if "px" not in e:
                continue
            (xa, ya), (xb, yb) = self._raw(*e["px"][:2]), self._raw(*e["px"][2:])
            conv["einbauten"].append(dict(e, rect=[min(xa, xb), min(ya, yb), max(xa, xb), max(ya, yb)]))
        for c in self.c.get("zylinder", []):
            if "c_px" in c:
                conv["zylinder"].append(dict(c, c=list(self._raw(*c["c_px"]))))
        if conv["einbauten"] or conv["zylinder"]:
            ManualApartment(conv).einbauten(mw, mg)

    def _window(self, mf, mg, xa, xb, ya, yb, za, zb, kind):
        """Kastenfenster: äußere und innere Ebene, je Rahmen, Mittelstulp, Kämpfer, Glas."""
        x0, x1, y0, y1 = min(xa, xb), max(xa, xb), min(ya, yb), max(ya, yb)
        along_x = (x1 - x0) >= (y1 - y0)
        planes = (0.25, 0.8) if kind == "fenster" else (0.5,)
        if getattr(self, "modern", False) or self.c.get("fenster_stil") == "modern":
            planes = (0.6,)              # Neubau: eine Ebene, Kunststoff-Alu, kein Kämpfer
        ft = 0.07
        for t in planes:
            if along_x:
                yc = y0 + (y1 - y0) * t
                f = lambda u0, u1, v0, v1, mat: box_xy(mf, x0 + u0, x0 + u1, yc - 0.03, yc + 0.03, za + v0, za + v1, mat)
                L = x1 - x0
                g = [(x0 + ft, yc, za + ft), (x1 - ft, yc, za + ft), (x1 - ft, yc, zb - ft), (x0 + ft, yc, zb - ft)]
                n = (0, 1, 0)
            else:
                xc = x0 + (x1 - x0) * t
                f = lambda u0, u1, v0, v1, mat: box_xy(mf, xc - 0.03, xc + 0.03, y0 + u0, y0 + u1, za + v0, za + v1, mat)
                L = y1 - y0
                g = [(xc, y0 + ft, za + ft), (xc, y1 - ft, za + ft), (xc, y1 - ft, zb - ft), (xc, y0 + ft, zb - ft)]
                n = (1, 0, 0)
            H = zb - za
            f(0, L, 0, ft, "fenster")
            f(0, L, H - ft, H, "fenster")
            f(0, ft, 0, H, "fenster")
            f(L - ft, L, 0, H, "fenster")
            if not (self.c.get("fenster_stil") == "modern" and L < 1.2):
                f(L / 2 - 0.035, L / 2 + 0.035, 0, H, "fenster")
            if kind == "fenster" and H > 1.5 and self.c.get("fenster_stil") != "modern":
                f(0, L, H - 0.55, H - 0.55 + ft, "fenster")
            mg.poly(g, None, "glas", n)

    def slabs(self, mb):
        # slab_px: Boden/Decke nur ueber der Wohnung, wenn region_px fuer die Oeffnungssuche groesser gewaehlt ist
        x0, y0, x1, y1 = self.c.get("slab_px", self.c["region_px"])
        xa, ya = self._raw(x0, y0)
        xb, yb = self._raw(x1, y1)
        z0 = self.c["floor_z"]
        box_xy(mb, xa, xb, ya, yb, z0 - 0.3, z0, "boden_parkett")
        box_xy(mb, xa, xb, ya, yb, z0 + self.c["height"], z0 + self.c["height"] + 0.3, "decke")



# ------------------------------------------------------------------ Wohnungen ohne Vektorplan (aus der Dachkubatur)
class ManualApartment:
    """Raumhülle aus lokalen Koordinaten: Wände mit Öffnungen, Schrägen, Terrasse, Geländer."""

    def __init__(self, cfg):
        self.c = cfg

    def build(self, mw, mf, mg):
        z0 = self.c["floor_z"]
        z1 = z0 + self.c["height"]
        n = 0
        z1_room = z1
        for w in self.c["walls"]:
            z1 = z0 + w["h"] if "h" in w else z1_room
            x0, y0, x1, y1 = w["rect"]
            along_y = (y1 - y0) >= (x1 - x0)
            a, b = (y0, y1) if along_y else (x0, x1)
            ops = sorted(w.get("openings", []), key=lambda o: o["span"][0])
            cuts = [a] + [v for o in ops for v in o["span"]] + [b]
            # volle Pfeiler zwischen Öffnungen
            for i in range(0, len(cuts), 2):
                s0, s1 = cuts[i], cuts[i + 1]
                if s1 - s0 > 1e-3:
                    if along_y:
                        box_xy(mw, x0, x1, s0, s1, z0, z1, "innen_wand")
                    else:
                        box_xy(mw, s0, s1, y0, y1, z0, z1, "innen_wand")
            for o in ops:
                s0, s1 = o["span"]
                zb, zt = z0 + o.get("z", [0.0, 2.2])[0], z0 + o.get("z", [0.0, 2.2])[1]
                rect = (x0, x1, s0, s1) if along_y else (s0, s1, y0, y1)
                if zb > z0:
                    box_xy(mw, rect[0], rect[1], rect[2], rect[3], z0, zb, "innen_wand")
                box_xy(mw, rect[0], rect[1], rect[2], rect[3], zt, z1, "innen_wand")
                kind = o.get("type", "fenster")
                if kind != "tuer":
                    Apartment._window(self, mf, mg, rect[0], rect[1], rect[2], rect[3], zb, zt, kind)
                n += 1
        for sl in self.c.get("slopes", []):
            (xa, xb), (ya, za), (yb, zb) = sl["x"], sl["from"], sl["to"]
            if sl.get("roof_windows") and sl.get("ausschneiden", True):
                # Runde 7 Noma: Schraege um die Dachflaechenfenster ausschneiden (vorher volle Flaeche, Fenster nur als
                # Glas davor, also kein Licht). Streifen entlang x, in den Fensterbreiten nur unter t0 und ueber t1.
                P = lambda x, t: (x, ya + (yb - ya) * t, za + (zb - za) * t)
                rw = sorted(sl["roof_windows"], key=lambda d: d["x"][0])
                cuts, x0 = [], xa
                for d in rw:
                    cuts.append((x0, d["x"][0], [(0.0, 1.0)]))
                    cuts.append((d["x"][0], d["x"][1], [(0.0, d["t"][0]), (d["t"][1], 1.0)]))
                    x0 = d["x"][1]
                cuts.append((x0, xb, [(0.0, 1.0)]))
                for u0, u1, ts in cuts:
                    for t0, t1 in ts:
                        if u1 - u0 > 1e-3 and t1 - t0 > 1e-3:
                            mw.poly([P(u0, t0), P(u1, t0), P(u1, t1), P(u0, t1)], None, "decke", (0, 1, -1))
            else:
                mw.poly([(xa, ya, za), (xb, ya, za), (xb, yb, zb), (xa, yb, zb)], None, "decke", (0, 1, -1))
            for dff in sl.get("roof_windows", []):
                u0, u1 = dff["x"]
                t0, t1 = dff["t"]
                pa = (ya + (yb - ya) * t0, za + (zb - za) * t0)
                pb = (ya + (yb - ya) * t1, za + (zb - za) * t1)
                mg.poly([(u0, pa[0] - 0.01, pa[1] - 0.01), (u1, pa[0] - 0.01, pa[1] - 0.01),
                         (u1, pb[0] - 0.01, pb[1] - 0.01), (u0, pb[0] - 0.01, pb[1] - 0.01)], None, "glas", (0, 1, -1))
                for (q0, q1) in ((u0 - 0.06, u0), (u1, u1 + 0.06)):
                    mf.poly([(q0, pa[0] - 0.02, pa[1] - 0.02), (q1, pa[0] - 0.02, pa[1] - 0.02),
                             (q1, pb[0] - 0.02, pb[1] - 0.02), (q0, pb[0] - 0.02, pb[1] - 0.02)], None, "fenster", (0, 1, -1))
        for t in self.c.get("terrace", []):
            x0, y0, x1, y1 = t["rect"]
            box_xy(mw, x0, x1, y0, y1, z0 - 0.3, z0 - 0.02, "terrasse_holz")
        for r in self.c.get("railings", []):
            x0, y0, x1, y1 = r["rect"]
            h = r.get("h", 1.10)
            if r.get("typ") == "stab":      # Stabgelaender: Handlauf, Fussholm, Staebe 12 cm
                box_xy(mf, x0 - 0.01, x1 + 0.01, y0 - 0.01, y1 + 0.01, z0 + h - 0.05, z0 + h, "rahmen_dunkel")
                box_xy(mf, x0, x1, y0, y1, z0 + 0.06, z0 + 0.10, "rahmen_dunkel")
                lang_x = (x1 - x0) >= (y1 - y0)
                L = (x1 - x0) if lang_x else (y1 - y0)
                n = max(1, int(L / 0.12))
                for k in range(n + 1):
                    t = 0.03 + (L - 0.06) * k / n
                    if lang_x:
                        box_xy(mf, x0 + t - 0.01, x0 + t + 0.01, y0, y1, z0 + 0.06, z0 + h - 0.05, "rahmen_dunkel")
                    else:
                        box_xy(mf, x0, x1, y0 + t - 0.01, y0 + t + 0.01, z0 + 0.06, z0 + h - 0.05, "rahmen_dunkel")
                continue
            box_xy(mg, x0, x1, y0, y1, z0, z0 + h - 0.02, "glas")
            box_xy(mf, x0 - 0.01, x1 + 0.01, y0 - 0.01, y1 + 0.01, z0 + h - 0.04, z0 + h, "rahmen_dunkel")
        self.einbauten(mw, mg)
        return {"oeffnungen": n}

    def einbauten(self, mw, mg):
        """Optional (wohnungen.yaml): feste Einbauten und Möbel als Platzhalter, damit Lage und Größe in der
        Vorschau gesperrt sind. einbauten: [{rect: [x0, y0, x1, y1], z: [z0, z1] ueber FOK, mat}],
        zylinder: [{c: [x, y], r, z: [z0, z1], mat, seg}], boegen: [{c, r: [ri, ro], winkel: [a0, a1], z, mat}].
        Material "glas" landet im Glasobjekt."""
        z0 = self.c["floor_z"]
        for e in self.c.get("einbauten", []):
            x0, y0, x1, y1 = e["rect"]
            za, zb = e.get("z", [0.0, 0.9])
            mat = e.get("mat", "innen_wand")
            box_xy(mg if mat == "glas" else mw, x0, x1, y0, y1, z0 + za, z0 + zb, mat)
        for c in self.c.get("zylinder", []):
            cx, cy = c["c"]
            r, seg = c["r"], c.get("seg", 24)
            za, zb = z0 + c.get("z", [0.0, 0.75])[0], z0 + c.get("z", [0.0, 0.75])[1]
            mat = c.get("mat", "innen_wand")
            pts = [(cx + r * math.cos(2 * math.pi * k / seg), cy + r * math.sin(2 * math.pi * k / seg)) for k in range(seg)]
            mw.poly([(x, y, zb) for x, y in pts], None, mat, (0, 0, 1))
            mw.poly([(x, y, za) for x, y in pts], None, mat, (0, 0, -1))
            for k in range(seg):
                (ax, ay), (bx, by) = pts[k], pts[(k + 1) % seg]
                mw.poly([(ax, ay, za), (bx, by, za), (bx, by, zb), (ax, ay, zb)], None, mat,
                        ((ax + bx) / 2 - cx, (ay + by) / 2 - cy, 0))
        for b in self.c.get("boegen", []):
            self._bogen(mg if b.get("mat") == "glas" else mw, b, z0)

    @staticmethod
    def _bogen(mb, b, z0):
        """Optional (wohnungen.yaml boegen): Kreisringsektor als echter Bogen, z. B. gerundete Wandecke.
        {c: [x, y], r: [r_innen, r_aussen], winkel: [a0, a1] in Grad (0 = +x, 90 = +y), z: [z0, z1], mat, seg}.
        Enden offen (schließen an gerade Wandstücke an), mit kappen: true geschlossen."""
        cx, cy = b["c"]
        ri, ro = b["r"]
        a0, a1 = (math.radians(v) for v in b.get("winkel", [0, 90]))
        seg = b.get("seg", max(8, int(abs(a1 - a0) / math.radians(4))))
        za, zb = z0 + b.get("z", [0.0, 2.5])[0], z0 + b.get("z", [0.0, 2.5])[1]
        mat = b.get("mat", "innen_wand")
        ang = [a0 + (a1 - a0) * k / seg for k in range(seg + 1)]
        P = lambda r, a: (cx + r * math.cos(a), cy + r * math.sin(a))
        for t0, t1 in zip(ang[:-1], ang[1:]):
            tm = (t0 + t1) / 2
            (i0, i1), (o0, o1) = (P(ri, t0), P(ri, t1)), (P(ro, t0), P(ro, t1))
            ring = [i0, o0, o1, i1]
            mb.poly([(x, y, zb) for x, y in ring], None, mat, (0, 0, 1))
            mb.poly([(x, y, za) for x, y in ring], None, mat, (0, 0, -1))
            L0, L1 = ro * t0, ro * t1      # Abwicklung als UV, damit Holz und Putz nicht verzerren
            mb.poly([(*o0, za), (*o1, za), (*o1, zb), (*o0, zb)], [(L0, za), (L1, za), (L1, zb), (L0, zb)],
                    mat, (math.cos(tm), math.sin(tm), 0))
            mb.poly([(*i0, za), (*i1, za), (*i1, zb), (*i0, zb)], [(ri * t0, za), (ri * t1, za), (ri * t1, zb), (ri * t0, zb)],
                    mat, (-math.cos(tm), -math.sin(tm), 0))
        if b.get("kappen"):
            for a, s in ((a0, -1), (a1, 1)):
                (ix, iy), (ox, oy) = P(ri, a), P(ro, a)
                n = (-math.sin(a) * s * (1 if a1 > a0 else -1), math.cos(a) * s * (1 if a1 > a0 else -1), 0)
                mb.poly([(ix, iy, za), (ox, oy, za), (ox, oy, zb), (ix, iy, zb)], None, mat, n)

    def _dreh(self, x, y):
        """Optional: Hülle in eigenen Koordinaten (z. B. Maße aus einem Möblierungsplan), gedreht um drehung_grad
        und verschoben um ursprung_lokal. Ohne die Schlüssel unverändert."""
        a = math.radians(self.c.get("drehung_grad", 0.0))
        ox, oy = self.c.get("ursprung_lokal", (0.0, 0.0))
        return (ox + x * math.cos(a) - y * math.sin(a), oy + x * math.sin(a) + y * math.cos(a))

    def transform(self, mbs):
        if not (self.c.get("drehung_grad") or self.c.get("ursprung_lokal")):
            return
        for mb in mbs:
            mb.verts = [(*self._dreh(x, y), z) for x, y, z in mb.verts]

    def slabs(self, mb):
        z0 = self.c["floor_z"]
        for x0, y0, x1, y1 in (self.c.get("slab_rects") or [self.c["slab_rect"]]):   # mehrere Rechtecke fuer L-Formen
            box_xy(mb, x0, x1, y0, y1, z0 - 0.3, z0, "boden_parkett")
            box_xy(mb, x0, x1, y0, y1, z0 + self.c["height"], z0 + self.c["height"] + 0.3, "decke")

    def px_to_local(self, x, y):
        return self._dreh(x, y)


# ------------------------------------------------------------------ Szene
def build_materials(bpy, mats):
    from . import materials as M
    mats["innen_wand"] = M.plaster(bpy, "innen_wand", (0.82, 0.8, 0.76), var=0.03, bump=0.05)
    mats["decke"] = M.plaster(bpy, "decke", (0.85, 0.84, 0.81), var=0.02, bump=0.03)
    mats["boden_parkett"] = M.oak(bpy, "boden_parkett", (0.42, 0.28, 0.16))
    mats["fensterbrett"] = M.simple(bpy, "fensterbrett", (0.8, 0.79, 0.75), 0.3)
    mats["terrasse_holz"] = M.oak(bpy, "terrasse_holz", (0.3, 0.22, 0.15))
    return mats


def build_custom_materials(bpy, mats, spec: dict | None):
    """Optional (wohnungen.yaml materialien): {name: {farbe: "#hex", art: eiche|putz|glas|einfach, rauh, metall,
    leuchten: Stärke}} für Einbauten, Wand- und Deckenfarben einzelner Wohnungen."""
    from . import materials as M
    for name, s in (spec or {}).items():
        rgb = M.hex_rgb(s.get("farbe", "#cccccc"))
        art = s.get("art", "einfach")
        if art == "eiche":
            mats[name] = M.oak(bpy, name, rgb)
        elif art == "putz":
            mats[name] = M.plaster(bpy, name, rgb, var=0.03, bump=0.05)
        elif art == "glas":
            mats[name] = M.glass(bpy, name, rgb, s.get("rauh", 0.0))
        elif s.get("leuchten"):
            mats[name] = M.simple(bpy, name, rgb, s.get("rauh", 0.5), **{"Emission Color": (*rgb, 1.0),
                                                                         "Emission Strength": float(s["leuchten"])})
        else:
            mats[name] = M.simple(bpy, name, rgb, s.get("rauh", 0.5), s.get("metall", 0.0))
    return mats


def add_lamps(bpy, coll, apt, a: dict):
    """Optional (wohnungen.yaml leuchten): [{pos: [x, y, z ueber FOK], w: Watt, farbe, r: Radius}] als Punktlichter."""
    from . import materials as M
    obs = []
    for i, L in enumerate(a.get("leuchten", [])):
        x, y = apt.px_to_local(*L["pos"][:2])
        ld = bpy.data.lights.new(f"lampe_{i}", "POINT")
        ld.energy = L.get("w", 40)
        ld.color = M.hex_rgb(L.get("farbe", "#FFC98A"))
        ld.shadow_soft_size = L.get("r", 0.08)
        ob = bpy.data.objects.new(f"lampe_{i}", ld)
        ob.location = (x, y, a["floor_z"] + L["pos"][2])
        coll.objects.link(ob)
        obs.append(ob)
    return obs


def render_apartments(project_dir: Path, names: list[str], preview: bool = True, cams: list[str] | None = None,
                      res=None, samples: int | None = None, out_sub: str | None = None, ebenen: bool = False):
    """res, samples, out_sub ueberschreiben wohnungen.yaml (wie `render`); ebenen: Render-Ebenen und Hintergrund-
    Durchgang je Bild ueber lib/ebenen.py in <out_dir>/<wohnung>_<kamera>_<licht>_ebenen/."""
    import os
    import bpy
    from . import build as B
    from . import materials as M
    W = yaml.safe_load((project_dir / "wohnungen.yaml").read_text())
    cfg, ctx = B.load_project(project_dir)
    cfg["lights"].update(W.get("lichter", {}))   # Innenraum-Lichtstimmungen, project.yaml bleibt unverändert
    scene = B.build_scene(cfg, ctx)
    objekt = bpy.data.collections.get("Objekt")
    mats = {m.name: m for m in bpy.data.materials}
    build_materials(bpy, mats)
    build_custom_materials(bpy, mats, W.get("materialien"))
    coll = bpy.data.collections.new("Innen")
    scene.collection.children.link(coll)
    res = tuple(res) if res else (W["render"]["preview_resolution"] if preview else W["render"]["resolution"])
    B.setup_render(scene, res, samples or W["render"]["samples"])
    out_dir = project_dir / "renders" / (out_sub or "innen")
    out_dir.mkdir(parents=True, exist_ok=True)
    results = []
    plan_cache = project_dir / "data" / "plan_cache"
    for name in names:
        a = W["wohnungen"][name]
        if objekt:
            keep = set(a.get("objekt_sichtbar", []))
            objekt.hide_render = False
            aus = tuple(a.get("objekt_ausblenden", []))
            for o in objekt.objects:
                # objekt_ausblenden (Präfixe): alles andere bleibt sichtbar, z. B. Nachbartrakte im Ausblick
                o.hide_render = o.name.startswith(aus) if aus else o.name not in keep
        if a.get("plan") == "manuell":
            apt = ManualApartment(a)
        else:
            P = W["plaene"][a["plan"]]
            rgb = raster_page(plan_pdf(project_dir, P), P["page"], P["dpi"], plan_cache, P.get("cache"))
            apt = Apartment(a, rgb, P)
        mw = K.MeshBuilder(f"{name}_waende", ["innen_wand"])
        mf = K.MeshBuilder(f"{name}_rahmen", ["fenster"])
        mg = K.MeshBuilder(f"{name}_glas", ["glas"])
        stats = apt.build(mw, mf, mg)
        apt.slabs(mw)
        if hasattr(apt, "transform"):
            apt.transform((mw, mf, mg))
        ersatz = a.get("material_ersatz") or {}      # optional: z. B. {innen_wand: creme, decke: bordeaux}
        if ersatz:
            for mb in (mw, mf, mg):
                mb.materials = [ersatz.get(m, m) for m in mb.materials]
        objs = [mb.to_object(bpy, mats, coll) for mb in (mw, mf, mg)]
        objs += add_lamps(bpy, coll, apt, a)
        if ebenen:      # Pass-Indizes erst jetzt, wenn die Innenraeume dieser Wohnung in der Szene stehen
            from . import ebenen as EB
            eb_meta = EB.vorbereiten(scene)
        for cam_name, cam in a["kameras"].items():
            if cams and f"{name}_{cam_name}" not in cams:
                continue
            px, py = cam.get("pos_px") or cam["pos"]
            tx, ty = cam.get("target_px") or cam["target"]
            x, y = apt.px_to_local(px, py)
            X, Y = apt.px_to_local(tx, ty)
            z = a["floor_z"] + cam.get("h", 1.45)
            cfg["cameras"][f"{name}_{cam_name}"] = {"pos": [x, y, z], "target": [X, Y, z + cam.get("dz", 0.0)],
                                                     "lens": cam.get("lens", 24), "vertical": True}
            lname = cam.get("light", a.get("light", "golden_hour"))
            B.setup_light(scene, cfg, ctx, lname)
            scene.view_settings.exposure = cam.get("exposure", a.get("exposure", 2.0))
            B.setup_camera(scene, cfg, f"{name}_{cam_name}")
            tag = "vorschau" if preview else "final"
            path = out_dir / (f"{name}_{cam_name}_{tag}.png" if out_sub else f"{name}_{cam_name}_vorschau.png")
            scene.render.filepath = str(path)
            bpy.ops.render.render(write_still=True)
            results.append({"file": str(path), "wohnung": name, "kamera": cam_name, "licht": lname,
                            "oeffnungen": stats, "resolution": list(res), "device": scene.cycles.device})
            if ebenen:
                cn = f"{name}_{cam_name}"
                eb = EB.schreiben(scene, eb_meta, out_dir / f"{cn}_{lname}_ebenen", cfg, cn, lname, str(path))
                results[-1]["ebenen"] = {"ordner": eb["ordner"], "schutz_anteil_prozent": eb["schutz_anteil_prozent"],
                                         "sekunden": eb["sekunden"], "nicht_zugeordnet": eb["nicht_zugeordnet"][:5]}
                if os.environ.get("IMMOVIZ_HINTERGRUND", "").lower() not in ("aus", "0", "nein", "false"):
                    results[-1]["ebenen"]["hintergrund"] = EB.hintergrund(scene, eb_meta, Path(eb["ordner"]), cfg, cn, lname)
        for o in objs:
            o.hide_render = True
    return results


def debug_plan(project_dir: Path, name: str, out: Path):
    """Kontrollbild: Wände schwarz, Fenster blau, Glastüren grün, Türen rot."""
    W = yaml.safe_load((project_dir / "wohnungen.yaml").read_text())
    a = W["wohnungen"][name]
    P = W["plaene"][a["plan"]]
    rgb = raster_page(plan_pdf(project_dir, P), P["page"], P["dpi"], project_dir / "data" / "plan_cache", P.get("cache"))
    apt = Apartment(a, rgb, P)
    img = np.full(apt.walls.shape + (3,), 255, np.uint8)
    img[apt.walls] = (0, 0, 0)
    col = {"fenster": (40, 90, 255), "glastuer": (0, 170, 60), "tuer": (230, 40, 40)}
    for op in apt.openings:
        img[op["r0"]:op["r1"], op["c0"]:op["c1"]] = col[apt.classify(op)]
    Image.fromarray(img).save(out)
    return {k: sum(1 for o in apt.openings if apt.classify(o) == k) for k in col}


# ======================================================================= Walkthrough (Kamerafahrt durch eine Wohnung)
def render_walkthrough(project_dir: Path, name: str, stills: bool = True, anim: bool = False,
                       fps: int = 12, anim_res=(640, 360), anim_samples: int = 12):
    """Kamerapfad aus wohnungen.yaml (<wohnung>.walkthrough): Wegpunkte auf Augenhöhe.
    stills: je Wegpunkt ein Standbild (Grundlage für die Veredelung, später Keyframes im Videomodell).
    anim:   Clay-Fahrt in niedriger Auflösung als Bewegungsvorlage (MP4)."""
    import subprocess
    import bpy
    from . import build as B
    W = yaml.safe_load((project_dir / "wohnungen.yaml").read_text())
    cfg, ctx = B.load_project(project_dir)
    cfg["lights"].update(W.get("lichter", {}))
    a = W["wohnungen"][name]
    wt = a["walkthrough"]
    scene = B.build_scene(cfg, ctx)
    objekt = bpy.data.collections.get("Objekt")
    mats = {m.name: m for m in bpy.data.materials}
    build_materials(bpy, mats)
    coll = bpy.data.collections.new("Innen")
    scene.collection.children.link(coll)
    if objekt:
        keep = set(a.get("objekt_sichtbar", []))
        aus = tuple(a.get("objekt_ausblenden", []))
        for o in objekt.objects:
            o.hide_render = o.name.startswith(aus) if aus else o.name not in keep
    apt = ManualApartment(a) if a.get("plan") == "manuell" else None
    if apt is None:
        P = W["plaene"][a["plan"]]
        apt = Apartment(a, raster_page(plan_pdf(project_dir, P), P["page"], P["dpi"], project_dir / "data" / "plan_cache", P.get("cache")), P)
    mw = K.MeshBuilder(f"{name}_waende", ["innen_wand"])
    mf = K.MeshBuilder(f"{name}_rahmen", ["fenster"])
    mg = K.MeshBuilder(f"{name}_glas", ["glas"])
    apt.build(mw, mf, mg)
    apt.slabs(mw)
    if hasattr(apt, "transform"):
        apt.transform((mw, mf, mg))
    for mb in (mw, mf, mg):
        mb.to_object(bpy, mats, coll)
    B.setup_light(scene, cfg, ctx, wt.get("light", a.get("light", "golden_hour")))
    scene.view_settings.exposure = wt.get("exposure", a.get("exposure", 1.4))

    cam = bpy.data.cameras.new("walk")
    cam.sensor_width = 36
    cam.clip_end = 2000
    ob = bpy.data.objects.new("walk", cam)
    scene.collection.objects.link(ob)
    scene.camera = ob
    keys, yaw_prev = [], None
    for k in wt["punkte"]:
        x, y = apt.px_to_local(*k["pos"])
        X, Y = apt.px_to_local(*k["target"])
        z = a["floor_z"] + k.get("h", 1.5)
        yaw = math.atan2(-(X - x), (Y - y))
        if yaw_prev is not None:      # Drehrichtung stetig halten
            while yaw - yaw_prev > math.pi:
                yaw -= 2 * math.pi
            while yaw - yaw_prev < -math.pi:
                yaw += 2 * math.pi
        yaw_prev = yaw
        keys.append({"loc": (x, y, z), "yaw": yaw, "lens": k.get("lens", wt.get("lens", 24)), "t": k.get("t")})
    out_dir = project_dir / "renders" / "walkthrough" / name
    out_dir.mkdir(parents=True, exist_ok=True)
    results = {"stills": [], "anim": None}
    if stills:
        B.setup_render(scene, tuple(wt.get("still_resolution", [1920, 1080])), wt.get("still_samples", 48))
        for i, k in enumerate(keys):
            ob.location = k["loc"]
            ob.rotation_euler = (math.radians(90), 0, k["yaw"])
            cam.lens = k["lens"]
            p = out_dir / f"k{i:02d}.png"
            scene.render.filepath = str(p)
            bpy.ops.render.render(write_still=True)
            results["stills"].append(str(p))
    if anim:
        secs = wt.get("sekunden", 20)
        n = len(keys)
        times = [k["t"] if k["t"] is not None else secs * i / (n - 1) for i, k in enumerate(keys)]
        for k, t in zip(keys, times):
            f = 1 + round(t * fps)
            ob.location = k["loc"]
            ob.rotation_euler = (math.radians(90), 0, k["yaw"])
            cam.lens = k["lens"]
            ob.keyframe_insert("location", frame=f)
            ob.keyframe_insert("rotation_euler", frame=f)
            cam.keyframe_insert("lens", frame=f)
        scene.frame_start, scene.frame_end = 1, 1 + round(secs * fps)
        scene.render.fps = fps
        B.setup_render(scene, tuple(anim_res), anim_samples)
        scene.render.image_settings.file_format = "PNG"
        fdir = out_dir / "clay"
        fdir.mkdir(exist_ok=True)
        scene.render.filepath = str(fdir / "f")
        bpy.ops.render.render(animation=True)
        mp4 = out_dir / f"{name}_clay.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", str(fdir / "f%04d.png"),
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", str(mp4)], check=True)
        results["anim"] = str(mp4)
    return results
