/**
 * Typen der Vercel-Function `/api/brand-art-director` (server/brand-art-director.js).
 * Anfrage und Antwort entsprechen dem Client src/artdirector/client.ts.
 */
import type Anthropic from "@anthropic-ai/sdk";
import type { IncomingMessage, ServerResponse } from "node:http";

export type Aufwand = "low" | "medium" | "high" | "xhigh" | "max";
export type Stil = "elegant" | "modern" | "luxus" | "warm" | "mutig" | "natur" | "mix";

export interface ArtDirectorKarte {
  /** k0 bis k23 */
  id: string;
  /** PNG als Base64 ohne data:-Vorsatz, hoechstens 60 KB */
  png: string;
  /** kurze Beschreibung des Logos, bis 200 Zeichen */
  beschreibung?: string;
}

export interface ArtDirectorRequest {
  stil?: Stil;
  profil: { art: "person" | "firma"; ort?: string; zusatz?: string };
  marke: string;
  karten: ArtDirectorKarte[];
}

export interface ArtDirectorEintrag {
  id: string;
  wert: number;
  grund: string;
  ausschluss?: string;
}

export interface ArtDirectorNutzung {
  eingabe: number;
  ausgabe: number;
  cache: number;
}

export interface ArtDirectorResponse {
  ok: true;
  rangfolge: ArtDirectorEintrag[];
  modell: string;
  nutzung: ArtDirectorNutzung;
  testmodus?: true;
}

export interface ArtDirectorFehler {
  ok: false;
  fehler: string;
  fallback: "regel";
  feld?: string;
  status?: number | null;
}

export interface ArtDirectorConfig {
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
  MONATSBUDGET_TOKEN: 5000000;
}>;
export declare const MIN_KARTEN: 6;
export declare const MAX_KARTEN: 24;
export declare const MAX_PNG_BYTES: number;
export declare const MAX_BYTES: number;
export declare const STILE: readonly Stil[];
export declare const LEITFADEN: string;
export declare const ANTWORT_SCHEMA: Record<string, unknown>;

export declare class Ungueltig extends Error {
  feld: string;
  grund: "ungueltig" | "unbekannt" | "kontaktdaten";
}
export declare class ModellFehler extends Error {
  grund: string;
}

export declare function readConfig(env?: Record<string, string | undefined>): ArtDirectorConfig;
export declare function hatKontaktdaten(text: string): boolean;
export declare function base64Bytes(b64: string): number;
/** Prueft und reduziert die Anfrage; wirft `Ungueltig` bei ungueltigen Feldern oder Kontaktdaten. */
export declare function validateRequest(body: unknown): ArtDirectorRequest;
/** Nur bekannte IDs, keine Doppel, Wert 0 bis 100, absteigend sortiert. */
export declare function bereinigeRangfolge(
  rangfolge: unknown,
  anfrage: ArtDirectorRequest,
): ArtDirectorEintrag[];
export declare function nachricht(anfrage: ArtDirectorRequest): unknown[];
export declare function testAntwort(anfrage: ArtDirectorRequest): ArtDirectorResponse;
export declare function bremse(
  kv: { url: string; token: string },
  cfg: ArtDirectorConfig,
  wer: string,
  jetzt: number,
  fetchImpl: typeof fetch,
): Promise<null | "monatsbudget" | "stundenlimit" | "tageslimit">;
export declare function rufeModell(
  client: Anthropic,
  cfg: ArtDirectorConfig,
  anfrage: ArtDirectorRequest,
): Promise<Omit<ArtDirectorResponse, "ok" | "testmodus">>;

export interface Deps {
  env?: Record<string, string | undefined>;
  client?: Anthropic;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

type Req = IncomingMessage & { body?: unknown };
type Res = ServerResponse & {
  status(code: number): Res;
  json(body: unknown): Res;
};

export declare function createHandler(deps?: Deps): (req: Req, res: Res) => Promise<unknown>;
declare const handler: (req: Req, res: Res) => Promise<unknown>;
export default handler;
