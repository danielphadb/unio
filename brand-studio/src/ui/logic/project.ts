/**
 * Projekt (eine Marke): Typ, Anlegen, Namensform, Stilwahl, Filter, Favoriten, Bearbeitung im Editor, Kopie.
 * Gesicherte Fassung: index-Chunk (Ik, l0, pL, mL, gL, vL, yL, xL, Uk).
 */
import { emptyContact } from "./contact";

import type { BrandInput, Contact, LogoConcept, NameContext } from "../../types";
import type { BrandBrief, BrandRoute } from "../../strategy/types";

/** Ansicht und Bearbeitungsstand eines Projekts. */
export interface ProjectUi {
  route: string;
  editorTab: string;
  galleryCount: number;
  previewMode: string;
  lastConceptIndex: number;
}

/** Logo, das gerade im Editor bearbeitet wird (Ausgangskonzept und aktueller Stand). */
export interface Editing {
  baseId: string;
  baseNo: number;
  base: LogoConcept;
  concept: LogoConcept;
  edited: boolean;
}

/** Eine Marke im Brand Studio, so wie sie im Browser gespeichert wird (Schema-Version 1). */
export interface Project {
  id: string;
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  input: BrandInput;
  contact: Contact;
  favorites: LogoConcept[];
  selected: LogoConcept | null;
  rawName: string;
  legalForm: string | null;
  legalFormInLogo: boolean;
  suffixChoice: string;
  styleChoice: string | null;
  seed: number;
  showTaglineInLogo: boolean;
  wordmarkOnly: boolean;
  nameFormats: string[];
  templateSet: "unio" | "own";
  templateChosen: boolean;
  /** Objektdaten (ein Objekt, ältere Fassung) */
  object: any;
  /** Objekt-Bibliothek (Postings) */
  library?: any;
  nameCandidates: any[];
  nameContext?: NameContext;
  fromFinder?: boolean;
  brief?: BrandBrief;
  route?: BrandRoute;
  pinned: LogoConcept | null;
  numbers: Record<string, number>;
  editing: Editing | null;
  selectedBaseId: string | null;
  kitDone: boolean;
  contactSaved: boolean;
  firstEditToastShown: boolean;
  persistRequested: boolean;
  ui: ProjectUi;
}

/** Eingaben aus dem Namensformular. */
export interface NameForm {
  rawName: string;
  suffixChoice: string;
  customSuffix: string;
  keepLegalForm: boolean;
  place?: string;
  nameKind?: any;
}

export const LEGAL_FORM = String.raw`(?:GmbH|GesbR|KG|OG|AG|e\.\s?U\.|Co\.?)`;

export const LEGAL_FORM_RE = new RegExp(
  String.raw`(?:^|[\s,]+)(${LEGAL_FORM}(?:\s*(?:&|und|,)?\s*${LEGAL_FORM})*)\s*$`,
  "u",
);

export function splitLegalForm(rawName: any) {
  const t = rawName.trim();
  const n = LEGAL_FORM_RE.exec(t);
  if (!n) return null;
  const r = t
    .slice(0, n.index)
    .replace(/[\s,&-]+$/u, "")
    .trim();
  return r ? { form: n[1]!.trim(), stripped: r } : null;
}

export const FOCUS_KEYS = ["wohnen", "haeuser", "luxus", "anleger", "gewerbe", "neubau", "land"];

export const SCHEMA_VERSION = 1;

export const SUFFIX_CHOICES = ["Immobilien", "Real Estate", "Immobilienberatung", "none", "custom"];

export const PREVIEW_MODES = ["logo", "visitenkarte", "instagram", "schild", "unio-flyer"];

export const PROJECT_NAME_FORMATS = [
  "full",
  "upper",
  "surname",
  "stacked",
  "initial",
  "monogram",
  "district",
];

export function withNameKind(input: any, nameKind: any) {
  const n: any = { ...input };
  if (nameKind) {
    n.nameKind = nameKind;
  } else {
    delete n.nameKind;
  }
  return n;
}

