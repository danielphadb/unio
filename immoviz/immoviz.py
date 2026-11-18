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
  python immoviz.py kameramatch projects/noma-shg13 --bild vorlage.jpg --punkte punkte.yaml --kamera hof_fin
  GOOGLE_MAPS_API_KEY=... python immoviz.py referenz projects/wimmergasse-20 --kamera drohne  (Abgleich gegen Google 3D, nur intern)
  python immoviz.py render  projects/wimmergasse-20 --cam ecke --light golden_hour --ebenen   (plus Masken, Tiefe, Schutzmaske)
  python immoviz.py schutz  --render <render.png> --ki <veredelt.jpg> --ebenen <ordner>       (Gebäude aus Blender zurück)
  python immoviz.py grading --bild <bild.jpg> --leitbild <referenz.jpg> --staerke 0.6         (Look an Leitbild)
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


def _autos_pruefen(a) -> int:
    """Baut die Szene (ohne Rendern) und prueft die Bibliotheksautos. Exit 1 bei Befunden."""
    from lib import build as B
    from lib.assets import autos_bibliothek as AB
    pdir = Path(a.project).resolve()
    cfg, ctx = B.load_project(pdir)
    scene = B.build_scene(cfg, ctx)
    res = AB.pruefen(scene, B.LAST_TERRAIN)
    AB.bericht_schreiben(pdir, res)
    print(json.dumps({k: v for k, v in res.items() if k not in ("befunde", "lage", "massstab")}, ensure_ascii=False, indent=1))
    return 1 if res["befunde_anzahl"] else 0


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
    lc = sub.add_parser("leuchten", help="Leuchten-Inventar (strassenleuchten) als Draufsicht über dem Orthofoto prüfen "
                                         "(renders/check/leuchten_abgleich.jpg und .md)")
    lc.add_argument("project")
    lc.add_argument("--m-je-pixel", type=float, default=0.12, help="Auflösung des Prüfbilds (Standard 0,12 m)")
    al = sub.add_parser("autos-laden", help="Realistische Automodelle (BlenderKit, kostenlos) laut "
                                            "lib/assets/autos_bibliothek.yaml nach immoviz/assets/autos/ laden")
    al.add_argument("--nur", default=None, help="nur diese Modelle (Anfang der id), mit Komma")
    ab = sub.add_parser("autos-bibliothek", help="assets/autos/bibliothek.blend bauen: Front +X, echte Länge, "
                                                 "eigener Lack, ohne Logos")
    ab.add_argument("--nur", default=None, help="nur diese Modelle (Anfang der id), mit Komma")
    aup = sub.add_parser("autos-pruefen", help="Autos der Szene pruefen: Radaufstand je Rad gegen Fahrbahn/Gehsteig, "
                                              "Bucht, Ueberschneidungen, Hindernisse (renders/check/autos_pruefung.*)")
    aup.add_argument("project")
    tx = sub.add_parser("texturen", help="Optionale CC0-Texturen (Poly Haven) nach immoviz/assets/texturen/ laden "
                                         "(gitignored, Quelle und Lizenz in immoviz/assets/LIZENZEN.md)")
    tx.add_argument("--aufloesung", default="2k")
    r = sub.add_parser("render", help="Szene bauen und rendern")
    r.add_argument("project")
    r.add_argument("--cam", default="ecke")
    r.add_argument("--light", default="golden_hour")
    r.add_argument("--preview", action="store_true")
    r.add_argument("--no-blend", action="store_true")
    r.add_argument("--res", default=None, help="Auflösung BxH statt project.yaml, z. B. 3840x2560")
    r.add_argument("--samples", type=int, default=None, help="Samples statt project.yaml")
    r.add_argument("--out", default=None, help="Unterordner von renders/ für die Bilder, z. B. mac_test")
    r.add_argument("--ebenen", action="store_true", help="zusätzlich Render-Ebenen: Klassenmasken, Tiefe, Normalen, "
                                                         "Kanten, Schutzmaske (renders/<out>/<kamera>_<licht>_ebenen/)")
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
    km = sub.add_parser("kameramatch", help="Kamera einer Referenzvisualisierung aus Punktpaaren lösen (Bildpixel <-> "
                                            "lokale 3D-Koordinaten), in project.yaml eintragen und Überlagerung rendern")
    km.add_argument("project")
    km.add_argument("--bild", required=True, help="Referenzvisualisierung (bleibt außerhalb des Repos)")
    km.add_argument("--punkte", required=True, help="YAML mit Punktpaaren {name, px: [u, v], xyz: [x, y, z], rahmen}")
    km.add_argument("--kamera", required=True, help="Name der Kamera in project.yaml (wird angelegt oder ersetzt)")
    km.add_argument("--light", default=None, help="Licht für die Modellvorschau (Standard: erstes Licht)")
    km.add_argument("--breite", type=int, default=1200, help="Breite der Modellvorschau in Pixel")
    km.add_argument("--samples", type=int, default=None)
    km.add_argument("--out", default=None, help="Ordner für Modellbild und Überlagerung (Standard renders/kameramatch)")
    km.add_argument("--nur-loesen", action="store_true", help="nur Kamera lösen, nichts schreiben, nicht rendern")
    km.add_argument("--ohne-render", action="store_true", help="Kamera schreiben, aber keine Überlagerung rendern")
    km.add_argument("--nur-render", action="store_true", help="Kamera aus project.yaml nehmen, nur Überlagerung neu")
    km.add_argument("--maske", default=None, help="Graustufenmaske (weiß = Bereich) für die Kantenabweichung")
    rf = sub.add_parser("referenz", help="Kamera gegen Google Photorealistic 3D Tiles abgleichen (nur interne Referenz, "
                                         "Schluessel in GOOGLE_MAPS_API_KEY): Abgleichbild und Befund je Gebaeude")
    rf.add_argument("project", nargs="?", default=None)
    rf.add_argument("--projekt", default=None, help="Projektordner (statt des Positionsarguments)")
    rf.add_argument("--kamera", default="drohne", help="Kamera(s) aus project.yaml, mit Komma getrennt")
    rf.add_argument("--licht", default="dunst_hell", help="Licht der Modellvorschau")
    rf.add_argument("--samples", type=int, default=24)
    rf.add_argument("--nur-modell", action="store_true", help="vorhandene Google-Bilder wiederverwenden (schnelle Iteration)")
    rf.add_argument("--google-neu", action="store_true", help="Google-Ansichten neu rendern")
    rf.add_argument("--kalibrieren", action="store_true", help="Höhe und Lage der 3D-Kacheln neu bestimmen")
    rf.add_argument("--sse", type=float, default=4.0, help="Detailstufe der Kacheln (Bildschirmfehler in Pixel, kleiner = feiner)")
    rf.add_argument("--tag", default="", help="Zusatz für Dateinamen, z. B. _vorher")
    rf.add_argument("--test-kamera", action="append", default=[],
                    help="zusätzliche Probekamera name:x,y,z:x,y,z:lens (Standpunkt, Ziel, Brennweite), nicht in project.yaml")
    st = sub.add_parser("studio", help="Web-Oberfläche immoviz Studio starten (http://127.0.0.1:8765)")
    st.add_argument("--host", default="127.0.0.1")
    st.add_argument("--port", type=int, default=8765)
    st.add_argument("--dry-run", action="store_true", help="Render-Queue führt nur Trockenläufe aus, kein Blender")
    st.add_argument("--projects", default=None,
                    help="Projektwurzel (Standard immoviz/projects oder Umgebungsvariable IMMOVIZ_PROJECTS)")
    # Korrekturschleife (REGELN.md): Quellen, Freigabe-Gate, Prompt-Regeln, Nachkontrolle nach der Veredelung
    pq = sub.add_parser("pruefen", help="Quellen-Prüfung: jedes Geländer, Trog, Weg, Fenster, Stuck, Baum, Nachbar, "
                                        "Farbe braucht eine Quelle (Feld quelle oder [Kürzel] im Kommentar); ANN je Bild")
    pq.add_argument("--projekt", required=True)
    pq.add_argument("--json", action="store_true", help="vollständiges Ergebnis als JSON")
    pq.add_argument("--streng", action="store_true", help="Kommentar zählt nicht, nur das Feld quelle (neue Projekte)")
    nk = sub.add_parser("nachkontrolle", help="Veredeltes Bild gegen die Blender-Vorschau: neue/fehlende Öffnungen, "
                                              "Kanten, Ausschnitt; Markierungsbild und Score")
    nk.add_argument("--vorschau", required=True)
    nk.add_argument("--veredelt", required=True, nargs="+", help="ein Bild oder mehrere Varianten (Rangfolge)")
    nk.add_argument("--aus", default=None, help="Markierungsbild (bei Varianten: Ordner); Standard neben dem Bild")
    nk.add_argument("--schwelle", type=float, default=None, help="Score ab dem 'zur Pruefung' gilt (Standard 400)")
    nk.add_argument("--ebenen", default=None, help="Ordner der Render-Ebenen derselben Kamera (render --ebenen): "
                                                  "Schutzzonen Fenster/Leuchten/Geländer getrennt, Fensterzahl je Fassade")
    sz = sub.add_parser("schutz", help="Schutz-Kompositing: KI-Bild ausrichten, Farbe übertragen, Gebäude und "
                                       "Planelemente aus dem Render zurücksetzen (Schutzmaske aus render --ebenen)")
    sz.add_argument("--render", required=True, help="Blender-Bild (Beauty) zu den Ebenen")
    sz.add_argument("--ki", required=True, help="veredeltes Bild")
    sz.add_argument("--ebenen", required=True, help="Ordner <kamera>_<licht>_ebenen")
    sz.add_argument("--out", default=None, help="Ergebnis (Standard <ki>_schutz.jpg); Prüfbild und JSON daneben")
    sz.add_argument("--klassen", default=None, help="geschützte Klassen statt ebenen.json, mit Komma")
    sz.add_argument("--ohne", default=None, help="Klassen aus dem Schutz nehmen, z. B. autos (nur mit Begründung, "
                                                 "REGELN.md V6)")
    sz.add_argument("--farbe", type=float, default=1.0, help="Stärke der Farbübertragung KI auf Render (0 bis 1)")
    sz.add_argument("--ausrichtung", choices=["aehnlich", "affin", "homographie"], default="homographie")
    sz.add_argument("--autos", choices=["projekt", "beide", "modelle", "ki"], default="projekt",
                    help="Autos: projekt = wie project.yaml schutz; modelle = Blender-Autos geschuetzt (gleich in jedem "
                         "Bild); ki = Autos aus dem KI-Bild; beide = zwei Fassungen _modelle und _ki plus Vergleich")
    sz.add_argument("--ohne-vordergrund", action="store_true", help="KI-Personen und -Autos vor der Fassade nicht "
                                                                   "erhalten (alles Geschützte aus dem Render)")
    gd = sub.add_parser("grading", help="Farbangleich an Leitbilder (Lab-Statistik, Histogramm begrenzt) plus "
                                        "Vignette, Glow, Filmkorn")
    gd.add_argument("--bild", required=True)
    gd.add_argument("--leitbild", nargs="*", default=None, help="Referenzbild(er), lokal, nie im Repo; ohne Angabe "
                                                               "aus project.yaml look.leitbilder (--projekt)")
    gd.add_argument("--projekt", default=None, help="Projektordner für look: in project.yaml")
    gd.add_argument("--staerke", type=float, default=None, help="0 bis 1 (Standard look.staerke bzw. 0,6)")
    gd.add_argument("--vignette", type=float, default=None)
    gd.add_argument("--glow", type=float, default=None)
    gd.add_argument("--korn", type=float, default=None)
    gd.add_argument("--maske", default=None, help="optional: Schutzmaske (schutz.png), dort nur halbe Stärke")
    gd.add_argument("--out", default=None, help="Ergebnis (Standard <bild>_grading.jpg); Prüfbild und JSON daneben")
    fg = sub.add_parser("freigabe", help="Modellfreigabe je Kamera (freigabe.yaml): anzeigen, setzen, vor der "
                                         "Veredelung prüfen")
    fg.add_argument("--projekt", required=True)
    fg.add_argument("--cam", default="", help="Kamera(s), mit Komma getrennt (innen <wohnung>_<kamera>)")
    fg.add_argument("--setzen", choices=["ja", "nein"], default=None)
    fg.add_argument("--von", default="", help="wer freigibt (Pflicht bei --setzen ja)")
    fg.add_argument("--notiz", default="")
    fg.add_argument("--pruefbogen", default="", help="Pfad zum Prüfbogen, der dem Kunden vorlag")
    fg.add_argument("--pruefen", action="store_true", help="Gate wie vor der Veredelung (Exit 1, wenn gesperrt)")
    fg.add_argument("--trockenlauf", action="store_true")
    fg.add_argument("--force", action="store_true", help="Sperre bewusst übergehen (wird ausgegeben)")
    pr = sub.add_parser("prompt", help="Vor einem Higgsfield-Auftrag (MCP oder Studio): Freigabe prüfen und den "
                                       "Regelblock aus higgsfield/prompt_regeln.yaml ausgeben")
    pr.add_argument("--projekt", required=True)
    pr.add_argument("--cam", required=True, help="Kamera (innen <wohnung>_<kamera>)")
    pr.add_argument("--art", choices=["aussen", "innen"], default=None, help="Standard: innen, wenn die Kamera "
                                                                              "aus wohnungen.yaml stammt")
    pr.add_argument("--force", action="store_true")
    a = ap.parse_args()
    if a.cmd == "studio":
        from studio.server import run
        run(a.host, a.port, a.dry_run, a.projects)
        return
    if a.cmd == "referenz":
        _referenz(a)
        return
    if a.cmd == "schutz":
        from lib import kompositing as KO
        sys.exit(KO.main_cli(a.render, a.ki, a.ebenen, a.out, a.klassen, a.ohne, a.farbe, a.ausrichtung,
                             not a.ohne_vordergrund, a.autos))
    if a.cmd == "grading":
        from lib import grading as GR
        sys.exit(GR.main_cli(a))
    if a.cmd == "autos-laden":
        from lib.assets import autos_bibliothek as AB
        print(json.dumps(AB.laden(a.nur.split(",") if a.nur else None), ensure_ascii=False, indent=1))
        return
    if a.cmd == "autos-bibliothek":
        from lib.assets import autos_bibliothek as AB
        print(json.dumps(AB.bibliothek_bauen(a.nur.split(",") if a.nur else None), ensure_ascii=False, indent=1))
        return
    if a.cmd == "autos-pruefen":
        sys.exit(_autos_pruefen(a))
    if a.cmd == "texturen":
        from lib.assets import texturen as TX
        print(json.dumps({"geladen": TX.laden(a.aufloesung), "ordner": str(TX.ORDNER)}, ensure_ascii=False, indent=1))
        return
    if a.cmd in ("pruefen", "nachkontrolle", "freigabe", "prompt"):
        sys.exit(_korrekturschleife(a))
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
    elif a.cmd == "leuchten":
        from lib.assets import leuchten as LE
        print(json.dumps(LE.pruefbild(pdir, a.m_je_pixel), ensure_ascii=False, indent=1))
    elif a.cmd == "render":
        from lib.build import render
        t = time.time()
        aufl = tuple(int(v) for v in a.res.lower().split("x")) if a.res else None
        res = render(pdir, a.cam.split(","), a.light.split(","), a.preview, not a.no_blend,
                     res=aufl, samples=a.samples, out_sub=a.out, ebenen=a.ebenen)
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
    elif a.cmd == "kameramatch":
        _kameramatch(a, pdir)
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


