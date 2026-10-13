// Tranche N2 — points de vente, séances et débouchés, dans le fichier ouvert.
const fs = require("node:fs");
const { test, expect } = require("@playwright/test");
const { aller, ouvrir, modifier } = require("./outils.js");

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
  await aller(reouverte, "sauvegarde");
  const [telechargement] = await Promise.all([reouverte.waitForEvent("download"), reouverte.locator("#exporter").click()]);
  const fichier = JSON.parse(fs.readFileSync(await telechargement.path(), "utf8"));
  expect(fichier.pointsVente.map((p) => p.nom)).toEqual(["marché de Saint-Paul"]);
  expect(fichier.seances).toHaveLength(1);
  expect(fichier.debouches).toHaveLength(1);
});

// ---- T19 : saisie des points de vente, séances et débouchés (EX-18)

const { choisir, saisirS2 } = require("./outils.js");

async function saisirMarche(page) {
  await ouvrir(page, "pointsVente");
  await page.locator("#pointVente-nom").fill("marché de Saint-Paul");
  await page.locator("#pointVente-distanceKm").fill("12");
  await page.locator("#pointVente-coutKm").fill("0,4");
  await page.locator("#pointVente-ajouter").click();

  await ouvrir(page, "seances");
  await choisir(page, "#seance-pointVenteId", "marché de Saint-Paul");
  await page.locator("#seance-jour").selectOption("6");
  await page.locator("#seance-debut").fill("2026-05-02");
  await page.locator("#seance-fin").fill("2026-06-27");
  await page.locator("#seance-frais").fill("15");
  await page.locator("#seance-ajouter").click();

  await ouvrir(page, "debouches");
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
  await expect(ligne(page, "debouches", "courgette")).toContainText("20 kg par séance");
  await expect(ligne(page, "debouches", "courgette")).toContainText("15 à 25");
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

  await modifier(page, "pointsVente", "marché de Saint-Paul");
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
  await ouvrir(page, "pointsVente");
  await page.locator("#pointVente-nom").fill("marché");
  await page.locator("#pointVente-distanceKm").fill("5");
  await page.locator("#pointVente-coutKm").fill("0,5 / 0,3 / 0,6");
  await page.locator("#pointVente-ajouter").click();
  await expect(page.locator("#pointVente-erreur")).toBeVisible();
  await expect(page.locator("#liste-pointsVente li")).toHaveCount(0);
});

// ---- T20 : séances datées et coûts, dans la liste des séances

test("[T20] S6 : la liste des séances donne le nombre de séances datées et le coût de chacune", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  await saisirMarche(page);
  const seance = ligne(page, "seances", "samedi");
  await expect(seance).toContainText("9 séances");
  await expect(seance).toContainText("24,6");
});

// ---- T21 : la vue « Offre et demande » (EX-20, scénario S4)

test("[T21] S4 : la vue « Offre et demande » montre, semaine par semaine, où la production dépasse ou manque", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  await saisirMarche(page);
  await aller(page, "synthese");
  await expect(page.locator("#tableau")).toBeVisible();
  await page.locator("#onglet-offre").click();
  await expect(page.locator("#section-offre")).toBeVisible();
  await expect(page.locator("#tableau")).toBeHidden();

  const offre = page.locator('#matrice tbody tr[data-mesure="offre"]', { hasText: "courgette" });
  const premiere = offre.locator('td[data-semaine="2026-04-27"]');
  await expect(premiere).toHaveAttribute("data-etat", "depasse");
  await expect(premiere).toHaveAttribute("data-sur", "true");
  expect(Number(await premiere.locator(".ecart").getAttribute("data-valeur"))).toBeCloseTo(13.75, 6);
  const derniere = offre.locator('td[data-semaine="2026-06-22"]');
  await expect(derniere).toHaveAttribute("data-etat", "manque");
  expect(Number(await derniere.locator(".ecart").getAttribute("data-valeur"))).toBeCloseTo(-20, 6);
  await expect(page.locator('#matrice thead th[data-semaine="2026-04-27"]')).toContainText("18");

  await page.locator("#onglet-tableau").click();
  await expect(page.locator("#tableau")).toBeVisible();
  await expect(page.locator("#section-offre")).toBeHidden();
});

