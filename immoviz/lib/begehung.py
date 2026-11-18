"""Virtuelle Begehung: Street View gegen das Modell, Standort für Standort entlang aller Straßen um das Objekt.

Befehl: immoviz.py begehung --projekt <p> [--radius 120] [--schritt 10]

Ablauf
  1. Standorte: Straßenachsen aus dem Straßengraphen der Stadt Wien (OGD, `lib/strasse.ogd_laden`) im Umkreis,
     alle `schritt` Meter eine Abfrage der Street-View-Metadaten (kostenlos: Standort, Datum, Panorama-ID).
     Doppelte Panoramen fallen weg, der Abstand zwischen zwei Standorten ist mindestens 0,7 * schritt. Lage ins
     lokale System über die Kalibrierung aus `lib/referenz.py` (Lageversatz der Google-Daten gegen die
     Stadtvermessung, renders/streetview/referenz_google/kalibrierung.json).
  2. Fotos: je Standort 8 Ansichten über die Static API (4 Richtungen relativ zur Straßenachse: vorn, rechts,
     hinten, links; Bildwinkel 90 Grad; Neigung -10 und +10 Grad; 640 x 640). Nur intern, gitignored.
  3. Modell: dieselben Ansichten in Blender (Kamera 2,5 m über Gelände wie das Google-Auto, gleiche Richtung,
     Neigung und Brennweite), etwas weiter als das Foto (Rand 6 Grad), damit ein kleiner Richtungsfehler des
     Panoramas über Kantenabgleich ausgeglichen werden kann (Versatz je Standort, im Bericht).
  4. Vorprüfung: Kanten (Canny, Abstandstransformation) und Klassenkarten (SegFormer Cityscapes, falls torch und
     transformers installiert sind; sonst nur Kanten und Farbflächen) für Foto und Modell. Klassen: Fahrbahn,
     Gehsteig, Markierung (helle Farbe auf der Fahrbahn), Mast/Pfahl, Schild, Vegetation, Auto, Zweirad, Gebäude,
     Himmel. Ergebnis je Ansicht: Bildbereiche (Raster 8 x 8, zusammengefasst), in denen eine Klasse nur im Foto
     oder nur im Modell vorkommt, mit Schweregrad.
  5. Bogen je Standort: Foto | Modell | Überblendung mit Kanten | Klassen Foto | Klassen Modell, Befund-Rahmen.
     Übersichtskarte (Orthofoto, nur OGD, darf ins Repo) und Bericht `renders/check/begehung_auto.md`.
  6. Prüfliste `begehung.md` im Projekt: wird angelegt, wenn sie fehlt, und von Hand je Standort ausgefüllt.

Google-Bilder bleiben reine Referenz (REGELN.md G1 Rang 4): nichts davon ins Repo, ins Modell oder in ein
Vermarktungsbild. Der Schlüssel steht nur in GOOGLE_MAPS_API_KEY und wird nie geschrieben oder ausgegeben.
"""
from __future__ import annotations

import json
import math
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from . import meshkit as K

SUB = Path("renders") / "streetview" / "begehung"
GROESSE = 640                 # Static API, größte freie Bildgröße
BILD = 512                    # Arbeitsgröße für Vergleich und Modell
RAND_GRAD = 6.0               # zusätzlicher Bildwinkel des Modells für den Richtungsabgleich
KAMERA_HOEHE = 2.5            # Google-Auto: Kamera rund 2,5 m über der Fahrbahn
RICHTUNGEN = {"vorn": 0, "rechts": 90, "hinten": 180, "links": 270}
NEIGUNGEN = {"u": -10, "o": 10}

# Klassen der Vorprüfung (Cityscapes-Index -> eigene Klasse)
KLASSEN = ["Fahrbahn", "Gehsteig", "Markierung", "Mast/Pfahl", "Schild", "Vegetation", "Auto", "Zweirad", "Gebäude",
           "Himmel", "Person", "sonstiges"]
CS_ZU = {0: "Fahrbahn", 1: "Gehsteig", 2: "Gebäude", 3: "Gebäude", 4: "sonstiges", 5: "Mast/Pfahl",
         6: "Schild", 7: "Schild", 8: "Vegetation", 9: "Vegetation", 10: "Himmel", 11: "Person", 12: "Person",
         13: "Auto", 14: "Auto", 15: "Auto", 16: "sonstiges", 17: "Zweirad", 18: "Zweirad"}
FARBE = {"Fahrbahn": (90, 90, 95), "Gehsteig": (230, 140, 200), "Markierung": (255, 255, 255),
         "Mast/Pfahl": (255, 210, 0), "Schild": (255, 40, 40), "Vegetation": (60, 170, 50), "Auto": (40, 80, 230),
         "Zweirad": (0, 220, 255), "Gebäude": (150, 110, 80), "Himmel": (150, 200, 255), "Person": (255, 120, 0),
         "sonstiges": (40, 40, 40)}
# Schweregrad, wenn eine Klasse nur auf einer Seite vorkommt (Autos und Personen wechseln, nur Hinweis)
GEWICHT = {"Mast/Pfahl": "mittel", "Schild": "mittel", "Markierung": "mittel", "Gehsteig": "hoch",
           "Fahrbahn": "hoch", "Vegetation": "niedrig", "Zweirad": "niedrig", "Auto": "info", "Gebäude": "mittel"}
