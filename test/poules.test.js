// Tranche S3 — poules pondeuses : store et calculs, sans navigateur.
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

// Contexte des scénarios S7 à S9 : 100 poules arrivées le lundi 30 mars 2026, ponte du 6 avril au 10 mai.
const CHAMPS_LOT = {
  nom: "Lot 1", effectif: 100, arrivee: "2026-03-30", debutPonte: "2026-04-06", reforme: "2026-05-10",
  ponte: f(0.8), pertes: 5, aliment: f(120), prixAliment: f(0.6), prixOeuf: f(0.4),
};

// ---- T26 : le modèle

test("[T26] un lot de poules reçoit un UUID et ses dates, et se retrouve après réouverture", () => {
  const stockage = stockageEnMemoire();
  const lot = Store.ouvrir(stockage).ajouter("lots", CHAMPS_LOT);
  assert.match(lot.id, UUID_V4);
  assert.equal(lot.supprimeLe, null);
  assert.ok(lot.creeLe && lot.modifieLe);
  const reouverte = Store.ouvrir(stockage);
  assert.deepEqual(reouverte.lister("lots"), [lot]);
  reouverte.supprimer("lots", lot.id);
  assert.deepEqual(Store.ouvrir(stockage).lister("lots"), []);
  assert.equal(Store.ouvrir(stockage).lister("lots", { avecSupprimes: true }).length, 1);
});

test("[T26] un lot refuse une fourchette désordonnée, et des dates hors de l'ordre arrivée, début de ponte, réforme", () => {
  const stockage = stockageEnMemoire();
  const ferme = Store.ouvrir(stockage);
  const desordre = { basse: 3, mediane: 2, haute: 4 };
  for (const champ of ["ponte", "aliment", "prixAliment", "prixOeuf"]) {
    assert.throws(() => ferme.ajouter("lots", { ...CHAMPS_LOT, [champ]: desordre }), { code: "fourchette_desordonnee" }, champ);
  }
  assert.throws(() => ferme.ajouter("lots", { ...CHAMPS_LOT, debutPonte: "2026-03-01" }), { code: "dates_desordonnees" });
  assert.throws(() => ferme.ajouter("lots", { ...CHAMPS_LOT, reforme: "2026-04-01" }), { code: "dates_desordonnees" });
  const lot = ferme.ajouter("lots", CHAMPS_LOT);
  assert.throws(() => ferme.modifier("lots", lot.id, { reforme: "2026-04-05" }), { code: "dates_desordonnees" });
  assert.deepEqual(Store.ouvrir(stockage).lister("lots"), [lot]);
  // Le même jour pour l'arrivée, le début de ponte et la réforme reste permis.
  ferme.modifier("lots", lot.id, { arrivee: "2026-04-06", debutPonte: "2026-04-06", reforme: "2026-04-06" });
});

test("[T26] export puis import restituent les lots à l'identique, supprimés compris", () => {
  const source = Store.ouvrir(stockageEnMemoire());
  const garde = source.ajouter("lots", CHAMPS_LOT);
  const reforme = source.ajouter("lots", { ...CHAMPS_LOT, nom: "Lot 0" });
  source.supprimer("lots", reforme.id);
  const fichier = JSON.parse(JSON.stringify(source.exporter()));
  assert.ok(Store.VERSION >= 3);
  assert.equal(fichier.version, Store.VERSION);
  const cible = Store.ouvrir(stockageEnMemoire());
  cible.importer(fichier);
  assert.deepEqual(cible.lister("lots", { avecSupprimes: true }), source.lister("lots", { avecSupprimes: true }));
  assert.deepEqual(cible.lister("lots").map((l) => l.id), [garde.id]);
});

test("[T26] un fichier de version 1 (N1) ou 2 (N2), sans lots, s'importe par migration", () => {
  const n1 = { application: "plantoeuf", version: 1, exporteLe: "2026-10-13T08:00:00.000Z", espaces: [], cultures: [], varietes: [], plantations: [] };
  const n2 = { ...n1, version: 2, pointsVente: [], seances: [], debouches: [] };
  for (const fichier of [n1, n2]) {
    const ferme = Store.ouvrir(stockageEnMemoire());
    ferme.importer(fichier);
    assert.deepEqual(ferme.lister("lots"), [], `version ${fichier.version}`);
    assert.equal(ferme.exporter().version, Store.VERSION);
  }
  assert.throws(() => Store.ouvrir(stockageEnMemoire()).importer({ ...n2, version: Store.VERSION + 1 }), { code: "import_version" });
});