test("[T21] EX-09 : offre et demande s'affichent en fourchette, signalées comme estimations", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  await saisirMarche(page);
  await aller(page, "synthese");
  await page.locator("#onglet-offre").click();
  const demande = page.locator('#matrice tbody tr[data-mesure="demande"]').first();
  await expect(demande.locator("th")).toContainText(/estim/i);
  const cellule = demande.locator('td[data-semaine="2026-04-27"]');
  const valeur = async (niveau) => Number(await cellule.locator(`.${niveau}`).getAttribute("data-valeur"));
  expect([await valeur("basse"), await valeur("mediane"), await valeur("haute")]).toEqual([15, 20, 25]);
  await expect(page.locator("#section-offre .legende")).toContainText(/fourchette/i);
});

// ---- T22 : le tableau compte ce qui se vend, et déduit le coût des séances de la marge de la ferme

test("[T22] S4 et S6 : le tableau donne le volume vendu, et la marge de la ferme déduit le coût des séances", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  await saisirMarche(page);
  await aller(page, "synthese");

  const volume = page.locator('#tableau tbody tr[data-mesure="volume"]', { hasText: "courgette" });
  await expect(volume.locator("th").last()).toContainText(/vendu/i);
  expect(Number(await volume.locator('td[data-mois="total"] .mediane').getAttribute("data-valeur"))).toBeCloseTo(160, 6);
  const valeurPied = async (mesure) => Number(await page.locator(`#tableau tfoot tr[data-mesure="${mesure}"] td[data-mois="total"] .mediane`).getAttribute("data-valeur"));
  expect(await valeurPied("ca")).toBeCloseTo(400, 6);
  expect(await valeurPied("couts")).toBeCloseTo(221.4, 6);
  expect(await valeurPied("marge")).toBeCloseTo(178.6, 6);
  await expect(page.locator('#tableau tfoot tr[data-mesure="couts"] th')).toContainText(/séances/i);
});

// ---- T23 : la vue « Points de vente » (EX-22, scénario S6)

test("[T23] S6 : la vue « Points de vente » donne, par mois, les séances, le chiffre d'affaires, les coûts et le résultat", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  await saisirMarche(page);
  await aller(page, "synthese");
  await page.locator("#onglet-points").click();
  await expect(page.locator("#section-points")).toBeVisible();
  await expect(page.locator("#tableau")).toBeHidden();

  const valeur = async (mesure) => Number(await page.locator(`#points tr[data-mesure="${mesure}"] td[data-mois="total"] .mediane`).getAttribute("data-valeur"));
  await expect(page.locator('#points tbody tr[data-mesure="resultat"] th')).toContainText("marché de Saint-Paul");
  await expect(page.locator('#points tr[data-mesure="seances"] td[data-mois="total"]')).toHaveText("9");
  expect(await valeur("ca")).toBeCloseTo(400, 6);
  expect(await valeur("couts")).toBeCloseTo(221.4, 6);
  expect(await valeur("resultat")).toBeCloseTo(178.6, 6);
  await expect(page.locator("#points thead th").first()).toContainText(/estim/i);
});

test("[T23] un résultat arrondi à zéro s'affiche comme zéro, sans signe moins", async ({ page }) => {
  await page.goto("index.html");
  const [presqueZero, zero, perte, gain] = await page.evaluate(() => [-0.3, 0, -16.2, 16.2].map(UiCommun.enEuros));
  expect(presqueZero).toBe(zero);
  expect(perte).not.toBe(gain);
  expect(perte).toMatch(/16/);
});
