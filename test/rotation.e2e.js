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

test("[T60] EX-62 à EX-65 : le fichier livré calcule les retours trop tôt, les précédents, les voisins et les suggestions", async ({ page }) => {
  await page.goto("index.html");
  const r = await page.evaluate(() => {
    const f = (b, m = b, h = m) => ({ basse: b, mediane: m, haute: h });
    const d = {
      espaces: [{ id: "e", nom: "planche", surface: 30 }],
      cultures: [{ id: "t", nom: "tomate", famille: "Solanacées", groupe: "fruit", unite: "kg", rendement: f(3), prix: f(2), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 10 },
        { id: "l", nom: "laitue", famille: "Astéracées", groupe: "feuille", unite: "piece", rendement: f(9), prix: f(1), joursAvantRecolte: 42, semainesRecolte: 2, pertes: 20 }],
      varietes: [{ id: "vt", cultureId: "t", nom: "Heatmaster" }, { id: "vl", cultureId: "l", nom: "Goldorac" }],
      familles: [{ id: "fs", nom: "Solanacées", delaiRetour: f(3) }],
      rotations: [{ id: "r", nom: "Exigence", groupes: ["fruit", "feuille"] }],
      plantations: [{ id: "p1", varieteId: "vt", espaceId: "e", surface: 30, date: "2026-02-04" }, { id: "p2", varieteId: "vt", espaceId: "e", surface: 30, date: "2027-02-04" }],
    };
    return {
      trop: Object.keys(Calc.retoursTropTot(d)),
      precedents: Calc.precedents(d, { varieteId: "vl", espaceId: "e", surface: 30, date: "2026-07-01" }).precedents.map((p) => p.culture),
      suggestions: Calc.suggestions(d, { espaceId: "e", date: "2026-07-01" }).map((s) => s.culture),
    };
  });
  expect(r.trop).toEqual(["p2"]);
  expect(r.precedents).toEqual(["tomate"]);
  expect(r.suggestions).toEqual(["laitue", "tomate"]);
});
