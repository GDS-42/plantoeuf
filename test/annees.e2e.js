// Tranche R3 — plusieurs années, dans le navigateur (T53 : calcul par année dans le fichier livré).
const { test, expect } = require("@playwright/test");

test("[T53] EX-56 : le fichier livré calcule une année à la fois, la semaine du nouvel an comptant dans l'année de son jeudi", async ({ page }) => {
  await page.goto("index.html");
  const resultat = await page.evaluate(() => {
    const f = (basse, mediane = basse, haute = mediane) => ({ basse, mediane, haute });
    const donnees = {
      cultures: [{ id: "c1", nom: "courgette", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10 }],
      varietes: [{ id: "v1", cultureId: "c1", nom: "Black Beauty" }],
      plantations: [{ id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" }, { id: "p2", varieteId: "v1", espaceId: "e1", surface: 100, date: "2027-03-01" }],
      pointsVente: [{ id: "pv1", nom: "marché", distanceKm: 12, coutKm: f(0.4) }],
      seances: [{ id: "s1", pointVenteId: "pv1", jour: 6, debut: "2027-01-02", fin: "2027-03-27", frais: f(15) }],
      charges: [{ id: "ch1", nom: "Cotisation", montant: f(150), periodicite: "mois" }],
    };
    const t2026 = Calc.tableau(donnees, { annee: 2026 });
    const t2027 = Calc.tableau(donnees, { annee: 2027 });
    return { annees: Calc.annees(donnees), mois2026: t2026.mois, mois2027: t2027.mois, decembre: t2026.total.mois["2026-12"].couts.mediane };
  });
  expect(resultat.annees).toEqual([2026, 2027]);
  expect(resultat.mois2026[0]).toBe("2026-01");
  expect(resultat.mois2026[11]).toBe("2026-12");
  expect(resultat.mois2027).toHaveLength(12);
  expect(resultat.mois2027[0]).toBe("2027-01");
  expect(resultat.decembre).toBeCloseTo(24.6, 6);
});

test("[T54] EX-60 : la ferme d'exemple chargée en 2027 montre janvier à décembre 2027, sans colonne de décembre 2026", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2027-05-20T10:00:00+04:00"));
  await page.goto("index.html");
  await page.locator("#charger-exemple").click();
  await expect(page.locator("#bandeau-exemple")).toBeVisible();
  await page.evaluate(() => { location.hash = "synthese"; });
  const mois = page.locator("#tableau thead th[data-mois]:not(.col-total)");
  await expect(mois).toHaveCount(12);
  await expect(mois.first()).toHaveAttribute("data-mois", "2027-01");
  await expect(mois.last()).toHaveAttribute("data-mois", "2027-12");
  await expect(page.locator('#tableau thead th[data-mois="2026-12"]')).toHaveCount(0);
});
