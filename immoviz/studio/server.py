"""immoviz Studio: lokale Web-Oberflaeche ueber dem Kommandozeilen-Prototyp (Phase B).

Start:  .venv-immoviz/bin/python immoviz/immoviz.py studio        (Port 8765)
        .venv-immoviz/bin/python immoviz/immoviz.py studio --dry-run   (Queue fuehrt nur Trockenlaeufe aus)

Projektwurzel: Standard immoviz/projects, sonst --projects <ordner> oder Umgebungsvariable IMMOVIZ_PROJECTS
(z. B. fuer Tests auf einer Kopie).

Datenhaltung je Projekt (projects/<slug>/):
  project.yaml     optionales Feld `status:` ({1: fertig, 4: laeuft, ...}) gilt als Vorgabe. Kamera- und
                   Licht-Editor aendern nur einzelne Eintraege unter cameras bzw. lights (yamledit.py),
                   vorher Sicherung nach .history/project.<zeitstempel>.yaml
  status.json      manuell gesetzter Schrittstatus aus der Oberflaeche (hat Vorrang vor der Ableitung)
  intake.json      Stand der Intake-Checkliste, Zuordnung hochgeladener Dateien zu Punkten
  freigabe.json    Freigabe, Ablehnung und Kommentare je Bild
  kundenlinks.json Kundenlinks: nur SHA-256 des Tokens, Ablaufdatum, Notiz, Widerruf
Zugriff: Anfragen, die nicht von localhost kommen (oder ueber einen Proxy mit X-Forwarded-For), duerfen nur
die Kundenansicht mit gueltigem Token und deren freigegebene Dateien abrufen.
Keine Secrets im Code. Ein Google-Schluessel wird hier nicht benoetigt.
"""
from __future__ import annotations

import hashlib
import hmac
import io
import json
import math
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import unicodedata
import uuid
from collections import deque
from datetime import datetime, timedelta
from pathlib import Path

import yaml
from fastapi import Body, FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

STUDIO = Path(__file__).resolve().parent
ROOT = STUDIO.parent                      # immoviz/
REPO = ROOT.parent                        # Repo-Wurzel (assets/, tokens/)
PROJECTS = Path(os.environ["IMMOVIZ_PROJECTS"]).expanduser().resolve() if os.environ.get("IMMOVIZ_PROJECTS") \
    else ROOT / "projects"
WEB = STUDIO / "web"
CACHE = STUDIO / ".cache"
CLI = ROOT / "immoviz.py"

FORCE_DRY = os.environ.get("IMMOVIZ_STUDIO_DRY") == "1"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from lib.sun import sun_position  # noqa: E402
from studio.yamledit import EditError, edit_section, replace_blocks  # noqa: E402
from studio.higgsfield import Higgsfield, HiggsfieldError, credits_estimate  # noqa: E402

IMG_EXT = {".png", ".jpg", ".jpeg", ".webp"}
VID_EXT = {".mp4", ".webm", ".mov"}

STEPS = [
    (1, "Intake", "Pläne, BAB, Farbkonzept, Fotos, Mood"),
    (2, "Verortung", "Umgebung aus Stadt Wien Open Data"),
    (3, "Fassaden", "Achsen, Geschosse, Gesimse, Fenster"),
    (4, "Dach und Volumen", "Dachgeschosse, Rücksprünge, Terrassen"),
    (5, "Planabgleich", "Modell über Ansicht und Street View"),
    (6, "Materialien", "Farbkonzept und BAB als Materialien"),
    (7, "Shotlist", "Motive mal Licht und Jahreszeit"),
    (8, "Rendering", "Vorschau und Final aus Blender"),
    (9, "Veredelung", "Higgsfield, Varianten, Video"),
    (10, "Freigabe", "Kunde kommentiert, Export"),
]
STATUS_VALUES = ("offen", "laeuft", "annahme", "fertig")

LIGHT_LABELS = {
    "golden_hour": "Golden Hour", "blaue_stunde": "Blaue Stunde", "dunst_hell": "Dunst hell",
    "fruehling": "Frühling", "herbst": "Herbst", "winter": "Winter", "sommermittag": "Sommermittag",
    "vormittag": "Vormittag", "spaetsommer": "Spätsommer", "mai_nachmittag": "Mai Nachmittag",
}
# Kurzformen in Higgsfield-Dateinamen
LIGHT_ALIASES = {"golden": "golden_hour", "dunst": "dunst_hell", "blaue": "blaue_stunde"}
CAM_GENERIC = {"detail", "ausblick"}

GALLERY_GROUPS = [
    ("aussen", "Außen, Blender", lambda rel: "/" not in rel),
    ("higgsfield", "Higgsfield", lambda rel: rel.startswith("higgsfield/")),
    ("innen", "Innenräume", lambda rel: rel.startswith("innen/")),
    ("video", "Video", lambda rel: rel.startswith("video/")),
    ("walkthrough", "Walkthrough", lambda rel: rel.startswith("walkthrough/")),
    ("pruefung", "Prüfung", lambda rel: rel.startswith(("check/", "streetview/"))),
]

app = FastAPI(title="immoviz Studio", docs_url="/api/docs", redoc_url=None)
_lock = threading.RLock()


# ------------------------------------------------------------------ Hilfsfunktionen
def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def project_dir(slug: str) -> Path:
    if not re.fullmatch(r"[a-z0-9][a-z0-9._-]*", slug or ""):
        raise HTTPException(404, "Projekt unbekannt")
    p = PROJECTS / slug
    if not (p / "project.yaml").is_file():
        raise HTTPException(404, "Projekt unbekannt")
    return p


_cfg_cache: dict[str, tuple[float, dict]] = {}


def load_cfg(pdir: Path) -> dict:
    f = pdir / "project.yaml"
    m = f.stat().st_mtime
    hit = _cfg_cache.get(str(f))
    if hit and hit[0] == m:
        return hit[1]
    try:
        cfg = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as e:  # Datei wird evtl. gerade bearbeitet
        if hit:
            return hit[1]
        raise HTTPException(500, f"project.yaml nicht lesbar: {e}")
    _cfg_cache[str(f)] = (m, cfg)
    return cfg


def read_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(path: Path, data) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(path)


def safe_rel(pdir: Path, rel: str, base: str = "renders") -> Path:
    root = (pdir / base).resolve()
    p = (root / rel).resolve()
    if not p.is_relative_to(root) or not p.is_file():
        raise HTTPException(404, "Datei nicht gefunden")
    return p


def label_light(k: str) -> str:
    return LIGHT_LABELS.get(k, k.replace("_", " ").capitalize())


def label_cam(k: str) -> str:
    return k.replace("_", " ").capitalize()


def file_url(slug: str, rel: str) -> str:
    return f"/files/{slug}/{rel}"


def thumb_url(slug: str, rel: str, w: int = 480) -> str:
    return f"/thumb/{slug}/{rel}?w={w}"


def media_items(pdir: Path) -> list[dict]:
    """Alle Bilder und Videos unter renders/ (rekursiv)."""
    out = []
    rd = pdir / "renders"
    if not rd.is_dir():
        return out
    for f in sorted(rd.rglob("*")):
        if not f.is_file() or f.name.startswith("."):
            continue
        ext = f.suffix.lower()
        if ext not in IMG_EXT and ext not in VID_EXT:
            continue
        rel = f.relative_to(rd).as_posix()
        if "/clay/" in rel:  # Einzelbilder der Clay-Fahrt, nur Bewegungsvorlage
            continue
        st = f.stat()
        out.append({"rel": rel, "name": f.name, "stem": f.stem, "ext": ext,
                    "typ": "video" if ext in VID_EXT else "bild",
                    "bytes": st.st_size, "mtime": st.st_mtime})
    return out


def dedupe(items: list[dict]) -> list[dict]:
    """Gleiche Bilder als PNG und JPG nur einmal zeigen (JPG bevorzugt, PNG als Original)."""
    by = {}
    for it in items:
        key = it["rel"].rsplit(".", 1)[0]
        cur = by.get(key)
        if cur is None:
            by[key] = dict(it, varianten=[it["rel"]])
        else:
            cur["varianten"].append(it["rel"])
            if it["ext"] in (".jpg", ".jpeg") and cur["ext"] not in (".jpg", ".jpeg"):
                by[key] = dict(it, varianten=cur["varianten"])
    return list(by.values())


# ------------------------------------------------------------------ Shotlist-Zuordnung
def _contains(tokens: list[str], sub: list[str]) -> bool:
    n = len(sub)
    return n > 0 and any(tokens[i:i + n] == sub for i in range(len(tokens) - n + 1))


def match_strict(slug: str, stem: str, cams, lights):
    """Muster <slug>_<cam>_<light>_(vorschau|final)."""
    m = re.fullmatch(re.escape(slug) + r"_(.+)_(vorschau|final)", stem)
    if not m:
        return None
    body, kind = m.group(1), m.group(2)
    for c in sorted(cams, key=len, reverse=True):
        for l in lights:
            if body == f"{c}_{l}":
                return c, l, kind
    return None


def match_loose(stem: str, cams, lights):
    """Higgsfield-Dateinamen wie herbst_ecke_orbit, ecke_dunst_nbpro, herbst_beletage."""
    t = stem.lower().split("_")
    cam = None
    best = 0
    for c in cams:
        sub = [x for x in c.split("_") if x not in CAM_GENERIC] or c.split("_")
        if _contains(t, c.split("_")) or _contains(t, sub):
            score = len(c.split("_"))
            if score > best:
                cam, best = c, score
    light = None
    for l in sorted(lights, key=len, reverse=True):
        if _contains(t, l.split("_")):
            light = l
            break
    if light is None:
        for a, l in LIGHT_ALIASES.items():
            if a in t and l in lights:
                light = l
                break
    if cam and light:
        kind = "final" if "final" in t else "veredelt"
        return cam, light, kind
    return None


def build_shotlist(slug: str, pdir: Path) -> dict:
    cfg = load_cfg(pdir)
    cams = list((cfg.get("cameras") or {}).keys())
    lights = list((cfg.get("lights") or {}).keys())
    frei = read_json(pdir / "freigabe.json", {})
    cells = {f"{c}|{l}": {"cam": c, "light": l, "renders": [], "higgsfield": []} for c in cams for l in lights}
    unzugeordnet = []
    for it in dedupe(media_items(pdir)):
        if it["typ"] != "bild":
            continue
        rel = it["rel"]
        top = "/" not in rel
        hf = rel.startswith("higgsfield/")
        if not (top or hf):
            continue
        hit = match_strict(slug, it["stem"], cams, lights)
        how = "muster"
        if hit is None and hf:
            hit = match_loose(it["stem"], cams, lights)
            how = "name"
        entry = {"rel": rel, "url": file_url(slug, rel), "thumb": thumb_url(slug, rel, 360),
                 "art": hit[2] if hit else None, "zuordnung": how,
                 "freigabe": (frei.get(rel) or {}).get("status", "offen")}
        if hit is None:
            if hf:
                unzugeordnet.append(entry)
            continue
        cells[f"{hit[0]}|{hit[1]}"]["higgsfield" if hf else "renders"].append(entry)
    for c in cells.values():
        c["renders"].sort(key=lambda e: 0 if e["art"] == "final" else 1)
    return {
        "cameras": [{"key": c, "label": label_cam(c), **{k: v for k, v in (cfg["cameras"][c] or {}).items() if k in ("lens",)}} for c in cams],
        "lights": [{"key": l, "label": label_light(l), "date": (cfg["lights"][l] or {}).get("date"),
                    "time": (cfg["lights"][l] or {}).get("time"), "season": (cfg["lights"][l] or {}).get("season")} for l in lights],
        "cells": list(cells.values()),
        "unzugeordnet": unzugeordnet,
    }


