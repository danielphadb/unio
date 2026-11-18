"""Nachkontrolle nach der Veredelung: Struktur-Diff zwischen Blender-Vorschau und veredeltem Bild.

Zweck (REGELN.md, Phase Nachkontrolle): Bild-KI erfindet gern Tueren, Fenster, Glasfronten, Gelaender und
Glasdaecher, versetzt Grossmoebel an eine andere Wand oder aendert den Bildausschnitt. Diese Pruefung findet
solche Stellen automatisch und markiert sie fuer den Menschen. Sie ersetzt die Sichtpruefung nicht, sie lenkt sie.

Ablauf (nur numpy, scipy, Pillow; kein OpenCV noetig):
1. Beide Bilder auf gleiche Arbeitsbreite, Helligkeit per Histogrammausgleich angleichen.
2. Ausrichtung: Aehnlichkeitstransformation (Massstab + Verschiebung, keine Drehung, weil die Senkrechten in beiden
   Bildern gerade sind) per Phasenkorrelation der Kantenbilder ueber ein Massstabsraster, danach fein.
   Massstab und Verschiebung sind selbst ein Befund: weicht der Ausschnitt ab, wurde gezoomt oder die Kamera bewegt.
3. Gerade Kanten in 12 Richtungen (15 Grad), nur Strecken ab einer Mindestlaenge (Tueren, Fensterrahmen,
   Glasfronten, Geländerholme, Moebelkanten; Gras, Laub und Textur fallen heraus).
4. "Neu": gerade Strecken im veredelten Bild ohne Kante gleicher Richtung in der Vorschau (Toleranz 1,2 % der
   Bildbreite). "Fehlt": gerade Strecken der Vorschau ohne Gegenstueck im veredelten Bild (entfernte oder
   verschobene Oeffnung, versetzter Hochschrank). Am staerksten zaehlen lange Senkrechte (ab 15 % Bildhoehe) auf
   einer Flaeche, die in der Vorschau glatt ist (Wand, Fassade): dort entstehen Tueren, Fenster, Glasfronten.
   Dazu "Oeffnungskandidaten": Rechteck zwischen zwei langen Senkrechten mit deutlich anderer Helligkeit.
5. Score (Punkte) aus diesen Merkmalen plus Zoom/Verschiebung, Status "ok" oder "zur Pruefung" ab SCHWELLE,
   Markierungsbild (links Vorschau, rechts veredelt ausgerichtet). Mit mehreren Varianten: Rangfolge.

Grenzen: Moebel, die erst die Veredelung bringt (leere Vorschau), erzeugen ebenfalls neue Kanten. Deshalb
Grossmoebel als Platzhalter in Blender modellieren (wohnungen.yaml einbauten), dann ist ihre Lage pruefbar.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

ARBEITSBREITE = 768
WINKEL = 12                     # Richtungsklassen fuer gerade Kanten (je 15 Grad)
# Schwellen (kalibriert an Noma Runde 2/3, siehe REGELN.md): Score ab SCHWELLE "zur Pruefung"
SCHWELLE = 400.0
MASSSTAB_TOL = 0.04             # mehr als 4 % Zoom = Ausschnitt veraendert
SCHIEBUNG_TOL = 0.03            # mehr als 3 % der Bildbreite verschoben


# ------------------------------------------------------------------ Bild laden
def _laden(p: Path, breite: int) -> tuple[np.ndarray, np.ndarray]:
    im = Image.open(p).convert("RGB")
    h = max(1, round(im.height * breite / im.width))
    im = im.resize((breite, h), Image.LANCZOS)
    rgb = np.asarray(im, dtype=np.float32) / 255.0
    grau = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    return rgb, grau


def _ausgleich(g: np.ndarray, maske: np.ndarray | None = None) -> np.ndarray:
    """Histogrammausgleich (Rang), damit Lichtstimmung und Belichtung die Kanten nicht dominieren."""
    werte = g[maske] if maske is not None else g.ravel()
    q = np.quantile(werte, np.linspace(0, 1, 257))
    q = np.maximum.accumulate(q + np.arange(257) * 1e-7)
    return np.interp(g, q, np.linspace(0, 1, 257)).astype(np.float32)


def _gradient(g: np.ndarray, sigma: float = 1.2):
    s = ndi.gaussian_filter(g, sigma)
    gx = ndi.sobel(s, axis=1) / 8.0
    gy = ndi.sobel(s, axis=0) / 8.0
    return gx, gy, np.hypot(gx, gy)


def _strukturbild(g: np.ndarray) -> np.ndarray:
    _, _, m = _gradient(g, 1.5)
    m = np.sqrt(m)
    m = ndi.gaussian_filter(m, 1.0)
    return (m - m.mean()) / (m.std() + 1e-6)


# ------------------------------------------------------------------ Ausrichtung
def _skaliert(img: np.ndarray, s: float, form: tuple[int, int], t=(0.0, 0.0), ordnung: int = 1, cval=0.0):
    """Bild img (Mitte cB) so abbilden, dass p_A = s * (p_B - cB) + cA + t. Ausgabe in Form `form`."""
    cA = np.array([(form[0] - 1) / 2, (form[1] - 1) / 2])
    cB = np.array([(img.shape[0] - 1) / 2, (img.shape[1] - 1) / 2])
    off = cB - (cA + np.array(t)) / s
    return ndi.affine_transform(img, [1 / s, 1 / s], offset=off, output_shape=form, order=ordnung, cval=cval)


def _phasenkorrelation(a: np.ndarray, b: np.ndarray, fenster: np.ndarray, max_schieb: tuple[int, int]):
    Fa = np.fft.rfft2(a * fenster)
    Fb = np.fft.rfft2(b * fenster)
    R = Fa * np.conj(Fb)
    R /= np.abs(R) + 1e-9
    r = np.fft.irfft2(R, s=a.shape)
    r = np.fft.fftshift(r)
    cy, cx = a.shape[0] // 2, a.shape[1] // 2
    my, mx = max_schieb
    sub = r[cy - my:cy + my + 1, cx - mx:cx + mx + 1]
    iy, ix = np.unravel_index(np.argmax(sub), sub.shape)
    return float(sub[iy, ix]), (float(iy - my), float(ix - mx))


def _merkmale(g: np.ndarray) -> list[np.ndarray]:
    """Merkmale fuer die Ausrichtung: weiche Helligkeit (grosse Flaechen, Fenster) und Kantendichte."""
    e = _ausgleich(g)
    hell = ndi.gaussian_filter(e, 1.5)
    _, _, m = _gradient(e, 1.0)
    kant = ndi.gaussian_filter(np.sqrt(m), 1.5)
    return [hell, kant]


def _ncc_karte(A: np.ndarray, B: np.ndarray, M: np.ndarray, max_schieb: tuple[int, int], min_anteil: float = 0.5):
    """Maskierte normierte Kreuzkorrelation per FFT: NCC(d) ueber die Ueberlappung von A und B um d verschoben.
    A gilt ueberall, B nur wo M = 1. Liefert Karte fuer Verschiebungen -max..+max (dy, dx)."""
    h, w = A.shape
    H2, W2 = 2 * h, 2 * w
    F = lambda x: np.fft.rfft2(x, s=(H2, W2))
    I = lambda X: np.fft.irfft2(X, s=(H2, W2))
    one = np.ones_like(A)
    FA, FA2, F1 = F(A), F(A * A), F(one)
    FBM, FB2M, FM = F(B * M), F(B * B * M), F(M)
    corr = lambda Fx, Fy: I(Fx * np.conj(Fy))           # sum_p x(p) y(p - d)
    sAB, sA, sA2 = corr(FA, FBM), corr(FA, FM), corr(FA2, FM)
    sB, sB2, n = corr(F1, FBM), corr(F1, FB2M), corr(F1, FM)
    my, mx = max_schieb
    idx_y = np.r_[0:my + 1, H2 - my:H2]
    idx_x = np.r_[0:mx + 1, W2 - mx:W2]
    sub = lambda X: np.fft.fftshift(X[np.ix_(idx_y, idx_x)])
    sAB, sA, sA2, sB, sB2, n = map(sub, (sAB, sA, sA2, sB, sB2, n))
    n = np.maximum(n, 1.0)
    num = sAB - sA * sB / n
    den = np.sqrt(np.maximum(sA2 - sA * sA / n, 1e-9) * np.maximum(sB2 - sB * sB / n, 1e-9))
    r = num / den
    r[n < min_anteil * A.size] = -1.0
    return r                                            # Mitte = Verschiebung 0


def ausrichten(gA: np.ndarray, gB: np.ndarray) -> dict:
    """Massstab s und Verschiebung t (dy, dx in Pixeln der Arbeitsgroesse), die B auf A legen.
    Grob (Breite 160) ueber Massstab 0,78 bis 1,30 und +-20 %, fein (Breite 320) um das Optimum. Leichte Bevorzugung
    der Identitaet, weil die Veredelung die Kamera meist haelt."""
    H, W = gA.shape
    best = None
    for stufe, (bw, skalen, rel_schieb) in enumerate(((160, np.exp(np.linspace(math.log(0.78), math.log(1.30), 31)), 0.20),
                                                      (320, None, 0.03))):
        f = bw / W
        a_kl = ndi.zoom(gA, f, order=1)
        b_kl = ndi.zoom(gB, f * gA.shape[1] / gB.shape[1], order=1)
        FA = [(x - x.mean()) / (x.std() + 1e-6) for x in _merkmale(a_kl)]
        FB = _merkmale(b_kl)
        form = a_kl.shape
        ms = (max(2, int(form[0] * rel_schieb)), max(2, int(form[1] * rel_schieb)))
        if skalen is None:
            s0, t0 = best[1], best[2]
            skalen = s0 * np.linspace(0.97, 1.03, 13)
            vor = (t0[0] * f, t0[1] * f)
        else:
            vor = (0.0, 0.0)
        for s in skalen:
            M = _skaliert(np.ones_like(FB[0]), s, form, vor, ordnung=0) > 0.5
            karten = []
            for xa, xb in zip(FA, FB):
                Bs = _skaliert(xb, s, form, vor)
                karten.append(_ncc_karte(xa, Bs, M.astype(np.float64), ms))
            k = np.mean(karten, axis=0)
            dy = np.arange(-ms[0], ms[0] + 1)[:, None] / form[1]
            dx = np.arange(-ms[1], ms[1] + 1)[None, :] / form[1]
            ges = k - 0.5 * abs(math.log(s)) - 0.4 * np.hypot(dy + vor[0] / form[1], dx + vor[1] / form[1])
            iy, ix = np.unravel_index(np.argmax(ges), ges.shape)
            t = ((iy - ms[0]) / f + vor[0] / f, (ix - ms[1]) / f + vor[1] / f)
            if best is None or ges[iy, ix] > best[0] or (stufe == 1 and best[3] == 0):
                best = (float(ges[iy, ix]), float(s), t, stufe, float(k[iy, ix]))
    return {"massstab": best[1], "schiebung_px": best[2], "deckung": best[4]}


# ------------------------------------------------------------------ gerade Kanten
def _linienkern(laenge: int, winkel_grad: float) -> np.ndarray:
    """Binaerer Linienkern (1 px breit) in Richtung winkel_grad (0 = waagrecht, 90 = senkrecht im Bild)."""
    r = laenge // 2
    k = np.zeros((2 * r + 1, 2 * r + 1), dtype=bool)
    a = math.radians(winkel_grad)
    for i in np.linspace(-r, r, 4 * r + 1):
        x = int(round(r + i * math.cos(a)))
        y = int(round(r - i * math.sin(a)))
        k[y, x] = True
    return k


def _kanten(g: np.ndarray, schwelle: float):
    """Kantenpixel und Richtungsklasse der Kante (Linienrichtung, 0 bis WINKEL-1)."""
    gx, gy, m = _gradient(g, 1.2)
    # duenne Kanten: nur lokale Maxima quer zur Kante (einfache Non-Maximum-Unterdrueckung in 4 Richtungen)
    ang = (np.degrees(np.arctan2(gy, gx)) + 180.0) % 180.0          # Gradientenrichtung
    q = ((ang + 22.5) // 45).astype(int) % 4
    nb = {0: ((0, 1), (0, -1)), 1: ((1, 1), (-1, -1)), 2: ((1, 0), (-1, 0)), 3: ((1, -1), (-1, 1))}
    nms = np.zeros_like(m, dtype=bool)
    for k, ((dy1, dx1), (dy2, dx2)) in nb.items():
        a1 = np.roll(np.roll(m, dy1, 0), dx1, 1)
        a2 = np.roll(np.roll(m, dy2, 0), dx2, 1)
        nms |= (q == k) & (m >= a1) & (m >= a2)
    kante = nms & (m > schwelle)
    linie = (ang + 90.0) % 180.0                                    # Richtung der Linie im Bild (Bildkoordinaten)
    # Bildkoordinaten: y nach unten. Winkel fuer den Linienkern: 0 waagrecht, 90 senkrecht.
    linie = (180.0 - linie) % 180.0
    klasse = np.round(linie / (180.0 / WINKEL)).astype(int) % WINKEL
    return kante, klasse, m


def gerade_strecken(kante: np.ndarray, klasse: np.ndarray, laenge: int) -> np.ndarray:
    """Pixel, die zu geraden Strecken ab `laenge` gehoeren, je Richtungsklasse (Stapel WINKEL x H x W)."""
    out = np.zeros((WINKEL, *kante.shape), dtype=bool)
    for k in range(WINKEL):
        mk = kante & ((klasse == k) | (klasse == (k + 1) % WINKEL) | (klasse == (k - 1) % WINKEL))
        if not mk.any():
            continue
        mk = ndi.binary_dilation(mk, iterations=1)
        lk = _linienkern(laenge, k * 180.0 / WINKEL)
        dicht = ndi.convolve(mk.astype(np.float32), lk.astype(np.float32) / lk.sum(), mode="constant")
        kern = dicht > 0.9
        if kern.any():
            out[k] = ndi.binary_dilation(kern, structure=lk) & mk & ndi.binary_dilation(kante, iterations=1)
    return out


SENK = (5, 6, 7)                # Richtungsklassen 75 bis 105 Grad


def _senk_laeufe(maske: np.ndarray, kl: np.ndarray, min_h: float):
    """Senkrechte Laeufe (zusammenhaengend, leicht verbreitert) ab min_h Pixel Hoehe: Liste (y0, y1, x, pixel)."""
    sm = maske & np.isin(kl, SENK)
    lab, _ = ndi.label(ndi.binary_dilation(sm, structure=np.ones((5, 3), bool)))
    out = []
    for i, sl in enumerate(ndi.find_objects(lab), start=1):
        if sl is None:
            continue
        h = sl[0].stop - sl[0].start
        if h >= min_h:
            teil = sm[sl] & (lab[sl] == i)
            xs = np.nonzero(teil)[1]
            out.append((sl[0].start, sl[0].stop, sl[1].start + float(np.median(xs)) if xs.size else sl[1].start,
                        int(teil.sum()), sl))
    return out


def _merkmale_struktur(neu, fehlt, klA, klB, sB, glatt, eA, eB, gueltig):
    """Globale Merkmale fuer die Bewertung, in Prozent der Bildhoehe (Linienlaenge) bzw. Anzahl.
    oeffnungen: neue Rechtecke zwischen zwei langen Senkrechten mit deutlich anderer Helligkeit als die Vorschau
    an derselben Stelle (Tuer, Fenster, Glasfront auf vorher geschlossener Wand)."""
    H, W = neu.shape
    p = lambda n: round(100.0 * n / H, 1)
    lauf_neu = _senk_laeufe(neu, klB, 0.15 * H)
    lauf_fehlt = _senk_laeufe(fehlt, klA, 0.15 * H)
    v_neu = sum(l[3] for l in lauf_neu)
    v_neu_glatt = 0
    for y0, y1, x, n, sl in lauf_neu:
        v_neu_glatt += int((neu[sl] & glatt[sl] & np.isin(klB[sl], SENK)).sum())
    rest = neu & ~np.isin(klB, SENK)
    merk = {"senkrechte_neu": p(v_neu), "senkrechte_neu_glatt": p(v_neu_glatt),
            "senkrechte_fehlt": p(sum(l[3] for l in lauf_fehlt)),
            "andere_neu": p(int(rest.sum())), "andere_neu_glatt": p(int((rest & glatt).sum()))}
    # Oeffnungskandidaten: lange Senkrechte im veredelten Bild (neu oder vorhanden), mindestens eine davon neu
    alle_B = np.zeros_like(neu)
    for k in SENK:
        alle_B |= sB[k]
    lauf_B = _senk_laeufe(alle_B, klB, 0.15 * H)
    neu_x = [(l[0], l[1], l[2]) for l in lauf_neu]
    oeff = []
    for i, (a0, a1, ax, _, _) in enumerate(lauf_B):
        for b0, b1, bx, _, _ in lauf_B[i + 1:]:
            x0, x1 = sorted((ax, bx))
            if not (0.02 * W <= x1 - x0 <= 0.30 * W):
                continue
            y0, y1 = max(a0, b0), min(a1, b1)
            if y1 - y0 < 0.6 * min(a1 - a0, b1 - b0):
                continue
            ist_neu = any(abs(nx - x0) < 3 or abs(nx - x1) < 3 for n0, n1, nx in neu_x)
            if not ist_neu:
                continue
            xa, xb, ya, yb = int(x0 + 2), int(x1 - 2), int(y0), int(y1)
            if xb <= xa or yb <= ya or not gueltig[ya:yb, xa:xb].all():
                continue
            d = float(np.mean(eB[ya:yb, xa:xb]) - np.mean(eA[ya:yb, xa:xb]))
            glatt_vorher = float(glatt[ya:yb, xa:xb].mean())
            if abs(d) >= 0.18 and glatt_vorher >= 0.6:
                oeff.append({"box": [round(x0 / W, 3), round(y0 / H, 3), round(x1 / W, 3), round(y1 / H, 3)],
                             "helligkeit": round(d, 2), "flaeche": round((x1 - x0) * (y1 - y0) / (W * H), 4)})
    # ueberlappende Kandidaten zusammenfassen (groesste behalten)
    oeff.sort(key=lambda o: -o["flaeche"])
    behalten = []
    for o in oeff:
        bx0, by0, bx1, by1 = o["box"]
        if all(bx1 <= q["box"][0] or bx0 >= q["box"][2] or by1 <= q["box"][1] or by0 >= q["box"][3] for q in behalten):
            behalten.append(o)
    merk["oeffnungen"] = len(behalten)
    merk["oeffnungen_flaeche_prozent"] = round(100 * sum(o["flaeche"] for o in behalten), 1)
    return merk, behalten[:10]


# ------------------------------------------------------------------ Hauptfunktion
def pruefen(vorschau: Path, veredelt: Path, aus: Path | None = None, schwelle: float = SCHWELLE,
            breite: int = ARBEITSBREITE, ebenen: Path | None = None) -> dict:
    """ebenen: Ordner der Render-Ebenen derselben Kamera (render --ebenen). Dann zusaetzlich Schutzzonen (Fenster,
    Leuchten, Gelaender, Gebaeude) getrennt und Fensterzahl je Fassade (lib/kompositing.zonen_pruefen)."""
    vorschau, veredelt = Path(vorschau), Path(veredelt)
    rgbA, gA = _laden(vorschau, breite)
    rgbB, gB = _laden(veredelt, breite)
    form = gA.shape
    H, W = form

    al = ausrichten(_ausgleich(gA), _ausgleich(gB))
    s, t = al["massstab"], al["schiebung_px"]
    gBw = _skaliert(gB, s, form, t, cval=np.nan)
    gueltig = ~np.isnan(gBw)
    gueltig = ndi.binary_erosion(gueltig, iterations=4)
    gBw = np.where(np.isnan(gBw), 0.0, gBw)
    rgbBw = np.stack([_skaliert(rgbB[..., c], s, form, t) for c in range(3)], -1)

    eA, eB = _ausgleich(gA, gueltig), _ausgleich(gBw, gueltig)
    kA, klA, mA = _kanten(eA, 0.035)
    kB, klB, mB = _kanten(eB, 0.035)
    kA &= gueltig
    kB &= gueltig

    L = max(18, int(round(0.055 * min(H, W))))
    sA = gerade_strecken(kA, klA, L)
    sB = gerade_strecken(kB, klB, L)

    tol = max(4, int(round(0.012 * W)))
    struktur = ndi.generate_binary_structure(2, 1)
    neu = np.zeros(form, dtype=bool)
    fehlt = np.zeros(form, dtype=bool)
    for k in range(WINKEL):
        nachbarn = [k, (k + 1) % WINKEL, (k - 1) % WINKEL]
        if sB[k].any():
            refA = kA & np.isin(klA, nachbarn)
            neu |= sB[k] & ~ndi.binary_dilation(refA, structure=struktur, iterations=tol)
        if sA[k].any():
            refB = kB & np.isin(klB, nachbarn)
            fehlt |= sA[k] & ~ndi.binary_dilation(refB, structure=struktur, iterations=tol)

    # glatte Flaeche in der Vorschau (Wand, Fassade, Himmel): wenig Kanten im Umkreis
    dichteA = ndi.uniform_filter(kA.astype(np.float32), size=int(0.04 * W) | 1)
    glatt = dichteA < 0.02

    def stellen(maske: np.ndarray, kl: np.ndarray, art: str) -> list[dict]:
        """Zusammenhaengende Stellen. Gewichtet nach dem, was die Fehler der Veredelung ausmacht:
        lange Senkrechte (ab 10 % Bildhoehe: Tuer, Fenster, Glasfront, Hochschrank) voll, auf glatter Flaeche der
        Vorschau doppelt; uebrige gerade Kanten (Sockelleiste, Bilderrahmen, Bodenkanten) nur mit 0,25."""
        senk_maske = maske & np.isin(kl, (5, 6, 7))
        lab_s, _ = ndi.label(ndi.binary_dilation(senk_maske, structure=np.ones((5, 3), bool)))
        senk_lang = np.zeros_like(maske)
        for i, sl in enumerate(ndi.find_objects(lab_s), start=1):
            if sl is not None and (sl[0].stop - sl[0].start) >= 0.10 * H:
                senk_lang[sl] |= senk_maske[sl] & (lab_s[sl] == i)
        lab, n = ndi.label(ndi.binary_dilation(maske, iterations=max(3, tol // 2)))
        out = []
        for i, sl in enumerate(ndi.find_objects(lab), start=1):
            if sl is None:
                continue
            teil = maske[sl] & (lab[sl] == i)
            px = int(teil.sum())
            if px < 0.8 * L:
                continue
            lang = teil & senk_lang[sl]
            pl = float(lang.sum())
            gl = float((lang & glatt[sl]).sum())
            rest = teil & ~lang
            rg = float((rest & glatt[sl]).sum())
            # Linienlaenge in Prozent der Bildhoehe, gewichtet: lange Senkrechte 1 (auf glatter Flaeche 3),
            # uebrige gerade Kanten 0,15 (auf glatter Flaeche 0,5)
            gewicht = pl + 2.0 * gl + 0.15 * (float(rest.sum()) - rg) + 0.5 * rg
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            out.append({"art": art, "box": [round(x0 / W, 3), round(y0 / H, 3), round(x1 / W, 3), round(y1 / H, 3)],
                        "pixel": px, "lange_senkrechte_px": int(pl), "auf_glatter_flaeche": round(gl / max(pl, 1), 2),
                        "score": round(100.0 * gewicht / H, 1)})
        out = [d for d in out if d["score"] >= 5.0]
        out.sort(key=lambda d: -d["score"])
        return out

    st_neu, st_fehlt = stellen(neu, klB, "neu"), stellen(fehlt, klA, "fehlt")
    merk, oeff = _merkmale_struktur(neu, fehlt, klA, klB, sB, glatt, eA, eB, gueltig)
    zoom = abs(math.log(s))
    schieb = math.hypot(*t) / W
    m = merk
    # Gesamtscore (Punkte): lange neue Senkrechte auf vorher glatter Flaeche zaehlen voll, sonstige lange neue
    # Senkrechte halb, fehlende Senkrechte der Vorschau 0,7, sonstige neue gerade Kanten auf glatter Flaeche 0,1,
    # neue Rechtecke mit anderer Helligkeit 60 je Prozent Bildflaeche, dazu Zoom und Verschiebung ueber der Toleranz.
    score_struktur = (m["senkrechte_neu_glatt"] + 0.5 * (m["senkrechte_neu"] - m["senkrechte_neu_glatt"])
                      + 0.7 * m["senkrechte_fehlt"] + 0.1 * m["andere_neu_glatt"] + 60.0 * m["oeffnungen_flaeche_prozent"])
    score_ausschnitt = 4000.0 * max(0.0, zoom - 0.02) + 4000.0 * max(0.0, schieb - 0.015)
    score = round(score_struktur + score_ausschnitt)
    befunde = []
    if zoom > MASSSTAB_TOL:
        befunde.append(f"Ausschnitt veraendert: Massstab {s:.3f} (Zoom oder andere Brennweite)")
    if schieb > SCHIEBUNG_TOL:
        befunde.append(f"Kamera verschoben: {100 * schieb:.1f} % der Bildbreite")
    if oeff:
        befunde.append(f"{len(oeff)} neue(s) Rechteck(e) mit anderer Helligkeit auf vorher glatter Flaeche "
                       "(Tuer, Fenster, Glasfront, Grossmoebel?)")
    if m["senkrechte_neu_glatt"] >= 150:
        befunde.append("lange neue Senkrechte auf vorher glatter Wand/Fassade (Oeffnung, Hochschrank, Kueche?)")
    if m["senkrechte_fehlt"] >= 150:
        befunde.append("lange Senkrechte der Vorschau fehlen (Oeffnung entfernt oder versetzt, Bauteil verschoben?)")
    if st_neu and not befunde:
        befunde.append(f"{len(st_neu)} Stelle(n) mit neuen geraden Kanten (Gelaender, Moebel, Deko?)")
    status = "zur Pruefung" if (score >= schwelle or zoom > MASSSTAB_TOL or schieb > SCHIEBUNG_TOL) else "ok"
    kontrast = float(np.percentile(gA, 95) - np.percentile(gA, 5))
    if kontrast < 0.12:                          # Vorschau fast ohne Kontrast (zu dunkel, leere Wand): nicht pruefbar
        status = "nicht pruefbar"
        befunde.insert(0, f"Vorschau ohne Kontrast ({kontrast:.2f}): zu dunkel oder leer, Vergleich nicht belastbar; "
                          "Vorschau heller rendern oder Sichtpruefung")
    zonen = None
    if ebenen is not None:
        from . import kompositing as KO
        zonen = KO.zonen_pruefen(vorschau, veredelt, ebenen)
        befunde += zonen["befunde"]
        if zonen["status"] != "ok" and status == "ok":
            status = "zur Pruefung"
    res = {"vorschau": str(vorschau), "veredelt": str(veredelt), "status": status, "score": score,
           "schwelle": schwelle, "score_struktur": round(score_struktur), "score_ausschnitt": round(score_ausschnitt),
           "massstab": round(s, 4), "schiebung_prozent": round(100 * schieb, 2), "deckung": round(al["deckung"], 3),
           "befunde": befunde, "merkmale": merk, "oeffnungen": oeff, "stellen": (st_neu + st_fehlt)[:30]}
    if zonen is not None:
        res["schutzzonen"] = zonen
    if aus is not None:
        res["markierung"] = str(_markierung(rgbA, rgbBw, neu, fehlt, st_neu, st_fehlt, oeff, res, Path(aus)))
    return res


def _markierung(rgbA, rgbBw, neu, fehlt, st_neu, st_fehlt, oeff, res, aus: Path) -> Path:
    H, W = rgbA.shape[:2]
    a = Image.fromarray((np.clip(rgbA, 0, 1) * 255).astype(np.uint8))
    b = Image.fromarray((np.clip(rgbBw, 0, 1) * 255).astype(np.uint8))
    # Kantenpixel einfaerben: rot = neu im veredelten Bild, blau = fehlt (in der Vorschau)
    an, bn = np.asarray(a).copy(), np.asarray(b).copy()
    bn[ndi.binary_dilation(neu)] = (230, 30, 30)
    an[ndi.binary_dilation(fehlt)] = (30, 90, 230)
    a, b = Image.fromarray(an), Image.fromarray(bn)
    da, db = ImageDraw.Draw(a), ImageDraw.Draw(b)
    for d in st_neu[:12]:
        x0, y0, x1, y1 = d["box"]
        db.rectangle([x0 * W - 3, y0 * H - 3, x1 * W + 3, y1 * H + 3], outline=(230, 30, 30), width=3)
    for d in st_fehlt[:12]:
        x0, y0, x1, y1 = d["box"]
        da.rectangle([x0 * W - 3, y0 * H - 3, x1 * W + 3, y1 * H + 3], outline=(30, 90, 230), width=3)
    for o in oeff:                                   # Oeffnungskandidaten: orange, dick, in beiden Bildern
        x0, y0, x1, y1 = o["box"]
        for d_ in (da, db):
            d_.rectangle([x0 * W - 5, y0 * H - 5, x1 * W + 5, y1 * H + 5], outline=(255, 150, 0), width=5)
    kopf = 54
    out = Image.new("RGB", (2 * W + 12, H + kopf), (250, 250, 248))
    out.paste(a, (0, kopf))
    out.paste(b, (W + 12, kopf))
    d = ImageDraw.Draw(out)
    try:
        f = ImageFont.truetype("DejaVuSans.ttf", 15)
    except OSError:
        f = ImageFont.load_default()
    farbe = (190, 30, 30) if res["status"] != "ok" else (30, 120, 60)
    d.text((8, 6), f"Nachkontrolle: {res['status'].upper()}  Score {res['score']} (Schwelle {res['schwelle']})  "
                   f"Massstab {res['massstab']}  Verschiebung {res['schiebung_prozent']} %", fill=farbe, font=f)
    d.text((8, 28), "links Vorschau (blau = fehlt im veredelten Bild), rechts veredelt ausgerichtet (rot = neu, "
                    "orange = neues Rechteck/Oeffnung?)",
           fill=(60, 60, 60), font=f)
    aus.parent.mkdir(parents=True, exist_ok=True)
    out.save(aus, quality=90)
    return aus


def main_cli(vorschau: str, veredelt: list[str], aus: str | None, schwelle: float, ebenen: str | None = None) -> int:
    """Eine oder mehrere Varianten pruefen. Bei mehreren: Rangfolge (kleinster Score zuerst = Empfehlung)."""
    ergebnisse = []
    for v in veredelt:
        v = Path(v)
        if aus and len(veredelt) == 1:
            ziel = Path(aus)
        elif aus:
            ziel = Path(aus) / f"{v.stem}_nachkontrolle.jpg"
        else:
            ziel = v.with_name(v.stem + "_nachkontrolle.jpg")
        ergebnisse.append(pruefen(Path(vorschau), v, ziel, schwelle, ebenen=Path(ebenen) if ebenen else None))
    if len(ergebnisse) == 1:
        print(json.dumps(ergebnisse[0], ensure_ascii=False, indent=1))
        return 0 if ergebnisse[0]["status"] == "ok" else 1
    rang = sorted(ergebnisse, key=lambda r: (r["status"] == "nicht pruefbar", r["score"]))
    print(json.dumps({"rangfolge": [{"veredelt": r["veredelt"], "status": r["status"], "score": r["score"],
                                     "massstab": r["massstab"], "schiebung_prozent": r["schiebung_prozent"],
                                     "befunde": r["befunde"], "markierung": r.get("markierung"),
                                     "schutzzonen": {k: v["status"] for k, v in
                                                     (r.get("schutzzonen") or {}).get("zonen", {}).items()} or None,
                                     "fenster_je_fassade": (r.get("schutzzonen") or {}).get("fenster_je_fassade")}
                                    for r in rang],
                      "empfehlung": rang[0]["veredelt"]}, ensure_ascii=False, indent=1))
    return 0 if rang[0]["status"] == "ok" else 1
