// Tranche R3 — plusieurs années : calcul par année (T53 : EX-55 à EX-57, scénarios S15 et S16).
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Calc = require("../src/calc.js");

const f = (basse, mediane = basse, haute = mediane) => ({ basse, mediane, haute });

function proche(obtenu, attendu, message) {
  assert.ok(Math.abs(obtenu - attendu) < 1e-6, `${message || ""} ${obtenu} ≠ ${attendu}`);
}

function procheFourchette(obtenue, attendue, message) {
  for (const cle of ["basse", "mediane", "haute"]) proche(obtenue[cle], attendue[cle], `${message || ""} ${cle}`);
}

const mois = (annee) => Array.from({ length: 12 }, (_, i) => `${annee}-${String(i + 1).padStart(2, "0")}`);

// Contexte : la courgette du scénario S12 de N3 (100 m² le 1er mars 2026, coûts de culture 50 / 60 / 70 €)
// et les charges fixes du scénario S13 (assurance 600 € par an, cotisation 150 € par mois).
const COURGETTE = { id: "c1", nom: "courgette", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
  implantation: "plant", densite: 1, prixUnite: f(0.3, 0.4, 0.5), intrants: f(0.2) };
const VARIETE = { id: "v1", cultureId: "c1", nom: "Black Beauty" };
const PLANTATION = { id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" };
const ESPACES = [{ id: "e1", nom: "planche 1", surface: 100 }, { id: "e2", nom: "planche 2", surface: 100 }];
const CHARGES = [{ id: "ch1", nom: "Assurance", montant: f(600), periodicite: "an" }, { id: "ch2", nom: "Cotisation", montant: f(150), periodicite: "mois" }];
const S12 = { espaces: ESPACES, cultures: [COURGETTE], varietes: [VARIETE], plantations: [PLANTATION] };
const S13 = { ...S12, charges: CHARGES };
// S16 : une seconde plantation de 100 m² le 1er mars 2027.
const S16 = { ...S13, plantations: [PLANTATION, { ...PLANTATION, id: "p2", espaceId: "e2", date: "2027-03-01" }] };

// S15 : un marché ouvert le samedi, du 2 janvier au 27 mars 2027 (24,60 € la séance, scénario S6 de N2).
const MARCHE = { id: "pv1", nom: "marché de Saint-Paul", distanceKm: 12, coutKm: f(0.4) };
const SAMEDI_2027 = { id: "s1", pointVenteId: "pv1", jour: 6, debut: "2027-01-02", fin: "2027-03-27", frais: f(15) };
const S15 = { ...S13, pointsVente: [MARCHE], seances: [SAMEDI_2027], debouches: [{ id: "d1", pointVenteId: "pv1", produitId: "c1", prix: f(2.5), volumeParSeance: f(20) }] };

// Une ferme qui traverse le nouvel an de toutes les façons : ventes au marché toute l'année 2026-2027, une
// culture sans débouché récoltée à cheval sur deux années, des poules de septembre 2026 à avril 2027,
// des coûts de culture et un véhicule.
const AIL = { id: "c2", nom: "ail", unite: "kg", rendement: f(0.3, 0.6, 0.8), prix: f(15, 20, 25), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 20,
  implantation: "plant", densite: 33, prixUnite: f(0.06, 0.08, 0.1) };
const VACOA = { id: "v2", cultureId: "c2", nom: "Vacoa" };
const LOT = { id: "l1", nom: "Lot", effectif: 100, arrivee: "2026-09-01", debutPonte: "2026-09-21", reforme: "2027-04-30",
  ponte: f(0.66, 0.72, 0.8), pertes: 6, aliment: f(105, 115, 130), prixAliment: f(0.6, 0.8, 1), prixOeuf: f(0.3, 0.35, 0.45) };
const VEHICULE = { id: "ve1", nom: "Fourgonnette", consommation: f(6, 7, 8.5), prixLitre: f(1.25, 1.55, 1.85) };
const MARCHE_2_ANS = { id: "pv1", nom: "marché", distanceKm: 13, vehiculeId: "ve1" };
const PANIERS = { id: "pv2", nom: "paniers", distanceKm: 12, vehiculeId: "ve1" };
const TRAVERSEE = {
  espaces: ESPACES,
  cultures: [COURGETTE, AIL],
  varietes: [VARIETE, VACOA],
  plantations: [
    PLANTATION,
    { ...PLANTATION, id: "p2", date: "2026-10-20" },
    { ...PLANTATION, id: "p3", espaceId: "e2", date: "2027-03-01" },
    { id: "p4", varieteId: "v2", espaceId: "e2", surface: 50, date: "2026-11-02" },
  ],
  pointsVente: [MARCHE_2_ANS, PANIERS],
  vehicules: [VEHICULE],
  seances: [
    { id: "s1", pointVenteId: "pv1", jour: 6, debut: "2026-04-04", fin: "2027-06-26", frais: f(12, 15, 20) },
    { id: "s2", pointVenteId: "pv2", jour: 4, debut: "2026-05-07", fin: "2027-05-27", frais: f(0) },
  ],
  debouches: [
    { id: "d1", pointVenteId: "pv1", produitId: "c1", prix: f(2, 2.5, 3), volumeParSeance: f(10, 20, 30) },
    { id: "d2", pointVenteId: "pv2", produitId: "c1", prix: f(3), volumeParSeance: f(5, 10, 15) },
    { id: "d3", pointVenteId: "pv1", produitId: Calc.OEUFS, prix: f(0.35, 0.45, 0.53), volumeParSeance: f(150, 300, 600) },
  ],
  lots: [LOT],
  charges: CHARGES,
};

test("[T53] EX-55 : les années de la ferme vont de la première à la dernière qui porte une valeur ou une barre du calendrier", () => {
  assert.deepEqual(Calc.annees({}), []);
  assert.deepEqual(Calc.annees(S12), [2026]);
  // Les charges fixes prolongent la projection jusqu'en février 2027, sans faire de 2027 une année de la ferme.
  assert.deepEqual(Calc.annees(S13), [2026]);
  assert.deepEqual(Calc.annees(S16), [2026, 2027]);
  // Une plantation en 2028 : 2027, sans donnée, fait partie des années de la ferme.
  assert.deepEqual(Calc.annees({ ...S12, plantations: [PLANTATION, { ...PLANTATION, id: "p2", date: "2028-03-01" }] }), [2026, 2027, 2028]);
  // Une plantation dont la récolte finit l'année suivante, sans débouché ni vente cette année-là : la barre suffit.
  const longue = { ...S12, cultures: [{ ...COURGETTE, joursAvantRecolte: 200, semainesRecolte: 20 }] };
  assert.deepEqual(Calc.annees(longue), [2026, 2027]);
  // Un lot de poules de septembre 2026 à avril 2027.
  assert.deepEqual(Calc.annees({ lots: [LOT] }), [2026, 2027]);
  assert.deepEqual(Calc.annees(TRAVERSEE), [2026, 2027]);
});

test("[T53] EX-55 : l'année proposée est l'année retenue, sinon l'année en cours, sinon la plus proche", () => {
  assert.equal(Calc.anneeParDefaut([], "2026-10-15", null), null);
  assert.equal(Calc.anneeParDefaut([2026, 2027], "2027-03-01", 2026), 2026);
  // Une année retenue qui n'est plus une année de la ferme ne compte pas.
  assert.equal(Calc.anneeParDefaut([2026, 2027], "2027-03-01", 2025), 2027);
  assert.equal(Calc.anneeParDefaut([2026, 2027], "2027-03-01", null), 2027);
  assert.equal(Calc.anneeParDefaut([2026, 2027], "2030-01-01", null), 2027);
  assert.equal(Calc.anneeParDefaut([2026, 2027], "2024-06-30", null), 2026);
  // À égalité de distance, la plus tardive.
  assert.equal(Calc.anneeParDefaut([2025, 2027], "2026-06-30", null), 2027);
});

test("[T53] S15 : la séance du samedi 2 janvier 2027 compte en décembre 2026 ; 2027 va de janvier à décembre sans elle", () => {
  const t2026 = Calc.tableau(S15, { annee: 2026 });
  assert.deepEqual(t2026.mois, mois(2026));
  procheFourchette(t2026.total.mois["2026-12"].couts, f(24.6));
  const t2027 = Calc.tableau(S15, { annee: 2027 });
  assert.deepEqual(t2027.mois, mois(2027));
  // Janvier 2027 : les samedis 9, 16, 23 et 30.
  procheFourchette(t2027.total.mois["2027-01"].couts, f(4 * 24.6));
  // Les 13 séances (du 2 janvier au 27 mars) se partagent entre les deux années, sans double compte.
  procheFourchette(t2026.total.total.couts, f(24.6));
  procheFourchette(t2027.total.total.couts, f(12 * 24.6));
  procheFourchette(Calc.tableau(S15).total.total.couts, f(13 * 24.6));
});

test("[T53] S16 : deux années, chacune de janvier à décembre avec 2 400 € de charges fixes, et le même revenu", () => {
  const t2026 = Calc.tableau(S16, { annee: 2026 });
  const t2027 = Calc.tableau(S16, { annee: 2027 });
  assert.deepEqual(t2026.mois, mois(2026));
  assert.deepEqual(t2027.mois, mois(2027));
  for (const t of [t2026, t2027]) {
    procheFourchette(t.total.total.charges, f(2400));
    procheFourchette(t.total.total.revenu, f(-1930, -1785, -1640));
    const cles = Calc.chiffresCles(t);
    procheFourchette(cles.revenu, f(-1930, -1785, -1640));
  }
  const toute = Calc.tableau(S16);
  for (const cle of ["ca", "marge", "cultures"]) {
    procheFourchette(f(t2026.total.total[cle].basse + t2027.total.total[cle].basse, t2026.total.total[cle].mediane + t2027.total.total[cle].mediane,
      t2026.total.total[cle].haute + t2027.total.total[cle].haute), toute.total.total[cle], cle);
  }
});

test("[T53] EX-56 : une culture ou l'atelier poules n'ont de ligne que les années où ils portent une valeur ; l'effectif est celui de l'année", () => {
  const avant = { ...S12, plantations: [PLANTATION, { id: "p4", varieteId: "v2", espaceId: "e2", surface: 50, date: "2027-03-01" }],
    cultures: [COURGETTE, AIL], varietes: [VARIETE, VACOA],
    lots: [LOT, { ...LOT, id: "l2", effectif: 50, arrivee: "2027-06-01", debutPonte: "2027-06-15", reforme: "2027-12-31" }] };
  const t2026 = Calc.tableau(avant, { annee: 2026 });
  assert.deepEqual(t2026.lignes.map((l) => l.nom), ["courgette"]);
  assert.equal(t2026.poules.lots, 1);
  assert.equal(t2026.poules.effectif, 100);
  const t2027 = Calc.tableau(avant, { annee: 2027 });
  assert.deepEqual(t2027.lignes.map((l) => l.nom), ["ail"]);
  assert.equal(t2027.poules.lots, 2);
  assert.equal(t2027.poules.effectif, 150);
  // Sans charge fixe, les mois de l'année vont du premier au dernier qui porte une valeur.
  assert.equal(t2026.mois[0], "2026-03");
  assert.equal(t2026.mois[t2026.mois.length - 1], "2026-12");
  assert.equal("charges" in t2026.total.total, false);
});

test("[T53] somme_des_annees : chaque ligne et chaque total de la ferme se partagent entre ses années, sans perte ni double compte", () => {
  for (const donnees of [TRAVERSEE, S15, S16]) {
    const toute = Calc.tableau(donnees);
    const annees = Calc.annees(donnees).map((annee) => Calc.tableau(donnees, { annee }));
    const additionner = (lire) => annees.map(lire).filter(Boolean).reduce((s, x) => f(s.basse + x.basse, s.mediane + x.mediane, s.haute + x.haute), f(0));
    for (const cle of ["ca", "couts", "marge"]) {
      procheFourchette(additionner((t) => t.total.total[cle]), toute.total.total[cle], cle);
    }
    for (const cle of ["aliment", "cultures"]) {
      if (toute.total.total[cle]) procheFourchette(additionner((t) => t.total.total[cle]), toute.total.total[cle], cle);
    }
    for (const ligne of toute.lignes) {
      for (const cle of ["volume", "ca", "marge"]) {
        const lire = (t) => { const l = t.lignes.find((x) => x.cultureId === ligne.cultureId); return l && l.total[cle]; };
        procheFourchette(additionner(lire), ligne.total[cle], `${ligne.nom} ${cle}`);
      }
    }
    if (toute.poules) {
      for (const cle of ["volume", "ca", "aliment", "marge"]) {
        procheFourchette(additionner((t) => t.poules && t.poules.total[cle]), toute.poules.total[cle], `poules ${cle}`);
      }
    }
  }
});

test("[T53] sans_annee_comme_r2 : sans année, chaque calcul donne son résultat d'avant ; une ferme d'une année sans charge fixe a la même vue", () => {
  for (const donnees of [S12, S13, S15, S16, TRAVERSEE]) {
    assert.deepEqual(Calc.tableau(donnees, {}), Calc.tableau(donnees));
    assert.deepEqual(Calc.tableau(donnees, { annee: null }), Calc.tableau(donnees));
    assert.deepEqual(Calc.pointsDeVente(donnees, {}), Calc.pointsDeVente(donnees));
    assert.deepEqual(Calc.offreDemande(donnees, {}), Calc.offreDemande(donnees));
    assert.deepEqual(Calc.vehicules(donnees, {}), Calc.vehicules(donnees));
    assert.deepEqual(Calc.besoinsParMois(donnees, {}), Calc.besoinsParMois(donnees));
  }
  // sans_cout_comme_r1 : l'année d'une ferme sans charge fixe, toute dans cette année, est sa projection entière.
  assert.deepEqual(Calc.tableau(S12, { annee: 2026 }), Calc.tableau(S12));
  assert.equal(Calc.tableau(S12, { annee: 2026 }).mois.length, 4);
  // Une année hors de la ferme donne un tableau vide.
  const vide = Calc.tableau(S12, { annee: 2030 });
  assert.deepEqual(vide.mois, []);
  assert.deepEqual(vide.lignes, []);
});

test("[T53] EX-57 : points de vente, matrice offre-demande et son bilan, véhicules et besoins suivent l'année", () => {
  const annees = Calc.annees(TRAVERSEE);
  // Points de vente : les mois de l'année seulement ; les années additionnent séances, chiffre d'affaires et coûts.
  const tous = Calc.pointsDeVente(TRAVERSEE);
  const parAnnee = annees.map((annee) => Calc.pointsDeVente(TRAVERSEE, { annee }));
  annees.forEach((annee, i) => assert.ok(parAnnee[i].mois.every((m) => m.startsWith(`${annee}-`)), String(annee)));
  for (const point of tous.points) {
    const ceux = parAnnee.map((r) => r.points.find((p) => p.pointVenteId === point.pointVenteId).total);
    assert.equal(ceux.reduce((n, t) => n + t.seances, 0), point.total.seances, point.nom);
    proche(ceux.reduce((n, t) => n + t.ca.mediane, 0), point.total.ca.mediane, point.nom);
    proche(ceux.reduce((n, t) => n + t.couts.mediane, 0), point.total.couts.mediane, point.nom);
  }
  // Matrice : les semaines dont le jeudi tombe dans l'année ; la semaine du 28 décembre 2026 reste en 2026.
  const od2026 = Calc.offreDemande(TRAVERSEE, { annee: 2026 });
  const od2027 = Calc.offreDemande(TRAVERSEE, { annee: 2027 });
  assert.ok(od2026.semaines.includes("2026-12-28"));
  assert.equal(od2027.semaines[0], "2027-01-04");
  for (const [annee, od] of [[2026, od2026], [2027, od2027]]) {
    assert.ok(od.semaines.every((lundi) => Calc.moisDuJeudi(lundi).startsWith(`${annee}-`)), String(annee));
    for (const ligne of od.lignes) assert.deepEqual(Object.keys(ligne.semaines), od.semaines);
  }
  assert.deepEqual([...od2026.semaines, ...od2027.semaines], Calc.offreDemande(TRAVERSEE).semaines);
  const bilan = (od) => Object.fromEntries(Calc.bilanOffreDemande(od).map((b) => [b.produitId, b]));
  const [b, b26, b27] = [bilan(Calc.offreDemande(TRAVERSEE)), bilan(od2026), bilan(od2027)];
  for (const produitId of Object.keys(b)) {
    for (const cle of ["depasse", "manque", "equilibre", "sansDebouche"]) {
      assert.equal(((b26[produitId] || {})[cle] || 0) + ((b27[produitId] || {})[cle] || 0), b[produitId][cle], `${produitId} ${cle}`);
    }
  }
  // Véhicules : les séances dont le jeudi tombe dans l'année.
  const v = Calc.vehicules(TRAVERSEE).get("ve1");
  const [v26, v27] = annees.map((annee) => Calc.vehicules(TRAVERSEE, { annee }).get("ve1"));
  assert.equal(v26.seances + v27.seances, v.seances);
  proche(v26.km + v27.km, v.km);
  procheFourchette(f(v26.total.basse + v27.total.basse, v26.total.mediane + v27.total.mediane, v26.total.haute + v27.total.haute), v.total);
  // Besoins : les plantations mises en place dans l'année.
  const besoins2026 = Calc.besoinsParMois(TRAVERSEE, { annee: 2026 });
  const besoins2027 = Calc.besoinsParMois(TRAVERSEE, { annee: 2027 });
  assert.deepEqual(besoins2026.mois.map((m) => m.mois), ["2026-03", "2026-10", "2026-11"]);
  assert.deepEqual(besoins2027.mois.map((m) => m.mois), ["2027-03"]);
  procheFourchette(f(besoins2026.cout.basse + besoins2027.cout.basse, besoins2026.cout.mediane + besoins2027.cout.mediane,
    besoins2026.cout.haute + besoins2027.cout.haute), Calc.besoinsParMois(TRAVERSEE).cout);
});
