// @vitest-environment jsdom
// KI-Namen: Client (src/namen/kiNamen.ts) im Vergleich mit der gesicherten Fassung und
// Server /api/brand-namen (Testmodus, Pruefung, Bremsen, Modellaufruf, Rueckfall).
import { beforeAll, describe, expect, it, vi } from "vitest";
import { recovered } from "../helpers/recovered";
import {
  fetchKiNamen,
  inputFromRequest,
  kiNamen,
  normalizeRequest,
  parseResponse,
  requestFromForm,
  type KiNamenRequest,
} from "../../src/namen/kiNamen";
import { pruefeFremdnamen } from "../../src/engine/names";
import type { NameFinderForm } from "../../src/engine/names/finder";
import {
  ANTWORT_SCHEMA,
  STANDARD,
  createHandler,
  readConfig,
  validateRequest,
} from "../../server/brand-namen.js";

let old: Record<string, any>;
beforeAll(async () => {
  old = await recovered("nameFinder");
}, 60000);

const plain = (x: unknown): string => JSON.stringify(x);

const FORM: NameFinderForm = {
  person: "Anna Maria Berger",
  company: "",
  region: "Döbling",
  focus: ["wohnen"],
  style: "elegant",
  keywords: "Altbau, Garten",
  description: "",
  chips: [],
  seed: 3,
  creativity: "ausgewogen",
  exclude: "",
  maxLength: null,
};

const KI = {
  ok: true,
  namen: [
    { name: "Lumora", art: "kreativ", bedeutung: "aus lumen, Licht", sprache: "la" },
    { name: "Weitblick", art: "bildhaft", bedeutung: "der Blick in die Ferne", sprache: "de" },
    { name: "Traumvilla", art: "bildhaft", bedeutung: "", sprache: "de" },
    { name: "Berger Adressen", art: "personenbezogen", bedeutung: "", sprache: "de" },
  ],
};

