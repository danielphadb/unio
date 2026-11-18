"""Quellen-Pruefung (immoviz.py pruefen): jedes pruefrelevante Element braucht eine Quelle.

Hintergrund (REGELN.md): Die Korrekturrunden bei Noma und Wimmergasse gingen fast alle auf Elemente ohne
Planbasis zurueck: Gelaender und Pflanztrog ohne Plan, Weg ohne Rampe, Fensterraster geschaetzt, Stuck erfunden,
Baeume erfunden, Nachbarfarben aus Visualisierungen, Farben aus beleuchteten Ansichten gemessen.

Je Element aus den Klassen unten wird gesucht (in dieser Reihenfolge):
  1. Feld `quelle` im Element, z. B. {..., quelle: "EIN S. 16"} oder quelle: "ANN Raster 5 m"   -> ok
  2. Quellen-Kuerzel in eckigen Klammern im Kommentar am Ende einer Zeile des Elements          -> warnung (Altbestand)
  3. Quellen-Kuerzel im Kommentarblock direkt darueber oder im letzten Kommentarblock derselben Liste
     (ein Kommentar "# Runde 3: ... [Google 3D]" gilt fuer die folgenden Eintraege bis zum naechsten Kommentar)
                                                                                                  -> warnung
  4. nichts                                                                                       -> fehlt
Dazu: Anteil Annahmen (ANN) je Kamera, Rang der besten Quelle laut Quellen-Rangfolge, Hinweise (Gelaender, Troege,
Wege, Fenster und Stuck ohne Planquelle; Farbe aus Pixeln gemessen statt Vektorfarbe/Farbcode).
"""
from __future__ import annotations

import io
import json
import math
import re
from pathlib import Path

from ruamel.yaml import YAML

# ------------------------------------------------------------------ Quellen-Rangfolge (REGELN.md, Abschnitt 1)
# 1 Einreichplan, Polier-/Verkaufsplan, Vermessung, Ansichten, BAB, Farbkonzept, Interior-Plan des Planers
# 2 Stadt Wien OGD: Orthofoto, Dachmodell LOD2, Baukoerpermodell, Baumkataster, Verkehrsflaechen
# 3 Fotos und Angaben des Kunden
# 4 3D-Referenzen Google/Apple, Street View (nur intern ansehen, nie ins Bild)
# 5 Visualisierungen, Vorlagen, Stimmungsbilder (kuenstlerisch, zeigen oft Falsches)
# 9 Annahme
RANG = [
    (1, r"^(EIN|EINR|VP|POL|VERM|ANS|GR|NWG|BAB(-[A-Z]+)?|BEM|FK|INT\d?|PLAN|SCHNITT|DWG|S\.|Farbkonzept|RAL|NCS|"
        r"Caparol|Baumit)\b"),
    (2, r"^(OGD|BKM|LOD2|Orthofoto|Ortho|Kataster|Baumkataster|ADR|Adressregister|FMZK|Luftbild)"),
    (3, r"^(Kunde|KUNDE|Foto|FOTO|Hoffoto|Chatbild)"),
    (4, r"^(Google|Apple|SV|Street ?View|G3D|3D|Schr(ae|ä)gluftbild)"),
    (5, r"^(VIS|Vorlage|Visu|Hof_fin|Stimmung|Mood)"),
    (9, r"^(ANN|Annahme|geschaetzt|geschätzt|Regelwert)"),
]
_RANG_RE = [(r, re.compile(p)) for r, p in RANG]
RANG_NAME = {1: "Plan", 2: "OGD", 3: "Kunde", 4: "3D-Referenz", 5: "Visualisierung", 9: "Annahme"}
# Mindestrang je Klasse: schlechter = Hinweis (z. B. Gelaender nur aus Plan, Baeume aus OGD oder Street View)
MINDESTRANG = {"gelaender": 1, "trog": 1, "weg": 1, "fenster": 1, "stuck": 1, "moebel": 1, "baum": 4,
               "nachbar": 4, "farbe": 3, "leuchte": 4, "strassenmoebel": 4}

