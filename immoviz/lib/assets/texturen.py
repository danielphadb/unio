"""Optionale CC0-Texturen (Poly Haven) fuer Asphalt, Gehsteigplatten und Putzkorn.

Die Bilder liegen in immoviz/assets/texturen/<id>/ (gitignored) und werden mit `immoviz.py texturen` geladen.
Ohne Bilder arbeiten alle Materialien rein prozedural (gleiches Aussehen in den Grundzuegen). Quelle und Lizenz:
immoviz/assets/LIZENZEN.md. Die Texturen liefern nur Helligkeitsvariation, Rauheit und Relief; die Farbe bleibt
die des Materials (Farbkonzept, Orthofoto).
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ORDNER = Path(__file__).resolve().parents[2] / "assets" / "texturen"
# schluessel: (Poly-Haven-ID, Kantenlaenge der Textur in Metern laut Poly Haven, mittlere lineare Helligkeit des Farbbilds)
TEXTUREN = {
    "asphalt": ("asphalt_02", 3.0, 0.105),
    "platten": ("concrete_pavement_02", 1.8, 0.206),
    "putz": ("white_stucco", 2.0, 0.656),
}
KARTEN = {"diff": "Diffuse", "rough": "Rough", "nor": "nor_gl"}
AUFLOESUNG = "2k"


def dateien(schluessel: str) -> dict | None:
    if schluessel not in TEXTUREN:
        return None
    pid = TEXTUREN[schluessel][0]
    d = ORDNER / pid
    out = {}
    for k in KARTEN:
        f = d / f"{pid}_{k}_{AUFLOESUNG}.jpg"
        if f.is_file():
            out[k] = f
    return out if "diff" in out else None


def laden(aufloesung: str = AUFLOESUNG) -> list[str]:
    """Laedt alle Texturen ueber die oeffentliche Poly-Haven-API (CC0, keine Anmeldung)."""
    log = []
    for key, (pid, groesse, _) in TEXTUREN.items():
        req = urllib.request.Request(f"https://api.polyhaven.com/files/{pid}", headers={"User-Agent": "immoviz"})
        info = json.load(urllib.request.urlopen(req, timeout=60))
        d = ORDNER / pid
        d.mkdir(parents=True, exist_ok=True)
        for k, feld in KARTEN.items():
            url = info[feld][aufloesung]["jpg"]["url"]
            ziel = d / f"{pid}_{k}_{AUFLOESUNG}.jpg"
            if not ziel.exists():
                req = urllib.request.Request(url, headers={"User-Agent": "immoviz"})
                ziel.write_bytes(urllib.request.urlopen(req, timeout=120).read())
            log.append(f"{key}: {ziel.relative_to(ORDNER.parent)}")
    return log
