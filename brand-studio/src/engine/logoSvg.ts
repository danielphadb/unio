/**
 * Logo als SVG-Dokument mit LRU-Zwischenspeicher (`renderLogoSvg`), Schriftspeicher der Engine
 * (`fontStore`), Render-Warteschlange in Leerlaufzeiten und die React-Hooks `useLogoSvg` und
 * `useFontsReady` (engine `pn` ... `Cm`).
 */
import * as React from "react";
import type { BrandInput, FontRef, LogoConcept } from "../types";
import type { SvgOptions } from "./logoTypes";
import { createFontStore } from "./fontStore";
import { fontKey } from "./fonts";
import { fontsNeeded } from "./generator";
import { hash } from "./rng";
import { renderLogo, renderTagline } from "./renderLogo";
import { svgDocument } from "./svg";

export const fontStore = createFontStore();

const refKey = (e: any) => fontKey(e);

export function fontsForConcepts(
  concepts: LogoConcept[],
  withTagline: boolean = false,
  input: any,
) {
  const r = fontsNeeded(concepts, "logo", input);
  return withTagline ? [...r, ...concepts.map((i) => i.tagline.font)] : r;
}

export function fontsLoaded(refs: FontRef[]) {
  return refs.every((n) => fontStore.has(n));
}

export function loadFonts(refs: FontRef[]) {
  return fontStore.ensure(refs);
}

export function useFontsReady(concepts: LogoConcept[], input: any) {
  const t = fontsForConcepts(concepts, false, input);
  const r = t.map(refKey).sort().join(",");
  const [i, a] = React.useState(() => ({
    key: r,
    ready: fontsLoaded(t),
    error: false,
  }));
  React.useEffect(() => {
    if (fontsLoaded(t)) {
      a({
        key: r,
        ready: true,
        error: false,
      });
      return;
    }
    let s = true;
    a({
      key: r,
      ready: false,
      error: false,
    });
    fontStore.ensure(t).then(
      () =>
        s &&
        a({
          key: r,
          ready: true,
          error: false,
        }),
      () =>
        s &&
        a({
          key: r,
          ready: false,
          error: true,
        }),
    );
    return () => {
      s = false;
    };
  }, [r]);
  return i.key === r
    ? {
        ready: i.ready,
        error: i.error,
      }
    : {
        ready: fontsLoaded(t),
        error: false,
      };
}

const conceptHashCache = new WeakMap();

function conceptHash(concept: LogoConcept) {
  let n = conceptHashCache.get(concept);
  if (!n) {
    n = hash(JSON.stringify(concept)).toString(36) + concept.id;
    conceptHashCache.set(concept, n);
  }
  return n;
}

const svgCache = new Map();

const SVG_CACHE_SIZE = 900;

function svgCacheKey(
  concept: LogoConcept,
  input: BrandInput,
  options: SvgOptions,
) {
  return [
    conceptHash(concept),
    input.name,
    input.suffix ?? "",
    input.place ?? "",
    input.nameKind ?? "",
    input.ort2 ?? "",
    input.jahr ?? "",
    options.tagline ? (input.tagline ?? "") : "",
    options.variant ?? "color",
    options.part ?? "full",
    options.ground ?? "",
    fontStore.version,
  ].join("|");
}

function renderLogoDocument(
  concept: LogoConcept,
  input: BrandInput,
  options: SvgOptions = {},
) {
  const r = renderLogo(concept, input, fontStore, {
    variant: options.variant,
    part: options.part,
    ground: options.ground,
  });
  if (
    !options.tagline ||
    !input.tagline?.trim() ||
    (options.part && options.part !== "full")
  )
    return r;
  const i = renderTagline(
    concept,
    input,
    fontStore,
    options.variant ?? "color",
    options.ground,
  );
  if (!i.width || !r.width) return r;
  const a = Math.min(0.28, (r.width * 0.95) / i.width);
  const s = i.width * a;
  const o = i.height * a;
  const l = Math.max(r.width, s);
  const u = (l - r.width) / 2;
  const m = (l - s) / 2;
  const h = 45;
  return {
    body: `<g transform="translate(${u.toFixed(2)} 0)">${r.body}</g><g transform="translate(${m.toFixed(2)} ${(r.height + h).toFixed(2)}) scale(${a.toFixed(4)})">${i.body}</g>`,
    width: l,
    height: r.height + h + o,
  };
}

