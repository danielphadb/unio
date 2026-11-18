"""Realistische Automodelle (BlenderKit/BlendKit, kostenlos) als einheitliche Bibliothek fuer die Stellplaetze.

Ablauf:
1. `immoviz.py autos-laden`: laedt die Modelle aus `autos_bibliothek.yaml` ueber die oeffentliche BlenderKit-API
   (kostenlose Modelle brauchen kein Konto) nach immoviz/assets/autos/<id8>_<name>/modell.blend, je Modell
   `quelle.json` (Name, Autor, Lizenz, Quelle, Prueffsumme). Variante mit 2K-Texturen, wenn vorhanden.
2. `immoviz.py autos-bibliothek`: oeffnet jedes Modell ohne Skriptausfuehrung (Treiber und eingebettete Skripte bleiben
   aus) und baut immoviz/assets/autos/bibliothek.blend: je Modell eine Collection `auto_<id8>`, Front +X, Ursprung
   Mitte am Boden, auf die Herstellerlaenge skaliert; nur sichtbare Geometrie (keine Rigs, Bodenplatten, Kameras,
   Lichter, Texte); Logos, Embleme, Schriftzuege entfernt; Kennzeichen weiss ohne Schrift; Lack durch das gemeinsame
   Material `auto_lack` ersetzt (Klarlack, Farbe je Auto aus der Farbverteilung, ueber Object Info Random je Instanz).
   Alle Objekte heissen `auto_<id8>_<n>`, damit die Render-Ebenen sie der Klasse autos zuordnen.
3. `build` setzt die Modelle als Collection-Instanzen auf die Stellplaetze (lib/strasse.py), gewichtet nach `gewicht`,
   laengs nur Modelle, die in den Stellplatz passen. Fehlt die Bibliothek, gibt es die parametrischen Autos
   (lib/assets/autos.py).
"""
from __future__ import annotations

import hashlib
import json
import math
import re
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ORDNER = Path(__file__).resolve().parents[2] / "assets" / "autos"
BIB = ORDNER / "bibliothek.blend"
TABELLE = Path(__file__).with_name("autos_bibliothek.yaml")
API = "https://www.blenderkit.com/api/v1/search/"

LOGO = re.compile(r"logo|badge|emblem|brand|lettering|schriftzug|pngimg|aston text|^text|retopo_text|loho|lgo|"
                  r"sticker|cilindri logos", re.I)
KENNZEICHEN = re.compile(r"plate|kennzeichen|registration", re.I)
LACK = re.compile(r"car ?paint|carpaint|^body(\b|$|[ ._0-9])|^shell$|metallic car paint|^ferrari dodici cilindri$", re.I)
NICHT_LACK = re.compile(r"carbon|plastic|dark body|underbody|glass|chrome", re.I)
VORNE = re.compile(r"head ?l|headlight|frontl|front|grill|gril|drl|scheinwerfer|bumper front|frontbumper|radiator", re.I)
HINTEN = re.compile(r"tail|rear|back|heck|exhaust|exhuast|auspuff|tailpipe|trunk|spoiler|diffuser", re.I)
WEG_TYP = {"ARMATURE", "LATTICE", "CAMERA", "LIGHT", "LIGHT_PROBE", "SPEAKER", "FONT", "EMPTY", "GPENCIL",
           "GREASEPENCIL"}
BODEN = re.compile(r"ground|floor|backdrop|shadow|boden|studio|^wgt-", re.I)
SUBSURF_MAX = 1           # Unterteilungsstufen beim Rendern (je Stufe vierfache Flaechen; Modelle bringen 2 bis 3 mit,
                          # das waeren ueber 100 Mio. Flaechen); je Modell ueber `subsurf` in der Tabelle erhoehbar
# Lackfarben (linear, Gewicht): wie die parametrischen Autos, grau, schwarz, weiss und silber ueberwiegen
FARBEN = [((0.012, 0.012, 0.013), 16), ((0.040, 0.042, 0.046), 14), ((0.12, 0.125, 0.13), 12), ((0.36, 0.37, 0.38), 12),
          ((0.68, 0.68, 0.67), 18), ((0.012, 0.022, 0.055), 7), ((0.055, 0.075, 0.095), 6), ((0.015, 0.035, 0.022), 4),
          ((0.075, 0.012, 0.016), 5), ((0.30, 0.26, 0.19), 3), ((0.20, 0.035, 0.02), 3)]


