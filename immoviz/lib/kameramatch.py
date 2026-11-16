"""Kamera einer Referenzvisualisierung aus Punktpaaren loesen (immoviz.py kameramatch).

Eingabe ist eine Punktdatei (YAML) mit Bildpixeln der Vorlage und den zugehoerigen lokalen 3D-Koordinaten aus
Plan oder Modell (Pavillonecken, Attikaecken, Fensterecken, Traufpunkte, Feuermauerkanten):

    groesse: [1920, 1080]          # Pixelgroesse der Vorlage, in der die px-Werte gemessen sind
    standpunkt_wie: hof_fin        # optional: Standpunkt einer schon gematchten Kamera uebernehmen (Ausschnitt
                                   # derselben Visualisierung mit laengerer Brennweite), geloest werden nur
                                   # Blickrichtung, Brennweite und Shift
    standpunkt: [x, y, z]          # optional: Standpunkt fest vorgeben (fast ebene Punkte im Tele: Standpunkt und
                                   # Brennweite sind entlang einer Linie gleich gut, dann Rastersuche im freien Raum)
    punkte:
      - {name: shg_traufe_west, px: [1316, 214], xyz: [0.80, -15.0, 21.0]}
      - {name: top4_attika_so, px: [948, 553], xyz: [27.85, 0.0, 6.78], rahmen: hof}   # a, b, z im Hilfsrahmen
      - {name: unsicher, px: [..], xyz: [..], gewicht: 0.5}                            # optional, Standard 1
      - {name: nur_kontrolle, px: [..], xyz: [..], kontrolle: true}                     # nicht im Ausgleich
      - {name: kante_senkrecht, px: [u, v], xyz: [x, y, z], nur_u: true}   # senkrechte Kante, Hoehe unbekannt:
                                                                            # nur die Bildspalte zaehlt

Kameramodell wie lib/build.py setup_camera (Blender, Sensorbreite 36 mm, Sensor an der laengeren Bildseite):
Architekturvisualisierungen haben meist senkrechte Kanten, also Kamera waagrecht (Kippung 0) mit Shift statt
Kippung. Unbekannt sind Standpunkt (3), Blickrichtung (1), Brennweite (1) und Shift x/y (2). Startwerte kommen aus
OpenCV solvePnP ueber eine Reihe von Brennweiten, der Ausgleich laeuft mit scipy least_squares. Zur Kontrolle wird
zusaetzlich die freie Loesung mit Kippung und Rollwinkel berechnet: ist sie kaum besser, stimmt die Annahme
"senkrechte Kanten bleiben senkrecht".

Die Kamera gilt als gematcht, wenn der mittlere Reprojektionsfehler unter 1 % der Bildbreite liegt.
"""
from __future__ import annotations

import math
import re
from pathlib import Path

import numpy as np
import yaml

SENSOR = 36.0
SCHWELLE = 0.01        # mittlerer Fehler < 1 % der Bildbreite = gematcht


# ----------------------------------------------------------------------------- Punkte
def lade_punkte(path: Path, cfg: dict) -> dict:
    P = yaml.safe_load(Path(path).read_text())
    rahmen = (cfg.get("neubau") or {}).get("rahmen") or {}
    pts = []
    for p in P["punkte"]:
        xyz = list(map(float, p["xyz"]))
        if p.get("rahmen"):
            R = rahmen[p["rahmen"]]
            th = math.radians(R.get("drehung", 0.0))
            ox, oy = R.get("ursprung", (0.0, 0.0))
            a, b = xyz[0], xyz[1]
            xyz = [ox + a * math.cos(th) - b * math.sin(th), oy + a * math.sin(th) + b * math.cos(th), xyz[2]]
        pts.append({"name": p["name"], "px": [float(v) for v in p["px"]], "xyz": xyz,
                    "w": float(p.get("gewicht", 1.0)), "kontrolle": bool(p.get("kontrolle", False)),
                    "nur_u": bool(p.get("nur_u", False))})
    fest = None
    if P.get("standpunkt_wie"):
        fest = list(map(float, cfg["cameras"][P["standpunkt_wie"]]["pos"]))
    elif P.get("standpunkt"):
        fest = list(map(float, P["standpunkt"]))
    return {"groesse": P.get("groesse"), "punkte": pts, "pos_fest": fest}


