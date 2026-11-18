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

    def vmath(self, op, a, b=None, c=None):
        """Vektor-Mathematik; Rueckgabe Vektor- bzw. Wertausgang (DOT_PRODUCT, LENGTH)."""
        n = self.new("ShaderNodeVectorMath", operation=op)
        for i, v in enumerate((a, b, c)):
            if v is None:
                continue
            if isinstance(v, (tuple, list)):
                n.inputs[i].default_value = v
            elif isinstance(v, (int, float)):
                n.inputs[i].default_value = (v, v, v)
            else:
                self.link(v, n.inputs[i])
        return n.outputs["Value"] if op in ("DOT_PRODUCT", "LENGTH", "DISTANCE") else n.outputs["Vector"]

    def sep(self, vec):
        n = self.new("ShaderNodeSeparateXYZ")
        self.link(vec, n.inputs[0])
        return n.outputs

    def comb(self, x, y, z):
        n = self.new("ShaderNodeCombineXYZ")
        for i, v in enumerate((x, y, z)):
            if isinstance(v, (int, float)):
                n.inputs[i].default_value = v
            else:
                self.link(v, n.inputs[i])
        return n.outputs[0]

    def attr(self, name, typ="GEOMETRY"):
        n = self.new("ShaderNodeAttribute")
        n.attribute_type = typ
        n.attribute_name = name
        return n

    def noise(self, vec, scale, detail=4.0, rough=0.5, dim="3D"):
        n = self.new("ShaderNodeTexNoise", Scale=scale, Detail=detail, Roughness=rough)
        n.noise_dimensions = dim
        if vec is not None:
            self.link(vec, n.inputs["Vector"])
        return n

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


