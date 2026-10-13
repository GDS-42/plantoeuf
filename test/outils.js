// Aides de saisie partagées par les tests de bout en bout à partir de T05.
// Ce fichier n'est pas un test : Playwright ne lit que *.e2e.js, Node que *.test.js.

// Choisit dans une liste déroulante l'option dont le texte contient `texte`.
async function choisir(page, select, texte) {
  const valeur = await page.locator(`${select} option`, { hasText: texte }).first().getAttribute("value");
  await page.locator(select).selectOption(valeur);
}

async function ajouterEspace(page, { nom, surface, type = "plein_champ" }) {
  await page.locator("#espace-nom").fill(nom);
  await page.locator("#espace-surface").fill(String(surface));
  await page.locator("#espace-type").selectOption(type);
  await page.locator("#espace-ajouter").click();
}

async function ajouterCulture(page, c) {
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
  await page.locator("#variete-nom").fill(nom);
  await choisir(page, "#variete-cultureId", culture);
  await page.locator("#variete-ajouter").click();
}

async function ajouterPlantation(page, { variete, espace, surface, date }) {
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

module.exports = { choisir, ajouterEspace, ajouterCulture, ajouterVariete, ajouterPlantation, saisirS2, caseDuTableau };
