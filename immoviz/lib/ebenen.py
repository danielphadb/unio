"""Render-Ebenen und Schutzmaske (Element Preservation).

Zweck: Bei der KI-Veredelung duerfen sich Gebaeude und Planelemente (Fenster, Rahmen, Gelaender, Leuchten,
Strassenmoebel, standardmaessig auch Autos) nicht veraendern. Blender liefert dafuer zusaetzlich zum Bild
pixelgenaue Ebenen; `lib/kompositing.py` setzt die geschuetzten Bereiche nach der Veredelung aus dem Render zurueck.

Ablauf beim Rendern (`immoviz.py render ... --ebenen`, Code in `build.render`):
1. `vorbereiten(scene)`: Passes Tiefe, Normalen, Objekt- und Material-Index einschalten, jedem Objekt und jedem
   Material einen eindeutigen Pass-Index geben und fuer jedes Paar (Objekt, Material) die Klasse bestimmen
   (Tabelle REGELN unten, Namensmuster auf Objekt, Material und Collection).
2. Nach jedem Bild `schreiben(...)`: Render Result als mehrteilige EXR (unkomprimiert, 32 Bit) in eine
   temporaere Datei, mit dem eigenen Leser `exr_lesen` (nur numpy) laden, daraus PNGs erzeugen, EXR loeschen.

Ausgabe je Kamera und Licht in `renders/<unterordner>/<kamera>_<licht>_ebenen/`:
    <klasse>.png      Maske je Klasse (8 Bit, 0/255, harte Kante aus dem Index-Pass)
    klassen.png       Uebersicht, eine Farbe je Klasse (FARBEN)
    tiefe.png         Tiefe 16 Bit, logarithmisch: v = ln(d/TIEFE_MIN) / ln(TIEFE_MAX/TIEFE_MIN), Himmel = 65535
    normalen.png      Normalen in Weltkoordinaten (= Projektsystem), RGB = (n + 1) / 2, 8 Bit, Himmel schwarz
    kanten.png        Kanten aus Tiefen- und Normalenspruengen (8 Bit, weiss = Kante)
    schutz.png        Schutzmaske = Vereinigung der geschuetzten Klassen, weiche Kante (Standard 2 px), 8 Bit
    ebenen.json       Klassen mit Bildanteil, Schutzklassen, Kodierung, Fassadennormalen, nicht zugeordnete Paare

Klassentabelle: Die erste passende Regel gilt. Neue Assets (lib/assets.py, Strassenleuchten, Baenke, Menschen-
Platzhalter) werden ueber ihre Objekt- oder Collection-Namen erkannt; was keine Regel trifft, steht in
`ebenen.json` unter `nicht_zugeordnet` (mit Bildanteil) und wird dann hier ergaenzt.
"""
from __future__ import annotations

import json
import math
import os
import re
import struct
import tempfile
from pathlib import Path

import numpy as np

# ------------------------------------------------------------------ Klassen
KLASSEN = ["gebaeude_objekt", "fenster_glas", "fenster_rahmen", "gelaender", "leuchten", "strassenmoebel", "autos",
           "baeume", "menschen_platzhalter", "nachbarn", "boden", "himmel", "sonstige"]
SCHUTZ_STANDARD = ["gebaeude_objekt", "fenster_glas", "fenster_rahmen", "gelaender", "leuchten", "strassenmoebel",
                   "autos"]
FARBEN = {"gebaeude_objekt": (230, 190, 120), "fenster_glas": (40, 120, 230), "fenster_rahmen": (250, 250, 250),
          "gelaender": (230, 40, 200), "leuchten": (255, 230, 0), "strassenmoebel": (255, 120, 0),
          "autos": (220, 30, 30), "baeume": (40, 170, 60), "menschen_platzhalter": (0, 230, 230),
          "nachbarn": (150, 140, 130), "boden": (80, 80, 80), "himmel": (170, 210, 250), "sonstige": (120, 0, 120)}

