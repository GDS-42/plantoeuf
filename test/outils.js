// Aides de saisie partagées par les tests de bout en bout à partir de T05.
// Ce fichier n'est pas un test : Playwright ne lit que *.e2e.js, Node que *.test.js.
const { expect } = require("@playwright/test");

// P2 (EX-30, EX-31) : une page à la fois, choisie dans la navigation ; le formulaire d'un objet
// s'ouvre dans un tiroir, par le bouton « Ajouter » de sa liste ou par « Modifier » sur une ligne.
const PAGE_DE = {
  espaces: "espaces", cultures: "cultures", varietes: "cultures", plantations: "plantations",
  pointsVente: "ventes", seances: "ventes", debouches: "ventes", lots: "poules",
};

async function aller(page, nom) {
  await page.locator(`#navigation a[data-page="${nom}"]`).click();
  await expect(page.locator(`#page-${nom}`)).toBeVisible();
}

async function ouvrir(page, objet) {
  await aller(page, PAGE_DE[objet]);
  // Le bouton « Ajouter » visible : en tête de la liste, ou dans son état vide quand elle est vide (EX-36).
  await page.locator(`#section-${objet} [data-ouvrir="${objet}"]`).filter({ visible: true }).click();
  await expect(page.locator(`#tiroir-${objet}`)).toBeVisible();
}

// Ouvre le tiroir de modification de la ligne de `objet` qui contient `texte`.
async function modifier(page, objet, texte) {
  await aller(page, PAGE_DE[objet]);
  await page.locator(`#liste-${objet} li`, { hasText: texte }).locator('[data-action="modifier"]').click();
  await expect(page.locator(`#tiroir-${objet}`)).toBeVisible();
}

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
  await page.locator("#culture-famille").fill(c.famille || "");
  await page.locator("#culture-unite").selectOption(c.unite);
  await page.locator("#culture-rendement").fill(c.rendement);
  await page.locator("#culture-prix").fill(c.prix);
  await page.locator("#culture-joursAvantRecolte").fill(String(c.joursAvantRecolte));
  await page.locator("#culture-semainesRecolte").fill(String(c.semainesRecolte));
  await page.locator("#culture-pertes").fill(String(c.pertes));
  await page.locator("#culture-ajouter").click();
}

async function ajouterVariete(page, { nom, culture }) {
  await ouvrir(page, "varietes");
  await page.locator("#variete-nom").fill(nom);
  await choisir(page, "#variete-cultureId", culture);
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

// Scénarios S1 et S2 : courgette à 3 kg/m², 10 % de pertes, 60 jours, 8 semaines, 2 / 2,5 / 3 € le kg ;
// plantation de 100 m² le 1er mars 2026.
async function saisirS2(page) {
  await ajouterEspace(page, { nom: "planche 1", surface: 100 });
  await ajouterCulture(page, {
    nom: "courgette", famille: "Cucurbitacées", unite: "kg", rendement: "3", prix: "2 / 2,5 / 3",
    joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
  });
  await ajouterVariete(page, { nom: "Black Beauty", culture: "courgette" });
  await ajouterPlantation(page, { variete: "Black Beauty", espace: "planche 1", surface: 100, date: "2026-03-01" });
}

// Les trois valeurs (data-valeur) d'une case du tableau.
async function caseDuTableau(page, culture, mesure, mois) {
  const ligneVolume = page.locator('#tableau tbody tr[data-mesure="volume"]', { hasText: culture });
  const cultureId = await ligneVolume.getAttribute("data-culture");
  const cellule = page.locator(`#tableau tr[data-culture="${cultureId}"][data-mesure="${mesure}"] td[data-mois="${mois}"]`);
  const valeur = async (niveau) => Number(await cellule.locator(`.${niveau}`).getAttribute("data-valeur"));
  return { cellule, basse: await valeur("basse"), mediane: await valeur("mediane"), haute: await valeur("haute") };
}

module.exports = { PAGE_DE, aller, ouvrir, modifier, choisir, ajouterEspace, ajouterCulture, ajouterVariete, ajouterPlantation, saisirS2, caseDuTableau };