# ------------------------------------------------------------------ Klassen
# (klasse, datei, pfad, filter): Pfad mit "*" fuer jede Listenposition bzw. jeden Schluessel; filter ist ein
# regulaerer Ausdruck auf Text und Kommentar des Elements (nur dann zaehlt es zu der Klasse).
KLASSEN = [
    ("gelaender", "project", ("neubau", "gelaender", "*"), None),
    ("gelaender", "project", ("dach", "railings", "*"), None),
    ("gelaender", "project", ("dach", "walls", "*", "loggias", "*", "rails", "*"), None),
    ("gelaender", "wohnungen", ("wohnungen", "*", "railings", "*"), None),
    ("trog", "project", ("neubau", "boxen", "*"), r"(?i)trog|pflanz|kuebel|beet"),
    ("trog", "project", ("neubau", "flaechen", "*"), r"(?i)trog|pflanz|kuebel"),
    ("trog", "project", ("neubau", "koerper", "*"), r"(?i)trog|pflanz"),
    ("weg", "project", ("neubau", "flaechen", "*"), r"(?i)\bweg|rampe|podest|stufe|pflaster|nb_platten"),
    ("weg", "project", ("neubau", "schraegen", "*"), r"(?i)\bweg|rampe|podest|stufe"),
    ("weg", "project", ("neubau", "boxen", "*"), r"(?i)rampe|podest|stufe|\bweg\b"),
    ("fenster", "project", ("neubau", "fassaden", "*"), None),
    ("fenster", "project", ("neubau", "dachfenster", "*"), None),
    ("fenster", "project", ("altbau", "rows", "*"), None),
    ("fenster", "project", ("altbau", "facades", "*"), None),
    ("fenster", "project", ("dach", "walls", "*"), None),
    ("fenster", "wohnungen", ("wohnungen", "*", "walls", "*"), r"openings"),
    ("stuck", "project", ("altbau", "cornices", "*"), None),
    ("stuck", "project", ("materials", "stuck"), None),
    ("stuck", "wohnungen", ("wohnungen", "*", "einbauten", "*"), r"(?i)stuck|voute|leiste|profil|gesims"),
    ("moebel", "wohnungen", ("wohnungen", "*", "einbauten", "*"),
     r"(?i)k(ue|ü)che|hochschrank|zeile|garderobe|insel|sideboard|\bbett\b|schrank"),
    ("baum", "project", ("trees_override", "*"), None),
    ("leuchte", "project", ("strassenleuchten", "*"), None),
    ("strassenmoebel", "project", ("strassenmoebel", "*"), None),
    ("nachbar", "project", ("neighbour_facades", "*"), None),
    ("nachbar", "project", ("roofs_override", "*"), None),
    ("nachbar", "project", ("neighbours", "*"), None),
    ("farbe", "project", ("neubau", "material", "*"), None),
    ("farbe", "project", ("materials", "*"), None),
    ("farbe", "wohnungen", ("materialien", "*"), None),
]
KLASSEN_NAMEN = {"gelaender": "Gelaender", "trog": "Troege", "weg": "Wege/Rampen/Podeste", "fenster": "Fenster/Oeffnungen",
                 "stuck": "Stuck/Profile", "moebel": "Grossmoebel/Einbauten", "baum": "Baeume",
                 "nachbar": "Nachbarfassaden/-daecher", "farbe": "Farben", "leuchte": "Strassenleuchten",
                 "strassenmoebel": "Strassenmoebel"}

TAG_RE = re.compile(r"\[([^\]\[]{1,160})\]")
# Kommentartext ohne Klammern, der trotzdem eine Quelle nennt (z. B. "laut EIN S. 8", "Orthofoto", "Annahme")
TEXT_RE = re.compile(r"\b(EIN S\. ?\d+|INT\d? S\. ?\d+|VP Top ?\w+|BAB[- ]?[A-Z]* ?\d[\d.]*|Orthofoto|LOD2|Baumkataster|"
                     r"Farbkonzept|RAL ?\d{4}|NCS [\w-]+|Caparol [\w ]+?\d+|Baumit \d+|Luftbild|Schr(ae|ä)gluftbild|"
                     r"Street ?View|Google ?(3D|Luftbild)?|Apple ?\d*|Annahme|geschaetzt|geschätzt|Hof_fin[-\d]*)\b")
