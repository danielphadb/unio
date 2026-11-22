# immoviz (UNIO / Ad Boutique): Hinweise für jede Claude-Sitzung

An diesem Repo arbeiten mehrere Claude-Sitzungen parallel, aus zwei Claude-Konten, in der Cloud und lokal auf dem
Mac. Sie können sich keine Nachrichten schicken. Abstimmung läuft ausschließlich über Git:

- **Ein gemeinsamer Branch:** `claude/elegant-euler-opd1o5`. Der Nutzer hat festgelegt, dass alle immoviz-Sitzungen
  direkt auf diesen Branch committen und pushen, auch wenn der Sitzung ein anderer Branch zugewiesen ist.
- **Ein gemeinsames Brett:** `immoviz/SITZUNGEN.md` (Kennungen, wer gerade woran arbeitet, Nachrichten, Log).
- **Aufträge an den Mac:** `immoviz/auftraege/` (Format in `immoviz/auftraege/README.md`).

## Pflicht bei jedem Start

```bash
git fetch origin claude/elegant-euler-opd1o5
git checkout claude/elegant-euler-opd1o5
git pull --rebase
```

Dann lesen, in dieser Reihenfolge: `immoviz/SITZUNGEN.md` (ganz), `immoviz/UEBERGABE.md`, `immoviz/README.md`,
`immoviz/REGELN.md`; auf dem Mac zusätzlich `immoviz/MAC_SETUP.md` und `immoviz/auftraege/README.md`.
Eigene Kennung aus der Tabelle in `SITZUNGEN.md` nehmen; wenn unklar, den Nutzer fragen.

## Pflicht während der Arbeit

- Vor jeder neuen Aufgabe in `SITZUNGEN.md` unter "Laufend" anmelden und sofort pushen, danach erst arbeiten.
- Vor jedem Commit `git pull --rebase`. Kommen dabei Commits anderer Sitzungen herein, deren Inhalt kurz ansehen
  (`git log --oneline ORIG_HEAD..HEAD`), bei Änderungen an `SITZUNGEN.md` die Nachrichten lesen.
- Nach der Aufgabe abmelden: Eintrag aus "Laufend" entfernen, Log-Eintrag oben anfügen, pushen.
- Klein und oft committen, nie stundenlang ungepushte Arbeit liegen lassen.

## Grundregeln (Kurzfassung, verbindlich ist `immoviz/REGELN.md`)

- Das Repo ist **öffentlich**: keine Pläne, Kundenfotos, Verträge, Preise, Schlüssel, Tokens, Street-View-, Google-
  oder Apple-Bilder einchecken. Solche Dateien bleiben lokal und werden in `UEBERGABE.md` nur aufgelistet.
- Kein em dash und kein en dash in Texten.
- Nie zwei Renders oder `ki-lokal`-Läufe gleichzeitig auf einem Rechner (`pgrep -f immoviz.py`).
- Keine Higgsfield-Credits ohne ausdrücklichen Auftrag des Nutzers.