DETAIL = ("Mast/Pfahl", "Schild", "Markierung", "Gehsteig", "Fahrbahn", "Vegetation", "Zweirad", "Gebäude", "Auto")


# ======================================================================= Koordinaten
class Lage:
    """Lokales System <-> WGS84 und Google-Kompassrichtung; Google-Lagen um die Kalibrierung verschoben."""

    def __init__(self, ctx, pdir: Path):
        from pyproj import Transformer
        fr = ctx["frame"]
        self.ox, self.oy = fr["origin_gk"]
        self.a = math.radians(fr["x_axis_deg"])
        self.to_wgs = Transformer.from_crs("EPSG:31256", "EPSG:4326", always_xy=True)
        self.to_gk = Transformer.from_crs("EPSG:4326", "EPSG:31256", always_xy=True)
        cal = pdir / "renders" / "streetview" / "referenz_google" / "kalibrierung.json"
        self.sx, self.sy = (json.loads(cal.read_text()).get("verschiebung", [0.0, 0.0]) if cal.exists() else (0.0, 0.0))
        self.kalibriert = cal.exists()

    def wgs(self, x, y, google=True):
        """Lokaler Punkt -> (lat, lon); google=True rechnet in die (verschobene) Lage der Google-Daten."""
        if google:
            x, y = x + self.sx, y + self.sy
        c, s = math.cos(self.a), math.sin(self.a)
        gx, gy = self.ox + x * c - y * s, self.oy + x * s + y * c
        lon, lat = self.to_wgs.transform(gx, gy)
        return lat, lon

    def lokal(self, lat, lon, google=True):
        gx, gy = self.to_gk.transform(lon, lat)
        dx, dy = gx - self.ox, gy - self.oy
        c, s = math.cos(self.a), math.sin(self.a)
        x, y = dx * c + dy * s, -dx * s + dy * c
        if google:
            x, y = x - self.sx, y - self.sy
        return x, y

    def heading(self, dx, dy):
        """Richtung im lokalen System -> Kompassrichtung (Grad, im Uhrzeigersinn ab Nord)."""
        c, s = math.cos(self.a), math.sin(self.a)
        ost, nord = dx * c - dy * s, dx * s + dy * c
        return (math.degrees(math.atan2(ost, nord)) + 360.0) % 360.0

    def richtung(self, heading):
        h = math.radians(heading)
        ost, nord = math.sin(h), math.cos(h)
        c, s = math.cos(self.a), math.sin(self.a)
        return ost * c + nord * s, -ost * s + nord * c


# ======================================================================= Google (nur intern)
def _hole(url_ohne_key: str, key: str, timeout=30) -> bytes:
    """GET mit Schlüssel; Fehlermeldungen ohne URL, damit der Schlüssel nie in Logs landet."""
    try:
        with urllib.request.urlopen(url_ohne_key + "&key=" + urllib.parse.quote(key), timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Google antwortet {e.code}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"Google nicht erreichbar ({type(e.reason).__name__})") from None


def metadaten(lat, lon, key, radius=10):
    q = urllib.parse.urlencode({"location": f"{lat:.7f},{lon:.7f}", "radius": radius, "source": "outdoor"})
    return json.loads(_hole(f"https://maps.googleapis.com/maps/api/streetview/metadata?{q}", key, 20))


def foto(pano, heading, pitch, fov, key, pfad: Path):
    if pfad.exists():
        return pfad
    q = urllib.parse.urlencode({"size": f"{GROESSE}x{GROESSE}", "pano": pano, "heading": round(heading, 2),
                                "pitch": pitch, "fov": fov, "return_error_code": "true"})
    pfad.write_bytes(_hole(f"https://maps.googleapis.com/maps/api/streetview?{q}", key))
    return pfad


# ======================================================================= Standorte
def _achsen(ogd, mitte, radius, strassen=None):
    """Straßenachsen (Straßengraph) im Umkreis, optional nur bestimmte Straßennamen."""
    out = []
    for e in (ogd.get("layer", {}).get("strassengraph") or []):
        name = e["props"].get("FEATURENAME") or "?"
        if strassen and not any(name.lower().startswith(s.lower()) for s in strassen):
            continue
        pts = e["pts"]
        if any(math.dist(p, mitte) < radius for p in pts):
            out.append((name, pts))
    return out


