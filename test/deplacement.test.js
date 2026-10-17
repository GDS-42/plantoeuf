// Tranche R5 — déplacer une plantation : les conséquences d'un déplacement, sans DOM (T65 : EX-68).
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

const f = (basse, mediane = basse, haute = mediane) => ({ basse, mediane, haute });
const base = { unite: "kg", rendement: f(3), prix: f(2), pertes: 10 };

// Contexte des scénarios S22 et S23 : tomate (Solanacées, délai 2 / 3 / 4 ans) sur deux planches de 30 m².
function ferme() {
  return {
    espaces: [{ id: "p1", nom: "planche 1", surface: 30 }, { id: "p2", nom: "planche 2", surface: 30 }],
    familles: [{ id: "fs", nom: "Solanacées", delaiRetour: f(2, 3, 4) }],
    cultures: [{ id: "t", nom: "tomate", famille: "Solanacées", groupe: "fruit", joursAvantRecolte: 70, semainesRecolte: 11, ...base }],
    varietes: [{ id: "vt", cultureId: "t", nom: "Heatmaster" }],
    associations: [],
    rotations: [],
    plantations: [
      { id: "a", varieteId: "vt", espaceId: "p1", surface: 30, date: "2026-03-01" },
      { id: "b", varieteId: "vt", espaceId: "p2", surface: 30, date: "2027-03-01" },
    ],
  };
}

test("[T65] S22, EX-68 : glisser la tomate de 2027 sur la planche 1 au 15 mars fait apparaître son retour trop tôt", () => {
  const c = Calc.consequencesDeplacement(ferme(), "b", { date: "2027-03-15", espaceId: "p1" });
  assert.deepEqual(c.retours.map((r) => [r.plantationId, r.famille]), [["b", "Solanacées"]]);
  assert.equal(c.retours[0].delai.mediane, 3);
  assert.deepEqual(c.surOccupations, []);
  assert.deepEqual(c.defavorables, []);
  assert.equal(c.levees, 0);
});

test("[T65] EX-68 : un déplacement qui chevauche une autre plantation fait apparaître la sur-occupation de l'espace visé, mois par mois", () => {
  // La tomate de 2027 posée sur la planche 1 en 2026, pendant celle de 2026 : 60 m² pour 30 m².
  const c = Calc.consequencesDeplacement(ferme(), "b", { date: "2026-04-01", espaceId: "p1" });
  assert.ok(c.surOccupations.length > 0);
  for (const s of c.surOccupations) {
    assert.equal(s.espaceId, "p1");
    assert.equal(s.surface, 60);
    assert.equal(s.disponible, 30);
  }
  assert.deepEqual(c.surOccupations.map((s) => s.mois), ["2026-04", "2026-05", "2026-06", "2026-07"]);
});

test("[T65] EX-68 : éloigner une plantation qui revenait trop tôt lève l'alerte, sans en faire apparaître", () => {
  const d = ferme();
  d.plantations[1].espaceId = "p1"; // la tomate de 2027 revient trop tôt sur la planche 1
  assert.deepEqual(Object.keys(Calc.retoursTropTot(d)), ["b"]);
  const c = Calc.consequencesDeplacement(d, "b", { date: "2027-03-01", espaceId: "p2" });
  assert.deepEqual(c.retours, []);
  assert.deepEqual(c.surOccupations, []);
  assert.equal(c.levees, 1);
});

