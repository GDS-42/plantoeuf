// T04 — EX-02 : les dates de récolte calculées s'affichent avec la plantation saisie.
const { test, expect } = require("@playwright/test");
// P2 : chaque formulaire s'ouvre dans un tiroir, depuis la page de sa liste (EX-31).
const { ouvrir } = require("./outils.js");

async function choisir(page, select, texte) {
  const valeur = await page.locator(`${select} option`, { hasText: texte }).first().getAttribute("value");
  await page.locator(select).selectOption(valeur);
}

test("[T04] une plantation saisie affiche ses dates de première et de dernière récolte", async ({ page }) => {
  await page.goto("index.html");
  await ouvrir(page, "espaces");
  await page.locator("#espace-nom").fill("planche 1");
  await page.locator("#espace-surface").fill("100");
  await page.locator("#espace-ajouter").click();

  await ouvrir(page, "cultures");
  await page.locator("#culture-nom").fill("courgette");
  await page.locator("#culture-unite").selectOption("kg");
  await page.locator("#culture-rendement").fill("3");
  await page.locator("#culture-prix").fill("2 / 2,5 / 3");
  await page.locator("#culture-joursAvantRecolte").fill("60");
  await page.locator("#culture-semainesRecolte").fill("8");
  await page.locator("#culture-pertes").fill("10");
  await page.locator("#culture-ajouter").click();

  await ouvrir(page, "varietes");
  await page.locator("#variete-nom").fill("Black Beauty");
  await choisir(page, "#variete-cultureId", "courgette");
  await page.locator("#variete-ajouter").click();

  await ouvrir(page, "plantations");
  await choisir(page, "#plantation-varieteId", "Black Beauty");
  await choisir(page, "#plantation-espaceId", "planche 1");
  await page.locator("#plantation-surface").fill("100");
  await page.locator("#plantation-date").fill("2026-03-01");
  await page.locator("#plantation-ajouter").click();

  const ligne = page.locator("#liste-plantations li", { hasText: "Black Beauty" });
  await expect(ligne).toContainText("30/04/2026");
  await expect(ligne).toContainText("24/06/2026");
});
