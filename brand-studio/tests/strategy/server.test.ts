// Server /api/brand-strategie: Testmodus nur ausserhalb von Production, Pruefung der Anfrage
// (keine Kontaktdaten), Bremsen, Aufruf mit structured outputs und Rueckfall "regel".
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  ANTWORT_SCHEMA,
  LEITFADEN,
  STANDARD,
  createHandler,
  readConfig,
  validateRequest,
} from "../../server/brand-strategie.js";
import { buildStrategieRequest, pruefeKiTexte } from "../../src/strategy/kiTexte";
import { GEDANKENSTRICH } from "../../src/strategy/texts";
import type { BrandBrief, BrandRoute } from "../../src/strategy/types";

const golden = JSON.parse(
  readFileSync(join(__dirname, "..", "golden", "strategy", "routes.json"), "utf8"),
) as Record<string, { brief: BrandBrief; laeufe: Record<string, BrandRoute[]> }>;
const fall = golden["anna-berger"]!;
const anfrage = JSON.parse(JSON.stringify(buildStrategieRequest(fall.brief, fall.laeufe.standard!)));

interface Antwort {
  status: number;
  body: Record<string, any>;
  headers: Record<string, string>;
}

async function rufe(
  handler: ReturnType<typeof createHandler>,
  body: unknown = anfrage,
  extra: { method?: string; headers?: Record<string, string> } = {},
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
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...extra.headers },
      body,
    },
    res,
  );
  return out;
}

const modellAntwort = (routen: unknown, extra: Record<string, unknown> = {}) => ({
  model: "claude-opus-5-5",
  stop_reason: "end_turn",
  content: [
    { type: "thinking", thinking: "" },
    { type: "text", text: JSON.stringify({ routen }) },
  ],
  usage: { input_tokens: 1200, output_tokens: 3000, cache_read_input_tokens: 800, cache_creation_input_tokens: 0 },
  ...extra,
});

const fakeClient = (antwort: unknown) => {
  const create = vi.fn(async () => antwort);
  return { client: { beta: { messages: { create } } } as never, create };
};

/** Upstash-Ersatz: Zaehler im Speicher, Pipeline-Format wie die REST-API. */
function fakeUpstash() {
  const db = new Map<string, number>();
  const calls: unknown[][] = [];
  const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
    const befehle = JSON.parse(init.body as string) as string[][];
    calls.push(befehle);
    const result = befehle.map(([cmd, key, arg]) => {
      if (cmd === "INCR") db.set(key!, (db.get(key!) ?? 0) + 1);
      if (cmd === "INCRBY") db.set(key!, (db.get(key!) ?? 0) + Number(arg));
      if (cmd === "EXPIRE") return { result: 1 };
      if (cmd === "GET") return { result: db.has(key!) ? String(db.get(key!)) : null };
      return { result: db.get(key!) };
    });
    return new Response(JSON.stringify(result), { status: 200 });
  });
  return { db, calls, fetchImpl: fetchImpl as unknown as typeof fetch };
}

const KV = { KV_REST_API_URL: "https://kv.example.test", KV_REST_API_TOKEN: "t" };

describe("Einstellungen", () => {
  it("Standardwerte und Testmodus nie in Production", () => {
    const c = readConfig({});
    expect(c.model).toBe(STANDARD.MODEL);
    expect(c.model).toBe("claude-opus-5-5");
    expect(c.aufwand).toBe("medium");
    expect(c.stundenlimit).toBe(20);
    expect(c.tageslimit).toBe(200);
    expect(readConfig({ BRAND_STRATEGIE_TESTMODUS: "1" }).testmodus).toBe(true);
    expect(readConfig({ BRAND_STRATEGIE_TESTMODUS: "1", VERCEL_ENV: "production" }).testmodus).toBe(false);
    expect(readConfig({ BRAND_STRATEGIE_AUFWAND: "turbo" }).aufwand).toBe("medium");
    expect(readConfig({ BRAND_STRATEGIE_HERKUNFT: "https://a.test, https://b.test" }).herkunft).toEqual([
      "https://a.test",
      "https://b.test",
    ]);
  });

  it("Leitfaden und Schema ohne Gedankenstriche, Schema mit geschlossenen Objekten", () => {
    expect(GEDANKENSTRICH.test(LEITFADEN)).toBe(false);
    const offen: string[] = [];
    const pruefe = (s: any, pfad: string): void => {
      if (s.type === "object") {
        if (s.additionalProperties !== false) offen.push(pfad);
        for (const [k, v] of Object.entries(s.properties ?? {})) pruefe(v, `${pfad}.${k}`);
      }
      if (s.type === "array") pruefe(s.items, `${pfad}[]`);
    };
    pruefe(ANTWORT_SCHEMA, "$");
    expect(offen).toEqual([]);
  });
});

