"""Fernsicht-Prüfung nach REGELN.md U12: welche Wiener Landmarken liegen im Bild welcher Außenkamera, wo im Bild,
wie weit weg, und wie stehen sie im Modell (fern.json, fern_spitzen, hochhaeuser.formen).

Lage: Die Landmarken sind in WGS84 gelistet (lib/landmarken_wien.yaml). Ohne Projektionsbibliothek wird über einen
Ankerpunkt umgerechnet, dessen Lage in beiden Systemen bekannt ist (Standard: Stephansdom, OGD-Bezug 169932 aus
fern.json). Genauigkeit rund 20 bis 50 m auf einige Kilometer, reicht für die Frage "im Bild oder nicht, wo im Bild".
Sichtbarkeit hinter Nachbarhäusern prüft der Befehl nicht (dafür Probe-Render oder Objekt-ID-Ebene).
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import yaml

M_PRO_GRAD_LAT = 111200.0
SENSOR_MM = 36.0


def _liste() -> list[dict]:
    return yaml.safe_load((Path(__file__).parent / "landmarken_wien.yaml").read_text(encoding="utf-8"))


def _anker(fern: dict, bezug: str) -> dict | None:
    for m in fern.get("markant", []):
        if str(m.get("bezug")) == bezug:
            return m
    return None


def _innen_kameras(pdir: Path) -> dict:
    """Innenkameras aus wohnungen.yaml mit Fensterblick (Wohnungen im Projektrahmen, ohne eigene Drehung, ab 10 m)."""
    p = pdir / "wohnungen.yaml"
    if not p.exists():
        return {}
    W = (yaml.safe_load(p.read_text(encoding="utf-8")) or {}).get("wohnungen") or {}
    out = {}
    for wn, w in W.items():
        if not isinstance(w, dict) or "drehung_grad" in w or float(w.get("floor_z") or 0) < 10.0:
            continue
        for cn, c in (w.get("kameras") or {}).items():
            if isinstance(c, dict) and len(c.get("pos") or []) == 2 and len(c.get("target") or []) == 2:
                z = float(w["floor_z"]) + float(c.get("h", 1.5))
                out[f"{wn}/{cn}"] = {"pos": [*c["pos"], z], "target": [*c["target"], z], "lens": c.get("lens", 18)}
    return out


def pruefen(pdir: Path, kameras: list[str] | None = None, anker_bezug: str = "169932",
            anker_latlon: tuple[float, float] = (48.20849, 16.37315), innen: bool = False) -> dict:
    cfg = yaml.safe_load((pdir / "project.yaml").read_text(encoding="utf-8"))
    site = cfg["site"]
    ox, oy = site["origin_gk"]
    a = math.radians(site["x_axis_deg"])
    c, s = math.cos(a), math.sin(a)
    fern_p = pdir / "data" / "fern.json"
    if not fern_p.exists():
        raise SystemExit(f"{fern_p} fehlt: zuerst `immoviz.py fernsicht {pdir}`")
    fern = json.loads(fern_p.read_text())
    anker = _anker(fern, anker_bezug)
    if anker is None:
        raise SystemExit(f"Anker {anker_bezug} nicht in fern.json (markant); anderen Anker mit --anker angeben")

    def gk(x, y):
        return ox + x * c - y * s, oy + x * s + y * c

    ax, ay = gk(*anker["pos"])
    m_lon = M_PRO_GRAD_LAT * math.cos(math.radians(anker_latlon[0]))

    def lokal(lat, lon):
        X = ax + (lon - anker_latlon[1]) * m_lon
        Y = ay + (lat - anker_latlon[0]) * M_PRO_GRAD_LAT
        dx, dy = X - ox, Y - oy
        return dx * c + dy * s, -dx * s + dy * c

    objekte = list(fern.get("markant", []))
    for h in fern.get("hoch", []):
        p = h["poly"]
        objekte.append({"bezug": h["bezug"], "pos": [sum(q[0] for q in p) / len(p), sum(q[1] for q in p) / len(p)],
                        "top": h["z1"], "name": None})
    gebaut = {str(e.get("bezug")): "fern_spitzen" for e in cfg.get("fern_spitzen") or []}
    for f in (cfg.get("hochhaeuser") or {}).get("formen") or []:
        gebaut[str(f.get("bezug"))] = f"hochhaeuser.formen ({f.get('name')})"
        if f.get("pos"):
            top = max((t.get("z") or [0, 0])[1] for t in f.get("teile") or [{"z": [0, 0]}])
            objekte.append({"bezug": f.get("bezug"), "pos": f["pos"][:2], "top": top, "name": f.get("name")})

    cams = dict(cfg.get("cameras") or {})
    innen_cams = _innen_kameras(pdir) if innen else {}
    cams.update(innen_cams)
    # Standard: nur erhöhte Außenkameras (ab 10 m), von der Straße aus verdecken die Nachbarhäuser die Fernsicht
    namen = kameras or [k for k, v in cams.items()
                        if isinstance(v, dict) and len(v.get("pos", [])) == 3 and v["pos"][2] >= 10.0
                        and (innen or k not in innen_cams)]
    lm = _liste()
    out = {"anker": anker_bezug, "kameras": {}}
    for cn in namen:
        cam = cams.get(cn)
        if not cam or len(cam.get("pos", [])) != 3:
            continue
        px, py, pz = cam["pos"]
        tx, ty = cam["target"][0], cam["target"][1]
        fmt = cam.get("format") or [3, 2]
        breite = SENSOR_MM if fmt[0] >= fmt[1] else SENSOR_MM * fmt[0] / fmt[1]
        halb = math.degrees(math.atan(breite / 2 / cam.get("lens", 35)))
        a0 = math.atan2(tx - px, ty - py)
        zeilen = []
        for L in lm:
            x, y = lokal(L["lat"], L["lon"])
            r = math.hypot(x - px, y - py)
            da = math.degrees((math.atan2(x - px, y - py) - a0 + math.pi) % (2 * math.pi) - math.pi)
            if abs(da) > halb:
                continue
            u = 0.5 + math.tan(math.radians(da)) * cam.get("lens", 35) / breite
            best = min(objekte, key=lambda m: math.hypot(m["pos"][0] - x, m["pos"][1] - y))
            ab = math.hypot(best["pos"][0] - x, best["pos"][1] - y)
            im_modell = (f"{best['bezug']} top {best['top']:.0f}" + (f", {gebaut[str(best['bezug'])]}"
                         if str(best["bezug"]) in gebaut else ", Prisma")) if ab < 120 else "fehlt"
            zeilen.append({"name": L["name"], "x": round(u, 2), "entfernung_m": round(r),
                           "hoehe": L.get("hoehe"), "im_modell": im_modell, "form_soll": L.get("form")})
        out["kameras"][cn] = sorted(zeilen, key=lambda z: z["x"])
    return out


def text(res: dict) -> str:
    z = []
    for cn, rows in res["kameras"].items():
        z.append(f"== {cn}: {len(rows)} Landmarken im Bildwinkel (Verdeckung nicht geprüft)")
        for r in rows:
            z.append(f"  x {r['x']:.2f}  {r['name']:<24} {r['entfernung_m']:>6} m  Modell: {r['im_modell']}")
            z.append(f"         soll: {r['form_soll']}")
    return "\n".join(z)
