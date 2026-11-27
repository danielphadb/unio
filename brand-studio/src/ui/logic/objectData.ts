/**
 * Objekt eines Projekts (Kit: Expose, Inserat): Felder, Grenzen, Platzhalter, Energieklassen, Pruefung,
 * Bereinigung und Aufloesung der Fotos (objectData-Chunk der gesicherten Fassung).
 */
import type { EnergyData, KitObject, ObjectData } from "../../types";
import { ENERGY_CUTOFF, energyState } from "../../deliverables/lib/energy";
import { ValidationError, isWebOk, obj, str, stripWeb } from "./validators";

/** Feldlaengen und Anzahl (`t`, Export `O`). */
export const OBJECT_LIMITS = {
  title: 80,
  address: 120,
  description: 600,
  price: 40,
  url: 200,
  factLabel: 30,
  factValue: 30,
  facts: 8,
  photos: 4,
};
/** Effizienzklassen A++ bis G (`k`, Export `E`). */
export const ENERGY_CLASSES = ["A++", "A+", "A", "B", "C", "D", "E", "F", "G"];
/** EEB-Klasse mit optionalem Zusatz, z. B. "C fossil" (`B`). */
export const EEB_CLASS_RE = /^(A\+\+|A\+|A|B|C|D|E|F|G)( [a-zäöüß]{3,20})?$/i;
/** Datum JJJJ-MM-TT (`y`). */
export const DATE_RE = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
/** EEB-Klasse in Klasse und Zusatz zerlegen (`A`, Export `s`). */
export const splitEebKlasse = (value: string) => {
  const [s = "", ...r] = value.trim().split(/\s+/);
  return { klasse: s, zusatz: r.join(" ") };
};
/** Klasse und Zusatz (klein) zusammensetzen (`I`, Export `j`). */
export const joinEebKlasse = (klasse: string, zusatz: string) =>
  [klasse.trim(), zusatz.trim().toLocaleLowerCase("de-AT")].filter(Boolean).join(" ");
