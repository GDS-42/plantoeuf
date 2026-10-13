// Tranche P1 — présentation. Tests de bout en bout sur dist/index.html ouvert en file://.
const { test, expect } = require("@playwright/test");

// Relève les erreurs de la page : exceptions non rattrapées et messages d'erreur de la console.
function releverErreurs(page) {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(message.text());
  });
  return erreurs;
}

test("[T11] le rendu est découpé en modules, et l'outil s'utilise sans aucune erreur", async ({ page }) => {
  const erreurs = releverErreurs(page);
  await page.goto("index.html");

  const modules = await page.evaluate(() => ["UiCommun", "UiSaisie", "UiTableau", "UiSauvegarde"].map((nom) => typeof globalThis[nom]));
  expect(modules).toEqual(["object", "object", "object", "object"]);

  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
  await page.locator("#liste-plantations li", { hasText: "Courgette" }).locator('[data-action="modifier"]').click();
  await page.locator("#plantation-surface").fill("20");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#liste-plantations li", { hasText: "Courgette" })).toContainText("20 m²");
  await Promise.all([page.waitForEvent("download"), page.locator("#exporter").click()]);
  await page.locator("#effacer-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(0);

  expect(erreurs).toEqual([]);
});
