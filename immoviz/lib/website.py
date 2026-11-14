"""Projekt-Website: statische Seite aus website.yaml, Schnittbildern mit Hotspots, Außen- und Innenbildern.

Ausgabe projects/<p>/website/ mit index.html und media/ (Bilder max 2000 px, zusätzlich 1000 px für srcset,
Videos 1280 px H.264 crf 26 mit Vorschaubild). Ohne Build-Schritt, ohne externe Skripte, Power Grotesk
eingebettet. Gestaltung nach UNIO-Designsystem (Paper/Ink, ein Akzent #FFAA09, Hairlines, Glas nur über Bild).

Hotspots kommen aus renders/schnitt/hotspots.json (lib/hotspots.py); fehlt die Datei, wird sie mit Blender
erzeugt (nur Kamera, kein Rendering).
"""
from __future__ import annotations

import base64
import html
import json
import re
import subprocess
from pathlib import Path

import yaml
from PIL import Image

LIB = Path(__file__).resolve().parent
REPO = LIB.parent.parent
FONTS = REPO / "assets" / "fonts"
LOGO = REPO / "assets" / "logo" / "unio-logo-black.svg"
TEMPLATE = LIB / "website_template.html"

e = lambda s: html.escape(str(s), quote=True)


class Media:
    """Kopiert und verkleinert Medien nach website/media, überspringt Unverändertes."""

    def __init__(self, pdir: Path, out: Path):
        self.pdir, self.dir = pdir, out / "media"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.used: set[str] = set()

    def _fresh(self, dst: Path, src: Path) -> bool:
        return dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime

    def image(self, rel: str, name: str | None = None, maxpx: int = 2000) -> dict:
        src = self.pdir / rel
        name = name or src.stem
        out = {}
        for suffix, px in (("", maxpx), ("_m", 1000)):
            dst = self.dir / f"{name}{suffix}.jpg"
            self.used.add(dst.name)
            if not self._fresh(dst, src):
                im = Image.open(src).convert("RGB")
                im.thumbnail((px, px), Image.LANCZOS)
                im.save(dst, quality=82, optimize=True, progressive=True)
            with Image.open(dst) as im:
                out[suffix or "full"] = (f"media/{dst.name}", im.width, im.height)
        src_, w, h = out["full"]
        return {"src": src_, "w": w, "h": h, "srcset": f"{out['_m'][0]} {out['_m'][1]}w, {src_} {w}w"}

    def video(self, rel: str, name: str | None = None, width: int = 1280, crf: int = 26) -> dict:
        src = self.pdir / rel
        name = name or src.stem
        dst = self.dir / f"{name}.mp4"
        poster = self.dir / f"{name}_poster.jpg"
        self.used |= {dst.name, poster.name}
        if not self._fresh(dst, src):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", f"scale='min({width},iw)':-2",
                            "-c:v", "libx264", "-preset", "medium", "-crf", str(crf), "-pix_fmt", "yuv420p",
                            "-movflags", "+faststart", "-an", str(dst)], check=True)
        if not self._fresh(poster, dst):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0.4", "-i", str(dst), "-frames:v", "1",
                            "-q:v", "3", str(poster)], check=True)
        dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                              str(dst)], capture_output=True, text=True).stdout.strip()
        with Image.open(poster) as im:
            w, h = im.size
        return {"src": f"media/{dst.name}", "poster": f"media/{poster.name}", "w": w, "h": h,
                "dauer": round(float(dur or 0))}

    def prune(self):
        for p in self.dir.iterdir():
            if p.name not in self.used:
                p.unlink()


# ------------------------------------------------------------------ Bausteine
def _img(m: dict, alt: str, sizes: str, cls: str = "", lazy: bool = True, prio: bool = False) -> str:
    a = ' loading="lazy" decoding="async"' if lazy else ""
    a += ' fetchpriority="high"' if prio else ""
    c = f' class="{cls}"' if cls else ""
    return (f'<img{c} src="{m["src"]}" srcset="{m["srcset"]}" sizes="{sizes}" width="{m["w"]}" height="{m["h"]}" '
            f'alt="{e(alt)}"{a}>')


def _video(v: dict, label: str) -> str:
    return (f'<video src="{v["src"]}" poster="{v["poster"]}" width="{v["w"]}" height="{v["h"]}" controls muted loop '
            f'playsinline preload="none" aria-label="{e(label)}"></video>')


