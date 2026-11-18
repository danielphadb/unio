"""Schutz-Kompositing nach der KI-Veredelung (Element Preservation).

Prinzip: Gebaeude und Planelemente (Fenster, Rahmen, Gelaender, Leuchten, Strassenmoebel, standardmaessig Autos)
kommen pixelgenau aus Blender, die KI darf nur Himmel, Vegetation, Menschen, Boden und Stimmung bearbeiten.
Die Schutzmaske stammt aus den Render-Ebenen (`lib/ebenen.py`, `immoviz.py render --ebenen`).

Ablauf (`immoviz.py schutz --render <beauty.png> --ki <veredelt.jpg> --ebenen <ordner>`):
1. Ausrichtung KI auf Render: Aehnlichkeitstransformation aus `nachkontrolle.ausrichten` (Phasen-/NCC-Suche ueber
   Massstab und Verschiebung), danach Verfeinerung mit OpenCV ECC (Homographie, Standard) auf Gradientenbildern,
   nur im Schutzbereich. Die Verfeinerung gilt nur, wenn der Kantenabstand kleiner wird.
2. Farbabgleich: die Blender-Pixel im Schutzbereich bekommen die Farbstimmung der KI. Lokal in Lab: Mittelwert und
   Streuung je Bildregion (Gauss-Fenster, grob 6 % und fein 1,5 % der Bildbreite, fein nahe der Maskenkante, damit
   keine Naht entsteht), getrennt nach Gruppen (Glas, Autos, uebrige Schutzklassen), Streuungsverhaeltnis begrenzt.
   Nur Farbe und Helligkeit aendern sich, die Kanten (Geometrie) bleiben die des Renders.
   Stark abweichende KI-Pixel (Laub, Personen) zaehlen nicht in die Statistik.
3. Hintergrund: hinter Platzhaltern (und ungeschuetzten Platzhalter-Autos) die Fassade aus dem zweiten Durchgang
   (`ebenen.hintergrund`), sonst bleiben Umrisse der Platzhalter und eine Naht auf Autohoehe. Realistische Autos
   (ebenen.json `autos: modelle`) werden nicht ersetzt: die KI uebernimmt sie, dort bleibt KI bzw. Render.
4. KI-Vordergrund: Personen, Radfahrer, Autos der KI vor der Fassade, die am Boden stehen, bleiben KI
   (`vordergrund_finden`).
5. Zuruecksetzen: Ergebnis = Schutzmaske ohne Vordergrund (weiche Kante) * Blender farbangeglichen + Rest * KI.
   Schatten, Spiegelungen, Menschen und Baeume der KI ausserhalb des Schutzbereichs bleiben.
6. Kennzahlen (JSON) und Pruefbild (Schutzmaske rot, erhaltener Vordergrund gruen).

Grenzen: Baeume der KI, die ueber den Blender-Baum hinaus vor die Fassade ragen, werden abgeschnitten. Teile einer
Person, die fast wie die Fassade aussehen, koennen fehlen. Putz- und Stuckdetail der KI im Schutzbereich
geht verloren (das Gebaeude ist das Blender-Material mit KI-Farbstimmung); dafuer braucht es gute Materialien in
Blender.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

from . import ebenen as EB
from . import nachkontrolle as NK

ANALYSE_MAX = 1600            # Breite fuer Ausrichtung/ECC und Kennzahlen (Pixel), Ergebnis in voller Render-Groesse
STATISTIK_MAX = 640           # Breite fuer die lokale Farbstatistik
SIGMA_GROB = 0.06             # Anteil der Bildbreite
SIGMA_FEIN = 0.015
KANTE_FEIN = 0.02             # Abstand zur Maskenkante (Anteil Breite), bis zu dem die feine Statistik zaehlt
VERHAELTNIS = (0.5, 2.0)      # Grenzen fuer das Streuungsverhaeltnis KI/Render


# ------------------------------------------------------------------ Farbraum (sRGB <-> Lab D65)
def _lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _gam(c):
    c = np.clip(c, 0, None)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.power(c, 1 / 2.4) - 0.055)


_M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750],
               [0.0193339, 0.1191920, 0.9503041]], np.float32)
_WP = np.array([0.95047, 1.0, 1.08883], np.float32)


def rgb_zu_lab(rgb: np.ndarray) -> np.ndarray:
    xyz = _lin(rgb.astype(np.float32)) @ _M.T / _WP
    e = 216 / 24389
    f = np.where(xyz > e, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])],
                    -1).astype(np.float32)


def lab_zu_rgb(lab: np.ndarray) -> np.ndarray:
    fy = (lab[..., 0] + 16) / 116
    fx = fy + lab[..., 1] / 500
    fz = fy - lab[..., 2] / 200
    e = 216 / 24389
    k = 24389 / 27

    def inv(f):
        return np.where(f ** 3 > e, f ** 3, (116 * f - 16) / k)
    xyz = np.stack([inv(fx), np.where(lab[..., 0] > k * e, fy ** 3, lab[..., 0] / k), inv(fz)], -1) * _WP
    rgb = xyz @ np.linalg.inv(_M).T.astype(np.float32)
    return np.clip(_gam(rgb), 0, 1).astype(np.float32)


def bild_laden(p) -> np.ndarray:
    return np.asarray(Image.open(p).convert("RGB"), dtype=np.float32) / 255.0


def bild_speichern(rgb: np.ndarray, p, qualitaet: int = 95) -> Path:
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray(np.rint(np.clip(rgb, 0, 1) * 255).astype(np.uint8))
    if p.suffix.lower() in (".jpg", ".jpeg"):
        im.save(p, quality=qualitaet, subsampling=0)
    else:
        im.save(p)
    return p


def _grau(rgb):
    return (rgb @ np.array([0.299, 0.587, 0.114], np.float32)).astype(np.float32)


def _resize(a, groesse, nearest=False):
    import cv2
    w, h = groesse
    if a.dtype == bool:
        return cv2.resize(a.astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST) > 0
    inter = cv2.INTER_NEAREST if nearest else (cv2.INTER_AREA if w < a.shape[1] else cv2.INTER_LINEAR)
    return cv2.resize(a, (w, h), interpolation=inter)


# ------------------------------------------------------------------ Ausrichtung
def _gradbild(g: np.ndarray) -> np.ndarray:
    e = NK._ausgleich(g)
    _, _, m = NK._gradient(e, 1.0)
    m = ndi.gaussian_filter(np.sqrt(m), 1.2)
    return ((m - m.mean()) / (m.std() + 1e-6)).astype(np.float32)


def _canny(g: np.ndarray) -> np.ndarray:
    import cv2
    e = (NK._ausgleich(g) * 255).astype(np.uint8)
    e = cv2.GaussianBlur(e, (3, 3), 0)
    return cv2.Canny(e, 50, 130) > 0


def kantenabstand(ref_kanten: np.ndarray, kanten: np.ndarray, maske: np.ndarray, kappe: float = 15.0) -> dict:
    """Abstand der Referenzkanten zur naechsten Kante im zweiten Bild (Pixel), nur in der Maske."""
    r = ref_kanten & maske
    if r.sum() < 20:
        return {"median_px": None, "mittel_px": None, "n": int(r.sum())}
    dt = ndi.distance_transform_edt(~kanten)
    d = np.minimum(dt[r], kappe)
    return {"median_px": round(float(np.median(d)), 2), "mittel_px": round(float(d.mean()), 2), "n": int(r.sum())}


def _canny_stufe(g: np.ndarray, maske: np.ndarray, lo: int, hi: int) -> np.ndarray:
    import cv2
    e = (NK._ausgleich(g, maske if maske.sum() > 100 else None) * 255).astype(np.uint8)
    return cv2.Canny(cv2.GaussianBlur(e, (3, 3), 0), lo, hi) > 0


def kanten_deckung(g_ref: np.ndarray, g_test: np.ndarray, maske: np.ndarray, tol: int = 1) -> dict:
    """Geometrievergleich unabhaengig von Farbe und Kontrast: starke Kanten des Testbilds muessen in der Naehe
    (tol px) einer auch schwachen Kante der Referenz liegen (praezision: nichts Neues) und umgekehrt
    (vollstaendig: nichts fehlt). Helligkeit je Bild in der Maske ausgeglichen. F1 aus beiden."""
    if maske.sum() < 50:
        return {"f1": None, "vollstaendig": None, "praezision": None}
    st = ndi.generate_binary_structure(2, 2)
    d = (lambda x: ndi.binary_dilation(x, st, iterations=tol)) if tol else (lambda x: x)
    r_lo, r_hi = (_canny_stufe(g_ref, maske, *t) & maske for t in ((20, 50), (60, 150)))
    t_lo, t_hi = (_canny_stufe(g_test, maske, *t) & maske for t in ((20, 50), (60, 150)))
    if r_hi.sum() < 20 or t_hi.sum() < 20:
        return {"f1": None, "vollstaendig": None, "praezision": None}
    praez = float((t_hi & d(r_lo)).sum() / t_hi.sum())
    voll = float((r_hi & d(t_lo)).sum() / r_hi.sum())
    f1 = 2 * voll * praez / max(voll + praez, 1e-9)
    return {"f1": round(f1, 4), "vollstaendig": round(voll, 4), "praezision": round(praez, 4)}


def _grad_ncc(ga, gb, maske) -> float | None:
    if maske.sum() < 50:
        return None
    _, _, ma = NK._gradient(ga, 0.8)
    _, _, mb = NK._gradient(gb, 0.8)
    a, b = ma[maske], mb[maske]
    a, b = a - a.mean(), b - b.mean()
    return round(float((a * b).sum() / math.sqrt((a * a).sum() * (b * b).sum() + 1e-12)), 4)


def _affin_aus_nk(al: dict, groesse_r, groesse_k, wa: int) -> np.ndarray:
    """Ergebnis von NK.ausrichten (Arbeitsbreite wa) als 3x3-Matrix KI-Vollbild -> Render-Vollbild (x, y)."""
    WR, HR = groesse_r
    WK, HK = groesse_k
    fa, fb = wa / WR, wa / WK
    ha, hb = max(1, round(HR * fa)), max(1, round(HK * fb))
    cA = np.array([(wa - 1) / 2, (ha - 1) / 2])
    cB = np.array([(wa - 1) / 2, (hb - 1) / 2])
    s = al["massstab"]
    t = np.array([al["schiebung_px"][1], al["schiebung_px"][0]])           # (dx, dy)
    # x_r = ((s * ((x_k + .5) fb - .5 - cB) + cA + t) + .5) / fa - .5
    A = s * fb / fa
    off = (s * (0.5 * fb - 0.5 - cB) + cA + t + 0.5) / fa - 0.5
    return np.array([[A, 0, off[0]], [0, A, off[1]], [0, 0, 1]], np.float64)


def warp(ki: np.ndarray, H: np.ndarray, groesse) -> tuple[np.ndarray, np.ndarray]:
    """KI-Bild mit H (KI -> Render) in die Render-Groesse abbilden. Bei starker Verkleinerung erst flaechig
    verkleinern (kein Aliasing). Rueckgabe Bild und Gueltigkeitsmaske."""
    import cv2
    W, Hh = groesse
    s = math.sqrt(abs(np.linalg.det(H[:2, :2])))
    if s < 0.8:
        f = s * 1.05
        k2 = cv2.resize(ki, (max(2, round(ki.shape[1] * f)), max(2, round(ki.shape[0] * f))),
                        interpolation=cv2.INTER_AREA)
        S = np.diag([ki.shape[1] / k2.shape[1], ki.shape[0] / k2.shape[0], 1.0])
        H2, ki = H @ S, k2
    else:
        H2 = H
    out = cv2.warpPerspective(ki, H2, (W, Hh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    gueltig = cv2.warpPerspective(np.ones(ki.shape[:2], np.uint8), H2, (W, Hh), flags=cv2.INTER_NEAREST,
                                  borderMode=cv2.BORDER_CONSTANT, borderValue=0) > 0
    gueltig = ndi.binary_erosion(gueltig, iterations=2)
    return np.clip(out, 0, 1).astype(np.float32), gueltig


AUSRICHT_KLASSEN = ["gebaeude_objekt", "fenster_glas", "fenster_rahmen", "gelaender"]


def ausricht_maske(masken: dict, rueckfall: np.ndarray) -> np.ndarray:
    """Bereich fuer die Feinausrichtung: nur feste Architektur des Objekts (Autos, Baeume, Menschen aendert die KI
    bewusst); bei kleinem Objektanteil kommen die Nachbarn dazu."""
    m = np.zeros_like(rueckfall)
    for k in AUSRICHT_KLASSEN:
        m |= masken.get(k, False)
    if m.mean() < 0.05:
        m |= masken.get("nachbarn", False)
    return m if m.sum() > 500 else rueckfall


def ausrichten_ki(render: np.ndarray, ki: np.ndarray, schutz_hart: np.ndarray, modell: str = "homographie") -> dict:
    """KI-Bild auf das Render legen. modell: aehnlich (nur Massstab+Verschiebung), affin oder homographie.
    Rueckgabe: H (3x3, KI-Vollbild -> Render-Vollbild), Kennzahlen."""
    import cv2
    HR, WR = render.shape[:2]
    HK, WK = ki.shape[:2]
    wa = NK.ARBEITSBREITE
    gA = _grau(_resize(render, (wa, max(1, round(HR * wa / WR)))))
    gB = _grau(_resize(ki, (wa, max(1, round(HK * wa / WK)))))
    al = NK.ausrichten(NK._ausgleich(gA), NK._ausgleich(gB))
    H0 = _affin_aus_nk(al, (WR, HR), (WK, HK), wa)
    # Analyseebene
    fa = min(1.0, ANALYSE_MAX / WR)
    wan, han = round(WR * fa), round(HR * fa)
    Sw = np.diag([wan / WR, han / HR, 1.0])
    r_kl = _resize(render, (wan, han))
    gr = _grau(r_kl)
    m_kl = _resize(schutz_hart, (wan, han))
    m_ecc = ndi.binary_dilation(m_kl, iterations=3)
    kr = _canny(gr)
    bewert = ndi.binary_erosion(m_kl, iterations=3)

    def guete(Hm):
        kw, gv = warp(ki, Sw @ Hm, (wan, han))
        gk = _grau(kw)
        kk = _canny(gk)
        return kantenabstand(kr, kk, bewert & gv), kw, gv
    g0, kw0, gv0 = guete(H0)
    best = {"H": H0, "modell": "aehnlich", "kanten": g0, "ecc": None}
    if modell != "aehnlich":
        art = cv2.MOTION_HOMOGRAPHY if modell == "homographie" else cv2.MOTION_AFFINE
        Wm = np.eye(3, dtype=np.float32) if art == cv2.MOTION_HOMOGRAPHY else np.eye(2, 3, dtype=np.float32)
        try:
            T = _gradbild(gr)
            I = _gradbild(_grau(kw0))
            maske = (m_ecc & gv0).astype(np.uint8)
            cc, Wm = cv2.findTransformECC(T, I, Wm, art, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6),
                                          maske, 5)
            W3 = Wm if art == cv2.MOTION_HOMOGRAPHY else np.vstack([Wm, [0, 0, 1]])
            # Render(Analyse) p -> KIwarp(Analyse) W p -> KI-Vollbild: (Sw H0)^-1 W p
            M = np.linalg.inv(Sw @ H0) @ W3.astype(np.float64) @ Sw          # Render-Vollbild -> KI-Vollbild
            H1 = np.linalg.inv(M)
            g1, _, _ = guete(H1)
            if g1["mittel_px"] is not None and (g0["mittel_px"] is None or g1["mittel_px"] < g0["mittel_px"]):
                best = {"H": H1, "modell": modell, "kanten": g1, "ecc": round(float(cc), 4)}
            else:
                best["ecc"] = round(float(cc), 4)
                best["ecc_verworfen"] = True
        except cv2.error as e:                                          # ECC konvergiert nicht: Aehnlichkeit bleibt
            best["ecc_fehler"] = str(e).splitlines()[-1][:120]
    H = best["H"] / best["H"][2, 2]
    A = H[:2, :2]
    best.update({"massstab_grob": round(al["massstab"], 4), "deckung_grob": round(al["deckung"], 3),
                 "massstab": round(math.sqrt(abs(np.linalg.det(A))) * WK / WR, 4),
                 "schiebung_prozent": round(100 * math.hypot(*(H @ [WK / 2, HK / 2, 1])[:2] - np.array(
                     [WR / 2, HR / 2])) / WR, 2), "analysebreite": wan})
    return best


# ------------------------------------------------------------------ Farbabgleich
def _lokal(X: np.ndarray, w: np.ndarray, sigma: float):
    """Gewichteter lokaler Mittelwert und Streuung je Kanal (X: h x w x c, w: h x w)."""
    nenner = ndi.gaussian_filter(w, sigma, mode="nearest")
    mu = np.stack([ndi.gaussian_filter(X[..., c] * w, sigma, mode="nearest") for c in range(X.shape[-1])], -1)
    q = np.stack([ndi.gaussian_filter(X[..., c] ** 2 * w, sigma, mode="nearest") for c in range(X.shape[-1])], -1)
    n = np.maximum(nenner, 1e-6)[..., None]
    mu = mu / n
    sd = np.sqrt(np.maximum(q / n - mu ** 2, 0.0))
    return mu, sd, nenner


def farbabgleich(B_lab: np.ndarray, K_lab: np.ndarray, gruppen: list[np.ndarray], gueltig: np.ndarray,
                 schutz_hart: np.ndarray, staerke: float = 1.0) -> np.ndarray:
    """Lokale Lab-Statistik der KI auf die Blender-Pixel uebertragen, je Gruppe (Masken in voller Groesse).
    Statistik auf verkleinertem Raster, Ergebnis in voller Groesse."""
    H, W = B_lab.shape[:2]
    f = min(1.0, STATISTIK_MAX / W)
    ws, hs = max(8, round(W * f)), max(8, round(H * f))
    Bs, Ks = _resize(B_lab, (ws, hs)), _resize(K_lab, (ws, hs))
    gs = _resize(gueltig.astype(np.float32), (ws, hs))
    # Abstand zur Schutzkante (volle Groesse) -> Gewicht der feinen Statistik
    rand = ndi.distance_transform_edt(schutz_hart) / W
    w_fein = np.exp(-rand / KANTE_FEIN)[..., None].astype(np.float32)
    T = B_lab.copy()
    eps = np.array([2.0, 1.5, 1.5], np.float32)
    for gm in gruppen:
        if gm.sum() < 50:
            continue
        stat = ndi.binary_erosion(gm, iterations=2) & gueltig
        if stat.sum() < 50:
            stat = gm & gueltig
        w = _resize(stat.astype(np.float32), (ws, hs)) * gs
        if w.sum() < 4:
            continue
        # globale Werte als Rueckfall, wo die Gruppe lokal fehlt
        gB, gK = B_lab[stat], K_lab[stat]
        muBg, muKg, sdBg, sdKg = gB.mean(0), gK.mean(0), gB.std(0), gK.std(0)
        res = []
        for sg in (SIGMA_GROB, SIGMA_FEIN):
            sig = max(1.0, sg * ws)
            muB, sdB, nB = _lokal(Bs, w, sig)
            muK, sdK, _ = _lokal(Ks, w, sig)
            # wenig Stuetzung: zur globalen Statistik ziehen
            a = np.clip(nB / (nB + 0.05), 0, 1)[..., None]
            muB = a * muB + (1 - a) * muBg
            muK = a * muK + (1 - a) * muKg
            sdB = a * sdB + (1 - a) * sdBg
            sdK = a * sdK + (1 - a) * sdKg
            res.append([_resize(x.astype(np.float32), (W, H)) for x in (muB, sdB, muK, sdK)])
        (muB1, sdB1, muK1, sdK1), (muB2, sdB2, muK2, sdK2) = res
        muB = (1 - w_fein) * muB1 + w_fein * muB2
        muK = (1 - w_fein) * muK1 + w_fein * muK2
        sdB = (1 - w_fein) * sdB1 + w_fein * sdB2
        sdK = (1 - w_fein) * sdK1 + w_fein * sdK2
        r = np.clip((sdK + eps) / (sdB + eps), *VERHAELTNIS)
        neu = (B_lab - muB) * r + muK
        T[gm] = (B_lab + staerke * (neu - B_lab))[gm]
    T[..., 0] = np.clip(T[..., 0], 0, 100)
    return T


# ------------------------------------------------------------------ Hintergrund und Vordergrund
def hintergrund_einsetzen(R: np.ndarray, masken: dict, ordner, schutz: list[str], autos_art: str = "platzhalter"):
    """Render und Masken hinter Platzhaltern (und ungeschuetzten Autos) aus dem zweiten Durchgang
    (`ebenen.hintergrund`, Ordner <ebenen>/hintergrund). Liefert (R, masken, V) mit V = ersetzte Pixel oder None."""
    hg = Path(ordner) / "hintergrund"
    leer = (R, masken, None, None)
    if not (hg / "ebenen.json").exists() or not (hg / "bereich.png").exists():
        return leer
    H, W = R.shape[:2]
    bereich = np.asarray(Image.open(hg / "bereich.png").convert("L")) > 127
    bereich = ndi.binary_erosion(bereich, iterations=4)
    mb = EB.laden(hg)["masken"]
    V = np.zeros((H, W), bool)
    for k in EB.HINTERGRUND_KLASSEN:
        if k in schutz or k not in masken:          # geschuetzte Autos bleiben die Blender-Autos
            continue
        if k == "autos" and autos_art == "modelle":  # realistische Autos: die KI uebernimmt sie, dort bleibt KI
            continue
        m = ndi.binary_dilation(masken[k], iterations=2)     # Kantenpixel (Antialiasing) mit ersetzen
        if k == "baeume":                           # Baeume nur, wo dahinter etwas Geschuetztes liegt
            hinten = np.zeros((H, W), bool)
            for ks in schutz:
                hinten |= mb.get(ks, False)
            m &= hinten
        V |= m
    V &= bereich
    if not V.any():
        return leer
    Rb = bild_laden(hg / "beauty.png")
    if Rb.shape != R.shape:
        raise ValueError(f"Hintergrund {Rb.shape} passt nicht zum Render {R.shape}")
    # Lichtangleich: ohne Baeume und Autos faellt mehr Licht auf die Fassade dahinter. Lokale Lab-Differenz
    # Hauptbild minus Hintergrund dort, wo beide dieselbe Flaeche zeigen (Ring um die ersetzten Pixel, gleiche Klasse)
    weg = np.zeros((H, W), bool)
    for k in EB.HINTERGRUND_KLASSEN:
        if k in masken:
            weg |= masken[k]
    ring = bereich & ~ndi.binary_dilation(weg, iterations=3)
    for k in ("himmel", "sonstige"):
        ring &= ~masken.get(k, np.zeros_like(ring))
    Lm, Lb = rgb_zu_lab(R), rgb_zu_lab(Rb)
    f = min(1.0, STATISTIK_MAX / W)
    g = (max(8, round(W * f)), max(8, round(H * f)))
    wr = _resize(ring.astype(np.float32), g)
    sig = max(1.0, SIGMA_FEIN * g[0])
    mu_m, _, n = _lokal(_resize(Lm, g), wr, sig)
    mu_b, _, _ = _lokal(_resize(Lb, g), wr, sig)
    a = np.clip(n / (n + 0.05), 0, 1)[..., None]
    diff = _resize((a * (mu_m - mu_b)).astype(np.float32), (W, H))
    Lb = Lb + diff
    Lb[..., 0] = np.clip(Lb[..., 0], 0, 100)
    Rb = lab_zu_rgb(Lb)
    R2 = R.copy()
    R2[V] = Rb[V]
    m2 = {k: np.where(V, mb.get(k, np.zeros_like(V)), v) for k, v in masken.items()}
    baum = V & ndi.binary_dilation(masken.get("baeume", np.zeros_like(V)), iterations=2)
    return R2, m2, V, baum


LAUB = {"saum_anteil": 0.012,     # KI-Laub bis so weit (Anteil Bildbreite) ausserhalb des Blender-Baums erhalten
        "seed_dE": 25.0,          # sichere Laubpixel fuer das Farbmodell (dE gegen Fassade dahinter)
        "min_dE": 10.0,           # darunter sieht die KI wie die Fassade aus: Render
        "maha": 3.0,              # Mahalanobis-Abstand zum Laubmodell (Lab)
        "struktur": 2.5,          # Mindeststreuung von L im 5x5-Fenster: Laub ist unruhig, Putz glatt
        "krone_anteil": 0.008}    # Luecken zwischen Blaettern bis zu diesem Radius (Anteil Breite) schliessen: die
                                  # ganze KI-Krone bleibt KI, die Naht liegt am Aussenrand der Blaetter


def laub_finden(K_lab, T_lab, baum: np.ndarray, hart: np.ndarray, gueltig: np.ndarray, p: dict | None = None):
    """Vor der geschuetzten Fassade, wo in Blender ein Baum steht (plus schmaler Saum): KI-Pixel, die wie Laub
    aussehen, bleiben KI; KI-Pixel, die wie Fassade aussehen, werden Render (Fassade aus dem Hintergrund-Durchgang).
    Laubmodell: Lab-Mittel und -Kovarianz der KI an sicheren Laubpixeln (dE ueber seed_dE) im Blender-Baum."""
    p = {**LAUB, **(p or {})}
    H, W = hart.shape
    if not baum.any():
        return np.zeros((H, W), bool), {"pixel": 0}
    saum = ndi.distance_transform_edt(~baum) <= p["saum_anteil"] * W
    zone = saum & hart & gueltig
    D = ndi.gaussian_filter(np.sqrt(((T_lab - K_lab) ** 2).sum(-1)), 1.0)
    seed = zone & baum & (D > p["seed_dE"])
    if seed.sum() < 500:
        return np.zeros((H, W), bool), {"pixel": 0, "hinweis": "zu wenig sichere Laubpixel"}
    X = K_lab[seed][:: max(1, int(seed.sum()) // 200000)].astype(np.float64)
    mu, C = X.mean(0), np.cov(X.T) + np.eye(3) * 1.0
    Ci = np.linalg.inv(C)
    Y = K_lab[zone].astype(np.float64) - mu
    m = np.sqrt(np.einsum("ij,jk,ik->i", Y, Ci, Y))
    Lk = K_lab[..., 0]
    sd = np.sqrt(np.maximum(ndi.uniform_filter(Lk ** 2, 5) - ndi.uniform_filter(Lk, 5) ** 2, 0))
    sd = ndi.maximum_filter(sd, 3)                         # Blattinneres neben Kanten mitnehmen
    laub = np.zeros((H, W), bool)
    laub[zone] = (m < p["maha"]) & (D[zone] > p["min_dE"]) & (sd[zone] > p["struktur"])
    laub = ndi.binary_closing(ndi.binary_opening(laub, iterations=1), iterations=2) & zone
    # Krone: Luecken zwischen den Blaettern schliessen (auf halber Groesse), innen alles KI
    fk = min(1.0, ANALYSE_VG / W)
    gk = (round(W * fk), round(H * fk))
    lk = _resize(laub, gk, nearest=True)
    r = max(2, int(round(p["krone_anteil"] * gk[0])))
    lk = ndi.binary_fill_holes(ndi.binary_closing(lk, structure=_scheibe(r)))
    krone = _resize(lk, (W, H), nearest=True)
    laub = (laub | (ndi.binary_erosion(krone, iterations=2) & zone)) & zone
    return laub, {"pixel": int(laub.sum()), "anteil_prozent": round(100.0 * float(laub.mean()), 3),
                  "modell_lab": [round(float(v), 1) for v in mu], "zone_prozent": round(100.0 * float(zone.mean()), 2)}


VG = {"schwelle": 14.0,          # dE KI gegen farbangeglichenen Render (geglaettet): Kandidat auf Wand, Boden
      "schwelle_glas": 26.0,     # auf Glas (KI malt dort eigene Innenraeume, nur deutlich Abweichendes zaehlt)
      "oeffnen_px": 4,           # Radius (Analyseebene 1920 px): Rahmen, Stangen, Linien fallen weg
      "boden_min_px": 60,        # der Fleck muss mit so vielen Pixeln auf dem Boden stehen
      "max_hoehe_m": 2.4,        # hoechstens so hoch ueber dem Fusspunkt (Personen, Radfahrer, Autos)
      "vor_fassade_m": 0.4,      # Fusspunkt mindestens so weit vor der Fassadenbasis
      "statistik_ausreisser": 20.0}   # dE ab dem ein Pixel nicht in die Farbstatistik zaehlt
ANALYSE_VG = 1920


def _scheibe(r: int) -> np.ndarray:
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def _abweichung(B_lab, K_lab, gruppen, gueltig, hart):
    """dE zwischen KI und farbangeglichenem Render, leicht geglaettet (gleiche Groesse wie die Eingaben)."""
    T = farbabgleich(B_lab, K_lab, gruppen, gueltig, hart)
    return ndi.gaussian_filter(np.sqrt(((T - K_lab) ** 2).sum(-1)), 1.0)


def vordergrund_finden(B_lab, K_lab, masken: dict, hart: np.ndarray, gueltig: np.ndarray, schutz: list[str],
                       tiefe_m: np.ndarray | None, f_px: float | None, p: dict | None = None,
                       ausschluss: np.ndarray | None = None):
    """Was die KI vor die geschuetzte Fassade stellt und am Boden steht (Personen, Radfahrer, Autos) bleibt KI.

    Auf der Analyseebene: dE zwischen KI und farbangeglichenem Render (Boden mit eigenem Abgleich), Kandidaten ueber
    der Schwelle (Glas mit hoeherer Schwelle, geschuetzte Autos nie), Oeffnen mit einer Scheibe (duenne Rahmen,
    Stangen, Kanten fallen weg). Ein Fleck zaehlt als Vordergrund, wenn er die geschuetzte Flaeche beruehrt, mit
    `boden_min_px` auf dem Boden steht, sein Fusspunkt laut Render-Tiefe mindestens `vor_fassade_m` vor der
    Fassadenbasis liegt, und nur bis `max_hoehe_m` ueber dem Fusspunkt (Hoehe aus Tiefe und Brennweite). Jeder Teil
    ueber der geschuetzten Flaeche bekommt seinen Fusspunkt aus den Pixeln direkt darunter. `ausschluss` (Blender-
    Baeume vor der Fassade) gehoert nicht zur Zone, dort entscheidet `laub_finden`.
    Liefert (F in voller Groesse, Liste der Flecken, dE der Analyseebene)."""
    p = {**VG, **(p or {})}
    H, W = hart.shape
    fa = min(1.0, ANALYSE_VG / W)
    g = (round(W * fa), round(H * fa))
    w, h = g
    Bs, Ks = _resize(B_lab, g), _resize(K_lab, g)
    ms = {k: _resize(v, g, nearest=True) for k, v in masken.items()}
    hs, gs = _resize(hart, g, nearest=True), _resize(gueltig, g, nearest=True)
    leer = np.zeros((h, w), bool)
    boden = ms.get("boden", leer)
    glas = ms.get("fenster_glas", leer) & hs
    autos_fest = ms.get("autos", leer) if "autos" in schutz else leer
    gr = _gruppen(ms, schutz) + [boden]
    D = _abweichung(Bs, Ks, gr, gs, hs | boden)
    aus = D > p["statistik_ausreisser"]                 # zweiter Durchgang ohne Ausreisser (KI-Laub, Personen)
    D = _abweichung(Bs, Ks, gr, gs & ~aus, hs | boden)
    zone = (hs | boden) & ~autos_fest & gs
    if ausschluss is not None:
        zone &= ~ndi.binary_dilation(_resize(ausschluss, g, nearest=True), iterations=2)
    C = zone & np.where(glas, D > p["schwelle_glas"], D > p["schwelle"])
    C = ndi.binary_opening(C, structure=_scheibe(int(p["oeffnen_px"])))
    lab, n = ndi.label(C)
    F = np.zeros((h, w), bool)
    objekte = []
    if n == 0:
        return np.zeros((H, W), bool), objekte, D
    ts = _resize(tiefe_m.astype(np.float32), g, nearest=True) if tiefe_m is not None else None
    f = (f_px or 0.0) * fa
    geb = ms.get("gebaeude_objekt", leer) | ms.get("fenster_glas", leer) | ms.get("fenster_rahmen", leer)
    hat = geb.any(0)
    basis = np.where(hat, h - 1 - np.argmax(geb[::-1], 0), -1)      # unterste Gebaeudezeile je Spalte
    for i, sl in enumerate(ndi.find_objects(lab), start=1):
        if sl is None:
            continue
        c = lab[sl] == i
        hc = c & hs[sl]
        if not hc.any() or int((c & boden[sl]).sum()) < p["boden_min_px"]:
            continue
        # jeder Teil ueber der geschuetzten Flaeche bekommt seinen eigenen Fusspunkt (nur aus den Pixeln direkt
        # darunter): sonst verbindet der Gehsteig eine Person mit einem Fleck an der Fassade daneben
        sub, ns = ndi.label(hc)
        for j, ssl in enumerate(ndi.find_objects(sub), start=1):
            if ssl is None:
                continue
            a0, a1 = max(0, ssl[1].start - 3), min(c.shape[1], ssl[1].stop + 3)
            spalten = c[:, a0:a1]
            lab2, _ = ndi.label(spalten)
            ids = np.unique(lab2[:, ssl[1].start - a0:ssl[1].stop - a0][sub[:, ssl[1].start:ssl[1].stop] == j])
            stueck = np.isin(lab2, ids[ids > 0])
            ox, oy = sl[1].start + a0, sl[0].start
            if int((stueck & boden[oy:oy + c.shape[0], ox:ox + stueck.shape[1]]).sum()) < p["boden_min_px"] // 2:
                continue
            yy, xx = np.nonzero(stueck)
            yy, xx = yy + oy, xx + ox
            v_f = int(yy.max())
            fuss = yy >= v_f - 2
            d_f = None
            if ts is not None:
                fb = boden[yy[fuss], xx[fuss]]
                dd = ts[yy[fuss], xx[fuss]][fb] if fb.any() else ts[yy[fuss], xx[fuss]]
                d_f = float(np.median(dd)) if len(dd) else None
                bx = xx[fuss]
                bx = bx[basis[bx] >= 0]
                if d_f is not None and len(bx):
                    d_b = float(np.median(ts[basis[bx], bx]))
                    if not d_f < d_b - p["vor_fassade_m"]:
                        objekte.append({"verworfen": "nicht vor der Fassade", "zeile": v_f,
                                        "abstand_m": round(d_f, 1), "fassade_m": round(d_b, 1)})
                        continue
            rows = np.arange(sl[0].start, sl[0].stop)[:, None]
            if d_f and f > 0:
                v_top = v_f - f * p["max_hoehe_m"] / d_f
            else:
                v_top = v_f - 0.25 * h                          # ohne Tiefe/Brennweite: grobe Grenze
            teil = (sub == j) & (rows >= v_top)
            teil = ndi.binary_fill_holes(ndi.binary_closing(teil, iterations=2)) & (rows >= v_top) & hs[sl]
            if not teil.any():
                continue
            F[sl] |= teil
            oben = int(yy.min())
            objekte.append({"box_analyse": [int(xx.min()), int(yy.min()), int(xx.max()) + 1, int(yy.max()) + 1],
                            "abstand_m": round(d_f, 1) if d_f else None,
                            "hoehe_m_aus_tiefe": round((v_f - oben) * d_f / f, 2) if d_f and f > 0 else None,
                            "anteil_prozent": round(100.0 * float(teil.sum()) / (w * h), 3)})
    Ff = _resize(F, (W, H), nearest=True)
    Ff = ndi.binary_closing(Ff, iterations=2) & hart
    return Ff, objekte, D


# ------------------------------------------------------------------ Hauptfunktion
def _gruppen(masken: dict, schutz: list[str]) -> list[np.ndarray]:
    eigene = [["fenster_glas"], ["autos"]]
    out, rest = [], np.zeros(next(iter(masken.values())).shape, bool)
    vergeben = set()
    for g in eigene:
        g = [k for k in g if k in schutz and k in masken]
        if g:
            m = np.zeros_like(rest)
            for k in g:
                m |= masken[k]
            out.append(m)
            vergeben |= set(g)
    for k in schutz:
        if k not in vergeben and k in masken:
            rest |= masken[k]
    out.append(rest)
    return out


def schutz_anwenden(render_p, ki_p, ebenen_ordner, aus=None, klassen: list[str] | None = None,
                    ohne: list[str] | None = None, farbe: float = 1.0, modell: str = "homographie",
                    pruefbild: bool = True, vordergrund: bool = True) -> dict:
    render_p, ki_p = Path(render_p), Path(ki_p)
    ebn = EB.laden(ebenen_ordner)
    R = bild_laden(render_p)
    K = bild_laden(ki_p)
    H, W = R.shape[:2]
    masken = ebn["masken"]
    if next(iter(masken.values())).shape != (H, W):
        raise ValueError(f"Ebenen {next(iter(masken.values())).shape[::-1]} passen nicht zum Render {(W, H)}")
    schutz = list(klassen or ebn["meta"]["schutz_klassen"])
    schutz = [k for k in schutz if k not in (ohne or [])]
    kante = ebn["meta"].get("schutz_kante_px", EB.KANTE_WEICH_PX)
    # Hinter Platzhaltern und ungeschuetzten Autos: Fassade aus dem zweiten Durchgang (render --ebenen)
    R, masken, V, baum = hintergrund_einsetzen(R, masken, ebn["ordner"], schutz, ebn["meta"].get("autos", "platzhalter"))
    hart = np.zeros((H, W), bool)
    for k in schutz:
        hart |= masken.get(k, False)

    al = ausrichten_ki(R, K, ausricht_maske(masken, hart), modell)
    Kw, gueltig = warp(K, al["H"], (W, H))
    B_lab, K_lab = rgb_zu_lab(R), rgb_zu_lab(Kw)
    gruppen = _gruppen(masken, schutz)
    F, objekte, D = np.zeros((H, W), bool), [], None
    if vordergrund:
        kam = ebn["meta"].get("kamera_intern") or {}
        F, objekte, D = vordergrund_finden(B_lab, K_lab, masken, hart, gueltig, schutz, ebn.get("tiefe_m"),
                                           kam.get("f_px"), ausschluss=baum)
    # Farbstatistik ohne Ausreisser (KI-Laub, Personen vor der Fassade): sonst faerben sie die Fassade ein
    stat_ok = gueltig & ~F
    if D is not None:
        stat_ok &= ~_resize(D > VG["statistik_ausreisser"], (W, H), nearest=True)
    T_lab = farbabgleich(B_lab, K_lab, gruppen, stat_ok, hart, farbe)
    T = lab_zu_rgb(T_lab)
    L, laub_info = np.zeros((H, W), bool), {"pixel": 0}
    if vordergrund and baum is not None:
        L, laub_info = laub_finden(K_lab, T_lab, baum, hart, gueltig)
        # Fassade zwischen den Blaettern: die KI zeigt sie im Laubschatten, der Hintergrund-Durchgang in der Sonne.
        # Eigener lokaler Farbabgleich nur dort, Statistik aus genau diesen Pixeln (ohne Laub, mit Schatten)
        Z = baum & hart & ~L
        if Z.sum() > 2000:
            T2 = farbabgleich(B_lab, K_lab, [Z], gueltig & Z, Z, farbe)
            T_lab[Z] = T2[Z]
            T = lab_zu_rgb(T_lab)
    F = F | L
    schutz_hart = hart & ~F
    alpha = EB.weiche_kante(schutz_hart, kante)
    a = alpha[..., None]
    out = a * T + (1 - a) * Kw              # Rand ohne KI-Deckung: Kw ist dort gespiegelt fortgesetzt (BORDER_REFLECT)

    # Kennzahlen (Analyseebene)
    fa = min(1.0, ANALYSE_MAX / W)
    g = (round(W * fa), round(H * fa))
    innen = ndi.binary_erosion(_resize(schutz_hart, g), iterations=2) & _resize(gueltig, g)
    gr, gk, go = (_grau(_resize(x, g)) for x in (R, Kw, out))
    kr, kk, ko = _canny(gr), _canny(gk), _canny(go)
    dE = lambda x: float(np.sqrt(((x - B_lab) ** 2).sum(-1))[ndi.binary_erosion(schutz_hart, iterations=2) & gueltig].mean())
    O_lab = rgb_zu_lab(out)
    kz = {"render": str(render_p), "ki": str(ki_p), "ebenen": str(ebn["ordner"]), "schutz_klassen": schutz,
          "anteil_geschuetzt_prozent": round(100 * float((alpha >= 0.5).mean()), 2),
          "ausrichtung": {"modell": al["modell"], "massstab_ki_zu_render": al["massstab"],
                          "schiebung_prozent": al["schiebung_prozent"], "ecc_korrelation": al.get("ecc"),
                          "kantenabstand_median_px": al["kanten"]["median_px"],
                          "kantenabstand_mittel_px": al["kanten"]["mittel_px"],
                          "hinweis": "Abstand der Render-Kanten zur naechsten KI-Kante im Schutzbereich, Analysebreite "
                                     f"{g[0]} px"},
          "schutzbereich": {
              "farbabweichung_dE_vorher": round(dE(K_lab), 2),
              "farbabweichung_dE_nachher": round(dE(O_lab), 2),
              "kanten_vorher": kanten_deckung(gr, gk, innen),
              "kanten_nachher": kanten_deckung(gr, go, innen),
              "kantenabstand_mittel_px_vorher": kantenabstand(kr, kk, innen)["mittel_px"],
              "kantenabstand_mittel_px_nachher": kantenabstand(kr, ko, innen)["mittel_px"],
              "gradienten_korrelation_vorher": _grad_ncc(gr, gk, innen),
              "gradienten_korrelation_nachher": _grad_ncc(gr, go, innen),
              "hinweis": "kanten: praezision = Anteil starker Kanten des Bildes nahe einer Render-Kante (nichts "
                         "Neues), vollstaendig = Anteil starker Render-Kanten im Bild (nichts fehlt), Toleranz 1 px. "
                         "Nachher nahe 1 = Geometrie aus dem Render. dE nachher ist die gewollte Farbangleichung"},
          "klassen": {},
          "hintergrund": {"verwendet": V is not None,
                          "anteil_prozent": round(100 * float(V.mean()), 2) if V is not None else 0.0,
                          "hinweis": "Pixel hinter Platzhaltern (und ungeschuetzten Autos) aus dem zweiten Durchgang"},
          "laub": {**laub_info, "parameter": LAUB,
                   "hinweis": "KI-Laub vor der Fassade (Blender-Baum plus Saum), bleibt KI; Rest dort Render"},
          "vordergrund": {"aktiv": vordergrund, "anteil_prozent": round(100 * float(F.mean()), 3),
                          "flecken": [o for o in objekte if "verworfen" not in o],
                          "verworfen": [o for o in objekte if "verworfen" in o][:20],
                          "parameter": VG,
                          "hinweis": "KI-Pixel vor der geschuetzten Flaeche, die als Person/Auto am Boden gelten und "
                                     "nicht zurueckgesetzt werden (gruen im Pruefbild)"}}
    for k in ("fenster_glas", "fenster_rahmen", "gelaender", "leuchten", "gebaeude_objekt"):
        m = masken.get(k)
        if m is not None:
            m = m & ~F
        if m is None or k not in schutz or m.sum() < 30:
            continue
        mk = _resize(ndi.binary_dilation(m, iterations=1), g) & _resize(gueltig, g)
        kz["klassen"][k] = {"anteil_prozent": round(100 * float(m.mean()), 2),
                            "kanten_vorher": kanten_deckung(gr, gk, mk),
                            "kanten_nachher": kanten_deckung(gr, go, mk)}
    if aus is None:
        aus = ki_p.with_name(ki_p.stem + "_schutz.jpg")
    aus = Path(aus)
    bild_speichern(out, aus)
    kz["ergebnis"] = str(aus)
    if pruefbild:
        kz["pruefbild"] = str(_pruefbild(R, Kw, out, alpha, kz, aus.with_name(aus.stem + "_pruefung.jpg"), F))
    aus.with_name(aus.stem + ".json").write_text(json.dumps(kz, ensure_ascii=False, indent=1))
    kz["json"] = str(aus.with_name(aus.stem + ".json"))
    return kz


def maske_ueberlagern(rgb: np.ndarray, alpha: np.ndarray, farbe=(1.0, 0.1, 0.1), deckkraft: float = 0.45):
    a = (alpha * deckkraft)[..., None]
    return rgb * (1 - a) + np.array(farbe, np.float32) * a


def _schrift(gr=15):
    try:
        return ImageFont.truetype("DejaVuSans.ttf", gr)
    except OSError:
        return ImageFont.load_default()


def _pruefbild(R, Kw, out, alpha, kz, pfad: Path, F=None) -> Path:
    bw = min(900, R.shape[1])
    bh = round(R.shape[0] * bw / R.shape[1])
    ueber = maske_ueberlagern(out, alpha)
    if F is not None and F.any():
        ueber = maske_ueberlagern(ueber, F.astype(np.float32), farbe=(0.1, 0.9, 0.2), deckkraft=0.6)
    tafeln = [("Render (Blender, Hintergrund eingesetzt)", R), ("KI ausgerichtet", Kw),
              ("Schutzmaske rot, KI-Vordergrund gruen", ueber), ("Ergebnis", out)]
    kopf = 50
    o = Image.new("RGB", (2 * bw + 10, 2 * (bh + 24) + kopf), (250, 250, 248))
    d = ImageDraw.Draw(o)
    f = _schrift(15)
    for i, (t, x) in enumerate(tafeln):
        im = Image.fromarray(np.rint(np.clip(_resize(x, (bw, bh)), 0, 1) * 255).astype(np.uint8))
        px, py = (i % 2) * (bw + 10), kopf + (i // 2) * (bh + 24)
        d.text((px + 4, py + 3), t, fill=(40, 40, 40), font=f)
        o.paste(im, (px, py + 22))
    a, s = kz["ausrichtung"], kz["schutzbereich"]
    d.text((8, 6), f"Schutz-Kompositing: geschuetzt {kz['anteil_geschuetzt_prozent']} %  |  Ausrichtung {a['modell']}, "
                   f"Kantenabstand {a['kantenabstand_mittel_px']} px  |  Kanten-F1 Schutzbereich vorher "
                   f"{s['kanten_vorher']['f1']} nachher {s['kanten_nachher']['f1']}", fill=(30, 30, 30), font=f)
    d.text((8, 27), f"Klassen: {', '.join(kz['schutz_klassen'])}", fill=(90, 90, 90), font=f)
    o.save(pfad, quality=90)
    return pfad


# ------------------------------------------------------------------ Schutzzonen-Pruefung (Nachkontrolle)
ZONEN = {"fenster": ["fenster_glas", "fenster_rahmen"], "leuchten": ["leuchten"], "gelaender": ["gelaender"],
         "gebaeude": ["gebaeude_objekt"]}
# Fensterzahl: Befund ab FENSTER_NEU glasartigen Flecken auf der Wand oder wenn mehr als FENSTER_FEHLT der Render-Fenster
# im KI-Bild nicht zu finden sind (Zaehlung bei 1200 px Breite auf +-3 Fenster genau, bei 4k deutlich besser)
FENSTER_NEU, FENSTER_FEHLT = 2, 0.08
ZONE_GRENZE = {"fenster": 0.90, "leuchten": 0.85, "gelaender": 0.90, "gebaeude": 0.85}   # praezision/vollstaendig


def zonen_pruefen(render_p, veredelt_p, ebenen_ordner, modell: str = "homographie") -> dict:
    """Geschuetzte Zonen des veredelten Bildes gegen das Render (gleiche Kamera wie die Ebenen): Kantendeckung je Zone
    und Fensterzahl je Fassade (Maskenkomponenten). Fuer `immoviz.py nachkontrolle --ebenen`."""
    ebn = EB.laden(ebenen_ordner)
    masken = ebn["masken"]
    H, W = next(iter(masken.values())).shape
    R = bild_laden(render_p)
    if R.shape[:2] != (H, W):
        R = _resize(R, (W, H))
    K = bild_laden(veredelt_p)
    hart = np.zeros((H, W), bool)
    for k in ebn["meta"]["schutz_klassen"]:
        hart |= masken.get(k, False)
    al = ausrichten_ki(R, K, ausricht_maske(masken, hart), modell)
    fa = min(1.0, ANALYSE_MAX / W)
    g = (round(W * fa), round(H * fa))
    Sw = np.diag([g[0] / W, g[1] / H, 1.0])
    Kw, gueltig = warp(K, Sw @ al["H"], g)
    Rk = _resize(R, g)
    gr, gk = _grau(Rk), _grau(Kw)
    kr, kk = _canny(gr), _canny(gk)
    mk = {k: _resize(v, g) for k, v in masken.items()}
    zonen, befunde = {}, []
    for z, ks in ZONEN.items():
        m = np.zeros(g[::-1], bool)
        for k in ks:
            m |= mk.get(k, False)
        if m.sum() < 30:
            continue
        mz = ndi.binary_dilation(m, iterations=1) & gueltig
        kd = kanten_deckung(gr, gk, mz, tol=1)
        ka = kantenabstand(kr, kk, mz)
        e = {"anteil_prozent": round(100 * float(m.mean()), 2), **{f"kanten_{a}": b for a, b in kd.items()},
             "kantenabstand_mittel_px": ka["mittel_px"], "gradienten_korrelation": _grad_ncc(gr, gk, mz)}
        grenze = ZONE_GRENZE.get(z, 0.85)
        abw = kd["vollstaendig"] is not None and min(kd["vollstaendig"], kd["praezision"]) < grenze
        e["status"] = "abweichung" if abw else "ok"
        if abw:
            befunde.append(f"Schutzzone {z}: Kanten weichen ab (vollstaendig {kd['vollstaendig']}, praezise "
                           f"{kd['praezision']}); Bauteile veraendert oder versetzt?")
        zonen[z] = e
    fenster = fenster_je_fassade(Rk, Kw, mk, ebn, gueltig, g)
    for f, v in fenster.items():
        if v["ki_neu"] >= FENSTER_NEU or v["render_fehlt"] >= max(2, FENSTER_FEHLT * v["render"]):
            befunde.append(f"Fassade {f}: {v['render']} Fenster im Render, {v['ki']} im KI-Bild "
                           f"({v['ki_neu']} neu, {v['render_fehlt']} fehlen)")
    return {"ausrichtung": {"modell": al["modell"], "kantenabstand_mittel_px": al["kanten"]["mittel_px"],
                            "massstab": al["massstab"]},
            "zonen": zonen, "fenster_je_fassade": fenster, "befunde": befunde, "grenzen": ZONE_GRENZE,
            "status": "zur Pruefung" if befunde else "ok"}


def fenster_je_fassade(Rk, Kw, mk, ebn, gueltig, g) -> dict:
    """Fenster = Komponenten von Glas plus Rahmen im Render. Im KI-Bild: Pixel, die eher wie das Glas der KI als wie
    deren Wand aussehen (quadratische Diskriminanz in Lab, trainiert auf den Render-Masken im KI-Bild), als
    Komponenten im Fassadenbereich. Zuordnung zur Fassade ueber die Normalen der Ebenen."""
    glas = mk.get("fenster_glas", np.zeros(g[::-1], bool))
    rahmen = mk.get("fenster_rahmen", np.zeros(g[::-1], bool))
    wand = mk.get("gebaeude_objekt", np.zeros(g[::-1], bool))
    fenster = ndi.binary_closing(glas | rahmen, iterations=1)
    lab_f, n_f = ndi.label(fenster, structure=np.ones((3, 3)))
    if n_f == 0 or glas.sum() < 50 or wand.sum() < 200:
        return {}
    flaechen = ndi.sum(np.ones_like(lab_f), lab_f, index=np.arange(1, n_f + 1))
    gross = flaechen >= max(12, 0.15 * np.median(flaechen))
    # Fassade je Pixel aus den Normalen
    fass = ebn["meta"].get("fassaden") or {}
    nrm = _resize(ebn["normalen"], g, nearest=True) if "normalen" in ebn else None
    namen = list(fass)
    zuord = np.full(g[::-1], -1, np.int16)
    if nrm is not None and namen:
        nh = nrm[..., :2]
        nl = np.linalg.norm(nh, axis=-1) + 1e-6
        cos = np.stack([np.abs((nh @ np.array(fass[n]["normale"], np.float32))) / nl for n in namen], -1)
        zuord = np.where(cos.max(-1) > 0.85, cos.argmax(-1), -1)
    # Klassifikator im KI-Bild
    K_lab = rgb_zu_lab(Kw)
    tr_g = ndi.binary_erosion(glas, iterations=1) & gueltig
    tr_w = ndi.binary_erosion(wand, iterations=2) & gueltig & ~ndi.binary_dilation(fenster, iterations=3)
    if tr_g.sum() < 30 or tr_w.sum() < 100:
        return {}

    def llk(x, s):
        mu, C = s[0], s[1]
        Ci = np.linalg.inv(C)
        d = x - mu
        return -0.5 * np.einsum("...i,ij,...j->...", d, Ci, d) - 0.5 * math.log(np.linalg.det(C))
    stat = lambda m: (K_lab[m].mean(0), np.cov(K_lab[m].T) + np.eye(3) * 1.0)
    bereich = ndi.binary_dilation(wand | fenster, iterations=2) & gueltig
    # je Fassade eigener Klassifikator (Licht und Spiegelung unterscheiden sich je Seite), sonst gemeinsam
    st_alle = (stat(tr_g), stat(tr_w))
    ist_glas = (llk(K_lab, st_alle[0]) > llk(K_lab, st_alle[1])) & bereich
    st_fass = {}
    for j in range(len(namen)):
        fz = ndi.binary_dilation(zuord == j, iterations=4)
        if (tr_g & fz).sum() >= 30 and (tr_w & fz).sum() >= 100:
            st_fass[j] = (stat(tr_g & fz), stat(tr_w & fz))
            teil = (llk(K_lab, st_fass[j][0]) > llk(K_lab, st_fass[j][1]))
            ist_glas = np.where(fz & bereich, teil, ist_glas)
    out = {n: {"render": 0, "ki": 0, "ki_gefunden": 0, "ki_neu": 0, "render_fehlt": 0} for n in namen + ["sonstige"]}

    def name_von(sl, maske):
        z = zuord[sl][maske]
        z = z[z >= 0]
        return namen[int(np.bincount(z).argmax())] if z.size else "sonstige"
    # je Render-Fenster: im KI-Bild gefunden, wenn mindestens 40 % seines Glases wie Glas aussehen
    glasflaechen, kandidaten = [], []
    for i, sl in enumerate(ndi.find_objects(lab_f), start=1):
        if sl is None or not gross[i - 1]:
            continue
        m = lab_f[sl] == i
        if not gueltig[sl][m].all():
            continue
        gm = m & glas[sl]
        if gm.sum() >= 4:
            anteil = float(ist_glas[sl][gm].mean())
            glasflaechen.append(int(gm.sum()))
        else:
            anteil = float(ist_glas[sl][m].mean()) * 2
            gm = m
        n = name_von(sl, m)
        # schmale Fenster (wenige Pixel Glas): zusaetzlich den Mittelwert des Glases klassifizieren
        z = zuord[sl][m]
        j = int(np.bincount(z[z >= 0]).argmax()) if (z >= 0).any() else -1
        sg_, sw_ = st_fass.get(j, st_alle)
        mittel = K_lab[sl][gm].mean(0)
        gefunden = anteil >= 0.4 or llk(mittel, sg_) > llk(mittel, sw_)
        # Kontrast Fenster gegen Wandring (fuer schmale, schraeg gesehene Fenster), Schwelle spaeter relativ
        sl2 = tuple(slice(max(0, x.start - 4), x.stop + 4) for x in sl)
        m2 = np.zeros((sl2[0].stop - sl2[0].start, sl2[1].stop - sl2[1].start), bool)
        m2[sl[0].start - sl2[0].start:sl[0].stop - sl2[0].start, sl[1].start - sl2[1].start:sl[1].stop - sl2[1].start] = m
        m2 = m2[:K_lab[sl2].shape[0], :K_lab[sl2].shape[1]]
        ring = ndi.binary_dilation(m2, iterations=3) & ~ndi.binary_dilation(m2, iterations=1) & wand[sl2]
        kontrast = float(np.linalg.norm(K_lab[sl2][m2].mean(0) - K_lab[sl2][ring].mean(0))) if ring.sum() >= 4 else 0.0
        kandidaten.append((n, gefunden, kontrast))
    kontraste = [k for _, gf, k in kandidaten if gf]
    schwelle = 0.35 * float(np.median(kontraste)) if kontraste else 1e9
    for n, gefunden, kontrast in kandidaten:
        gefunden = gefunden or kontrast >= schwelle
        out[n]["render"] += 1
        out[n]["ki_gefunden" if gefunden else "render_fehlt"] += 1
    # neue Fenster: glasartige Flecken auf der Wand, weit weg von jedem Render-Fenster
    min_fl = max(8, 0.5 * float(np.median(glasflaechen))) if glasflaechen else 8
    max_fl = 4 * float(max(glasflaechen)) if glasflaechen else 1e9
    kandidat = ndi.binary_closing(ist_glas, iterations=2) & ~ndi.binary_dilation(fenster, iterations=3) & \
        ndi.binary_erosion(wand, iterations=1)
    lab_k, _ = ndi.label(kandidat, structure=np.ones((3, 3)))
    for i, sl in enumerate(ndi.find_objects(lab_k), start=1):
        if sl is None:
            continue
        m = lab_k[sl] == i
        fl = int(m.sum())
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if min_fl <= fl <= max_fl and 0.5 <= h / max(w, 1) <= 4.0 and fl >= 0.5 * h * w:
            out[name_von(sl, m)]["ki_neu"] += 1
    for v in out.values():
        v["ki"] = v["ki_gefunden"] + v["ki_neu"]
    return {k: v for k, v in out.items() if v["render"] or v["ki"]}


def _autos_klassen(ebenen, klassen, ohne, mit_autos: bool) -> list[str]:
    meta = json.loads((Path(ebenen) / "ebenen.json").read_text())
    k = [x for x in (klassen or meta["schutz_klassen"]) if x not in (ohne or []) and x != "autos"]
    return k + ["autos"] if mit_autos else k


def autos_vergleich(a_pfad, b_pfad, ziel, titel=("Autos: Blender-Modelle", "Autos: aus dem KI-Bild")) -> str:
    a, b = Image.open(a_pfad).convert("RGB"), Image.open(b_pfad).convert("RGB")
    bw = min(1400, a.width)
    a = a.resize((bw, round(a.height * bw / a.width)))
    b = b.resize((bw, round(b.height * bw / b.width)))
    o = Image.new("RGB", (2 * bw + 10, a.height + 40), (250, 250, 248))
    d = ImageDraw.Draw(o)
    f = _schrift(18)
    o.paste(a, (0, 40))
    o.paste(b, (bw + 10, 40))
    d.text((6, 10), titel[0], fill=(30, 30, 30), font=f)
    d.text((bw + 16, 10), titel[1], fill=(30, 30, 30), font=f)
    o.save(ziel, quality=88)
    return str(ziel)


def main_cli(render, ki, ebenen, aus=None, klassen=None, ohne=None, farbe=1.0, modell="homographie",
             vordergrund=True, autos="projekt") -> int:
    kl = [k for k in (klassen or "").split(",") if k] or None
    oh = [k for k in (ohne or "").split(",") if k]
    if autos == "projekt":
        kz = schutz_anwenden(render, ki, ebenen, aus, kl, oh, farbe, modell, vordergrund=vordergrund)
        print(json.dumps(kz, ensure_ascii=False, indent=1))
        f1 = kz["schutzbereich"]["kanten_nachher"]["f1"]
        return 0 if f1 is None or f1 >= 0.95 else 1
    basis = Path(aus) if aus else Path(ki).with_name(Path(ki).stem + "_schutz.jpg")
    varianten = {"modelle": True, "ki": False} if autos == "beide" else {autos: autos == "modelle"}
    ergebnisse, ok = {}, True
    for name, mit in varianten.items():
        ziel = basis.with_name(f"{basis.stem}_{name}{basis.suffix}") if autos == "beide" else basis
        kz = schutz_anwenden(render, ki, ebenen, ziel, _autos_klassen(ebenen, kl, oh, mit), [], farbe, modell,
                             vordergrund=vordergrund)
        f1 = kz["schutzbereich"]["kanten_nachher"]["f1"]
        ok &= f1 is None or f1 >= 0.95
        ergebnisse[name] = {"ergebnis": kz["ergebnis"], "pruefbild": kz.get("pruefbild"), "kanten_f1_nachher": f1,
                            "vordergrund_prozent": kz["vordergrund"]["anteil_prozent"]}
    if autos == "beide":
        ergebnisse["vergleich"] = autos_vergleich(ergebnisse["modelle"]["ergebnis"], ergebnisse["ki"]["ergebnis"],
                                                  basis.with_name(f"{basis.stem}_autos_vergleich.jpg"))
    print(json.dumps(ergebnisse, ensure_ascii=False, indent=1))
    return 0 if ok else 1
