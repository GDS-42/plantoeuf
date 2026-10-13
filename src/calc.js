// Logique de calcul pure (dates, répartition hebdomadaire, tableau économique).
// Invariant calcul_sans_dom : ce module s'exécute sous Node, sans navigateur.
// Vide en T01 : les calculs arrivent avec T04 et T05.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Calc = fabrique();
})(globalThis, function () {
  "use strict";

  return {};
});
