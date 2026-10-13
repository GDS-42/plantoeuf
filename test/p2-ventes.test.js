// Tranche P2 — ventes (T35) : bilan de la saison par produit, sans navigateur.
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Calc = require("../src/calc.js");

function f(basse, mediane = basse, haute = mediane) {
  return { basse, mediane, haute };
}

// Une semaine de la vue « Offre et demande », comme la rend Calc.offreDemande.
function semaine(etat, { offre = f(10), demande = f(5), sur = false } = {}) {
  if (etat === "sans_debouche") return { offre, demande: null, ecart: null, etat, sur: false };
  return { offre, demande, ecart: offre.mediane - demande.mediane, etat, sur };
}

test("[T35] bilan de la saison : semaines en excédent, en manque (dont sûres), à l'équilibre et sans débouché, par produit", () => {
  const lundis = ["2026-04-27", "2026-05-04", "2026-05-11", "2026-05-18", "2026-05-25", "2026-06-01"];
  const od = {
    semaines: lundis,
    lignes: [
      {
        produitId: "c1", nom: "courgette", unite: "kg",
        semaines: {
          "2026-04-27": semaine("depasse", { offre: f(30, 34, 40), demande: f(15, 20, 25), sur: true }),
          "2026-05-04": semaine("depasse", { offre: f(20, 24, 30), demande: f(15, 20, 25) }),
          "2026-05-11": semaine("manque", { offre: f(0), demande: f(15, 20, 25), sur: true }),
          "2026-05-18": semaine("manque", { offre: f(10, 18, 30), demande: f(15, 20, 25) }),
          "2026-05-25": semaine("equilibre", { offre: f(20), demande: f(20) }),
          // Ni production ni demande : la semaine ne compte nulle part.
          "2026-06-01": semaine("equilibre", { offre: f(0), demande: f(0) }),
        },
      },
      {
        produitId: "oeufs", nom: null, unite: null,
        semaines: Object.fromEntries(lundis.map((l, i) => [l, semaine("sans_debouche", { offre: i < 4 ? f(400, 480, 520) : f(0) })])),
      },
    ],
  };

  assert.deepEqual(Calc.bilanOffreDemande(od), [
    { produitId: "c1", depasse: 2, depasseSur: 1, manque: 2, manqueSur: 1, equilibre: 1, sansDebouche: 0 },
    { produitId: "oeufs", depasse: 0, depasseSur: 0, manque: 0, manqueSur: 0, equilibre: 0, sansDebouche: 4 },
  ]);
});

test("[T35] bilan de la saison : rien à confronter, aucun produit", () => {
  assert.deepEqual(Calc.bilanOffreDemande({ semaines: [], lignes: [] }), []);
});

test("[T35] le mois d'une semaine est celui de son jeudi ; une semaine qui change de mois ouvre un nouveau mois", () => {
  assert.equal(Calc.moisDuJeudi("2026-04-27"), "2026-04");
  assert.equal(Calc.moisDuJeudi("2026-06-29"), "2026-07");
  assert.equal(Calc.moisDuJeudi("2025-12-29"), "2026-01");
  const semaines = ["2026-04-20", "2026-04-27", "2026-05-04", "2026-05-25", "2026-06-01", "2026-06-29"];
  assert.deepEqual(Calc.debutsDeMois(semaines), ["2026-05-04", "2026-06-01", "2026-06-29"]);
  assert.deepEqual(Calc.debutsDeMois([]), []);
});

test("[T35] nombre de débouchés de chaque point de vente : les débouchés supprimés ne comptent pas", () => {
  const supprime = "2026-10-13T08:00:00.000Z";
  const debouches = [
    { id: "d1", pointVenteId: "pv1", produitId: "c1" },
    { id: "d2", pointVenteId: "pv1", produitId: "c2" },
    { id: "d3", pointVenteId: "pv2", produitId: "c1" },
    { id: "d4", pointVenteId: "pv2", produitId: "c2", supprimeLe: supprime },
  ];
  const nombres = Calc.nombreDeDebouches({ debouches });
  assert.equal(nombres.get("pv1"), 2);
  assert.equal(nombres.get("pv2"), 1);
  assert.equal(nombres.has("pv3"), false);
  assert.equal(Calc.nombreDeDebouches({}).size, 0);
});
