// T01 — squelette : le fichier assemblé dist/index.html, ouvert en file://.
const { test, expect } = require("@playwright/test");
const { ouvrir, aller } = require("./outils.js");

test("[T01] un espace créé est retrouvé après fermeture et réouverture du fichier", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("index.html");
  await ouvrir(page, "espaces");
  await page.locator("#espace-nom").fill("planche 1");
  await page.locator("#espace-surface").fill("30");
  await page.locator("#espace-type").selectOption("abri");
  await page.locator("#espace-ajouter").click();
  await expect(page.locator("#liste-espaces")).toContainText("planche 1");
  await page.close();

  const reouverte = await context.newPage();
  await reouverte.goto("index.html");
  await aller(reouverte, "espaces");
  await expect(reouverte.locator("#liste-espaces")).toContainText("planche 1");
});

test("[T01] le fichier assemblé ne charge aucune autre ressource", async ({ page }) => {
  const requetes = [];
  page.on("request", (requete) => requetes.push(requete.url()));
  await page.goto("index.html");
  await expect(page.locator("#navigation")).toBeVisible();

  expect(requetes).toEqual([page.url()]);
});
