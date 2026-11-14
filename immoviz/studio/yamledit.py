"""Zeilengenaues Bearbeiten einzelner Eintraege in project.yaml (Abschnitte cameras und lights).

Warum nicht einfach ruamel.yaml laden und wieder ausgeben: ein voller Round-trip formatiert die ganze Datei
neu (Ausrichtung, mehrzeilige Flow-Listen). Deshalb:
  1. Datei mit ruamel.yaml im Round-trip-Modus lesen (Zeilennummern, Anfuehrungszeichen, Zahlformat).
  2. Nur den betroffenen Eintrag neu ausgeben (ruamel, einzeilige Flow-Mapping), Kommentar am Zeilenende,
     Schluesselausrichtung und alle anderen Zeilen bleiben unveraendert.
  3. Ergebnis gegenpruefen: gesamte Datei neu parsen, alle anderen Abschnitte muessen gleich sein, der
     bearbeitete Abschnitt muss genau dem erwarteten Stand entsprechen.
  4. Sicherung nach .history/project.<zeitstempel>.yaml, dann atomar schreiben.
"""
from __future__ import annotations

import copy
import io
import os
import shutil
from datetime import datetime
from pathlib import Path

import yaml
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedSeq


class EditError(ValueError):
    """Bearbeitung nicht moeglich (Text fuer die Oberflaeche)."""


def _rt() -> YAML:
    y = YAML(typ="rt")
    y.preserve_quotes = True
    y.width = 4096
    return y


def _clean(v):
    """Kopie ohne Kommentare, Listen und Mappings im Flow-Stil. Skalare behalten ihren Typ (Format, Anfuehrung)."""
    if isinstance(v, dict):
        m = CommentedMap()
        for k, x in v.items():
            m[k] = _clean(x)
        m.fa.set_flow_style()
        return m
    if isinstance(v, (list, tuple)):
        s = CommentedSeq(_clean(x) for x in v)
        s.fa.set_flow_style()
        return s
    return v


def flow_text(value) -> str:
    """Wert als einzeiliger YAML-Flow-Text, z. B. {pos: [1.0, 2.0, 1.65], lens: 24}."""
    buf = io.StringIO()
    _rt().dump({"k": _clean(value)}, buf)
    s = buf.getvalue().rstrip("\n")
    if not s.startswith("k: ") or "\n" in s:
        raise EditError("Eintrag lässt sich nicht einzeilig schreiben")
    return s[3:]


def _split_comment(line: str) -> tuple[str, str]:
    """Teilt eine Zeile in Inhalt und Kommentar am Zeilenende (inkl. Leerraum davor)."""
    body = line.rstrip("\n")
    quote = None
    for i, ch in enumerate(body):
        if quote:
            if ch == quote:
                quote = None
        elif ch in "\"'":
            quote = ch
        elif ch == "#" and (i == 0 or body[i - 1] in " \t"):
            j = i
            while j > 0 and body[j - 1] in " \t":
                j -= 1
            return body[:j], body[j:]
    return body, ""


def _join_comment(content: str, old_content: str, comment: str) -> str:
    """Kommentar wieder anfuegen, moeglichst an derselben Spalte wie vorher."""
    if not comment:
        return content
    text = comment.lstrip(" \t")
    col = len(old_content) + (len(comment) - len(text))
    pad = col - len(content) if col - len(content) >= 2 else 3
    return content + " " * pad + text


def _is_filler(line: str) -> bool:
    s = line.strip()
    return not s or s.startswith("#")


