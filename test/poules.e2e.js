// Tranche S3 — poules pondeuses, dans le navigateur.
const { test, expect } = require("@playwright/test");

const CHAMPS_LOT = {
  nom: "Lot 1", effectif: 100, arrivee: "2026-03-30", debutPonte: "2026-04-06", reforme: "2026-05-10",
  ponte: { basse: 0.8, mediane: 0.8, haute: 0.8 }, pertes: 5, aliment: { basse: 120, mediane: 120, haute: 120 },
  prixAliment: { basse: 0.6, mediane: 0.6, haute: 0.6 }, prixOeuf: { basse: 0.4, mediane: 0.4, haute: 0.4 },
};

// ---- T26 : le modèle dans le navigateur (EX-25)

test("[T26] un lot enregistré dans le navigateur est retrouvé après réouverture de la page, et part dans l'export", async ({ page }) => {
  await page.goto("index.html");
  await page.evaluate((champs) => Store.ouvrir(localStorage).ajouter("lots", champs), CHAMPS_LOT);
  await page.reload();
  const fichier = await page.evaluate(() => Store.ouvrir(localStorage).exporter());
  expect(fichier.version).toBe(await page.evaluate(() => Store.VERSION));
  expect(fichier.lots).toHaveLength(1);
  expect(fichier.lots[0].nom).toBe("Lot 1");
});
