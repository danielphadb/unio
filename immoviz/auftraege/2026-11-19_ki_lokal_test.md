# Auftrag ki_lokal_test

Status: offen
Erstellt: 18.11.2026, Cloud-Sitzung; erweitert 19.11.2026 um den FLUX-Vergleich (Teil B, Schritte 8 bis 11)
Erledigt:

## Ziel
Erster echter Lauf des lokalen, strukturgeführten KI-Schritts (`immoviz.py ki-lokal`, `lib/ki_lokal.py`) auf dem
M3 Max: Kamera `ecke`, Licht `golden_hour` aus `renders/r7_basis` in zwei Veränderungsstärken, danach `schutz --modus
toleranz` und `grading`, Vergleich gegen Runde 7 final. Teil B: dieselbe Ecke mit FLUX.2 klein 4B (kommerziell frei)
und, falls Hugging-Face-Zugang besteht, FLUX.1 dev Depth (NUR interner Qualitätsvergleich). Danach entscheidet die
Cloud-Sitzung, ob und mit welchem Modell `ki-lokal` Higgsfield für die Außenbilder ersetzt oder ergänzt. Keine
Higgsfield-Credits.

Modelle (Lizenzen geprüft, README Abschnitt "Lokaler KI-Schritt", REGELN.md V9):
- Basis `stabilityai/stable-diffusion-xl-base-1.0` (CreativeML Open RAIL++-M, kommerziell erlaubt, Anhang A beachten)
- Steuerung `xinsir/controlnet-union-sdxl-1.0`, Datei `diffusion_pytorch_model_promax.safetensors` (Apache-2.0),
  Tiefe und Kanten aus den Render-Ebenen
- VAE `madebyollin/sdxl-vae-fp16-fix` (MIT)
- Teil B `--modell flux2_klein`: `black-forest-labs/FLUX.2-klein-4B` (Apache-2.0, nicht gated, rund 16 GB),
  `Flux2KleinInpaintPipeline` mit voller Maske = Bild zu Bild, Render zusätzlich als Referenzbild. Keine Tiefen- oder
  Kantensteuerung (gibt es für FLUX.2 in diffusers nicht); die Geometrie halten geringe Stärke und Referenz.
- Teil B `--modell flux1_dev_depth`: `black-forest-labs/FLUX.1-Depth-dev` (FLUX.1 [dev] Non-Commercial License, gated,
  rund 34 GB), `FluxControlImg2ImgPipeline` mit Tiefe aus den Ebenen. **Nur interner Vergleich**: Dateien tragen
  `_NUR_INTERN_nichtkommerziell`, JSON `lizenz_kommerziell: false`; nie nach `renders/higgsfield/`, nie auf Website,
  Exposé oder an Kunden (REGELN.md V9; `ki-lokal`, `schutz` und `grading` erzwingen das).
Nicht verwenden: `--modell realvisxl` und `flux2_klein --steuerung tiefe` (Gemeinschafts-LoRA), beide erst nach
Freigabe; FLUX.2 klein 9B, FLUX.2 dev.

### Zugang FLUX.1 dev (einmalig, nur für den internen Vergleich)
1. Auf https://huggingface.co anmelden (Konto der Agentur), https://huggingface.co/black-forest-labs/FLUX.1-Depth-dev
   öffnen und die Lizenz ("FLUX.1 [dev] Non-Commercial License") bestätigen; die Freigabe kommt meist sofort.
2. Unter https://huggingface.co/settings/tokens einen Token mit Leserechten ("Read") anlegen.
3. Im Terminal `.venv-immoviz/bin/hf auth login` (ältere Versionen: `huggingface-cli login`), Token einfügen, nicht
   als Git-Zugang speichern. Der Token liegt danach in `~/.cache/huggingface/token`, nie ins Repo.
Ohne Zugang überspringt Schritt 9 den FLUX.1-Lauf (`ki-lokal` endet sonst mit Code 3 und dieser Anleitung).