test("[T65] EX-68 : un voisin défavorable apparaît pour la plantation déplacée et pour celle qu'elle rejoint ; un précédent défavorable aussi", () => {
  const d = {
    espaces: [{ id: "A", nom: "planche A", surface: 30 }, { id: "B", nom: "planche B", surface: 30 }],
    familles: [],
    cultures: [
      { id: "h", nom: "haricot vert", famille: "Fabacées", joursAvantRecolte: 60, semainesRecolte: 6, ...base },
      { id: "l", nom: "ail", famille: "Amaryllidacées", joursAvantRecolte: 100, semainesRecolte: 4, ...base },
      { id: "c", nom: "carotte", famille: "Apiacées", joursAvantRecolte: 90, semainesRecolte: 4, ...base },
    ],
    varietes: [{ id: "vh", cultureId: "h", nom: "Contender" }, { id: "vl", cultureId: "l", nom: "Rose" }, { id: "vc", cultureId: "c", nom: "Nantaise" }],
    associations: [
      { id: "x", type: "voisinage", cultureA: "l", cultureB: "h", effet: "defavorable" },
      { id: "y", type: "precedent", cultureA: "h", cultureB: "c", effet: "defavorable" },
    ],
    rotations: [],
    plantations: [
      { id: "ail", varieteId: "vl", espaceId: "B", surface: 10, date: "2026-04-01" },
      { id: "har", varieteId: "vh", espaceId: "A", surface: 10, date: "2026-06-01" },
      { id: "car", varieteId: "vc", espaceId: "B", surface: 10, date: "2026-10-01" },
    ],
  };
  const c = Calc.consequencesDeplacement(d, "har", { date: "2026-06-01", espaceId: "B" });
  const parId = Object.fromEntries(c.defavorables.map((x) => [x.plantationId, x]));
  assert.deepEqual(Object.keys(parId).sort(), ["ail", "car", "har"]);
  assert.deepEqual(parId.har.voisins, ["ail"]);
  assert.deepEqual(parId.ail.voisins, ["har"]);
  assert.deepEqual(parId.car.precedents, ["har"]);
});

test("[T65] EX-68 : une alerte que la plantation avait déjà avant le déplacement n'apparaît pas, et n'est pas levée", () => {
  // Trois planches : la tomate de 2027, trop tôt sur la planche 1, glissée sur la planche 3 où elle l'est aussi.
  const d = ferme();
  d.espaces.push({ id: "p3", nom: "planche 3", surface: 30 });
  d.plantations.push({ id: "c", varieteId: "vt", espaceId: "p3", surface: 30, date: "2026-02-01" });
  d.plantations[1].espaceId = "p1";
  const c = Calc.consequencesDeplacement(d, "b", { date: "2027-03-01", espaceId: "p3" });
  assert.deepEqual(c.retours, []);
  assert.equal(c.levees, 0);
});

test("[T65] deplacement_sans_effet : calculer les conséquences ne change ni les données passées ni la ferme enregistrée", () => {
  const stockage = stockageEnMemoire();
  const enregistree = Store.ouvrir(stockage);
  Exemple.charger(enregistree, 2026);
  const avant = stockage.getItem(Store.CLE);
  const d = {};
  for (const objet of Store.OBJETS) d[objet] = enregistree.lister(objet);
  const copie = JSON.stringify(d);
  for (const p of d.plantations.slice(0, 10)) {
    Calc.consequencesDeplacement(d, p.id, { date: "2026-07-01", espaceId: d.espaces[0].id });
  }
  assert.equal(JSON.stringify(d), copie);
  assert.equal(stockage.getItem(Store.CLE), avant);
});

test("[T65] EX-68 : reposer une plantation à sa place ne fait apparaître ni lever aucune alerte ; une plantation inconnue ne donne rien", () => {
  const d = ferme();
  d.plantations[1].espaceId = "p1";
  const c = Calc.consequencesDeplacement(d, "b", { date: "2027-03-01", espaceId: "p1" });
  assert.deepEqual(c, { surOccupations: [], retours: [], defavorables: [], levees: 0 });
  assert.equal(Calc.consequencesDeplacement(d, "inconnue", { date: "2027-03-01", espaceId: "p1" }), null);
});

test("[T65] le calcul des conséquences d'un déplacement suit le pointeur : sous 30 ms sur la ferme d'exemple", () => {
  const stockage = stockageEnMemoire();
  const enregistree = Store.ouvrir(stockage);
  Exemple.charger(enregistree, 2026);
  const d = {};
  for (const objet of Store.OBJETS) d[objet] = enregistree.lister(objet);
  // Chaque plantation posée sur chaque espace : la pire mesure, meilleure de trois passages.
  const mesures = [];
  for (let passage = 0; passage < 3; passage++) {
    let pire = 0;
    for (const p of d.plantations) {
      for (const e of d.espaces) {
        const t0 = performance.now();
        Calc.consequencesDeplacement(d, p.id, { date: p.date, espaceId: e.id });
        pire = Math.max(pire, performance.now() - t0);
      }
    }
    mesures.push(pire);
  }
  assert.ok(Math.min(...mesures) < 30, `pire mesure : ${Math.min(...mesures).toFixed(1)} ms`);
});