def _referenz(a):
    """Abgleich gegen die 3D-Referenz (lib/referenz.py). Schlüssel nur aus der Umgebung."""
    from lib import referenz as RF
    pdir = Path(a.projekt or a.project or ".").resolve()
    extra = {}
    for spec in a.test_kamera:
        n, pos, ziel, lens = spec.split(":")
        extra[n] = {"pos": [float(v) for v in pos.split(",")], "target": [float(v) for v in ziel.split(",")],
                    "lens": float(lens), "vertical": True}
    cams = [c for c in a.kamera.split(",") if c] + [n for n in extra if n not in a.kamera.split(",")]
    t = time.time()
    res = RF.abgleich(pdir, cams, google_neu=a.google_neu, nur_modell=a.nur_modell, kalib_neu=a.kalibrieren,
                      licht=a.licht, sse=a.sse, extra_cams=extra, tag=a.tag, samples=a.samples)
    print(json.dumps({**res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1))


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


def _kameramatch(a, pdir):
    """Kamera aus Punktpaaren lösen, eintragen, Modell rendern und mit der Vorlage überlagern."""
    import yaml
    from PIL import Image
    from lib import kameramatch as KM
    cfg = yaml.safe_load((pdir / "project.yaml").read_text())
    bild = Path(a.bild).resolve()
    W, H = Image.open(bild).size
    P = KM.lade_punkte(Path(a.punkte), cfg)
    gw = P.get("groesse") or [W, H]
    for p in P["punkte"]:          # Pixel in der Messgröße der Punktdatei auf die Bildgröße umrechnen
        p["px"] = [p["px"][0] * W / gw[0], p["px"][1] * W / gw[0]]
    res = {"kamera": a.kamera, "bild": bild.name, "groesse": [W, H], "punkte": len(P["punkte"])}
    if a.nur_render:
        c = cfg["cameras"][a.kamera]
        import math as _m
        dx, dy = c["target"][0] - c["pos"][0], c["target"][1] - c["pos"][1]
        par = {"pos": c["pos"], "yaw": _m.atan2(-dx, dy), "lens": c["lens"], "shift": c.get("shift", [0, 0])}
    else:
        par = KM.loese(P["punkte"], W, H, pos_fest=P.get("pos_fest"))
        frei = KM.loese(P["punkte"], W, H, frei=True, pos_fest=P.get("pos_fest"))
        rows_f = KM.fehler(frei, [p for p in P["punkte"] if not p["kontrolle"]], W, H)
        res["frei_mit_kippung"] = {"mittel_px": round(sum(r["fehler_px"] for r in rows_f) / len(rows_f), 2),
                                   "kippung_grad": round(_deg(frei["pitch"]), 2), "roll_grad": round(_deg(frei["roll"]), 2)}
    rows = KM.fehler(par, P["punkte"], W, H)
    akt = [r for r in rows if not r["kontrolle"]]
    mittel = sum(r["fehler_px"] for r in akt) / len(akt)
    res.update({"mittel_px": round(mittel, 2), "max_px": max(r["fehler_px"] for r in akt),
                "mittel_prozent_breite": round(100 * mittel / W, 2), "gematcht": mittel < KM.SCHWELLE * W,
                "kamera_yaml": KM.kamera_eintrag(par, W, H), "fehler_je_punkt": rows})
    ctxp = pdir / "data" / "context.json"
    if not a.nur_render:
        cl = KM.clip_start(par, json.loads(ctxp.read_text()) if ctxp.exists() else None, W, H)
        if cl:
            res["kamera_yaml"]["clip_start"] = cl
            res["hinweis"] = f"Standpunkt liegt in einem Nachbarbaukoerper, clip_start {cl} m"
    if not (a.nur_loesen or a.nur_render):
        kom = (f"kameramatch {bild.name}, {len(akt)} Punkte, Fehler {mittel:.1f} px = {100 * mittel / W:.2f} % "
               f"Bildbreite{'' if res['gematcht'] else ' NICHT gematcht'}")
        KM.schreibe_kamera(pdir / "project.yaml", a.kamera, res["kamera_yaml"], kom)
    out = Path(a.out).resolve() if a.out else pdir / "renders" / "kameramatch"
    if not a.nur_loesen and ctxp.exists():      # Drahtmodell der Baukoerper ueber der Vorlage (ohne Blender)
        out.mkdir(parents=True, exist_ok=True)
        res["drahtmodell"] = str(KM.drahtmodell(cfg, json.loads(ctxp.read_text()), par, bild,
                                                out / f"{a.kamera}_drahtmodell.png"))
    if not (a.nur_loesen or a.ohne_render):
        out.mkdir(parents=True, exist_ok=True)
        light = a.light or next(iter(cfg["lights"]))
        mp = KM.render_modell(pdir, a.kamera, light, a.breite, a.samples or cfg["render"].get("preview_samples", 32),
                              out / f"{a.kamera}_modell.png")
        res["modell"] = str(mp)
        res["ueberlagerung"] = str(out / f"{a.kamera}_ueberlagerung.png")
        nm = None
        if ctxp.exists():
            from PIL import Image as _I
            nm = KM.nachbar_maske(cfg, json.loads(ctxp.read_text()), par, W, H, _I.open(mp).width)
        res["kantenabweichung"] = KM.ueberlagerung(bild, mp, Path(res["ueberlagerung"]), rows, maske_path=a.maske,
                                                   maske=nm)
    print(json.dumps(res, ensure_ascii=False, indent=1))


def _deg(r):
    import math as _m
    return _m.degrees(r)


def _interior(a, pdir):
    from lib.interior import render_apartments
    t = time.time()
    res = render_apartments(pdir, a.top.split(","), not a.final, [c for c in a.cam.split(",") if c])
    print(json.dumps({"renders": res, "sekunden": round(time.time() - t)}, ensure_ascii=False, indent=1, default=str))


def _korrekturschleife(a) -> int:
    """Befehle pruefen, nachkontrolle, freigabe, prompt (REGELN.md). Rueckgabe = Exit-Code (0 ok, 1 Befund)."""
    if a.cmd == "pruefen":
        from lib import quellen as Q
        return Q.main_cli(a.projekt, a.json, a.streng)
    if a.cmd == "nachkontrolle":
        from lib import nachkontrolle as NK
        return NK.main_cli(a.vorschau, a.veredelt, a.aus, a.schwelle if a.schwelle is not None else NK.SCHWELLE,
                           a.ebenen)
    from lib import freigabe as FG
    pdir = Path(a.projekt).resolve()
    if a.cmd == "freigabe":
        kams = [k for k in a.cam.split(",") if k]
        if a.setzen:
            if a.setzen == "ja" and not a.von:
                sys.exit("--von fehlt: wer gibt frei (z. B. \"Kunde, Mail 16.11.\")")
            FG.setzen(pdir, kams, a.setzen == "ja", a.von, a.notiz, a.pruefbogen)
        if a.pruefen:
            res, code = [], 0
            for k in kams or FG.kameras(pdir):
                try:
                    res.append(FG.pruefen(pdir, k, a.trockenlauf, a.force))
                except FG.NichtFreigegeben as e:
                    res.append({"kamera": k, "erlaubt": False, "grund": str(e)})
                    code = 1
            print(json.dumps(res, ensure_ascii=False, indent=1))
            return code
        print(json.dumps(FG.uebersicht(pdir), ensure_ascii=False, indent=1))
        return 0
    # prompt: Gate plus Regelblock (fuer Auftraege ueber MCP, die nicht durch das Studio laufen)
    art = a.art or ("aussen" if a.cam in _aussen_kameras(pdir) else "innen")
    try:
        gate = FG.pruefen(pdir, a.cam, False, a.force)
    except FG.NichtFreigegeben as e:
        print(json.dumps({"kamera": a.cam, "erlaubt": False, "grund": str(e)}, ensure_ascii=False, indent=1))
        return 1
    R = FG.prompt_regeln(pdir, a.cam, art)
    print(json.dumps({"kamera": a.cam, "art": art, "freigabe": gate.get("warnung") or gate.get("grund"),
                      "warnungen": R["warnungen"], "regeln": R["regeln"]}, ensure_ascii=False, indent=1))
    print("\n--- an den Prompt anhängen ---\n" + R["text"])
    return 0


def _aussen_kameras(pdir: Path) -> list[str]:
    import yaml
    try:
        return list((yaml.safe_load((pdir / "project.yaml").read_text(encoding="utf-8")) or {}).get("cameras") or {})
    except OSError:
        return []


if __name__ == "__main__":
    main()
