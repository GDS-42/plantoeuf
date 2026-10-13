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