# ----------------------------------------------------------------------------- Kameramodell (Blender)
def _rx(t):
    c, s = math.cos(t), math.sin(t)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def _ry(t):
    c, s = math.cos(t), math.sin(t)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def _rz(t):
    c, s = math.cos(t), math.sin(t)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def rotation(yaw, pitch=0.0, roll=0.0):
    """Kamera -> Welt wie Blender rotation_euler (XYZ) = (90 Grad + pitch, roll, yaw)."""
    return _rz(yaw) @ _ry(roll) @ _rx(math.pi / 2 + pitch)


def projiziere(par: dict, X: np.ndarray, W: int, H: int) -> np.ndarray:
    """Weltpunkte (n, 3) -> Pixel (n, 2) mit Ursprung oben links."""
    S = max(W, H)
    R = rotation(par["yaw"], par.get("pitch", 0.0), par.get("roll", 0.0))
    Pc = (np.asarray(X) - np.asarray(par["pos"])) @ R          # = R^T (X - C)
    zc = -Pc[:, 2]
    zc = np.where(np.abs(zc) < 1e-6, 1e-6, zc)
    f = par["lens"] / SENSOR * S
    u = W / 2 + f * Pc[:, 0] / zc - par["shift"][0] * S
    v = H / 2 - f * Pc[:, 1] / zc + par["shift"][1] * S
    return np.stack([u, v], axis=1)


def _vec(par, frei):
    v = [*par["pos"], par["yaw"], math.log(par["lens"]), *par["shift"]]
    return np.array(v + ([par.get("pitch", 0.0), par.get("roll", 0.0)] if frei else []))


def _par(v, frei):
    p = {"pos": list(v[0:3]), "yaw": float(v[3]), "lens": float(math.exp(v[4])), "shift": [float(v[5]), float(v[6])]}
    if frei:
        p["pitch"], p["roll"] = float(v[7]), float(v[8])
    return p


# ----------------------------------------------------------------------------- Loesen
def _startwerte(X, x, W, H):
    """OpenCV solvePnP fuer eine Reihe von Brennweiten (Hauptpunkt in Bildmitte), beste Loesungen zuerst."""
    import cv2
    S = max(W, H)
    out = []
    for lens in np.geomspace(8.0, 400.0, 48):
        f = lens / SENSOR * S
        K = np.array([[f, 0, W / 2], [0, f, H / 2], [0, 0, 1]], dtype=float)
        try:
            ok, rv, tv = cv2.solvePnP(X.astype(float), x.astype(float), K, None, flags=cv2.SOLVEPNP_SQPNP)
            if ok:
                ok, rv, tv = cv2.solvePnP(X.astype(float), x.astype(float), K, None, rv, tv, True,
                                          flags=cv2.SOLVEPNP_ITERATIVE)
        except cv2.error:
            continue
        if not ok:
            continue
        Rcv, _ = cv2.Rodrigues(rv)
        C = (-Rcv.T @ tv).ravel()
        fw = Rcv.T @ np.array([0, 0, 1.0])            # Blickrichtung in Weltkoordinaten
        if np.any(((X - C) @ fw) <= 0):                # Punkte hinter der Kamera: unbrauchbar
            continue
        pitch = math.asin(max(-1.0, min(1.0, fw[2])))
        yaw = math.atan2(-fw[0], fw[1])
        # waagrechte Kamera mit Shift: der gekippte Hauptstrahl soll in der Bildmitte bleiben
        par = {"pos": C.tolist(), "yaw": yaw, "lens": float(lens), "shift": [0.0, lens / SENSOR * math.tan(pitch)]}
        rp, _ = cv2.projectPoints(X.astype(float), rv, tv, K, None)
        err = float(np.mean(np.linalg.norm(rp.reshape(-1, 2) - x, axis=1)))
        out.append((err, par, pitch))
    out.sort(key=lambda t: t[0])
    return out


