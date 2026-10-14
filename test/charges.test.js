// Tranche N3 — modèle des coûts (T43 : EX-45) ; charges fixes et revenu (T46 : EX-48, scénario S13).
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
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ASSURANCE = { nom: "Assurance", montant: f(600), periodicite: "an" };
const COURGETTE_COUTS = {
  nom: "courgette", famille: "Cucurbitacées", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3),
  joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
  implantation: "plant", densite: 1, prixUnite: f(0.3, 0.4, 0.5), intrants: f(0.2),
};

test("[T43] EX-45 : une charge fixe s'enregistre avec UUID, dates et suppression logique, et se retrouve après réouverture", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  assert.ok(Store.OBJETS.includes("charges"));
  const c = ferme.ajouter("charges", ASSURANCE);
  assert.match(c.id, UUID_V4);
  assert.ok(c.creeLe && c.modifieLe);
  assert.equal(c.supprimeLe, null);
  assert.deepEqual(Store.ouvrir(stockage).lister("charges").map((x) => [x.nom, x.periodicite]), [["Assurance", "an"]]);
  ferme.modifier("charges", c.id, { montant: f(550, 600, 650) });
  assert.deepEqual(Store.ouvrir(stockage).obtenir("charges", c.id).montant, f(550, 600, 650));
  ferme.supprimer("charges", c.id);
  assert.deepEqual(Store.ouvrir(stockage).lister("charges"), []);
  assert.equal(Store.ouvrir(stockage).lister("charges", { avecSupprimes: true }).length, 1);
});

test("[T43] EX-45 : un montant désordonné est refusé", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  assert.throws(() => ferme.ajouter("charges", { ...ASSURANCE, montant: f(700, 600, 500) }), (e) => e.code === "fourchette_desordonnee");
});

test("[T43] EX-45 : frais au km d'un véhicule et coûts de mise en place d'une culture s'enregistrent tels quels", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const v = ferme.ajouter("vehicules", { nom: "Camionnette", consommation: f(8), prixLitre: f(1.8), fraisKm: f(0.1, 0.15, 0.2) });
  const c = ferme.ajouter("cultures", COURGETTE_COUTS);
  const relue = Store.ouvrir(stockage);
  assert.deepEqual(relue.obtenir("vehicules", v.id).fraisKm, f(0.1, 0.15, 0.2));
  const culture = relue.obtenir("cultures", c.id);
  assert.equal(culture.implantation, "plant");
  assert.equal(culture.densite, 1);
  assert.deepEqual(culture.prixUnite, f(0.3, 0.4, 0.5));
  assert.deepEqual(culture.intrants, f(0.2));
});

test("[T43] EX-45 : le format exporté passe en version 5, charges comprises ; export puis import à l'identique", () => {
  assert.ok(Store.VERSION >= 5);
  const ferme = Store.ouvrir(stockageEnMemoire());
  const c = ferme.ajouter("charges", ASSURANCE);
  ferme.ajouter("charges", { nom: "Cotisation", montant: f(150), periodicite: "mois" });
  ferme.ajouter("cultures", COURGETTE_COUTS);
  ferme.supprimer("charges", c.id);
  const fichier = ferme.exporter();
  assert.equal(fichier.version, Store.VERSION);
  assert.equal(fichier.charges.length, 2);
  const autre = Store.ouvrir(stockageEnMemoire());
  autre.importer(JSON.parse(JSON.stringify(fichier)));
  assert.deepEqual(autre.exporter().charges, fichier.charges);
  assert.deepEqual(autre.exporter().cultures, fichier.cultures);
});

test("[T43] EX-45 : un fichier de version 4 s'importe par migration, avec une liste de charges vide", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  ferme.ajouter("vehicules", { nom: "Camionnette", consommation: f(8), prixLitre: f(1.8) });
  const ancien = ferme.exporter();
  ancien.version = 4;
  delete ancien.charges;
  const autre = Store.ouvrir(stockageEnMemoire());
  autre.importer(ancien);
  assert.deepEqual(autre.lister("charges"), []);
  assert.equal(autre.lister("vehicules").length, 1);
  assert.equal(autre.exporter().version, Store.VERSION);
});
