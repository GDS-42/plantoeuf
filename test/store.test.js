// T02 — modèle de données : UUID, dates, suppression logique, fourchette ordonnée.
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

// Horloge injectée : rend l'instant courant, que le test avance à la main.
function horlogeManuelle(debut) {
  let instant = new Date(debut).getTime();
  const horloge = () => new Date(instant);
  horloge.avancer = (ms) => {
    instant += ms;
  };
  return horloge;
}

const UNE_HEURE = 3600 * 1000;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const EXEMPLES = {
  espaces: { nom: "planche 1", surface: 30, type: "plein_champ" },
  cultures: {
    nom: "courgette",
    famille: "Cucurbitacées",
    unite: "kg",
    rendement: { basse: 2, mediane: 3, haute: 4 },
    prix: { basse: 2, mediane: 2.5, haute: 3 },
    joursAvantRecolte: 60,
    semainesRecolte: 8,
    pertes: 10,
  },
  varietes: { nom: "Black Beauty", cultureId: "c1", joursAvantRecolte: 55 },
  plantations: { varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" },
};

test("[T02] un enregistrement reçoit un UUID, ses dates de création et de modification, et supprimeLe nul", () => {
  const horloge = horlogeManuelle("2026-10-13T08:00:00.000Z");
  const ferme = Store.ouvrir(stockageEnMemoire(), { horloge });

  const espace = ferme.ajouter("espaces", EXEMPLES.espaces);

  assert.match(espace.id, UUID_V4);
  assert.equal(espace.creeLe, "2026-10-13T08:00:00.000Z");
  assert.equal(espace.modifieLe, "2026-10-13T08:00:00.000Z");
  assert.equal(espace.supprimeLe, null);
  assert.equal(espace.nom, "planche 1");
  assert.equal(espace.surface, 30);
});

test("[T02] chaque enregistrement a un identifiant distinct", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  const ids = new Set();
  for (let i = 0; i < 50; i++) ids.add(ferme.ajouter("espaces", { nom: "planche " + i }).id);
  assert.equal(ids.size, 50);
});

test("[T02] les quatre objets du noyau sont enregistrés et retrouvés après réouverture", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const crees = {};
  for (const type of Object.keys(EXEMPLES)) crees[type] = ferme.ajouter(type, EXEMPLES[type]);

  const reouverte = Store.ouvrir(stockage);
  for (const type of Object.keys(EXEMPLES)) {
    assert.deepEqual(reouverte.lister(type), [crees[type]], type);
    assert.deepEqual(reouverte.obtenir(type, crees[type].id), crees[type], type);
  }
});

test("[T02] un objet absent du modèle est refusé", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  assert.throws(() => ferme.ajouter("pointsDeVente", { nom: "marché" }), { code: "objet_inconnu" });
});

test("[T02] modifier change les champs et la date de modification, pas la date de création", () => {
  const horloge = horlogeManuelle("2026-10-13T08:00:00.000Z");
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage, { horloge });
  const espace = ferme.ajouter("espaces", EXEMPLES.espaces);

  horloge.avancer(UNE_HEURE);
  const modifie = ferme.modifier("espaces", espace.id, { surface: 45 });

  assert.equal(modifie.id, espace.id);
  assert.equal(modifie.surface, 45);
  assert.equal(modifie.nom, "planche 1");
  assert.equal(modifie.creeLe, "2026-10-13T08:00:00.000Z");
  assert.equal(modifie.modifieLe, "2026-10-13T09:00:00.000Z");
  assert.deepEqual(Store.ouvrir(stockage).obtenir("espaces", espace.id), modifie);
});

test("[T02] l'identifiant et les dates ne se changent pas par la saisie", () => {
  const horloge = horlogeManuelle("2026-10-13T08:00:00.000Z");
  const ferme = Store.ouvrir(stockageEnMemoire(), { horloge });
  const espace = ferme.ajouter("espaces", { ...EXEMPLES.espaces, id: "impose", creeLe: "2000-01-01T00:00:00.000Z", supprimeLe: "2000-01-01T00:00:00.000Z" });
  assert.match(espace.id, UUID_V4);
  assert.equal(espace.creeLe, "2026-10-13T08:00:00.000Z");
  assert.equal(espace.supprimeLe, null);

  horloge.avancer(UNE_HEURE);
  const modifie = ferme.modifier("espaces", espace.id, { id: "autre", creeLe: "2000-01-01T00:00:00.000Z", modifieLe: "2000-01-01T00:00:00.000Z", supprimeLe: "2000-01-01T00:00:00.000Z" });
  assert.equal(modifie.id, espace.id);
  assert.equal(modifie.creeLe, "2026-10-13T08:00:00.000Z");
  assert.equal(modifie.modifieLe, "2026-10-13T09:00:00.000Z");
  assert.equal(modifie.supprimeLe, null);
});

