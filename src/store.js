// Lecture et écriture des données de la ferme dans le navigateur.
// Le stockage est injecté : localStorage dans le fichier HTML, un substitut en mémoire
// dans les tests. Seules getItem et setItem sont utilisées.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Store = fabrique();
})(globalThis, function () {
  "use strict";

  const CLE = "plantoeuf";
  const VERSION = 1;

  function fermeVide() {
    return { version: VERSION, espaces: [] };
  }

  // Ouvre la ferme enregistrée dans `stockage`, ou une ferme vide s'il n'y en a pas.
  function ouvrir(stockage) {
    const brut = stockage.getItem(CLE);
    const donnees = brut ? JSON.parse(brut) : fermeVide();

    function enregistrer() {
      stockage.setItem(CLE, JSON.stringify(donnees));
    }

    return {
      espaces() {
        return donnees.espaces.slice();
      },
      ajouterEspace(champs) {
        const espace = { nom: champs.nom, surface: champs.surface, type: champs.type };
        donnees.espaces.push(espace);
        enregistrer();
        return espace;
      },
    };
  }

  return { ouvrir, CLE, VERSION };
});
