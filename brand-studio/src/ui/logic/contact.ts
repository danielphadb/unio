/**
 * Kontaktdaten: leerer Kontakt, Telefon formatieren, Prüfungen mit Hinweistexten, Säubern.
 * Gesicherte Fassung: index-Chunk (e0, u1, p1, qC, kL).
 */
import { isWebOk, stripWeb } from "./validators";

import type { Contact } from "../../types";
import type { Project } from "./project";

export const emptyContact = () => ({
  person: "",
  role: "",
  phone: "",
  email: "",
  web: "",
  street: "",
  city: "",
  unioPartner: false,
  legal: "",
});

export function groupDigits(digits: any) {
  if (digits.length <= 4) return digits;
  const t = [digits.slice(0, 3)];
  let n = digits.slice(3);
  for (; n.length > 3; ) (t.push(n.slice(0, 2)), (n = n.slice(2)));
  if (n) {
    t.push(n);
  }
  return t.join(" ");
}

export function formatPhone(phone: any) {
  const t = phone.trim();
  if (!t) return "";
  let n = t.replace(/[^\d+]/g, "");
  if (
    (n.startsWith("00") && (n = "+" + n.slice(2)),
    /^0\d/.test(n) && (n = "+43" + n.slice(1)),
    !n.startsWith("+"))
  )
    return t;
  if (((n = "+" + n.slice(1).replace(/\+/g, "")), n.startsWith("+43"))) {
    const i = n.slice(3).replace(/^0/, "");
    if (!i) return t;
    let a = 4;
    i.startsWith("1")
      ? (a = 1)
      : (i.startsWith("6") || i.startsWith("7") || i.startsWith("5")) && (a = 3);
    const o = i.slice(0, a);
    const l = i.slice(a);
    return `+43 ${o}${l ? " " + groupDigits(l) : ""}`;
  }
  const r = n.slice(1, 3);
  const s = n.slice(3);
  return `+${r}${s ? " " + groupDigits(s) : ""}`;
}

export function isValidPhone(phone: any) {
  if (!phone.trim()) return true;
  const t = phone.replace(/\D/g, "");
  return /^[+\d\s()/-]+$/.test(phone.trim()) && t.length >= 9 && t.length <= 15;
}

export function isValidEmail(email: any) {
  return email.trim() ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) : true;
}

export const LEGAL_MAX = 160;

export const CONTACT_HINTS = {
  phone: "Diese Nummer sieht unvollständig aus. Beispiel: +43 660 123 45 67",
  email: "Bitte prüf die E-Mail-Adresse. Beispiel: anna@berger-immobilien.at",
  web: "Diese Adresse können wir nicht lesen. Beispiel: berger-immobilien.at",
  legal: "Maximal 160 Zeichen, sonst passt die Zeile nicht aufs Briefpapier.",
};

export function contactErrors(contact: any) {
  const t: any = {};
  if (!isValidPhone(contact.phone)) {
    t.phone = CONTACT_HINTS.phone;
  }
  if (!isValidEmail(contact.email)) {
    t.email = CONTACT_HINTS.email;
  }
  if (!isWebOk(contact.web)) {
    t.web = CONTACT_HINTS.web;
  }
  if ((contact.legal ?? "").length > LEGAL_MAX) {
    t.legal = CONTACT_HINTS.legal;
  }
  return t;
}

export function cleanContact(contact: any) {
  const t = contactErrors(contact);
  return {
    ...contact,
    person: contact.person.trim(),
    role: contact.role.trim(),
    phone: t.phone ? "" : formatPhone(contact.phone),
    email: t.email ? "" : contact.email.trim(),
    web: t.web ? "" : stripWeb(contact.web),
    street: contact.street.trim(),
    city: contact.city.trim(),
    legal: t.legal ? "" : (contact.legal ?? "").trim(),
  };
}

export function hasContactBasics(contact: any) {
  return contact
    ? !!contact.person.trim() && (!!contact.phone.trim() || !!contact.email.trim())
    : false;
}

export function personFromText(text: any) {
  const t = text.trim().split(/\s+/).filter(Boolean);
  return t.length >= 2 && t.length <= 4 ? t.join(" ") : "";
}

export function stripPostcode(city: any) {
  return city.replace(/^\s*(A-)?\d{4,5}\s*/i, "").trim();
}

export function contactOf(project: Project): Contact {
  const t: any = { ...emptyContact(), ...project.contact };
  if (!t.legal && project.legalForm && !project.legalFormInLogo) {
    t.legal = project.rawName;
  }
  return t;
}
