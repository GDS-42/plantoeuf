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
