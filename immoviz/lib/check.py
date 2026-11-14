"""Planabgleich: Orthogonal-Ansicht des Modells ueber die Strassenansicht (PDF) legen.

Konfiguration in project.yaml:
  checks:
    wimmergasse:
      pdf: quellen/06_Wimmerg_Strassenansicht.pdf
      page: 1
      dpi: 130
      scale: 100            # Planmassstab 1:100
      u0_px: [403, 1340]    # Pixel von u = 0 und z = 0 im gerenderten PDF
      span: [-7.3, 32.7]    # dargestellter u-Bereich in Metern
      z: [-1.0, 27.0]
"""
from __future__ import annotations

import math
import subprocess
from pathlib import Path

import bpy
from PIL import Image, ImageChops, ImageDraw, ImageOps

from . import meshkit as K


def px_per_m(dpi: float, scale: float) -> float:
    return dpi / 0.0254 / scale


def render_ortho(scene, f: K.Facade, span, zr, ppm, out: Path):
    u0, u1 = span
    z0, z1 = zr
    w = int(round((u1 - u0) * ppm))
    h = int(round((z1 - z0) * ppm))
    uc, zc = (u0 + u1) / 2, (z0 + z1) / 2
    px, py, _ = f.p(uc, -80.0, zc)
    cam = bpy.data.cameras.new("plancheck")
    cam.type = "ORTHO"
    cam.ortho_scale = max(u1 - u0, z1 - z0)
    cam.clip_end = 500
    ob = bpy.data.objects.new("plancheck", cam)
    scene.collection.objects.link(ob)
    yaw = math.atan2(f.n[0], -f.n[1])  # Blickrichtung = -n
    ob.rotation_euler = (math.radians(90), 0, yaw)
    ob.location = (px, py, zc)
    scene.camera = ob
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    world = bpy.data.worlds.new("plancheck")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.2
    scene.world = world
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "Standard"
    scene.render.film_transparent = True
    for c in bpy.data.collections:
        if c.name == "Umgebung":
            c.hide_render = True
    scene.render.filepath = str(out)
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    return w, h, (-u0) * ppm, (z1 - 0.0) * ppm  # Pixelposition von u=0, z=0


def overlay(project_dir: Path, cfg, name: str, model_png: Path, model_origin, size, out: Path):
    c = cfg["checks"][name]
    pdf = project_dir / c["pdf"]
    tmp = out.with_suffix("")
    subprocess.run(["pdftoppm", "-r", str(c["dpi"]), "-png", "-f", str(c.get("page", 1)),
                    "-l", str(c.get("page", 1)), "-singlefile", str(pdf), str(tmp)], check=True)
    plan = Image.open(str(tmp) + ".png").convert("L")
    ox = int(round(c["u0_px"][0] - model_origin[0]))
    oy = int(round(c["u0_px"][1] - model_origin[1]))
    plan = plan.crop((ox, oy, ox + size[0], oy + size[1]))
    model = Image.open(model_png).convert("RGBA")
    # Plan in Rot, Modellkanten in Blau: Deckung ergibt dunkle Linien
    plan_rgb = ImageOps.colorize(plan, black=(200, 0, 0), white=(255, 255, 255)).convert("RGBA")
    edges = model.convert("L").point(lambda v: 255 if v > 0 else 0)
    m = Image.new("RGBA", model.size, (255, 255, 255, 0))
    m.paste(model, (0, 0), model)
    blend = Image.blend(plan_rgb, Image.alpha_composite(Image.new("RGBA", model.size, (255, 255, 255, 255)), m), 0.45)
    d = ImageDraw.Draw(blend)
    ppm = px_per_m(c["dpi"], c.get("scale", 100))
    for zz in c.get("levels", []):
        y = model_origin[1] - zz * ppm
        d.line([(0, y), (size[0], y)], fill=(0, 120, 255, 255), width=1)
        d.text((5, y - 12), f"z {zz:.2f}", fill=(0, 90, 200, 255))
    blend.convert("RGB").save(out, quality=92)
    Path(str(tmp) + ".png").unlink(missing_ok=True)
    return out