def standorte(pdir: Path, cfg, ctx, key, radius=120.0, schritt=10.0, strassen=None, neu=False) -> list[dict]:
    from . import strasse as ST
    pfad = pdir / SUB / "standorte.json"
    if pfad.exists() and not neu:
        d = json.loads(pfad.read_text())
        if d.get("radius") == radius and d.get("schritt") == schritt and d.get("strassen") == strassen:
            return d["standorte"]
    lage = Lage(ctx, pdir)
    hero = max((h["poly"] for h in ctx["hero"]), key=lambda p: abs(K.polygon_area(p)))
    mitte = (sum(p[0] for p in hero) / len(hero), sum(p[1] for p in hero) / len(hero))
    ogd = ST.ogd_laden(pdir, radius=max(220.0, radius + 60))
    gefunden = {}
    for name, pts in _achsen(ogd, mitte, radius, strassen):
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            L = math.dist(a, b)
            t = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
            for k in range(int(L / schritt) + 1):
                s = min(L, k * schritt)
                x, y = a[0] + t[0] * s, a[1] + t[1] * s
                if math.dist((x, y), mitte) > radius:
                    continue
                m = metadaten(*lage.wgs(x, y), key)
                if m.get("status") != "OK":
                    continue
                pid = m["pano_id"]
                px, py = lage.lokal(m["location"]["lat"], m["location"]["lng"])
                if pid not in gefunden and math.dist((px, py), mitte) <= radius + 5:
                    gefunden[pid] = {"pano": pid, "datum": m.get("date"), "x": round(px, 2), "y": round(py, 2),
                                     "strasse": name, "achse": [round(t[0], 4), round(t[1], 4)],
                                     "station": round(math.dist((px, py), mitte), 1)}
    # ausdünnen: mindestens 0,7 * schritt Abstand, jüngere Aufnahmen bevorzugt
    liste = sorted(gefunden.values(), key=lambda s: (s.get("datum") or ""), reverse=True)
    behalten = []
    for s in liste:
        if all(math.dist((s["x"], s["y"]), (b["x"], b["y"])) >= 0.7 * schritt for b in behalten):
            behalten.append(s)
    # Nummern je Straße in Laufrichtung
    behalten.sort(key=lambda s: (s["strasse"], s["x"] * s["achse"][0] + s["y"] * s["achse"][1]))
    zaehl = {}
    for s in behalten:
        kurz = "".join(c for c in s["strasse"].upper() if c.isalpha())[:2]
        zaehl[kurz] = zaehl.get(kurz, 0) + 1
        s["id"] = f"{kurz}{zaehl[kurz]:02d}"
    pfad.parent.mkdir(parents=True, exist_ok=True)
    pfad.write_text(json.dumps({"radius": radius, "schritt": schritt, "strassen": strassen,
                                "kalibriert": lage.kalibriert, "verschiebung": [lage.sx, lage.sy],
                                "standorte": behalten}, ensure_ascii=False, indent=1))
    return behalten


def ansichten(s):
    """8 Ansichten je Standort: Richtung relativ zur Straßenachse, Neigung."""
    out = []
    for rn, rw in RICHTUNGEN.items():
        w = math.atan2(s["achse"][1], s["achse"][0]) - math.radians(rw)      # rechts = im Uhrzeigersinn
        for nn, nw in NEIGUNGEN.items():
            out.append({"name": f"{rn}_{nn}", "dir": (math.cos(w), math.sin(w)), "pitch": nw, "fov": 90})
    return out


# ======================================================================= Modell (Blender)
def modell_rendern(pdir: Path, cfg, ctx, liste, tag="", licht="dunst_hell", samples=8, ordner=None, log=print):
    import bpy
    from . import build as B
    scene = B.build_scene(cfg, ctx)
    B.setup_render(scene, (BILD, BILD), samples)
    B.setup_light(scene, cfg, ctx, licht)
    # Vorschau-Qualität reicht für den Abgleich: wenige Bounces, Szene bleibt zwischen den Bildern geladen
    scene.render.use_persistent_data = True
    c = scene.cycles
    c.max_bounces, c.diffuse_bounces, c.glossy_bounces, c.transmission_bounces = 4, 2, 2, 4
    c.transparent_max_bounces = 8
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.05
    for o in scene.objects:                       # Platzhalter für Menschen gehören nicht zur Wirklichkeit
        if o.name.startswith("menschen_platzhalter"):
            o.hide_render = True
    terrain = B.LAST_TERRAIN or (lambda x, y: 0.0)
    cam = bpy.data.cameras.new("begehung")
    ob = bpy.data.objects.new("KAM_begehung", cam)
    scene.collection.objects.link(ob)
    scene.camera = ob
    cam.sensor_fit = "HORIZONTAL"
    cam.sensor_width = 36
    cam.clip_start = 0.2
    cam.clip_end = 30000
    t0 = time.time()
    n = 0
    for s in liste:
        d = (ordner or (pdir / SUB)) / s["id"]
        d.mkdir(parents=True, exist_ok=True)
        z = terrain(s["x"], s["y"]) + KAMERA_HOEHE
        for v in ansichten(s):
            fov_m = v["fov"] + 2 * RAND_GRAD
            f_px = BILD / 2 / math.tan(math.radians(v["fov"]) / 2)
            breite = int(round(2 * f_px * math.tan(math.radians(fov_m) / 2)))
            scene.render.resolution_x = scene.render.resolution_y = breite
            cam.lens = 18 / math.tan(math.radians(fov_m) / 2)
            ob.location = (s["x"], s["y"], z)
            ob.rotation_euler = (math.radians(90 + v["pitch"]), 0, math.atan2(-v["dir"][0], v["dir"][1]))
            scene.render.filepath = str(d / f"{v['name']}_modell{tag}.png")
            bpy.ops.render.render(write_still=True)
            n += 1
        log(f"[begehung] Modell {s['id']} fertig ({n} Ansichten, {time.time() - t0:.0f} s)")
    return n


# ======================================================================= Vorprüfung
_SEG = {}


