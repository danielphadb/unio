"""Wiener Strassenleuchten aus dem Leuchten-Inventar je Projekt (`strassenleuchten` in project.yaml).

Typen (parametrisch, selbst modelliert):
  seil               Seil-/Ueberspannungsleuchte: flacher runder Leuchtenkoerper (Wiener Haengeleuchte) an einem
                     Abhaenger unter dem Knoten von Querseil (Wandhaken a und b) bzw. Abspannung (Kreuzung, mehrere
                     Haken); optional Laengsseil zwischen den Leuchten eines Strangs (`strang`)
  mast_peitsche      Peitschenmast: konischer Mast, Bogen in einen Ausleger, flacher Leuchtenkopf (Hoehen 4 bis 10 m)
  mast_aufsatz       Aufsatzmast: Mast mit zylindrischem Leuchtenkopf obenauf
  wandausleger       Wandarm mit Leuchtenkopf, an der Fassade
  altwiener_laterne  Altwiener Laterne (Gussmast mit Sockel, vierseitige Laterne mit Dach), optional `wand: true`

Eintrag (lokale Koordinaten, Hoehen ueber Gelaende am Punkt, `hoehe` = Lichtpunkthoehe = Unterkante Leuchte):
  - {id: W01, typ: seil, leuchte: [x, y], hoehe: 7.3, a: [x, y, z], b: [x, y, z], strang: wimmergasse, quelle: "..."}
  - {id: K01, typ: seil, leuchte: [x, y], hoehe: 7.3, abspannung: [[x, y, z], ...], strang: [s1, s2], quelle: "..."}
  - {id: N01, typ: mast_peitsche, pos: [x, y], hoehe: 8.0, ausleger: 1.5, richtung: [dx, dy], quelle: "..."}
  - {id: H01, typ: wandausleger, pos: [x, y], hoehe: 5.5, ausleger: 1.0, richtung: [dx, dy], quelle: "..."}
Optional: leistung (W, Standard je Typ), farbe ("#RRGGBB" Gehaeuse), form (seil: teller | kegel).

Licht: Farbtemperatur 3000 K (Lichtquelle mit Blackbody-Temperatur, `farbtemperatur` je Eintrag), an bei Sonnenhoehe
unter 2 Grad oder mit `strassenlicht: an` in der Lichtstimmung (`aus` erzwingt aus). Seit 18.11.2026 (Nachtprobe,
auftraege/2026-11-18_assets_test.md: Teller ueberstrahlt, kein Lichtkegel): Leuchtkoerper mit geringer Leuchtdichte
(DIFFUSOR_AN statt 6), Lichtquelle fuer die Kamera unsichtbar, Spot nach unten mit 115 Grad Kegel und hoeherer Leistung,
damit Fahrbahn und Gehsteig sichtbar ausgeleuchtet sind. Ohne Inventar baut build.py den bisherigen Fallback aus `street.cables` mit diesen Leuchten,
`immoviz.py pruefen` warnt dann.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import bpy

from .. import meshkit as K
from . import form as F

WARMWEISS = (1.0, 0.74, 0.46)
LEISTUNG = {"seil": 1800.0, "mast_peitsche": 1800.0, "mast_aufsatz": 600.0, "wandausleger": 1000.0, "altwiener_laterne": 250.0}
KEGEL = {"seil": 115.0, "mast_peitsche": 115.0, "mast_aufsatz": 150.0, "wandausleger": 120.0}   # Spot-Oeffnung (Grad)
FARBTEMPERATUR = 3000.0       # K, Wiener LED-Strassenbeleuchtung warmweiss (2700 bis 3000 K)
DIFFUSOR_AN = 0.5             # Emissionsstaerke des Leuchtkoerpers (vorher 6, Probe 1,5: ueberstrahlt bei Belichtung +1,6)
TYPEN = tuple(LEISTUNG)


def _mats(mats):
    from .. import materials as M
    if "leuchte_gehaeuse" not in mats:
        mats["leuchte_gehaeuse"] = M.lack(bpy, "leuchte_gehaeuse", (0.18, 0.19, 0.20), 0.35, bevel=0.004)
        mats["leuchte_gehaeuse"].node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.7
        mats["leuchte_diffusor"] = M.leuchtmittel(bpy, "leuchte_diffusor", WARMWEISS)
        mats["leuchte_diffusor"]["immoviz_strassenlicht"] = 1
        mats["mast"] = M.lack(bpy, "mast", (0.10, 0.105, 0.11), 0.45)
        mats["guss"] = M.lack(bpy, "guss", (0.025, 0.035, 0.03), 0.5)
        mats["seil"] = M.simple(bpy, "seil", (0.02, 0.02, 0.02), 0.5)
        mats["haken"] = M.simple(bpy, "haken", (0.10, 0.10, 0.10), 0.4, 0.8)
        mats["laternenglas"] = M.leuchtmittel(bpy, "laternenglas", WARMWEISS)
        mats["laternenglas"]["immoviz_strassenlicht"] = 1


def inventar(cfg) -> list[dict] | None:
    inv = (cfg or {}).get("strassenleuchten")
    return list(inv) if inv else None


def fallback(cfg) -> list[dict]:
    """Bisherige Seilleuchten aus street.cables [x0, y0, x1, y1] (Seil auf 7,5 m, Leuchte in der Mitte)."""
    out = []
    for k, (x0, y0, x1, y1) in enumerate(((cfg or {}).get("street") or {}).get("cables") or []):
        out.append({"id": f"alt{k + 1}", "typ": "seil", "leuchte": [(x0 + x1) / 2, (y0 + y1) / 2], "hoehe": 6.75,
                    "a": [x0, y0, 7.5], "b": [x1, y1, 7.5], "quelle": "ANN Fallback street.cables"})
    return out


# ------------------------------------------------------------------ Leuchtenkoerper
def _teller(mb, c, form="teller"):
    """Wiener Haengeleuchte: Unterkante bei c[2]; flacher Diffusor, gewoelbter Deckel, Kragen, Abhaengung oben."""
    x, y, z = c
    if form == "kegel":
        prof = [(0.0, 0.0), (0.26, 0.0), (0.30, 0.04), (0.20, 0.30), (0.05, 0.36)]
    else:
        prof = [(0.0, 0.0), (0.27, 0.0), (0.31, 0.035), (0.30, 0.07), (0.24, 0.13), (0.13, 0.18), (0.05, 0.21), (0.03, 0.26)]
    F.drehkoerper(mb, (x, y, z + 0.004), prof[1:], "leuchte_gehaeuse", seg=20, kappen=True)
    F.drehkoerper(mb, (x, y, z), [(0.0, 0.0), (0.27, 0.0), (0.27, 0.006)], "leuchte_diffusor", seg=20, kappen=False)
    return z + 0.26


def _kopf_flach(mb, c, richtung, laenge=0.62, breite=0.26):
    """Flacher Leuchtenkopf (Peitsche, Wandarm): Unterkante bei c[2], Diffusor unten."""
    w = math.atan2(richtung[1], richtung[0])
    x, y, z = c
    F.quader(mb, (x, y, z + 0.06), (laenge, breite, 0.10), "leuchte_gehaeuse", drehung=math.degrees(w))
    F.quader(mb, (x - math.cos(w) * 0.05, y - math.sin(w) * 0.05, z + 0.12), (laenge * 0.8, breite * 0.8, 0.04),
             "leuchte_gehaeuse", drehung=math.degrees(w))
    ca, sa = math.cos(w), math.sin(w)
    l2, b2 = laenge / 2 - 0.04, breite / 2 - 0.03
    pts = [(x + ca * a - sa * b, y + sa * a + ca * b, z - 0.001) for a, b in ((-l2, -b2), (l2, -b2), (l2, b2), (-l2, b2))]
    mb.poly(pts, None, "leuchte_diffusor", (0, 0, -1))


def _laterne(mb, c):
    """Altwiener Laterne, Unterkante bei c[2]: vierseitig, nach oben breiter, Dach mit Spitze."""
    x, y, z = c
    F.drehkoerper(mb, (x, y, z), [(0.06, -0.15), (0.12, -0.02), (0.13, 0.0)], "guss", seg=4, kappen=True)
    F.drehkoerper(mb, (x, y, z), [(0.14, 0.0), (0.24, 0.55)], "laternenglas", seg=4, kappen=False)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        F.rohr(mb, [(x + 0.14 * math.cos(a), y + 0.14 * math.sin(a), z), (x + 0.245 * math.cos(a), y + 0.245 * math.sin(a), z + 0.56)],
               0.012, "guss", seg=4)
    F.drehkoerper(mb, (x, y, z + 0.55), [(0.27, 0.0), (0.29, 0.03), (0.0, 0.30)], "guss", seg=4, kappen=True)
    F.drehkoerper(mb, (x, y, z + 0.85), [(0.02, 0.0), (0.035, 0.06), (0.0, 0.14)], "guss", seg=8, kappen=False)


def _haken(mb, p, richtung):
    """Wandhaken mit Rosette und Spannschloss; richtung = zur Strasse (waagrecht)."""
    d = F._norm((richtung[0], richtung[1], 0.0))
    F.drehkoerper(mb, p, [(0.0, 0.0), (0.09, 0.0), (0.09, 0.02), (0.03, 0.035)], "haken", seg=10, achse=d)
    q = (p[0] + d[0] * 0.12, p[1] + d[1] * 0.12, p[2])
    F.rohr(mb, [(p[0] + d[0] * 0.03, p[1] + d[1] * 0.03, p[2]), q], 0.01, "haken", seg=6)
    s0 = (q[0] + d[0] * 0.05, q[1] + d[1] * 0.05, q[2] - 0.01)
    F.rohr(mb, [q, s0, (s0[0] + d[0] * 0.22, s0[1] + d[1] * 0.22, s0[2] - 0.03)], [0.012, 0.018, 0.018], "haken", seg=6)
    return (s0[0] + d[0] * 0.22, s0[1] + d[1] * 0.22, s0[2] - 0.03)


def _seil(mb, a, b, durchhang=0.15):
    F.rohr(mb, F.kettenlinie(a, b, durchhang, 12), 0.007, "seil", seg=5)


def _mast(mb, fuss, hoehe, r0=0.10, r1=0.06, mat="mast"):
    x, y, z = fuss
    F.drehkoerper(mb, (x, y, z), [(r0 * 1.5, -0.05), (r0 * 1.5, 0.35), (r0 * 1.15, 0.45), (r0, 0.5), (r1, hoehe)], mat,
                  seg=12, kappen=True)


# ------------------------------------------------------------------ Bau
def build(cfg, mats, coll, terrain, eintraege=None):
    """Baut alle Leuchten (Inventar oder Fallback) in die Sammlung `Strassenleuchten`. Liefert die Zahl."""
    eintraege = eintraege if eintraege is not None else (inventar(cfg) or fallback(cfg))
    if not eintraege:
        return 0
    _mats(mats)
    sub = bpy.data.collections.new("Strassenleuchten")
    coll.children.link(sub)
    mb = K.MeshBuilder("strassenleuchten", ["leuchte_gehaeuse"])
    knoten = {}
    for e in eintraege:
        typ = e.get("typ", "seil")
        lp = e.get("leuchte") or e.get("pos")
        zg = terrain(lp[0], lp[1])
        h = float(e.get("hoehe", 7.0))
        licht = None
        if typ == "seil":
            unten = (lp[0], lp[1], zg + h)
            oben = _teller(mb, unten, e.get("form", "teller"))
            kn = (lp[0], lp[1], zg + h + float(e.get("abhaenger", 0.75)))
            F.rohr(mb, [(lp[0], lp[1], oben), kn], 0.012, "haken", seg=6)
            haken = [e[k] for k in ("a", "b") if e.get(k)] + list(e.get("abspannung") or [])
            for hk in haken:
                hz = terrain(hk[0], hk[1]) + float(hk[2]) if len(hk) > 2 else kn[2] + 0.6
                p = (hk[0], hk[1], hz)
                ende = _haken(mb, p, (kn[0] - p[0], kn[1] - p[1]))
                _seil(mb, ende, kn, 0.12)
            for s in ([e["strang"]] if isinstance(e.get("strang"), str) else (e.get("strang") or [])):
                knoten.setdefault(s, []).append(kn)
            licht = (lp[0], lp[1], zg + h - 0.03)
        elif typ in ("mast_peitsche", "wandausleger"):
            d = F._norm((*e.get("richtung", [1.0, 0.0]), 0.0))
            aus = float(e.get("ausleger", 1.5 if typ == "mast_peitsche" else 1.0))
            kopf = (lp[0] + d[0] * aus, lp[1] + d[1] * aus, zg + h)
            if typ == "mast_peitsche":
                top = h + 0.45
                _mast(mb, (lp[0], lp[1], zg), top - 0.5, 0.10, 0.065)
                pts = [(lp[0], lp[1], zg + top - 0.6)]
                for k in range(1, 7):      # Bogen in den Ausleger
                    t = k / 6
                    w = t * math.pi / 2
                    pts.append((lp[0] + d[0] * aus * (1 - math.cos(w)) * 0.9, lp[1] + d[1] * aus * (1 - math.cos(w)) * 0.9,
                                zg + top - 0.6 + 0.6 * math.sin(w)))
                pts.append((kopf[0] - d[0] * 0.2, kopf[1] - d[1] * 0.2, zg + top))
                F.rohr(mb, pts, [0.065] + [0.055] * 6 + [0.045], "mast", seg=8)
                _kopf_flach(mb, (kopf[0], kopf[1], zg + top - 0.17), d)
                licht = (kopf[0], kopf[1], zg + top - 0.2)
            else:
                wz = zg + h + 0.55
                F.quader(mb, (lp[0], lp[1], wz), (0.06, 0.22, 0.30), "leuchte_gehaeuse",
                         drehung=math.degrees(math.atan2(d[1], d[0])))
                F.rohr(mb, [(lp[0], lp[1], wz), (lp[0] + d[0] * aus * 0.6, lp[1] + d[1] * aus * 0.6, wz + 0.05),
                            (kopf[0], kopf[1], wz)], 0.03, "mast", seg=8)
                F.rohr(mb, [(lp[0], lp[1], wz - 0.25), (lp[0] + d[0] * aus * 0.5, lp[1] + d[1] * aus * 0.5, wz)], 0.015, "mast", seg=6)
                if e.get("form") == "laterne":
                    _laterne(mb, (kopf[0], kopf[1], zg + h))
                else:
                    F.rohr(mb, [(kopf[0], kopf[1], wz), (kopf[0], kopf[1], zg + h + 0.26)], 0.012, "haken", seg=6)
                    _teller(mb, (kopf[0], kopf[1], zg + h))
                licht = (kopf[0], kopf[1], zg + h - 0.03)
        elif typ == "mast_aufsatz":
            _mast(mb, (lp[0], lp[1], zg), h, 0.08, 0.05)
            F.drehkoerper(mb, (lp[0], lp[1], zg + h), [(0.05, 0.0), (0.22, 0.05)], "leuchte_gehaeuse", seg=16, kappen=False)
            F.drehkoerper(mb, (lp[0], lp[1], zg + h + 0.05), [(0.21, 0.0), (0.21, 0.42)], "leuchte_diffusor", seg=16, kappen=False)
            F.drehkoerper(mb, (lp[0], lp[1], zg + h + 0.47), [(0.24, 0.0), (0.24, 0.04), (0.10, 0.12), (0.0, 0.14)],
                          "leuchte_gehaeuse", seg=16, kappen=True)
            licht = (lp[0], lp[1], zg + h + 0.26)
        elif typ == "altwiener_laterne":
            if e.get("wand"):
                d = F._norm((*e.get("richtung", [1.0, 0.0]), 0.0))
                kopf = (lp[0] + d[0] * 0.7, lp[1] + d[1] * 0.7)
                F.rohr(mb, [(lp[0], lp[1], zg + h + 1.0), (kopf[0], kopf[1], zg + h + 1.0)], 0.025, "guss", seg=8)
                F.rohr(mb, [(lp[0], lp[1], zg + h + 0.6), (lp[0] + d[0] * 0.45, lp[1] + d[1] * 0.45, zg + h + 1.0)], 0.018, "guss", seg=6)
            else:
                kopf = (lp[0], lp[1])
                F.drehkoerper(mb, (lp[0], lp[1], zg), [(0.18, 0.0), (0.18, 0.45), (0.12, 0.6), (0.08, 0.9), (0.065, h - 0.2),
                                                       (0.09, h - 0.12), (0.06, h - 0.05)], "guss", seg=12, kappen=True)
            _laterne(mb, (kopf[0], kopf[1], zg + h))
            licht = (kopf[0], kopf[1], zg + h + 0.3)
        if licht:
            _lampe(sub, e, licht, typ)
    # Laengsseile zwischen den Knoten eines Strangs (Reihenfolge entlang der Hauptrichtung)
    for s, pts in knoten.items():
        if len(pts) < 2:
            continue
        (x0, y0), (x1, y1) = max(((p[:2], q[:2]) for p in pts for q in pts), key=lambda pq: math.dist(*pq))
        d = F._norm((x1 - x0, y1 - y0, 0.0))
        pts = sorted(pts, key=lambda p: p[0] * d[0] + p[1] * d[1])
        for p, q in zip(pts, pts[1:]):
            if math.dist(p, q) < 45.0:
                _seil(mb, p, q, 0.25)
    mb.to_object(bpy, mats, sub, smooth=True)
    return len(eintraege)


def _lampe(sub, e, pos, typ):
    ld = bpy.data.lights.new(f"strassenleuchten_{e.get('id', '')}", "SPOT" if typ != "altwiener_laterne" else "POINT")
    ld.color = (1.0, 1.0, 1.0)
    if hasattr(ld, "use_temperature"):
        ld.use_temperature = True
        ld.temperature = float(e.get("farbtemperatur", FARBTEMPERATUR))
    else:
        ld.color = WARMWEISS
    ld["leistung"] = float(e.get("leistung", LEISTUNG.get(typ, 150.0)))
    ld.energy = 0.0
    ld.shadow_soft_size = 0.12
    if ld.type == "SPOT":
        ld.spot_size = math.radians(float(e.get("kegel", KEGEL.get(typ, 120.0))))
        ld.spot_blend = 0.35
    ob = bpy.data.objects.new(f"strassenleuchten_licht_{e.get('id', '')}", ld)
    ob.location = pos
    ob.hide_render = True
    if hasattr(ob, "visible_camera"):
        ob.visible_camera = False      # Lichtquelle selbst nicht im Bild, nur der Leuchtkoerper (DIFFUSOR_AN)
    sub.objects.link(ob)


def set_strassenlicht(bpy_, an: bool):
    """Strassenleuchten ein- oder ausschalten (Lichtquellen und leuchtende Diffusoren)."""
    for ob in bpy_.data.objects:
        if ob.name.startswith("strassenleuchten_licht") and ob.type == "LIGHT":
            ob.data.energy = float(ob.data.get("leistung", 150.0)) if an else 0.0
            ob.hide_render = not an
    for m in bpy_.data.materials:
        if m.get("immoviz_strassenlicht") and m.node_tree:
            for n in m.node_tree.nodes:
                if n.type == "BSDF_PRINCIPLED":
                    n.inputs["Emission Strength"].default_value = DIFFUSOR_AN if an else 0.0


def licht_an(L: dict, sonnenhoehe: float) -> bool:
    w = str(L.get("strassenlicht", "auto")).lower()
    if w in ("an", "true", "1", "ja"):
        return True
    if w in ("aus", "false", "0", "nein"):
        return False
    return sonnenhoehe < 2.0


# ------------------------------------------------------------------ Hilfen fuer die Erhebung
def wandpunkt(ctx, p, richtung, max_m=25.0):
    """Erster Schnitt eines Strahls von p in `richtung` mit einer Gebaeudekante (Baukoerpermodell und Objekt).
    Liefert den Punkt 5 cm vor der Wand oder None."""
    d = F._norm((richtung[0], richtung[1], 0.0))
    best = None
    polys = [b["poly"] for b in ctx.get("buildings", []) if b.get("height", 0) > 4.0]
    polys += [h["poly"] for h in ctx.get("hero", [])]
    for poly in polys:
        if min(math.dist(p, q) for q in poly) > max_m + 60:
            continue
        for i in range(len(poly)):
            a, b = poly[i], poly[(i + 1) % len(poly)]
            ex, ey = b[0] - a[0], b[1] - a[1]
            den = d[0] * ey - d[1] * ex
            if abs(den) < 1e-9:
                continue
            t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den
            u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den
            if 0.0 < t <= max_m and 0.0 <= u <= 1.0 and (best is None or t < best):
                best = t
    if best is None:
        return None
    t = best - 0.05
    return [round(p[0] + d[0] * t, 2), round(p[1] + d[1] * t, 2)]


# ------------------------------------------------------------------ Pruefbild
FARBE = {"seil": (255, 220, 0), "mast_peitsche": (255, 90, 40), "mast_aufsatz": (255, 140, 200), "wandausleger": (0, 220, 255),
         "altwiener_laterne": (140, 255, 120)}
TEXT = {"seil": "Seil-/Ueberspannungsleuchte", "mast_peitsche": "Peitschenmast", "mast_aufsatz": "Aufsatzmast",
        "wandausleger": "Wandausleger", "altwiener_laterne": "Altwiener Laterne"}


def pruefbild(project_dir: Path, m_je_pixel: float = 0.12) -> dict:
    """Draufsicht: Orthofoto 2024 mit Leuchtenpositionen, Seilen, Haken und Masten (renders/check/leuchten_abgleich.*)."""
    import yaml
    from PIL import Image, ImageDraw
    from .. import roofs as R
    from .. import strasse as ST
    project_dir = Path(project_dir)
    cfg = yaml.safe_load((project_dir / "project.yaml").read_text())
    ctx = json.loads((project_dir / "data" / "context.json").read_text())
    inv = inventar(cfg)
    eintraege = inv or fallback(cfg)
    if not eintraege:
        return {"fehler": "kein Inventar und kein Fallback"}
    pts = []
    for e in eintraege:
        pts.append(tuple(e.get("leuchte") or e.get("pos")))
        pts += [tuple(h[:2]) for h in [e.get("a"), e.get("b")] + list(e.get("abspannung") or []) if h]
    hero = [p for h in ctx["hero"] for p in h["poly"]]
    xs = [p[0] for p in pts + hero]
    ys = [p[1] for p in pts + hero]
    x0, x1, y0, y1 = min(xs) - 15, max(xs) + 15, min(ys) - 15, max(ys) + 15
    rad = max(abs(x0), abs(x1), abs(y0), abs(y1)) + 5
    ort = R.Ortho(ctx, rad, 20 if m_je_pixel < 0.15 else 19, project_dir / "data" / "ortho_cache")
    nx, ny = int((x1 - x0) / m_je_pixel), int((y1 - y0) / m_je_pixel)
    o = ort.pixel(x0, y1)
    ex = ort.pixel(x0 + m_je_pixel, y1)
    ey = ort.pixel(x0, y1 - m_je_pixel)
    img = ort.img.transform((nx, ny), Image.AFFINE, (ex[0] - o[0], ey[0] - o[0], o[0], ex[1] - o[1], ey[1] - o[1], o[1]),
                            Image.BICUBIC)
    img = Image.blend(img, Image.new("RGB", img.size, (0, 0, 0)), 0.25)
    d = ImageDraw.Draw(img)
    P = lambda x, y: ((x - x0) / m_je_pixel, (y1 - y) / m_je_pixel)
    for h in ctx["hero"]:
        d.line([P(*p) for p in h["poly"]] + [P(*h["poly"][0])], fill=(255, 0, 255), width=4)
    f_kl = ST._font(max(14, int(0.9 / m_je_pixel * 0.25)))
    strang = {}
    for e in eintraege:
        typ = e.get("typ", "seil")
        lp = e.get("leuchte") or e.get("pos")
        c = P(*lp)
        col = FARBE.get(typ, (255, 255, 255))
        for hk in [e.get("a"), e.get("b")] + list(e.get("abspannung") or []):
            if hk:
                d.line([c, P(*hk[:2])], fill=(255, 255, 255), width=2)
                q = P(*hk[:2])
                d.rectangle([q[0] - 5, q[1] - 5, q[0] + 5, q[1] + 5], outline=(255, 255, 255), width=2)
        if typ in ("mast_peitsche", "wandausleger") and e.get("richtung"):
            dd = F._norm((*e["richtung"], 0.0))
            aus = float(e.get("ausleger", 1.5))
            d.line([c, P(lp[0] + dd[0] * aus, lp[1] + dd[1] * aus)], fill=col, width=4)
        s = e.get("strang")
        for k in ([s] if isinstance(s, str) else (s or [])):
            strang.setdefault(k, []).append(lp)
        r = 9
        d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=col, outline=(0, 0, 0), width=2)
        d.text((c[0] + 12, c[1] - 10), f"{e.get('id', '')} {float(e.get('hoehe', 0)):.1f} m".replace(".", ","),
               font=f_kl, fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    for k, ps in strang.items():
        if len(ps) > 1:
            (a0, b0), (a1, b1) = max(((p, q) for p in ps for q in ps), key=lambda pq: math.dist(*pq))
            dv = F._norm((a1 - a0, b1 - b0, 0.0))
            ps = sorted(ps, key=lambda p: p[0] * dv[0] + p[1] * dv[1])
            for p, q in zip(ps, ps[1:]):
                if math.dist(p, q) < 45:
                    d.line([P(*p), P(*q)], fill=(255, 220, 0), width=1)
    leg = [(TEXT[t], FARBE[t]) for t in TYPEN if any(e.get("typ", "seil") == t for e in eintraege)]
    hl = 60 + 30 * (len(leg) + 2)
    y_0 = ny - hl - 60          # Legende unten links (oben liegt oft die Strasse)
    d.rectangle([10, y_0, 520, y_0 + hl], fill=(0, 0, 0))
    titel = f"Leuchten-Inventar {cfg.get('project', {}).get('name', project_dir.name)}: {len(eintraege)} Leuchten" + \
        ("" if inv else " (FALLBACK street.cables)")
    d.text((22, y_0 + 10), titel, font=f_kl, fill=(255, 255, 255))
    for k, (t, col) in enumerate(leg):
        yy = y_0 + 46 + 30 * k
        d.ellipse([22, yy, 40, yy + 18], fill=col)
        d.text((52, yy), t, font=f_kl, fill=(255, 255, 255))
    yy = y_0 + 46 + 30 * len(leg)
    d.line([(22, yy + 9), (40, yy + 9)], fill=(255, 255, 255), width=2)
    d.text((52, yy), "Querseil/Abspannung zum Wandhaken (Quadrat)", font=f_kl, fill=(255, 255, 255))
    d.line([(22, yy + 39), (40, yy + 39)], fill=(255, 220, 0), width=1)
    d.text((52, yy + 30), "Laengsseil (Strang)", font=f_kl, fill=(255, 255, 255))
    q = "Orthofoto 2024: Stadt Wien, data.wien.gv.at (CC BY 4.0). Leuchten: Inventar project.yaml (Quelle je Eintrag)."
    tw = d.textlength(q, font=f_kl)
    d.rectangle([nx - tw - 30, ny - 40, nx, ny], fill=(0, 0, 0))
    d.text((nx - tw - 15, ny - 32), q, font=f_kl, fill=(255, 255, 255))
    out = project_dir / "renders" / "check"
    out.mkdir(parents=True, exist_ok=True)
    img.save(out / "leuchten_abgleich.jpg", quality=86)
    zeilen = ["# Leuchten-Inventar " + project_dir.name, "",
              f"Erzeugt mit `immoviz.py leuchten`. Prüfbild `leuchten_abgleich.jpg`. {len(eintraege)} Leuchten" +
              ("." if inv else " aus dem Fallback `street.cables` (kein Inventar)."), "",
              "| ID | Typ | Lage lokal | Lichtpunkthöhe | Aufhängung | Quelle |", "|---|---|---|---|---|---|"]
    for e in eintraege:
        lp = e.get("leuchte") or e.get("pos")
        auf = ", ".join(f"{h[0]:.1f}/{h[1]:.1f}" for h in [e.get("a"), e.get("b")] + list(e.get("abspannung") or []) if h)
        if e.get("richtung"):
            auf = f"Ausleger {float(e.get('ausleger', 1.5)):.1f} m Richtung {e['richtung'][0]:.2f}/{e['richtung'][1]:.2f}"
        zeilen.append(f"| {e.get('id', '')} | {TEXT.get(e.get('typ', 'seil'), e.get('typ'))} | {lp[0]:.1f} / {lp[1]:.1f} | "
                      f"{float(e.get('hoehe', 0)):.1f} m | {auf} | {e.get('quelle', 'FEHLT')} |".replace(".", ",", 0))
    (out / "leuchten_abgleich.md").write_text("\n".join(zeilen) + "\n")
    return {"bild": str(out / "leuchten_abgleich.jpg"), "tabelle": str(out / "leuchten_abgleich.md"),
            "leuchten": len(eintraege), "inventar": bool(inv), "kacheln_fehlend": ort.fehlend}