describe("Anfrage pruefen", () => {
  it("Anfrage des Clients ist gueltig", () => {
    expect(validateRequest(anfrage).routen.map((r) => r.id)).toEqual(["A", "B", "C"]);
  });

  it("lehnt Kontaktdaten, unbekannte Felder und falsche Routen ab", async () => {
    const h = createHandler({ env: { BRAND_STRATEGIE_TESTMODUS: "1" } });
    const mitMail = { ...anfrage, brief: { ...anfrage.brief, beleg: "Schreib an anna@beispiel.at" } };
    const r1 = await rufe(h, mitMail);
    expect(r1.status).toBe(400);
    expect(r1.body).toMatchObject({ ok: false, fehler: "kontaktdaten", fallback: "regel" });
    const mitTelefon = { ...anfrage, brief: { ...anfrage.brief, name: "Anna 0660 1234567" } };
    expect((await rufe(h, mitTelefon)).body.fehler).toBe("kontaktdaten");
    expect((await rufe(h, { ...anfrage, brief: { ...anfrage.brief, email: "x" } })).status).toBe(400);
    expect((await rufe(h, { ...anfrage, routen: anfrage.routen.slice(0, 2) })).status).toBe(400);
    expect((await rufe(h, "{kaputt")).status).toBe(400);
  });

  it("nur POST, nur JSON, Herkunft und Groesse", async () => {
    const h = createHandler({ env: { BRAND_STRATEGIE_TESTMODUS: "1", BRAND_STRATEGIE_HERKUNFT: "https://studio.test" } });
    expect((await rufe(h, anfrage, { method: "GET" })).status).toBe(405);
    expect((await rufe(h, anfrage, { headers: { "content-type": "text/plain" } })).status).toBe(415);
    expect((await rufe(h, anfrage, { headers: { origin: "https://boese.test" } })).status).toBe(403);
    expect((await rufe(h, anfrage, { headers: { origin: "https://studio.test" } })).status).toBe(200);
    const riesig = { ...anfrage, brief: { ...anfrage.brief, onlynessText: "x".repeat(40_000) } };
    expect((await rufe(h, JSON.stringify(riesig))).status).toBe(413);
  });
});

describe("Testmodus", () => {
  it("feste Texte ohne Modellaufruf, die die Pruefung des Clients bestehen", async () => {
    const { client, create } = fakeClient(null);
    const r = await rufe(createHandler({ env: { BRAND_STRATEGIE_TESTMODUS: "true" }, client }));
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, testmodus: true });
    expect(create).not.toHaveBeenCalled();
    for (const route of r.body.routen) {
      const geprueft = pruefeKiTexte(route.texte, fall.brief);
      expect(Object.keys(geprueft).sort()).toEqual(
        ["claim", "kernidee", "onlyness", "persoenlichkeit", "positionierung", "socialKit", "storyKurz", "storyMittel", "tonBeispiele", "versprechen", "wunschkunde"].sort(),
      );
    }
  });

  it("in Production ohne Schluessel kein Testmodus, sondern 503 mit Rueckfall", async () => {
    const r = await rufe(createHandler({ env: { BRAND_STRATEGIE_TESTMODUS: "1", VERCEL_ENV: "production" } }));
    expect(r.status).toBe(503);
    expect(r.body).toEqual({ ok: false, fehler: "nicht_konfiguriert", fallback: "regel" });
  });
});

