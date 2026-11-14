"""Higgsfield-Adapter fuer das Studio (Veredelung von Blender-Bildern, Bild-zu-Video).

Gesichert laut offizieller Doku (Stand 14.11.2026, Quellen in immoviz/higgsfield/API.md):
  Basis-URL         https://api.higgsfield.ai
  Anmeldung         Header  Authorization: Key <KEY_ID>:<KEY_SECRET>   (kein Bearer, Secret nie im Browser)
  Upload            POST /files/generate-upload-url {"content_type": "image/jpeg"}
                    -> {public_url, upload_url, upload_headers}; dann PUT upload_url mit allen upload_headers
                    (ohne Higgsfield-Anmeldung), public_url als Eingabe-URL verwenden
  Absenden          POST /<modellpfad> -> {status, request_id, status_url, cancel_url}
  Status            GET  /requests/<request_id>/status -> status queued|in_progress|completed|failed|nsfw|canceled,
                    Bilder in images[].url, Video in video.url
  Kling             POST /kling-video/v2.5-turbo/pro/image-to-video {prompt, image_url, duration 5|10, negative_prompt}
  Kosten            POST /estimate/<modellpfad> mit denselben Parametern -> {"usd": "..."}
Nicht gesichert (TODO-Stellen unten):
  - Modellpfad und Parameter fuer Nano Banana Pro mit Referenzbildern (nicht in der oeffentlichen Doku)
  - Start- UND Endbild bzw. Zwischenbilder fuer Kling (dokumentiertes Schema kennt nur image_url)
  - Guthaben/Credits per API (kein Endpunkt dokumentiert)

Schluessel nur aus der Umgebung: HIGGSFIELD_API_KEY (Key-ID oder "ID:SECRET") und HIGGSFIELD_API_SECRET.
Ohne Schluessel (oder mit dry=True) laeuft ein Trockenlauf: Jobs werden simuliert, das Ergebnis ist das
Eingangsbild (Video: Standbild-Video aus dem Startbild, falls ffmpeg vorhanden). Es wird nichts gesendet.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

BASE = "https://api.higgsfield.ai"
# Dokumentiert (OpenAPI docs.higgsfield.ai/docs/openapi.json):
VIDEO_ENDPOINT = os.environ.get("HIGGSFIELD_VIDEO_ENDPOINT", "/kling-video/v2.5-turbo/pro/image-to-video")
# TODO(API): Pfad fuer Nano Banana Pro ist nicht oeffentlich dokumentiert. Erst setzen, wenn er in der
# Konsole (console.higgsfield.ai) bzw. der Modellseite bestaetigt ist, z. B. HIGGSFIELD_IMAGE_ENDPOINT=/<pfad>.
IMAGE_ENDPOINT = os.environ.get("HIGGSFIELD_IMAGE_ENDPOINT", "")

# Geschaetzte Credits fuer die Oberflaeche (Erfahrungswerte aus der Higgsfield-Web-App, keine API-Angabe)
CREDITS = {"bild_2k": 1.5, "bild_4k": 3.0, "video_5": 16.0, "video_10": 32.0}
ASPECTS = ("3:2", "2:3", "16:9", "9:16", "4:3", "3:4", "1:1", "21:9")
RESOLUTIONS = ("2k", "4k")
TERMINAL = ("completed", "failed", "nsfw", "canceled")


class HiggsfieldError(RuntimeError):
    """Fehler mit Text fuer die Oberflaeche."""


def credits_estimate(art: str, resolution: str = "2k", duration: int = 5) -> float:
    if art == "video":
        return CREDITS["video_10"] if int(duration) > 5 else CREDITS["video_5"]
    return CREDITS["bild_4k"] if str(resolution).lower() == "4k" else CREDITS["bild_2k"]


class Higgsfield:
    def __init__(self, dry: bool = False):
        key = os.environ.get("HIGGSFIELD_API_KEY", "").strip()
        secret = os.environ.get("HIGGSFIELD_API_SECRET", "").strip()
        if key and not secret and ":" in key:
            key, secret = key.split(":", 1)
        self._auth = f"Key {key}:{secret}" if key and secret else ""
        self.dry = bool(dry) or not self._auth
        self.dry_reason = "erzwungen (--dry-run)" if dry else ("kein Schlüssel" if not self._auth else "")
        self._sim: dict[str, dict] = {}
        self._sim_used = 0.0
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ Info
    def info(self) -> dict:
        bal = self.balance()
        return {"modus": "trockenlauf" if self.dry else "live", "grund": self.dry_reason, "guthaben": bal,
                "guthaben_einheit": "Credits (simuliert)" if self.dry else "Credits",
                "bild_endpunkt": bool(IMAGE_ENDPOINT) or self.dry, "credits": CREDITS,
                "aspekte": ASPECTS, "aufloesungen": RESOLUTIONS}

    def balance(self) -> float | None:
        if self.dry:
            return round(100.0 - self._sim_used, 1)
        # TODO(API): kein dokumentierter Endpunkt fuer Guthaben. Bis dahin None (Oberflaeche zeigt "unbekannt").
        return None

    # ------------------------------------------------------------------ HTTP (nur live)
    def _req(self, method: str, path: str, body: dict | None = None, timeout: int = 60) -> dict:
        if self.dry:
            raise HiggsfieldError("Trockenlauf: keine Anfrage an Higgsfield")
        url = path if path.startswith("http") else BASE + path
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method, headers={
            "Authorization": self._auth, "Content-Type": "application/json", "Accept": "application/json",
            **({"Idempotency-Key": uuid.uuid4().hex} if method == "POST" else {})})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:400]
            raise HiggsfieldError(f"Higgsfield {e.code}: {detail}") from e
        except urllib.error.URLError as e:
            raise HiggsfieldError(f"Higgsfield nicht erreichbar: {e.reason}") from e
        return json.loads(raw or b"{}")

    # ------------------------------------------------------------------ Bausteine
    def upload(self, path: Path) -> str:
        """Lokale Datei hochladen, liefert eine URL fuer Modell-Eingaben."""
        path = Path(path)
        if self.dry:
            return path.resolve().as_uri()
        ct = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
              ".mp4": "video/mp4"}.get(path.suffix.lower())
        if not ct:
            raise HiggsfieldError(f"Dateityp {path.suffix} nicht unterstützt")
        r = self._req("POST", "/files/generate-upload-url", {"content_type": ct})
        put = urllib.request.Request(r["upload_url"], data=path.read_bytes(), method="PUT",
                                     headers=dict(r.get("upload_headers") or {"Content-Type": ct}))
        try:
            with urllib.request.urlopen(put, timeout=300) as resp:
                resp.read()
        except urllib.error.HTTPError as e:
            raise HiggsfieldError(f"Upload fehlgeschlagen: {e.code}") from e
        return r["public_url"]

    def generate_image(self, prompt: str, refs: list[str], aspect: str = "3:2", resolution: str = "2k") -> dict:
        """refs: URLs aus upload(); refs[0] ist das Blender-Bild (Geometrie)."""
        if aspect not in ASPECTS or resolution not in RESOLUTIONS:
            raise HiggsfieldError("Format oder Auflösung ungültig")
        if self.dry:
            return self._sim_new("bild", refs[0] if refs else None, credits_estimate("bild", resolution))
        if not IMAGE_ENDPOINT:
            raise HiggsfieldError("Bild-Endpunkt (Nano Banana Pro) ist nicht öffentlich dokumentiert. "
                                  "HIGGSFIELD_IMAGE_ENDPOINT setzen, siehe immoviz/higgsfield/API.md.")
        # TODO(API): Parameternamen fuer Referenzbilder bei Nano Banana Pro bestaetigen (Annahme: image_urls).
        body = {"prompt": prompt, "image_urls": refs, "aspect_ratio": aspect, "resolution": resolution.upper()}
        return self._req("POST", IMAGE_ENDPOINT, body)

    def generate_video(self, start: str, end: str | None, middle: list[str], duration: int, prompt: str) -> dict:
        if int(duration) not in (5, 10):
            raise HiggsfieldError("Dauer 5 oder 10 Sekunden (Kling)")
        if self.dry:
            return self._sim_new("video", start, credits_estimate("video", duration=duration), duration)
        body = {"prompt": prompt, "image_url": start, "duration": int(duration)}
        # TODO(API): Endbild und Zwischenbilder sind im dokumentierten Kling-Schema nicht vorgesehen.
        # Wenn ein Modell mit Endbild bestaetigt ist (z. B. eigener Pfad per HIGGSFIELD_VIDEO_ENDPOINT),
        # hier die Feldnamen ergaenzen. Bis dahin wird nur das Startbild gesendet.
        return self._req("POST", VIDEO_ENDPOINT, body)

    def status(self, job: dict | str) -> dict:
        """Einheitlich: {status, request_id, urls: [...], fehler}."""
        jid = job if isinstance(job, str) else job.get("request_id")
        if self.dry:
            return self._sim_status(jid)
        url = job.get("status_url") if isinstance(job, dict) and job.get("status_url") else f"/requests/{jid}/status"
        r = self._req("GET", url)
        urls = [i["url"] for i in r.get("images") or [] if i.get("url")]
        if (r.get("video") or {}).get("url"):
            urls.append(r["video"]["url"])
        return {"status": r.get("status"), "request_id": jid, "urls": urls, "fehler": r.get("error")}

    def estimate(self, endpoint: str, body: dict) -> str | None:
        """USD-Schaetzung laut Doku (POST /estimate/<pfad>). Im Trockenlauf None."""
        if self.dry or not endpoint:
            return None
        try:
            return self._req("POST", "/estimate" + endpoint, body).get("usd")
        except HiggsfieldError:
            return None

    def wait(self, job: dict, log=print, timeout: float = 900, every: float = 4.0) -> dict:
        t0 = time.time()
        last = None
        while True:
            st = self.status(job)
            if st["status"] != last:
                log(f"Status: {st['status']}")
                last = st["status"]
            if st["status"] in TERMINAL:
                return st
            if time.time() - t0 > timeout:
                raise HiggsfieldError("Zeitüberschreitung beim Warten auf Higgsfield")
            time.sleep(0.5 if self.dry else every)

    def download(self, url: str, dest: Path, art: str = "bild", duration: int = 5) -> Path:
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_name(f".{dest.name}.part")
        if url.startswith("file://"):
            src = Path(urllib.request.url2pathname(url[7:]))
            if art == "video":
                self._still_video(src, tmp.with_suffix(".mp4"), duration)
                tmp.with_suffix(".mp4").replace(dest)
                return dest
            from PIL import Image
            with Image.open(src) as im:
                im.convert("RGB").save(tmp, "JPEG", quality=92)
        else:
            with urllib.request.urlopen(url, timeout=300) as r, tmp.open("wb") as fh:
                shutil.copyfileobj(r, fh)
            if art == "bild" and dest.suffix.lower() in (".jpg", ".jpeg"):
                from PIL import Image
                with Image.open(tmp) as im:
                    if im.format != "JPEG":
                        im.convert("RGB").save(tmp.with_suffix(".conv"), "JPEG", quality=92)
                        tmp.with_suffix(".conv").replace(tmp)
        tmp.replace(dest)
        return dest

    # ------------------------------------------------------------------ Trockenlauf
    def _sim_new(self, art: str, src: str | None, credits: float, duration: int = 5) -> dict:
        jid = "trocken-" + uuid.uuid4().hex[:10]
        with self._lock:
            self._sim[jid] = {"t0": time.time(), "src": src, "art": art, "credits": credits, "dauer": duration}
            self._sim_used += credits
        return {"status": "queued", "request_id": jid, "status_url": None, "simuliert": True}

    def _sim_status(self, jid: str) -> dict:
        s = self._sim.get(jid)
        if not s:
            return {"status": "failed", "request_id": jid, "urls": [], "fehler": "unbekannter Trockenlauf-Job"}
        dt = time.time() - s["t0"]
        st = "queued" if dt < 0.6 else "in_progress" if dt < 2.0 else "completed"
        return {"status": st, "request_id": jid, "urls": [s["src"]] if st == "completed" and s["src"] else [],
                "fehler": None}

    @staticmethod
    def _still_video(src: Path, out: Path, duration: int) -> None:
        if not shutil.which("ffmpeg"):
            raise HiggsfieldError("Trockenlauf-Video braucht ffmpeg")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(src), "-t", str(int(duration)),
                        "-r", "10", "-vf", "scale=960:-2,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast",
                        "-f", "mp4", str(out)], check=True)