# Bereich: "objekt" = Objekt in der Collection "Objekt" (Held, auch Neubau-Gruppen) oder Name hero_*/nb_*,
#          "umgebung" = alles andere, None = beides. Muster: Python-Regex, Gross-/Kleinschreibung egal.
# Je Regel genuegt EIN passendes Muster (objekt ODER material ODER collection); "nur_material" verlangt das Material.
REGELN = [
    {"klasse": "menschen_platzhalter", "objekt": r"mensch|person|figur|passant|people|human|silhouette",
     "collection": r"mensch|person|figur|passant|people"},
    {"klasse": "baeume", "objekt": r"baum|baeume|krone|stamm|tree|hecke|strauch|straeucher|busch|vegetation|"
                                    r"pflanze|bepflanzung|efeu|ranke",
     "material": r"^laub|^stamm|blatt|leaf|bark|rinde|hecke", "collection": r"baum|tree|vegetation|pflanz"},
    {"klasse": "autos", "objekt": r"^autos?(\b|_|\.)|fahrzeug|pkw|\bcars?\b|vehicle|moped|motorrad",
     "material": r"^auto|^reifen|felge", "collection": r"^autos?$|fahrzeug|vehicle"},
    {"klasse": "leuchten", "objekt": r"leuchte|laterne|lampe|kandelaber|beleuchtung|lamp|lantern|streetlight|"
                                     r"lichtmast",
     "material": r"^leuchte|^seil$|laterne|lampe|lichtmast", "collection": r"leuchte|laterne|lampe|beleuchtung"},
    {"klasse": "strassenmoebel", "objekt": r"sitzbank|parkbank|\bbank\b|bank_|poller|ampel|schild|verkehrszeichen|"
                                           r"fahrradbuegel|radbuegel|radstaender|fahrradstaender|muell|abfall|"
                                           r"hydrant|stadtmoebel|strassenmoebel|kiosk|haltestelle|bench|bollard|"
                                           r"litfass|pflanzkuebel|fahrrad|bike",
     "collection": r"moebel|mobiliar|furniture|poller|bank"},
    {"klasse": "gelaender", "bereich": "objekt", "objekt": r"gelaender|railing|handlauf|bruestung",
     "material": r"gelaender|railing|handlauf|bruestung"},
    {"klasse": "fenster_glas", "bereich": "objekt", "objekt": r"_glas|glass|verglasung|_innen",
     "material": r"glas|glass|^innen"},
    {"klasse": "fenster_rahmen", "bereich": "objekt", "objekt": r"rahmen|fenster|frame|window|tuer|door|haustor",
     "material": r"^fenster|rahmen|haustor|tuer|door|frame|fensterbank"},
    {"klasse": "gebaeude_objekt", "bereich": "objekt", "objekt": r"."},
    {"klasse": "boden", "objekt": r"boden|strasse|gehsteig|gelaende|terrain|ground|platz|fahrbahn",
     "material": r"^asphalt|gehsteig|pflaster|randstein|zebra|parkstreifen|rasen|gras|^hof$|schotter"},
    {"klasse": "nachbarn", "bereich": "umgebung",
     "objekt": r"nachbar|gebaeude|daecher|dach|fern|haus|building|block|umgebung_fenster",
     "material": r"nachbar|^nb_|dach|fassade|kamin|glas|fenster|rahmen|stuck|brandwand|balkon|fern_|tor$"},
]

TIEFE_MIN, TIEFE_MAX = 0.1, 30000.0      # m, logarithmische Kodierung (16 Bit: rund 0,02 % der Entfernung je Stufe)
KANTE_TIEFE = 0.03                        # relativer Tiefensprung zwischen Nachbarpixeln (3 %) = Kante
KANTE_NORMALE_GRAD = 25.0                 # Winkel zwischen Nachbarnormalen = Kante
KANTE_WEICH_PX = 2.0


def _passt(muster, text) -> bool:
    return bool(muster) and text is not None and re.search(muster, text, re.IGNORECASE) is not None


