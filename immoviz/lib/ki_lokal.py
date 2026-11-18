"""Lokaler, strukturgefuehrter KI-Schritt (Alternative zu Higgsfield), gedacht fuer den Mac (Apple Silicon, Metal/MPS).

Zweck: Die freie Bild-KI (Runde 6) liefert Putz, Licht und Leben, verschiebt aber Fenster und erfindet Bauteile; der
Blender-Render mit Schutzmaske (Runde 7) ist genau, wirkt aber flacher. Hier veraendert ein offenes Diffusionsmodell
den Render nur wenig (Bild zu Bild mit geringer Staerke) und wird dabei von Tiefe und Kanten aus den Render-Ebenen
gefuehrt (ControlNet). Ergebnis: dieselbe Geometrie pixelgenau wie der Render, aber fotografisches Material und Licht.
Danach wie gewohnt `schutz --modus toleranz` (Fenster, Gelaender usw. je Bauteil pruefen) und `grading`.

Befehl:
    immoviz.py ki-lokal --render <beauty.png|jpg> --ebenen <kamera_licht_ebenen> [--prompt "..."] [--modell sdxl]
                        [--staerke 0.3] [--inpaint himmel,baeume,vegetation,menschen_platzhalter,ausstattung]

Modelle (Stand 18.11.2026, Lizenzen geprueft, Einzelheiten in auftraege/2026-11-19_ki_lokal_test.md):
- Basis `sdxl`: stabilityai/stable-diffusion-xl-base-1.0, CreativeML Open RAIL++-M: kommerzielle Nutzung erlaubt,
  keine Rechte des Lizenzgebers an den Ausgaben, Nutzungsbeschraenkungen nach Anhang A (u. a. keine Taeuschung,
  keine Verletzung von Gesetzen). Weitergabe des Modells nur mit Lizenz und Anhang A.
- Steuerung: xinsir/controlnet-union-sdxl-1.0, Datei ProMax (Apache-2.0): ein Netz fuer Tiefe (Modus 1),
  Kanten (3), Tile (6) und Inpainting (7); in diffusers als ControlNetUnionModel mit eigener Img2Img- und
  Inpaint-Pipeline.
- VAE: madebyollin/sdxl-vae-fp16-fix (MIT), damit fp16 auf MPS keine NaN liefert.
- Optional `realvisxl`: SG161222/RealVisXL_V5.0 (fotorealistische SDXL-Feinabstimmung, laut Modellkarte openrail++;
  Trainingsdaten nicht offengelegt, deshalb nur nach ausdruecklicher Freigabe).
- Nicht verwendet: FLUX.1 dev und dessen Depth/Canny-Modelle (nicht kommerzielle Lizenz), FLUX.2 klein 9B (nicht
  kommerziell), SD 3.5 (Community License mit Umsatzgrenze). FLUX.2 klein 4B (Apache-2.0) und Z-Image Turbo mit
  Fun-ControlNet-Union (Apache-2.0) sind kommerziell frei, haben in diffusers aber (noch) keinen Bild-zu-Bild- bzw.
  Inpaint-Weg mit Tiefensteuerung; Kandidaten fuer spaeter.

Modelle werden beim ersten Lauf von Hugging Face geladen (Cache ~/.cache/huggingface, rund 10 GB), nie ins Repo.
`--modell test` baut ein winziges Zufallsmodell (hf-internal-testing) fuer den Funktionstest ohne Grafikeinheit.

4k: Kacheln von 1024 px (SDXL-Grundgroesse) mit 256 px Ueberlappung und linearer Ueberblendung; je Kachel werden
Mittelwert und Streuung in Lab teilweise an den Render angeglichen (`farbe_halten`), damit keine Kachelnaehte
entstehen. Inpainting nur in freigegebenen Masken (INPAINT_ERLAUBT); Gebaeudeklassen werden abgelehnt.
"""
from __future__ import annotations

import json
import math
import os
import platform
import resource
import time
from pathlib import Path

import numpy as np
from PIL import Image

