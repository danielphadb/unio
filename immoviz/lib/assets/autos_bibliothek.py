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
import os
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


RAD = re.compile(r"tire|tyre|reifen|pneu|wheel|whell|rim|felge|rubber", re.I)


def _raeder(bpy, obs, groesse) -> list[float]:
    """Aufstandspunkte der vier Raeder (VL, VR, HL, HR; x, y, z im Modell, Front +X): je Viertel die tiefsten Punkte
    der Reifen- und Felgenobjekte; ohne erkannte Raeder die tiefsten Punkte des ganzen Modells je Viertel."""
    import numpy as np
    rad = [o for o in obs if (RAD.search(o.name) or any(sl.material and RAD.search(sl.material.name)
                                                          for sl in getattr(o, "material_slots", [])))
           and not re.search(r"steer|lenk", o.name, re.I)]
    out = []
    for quelle in (rad, obs):
        P = _punkte(bpy, quelle) if quelle else None
        if P is None:
            continue
        out = []
        for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
            q = P[(np.sign(P[:, 0]) == sx) & (np.sign(P[:, 1]) == sy) & (np.abs(P[:, 0]) > 0.2 * groesse.x)]
            if len(q) < 30:
                out = []
                break
            z = float(np.quantile(q[:, 2], 0.002))
            tief = q[q[:, 2] <= z + 0.01]
            out += [round(float(tief[:, 0].mean()), 3), round(float(tief[:, 1].mean()), 3), round(z, 4)]
        if out:
            return out
    L, W = groesse.x, groesse.y
    return [r for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)) for r in (sx * 0.3 * L, sy * 0.42 * W, 0.0)]


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
        lo_o, hi_o = _welt_bbox([o])
        dims = sorted(hi_o - lo_o)
        kz_gross = dims[2] < 0.8 and dims[1] < 0.35        # Kennzeichen: bis etwa 0,55 x 0,2 m (auch schraeg)
        kz_obj = bool(KENNZEICHEN.search(o.name)) and kz_gross
        for s in getattr(o, "material_slots", []):
            m = s.material
            if m is None:
                continue
            nm = on(m)
            if kz_obj or (KENNZEICHEN.search(nm) and kz_gross):
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
    coll["raeder"] = _raeder(bpy, behalten, g)
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
FREI: list[dict] = []      # freie Buchten des letzten Szenenaufbaus mit Grund (Belegung, Kante, Hindernis)
VERSCHUB = (0.0, -0.25, 0.25, -0.5, 0.5, -0.75, -1.0)   # m entlang der Fahrzeugachse (negativ = zurueck), falls ein
                                                       # Rad auf einer Kante liegt: Schraegparker halten mit den
                                                       # Raedern vor dem Bordstein, die Front ragt ueber den Gehsteig
RAD_REST = 0.03            # m: so weit darf ein Rad hoechstens schweben oder einsinken
NEIGUNG_QUER_MAX = 4.0     # Grad: steiler quer = zwei Raeder auf dem Bordstein, keine Strassenneigung
NEIGUNG_LAENGS_MAX = 6.0   # Grad laengs (Wiener Gassen bis rund 8 %, also 4,6 Grad)
BODEN_SUCHE = 1.2          # Strahl ab so weit ueber dem Gelaende nach unten (unter Baumkronen und Leuchten)
BODEN_TOLERANZ = 0.6       # Treffer weiter als das vom Gelaende entfernt zaehlen nicht (Stamm, Poller, Dach)


def _radpunkte(c) -> list[tuple[float, float, float]]:
    r = list(c.get("raeder") or [])
    if len(r) != 12:
        L, W = c["laenge"], c["breite"]
        r = [v for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)) for v in (sx * 0.3 * L, sy * 0.42 * W, 0.0)]
    return [tuple(r[i:i + 3]) for i in range(0, 12, 3)]


BODEN_OBJEKT = re.compile(r"boden|strasse|fahrbahn|gehsteig|platz|pflaster|parkstreifen|gelaende", re.I)
BODEN_UNTEN = 2.0          # m: Fahrbahn darf so weit unter dem groben Gelaendemodell liegen (Rampen, Gefaelle)


