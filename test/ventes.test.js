// Tranche N2 — points de vente, séances et débouchés : store et calculs, sans navigateur.
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Store = require("../src/store.js");

function stockageEnMemoire() {
  const valeurs = new Map();
  return {
    getItem: (cle) => (valeurs.has(cle) ? valeurs.get(cle) : null),
    setItem: (cle, valeur) => valeurs.set(cle, String(valeur)),
  };
}

function f(basse, mediane = basse, haute = mediane) {
  return { basse, mediane, haute };
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Contexte des scénarios S4 à S6 : le marché de Saint-Paul, le samedi, et la courgette.
function saisirMarche(ferme, cultureId) {
  const marche = ferme.ajouter("pointsVente", { nom: "marché de Saint-Paul", distanceKm: 12, coutKm: f(0.4) });
  const seance = ferme.ajouter("seances", { pointVenteId: marche.id, jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: f(15) });
  const debouche = ferme.ajouter("debouches", { pointVenteId: marche.id, produitId: cultureId, prix: f(2.5), volumeParSeance: f(20) });
  return { marche, seance, debouche };
}

// ---- T18 : le modèle

test("[T18] points de vente, séances et débouchés reçoivent un UUID et leurs dates, et sont retrouvés après réouverture", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const { marche, seance, debouche } = saisirMarche(ferme, "c1");
  for (const e of [marche, seance, debouche]) {
    assert.match(e.id, UUID_V4);
    assert.equal(e.supprimeLe, null);
    assert.ok(e.creeLe && e.modifieLe);
  }
  const reouverte = Store.ouvrir(stockage);
  assert.deepEqual(reouverte.lister("pointsVente"), [marche]);
  assert.deepEqual(reouverte.lister("seances"), [seance]);
  assert.deepEqual(reouverte.lister("debouches"), [debouche]);
});

test("[T18] leur suppression est logique", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const { marche, seance } = saisirMarche(ferme, "c1");
  ferme.supprimer("seances", seance.id);
  ferme.supprimer("pointsVente", marche.id);
  const reouverte = Store.ouvrir(stockage);
  assert.deepEqual(reouverte.lister("seances"), []);
  assert.equal(reouverte.lister("seances", { avecSupprimes: true }).length, 1);
  assert.ok(reouverte.obtenir("pointsVente", marche.id).supprimeLe);
});

test("[T18] une fourchette désordonnée y est refusée", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  const desordre = { basse: 3, mediane: 2, haute: 4 };
  assert.throws(() => ferme.ajouter("pointsVente", { nom: "marché", distanceKm: 5, coutKm: desordre }), { code: "fourchette_desordonnee" });
  assert.throws(() => ferme.ajouter("seances", { pointVenteId: "p", jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: desordre }), { code: "fourchette_desordonnee" });
  assert.throws(() => ferme.ajouter("debouches", { pointVenteId: "p", produitId: "c", prix: desordre, volumeParSeance: f(20) }), { code: "fourchette_desordonnee" });
  assert.throws(() => ferme.ajouter("debouches", { pointVenteId: "p", produitId: "c", prix: f(2), volumeParSeance: desordre }), { code: "fourchette_desordonnee" });
});

test("[T18] export puis import restituent points de vente, séances et débouchés à l'identique, supprimés compris", () => {
  const source = Store.ouvrir(stockageEnMemoire());
  const { seance } = saisirMarche(source, "c1");
  source.supprimer("seances", seance.id);
  const fichier = JSON.parse(JSON.stringify(source.exporter()));
  assert.equal(fichier.version, 1);
  const cible = Store.ouvrir(stockageEnMemoire());
  cible.importer(fichier);
  for (const objet of ["pointsVente", "seances", "debouches"]) {
    assert.deepEqual(cible.lister(objet, { avecSupprimes: true }), source.lister(objet, { avecSupprimes: true }), objet);
  }
});

test("[T18] un fichier exporté avant N2, sans ces listes, s'importe toujours", () => {
  const ancien = { application: "plantoeuf", version: 1, exporteLe: "2026-10-13T08:00:00.000Z", espaces: [], cultures: [], varietes: [], plantations: [] };
  const ferme = Store.ouvrir(stockageEnMemoire());
  ferme.importer(ancien);
  for (const objet of ["pointsVente", "seances", "debouches"]) assert.deepEqual(ferme.lister(objet), [], objet);
});

// ---- T20 : séances datées et coût de chaque séance (EX-19, scénario S6)

