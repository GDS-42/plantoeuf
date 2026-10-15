// T09 — EX-10 : la ferme d'exemple (La Réunion), sans navigateur.
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Store = require("../src/store.js");
const Calc = require("../src/calc.js");
const Exemple = require("../src/exemple.js");

function stockageEnMemoire() {
  const valeurs = new Map();
  return {
    getItem: (cle) => (valeurs.has(cle) ? valeurs.get(cle) : null),
    setItem: (cle, valeur) => valeurs.set(cle, String(valeur)),
  };
}

function donnees(ferme) {
  const resultat = {};
  for (const objet of Store.OBJETS) resultat[objet] = ferme.lister(objet);
  return resultat;
}

test("[T09] la ferme d'exemple compte 51 plantations, toutes calculables, sans sur-occupation", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  Exemple.charger(ferme, 2027);
  const d = donnees(ferme);

  assert.equal(d.plantations.length, 51);
  assert.equal(Exemple.NOMBRE_DE_PLANTATIONS, 51);
  for (const plantation of d.plantations) {
    const variete = d.varietes.find((v) => v.id === plantation.varieteId);
    assert.ok(variete, "variété");
    assert.ok(d.cultures.find((c) => c.id === variete.cultureId), "culture");
    assert.ok(d.espaces.find((e) => e.id === plantation.espaceId), "espace");
    assert.match(plantation.date, /^2027-\d{2}-\d{2}$/);
  }
  const tableau = Calc.tableau(d);
  assert.equal(tableau.lignes.length, d.cultures.length);
  assert.ok(tableau.mois.length > 0);
  assert.ok(tableau.total.total.ca.mediane > 0);
  assert.deepEqual(Calc.surOccupations(d), {});
});

test("[T09] la ferme d'exemple montre une variété qui surcharge sa culture", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  Exemple.charger(ferme, 2027);
  const surchargees = ferme.lister("varietes").filter((v) => Calc.CHAMPS_SURCHARGEABLES.some((c) => v[c] !== null && v[c] !== undefined));
  assert.ok(surchargees.length >= 1);
});

test("[T09] effacer l'exemple supprime logiquement ce qu'il a créé, et seulement cela", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  Exemple.charger(ferme, 2027);
  const mienne = ferme.ajouter("espaces", { nom: "ma planche", surface: 20, type: "plein_champ" });
  assert.equal(Exemple.estAffichee(ferme), true);

  Exemple.effacer(ferme);

  const reouverte = Store.ouvrir(stockage);
  assert.deepEqual(reouverte.lister("espaces").map((e) => e.id), [mienne.id]);
  for (const objet of ["cultures", "varietes", "plantations"]) assert.deepEqual(reouverte.lister(objet), [], objet);
  const plantations = reouverte.lister("plantations", { avecSupprimes: true });
  assert.equal(plantations.length, 51);
  assert.ok(plantations.every((p) => p.supprimeLe));
  assert.equal(Exemple.estAffichee(reouverte), false);
});

test("[T09] l'exemple chargé est reconnu après réouverture, et oublié après un import", () => {
  const stockage = stockageEnMemoire();
  Exemple.charger(Store.ouvrir(stockage), 2027);
  assert.equal(Exemple.estAffichee(Store.ouvrir(stockage)), true);

  const autre = Store.ouvrir(stockageEnMemoire());
  autre.ajouter("espaces", { nom: "planche importée", surface: 20, type: "abri" });
  Store.ouvrir(stockage).importer(autre.exporter());
  assert.equal(Exemple.estAffichee(Store.ouvrir(stockage)), false);
});
