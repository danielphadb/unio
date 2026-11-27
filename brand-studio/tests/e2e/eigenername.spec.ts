import { expect, test } from "@playwright/test";
import { vorbereiten } from "./helpers";

test.beforeEach(async ({ page }) => {
  await vorbereiten(page);
});

test("Eigener Name: Stilwahl, Galerie, Namen auf die Probe stellen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Ich habe schon einen Namen/ }).click();
  await expect(page).toHaveURL(/#\/neu\/name/);
  await page.locator("input").first().fill("Berger Immobilien");
  await page.getByRole("button", { name: /weiter|stil|logos/i }).filter({ visible: true }).last().click();
  await expect(page).toHaveURL(/#\/p\/[a-z0-9]+\/stil/);
  await expect(page.getByRole("heading", { name: "Welche Wirkung passt zu dir?" })).toBeVisible();
  await page.getByRole("button", { name: /Natürlich/ }).first().click();
  await expect(page.getByRole("heading", { name: "Deine Logos" })).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".logo-svg svg").first()).toBeVisible({ timeout: 30000 });
  await page.getByText("Namen auf die Probe stellen").first().click();
  await expect(page.locator(".name-probe")).toBeVisible();
});

test("Projekt erscheint unter Deine Marken", async ({ page }) => {
  await page.goto("/#/neu/name");
  await page.locator("input").first().fill("Seeblick Realitäten");
  await page.getByRole("button", { name: /weiter|stil|logos/i }).filter({ visible: true }).last().click();
  await expect(page).toHaveURL(/#\/p\/[a-z0-9]+\/stil/);
  await page.waitForTimeout(1500);
  await page.goto("/#/");
  await expect(page.getByText(/Seeblick/).first()).toBeVisible({ timeout: 15000 });
});
