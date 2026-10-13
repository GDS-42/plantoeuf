// Textes de l'interface, regroupés ici pour une traduction future.
// Français simple, sans vocabulaire comptable. « {nom} » marque une valeur insérée à l'affichage.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Textes = fabrique();
})(globalThis, function () {
  "use strict";

  return {
    titre: "plantoeuf — plan de culture",
    commun: {
      modifier: "Modifier",
      supprimer: "Supprimer",
      enregistrer: "Enregistrer les modifications",
      annuler: "Annuler",
      choisir: "— choisir —",
      supprime: "(supprimé)",
    },
    espaces: {
      titre: "Espaces",
      nom: "Nom de l'espace",
      surface: "Surface (m²)",
      type: "Type",
      ajouter: "Ajouter l'espace",
      aucun: "Aucun espace pour l'instant.",
      unite: "m²",
    },
    cultures: {
      titre: "Cultures",
      nom: "Nom de la culture",
      famille: "Famille botanique",
      unite: "Unité de vente",
      rendement: "Rendement par m² (estimation)",
      prix: "Prix de vente par unité, en € (estimation)",
      joursAvantRecolte: "Jours avant la première récolte",
      semainesRecolte: "Semaines de récolte",
      pertes: "Pertes et invendus (%)",
      aideFourchette: "Un nombre, ou trois : basse / médiane / haute (ex. 2 / 2,5 / 3).",
      ajouter: "Ajouter la culture",
      aucun: "Aucune culture pour l'instant.",
    },
    varietes: {
      titre: "Variétés",
      nom: "Nom de la variété",
      culture: "Culture",
      aide: "Laissez un champ vide pour garder la valeur de la culture.",
      ajouter: "Ajouter la variété",
      aucun: "Aucune variété pour l'instant.",
      memesValeurs: "mêmes valeurs que la culture",
    },
    plantations: {
      titre: "Plantations",
      variete: "Variété",
      espace: "Espace",
      surface: "Surface occupée (m²)",
      date: "Date de semis ou de plantation",
      ajouter: "Ajouter la plantation",
      aucun: "Aucune plantation pour l'instant.",
    },
    // Morceaux des lignes de liste.
    resume: {
      surface: "{valeur} m²",
      rendement: "rendement estimé {valeur} {unite}/m²",
      prix: "prix estimé {valeur} €/{unite}",
      joursAvantRecolte: "{valeur} j avant la récolte",
      semainesRecolte: "{valeur} semaines de récolte",
      pertes: "{valeur} % de pertes",
      date: "en terre le {valeur}",
    },
    // Les clés sont les valeurs enregistrées ; les textes sont ce qui s'affiche.
    typesEspace: {
      plein_champ: "plein champ",
      abri: "abri",
    },
    unitesVente: {
      kg: "kg",
      botte: "botte",
      piece: "pièce",
    },
    // Messages des erreurs, par code (voir store.js).
    erreurs: {
      fourchette_invalide: "Écrivez un nombre, ou trois nombres séparés par « / » : basse / médiane / haute.",
      fourchette_desordonnee: "Une fourchette va de la plus petite valeur à la plus grande : basse / médiane / haute.",
      inconnue: "L'enregistrement n'a pas pu se faire.",
    },
  };
});
