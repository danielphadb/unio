// @vitest-environment jsdom
// KI-Rangfolge der Galerie ("Art Director"): Client (src/artdirector), Rangfolge-Helfer
// (src/ui/logic/artDirector.ts) im Vergleich mit der gesicherten Fassung (Gallery-Chunk) und der
// neu geschriebene Server /api/brand-art-director (Pruefung, Testmodus, Bremsen, Modellaufruf).
import { beforeAll, describe, expect, it, vi } from "vitest";
import { recovered } from "../helpers/recovered";
import {
  base64Bytes,
  clipText,
  fetchRanking,
  normalizeRequest,
  parseResponse,
  stripDataUrl,
} from "../../src/artdirector/client";
import { sizedSvg, svgAttr, svgSize, svgToPng, thumbnails } from "../../src/artdirector/thumbnails";
import { applyRanking, mergeCards, profileOf, rankingKey } from "../../src/ui/logic/artDirector";
import {
  ANTWORT_SCHEMA,
  MAX_PNG_BYTES,
  STANDARD,
  bereinigeRangfolge,
  createHandler,
  readConfig,
  testAntwort,
  validateRequest,
} from "../../server/brand-art-director.js";

let old: Record<string, any>;
beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  old = await recovered("Gallery");
}, 120000);

const plain = (x: unknown): string => JSON.stringify(x);

// kleinstes gueltiges PNG (1x1), als Base64
const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
const karten = (n: number, extra: Record<string, unknown> = {}) =>
  Array.from({ length: n }, (_, i) => ({ id: `k${i}`, png: PNG, ...extra }));
const ANFRAGE = {
  stil: "elegant",
  profil: { art: "person", ort: "Döbling", zusatz: "Immobilien" },
  marke: "Anna Berger",
  karten: karten(8, { beschreibung: "Wortmarke in Serif" }),
};

describe("Client wie in der gesicherten Fassung", () => {
  it("Anfrage normalisieren (An) fuer gueltige und ungueltige Eingaben", () => {
    const faelle: unknown[] = [
      ANFRAGE,
      { ...ANFRAGE, karten: karten(5) },
      { ...ANFRAGE, karten: karten(25) },
      { ...ANFRAGE, marke: "" },
      { ...ANFRAGE, marke: "x".repeat(81) },
      { ...ANFRAGE, profil: { art: "verein" } },
      { ...ANFRAGE, profil: { art: "firma", ort: "  ", zusatz: "z".repeat(90) } },
      { ...ANFRAGE, karten: [...karten(6), { id: "k0", png: PNG }] },
      { ...ANFRAGE, karten: [...karten(6), { id: "böse id", png: PNG }] },
      { ...ANFRAGE, karten: karten(6, { png: `data:image/png;base64,${PNG}` }) },
      { ...ANFRAGE, karten: karten(6, { png: "%%%" }) },
      { ...ANFRAGE, karten: karten(6, { png: "A".repeat(90000) }) },
      { ...ANFRAGE, karten: karten(6, { beschreibung: "b".repeat(300) }) },
      null,
      {},
    ];
    for (const f of faelle) expect(plain(normalizeRequest(f))).toBe(plain(old.An(f)));
  });

  it("Antwort lesen (Ie) prueft IDs, Doppel, Werte und Nutzung", () => {
    const ids = ["k0", "k1", "k2"];
    const faelle: unknown[] = [
      {
        ok: true,
        rangfolge: [
          { id: "k1", wert: 91.6, grund: "klar" },
          { id: "k0", wert: 140, grund: "x", ausschluss: "abgeschnitten" },
        ],
        modell: "m",
        nutzung: { eingabe: 1, ausgabe: 2, cache: 3 },
        testmodus: true,
      },
      { ok: true, rangfolge: [{ id: "k9", wert: 1, grund: "" }] },
      { ok: true, rangfolge: [{ id: "k1", wert: 1, grund: "" }, { id: "k1", wert: 2, grund: "" }] },
      { ok: true, rangfolge: [{ id: "k1", wert: Number.NaN, grund: "" }] },
      { ok: true, rangfolge: [] },
      { ok: false, rangfolge: [] },
      { ok: true, rangfolge: [{ id: "k2", wert: -5, grund: "g" }], nutzung: { eingabe: "x" } },
      "kaputt",
    ];
    for (const f of faelle) expect(plain(parseResponse(f, ids))).toBe(plain(old.Ie(f, ids)));
  });

  it("kleine Helfer (Tn, Fn, le)", () => {
    for (const s of [PNG, `data:image/png;base64,${PNG}`, " a b\nc ", ""]) {
      expect(stripDataUrl(s)).toBe(old.Tn(s));
      expect(base64Bytes(s)).toBe(old.Fn(s));
    }
    for (const s of [undefined, "", "  kurz  ", "x".repeat(250)])
      expect(clipText(s, 200)).toBe(old.le(s, 200));
  });

  it("Abruf (an) schickt die normalisierte Anfrage und liest die Antwort", async () => {
    const antwort = { ok: true, rangfolge: [{ id: "k3", wert: 80, grund: "gut" }] };
    const neu = vi.fn(async () => new Response(JSON.stringify(antwort), { status: 200 }));
    const alt = vi.fn(async () => new Response(JSON.stringify(antwort), { status: 200 }));
    const a = await fetchRanking(ANFRAGE, { fetchImpl: neu, endpoint: "/x" });
    const b = await old.$n(ANFRAGE, { fetchImpl: alt, endpoint: "/x" });
    expect(plain(a)).toBe(plain(b));
    expect((neu.mock.calls[0] as unknown[])[1]).toEqual((alt.mock.calls[0] as unknown[])[1]);
    const fehler = vi.fn(async () => new Response("{}", { status: 503 }));
    expect(await fetchRanking(ANFRAGE, { fetchImpl: fehler })).toBeNull();
    expect(await fetchRanking({ ...ANFRAGE, karten: [] }, { fetchImpl: fehler })).toBeNull();
    expect(fehler).toHaveBeenCalledTimes(1);
  });
});