def _segformer():
    if "m" not in _SEG:
        try:
            import torch  # noqa: F401
            from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor
            name = os.environ.get("IMMOVIZ_SEGMODELL", "nvidia/segformer-b2-finetuned-cityscapes-1024-1024")
            _SEG["p"] = SegformerImageProcessor.from_pretrained(name)
            _SEG["m"] = SegformerForSemanticSegmentation.from_pretrained(name).eval()
            _SEG["name"] = name
        except Exception as e:                      # ohne torch/transformers: nur Kanten und Farbflächen
            _SEG["m"] = None
            _SEG["grund"] = f"{type(e).__name__}: {str(e)[:120]}"
    return _SEG["m"]


def klassen(rgb: np.ndarray) -> np.ndarray | None:
    """Klassenkarte (Index in KLASSEN) je Pixel oder None ohne Modell. Markierung = helle Farbe auf Fahrbahn."""
    m = _segformer()
    if m is None:
        return None
    import torch
    with torch.no_grad():
        inp = _SEG["p"](images=Image.fromarray(rgb), return_tensors="pt")
        lo = m(**inp).logits
        lo = torch.nn.functional.interpolate(lo, size=rgb.shape[:2], mode="bilinear", align_corners=False)
        cs = lo.argmax(1)[0].numpy()
    out = np.full(cs.shape, KLASSEN.index("sonstiges"), np.uint8)
    for k, v in CS_ZU.items():
        out[cs == k] = KLASSEN.index(v)
    # Markierung: deutlich heller als die Fahrbahn ringsum und kaum gesättigt
    import cv2
    fb = out == KLASSEN.index("Fahrbahn")
    if fb.sum() > 500:
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
        v_lok = cv2.blur(np.where(fb, hsv[..., 2], 0), (41, 41)) / np.maximum(cv2.blur(fb.astype(np.float32), (41, 41)), 1e-3)
        mk = fb & (hsv[..., 2] > v_lok + 45) & (hsv[..., 1] < 60)
        mk = cv2.morphologyEx(mk.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
        out[mk] = KLASSEN.index("Markierung")
    return out


def kanten(rgb):
    import cv2
    g = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY), (5, 5), 1.2)
    return cv2.Canny(g, 50, 130) > 0


def ausrichten(fotos_e, modelle_e, such=24, such_v=8):
    """Gemeinsamer Bildversatz (dx, dy) des Modellausschnitts für alle Ansichten eines Standorts (Chamfer)."""
    import cv2
    best = (1e9, 0, 0)
    dts = [cv2.distanceTransform((~me).astype(np.uint8), cv2.DIST_L2, 3) for me in modelle_e]
    for dy in range(-such_v, such_v + 1, 2):
        for dx in range(-such, such + 1, 2):
            tot, n = 0.0, 0
            for fe, dt in zip(fotos_e, dts):
                o = (dt.shape[0] - BILD) // 2
                crop = dt[o + dy:o + dy + BILD, o + dx:o + dx + BILD]
                v = np.minimum(crop[fe], 12.0)
                tot += float(v.sum())
                n += v.size
            sc = tot / max(n, 1)
            if sc < best[0]:
                best = (sc, dx, dy)
    return best


def _bereiche(zellen, n=8):
    """Benachbarte markierte Rasterzellen zu Rechtecken zusammenfassen."""
    from scipy import ndimage as ndi
    lab, k = ndi.label(zellen)
    out = []
    for i in range(1, k + 1):
        ys, xs = np.where(lab == i)
        out.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, len(xs)))
    return out