export function nameContextOf(fields: any): NameContext | undefined {
  const t = (a: any, o: any) => (a ?? "").trim().slice(0, o);
  const n = [...new Set((fields.keywords ?? []).map((a: any) => t(a, 40)).filter(Boolean))].slice(0, 7);
  const r = [...new Set((fields.focus ?? []).filter((a: any) => FOCUS_KEYS.includes(a)))];
  const s = t(fields.person, 80);
  const i = t(fields.company, 80);
  if (!(!n.length && !r.length && !s && !i))
    return {
      ...(s ? { person: s } : {}),
      ...(i ? { company: i } : {}),
      keywords: n as string[],
      focus: r as NameContext["focus"],
    };
}

export const nameFieldsOf = (e: any) => ({
  rawName: e.rawName,
  legalForm: e.legalForm,
  legalFormInLogo: e.legalFormInLogo,
  suffixChoice: e.suffixChoice,
  input: e.input,
  pinned: e.pinned,
});

export function withChosenName(project: Project, name: any, pinned: any): Project {
  const r = suffixChoiceOf(name.suffix);
  const s = applyNameForm(project, {
    rawName: name.name,
    suffixChoice: r.choice,
    customSuffix: r.custom,
    keepLegalForm: true,
    nameKind: name.kind,
  });
  return { ...s, pinned: pinned, ui: { ...s.ui, galleryCount: 6, lastConceptIndex: 0 } };
}

export function suffixOf(choice: any, custom: any) {
  return choice === "none" ? "" : choice === "custom" ? custom.trim().slice(0, 30) : choice;
}

export function suffixChoiceOf(suffix: any) {
  const t = (suffix ?? "").trim();
  return t
    ? SUFFIX_CHOICES.includes(t)
      ? { choice: t, custom: "" }
      : { choice: "custom", custom: t }
    : { choice: "none", custom: "" };
}

export function logoNameOf(rawName: any, keepLegalForm: any) {
  const n = splitLegalForm(rawName);
  return n && !keepLegalForm ? n.stripped : rawName.trim();
}

export function newProjectId() {
  const e = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}${e}`;
}

export function createProject(
  form: NameForm,
  time: number = Date.now(),
  id: string = newProjectId(),
): Project {
  var i;
  const r = splitLegalForm(form.rawName);
  const s = {
    name: logoNameOf(form.rawName, form.keepLegalForm),
    suffix: suffixOf(form.suffixChoice, form.customSuffix),
    tagline: "",
    styles: [],
    colorMoods: [],
    themes: [],
    ...((i = form.place) != null && i.trim() ? { place: form.place!.trim().slice(0, 60) } : {}),
    ...(form.nameKind ? { nameKind: form.nameKind } : {}),
  };
  return {
    id: id,
    schemaVersion: SCHEMA_VERSION,
    createdAt: time,
    updatedAt: time,
    input: s,
    contact: emptyContact(),
    favorites: [],
    selected: null,
    rawName: form.rawName.trim(),
    legalForm: r?.form ?? null,
    legalFormInLogo: form.keepLegalForm,
    suffixChoice: form.suffixChoice,
    styleChoice: null,
    seed: (time ^ Math.floor(Math.random() * 16777215)) >>> 0,
    showTaglineInLogo: false,
    wordmarkOnly: false,
    nameFormats: [],
    templateSet: "unio",
    templateChosen: false,
    object: null,
    nameCandidates: [],
    pinned: null,
    numbers: {},
    editing: null,
    selectedBaseId: null,
    kitDone: false,
    contactSaved: false,
    firstEditToastShown: false,
    persistRequested: false,
    ui: {
      route: `#/p/${id}/stil`,
      editorTab: "symbol",
      galleryCount: 6,
      previewMode: "logo",
      lastConceptIndex: 0,
    },
  };
}

