"""Freigabe-Gate je Kamera (projects/<p>/freigabe.yaml) und Prompt-Regeln fuer die Veredelung.

Regel (REGELN.md, Phase Freigabe): Credits fuer die Veredelung erst, wenn der Kunde das Modell dieser Kamera
(Blender-Vorschau plus Pruefbogen) freigegeben hat. Bei Noma wurden Bilder veredelt, deren Modell danach noch
korrigiert werden musste (EG, Weg, Gelaender, Kueche, Stuck): die Credits waren verloren.

freigabe.yaml:
    kameras:
      ecke:                  {modell_freigegeben: ja, datum: 2026-11-16, von: "Kunde, Mail 16.11.", pruefbogen: renders/check/...}
      top03_wohnkueche_ecke: {modell_freigegeben: nein, notiz: "Kueche noch offen"}

Kameranamen: aussen wie in project.yaml (cameras), innen <wohnung>_<kamera> wie die Dateinamen in renders/innen/.
Verhalten: fehlt die Datei oder laeuft ein Trockenlauf, gibt es nur eine Warnung. Sonst ist eine nicht
freigegebene Kamera gesperrt, ausser mit force (Begruendung wird protokolliert).
"""
from __future__ import annotations

import datetime as _dt
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
REGELN_DATEI = ROOT / "higgsfield" / "prompt_regeln.yaml"
JA = {"ja", "yes", "true", "1", "freigegeben", "x"}


class NichtFreigegeben(RuntimeError):
    """Kamera ist laut freigabe.yaml nicht freigegeben (Veredelung gesperrt)."""


# ------------------------------------------------------------------ Kameras
def kameras(pdir: Path) -> list[str]:
    """Alle Kameranamen des Projekts: aussen aus project.yaml, innen <wohnung>_<kamera> aus wohnungen.yaml."""
    pdir = Path(pdir)
    out = []
    try:
        cfg = yaml.safe_load((pdir / "project.yaml").read_text(encoding="utf-8")) or {}
        out += list((cfg.get("cameras") or {}).keys())
    except (OSError, yaml.YAMLError):
        pass
    try:
        W = yaml.safe_load((pdir / "wohnungen.yaml").read_text(encoding="utf-8")) or {}
        for top, w in (W.get("wohnungen") or {}).items():
            for k in ((w or {}).get("kameras") or {}):
                out.append(f"{top}_{k}")
    except (OSError, yaml.YAMLError):
        pass
    return out


def kamera_aus_datei(pdir: Path, rel: str) -> str | None:
    """Kamera zu einem Bildpfad (z. B. renders/innen/top03_wohnkueche_ecke_vorschau.png): laengster Kameraname,
    mit dem der Dateiname (ohne Projektkuerzel) beginnt."""
    pdir = Path(pdir)
    stem = Path(rel).stem
    stem = re.sub(rf"^{re.escape(pdir.name)}_", "", stem)
    beste = None
    for k in kameras(pdir):
        if stem == k or stem.startswith(k + "_"):
            if beste is None or len(k) > len(beste):
                beste = k
    return beste


# ------------------------------------------------------------------ freigabe.yaml
def laden(pdir: Path) -> dict | None:
    f = Path(pdir) / "freigabe.yaml"
    if not f.is_file():
        return None
    return yaml.safe_load(f.read_text(encoding="utf-8")) or {}


def _ja(v) -> bool:
    return v is True or str(v).strip().lower() in JA


def status(pdir: Path, kamera: str | None) -> dict:
    """{freigegeben, grund, datei_fehlt, eintrag}"""
    daten = laden(pdir)
    if daten is None:
        return {"freigegeben": False, "datei_fehlt": True, "kamera": kamera,
                "grund": "freigabe.yaml fehlt (Altbestand): Modellfreigabe nicht dokumentiert"}
    if not kamera:
        return {"freigegeben": False, "datei_fehlt": False, "kamera": None,
                "grund": "Kamera zum Bild nicht erkannt, Freigabe nicht pruefbar"}
    e = (daten.get("kameras") or {}).get(kamera)
    if not e:
        return {"freigegeben": False, "datei_fehlt": False, "kamera": kamera,
                "grund": f"Kamera {kamera} steht nicht in freigabe.yaml"}
    if not _ja(e.get("modell_freigegeben")):
        return {"freigegeben": False, "datei_fehlt": False, "kamera": kamera, "eintrag": e,
                "grund": f"Modell der Kamera {kamera} nicht freigegeben" + (f" ({e.get('notiz')})" if e.get("notiz") else "")}
    return {"freigegeben": True, "datei_fehlt": False, "kamera": kamera, "eintrag": e,
            "grund": f"freigegeben am {e.get('datum', '?')} von {e.get('von', '?')}"}


