/**
 * Typen der Vercel-Function `/api/brand-namen` (server/brand-namen.js).
 * Anfrage und Antwort entsprechen dem Client src/namen/kiNamen.ts.
 */
import type Anthropic from "@anthropic-ai/sdk";
import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  KiName,
  KiNamenArt,
  KiNamenFehler,
  KiNamenRequest,
  KiNamenResponse,
} from "../src/namen/kiNamen";

export type { KiName, KiNamenArt, KiNamenRequest, KiNamenResponse, KiNamenFehler };

export type Aufwand = "low" | "medium" | "high" | "xhigh" | "max";

export interface NamenConfig {
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
  STUNDENLIMIT: 30;
  TAGESLIMIT: 300;
  MONATSBUDGET_TOKEN: 2000000;
}>;
export declare const MAX_BYTES: number;
export declare const ARTEN: readonly KiNamenArt[];
export declare const STILE: readonly string[];
export declare const ANZAHL_MIN: 20;
export declare const ANZAHL_MAX: 40;
export declare const LEITFADEN: string;
export declare const ANTWORT_SCHEMA: Record<string, unknown>;

export declare class Ungueltig extends Error {
  feld: string;
  grund: "ungueltig" | "unbekannt" | "kontaktdaten";
}
export declare class ModellFehler extends Error {
  grund: string;
}

export declare function readConfig(env?: Record<string, string | undefined>): NamenConfig;
export declare function hatKontaktdaten(text: string): boolean;
/** Prueft und reduziert die Anfrage; wirft `Ungueltig` bei ungueltigen Feldern oder Kontaktdaten. */
export declare function validateRequest(body: unknown): KiNamenRequest;
/** Gueltige Art, Laenge bis 28, ohne Doppel und ohne Namen aus Ausschluss und Gemerkten. */
export declare function bereinigeNamen(namen: unknown, anfrage: KiNamenRequest): KiName[];
export declare function testAntwort(anfrage: KiNamenRequest): KiNamenResponse;
export declare function bremse(
  kv: { url: string; token: string },
  cfg: NamenConfig,
  wer: string,
  jetzt: number,
  fetchImpl: typeof fetch,
): Promise<null | "monatsbudget" | "stundenlimit" | "tageslimit">;
export declare function rufeModell(
  client: Anthropic,
  cfg: NamenConfig,
  anfrage: KiNamenRequest,
): Promise<Omit<KiNamenResponse, "ok" | "testmodus">>;

/** Minimale Request- und Response-Form wie bei Vercel (Node.js Runtime). */
export interface VercelLikeRequest extends Partial<Pick<IncomingMessage, "socket">> {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}
export interface VercelLikeResponse extends Partial<Pick<ServerResponse, "setHeader">> {
  setHeader(name: string, value: string): unknown;
  status(code: number): VercelLikeResponse;
  json(body: KiNamenResponse | KiNamenFehler | Record<string, unknown>): unknown;
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
