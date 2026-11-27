// Importkreis mit der Logo-Engine (signature/render.ts, engine/renderLogo.ts,
// signature/index.ts): jedes Modul muss als erstes geladen werden können.
import { describe, expect, it, vi } from "vitest";

const ENTRIES = [
  "../../src/signature/render",
  "../../src/signature/varianten",
  "../../src/signature/nameParts",
  "../../src/signature/index",
  "../../src/engine/renderLogo",
  "../../src/engine/highend",
  "../../src/engine/route",
  "../../src/engine/generator",
];

describe("Importreihenfolge", () => {
  for (const entry of ENTRIES)
    it(`zuerst ${entry.replace("../../src/", "")}`, async () => {
      vi.resetModules();
      await import(/* @vite-ignore */ entry);
      const sig = await import("../../src/signature/index");
      expect(sig.ALL_TEMPLATES).toHaveLength(86);
      expect(sig.ZUSATZ_FELDER).toContain("zusatzOrt");
    });
});