## Befehle
```bash
git pull --rebase
pgrep -f immoviz.py && echo "BELEGT: warten" || echo frei     # ki-lokal belegt die GPU wie ein Render

# 1. Installation (einmalig) und Gerät prüfen
.venv-immoviz/bin/pip install -r immoviz/requirements_ki.txt
.venv-immoviz/bin/python -c "import torch, diffusers; print(torch.__version__, diffusers.__version__, torch.backends.mps.is_available())"

P=immoviz/projects/wimmergasse-20/renders
R=$P/r7_basis/wimmergasse-20_ecke_golden_hour_final.png          # Beauty (PNG, lokal vorhanden)
E=$P/r7_basis/ecke_golden_hour_ebenen
O=$P/ki_lokal
mkdir -p $O

# 2. Funktionstest ohne Download (Zufallsmodell, 512 px, rund 1 min)
.venv-immoviz/bin/python immoviz/immoviz.py ki-lokal --render $R --ebenen $E --modell test --arbeitsbreite 512 \
    --kachel 256 --ueberlappung 64 --schritte 4 --out /tmp/ki_test.jpg | tail -20

# 3. Echter Lauf in zwei Stärken (erster Aufruf lädt rund 10 GB Modelle; Zeit und Speicher messen)
for S in 0.25 0.4; do
  /usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py ki-lokal --render $R --ebenen $E --staerke $S \
      --out $O/ecke_golden_hour_ki_lokal_s${S/./}.jpg 2>&1 | tee $O/ecke_golden_hour_ki_lokal_s${S/./}.log | tail -40
done

# 4. Schutz mit Toleranz (und zum Vergleich voll) auf beide Ergebnisse, Autos wie Runde 7 aus der KI
for S in 025 04; do
  K=$O/ecke_golden_hour_ki_lokal_s$S.jpg
  .venv-immoviz/bin/python immoviz/immoviz.py schutz --render $R --ki $K --ebenen $E --ohne autos --modus toleranz \
      --out $O/ecke_golden_hour_s${S}_toleranz.jpg > $O/ecke_golden_hour_s${S}_toleranz.log
  .venv-immoviz/bin/python immoviz/immoviz.py schutz --render $R --ki $K --ebenen $E --ohne autos \
      --out $O/ecke_golden_hour_s${S}_schutz.jpg > $O/ecke_golden_hour_s${S}_schutz.log
done

# 5. Grading wie Runde 7 (Leitbilder lokal, Maske Schutz plus Himmel, Stärke 0,4)
.venv-immoviz/bin/python -c "
import numpy as np; from PIL import Image
a=np.asarray(Image.open('$E/schutz.png').convert('L')); b=np.asarray(Image.open('$E/himmel.png').convert('L'))
Image.fromarray(np.maximum(a,b)).save('/tmp/ecke_golden_hour_gmaske.png')"
for S in 025 04; do
  IMMOVIZ_REFERENZ=<referenzordner> .venv-immoviz/bin/python immoviz/immoviz.py grading \
      --bild $O/ecke_golden_hour_s${S}_toleranz.jpg --projekt immoviz/projects/wimmergasse-20 \
      --maske /tmp/ecke_golden_hour_gmaske.png --staerke 0.4 > /dev/null
done

# 6. Nachkontrolle mit Ebenen (Schutzzonen, Fensterzahl je Fassade)
for S in 025 04; do
  .venv-immoviz/bin/python immoviz/immoviz.py nachkontrolle --vorschau $R \
      --veredelt $O/ecke_golden_hour_s${S}_toleranz_grading.jpg --ebenen $E \
      --aus $O/nk_ecke_golden_hour_s${S}.jpg > $O/nk_ecke_golden_hour_s${S}.json
done

# 7. Vergleichsbogen: Runde 7 final | ki-lokal 0,25 Toleranz | ki-lokal 0,4 Toleranz, darunter 100-%-Ausschnitte
.venv-immoviz/bin/python - <<'PY'
from PIL import Image, ImageDraw, ImageFont
P = "immoviz/projects/wimmergasse-20/renders"
bilder = [("Runde 7 final (Higgsfield + Schutz voll)", f"{P}/higgsfield/ecke_golden_hour_r7_final.jpg"),
          ("ki-lokal 0,25 + Toleranz + Grading", f"{P}/ki_lokal/ecke_golden_hour_s025_toleranz_grading.jpg"),
          ("ki-lokal 0,4 + Toleranz + Grading", f"{P}/ki_lokal/ecke_golden_hour_s04_toleranz_grading.jpg")]
B, H, box = 1000, 667, (1150, 700, 2150, 1367)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)
o = Image.new("RGB", (3 * B + 20, 2 * H + 80), "white")
d = ImageDraw.Draw(o)
for i, (t, p) in enumerate(bilder):
    im = Image.open(p).convert("RGB")
    o.paste(im.resize((B, H)), (i * (B + 10), 40))
    o.paste(im.crop(box), (i * (B + 10), H + 80))
    d.text((i * (B + 10) + 6, 10), t, fill="black", font=f)
o.save(f"{P}/ki_lokal/ecke_golden_hour_vergleich.jpg", quality=88)
PY

# ---------------------------------------------------------------- Teil B: FLUX-Vergleich (nach Teil A)
# Andere große Programme schließen (36 GB gemeinsamer Speicher). Erwartete Zeiten M3 Max, grob, ohne Download:
#   je 1024er-Kachel: SDXL + Union 15 bis 25 s, FLUX.2 klein 4B 10 bis 25 s, FLUX.1 dev Depth 60 bis 120 s (bf16)
#   bzw. 90 bis 180 s (--quant int8). Ganze Ecke (6 bis 15 Kacheln je nach Rendergröße): SDXL 3 bis 6 min,
#   FLUX.2 klein 2 bis 6 min, FLUX.1 dev 10 bis 30 min. Erster Lauf lädt zusätzlich FLUX.2 klein rund 16 GB,
#   FLUX.1 Depth dev rund 34 GB; FLUX.1 kodiert den Prompt einmal auf der CPU (1 bis 3 min).
# Speicher erwartet: FLUX.2 klein rund 18 GB, FLUX.1 dev rund 26 GB (bf16, Textkodierer danach freigegeben).

# 8. FLUX.2 klein 4B (Apache-2.0), Stärke 0,25 und 0,4 (16 Schritte, wirksam 4 bzw. 6), Render als Referenzbild
for S in 0.25 0.4; do
  /usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py ki-lokal --render $R --ebenen $E --modell flux2_klein \
      --staerke $S --out $O/ecke_golden_hour_flux2_klein_s${S/./}.jpg 2>&1 \
      | tee $O/ecke_golden_hour_flux2_klein_s${S/./}.log | tail -40
done

# 9. FLUX.1 dev Depth (NUR intern), Stärke 0,3, nur mit Zugang
V1=flux1_dev_depth_s03_NUR_INTERN_nichtkommerziell
if .venv-immoviz/bin/python -c "from huggingface_hub import auth_check; auth_check('black-forest-labs/FLUX.1-Depth-dev')" 2>/dev/null; then
  FLUX1=ja
  /usr/bin/time -l .venv-immoviz/bin/python immoviz/immoviz.py ki-lokal --render $R --ebenen $E \
      --modell flux1_dev_depth --staerke 0.3 --out $O/ecke_golden_hour_$V1.jpg 2>&1 \
      | tee $O/ecke_golden_hour_$V1.log | tail -40
  # Bei "MPS backend out of memory": .venv-immoviz/bin/pip install "optimum-quanto>=0.2.7" und denselben Befehl mit
  # --quant int8 wiederholen; reicht das nicht, zusätzlich --offload sequenziell (sehr langsam). Fehler melden.
else
  FLUX1=nein; echo "FLUX.1 dev: kein Zugang, Test übersprungen (siehe Zugang FLUX.1 dev)"
fi

# 10. Je Ergebnis: Schutz Toleranz und voll, Grading, Nachkontrolle (FLUX.1-Markierung bleibt automatisch erhalten)
VARIANTEN="flux2_klein_s025 flux2_klein_s04"; [ "$FLUX1" = ja ] && VARIANTEN="$VARIANTEN $V1"
for V in $VARIANTEN; do
  K=$O/ecke_golden_hour_$V.jpg
  .venv-immoviz/bin/python immoviz/immoviz.py schutz --render $R --ki $K --ebenen $E --ohne autos --modus toleranz \
      --out $O/ecke_golden_hour_${V}_toleranz.jpg > $O/ecke_golden_hour_${V}_toleranz.log
  .venv-immoviz/bin/python immoviz/immoviz.py schutz --render $R --ki $K --ebenen $E --ohne autos \
      --out $O/ecke_golden_hour_${V}_schutz.jpg > $O/ecke_golden_hour_${V}_schutz.log
  IMMOVIZ_REFERENZ=<referenzordner> .venv-immoviz/bin/python immoviz/immoviz.py grading \
      --bild $O/ecke_golden_hour_${V}_toleranz.jpg --projekt immoviz/projects/wimmergasse-20 \
      --maske /tmp/ecke_golden_hour_gmaske.png --staerke 0.4 > /dev/null
  .venv-immoviz/bin/python immoviz/immoviz.py nachkontrolle --vorschau $R \
      --veredelt $O/ecke_golden_hour_${V}_toleranz_grading.jpg --ebenen $E \
      --aus $O/nk_ecke_golden_hour_$V.jpg > $O/nk_ecke_golden_hour_$V.json
done

# 11. Vergleichsbogen SDXL | FLUX.2 klein | FLUX.1 dev (intern) | Runde 7 final, darunter 100-%-Ausschnitte
#     (900 x 600 px, ungeskaliert) Fenster und Putz, automatisch aus den Ebenen gewählt (meiste Fensterfläche bzw. Fassade ohne
#     Fenster). SX/KX = die bessere SDXL- bzw. FLUX.2-Stärke aus der Sichtprüfung (Standard s025). Mit FLUX.1 dev
#     trägt auch der Bogen die Markierung.
SX=s025 KX=s025 .venv-immoviz/bin/python - "$E" "$FLUX1" <<'PY'
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
P = "immoviz/projects/wimmergasse-20/renders"; O = f"{P}/ki_lokal"; E, flux1 = sys.argv[1], sys.argv[2] == "ja"
sx, kx = os.environ["SX"], os.environ["KX"]
sp = [(f"SDXL + Union {sx}", f"{O}/ecke_golden_hour_{sx}_toleranz_grading.jpg"),
      (f"FLUX.2 klein 4B {kx}", f"{O}/ecke_golden_hour_flux2_klein_{kx}_toleranz_grading.jpg")]
if flux1:
    sp.append(("FLUX.1 dev Depth 0,3 (NUR INTERN)",
               f"{O}/ecke_golden_hour_flux1_dev_depth_s03_NUR_INTERN_nichtkommerziell_toleranz_grading.jpg"))
sp.append(("Runde 7 final", f"{P}/higgsfield/ecke_golden_hour_r7_final.jpg"))
bilder = [(t, Image.open(p).convert("RGB")) for t, p in sp]
W0, H0 = bilder[0][1].size
bilder = [(t, im if im.size == (W0, H0) else im.resize((W0, H0), Image.LANCZOS)) for t, im in bilder]
def maske(n):
    return np.asarray(Image.open(f"{E}/{n}.png").convert("L").resize((W0, H0)), np.float32) / 255
fen = np.maximum(maske("fenster_glas"), maske("fenster_rahmen"))
putz = maske("gebaeude_objekt") * (1 - ndi.maximum_filter(fen, 25))
cw, ch = 900, 600                                  # 100 %: Ausschnitt so breit wie die Spalte
def box(m):
    g = ndi.uniform_filter(m, (ch, cw))[ch // 2:H0 - ch // 2, cw // 2:W0 - cw // 2]
    y, x = np.unravel_index(np.argmax(g), g.shape)
    return (int(x), int(y), int(x) + cw, int(y) + ch)
boxen = [("Fenster 100 %", box(fen)), ("Putz 100 %", box(putz))]
B = cw; H = round(H0 * B / W0); hc = ch
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)
o = Image.new("RGB", (len(bilder) * (B + 10), 40 + H + 2 * (hc + 40)), "white")
d = ImageDraw.Draw(o)
for i, (t, im) in enumerate(bilder):
    x = i * (B + 10)
    d.text((x + 6, 10), t, fill=(200, 0, 0) if "INTERN" in t else "black", font=f)
    o.paste(im.resize((B, H)), (x, 40))
    for j, (bt, bx) in enumerate(boxen):
        y = 40 + H + j * (hc + 40)
        d.text((x + 6, y + 10), f"{bt} {bx}", fill="black", font=f)
        o.paste(im.crop(bx), (x, y + 40))
name = "ecke_golden_hour_vergleich_flux" + ("_NUR_INTERN_nichtkommerziell" if flux1 else "") + ".jpg"
o.save(f"{O}/{name}", quality=88); print(name, boxen)
PY
```

