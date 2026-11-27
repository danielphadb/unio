/**
 * Prüfung gespeicherter Daten: Logo-Konzept, Eingabe, Kontakt, Namen, Namenskontext, Kompass-Brief und Route. Jede Prüfung wirft ValidationError mit dem Pfad.
 * Gesicherte Fassung: index-Chunk (PL, DL, UL, AL, BL, Lg, JT).
 */
import { ALL_FONTS } from "../../engine/fonts";
import { ALL_ICONS, CONTAINER_KEYS } from "../../symbols/Icons";
import { ValidationError, bool, listOf, num, obj, oneOf, str } from "./validators";

// Grund-Helfer aus validators.ts (Postings und Objektdaten nutzen sie direkt) werden hier weitergereicht.
export {
  ValidationError,
  bool,
  isWebOk,
  listOf,
  num,
  obj,
  oneOf,
  str,
  stripWeb,
} from "./validators";

export const STYLES = ["elegant", "modern", "luxus", "warm", "mutig", "natur"];

export const COLOR_MOODS_V = [
  "gold",
  "navy",
  "gruen",
  "terra",
  "schwarz",
  "blau",
  "bordeaux",
  "sand",
];

export const THEMES = [
  "haus",
  "dach",
  "schluessel",
  "tuer",
  "stadt",
  "natur",
  "initialen",
  "abstrakt",
];

export const LAYOUTS = ["inline", "stacked", "wordmark", "badge"];

export const CASES = ["upper", "title", "asis", "lower"];

export const BADGES = ["frame", "arch", "seal"];

export const NAME_FORMATS = [
  "full",
  "upper",
  "surname",
  "stacked",
  "initial",
  "monogram",
  "district",
];

export const ICON_IDS = new Set(ALL_ICONS.map((e) => e.id));

export const FONT_WEIGHTS = new Map(ALL_FONTS.map((e) => [e.key, e.weights]));

export const FONT_ITALICS = new Map(ALL_FONTS.map((e) => [e.key, e.italics ?? []]));

export function hex(e: any, t: any) {
  if (typeof e != "string" || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e))
    throw new ValidationError(t);
  const n = e.slice(1);
  return `#${(n.length === 3
    ? n
        .split("")
        .map((r) => r + r)
        .join("")
    : n
  ).toUpperCase()}`;
}

export const ID_RE = /^[A-Za-z0-9_@.-]{1,160}$/;

export const KEY_RE = /^[a-z0-9-]{1,60}$/;

export function fontRef(e: any, t: any) {
  var a;
  const n = obj(e, t);
  const r = str(n.key, `${t}.key`, 40);
  const s = FONT_WEIGHTS.get(r);
  if (!s) throw new ValidationError(`${t}.key`);
  const i = num(n.weight, `${t}.weight`, 100, 900);
  if (!s.includes(i)) throw new ValidationError(`${t}.weight`);
  if (n.style === undefined || n.style === "normal") return { key: r, weight: i };
  if (n.style !== "italic" || !((a = FONT_ITALICS.get(r)) != null && a.includes(i)))
    throw new ValidationError(`${t}.style`);
  return { key: r, weight: i, style: "italic" };
}

export function textStyle(e: any, t: any) {
  const n = obj(e, t);
  return {
    font: fontRef(n.font, `${t}.font`),
    case: oneOf(n.case, CASES, `${t}.case`),
    tracking: num(n.tracking, `${t}.tracking`, -0.5, 1),
  };
}

export function symbolSpec(e: any, t: any) {
  if (e == null) return null;
  const n = obj(e, t);
  const r = oneOf(n.container, CONTAINER_KEYS, `${t}.container`);
  if (n.kind === "icon") {
    const s = str(n.id, `${t}.id`, 60);
    if (!ICON_IDS.has(s)) throw new ValidationError(`${t}.id`);
    return { kind: "icon", id: s, container: r };
  }
  if (n.kind === "monogram") {
    const i: any = {
      kind: "monogram",
      letters: str(n.letters, `${t}.letters`, 3, { pattern: /^[\p{L}\p{N}&]{1,3}$/u }),
      container: r,
      font: fontRef(n.font, `${t}.font`),
    };
    if (n.konstruktion !== undefined) {
      i.konstruktion = oneOf(
        n.konstruktion,
        ["stamm", "ligatur", "verschraenkt", "negativ"],
        `${t}.konstruktion`,
      );
    }
    return i;
  }
  throw new ValidationError(`${t}.kind`);
}

