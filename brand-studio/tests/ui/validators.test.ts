// @vitest-environment jsdom
// Grund-Helfer der Pruefung bitgenau gegen die gesicherte Fassung (index se, ue, X, qe, Vr, Y, Re, t0, d1).
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import * as v from "../../src/ui/logic/validators";

let ix: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  ix = await recovered("index");
}, 60000);

const outcome = (f: () => unknown) => {
  try {
    return { ok: f() };
  } catch (e) {
    return { err: (e as Error).name + ":" + (e as Error).message + ":" + (e as { path?: string }).path };
  }
};

const VALUES: unknown[] = [undefined, null, "", "abc", "x".repeat(200), "a\u0001b", 0, 5, -1, NaN, Infinity, true, false, {}, [], ["a"], ["a", "b", "c"], { a: 1 }, "elegant"];

describe("validators", () => {
  it("wie alt", () => {
    for (const val of VALUES) {
      expect(outcome(() => v.obj(val, "p"))).toEqual(outcome(() => ix.ue(val, "p")));
      for (const opts of [{}, { optional: true }, { pattern: /^[a-c]+$/ }])
        expect(outcome(() => v.str(val, "p", 120, opts))).toEqual(outcome(() => ix.X(val, "p", 120, opts)));
      expect(outcome(() => v.num(val, "p", 0, 10))).toEqual(outcome(() => ix.qe(val, "p", 0, 10)));
      expect(outcome(() => v.bool(val, "p", true))).toEqual(outcome(() => ix.Vr(val, "p", true)));
      expect(outcome(() => v.oneOf(val, ["a", "elegant"], "p"))).toEqual(outcome(() => ix.Y(val, ["a", "elegant"], "p")));
      expect(outcome(() => v.listOf(val, ["a", "b"], "p"))).toEqual(outcome(() => ix.Re(val, ["a", "b"], "p")));
    }
    for (const w of ["", " https://beispiel.at/ ", "http://x", "anna@x.at", "wörter.at/pfad", "a.b.c", "abc"]) {
      expect(v.stripWeb(w)).toBe(ix.t0(w));
      expect(v.isWebOk(w)).toBe(ix.d1(w));
    }
  });
});
