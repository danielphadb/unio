"""Zaehlpruefung gegen den Plan (immoviz.py pruefen, Abschnitt "Soll gegen Modell").

Hintergrund (REGELN.md P2, P3, U9): Kunde 18.11.2026 "bei Laternen und Gelaendern bitte genau den Plan beachten".
Die Quellen-Pruefung (lib/quellen.py) sagt nur, OB ein Element eine Quelle hat, nicht ob die ANZAHL stimmt. Dazu
steht in project.yaml eine Soll-Liste aus dem Plan; hier wird das Modell gezaehlt (gleiche Logik wie lib/build.py,
lib/neubau.py, lib/assets/leuchten.py, ohne Blender) und jede Abweichung ist ein Fehler (Ampel rot, Exit 1).

Block in project.yaml:

  soll:
    geschosse: {eg: [-1.0, 4.4], og1: [4.4, 7.95], ...}   # Geschoss nach Unterkante der Oeffnung (z, Meter)
    fassaden:                                               # nur Neubau: welche Eintraege eine Fassade bilden
      shg_hof: {gruppen: [nb_shg], linien: [[[x0, y0], [x1, y1]], ...], rahmen: null,
                dachfenster_bereich: [x0, y0, x1, y1], geschosse: {...}}   # geschosse je Fassade optional
    fenster:                                                # Oeffnungen je Fassade und Geschoss
      - {fassade: wimmergasse, geschoss: eg, anzahl: 12, quelle: "ANS"}
      - {fassade: shg_hof, geschoss: og2, anzahl: 9, typ: [fenster, tuer], quelle: "EIN S. 26"}
    gelaender:                                              # Gelaenderfelder je Fassade (Altbau/Dach) oder Gruppe (Neubau)
      - {fassade: wimmergasse, anzahl: 17, quelle: "ANS"}
      - {gruppe: nb_wue, anzahl: 30, quelle: "EIN S. 28"}
    leuchten:                                               # Strassenleuchten je Strassenabschnitt
      - {name: "Wimmergasse Nord", strang: wimmergasse, bereich: [-30, 1, 10, 200], anzahl: 4, quelle: "SV 05/2024"}

Gezaehlt wird:
- Fenster: Altbau je Achse und Reihe eine Oeffnung (Haustor, Schaufenster, Kastenfenster; Kellerfenster nur mit
  `typ: [keller]`), Dachwaende (`windows`, `axes_from`), Dachflaechenfenster in `slopes` (Typ dachfenster), Neubau
  `fassaden` (fenster, reihen; Typ fenster | tuer | hst | fix) und `dachfenster`. Loggien zaehlen nicht als Fenster.
- Gelaender: `dach.railings` je Feld (`felder`, sonst 1), Loggia-Gelaender (`rails`/`rail`) je Fassade;
  `neubau.gelaender` je Eintrag nach Gruppe (Gruppen `nb_umgebung*` sind Nachbarn und zaehlen nicht).
- Leuchten: Eintraege in `strassenleuchten` je Strang (`strang` als Text oder Liste; Kreuzungen zaehlen fuer beide).
"""
from __future__ import annotations

import math

STANDARD_TYPEN = ("fenster", "tuer", "hst", "fix", "haustor", "schaufenster", "kastenfenster", "dachfenster")


def _geschoss(z: float, geschosse: dict) -> str | None:
    for name, (z0, z1) in (geschosse or {}).items():
        if z0 <= z < z1:
            return name
    return None


def _auf_linie(p, a, b, tol: float) -> bool:
    (ax, ay), (bx, by) = a, b
    L = math.hypot(bx - ax, by - ay) or 1.0
    return abs((p[0] - ax) * (by - ay) - (p[1] - ay) * (bx - ax)) / L <= tol


def _neubau_fassade(eintrag: dict, fassaden: dict) -> list[str]:
    """Namen der Soll-Fassaden, zu denen ein Neubau-Fassadeneintrag gehoert."""
    treffer = []
    for name, sel in (fassaden or {}).items():
        if sel.get("gruppen") and eintrag.get("gruppe", "neubau") not in sel["gruppen"]:
            continue
        if (sel.get("rahmen") or None) != (eintrag.get("rahmen") or None):
            continue
        tol = float(sel.get("toleranz", 0.3))
        linien = sel.get("linien") or []
        if linien and not any(_auf_linie(eintrag["a"], *ln, tol) and _auf_linie(eintrag["b"], *ln, tol) for ln in linien):
            continue
        treffer.append(name)
    return treffer


