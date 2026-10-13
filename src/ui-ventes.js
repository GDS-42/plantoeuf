// Points de vente, séances et débouchés : listes et listes déroulantes de leurs panneaux de saisie (N2).
// Les formulaires eux-mêmes passent par la mécanique commune de UiSaisie.
(function () {
  "use strict";

  const { T, formats, remplir, afficherFourchette, afficherDate, nomDe, parNom } = UiCommun;
  const { afficherListe, remplirChoix } = UiSaisie.outils;

  function resumePointVente(pointVente) {
    return [pointVente.nom,
      remplir(T.resume.distance, { valeur: formats.nombre.format(pointVente.distanceKm) }),
      remplir(T.resume.coutKm, { valeur: afficherFourchette(pointVente.coutKm) })].join(" · ");
  }

  function resumeSeance(seance, pointsVente) {
    return [nomDe(pointsVente.get(seance.pointVenteId)),
      remplir(T.resume.jour, { jour: T.joursSemaine[seance.jour] }),
      remplir(T.resume.periode, { debut: afficherDate(seance.debut), fin: afficherDate(seance.fin) }),
      remplir(T.resume.frais, { valeur: afficherFourchette(seance.frais) })].join(" · ");
  }

  function resumeDebouche(debouche, pointsVente, cultures) {
    const culture = cultures.get(debouche.produitId);
    const unite = T.unitesVente[culture ? culture.unite : "kg"];
    return [remplir(T.resume.debouche, { produit: nomDe(culture), pointVente: nomDe(pointsVente.get(debouche.pointVenteId)) }),
      remplir(T.resume.prixDebouche, { valeur: afficherFourchette(debouche.prix), unite }),
      remplir(T.resume.volumeParSeance, { valeur: afficherFourchette(debouche.volumeParSeance), unite })].join(" · ");
  }

  // ferme : fonction qui rend la ferme ouverte ; saisie : le module de saisie (mode modification).
  function creer({ ferme, saisie }) {
    function parId(objet) {
      return new Map(ferme().lister(objet, { avecSupprimes: true }).map((e) => [e.id, e]));
    }

    function afficher(donnees) {
      const pointsVente = donnees.pointsVente.slice().sort(parNom);
      const cultures = donnees.cultures.slice().sort(parNom);
      const tousPoints = parId("pointsVente");
      const toutesCultures = parId("cultures");
      const libelleSeance = (s) => resumeSeance(s, tousPoints);
      const libelleDebouche = (d) => resumeDebouche(d, tousPoints, toutesCultures);
      const seances = donnees.seances.slice().sort((a, b) => libelleSeance(a).localeCompare(libelleSeance(b), "fr"));
      const debouches = donnees.debouches.slice().sort((a, b) => libelleDebouche(a).localeCompare(libelleDebouche(b), "fr"));

      afficherListe("pointsVente", pointsVente, resumePointVente, saisie.enEdition("pointsVente"));
      afficherListe("seances", seances, libelleSeance, saisie.enEdition("seances"));
      afficherListe("debouches", debouches, libelleDebouche, saisie.enEdition("debouches"));

      const choixPoints = pointsVente.map((p) => ({ valeur: p.id, libelle: p.nom }));
      remplirChoix(document.getElementById("seance-pointVenteId"), choixPoints);
      remplirChoix(document.getElementById("debouche-pointVenteId"), choixPoints);
      remplirChoix(document.getElementById("debouche-produitId"), cultures.map((c) => ({ valeur: c.id, libelle: c.nom })));
    }

    return { afficher };
  }

  globalThis.UiVentes = { creer };
})();