def vergleich(foto_rgb, modell_rgb, kf, km, n=8):
    """Auffällige Bildbereiche: je Rasterzelle Anteil einer Klasse im Foto gegen Modell; Kantenabweichung."""
    H, W = foto_rgb.shape[:2]
    cw, ch = W // n, H // n
    befunde = []
    ef, em = kanten(foto_rgb), kanten(modell_rgb)
    import cv2
    dt_m = cv2.distanceTransform((~em).astype(np.uint8), cv2.DIST_L2, 3)
    dt_f = cv2.distanceTransform((~ef).astype(np.uint8), cv2.DIST_L2, 3)
    chamfer = float(np.minimum(dt_m[ef], 12).mean()) if ef.any() else 0.0
    kennz = {"chamfer_px": round(chamfer, 2)}
    if kf is not None and km is not None:
        for kl in DETAIL:
            i = KLASSEN.index(kl)
            af = (kf == i).reshape(n, ch, n, cw).mean(axis=(1, 3))
            am = (km == i).reshape(n, ch, n, cw).mean(axis=(1, 3))
            schwach = 0.02 if kl in ("Mast/Pfahl", "Schild", "Markierung", "Zweirad") else 0.15
            for seite, a, b in (("nur im Foto", af, am), ("nur im Modell", am, af)):
                z = (a > schwach) & (b < a * 0.35)
                if kl in ("Fahrbahn", "Gehsteig", "Vegetation", "Gebäude", "Auto"):
                    z &= (a - b) > 0.25
                for x0, y0, x1, y1, nz in _bereiche(z, n):
                    anteil = float(a[y0:y1, x0:x1].mean() * (x1 - x0) * (y1 - y0) / (n * n))
                    if anteil < (0.002 if kl in ("Mast/Pfahl", "Schild", "Markierung") else 0.01):
                        continue
                    nah = y1 >= n * 0.6          # untere Bildhälfte: nahe am Standort
                    sg = GEWICHT[kl]
                    if sg == "mittel" and nah and kl in ("Mast/Pfahl", "Schild", "Markierung"):
                        sg = "hoch"
                    if sg == "hoch" and not nah:
                        sg = "mittel"
                    befunde.append({"klasse": kl, "seite": seite, "schwere": sg, "anteil_prozent": round(100 * anteil, 2),
                                    "box": [int(x0 * cw), int(y0 * ch), int(x1 * cw), int(y1 * ch)]})
        for kl in ("Fahrbahn", "Gehsteig", "Markierung", "Mast/Pfahl", "Schild", "Vegetation", "Gebäude", "Himmel"):
            i = KLASSEN.index(kl)
            a, b = kf == i, km == i
            u = (a | b).sum()
            kennz[f"iou_{kl}"] = round(float((a & b).sum() / u), 3) if u > 200 else None
    else:                                        # ohne Klassen: Kantenabweichung je Zelle
        z = np.zeros((n, n), bool)
        for j in range(n):
            for i in range(n):
                fe = ef[j * ch:(j + 1) * ch, i * cw:(i + 1) * cw]
                me = em[j * ch:(j + 1) * ch, i * cw:(i + 1) * cw]
                if fe.sum() > 60 and float(np.minimum(dt_m[j * ch:(j + 1) * ch, i * cw:(i + 1) * cw][fe], 12).mean()) > 6.0:
                    z[j, i] = True
                if me.sum() > 60 and float(np.minimum(dt_f[j * ch:(j + 1) * ch, i * cw:(i + 1) * cw][me], 12).mean()) > 6.0:
                    z[j, i] = True
        for x0, y0, x1, y1, nz in _bereiche(z, n):
            befunde.append({"klasse": "Kontur", "seite": "weicht ab", "schwere": "mittel" if y1 >= n * 0.6 else "niedrig",
                            "anteil_prozent": round(100 * nz / (n * n), 1),
                            "box": [int(x0 * cw), int(y0 * ch), int(x1 * cw), int(y1 * ch)]})
    return befunde, kennz, ef, em


def _klassenbild(k):
    pal = np.array([FARBE[c] for c in KLASSEN], np.uint8)
    return pal[k]


def _font(sz):
    from PIL import ImageFont
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"):
        try:
            return ImageFont.truetype(p, sz)
        except OSError:
            continue
    return ImageFont.load_default()


SCHWERE_FARBE = {"hoch": (255, 0, 0), "mittel": (255, 160, 0), "niedrig": (255, 255, 0), "info": (180, 180, 180)}