def _sechead(num: str, label: str, hid: str, titel: str, text: str = "") -> str:
    p = f'<p class="muted">{e(text)}</p>' if text else ""
    return (f'<div class="sechead"><div class="marg"><span class="num">{num}</span><span class="label">{e(label)}</span>'
            f'</div><h2 id="{hid}">{e(titel)}</h2>{p}</div>')


def _logo() -> str:
    svg = LOGO.read_text(encoding="utf-8")
    svg = re.sub(r"<\?xml[^>]*>", "", svg).strip().replace('fill="#000000"', 'fill="currentColor"')
    svg = re.sub(r' width="1600"| height="400"', "", svg)
    return re.sub(r"^<svg ", '<svg role="img" aria-label="UNIO" ', svg)


def _fonts() -> str:
    out = []
    for w, f in ((400, "PowerGrotesk-Regular.woff2"), (500, "PowerGrotesk-Medium.woff2")):
        b = base64.b64encode((FONTS / f).read_bytes()).decode()
        out.append(f'@font-face{{font-family:"Power Grotesk";src:url(data:font/woff2;base64,{b}) format("woff2");'
                   f'font-weight:{w};font-style:normal;font-display:swap}}')
    return "\n".join(out)


def _hotspots(pdir: Path, rel: str) -> dict:
    p = pdir / rel
    if not p.exists():
        from . import hotspots
        hotspots.write(pdir, check=False)
    return json.loads(p.read_text())


