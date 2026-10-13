// T03 — EX-01 : saisie, modification et suppression des espaces, cultures, variétés et plantations,
// retrouvées après fermeture et réouverture du fichier.
const { test, expect } = require("@playwright/test");
// P2 : chaque liste est sur sa page, chaque formulaire s'ouvre dans un tiroir (EX-30, EX-31).
const { aller, ouvrir, modifier } = require("./outils.js");

// Choisit dans une liste déroulante l'option dont le texte contient `texte`.
async function choisir(page, select, texte) {
  const valeur = await page.locator(`${select} option`, { hasText: texte }).first().getAttribute("value");
  await page.locator(select).selectOption(valeur);
}

async function ajouterEspace(page, { nom, surface, type = "plein_champ" }) {
  await ouvrir(page, "espaces");
  await page.locator("#espace-nom").fill(nom);
  await page.locator("#espace-surface").fill(String(surface));
  await page.locator("#espace-type").selectOption(type);
  await page.locator("#espace-ajouter").click();
}

async function ajouterCulture(page, c) {
  await ouvrir(page, "cultures");
  await page.locator("#culture-nom").fill(c.nom);
  await page.locator("#culture-famille").fill(c.famille);
  await page.locator("#culture-unite").selectOption(c.unite);
  await page.locator("#culture-rendement").fill(c.rendement);
  await page.locator("#culture-prix").fill(c.prix);
  await page.locator("#culture-joursAvantRecolte").fill(String(c.joursAvantRecolte));
  await page.locator("#culture-semainesRecolte").fill(String(c.semainesRecolte));
  await page.locator("#culture-pertes").fill(String(c.pertes));
  await page.locator("#culture-ajouter").click();
}

async function ajouterVariete(page, { nom, culture, surcharges = {} }) {
  await ouvrir(page, "varietes");
  await page.locator("#variete-nom").fill(nom);
  await choisir(page, "#variete-cultureId", culture);
  for (const [champ, valeur] of Object.entries(surcharges)) {
    await page.locator(`#variete-${champ}`).fill(String(valeur));
  }
  await page.locator("#variete-ajouter").click();
}

async function ajouterPlantation(page, { variete, espace, surface, date }) {
  await ouvrir(page, "plantations");
  await choisir(page, "#plantation-varieteId", variete);
  await choisir(page, "#plantation-espaceId", espace);
  await page.locator("#plantation-surface").fill(String(surface));
  await page.locator("#plantation-date").fill(date);
  await page.locator("#plantation-ajouter").click();
}

function ligne(page, liste, texte) {
  return page.locator(`#liste-${liste} li`, { hasText: texte });
}

const COURGETTE = {
  nom: "courgette",
  famille: "Cucurbitacées",
  unite: "kg",
  rendement: "3",
  prix: "2 / 2,5 / 3",
  joursAvantRecolte: 60,
  semainesRecolte: 8,
  pertes: 10,
};

async function saisirUneFerme(page) {
  await ajouterEspace(page, { nom: "planche 4", surface: 30 });
  await ajouterCulture(page, COURGETTE);
  await ajouterVariete(page, { nom: "Black Beauty", culture: "courgette", surcharges: { joursAvantRecolte: 55 } });
  await ajouterPlantation(page, { variete: "Black Beauty", espace: "planche 4", surface: 20, date: "2026-03-01" });
}

async function stockees(page, objet) {
  return page.evaluate((o) => JSON.parse(localStorage.getItem("plantoeuf"))[o], objet);
}

test("[T03] espaces, cultures, variétés et plantations sont saisis, listés et retrouvés après réouverture", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await saisirUneFerme(page);

  // P2 : une fourchette se lit « médiane, puis basse à haute » : 2 / 2,5 / 3 € le kg s'affiche « 2,5 €/kg 2 à 3 ».
  await aller(page, "espaces");
  await expect(ligne(page, "espaces", "planche 4")).toContainText("30");
  await aller(page, "cultures");
  await expect(ligne(page, "cultures", "courgette")).toContainText("2,5 €/kg 2 à 3");
  await expect(ligne(page, "varietes", "Black Beauty")).toContainText("courgette");
  await expect(ligne(page, "varietes", "Black Beauty")).toContainText("55");
  await aller(page, "plantations");
  await expect(ligne(page, "plantations", "Black Beauty")).toContainText("planche 4");
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await aller(reouverte, "espaces");
  await expect(ligne(reouverte, "espaces", "planche 4")).toHaveCount(1);
  await aller(reouverte, "cultures");
  await expect(ligne(reouverte, "cultures", "courgette")).toContainText("2,5 €/kg 2 à 3");
  await expect(ligne(reouverte, "varietes", "Black Beauty")).toContainText("55");
  await aller(reouverte, "plantations");
  await expect(ligne(reouverte, "plantations", "Black Beauty")).toContainText("planche 4");
  await expect(ligne(reouverte, "plantations", "Black Beauty")).toContainText("20");
});