MODELLE = {
    "sdxl": {"basis": "stabilityai/stable-diffusion-xl-base-1.0", "variant": "fp16",
             "lizenz": "CreativeML Open RAIL++-M (kommerziell erlaubt, Nutzungsbeschraenkungen Anhang A)"},
    "realvisxl": {"basis": "SG161222/RealVisXL_V5.0", "variant": "fp16",
                  "lizenz": "openrail++ laut Modellkarte (SDXL-Feinabstimmung, Trainingsdaten nicht offengelegt): "
                            "nur nach Freigabe"},
    "test": {"basis": "hf-internal-testing/tiny-stable-diffusion-xl-pipe", "variant": None,
             "lizenz": "Testmodell mit Zufallsgewichten, nur Funktionstest"},
}
CONTROLNET = {"repo": "xinsir/controlnet-union-sdxl-1.0", "gewichte": "diffusion_pytorch_model_promax.safetensors",
              "config": "config_promax.json", "lizenz": "Apache-2.0"}
VAE = {"repo": "madebyollin/sdxl-vae-fp16-fix", "lizenz": "MIT"}
MODUS = {"tiefe": 1, "kanten": 3, "tile": 6, "inpaint": 7}       # Kontrolltypen ControlNet-Union (diffusers)
INPAINT_ERLAUBT = ["himmel", "baeume", "vegetation", "menschen_platzhalter", "ausstattung"]

# Kurz halten: SDXL liest je Textkodierer hoechstens 77 Token, der Rest wird abgeschnitten. Die Geometrie kommt aus
# Tiefe und Kanten, nicht aus dem Text.
PROMPT_STANDARD = ("architectural photograph, Viennese historic apartment building, beige lime plaster with fine "
                   "texture, stucco with soft shadows, white windows, real glass reflections, natural light, "
                   "photorealistic, sharp detail")
NEGATIV_STANDARD = ("cgi, 3d render, plastic, cartoon, painting, oversaturated, hdr, blurry, text, watermark, logo, "
                    "extra windows, deformed architecture")

STANDARD = {"staerke": 0.3, "schritte": 30, "cfg": 5.0, "steuerung": "tiefe,kanten", "steuerung_staerke": 0.8,
            "kachel": 1024, "ueberlappung": 256, "seed": 7, "farbe_halten": 0.5, "inpaint_staerke": 0.85,
            "inpaint_rand_px": 6}


# ------------------------------------------------------------------ Geraet und Modelle
def geraet():
    import torch
    if torch.backends.mps.is_available():
        return "mps", torch.float16
    if torch.cuda.is_available():
        return "cuda", torch.float16
    return "cpu", torch.float32


def _controlnet_ordner(cache: Path | None = None) -> Path:
    """ProMax-Gewichte liegen im xinsir-Repo unter eigenem Dateinamen: in einen lokalen Ordner mit Standardnamen
    verlinken, damit ControlNetUnionModel.from_pretrained sie laedt (keine Kopie eines Drittanbieters noetig)."""
    from huggingface_hub import hf_hub_download
    ziel = Path(cache or Path.home() / ".cache" / "immoviz" / "controlnet-union-sdxl-promax")
    ziel.mkdir(parents=True, exist_ok=True)
    for quelle, name in ((CONTROLNET["config"], "config.json"),
                         (CONTROLNET["gewichte"], "diffusion_pytorch_model.safetensors")):
        p = Path(hf_hub_download(CONTROLNET["repo"], quelle))
        z = ziel / name
        if not z.exists():
            try:
                z.symlink_to(p)
            except OSError:
                import shutil
                shutil.copy2(p, z)
    return ziel


