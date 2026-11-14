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


if __name__ == "__main__":
    main()
