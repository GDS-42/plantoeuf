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

// ---- T05 : tableau économique par culture et par mois (EX-04, scénario S2)

function fermeS2(complements = {}) {
  return {
    cultures: [COURGETTE, ...(complements.cultures || [])],
    varietes: [SANS_SURCHARGE, ...(complements.varietes || [])],
    plantations: [PLANTATION_S1, ...(complements.plantations || [])],
  };
}

function ordonnee(fourchette) {
  return fourchette.basse <= fourchette.mediane && fourchette.mediane <= fourchette.haute;
}

test("[T05] S2 : en mai, le CA de la courgette est une fourchette dont la médiane vaut le volume de mai × 2,50 €", () => {
  const tableau = Calc.tableau(fermeS2());
  const ligne = tableau.lignes.find((l) => l.cultureId === "c1");
  const mai = ligne.mois["2026-05"];

  procheFourchette(mai.volume, f(5 * 33.75));
  assert.ok(ordonnee(mai.ca));
  assert.ok(mai.ca.basse < mai.ca.haute);
  proche(mai.ca.mediane, mai.volume.mediane * 2.5);
  procheFourchette(mai.ca, f(5 * 33.75 * 2, 5 * 33.75 * 2.5, 5 * 33.75 * 3));
});

test("[T05] EX-04 : par culture et par mois, volume, CA et marge en fourchette ; marge égale au CA en N1", () => {
  const tableau = Calc.tableau(fermeS2());
  assert.deepEqual(tableau.mois, ["2026-05", "2026-06"]);
  assert.equal(tableau.lignes.length, 1);
  const [ligne] = tableau.lignes;
  assert.equal(ligne.nom, "courgette");
  assert.equal(ligne.unite, "kg");
  assert.deepEqual(Object.keys(ligne.mois), ["2026-05", "2026-06"]);

  procheFourchette(ligne.mois["2026-06"].volume, f(3 * 33.75));
  procheFourchette(ligne.mois["2026-06"].ca, f(3 * 33.75 * 2, 3 * 33.75 * 2.5, 3 * 33.75 * 3));
  procheFourchette(ligne.total.volume, f(270));
  procheFourchette(ligne.total.ca, f(540, 675, 810));
  for (const cle of [...tableau.mois.map((m) => ligne.mois[m]), ligne.total]) {
    assert.deepEqual(cle.marge, cle.ca);
    assert.ok(ordonnee(cle.volume) && ordonnee(cle.ca) && ordonnee(cle.marge));
  }
});

test("[T05] le CA se calcule plantation par plantation, au prix de sa variété", () => {
  const variete = { ...SANS_SURCHARGE, id: "v2", nom: "Ronde de Nice", prix: f(4) };
  const tableau = Calc.tableau(fermeS2({ varietes: [variete], plantations: [{ ...PLANTATION_S1, id: "p2", varieteId: "v2" }] }));
  const [ligne] = tableau.lignes;
  procheFourchette(ligne.total.volume, f(540));
  procheFourchette(ligne.total.ca, f(270 * 2 + 270 * 4, 270 * 2.5 + 270 * 4, 270 * 3 + 270 * 4));
});

