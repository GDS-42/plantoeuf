// T05 — EX-04, EX-09, scénario S2 : le tableau économique par culture et par mois, en fourchette.
const { test, expect } = require("@playwright/test");
const { saisirS2, caseDuTableau } = require("./outils.js");

test("[T05] S2 : en mai, la ligne courgette donne un CA en fourchette dont la médiane vaut le volume de mai × 2,50 €", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);

  const volume = await caseDuTableau(page, "courgette", "volume", "2026-05");
  const ca = await caseDuTableau(page, "courgette", "ca", "2026-05");
  expect(ca.basse).toBeLessThan(ca.haute);
  expect(ca.basse).toBeLessThanOrEqual(ca.mediane);
  expect(ca.mediane).toBeLessThanOrEqual(ca.haute);
  expect(ca.mediane).toBeCloseTo(volume.mediane * 2.5, 6);
  expect(volume.mediane).toBeCloseTo(168.75, 6);
  await expect(ca.cellule).toContainText("422");
});

test("[T05] EX-04 : le tableau donne pour chaque mois le volume, le chiffre d'affaires et la marge", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);

  await expect(page.locator("#tableau thead")).toContainText("mai 2026");
  await expect(page.locator("#tableau thead")).toContainText("juin 2026");
  for (const mesure of ["volume", "ca", "marge"]) {
    await expect(page.locator(`#tableau tbody tr[data-mesure="${mesure}"]`)).toHaveCount(1);
  }
  const ca = await caseDuTableau(page, "courgette", "ca", "2026-06");
  const marge = await caseDuTableau(page, "courgette", "marge", "2026-06");
  expect([marge.basse, marge.mediane, marge.haute]).toEqual([ca.basse, ca.mediane, ca.haute]);
  expect(ca.mediane).toBeCloseTo(101.25 * 2.5, 6);
});

test("[T05] EX-09 : les en-têtes signalent des estimations en fourchette basse / médiane / haute", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);

  const entetes = (await page.locator("#tableau caption, #tableau th").allTextContents()).join(" ").toLowerCase();
  for (const mot of ["estim", "fourchette", "basse", "médiane", "haute"]) {
    expect(entetes).toContain(mot);
  }
  await expect(page.locator('#tableau tbody tr[data-mesure="ca"] th')).toContainText(/estim/i);
});

test("[T05] sans plantation, le tableau annonce qu'aucune récolte n'est prévue", async ({ page }) => {
  await page.goto("index.html");
  await expect(page.locator("#tableau-vide")).toBeVisible();
  await expect(page.locator("#tableau")).toBeHidden();
});

const { ajouterEspace, ajouterPlantation } = require("./outils.js");

// ---- T06 — EX-05 : le tableau se recalcule à chaque modification du plan, sans autre action.

async function caMai(page) {
  return (await caseDuTableau(page, "courgette", "ca", "2026-05")).mediane;
}

test("[T06] modifier la surface d'une plantation recalcule le tableau sans autre action", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);
  expect(await caMai(page)).toBeCloseTo(421.875, 6);

  await page.locator("#liste-plantations li", { hasText: "Black Beauty" }).locator('[data-action="modifier"]').click();
  await page.locator("#plantation-surface").fill("50");
  await page.locator("#plantation-ajouter").click();

  await expect.poll(() => caMai(page)).toBeCloseTo(421.875 / 2, 6);
});

test("[T06] changer un prix, ajouter ou supprimer une plantation recalcule le tableau", async ({ page }) => {
  await page.goto("index.html");
  await saisirS2(page);

  await page.locator("#liste-cultures li", { hasText: "courgette" }).locator('[data-action="modifier"]').click();
  await page.locator("#culture-prix").fill("4");
  await page.locator("#culture-ajouter").click();
  await expect.poll(() => caMai(page)).toBeCloseTo(168.75 * 4, 6);

  await ajouterPlantation(page, { variete: "Black Beauty", espace: "planche 1", surface: 100, date: "2026-03-01" });
  await expect.poll(() => caMai(page)).toBeCloseTo(2 * 168.75 * 4, 6);

  const supprimer = page.locator('#liste-plantations [data-action="supprimer"]');
  while (await supprimer.count()) await supprimer.first().click();
  await expect(page.locator("#tableau")).toBeHidden();
  await expect(page.locator("#tableau-vide")).toBeVisible();
});

test("[T06] une modification faite dans un autre onglet recalcule le tableau ouvert, sans l'écraser ensuite", async ({ context }) => {
  const premier = await context.newPage();
  await premier.goto("index.html");
  await saisirS2(premier);
  const second = await context.newPage();
  await second.goto("index.html");
  expect(await caMai(second)).toBeCloseTo(421.875, 6);

  await premier.locator("#liste-plantations li", { hasText: "Black Beauty" }).locator('[data-action="modifier"]').click();
  await premier.locator("#plantation-surface").fill("50");
  await premier.locator("#plantation-ajouter").click();
  await expect.poll(() => caMai(second)).toBeCloseTo(421.875 / 2, 6);

  // Une saisie dans le second onglet ne doit pas effacer la modification faite dans le premier.
  await ajouterEspace(second, { nom: "planche 2", surface: 30 });
  const troisieme = await context.newPage();
  await troisieme.goto("index.html");
  await expect(troisieme.locator("#liste-espaces")).toContainText("planche 2");
  expect(await caMai(troisieme)).toBeCloseTo(421.875 / 2, 6);
});
