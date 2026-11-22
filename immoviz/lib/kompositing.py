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

Variante `--modus toleranz` (Abschnitt "Schutz mit Toleranz" unten, README): nach einer elastischen Feinausrichtung
wird der Schutzbereich in Bauteile zerlegt; die KI bleibt je Bauteil, wenn sie geometrisch in der Toleranz liegt,
nur abweichende Bauteile kommen aus dem Render. Standard bleibt `voll` bis zur Freigabe (REGELN.md V8).

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
      "statistik_ausreisser": 20.0,   # dE ab dem ein Pixel nicht in die Farbstatistik zaehlt
      "platzhalter_rand": (1.0, 0.25, 0.08),   # Zone um Menschen-Platzhalter: Breite seitlich, oben, unten (Anteil)
      "platzhalter_min_px": 20}      # so viele Fleckpixel in der Zone: Person am Platzhalter, bleibt KI
ANALYSE_VG = 1920


def _platzhalter_zone(pm: np.ndarray, p: dict) -> np.ndarray:
    """Rechteck um jeden Menschen-Platzhalter, seitlich und oben erweitert (KI-Person steht dort, etwas versetzt)."""
    zone = np.zeros_like(pm)
    lab, _ = ndi.label(pm)
    sx, so, su = p["platzhalter_rand"]
    for sl in ndi.find_objects(lab):
        if sl is None:
            continue
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h < 6:
            continue
        y0, y1 = max(0, int(sl[0].start - so * h)), min(pm.shape[0], int(sl[0].stop + su * h) + 1)
        x0, x1 = max(0, int(sl[1].start - sx * w)), min(pm.shape[1], int(sl[1].stop + sx * w) + 1)
        zone[y0:y1, x0:x1] = True
    return zone


def _scheibe(r: int) -> np.ndarray:
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def _abweichung(B_lab, K_lab, gruppen, gueltig, hart):
    """dE zwischen KI und farbangeglichenem Render, leicht geglaettet (gleiche Groesse wie die Eingaben)."""
    T = farbabgleich(B_lab, K_lab, gruppen, gueltig, hart)
    return ndi.gaussian_filter(np.sqrt(((T - K_lab) ** 2).sum(-1)), 1.0)


