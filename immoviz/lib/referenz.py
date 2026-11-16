"""Abgleich einer Projektkamera gegen Google Photorealistic 3D Tiles (nur interne Referenz).

Befehl: immoviz.py referenz <projekt> --kamera drohne

Ablauf
  1. Kalibrierung (einmal je Projekt, `kalibrierung.json`): Draufsicht der 3D-Kacheln (Tiefenbild einer
     Orthogonalkamera) gegen die Draufsicht des Modells. Hoehe: Median der Differenz auf der Fahrbahn ergibt den
     Abstand Wiener Null zu Ellipsoid (Wiener Null 156,68 m ue. A. plus Geoidundulation Wien rund 46,5 m).
     Lage: Kreuzkorrelation der Hauskanten ergibt die Verschiebung der Kacheln gegen die Stadtvermessung.
  2. Google-Ansicht: CesiumJS in Chromium (lib/referenz_google.js) mit derselben Kamera wie Blender: Standpunkt,
     Blickrichtung, Brennweite, Sensor 36 mm, Bildformat und senkrechte Korrektur (Shift) der Blender-Kamera.
     Je Ansicht ein Farbbild und ein Tiefenbild.
  3. Modell: dieselbe Kamera in Blender (Vorschau und Tiefenbild), Draufsicht des Modells als Hoehenbild.
  4. Auswertung je Gebaeude (BEZUG): Dach in der Draufsicht (Traufe, First, Firstrichtung, fehlende oder
     zu hohe Aufbauten) und Silhouette im Kamerabild (Dachkante in Pixel und Meter, IoU der Gebaeudemaske),
     dazu Horizontlinie und markante Gebaeude der Fernsicht.

Ausgabe
  renders/streetview/referenz_google/   Google-Bilder, Tiefen, Abgleichsbogen mit Google (nicht im Repo)
  renders/check/abgleich_<kamera>.jpg   Modellbild mit Befund je Gebaeude, ohne Google-Inhalt
  renders/check/abgleich_<kamera>.md    Liste je Gebaeude, Kennzahlen, Kalibrierung

Der Schluessel steht nur in der Umgebungsvariable GOOGLE_MAPS_API_KEY und wird nie geschrieben.
"""
from __future__ import annotations

import json
import math
import os
import shutil
import subprocess
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

CESIUM_URL = "https://cdn.jsdelivr.net/npm/cesium@1.120.0/Build/Cesium"   # feste Version
WN_UEBER_ADRIA = 156.68          # Wiener Null in m ueber Adria (Pegel Triest 1875)
GEOID_WIEN = 46.5                # Startwert Geoidundulation Wien (GRS80), wird kalibriert
REF_SUB = Path("renders") / "streetview" / "referenz_google"
JS = Path(__file__).with_name("referenz_google.js")

# Schwellwerte der Bewertung (siehe KONZEPT.md, Abschnitt 7)
TOL_GUT = 0.5                    # m: Dachkanten der Pflichthaeuser
TOL_HALB = 1.5                   # m: uebrige Haeuser "halbwegs"


# ======================================================================= Koordinaten
class Geo:
    """Lokales System (immoviz) nach GK Ost (EPSG:31256), WGS84 und ECEF; Hoehen ueber Wiener Null plus Abstand."""

    def __init__(self, cfg, cal=None):
        from pyproj import Transformer
        s = cfg["site"]
        self.ox, self.oy = s["origin_gk"]
        self.a = math.radians(s["x_axis_deg"])
        self.g0 = float(s.get("ground_wn", 0.0))
        cal = cal or {}
        self.h0 = float(cal.get("h0", WN_UEBER_ADRIA + GEOID_WIEN))      # ellipsoidische Hoehe von Wiener Null
        self.sx, self.sy = cal.get("verschiebung", [0.0, 0.0])
        self.t_gk = Transformer.from_crs("EPSG:31256", "EPSG:4326", always_xy=True)
        self.t_ecef = Transformer.from_crs("EPSG:4979", "EPSG:4978", always_xy=True)

    def gk(self, x, y):
        c, s = math.cos(self.a), math.sin(self.a)
        return self.ox + x * c - y * s, self.oy + x * s + y * c

    def ecef(self, x, y, z, kachel=True):
        """Punkt im lokalen System (z ueber Strassenniveau des Objekts) in ECEF. kachel=True verschiebt um die
        kalibrierte Lageabweichung der 3D-Kacheln, damit dieselbe Stelle der Kacheln getroffen wird."""
        if kachel:
            x, y = x + self.sx, y + self.sy
        gx, gy = self.gk(x, y)
        lon, lat = self.t_gk.transform(gx, gy)
        X, Y, Z = self.t_ecef.transform(lon, lat, z + self.g0 + self.h0)
        return np.array([X, Y, Z])

    def basis(self, x, y, z):
        """Lokale Achsen (x, y, z) am Punkt als ECEF-Einheitsvektoren (numerisch, 10 m Schritt)."""
        p = self.ecef(x, y, z)
        ex = self.ecef(x + 10, y, z) - p
        ey = self.ecef(x, y + 10, z) - p
        ez = self.ecef(x, y, z + 10) - p
        ez /= np.linalg.norm(ez)
        ex -= ez * ex.dot(ez); ex /= np.linalg.norm(ex)
        ey = np.cross(ez, ex)
        return p, ex, ey, ez


def kamera(cfg, name, W, H):
    """Kamera wie lib/build.setup_camera: Lage, Achsen im lokalen System, Brennweite in Pixel, Bildhauptpunkt.
    Beruecksichtigt `vertical` (waagrechte Kamera mit Shift), `format` (Seitenverhaeltnis, Breite bleibt) und
    einen ausdruecklichen `shift: [x, y]` (gematchte Kameras)."""
    c = cfg["cameras"][name]
    if c.get("format"):
        fw, fh = c["format"]
        H = max(2, round(W * fh / fw))
    px, py, pz = c["pos"]
    tx, ty, tz = c["target"]
    dx, dy, dz = tx - px, ty - py, tz - pz
    r = math.hypot(dx, dy)
    lens = c.get("lens", 24)
    fh = np.array([dx / r, dy / r, 0.0])
    right = np.array([dy / r, -dx / r, 0.0])
    big = max(W, H)
    f = lens / 36.0 * big
    shx = 0.0
    if c.get("vertical", True):
        aspect = W / H
        shy = max(-1.0, min(1.0, (dz / r) * lens / 36 * (1 if aspect >= 1 else aspect)))
        fwd, up = fh, np.array([0.0, 0.0, 1.0])
    else:
        p = math.atan2(dz, r)
        fwd = np.array([fh[0] * math.cos(p), fh[1] * math.cos(p), math.sin(p)])
        up = np.array([-fh[0] * math.sin(p), -fh[1] * math.sin(p), math.cos(p)])
        shy = 0.0
    if c.get("shift"):
        shx, shy = c["shift"]
    return {"name": name, "pos": np.array([px, py, pz], float), "fwd": fwd, "right": right, "up": up,
            "f": f, "cx": W / 2 - shx * big, "cy": H / 2 + shy * big, "W": W, "H": H, "lens": lens,
            "shift": [shx, shy]}