def tabelle() -> list[dict]:
    import yaml
    return yaml.safe_load(TABELLE.read_text(encoding="utf-8"))["modelle"]


def _slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")[:40]


def modell_ordner(e: dict) -> Path:
    return ORDNER / f"{e['id'][:8]}_{_slug(e['name'])}"


def vorhanden() -> bool:
    return BIB.is_file()


# ------------------------------------------------------------------ Laden
def _get(u: str):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "immoviz"}), timeout=60))


def laden(nur: list[str] | None = None) -> list[dict]:
    """Laedt fehlende Modelle aus der Tabelle (kostenlose Modelle, ohne Konto). Bestehende Dateien bleiben."""
    log = []
    for e in tabelle():
        if nur and not any(e["id"].startswith(n) for n in nur):
            continue
        d = modell_ordner(e)
        ziel = d / "modell.blend"
        if ziel.exists():
            log.append({"modell": e["name"], "status": "vorhanden"})
            continue
        res = _get(API + "?" + urllib.parse.urlencode({"query": f"asset_base_id:{e['id']}"})).get("results") or []
        if not res:
            log.append({"modell": e["name"], "status": "nicht gefunden"})
            continue
        r = res[0]
        if not r.get("isFree"):
            log.append({"modell": e["name"], "status": "kostenpflichtig, nicht geladen"})
            continue
        files = {f["fileType"]: f for f in r.get("files", [])}
        ft = "resolution_2K" if "resolution_2K" in files else "blend"
        url = _get(files[ft]["downloadUrl"] + "?scene_uuid=" + str(uuid.uuid4()))["filePath"]
        d.mkdir(parents=True, exist_ok=True)
        tmp = ziel.with_suffix(".teil")
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "immoviz"}), timeout=900) as rs, \
                open(tmp, "wb") as out:
            while True:
                b = rs.read(1 << 20)
                if not b:
                    break
                out.write(b)
        tmp.rename(ziel)
        meta = {"name": r["name"], "asset_base_id": r.get("assetBaseId"), "id": r.get("id"),
                "autor": (r.get("author") or {}).get("fullName"), "lizenz": r.get("license"),
                "quelle": f"https://www.blendkit.com/asset-gallery-detail/{r.get('assetBaseId')}/",
                "datei": ziel.name, "dateityp": ft, "sha256": hashlib.sha256(ziel.read_bytes()).hexdigest(),
                "bytes": ziel.stat().st_size, "flaechen": (r.get("dictParameters") or {}).get("faceCount")}
        (d / "quelle.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
        log.append({"modell": e["name"], "status": "geladen", "mb": round(ziel.stat().st_size / 1e6)})
    return log


# ------------------------------------------------------------------ Bibliothek bauen (in Blender)
def _material_lack(bpy):
    m = bpy.data.materials.get("auto_lack") or bpy.data.materials.new("auto_lack")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
    # Lackfarbe = Objektfarbe des Instanz-Objekts (ein Wert je Auto, gesetzt in `build`); ohne Instanz die eigene
    attr = nt.nodes.new("ShaderNodeAttribute")
    attr.attribute_type = "INSTANCER"
    attr.attribute_name = "color"
    nt.links.new(attr.outputs["Color"], bs.inputs["Base Color"])
    bs.inputs["Metallic"].default_value = 0.35
    bs.inputs["Roughness"].default_value = 0.32
    for name, wert in (("Coat Weight", 1.0), ("Coat Roughness", 0.03), ("Coat IOR", 1.5)):
        if name in bs.inputs:
            bs.inputs[name].default_value = wert
    nt.links.new(bs.outputs[0], out.inputs[0])
    return m


def _material_einfach(bpy, name, farbe, rauh):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*farbe, 1.0)
    bs.inputs["Roughness"].default_value = rauh
    return m


def _welt_bbox(obs):
    from mathutils import Vector
    lo, hi = Vector((1e9,) * 3), Vector((-1e9,) * 3)
    for o in obs:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    return lo, hi


