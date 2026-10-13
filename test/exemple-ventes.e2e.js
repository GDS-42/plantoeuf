// T24 — EX-24 : la ferme d'exemple vend sur des points de vente réunionnais.
const { test, expect } = require("@playwright/test");
const { aller } = require("./outils.js");

test("[T24] la ferme d'exemple remplit les points de vente, les séances, les débouchés et les deux vues de vente", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();

  await aller(page, "ventes");
  await expect(page.locator("#liste-pointsVente li").first()).toBeVisible();
  expect(await page.locator("#liste-pointsVente li").count()).toBeGreaterThanOrEqual(2);
  expect(await page.locator("#liste-seances li").count()).toBeGreaterThanOrEqual(2);
  expect(await page.locator("#liste-debouches li").count()).toBeGreaterThanOrEqual(2);
  await aller(page, "synthese");
  await expect(page.locator('#tableau tfoot tr[data-mesure="couts"]')).toBeVisible();

  await page.locator("#onglet-offre").click();
  await expect(page.locator('#matrice td[data-etat="depasse"]').first()).toBeVisible();
  await expect(page.locator('#matrice td[data-etat="manque"]').first()).toBeVisible();

  await page.locator("#onglet-points").click();
  const points = await page.locator("#liste-pointsVente li").count();
  await expect(page.locator('#points tbody tr[data-mesure="resultat"]')).toHaveCount(points);
});

test("[T24] effacer la ferme d'exemple vide aussi les panneaux de vente, et l'exemple est proposé de nouveau", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await page.locator("#effacer-exemple").click();
  for (const objet of ["pointsVente", "seances", "debouches"]) await expect(page.locator(`#liste-${objet} li`)).toHaveCount(0);
  await expect(page.locator("#proposition-exemple")).toBeVisible();
  await page.locator("#onglet-points").click();
  await expect(page.locator("#points-vide")).toBeVisible();
  await expect(page.locator("#points")).toBeHidden();
});
