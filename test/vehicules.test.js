// Tranche R1 — véhicules : modèle et saisie (T40 : EX-41, EX-42) ; calcul des dépenses (T41 : EX-43, EX-44, scénario S11).
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

const f = (basse, mediane = basse, haute = mediane) => ({ basse, mediane, haute });
const CAMIONNETTE = { nom: "Camionnette", consommation: f(8), prixLitre: f(1.8) };
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("[T40] EX-41 : un véhicule s'enregistre avec UUID, dates et suppression logique, et se retrouve après réouverture", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  assert.ok(Store.OBJETS.includes("vehicules"));
  const v = ferme.ajouter("vehicules", CAMIONNETTE);
  assert.match(v.id, UUID_V4);
  assert.ok(v.creeLe && v.modifieLe);
  assert.equal(v.supprimeLe, null);
  assert.deepEqual(Store.ouvrir(stockage).lister("vehicules").map((x) => x.nom), ["Camionnette"]);

  ferme.modifier("vehicules", v.id, { consommation: f(7, 8, 9) });
  assert.deepEqual(Store.ouvrir(stockage).obtenir("vehicules", v.id).consommation, f(7, 8, 9));
  ferme.supprimer("vehicules", v.id);
  assert.deepEqual(Store.ouvrir(stockage).lister("vehicules"), []);
  assert.equal(Store.ouvrir(stockage).lister("vehicules", { avecSupprimes: true }).length, 1);
});

test("[T40] EX-41 : une consommation ou un prix du litre désordonné est refusé", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  assert.throws(() => ferme.ajouter("vehicules", { ...CAMIONNETTE, consommation: f(9, 8, 7) }), (e) => e.code === "fourchette_desordonnee");
});

test("[T40] EX-41 : le format exporté passe en version 4, véhicules compris ; export puis import à l'identique", () => {
  assert.ok(Store.VERSION >= 4);
  const ferme = Store.ouvrir(stockageEnMemoire());
  const v = ferme.ajouter("vehicules", CAMIONNETTE);
  ferme.ajouter("vehicules", { ...CAMIONNETTE, nom: "Voiture" });
  ferme.supprimer("vehicules", v.id);
  const fichier = ferme.exporter();
  assert.equal(fichier.version, Store.VERSION);
  assert.equal(fichier.vehicules.length, 2);

  const autre = Store.ouvrir(stockageEnMemoire());
  autre.importer(JSON.parse(JSON.stringify(fichier)));
  assert.deepEqual(autre.exporter().vehicules, fichier.vehicules);
});

test("[T40] EX-41 : un fichier de version 3 s'importe par migration, avec une liste de véhicules vide", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  ferme.ajouter("espaces", { nom: "planche 1", surface: 30, type: "plein_champ" });
  const ancien = ferme.exporter();
  ancien.version = 3;
  delete ancien.vehicules;
  const autre = Store.ouvrir(stockageEnMemoire());
  autre.importer(ancien);
  assert.deepEqual(autre.lister("vehicules"), []);
  assert.equal(autre.lister("espaces").length, 1);
  assert.equal(autre.exporter().version, Store.VERSION);
});

test("[T40] EX-42 : un point de vente garde son véhicule, sans coût du km saisi", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const v = ferme.ajouter("vehicules", CAMIONNETTE);
  const marche = ferme.ajouter("pointsVente", { nom: "marché de Saint-Paul", distanceKm: 12, coutKm: null, vehiculeId: v.id });
  const relu = Store.ouvrir(stockage).obtenir("pointsVente", marche.id);
  assert.equal(relu.vehiculeId, v.id);
  assert.equal(relu.coutKm, null);
});

// ---- T41 : coût du km déduit du véhicule, bilan de saison (EX-43, EX-44, scénario S11)

const Calc = require("../src/calc.js");

function proche(a, b) {
  return Math.abs(a - b) < 1e-9;
}
function procheFourchette(reel, attendu) {
  for (const niveau of ["basse", "mediane", "haute"]) {
    assert.ok(proche(reel[niveau], attendu[niveau]), `${niveau} : ${reel[niveau]} ≠ ${attendu[niveau]}`);
  }
}

const VEHICULE = { id: "v1", nom: "Camionnette", consommation: f(8), prixLitre: f(1.8) };
// Le marché de Saint-Paul de N2 : 12 km, le samedi du 2 mai au 27 juin 2026 (9 séances), 15 € de frais.
const MARCHE = { id: "pv1", nom: "marché de Saint-Paul", distanceKm: 12, coutKm: null, vehiculeId: "v1" };
const SAMEDI = { id: "s1", pointVenteId: "pv1", jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: f(15) };
const S11 = { vehicules: [VEHICULE], pointsVente: [MARCHE], seances: [SAMEDI] };

test("[T41] S11 : le coût du km d'un point de vente se déduit de son véhicule (8 L/100 km × 1,80 €/L = 0,144 €/km)", () => {
  const parId = new Map([[VEHICULE.id, VEHICULE]]);
  procheFourchette(Calc.coutDuKm(MARCHE, parId), f(0.144));
  // En fourchette, niveau par niveau.
  const v = { ...VEHICULE, consommation: f(7, 8, 9), prixLitre: f(1.7, 1.8, 1.95) };
  procheFourchette(Calc.coutDuKm(MARCHE, new Map([[v.id, v]])), f(0.119, 0.144, 0.1755));
});