describe("Vorschaubilder wie in der gesicherten Fassung", () => {
  const SVGS = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200"><rect/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"><rect/></svg>',
    "<svg viewBox='0,0,120,60'></svg>",
    "<svg></svg>",
    "kein svg",
  ];
  it("Groesse und Attribute (se, ze, zn)", () => {
    for (const s of SVGS) {
      expect(svgAttr(s, "viewBox")).toBe(old.se(s, "viewBox"));
      expect(plain(svgSize(s))).toBe(plain(old.ze(s)));
      expect(sizedSvg(s, 320, 160)).toBe(old.zn(s, 320, 160));
    }
  });
  it("PNG mit eigenem Rasterer (Pn, Vn), Verkleinern bis zur Grenze", async () => {
    const raster = (bytes: number) => async () => new Uint8Array(bytes).fill(7);
    for (const bytes of [10, 70 * 1024, 30 * 1024]) {
      const opts = { rasterisierer: raster(bytes), maxBytes: 40 * 1024 };
      expect(await svgToPng(SVGS[0]!, opts)).toBe(await old.Pn(SVGS[0], opts));
    }
    const liste = [
      { id: "k0", svg: SVGS[0]! },
      { id: "k1", svg: SVGS[3]!, beschreibung: "ohne Groesse" },
      { id: "k2", svg: SVGS[1]!, beschreibung: "zweites" },
    ];
    const opts = { rasterisierer: raster(100) };
    expect(plain(await thumbnails(liste, opts))).toBe(plain(await old.Vn(liste, opts)));
  });
});

