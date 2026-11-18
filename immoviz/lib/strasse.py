"""Straßenabgleich: Parkordnung, Gehsteige und Baumscheiben vor dem Objekt gegen das Orthofoto der Stadt Wien.

Dieses Modul hat zwei Aufgaben:

1. Stellplätze je Parkstreifen berechnen (`stellplaetze`). `lib/build.py` (park_cars) stellt die Autos genau auf
   diese Plätze, das Prüfbild zeichnet dieselben Plätze ein. Modell und Prüfbild können so nicht auseinanderlaufen.
2. Prüfbild und Tabelle schreiben (`pruefen`): `renders/check/strasse_abgleich.jpg`, `.md` und `.json`.

Konfiguration in project.yaml:
  street:
    parking:                      # Regeln in Reihenfolge, die erste passende gilt
      - name: vor dem Haus
        strasse: wimmergasse      # Name einer Fassade aus `facades`: Streifen parallel zu dieser Flucht
        seite: haus               # haus | gegenueber (Grenze 8 m ab Fassadenflucht, änderbar mit `grenze`)
        bereich: [x0, y0, x1, y1] # optional: Rechteck im lokalen System
        polygon: [[x, y], ...]    # optional: Polygon im lokalen System
        art: senkrecht            # laengs | schraeg | senkrecht | keine
        winkel: 60                # optional, Grad zur Bordsteinlinie. Positiv: schräg in Fahrtrichtung bei
                                  # Rechtsverkehr (Bordstein rechts). Negativ: umgekehrt (Einbahn, Streifen links)
        raster: 2.5               # optional, Stellplatzbreite (bei laengs: Stellplatzlänge) in Metern
        belegung: 0.85            # optional, Anteil belegter Plätze im Rendering
    parking_check: {umkreis_m: 60, m_je_pixel: 0.05}   # optional

Ohne passende Regel entscheidet die Breite des Streifens (`automatik`).

Quelle Orthofoto: Stadt Wien, data.wien.gv.at (CC BY 4.0). Prüfbild und Tabelle entstehen ohne
Rendering; eine Szene wird nur für den optionalen Street-View-Teil gebaut.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from . import meshkit as K

QUELLE = "Orthofoto 2024 und Geodaten: Stadt Wien, data.wien.gv.at (CC BY 4.0)"
ARTEN = ("laengs", "schraeg", "senkrecht")
ART_TEXT = {"laengs": "längs", "schraeg": "schräg", "senkrecht": "senkrecht (90 Grad)", "keine": "kein Parken"}
BELEGUNG = 0.85
AUTO_L, AUTO_B = 4.5, 1.85            # mittleres Auto, bestimmt die Tiefe eines Stellplatzes
PARK_LAYER = "Ruhender Verkehr"
GEHSTEIG_LAYER = ("Gehsteig", "Gehweg, Radweg")
FAHR_LAYER = ("Fahrbahn", PARK_LAYER, "Zebrastreifen", "Fahrbahnschwelle")


# ---------------------------------------------------------------- Parkordnung
def automatik(breite: float) -> tuple[str, float]:
    """Parkordnung aus der Streifenbreite, wenn keine Regel passt. Liefert (art, winkel)."""
    if breite < 3.4:
        return "laengs", 0.0          # üblich 2,0 bis 2,5 m; bis 3,4 m passt kein Schrägparker
    if breite < 4.0:
        return "schraeg", 45.0
    if breite <= 4.8:
        return "schraeg", 60.0
    return "senkrecht", 90.0


def _regeln(cfg) -> list[dict]:
    rules = ((cfg or {}).get("street") or {}).get("parking") or []
    for k, r in enumerate(rules):
        if r.get("art") not in ARTEN + ("keine",):
            raise ValueError(f"street.parking[{k}]: art muss laengs, schraeg, senkrecht oder keine sein")
    return rules


def _passt(rule, x, y, t, facades) -> bool:
    """Trifft die Regel auf den Punkt (x, y) eines Streifens mit Richtung t zu? Alle Angaben müssen passen."""
    if "bereich" in rule:
        x0, y0, x1, y1 = rule["bereich"]
        if not (min(x0, x1) <= x <= max(x0, x1) and min(y0, y1) <= y <= max(y0, y1)):
            return False
    if "polygon" in rule and not K.point_in_poly(x, y, rule["polygon"]):
        return False
    if "strasse" in rule:
        f = facades.get(rule["strasse"])
        if f is None:
            raise ValueError(f"street.parking: Fassade {rule['strasse']} gibt es nicht in facades")
        if abs(t[0] * f.t[0] + t[1] * f.t[1]) < 0.94:        # nicht parallel (über 20 Grad)
            return False
        aus = -f.ud(x, y)[1]                                  # Abstand vor der Fassadenflucht
        g = rule.get("grenze", 8.0)
        seite = rule.get("seite")
        if seite == "haus" and not (0.0 <= aus < g):
            return False
        if seite == "gegenueber" and not (g <= aus < 30.0):
            return False
        if seite is None and not (0.0 <= aus < 30.0):
            return False
    return True


def _querschnitt(uds, u):
    """Größtes Intervall (d0, d1) des Polygons (in Streifenkoordinaten) an der Stelle u."""
    ds = []
    n = len(uds)
    for i in range(n):
        (ua, da), (ub, db) = uds[i], uds[(i + 1) % n]
        if (ua > u) != (ub > u):
            ds.append(da + (db - da) * (u - ua) / (ub - ua))
    ds.sort()
    best = None
    for i in range(0, len(ds) - 1, 2):
        if best is None or ds[i + 1] - ds[i] > best[1] - best[0]:
            best = (ds[i], ds[i + 1])
    return best


def _median(v):
    v = sorted(v)
    return v[len(v) // 2]


def _in_layer(ctx_index, x, y):
    for x0, x1, y0, y1, poly in ctx_index:
        if x0 <= x <= x1 and y0 <= y <= y1 and K.point_in_poly(x, y, poly):
            return True
    return False


def _index(ctx, layers):
    out = []
    for s in ctx["surfaces"]:
        if s["layer"] in layers and len(s["poly"]) >= 3:
            xs = [p[0] for p in s["poly"]]
            ys = [p[1] for p in s["poly"]]
            out.append((min(xs), max(xs), min(ys), max(ys), s["poly"]))
    return out


def stellplaetze(ctx, cfg, radius: float = 200.0) -> list[dict]:
    """Berechnet alle Parkstreifen im Radius mit ihren Abschnitten und Stellplätzen.

    Rückgabe je Streifen: {poly, breite, abschnitte: [{art, winkel, raster, belegung, regel, breite, plaetze}]}.
    Ein Platz: {pos: (x, y), achse: (ax, ay) Fahrzeugrichtung, laenge, breite, art}."""
    rules = _regeln(cfg)
    facades = {k: K.Facade(k, tuple(v["a"]), tuple(v["b"])) for k, v in ((cfg or {}).get("facades") or {}).items()}
    gehsteig = _index(ctx, GEHSTEIG_LAYER)
    scheiben = [tuple(t["pos"]) for t in ctx.get("trees", [])]
    out = []
    for s in ctx["surfaces"]:
        poly = s["poly"]
        if s["layer"] != PARK_LAYER or len(poly) < 3:
            continue
        cx = sum(p[0] for p in poly) / len(poly)
        cy = sum(p[1] for p in poly) / len(poly)
        if math.hypot(cx, cy) > radius:
            continue
        # Hauptrichtung = längste Kante, Breite quer dazu
        edges = [(poly[i], poly[(i + 1) % len(poly)]) for i in range(len(poly))]
        p1, p2 = max(edges, key=lambda e: math.dist(*e))
        f = K.Facade("p", tuple(p1), tuple(p2))
        uds = [f.ud(*p) for p in poly]
        u0, u1 = min(u for u, _ in uds), max(u for u, _ in uds)
        if u1 - u0 < 4.0:
            continue
        us = [u0 + 0.125 + 0.25 * k for k in range(int((u1 - u0) / 0.25))]
        qs = [_querschnitt(uds, u) for u in us]
        voll = [q for q in qs if q]
        if not voll:
            continue
        d0, d1 = _median([q[0] for q in voll]), _median([q[1] for q in voll])
        breite = d1 - d0
        if breite < 1.7:
            continue
        dm = (d0 + d1) / 2
        # Bordsteinseite: dort grenzt der Streifen an einen Gehsteig
        bord = None
        for d_test, seite in ((d0 - 0.4, d0), (d1 + 0.4, d1)):
            treffer = sum(_in_layer(gehsteig, *f.p(u, d_test, 0)[:2]) for u in us[::8])
            if treffer > len(us[::8]) / 2:
                bord = seite
        # Abschnitte: zusammenhängende Stellen mit voller Breite und derselben Regel
        runs, cur = [], None
        for u, q in zip(us, qs):
            ok = q is not None and (q[1] - q[0]) >= 0.75 * breite
            rid = None
            if ok:
                x, y, _ = f.p(u, dm, 0)
                rid = next((k for k, r in enumerate(rules) if _passt(r, x, y, f.t, facades)), -1)
            if ok and cur and cur["rid"] == rid:
                cur["b"] = u + 0.125
            else:
                cur = {"rid": rid, "a": u - 0.125, "b": u + 0.125} if ok else None
                if cur:
                    runs.append(cur)
        abschnitte = []
        for run in runs:
            rule = rules[run["rid"]] if run["rid"] >= 0 else {}
            art, winkel = automatik(breite)
            if rule:
                art = rule["art"]
                winkel = {"laengs": 0.0, "schraeg": 60.0, "senkrecht": 90.0, "keine": 0.0}[art]
            if art == "schraeg" and "winkel" in rule:
                winkel = float(rule["winkel"])
            w = math.radians(abs(winkel))
            if art == "laengs":
                raster, rand, laenge, quer = rule.get("raster", 5.7), 0.3, 5.2, 2.0
            elif art == "senkrecht":
                raster, rand, laenge, quer = rule.get("raster", 2.5), 0.0, 4.8, rule.get("raster", 2.5) - 0.2
            else:
                raster = rule.get("raster", 2.5) / max(math.sin(w), 0.5)
                rand, laenge, quer = AUTO_L * math.cos(w), 4.8, rule.get("raster", 2.5) - 0.2
            tiefe = AUTO_L * math.sin(w) + AUTO_B * math.cos(w)          # Platzbedarf quer zum Bordstein
            if art == "laengs" or bord is None:
                dc = dm
            elif bord == d0:
                dc = d0 + 0.25 + tiefe / 2
            else:
                dc = d1 - 0.25 - tiefe / 2
            lr = run["b"] - run["a"]
            n = 0 if art == "keine" else int((lr - rand) / raster + 1e-6)
            start = run["a"] + (lr - n * raster) / 2
            # Fahrzeugachse: Nase zum Bordstein, Schrägstellung in Fahrtrichtung bei Rechtsverkehr (Bordstein rechts).
            # Ein negativer Winkel dreht die Schrägstellung um (Einbahn mit Parkstreifen links).
            c = (-f.n[0], -f.n[1]) if bord != d0 else f.n            # Richtung zum Bordstein
            v = (-c[1], c[0])                                         # Fahrtrichtung, Bordstein rechts
            if winkel < 0:
                v = (-v[0], -v[1])
            ca, sa = math.cos(w), math.sin(w)
            achse = (v[0] * ca + c[0] * sa, v[1] * ca + c[1] * sa)
            plaetze = []
            for k in range(n):
                uc = start + (k + 0.5) * raster
                # Platz muss an drei Stellen im Streifen liegen (Baumscheiben und Vorziehungen bleiben frei)
                if not all(K.point_in_poly(*f.p(uc + du, dm, 0)[:2], poly) for du in (-0.8, 0.0, 0.8)):
                    continue
                x, y, _ = f.p(uc, dc, 0)
                if any(math.hypot(x - bx, y - by) < 1.9 for bx, by in scheiben):
                    continue                                          # Baumscheibe im Streifen (Baumkataster)
                plaetze.append({"pos": (round(x, 3), round(y, 3)), "achse": achse, "laenge": laenge,
                                "breite": quer, "art": art})
            abschnitte.append({"art": art, "winkel": abs(winkel) if art != "laengs" else 0.0, "raster": round(raster, 2),
                               "belegung": float(rule.get("belegung", BELEGUNG)), "regel": rule.get("name") or
                               (f"Regel {run['rid'] + 1}" if rule else "Automatik"), "breite": round(breite, 2),
                               "von": tuple(round(v, 2) for v in f.p(run["a"], dm, 0)[:2]),
                               "bis": tuple(round(v, 2) for v in f.p(run["b"], dm, 0)[:2]), "plaetze": plaetze})
        out.append({"poly": poly, "breite": round(breite, 2), "mitte": (round(cx, 1), round(cy, 1)),
                    "abschnitte": abschnitte})
    return out


def ecken(platz, laenge=None, breite=None):
    """Eckpunkte eines Stellplatzes (oder Autos mit eigener Länge und Breite) im lokalen System."""
    (x, y), (ax, ay) = platz["pos"], platz["achse"]
    l2, b2 = (laenge or platz["laenge"]) / 2, (breite or platz["breite"]) / 2
    bx, by = -ay, ax
    return [(x + ax * a + bx * b, y + ay * a + by * b) for a, b in ((-l2, -b2), (l2, -b2), (l2, b2), (-l2, b2))]


# ---------------------------------------------------------------- Messung vor dem Objekt
def _gehsteigbreite(f, u, gehsteig, fahr):
    """Abstand von der Fassade bis zum Bordstein an der Stelle u: Ende des Gehsteigs in Richtung Straße."""
    d, drin = 0.0, False
    while d < 15.0:
        d += 0.02
        x, y, _ = f.p(u, -d, 0)
        g = _in_layer(gehsteig, x, y)
        if g:
            drin = True
        elif drin or _in_layer(fahr, x, y):
            return round(d - 0.02, 2)
    return None


def messen(ctx, cfg, streifen) -> list[dict]:
    """Je Fassade des Objekts: Gehsteigbreite an fünf Stellen, Parkordnung, Stellplätze, Baumscheiben."""
    from . import trees as T
    gehsteig, fahr = _index(ctx, GEHSTEIG_LAYER), _index(ctx, FAHR_LAYER)
    park = _index(ctx, (PARK_LAYER,))
    baeume = T.apply_override(ctx["trees"], cfg.get("trees_override"))
    rows = []
    for name, v in cfg["facades"].items():
        f = K.Facade(name, tuple(v["a"]), tuple(v["b"]))
        stellen = []
        for k in (0.1, 0.3, 0.5, 0.7, 0.9):
            u = f.length * k
            b = _gehsteigbreite(f, u, gehsteig, fahr)
            danach = None
            if b is not None:
                x, y, _ = f.p(u, -(b + 0.3), 0)
                danach = "Parkstreifen" if _in_layer(park, x, y) else "Fahrbahn"
            stellen.append({"u": round(u, 1), "breite": b, "danach": danach, "pos": [round(c, 2) for c in f.p(u, 0, 0)[:2]]})
        seiten = {"haus": {}, "gegenueber": {}}
        for s in streifen:
            for ab in s["abschnitte"]:
                for p in ab["plaetze"]:
                    u, d = f.ud(*p["pos"])
                    if 0.0 <= u <= f.length and 0.0 < -d < 30.0:
                        key = (ab["art"], ab["winkel"], ab["regel"], ab["breite"])
                        seite = seiten["haus" if -d < 8.0 else "gegenueber"]
                        seite[key] = seite.get(key, 0) + 1
        def liste(d):
            return [{"art": a, "winkel": w, "regel": r, "streifenbreite": b, "plaetze": n} for (a, w, r, b), n in d.items()]
        def vor(t):
            u, d = f.ud(*t["pos"])
            return 0.0 <= u <= f.length and 0.0 < -d < 8.0
        scheiben = [t for t in ctx["trees"] if vor(t)]
        rows.append({"fassade": name, "laenge": round(f.length, 2), "gehsteig": stellen,
                     "parken_haus": liste(seiten["haus"]), "parken_gegenueber": liste(seiten["gegenueber"]),
                     "baumscheiben": len(scheiben), "baeume": sum(1 for t in baeume if vor(t)),
                     "baumscheiben_pos": [[round(c, 1) for c in t["pos"]] for t in scheiben]})
    return rows


# ---------------------------------------------------------------- Prüfbild
FARBE = {"objekt": (255, 0, 255), "bordstein": (255, 235, 0), "gehsteig": (0, 235, 255), "streifen": (255, 255, 255),
         "laengs": (70, 150, 255), "schraeg": (255, 150, 0), "senkrecht": (255, 40, 40), "baum": (60, 255, 60),
         "scheibe": (160, 255, 160), "mass": (255, 255, 255), "auto": (150, 70, 255),
         "frei_belegung": (200, 200, 200), "frei_kante": (255, 0, 0), "frei_uneben": (255, 120, 0),
         "frei_hindernis": (255, 0, 160)}


def _font(size):
    from PIL import ImageFont
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVuSans.ttf", "Arial.ttf"):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def _bordsteine(ctx, half, mitte):
    """Kanten der Gehsteigflächen, die an Fahrbahn oder Parkstreifen grenzen."""
    fahr = _index(ctx, FAHR_LAYER)
    segs = []
    for s in ctx["surfaces"]:
        poly = s["poly"]
        if s["layer"] not in GEHSTEIG_LAYER or len(poly) < 3:
            continue
        if not any(abs(p[0] - mitte[0]) < half + 5 and abs(p[1] - mitte[1]) < half + 5 for p in poly):
            continue
        sgn = 1.0 if K.polygon_area(poly) > 0 else -1.0
        for i in range(len(poly)):
            a, b = poly[i], poly[(i + 1) % len(poly)]
            L = math.dist(a, b)
            if L < 1e-3:
                continue
            nx, ny = (b[1] - a[1]) / L * sgn, -(b[0] - a[0]) / L * sgn      # nach außen
            mx, my = (a[0] + b[0]) / 2 + nx * 0.2, (a[1] + b[1]) / 2 + ny * 0.2
            if _in_layer(fahr, mx, my):
                segs.append((a, b))
    return segs


def pruefen(project_dir: Path, cfg=None, ctx=None, cache_dir: Path | None = None) -> dict:
    """Schreibt renders/check/strasse_abgleich.jpg, .md und .json. Braucht Netz für das Orthofoto (oder Cache)."""
    import yaml
    from PIL import Image, ImageDraw
    from . import roofs as R
    from . import trees as T
    project_dir = Path(project_dir)
    cfg = cfg or yaml.safe_load((project_dir / "project.yaml").read_text())
    ctx = ctx or json.loads((project_dir / "data" / "context.json").read_text())
    opt = (cfg.get("street") or {}).get("parking_check") or {}
    half, mpp = float(opt.get("umkreis_m", 60)), float(opt.get("m_je_pixel", 0.05))
    hero = max((h["poly"] for h in ctx["hero"]), key=lambda p: abs(K.polygon_area(p)))
    mx = (min(p[0] for p in hero) + max(p[0] for p in hero)) / 2
    my = (min(p[1] for p in hero) + max(p[1] for p in hero)) / 2
    cache_dir = cache_dir or project_dir / "data" / "ortho_cache"
    ort = R.Ortho(ctx, half + max(abs(mx), abs(my)) + 3, 21, cache_dir)
    # Orthofoto ins lokale System drehen: x nach rechts, y nach oben (Fassaden liegen dann waagrecht und senkrecht)
    n = int(round(2 * half / mpp))
    o = ort.pixel(mx - half, my + half)
    ex = ort.pixel(mx - half + mpp, my + half)
    ey = ort.pixel(mx - half, my + half - mpp)
    koeff = (ex[0] - o[0], ey[0] - o[0], o[0], ex[1] - o[1], ey[1] - o[1], o[1])
    img = ort.img.transform((n, n), Image.AFFINE, koeff, Image.BICUBIC)
    d = ImageDraw.Draw(img)
    P = lambda x, y: ((x - (mx - half)) / mpp, ((my + half) - y) / mpp)
    sicht = lambda poly: any(abs(p[0] - mx) < half + 2 and abs(p[1] - my) < half + 2 for p in poly)
    ring = lambda poly, **kw: d.line([P(*p) for p in poly] + [P(*poly[0])], **kw)

    streifen = stellplaetze(ctx, cfg, half * 1.5 + math.hypot(mx, my))
    zeilen = messen(ctx, cfg, streifen)
    for s in ctx["surfaces"]:
        if s["layer"] in GEHSTEIG_LAYER and len(s["poly"]) >= 3 and sicht(s["poly"]):
            ring(s["poly"], fill=FARBE["gehsteig"], width=1)
    for s in streifen:
        if sicht(s["poly"]):
            ring(s["poly"], fill=FARBE["streifen"], width=1)
    for a, b in _bordsteine(ctx, half, (mx, my)):
        d.line([P(*a), P(*b)], fill=FARBE["bordstein"], width=3)
    zahl = {a: 0 for a in ARTEN}
    for s in streifen:
        for ab in s["abschnitte"]:
            for p in ab["plaetze"]:
                if abs(p["pos"][0] - mx) < half and abs(p["pos"][1] - my) < half:
                    zahl[p["art"]] += 1
                    ring(ecken(p), fill=FARBE[p["art"]], width=2)
    for t in ctx["trees"]:                                   # Baumscheiben laut Kataster
        c = P(*t["pos"])
        d.rectangle([c[0] - 0.9 / mpp, c[1] - 0.9 / mpp, c[0] + 0.9 / mpp, c[1] + 0.9 / mpp], outline=FARBE["scheibe"], width=1)
    for t in T.apply_override(ctx["trees"], cfg.get("trees_override")):
        c, r = P(*t["pos"]), t["crown"] / 2 / mpp
        d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=FARBE["baum"], width=3)
    n_autos = 0
    lage_p = project_dir / "renders" / "check" / "autos_lage.json"
    if lage_p.exists():                                     # gesetzte Autos (immoviz.py autos-pruefen bzw. render)
        lage_j = json.loads(lage_p.read_text())
        lage_j = lage_j if isinstance(lage_j, dict) else {"autos": lage_j, "frei": []}
        for f_ in lage_j.get("frei", []):                   # freie Buchten mit Grund
            if abs(f_["x"] - mx) > half or abs(f_["y"] - my) > half:
                continue
            c_ = P(f_["x"], f_["y"])
            col = FARBE["frei_" + f_["grund"]] if "frei_" + f_["grund"] in FARBE else (255, 255, 255)
            r_ = 0.7 / mpp
            d.line([(c_[0] - r_, c_[1] - r_), (c_[0] + r_, c_[1] + r_)], fill=col, width=4)
            d.line([(c_[0] - r_, c_[1] + r_), (c_[0] + r_, c_[1] - r_)], fill=col, width=4)
        for a_ in lage_j.get("autos", []):
            if abs(a_["x"] - mx) > half or abs(a_["y"] - my) > half:
                continue
            w_ = math.radians(a_["richtung_grad"])
            cw, sw = math.cos(w_), math.sin(w_)
            L2, B2 = a_["laenge"] / 2, a_["breite"] / 2
            ek = [(a_["x"] + cw * u - sw * v, a_["y"] + sw * u + cw * v) for u, v in ((L2, B2), (L2, -B2), (-L2, -B2), (-L2, B2))]
            ring(ek, fill=FARBE["auto"], width=3)
            spitze = (a_["x"] + cw * L2, a_["y"] + sw * L2)
            d.line([P(a_["x"], a_["y"]), P(*spitze)], fill=FARBE["auto"], width=3)     # Front
            n_autos += 1
    for h in ctx["hero"]:
        ring(h["poly"], fill=FARBE["objekt"], width=5)
    f_kl, f_gr = _font(22), _font(30)
    def text(xy, s, font=f_kl, fill=(255, 255, 255)):
        d.text(xy, s, font=font, fill=fill, stroke_width=3, stroke_fill=(0, 0, 0))
    for z in zeilen:                                         # Gehsteigbreiten an den Messstellen
        f = K.Facade(z["fassade"], tuple(cfg["facades"][z["fassade"]]["a"]), tuple(cfg["facades"][z["fassade"]]["b"]))
        for m in z["gehsteig"]:
            if m["breite"] is None:
                continue
            a, b = P(*f.p(m["u"], 0, 0)[:2]), P(*f.p(m["u"], -m["breite"], 0)[:2])
            d.line([a, b], fill=FARBE["mass"], width=3)
            text((b[0] + 6, b[1] + 4), f"{m['breite']:.2f}".replace(".", ","))
    # Maßstab, Nordpfeil, Legende, Quelle
    bx, by = 40, n - 60
    d.rectangle([bx - 12, by - 44, bx + 20 / mpp + 12, by + 22], fill=(0, 0, 0))
    for k in range(4):
        d.rectangle([bx + k * 5 / mpp, by, bx + (k + 1) * 5 / mpp, by + 10], fill=(255, 255, 255) if k % 2 == 0 else (120, 120, 120),
                    outline=(255, 255, 255))
    d.text((bx, by - 38), "0", font=f_kl, fill=(255, 255, 255))
    d.text((bx + 20 / mpp - 60, by - 38), "20 m", font=f_kl, fill=(255, 255, 255))
    a0 = math.radians(ctx["frame"]["x_axis_deg"])
    nx, ny = math.sin(a0), math.cos(a0)                      # Nordrichtung im lokalen System
    cxn, cyn, L = n - 110, 130, 80
    d.ellipse([cxn - 100, cyn - 100, cxn + 100, cyn + 100], fill=(0, 0, 0))
    sp = (cxn + nx * L, cyn - ny * L)
    fu = (cxn - nx * L, cyn + ny * L)
    d.line([fu, sp], fill=(255, 255, 255), width=5)
    for s_ in (1, -1):
        d.line([sp, (sp[0] - nx * 28 + s_ * ny * 16, sp[1] + ny * 28 + s_ * nx * 16)], fill=(255, 255, 255), width=5)
    d.text((cxn - nx * 20 - 12 + ny * 34, cyn + ny * 20 - 16 + nx * 34), "N", font=f_gr, fill=(255, 255, 255))
    leg = [("objekt", "Objekt (Baukörper)", 5), ("bordstein", "Bordstein", 3), ("gehsteig", "Gehsteigfläche", 1),
           ("streifen", "Parkstreifen", 1), ("laengs", f"Stellplatz längs ({zahl['laengs']})", 2),
           ("schraeg", f"Stellplatz schräg ({zahl['schraeg']})", 2), ("senkrecht", f"Stellplatz senkrecht ({zahl['senkrecht']})", 2),
           ("baum", "Baum, Krone im Modell", 3), ("scheibe", "Baumscheibe laut Kataster", 1),
           ("mass", "Gehsteigbreite in m", 3)] + ([("auto", f"Auto im Modell ({n_autos}), Strich zur Front", 3), ("frei_belegung", "frei: Zufallsbelegung", 4),
                  ("frei_kante", "frei: Rad auf Kante", 4), ("frei_uneben", "frei: Untergrund uneben", 4),
                  ("frei_hindernis", "frei: Hindernis", 4)] if n_autos else [])
    lx, ly = 28, 28
    d.rectangle([lx - 12, ly - 12, lx + 440, ly + len(leg) * 32 + 44], fill=(0, 0, 0))
    d.text((lx, ly), f"Straßenabgleich {cfg.get('project', {}).get('name', project_dir.name)}", font=f_kl, fill=(255, 255, 255))
    for k, (key, label, w) in enumerate(leg):
        yy = ly + 44 + k * 32
        d.line([(lx, yy + 12), (lx + 44, yy + 12)], fill=FARBE[key], width=max(w, 2))
        d.text((lx + 58, yy), label, font=f_kl, fill=(255, 255, 255))
    q = f"{QUELLE}. Überlagerung: immoviz Modell."
    tw = d.textlength(q, font=f_kl)
    d.rectangle([n - tw - 36, n - 50, n, n], fill=(0, 0, 0))
    d.text((n - tw - 18, n - 40), q, font=f_kl, fill=(255, 255, 255))

    out_dir = project_dir / "renders" / "check"
    out_dir.mkdir(parents=True, exist_ok=True)
    jpg = out_dir / "strasse_abgleich.jpg"
    img.save(jpg, quality=86)
    ab_liste = [{k: v for k, v in ab.items() if k != "plaetze"} | {"plaetze": len(ab["plaetze"]), "streifen": s["mitte"]}
                for s in streifen for ab in s["abschnitte"]
                if any(abs(p["pos"][0] - mx) < half and abs(p["pos"][1] - my) < half for p in ab["plaetze"])]
    res = {"projekt": project_dir.name, "quelle": QUELLE, "umkreis_m": half, "m_je_pixel": mpp,
           "kacheln_fehlend": ort.fehlend, "stellplaetze_im_bild": zahl, "fassaden": zeilen, "abschnitte": ab_liste}
    (out_dir / "strasse_abgleich.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    (out_dir / "strasse_abgleich.md").write_text(_markdown(res))
    return {"bild": str(jpg), "tabelle": str(out_dir / "strasse_abgleich.md"), "kacheln_fehlend": ort.fehlend,
            "stellplaetze_im_bild": zahl,
            "fassaden": [{"fassade": z["fassade"], "gehsteig_m": [m["breite"] for m in z["gehsteig"]],
                          "parken_haus": [f"{p['art']} {p['plaetze']}" for p in z["parken_haus"]],
                          "parken_gegenueber": [f"{p['art']} {p['plaetze']}" for p in z["parken_gegenueber"]],
                          "baumscheiben": z["baumscheiben"]} for z in zeilen]}


def _markdown(res) -> str:
    komma = lambda v: "offen" if v is None else f"{v:.2f}".replace(".", ",")
    def park(liste):
        if not liste:
            return "kein Parkstreifen"
        return "; ".join(f"{ART_TEXT[p['art']]}" + (f" {p['winkel']:.0f} Grad" if p["art"] == "schraeg" else "") +
                         f", {p['plaetze']} Plätze, Streifen {komma(p['streifenbreite'])} m ({p['regel']})" for p in liste)
    z = [f"# Straßenabgleich {res['projekt']}", "",
         "Erzeugt mit `immoviz.py strasse`. Prüfbild: `strasse_abgleich.jpg` (Orthofoto mit Überlagerung aus dem Modell).",
         f"Ausschnitt {2 * res['umkreis_m']:.0f} m, {res['m_je_pixel'] * 100:.0f} cm je Pixel. {res['quelle']}.", "",
         "## Vor dem Objekt", "",
         "| Fassade | Länge | Gehsteigbreite im Modell (Fassade bis Bordstein, 5 Stellen) | Parkordnung Hausseite | Parkordnung gegenüber | Baumscheiben (davon mit Baum) |",
         "|---|---|---|---|---|---|"]
    for f in res["fassaden"]:
        b = [m["breite"] for m in f["gehsteig"] if m["breite"] is not None]
        spanne = f" (min {komma(min(b))}, max {komma(max(b))})" if b else ""
        z.append(f"| {f['fassade']} | {komma(f['laenge'])} m | " + " / ".join(komma(m["breite"]) for m in f["gehsteig"]) +
                 f" m{spanne} | {park(f['parken_haus'])} | {park(f['parken_gegenueber'])} | "
                 f"{f['baumscheiben']} ({f['baeume']}) |")
    z += ["", "Messstellen bei 10, 30, 50, 70 und 90 % der Fassadenlänge. Größere Werte am Fassadenende zeigen eine "
          "Gehsteigvorziehung an der Kreuzung.", "", "## Parkstreifen im Ausschnitt", "",
          "| Streifen (Mitte lokal) | Abschnitt von | bis | Breite | Parkordnung | Raster | Plätze | Belegung | Regel |",
          "|---|---|---|---|---|---|---|---|---|"]
    for a in res["abschnitte"]:
        art = ART_TEXT[a["art"]] + (f" {a['winkel']:.0f} Grad" if a["art"] == "schraeg" else "")
        k1 = lambda v: f"{v:.1f}".replace(".", ",")
        z.append(f"| {k1(a['streifen'][0])} / {k1(a['streifen'][1])} | {k1(a['von'][0])} / {k1(a['von'][1])} | "
                 f"{k1(a['bis'][0])} / {k1(a['bis'][1])} | "
                 f"{komma(a['breite'])} m | {art} | {komma(a['raster'])} m | {a['plaetze']} | {a['belegung'] * 100:.0f} % | {a['regel']} |")
    z += ["", "## Prüfen", "",
          "1. Liegen die Stellplatz-Rechtecke auf den Autos im Orthofoto (Richtung und Raster)? Sonst Regel in "
          "`street.parking` anpassen.",
          "2. Liegen Bordsteinlinien und Gehsteigflächen auf dem Orthofoto (Abweichung unter 0,5 m)?",
          "3. Stehen Baumkreise auf den Baumscheiben, stimmt die Kronengröße? Sonst `trees_override`.",
          "4. Erst danach Renderings für den Vertrieb freigeben.", ""]
    return "\n".join(z)


# ---------------------------------------------------------------- Street View (optional, nur interne Referenz)
def streetview(project_dir: Path, key: str) -> list:
    """Je Fassade ein Street-View-Bild entlang des Gehsteigs neben einem Modell-Rendering derselben Ansicht.

    Ergebnis in renders/streetview/strasse_<fassade>_vergleich.jpg (nicht im Repo, nur interne Referenz).
    Der Schlüssel wird nur im Speicher weitergereicht und nie geschrieben."""
    from . import build as B
    from . import check as C
    cfg, ctx = B.load_project(Path(project_dir))
    ansichten = {}
    for name, v in cfg["facades"].items():
        f = K.Facade(name, tuple(v["a"]), tuple(v["b"]))
        # Standpunkt auf der Fahrbahn vor dem Fassadenanfang und vor dem Fassadenende, Blick entlang des Gehsteigs
        ansichten[f"strasse_{name}_a"] = {"pos": list(f.p(-10.0, -5.5, 0)[:2]), "target": list(f.p(f.length * 0.8, -1.5, 0)[:2]),
                                          "pitch": 0, "fov": 90}
        ansichten[f"strasse_{name}_b"] = {"pos": list(f.p(f.length + 10.0, -5.5, 0)[:2]), "target": list(f.p(f.length * 0.2, -1.5, 0)[:2]),
                                          "pitch": 0, "fov": 90}
    scene = B.build_scene(cfg, ctx)
    B.setup_render(scene, (640, 640), 24)
    B.setup_light(scene, cfg, ctx, cfg.get("streetview_light", "dunst_hell"))
    return C.streetview_compare(scene, {**cfg, "streetview_checks": ansichten}, ctx,
                                Path(project_dir) / "renders" / "streetview", key, getattr(B, "LAST_TERRAIN", None))


# ---------------------------------------------------------------- OGD Straßenausstattung (Stadt Wien, WFS)
# Geprüft mit DescribeFeatureType am 18.11.2026 (Felder in Klammern); Layer ohne Objekte im Umkreis bleiben leer.
OGD_LAYER = {
    "absenkungen": ("SISGEHSTEIGABSOGD", ("ABSENKUNG_TXT",)),                         # Punkte: "0 cm" | "bis 3 cm abgesenkt"
    "fahrradabstellanlagen": ("FAHRRADABSTELLANLAGEOGD", ("ADRESSE", "ANZAHL", "ART_TXT")),   # Punkte, Anzahl Räder
    "motorradabstellplaetze": ("MOTORRADABSTELLPLATZOGD", ("STRASSE", "STELLPL_ANZ", "ZEITRAUM")),
    "radgegeneinbahn": ("RADGEGENEINBAHNOG", ("DIRECTION_NAME", "BASETYPE_NAME", "EDGE_FEATURENAME")),  # Linien
    "einbahn": ("EINBAHNOGD", ("DIRECTION_NAME",)),                                    # Linien, Richtung zur Graphkante
    "begegnungszonen": ("BEGEGNUNGSZONEOGD", ("ADRESSE",)),
    "kurzparkstreifen": ("KURZPARKSTREIFENOGD", ("STRNAM", "GELTUNGSBEREICH", "ZEITRAUM", "DAUER")),
    "behindertenparkplaetze": ("BEHINDERTENPARKPLATZOGD", ("STRNAM", "STELLPL_ANZ", "KATEGORIE_TXT", "ONR_VON")),
    "hydranten": ("HYDRANTOGD", ()),
    "ladezonen": ("LADEZONEOGD", ("ADRESSE",)),
    "strassengraph": ("STRASSENGRAPHOGD", ("FEATURENAME", "EDGECATEGORY_NAME", "FRC_NAME", "FOW_NAME")),
}
OGD_DATEI = Path("data") / "strassen_ogd.json"
OGD_QUELLE = "Stadt Wien, data.wien.gv.at (CC BY 4.0), WFS"


def ogd_laden(project_dir: Path, radius: float = 220.0, neu: bool = False) -> dict:
    """Lädt die Straßenausstattung der Stadt Wien im Umkreis und speichert sie im lokalen System
    (data/strassen_ogd.json). Je Layer eine Liste {typ: punkt|linie|flaeche, pts: [[x, y], ...], props}."""
    from . import geo_wien as G
    project_dir = Path(project_dir)
    pfad = project_dir / OGD_DATEI
    if pfad.exists() and not neu:
        d = json.loads(pfad.read_text())
        if d.get("radius_m", 0) >= radius and set(OGD_LAYER) <= set(d.get("layer", {})):
            return d
    ctx = json.loads((project_dir / "data" / "context.json").read_text())
    fr = G.LocalFrame(*ctx["frame"]["origin_gk"], ctx["frame"]["x_axis_deg"])
    out = {"quelle": OGD_QUELLE, "radius_m": radius, "layer": {}, "fehler": {}}
    for key, (layer, felder) in OGD_LAYER.items():
        try:
            fs = G.fetch_layer(layer, ctx["lat"], ctx["lon"], radius)
        except Exception as e:                       # Layer nicht erreichbar: leer, aber vermerkt
            out["layer"][key], out["fehler"][key] = [], str(e)[:200]
            continue
        liste = []
        for f in fs:
            g = f.get("geometry")
            if not g:
                continue
            t, co = g["type"], g["coordinates"]
            if t == "Point":
                teile = [("punkt", [co])]
            elif t == "MultiPoint":
                teile = [("punkt", [c]) for c in co]
            elif t == "LineString":
                teile = [("linie", co)]
            elif t == "MultiLineString":
                teile = [("linie", c) for c in co]
            elif t == "Polygon":
                teile = [("flaeche", co[0])]
            elif t == "MultiPolygon":
                teile = [("flaeche", c[0]) for c in co]
            else:
                continue
            props = {k: f["properties"].get(k) for k in felder}
            for typ, pts in teile:
                liste.append({"typ": typ, "pts": [list(fr(*p[:2])) for p in pts], "props": props})
        out["layer"][key] = liste
    pfad.parent.mkdir(parents=True, exist_ok=True)
    pfad.write_text(json.dumps(out, ensure_ascii=False, indent=0))
    return out


def _naechste_kante(segs, x, y):
    """Nächstes Bordsteinsegment zu (x, y): (Abstand, Fußpunkt, Richtung entlang, Normale zur Fahrbahn)."""
    best = None
    for a, b in segs:
        dx, dy = b[0] - a[0], b[1] - a[1]
        L2 = dx * dx + dy * dy
        if L2 < 1e-6:
            continue
        t = max(0.0, min(1.0, ((x - a[0]) * dx + (y - a[1]) * dy) / L2))
        px, py = a[0] + t * dx, a[1] + t * dy
        d = math.hypot(x - px, y - py)
        if best is None or d < best[0]:
            L = math.sqrt(L2)
            best = (d, (px, py), (dx / L, dy / L), a, b)
    return best


def _fahrbahn_normale(fahr, p, t):
    """Normale zur Kante t im Punkt p, die auf die Fahrbahn zeigt."""
    n = (-t[1], t[0])
    if _in_layer(fahr, p[0] + n[0] * 0.4, p[1] + n[1] * 0.4):
        return n
    return (t[1], -t[0])


def _streifen_achse(poly):
    """Lange Achse eines schmalen Streifens: (Mitte, Richtung u, Normale v, halbe Länge, halbe Breite)."""
    cx = sum(p[0] for p in poly) / len(poly)
    cy = sum(p[1] for p in poly) / len(poly)
    best = None
    for k in range(180):
        w = math.radians(k)
        u = (math.cos(w), math.sin(w))
        us = [(p[0] - cx) * u[0] + (p[1] - cy) * u[1] for p in poly]
        vs = [-(p[0] - cx) * u[1] + (p[1] - cy) * u[0] for p in poly]
        if best is None or max(vs) - min(vs) < best[0]:
            best = (max(vs) - min(vs), u, min(us), max(us), min(vs), max(vs))
    _, u, u0, u1, v0, v1 = best
    return {"mitte": (cx, cy), "u": u, "v": (-u[1], u[0]), "u0": u0, "u1": u1, "v0": v0, "v1": v1}


def ogd_elemente(ctx, cfg, ogd, radius: float = 160.0) -> list[dict]:
    """Leitet aus OGD und Flächenmehrzweckkarte Straßenelemente ab (Liste wie `strassenelemente` in project.yaml):
    Gehsteigüberfahrten (zwei Fahrbahnschwellen mit niveaugleicher Absenkung "0 cm" dazwischen), Fahrbahnschwellen,
    Gehsteigabsenkungen ("bis 3 cm"), Fahrradständer, Motorradabstellplätze (Markierung), Leitlinie und Radpiktogramme
    bei Radfahren gegen die Einbahn, Hydranten. Abschaltbar je Art über `strassenelemente_auto: {<art>: false}`."""
    auto = (cfg or {}).get("strassenelemente_auto") or {}
    an = lambda k: auto.get(k, True) is not False
    L = (ogd or {}).get("layer", {})
    fahr = _index(ctx, ("Fahrbahn", "Fahrbahnschwelle", "Zebrastreifen"))
    segs = _bordsteine(ctx, radius, (0.0, 0.0))
    nah = lambda p: math.hypot(p[0], p[1]) < radius
    out = []
    # Gehsteigüberfahrten und Fahrbahnschwellen
    schwellen = [s for s in ctx["surfaces"] if s["layer"] == "Fahrbahnschwelle" and len(s["poly"]) >= 3 and
                 nah(s["poly"][0])]
    achsen = [_streifen_achse(s["poly"]) for s in schwellen]
    null = [a["pts"][0] for a in L.get("absenkungen", []) if "0 cm" in str(a["props"].get("ABSENKUNG_TXT"))]
    benutzt = set()
    for i in range(len(achsen)):
        for j in range(i + 1, len(achsen)):
            A, B = achsen[i], achsen[j]
            if abs(A["u"][0] * B["u"][0] + A["u"][1] * B["u"][1]) < 0.97:
                continue
            d = (B["mitte"][0] - A["mitte"][0]) * A["v"][0] + (B["mitte"][1] - A["mitte"][1]) * A["v"][1]
            if not 2.0 < abs(d) < 9.0:
                continue
            mx, my = (A["mitte"][0] + B["mitte"][0]) / 2, (A["mitte"][1] + B["mitte"][1]) / 2
            treffer = [p for p in null if math.hypot(p[0] - mx, p[1] - my) < 8.0]
            if not treffer or not an("ueberfahrten"):
                continue
            benutzt |= {i, j}
            out.append({"typ": "gehsteigueberfahrt", "rampen": [schwellen[i]["poly"], schwellen[j]["poly"]],
                        "hoehe": float(auto.get("ueberfahrt_hoehe", 0.115)),
                        "quelle": "OGD FMZK Fahrbahnschwelle (2 Rampen) und SISGEHSTEIGABSOGD 0 cm "
                                  f"({len(treffer)} Punkte)"})
    for k, s in enumerate(schwellen):
        if k not in benutzt and an("schwellen"):
            out.append({"typ": "fahrbahnschwelle", "poly": s["poly"], "quelle": "OGD FMZK Fahrbahnschwelle"})
    # Gehsteigabsenkungen bis 3 cm
    if an("absenkungen"):
        for a in L.get("absenkungen", []):
            p = a["pts"][0]
            txt = str(a["props"].get("ABSENKUNG_TXT"))
            if "0 cm" in txt or not nah(p):
                continue
            k = _naechste_kante(segs, *p)
            if k is None or k[0] > 3.0:
                continue
            n = _fahrbahn_normale(fahr, k[1], k[2])
            out.append({"typ": "gehsteigabsenkung", "pos": [round(k[1][0], 2), round(k[1][1], 2)],
                        "richtung": [round(n[0], 3), round(n[1], 3)], "laenge": 2.0, "tiefe_cm": 3,
                        "quelle": f"OGD SISGEHSTEIGABSOGD ({txt})"})
    # Fahrradständer: je zwei Räder ein Bügel, quer zum nächsten Bordstein
    if an("fahrradstaender"):
        for a in L.get("fahrradabstellanlagen", []):
            p = a["pts"][0]
            if not nah(p):
                continue
            n_buegel = max(1, int(math.ceil(float(a["props"].get("ANZAHL") or 2) / 2)))
            k = _naechste_kante(segs, *p)
            t = k[2] if k else (1.0, 0.0)
            out.append({"typ": "fahrradstaender", "pos": [round(p[0], 2), round(p[1], 2)], "anzahl": n_buegel,
                        "entlang": [round(t[0], 3), round(t[1], 3)], "abstand": 1.0,
                        "quelle": f"OGD FAHRRADABSTELLANLAGEOGD ({a['props'].get('ADRESSE')}, "
                                  f"{a['props'].get('ANZAHL')} Räder)"})
    if an("motorradplaetze"):
        for a in L.get("motorradabstellplaetze", []):
            pts = a["pts"]
            if not nah(pts[0]):
                continue
            out.append({"typ": "motorradplatz", "pts": pts, "anzahl": a["props"].get("STELLPL_ANZ"),
                        "quelle": "OGD MOTORRADABSTELLPLATZOGD"})
    if an("hydranten"):
        for a in L.get("hydranten", []):
            p = a["pts"][0]
            if nah(p):
                out.append({"typ": "hydrant_ogd", "pos": [round(p[0], 2), round(p[1], 2)],
                            "quelle": "OGD HYDRANTOGD (Lage; Bauart Unterflur, nur Deckel)"})
    # Radfahren gegen die Einbahn: Leitlinie in Fahrbahnmitte und Radpiktogramme auf der Gegenrichtungsseite, ab der
    # Einmündung alle `piktogramm_abstand` Meter (Begehung Wimmergasse: rund 25 m, erstes direkt nach der Kreuzung)
    schwell = _index(ctx, ("Fahrbahnschwelle",))
    if an("radgegeneinbahn"):
        gesehen = set()
        einb = {tuple(map(tuple, e["pts"])): e["props"].get("DIRECTION_NAME") for e in L.get("einbahn", [])}
        abst = float(auto.get("piktogramm_abstand", 25.0))
        for a in L.get("radgegeneinbahn", []):
            pts = [tuple(p) for p in a["pts"]]
            if (pts[0], pts[-1]) in gesehen or len(pts) < 2:
                continue
            gesehen.add((pts[0], pts[-1]))
            richtung = einb.get(tuple(pts))
            if richtung is None:
                continue
            # Fahrtrichtung der Autos: "in Richtung" = Graphrichtung, "gegen Richtung" = umgekehrt; Rad dagegen
            rad = pts if richtung == "gegen Richtung" else pts[::-1]
            p0, p1 = rad[0], rad[-1]
            lin, t, s0, s1 = _mittellinie(fahr, schwell, p0, p1)
            if lin is None:
                continue
            name = a["props"].get("EDGE_FEATURENAME")
            n_r = (t[1], -t[0])                                  # rechts in Fahrtrichtung des Rades
            s = s0 + 3.0
            while s < s1 - 6.0:
                q = (p0[0] + t[0] * s, p0[1] + t[1] * s)
                br = _fahrbahn_breite(fahr, q, t)
                if br and nah(q):
                    links, rechts = br
                    ver = ((rechts - links) / 2 + rechts) / 2         # Mitte der rechten Fahrbahnhälfte
                    out.append({"typ": "radpiktogramm", "pos": [round(q[0] + n_r[0] * ver, 2), round(q[1] + n_r[1] * ver, 2)],
                                "richtung": [round(t[0], 3), round(t[1], 3)], "pfeil": bool(auto.get("piktogramm_pfeil", False)),
                                "quelle": f"OGD RADGEGENEINBAHNOG ({name}), Abstand {abst:.0f} m laut Begehung"})
                s += abst
            lin = [p for p in lin if nah(p)]
            if auto.get("leitlinie", True) and len(lin) >= 3:
                out.append({"typ": "leitlinie", "pts": lin, "strich": 1.5, "luecke": 3.0,
                            "breite": 0.12, "quelle": f"Radfahren gegen die Einbahn (OGD RADGEGENEINBAHNOG, {name}), "
                                                      "Lage Fahrbahnmitte aus FMZK, Begehung"})
    # Leitlinie (strichliert) in weiteren Straßen laut Begehung: strassenelemente_auto.leitlinie_strassen
    for sname in auto.get("leitlinie_strassen") or []:
        for g in L.get("strassengraph", []):
            if not str(g["props"].get("FEATURENAME") or "").lower().startswith(sname.lower()):
                continue
            pts = g["pts"]
            lin, t, s0, s1 = _mittellinie(fahr, schwell, pts[0], pts[-1])
            lin = [p for p in (lin or []) if nah(p)]
            if len(lin) >= 3:
                out.append({"typ": "leitlinie", "pts": lin, "strich": float(auto.get("leitlinie_strich", 3.0)),
                            "luecke": float(auto.get("leitlinie_luecke", 3.0)), "breite": 0.12,
                            "quelle": f"Begehung (Leitlinie {sname}), Lage Fahrbahnmitte aus FMZK"})
    # Behindertenparkplätze: Zusatztafel am Steher am Bordstein
    if an("behindertenparkplaetze"):
        for a in L.get("behindertenparkplaetze", []):
            p = a["pts"][0]
            k = _naechste_kante(segs, *p)
            if not nah(p) or k is None or k[0] > 4.0:
                continue
            n = _fahrbahn_normale(fahr, k[1], k[2])
            pos = (k[1][0] - n[0] * 0.4, k[1][1] - n[1] * 0.4)
            out.append({"typ": "verkehrszeichen", "schild": "info", "pos": [round(pos[0], 2), round(pos[1], 2)],
                        "drehung": round(math.degrees(math.atan2(k[2][1], k[2][0])), 1),
                        "quelle": f"OGD BEHINDERTENPARKPLATZOGD ({a['props'].get('STRNAM')} {a['props'].get('ONR_VON')})"})
    return out


def _mittellinie(fahr, schwell, p0, p1, schritt=2.0, kreuzung=9.5):
    """Fahrbahnmitte entlang einer Graphkante zwischen den Kreuzungen: Beginn, wo die Fahrbahn schmäler als 9 m ist
    und keine Fahrbahnschwelle (Überfahrt) mehr folgt. Liefert (Punkte, Richtung, Start, Ende)."""
    Lk = math.dist(p0, p1)
    if Lk < 12:
        return None, None, 0, 0
    t = ((p1[0] - p0[0]) / Lk, (p1[1] - p0[1]) / Lk)
    n_r = (t[1], -t[0])

    def ok(s):
        q = (p0[0] + t[0] * s, p0[1] + t[1] * s)
        br = _fahrbahn_breite(fahr, q, t)
        return br if br and br[0] + br[1] < 9.0 else None
    # Knoten des Straßengraphen liegen in Kreuzungsmitte: erst `kreuzung` Meter danach beginnen
    s0 = next((s for s in range(int(kreuzung), int(Lk / 2)) if ok(s) and ok(s + 2)), None)
    s1 = next((Lk - s for s in range(int(kreuzung), int(Lk / 2)) if ok(Lk - s) and ok(Lk - s - 2)), None)
    if s0 is None or s1 is None:
        return None, None, 0, 0
    # nach einer Überfahrt (Fahrbahnschwelle in den ersten 12 m) erst hinter der letzten Schwelle beginnen
    for s in range(int(s0), int(min(s0 + 12, s1))):
        for d in (-1.0, 0.0, 1.0):
            q = (p0[0] + t[0] * s + n_r[0] * d, p0[1] + t[1] * s + n_r[1] * d)
            if _in_layer(schwell, *q):
                s0 = s + 1.0
    for s in range(int(s1), int(max(s1 - 12, s0)), -1):
        for d in (-1.0, 0.0, 1.0):
            q = (p0[0] + t[0] * s + n_r[0] * d, p0[1] + t[1] * s + n_r[1] * d)
            if _in_layer(schwell, *q):
                s1 = s - 1.0
    lin = []
    s = s0
    while s <= s1:
        br = ok(s)
        if br:
            q = (p0[0] + t[0] * s, p0[1] + t[1] * s)
            m = (br[1] - br[0]) / 2
            lin.append([round(q[0] + n_r[0] * m, 2), round(q[1] + n_r[1] * m, 2)])
        s += schritt
    return lin, t, s0, s1


def _fahrbahn_breite(fahr, q, t, weit=12.0):
    """Abstand von q bis zum Fahrbahnrand links und rechts (quer zu t), None wenn q nicht auf der Fahrbahn."""
    if not _in_layer(fahr, *q):
        return None
    res = []
    for sgn in (1, -1):                       # links (n = (-t1, t0)) und rechts
        n = (-t[1] * sgn, t[0] * sgn)
        s = 0.0
        while s < weit and _in_layer(fahr, q[0] + n[0] * s, q[1] + n[1] * s):
            s += 0.1
        res.append(s)
    return res[0], res[1]
