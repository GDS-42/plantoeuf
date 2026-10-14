// Tranche R1 — véhicules : modèle et saisie (T40 : EX-41, EX-42) ; calcul des dépenses (T41 : EX-43, EX-44, scénario S11).
const { test, expect } = require("@playwright/test");
const { aller, modifier, choisir } = require("./outils.js");

function stockes(page, objet) {
  return page.evaluate((objet) => Store.ouvrir(localStorage).lister(objet), objet);
}

function ligne(page, liste, texte) {
  return page.locator(`#liste-${liste} li`, { hasText: texte });
}

// Le bouton « Ajouter un véhicule » visible de la section Véhicules (en tête, ou dans l'état vide).
async function ouvrirVehicules(page) {
  await aller(page, "ventes");
  await page.locator('#section-vehicules [data-ouvrir="vehicules"]').filter({ visible: true }).click();
  await expect(page.locator("#tiroir-vehicules")).toBeVisible();
}

async function ouvrirPointsVente(page) {
  await aller(page, "ventes");
  await page.locator('#section-pointsVente [data-ouvrir="pointsVente"]').filter({ visible: true }).click();
  await expect(page.locator("#tiroir-pointsVente")).toBeVisible();
}

async function camionnette(page) {
  await page.goto("index.html");
  await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    ferme.ajouter("vehicules", { nom: "Camionnette", consommation: Store.fourchette(8), prixLitre: Store.fourchette(1.8) });
  });
  await page.reload();
}

test("[T40] EX-41 : un véhicule se saisit, se modifie, se supprime et se retrouve après réouverture", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await ouvrirVehicules(page);
  await page.locator("#vehicule-nom").fill("Camionnette");
  await page.locator("#vehicule-consommation").fill("8");
  await page.locator("#vehicule-prixLitre").fill("1,80");
  await page.locator("#vehicule-ajouter").click();
  await expect(page.locator("#tiroir-vehicules")).toBeHidden();
  await expect(ligne(page, "vehicules", "Camionnette")).toHaveCount(1);
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await aller(reouverte, "ventes");
  await expect(ligne(reouverte, "vehicules", "Camionnette")).toHaveCount(1);
  const [v] = await stockes(reouverte, "vehicules");
  expect(v).toMatchObject({ nom: "Camionnette", consommation: { basse: 8, mediane: 8, haute: 8 }, prixLitre: { basse: 1.8, mediane: 1.8, haute: 1.8 } });

  await ligne(reouverte, "vehicules", "Camionnette").locator('[data-action="modifier"]').click();
  await expect(reouverte.locator("#tiroir-vehicules")).toBeVisible();
  await expect(reouverte.locator("#vehicule-prixLitre")).toHaveValue("1,8");
  await reouverte.locator("#vehicule-consommation").fill("7 / 8 / 9");
  await reouverte.locator("#vehicule-ajouter").click();
  await expect(reouverte.locator("#tiroir-vehicules")).toBeHidden();
  expect((await stockes(reouverte, "vehicules"))[0].consommation).toEqual({ basse: 7, mediane: 8, haute: 9 });

  await ligne(reouverte, "vehicules", "Camionnette").locator('[data-action="supprimer"]').click();
  await expect(reouverte.locator("#liste-vehicules li")).toHaveCount(0);
  expect(await stockes(reouverte, "vehicules")).toEqual([]);
});

test("[T40] EX-41 : une fourchette désordonnée est refusée avec un message, sans rien enregistrer", async ({ page }) => {
  await page.goto("index.html");
  await ouvrirVehicules(page);
  await page.locator("#vehicule-nom").fill("Camionnette");
  await page.locator("#vehicule-consommation").fill("9 / 8 / 7");
  await page.locator("#vehicule-prixLitre").fill("1,80");
  await page.locator("#vehicule-ajouter").click();
  await expect(page.locator("#vehicule-erreur")).toBeVisible();
  expect(await stockes(page, "vehicules")).toEqual([]);
});

test("[T40] EX-42 : avec un véhicule choisi, le coût du km n'est plus demandé, et le point de vente garde son véhicule", async ({ page }) => {
  await camionnette(page);
  await ouvrirPointsVente(page);
  await expect(page.locator("#pointVente-coutKm")).toBeVisible();
  await choisir(page, "#pointVente-vehiculeId", "Camionnette");
  await expect(page.locator("#pointVente-coutKm")).toBeHidden();
  await page.locator("#pointVente-nom").fill("marché de Saint-Paul");
  await page.locator("#pointVente-distanceKm").fill("12");
  await page.locator("#pointVente-ajouter").click();
  await expect(page.locator("#tiroir-pointsVente")).toBeHidden();
  const [vehicule] = await stockes(page, "vehicules");
  const [marche] = await stockes(page, "pointsVente");
  expect(marche.vehiculeId).toBe(vehicule.id);
  expect(marche.coutKm).toBeNull();
  await expect(ligne(page, "pointsVente", "marché de Saint-Paul")).toContainText("Camionnette");

  // Sans véhicule, le coût du km redevient obligatoire.
  await modifier(page, "pointsVente", "marché de Saint-Paul");
  await expect(page.locator("#pointVente-vehiculeId")).toHaveValue(vehicule.id);
  await page.locator("#pointVente-vehiculeId").selectOption("");
  await expect(page.locator("#pointVente-coutKm")).toBeVisible();
  await page.locator("#pointVente-ajouter").click();
  await expect(page.locator("#tiroir-pointsVente")).toBeVisible();
  expect((await stockes(page, "pointsVente"))[0].vehiculeId).toBe(vehicule.id);
  await page.locator("#pointVente-coutKm").fill("0,4");
  await page.locator("#pointVente-ajouter").click();
  await expect(page.locator("#tiroir-pointsVente")).toBeHidden();
  const [relu] = await stockes(page, "pointsVente");
  expect(relu.vehiculeId).toBe("");
  expect(relu.coutKm).toEqual({ basse: 0.4, mediane: 0.4, haute: 0.4 });
});

test("[T40] EX-42 : sans véhicule, le tiroir du point de vente propose d'en ajouter un", async ({ page }) => {
  await page.goto("index.html");
  await ouvrirPointsVente(page);
  const ajouter = page.locator('#tiroir-pointsVente [data-ouvrir="vehicules"]');
  await expect(ajouter).toBeVisible();
  await ajouter.click();
  await expect(page.locator("#tiroir-vehicules")).toBeVisible();
  await expect(page.locator("#tiroir-pointsVente")).toBeHidden();
});