def pruefen(pdir: Path, kamera: str | None, trockenlauf: bool = False, force: bool = False) -> dict:
    """Gate vor der Veredelung. Liefert {erlaubt, warnung, ...}; wirft NichtFreigegeben, wenn gesperrt.
    Gesperrt nur, wenn freigabe.yaml existiert, die Kamera nicht freigegeben ist, kein Trockenlauf und kein force."""
    st = status(pdir, kamera)
    if st["freigegeben"]:
        return {**st, "erlaubt": True, "warnung": None}
    if st["datei_fehlt"] or trockenlauf or force:
        grund = "Trockenlauf" if trockenlauf else ("force" if force else "Altbestand ohne freigabe.yaml")
        return {**st, "erlaubt": True, "warnung": f"WARNUNG: {st['grund']}; Veredelung trotzdem erlaubt ({grund})"}
    raise NichtFreigegeben(f"{st['grund']}. Erst Pruefbogen an den Kunden, Freigabe in freigabe.yaml eintragen "
                           f"(immoviz.py freigabe --projekt {Path(pdir).name} --cam {kamera} --setzen ja --von <Name>) "
                           f"oder bewusst mit --force bzw. force: true veredeln.")


def setzen(pdir: Path, kams: list[str], wert: bool, von: str, notiz: str = "", pruefbogen: str = "") -> dict:
    """Eintraege in freigabe.yaml setzen (Datei wird bei Bedarf angelegt; andere Eintraege bleiben)."""
    pdir = Path(pdir)
    f = pdir / "freigabe.yaml"
    bekannt = set(kameras(pdir))
    unbekannt = [k for k in kams if k not in bekannt]
    if unbekannt:
        raise ValueError(f"Kamera(s) unbekannt: {', '.join(unbekannt)}")
    daten = laden(pdir) or {}
    kd = daten.setdefault("kameras", {}) or {}
    daten["kameras"] = kd
    heute = _dt.date.today().isoformat()
    for k in kams:
        e = dict(kd.get(k) or {})
        e.update({"modell_freigegeben": "ja" if wert else "nein", "datum": heute, "von": von})
        if notiz:
            e["notiz"] = notiz
        if pruefbogen:
            e["pruefbogen"] = pruefbogen
        kd[k] = e
    daten["stand"] = heute
    kopf = ("# Modellfreigabe je Kamera (REGELN.md, Phase Freigabe). Veredelung (Credits) nur fuer Kameras mit\n"
            "# modell_freigegeben: ja. Gesetzt mit immoviz.py freigabe oder von Hand.\n")
    if f.is_file():
        alt = f.read_text(encoding="utf-8")
        kopf = "".join(z + "\n" for z in alt.splitlines() if z.startswith("#")) or kopf
    f.write_text(kopf + yaml.safe_dump(daten, allow_unicode=True, sort_keys=False, default_flow_style=False),
                 encoding="utf-8")
    return daten


def uebersicht(pdir: Path) -> dict:
    daten = laden(pdir)
    out = {"datei": "freigabe.yaml" if daten is not None else None, "kameras": {}}
    for k in kameras(pdir):
        st = status(pdir, k)
        out["kameras"][k] = "ja" if st["freigegeben"] else ("unbekannt" if st["datei_fehlt"] else "nein")
    return out


# ------------------------------------------------------------------ Prompt-Regeln
def _regeln() -> dict:
    return yaml.safe_load(REGELN_DATEI.read_text(encoding="utf-8")) or {}


def _parkordnung(pdir: Path, cfg: dict) -> str:
    """Parkordnung als Text: zuerst aus dem geprueften Strassenabgleich, sonst aus street.parking."""
    import json
    art_en = {"laengs": "parallel parking along the kerb", "schraeg": "angled parking", "senkrecht":
              "perpendicular parking (90 degrees)", "keine": "no parking"}
    teile = []
    f = Path(pdir) / "renders" / "check" / "strasse_abgleich.json"
    if f.is_file():
        try:
            for fs in json.loads(f.read_text(encoding="utf-8")).get("fassaden") or []:
                for seite, wo in (("parken_haus", "on the building side"), ("parken_gegenueber", "opposite")):
                    for p in fs.get(seite) or []:
                        a = art_en.get(p.get("art"), p.get("art"))
                        if p.get("art") == "schraeg":
                            a += f" at about {abs(int(p.get('winkel') or 60))} degrees"
                        teile.append(f"{fs.get('fassade')} {wo}: {a}")
        except (OSError, ValueError):
            pass
    if not teile:
        for r in ((cfg.get("street") or {}).get("parking") or []):
            a = art_en.get(r.get("art"), r.get("art"))
            if r.get("art") == "schraeg":
                a += f" at about {abs(int(r.get('winkel') or 60))} degrees"
            teile.append(f"{r.get('name') or r.get('strasse')}: {a}")
    return "; ".join(teile)


