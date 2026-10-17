// Tranche R5 — déplacer une plantation dans le calendrier, dans le navigateur.
const { test, expect } = require("@playwright/test");

test("[T65] EX-68 : le fichier livré calcule les conséquences d'un déplacement", async ({ page }) => {
  await page.goto("index.html");
  const r = await page.evaluate(() => {
    const f = (b, m = b, h = m) => ({ basse: b, mediane: m, haute: h });
    const d = {
      espaces: [{ id: "p1", nom: "planche 1", surface: 30 }, { id: "p2", nom: "planche 2", surface: 30 }],
      familles: [{ id: "fs", nom: "Solanacées", delaiRetour: f(2, 3, 4) }],
      cultures: [{ id: "t", nom: "tomate", famille: "Solanacées", unite: "kg", rendement: f(3), prix: f(2), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 10 }],
      varietes: [{ id: "vt", cultureId: "t", nom: "Heatmaster" }],
      plantations: [{ id: "a", varieteId: "vt", espaceId: "p1", surface: 30, date: "2026-03-01" }, { id: "b", varieteId: "vt", espaceId: "p2", surface: 30, date: "2027-03-01" }],
    };
    const c = Calc.consequencesDeplacement(d, "b", { date: "2027-03-15", espaceId: "p1" });
    return { retours: c.retours.map((x) => x.plantationId), levees: c.levees };
  });
  expect(r).toEqual({ retours: ["b"], levees: 0 });
});
