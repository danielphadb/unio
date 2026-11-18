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
- Übergabe über Git: Die Cloud-Sitzung legt Aufträge als Datei `immoviz/auftraege/<datum>_<name>.md` ab, die
  Mac-Sitzung arbeitet sie ab und pusht die Ergebnisse.

## 4. Gerät wählen

`IMMOVIZ_DEVICE=auto` (Standard) nimmt Metal, OptiX, CUDA, HIP oder oneAPI, sonst CPU. `IMMOVIZ_DEVICE=CPU` erzwingt
den Prozessor.