def pipeline_laden(modell: str = "sdxl", art: str = "verfeinern"):
    """art: verfeinern (Img2Img) oder inpaint. Rueckgabe (pipe, geraet, dtype, info)."""
    import torch
    from diffusers import (AutoencoderKL, ControlNetUnionModel, StableDiffusionXLControlNetUnionImg2ImgPipeline,
                           StableDiffusionXLControlNetUnionInpaintPipeline)
    if modell not in MODELLE:
        raise SystemExit(f"--modell {modell}: erlaubt {sorted(MODELLE)}")
    dev, dtype = geraet()
    m = MODELLE[modell]
    klasse = (StableDiffusionXLControlNetUnionInpaintPipeline if art == "inpaint"
              else StableDiffusionXLControlNetUnionImg2ImgPipeline)
    if modell == "test":
        from diffusers import StableDiffusionXLPipeline
        dtype = torch.float32
        basis = StableDiffusionXLPipeline.from_pretrained(m["basis"], torch_dtype=dtype)
        cn = ControlNetUnionModel.from_unet(basis.unet)
        import inspect
        par = inspect.signature(ControlNetUnionModel.__init__).parameters
        c0 = basis.unet.config.block_out_channels[0]                                  # winziges Testnetz
        cn = ControlNetUnionModel(**{**{k: v for k, v in cn.config.items() if k in par}, "num_control_type": 8,
                                     "num_trans_channel": c0, "num_proj_channel": c0, "num_trans_head": 2,
                                     "conditioning_embedding_out_channels":
                                         (16, 32, 96, 256)[:len(basis.vae.config.block_out_channels)]})
        pipe = klasse(vae=basis.vae, text_encoder=basis.text_encoder, text_encoder_2=basis.text_encoder_2,
                      tokenizer=basis.tokenizer, tokenizer_2=basis.tokenizer_2, unet=basis.unet, controlnet=cn,
                      scheduler=basis.scheduler)
    else:
        cn = ControlNetUnionModel.from_pretrained(_controlnet_ordner(), torch_dtype=dtype)
        kw = {"controlnet": cn, "torch_dtype": dtype}
        if dtype == torch.float16:
            kw["vae"] = AutoencoderKL.from_pretrained(VAE["repo"], torch_dtype=dtype)
            if m["variant"]:
                kw["variant"] = m["variant"]
        pipe = klasse.from_pretrained(m["basis"], **kw)
    pipe = pipe.to(dev)
    pipe.set_progress_bar_config(disable=True)
    info = {"modell": modell, "basis": m["basis"], "lizenz_basis": m["lizenz"],
            "controlnet": "Zufallsnetz (Test)" if modell == "test" else f"{CONTROLNET['repo']} ({CONTROLNET['gewichte']})",
            "lizenz_controlnet": "-" if modell == "test" else CONTROLNET["lizenz"],
            "vae": VAE["repo"] if dtype == torch.float16 and modell != "test" else "aus der Basis",
            "geraet": dev, "dtype": str(dtype).replace("torch.", "")}
    return pipe, dev, dtype, info


