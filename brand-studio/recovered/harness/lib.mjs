// Gemeinsame Helfer fuer den Harness: kleiner statischer Server und Playwright-Seite.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

export const here = dirname(fileURLToPath(import.meta.url));
export const studioRoot = join(here, "..", "..");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".png": "image/png",
};

export function startServer(root) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
        if (p.endsWith("/")) p += "index.html";
        const file = normalize(join(root, p));
        if (!file.startsWith(root)) throw new Error("outside");
        await stat(file);
        const body = await readFile(file);
        res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}/` });
    });
  });
}

export async function openStudio({
  root = join(here, "instrumented"),
  timezone = "Europe/Vienna",
  fixedTime = null,
} = {}) {
  const { server, url } = await startServer(root);
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const context = await browser.newContext({ locale: "de-AT", timezoneId: timezone, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  if (fixedTime) await page.clock.setFixedTime(new Date(fixedTime));
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(300);
  return {
    page,
    url,
    errors,
    async close() {
      await browser.close();
      server.close();
    },
  };
}