def projiziere(cam, pts):
    """Lokale Punkte (N, 3) in Bildkoordinaten (u, v) und Tiefe entlang der Blickachse."""
    d = np.asarray(pts, float) - cam["pos"]
    z = d @ cam["fwd"]
    u = cam["cx"] + cam["f"] * (d @ cam["right"]) / z
    v = cam["cy"] - cam["f"] * (d @ cam["up"]) / z
    return u, v, z


def rueckprojektion(cam, depth):
    """Tiefenbild (Abstand entlang der Blickachse, NaN = Himmel) zu lokalen Punkten (H, W, 3)."""
    H, W = depth.shape
    u = (np.arange(W) + 0.5 - cam["cx"]) / cam["f"]
    v = (np.arange(H) + 0.5 - cam["cy"]) / cam["f"]
    ray = cam["fwd"][None, None, :] + u[None, :, None] * cam["right"][None, None, :] \
        - v[:, None, None] * cam["up"][None, None, :]
    return cam["pos"][None, None, :] + depth[:, :, None] * ray


# ======================================================================= Google (CesiumJS)
def google_ansicht_persp(geo, cam, name, out_dir):
    """Cesium-Ansicht zur Blender-Kamera. Cesium kennt keinen Shift: gerendert wird ein symmetrisches,
    groesseres Bild um den Bildhauptpunkt, danach wird der Blender-Ausschnitt herausgeschnitten."""
    W, H = cam["W"], cam["H"]
    hw = int(math.ceil(max(cam["cx"], W - cam["cx"])))
    hh = int(math.ceil(max(cam["cy"], H - cam["cy"])))
    Ws, Hs = 2 * hw, 2 * hh
    left, top = int(round(hw - cam["cx"])), int(round(hh - cam["cy"]))
    fov = 2 * math.atan(max(Ws, Hs) / 2 / cam["f"])
    p = geo.ecef(*cam["pos"])
    d = geo.ecef(*(cam["pos"] + cam["fwd"] * 10.0)) - p
    u = geo.ecef(*(cam["pos"] + cam["up"] * 10.0)) - p
    d /= np.linalg.norm(d)
    u -= d * u.dot(d); u /= np.linalg.norm(u)
    return {"name": name, "kind": "persp", "W": Ws, "H": Hs, "fov": fov, "pos": p.tolist(), "dir": d.tolist(),
            "up": u.tolist(), "out_rgb": str(out_dir / f"{name}_google_voll.png"),
            "out_depth": str(out_dir / f"{name}_google_tiefe_voll.png"), "_crop": [left, top, left + W, top + H]}


def google_ansicht_draufsicht(geo, mitte, groesse, px, name, out_dir, hoehe=900.0):
    x, y = mitte
    p, ex, ey, ez = geo.basis(x, y, hoehe)
    return {"name": name, "kind": "ortho", "W": px, "H": px, "width_m": groesse, "pos": p.tolist(),
            "dir": (-ez).tolist(), "up": ey.tolist(), "out_rgb": str(out_dir / f"{name}_google.png"),
            "out_depth": str(out_dir / f"{name}_google_tiefe.png"), "_hoehe": hoehe}


def google_render(views, out_dir, sse=4, timeout=3600):
    """Startet lib/referenz_google.js. Der Schluessel wird nur ueber die Umgebung weitergereicht."""
    if not os.environ.get("GOOGLE_MAPS_API_KEY"):
        raise SystemExit("GOOGLE_MAPS_API_KEY fehlt (nur als Umgebungsvariable setzen)")
    job = {"cesium": CESIUM_URL, "chrome": os.environ.get("IMMOVIZ_CHROME", "/usr/bin/google-chrome"), "sse": sse,
           "views": [{k: v for k, v in vw.items() if not k.startswith("_")} for vw in views]}
    jp = out_dir / "auftrag.json"
    jp.write_text(json.dumps(job))
    t = time.time()
    r = subprocess.run(["node", str(JS), str(jp)], capture_output=True, text=True, timeout=timeout)
    jp.unlink(missing_ok=True)
    log = "\n".join(l for l in r.stderr.splitlines() if "key=" not in l)
    if r.returncode != 0:
        raise RuntimeError("Google-Referenz fehlgeschlagen:\n" + log[-2000:])
    res = json.loads(r.stdout)
    res["sekunden"] = round(time.time() - t)
    for vw in views:            # Ausschnitt der Blender-Kamera aus dem symmetrischen Bild
        if vw.get("_crop"):
            box = tuple(vw["_crop"])
            for src, dst in ((vw["out_rgb"], vw["out_rgb"].replace("_voll", "")),
                             (vw["out_depth"], vw["out_depth"].replace("_voll", ""))):
                im = Image.open(src)
                im.crop(box).save(dst)
                Path(src).unlink(missing_ok=True)
    return res


def lies_tiefe(path):
    """Tiefen-PNG (cm + 1 in 24 Bit) zu Metern, NaN fuer Himmel."""
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int64)
    c = a[..., 0] + 256 * a[..., 1] + 65536 * a[..., 2]
    d = (c - 1).astype(np.float64) / 100.0
    d[c == 0] = np.nan
    return d


# ======================================================================= Modell (Blender)
def _exr_lesen(path):
    import bpy
    img = bpy.data.images.load(str(path))
    img.colorspace_settings.name = "Non-Color"
    w, h = img.size
    a = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(a)
    bpy.data.images.remove(img)
    a = a.reshape(h, w, 4)[::-1]
    d = a[..., 0].astype(np.float64)
    d[a[..., 3] < 0.5] = np.nan
    return d