describe("Rangfolge in der Galerie (src/ui/logic/artDirector.ts)", () => {
  const konzepte = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}` }));
  it("Karten mischen (Gn), Schluessel (Hn), Profil (Un), Umsortieren (Wn)", () => {
    expect(plain(mergeCards(konzepte.slice(0, 4), konzepte.slice(2, 9)))).toBe(
      plain(old.Gn(konzepte.slice(0, 4), konzepte.slice(2, 9))),
    );
    expect(plain(mergeCards(konzepte.slice(0, 2), konzepte.slice(0, 3)))).toBe(
      plain(old.Gn(konzepte.slice(0, 2), konzepte.slice(0, 3))),
    );
    const input = {
      name: "Anna Berger",
      suffix: "Immobilien",
      place: "Döbling",
      nameKind: "person",
      styles: ["elegant"],
    };
    expect(rankingKey(input, konzepte)).toBe(old.Hn(input, konzepte));
    for (const i of [input, { name: "Wohnwerk GmbH", styles: [] }, { ...input, place: " " }])
      expect(plain(profileOf(i))).toBe(plain(old.Un(i)));
    const ranking = {
      rangfolge: [
        { id: "k3", wert: 90, grund: "stark" },
        { id: "k1", wert: 50, grund: "", ausschluss: "unleserlich" },
        { id: "k7", wert: 40, grund: "solide" },
      ],
    };
    for (const n of [3, 6, 20]) {
      const a = applyRanking(konzepte, ranking, n, new Set(["c7"]));
      const b = old.Wn(konzepte, ranking, n, new Set(["c7"]));
      expect(a.page.map((c: { id: string }) => c.id)).toEqual(
        b.page.map((c: { id: string }) => c.id),
      );
      expect([...a.reasons]).toEqual([...b.reasons]);
    }
  });
});

// ---------------------------------------------------------------------------
// Server

interface Antwort {
  status: number;
  body: Record<string, any>;
  headers: Record<string, string>;
}

async function rufe(
  handler: ReturnType<typeof createHandler>,
  body: unknown = ANFRAGE,
  extra: { method?: string } = {},
): Promise<Antwort> {
  const out: Antwort = { status: 0, body: {}, headers: {} };
  const res = {
    setHeader(k: string, v: string) {
      out.headers[k] = v;
    },
    status(code: number) {
      out.status = code;
      return res;
    },
    json(b: Record<string, any>) {
      out.body = b;
    },
  };
  await (handler as any)(
    {
      method: extra.method ?? "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
      body,
    },
    res,
  );
  return out;
}

const fakeClient = (rangfolge: unknown, extra: Record<string, unknown> = {}) => {
  const create = vi.fn(async () => ({
    model: "claude-opus-5-5",
    stop_reason: "end_turn",
    content: [{ type: "text", text: JSON.stringify({ rangfolge }) }],
    usage: {
      input_tokens: 4000,
      output_tokens: 600,
      cache_read_input_tokens: 900,
      cache_creation_input_tokens: 0,
    },
    ...extra,
  }));
  return { client: { beta: { messages: { create } } } as never, create };
};

function fakeUpstash() {
  const db = new Map<string, number>();
  const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
    const befehle = JSON.parse(init.body as string) as string[][];
    const result = befehle.map(([cmd, key, wert]) => {
      if (cmd === "INCR") db.set(key!, (db.get(key!) ?? 0) + 1);
      if (cmd === "INCRBY") db.set(key!, (db.get(key!) ?? 0) + Number(wert));
      return { result: cmd === "EXPIRE" ? 1 : (db.get(key!) ?? null) };
    });
    return new Response(JSON.stringify(result), { status: 200 });
  });
  return { db, fetchImpl };
}

describe("Server /api/brand-art-director", () => {
  it("Standardwerte und Testmodus nie in Production", () => {
    const cfg = readConfig({});
    expect(cfg.model).toBe(STANDARD.MODEL);
    expect(cfg.testmodus).toBe(false);
    expect(readConfig({ BRAND_ART_DIRECTOR_TESTMODUS: "1" }).testmodus).toBe(true);
    expect(
      readConfig({ BRAND_ART_DIRECTOR_TESTMODUS: "1", VERCEL_ENV: "production" }).testmodus,
    ).toBe(false);
  });

  it("Pruefung der Anfrage passt zum Client", () => {
    // Was der Client schickt, nimmt der Server an
    const vomClient = normalizeRequest(ANFRAGE);
    expect(validateRequest(vomClient)).toEqual(vomClient);
    const falsch = [
      { ...ANFRAGE, karten: karten(5) },
      { ...ANFRAGE, karten: karten(6, { png: "AAAA" }) },
      { ...ANFRAGE, karten: [...karten(6), { id: "k1", png: PNG }] },
      { ...ANFRAGE, profil: { art: "x" } },
      { ...ANFRAGE, stil: "laut" },
      { ...ANFRAGE, extra: 1 },
      { ...ANFRAGE, marke: "mail@example.at" },
    ];
    for (const f of falsch) expect(() => validateRequest(f)).toThrow();
    const gross = "i" + "A".repeat(Math.ceil(((MAX_PNG_BYTES + 10) * 4) / 3));
    expect(() => validateRequest({ ...ANFRAGE, karten: karten(6, { png: gross }) })).toThrow();
  });

  it("Testmodus liefert eine Rangfolge, die der Client annimmt", async () => {
    const r = await rufe(createHandler({ env: { BRAND_ART_DIRECTOR_TESTMODUS: "1" } }));
    expect(r.status).toBe(200);
    expect(r.body.testmodus).toBe(true);
    const ids = ANFRAGE.karten.map((k) => k.id);
    const gelesen = parseResponse(r.body, ids);
    expect(gelesen?.rangfolge.map((e: { id: string }) => e.id)).toEqual(ids);
    expect(testAntwort(validateRequest(ANFRAGE)).rangfolge).toHaveLength(8);
  });

  it("Methode, Format, Schluessel und Bremse", async () => {
    expect((await rufe(createHandler({ env: {} }), ANFRAGE, { method: "GET" })).status).toBe(405);
    expect((await rufe(createHandler({ env: {} }), { marke: "" })).body.fehler).toBe("anfrage");
    expect((await rufe(createHandler({ env: {} }))).body.fehler).toBe("nicht_konfiguriert");
    const { client } = fakeClient([]);
    expect(
      (await rufe(createHandler({ env: { VERCEL_ENV: "production" }, client }))).body.fehler,
    ).toBe("bremse_fehlt");
  });

  it("Modellaufruf mit Bildern, structured outputs, Cache und Token-Buchung", async () => {
    const { client, create } = fakeClient([
      { id: "k2", wert: 88.4, grund: "Klar – und eigenstaendig", ausschluss: "" },
      { id: "k2", wert: 10, grund: "doppelt", ausschluss: "" },
      { id: "k5", wert: 120, grund: "stark", ausschluss: "" },
      { id: "k9", wert: 50, grund: "unbekannt", ausschluss: "" },
      { id: "k0", wert: 20, grund: "schwach", ausschluss: "Name abgeschnitten" },
    ]);
    const { db, fetchImpl } = fakeUpstash();
    const env = {
      ANTHROPIC_API_KEY: "test",
      KV_REST_API_URL: "https://kv.example",
      KV_REST_API_TOKEN: "t",
    };
    const r = await rufe(
      createHandler({ env, client, fetchImpl: fetchImpl as never, now: () => Date.UTC(2026, 10, 27, 10) }),
    );
    expect(r.status).toBe(200);
    expect(r.body.rangfolge).toEqual([
      { id: "k5", wert: 100, grund: "stark" },
      { id: "k2", wert: 88, grund: "Klar - und eigenstaendig" },
      { id: "k0", wert: 20, grund: "schwach", ausschluss: "Name abgeschnitten" },
    ]);
    const params = (create.mock.calls[0] as unknown as [Record<string, any>])[0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.fallbacks).toBe("default");
    expect(params.output_config).toEqual({
      effort: "medium",
      format: { type: "json_schema", schema: ANTWORT_SCHEMA },
    });
    expect(params.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(params.system[0].text).not.toMatch(/[–—]/);
    const bilder = params.messages[0].content.filter((b: { type: string }) => b.type === "image");
    expect(bilder).toHaveLength(8);
    expect(bilder[0].source).toEqual({ type: "base64", media_type: "image/png", data: PNG });
    expect(db.get("brand-art-director:token:2026-11")).toBe(4000 + 600 + 900);
  });

  it("Ablehnung, leere Rangfolge und Stundenlimit fuehren zum Rueckfall", async () => {
    const abgelehnt = fakeClient([], { stop_reason: "refusal" });
    const r = await rufe(createHandler({ env: { ANTHROPIC_API_KEY: "x" }, client: abgelehnt.client }));
    expect(r.status).toBe(502);
    expect(r.body).toEqual({ ok: false, fehler: "abgelehnt", fallback: "regel" });
    const leer = fakeClient([{ id: "zz", wert: 1, grund: "", ausschluss: "" }]);
    expect(
      (await rufe(createHandler({ env: { ANTHROPIC_API_KEY: "x" }, client: leer.client }))).body
        .fehler,
    ).toBe("leer");
    expect(bereinigeRangfolge("kaputt", validateRequest(ANFRAGE))).toEqual([]);
    const { fetchImpl } = fakeUpstash();
    const env = {
      ANTHROPIC_API_KEY: "x",
      KV_REST_API_URL: "https://kv.example",
      KV_REST_API_TOKEN: "t",
      BRAND_ART_DIRECTOR_STUNDENLIMIT: "1",
    };
    const ok = fakeClient([{ id: "k1", wert: 70, grund: "gut", ausschluss: "" }]);
    const h = createHandler({ env, client: ok.client, fetchImpl: fetchImpl as never });
    expect((await rufe(h)).status).toBe(200);
    const zweiter = await rufe(h);
    expect(zweiter.status).toBe(429);
    expect(zweiter.body.fehler).toBe("stundenlimit");
  });
});