ANN_RE = re.compile(r"(?i)\bANN\b|annahme|geschaetzt|geschätzt|regelwert|vermutlich")
PIXEL_RE = re.compile(r"(?i)gemessen|abgelesen|aus der ansicht|beleuchtet|pipette|mittelwert")
VEKTOR_RE = re.compile(r"(?i)vektor|RAL ?\d|NCS|baumit ?\d|palette|farbkonzept|\bFK\b|devicergb|hersteller|#\w+ laut")


# ------------------------------------------------------------------ YAML mit Zeilennummern
def _laden(pfad: Path):
    y = YAML(typ="rt")
    y.preserve_quotes = True
    text = pfad.read_text(encoding="utf-8")
    return y.load(text), text.splitlines()


def _ist_kommentar(z: str) -> bool:
    return z.lstrip().startswith("#")


def _einzug(z: str) -> int:
    return len(z) - len(z.lstrip(" "))


def _kommentar(z: str) -> str:
    """Kommentar am Zeilenende (ausserhalb von Anfuehrungszeichen) oder ganze Kommentarzeile."""
    if _ist_kommentar(z):
        return z.lstrip()[1:].strip()
    q = None
    for i, ch in enumerate(z):
        if ch in "\"'":
            q = None if q == ch else (ch if q is None else q)
        elif ch == "#" and q is None and (i == 0 or z[i - 1] in " \t"):
            return z[i + 1:].strip()
    return ""


def _kinder(knoten):
    """(schluessel, wert, zeile, spalte) je Kind eines ruamel-Knotens."""
    if hasattr(knoten, "items") and hasattr(knoten, "lc"):
        for k, v in knoten.items():
            try:
                z, s = knoten.lc.key(k)
            except (KeyError, TypeError, AttributeError):
                z, s = (getattr(v, "lc", None).line, 0) if hasattr(v, "lc") else (None, None)
            yield k, v, z, s
    elif isinstance(knoten, list) and hasattr(knoten, "lc"):
        for i, v in enumerate(knoten):
            try:
                z, s = knoten.lc.item(i)
            except (KeyError, TypeError, AttributeError):
                z, s = None, None
            yield i, v, z, s


def _suchen(knoten, muster: tuple, pfad=()):
    """Alle Elemente zu einem Pfadmuster: (pfad, wert, zeile, spalte, geschwister-zeilen)."""
    if not muster:
        return
    kopf, rest = muster[0], muster[1:]
    kinder = list(_kinder(knoten)) if knoten is not None else []
    zeilen = sorted(z for _, _, z, _ in kinder if z is not None)
    for k, v, z, s in kinder:
        if kopf != "*" and k != kopf:
            continue
        if not rest:
            yield pfad + (k,), v, z, s, zeilen
        else:
            yield from _suchen(v, rest, pfad + (k,))


def _bereich(zeilen: list[str], start: int, geschwister: list[int]) -> tuple[int, int]:
    """Zeilen des Elements: von start bis vor das naechste Geschwister bzw. bis der Einzug endet.
    Kommentarzeilen am Ende gehoeren zum naechsten Element."""
    nach = [g for g in geschwister if g > start]
    if nach:
        ende = nach[0] - 1
    else:
        e0 = _einzug(zeilen[start])
        ende = start
        for i in range(start + 1, len(zeilen)):
            z = zeilen[i]
            if not z.strip() or _ist_kommentar(z):
                continue
            if _einzug(z) <= e0 and not z.lstrip().startswith(("]", "}")):
                break
            ende = i
    while ende > start and (not zeilen[ende].strip() or _ist_kommentar(zeilen[ende])):
        ende -= 1
    return start, ende


def _block_darueber(zeilen: list[str], start: int, geschwister: list[int]) -> tuple[str, int | None]:
    """Kommentarblock direkt ueber dem Element, sonst der letzte Kommentarblock weiter oben in derselben Liste
    (gilt fuer alle folgenden Eintraege bis zum naechsten Kommentar)."""
    erster = geschwister[0] if geschwister else start
    i = start - 1
    while i >= 0:
        z = zeilen[i]
        if _ist_kommentar(z):
            block = []
            while i >= 0 and _ist_kommentar(zeilen[i]):
                block.insert(0, _kommentar(zeilen[i]))
                i -= 1
            return " ".join(block), i + 1
        if i < erster:
            # oberhalb des ersten Geschwisters: nur noch die Zeile des Elternschluessels (Kommentar am Ende) zaehlt
            return _kommentar(z), (i if _kommentar(z) else None)
        i -= 1
    return "", None


