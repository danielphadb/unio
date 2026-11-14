#!/usr/bin/env python3
"""immoviz: Immobilien-Visualisierung aus Plaenen, Stadtdaten, Blender und Higgsfield.

Beispiele:
  python immoviz.py geo     projects/wimmergasse-20
  python immoviz.py render  projects/wimmergasse-20 --cam ecke --light golden_hour --preview
  python immoviz.py render  projects/wimmergasse-20 --cam ecke,drohne --light golden_hour,blaue_stunde
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("geo", help="Umgebungsdaten der Stadt Wien laden (data/context.json)")
    g.add_argument("project")
    r = sub.add_parser("render", help="Szene bauen und rendern")
    r.add_argument("project")
    r.add_argument("--cam", default="ecke")
    r.add_argument("--light", default="golden_hour")
    r.add_argument("--preview", action="store_true")
    r.add_argument("--no-blend", action="store_true")
    c = sub.add_parser("check", help="Orthogonal-Ansicht ueber die Strassenansicht legen (Planabgleich)")
    c.add_argument("project")
    c.add_argument("--facade", default=None)
    sv = sub.add_parser("svcheck", help="Modell gegen Google Street View vergleichen (Schluessel in GOOGLE_MAPS_API_KEY)")
    sv.add_argument("project")
    it = sub.add_parser("interior", help="Innenräume aus dem Grundriss bauen und rendern (wohnungen.yaml)")
    it.add_argument("project")
    it.add_argument("--top", default="top07")
    it.add_argument("--final", action="store_true")
    it.add_argument("--cam", default="", help="nur diese Kameras, z. B. top07_zimmer,top12_kueche")
    a = ap.parse_args()
    pdir = Path(a.project).resolve()

    if a.cmd == "geo":
        import yaml
        from lib.geo_wien import build_context
        cfg = yaml.safe_load((pdir / "project.yaml").read_text())
        ctx = build_context(cfg, pdir / "data" / "context.json")
        print(json.dumps({"gebaeude": len(ctx["buildings"]), "objekt_teile": len(ctx["hero"]),
                          "flaechen": len(ctx["surfaces"]), "baeume": len(ctx["trees"])}, ensure_ascii=False))
    elif a.cmd == "render":
        from lib.build import render
        t = time.time()
        res = render(pdir, a.cam.split(","), a.light.split(","), a.preview, not a.no_blend)
        print(json.dumps({"renders": res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))
    elif a.cmd == "svcheck":
        _svcheck(pdir)
    elif a.cmd == "interior":
        _interior(a, pdir)
    elif a.cmd == "check":
        from lib.build import load_project, build_scene, Hero
        from lib import check as C, meshkit as K
        cfg, ctx = load_project(pdir)
        scene = build_scene(cfg, ctx)
        out_dir = pdir / "renders" / "check"
        out_dir.mkdir(parents=True, exist_ok=True)
        for name, c in cfg["checks"].items():
            if a.facade and name != a.facade:
                continue
            f = K.Facade(name, tuple(cfg["facades"][name]["a"]), tuple(cfg["facades"][name]["b"]))
            ppm = C.px_per_m(c["dpi"], c.get("scale", 100))
            mp = out_dir / f"{name}_modell.png"
            w, h, ox, oy = C.render_ortho(scene, f, c["span"], c["z"], ppm, mp)
            out = C.overlay(pdir, cfg, name, mp, (ox, oy), (w, h), out_dir / f"{name}_abgleich.jpg")
            print("Abgleich:", out)


def _svcheck(pdir):
    import os
    from lib.build import load_project, build_scene, setup_render, setup_light
    from lib import check as C
    key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not key:
        sys.exit("GOOGLE_MAPS_API_KEY fehlt")
    cfg, ctx = load_project(pdir)
    scene = build_scene(cfg, ctx)
    setup_render(scene, (640, 640), 24)
    setup_light(scene, cfg, ctx, cfg.get("streetview_light", "dunst_hell"))
    import lib.build as B
    res = C.streetview_compare(scene, cfg, ctx, pdir / "renders" / "streetview", key, getattr(B, "LAST_TERRAIN", None))
    print(json.dumps(res, ensure_ascii=False))


def _interior(a, pdir):
    from lib.interior import render_apartments
    t = time.time()
    res = render_apartments(pdir, a.top.split(","), not a.final, [c for c in a.cam.split(",") if c])
    print(json.dumps({"renders": res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1, default=str))


if __name__ == "__main__":
    main()
