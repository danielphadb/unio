/**
 * Varianten der Signature-Vorlagen (engine-Chunk Zeilen 1989 bis 2274).
 *
 * - fein (f1 bis f4): Abstand, Linienstärke, Größe des Zeichens und des Zusatzes,
 *   Laufweite des Zusatzes. Sofort live (gleiche Freigabe wie die Vorlage).
 * - strukturell (s1 bis s4): Zusatz über dem Namen, Zeichen rechts, Zusatz
 *   linksbündig, Zeichen größer. Als Entwurf, bis die ID in `STRUKTUR_FREIGEGEBEN` steht.
 *
 * IDs: `<vorlage>--<code>`, z. B. `sig-gesims--f3`.
 */
import type {
  Ausdruck,
  Element,
  SignatureTemplate,
  TextElement,
} from "./types";
import type { FontSource, SignatureInput } from "./render";
import { layoutSignature } from "./render";
import type { SignatureParams } from "../types";

export interface Feinheit {
  code: string;
  titel: string;
  /** Faktor für Abstände (Zahlen ab 20 in Ausdrücken mit Kanten) */
  abstand: number;
  /** Faktor für Linien- und Konturstärken */
  staerke: number;
  /** Faktor für den Maßstab von Zeichen-Pfaden */
  zeichen: number;
  /** Faktor für die Versalhöhe des Zusatzes */
  zusatz: number;
  /** Zuschlag zur Laufweite des Zusatzes (nur Versalien 0,16 bis 0,28 em) */
  laufweite: number;
}

/** Feine Varianten (`ls`). */
export const FEINHEIT: Feinheit[] = [
  {
    code: "f1",
    titel: "kompakter, feinere Linien",
    abstand: 0.88,
    staerke: 0.88,
    zeichen: 0.92,
    zusatz: 1,
    laufweite: 0,
  },
  {
    code: "f2",
    titel: "luftiger, kräftigere Linien",
    abstand: 1.12,
    staerke: 1.12,
    zeichen: 1.08,
    zusatz: 1,
    laufweite: 0,
  },
  {
    code: "f3",
    titel: "größerer Zusatz, weiter gesperrt",
    abstand: 0.92,
    staerke: 1,
    zeichen: 1,
    zusatz: 1.1,
    laufweite: 0.03,
  },
  {
    code: "f4",
    titel: "kleineres Zeichen, mehr Luft",
    abstand: 1.1,
    staerke: 1.06,
    zeichen: 0.9,
    zusatz: 1,
    laufweite: -0.02,
  },
];

/** Strukturelle Varianten, die schon live sind (Varianten-IDs) (`gl`). */
export const STRUKTUR_FREIGEGEBEN: ReadonlySet<string> = new Set<string>();

/** Zusatz-Felder, die die Varianten verschieben dürfen (ohne `partnerZeile`) (`fl`). */
const ZUSATZ = new Set([
  "zusatz",
  "ort",
  "zusatzOrt",
  "zusatzOderOrt",
  "ortOderZusatz",
  "ort2",
  "jahr",
]);

/** Ausdruck in Summanden zerlegen (oberste Ebene), `null` bei offenen Klammern (`us`). */
function terms(expr: string): Array<{ sign: string; t: string }> | null {
  const out: Array<{ sign: string; t: string }> = [];
  let depth = 0;
  let cur = "";
  let sign = "+";
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i]!;
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (
      depth === 0 &&
      (c === "+" || c === "-") &&
      cur.trim() !== "" &&
      !/[*/(]$/.test(cur.trim())
    ) {
      out.push({ sign, t: cur.trim() });
      sign = c;
      cur = "";
      continue;
    }
    if (depth === 0 && (c === "+" || c === "-") && cur.trim() === "") {
      sign = c === "-" ? (sign === "-" ? "+" : "-") : sign;
      continue;
    }
    cur += c;
  }
  if (depth !== 0) return null;
  if (cur.trim()) out.push({ sign, t: cur.trim() });
  return out;
}

const num2 = (v: number): string => String(Math.round(v * 100) / 100);