def klasse_fuer(objekt: str, material: str | None, collections: list[str], ist_objekt: bool) -> str:
    """Klasse fuer ein Paar (Objekt, Material). Erste passende Regel gilt; sonst 'sonstige'."""
    for r in REGELN:
        b = r.get("bereich")
        if b == "objekt" and not ist_objekt or b == "umgebung" and ist_objekt:
            continue
        if r.get("nur_material") and not _passt(r.get("material"), material):
            continue
        if (_passt(r.get("objekt"), objekt) or _passt(r.get("material"), material)
                or any(_passt(r.get("collection"), c) for c in collections)):
            return r["klasse"]
    return "sonstige"


def schutz_klassen(cfg: dict | None) -> list[str]:
    """Geschuetzte Klassen aus project.yaml `schutz:` (Liste oder {klassen: [...], plus: [...], minus: [...]})."""
    s = (cfg or {}).get("schutz")
    if not s:
        return list(SCHUTZ_STANDARD)
    if isinstance(s, list):
        k = list(s)
    else:
        k = list(s.get("klassen") or SCHUTZ_STANDARD)
        k += [x for x in (s.get("plus") or []) if x not in k]
        k = [x for x in k if x not in (s.get("minus") or [])]
    falsch = [x for x in k if x not in KLASSEN]
    if falsch:
        raise ValueError(f"schutz: unbekannte Klasse(n) {falsch}, erlaubt: {KLASSEN}")
    return k


def schutz_kante(cfg: dict | None) -> float:
    s = (cfg or {}).get("schutz")
    return float(s.get("kante_px", KANTE_WEICH_PX)) if isinstance(s, dict) else KANTE_WEICH_PX


# ------------------------------------------------------------------ Blender-Teil
def vorbereiten(scene) -> dict:
    """Passes einschalten, Pass-Indizes vergeben, Klassentabelle je (Objekt, Material) aufbauen."""
    import bpy
    vl = scene.view_layers[0]
    vl.use_pass_z = True
    vl.use_pass_normal = True
    vl.use_pass_object_index = True
    vl.use_pass_material_index = True
    # Eltern-Collections (fuer Muster auf verschachtelte Asset-Collections)
    eltern = {}
    for c in bpy.data.collections:
        for k in c.children:
            eltern.setdefault(k.name, []).append(c.name)

    def kette(name, tiefe=0):
        out = [name]
        if tiefe < 8:
            for e in eltern.get(name, []):
                out += kette(e, tiefe + 1)
        return out

    mats = sorted(bpy.data.materials, key=lambda m: m.name)
    for i, m in enumerate(mats, start=1):
        m.pass_index = i
    obs = sorted(bpy.data.objects, key=lambda o: o.name)
    tabelle = {}          # "ob,ma" -> klasse
    namen_ob, namen_ma = {}, {m.pass_index: m.name for m in mats}
    instanz_klasse = {}   # Collection-Instanzen: Klasse des Platzhalter-Empties auf die Quellobjekte uebertragen
    for ob in obs:
        if ob.instance_type == "COLLECTION" and ob.instance_collection is not None:
            ks = klasse_fuer(ob.name, None, kette(ob.instance_collection.name), False)
            for o2 in ob.instance_collection.all_objects:
                instanz_klasse.setdefault(o2.name, ks)
    for i, ob in enumerate(obs, start=1):
        ob.pass_index = i
        namen_ob[i] = ob.name
        colls = []
        for c in ob.users_collection:
            colls += kette(c.name)
        ist_objekt = any(c == "Objekt" for c in colls) or bool(re.match(r"^(hero|nb)_", ob.name))
        slots = [s.material for s in getattr(ob, "material_slots", []) if s.material] or [None]
        for m in slots + [None]:
            k = klasse_fuer(ob.name, m.name if m else None, colls, ist_objekt)
            if k == "sonstige" and ob.name in instanz_klasse:
                k = instanz_klasse[ob.name]
            tabelle[f"{i},{m.pass_index if m else 0}"] = k
    return {"tabelle": tabelle, "objekte": namen_ob, "materialien": namen_ma}