# ---------------------------------------------------------------- Street-View-Abgleich
def _local_to_wgs(ctx, x, y):
    from pyproj import Transformer
    fr = ctx["frame"]
    ox, oy = fr["origin_gk"]
    a = math.radians(fr["x_axis_deg"])
    gx, gy = ox + x * math.cos(a) - y * math.sin(a), oy + x * math.sin(a) + y * math.cos(a)
    lon, lat = Transformer.from_crs("EPSG:31256", "EPSG:4326", always_xy=True).transform(gx, gy)
    return lat, lon


def _wgs_to_local(ctx, lat, lon):
    from pyproj import Transformer
    fr = ctx["frame"]
    ox, oy = fr["origin_gk"]
    a = math.radians(fr["x_axis_deg"])
    gx, gy = Transformer.from_crs("EPSG:4326", "EPSG:31256", always_xy=True).transform(lon, lat)
    dx, dy = gx - ox, gy - oy
    return dx * math.cos(a) + dy * math.sin(a), -dx * math.sin(a) + dy * math.cos(a)


def streetview_compare(scene, cfg, ctx, out_dir: Path, key: str, terrain=None):
    """Holt je Ansicht ein Street-View-Bild (nur Referenz, nicht fuer Vermarktung) und rendert das Modell
    mit identischer Position, Blickrichtung, Neigung und Brennweite. Ergebnis: Bildpaar nebeneinander."""
    import json
    import urllib.parse
    import urllib.request
    out_dir.mkdir(parents=True, exist_ok=True)
    a0 = math.radians(cfg["site"]["x_axis_deg"])
    cam = bpy.data.cameras.new("svcheck")
    ob = bpy.data.objects.new("svcheck", cam)
    scene.collection.objects.link(ob)
    scene.camera = ob
    scene.render.resolution_x = scene.render.resolution_y = 640
    results = []
    for name, v in cfg["streetview_checks"].items():
        lat, lon = _local_to_wgs(ctx, *v["pos"])
        q = urllib.parse.urlencode({"location": f"{lat},{lon}", "radius": 20, "source": "outdoor", "key": key})
        meta = json.load(urllib.request.urlopen(f"https://maps.googleapis.com/maps/api/streetview/metadata?{q}", timeout=20))
        if meta.get("status") != "OK":
            results.append((name, meta.get("status")))
            continue
        px, py = _wgs_to_local(ctx, meta["location"]["lat"], meta["location"]["lng"])
        tx, ty = v["target"]
        dxl, dyl = tx - px, ty - py
        east = dxl * math.cos(a0) - dyl * math.sin(a0)
        north = dxl * math.sin(a0) + dyl * math.cos(a0)
        heading = (math.degrees(math.atan2(east, north)) + 360) % 360
        fov, pitch = v.get("fov", 90), v.get("pitch", 10)
        q = urllib.parse.urlencode({"size": "640x640", "pano": meta["pano_id"], "heading": round(heading, 1),
                                    "pitch": pitch, "fov": fov, "key": key})
        sv_path = out_dir / f"{name}_streetview.jpg"
        sv_path.write_bytes(urllib.request.urlopen(f"https://maps.googleapis.com/maps/api/streetview?{q}", timeout=30).read())
        cam.sensor_fit = "HORIZONTAL"
        cam.sensor_width = 36
        cam.lens = 18 / math.tan(math.radians(fov) / 2)
        cam.shift_y = 0
        zc = (terrain(px, py) if terrain else 0.0) + v.get("height", 2.5)
        ob.location = (px, py, zc)
        ob.rotation_euler = (math.radians(90 + pitch), 0, math.atan2(-dxl, dyl))
        mp = out_dir / f"{name}_modell.png"
        scene.render.filepath = str(mp)
        bpy.ops.render.render(write_still=True)
        a = Image.open(sv_path).convert("RGB")
        b = Image.open(mp).convert("RGB").resize(a.size)
        pair = Image.new("RGB", (a.width * 2 + 8, a.height), "white")
        pair.paste(a, (0, 0))
        pair.paste(b, (a.width + 8, 0))
        d = ImageDraw.Draw(pair)
        d.text((8, 8), f"Street View {meta.get('date', '')}", fill=(255, 255, 0))
        d.text((a.width + 16, 8), "Modell", fill=(255, 255, 0))
        pair.save(out_dir / f"{name}_vergleich.jpg", quality=85)
        mp.unlink(missing_ok=True)
        results.append((name, "OK", meta.get("date")))
    return results