Optional, wenn Zeit bleibt: Inpainting nur für Himmel und Bäume vor dem Verfeinern
(`--inpaint himmel,baeume --staerke 0.25 --out $O/ecke_golden_hour_ki_lokal_inpaint_s025.jpg`), danach Schritte 4 bis 6.

## Ausgabe
Alles unter `immoviz/projects/wimmergasse-20/renders/ki_lokal/` (einchecken, JPG und JSON; PNG ist gitignored):
- `ecke_golden_hour_ki_lokal_s025.jpg`, `_s04.jpg` mit `_pruefung.jpg`, `.json`, `.log`
- `ecke_golden_hour_s*_toleranz*.jpg/.json` (inklusive `_komponenten.jpg/.json`), `_schutz*.jpg/.json`
- `*_toleranz_grading.jpg/.json`, `nk_*.jpg/.json`, `ecke_golden_hour_vergleich.jpg`
- Teil B: `ecke_golden_hour_flux2_klein_s025*`, `_s04*` und (falls Zugang) `ecke_golden_hour_flux1_dev_depth_s03_
  NUR_INTERN_nichtkommerziell*` mit denselben Folgedateien, `nk_*`, `ecke_golden_hour_vergleich_flux[_NUR_INTERN_
  nichtkommerziell].jpg`. FLUX.1-Dateien nur in `renders/ki_lokal/` (Repo privat), nie in `renders/higgsfield/`.
