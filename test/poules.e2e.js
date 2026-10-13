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

// P2 : chaque liste est sur sa page, chaque formulaire s'ouvre dans un tiroir (EX-30, EX-31).
const { choisir, aller, ouvrir, PAGE_DE } = require("./outils.js");

async function saisirLot(page, champs = {}) {
  await ouvrir(page, "lots");
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

// P2 : une valeur de la ligne d'un lot, sous son libellé (« Œufs par semaine de ponte », « Aliment par semaine »).
function faitDuLot(page, texte, cle) {
  return ligneLot(page, texte).locator(`[data-fait="${cle}"]`);
}

test("[T27] un lot de poules se saisit, se liste, se modifie, se supprime et se retrouve après réouverture", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await saisirLot(page);
  await expect(ligneLot(page, "Lot 1")).toContainText("100 poules");
  await expect(ligneLot(page, "Lot 1")).toContainText("06/04/2026");
  await expect(page.locator("#section-lots .compte")).toHaveText("1");
  await expect(page.locator('#navigation .compte-nav[data-objet="lots"]')).toHaveText("1");

  await ligneLot(page, "Lot 1").locator('[data-action="modifier"]').click();
  await expect(page.locator("#section-lots")).toHaveAttribute("data-mode", "modification");
  await expect(page.locator("#lot-ponte")).toHaveValue("0,8");
  await page.locator("#lot-effectif").fill("120");
  await page.locator("#lot-ajouter").click();
  await expect(ligneLot(page, "Lot 1")).toContainText("120 poules");
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await aller(reouverte, "poules");
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
  await ouvrir(page, "pointsVente");
  await page.locator("#pointVente-nom").fill("marché de Saint-Paul");
  await page.locator("#pointVente-distanceKm").fill("12");
  await page.locator("#pointVente-coutKm").fill("0,4");
  await page.locator("#pointVente-ajouter").click();
  await ouvrir(page, "debouches");
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

// P2 : la barre de raccourcis vers les panneaux est remplacée par la navigation entre les pages (EX-30).
test("[T27] chaque lien de la navigation mène au panneau de l'objet, titre visible et non recouvert", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("index.html");
  for (const objet of ["lots", "debouches", "espaces", "seances"]) {
    await page.locator(`#navigation a[data-page="${PAGE_DE[objet]}"]`).click();
    const titre = page.locator(`#section-${objet} h2`);
    // Le panneau peut être plus bas dans sa page (Débouchés, sous Points de vente et Séances) : on y défile.
    await titre.scrollIntoViewIfNeeded();
    await expect.poll(() => titre.evaluate((h2) => {
      const r = h2.getBoundingClientRect();
      const dessus = document.elementFromPoint(r.left + 4, r.top + r.height / 2);
      return h2.contains(dessus);
    }), { message: objet }).toBe(true);
  }
});

// ---- T28 : ponte et aliment par semaine (EX-26, scénario S7)

test("[T28] S7 : la liste des lots donne les œufs d'une semaine de ponte et le coût d'une semaine d'aliment", async ({ page }) => {
  await page.goto("index.html");
  await saisirLot(page);
  // P2 : chaque valeur sous son libellé ; une fourchette aux trois valeurs égales s'écrit en un seul nombre.
  const oeufs = faitDuLot(page, "Lot 1", "oeufs");
  await expect(oeufs.locator("dt")).toHaveText("Œufs par semaine de ponte");
  await expect(oeufs.locator("dd")).toHaveText("532");
  await expect(oeufs.locator(".f-bornes")).toHaveCount(0);
  const aliment = faitDuLot(page, "Lot 1", "aliment");
  await expect(aliment.locator("dt")).toHaveText("Aliment par semaine");
  await expect(aliment.locator("dd")).toHaveText("50,4 €");
  await expect(aliment.locator(".f-bornes")).toHaveCount(0);
});

// ---- T29 : l'atelier poules dans le tableau économique (EX-27, scénarios S7 et S9)

test("[T29] S7 et S9 : le tableau montre l'atelier poules sous son bandeau, et la marge de la ferme déduit l'aliment", async ({ page }) => {
  await page.goto("index.html");
  await saisirLot(page);
  await aller(page, "synthese");
  await expect(page.locator("#tableau")).toBeVisible();
  await expect(page.locator('#tableau tbody tr.bandeau-atelier[data-atelier="poules"]')).toContainText(/atelier poules/i);
  const total = async (selecteur) => Number(await page.locator(`${selecteur} td[data-mois="total"] .mediane`).getAttribute("data-valeur"));
  const oeufs = (mesure) => `#tableau tbody tr[data-culture="oeufs"][data-mesure="${mesure}"]`;
  expect(await total(oeufs("volume"))).toBeCloseTo(2660, 6);
  expect(await total(oeufs("ca"))).toBeCloseTo(1064, 6);
  expect(await total(oeufs("aliment"))).toBeCloseTo(302.4, 6);
  expect(await total(oeufs("marge"))).toBeCloseTo(761.6, 6);
  await expect(page.locator(`${oeufs("aliment")} th`)).toContainText(/aliment/i);
  expect(await total('#tableau tfoot tr[data-mesure="aliment"]')).toBeCloseTo(302.4, 6);
  expect(await total('#tableau tfoot tr[data-mesure="marge"]')).toBeCloseTo(761.6, 6);
  await expect(page.locator("#synthese .mediane")).toHaveText("1 064 €");
});

test("[T29] les œufs se comptent en nombres entiers, et la première colonne nomme cultures et atelier", async ({ page }) => {
  await page.goto("index.html");
  await saisirLot(page, { ponte: "0,72", pertes: "8" });
  await aller(page, "synthese");
  const cases = page.locator('#tableau tbody tr[data-culture="oeufs"][data-mesure="volume"] td .mediane');
  await expect(cases.first()).toBeVisible();
  for (const texte of await cases.allTextContents()) expect(texte).toMatch(/^(—|[\d\s]+)$/);
  await expect(page.locator("#tableau thead th").first()).toHaveText(/culture ou atelier/i);
});

// ---- T30 : les œufs dans les ventes (EX-28, scénario S8)

test("[T30] S8 : les œufs ont leur ligne dans la matrice, et le tableau ne compte que les œufs vendus", async ({ page }) => {
  await page.goto("index.html");
  await saisirLot(page);
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
  await choisir(page, "#debouche-produitId", "Œufs");
  await page.locator("#debouche-prix").fill("0,5");
  await page.locator("#debouche-volumeParSeance").fill("300");
  await page.locator("#debouche-ajouter").click();

  // Le tableau et la matrice sont sur la page Synthèse.
  await aller(page, "synthese");
  const volume = page.locator('#tableau tbody tr[data-culture="oeufs"][data-mesure="volume"]');
  await expect(volume.locator("th").last()).toContainText(/vendus/i);
  expect(Number(await volume.locator('td[data-mois="total"] .mediane').getAttribute("data-valeur"))).toBeCloseTo(600, 6);

  await page.locator("#onglet-offre").click();
  const offre = page.locator('#matrice tr[data-produit="oeufs"][data-mesure="offre"]');
  await expect(offre.locator("th").first()).toHaveText("Œufs");
  await expect(offre.locator('td[data-semaine="2026-05-04"]')).toHaveAttribute("data-etat", "depasse");
  await expect(offre.locator('td[data-semaine="2026-05-11"]')).toHaveAttribute("data-etat", "manque");
});

// ---- T32 : retouches relevées par l'évaluateur de la tranche

test("[T32] la liste des lots compte les œufs en nombres entiers, et l'aide des débouchés parle aussi des œufs", async ({ page }) => {
  await page.goto("index.html");
  await saisirLot(page, { ponte: "0,6 / 0,72 / 0,8", pertes: "8" });
  // P2 : la fourchette 386 / 464 / 515 s'affiche « 464 386 à 515 » (médiane, puis basse à haute), sous son libellé.
  const oeufs = faitDuLot(page, "Lot 1", "oeufs");
  await expect(oeufs.locator("dt")).toHaveText("Œufs par semaine de ponte");
  await expect(oeufs.locator("dd")).toHaveText("464 386 à 515");
  // P2 : l'aide du formulaire des débouchés est dans son tiroir.
  await ouvrir(page, "debouches");
  await expect(page.locator("#tiroir-debouches .aide")).toContainText(/œuf/);
});
