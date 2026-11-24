"""Fernsicht fuer Luft- und Terrassenmotive: markante Gebaeude, Gelaende und Dachlandschaft jenseits des Radius.

Quellen (Lizenz CC BY 4.0, "Datenquelle: Stadt Wien - data.wien.gv.at"):
- FMZKBKMOGD: Baukoerpermodell, hier nur die auffaellig hohen Teile (hoeher als `min_hoehe` ueber Gelaende) im
  Umkreis `fern_radius_m`. Das ergibt die Silhouetten von Kirchtuermen, Hochhaeusern, Flaktuermen, Schloten.
- STRUKDOMINANTEOGD: Strukturdominanten der Stadtstrukturplanung (Flaechen ohne Namen, nur Typ und Ordnung);
  dient als Merkmal "ist als Dominante gefuehrt".
- SEHENSWUERDIGOGD, RELIGIONOGD: Punkte mit Namen, der naechstgelegene Eintrag benennt ein hohes Gebaeude.
- HOEHENFESTPKTADRIAOGD: Hoehenfestpunkte (rund 4300 im Stadtgebiet) als grobes Gelaende fuer die Fernzone und
  fuer die Huegelkette des Wienerwalds am Horizont.

Ablauf: `immoviz.py fernsicht <projekt>` laedt die Daten nach data/fern.json und gibt je Kamera die Liste der
markanten Gebaeude im Sichtkegel aus. `build_context` baut daraus die Fernzone (Blockraender mit Satteldaechern auf
dem groben Gelaende), die hohen Gebaeude als Baukoerper und die Huegelkette als Kulisse. Ohne fern.json bleibt die
Fernzone eben und ohne Silhouetten.
"""
from __future__ import annotations

import json
import math
import urllib.parse
import urllib.request
from pathlib import Path

WFS = "https://data.wien.gv.at/daten/geo"
CRS = "EPSG:31256"