def plaster(bpy, name, color, rustika=None, sockel=None, sockel_color=None, var=0.07, bump=0.18, detail=True):
    """Putz. Mit detail (Standard): Koernung und Kellenstruktur im Relief, leichte Fleckigkeit, Schmutz in Kehlen und
    unter Gesimsen und Fensterbaenken (Umgebungsverdeckung, nur an senkrechten Flaechen), Laufspuren darunter und
    gerundete Kanten (Bevel-Shader, 2 cm). Ohne detail die schlichte Fassung fuer Boden und Daecher."""
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
    h = fine.outputs["Fac"]
    if detail:
        geo = N.new("ShaderNodeNewGeometry")
        senk = N.math("SUBTRACT", 1.0, N.math("ABSOLUTE", N.sep(geo.outputs["Normal"])[2]))      # 1 an Wänden
        # Fleckigkeit: grosse weiche Flecken plus mittlere Wolken, gegen Wiederholung auch je Objekt versetzt
        oi = N.new("ShaderNodeObjectInfo")
        vec = N.vmath("ADD", tc.outputs["UV"], N.comb(N.math("MULTIPLY", oi.outputs["Random"], 37.0),
                                                      N.math("MULTIPLY", oi.outputs["Random"], 53.0), 0.0))
        fleck = N.noise(vec, 0.35, 3.0, 0.5)
        wolke = N.noise(vec, 2.2, 5.0, 0.6)
        f = N.math("MULTIPLY", N.math("SUBTRACT", fleck.outputs["Fac"], 0.5), 0.5)
        f = N.math("ADD", f, N.math("MULTIPLY", N.math("SUBTRACT", wolke.outputs["Fac"], 0.5), 0.35))
        base = N.mix_rgb(N.math("MULTIPLY", N.math("MAXIMUM", f, 0.0), 0.9), base, tuple(c * 0.82 for c in color))
        base = N.mix_rgb(N.math("MULTIPLY", N.math("MAXIMUM", N.math("MULTIPLY", f, -1.0), 0.0), 0.7), base,
                         tuple(min(1.0, c * 1.08) for c in color))
        # Schmutz in Kehlen (lokale Verdeckung) und unter Ueberstaenden (Verdeckung nach oben), Laufspuren darunter
        ao = N.new("ShaderNodeAmbientOcclusion", Distance=0.35)
        ao.only_local = True
        ao.samples = 8
        oben = N.new("ShaderNodeAmbientOcclusion", Distance=1.4)
        oben.only_local = True
        oben.samples = 8
        oben.inputs["Normal"].default_value = (0.0, 0.0, 1.0)
        streif = N.noise(N.comb(N.math("MULTIPLY", sep.outputs["X"], 7.0), N.math("MULTIPLY", sep.outputs["Y"], 0.35), 0.0),
                         1.0, 4.0, 0.6)
        kehle = N.math("MULTIPLY", N.math("SUBTRACT", 1.0, ao.outputs["AO"]), 0.55)
        lauf = N.math("MULTIPLY", N.math("SUBTRACT", 1.0, oben.outputs["AO"]),
                      N.math("MULTIPLY", N.math("ADD", 0.25, streif.outputs["Fac"]), 0.5))
        dreck = N.math("MULTIPLY", N.math("ADD", kehle, lauf), senk)
        base = N.mix_rgb(N.math("MINIMUM", dreck, 0.6), base, tuple(c * 0.42 for c in (color[0] * 0.95, color[1] * 0.93, color[2] * 0.9)))
        # Koernung (mm) und Kellenstruktur (cm) im Relief
        korn = N.noise(tc.outputs["UV"], 380.0, 2.0, 0.5)
        kelle = N.noise(tc.outputs["UV"], 9.0, 6.0, 0.65)
        h = N.math("ADD", N.math("MULTIPLY", fine.outputs["Fac"], 0.6),
                   N.math("ADD", N.math("MULTIPLY", korn.outputs["Fac"], 0.5), N.math("MULTIPLY", kelle.outputs["Fac"], 0.5)))
    p = N.principled(base, rough=0.9)
    p.inputs["Specular IOR Level"].default_value = 0.35
    bmp = N.new("ShaderNodeBump", Strength=bump, Distance=0.004)
    if groove is not None:
        h = N.math("SUBTRACT", h, N.math("MULTIPLY", groove, 4.0))
    N.link(h, bmp.inputs["Height"])
    if detail:
        bev = N.new("ShaderNodeBevel", Radius=0.02)
        bev.samples = 4
        tx = textur(N, bpy, "putz", tc.outputs["UV"])      # optional CC0-Putzkorn (immoviz.py texturen)
        if tx and tx[2] is not None:
            tx[2].node.inputs["Strength"].default_value = 0.35
            N.link(tx[2], bev.inputs["Normal"])
        N.link(bev.outputs["Normal"], bmp.inputs["Normal"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def ziegel(bpy, name, color, reihe=0.33, rough=0.85):
    """Dachdeckung in Reihen (Ziegel, Schiefer): v der UV laeuft in Falllinie, je Reihe eine dunkle Fuge,
    dazu fleckige Alterung. Die Daecher der Umgebung liefern dafuer UV in Metern (lib/roofs.py, add_faces)."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    noise = N.new("ShaderNodeTexNoise", Scale=0.35, Detail=5.0, Roughness=0.6)
    N.link(tc.outputs["UV"], noise.inputs["Vector"])
    fleck = N.new("ShaderNodeTexNoise", Scale=4.0, Detail=3.0, Roughness=0.7)
    N.link(tc.outputs["UV"], fleck.inputs["Vector"])
    base = N.mix_rgb(noise.outputs["Fac"], tuple(c * 0.72 for c in color), tuple(min(1.0, c * 1.2) for c in color))
    base = N.mix_rgb(N.math("MULTIPLY", fleck.outputs["Fac"], 0.35), base, tuple(c * 0.6 for c in color))
    fuge = N.math("LESS_THAN", N.math("FRACT", N.math("DIVIDE", sep.outputs["Y"], reihe)), 0.14)
    base = N.mix_rgb(N.math("MULTIPLY", fuge, 0.45), base, tuple(c * 0.45 for c in color))
    p = N.principled(base, rough=rough)
    p.inputs["Specular IOR Level"].default_value = 0.3
    bmp = N.new("ShaderNodeBump", Strength=0.5, Distance=0.02)
    N.link(fuge, bmp.inputs["Height"])
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
    """Zink- und Blechdeckung mit Stehfalz (Falzabstand `seam`, gerundeter Falz als Relief), Patina-Wolken,
    leichte Beulen zwischen den Falzen und dunklere Laufspuren."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    fr = N.math("FRACT", N.math("DIVIDE", sep.outputs["X"], seam))
    d = N.math("ABSOLUTE", N.math("SUBTRACT", fr, 0.02))
    falz = N.math("POWER", N.math("MAXIMUM", N.math("SUBTRACT", 1.0, N.math("DIVIDE", d, 0.03)), 0.0), 0.5)
    noise = N.new("ShaderNodeTexNoise", Scale=3.0, Detail=4.0)
    N.link(tc.outputs["UV"], noise.inputs["Vector"])
    patina = N.noise(tc.outputs["UV"], 0.5, 3.0)
    lauf = N.noise(N.comb(N.math("MULTIPLY", sep.outputs["X"], 9.0), N.math("MULTIPLY", sep.outputs["Y"], 0.4), 0.0), 1.0, 3.0)
    base = N.mix_rgb(N.math("MULTIPLY", noise.outputs["Fac"], 0.25), color, tuple(c * 1.25 for c in color))
    base = N.mix_rgb(N.math("MULTIPLY", patina.outputs["Fac"], 0.35), base, tuple(min(1.0, c * 1.35 + 0.01) for c in color))
    base = N.mix_rgb(N.math("MULTIPLY", N.math("GREATER_THAN", lauf.outputs["Fac"], 0.6), 0.3), base, tuple(c * 0.7 for c in color))
    p = N.principled(base, rough=0.42, metal=0.55)
    N.link(N.math("ADD", 0.34, N.math("MULTIPLY", patina.outputs["Fac"], 0.2)), p.inputs["Roughness"])
    beule = N.noise(tc.outputs["UV"], 1.6, 2.0)
    bmp = N.new("ShaderNodeBump", Strength=0.7, Distance=0.012)
    N.link(N.math("ADD", falz, N.math("MULTIPLY", beule.outputs["Fac"], 0.08)), bmp.inputs["Height"])
    bev = N.new("ShaderNodeBevel", Radius=0.008)
    bev.samples = 4
    N.link(bev.outputs["Normal"], bmp.inputs["Normal"])
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
    p = N.principled(base, rough=0.45, **{"Coat Weight": 0.25})
    bmp = N.new("ShaderNodeBump", Strength=0.15, Distance=0.003)      # Maserung im Relief, gerundete Kanten
    N.link(wave.outputs["Fac"], bmp.inputs["Height"])
    bev = N.new("ShaderNodeBevel", Radius=0.006)
    bev.samples = 4
    N.link(bev.outputs["Normal"], bmp.inputs["Normal"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
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
    # Weltkoordinaten: Kronen sind skalierte Instanzen weniger Vorlagen, das Laubmuster bleibt so gleich fein
    geo = N.new("ShaderNodeNewGeometry")
    noise = N.new("ShaderNodeTexNoise", Scale=3.2, Detail=10.0, Roughness=0.65)
    N.link(geo.outputs["Position"], noise.inputs["Vector"])
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


# ======================================================================= Objekt- und Materialbibliothek (Ausbau 18.11.2026)
TEXTUR_DIR = None      # wird von lib/assets/texturen.py gesetzt (immoviz/assets/texturen), Bilder optional


def _bild(bpy, pfad, farbe=True):
    img = bpy.data.images.get(pfad.name) or bpy.data.images.load(str(pfad), check_existing=True)
    img.colorspace_settings.name = "sRGB" if farbe else "Non-Color"
    return img


def textur(N, bpy, schluessel, vec_m, staerke=None):
    """CC0-Textur (Poly Haven, siehe immoviz/assets/LIZENZEN.md) als Variation: liefert (Helligkeitsfaktor um 1,
    Rauheit, Normal) oder None, wenn die Bilder nicht geladen sind (immoviz.py texturen). Zwei gegeneinander
    gedrehte Abtastungen, ueber Rauschen gemischt, gegen sichtbare Kachelung."""
    from .assets import texturen as TX
    t = TX.dateien(schluessel)
    if not t:
        return None
    groesse = TX.TEXTUREN[schluessel][1]
    v1 = N.vmath("SCALE", vec_m)
    v1.node.inputs["Scale"].default_value = 1.0 / groesse
    v2 = N.vmath("ADD", N.vmath("MULTIPLY", N.comb(N.math("MULTIPLY", N.sep(vec_m)[1], 1.0 / groesse),
                                                   N.math("MULTIPLY", N.sep(vec_m)[0], -1.0 / groesse), 0.0),
                                (0.83, 0.83, 1.0)), (0.37, 0.61, 0.0))
    misch = N.noise(vec_m, 0.12, 2.0, 0.5)
    fac = N.math("MULTIPLY", N.math("SUBTRACT", misch.outputs["Fac"], 0.5), 6.0)
    fac = N.math("ADD", fac, 0.5, clamp=True)

    def abtasten(datei, farbe):
        outs = []
        for v in (v1, v2):
            n = N.new("ShaderNodeTexImage")
            n.image = _bild(bpy, datei, farbe)
            n.interpolation = "Linear"
            N.link(v, n.inputs["Vector"])
            outs.append(n.outputs["Color"])
        return N.mix_rgb(fac, outs[0], outs[1])
    diff = abtasten(t["diff"], True)
    bw = N.new("ShaderNodeRGBToBW")
    N.link(diff, bw.inputs[0])
    hell = N.math("DIVIDE", bw.outputs[0], TX.TEXTUREN[schluessel][2])      # mittlere Helligkeit -> Faktor um 1
    rough = None
    if t.get("rough"):
        r = abtasten(t["rough"], False)
        bwr = N.new("ShaderNodeRGBToBW")
        N.link(r, bwr.inputs[0])
        rough = bwr.outputs[0]
    nrm = None
    if t.get("nor"):
        nm = N.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = 0.8
        if staerke is not None:      # Detailfaktor (Ausgang): Normal Map nur im Nahbereich, gegen Moire
            N.link(N.math("MULTIPLY", staerke, 0.8), nm.inputs["Strength"])
        N.link(abtasten(t["nor"], False), nm.inputs["Color"])
        nrm = nm.outputs["Normal"]
    return hell, rough, nrm


def _farbe_mal(N, col, fak):
    """Farbe (Tupel oder Ausgang) mal Faktor (Ausgang)."""
    return N.mix_rgb(1.0, col, N.comb(fak, fak, fak), blend="MULTIPLY")


def detail_faktor(N, fuss0=4.0, fuss1=20.0):
    """1 = volle Feinstruktur, 0 = ausgeblendet. Gegen Moire bei flachem Blick (Strassenkamera auf 1,6 m): Mass ist der
    Pixel-Fussabdruck auf der Flaeche, proportional zu Abstand / cos(Blickwinkel zur Flaechennormale). Bei 1,6 m
    Augenhoehe entspricht fuss0 = 4 rund 2,5 m und fuss1 = 20 rund 5,7 m Abstand; aus der Drohne (steiler Blick, grosser
    Abstand) ist die Koernung ohnehin kleiner als ein Pixel. Cycles hat keine Mipmaps, deshalb hier im Shader."""
    geo = N.new("ShaderNodeNewGeometry")
    cam = N.new("ShaderNodeCameraData")
    cosw = N.math("MAXIMUM", N.math("ABSOLUTE", N.vmath("DOT_PRODUCT", geo.outputs["Incoming"], geo.outputs["Normal"])),
                  0.02)
    fuss = N.math("DIVIDE", cam.outputs["View Distance"], cosw)
    return N.math("SUBTRACT", 1.0, N.math("DIVIDE", N.math("SUBTRACT", fuss, fuss0), fuss1 - fuss0), clamp=True)


def asphalt(bpy, name, color=(0.030, 0.030, 0.032), flick=True, textur_key="asphalt", hell=False):
    """Asphalt mit Gesteinskorn, Flickstellen (aeltere und neuere Flaechen mit Naht), feinen Rissen und
    Fahrspuren. UV in Metern (Draufsicht).
    Runde 7 Korrektur (Moire): feine Waagrechtstreifen im Vordergrund der Strassenkameras kamen von Feinstruktur unter
    der Pixelgroesse (Korn 140/m als harte Farbspritzer und Relief, 6-mm-Risse und Naehte, Foto-Textur 1,5 mm je
    Texel samt Normal Map), die bei flachem Blick gestaucht und vom Entrauschen zu Linien verschmiert wurde. Jetzt:
    Korn als weiche Helligkeit statt Schwellwert, alle Feinanteile mit `detail_faktor` ausgeblendet (Mittelwert statt
    Muster), Naehte breiter (1,2 cm), Risse und Naehte erst weiter hinten ausgeblendet, Relief nur im Nahbereich."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    uvm = tc.outputs["UV"]
    det = detail_faktor(N)
    det_weit = detail_faktor(N, 10.0, 60.0)
    korn = N.noise(uvm, 140.0, 2.0, 0.6)
    grob = N.noise(uvm, 0.6, 4.0, 0.55)
    base = N.mix_rgb(N.math("MULTIPLY", grob.outputs["Fac"], 0.5), color, tuple(c * 1.35 for c in color))
    # Gesteinskorn: weiche Rampe statt harter Schwelle; mit dem Detailfaktor zum Mittelwert (Anteil heller Koerner)
    spr = N.math("MULTIPLY", N.math("SUBTRACT", korn.outputs["Fac"], 0.55), 6.0, clamp=True)
    spr = N.math("ADD", N.math("MULTIPLY", spr, det), N.math("MULTIPLY", N.math("SUBTRACT", 1.0, det), 0.2))
    base = N.mix_rgb(N.math("MULTIPLY", spr, 0.4), base, tuple(min(1.0, c * 1.9) for c in color))
    h = N.math("MULTIPLY", korn.outputs["Fac"], det)
    if flick:
        # Flickstellen: Voronoi-Zellen (3 bis 8 m), ein Teil davon dunkler (neuer) oder heller (aelter)
        vor = N.new("ShaderNodeTexVoronoi", Scale=0.22)
        vor.feature = "F1"
        N.link(N.vmath("ADD", uvm, N.vmath("SCALE", N.noise(uvm, 0.3, 2.0).outputs["Color"])), vor.inputs["Vector"])
        zelle = vor.outputs["Color"]
        zs = N.new("ShaderNodeSeparateColor")
        N.link(zelle, zs.inputs[0])
        neu = N.math("LESS_THAN", zs.outputs[0], 0.18)
        alt = N.math("GREATER_THAN", zs.outputs[0], 0.86)
        base = N.mix_rgb(N.math("MULTIPLY", neu, 0.7), base, tuple(c * 0.78 for c in color))
        base = N.mix_rgb(N.math("MULTIPLY", alt, 0.6), base, tuple(min(1.0, c * 1.18) for c in color))
        kante = N.new("ShaderNodeTexVoronoi", Scale=0.22)
        kante.feature = "DISTANCE_TO_EDGE"
        N.link(N.vmath("ADD", uvm, N.vmath("SCALE", N.noise(uvm, 0.3, 2.0).outputs["Color"])), kante.inputs["Vector"])
        naht = N.math("MULTIPLY", N.math("LESS_THAN", kante.outputs["Distance"], 0.012), N.math("ADD", neu, alt))
        base = N.mix_rgb(N.math("MULTIPLY", naht, N.math("MULTIPLY", det_weit, 0.5)), base, tuple(c * 0.5 for c in color))
        # feine Risse (erst weiter hinten ausgeblendet)
        riss = N.new("ShaderNodeTexVoronoi", Scale=1.3)
        riss.feature = "DISTANCE_TO_EDGE"
        N.link(N.vmath("ADD", uvm, N.vmath("SCALE", N.noise(uvm, 2.0, 3.0).outputs["Color"])), riss.inputs["Vector"])
        rmask = N.math("MULTIPLY", N.math("LESS_THAN", riss.outputs["Distance"], 0.006),
                       N.math("GREATER_THAN", N.noise(uvm, 0.4, 2.0).outputs["Fac"], 0.56))
        base = N.mix_rgb(N.math("MULTIPLY", rmask, N.math("MULTIPLY", det_weit, 0.7)), base, tuple(c * 0.35 for c in color))
        h = N.math("SUBTRACT", h, N.math("MULTIPLY", rmask, N.math("MULTIPLY", det, 2.0)))
    rough = 0.82
    nrm = None
    tx = textur(N, bpy, textur_key, uvm, staerke=det) if textur_key else None
    if tx:
        hell_, rough_, nrm = tx
        # Foto-Helligkeit: Abweichung von 1 nur im Nahbereich, sonst Mittelwert
        base = _farbe_mal(N, base, N.math("ADD", N.math("MULTIPLY", N.math("SUBTRACT", hell_, 1.0),
                                                        N.math("MULTIPLY", det, 0.8)), 1.0))
    p = N.principled(base, rough=rough)
    p.inputs["Specular IOR Level"].default_value = 0.4
    if tx and tx[1] is not None:
        r_tex = N.math("ADD", N.math("MULTIPLY", tx[1], 0.5), 0.45, clamp=True)
        N.link(N.math("ADD", N.math("MULTIPLY", r_tex, det), N.math("MULTIPLY", N.math("SUBTRACT", 1.0, det), rough)),
               p.inputs["Roughness"])
    bmp = N.new("ShaderNodeBump", Strength=0.35, Distance=0.004)
    N.link(N.math("MULTIPLY", det, 0.35), bmp.inputs["Strength"])
    N.link(h, bmp.inputs["Height"])
    if nrm is not None:
        N.link(nrm, bmp.inputs["Normal"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def platten(bpy, name, color=(0.30, 0.29, 0.27), raster=(0.5, 0.5), fuge=0.006):
    """Betonplatten (Gehsteig): Raster in Metern, Fugen, je Platte leicht andere Helligkeit, abgenutzte Kanten."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    ix = N.math("FLOOR", N.math("DIVIDE", sep.outputs["X"], raster[0]))
    iy = N.math("FLOOR", N.math("DIVIDE", sep.outputs["Y"], raster[1]))
    fx = N.math("FRACT", N.math("DIVIDE", sep.outputs["X"], raster[0]))
    fy = N.math("FRACT", N.math("DIVIDE", sep.outputs["Y"], raster[1]))
    wn = N.new("ShaderNodeTexWhiteNoise")
    wn.noise_dimensions = "3D"
    N.link(N.comb(ix, iy, 0.0), wn.inputs["Vector"])
    base = N.mix_rgb(wn.outputs["Value"], tuple(c * 0.85 for c in color), tuple(min(1.0, c * 1.12) for c in color))
    fl = N.noise(tc.outputs["UV"], 1.5, 4.0)
    base = N.mix_rgb(N.math("MULTIPLY", fl.outputs["Fac"], 0.35), base, tuple(c * 0.7 for c in color))
    fu = N.math("MAXIMUM", N.math("LESS_THAN", N.math("MINIMUM", fx, N.math("SUBTRACT", 1.0, fx)), fuge / raster[0]),
                N.math("LESS_THAN", N.math("MINIMUM", fy, N.math("SUBTRACT", 1.0, fy)), fuge / raster[1]))
    base = N.mix_rgb(N.math("MULTIPLY", fu, 0.8), base, tuple(c * 0.35 for c in color))
    tx = textur(N, bpy, "platten", tc.outputs["UV"])
    if tx:
        base = _farbe_mal(N, base, N.math("ADD", N.math("MULTIPLY", N.math("SUBTRACT", tx[0], 1.0), 0.6), 1.0))
    p = N.principled(base, rough=0.86)
    bmp = N.new("ShaderNodeBump", Strength=0.5, Distance=0.006)
    N.link(N.math("SUBTRACT", N.noise(tc.outputs["UV"], 90.0, 2.0).outputs["Fac"], N.math("MULTIPLY", fu, 3.0)), bmp.inputs["Height"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def granit(bpy, name, color=(0.30, 0.295, 0.285), rough=0.62):
    """Granit (Bordstein, Sockel): Sprenkel aus Feldspat, Quarz und Glimmer, leicht glaenzend, Kante gerundet."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    v = tc.outputs["Object"]
    spr = N.new("ShaderNodeTexVoronoi", Scale=180.0)
    N.link(v, spr.inputs["Vector"])
    zs = N.new("ShaderNodeSeparateColor")
    N.link(spr.outputs["Color"], zs.inputs[0])
    base = N.mix_rgb(zs.outputs[0], tuple(c * 0.55 for c in color), tuple(min(1.0, c * 1.35) for c in color))
    dunkel = N.math("LESS_THAN", zs.outputs[1], 0.18)
    base = N.mix_rgb(N.math("MULTIPLY", dunkel, 0.85), base, (0.025, 0.025, 0.028))
    base = N.mix_rgb(N.math("MULTIPLY", N.noise(v, 1.2, 3.0).outputs["Fac"], 0.3), base, tuple(c * 0.75 for c in color))
    p = N.principled(base, rough=rough)
    bmp = N.new("ShaderNodeBump", Strength=0.15, Distance=0.002)
    N.link(spr.outputs["Distance"], bmp.inputs["Height"])
    bev = N.new("ShaderNodeBevel", Radius=0.012)
    bev.samples = 4
    N.link(bev.outputs["Normal"], bmp.inputs["Normal"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def pflaster_granit(bpy, name, color=(0.13, 0.125, 0.12), stein=0.10):
    """Granit-Kleinsteinpflaster (Wien): Steine um 10 cm in versetzten Reihen, je Stein eigener Farbton
    (grau, rotgrau, blaugrau), gewoelbte Oberflaeche, dunkle Sandfugen. UV in Metern."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    wob = N.noise(tc.outputs["UV"], 3.0, 2.0)
    vec = N.vmath("ADD", tc.outputs["UV"], N.vmath("MULTIPLY", wob.outputs["Color"], (0.012, 0.012, 0.0)))
    vs = N.sep(vec)
    zeile = N.math("FLOOR", N.math("DIVIDE", vs[1], stein))
    versatz = N.math("MULTIPLY", N.math("FRACT", N.math("MULTIPLY", zeile, 0.618)), stein)
    sx = N.math("ADD", vs[0], versatz)
    breite = stein * 1.05
    spalte = N.math("FLOOR", N.math("DIVIDE", sx, breite))
    fx = N.math("FRACT", N.math("DIVIDE", sx, breite))
    fy = N.math("FRACT", N.math("DIVIDE", vs[1], stein))
    wn = N.new("ShaderNodeTexWhiteNoise")
    wn.noise_dimensions = "3D"
    N.link(N.comb(spalte, zeile, 0.0), wn.inputs["Vector"])
    zc = N.new("ShaderNodeSeparateColor")
    N.link(wn.outputs["Color"], zc.inputs[0])
    base = N.mix_rgb(zc.outputs[0], tuple(c * 0.7 for c in color), tuple(min(1.0, c * 1.45) for c in color))
    base = N.mix_rgb(N.math("MULTIPLY", N.math("GREATER_THAN", zc.outputs[1], 0.7), 0.6), base,
                     (color[0] * 1.25, color[1] * 0.95, color[2] * 0.85))
    base = N.mix_rgb(N.math("MULTIPLY", N.math("LESS_THAN", zc.outputs[1], 0.25), 0.5), base,
                     (color[0] * 0.85, color[1] * 0.92, color[2] * 1.1))
    # Woelbung je Stein: 1 in der Mitte, 0 an der Fuge
    dx = N.math("MULTIPLY", N.math("SUBTRACT", fx, 0.5), 2.0)
    dy = N.math("MULTIPLY", N.math("SUBTRACT", fy, 0.5), 2.0)
    r = N.math("MAXIMUM", N.math("ABSOLUTE", dx), N.math("ABSOLUTE", dy))
    woelb = N.math("SUBTRACT", 1.0, N.math("POWER", r, 4.0))
    fuge = N.math("GREATER_THAN", r, 0.86)
    base = N.mix_rgb(N.math("MULTIPLY", fuge, 0.85), base, tuple(c * 0.35 for c in color))
    p = N.principled(base, rough=0.7)
    N.link(N.math("ADD", 0.55, N.math("MULTIPLY", fuge, 0.4)), p.inputs["Roughness"])
    bmp = N.new("ShaderNodeBump", Strength=0.7, Distance=0.012)
    N.link(N.math("ADD", woelb, N.math("MULTIPLY", N.noise(tc.outputs["UV"], 120.0, 2.0).outputs["Fac"], 0.15)), bmp.inputs["Height"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def lack(bpy, name, color, rough=0.38, bevel=0.006):
    """Lackierte Teile (Fensterrahmen Holz, Metall): leichte Rauheitsunterschiede, gerundete Kanten."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    nz = N.noise(tc.outputs["Object"], 6.0, 3.0)
    base = N.mix_rgb(N.math("MULTIPLY", nz.outputs["Fac"], 0.12), color, tuple(c * 0.85 for c in color))
    p = N.principled(base, rough=rough)
    N.link(N.math("ADD", rough - 0.08, N.math("MULTIPLY", nz.outputs["Fac"], 0.16)), p.inputs["Roughness"])
    if bevel:
        bev = N.new("ShaderNodeBevel", Radius=bevel)
        bev.samples = 4
        N.link(bev.outputs["Normal"], p.inputs["Normal"])
    return m


def glas_neu(bpy, name, tint=(0.80, 0.86, 0.84), rough=0.0):
    """Floatglas: IOR 1,52, gruenliche Kante, dünnwandig mit leichter Unruhe (Spiegelung nicht spiegelglatt)."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    p = N.principled(tint, rough=rough)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.52
    p.inputs["Thin Wall"].default_value = True
    bmp = N.new("ShaderNodeBump", Strength=0.02, Distance=0.002)
    N.link(N.noise(tc.outputs["Object"], 0.8, 2.0).outputs["Fac"], bmp.inputs["Height"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def innenraum(bpy, name, glas=False, licht=(1.0, 0.70, 0.42)):
    """Interior Mapping: aus einer Flaeche in der Fensteroeffnung (meshkit.innen_karte) ein Raum mit Rueckwand,
    Seitenwaenden, Boden, Decke, Moebel-Silhouette, Vorhang und zufaelligem Licht (nachts mehr Raeume an).
    glas=True legt die Spiegelung einer Scheibe darueber (Fenster ohne eigene Glasflaeche, Umgebung)."""
    m = _new(bpy, name)
    m["immoviz_innenraum"] = 1
    N = Nodes(m)
    geo = N.new("ShaderNodeNewGeometry")
    D = N.vmath("SCALE", geo.outputs["Incoming"])
    D.node.inputs["Scale"].default_value = -1.0
    Nn = geo.outputs["Normal"]
    T = N.vmath("NORMALIZE", N.vmath("CROSS_PRODUCT", (0.0, 0.0, 1.0), Nn))
    dx = N.vmath("DOT_PRODUCT", D, T)
    dy = N.sep(D)[2]
    dz = N.math("MULTIPLY", N.vmath("DOT_PRODUCT", D, Nn), -1.0)
    st = N.sep(N.attr("fenster").outputs["Vector"])
    s_, t_ = st[0], st[1]
    info = N.new("ShaderNodeSeparateColor")
    N.link(N.attr("info").outputs["Color"], info.inputs[0])
    w, h, rnd = info.outputs[0], info.outputs[1], info.outputs[2]
    def zuf(k):
        return N.math("FRACT", N.math("MULTIPLY", rnd, k))
    nacht = N.new("ShaderNodeValue")
    nacht.label = nacht.name = "nacht"
    nacht.outputs[0].default_value = 0.0
    # Raum: halbe Breite, Boden (unter der Bruestung; Tueren und Schaufenster: Boden an der Schwelle), Decke, Tiefe
    wr = N.math("ADD", N.math("MULTIPLY", w, 0.5), N.math("ADD", 0.9, N.math("MULTIPLY", zuf(3.1), 1.2)))
    hoch = N.math("GREATER_THAN", h, 2.3)
    y0 = N.math("MULTIPLY", N.math("SUBTRACT", 1.0, hoch), -0.88)
    y0 = N.math("SUBTRACT", y0, 0.04)
    y1 = N.math("ADD", h, N.math("ADD", 0.45, N.math("MULTIPLY", zuf(5.3), 0.4)))
    tiefe = N.math("ADD", 3.5, N.math("MULTIPLY", zuf(7.7), 2.5))
    sg = N.math("SIGN", dx)
    tx = N.math("DIVIDE", N.math("SUBTRACT", wr, N.math("MULTIPLY", s_, sg)), N.math("MAXIMUM", N.math("ABSOLUTE", dx), 1e-4))
    auf = N.math("GREATER_THAN", dy, 0.0)
    num_y = N.math("ADD", N.math("MULTIPLY", auf, N.math("SUBTRACT", y1, t_)),
                   N.math("MULTIPLY", N.math("SUBTRACT", 1.0, auf), N.math("SUBTRACT", t_, y0)))
    ty = N.math("DIVIDE", num_y, N.math("MAXIMUM", N.math("ABSOLUTE", dy), 1e-4))
    tz = N.math("DIVIDE", tiefe, N.math("MAXIMUM", dz, 1e-4))
    tm = N.math("MINIMUM", tx, N.math("MINIMUM", ty, tz))
    hx = N.math("ADD", s_, N.math("MULTIPLY", dx, tm))
    hy = N.math("ADD", t_, N.math("MULTIPLY", dy, tm))
    hz = N.math("MULTIPLY", dz, tm)
    ist_rueck = N.math("LESS_THAN", N.math("SUBTRACT", tz, tm), 1e-3)
    ist_y = N.math("MULTIPLY", N.math("LESS_THAN", N.math("SUBTRACT", ty, tm), 1e-3), N.math("SUBTRACT", 1.0, ist_rueck))
    ist_boden = N.math("MULTIPLY", ist_y, N.math("SUBTRACT", 1.0, auf))
    ist_decke = N.math("MULTIPLY", ist_y, auf)
    # Farben: Wand (warmweiss bis beige), Boden (Parkett), Decke, Moebel an der Rueckwand
    wand = N.mix_rgb(zuf(11.3), (0.55, 0.52, 0.47), (0.62, 0.58, 0.50))
    wand = N.mix_rgb(N.math("GREATER_THAN", zuf(17.9), 0.85), wand, (0.42, 0.45, 0.47))
    seite = _farbe_mal(N, wand, N.math("ADD", 0.0, 0.78))
    dielen = N.math("FRACT", N.math("MULTIPLY", hx, 5.5))
    boden = N.mix_rgb(N.math("MULTIPLY", N.math("LESS_THAN", dielen, 0.06), 0.6),
                      N.mix_rgb(zuf(23.1), (0.16, 0.09, 0.045), (0.26, 0.16, 0.08)), (0.06, 0.035, 0.02))
    decke = (0.66, 0.64, 0.60)
    # Moebel: Sofa oder Sideboard unten, Bild oder Regal oben (je Raum aus dem Zufall), nur an der Rueckwand
    mx = N.math("ADD", N.math("MULTIPLY", N.math("SUBTRACT", zuf(29.3), 0.5), 1.2), 0.0)
    mb = N.math("ADD", 0.6, N.math("MULTIPLY", zuf(31.7), 1.4))
    unten = N.math("MULTIPLY", N.math("LESS_THAN", N.math("ABSOLUTE", N.math("SUBTRACT", hx, mx)), mb),
                   N.math("LESS_THAN", hy, N.math("ADD", y0, N.math("ADD", 0.45, N.math("MULTIPLY", zuf(37.1), 0.5)))))
    bild = N.math("MULTIPLY", N.math("LESS_THAN", N.math("ABSOLUTE", N.math("SUBTRACT", hx, N.math("MULTIPLY", mx, -0.7))),
                                     N.math("ADD", 0.25, N.math("MULTIPLY", zuf(41.3), 0.5))),
                  N.math("LESS_THAN", N.math("ABSOLUTE", N.math("SUBTRACT", hy, N.math("ADD", y0, 1.75))), 0.32))
    bild = N.math("MULTIPLY", bild, N.math("GREATER_THAN", zuf(43.7), 0.35))
    tuer = N.math("MULTIPLY", N.math("LESS_THAN", N.math("ABSOLUTE", N.math("SUBTRACT", hx, N.math("SUBTRACT", wr, 0.9))), 0.45),
                  N.math("LESS_THAN", hy, N.math("ADD", y0, 2.1)))
    tuer = N.math("MULTIPLY", tuer, N.math("GREATER_THAN", zuf(47.9), 0.55))
    rueck = N.mix_rgb(N.math("MULTIPLY", unten, 0.9), wand, N.mix_rgb(zuf(53.1), (0.05, 0.05, 0.055), (0.22, 0.16, 0.11)))
    rueck = N.mix_rgb(N.math("MULTIPLY", bild, 0.85), rueck, N.mix_rgb(zuf(59.3), (0.08, 0.10, 0.12), (0.35, 0.28, 0.20)))
    rueck = N.mix_rgb(N.math("MULTIPLY", tuer, 0.9), rueck, (0.03, 0.028, 0.026))
    farbe = N.mix_rgb(ist_rueck, seite, rueck)
    farbe = N.mix_rgb(ist_boden, farbe, boden)
    farbe = N.mix_rgb(ist_decke, farbe, decke)
    # Tageslicht faellt nach hinten ab, Decke dunkler als Boden am Fenster
    tag = N.math("MULTIPLY", N.math("EXPONENT", N.math("MULTIPLY", hz, -0.32)), 0.55)
    tag = N.math("MULTIPLY", tag, N.math("SUBTRACT", 1.0, N.math("MULTIPLY", ist_decke, 0.45)))
    # Vorhang: seitliche Schals (Breite aus dem Zufall) oder durchscheinende Store ueber das ganze Fenster
    hb = N.math("MULTIPLY", w, 0.5)
    schal = N.math("MULTIPLY", w, N.math("ADD", 0.08, N.math("MULTIPLY", zuf(61.3), 0.3)))
    rand = N.math("GREATER_THAN", N.math("ABSOLUTE", s_), N.math("SUBTRACT", hb, schal))
    rand = N.math("MULTIPLY", rand, N.math("GREATER_THAN", zuf(67.1), 0.25))
    store = N.math("MULTIPLY", N.math("LESS_THAN", zuf(71.9), 0.32), 0.62)
    falte = N.math("ADD", 0.82, N.math("MULTIPLY", N.math("SINE", N.math("MULTIPLY", s_, 38.0)), 0.12))
    vfarbe = _farbe_mal(N, N.mix_rgb(zuf(73.3), (0.72, 0.70, 0.64), (0.60, 0.52, 0.42)), falte)
    vorh = N.math("MAXIMUM", rand, store)
    # Licht: Anteil beleuchteter Raeume 12 % am Tag bis 55 % in der Nacht
    p_an = N.math("ADD", 0.12, N.math("MULTIPLY", nacht.outputs[0], 0.43))
    an = N.math("LESS_THAN", zuf(79.1), p_an)
    farbe_v = N.mix_rgb(vorh, farbe, vfarbe)
    diff = N.new("ShaderNodeBsdfDiffuse")
    N.link(_farbe_mal(N, farbe_v, N.math("MAXIMUM", N.math("MULTIPLY", tag, N.math("SUBTRACT", 1.0, N.math("MULTIPLY", vorh, 0.3))), 0.0)), diff.inputs["Color"])
    em = N.new("ShaderNodeEmission")
    N.link(N.mix_rgb(1.0, farbe_v, licht, blend="MULTIPLY"), em.inputs["Color"])
    stark = N.math("MULTIPLY", an, N.math("ADD", 0.12, N.math("MULTIPLY", nacht.outputs[0], 1.1)))
    stark = N.math("MULTIPLY", stark, N.math("ADD", 0.4, N.math("MULTIPLY", zuf(83.9), 0.9)))
    N.link(stark, em.inputs["Strength"])
    add = N.new("ShaderNodeAddShader")
    N.link(diff.outputs[0], add.inputs[0])
    N.link(em.outputs[0], add.inputs[1])
    out = add.outputs[0]
    if glas:
        gl = N.new("ShaderNodeBsdfGlossy")
        gl.inputs["Roughness"].default_value = 0.03
        fr = N.new("ShaderNodeFresnel")
        fr.inputs["IOR"].default_value = 1.52
        mix = N.new("ShaderNodeMixShader")
        N.link(N.math("ADD", fr.outputs[0], 0.04), mix.inputs["Fac"])
        N.link(out, mix.inputs[1])
        N.link(gl.outputs[0], mix.inputs[2])
        out = mix.outputs[0]
    N.link(out, N.out.inputs["Surface"])
    return m


def autolack(bpy, name):
    """Autolack: Grundfarbe je Objekt (Objektfarbe), Klarlack."""
    m = _new(bpy, name)
    N = Nodes(m)
    oi = N.new("ShaderNodeObjectInfo")
    p = N.principled(oi.outputs["Color"], rough=0.25, metal=0.35)
    p.inputs["Coat Weight"].default_value = 1.0
    p.inputs["Coat Roughness"].default_value = 0.03
    return m


def leuchtmittel(bpy, name, color, strength=0.0):
    """Leuchtende Flaeche (Diffusor, Scheinwerfer, Kennzeichen hell); Staerke setzt assets.leuchten je Licht."""
    m = _new(bpy, name)
    N = Nodes(m)
    p = N.principled(tuple(c * 0.8 for c in color), rough=0.3)
    p.inputs["Emission Color"].default_value = (*color, 1.0)
    p.inputs["Emission Strength"].default_value = strength
    return m


def laub_art(bpy, name, farben_sommer):
    """Blaetter mit Farbe je Blatt (Attribut info.r, Zufall) ueber eine Farbrampe; set_season setzt die Rampe
    (Fruehling, Sommer, Herbst) und den Blattverlust (info.g). Durchscheinend, zweiseitig."""
    m = _new(bpy, name)
    m["immoviz_laub"] = 1
    N = Nodes(m)
    info = N.new("ShaderNodeSeparateColor")
    N.link(N.attr("info").outputs["Color"], info.inputs[0])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.name = ramp.label = "jahreszeit"
    el = ramp.color_ramp.elements
    el[0].position, el[1].position = 0.0, 1.0
    el.new(0.5)
    for e, c in zip(el, farben_sommer):
        e.color = (*c, 1.0)
    N.link(info.outputs[0], ramp.inputs["Fac"])
    geo = N.new("ShaderNodeNewGeometry")
    nz = N.noise(geo.outputs["Position"], 1.4, 3.0)
    col = N.mix_rgb(N.math("MULTIPLY", nz.outputs["Fac"], 0.35), ramp.outputs["Color"],
                    N.mix_rgb(1.0, ramp.outputs["Color"], (0.6, 0.6, 0.6), blend="MULTIPLY"))
    p = N.new("ShaderNodeBsdfPrincipled")
    N.link(col, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.55
    p.inputs["Specular IOR Level"].default_value = 0.35
    tr = N.new("ShaderNodeBsdfTranslucent")
    N.link(N.mix_rgb(1.0, col, (1.25, 1.35, 0.7), blend="MULTIPLY"), tr.inputs["Color"])
    blatt = N.new("ShaderNodeMixShader")
    blatt.inputs["Fac"].default_value = 0.32
    N.link(p.outputs[0], blatt.inputs[1])
    N.link(tr.outputs[0], blatt.inputs[2])
    verlust = N.new("ShaderNodeValue")
    verlust.name = verlust.label = "verlust"
    verlust.outputs[0].default_value = 0.0
    weg = N.math("LESS_THAN", info.outputs[1], verlust.outputs[0])
    tp = N.new("ShaderNodeBsdfTransparent")
    mix = N.new("ShaderNodeMixShader")
    N.link(weg, mix.inputs["Fac"])
    N.link(blatt.outputs[0], mix.inputs[1])
    N.link(tp.outputs[0], mix.inputs[2])
    N.link(mix.outputs[0], N.out.inputs["Surface"])
    return m


def rinde(bpy, name, color=(0.075, 0.062, 0.05), platane=False):
    """Rinde: Laengsrisse (gestrecktes Rauschen in Objektkoordinaten), bei Platanen abblaetternde Flecken."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    o = N.sep(tc.outputs["Object"])
    v = N.comb(N.math("MULTIPLY", o[0], 9.0), N.math("MULTIPLY", o[1], 9.0), N.math("MULTIPLY", o[2], 1.2))
    riss = N.noise(v, 3.0, 6.0, 0.6)
    base = N.mix_rgb(riss.outputs["Fac"], tuple(c * 0.55 for c in color), tuple(min(1.0, c * 1.5) for c in color))
    if platane:
        fl = N.new("ShaderNodeTexVoronoi", Scale=6.0)
        N.link(tc.outputs["Object"], fl.inputs["Vector"])
        zs = N.new("ShaderNodeSeparateColor")
        N.link(fl.outputs["Color"], zs.inputs[0])
        base = N.mix_rgb(zs.outputs[0], (0.15, 0.145, 0.11), (0.08, 0.075, 0.05))
        base = N.mix_rgb(N.math("GREATER_THAN", zs.outputs[1], 0.6), base, (0.22, 0.21, 0.17))
    p = N.principled(base, rough=0.92)
    bmp = N.new("ShaderNodeBump", Strength=0.8, Distance=0.01)
    N.link(riss.outputs["Fac"], bmp.inputs["Height"])
    N.link(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def ring_material(bpy, name, color, ring_color, ringe, rough=0.4, metal=0.3):
    """Farbe mit Ringen auf Hoehe (UV v = Hoehe ueber dem Fusspunkt): Poller gruen-weiss oder rot-weiss."""
    m = _new(bpy, name)
    N = Nodes(m)
    tc, sep = N.uv()
    maske = None
    for z0, z1 in ringe:
        r = N.math("MULTIPLY", N.math("GREATER_THAN", sep.outputs["Y"], z0), N.math("LESS_THAN", sep.outputs["Y"], z1))
        maske = r if maske is None else N.math("MAXIMUM", maske, r)
    col = N.mix_rgb(maske, color, ring_color)
    N.principled(col, rough=rough, metal=metal)
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
    L["fenster"] = lack(bpy, "fenster", c["fenster"], 0.35)
    L["blech"] = simple(bpy, "blech", tuple(x * 0.85 for x in c["fassade"]), 0.5, 0.2)
    L["glas"] = glas_neu(bpy, "glas")
    L["glas_dach"] = glass(bpy, "glas_dach", (0.5, 0.55, 0.58), 0.02)
    L["glas_gelaender"] = glass(bpy, "glas_gelaender", (0.9, 0.95, 0.93))
    L["zink"] = zinc(bpy, "zink", c["zink"])
    L["rahmen_dunkel"] = lack(bpy, "rahmen_dunkel", c["rahmen_dunkel"], 0.35)
    L["rahmen_dunkel"].node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.4
    # Gelaender-Metall (Staebe, Handlauf, Klemmprofile): eigener Name, damit die Ebenen es als Klasse gelaender
    # erkennen (lib/ebenen.py); Farbe materials.gelaender, sonst wie rahmen_dunkel
    # pulverbeschichtet: nicht metallisch, matt (Probe 18.11.: Metallic 0,5 spiegelte im Streiflicht fast weiss)
    L["gelaender_metall"] = lack(bpy, "gelaender_metall", c.get("gelaender", c["rahmen_dunkel"]), 0.55)
    L["haustor"] = oak(bpy, "haustor", c["haustor"])
    L["dach_flach"] = simple(bpy, "dach_flach", (0.09, 0.09, 0.09), 0.95)
    st = cfg_mats.get("_strasse") or {}
    L["kamin"] = plaster(bpy, "kamin", (0.42, 0.40, 0.37), bump=0.2)
    L["solar"] = simple(bpy, "solar", (0.01, 0.015, 0.035), 0.12, 0.3)
    L["putz_hof"] = plaster(bpy, "putz_hof", (0.70, 0.67, 0.61))
    L["innen"] = simple(bpy, "innen", (0.025, 0.024, 0.022), 0.95)
    L["innen_a"] = interior(bpy, "innen_a", (0.035, 0.032, 0.03))
    L["innen_b"] = interior(bpy, "innen_b", (0.30, 0.26, 0.21))
    L["innen_c"] = interior(bpy, "innen_c", (0.12, 0.10, 0.08))
    # Strassenflaechen (Asphalt mit Flickstellen, Gehsteig Asphalt oder Platten laut street.gehsteig, Granitpflaster)
    L["asphalt"] = asphalt(bpy, "asphalt", (0.030, 0.030, 0.032))
    if st.get("gehsteig") == "platten":
        L["gehsteig"] = platten(bpy, "gehsteig", (0.30, 0.29, 0.27), tuple(st.get("platten_raster", (0.5, 0.5))))
    else:      # Wiener Gehsteig: Gussasphalt, heller und feinkoerniger als die Fahrbahn
        L["gehsteig"] = asphalt(bpy, "gehsteig", (0.085, 0.083, 0.08), flick=True)
    L["parkstreifen"] = asphalt(bpy, "parkstreifen", (0.05, 0.05, 0.052))
    L["zebra"] = simple(bpy, "zebra", (0.7, 0.7, 0.68), 0.7)
    L["markierung"] = simple(bpy, "markierung", (0.62, 0.62, 0.60), 0.6)
    L["pflaster"] = pflaster_granit(bpy, "pflaster")
    L["seil"] = simple(bpy, "seil", (0.02, 0.02, 0.02), 0.5)
    L["balkon_lochblech"] = simple(bpy, "balkon_lochblech", (0.015, 0.015, 0.016), 0.45, 0.6)
    L["leuchte"] = simple(bpy, "leuchte", (0.25, 0.26, 0.27), 0.4, 0.6, **{"Emission Color": (1.0, 0.75, 0.45, 1.0)})
    L["randstein"] = granit(bpy, "randstein")
    L["hof"] = plaster(bpy, "hof", (0.3, 0.29, 0.27), detail=False)
    L["stamm"] = simple(bpy, "stamm", (0.09, 0.07, 0.05), 0.85)
    L["laub"] = foliage(bpy, "laub", (0.055, 0.12, 0.03))
    L["nachbar_dach"] = simple(bpy, "nachbar_dach", (0.06, 0.06, 0.062), 0.75, 0.2)
    L["dach_ziegel"] = plaster(bpy, "dach_ziegel", (0.20, 0.075, 0.045), var=0.15, bump=0.3, detail=False)
    L["dach_blech"] = zinc(bpy, "dach_blech", (0.11, 0.115, 0.12))
    # Dachklassen der Umgebung (lib/roofs.py: Neigung aus dem Dachmodell, Farbe aus dem Orthofoto)
    L["dach_ziegel_dunkel"] = plaster(bpy, "dach_ziegel_dunkel", (0.085, 0.05, 0.04), var=0.15, bump=0.3, detail=False)
    L["dach_blech_hell"] = zinc(bpy, "dach_blech_hell", (0.30, 0.31, 0.32))
    L["dach_kies"] = plaster(bpy, "dach_kies", (0.25, 0.24, 0.225), var=0.12, bump=0.25, detail=False)
    L["dach_gruen"] = plaster(bpy, "dach_gruen", (0.10, 0.13, 0.06), var=0.25, bump=0.3, detail=False)
    # Dachdeckungen fuer roofs_override und die Ziegelmischung der Umgebung (lib/roofs.py, MAT und ZIEGEL_MIX).
    # Bewusst sehr dunkel angesetzt (an den Renderings kalibriert, nicht physikalisch): bei der hellen Belichtung der
    # Lichtstimmungen brennen Daecher mit ueblichen Albedowerten im AgX-Look zu Rosa aus.
    L["dach_ziegel_rot"] = ziegel(bpy, "dach_ziegel_rot", (0.026, 0.0030, 0.0013))
    L["dach_ziegel_rot_alt"] = ziegel(bpy, "dach_ziegel_rot_alt", (0.017, 0.0038, 0.0024))
    L["dach_ziegel_orange"] = ziegel(bpy, "dach_ziegel_orange", (0.055, 0.0085, 0.0012))
    L["dach_ziegel_braun"] = ziegel(bpy, "dach_ziegel_braun", (0.0105, 0.0042, 0.0028))
    L["dach_schiefer_dunkel"] = ziegel(bpy, "dach_schiefer_dunkel", (0.006, 0.006, 0.007), reihe=0.25, rough=0.6)
    L["dach_blech_dunkel"] = zinc(bpy, "dach_blech_dunkel", (0.014, 0.015, 0.017))
    L["dach_blech_grau"] = zinc(bpy, "dach_blech_grau", (0.050, 0.053, 0.058))          # Standardblech der Umgebung
    L["dach_blech_hellgrau"] = zinc(bpy, "dach_blech_hellgrau", (0.115, 0.122, 0.130))  # helles Blech, Alu, verzinkt
    L["dach_kupfer"] = zinc(bpy, "dach_kupfer", (0.10, 0.19, 0.15))
    L["brandwand"] = plaster(bpy, "brandwand", (0.62, 0.60, 0.56), var=0.12, bump=0.2)
    # Fernsicht (lib/fern.py): hohe Gebaeude als Silhouette, Huegelkette im Dunst
    L["fern_bau"] = simple(bpy, "fern_bau", (0.36, 0.35, 0.33), 0.9)
    L["fern_turm"] = simple(bpy, "fern_turm", (0.22, 0.24, 0.27), 0.6)
    L["fern_dach"] = simple(bpy, "fern_dach", (0.06, 0.065, 0.07), 0.8)
    L["fern_wald"] = simple(bpy, "fern_wald", (0.20, 0.245, 0.27), 1.0)      # hell und blaugrau: steht im Dunst vor dem Himmel
    L["nachbar_rahmen"] = simple(bpy, "nachbar_rahmen", (0.75, 0.74, 0.7), 0.4)
    L["fenster_dunkel"] = simple(bpy, "fenster_dunkel", (0.012, 0.014, 0.016), 0.04, 0.0, **{"Specular IOR Level": 0.9})
    L["terrasse"] = plaster(bpy, "terrasse", (0.32, 0.31, 0.29), var=0.05, bump=0.1, detail=False)
    # Innenraum hinter Fenstern (Interior Mapping): hinter echter Scheibe bzw. mit eigener Spiegelung (Umgebung)
    L["innen_raum"] = innenraum(bpy, "innen_raum")
    L["fenster_innen"] = innenraum(bpy, "fenster_innen", glas=True)
    L["autolack"] = autolack(bpy, "autolack")
    L["auto_licht_vorne"] = leuchtmittel(bpy, "auto_licht_vorne", (0.85, 0.85, 0.82))
    L["auto_licht_hinten"] = leuchtmittel(bpy, "auto_licht_hinten", (0.35, 0.01, 0.01))
    L["kennzeichen"] = simple(bpy, "kennzeichen", (0.78, 0.78, 0.76), 0.35)
    L["felge"] = simple(bpy, "felge", (0.30, 0.31, 0.32), 0.3, 0.9)
    L["auto_kunststoff"] = simple(bpy, "auto_kunststoff", (0.018, 0.018, 0.02), 0.6)
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
    # Interior Mapping: Anteil beleuchteter Raeume und Lichtstaerke folgen dem Innenlicht der Lichtstimmung
    for m in bpy.data.materials:
        if m.get("immoviz_innenraum") and m.node_tree and "nacht" in m.node_tree.nodes:
            m.node_tree.nodes["nacht"].outputs[0].default_value = max(0.0, min(1.0, strength))
    # Optional (neubau.ausstattung, Materialart leuchte): Aussenleuchten an, sobald das Licht Innenlicht verlangt
    for m in bpy.data.materials:
        if m.name.startswith("aus_leuchte") and m.node_tree:
            for n in m.node_tree.nodes:
                if n.type == "BSDF_PRINCIPLED":
                    n.inputs["Emission Strength"].default_value = strength * 40.0


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
    for ob in bpy.data.objects:
        if ob.name.startswith("baeume_kronen"):
            ob.hide_render = not visible
    # Baumbibliothek (lib/assets/baeume.py): Blattfarben je Art und Jahreszeit, Blattverlust, Winter kahl
    s_ = season if season in SEASONS else "sommer"
    for m in bpy.data.materials:
        if not m.get("immoviz_laub") or not m.node_tree:
            continue
        cols = m.get(f"saison_{s_}") or m.get("saison_sommer")
        ramp = m.node_tree.nodes.get("jahreszeit")
        if ramp and cols:
            cols = list(cols)
            for k, e in enumerate(ramp.color_ramp.elements):
                e.color = (*cols[3 * k:3 * k + 3], 1.0)
        v = m.node_tree.nodes.get("verlust")
        if v:
            v.outputs[0].default_value = float(m.get(f"verlust_{s_}", 0.0))
