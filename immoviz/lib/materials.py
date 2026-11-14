"""Materialbibliothek (Cycles). UV-Koordinaten sind in Metern: x = Laufmeter, y = Hoehe."""
from __future__ import annotations

import colorsys


def hex_rgb(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb)


class Nodes:
    def __init__(self, mat):
        self.nt = mat.node_tree
        self.nt.nodes.clear()
        self.out = self.new("ShaderNodeOutputMaterial")

    def new(self, t, **kw):
        n = self.nt.nodes.new(t)
        for k, v in kw.items():
            if k in n.inputs:
                n.inputs[k].default_value = v
            else:
                setattr(n, k, v)
        return n

    def link(self, a, b):
        self.nt.links.new(a, b)

    def math(self, op, a, b=None, clamp=False):
        n = self.new("ShaderNodeMath", operation=op)
        n.use_clamp = clamp
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                n.inputs[i].default_value = v
            else:
                self.link(v, n.inputs[i])
        return n.outputs[0]

    def mix_rgb(self, fac, a, b, blend="MIX"):
        n = self.new("ShaderNodeMix", data_type="RGBA", blend_type=blend)
        ins = {s.identifier: s for s in n.inputs}
        for sock, v in (("Factor_Float", fac), ("A_Color", a), ("B_Color", b)):
            if isinstance(v, (int, float)):
                ins[sock].default_value = v
            elif isinstance(v, tuple):
                ins[sock].default_value = (*v[:3], 1.0)
            else:
                self.link(v, ins[sock])
        return next(o for o in n.outputs if o.identifier == "Result_Color")

    def uv(self):
        tc = self.new("ShaderNodeTexCoord")
        sep = self.new("ShaderNodeSeparateXYZ")
        self.link(tc.outputs["UV"], sep.inputs[0])
        return tc, sep

    def principled(self, color, rough=0.8, metal=0.0, **kw):
        p = self.new("ShaderNodeBsdfPrincipled")
        if isinstance(color, tuple):
            p.inputs["Base Color"].default_value = (*color, 1.0)
        else:
            self.link(color, p.inputs["Base Color"])
        p.inputs["Roughness"].default_value = rough
        p.inputs["Metallic"].default_value = metal
        for k, v in kw.items():
            p.inputs[k].default_value = v
        self.link(p.outputs[0], self.out.inputs["Surface"])
        return p


