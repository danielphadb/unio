// Namensfinder gegen die Referenz-Ausgaben der gesicherten Fassung (tests/golden/names).
// Je Marke, Seed und Lauf (ohne und mit Route): Profil aus dem Formular, alle Chargen,
// pruefeEigenenNamen und alternativenFuer (12). Vergleich ueber JSON, also bitgenau
// samt Reihenfolge der Felder.
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  generateBatches,
  inputFromForm,
  splitList,
  type NameFinderForm,
} from "../../../src/engine/names/finder";
import { alternativenFuer, pruefeEigenenNamen, type NameInput } from "../../../src/engine/names";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "golden", "names");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const inputs = JSON.parse(
  readFileSync(join(dir, "..", "inputs.json"), "utf8"),
) as { marken: Array<{ slug: string; rawName: string }> };

type Lauf = {
  form: NameFinderForm & { batches: Parameters<typeof generateBatches>[2] };
  profil: unknown;
  chargen: unknown;
  pruefeEigenenNamen: unknown;
  alternativenFuer: unknown;
};

const plain = (x: unknown): string => JSON.stringify(x);

describe.each(files)("Namen %s", (file) => {
  const golden = JSON.parse(readFileSync(join(dir, file), "utf8")) as {
    marke: string;
    laeufe: Record<string, Record<string, Lauf>>;
  };
  const raw = inputs.marken.find((m) => m.slug === golden.marke)?.rawName;
  for (const [seed, laeufe] of Object.entries(golden.laeufe))
    for (const [art, lauf] of Object.entries(laeufe))
      it(`Seed ${seed}, ${art}`, () => {
        const form = lauf.form;
        const input = inputFromForm(form);
        expect(plain(input)).toBe(plain(lauf.profil));
        const chargen = generateBatches(input, { ...form, seed: Number(seed) }, form.batches);
        expect(plain(chargen)).toBe(plain(lauf.chargen));
        const ctx: NameInput = {
          ...(form.person ? { person: form.person } : {}),
          ...(form.company ? { company: form.company } : {}),
          region: form.region,
          focus: form.focus,
          styles: form.style !== "egal" ? [form.style] : [],
          keywords: splitList(form.keywords),
          ...(form.route?.params ? { route: form.route.params } : {}),
        };
        expect(raw).toBeTruthy();
        expect(plain(pruefeEigenenNamen(raw, ctx))).toBe(plain(lauf.pruefeEigenenNamen));
        expect(plain(alternativenFuer(raw, ctx, 12))).toBe(plain(lauf.alternativenFuer));
      }, 30000);
});
