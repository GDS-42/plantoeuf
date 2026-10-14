// Tranche N3 — coûts de culture (T45 : EX-47, scénario S12) ; besoins en semences et plants (T47 : EX-49, scénario S12).
const { test, expect } = require("@playwright/test");
const { aller } = require("./outils.js");

const NIVEAUX = ["basse", "mediane", "haute"];
async function fourchette(locator) {
  const valeurs = {};
  for (const niveau of NIVEAUX) valeurs[niveau] = Number(await locator.locator(`.${niveau}`).first().getAttribute("data-valeur"));
  return valeurs;
}
function pied(page, mesure, mois = "total") {
  return page.locator(`#tableau tfoot tr[data-mesure="${mesure}"] td[data-mois="${mois}"]`);
}
const proche = (obtenue, attendue) => {
  for (const niveau of NIVEAUX) expect(obtenue[niveau]).toBeCloseTo(attendue[niveau], 6);
};

// Scénario S12 : la courgette du scénario S1 de N1 (100 m² le 1er mars 2026), en plants.
async function scenarioS12(page, { couts = true } = {}) {
  await page.goto("index.html");
  await page.evaluate((couts) => {
    const ferme = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    const espace = ferme.ajouter("espaces", { nom: "planche 1", surface: 100, type: "plein_champ" });
    const culture = ferme.ajouter("cultures", {
      nom: "courgette", famille: "Cucurbitacées", unite: "kg", rendement: F(3), prix: F(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
      ...(couts ? { implantation: "plant", densite: 1, prixUnite: F(0.3, 0.4, 0.5), intrants: F(0.2) } : {}),
    });
    const variete = ferme.ajouter("varietes", { nom: "Black Beauty", cultureId: culture.id });
    ferme.ajouter("plantations", { varieteId: variete.id, espaceId: espace.id, surface: 100, date: "2026-03-01" });
  }, couts);
  await page.reload();
}

test("[T45] S12 : le tableau déduit les coûts de culture : mars 2026, une ligne « Semences, plants et intrants », la marge à 470 / 615 / 760 €", async ({ page }) => {
  await scenarioS12(page);
  await aller(page, "synthese");
  await expect(page.locator('#tableau thead th[data-mois="2026-03"]')).toHaveCount(1);
  await expect(page.locator('#tableau tfoot tr[data-mesure="cultures"] th')).toContainText(/semences, plants et intrants/i);
  proche(await fourchette(pied(page, "cultures")), { basse: 50, mediane: 60, haute: 70 });
  proche(await fourchette(pied(page, "cultures", "2026-03")), { basse: 50, mediane: 60, haute: 70 });
  proche(await fourchette(pied(page, "marge")), { basse: 470, mediane: 615, haute: 760 });
  proche(await fourchette(page.locator('#tuiles .tuile[data-chiffre="couts"]')), { basse: 50, mediane: 60, haute: 70 });
  await expect(page.locator('#tuiles .tuile[data-chiffre="couts"] [data-cout="cultures"]')).toContainText(/semences|plants/i);
});

test("[T45] EX-47 : la ligne d'une culture montre son coût de mise en place par m²", async ({ page }) => {
  await scenarioS12(page);
  await aller(page, "cultures");
  await expect(page.locator('#liste-cultures li [data-fait="coutM2"]')).toContainText("0,6 €/m²");
});

test("[T45] sans_cout_comme_r1 : sans coût de culture, ni ligne « Semences, plants et intrants », ni coût par m²", async ({ page }) => {
  await scenarioS12(page, { couts: false });
  await aller(page, "synthese");
  await expect(page.locator('#tableau tfoot tr[data-mesure="cultures"]')).toHaveCount(0);
  await expect(page.locator('#tableau thead th[data-mois="2026-03"]')).toHaveCount(0);
  await aller(page, "cultures");
  await expect(page.locator('#liste-cultures li [data-fait="coutM2"]')).toHaveCount(0);
});
