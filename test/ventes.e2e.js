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

// ---- T19 : saisie des points de vente, séances et débouchés (EX-18)

const { choisir, saisirS2 } = require("./outils.js");

async function saisirMarche(page) {
  await page.locator("#pointVente-nom").fill("marché de Saint-Paul");
  await page.locator("#pointVente-distanceKm").fill("12");
  await page.locator("#pointVente-coutKm").fill("0,4");
  await page.locator("#pointVente-ajouter").click();

  await choisir(page, "#seance-pointVenteId", "marché de Saint-Paul");
  await page.locator("#seance-jour").selectOption("6");
  await page.locator("#seance-debut").fill("2026-05-02");
  await page.locator("#seance-fin").fill("2026-06-27");
  await page.locator("#seance-frais").fill("15");
  await page.locator("#seance-ajouter").click();

  await choisir(page, "#debouche-pointVenteId", "marché de Saint-Paul");
  await choisir(page, "#debouche-produitId", "courgette");
  await page.locator("#debouche-prix").fill("2,5");
  await page.locator("#debouche-volumeParSeance").fill("15 / 20 / 25");
  await page.locator("#debouche-ajouter").click();
}

function ligne(page, liste, texte) {
  return page.locator(`#liste-${liste} li`, { hasText: texte });
}

async function stockees(page, objet) {
  return page.evaluate((o) => JSON.parse(localStorage.getItem("plantoeuf"))[o], objet);
}

test("[T19] points de vente, séances et débouchés se saisissent, se listent et sont retrouvés après réouverture", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await saisirS2(page);
  await saisirMarche(page);

  await expect(ligne(page, "pointsVente", "marché de Saint-Paul")).toContainText("12 km");
  await expect(ligne(page, "seances", "marché de Saint-Paul")).toContainText("samedi");
  await expect(ligne(page, "seances", "marché de Saint-Paul")).toContainText("02/05/2026");
  await expect(ligne(page, "debouches", "courgette")).toContainText("15 / 20 / 25");
  for (const [objet, nombre] of [["pointsVente", "1"], ["seances", "1"], ["debouches", "1"]]) {
    await expect(page.locator(`#section-${objet}.panneau .compte`)).toHaveText(nombre);
  }
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await expect(ligne(reouverte, "pointsVente", "marché de Saint-Paul")).toHaveCount(1);
  await expect(ligne(reouverte, "seances", "samedi")).toHaveCount(1);
  await expect(ligne(reouverte, "debouches", "courgette")).toContainText("marché de Saint-Paul");
  const [seance] = await stockees(reouverte, "seances");
  const [marche] = await stockees(reouverte, "pointsVente");
  expect(seance).toMatchObject({ pointVenteId: marche.id, jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: { basse: 15, mediane: 15, haute: 15 } });
  expect(marche).toMatchObject({ distanceKm: 12, coutKm: { basse: 0.4, mediane: 0.4, haute: 0.4 } });
  const [debouche] = await stockees(reouverte, "debouches");
  expect(debouche.volumeParSeance).toEqual({ basse: 15, mediane: 20, haute: 25 });
});

test("[T19] un point de vente se modifie, une séance se supprime logiquement", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await saisirS2(page);
  await saisirMarche(page);

  await ligne(page, "pointsVente", "marché de Saint-Paul").locator('[data-action="modifier"]').click();
  await expect(page.locator("#section-pointsVente")).toHaveAttribute("data-mode", "modification");
  await page.locator("#pointVente-distanceKm").fill("15");
  await page.locator("#pointVente-ajouter").click();
  await expect(ligne(page, "pointsVente", "marché de Saint-Paul")).toContainText("15 km");

  await ligne(page, "seances", "samedi").locator('[data-action="supprimer"]').click();
  await expect(page.locator("#liste-seances li")).toHaveCount(0);
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await expect(reouverte.locator("#liste-seances li")).toHaveCount(0);
  const [seance] = await stockees(reouverte, "seances");
  expect(seance.supprimeLe).not.toBeNull();
});

test("[T19] une fourchette désordonnée est refusée avec un message, sans rien enregistrer", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#pointVente-nom").fill("marché");
  await page.locator("#pointVente-distanceKm").fill("5");
  await page.locator("#pointVente-coutKm").fill("0,5 / 0,3 / 0,6");
  await page.locator("#pointVente-ajouter").click();
  await expect(page.locator("#pointVente-erreur")).toBeVisible();
  await expect(page.locator("#liste-pointsVente li")).toHaveCount(0);
});
