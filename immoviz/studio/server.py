"""immoviz Studio: lokale Web-Oberflaeche ueber dem Kommandozeilen-Prototyp (Phase B).

Start:  .venv-immoviz/bin/python immoviz/immoviz.py studio        (Port 8765)
        .venv-immoviz/bin/python immoviz/immoviz.py studio --dry-run   (Queue fuehrt nur Trockenlaeufe aus)

Datenhaltung je Projekt (projects/<slug>/):
  project.yaml   wird nur gelesen; optionales Feld `status:` ({1: fertig, 4: laeuft, ...}) gilt als Vorgabe
  status.json    manuell gesetzter Schrittstatus aus der Oberflaeche (hat Vorrang vor der Ableitung)
  intake.json    Stand der Intake-Checkliste
  freigabe.json  Freigabe, Ablehnung und Kommentare je Bild
Keine Secrets im Code. Ein Google-Schluessel wird hier nicht benoetigt.
"""
from __future__ import annotations

import io
import json
import os
import re
import subprocess
import sys
import threading
import time
import uuid
from collections import deque
from datetime import datetime
from pathlib import Path

import yaml
from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

STUDIO = Path(__file__).resolve().parent
ROOT = STUDIO.parent                      # immoviz/
REPO = ROOT.parent                        # Repo-Wurzel (assets/, tokens/)
PROJECTS = ROOT / "projects"
WEB = STUDIO / "web"
CACHE = STUDIO / ".cache"
CLI = ROOT / "immoviz.py"

FORCE_DRY = os.environ.get("IMMOVIZ_STUDIO_DRY") == "1"

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
    quellen = []
    qd = pdir / "quellen"
    if qd.is_dir():
        for f in sorted(qd.iterdir()):
            if f.is_file() and not f.name.startswith("."):
                st = f.stat()
                quellen.append({"name": f.name, "bytes": st.st_size,
                                "datum": datetime.fromtimestamp(st.st_mtime).strftime("%d.%m.%Y")})
    return {"punkte": items, "quellen": quellen}


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
        jid = uuid.uuid4().hex[:10]
        job = {"id": jid, "projekt": slug, "cam": cam, "light": light, "trockenlauf": dry,
               "befehl": "python -c <Trockenlauf>" if dry else
                         f"immoviz.py render projects/{slug} --cam {cam} --light {light} --preview --no-blend",
               "status": "wartet", "erstellt": now_iso(), "gestartet": None, "beendet": None,
               "rueckgabe": None, "fehler": None}
        with self.cv:
            self.jobs[jid] = job
            self.order.append(jid)
            self.logs[jid] = deque(maxlen=2000)
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
            if j["status"] == "wartet" and "_cmd" in j:
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
    return {"name": "immoviz Studio", "phase": "B", "trockenlauf_erzwungen": FORCE_DRY,
            "status_werte": STATUS_VALUES}


@app.get("/api/projects")
def api_projects():
    out = []
    if PROJECTS.is_dir():
        for p in sorted(PROJECTS.iterdir()):
            if (p / "project.yaml").is_file():
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
    out = []
    for it in dedupe(media_items(pdir)):
        rel = it["rel"]
        grp = next((g for g, _, fn in GALLERY_GROUPS if fn(rel)), "sonstige")
        f = frei.get(rel) or {}
        out.append({"rel": rel, "name": it["name"], "typ": it["typ"], "gruppe": grp,
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
def api_kunde_kommentar(slug: str, body: dict = Body(...)):
    """Kommentar aus der Kundenansicht, nur zu freigegebenen Bildern, ohne Statusaenderung."""
    pdir = project_dir(slug)
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
def api_kunde(slug: str):
    """Nur freigegebene Bilder und Videos, ohne interne Kommentare anderer Bilder."""
    pdir = project_dir(slug)
    cfg = load_cfg(pdir)
    frei = read_json(pdir / "freigabe.json", {})
    out = []
    for it in dedupe(media_items(pdir)):
        f = frei.get(it["rel"]) or {}
        if f.get("status") != "freigegeben":
            continue
        out.append({"rel": it["rel"], "typ": it["typ"], "url": file_url(slug, it["rel"]),
                    "thumb": thumb_url(slug, it["rel"], 1280) if it["typ"] == "bild" else None,
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


def run(host: str = "127.0.0.1", port: int = 8765, dry_run: bool = False):
    import uvicorn
    global FORCE_DRY
    if dry_run:
        FORCE_DRY = True
        os.environ["IMMOVIZ_STUDIO_DRY"] = "1"
    CACHE.mkdir(parents=True, exist_ok=True)
    print(f"immoviz Studio: http://{host}:{port}" + ("  (Trockenlauf, keine Renderings)" if FORCE_DRY else ""))
    uvicorn.run(app, host=host, port=port, log_level="warning")


if __name__ == "__main__":
    run()
