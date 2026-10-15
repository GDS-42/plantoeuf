// Tranche N3 — ferme d'exemple : une fourgonnette qui va à ses points de vente (T48 : EX-50).
const { test, expect } = require("@playwright/test");
const { aller } = require("./outils.js");

async function exemple(page) {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#bandeau-exemple")).toBeVisible();
}

test("[T48] EX-50 : la ferme d'exemple a une fourgonnette qui va à ses quatre points de vente, avec son bilan de saison", async ({ page }) => {
  await exemple(page);
  await aller(page, "ventes");
  const camionnette = page.locator("#liste-vehicules li", { hasText: "Fourgonnette" });
  await expect(camionnette).toHaveCount(1);
  expect(Number((await camionnette.locator('[data-fait="km"]').innerText()).replace(/\D/g, ""))).toBeGreaterThan(0);
  await expect(camionnette.locator('[data-fait="entretien"]')).toBeVisible();
  await expect(page.locator("#liste-pointsVente li")).toHaveCount(4);
  for (const point of await page.locator("#liste-pointsVente li").all()) await expect(point).toContainText("En Fourgonnette");
});

test("[T48] EX-50 : effacer la ferme d'exemple efface aussi sa fourgonnette", async ({ page }) => {
  await exemple(page);
  await page.locator("#effacer-exemple").click();
  await aller(page, "ventes");
  await expect(page.locator("#liste-vehicules li")).toHaveCount(0);
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("vehicules").length)).toBe(0);
});

test("[T48] EX-50 : les cultures de la ferme d'exemple ont des coûts de mise en place, déduits de la marge et listés en semences et plants à prévoir", async ({ page }) => {
  await exemple(page);
  const sansCout = await page.evaluate(() => Store.ouvrir(localStorage).lister("cultures").filter((c) => !(c.densite > 0 && c.prixUnite && c.intrants)).map((c) => c.nom));
  expect(sansCout).toEqual([]);
  await aller(page, "synthese");
  await expect(page.locator('#tableau tfoot tr[data-mesure="cultures"] td[data-mois="total"]')).toBeVisible();
  await expect(page.locator('#tuiles .tuile[data-chiffre="couts"] [data-cout="cultures"]')).toBeVisible();
  await aller(page, "plantations");
  await expect(page.locator("#section-besoins")).toBeVisible();
  expect(await page.locator("#section-besoins .besoins-mois li").count()).toBe(51);
});
