# immoviz auf dem Mac (Apple Silicon) als Render-Rechner

Ziel: Blender-Renders (Cycles auf der Grafikeinheit über Metal) und später lokale KI-Bearbeitung laufen auf dem
MacBook Pro M3 Max statt in der Cloud-Umgebung (4 Prozessorkerne, keine Grafikkarte). Aufträge und Ergebnisse
laufen über das Repo `danielphadb/unio`, Branch `claude/elegant-euler-opd1o5`.

## 1. Einmalig: Claude-Code-Sitzung auf dem Mac starten

1. Einen Arbeitsordner anlegen, z. B. `~/Documents/immoviz-render`.
2. In der Claude-Desktop-App eine neue Claude-Code-Sitzung in diesem Ordner starten (oder im Terminal im Ordner
   `claude` starten). Mit "Neue Sitzungen mit Remote Control verbinden" ist sie auch von anderen Geräten erreichbar.
3. Den Auftrag aus Abschnitt 2 in die Sitzung kopieren.

## 2. Auftrag für die Mac-Sitzung (zum Kopieren)

```
Richte diesen Mac als Render-Rechner für das Tool immoviz ein.
1. Klone https://github.com/danielphadb/unio in diesen Ordner und wechsle auf den Branch claude/elegant-euler-opd1o5.
2. Lies immoviz/README.md, immoviz/REGELN.md und immoviz/MAC_SETUP.md.
3. Lege mit Python 3.13 (z. B. per Homebrew: brew install python@3.13) eine virtuelle Umgebung .venv-immoviz im
   Repo-Ordner an und installiere immoviz/requirements.txt. bpy 5.2.4 gibt es als Wheel für macOS arm64; falls die
   Installation scheitert, melde den genauen Fehler.
4. Prüfe die Grafikeinheit: .venv-immoviz/bin/python -c "import sys; sys.path.insert(0,'immoviz'); import bpy;
   from lib import build; s=bpy.context.scene; build.setup_render(s,(64,64),4); print(s.cycles.device)"
   Erwartet: "Cycles rendert auf METAL" und GPU.
5. Rendere als Test die Kamera ecke der Wimmergasse in 3840 x 2560 mit 256 Samples
   (Befehl render, siehe README) und miss die Zeit. Lege das Bild unter
   immoviz/projects/wimmergasse-20/renders/mac_test/ ab.
6. Committe nur Code- und Konfigurationsänderungen und das Testbild, nichts aus renders/streetview, mood oder
   referenz-Ordnern, keine Schlüssel. Push auf denselben Branch.
7. Melde: Blender-Version, Gerät, Renderzeit, Probleme.
Regeln: kein em dash oder en dash in Texten; nie zwei Renders parallel; Google-Schlüssel nur als Umgebungsvariable.
```

## 3. Arbeitsteilung danach

- Cloud-Sitzung: Planauswertung, Modell, Prüfungen, Higgsfield, Abstimmungsseiten, Doku.
- Mac-Sitzung: fotorealistische Renders, Render-Ebenen (Objektmasken, Tiefe, Normalen), lokale KI-Bearbeitung mit
  Schutzmaske, Fotogrammetrie.
- Übergabe über Git: Die Cloud-Sitzung legt Aufträge als Datei `immoviz/auftraege/<datum>_<name>.md` ab (Format in
  `immoviz/auftraege/README.md`), die
  Mac-Sitzung arbeitet sie ab und pusht die Ergebnisse.

## 4. Erfahrungen bei der Einrichtung (18.11.2026, MacBook Pro M3 Max, macOS 14.4)

- Kein Homebrew vorhanden (Installation bräuchte ein Admin-Passwort). Ohne Admin-Rechte geht es mit `uv`:
  `/usr/bin/python3 -m pip install --user uv`, dann `~/Library/Python/3.9/bin/uv python install 3.13` und
  `~/Library/Python/3.9/bin/uv venv --python 3.13 --seed .venv-immoviz`.
- `bpy==5.2.4` installiert als Wheel ohne Probleme (rund 245 MB).
- `opencv-python-headless` 5.1 hat kein Wheel für macOS 14, pip kompiliert es dann aus dem Quellcode (über eine
  Stunde). `requirements.txt` begrenzt es auf dem Mac deshalb auf unter 5.1 (5.0.0.93 als Wheel).
- Testrender: `immoviz.py render ... --res 3840x2560 --samples 256 --out mac_test --no-blend`; `--res`,
  `--samples` und `--out` überschreiben `project.yaml` nur für diesen Aufruf.
- Ergebnis Testrender Wimmergasse, Kamera `ecke`, `golden_hour`, 3840 x 2560, 256 Samples, OpenImageDenoise:
  Blender 5.2.4 LTS, Metal auf Apple M3 Max (GPU, 30 Kerne), 219 Sekunden gesamt (Szenenaufbau, erstes
  Laden der Metal-Kernel und Rendering). Bild: `projects/wimmergasse-20/renders/mac_test/`.

## 5. Gerät wählen

`IMMOVIZ_DEVICE=auto` (Standard) nimmt Metal, OptiX, CUDA, HIP oder oneAPI, sonst CPU. `IMMOVIZ_DEVICE=CPU` erzwingt
den Prozessor.

## 3. Lokaler KI-Schritt (optional, `ki-lokal`)

Für die strukturgeführte Veredelung auf dem Mac (README, Abschnitt "Lokaler KI-Schritt"):

```bash
.venv-immoviz/bin/pip install -r immoviz/requirements_ki.txt
.venv-immoviz/bin/python -c "import torch; print(torch.__version__, torch.backends.mps.is_available())"   # erwartet True
```

Die Modelle (SDXL, ControlNet-Union ProMax, VAE; rund 10 GB) lädt der erste Lauf nach `~/.cache/huggingface`,
ohne Konto. Nichts davon ins Repo. Ein `ki-lokal`-Lauf belegt die Grafikeinheit: wie ein Render behandeln, also nie
parallel zu `render` oder einem zweiten `ki-lokal` (`pgrep -f immoviz.py`). Erster Testlauf:
`auftraege/2026-11-19_ki_lokal_test.md`.

## 6. Zweite lokale Sitzung `mac-neu` (zweites Claude-Konto, ab 22.11.2026)

Auf demselben Mac arbeitet neben `mac-alt` eine zweite Claude-Code-Sitzung aus dem zweiten Claude-Konto. Beide nutzen
**denselben Ordner** (der schon eingerichtete Klon mit `.venv-immoviz`, Modell-Caches und lokalen Renders), aber nie
gleichzeitig. Protokoll: `CLAUDE.md` und `SITZUNGEN.md`.

Starten: In der Claude-Desktop-App mit dem zweiten Konto angemeldet eine neue Claude-Code-Sitzung (lokal) im
bestehenden immoviz-Ordner öffnen, oder im Terminal `cd <ordner> && claude` und mit dem zweiten Konto anmelden. Git
pusht über die Zugangsdaten des Macs, nicht über das Claude-Konto; dafür ist nichts Neues einzurichten.