const Calc = require("../src/calc.js");

function proche(obtenu, attendu, message) {
  assert.ok(Math.abs(obtenu - attendu) < 1e-9, `${message || ""} ${obtenu} ≠ ${attendu}`);
}

function procheFourchette(obtenue, attendue, message) {
  for (const cle of ["basse", "mediane", "haute"]) proche(obtenue[cle], attendue[cle], `${message || ""} ${cle}`);
}

const MARCHE = { id: "pv1", nom: "marché de Saint-Paul", distanceKm: 12, coutKm: f(0.4) };
const SAMEDI = { id: "s1", pointVenteId: "pv1", jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: f(15) };

test("[T20] une séance du samedi du 2 mai au 27 juin 2026 donne 9 séances datées", () => {
  assert.deepEqual(Calc.seancesDatees(SAMEDI), [
    "2026-05-02", "2026-05-09", "2026-05-16", "2026-05-23", "2026-05-30",
    "2026-06-06", "2026-06-13", "2026-06-20", "2026-06-27",
  ]);
});

test("[T20] les séances datées tombent le jour dit, dans la période, bornes comprises", () => {
  assert.equal(Calc.jourDeLaSemaine("2026-04-27"), 1);
  assert.equal(Calc.jourDeLaSemaine("2026-05-03"), 7);
  assert.deepEqual(Calc.seancesDatees({ ...SAMEDI, jour: 2, debut: "2026-04-27", fin: "2026-05-12" }), ["2026-04-28", "2026-05-05", "2026-05-12"]);
  assert.deepEqual(Calc.seancesDatees({ ...SAMEDI, debut: "2026-06-28", fin: "2026-06-27" }), []);
});

test("[T20] S6 : chaque séance coûte 15 + 2 × 12 × 0,40 = 24,60 €", () => {
  procheFourchette(Calc.coutSeance(SAMEDI, MARCHE), f(24.6));
  const fourchettes = Calc.coutSeance({ ...SAMEDI, frais: f(10, 15, 20) }, { ...MARCHE, coutKm: f(0.3, 0.4, 0.5) });
  procheFourchette(fourchettes, f(10 + 7.2, 15 + 9.6, 20 + 12));
});

test("[T20] S6 : les séances datées de la ferme, avec leur coût ; une séance ou un point de vente supprimé ne compte plus", () => {
  const supprime = "2026-10-13T08:00:00.000Z";
  const donnees = {
    pointsVente: [MARCHE, { ...MARCHE, id: "pv2", supprimeLe: supprime }],
    seances: [SAMEDI, { ...SAMEDI, id: "s2", supprimeLe: supprime }, { ...SAMEDI, id: "s3", pointVenteId: "pv2" }],
  };
  const seances = Calc.seancesDeLaFerme(donnees);
  assert.equal(seances.length, 9);
  assert.ok(seances.every((s) => s.pointVenteId === "pv1" && s.seanceId === "s1"));
  const total = seances.reduce((somme, s) => somme + s.cout.mediane, 0);
  proche(total, 221.4);
});

// ---- T21 : offre et demande par culture et par semaine (EX-20, scénario S4)

