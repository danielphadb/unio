"""Hotspots der Schnittbilder: Wohnungspolygone aus wohnungen.yaml (schnitt) in Bildkoordinaten.

Baut nur Szene und Schnittkamera (setup_axo_camera, gleiche Auflösung wie die finalen Schnittbilder),
ohne Umgebung und ohne Rendering. Jede Wohnung eines Zustands wird auf Bodenhöhe ihres Geschosses
(Fußbodenoberkante plus Stärke der orangen Bodenfläche) mit world_to_camera_view projiziert.

Ergebnis renders/schnitt/hotspots.json: {"aufloesung": [w, h], "zustaende": {zustand: {top: [[x, y], ...]}}}
mit x, y in Pixeln, Ursprung oben links. Aussparungen (`ohne`, z. B. Stiegenhaus) werden bei rechtwinkligen
Polygonen vorher abgezogen.
"""
from __future__ import annotations

import json
from pathlib import Path

import yaml
from PIL import Image, ImageDraw

BODEN_PLUS = 0.02      # Oberkante der orangen Bodenfläche über FFB (section.build_state)


def _inside(poly, x, y):
    c = False
    n = len(poly)
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            c = not c
    return c


def _rectilinear(poly):
    n = len(poly)
    return all(abs(poly[i][0] - poly[(i + 1) % n][0]) < 1e-9 or abs(poly[i][1] - poly[(i + 1) % n][1]) < 1e-9
               for i in range(n))


def subtract(poly, holes):
    """Rechtwinkliges Polygon minus rechtwinklige Aussparungen über ein komprimiertes Raster.
    Rückgabe: größter Umriss (Liste von Punkten, gegen den Uhrzeigersinn). Sonst unverändert."""
    if not holes or not _rectilinear(poly) or not all(_rectilinear(h) for h in holes):
        return [list(p) for p in poly]
    xs = sorted({p[0] for r in [poly, *holes] for p in r})
    ys = sorted({p[1] for r in [poly, *holes] for p in r})
    cell = {}
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            cx, cy = (xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2
            cell[i, j] = _inside(poly, cx, cy) and not any(_inside(h, cx, cy) for h in holes)
    on = lambda i, j: cell.get((i, j), False)
    # gerichtete Randkanten (innen links); an sich berührenden Ecken mehrere Nachfolger je Punkt
    out = {}
    for (i, j), v in cell.items():
        if not v:
            continue
        for a, b, cond in (((i, j), (i + 1, j), not on(i, j - 1)), ((i + 1, j), (i + 1, j + 1), not on(i + 1, j)),
                           ((i + 1, j + 1), (i, j + 1), not on(i, j + 1)), ((i, j + 1), (i, j), not on(i - 1, j))):
            if cond:
                out.setdefault(a, []).append(b)
    rings = []
    while out:
        start = next(iter(out))
        ring, cur = [start], start
        while True:
            nxt = out[cur].pop()
            if not out[cur]:
                del out[cur]
            if nxt == start:
                break
            ring.append(nxt)
            cur = nxt
            if cur not in out:
                break
        # kollineare Zwischenpunkte entfernen
        pts = [(xs[i], ys[j]) for i, j in ring]
        keep = []
        for k, p in enumerate(pts):
            a, b = pts[k - 1], pts[(k + 1) % len(pts)]
            if not ((abs(a[0] - p[0]) < 1e-9 and abs(b[0] - p[0]) < 1e-9) or
                    (abs(a[1] - p[1]) < 1e-9 and abs(b[1] - p[1]) < 1e-9)):
                keep.append([p[0], p[1]])
        rings.append(keep)

    def area(r):
        return sum(r[k][0] * r[(k + 1) % len(r)][1] - r[(k + 1) % len(r)][0] * r[k][1] for k in range(len(r))) / 2
    return max(rings, key=lambda r: abs(area(r)))


def compute(project_dir: Path, resolution: tuple[int, int] | None = None) -> dict:
    import bpy
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector
    from .section import setup_axo_camera

    W = yaml.safe_load((project_dir / "wohnungen.yaml").read_text())
    S = W["schnitt"]
    res = tuple(resolution or S["render"]["resolution"])
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    scene.render.pixel_aspect_x = scene.render.pixel_aspect_y = 1.0
    cam = setup_axo_camera(bpy, scene, S["kamera"])
    bpy.context.view_layer.update()
    w, h = res
    zust = {}
    for st in S["zustaende"]:
        tops = {}
        for wk in st.get("wohnungen", []):
            d = S["wohnungen"][wk]
            z = S["geschosse"][d["geschoss"]]["ffb"] + BODEN_PLUS
            poly = subtract(d["polygon"], d.get("ohne", []))
            pts = []
            for x, y in poly:
                v = world_to_camera_view(scene, cam, Vector((x, y, z)))
                pts.append([round(v.x * w, 1), round((1.0 - v.y) * h, 1)])
            tops[wk] = pts
        zust[st["name"]] = tops
    return {"aufloesung": list(res), "kamera": S["kamera"],
            "titel": {st["name"]: st["titel"] for st in S["zustaende"]}, "zustaende": zust}


def check_image(project_dir: Path, data: dict, names=("s01", "s04"), out: Path | None = None) -> str:
    """Umrisse in die Schnittbilder zeichnen und nebeneinander speichern (hotspots_check.jpg)."""
    d = project_dir / "renders" / "schnitt"
    ims = []
    for n in names:
        im = Image.open(d / f"{n}.jpg").convert("RGB")
        sx, sy = im.width / data["aufloesung"][0], im.height / data["aufloesung"][1]
        dr = ImageDraw.Draw(im)
        for top, pts in data["zustaende"].get(n, {}).items():
            P = [(x * sx, y * sy) for x, y in pts]
            dr.line(P + P[:1], fill=(0, 200, 255), width=4)
            for p in P:
                dr.ellipse([p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6], outline=(0, 90, 255), width=3)
            cx, cy = sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P)
            dr.text((cx, cy), top, fill=(0, 0, 0))
        ims.append(im)
    sheet = Image.new("RGB", (sum(i.width for i in ims), max(i.height for i in ims)), (255, 255, 255))
    x = 0
    for im in ims:
        sheet.paste(im, (x, 0))
        x += im.width
    out = out or d / "hotspots_check.jpg"
    sheet.save(out, quality=88)
    return str(out)


def write(project_dir: Path, check: bool = True) -> dict:
    data = compute(project_dir)
    out = project_dir / "renders" / "schnitt" / "hotspots.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    res = {"hotspots": str(out), "wohnungen": {k: list(v) for k, v in data["zustaende"].items() if v}}
    if check:
        res["check"] = check_image(project_dir, data)
    return res


if __name__ == "__main__":
    import sys
    print(json.dumps(write(Path(sys.argv[1]).resolve()), ensure_ascii=False, indent=1))
