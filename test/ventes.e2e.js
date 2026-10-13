// Tranche N2 — points de vente, séances et débouchés, dans le fichier ouvert.
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");

test("[T18] dans le fichier ouvert, points de vente, séances et débouchés sont enregistrés, retrouvés et exportés", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    const marche = ferme.ajouter("pointsVente", { nom: "marché de Saint-Paul", distanceKm: 12, coutKm: Store.fourchette(0.4) });
    ferme.ajouter("seances", { pointVenteId: marche.id, jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: Store.fourchette(15) });
    ferme.ajouter("debouches", { pointVenteId: marche.id, produitId: "c1", prix: Store.fourchette(2.5), volumeParSeance: Store.fourchette(20) });
  });
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  const [telechargement] = await Promise.all([reouverte.waitForEvent("download"), reouverte.locator("#exporter").click()]);
  const fichier = JSON.parse(fs.readFileSync(await telechargement.path(), "utf8"));
  expect(fichier.pointsVente.map((p) => p.nom)).toEqual(["marché de Saint-Paul"]);
  expect(fichier.seances).toHaveLength(1);
  expect(fichier.debouches).toHaveLength(1);
});
