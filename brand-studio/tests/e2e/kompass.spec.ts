import { expect, test } from "@playwright/test";
import { vorbereiten } from "./helpers";

test.beforeEach(async ({ page }) => {
  await vorbereiten(page);
});

test("Markenkompass in sechs Schritten zu drei Richtungen", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Markenkompass").first().click();
  await expect(page).toHaveURL(/#\/kompass/);
  const weiter = () => page.getByRole("button", { name: /^Weiter/ }).filter({ visible: true }).first();
  const waehlen = () => page.locator(".kp-card, .kp-opt, .kp-pair button").filter({ visible: true }).first().click();
  for (let schritt = 1; schritt <= 5; schritt++) {
    await expect(page.getByText(new RegExp(`Schritt ${schritt} von 6`, "i"))).toBeVisible();
    await waehlen();
    await weiter().click();
  }
  await expect(page.getByText(/Schritt 6 von 6/i)).toBeVisible();
  await page.getByRole("button", { name: /Routen|Richtungen/ }).filter({ visible: true }).last().click();
  await expect(page).toHaveURL(/#\/kompass\/routen/);
  await expect(page.getByRole("heading", { name: /Drei Richtungen/ })).toBeVisible();
  await expect(page.getByText(/RICHTUNG A/)).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/RICHTUNG B/)).toBeVisible();
  await expect(page.getByText(/RICHTUNG C/)).toBeVisible();
});

test("Direkt zu den Richtungen", async ({ page }) => {
  await page.goto("/#/kompass");
  await page.getByRole("button", { name: /Direkt zu den Richtungen/ }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/#\/kompass\/routen/);
  await expect(page.getByText(/RICHTUNG A/)).toBeVisible({ timeout: 30000 });
});
