/**
 * Signature-Vorlagen: alle Vorlagen, Zugriff, Passung und Konzept für die Galerie
 * (engine-Chunk Zeilen 10923 bis 11069). Einstieg für Logo-Engine und Oberfläche.
 *
 * Die Vorlagen liegen als Daten in templates/<gruppe>.json, damit Designer sie
 * lesen und ändern können.
 */
import type {
  BrandInput,
  FontRef,
  LogoConcept,
  Palette,
  SignatureParams,
  StyleKey,
} from "../types";
import type { SvgPart } from "../engine/svg";
import { fontKey, getFont } from "../engine/fonts";
import elegant from "./templates/elegant.json";
import luxus from "./templates/luxus.json";
import modern from "./templates/modern.json";
import mutig from "./templates/mutig.json";
import natur from "./templates/natur.json";
import warm from "./templates/warm.json";
import kurz from "./templates/kurz.json";
import mischung from "./templates/mischung.json";
import kit from "./templates/kit.json";
import partner from "./templates/partner.json";
import verworfen from "./templates/verworfen.json";
import type {
  FitOptions,
  FitResult,
  SignatureTemplate,
  TextElement,
} from "./types";
import {
  checkFit,
  corpusTwinName,
  renderTemplate,
  templateFontRefs,
  templateFonts,
  ZUSATZ_FELDER,
  type FontSource,
  type SignatureInput,
} from "./render";
import { buildVariant, splitVariantId, varianteBleibtFrei } from "./varianten";

export * from "./types";
export * from "./render";
export * from "./varianten";
export * from "./nameParts";
export * from "./partner";
export * from "./orte";

const as = (data: unknown): SignatureTemplate[] => data as SignatureTemplate[];

/** Vorlagen je Gruppe, wie in templates/*.json (`Il`, `Ol`, `Bl`, `Vl`, `Zl`, `Cl`, `ws`, `Dl`, `Pl`, `Wl`). */
export const TEMPLATE_GROUPS = {
  elegant: as(elegant),
  luxus: as(luxus),
  modern: as(modern),
  mutig: as(mutig),
  natur: as(natur),
  warm: as(warm),
  kurz: as(kurz),
  mischung: as(mischung),
  kit: as(kit),
  partner: as(partner),
};

/** Kurznamen-Vorlagen (Gruppe "kurz"; die Namenskarten bevorzugen sie bei kurzen Namen) (`ws`, Export `ad`). */
export const KIT_TEMPLATES: SignatureTemplate[] = TEMPLATE_GROUPS.kurz;
/** Gleiche Liste unter dem früheren Namen. */
export const KURZNAMEN = KIT_TEMPLATES;

/** Vorlagen, deren Nebenschriften nicht ergänzt werden (`ql`). */
const OHNE_ERGAENZUNG = new Set(["sig-vollhohl", "sig-impressum"]);
/** Ergänzende Nebenschriften für den Zusatz: Mono und Kursiv (`nt`). */
const ERGAENZUNG: Record<"mono" | "kursiv", FontRef> = {
  mono: { key: "dmmono", weight: 300 },
  kursiv: { key: "ebgaramond", weight: 400, style: "italic" },
};

/**
 * Nebenschriften ergänzen (`Ul`): Steht der Zusatz in der Nebenschrift, darf er
 * auch in Mono oder Kursiv stehen (je nach Hauptstil), sofern keine gleiche Form
 * schon angeboten wird.
 */
export function withZusatzSchriften(t: SignatureTemplate): SignatureTemplate {
  if (OHNE_ERGAENZUNG.has(t.id)) return t;
  const neben = t.elemente.filter(
    (e): e is TextElement => e.typ === "text" && e.schrift === "neben",
  );
  if (!neben.length || neben.some((e) => !ZUSATZ_FELDER.includes(e.feld)))
    return t;
  const stil = t.passt.stile[0];
  const extra =
    stil === "mutig"
      ? [ERGAENZUNG.mono]
      : stil === "modern" || stil === "natur"
        ? [ERGAENZUNG.mono, ERGAENZUNG.kursiv]
        : [ERGAENZUNG.kursiv, ERGAENZUNG.mono];
  const list = [...t.schriften.neben];
  for (const f of extra)
    if (
      !list.some((s) => fontKey(s) === fontKey(f)) &&
      !list.some(
        (s) =>
          getFont(s.key).form === getFont(f.key).form &&
          (s.style ?? "") === (f.style ?? ""),
      )
    )
      list.push(f);
  return list.length === t.schriften.neben.length
    ? t
    : { ...t, schriften: { ...t.schriften, neben: list } };
}

/** Alle Vorlagen in fester Reihenfolge, Nebenschriften ergänzt (`cr`, Export `V`). */
export const ALL_TEMPLATES: SignatureTemplate[] = [
  ...TEMPLATE_GROUPS.elegant,
  ...TEMPLATE_GROUPS.luxus,
  ...TEMPLATE_GROUPS.modern,
  ...TEMPLATE_GROUPS.mutig,
  ...TEMPLATE_GROUPS.natur,
  ...TEMPLATE_GROUPS.warm,
  ...TEMPLATE_GROUPS.kurz,
  ...TEMPLATE_GROUPS.mischung,
  ...TEMPLATE_GROUPS.kit,
  ...TEMPLATE_GROUPS.partner,
].map(withZusatzSchriften);

/** Zurückgezogene Vorlagen mit Grund; sie bleiben in der Liste, sind aber nicht abrufbar (`jl`). */
export const ZURUECKGEZOGEN: Readonly<Record<string, string>> = verworfen;

