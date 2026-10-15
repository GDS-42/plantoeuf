// Tranche R4 — rotation et associations : le modèle (T59 : EX-61).
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
const SOLANACEES = { nom: "Solanacées", delaiRetour: f(3, 4, 5), note: "flétrissement bactérien" };
const TOMATE = { nom: "tomate", famille: "Solanacées", groupe: "fruit", unite: "kg", rendement: f(12), prix: f(3.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 };
const ROTATION = { nom: "Exigence décroissante", groupes: ["fruit", "feuille", "racine", "bulbe", "legumineuse", "engrais_vert"] };

test("[T59] EX-61 : le modèle compte les familles, les associations et les rotations ; format exporté en version 6", () => {
  for (const objet of ["familles", "associations", "rotations"]) assert.ok(Store.OBJETS.includes(objet), objet);
  assert.ok(Store.VERSION >= 6);
  assert.deepEqual(Store.GROUPES, ["feuille", "fruit", "racine", "bulbe", "legumineuse", "engrais_vert"]);
});

test("[T59] EX-61 : une famille s'enregistre avec UUID, dates et suppression logique, et se retrouve après réouverture ; un délai désordonné est refusé", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const famille = ferme.ajouter("familles", SOLANACEES);
  assert.match(famille.id, UUID_V4);
  assert.ok(famille.creeLe && famille.modifieLe);
  assert.equal(famille.supprimeLe, null);
  assert.deepEqual(Store.ouvrir(stockage).obtenir("familles", famille.id).delaiRetour, f(3, 4, 5));
  ferme.modifier("familles", famille.id, { delaiRetour: f(4) });
  assert.deepEqual(Store.ouvrir(stockage).obtenir("familles", famille.id).delaiRetour, f(4));
  assert.throws(() => ferme.ajouter("familles", { nom: "Brassicacées", delaiRetour: f(5, 4, 3) }), (e) => e.code === "fourchette_desordonnee");
  ferme.supprimer("familles", famille.id);
  assert.deepEqual(Store.ouvrir(stockage).lister("familles"), []);
  assert.equal(Store.ouvrir(stockage).lister("familles", { avecSupprimes: true }).length, 1);
});

test("[T59] EX-61 : une culture garde son groupe ; un groupe inconnu est refusé, une culture sans groupe reste permise", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const tomate = ferme.ajouter("cultures", TOMATE);
  assert.equal(Store.ouvrir(stockage).obtenir("cultures", tomate.id).groupe, "fruit");
  assert.throws(() => ferme.ajouter("cultures", { ...TOMATE, groupe: "tubercule" }), (e) => e.code === "groupe_inconnu");
  assert.throws(() => ferme.modifier("cultures", tomate.id, { groupe: "tubercule" }), (e) => e.code === "groupe_inconnu");
  const { groupe, ...sansGroupe } = TOMATE;
  assert.ok(ferme.ajouter("cultures", sansGroupe).id);
  assert.ok(ferme.ajouter("cultures", { ...sansGroupe, groupe: "" }).id);
});

test("[T59] EX-61 : une association a un type, deux cultures différentes et un effet ; une association mal formée est refusée", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const a = ferme.ajouter("associations", { type: "precedent", cultureA: "c1", cultureB: "c2", effet: "favorable", note: "" });
  assert.deepEqual(Store.ouvrir(stockage).lister("associations").map((x) => [x.type, x.cultureA, x.cultureB, x.effet]), [["precedent", "c1", "c2", "favorable"]]);
  ferme.modifier("associations", a.id, { effet: "defavorable" });
  assert.equal(Store.ouvrir(stockage).obtenir("associations", a.id).effet, "defavorable");
  for (const mauvaise of [
    { type: "rotation", cultureA: "c1", cultureB: "c2", effet: "favorable" },
    { type: "voisinage", cultureA: "c1", cultureB: "c2", effet: "neutre" },
    { type: "voisinage", cultureA: "c1", cultureB: "c1", effet: "favorable" },
    { type: "voisinage", cultureA: "", cultureB: "c2", effet: "favorable" },
  ]) {
    assert.throws(() => ferme.ajouter("associations", mauvaise), (e) => e.code === "association_invalide", JSON.stringify(mauvaise));
  }
  assert.throws(() => ferme.modifier("associations", a.id, { cultureB: "c1" }), (e) => e.code === "association_invalide");
});

test("[T59] EX-61 : une rotation ordonne de 2 à 6 groupes distincts ; toute autre liste est refusée", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const r = ferme.ajouter("rotations", ROTATION);
  assert.deepEqual(Store.ouvrir(stockage).obtenir("rotations", r.id).groupes, ROTATION.groupes);
  assert.ok(ferme.ajouter("rotations", { nom: "courte", groupes: ["fruit", "feuille"] }).id);
  for (const groupes of [["fruit"], [], ["fruit", "fruit"], ["fruit", "tubercule"], [...ROTATION.groupes, "fruit"], "fruit, feuille"]) {
    assert.throws(() => ferme.ajouter("rotations", { nom: "x", groupes }), (e) => e.code === "rotation_invalide", JSON.stringify(groupes));
  }
});

test("[T59] EX-61 : export puis import à l'identique en version 6 ; un fichier de version 5 ou 1 s'importe avec des listes vides", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  const famille = ferme.ajouter("familles", SOLANACEES);
  const tomate = ferme.ajouter("cultures", TOMATE);
  ferme.ajouter("associations", { type: "voisinage", cultureA: tomate.id, cultureB: "c2", effet: "favorable" });
  ferme.ajouter("rotations", ROTATION);
  ferme.supprimer("familles", famille.id);
  const fichier = ferme.exporter();
  assert.equal(fichier.version, Store.VERSION);
  assert.equal(fichier.familles.length, 1);
  const autre = Store.ouvrir(stockageEnMemoire());
  autre.importer(JSON.parse(JSON.stringify(fichier)));
  const { exporteLe: a, ...sans1 } = fichier;
  const { exporteLe: b, ...sans2 } = autre.exporter();
  assert.deepEqual(sans2, sans1);

  for (const version of [5, 1]) {
    const ancien = JSON.parse(JSON.stringify(fichier));
    ancien.version = version;
    for (const objet of ["familles", "associations", "rotations"]) delete ancien[objet];
    const migree = Store.ouvrir(stockageEnMemoire());
    migree.importer(ancien);
    for (const objet of ["familles", "associations", "rotations"]) assert.deepEqual(migree.lister(objet), [], `${version} ${objet}`);
    assert.equal(migree.lister("cultures")[0].groupe, "fruit");
    assert.equal(migree.exporter().version, Store.VERSION);
  }
  // Un fichier dont une rotation est mal formée est refusé, sans rien changer.
  const mauvais = JSON.parse(JSON.stringify(fichier));
  mauvais.rotations[0].groupes = ["fruit"];
  const cible = Store.ouvrir(stockageEnMemoire());
  assert.throws(() => cible.importer(mauvais), (e) => e.code === "rotation_invalide");
  assert.deepEqual(cible.lister("cultures"), []);
});