test("[T05] une ligne par culture, rangée par nom, et le total de la ferme par mois", () => {
  const brede = { ...COURGETTE, id: "c2", nom: "brède", unite: "botte", rendement: f(10), prix: f(1, 1.5, 2), joursAvantRecolte: 30, semainesRecolte: 2, pertes: 0 };
  const tableau = Calc.tableau(fermeS2({
    cultures: [brede],
    varietes: [{ ...SANS_SURCHARGE, id: "v2", cultureId: "c2" }],
    plantations: [{ ...PLANTATION_S1, id: "p2", varieteId: "v2", surface: 10, date: "2026-05-01" }],
  }));
  assert.deepEqual(tableau.lignes.map((l) => l.nom), ["brède", "courgette"]);
  // Brède : 100 bottes du 31 mai au 13 juin, 50 par semaine ; semaines du 31 mai et du 7 juin → juin.
  const ligneBrede = tableau.lignes[0];
  procheFourchette(ligneBrede.mois["2026-05"].volume, f(0));
  procheFourchette(ligneBrede.mois["2026-06"].volume, f(100));
  procheFourchette(tableau.total.mois["2026-06"].ca, f(3 * 33.75 * 2 + 100, 3 * 33.75 * 2.5 + 150, 3 * 33.75 * 3 + 200));
  procheFourchette(tableau.total.total.ca, f(540 + 100, 675 + 150, 810 + 200));
  assert.deepEqual(tableau.total.total.marge, tableau.total.total.ca);
});

test("[T05] les plantations supprimées, ou dont la variété ou la culture est supprimée, ne comptent pas", () => {
  const supprime = "2026-10-13T08:00:00.000Z";
  const variete = { ...SANS_SURCHARGE, id: "v2" };
  const tableau = Calc.tableau(fermeS2({
    cultures: [{ ...COURGETTE, id: "c3", nom: "tomate", supprimeLe: supprime }],
    varietes: [variete, { ...SANS_SURCHARGE, id: "v3", cultureId: "c3" }, { ...SANS_SURCHARGE, id: "v4", supprimeLe: supprime }],
    plantations: [
      { ...PLANTATION_S1, id: "p2", varieteId: "v2", supprimeLe: supprime },
      { ...PLANTATION_S1, id: "p3", varieteId: "v3" },
      { ...PLANTATION_S1, id: "p4", varieteId: "v4" },
      { ...PLANTATION_S1, id: "p5", varieteId: "inconnue" },
    ],
  }));
  assert.deepEqual(tableau.lignes.map((l) => l.nom), ["courgette"]);
  procheFourchette(tableau.lignes[0].total.volume, f(270));
});

test("[T05] une ferme sans plantation donne un tableau vide", () => {
  const tableau = Calc.tableau({ cultures: [COURGETTE], varietes: [SANS_SURCHARGE], plantations: [] });
  assert.deepEqual(tableau.mois, []);
  assert.deepEqual(tableau.lignes, []);
  procheFourchette(tableau.total.total.ca, f(0));
});

test("[T05] une ferme de 200 plantations se calcule en moins d'une seconde", () => {
  const cultures = [];
  const varietes = [];
  const plantations = [];
  for (let c = 0; c < 20; c++) {
    cultures.push({ ...COURGETTE, id: `c${c}`, nom: `culture ${c}`, semainesRecolte: 4 + (c % 12) });
    varietes.push({ ...SANS_SURCHARGE, id: `v${c}`, cultureId: `c${c}` });
  }
  for (let i = 0; i < 200; i++) {
    plantations.push({ ...PLANTATION_S1, id: `p${i}`, varieteId: `v${i % 20}`, date: Calc.ajouterJours("2026-01-05", 3 * i) });
  }
  const debut = process.hrtime.bigint();
  const tableau = Calc.tableau({ cultures, varietes, plantations });
  const ms = Number(process.hrtime.bigint() - debut) / 1e6;
  assert.equal(tableau.lignes.length, 20);
  assert.ok(ms < 1000, `${ms} ms`);
});

// ---- T07 : sur-occupation d'un espace (EX-06, scénario S3)

// Une salade qui occupe sa planche 30 jours avant récolte puis 4 semaines de récolte.
const SALADE = { ...COURGETTE, id: "c9", nom: "salade", joursAvantRecolte: 30, semainesRecolte: 4 };
const BATAVIA = { ...SANS_SURCHARGE, id: "v9", cultureId: "c9", nom: "batavia" };
const PLANCHE_4 = { id: "e4", nom: "planche 4", surface: 30, type: "plein_champ" };

