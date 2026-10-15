// Tranche P2 — synthèse (T34) : les chiffres clés de la saison, sans navigateur.
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Store = require("../src/store.js");
const Calc = require("../src/calc.js");
const Exemple = require("../src/exemple.js");

function f(basse, mediane = basse, haute = mediane) {
  return { basse, mediane, haute };
}

function fermeExemple() {
  const valeurs = new Map();
  const ferme = Store.ouvrir({ getItem: (c) => (valeurs.has(c) ? valeurs.get(c) : null), setItem: (c, v) => valeurs.set(c, String(v)) });
  Exemple.charger(ferme, 2026);
  const donnees = {};
  for (const objet of Store.OBJETS) donnees[objet] = ferme.lister(objet);
  return donnees;
}

// Un tableau réduit à ce que lit chiffresCles : le total de la saison et l'atelier poules.
function tableauDe(total, poules = null) {
  return { mois: [], lignes: [], poules, total: { mois: {}, total } };
}

test("[T34] EX-33 : les chiffres clés reprennent le total de la saison du tableau, coûts comptés en somme des séances et de l'aliment", () => {
  const tableau = Calc.tableau(fermeExemple());
  const cles = Calc.chiffresCles(tableau);
  const { ca, couts, aliment, marge, cultures } = tableau.total.total;
  assert.deepEqual(cles.ca, ca);
  assert.deepEqual(cles.marge, marge);
  assert.deepEqual(cles.couts.seances, couts);
  assert.deepEqual(cles.couts.aliment, aliment);
  for (const niveau of ["basse", "mediane", "haute"]) {
    assert.ok(Math.abs(cles.couts.total[niveau] - (couts[niveau] + aliment[niveau] + (cultures ? cultures[niveau] : 0))) < 1e-9, niveau);
  }
  assert.deepEqual(cles.oeufs, { volume: tableau.poules.total.volume, vendus: true, effectif: 200, lots: 2 });
  // Le chiffre d'affaires se partage entre les cultures et les œufs.
  assert.deepEqual(cles.parts.oeufs, tableau.poules.total.ca);
  for (const niveau of ["basse", "mediane", "haute"]) {
    const cultures = tableau.lignes.reduce((s, l) => s + l.total.ca[niveau], 0);
    assert.ok(Math.abs(cles.parts.cultures[niveau] - cultures) < 1e-9, niveau);
    assert.ok(Math.abs(cles.parts.cultures[niveau] + cles.parts.oeufs[niveau] - ca[niveau]) < 1e-9, niveau);
  }
});

test("[T34] sans séance ni poule, aucun coût n'est compté et il n'y a pas d'œufs", () => {
  const cles = Calc.chiffresCles(tableauDe({ ca: f(540, 675, 810), couts: f(0), marge: f(540, 675, 810) }));
  assert.deepEqual(cles.couts, { total: f(0), seances: null, aliment: null });
  assert.equal(cles.oeufs, null);
  assert.deepEqual(cles.parts, { cultures: f(0), oeufs: null });
});

test("[T34] avec des poules et sans séance, les coûts sont l'aliment seul ; des œufs vendus sont signalés comme tels", () => {
  const poules = { lots: 2, effectif: 140, aDebouche: true, mois: {}, total: { volume: f(500, 600, 700), ca: f(250, 300, 350), aliment: f(90, 100, 120), marge: f(130, 200, 260) } };
  const cles = Calc.chiffresCles(tableauDe({ ca: f(250, 300, 350), couts: f(0), aliment: f(90, 100, 120), marge: f(130, 200, 260) }, poules));
  assert.deepEqual(cles.couts, { total: f(90, 100, 120), seances: null, aliment: f(90, 100, 120) });
  assert.deepEqual(cles.oeufs, { volume: f(500, 600, 700), vendus: true, effectif: 140, lots: 2 });
});

test("[T34] EX-33 : le meilleur mois et les mois de marge médiane négative viennent du calcul, pas du rendu", () => {
  const mois = ["2026-03", "2026-04", "2026-05"];
  const tableau = {
    mois, lignes: [], poules: null,
    total: {
      mois: {
        "2026-03": { ca: f(0), marge: f(-40, -25, 5) },
        "2026-04": { ca: f(500, 800, 900), marge: f(100, 300, 400) },
        "2026-05": { ca: f(600, 700, 1200), marge: f(-10, -5, 50) },
      },
      total: { ca: f(1100, 1500, 2100), couts: f(0), marge: f(50, 270, 455) },
    },
  };
  const cles = Calc.chiffresCles(tableau);
  assert.equal(cles.meilleurMois, "2026-04");
  assert.deepEqual(cles.moisMargeNegative, ["2026-03", "2026-05"]);

  // Sans aucune vente, pas de meilleur mois.
  const vide = Calc.chiffresCles({ mois: ["2026-03"], lignes: [], poules: null, total: { mois: { "2026-03": { ca: f(0), marge: f(0) } }, total: { ca: f(0), couts: f(0), marge: f(0) } } });
  assert.equal(vide.meilleurMois, null);
  assert.deepEqual(vide.moisMargeNegative, []);
});
