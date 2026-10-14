// Tranche N3 — ferme d'exemple : une camionnette qui va à ses points de vente (T48 : EX-50).
const { test, expect } = require("@playwright/test");
const { aller } = require("./outils.js");

async function exemple(page) {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#bandeau-exemple")).toBeVisible();
}

test("[T48] EX-50 : la ferme d'exemple a une camionnette qui va à ses trois points de vente, avec son bilan de saison", async ({ page }) => {
  await exemple(page);
  await aller(page, "ventes");
  const camionnette = page.locator("#liste-vehicules li", { hasText: "Camionnette" });
  await expect(camionnette).toHaveCount(1);
  expect(Number((await camionnette.locator('[data-fait="km"]').innerText()).replace(/\D/g, ""))).toBeGreaterThan(0);
  await expect(camionnette.locator('[data-fait="entretien"]')).toBeVisible();
  await expect(page.locator("#liste-pointsVente li")).toHaveCount(3);
  for (const point of await page.locator("#liste-pointsVente li").all()) await expect(point).toContainText("En Camionnette");
});

test("[T48] EX-50 : effacer la ferme d'exemple efface aussi sa camionnette", async ({ page }) => {
  await exemple(page);
  await page.locator("#effacer-exemple").click();
  await aller(page, "ventes");
  await expect(page.locator("#liste-vehicules li")).toHaveCount(0);
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("vehicules").length)).toBe(0);
});
