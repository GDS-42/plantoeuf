// Véhicules (R1, EX-41 à EX-44) : liste de la section « Véhicules » de la page Ventes. Le formulaire
// passe par la mécanique commune de UiSaisie ; les calculs de coût sont dans calc.js.
(function () {
  "use strict";

  const { T, formats, elementFourchette, parNom } = UiCommun;
  const { afficherListe, contenuLigne } = UiSaisie.outils;
  const V = T.vehicules;

  function resumeVehicule(vehicule) {
    return contenuLigne({
      titre: vehicule.nom,
      faits: [
        [V.faits.consommation, elementFourchette(vehicule.consommation, formats.nombre, V.consommationValeur), "consommation"],
        [V.faits.prixLitre, elementFourchette(vehicule.prixLitre, formats.nombre, V.parLitre), "prixLitre"],
      ],
    });
  }

  // saisie : le module de saisie (élément en cours de modification).
  function creer({ saisie }) {
    function afficher(donnees) {
      const vehicules = donnees.vehicules.slice().sort(parNom);
      afficherListe("vehicules", vehicules, resumeVehicule, saisie.enEdition("vehicules"));
    }

    return { afficher };
  }

  globalThis.UiVehicules = { creer };
})();
