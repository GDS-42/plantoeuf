// Charges fixes (N3, EX-45, EX-48) : liste de la page « Charges fixes ». Le formulaire passe par la
// mécanique commune de UiSaisie ; les calculs (charge par mois, revenu) sont dans calc.js.
(function () {
  "use strict";

  const { T, formats, element, elementFourchette, parNom } = UiCommun;
  const { afficherListe, contenuLigne } = UiSaisie.outils;
  const C = T.charges;

  // « 600 € par an » : la fourchette du montant, puis la périodicité ; et ce qu'elle compte chaque mois et
  // sur un an (EX-48).
  function resumeCharge(charge) {
    const montant = element("span", {}, elementFourchette(charge.montant, formats.nombre, "€"), " ", T.periodicites[charge.periodicite] || "");
    return contenuLigne({
      titre: charge.nom,
      faits: [
        [C.faits.montant, montant, "montant"],
        [C.faits.parMois, elementFourchette(Calc.chargeParMois(charge), formats.nombre, "€"), "parMois"],
        [C.faits.parAn, elementFourchette(Calc.chargeParAn(charge), formats.nombre, "€"), "parAn"],
      ],
    });
  }

  // saisie : le module de saisie (élément en cours de modification).
  function creer({ saisie }) {
    function afficher(donnees) {
      const charges = donnees.charges.slice().sort(parNom);
      afficherListe("charges", charges, resumeCharge, saisie.enEdition("charges"));
    }

    return { afficher };
  }

  globalThis.UiCharges = { creer };
})();
