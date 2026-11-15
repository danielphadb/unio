"""Strassenbaeume: glaubwuerdige Kronenformen als Vorlagen plus Instanzen.

Position, Hoehe und Kronendurchmesser kommen aus dem Baumkataster (context.json), Korrekturen aus
`trees_override` in project.yaml (Abgleich mit Street View und Orthofoto).

Krone: mehrere ueberlagerte, unregelmaessig verformte Kugelkoerper plus kleine Laubbueschel am Rand,
weich schattiert, mit dem Laubmaterial (Loecher und Jahreszeit kommen aus dem Material). Es gibt wenige
Vorlagen in Einheitsgroesse (rundlich und saeulenfoermig); jeder Baum ist ein Objekt, das eine Vorlage
teilt und nur skaliert und gedreht wird. Staemme und Hauptaeste liegen in einem gemeinsamen Mesh.
"""
from __future__ import annotations

import math
import random

import bpy
import bmesh  # erst nach bpy verfuegbar

from . import meshkit as K

SAEULE = ("fastigiata", "columnare", "columnaris", "pyramidalis", "säulen", "saeulen", "erecta", "italica")
N_RUND, N_SAEULE = 5, 3


def form_of(tree: dict) -> str:
    if tree.get("form"):
        return tree["form"]
    s = (tree.get("species") or "").lower()
    # Saeulensorten gehen im Alter in die Breite (Saeulenhainbuche): ab Krone > 45 % der Hoehe breit-oval
    if any(k in s for k in SAEULE) and float(tree.get("crown", 0)) <= 0.45 * float(tree.get("height", 1)):
        return "saeule"
    return "rund"


def apply_override(trees: list[dict], override) -> list[dict]:
    """Wendet trees_override an. Eintraege: {pos, tol, remove} | {pos, tol, height, crown, form, move} | {add, pos, ...}.

    Ein Baum wird ueber seine Position gefunden (naechster Katasterbaum innerhalb tol, Standard 2 m)."""
    out = [dict(t) for t in trees]
    for o in override or []:
        x, y = o["pos"]
        if o.get("add"):
            out.append({"pos": [x, y], "species": o.get("species", ""), "height": o.get("height", 8),
                        "crown": o.get("crown", 5), "form": o.get("form"),
                        **{k: o[k] for k in ("base", "z") if k in o}})     # z: Fusspunkt ueber +-0 (z. B. Dachgarten)
            continue
        tol = o.get("tol", 2.0)
        cand = [(math.hypot(t["pos"][0] - x, t["pos"][1] - y), i) for i, t in enumerate(out)]
        cand = [c for c in cand if c[0] <= tol]
        if not cand:
            continue
        i = min(cand)[1]
        if o.get("remove"):
            out.pop(i)
            continue
        for k in ("height", "crown", "form", "base"):
            if k in o:
                out[i][k] = o[k]
        if "move" in o:
            out[i]["pos"] = list(o["move"])
    return out


def _blob(bm, rng, center, radius, squash, subdiv, noise):
    """Verformter Kugelkoerper: Radius je Vertex ueber eine glatte Zufallsfunktion gestaucht und gedehnt."""
    r = bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    ph = [(rng.uniform(0, 6.28), rng.uniform(0, 6.28), rng.uniform(0, 6.28)) for _ in range(3)]
    fq = [rng.uniform(1.4, 2.2), rng.uniform(2.6, 3.8), rng.uniform(4.5, 6.5)]
    for v in r["verts"]:
        x, y, z = v.co
        d = 0.0
        for (a, b, c), f, w in zip(ph, fq, (0.55, 0.3, 0.15)):
            d += w * math.sin(f * x + a) * math.sin(f * y + b) * math.sin(f * z + c + x * 1.3)
        k = radius * (1.0 + noise * d * 2.2)
        v.co = (center[0] + x * k, center[1] + y * k, center[2] + z * k * squash)


def _template(name: str, form: str, seed: int):
    """Kronenvorlage in Einheitsgroesse: x, y in [-1, 1], z in [0, 2] (Unterkante bis Wipfel)."""
    rng = random.Random(seed)
    bm = bmesh.new()

    def profil(t):
        """Kronenradius (0 bis 1) ueber die Hoehe t (0 unten, 1 Wipfel)."""
        if form == "saeule":      # schmal-oval, groesste Breite im unteren Drittel, spitz zulaufend
            return max(0.0, math.sin(math.pi * (0.10 + 0.86 * t ** 0.8))) ** 0.75
        # rundlich: unten rasch breit, groesste Breite knapp unter der Mitte, oben gewoelbte Kuppel
        return max(0.0, 1.0 - abs((t - 0.42) / (0.42 if t < 0.42 else 0.58)) ** 2.2) ** 0.5

    # Fuellkoerper innen, damit man nicht durch die Krone sieht
    for k in range(5):
        t = 0.24 + 0.14 * k
        _blob(bm, rng, (rng.uniform(-0.08, 0.08), rng.uniform(-0.08, 0.08), 2 * t), 0.66 * profil(t) + 0.05, 1.1, 2, 0.06)
    # Laubballen dicht auf der Huelle: viele mittelgrosse, verformte Koerper ergeben eine unruhige, weiche Silhouette
    n = 64 if form == "rund" else 54
    for k in range(n):
        t = (k + rng.random()) / n
        t = 0.12 + 0.85 * t      # Ballen nicht unter die Kronenunterkante haengen lassen
        a = k * 2.399963 + rng.uniform(-0.25, 0.25)        # goldener Winkel verteilt gleichmaessig
        rr = profil(t) * rng.uniform(0.74, 0.88)
        size = rng.uniform(0.19, 0.30) * (0.75 + 0.35 * profil(t)) * (0.8 if form == "saeule" else 1.0)
        _blob(bm, rng, (math.cos(a) * rr, math.sin(a) * rr, 2 * t + rng.uniform(-0.05, 0.05)),
              size, rng.uniform(0.75, 1.0) * (1.35 if form == "saeule" else 1.0), 2, 0.16)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    me.update()
    return me