export function renderLogoSvg(
  concept: LogoConcept,
  input: BrandInput,
  options: SvgOptions = {},
) {
  const r = svgCacheKey(concept, input, options);
  const i = svgCache.get(r);
  if (i !== undefined) {
    svgCache.delete(r);
    svgCache.set(r, i);
    return i;
  }
  const a = renderLogoDocument(concept, input, options);
  const s = a.width
    ? svgDocument(a, {
        padding: Math.max(a.width, a.height) * 0.02,
      }).replace(
        "<svg ",
        '<svg aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet" ',
      )
    : "";
  svgCache.set(r, s);
  if (svgCache.size > SVG_CACHE_SIZE) {
    svgCache.delete(svgCache.keys().next().value);
  }
  return s;
}

const PRIORITY = {
  high: 0,
  normal: 1,
  low: 2,
};

const renderQueue: any[] = [];

let queueScheduled = false;

function runQueue(deadline?: any) {
  queueScheduled = false;
  const n = performance.now();
  const t = () => performance.now() - n < 8;
  let r = 0;
  for (; renderQueue.length && (r === 0 || t()); ) {
    const i = renderQueue.shift();
    if (!i.cancelled) {
      i.run();
      r++;
    }
  }
  if (renderQueue.length) {
    scheduleQueue();
  }
}

function scheduleQueue() {
  if (!queueScheduled) {
    queueScheduled = true;
    if (
      typeof requestAnimationFrame == "function" &&
      document.visibilityState === "visible"
    ) {
      requestAnimationFrame(() => runQueue());
    } else {
      setTimeout(() => runQueue(), 0);
    }
  }
}

export function enqueueRender(run: any, prio = "normal") {
  const t = {
    run,
    cancelled: false,
    prio,
  };
  const r = renderQueue.findIndex(
    (i) =>
      (PRIORITY as Record<string, any>)[i.prio] >
      (PRIORITY as Record<string, any>)[prio],
  );
  if (r < 0) {
    renderQueue.push(t);
  } else {
    renderQueue.splice(r, 0, t);
  }
  scheduleQueue();
  return () => {
    t.cancelled = true;
  };
}

export function useLogoSvg(
  concept: LogoConcept | null | undefined,
  input: BrandInput,
  options: SvgOptions = {},
  enabled: boolean = true,
  prio = "normal",
) {
  const [a, s] = React.useState(0);
  fontStore.setTexts(
    input.name,
    input.suffix,
    options.tagline ? input.tagline : "",
  );
  const o = concept ? svgCacheKey(concept, input, options) : "";
  const [l, u] = React.useState(() => ({
    key: o,
    svg: concept && enabled && svgCache.has(o) ? svgCache.get(o) : null,
    error: false,
    fresh: false,
  }));
  const m = React.useRef(options);
  m.current = options;
  React.useEffect(() => {
    if (!concept || !enabled) return;
    if (svgCache.has(o)) {
      u((w) =>
        w.key === o && w.svg
          ? w
          : {
              key: o,
              svg: svgCache.get(o),
              error: false,
              fresh: false,
            },
      );
      return;
    }
    let p = true;
    const g = enqueueRender(() => {
      if (!p) return;
      const w = fontsForConcepts([concept], !!m.current.tagline, input);
      if (!fontsLoaded(w)) {
        fontStore.ensure(w).then(
          () => p && s((x) => x + 1),
          () =>
            p &&
            u({
              key: o,
              svg: null,
              error: true,
              fresh: false,
            }),
        );
        return;
      }
      try {
        const x = renderLogoSvg(concept, input, m.current);
        u({
          key: o,
          svg: x,
          error: false,
          fresh: true,
        });
      } catch (x) {
        console.warn("Logo konnte nicht gezeichnet werden", x);
        u({
          key: o,
          svg: null,
          error: true,
          fresh: false,
        });
      }
    }, prio);
    return () => {
      p = false;
      g();
    };
  }, [o, enabled, a]);
  const h =
    l.key === o
      ? l
      : {
          svg: concept && enabled && svgCache.has(o) ? svgCache.get(o) : null,
          error: false,
          fresh: false,
        };
  return {
    svg: h.svg,
    error: h.error,
    fresh: h.fresh,
    retry: () => s((p) => p + 1),
  };
}

export function cancelLowPriority() {
  for (const e of renderQueue) {
    if (e.prio === "low") {
      e.cancelled = true;
    }
  }
}

export function perfMark(name: string) {
  try {
    performance.mark(name);
  } catch {}
}

export function perfMeasure(name: string, start: string) {
  try {
    if (performance.getEntriesByName(start, "mark").length) {
      performance.measure(name, start);
    }
  } catch {}
}