def modell_render(pdir, cfg, ctx, cams, out_dir, licht="dunst_hell", samples=24, draufsicht=None, nur_tiefe=False):
    """Blender: je Kamera Vorschau (PNG) und Tiefenbild (Abstand entlang der Blickachse), dazu optional eine
    Draufsicht als Hoehenbild. Tiefe ueber eine Ersatzmaterial-Emission mit 'View Z Depth' (1 Sample)."""
    import bpy
    from .build import build_scene, setup_render, setup_light, setup_camera
    t = time.time()
    scene = build_scene(cfg, ctx)
    res = {}
    for cam in cams:
        W, H = cam["W"], cam["H"]
        if not nur_tiefe:
            setup_render(scene, (W, H), samples)
            scene.render.use_persistent_data = True
            setup_light(scene, cfg, ctx, licht)
            setup_camera(scene, cfg, cam["name"])
            scene.render.filepath = str(out_dir / f"{cam['name']}_modell.png")
            bpy.ops.render.render(write_still=True)
        res[cam["name"]] = {"rgb": str(out_dir / f"{cam['name']}_modell.png")}
    # Tiefe: Ersatzmaterial, Standard-Farbtransformation, EXR
    mat = bpy.data.materials.new("referenz_tiefe")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    cd = nt.nodes.new("ShaderNodeCameraData")
    em = nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(cd.outputs["View Z Depth"], em.inputs["Color"])
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    vl = scene.view_layers[0]
    vl.material_override = mat
    world = bpy.data.worlds.get("Welt") or bpy.data.worlds.new("Welt")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes.clear()
    world.node_tree.nodes.new("ShaderNodeOutputWorld")
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 1
    scene.cycles.use_denoising = False
    scene.cycles.use_adaptive_sampling = False
    scene.cycles.max_bounces = 0
    scene.cycles.filter_width = 0.01
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "Standard"
    try:
        scene.view_settings.look = "None"
    except TypeError:
        pass
    scene.view_settings.exposure = 0.0
    scene.render.image_settings.file_format = "OPEN_EXR"
    scene.render.image_settings.color_depth = "32"
    for cam in cams:
        scene.render.resolution_x, scene.render.resolution_y = cam["W"], cam["H"]
        setup_camera(scene, cfg, cam["name"])
        p = out_dir / f"{cam['name']}_modell_tiefe.exr"
        scene.render.filepath = str(p)
        bpy.ops.render.render(write_still=True)
        d = _exr_lesen(p)
        np.save(out_dir / f"{cam['name']}_modell_tiefe.npy", d.astype(np.float32))
        p.unlink(missing_ok=True)
        res[cam["name"]]["tiefe"] = str(out_dir / f"{cam['name']}_modell_tiefe.npy")
    if draufsicht:
        (x, y), size, px, hz = draufsicht["mitte"], draufsicht["groesse"], draufsicht["px"], draufsicht["hoehe"]
        cd_ = bpy.data.cameras.new("referenz_draufsicht")
        cd_.type = "ORTHO"
        cd_.ortho_scale = size
        cd_.clip_end = 5000
        ob = bpy.data.objects.new("referenz_draufsicht", cd_)
        scene.collection.objects.link(ob)
        ob.location = (x, y, hz)
        ob.rotation_euler = (0.0, 0.0, 0.0)
        scene.camera = ob
        scene.render.resolution_x = scene.render.resolution_y = px
        p = out_dir / "draufsicht_modell.exr"
        scene.render.filepath = str(p)
        bpy.ops.render.render(write_still=True)
        d = _exr_lesen(p)
        np.save(out_dir / "draufsicht_modell_hoehe.npy", (hz - d).astype(np.float32))
        p.unlink(missing_ok=True)
    vl.material_override = None
    res["_sekunden"] = round(time.time() - t)
    return res


# ======================================================================= Raster der Grundrisse
class Raster:
    """Draufsicht-Raster im lokalen System: Zeile 0 oben (groesstes y), Spalte 0 links (kleinstes x)."""

    def __init__(self, mitte, groesse, px):
        self.x0 = mitte[0] - groesse / 2
        self.y1 = mitte[1] + groesse / 2
        self.res = groesse / px
        self.n = px

    def ij(self, x, y):
        return (self.y1 - np.asarray(y)) / self.res - 0.5, (np.asarray(x) - self.x0) / self.res - 0.5

    def xy(self, i, j):
        return self.x0 + (np.asarray(j) + 0.5) * self.res, self.y1 - (np.asarray(i) + 0.5) * self.res

    def poly_px(self, poly):
        return [((x - self.x0) / self.res, (self.y1 - y) / self.res) for x, y in poly]


def grundriss_labels(ctx, ras, hero=()):
    """Label-Bild der Hauptgebaeude (Klasse 11) je BEZUG; 0 = kein Gebaeude."""
    im = Image.new("I", (ras.n, ras.n), 0)
    dr = ImageDraw.Draw(im)
    ids, names = {}, ["-"]
    for b in ctx["buildings"] + ctx["hero"]:
        if b.get("klasse") != 11 or len(b["poly"]) < 3:
            continue
        key = str(b.get("bezug"))
        if key not in ids:
            ids[key] = len(names)
            names.append(key)
        dr.polygon(ras.poly_px(b["poly"]), fill=ids[key])
    return np.asarray(im, dtype=np.int32), names


def _strassen_maske(ctx, ras, layers=("Fahrbahn",)):
    im = Image.new("L", (ras.n, ras.n), 0)
    dr = ImageDraw.Draw(im)
    for s in ctx["surfaces"]:
        if s["layer"] in layers and len(s["poly"]) >= 3:
            dr.polygon(ras.poly_px(s["poly"]), fill=1)
    return np.asarray(im) > 0


def _vegetation(rgb):
    a = np.asarray(rgb).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (2 * g - r - b > 18) & (g > 40)


# ======================================================================= Kalibrierung
def kalibrieren(geo, ctx, ras, g_hoehe, m_hoehe, g_rgb):
    """Hoehe: Median(Google - Modell) auf der Fahrbahn. Lage: Kreuzkorrelation der Kantenbilder."""
    from scipy import ndimage as ndi
    fb = _strassen_maske(ctx, ras) & ~_vegetation(g_rgb) & np.isfinite(g_hoehe) & np.isfinite(m_hoehe)
    i, j = np.nonzero(fb)
    x, y = ras.xy(i, j)
    nah = np.hypot(x, y) < 120
    dz = (g_hoehe - m_hoehe)[fb][nah]
    med = float(np.median(dz))
    for _ in range(3):
        k = np.abs(dz - med) < 0.6
        med = float(np.median(dz[k]))

    def kanten(h):
        h = np.nan_to_num(h, nan=0.0)
        h = np.clip(h - med * 0, -5, 30)
        gx, gy = ndi.sobel(h, 1), ndi.sobel(h, 0)
        return np.hypot(gx, gy)
    # nur Nahbereich, Rand ausblenden
    n = ras.n
    w = np.zeros((n, n))
    c = n // 2
    rr = int(110 / ras.res)
    w[max(0, c - rr):c + rr, max(0, c - rr):c + rr] = 1.0
    A = kanten(g_hoehe - med) * w
    B = kanten(m_hoehe) * w
    A = np.minimum(A, np.percentile(A[A > 0], 98))
    B = np.minimum(B, np.percentile(B[B > 0], 98))
    F = np.fft.rfft2(A) * np.conj(np.fft.rfft2(B))
    cc = np.fft.irfft2(F, s=A.shape)
    cc = np.fft.fftshift(cc)
    lim = int(4.0 / ras.res)
    sub = cc[c - lim:c + lim + 1, c - lim:c + lim + 1]
    pi, pj = np.unravel_index(np.argmax(sub), sub.shape)

    def parab(m1, m0, p1):
        den = m1 - 2 * m0 + p1
        return 0.0 if abs(den) < 1e-12 else 0.5 * (m1 - p1) / den
    di = pi - lim + (parab(sub[pi - 1, pj], sub[pi, pj], sub[pi + 1, pj]) if 0 < pi < 2 * lim else 0)
    dj = pj - lim + (parab(sub[pi, pj - 1], sub[pi, pj], sub[pi, pj + 1]) if 0 < pj < 2 * lim else 0)
    # Google-Bild ist gegen das Modell um (di, dj) Pixel verschoben: Zeile nach unten = -y
    sx, sy = dj * ras.res, -di * ras.res
    return {"h0": round(geo.h0 + med, 3), "dz_fahrbahn": round(med, 3), "punkte_fahrbahn": int(nah.sum()),
            "streuung_fahrbahn": round(float(np.percentile(np.abs(dz - med), 68)), 3),
            "verschiebung_bild": [round(float(sx), 3), round(float(sy), 3)],
            "verschiebung": [round(geo.sx + float(sx), 3), round(geo.sy + float(sy), 3)],
            "geoid_undulation": round(geo.h0 + med - WN_UEBER_ADRIA, 3)}


