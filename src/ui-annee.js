// R3 (EX-55, EX-58) : le choix de l'année « ‹ 2026 › » de la barre du haut.
// Rendu seulement : les années de la ferme et l'année proposée viennent de Calc.annees et
// Calc.anneeParDefaut ; l'année choisie est retenue dans l'état du navigateur (Store), jamais exportée.
(function () {
  "use strict";

  // La date du jour, dans le fuseau de l'utilisateur (« AAAA-MM-JJ »).
  function aujourdhui() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ferme : rend le store ouvert ; quandChange : recalcule l'affichage après un changement d'année.
  function creer({ ferme, quandChange }) {
    const groupe = document.getElementById("choix-annee");
    const precedente = document.getElementById("annee-precedente");
    const suivante = document.getElementById("annee-suivante");
    const sortie = document.getElementById("annee-choisie");
    let annees = [];
    let annee = null;

    function choisir(valeur) {
      if (!annees.includes(valeur)) return;
      ferme().retenirAnnee(valeur);
      quandChange();
    }
    precedente.addEventListener("click", () => choisir(annee - 1));
    suivante.addEventListener("click", () => choisir(annee + 1));

    // Met à jour la commande pour ces données ; rend les années de la ferme et l'année à montrer (null pour
    // une ferme sans donnée).
    function afficher(donnees) {
      annees = Calc.annees(donnees);
      annee = Calc.anneeParDefaut(annees, aujourdhui(), ferme().annee());
      groupe.hidden = annee === null;
      sortie.textContent = annee === null ? "" : String(annee);
      precedente.disabled = annee === null || annee <= annees[0];
      suivante.disabled = annee === null || annee >= annees[annees.length - 1];
      return { annees, annee };
    }

    return { afficher };
  }

  globalThis.UiAnnee = { creer };
})();
