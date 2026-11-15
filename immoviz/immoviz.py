#!/usr/bin/env python3
"""immoviz: Immobilien-Visualisierung aus Plaenen, Stadtdaten, Blender und Higgsfield.

Beispiele:
  python immoviz.py geo     projects/wimmergasse-20
  python immoviz.py daecher projects/wimmergasse-20
  python immoviz.py fernsicht projects/wimmergasse-20 (markante Gebäude und Gelände für Drohne und Terrasse)
  python immoviz.py strasse projects/wimmergasse-20   (Prüfbild Parkplätze und Gehsteige gegen das Orthofoto)
  python immoviz.py render  projects/wimmergasse-20 --cam ecke --light golden_hour --preview
  python immoviz.py render  projects/wimmergasse-20 --cam ecke,drohne --light golden_hour,blaue_stunde
  python immoviz.py website projects/wimmergasse-20
  python immoviz.py studio  (Web-Oberfläche auf Port 8765)
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
    dc = sub.add_parser("daecher", help="Dachmodell LOD2 der Stadt Wien laden (data/roofs.json), vorher geo ausführen")
    dc.add_argument("project")
    dc.add_argument("--cache", default=None, help="Ordner für geladene Kacheln (Standard: kein Cache)")
    dc.add_argument("--ohne-orthofoto", action="store_true", help="Dachfarbe nicht aus dem Orthofoto ableiten")
    fs = sub.add_parser("fernsicht", help="Fernsicht für Luft- und Terrassenmotive: hohe Gebäude, Geländepunkte "
                                          "(data/fern.json) und Liste der markanten Gebäude je Kamera")
    fs.add_argument("project")
    fs.add_argument("--cam", default="drohne,ausblick_terrasse")
    fs.add_argument("--neu", action="store_true", help="Daten neu laden, auch wenn data/fern.json vorhanden ist")
    fs.add_argument("--anzahl", type=int, default=15, help="Einträge je Kamera")
    sg = sub.add_parser("strasse", help="Straßenabgleich: Parkordnung, Gehsteige und Bäume vor dem Objekt gegen das "
                                        "Orthofoto der Stadt Wien (renders/check/strasse_abgleich.jpg und .md)")
    sg.add_argument("project")
    sg.add_argument("--ohne-streetview", action="store_true", help="Street-View-Vergleich auch mit Schlüssel auslassen")
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
    si = sub.add_parser("sichtbar", help="Direkt sichtbare Nachbarhäuser je Kamera berechnen (Bildanteil der Fassaden)")
    si.add_argument("project")
    si.add_argument("--cam", default="ecke,ecke_orbit,wimmergasse,stolberggasse")
    si.add_argument("--pflicht", action="store_true",
                    help="nur die Pflichtliste ausgeben: in jede Straßenrichtung die ersten Häuser je Straßenseite "
                         "(ohne Blender, unabhängig vom Bildanteil)")
    si.add_argument("--anzahl", type=int, default=5, help="Häuser je Richtung und Straßenseite (Standard 5)")
    it = sub.add_parser("interior", help="Innenräume aus dem Grundriss bauen und rendern (wohnungen.yaml)")
    it.add_argument("project")
    it.add_argument("--top", default="top07")
    it.add_argument("--final", action="store_true")
    it.add_argument("--cam", default="", help="nur diese Kameras, z. B. top07_zimmer,top12_kueche")
    wk = sub.add_parser("walkthrough", help="Kamerafahrt durch eine Wohnung: Standbilder je Wegpunkt und Clay-Fahrt")
    wk.add_argument("project")
    wk.add_argument("--top", default="top35")
    wk.add_argument("--anim", action="store_true", help="zusätzlich Clay-Fahrt als MP4 (Bewegungsvorlage)")
    wk.add_argument("--no-stills", action="store_true")
    sc = sub.add_parser("schnitt", help="Schnittansicht: Gebäude geschossweise aufgeschnitten (wohnungen.yaml schnitt)")
    sc.add_argument("project")
    sc.add_argument("--preview", action="store_true")
    sc.add_argument("--zustand", default="", help="nur diese Zustände, z. B. s01,s04 (ohne Übersicht)")
    sc.add_argument("--nur-check", action="store_true", help="nur Kontrollbilder Plan und Wände, kein Rendering")
    ws = sub.add_parser("website", help="Statische Projekt-Website mit anklickbaren Wohnungen im Schnitt (website.yaml)")
    ws.add_argument("project")
    ws.add_argument("--hotspots", action="store_true", help="Hotspots aus der Schnittkamera neu berechnen (Blender, ohne Rendering)")
    st = sub.add_parser("studio", help="Web-Oberfläche immoviz Studio starten (http://127.0.0.1:8765)")
    st.add_argument("--host", default="127.0.0.1")
    st.add_argument("--port", type=int, default=8765)
    st.add_argument("--dry-run", action="store_true", help="Render-Queue führt nur Trockenläufe aus, kein Blender")
    st.add_argument("--projects", default=None,
                    help="Projektwurzel (Standard immoviz/projects oder Umgebungsvariable IMMOVIZ_PROJECTS)")
    a = ap.parse_args()
    if a.cmd == "studio":
        from studio.server import run
        run(a.host, a.port, a.dry_run, a.projects)
        return
    pdir = Path(a.project).resolve()

    if a.cmd == "geo":
        import yaml
        from lib.geo_wien import build_context
        cfg = yaml.safe_load((pdir / "project.yaml").read_text())
        ctx = build_context(cfg, pdir / "data" / "context.json")
        print(json.dumps({"gebaeude": len(ctx["buildings"]), "objekt_teile": len(ctx["hero"]),
                          "flaechen": len(ctx["surfaces"]), "baeume": len(ctx["trees"])}, ensure_ascii=False))
    elif a.cmd == "daecher":
        import yaml
        from lib import roofs as R
        cfg = yaml.safe_load((pdir / "project.yaml").read_text())
        ctx = json.loads((pdir / "data" / "context.json").read_text())
        t = time.time()
        out = R.fetch(cfg, ctx, pdir / "data" / "roofs.json", Path(a.cache).resolve() if a.cache else None,
                      ortho=not a.ohne_orthofoto)
        print(json.dumps({**out["stats"], "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))
    elif a.cmd == "fernsicht":
        import yaml
        from lib import fern as FE
        cfg = yaml.safe_load((pdir / "project.yaml").read_text())
        fp = pdir / "data" / "fern.json"
        fern = FE.fetch(cfg, fp) if (a.neu or not fp.exists()) else FE.load(pdir)
        res = {"hohe_baukoerperteile": len(fern["hoch"]), "markante_gebaeude": len(fern["markant"]),
               "gelaendepunkte": len(fern["gelaende"]),
               "kameras": {c: FE.im_sichtkegel(cfg, fern, c)[:a.anzahl] for c in a.cam.split(",")}}
        print(json.dumps(res, ensure_ascii=False, indent=1))
    elif a.cmd == "strasse":
        import os
        from lib import strasse as ST
        t = time.time()
        res = ST.pruefen(pdir)
        key = os.environ.get("GOOGLE_MAPS_API_KEY")      # nur im Speicher, wird nie geschrieben
        if key and not a.ohne_streetview:
            res["streetview"] = ST.streetview(pdir, key)
        else:
            res["streetview"] = "ausgelassen" if key else "ausgelassen, GOOGLE_MAPS_API_KEY nicht gesetzt"
        print(json.dumps({**res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))
    elif a.cmd == "render":
        from lib.build import render
        t = time.time()
        res = render(pdir, a.cam.split(","), a.light.split(","), a.preview, not a.no_blend)
        print(json.dumps({"renders": res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))
    elif a.cmd == "svcheck":
        _svcheck(pdir)
    elif a.cmd == "sichtbar":
        from lib.build import load_project, build_scene
        from lib import check as C
        cfg, ctx = load_project(pdir)
        pflicht = C.pflicht_haeuser(cfg, ctx, a.anzahl)
        if a.pflicht:
            print(json.dumps({"pflicht": pflicht, "ohne_fassade": sorted({r["bezug"] for r in pflicht if not r["modelliert"]})},
                             ensure_ascii=False, indent=1))
            return
        scene = build_scene(cfg, ctx)
        res = C.visible_buildings(scene, cfg, ctx, a.cam.split(","))
        # Pflichthäuser gelten unabhängig vom Bildanteil: in der Kameraliste markieren, fehlende Fassaden melden
        pb = {r["bezug"] for r in pflicht}
        for rows in res.values():
            for r in rows:
                r["pflicht"] = r["bezug"] in pb
        res["pflicht_ohne_fassade"] = sorted({r["bezug"] for r in pflicht if not r["modelliert"]})
        print(json.dumps(res, ensure_ascii=False, indent=1))
    elif a.cmd == "interior":
        _interior(a, pdir)
    elif a.cmd == "walkthrough":
        from lib.interior import render_walkthrough
        t = time.time()
        res = render_walkthrough(pdir, a.top, stills=not a.no_stills, anim=a.anim)
        print(json.dumps({"walkthrough": res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))
    elif a.cmd == "schnitt":
        from lib import section as SN
        t = time.time()
        if a.nur_check:
            import yaml
            from lib.build import load_project
            W = yaml.safe_load((pdir / "wohnungen.yaml").read_text())
            S = W["schnitt"]
            S["pdf"] = S.get("pdf") or W["plaene"][S.get("plan_von", "og1")]["pdf"]
            cfg, ctx = load_project(pdir)
            floors, fp = SN.load_floors(pdir, cfg, ctx, S)
            res = SN.write_checks(pdir, S, floors, fp)
        else:
            res = SN.render_section(pdir, a.preview, [z for z in a.zustand.split(",") if z])
        print(json.dumps({"schnitt": res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))
    elif a.cmd == "website":
        from lib import website as WS
        t = time.time()
        if a.hotspots:
            from lib import hotspots as HS
            print(json.dumps(HS.write(pdir), ensure_ascii=False, indent=1))
        res = WS.build_site(pdir)
        print(json.dumps({"website": res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))
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