def _tags(text: str) -> list[str]:
    out = []
    for t in TAG_RE.findall(text or ""):
        t = t.strip()
        if any(rx.match(t) for _, rx in _RANG_RE):
            out.append(t)
    return out


def _rang(quelle: str) -> int | None:
    best = None
    for teil in re.split(r"[;,/]| und |\] \[", quelle):
        teil = teil.strip(" []")
        for r, rx in _RANG_RE:
            if rx.match(teil):
                best = r if best is None else min(best, r)
                break
    return best


def _punkte(wert, cfg: dict) -> list[tuple[float, float]]:
    """Grundrisspunkte eines Elements im lokalen System (fuer die Zuordnung zu Kameras)."""
    if not isinstance(wert, dict):
        return []
    d = {k: wert[k] for k in wert}
    rn = d.get("rahmen")
    T = lambda p: (float(p[0]), float(p[1]))
    R = ((cfg.get("neubau") or {}).get("rahmen") or {}).get(rn) if isinstance(rn, str) else None
    if R:
        th = math.radians(R.get("drehung", 0.0))
        ox, oy = R.get("ursprung", (0.0, 0.0))
        c, s_ = math.cos(th), math.sin(th)
        T = lambda p: (ox + p[0] * c - p[1] * s_, oy + p[0] * s_ + p[1] * c)
    pts = []
    for k in ("pts", "poly"):
        for p in d.get(k) or []:
            if isinstance(p, (list, tuple)) and len(p) >= 2 and all(isinstance(v, (int, float)) for v in p[:2]):
                pts.append(T(p))
    for k in ("a", "b", "pos"):
        p = d.get(k)
        if isinstance(p, (list, tuple)) and len(p) >= 2 and all(isinstance(v, (int, float)) for v in p[:2]):
            pts.append(T(p))
    fac = d.get("facade")
    if isinstance(fac, str) and fac in (cfg.get("facades") or {}):
        F = cfg["facades"][fac]
        (ax, ay), (bx, by) = F["a"], F["b"]
        L = math.hypot(bx - ax, by - ay) or 1.0
        ux, uy = (bx - ax) / L, (by - ay) / L
        nx, ny = -uy, ux                       # Gebaeude links der Laufrichtung = innen
        dd = float(d.get("d", 0.0)) if isinstance(d.get("d"), (int, float)) else 0.0
        for u in (d.get("u") or [0.0, L])[:2]:
            if isinstance(u, (int, float)):
                pts.append((ax + ux * u + nx * dd, ay + uy * u + ny * dd))
    return pts


def _sichtbar(pts, cam: dict, max_m: float = 150.0) -> bool:
    px, py = cam["pos"][:2]
    tx, ty = cam["target"][:2]
    blick = math.atan2(ty - py, tx - px)
    halb = math.atan(18.0 / float(cam.get("lens", 24))) + math.radians(6)
    for x, y in pts:
        dx, dy = x - px, y - py
        if math.hypot(dx, dy) > max_m:
            continue
        w = (math.atan2(dy, dx) - blick + math.pi) % (2 * math.pi) - math.pi
        if abs(w) <= halb:
            return True
    return False