# ------------------------------------------------------------------ Steuerbilder aus den Render-Ebenen
def steuerbilder(render: np.ndarray, ebenen_ordner) -> dict:
    """Tiefe (inverse Tiefe, nah hell, wie Depth-Anything/MiDaS) und Kanten (Canny des Renders plus Tiefen- und
    Normalenspruenge aus kanten.png) als RGB uint8 in Render-Groesse."""
    import cv2
    from . import ebenen as EB
    H, W = render.shape[:2]
    e = EB.laden(ebenen_ordner)
    out = {}
    if "tiefe_m" in e:
        d = e["tiefe_m"].astype(np.float32)
        himmel = e["masken"].get("himmel", np.zeros((H, W), bool))
        inv = 1.0 / np.maximum(d, 0.1)
        lo, hi = np.percentile(inv[~himmel], [1, 99.5]) if (~himmel).any() else (inv.min(), inv.max())
        t = np.clip((inv - lo) / max(hi - lo, 1e-6), 0, 1)
        t[himmel] = 0
        t8 = np.rint(t * 255).astype(np.uint8)
        out["tiefe"] = np.repeat(t8[..., None], 3, -1)
    g = cv2.cvtColor((render * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    k = cv2.Canny(cv2.GaussianBlur(g, (0, 0), 1.0), 60, 150) > 0
    if "kanten" in e:
        k |= e["kanten"]
    out["kanten"] = np.repeat((k * 255).astype(np.uint8)[..., None], 3, -1)
    out["tile"] = (render * 255).astype(np.uint8)
    out["masken"] = e["masken"]
    return out


def inpaint_maske(masken: dict, klassen: list[str], rand_px: int) -> np.ndarray:
    from scipy import ndimage as ndi
    falsch = [k for k in klassen if k not in INPAINT_ERLAUBT]
    if falsch:
        raise SystemExit(f"--inpaint {falsch}: nur freigegebene Klassen {INPAINT_ERLAUBT} (Gebaeude und Planelemente "
                         "bleiben Render, REGELN.md V6)")
    m = np.zeros(next(iter(masken.values())).shape, bool)
    for k in klassen:
        m |= masken.get(k, False)
    return ndi.binary_dilation(m, iterations=rand_px) if rand_px > 0 else m


# ------------------------------------------------------------------ Kacheln
def kacheln(W: int, H: int, groesse: int, ueberlappung: int) -> list[tuple[int, int, int, int]]:
    """Rechtecke (x0, y0, x1, y1) der Groesse `groesse` (bei kleineren Bildern das Bild), die das Bild mit
    mindestens `ueberlappung` Pixeln Ueberlappung abdecken."""
    def achse(n):
        if n <= groesse:
            return [0]
        k = math.ceil((n - ueberlappung) / (groesse - ueberlappung))
        return [round(i * (n - groesse) / (k - 1)) for i in range(k)] if k > 1 else [0]
    gw, gh = min(groesse, W), min(groesse, H)
    return [(x, y, x + gw, y + gh) for y in achse(H) for x in achse(W)]


def _gewicht(w: int, h: int, rand: int) -> np.ndarray:
    def r(n):
        a = np.ones(n, np.float32)
        if rand > 0 and n > 2 * rand:
            t = np.linspace(0, 1, rand + 2, dtype=np.float32)[1:-1]
            a[:rand], a[-rand:] = t, t[::-1]
        return a
    return np.outer(r(h), r(w))


def _farbe_angleichen(x: np.ndarray, ref: np.ndarray, staerke: float) -> np.ndarray:
    """Mittelwert und Streuung in Lab teilweise auf die Referenz (gegen Farbdrift je Kachel)."""
    if staerke <= 0:
        return x
    from .kompositing import lab_zu_rgb, rgb_zu_lab
    a, b = rgb_zu_lab(x), rgb_zu_lab(ref)
    mu_a, sd_a = a.reshape(-1, 3).mean(0), a.reshape(-1, 3).std(0) + 1e-3
    mu_b, sd_b = b.reshape(-1, 3).mean(0), b.reshape(-1, 3).std(0) + 1e-3
    z = (a - mu_a) / sd_a * (sd_a + staerke * (sd_b - sd_a)) + mu_a + staerke * (mu_b - mu_a)
    return lab_zu_rgb(z)


# ------------------------------------------------------------------ Hauptfunktion
def _speicher() -> dict:
    r = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    rss_gb = r / 1e9 if platform.system() == "Darwin" else r / 1e6          # macOS Bytes, Linux kB
    out = {"prozess_max_gb": round(rss_gb, 2)}
    try:
        import torch
        if torch.backends.mps.is_available():
            out["mps_treiber_gb"] = round(torch.mps.driver_allocated_memory() / 1e9, 2)
            out["mps_belegt_gb"] = round(torch.mps.current_allocated_memory() / 1e9, 2)
        elif torch.cuda.is_available():
            out["cuda_max_gb"] = round(torch.cuda.max_memory_allocated() / 1e9, 2)
    except Exception:                                   # noqa: BLE001 (nur Kennzahl)
        pass
    return out


def ki_lokal(render_p, ebenen_ordner, prompt: str | None = None, negativ: str | None = None, modell: str = "sdxl",
             aus=None, arbeitsbreite: int | None = None, inpaint: list[str] | None = None, nur_inpaint: bool = False,
             **param) -> dict:
    import torch
    from .kompositing import _resize, bild_laden, bild_speichern
    p = {**STANDARD, **{k: v for k, v in param.items() if v is not None}}
    t0 = time.time()
    render_p = Path(render_p)
    R = bild_laden(render_p)
    H0, W0 = R.shape[:2]
    st = steuerbilder(R, ebenen_ordner)
    # Arbeitsgroesse (Test: kleiner; Breite und Hoehe durch 8 teilbar)
    W = int(arbeitsbreite or W0)
    H = int(round(H0 * W / W0))
    W, H = W - W % 8, H - H % 8
    if (W, H) != (W0, H0):
        R = _resize(R, (W, H))
        for k in ("tiefe", "kanten", "tile"):
            st[k] = _resize(st[k], (W, H))
        st["masken"] = {k: _resize(v, (W, H)) for k, v in st["masken"].items()}
    steuer = [s.strip() for s in str(p["steuerung"]).split(",") if s.strip()]
    falsch = [s for s in steuer if s not in ("tiefe", "kanten", "tile")]
    if falsch:
        raise SystemExit(f"--steuerung {falsch}: erlaubt tiefe, kanten, tile")
    prompt = prompt or PROMPT_STANDARD
    negativ = negativ if negativ is not None else NEGATIV_STANDARD
    gross = min(int(p["kachel"]), W, H) if modell != "test" else min(int(p["kachel"]), W, H)
    gross -= gross % 8
    boxen = kacheln(W, H, gross, int(p["ueberlappung"]))
    info = {"render": str(render_p), "ebenen": str(ebenen_ordner), "prompt": prompt, "negativ": negativ,
            "parameter": {**p, "steuerung": steuer}, "arbeitsgroesse": [W, H], "kacheln": len(boxen),
            "kachelgroesse": gross, "schritte_wirksam": int(round(p["schritte"] * p["staerke"]))}
    ergebnis = R.copy()
    zeiten = {}

    def laufen(pipe, dev, art, bild, maske=None):
        """Alle Kacheln (bei inpaint nur die mit Maske) rechnen und ueberblenden."""
        acc = np.zeros((H, W, 3), np.float32)
        wsum = np.zeros((H, W), np.float32)
        gen = torch.Generator(device="cpu").manual_seed(int(p["seed"]))
        n = 0
        for (x0, y0, x1, y1) in boxen:
            if maske is not None and not maske[y0:y1, x0:x1].any():
                continue
            kb = bild[y0:y1, x0:x1]
            pil = Image.fromarray(np.rint(kb * 255).astype(np.uint8))
            cimg, cmod = [], []
            for s in steuer:
                cimg.append(Image.fromarray(st[s][y0:y1, x0:x1]))
                cmod.append(MODUS[s])
            kw = dict(prompt=prompt, negative_prompt=negativ, image=pil, control_image=cimg, control_mode=cmod,
                      num_inference_steps=int(p["schritte"]), guidance_scale=float(p["cfg"]),
                      controlnet_conditioning_scale=float(p["steuerung_staerke"]), generator=gen,
                      width=x1 - x0, height=y1 - y0)
            if art == "inpaint":
                mk = maske[y0:y1, x0:x1]
                maskiert = (kb * 255).astype(np.uint8).copy()
                maskiert[mk] = 0
                kw.update(mask_image=Image.fromarray((mk * 255).astype(np.uint8)),
                          control_image=cimg + [Image.fromarray(maskiert)], control_mode=cmod + [MODUS["inpaint"]],
                          strength=float(p["inpaint_staerke"]))
            else:
                kw["strength"] = float(p["staerke"])
            out = pipe(**kw).images[0].convert("RGB")
            if out.size != (x1 - x0, y1 - y0):
                out = out.resize((x1 - x0, y1 - y0), Image.LANCZOS)
            o = np.asarray(out, np.float32) / 255.0
            o = _farbe_angleichen(o, kb, float(p["farbe_halten"]))
            g = _gewicht(x1 - x0, y1 - y0, int(p["ueberlappung"]) // 2 if len(boxen) > 1 else 0)
            acc[y0:y1, x0:x1] += o * g[..., None]
            wsum[y0:y1, x0:x1] += g
            n += 1
        neu = np.where(wsum[..., None] > 1e-6, acc / np.maximum(wsum, 1e-6)[..., None], bild)
        return neu, n

    if inpaint:
        from scipy import ndimage as ndi
        mk = inpaint_maske(st["masken"], inpaint, int(p["inpaint_rand_px"]))
        t = time.time()
        pipe, dev, dtype, minfo = pipeline_laden(modell, "inpaint")
        zeiten["laden_inpaint_s"] = round(time.time() - t, 1)
        t = time.time()
        neu, n = laufen(pipe, dev, "inpaint", ergebnis, mk)
        weich = ndi.gaussian_filter(mk.astype(np.float32), 2.0)[..., None]
        ergebnis = weich * neu + (1 - weich) * ergebnis
        zeiten["inpaint_s"] = round(time.time() - t, 1)
        info.update(inpaint={"klassen": inpaint, "anteil_prozent": round(100 * float(mk.mean()), 2), "kacheln": n},
                    modell_info=minfo)
        del pipe
        _leeren()
    if not nur_inpaint:
        t = time.time()
        pipe, dev, dtype, minfo = pipeline_laden(modell, "verfeinern")
        zeiten["laden_s"] = round(time.time() - t, 1)
        t = time.time()
        ergebnis, n = laufen(pipe, dev, "verfeinern", ergebnis)
        zeiten["verfeinern_s"] = round(time.time() - t, 1)
        zeiten["je_kachel_s"] = round(zeiten["verfeinern_s"] / max(n, 1), 1)
        info["modell_info"] = minfo
        del pipe
        _leeren()
    if (W, H) != (W0, H0):
        ergebnis = _resize(ergebnis.astype(np.float32), (W0, H0))
    if aus is None:
        aus = render_p.with_name(f"{render_p.stem}_ki_lokal_{modell}_s{int(round(100 * p['staerke']))}.jpg")
    aus = Path(aus)
    bild_speichern(ergebnis, aus)
    zeiten["gesamt_s"] = round(time.time() - t0, 1)
    info.update(ergebnis=str(aus), zeiten=zeiten, speicher=_speicher(), versionen=_versionen(),
                hinweis="Geometrie aus Tiefe und Kanten des Renders; danach schutz --modus toleranz und grading")
    info["pruefbild"] = str(_pruefbild(bild_laden(render_p), ergebnis, info, aus.with_name(aus.stem + "_pruefung.jpg")))
    aus.with_name(aus.stem + ".json").write_text(json.dumps(info, ensure_ascii=False, indent=1))
    return info


def _leeren():
    import gc
    gc.collect()
    try:
        import torch
        if torch.backends.mps.is_available():
            torch.mps.empty_cache()
        elif torch.cuda.is_available():
            torch.cuda.empty_cache()
    except Exception:                                   # noqa: BLE001
        pass


def _versionen() -> dict:
    out = {"python": platform.python_version(), "system": f"{platform.system()} {platform.machine()}"}
    for m in ("torch", "diffusers", "transformers", "accelerate"):
        try:
            out[m] = __import__(m).__version__
        except Exception:                               # noqa: BLE001
            out[m] = None
    return out


def _pruefbild(R, E, info, pfad: Path) -> Path:
    from PIL import ImageDraw
    from .kompositing import _resize, _schrift
    bw = min(1200, R.shape[1])
    bh = round(R.shape[0] * bw / R.shape[1])
    o = Image.new("RGB", (2 * bw + 10, bh + 50), (250, 250, 248))
    d = ImageDraw.Draw(o)
    f = _schrift(15)
    for i, (t, x) in enumerate((("Render (Blender)", R), ("KI lokal", E))):
        o.paste(Image.fromarray(np.rint(np.clip(_resize(x.astype(np.float32), (bw, bh)), 0, 1) * 255).astype(np.uint8)),
                (i * (bw + 10), 50))
        d.text((i * (bw + 10) + 4, 30), t, fill=(40, 40, 40), font=f)
    p = info["parameter"]
    d.text((6, 6), f"ki-lokal {info.get('modell_info', {}).get('modell')}: Staerke {p['staerke']}, Steuerung "
                   f"{','.join(p['steuerung'])} {p['steuerung_staerke']}, {info['kacheln']} Kacheln, "
                   f"{info['zeiten'].get('gesamt_s')} s", fill=(30, 30, 30), font=f)
    o.save(pfad, quality=90)
    return pfad


def main_cli(a) -> int:
    inp = [k for k in (a.inpaint or "").split(",") if k]
    info = ki_lokal(a.render, a.ebenen, a.prompt, a.negativ, a.modell, a.out, a.arbeitsbreite, inp or None,
                    a.nur_inpaint, staerke=a.staerke, schritte=a.schritte, cfg=a.cfg, steuerung=a.steuerung,
                    steuerung_staerke=a.steuerung_staerke, kachel=a.kachel, ueberlappung=a.ueberlappung,
                    seed=a.seed, farbe_halten=a.farbe_halten, inpaint_staerke=a.inpaint_staerke)
    print(json.dumps(info, ensure_ascii=False, indent=1))
    return 0