def _punkte(bpy, obs, max_n=300000):
    """Weltpunkte der ausgewerteten Geometrie (mit Modifikatoren), ausgeduennt."""
    import numpy as np
    dg = bpy.context.evaluated_depsgraph_get()
    alle = []
    for o in obs:
        oe = o.evaluated_get(dg)
        try:
            me = oe.to_mesh()
        except RuntimeError:
            continue
        if me is None or not len(me.vertices):
            oe.to_mesh_clear()
            continue
        v = np.empty(len(me.vertices) * 3, np.float64)
        me.vertices.foreach_get("co", v)
        oe.to_mesh_clear()
        v = v.reshape(-1, 3)
        M = np.array(o.matrix_world)
        alle.append(v @ M[:3, :3].T + M[:3, 3])
    if not alle:
        return None
    P = np.concatenate(alle)
    if len(P) > max_n:
        P = P[np.random.default_rng(0).choice(len(P), max_n, replace=False)]
    return P


def _robuste_box(bpy, obs):
    """Box aus Quantilen der Punkte: einzelne Fremdteile (Platten, Schattenfaenger, Rig-Reste) zaehlen nicht."""
    import numpy as np
    from mathutils import Vector
    P = _punkte(bpy, obs)
    if P is None:
        return _welt_bbox(obs)
    lo = np.quantile(P, 0.001, axis=0)
    hi = np.quantile(P, 0.999, axis=0)
    return Vector(lo), Vector(hi)


NICHT_LACK_FLAECHE = re.compile(r"glas|glass|window|wind|tyre|tire|rubber|reifen|rim|wheel|felge|chrome|interior|"
                                r"seat|leather|black|schwarz|light|lamp|led|mirror|metal|grill|gril|brake|disk|disc|"
                                r"plate|carbon|plastic|kunststoff|emiss|caliper|clipper|underbody|dark", re.I)


def _lack_aus_flaeche(bpy, obs):
    """Material mit der groessten Aussenflaeche, das nicht nach Glas, Reifen, Chrom usw. klingt (wenn kein Name passt)."""
    flaeche = {}
    for o in obs:
        if o.type != "MESH" or not o.material_slots:
            continue
        sk = o.matrix_world.to_scale()
        f = abs(sk.x * sk.y * sk.z) ** (2.0 / 3.0)
        for poly in o.data.polygons:
            if poly.material_index < len(o.material_slots):
                m = o.material_slots[poly.material_index].material
                if m is not None:
                    flaeche[m.name] = flaeche.get(m.name, 0.0) + poly.area * f
    if not flaeche:
        return None
    gesamt = sum(flaeche.values())
    kand = sorted(((a, n) for n, a in flaeche.items() if not NICHT_LACK_FLAECHE.search(n)), reverse=True)
    if kand and kand[0][0] > 0.2 * gesamt:
        return kand[0][1]
    return None


