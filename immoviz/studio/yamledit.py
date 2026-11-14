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


# ---------------------------------------------------------------------------------------------------------
# Bloecke ersetzen (Fassaden- und Dach-Editor, Neues Objekt)
#
# replace_blocks(path, [(["altbau", "facades", "wimmergasse", "axes"], [1.6, 3.65]), ...]) ersetzt je Pfad den
# ganzen Wert (Liste, Mapping oder Skalar) als Block. Alles ausserhalb dieser Bloecke bleibt zeichengenau.
# Innerhalb eines Blocks bleiben erhalten: Kommentare am Zeilenende und Kommentarzeilen vor einem Listeneintrag
# bzw. Schluessel (je Position bzw. Schluessel, solange es den Eintrag noch gibt) sowie das Zahlenformat
# unveraenderter Werte (z. B. 4.40). Lange Flow-Eintraege werden umbrochen.
# ---------------------------------------------------------------------------------------------------------
import json as _json
import re as _re

from ruamel.yaml.scalarstring import DoubleQuotedScalarString as _DQ

WRAP = 118
_PLAIN_STR = _re.compile(r"[A-Za-z_][A-Za-z0-9_ ./()+-]*")
_RESERVED = {"yes", "no", "true", "false", "on", "off", "null", "y", "n", "~"}


