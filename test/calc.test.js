// Logique de calcul pure (calc.js), sans navigateur.
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Calc = require("../src/calc.js");

const PRECISION = 1e-9;

function proche(obtenu, attendu, message) {
  assert.ok(Math.abs(obtenu - attendu) < PRECISION, `${message || ""} ${obtenu} ≠ ${attendu}`);
}

function procheFourchette(obtenue, attendue, message) {
  for (const cle of ["basse", "mediane", "haute"]) proche(obtenue[cle], attendue[cle], `${message || ""} ${cle}`);
}

function f(basse, mediane = basse, haute = mediane) {
  return { basse, mediane, haute };
}

// Scénario S1 : courgette à 3 kg/m², 10 % de pertes, 60 jours avant récolte, 8 semaines de récolte ;
// plantation de 100 m² le 1er mars.
const COURGETTE = {
  id: "c1",
  nom: "courgette",
  unite: "kg",
  rendement: f(3),
  prix: f(2, 2.5, 3),
  joursAvantRecolte: 60,
  semainesRecolte: 8,
  pertes: 10,
};
const SANS_SURCHARGE = { id: "v1", cultureId: "c1", nom: "courgette", rendement: null, prix: null, joursAvantRecolte: null, semainesRecolte: null, pertes: null };
const PLANTATION_S1 = { id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" };

test("[T04] les dates se calculent au jour près, y compris d'une année sur l'autre", () => {
  assert.equal(Calc.ajouterJours("2026-03-01", 60), "2026-04-30");
  assert.equal(Calc.ajouterJours("2027-12-20", 75), "2028-03-04");
  assert.equal(Calc.ajouterJours("2026-04-30", -1), "2026-04-29");
});

test("[T04] EX-02 : une variété sans surcharge reprend les durées de la culture", () => {
  const p = Calc.parametres(COURGETTE, SANS_SURCHARGE);
  assert.deepEqual(p, { rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10 });
  assert.deepEqual(Calc.datesRecolte(PLANTATION_S1, p), { debut: "2026-04-30", fin: "2026-06-24" });
});

test("[T04] EX-02 : les durées surchargées par la variété priment sur celles de la culture", () => {
  const variete = { ...SANS_SURCHARGE, joursAvantRecolte: 45, semainesRecolte: 4, rendement: f(2, 2.5, 3) };
  const p = Calc.parametres(COURGETTE, variete);
  assert.equal(p.joursAvantRecolte, 45);
  assert.equal(p.semainesRecolte, 4);
  assert.deepEqual(p.rendement, f(2, 2.5, 3));
  assert.equal(p.pertes, 10);
  assert.deepEqual(Calc.datesRecolte(PLANTATION_S1, p), { debut: "2026-04-15", fin: "2026-05-12" });
});

test("[T04] EX-03 : production = surface × rendement × (1 − pertes), en fourchette", () => {
  const p = Calc.parametres(COURGETTE, { ...SANS_SURCHARGE, rendement: f(2, 3, 4) });
  procheFourchette(Calc.productionTotale(PLANTATION_S1, p), f(180, 270, 360));
});

test("[T04] S1 : 33,75 kg par semaine du 30 avril au 24 juin", () => {
  const p = Calc.parametres(COURGETTE, SANS_SURCHARGE);
  const semaines = Calc.productionHebdomadaire(PLANTATION_S1, p);

  assert.deepEqual(semaines.map((s) => [s.debut, s.fin]), [
    ["2026-04-30", "2026-05-06"],
    ["2026-05-07", "2026-05-13"],
    ["2026-05-14", "2026-05-20"],
    ["2026-05-21", "2026-05-27"],
    ["2026-05-28", "2026-06-03"],
    ["2026-06-04", "2026-06-10"],
    ["2026-06-11", "2026-06-17"],
    ["2026-06-18", "2026-06-24"],
  ]);
  for (const semaine of semaines) {
    procheFourchette(semaine.volume, f(33.75), semaine.debut);
    procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, semaine.debut, semaine.fin), f(33.75), semaine.debut);
  }
});

test("[T04] S1 : 0 kg les autres semaines (production_nulle_hors_fenetre)", () => {
  const p = Calc.parametres(COURGETTE, SANS_SURCHARGE);
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-04-23", "2026-04-29"), f(0));
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-06-25", "2026-07-01"), f(0));
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-03-01", "2026-04-29"), f(0));
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-06-25", "2027-06-24"), f(0));
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2025-01-01", "2025-12-31"), f(0));
});

test("[T04] EX-03 : la répartition est uniforme, à la semaine, et rend toute la production sur la fenêtre", () => {
  const p = Calc.parametres(COURGETTE, { ...SANS_SURCHARGE, rendement: f(2, 3, 4) });
  const total = Calc.productionTotale(PLANTATION_S1, p);
  for (const semaine of Calc.productionHebdomadaire(PLANTATION_S1, p)) {
    procheFourchette(semaine.volume, f(180 / 8, 270 / 8, 360 / 8), semaine.debut);
  }
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-01-01", "2026-12-31"), total);
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-04-30", "2026-06-24"), total);
});

test("[T04] granularité à la semaine : une semaine compte entière dans la période qui contient la plupart de ses jours", () => {
  const p = Calc.parametres(COURGETTE, SANS_SURCHARGE);
  // Semaine du 30 avril au 6 mai : 1 jour en avril, 6 en mai → mai. Semaine du 28 mai au 3 juin : 4 jours en mai → mai.
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-04-01", "2026-04-30"), f(0));
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-05-01", "2026-05-31"), f(5 * 33.75));
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-06-01", "2026-06-30"), f(3 * 33.75));
  // Une période plus courte que la semaine ne reçoit que les semaines dont elle contient le jour du milieu.
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-04-30", "2026-05-02"), f(0));
  procheFourchette(Calc.productionSurPeriode(PLANTATION_S1, p, "2026-05-03", "2026-05-03"), f(33.75));
});