def auswerten(pdir: Path, s, tag="", log=print, ordner=None):
    """Vorprüfung und Bogen eines Standorts. Liefert Kennzahlen und Befunde je Ansicht."""
    import cv2
    d = (ordner or (pdir / SUB)) / s["id"]
    vs = ansichten(s)
    fotos, modelle = [], []
    for v in vs:
        f = np.asarray(Image.open(d / f"{v['name']}_foto.jpg").convert("RGB").resize((BILD, BILD), Image.LANCZOS))
        m = np.asarray(Image.open(d / f"{v['name']}_modell{tag}.png").convert("RGB"))
        fotos.append(f)
        modelle.append(m)
    sc, dx, dy = ausrichten([kanten(f) for f in fotos], [kanten(m) for m in modelle])
    o = (modelle[0].shape[0] - BILD) // 2
    modelle = [m[o + dy:o + dy + BILD, o + dx:o + dx + BILD] for m in modelle]
    f_px = BILD / 2 / math.tan(math.radians(45))
    vers = {"dx_px": dx, "dy_px": dy, "gier_grad": round(math.degrees(math.atan(dx / f_px)), 2),
            "nick_grad": round(-math.degrees(math.atan(dy / f_px)), 2), "chamfer": round(sc, 2)}
    T = 320
    kopf = 40
    bogen = Image.new("RGB", (5 * T, kopf + len(vs) * (T + 22)), (18, 18, 18))
    dr = ImageDraw.Draw(bogen)
    fnt, fnt_k = _font(20), _font(14)
    dr.text((8, 8), f"Begehung {s['id']} ({s['strasse']}, x {s['x']:.1f} / y {s['y']:.1f}, Street View {s.get('datum')}) "
                    f"| Foto | Modell{tag} | Überblendung + Kanten (rot Foto, cyan Modell) | Klassen Foto | Klassen Modell | "
                    f"Ausgleich Gier {vers['gier_grad']} Grad, Nick {vers['nick_grad']} Grad", fill=(255, 255, 255), font=fnt_k)
    erg = []
    for r, (v, f, m) in enumerate(zip(vs, fotos, modelle)):
        kf, km = klassen(f), klassen(m)
        bef, kz, ef, em = vergleich(f, m, kf, km)
        erg.append({"ansicht": v["name"], "kennzahlen": kz, "befunde": bef})
        y0 = kopf + r * (T + 22)
        mix = (0.5 * f + 0.5 * m).astype(np.uint8)
        mix[ef] = (255, 40, 40)
        mix[em & ~ef] = (0, 230, 255)
        kacheln = [f, m, mix]
        if kf is not None:
            kacheln += [(0.35 * f + 0.65 * _klassenbild(kf)).astype(np.uint8), (0.35 * m + 0.65 * _klassenbild(km)).astype(np.uint8)]
        for c, k in enumerate(kacheln):
            im = Image.fromarray(k).resize((T, T), Image.BILINEAR)
            if c >= 3 or c == 1:
                di = ImageDraw.Draw(im)
                for b in bef:
                    if b["schwere"] == "info":
                        continue
                    bx = [int(q * T / BILD) for q in b["box"]]
                    di.rectangle(bx, outline=SCHWERE_FARBE[b["schwere"]], width=2)
                    di.text((bx[0] + 3, bx[1] + 2), f"{b['klasse']} {'F' if b['seite'] == 'nur im Foto' else 'M'}",
                            fill=SCHWERE_FARBE[b["schwere"]], font=fnt_k)
            bogen.paste(im, (c * T, y0 + 20))
        n_h = sum(b["schwere"] == "hoch" for b in bef)
        dr.text((6, y0 + 2), f"{v['name']} (Neigung {v['pitch']:+d}) Kanten {kz['chamfer_px']} px, Befunde {len(bef)} "
                             f"(hoch {n_h})", fill=(255, 255, 0), font=fnt_k)
    bogen.save(d / f"bogen{tag}.jpg", quality=84)
    res = {"id": s["id"], "ausgleich": vers, "ansichten": erg}
    (d / f"vorpruefung{tag}.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    log(f"[begehung] Vorprüfung {s['id']}: " + ", ".join(f"{e['ansicht']} {len(e['befunde'])}" for e in erg))
    return res


# ======================================================================= Übersicht und Bericht
def karte(pdir: Path, cfg, ctx, liste, ergebnisse, out: Path, mpp=0.12):
    """Orthofoto (OGD) mit Standorten, Nummer und Zahl der Befunde (Ampel). Ohne Google-Inhalt, darf ins Repo."""
    from . import roofs as R
    xs = [s["x"] for s in liste] + [0.0]
    ys = [s["y"] for s in liste] + [0.0]
    x0, x1, y0, y1 = min(xs) - 15, max(xs) + 15, min(ys) - 15, max(ys) + 15
    ort = R.Ortho(ctx, max(abs(x0), abs(x1), abs(y0), abs(y1)) + 5, 19, pdir / "data" / "ortho_cache")
    W, H = int((x1 - x0) / mpp), int((y1 - y0) / mpp)
    o = ort.pixel(x0, y1)
    ex, ey = ort.pixel(x0 + mpp, y1), ort.pixel(x0, y1 - mpp)
    img = ort.img.transform((W, H), Image.AFFINE, (ex[0] - o[0], ey[0] - o[0], o[0], ex[1] - o[1], ey[1] - o[1], o[1]),
                            Image.BICUBIC).convert("RGB")
    d = ImageDraw.Draw(img)
    P = lambda x, y: ((x - x0) / mpp, (y1 - y) / mpp)
    for h in ctx["hero"]:
        d.line([P(*p) for p in h["poly"]] + [P(*h["poly"][0])], fill=(255, 0, 255), width=3)
    fnt = _font(15)
    for s in liste:
        e = ergebnisse.get(s["id"])
        n_h = sum(b["schwere"] == "hoch" for a in (e or {}).get("ansichten", []) for b in a["befunde"])
        n_m = sum(b["schwere"] == "mittel" for a in (e or {}).get("ansichten", []) for b in a["befunde"])
        col = (200, 200, 200) if e is None else (255, 40, 40) if n_h else (255, 170, 0) if n_m > 3 else (40, 220, 60)
        c = P(s["x"], s["y"])
        d.ellipse([c[0] - 9, c[1] - 9, c[0] + 9, c[1] + 9], fill=col, outline=(0, 0, 0), width=2)
        ax = s["achse"]
        d.line([c, (c[0] + ax[0] * 22, c[1] - ax[1] * 22)], fill=(0, 0, 0), width=3)
        d.text((c[0] + 11, c[1] - 8), s["id"], fill=(255, 255, 255), font=fnt, stroke_width=3, stroke_fill=(0, 0, 0))
    d.rectangle([0, H - 30, W, H], fill=(0, 0, 0))
    d.text((8, H - 24), "Begehung: Standorte (Strich = Straßenachse vorn), Ampel aus der Vorprüfung (rot: Befund hoch, "
                        "orange: mehr als 3 mittel). Orthofoto 2024: Stadt Wien, data.wien.gv.at (CC BY 4.0)",
           fill=(255, 255, 255), font=fnt)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, quality=85)
    return out