/** Abstände (Zahlen ab 20 in Ausdrücken mit Kanten) skalieren (`Rr`). */
function scaleGaps(expr: Ausdruck, f: number): Ausdruck {
  if (typeof expr != "string" || f === 1) return expr;
  return expr
    .split("|")
    .map((alt) => {
      const parts = terms(alt);
      if (!parts || !parts.some((p) => /[a-z]/i.test(p.t))) return alt;
      let changed = false;
      const scaled = parts.map((p) =>
        /^\d+(\.\d+)?$/.test(p.t) && Number(p.t) >= 20
          ? ((changed = true), { ...p, t: num2(Number(p.t) * f) })
          : p,
      );
      return changed
        ? scaled
            .map(
              (p, i) => (i === 0 ? (p.sign === "-" ? "-" : "") : p.sign) + p.t,
            )
            .join("")
        : alt;
    })
    .join("|");
}

/** Zusatz-Text der Nebenschrift (`jr`). */
const isZusatz = (e: TextElement): boolean =>
  e.schrift === "neben" && ZUSATZ.has(e.feld);

/** Stärke skalieren: feine Linien (unter 2,4) werden nicht dünner, höchstens 14 (`Tr`). */
function scaleStroke(v: number, f: number): number {
  const s = v * f;
  return f < 1 && v < 2.4
    ? v
    : Math.round(
        Math.min(Math.max(s, v >= 2.4 ? 2.4 : v), Math.max(14, v)) * 100,
      ) / 100;
}

/** Elemente einer feinen Variante (`dl`). */
function fineElements(t: SignatureTemplate, f: Feinheit): Element[] {
  return t.elemente.map((e) => {
    if (e.typ === "text") {
      const r: TextElement = {
        ...e,
        x: scaleGaps(e.x, f.abstand),
        y: scaleGaps(e.y, f.abstand),
      };
      if (e.kontur) r.kontur = scaleStroke(e.kontur, f.staerke);
      if (isZusatz(e)) {
        if (typeof e.versal == "number" && f.zusatz !== 1)
          r.versal = Math.round(e.versal * f.zusatz * 10) / 10;
        if (
          f.laufweite &&
          e.schreibung === "upper" &&
          e.laufweite >= 0.16 &&
          e.laufweite <= 0.28
        )
          r.laufweite =
            Math.round(
              Math.min(0.28, Math.max(0.16, e.laufweite + f.laufweite)) * 1e3,
            ) / 1e3;
      }
      return r;
    }
    const r = { ...e } as Element & {
      staerke?: number;
      kontur?: number;
      massstab?: Ausdruck;
      y?: Ausdruck;
    };
    if ("staerke" in e && typeof e.staerke == "number")
      r.staerke = scaleStroke(e.staerke, f.staerke);
    if ("kontur" in e && typeof e.kontur == "number")
      r.kontur = scaleStroke(e.kontur, f.staerke);
    if (e.typ === "pfad" && e.zeichen) {
      if (typeof e.massstab == "number" || e.massstab === undefined)
        r.massstab = Math.round((e.massstab ?? 1) * f.zeichen * 1e3) / 1e3;
      r.y = scaleGaps(e.y, f.abstand);
    }
    return r;
  });
}

const texts = (t: SignatureTemplate): TextElement[] =>
  t.elemente.filter((e): e is TextElement => e.typ === "text");
const idOf = (e: { id?: string; feld?: string }): string =>
  e.id ?? e.feld ?? "";
/** Alle Zeichenketten eines Elements (für Bezugssuche) (`_r`). */
function strings(e: object): string {
  return Object.values(e)
    .filter((v) => typeof v == "string" || (typeof v == "object" && v !== null))
    .map((v) => (typeof v == "string" ? v : JSON.stringify(v)))
    .join(" ");
}
/** Ein anderes Element bezieht sich auf `id` (`pl`). */
const referenced = (
  t: SignatureTemplate,
  id: string,
  except: Element[] = [],
): boolean =>
  t.elemente.some(
    (e) =>
      !except.includes(e) &&
      new RegExp(`(^|[^a-zA-Z0-9_])${id}\\.`).test(strings(e)),
  );
/** Erster Abstand (Zahl) eines Ausdrucks (`kl`). */
function firstNumber(expr: Ausdruck): number | null {
  if (typeof expr != "string") return null;
  const n = terms(expr.split("|")[0]!)?.find((p) => /^\d+(\.\d+)?$/.test(p.t));
  return n ? Number(n.t) : null;
}

export interface Struktur {
  code: string;
  titel: string;
  achsen: string[];
  /** neue Elemente oder `null`, wenn die Variante bei dieser Vorlage nicht geht */
  bau(t: SignatureTemplate): Element[] | null;
}

