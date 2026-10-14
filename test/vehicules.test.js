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
