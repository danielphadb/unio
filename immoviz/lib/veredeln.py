"""Higgsfield-Veredelung: Prompt je Kamera aus Projektbausteinen (projects/<objekt>/veredeln.yaml) plus Regelblock.

Bisher lag der Prompt-Generator nur im Scratchpad einer Cloud-Sitzung (Runde 9). Ab Noma Runde 10 steht er im Repo,
damit jede Sitzung dieselben Prompts erzeugt: `immoviz.py veredeln-prompt --projekt <p> --cam <k> --licht <l>`.

veredeln.yaml: `runde`, `modell` (Higgsfield-Parameter), `referenzen` (Higgsfield-Media-IDs der Stilreferenzen, nur
intern), `bausteine` (kopf, objekt, bepflanzung, moebel, referenzen, schluss), `licht` {name: text},
`motive` {kamera: text}. Reihenfolge im Prompt: kopf, objekt, motiv, bepflanzung, moebel, referenzen (wenn Referenzen
mitgehen), licht, schluss, Regelblock (lib/freigabe.prompt_regeln). Der Ablauf danach (schutz voll, grading,
nachkontrolle, Pruefbogen) steht in veredeln.yaml unter `ablauf`.
"""
from __future__ import annotations

import json
from pathlib import Path

import yaml


def laden(pdir: Path) -> dict:
    return yaml.safe_load((Path(pdir) / "veredeln.yaml").read_text(encoding="utf-8"))


def _art(pdir: Path, kamera: str) -> str:
    try:
        W = yaml.safe_load((Path(pdir) / "wohnungen.yaml").read_text(encoding="utf-8")) or {}
    except OSError:
        return "aussen"
    return "innen" if any(kamera.startswith(f"{w}_") for w in (W.get("wohnungen") or {})) else "aussen"


def prompt(pdir: Path, kamera: str, licht: str) -> dict:
    """{prompt, regeln, warnungen, referenzen, modell}"""
    from . import freigabe as FG
    V = laden(pdir)
    B = V["bausteine"]
    motiv = (V.get("motive") or {}).get(kamera)
    if not motiv:
        raise KeyError(f"veredeln.yaml: kein Motiv fuer Kamera {kamera}")
    if licht not in (V.get("licht") or {}):
        raise KeyError(f"veredeln.yaml: kein Licht {licht}")
    refs = V.get("referenzen") or []
    teile = [B["kopf"], B["objekt"], motiv, B.get("bepflanzung"), B.get("moebel"),
             B.get("referenzen") if refs else None, V["licht"][licht], B["schluss"]]
    text = "\n\n".join(" ".join(str(t).split()) for t in teile if t)
    R = FG.prompt_regeln(Path(pdir), kamera, _art(pdir, kamera))
    return {"prompt": FG.anhaengen(text, R), "regeln": R["regeln"], "warnungen": R["warnungen"],
            "referenzen": refs, "modell": V.get("modell"), "runde": V.get("runde")}


def main_cli(a) -> int:
    pdir = Path(a.projekt)
    r = prompt(pdir, a.cam, a.licht)
    if a.out:
        out = Path(a.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(r["prompt"] + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in r.items() if k != "prompt"}, ensure_ascii=False))
    print(r["prompt"])
    return 1 if r["warnungen"] else 0
