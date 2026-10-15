// Tranche R4 — rotation et associations, dans le navigateur (T59 : modèle version 6).
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");
const { aller } = require("./outils.js");

test("[T59] EX-61 : le fichier livré exporte les familles, associations et rotations en version 6 et importe un fichier de version 5", async ({ page }) => {
  await page.goto("index.html");
  await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    ferme.ajouter("familles", { nom: "Solanacées", delaiRetour: F(3, 4, 5) });
    const c = ferme.ajouter("cultures", { nom: "tomate", famille: "Solanacées", groupe: "fruit", unite: "kg", rendement: F(12), prix: F(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 });
    ferme.ajouter("associations", { type: "voisinage", cultureA: c.id, cultureB: c.id + "-autre", effet: "favorable" });
    ferme.ajouter("rotations", { nom: "Exigence décroissante", groupes: ["fruit", "feuille", "racine"] });
  });
  await page.reload();
  await aller(page, "sauvegarde");
  const [telechargement] = await Promise.all([page.waitForEvent("download"), page.locator("#exporter").click()]);
  const fichier = JSON.parse(fs.readFileSync(await telechargement.path(), "utf8"));
  expect(fichier.version).toBe(6);
  expect(fichier.familles.map((x) => x.nom)).toEqual(["Solanacées"]);
  expect(fichier.associations).toHaveLength(1);
  expect(fichier.rotations[0].groupes).toEqual(["fruit", "feuille", "racine"]);
  expect(fichier.cultures[0].groupe).toBe("fruit");

  // Un fichier de version 5 (sans les trois listes) s'importe.
  const ancien = { ...fichier, version: 5 };
  for (const objet of ["familles", "associations", "rotations"]) delete ancien[objet];
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await aller(page, "sauvegarde");
  await page.locator("#importer").setInputFiles({ name: "ancien.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(ancien)) });
  await expect(page.locator("#import-message")).toBeVisible();
  const relu = await page.evaluate(() => { const f = Store.ouvrir(localStorage); return { cultures: f.lister("cultures").length, familles: f.lister("familles").length }; });
  expect(relu).toEqual({ cultures: 1, familles: 0 });
});
