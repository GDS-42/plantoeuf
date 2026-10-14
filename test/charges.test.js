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

// ---- T46 : charges fixes et revenu (EX-48, scénario S13)

const Calc = require("../src/calc.js");

function proche(obtenu, attendu, message) {
  assert.ok(Math.abs(obtenu - attendu) < 1e-9, `${message || ""} ${obtenu} ≠ ${attendu}`);
}
function procheFourchette(obtenue, attendue, message) {
  for (const cle of ["basse", "mediane", "haute"]) proche(obtenue[cle], attendue[cle], `${message || ""} ${cle}`);
}

// Scénario S12 : la courgette du scénario S1 de N1 (100 m² le 1er mars 2026), en plants ; S13 : plus deux charges fixes.
const COURGETTE = { id: "c1", nom: "courgette", unite: "kg", rendement: f(3), prix: f(2, 2.5, 3), joursAvantRecolte: 60, semainesRecolte: 8, pertes: 10,
  implantation: "plant", densite: 1, prixUnite: f(0.3, 0.4, 0.5), intrants: f(0.2) };
const VARIETE = { id: "v1", cultureId: "c1", nom: "Black Beauty" };
const PLANTATION = { id: "p1", varieteId: "v1", espaceId: "e1", surface: 100, date: "2026-03-01" };
const S12 = { espaces: [{ id: "e1", nom: "planche 1", surface: 100 }], cultures: [COURGETTE], varietes: [VARIETE], plantations: [PLANTATION] };
const CHARGES = [{ id: "ch1", nom: "Assurance", montant: f(600), periodicite: "an" }, { id: "ch2", nom: "Cotisation", montant: f(150), periodicite: "mois" }];
const S13 = { ...S12, charges: CHARGES };

test("[T46] EX-48 : une charge mensuelle compte son montant chaque mois, une charge annuelle un douzième", () => {
  procheFourchette(Calc.chargeParMois(CHARGES[0]), f(50));
  procheFourchette(Calc.chargeParMois(CHARGES[1]), f(150));
  procheFourchette(Calc.chargeParAn(CHARGES[0]), f(600));
  procheFourchette(Calc.chargeParAn(CHARGES[1]), f(1800));
  procheFourchette(Calc.chargeParMois({ ...CHARGES[0], montant: f(540, 600, 660) }), f(45, 50, 55));
});

test("[T46] S13 : la projection couvre 12 mois, de mars 2026 à février 2027, chacun avec 200 € de charges fixes", () => {
  const t = Calc.tableau(S13);
  assert.equal(t.mois.length, 12);
  assert.equal(t.mois[0], "2026-03");
  assert.equal(t.mois[11], "2027-02");
  for (const m of t.mois) procheFourchette(t.total.mois[m].charges, f(200), m);
  procheFourchette(t.total.total.charges, f(2400));
  // Les cultures et le chiffre d'affaires ne changent pas : les mois ajoutés sont vides.
  procheFourchette(t.lignes[0].total.ca, f(540, 675, 810));
  procheFourchette(t.lignes[0].mois["2026-12"].ca, f(0));
});

test("[T46] S13 : le revenu = marge − charges fixes : −1 930 / −1 785 / −1 640 € sur la projection", () => {
  const t = Calc.tableau(S13);
  procheFourchette(t.total.total.marge, f(470, 615, 760));
  procheFourchette(t.total.total.revenu, f(-1930, -1785, -1640));
  procheFourchette(t.total.mois["2026-03"].revenu, f(-270, -260, -250));
  procheFourchette(t.total.mois["2026-12"].revenu, f(-200));
  const cles = Calc.chiffresCles(t);
  procheFourchette(cles.charges, f(2400));
  procheFourchette(cles.revenu, f(-1930, -1785, -1640));
});

test("[T46] EX-48 : une projection déjà longue de 12 mois ou plus garde ses mois ; une charge supprimée ne compte pas", () => {
  const longue = { ...S12, plantations: [PLANTATION, { ...PLANTATION, id: "p2", date: "2027-06-01" }] };
  assert.deepEqual(Calc.tableau({ ...longue, charges: CHARGES }).mois, Calc.tableau(longue).mois);
  const supprimee = { ...S13, charges: [CHARGES[0], { ...CHARGES[1], supprimeLe: "2026-10-14T00:00:00.000Z" }] };
  procheFourchette(Calc.tableau(supprimee).total.mois["2026-03"].charges, f(50));
});

test("[T46] sans_cout_comme_r1 : sans charge fixe, ni charges, ni revenu, ni mois ajoutés", () => {
  const t = Calc.tableau(S12);
  assert.equal(t.mois.length, 4);
  assert.equal("charges" in t.total.total, false);
  assert.equal("revenu" in t.total.total, false);
  const cles = Calc.chiffresCles(t);
  assert.equal("charges" in cles, false);
  assert.equal("revenu" in cles, false);
  assert.deepEqual(Calc.tableau({ ...S12, charges: [{ ...CHARGES[0], supprimeLe: "2026-10-14T00:00:00.000Z" }] }), t);
});
