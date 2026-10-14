// Tranche R1 — dates saisies et relues jour, mois, année (T39 : EX-39, EX-40, scénario S10).
const { test } = require("node:test");
const assert = require("node:assert/strict");

const Store = require("../src/store.js");

function codeErreur(fonction) {
  try {
    fonction();
  } catch (e) {
    return e.code;
  }
  return null;
}

test("[T39] EX-39, S10 : une date se lit jour, mois, année, quel que soit le séparateur", () => {
  for (const texte of ["15/03/2026", "15-03-2026", "15.03.2026", "15 03 2026", " 15/03/2026 ", "15/3/2026", "15/3/26"]) {
    assert.equal(Store.lireDate(texte), "2026-03-15", texte);
  }
  assert.equal(Store.lireDate("01/05/2026"), "2026-05-01");
  assert.equal(Store.lireDate("1/5/2026"), "2026-05-01");
  assert.equal(Store.lireDate("29/02/2028"), "2028-02-29");
});

test("[T39] EX-39, S10 : huit chiffres sans séparateur se lisent jjmmaaaa, une date ISO reste lue", () => {
  assert.equal(Store.lireDate("15032026"), "2026-03-15");
  assert.equal(Store.lireDate("2026-03-15"), "2026-03-15");
});

test("[T39] EX-39 : un champ vide donne null", () => {
  assert.equal(Store.lireDate(""), null);
  assert.equal(Store.lireDate("   "), null);
});

test("[T39] EX-39, S10 : une date qui n'existe pas ou illisible est refusée (date_invalide)", () => {
  for (const texte of ["31/02/2026", "29/02/2026", "32/01/2026", "15/13/2026", "00/03/2026", "2026-02-30", "1503202", "15/03", "abc", "15/03/2026/1"]) {
    assert.equal(codeErreur(() => Store.lireDate(texte)), "date_invalide", texte);
  }
});

test("[T39] EX-40 : une date enregistrée s'écrit jj/mm/aaaa, et se relit à l'identique", () => {
  assert.equal(Store.ecrireDate("2026-03-15"), "15/03/2026");
  assert.equal(Store.ecrireDate("2026-05-01"), "01/05/2026");
  assert.equal(Store.ecrireDate(""), "");
  assert.equal(Store.ecrireDate(null), "");
  for (const iso of ["2026-01-01", "2026-12-31", "2028-02-29"]) assert.equal(Store.lireDate(Store.ecrireDate(iso)), iso);
});