def _new(bpy, name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    return m


def plaster(bpy, name, color, rustika=None, sockel=None, sockel_color=None, var=0.07, bump=0.18):
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    noise = N.new("ShaderNodeTexNoise", Scale=0.9, Detail=6.0, Roughness=0.55)
    N.link(tc.outputs["UV"], noise.inputs["Vector"])
    fine = N.new("ShaderNodeTexNoise", Scale=60.0, Detail=8.0, Roughness=0.7)
    N.link(tc.outputs["UV"], fine.inputs["Vector"])
    base = N.mix_rgb(N.math("MULTIPLY", noise.outputs["Fac"], var * 2), color,
                     tuple(c * 0.86 for c in color))
    # Verschmutzung nach unten und unter Gesimsen leicht dunkler
    height = N.math("MULTIPLY", N.math("SUBTRACT", 1.0, N.math("DIVIDE", sep.outputs["Y"], 2.5, clamp=True)), 0.18)
    base = N.mix_rgb(height, base, tuple(c * 0.75 for c in color))
    groove = None
    if rustika:
        z0, z1, sp = rustika
        rel = N.math("DIVIDE", N.math("SUBTRACT", sep.outputs["Y"], z0), sp)
        fr = N.math("FRACT", rel)
        g = N.math("LESS_THAN", fr, 0.035 / sp)
        inside = N.math("MULTIPLY", N.math("GREATER_THAN", sep.outputs["Y"], z0),
                        N.math("LESS_THAN", sep.outputs["Y"], z1))
        groove = N.math("MULTIPLY", g, inside)
        base = N.mix_rgb(N.math("MULTIPLY", groove, 0.55), base, tuple(c * 0.55 for c in color))
    if sockel:
        s = N.math("LESS_THAN", sep.outputs["Y"], sockel)
        base = N.mix_rgb(s, base, sockel_color or tuple(c * 0.7 for c in color))
    p = N.principled(base, rough=0.9)
    p.inputs["Specular IOR Level"].default_value = 0.35
    bmp = N.new("ShaderNodeBump", Strength=bump, Distance=0.004)
    h = fine.outputs["Fac"]
    if groove is not None:
        h = N.math("SUBTRACT", h, N.math("MULTIPLY", groove, 4.0))
    N.link(h, bmp.inputs["Height"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def simple(bpy, name, color, rough=0.5, metal=0.0, **kw):
    m = _new(bpy, name)
    N = Nodes(m)
    N.principled(color, rough, metal, **kw)
    return m


def glass(bpy, name, tint=(0.82, 0.88, 0.86), rough=0.0):
    m = _new(bpy, name)
    N = Nodes(m)
    p = N.principled(tint, rough=rough)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.52
    p.inputs["Thin Wall"].default_value = True
    return m


def zinc(bpy, name, color, seam=0.48):
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    fr = N.math("FRACT", N.math("DIVIDE", sep.outputs["X"], seam))
    s = N.math("LESS_THAN", fr, 0.04)
    noise = N.new("ShaderNodeTexNoise", Scale=3.0, Detail=4.0)
    N.link(tc.outputs["UV"], noise.inputs["Vector"])
    base = N.mix_rgb(N.math("MULTIPLY", noise.outputs["Fac"], 0.25), color, tuple(c * 1.25 for c in color))
    p = N.principled(base, rough=0.42, metal=0.55)
    bmp = N.new("ShaderNodeBump", Strength=0.6, Distance=0.01)
    N.link(s, bmp.inputs["Height"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def oak(bpy, name, color):
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    wave = N.new("ShaderNodeTexWave", Scale=6.0, Distortion=6.0, Detail=4.0)
    wave.bands_direction = "Y"
    N.link(tc.outputs["UV"], wave.inputs["Vector"])
    base = N.mix_rgb(N.math("MULTIPLY", wave.outputs["Fac"], 0.35), color, tuple(c * 0.6 for c in color))
    N.principled(base, rough=0.45, **{"Coat Weight": 0.25})
    return m


def interior(bpy, name, color, emit=(1.0, 0.62, 0.32)):
    """Innenraumkarte hinter Fenstern. Emission wird ueber das Lichtszenario gesetzt."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    noise = N.new("ShaderNodeTexNoise", Scale=1.3, Detail=3.0)
    N.link(tc.outputs["UV"], noise.inputs["Vector"])
    base = N.mix_rgb(noise.outputs["Fac"], color, tuple(c * 1.6 for c in color))
    p = N.principled(base, rough=0.9)
    p.inputs["Emission Color"].default_value = (*emit, 1.0)
    p.inputs["Emission Strength"].default_value = 0.0
    m["emit_base"] = 1.0
    return m


def cobbles(bpy, name, color=(0.12, 0.115, 0.11)):
    m = _new(bpy, name)
    N = Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    br = N.new("ShaderNodeTexBrick", Scale=7.0)
    br.inputs["Mortar Size"].default_value = 0.025
    br.inputs["Color1"].default_value = (*color, 1)
    br.inputs["Color2"].default_value = (*[c * 0.75 for c in color], 1)
    br.inputs["Mortar"].default_value = (*[c * 0.4 for c in color], 1)
    N.link(tc.outputs["Object"], br.inputs["Vector"])
    p = N.principled(br.outputs["Color"], rough=0.75)
    bmp = N.new("ShaderNodeBump", Strength=0.6, Distance=0.02)
    N.link(br.outputs["Fac"], bmp.inputs["Height"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def foliage(bpy, name, color):
    m = _new(bpy, name)
    N = Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    noise = N.new("ShaderNodeTexNoise", Scale=3.2, Detail=10.0, Roughness=0.65)
    N.link(tc.outputs["Object"], noise.inputs["Vector"])
    col = N.mix_rgb(noise.outputs["Fac"], tuple(c * 0.55 for c in color), tuple(c * 1.5 for c in color))
    diff = N.new("ShaderNodeBsdfDiffuse")
    N.link(col, diff.inputs["Color"])
    tr = N.new("ShaderNodeBsdfTranslucent")
    N.link(col, tr.inputs["Color"])
    leaf = N.new("ShaderNodeMixShader")
    leaf.inputs["Fac"].default_value = 0.35
    N.link(diff.outputs[0], leaf.inputs[1])
    N.link(tr.outputs[0], leaf.inputs[2])
    holes = N.math("GREATER_THAN", noise.outputs["Fac"], 0.42)
    tp = N.new("ShaderNodeBsdfTransparent")
    mix = N.new("ShaderNodeMixShader")
    N.link(holes, mix.inputs["Fac"])
    N.link(tp.outputs[0], mix.inputs[1])
    N.link(leaf.outputs[0], mix.inputs[2])
    N.link(mix.outputs[0], N.out.inputs["Surface"])
    return m


# Typische Wiener Gruenderzeit- und Nachkriegsfassaden (gedeckt, warm, nicht zu hell)
NEIGHBOUR_PALETTE = ["#D6C29A", "#C7B28E", "#BFB2A2", "#CFA98A", "#B4ADA0", "#D2C3A6",
                     "#B89A78", "#C9BDA6", "#A9A092", "#CDB396", "#B8AB92", "#CDBB94", "#9E8F7C", "#C8A08F"]


def build_library(bpy, cfg_mats: dict) -> dict:
    c = {k: hex_rgb(v["color"]) for k, v in cfg_mats.items() if not k.startswith("_")}
    L = {}
    alt = cfg_mats.get("_altbau", {})
    L["fassade"] = plaster(bpy, "fassade", c["fassade"], rustika=alt.get("rustika"),
                           sockel=alt.get("sockel"), sockel_color=c.get("sockel"))
    L["laibung"] = plaster(bpy, "laibung", tuple(x * 0.97 for x in c["fassade"]), bump=0.1)
    L["stuck"] = plaster(bpy, "stuck", c.get("stuck", c["fassade"]), var=0.04, bump=0.1)
    L["fenster"] = simple(bpy, "fenster", c["fenster"], 0.35)
    L["blech"] = simple(bpy, "blech", tuple(x * 0.85 for x in c["fassade"]), 0.5, 0.2)
    L["glas"] = glass(bpy, "glas")
    L["glas_dach"] = glass(bpy, "glas_dach", (0.5, 0.55, 0.58), 0.02)
    L["glas_gelaender"] = glass(bpy, "glas_gelaender", (0.9, 0.95, 0.93))
    L["zink"] = zinc(bpy, "zink", c["zink"])
    L["rahmen_dunkel"] = simple(bpy, "rahmen_dunkel", c["rahmen_dunkel"], 0.35, 0.4)
    L["haustor"] = oak(bpy, "haustor", c["haustor"])
    L["dach_flach"] = simple(bpy, "dach_flach", (0.09, 0.09, 0.09), 0.95)
    L["kamin"] = plaster(bpy, "kamin", (0.42, 0.40, 0.37), bump=0.2)
    L["solar"] = simple(bpy, "solar", (0.01, 0.015, 0.035), 0.12, 0.3)
    L["putz_hof"] = plaster(bpy, "putz_hof", (0.70, 0.67, 0.61))
    L["innen"] = simple(bpy, "innen", (0.025, 0.024, 0.022), 0.95)
    L["innen_a"] = interior(bpy, "innen_a", (0.035, 0.032, 0.03))
    L["innen_b"] = interior(bpy, "innen_b", (0.30, 0.26, 0.21))
    L["innen_c"] = interior(bpy, "innen_c", (0.12, 0.10, 0.08))
    L["asphalt"] = plaster(bpy, "asphalt", (0.028, 0.028, 0.03), var=0.12, bump=0.3)
    L["gehsteig"] = plaster(bpy, "gehsteig", (0.16, 0.155, 0.15), var=0.1, bump=0.25)
    L["parkstreifen"] = plaster(bpy, "parkstreifen", (0.06, 0.06, 0.062), var=0.1)
    L["zebra"] = simple(bpy, "zebra", (0.7, 0.7, 0.68), 0.7)
    L["pflaster"] = cobbles(bpy, "pflaster")
    L["seil"] = simple(bpy, "seil", (0.02, 0.02, 0.02), 0.5)
    L["balkon_lochblech"] = simple(bpy, "balkon_lochblech", (0.015, 0.015, 0.016), 0.45, 0.6)
    L["leuchte"] = simple(bpy, "leuchte", (0.25, 0.26, 0.27), 0.4, 0.6, **{"Emission Color": (1.0, 0.75, 0.45, 1.0)})
    L["randstein"] = simple(bpy, "randstein", (0.33, 0.32, 0.31), 0.7)
    L["hof"] = plaster(bpy, "hof", (0.3, 0.29, 0.27))
    L["stamm"] = simple(bpy, "stamm", (0.09, 0.07, 0.05), 0.85)
    L["laub"] = foliage(bpy, "laub", (0.055, 0.12, 0.03))
    L["nachbar_dach"] = simple(bpy, "nachbar_dach", (0.06, 0.06, 0.062), 0.75, 0.2)
    L["dach_ziegel"] = plaster(bpy, "dach_ziegel", (0.20, 0.075, 0.045), var=0.15, bump=0.3)
    L["dach_blech"] = zinc(bpy, "dach_blech", (0.11, 0.115, 0.12))
    L["nachbar_rahmen"] = simple(bpy, "nachbar_rahmen", (0.75, 0.74, 0.7), 0.4)
    L["fenster_dunkel"] = simple(bpy, "fenster_dunkel", (0.012, 0.014, 0.016), 0.04, 0.0, **{"Specular IOR Level": 0.9})
    L["terrasse"] = plaster(bpy, "terrasse", (0.32, 0.31, 0.29), var=0.05, bump=0.1)
    for name, col in (("auto_dunkelgrau", (0.05, 0.055, 0.06)), ("auto_schwarz", (0.012, 0.012, 0.014)),
                      ("auto_weiss", (0.75, 0.75, 0.74)), ("auto_silber", (0.38, 0.39, 0.4)),
                      ("auto_blau", (0.02, 0.04, 0.09))):
        L[name] = simple(bpy, name, col, 0.18, 0.5, **{"Coat Weight": 1.0, "Coat Roughness": 0.03})
    L["autoglas"] = simple(bpy, "autoglas", (0.01, 0.012, 0.014), 0.03, 0.0)
    L["reifen"] = simple(bpy, "reifen", (0.015, 0.015, 0.015), 0.8)
    for i, h in enumerate(NEIGHBOUR_PALETTE):
        L[f"nachbar_{i}"] = plaster(bpy, f"nachbar_{i}", tuple(c * 0.66 for c in hex_rgb(h)), sockel=0.6)
    return L


def set_interior_emission(bpy, strength: float):
    for name, k in (("innen_a", 0.0), ("innen_b", 1.0), ("innen_c", 0.45)):
        m = bpy.data.materials.get(name)
        if not m:
            continue
        for n in m.node_tree.nodes:
            if n.type == "BSDF_PRINCIPLED":
                n.inputs["Emission Strength"].default_value = strength * k * 6.0


SEASONS = {
    # Laubfarbe (linear), Anteil Loecher in der Krone (0 = dicht), Krone sichtbar
    "fruehling":   ((0.085, 0.19, 0.03), 0.47, True),
    "sommer":      ((0.045, 0.10, 0.025), 0.40, True),
    "spaetsommer": ((0.06, 0.10, 0.025), 0.42, True),
    "herbst":      ((0.32, 0.15, 0.025), 0.50, True),
    "winter":      ((0.05, 0.04, 0.03), 0.80, False),
}


def set_season(bpy, season: str):
    col, holes, visible = SEASONS.get(season, SEASONS["sommer"])
    m = bpy.data.materials.get("laub")
    if m:
        for n in m.node_tree.nodes:
            if n.type == "MIX" and n.data_type == "RGBA":
                ins = {s.identifier: s for s in n.inputs}
                ins["A_Color"].default_value = (*[c * 0.55 for c in col], 1)
                ins["B_Color"].default_value = (*[c * 1.5 for c in col], 1)
            if n.type == "MATH" and n.operation == "GREATER_THAN":
                n.inputs[1].default_value = holes
    ob = bpy.data.objects.get("baeume_kronen")
    if ob:
        ob.hide_render = not visible