# ------------------------------------------------------------------ Seite
def build_site(pdir: Path, out: Path | None = None, prune: bool = True) -> dict:
    C = yaml.safe_load((pdir / "website.yaml").read_text())
    out = out or pdir / "website"
    M = Media(pdir, out)
    P, H = C["projekt"], C["hero"]
    S = {}

    # Hero und Kennzahlen
    hero = M.image(H["bild"], "hero")
    S["HERO_IMG"] = _img(hero, H["alt"], "(max-width: 1360px) 100vw, 1320px", lazy=False, prio=True)
    S["HERO_LABEL"], S["HERO_TITEL"] = e(H["label"]), e(H["titel"])
    S["HERO_UNTERTITEL"], S["EINLEITUNG"] = e(H["untertitel"]), e(H["einleitung"])
    S["KENNZAHLEN"] = "".join(f'<div><dt>{e(k["label"])}</dt><dd>{e(k["wert"])}</dd></div>' for k in H["kennzahlen"])

    # Das Haus
    Hs = C["haus"]
    figs = []
    for i, b in enumerate(Hs["bilder"], 1):
        m = M.image(b["datei"])
        span = int(b.get("breite", 4))
        sizes = "(max-width: 760px) 100vw, " + ("1320px" if span == 12 else f"{round(span / 12 * 100)}vw")
        figs.append(f'<figure class="g-{span}">{_img(m, b["alt"], sizes)}<figcaption><span class="i">{i:02d}</span>'
                    f'<span><b>{e(b["titel"])}.</b> {e(b["text"])}</span></figcaption></figure>')
    S["HAUS_HEAD"] = _sechead("01", "Außen", "haus", Hs["titel"], Hs["text"])
    S["HAUS_GALERIE"] = "".join(figs)

    # Wohnungen: Schnitt, Hotspots, Daten
    WA = C["wohnungen_abschnitt"]
    hs = _hotspots(pdir, WA["hotspots"])
    W = yaml.safe_load((pdir / "wohnungen.yaml").read_text())["schnitt"]
    zust = []
    for st in W["zustaende"]:
        m = M.image(WA["bilder_muster"].format(zustand=st["name"]), f"schnitt_{st['name']}")
        zust.append({"name": st["name"], "titel": st["titel"], "bild": m["src"], "bild_m": m["srcset"].split(" ")[0],
                     "tops": hs["zustaende"].get(st["name"], {})})
    apts = {}
    for k, a in C["wohnungen"].items():
        bilder = []
        for b in a.get("bilder", []):
            m = M.image(b["datei"])
            bilder.append({"src": m["src"], "srcset": m["srcset"], "w": m["w"], "h": m["h"], "text": b["text"]})
        d = {f: a.get(f, "") for f in ("top", "geschoss", "zustand", "lage", "flaeche", "freiflaechen", "zimmer",
                                        "preis", "text")}
        d["bilder"] = bilder
        if a.get("video"):
            v = M.video(a["video"]["datei"])
            d["video"] = {**v, "text": a["video"]["text"]}
        apts[k] = d
    data = {"aufloesung": hs["aufloesung"], "mobil": WA.get("mobil_ausschnitt"), "zustaende": zust,
            "wohnungen": apts, "start": WA.get("start") or max(zust, key=lambda z: len(z["tops"]))["name"]}
    S["DATA"] = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    S["WOHN_HEAD"] = _sechead("02", "Auswahl", "wohnungen", WA["titel"], WA["text"])
    S["GESCHOSSE"] = "".join(
        f'<button type="button" class="floor" data-z="{z["name"]}" aria-pressed="false">'
        f'{"<span class=dot aria-hidden=true></span>" if z["tops"] else ""}{e(z["titel"])}</button>' for z in zust)
    rows = []
    for k, a in apts.items():
        rows.append(f'<tr data-top="{k}"><th scope="row"><button type="button" class="aptbtn" data-top="{k}" '
                    f'aria-label="{e(a["top"])}, {e(a["geschoss"])}, Details öffnen">{e(a["top"])}</button></th>'
                    f'<td>{e(a["geschoss"])}</td><td class="num">{e(a["flaeche"])}</td><td class="opt">{e(a["freiflaechen"])}</td>'
                    f'<td class="opt"><span class="tag ask">Preis {e(a["preis"])}</span></td></tr>')
    S["WOHN_ZEILEN"] = "".join(rows)

    # Bewegtbild
    B = C["bewegtbild"]
    big, small = [], []
    for v in B["videos"]:
        m = M.video(v["datei"])
        f = (f'<figure>{_video(m, v["titel"])}<figcaption><span class="i">{m["dauer"]} s</span>'
             f'<span><b>{e(v["titel"])}.</b> {e(v["text"])}</span></figcaption></figure>')
        (big if v.get("gross") else small).append(f)
    S["VIDEO_HEAD"] = _sechead("03", "Video", "bewegtbild", B["titel"], B["text"])
    S["VIDEOS_GROSS"], S["VIDEOS_KLEIN"] = "".join(big), "".join(small)

    # Lage
    L = C["lage"]
    S["LAGE_HEAD"] = _sechead("04", P["bezirk"], "lage", L["titel"])
    S["LAGE_TEXT"] = "".join(f"<p>{e(t)}</p>" for t in L["text"]) + (
        f'<p class="muted small">{e(L["hinweis"])}</p>' if L.get("hinweis") else "")
    S["LAGE_BILD"] = _img(M.image(L["bild"], "lage"), L["alt"], "(max-width: 760px) 100vw, 60vw")

    # Kontakt und Fuß
    K_ = C["kontakt"]
    S["KONTAKT_HEAD"] = _sechead("05", "Anfrage", "kontakt", K_["titel"], K_["text"])
    S["KONTAKT"] = "".join(f'<div><dt>{lab}</dt><dd>{e(K_[f])}</dd></div>'
                           for lab, f in (("Ansprechperson", "name"), ("Telefon", "telefon"), ("E-Mail", "email")))
    S["KONTAKT_TAG"] = '<span class="tag todo">Platzhalter</span>' if K_.get("platzhalter") else ""
    F = C["fuss"]
    S["FUSS_HINWEIS"], S["FUSS_QUELLE"] = e(F["hinweis"]), e(F["quelle"])
    S["NAME"], S["ADRESSE"], S["BESCHREIBUNG"] = e(P["name"]), e(P["adresse"]), e(P["beschreibung"])
    S["LANG"] = P.get("sprache", "de")
    S["FONTS"], S["LOGO"] = _fonts(), _logo()

    t = TEMPLATE.read_text(encoding="utf-8")
    for k, v in S.items():
        t = t.replace("{{" + k + "}}", str(v))
    left = re.findall(r"\{\{[A-Z_]+\}\}", t)
    if left:
        raise ValueError(f"Platzhalter ohne Inhalt: {left}")
    if re.search("[\\u2013\\u2014]", t):
        raise ValueError("Geviert- oder Halbgeviertstrich in der Seite")
    (out / "index.html").write_text(t, encoding="utf-8")
    if prune:
        M.prune()
    size = sum(p.stat().st_size for p in out.rglob("*") if p.is_file())
    return {"index": str(out / "index.html"), "medien": len(M.used), "mb": round(size / 1e6, 1),
            "hotspots": {z["name"]: list(z["tops"]) for z in zust if z["tops"]}}


if __name__ == "__main__":
    import sys
    print(json.dumps(build_site(Path(sys.argv[1]).resolve()), ensure_ascii=False, indent=1))
