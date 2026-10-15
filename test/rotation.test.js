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

// ---- T60 : les règles (EX-62 à EX-65, scénarios S18 à S20)

const Calc = require("../src/calc.js");
const Exemple = require("../src/exemple.js");

const FAMILLE_SOL = { id: "fam-sol", nom: "Solanacées", delaiRetour: f(2, 3, 4) };
const culture = (id, nom, famille, groupe, jours, semaines) => ({ id, nom, famille, groupe, unite: "kg", rendement: f(3), prix: f(2), joursAvantRecolte: jours, semainesRecolte: semaines, pertes: 10 });
const C_TOMATE = culture("tomate", "tomate", "Solanacées", "fruit", 70, 11);
const variete = (cultureId) => ({ id: `v-${cultureId}`, cultureId, nom: `variété de ${cultureId}` });
const plantation = (id, cultureId, espaceId, surface, date) => ({ id, varieteId: `v-${cultureId}`, espaceId, surface, date });
const ids = (objet) => Object.keys(objet).sort();

// S18 : une planche de 30 m² et une parcelle de 600 m².
const S18 = {
  espaces: [{ id: "planche", nom: "planche", surface: 30 }, { id: "parcelle", nom: "parcelle", surface: 600 }],
  cultures: [C_TOMATE], varietes: [variete("tomate")], familles: [FAMILLE_SOL],
  plantations: [
    plantation("p2026", "tomate", "planche", 30, "2026-03-01"),
    plantation("p2027", "tomate", "planche", 30, "2027-03-01"),
    ...["2026-01-10", "2026-06-10", "2026-11-01", "2026-12-01", "2027-03-01"].map((date, i) => plantation(`q${i + 1}`, "tomate", "parcelle", 120, date)),
  ],
};

test("[T60] S18, EX-62 : une tomate revient trop tôt sur une planche ; sur une parcelle, seulement quand la place manque", () => {
  assert.deepEqual(ids(Calc.retoursTropTot(S18)), ["p2027"]);
  const r = Calc.retoursTropTot(S18).p2027;
  assert.equal(r.espaceId, "planche");
  assert.equal(r.famille, "Solanacées");
  assert.deepEqual(r.delai, f(2, 3, 4));
  assert.equal(r.surface, 60);
  assert.deepEqual(r.avant, ["p2026"]);
  // Cinq tomates de 120 m² dans le délai remplissent la parcelle (600 m²) ; une sixième la dépasse.
  const sixieme = { ...S18, plantations: [...S18.plantations, plantation("q6", "tomate", "parcelle", 120, "2027-04-01")] };
  assert.deepEqual(ids(Calc.retoursTropTot(sixieme)), ["p2027", "q6"]);
  assert.equal(Calc.retoursTropTot(sixieme).q6.surface, 720);
  // Au-delà du délai (médiane 3 ans après la fin de récolte), plus d'alerte.
  const plusTard = { ...S18, plantations: [plantation("p2026", "tomate", "planche", 30, "2026-03-01"), plantation("p2029", "tomate", "planche", 30, "2029-08-01")] };
  assert.deepEqual(Calc.retoursTropTot(plusTard), {});
});

test("[T60] famille_par_nom : une culture se rattache à sa famille par le seul nom, sans tenir compte des majuscules, des espaces ni de la forme des accents", () => {
  const familles = [FAMILLE_SOL, { id: "fam-cuc", nom: "Cucurbitacées", delaiRetour: f(2, 3, 4) }];
  for (const nom of ["Solanacées", "  solanacées ", "SOLANACÉES", "Solanacées"]) {
    assert.equal(Calc.familleDe({ ...C_TOMATE, famille: nom }, familles).id, "fam-sol", JSON.stringify(nom));
  }
  assert.equal(Calc.familleDe({ ...C_TOMATE, famille: "Cucurbitacées" }, familles).id, "fam-cuc");
  assert.equal(Calc.familleDe({ ...C_TOMATE, famille: "" }, familles), null);
  assert.equal(Calc.familleDe(C_TOMATE, [{ ...FAMILLE_SOL, supprimeLe: "2026-10-15T00:00:00.000Z" }]), null);
  // Une famille sans délai ne déclenche aucune alerte.
  assert.deepEqual(Calc.retoursTropTot({ ...S18, familles: [{ ...FAMILLE_SOL, delaiRetour: null }] }), {});
});

// S19 : précédent et voisin.
const S19 = {
  espaces: [{ id: "a", nom: "planche A", surface: 30 }, { id: "b", nom: "planche B", surface: 30 }],
  cultures: [culture("haricot", "haricot vert", "Fabacées", "legumineuse", 60, 4), culture("chou", "chou pommé", "Brassicacées", "feuille", 85, 3),
    culture("ail", "ail", "Amaryllidacées", "bulbe", 120, 2)],
  varietes: [variete("haricot"), variete("chou"), variete("ail")],
  associations: [
    { id: "as1", type: "precedent", cultureA: "haricot", cultureB: "chou", effet: "favorable" },
    { id: "as2", type: "voisinage", cultureA: "ail", cultureB: "haricot", effet: "defavorable" },
  ],
  plantations: [plantation("h1", "haricot", "a", 30, "2026-03-04"), plantation("ail1", "ail", "b", 15, "2026-04-01"), plantation("h2", "haricot", "b", 15, "2026-06-01")],
};

