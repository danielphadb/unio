/**
 * Logos je Route fuer die Routen-Seite des Markenkompass (kompass-Chunk `tr`, `je`):
 * mit Namen drei Konzepte je Route, ohne Namen Namensvorschlaege mit Namenskarten. Vorlagen und
 * Hauptschriften wiederholen sich ueber die drei Routen nicht (`ShownSoFar`).
 */
import type { LogoConcept } from "../types";
import { fallbackCard, nameCards } from "./nameCardSet";
import { generateConcepts } from "./generator";
import { generateNames } from "./names";
import { hash } from "./rng";
import { routeToBrandInputPatch, routeToNameInput } from "../strategy/routes";
import { splitVariantId } from "../signature/varianten";
import { withRoute } from "./names/finder";

/** Was auf der Routen-Seite schon gezeigt wird (ueber alle Routen). */
export interface ShownSoFar {
  names: Set<string>;
  templates: Set<string>;
  fonts: Set<string>;
}

export function applyRouteToInput(input: any, route: any) {
  const r = routeToBrandInputPatch(route);
  return withRoute(
    {
      ...input,
      styles: r.styles ?? input.styles,
      colorMoods: r.colorMoods ?? input.colorMoods,
      themes: r.themes ?? input.themes,
    },
    route.params,
  );
}

const nameKey = (name: any) =>
  name.name.toLocaleLowerCase("de-AT").replace(/\s+/g, "");

const templateOf = (concept: LogoConcept) =>
  concept.signature ? splitVariantId(concept.signature.id)[0] : null;

const mainFontKey = (concept: LogoConcept) => {
  return concept.signature?.params?.haupt?.key ?? concept.name.font.key;
};

const alreadyShown = (concept: LogoConcept, shown: ShownSoFar) => {
  const r = templateOf(concept);
  return (
    (r !== null && shown.templates.has(r)) ||
    shown.fonts.has(mainFontKey(concept))
  );
};

function rememberShown(concepts: LogoConcept[], shown: ShownSoFar) {
  for (const r of concepts) {
    const t = templateOf(r);
    if (t) {
      shown.templates.add(t);
    }
    shown.fonts.add(mainFontKey(r));
  }
}

function freshestConcept(concepts: LogoConcept[], shown: ShownSoFar) {
  const r = concepts.find((t) => !alreadyShown(t, shown));
  return (
    r ||
    (concepts.find(
      (t) => !(templateOf(t) && shown.templates.has(templateOf(t)!)),
    ) ??
      concepts[0] ??
      null)
  );
}

export function routeLogos(
  routes: any,
  brief: any,
  seed: number,
  count: number = 6,
) {
  const withName = !!(brief.hasName && brief.name?.trim());
  const shown: ShownSoFar = {
    names: new Set(),
    templates: new Set(),
    fonts: new Set(),
  };
  return routes.map((l: any) => {
    const routeSeed = hash(`${seed}|${l.id}|${l.territory}|${l.params.seed}`);
    const styles = l.params.styles.slice(0, 2);
    if (withName) {
      const input = applyRouteToInput(
        {
          name: brief.name.trim(),
          suffix: "",
          styles: [],
          colorMoods: [],
          themes: [],
        },
        l,
      );
      const logos: any[] = [];
      for (let page = 0; logos.length < 3 && page < 4; page++) {
        const batch = generateConcepts(input, {
          count: 12,
          page,
          seed: routeSeed,
        }).filter((w) => !logos.some((d) => d.id === w.id));
        for (const w of batch) {
          if (
            logos.length < 3 &&
            !alreadyShown(w, shown) &&
            !logos.some((d) => templateOf(d) && templateOf(d) === templateOf(w))
          ) {
            logos.push(w);
          }
        }
        if (page === 3)
          for (const w of batch) {
            if (logos.length < 3 && !logos.includes(w)) {
              logos.push(w);
            }
          }
      }
      rememberShown(logos, shown);
      return {
        logos,
      };
    }
    const nameInput = routeToNameInput(l, brief);
    const names: any[] = [];
    for (let input = 0; names.length < count && input < 4; input++) {
      for (const logos of generateNames(nameInput, {
        count: 12,
        page: input,
        seed: routeSeed,
      })) {
        if (names.length >= count) break;
        const page = nameKey(logos);
        if (
          !(
            shown.names.has(page) ||
            names.some((batch) => nameKey(batch) === page)
          )
        ) {
          names.push(logos);
        }
      }
    }
    const cards = nameCards(names, routeSeed, styles, false, l.params);
    const concepts = names.map((input, logos) => {
      const page =
        cards[logos] ?? fallbackCard(input, logos, routeSeed, styles);
      if (!page || !alreadyShown(page, shown)) return page;
      const batch = [page];
      for (let w = 1; w <= 6; w++) {
        const d = nameCards(
          [input],
          hash(`${routeSeed}|${logos}|${w}`),
          styles,
          false,
          l.params,
        )[0];
        if (d) {
          batch.push(d);
        }
        if (d && !alreadyShown(d, shown)) break;
      }
      for (let w = 0; w < 4; w++) {
        const d = fallbackCard(
          input,
          logos + w,
          hash(`${routeSeed}|wm|${w}`),
          styles,
        );
        if (d) {
          batch.push(d);
        }
      }
      return freshestConcept(batch, shown) ?? page;
    });
    for (const input of names) shown.names.add(nameKey(input));
    const found = concepts.filter((input) => !!input);
    rememberShown(found, shown);
    return {
      names: {
        items: names,
        concepts,
      },
    };
  });
}
