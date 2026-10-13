// Lots de poules (S3) : liste du panneau de saisie. Le formulaire passe par la mécanique commune de
// UiSaisie ; les calculs de ponte et d'aliment sont dans calc.js ; le repère des périodes des lots est
// dessiné par ui-calendrier.js.
(function () {
  "use strict";

  const { T, formats, remplir, elementFourchette, afficherDate } = UiCommun;
  const { afficherListe, contenuLigne, morceaux, periode } = UiSaisie.outils;
  const F = T.vueFerme;

  // P2 : le nom et l'effectif, les dates, puis la ponte, les œufs d'une semaine de ponte et le coût
  // d'une semaine d'aliment (EX-26), chacun en fourchette.
  function resumeLot(lot) {
    return contenuLigne({
      titre: lot.nom,
      puces: [{ texte: remplir(lot.effectif === 1 ? F.effectif.un : F.effectif.plusieurs, { nombre: formats.nombre.format(lot.effectif) }), ton: "oeuf" }],
      sousTitre: morceaux([remplir(F.arriveeLot, { date: afficherDate(lot.arrivee) }), remplir(F.reformeLot, { date: afficherDate(lot.reforme) })], " · "),
      faits: [
        [F.faits.ponte, periode(lot.debutPonte, lot.reforme), "ponte"],
        [F.faits.ponteParPoule, elementFourchette(lot.ponte, formats.nombre, F.oeuf), "ponteParPoule"],
        [F.faits.oeufs, elementFourchette(Calc.oeufsParSemaine(lot), formats.entiers), "oeufs"],
        [F.faits.aliment, elementFourchette(Calc.coutAlimentParSemaine(lot), formats.nombre, F.euros), "aliment"],
      ],
    });
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
