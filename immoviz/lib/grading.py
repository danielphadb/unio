"""Farbangleich an Leitbilder (Grading) und dezente Objektivwirkung.

Zweck: Der Look der Endbilder soll den Leitbildern aus dem Referenzordner des Kunden folgen (warm-neutral, cremiger
Himmel, angehobene Schatten, feines Korn; mood_analyse.md Abschnitt 6), ohne Geometrie zu veraendern. Nur Farbe,
Helligkeit, Vignette, Glow und Korn; deshalb nach dem Schutz-Kompositing anwendbar.

Verfahren (`immoviz.py grading --bild <bild> --leitbild <ref.jpg> [...] [--staerke 0..1]`):
1. Statistik in Lab (D65): Mittelwert und Streuung je Kanal von Bild und Leitbildern (mehrere Leitbilder werden
   zusammengelegt). Uebertragung mit Begrenzung: Mittelwert hoechstens L +-12, a/b +-8, Streuungsverhaeltnis 0,7 bis 1,4.
2. Histogramm-Abgleich je Lab-Kanal (Quantile), begrenzt: je Pixel hoechstens L +-10, a/b +-6 Abweichung von Schritt 1,
   mit Gewicht `histogramm` (Standard 0,5).
3. Mischung mit dem Original ueber `staerke` (Standard 0,6). Optional Schutzmaske: dort nur halbe Staerke.
4. Objektivwirkung: Glow (helle Stellen weich ueberstrahlt, Screen), Vignette (zu den Ecken dunkler), Filmkorn
   (Luminanzrauschen, in Mitteltoenen am staerksten, fester Seed).

Leitbilder je Projekt in project.yaml (Pfade lokal, Referenzen bleiben ausserhalb des Repos):
    look:
      ordner: ${IMMOVIZ_REFERENZ}/wimmer      # Umgebungsvariable oder absoluter Pfad, relative Leitbilder darunter
      leitbilder: [05_m41_pazelhof.jpg, 13_zhiloy_herbsthof.jpg]
      staerke: 0.5
      vignette: 0.12
      glow: 0.08
      korn: 0.008
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

from .kompositing import (_resize, _schrift, bild_laden, bild_speichern, lab_zu_rgb, rgb_zu_lab)

STANDARD = {"staerke": 0.6, "histogramm": 0.5, "vignette": 0.15, "glow": 0.10, "korn": 0.010}
MITTEL_MAX = np.array([12.0, 8.0, 8.0], np.float32)
STREUUNG = (0.7, 1.4)
HIST_MAX = np.array([10.0, 6.0, 6.0], np.float32)
LEITBILD_MAX = 900                     # Kantenlaenge, auf die Leitbilder fuer die Statistik verkleinert werden


def leitbilder_aus_projekt(pdir) -> tuple[list[Path], dict]:
    """Leitbilder und Parameter aus project.yaml `look:`. Pfade mit ${VAR} und ~ werden aufgeloest."""
    import yaml
    cfg = yaml.safe_load((Path(pdir) / "project.yaml").read_text(encoding="utf-8")) or {}
    look = cfg.get("look") or {}
    ordner = os.path.expanduser(os.path.expandvars(str(look.get("ordner", ""))))
    if "$" in ordner:
        raise SystemExit(f"look.ordner: Umgebungsvariable nicht gesetzt ({look.get('ordner')}); "
                         "Referenzordner lokal angeben, z. B. IMMOVIZ_REFERENZ=/pfad/zu/referenzen")
    pfade = []
    for p in look.get("leitbilder") or []:
        p = Path(os.path.expanduser(os.path.expandvars(str(p))))
        pfade.append(p if p.is_absolute() or not ordner else Path(ordner) / p)
    return pfade, {k: look[k] for k in ("staerke", "histogramm", "vignette", "glow", "korn") if k in look}


def statistik(pfade: list[Path]) -> dict:
    """Lab-Statistik ueber alle Leitbilder: Mittelwert, Streuung, 257 Quantile je Kanal."""
    proben = []
    for p in pfade:
        im = Image.open(p).convert("RGB")
        im.thumbnail((LEITBILD_MAX, LEITBILD_MAX))
        lab = rgb_zu_lab(np.asarray(im, np.float32) / 255.0).reshape(-1, 3)
        proben.append(lab[:: max(1, lab.shape[0] // 200000)])
    x = np.concatenate(proben)
    q = np.quantile(x, np.linspace(0, 1, 257), axis=0)
    return {"mittel": x.mean(0), "streuung": x.std(0), "quantile": q, "n": len(pfade)}


def _quantil_abbildung(x: np.ndarray, q_ref: np.ndarray) -> np.ndarray:
    q_ist = np.quantile(x[:: max(1, x.size // 400000)], np.linspace(0, 1, 257))
    q_ist = np.maximum.accumulate(q_ist + np.arange(257) * 1e-6)
    return np.interp(x, q_ist, q_ref).astype(np.float32)


def graden(rgb: np.ndarray, ref: dict, staerke=0.6, histogramm=0.5, vignette=0.15, glow=0.10, korn=0.010,
           maske: np.ndarray | None = None, seed: int = 7) -> tuple[np.ndarray, dict]:
    lab = rgb_zu_lab(rgb)
    mu, sd = lab.reshape(-1, 3).mean(0), lab.reshape(-1, 3).std(0)
    mu_z = mu + np.clip(ref["mittel"] - mu, -MITTEL_MAX, MITTEL_MAX)
    sd_z = sd * np.clip(ref["streuung"] / np.maximum(sd, 1e-3), *STREUUNG)
    neu = (lab - mu) / np.maximum(sd, 1e-3) * sd_z + mu_z
    if histogramm > 0:
        for c in range(3):
            h = _quantil_abbildung(neu[..., c], ref["quantile"][:, c])
            neu[..., c] += histogramm * np.clip(h - neu[..., c], -HIST_MAX[c], HIST_MAX[c])
    s = np.full(lab.shape[:2], staerke, np.float32)
    if maske is not None:
        s *= 1.0 - 0.5 * np.clip(maske, 0, 1)
    out_lab = lab + s[..., None] * (neu - lab)
    out_lab[..., 0] = np.clip(out_lab[..., 0], 0, 100)
    out = lab_zu_rgb(out_lab)
    H, W = out.shape[:2]
    if glow > 0:                                     # helle Stellen weich ueberstrahlen (Screen)
        lum = out @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        hell = out * (np.clip((lum - 0.72) / 0.28, 0, 1) ** 2)[..., None]
        sig = 0.015 * W
        f = min(1.0, 400 / W)                       # Unschaerfe auf kleinem Raster (schnell auch bei 4k)
        klein = _resize(hell, (max(8, round(W * f)), max(8, round(H * f))))
        klein = np.stack([ndi.gaussian_filter(klein[..., c], sig * f) for c in range(3)], -1)
        bl = _resize(klein.astype(np.float32), (W, H))
        out = 1 - (1 - out) * (1 - glow * 2.0 * bl)
    if vignette > 0:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / math.sqrt(2)
        t = np.clip((r - 0.35) / 0.65, 0, 1)
        out = out * (1 - vignette * (t * t * (3 - 2 * t)))[..., None]
    if korn > 0:
        rng = np.random.default_rng(seed)
        n = ndi.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.6)
        n /= n.std() + 1e-6
        lum = out @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        out = out + (korn * n * (0.4 + 2.4 * lum * (1 - lum)))[..., None]
    out = np.clip(out, 0, 1).astype(np.float32)
    lab2 = rgb_zu_lab(out)
    info = {"vorher": {"mittel_lab": [round(float(v), 2) for v in mu], "streuung_lab": [round(float(v), 2) for v in sd]},
            "nachher": {"mittel_lab": [round(float(v), 2) for v in lab2.reshape(-1, 3).mean(0)],
                        "streuung_lab": [round(float(v), 2) for v in lab2.reshape(-1, 3).std(0)]},
            "leitbild": {"mittel_lab": [round(float(v), 2) for v in ref["mittel"]],
                         "streuung_lab": [round(float(v), 2) for v in ref["streuung"]], "anzahl": ref["n"]},
            "parameter": {"staerke": staerke, "histogramm": histogramm, "vignette": vignette, "glow": glow,
                          "korn": korn, "maske": maske is not None}}
    d = lambda a, b: round(float(np.linalg.norm(np.array(a) - np.array(b))), 2)
    info["abstand_mittel_zum_leitbild"] = {"vorher": d(info["vorher"]["mittel_lab"], info["leitbild"]["mittel_lab"]),
                                           "nachher": d(info["nachher"]["mittel_lab"], info["leitbild"]["mittel_lab"])}
    return out, info


def _pruefbild(vorher, nachher, info, pfad: Path) -> Path:
    """Vorher/nachher nebeneinander (ohne Leitbilder, damit das Pruefbild ins Repo darf)."""
    bw = min(900, vorher.shape[1])
    bh = round(vorher.shape[0] * bw / vorher.shape[1])
    o = Image.new("RGB", (2 * bw + 10, bh + 60), (250, 250, 248))
    d = ImageDraw.Draw(o)
    f = _schrift(15)
    for i, (t, x) in enumerate((("vorher", vorher), ("nachher (Grading)", nachher))):
        o.paste(Image.fromarray(np.rint(_resize(x, (bw, bh)) * 255).astype(np.uint8)), (i * (bw + 10), 60))
        d.text((i * (bw + 10) + 4, 40), t, fill=(40, 40, 40), font=f)
    a = info["abstand_mittel_zum_leitbild"]
    p = info["parameter"]
    d.text((8, 8), f"Grading: Abstand Lab-Mittel zum Leitbild {a['vorher']} -> {a['nachher']}  |  Staerke {p['staerke']}"
                   f", Vignette {p['vignette']}, Glow {p['glow']}, Korn {p['korn']}", fill=(30, 30, 30), font=f)
    o.save(pfad, quality=90)
    return pfad


def main_cli(a) -> int:
    params = dict(STANDARD)
    if a.leitbild:
        pfade = [Path(p) for p in a.leitbild]
    elif a.projekt:
        pfade, look = leitbilder_aus_projekt(a.projekt)
        params.update(look)
    else:
        raise SystemExit("--leitbild oder --projekt (mit look.leitbilder in project.yaml) angeben")
    if a.projekt and a.leitbild:
        params.update(leitbilder_aus_projekt(a.projekt)[1])
    fehlt = [str(p) for p in pfade if not p.is_file()]
    if not pfade or fehlt:
        raise SystemExit(f"Leitbild(er) fehlen: {fehlt or 'keine angegeben'}")
    for k in ("staerke", "vignette", "glow", "korn"):
        if getattr(a, k, None) is not None:
            params[k] = getattr(a, k)
    bild = Path(a.bild)
    rgb = bild_laden(bild)
    maske = None
    if a.maske:
        maske = np.asarray(Image.open(a.maske).convert("L"), np.float32) / 255.0
        if maske.shape != rgb.shape[:2]:
            maske = _resize(maske, (rgb.shape[1], rgb.shape[0]))
    out, info = graden(rgb, statistik(pfade), maske=maske, **params)
    aus = Path(a.out) if a.out else bild.with_name(bild.stem + "_grading.jpg")
    bild_speichern(out, aus)
    info.update({"bild": str(bild), "ergebnis": str(aus), "leitbilder": [p.name for p in pfade],
                 "pruefbild": str(_pruefbild(rgb, out, info, aus.with_name(aus.stem + "_pruefung.jpg")))})
    aus.with_name(aus.stem + ".json").write_text(json.dumps(info, ensure_ascii=False, indent=1))
    print(json.dumps(info, ensure_ascii=False, indent=1))
    return 0