test("[T41] EX-43 : sans véhicule, ou si son véhicule est supprimé, c'est le coût du km saisi qui compte (0 s'il manque)", () => {
  const sansVehicule = { ...MARCHE, vehiculeId: "", coutKm: f(0.4) };
  procheFourchette(Calc.coutDuKm(sansVehicule, new Map([[VEHICULE.id, VEHICULE]])), f(0.4));
  const supprime = new Map([[VEHICULE.id, { ...VEHICULE, supprimeLe: "2026-10-14T00:00:00.000Z" }]]);
  procheFourchette(Calc.coutDuKm({ ...MARCHE, coutKm: f(0.4) }, supprime), f(0.4));
  procheFourchette(Calc.coutDuKm(MARCHE, supprime), f(0));
  procheFourchette(Calc.coutDuKm(MARCHE, new Map()), f(0));
});

test("[T41] S11 : une séance du marché coûte 15 + 2 × 12 × 0,144 = 18,456 €, partout où elle compte", () => {
  procheFourchette(Calc.coutSeance(SAMEDI, MARCHE, new Map([[VEHICULE.id, VEHICULE]])), f(18.456));
  const seances = Calc.seancesDeLaFerme(S11);
  assert.equal(seances.length, 9);
  for (const s of seances) procheFourchette(s.cout, f(18.456));
  // Tableau économique : coût des séances de la ferme ; vue « Points de vente » : coûts du marché.
  procheFourchette(Calc.tableau(S11).total.total.couts, f(9 * 18.456));
  procheFourchette(Calc.pointsDeVente(S11).points[0].total.couts, f(9 * 18.456));
});

test("[T41] S11 : la camionnette roule 216 km sur la saison, consomme 17,28 L et 31,104 € de carburant", () => {
  const bilans = Calc.vehicules(S11);
  const bilan = bilans.get("v1");
  procheFourchette(bilan.coutKm, f(0.144));
  assert.equal(bilan.seances, 9);
  assert.equal(bilan.km, 216);
  procheFourchette(bilan.litres, f(17.28));
  procheFourchette(bilan.carburant, f(31.104));
  // Un véhicule que n'utilise aucun point de vente ne roule pas ; un véhicule supprimé n'a pas de bilan.
  const seul = Calc.vehicules({ ...S11, vehicules: [VEHICULE, { ...VEHICULE, id: "v2", nom: "Voiture" }] }).get("v2");
  assert.equal(seul.km, 0);
  procheFourchette(seul.carburant, f(0));
  assert.equal(Calc.vehicules({ ...S11, vehicules: [{ ...VEHICULE, supprimeLe: "2026-10-14T00:00:00.000Z" }] }).size, 0);
  // Un point de vente supprimé ne fait plus rouler son véhicule.
  assert.equal(Calc.vehicules({ ...S11, pointsVente: [{ ...MARCHE, supprimeLe: "2026-10-14T00:00:00.000Z" }] }).get("v1").km, 0);
});

test("[T41] sans_vehicule_comme_avant : une ferme sans véhicule donne les mêmes résultats, avec ou sans liste de véhicules", () => {
  const n2 = { pointsVente: [{ ...MARCHE, vehiculeId: undefined, coutKm: f(0.4) }], seances: [SAMEDI] };
  assert.deepEqual(Calc.tableau({ ...n2, vehicules: [] }), Calc.tableau(n2));
  assert.deepEqual(Calc.pointsDeVente({ ...n2, vehicules: [] }), Calc.pointsDeVente(n2));
  procheFourchette(Calc.coutSeance(SAMEDI, n2.pointsVente[0]), f(24.6));
});

// ---- T44 : frais d'entretien et d'usure au km (EX-46, scénario S14)

const AVEC_FRAIS = { ...VEHICULE, fraisKm: f(0.15) };
const S14 = { ...S11, vehicules: [AVEC_FRAIS] };

test("[T44] S14 : les frais au km s'ajoutent au carburant (0,144 + 0,15 = 0,294 €/km), et une séance coûte 22,056 €", () => {
  const parId = new Map([[AVEC_FRAIS.id, AVEC_FRAIS]]);
  procheFourchette(Calc.coutDuKm(MARCHE, parId), f(0.294));
  procheFourchette(Calc.coutSeance(SAMEDI, MARCHE, parId), f(22.056));
  procheFourchette(Calc.tableau(S14).total.total.couts, f(9 * 22.056));
  // En fourchette, niveau par niveau.
  const v = { ...AVEC_FRAIS, fraisKm: f(0.1, 0.15, 0.2) };
  procheFourchette(Calc.coutDuKm(MARCHE, new Map([[v.id, v]])), f(0.244, 0.294, 0.344));
});

test("[T44] S14 : sur la saison, 216 km, 31,104 € de carburant, 32,40 € d'entretien et d'usure, 63,504 € en tout", () => {
  const bilan = Calc.vehicules(S14).get("v1");
  assert.equal(bilan.km, 216);
  procheFourchette(bilan.carburant, f(31.104));
  procheFourchette(bilan.entretien, f(32.4));
  procheFourchette(bilan.total, f(63.504));
});

test("[T44] sans_frais_comme_r1 : sans frais au km, le coût du km et les séances restent ceux de R1", () => {
  const parId = new Map([[VEHICULE.id, VEHICULE]]);
  procheFourchette(Calc.coutDuKm(MARCHE, parId), f(0.144));
  procheFourchette(Calc.coutSeance(SAMEDI, MARCHE, parId), f(18.456));
  const bilan = Calc.vehicules(S11).get("v1");
  procheFourchette(bilan.entretien, f(0));
  procheFourchette(bilan.total, bilan.carburant);
});
