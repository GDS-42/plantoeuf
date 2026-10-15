// Tranche R2 — la ferme d'exemple du Sud de La Réunion (T51 : EX-51 à EX-54), sans navigateur.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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

function exemple(annee = 2027) {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  Exemple.charger(ferme, annee);
  const d = {};
  for (const objet of Store.OBJETS) d[objet] = ferme.lister(objet);
  return { stockage, ferme, d };
}

test("[T51] EX-51 : le cas type du brief — un maraîcher seul, environ 1,5 ha, 200 poules, jamais plus de 250 à la fois", () => {
  const { d } = exemple();
  const surface = d.espaces.reduce((s, e) => s + e.surface, 0);
  // Les espaces cultivés tiennent dans les 1,5 ha (le reste : parcours des poules, engrais verts, chemins).
  assert.ok(surface > 3000 && surface <= 15000, `${surface} m²`);
  assert.ok(d.espaces.some((e) => e.type === "abri") && d.espaces.some((e) => e.type === "plein_champ"));
  assert.equal(d.lots.reduce((s, l) => s + l.effectif, 0), 200);
  // Sous 250 poules présentes chaque jour : vente directe des œufs sans centre d'emballage.
  for (let jour = new Date(Date.UTC(2027, 0, 1)); jour.getUTCFullYear() === 2027; jour.setUTCDate(jour.getUTCDate() + 1)) {
    const iso = jour.toISOString().slice(0, 10);
    const presentes = d.lots.filter((l) => l.arrivee <= iso && iso <= l.reforme).reduce((s, l) => s + l.effectif, 0);
    assert.ok(presentes <= 250, `${iso} : ${presentes} poules`);
  }
});

test("[T51] EX-51 : la ferme produit et vend sur les douze mois de l'année de chargement, sans sur-occupation", () => {
  const { d } = exemple();
  for (const objet of ["plantations"]) for (const e of d[objet]) assert.match(e.date, /^2027-/);
  const tableau = Calc.tableau(d);
  const mois = Array.from({ length: 12 }, (_, i) => `2027-${String(i + 1).padStart(2, "0")}`);
  for (const m of mois) assert.ok(tableau.total.mois[m] && tableau.total.mois[m].ca.mediane > 0, m);
  // Des légumes récoltés dans au moins dix mois sur douze, saison chaude comprise.
  const moisDeLegumes = mois.filter((m) => tableau.lignes.some((l) => l.mois[m] && l.mois[m].ca.mediane > 0));
  assert.ok(moisDeLegumes.length >= 10, moisDeLegumes.join(", "));
  assert.deepEqual(Calc.surOccupations(d), {});
  // Chaque culture a ses coûts de mise en place (EX-50) et au moins une plantation.
  for (const culture of d.cultures) {
    assert.ok(culture.densite > 0 && culture.prixUnite && culture.intrants, culture.nom);
    assert.ok(d.plantations.some((p) => d.varietes.find((v) => v.id === p.varieteId).cultureId === culture.id), culture.nom);
  }
});

test("[T51] EX-52 : la ferme d'exemple porte ses charges fixes, et les chiffres clés en donnent le revenu", () => {
  const { d } = exemple();
  assert.ok(d.charges.length >= 5);
  for (const charge of d.charges) assert.ok(["mois", "an"].includes(charge.periodicite), charge.nom);
  const cles = Calc.chiffresCles(Calc.tableau(d));
  assert.ok(cles.charges && cles.charges.mediane > 0);
  assert.ok(cles.revenu);
  assert.ok(Math.abs(cles.revenu.mediane - (cles.marge.mediane - cles.charges.mediane)) < 1e-6);
});

test("[T51] EX-53 : les œufs se vendent par des débouchés, au marché et en paniers, pas à l'épicerie", () => {
  const { d } = exemple();
  const points = new Map(d.pointsVente.map((p) => [p.id, p.nom]));
  const oeufs = d.debouches.filter((x) => x.produitId === Calc.OEUFS).map((x) => points.get(x.pointVenteId));
  assert.ok(oeufs.length >= 2, oeufs.join(", "));
  assert.ok(oeufs.some((nom) => /marché/i.test(nom)) && oeufs.some((nom) => /panier/i.test(nom)), oeufs.join(", "));
  assert.equal(oeufs.some((nom) => /épicerie/i.test(nom)), false);
  const { poules } = Calc.tableau(d);
  assert.equal(poules.aDebouche, true);
  assert.ok(poules.total.ca.mediane > 0);
});

test("[T51] EX-54 : effacer l'exemple retire aussi ses charges fixes et ses débouchés d'œufs, et seulement eux", () => {
  const { stockage, ferme } = exemple();
  const mienne = ferme.ajouter("charges", { nom: "mon assurance", montant: Store.fourchette(500), periodicite: "an" });
  Exemple.effacer(ferme);
  const reouverte = Store.ouvrir(stockage);
  assert.deepEqual(reouverte.lister("charges").map((c) => c.id), [mienne.id]);
  for (const objet of ["debouches", "lots", "vehicules", "pointsVente", "plantations"]) assert.deepEqual(reouverte.lister(objet), [], objet);
  assert.equal(Exemple.estAffichee(reouverte), false);
});

test("[T51] exemple_tout_sourcé : chaque culture, variété, charge et point de vente de l'exemple figure dans le dossier de données", () => {
  const dossier = fs.readFileSync(path.join(__dirname, "../docs/specs/R2/DONNEES.md"), "utf8");
  const { d } = exemple();
  for (const objet of ["cultures", "varietes", "charges"]) {
    for (const e of d[objet]) assert.ok(dossier.includes(e.nom), `${objet} : ${e.nom}`);
  }
  for (const point of d.pointsVente) assert.ok(dossier.includes(point.nom), point.nom);
  // Le dossier compte les plantations de l'exemple.
  assert.ok(dossier.includes(`${Exemple.NOMBRE_DE_PLANTATIONS} plantations`), String(Exemple.NOMBRE_DE_PLANTATIONS));
});
