// @vitest-environment jsdom
// Objekt-Bibliothek (src/postings/library.ts) und Objektdaten (src/ui/logic/objectData.ts) gegen die
// gesicherte Fassung (library- und objectData-Chunk): Pruefung, Fehlertexte, Bereinigung, Aenderungen.
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import * as L from "../../src/postings/library";
import * as O from "../../src/ui/logic/objectData";

let li: Record<string, any>;
let od: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  li = await recovered("library");
  od = await recovered("objectData");
}, 60000);

const outcome = (f: () => unknown) => {
  try {
    return { ok: JSON.parse(JSON.stringify(f() ?? null)) };
  } catch (e) {
    return { err: String(e) };
  }
};

function* objects() {
  const base = li.V(1793091600000, "obj4711golden");
  yield base;
  yield { ...base, title: "  Dachgeschoss   mit Weitblick ", address: "Musterstraße 1, 1070 Wien", lage: "", price: " 690.000 ", status: "preis-angepasst", previousPrice: "" };
  yield { ...base, title: "", url: "keine adresse", energy: { ...base.energy, hwb: "32.5", eeb: "abc", eebKlasse: "c FOSSIL", ausweisDatum: "2026-13-01" } };
  yield { ...base, title: "x".repeat(90), facts: [{ label: "Wohnfläche", value: "84 m²" }, { label: "", value: "" }, { label: "Zimmer", value: "x".repeat(40) }] };
  yield { ...base, url: "https://beispiel.at/objekt-12/", photos: [{ id: "abcdef1", focus: { x: 0.2, y: 0.3, zoom: 1.5 }, rights: true, virtual: false, credit: "  Foto  Muster " }] };
  yield { ...base, kind: "miete", source: "unio", externalId: "J-123", statusSince: 5 };
  yield { ...base, kind: "pacht" };
  yield { ...base, photos: [{ id: "x" }] };
  yield { ...base, extra: 1 };
}

describe("Bibliothek wie alt", () => {
  it("Konstanten", () => {
    expect(L.LIBRARY_LIMITS).toEqual(li.i);
    expect(L.OBJECT_STATUSES).toEqual(li.z);
    expect(L.STATUS_LABEL).toEqual(li.N);
    expect(L.DEFAULT_FOCUS).toEqual(li.v);
    expect(L.MAX_ZOOM).toBe(li.P);
    expect(L.LIBRARY_ERRORS).toEqual(li.c);
    expect(L.createObject(5, "abcd")).toEqual(li.V(5, "abcd"));
  });
  it("Pruefung, Bereinigung, Aenderungen", () => {
    for (const o of objects()) {
      expect(outcome(() => L.validateLibraryObject(o, "p"))).toEqual(outcome(() => li.Z(o, "p")));
      expect(outcome(() => L.validateLibrary({ objects: [o] }, null))).toEqual(outcome(() => li.U({ objects: [o] }, null)));
      expect(outcome(() => L.libraryObjectErrors(o))).toEqual(outcome(() => li.W(o)));
      expect(outcome(() => L.cleanLibraryObject(o, 9))).toEqual(outcome(() => li.x(o, 9)));
      expect(outcome(() => L.lageOf(o))).toEqual(outcome(() => li.M(o)));
      for (const st of li.z) expect(outcome(() => L.setStatus(o, st, 7))).toEqual(outcome(() => li.H(o, st, 7)));
      expect(outcome(() => L.movePhoto(o, 0, 3))).toEqual(outcome(() => li.X(o, 0, 3)));
      expect(outcome(() => L.updatePhoto(o, "abcdef1", { focus: { x: 1 } }))).toEqual(outcome(() => li.q(o, "abcdef1", { focus: { x: 1 } })));
      const lib = { objects: [li.V(1, "aaaa"), o] };
      expect(outcome(() => L.upsertObject(lib, o))).toEqual(outcome(() => li.J(lib, o)));
      expect(outcome(() => L.upsertObject(lib, { ...o, id: "neu1" }))).toEqual(outcome(() => li.J(lib, { ...o, id: "neu1" })));
      expect(outcome(() => L.removeObject(lib, "aaaa"))).toEqual(outcome(() => li.Y(lib, "aaaa")));
      const dup = L.duplicateObject(o, 3);
      expect({ ...dup, id: "" }).toEqual({ ...li.Q(o, 3), id: "" });
    }
    const kitObj = { ...od.C(), title: "T", photoIds: ["abcdef1", "abcdef2"], energy: { hwb: "1", fgee: "", klasse: "B" } };
    expect(L.fromKitObject(kitObj, 4)).toEqual(li.F(kitObj, 4));
    expect(L.validateLibrary(undefined, kitObj)).toEqual(li.U(undefined, kitObj));
    const projects = [{ id: "p1", object: kitObj }, { id: "p2", library: { objects: [{ ...li.V(1, "bbbb"), photos: [{ id: "abcdef9" }] }] } }];
    for (const [pid, ex] of [["abcdef1", null], ["abcdef1", { projectId: "p1", kit: true }], ["abcdef9", { projectId: "p2", objectId: "bbbb" }], ["abcdef9", null]] as const)
      expect(L.photoInUse(projects as never, pid, ex as never)).toBe(li.ee(projects, pid, ex));
  });
});

describe("Objektdaten wie alt", () => {
  it("Konstanten und Funktionen", () => {
    expect(O.OBJECT_LIMITS).toEqual(od.t);
    expect(O.ENERGY_CLASSES).toEqual(od.k);
    expect(O.FACT_LABELS).toEqual(od.F);
    expect(O.FACT_PLACEHOLDERS).toEqual(od.T);
    expect(O.emptyObject()).toEqual(od.C());
    for (const v of ["", "c", "C fossil", "  b   Fossil  extra "]) expect(O.splitEebKlasse(v)).toEqual(od.A(v));
    for (const d of [undefined, "", "2025-03-14", "2026-07-01", "2026-06-30", "x"]) expect(O.isOldCertificate(d)).toBe(od.v(d));
    const base = od.C();
    const cases = [
      base,
      { ...base, title: " Titel  ", price: "1", url: "beispiel.at/x", energy: { ...base.energy, hwb: "32.5", fgee: "0.8", klasse: "B", eeb: "40", eebKlasse: "c fossil", ausweisDatum: "2025-01-01" } },
      { ...base, title: "", url: "nix", energy: { ...base.energy, hwb: "abc", klasse: "Z", eebKlasse: "Q" } },
      { ...base, photoIds: ["abcdef1", "abcdef1"] },
      { ...base, facts: Array.from({ length: 9 }, () => ({ label: "a", value: "b" })) },
    ];
    for (const o of cases) {
      expect(outcome(() => O.validateObject(o))).toEqual(outcome(() => od.L(o)));
      expect(O.objectErrors(o as never)).toEqual(od.W(o));
      expect(outcome(() => O.cleanObject(o as never))).toEqual(outcome(() => od._(o)));
      expect(O.energyComplete(o as never)).toBe(od.Z(o));
      const photos = { abcdef1: "data:image/png;base64,AAAA" };
      expect(O.kitObject(o as never, photos)).toEqual(od.K(o, photos));
    }
    expect(O.validateObject(null)).toBe(od.L(null));
  });
});