test("[T60] S19, EX-63, EX-64 : les précédents d'une plantation (même non enregistrée) et ses voisins, avec leur effet", () => {
  assert.equal(Calc.datesRecolte(S19.plantations[0], Calc.parametres(S19.cultures[0], S19.varietes[0])).fin, "2026-05-30");
  const chou = { varieteId: "v-chou", espaceId: "a", surface: 30, date: "2026-06-15" };
  const { precedents, tropTot } = Calc.precedents(S19, chou);
  assert.deepEqual(precedents.map((p) => [p.plantationId, p.culture, p.effet]), [["h1", "haricot vert", "favorable"]]);
  assert.equal(tropTot, null);
  // Plus de 365 jours après la fin de la récolte : plus un précédent.
  assert.deepEqual(Calc.precedents(S19, { ...chou, date: "2027-06-15" }).precedents, []);
  // Le voisinage vaut dans les deux sens.
  assert.deepEqual(Calc.voisins(S19, S19.plantations[2]).map((v) => [v.plantationId, v.culture, v.effet]), [["ail1", "ail", "defavorable"]]);
  assert.deepEqual(Calc.voisins(S19, S19.plantations[1]).map((v) => [v.plantationId, v.culture, v.effet]), [["h2", "haricot vert", "defavorable"]]);
  // Un voisin sans association : effet nul.
  const sansAssociation = { ...S19, associations: [] };
  assert.deepEqual(Calc.voisins(sansAssociation, S19.plantations[2]).map((v) => [v.plantationId, v.effet]), [["ail1", null]]);
  // EX-64 : les plantations qui ont un précédent ou un voisin défavorable.
  assert.deepEqual(ids(Calc.associationsDefavorables(S19)), ["ail1", "h2"]);
  assert.deepEqual(Calc.associationsDefavorables(S19).h2.voisins, ["ail1"]);
});

test("[T60] la surface libre d'un espace à une date : sa surface moins les plantations en place ce jour-là", () => {
  assert.equal(Calc.surfaceLibre(S18, "planche", "2026-05-01"), 0);
  assert.equal(Calc.surfaceLibre(S18, "planche", "2026-08-01"), 30);
  assert.equal(Calc.surfaceLibre(S18, "parcelle", "2027-03-15"), 600 - 3 * 120);
  assert.equal(Calc.surfaceLibre(S18, "inconnu", "2027-03-15"), 0);
});

// S20 : que planter ici ?
const S20 = {
  espaces: [{ id: "planche", nom: "planche", surface: 30 }],
  cultures: [C_TOMATE, culture("laitue", "laitue", "Astéracées", "feuille", 42, 2), culture("carotte", "carotte", "Apiacées", "racine", 105, 3),
    culture("haricot", "haricot vert", "Fabacées", "legumineuse", 60, 4)],
  varietes: [variete("tomate"), variete("laitue"), variete("carotte"), variete("haricot")],
  familles: [FAMILLE_SOL],
  rotations: [{ id: "r1", nom: "Exigence", groupes: ["fruit", "feuille", "racine", "legumineuse"] }],
  plantations: [plantation("t1", "tomate", "planche", 30, "2026-02-04")],
};

test("[T60] S20, EX-65 : « Que planter ici ? » classe les cultures avec leurs raisons, sans rien changer aux données", () => {
  assert.equal(Calc.datesRecolte(S20.plantations[0], Calc.parametres(C_TOMATE, S20.varietes[0])).fin, "2026-06-30");
  const avant = JSON.stringify(S20);
  const liste = Calc.suggestions(S20, { espaceId: "planche", date: "2026-07-01" });
  assert.equal(JSON.stringify(S20), avant);
  assert.deepEqual(liste.map((s) => s.culture), ["laitue", "carotte", "haricot vert", "tomate"]);
  assert.equal(liste[0].varieteId, "v-laitue");
  assert.equal(liste[0].surface, 30);
  assert.deepEqual(liste[0].raisons.map((r) => r.code), ["groupe_suivant"]);
  assert.equal(liste[3].tropTot.famille, "Solanacées");
  assert.ok(liste[3].raisons.some((r) => r.code === "trop_tot"));
  // Un précédent favorable passe avant le groupe suivant ; un défavorable fait reculer.
  const avecAssociations = { ...S20, associations: [
    { id: "a1", type: "precedent", cultureA: "tomate", cultureB: "carotte", effet: "favorable" },
    { id: "a2", type: "precedent", cultureA: "tomate", cultureB: "laitue", effet: "defavorable" },
  ] };
  const autre = Calc.suggestions(avecAssociations, { espaceId: "planche", date: "2026-07-01", surface: 20 });
  assert.deepEqual(autre.map((s) => s.culture), ["carotte", "haricot vert", "laitue", "tomate"]);
  assert.ok(autre[0].raisons.some((r) => r.code === "precedent_favorable" && r.culture === "tomate"));
  assert.ok(autre[2].raisons.some((r) => r.code === "precedent_defavorable"));
  assert.equal(autre[0].surface, 20);
  // Une culture sans variété n'est pas proposée.
  assert.equal(Calc.suggestions({ ...S20, varietes: S20.varietes.slice(0, 3) }, { espaceId: "planche", date: "2026-07-01" }).some((s) => s.culture === "haricot vert"), false);
});

