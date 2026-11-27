/**
 * Orte in Oesterreich: Wiener Bezirke, Staedte, Bundeslaender, Regionen (index-Chunk:
 * `Yc`, `oC`, `aC`, `lC`, `uC`, `GL`, `HL`, `WL`, `nC`, `Nu`, `VL`).
 *
 * Genutzt vom Namensfinder (Ortsnamen, Lageklasse, Weinregion) und von der Oberflaeche
 * (Ortsvorschlaege). Die Daten stehen in `orte.json`; Felder, die im Bundle ausdruecklich
 * `undefined` waren, stehen dort als `{"$undefined": true}` und werden hier entfernt.
 */
import data from "./orte.json";

/** Bekannter Teilort (See, Berg, Gasse), z. B. `{ name: "Mur", at: "an der Mur" }`. */
export interface PlaceMark {
  name: string;
  /** Ortsangabe mit Praeposition */
  at: string;
  adj?: string;
}

export type PlaceKind = "bezirk" | "stadt" | "land" | "region";

export interface Place {
  name: string;
  kind: PlaceKind;
  /** Wiener Bezirksnummer 1 bis 23 */
  district?: number;
  /** Villenbezirk (13, 18, 19) */
  villa?: boolean;
  /** Adjektiv wie "Döblinger" */
  adj?: string;
  /** Ortsangabe wie "in Döbling" */
  loc: string;
  parent?: string;
  rural?: boolean;
  marks?: PlaceMark[];
  aliases?: string[];
}

/** Ergebnis von `resolvePlace`: bekannter Ort oder frei eingegebener Name. */
export type PlaceRef = { known: true; place: Place } | { known: false; name: string };

/** Lageklasse fuer die Passung von Wortfeldern (`HL`). */
export type PlaceClass =
  | "innenstadt"
  | "villa"
  | "altbau"
  | "arbeiter"
  | "land"
  | "stadt"
  | "kleinstadt";

function clean(items: readonly unknown[]): Place[] {
  return items.map((item) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      const undef =
        v !== null && typeof v === "object" && (v as Record<string, unknown>).$undefined === true;
      if (!undef) out[k] = v;
    }
    return out as unknown as Place;
  });
}

/** Die 23 Wiener Bezirke in Nummernfolge (`Yc`). */
export const DISTRICTS: readonly Place[] = clean(data.bezirke);
/** Staedte (`oC`). */
export const CITIES: readonly Place[] = clean(data.staedte);
/** Bundeslaender (`aC`). */
export const STATES: readonly Place[] = clean(data.laender);
/** Regionen (`lC`). */
export const REGIONS: readonly Place[] = clean(data.regionen);
/** Alle Orte in fester Reihenfolge (`uC`). */
export const PLACES: readonly Place[] = [...DISTRICTS, ...CITIES, ...STATES, ...REGIONS];

