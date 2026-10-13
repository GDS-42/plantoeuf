// T08 — EX-07 : « Exporter » produit un fichier JSON que « Importer » restaure à l'identique.
// EX-08 : rappel d'export à l'ouverture après 7 jours de modifications non exportées.
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");
const { ajouterEspace, saisirS2, caseDuTableau } = require("./outils.js");

async function exporter(page, bouton = "#exporter") {
  const [telechargement] = await Promise.all([page.waitForEvent("download"), page.locator(bouton).click()]);
  return { nom: telechargement.suggestedFilename(), texte: fs.readFileSync(await telechargement.path(), "utf8") };
}

function sansDate(texte) {
  const { exporteLe, ...reste } = JSON.parse(texte);
  return reste;
}

test("[T08] EX-07 : Exporter produit un fichier JSON que Importer restaure à l'identique, y compris les supprimés", async ({ browser }) => {
  const source = await browser.newPage();
  await source.goto("index.html");
  await saisirS2(source);
  await ajouterEspace(source, { nom: "planche abandonnée", surface: 12 });
  await source.locator("#liste-espaces li", { hasText: "planche abandonnée" }).locator('[data-action="supprimer"]').click();
  const export1 = await exporter(source);
  expect(export1.nom).toMatch(/^plantoeuf-\d{4}-\d{2}-\d{2}\.json$/);
  const fichier = JSON.parse(export1.texte);
  expect(fichier.application).toBe("plantoeuf");
  expect(fichier.version).toBe(2);
  expect(fichier.espaces.find((e) => e.nom === "planche abandonnée").supprimeLe).not.toBeNull();

  // Un autre navigateur, vide : l'import y restaure la même ferme.
  const cible = await browser.newPage();
  await cible.goto("index.html");
  await cible.locator("#importer").setInputFiles({ name: export1.nom, mimeType: "application/json", buffer: Buffer.from(export1.texte) });
  await expect(cible.locator("#import-message")).toBeVisible();
  await expect(cible.locator("#liste-plantations")).toContainText("Black Beauty");
  await expect(cible.locator("#liste-espaces")).not.toContainText("planche abandonnée");
  expect((await caseDuTableau(cible, "courgette", "ca", "2026-05")).mediane).toBeCloseTo(421.875, 6);

  const export2 = await exporter(cible);
  expect(sansDate(export2.texte)).toEqual(sansDate(export1.texte));
});

test("[T08] l'import remplace la ferme ouverte après confirmation", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  const sauvegarde = await exporter(page);
  await ajouterEspace(page, { nom: "planche ajoutée après l'export", surface: 10 });

  page.once("dialog", (dialogue) => dialogue.accept());
  await page.locator("#importer").setInputFiles({ name: sauvegarde.nom, mimeType: "application/json", buffer: Buffer.from(sauvegarde.texte) });
  await expect(page.locator("#liste-espaces")).not.toContainText("planche ajoutée après l'export");
  await expect(page.locator("#liste-espaces")).toContainText("planche 1");
});

test("[T08] un fichier illisible est refusé avec un message, et la ferme reste intacte", async ({ page }) => {
  await page.goto("index.html");
  await ajouterEspace(page, { nom: "planche 1", surface: 30 });

  page.on("dialog", (dialogue) => dialogue.accept());
  await page.locator("#importer").setInputFiles({ name: "notes.json", mimeType: "application/json", buffer: Buffer.from("{ pas du json") });
  await expect(page.locator("#import-message")).toBeVisible();
  await expect(page.locator("#import-message")).toHaveClass(/erreur/);
  await page.locator("#importer").setInputFiles({ name: "autre.json", mimeType: "application/json", buffer: Buffer.from('{"application":"autre"}') });
  await expect(page.locator("#import-message")).toHaveClass(/erreur/);
  await expect(page.locator("#liste-espaces")).toContainText("planche 1");
});

test("[T08] EX-08 : le rappel d'export s'affiche à l'ouverture après 7 jours de modifications non exportées", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-01T10:00:00+04:00"));
  await page.goto("index.html");
  await ajouterEspace(page, { nom: "planche 1", surface: 30 });
  await expect(page.locator("#rappel-export")).toBeHidden();

  await page.clock.setFixedTime(new Date("2026-10-07T10:00:00+04:00"));
  await page.reload();
  await expect(page.locator("#liste-espaces")).toContainText("planche 1");
  await expect(page.locator("#rappel-export")).toBeHidden();

  await page.clock.setFixedTime(new Date("2026-10-08T10:00:00+04:00"));
  await page.reload();
  await expect(page.locator("#rappel-export")).toBeVisible();

  await exporter(page, "#rappel-exporter");
  await expect(page.locator("#rappel-export")).toBeHidden();
  await page.reload();
  await expect(page.locator("#rappel-export")).toBeHidden();
});