/** Ausweis vor dem Stichtag 1.7.2026 ausgestellt (`v`, Export `v`). */
export const isOldCertificate = (date: string | undefined) => !!date && DATE_RE.test(date) && date < ENERGY_CUTOFF;
/** Vorschlaege fuer Kennzahlen (`F`, Export `a`). */
export const FACT_LABELS = [
  "Wohnfläche",
  "Zimmer",
  "Freifläche",
  "Baujahr",
  "Grundfläche",
  "Stockwerk",
  "Stellplatz",
  "Heizung",
];
/** Platzhalter je Kennzahl (`T`, Export `F`). */
export const FACT_PLACEHOLDERS = {
  Wohnfläche: "z. B. 84 m²",
  Zimmer: "z. B. 3",
  Freifläche: "z. B. 12 m² Balkon",
  Baujahr: "z. B. 1908",
  Grundfläche: "z. B. 640 m²",
  Stockwerk: "z. B. 3. Stock",
  Stellplatz: "z. B. Tiefgarage",
  Heizung: "z. B. Fernwärme",
};
/** Leeres Objekt mit drei Kennzahl-Feldern (`C`, Export `b`). */
export function emptyObject() {
  return {
    title: "",
    address: "",
    description: "",
    facts: [
      { label: "Wohnfläche", value: "" },
      { label: "Zimmer", value: "" },
      { label: "Freifläche", value: "" },
    ],
    energy: { hwb: "", fgee: "", klasse: "", eeb: "", eebKlasse: "", ausweisDatum: "" },
    price: "",
    url: "",
    photoIds: [],
  };
}
/** Foto-ID (`S`). */
export const PHOTO_ID_RE = /^[a-z0-9]{6,40}$/;
/** Zahl mit Komma oder Punkt (HWB, fGEE, EEB) (`b`). */
export const NUMBER_RE = /^\d{1,4}([.,]\d{1,2})?$/;
/** Gespeichertes Objekt pruefen (null ohne Objekt) (`L`, Export `o`). */
export function validateObject(value: unknown, path = "projekt.object") {
  if (value == null) return null;
  const r = obj(value, path);
  const c = new Set([
    "title",
    "address",
    "description",
    "facts",
    "energy",
    "price",
    "url",
    "photoIds",
  ]);
  const o = new Set(["hwb", "fgee", "klasse", "eeb", "eebKlasse", "ausweisDatum"]);
  for (const n of Object.keys(r)) if (!c.has(n)) throw new ValidationError(`${path}.${n}`);
  if (!Array.isArray(r.facts) || r.facts.length > OBJECT_LIMITS.facts)
    throw new ValidationError(`${path}.facts`);
  const p = r.facts.map((n, g) => {
    const $ = obj(n, `${path}.facts.${g}`);
    return {
      label: str($.label, `${path}.facts.${g}.label`, OBJECT_LIMITS.factLabel),
      value: str($.value, `${path}.facts.${g}.value`, OBJECT_LIMITS.factValue),
    };
  });
  const l = obj(r.energy, `${path}.energy`);
  for (const n of Object.keys(l)) if (!o.has(n)) throw new ValidationError(`${path}.energy.${n}`);
  const u = str(l.klasse, `${path}.energy.klasse`, 3);
  if (u && !ENERGY_CLASSES.includes(u)) throw new ValidationError(`${path}.energy.klasse`);
  if (!Array.isArray(r.photoIds) || r.photoIds.length > OBJECT_LIMITS.photos)
    throw new ValidationError(`${path}.photoIds`);
  const m = r.photoIds.map((n, g) => str(n, `${path}.photoIds.${g}`, 40, { pattern: PHOTO_ID_RE }));
  if (new Set(m).size !== m.length) throw new ValidationError(`${path}.photoIds`);
  return {
    title: str(r.title, `${path}.title`, OBJECT_LIMITS.title),
    address: str(r.address, `${path}.address`, OBJECT_LIMITS.address),
    description: str(r.description, `${path}.description`, OBJECT_LIMITS.description),
    facts: p,
    energy: {
      hwb: str(l.hwb, `${path}.energy.hwb`, 7, { pattern: NUMBER_RE }),
      fgee: str(l.fgee, `${path}.energy.fgee`, 7, { pattern: NUMBER_RE }),
      klasse: u,
      eeb: str(l.eeb, `${path}.energy.eeb`, 7, { optional: true, pattern: NUMBER_RE }),
      eebKlasse: str(l.eebKlasse, `${path}.energy.eebKlasse`, 30, {
        optional: true,
        pattern: EEB_CLASS_RE,
      }),
      ausweisDatum: str(l.ausweisDatum, `${path}.energy.ausweisDatum`, 10, {
        optional: true,
        pattern: DATE_RE,
      }),
    },
    price: str(r.price, `${path}.price`, OBJECT_LIMITS.price),
    url: str(r.url, `${path}.url`, OBJECT_LIMITS.url),
    photoIds: m,
  };
}
/** Fehlermeldungen je Feld (`a`). */
export const OBJECT_ERRORS = {
  title: "Gib dem Objekt einen kurzen Titel, z. B. „Dachgeschoss mit Weitblick“.",
  address: `Die Adresse ist zu lang (höchstens ${OBJECT_LIMITS.address} Zeichen).`,
  description: `Die Beschreibung ist zu lang (höchstens ${OBJECT_LIMITS.description} Zeichen).`,
  price: `Der Preis ist zu lang (höchstens ${OBJECT_LIMITS.price} Zeichen).`,
  url: "Diese Adresse sieht nicht wie eine Website aus, z. B. „berger-immobilien.at/objekt-12“.",
  hwb: "Gib den HWB als Zahl ein, z. B. 45 oder 45,3.",
  fgee: "Gib den fGEE als Zahl ein, z. B. 0,85.",
  klasse: "Wähle die Klasse aus deinem Energieausweis.",
  eeb: "Gib den EEB als Zahl ein, z. B. 62 oder 61,8.",
  eebKlasse: "Wähle die Klasse zum EEB. Der Zusatz ist ein Wort, z. B. fossil.",
  ausweisDatum: "Gib das Datum wie auf dem Ausweis ein.",
  facts: `Kennzahlen höchstens ${OBJECT_LIMITS.factValue} Zeichen je Feld.`,
  photos: `Höchstens ${OBJECT_LIMITS.photos} Fotos.`,
};
/** Fehlermeldungen je Feld (leer = alles in Ordnung). */
export type ObjectErrors = Partial<Record<keyof typeof OBJECT_ERRORS, string>>;
/** Leerraum zusammenziehen (`f`). */
export const squash = (text: string) => text.replace(/\s+/g, " ").trim();
/** Fehlermeldungen je Feld (leer = in Ordnung) (`W`, Export `d`). */
export function objectErrors(object: ObjectData): ObjectErrors {
  const s: ObjectErrors = {};
  if (!squash(object.title) || object.title.length > OBJECT_LIMITS.title) {
    s.title = OBJECT_ERRORS.title;
  }
  if (object.address.length > OBJECT_LIMITS.address) {
    s.address = OBJECT_ERRORS.address;
  }
  if (object.description.length > OBJECT_LIMITS.description) {
    s.description = OBJECT_ERRORS.description;
  }
  if (object.price.length > OBJECT_LIMITS.price) {
    s.price = OBJECT_ERRORS.price;
  }
  if (object.url && (!isWebOk(object.url) || object.url.length > OBJECT_LIMITS.url)) {
    s.url = OBJECT_ERRORS.url;
  }
  const r = object.energy.hwb.trim();
  const c = object.energy.fgee.trim();
  if (r && !NUMBER_RE.test(r)) {
    s.hwb = OBJECT_ERRORS.hwb;
  }
  if (c && !NUMBER_RE.test(c)) {
    s.fgee = OBJECT_ERRORS.fgee;
  }
  if (object.energy.klasse && !ENERGY_CLASSES.includes(object.energy.klasse)) {
    s.klasse = OBJECT_ERRORS.klasse;
  }
  const o = (object.energy.eeb ?? "").trim();
  const p = (object.energy.eebKlasse ?? "").trim();
  const l = (object.energy.ausweisDatum ?? "").trim();
  if (o && !NUMBER_RE.test(o)) {
    s.eeb = OBJECT_ERRORS.eeb;
  }
  if (p && !EEB_CLASS_RE.test(p)) {
    s.eebKlasse = OBJECT_ERRORS.eebKlasse;
  }
  if (l && !DATE_RE.test(l)) {
    s.ausweisDatum = OBJECT_ERRORS.ausweisDatum;
  }
  if (
    object.facts.length > OBJECT_LIMITS.facts ||
    object.facts.some(
      (u) => u.label.length > OBJECT_LIMITS.factLabel || u.value.length > OBJECT_LIMITS.factValue,
    )
  ) {
    s.facts = OBJECT_ERRORS.facts;
  }
  if (object.photoIds.length > OBJECT_LIMITS.photos) {
    s.photos = OBJECT_ERRORS.photos;
  }
  return s;
}
/** Energieausweis vollstaendig (`Z`, Export `e`). */
export const energyComplete = (object: ObjectData | null | undefined) => !!object && energyState({ energy: object.energy }) === "voll";
/** Objekt vor dem Speichern bereinigen (`_`, Export `f`). */
export function cleanObject(object: ObjectData) {
  return {
    title: squash(object.title).slice(0, OBJECT_LIMITS.title),
    address: squash(object.address).slice(0, OBJECT_LIMITS.address),
    description: object.description.trim().slice(0, OBJECT_LIMITS.description),
    facts: object.facts
      .map((s) => ({
        label: squash(s.label).slice(0, OBJECT_LIMITS.factLabel),
        value: squash(s.value).slice(0, OBJECT_LIMITS.factValue),
      }))
      .filter((s) => s.label && s.value)
      .slice(0, OBJECT_LIMITS.facts),
    energy: {
      hwb: object.energy.hwb.trim().replace(".", ","),
      fgee: object.energy.fgee.trim().replace(".", ","),
      klasse: object.energy.klasse,
      eeb: (object.energy.eeb ?? "").trim().replace(".", ","),
      eebKlasse: (() => {
        const s = splitEebKlasse(object.energy.eebKlasse ?? "");
        return joinEebKlasse(s.klasse.toUpperCase(), s.zusatz);
      })(),
      ausweisDatum: (object.energy.ausweisDatum ?? "").trim(),
    },
    price: squash(object.price).slice(0, OBJECT_LIMITS.price),
    url: object.url && isWebOk(object.url) ? stripWeb(object.url).slice(0, OBJECT_LIMITS.url) : "",
    photoIds: object.photoIds.slice(0, OBJECT_LIMITS.photos),
  };
}
/** Objekt mit aufgeloesten Fotos fuer Kit und Unterlagen (`K`). */
export function kitObject(
  object: ObjectData | null | undefined,
  photos: Record<string, string>,
): KitObject | undefined {
  if (object)
    return {
      title: object.title,
      address: object.address,
      description: object.description,
      facts: object.facts,
      energy: object.energy,
      ...(object.price ? { price: object.price } : {}),
      ...(object.url ? { url: object.url } : {}),
      photos: object.photoIds.map((r) => photos[r]).filter((r): r is string => !!r),
    };
}
/** Zwischenspeicher fuer resolveKitObject (`h`). */
export let kitObjectCache: {
  o: ObjectData | null | undefined;
  key: string;
  data: KitObject | undefined;
} | null = null;
/** wie kitObject, mit Zwischenspeicher (gleiche Fotos, gleiches Objekt) (`V`, Export `c`). */
export function resolveKitObject(object: ObjectData | null | undefined, photos: Record<string, string>) {
  const r = object ? object.photoIds.map((o) => (photos[o] ? o : "-")).join(",") : "";
  if (kitObjectCache && kitObjectCache.o === object && kitObjectCache.key === r)
    return kitObjectCache.data;
  const c = kitObject(object, photos);
  kitObjectCache = { o: object, key: r, data: c };
  return c;
}
