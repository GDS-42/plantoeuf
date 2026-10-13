// Lots de poules (S3) : liste et résumé du panneau de saisie. Le formulaire passe par la mécanique
// commune de UiSaisie ; les calculs de ponte et d'aliment sont dans calc.js.
(function () {
  "use strict";

  const { T, formats, remplir, afficherFourchette, afficherDate } = UiCommun;
  const { afficherListe } = UiSaisie.outils;

  function resumeLot(lot) {
    return [lot.nom,
      remplir(T.resume.effectif, { valeur: formats.nombre.format(lot.effectif) }),
      remplir(T.resume.arrivee, { valeur: afficherDate(lot.arrivee) }),
      remplir(T.resume.ponteLot, { debut: afficherDate(lot.debutPonte), fin: afficherDate(lot.reforme) }),
      remplir(T.resume.ponteParJour, { valeur: afficherFourchette(lot.ponte) }),
      // EX-26 : les œufs d'une semaine de ponte et le coût d'une semaine d'aliment.
      remplir(T.resume.oeufsParSemaine, { valeur: afficherFourchette(Calc.oeufsParSemaine(lot), formats.entiers) }),
      remplir(T.resume.alimentParSemaine, { valeur: afficherFourchette(Calc.coutAlimentParSemaine(lot)) })].join(" · ");
  }

  // saisie : le module de saisie (élément en cours de modification).
  function creer({ saisie }) {
    function afficher(donnees) {
      const lots = donnees.lots.slice().sort((a, b) => a.arrivee.localeCompare(b.arrivee) || a.nom.localeCompare(b.nom, "fr"));
      afficherListe("lots", lots, resumeLot, saisie.enEdition("lots"));
    }

    return { afficher };
  }

  globalThis.UiPoules = { creer };
})();