def verschieben(a, sx, sy, res):
    """Raster so verschieben, dass ein um (sx, sy) versetzter Inhalt wieder auf dem Modell liegt."""
    from scipy import ndimage as ndi
    if abs(sx) < 1e-6 and abs(sy) < 1e-6:
        return a
    m = np.isfinite(a)
    b = ndi.shift(np.nan_to_num(a, nan=0.0), (sy / res, -sx / res), order=1, mode="nearest")
    mm = ndi.shift(m.astype(float), (sy / res, -sx / res), order=1, mode="constant") > 0.5
    b[~mm] = np.nan
    return b


# ======================================================================= Auswertung Draufsicht
def _orientierung(i, j, w=None):
    if len(i) < 8:
        return None, 1.0
    X = np.stack([j, -i], 1).astype(float)
    X -= X.mean(0)
    C = np.cov(X.T, aweights=w)
    ev, evec = np.linalg.eigh(C)
    v = evec[:, 1]
    ang = (math.degrees(math.atan2(v[1], v[0])) + 180) % 180
    return ang, math.sqrt(max(ev[1], 1e-9) / max(ev[0], 1e-9))


def dach_kennzahlen(ras, labels, names, g_h, m_h, veg, bezuege, strasse=None):
    """Je BEZUG: Traufe, First, Firstrichtung, Abweichungsflaechen. Hoehen in m ueber Strassenniveau des Objekts.

    First: 99-%-Wert nach einer Oeffnung (1,25 m) in beiden Hoehenbildern, damit Kamine, Antennen und
    Rauchfangkehrerstege den Wert nicht bestimmen (beide Bilder gleich behandelt). Traufe: 20-%-Wert am freien
    Dachrand zur Strasse (strasse = Maske der Verkehrsflaechen), sonst am ganzen freien Rand."""
    from scipy import ndimage as ndi
    res = ras.res
    out = {}
    er = ndi.binary_erosion
    k = max(3, int(round(1.25 / res)) | 1)
    g_o = ndi.grey_opening(np.nan_to_num(g_h, nan=-50.0), size=(k, k))
    m_o = ndi.grey_opening(np.nan_to_num(m_h, nan=-50.0), size=(k, k))
    nah_str = ndi.binary_dilation(strasse, iterations=int(3.0 / res)) if strasse is not None else None
    for key in bezuege:
        if key not in names:
            continue
        lab = names.index(key)
        fp = labels == lab
        if fp.sum() * res * res < 20:
            continue
        inner = er(fp, iterations=max(1, int(0.5 / res)))
        band = fp & ~er(fp, iterations=max(2, int(1.6 / res))) & er(fp, iterations=max(1, int(0.4 / res)))
        # Rand nur dort, wo kein anderes Gebaeude anschliesst (Strasse oder Hof), sonst zaehlen Brandwaende mit
        frei = ndi.binary_dilation(labels == 0, iterations=max(2, int(2.0 / res)))
        band &= frei
        if nah_str is not None and (band & nah_str).sum() > 40:
            band &= nah_str
        ok = inner & np.isfinite(g_h) & np.isfinite(m_h) & ~veg
        if ok.sum() < 30:
            continue
        g, m = g_h[ok], m_h[ok]
        okb = band & np.isfinite(g_h) & np.isfinite(m_h) & ~veg
        rec = {"flaeche_m2": round(float(fp.sum() * res * res))}
        rec["first_ref"], rec["first_mod"] = float(np.percentile(g_o[ok], 99)), float(np.percentile(m_o[ok], 99))
        if okb.sum() > 20:
            rec["traufe_ref"] = float(np.percentile(g_h[okb], 20))
            rec["traufe_mod"] = float(np.percentile(m_h[okb], 20))
        d = g_h - m_h
        dd = d[ok]
        rec["mae"] = float(np.mean(np.abs(dd)))
        rec["median"] = float(np.median(dd))
        # Firstrichtung: oberste 12 % des Hoehenbereichs
        for tag, h in (("ref", g_h), ("mod", m_h)):
            hv = h[ok]
            lo, hi = np.percentile(hv, 30), np.percentile(hv, 99)
            sel = ok & (h > hi - 0.12 * max(hi - lo, 0.5))
            ii, jj = np.nonzero(sel)
            rec[f"first_richtung_{tag}"], rec[f"first_streckung_{tag}"] = _orientierung(ii, jj)
            rec[f"geneigt_{tag}"] = bool(hi - lo > 1.8)
        # Abweichungsflaechen (zusammenhaengend)
        for tag, sel, s in (("fehlt", ok & (d > 1.0), 1), ("zuviel", ok & (d < -1.0), -1)):
            lab_, n_ = ndi.label(sel)
            teile = []
            for k in range(1, n_ + 1):
                mk = lab_ == k
                a = float(mk.sum() * res * res)
                if a < (2.0 if tag == "fehlt" else 4.0):
                    continue
                ii, jj = np.nonzero(mk)
                x, y = ras.xy(ii.mean(), jj.mean())
                ang, _ = _orientierung(ii, jj)
                ang = ang or 0.0
                # Ausdehnung in Hauptachse und quer (Meter), fuer einen Quader-Vorschlag
                X = np.stack([jj, -ii], 1) * res
                t = np.array([math.cos(math.radians(ang)), math.sin(math.radians(ang))])
                n_ = np.array([-t[1], t[0]])
                l_ = float(np.ptp(X @ t)) + res
                b_ = float(np.ptp(X @ n_)) + res
                teile.append({"m2": round(a, 1), "max": round(float(np.max(np.abs(d[mk]))), 1),
                              "pos": [round(float(x), 1), round(float(y), 1)],
                              "z_ref": round(float(np.percentile(g_h[mk], 90)), 1),
                              "z_mod": round(float(np.median(m_h[mk])), 1),
                              "l": round(l_, 1), "b": round(b_, 1), "drehung": round(ang, 0)})
            rec[tag] = sorted(teile, key=lambda t: -t["m2"])
        out[key] = rec
    return out


def _winkel_diff(a, b):
    d = abs(a - b) % 180
    return min(d, 180 - d)