def vordergrund_finden(B_lab, K_lab, masken: dict, hart: np.ndarray, gueltig: np.ndarray, schutz: list[str],
                       tiefe_m: np.ndarray | None, f_px: float | None, p: dict | None = None,
                       ausschluss: np.ndarray | None = None, platzhalter: np.ndarray | None = None):
    """Was die KI vor die geschuetzte Fassade stellt und am Boden steht (Personen, Radfahrer, Autos) bleibt KI.

    Auf der Analyseebene: dE zwischen KI und farbangeglichenem Render (Boden mit eigenem Abgleich), Kandidaten ueber
    der Schwelle (Glas mit hoeherer Schwelle, geschuetzte Autos nie), Oeffnen mit einer Scheibe (duenne Rahmen,
    Stangen, Kanten fallen weg). Ein Fleck zaehlt als Vordergrund, wenn er die geschuetzte Flaeche beruehrt, mit
    `boden_min_px` auf dem Boden steht, sein Fusspunkt laut Render-Tiefe mindestens `vor_fassade_m` vor der
    Fassadenbasis liegt, und nur bis `max_hoehe_m` ueber dem Fusspunkt (Hoehe aus Tiefe und Brennweite). Jeder Teil
    ueber der geschuetzten Flaeche bekommt seinen Fusspunkt aus den Pixeln direkt darunter. `ausschluss` (Blender-
    Baeume vor der Fassade) gehoert nicht zur Zone, dort entscheidet `laub_finden`.
    `platzhalter` (Maske der Menschen-Platzhalter vor dem Hintergrund-Durchgang): Flecken in der Zone um einen
    Platzhalter sind die Person, die die KI dort einsetzen soll (REGELN U10), und bleiben KI ohne Boden- und
    Tiefenpruefung (Fix 18.11.2026: bei Personen dicht an der Fassade blieben sonst nur die Beine stehen).
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
    pz = _platzhalter_zone(_resize(platzhalter, g, nearest=True), p) if platzhalter is not None else None
    for i, sl in enumerate(ndi.find_objects(lab), start=1):
        if sl is None:
            continue
        c = lab[sl] == i
        hc = c & hs[sl]
        am_platz = pz is not None and int((hc & pz[sl]).sum()) >= p["platzhalter_min_px"]
        if not hc.any() or (int((c & boden[sl]).sum()) < p["boden_min_px"] and not am_platz):
            continue
        # jeder Teil ueber der geschuetzten Flaeche bekommt seinen eigenen Fusspunkt (nur aus den Pixeln direkt
        # darunter): sonst verbindet der Gehsteig eine Person mit einem Fleck an der Fassade daneben
        sub, ns = ndi.label(hc)
        for j, ssl in enumerate(ndi.find_objects(sub), start=1):
            if ssl is None:
                continue
            if pz is not None and int(((sub == j) & pz[sl]).sum()) >= p["platzhalter_min_px"]:
                teil = ndi.binary_fill_holes(ndi.binary_closing(sub == j, iterations=2)) & pz[sl] & hs[sl]
                if teil.any():
                    F[sl] |= teil
                    ty, tx = np.nonzero(teil)
                    objekte.append({"box_analyse": [int(tx.min() + sl[1].start), int(ty.min() + sl[0].start),
                                                    int(tx.max() + sl[1].start) + 1, int(ty.max() + sl[0].start) + 1],
                                    "platzhalter": True,
                                    "anteil_prozent": round(100.0 * float(teil.sum()) / (w * h), 3)})
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
                    pruefbild: bool = True, vordergrund: bool = True, modus: str = "voll",
                    toleranz: dict | None = None) -> dict:
    """modus 'voll' (Standard): ganzer Schutzbereich aus dem Render. modus 'toleranz': nur Komponenten, deren KI
    ausserhalb der Toleranz liegt (TOL, `toleranz` ueberschreibt einzelne Werte), kommen aus dem Render."""
    if modus not in ("voll", "toleranz"):
        raise ValueError(f"modus {modus!r}: erlaubt voll, toleranz")
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
    platz = masken.get("menschen_platzhalter")       # vor dem Hintergrund-Durchgang merken (Zone fuer KI-Personen)
    # Hinter Platzhaltern und ungeschuetzten Autos: Fassade aus dem zweiten Durchgang (render --ebenen)
    R, masken, V, baum = hintergrund_einsetzen(R, masken, ebn["ordner"], schutz, ebn["meta"].get("autos", "platzhalter"))
    hart = np.zeros((H, W), bool)
    for k in schutz:
        hart |= masken.get(k, False)

    al = ausrichten_ki(R, K, ausricht_maske(masken, hart), modell)
    Kw, gueltig = warp(K, al["H"], (W, H))
    fein_info = None
    if modus == "toleranz":
        Kw, fein_info = fein_ausrichten(R, Kw, ndi.binary_dilation(hart, iterations=2), toleranz)
    B_lab, K_lab = rgb_zu_lab(R), rgb_zu_lab(Kw)
    gruppen = _gruppen(masken, schutz)
    F, objekte, D = np.zeros((H, W), bool), [], None
    if vordergrund:
        kam = ebn["meta"].get("kamera_intern") or {}
        F, objekte, D = vordergrund_finden(B_lab, K_lab, masken, hart, gueltig, schutz, ebn.get("tiefe_m"),
                                           kam.get("f_px"), ausschluss=baum, platzhalter=platz)
    # Farbstatistik ohne Ausreisser (KI-Laub, Personen vor der Fassade): sonst faerben sie die Fassade ein
    stat_ok = gueltig & ~F
    if D is not None:
        stat_ok &= ~_resize(D > VG["statistik_ausreisser"], (W, H), nearest=True)
    T_lab = farbabgleich(B_lab, K_lab, gruppen, stat_ok, hart, farbe)
    T = lab_zu_rgb(T_lab)
    L, laub_info = np.zeros((H, W), bool), {"pixel": 0}
    Z = None
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
    tol_daten = None
    if modus == "toleranz":
        a_reset, t_lab, t_status, t_komps, t_zus = toleranz_auswerten(R, Kw, T_lab, K_lab, masken, schutz_hart,
                                                                       gueltig, ebn, toleranz)
        alpha = np.minimum(alpha, a_reset)
        tol_daten = (t_lab, t_status, t_komps, t_zus)
        # Farbabgleich neu, feine Statistik jetzt an der Grenze zur behaltenen KI (sonst Helligkeitsstufen an
        # Kachelnaehten); im Laubbereich bleibt der eigene Abgleich
        zz = (a_reset >= 0.999) & schutz_hart
        if zz.any():
            T2 = farbabgleich(B_lab, K_lab, gruppen, stat_ok, zz, farbe)
            if Z is not None:
                T2[Z] = T_lab[Z]
            T_lab = T2
            T = lab_zu_rgb(T_lab)
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
    kz["modus"] = modus
    if fein_info is not None:
        kz["ausrichtung"]["fein"] = fein_info
    if aus is None:
        aus = ki_p.with_name(ki_p.stem + ("_toleranz.jpg" if modus == "toleranz" else "_schutz.jpg"))
    aus = Path(aus)
    bild_speichern(out, aus)
    kz["ergebnis"] = str(aus)
    if tol_daten is not None:
        t_lab, t_status, t_komps, t_zus = tol_daten
        kz["toleranz"] = t_zus
        pk = aus.with_name(aus.stem + "_komponenten.json")
        pk.write_text(json.dumps(t_komps, ensure_ascii=False))
        kz["toleranz"]["komponenten_json"] = str(pk)
        if pruefbild:
            kz["pruefbild_komponenten"] = str(_toleranz_pruefbild(
                R, Kw, out, t_lab, t_status, masken.get("fenster_glas", np.zeros((H, W), bool)), kz,
                aus.with_name(aus.stem + "_komponenten.jpg")))
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
              ("Render-Anteil rot, KI-Vordergrund gruen", ueber), ("Ergebnis", out)]
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
         "gebaeude": ["gebaeude_objekt"], "nachbarn": ["nachbarn"], "innenraum": ["innenraum"],
         "ausstattung": ["ausstattung"]}
# Runde 10 Noma: auch Nachbarhaeuser, Innenraum-Moebel und Ausstattung werden geprueft (am KI-Rohbild zeigt das, wo die
# KI abweicht; am Endbild nach `schutz` voll muessen alle Zonen bestehen, sonst Naht oder Fehlausrichtung)
# Fensterzahl: Befund ab FENSTER_NEU glasartigen Flecken auf der Wand oder wenn mehr als FENSTER_FEHLT der Render-Fenster
# im KI-Bild nicht zu finden sind (Zaehlung bei 1200 px Breite auf +-3 Fenster genau, bei 4k deutlich besser)
FENSTER_NEU, FENSTER_FEHLT = 2, 0.08
ZONE_GRENZE = {"fenster": 0.90, "leuchten": 0.85, "gelaender": 0.90, "gebaeude": 0.85,   # praezision/vollstaendig
               "nachbarn": 0.85, "innenraum": 0.85, "ausstattung": 0.80}


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


# ------------------------------------------------------------------ Schutz mit Toleranz (--modus toleranz)
# Statt den ganzen Schutzbereich aus dem Render zu nehmen, wird er in Bauteil-Komponenten zerlegt (je Fenster,
# Gelaenderfeld, Leuchte, Gesimsband, Dachflaeche, Fassadenfeld). Je Komponente wird die KI geometrisch gegen den
# Render geprueft (nach der globalen Ausrichtung): Kantenabstand, Kanten-F1, oertlicher Versatz (Lage), bei Fenstern
# zusaetzlich Lage und Flaeche des Glases, Sprossenteilung und Innenleben hinter Glas. Liegt die KI in der Toleranz,
# bleibt das KI-Pixel (Putz, Stuck, Licht); sonst wird nur diese Komponente aus dem Render (farbangeglichen) gesetzt,
# mit weicher Naht nach aussen in die behaltene KI. Pixelangaben gelten fuer 4k (3840 px Breite) und werden mit
# der Bildbreite skaliert.
TOL = {"kantenabstand_px": 1.5,     # mittlerer Abstand Render-Kante -> naechste KI-Kante (Kappe 6 px)
       "f1_min": 0.90,              # Kanten-F1 je Komponente (Naehe toleranz_px)
       "toleranz_px": 2.0,
       "versatz_px": 1.5,           # oertlicher Versatz KI gegen Render (Gradienten-NCC, Suche +-suche_px)
       "suche_px": 3,
       "ncc_min": 0.30,             # darunter kein verlaesslicher Versatz (strukturarme Flaeche)
       "versatz_gewinn": 0.05,
       "versatz_isotropie": 0.15,   # Strukturtensor kleiner/grosser Eigenwert; darunter (eine Kantenrichtung) kein Versatz      # Versatz zaehlt nur, wenn er die Korrelation gegenueber 0 so verbessert
       "min_kanten": 30,            # Render-Kantenpixel, ab denen Abstand und F1 zaehlen
       "flach_praezision": 0.80,    # Komponente ohne Render-Kanten: starke KI-Kanten muessen zu 80 % an Render-Kanten
                                    # liegen, sonst hat die KI dort etwas erfunden (Fenster, Erker, Ornament)
       "flach_kanten": 60,          # ab so vielen starken KI-Kanten zaehlt die Praezision einer flachen Komponente
       "kachel_px": 256,            # Flaechen (Fassade, Gesims, Dach, Gelaender, Leuchten) werden so gekachelt
       "fenster_max_kacheln": 4,    # groessere Fensterkomponenten (Glasfronten) ebenfalls kacheln
       "min_flaeche_px": 400,       # kleinere Segmente gehen in das Fassadenfeld ihrer Kachel
       "fenster_min_px": 150,
       "gesims_seitenverhaeltnis": 4.0, "gesims_max_hoehe_px": 90,
       "dach_winkel_grad": 50.0,    # Flaechennormale naeher als das an "oben" (Bodennormale): Dachflaeche
       "glas_schwerpunkt_px": 3.0, "glas_flaeche": (0.75, 1.33),   # Glas (gleiches Farbmodell in Render und KI)
       "sprossen_kontrast_dE": 10.0, "sprossen_lage_px": 2.5,
       "innen_dL": 22.0, "innen_anteil": 0.30,       # Glas: Anteil Pixel mit |L_KI - L_Render| ueber innen_dL
       "lampe_dL": 30.0, "lampe_anteil": 0.04,       # helle Flecken (Lampen, Kuechen) hinter Glas
       "reihe_anteil": 0.5, "reihe_min": 3,          # Fensterreihe: ab diesem Anteil zurueckgesetzter Fenster ganz
       "gueltig_min": 0.9,
       "naht_fein_px": 2.0, "naht_flaeche_px": 16.0,
       "fein_sigma_px": 6.0,        # elastische Feinausrichtung: Glaettung des optischen Flusses (4k-Pixel)
       "fein_max_px": 10.0,         # groessere Flussvektoren gelten als Fehlzuordnung
       "fein_arbeit": 0.5}          # Flussberechnung auf halber Aufloesung
TYP_FEIN = ("fenster", "glas", "gelaenderfeld", "leuchte", "moebel", "auto")
TYP_FARBE = {"behalten": (0.15, 0.8, 0.25), "zurueck": (0.9, 0.12, 0.1), "glas_zurueck": (1.0, 0.55, 0.0)}


def _kachel_ids(H, W, kp):
    nx = int(math.ceil(W / kp))
    return ((np.arange(H) // kp)[:, None] * nx + (np.arange(W) // kp)[None, :]).astype(np.int64), \
        nx * int(math.ceil(H / kp))


def oben_winkel(tiefe_m, kam, boden, schritt=4):
    """Winkel (Grad) zwischen Flaechennormale (aus der Render-Tiefe, Kamerasystem) und 'oben' (mittlere Normale des
    Bodens). Tiefe ist planar (Abstand zur Bildebene). Rueckgabe in voller Groesse oder None."""
    if tiefe_m is None or not kam or not kam.get("f_px"):
        return None
    H, W = tiefe_m.shape
    f = kam["f_px"]
    cx = W / 2 - kam.get("shift_x", 0.0) * max(W, H)
    cy = H / 2 + kam.get("shift_y", 0.0) * max(W, H)
    d = tiefe_m[::schritt, ::schritt]
    yy, xx = np.mgrid[0:H:schritt, 0:W:schritt].astype(np.float64)
    P = np.stack([(xx - cx) / f * d, (yy - cy) / f * d, d], -1)
    n = np.cross(np.gradient(P, axis=1), np.gradient(P, axis=0))
    n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-12
    b = boden[::schritt, ::schritt] & (d < 80)
    if b.sum() < 50:
        oben = np.array([0.0, -1.0, 0.0])
    else:
        nb = n[b]
        nb *= -np.sign(nb[:, 1:2] + 1e-12)                 # nach oben (Bild-y negativ)
        oben = np.median(nb, 0)
        oben /= np.linalg.norm(oben)
    w = np.degrees(np.arccos(np.clip(np.abs(n @ oben), 0, 1))).astype(np.float32)
    return _resize(w, (W, H), nearest=True)


def fein_ausrichten(R: np.ndarray, Kw: np.ndarray, maske: np.ndarray, p: dict | None = None):
    """Elastische Feinausrichtung nach der Homographie: die Bild-KI verzieht Fassaden oertlich um einige Pixel
    (gemessen an ecke golden_hour: 1,5 bis 6 px bei 4k nach der Homographie). Optischer Fluss (OpenCV DIS) zwischen
    Render und KI auf ausgeglichenen Graubildern, nur auf Kanten im Bauteilbereich gewichtet, stark geglaettet
    (normierte Faltung, fein_sigma_px), auf fein_max_px begrenzt und ausserhalb des Bauteilbereichs auf 0
    auslaufend. Die KI wird damit oertlich verschoben (keine neuen Inhalte, nur Lage). Rueckgabe: KI neu, Kennzahlen."""
    import cv2
    p = {**TOL, **(p or {})}
    H, W = maske.shape
    s = W / 3840.0

    def prep(x):
        return (NK._ausgleich(_grau(x), maske if maske.sum() > 100 else None) * 255).astype(np.uint8)
    a, b = prep(R), prep(Kw)
    f = float(p["fein_arbeit"])
    gross = (max(16, round(W * f)), max(16, round(H * f)))
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setFinestScale(0)
    dis.setPatchSize(12)
    dis.setPatchStride(3)
    dis.setVariationalRefinementIterations(10)
    fl = dis.calc(cv2.resize(a, gross, interpolation=cv2.INTER_AREA), cv2.resize(b, gross, interpolation=cv2.INTER_AREA),
                  None)
    fl = cv2.resize(fl, (W, H), interpolation=cv2.INTER_LINEAR) * (W / gross[0])
    af = a.astype(np.float32)
    gm = np.hypot(cv2.Sobel(af, cv2.CV_32F, 1, 0), cv2.Sobel(af, cv2.CV_32F, 0, 1))
    w = np.minimum(gm / (np.percentile(gm[maske], 90) + 1e-6), 1.0) * maske
    w[np.hypot(fl[..., 0], fl[..., 1]) > p["fein_max_px"] * s] = 0
    w = w.astype(np.float32)
    sig = max(1.0, p["fein_sigma_px"] * s)
    nw = cv2.GaussianBlur(w, (0, 0), sig)
    fs = np.stack([cv2.GaussianBlur(fl[..., c] * w, (0, 0), sig) for c in (0, 1)], -1) / np.maximum(nw, 1e-4)[..., None]
    fs *= np.clip(nw / 0.05, 0, 1)[..., None]
    fs = np.stack([cv2.GaussianBlur(fs[..., c], (0, 0), sig / 2) for c in (0, 1)], -1)
    xx, yy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    K2 = cv2.remap(Kw, xx + fs[..., 0], yy + fs[..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    v = np.hypot(fs[..., 0], fs[..., 1])[maske] / max(s, 1e-6)
    info = {"verfahren": "DIS-Fluss, kantengewichtet geglaettet", "sigma_px": p["fein_sigma_px"],
            "verschiebung_4k_px": {"median": round(float(np.median(v)), 2), "p90": round(float(np.percentile(v, 90)), 2),
                                   "max": round(float(v.max()), 2)} if v.size else None}
    return np.clip(K2, 0, 1).astype(np.float32), info


def komponenten_bilden(masken: dict, hart: np.ndarray, kanten_geo: np.ndarray | None, winkel, p: dict, s: float):
    """Schutzbereich in Bauteil-Komponenten zerlegen. Rueckgabe: Labelbild (0 = keine), Liste {typ, klasse}."""
    H, W = hart.shape
    leer = np.zeros((H, W), bool)
    kp = max(32, int(round(p["kachel_px"] * s)))
    kid, nk = _kachel_ids(H, W, kp)
    lab = np.zeros((H, W), np.int32)
    komps = [None]

    def setzen(maske, typ, klasse, kacheln=False):
        if kacheln:
            ks = kid[maske]
            u, inv = np.unique(ks, return_inverse=True)
            lab[maske] = len(komps) + inv
            komps.extend({"typ": typ, "klasse": klasse} for _ in u)
        else:
            lab[maske] = len(komps)
            komps.append({"typ": typ, "klasse": klasse})

    # 1. Fenster: Glas plus Rahmen, je Komponente (Glasfronten gekachelt)
    glas, rahmen = masken.get("fenster_glas", leer), masken.get("fenster_rahmen", leer)
    fen = ndi.binary_closing(glas | rahmen, iterations=1) & hart & (glas | rahmen | ~masken.get("gebaeude_objekt", leer))
    L, n = ndi.label(fen, structure=np.ones((3, 3)))
    fl = ndi.sum(np.ones_like(L), L, index=np.arange(1, n + 1)) if n else []
    for i, sl in enumerate(ndi.find_objects(L), start=1):
        if sl is None or fl[i - 1] < p["fenster_min_px"] * s * s:
            continue
        m = np.zeros((H, W), bool)
        m[sl] = L[sl] == i
        if not (glas[sl] & m[sl]).any():
            continue                                             # Tuerblaetter, Bleche ohne Glas: Flaeche
        gross = (sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start) > p["fenster_max_kacheln"] * kp * kp
        setzen(m, "fensterfront" if gross else "fenster", "fenster", kacheln=gross)
    belegt = lab > 0
    # 2. Gelaender, Leuchten, Strassenmoebel, Autos (wenn geschuetzt): Komponenten je Kachel
    for k, typ in (("gelaender", "gelaenderfeld"), ("leuchten", "leuchte"), ("strassenmoebel", "moebel"),
                   ("autos", "auto")):
        m = masken.get(k, leer) & hart & ~belegt
        if m.sum() < 20:
            continue
        L, n = ndi.label(m, structure=np.ones((3, 3)))
        key = L.astype(np.int64)[m] * nk + kid[m]
        u, inv = np.unique(key, return_inverse=True)
        lab[m] = len(komps) + inv
        komps.extend({"typ": typ, "klasse": k} for _ in u)
        belegt |= m
    # 3. Gebaeude: Segmente zwischen Tiefen-/Normalenspruengen, als Dachflaeche, Gesims oder Fassadenfeld, gekachelt
    g = hart & ~belegt
    if g.any():
        innen = g & ~(kanten_geo if kanten_geo is not None else leer)
        S, ns = ndi.label(innen)                                 # 4er-Nachbarschaft: Kanten trennen
        if ns:
            idx = ndi.distance_transform_edt(S == 0, return_distances=False, return_indices=True)
            S = np.where(g, S[idx[0], idx[1]], 0)
        flaeche = np.bincount(S[g], minlength=ns + 1)
        styp = np.zeros(ns + 1, np.int8)                         # 0 Feld (Kachel), 1 Fassadenfeld, 2 Gesims, 3 Dach
        w_mittel = None
        if winkel is not None and ns:
            w_mittel = np.bincount(S[g], weights=winkel[g], minlength=ns + 1) / np.maximum(flaeche, 1)
        for j, sl in enumerate(ndi.find_objects(S), start=1):
            if sl is None or flaeche[j] < p["min_flaeche_px"] * s * s:
                continue
            h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
            if w_mittel is not None and w_mittel[j] < p["dach_winkel_grad"]:
                styp[j] = 3
            elif w >= p["gesims_seitenverhaeltnis"] * h and h <= p["gesims_max_hoehe_px"] * s:
                styp[j] = 2
            else:
                styp[j] = 1
        Sg = S[g].astype(np.int64)
        t = styp[Sg]
        key = np.where(t == 0, 0, Sg) * nk + kid[g]
        u, inv = np.unique(key, return_inverse=True)
        lab[g] = len(komps) + inv
        namen = {0: "fassadenfeld", 1: "fassadenfeld", 2: "gesims", 3: "dachflaeche"}
        seg_u = u // nk
        komps.extend({"typ": namen[int(styp[sg])], "klasse": "gebaeude"} for sg in seg_u)
    return lab, komps


def _profil_stege(rahmen_m: np.ndarray, glas_m: np.ndarray, achse: int, min_anteil: float = 0.5):
    """Sprossen (achse 1: senkrechte Stege, Profil ueber Spalten; achse 0: waagrechte) innerhalb der Glasspanne:
    Liste der Stegmitten (Pixel) und Stegbreiten."""
    quer = glas_m.any(axis=achse)                       # Zeilen (bzw. Spalten) mit Glas
    if quer.sum() < 4:
        return []
    lauf = glas_m.any(axis=1 - achse)
    idx = np.nonzero(lauf)[0]
    if len(idx) < 4:
        return []
    a, b = idx.min(), idx.max()
    sub = rahmen_m[quer, :] if achse == 1 else rahmen_m[:, quer]
    prof = sub.mean(axis=0 if achse == 1 else 1)
    st = prof >= min_anteil
    st[:a + 1] = False
    st[b:] = False
    L, n = ndi.label(st)
    out = []
    for i in range(1, n + 1):
        z = np.nonzero(L == i)[0]
        out.append((float(z.mean()), int(len(z))))
    return out


def _fenster_pruefen(sl, m, glas, rahmen, K_lab, T_lab, p, s) -> dict:
    """Fenster gesondert: Lage und Flaeche des Glases im KI-Bild, Sprossenteilung, Innenleben hinter Glas.
    Pro Fenster ein Zwei-Klassen-Modell (Rahmen gegen Glas) aus den KI-Farben an den Render-Masken."""
    out = {}
    gR, rR = m & glas, m & rahmen
    Kl, Tl = K_lab[sl], T_lab[sl]
    # Innenleben (unabhaengig vom Kontrast): Helligkeit KI gegen farbangeglichenen Render auf dem Glas
    gi = ndi.binary_erosion(gR, iterations=1) if gR.sum() > 60 else gR
    if gi.sum() >= 20:
        dL = Kl[..., 0][gi] - Tl[..., 0][gi]
        abw = float((np.abs(dL) > p["innen_dL"]).mean())
        hell = np.zeros_like(gi)
        hell[gi] = dL > p["lampe_dL"]
        Lh, nh = ndi.label(hell)
        groesst = float(np.bincount(Lh[hell]).max() / gi.sum()) if nh else 0.0
        out.update(innen_abweichung=round(abw, 3), innen_hellfleck=round(groesst, 3),
                   innen_ok=bool(abw <= p["innen_anteil"] and groesst <= p["lampe_anteil"]))
    if gR.sum() < 30 * s * s or rR.sum() < 20:
        return out
    re = ndi.binary_erosion(rR, iterations=1)
    re = re if re.sum() >= 10 else rR
    muF, muG = Kl[re].mean(0), Kl[gi if gi.sum() >= 10 else gR].mean(0)
    kontrast = float(np.linalg.norm(muF - muG))
    out["kontrast_dE"] = round(kontrast, 1)
    if kontrast < p["sprossen_kontrast_dE"]:
        return out
    # Dasselbe Zwei-Klassen-Modell auf beide Bilder (Render farbangeglichen T und KI): Unterschiede kommen aus der
    # Geometrie, nicht aus dem Verfahren (die Render-Maske allein ist bei Kastenfenstern zu grob)
    zone = ndi.binary_dilation(m, iterations=max(2, int(round(3 * s))))
    glas_zone = ndi.binary_dilation(gR, iterations=max(2, int(round(4 * s))))

    def rahmen_klasse(X):
        return zone & (((X - muF) ** 2).sum(-1) <= ((X - muG) ** 2).sum(-1))
    tf, kf = rahmen_klasse(Tl), rahmen_klasse(Kl)
    tg, kg = glas_zone & zone & ~tf, glas_zone & zone & ~kf
    if tg.sum() >= 10 and kg.sum() >= 10:
        yt, xt = np.nonzero(tg)
        yk, xk = np.nonzero(kg)
        out["glas_versatz_px"] = round(float(math.hypot(yk.mean() - yt.mean(), xk.mean() - xt.mean())), 2)
        out["glas_flaeche"] = round(float(len(yk) / len(yt)), 3)
    # Sprossenteilung: durchgehende, schmale Stege (Vorhaenge und Spiegelungen sind breit) in beiden Bildern
    tol = p["sprossen_lage_px"] * s
    fehl = []
    for achse in (1, 0):
        spanne = int(gR.any(axis=achse).sum())
        grenze = max(6 * s, 0.15 * spanne)
        sr = [x for x in _profil_stege(tf, gR, achse, 0.7) if x[1] <= grenze]
        sk = [x for x in _profil_stege(kf, gR, achse, 0.7) if x[1] <= grenze]
        frei = list(sk)
        for c, _ in sr:
            j = min(range(len(frei)), key=lambda q: abs(frei[q][0] - c), default=None)
            if j is None or abs(frei[j][0] - c) > tol:
                fehl.append("fehlt")
            else:
                frei.pop(j)
        fehl += ["neu"] * len(frei)
        out["stege_render" if achse == 1 else "riegel_render"] = len(sr)
        out["stege_ki" if achse == 1 else "riegel_ki"] = len(sk)
    out["sprossen_ok"] = not fehl
    return out


def toleranz_auswerten(R, Kw, T_lab, K_lab, masken, hart, gueltig, ebn, p: dict | None = None):
    """Je Komponente des Schutzbereichs: KI in der Toleranz (behalten) oder zuruecksetzen.
    Rueckgabe: alpha_reset (0..1, 1 = Render), Labelbild, Komponentenliste mit Kennzahlen, Zusammenfassung."""
    import cv2
    p = {**TOL, **(p or {})}
    H, W = hart.shape
    s = W / 3840.0
    leer = np.zeros((H, W), bool)
    kam = ebn["meta"].get("kamera_intern") or {}
    winkel = oben_winkel(ebn.get("tiefe_m"), kam, masken.get("boden", leer))
    lab, komps = komponenten_bilden(masken, hart, ebn.get("kanten"), winkel, p, s)
    n = len(komps)
    # Kanten in voller Aufloesung (Helligkeit je Bild im Schutzbereich ausgeglichen)
    gR, gK = _grau(R), _grau(Kw)

    def stufen(g, sigma):
        e = (NK._ausgleich(g, hart if hart.sum() > 100 else None) * 255).astype(np.uint8)
        e = cv2.GaussianBlur(e, (0, 0), sigma * max(s, 0.5))
        return e, {k: cv2.Canny(e, lo, hi) > 0 for k, (lo, hi) in (("lo", (20, 50)), ("mid", (40, 100)),
                                                                     ("hi", (60, 150)))}
    # fein (Lage der Kanten): Abstand Render-Kante -> KI-Kante; grob (Bauteilkanten, Ornament und Putzkorn der
    # KI geglaettet): Kanten-F1, damit reicheres KI-Detail auf derselben Geometrie nicht als Abweichung zaehlt
    eR, KR = stufen(gR, 1.2)
    eK, KK = stufen(gK, 1.2)
    _, KRg = stufen(gR, 2.5)
    _, KKg = stufen(gK, 2.5)
    tol = p["toleranz_px"] * s
    dK = ndi.distance_transform_edt(~KK["mid"])
    dRg = ndi.distance_transform_edt(~KRg["lo"])
    dKg = ndi.distance_transform_edt(~KKg["lo"])
    ok_px = gueltig & (lab > 0)

    def zaehl(maske, gewicht=None):
        mm = maske & ok_px
        return np.bincount(lab[mm], weights=None if gewicht is None else gewicht[mm], minlength=n)
    nRh = zaehl(KR["hi"])
    dsum = zaehl(KR["hi"], np.minimum(dK, 6.0 * max(s, 0.5)))
    nRg = zaehl(KRg["hi"])
    nRg_t = zaehl(KRg["hi"] & (dKg <= tol))
    nKh = zaehl(KKg["hi"])
    nKh_t = zaehl(KKg["hi"] & (dRg <= tol))
    flaeche = np.bincount(lab.ravel(), minlength=n)
    fl_ok = zaehl(np.ones((H, W), bool))
    voll = nRg_t / np.maximum(nRg, 1)
    praez = nKh_t / np.maximum(nKh, 1)
    f1 = 2 * voll * praez / np.maximum(voll + praez, 1e-9)
    abstand = dsum / np.maximum(nRh, 1) / max(s, 1e-6)          # in 4k-Pixeln
    # oertlicher Versatz: normierte Kreuzkorrelation der Gradientenbetraege je Komponente ueber kleine Verschiebungen
    def gradbetrag(e):
        ef = e.astype(np.float32) / 255.0
        return np.hypot(cv2.Sobel(ef, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(ef, cv2.CV_32F, 0, 1, ksize=3))
    mR, mK = gradbetrag(eR).ravel(), gradbetrag(eK).ravel()
    # Blendenproblem: an einer einzelnen geraden Kante (Gesimslinie, Seil) ist der Versatz entlang der Kante
    # unbestimmt. Strukturtensor des Renders je Komponente; Versatz nur bei zweidimensionaler Struktur
    ef = eR.astype(np.float32) / 255.0
    gx, gy = cv2.Sobel(ef, cv2.CV_32F, 1, 0, ksize=3)[ok_px], cv2.Sobel(ef, cv2.CV_32F, 0, 1, ksize=3)[ok_px]
    lo_ = lab[ok_px]
    jxx, jyy, jxy = (np.bincount(lo_, v, minlength=n) for v in (gx * gx, gy * gy, gx * gy))
    spur = jxx + jyy
    diskr = np.sqrt(np.maximum((jxx - jyy) ** 2 + 4 * jxy ** 2, 0))
    isotropie = (spur - diskr) / np.maximum(spur + diskr, 1e-12)      # kleiner/grosser Eigenwert
    idx = np.flatnonzero(ok_px)
    li = lab.ravel()[idx]
    a = mR[idx]
    cnt = np.bincount(li, minlength=n).astype(np.float64)
    Sa = np.bincount(li, a, minlength=n)
    Saa = np.bincount(li, a * a, minlength=n)
    r = int(p["suche_px"])
    yy, xx = idx // W, idx % W
    ncc = np.full((2 * r + 1, 2 * r + 1, n), -1.0)
    for dy in range(-r, r + 1):
        y2 = np.clip(yy + dy, 0, H - 1)
        for dx in range(-r, r + 1):
            b = mK[y2 * W + np.clip(xx + dx, 0, W - 1)]
            Sb = np.bincount(li, b, minlength=n)
            Sbb = np.bincount(li, b * b, minlength=n)
            Sab = np.bincount(li, a * b, minlength=n)
            c = Sab - Sa * Sb / np.maximum(cnt, 1)
            v = (Saa - Sa ** 2 / np.maximum(cnt, 1)) * (Sbb - Sb ** 2 / np.maximum(cnt, 1))
            ncc[dy + r, dx + r] = c / np.sqrt(np.maximum(v, 1e-12))
    flach = ncc.reshape(-1, n)
    best = flach.argmax(0)
    ncc_max = flach.max(0)
    by, bx = best // (2 * r + 1), best % (2 * r + 1)

    def sub(c, cm, cp):                                  # Parabel-Feinlage
        d = cm - 2 * c + cp
        return np.where(np.abs(d) > 1e-9, 0.5 * (cm - cp) / np.where(np.abs(d) > 1e-9, d, 1), 0.0)
    ar = np.arange(n)
    c0 = ncc[by, bx, ar]
    oy = sub(c0, ncc[np.clip(by - 1, 0, 2 * r), bx, ar], ncc[np.clip(by + 1, 0, 2 * r), bx, ar])
    ox = sub(c0, ncc[by, np.clip(bx - 1, 0, 2 * r), ar], ncc[by, np.clip(bx + 1, 0, 2 * r), ar])
    vy = np.where((by > 0) & (by < 2 * r), by - r + oy, by - r)
    vx = np.where((bx > 0) & (bx < 2 * r), bx - r + ox, bx - r)
    versatz = np.hypot(vy, vx) / max(s, 1e-6)
    # flache Korrelationsflaeche (Putzkorn, Schattierung): Versatz nur, wenn er die Korrelation deutlich verbessert
    gewinn = ncc_max - ncc[r, r]
    versatz = np.where((gewinn >= p["versatz_gewinn"]) & (isotropie >= p["versatz_isotropie"]), versatz, 0.0)

    # Entscheidung je Komponente
    zurueck = np.zeros(n, bool)
    glas_zurueck = np.zeros(n, bool)
    infos = [None] * n
    gruende_alle = {}
    for i in range(1, n):
        k = komps[i]
        gr = []
        if fl_ok[i] < p["gueltig_min"] * flaeche[i]:
            gr.append("ohne_ki_deckung")
        if nRh[i] >= p["min_kanten"] * s and abstand[i] > p["kantenabstand_px"]:
            gr.append("kantenabstand")
        if nRg[i] >= p["min_kanten"] * s:
            if f1[i] < p["f1_min"]:
                gr.append("kanten_f1")
        elif nKh[i] >= p["flach_kanten"] * s and praez[i] < p["flach_praezision"]:
            gr.append("erfundene_kanten")
        if ncc_max[i] >= p["ncc_min"] and versatz[i] > p["versatz_px"]:
            gr.append("versatz")
        infos[i] = {"id": i, **k, "flaeche_px": int(flaeche[i]), "render_kanten": int(nRh[i]),
                    "kantenabstand_px": round(float(abstand[i]), 2) if nRh[i] else None,
                    "kanten_f1": round(float(f1[i]), 3) if nRg[i] else None,
                    "vollstaendig": round(float(voll[i]), 3) if nRg[i] else None,
                    "praezision": round(float(praez[i]), 3) if nKh[i] else None,
                    "versatz_px": round(float(versatz[i]), 2) if ncc_max[i] >= p["ncc_min"] else None,
                    "ncc": round(float(ncc_max[i]), 3), "ncc_gewinn": round(float(gewinn[i]), 3)}
        zurueck[i] = bool(gr)
        infos[i]["gruende"] = gr
    # Fenster gesondert
    glas, rahmen = masken.get("fenster_glas", leer), masken.get("fenster_rahmen", leer)
    objs = ndi.find_objects(lab)
    rand = max(3, int(round(6 * s)))
    fenster_ids = []
    for i in range(1, n):
        if komps[i]["typ"] != "fenster" or i - 1 >= len(objs) or objs[i - 1] is None:
            continue
        sl0 = objs[i - 1]
        sl = (slice(max(0, sl0[0].start - rand), min(H, sl0[0].stop + rand)),
              slice(max(0, sl0[1].start - rand), min(W, sl0[1].stop + rand)))
        m = lab[sl] == i
        f = _fenster_pruefen(sl, m, glas[sl], rahmen[sl], K_lab, T_lab, p, s)
        infos[i].update(f)
        gr = infos[i]["gruende"]
        if "glas_versatz_px" in f and f["glas_versatz_px"] > p["glas_schwerpunkt_px"] * s:
            gr.append("glas_lage")
        if "glas_flaeche" in f and not (p["glas_flaeche"][0] <= f["glas_flaeche"] <= p["glas_flaeche"][1]):
            gr.append("glas_flaeche")
        if f.get("sprossen_ok") is False:
            gr.append("sprossen")
        zurueck[i] = bool(gr)
        if not zurueck[i] and f.get("innen_ok") is False:
            glas_zurueck[i] = True
            infos[i]["glas_zurueck"] = "innenleben"
        ys, xs = np.nonzero(m)
        fenster_ids.append((i, float(ys.mean() + sl[0].start), float(xs.mean() + sl[1].start),
                            float(np.ptp(ys) + 1), float(np.ptp(xs) + 1)))
    # Fensterreihen: Nachbarn auf gleicher Hoehe (Mitte innerhalb 0,4 Fensterhoehen, Luecke bis 3 Fensterbreiten)
    reihen = []
    if fenster_ids:
        eltern = list(range(len(fenster_ids)))

        def wurzel(x):
            while eltern[x] != x:
                eltern[x] = eltern[eltern[x]]
                x = eltern[x]
            return x
        ordn = sorted(range(len(fenster_ids)), key=lambda q: fenster_ids[q][2])
        for ai, qa in enumerate(ordn):
            _, ya, xa, ha, wa = fenster_ids[qa]
            for qb in ordn[ai + 1:]:
                _, yb, xb, hb, wb = fenster_ids[qb]
                if xb - xa > 3.5 * max(wa, wb):
                    break
                if abs(yb - ya) < 0.4 * min(ha, hb) and 0.6 < hb / ha < 1.6:
                    eltern[wurzel(qb)] = wurzel(qa)
        gruppen = {}
        for q in range(len(fenster_ids)):
            gruppen.setdefault(wurzel(q), []).append(fenster_ids[q][0])
        for ids in gruppen.values():
            if len(ids) < p["reihe_min"]:
                continue
            anteil = float(np.mean([zurueck[i] for i in ids]))
            ganz = anteil >= p["reihe_anteil"]
            if ganz:
                for i in ids:
                    if not zurueck[i]:
                        zurueck[i] = True
                        infos[i]["gruende"].append("reihe")
            reihen.append({"fenster": len(ids), "zurueck_anteil": round(anteil, 2), "ganz_zurueck": ganz})
    # Masken und weiche Naht (nach aussen in die behaltene KI, nur im Schutzbereich)
    typ_fein = np.array([False] + [k["typ"] in TYP_FEIN for k in komps[1:]])
    Z = zurueck[lab] & (lab > 0)
    Zf = Z & typ_fein[lab]
    Zg = glas_zurueck[lab] & glas & (lab > 0)
    Za = Z & ~typ_fein[lab]

    def rampe(M, w):
        if not M.any():
            return np.zeros((H, W), np.float32)
        d = ndi.distance_transform_edt(~M)
        return np.clip(1.0 - d / max(w * s, 1.0), 0, 1).astype(np.float32)
    alpha = np.maximum(np.maximum(rampe(Zf | Zg, p["naht_fein_px"]), rampe(Za, p["naht_flaeche_px"])), 0)
    # Zusammenfassung je Typ
    je_typ = {}
    gesamt = float(max(1, (lab > 0).sum()))
    for i in range(1, n):
        t = komps[i]["typ"]
        e = je_typ.setdefault(t, {"anzahl": 0, "behalten": 0, "zurueck": 0, "nur_glas_zurueck": 0,
                                  "flaeche_prozent_schutz": 0.0, "flaeche_zurueck_prozent_schutz": 0.0,
                                  "gruende": {}})
        e["anzahl"] += 1
        e["zurueck" if zurueck[i] else "behalten"] += 1
        e["nur_glas_zurueck"] += int(glas_zurueck[i])
        e["flaeche_prozent_schutz"] += 100.0 * flaeche[i] / gesamt
        if zurueck[i]:
            e["flaeche_zurueck_prozent_schutz"] += 100.0 * flaeche[i] / gesamt
        for g_ in infos[i]["gruende"]:
            e["gruende"][g_] = e["gruende"].get(g_, 0) + 1
            gruende_alle[g_] = gruende_alle.get(g_, 0) + 1
    for e in je_typ.values():
        e["flaeche_prozent_schutz"] = round(e["flaeche_prozent_schutz"], 2)
        e["flaeche_zurueck_prozent_schutz"] = round(e["flaeche_zurueck_prozent_schutz"], 2)
    im_schutz = lab > 0
    ki_anteil = float(((1 - alpha)[im_schutz]).mean()) if im_schutz.any() else 0.0
    zus = {"parameter": p, "komponenten": n - 1, "je_typ": je_typ, "gruende": gruende_alle,
           "fensterreihen": {"anzahl": len(reihen), "ganz_zurueck": sum(r_["ganz_zurueck"] for r_ in reihen),
                             "liste": reihen[:60]},
           "ki_behalten_prozent_schutz": round(100 * ki_anteil, 2),
           "zurueck_prozent_schutz": round(100 * (1 - ki_anteil), 2),
           "hinweis": "Anteile auf die Flaeche des Schutzbereichs (ohne KI-Vordergrund und Laub) bezogen; "
                      "Pixelwerte in 4k-Pixeln (3840 px Breite)"}
    status = np.zeros(n, np.int8)                         # 1 behalten, 2 zurueck, 3 nur Glas zurueck
    status[1:] = np.where(zurueck[1:], 2, np.where(glas_zurueck[1:], 3, 1))
    return alpha, lab, status, [x for x in infos[1:]], zus


def _toleranz_pruefbild(R, Kw, out, lab, status, glas, kz, pfad: Path) -> Path:
    """Render | KI ausgerichtet | Komponenten (gruen KI behalten, rot zurueckgesetzt, orange nur Glas) | Ergebnis."""
    bw = min(1200, R.shape[1])
    bh = round(R.shape[0] * bw / R.shape[1])
    st = status[_resize(lab, (bw, bh), nearest=True)]
    gl = _resize(glas, (bw, bh), nearest=True)
    basis = _resize(out, (bw, bh))
    farbe = np.zeros((bh, bw, 3), np.float32)
    deck = np.zeros((bh, bw), np.float32)
    for code, name in ((1, "behalten"), (2, "zurueck")):
        farbe[st == code] = TYP_FARBE[name]
        deck[st == code] = 0.5
    m3 = (st == 3)
    farbe[m3] = TYP_FARBE["behalten"]
    deck[m3] = 0.5
    farbe[m3 & gl] = TYP_FARBE["glas_zurueck"]
    ueber = basis * (1 - deck[..., None]) + farbe * deck[..., None]
    lk = _resize(lab, (bw, bh), nearest=True)
    grenze = (np.diff(lk, axis=0, prepend=lk[:1]) != 0) | (np.diff(lk, axis=1, prepend=lk[:, :1]) != 0)
    ueber[grenze & (lk > 0)] *= 0.55
    tafeln = [("Render (Blender)", R), ("KI ausgerichtet", Kw),
              ("Komponenten: gruen KI behalten, rot Render, orange nur Glas Render", ueber), ("Ergebnis Toleranz", out)]
    kopf = 56
    o = Image.new("RGB", (2 * bw + 10, 2 * (bh + 24) + kopf), (250, 250, 248))
    d = ImageDraw.Draw(o)
    f = _schrift(16)
    for i, (t, x) in enumerate(tafeln):
        im = Image.fromarray(np.rint(np.clip(x if x.shape[1] == bw else _resize(x, (bw, bh)), 0, 1) * 255)
                             .astype(np.uint8))
        px, py = (i % 2) * (bw + 10), kopf + (i // 2) * (bh + 24)
        d.text((px + 4, py + 3), t, fill=(40, 40, 40), font=f)
        o.paste(im, (px, py + 22))
    t = kz["toleranz"]
    fen = t["je_typ"].get("fenster", {})
    d.text((8, 6), f"Schutz mit Toleranz: KI behalten {t['ki_behalten_prozent_schutz']} % des Schutzbereichs, "
                   f"{t['komponenten']} Komponenten  |  Fenster {fen.get('behalten', 0)} KI / {fen.get('zurueck', 0)} "
                   f"Render / {fen.get('nur_glas_zurueck', 0)} nur Glas  |  Kanten-F1 Schutzbereich nachher "
                   f"{kz['schutzbereich']['kanten_nachher']['f1']}", fill=(30, 30, 30), font=f)
    d.text((8, 30), "Gruende: " + ", ".join(f"{k} {v}" for k, v in sorted(t["gruende"].items(), key=lambda x: -x[1])),
           fill=(90, 90, 90), font=f)
    o.save(pfad, quality=90)
    return pfad


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


F1_GRENZE = {"voll": 0.95, "toleranz": 0.90}    # Exit 1 darunter (Toleranz: KI-Kanten bleiben, je Bauteil geprueft)


def main_cli(render, ki, ebenen, aus=None, klassen=None, ohne=None, farbe=1.0, modell="homographie",
             vordergrund=True, autos="projekt", modus="voll") -> int:
    from .ki_lokal import lizenz_ziel
    aus = lizenz_ziel(ki, aus)               # KI-Bild aus FLUX.1 dev: Ergebnis bleibt markiert, nie in higgsfield/ (V9)
    kl = [k for k in (klassen or "").split(",") if k] or None
    oh = [k for k in (ohne or "").split(",") if k]
    grenze = F1_GRENZE[modus]
    if autos == "projekt":
        kz = schutz_anwenden(render, ki, ebenen, aus, kl, oh, farbe, modell, vordergrund=vordergrund, modus=modus)
        print(json.dumps(kz, ensure_ascii=False, indent=1))
        f1 = kz["schutzbereich"]["kanten_nachher"]["f1"]
        return 0 if f1 is None or f1 >= grenze else 1
    basis = Path(aus) if aus else Path(ki).with_name(Path(ki).stem + "_schutz.jpg")
    varianten = {"modelle": True, "ki": False} if autos == "beide" else {autos: autos == "modelle"}
    ergebnisse, ok = {}, True
    for name, mit in varianten.items():
        ziel = basis.with_name(f"{basis.stem}_{name}{basis.suffix}") if autos == "beide" else basis
        kz = schutz_anwenden(render, ki, ebenen, ziel, _autos_klassen(ebenen, kl, oh, mit), [], farbe, modell,
                             vordergrund=vordergrund, modus=modus)
        f1 = kz["schutzbereich"]["kanten_nachher"]["f1"]
        ok &= f1 is None or f1 >= grenze
        ergebnisse[name] = {"ergebnis": kz["ergebnis"], "pruefbild": kz.get("pruefbild"), "kanten_f1_nachher": f1,
                            "vordergrund_prozent": kz["vordergrund"]["anteil_prozent"]}
    if autos == "beide":
        ergebnisse["vergleich"] = autos_vergleich(ergebnisse["modelle"]["ergebnis"], ergebnisse["ki"]["ergebnis"],
                                                  basis.with_name(f"{basis.stem}_autos_vergleich.jpg"))
    print(json.dumps(ergebnisse, ensure_ascii=False, indent=1))
    return 0 if ok else 1
