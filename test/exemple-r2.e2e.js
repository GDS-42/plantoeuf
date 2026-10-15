// Tranche R2 — la ferme d'exemple du Sud de La Réunion (T51 : EX-51 à EX-54), dans le navigateur.
const { test, expect } = require("@playwright/test");
const { aller } = require("./outils.js");

async function exemple(page) {
  await page.clock.setFixedTime(new Date("2026-05-20T10:00:00+04:00"));
  await page.goto("index.html");
  await expect(page.locator("#proposition-exemple")).toContainText("Petite-Île");
  await expect(page.locator("#proposition-exemple")).toContainText("toute l'année");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#bandeau-exemple")).toBeVisible();
}

test("[T51] EX-51, EX-52 : la ferme d'exemple montre une saison de janvier à décembre et le revenu après les charges fixes", async ({ page }) => {
  await exemple(page);
  await aller(page, "synthese");
  const mois = page.locator("#tableau thead th[data-mois]:not(.col-total)");
  await expect(mois.first()).toHaveAttribute("data-mois", "2026-01");
  await expect(mois.last()).toHaveAttribute("data-mois", "2026-12");
  await expect(page.locator('#tuiles .tuile[data-chiffre="revenu"]')).toBeVisible();
  await expect(page.locator('#tableau tfoot tr[data-mesure="charges"]')).toBeVisible();
  await expect(page.locator('#tableau tfoot tr[data-mesure="revenu"]')).toBeVisible();
  await aller(page, "charges");
  expect(await page.locator("#liste-charges li").count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator("#liste-charges")).toContainText(/cotisations/i);
});

test("[T51] EX-53 : les œufs ont leurs débouchés, au marché et en paniers, et la matrice compare ponte et demande", async ({ page }) => {
  await exemple(page);
  await aller(page, "ventes");
  const oeufs = page.locator("#liste-debouches li", { hasText: /œufs/i });
  expect(await oeufs.count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator("#liste-debouches li", { hasText: /œufs/i }).filter({ hasText: /épicerie/i })).toHaveCount(0);
  await aller(page, "synthese");
  await page.locator("#onglet-offre").click();
  await expect(page.locator('#matrice tr[data-produit="oeufs"][data-mesure="offre"] td[data-etat="sans_debouche"]')).toHaveCount(0);
  await expect(page.locator('#matrice tr[data-produit="oeufs"][data-mesure="offre"] td .ecart').first()).toBeVisible();
});

test("[T51] EX-54 : effacer la ferme d'exemple retire aussi ses charges fixes", async ({ page }) => {
  await exemple(page);
  await page.locator("#effacer-exemple").click();
  await aller(page, "charges");
  await expect(page.locator("#liste-charges li")).toHaveCount(0);
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("charges").length)).toBe(0);
});