test("[T03] une variété ne garde que les champs numériques surchargés, les autres viennent de la culture", async ({ page }) => {
  await page.goto("index.html");
  await saisirUneFerme(page);

  const [variete] = await stockees(page, "varietes");
  const [culture] = await stockees(page, "cultures");
  expect(variete.cultureId).toBe(culture.id);
  expect(variete.joursAvantRecolte).toBe(55);
  expect(variete.rendement).toBeNull();
  expect(variete.prix).toBeNull();
  expect(variete.semainesRecolte).toBeNull();
  expect(variete.pertes).toBeNull();
  expect(culture.rendement).toEqual({ basse: 3, mediane: 3, haute: 3 });
  expect(culture.prix).toEqual({ basse: 2, mediane: 2.5, haute: 3 });
});

test("[T03] une modification est enregistrée et retrouvée après réouverture", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await saisirUneFerme(page);

  await modifier(page, "espaces", "planche 4");
  await expect(page.locator("#espace-nom")).toHaveValue("planche 4");
  await page.locator("#espace-surface").fill("45");
  await page.locator("#espace-ajouter").click();
  await expect(ligne(page, "espaces", "planche 4")).toContainText("45");

  // P2 : 2,2 / 2,8 / 3,5 s'affiche « 2,8 €/kg 2,2 à 3,5 » (médiane, puis basse à haute).
  await modifier(page, "cultures", "courgette");
  await expect(page.locator("#culture-prix")).toHaveValue("2 / 2,5 / 3");
  await page.locator("#culture-prix").fill("2,2 / 2,8 / 3,5");
  await page.locator("#culture-ajouter").click();
  await expect(ligne(page, "cultures", "courgette")).toContainText("2,8 €/kg 2,2 à 3,5");

  await modifier(page, "plantations", "Black Beauty");
  await page.locator("#plantation-surface").fill("25");
  await page.locator("#plantation-ajouter").click();
  await expect(ligne(page, "plantations", "Black Beauty")).toContainText("25");
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await aller(reouverte, "espaces");
  await expect(ligne(reouverte, "espaces", "planche 4")).toContainText("45");
  await aller(reouverte, "cultures");
  await expect(ligne(reouverte, "cultures", "courgette")).toContainText("2,8 €/kg 2,2 à 3,5");
  await aller(reouverte, "plantations");
  await expect(ligne(reouverte, "plantations", "Black Beauty")).toContainText("25");
  expect(await stockees(reouverte, "espaces")).toHaveLength(1);
  expect(await stockees(reouverte, "plantations")).toHaveLength(1);
});

test("[T03] une suppression retire l'élément des listes, même après réouverture, sans l'effacer du stockage", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await saisirUneFerme(page);

  await aller(page, "plantations");
  await ligne(page, "plantations", "Black Beauty").locator('[data-action="supprimer"]').click();
  await expect(ligne(page, "plantations", "Black Beauty")).toHaveCount(0);
  await aller(page, "cultures");
  await ligne(page, "varietes", "Black Beauty").locator('[data-action="supprimer"]').click();
  await expect(ligne(page, "varietes", "Black Beauty")).toHaveCount(0);
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await aller(reouverte, "plantations");
  await expect(ligne(reouverte, "plantations", "Black Beauty")).toHaveCount(0);
  await aller(reouverte, "cultures");
  await expect(ligne(reouverte, "varietes", "Black Beauty")).toHaveCount(0);
  await expect(ligne(reouverte, "cultures", "courgette")).toHaveCount(1);

  const [plantation] = await stockees(reouverte, "plantations");
  expect(plantation.supprimeLe).not.toBeNull();
  const [variete] = await stockees(reouverte, "varietes");
  expect(variete.supprimeLe).not.toBeNull();
});

test("[T03] une fourchette désordonnée est refusée avec un message, sans rien enregistrer", async ({ page }) => {
  await page.goto("index.html");
  await ajouterCulture(page, { ...COURGETTE, prix: "3 / 2 / 4" });

  await expect(page.locator("#culture-erreur")).toBeVisible();
  await expect(page.locator("#culture-erreur")).not.toBeEmpty();
  await expect(ligne(page, "cultures", "courgette")).toHaveCount(0);
  const brut = await page.evaluate(() => localStorage.getItem("plantoeuf"));
  expect(brut === null || JSON.parse(brut).cultures.length === 0).toBe(true);
});
