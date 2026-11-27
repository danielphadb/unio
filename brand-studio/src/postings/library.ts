/**
 * Objekt-Bibliothek je Marke (Ausbaustufe 6.1): mehrere Objekte mit Status, bis zu 20 Fotos mit
 * Bildausschnitt, Bildrechten und Kennzeichnung virtuell moebliert; Pruefung, Bereinigung, Aenderungen (library-Chunk der gesicherten Fassung).
 */
import type { Fact, ObjectData } from "../types";
import type {
  Library,
  LibraryObject,
  LibraryPhoto,
  ObjectStatus,
  ObjectKind,
  ObjectSource,
  PhotoFocus,
  ObjectEnergy,
} from "./model";
import { ENERGY_CLASSES } from "../ui/logic/objectData";
import {
  ValidationError,
  bool,
  isWebOk,
  num,
  obj,
  oneOf,
  str,
  stripWeb,
} from "../ui/logic/validators";

/** Grenzen der Bibliothek (Anzahl, Feldlaengen) (`i`, Export `L`). */
export const LIBRARY_LIMITS = {
  objects: 40,
  photos: 20,
  title: 80,
  address: 120,
  lage: 60,
  description: 600,
  price: 40,
  commission: 80,
  url: 200,
  credit: 80,
  factLabel: 30,
  factValue: 30,
  facts: 8,
  externalId: 80,
};
/** Status eines Objekts (`z`, Export `b`). */
export const OBJECT_STATUSES: ObjectStatus[] = ["neu", "reserviert", "verkauft", "vermietet", "preis-angepasst"];
/** Anzeige je Status (`N`, Export `S`). */
export const STATUS_LABEL: Record<ObjectStatus, string> = {
  neu: "Neu",
  reserviert: "Reserviert",
  verkauft: "Verkauft",
  vermietet: "Vermietet",
  "preis-angepasst": "Preis angepasst",
};
/** (`E`) */
export const OBJECT_KINDS: ObjectKind[] = ["kauf", "miete"];
/** (`L`) */
export const OBJECT_SOURCES: ObjectSource[] = ["studio", "kit", "unio"];
/** Bildausschnitt ohne Wahl: Mitte, kein Zoom (`v`, Export `D`). */
export const DEFAULT_FOCUS: PhotoFocus = { x: 0.5, y: 0.5, zoom: 1 };
/** Groesster Zoom des Bildausschnitts (`P`, Export `Z`). */
export const MAX_ZOOM = 2.5;
/** Leerer Energieausweis (`h`). */
export const EMPTY_ENERGY: ObjectEnergy = {
  hwb: "",
  fgee: "",
  klasse: "",
  eeb: "",
  eebKlasse: "",
  ausweisDatum: "",
};
/** Neue Objekt-ID (`j`). */
export function newObjectId(): string {
  return `o${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
/** Leeres Objekt mit drei Kennzahl-Feldern (`V`, Export `e`). */
export function createObject(now = Date.now(), id = newObjectId()): LibraryObject {
  return {
    id: id,
    source: "studio",
    externalId: "",
    title: "",
    address: "",
    lage: "",
    kind: "kauf",
    status: "neu",
    statusSince: now,
    price: "",
    previousPrice: "",
    commission: "",
    description: "",
    facts: [
      { label: "Wohnfläche", value: "" },
      { label: "Zimmer", value: "" },
      { label: "Freifläche", value: "" },
    ],
    energy: { ...EMPTY_ENERGY },
    photos: [],
    url: "",
    createdAt: now,
    updatedAt: now,
  };
}
/** Lage fuer Postings: eingetragen oder letzter Teil der Adresse (`M`, Export `a`). */
export function lageOf(object: { lage: string; address: string }): string {
  const t = object.lage.replace(/\s+/g, " ").trim();
  if (t) return t;
  const s = object.address
    .split(",")
    .map((r) => r.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return s.length < 2 ? "" : s[s.length - 1]!;
}
/** (`O`) */
export const PHOTO_ID_RE = /^[a-z0-9]{6,40}$/;
/** (`B`) */
export const OBJECT_ID_RE = /^[a-z0-9]{4,40}$/;
/** (`d`) */
export const NUMBER_RE = /^\d{1,4}([.,]\d{1,2})?$/;
/** (`A`) */
export const DATE_RE = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
/** (`D`) */
export const EEB_CLASS_RE = /^(A\+\+|A\+|A|B|C|D|E|F|G)( [a-zäöüß]{3,20})?$/i;
/** (`l`) */
export const squash = (text: string) => text.replace(/\s+/g, " ").trim();
/** Energieausweis pruefen (`K`). */
export function validateEnergy(value: unknown, path: string): ObjectEnergy {
  const s = obj(value, path);
  const r = (n: unknown, o: string) => {
    const u = str(n, o, 3, { optional: true });
    if (u && !ENERGY_CLASSES.includes(u)) throw new ValidationError(o);
    return u;
  };
  return {
    hwb: str(s.hwb, `${path}.hwb`, 7, { optional: true, pattern: NUMBER_RE }),
    klasse: r(s.klasse, `${path}.klasse`),
    eeb: str(s.eeb, `${path}.eeb`, 7, { optional: true, pattern: NUMBER_RE }),
    eebKlasse: str(s.eebKlasse, `${path}.eebKlasse`, 30, { optional: true, pattern: EEB_CLASS_RE }),
    fgee: str(s.fgee, `${path}.fgee`, 7, { optional: true, pattern: NUMBER_RE }),
    ausweisDatum: str(s.ausweisDatum, `${path}.ausweisDatum`, 10, {
      optional: true,
      pattern: DATE_RE,
    }),
  };
}
/** Foto pruefen (`T`). */
export function validatePhoto(value: unknown, path: string): LibraryPhoto {
  const s = obj(value, path);
  const r = s.focus === undefined ? DEFAULT_FOCUS : obj(s.focus, `${path}.focus`);
  return {
    id: str(s.id, `${path}.id`, 40, { pattern: PHOTO_ID_RE }),
    focus: {
      x: num(r.x, `${path}.focus.x`, 0, 1),
      y: num(r.y, `${path}.focus.y`, 0, 1),
      zoom: num(r.zoom, `${path}.focus.zoom`, 1, MAX_ZOOM),
    },
    rights: bool(s.rights, `${path}.rights`),
    virtual: bool(s.virtual, `${path}.virtual`),
    credit: str(s.credit, `${path}.credit`, LIBRARY_LIMITS.credit, { optional: true }),
  };
}
/** Kennzahlen pruefen (`_`). */
export function validateFacts(value: unknown, path: string): Fact[] {
  if (!Array.isArray(value) || value.length > LIBRARY_LIMITS.facts) throw new ValidationError(path);
  return value.map((s, r) => {
    const n = obj(s, `${path}.${r}`);
    return {
      label: str(n.label, `${path}.${r}.label`, LIBRARY_LIMITS.factLabel),
      value: str(n.value, `${path}.${r}.value`, LIBRARY_LIMITS.factValue),
    };
  });
}
/** Objekt pruefen (`Z`). */
export function validateLibraryObject(value: unknown, path: string): LibraryObject {
  const s = obj(value, path);
  if (!Array.isArray(s.photos) || s.photos.length > LIBRARY_LIMITS.photos)
    throw new ValidationError(`${path}.photos`);
  const r = s.photos.map((o, u) => validatePhoto(o, `${path}.photos.${u}`));
  if (new Set(r.map((o) => o.id)).size !== r.length) throw new ValidationError(`${path}.photos`);
  const n = (o: unknown) => (o === undefined ? 0 : num(o, path, 0, 100000000000000));
  return {
    id: str(s.id, `${path}.id`, 40, { pattern: OBJECT_ID_RE }),
    source: oneOf(s.source ?? "studio", OBJECT_SOURCES, `${path}.source`),
    externalId: str(s.externalId, `${path}.externalId`, LIBRARY_LIMITS.externalId, {
      optional: true,
      pattern: /^[A-Za-z0-9_.:-]+$/,
    }),
    title: str(s.title, `${path}.title`, LIBRARY_LIMITS.title),
    address: str(s.address, `${path}.address`, LIBRARY_LIMITS.address, { optional: true }),
    lage: str(s.lage, `${path}.lage`, LIBRARY_LIMITS.lage, { optional: true }),
    kind: oneOf(s.kind ?? "kauf", OBJECT_KINDS, `${path}.kind`),
    status: oneOf(s.status ?? "neu", OBJECT_STATUSES, `${path}.status`),
    statusSince: n(s.statusSince),
    price: str(s.price, `${path}.price`, LIBRARY_LIMITS.price, { optional: true }),
    previousPrice: str(s.previousPrice, `${path}.previousPrice`, LIBRARY_LIMITS.price, {
      optional: true,
    }),
    commission: str(s.commission, `${path}.commission`, LIBRARY_LIMITS.commission, { optional: true }),
    description: str(s.description, `${path}.description`, LIBRARY_LIMITS.description, {
      optional: true,
    }),
    facts: s.facts === undefined ? [] : validateFacts(s.facts, `${path}.facts`),
    energy: s.energy === undefined ? { ...EMPTY_ENERGY } : validateEnergy(s.energy, `${path}.energy`),
    photos: r,
    url: str(s.url, `${path}.url`, LIBRARY_LIMITS.url, { optional: true }),
    createdAt: n(s.createdAt),
    updatedAt: n(s.updatedAt),
  };
}
/** Bibliothek pruefen; ohne Bibliothek wird das alte Kit-Objekt uebernommen (`U`, Export `l`). */
export function validateLibrary(value: unknown, legacy: ObjectData | null | undefined, path = "projekt.library") {
  if (value == null) return { objects: legacy ? [fromKitObject(legacy)] : [] };
  const r = obj(value, path);
  if (!Array.isArray(r.objects) || r.objects.length > LIBRARY_LIMITS.objects)
    throw new ValidationError(`${path}.objects`);
  const n = r.objects.map((o, u) => validateLibraryObject(o, `${path}.objects.${u}`));
  if (new Set(n.map((o) => o.id)).size !== n.length) throw new ValidationError(`${path}.objects`);
  return { objects: n };
}
/** Kit-Objekt (ein Objekt je Projekt) als Bibliotheksobjekt (`F`). */
export function fromKitObject(object: ObjectData, now = Date.now()): LibraryObject {
  return {
    id: "kitobjekt",
    source: "kit",
    externalId: "",
    title: object.title,
    address: object.address,
    lage: "",
    kind: "kauf",
    status: "neu",
    statusSince: 0,
    price: object.price,
    previousPrice: "",
    commission: "",
    description: object.description,
    facts: object.facts.map((s) => ({ ...s })),
    energy: {
      ...EMPTY_ENERGY,
      hwb: object.energy.hwb,
      fgee: object.energy.fgee,
      klasse: object.energy.klasse,
      eeb: object.energy.eeb ?? "",
      eebKlasse: object.energy.eebKlasse ?? "",
      ausweisDatum: object.energy.ausweisDatum ?? "",
    },
    photos: object.photoIds.map((s) => ({
      id: s,
      focus: { ...DEFAULT_FOCUS },
      rights: false,
      virtual: false,
      credit: "",
    })),
    url: object.url,
    createdAt: now,
    updatedAt: now,
  };
}
/** Fehlermeldungen je Feld (`c`). */
export const LIBRARY_ERRORS = {
  title: "Gib dem Objekt einen kurzen Titel, z. B. „Dachgeschoss mit Weitblick“.",
  address: `Die Adresse ist zu lang (höchstens ${LIBRARY_LIMITS.address} Zeichen).`,
  lage: `Die Lage ist zu lang (höchstens ${LIBRARY_LIMITS.lage} Zeichen).`,
  price: `Der Preis ist zu lang (höchstens ${LIBRARY_LIMITS.price} Zeichen).`,
  previousPrice: "Trag den bisherigen Preis ein, z. B. € 590.000.",
  commission: `Die Provision ist zu lang (höchstens ${LIBRARY_LIMITS.commission} Zeichen).`,
  description: `Die Beschreibung ist zu lang (höchstens ${LIBRARY_LIMITS.description} Zeichen).`,
  url: "Diese Adresse sieht nicht wie eine Website aus, z. B. „beispiel-immobilien.at/objekt-12“.",
  hwb: "Gib den HWB als Zahl ein, z. B. 45 oder 45,3.",
  eeb: "Gib den EEB als Zahl ein, z. B. 62 oder 62,4.",
  eebKlasse: "Wähle die Klasse aus deinem Energieausweis, z. B. C oder C fossil.",
  fgee: "Gib den fGEE als Zahl ein, z. B. 0,85.",
  ausweisDatum: "Gib das Datum aus dem Energieausweis ein.",
  facts: `Kennzahlen höchstens ${LIBRARY_LIMITS.factValue} Zeichen je Feld.`,
  photos: `Höchstens ${LIBRARY_LIMITS.photos} Fotos je Objekt.`,
};
/** Fehlermeldungen je Feld. */
export type LibraryErrors = Partial<Record<keyof typeof LIBRARY_ERRORS, string>>;
/** Fehlermeldungen je Feld (leer = in Ordnung) (`W`, Export `v`). */
export function libraryObjectErrors(object: LibraryObject): LibraryErrors {
  const t: LibraryErrors = {};
  if (!squash(object.title) || object.title.length > LIBRARY_LIMITS.title) {
    t.title = LIBRARY_ERRORS.title;
  }
  if (object.address.length > LIBRARY_LIMITS.address) {
    t.address = LIBRARY_ERRORS.address;
  }
  if (object.lage.length > LIBRARY_LIMITS.lage) {
    t.lage = LIBRARY_ERRORS.lage;
  }
  if (object.price.length > LIBRARY_LIMITS.price) {
    t.price = LIBRARY_ERRORS.price;
  }
  if (
    object.previousPrice.length > LIBRARY_LIMITS.price ||
    (object.status === "preis-angepasst" && !squash(object.previousPrice))
  ) {
    t.previousPrice = LIBRARY_ERRORS.previousPrice;
  }
  if (object.commission.length > LIBRARY_LIMITS.commission) {
    t.commission = LIBRARY_ERRORS.commission;
  }
  if (object.description.length > LIBRARY_LIMITS.description) {
    t.description = LIBRARY_ERRORS.description;
  }
  if (object.url && (!isWebOk(object.url) || object.url.length > LIBRARY_LIMITS.url)) {
    t.url = LIBRARY_ERRORS.url;
  }
  if (object.energy.hwb.trim() && !NUMBER_RE.test(object.energy.hwb.trim())) {
    t.hwb = LIBRARY_ERRORS.hwb;
  }
  if (object.energy.eeb.trim() && !NUMBER_RE.test(object.energy.eeb.trim())) {
    t.eeb = LIBRARY_ERRORS.eeb;
  }
  if (object.energy.fgee.trim() && !NUMBER_RE.test(object.energy.fgee.trim())) {
    t.fgee = LIBRARY_ERRORS.fgee;
  }
  if (object.energy.eebKlasse.trim() && !EEB_CLASS_RE.test(object.energy.eebKlasse.trim())) {
    t.eebKlasse = LIBRARY_ERRORS.eebKlasse;
  }
  if (object.energy.ausweisDatum && !DATE_RE.test(object.energy.ausweisDatum)) {
    t.ausweisDatum = LIBRARY_ERRORS.ausweisDatum;
  }
  if (
    object.facts.length > LIBRARY_LIMITS.facts ||
    object.facts.some(
      (s) => s.label.length > LIBRARY_LIMITS.factLabel || s.value.length > LIBRARY_LIMITS.factValue,
    )
  ) {
    t.facts = LIBRARY_ERRORS.facts;
  }
  if (object.photos.length > LIBRARY_LIMITS.photos) {
    t.photos = LIBRARY_ERRORS.photos;
  }
  return t;
}
/** Dezimalpunkt zu Komma (`p`). */
export const decimalComma = (value: string) => value.trim().replace(".", ",");
/** Objekt vor dem Speichern bereinigen (`x`, Export `f`). */
export function cleanLibraryObject(object: LibraryObject, now = Date.now()): LibraryObject {
  return {
    ...object,
    externalId: object.externalId.slice(0, LIBRARY_LIMITS.externalId),
    title: squash(object.title).slice(0, LIBRARY_LIMITS.title),
    address: squash(object.address).slice(0, LIBRARY_LIMITS.address),
    lage: squash(object.lage).slice(0, LIBRARY_LIMITS.lage),
    price: squash(object.price).slice(0, LIBRARY_LIMITS.price),
    previousPrice: squash(object.previousPrice).slice(0, LIBRARY_LIMITS.price),
    commission: squash(object.commission).slice(0, LIBRARY_LIMITS.commission),
    description: object.description.trim().slice(0, LIBRARY_LIMITS.description),
    facts: object.facts
      .map((s) => ({
        label: squash(s.label).slice(0, LIBRARY_LIMITS.factLabel),
        value: squash(s.value).slice(0, LIBRARY_LIMITS.factValue),
      }))
      .filter((s) => s.label && s.value)
      .slice(0, LIBRARY_LIMITS.facts),
    energy: {
      ...object.energy,
      hwb: decimalComma(object.energy.hwb),
      eeb: decimalComma(object.energy.eeb),
      fgee: decimalComma(object.energy.fgee),
      eebKlasse: object.energy.eebKlasse
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^(\S+)(.*)$/, (s, r, n) => r.toUpperCase() + n.toLocaleLowerCase("de-AT")),
    },
    photos: object.photos
      .slice(0, LIBRARY_LIMITS.photos)
      .map((s) => ({ ...s, credit: squash(s.credit).slice(0, LIBRARY_LIMITS.credit) })),
    url: object.url && isWebOk(object.url) ? stripWeb(object.url).slice(0, LIBRARY_LIMITS.url) : "",
    updatedAt: now,
  };
}
/** Objekt einfuegen (vorne) oder ersetzen (`J`, Export `u`). */
export function upsertObject(library: Library, object: LibraryObject): Library {
  const s = library.objects.filter((n) => n.id !== object.id);
  return library.objects.findIndex((n) => n.id === object.id) >= 0
    ? { objects: library.objects.map((n) => (n.id === object.id ? object : n)) }
    : { objects: [object, ...s].slice(0, LIBRARY_LIMITS.objects) };
}
/** Objekt entfernen (`Y`, Export `r`). */
export function removeObject(library: Library, id: string): Library {
  return { objects: library.objects.filter((s) => s.id !== id) };
}
/** Status setzen; bei "Preis angepasst" wird der bisherige Preis gemerkt (`H`, Export `s`). */
export function setStatus(object: LibraryObject, status: ObjectStatus, now = Date.now()): LibraryObject {
  if (object.status === status) return object;
  const r = status === "preis-angepasst" && !object.previousPrice ? object.price : object.previousPrice;
  return { ...object, status: status, statusSince: now, previousPrice: r, updatedAt: now };
}
/** Foto verschieben (`X`, Export `m`). */
export function movePhoto(object: LibraryObject, from: number, to: number): LibraryObject {
  const r = [...object.photos];
  const [n] = r.splice(from, 1);
  return n ? (r.splice(Math.max(0, Math.min(r.length, to)), 0, n), { ...object, photos: r }) : object;
}
/** Foto aendern (Ausschnitt wird zusammengefuehrt) (`q`, Export `c`). */
export function updatePhoto(object: LibraryObject, id: string, patch: Partial<Omit<LibraryPhoto, "focus">> & { focus?: Partial<PhotoFocus> }) {
  return {
    ...object,
    photos: object.photos.map((r) =>
      r.id === id ? { ...r, ...patch, focus: { ...r.focus, ...(patch.focus ?? {}) } } : r,
    ),
  };
}
/** Objekt kopieren (neue ID, Titel mit "(Kopie)") (`Q`, Export `d`). */
export function duplicateObject(object: LibraryObject, now = Date.now()): LibraryObject {
  return {
    ...JSON.parse(JSON.stringify(object)),
    id: newObjectId(),
    source: "studio",
    externalId: "",
    title: `${object.title} (Kopie)`.slice(0, LIBRARY_LIMITS.title),
    createdAt: now,
    updatedAt: now,
  };
}
/** Wird das Foto in einem Projekt noch gebraucht (ausser im genannten Objekt)? (`ee`, Export `p`) */
export function photoInUse(projects: Array<{ id: string; object?: ObjectData | null; library?: Library | null }>, photoId: string, except?: { projectId: string; kit?: boolean; objectId?: string } | null) {
  return projects.some((r) => {
    const n = except && r.id === except.projectId;
    return r.object?.photoIds.includes(photoId) && !(n && except != null && except.kit)
      ? true
      : (r.library?.objects ?? []).some(
          ($) => !(n && $.id === except?.objectId) && $.photos.some((S) => S.id === photoId),
        );
  });
}
