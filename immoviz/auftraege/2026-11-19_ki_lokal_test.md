# Auftrag ki_lokal_test

Status: offen
Erstellt: 18.11.2026, Cloud-Sitzung
Erledigt:

## Ziel
Erster echter Lauf des lokalen, strukturgeführten KI-Schritts (`immoviz.py ki-lokal`, `lib/ki_lokal.py`) auf dem
M3 Max: Kamera `ecke`, Licht `golden_hour` aus `renders/r7_basis` in zwei Veränderungsstärken, danach `schutz --modus
toleranz` und `grading`, Vergleich gegen Runde 7 final. Danach entscheidet die Cloud-Sitzung, ob `ki-lokal` Higgsfield
für die Außenbilder ersetzt oder ergänzt. Keine Higgsfield-Credits.

Modelle (Lizenzen geprüft, README Abschnitt "Lokaler KI-Schritt", REGELN.md V9):
- Basis `stabilityai/stable-diffusion-xl-base-1.0` (CreativeML Open RAIL++-M, kommerziell erlaubt, Anhang A beachten)
- Steuerung `xinsir/controlnet-union-sdxl-1.0`, Datei `diffusion_pytorch_model_promax.safetensors` (Apache-2.0),
  Tiefe und Kanten aus den Render-Ebenen
- VAE `madebyollin/sdxl-vae-fp16-fix` (MIT)
Nicht verwenden: `--modell realvisxl` (erst nach Freigabe), FLUX.1 dev und Ableger.

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
```

Optional, wenn Zeit bleibt: Inpainting nur für Himmel und Bäume vor dem Verfeinern
(`--inpaint himmel,baeume --staerke 0.25 --out $O/ecke_golden_hour_ki_lokal_inpaint_s025.jpg`), danach Schritte 4 bis 6.

## Ausgabe
Alles unter `immoviz/projects/wimmergasse-20/renders/ki_lokal/` (einchecken, JPG und JSON; PNG ist gitignored):
- `ecke_golden_hour_ki_lokal_s025.jpg`, `_s04.jpg` mit `_pruefung.jpg`, `.json`, `.log`
- `ecke_golden_hour_s*_toleranz*.jpg/.json` (inklusive `_komponenten.jpg/.json`), `_schutz*.jpg/.json`
- `*_toleranz_grading.jpg/.json`, `nk_*.jpg/.json`, `ecke_golden_hour_vergleich.jpg`
Nicht einchecken: Modelle, `~/.cache/huggingface`, Leitbilder, `/tmp`-Dateien.

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

## Ergebnis
(von der Mac-Sitzung auszufüllen)
