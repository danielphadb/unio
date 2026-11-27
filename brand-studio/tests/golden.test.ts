// Prueft, dass die Referenz-Ausgaben vollstaendig und unveraendert im Repo liegen.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dir = join(__dirname, "golden");
const manifest = JSON.parse(readFileSync(join(dir, "MANIFEST.json"), "utf8")) as {
  dateien: number;
  dateien_sha256: Record<string, string>;
};

describe("Golden Master (W2)", () => {
  it("alle Dateien vorhanden und byte-gleich", () => {
    const files = Object.entries(manifest.dateien_sha256);
    expect(files).toHaveLength(manifest.dateien);
    for (const [rel, sha] of files)
      expect(createHash("sha256").update(readFileSync(join(dir, rel))).digest("hex"), rel).toBe(sha);
  });
});
