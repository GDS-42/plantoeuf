// T07 — EX-06, scénario S3 : un espace sur-occupé est signalé, sans bloquer la saisie.
const { test, expect } = require("@playwright/test");
const { ajouterEspace, ajouterCulture, ajouterVariete, ajouterPlantation } = require("./outils.js");

async function saisirS3(page) {
  await ajouterEspace(page, { nom: "planche 4", surface: 30 });
  await ajouterEspace(page, { nom: "planche 5", surface: 30 });
  await ajouterCulture(page, {
    nom: "salade", famille: "Astéracées", unite: "piece", rendement: "10", prix: "1",
    joursAvantRecolte: 30, semainesRecolte: 4, pertes: 0,
  });
  await ajouterVariete(page, { nom: "Batavia", culture: "salade" });
  await ajouterPlantation(page, { variete: "Batavia", espace: "planche 4", surface: 20, date: "2026-05-01" });
  await ajouterPlantation(page, { variete: "Batavia", espace: "planche 4", surface: 20, date: "2026-06-01" });
  await ajouterPlantation(page, { variete: "Batavia", espace: "planche 5", surface: 20, date: "2026-06-01" });
}

test("[T07] S3 : « planche 4 » porte un signal de sur-occupation pour juin, et les deux plantations restent enregistrées", async ({ page }) => {
  await page.goto("index.html");
  await saisirS3(page);

  const signal = page.locator("#liste-espaces li", { hasText: "planche 4" }).locator(".sur-occupation");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("juin 2026");
  await expect(signal).toContainText("40");
  await expect(page.locator("#liste-espaces li", { hasText: "planche 5" }).locator(".sur-occupation")).toHaveCount(0);

  await expect(page.locator("#liste-plantations li", { hasText: "planche 4" })).toHaveCount(2);
  const plantations = await page.evaluate(() => JSON.parse(localStorage.getItem("plantoeuf")).plantations);
  expect(plantations.filter((p) => !p.supprimeLe)).toHaveLength(3);
});

test("[T07] le signal disparaît dès que la sur-occupation est corrigée", async ({ page }) => {
  await page.goto("index.html");
  await saisirS3(page);
  await expect(page.locator("#liste-espaces li", { hasText: "planche 4" }).locator(".sur-occupation")).toBeVisible();

  await page.locator("#liste-plantations li", { hasText: "planche 4" }).last().locator('[data-action="modifier"]').click();
  await page.locator("#plantation-surface").fill("10");
  await page.locator("#plantation-ajouter").click();

  await expect(page.locator("#liste-espaces li", { hasText: "planche 4" }).locator(".sur-occupation")).toHaveCount(0);
});