def _moebelplan(pdir: Path, kamera: str | None) -> str:
    """Moebelplan zur Kamera: wohnungen.yaml (kameras.<k>.moebelplan oder <wohnung>.moebelplan), sonst aus
    renders/innen/staging.json (bisherige Auftraege)."""
    import json
    if not kamera:
        return ""
    try:
        W = yaml.safe_load((Path(pdir) / "wohnungen.yaml").read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        W = {}
    for top, w in (W.get("wohnungen") or {}).items():
        for k, c in ((w or {}).get("kameras") or {}).items():
            if f"{top}_{k}" == kamera:
                mp = (c or {}).get("moebelplan") or (w or {}).get("moebelplan")
                if mp:
                    return str(mp)
    f = Path(pdir) / "renders" / "innen" / "staging.json"
    if f.is_file():
        try:
            daten = json.loads(f.read_text(encoding="utf-8"))
        except ValueError:
            daten = {}
        treffer = []

        def such(x):
            if isinstance(x, dict):
                for k, v in x.items():
                    if isinstance(v, dict) and k.startswith(kamera) and v.get("moebelplan"):
                        treffer.append(v["moebelplan"])
                    such(v)
        such(daten)
        if treffer:
            return str(treffer[-1])
    return ""


def _stuck_im_plan(pdir: Path, kamera: str | None) -> bool:
    """Stuck nur, wenn der Plan ihn zeigt: wohnungen.yaml <wohnung>.stuck: true oder Einbauten mit Stuckmaterial."""
    if not kamera:
        return False
    try:
        W = yaml.safe_load((Path(pdir) / "wohnungen.yaml").read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        return False
    for top, w in (W.get("wohnungen") or {}).items():
        if kamera.startswith(f"{top}_"):
            if (w or {}).get("stuck") is True:
                return True
            return any("stuck" in str(e.get("mat", "")) for e in (w or {}).get("einbauten") or [] if isinstance(e, dict))
    return False


def prompt_regeln(pdir: Path, kamera: str | None, art: str) -> dict:
    """Regelbausteine fuer einen Auftrag. art: 'aussen' oder 'innen'. Liefert {text, regeln, warnungen}."""
    pdir = Path(pdir)
    R = _regeln()
    try:
        cfg = yaml.safe_load((pdir / "project.yaml").read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        cfg = {}
    werte = {"parkordnung": _parkordnung(pdir, cfg), "moebelplan": _moebelplan(pdir, kamera)}
    flags = {"stuck_im_plan": _stuck_im_plan(pdir, kamera), "parkordnung": bool(werte["parkordnung"]),
             "moebelplan": bool(werte["moebelplan"])}
    texte, ids, warnungen = [], [], []
    for r in R.get("regeln") or []:
        if art not in (r.get("gilt") or ["aussen", "innen"]):
            continue
        bed = r.get("wenn")
        if bed:
            neg = bed.startswith("nicht ")
            name = bed[6:] if neg else bed
            if bool(flags.get(name)) == neg:
                if r.get("pflicht"):
                    warnungen.append(r.get("warnung") or f"Pflichtangabe fehlt: {name}")
                continue
        t = " ".join(str(r["text"]).split())
        for k, v in werte.items():
            t = t.replace("{" + k + "}", v)
        texte.append(t)
        ids.append(r["id"])
    marke = R.get("marke", "IMMOVIZ RULES")
    text = f"{marke}:\n" + "\n".join(f"- {t}" for t in texte) if texte else ""
    return {"text": text, "regeln": ids, "warnungen": warnungen, "marke": marke}


def anhaengen(prompt: str, regeln: dict) -> str:
    """Regelblock an einen Prompt haengen, wenn er noch nicht drinsteht (Marke als Erkennung)."""
    if not regeln.get("text") or regeln.get("marke", "IMMOVIZ RULES") in prompt:
        return prompt
    return prompt.rstrip() + "\n\n" + regeln["text"]