// ---- T28 : ponte et aliment par semaine (EX-26, scénario S7)

const Calc = require("../src/calc.js");

function proche(obtenu, attendu, message) {
  assert.ok(Math.abs(obtenu - attendu) < 1e-9, `${message || ""} ${obtenu} ≠ ${attendu}`);
}

function procheFourchette(obtenue, attendue, message) {
  for (const cle of ["basse", "mediane", "haute"]) proche(obtenue[cle], attendue[cle], `${message || ""} ${cle}`);
}

const LOT = { id: "l1", ...CHAMPS_LOT, creeLe: "2026-03-01T08:00:00.000Z", modifieLe: "2026-03-01T08:00:00.000Z", supprimeLe: null };
const AVRIL_MAI = ["2026-04-06", "2026-04-13", "2026-04-20", "2026-04-27", "2026-05-04"];

test("[T28] S7 : le lot pond 100 × 0,8 × 7 × 0,95 = 532 œufs par semaine, du lundi 6 avril au dimanche 10 mai", () => {
  procheFourchette(Calc.oeufsParSemaine(LOT), f(532));
  const semaines = Calc.poulesParSemaine({ lots: [LOT] });
  for (const lundi of AVRIL_MAI) procheFourchette(semaines.get(lundi).oeufs, f(532), lundi);
  procheFourchette(semaines.get("2026-03-30").oeufs, f(0));
  assert.equal(semaines.has("2026-05-11"), false);
  // Les œufs valent, sans débouché, le prix de l'œuf du lot.
  procheFourchette(semaines.get("2026-04-06").valeur, f(532 * 0.4));
});

test("[T28] S7 : l'aliment, 100 × 0,120 × 7 = 84 kg et 50,40 € par semaine, se compte de l'arrivée à la réforme : 6 semaines", () => {
  const semaines = Calc.poulesParSemaine({ lots: [LOT] });
  assert.deepEqual([...semaines.keys()], ["2026-03-30", ...AVRIL_MAI]);
  for (const [lundi, semaine] of semaines) {
    procheFourchette(semaine.alimentKg, f(84), lundi);
    procheFourchette(semaine.aliment, f(50.4), lundi);
  }
});

test("[T28] ponte_nulle_hors_periode : une semaine entamée ne compte que ses jours ; les lots s'additionnent ; un lot supprimé ne compte plus", () => {
  // Du mercredi 8 au mardi 14 avril : 5 jours la semaine du 6 avril, 2 jours celle du 13.
  const court = { ...LOT, id: "l2", arrivee: "2026-04-08", debutPonte: "2026-04-08", reforme: "2026-04-14", prixOeuf: f(0.5) };
  const seul = Calc.poulesParSemaine({ lots: [court] });
  assert.deepEqual([...seul.keys()], ["2026-04-06", "2026-04-13"]);
  procheFourchette(seul.get("2026-04-06").oeufs, f(380));
  procheFourchette(seul.get("2026-04-13").oeufs, f(152));
  procheFourchette(seul.get("2026-04-13").aliment, f(14.4));

  const deux = Calc.poulesParSemaine({ lots: [LOT, court] });
  procheFourchette(deux.get("2026-04-06").oeufs, f(532 + 380));
  procheFourchette(deux.get("2026-04-06").valeur, f(532 * 0.4 + 380 * 0.5));
  const supprime = Calc.poulesParSemaine({ lots: [LOT, { ...court, supprimeLe: "2026-04-01T08:00:00.000Z" }] });
  procheFourchette(supprime.get("2026-04-06").oeufs, f(532));
});

test("[T28] chaque niveau de la fourchette se calcule avec les valeurs de ce niveau", () => {
  const lot = { ...LOT, ponte: f(0.7, 0.8, 0.9), aliment: f(110, 120, 130), prixAliment: f(0.5, 0.6, 0.7), prixOeuf: f(0.3, 0.4, 0.5) };
  const semaine = Calc.poulesParSemaine({ lots: [lot] }).get("2026-04-13");
  procheFourchette(semaine.oeufs, f(100 * 0.7 * 7 * 0.95, 532, 100 * 0.9 * 7 * 0.95));
  procheFourchette(semaine.valeur, f(100 * 0.7 * 7 * 0.95 * 0.3, 532 * 0.4, 100 * 0.9 * 7 * 0.95 * 0.5));
  procheFourchette(semaine.aliment, f(100 * 0.11 * 7 * 0.5, 50.4, 100 * 0.13 * 7 * 0.7));
});
