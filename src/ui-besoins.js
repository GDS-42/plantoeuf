// Semences et plants à prévoir (N3, EX-49) : section de la page Plantations, mois par mois.
// Rendu seulement : la liste, ses mois et leurs coûts viennent de Calc.besoinsParMois.
(function () {
  "use strict";

  const { T, formats, element, elementFourchette, afficherDate, afficherMois, nomDe } = UiCommun;
  const { contenuLigne } = UiSaisie.outils;
  const B = T.besoins;

  // « 100 plants », « 37,5 plants » : la quantité calculée, avec l'unité de la mise en place.
  function quantite(besoin) {
    const unite = B.unites[besoin.implantation] || B.unites[""];
    return `${formats.nombre.format(besoin.quantite)} ${besoin.quantite === 1 ? unite.un : unite.plusieurs}`;
  }

  function cout(f) {
    return f ? elementFourchette(f, formats.nombre, "€") : B.coutInconnu;
  }

  function ligne(besoin, cultures, varietes) {
    const variete = varietes.get(besoin.varieteId);
    return element("li", { "data-plantation": besoin.plantationId }, contenuLigne({
      titre: nomDe(cultures.get(besoin.cultureId)),
      sousTitre: variete ? variete.nom : "",
      faits: [
        [B.faits.date, afficherDate(besoin.date), "date"],
        [B.faits.quantite, quantite(besoin), "quantite"],
        [B.faits.cout, cout(besoin.cout), "cout"],
      ],
    }));
  }

  function afficher(donnees) {
    const { mois, cout: saison } = Calc.besoinsParMois(donnees);
    const section = document.getElementById("section-besoins");
    section.hidden = mois.length === 0;
    if (!mois.length) return;
    const cultures = new Map(donnees.cultures.map((c) => [c.id, c]));
    const varietes = new Map(donnees.varietes.map((v) => [v.id, v]));
    document.getElementById("besoins").replaceChildren(...mois.map((m) => element("section", { class: "besoins-mois", "data-mois": m.mois },
      element("header", {}, element("h3", {}, afficherMois(m.mois)), ...(m.cout ? [element("span", { class: "besoins-cout" }, B.totalMois, cout(m.cout))] : [])),
      element("ul", { class: "liste" }, ...m.besoins.map((b) => ligne(b, cultures, varietes))))));
    document.getElementById("besoins-total").replaceChildren(...(saison ? [B.totalSaison, cout(saison)] : []));
  }

  globalThis.UiBesoins = { afficher };
})();