function fermeS3(plantations, complements = {}) {
  return {
    espaces: [PLANCHE_4, ...(complements.espaces || [])],
    cultures: [SALADE],
    varietes: [BATAVIA, ...(complements.varietes || [])],
    plantations,
  };
}

const PREMIERE = { id: "p1", varieteId: "v9", espaceId: "e4", surface: 20, date: "2026-05-01" }; // du 1er mai au 27 juin
const SECONDE = { id: "p2", varieteId: "v9", espaceId: "e4", surface: 20, date: "2026-06-01" }; // du 1er juin au 28 juillet

test("[T07] S3 : deux plantations de 20 m² qui se chevauchent en juin sur 30 m² signalent juin", () => {
  const signaux = Calc.surOccupations(fermeS3([PREMIERE, SECONDE]));
  assert.deepEqual(Object.keys(signaux), ["e4"]);
  assert.deepEqual(signaux.e4.periodes, [{ debut: "2026-06-01", fin: "2026-06-27", surface: 40 }]);
  assert.deepEqual(signaux.e4.mois, [{ mois: "2026-06", surface: 40 }]);
});

test("[T07] une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte", () => {
  const veille = { ...SECONDE, date: "2026-06-28" };
  assert.deepEqual(Calc.surOccupations(fermeS3([PREMIERE, veille])), {});
  const dernierJour = { ...SECONDE, date: "2026-06-27" };
  assert.deepEqual(Calc.surOccupations(fermeS3([PREMIERE, dernierJour])).e4.periodes, [{ debut: "2026-06-27", fin: "2026-06-27", surface: 40 }]);
});

test("[T07] occuper exactement la surface de l'espace n'est pas une sur-occupation", () => {
  assert.deepEqual(Calc.surOccupations(fermeS3([{ ...PREMIERE, surface: 15 }, { ...SECONDE, surface: 15 }])), {});
});

test("[T07] chaque période garde la surface occupée, et chaque mois la plus grande", () => {
  const troisieme = { ...SECONDE, id: "p3", surface: 5, date: "2026-06-10" }; // du 10 juin au 6 août
  const signaux = Calc.surOccupations(fermeS3([PREMIERE, SECONDE, troisieme]));
  assert.deepEqual(signaux.e4.periodes, [
    { debut: "2026-06-01", fin: "2026-06-09", surface: 40 },
    { debut: "2026-06-10", fin: "2026-06-27", surface: 45 },
  ]);
  assert.deepEqual(signaux.e4.mois, [{ mois: "2026-06", surface: 45 }]);
});

test("[T07] une sur-occupation sur deux mois les signale tous les deux ; les espaces sont indépendants", () => {
  const autre = { id: "e5", nom: "planche 5", surface: 30, type: "plein_champ" };
  const longue = { ...SECONDE, id: "p4", surface: 15, date: "2026-05-20" }; // du 20 mai au 16 juillet
  const ailleurs = { ...SECONDE, id: "p5", espaceId: "e5", surface: 25 };
  const signaux = Calc.surOccupations(fermeS3([PREMIERE, longue, ailleurs], { espaces: [autre] }));
  assert.deepEqual(Object.keys(signaux), ["e4"]);
  assert.deepEqual(signaux.e4.mois.map((m) => m.mois), ["2026-05", "2026-06"]);
});

test("[T07] les plantations supprimées, ou dont la variété est supprimée, n'occupent rien", () => {
  const supprime = "2026-10-13T08:00:00.000Z";
  const varieteSupprimee = { ...BATAVIA, id: "v10", supprimeLe: supprime };
  assert.deepEqual(Calc.surOccupations(fermeS3([PREMIERE, { ...SECONDE, supprimeLe: supprime }])), {});
  assert.deepEqual(Calc.surOccupations(fermeS3([PREMIERE, { ...SECONDE, varieteId: "v10" }], { varietes: [varieteSupprimee] })), {});
});
