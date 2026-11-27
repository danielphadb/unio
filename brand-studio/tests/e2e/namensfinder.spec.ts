import { expect, test } from "@playwright/test";
import { sichtbar, vorbereiten } from "./helpers";

test.beforeEach(async ({ page }) => {
  await vorbereiten(page);
});

test("Start ist der Namensfinder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Finde deinen Markennamen." })).toBeVisible();
  await expect(page.getByLabel("Dein Name")).toBeVisible();
  await expect(page.getByRole("link", { name: /Ich habe schon einen Namen/ })).toBeVisible();
  await expect(page.getByText("Markenkompass:")).toBeVisible();
});

test("Namen vorschlagen, Detail, Logos fuer diesen Namen", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Dein Name").fill("Anna Berger");
  await page.getByLabel("Region").fill("Döbling");
  await page.getByLabel("Stichworte").fill("Altbau, Familie");
  await sichtbar(page, /vorschlagen/i).click();
  const karten = page.locator(".name-card");
  await expect(karten.first()).toBeVisible({ timeout: 30000 });
  expect(await karten.count()).toBeGreaterThanOrEqual(6);
  // jede Karte zeigt ein fertiges Logo
  await expect(karten.first().locator(".logo-svg svg")).toBeVisible({ timeout: 30000 });
  await karten.first().click();
  await expect(page).toHaveURL(/#\/neu\/namen\?.*name=/);
  await page.getByRole("button", { name: /Logos für diesen Namen/ }).first().click();
  await expect(page.getByRole("heading", { name: "Deine Logos" })).toBeVisible({ timeout: 30000 });
  await expect(page).toHaveURL(/#\/p\/[a-z0-9]+\/auswahl/);
  await expect(page.locator(".logo-svg svg").first()).toBeVisible({ timeout: 30000 });
});

test("Eingabe bleibt nach dem Neuladen erhalten", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Region").fill("Graz");
  await page.waitForTimeout(800);
  await page.reload();
  await expect(page.getByLabel("Region")).toHaveValue("Graz");
});