# ------------------------------------------------------------------ Hauptfunktion
def pruefen(pdir: Path) -> dict:
    pdir = Path(pdir)
    dateien = {"project": pdir / "project.yaml", "wohnungen": pdir / "wohnungen.yaml"}
    geladen = {k: _laden(p) for k, p in dateien.items() if p.is_file()}
    cfg_plain = _plain(geladen["project"][0]) if "project" in geladen else {}
    elemente, gesehen = [], set()
    for klasse, datei, muster, filt in KLASSEN:
        if datei not in geladen:
            continue
        daten, zeilen = geladen[datei]
        for pfad, wert, z, s, geschw in _suchen(daten, muster):
            if z is None:
                continue
            a, e = _bereich(zeilen, z, geschw)
            eigen = " ".join(zeilen[a:e + 1])
            if filt:                                    # Klasse nach eigenem Text und Kommentar direkt darueber
                direkt, i = [], z - 1
                while i >= 0 and _ist_kommentar(zeilen[i]):
                    direkt.insert(0, zeilen[i])
                    i -= 1
                if not re.search(filt, eigen + " " + " ".join(direkt)):
                    continue
            k_eff = klasse
            if klasse == "gelaender" and str(getattr(wert, "get", lambda *_: "")("gruppe") or "").startswith("nb_umgebung"):
                k_eff = "nachbar"           # Balkonbruestungen der Nachbarhaeuser: Umgebung, nicht Planelement
            klasse = k_eff
            schluessel = (klasse, datei, z)
            if schluessel in gesehen:            # YAML-Anker (<<: *top04) zeigen auf dieselben Zeilen
                continue
            gesehen.add(schluessel)
            feld = wert.get("quelle") if hasattr(wert, "get") else None
            kom_eigen = " ".join(_kommentar(zeilen[i]) for i in range(a, e + 1))
            if hasattr(wert, "get"):            # Altbestand: Quelle steht manchmal im Feld note/notiz
                kom_eigen += " " + " ".join(str(wert.get(k) or "") for k in ("note", "notiz", "hinweis"))
            kom_block, block_zeile = _block_darueber(zeilen, z, geschw)
            if feld:
                stufe, quelle = "ok", str(feld)
            elif _tags(kom_eigen) or TEXT_RE.search(kom_eigen):
                stufe, quelle = "kommentar", " ".join(_tags(kom_eigen)) or TEXT_RE.search(kom_eigen).group(0)
            elif _tags(kom_block) or TEXT_RE.search(kom_block):
                stufe, quelle = "kommentar_block", " ".join(_tags(kom_block)) or TEXT_RE.search(kom_block).group(0)
            else:
                stufe, quelle = "fehlt", ""
            gesamt = " ".join([str(feld or ""), kom_eigen, kom_block if stufe == "kommentar_block" else ""])
            rang = _rang(quelle) if quelle else None
            if rang is None and quelle:
                rang = 9 if ANN_RE.search(quelle) else None
            ann = bool(ANN_RE.search(quelle)) if quelle else False
            hinweise = []
            if stufe != "fehlt" and rang is not None and rang > MINDESTRANG.get(klasse, 9) and rang != 9:
                hinweise.append(f"beste Quelle {RANG_NAME.get(rang, rang)}, fuer {KLASSEN_NAMEN[klasse]} "
                                f"mindestens {RANG_NAME[MINDESTRANG[klasse]]} verlangt")
            if klasse == "farbe" and PIXEL_RE.search(gesamt) and not VEKTOR_RE.search(gesamt):
                hinweise.append("Farbe aus Pixeln gemessen? Vektorfarbe oder Farbcode (RAL/NCS/Hersteller) verwenden")
            if klasse in ("gelaender", "trog", "weg", "stuck") and stufe != "fehlt" and (rang is None or rang > 1) \
                    and not ann:
                hinweise.append("keine Planquelle: nur modellieren, wenn der Plan es zeigt")
            elemente.append({
                "klasse": klasse, "datei": dateien[datei].name, "zeile": z + 1, "pfad": ".".join(map(str, pfad)),
                "stufe": stufe, "quelle": quelle[:120], "rang": rang, "ann": ann, "hinweise": hinweise,
                "punkte": _punkte(_plain(wert), cfg_plain) if datei == "project" else [],
                "wohnung": str(pfad[1]) if datei == "wohnungen" and pfad[0] == "wohnungen" else None,
                "auszug": zeilen[z].strip()[:110]})
    r = _auswerten(pdir, elemente, cfg_plain, _plain(geladen["wohnungen"][0]) if "wohnungen" in geladen else {})
    r["warnungen"] = _warnungen(cfg_plain)
    if r["warnungen"] and r["ampel"] == "gruen":
        r["ampel"] = "gelb"
    from . import soll as SO        # Zaehlpruefung gegen die Plan-Soll-Liste (Block soll in project.yaml)
    r["soll"] = SO.pruefen(cfg_plain)
    if r["soll"]["abweichungen"]:
        r["ampel"] = "rot"
    # Ampel je Klasse (gruen: alle mit Feld quelle, gelb: Kommentar, rot: fehlt), fuer "Gelaender gruen"
    for k, v in r["je_klasse"].items():
        v["ampel"] = "rot" if v["fehlt"] else ("gelb" if v["kommentar"] else "gruen")
    return r