def boden_hoehe(scene, dg, x, y, z_gelaende):
    """Hoehe der Fahrbahn- bzw. Gehsteigflaeche unter (x, y) per Strahl von oben. Andere Objekte (Autos, Poller,
    Staemme, Schilder) werden durchstossen; die grobe Fernzone (`fernboden`) zaehlt nicht. Liefert (z, Objektname) oder
    (Gelaende, None), wenn keine Bodenflaeche zwischen BODEN_SUCHE ueber und BODEN_UNTEN unter dem Gelaende liegt."""
    from mathutils import Vector
    z = z_gelaende + BODEN_SUCHE
    unten = z_gelaende - BODEN_UNTEN
    for _ in range(12):
        ok, loc, _n, _i, ob, _m = scene.ray_cast(dg, Vector((x, y, z)), Vector((0, 0, -1)), distance=max(0.01, z - unten))
        if not ok:
            break
        if BODEN_OBJEKT.search(ob.name) and not ob.name.startswith("fernboden"):
            return loc.z, ob.name
        z = loc.z - 0.002              # Auto, Poller, Stamm, Schild: weiter nach unten
    return z_gelaende, None


def auf_boden_setzen(ob, c, terrain, scene, dg, yaw):
    """Auto auf die vier Aufstandspunkte setzen: Hoehe und Neigung (Laengs- und Querneigung) aus der Oberflaeche
    unter den Raedern, damit kein Rad schwebt und keines einsinkt (auch auf geneigten Gassen)."""
    rp = _radpunkte(c)
    cy, sy = math.cos(yaw), math.sin(yaw)
    x0, y0 = ob.location.x, ob.location.y
    h, treffer = [], []
    for (px, py, _pz) in rp:
        wx, wy = x0 + cy * px - sy * py, y0 + sy * px + cy * py
        z, name = boden_hoehe(scene, dg, wx, wy, terrain(wx, wy))
        h.append(z)
        treffer.append(name or "kein_boden")
    ob["boden_h"] = [round(v, 3) for v in h]
    ob["boden_obj"] = ",".join(treffer)
    (xf, yl), (xr, yr) = ((rp[0][0] + rp[1][0]) / 2, (rp[0][1] + rp[2][1]) / 2), \
        ((rp[2][0] + rp[3][0]) / 2, (rp[1][1] + rp[3][1]) / 2)
    hv, hh = (h[0] + h[1]) / 2, (h[2] + h[3]) / 2
    hl, hr = (h[0] + h[2]) / 2, (h[1] + h[3]) / 2
    nick = math.atan2(hv - hh, max(xf - xr, 0.5))          # Front hoeher: Nase hoch
    roll = math.atan2(hl - hr, max(yl - yr, 0.5))          # links hoeher
    ob.rotation_euler = (roll, -nick, yaw)
    # Hoehe: Mittel der Aufstandspunkte nach der Neigung
    from mathutils import Euler, Vector
    R = Euler(ob.rotation_euler, "XYZ").to_matrix()
    dz = [hi - (R @ Vector(p)).z for hi, p in zip(h, rp)]
    ob.location.z = sum(dz) / 4.0
    rest = max(abs(d - ob.location.z) for d in dz)     # Restfehler: wie weit ein Rad schwebt oder einsinkt
    if abs(roll) > math.radians(NEIGUNG_QUER_MAX) or abs(nick) > math.radians(NEIGUNG_LAENGS_MAX):
        rest = max(rest, 1.0)                           # Rad auf Bordstein oder Stufe: keine Strassenneigung
    if "kein_boden" in treffer:
        rest = max(rest, 1.0)                           # unter einem Rad keine Fahrbahn (Rand des Modells)
    return rest


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
    scene = bpy.context.scene
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()            # Strassen und Gehsteige stehen schon, Autos noch nicht
    n = frei = 0
    FREI.clear()
    for ab, platz in plaetze:
        if rng.random() > ab["belegung"]:
            FREI.append({"x": round(platz["pos"][0], 2), "y": round(platz["pos"][1], 2), "grund": "belegung"})
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
        yaw = math.atan2(ax[1], ax[0])
        if os.environ.get("IMMOVIZ_AUTOS_BODEN", "").lower() in ("aus", "0", "nein"):
            ob.rotation_euler = (0, 0, yaw)                # alte Platzierung (Gelaende am Mittelpunkt), nur Vergleich
        else:
            # in der Bucht bis 0,5 m verschieben, bis alle vier Raeder aufliegen; sonst Bucht frei lassen
            best = None
            for d in VERSCHUB:
                ob.location = (ox + ax[0] * d, oy + ax[1] * d, terrain(ox + ax[0] * d, oy + ax[1] * d))
                rest = auf_boden_setzen(ob, c, terrain, scene, dg, yaw)
                if best is None or rest < best[0]:
                    best = (rest, d)
                if rest <= RAD_REST:
                    break
            if best[0] > RAD_REST:
                FREI.append({"x": round(ox, 2), "y": round(oy, 2),
                             "grund": "kante" if best[0] >= 1.0 else "uneben", "auto": c.get("name")})
                bpy.data.objects.remove(ob)
                frei += 1
                continue
            if best[1] != d:
                ob.location = (ox + ax[0] * best[1], oy + ax[1] * best[1], 0.0)
                auf_boden_setzen(ob, c, terrain, scene, dg, yaw)
        ob["platz_art"], ob["platz_laenge"], ob["platz_breite"] = platz["art"], platz["laenge"], platz["breite"]
        sub.objects.link(ob)
        n += 1
    if frei:
        print(f"[immoviz] Autos: {n} gesetzt, {frei} Buchten frei gelassen (Untergrund zu uneben, Rad > "
              f"{RAD_REST * 100:.0f} cm)", flush=True)
    return n


