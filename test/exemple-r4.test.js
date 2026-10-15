// Tranche R4 — les règles de rotation de la ferme d'exemple (T63 : EX-66, S21), sans navigateur.
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
  const d = {};
  for (const objet of Store.OBJETS) d[objet] = ferme.lister(objet);
  return d;
}

function exemple(annee = 2026) {
  const ferme = Store.ouvrir(stockageEnMemoire());
  Exemple.charger(ferme, annee);
  return { ferme, d: donnees(ferme) };
}

test("[T63] S21, EX-66 : chaque famille de l'exemple a le délai de retour du dossier de données (§ 14.1)", () => {
  const { d } = exemple();
  const delais = Object.fromEntries(d.familles.map((f) => [f.nom, [f.delaiRetour.basse, f.delaiRetour.mediane, f.delaiRetour.haute]]));
  assert.deepEqual(delais, {
    "Solanacées": [3, 4, 5],
    "Brassicacées": [3, 4, 5],
    "Astéracées": [3, 3, 4],
    "Apiacées": [3, 4, 5],
    "Fabacées": [5, 5, 5],
    "Cucurbitacées": [2, 3, 4],
    "Amaryllidacées": [4, 5, 5],
  });
  for (const famille of d.familles) assert.ok(famille.note, `${famille.nom} : la note renvoie au dossier de données`);
  // famille_par_nom : chaque culture se rattache à une famille de l'exemple.
  for (const culture of d.cultures) assert.ok(Calc.familleDe(culture, d.familles), culture.nom);
});

test("[T63] S21, EX-66 : chaque culture de l'exemple a le groupe du dossier de données (§ 14.2), et la ferme a sa rotation (§ 14.3)", () => {
  const { d } = exemple();
  assert.deepEqual(Object.fromEntries(d.cultures.map((c) => [c.nom, c.groupe])), {
    "Tomate": "fruit", "Courgette": "fruit", "Concombre": "fruit", "Piment": "fruit", "Chouchou": "fruit",
    "Salade batavia": "feuille", "Chou pommé": "feuille", "Brède petsaï": "feuille",
    "Carotte": "racine", "Ail péi": "bulbe", "Haricot vert": "legumineuse",
  });
  assert.deepEqual(d.rotations.map((r) => [r.nom, r.groupes]), [
    ["Exigence décroissante", ["fruit", "feuille", "racine", "bulbe", "legumineuse", "engrais_vert"]],
  ]);
});

test("[T63] S21, EX-66 : l'exemple porte les 5 voisinages et les 22 précédents sourcés du dossier de données (§ 14.4)", () => {
  const { d } = exemple();
  const nom = new Map(d.cultures.map((c) => [c.id, c.nom]));
  const lire = (type, signe) => d.associations.filter((a) => a.type === type)
    .map((a) => `${nom.get(a.cultureA)} ${signe} ${nom.get(a.cultureB)} : ${a.effet}`).sort();
  assert.deepEqual(lire("voisinage", "+"), [
    "Carotte + Salade batavia : favorable",
    "Chou pommé + Ail péi : favorable",
    "Piment + Chou pommé : favorable",
    "Piment + Salade batavia : favorable",
    "Tomate + Salade batavia : favorable",
  ].sort());
  assert.deepEqual(lire("precedent", "→"), [
    "Tomate → Concombre : defavorable", "Tomate → Courgette : defavorable",
    "Piment → Concombre : defavorable", "Piment → Courgette : defavorable",
    "Concombre → Tomate : defavorable", "Courgette → Tomate : defavorable",
    "Concombre → Piment : defavorable", "Courgette → Piment : defavorable",
    "Ail péi → Tomate : favorable", "Ail péi → Concombre : favorable",
    "Ail péi → Piment : favorable", "Ail péi → Courgette : favorable",
    "Carotte → Tomate : favorable", "Carotte → Piment : favorable",
    "Salade batavia → Tomate : favorable",
    "Salade batavia → Carotte : favorable", "Chou pommé → Carotte : favorable",
    "Salade batavia → Concombre : favorable", "Salade batavia → Courgette : favorable",
    "Chou pommé → Concombre : favorable", "Chou pommé → Courgette : favorable",
    "Haricot vert → Carotte : defavorable",
  ].sort());
  for (const a of d.associations) assert.ok(a.note, "chaque association renvoie au dossier de données");
});