SHIFT_PRIOR = 0.02     # schwacher Zug zu kleinem Shift (0,1 Shift kostet 0,2 % Bildbreite): verhindert bei fast ebenen
                       # Punktwolken (Fassadenausschnitt mit Tele) die Flucht in "weit weg, lange Brennweite, Shift 2"


def _prior(par, W):
    return np.array(par["shift"]) * W * SHIFT_PRIOR


def loese(punkte: list[dict], W: int, H: int, frei: bool = False, pos_fest=None) -> dict:
    from scipy.optimize import least_squares
    aktiv = [p for p in punkte if not p["kontrolle"]]
    if len(aktiv) < 6:
        raise SystemExit(f"kameramatch: mindestens 6 Punktpaare noetig, vorhanden {len(aktiv)}")
    X = np.array([p["xyz"] for p in aktiv])
    x = np.array([p["px"] for p in aktiv])
    w = np.sqrt(np.array([p["w"] for p in aktiv]))
    wv = w * np.array([0.0 if p["nur_u"] else 1.0 for p in aktiv])      # senkrechte Kanten: nur u
    wm = np.stack([w, wv], axis=1)
    voll = np.array([not p["nur_u"] for p in aktiv])
    starts = _startwerte(X[voll], x[voll], W, H)[:6]
    if not starts:
        raise SystemExit("kameramatch: solvePnP liefert keine Startloesung (Punkte pruefen)")

    if pos_fest is not None:          # Standpunkt fest: nur Blickrichtung, Brennweite, Shift (und Kippung)
        def full(v):
            return np.concatenate([pos_fest, v])
        def res(v):
            par_ = _par(full(v), frei)
            return np.concatenate([((projiziere(par_, X, W, H) - x) * wm).ravel(), _prior(par_, W)])
        best = None
        for _, par, pitch in starts:
            dx = np.mean(X[:, :2], axis=0) - np.array(pos_fest[:2])
            par = {**par, "yaw": math.atan2(-dx[0], dx[1]), "shift": [0.0, 0.0], "pitch": 0.0, "roll": 0.0}
            for lens in (par["lens"], 20.0, 50.0, 100.0, 200.0):
                par["lens"] = lens
                try:
                    r = least_squares(res, _vec(par, frei)[3:], loss="soft_l1", f_scale=W * 0.004, max_nfev=4000)
                except ValueError:
                    continue
                if best is None or r.cost < best.cost:
                    best = r
        return _par(full(best.x), frei)

    def res(v):
        par_ = _par(v, frei)
        return np.concatenate([((projiziere(par_, X, W, H) - x) * wm).ravel(), _prior(par_, W)])

    best = None
    for _, par, pitch in starts:
        if frei:
            par = {**par, "pitch": pitch, "roll": 0.0, "shift": [0.0, 0.0]}
        try:
            r = least_squares(res, _vec(par, frei), loss="soft_l1", f_scale=W * 0.004, max_nfev=4000)
        except ValueError:
            continue
        if best is None or r.cost < best.cost:
            best = r
    par = _par(best.x, frei)
    return par


def fehler(par, punkte, W, H) -> list[dict]:
    X = np.array([p["xyz"] for p in punkte])
    uv = projiziere(par, X, W, H)
    rows = []
    for p, q in zip(punkte, uv):
        d = abs(float(q[0] - p["px"][0])) if p.get("nur_u") else float(math.hypot(q[0] - p["px"][0], q[1] - p["px"][1]))
        rows.append({"name": p["name"], "px": p["px"], "modell": [round(float(q[0]), 1), round(float(q[1]), 1)],
                     "fehler_px": round(d, 2), "kontrolle": p["kontrolle"],
                     **({"nur_u": True} if p.get("nur_u") else {})})
    return rows


def _innen(p, poly):
    x, y = p
    c = False
    for i in range(len(poly)):
        x1, y1 = poly[i][:2]
        x2, y2 = poly[(i + 1) % len(poly)][:2]
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            c = not c
    return c