// Scénario S1 : courgette à 3 kg/m², 10 % de pertes, 60 jours, 8 semaines ; 100 m² le 1er mars 2026.
const COURGETTE = { id: "c1", nom: "courgette", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10 };
const BLACK_BEAUTY = { id: "v1", cultureId: "c1", nom: "Black Beauty", rendement: null, prix: null, joursAvantRecolte: null, semainesRecolte: null, pertes: null };
const PLANTATION_S1 = { id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" };
const DEBOUCHE = { id: "d1", pointVenteId: "pv1", produitId: "c1", prix: f(2.5), volumeParSeance: f(20) };

function fermeS4(complements = {}) {
  return {
    cultures: [COURGETTE, ...(complements.cultures || [])],
    varietes: [BLACK_BEAUTY, ...(complements.varietes || [])],
    plantations: complements.plantations || [PLANTATION_S1],
    pointsVente: [MARCHE, ...(complements.pointsVente || [])],
    seances: [SAMEDI, ...(complements.seances || [])],
    debouches: complements.debouches || [DEBOUCHE],
  };
}

function caseOD(resultat, produitId, lundi) {
  return resultat.lignes.find((l) => l.produitId === produitId).semaines[lundi];
}

test("[T21] une semaine va du lundi au dimanche ; son numéro suit la norme ISO 8601", () => {
  assert.equal(Calc.lundiDe("2026-04-27"), "2026-04-27");
  assert.equal(Calc.lundiDe("2026-05-03"), "2026-04-27");
  assert.equal(Calc.lundiDe("2026-01-01"), "2025-12-29");
  assert.equal(Calc.numeroDeSemaine("2026-04-27"), 18);
  assert.equal(Calc.numeroDeSemaine("2025-12-29"), 1);
  assert.equal(Calc.numeroDeSemaine("2027-01-01"), 53);
});

test("[T21] S4 : la courgette dépasse de 13,75 kg la semaine du 27 avril, sûrement", () => {
  const od = Calc.offreDemande(fermeS4());
  const semaine = caseOD(od, "c1", "2026-04-27");
  procheFourchette(semaine.offre, f(33.75));
  procheFourchette(semaine.demande, f(20));
  proche(semaine.ecart, 13.75);
  assert.equal(semaine.etat, "depasse");
  assert.equal(semaine.sur, true);
});

test("[T21] S4 : elle manque de 20 kg la semaine du 22 juin, sûrement ; les semaines vont du 27 avril au 22 juin", () => {
  const od = Calc.offreDemande(fermeS4());
  assert.deepEqual(od.semaines, ["2026-04-27", "2026-05-04", "2026-05-11", "2026-05-18", "2026-05-25", "2026-06-01", "2026-06-08", "2026-06-15", "2026-06-22"]);
  const semaine = caseOD(od, "c1", "2026-06-22");
  procheFourchette(semaine.offre, f(0));
  procheFourchette(semaine.demande, f(20));
  proche(semaine.ecart, -20);
  assert.equal(semaine.etat, "manque");
  assert.equal(semaine.sur, true);
});

test("[T21] quand les fourchettes se recouvrent, l'état suit la médiane mais n'est pas sûr", () => {
  const od = Calc.offreDemande(fermeS4({ debouches: [{ ...DEBOUCHE, volumeParSeance: f(20, 35, 50) }] }));
  const semaine = caseOD(od, "c1", "2026-05-04");
  assert.equal(semaine.etat, "manque");
  assert.equal(semaine.sur, false);
  const equilibre = caseOD(Calc.offreDemande(fermeS4({ debouches: [{ ...DEBOUCHE, volumeParSeance: f(33.75) }] })), "c1", "2026-05-04");
  assert.equal(equilibre.etat, "equilibre");
});

test("[T21] la demande additionne les séances de la semaine ; une culture sans débouché est signalée comme telle", () => {
  const mardi = { ...SAMEDI, id: "s2", jour: 2, debut: "2026-04-28", fin: "2026-06-30" };
  const brede = { ...COURGETTE, id: "c2", nom: "brède", unite: "botte" };
  const od = Calc.offreDemande(fermeS4({
    seances: [mardi],
    cultures: [brede],
    varietes: [{ ...BLACK_BEAUTY, id: "v2", cultureId: "c2" }],
    plantations: [PLANTATION_S1, { ...PLANTATION_S1, id: "p2", varieteId: "v2" }],
  }));
  procheFourchette(caseOD(od, "c1", "2026-05-04").demande, f(40));
  const sansDebouche = caseOD(od, "c2", "2026-05-04");
  assert.equal(sansDebouche.etat, "sans_debouche");
  assert.equal(sansDebouche.demande, null);
  procheFourchette(sansDebouche.offre, f(33.75));
  assert.deepEqual(od.lignes.map((l) => l.nom), ["brède", "courgette"]);
});

test("[T21] séances, débouchés et points de vente supprimés ne font plus de demande", () => {
  const supprime = "2026-10-13T08:00:00.000Z";
  const sansSeance = fermeS4();
  sansSeance.seances = [{ ...SAMEDI, supprimeLe: supprime }];
  const semaine = caseOD(Calc.offreDemande(sansSeance), "c1", "2026-05-04");
  procheFourchette(semaine.demande, f(0));
  assert.equal(semaine.etat, "depasse");

  const debouchesSupprime = fermeS4({ debouches: [{ ...DEBOUCHE, supprimeLe: supprime }] });
  const pointSupprime = fermeS4();
  pointSupprime.pointsVente = [{ ...MARCHE, supprimeLe: supprime }];
  for (const donnees of [debouchesSupprime, pointSupprime]) {
    assert.equal(caseOD(Calc.offreDemande(donnees), "c1", "2026-05-04").etat, "sans_debouche");
  }
});
