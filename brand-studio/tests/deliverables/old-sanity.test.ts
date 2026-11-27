// @vitest-environment jsdom
// Voraussetzung: die gesicherte Fassung reproduziert Unterlagen und Postings auch unter Node.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { recovered } from "../helpers/recovered";
import { goldenInputs, goldenJson, goldenSvgFile, installKitFontFetch, installPreloadShim, normalizeIds, fixClock } from "../helpers/goldenKit";

let M: Record<string, Record<string, any>>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  M = {
    en: await recovered("engine"),
    ix: await recovered("index"),
    ka: await recovered("kitAssets"),
    ps: await recovered("PostingsScreen"),
    li: await recovered("library"),
  };
  installKitFontFetch();
  installPreloadShim();
  fixClock(vi);
}, 60000);

async function kitContext() {
  const m = M as any;
  const cfg = goldenInputs;
  const pc = cfg.postings;
  const brand = cfg.marken.find((b: any) => b.slug === pc.marke);
  const sc = m.ix.i0(brand.suffix);
  const p = m.ix.Ik(
    { rawName: brand.rawName, suffixChoice: sc.choice, customSuffix: sc.custom, keepLegalForm: false, place: brand.place, nameKind: brand.nameKind },
    Date.parse("2026-10-27T09:00:00Z"),
    `golden${brand.slug.replace(/[^a-z0-9]/g, "")}`.slice(0, 40),
  );
  const input = { ...p.input, styles: [...brand.styles] };
  const concept = goldenJson("unterlagen/index.json").konzept;
  const contact = { ...m.ix.e0(), ...pc.kontakt };
  const assets = m.ka.ju(concept, input, contact);
  await m.ka.ge.ensure([...m.ka.ro([concept], false, input), ...m.ka.co([concept])]);
  await m.ka.cr();
  const t = Date.parse(cfg.zeitpunkt);
  const object = { ...m.li.V(t, pc.objekt.id), ...pc.objekt, statusSince: t, createdAt: t, updatedAt: t };
  return { m, input, concept, contact, assets, object };
}

describe("alte Unterlagen unter Node", () => {
  it("alle Seiten byte-gleich", async () => {
    const { m, assets } = await kitContext();
    const g = goldenJson("unterlagen/index.json");
    let n = 0;
    const bad: string[] = [];
    for (const [name, unio] of [["unio", true], ["eigen", false]] as const) {
      const list = await m.ka.ca(unio);
      for (const it of list) {
        const ref = g.sets[name][it.id];
        if (it.available && !it.available(assets)) {
          expect(ref.verfuegbar).toBe(false);
          continue;
        }
        const pages = it.pages ? it.pages(assets) : [{ label: it.label, svg: it.preview(assets) }];
        expect(pages.length, it.id).toBe(ref.seiten.length);
        pages.forEach((pg: any, i: number) => {
          n++;
          if (normalizeIds(pg.svg) !== normalizeIds(goldenSvgFile(ref.seiten[i].datei))) bad.push(`${name}/${it.id}/${i}`);
        });
      }
    }
    expect(bad).toEqual([]);
    expect(n).toBe(100);
  }, 300000);
});

export const EXTRAS = {
  termin: { datum: "2026-11-07", von: "10:00", bis: "12:00" },
  markt: {
    region: "Wien-Neubau",
    zeitraum: "3. Quartal 2026",
    werte: [
      { label: "Preis je m²", value: "7.850 €" },
      { label: "Vermarktungsdauer", value: "74 Tage" },
    ],
    satz: "Gute Wohnungen gehen weiter schnell weg.",
    quelle: "Eigene Auswertung (erfunden)",
  },
  stimme: { text: "Ruhig, ehrlich und gut vorbereitet.", wer: "Familie M. aus Wien", einwilligung: true },
};

describe("alte Postings unter Node", () => {
  it("alle Seiten byte-gleich (IDs normalisiert)", async () => {
    const { m, assets, object } = await kitContext();
    const g = goldenJson("postings/index.json");
    expect(JSON.parse(JSON.stringify(object))).toEqual(g.objekt);
    const kit = m.ka.Et(assets);
    const bad: string[] = [];
    let n = 0;
    for (const look of goldenInputs.postings.looks)
      for (const occ of m.ps.vn.map((o: any) => o.id)) {
        const obj = m.ps.q(occ).needsObject ? object : null;
        const sel = { ...m.ps.mt(m.ps.Pe(obj, look), occ), extras: EXTRAS };
        const ctx = { sel, object: obj, photos: [], contact: kit.contact, brandName: kit.brandName, route: undefined, portrait: undefined };
        for (const f of m.ps.De.map((x: any) => x.id)) {
          const pages = m.ps.qe(f, ctx);
          for (let p = 0; p < pages; p++) {
            const key = `${look}/${occ}/${f}${pages > 1 ? `-${p + 1}` : ""}`;
            const r = m.ps.bt(kit, ctx, f, p);
            const ref = g.svg[key];
            n++;
            if (
              normalizeIds(r.svg) !== normalizeIds(goldenSvgFile(ref.datei)) ||
              JSON.stringify([r.W, r.H, r.notes, r.checks]) !== JSON.stringify([ref.W, ref.H, ref.notes, ref.checks])
            )
              bad.push(key);
          }
        }
      }
    expect(bad).toEqual([]);
    expect(n).toBe(Object.keys(g.svg).length);
  }, 300000);
});