def clip_start(par, ctx: dict | None, W: int, H: int) -> float | None:
    """Steht die Kamera in einem Baukoerper (Vorlagen blenden Nachbarteile oft aus), Abstand bis ins Freie + 0,3 m
    ueber den ganzen Bildwinkel; sonst None."""
    if not ctx:
        return None
    C = par["pos"]
    bs = [b for b in ctx.get("buildings", []) if b.get("klasse") == 11 and b.get("height", 0) > C[2] - 5]
    nah = [(C[0] + dx, C[1] + dy) for dx in (-0.4, 0, 0.4) for dy in (-0.4, 0, 0.4)]   # auch knapp an der Wand
    bs = [b for b in bs if any(_innen(q, b["poly"]) for q in nah)]
    if not bs:
        return None
    half = math.atan(SENSOR / 2 / par["lens"]) + 0.05
    worst = 0.0
    for k in range(-10, 11):
        a = par["yaw"] + half * k / 10
        d = (-math.sin(a), math.cos(a))
        t = 0.0
        while t < 40 and any(_innen((C[0] + d[0] * t + d[1] * dq, C[1] + d[1] * t - d[0] * dq), b["poly"])
                             for b in bs for dq in (-0.4, 0.0, 0.4)):
            t += 0.1
        worst = max(worst, t)
    return round(worst + 0.3, 2)


def kamera_eintrag(par, W, H) -> dict:
    fw = rotation(par["yaw"]) @ np.array([0, 0, -1.0])
    pos = [round(float(v), 3) for v in par["pos"]]
    tgt = [round(pos[0] + 30 * float(fw[0]), 3), round(pos[1] + 30 * float(fw[1]), 3), pos[2]]
    return {"pos": pos, "target": tgt, "lens": round(par["lens"], 2),
            "shift": [round(par["shift"][0], 4), round(par["shift"][1], 4)], "format": [int(W), int(H)],
            "vertical": True}


def schreibe_kamera(yaml_path: Path, name: str, cam: dict, kommentar: str):
    """Kamera in project.yaml eintragen (Zeile ersetzen oder am Ende von `cameras:` anfuegen), Kommentare bleiben."""
    def fl(v):
        return "[" + ", ".join(f"{x:g}" if isinstance(x, float) else str(x) for x in v) + "]"
    clip = f", clip_start: {cam['clip_start']:g}" if cam.get("clip_start") else ""
    line = (f"  {name}: {{pos: {fl(cam['pos'])}, target: {fl(cam['target'])}, lens: {cam['lens']:g}, "
            f"shift: {fl(cam['shift'])}, format: {fl(cam['format'])}{clip}, vertical: true}}   # {kommentar}")
    txt = Path(yaml_path).read_text().split("\n")
    pat = re.compile(rf"^  {re.escape(name)}:\s*\{{")
    for i, l in enumerate(txt):
        if pat.match(l):
            txt[i] = line
            break
    else:
        start = next(i for i, l in enumerate(txt) if l.startswith("cameras:"))
        end = start + 1
        while end < len(txt) and (txt[end].startswith("  ") or txt[end].strip() == ""):
            end += 1
        while txt[end - 1].strip() == "":
            end -= 1
        txt.insert(end, line)
    Path(yaml_path).write_text("\n".join(txt))
    return line


# ----------------------------------------------------------------------------- Ueberlagerung
def _kanten(img: np.ndarray, lo=60, hi=150) -> np.ndarray:
    import cv2
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    g = cv2.GaussianBlur(g, (3, 3), 0)
    return cv2.Canny(g, lo, hi) > 0


def kantenabweichung(vorlage: np.ndarray, modell: np.ndarray, maske: np.ndarray | None = None) -> dict:
    """Mittlere und mediane Entfernung der Modellkanten zur naechsten Vorlagenkante (Pixel und % Bildbreite)."""
    import cv2
    ev, em = _kanten(vorlage), _kanten(modell)
    dt = cv2.distanceTransform((~ev).astype(np.uint8), cv2.DIST_L2, 5)
    sel = em if maske is None else (em & maske)
    W = vorlage.shape[1]
    d = np.minimum(dt[sel], 0.05 * W)
    if d.size == 0:
        return {"median_px": None, "mittel_px": None, "prozent_median": None, "prozent_mittel": None}
    return {"median_px": round(float(np.median(d)), 2), "mittel_px": round(float(d.mean()), 2),
            "prozent_median": round(100 * float(np.median(d)) / W, 2), "prozent_mittel": round(100 * float(d.mean()) / W, 2)}


