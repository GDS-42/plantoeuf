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