def schreiben(scene, meta: dict, ordner: Path, cfg: dict | None = None, kamera: str = "", licht: str = "",
              beauty: str | None = None) -> dict:
    """Nach bpy.ops.render.render: Passes aus dem Render Result lesen und die Ebenen schreiben."""
    import time
    import bpy
    t0 = time.time()
    ordner = Path(ordner)
    ordner.mkdir(parents=True, exist_ok=True)
    im = scene.render.image_settings
    alt = (im.media_type, im.file_format, im.color_depth, im.exr_codec)
    fd, tmp = tempfile.mkstemp(suffix=".exr", dir=str(ordner))
    os.close(fd)
    try:
        im.media_type = "MULTI_LAYER_IMAGE"
        im.file_format = "OPEN_EXR_MULTILAYER"
        im.color_depth = "32"
        im.exr_codec = "NONE"
        bpy.data.images["Render Result"].save_render(tmp, scene=scene)
        kan = exr_lesen(tmp)
    finally:
        im.media_type, im.file_format = alt[0], alt[1]
        im.color_depth = alt[2]
        try:
            im.exr_codec = alt[3]
        except TypeError:
            pass
        if not os.environ.get("IMMOVIZ_EBENEN_EXR"):
            Path(tmp).unlink(missing_ok=True)
    info = {"kamera": kamera, "licht": licht, "beauty": beauty,
            "fassaden": _fassaden(cfg), "kamera_pos": list(scene.camera.location) if scene.camera else None}
    res = auswerten(kan, meta, ordner, schutz_klassen(cfg), info, schutz_kante(cfg))
    res["sekunden"] = round(time.time() - t0, 1)
    return res


def _fassaden(cfg) -> dict:
    """Fassadennormalen (waagrecht, Projektsystem) aus project.yaml `facades`, fuer die Fensterzahl je Fassade."""
    out = {}
    for n, f in ((cfg or {}).get("facades") or {}).items():
        try:
            (ax, ay), (bx, by) = f["a"], f["b"]
        except (KeyError, TypeError, ValueError):
            continue
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy) or 1.0
        out[n] = {"normale": [round(dy / L, 4), round(-dx / L, 4)], "a": [ax, ay], "b": [bx, by]}
    return out


# ------------------------------------------------------------------ EXR lesen (unkomprimiert, ein- oder mehrteilig)
def exr_lesen(pfad) -> dict[str, np.ndarray]:
    """Liest eine unkomprimierte OpenEXR-Datei (Scanlines, HALF/FLOAT/UINT), auch mehrteilig (EXR 2.0) wie Blenders
    Multilayer. Rueckgabe: {kanalname: Array (H, W) float32}, oberste Zeile zuerst. Kanalname mit Teilname, z. B.
    'ViewLayer.Depth.Z'."""
    b = np.memmap(pfad, dtype=np.uint8, mode="r")
    if bytes(b[:4]) != b"\x76\x2f\x31\x01":
        raise ValueError(f"{pfad}: keine EXR-Datei")
    ver = int(struct.unpack("<I", bytes(b[4:8]))[0])
    mehrteilig = bool(ver & 0x1000)
    if ver & 0x200:
        raise ValueError("gekachelte EXR nicht unterstuetzt")
    i = 8
    raw = bytes(b[: min(len(b), 1 << 20)])   # Header steht am Anfang

    def cstr(j):
        e = raw.index(b"\0", j)
        return raw[j:e].decode("latin-1"), e + 1
    teile = []
    while True:
        if raw[i] == 0:
            i += 1
            break
        attr = {}
        while raw[i] != 0:
            n, i = cstr(i)
            t, i = cstr(i)
            sz = struct.unpack("<i", raw[i:i + 4])[0]
            i += 4
            attr[n] = (t, raw[i:i + sz])
            i += sz
        i += 1
        teile.append(attr)
        if not mehrteilig:
            break
    out = {}
    for attr in teile:
        if attr["compression"][1][0] != 0:
            raise ValueError("nur unkomprimierte EXR (exr_codec NONE)")
        x0, y0, x1, y1 = struct.unpack("<4i", attr["dataWindow"][1])
        W, H = x1 - x0 + 1, y1 - y0 + 1
        kan, j, cl = [], 0, attr["channels"][1]
        while cl[j] != 0:
            e = cl.index(b"\0", j)
            name = cl[j:e].decode("latin-1")
            typ = struct.unpack("<i", cl[e + 1:e + 5])[0]
            kan.append((name, {0: np.uint32, 1: np.float16, 2: np.float32}[typ]))
            j = e + 1 + 16
        n_chunks = H if not mehrteilig else struct.unpack("<i", attr["chunkCount"][1])[0]
        offs = np.frombuffer(bytes(b[i:i + 8 * n_chunks]), dtype="<u8")
        i += 8 * n_chunks
        teil = attr.get("name", ("", b""))[1].decode("latin-1")
        teil = teil + "." if teil and not all(n.startswith(teil + ".") for n, _ in kan) else ""
        zeile_bytes = sum(np.dtype(t).itemsize for _, t in kan) * W
        kopf = 12 if mehrteilig else 8
        daten = {n: np.empty((H, W), np.float32) for n, _ in kan}
        for o in offs:
            o = int(o)
            y = struct.unpack("<i", bytes(b[o + kopf - 8:o + kopf - 4]))[0] - y0
            zeile = b[o + kopf:o + kopf + zeile_bytes]
            p = 0
            for n, t in kan:
                nb = np.dtype(t).itemsize * W
                daten[n][y] = np.frombuffer(zeile[p:p + nb], dtype=np.dtype(t).newbyteorder("<"))
                p += nb
        for n, a in daten.items():
            out[teil + n] = a
    del b
    return out