def oeffnungen(cfg: dict) -> list[dict]:
    """Alle Oeffnungen des Modells: {fassade, z, typ, herkunft}."""
    out = []
    A = cfg.get("altbau") or {}
    rows = A.get("rows") or {}
    for fname, fs in (A.get("facades") or {}).items():
        axes = fs.get("axes") or []
        eg_map = {}
        for grp in fs.get("eg", []) or []:
            for ax in grp["axes"]:
                eg_map[ax] = grp
        for rname, r in rows.items():
            for i, _uc in enumerate(axes):
                typ, za = r["type"], r["z"]
                if rname == "eg" and i in eg_map:
                    g = eg_map[i]
                    typ = g["type"]
                    if "z" in g:
                        za = g["z"][0]
                    if g.get("keller") and typ != "haustor":
                        out.append({"fassade": fname, "z": 0.80, "typ": "keller", "geschoss_fest": rname,
                                    "herkunft": f"altbau.facades.{fname}.eg"})
                out.append({"fassade": fname, "z": za, "typ": typ, "geschoss_fest": rname,
                            "herkunft": f"altbau.rows.{rname}"})
    D = cfg.get("dach") or {}
    for k, w in enumerate(D.get("walls", []) or []):
        lgs = w.get("loggias", []) or []
        for x in w.get("windows", []) or []:
            out.append({"fassade": w["facade"], "z": x["z"][0], "typ": x.get("typ", "fenster"), "herkunft": f"dach.walls[{k}]"})
        if w.get("axes_from") == "altbau":
            u0, u1 = w["u"]
            for uc in A["facades"][w["facade"]]["axes"]:
                if u0 + 0.4 < uc < u1 - 0.4 and not any(lg["u"][0] - 0.3 < uc < lg["u"][1] + 0.3 for lg in lgs):
                    for za, _zb in w["rows"]:
                        out.append({"fassade": w["facade"], "z": za, "typ": "fenster", "herkunft": f"dach.walls[{k}]"})
    for k, s in enumerate(D.get("slopes", []) or []):
        for rw in s.get("roof_windows", []) or []:
            out.append({"fassade": s["facade"], "z": rw["z"][0], "typ": "dachfenster", "herkunft": f"dach.slopes[{k}]"})
    N = cfg.get("neubau") or {}
    S = cfg.get("soll") or {}
    for k, e in enumerate(N.get("fassaden", []) or []):
        namen = _neubau_fassade(e, S.get("fassaden"))
        if not namen:
            continue
        ops = []
        for o in e.get("fenster", []) or []:
            ops.append((o["z"][0], o.get("typ", "fenster")))
        for r in e.get("reihen", []) or []:
            for _u in r.get("u", []):
                ops.append((r["z"][0], r.get("typ", "fenster")))
        for name in namen:
            for z, typ in ops:
                out.append({"fassade": name, "z": z, "typ": typ, "herkunft": f"neubau.fassaden[{k}]"})
    for k, e in enumerate(N.get("dachfenster", []) or []):
        gr = e.get("gruppe", "neubau")
        x, y = e["pts"][0][0], e["pts"][0][1]
        for name, fs in (S.get("fassaden") or {}).items():
            b = fs.get("dachfenster_bereich")          # [x0, y0, x1, y1]: Dachflaechenfenster dieser Fassade
            if not b or (fs.get("gruppen") and gr not in fs["gruppen"]):
                continue
            if min(b[0], b[2]) <= x <= max(b[0], b[2]) and min(b[1], b[3]) <= y <= max(b[1], b[3]):
                out.append({"fassade": name, "z": min(p[2] for p in e["pts"]), "typ": "dachfenster",
                            "herkunft": f"neubau.dachfenster[{k}]"})
    return out


def gelaender(cfg: dict) -> dict:
    """Gelaenderfelder je Fassade (Altbau/Dach) bzw. je Gruppe (Neubau)."""
    n = {}
    D = cfg.get("dach") or {}
    for r in D.get("railings", []) or []:
        n[r["facade"]] = n.get(r["facade"], 0) + len(r.get("felder") or [r.get("u")])
    for w in D.get("walls", []) or []:
        for lg in w.get("loggias", []) or []:
            k = len(lg.get("rails") or ([lg["rail"]] if lg.get("rail") else []))
            n[w["facade"]] = n.get(w["facade"], 0) + k
    for g in ((cfg.get("neubau") or {}).get("gelaender") or []):
        gr = g.get("gruppe", "neubau")
        if str(gr).startswith("nb_umgebung"):
            continue
        n["gruppe:" + gr] = n.get("gruppe:" + gr, 0) + 1
    return n