# ------------------------------------------------------------------ Pruefung (immoviz.py autos-pruefen)
HINDERNIS = re.compile(r"poller|moebel|leuchte|laterne|mast|schild|zeichen|ampel|hydrant|bank|fahrrad|muell|stamm|"
                       r"baeume_holz|tree", re.I)
GRENZE_SCHWEBT = 0.03      # m: Rad hoeher als die Oberflaeche
GRENZE_SINKT = 0.03        # m: Rad tiefer als die Oberflaeche


def _ecken(ob, c, schrumpf=0.0):
    L, W = c["laenge"] / 2 - schrumpf, c["breite"] / 2 - schrumpf
    a = ob.rotation_euler.z
    ca, sa = math.cos(a), math.sin(a)
    x, y = ob.location.x, ob.location.y
    return [(x + ca * u - sa * v, y + sa * u + ca * v) for u, v in ((L, W), (L, -W), (-L, -W), (-L, W))]


def _ueberlappen(p, q) -> bool:
    for poly in (p, q):
        for i in range(len(poly)):
            x1, y1 = poly[i]
            x2, y2 = poly[(i + 1) % len(poly)]
            nx, ny = y2 - y1, x1 - x2
            a = [nx * x + ny * y for x, y in p]
            b = [nx * x + ny * y for x, y in q]
            if max(a) < min(b) or max(b) < min(a):
                return False
    return True


def _hindernis_punkte(scene, terrain=None):
    """Stehende Hindernisse als Punkte mit Radius: Poller, Maste, Schilder, Baumstaemme (Instanzen und Einzelobjekte;
    zusammengefasste Meshes werden in Inseln zerlegt)."""
    import numpy as np
    pts = []
    for ob in scene.objects:
        if not HINDERNIS.search(ob.name) or ob.name.startswith("auto"):
            continue
        if ob.instance_type == "COLLECTION" or ob.type == "EMPTY" or ob.name.startswith("baeume_holz"):
            pts.append((ob.location.x, ob.location.y, 0.35, ob.name))     # Stamm bzw. Instanz als Punkt
            continue
        if ob.type != "MESH" or not len(ob.data.vertices):
            continue
        v = np.empty(len(ob.data.vertices) * 3)
        ob.data.vertices.foreach_get("co", v)
        v = v.reshape(-1, 3)
        M = np.array(ob.matrix_world)
        w = v @ M[:3, :3].T + M[:3, 3]
        # Inseln im Grundriss (Raster 0,25 m): je Insel Mittelpunkt und Radius
        zellen = {}
        for (x, y), zz in zip(np.round(w[:, :2] / 0.25).astype(int), w[:, 2]):
            zellen[(x, y)] = min(zellen.get((x, y), 1e9), zz)
        gesehen = set()
        for z0 in zellen:
            if z0 in gesehen:
                continue
            stapel, insel = [z0], []
            gesehen.add(z0)
            while stapel:
                cx, cy = stapel.pop()
                insel.append((cx, cy))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nb = (cx + dx, cy + dy)
                        if nb in zellen and nb not in gesehen:
                            gesehen.add(nb)
                            stapel.append(nb)
            a = np.array(insel) * 0.25
            if len(insel) > 40:          # flaechig (Bankreihe, Kronen): nicht als Punkt
                continue
            mx, my = a.mean(0)
            zmin = min(zellen[k] for k in insel)
            if terrain is not None and zmin > terrain(float(mx), float(my)) + 1.6:
                continue                 # haengt ueber der Strasse (Seilleuchten, Schilder hoch oben)
            pts.append((float(mx), float(my), float(max(0.15, np.abs(a - (mx, my)).max() + 0.125)), ob.name))
    return pts