test("[T60] sans_regle_comme_r3 et alerte_seulement : sans famille, association, rotation ni groupe, aucune alerte, aucun effet, suggestions par ordre alphabétique", () => {
  const sansRegle = { ...S20, familles: [], rotations: [], cultures: S20.cultures.map(({ groupe, ...c }) => c) };
  assert.deepEqual(Calc.retoursTropTot(sansRegle), {});
  assert.deepEqual(Calc.associationsDefavorables(sansRegle), {});
  assert.deepEqual(Calc.suggestions(sansRegle, { espaceId: "planche", date: "2026-07-01" }).map((s) => [s.culture, s.raisons]),
    [["carotte", []], ["haricot vert", []], ["laitue", []], ["tomate", []]]);
  assert.equal(Calc.precedents(sansRegle, { varieteId: "v-laitue", espaceId: "planche", surface: 30, date: "2026-07-01" }).tropTot, null);
  // Une plantation qui revient trop tôt s'enregistre quand même.
  const valeurs = new Map();
  const ferme = Store.ouvrir({ getItem: (k) => (valeurs.has(k) ? valeurs.get(k) : null), setItem: (k, v) => valeurs.set(k, String(v)) });
  const espace = ferme.ajouter("espaces", { nom: "planche", surface: 30 });
  ferme.ajouter("familles", { nom: "Solanacées", delaiRetour: f(3) });
  const c = ferme.ajouter("cultures", C_TOMATE);
  const v = ferme.ajouter("varietes", { nom: "Heatmaster", cultureId: c.id });
  ferme.ajouter("plantations", { varieteId: v.id, espaceId: espace.id, surface: 30, date: "2026-03-01" });
  const deuxieme = ferme.ajouter("plantations", { varieteId: v.id, espaceId: espace.id, surface: 30, date: "2027-03-01" });
  const d = {}; for (const objet of Store.OBJETS) d[objet] = ferme.lister(objet);
  assert.deepEqual(ids(Calc.retoursTropTot(d)), [deuxieme.id]);
});

test("[T60] le calcul des aides d'une ferme de la taille de l'exemple reste sous 100 ms", () => {
  const valeurs = new Map();
  const ferme = Store.ouvrir({ getItem: (k) => (valeurs.has(k) ? valeurs.get(k) : null), setItem: (k, v) => valeurs.set(k, String(v)) });
  Exemple.charger(ferme, 2026);
  for (const nom of ["Solanacées", "Brassicacées", "Astéracées", "Apiacées", "Fabacées", "Cucurbitacées", "Amaryllidacées"]) ferme.ajouter("familles", { nom, delaiRetour: f(3, 4, 5) });
  const d = {}; for (const objet of Store.OBJETS) d[objet] = ferme.lister(objet);
  // La meilleure de trois mesures : une machine chargée (build de mise en ligne) ne fait pas échouer le test.
  const mesures = [];
  for (let essai = 0; essai < 3; essai++) {
    const debut = process.hrtime.bigint();
    Calc.retoursTropTot(d);
    Calc.associationsDefavorables(d);
    for (const p of d.plantations) { Calc.precedents(d, p); Calc.voisins(d, p); }
    for (const e of d.espaces) Calc.suggestions(d, { espaceId: e.id, date: "2026-07-01" });
    mesures.push(Number(process.hrtime.bigint() - debut) / 1e6);
  }
  assert.ok(Math.min(...mesures) < 100, mesures.map((ms) => `${ms.toFixed(1)} ms`).join(", "));
});

test("[T60] une plantation en cours de saisie vient après celles du même jour pour le délai de retour", () => {
  const meme = { ...S18, plantations: [plantation("p2026", "tomate", "planche", 30, "2026-03-01")] };
  const verdict = Calc.precedents(meme, { varieteId: "v-tomate", espaceId: "planche", surface: 10, date: "2026-03-01" }).tropTot;
  assert.equal(verdict.surface, 40);
  assert.deepEqual(verdict.avant, ["p2026"]);
});
