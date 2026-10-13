// Tranche S3 — poules pondeuses, dans le navigateur.
const { test, expect } = require("@playwright/test");

const CHAMPS_LOT = {
  nom: "Lot 1", effectif: 100, arrivee: "2026-03-30", debutPonte: "2026-04-06", reforme: "2026-05-10",
  ponte: { basse: 0.8, mediane: 0.8, haute: 0.8 }, pertes: 5, aliment: { basse: 120, mediane: 120, haute: 120 },
  prixAliment: { basse: 0.6, mediane: 0.6, haute: 0.6 }, prixOeuf: { basse: 0.4, mediane: 0.4, haute: 0.4 },
};

// ---- T26 : le modèle dans le navigateur (EX-25)

test("[T26] un lot enregistré dans le navigateur est retrouvé après réouverture de la page, et part dans l'export", async ({ page }) => {
  await page.goto("index.html");
  await page.evaluate((champs) => Store.ouvrir(localStorage).ajouter("lots", champs), CHAMPS_LOT);
  await page.reload();
  const fichier = await page.evaluate(() => Store.ouvrir(localStorage).exporter());
  expect(fichier.version).toBe(await page.evaluate(() => Store.VERSION));
  expect(fichier.lots).toHaveLength(1);
  expect(fichier.lots[0].nom).toBe("Lot 1");
});

// ---- T27 : panneau de saisie des lots ; « Œufs » parmi les produits d'un débouché (EX-25)

const { choisir } = require("./outils.js");

async function saisirLot(page, champs = {}) {
  const valeurs = {
    nom: "Lot 1", effectif: "100", arrivee: "2026-03-30", debutPonte: "2026-04-06", reforme: "2026-05-10",
    ponte: "0,8", pertes: "5", aliment: "120", prixAliment: "0,6", prixOeuf: "0,4", ...champs,
  };
  for (const [champ, valeur] of Object.entries(valeurs)) await page.locator(`#lot-${champ}`).fill(valeur);
  await page.locator("#lot-ajouter").click();
}

function ligneLot(page, texte) {
  return page.locator("#liste-lots li", { hasText: texte });
}

test("[T27] un lot de poules se saisit, se liste, se modifie, se supprime et se retrouve après réouverture", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await saisirLot(page);
  await expect(ligneLot(page, "Lot 1")).toContainText("100 poules");
  await expect(ligneLot(page, "Lot 1")).toContainText("06/04/2026");
  await expect(page.locator("#section-lots .compte")).toHaveText("1");
  await expect(page.locator('.compte-raccourci[data-objet="lots"]')).toHaveText("1");

  await ligneLot(page, "Lot 1").locator('[data-action="modifier"]').click();
  await expect(page.locator("#section-lots")).toHaveAttribute("data-mode", "modification");
  await expect(page.locator("#lot-ponte")).toHaveValue("0,8");
  await page.locator("#lot-effectif").fill("120");
  await page.locator("#lot-ajouter").click();
  await expect(ligneLot(page, "Lot 1")).toContainText("120 poules");
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await expect(ligneLot(reouverte, "Lot 1")).toContainText("120 poules");
  await ligneLot(reouverte, "Lot 1").locator('[data-action="supprimer"]').click();
  await expect(reouverte.locator("#liste-lots li")).toHaveCount(0);
  await expect(reouverte.locator("#lots-vide")).toBeVisible();
  const lots = await reouverte.evaluate(() => JSON.parse(localStorage.getItem("plantoeuf")).lots);
  expect(lots).toHaveLength(1);
  expect(lots[0].supprimeLe).not.toBeNull();
});

test("[T27] des dates qui ne se suivent pas sont refusées avec un message, et rien n'est enregistré", async ({ page }) => {
  await page.goto("index.html");
  await saisirLot(page, { debutPonte: "2026-03-01" });
  await expect(page.locator("#lot-erreur")).toBeVisible();
  await expect(page.locator("#lot-erreur")).toContainText(/arrivée/i);
  await expect(page.locator("#liste-lots li")).toHaveCount(0);
});

test("[T27] « Œufs » se choisit comme produit d'un débouché, et le débouché se lit en œufs", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#pointVente-nom").fill("marché de Saint-Paul");
  await page.locator("#pointVente-distanceKm").fill("12");
  await page.locator("#pointVente-coutKm").fill("0,4");
  await page.locator("#pointVente-ajouter").click();
  await choisir(page, "#debouche-pointVenteId", "marché de Saint-Paul");
  await choisir(page, "#debouche-produitId", "Œufs");
  await page.locator("#debouche-prix").fill("0,5");
  await page.locator("#debouche-volumeParSeance").fill("300");
  await page.locator("#debouche-ajouter").click();
  const ligne = page.locator("#liste-debouches li");
  await expect(ligne).toContainText("Œufs à marché de Saint-Paul");
  await expect(ligne).toContainText("300 œufs par séance");
  const debouches = await page.evaluate(() => JSON.parse(localStorage.getItem("plantoeuf")).debouches);
  expect(debouches[0].produitId).toBe("oeufs");
});

test("[T27] chaque raccourci mène à son panneau, titre visible sous la barre de raccourcis", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("index.html");
  for (const objet of ["lots", "debouches", "espaces", "seances"]) {
    await page.locator(`#raccourcis a[href="#section-${objet}"]`).click();
    const titre = page.locator(`#section-${objet} h2`);
    await expect.poll(() => titre.evaluate((h2) => {
      const r = h2.getBoundingClientRect();
      const dessus = document.elementFromPoint(r.left + 4, r.top + r.height / 2);
      return h2.contains(dessus);
    }), { message: objet }).toBe(true);
  }
});