test("[T63] S21 : les retours trop tôt de l'exemple portent sur les deux tunnels et la Parcelle 2, et les précédents défavorables sur les tunnels (§ 14.5)", () => {
  const { d } = exemple();
  const espaces = new Map(d.espaces.map((e) => [e.id, e.nom]));
  const plantations = new Map(d.plantations.map((p) => [p.id, p]));
  const retours = Calc.retoursTropTot(d);
  const parEspace = {};
  for (const [id, verdict] of Object.entries(retours)) {
    const espace = espaces.get(plantations.get(id).espaceId);
    parEspace[espace] = [...(parEspace[espace] || []), verdict.famille];
  }
  assert.deepEqual(Object.keys(parEspace).sort(), ["Parcelle 2", "Tunnel 1", "Tunnel 2"]);
  assert.deepEqual(parEspace["Tunnel 1"], ["Solanacées"]);
  assert.deepEqual(parEspace["Tunnel 2"], ["Solanacées"]);
  assert.equal(parEspace["Parcelle 2"].length, 8);
  assert.ok(parEspace["Parcelle 2"].every((f) => f === "Brassicacées"));
  // La Parcelle 1 (quinze salades de 40 m²) reste dans sa surface.
  const defavorables = Calc.associationsDefavorables(d);
  assert.equal(Object.keys(defavorables).length, 4);
  for (const [id, { precedents, voisins }] of Object.entries(defavorables)) {
    assert.match(espaces.get(plantations.get(id).espaceId), /^Tunnel [12]$/);
    assert.equal(precedents.length, 1);
    assert.deepEqual(voisins, []);
  }
});

test("[T63] les règles de l'exemple ne changent aucune case du tableau (dérogation au BRIEF)", () => {
  const { d } = exemple();
  const sansRegles = {
    ...d, familles: [], associations: [], rotations: [],
    cultures: d.cultures.map(({ groupe, ...culture }) => culture),
  };
  assert.deepEqual(Calc.tableau(d), Calc.tableau(sansRegles));
});

test("[T63] EX-66 : l'effacement de l'exemple retire ses familles, associations et sa rotation, et seulement elles", () => {
  const ferme = Store.ouvrir(stockageEnMemoire());
  const F = Store.fourchette;
  const mienne = ferme.ajouter("familles", { nom: "Rosacées", delaiRetour: F(2) });
  const fraise = ferme.ajouter("cultures", { nom: "fraise", famille: "Rosacées", groupe: "fruit", unite: "kg", rendement: F(2), prix: F(8), joursAvantRecolte: 90, semainesRecolte: 10, pertes: 10 });
  const ail = ferme.ajouter("cultures", { nom: "ail rose", famille: "Amaryllidacées", groupe: "bulbe", unite: "kg", rendement: F(1), prix: F(10), joursAvantRecolte: 150, semainesRecolte: 4, pertes: 10 });
  ferme.ajouter("associations", { type: "voisinage", cultureA: fraise.id, cultureB: ail.id, effet: "favorable" });
  ferme.ajouter("rotations", { nom: "La mienne", groupes: ["fruit", "bulbe"] });
  Exemple.charger(ferme, 2026);
  assert.equal(ferme.lister("familles").length, 8);
  Exemple.effacer(ferme);
  const d = donnees(ferme);
  assert.deepEqual(d.familles.map((f) => f.id), [mienne.id]);
  assert.equal(d.associations.length, 1);
  assert.deepEqual(d.rotations.map((r) => r.nom), ["La mienne"]);
  assert.deepEqual(d.cultures.map((c) => c.nom).sort(), ["ail rose", "fraise"]);
  assert.equal(Exemple.estAffichee(ferme), false);
});
