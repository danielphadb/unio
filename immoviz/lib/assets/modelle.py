"""Echte 3D-Moebel und -Pflanzen (Poly Haven CC0, BlenderKit Royalty Free) fuer Innenraeume und Terrassen.

Anlass: Noma Runde 9 (Kritik 21.11.2026). Kugelformen fuer Pflanzen und Quader fuer Moebel musste die Bild-KI
"uebersetzen"; dabei erfand sie einen viel zu grossen Wohnraum und Artefakte. Ab Runde 10 stehen echte Modelle in
Planlage und Planmass im Render, die KI verfeinert nur noch Licht, Himmel, Pflanzendetails und Stoffe.

Ablauf (wie die Autos, lib/assets/autos_bibliothek.py):
1. `immoviz.py modelle-laden`: laedt die Modelle aus `modelle_bibliothek.yaml` nach immoviz/assets/modelle/<key>/
   (gitignored), je Modell `quelle.json` (Name, Autor, Lizenz, Quelle, Pruefsumme). Poly Haven ueber die oeffentliche
   API (Blend-Datei plus Texturen, 1k oder 2k), BlenderKit ueber die oeffentliche API (nur kostenlose Modelle, ohne
   Konto). Dateien nie ins Repo (Lizenz verbietet die Weitergabe der Modelldateien, Repo ist oeffentlich).
2. Beim Szenenaufbau: `vorlage` laedt ein Modell einmal (ohne Skripte), backt alle Transformationen in die Netze,
   entfernt Boden-, Kamera- und Lichtobjekte, dreht die Front nach -Y (Feld `vorne`) und setzt den Ursprung unten in
   die Mitte. `platzieren` setzt verknuepfte Kopien (gemeinsame Netze) auf eine Planbox: Lage, Drehung und Mass aus
   dem Plan, Skalierung einheitlich (Moebel) oder frei (Pflanzen, Tische), optional an die Wand angelegt.
3. Objektnamen `<praefix>__<klasse>__<key>_<n>`: lib/ebenen.py liest die Klasse direkt aus dem Namen (innenraum,
   stoffe, ausstattung, vegetation), lib/planbeleg.py die Gruppe vor `__` und die Eigenschaft `quelle`.

Fehlt eine Modelldatei, bricht der Aufbau ab (kein stiller Rueckfall auf Kugeln). Nur fuer Proben ohne Bibliothek:
`IMMOVIZ_BIBLIOTHEK=platzhalter` setzt graue Quader mit `platzhalter=True` (Planbeleg meldet sie als Fehler).
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

ORDNER = Path(__file__).resolve().parents[2] / "assets" / "modelle"
TABELLE = Path(__file__).with_name("modelle_bibliothek.yaml")
BK_API = "https://www.blenderkit.com/api/v1/search/"
PH_API = "https://api.polyhaven.com/files/"
UA = {"User-Agent": "immoviz"}

WEG = re.compile(r"ground|floor|backdrop|shadow|boden|studio|catcher|^wgt-|^bg[_ .]|hdri|_path_[lr]$", re.I)
STOFF = re.compile(r"fabric|cloth|textile|stoff|velvet|samt|boucl|linen|leinen|cushion|kissen|polster|upholster|"
                   r"seat|pillow|felt|wool|sofa|couch|rug|carpet|teppich", re.I)
_VORLAGEN: dict[str, list] = {}


class BibliothekFehlt(RuntimeError):
    pass


def tabelle() -> dict[str, dict]:
    import yaml
    return yaml.safe_load(TABELLE.read_text(encoding="utf-8"))["modelle"]


def datei(key: str) -> Path:
    return ORDNER / key / "modell.blend"


# ------------------------------------------------------------------ Laden (ohne Blender)
def _get(u: str):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))


def _download(url: str, ziel: Path):
    ziel.parent.mkdir(parents=True, exist_ok=True)
    tmp = ziel.with_suffix(ziel.suffix + ".teil")
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=900) as rs, open(tmp, "wb") as out:
        while True:
            b = rs.read(1 << 20)
            if not b:
                break
            out.write(b)
    tmp.rename(ziel)


def laden(nur: list[str] | None = None) -> list[dict]:
    """Laedt fehlende Modelle. Bestehende Dateien bleiben."""
    log = []
    for key, e in tabelle().items():
        if nur and key not in nur:
            continue
        ziel = datei(key)
        if ziel.exists():
            log.append({"modell": key, "status": "vorhanden"})
            continue
        try:
            if e["quelle"] == "polyhaven":
                f = _get(PH_API + e["id"])["blend"]
                auf = e.get("aufloesung", "1k")
                if auf not in f:
                    auf = sorted(f)[0]
                b = f[auf]["blend"]
                _download(b["url"], ziel)
                for rel, inc in (b.get("include") or {}).items():
                    _download(inc["url"], ziel.parent / rel)
                meta = {"name": e["name"], "id": e["id"], "autor": e.get("autor", "Poly Haven"), "lizenz": "CC0 1.0",
                        "quelle": f"https://polyhaven.com/a/{e['id']}", "aufloesung": auf}
            elif e["quelle"] == "blenderkit":
                res = _get(BK_API + "?" + urllib.parse.urlencode({"query": f"asset_base_id:{e['id']}"})).get("results")
                if not res:
                    log.append({"modell": key, "status": "nicht gefunden"})
                    continue
                r = res[0]
                if not r.get("isFree"):
                    log.append({"modell": key, "status": "kostenpflichtig, nicht geladen"})
                    continue
                files = {x["fileType"]: x for x in r.get("files", [])}
                ft = next((t for t in ("resolution_2K", "resolution_1K", "blend") if t in files), "blend")
                url = _get(files[ft]["downloadUrl"] + "?scene_uuid=" + str(uuid.uuid4()))["filePath"]
                _download(url, ziel)
                meta = {"name": r["name"], "asset_base_id": r.get("assetBaseId"), "id": r.get("id"),
                        "autor": (r.get("author") or {}).get("fullName"), "lizenz": r.get("license"),
                        "quelle": f"https://www.blenderkit.com/asset-gallery-detail/{r.get('assetBaseId')}/",
                        "dateityp": ft, "flaechen": (r.get("dictParameters") or {}).get("faceCount")}
            else:
                raise ValueError(f"{key}: unbekannte quelle {e['quelle']}")
        except Exception as ex:                     # ein Modell darf die anderen nicht aufhalten
            log.append({"modell": key, "status": f"Fehler: {ex}"})
            continue
        meta.update({"datei": ziel.name, "sha256": hashlib.sha256(ziel.read_bytes()).hexdigest(),
                     "bytes": ziel.stat().st_size})
        (ziel.parent / "quelle.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
        log.append({"modell": key, "status": "geladen", "mb": round(ziel.stat().st_size / 1e6, 1)})
    return log


# ------------------------------------------------------------------ Vorlage (in Blender)
def _welt(ob):
    """Weltmatrix ohne Szene: Elternkette aus matrix_basis und matrix_parent_inverse."""
    M = ob.matrix_basis.copy()
    p = ob
    while p.parent:
        M = p.parent.matrix_basis @ p.matrix_parent_inverse @ M
        p = p.parent
    return M


def vorlage(bpy, key: str) -> list:
    """Netze des Modells, normiert: Front -Y, Ursprung unten Mitte, Masse in m. Rueckgabe [(mesh, (W, D, H))].
    Modifikatoren (Spiegel, Fase, Geometrieknoten) werden angewendet, Unterteilung hoechstens 1 Stufe, Constraints
    (z. B. animierte Tueren) entfernt, Haar-Kurven verworfen."""
    if key in _VORLAGEN:
        return _VORLAGEN[key]
    from mathutils import Matrix
    e = tabelle()[key]
    p = datei(key)
    if not p.exists():
        raise BibliothekFehlt(f"Modell {key} fehlt ({p}); auf dem Mac `immoviz.py modelle-laden` ausfuehren")
    with bpy.data.libraries.load(str(p), link=False) as (src, dst):
        dst.objects = list(src.objects)
    obs = [o for o in dst.objects if o is not None]
    tmp = bpy.data.collections.new(f"_vorlage_{key}")
    bpy.context.scene.collection.children.link(tmp)
    for o in obs:
        tmp.objects.link(o)
        o.constraints.clear()
        o.animation_data_clear()
        for md in o.modifiers:
            if md.type == "SUBSURF":
                md.levels = md.render_levels = min(md.render_levels, e.get("subsurf", 1))
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    netze = []
    for o in obs:
        if o.type not in ("MESH", "CURVE", "SURFACE", "META") or WEG.search(o.name):
            continue
        if e.get("weg") and any(re.search(w, o.name, re.I) for w in e["weg"]):
            continue
        if e.get("nur") and not re.search(e["nur"], o.name, re.I):
            continue
        ev = o.evaluated_get(dg)
        me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)
        if not me or not me.vertices:
            continue
        me.transform(ev.matrix_world)
        netze.append(me)
    for o in obs:
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(tmp)
    # Bodenplatte des Modells (flach, viel groesser als der Rest) verwerfen
    if len(netze) > 1:
        def box(me):
            import numpy as np
            co = np.empty(len(me.vertices) * 3)
            me.vertices.foreach_get("co", co)
            co = co.reshape(-1, 3)
            return co.min(0), co.max(0)
        bx = [box(me) for me in netze]
        rest = lambda i: [b for j, b in enumerate(bx) if j != i]
        keep = []
        for i, (lo_, hi_) in enumerate(bx):
            flach = hi_[2] - lo_[2] < 0.01
            r = rest(i)
            if flach and r:
                rl = [min(b[0][k] for b in r) for k in range(2)]
                rh = [max(b[1][k] for b in r) for k in range(2)]
                if (hi_[0] - lo_[0]) * (hi_[1] - lo_[1]) > 4 * max(1e-6, (rh[0] - rl[0]) * (rh[1] - rl[1])):
                    continue
            keep.append(netze[i])
        netze = keep
    if not netze:
        raise BibliothekFehlt(f"Modell {key}: keine Geometrie gefunden")
    # Front nach -Y drehen
    dreh = {"-y": 0.0, "+y": math.pi, "+x": -math.pi / 2, "-x": math.pi / 2}[e.get("vorne", "-y")]
    R = Matrix.Rotation(dreh, 4, "Z")
    if e.get("hoch") == "y":                     # Modell liegt (Y oben): aufrichten
        R = R @ Matrix.Rotation(math.pi / 2, 4, "X")
    if e.get("kopf"):                            # senkrecht spiegeln (haengender Efeu waechst dann vom Trog nach oben)
        R = R @ Matrix.Rotation(math.pi, 4, "Y") if e.get("hoch") != "y" else \
            Matrix.Rotation(dreh, 4, "Z") @ Matrix.Rotation(math.pi, 4, "Y") @ Matrix.Rotation(math.pi / 2, 4, "X")
    lo, hi = [1e9] * 3, [-1e9] * 3
    for me in netze:
        me.transform(R)
        for v in me.vertices:
            for k in range(3):
                lo[k], hi[k] = min(lo[k], v.co[k]), max(hi[k], v.co[k])
    T = Matrix.Translation((-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]))
    for me in netze:
        me.transform(T)
    dims = (hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2])
    _VORLAGEN[key] = [(me, dims) for me in netze]
    return _VORLAGEN[key]


def _farbe(bpy, me, farbe: str | None, muster=STOFF):
    """Stoffmaterialien (Name nach STOFF) auf eine Farbe setzen (Kopie des Materials, Textur der Grundfarbe ab)."""
    if not farbe:
        return
    from .. import materials as M
    c = M.hex_rgb(farbe)
    for i, m in enumerate(me.materials):
        if m is None or not muster.search(m.name):
            continue
        k = m.copy()
        k.name = f"{m.name}_{farbe.lstrip('#')}"
        if k.use_nodes:
            for n in k.node_tree.nodes:
                if n.type == "BSDF_PRINCIPLED":
                    sock = n.inputs["Base Color"]
                    for lk in list(sock.links):
                        k.node_tree.links.remove(lk)
                    sock.default_value = (*c, 1.0)
        me.materials[i] = k


def platzieren(bpy, coll, key: str, praefix: str, klasse: str, mitte, front, ziel, z0: float,
               quelle: str, skalierung: str = "einheitlich", anlegen: bool = False, farbe: str | None = None,
               tiefe_box: float | None = None) -> list:
    """Modell auf eine Planbox setzen.
    mitte: (x, y) Weltmitte der Box; front: (fx, fy) Einheitsvektor, wohin die Vorderseite zeigt;
    ziel: (Breite quer zur Front, Tiefe entlang der Front, Hoehe), None = aus der Skalierung; z0: Unterkante;
    skalierung: einheitlich (nach Breite, sonst Hoehe) | frei (jede Achse auf ihr Ziel) | hoehe;
    anlegen: Rueckseite an die Boxkante gegenueber der Front (Wand), braucht tiefe_box (Tiefe der Planbox)."""
    if os.environ.get("IMMOVIZ_BIBLIOTHEK", "").lower() == "platzhalter" and not datei(key).exists():
        return [_platzhalter(bpy, coll, praefix, klasse, key, mitte, front, ziel, z0, quelle)]
    teile = vorlage(bpy, key)
    W, D, H = teile[0][1]
    w, d, h = ziel
    if skalierung == "frei":
        u = (w / W if w else None, d / D if d else None, h / H if h else None)
        ref = next((x for x in u if x), 1.0)
        sx, sy, sz = (x or ref for x in u)
    else:
        s = (h / H) if (skalierung == "hoehe" and h) else (w / W if w else (h / H if h else 1.0))
        sx = sy = sz = s
    fx, fy = front
    th = math.atan2(fy, fx) + math.pi / 2       # Modellfront -Y auf die Planfront drehen
    cx, cy = mitte
    if anlegen and tiefe_box:
        verschub = (tiefe_box - D * sy) / 2      # Rueckseite an die Wand: Mitte Richtung Front verschieben
        cx, cy = cx + fx * verschub, cy + fy * verschub
    obs = []
    for n, (me, _) in enumerate(teile):
        if farbe:
            me = me.copy()
            _farbe(bpy, me, farbe)
        ob = bpy.data.objects.new(f"{praefix}__{klasse}__{key}_{n}", me)
        ob.scale = (sx, sy, sz)
        ob.rotation_euler = (0.0, 0.0, th)
        ob.location = (cx, cy, z0)
        ob["quelle"] = quelle
        ob["modell"] = key
        coll.objects.link(ob)
        obs.append(ob)
    return obs


def _platzhalter(bpy, coll, praefix, klasse, key, mitte, front, ziel, z0, quelle):
    import bmesh
    w, d, h = (x or 0.5 for x in ziel)
    me = bpy.data.meshes.new(f"platzhalter_{key}")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= w
        v.co.y *= d
        v.co.z = (v.co.z + 0.5) * h
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(f"{praefix}__{klasse}__{key}_platzhalter", me)
    ob.rotation_euler = (0.0, 0.0, math.atan2(front[1], front[0]) + math.pi / 2)
    ob.location = (mitte[0], mitte[1], z0)
    ob["quelle"] = quelle
    ob["platzhalter"] = True
    coll.objects.link(ob)
    return ob


# ------------------------------------------------------------------ Innenraeume (wohnungen.yaml `moebel`)
FRONT_PX = {"-x": (-1, 0), "+x": (1, 0), "-y": (0, -1), "+y": (0, 1)}


def einrichten(bpy, coll, apt, a: dict, name: str, project_dir=None) -> list:
    """wohnungen.yaml <wohnung>.moebel: [{modell, px: [x0, y0, x1, y1] | c_px: [x, y], front: -x|+x|-y|+y (Planpixel),
    h, z (ueber FOK), skalierung, anlegen, farbe, klasse (innenraum|stoffe|vegetation), quelle,
    stuehle: {modell, anzahl, radius, h, farbe}}]. Lage in Planpixeln wie `einbauten`."""
    obs = []
    s = apt.s if hasattr(apt, "s") else 1.0
    for i, m in enumerate(a.get("moebel", []) or []):
        fpx = FRONT_PX[m.get("front", "-y")]
        if "px" in m:
            x0, y0, x1, y1 = m["px"]
            cxp, cyp = (x0 + x1) / 2, (y0 + y1) / 2
            breite_px, tiefe_px = (y1 - y0, x1 - x0) if fpx[0] else (x1 - x0, y1 - y0)
            w, d = breite_px * s, tiefe_px * s
        else:
            cxp, cyp = m["c_px"]
            w = d = m.get("d")
        c = apt.px_to_local(cxp, cyp)
        f2 = apt.px_to_local(cxp + fpx[0] * 100, cyp + fpx[1] * 100)
        fl = math.hypot(f2[0] - c[0], f2[1] - c[1])
        front = ((f2[0] - c[0]) / fl, (f2[1] - c[1]) / fl)
        z0 = a["floor_z"] + m.get("z", 0.0)
        if m.get("haengend"):                     # Pendelleuchte: Oberkante an der Decke
            z0 = a["floor_z"] + a["height"] - m["h"]
        obs += platzieren(bpy, coll, m["modell"], f"{name}_{i:02d}", m.get("klasse", "innenraum"), c, front,
                          (w, d if m.get("skalierung") == "frei" else None, m.get("h")), z0, m["quelle"],
                          m.get("skalierung", "einheitlich"), m.get("anlegen", False), m.get("farbe"), d)
        st = m.get("stuehle")
        if st:                                    # Stuehle rund um einen Tisch, Front zur Tischmitte
            n, r = st.get("anzahl", 4), st.get("radius", 0.62) / s
            for k in range(n):
                wk = math.radians(st.get("start_grad", 0) + 360 * k / n)
                px_, py_ = cxp + r * math.cos(wk), cyp + r * math.sin(wk)
                cc = apt.px_to_local(px_, py_)
                fx, fy = c[0] - cc[0], c[1] - cc[1]
                fn = math.hypot(fx, fy)
                obs += platzieren(bpy, coll, st["modell"], f"{name}_{i:02d}s{k}", st.get("klasse", "innenraum"),
                                  cc, (fx / fn, fy / fn), (st.get("b"), None, st.get("h")), a["floor_z"],
                                  st.get("quelle", m["quelle"]), "hoehe" if st.get("h") else "einheitlich",
                                  False, st.get("farbe"))
    return obs


# ------------------------------------------------------------------ Terrassen (project.yaml neubau.ausstattung typ modell)
VORNE_AB = {"a+": (1, 0), "a-": (-1, 0), "b+": (0, 1), "b-": (0, -1)}


def ausstattung(bpy, coll, e: dict, T, gruppe: str, idx: int) -> list:
    """{typ: modell, modell, box: [a0, b0, a1, b1], z: Unterkante oder [z0, z1], vorne: a+|a-|b+|b-, skalierung,
    anlegen, farbe, klasse (ausstattung|vegetation|stoffe), quelle}. T: Hofrahmen (a, b) -> (x, y)."""
    a0, b0, a1, b1 = e["box"]
    va = VORNE_AB[e.get("vorne", "b-")]
    ca, cb = (a0 + a1) / 2, (b0 + b1) / 2
    c = T(ca, cb)
    f2 = T(ca + va[0], cb + va[1])
    front = (f2[0] - c[0], f2[1] - c[1])
    breite, tiefe = (abs(b1 - b0), abs(a1 - a0)) if va[0] else (abs(a1 - a0), abs(b1 - b0))
    z = e["z"]
    z0, h = (z[0], z[1] - z[0]) if isinstance(z, list) else (z, e.get("h"))
    frei = e.get("skalierung", "einheitlich") == "frei"
    return platzieren(bpy, coll, e["modell"], f"{gruppe}_{idx:02d}", e.get("klasse", "ausstattung"), c, front,
                      (breite, tiefe if frei else None, h), z0, e["quelle"], e.get("skalierung", "einheitlich"),
                      e.get("anlegen", False), e.get("farbe"), tiefe)