def build(trees, mats, coll, terrain, radius: float, hero_poly=None):
    """Baut alle Baeume im Radius. Kronen: Objekte `baeume_kronen.*` (im Winter ausgeblendet, siehe materials)."""
    tmpl = {"rund": [_template(f"baum_rund_{k}", "rund", 100 + k) for k in range(N_RUND)],
            "saeule": [_template(f"baum_saeule_{k}", "saeule", 200 + k) for k in range(N_SAEULE)]}
    for group in tmpl.values():
        for me in group:
            me.materials.append(mats["laub"])
    sub = bpy.data.collections.new("Baumkronen")
    coll.children.link(sub)
    trunks = K.MeshBuilder("baeume_staemme", ["stamm"])
    rng = random.Random(11)
    count = 0
    for t in trees:
        x, y = t["pos"]
        if math.hypot(x, y) > radius:
            continue
        if hero_poly and K.point_in_poly(x, y, hero_poly):
            continue
        H, C = float(t["height"]), float(t["crown"])
        form = form_of(t)
        if form == "saeule":
            C = max(1.8, C)
            base = t.get("base", max(1.6, H * 0.16))
        else:
            base = t.get("base", max(2.0, min(H * 0.42, H - C * 0.95)))
        base = min(base, H - 1.0)
        zg = float(t["z"]) if "z" in t else terrain(x, y)
        me = rng.choice(tmpl[form])
        ob = bpy.data.objects.new("baeume_kronen", me)
        ob.location = (x, y, zg + base)
        ob.scale = (C / 2 * rng.uniform(0.93, 1.07), C / 2 * rng.uniform(0.93, 1.07), (H - base) / 2)
        ob.rotation_euler = (0, 0, rng.uniform(0, 2 * math.pi))
        sub.objects.link(ob)
        count += 1
        # Stamm mit Verjuengung, dazu Hauptaeste in die Krone (im Winter und durch Laubluecken sichtbar)
        r0 = 0.05 + C * 0.012 + H * 0.003
        top = base + (H - base) * (0.75 if form == "saeule" else 0.55)
        _limb(trunks, (x, y, zg), (x + rng.uniform(-0.1, 0.1), y + rng.uniform(-0.1, 0.1), zg + top), r0 * 1.15, r0 * 0.35, 8, 3)
        for k in range(3 if form == "saeule" else 5):
            a = 2 * math.pi * k / 5 + rng.uniform(-0.4, 0.4)
            z0 = base + (top - base) * rng.uniform(-0.15, 0.55)
            reach = C / 2 * (0.35 if form == "saeule" else rng.uniform(0.55, 0.8))
            z1 = min(H - 0.4, z0 + reach * rng.uniform(0.8, 1.4) + (H - base) * 0.15)
            _limb(trunks, (x, y, zg + max(1.6, z0)), (x + math.cos(a) * reach, y + math.sin(a) * reach, zg + z1),
                  r0 * 0.45, r0 * 0.12, 5, 1)
    trunks.to_object(bpy, mats, coll, smooth=True)
    return count


def _limb(mb, p0, p1, r0, r1, seg, rings):
    """Verjuengtes Rohr von p0 nach p1 (Stamm oder Ast)."""
    dx, dy, dz = p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]
    L = math.sqrt(dx * dx + dy * dy + dz * dz)
    if L < 0.05:
        return
    ax = (dx / L, dy / L, dz / L)
    ref = (0, 0, 1) if abs(ax[2]) < 0.9 else (1, 0, 0)
    u = (ax[1] * ref[2] - ax[2] * ref[1], ax[2] * ref[0] - ax[0] * ref[2], ax[0] * ref[1] - ax[1] * ref[0])
    ul = math.sqrt(sum(c * c for c in u))
    u = tuple(c / ul for c in u)
    v = (ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0])
    prev = None
    for k in range(rings + 1):
        t = k / rings
        r = r0 + (r1 - r0) * (t ** 0.7)
        c = (p0[0] + dx * t, p0[1] + dy * t, p0[2] + dz * t)
        ring = [(c[0] + r * (math.cos(a) * u[0] + math.sin(a) * v[0]),
                 c[1] + r * (math.cos(a) * u[1] + math.sin(a) * v[1]),
                 c[2] + r * (math.cos(a) * u[2] + math.sin(a) * v[2]))
                for a in (2 * math.pi * i / seg for i in range(seg))]
        if prev:
            for i in range(seg):
                j = (i + 1) % seg
                mb.poly([prev[i], prev[j], ring[j], ring[i]], None, "stamm")
        prev = ring
