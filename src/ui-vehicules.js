// Véhicules (R1, EX-41 à EX-44) : liste de la section « Véhicules » de la page Ventes. Le formulaire
// passe par la mécanique commune de UiSaisie ; les calculs de coût sont dans calc.js.
(function () {
  "use strict";

  const { T, formats, remplir, elementFourchette, parNom } = UiCommun;
  const { afficherListe, contenuLigne } = UiSaisie.outils;
  const V = T.vehicules;

  // Une fourchette saisie, en texte court : « 8 », ou « 8 (7 à 9) ».
  function enTexte(f) {
    const mediane = formats.nombre.format(f.mediane);
    if (f.basse === f.haute) return mediane;
    return `${mediane} (${remplir(T.commun.bornes, { basse: formats.nombre.format(f.basse), haute: formats.nombre.format(f.haute) })})`;
  }

  // bilan : Calc.vehicules — coût du km, et sur la saison les kilomètres, les litres et le carburant (EX-44).
  // N3 (EX-46) : avec des frais au km, l'entretien et l'usure de la saison, puis le coût total des trajets.
  function resumeVehicule(vehicule, bilan) {
    const consommation = remplir(V.sousTitre, { consommation: enTexte(vehicule.consommation), prix: enTexte(vehicule.prixLitre) });
    const frais = vehicule.fraisKm ? [[V.faits.entretien, elementFourchette(bilan.entretien, formats.nombre, "€"), "entretien"],
      [V.faits.total, elementFourchette(bilan.total, formats.nombre, "€"), "total"]] : [];
    return contenuLigne({
      titre: vehicule.nom,
      sousTitre: vehicule.fraisKm ? `${consommation} · ${remplir(V.fraisKmValeur, { frais: enTexte(vehicule.fraisKm) })}` : consommation,
      faits: [
        [V.faits.coutKm, elementFourchette(bilan.coutKm, formats.nombre, V.parKm), "coutKm"],
        [V.faits.km, remplir(V.kmValeur, { valeur: formats.nombre.format(bilan.km) }), "km"],
        [V.faits.litres, elementFourchette(bilan.litres, formats.nombre, V.litres), "litres"],
        [V.faits.carburant, elementFourchette(bilan.carburant, formats.nombre, "€"), "carburant"],
        ...frais,
      ],
    });
  }

  // saisie : le module de saisie (élément en cours de modification).
  function creer({ saisie }) {
    function afficher(donnees) {
      const vehicules = donnees.vehicules.slice().sort(parNom);
      const bilans = Calc.vehicules(donnees);
      afficherListe("vehicules", vehicules, (v) => resumeVehicule(v, bilans.get(v.id)), saisie.enEdition("vehicules"));
    }

    return { afficher };
  }

  globalThis.UiVehicules = { creer };
})();
