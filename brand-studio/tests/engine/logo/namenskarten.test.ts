// @vitest-environment jsdom
// Namenskarten mit finalen Logos (nameCardSet.ts) gegen den Golden Master (tests/golden/names):
// Konzepte der Karten und die SVGs der ersten sechs Karten je Lauf, dazu Ersatzkarte und
// Kartenformen gegen die gesicherte Fassung.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../../helpers/recovered";
import { BRANDS, goldenDir, goldenInputs, goldenSvg, installFontFetch } from "../../helpers/goldenLogo";
import {
  cardFace,
  cardForms,
  fallbackCard,
  fontStore,
  fontsNeeded,
  nameCards,
  renderLogoSvg,
} from "../../../src/engine";
import { batchSeed, nameInput } from "../../../src/engine/names/finder";

const plain = (v: unknown) => JSON.parse(JSON.stringify(v ?? null));
let nf: Record<string, any>;

beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  nf = await recovered("nameFinder");
  installFontFetch();
}, 120000);

describe.each(BRANDS)("Namenskarten Golden Master: %s", (slug) => {
  const g = JSON.parse(readFileSync(join(goldenDir, "names", `${slug}.json`), "utf8"));
  for (const [seedText, laeufe] of Object.entries<any>(g.laeufe))
    for (const [lauf, r] of Object.entries<any>(laeufe))
      it(`${lauf} seed ${seedText}`, async () => {
        const seed = Number(seedText);
        const styles = r.form.style !== "egal" ? [r.form.style] : [];
        const first = r.chargen[0] ?? [];
        const karten = nameCards(
          first,
          batchSeed(seed, 0),
          styles,
          goldenInputs.einstellungen.signatureEntwuerfe,
          r.form.route?.params,
        );
        expect(plain(karten)).toEqual(r.karten);
        for (let i = 0; i < Math.min(goldenInputs.galerie.svgJeLauf, karten.length); i++) {
          const c = karten[i];
          const inp = nameInput(first[i], styles);
          const face = cardFace(c);
          await fontStore.ensure(fontsNeeded([c], "logo", inp));
          expect(renderLogoSvg(c, inp as any, { variant: face.variant as any, ground: face.ground })).toBe(
            goldenSvg(r.kartenSvg[c.id].datei),
          );
        }
        // Ersatzkarte und Formen gegen die gesicherte Fassung
        for (let i = 0; i < Math.min(3, first.length); i++) {
          expect(plain(fallbackCard(first[i], i, seed, styles))).toEqual(
            plain(nf.Xd(first[i], i, seed, styles)),
          );
          if (karten[i] && !karten[i].signature)
            expect(plain(cardForms(first[i], karten[i], styles))).toEqual(
              plain(nf.rl(first[i], karten[i], styles)),
            );
        }
      }, 120000);
});