def _warnungen(cfg: dict) -> list[str]:
    """Projektweite Warnungen (REGELN.md U9): Strassenleuchten nur aus dem Inventar mit Quelle."""
    w = []
    inv = cfg.get("strassenleuchten")
    if not inv:
        alt = ((cfg.get("street") or {}).get("cables") or [])
        w.append("kein Leuchten-Inventar (strassenleuchten): " + (f"Fallback aus street.cables ({len(alt)} Seilleuchten "
                 "ohne Quelle)" if alt else "keine Strassenleuchten im Modell") + "; Leuchten aus Street View erheben, "
                 "siehe README 'Objekt- und Materialbibliothek'")
    else:
        typen = {"seil", "mast_peitsche", "mast_aufsatz", "wandausleger", "altwiener_laterne"}
        for k, e in enumerate(inv):
            if (e or {}).get("typ", "seil") not in typen:
                w.append(f"strassenleuchten[{k}]: unbekannter typ {e.get('typ')}")
            if (e or {}).get("typ", "seil") == "seil" and not (e.get("a") and e.get("b")) and not e.get("abspannung"):
                w.append(f"strassenleuchten[{k}] ({e.get('id', '')}): Seilleuchte ohne beide Aufhaengepunkte a und b")
    return w


def _plain(x):
    """ruamel-Objekte in einfache Python-Typen (fuer Rechnungen)."""
    if hasattr(x, "items"):
        return {k: _plain(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_plain(v) for v in x]
    return x


def _auswerten(pdir: Path, elemente: list[dict], cfg: dict, W: dict) -> dict:
    zaehl = {s: sum(1 for e in elemente if e["stufe"] == s) for s in ("ok", "kommentar", "kommentar_block", "fehlt")}
    je_klasse = {}
    for e in elemente:
        k = je_klasse.setdefault(e["klasse"], {"gesamt": 0, "ok": 0, "kommentar": 0, "fehlt": 0, "ann": 0})
        k["gesamt"] += 1
        k["ok" if e["stufe"] == "ok" else "fehlt" if e["stufe"] == "fehlt" else "kommentar"] += 1
        k["ann"] += int(e["ann"])
    rangzahl = {}
    for e in elemente:
        key = RANG_NAME.get(e["rang"], "ohne") if e["rang"] else "ohne"
        rangzahl[key] = rangzahl.get(key, 0) + 1

    def quote(menge):
        n = len(menge)
        return {"elemente": n, "ann": sum(e["ann"] for e in menge), "ohne_quelle": sum(e["stufe"] == "fehlt" for e in menge),
                "anteil_ann": round(sum(e["ann"] for e in menge) / n, 2) if n else 0.0,
                "anteil_ohne_quelle": round(sum(e["stufe"] == "fehlt" for e in menge) / n, 2) if n else 0.0}

    je_bild = {}
    for name, cam in (cfg.get("cameras") or {}).items():
        if not isinstance(cam, dict) or "pos" not in cam or "target" not in cam:
            continue
        menge = [e for e in elemente if e["punkte"] and _sichtbar(e["punkte"], cam)]
        # Fassadenzeilen und Gesimse des Altbaus gelten, wenn eine Hauptfassade im Bild ist
        haupt = [tuple(f[k]) for f in (cfg.get("facades") or {}).values() for k in ("a", "b")]
        if haupt and _sichtbar(haupt, cam):
            menge += [e for e in elemente if not e["punkte"] and e["pfad"].startswith(("altbau.", "dach."))]
        je_bild[name] = quote(menge)
    for top, w in ((W.get("wohnungen") or {}).items()):
        menge = [e for e in elemente if e["wohnung"] == top]
        for kam in ((w or {}).get("kameras") or {}):
            je_bild[f"{top}_{kam}"] = quote(menge)
    fehlend = [{k: e[k] for k in ("klasse", "datei", "zeile", "pfad", "auszug")} for e in elemente if e["stufe"] == "fehlt"]
    hinweise = [{k: e[k] for k in ("klasse", "datei", "zeile", "pfad", "quelle", "hinweise")} for e in elemente if e["hinweise"]]
    gesamt = len(elemente)
    return {
        "projekt": pdir.name, "elemente": gesamt,
        "mit_feld_quelle": zaehl["ok"], "nur_kommentar": zaehl["kommentar"] + zaehl["kommentar_block"],
        "ohne_quelle": zaehl["fehlt"], "anteil_ann": round(sum(e["ann"] for e in elemente) / gesamt, 2) if gesamt else 0,
        "ampel": "rot" if zaehl["fehlt"] else ("gelb" if zaehl["kommentar"] + zaehl["kommentar_block"] else "gruen"),
        "je_klasse": je_klasse, "quellen_rang": rangzahl, "je_bild": je_bild,
        "fehlende_quellen": fehlend, "hinweise": hinweise,
    }


def bericht_text(r: dict, max_zeilen: int = 40) -> str:
    """Kurze Textfassung fuer die Konsole."""
    L = [f"Quellen-Pruefung {r['projekt']}: {r['elemente']} Elemente, {r['mit_feld_quelle']} mit Feld quelle, "
         f"{r['nur_kommentar']} nur Kommentar (Warnung), {r['ohne_quelle']} ohne Quelle, Annahmen {int(100 * r['anteil_ann'])} %"
         f"  -> Ampel {r['ampel'].upper()}", "", "Je Klasse (gesamt / ok / Kommentar / fehlt / ANN):"]
    for k, v in r["je_klasse"].items():
        L.append(f"  {KLASSEN_NAMEN[k]:28s} {v['gesamt']:4d} {v['ok']:4d} {v['kommentar']:4d} {v['fehlt']:4d} {v['ann']:4d}"
                 f"  {v.get('ampel', '')}")
    L.append("Quellen-Rang (beste Quelle je Element): " + ", ".join(f"{k} {v}" for k, v in r["quellen_rang"].items()))
    if r["je_bild"]:
        L += ["", "Je Bild (Elemente im Blickfeld, Anteil ANN, Anteil ohne Quelle):"]
        for k, v in r["je_bild"].items():
            if v["elemente"]:
                L.append(f"  {k:30s} {v['elemente']:4d}  ANN {int(100 * v['anteil_ann']):3d} %  ohne Quelle "
                         f"{int(100 * v['anteil_ohne_quelle']):3d} %")
    if r["fehlende_quellen"]:
        L += ["", f"Ohne Quelle ({len(r['fehlende_quellen'])}, erste {max_zeilen}):"]
        for e in r["fehlende_quellen"][:max_zeilen]:
            L.append(f"  {e['datei']}:{e['zeile']:<5d} {KLASSEN_NAMEN[e['klasse']]:22s} {e['auszug']}")
    if r.get("warnungen"):
        L += ["", "Warnungen:"] + [f"  {w}" for w in r["warnungen"]]
    if r.get("soll") is not None:
        from . import soll as SO
        L += SO.bericht_text(r["soll"])
    if r["hinweise"]:
        L += ["", f"Hinweise ({len(r['hinweise'])}, erste {max_zeilen}):"]
        for e in r["hinweise"][:max_zeilen]:
            L.append(f"  {e['datei']}:{e['zeile']:<5d} {KLASSEN_NAMEN[e['klasse']]:22s} [{e['quelle'][:40]}] "
                     + "; ".join(e["hinweise"]))
    return "\n".join(L)


def main_cli(projekt: str, als_json: bool = False, streng: bool = False) -> int:
    r = pruefen(Path(projekt))
    if als_json:
        print(json.dumps(r, ensure_ascii=False, indent=1))
    else:
        print(bericht_text(r))
    if r["ohne_quelle"] or (streng and r["nur_kommentar"]) or (r.get("soll") or {}).get("abweichungen"):
        return 1
    return 0