test("[T02] suppression_logique_seulement : supprimer date l'enregistrement sans l'effacer", () => {
  const horloge = horlogeManuelle("2026-10-13T08:00:00.000Z");
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage, { horloge });
  const garde = ferme.ajouter("plantations", EXEMPLES.plantations);
  const supprime = ferme.ajouter("plantations", { ...EXEMPLES.plantations, surface: 20 });

  horloge.avancer(UNE_HEURE);
  ferme.supprimer("plantations", supprime.id);

  const reouverte = Store.ouvrir(stockage);
  assert.deepEqual(reouverte.lister("plantations").map((p) => p.id), [garde.id]);
  const tous = reouverte.lister("plantations", { avecSupprimes: true });
  assert.deepEqual(tous.map((p) => p.id), [garde.id, supprime.id]);
  assert.equal(tous[1].supprimeLe, "2026-10-13T09:00:00.000Z");
  assert.equal(tous[1].modifieLe, "2026-10-13T09:00:00.000Z");
  assert.equal(tous[1].surface, 20);
  assert.equal(reouverte.obtenir("plantations", supprime.id).supprimeLe, "2026-10-13T09:00:00.000Z");
});

test("[T02] supprimer à nouveau garde la première date de suppression", () => {
  const horloge = horlogeManuelle("2026-10-13T08:00:00.000Z");
  const ferme = Store.ouvrir(stockageEnMemoire(), { horloge });
  const espace = ferme.ajouter("espaces", EXEMPLES.espaces);
  ferme.supprimer("espaces", espace.id);
  horloge.avancer(UNE_HEURE);
  ferme.supprimer("espaces", espace.id);
  assert.equal(ferme.obtenir("espaces", espace.id).supprimeLe, "2026-10-13T08:00:00.000Z");
});

test("[T02] un enregistrement rendu par le store ne change pas les données enregistrées", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  const culture = ferme.ajouter("cultures", EXEMPLES.cultures);
  culture.nom = "autre";
  culture.rendement.mediane = 99;
  ferme.lister("cultures")[0].prix.haute = 99;
  const relue = ferme.obtenir("cultures", culture.id);
  assert.equal(relue.nom, "courgette");
  assert.deepEqual(relue.rendement, { basse: 2, mediane: 3, haute: 4 });
  assert.deepEqual(relue.prix, { basse: 2, mediane: 2.5, haute: 3 });
});

test("[T02] un seul nombre remplit les trois valeurs de la fourchette", () => {
  assert.deepEqual(Store.fourchette(3), { basse: 3, mediane: 3, haute: 3 });
  assert.deepEqual(Store.fourchette(2, 2.5, 3), { basse: 2, mediane: 2.5, haute: 3 });
});

test("[T02] fourchette_ordonnee : basse ≤ médiane ≤ haute, sinon refus", () => {
  assert.equal(Store.fourchetteOrdonnee({ basse: 1, mediane: 1, haute: 2 }), true);
  assert.equal(Store.fourchetteOrdonnee({ basse: 2, mediane: 1, haute: 3 }), false);
  assert.equal(Store.fourchetteOrdonnee({ basse: 1, mediane: 3, haute: 2 }), false);
  assert.throws(() => Store.fourchette(3, 2, 4));
  assert.throws(() => Store.fourchette(2, 4, 3));
  assert.throws(() => Store.fourchette(2, 3));
  assert.throws(() => Store.fourchette(Number.NaN));
});

test("[T02] fourchette_ordonnee : le store refuse d'enregistrer une fourchette désordonnée", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  assert.throws(() => ferme.ajouter("cultures", { ...EXEMPLES.cultures, rendement: { basse: 4, mediane: 3, haute: 5 } }));
  assert.deepEqual(ferme.lister("cultures"), []);

  const culture = ferme.ajouter("cultures", EXEMPLES.cultures);
  assert.throws(() => ferme.modifier("cultures", culture.id, { prix: { basse: 3, mediane: 2.5, haute: 2 } }));
  assert.deepEqual(ferme.obtenir("cultures", culture.id).prix, { basse: 2, mediane: 2.5, haute: 3 });
});

test("[T02] la saisie d'une fourchette accepte un nombre ou trois, avec la virgule décimale", () => {
  assert.deepEqual(Store.lireFourchette("3"), { basse: 3, mediane: 3, haute: 3 });
  assert.deepEqual(Store.lireFourchette(" 2,5 "), { basse: 2.5, mediane: 2.5, haute: 2.5 });
  assert.deepEqual(Store.lireFourchette("2 / 2,5 / 3"), { basse: 2, mediane: 2.5, haute: 3 });
  assert.equal(Store.lireFourchette("   "), null);
  assert.throws(() => Store.lireFourchette("3 / 2 / 4"));
  assert.throws(() => Store.lireFourchette("2 / 3"));
  assert.throws(() => Store.lireFourchette("trois"));
});