/** Strukturelle Varianten (`ms`). */
export const STRUKTUR: Struktur[] = [
  {
    code: "s1",
    titel: "Zusatz über dem Namen",
    achsen: ["Lage des Zusatzes"],
    bau(t) {
      const z = texts(t).filter(isZusatz);
      if (z.length !== 1) return null;
      const e = z[0]!;
      if (
        typeof e.y != "string" ||
        !/name\.(b|u)/.test(e.y) ||
        e.wennFehlt ||
        e.drehung ||
        e.bogen ||
        referenced(t, idOf(e), [e]) ||
        t.elemente.some((x) => x !== e && /name\.(t|o)\s*-/.test(strings(x)))
      )
        return null;
      const gap = firstNumber(e.y) ?? 80;
      const versal = typeof e.versal == "number" ? e.versal : 36;
      const y = `min(name.t,name.o)-${num2(Math.max(versal * 1.5, gap * 0.75))}`;
      return t.elemente.map((x) => (x === e ? { ...e, y } : x));
    },
  },
  {
    code: "s2",
    titel: "Zeichen rechts vom Namen",
    achsen: ["Lage des Zeichens"],
    bau(t) {
      const mark = t.elemente.find(
        (x) =>
          x.typ !== "text" &&
          x.zeichen &&
          "x" in x &&
          (x.x === 0 || x.x === "0"),
      );
      const name = texts(t).find((x) => idOf(x) === "name");
      if (
        !mark ||
        !name ||
        !mark.id ||
        name.ausrichtung !== "links" ||
        typeof name.x != "string"
      )
        return null;
      const m = new RegExp(`^${mark.id}\\.r\\+(\\d+(\\.\\d+)?)$`).exec(name.x);
      if (
        !m ||
        t.elemente.some(
          (x) =>
            x !== name &&
            x !== mark &&
            new RegExp(`${mark.id}\\.(l|r|cx|w)`).test(strings(x)),
        )
      )
        return null;
      const { stift: _stift, ...rest } = name;
      return t.elemente.map((x) =>
        x === name
          ? {
              ...rest,
              ausrichtung: "rechts" as const,
              x: `${mark.id}.l-${m[1]}`,
            }
          : x,
      );
    },
  },
  {
    code: "s3",
    titel: "Zusatz linksbündig",
    achsen: ["Ausrichtung des Zusatzes"],
    bau(t) {
      const name = texts(t).find((x) => idOf(x) === "name");
      const z = texts(t).filter(
        (x) =>
          isZusatz(x) &&
          x.ausrichtung === "mitte" &&
          x.x === "name.cx" &&
          !x.drehung &&
          !x.bogen,
      );
      return !name || name.ausrichtung !== "mitte" || !z.length
        ? null
        : t.elemente.map((x) =>
            z.includes(x as TextElement)
              ? {
                  ...(x as TextElement),
                  ausrichtung: "links" as const,
                  x: "name.l",
                }
              : x,
          );
    },
  },
  {
    code: "s4",
    titel: "Zeichen deutlich größer",
    achsen: ["Proportion Zeichen zu Name"],
    bau(t) {
      const paths = t.elemente.filter(
        (x) =>
          x.typ === "pfad" &&
          x.zeichen &&
          (typeof x.massstab == "number" || x.massstab === undefined),
      );
      return paths.length
        ? t.elemente.map((x) =>
            paths.includes(x) && x.typ === "pfad"
              ? {
                  ...x,
                  massstab:
                    Math.round(
                      ((x.massstab as number | undefined) ?? 1) * 1.32 * 1e3,
                    ) / 1e3,
                }
              : x,
          )
        : null;
    },
  },
];

/** Trenner zwischen Vorlage und Varianten-Code (`Yr`). */
export const VARIANT_SEP = "--";

/** `sig-gesims--f3` in `["sig-gesims", "f3"]`, ohne Code `[id, null]` (`hs`, Export `Y`). */
export function splitVariantId(id: string): [string, string | null] {
  const at = id.indexOf(VARIANT_SEP);
  return at < 0
    ? [id, null]
    : [id.slice(0, at), id.slice(at + VARIANT_SEP.length)];
}

/** Gebaute Varianten (auch `null` = geht nicht) (`Or`). */
const built = new Map<string, SignatureTemplate | null>();

