// @vitest-environment jsdom
// Logos je Route (kompassProbe.ts) gegen die gesicherte Fassung (kompass `tr`, `je`), mit den
// Briefs und Routen aus tests/golden/strategy/routes.json.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../../helpers/recovered";
import { goldenDir, installFontFetch } from "../../helpers/goldenLogo";
import { applyRouteToInput, routeLogos } from "../../../src/engine";

const plain = (v: unknown) => JSON.parse(JSON.stringify(v ?? null));
const strategy = JSON.parse(readFileSync(join(goldenDir, "strategy", "routes.json"), "utf8")) as Record<
  string,
  { brief: any; laeufe: Record<string, any[]> }
>;
let ko: Record<string, any>;

beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  ko = await recovered("kompass");
  installFontFetch();
}, 120000);

describe("Logos je Route", () => {
  for (const [slug, { brief, laeufe }] of Object.entries(strategy))
    it(slug, () => {
      const routes = laeufe.standard!;
      for (const seed of [1, 4242])
        expect(plain(routeLogos(routes, brief, seed, 6))).toEqual(plain(ko.tr(routes, brief, seed, 6)));
      const input = { name: brief.name ?? "Muster", suffix: "", tagline: "", styles: [], colorMoods: [], themes: [] };
      for (const r of routes) expect(plain(applyRouteToInput(input, r))).toEqual(plain(ko.je(input, r)));
    }, 120000);
});
