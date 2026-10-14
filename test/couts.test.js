// Tranche N3 — coûts de culture (T45 : EX-47, scénario S12) ; besoins en semences et plants (T47 : EX-49, scénario S12).
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Calc = require("../src/calc.js");

function proche(obtenu, attendu, message) {
  assert.ok(Math.abs(obtenu - attendu) < 1e-9, `${message || ""} ${obtenu} ≠ ${attendu}`);
}
function procheFourchette(obtenue, attendue, message) {
  for (const cle of ["basse", "mediane", "haute"]) proche(obtenue[cle], attendue[cle], `${message || ""} ${cle}`);
}
const f = (basse, mediane = basse, haute = mediane) => ({ basse, mediane, haute });

// Scénario S1 de N1 : courgette, 100 m² plantés le 1er mars 2026 ; chiffre d'affaires 540 / 675 / 810 €.
const COURGETTE = { id: "c1", nom: "courgette", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10 };
// Scénario S12 : en plants, 1 plant par m² à 0,30 / 0,40 / 0,50 €, 0,20 € d'intrants par m².
const COURGETTE_S12 = { ...COURGETTE, implantation: "plant", densite: 1, prixUnite: f(0.3, 0.4, 0.5), intrants: f(0.2) };
const VARIETE = { id: "v1", cultureId: "c1", nom: "Black Beauty", rendement: null, prix: null, joursAvantRecolte: null, semainesRecolte: null, pertes: null };
const ESPACE = { id: "e1", nom: "planche 1", surface: 100, type: "plein_champ" };
const PLANTATION = { id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" };
const S1 = { espaces: [ESPACE], cultures: [COURGETTE], varietes: [VARIETE], plantations: [PLANTATION] };
const S12 = { ...S1, cultures: [COURGETTE_S12] };

test("[T45] S12 : les coûts de culture d'une plantation : plants 30 / 40 / 50 € + intrants 20 € = 50 / 60 / 70 €", () => {
  procheFourchette(Calc.coutsDeCulture(PLANTATION, COURGETTE_S12), f(50, 60, 70));
  procheFourchette(Calc.coutsDeCulture(PLANTATION, { ...COURGETTE_S12, intrants: null }), f(30, 40, 50));
  procheFourchette(Calc.coutsDeCulture(PLANTATION, { ...COURGETTE_S12, densite: null }), f(20));
  procheFourchette(Calc.coutsDeCulture(PLANTATION, COURGETTE), f(0));
  // Par m² : 1 × 0,30 / 0,40 / 0,50 + 0,20.
  procheFourchette(Calc.coutParM2(COURGETTE_S12), f(0.5, 0.6, 0.7));
  assert.equal(Calc.coutParM2(COURGETTE), null);
});

test("[T45] S12 : le tableau déduit les coûts de culture au mois de mise en place : mars 2026 apparaît, la marge de la courgette vaut 470 / 615 / 760 €", () => {
  const t = Calc.tableau(S12);
  assert.equal(t.mois[0], "2026-03");
  const [courgette] = t.lignes;
  procheFourchette(courgette.mois["2026-03"].couts, f(50, 60, 70));
  procheFourchette(courgette.mois["2026-03"].ca, f(0));
  procheFourchette(courgette.mois["2026-03"].marge, f(-70, -60, -50));
  procheFourchette(courgette.total.ca, f(540, 675, 810));
  procheFourchette(courgette.total.couts, f(50, 60, 70));
  procheFourchette(courgette.total.marge, f(470, 615, 760));
  // La ferme : chiffre d'affaires − coûts de culture (aucune séance, aucun lot).
  procheFourchette(t.total.total.cultures, f(50, 60, 70));
  procheFourchette(t.total.total.marge, f(470, 615, 760));
  procheFourchette(t.total.mois["2026-03"].cultures, f(50, 60, 70));
  procheFourchette(t.total.mois["2026-03"].marge, f(-70, -60, -50));
  procheFourchette(t.total.mois["2026-05"].cultures, f(0));
});

test("[T45] EX-47 : les chiffres clés comptent les coûts de culture parmi les coûts déduits", () => {
  const cles = Calc.chiffresCles(Calc.tableau(S12));
  procheFourchette(cles.couts.cultures, f(50, 60, 70));
  procheFourchette(cles.couts.total, f(50, 60, 70));
  assert.equal(cles.couts.seances, null);
  procheFourchette(cles.marge, f(470, 615, 760));
});

test("[T45] sans_cout_comme_r1 : sans coût de culture, le tableau et les chiffres clés gardent exactement leur forme", () => {
  const sans = Calc.tableau(S1);
  assert.deepEqual(Calc.tableau({ ...S1, cultures: [{ ...COURGETTE, implantation: "", densite: null, prixUnite: null, intrants: null }] }), sans);
  assert.equal(sans.mois[0], "2026-05"); // la première semaine de récolte (30 avril au 6 mai) compte en mai
  assert.deepEqual(Object.keys(sans.lignes[0].total).sort(), ["ca", "marge", "volume"]);
  assert.deepEqual(Object.keys(sans.total.total).sort(), ["ca", "couts", "marge"]);
  assert.deepEqual(Object.keys(Calc.chiffresCles(sans).couts).sort(), ["aliment", "seances", "total"]);
  // Une densité sans prix ne coûte rien : rien ne change.
  assert.deepEqual(Calc.tableau({ ...S1, cultures: [{ ...COURGETTE, implantation: "plant", densite: 1 }] }), sans);
});

// ---- T47 : besoins en semences et plants (EX-49, scénario S12)

test("[T47] S12 : 100 plants de courgette à prévoir en mars 2026, pour 30 / 40 / 50 €", () => {
  const besoins = Calc.besoins(S12);
  assert.equal(besoins.length, 1);
  const [b] = besoins;
  assert.deepEqual({ plantationId: b.plantationId, date: b.date, mois: b.mois, cultureId: b.cultureId, varieteId: b.varieteId, implantation: b.implantation, quantite: b.quantite },
    { plantationId: "p1", date: "2026-03-01", mois: "2026-03", cultureId: "c1", varieteId: "v1", implantation: "plant", quantite: 100 });
  procheFourchette(b.cout, f(30, 40, 50));
});

test("[T47] EX-49 : seules les cultures qui ont une densité ont des besoins ; sans prix, le coût est inconnu ; la liste suit les dates", () => {
  assert.deepEqual(Calc.besoins(S1), []);
  const [sansPrix] = Calc.besoins({ ...S12, cultures: [{ ...COURGETTE_S12, prixUnite: null }] });
  assert.equal(sansPrix.quantite, 100);
  assert.equal(sansPrix.cout, null);
  const deux = Calc.besoins({ ...S12, plantations: [{ ...PLANTATION, id: "p2", date: "2026-04-15", surface: 30 }, PLANTATION, { ...PLANTATION, id: "p3", supprimeLe: "2026-10-14T00:00:00.000Z" }] });
  assert.deepEqual(deux.map((b) => [b.plantationId, b.quantite]), [["p1", 100], ["p2", 30]]);
});

test("[T47] EX-49 : les besoins se regroupent par mois, avec le coût connu de chaque mois et de la saison", () => {
  const plantations = [PLANTATION, { ...PLANTATION, id: "p2", date: "2026-03-20", surface: 12.5 }, { ...PLANTATION, id: "p3", date: "2026-04-15", surface: 30 }];
  const { mois, cout } = Calc.besoinsParMois({ ...S12, plantations });
  assert.deepEqual(mois.map((m) => [m.mois, m.besoins.map((b) => b.quantite)]), [["2026-03", [100, 12.5]], ["2026-04", [30]]]);
  procheFourchette(mois[0].cout, f(33.75, 45, 56.25));
  procheFourchette(mois[1].cout, f(9, 12, 15));
  procheFourchette(cout, f(42.75, 57, 71.25));
  const sansPrix = Calc.besoinsParMois({ ...S12, cultures: [{ ...COURGETTE_S12, prixUnite: null }] });
  assert.equal(sansPrix.mois[0].cout, null);
  assert.equal(sansPrix.cout, null);
  assert.deepEqual(Calc.besoinsParMois(S1), { mois: [], cout: null });
});
