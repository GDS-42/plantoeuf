// Tranche N3 — modèle et saisie des coûts (T43 : EX-45) ; charges fixes et revenu (T46 : EX-48, scénario S13).
const { test, expect } = require("@playwright/test");
const { aller, ouvrir, modifier } = require("./outils.js");

function stockes(page, objet) {
  return page.evaluate((objet) => Store.ouvrir(localStorage).lister(objet), objet);
}

function ligne(page, liste, texte) {
  return page.locator(`#liste-${liste} li`, { hasText: texte });
}

// Le bouton « Ajouter une charge fixe » visible de la page Charges fixes (en tête, ou dans l'état vide).
async function ouvrirCharges(page) {
  await aller(page, "charges");
  await page.locator('#section-charges [data-ouvrir="charges"]').filter({ visible: true }).click();
  await expect(page.locator("#tiroir-charges")).toBeVisible();
}

test("[T43] EX-45 : la page « Charges fixes » enregistre, modifie et supprime une charge, retrouvée après réouverture", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await ouvrirCharges(page);
  await page.locator("#charge-nom").fill("Assurance");
  await page.locator("#charge-montant").fill("600");
  await page.locator("#charge-periodicite").selectOption("an");
  await page.locator("#charge-ajouter").click();
  await expect(page.locator("#tiroir-charges")).toBeHidden();
  await expect(ligne(page, "charges", "Assurance")).toContainText("600");
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await aller(reouverte, "charges");
  await expect(ligne(reouverte, "charges", "Assurance")).toHaveCount(1);
  expect((await stockes(reouverte, "charges"))[0]).toMatchObject({ nom: "Assurance", montant: { basse: 600, mediane: 600, haute: 600 }, periodicite: "an" });

  await ligne(reouverte, "charges", "Assurance").locator('[data-action="modifier"]').click();
  await expect(reouverte.locator("#tiroir-charges")).toBeVisible();
  await expect(reouverte.locator("#charge-periodicite")).toHaveValue("an");
  await reouverte.locator("#charge-montant").fill("550 / 600 / 650");
  await reouverte.locator("#charge-ajouter").click();
  await expect(reouverte.locator("#tiroir-charges")).toBeHidden();
  expect((await stockes(reouverte, "charges"))[0].montant).toEqual({ basse: 550, mediane: 600, haute: 650 });

  await ligne(reouverte, "charges", "Assurance").locator('[data-action="supprimer"]').click();
  await expect(reouverte.locator("#liste-charges li")).toHaveCount(0);
  expect(await stockes(reouverte, "charges")).toEqual([]);
});

test("[T43] EX-45 : une culture reçoit ses coûts de mise en place, facultatifs, et les retrouve en modification", async ({ page }) => {
  await page.goto("index.html");
  await ouvrir(page, "cultures");
  await page.locator("#culture-nom").fill("courgette");
  await page.locator("#culture-unite").selectOption("kg");
  await page.locator("#culture-rendement").fill("3");
  await page.locator("#culture-prix").fill("2 / 2,5 / 3");
  await page.locator("#culture-joursAvantRecolte").fill("60");
  await page.locator("#culture-semainesRecolte").fill("8");
  await page.locator("#culture-pertes").fill("10");
  await page.locator("#culture-implantation").selectOption("plant");
  await page.locator("#culture-densite").fill("1");
  await page.locator("#culture-prixUnite").fill("0,3 / 0,4 / 0,5");
  await page.locator("#culture-intrants").fill("0,2");
  await page.locator("#culture-ajouter").click();
  await expect(page.locator("#tiroir-cultures")).toBeHidden();
  const [culture] = await stockes(page, "cultures");
  expect(culture).toMatchObject({ implantation: "plant", densite: 1, prixUnite: { basse: 0.3, mediane: 0.4, haute: 0.5 }, intrants: { basse: 0.2, mediane: 0.2, haute: 0.2 } });

  await modifier(page, "cultures", "courgette");
  await expect(page.locator("#culture-implantation")).toHaveValue("plant");
  await expect(page.locator("#culture-prixUnite")).toHaveValue("0,3 / 0,4 / 0,5");
  // Les coûts sont facultatifs : les vider garde la culture.
  await page.locator("#culture-implantation").selectOption("");
  await page.locator("#culture-densite").fill("");
  await page.locator("#culture-prixUnite").fill("");
  await page.locator("#culture-intrants").fill("");
  await page.locator("#culture-ajouter").click();
  await expect(page.locator("#tiroir-cultures")).toBeHidden();
  expect((await stockes(page, "cultures"))[0]).toMatchObject({ implantation: "", densite: null, prixUnite: null, intrants: null });
});

test("[T43] EX-45 : un véhicule reçoit ses frais d'entretien et d'usure au km, facultatifs", async ({ page }) => {
  await page.goto("index.html");
  await aller(page, "ventes");
  await page.locator('#section-vehicules [data-ouvrir="vehicules"]').filter({ visible: true }).click();
  await page.locator("#vehicule-nom").fill("Camionnette");
  await page.locator("#vehicule-consommation").fill("8");
  await page.locator("#vehicule-prixLitre").fill("1,80");
  await page.locator("#vehicule-fraisKm").fill("0,1 / 0,15 / 0,2");
  await page.locator("#vehicule-ajouter").click();
  await expect(page.locator("#tiroir-vehicules")).toBeHidden();
  expect((await stockes(page, "vehicules"))[0].fraisKm).toEqual({ basse: 0.1, mediane: 0.15, haute: 0.2 });
});
