// Tranche R1 — dates saisies et relues jour, mois, année (T39 : EX-39, EX-40, scénario S10).
const { test, expect } = require("@playwright/test");
const { ouvrir, modifier, choisir } = require("./outils.js");

const CHAMPS_DATE = ["plantation-date", "seance-debut", "seance-fin", "lot-arrivee", "lot-debutPonte", "lot-reforme"];

// Une ferme minimale enregistrée directement : un espace, une culture et sa variété ; en option,
// une plantation, un point de vente et sa séance, un lot de poules.
async function ferme(page, { complete = false } = {}) {
  await page.goto("index.html");
  await page.evaluate((complete) => {
    const ferme = Store.ouvrir(localStorage);
    const F = Store.fourchette;
    const espace = ferme.ajouter("espaces", { nom: "planche 1", surface: 30, type: "plein_champ" });
    const culture = ferme.ajouter("cultures", {
      nom: "courgette", famille: "Cucurbitacées", unite: "kg", rendement: F(3), prix: F(2.5),
      joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
    });
    const variete = ferme.ajouter("varietes", { nom: "Black Beauty", cultureId: culture.id });
    if (!complete) return;
    ferme.ajouter("plantations", { varieteId: variete.id, espaceId: espace.id, surface: 30, date: "2026-05-01" });
    const marche = ferme.ajouter("pointsVente", { nom: "marché de Saint-Paul", distanceKm: 12, coutKm: F(0.4) });
    ferme.ajouter("seances", { pointVenteId: marche.id, jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: F(15) });
    ferme.ajouter("lots", {
      nom: "Lot 1", effectif: 100, arrivee: "2026-03-30", debutPonte: "2026-04-06", reforme: "2026-05-10",
      ponte: F(0.8), pertes: 5, aliment: F(120), prixAliment: F(0.6), prixOeuf: F(0.4),
    });
  }, complete);
  await page.reload();
}

function datesEnregistrees(page) {
  return page.evaluate(() => Store.ouvrir(localStorage).lister("plantations").map((p) => p.date));
}

test("[T39] S10 : une plantation datée « 15/03/2026 » est enregistrée au 2026-03-15 et relue jj/mm/aaaa", async ({ page }) => {
  await ferme(page);
  await ouvrir(page, "plantations");
  await choisir(page, "#plantation-varieteId", "Black Beauty");
  await choisir(page, "#plantation-espaceId", "planche 1");
  await page.locator("#plantation-surface").fill("30");
  await page.locator("#plantation-date").fill("15/03/2026");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  expect(await datesEnregistrees(page)).toEqual(["2026-03-15"]);
  await expect(page.locator("#liste-plantations li")).toContainText("15/03/2026");

  await modifier(page, "plantations", "Black Beauty");
  await expect(page.locator("#plantation-date")).toHaveValue("15/03/2026");

  // Huit chiffres, comme au clavier numérique d'un téléphone.
  await page.locator("#plantation-date").fill("16032026");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#tiroir-plantations")).toBeHidden();
  expect(await datesEnregistrees(page)).toEqual(["2026-03-16"]);
  await expect(page.locator("#liste-plantations li")).toContainText("16/03/2026");
});

test("[T39] S10 : une date qui n'existe pas est refusée avec un message clair, rien n'est enregistré", async ({ page }) => {
  await ferme(page);
  await ouvrir(page, "plantations");
  await choisir(page, "#plantation-varieteId", "Black Beauty");
  await choisir(page, "#plantation-espaceId", "planche 1");
  await page.locator("#plantation-surface").fill("30");
  await page.locator("#plantation-date").fill("31/02/2026");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#plantation-erreur")).toBeVisible();
  await expect(page.locator("#plantation-erreur")).toHaveText("Écrivez la date jour/mois/année, par exemple 15/03/2026.");
  await expect(page.locator("#tiroir-plantations")).toBeVisible();
  expect(await datesEnregistrees(page)).toEqual([]);
});

test("[T39] EX-40 : en modification, les six champs de date montrent jj/mm/aaaa", async ({ page }) => {
  await ferme(page, { complete: true });
  await modifier(page, "plantations", "Black Beauty");
  await expect(page.locator("#plantation-date")).toHaveValue("01/05/2026");
  await page.keyboard.press("Escape");

  await modifier(page, "seances", "marché de Saint-Paul");
  await expect(page.locator("#seance-debut")).toHaveValue("02/05/2026");
  await expect(page.locator("#seance-fin")).toHaveValue("27/06/2026");
  await page.keyboard.press("Escape");

  await modifier(page, "lots", "Lot 1");
  await expect(page.locator("#lot-arrivee")).toHaveValue("30/03/2026");
  await expect(page.locator("#lot-debutPonte")).toHaveValue("06/04/2026");
  await expect(page.locator("#lot-reforme")).toHaveValue("10/05/2026");
});

test("[T39] EX-39, EX-40 : chaque champ de date se saisit en texte jj/mm/aaaa, avec un bouton calendrier", async ({ page }) => {
  await ferme(page, { complete: true });
  // Chaque tiroir ouvert, ses champs de date et leur bouton (un nom accessible ne se lit que visible).
  const tiroirs = [["plantations", "Black Beauty", ["plantation-date"]], ["seances", "marché de Saint-Paul", ["seance-debut", "seance-fin"]],
    ["lots", "Lot 1", ["lot-arrivee", "lot-debutPonte", "lot-reforme"]]];
  for (const [objet, texte, ids] of tiroirs) {
    await modifier(page, objet, texte);
    for (const id of ids) {
      const champ = page.locator(`#${id}`);
      await expect(champ).toHaveAttribute("type", "text");
      await expect(champ).toHaveAttribute("placeholder", "jj/mm/aaaa");
      await expect(champ).toHaveAttribute("inputmode", "numeric");
      const bouton = page.locator(`button[data-calendrier="${id}"]`);
      await expect(bouton).toBeVisible();
      await expect(bouton).toHaveAccessibleName("Choisir dans le calendrier");
    }
    await page.keyboard.press("Escape");
  }
  expect(tiroirs.flatMap(([, , ids]) => ids).sort()).toEqual([...CHAMPS_DATE].sort());

  // Le calendrier du navigateur rend une date ISO, que le champ réécrit jj/mm/aaaa.
  await modifier(page, "lots", "Lot 1");
  await expect(page.locator('button[data-calendrier="lot-reforme"]')).toBeVisible();
  await page.locator('input[type="date"][data-calendrier-de="lot-reforme"]').evaluate((selecteur) => {
    selecteur.value = "2026-05-17";
    selecteur.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator("#lot-reforme")).toHaveValue("17/05/2026");
  await page.locator("#lot-ajouter").click();
  await expect(page.locator("#tiroir-lots")).toBeHidden();
  expect(await page.evaluate(() => Store.ouvrir(localStorage).lister("lots")[0].reforme)).toBe("2026-05-17");
});

test("[T39] EX-39 : en quittant le champ, une date lisible est réécrite jj/mm/aaaa", async ({ page }) => {
  await ferme(page);
  await ouvrir(page, "plantations");
  const champ = page.locator("#plantation-date");
  await champ.fill("15032026");
  await champ.blur();
  await expect(champ).toHaveValue("15/03/2026");
  await champ.fill("1/5/26");
  await champ.blur();
  await expect(champ).toHaveValue("01/05/2026");
  // Une saisie illisible reste telle quelle, pour être corrigée.
  await champ.fill("31/02/2026");
  await champ.blur();
  await expect(champ).toHaveValue("31/02/2026");
});
