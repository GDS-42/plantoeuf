// T01 — squelette : les modules se chargent sous Node, un espace survit à la réouverture.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const Store = require("../src/store.js");

// Substitut de localStorage : seules getItem et setItem sont utilisées par le store.
function stockageEnMemoire() {
  const valeurs = new Map();
  return {
    getItem: (cle) => (valeurs.has(cle) ? valeurs.get(cle) : null),
    setItem: (cle, valeur) => valeurs.set(cle, String(valeur)),
  };
}

test("[T01] un stockage vide donne une ferme sans espace", () => {
  assert.deepEqual(Store.ouvrir(stockageEnMemoire()).espaces(), []);
});

test("[T01] un espace enregistré est retrouvé après réouverture", () => {
  const stockage = stockageEnMemoire();
  Store.ouvrir(stockage).ajouterEspace({ nom: "planche 1", surface: 30, type: "abri" });

  const espaces = Store.ouvrir(stockage).espaces();
  assert.equal(espaces.length, 1);
  assert.equal(espaces[0].nom, "planche 1");
  assert.equal(espaces[0].surface, 30);
  assert.equal(espaces[0].type, "abri");
});

test("[T01] calc.js se charge sans navigateur et n'accède pas au DOM", () => {
  const Calc = require("../src/calc.js");
  assert.equal(typeof Calc, "object");

  const source = fs.readFileSync(path.join(__dirname, "..", "src", "calc.js"), "utf8");
  assert.doesNotMatch(source, /\b(document|window|localStorage)\b/);
});