def pruefen(scene, terrain=None) -> dict:
    """Prueft alle Bibliotheksautos der Szene: Radaufstand gegen die Oberflaeche (Strahl je Rad), Bucht (Laenge und
    Breite), Ueberschneidung untereinander, Hindernisse in der Grundflaeche (Poller, Maste, Schilder, Staemme)."""
    import bpy
    terrain = terrain or (lambda x, y: 0.0)
    autos = [o for o in scene.objects if o.instance_type == "COLLECTION" and o.instance_collection is not None
             and o.instance_collection.name.startswith("auto_")]
    for o in autos:
        o.hide_viewport = True                       # Strahlen sollen die Oberflaeche treffen, nicht Autos
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    befunde, raeder_abw = [], []
    from mathutils import Vector
    for o in autos:
        c = o.instance_collection
        from mathutils import Euler, Matrix
        # aus Position und Drehung (die Weltmatrix versteckter Objekte wird von Blender nicht aktualisiert)
        M = Matrix.Translation(o.location) @ Euler(o.rotation_euler, "XYZ").to_matrix().to_4x4()
        abw = []
        kein_boden = False
        for p in _radpunkte(c):
            w = M @ Vector(p)
            zb, name = boden_hoehe(scene, dg, w.x, w.y, terrain(w.x, w.y))
            abw.append(round(w.z - zb, 3))
            if name is None:
                kein_boden = True
        raeder_abw += abw
        f = []
        if kein_boden:
            f.append("unter einem Rad keine Fahrbahn (Rand des Modells)")
        if max(abw) > GRENZE_SCHWEBT:
            f.append(f"schwebt bis {max(abw) * 100:.0f} cm")
        if min(abw) < -GRENZE_SINKT:
            f.append(f"sinkt bis {-min(abw) * 100:.0f} cm ein")
        if abs(o.rotation_euler.x) > math.radians(NEIGUNG_QUER_MAX) or \
                abs(o.rotation_euler.y) > math.radians(NEIGUNG_LAENGS_MAX):
            f.append(f"zu schief ({math.degrees(o.rotation_euler.x):.1f} Grad quer, "
                     f"{math.degrees(-o.rotation_euler.y):.1f} Grad laengs), steht auf Kante")
        art = o.get("platz_art")
        if art == "laengs" and c["laenge"] > o.get("platz_laenge", 99) - 0.1:
            f.append(f"zu lang fuer die Bucht ({c['laenge']:.2f} m, Bucht {o['platz_laenge']:.2f} m)")
        if art in ("schraeg", "senkrecht") and c["breite"] > o.get("platz_breite", 99):
            f.append(f"zu breit fuer die Bucht ({c['breite']:.2f} m, Bucht {o['platz_breite']:.2f} m)")
        if f:
            befunde.append({"auto": c.get("name"), "pos": [round(o.location.x, 2), round(o.location.y, 2)],
                            "befund": f, "raeder_cm": [round(a * 100, 1) for a in abw]})
    for o in autos:
        o.hide_viewport = False
    # Ueberschneidungen
    ecken = [_ecken(o, o.instance_collection, 0.02) for o in autos]
    n_ueber = 0
    for i in range(len(autos)):
        for j in range(i + 1, len(autos)):
            if (autos[i].location - autos[j].location).length < 7 and _ueberlappen(ecken[i], ecken[j]):
                n_ueber += 1
                befunde.append({"auto": autos[i].instance_collection.get("name"),
                                "pos": [round(autos[i].location.x, 2), round(autos[i].location.y, 2)],
                                "befund": [f"ueberschneidet {autos[j].instance_collection.get('name')}"]})
    # Hindernisse
    hind = _hindernis_punkte(scene, terrain)
    n_hind = 0
    for o, e in zip(autos, ecken):
        for hx, hy, r, name in hind:
            if (o.location.x - hx) ** 2 + (o.location.y - hy) ** 2 > 36:
                continue
            kreis = [(hx + r * math.cos(k * math.pi / 4), hy + r * math.sin(k * math.pi / 4)) for k in range(8)]
            if _ueberlappen(e, kreis):
                n_hind += 1
                befunde.append({"auto": o.instance_collection.get("name"),
                                "pos": [round(o.location.x, 2), round(o.location.y, 2)],
                                "befund": [f"steht in Hindernis {name} ({hx:.1f}/{hy:.1f})"]})
    # Massstab je Modell (Pkw: Laenge 3,5 bis 5,4 m, Breite mit Spiegeln 1,6 bis 2,3 m, Hoehe 1,1 bis 2,0 m,
    # Radstand 2,3 bis 3,3 m, Spur 1,35 bis 1,85 m)
    massstab = []
    for c in {o.instance_collection for o in autos}:
        rp = _radpunkte(c)
        radstand = (rp[0][0] + rp[1][0]) / 2 - (rp[2][0] + rp[3][0]) / 2
        spur = (rp[0][1] + rp[2][1]) / 2 - (rp[1][1] + rp[3][1]) / 2
        werte = {"laenge": (c["laenge"], 3.5, 5.4), "breite": (c["breite"], 1.6, 2.3), "hoehe": (c["hoehe"], 1.1, 2.0),
                 "radstand": (radstand, 2.3, 3.3), "spur": (spur, 1.35, 1.85)}
        falsch = [f"{k} {v:.2f} m (erwartet {lo}-{hi})" for k, (v, lo, hi) in werte.items() if not lo <= v <= hi]
        massstab.append({"modell": c.get("name"), **{k: round(v, 2) for k, (v, _l, _h) in werte.items()}})
        if falsch:
            befunde.append({"auto": c.get("name"), "pos": [0, 0], "befund": ["Massstab: " + "; ".join(falsch)]})
    lage = [{"modell": o.instance_collection.get("name"), "x": round(o.location.x, 3), "y": round(o.location.y, 3),
             "z": round(o.location.z, 3), "richtung_grad": round(math.degrees(o.rotation_euler.z), 2),
             "quer_grad": round(math.degrees(o.rotation_euler.x), 2), "laengs_grad": round(-math.degrees(o.rotation_euler.y), 2),
             "laenge": o.instance_collection["laenge"], "breite": o.instance_collection["breite"],
             "bucht": o.get("platz_art")} for o in autos]
    import numpy as np
    a = np.array(raeder_abw) if raeder_abw else np.zeros(1)
    return {"autos": len(autos), "befunde_anzahl": len(befunde),
            "raeder": {"mittel_cm": round(float(a.mean()) * 100, 1), "max_schwebt_cm": round(float(a.max()) * 100, 1),
                       "max_sinkt_cm": round(float(-a.min()) * 100, 1),
                       "ueber_grenze": int(((a > GRENZE_SCHWEBT) | (a < -GRENZE_SINKT)).sum())},
            "ueberschneidungen": n_ueber, "hindernisse": n_hind, "hindernis_punkte": len(hind),
            "grenzen_cm": {"schwebt": GRENZE_SCHWEBT * 100, "sinkt": GRENZE_SINKT * 100},
            "massstab": sorted(massstab, key=lambda m: m["modell"] or ""), "lage": lage, "frei": list(FREI),
            "frei_gruende": {g: sum(1 for f in FREI if f["grund"] == g) for g in ("belegung", "kante", "uneben", "hindernis")},
            "befunde": befunde}