describe("Modellaufruf", () => {
  const texte = { kernidee: "Eine Idee.", claim: "Rat, der hält" };
  const routen = [
    { id: "A", texte },
    { id: "B", texte },
    { id: "C", texte },
  ];

  it("Opus 5.5, effort, structured outputs, Cache am Leitfaden, Rueckfall default", async () => {
    const { client, create } = fakeClient(modellAntwort(routen));
    const kv = fakeUpstash();
    const r = await rufe(createHandler({ env: { ANTHROPIC_API_KEY: "k", ...KV }, client, fetchImpl: kv.fetchImpl }));
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
      ok: true,
      routen,
      modell: "claude-opus-5-5",
      nutzung: { eingabe: 1200, ausgabe: 3000, cache: 800 },
    });
    const [params] = create.mock.calls[0] as unknown as [Record<string, any>];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.fallbacks).toBe("default");
    expect(params.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(params.output_config).toEqual({ effort: "medium", format: { type: "json_schema", schema: ANTWORT_SCHEMA } });
    expect(params.system).toEqual([{ type: "text", text: LEITFADEN, cache_control: { type: "ephemeral" } }]);
    expect(params.thinking).toBeUndefined();
    expect(JSON.parse(params.messages[0].content)).toEqual(validateRequest(anfrage));
    // Token auf das Monatsbudget gebucht
    expect([...kv.db.entries()].find(([k]) => k.startsWith("brand-strategie:token:"))?.[1]).toBe(5000);
  });

  it("Bremsen: Stundenlimit, Tageslimit, Monatsbudget", async () => {
    const { client } = fakeClient(modellAntwort(routen));
    const kv = fakeUpstash();
    const h = createHandler({
      env: { ANTHROPIC_API_KEY: "k", ...KV, BRAND_STRATEGIE_STUNDENLIMIT: "2", BRAND_STRATEGIE_MONATSBUDGET_TOKEN: "9000" },
      client,
      fetchImpl: kv.fetchImpl,
      now: () => Date.parse("2026-11-27T10:00:00Z"),
    });
    expect((await rufe(h)).status).toBe(200);
    // zweiter Aufruf noch frei (5000 von 9000 Token), danach ist das Budget erreicht
    expect((await rufe(h)).status).toBe(200);
    const dritte = await rufe(h);
    expect(dritte.status).toBe(503);
    expect(dritte.body).toMatchObject({ fehler: "monatsbudget", fallback: "regel" });
    const andereStunde = createHandler({
      env: { ANTHROPIC_API_KEY: "k", ...KV, BRAND_STRATEGIE_STUNDENLIMIT: "0" },
      client,
      fetchImpl: fakeUpstash().fetchImpl,
    });
    const r = await rufe(andereStunde);
    expect(r.status).toBe(429);
    expect(r.body.fehler).toBe("stundenlimit");
    const tag = createHandler({
      env: { ANTHROPIC_API_KEY: "k", ...KV, BRAND_STRATEGIE_TAGESLIMIT: "0" },
      client,
      fetchImpl: fakeUpstash().fetchImpl,
    });
    expect((await rufe(tag)).body.fehler).toBe("tageslimit");
  });

  it("ohne Bremse in Production kein Aufruf", async () => {
    const { client, create } = fakeClient(modellAntwort(routen));
    const r = await rufe(createHandler({ env: { ANTHROPIC_API_KEY: "k", VERCEL_ENV: "production" }, client }));
    expect(r.status).toBe(503);
    expect(r.body.fehler).toBe("bremse_fehlt");
    expect(create).not.toHaveBeenCalled();
  });

  it("Ablehnung, abgeschnitten, kein JSON und API-Fehler: 502 mit Rueckfall", async () => {
    for (const [antwort, grund] of [
      [modellAntwort(routen, { stop_reason: "refusal" }), "abgelehnt"],
      [modellAntwort(routen, { stop_reason: "max_tokens" }), "abgeschnitten"],
      [{ ...modellAntwort(routen), content: [{ type: "text", text: "kein json" }] }, "kein_json"],
    ] as const) {
      const { client } = fakeClient(antwort);
      const r = await rufe(createHandler({ env: { ANTHROPIC_API_KEY: "k" }, client }));
      expect(r.status).toBe(502);
      expect(r.body).toEqual({ ok: false, fehler: grund, fallback: "regel" });
    }
    const create = vi.fn(async () => {
      throw new Error("netz");
    });
    const r = await rufe(createHandler({ env: { ANTHROPIC_API_KEY: "k" }, client: { beta: { messages: { create } } } as never }));
    expect(r.status).toBe(502);
    expect(r.body.fallback).toBe("regel");
  });
});