# ------------------------------------------------------------------ Intake
def intake_items() -> list[dict]:
    """Checkliste aus README.md, Abschnitt 'Intake-Checkliste je Objekt'."""
    text = (ROOT / "README.md").read_text(encoding="utf-8")
    m = re.search(r"^## Intake-Checkliste je Objekt\s*$(.*?)(?=^## |\Z)", text, re.M | re.S)
    items = []
    if m:
        for line in m.group(1).splitlines():
            mm = re.match(r"\s*- \[[ xX]\]\s+(.*)", line)
            if mm:
                label = mm.group(1).strip()
                key = re.sub(r"[^a-z0-9]+", "-", label.lower().replace("ä", "ae").replace("ö", "oe")
                             .replace("ü", "ue").replace("ß", "ss"))[:40].strip("-")
                items.append({"id": key, "text": label})
    return items


def intake_state(pdir: Path) -> dict:
    data = read_json(pdir / "intake.json", {"punkte": {}})
    items = []
    for it in intake_items():
        st = data.get("punkte", {}).get(it["id"], {})
        items.append({**it, "status": st.get("status", "offen"), "notiz": st.get("notiz", ""),
                      "aktualisiert": st.get("aktualisiert")})
    zuord = data.get("dateien", {})
    quellen = []
    qd = pdir / "quellen"
    if qd.is_dir():
        for f in sorted(qd.iterdir()):
            if f.is_file() and not f.name.startswith("."):
                st = f.stat()
                quellen.append({"name": f.name, "bytes": st.st_size, "punkt": (zuord.get(f.name) or {}).get("punkt", ""),
                                "datum": datetime.fromtimestamp(st.st_mtime).strftime("%d.%m.%Y")})
    for it in items:
        it["dateien"] = [q["name"] for q in quellen if q["punkt"] == it["id"]]
    return {"punkte": items, "quellen": quellen, "upload": {"endungen": sorted(UPLOAD_EXT), "max_mb": UPLOAD_MAX // 1_000_000}}


# ------------------------------------------------------------------ Schrittstatus
def derive_steps(slug: str, pdir: Path) -> list[dict]:
    cfg = load_cfg(pdir)
    media = media_items(pdir)
    rels = [m["rel"] for m in media]
    intake = intake_state(pdir)
    frei = read_json(pdir / "freigabe.json", {})
    manual = read_json(pdir / "status.json", {}).get("schritte", {})
    yaml_status = cfg.get("status") if isinstance(cfg.get("status"), dict) else {}

    auto: dict[int, tuple[str, str]] = {}
    pts = intake["punkte"]
    done = sum(1 for p in pts if p["status"] == "vollstaendig")
    part = sum(1 for p in pts if p["status"] == "teilweise")
    if pts and done == len(pts):
        auto[1] = ("fertig", f"{done} von {len(pts)} Punkten vollständig")
    elif done or part or intake["quellen"]:
        auto[1] = ("laeuft", f"{done} von {len(pts)} vollständig, {len(intake['quellen'])} Dateien in quellen/")
    else:
        auto[1] = ("offen", "noch keine Quellen")
    ctx = pdir / "data" / "context.json"
    auto[2] = ("fertig", "data/context.json vorhanden") if ctx.is_file() else ("offen", "immoviz.py geo ausführen")
    fac = ((cfg.get("altbau") or {}).get("facades") or {})
    auto[3] = ("fertig", f"{len(fac)} Fassaden in project.yaml") if fac else ("offen", "keine Fassaden erfasst")
    auto[4] = ("fertig", "Dach in project.yaml") if cfg.get("dach") else ("offen", "kein Dach erfasst")
    chk = [r for r in rels if r.startswith("check/") and "abgleich" in r]
    sv = [r for r in rels if r.startswith("streetview/") and "vergleich" in r]
    if chk and sv:
        auto[5] = ("fertig", f"{len(chk)} Planabgleich, {len(sv)} Street-View-Vergleiche")
    elif chk or sv:
        auto[5] = ("laeuft", f"{len(chk)} Planabgleich, {len(sv)} Street-View-Vergleiche")
    else:
        auto[5] = ("offen", "immoviz.py check und svcheck")
    mats = cfg.get("materials") or {}
    auto[6] = ("fertig", f"{len(mats)} Materialien definiert") if mats else ("offen", "keine Materialien")
    cams, lights = cfg.get("cameras") or {}, cfg.get("lights") or {}
    auto[7] = ("fertig", f"{len(cams)} Motive, {len(lights)} Lichtstimmungen") if cams and lights else ("offen", "Kameras und Licht fehlen")
    top = [r for r in rels if "/" not in r and r.startswith(slug + "_")]
    fin = [r for r in top if r.rsplit(".", 1)[0].endswith("_final")]
    vor = [r for r in top if r.rsplit(".", 1)[0].endswith("_vorschau")]
    if fin:
        auto[8] = ("fertig", f"{len(fin)} Final, {len(vor)} Vorschau")
    elif vor:
        auto[8] = ("laeuft", f"{len(vor)} Vorschau, noch kein Final")
    else:
        auto[8] = ("offen", "noch keine Renderings")
    hf = len({r.rsplit(".", 1)[0] for r in rels if r.startswith("higgsfield/")})
    vid = len([r for r in rels if r.startswith("video/")])
    auto[9] = ("laeuft", f"{hf} Higgsfield-Bilder, {vid} Videos") if hf or vid else ("offen", "noch keine Veredelung")
    ok = sum(1 for v in frei.values() if v.get("status") == "freigegeben")
    auto[10] = ("laeuft", f"{ok} Bilder freigegeben") if ok else ("offen", "noch nichts freigegeben")

    out = []
    for n, name, desc in STEPS:
        st, note = auto[n]
        quelle = "automatisch"
        ys = yaml_status.get(n) or yaml_status.get(str(n))
        if ys in STATUS_VALUES:
            st, quelle = ys, "project.yaml"
        ms = manual.get(str(n))
        if ms and ms.get("status") in STATUS_VALUES:
            st, quelle = ms["status"], "manuell"
            if ms.get("notiz"):
                note = ms["notiz"]
        out.append({"nr": n, "name": name, "beschreibung": desc, "status": st, "hinweis": note,
                    "quelle": quelle, "automatisch": auto[n][0]})
    return out


def project_summary(pdir: Path) -> dict:
    cfg = load_cfg(pdir)
    slug = pdir.name
    meta = cfg.get("project") or {}
    site = cfg.get("site") or {}
    steps = derive_steps(slug, pdir)
    media = dedupe(media_items(pdir))
    frei = read_json(pdir / "freigabe.json", {})
    bilder = [m for m in media if m["typ"] == "bild" and not m["rel"].startswith(("check/", "streetview/"))]
    letzte = sorted(bilder, key=lambda m: m["mtime"], reverse=True)[:4]
    intake = intake_state(pdir)
    offen_intake = [p["text"] for p in intake["punkte"] if p["status"] != "vollstaendig"]
    return {
        "slug": slug,
        "name": meta.get("name", slug),
        "adresse": site.get("address", ""),
        "kunde": meta.get("client", ""),
        "schritte": steps,
        "fortschritt": sum(1 for s in steps if s["status"] == "fertig"),
        "bilder": len(bilder),
        "videos": len([m for m in media if m["typ"] == "video"]),
        "freigegeben": sum(1 for v in frei.values() if v.get("status") == "freigegeben"),
        "abgelehnt": sum(1 for v in frei.values() if v.get("status") == "abgelehnt"),
        "letzte": [{"rel": m["rel"], "thumb": thumb_url(slug, m["rel"], 480)} for m in letzte],
        "offene_punkte": offen_intake,
        "kameras": len(cfg.get("cameras") or {}),
        "lichter": len(cfg.get("lights") or {}),
    }


# ------------------------------------------------------------------ Render-Queue
class Queue:
    """Eine Warteschlange, hoechstens ein Job gleichzeitig."""

    def __init__(self):
        self.jobs: dict[str, dict] = {}
        self.order: list[str] = []
        self.logs: dict[str, deque] = {}
        self.procs: dict[str, subprocess.Popen] = {}
        self.cv = threading.Condition()
        self.dir = CACHE / "jobs"
        self.dir.mkdir(parents=True, exist_ok=True)
        self._load()
        threading.Thread(target=self._worker, daemon=True, name="render-queue").start()

    def _load(self):
        data = read_json(CACHE / "jobs.json", [])
        for j in data[-200:]:
            if j.get("status") in ("wartet", "laeuft"):
                j["status"] = "abgebrochen"
                j["fehler"] = "Studio wurde neu gestartet"
            self.jobs[j["id"]] = j
            self.order.append(j["id"])

    def add(self, slug: str, cam: str, light: str, dry_run: bool) -> dict:
        pdir = project_dir(slug)
        cfg = load_cfg(pdir)
        if cam not in (cfg.get("cameras") or {}):
            raise HTTPException(400, f"Kamera '{cam}' nicht in project.yaml")
        if light not in (cfg.get("lights") or {}):
            raise HTTPException(400, f"Licht '{light}' nicht in project.yaml")
        dry = bool(dry_run or FORCE_DRY)
        if dry:
            cmd = [sys.executable, "-c",
                   "import time;print('Trockenlauf: kein Blender-Rendering', flush=True);"
                   "time.sleep(1.5);print(1)"]
        else:
            cmd = [sys.executable, str(CLI), "render", str(pdir), "--cam", cam, "--light", light,
                   "--preview", "--no-blend"]
        return self.add_job(slug, "render", cmd=cmd, dry=dry, cam=cam, light=light,
                            befehl="python -c <Trockenlauf>" if dry else
                            f"immoviz.py render projects/{slug} --cam {cam} --light {light} --preview --no-blend")

    def add_job(self, slug: str, art: str, cmd: list | None = None, fn=None, dry: bool = False,
                befehl: str = "", **extra) -> dict:
        """Allgemeiner Job: Befehl (Unterprozess) oder Funktion fn(log) im Studio-Prozess (Higgsfield)."""
        jid = uuid.uuid4().hex[:10]
        job = {"id": jid, "projekt": slug, "art": art, "cam": extra.pop("cam", art), "light": extra.pop("light", ""),
               "trockenlauf": dry, "befehl": befehl, "status": "wartet", "erstellt": now_iso(), "gestartet": None,
               "beendet": None, "rueckgabe": None, "fehler": None, **extra}
        with self.cv:
            self.jobs[jid] = job
            self.order.append(jid)
            self.logs[jid] = deque(maxlen=2000)
            if fn is not None:
                job["_fn"] = fn
            else:
                job["_cmd"] = cmd
            self._save_public()
            self.cv.notify()
        return self.public(job)

    def _save_public(self):
        write_json(CACHE / "jobs.json", [self.public(self.jobs[i]) for i in self.order][-200:])

    @staticmethod
    def public(job: dict) -> dict:
        return {k: v for k, v in job.items() if not k.startswith("_")}

    def cancel(self, jid: str) -> dict:
        with self.cv:
            job = self.jobs.get(jid)
            if not job:
                raise HTTPException(404, "Job unbekannt")
            if job["status"] == "wartet":
                job["status"] = "abgebrochen"
                job["beendet"] = now_iso()
            elif job["status"] == "laeuft" and jid in self.procs:
                job["_abbruch"] = True
                self.procs[jid].terminate()
            self._save_public()
            return self.public(job)

    def log(self, jid: str) -> str:
        if jid in self.logs:
            return "".join(self.logs[jid])
        f = self.dir / f"{jid}.log"
        return f.read_text(encoding="utf-8", errors="replace")[-200_000:] if f.is_file() else ""

    def _next(self):
        for jid in self.order:
            j = self.jobs[jid]
            if j["status"] == "wartet" and ("_cmd" in j or "_fn" in j):
                return j
        return None

    def _worker(self):
        while True:
            with self.cv:
                job = self._next()
                while job is None:
                    self.cv.wait()
                    job = self._next()
                job["status"] = "laeuft"
                job["gestartet"] = now_iso()
                self._save_public()
            self._run(job)

    def _run(self, job):
        jid = job["id"]
        logf = (self.dir / f"{jid}.log").open("w", encoding="utf-8")
        t0 = time.time()
        if "_fn" in job:
            def log(msg):
                line = str(msg).rstrip("\n") + "\n"
                self.logs[jid].append(line)
                logf.write(line)
                logf.flush()
            try:
                res = job["_fn"](log)
                with self.cv:
                    job["status"], job["rueckgabe"] = "fertig", 0
                    if isinstance(res, dict):
                        job["ergebnis"] = res
            except Exception as e:  # noqa: BLE001
                log(f"Fehler: {e}")
                with self.cv:
                    job["status"], job["fehler"], job["rueckgabe"] = "fehler", str(e)[:300], 1
            finally:
                logf.close()
                with self.cv:
                    job["beendet"] = now_iso()
                    job["sekunden"] = round(time.time() - t0, 1)
                    self._save_public()
            return
        try:
            p = subprocess.Popen(job["_cmd"], cwd=str(REPO), stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                 text=True, bufsize=1, env={**os.environ, "PYTHONUNBUFFERED": "1"})
            self.procs[jid] = p
            for line in p.stdout:
                self.logs[jid].append(line)
                logf.write(line)
                logf.flush()
            rc = p.wait()
            with self.cv:
                job["rueckgabe"] = rc
                if job.get("_abbruch"):
                    job["status"] = "abgebrochen"
                else:
                    job["status"] = "fertig" if rc == 0 else "fehler"
                    if rc != 0:
                        job["fehler"] = f"Rückgabewert {rc}"
        except Exception as e:  # noqa: BLE001
            with self.cv:
                job["status"] = "fehler"
                job["fehler"] = str(e)
        finally:
            logf.close()
            self.procs.pop(jid, None)
            with self.cv:
                job["beendet"] = now_iso()
                job["sekunden"] = round(time.time() - t0, 1)
                self._save_public()

    def list(self, slug: str | None = None) -> list[dict]:
        with self.cv:
            js = [self.public(self.jobs[i]) for i in reversed(self.order)]
        return [j for j in js if not slug or j["projekt"] == slug]


QUEUE: Queue | None = None


def queue() -> Queue:
    global QUEUE
    if QUEUE is None:
        QUEUE = Queue()
    return QUEUE


# ------------------------------------------------------------------ API
@app.get("/api/info")
def api_info():
    return {"name": "immoviz Studio", "phase": "C", "trockenlauf_erzwungen": FORCE_DRY,
            "status_werte": STATUS_VALUES, "projektwurzel_standard": PROJECTS == ROOT / "projects"}


@app.get("/api/projects")
def api_projects():
    out = []
    if PROJECTS.is_dir():
        for p in sorted(PROJECTS.iterdir()):
            if (p / "project.yaml").is_file() and not p.name.startswith(("_", ".")):
                try:
                    out.append(project_summary(p))
                except HTTPException as e:
                    out.append({"slug": p.name, "name": p.name, "fehler": e.detail})
    return out


@app.get("/api/projects/{slug}")
def api_project(slug: str):
    return project_summary(project_dir(slug))


@app.put("/api/projects/{slug}/steps/{nr}")
def api_step(slug: str, nr: int, body: dict = Body(...)):
    pdir = project_dir(slug)
    if not 1 <= nr <= 10:
        raise HTTPException(400, "Schritt 1 bis 10")
    st = body.get("status")
    with _lock:
        data = read_json(pdir / "status.json", {"schritte": {}})
        data.setdefault("schritte", {})
        if st in (None, "", "automatisch"):
            data["schritte"].pop(str(nr), None)
        elif st in STATUS_VALUES:
            data["schritte"][str(nr)] = {"status": st, "notiz": str(body.get("notiz", ""))[:500],
                                         "aktualisiert": now_iso()}
        else:
            raise HTTPException(400, f"Status muss einer von {STATUS_VALUES} sein")
        write_json(pdir / "status.json", data)
    return derive_steps(slug, pdir)


@app.get("/api/projects/{slug}/intake")
def api_intake(slug: str):
    return intake_state(project_dir(slug))


@app.put("/api/projects/{slug}/intake/{item}")
def api_intake_set(slug: str, item: str, body: dict = Body(...)):
    pdir = project_dir(slug)
    ids = {i["id"] for i in intake_items()}
    if item not in ids:
        raise HTTPException(404, "Punkt unbekannt")
    st = body.get("status", "offen")
    if st not in ("offen", "teilweise", "vollstaendig"):
        raise HTTPException(400, "Status: offen, teilweise, vollstaendig")
    with _lock:
        data = read_json(pdir / "intake.json", {"punkte": {}})
        data.setdefault("punkte", {})[item] = {"status": st, "notiz": str(body.get("notiz", ""))[:1000],
                                               "aktualisiert": now_iso()}
        write_json(pdir / "intake.json", data)
    return intake_state(pdir)


@app.get("/api/projects/{slug}/shotlist")
def api_shotlist(slug: str):
    return build_shotlist(slug, project_dir(slug))


@app.get("/api/projects/{slug}/gallery")
def api_gallery(slug: str):
    pdir = project_dir(slug)
    frei = read_json(pdir / "freigabe.json", {})
    idx = hf_index(pdir)
    out = []
    for it in dedupe(media_items(pdir)):
        rel = it["rel"]
        grp = next((g for g, _, fn in GALLERY_GROUPS if fn(rel)), "sonstige")
        f = frei.get(rel) or {}
        out.append({"rel": rel, "name": it["name"], "typ": it["typ"], "gruppe": grp,
                    "hf": idx.get(rel), "veredelbar": it["typ"] == "bild" and grp in ("aussen", "innen", "walkthrough"),
                    "url": file_url(slug, rel),
                    "thumb": thumb_url(slug, rel, 640) if it["typ"] == "bild" else None,
                    "varianten": it["varianten"], "bytes": it["bytes"],
                    "datum": datetime.fromtimestamp(it["mtime"]).strftime("%d.%m.%Y %H:%M"),
                    "mtime": it["mtime"],
                    "status": f.get("status", "offen"), "kommentare": f.get("kommentare", [])})
    out.sort(key=lambda x: x["mtime"], reverse=True)
    return {"gruppen": [{"key": k, "label": l} for k, l, _ in GALLERY_GROUPS], "medien": out}


@app.post("/api/projects/{slug}/freigabe")
def api_freigabe(slug: str, body: dict = Body(...)):
    """{rel, status?: freigegeben|abgelehnt|offen, kommentar?, autor?}"""
    return _freigabe(slug, body, "team")


def _freigabe(slug: str, body: dict, quelle: str):
    pdir = project_dir(slug)
    rel = str(body.get("rel", ""))
    safe_rel(pdir, rel)
    st = body.get("status")
    if st is not None and st not in ("freigegeben", "abgelehnt", "offen"):
        raise HTTPException(400, "Status: freigegeben, abgelehnt, offen")
    text = str(body.get("kommentar", "") or "").strip()[:2000]
    autor = str(body.get("autor", "") or "Team").strip()[:60] or "Team"
    if st is None and not text:
        raise HTTPException(400, "Status oder Kommentar fehlt")
    with _lock:
        data = read_json(pdir / "freigabe.json", {})
        e = data.setdefault(rel, {"status": "offen", "kommentare": []})
        if st is not None:
            if st == "freigegeben" and e.get("status") != "freigegeben":
                e["freigegeben_am"] = now_iso()
            e["status"] = st
        if text or st is not None:
            e.setdefault("kommentare", []).append({"zeit": now_iso(), "autor": autor, "text": text, "quelle": quelle,
                                                   **({"status": st} if st else {})})
        e["aktualisiert"] = now_iso()
        write_json(pdir / "freigabe.json", data)
    return {"rel": rel, **e}


@app.post("/api/kunde/{slug}/kommentar")
def api_kunde_kommentar(slug: str, request: Request, body: dict = Body(...), t: str = ""):
    """Kommentar aus der Kundenansicht, nur zu freigegebenen Bildern, ohne Statusaenderung."""
    pdir = project_dir(slug)
    kunde_zugang(pdir, request, t)
    rel = str(body.get("rel", ""))
    data = read_json(pdir / "freigabe.json", {})
    if (data.get(rel) or {}).get("status") != "freigegeben":
        raise HTTPException(404, "Bild nicht freigegeben")
    if not str(body.get("kommentar", "")).strip():
        raise HTTPException(400, "Kommentar fehlt")
    e = _freigabe(slug, {"rel": rel, "kommentar": body.get("kommentar", ""),
                         "autor": body.get("autor") or "Kunde"}, "kunde")
    return {"rel": rel, "kommentare": [k for k in e["kommentare"] if k.get("quelle") == "kunde"]}


@app.get("/api/kunde/{slug}")
def api_kunde(slug: str, request: Request, t: str = ""):
    """Nur freigegebene Bilder und Videos, ohne interne Kommentare anderer Bilder.

    Mit Token (?t=) aus einem Kundenlink, ohne Token nur von localhost."""
    pdir = project_dir(slug)
    kunde_zugang(pdir, request, t)
    q = f"t={t}" if t else ""
    cfg = load_cfg(pdir)
    frei = read_json(pdir / "freigabe.json", {})
    out = []
    for it in dedupe(media_items(pdir)):
        f = frei.get(it["rel"]) or {}
        if f.get("status") != "freigegeben":
            continue
        out.append({"rel": it["rel"], "typ": it["typ"], "url": file_url(slug, it["rel"]) + (f"?{q}" if q else ""),
                    "thumb": thumb_url(slug, it["rel"], 1280) + (f"&{q}" if q else "") if it["typ"] == "bild" else None,
                    "kommentare": [k for k in f.get("kommentare", []) if k.get("text") and k.get("quelle") == "kunde"],
                    "_am": f.get("freigegeben_am", "")})
    out.sort(key=lambda m: m.pop("_am"))
    meta = cfg.get("project") or {}
    return {"name": meta.get("name", slug), "adresse": (cfg.get("site") or {}).get("address", ""),
            "medien": out}


@app.get("/api/queue")
def api_queue(projekt: str | None = None):
    return {"trockenlauf_erzwungen": FORCE_DRY, "jobs": queue().list(projekt)}


@app.post("/api/queue")
def api_queue_add(body: dict = Body(...)):
    return queue().add(str(body.get("projekt", "")), str(body.get("cam", "")), str(body.get("light", "")),
                       bool(body.get("dry_run", False)))


@app.get("/api/queue/{jid}")
def api_queue_job(jid: str):
    q = queue()
    job = q.jobs.get(jid)
    if not job:
        raise HTTPException(404, "Job unbekannt")
    return {**q.public(job), "log": q.log(jid)}


@app.post("/api/queue/{jid}/abbrechen")
def api_queue_cancel(jid: str):
    return queue().cancel(jid)


# ------------------------------------------------------------------ Zugriff und Kundenlinks
LOCAL_HOSTS = {"127.0.0.1", "::1", "localhost"}


def is_local(request: Request) -> bool:
    """Nur direkte Anfragen von diesem Rechner. Hinter einem Proxy (X-Forwarded-For) gilt nichts als lokal."""
    if request.headers.get("x-forwarded-for") or request.headers.get("forwarded") or request.headers.get("x-real-ip"):
        return False
    host = request.client.host if request.client else ""
    return host in LOCAL_HOSTS or host.startswith("127.")


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _link_status(link: dict) -> str:
    if link.get("widerrufen"):
        return "widerrufen"
    try:
        if datetime.fromisoformat(link["ablauf"]) <= datetime.now().astimezone():
            return "abgelaufen"
    except (KeyError, ValueError):
        return "abgelaufen"
    return "gueltig"


def find_link(pdir: Path, token: str) -> dict | None:
    """Gueltiger Kundenlink zum Token oder None. Vergleich nur ueber den Hash, zeitkonstant."""
    if not token or len(token) > 200:
        return None
    h = _token_hash(token)
    for link in read_json(pdir / "kundenlinks.json", {}).get("links", []):
        if hmac.compare_digest(str(link.get("hash", "")), h) and _link_status(link) == "gueltig":
            return link
    return None


def kunde_zugang(pdir: Path, request: Request, token: str) -> None:
    if token:
        link = find_link(pdir, token)
        if link is None:
            raise HTTPException(403, "Link ungültig, abgelaufen oder widerrufen")
        _touch_link(pdir, link["id"])
        return
    if not is_local(request):
        raise HTTPException(403, "Zugang nur mit gültigem Kundenlink")


_touched: dict[str, float] = {}


def _touch_link(pdir: Path, lid: str) -> None:
    """Letzten Zugriff merken, hoechstens einmal pro Minute schreiben."""
    key = f"{pdir}|{lid}"
    if time.time() - _touched.get(key, 0) < 60:
        return
    _touched[key] = time.time()
    with _lock:
        data = read_json(pdir / "kundenlinks.json", {"links": []})
        for link in data.get("links", []):
            if link.get("id") == lid:
                link["zuletzt"] = now_iso()
        write_json(pdir / "kundenlinks.json", data)


def _public_link(link: dict) -> dict:
    return {**{k: v for k, v in link.items() if k != "hash"}, "status": _link_status(link)}


@app.get("/api/projects/{slug}/kundenlinks")
def api_links(slug: str):
    pdir = project_dir(slug)
    links = read_json(pdir / "kundenlinks.json", {}).get("links", [])
    return {"links": [_public_link(x) for x in reversed(links)]}


@app.post("/api/projects/{slug}/kundenlinks")
def api_link_new(slug: str, body: dict = Body(...)):
    """{tage: 1..365, notiz}. Das Token wird nur in dieser Antwort gezeigt, gespeichert ist nur der Hash."""
    pdir = project_dir(slug)
    try:
        tage = int(body.get("tage", 30))
    except (TypeError, ValueError):
        raise HTTPException(400, "Gültigkeit in Tagen angeben")
    if not 1 <= tage <= 365:
        raise HTTPException(400, "Gültigkeit 1 bis 365 Tage")
    import secrets
    token = secrets.token_urlsafe(32)
    link = {"id": uuid.uuid4().hex[:10], "hash": _token_hash(token), "erstellt": now_iso(),
            "ablauf": (datetime.now().astimezone() + timedelta(days=tage)).isoformat(timespec="seconds"),
            "notiz": str(body.get("notiz", "") or "").strip()[:200], "widerrufen": None, "zuletzt": None}
    with _lock:
        data = read_json(pdir / "kundenlinks.json", {"links": []})
        data.setdefault("links", []).append(link)
        write_json(pdir / "kundenlinks.json", data)
    return {**_public_link(link), "token": token, "pfad": f"/kunde?p={slug}&t={token}"}


@app.post("/api/projects/{slug}/kundenlinks/{lid}/widerrufen")
def api_link_revoke(slug: str, lid: str):
    pdir = project_dir(slug)
    with _lock:
        data = read_json(pdir / "kundenlinks.json", {"links": []})
        for link in data.get("links", []):
            if link.get("id") == lid:
                link["widerrufen"] = link.get("widerrufen") or now_iso()
                write_json(pdir / "kundenlinks.json", data)
                return _public_link(link)
    raise HTTPException(404, "Link unbekannt")


# ------------------------------------------------------------------ Umgebung (context.json)
_ctx_cache: dict[str, tuple[float, dict]] = {}


def context_info(pdir: Path) -> dict:
    """Lat/Lon, Achsdrehung und ein verkleinerter Lageplan aus data/context.json (zwischengespeichert)."""
    f = pdir / "data" / "context.json"
    if not f.is_file():
        raise HTTPException(404, "data/context.json fehlt (immoviz.py geo ausführen)")
    m = f.stat().st_mtime
    hit = _ctx_cache.get(str(f))
    if hit and hit[0] == m:
        return hit[1]
    ctx = json.loads(f.read_text(encoding="utf-8"))
    r = lambda pts: [[round(x, 2), round(y, 2)] for x, y, *_ in pts]  # noqa: E731
    radius = 170.0

    def near(poly):
        return poly and min(math.hypot(x, y) for x, y, *_ in poly) <= radius

    hero_ids = {b.get("id") for b in ctx.get("hero", [])}
    info = {
        "lat": ctx.get("lat"), "lon": ctx.get("lon"),
        "x_axis_deg": (ctx.get("frame") or {}).get("x_axis_deg", 0.0),
        "radius": radius,
        "hero": [r(b["poly"]) for b in ctx.get("hero", []) if b.get("poly")],
        "gebaeude": [r(b["poly"]) for b in ctx.get("buildings", [])
                     if b.get("poly") and b.get("id") not in hero_ids and near(b["poly"])],
        "gehsteige": [r(s["poly"]) for s in ctx.get("surfaces", [])
                      if s.get("layer") in ("Gehsteig", "Gehweg, Radweg") and near(s.get("poly"))],
    }
    _ctx_cache[str(f)] = (m, info)
    return info


@app.get("/api/projects/{slug}/lageplan")
def api_lageplan(slug: str):
    info = context_info(project_dir(slug))
    return {k: info[k] for k in ("x_axis_deg", "radius", "hero", "gebaeude", "gehsteige")}


HIMMEL = ["N", "NNO", "NO", "ONO", "O", "OSO", "SO", "SSO", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]


def sonne(info: dict, date: str, tm: str, tz: float) -> dict:
    elev, az = sun_position(info["lat"], info["lon"], date, tm, tz)
    a, r = math.radians(az), math.radians(info["x_axis_deg"] or 0.0)
    east, north = math.sin(a), math.cos(a)
    # Richtung zur Sonne im lokalen Lageplan (x-Achse um x_axis_deg gegen Ost gedreht)
    lx, ly = east * math.cos(r) + north * math.sin(r), -east * math.sin(r) + north * math.cos(r)
    return {"hoehe": round(elev, 2), "azimut": round(az, 2), "himmelsrichtung": HIMMEL[int((az + 11.25) // 22.5) % 16],
            "lokal": [round(lx, 4), round(ly, 4)], "ueber_horizont": elev > 0}


@app.get("/api/projects/{slug}/sonne")
def api_sonne(slug: str, date: str, time: str, tz: float = 2):  # noqa: A002
    pdir = project_dir(slug)
    d, t, z = _check_date(date), _check_time(time), _num(tz, "tz", -12, 14)
    info = context_info(pdir)
    if info.get("lat") is None or info.get("lon") is None:
        raise HTTPException(400, "context.json ohne lat/lon")
    return sonne(info, d, t, z)


# ------------------------------------------------------------------ Kamera- und Licht-Editor
NAME_RE = re.compile(r"[a-z0-9_]{1,40}")
SEASONS = ("fruehling", "sommer", "spaetsommer", "herbst", "winter")
LIGHT_NUM = {"exposure": (-10, 10), "interior": (0, 10), "aerosol": (0, 20), "sky_strength": (0, 10)}


def _num(v, feld: str, lo: float, hi: float) -> float:
    if isinstance(v, bool):
        raise HTTPException(400, f"{feld}: Zahl erwartet")
    try:
        x = float(str(v).replace(",", ".")) if isinstance(v, str) else float(v)
    except (TypeError, ValueError):
        raise HTTPException(400, f"{feld}: Zahl erwartet")
    if not math.isfinite(x) or not lo <= x <= hi:
        raise HTTPException(400, f"{feld}: Wert zwischen {lo} und {hi} erwartet")
    return x


def _intish(x: float):
    return int(x) if float(x).is_integer() else x


def _check_name(n) -> str:
    n = str(n or "")
    if not NAME_RE.fullmatch(n):
        raise HTTPException(400, "Name: nur Kleinbuchstaben a bis z, Ziffern und Unterstrich, höchstens 40 Zeichen")
    return n


def _check_date(v) -> str:
    try:
        return datetime.strptime(str(v), "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "date: Datum als JJJJ-MM-TT")


def _check_time(v) -> str:
    try:
        return datetime.strptime(str(v), "%H:%M").strftime("%H:%M")
    except ValueError:
        raise HTTPException(400, "time: Uhrzeit als HH:MM")


def _vec(v, feld: str) -> list[float]:
    if not isinstance(v, (list, tuple)) or len(v) != 3:
        raise HTTPException(400, f"{feld}: drei Zahlen x, y, z")
    lim = [(-5000, 5000), (-5000, 5000), (-100, 1000)]
    return [round(_num(x, f"{feld} {'xyz'[i]}", *lim[i]), 3) for i, x in enumerate(v)]


def camera_values(body: dict) -> dict:
    """Pflichtfelder pos, target, lens; vertical optional (Standard true)."""
    out = {"pos": _vec(body.get("pos"), "pos"), "target": _vec(body.get("target"), "target"),
           "lens": _intish(round(_num(body.get("lens"), "lens", 8, 400), 1)),
           "vertical": bool(body.get("vertical", True))}
    if out["pos"] == out["target"]:
        raise HTTPException(400, "Position und Ziel dürfen nicht gleich sein")
    return out


def light_values(body: dict, create: bool) -> dict:
    from ruamel.yaml.scalarstring import DoubleQuotedScalarString as DQ
    out = {}
    for k in ("date", "time", "tz"):
        if k not in body and create:
            raise HTTPException(400, f"{k} fehlt")
    if "date" in body:
        out["date"] = DQ(_check_date(body["date"]))
    if "time" in body:
        out["time"] = DQ(_check_time(body["time"]))
    if "tz" in body:
        out["tz"] = _intish(_num(body["tz"], "tz", -12, 14))
    if "season" in body:
        s = body["season"]
        if s in (None, ""):
            out["season"] = None
        elif s in SEASONS:
            out["season"] = s
        else:
            raise HTTPException(400, f"season: einer von {', '.join(SEASONS)}")
    for k, (lo, hi) in LIGHT_NUM.items():
        if k in body:
            v = body[k]
            out[k] = None if v in (None, "") else round(_num(v, k, lo, hi), 3)
    if create:
        out = {k: v for k, v in out.items() if v is not None}
    return out


def _edit(pdir: Path, section: str, op: str, name: str, values=None, new_name=None) -> dict:
    with _lock:
        try:
            sec = edit_section(pdir / "project.yaml", section, op, name, values, new_name, history=pdir / ".history")
        except EditError as e:
            raise HTTPException(409 if "gibt es schon" in str(e) or "nicht gefunden" in str(e) else 400, str(e))
        _cfg_cache.pop(str(pdir / "project.yaml"), None)
    return sec


def _cam_list(pdir: Path) -> list[dict]:
    cams = load_cfg(pdir).get("cameras") or {}
    return [{"key": k, "label": label_cam(k), **(v or {})} for k, v in cams.items()]


def _light_list(pdir: Path) -> list[dict]:
    lights = load_cfg(pdir).get("lights") or {}
    try:
        info = context_info(pdir)
    except HTTPException:
        info = None
    out = []
    for k, v in lights.items():
        v = dict(v or {})
        e = {"key": k, "label": label_light(k), **v}
        if info and info.get("lat") is not None and v.get("date") and v.get("time"):
            try:
                e["sonne"] = sonne(info, str(v["date"]), str(v["time"]), float(v.get("tz", 1)))
            except (ValueError, TypeError):
                pass
        out.append(e)
    return out


def _render_count(pdir: Path, cam: str | None = None, light: str | None = None) -> int:
    """Anzahl vorhandener Blender-Bilder zu einem Motiv oder Licht (bleiben beim Loeschen erhalten)."""
    rd = pdir / "renders"
    if not rd.is_dir():
        return 0
    cfg = load_cfg(pdir)
    cams = list((cfg.get("cameras") or {}).keys()) + ([cam] if cam else [])
    lights = list((cfg.get("lights") or {}).keys()) + ([light] if light else [])
    stems = set()
    for f in rd.iterdir():
        hit = match_strict(pdir.name, f.stem, cams, lights) if f.is_file() else None
        if hit and (hit[0] == cam or hit[1] == light):
            stems.add(f.stem)
    return len(stems)


@app.get("/api/projects/{slug}/kameras")
def api_cams(slug: str):
    return {"kameras": _cam_list(project_dir(slug))}


@app.post("/api/projects/{slug}/kameras")
def api_cam_new(slug: str, body: dict = Body(...)):
    pdir = project_dir(slug)
    _edit(pdir, "cameras", "create", _check_name(body.get("name")), camera_values(body))
    return {"kameras": _cam_list(pdir)}


@app.put("/api/projects/{slug}/kameras/{name}")
def api_cam_set(slug: str, name: str, body: dict = Body(...)):
    pdir = project_dir(slug)
    new = _check_name(body.get("name") or name)
    _edit(pdir, "cameras", "update", _check_name(name), camera_values(body), new if new != name else None)
    return {"kameras": _cam_list(pdir)}


@app.delete("/api/projects/{slug}/kameras/{name}")
def api_cam_del(slug: str, name: str):
    pdir = project_dir(slug)
    _edit(pdir, "cameras", "delete", _check_name(name))
    return {"kameras": _cam_list(pdir), "renderings_behalten": _render_count(pdir, cam=name)}


@app.get("/api/projects/{slug}/lichter")
def api_lights(slug: str):
    return {"lichter": _light_list(project_dir(slug)), "jahreszeiten": SEASONS, "zahlen": LIGHT_NUM}


@app.post("/api/projects/{slug}/lichter")
def api_light_new(slug: str, body: dict = Body(...)):
    pdir = project_dir(slug)
    _edit(pdir, "lights", "create", _check_name(body.get("name")), light_values(body, True))
    return {"lichter": _light_list(pdir)}


@app.put("/api/projects/{slug}/lichter/{name}")
def api_light_set(slug: str, name: str, body: dict = Body(...)):
    pdir = project_dir(slug)
    new = _check_name(body.get("name") or name)
    if new != name:
        _light_in_use(pdir, name)
    _edit(pdir, "lights", "update", _check_name(name), light_values(body, False), new if new != name else None)
    return {"lichter": _light_list(pdir)}


def _light_in_use(pdir: Path, name: str) -> None:
    w = pdir / "wohnungen.yaml"
    if w.is_file() and re.search(rf"^\s*-?\s*light:\s*{re.escape(name)}\s*(#.*)?$", w.read_text(encoding="utf-8"), re.M):
        raise HTTPException(409, f"Licht '{name}' wird in wohnungen.yaml verwendet")


@app.delete("/api/projects/{slug}/lichter/{name}")
def api_light_del(slug: str, name: str):
    pdir = project_dir(slug)
    _light_in_use(pdir, _check_name(name))
    _edit(pdir, "lights", "delete", name)
    return {"lichter": _light_list(pdir), "renderings_behalten": _render_count(pdir, light=name)}


# ------------------------------------------------------------------ Upload in quellen/
UPLOAD_EXT = {".pdf", ".dwg", ".jpg", ".jpeg", ".png", ".xlsx", ".docx"}
UPLOAD_MAX = 100_000_000
MAGIC = {".pdf": [b"%PDF"], ".png": [b"\x89PNG"], ".jpg": [b"\xff\xd8\xff"], ".jpeg": [b"\xff\xd8\xff"],
         ".xlsx": [b"PK\x03\x04"], ".docx": [b"PK\x03\x04"], ".dwg": [b"AC10", b"AC1."]}


def clean_filename(name: str) -> str:
    """Nur der letzte Pfadteil, Umlaute umschreiben, erlaubt [A-Za-z0-9._-], keine fuehrenden Punkte."""
    base = re.split(r"[\\/]", str(name or ""))[-1]
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("Ä", "Ae"), ("Ö", "Oe"), ("Ü", "Ue"), ("ß", "ss")):
        base = base.replace(a, b)
    base = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode()
    base = re.sub(r"[^A-Za-z0-9._-]+", "_", base)
    base = re.sub(r"_+", "_", base).strip("._-")
    stem, dot, ext = base.rpartition(".")
    if not dot:
        stem, ext = base, ""
    stem = stem.strip("._-")[:100] or "datei"
    return f"{stem}.{ext.lower()}" if ext else stem


def _magic_ok(ext: str, head: bytes) -> bool:
    sig = MAGIC.get(ext)
    if not sig:
        return True
    if ext == ".dwg":
        return head[:2] == b"AC"
    return any(head.startswith(s) for s in sig)


@app.put("/api/projects/{slug}/quellen")
async def api_upload(slug: str, request: Request, name: str = Query(..., max_length=300), punkt: str = ""):
    """Rohdaten im Body (kein multipart), Dateiname als ?name=. Ziel: projects/<slug>/quellen/."""
    pdir = project_dir(slug)
    fn = clean_filename(name)
    ext = Path(fn).suffix.lower()
    if ext not in UPLOAD_EXT:
        raise HTTPException(415, f"Dateityp nicht erlaubt. Erlaubt: {', '.join(sorted(UPLOAD_EXT))}")
    if punkt and punkt not in {i["id"] for i in intake_items()}:
        raise HTTPException(400, "Intake-Punkt unbekannt")
    try:
        cl = int(request.headers.get("content-length") or 0)
    except ValueError:
        cl = 0
    if cl > UPLOAD_MAX:
        raise HTTPException(413, f"Datei größer als {UPLOAD_MAX // 1_000_000} MB")
    qd = (pdir / "quellen")
    qd.mkdir(exist_ok=True)
    qroot = qd.resolve()
    tmp = qd / f".upload-{uuid.uuid4().hex}.part"
    size, head = 0, b""
    try:
        with tmp.open("wb") as fh:
            async for chunk in request.stream():
                if not chunk:
                    continue
                size += len(chunk)
                if size > UPLOAD_MAX:
                    raise HTTPException(413, f"Datei größer als {UPLOAD_MAX // 1_000_000} MB")
                if len(head) < 8:
                    head += chunk[:8 - len(head)]
                fh.write(chunk)
        if size == 0:
            raise HTTPException(400, "Leere Datei")
        if not _magic_ok(ext, head):
            raise HTTPException(415, f"Inhalt passt nicht zur Endung {ext}")
        with _lock:
            stem, final = Path(fn).stem, qd / fn
            i = 2
            while final.exists():
                final = qd / f"{stem}_{i}{ext}"
                i += 1
            if not final.resolve().parent == qroot:
                raise HTTPException(400, "Ungültiger Dateiname")
            tmp.replace(final)
            if punkt:
                data = read_json(pdir / "intake.json", {"punkte": {}})
                data.setdefault("dateien", {})[final.name] = {"punkt": punkt, "hochgeladen": now_iso()}
                write_json(pdir / "intake.json", data)
    finally:
        if tmp.exists():
            tmp.unlink()
    return {"datei": final.name, "bytes": size, **intake_state(pdir)}


@app.put("/api/projects/{slug}/quellen/{name}")
def api_quelle_punkt(slug: str, name: str, body: dict = Body(...)):
    """Zuordnung einer Datei in quellen/ zu einem Intake-Punkt ({punkt: id oder ""})."""
    pdir = project_dir(slug)
    qd = (pdir / "quellen").resolve()
    f = (qd / name).resolve()
    if f.parent != qd or not f.is_file() or name.startswith("."):
        raise HTTPException(404, "Datei nicht gefunden")
    punkt = str(body.get("punkt") or "")
    if punkt and punkt not in {i["id"] for i in intake_items()}:
        raise HTTPException(400, "Intake-Punkt unbekannt")
    with _lock:
        data = read_json(pdir / "intake.json", {"punkte": {}})
        d = data.setdefault("dateien", {})
        if punkt:
            d[f.name] = {**(d.get(f.name) or {}), "punkt": punkt, "zugeordnet": now_iso()}
        else:
            d.pop(f.name, None)
        write_json(pdir / "intake.json", data)
    return intake_state(pdir)


# ------------------------------------------------------------------ Walkthrough (nur lesen)
def _point_notes(seq) -> list[str]:
    """Kommentare am Zeilenende der Wegpunkte aus dem ruamel-Baum."""
    notes = []
    for i in range(len(seq)):
        txt = ""
        c = getattr(seq, "ca", None)
        tok = c.items.get(i) if c else None
        if tok:
            for t in tok:
                if t is not None and hasattr(t, "value"):
                    txt = t.value
                    break
        if not txt and hasattr(seq[i], "ca"):
            for v in seq[i].ca.items.values():
                for t in v or []:
                    if t is not None and hasattr(t, "value"):
                        txt = t.value
        notes.append(txt.strip().lstrip("#").strip().splitlines()[0] if txt.strip() else "")
    return notes


@app.get("/api/projects/{slug}/walkthrough")
def api_walkthrough(slug: str):
    pdir = project_dir(slug)
    rd = pdir / "renders"
    vids = [m for m in media_items(pdir) if m["typ"] == "video"]
    out = {"videos": [{"rel": v["rel"], "name": v["name"], "url": file_url(slug, v["rel"]), "bytes": v["bytes"]}
                      for v in vids if v["rel"].startswith("video/")], "wohnungen": []}
    w = pdir / "wohnungen.yaml"
    if not w.is_file():
        return out
    from ruamel.yaml import YAML
    try:
        doc = YAML(typ="rt").load(w.read_text(encoding="utf-8")) or {}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(500, f"wohnungen.yaml nicht lesbar: {e}")
    for top, wd in (doc.get("wohnungen") or {}).items():
        wk = (wd or {}).get("walkthrough")
        if not wk:
            continue
        pts = wk.get("punkte") or []
        notes = _point_notes(pts)
        wdir = rd / "walkthrough" / str(top)
        punkte = []
        for i, p in enumerate(pts):
            still = None
            for cand in (f"staging_k{i:02d}.jpg", f"k{i:02d}.jpg", f"k{i:02d}.png"):
                if (wdir / cand).is_file():
                    rel = f"walkthrough/{top}/{cand}"
                    still = {"rel": rel, "thumb": thumb_url(slug, rel, 360), "url": file_url(slug, rel)}
                    break
            punkte.append({"nr": i, "t": p.get("t"), "pos": list(p.get("pos") or []), "target": list(p.get("target") or []),
                           "lens": p.get("lens"), "notiz": notes[i], "bild": still})
        out["wohnungen"].append({
            "top": str(top), "titel": str(wd.get("titel", top)), "sekunden": wk.get("sekunden"),
            "licht": str(wk.get("light") or wd.get("light") or ""), "punkte": punkte,
            "videos": [{"rel": v["rel"], "name": v["name"], "url": file_url(slug, v["rel"]), "bytes": v["bytes"]}
                       for v in vids if v["rel"].startswith(f"walkthrough/{top}/")]})
    return out


# ------------------------------------------------------------------ Phase C: Fassaden-, Dach-Editor, Planabgleich
ROW_TYPES = ("kastenfenster", "schaufenster", "haustor")
SURROUNDS = ("fasche", "fasche_verdachung", "aedikula")
EG_TYPES = ("haustor", "schaufenster", "kastenfenster")


def _r(x) -> float:
    return round(float(x), 3)


def _f(v, feld: str, lo: float = -1000, hi: float = 1000) -> float:
    return _r(_num(v, feld, lo, hi))


def _pair(v, feld: str, lo: float = -1000, hi: float = 1000, steigend: bool = True) -> list[float]:
    if not isinstance(v, (list, tuple)) or len(v) != 2:
        raise HTTPException(400, f"{feld}: zwei Zahlen [von, bis] erwartet")
    a, b = _f(v[0], feld, lo, hi), _f(v[1], feld, lo, hi)
    if steigend and not a < b:
        raise HTTPException(400, f"{feld}: 'von' muss kleiner als 'bis' sein")
    return [a, b]


def _fac_len(cfg: dict, name: str) -> float:
    f = (cfg.get("facades") or {}).get(name) or {}
    try:
        (ax, ay), (bx, by) = f["a"], f["b"]
        return round(math.hypot(bx - ax, by - ay), 3)
    except (KeyError, TypeError, ValueError):
        return 0.0


def ppm_of(c: dict) -> float:
    """Pixel je Meter wie lib/check.px_per_m (dort nicht importierbar, braucht bpy)."""
    return float(c.get("dpi", 130)) / 0.0254 / float(c.get("scale", 100))


def _pdf_path(pdir: Path, rel: str) -> Path:
    q = (pdir / "quellen").resolve()
    p = (pdir / str(rel or "")).resolve()
    if not str(rel).lower().endswith(".pdf") or not p.is_relative_to(q) or not p.is_file():
        raise HTTPException(404, f"Plan {rel} nicht gefunden (PDF unter quellen/)")
    return p


def plan_png(pdir: Path, rel: str, page: int, dpi: int) -> Path:
    """PDF-Seite als PNG, gecacht unter data/plan_cache/<datei>_p<seite>_<dpi>.png (pdftoppm)."""
    pdf = _pdf_path(pdir, rel)
    if not 1 <= page <= 999 or not 30 <= dpi <= 600:
        raise HTTPException(400, "Seite 1 bis 999, dpi 30 bis 600")
    cache = pdir / "data" / "plan_cache"
    stem = re.sub(r"[^A-Za-z0-9_-]+", "_", pdf.stem)[:80]
    out = cache / f"{stem}_p{page}_{dpi}.png"
    if out.is_file() and out.stat().st_mtime >= pdf.stat().st_mtime:
        return out
    cache.mkdir(parents=True, exist_ok=True)
    tmp = cache / f".tmp_{uuid.uuid4().hex}"
    try:
        subprocess.run(["pdftoppm", "-r", str(dpi), "-png", "-f", str(page), "-l", str(page), "-singlefile",
                        str(pdf), str(tmp)], check=True, capture_output=True, timeout=120)
    except FileNotFoundError:
        raise HTTPException(500, "pdftoppm fehlt (poppler-utils installieren)")
    except subprocess.CalledProcessError as e:
        raise HTTPException(400, f"PDF lässt sich nicht rendern: {e.stderr.decode(errors='replace')[:200]}")
    Path(str(tmp) + ".png").replace(out)
    return out


@app.get("/api/projects/{slug}/planbild")
def api_planbild(slug: str, pdf: str, page: int = 1, dpi: int = 130):
    return FileResponse(plan_png(project_dir(slug), pdf, page, dpi), media_type="image/png",
                        headers={"Cache-Control": "no-cache"})


def fassaden_state(pdir: Path) -> dict:
    cfg = load_cfg(pdir)
    A = cfg.get("altbau") or {}
    checks = cfg.get("checks") or {}
    out = []
    for name in (cfg.get("facades") or {}):
        fs = (A.get("facades") or {}).get(name) or {}
        out.append({"name": name, "laenge": _fac_len(cfg, name), "axes": fs.get("axes") or [],
                    "endcaps": fs.get("endcaps") or [], "eg": fs.get("eg") or [], "check": checks.get(name)})
    qd = pdir / "quellen"
    pdfs = sorted(f"quellen/{f.name}" for f in qd.glob("*.pdf")) if qd.is_dir() else []
    site = cfg.get("site") or {}
    return {"fassaden": out, "rows": A.get("rows") or {}, "cornices": A.get("cornices") or [],
            "slabs": A.get("slabs") or [], "height": A.get("height"), "sockel": A.get("sockel"),
            "ground_wn": site.get("ground_wn"), "pdfs": pdfs, "row_types": ROW_TYPES, "surrounds": SURROUNDS,
            "eg_types": EG_TYPES, "dach_z": sorted({_r(w["z"][0]) for w in ((cfg.get("dach") or {}).get("walls") or [])
                                                    if isinstance(w, dict) and isinstance(w.get("z"), list)}
                                                   | {_r(w["z"][1]) for w in ((cfg.get("dach") or {}).get("walls") or [])
                                                      if isinstance(w, dict) and isinstance(w.get("z"), list)})}


@app.get("/api/projects/{slug}/fassaden")
def api_fassaden(slug: str):
    return fassaden_state(project_dir(slug))


def _v_rows(rows) -> dict:
    if not isinstance(rows, dict) or not rows:
        raise HTTPException(400, "rows: mindestens eine Geschosszeile")
    out = {}
    for name, r in rows.items():
        _check_name(name)
        if not isinstance(r, dict):
            raise HTTPException(400, f"rows.{name}: Eintrag erwartet")
        typ = r.get("type", "kastenfenster")
        if typ not in ROW_TYPES:
            raise HTTPException(400, f"rows.{name}.type: einer von {', '.join(ROW_TYPES)}")
        sur = r.get("surround")
        if sur not in (None, "", *SURROUNDS):
            raise HTTPException(400, f"rows.{name}.surround: einer von {', '.join(SURROUNDS)} oder leer")
        out[name] = {"z": _f(r.get("z"), f"rows.{name}.z", -5, 200), "h": _f(r.get("h"), f"rows.{name}.h", 0.1, 20),
                     "w": _f(r.get("w"), f"rows.{name}.w", 0.1, 20), "type": typ, "surround": sur or None}
    return out


def _v_eg(eg, n_axes: int) -> list:
    if not isinstance(eg, list):
        raise HTTPException(400, "eg: Liste erwartet")
    out, seen = [], set()
    for i, g in enumerate(eg):
        if not isinstance(g, dict):
            raise HTTPException(400, f"eg[{i}]: Eintrag erwartet")
        axes = g.get("axes")
        if not isinstance(axes, list) or not axes or not all(isinstance(a, int) and not isinstance(a, bool) for a in axes):
            raise HTTPException(400, f"eg[{i}].axes: Achsnummern erwartet")
        for a in axes:
            if not 0 <= a < n_axes:
                raise HTTPException(400, f"eg[{i}]: Achse {a} gibt es nicht ({n_axes} Achsen)")
            if a in seen:
                raise HTTPException(400, f"eg: Achse {a} doppelt belegt")
            seen.add(a)
        typ = g.get("type")
        if typ not in EG_TYPES:
            raise HTTPException(400, f"eg[{i}].type: einer von {', '.join(EG_TYPES)}")
        e = {"axes": sorted(axes), "type": typ}
        if g.get("u") is not None:
            e["u"] = _pair(g["u"], f"eg[{i}].u", -5, 500)
        elif typ == "haustor":
            raise HTTPException(400, f"eg[{i}]: Haustor braucht u von bis")
        if g.get("z") is not None:
            e["z"] = _pair(g["z"], f"eg[{i}].z", -5, 50)
        if g.get("keller"):
            e["keller"] = True
        out.append(e)
    return out


def _v_cornices(cs) -> list:
    if not isinstance(cs, list):
        raise HTTPException(400, "cornices: Liste erwartet")
    out = []
    for i, c in enumerate(cs):
        if not isinstance(c, dict):
            raise HTTPException(400, f"cornices[{i}]: Eintrag erwartet")
        name = _check_name(c.get("name") or f"gesims_{i + 1}")
        steps = c.get("steps")
        if not isinstance(steps, list) or not steps:
            raise HTTPException(400, f"{name}: steps fehlen")
        st = []
        for s_ in steps:
            if not isinstance(s_, (list, tuple)) or len(s_) != 3:
                raise HTTPException(400, f"{name}: Stufe [z von, z bis, Ausladung] erwartet")
            a, b = _pair(s_[:2], f"{name}.steps", -5, 200)
            st.append([a, b, _f(s_[2], f"{name}.Ausladung", 0, 3)])
        e = {"name": name, "steps": st}
        if isinstance(c.get("consoles"), dict):
            k = c["consoles"]
            e["consoles"] = {"z": _pair(k.get("z"), f"{name}.consoles.z", -5, 200),
                             "w": _f(k.get("w"), f"{name}.consoles.w", 0.01, 3),
                             "proj": _f(k.get("proj"), f"{name}.consoles.proj", 0, 3)}
        out.append(e)
    return out


def _v_check(c, pdir: Path) -> dict:
    if not isinstance(c, dict):
        raise HTTPException(400, "check: Eintrag erwartet")
    _pdf_path(pdir, c.get("pdf"))
    if not isinstance(c.get("u0_px"), (list, tuple)) or len(c["u0_px"]) != 2:
        raise HTTPException(400, "u0_px: zwei Pixelwerte")
    out = {"pdf": str(c["pdf"]), "page": int(_num(c.get("page", 1), "page", 1, 999)),
           "dpi": int(_num(c.get("dpi", 130), "dpi", 30, 600)), "scale": int(_num(c.get("scale", 100), "scale", 1, 5000)),
           "u0_px": [int(round(_num(v, "u0_px", -100000, 100000))) for v in c["u0_px"]],
           "span": _pair(c.get("span"), "span", -200, 500), "z": _pair(c.get("z"), "z", -50, 300)}
    lv = c.get("levels") or []
    if not isinstance(lv, list):
        raise HTTPException(400, "levels: Liste")
    out["levels"] = sorted(_f(v, "levels", -50, 300) for v in lv)
    return out


@app.put("/api/projects/{slug}/fassaden/{name}")
def api_fassade_set(slug: str, name: str, body: dict = Body(...)):
    """{axes?, eg?, rows?, cornices?, check?}: ersetzt die betroffenen Bloecke in einem Schritt."""
    pdir = project_dir(slug)
    cfg = load_cfg(pdir)
    if name not in (cfg.get("facades") or {}):
        raise HTTPException(404, f"Fassade {name} nicht in facades")
    L = _fac_len(cfg, name)
    changes = []
    fs = ((cfg.get("altbau") or {}).get("facades") or {}).get(name) or {}
    n_axes = len(fs.get("axes") or [])
    if "axes" in body:
        ax = body["axes"]
        if not isinstance(ax, list):
            raise HTTPException(400, "axes: Liste")
        ax = sorted(_f(u, "Achse", -1, L + 1) for u in ax)
        if any(b - a < 0.2 for a, b in zip(ax, ax[1:])):
            raise HTTPException(400, "Achsen näher als 20 cm")
        changes.append((["altbau", "facades", name, "axes"], ax))
        n_axes = len(ax)
    if "eg" in body:
        changes.append((["altbau", "facades", name, "eg"], _v_eg(body["eg"], n_axes)))
    elif "axes" in body and any(a >= n_axes for g in fs.get("eg") or [] for a in g.get("axes", [])):
        raise HTTPException(400, "EG-Overrides verweisen auf gelöschte Achsen, bitte mitspeichern")
    if "rows" in body:
        changes.append((["altbau", "rows"], _v_rows(body["rows"])))
    if "cornices" in body:
        changes.append((["altbau", "cornices"], _v_cornices(body["cornices"])))
    if "check" in body:
        changes.append((["checks", name], _v_check(body["check"], pdir)))
    if not changes:
        raise HTTPException(400, "Nichts zu speichern")
    _replace(pdir, changes)
    return fassaden_state(pdir)


def _replace(pdir: Path, changes: list) -> None:
    with _lock:
        try:
            replace_blocks(pdir / "project.yaml", changes, history=pdir / ".history")
        except EditError as e:
            raise HTTPException(400, str(e))
        _cfg_cache.pop(str(pdir / "project.yaml"), None)


# ---- Dach
DACH_LISTS = {
    "walls": {"facade": "fassade", "u": "pair", "z": "pair", "d": "num", "windows": "list", "loggias": "list",
              "axes_from": "str", "w": "num", "rows": "list"},
    "slopes": {"facade": "fassade", "u": "pair", "z": "pair", "d": "pair", "roof_windows": "list"},
    "volumes": {"z": "pair", "clip": "list"},
    "railings": {"facade": "fassade", "u": "pair", "z": "num", "d": "num", "h": "num", "type": "str"},
    "slabs": {"z": "num", "t": "num", "clip": "list"},
}
DACH_REQUIRED = {"walls": ("facade", "u", "z", "d"), "slopes": ("facade", "u", "z", "d"), "volumes": ("z",),
                 "railings": ("facade", "u", "z", "d", "h"), "slabs": ("z", "t")}


def _jsonish(v, feld: str, depth: int = 0):
    if depth > 6:
        raise HTTPException(400, f"{feld}: zu tief verschachtelt")
    if isinstance(v, bool) or v is None:
        return v
    if isinstance(v, (int, float)):
        return _f(v, feld, -100000, 100000) if isinstance(v, float) else v
    if isinstance(v, str):
        if len(v) > 80:
            raise HTTPException(400, f"{feld}: Text zu lang")
        return v
    if isinstance(v, list):
        return [_jsonish(x, feld, depth + 1) for x in v]
    if isinstance(v, dict):
        return {str(k): _jsonish(x, feld, depth + 1) for k, x in v.items()}
    raise HTTPException(400, f"{feld}: ungültiger Wert")


def _v_dach(liste: str, items, cfg: dict) -> list:
    if liste not in DACH_LISTS:
        raise HTTPException(404, "Liste unbekannt")
    if not isinstance(items, list):
        raise HTTPException(400, "Liste erwartet")
    facs = set((cfg.get("facades") or {}).keys())
    schema = DACH_LISTS[liste]
    out = []
    for i, it in enumerate(items):
        if not isinstance(it, dict):
            raise HTTPException(400, f"{liste}[{i}]: Eintrag erwartet")
        for k in DACH_REQUIRED[liste]:
            if it.get(k) in (None, "", []):
                raise HTTPException(400, f"{liste}[{i}]: {k} fehlt")
        e = {}
        for k, v in it.items():
            if v is None or v == "":
                continue
            kind = schema.get(k)
            feld = f"{liste}[{i}].{k}"
            if kind == "fassade":
                if v not in facs:
                    raise HTTPException(400, f"{feld}: Fassade {v} unbekannt")
                e[k] = v
            elif kind == "pair":
                e[k] = _pair(v, feld, -100, 300)
            elif kind == "num":
                e[k] = _f(v, feld, -100, 300)
            elif kind == "str":
                e[k] = str(v)[:40]
            elif kind == "list":
                if not isinstance(v, list):
                    raise HTTPException(400, f"{feld}: Liste erwartet")
                e[k] = _jsonish(v, feld)
            else:
                e[k] = _jsonish(v, feld)
        out.append(e)
    return out


@app.get("/api/projects/{slug}/dach")
def api_dach(slug: str):
    pdir = project_dir(slug)
    cfg = load_cfg(pdir)
    D = cfg.get("dach") or {}
    A = cfg.get("altbau") or {}
    return {"listen": {k: D.get(k) or [] for k in DACH_LISTS}, "schema": DACH_LISTS, "pflicht": DACH_REQUIRED,
            "fassaden": [{"name": n, "laenge": _fac_len(cfg, n),
                          "axes": (((A.get("facades") or {}).get(n) or {}).get("axes") or [])}
                         for n in (cfg.get("facades") or {})],
            "height": A.get("height"), "slabs": A.get("slabs") or [], "boxes": D.get("boxes") or []}


@app.put("/api/projects/{slug}/dach/{liste}")
def api_dach_set(slug: str, liste: str, body: dict = Body(...)):
    pdir = project_dir(slug)
    cfg = load_cfg(pdir)
    if not isinstance(cfg.get("dach"), dict):
        raise HTTPException(400, "Abschnitt dach fehlt in project.yaml")
    items = _v_dach(liste, body.get("eintraege"), cfg)
    _replace(pdir, [(["dach", liste], items)])
    return api_dach(slug)


# ---- Planabgleich
def abgleich_state(slug: str, pdir: Path) -> dict:
    cfg = load_cfg(pdir)
    out = []
    for name, c in (cfg.get("checks") or {}).items():
        cd = pdir / "renders" / "check"
        e = {"fassade": name, "check": c}
        for key, fn in (("abgleich", f"{name}_abgleich.jpg"), ("modell", f"{name}_modell.png")):
            f = cd / fn
            e[key] = {"url": file_url(slug, f"check/{fn}") + f"?v={int(f.stat().st_mtime)}",
                      "datum": datetime.fromtimestamp(f.stat().st_mtime).strftime("%d.%m.%Y %H:%M")} if f.is_file() else None
        try:
            ppm = ppm_of(c)
            e["groesse"] = [int(round((c["span"][1] - c["span"][0]) * ppm)), int(round((c["z"][1] - c["z"][0]) * ppm))]
        except (KeyError, TypeError, ValueError):
            e["groesse"] = None
        e["plan"] = f"/api/projects/{slug}/abgleich/{name}/plan.png"
        out.append(e)
    jobs = [j for j in queue().list(slug) if j.get("art") == "check"][:5]
    return {"fassaden": out, "jobs": jobs, "trockenlauf_erzwungen": FORCE_DRY}


@app.get("/api/projects/{slug}/abgleich")
def api_abgleich(slug: str):
    return abgleich_state(slug, project_dir(slug))


@app.get("/api/projects/{slug}/abgleich/{name}/plan.png")
def api_abgleich_plan(slug: str, name: str):
    """Planausschnitt in derselben Lage und Groesse wie das orthogonale Modellbild (lib/check.overlay)."""
    pdir = project_dir(slug)
    c = (load_cfg(pdir).get("checks") or {}).get(name)
    if not c:
        raise HTTPException(404, "Kein Planabgleich für diese Fassade")
    src = plan_png(pdir, c["pdf"], int(c.get("page", 1)), int(c["dpi"]))
    ppm = ppm_of(c)
    w, h = int(round((c["span"][1] - c["span"][0]) * ppm)), int(round((c["z"][1] - c["z"][0]) * ppm))
    ox = int(round(c["u0_px"][0] + c["span"][0] * ppm))
    oy = int(round(c["u0_px"][1] - c["z"][1] * ppm))
    from PIL import Image
    with Image.open(src) as im:
        crop = im.convert("RGB").crop((ox, oy, ox + w, oy + h))
        buf = io.BytesIO()
        crop.save(buf, "PNG", optimize=True)
    return Response(buf.getvalue(), media_type="image/png", headers={"Cache-Control": "no-cache"})


@app.post("/api/projects/{slug}/abgleich")
def api_abgleich_start(slug: str, body: dict = Body(...)):
    pdir = project_dir(slug)
    name = str(body.get("fassade", ""))
    cfg = load_cfg(pdir)
    if name not in (cfg.get("checks") or {}):
        raise HTTPException(400, f"Für {name} fehlt checks.{name} (im Fassaden-Editor kalibrieren)")
    dry = bool(body.get("dry_run") or FORCE_DRY)
    if dry:
        cmd = [sys.executable, "-c", "import time;print('Trockenlauf: kein Blender, vorhandenes Abgleichsbild bleibt',"
               " flush=True);time.sleep(1.5)"]
    else:
        cmd = [sys.executable, str(CLI), "check", str(pdir), "--facade", name]
    return queue().add_job(slug, "check", cmd=cmd, dry=dry, cam="planabgleich", light=name,
                           befehl=f"immoviz.py check projects/{slug} --facade {name}" + (" (Trockenlauf)" if dry else ""))


# ---- Neues Objekt
VORLAGE = ROOT / "projects" / "_vorlage"
SLUG_RE = re.compile(r"[a-z0-9][a-z0-9-]{1,60}")


@app.post("/api/projects")
def api_project_new(body: dict = Body(...)):
    """{slug, name, adresse, kunde, origin_gk: [x, y], x_axis_deg, fassade_a: {name, laenge},
    fassade_b?: {name, laenge}, geo: bool, dry_run: bool}"""
    slug = str(body.get("slug", "")).strip()
    if not SLUG_RE.fullmatch(slug):
        raise HTTPException(400, "Slug: Kleinbuchstaben, Ziffern und Bindestrich, z. B. hauptstrasse-12")
    target = PROJECTS / slug
    if target.exists():
        raise HTTPException(409, f"Projekt {slug} gibt es schon")
    tpl = VORLAGE / "project.yaml"
    if not tpl.is_file():
        raise HTTPException(500, "Vorlage projects/_vorlage/project.yaml fehlt")
    name = str(body.get("name") or slug).strip()[:120]
    adresse = str(body.get("adresse") or "").strip()[:200]
    if not adresse:
        raise HTTPException(400, "Adresse fehlt")
    og = body.get("origin_gk")
    if not isinstance(og, (list, tuple)) or len(og) != 2:
        raise HTTPException(400, "Ursprung: GK-Koordinaten x und y (EPSG:31256)")
    origin = [round(_num(og[0], "GK x", -200000, 200000), 2), round(_num(og[1], "GK y", 0, 1000000), 2)]
    deg = round(_num(body.get("x_axis_deg"), "Fassadenrichtung", -360, 360), 2)
    fa = body.get("fassade_a") or {}
    fb = body.get("fassade_b") or None
    na, la = _check_name(fa.get("name")), _f(fa.get("laenge"), "Länge Fassade A", 1, 500)
    facades = {na: {"a": [0.0, 0.0], "b": [la, 0.0]}}
    if fb and fb.get("name"):
        nb, lb = _check_name(fb.get("name")), _f(fb.get("laenge"), "Länge Fassade B", 1, 500)
        if nb == na:
            raise HTTPException(400, "Fassaden brauchen verschiedene Namen")
        facades = {nb: {"a": [0.0, lb], "b": [0.0, 0.0]}, **facades}
    from ruamel.yaml.scalarstring import DoubleQuotedScalarString as DQ
    tmp = PROJECTS / f".neu-{uuid.uuid4().hex[:8]}"
    try:
        tmp.mkdir(parents=True)
        for d in ("quellen", "data", "renders"):
            (tmp / d).mkdir()
        shutil.copy2(tpl, tmp / "project.yaml")
        if (VORLAGE / "prompts.yaml").is_file():
            shutil.copy2(VORLAGE / "prompts.yaml", tmp / "prompts.yaml")
        first = na
        tpl_cfg = yaml.safe_load(tpl.read_text(encoding="utf-8")) or {}
        tpl_fac = next(iter(tpl_cfg.get("facades") or {}), None)

        def swap(v):  # Fassadenname der Vorlage durch Fassade A ersetzen (dach-Listen)
            if isinstance(v, dict):
                return {k: swap(x) for k, x in v.items()}
            if isinstance(v, list):
                return [swap(x) for x in v]
            return na if v == tpl_fac else v
        dach_changes = [(["dach", k], swap(v)) for k, v in (tpl_cfg.get("dach") or {}).items()
                        if isinstance(v, list) and v and tpl_fac and tpl_fac in json.dumps(v)]
        changes = dach_changes + [
            (["project", "name"], name), (["project", "slug"], slug),
            (["project", "client"], str(body.get("kunde") or "").strip()[:120] or "offen"),
            (["site", "address"], adresse), (["site", "origin_gk"], origin), (["site", "x_axis_deg"], deg),
            (["facades"], facades),
            (["altbau", "facades"], {n: {"axes": [], "endcaps": [], "eg": []} for n in facades}),
            (["checks"], {first: {"pdf": DQ(f"quellen/{first}_ansicht.pdf"), "page": 1, "dpi": 130, "scale": 100,
                                  "u0_px": [0, 0], "span": [-2.0, round(_fac_len({"facades": facades}, first) + 2, 2)],
                                  "z": [-0.5, 26.5], "levels": []}}),
        ]
        replace_blocks(tmp / "project.yaml", changes)
        tmp.rename(target)
    except EditError as e:
        shutil.rmtree(tmp, ignore_errors=True)
        raise HTTPException(400, str(e))
    except Exception:
        shutil.rmtree(tmp, ignore_errors=True)
        raise
    job = None
    if body.get("geo"):
        dry = bool(body.get("dry_run") or FORCE_DRY)
        cmd = [sys.executable, "-c", "import time;print('Trockenlauf: keine Abfrage bei Stadt Wien', flush=True);"
               "time.sleep(1)"] if dry else [sys.executable, str(CLI), "geo", str(target)]
        job = queue().add_job(slug, "geo", cmd=cmd, dry=dry, cam="umgebung", light="",
                              befehl=f"immoviz.py geo projects/{slug}" + (" (Trockenlauf)" if dry else ""))
    return {"slug": slug, "job": job}


# ------------------------------------------------------------------ Higgsfield-Veredelung
HF: Higgsfield | None = None


def hf() -> Higgsfield:
    global HF
    if HF is None:
        HF = Higgsfield(dry=FORCE_DRY)
    return HF


@app.get("/api/higgsfield")
def api_hf_info():
    return hf().info()


def prompts_file(pdir: Path) -> Path:
    f = pdir / "prompts.yaml"
    return f if f.is_file() else VORLAGE / "prompts.yaml"


@app.get("/api/projects/{slug}/prompts")
def api_prompts(slug: str):
    pdir = project_dir(slug)
    f = prompts_file(pdir)
    try:
        data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError) as e:
        raise HTTPException(500, f"prompts.yaml nicht lesbar: {e}")
    cfg = load_cfg(pdir)
    lights = {k: (v or {}).get("season") for k, v in (cfg.get("lights") or {}).items()}
    return {"datei": f.relative_to(PROJECTS).as_posix() if f.is_relative_to(PROJECTS) else "projects/_vorlage/prompts.yaml",
            "eigene": f.parent == pdir, "bausteine": data, "lichter": lights}


def hf_index(pdir: Path) -> dict:
    return read_json(pdir / "renders" / "higgsfield" / "index.json", {})


def _hf_target(pdir: Path, cam: str, light: str, ext: str) -> Path:
    zeit = datetime.now().strftime("%Y%m%d-%H%M%S")
    d = pdir / "renders" / "higgsfield"
    out = d / f"{cam}_{light}_{zeit}{ext}"
    i = 2
    while out.exists():
        out = d / f"{cam}_{light}_{zeit}-{i}{ext}"
        i += 1
    return out


def _guess_cam_light(slug: str, pdir: Path, rel: str) -> tuple[str, str]:
    cfg = load_cfg(pdir)
    cams, lights = list((cfg.get("cameras") or {}).keys()), list((cfg.get("lights") or {}).keys())
    stem = Path(rel).stem
    hit = match_strict(slug, stem, cams, lights) or match_loose(stem, cams, lights)
    if hit:
        return hit[0], hit[1]
    s = re.sub(r"[^a-z0-9_]+", "_", stem.lower()).strip("_")[:40] or "bild"
    return s, "frei"


def _hf_register(pdir: Path, out: Path, meta: dict) -> None:
    with _lock:
        idx = hf_index(pdir)
        idx[f"higgsfield/{out.name}"] = meta
        write_json(pdir / "renders" / "higgsfield" / "index.json", idx)


@app.post("/api/projects/{slug}/veredeln")
def api_veredeln(slug: str, body: dict = Body(...)):
    """{rel, prompt, refs: [rel], aspect, resolution, cam?, light?}: Bild mit Referenzen veredeln (Queue-Job)."""
    pdir = project_dir(slug)
    rel = str(body.get("rel", ""))
    src = safe_rel(pdir, rel)
    if src.suffix.lower() not in IMG_EXT:
        raise HTTPException(400, "Nur Bilder lassen sich veredeln")
    prompt = str(body.get("prompt") or "").strip()
    if len(prompt) < 20 or len(prompt) > 6000:
        raise HTTPException(400, "Prompt: 20 bis 6000 Zeichen")
    refs = [str(r) for r in (body.get("refs") or [])][:4]
    ref_paths = [safe_rel(pdir, r) for r in refs]
    if any(p.suffix.lower() not in IMG_EXT for p in ref_paths):
        raise HTTPException(400, "Referenzen müssen Bilder sein")
    aspect, res = str(body.get("aspect") or "3:2"), str(body.get("resolution") or "2k").lower()
    from studio.higgsfield import ASPECTS, RESOLUTIONS
    if aspect not in ASPECTS or res not in RESOLUTIONS:
        raise HTTPException(400, "Format oder Auflösung ungültig")
    cam, light = _guess_cam_light(slug, pdir, rel)
    cam = _check_name(body.get("cam") or cam)
    light = _check_name(body.get("light") or light)
    client = hf()
    credits = credits_estimate("bild", res)

    def run(log):
        log(f"Modus: {'Trockenlauf (Ergebnis = Eingangsbild)' if client.dry else 'live'}")
        urls = []
        for p in [src, *ref_paths]:
            log(f"Upload {p.name}")
            urls.append(client.upload(p))
        job = client.generate_image(prompt, urls, aspect, res)
        log(f"Auftrag {job.get('request_id')}")
        st = client.wait(job, log)
        if st["status"] != "completed" or not st["urls"]:
            raise HiggsfieldError(f"Higgsfield: {st['status']} {st.get('fehler') or ''}".strip())
        out = _hf_target(pdir, cam, light, ".jpg")
        client.download(st["urls"][0], out)
        meta = {"art": "bild", "quelle": rel, "refs": refs, "prompt": prompt, "aspect": aspect, "resolution": res,
                "modell": "nano_banana_pro", "credits_geschaetzt": credits, "request_id": st["request_id"],
                "trockenlauf": client.dry, "erstellt": now_iso()}
        _hf_register(pdir, out, meta)
        log(f"Gespeichert: renders/higgsfield/{out.name}")
        return {"rel": f"higgsfield/{out.name}"}

    return queue().add_job(slug, "higgsfield", fn=run, dry=client.dry, cam=cam, light=light, credits=credits,
                           befehl=f"Higgsfield Bild {aspect} {res}: {rel}" + (" (Trockenlauf)" if client.dry else ""))


@app.post("/api/projects/{slug}/video")
def api_video(slug: str, body: dict = Body(...)):
    """{start, end?, middle?: [rel], dauer: 5|10, prompt}: Bild-zu-Video (Kling) als Queue-Job."""
    pdir = project_dir(slug)
    start = str(body.get("start", ""))
    sp = safe_rel(pdir, start)
    end = str(body.get("end") or "")
    ep = safe_rel(pdir, end) if end else None
    middle = [str(m) for m in (body.get("middle") or [])][:4]
    mps = [safe_rel(pdir, m) for m in middle]
    if any(p.suffix.lower() not in IMG_EXT for p in [sp, *mps] + ([ep] if ep else [])):
        raise HTTPException(400, "Start, Ende und Zwischenbilder müssen Bilder sein")
    try:
        dauer = int(body.get("dauer", 5))
    except (TypeError, ValueError):
        raise HTTPException(400, "Dauer 5 oder 10 Sekunden")
    if dauer not in (5, 10):
        raise HTTPException(400, "Dauer 5 oder 10 Sekunden")
    prompt = str(body.get("prompt") or "").strip()
    if len(prompt) < 10 or len(prompt) > 3000:
        raise HTTPException(400, "Prompt: 10 bis 3000 Zeichen")
    cam, light = _guess_cam_light(slug, pdir, start)
    client = hf()
    credits = credits_estimate("video", duration=dauer)

    def run(log):
        log(f"Modus: {'Trockenlauf (Standbild-Video aus dem Startbild)' if client.dry else 'live'}")
        su = client.upload(sp)
        eu = client.upload(ep) if ep else None
        mu = [client.upload(p) for p in mps]
        if not client.dry and (eu or mu):
            log("Hinweis: Endbild und Zwischenbilder sind im dokumentierten Kling-Schema nicht vorgesehen, "
                "gesendet wird nur das Startbild (siehe higgsfield/API.md)")
        job = client.generate_video(su, eu, mu, dauer, prompt)
        log(f"Auftrag {job.get('request_id')}")
        st = client.wait(job, log, timeout=1800)
        if st["status"] != "completed" or not st["urls"]:
            raise HiggsfieldError(f"Higgsfield: {st['status']} {st.get('fehler') or ''}".strip())
        out = _hf_target(pdir, cam, light, ".mp4")
        client.download(st["urls"][-1], out, art="video", duration=dauer)
        _hf_register(pdir, out, {"art": "video", "quelle": start, "ende": end or None, "mitte": middle,
                                 "prompt": prompt, "dauer": dauer, "modell": "kling", "credits_geschaetzt": credits,
                                 "request_id": st["request_id"], "trockenlauf": client.dry, "erstellt": now_iso()})
        log(f"Gespeichert: renders/higgsfield/{out.name}")
        return {"rel": f"higgsfield/{out.name}"}

    return queue().add_job(slug, "video", fn=run, dry=client.dry, cam=cam, light=light, credits=credits,
                           befehl=f"Higgsfield Video {dauer} s: {start}" + (f" bis {end}" if end else "")
                           + (" (Trockenlauf)" if client.dry else ""))


# ------------------------------------------------------------------ Zugriffsschutz
PUBLIC_PATHS = {"/kunde", "/kunde.html", "/app.css", "/common.js", "/favicon.ico"}


@app.middleware("http")
async def zugriff(request: Request, call_next):
    """Von aussen nur Kundenansicht (Token prueft der Endpunkt) und freigegebene Dateien mit gueltigem Token."""
    if is_local(request):
        return await call_next(request)
    path = request.scope.get("path", "")
    ok = path in PUBLIC_PATHS or path.startswith("/brand/") or path.startswith("/api/kunde/")
    if not ok and path.startswith(("/files/", "/thumb/")):
        parts = path.split("/", 3)
        if len(parts) == 4:
            try:
                pdir = project_dir(parts[2])
                tok = request.query_params.get("t", "")
                frei = read_json(pdir / "freigabe.json", {})
                ok = bool(find_link(pdir, tok)) and (frei.get(parts[3]) or {}).get("status") == "freigegeben"
            except HTTPException:
                ok = False
    if not ok:
        return JSONResponse({"detail": "Nur lokal erreichbar. Kunden brauchen einen gültigen Kundenlink."}, status_code=403)
    return await call_next(request)


# ------------------------------------------------------------------ Dateien
@app.get("/files/{slug}/{rel:path}")
def files(slug: str, rel: str):
    return FileResponse(safe_rel(project_dir(slug), rel))


@app.get("/thumb/{slug}/{rel:path}")
def thumb(slug: str, rel: str, w: int = Query(480, ge=64, le=2400)):
    src = safe_rel(project_dir(slug), rel)
    if src.suffix.lower() not in IMG_EXT:
        raise HTTPException(400, "kein Bild")
    st = src.stat()
    key = re.sub(r"[^A-Za-z0-9._-]", "_", f"{slug}__{rel}")
    out = CACHE / "thumbs" / f"{key}__{w}__{int(st.st_mtime)}.jpg"
    if not out.is_file():
        from PIL import Image
        out.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(src) as im:
            im = im.convert("RGB")
            im.thumbnail((w, w * 2))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=82, optimize=True, progressive=True)
        out.write_bytes(buf.getvalue())
    return FileResponse(out, media_type="image/jpeg", headers={"Cache-Control": "max-age=86400"})


_logo_svg: str | None = None


@app.get("/brand/logo.svg")
def logo():
    global _logo_svg
    if _logo_svg is None:
        svg = (REPO / "assets" / "logo" / "unio-logo-black.svg").read_text(encoding="utf-8")
        svg = re.sub(r"<\?xml[^>]*>", "", svg).strip().replace('fill="#000000"', 'fill="currentColor"')
        _logo_svg = re.sub(r' width="1600"| height="400"', "", svg)
    return Response(_logo_svg, media_type="image/svg+xml")


@app.get("/brand/fonts/{name}")
def fonts(name: str):
    if not re.fullmatch(r"PowerGrotesk-[A-Za-z]+\.woff2", name):
        raise HTTPException(404)
    f = REPO / "assets" / "fonts" / name
    if not f.is_file():
        raise HTTPException(404)
    return FileResponse(f, media_type="font/woff2", headers={"Cache-Control": "max-age=604800"})


@app.get("/kunde")
def kunde_page():
    return FileResponse(WEB / "kunde.html")


app.mount("/", StaticFiles(directory=str(WEB), html=True), name="web")


def run(host: str = "127.0.0.1", port: int = 8765, dry_run: bool = False, projects: str | None = None):
    import uvicorn
    global FORCE_DRY, PROJECTS
    if dry_run:
        FORCE_DRY = True
        os.environ["IMMOVIZ_STUDIO_DRY"] = "1"
    if projects:
        PROJECTS = Path(projects).expanduser().resolve()
    if not PROJECTS.is_dir():
        raise SystemExit(f"Projektwurzel fehlt: {PROJECTS}")
    CACHE.mkdir(parents=True, exist_ok=True)
    print(f"immoviz Studio: http://{host}:{port}" + ("  (Trockenlauf, keine Renderings)" if FORCE_DRY else ""))
    if PROJECTS != ROOT / "projects":
        print(f"Projektwurzel: {PROJECTS}")
    uvicorn.run(app, host=host, port=port, log_level="warning")


if __name__ == "__main__":
    run()
