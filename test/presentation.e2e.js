// Tranche P1 — présentation. Tests de bout en bout sur dist/index.html ouvert en file://.
const { test, expect } = require("@playwright/test");

// Relève les erreurs de la page : exceptions non rattrapées et messages d'erreur de la console.
function releverErreurs(page) {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(message.text());
  });
  return erreurs;
}

test("[T11] le rendu est découpé en modules, et l'outil s'utilise sans aucune erreur", async ({ page }) => {
  const erreurs = releverErreurs(page);
  await page.goto("index.html");

  const modules = await page.evaluate(() => ["UiCommun", "UiSaisie", "UiTableau", "UiSauvegarde"].map((nom) => typeof globalThis[nom]));
  expect(modules).toEqual(["object", "object", "object", "object"]);

  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
  await page.locator("#liste-plantations li", { hasText: "Courgette" }).locator('[data-action="modifier"]').click();
  await page.locator("#plantation-surface").fill("20");
  await page.locator("#plantation-ajouter").click();
  await expect(page.locator("#liste-plantations li", { hasText: "Courgette" })).toContainText("20 m²");
  await Promise.all([page.waitForEvent("download"), page.locator("#exporter").click()]);
  await page.locator("#effacer-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(0);

  expect(erreurs).toEqual([]);
});

// ---- T12 — EX-11, EX-16 : deux volets, le tableau toujours sous les yeux, pas de défilement horizontal.

async function chargerExemple(page) {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
}

for (const [largeur, hauteur] of [[1280, 720], [1366, 768], [1920, 1080]]) {
  test(`[T12] P1-S1 à ${largeur} × ${hauteur} : le tableau reste visible pendant le défilement des panneaux de saisie`, async ({ page }) => {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await chargerExemple(page);

    for (const panneau of ["#section-espaces", "#section-cultures", "#section-varietes", "#section-plantations", "#section-sauvegarde"]) {
      await page.locator(panneau).scrollIntoViewIfNeeded();
      await expect(page.locator(panneau)).toBeInViewport();
      await expect(page.locator("#tableau")).toBeInViewport();
    }

    const courgette = page.locator("#tableau tbody tr[data-mesure=\"volume\"]", { hasText: "Courgette" });
    const cultureId = await courgette.getAttribute("data-culture");
    const total = page.locator(`#tableau tr[data-culture="${cultureId}"][data-mesure="ca"] td[data-mois="total"] .mediane`);
    const avant = Number(await total.getAttribute("data-valeur"));

    await page.locator("#liste-plantations li", { hasText: "Courgette" }).locator('[data-action="modifier"]').click();
    await page.locator("#plantation-surface").fill("15");
    await page.locator("#plantation-ajouter").click();

    await expect.poll(async () => Number(await total.getAttribute("data-valeur"))).toBeLessThan(avant);
    await expect(total).toBeInViewport();
    await expect(page.locator("#form-plantation")).toBeInViewport();
  });
}

test("[T12] EX-16 : aucun défilement horizontal de la page de 1280 à 1920 px de large, ferme d'exemple chargée", async ({ page }) => {
  for (const largeur of [1280, 1366, 1600, 1920]) {
    await page.setViewportSize({ width: largeur, height: 800 });
    await chargerExemple(page);
    const debordement = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debordement, `${largeur} px`).toBeLessThanOrEqual(0);
    await page.evaluate(() => localStorage.clear());
  }
});

test("[T12] sous 1100 px de large, une seule colonne, la projection en premier", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await chargerExemple(page);
  const haut = async (selecteur) => (await page.locator(selecteur).boundingBox()).y;
  expect(await haut("#section-tableau")).toBeLessThan(await haut("#section-espaces"));
  const debordement = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(debordement).toBeLessThanOrEqual(0);
});
