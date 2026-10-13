// T31 — EX-29 : la ferme d'exemple élève un lot de poules.
const { test, expect } = require("@playwright/test");

test("[T31] la ferme d'exemple montre son lot de poules, l'atelier dans le tableau et les œufs dans la matrice", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-lots li")).toHaveCount(1);
  await expect(page.locator('#tableau tbody tr.bandeau-atelier[data-atelier="poules"]')).toBeAttached();
  await expect(page.locator('#tableau tbody tr[data-culture="oeufs"][data-mesure="volume"] th').last()).toHaveText(/œufs estimés/i);
  await expect(page.locator('#tableau tfoot tr[data-mesure="aliment"]')).toBeAttached();
  await page.locator("#onglet-offre").click();
  await expect(page.locator('#matrice tr[data-produit="oeufs"][data-mesure="offre"]')).toBeVisible();
});

test("[T31] effacer la ferme d'exemple efface aussi son lot de poules", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await page.locator("#effacer-exemple").click();
  await expect(page.locator("#liste-lots li")).toHaveCount(0);
  await expect(page.locator("#proposition-exemple")).toBeVisible();
});

test("[T31] dans la matrice, les œufs se comptent en nombres entiers et la première colonne les nomme", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await page.locator("#onglet-offre").click();
  const cases = page.locator('#matrice tr[data-produit="oeufs"] td .mediane');
  await expect(cases.first()).toBeVisible();
  for (const texte of await cases.allTextContents()) expect(texte).toMatch(/^(—|[\d\s]+)$/);
  await expect(page.locator("#matrice thead th").first()).toHaveText(/culture ou œufs/i);
});
