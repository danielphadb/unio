// Gemeinsame Helfer der E2E-Tests: feste Einstellungen wie in der Vorschau-App,
// fester Zufall und feste Uhr, damit Namen und Logos bei jedem Lauf gleich sind.
import type { Page } from "@playwright/test";

export const EINSTELLUNGEN = { kiFunktionen: false, intern: true, signatureEntwuerfe: true };

export async function vorbereiten(page: Page): Promise<void> {
  await page.addInitScript((preset) => {
    try {
      localStorage.setItem("unio-brand:einstellungen", JSON.stringify(preset));
    } catch {
      // ohne Speicher laeuft die App trotzdem
    }
    Math.random = () => 0.4321;
    const fest = 1795000000000;
    const Echt = Date;
    class FestesDatum extends Echt {
      constructor(...a: unknown[]) {
        super(...((a.length ? a : [fest]) as [number]));
      }
      static override now() {
        return fest;
      }
    }
    (window as unknown as { Date: DateConstructor }).Date = FestesDatum as DateConstructor;
  }, EINSTELLUNGEN);
}

/** Knopf, der gerade sichtbar ist (Handy und Desktop haben teils eigene Knoepfe). */
export function sichtbar(page: Page, name: RegExp) {
  return page.getByRole("button", { name }).filter({ visible: true }).first();
}