def bericht(pdir: Path, liste, ergebnisse, meta, out: Path, tag=""):
    """Textbericht der Vorprüfung (ohne Bilder, darf ins Repo)."""
    z = [f"# Begehung, automatische Vorprüfung {pdir.name}{(' ' + tag) if tag else ''}", "",
         f"Erzeugt mit `immoviz.py begehung` am {time.strftime('%d.%m.%Y %H:%M')}. Standorte {len(liste)}, Ansichten je "
         f"Standort {len(RICHTUNGEN) * len(NEIGUNGEN)} (vorn, rechts, hinten, links relativ zur Straßenachse; Neigung "
         f"-10 und +10 Grad; 90 Grad Bildwinkel). Klassen: {meta.get('klassen')}. Lage aus Street-View-Metadaten, "
         f"verschoben um die Kalibrierung {meta.get('verschiebung')} m (`referenz`). Bögen (nur intern): "
         f"`{SUB}/<standort>/bogen{tag}.jpg`. Übersicht: `renders/check/begehung_karte.jpg`.", "",
         "Die Vorprüfung lenkt die Sichtprüfung, sie ersetzt sie nicht: geparkte Autos, Personen, Jahreszeit und "
         "Baustellen weichen immer ab. Befunde \"nur im Foto\" heißen: im Modell fehlt etwas, \"nur im Modell\": das "
         "Modell zeigt etwas, das es nicht gibt (oder es ist verdeckt). Schwere hoch = Gehsteig, Fahrbahn oder "
         "Mast/Schild/Markierung in der unteren Bildhälfte (nah).", "",
         "| Standort | Straße | Lage x / y | Aufnahme | Ausgleich Gier / Nick | Kanten (px) | hoch | mittel | niedrig |",
         "|---|---|---|---|---|---|---|---|---|"]
    for s in liste:
        e = ergebnisse.get(s["id"])
        if not e:
            continue
        bs = [b for a in e["ansichten"] for b in a["befunde"]]
        ch = [a["kennzahlen"]["chamfer_px"] for a in e["ansichten"]]
        z.append(f"| {s['id']} | {s['strasse']} | {s['x']:.1f} / {s['y']:.1f} | {s.get('datum')} | "
                 f"{e['ausgleich']['gier_grad']} / {e['ausgleich']['nick_grad']} | {sum(ch) / len(ch):.1f} | "
                 f"{sum(b['schwere'] == 'hoch' for b in bs)} | {sum(b['schwere'] == 'mittel' for b in bs)} | "
                 f"{sum(b['schwere'] == 'niedrig' for b in bs)} |")
    z += ["", "## Befunde hoch und mittel je Standort", ""]
    for s in liste:
        e = ergebnisse.get(s["id"])
        if not e:
            continue
        zeilen = []
        for a in e["ansichten"]:
            for b in a["befunde"]:
                if b["schwere"] in ("hoch", "mittel"):
                    zeilen.append(f"- {a['ansicht']}: {b['klasse']} {b['seite']} ({b['schwere']}, {b['anteil_prozent']} % "
                                  f"des Bilds, Bereich {b['box']})")
        if zeilen:
            z += [f"### {s['id']} ({s['strasse']}, {s['x']:.1f} / {s['y']:.1f})", ""] + zeilen + [""]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(z) + "\n")
    return out


PRUEFPUNKTE = ["Bordstein und Gehsteigkanten", "Querungen, Gehsteigüberfahrten, Schwellen, Rampen",
               "Bodenmarkierungen (Mittellinie, Radpiktogramme, Sperrflächen, Parkmarkierung)",
               "Verkehrszeichen (Lage, Art)", "Poller (Lage, Farbe, Anzahl)", "Leuchten", "Bäume", "Parkordnung",
               "Fahrrad- und Motorradabstellplätze", "Mistkübel, Hydranten, Schaltkästen",
               "Erdgeschosszonen (Lokale, Portale, Schilder ohne Text)", "Pflasterarten"]


def vorlage(pdir: Path, liste) -> Path:
    """Legt begehung.md mit Standorten und Prüfpunkten an, wenn sie fehlt (wird von Hand ausgefüllt)."""
    p = pdir / "begehung.md"
    if p.exists():
        return p
    z = [f"# Begehung {pdir.name}", "", "Virtuelle Begehung (`immoviz.py begehung`), Sichtprüfung je Standort anhand der "
         f"Bögen `{SUB}/<standort>/bogen.jpg` (nur intern). Je Abweichung: Standort, Beschreibung, Schweregrad "
         "(hoch: falsch im Bild sichtbar, mittel: falsch, aber klein, niedrig: Detail), Korrektur.", "",
         "## Prüfpunkte", ""] + [f"- {p_}" for p_ in PRUEFPUNKTE] + ["", "## Abweichungen", "",
         "| Nr | Standort | Prüfpunkt | Beschreibung | Schwere | Korrektur | Stand |", "|---|---|---|---|---|---|---|", "",
         "## Standorte", ""]
    for s in liste:
        z += [f"### {s['id']} ({s['strasse']}, {s['x']:.1f} / {s['y']:.1f}, Street View {s.get('datum')})", "",
              "- [ ] geprüft", ""]
    p.write_text("\n".join(z) + "\n")
    return p