Nicht einchecken: Modelle, `~/.cache/huggingface` (auch nicht den Token), Leitbilder, `/tmp`-Dateien.

## Melden
Unter "Ergebnis" eintragen und pushen:
1. Versionen (torch, diffusers, transformers; aus dem Ergebnis-JSON `versionen`), Gerät (`modell_info.geraet`, dtype).
2. Zeiten je Stärke aus dem JSON `zeiten`: Laden (erster Lauf mit Download getrennt nennen), je Kachel, gesamt;
   Speicher: `speicher.prozess_max_gb`, `speicher.mps_treiber_gb` und `maximum resident set size` aus `/usr/bin/time -l`.
3. Toleranz je Stärke aus `_toleranz.json`: `toleranz.ki_behalten_prozent_schutz`, `toleranz.je_typ.fenster`
   (behalten, zurueck, nur_glas_zurueck), `ausrichtung.fein.verschiebung_4k_px`, `schutzbereich.kanten_nachher.f1`.
4. Nachkontrolle: `status`, Zonen, Fensterzahl.
5. Sichtprüfung des Vergleichsbogens (Putz, Stuck, Glas, Licht gegen Runde 7; Kachelnähte; erfundene Details; Farbe
   je Kachel gleichmäßig?) und welche Stärke besser ist. Fehler mit genauer Meldung (MPS, NaN/schwarze Kacheln,
   Speicher). Bei schwarzen oder grauen Kacheln: Lauf mit `--kachel 768` wiederholen und melden.