def aufraeumen(scene, terrain) -> dict:
    """Nachlauf am Ende von build_scene (Strassenmoebel und Baeume stehen jetzt): jedes Bibliotheksauto neu auf die
    Oberflaeche setzen; steht es in einem Hindernis (Poller, Schild, Stamm) oder liegt ein Rad mehr als RAD_REST
    daneben, in der Bucht um VERSCHUB verschieben (ohne ein anderes Auto zu beruehren); sonst Bucht frei lassen."""
    import bpy
    autos = [o for o in scene.objects if o.instance_type == "COLLECTION" and o.instance_collection is not None
             and o.instance_collection.name.startswith("auto_")]
    if not autos:
        return {}
    for o in autos:
        o.hide_viewport = True
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    hind = _hindernis_punkte(scene, terrain)
    raster = {}
    for h in hind:
        raster.setdefault((int(h[0] // 4), int(h[1] // 4)), []).append(h)
    nachbarn = {}
    for o in autos:
        nachbarn.setdefault((int(o.location.x // 8), int(o.location.y // 8)), []).append(o)

    def kreise(x, y):
        out = []
        for i in (-1, 0, 1):
            for j in (-1, 0, 1):
                for hx, hy, r, _n in raster.get((int(x // 4) + i, int(y // 4) + j), []):
                    out.append([(hx + r * math.cos(k * math.pi / 4), hy + r * math.sin(k * math.pi / 4)) for k in range(8)])
        return out

    def andere(o):
        x, y = o.location.x, o.location.y
        return [q for i in (-1, 0, 1) for j in (-1, 0, 1) for q in nachbarn.get((int(x // 8) + i, int(y // 8) + j), [])
                if q is not o and q.name in scene.objects]

    verschoben = entfernt = 0
    weg = []
    for o in autos:
        c = o.instance_collection
        yaw = o.rotation_euler.z
        ax = (math.cos(yaw), math.sin(yaw))
        x0, y0 = o.location.x, o.location.y
        best = None
        for d in VERSCHUB:
            o.location = (x0 + ax[0] * d, y0 + ax[1] * d, 0.0)
            rest = auf_boden_setzen(o, c, terrain, scene, dg, yaw)
            e = _ecken(o, c, 0.02)
            stoss = any(_ueberlappen(e, k) for k in kreise(o.location.x, o.location.y)) or \
                any(_ueberlappen(e, _ecken(q, q.instance_collection, 0.02)) for q in andere(o))
            wert = (stoss, rest > RAD_REST, rest)
            if best is None or wert < best[0]:
                best = (wert, d)
            if not stoss and rest <= RAD_REST:
                break
        (stoss, schief, _r), d = best
        if stoss or schief:
            FREI.append({"x": round(x0, 2), "y": round(y0, 2), "grund": "hindernis" if stoss else
                         ("kante" if _r >= 1.0 else "uneben"), "auto": c.get("name")})
            weg.append(o)
            continue
        if d != 0.0:
            verschoben += 1
        o.location = (x0 + ax[0] * d, y0 + ax[1] * d, 0.0)
        auf_boden_setzen(o, c, terrain, scene, dg, yaw)
    for o in weg:
        bpy.data.objects.remove(o)
        entfernt += 1
    for o in scene.objects:
        if o.instance_type == "COLLECTION" and o.instance_collection is not None \
                and o.instance_collection.name.startswith("auto_"):
            o.hide_viewport = False
    print(f"[immoviz] Autos nachgesetzt: {len(autos) - entfernt} stehen, {verschoben} in der Bucht verschoben, "
          f"{entfernt} entfernt (Hindernis oder Untergrund)", flush=True)
    return {"autos": len(autos) - entfernt, "verschoben": verschoben, "entfernt": entfernt}


def bericht_schreiben(project_dir, res) -> dict:
    """renders/check/autos_pruefung.md und .json, dazu autos_lage.json (fuer das Strassen-Pruefbild)."""
    import json
    from pathlib import Path
    project_dir = Path(project_dir)
    ziel = project_dir / "renders" / "check"
    ziel.mkdir(parents=True, exist_ok=True)
    (ziel / "autos_lage.json").write_text(json.dumps({"autos": res.get("lage", []), "frei": res.get("frei", [])},
                                                     ensure_ascii=False))
    (ziel / "autos_pruefung.json").write_text(json.dumps({k: v for k, v in res.items() if k not in ("lage", "frei")},
                                                         ensure_ascii=False, indent=1))
    r = res["raeder"]
    zeilen = [f"# Autos pruefen: {project_dir.name}", "",
              f"{res['autos']} Autos, {res['befunde_anzahl']} Befunde. Radaufstand gegen die Oberflaeche (je Rad ein "
              f"Strahl von oben): Mittel {r['mittel_cm']} cm, hoechstens {r['max_schwebt_cm']} cm schwebend, "
              f"{r['max_sinkt_cm']} cm eingesunken, {r['ueber_grenze']} Raeder ausserhalb +-{res['grenzen_cm']['schwebt']:.0f} cm. "
              f"Ueberschneidungen {res['ueberschneidungen']}, in Hindernissen {res['hindernisse']} "
              f"({res['hindernis_punkte']} Hindernisse erkannt). Lage der Autos im Strassen-Pruefbild (`immoviz.py strasse`), "
              f"Nahaufnahmen je Kamera in `<kamera>_<licht>_autos_bogen.jpg` neben dem Render.", ""]
    zeilen += [f"- {b['auto']} bei {b['pos'][0]}/{b['pos'][1]}: {'; '.join(b['befund'])}" for b in res["befunde"][:200]]
    fg = res.get("frei_gruende") or {}
    zeilen += ["", f"Freie Buchten: {sum(fg.values())} (Zufallsbelegung {fg.get('belegung', 0)}, Rad auf Kante "
               f"{fg.get('kante', 0)}, Untergrund uneben {fg.get('uneben', 0)}, Hindernis {fg.get('hindernis', 0)}); "
               f"im Strassen-Pruefbild als Kreuz."]
    zeilen += ["", "## Massstab je Modell", "", "| Modell | Laenge | Breite | Hoehe | Radstand | Spur |", "|---|---|---|---|---|---|"]
    zeilen += [f"| {m['modell']} | {m['laenge']} | {m['breite']} | {m['hoehe']} | {m['radstand']} | {m['spur']} |"
               for m in res.get("massstab", [])]
    (ziel / "autos_pruefung.md").write_text("\n".join(zeilen) + "\n")
    return {"md": str(ziel / "autos_pruefung.md"), "json": str(ziel / "autos_pruefung.json")}


def vor_render(scene, terrain, project_dir) -> dict | None:
    """Pflichtpruefung vor jedem Render mit Bibliotheksautos: Bericht schreiben, bei Befund abbrechen (bevor Minuten
    Renderzeit verloren gehen). Abschalten nur zum Testen: IMMOVIZ_AUTOS_PRUEFUNG=aus."""
    import bpy
    if not any(c.name.startswith("auto_") for c in bpy.data.collections):
        return None
    res = pruefen(scene, terrain)
    bericht_schreiben(project_dir, res)
    print(f"[immoviz] Autopruefung: {res['autos']} Autos, {res['befunde_anzahl']} Befunde", flush=True)
    if res["befunde_anzahl"] and os.environ.get("IMMOVIZ_AUTOS_PRUEFUNG", "").lower() not in ("aus", "0", "nein"):
        zeilen = [f"{b['auto']} bei {b['pos'][0]}/{b['pos'][1]}: {'; '.join(b['befund'])}" for b in res["befunde"][:8]]
        raise SystemExit("Autopruefung nicht bestanden, Render abgebrochen (renders/check/autos_pruefung.md):\n  "
                         + "\n  ".join(zeilen))
    return res


def kamera_bogen(scene, bild, ziel, max_abstand=70.0, anzahl=24) -> str | None:
    """Pruefbogen je Kamera: Nahaufnahmen der sichtbaren Bibliotheksautos aus dem fertigen Bild (Raeder und Boden),
    Aufstandspunkte als kurze Marken darunter. Zum schnellen Durchsehen statt das ganze Bild abzusuchen."""
    from pathlib import Path
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Euler, Matrix, Vector
    from PIL import Image, ImageDraw
    cam = scene.camera
    if cam is None or not Path(bild).exists():
        return None
    import bpy
    im = Image.open(bild).convert("RGB")
    W, H = im.size
    kpos = cam.matrix_world.translation.copy()
    dg = bpy.context.evaluated_depsgraph_get()
    kacheln = []
    for o in scene.objects:
        if o.instance_type != "COLLECTION" or o.instance_collection is None \
                or not o.instance_collection.name.startswith("auto_"):
            continue
        dist = (o.location - kpos).length
        if dist > max_abstand:
            continue
        c = o.instance_collection
        M = Matrix.Translation(o.location) @ Euler(o.rotation_euler, "XYZ").to_matrix().to_4x4()
        pts = []
        for p in _radpunkte(c) + [(0.0, 0.0, c["hoehe"])]:
            v = world_to_camera_view(scene, cam, M @ Vector(p))
            if v.z <= 0:
                pts = []
                break
            pts.append((v.x * W, (1 - v.y) * H))
        if not pts:
            continue
        rad, dach = pts[:4], pts[4]
        if not all(0 <= x < W and 0 <= y < H for x, y in rad):
            continue
        # sichtbar: Strahl Kamera -> Rad trifft zuerst dieses Auto (Grundriss) oder den Boden daneben
        sichtbar = 0
        e = _ecken(o, c, -0.15)
        for p in _radpunkte(c):
            w = M @ Vector((p[0], p[1], p[2] + 0.12))
            r = w - kpos
            ok, loc, _n, _i, _ob, _m = scene.ray_cast(dg, kpos, r.normalized(), distance=r.length + 0.5)
            if not ok or (loc - kpos).length >= r.length - 0.6 or _ueberlappen(e, [(loc.x - 0.01, loc.y - 0.01),
                                                                                (loc.x + 0.01, loc.y - 0.01),
                                                                                (loc.x + 0.01, loc.y + 0.01)]):
                sichtbar += 1
        if sichtbar < 2:
            continue
        x0, x1 = min(x for x, _ in rad), max(x for x, _ in rad)
        y0, y1 = min(dach[1], min(y for _, y in rad)), max(y for _, y in rad)
        rx = max(40.0, 0.25 * (x1 - x0))
        box = (int(max(0, x0 - rx)), int(max(0, y0 - 0.15 * (y1 - y0))), int(min(W, x1 + rx)), int(min(H, y1 + 0.35 * (y1 - y0) + 12)))
        if box[2] - box[0] < 80 or box[3] - box[1] < 40:
            continue
        k = im.crop(box)
        d = ImageDraw.Draw(k)
        for x, y in rad:
            xx, yy = x - box[0], y - box[1]
            d.line([(xx - 7, yy + 10), (xx + 7, yy + 10)], fill=(0, 230, 255), width=2)
        kacheln.append((box[2] - box[0], k, f"{c.get('name', '')[:26]}  {dist:.0f} m"))
    if not kacheln:
        return None
    kacheln = sorted(kacheln, key=lambda t: -t[0])[:anzahl]
    th, sp = 300, 4
    kl = []
    for _w, k, t in kacheln:
        f = th / k.height
        kl.append((k.resize((max(1, int(k.width * f)), th)), t))
    zeilen, zeile, breite = [], [], 0
    for k, t in kl:
        if zeile and breite + k.width > 2400:
            zeilen.append(zeile)
            zeile, breite = [], 0
        zeile.append((k, t))
        breite += k.width + sp
    zeilen.append(zeile)
    B = max(sum(k.width + sp for k, _ in z) for z in zeilen)
    out = Image.new("RGB", (B, len(zeilen) * (th + 26) + 40), (245, 245, 243))
    d = ImageDraw.Draw(out)
    d.text((8, 10), f"Autos im Bild: Raeder und Boden (Marken unter den Aufstandspunkten), {Path(bild).name}",
           fill=(20, 20, 20))
    y = 40
    for z in zeilen:
        x = 0
        for k, t in z:
            out.paste(k, (x, y + 22))
            d.text((x + 4, y + 4), t, fill=(30, 30, 30))
            x += k.width + sp
        y += th + 26
    out.save(ziel, quality=88)
    return str(ziel)