def befund_text(rec, kz_sil=None):
    """Kurze Befundliste wie "Traufe 1,2 m zu tief, Firstrichtung falsch, Gaube fehlt"."""
    t = []

    def m(v):
        return f"{abs(v):.1f}".replace(".", ",")
    if "traufe_ref" in rec:
        dT = rec["traufe_mod"] - rec["traufe_ref"]
        if abs(dT) > TOL_GUT:
            t.append(f"Traufe {m(dT)} m zu {'hoch' if dT > 0 else 'tief'}")
    dF = rec["first_mod"] - rec["first_ref"]
    if abs(dF) > TOL_GUT:
        t.append(f"First {m(dF)} m zu {'hoch' if dF > 0 else 'tief'}")
    if rec.get("geneigt_ref") and rec.get("geneigt_mod") and rec.get("first_richtung_ref") is not None \
            and rec.get("first_richtung_mod") is not None and rec["first_streckung_ref"] > 2.2 \
            and rec["first_streckung_mod"] > 2.2 \
            and _winkel_diff(rec["first_richtung_ref"], rec["first_richtung_mod"]) > 30:
        t.append("Firstrichtung falsch")
    if rec.get("geneigt_ref") and not rec.get("geneigt_mod"):
        t.append("Dach in echt geneigt, im Modell flach")
    if rec.get("geneigt_mod") and not rec.get("geneigt_ref"):
        t.append("Dach in echt flach, im Modell geneigt")
    f = rec.get("fehlt", [])
    if f:
        a = sum(x["m2"] for x in f)
        art = "Aufbau fehlt (Gaube, Liftturm, Dachterrasse)" if max(x["m2"] for x in f) < 40 else "Volumen fehlt"
        t.append(f"{art}: {len(f)} Stelle{'n' if len(f) > 1 else ''}, {round(a)} m², bis {m(max(x['max'] for x in f))} m")
    z = rec.get("zuviel", [])
    if z:
        a = sum(x["m2"] for x in z)
        t.append(f"Modell zu hoch: {len(z)} Stelle{'n' if len(z) > 1 else ''}, {round(a)} m², bis {m(max(x['max'] for x in z))} m")
    if kz_sil and kz_sil.get("kante_m") is not None and abs(kz_sil["kante_m"]) > TOL_GUT:
        t.append(f"Dachkante im Bild {m(kz_sil['kante_m'])} m zu {'hoch' if kz_sil['kante_m'] > 0 else 'tief'}")
    return t


# ======================================================================= Auswertung Kamerabild
def gebaeude_maske_bild(ras, labels, xyz, z_min=2.5):
    """Label je Bildpixel ueber den Grundriss (auf 1 m aufgeweitet fuer Fassadenpunkte und Gesimse)."""
    from scipy import ndimage as ndi
    dist, (ii, jj) = ndi.distance_transform_edt(labels == 0, return_indices=True)
    lab_w = labels[ii, jj]
    lab_w[dist * ras.res > 1.0] = 0
    I, J = ras.ij(xyz[..., 0], xyz[..., 1])
    ok = np.isfinite(I) & (I >= 0) & (I < ras.n - 1) & (J >= 0) & (J < ras.n - 1) & (xyz[..., 2] > z_min)
    out = np.zeros(xyz.shape[:2], np.int32)
    out[ok] = lab_w[np.round(I[ok]).astype(int), np.round(J[ok]).astype(int)]
    return out


def silhouette_kennzahlen(cam, names, lab_g, lab_m, dep_g, dep_m, bezuege):
    """Je BEZUG im Bild: IoU der Masken und Abweichung der oberen Kante (Pixel, Meter). kante_m > 0: Modell hoeher."""
    out = {}
    H, W = lab_g.shape
    rows = np.arange(H)[:, None]
    for key in bezuege:
        if key not in names:
            continue
        k = names.index(key)
        a, b = lab_g == k, lab_m == k
        na, nb = int(a.sum()), int(b.sum())
        if max(na, nb) < 150:
            continue
        iou = float((a & b).sum() / max(1, (a | b).sum()))
        ta = np.where(a.any(0), np.argmax(a, 0), -1)
        tb = np.where(b.any(0), np.argmax(b, 0), -1)
        both = (ta >= 0) & (tb >= 0)
        rec = {"pixel_ref": na, "pixel_mod": nb, "iou": round(iou, 3)}
        if both.sum() >= 5:
            cols = np.nonzero(both)[0]
            dpx = (ta[cols] - tb[cols]).astype(float)            # > 0: Modellkante liegt hoeher im Bild
            dd = dep_m[tb[cols], cols]
            dm = dpx * np.nan_to_num(dd, nan=0) / cam["f"]
            rec["kante_px"] = round(float(np.median(dpx)), 1)
            rec["kante_m"] = round(float(np.median(dm)), 2)
            rec["kante_p90_m"] = round(float(np.percentile(np.abs(dm), 90)), 2)
            rec["spalten"] = int(both.sum())
            ii = (ta[cols] + tb[cols]) // 2
            rec["bild_pos"] = [int(np.median(cols)), int(np.median(ii))]
        out[key] = rec
    return out


def horizont(dep):
    """Je Spalte die oberste Zeile, die nicht Himmel ist."""
    g = np.isfinite(dep)
    return np.where(g.any(0), np.argmax(g, 0), dep.shape[0])


def fern_kennzahlen(cam, fern, xyz_g, xyz_m, cfg):
    """Markante Gebaeude der Fernsicht: hoechster Punkt im Umkreis der Lage, Referenz gegen Modell."""
    from . import fern as FE
    if not fern:
        return []
    rows = []
    for m in FE.im_sichtkegel(cfg, fern, cam["name"], rand_grad=0.0)[:25]:
        u, v, z = projiziere(cam, np.array([[m["pos"][0], m["pos"][1], m["top"]]]))
        u = int(round(u[0]))
        if not (5 <= u < cam["W"] - 5) or z[0] <= 0:
            continue
        rec = {"bezug": m["bezug"], "name": m.get("name"), "entfernung": m["entfernung"], "richtung": m["richtung"],
               "daten_top": m["top"], "u": u}
        r_such = max(40.0, 0.02 * m["entfernung"])
        for tag, xyz in (("ref", xyz_g), ("mod", xyz_m)):
            sl = xyz[:, max(0, u - 6):u + 7]
            dxy = np.hypot(sl[..., 0] - m["pos"][0], sl[..., 1] - m["pos"][1])
            sel = np.isfinite(dxy) & (dxy < r_such)
            rec[f"top_{tag}"] = round(float(np.nanmax(sl[..., 2][sel])), 1) if sel.any() else None
        rows.append(rec)
    return rows


# ======================================================================= Bilder
def _font(sz):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if Path(p).exists():
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def geo_kanten(xyz, dep, winkel=32.0, sprung=0.025):
    """Geometrische Kanten aus dem Tiefenbild: Tiefenspruenge (Silhouetten) und Knicke der Flaechennormalen
    (Traufe, First, Gaubenkanten). Liefert ein Bool-Bild."""
    from scipy import ndimage as ndi
    d = np.nan_to_num(dep, nan=1e6)
    e = np.zeros(dep.shape, bool)
    jx = np.abs(np.diff(d, axis=1)) > sprung * np.minimum(d[:, 1:], d[:, :-1])
    jy = np.abs(np.diff(d, axis=0)) > sprung * np.minimum(d[1:], d[:-1])
    e[:, 1:] |= jx
    e[1:] |= jy
    P = np.nan_to_num(xyz)
    for k in range(3):
        P[..., k] = ndi.uniform_filter(P[..., k], 3)
    dx = np.zeros_like(P); dy = np.zeros_like(P)
    dx[:, 1:-1] = P[:, 2:] - P[:, :-2]
    dy[1:-1] = P[2:] - P[:-2]
    n = np.cross(dx, dy)
    n /= np.linalg.norm(n, axis=2, keepdims=True) + 1e-9
    c = math.cos(math.radians(winkel))
    kx = np.sum(n[:, 2:] * n[:, :-2], axis=2) < c
    ky = np.sum(n[2:] * n[:-2], axis=2) < c
    e[:, 1:-1] |= kx
    e[1:-1] |= ky
    e &= np.isfinite(dep)
    return ndi.binary_opening(e, structure=np.ones((1, 2))) | ndi.binary_opening(e, structure=np.ones((2, 1)))


