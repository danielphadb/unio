# Aufträge an den Render-Rechner (Mac)

Die Cloud-Sitzung legt hier Aufträge ab, die Mac-Sitzung (MacBook Pro M3 Max, Metal; Einrichtung in `MAC_SETUP.md`)
arbeitet sie ab, trägt das Ergebnis in dieselbe Datei ein und pusht auf den Branch `claude/elegant-euler-opd1o5`.

Dateiname: `<JJJJ-MM-TT>_<kurzname>.md`. Format:

```markdown
# Auftrag <kurzname>

Status: offen            # offen | in Arbeit | erledigt | Problem
Erstellt: <Datum>, Cloud-Sitzung
Erledigt: <Datum>, Mac-Sitzung

## Ziel
Ein bis drei Sätze: wozu, was danach damit passiert.

## Befehle
Kopierbare Befehle in Reihenfolge, aus dem Repo-Ordner, mit .venv-immoviz/bin/python.

## Ausgabe
Welche Dateien wo entstehen und welche davon eingecheckt werden (PNG unter renders/ ist gitignored).

## Melden
Was die Mac-Sitzung unter "Ergebnis" einträgt: Zeiten, Gerät, Kennzahlen, Probleme mit genauer Fehlermeldung.

## Ergebnis
(von der Mac-Sitzung auszufüllen)
```

Regeln für beide Seiten: nie zwei Renders gleichzeitig (`pgrep -f immoviz.py`), kein em dash oder en dash, keine
Schlüssel in Dateien, nichts aus `renders/streetview`, `mood` oder Referenzordnern einchecken, keine Higgsfield-Credits
ohne ausdrücklichen Auftrag. Vor dem Push `git pull --rebase`.