6. Teil B als Tabelle, eine Zeile je Variante (SDXL 0,25 und 0,4, FLUX.2 klein 0,25 und 0,4, FLUX.1 dev 0,3 oder
   "übersprungen, kein Zugang"): Zeiten (`zeiten.laden_s` mit und ohne Download, `je_kachel_s`, `gesamt_s`, bei
   FLUX.1 `modell_info.text_kodieren_s`), Speicher (`speicher.prozess_max_gb`, `mps_treiber_gb`, `maximum resident
   set size`), ob `--quant` oder `--offload` nötig war, Anteil der Fenster, die die KI behalten durfte
   (`_toleranz.json` `toleranz.je_typ.fenster`: behalten / gesamt in Prozent, dazu zurueck und nur_glas_zurueck),
   `ki_behalten_prozent_schutz`, F1 Kanten (Toleranz und voll), Nachkontrolle `status` und Fensterzahl.
7. Sichtprüfung des FLUX-Vergleichsbogens (100 % Fenster und Putz: Glasreflexe, Rahmenkanten, Putzkörnung, Stuck,
   erfundene Details, Kachelnähte, Farbe je Kachel) und Rangfolge SDXL | FLUX.2 klein | FLUX.1 dev (intern) |
   Runde 7 mit einem Satz Begründung je Platz.

## Ergebnis
(von der Mac-Sitzung auszufüllen)