def _kanal(kan: dict, pass_name: str, achsen: str):
    """Kanaele eines Passes ('Depth', 'Normal', 'Object Index' ...) unabhaengig vom View-Layer-Namen."""
    res = []
    for a in achsen:
        treffer = [k for k in kan if k.endswith(f".{pass_name}.{a}") or k == f"{pass_name}.{a}"]
        if not treffer:
            return None
        res.append(kan[treffer[0]])
    return res[0] if len(res) == 1 else np.stack(res, -1)


# ------------------------------------------------------------------ Auswertung (nur numpy, ohne Blender testbar)
def auswerten(kan: dict, meta: dict, ordner: Path, schutz: list[str], info: dict | None = None,
              kante_px: float = KANTE_WEICH_PX) -> dict:
    from PIL import Image
    from scipy import ndimage as ndi
    ordner = Path(ordner)
    tiefe = _kanal(kan, "Depth", "Z")
    normal = _kanal(kan, "Normal", "XYZ")
    ob = _kanal(kan, "Object Index", "X")
    ma = _kanal(kan, "Material Index", "X")
    if any(x is None for x in (tiefe, normal, ob, ma)):
        raise RuntimeError(f"Passes fehlen in der EXR, vorhanden: {sorted(kan)[:20]}")
    H, W = tiefe.shape
    ob_i = np.rint(ob).astype(np.int64)
    ma_i = np.rint(ma).astype(np.int64)
    # Klassen-Lookup (Objekt-Index x Material-Index)
    nob = max([int(k.split(",")[0]) for k in meta["tabelle"]] + [int(ob_i.max())]) + 1
    nma = max([int(k.split(",")[1]) for k in meta["tabelle"]] + [int(ma_i.max())]) + 1
    kid = {k: i for i, k in enumerate(KLASSEN)}
    lut = np.full((nob, nma), kid["sonstige"], np.int16)
    nur_ob = {}
    for key, k in meta["tabelle"].items():
        o, m = (int(v) for v in key.split(","))
        lut[o, m] = kid[k]
        if m == 0:
            nur_ob[o] = kid[k]
    for o, k in nur_ob.items():          # Material ohne Eintrag (z. B. per Modifikator ergaenzt): Klasse des Objekts
        zeile = lut[o]
        bekannt = {int(key.split(",")[1]) for key in meta["tabelle"] if int(key.split(",")[0]) == o}
        for m in range(nma):
            if m not in bekannt:
                zeile[m] = k
    lut[0, :] = kid["himmel"]
    klasse = lut[np.clip(ob_i, 0, nob - 1), np.clip(ma_i, 0, nma - 1)]
    himmel = (ob_i <= 0) | (tiefe > 1e9)
    klasse[himmel] = kid["himmel"]

    anteile, dateien = {}, {}
    farbe = np.zeros((H, W, 3), np.uint8)
    for k, i in kid.items():
        m = klasse == i
        anteile[k] = round(100.0 * float(m.mean()), 3)
        farbe[m] = FARBEN[k]
        Image.fromarray((m * 255).astype(np.uint8)).save(ordner / f"{k}.png")
        dateien[k] = f"{k}.png"
    Image.fromarray(farbe).save(ordner / "klassen.png")

    # Tiefe 16 Bit logarithmisch
    d = np.where(himmel, TIEFE_MAX, np.clip(tiefe, TIEFE_MIN, TIEFE_MAX))
    v = np.log(d / TIEFE_MIN) / math.log(TIEFE_MAX / TIEFE_MIN)
    t16 = np.rint(np.clip(v, 0, 1) * 65535).astype(np.uint16)
    _png16(t16, ordner / "tiefe.png")
    # Normalen
    n = np.where(himmel[..., None], 0.0, normal)
    nrgb = np.where(himmel[..., None], 0, np.rint((np.clip(n, -1, 1) + 1) * 127.5)).astype(np.uint8)
    Image.fromarray(nrgb).save(ordner / "normalen.png")
    # Kanten aus Tiefen- und Normalenspruengen
    kanten = kanten_aus_geometrie(np.log(d), n, himmel)
    Image.fromarray((kanten * 255).astype(np.uint8)).save(ordner / "kanten.png")
    # Schutzmaske mit weicher Kante
    hart = np.isin(klasse, [kid[k] for k in schutz])
    weich = weiche_kante(hart, kante_px)
    Image.fromarray(np.rint(weich * 255).astype(np.uint8)).save(ordner / "schutz.png")

    # nicht zugeordnete Paare mit Bildanteil (fuer die Klassentabelle)
    rest = []
    so = klasse == kid["sonstige"]
    if so.any():
        paare, zahl = np.unique(ob_i[so] * 100000 + ma_i[so], return_counts=True)
        for p, z in sorted(zip(paare, zahl), key=lambda x: -x[1])[:30]:
            o, m = int(p // 100000), int(p % 100000)
            rest.append({"objekt": meta["objekte"].get(o) or meta["objekte"].get(str(o)),
                         "material": meta["materialien"].get(m) or meta["materialien"].get(str(m)),
                         "anteil_prozent": round(100.0 * z / (H * W), 3)})
    res = {"version": 1, "groesse": [W, H], **(info or {}), "klassen": KLASSEN, "anteile_prozent": anteile,
           "schutz_klassen": schutz, "schutz_anteil_prozent": round(100.0 * float(hart.mean()), 2),
           "schutz_kante_px": kante_px, "dateien": {**dateien, "klassen": "klassen.png", "tiefe": "tiefe.png",
                                                    "normalen": "normalen.png", "kanten": "kanten.png",
                                                    "schutz": "schutz.png"},
           "tiefe": {"kodierung": "log", "min_m": TIEFE_MIN, "max_m": TIEFE_MAX,
                     "formel": "d = min_m * (max_m/min_m) ** (v/65535)", "himmel": 65535},
           "normalen": {"raum": "Welt (Projektsystem, x Stolberggasse usw.)", "formel": "n = rgb/127.5 - 1",
                        "himmel": [0, 0, 0]},
           "kanten": {"tiefe_relativ": KANTE_TIEFE, "normale_grad": KANTE_NORMALE_GRAD},
           "nicht_zugeordnet": rest}
    (ordner / "ebenen.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    res["ordner"] = str(ordner)
    return res


def _png16(a: np.ndarray, pfad: Path) -> None:
    try:
        import cv2
        cv2.imwrite(str(pfad), a)
    except ImportError:
        from PIL import Image
        Image.fromarray(a.astype(np.uint16), mode="I;16").save(pfad)


def kanten_aus_geometrie(logd: np.ndarray, n: np.ndarray, himmel: np.ndarray) -> np.ndarray:
    """Kante, wo die Tiefe zwischen Nachbarpixeln springt (zweite Differenz des Logarithmus ueber KANTE_TIEFE, damit
    schraeg gesehene Ebenen wie die Fahrbahn keine Kante geben) oder die Normale um mehr als KANTE_NORMALE_GRAD dreht;
    dazu der Rand zum Himmel. Innerhalb des Himmels keine Kanten."""
    kante = np.zeros(logd.shape, bool)
    cos_g = math.cos(math.radians(KANTE_NORMALE_GRAD))
    lim = math.log(1 + KANTE_TIEFE)
    for ax in (0, 1):
        d1 = np.diff(logd, axis=ax)
        d2 = np.abs(np.diff(d1, axis=ax))                       # Laenge n-2, zentriert auf Pixel 1..n-2
        sprung = np.zeros(d1.shape, bool)                       # Sprung zwischen Pixel i und i+1
        if ax == 0:
            sprung[1:] |= d2 > lim
            sprung[:-1] |= d2 > lim
            sprung &= np.abs(d1) > lim
            nn = (n[1:] * n[:-1]).sum(-1)
            hh = np.diff(himmel.astype(np.int8), axis=0) != 0
            beide_himmel = himmel[1:] & himmel[:-1]
        else:
            sprung[:, 1:] |= d2 > lim
            sprung[:, :-1] |= d2 > lim
            sprung &= np.abs(d1) > lim
            nn = (n[:, 1:] * n[:, :-1]).sum(-1)
            hh = np.diff(himmel.astype(np.int8), axis=1) != 0
            beide_himmel = himmel[:, 1:] & himmel[:, :-1]
        k = ((sprung | (nn < cos_g)) & ~beide_himmel) | hh
        if ax == 0:
            kante[1:] |= k
        else:
            kante[:, 1:] |= k
    return kante


def weiche_kante(hart: np.ndarray, breite: float = KANTE_WEICH_PX) -> np.ndarray:
    """Maske 0..1 mit linearem Uebergang der Breite `breite` px, mittig auf der Maskenkante."""
    from scipy import ndimage as ndi
    if breite <= 0:
        return hart.astype(np.float32)
    innen = ndi.distance_transform_edt(hart)
    aussen = ndi.distance_transform_edt(~hart)
    sd = np.where(hart, innen - 0.5, -(aussen - 0.5))       # Pixelmitte: erstes Pixel innen +0,5, aussen -0,5
    return np.clip(0.5 + sd / breite, 0.0, 1.0).astype(np.float32)


# ------------------------------------------------------------------ Laden (Kompositing, Nachkontrolle)
def laden(ordner) -> dict:
    """Ebenen-Ordner laden: {'meta', 'masken': {klasse: bool HxW}, 'schutz': float HxW, 'tiefe_m', 'normalen',
    'kanten'}."""
    from PIL import Image
    ordner = Path(ordner)
    meta = json.loads((ordner / "ebenen.json").read_text())
    masken = {}
    for k in meta["klassen"]:
        p = ordner / f"{k}.png"
        if p.exists():
            masken[k] = np.asarray(Image.open(p).convert("L")) > 127
    out = {"meta": meta, "masken": masken, "ordner": ordner,
           "schutz": np.asarray(Image.open(ordner / "schutz.png").convert("L"), dtype=np.float32) / 255.0}
    p = ordner / "normalen.png"
    if p.exists():
        out["normalen"] = np.asarray(Image.open(p).convert("RGB"), dtype=np.float32) / 127.5 - 1.0
    p = ordner / "kanten.png"
    if p.exists():
        out["kanten"] = np.asarray(Image.open(p).convert("L")) > 127
    p = ordner / "tiefe.png"
    if p.exists():
        try:
            import cv2
            t = cv2.imread(str(p), cv2.IMREAD_UNCHANGED).astype(np.float64)
        except ImportError:
            t = np.asarray(Image.open(p), dtype=np.float64)
        tm = meta["tiefe"]
        out["tiefe_m"] = tm["min_m"] * (tm["max_m"] / tm["min_m"]) ** (t / 65535.0)
    return out
