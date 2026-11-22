"""Planbeleg-Pruefung vor jedem Render (REGELN.md P10, ausgeloest durch Noma Runde 9, Kritik 21.11.2026).

Fehler, der die Regel ausgeloest hat: In `top04_terrasse_hst` stand eine weisse Wand 0,69 m vor der Ostfassade von
Top 4 (Tiefenbild: Ebene bei a 28,54, Fassade a 27,85). Ursache: Die Wandsuche im Verkaufsplan lief bis Planpixel
4197 ueber die Fassade hinaus und baute ein Element auf der Terrasse als 2,5 m hohe Innenwand. Das Bild ging trotzdem
in die Veredelung. Ab jetzt prueft jeder Render vorab, was die Kamera sieht, und bricht bei Fehlern ab.

Pruefung je Kamera (`pruefen`), auf dem fertigen Szenenaufbau, ohne zu rendern:
1. Sichtbare Objekte: Strahlen durch ein Raster des Kamerabilds (Standard 192 x 128), durch Glas und durch
   ausgeblendete Objekte hindurch. Ergebnis: Objekt, Bildanteil, Herkunft.
2. Herkunft je Objekt:
   - Collection `Innen` (lib/interior.py): Objekt braucht die Eigenschaft `quelle` (Plan oder Bibliothek) und muss mit
     allen Punkten innerhalb der Grundflaeche der Wohnung liegen (`huellen`, Toleranz 1 cm). Sonst Fehler.
   - Collection `Objekt`: Gruppe (Name bis `_masse`, `_rahmen`, ...) muss in project.yaml `neubau` vorkommen
     (Planelement) bzw. `hero*` sein. Gruppen `ausstattung_*`: jede Zeile braucht `quelle`. Unbekannt = Fehler.
     Gruppen in `objekt_ausblenden`, die trotzdem sichtbar sind, sind ein Fehler.
   - Alles andere ist Umgebung (Stadt-Wien-Daten, Nachbarn, Gelaende, Baeume, Autos): nur gelistet.
3. Bericht `<ordner>/<kamera>_planbeleg.json` und `.md`; bei Fehlern `PlanbelegFehler` (Render bricht ab).
   Nur zum Nachsehen eines bekannten Fehlers: `IMMOVIZ_PLANBELEG=warnen` (dann Dateiname des Renders mit
   `_VORBEHALT` kennzeichnen und nie veredeln).
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

RASTER = (192, 128)
MIN_ANTEIL = 0.0005          # Objekte unter 0,05 % des Bildes gelten als nicht sichtbar (Rauschen des Rasters)
TOLERANZ_M = 0.01
FLAECHE_TOLERANZ = 0.06    # freie Flaeche der Innenhuelle gegen die Wohnflaeche laut Verkaufsplan
TEILE = re.compile(r"_(masse|rahmen|glas|innen|gruen|gelaender)(\.\d+)?$")


class PlanbelegFehler(RuntimeError):
    pass


def _gruppen(cfg: dict) -> tuple[set, dict]:
    """Alle Gruppen aus project.yaml `neubau` und je Ausstattungsgruppe die Zeilen ohne `quelle`."""
    gruppen, ohne_quelle = set(), {}
    nb = cfg.get("neubau") or {}
    for abschnitt, eintraege in nb.items():
        if not isinstance(eintraege, list):
            continue
        for e in eintraege:
            if not isinstance(e, dict):
                continue
            g = e.get("gruppe", "neubau")
            gruppen.add(g)
            if abschnitt == "ausstattung" or g.startswith("ausstattung"):
                ohne_quelle.setdefault(g, 0)
                if not e.get("quelle"):
                    ohne_quelle[g] += 1
    return gruppen, ohne_quelle


def _collections(ob) -> list[str]:
    return [c.name for c in ob.users_collection]


def sichtbare_objekte(scene, raster=RASTER) -> dict[str, float]:
    """Bildanteil je Objekt (Originalname) aus einem Strahlenraster durch die Kamera. Glas und Objekte mit
    hide_render werden durchstossen; Glas zaehlt selbst auch."""
    import bpy
    from mathutils import Vector
    cam = scene.camera
    dg = bpy.context.evaluated_depsgraph_get()
    mw = cam.matrix_world
    fr = [mw @ v for v in cam.data.view_frame(scene=scene)]   # rechts oben, rechts unten, links unten, links oben
    o = mw.translation
    nx, ny = raster
    treffer: dict[str, int] = {}
    for j in range(ny):
        v = (j + 0.5) / ny
        li = fr[3].lerp(fr[2], v)
        re_ = fr[0].lerp(fr[1], v)
        for i in range(nx):
            p = li.lerp(re_, (i + 0.5) / nx)
            d = (p - o).normalized()
            start = Vector(o)
            for _ in range(10):
                ok, loc, _n, _idx, ob, _m = scene.ray_cast(dg, start, d, distance=20000.0)
                if not ok:
                    break
                orig = ob.original if hasattr(ob, "original") else ob
                start = loc + d * 0.002
                if orig.hide_render:
                    continue
                treffer[orig.name] = treffer.get(orig.name, 0) + 1
                if not (orig.name.endswith("_glas") or re.search(r"_glas\.\d+$", orig.name)):
                    break
    n = nx * ny
    return {k: c / n for k, c in sorted(treffer.items(), key=lambda kv: -kv[1])}


def _ausserhalb(ob, huelle) -> tuple[int, float]:
    """Zahl der Punkte ausserhalb der Grundflaeche und groesster Abstand (m). huelle: Funktion (x, y) -> Abstand
    nach aussen (<= 0 innen)."""
    import numpy as np
    me = ob.data
    n = len(me.vertices)
    if n == 0:
        return 0, 0.0
    co = np.empty(n * 3, np.float64)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    M = np.array(ob.matrix_world)
    w = co @ M[:3, :3].T + M[:3, 3]
    d = huelle(w[:, 0], w[:, 1])
    aus = d > TOLERANZ_M
    return int(aus.sum()), float(d.max()) if n else 0.0


def pruefen(scene, cfg: dict, kamera: str, ordner: Path | None = None, huellen: dict | None = None,
            ausgeblendet: tuple = (), raster=RASTER, flaeche: tuple | None = None) -> dict:
    """Planbeleg je Kamera. huellen: {Praefix des Innen-Objekts: Abstandsfunktion} (lib/interior.py)."""
    import bpy
    gruppen, ohne_quelle = _gruppen(cfg)
    sicht = sichtbare_objekte(scene, raster)
    zeilen, fehler, hinweise = [], [], []
    for name, anteil in sicht.items():
        if anteil < MIN_ANTEIL:
            continue
        ob = bpy.data.objects.get(name)
        cols = _collections(ob) if ob else []
        z = {"objekt": name, "anteil_prozent": round(anteil * 100, 2), "collections": cols}
        if ob is not None and ob.get("platzhalter"):
            fehler.append(f"{name}: Platzhalter statt Modell (Bibliothek fehlt, immoviz.py modelle-laden)")
        if "Innen" in cols:
            q = ob.get("quelle") if ob else None
            z["herkunft"] = "innen"
            z["quelle"] = q
            if not q:
                fehler.append(f"{name}: Innenraum-Objekt ohne quelle ({z['anteil_prozent']} % des Bildes)")
        elif "Objekt" in cols:
            g = name.split("__")[0] if "__" in name else TEILE.sub("", name)   # Modelle: <gruppe>_<nr>__<klasse>__...
            g = re.sub(r"_\d+$", "", g) if "__" in name else g
            z["gruppe"] = g
            if ausgeblendet and name.startswith(tuple(ausgeblendet)):
                fehler.append(f"{name}: sollte fuer diese Kamera ausgeblendet sein (objekt_ausblenden)")
            if g.startswith("nb_umgebung"):
                z["herkunft"] = "nachbarn"
            elif g.startswith("hero") or g in gruppen:
                z["herkunft"] = "ausstattung" if g.startswith("ausstattung") else "plan"
                if ohne_quelle.get(g):
                    fehler.append(f"{name}: {ohne_quelle[g]} Zeile(n) der Gruppe {g} ohne quelle")
            else:
                z["herkunft"] = "unbekannt"
                fehler.append(f"{name}: Gruppe {g} steht nicht in project.yaml neubau (kein Planbeleg)")
        else:
            z["herkunft"] = "umgebung"
        zeilen.append(z)
    # Innenraeume: alle Punkte innerhalb der Grundflaeche (unabhaengig von der Sichtbarkeit, weil eine Wand ausserhalb
    # immer ein Modellfehler ist)
    huelle_bericht = []
    for praefix, fn in (huellen or {}).items():
        for ob in bpy.data.objects:
            if ob.type != "MESH" or ob.hide_render or "Innen" not in _collections(ob) or not ob.name.startswith(praefix):
                continue
            n, dmax = _ausserhalb(ob, fn)
            huelle_bericht.append({"objekt": ob.name, "punkte_ausserhalb": n, "max_abstand_m": round(dmax, 3)})
            if n:
                fehler.append(f"{ob.name}: {n} Punkte bis {dmax:.2f} m ausserhalb der Grundflaeche der Wohnung")
    if flaeche:                    # (ist, soll) m2: freie Flaeche der Huelle gegen den Verkaufsplan
        ist, soll = flaeche
        if abs(ist - soll) / soll > FLAECHE_TOLERANZ:
            fehler.append(f"Wohnflaeche im Modell {ist:.1f} m2, Verkaufsplan {soll:.1f} m2 "
                          f"(Abweichung {100 * (ist - soll) / soll:+.0f} %, erlaubt {100 * FLAECHE_TOLERANZ:.0f} %)")
    for g, n in ohne_quelle.items():
        if n and not any(z.get("gruppe") == g for z in zeilen):
            hinweise.append(f"Gruppe {g}: {n} Zeile(n) ohne quelle (in dieser Kamera nicht sichtbar)")
    bericht = {"kamera": kamera, "raster": list(raster), "fehler": fehler, "hinweise": hinweise,
               "flaeche_m2": {"modell": flaeche[0], "plan": flaeche[1]} if flaeche else None,
               "huellen": huelle_bericht, "sichtbar": zeilen}
    if ordner:
        ordner = Path(ordner)
        ordner.mkdir(parents=True, exist_ok=True)
        (ordner / f"{kamera}_planbeleg.json").write_text(json.dumps(bericht, ensure_ascii=False, indent=1))
        md = [f"# Planbeleg {kamera}", "", f"Fehler: {len(fehler)}", ""]
        md += [f"- FEHLER {f}" for f in fehler] + [f"- Hinweis {h}" for h in hinweise]
        md += ["", "| Objekt | Anteil % | Herkunft | Gruppe/Quelle |", "|---|---|---|---|"]
        md += [f"| {z['objekt']} | {z['anteil_prozent']} | {z['herkunft']} | {z.get('gruppe') or z.get('quelle') or ''} |"
               for z in zeilen]
        (ordner / f"{kamera}_planbeleg.md").write_text("\n".join(md) + "\n")
    print(f"Planbeleg {kamera}: {len(zeilen)} sichtbare Objekte, {len(fehler)} Fehler")
    for f in fehler:
        print("  FEHLER", f)
    if fehler and os.environ.get("IMMOVIZ_PLANBELEG", "").lower() != "warnen":
        raise PlanbelegFehler(f"Planbeleg {kamera}: {len(fehler)} Fehler, Render abgebrochen (siehe "
                              f"{kamera}_planbeleg.md). Erst das Modell korrigieren.")
    return bericht