def _indent(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def _scalar_ok(v):
    if isinstance(v, str) and not hasattr(v, "fa"):
        if type(v) is str and (not _PLAIN_STR.fullmatch(v) or v.lower() in _RESERVED or v != v.strip()):
            return _DQ(v)
    return v


def _kind(v) -> str:
    for t, n in ((bool, "b"), (int, "i"), (float, "f"), (str, "s")):
        if isinstance(v, t):
            return n
    return "?"


def _merge_rt(old, new):
    """Neuer Wert, aber unveraenderte Skalare als ruamel-Objekte (Format, Anfuehrung bleiben)."""
    if isinstance(new, dict):
        out = CommentedMap()
        for k, v in new.items():
            out[k] = _merge_rt(old.get(k) if isinstance(old, dict) else None, v)
        return out
    if isinstance(new, (list, tuple)):
        return CommentedSeq(_merge_rt(old[i] if isinstance(old, list) and i < len(old) else None, v)
                            for i, v in enumerate(new))
    if old is not None and not isinstance(old, (dict, list)) and _kind(old) == _kind(new) and old == new:
        return old
    return _scalar_ok(new)


def _wrap(head: str, text: str, cont: int, width: int = WRAP) -> list[str]:
    """Flow-Text nach head anfuegen und an ', ' (innerhalb von Klammern, ausserhalb von Strings) umbrechen."""
    if len(head) + len(text) <= width:
        return [head + text]
    cuts, depth, quote = [], 0, None
    for i, ch in enumerate(text):
        if quote:
            if ch == quote:
                quote = None
            continue
        if ch in "\"'":
            quote = ch
        elif ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
        elif ch == "," and depth >= 1 and i + 1 < len(text) and text[i + 1] == " " \
                and (depth == 1 or text[i + 2:i + 3] in ("{", "[")):
            cuts.append(i + 1)
    lines, start, cur = [], 0, head
    last_ok = None
    for c in cuts + [len(text)]:
        seg = text[start:c]
        if len(cur) + len(seg) > width and last_ok is not None:
            lines.append(cur.rstrip())
            cur = " " * cont + text[last_ok:c].lstrip()
            start = c
            last_ok = c
            continue
        cur_candidate = cur + seg
        cur = cur_candidate
        start = c
        last_ok = c
    lines.append(cur.rstrip())
    return lines


def _key_text(k) -> str:
    s = str(k)
    if _re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", s) and s.lower() not in _RESERVED:
        return s
    return _json.dumps(s, ensure_ascii=False)


def _block_span(lines, start: int, col: int, stop: int) -> int:
    """Letzte Zeile (inkl.) eines Eintrags ab start: alle Zeilen tiefer als col; Fuellzeilen am Ende nicht."""
    end = start
    i = start + 1
    while i < stop:
        ln = lines[i]
        if _is_filler(ln):
            i += 1
            continue
        if _indent(ln) <= col:
            break
        end = i
        i += 1
    return end


def _wants_block(val, old) -> str | None:
    """'map', 'seq' oder None (inline Flow). Bestehende Block-Knoten bleiben Bloecke."""
    if isinstance(val, dict) and val:
        if isinstance(old, CommentedMap) and old and not old.fa.flow_style():
            return "map"
        if any(isinstance(v, dict) or (isinstance(v, list) and any(isinstance(x, dict) for x in v))
               for v in val.values()):
            return "map"
        return None
    if isinstance(val, list) and val:
        if isinstance(old, CommentedSeq) and old and not old.fa.flow_style():
            return "seq"
        if any(isinstance(x, dict) for x in val):
            return "seq"
    return None


def _same(old, new) -> bool:
    try:
        return old is not None and _plain(old) == _plain(new) and _types(old) == _types(new)
    except Exception:  # noqa: BLE001
        return False


def _types(v):
    if isinstance(v, dict):
        return {k: _types(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [_types(x) for x in v]
    return _kind(v)


def _children_info(lines, old, stop: int):
    """Zu einem Block-Knoten je Kind: (Startzeile, Endzeile, Kommentarzeilen davor, Kommentar am Zeilenende)."""
    info = {}
    if isinstance(old, CommentedMap) and old and not old.fa.flow_style():
        keys = list(old.keys())
        pos = [(k, old.lc.key(k)[0], old.lc.key(k)[1]) for k in keys]
    elif isinstance(old, CommentedSeq) and old and not old.fa.flow_style():
        pos = []
        for i in range(len(old)):
            ln, col = old.lc.item(i)
            # lc.item zeigt auf den Inhalt hinter "- "
            dash = lines[ln].rfind("-", 0, col + 1)
            pos.append((i, ln, dash if dash >= 0 else col))
    else:
        return info
    prev_end = None
    for j, (k, ln, col) in enumerate(pos):
        nxt = pos[j + 1][1] if j + 1 < len(pos) else stop
        end = _block_span(lines, ln, col, nxt)
        lead = []
        if prev_end is not None:
            lead = [x for x in lines[prev_end + 1:ln] if x.strip().startswith("#")]
        _, c_first = _split_comment(lines[ln])
        _, c_last = _split_comment(lines[end])
        info[k] = {"start": ln, "end": end, "col": col, "lead": lead, "comment": c_last or c_first,
                   "first": lines[ln]}
        prev_end = end
    return info


def _emit(key_text: str | None, val, col: int, old, lines, old_start: int | None, old_end: int | None,
          comment: str = "", first_line: str = "") -> list[str]:
    """Zeilen fuer 'key: val' (oder '- val' bei key_text None) ab Spalte col, ohne Zeilenumbruch am Ende."""
    head = " " * col + (f"{key_text}:" if key_text is not None else "-")
    style = _wants_block(val, old)
    if style is None and isinstance(val, dict) and val and len(head) + len(flow_text(val)) > WRAP:
        style = "map"   # lange Mappings (z. B. checks.<fassade>) als Block
    if style is None:
        txt = flow_text(val) if not isinstance(val, (dict, list)) or val else ("{}" if isinstance(val, dict) else "[]")
        # Spaltenausrichtung wie vorher (z. B. 'eg:  {z: ...}')
        pad = 1
        if first_line and key_text is not None:
            body, _ = _split_comment(first_line)
            m = _re.match(r"\s*" + _re.escape(key_text) + r":(\s*)\S", body)
            if m:
                pad = max(1, len(m.group(1)))
        out = _wrap(head + " " * pad, txt, col + (len(key_text) + 2 + pad if key_text is not None else 2) + 1)
        if comment:
            body0, _ = _split_comment(first_line) if first_line else (out[-1], "")
            out[-1] = _join_comment(out[-1], body0 if len(out) == 1 and first_line else out[-1], comment)
        return out
    out = [head]
    if comment:
        b0, _ = _split_comment(first_line) if first_line else (head, "")
        out[0] = _join_comment(head, b0, comment)
    info = _children_info(lines, old, (old_end + 1) if old_end is not None else 0) if old_start is not None else {}
    if style == "map":
        ccol = next(iter(info.values()))["col"] if info else col + 2
        for k, v in val.items():
            ci = info.get(k)
            if ci:
                out.extend(x.rstrip("\n") for x in ci["lead"])
            child_old = old.get(k) if isinstance(old, dict) else None
            if ci and _same(child_old, v):
                out.extend(x.rstrip("\n") for x in lines[ci["start"]:ci["end"] + 1])
                continue
            out.extend(_emit(_key_text(k), v, ccol, child_old, lines,
                             ci["start"] if ci else None, ci["end"] if ci else None,
                             ci["comment"] if ci else "", ci["first"] if ci else ""))
    else:
        ccol = next(iter(info.values()))["col"] if info else col + 2
        # Zuordnung neuer zu alten Eintraegen: erst unveraenderte (gleicher Inhalt, bevorzugt gleiche Position),
        # dann gleiche Position, sofern der alte Eintrag noch frei ist. So wandern Kommentare mit ihrem Eintrag.
        olds = list(old) if isinstance(old, list) else []
        match, used = {}, set()
        for i, v in enumerate(val):
            cands = [i] if i < len(olds) else []
            cands += [j for j in range(len(olds)) if j != i]
            for j in cands:
                if j not in used and j in info and _same(olds[j], v):
                    match[i] = (j, True)
                    used.add(j)
                    break
        for i, v in enumerate(val):
            if i not in match and i < len(olds) and i not in used and i in info:
                match[i] = (i, False)
                used.add(i)
        for i, v in enumerate(val):
            j, same = match.get(i, (None, False))
            ci = info.get(j) if j is not None else None
            if ci:
                out.extend(x.rstrip("\n") for x in ci["lead"])
            if ci and same:
                out.extend(x.rstrip("\n") for x in lines[ci["start"]:ci["end"] + 1])
                continue
            # Listeneintraege immer als Flow; war der alte Eintrag einzeilig, bleibt er einzeilig
            txt = flow_text(v) if not isinstance(v, (dict, list)) or v else ("{}" if isinstance(v, dict) else "[]")
            item = _wrap(" " * ccol + "- ", txt, ccol + 3, 10 ** 6 if ci and ci["start"] == ci["end"] else WRAP)
            if ci and ci["comment"]:
                b0, _ = _split_comment(ci["first"])
                item[-1] = _join_comment(item[-1], b0 if len(item) == 1 and ci["start"] == ci["end"] else item[-1],
                                         ci["comment"])
            out.extend(item)
    return out


def _get_plain(d, keypath):
    cur = d
    for k in keypath:
        if not isinstance(cur, dict) or k not in cur:
            return None
        cur = cur[k]
    return cur


def _set_plain(d: dict, keypath, value) -> dict:
    out = copy.deepcopy(d)
    cur = out
    for k in keypath[:-1]:
        if not isinstance(cur.get(k), dict):
            cur[k] = {}
        cur = cur[k]
    cur[keypath[-1]] = copy.deepcopy(value)
    return out


def _replace_one(text: str, keypath: list[str], value) -> str:
    lines = text.splitlines(keepends=True)
    doc = _rt().load(text)
    if not isinstance(doc, CommentedMap):
        raise EditError("project.yaml hat kein Mapping auf oberster Ebene")
    # tiefsten Block-Vorfahren suchen
    anc, i = doc, 0
    while i < len(keypath) - 1:
        child = anc.get(keypath[i])
        if isinstance(child, CommentedMap) and not child.fa.flow_style():
            anc = child
            i += 1
            continue
        break
    key = keypath[i]
    rest = keypath[i + 1:]
    old_node = anc.get(key)
    if rest:
        base = _plain(copy.deepcopy(old_node)) if isinstance(old_node, dict) else {}
        new_plain_val = _set_plain(base, rest, _plain(value))
    else:
        new_plain_val = _plain(value)
    val = _merge_rt(old_node, new_plain_val)

    if key in anc:
        kline, kcol = anc.lc.key(key)
        stop = len(lines)
        end = _block_span(lines, kline, kcol, stop)
        body, comment = _split_comment(lines[kline])
        m = _re.match(r"(\s*)(.+?):(\s|$)", body)
        ktxt = m.group(2) if m else _key_text(key)
        if end != kline and not _re.match(r"\s*" + _re.escape(ktxt) + r":\s*$", body):
            # mehrzeiliger Flow-Wert: Kommentar der letzten Zeile
            _, c2 = _split_comment(lines[end])
            comment = comment or c2
        new_lines = _emit(ktxt, val, kcol, old_node, lines, kline, end, comment, lines[kline])
        lines[kline:end + 1] = [x + "\n" for x in new_lines]
    else:
        keys = list(anc.keys())
        if anc is doc:
            col, ins = 0, len(lines)
            new_lines = [""] + _emit(_key_text(key), val, col, None, lines, None, None)
        elif keys:
            lk = keys[-1]
            kl, col = anc.lc.key(lk)
            ins = _block_span(lines, kl, col, len(lines)) + 1
            new_lines = _emit(_key_text(key), val, col, None, lines, None, None)
        else:
            raise EditError(f"Abschnitt {'.'.join(keypath[:i])} ist leer, bitte als Block anlegen")
        lines[ins:ins] = [x + "\n" for x in new_lines]
    return "".join(lines)


def replace_blocks(path: Path, changes: list, history: Path | None = None, dry: bool = False) -> dict:
    """changes: [(keypath, value), ...]. Alles oder nichts: Gegenpruefung ueber die ganze Datei.

    Liefert die neue Datei als einfaches dict (wie yaml.safe_load)."""
    text = path.read_text(encoding="utf-8")
    if text and not text.endswith("\n"):
        text += "\n"
    try:
        old_plain = yaml.safe_load(text) or {}
    except Exception as e:  # noqa: BLE001
        raise EditError(f"project.yaml nicht lesbar: {e}") from e
    expected = old_plain
    new_text = text
    for keypath, value in changes:
        if not keypath or not all(isinstance(k, str) and k for k in keypath):
            raise EditError("ungültiger Schlüsselpfad")
        expected = _set_plain(expected, keypath, _plain(value))
        try:
            new_text = _replace_one(new_text, list(keypath), value)
        except EditError:
            raise
        except Exception as e:  # noqa: BLE001
            raise EditError(f"{'.'.join(keypath)} lässt sich nicht schreiben: {e}") from e
    try:
        _rt().load(new_text)
        new_plain = yaml.safe_load(new_text) or {}
    except Exception as e:  # noqa: BLE001
        raise EditError(f"Ergebnis wäre kein gültiges YAML: {e}") from e
    if new_plain != expected:
        diff = [k for k in set(expected) | set(new_plain) if expected.get(k) != new_plain.get(k)]
        raise EditError(f"Gegenprüfung fehlgeschlagen in: {', '.join(map(str, diff))}")
    if not dry and new_text != text:
        _write(path, new_text, history)
    return new_plain


def _write(path: Path, new_text: str, history: Path | None) -> None:
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