def _modell_aufbereiten(bpy, e: dict, mats: dict, ziel_coll, log: list):
    from mathutils import Matrix, Vector
    f = modell_ordner(e) / "modell.blend"
    if not f.exists():
        log.append({"modell": e["name"], "status": "fehlt, erst autos-laden"})
        return
    kurz = e["id"][:8]
    with bpy.data.libraries.load(str(f), link=False) as (src, dst):
        dst.objects = list(src.objects)
        dst.collections = list(src.collections)
        quell_mat = list(src.materials)
        dst.materials = list(src.materials)
    # Originalnamen der Materialien (beim Anhaengen werden gleichnamige umbenannt, z. B. Material.002 -> .002.001)
    orig_name = {m.name: n for n, m in zip(quell_mat, dst.materials) if m is not None}
    obs = [o for o in dst.objects if o is not None]
    quell_colls = [c for c in dst.collections if c is not None]
    versteckt_coll = set()
    for c in quell_colls:                   # Objekte in versteckten Collections der Quelldatei bleiben versteckt
        if c.hide_render:
            versteckt_coll |= {o.name for o in c.all_objects}
    tmp = bpy.data.collections.new(f"tmp_{kurz}")
    bpy.context.scene.collection.children.link(tmp)
    for o in obs:
        tmp.objects.link(o)
    for c in quell_colls:
        for o in list(c.objects):
            c.objects.unlink(o)
        bpy.data.collections.remove(c)
    bpy.context.view_layer.update()
    weg_namen = {n.lower() for n in (e.get("weg") or [])}
    behalten, entfernt = [], {"typ": 0, "versteckt": 0, "logo": 0, "boden": 0, "ausreisser": 0}
    for o in obs:
        if o.type in WEG_TYP or o.type not in ("MESH", "CURVE", "SURFACE", "META"):
            entfernt["typ"] += 1
            continue
        if o.hide_render or o.name in versteckt_coll:
            entfernt["versteckt"] += 1
            continue
        if LOGO.search(o.name) or o.name.lower() in weg_namen:
            entfernt["logo"] += 1
            continue
        if BODEN.search(o.name):
            entfernt["boden"] += 1
            continue
        behalten.append(o)
    # flache grosse Platten am Boden (Studioboden, Schattenfaenger)
    plat = []
    for o in behalten:
        lo, hi = _welt_bbox([o])
        d = hi - lo
        if o.type == "MESH" and d.z < 0.02 and d.x * d.y > 6.0:
            plat.append(o)
    behalten = [o for o in behalten if o not in plat]
    entfernt["boden"] += len(plat)
    # Ausreisser (weit weg vom Mittel der uebrigen Teile)
    if behalten:
        mitten = [(lambda lh: (lh[0] + lh[1]) / 2)(_welt_bbox([o])) for o in behalten]
        xs, ys, zs = (sorted(m[i] for m in mitten) for i in range(3))
        med = Vector((xs[len(xs) // 2], ys[len(ys) // 2], zs[len(zs) // 2]))
        neu = []
        for o, m in zip(behalten, mitten):
            if (m - med).length > 4.0:
                entfernt["ausreisser"] += 1
            else:
                neu.append(o)
        behalten = neu
    if not behalten:
        log.append({"modell": e["name"], "status": "keine Geometrie"})
        return
    # Hilfsobjekte, auf die Modifikatoren verweisen (Boolean-Schnitte, Spiegelachsen): mitnehmen, unsichtbar
    hilfs = []
    for o in behalten:
        for mod in getattr(o, "modifiers", []):
            refs = [getattr(mod, a, None) for a in ("object", "mirror_object", "offset_object", "start_cap", "end_cap")]
            if mod.type == "BOOLEAN" and getattr(mod, "operand_type", "") == "COLLECTION" and mod.collection:
                refs += list(mod.collection.all_objects)
            for r in refs:
                if r is not None and r not in behalten and r not in hilfs and r.name in tmp.objects:
                    hilfs.append(r)
    # Weltmatrix einfrieren, Eltern loesen, Animation und Rig-Modifikatoren entfernen
    for o in behalten + hilfs:
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
        o.animation_data_clear()
        for mod in list(getattr(o, "modifiers", [])):
            if mod.type in ("ARMATURE", "LATTICE", "HOOK", "CURVE", "SHRINKWRAP", "SURFACE_DEFORM", "MESH_DEFORM"):
                o.modifiers.remove(mod)
    bpy.context.view_layer.update()
    # Materialien: Lack, Kennzeichen, Logos
    lack_namen = {n.lower() for n in (e.get("lack") or [])}
    on = lambda m: orig_name.get(m.name, m.name).strip()       # noqa: E731
    namen_treffer = any(LACK.search(on(s.material)) and not NICHT_LACK.search(on(s.material))
                        for o in behalten for s in getattr(o, "material_slots", []) if s.material)
    if not lack_namen and not namen_treffer:
        g = _lack_aus_flaeche(bpy, behalten)
        if g:
            lack_namen = {g.lower().strip()}
    n_lack = n_kz = n_logo = 0
    for o in behalten:
        kz_obj = bool(KENNZEICHEN.search(o.name))
        for s in getattr(o, "material_slots", []):
            m = s.material
            if m is None:
                continue
            nm = on(m)
            if kz_obj or KENNZEICHEN.search(nm):
                s.material = mats["kennzeichen"]
                n_kz += 1
            elif LOGO.search(nm) or nm.lower() in weg_namen:
                s.material = mats["kunststoff"]
                n_logo += 1
            elif nm.lower() in lack_namen or (not lack_namen and LACK.search(nm) and not NICHT_LACK.search(nm)):
                s.material = mats["lack"]
                n_lack += 1
    # Geparkt: alle Leuchtmaterialien aus (Schein- und Rueckleuchten glimmen sonst wie eingeschaltet)
    n_licht = 0
    for m in {sl.material for o in behalten for sl in getattr(o, "material_slots", []) if sl.material}:
        if not m.node_tree or m in mats.values():
            continue
        for nd in m.node_tree.nodes:
            sock = None
            if nd.type == "BSDF_PRINCIPLED":
                sock = nd.inputs.get("Emission Strength")
            elif nd.type == "EMISSION":
                sock = nd.inputs.get("Strength")
            if sock is not None and (sock.is_linked or sock.default_value > 0):
                for ln in list(sock.links):
                    m.node_tree.links.remove(ln)
                sock.default_value = 0.0
                n_licht += 1
    # Unterteilung begrenzen (Speicher)
    smax = int(e.get("subsurf", SUBSURF_MAX))
    for o in behalten:
        for mod in getattr(o, "modifiers", []):
            if mod.type == "SUBSURF":
                mod.render_levels = min(mod.render_levels, smax)
                mod.levels = min(mod.levels, smax)
    # Lage: laengste waagrechte Achse, Front ueber Lichter/Grill gegen Heck/Auspuff
    lo, hi = _robuste_box(bpy, behalten)
    d = hi - lo
    achse = 0 if d.x >= d.y else 1
    mitte = (lo + hi) / 2

    def schwer(rx):
        ws = [((lambda lh: (lh[0] + lh[1]) / 2)(_welt_bbox([o])))[achse] for o in behalten if rx.search(o.name)
              or any(s.material and rx.search(s.material.name) for s in getattr(o, "material_slots", []))]
        return sum(ws) / len(ws) if ws else None

    vorne = e.get("vorne")
    if vorne:
        achse = 0 if "x" in vorne else 1
        vz = -1.0 if vorne.startswith("-") else 1.0
        quelle_vorne = "Tabelle"
    else:
        sv, sh = schwer(VORNE), schwer(HINTEN)
        if sv is not None and sh is not None and abs(sv - sh) > 0.3:
            vz = 1.0 if sv > sh else -1.0
            quelle_vorne = "Namen"
        else:
            vz, quelle_vorne = 1.0, "unbekannt"
    laenge = d[achse]
    s = (e.get("laenge_m") or laenge) / laenge
    # Transformation: Mitte auf 0, Boden auf 0, Front nach +X, Skalierung
    winkel = {(0, 1.0): 0.0, (0, -1.0): math.pi, (1, 1.0): -math.pi / 2, (1, -1.0): math.pi / 2}[(achse, vz)]
    T = Matrix.Diagonal((s, s, s, 1.0)) @ Matrix.Rotation(winkel, 4, "Z") @ \
        Matrix.Translation(Vector((-mitte.x, -mitte.y, -lo.z)))
    coll = bpy.data.collections.new(f"auto_{kurz}")
    ziel_coll.children.link(coll)
    for k, o in enumerate(behalten + hilfs):
        o.matrix_world = T @ o.matrix_world
        o.name = f"auto_{kurz}_{k:03d}"
        coll.objects.link(o)
        tmp.objects.unlink(o)
        if o in hilfs:
            o.hide_render = True
            o.hide_viewport = True
    bpy.context.view_layer.update()
    lo2, hi2 = _robuste_box(bpy, behalten)
    g = hi2 - lo2
    coll["laenge"], coll["breite"], coll["hoehe"] = round(g.x, 3), round(g.y, 3), round(g.z, 3)
    coll["gewicht"] = float(e.get("gewicht", 1.0))
    coll["name"] = e["name"]
    coll["lizenz"] = e.get("lizenz", "")
    # Rest (Rigs, Logos, Boden) loeschen
    for o in list(tmp.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(tmp)
    log.append({"modell": e["name"], "collection": coll.name, "objekte": len(behalten), "hilfs": len(hilfs),
                "entfernt": entfernt,
                "lack_slots": n_lack, "kennzeichen_slots": n_kz, "logo_slots": n_logo, "vorne": quelle_vorne,
                "lack": sorted(lack_namen) if lack_namen else "Namensregel",
                "licht_aus": n_licht,
                "skalierung": round(s, 3), "masse_m": [round(g.x, 2), round(g.y, 2), round(g.z, 2)]})


def bibliothek_bauen(nur: list[str] | None = None) -> list[dict]:
    """Baut immoviz/assets/autos/bibliothek.blend aus den geladenen Modellen (Blender ohne Skriptausfuehrung)."""
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.use_scripts_auto_execute = False
    mats = {"lack": _material_lack(bpy),
            "kennzeichen": _material_einfach(bpy, "auto_kennzeichen", (0.80, 0.80, 0.78), 0.45),
            "kunststoff": _material_einfach(bpy, "auto_kunststoff_schwarz", (0.012, 0.012, 0.013), 0.35)}
    wurzel = bpy.data.collections.new("autos_bibliothek")
    bpy.context.scene.collection.children.link(wurzel)
    log = []
    for e in tabelle():
        if nur and not any(e["id"].startswith(n) for n in nur):
            continue
        try:
            _modell_aufbereiten(bpy, e, mats, wurzel, log)
        except Exception as ex:      # ein defektes Modell soll die Bibliothek nicht verhindern
            log.append({"modell": e["name"], "status": f"Fehler: {ex}"})
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BIB), compress=True)
    (ORDNER / "bibliothek.json").write_text(json.dumps(log, ensure_ascii=False, indent=1))
    return log


# ------------------------------------------------------------------ Einsetzen (build_scene)
def build(ctx, terrain, radius, cfg, coll) -> int:
    """Setzt die Bibliotheksmodelle als Collection-Instanzen auf die Stellplaetze. Liefert die Zahl der Autos.
    Eigener Zufall je Projekt: dieselben Autos an denselben Plaetzen in jedem Bild (Kamerafahrten)."""
    import random
    import bpy
    from .. import strasse as ST
    rng = random.Random("autos-" + str(((cfg or {}).get("project") or {}).get("slug", "")))
    namen = []
    with bpy.data.libraries.load(str(BIB), link=False) as (src, dst):
        dst.collections = [c for c in src.collections if c.startswith("auto_")]
    vorlagen = bpy.data.collections.new("autos_vorlagen")
    bpy.context.scene.collection.children.link(vorlagen)
    for c in dst.collections:
        if c is not None:
            vorlagen.children.link(c)
            namen.append(c)
    for lc in bpy.context.view_layer.layer_collection.children:
        if lc.collection == vorlagen:
            lc.exclude = True
    if not namen:
        return 0
    sub = bpy.data.collections.new("Autos")
    coll.children.link(sub)
    plaetze = [(ab, p) for s in ST.stellplaetze(ctx, cfg, radius) for ab in s["abschnitte"] for p in ab["plaetze"]]
    n = 0
    for ab, platz in plaetze:
        if rng.random() > ab["belegung"]:
            continue
        if platz["art"] == "laengs":
            passend = [c for c in namen if c["laenge"] <= platz["laenge"] - 0.25]
        else:                                   # Schraeg- und Senkrechtparker: 10 cm Luft zur Nachbarbucht
            passend = [c for c in namen if c["breite"] <= platz["breite"] - 0.10]
        passend = passend or sorted(namen, key=lambda c: c["breite"] if platz["art"] != "laengs" else c["laenge"])[:2]
        c = rng.choices(passend, [x["gewicht"] for x in passend])[0]
        dw = math.radians(rng.uniform(-1.0, 1.0))
        ax = platz["achse"]
        if platz["art"] != "laengs" and rng.random() < 0.25:        # manche parken rueckwaerts ein
            ax = (-ax[0], -ax[1])
        ax = (ax[0] * math.cos(dw) - ax[1] * math.sin(dw), ax[0] * math.sin(dw) + ax[1] * math.cos(dw))
        vor = rng.uniform(-0.12, 0.12)
        ox, oy = platz["pos"][0] + ax[0] * vor, platz["pos"][1] + ax[1] * vor
        ob = bpy.data.objects.new("autos", None)
        ob.instance_type = "COLLECTION"
        ob.instance_collection = c
        ob.color = (*rng.choices([f for f, _ in FARBEN], [w for _, w in FARBEN])[0], 1.0)
        ob.location = (ox, oy, terrain(ox, oy))
        ob.rotation_euler = (0, 0, math.atan2(ax[1], ax[0]))
        sub.objects.link(ob)
        n += 1
    return n
