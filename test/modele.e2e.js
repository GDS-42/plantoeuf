// T02 — modèle de données, dans le fichier ouvert en file:// (contexte où crypto doit fonctionner).
const { test, expect } = require("@playwright/test");
// P2 : le formulaire d'un espace s'ouvre dans un tiroir, depuis la page Espaces (EX-31).
const { ouvrir } = require("./outils.js");

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("[T02] dans le fichier ouvert, un espace enregistré porte un UUID, ses dates et supprimeLe nul", async ({ page }) => {
  await page.goto("index.html");
  await ouvrir(page, "espaces");
  await page.locator("#espace-nom").fill("planche 1");
  await page.locator("#espace-surface").fill("30");
  await page.locator("#espace-ajouter").click();
  await expect(page.locator("#liste-espaces")).toContainText("planche 1");

  const donnees = await page.evaluate(() => JSON.parse(localStorage.getItem("plantoeuf")));
  expect(donnees.espaces).toHaveLength(1);
  const [espace] = donnees.espaces;
  expect(espace.id).toMatch(UUID_V4);
  expect(Number.isNaN(Date.parse(espace.creeLe))).toBe(false);
  expect(espace.modifieLe).toBe(espace.creeLe);
  expect(espace.supprimeLe).toBeNull();
});
