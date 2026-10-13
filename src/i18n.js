// Textes de l'interface, regroupés ici pour une traduction future.
// Français simple, sans vocabulaire comptable.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Textes = fabrique();
})(globalThis, function () {
  "use strict";

  return {
    titre: "plantoeuf — plan de culture",
    espaces: {
      titre: "Espaces",
      nom: "Nom de l'espace",
      surface: "Surface (m²)",
      type: "Type",
      ajouter: "Ajouter l'espace",
      aucun: "Aucun espace pour l'instant.",
      unite: "m²",
    },
    // Les clés sont les valeurs enregistrées ; les textes sont ce qui s'affiche.
    typesEspace: {
      plein_champ: "plein champ",
      abri: "abri",
    },
  };
});