export function applyNameForm(project: Project, form: NameForm): Project {
  const n = splitLegalForm(form.rawName);
  return {
    ...project,
    rawName: form.rawName.trim(),
    legalForm: n?.form ?? null,
    legalFormInLogo: form.keepLegalForm,
    suffixChoice: form.suffixChoice,
    input: withNameKind(
      withPlace(
        {
          ...project.input,
          name: logoNameOf(form.rawName, form.keepLegalForm),
          suffix: suffixOf(form.suffixChoice, form.customSuffix),
        },
        form.place,
      ),
      form.nameKind,
    ),
  };
}

export function withPlace(input: any, place: any) {
  if (place === undefined) return input;
  const n: any = { ...input };
  if (place.trim()) {
    n.place = place.trim().slice(0, 60);
  } else {
    delete n.place;
  }
  return n;
}

export function chooseStyle(project: Project, style: string): Project {
  const n = style === "mix" ? [] : [style];
  const r = project.styleChoice === style;
  return {
    ...project,
    styleChoice: style,
    input: { ...project.input, styles: n as Project["input"]["styles"] },
    ui: {
      ...project.ui,
      galleryCount: r ? project.ui.galleryCount : 6,
      lastConceptIndex: r ? project.ui.lastConceptIndex : 0,
    },
  };
}

export function applyFilters(project: Project, filters: any): Project {
  return {
    ...project,
    wordmarkOnly: filters.wordmarkOnly,
    nameFormats: filters.nameFormats ?? project.nameFormats,
    input: {
      ...project.input,
      styles: filters.styles,
      colorMoods: filters.colorMoods,
      themes: filters.themes,
    },
    ui: { ...project.ui, galleryCount: 6, lastConceptIndex: 0 },
  };
}

export const isFavorite: (project: Project, id: string) => boolean = (e: any, t: any) =>
  e.favorites.some((n: any) => n.id === t);

export function toggleFavorite(project: Project, concept: LogoConcept, no: number): Project {
  return isFavorite(project, concept.id)
    ? { ...project, favorites: project.favorites.filter((r) => r.id !== concept.id) }
    : {
        ...project,
        favorites: [...project.favorites, concept],
        numbers: { ...project.numbers, [concept.id]: no },
      };
}

export function startEditing(project: Project, concept: LogoConcept, no: number): Project {
  if (project.editing && project.editing.baseId === concept.id) return project;
  const r = { ...project.numbers, [concept.id]: no };
  return project.selected && project.selectedBaseId === concept.id
    ? {
        ...project,
        numbers: r,
        editing: {
          baseId: concept.id,
          baseNo: no,
          base: concept,
          concept: project.selected,
          edited: project.selected.id !== concept.id,
        },
      }
    : {
        ...project,
        numbers: r,
        editing: { baseId: concept.id, baseNo: no, base: concept, concept: concept, edited: false },
      };
}

export function updateEditing(project: Project, concept: LogoConcept): Project {
  if (!project.editing) return project;
  const n = { ...project.editing, concept: concept, edited: concept.id !== project.editing.baseId };
  const r = isFavorite(project, n.baseId) ? project.favorites : [...project.favorites, n.base];
  return {
    ...project,
    editing: n,
    favorites: r,
    selected: concept,
    selectedBaseId: n.baseId,
    numbers: { ...project.numbers, [concept.id]: n.baseNo },
  };
}

export function selectEditing(project: Project): Project {
  return project.editing
    ? { ...project, selected: project.editing.concept, selectedBaseId: project.editing.baseId }
    : project;
}

export function projectStatus(project: Project): string {
  return project.kitDone
    ? "Brand Kit fertig"
    : project.selected || project.editing
      ? "Logo ausgewählt"
      : project.styleChoice
        ? "Stil gewählt"
        : "Name eingegeben";
}

export function duplicateProject(
  project: Project,
  time: number = Date.now(),
  id: string = newProjectId(),
): Project {
  const r = JSON.parse(JSON.stringify(project));
  r.id = id;
  r.createdAt = time;
  r.updatedAt = time;
  r.rawName = `${project.rawName} (Kopie)`;
  r.ui = { ...r.ui, route: r.ui.route.replace(`/p/${project.id}/`, `/p/${id}/`) };
  return r;
}

export function projectName(project: Project): string {
  return project.rawName || project.input.name;
}
