/**
 * Typen der Vercel-Function `/api/brand-strategie` (server/brand-strategie.js).
 * Anfrage und Antwort entsprechen dem Client src/strategy/kiTexte.ts.
 */
import type Anthropic from "@anthropic-ai/sdk";
import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  KiRoutenTexte,
  StrategieBrief,
  StrategieFehler,
  StrategieRequest,
  StrategieResponse,
  StrategieRoute,
} from "../src/strategy/kiTexte";

export type { StrategieBrief, StrategieRequest, StrategieResponse, StrategieRoute, StrategieFehler, KiRoutenTexte };

export type Aufwand = "low" | "medium" | "high" | "xhigh" | "max";

export interface StrategieConfig {
  model: string;
  aufwand: Aufwand;
  stundenlimit: number;
  tageslimit: number;
  monatsbudget: number;
  testmodus: boolean;
  production: boolean;
  herkunft: string[];
  apiKey: string;
  kv: { url: string; token: string } | null;
}

export declare const STANDARD: Readonly<{
  MODEL: "claude-opus-5-5";
  AUFWAND: "medium";
  STUNDENLIMIT: 20;
  TAGESLIMIT: 200;
  MONATSBUDGET_TOKEN: 2000000;
}>;
export declare const MAX_BYTES: number;
export declare const LEITFADEN: string;
export declare const ANTWORT_SCHEMA: Record<string, unknown>;

export declare function readConfig(env?: Record<string, string | undefined>): StrategieConfig;
export declare function hatKontaktdaten(text: string): boolean;
/** Prueft und reduziert die Anfrage; wirft bei ungueltigen Feldern oder Kontaktdaten. */
export declare function validateRequest(body: unknown): StrategieRequest;
export declare function testAntwort(anfrage: StrategieRequest): StrategieResponse;
export declare function bremse(
  kv: { url: string; token: string },
  cfg: StrategieConfig,
  wer: string,
  jetzt: number,
  fetchImpl: typeof fetch,
): Promise<null | "monatsbudget" | "stundenlimit" | "tageslimit">;
export declare function rufeModell(
  client: Anthropic,
  cfg: StrategieConfig,
  anfrage: StrategieRequest,
): Promise<Omit<StrategieResponse, "ok" | "testmodus">>;

/** Minimale Request- und Response-Form wie bei Vercel (Node.js Runtime). */
export interface VercelLikeRequest extends Partial<Pick<IncomingMessage, "socket">> {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}
export interface VercelLikeResponse extends Partial<Pick<ServerResponse, "setHeader">> {
  setHeader(name: string, value: string): unknown;
  status(code: number): VercelLikeResponse;
  json(body: StrategieResponse | StrategieFehler | Record<string, unknown>): unknown;
}

export interface HandlerDeps {
  env?: Record<string, string | undefined>;
  client?: Pick<Anthropic, "beta">;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

export declare function createHandler(
  deps?: HandlerDeps,
): (req: VercelLikeRequest, res: VercelLikeResponse) => Promise<unknown>;

declare const handler: (req: VercelLikeRequest, res: VercelLikeResponse) => Promise<unknown>;
export default handler;