def ueberlagerung(vorlage_path: Path, modell_path: Path, out_path: Path, rows: list[dict] | None = None,
                  vorlage_px=None, maske_path: Path | None = None, maske: np.ndarray | None = None) -> dict:
    """Bild aus drei Feldern: 50 % Blend | Kanten (Vorlage rot, Modell blau) | Punkte (Vorlage gruen, Modell gelb)."""
    from PIL import Image, ImageDraw
    m = Image.open(modell_path).convert("RGB")
    W, H = m.size
    v = Image.open(vorlage_path).convert("RGB")
    sx = W / v.width
    v = v.resize((W, H), Image.LANCZOS)
    a, b = np.asarray(v), np.asarray(m)
    blend = Image.blend(v, m, 0.5)
    ev, em = _kanten(a), _kanten(b)
    k = np.full((H, W, 3), 245, np.uint8)
    k[ev] = (220, 30, 30)
    k[em] = (30, 60, 230)
    k[ev & em] = (120, 0, 160)
    kanten = Image.fromarray(k)
    pkt = Image.blend(v, Image.new("RGB", (W, H), (255, 255, 255)), 0.35)
    d = ImageDraw.Draw(pkt)
    for r in rows or []:
        x0, y0 = r["px"][0] * sx, r["px"][1] * sx
        x1, y1 = r["modell"][0] * sx, r["modell"][1] * sx
        d.line([(x0, y0), (x1, y1)], fill=(255, 0, 0), width=2)
        d.ellipse([x0 - 5, y0 - 5, x0 + 5, y0 + 5], outline=(0, 170, 0), width=2)
        d.line([(x1 - 6, y1), (x1 + 6, y1)], fill=(230, 160, 0), width=2)
        d.line([(x1, y1 - 6), (x1, y1 + 6)], fill=(230, 160, 0), width=2)
    if maske_path and Path(maske_path).exists():
        maske = np.asarray(Image.open(maske_path).convert("L").resize((W, H))) > 127
    elif maske is not None and maske.shape != (H, W):
        maske = np.asarray(Image.fromarray(maske.astype(np.uint8) * 255).resize((W, H))) > 127
    ab = {"gesamt": kantenabweichung(a, b, None)}
    if maske is not None:
        ab["nachbarn"] = kantenabweichung(a, b, maske)
    out = Image.new("RGB", (W * 3, H), "white")
    for i, im in enumerate((blend, kanten, pkt)):
        out.paste(im, (i * W, 0))
    out.save(out_path)
    return ab


def render_modell(pdir: Path, cam_name: str, light: str, breite: int, samples: int, out: Path) -> Path:
    """Blender-Vorschau aus der gematchten Kamera im Seitenverhaeltnis der Vorlage."""
    import bpy
    from .build import load_project, build_scene, setup_render, setup_light, setup_camera
    cfg, ctx = load_project(pdir)
    scene = build_scene(cfg, ctx)
    fw, fh = cfg["cameras"][cam_name].get("format", cfg["render"]["preview_resolution"])
    setup_render(scene, (breite, round(breite * fh / fw)), samples)
    setup_light(scene, cfg, ctx, light)
    setup_camera(scene, cfg, cam_name)
    scene.render.filepath = str(out)
    bpy.ops.render.render(write_still=True)
    return out


