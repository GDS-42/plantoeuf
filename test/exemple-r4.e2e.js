// Tranche R4 — les règles de rotation de la ferme d'exemple (T63 : EX-66, S21), dans le navigateur.
const { test, expect } = require("@playwright/test");
const { aller } = require("./outils.js");

async function exemple(page) {
  await page.clock.setFixedTime(new Date("2026-05-20T10:00:00+04:00"));
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#bandeau-exemple")).toBeVisible();
}

test("[T63] S21, EX-66 : la ferme d'exemple montre ses familles, ses associations et sa rotation sur la page Cultures", async ({ page }) => {
  await exemple(page);
  await aller(page, "cultures");
  await expect(page.locator("#section-familles .compte")).toHaveText("7");
  await expect(page.locator("#section-associations .compte")).toHaveText("27");
  await expect(page.locator("#section-rotations .compte")).toHaveText("1");
  await expect(page.locator("#familles-manquantes")).toBeHidden();
  await expect(page.locator('#liste-cultures [data-fait="groupe"]')).toHaveCount(11);
  await expect(page.locator("#liste-familles li", { hasText: "Solanacées" }).locator('[data-fait="delai"]')).toContainText("4 ans");
  await expect(page.locator("#liste-rotations li")).toContainText(/fruit.*feuille.*racine.*bulbe.*légumineuse.*engrais vert/);
});

test("[T63] S21 : la ferme d'exemple signale les retours trop tôt des deux tunnels et de la Parcelle 2, et les précédents défavorables des tunnels", async ({ page }) => {
  await exemple(page);
  await aller(page, "espaces");
  const alertes = page.locator("#liste-espaces li").filter({ has: page.locator(".alerte-rotation") });
  await expect(alertes).toHaveCount(3);
  for (const nom of ["Tunnel 1", "Tunnel 2", "Parcelle 2"]) {
    await expect(page.locator("#liste-espaces li", { hasText: nom }).locator(".alerte-rotation")).toContainText(/retour trop tôt/i);
  }
  await aller(page, "plantations");
  await expect(page.locator("#calendrier .cal-barre.cal-retour")).toHaveCount(10);
  await expect(page.locator("#calendrier-legende")).toContainText(/retour trop tôt/i);
  await expect(page.locator("#liste-plantations .alerte-rotation", { hasText: /retour trop tôt/i })).toHaveCount(10);
  await expect(page.locator("#liste-plantations .alerte-rotation", { hasText: /précédent défavorable/i })).toHaveCount(4);
  // « Que planter ici ? » répond pour chaque espace de l'exemple.
  await page.locator('#calendrier .cal-ligne', { hasText: "Parcelle 4" }).locator("[data-que-planter]").click();
  await expect(page.locator("#tiroir-que-planter")).toBeVisible();
  await expect(page.locator("#que-planter-liste > li")).toHaveCount(11);
});

test("[T63] EX-66 : effacer la ferme d'exemple retire ses règles de rotation", async ({ page }) => {
  await exemple(page);
  await page.locator("#effacer-exemple").click();
  await aller(page, "cultures");
  await expect(page.locator("#familles-vide")).toBeVisible();
  await expect(page.locator("#associations-vide")).toBeVisible();
  await expect(page.locator("#rotations-vide")).toBeVisible();
  const restes = await page.evaluate(() => {
    const ferme = Store.ouvrir(localStorage);
    return ["familles", "associations", "rotations"].map((objet) => ferme.lister(objet).length);
  });
  expect(restes).toEqual([0, 0, 0]);
});