def edit_section(path: Path, section: str, op: str, name: str, values: dict | None = None,
                 new_name: str | None = None, history: Path | None = None) -> dict:
    """op: create | update | delete. values: Felder des Eintrags (None loescht ein Feld).

    Liefert den neuen Abschnitt als einfaches dict (wie yaml.safe_load).
    """
    text = path.read_text(encoding="utf-8")
    if text and not text.endswith("\n"):
        text += "\n"
    lines = text.splitlines(keepends=True)
    try:
        doc = _rt().load(text)
        old_plain = yaml.safe_load(text) or {}
    except Exception as e:  # noqa: BLE001
        raise EditError(f"project.yaml nicht lesbar: {e}") from e
    if doc is None:
        doc = CommentedMap()
    if not isinstance(doc, CommentedMap) or not isinstance(old_plain, dict):
        raise EditError("project.yaml hat kein Mapping auf oberster Ebene")

    sec = doc.get(section)
    old_sec = old_plain.get(section) or {}
    if not isinstance(old_sec, dict):
        raise EditError(f"Abschnitt {section} ist kein Mapping")
    exists = name in old_sec
    if op == "create" and exists:
        raise EditError(f"'{name}' gibt es schon")
    if op in ("update", "delete") and not exists:
        raise EditError(f"'{name}' nicht gefunden")
    target = new_name or name
    if op == "update" and new_name and new_name != name and new_name in old_sec:
        raise EditError(f"'{new_name}' gibt es schon")

    # Erwarteter Abschnitt danach (fuer die Gegenpruefung)
    expected = copy.deepcopy(old_sec)
    entry_plain = copy.deepcopy(old_sec.get(name)) if exists else {}
    if not isinstance(entry_plain, dict):
        entry_plain = {}
    for k, v in (values or {}).items():
        if v is None:
            entry_plain.pop(k, None)
        else:
            entry_plain[k] = _plain(v)
    if op == "delete":
        expected.pop(name)
    elif op == "create":
        expected[name] = entry_plain
    else:
        expected = {(target if k == name else k): (entry_plain if k == name else v) for k, v in expected.items()}

    # Neuen Eintragswert aufbauen (bestehende Skalare behalten Format und Anfuehrung)
    if op != "delete":
        node = sec.get(name) if (exists and isinstance(sec, CommentedMap)) else None
        m = CommentedMap()
        if isinstance(node, dict):
            for k, v in node.items():
                m[k] = v
        for k, v in (values or {}).items():
            if v is None:
                m.pop(k, None)
            else:
                m[k] = v
        value_text = flow_text(m)

    top_keys = list(doc.keys())

    if section not in doc:
        if op != "create":
            raise EditError(f"Abschnitt {section} fehlt")
        lines.append(f"\n{section}:\n  {target}: {value_text}\n")
    elif not isinstance(sec, CommentedMap) or not sec:
        # leer: "cameras:" oder "cameras: {}"
        if op != "create":
            raise EditError(f"'{name}' nicht gefunden")
        if isinstance(sec, CommentedMap) and sec.fa.flow_style() is False and sec:
            raise EditError(f"Abschnitt {section} hat ein unbekanntes Format")
        ln = doc.lc.key(section)[0]
        body, comment = _split_comment(lines[ln])
        lines[ln] = _join_comment(f"{section}:", body, comment) + "\n" + f"  {target}: {value_text}\n"
    else:
        if sec.fa.flow_style():
            raise EditError(f"Abschnitt {section} steht in einer Zeile; bitte als Block schreiben")
        keys = list(sec.keys())
        i_sec = top_keys.index(section)
        sec_end = doc.lc.key(top_keys[i_sec + 1])[0] if i_sec + 1 < len(top_keys) else len(lines)

        def span(k):
            i = keys.index(k)
            start = sec.lc.key(k)[0]
            nxt = sec.lc.key(keys[i + 1])[0] if i + 1 < len(keys) else sec_end
            end = nxt - 1
            while end > start and _is_filler(lines[end]):
                end -= 1
            return start, end

        indent = sec.lc.key(keys[0])[1]
        if op == "delete":
            s, e = span(name)
            del lines[s:e + 1]
        elif op == "update":
            s, e = span(name)
            kline, kcol = sec.lc.key(name)
            vline, vcol = sec.lc.value(name)
            old_first, _ = _split_comment(lines[s])
            if vline == kline and not new_name:
                prefix = old_first[:vcol]
            else:
                col = vcol if vline == kline else kcol + len(target) + 2
                head = " " * kcol + f"{target}:"
                prefix = head + " " * max(1, col - len(head))
            last_body, comment = _split_comment(lines[e])
            if s != e:
                # mehrzeiliger Eintrag: Kommentar der ersten Zeile bevorzugen
                _, c1 = _split_comment(lines[s])
                comment = c1 or comment
                last_body = old_first
            new_line = _join_comment(prefix + value_text, last_body, comment) + "\n"
            lines[s:e + 1] = [new_line]
        else:  # create
            s, e = span(keys[-1])
            cols = [sec.lc.value(k)[1] for k in keys if sec.lc.value(k)[0] == sec.lc.key(k)[0]]
            head = " " * indent + f"{target}:"
            col = max(set(cols), key=cols.count) if cols else len(head) + 1
            lines.insert(e + 1, head + " " * max(1, col - len(head)) + value_text + "\n")

    new_text = "".join(lines)

    # Gegenpruefung
    try:
        _rt().load(new_text)
        new_plain = yaml.safe_load(new_text) or {}
    except Exception as e:  # noqa: BLE001
        raise EditError(f"Ergebnis wäre kein gültiges YAML: {e}") from e
    for k in set(old_plain) | set(new_plain):
        if k == section:
            continue
        if old_plain.get(k) != new_plain.get(k):
            raise EditError(f"Gegenprüfung fehlgeschlagen: Abschnitt {k} hätte sich geändert")
    if (new_plain.get(section) or {}) != expected:
        raise EditError("Gegenprüfung fehlgeschlagen: Abschnitt weicht vom erwarteten Stand ab")

    if history is not None:
        history.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
        shutil.copy2(path, history / f"project.{stamp}.yaml")
    tmp = path.with_name(f".{path.name}.tmp")
    tmp.write_text(new_text, encoding="utf-8")
    try:
        os.chmod(tmp, path.stat().st_mode & 0o777)
    except OSError:
        pass
    tmp.replace(path)
    return new_plain.get(section) or {}


def _plain(v):
    if isinstance(v, dict):
        return {k: _plain(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [_plain(x) for x in v]
    if isinstance(v, str):
        return str(v)
    return v
