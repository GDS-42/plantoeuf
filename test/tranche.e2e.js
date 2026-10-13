// T10 — vérification de bout en bout de la tranche N1 (SPEC, « Vérification de bout en bout ») :
// ouvrir dist/index.html, charger la ferme d'exemple, modifier une plantation et vérifier que le
// tableau change, puis exporter et réimporter.
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");
const { aller, modifier } = require("./outils.js");

async function caTotalMedian(page) {
  const valeur = await page.locator('#tableau tfoot tr[data-mesure="ca"] td[data-mois="total"] .mediane').getAttribute("data-valeur");
  return Number(valeur);
}

async function exporter(page) {
  await aller(page, "sauvegarde");
  const [telechargement] = await Promise.all([page.waitForEvent("download"), page.locator("#exporter").click()]);
  return fs.readFileSync(await telechargement.path(), "utf8");
}

function sansDate(texte) {
  const { exporteLe, ...reste } = JSON.parse(texte);
  return reste;
}

test("[T10] parcours de la tranche : ferme d'exemple, plantation modifiée, tableau recalculé, export puis réimport à l'identique", async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
  const avant = await caTotalMedian(page);
  expect(avant).toBeGreaterThan(0);

  const courgette = page.locator("#liste-plantations li", { hasText: "Courgette" });
  await modifier(page, "plantations", "Courgette");
  await page.locator("#plantation-surface").fill("15");
  await page.locator("#plantation-ajouter").click();
  await expect.poll(() => caTotalMedian(page)).toBeLessThan(avant);
  const apres = await caTotalMedian(page);
  await expect(courgette).toContainText("15 m²");

  const fichier = await exporter(page);

  const autre = await browser.newPage();
  await autre.goto("index.html");
  await aller(autre, "sauvegarde");
  await autre.locator("#importer").setInputFiles({ name: "plantoeuf.json", mimeType: "application/json", buffer: Buffer.from(fichier) });
  await expect(autre.locator("#liste-plantations li")).toHaveCount(10);
  await expect(autre.locator("#liste-plantations li", { hasText: "Courgette" })).toContainText("15 m²");
  expect(await caTotalMedian(autre)).toBeCloseTo(apres, 6);
  expect(sansDate(await exporter(autre))).toEqual(sansDate(fichier));
});