describe("Client wie in der gesicherten Fassung", () => {
  it("Anfrage aus dem Formular (ul), Normalisierung (Ad), Eingabe (Ld)", () => {
    const req = requestFromForm(FORM, ["Erker", "Salon"], ["Kabinett"]);
    expect(plain(req)).toBe(plain(old.ul(FORM, ["Erker", "Salon"], ["Kabinett"])));
    expect(requestFromForm({ ...FORM, region: "" }, [], [])).toBeNull();
    const roh: Partial<KiNamenRequest> = {
      ...req!,
      anzahl: 99,
      arten: ["kreativ", "kreativ", "falsch" as never],
      ausschluss: Array.from({ length: 150 }, (_, i) => ` Name ${i} `),
      stichworte: ["a".repeat(50), "Altbau", "Altbau"],
    };
    expect(plain(normalizeRequest(roh))).toBe(plain(old.Ad(roh)));
    expect(normalizeRequest({ region: "  " })).toBeNull();
    expect(plain(inputFromRequest(req!))).toBe(plain(old.Ld(req)));
  });

  it("Antwort lesen (Ed): ein ungueltiger Eintrag verwirft alles", () => {
    expect(plain(parseResponse(KI))).toBe(plain(old.Ed(KI)));
    const kaputt = { ok: true, namen: [...KI.namen, { name: "X", art: "unbekannt" }] };
    expect(parseResponse(kaputt)).toBeNull();
    expect(old.Ed(kaputt)).toBeNull();
    expect(parseResponse({ ok: false })).toBeNull();
  });

  it("Abruf (Md) prueft mit pruefeFremdnamen wie im Bundle", async () => {
    const req = requestFromForm(FORM, [], [])!;
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(KI), { status: 200 }));
    const neu = await fetchKiNamen(req, {
      pruefe: pruefeFremdnamen,
      fetchImpl: fetchImpl as never,
    });
    const alt = await old.Md(req, { pruefe: old.wd, fetchImpl });
    expect(plain(neu)).toBe(plain(alt));
    expect(neu?.some((s) => s.name === "Traumvilla")).toBe(false);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/brand-namen");
    expect(JSON.parse(init.body as string)).toEqual(normalizeRequest(req));
  });

  it("Fehler, Abbruch und fehlende Pruefung ergeben null", async () => {
    const req = requestFromForm(FORM, [], [])!;
    const fehler = vi.fn(async () => new Response("{}", { status: 503 }));
    expect(
      await fetchKiNamen(req, { pruefe: pruefeFremdnamen, fetchImpl: fehler as never }),
    ).toBeNull();
    const wirft = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(
      await fetchKiNamen(req, { pruefe: pruefeFremdnamen, fetchImpl: wirft as never }),
    ).toBeNull();
    const ac = new AbortController();
    ac.abort();
    expect(
      await fetchKiNamen(req, {
        pruefe: pruefeFremdnamen,
        fetchImpl: fehler as never,
        signal: ac.signal,
      }),
    ).toBeNull();
    expect(await kiNamen("ohne-pruefung", req, undefined, null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Server

interface Antwort {
  status: number;
  body: Record<string, any>;
  headers: Record<string, string>;
}

const anfrage = {
  region: "Döbling",
  marke: { nachname: "Berger" },
  stichworte: ["Altbau"],
  stil: "elegant",
  anzahl: 24,
};

async function rufe(
  handler: ReturnType<typeof createHandler>,
  body: unknown = anfrage,
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
  await handler(
    {
      method: extra.method ?? "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
      body,
    },
    res,
  );
  return out;
}

const fakeClient = (namen: unknown, extra: Record<string, unknown> = {}) => {
  const create = vi.fn(async () => ({
    model: "claude-opus-5-5",
    stop_reason: "end_turn",
    content: [
      { type: "thinking", thinking: "" },
      { type: "text", text: JSON.stringify({ namen }) },
    ],
    usage: {
      input_tokens: 900,
      output_tokens: 700,
      cache_read_input_tokens: 1500,
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

describe("Server /api/brand-namen", () => {
  it("Standardwerte und Testmodus nie in Production", () => {
    expect(STANDARD.MODEL).toBe("claude-opus-5-5");
    expect(readConfig({ BRAND_NAMEN_TESTMODUS: "1" }).testmodus).toBe(true);
    expect(readConfig({ BRAND_NAMEN_TESTMODUS: "1", VERCEL_ENV: "production" }).testmodus).toBe(
      false,
    );
    expect(readConfig({ BRAND_NAMEN_AUFWAND: "hoch" }).aufwand).toBe("medium");
  });

  it("Pruefung der Anfrage", () => {
    expect(validateRequest(anfrage)).toEqual({ ...anfrage, marke: { nachname: "Berger" } });
    expect(() => validateRequest({ ...anfrage, region: "" })).toThrow();
    expect(() => validateRequest({ ...anfrage, anzahl: 99 })).toThrow();
    expect(() => validateRequest({ ...anfrage, stil: "bunt" })).toThrow();
    expect(() => validateRequest({ ...anfrage, telefon: "1" })).toThrow();
    expect(() => validateRequest({ ...anfrage, stichworte: ["anna@example.at"] })).toThrow(
      /kontaktdaten/,
    );
  });

  it("Testmodus liefert regelkonforme Namen, die der Client annimmt", async () => {
    const r = await rufe(createHandler({ env: { BRAND_NAMEN_TESTMODUS: "1" } }));
    expect(r.status).toBe(200);
    expect(r.body.testmodus).toBe(true);
    const namen = parseResponse(r.body);
    expect(namen?.length).toBeGreaterThanOrEqual(10);
    expect(pruefeFremdnamen(namen, inputFromRequest(anfrage as never)).length).toBeGreaterThan(5);
  });

  it("Methode, Format, Schluessel und Bremse", async () => {
    expect((await rufe(createHandler({ env: {} }), anfrage, { method: "GET" })).status).toBe(405);
    expect((await rufe(createHandler({ env: {} }), { region: "" })).body.fehler).toBe("anfrage");
    expect((await rufe(createHandler({ env: {} }))).body.fehler).toBe("nicht_konfiguriert");
    const { client } = fakeClient([]);
    expect(
      (await rufe(createHandler({ env: { VERCEL_ENV: "production" }, client }))).body.fehler,
    ).toBe("bremse_fehlt");
  });

  it("Modellaufruf mit structured outputs, Cache, Rueckfall und Token-Buchung", async () => {
    const { client, create } = fakeClient([
      { name: "Lumora", art: "kreativ", bedeutung: "aus lumen", sprache: "la" },
      { name: "Lumora", art: "kreativ", bedeutung: "doppelt", sprache: "la" },
      { name: "Erker", art: "bildhaft", bedeutung: "", sprache: "de" },
      { name: "X", art: "falsch", bedeutung: "", sprache: "" },
    ]);
    const { db, fetchImpl } = fakeUpstash();
    const env = {
      ANTHROPIC_API_KEY: "test",
      KV_REST_API_URL: "https://kv.example",
      KV_REST_API_TOKEN: "t",
    };
    const r = await rufe(
      createHandler({
        env,
        client,
        fetchImpl: fetchImpl as never,
        now: () => Date.UTC(2026, 10, 27, 10),
      }),
      {
        ...anfrage,
        ausschluss: ["Erker"],
      },
    );
    expect(r.status).toBe(200);
    expect(r.body.namen.map((n: { name: string }) => n.name)).toEqual(["Lumora"]);
    const params = (create.mock.calls[0] as unknown as [Record<string, any>])[0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.fallbacks).toBe("default");
    expect(params.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(params.output_config).toEqual({
      effort: "medium",
      format: { type: "json_schema", schema: ANTWORT_SCHEMA },
    });
    expect(params.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(params.system[0].text).not.toMatch(/[–—]/);
    expect(db.get("brand-namen:token:2026-11")).toBe(900 + 700 + 1500);
  });

  it("Ablehnung und Stundenlimit fuehren zum Rueckfall", async () => {
    const { client } = fakeClient([], { stop_reason: "refusal" });
    const r = await rufe(createHandler({ env: { ANTHROPIC_API_KEY: "x" }, client }));
    expect(r.status).toBe(502);
    expect(r.body).toEqual({ ok: false, fehler: "abgelehnt", fallback: "regel" });
    const { fetchImpl } = fakeUpstash();
    const env = {
      ANTHROPIC_API_KEY: "x",
      KV_REST_API_URL: "https://kv.example",
      KV_REST_API_TOKEN: "t",
      BRAND_NAMEN_STUNDENLIMIT: "1",
    };
    const ok = fakeClient([{ name: "Lumora", art: "kreativ", bedeutung: "", sprache: "la" }]);
    const h = createHandler({ env, client: ok.client, fetchImpl: fetchImpl as never });
    expect((await rufe(h)).status).toBe(200);
    const zweiter = await rufe(h);
    expect(zweiter.status).toBe(429);
    expect(zweiter.body.fehler).toBe("stundenlimit");
  });
});
