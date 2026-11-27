/// <reference types="vitest" />
import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Dev-Endpunkte: die Vercel-Functions aus server/ laufen im Dev- und Preview-Server mit, immer
 * im Testmodus (feste Antworten, kein Modellaufruf, kein Schlüssel nötig).
 */
const ENDPUNKTE: Record<string, { datei: string; testmodus: string }> = {
  "/api/brand-art-director": {
    datei: "./server/brand-art-director.js",
    testmodus: "BRAND_ART_DIRECTOR_TESTMODUS",
  },
  "/api/brand-namen": { datei: "./server/brand-namen.js", testmodus: "BRAND_NAMEN_TESTMODUS" },
  "/api/brand-strategie": {
    datei: "./server/brand-strategie.js",
    testmodus: "BRAND_STRATEGIE_TESTMODUS",
  },
};

type Handler = (req: unknown, res: unknown) => Promise<unknown>;
type ServerModule = { createHandler: (deps?: { env?: Record<string, string> }) => Handler };

function koerperLesen(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let daten = "";
    req.setEncoding("utf8");
    req.on("data", (teil: string) => (daten += teil));
    req.on("end", () => resolve(daten));
    req.on("error", reject);
  });
}

function devEndpunkte(): Plugin {
  const handler = new Map<string, Promise<Handler>>();
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const pfad = (req.url ?? "").split("?")[0] ?? "";
    const ziel = ENDPUNKTE[pfad];
    if (!ziel) return next();
    if (!handler.has(pfad))
      handler.set(
        pfad,
        import(/* @vite-ignore */ new URL(ziel.datei, import.meta.url).href).then((m) =>
          (m as ServerModule).createHandler({ env: { [ziel.testmodus]: "1" } }),
        ),
      );
    void (async () => {
      const antwort = res as ServerResponse & {
        status(code: number): unknown;
        json(body: unknown): unknown;
      };
      antwort.status = (code: number) => {
        antwort.statusCode = code;
        return antwort;
      };
      antwort.json = (body: unknown) => {
        antwort.setHeader("Content-Type", "application/json; charset=utf-8");
        antwort.end(JSON.stringify(body));
        return antwort;
      };
      try {
        const body = await koerperLesen(req);
        await (await handler.get(pfad)!)(Object.assign(req, { body }), antwort);
      } catch (e) {
        antwort.statusCode = 500;
        antwort.end(JSON.stringify({ ok: false, fehler: "dev", detail: String(e) }));
      }
    })();
  };
  return {
    name: "brand-studio-dev-endpunkte",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// Gesicherte Fassung: relative Pfade ("./"), Worker als ES-Module, Schriften aus public/fonts.
export default defineConfig({
  base: "./",
  plugins: [react(), devEndpunkte()],
  worker: { format: "es" },
  build: { target: "es2022", sourcemap: true },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
