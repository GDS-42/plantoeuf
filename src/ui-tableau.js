// Tableau économique par culture et par mois, en fourchette (EX-04, EX-09).
(function () {
  "use strict";

  const { T, formats, remplir, element, afficherMois, enEuros } = UiCommun;

  // Une case : la médiane en gras, la basse et la haute dessous ; data-valeur garde le nombre exact.
  function caseFourchette(fourchette, format, attributs) {
    const valeur = (niveau) => element("span", { class: niveau, "data-valeur": String(fourchette[niveau]) }, format(fourchette[niveau]));
    const td = element("td", attributs, valeur("mediane"), element("span", { class: "bornes" }, valeur("basse"), " – ", valeur("haute")));
    if (fourchette.haute === 0) td.classList.add("nul");
    return td;
  }

  function ligneDuTableau(attributs, entetes, cases, total, format) {
    return element("tr", attributs, ...entetes,
      ...cases.map(([mois, fourchette]) => caseFourchette(fourchette, format, { "data-mois": mois })),
      caseFourchette(total, format, { "data-mois": "total" }));
  }

  // tableau : résultat de Calc.tableau.
  function afficher(tableau) {
    const vide = tableau.lignes.length === 0;
    document.getElementById("tableau-vide").hidden = !vide;
    const table = document.getElementById("tableau");
    table.hidden = vide;
    if (vide) return;

    table.tHead.replaceChildren(element("tr", {},
      element("th", { scope: "col" }, T.tableau.culture),
      element("th", { scope: "col" }, T.tableau.estimation),
      ...tableau.mois.map((m) => element("th", { scope: "col", "data-mois": m }, afficherMois(m))),
      element("th", { scope: "col" }, T.tableau.total)));

    const casesDe = (parMois, mesure) => tableau.mois.map((m) => [m, parMois[m][mesure]]);
    table.tBodies[0].replaceChildren(...tableau.lignes.flatMap((ligne) => {
      const unite = T.unitesVente[ligne.unite];
      return [
        ligneDuTableau({ "data-culture": ligne.cultureId, "data-mesure": "volume" },
          [element("th", { rowspan: "3", scope: "rowgroup" }, ligne.nom), element("th", { scope: "row" }, remplir(T.tableau.volume, { unite }))],
          casesDe(ligne.mois, "volume"), ligne.total.volume, (v) => formats.volumes.format(v)),
        ligneDuTableau({ "data-culture": ligne.cultureId, "data-mesure": "ca" },
          [element("th", { scope: "row" }, T.tableau.ca)], casesDe(ligne.mois, "ca"), ligne.total.ca, enEuros),
        ligneDuTableau({ "data-culture": ligne.cultureId, "data-mesure": "marge" },
          [element("th", { scope: "row" }, T.tableau.marge)], casesDe(ligne.mois, "marge"), ligne.total.marge, enEuros),
      ];
    }));

    table.tFoot.replaceChildren(
      ligneDuTableau({ "data-culture": "ferme", "data-mesure": "ca" },
        [element("th", { rowspan: "2", scope: "rowgroup" }, T.tableau.ferme), element("th", { scope: "row" }, T.tableau.ca)],
        casesDe(tableau.total.mois, "ca"), tableau.total.total.ca, enEuros),
      ligneDuTableau({ "data-culture": "ferme", "data-mesure": "marge" },
        [element("th", { scope: "row" }, T.tableau.marge)], casesDe(tableau.total.mois, "marge"), tableau.total.total.marge, enEuros));
  }

  globalThis.UiTableau = { afficher };
})();
