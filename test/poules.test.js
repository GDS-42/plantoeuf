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

// ---- T29 : l'atelier poules dans le tableau économique (EX-27, scénarios S7 et S9)

function ordonnee(fourchette) {
  return fourchette.basse <= fourchette.mediane + 1e-9 && fourchette.mediane <= fourchette.haute + 1e-9;
}

// La courgette du scénario S1 (N1) : 33,75 kg par semaine du 30 avril au 24 juin 2026, 675 € sur la saison.
const COURGETTE = { id: "c1", nom: "courgette", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10 };
const BLACK_BEAUTY = { id: "v1", cultureId: "c1", nom: "Black Beauty", rendement: null, prix: null, joursAvantRecolte: null, semainesRecolte: null, pertes: null };
const PLANTATION_S1 = { id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" };

test("[T29] S7 : l'atelier poules donne par mois les œufs, le chiffre d'affaires, l'aliment et sa marge", () => {
  const tableau = Calc.tableau({ lots: [LOT] });
  assert.deepEqual(tableau.mois, ["2026-04", "2026-05"]);
  assert.deepEqual(tableau.lignes, []);
  const { poules } = tableau;
  assert.equal(poules.lots, 1);
  assert.equal(poules.effectif, 100);
  procheFourchette(poules.mois["2026-04"].volume, f(2128));
  procheFourchette(poules.mois["2026-05"].volume, f(532));
  procheFourchette(poules.mois["2026-04"].aliment, f(252));
  procheFourchette(poules.mois["2026-05"].aliment, f(50.4));
  procheFourchette(poules.total.volume, f(2660));
  procheFourchette(poules.total.ca, f(1064));
  procheFourchette(poules.total.aliment, f(302.4));
  procheFourchette(poules.total.marge, f(1064 - 302.4));
});

test("[T29] S9 : la marge de la ferme déduit l'aliment ; le chiffre d'affaires de la ferme compte les œufs", () => {
  const seul = Calc.tableau({ lots: [LOT] }).total;
  procheFourchette(seul.total.ca, f(1064));
  procheFourchette(seul.total.aliment, f(302.4));
  procheFourchette(seul.total.marge, f(761.6));
  procheFourchette(seul.mois["2026-04"].marge, f(2128 * 0.4 - 252));

  const avecCourgette = Calc.tableau({ cultures: [COURGETTE], varietes: [BLACK_BEAUTY], plantations: [PLANTATION_S1], lots: [LOT] });
  assert.deepEqual(avecCourgette.mois, ["2026-04", "2026-05", "2026-06"]);
  assert.equal(avecCourgette.lignes.length, 1);
  procheFourchette(avecCourgette.total.total.ca, f(540 + 1064, 675 + 1064, 810 + 1064));
  procheFourchette(avecCourgette.total.total.marge, f(540 + 1064 - 302.4, 675 + 1064 - 302.4, 810 + 1064 - 302.4));
});

test("[T29] sans_lot_comme_n2 : une ferme sans lot actif n'a ni atelier poules ni aliment dans son tableau", () => {
  const sansLot = { cultures: [COURGETTE], varietes: [BLACK_BEAUTY], plantations: [PLANTATION_S1] };
  const attendu = Calc.tableau(sansLot);
  assert.equal(attendu.poules, null);
  assert.deepEqual(Object.keys(attendu.total.total).sort(), ["ca", "couts", "marge"]);
  const lotSupprime = { ...LOT, supprimeLe: "2026-04-01T08:00:00.000Z" };
  assert.deepEqual(Calc.tableau({ ...sansLot, lots: [lotSupprime] }), attendu);
  assert.deepEqual(Calc.tableau({ ...sansLot, lots: [] }), attendu);
});

test("[T29] les cases de l'atelier et de la ferme restent ordonnées ; la marge va du pire au meilleur", () => {
  const lot = { ...LOT, ponte: f(0.6, 0.8, 0.9), aliment: f(110, 120, 140), prixAliment: f(0.5, 0.6, 0.8), prixOeuf: f(0.3, 0.4, 0.45) };
  const tableau = Calc.tableau({ lots: [lot] });
  for (const m of tableau.mois) {
    for (const cle of ["volume", "ca", "aliment", "marge"]) assert.ok(ordonnee(tableau.poules.mois[m][cle]), `${m} ${cle}`);
    for (const cle of ["ca", "aliment", "marge"]) assert.ok(ordonnee(tableau.total.mois[m][cle]), `ferme ${m} ${cle}`);
  }
  const { ca, aliment, marge } = tableau.poules.total;
  proche(marge.basse, ca.basse - aliment.haute);
  proche(marge.haute, ca.haute - aliment.basse);
});

// ---- T30 : les œufs dans les ventes (EX-28, scénario S8)

// Le marché de Saint-Paul de N2, le samedi du 2 mai au 27 juin, et un débouché œufs : 0,50 € l'œuf, 300 œufs par séance.
const MARCHE = { id: "pv1", nom: "marché de Saint-Paul", distanceKm: 12, coutKm: f(0.4) };
const SAMEDI = { id: "s1", pointVenteId: "pv1", jour: 6, debut: "2026-05-02", fin: "2026-06-27", frais: f(15) };
const DEBOUCHE_OEUFS = { id: "d1", pointVenteId: "pv1", produitId: "oeufs", prix: f(0.5), volumeParSeance: f(300) };

function fermeS8(complements = {}) {
  return { lots: [LOT], pointsVente: [MARCHE], seances: [SAMEDI], debouches: [DEBOUCHE_OEUFS], ...complements };
}

function caseOeufs(od, lundi) {
  return od.lignes.find((l) => l.produitId === Calc.OEUFS).semaines[lundi];
}

test("[T30] S8 : les œufs dépassent de 232 les semaines du 27 avril et du 4 mai, et manquent de 300 celle du 11 mai, sûrement", () => {
  const od = Calc.offreDemande(fermeS8());
  for (const lundi of ["2026-04-27", "2026-05-04"]) {
    const c = caseOeufs(od, lundi);
    assert.equal(c.etat, "depasse", lundi);
    proche(c.ecart, 232, lundi);
    assert.equal(c.sur, true, lundi);
  }
  const manque = caseOeufs(od, "2026-05-11");
  assert.equal(manque.etat, "manque");
  proche(manque.ecart, -300);
  assert.equal(manque.sur, true);
  // Sans débouché, la ligne des œufs a une offre mais pas de demande.
  const sans = Calc.offreDemande({ lots: [LOT] });
  assert.equal(caseOeufs(sans, "2026-04-13").etat, "sans_debouche");
  procheFourchette(caseOeufs(sans, "2026-04-13").offre, f(532));
});

test("[T30] S8 : le tableau donne 600 œufs vendus et 300 € de chiffre d'affaires : 150 € en avril, 150 € en mai", () => {
  const { poules, total } = Calc.tableau(fermeS8());
  assert.equal(poules.aDebouche, true);
  procheFourchette(poules.total.volume, f(600));
  procheFourchette(poules.total.ca, f(300));
  procheFourchette(poules.mois["2026-04"].ca, f(150));
  procheFourchette(poules.mois["2026-05"].ca, f(150));
  procheFourchette(poules.total.aliment, f(302.4));
  procheFourchette(poules.total.marge, f(300 - 302.4));
  procheFourchette(total.total.couts, f(221.4));
  procheFourchette(total.total.marge, f(300 - 221.4 - 302.4));
});

test("[T30] S8 : le marché de Saint-Paul encaisse les œufs dans la vue « Points de vente »", () => {
  const [marche] = Calc.pointsDeVente(fermeS8()).points;
  procheFourchette(marche.total.ca, f(300));
  procheFourchette(marche.total.resultat, f(300 - 221.4));
});

test("[T30] un débouché d'œufs sans lot ne montre qu'une demande ; un débouché d'œufs supprimé rend les œufs à leur prix de lot", () => {
  const sansLot = Calc.offreDemande(fermeS8({ lots: [] }));
  const c = caseOeufs(sansLot, "2026-05-04");
  assert.equal(c.etat, "manque");
  procheFourchette(c.offre, f(0));
  assert.equal(Calc.tableau(fermeS8({ lots: [] })).poules, null);

  const supprime = Calc.tableau(fermeS8({ debouches: [{ ...DEBOUCHE_OEUFS, supprimeLe: "2026-04-01T08:00:00.000Z" }] }));
  assert.equal(supprime.poules.aDebouche, false);
  procheFourchette(supprime.poules.total.ca, f(1064));
});

test("[T30] 200 plantations, 10 points de vente, 20 séances, 100 débouchés et 10 lots se calculent en moins d'une seconde", () => {
  const cultures = [];
  const varietes = [];
  const plantations = [];
  for (let c = 0; c < 20; c++) {
    cultures.push({ ...COURGETTE, id: `c${c}`, nom: `culture ${c}` });
    varietes.push({ ...BLACK_BEAUTY, id: `v${c}`, cultureId: `c${c}` });
  }
  for (let i = 0; i < 200; i++) plantations.push({ ...PLANTATION_S1, id: `p${i}`, varieteId: `v${i % 20}`, date: Calc.ajouterJours("2026-01-05", 3 * i) });
  const pointsVente = [];
  const seances = [];
  const debouches = [];
  for (let p = 0; p < 10; p++) {
    pointsVente.push({ ...MARCHE, id: `pv${p}`, nom: `point ${p}` });
    for (let s = 0; s < 2; s++) seances.push({ ...SAMEDI, id: `s${p}-${s}`, pointVenteId: `pv${p}`, jour: 1 + ((p + s) % 7), debut: "2026-01-01", fin: "2027-06-30" });
    for (let d = 0; d < 10; d++) {
      const produitId = d === 0 ? "oeufs" : `c${(p + d) % 20}`;
      debouches.push({ ...DEBOUCHE_OEUFS, id: `d${p}-${d}`, pointVenteId: `pv${p}`, produitId, prix: f(2 + p / 10), volumeParSeance: f(5, 8, 12) });
    }
  }
  const lots = [];
  for (let l = 0; l < 10; l++) lots.push({ ...LOT, id: `l${l}`, arrivee: Calc.ajouterJours("2026-01-05", 30 * l), debutPonte: Calc.ajouterJours("2026-02-02", 30 * l), reforme: Calc.ajouterJours("2027-01-31", 30 * l) });
  const donnees = { cultures, varietes, plantations, pointsVente, seances, debouches, lots };
  const debut = process.hrtime.bigint();
  const tableau = Calc.tableau(donnees);
  Calc.offreDemande(donnees);
  Calc.pointsDeVente(donnees);
  const ms = Number(process.hrtime.bigint() - debut) / 1e6;
  assert.equal(tableau.poules.lots, 10);
  assert.ok(ms < 1000, `${ms} ms`);
});