/** Abrufbare Vorlagen nach ID (`Jr`). */
const BY_ID = new Map(
  ALL_TEMPLATES.filter((t) => !(t.id in ZURUECKGEZOGEN)).map((t) => [t.id, t]),
);

/** Vorlage oder Variante (`<vorlage>--<code>`) nach ID (`Ae`, Export `G`). */
export function getSignatureTemplate(
  id: string,
): SignatureTemplate | undefined {
  const t = BY_ID.get(id);
  if (t) return t;
  const [base, code] = splitVariantId(id);
  const b = code ? BY_ID.get(base) : undefined;
  return (b && buildVariant(b, code!)) || undefined;
}

/**
 * Passt die Vorlage zur Marke (`qt`, Export `W`)? Zuerst die Ähnlichkeitssperre
 * (gleicher Name und Merkmale wie eine Korpusmarke), dann die Regeln (`checkFit`);
 * Varianten dürfen keine neue Überlappung bringen.
 */
export function fits(
  t: SignatureTemplate,
  input: SignatureInput,
  fonts?: FontSource | null,
  opts: FitOptions = {},
): FitResult {
  const twin = corpusTwinName(t, input);
  if (twin)
    return {
      passt: false,
      grund: `Ähnlichkeitssperre: Der Name gleicht einer Referenzmarke (${twin}).`,
    };
  const r = checkFit(t, input, fonts, opts);
  return !r.passt ||
    !fonts ||
    !t.variante ||
    varianteBleibtFrei(
      t,
      BY_ID.get(t.variante.basis),
      input,
      fonts,
      opts.params,
    )
    ? r
    : {
        passt: false,
        grund:
          "Die Variante lässt Texte oder Zeichen überlappen, die Vorlage selbst nicht.",
      };
}

const firstText = (
  t: SignatureTemplate,
  schrift: TextElement["schrift"],
): TextElement | undefined =>
  t.elemente.find(
    (e): e is TextElement => e.typ === "text" && e.schrift === schrift,
  );

/** Fließtext-Schrift: die Nebenschrift im leichtesten Schnitt, sonst Albert Sans (`Jl`). */
function bodyFont(f: FontRef): FontRef {
  const m = getFont(f.key);
  return m.cat === "sans" && m.form !== "mono"
    ? { key: f.key, weight: Math.min(...m.weights) }
    : { key: "albertsans", weight: 400 };
}

/**
 * Vorlage als Logo-Konzept für Galerie, Editor und Kit (`ba`, Export `J`). Die ID
 * enthält Vorlage, Palette und Schriften; `params` nur, wenn etwas gewählt ist.
 */
export function signatureConcept(
  t: SignatureTemplate,
  input: Pick<
    BrandInput,
    "name" | "suffix" | "place" | "nameKind" | "ort2" | "jahr" | "styles"
  >,
  palette: Palette,
  params: SignatureParams = {},
  style?: StyleKey,
): LogoConcept {
  const f = templateFonts(t, input, params);
  const haupt = firstText(t, "haupt");
  const neben = firstText(t, "neben");
  const stil =
    style && t.passt.stile.includes(style)
      ? style
      : (input.styles.find((s) => t.passt.stile.includes(s)) ??
        t.passt.stile[0]!);
  const signature = {
    id: t.id,
    ...(params.haupt ||
    params.neben ||
    params.akzent ||
    params.zusatzMassstab ||
    params.zusatzSchreibung
      ? { params }
      : {}),
  };
  return {
    id: `sig-${t.id}-${palette.id}-${[f.haupt, f.neben, f.akzent].map(fontKey).join("-")}`,
    seed: 0,
    style: stil,
    layout: "wordmark",
    symbol: null,
    name: {
      font: f.haupt,
      case: haupt?.schreibung ?? "asis",
      tracking: haupt?.laufweite ?? 0,
    },
    suffix: {
      font: f.neben,
      case: neben?.schreibung ?? "upper",
      tracking: neben?.laufweite ?? 0.18,
    },
    tagline: { font: f.neben, case: "asis", tracking: 0 },
    body: bodyFont(f.neben),
    palette,
    colors: {
      symbol: t.farben.zeichen,
      name: t.farben.name,
      suffix: t.farben.neben,
    },
    divider: "none",
    cardBackground: t.farben.karte ?? "paper",
    signature,
  };
}

export interface ConceptRenderOptions {
  variant?: string;
  part?: "full" | "symbol" | "wordmark";
  lockup?: string;
  boost?: number;
  ground?: string;
}

/**
 * Konzept mit Signature-Vorlage als SVG-Teil (`Ql`); `null` ohne Vorlage oder wenn
 * ein Zeichen-Ausschnitt leer bleibt (dann zeichnet die Logo-Engine selbst).
 */
export function renderSignature(
  c: LogoConcept,
  input: SignatureInput,
  fonts: FontSource,
  opts: ConceptRenderOptions = {},
): SvgPart | null {
  const s = c.signature;
  if (!s) return null;
  const t = getSignatureTemplate(s.id);
  if (!t) return null;
  const out = renderTemplate(
    t,
    input,
    fonts,
    c.palette,
    opts.variant ?? "color",
    {
      part: opts.part,
      lockup: opts.lockup,
      boost: opts.boost,
      ground: opts.ground,
      params: s.params,
    },
  );
  return !out.width && (opts.part === "symbol" || opts.lockup === "monogram")
    ? null
    : out;
}

/** Schriften, die ein Konzept mit Signature-Vorlage braucht (`Ni`). */
export function signatureFonts(
  c: LogoConcept,
  input: SignatureInput,
): FontRef[] {
  const t = c.signature ? getSignatureTemplate(c.signature.id) : undefined;
  return t ? templateFontRefs(t, input, c.signature?.params) : [];
}