def _beschrift(im, text, xy=(10, 8), sz=22):
    d = ImageDraw.Draw(im)
    f = _font(sz)
    x, y = xy
    bb = d.textbbox((x, y), text, font=f)
    d.rectangle((bb[0] - 6, bb[1] - 4, bb[2] + 6, bb[3] + 4), fill=(0, 0, 0))
    d.text((x, y), text, font=f, fill=(255, 255, 255))


def kanten_bild(basis, e_ref, e_mod):
    a = np.asarray(basis.convert("L").convert("RGB")).astype(np.float32) * 0.55
    a[e_mod] = (0, 220, 255)
    a[e_ref] = (255, 40, 40)
    a[e_ref & e_mod] = (255, 255, 255)
    return Image.fromarray(a.astype(np.uint8))


# ======================================================================= Hauptablauf
def _namen(cfg, ctx):
    info = {str(i.get("acd")): i for i in ctx.get("info", [])}
    nf = {}
    for n, v in (cfg.get("neighbour_facades") or {}).items():
        nf.setdefault(str(v["bezug"]), n)

    def name(b):
        i = info.get(b)
        if i and i.get("street"):
            return f"{i['street']} {i.get('nr', '')}".strip()
        return nf.get(b, b)
    return name


def abgleich(pdir: Path, kameras, google_neu=False, nur_modell=False, kalib_neu=False, licht="dunst_hell",
             sse=4, extra_cams=None, tag="", draufsicht_m=360.0, draufsicht_px=1440, samples=24):
    from .build import load_project
    from . import check as C, fern as FE
    cfg, ctx = load_project(pdir)
    for n, c in (extra_cams or {}).items():
        cfg["cameras"][n] = c
    out_dir = pdir / REF_SUB
    out_dir.mkdir(parents=True, exist_ok=True)
    chk = pdir / "renders" / "check"
    chk.mkdir(parents=True, exist_ok=True)
    W, H = cfg["render"]["preview_resolution"]
    calp = out_dir / "kalibrierung.json"
    cal = json.loads(calp.read_text()) if calp.exists() and not kalib_neu else None
    geo = Geo(cfg, cal)
    ras = Raster((0.0, 0.0), draufsicht_m, draufsicht_px)
    log = {"kameras": kameras}
    cams = [kamera(cfg, k, W, H) for k in kameras]

    # ---- Google: Draufsicht (Kalibrierung, Dachvergleich) und Kameras
    views = []
    dg = out_dir / "draufsicht_google_tiefe.png"
    if cal is None or google_neu or not dg.exists():
        views.append(google_ansicht_draufsicht(geo, (0.0, 0.0), draufsicht_m, draufsicht_px, "draufsicht", out_dir))
    for cam in cams:
        # --nur-modell nutzt vorhandene Google-Bilder; fehlt eines (neue Kamera), wird es trotzdem gerendert
        if google_neu or not (out_dir / f"{cam['name']}_google_tiefe.png").exists() or cal is None:
            views.append(google_ansicht_persp(geo, cam, cam["name"], out_dir))
    dmeta = out_dir / "draufsicht_google.json"
    if any(v["kind"] == "ortho" for v in views):
        # erst die Draufsicht (Kalibrierung, Dachvergleich), dann die Kameras mit kalibrierter Lage und Hoehe
        log["google_draufsicht"] = google_render([v for v in views if v["kind"] == "ortho"], out_dir, sse)
        dmeta.write_text(json.dumps({"h0": geo.h0, "verschiebung": [geo.sx, geo.sy], "groesse": draufsicht_m,
                                     "px": draufsicht_px}))
        views = [v for v in views if v["kind"] != "ortho"]
    # ---- Modell (Blender): Kameras und Draufsicht
    ds = {"mitte": (0.0, 0.0), "groesse": draufsicht_m, "px": draufsicht_px, "hoehe": 900.0}
    log["modell"] = modell_render(pdir, cfg, ctx, cams, out_dir, licht, samples, draufsicht=ds)
    m_h = np.load(out_dir / "draufsicht_modell_hoehe.npy").astype(np.float64)
    g_rgb = Image.open(out_dir / "draufsicht_google.png").convert("RGB")
    if cal is None:
        g_h = 900.0 - lies_tiefe(out_dir / "draufsicht_google_tiefe.png")
        cal = kalibrieren(geo, ctx, ras, g_h, m_h, g_rgb)
        cal["stand"] = time.strftime("%Y-%m-%d %H:%M")
        cal["cesium"] = CESIUM_URL
        calp.write_text(json.dumps(cal, indent=1))
        geo = Geo(cfg, cal)
        views = [google_ansicht_persp(geo, cam, cam["name"], out_dir) for cam in cams]
    log["kalibrierung"] = cal
    if views:
        log["google"] = google_render(views, out_dir, sse)
    # ---- Draufsicht: Google auf Modellkoordinaten bringen
    g_h = 900.0 - lies_tiefe(out_dir / "draufsicht_google_tiefe.png")
    dm_ = json.loads(dmeta.read_text())
    g_h = g_h - (cal["h0"] - dm_["h0"])
    vs = dm_["verschiebung"]
    sx, sy = cal["verschiebung"][0] - vs[0], cal["verschiebung"][1] - vs[1]
    g_h = verschieben(g_h, sx, sy, ras.res)
    veg = verschieben(_vegetation(g_rgb).astype(float), sx, sy, ras.res)
    veg = np.nan_to_num(veg) > 0.5
    labels, names = grundriss_labels(ctx, ras)
    name = _namen(cfg, ctx)
    hero = {str(h) for h in cfg["site"].get("hero_bezug", [])}
    pflicht = C.pflicht_haeuser(cfg, ctx, 5)
    pfl = {}
    for r in pflicht:
        pfl.setdefault(r["bezug"], []).append(r)
    alle = [n for n in names[1:] if n not in hero]
    strasse = _strassen_maske(ctx, ras, ("Fahrbahn", "Gehsteig", "Ruhender Verkehr", "Gehweg, Radweg"))
    dach = dach_kennzahlen(ras, labels, names, g_h, m_h, veg, alle, strasse)
    fern = FE.load(pdir)
    results = {}
    for cam in cams:
        k = cam["name"]
        dep_g = lies_tiefe(out_dir / f"{k}_google_tiefe.png")
        dep_m = np.load(out_dir / f"{k}_modell_tiefe.npy").astype(np.float64)
        xyz_g = rueckprojektion(cam, dep_g)
        # die Referenzkamera stand um die Lageabweichung versetzt: die Punkte liegen damit schon im Modellsystem
        xyz_m = rueckprojektion(cam, dep_m)
        lab_g = gebaeude_maske_bild(ras, labels, xyz_g)
        lab_m = gebaeude_maske_bild(ras, labels, xyz_m)
        sil = silhouette_kennzahlen(cam, names, lab_g, lab_m, dep_g, dep_m, alle)
        hz_g, hz_m = horizont(dep_g), horizont(dep_m)
        fk = fern_kennzahlen(cam, fern, xyz_g, xyz_m, cfg)
        e_g = geo_kanten(xyz_g, dep_g)
        e_m = geo_kanten(xyz_m, dep_m)
        # Kanten-Deckung: Anteil der Referenzkanten mit Modellkante in 2 px
        from scipy import ndimage as ndi
        dm = ndi.distance_transform_edt(~e_m)
        dg_ = ndi.distance_transform_edt(~e_g)
        deck = {"ref_in_2px": round(float((dm[e_g] <= 2).mean()), 3), "mod_in_2px": round(float((dg_[e_m] <= 2).mean()), 3)}
        rgb_g = Image.open(out_dir / f"{k}_google.png").convert("RGB")
        rgb_m = Image.open(out_dir / f"{k}_modell.png").convert("RGB").resize(rgb_g.size)
        # Bogen mit Google (nur intern, nicht im Repo)
        tiles = [rgb_g.copy(), rgb_m.copy(), Image.blend(rgb_g, rgb_m, 0.5), kanten_bild(rgb_m, e_g, e_m)]
        for im, t in zip(tiles, ("Referenz Google 3D (nur intern)", "Modell", "Überblendung 50 %",
                                 "Kanten: rot Referenz, cyan Modell, weiß deckungsgleich")):
            _beschrift(im, t)
        bogen = Image.new("RGB", (W * 2 + 8, H * 2 + 8), "white")
        for i, im in enumerate(tiles):
            bogen.paste(im, ((i % 2) * (W + 8), (i // 2) * (H + 8)))
        bogen.save(out_dir / f"abgleich_{k}{tag}_bogen.jpg", quality=90)
        tiles[3].save(out_dir / f"{k}{tag}_kanten.png")
        if tag:
            rgb_m.save(out_dir / f"{k}_modell{tag}.png")
        # Befund je Gebaeude
        rows = []
        for b, s in sil.items():
            d_ = dach.get(b, {})
            pf = pfl.get(b, [])
            rang = min((r["rang"] for r in pf), default=None)
            txt = befund_text(d_, s) if d_ else []
            werte = [abs(d_.get("traufe_mod", 0) - d_.get("traufe_ref", 0)) if "traufe_ref" in d_ else 0,
                     abs(d_.get("first_mod", 0) - d_.get("first_ref", 0)) if d_ else 0, abs(s.get("kante_m") or 0)]
            tol = TOL_GUT if rang else TOL_HALB
            rows.append({"bezug": b, "name": name(b), "pflicht": bool(pf), "rang": rang,
                         "richtung": sorted({f"{r['strasse']} {r['richtung']} {r['seite']}" for r in pf}),
                         "sil": s, "dach": {kk: (round(v, 2) if isinstance(v, float) else v) for kk, v in d_.items()},
                         "befund": txt, "max_abw": round(max(werte), 2),
                         "ok": max(werte) <= tol and not d_.get("fehlt") and not d_.get("zuviel")})
        rows.sort(key=lambda r: (not r["pflicht"], -(r["sil"]["pixel_ref"] + r["sil"]["pixel_mod"])))
        hz = {"mittel_px": round(float(np.mean(np.abs(hz_g - hz_m))), 1),
              "p90_px": round(float(np.percentile(np.abs(hz_g - hz_m), 90)), 1)}
        res = {"kamera": k, "bild": [W, H], "kanten_deckung": deck, "horizont": hz, "gebaeude": rows, "fern": fk}
        results[k] = res
        (out_dir / f"abgleich_{k}{tag}.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
        _pruefbild(rgb_m, cam, rows, names, lab_m, chk / f"abgleich_{k}.jpg", tag)
        sockel = {}
        g0 = float(cfg["site"].get("ground_wn", 0.0))
        for b in ctx["buildings"]:
            if b.get("klasse") == 11 and b.get("ground") is not None:
                key = str(b.get("bezug"))
                a_ = abs(sum(p[0] * q[1] - q[0] * p[1] for p, q in zip(b["poly"], b["poly"][1:] + b["poly"][:1])))
                if a_ > sockel.get(key, (0, 0))[0]:
                    sockel[key] = (a_, b["ground"] - g0)
        _markdown(chk / f"abgleich_{k}.md", cfg, cam, cal, res, dach, name, pfl, hero, log,
                  {kk: v[1] for kk, v in sockel.items()})
    return {"kalibrierung": cal, "ergebnisse": {k: {"kanten_deckung": v["kanten_deckung"], "horizont": v["horizont"],
                                                    "gebaeude_ok": sum(r["ok"] for r in v["gebaeude"]),
                                                    "gebaeude": len(v["gebaeude"])} for k, v in results.items()},
            "dateien": str(out_dir), "sekunden_modell": log["modell"].get("_sekunden"),
            "sekunden_google": (log.get("google") or {}).get("sekunden")}


def _pruefbild(rgb_m, cam, rows, names, lab_m, out, tag):
    """Modellbild mit Ampel je Gebaeude (gruen in Toleranz, gelb bis 1,5 m, rot darueber), ohne Google-Inhalt."""
    from scipy import ndimage as ndi
    ov = np.asarray(rgb_m).astype(np.float32).copy()
    nr = {}
    for i, r in enumerate(rows, 1):
        k = names.index(r["bezug"])
        m = lab_m == k
        if not m.any():
            continue
        col = (60, 200, 90) if r["ok"] else ((255, 200, 40) if r["max_abw"] <= TOL_HALB else (240, 60, 50))
        rand = m & ~ndi.binary_erosion(m, iterations=2)
        ov[m] = ov[m] * 0.65 + np.array(col) * 0.35
        ov[rand] = col
        nr[r["bezug"]] = i
    im = Image.fromarray(ov.astype(np.uint8))
    d = ImageDraw.Draw(im)
    f = _font(18)
    for i, r in enumerate(rows, 1):
        k = names.index(r["bezug"])
        ii, jj = np.nonzero(lab_m == k)
        if len(ii) < 150:
            continue
        x, y = int(np.median(jj)), int(np.percentile(ii, 15))
        d.rectangle((x - 13, y - 12, x + 13, y + 12), fill=(0, 0, 0))
        d.text((x, y), str(i), font=f, fill=(255, 255, 255), anchor="mm")
    _beschrift(im, f"Abgleich {cam['name']} gegen 3D-Referenz{(' ' + tag.strip('_')) if tag else ''}: grün < 0,5 m, gelb < 1,5 m, rot darüber (Nummern siehe abgleich_{cam['name']}.md)", sz=16)
    im.save(out, quality=88)


def _fz(v, nd=1):
    return "-" if v is None else f"{v:.{nd}f}".replace(".", ",")


def _vorschlag(rows, sockel):
    """YAML-Vorschlag fuer roofs_override: Quader fuer fehlende Aufbauten der Pflichthaeuser (Messwerte aus dem
    Hoehenbild, Hoehen relativ zum Sockel des Baukoerpers). Nur Vorschlag: vor dem Eintragen am Bogen pruefen."""
    out = []
    for r in rows:
        if not r["pflicht"]:
            continue
        auf = []
        for t in r["dach"].get("fehlt", []):
            if t["m2"] < 3.0 or t["m2"] > 40.0 or t["max"] < 1.0 or "z_ref" not in t:
                continue
            zs = sockel.get(r["bezug"], 0.0)
            auf.append(f"{{pos: [{t['pos'][0]}, {t['pos'][1]}], l: {max(1.0, t['l'])}, b: {max(1.0, t['b'])}, "
                       f"z0: {round(t['z_mod'] - zs - 0.5, 1)}, z1: {round(t['z_ref'] - zs, 1)}, drehung: {t['drehung']:.0f}}}")
        if auf:
            out.append(f"  - {{bezug: \"{r['bezug']}\", aufbauten: [{', '.join(auf)}]}}   # {r['name']}")
    return out


def _markdown(path, cfg, cam, cal, res, dach, name, pfl, hero, log, sockel=None):
    k = cam["name"]
    L = [f"# Abgleich Kamera `{k}` gegen die 3D-Referenz", "",
         f"Stand {time.strftime('%d.%m.%Y %H:%M')}, erzeugt mit `immoviz.py referenz {Path(cfg['_project_dir']).name} --kamera {k}`. "
         "Referenz: Google Photorealistic 3D Tiles, nur intern zum Vergleich (keine Geometrie, keine Textur im Modell). "
         "Bilder mit Google-Inhalt liegen nur in `renders/streetview/referenz_google/` (nicht im Repo). "
         "Das Prüfbild `abgleich_" + k + ".jpg` zeigt nur das Modell mit Ampel je Gebäude.", "",
         "## Kalibrierung", "",
         f"- Höhe: Wiener Null liegt {_fz(cal['h0'], 2)} m über dem Ellipsoid (Wiener Null {_fz(WN_UEBER_ADRIA, 2)} m ü. A. plus "
         f"Geoidundulation {_fz(cal['geoid_undulation'], 2)} m), bestimmt auf {cal['punkte_fahrbahn']} Fahrbahnpunkten "
         f"im Umkreis 120 m, Streuung {_fz(cal['streuung_fahrbahn'], 2)} m.",
         f"- Lage: Kacheln gegen die Stadtvermessung um x {_fz(cal['verschiebung'][0], 2)} m, y {_fz(cal['verschiebung'][1], 2)} m "
         "verschoben (Kreuzkorrelation der Hauskanten in der Draufsicht, lokales System); die Referenzkamera steht entsprechend versetzt.",
         f"- Kamera: Standpunkt {list(map(float, cam['pos']))}, Brennweite {cam['lens']} mm, Sensor 36 mm, Bild {cam['W']} x {cam['H']}, "
         f"Shift x {_fz(cam['shift'][0], 3)}, y {_fz(cam['shift'][1], 3)} (in Cesium als symmetrisch höheres Bild gerendert und zugeschnitten).", "",
         "## Gesamtwerte", "",
         f"- Kanten (Tiefensprünge und Flächenknicke): {round(res['kanten_deckung']['ref_in_2px'] * 100)} % der Referenzkanten "
         f"haben eine Modellkante in 2 px, {round(res['kanten_deckung']['mod_in_2px'] * 100)} % der Modellkanten eine Referenzkante.",
         f"- Horizontlinie: mittlere Abweichung {_fz(res['horizont']['mittel_px'])} px, 90 % unter {_fz(res['horizont']['p90_px'])} px.",
         "", "## Befund je Gebäude", "",
         "Vorzeichen: positiv = Modell höher als die Referenz. Höhen in m über Straßenniveau des Objekts (+29,13 WrN). "
         "Traufe = 20 %-Wert am freien Dachrand zur Straße, First = 99 %-Wert ohne Kamine (Öffnung 1,25 m), Dachkante = obere Silhouette im Kamerabild (Median). "
         f"Toleranz: Pflichthäuser {_fz(TOL_GUT)} m, übrige {_fz(TOL_HALB)} m.", "",
         "| Nr. | Gebäude | BEZUG | Pflicht | Traufe Ref./Mod. | First Ref./Mod. | Dachkante im Bild | IoU | Befund |",
         "|---|---|---|---|---|---|---|---|---|"]
    for i, r in enumerate(res["gebaeude"], 1):
        d, s = r["dach"], r["sil"]
        tr = f"{_fz(d.get('traufe_ref'))} / {_fz(d.get('traufe_mod'))}" if "traufe_ref" in d else "-"
        fi = f"{_fz(d.get('first_ref'))} / {_fz(d.get('first_mod'))}" if d else "-"
        ka = f"{_fz(s.get('kante_m'), 2)} m ({_fz(s.get('kante_px'), 0)} px)" if s.get("kante_m") is not None else "-"
        pf = f"ja ({r['rang']})" if r["pflicht"] else "nein"
        bef = ", ".join(r["befund"]) or ("in Toleranz" if r["ok"] else "-")
        L.append(f"| {i} | {r['name']} | {r['bezug']} | {pf} | {tr} | {fi} | {ka} | {_fz(s['iou'], 2)} | {bef} |")
    L += ["", "## Liste", ""]
    for i, r in enumerate(res["gebaeude"], 1):
        if r["befund"]:
            L.append(f"- Gebäude {i} ({r['name']}): {', '.join(r['befund'])}")
    vs = _vorschlag(res["gebaeude"], sockel or {})
    if vs:
        L += ["", "## Vorschlag für roofs_override (fehlende Aufbauten der Pflichthäuser)", "",
              "Quader aus den Messwerten (Lage, Ausdehnung, Höhe relativ zum Sockel). Vor dem Eintragen am Bogen prüfen: "
              "Bäume über Dächern und Kräne erscheinen ebenfalls als fehlende Aufbauten. Mit bestehenden Einträgen "
              "desselben BEZUG zusammenführen.", "", "```yaml", *vs, "```"]
    if res["fern"]:
        L += ["", "## Fernsicht: markante Gebäude im Bild", "",
              "Höchster Punkt im Bild im Umkreis der Lage (max. 40 m bzw. 2 % der Entfernung), m über Straßenniveau des Objekts.",
              "", "| Gebäude | BEZUG | Richtung | Entfernung | Daten (Baukörpermodell) | Referenz | Modell |", "|---|---|---|---|---|---|---|"]
        for f in res["fern"]:
            L.append(f"| {f.get('name') or '-'} | {f['bezug']} | {f['richtung']} Grad | {_fz(f['entfernung'] / 1000, 1)} km | "
                     f"{_fz(f['daten_top'])} | {_fz(f.get('top_ref'))} | {_fz(f.get('top_mod'))} |")
    path.write_text("\n".join(L) + "\n")