# ======================================================================= Ablauf
def begehung(pdir: Path, radius=120.0, schritt=10.0, strassen=None, nur=None, tag="", nur_modell=False,
             ohne_modell=False, standorte_neu=False, samples=8, licht="dunst_hell", log=print) -> dict:
    from . import build as B
    pdir = Path(pdir).resolve()
    cfg, ctx = B.load_project(pdir)
    opt = cfg.get("begehung") or {}
    radius = float(radius or opt.get("radius", 120))
    schritt = float(schritt or opt.get("schritt", 10))
    strassen = strassen or opt.get("strassen")
    key = os.environ.get("GOOGLE_MAPS_API_KEY")
    t0 = time.time()
    sp = pdir / SUB / "standorte.json"
    if not key and not sp.exists():
        raise SystemExit("GOOGLE_MAPS_API_KEY fehlt (nur als Umgebungsvariable im Befehl, nie in Dateien)")
    liste = standorte(pdir, cfg, ctx, key, radius, schritt, strassen, neu=standorte_neu) if key else \
        json.loads(sp.read_text())["standorte"]
    alle = liste
    if nur:
        liste = [s for s in liste if any(s["id"].startswith(n) for n in nur)]
    log(f"[begehung] {len(liste)} von {len(alle)} Standorten ({time.time() - t0:.0f} s)")
    lage = Lage(ctx, pdir)
    if not nur_modell:
        if not key:
            raise SystemExit("GOOGLE_MAPS_API_KEY fehlt")
        n = 0
        for s in liste:
            d = pdir / SUB / s["id"]
            d.mkdir(parents=True, exist_ok=True)
            for v in ansichten(s):
                p = d / f"{v['name']}_foto.jpg"
                if not p.exists():
                    foto(s["pano"], lage.heading(*v["dir"]), v["pitch"], v["fov"], key, p)
                    n += 1
        log(f"[begehung] Fotos: {n} neu geladen ({time.time() - t0:.0f} s)")
    if not ohne_modell:
        modell_rendern(pdir, cfg, ctx, liste, tag=tag, licht=licht, samples=samples, log=log)
    ergebnisse = {}
    for s in liste:
        try:
            ergebnisse[s["id"]] = auswerten(pdir, s, tag, log)
        except FileNotFoundError as e:
            log(f"[begehung] {s['id']} ausgelassen: {Path(e.filename).name} fehlt")
    # Übersicht über alle Standorte (auch frühere Läufe)
    for s in alle:
        if s["id"] not in ergebnisse:
            p = pdir / SUB / s["id"] / f"vorpruefung{tag}.json"
            if p.exists():
                ergebnisse[s["id"]] = json.loads(p.read_text())
    meta = {"klassen": (f"SegFormer ({_SEG.get('name')})" if _SEG.get("m") is not None else
                        f"ohne Segmentierung ({_SEG.get('grund', 'nicht geladen')})"),
            "verschiebung": [lage.sx, lage.sy]}
    chk = pdir / "renders" / "check"
    k = karte(pdir, cfg, ctx, alle, ergebnisse, chk / f"begehung_karte{tag}.jpg")
    b = bericht(pdir, alle, ergebnisse, meta, chk / f"begehung_auto{tag}.md", tag)
    v = vorlage(pdir, alle)
    zahl = lambda sw: sum(bf["schwere"] == sw for e in ergebnisse.values() for a in e["ansichten"] for bf in a["befunde"])
    return {"standorte": len(alle), "bearbeitet": len(liste), "karte": str(k), "bericht": str(b), "pruefliste": str(v),
            "befunde": {"hoch": zahl("hoch"), "mittel": zahl("mittel"), "niedrig": zahl("niedrig")},
            "klassen": meta["klassen"], "sekunden": round(time.time() - t0)}


def vorher_nachher(pdir: Path, sid: str, ansichten_namen, tag_vorher: str, tag_nachher: str, out: Path) -> Path:
    """Bogen Foto | Modell vorher | Modell nachher für ausgewählte Ansichten eines Standorts (nur intern)."""
    pdir = Path(pdir)
    d = pdir / SUB / sid
    T = 480
    reihen = []
    for an in ansichten_namen:
        f = Image.open(d / f"{an}_foto.jpg").convert("RGB").resize((BILD, BILD))
        teile = [f]
        for tg in (tag_vorher, tag_nachher):
            m = Image.open(d / f"{an}_modell{tg}.png").convert("RGB")
            js = d / f"vorpruefung{tg}.json"
            dx = dy = 0
            if js.exists():
                a = json.loads(js.read_text())["ausgleich"]
                dx, dy = a["dx_px"], a["dy_px"]
            o = (m.height - BILD) // 2
            teile.append(m.crop((o + dx, o + dy, o + dx + BILD, o + dy + BILD)))
        reihen.append(teile)
    bogen = Image.new("RGB", (3 * T, len(reihen) * (T + 26) + 34), (18, 18, 18))
    dr = ImageDraw.Draw(bogen)
    fnt = _font(18)
    dr.text((8, 8), f"{sid}: Street View (nur intern) | Modell vorher | Modell nachher", fill=(255, 255, 255), font=fnt)
    for r, (an, teile) in enumerate(zip(ansichten_namen, reihen)):
        y = 34 + r * (T + 26)
        dr.text((8, y + 2), an, fill=(255, 255, 0), font=fnt)
        for c, im in enumerate(teile):
            bogen.paste(im.resize((T, T)), (c * T, y + 24))
    out.parent.mkdir(parents=True, exist_ok=True)
    bogen.save(out, quality=88)
    return out