/** Ortsname vergleichbar machen (`Zi`); `short` faltet Umlaute auf a, o, u. */
function placeKey(text: string, short = false): string {
  const map: Record<string, string> = short
    ? { ä: "a", ö: "o", ü: "u", ß: "ss" }
    : { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
  return text
    .toLocaleLowerCase("de-AT")
    .replace(/[äöüß]/g, (c) => map[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/sankt/g, "st")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Eingabe wie "1190", "19. Bezirk", "Döbling" oder "Wachau" einem bekannten Ort zuordnen
 * (`GL`). Unbekannte, aber plausible Namen kommen als `{ known: false, name }` zurueck.
 */
export function resolvePlace(input: string | undefined | null): PlaceRef | null {
  const text = (input ?? "").trim().replace(/\s+/g, " ");
  if (!text) return null;
  const key = placeKey(text);
  const plz = /^1(0[1-9]|1\d|2[0-3])0(?:\s|$)/.exec(key);
  const nummer = /^(?:wien\s+)?(\d{1,2})(?:\s+bezirk)?(?:\s+wien)?$/.exec(key);
  const district = plz ? Number(plz[1]) : nummer ? Number(nummer[1]) : 0;
  if (district >= 1 && district <= 23) return { known: true, place: DISTRICTS[district - 1]! };
  const keys = [
    key,
    key
      .replace(/^wien\s+|\s+wien$/g, "")
      .replace(/^1\d\d0\s+/, "")
      .trim(),
  ];
  for (const k of keys)
    for (const place of PLACES)
      if (
        [place.name, ...(place.aliases ?? [])].some(
          (n) =>
            placeKey(n) === k ||
            placeKey(n, true) === k ||
            placeKey(n).replace(/ /g, "") === k.replace(/ /g, ""),
        )
      )
        return { known: true, place };
  if (!/^[\p{L}][\p{L} .-]{1,23}$/u.test(text) || !/\p{L}{2}/u.test(text)) return null;
  return {
    known: false,
    name: text
      .split(" ")
      .map((w) =>
        w === w.toLocaleLowerCase("de-AT") &&
        !["am", "an", "der", "im", "in", "bei", "ob"].includes(w)
          ? w.charAt(0).toLocaleUpperCase("de-AT") + w.slice(1)
          : w,
      )
      .join(" "),
  };
}

const BIG_CITIES = new Set(["Wien", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"]);

/** Lageklasse eines bekannten Orts (`HL`). */
export function placeClass(place: Place): PlaceClass {
  if (place.district)
    return place.district === 1
      ? "innenstadt"
      : place.villa
        ? "villa"
        : place.district <= 9
          ? "altbau"
          : "arbeiter";
  if (place.rural || place.kind === "land" || place.kind === "region") return "land";
  return BIG_CITIES.has(place.name) ? "stadt" : "kleinstadt";
}

const WINE_PLACES = new Set([
  "Wachau",
  "Weinviertel",
  "Südsteiermark",
  "Thermenregion",
  "Burgenland",
  "Neusiedler See",
  "Krems",
  "Baden",
  "Perchtoldsdorf",
  "Döbling",
  "Floridsdorf",
  "Liesing",
]);

/** Ort mit Weinbau (`WL`): Weinwoerter passen dort zu Namen. */
export function isWineRegion(place: Place): boolean {
  return WINE_PLACES.has(place.name);
}

const STOP_WORDS = new Set([
  "ich",
  "wir",
  "und",
  "oder",
  "mit",
  "für",
  "fuer",
  "in",
  "im",
  "an",
  "am",
  "auf",
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "ein",
  "eine",
  "einen",
  "einem",
  "verkaufe",
  "vermiete",
  "verkaufen",
  "vermieten",
  "suche",
  "biete",
  "junge",
  "neue",
  "alte",
  "von",
  "zu",
  "zum",
  "zur",
  "bin",
  "sind",
  "mein",
  "meine",
  "unser",
  "unsere",
]);

/**
 * Bis zu vier Stichworte aus einer freien Beschreibung (`nC`): grossgeschriebene Woerter ab
 * vier Buchstaben, "Altbauwohnungen" wird zu "Altbau".
 */
export function keywordsFromText(text: string): string[] {
  const words = text
    .replace(/[^\p{L}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out: string[] = [];
  for (const word of words) {
    if (
      word.length < 4 ||
      STOP_WORDS.has(word.toLocaleLowerCase("de-AT")) ||
      word[0] !== word[0]!.toLocaleUpperCase("de-AT")
    )
      continue;
    const m = word.match(
      /^(.{4,}?)(wohnungen|wohnung|häuser|haeuser|haus|immobilien|objekte|objekt)$/i,
    );
    const kw = m ? m[1]!.replace(/^./, (c) => c.toLocaleUpperCase("de-AT")) : word;
    if (!out.includes(kw)) out.push(kw);
  }
  return out.slice(0, 4);
}

/** Vorschlagsliste im Ortsfeld (`Nu`). */
export const PLACE_SUGGESTIONS: readonly string[] = [
  ...DISTRICTS.map((p) => p.name),
  "Wien",
  "Wienerwald",
  "Mödling",
  "Baden",
  "Klosterneuburg",
  "Tulln",
  "Niederösterreich",
  "Burgenland",
  "Graz",
  "Linz",
  "Salzburg",
  "Innsbruck",
];

/** Ortsvorschlag, der genau dem Wort entspricht (`VL`), sonst `undefined`. */
export function suggestedPlace(word: string): string | undefined {
  const key = word.trim().toLocaleLowerCase("de-AT");
  return PLACE_SUGGESTIONS.find((p) => p.toLocaleLowerCase("de-AT") === key);
}