def _wfs(layer: str, cql: str | None = None, timeout: int = 240) -> list[dict]:
    q = {"service": "WFS", "version": "1.1.0", "request": "GetFeature", "typeName": f"ogdwien:{layer}",
         "srsName": CRS, "outputFormat": "json"}
    if cql:
        q["cql_filter"] = cql
    req = urllib.request.Request(f"{WFS}?{urllib.parse.urlencode(q)}", headers={"User-Agent": "immoviz/0.1"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)["features"]


def _ring(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"][0]]
    if geom["type"] == "MultiPolygon":
        return [p[0] for p in geom["coordinates"]]
    return []


def _pip(x, y, poly):
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i][0], poly[i][1]
        xj, yj = poly[j][0], poly[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi:
            inside = not inside
        j = i
    return inside


def fetch(cfg: dict, out_path: Path) -> dict:
    """Laedt hohe Baukoerper, Namen, Strukturdominanten und Hoehenfestpunkte und schreibt data/fern.json."""
    from .geo_wien import LocalFrame
    site = cfg["site"]
    frame = LocalFrame(*site["origin_gk"], site["x_axis_deg"])
    R = float(site.get("fern_radius_m", 7500))
    hmin = float(site.get("fern_min_hoehe_m", 33))
    nah = float(site.get("radius_m", 300))
    g0 = float(site.get("ground_wn", 0.0))
    ox, oy = site["origin_gk"]
    cql = f"BBOX(SHAPE,{ox - R},{oy - R},{ox + R},{oy + R}) AND O_KOTE - T_KOTE > {hmin} AND F_KLASSE=11"
    namen = []
    for layer in ("SEHENSWUERDIGOGD", "RELIGIONOGD"):
        try:
            for f in _wfs(layer):
                c = f["geometry"]["coordinates"]
                namen.append((frame(c[0], c[1]), f["properties"].get("NAME") or ""))
        except Exception as e:      # Namen sind Zusatz
            print(f"{layer} nicht verfuegbar:", e)
    dom = []
    try:
        for f in _wfs("STRUKDOMINANTEOGD"):
            for ring in _ring(f["geometry"]):
                dom.append(([frame(x, y) for x, y, *_ in ring], f["properties"].get("TYP_TXT"), f["properties"].get("ORDNUNG")))
    except Exception as e:
        print("STRUKDOMINANTEOGD nicht verfuegbar:", e)
    hoch = []
    for f in _wfs("FMZKBKMOGD", cql):
        p = f["properties"]
        if p.get("O_KOTE") is None or p.get("T_KOTE") is None:
            continue
        for ring in _ring(f["geometry"]):
            poly = [frame(x, y) for x, y, *_ in ring][:-1]
            if len(poly) < 3:
                continue
            cx = sum(q[0] for q in poly) / len(poly)
            cy = sum(q[1] for q in poly) / len(poly)
            d = math.hypot(cx, cy)
            if d <= nah or d > R:      # im Nahbereich steht das Gebaeude schon in context.json
                continue
            hoch.append({"bezug": p.get("BEZUG"), "poly": [[round(x, 1), round(y, 1)] for x, y in poly],
                         "z0": round(p["T_KOTE"] - g0, 1), "z1": round(p["O_KOTE"] - g0, 1)})
    # je BEZUG: Name ueber den naechstgelegenen benannten Punkt (hoechstens 90 m), Strukturdominante ueber die Flaeche
    by = {}
    for h in hoch:
        by.setdefault(h["bezug"], []).append(h)
    markant = []
    for bez, parts in by.items():
        top = max(parts, key=lambda h: h["z1"])
        cx = sum(q[0] for q in top["poly"]) / len(top["poly"])
        cy = sum(q[1] for q in top["poly"]) / len(top["poly"])
        nm = min(namen, key=lambda n: math.dist(n[0], (cx, cy)), default=None)
        name = nm[1] if nm and math.dist(nm[0], (cx, cy)) <= 90 else None
        dm = next(((t, o) for poly, t, o in dom if _pip(cx, cy, poly)), None)
        markant.append({"bezug": bez, "name": name, "pos": [round(cx), round(cy)], "hoehe": round(top["z1"] - top["z0"]),
                        "top": top["z1"], "teile": len(parts), "dominante": dm[0] if dm else None,
                        "ordnung": dm[1] if dm else None})
    fest = []
    try:
        for f in _wfs("HOEHENFESTPKTADRIAOGD"):
            c = f["geometry"]["coordinates"]
            hw = f["properties"].get("HOEHE_WIEN")
            if hw is not None:
                x, y = frame(c[0], c[1])
                fest.append([round(x), round(y), round(hw - g0, 1)])
    except Exception as e:
        print("HOEHENFESTPKTADRIAOGD nicht verfuegbar:", e)
    out = {"source": "Datenquelle: Stadt Wien - data.wien.gv.at (CC BY 4.0): Baukoerpermodell (hohe Teile), "
                     "Strukturdominanten, Sehenswuerdigkeiten, Religionsstandorte, Hoehenfestpunkte",
           "radius_m": R, "min_hoehe_m": hmin, "hoch": hoch, "markant": markant, "gelaende": fest}
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    return out


def load(project_dir: Path):
    p = project_dir / "data" / "fern.json"
    return json.loads(p.read_text()) if p.exists() else None


# ---------------------------------------------------------------- Auswertung je Kamera
def kompass(cfg, dx, dy) -> float:
    """Kompassrichtung (0 = Nord, 90 = Ost) eines Vektors im lokalen System."""
    a = math.degrees(math.atan2(dy, dx)) + cfg["site"]["x_axis_deg"]      # Winkel gegen Ost, gegen den Uhrzeigersinn
    return (90.0 - a) % 360.0


def im_sichtkegel(cfg, fern, cam: str, rand_grad: float = 2.0) -> list[dict]:
    """Markante Gebaeude im waagrechten Bildwinkel einer Kamera, sortiert nach Hoehenwinkel ueber der Kamera."""
    c = cfg["cameras"][cam]
    px, py, pz = c["pos"]
    tx, ty, _ = c["target"]
    hd = math.atan2(ty - py, tx - px)
    aspect = cfg["render"]["resolution"][0] / cfg["render"]["resolution"][1]
    half = math.atan(18.0 / c.get("lens", 24)) if aspect >= 1 else math.atan(18.0 * aspect / c.get("lens", 24))
    rows = []
    for m in fern.get("markant", []):
        dx, dy = m["pos"][0] - px, m["pos"][1] - py
        d = math.hypot(dx, dy)
        rel = (math.atan2(dy, dx) - hd + math.pi) % (2 * math.pi) - math.pi
        if abs(rel) > half + math.radians(rand_grad):
            continue
        rows.append({**m, "entfernung": round(d), "richtung": round(kompass(cfg, dx, dy)),
                     "im_bild": "links" if rel > half / 3 else ("rechts" if rel < -half / 3 else "Mitte"),
                     "hoehenwinkel": round(math.degrees(math.atan2(m["top"] - pz, d)), 2)})
    return sorted(rows, key=lambda r: -r["hoehenwinkel"])


# ---------------------------------------------------------------- Gelaende aus Hoehenfestpunkten
def gelaende(fern, terrain, radius: float, k: int = 6):
    """Grobes Gelaende fuer die Fernzone: gewichtetes Mittel der k naechsten Hoehenfestpunkte, am Radius
    stufenlos an das genaue Gelaende des Nahbereichs angeschlossen. Ohne Daten das Gelaende am Rand."""
    pts = (fern or {}).get("gelaende") or []
    if len(pts) < k:
        return terrain
    import numpy as np
    P = np.array(pts, dtype=float)
    cache = {}

    def z(x, y):
        key = (round(x / 40.0), round(y / 40.0))
        if key not in cache:
            d2 = (P[:, 0] - x) ** 2 + (P[:, 1] - y) ** 2
            idx = np.argpartition(d2, k)[:k]
            w = 1.0 / (d2[idx] + 400.0)
            cache[key] = float((P[idx, 2] * w).sum() / w.sum())
        w = min(1.0, max(0.0, (math.hypot(x, y) - radius) / 350.0))
        return terrain(x, y) * (1.0 - w) + cache[key] * w
    return z


# ---------------------------------------------------------------- Geometrie fuer Blender
def fernzone(mb, rng, radius: float, ground, bis: float = 1800.0, step: float = 78.0):
    """Generische Wiener Blockrandbebauung jenseits des Radius: je Block vier Trakte um einen Hof, jeder Trakt in
    zwei bis drei Haeuser mit eigener Traufhoehe und eigenem Satteldach (Ziegel rot, orange, braun, Blech hell
    und dunkel gemischt wie im Orthofoto). Nur fuer Luft- und Dachansichten."""
    from . import roofs as R
    from .materials import NEIGHBOUR_PALETTE
    daecher = list(R.ZIEGEL_MIX) + ["dach_blech_grau", "dach_blech_grau", "dach_blech_hellgrau", "dach_blech_grau",
                                    "dach_blech_dunkel"]
    gi = int(bis / step)
    for i in range(-gi, gi + 1):
        for j in range(-gi, gi + 1):
            cx0, cy0 = i * step + rng.uniform(-6, 6), j * step + rng.uniform(-6, 6)
            dd = math.hypot(cx0, cy0)
            if dd < radius + 25 or dd > bis:
                continue
            w, l = rng.uniform(52, 64), rng.uniform(52, 64)
            zg = ground(cx0, cy0)
            hb = rng.uniform(15.5, 22.5)                       # Grundhoehe des Blocks, Haeuser streuen darum
            t = rng.uniform(11.0, 13.5)                        # Trakttiefe
            x0, x1, y0, y1 = cx0 - w / 2, cx0 + w / 2, cy0 - l / 2, cy0 + l / 2
            # vier Trakte: (Ursprung, Laengsrichtung, Laenge, Querrichtung nach innen)
            trakte = [((x0, y0), (1, 0), w, (0, 1)), ((x1, y0), (0, 1), l, (-1, 0)),
                      ((x1, y1), (-1, 0), w, (0, -1)), ((x0, y1), (0, -1), l, (1, 0))]
            for (ox, oy), e, L, q in trakte:
                n = rng.choice((2, 3, 3))
                cuts = sorted(rng.uniform(0.25, 0.75) * L for _ in range(n - 1))
                cuts = [0.0] + cuts + [L - t]                   # das Eck gehoert zum naechsten Trakt
                for a, b in zip(cuts, cuts[1:]):
                    if b - a < 4.0:
                        continue
                    hh = hb + rng.uniform(-2.5, 3.0)
                    col = f"nachbar_{rng.randrange(len(NEIGHBOUR_PALETTE))}"
                    rm = rng.choice(daecher)
                    rh = rng.uniform(3.0, 4.6) if not rm.startswith("dach_blech") else rng.uniform(2.0, 3.8)

                    def P(u, v, z):
                        return (ox + e[0] * u + q[0] * v, oy + e[1] * u + q[1] * v, zg + z)
                    # Waende
                    for (ua, va), (ub, vb), nrm in (((a, 0), (b, 0), (-q[0], -q[1], 0)), ((b, t), (a, t), (q[0], q[1], 0)),
                                                     ((a, t), (a, 0), (-e[0], -e[1], 0)), ((b, 0), (b, t), (e[0], e[1], 0))):
                        top = hh if va == vb else hh      # Giebel werden unten ergaenzt
                        mb.poly([P(ua, va, -25.0), P(ub, vb, -25.0), P(ub, vb, top), P(ua, va, top)], None, col, nrm)
                    # Satteldach, First entlang des Trakts
                    mb.poly([P(a, 0, hh), P(b, 0, hh), P(b, t / 2, hh + rh), P(a, t / 2, hh + rh)],
                            [(a, 0), (b, 0), (b, t / 2), (a, t / 2)], rm, (0, 0, 1))
                    mb.poly([P(b, t, hh), P(a, t, hh), P(a, t / 2, hh + rh), P(b, t / 2, hh + rh)],
                            [(b, 0), (a, 0), (a, t / 2), (b, t / 2)], rm, (0, 0, 1))
                    mb.poly([P(a, t, hh), P(a, 0, hh), P(a, t / 2, hh + rh)], None, col, (-e[0], -e[1], 0))
                    mb.poly([P(b, 0, hh), P(b, t, hh), P(b, t / 2, hh + rh)], None, col, (e[0], e[1], 0))
            mb.poly([(x0 + t, y0 + t, zg + 0.2), (x1 - t, y0 + t, zg + 0.2), (x1 - t, y1 - t, zg + 0.2),
                     (x0 + t, y1 - t, zg + 0.2)], None, "hof", (0, 0, 1))


def markante(mb, fern, ground, spitzen=None, fassade=None):
    """Hohe Baukoerper jenseits des Radius als Silhouette: Grundriss und Oberkante aus dem Baukoerpermodell
    (Hoehen absolut ueber Wiener Null), nach unten bis unter das grobe Gelaende gezogen.

    spitzen (project.yaml `fern_spitzen`): Turmhelme, die das Baukoerpermodell als Prisma fuehrt oder ganz
    weglaesst: [{bezug, name, basis, spitze, breite}]. Der hoechste Teil des BEZUG endet bei `basis` (z lokal),
    darauf steht eine Pyramide bis `spitze` (Standard: Oberkante laut Daten) mit quadratischer Grundflaeche
    `breite` (Standard 70 % der kleineren Ausdehnung). Werte aus oeffentlichen Hoehenangaben, nicht aus Bildern."""
    sp = {str(e["bezug"]): e for e in (spitzen or []) if e.get("bezug") is not None and not e.get("pos")}
    for e in spitzen or []:      # frei stehender Helm an einer Lage (Turm, den das Baukoerpermodell nur in Teilen fuehrt)
        if e.get("pos"):
            x, y = e["pos"]
            w = float(e.get("breite", 6.0))
            sq = [(x - w / 2, y - w / 2), (x + w / 2, y - w / 2), (x + w / 2, y + w / 2), (x - w / 2, y + w / 2)]
            if e.get("koerper_von") is not None:
                z0_, z1_ = float(e["koerper_von"]), float(e["basis"])
                for i in range(4):
                    (x1, y1), (x2, y2) = sq[i], sq[(i + 1) % 4]
                    mb.poly([(x1, y1, z0_), (x2, y2, z0_), (x2, y2, z1_), (x1, y1, z1_)], None, "fern_turm",
                            (y2 - y1, -(x2 - x1), 0))
            _pyramide(mb, sq, float(e["basis"]), float(e["spitze"]), w, "fern_turm")
    top_teil = {}
    for h in (fern or {}).get("hoch", []):
        if str(h["bezug"]) in sp and (str(h["bezug"]) not in top_teil or h["z1"] > top_teil[str(h["bezug"])]["z1"]):
            top_teil[str(h["bezug"])] = h
    for h in (fern or {}).get("hoch", []):
        poly = h["poly"]
        a = 0.0
        for i in range(len(poly)):
            (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
            a += x1 * y2 - x2 * y1
        if a < 0:
            poly = poly[::-1]
        cx = sum(p[0] for p in poly) / len(poly)
        cy = sum(p[1] for p in poly) / len(poly)
        z0 = min(h["z0"], ground(cx, cy)) - 5.0
        z1 = h["z1"]
        hoehe = h["z1"] - h["z0"]
        mat = "fern_turm" if hoehe > 60 else "fern_bau"
        e = sp.get(str(h["bezug"]))
        if e and top_teil.get(str(h["bezug"])) is h:
            basis = float(e.get("basis", z1))
            spitze = float(e.get("spitze", z1))
            z1 = min(z1, basis)
            _pyramide(mb, poly, basis, spitze, e.get("breite"), "fern_turm")
        for i in range(len(poly)):
            (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
            mb.poly([(x1, y1, z0), (x2, y2, z0), (x2, y2, z1), (x1, y1, z1)], None, mat, (y2 - y1, -(x2 - x1), 0))
        mb.poly([(x, y, z1) for x, y in poly], None, "fern_dach", (0, 0, 1))
        if fassade:      # optional (Noma Runde 11d): Geschossbaender und Glas wie bei den Hochhaeusern im Radius
            fassade(poly, max(h["z0"], z0), z1, str(h["bezug"]), math.hypot(cx, cy))


def _pyramide(mb, poly, z0, z1, breite=None, mat="fern_turm"):
    """Turmhelm als vierseitige Pyramide ueber dem Schwerpunkt, ausgerichtet an der laengsten Kante."""
    if z1 <= z0 + 0.5:
        return
    cx = sum(p[0] for p in poly) / len(poly)
    cy = sum(p[1] for p in poly) / len(poly)
    a, b = max(((poly[i], poly[(i + 1) % len(poly)]) for i in range(len(poly))), key=lambda e: math.dist(*e))
    L = math.dist(a, b) or 1.0
    t = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
    n = (-t[1], t[0])
    ext_t = max(p[0] * t[0] + p[1] * t[1] for p in poly) - min(p[0] * t[0] + p[1] * t[1] for p in poly)
    ext_n = max(p[0] * n[0] + p[1] * n[1] for p in poly) - min(p[0] * n[0] + p[1] * n[1] for p in poly)
    w = float(breite) if breite else 0.7 * min(ext_t, ext_n)
    c = [(cx + (t[0] * sx + n[0] * sy) * w / 2, cy + (t[1] * sx + n[1] * sy) * w / 2)
         for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    for i in range(4):
        p, q = c[i], c[(i + 1) % 4]
        mb.poly([(p[0], p[1], z0), (q[0], q[1], z0), (cx, cy, z1)], None, mat,
                ((p[0] + q[0]) / 2 - cx, (p[1] + q[1]) / 2 - cy, 0.3))
    mb.poly([(x, y, z0) for x, y in c], None, mat, (0, 0, -1))


def gipfel(cfg) -> list:
    """Hoehenpunkte markanter Gipfel fuer die Kulisse aus project.yaml `fern_gipfel`:
    [{name, lat, lon, hoehe (m ue. A.), radius (m, Standard 1200), abfall (m, Standard 80)}]. Die Hoehenfestpunkte
    der Stadt liegen an Strassen, nicht auf den Kuppen; ohne diese Punkte lag der Wienerwald im Abgleich gegen die
    3D-Referenz rund 0,6 Grad zu tief, der Bisamberg (ausserhalb Wiens) fehlte. Liefert [x, y, z] lokal."""
    eintraege = (cfg or {}).get("fern_gipfel") or []
    if not eintraege:
        return []
    from pyproj import Transformer
    from .geo_wien import LocalFrame
    site = cfg["site"]
    frame = LocalFrame(*site["origin_gk"], site["x_axis_deg"])
    tr = Transformer.from_crs("EPSG:4326", "EPSG:31256", always_xy=True)
    g0 = float(site.get("ground_wn", 0.0))
    out = []
    for e in eintraege:
        x, y = frame(*tr.transform(e["lon"], e["lat"]))
        z = float(e["hoehe"]) - 156.68 - g0          # m ue. A. -> Wiener Null -> lokal
        r, ab = float(e.get("radius", 1200)), float(e.get("abfall", 80))
        out.append([x, y, z])
        for k in range(12):
            w = k * math.pi / 6
            for f, d in ((0.5, ab / 3), (1.0, ab)):
                out.append([x + math.cos(w) * r * f, y + math.sin(w) * r * f, z - d])
    return out


def kulisse(mb, fern, min_dist: float = 3500.0, min_ueber: float = 55.0, bin_grad: float = 1.5, extra=None):
    """Huegelkette am Horizont (Wienerwald, Wienerberg, Laaer Berg) als Kulisse aus den Hoehenfestpunkten.

    Je Richtungssektor zaehlt der Punkt mit dem groessten Hoehenwinkel; die Kette wird geglaettet und als
    senkrechtes Band in der Entfernung dieser Punkte gebaut. Grob (Festpunkte liegen an Strassen, nicht auf den
    Gipfeln), genuegt aber fuer die Silhouette. Liefert die Sektoren (Kompass, Entfernung, Hoehe) fuer die Doku."""
    pts = list((fern or {}).get("gelaende") or []) + list(extra or [])
    n = int(360 / bin_grad)
    best = [None] * n
    for x, y, z in pts:
        d = math.hypot(x, y)
        if d < min_dist or z < min_ueber:
            continue
        k = int((math.degrees(math.atan2(y, x)) % 360) / bin_grad) % n
        el = z / d
        if best[k] is None or el > best[k][0]:
            best[k] = (el, d, z)
    out = []
    # glaetten: Mittel mit den Nachbarsektoren, Luecken bleiben Luecken
    sm = []
    for k in range(n):
        nb = [best[(k + o) % n] for o in (-2, -1, 0, 1, 2) if best[(k + o) % n]]      # 1,5-Grad-Sektoren, ueber 7,5 Grad geglaettet
        sm.append((sum(b[0] for b in nb) / len(nb), sum(b[1] for b in nb) / len(nb)) if best[k] and nb else None)
    for k in range(n):
        a, b = sm[k], sm[(k + 1) % n]
        if not a and not b:
            continue
        if not a or not b:      # Ende der Kette: in einem Sektor auf den Horizont auslaufen lassen
            a, b = (a or (0.0, b[1])), (b or (0.0, a[1]))
        w0, w1 = math.radians((k + 0.5) * bin_grad), math.radians((k + 1.5) * bin_grad)
        p0 = (math.cos(w0) * a[1], math.sin(w0) * a[1], a[0] * a[1])
        p1 = (math.cos(w1) * b[1], math.sin(w1) * b[1], b[0] * b[1])
        mb.poly([(p0[0], p0[1], -60.0), (p1[0], p1[1], -60.0), p1, p0], None, "fern_wald", (-p0[0], -p0[1], 0))
        out.append({"winkel_lokal": round((k + 1) * bin_grad), "entfernung": round((a[1] + b[1]) / 2),
                    "hoehe": round((p0[2] + p1[2]) / 2)})
    return out