def leuchten_im_abschnitt(cfg: dict, strang=None, bereich=None) -> int:
    """Leuchten eines Strangs, optional nur im Rechteck bereich [x0, y0, x1, y1] (Lage der Leuchte)."""
    n = 0
    for e in cfg.get("strassenleuchten") or []:
        st = e.get("strang")
        st = [st] if isinstance(st, str) else (st or [])
        if strang and strang not in st:
            continue
        p = e.get("leuchte") or e.get("pos") or [0.0, 0.0]
        if bereich:
            x0, y0, x1, y1 = bereich
            if not (min(x0, x1) <= p[0] <= max(x0, x1) and min(y0, y1) <= p[1] <= max(y0, y1)):
                continue
        n += 1
    return n


def pruefen(cfg: dict) -> dict:
    """Soll gegen Modell. Ergebnis {zeilen: [...], abweichungen: n, aktiv: bool}."""
    S = cfg.get("soll") or {}
    if not S:
        return {"aktiv": False, "zeilen": [], "abweichungen": 0}
    ops = oeffnungen(cfg)
    for o in ops:
        gs = ((S.get("fassaden") or {}).get(o["fassade"]) or {}).get("geschosse") or S.get("geschosse") or {}
        o["geschoss"] = _geschoss(o["z"], gs) if gs else o.get("geschoss_fest")
        if o["geschoss"] is None:
            o["geschoss"] = o.get("geschoss_fest")
    zeilen = []
    for s in S.get("fenster", []) or []:
        typen = s.get("typ") or [t for t in STANDARD_TYPEN]
        ist = [o for o in ops if o["fassade"] == s["fassade"] and o["geschoss"] == s["geschoss"] and o["typ"] in typen]
        zeilen.append({"klasse": "Fenster", "was": f"{s['fassade']} {s['geschoss']}", "soll": int(s["anzahl"]),
                       "ist": len(ist), "quelle": s.get("quelle", ""), "ok": len(ist) == int(s["anzahl"])})
    gl = gelaender(cfg)
    for s in S.get("gelaender", []) or []:
        key = s["fassade"] if s.get("fassade") else "gruppe:" + s["gruppe"]
        ist = gl.get(key, 0)
        zeilen.append({"klasse": "Gelaender", "was": key.replace("gruppe:", "Gruppe "), "soll": int(s["anzahl"]),
                       "ist": ist, "quelle": s.get("quelle", ""), "ok": ist == int(s["anzahl"])})
    # Gelaender ohne Soll-Zeile: im Modell, aber nicht im Plan gezaehlt (z. B. alte Eintraege)
    bekannt = {(s["fassade"] if s.get("fassade") else "gruppe:" + s["gruppe"]) for s in S.get("gelaender", []) or []}
    if S.get("gelaender"):
        for key, ist in gl.items():
            if key not in bekannt:
                zeilen.append({"klasse": "Gelaender", "was": key.replace("gruppe:", "Gruppe ") + " (ohne Soll)", "soll": 0,
                               "ist": ist, "quelle": "nicht im Plan gezaehlt", "ok": False})
    for s in S.get("leuchten", []) or []:
        ist = leuchten_im_abschnitt(cfg, s.get("strang"), s.get("bereich"))
        was = (s.get("name") or s.get("strang") or "alle")
        zeilen.append({"klasse": "Leuchten", "was": was, "soll": int(s["anzahl"]), "ist": ist,
                       "quelle": s.get("quelle", ""), "ok": ist == int(s["anzahl"])})
    return {"aktiv": True, "zeilen": zeilen, "abweichungen": sum(not z["ok"] for z in zeilen)}


def bericht_text(r: dict) -> list[str]:
    if not r.get("aktiv"):
        return ["", "Soll gegen Modell: kein Block `soll` in project.yaml (Plan-Soll-Liste fehlt)"]
    L = ["", f"Soll gegen Modell (Plan-Soll-Liste, {len(r['zeilen'])} Zeilen, {r['abweichungen']} Abweichungen):"]
    for z in r["zeilen"]:
        mark = "ok    " if z["ok"] else "FEHLER"
        L.append(f"  {mark} {z['klasse']:10s} {z['was']:34s} Soll {z['soll']:3d}  Ist {z['ist']:3d}  [{z['quelle'][:60]}]")
    return L