export function palette(e: any, t: any) {
  const n = obj(e, t);
  return {
    id: str(n.id, `${t}.id`, 96, { pattern: ID_RE }),
    name: str(n.name, `${t}.name`, 60, { pattern: /^[\p{L}\p{N} &.,'-]*$/u }),
    primary: hex(n.primary, `${t}.primary`),
    secondary: hex(n.secondary, `${t}.secondary`),
    accent: hex(n.accent, `${t}.accent`),
    ink: hex(n.ink, `${t}.ink`),
    paper: hex(n.paper, `${t}.paper`),
  };
}

export function validateConcept(e: any, t: any = "konzept") {
  const n = obj(e, t);
  const r = obj(n.colors, `${t}.colors`);
  const s: any = {
    id: str(n.id, `${t}.id`, 160, { pattern: ID_RE }),
    seed: num(n.seed, `${t}.seed`, -9007199254740992, 2 ** 53),
    style: oneOf(n.style, STYLES, `${t}.style`),
    layout: oneOf(n.layout, LAYOUTS, `${t}.layout`),
    symbol: symbolSpec(n.symbol, `${t}.symbol`),
    name: textStyle(n.name, `${t}.name`),
    suffix: textStyle(n.suffix, `${t}.suffix`),
    tagline: textStyle(n.tagline, `${t}.tagline`),
    body: fontRef(n.body, `${t}.body`),
    palette: palette(n.palette, `${t}.palette`),
    colors: {
      symbol: oneOf(r.symbol, ["primary", "secondary", "accent", "ink"], `${t}.colors.symbol`),
      name: oneOf(r.name, ["primary", "ink"], `${t}.colors.name`),
      suffix: oneOf(r.suffix, ["primary", "secondary", "accent", "ink"], `${t}.colors.suffix`),
    },
    divider: oneOf(n.divider, ["none", "line", "dot"], `${t}.divider`),
  };
  if (
    (n.symbolFilled !== undefined && (s.symbolFilled = bool(n.symbolFilled, `${t}.symbolFilled`)),
    n.badge !== undefined && (s.badge = oneOf(n.badge, BADGES, `${t}.badge`)),
    n.typo !== undefined && (s.typo = typoDetails(n.typo, `${t}.typo`)),
    n.nameFormat !== undefined &&
      (s.nameFormat = oneOf(n.nameFormat, NAME_FORMATS, `${t}.nameFormat`)),
    n.cardBackground !== undefined &&
      (s.cardBackground = oneOf(
        n.cardBackground,
        ["paper", "ink", "primary"],
        `${t}.cardBackground`,
      )),
    n.symbolPosition !== undefined &&
      (s.symbolPosition = oneOf(n.symbolPosition, ["right", "below"], `${t}.symbolPosition`)),
    n.symbolSize !== undefined &&
      (s.symbolSize = oneOf(n.symbolSize, ["small", "large"], `${t}.symbolSize`)),
    n.recipeId !== undefined && (s.recipeId = str(n.recipeId, `${t}.recipeId`, 12)),
    n.signature !== undefined && (s.signature = signatureRef(n.signature, `${t}.signature`)),
    n.legalNaehe !== undefined)
  ) {
    const i = obj(n.legalNaehe, `${t}.legalNaehe`);
    const a = Array.isArray(i.merkmale)
      ? i.merkmale.slice(0, 8).map((o, l) => str(o, `${t}.legalNaehe.merkmale.${l}`, 40))
      : [];
    s.legalNaehe = { marke: str(i.marke, `${t}.legalNaehe.marke`, 60), merkmale: a };
  }
  return s;
}

export function signatureRef(e: any, t: any) {
  const n = obj(e, t);
  const r: any = { id: str(n.id, `${t}.id`, 60, { pattern: KEY_RE }) };
  if (n.params !== undefined) {
    const s = obj(n.params, `${t}.params`);
    const i: any = {};
    for (const a of ["haupt", "neben", "akzent"])
      s[a] !== undefined && (i[a] = fontRef(s[a], `${t}.params.${a}`));
    if (s.zusatzMassstab !== undefined) {
      i.zusatzMassstab =
        Math.round(num(s.zusatzMassstab, `${t}.params.zusatzMassstab`, 0.75, 1.6) * 100) / 100;
    }
    if (s.zusatzSchreibung !== undefined) {
      i.zusatzSchreibung = oneOf(s.zusatzSchreibung, CASES, `${t}.params.zusatzSchreibung`);
    }
    if (Object.keys(i).length) {
      r.params = i;
    }
  }
  return r;
}

export function typoDetails(e: any, t: any) {
  const n = obj(e, t);
  const r: any = {};
  if (n.split !== undefined) {
    const s = obj(n.split, `${t}.split`);
    const i: any = { part: oneOf(s.part, ["first", "rest"], `${t}.split.part`) };
    if (s.font !== undefined) {
      i.font = fontRef(s.font, `${t}.split.font`);
    }
    if (s.case !== undefined) {
      i.case = oneOf(s.case, CASES, `${t}.split.case`);
    }
    if (s.tracking !== undefined) {
      i.tracking = num(s.tracking, `${t}.split.tracking`, -0.5, 1);
    }
    if (s.color !== undefined) {
      i.color = oneOf(s.color, ["primary", "accent", "ink"], `${t}.split.color`);
    }
    if (s.stack !== undefined) {
      i.stack = bool(s.stack, `${t}.split.stack`);
    }
    if (s.scale !== undefined) {
      i.scale = num(s.scale, `${t}.split.scale`, 0.3, 3);
    }
    if (s.joint !== undefined) {
      i.joint = Math.round(num(s.joint, `${t}.split.joint`, 1, 80));
    }
    r.split = i;
  }
  if (n.ampersand !== undefined) {
    r.ampersand = fontRef(n.ampersand, `${t}.ampersand`);
  }
  if (n.rule !== undefined) {
    r.rule = oneOf(n.rule, ["over", "under"], `${t}.rule`);
  }
  for (const s of ["letterSwap", "inlineSuffix", "camel"])
    n[s] !== undefined && (r[s] = bool(n[s], `${t}.${s}`));
  if (
    (n.mark !== undefined && (r.mark = oneOf(n.mark, ["dot", "hairline", "macron"], `${t}.mark`)),
    n.sup !== undefined)
  ) {
    const s = obj(n.sup, `${t}.sup`);
    r.sup = {
      art: oneOf(s.art, ["stern", "grad", "bezirk"], `${t}.sup.art`),
      text: str(s.text, `${t}.sup.text`, 4, { pattern: /^[*°\d]{1,4}$/u }),
    };
  }
  if (n.fussnote !== undefined) {
    r.fussnote = bool(n.fussnote, `${t}.fussnote`);
  }
  if (n.suffixWrap !== undefined) {
    r.suffixWrap = oneOf(n.suffixWrap, ["klammer"], `${t}.suffixWrap`);
  }
  if (n.inlineSep !== undefined) {
    r.inlineSep = oneOf(n.inlineSep, ["slash", "klammer"], `${t}.inlineSep`);
  }
  if (n.suffixScale !== undefined) {
    r.suffixScale = Math.round(num(n.suffixScale, `${t}.suffixScale`, 0.3, 0.75) * 100) / 100;
  }
  if (n.eingriff !== undefined) {
    r.eingriff = oneOf(
      n.eingriff,
      ["querbalken", "fuge", "markierung", "fundament", "umlaut"],
      `${t}.eingriff`,
    );
  }
  if (n.markColor !== undefined) {
    r.markColor = oneOf(n.markColor, ["primary", "accent"], `${t}.markColor`);
  }
  return r;
}

export function validateInput(e: any, t: any = "eingabe") {
  const n = obj(e, t);
  return {
    name: str(n.name, `${t}.name`, 80),
    suffix: str(n.suffix, `${t}.suffix`, 40, { optional: true }),
    tagline: str(n.tagline, `${t}.tagline`, 120, { optional: true }),
    styles: listOf(n.styles, STYLES, `${t}.styles`),
    colorMoods: listOf(n.colorMoods, COLOR_MOODS_V, `${t}.colorMoods`),
    themes: listOf(n.themes, THEMES, `${t}.themes`),
    ...(n.place !== undefined && n.place !== "" ? { place: str(n.place, `${t}.place`, 60) } : {}),
    ...(n.nameKind !== undefined
      ? { nameKind: oneOf(n.nameKind, ["person", "company"], `${t}.nameKind`) }
      : {}),
    ...(n.ort2 !== undefined && n.ort2 !== "" ? { ort2: str(n.ort2, `${t}.ort2`, 60) } : {}),
    ...(n.jahr !== undefined && n.jahr !== "" ? { jahr: foundingYear(n.jahr, `${t}.jahr`) } : {}),
    ...(n.route !== undefined && n.route !== null
      ? { route: routeParams(n.route, `${t}.route`) }
      : {}),
  };
}

export function isFoundingYear(e: any, t: any = new Date()) {
  if (!/^\d{4}$/.test(e)) return false;
  const n = Number(e);
  return n >= 1800 && n <= t.getFullYear();
}

export function foundingYear(e: any, t: any) {
  if (typeof e != "string" || !isFoundingYear(e)) throw new ValidationError(t);
  return e;
}

export function imageData(e: any, t: any) {
  if (!(e == null || e === "")) {
    if (
      typeof e != "string" ||
      e.length > 56e5 ||
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(e)
    )
      throw new ValidationError(t);
    return e;
  }
}

export function validateContact(e: any, t: any = "kontakt") {
  if (e == null) {
    e = {};
  }
  const n = obj(e, t);
  const r = (a: any, o: any) => str(n[a], `${t}.${a}`, o, { optional: true });
  const s: any = {
    person: r("person", 120),
    role: r("role", 80),
    phone: r("phone", 40),
    email: r("email", 120),
    web: str(n.web, `${t}.web`, 200, {
      optional: true,
      pattern: /^(?!\s*(javascript|data|vbscript):)/i,
    }),
    street: r("street", 120),
    city: r("city", 120),
    unioPartner: bool(n.unioPartner, `${t}.unioPartner`),
    legal: r("legal", 200),
  };
  if (n.instagram !== undefined) {
    s.instagram = r("instagram", 120);
  }
  if (n.linkedin !== undefined) {
    s.linkedin = r("linkedin", 200);
  }
  const i = imageData(n.photo, `${t}.photo`);
  if (i) {
    s.photo = i;
  }
  return s;
}

export function validateNames(e: any, t: any = "namen") {
  if (!Array.isArray(e) || e.length > 200) throw new ValidationError(t);
  return e.map((n, r) => {
    const s = obj(n, `${t}[${r}]`);
    return {
      name: str(s.name, `${t}[${r}].name`, 60),
      descriptor: str(s.descriptor, `${t}[${r}].descriptor`, 40, { optional: true }),
      kind: str(s.kind, `${t}[${r}].kind`, 30, { pattern: /^[a-z-]{1,30}$/ }),
    };
  });
}

export const FOCUS = ["wohnen", "haeuser", "luxus", "anleger", "gewerbe", "neubau", "land"];

export function validateNameContext(e: any, t: any = "kontext") {
  const n = obj(e, t);
  const r: any = { keywords: [], focus: [] };
  if (
    (n.person !== undefined && n.person !== "" && (r.person = str(n.person, `${t}.person`, 80)),
    n.company !== undefined && n.company !== "" && (r.company = str(n.company, `${t}.company`, 80)),
    n.keywords !== undefined)
  ) {
    if (!Array.isArray(n.keywords) || n.keywords.length > 7)
      throw new ValidationError(`${t}.keywords`);
    r.keywords = n.keywords.map((s, i) => str(s, `${t}.keywords[${i}]`, 40));
  }
  r.focus = [...new Set(listOf(n.focus, FOCUS, `${t}.focus`))];
  return r;
}

export const ARCHITECTURES = ["person", "buero", "person-dann-buero"];

export const SEGMENTS = ["einstieg", "mitte", "premium", "luxus"];

export const ALTERNATIVES = ["franchise", "bank", "platzhirsch", "online", "privat"];

export const REFERENCE_WORLDS = [
  "verlag",
  "uhrmacher",
  "architektur",
  "privatbank",
  "hotel",
  "cafe",
  "galerie",
  "tech",
  "manufaktur",
  "weingut",
  "sport",
  "mode",
];

export const CLICHES = [
  "gold-schwarz",
  "haus-icon",
  "skyline",
  "schluessel",
  "schreibschrift",
  "monogramm-kreis",
];

export const LOGO_AXES = ["serif", "contrast", "caps", "width", "symbol", "dark"];

export const COLOR_AXES = ["warmth", "saturation"];

export const PAIR_CHOICES = ["a", "b", "egal"];

export const VOICE_POLES = ["formell", "ernst", "sachlich", "leise"];

export const AXES = [
  "serif",
  "contrast",
  "width",
  "weight",
  "caps",
  "tracking",
  "warmth",
  "saturation",
  "dark",
  "symbol",
];

export const WUNSCHKUNDEN_IDS = [
  "didone",
  "antiqua",
  "geometric",
  "grotesk",
  "condensed",
  "mono",
  "script",
  "slab",
  "stencil",
  "extended",
];

export const WERTE_IDS = [
  "person",
  "ort",
  "kunstwort",
  "kombination",
  "bildhaft",
  "fremdsprachig",
  "abgewandelt",
  "kurz",
  "klassisch",
  "initialen",
];

export const SLUG_RE = /^[a-z0-9._-]{1,40}$/;

export const ERFAHRUNG = ["neu", "einige", "lange"];

export const WIRKUNG_IDS = [
  "erstkauf",
  "familie",
  "verkleinern",
  "erbe",
  "trennung",
  "anleger",
  "zuzug",
  "landwunsch",
  "unternehmer",
  "bautraeger",
];

export const FORMAT_IDS = [
  "ehrlichkeit",
  "verlaesslichkeit",
  "genauigkeit",
  "diskretion",
  "naehe",
  "tempo",
  "gestaltung",
  "mut",
  "bestaendigkeit",
  "offenheit",
];

export const KANAL_IDS = [
  "aufrichtig",
  "kompetent",
  "kultiviert",
  "begeisternd",
  "bodenstaendig",
  "ruhig",
  "durchsetzungsstark",
  "herzlich",
  "organisiert",
];

export function uniqueList(e: any, t: any, n: any, r: any) {
  const s = [...new Set(listOf(e, t, r))];
  if (s.length > n) throw new ValidationError(r);
  return s;
}

export function slugList(e: any, t: any, n: any) {
  if (e === undefined) return [];
  if (!Array.isArray(e) || e.length > n) throw new ValidationError(t);
  return [...new Set(e.map((r, s) => str(r, `${t}[${s}]`, 40, { pattern: SLUG_RE })))];
}

export function strList(e: any, t: any, n: any, r: any) {
  if (e === undefined) return [];
  if (!Array.isArray(e) || e.length > n) throw new ValidationError(t);
  return e.map((s, i) => str(s, `${t}[${i}]`, r));
}

export function record(e: any, t: any, n: any, r: any) {
  const s = obj(e, t);
  const i: any = {};
  for (const [a, o] of Object.entries(s)) {
    if (!n.includes(a)) throw new ValidationError(`${t}.${a}`);
    if (o !== undefined) {
      i[a] = r(o, `${t}.${a}`);
    }
  }
  return i;
}

export const optStr = (e: any, t: any, n: any) =>
  e === undefined || e === "" ? undefined : str(e, t, n);

export function validateBrief(e: any, t: any = "kompass") {
  const n = obj(e, t);
  if (n.version !== undefined && n.version !== 1) throw new ValidationError(`${t}.version`);
  const r: any = { version: 1 };
  if (n.architecture !== undefined) {
    r.architecture = oneOf(n.architecture, ARCHITECTURES, `${t}.architecture`);
  }
  if (n.erfahrung !== undefined) {
    r.erfahrung = oneOf(n.erfahrung, ERFAHRUNG, `${t}.erfahrung`);
  }
  if (n.wunschkunde !== undefined) {
    r.wunschkunde = uniqueList(n.wunschkunde, WIRKUNG_IDS, 2, `${t}.wunschkunde`);
  }
  if (n.werte !== undefined) {
    r.werte = uniqueList(n.werte, FORMAT_IDS, 2, `${t}.werte`);
  }
  if (n.wirkung !== undefined) {
    r.wirkung = uniqueList(n.wirkung, KANAL_IDS, 2, `${t}.wirkung`);
  }
  if (n.fremdbild !== undefined) {
    r.fremdbild = uniqueList(n.fremdbild, KANAL_IDS, 2, `${t}.fremdbild`);
  }
  const s = optStr(n.person, `${t}.person`, 80);
  if (s) {
    r.person = s;
  }
  if (n.hasName !== undefined) {
    r.hasName = bool(n.hasName, `${t}.hasName`);
  }
  const i = optStr(n.name, `${t}.name`, 80);
  if (i) {
    r.name = i;
  }
  const a = optStr(n.place, `${t}.place`, 60);
  if (a) {
    r.place = a;
  }
  if (n.focus !== undefined) {
    r.focus = [...new Set(listOf(n.focus, FOCUS, `${t}.focus`))];
  }
  if (n.segment !== undefined) {
    r.segment = oneOf(n.segment, SEGMENTS, `${t}.segment`);
  }
  if (n.side !== undefined) {
    r.side = Math.round(num(n.side, `${t}.side`, -2, 2));
  }
  if (n.alternative !== undefined) {
    r.alternative = oneOf(n.alternative, ALTERNATIVES, `${t}.alternative`);
  }
  if (n.onlyness !== undefined) {
    r.onlyness = slugList(n.onlyness, `${t}.onlyness`, 2);
  }
  const o = optStr(n.onlynessText, `${t}.onlynessText`, 300);
  if (o) {
    r.onlynessText = o;
  }
  const l = optStr(n.proof, `${t}.proof`, 300);
  if (
    (l && (r.proof = l),
    n.voice !== undefined &&
      (r.voice = record(n.voice, `${t}.voice`, VOICE_POLES, (u: any, c: any) => {
        const f = num(u, c, -1, 1);
        if (f !== -1 && f !== 0 && f !== 1) throw new ValidationError(c);
        return f;
      })),
    n.logoPairs !== undefined &&
      (r.logoPairs = record(n.logoPairs, `${t}.logoPairs`, LOGO_AXES, (u: any, c: any) =>
        oneOf(u, PAIR_CHOICES, c),
      )),
    n.colorPairs !== undefined &&
      (r.colorPairs = record(n.colorPairs, `${t}.colorPairs`, COLOR_AXES, (u: any, c: any) =>
        oneOf(u, PAIR_CHOICES, c),
      )),
    n.avoidColors !== undefined &&
      (r.avoidColors = [...new Set(listOf(n.avoidColors, COLOR_MOODS_V, `${t}.avoidColors`))]),
    n.avoidCliches !== undefined &&
      (r.avoidCliches = [...new Set(listOf(n.avoidCliches, CLICHES, `${t}.avoidCliches`))]),
    n.reference !== undefined &&
      (r.reference = oneOf(n.reference, REFERENCE_WORLDS, `${t}.reference`)),
    n.social !== undefined)
  ) {
    const u = obj(n.social, `${t}.social`);
    const c: any = {};
    if (
      (u.channels !== undefined && (c.channels = slugList(u.channels, `${t}.social.channels`, 8)),
      u.camera !== undefined &&
        (c.camera = oneOf(u.camera, ["gesicht", "stimme", "objekte"], `${t}.social.camera`)),
      u.hoursPerWeek !== undefined &&
        (c.hoursPerWeek = num(u.hoursPerWeek, `${t}.social.hoursPerWeek`, 0, 40)),
      u.formats !== undefined)
    ) {
      const f = obj(u.formats, `${t}.social.formats`);
      const d: any = {};
      const h = Object.entries(f);
      if (h.length > 10) throw new ValidationError(`${t}.social.formats`);
      for (const [m, x] of h) {
        if (!SLUG_RE.test(m)) throw new ValidationError(`${t}.social.formats`);
        d[m] = oneOf(x, ["gern", "geht", "nie"], `${t}.social.formats.${m}`);
      }
      c.formats = d;
    }
    if (u.never !== undefined) {
      c.never = slugList(u.never, `${t}.social.never`, 8);
    }
    r.social = c;
  }
  return r;
}

export function axisVector(e: any, t: any) {
  return record(e, t, AXES, (n: any, r: any) => {
    const s = obj(n, r);
    return { v: num(s.v, `${r}.v`, -1, 1), sicher: num(s.sicher, `${r}.sicher`, 0, 1) };
  });
}

export function routeParams(e: any, t: any) {
  const n = obj(e, t);
  const r = obj(n.kindMix, `${t}.kindMix`);
  const s = (i: any) => num(r[i], `${t}.kindMix.${i}`, 0, 100);
  return {
    territory: str(n.territory, `${t}.territory`, 40, { pattern: SLUG_RE }),
    styles: listOf(n.styles, STYLES, `${t}.styles`),
    colorMoods: listOf(n.colorMoods, COLOR_MOODS_V, `${t}.colorMoods`),
    avoidColorMoods: listOf(n.avoidColorMoods, COLOR_MOODS_V, `${t}.avoidColorMoods`),
    themes: listOf(n.themes, THEMES, `${t}.themes`),
    avoidThemes: listOf(n.avoidThemes, THEMES, `${t}.avoidThemes`),
    fontForms: listOf(n.fontForms, WUNSCHKUNDEN_IDS, `${t}.fontForms`),
    avoidFontForms: listOf(n.avoidFontForms, WUNSCHKUNDEN_IDS, `${t}.avoidFontForms`),
    avoidContainers: listOf(n.avoidContainers, CONTAINER_KEYS, `${t}.avoidContainers`),
    axes: n.axes === undefined ? {} : axisVector(n.axes, `${t}.axes`),
    kindMix: {
      wortmarke: s("wortmarke"),
      monogramm: s("monogramm"),
      zeichen: s("zeichen"),
      vorlage: s("vorlage"),
    },
    signatureStyles: listOf(n.signatureStyles, STYLES, `${t}.signatureStyles`),
    avoidSignatureIds:
      n.avoidSignatureIds === undefined
        ? []
        : strList(n.avoidSignatureIds, `${t}.avoidSignatureIds`, 200, 60).map((i, a) =>
            str(i, `${t}.avoidSignatureIds[${a}]`, 60, { pattern: KEY_RE }),
          ),
    nameKinds: listOf(n.nameKinds, WERTE_IDS, `${t}.nameKinds`),
    ...(n.signatureIds === undefined
      ? {}
      : {
          signatureIds: strList(n.signatureIds, `${t}.signatureIds`, 200, 60).map((i, a) =>
            str(i, `${t}.signatureIds[${a}]`, 60, { pattern: KEY_RE }),
          ),
        }),
    ...(n.avoidPaletteIds === undefined
      ? {}
      : {
          avoidPaletteIds: strList(n.avoidPaletteIds, `${t}.avoidPaletteIds`, 100, 40).map((i, a) =>
            str(i, `${t}.avoidPaletteIds[${a}]`, 40, { pattern: /^[a-z0-9-]{1,40}$/ }),
          ),
        }),
    keywordFields: strList(n.keywordFields, `${t}.keywordFields`, 40, 60),
    keywords: strList(n.keywords, `${t}.keywords`, 40, 60),
    seed: num(n.seed, `${t}.seed`, -9007199254740992, 2 ** 53),
  };
}

export function routeTexts(e: any, t: any) {
  const n = obj(e, t);
  const r = (s: any, i: any) => str(n[s], `${t}.${s}`, i, { optional: true });
  return {
    kernidee: r("kernidee", 600),
    schluesselwoerter: strList(n.schluesselwoerter, `${t}.schluesselwoerter`, 8, 60),
    warum: r("warum", 600),
    onlyness: r("onlyness", 600),
    positionierung: r("positionierung", 900),
    claim: r("claim", 120),
    storyKurz: r("storyKurz", 600),
    storyMittel: r("storyMittel", 1600),
    tonBeispiele: strList(n.tonBeispiele, `${t}.tonBeispiele`, 6, 400),
    sagen: strList(n.sagen, `${t}.sagen`, 12, 240),
    vermeiden: strList(n.vermeiden, `${t}.vermeiden`, 12, 240),
    leitplanken: strList(n.leitplanken, `${t}.leitplanken`, 12, 300),
    passtFuer: r("passtFuer", 500),
    risiko: r("risiko", 500),
    quelle: oneOf(n.quelle, ["regel", "ki"], `${t}.quelle`),
    ...(n.socialKit !== undefined && n.socialKit !== null
      ? { socialKit: socialKit(n.socialKit, `${t}.socialKit`) }
      : {}),
    ...(n.persoenlichkeit !== undefined
      ? {
          persoenlichkeit: objList(n.persoenlichkeit, `${t}.persoenlichkeit`, 5, (s: any, i: any) => ({
            eigenschaft: str(s.eigenschaft, `${i}.eigenschaft`, 60),
            satz: str(s.satz, `${i}.satz`, 300),
          })),
        }
      : {}),
    ...(n.wunschkunde !== undefined
      ? { wunschkunde: str(n.wunschkunde, `${t}.wunschkunde`, 400) }
      : {}),
    ...(n.versprechen !== undefined
      ? { versprechen: str(n.versprechen, `${t}.versprechen`, 400) }
      : {}),
    ...(n.formate !== undefined
      ? {
          formate: objList(n.formate, `${t}.formate`, 5, (s: any, i: any) => ({
            format: str(s.format, `${i}.format`, 60),
            rhythmus: str(s.rhythmus, `${i}.rhythmus`, 80),
            satz: str(s.satz, `${i}.satz`, 300),
          })),
        }
      : {}),
  };
}

export function objList(e: any, t: any, n: any, r: any) {
  if (!Array.isArray(e) || e.length > n) throw new ValidationError(t);
  return e.map((s, i) => r(obj(s, `${t}[${i}]`), `${t}[${i}]`));
}

export function socialKit(e: any, t: any) {
  const n = obj(e, t);
  if (!Array.isArray(n.saeulen) || n.saeulen.length > 4) throw new ValidationError(`${t}.saeulen`);
  return {
    saeulen: n.saeulen.map((r, s) => {
      const i = obj(r, `${t}.saeulen[${s}]`);
      return {
        titel: str(i.titel, `${t}.saeulen[${s}].titel`, 60),
        hooks: strList(i.hooks, `${t}.saeulen[${s}].hooks`, 10, 300),
      };
    }),
    profiltext: str(n.profiltext, `${t}.profiltext`, 600, { optional: true }),
  };
}

export function validateRoute(e: any, t: any = "route") {
  const n = obj(e, t);
  return {
    id: oneOf(n.id, ["A", "B", "C"], `${t}.id`),
    art: oneOf(n.art, ["sicher", "mutig", "ueberraschend"], `${t}.art`),
    territory: str(n.territory, `${t}.territory`, 40, { pattern: SLUG_RE }),
    titel: str(n.titel, `${t}.titel`, 120),
    params: routeParams(n.params, `${t}.params`),
    texte: routeTexts(n.texte, `${t}.texte`),
  };
}
