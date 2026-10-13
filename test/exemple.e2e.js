// T09 — EX-10 : à la première ouverture, une ferme d'exemple de 10 plantations est proposée,
// et s'efface d'un geste.
const { test, expect } = require("@playwright/test");
const { ajouterEspace } = require("./outils.js");

test("[T09] à la première ouverture, la ferme d'exemple est proposée et se charge d'un clic : 10 plantations et le tableau", async ({ page }) => {
  await page.goto("index.html");
  await expect(page.locator("#proposition-exemple")).toBeVisible();
  await expect(page.locator("#proposition-exemple")).toContainText("Réunion");

  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
  await expect(page.locator("#tableau")).toBeVisible();
  await expect(page.locator("#proposition-exemple")).toBeHidden();
  await expect(page.locator("#bandeau-exemple")).toBeVisible();
  await expect(page.locator(".sur-occupation")).toHaveCount(0);
});

test("[T09] la ferme d'exemple s'efface d'un geste, sans toucher à ce que l'utilisateur a ajouté", async ({ page }) => {
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#liste-plantations li")).toHaveCount(10);
  await ajouterEspace(page, { nom: "ma planche", surface: 20 });

  await page.locator("#effacer-exemple").click();

  await expect(page.locator("#liste-plantations li")).toHaveCount(0);
  await expect(page.locator("#liste-espaces li")).toHaveCount(1);
  await expect(page.locator("#liste-espaces")).toContainText("ma planche");
  await expect(page.locator("#tableau")).toBeHidden();
  await expect(page.locator("#bandeau-exemple")).toBeHidden();
  const plantations = await page.evaluate(() => JSON.parse(localStorage.getItem("plantoeuf")).plantations);
  expect(plantations).toHaveLength(10);
  expect(plantations.every((p) => p.supprimeLe)).toBe(true);
});

test("[T09] une ferme commencée ne propose plus l'exemple, même après réouverture ; une ferme vidée le propose de nouveau", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await ajouterEspace(page, { nom: "planche 1", surface: 30 });
  await expect(page.locator("#proposition-exemple")).toBeHidden();
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await expect(reouverte.locator("#liste-espaces")).toContainText("planche 1");
  await expect(reouverte.locator("#proposition-exemple")).toBeHidden();

  await reouverte.locator("#liste-espaces li", { hasText: "planche 1" }).locator('[data-action="supprimer"]').click();
  await expect(reouverte.locator("#proposition-exemple")).toBeVisible();
});
