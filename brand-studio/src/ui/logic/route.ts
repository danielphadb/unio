/**
 * Routen als Hash-Adressen: lesen, schreiben, Schritte 1 bis 5, Scroll-Positionen, Hook für die aktuelle Route.
 * Gesicherte Fassung: index-Chunk (wn, za, Zk, lu, gS).
 */
import { useCallback, useEffect, useState } from "react";

export const EDITOR_TABS = ["symbol", "schrift", "farbe", "aufbau"];

export function editorTabOf(tab: any) {
  return tab === "schriftdetails"
    ? { tab: "schrift", feinheiten: true }
    : tab === "anordnung"
      ? { tab: "aufbau" }
      : tab === "text"
        ? { tab: "aufbau", texte: true }
        : { tab: tab && EDITOR_TABS.includes(tab) ? tab : "symbol" };
}

export const KOMPASS_STEPS = 6;

export function parseRoute(hash: any): any {
  const t = hash.replace(/^#/, "");
  const [n, r = ""] = t.split("?");
  const s = new URLSearchParams(r);
  const i = n.split("/").filter(Boolean).map(decodeURIComponent);
  if (i.length === 0) return { name: "home" };
  if (i[0] === "neu" && i[1] === "name" && i.length === 2) return { name: "new" };
  if (i[0] === "kompass") {
    if (i.length === 1) return { name: "kompass", step: 1 };
    if (i[1] === "routen" && i.length === 2) return { name: "routen" };
    const a = Number(i[1]);
    return i.length === 2 && Number.isInteger(a) && a >= 1 && a <= KOMPASS_STEPS
      ? { name: "kompass", step: a }
      : { name: "kompass", step: 1 };
  }
  if (i[0] === "neu" && (i.length === 1 || (i[1] === "namen" && i.length === 2))) {
    const a = (s.get("art") ?? "").split(",").filter((u) => /^[a-z-]{1,30}$/.test(u));
    const o = s.get("name");
    const l: any = { name: "names", gemerkt: s.get("ansicht") === "gemerkt", kinds: a };
    o &&
      /^[A-Za-z0-9_:.|-]{1,120}$/.test(o) &&
      ((l.detail = o), s.get("mehr") === "1" && (l.mehr = true));
    return l;
  }
  if (i[0] === "p" && i[1]) {
    const a = i[1];
    switch (i[2]) {
      case "name":
        return { name: "name", id: a };
      case "stil":
        return { name: "stil", id: a };
      case "auswahl":
        return { name: "auswahl", id: a, gemerkt: s.get("ansicht") === "gemerkt" };
      case "logo": {
        if (!i[3]) break;
        const o = editorTabOf(s.get("tab"));
        const l: any = { name: "logo", id: a, conceptId: i[3], tab: o.tab };
        if (o.texte || s.get("texte") === "1") {
          l.texte = true;
        }
        if (o.feinheiten) {
          l.feinheiten = true;
        }
        return l;
      }
      case "kit":
        return { name: "kit", id: a };
      case "postings": {
        const o: any = { name: "postings", id: a };
        const l = s.get("objekt");
        const u = s.get("anlass");
        if (l && /^[a-z0-9]{4,40}$/.test(l)) {
          o.objekt = l;
        }
        if (u && /^[a-z-]{2,20}$/.test(u)) {
          o.anlass = u;
        }
        return o;
      }
      case "objekte": {
        const o = s.get("objekt");
        return o && /^[a-z0-9]{4,40}$/.test(o)
          ? { name: "objekte", id: a, objekt: o }
          : { name: "objekte", id: a };
      }
    }
  }
  return { name: "home" };
}

export function routeHash(route: any) {
  switch (route.name) {
    case "home":
      return "#/";
    case "new":
      return "#/neu/name";
    case "kompass":
      return route.step > 1 ? `#/kompass/${route.step}` : "#/kompass";
    case "routen":
      return "#/kompass/routen";
    case "names": {
      const t = new URLSearchParams();
      if (route.kinds.length) {
        t.set("art", route.kinds.join(","));
      }
      if (route.gemerkt) {
        t.set("ansicht", "gemerkt");
      }
      route.detail && (t.set("name", route.detail), route.mehr && t.set("mehr", "1"));
      const n = t.toString().replace(/%2C/g, ",");
      return `#/neu/namen${n ? `?${n}` : ""}`;
    }
    case "name":
    case "stil":
    case "kit":
      return `#/p/${encodeURIComponent(route.id)}/${route.name}`;
    case "auswahl":
      return `#/p/${encodeURIComponent(route.id)}/auswahl${route.gemerkt ? "?ansicht=gemerkt" : ""}`;
    case "postings": {
      const t = [
        route.objekt ? `objekt=${route.objekt}` : "",
        route.anlass ? `anlass=${route.anlass}` : "",
      ]
        .filter(Boolean)
        .join("&");
      return `#/p/${encodeURIComponent(route.id)}/postings${t ? `?${t}` : ""}`;
    }
    case "objekte":
      return `#/p/${encodeURIComponent(route.id)}/objekte${route.objekt ? `?objekt=${route.objekt}` : ""}`;
    case "logo":
      return `#/p/${encodeURIComponent(route.id)}/logo/${encodeURIComponent(route.conceptId)}${route.tab !== "symbol" ? `?tab=${route.tab}` : ""}${route.texte ? `${route.tab !== "symbol" ? "&" : "?"}texte=1` : ""}`;
  }
}

export const ROUTE_TITLES: Record<string, any> = {
  home: "Deine Marken",
  new: "Name",
  kompass: "Markenkompass",
  routen: "Drei Richtungen",
  names: "Namen finden",
  name: "Name",
  stil: "Stil",
  auswahl: "Auswahl",
  logo: "Feinschliff",
  kit: "Brand Kit",
  postings: "Postings",
  objekte: "Objekte",
};

export function stepOf(route: any) {
  switch (route.name) {
    case "new":
    case "names":
    case "name":
      return 1;
    case "stil":
      return 2;
    case "auswahl":
      return 3;
    case "logo":
      return 4;
    case "kit":
      return 5;
    default:
      return 0;
  }
}

export const scrollPositions = new Map<any, any>();

export let ownHashChange = false;

export let navTick = 0;

export let navTickPending = false;

export function nextNavTick() {
  if (!navTickPending) {
    navTickPending = true;
    setTimeout(() => {
      navTickPending = false;
      navTick += 1;
    }, 0);
  }
  return navTick;
}

export let lastNavTick = -1;

export function useHashRoute() {
  const [e, t] = useState<any>(() => parseRoute(location.hash));
  const [n, r] = useState(false);
  useEffect(() => {
    const i = () => {
      const a = !ownHashChange;
      if (((ownHashChange = false), !a))
        return t((o: any) => (routeHash(o) === location.hash ? o : parseRoute(location.hash)));
      r(a);
      t(parseRoute(location.hash));
    };
    window.addEventListener("hashchange", i);
    return () => window.removeEventListener("hashchange", i);
  }, []);
  const s = useCallback((i: any, a: { replace?: boolean } = {}) => {
    lastNavTick = nextNavTick();
    const o = routeHash(i);
    if ((scrollPositions.set(location.hash || "#/", window.scrollY), o === location.hash)) {
      t(parseRoute(o));
      return;
    }
    if (a.replace) {
      history.replaceState(null, "", o);
      r(false);
      t(parseRoute(o));
    } else {
      ownHashChange = true;
      location.hash = o as string;
      r(false);
      t(parseRoute(o));
    }
  }, []);
  return { route: e, navigate: s, isBack: n };
}

export function savedScroll(e: any) {
  return scrollPositions.get(e);
}

export function routeTitles(e: any) {
  return e.name === "home" ? [ROUTE_TITLES.home, ROUTE_TITLES.names] : [ROUTE_TITLES[e.name]];
}

export const STEP_CAPS = ["NAME", "STIL", "AUSWAHL", "FEINSCHLIFF", "BRAND KIT"];

export const STEP_LABELS = ["Name", "Stil", "Auswahl", "Feinschliff", "Brand Kit"];

export function stepRoute(project: any, step: any) {
  switch (step) {
    case 1:
      return { name: "name", id: project.id };
    case 2:
      return { name: "stil", id: project.id };
    case 3:
      return project.styleChoice ? { name: "auswahl", id: project.id, gemerkt: false } : null;
    case 4:
      return project.editing
        ? {
            name: "logo",
            id: project.id,
            conceptId: project.editing.baseId,
            tab: project.ui.editorTab,
          }
        : null;
    case 5:
      return project.selected ? { name: "kit", id: project.id } : null;
  }
  return null;
}