# ----------------------------------------------------------------------------- Drahtmodell (ohne Blender)
def drahtmodell(cfg: dict, ctx: dict, par: dict, vorlage_path: Path, out_path: Path, radius: float = 90.0,
                breite: int = 1600) -> Path:
    """Baukoerper (OGD, Klasse 11) und Nachbarfassaden als Drahtmodell mit BEZUG ueber die Vorlage zeichnen:
    zeigt Element fuer Element, wo die Vorlage vom Datenmodell abweicht."""
    from PIL import Image, ImageDraw
    v = Image.open(vorlage_path).convert("RGB")
    W, H = v.size
    k = breite / W
    img = Image.blend(v, Image.new("RGB", v.size, (255, 255, 255)), 0.45).resize((breite, round(H * k)))
    d = ImageDraw.Draw(img)
    R = rotation(par["yaw"])
    C = np.asarray(par["pos"])
    fwd = R @ np.array([0, 0, -1.0])

    def P(pts):
        pts = np.asarray(pts, float)
        dep = (pts - C) @ fwd
        return projiziere(par, pts, W, H) * k, dep

    def seg(a, b, col, w=1):
        (uv, dep) = P([a, b])
        if min(dep) < 0.3:
            return
        d.line([tuple(uv[0]), tuple(uv[1])], fill=col, width=w)
    pal = [(220, 30, 30), (30, 90, 220), (0, 150, 60), (200, 120, 0), (150, 0, 170), (0, 150, 170), (120, 80, 40)]
    farbe = {}
    labels = []
    hero = {str(h) for h in (cfg.get("site") or {}).get("hero_bezug", [])}
    for b in ctx.get("buildings", []):
        if b.get("klasse") != 11 or len(b["poly"]) < 3 or str(b.get("bezug")) in hero:
            continue
        poly = [p[:2] for p in b["poly"]]
        cx, cy = np.mean(poly, axis=0)
        if math.hypot(cx - C[0], cy - C[1]) > radius:
            continue
        col = farbe.setdefault(str(b.get("bezug")), pal[len(farbe) % len(pal)])
        h = b["height"]
        n = len(poly)
        for i in range(n):
            a, bb = poly[i], poly[(i + 1) % n]
            seg((*a, h), (*bb, h), col, 2)
            seg((*a, 0.0), (*bb, 0.0), col, 1)
            seg((*a, 0.0), (*a, h), col, 1)
        uv, dep = P([(cx, cy, h)])
        if dep[0] > 0.3:
            labels.append((uv[0], str(b.get("bezug")), col))
    for name, f in (cfg.get("neighbour_facades") or {}).items():
        a, bb, h = f["a"], f["b"], f["height"]
        for z in (0.0, h):
            seg((*a, z), (*bb, z), (0, 0, 0), 3)
        seg((*a, 0.0), (*a, h), (0, 0, 0), 3)
        seg((*bb, 0.0), (*bb, h), (0, 0, 0), 3)
        uv, dep = P([((a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2, h * 0.75)])
        if dep[0] > 0.3:
            labels.append((uv[0], name, (0, 0, 0)))
    for (u, vv), t, col in labels:
        if 0 <= u < img.width and 0 <= vv < img.height:
            d.rectangle([u - 2, vv - 2, u + 7 * len(t), vv + 12], fill=(255, 255, 255))
            d.text((u, vv), t, fill=col)
    img.save(out_path)
    return out_path


def nachbar_maske(cfg: dict, ctx: dict, par: dict, W: int, H: int, breite: int, radius: float = 90.0) -> np.ndarray:
    """Bildbereich der Nachbarbaukoerper (OGD Klasse 11 ohne Objekt, Waende und Dach) als Maske in der Breite `breite`,
    fuer die Kantenabweichung "bei Nachbarn"."""
    from PIL import Image, ImageDraw
    k = breite / W
    m = Image.new("L", (breite, round(H * k)), 0)
    d = ImageDraw.Draw(m)
    R = rotation(par["yaw"])
    C = np.asarray(par["pos"])
    fwd = R @ np.array([0, 0, -1.0])
    hero = {str(h) for h in (cfg.get("site") or {}).get("hero_bezug", [])}
    for b in ctx.get("buildings", []):
        if b.get("klasse") != 11 or len(b["poly"]) < 3 or str(b.get("bezug")) in hero:
            continue
        poly = [p[:2] for p in b["poly"]]
        cx, cy = np.mean(poly, axis=0)
        if math.hypot(cx - C[0], cy - C[1]) > radius:
            continue
        h = b["height"]
        n = len(poly)
        for i in range(n):
            a, bb = poly[i], poly[(i + 1) % n]
            q = np.array([(*a, 0.0), (*bb, 0.0), (*bb, h), (*a, h)])
            if np.min((q - C) @ fwd) < 0.3:
                continue
            uv = projiziere(par, q, W, H) * k
            d.polygon([tuple(p) for p in uv], fill=255)
    return np.asarray(m) > 127