/** Variante `code` einer Vorlage oder `null`, wenn sie nichts ändert oder nicht geht (`fs`). */
export function buildVariant(
  t: SignatureTemplate,
  code: string,
): SignatureTemplate | null {
  const id = `${t.id}${VARIANT_SEP}${code}`;
  if (built.has(id)) return built.get(id)!;
  let out: SignatureTemplate | null = null;
  const fein = FEINHEIT.find((f) => f.code === code);
  if (fein) {
    const elemente = fineElements(t, fein);
    if (JSON.stringify(elemente) !== JSON.stringify(t.elemente)) {
      const achsen = [
        fein.abstand !== 1 && "Abstand",
        fein.staerke !== 1 && "Linienstärke",
        fein.zeichen !== 1 && "Größe des Zeichens",
        fein.zusatz !== 1 && "Größe des Zusatzes",
        fein.laufweite !== 0 && "Laufweite des Zusatzes",
      ].filter((a): a is string => !!a);
      out = {
        ...t,
        id,
        titel: `${t.titel}, ${fein.titel}`,
        elemente,
        variante: {
          basis: t.id,
          code,
          klasse: "fein",
          titel: fein.titel,
          achsen,
        },
      };
    }
  }
  const struktur = STRUKTUR.find((s) => s.code === code);
  if (struktur) {
    const elemente = struktur.bau(t);
    if (elemente)
      out = {
        ...t,
        id,
        titel: `${t.titel}, ${struktur.titel}`,
        elemente,
        freigabe: STRUKTUR_FREIGEGEBEN.has(id) ? t.freigabe : "entwurf",
        variante: {
          basis: t.id,
          code,
          klasse: "strukturell",
          titel: struktur.titel,
          achsen: struktur.achsen,
        },
      };
  }
  built.set(id, out);
  return out;
}

/** Alle Varianten einer Vorlage (strukturelle nur mit `struktur`) (`bl`). */
export function templateVariants(
  t: SignatureTemplate,
  struktur = false,
): SignatureTemplate[] {
  return t.variante
    ? []
    : [
        ...FEINHEIT.map((f) => f.code),
        ...(struktur ? STRUKTUR.map((s) => s.code) : []),
      ]
        .map((code) => buildVariant(t, code))
        .filter((v): v is SignatureTemplate => !!v);
}

/** Rahmen schneiden sich (mehr als einen halben Punkt) (`_l`). */
const overlap = (
  a: { x: number; y: number; w: number; h: number },
  b: typeof a,
): boolean =>
  a.x < b.x + b.w - 0.5 &&
  b.x < a.x + a.w - 0.5 &&
  a.y < b.y + b.h - 0.5 &&
  b.y < a.y + a.h - 0.5;

/** Paare sich überlappender Texte und Zeichen (`pa`). */
function overlaps(
  t: SignatureTemplate,
  input: SignatureInput,
  fonts: FontSource,
  params?: SignatureParams,
): Set<string> {
  const l = layoutSignature(t, input, fonts, params);
  const marks = l.ops
    .filter((o) => o.zeichen && o.box)
    .map((o, i) => ({ id: `zeichen${i}`, box: o.box! }));
  const boxes = l.boxes.map((b) => ({ id: b.id, box: b.box }));
  const out = new Set<string>();
  const all = [...boxes, ...marks];
  for (let i = 0; i < boxes.length; i++)
    for (let k = 0; k < all.length; k++)
      if (
        all[k] !== boxes[i] &&
        all[k]!.id !== boxes[i]!.id &&
        overlap(boxes[i]!.box, all[k]!.box)
      )
        out.add(
          [boxes[i]!.id, all[k]!.id.replace(/\d+$/, "")].sort().join("|"),
        );
  return out;
}

/**
 * Die Variante bringt keine neue Überlappung gegenüber der Vorlage (`Yl`); ohne
 * Basis oder bei anderem Aufbau `false`.
 */
export function varianteBleibtFrei(
  variante: SignatureTemplate,
  basis: SignatureTemplate | undefined,
  input: SignatureInput,
  fonts: FontSource,
  params?: SignatureParams,
): boolean {
  if (!basis) return false;
  const a = layoutSignature(basis, input, fonts, params);
  const b = layoutSignature(variante, input, fonts, params);
  if (a.ops.length !== b.ops.length) return false;
  const ids = (l: typeof a) =>
    l.boxes
      .map((x) => x.id)
      .sort()
      .join("|");
  if (ids(a) !== ids(b)) return false;
  const before = overlaps(basis, input, fonts, params);
  for (const p of overlaps(variante, input, fonts, params))
    if (!before.has(p)) return false;
  return true;
}
