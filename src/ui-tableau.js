// Tableau économique par culture et par mois, en fourchette (EX-04, EX-09).
(function () {
  "use strict";

  const { T, formats, remplir, element, afficherMois, enEuros } = UiCommun;

  // Une case : la médiane en gras, la basse et la haute dessous ; data-valeur garde le nombre exact.
  // Une case nulle affiche un tiret, discret, et garde ses valeurs exactes.
  function caseFourchette(fourchette, format, attributs) {
    const nulle = fourchette.basse === 0 && fourchette.haute === 0;
    const valeur = (niveau) => element("span", { class: niveau, "data-valeur": String(fourchette[niveau]) },
      nulle ? T.tableau.nul : format(fourchette[niveau]));
    const td = element("td", attributs, valeur("mediane"), element("span", { class: "bornes" }, valeur("basse"), " – ", valeur("haute")));
    if (nulle) td.classList.add("nul");
    return td;
  }

  // EX-14 : le chiffre d'affaires estimé de la saison, en fourchette, en tête de l'outil.
  function afficherSynthese(tableau) {
    const synthese = document.getElementById("synthese");
    const vide = tableau.lignes.length === 0;
    const ca = tableau.total.total.ca;
    for (const niveau of ["basse", "mediane", "haute"]) {
      const el = synthese.querySelector(`.${niveau}`);
      el.dataset.valeur = String(ca[niveau]);
      el.textContent = vide ? T.synthese.vide : enEuros(ca[niveau]);
    }
    synthese.querySelector(".synthese-bornes").hidden = vide;
  }

  function ligneDuTableau(attributs, entetes, cases, total, format) {
    return element("tr", attributs, ...entetes,
      ...cases.map(([mois, fourchette]) => caseFourchette(fourchette, format, { "data-mois": mois })),
      caseFourchette(total, format, { "data-mois": "total" }));
  }

  // tableau : résultat de Calc.tableau.
  function afficher(tableau) {
    afficherSynthese(tableau);
    const vide = tableau.lignes.length === 0;
    document.getElementById("tableau-legende").hidden = vide;
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
          [element("th", { rowspan: "3", scope: "rowgroup" }, ligne.nom),
            element("th", { scope: "row" }, remplir(ligne.aDebouche ? T.tableau.volumeVendu : T.tableau.volume, { unite }))],
          casesDe(ligne.mois, "volume"), ligne.total.volume, (v) => formats.volumes.format(v)),
        ligneDuTableau({ "data-culture": ligne.cultureId, "data-mesure": "ca" },
          [element("th", { scope: "row" }, T.tableau.ca)], casesDe(ligne.mois, "ca"), ligne.total.ca, enEuros),
        ligneDuTableau({ "data-culture": ligne.cultureId, "data-mesure": "marge" },
          [element("th", { scope: "row" }, T.tableau.marge)], casesDe(ligne.mois, "marge"), ligne.total.marge, enEuros),
      ];
    }));

    // Pied : chiffre d'affaires, coût des séances s'il y en a (EX-23), marge de la ferme.
    const avecCouts = tableau.total.total.couts.haute > 0;
    const pied = [["ca", T.tableau.ca], ...(avecCouts ? [["couts", T.tableau.couts]] : []), ["marge", T.tableau.marge]];
    table.tFoot.replaceChildren(...pied.map(([mesure, libelle], rang) => ligneDuTableau({ "data-culture": "ferme", "data-mesure": mesure },
      [...(rang === 0 ? [element("th", { rowspan: String(pied.length), scope: "rowgroup" }, T.tableau.ferme)] : []), element("th", { scope: "row" }, libelle)],
      casesDe(tableau.total.mois, mesure), tableau.total.total[mesure], enEuros)));
  }

  globalThis.UiTableau = { afficher, outils: { caseFourchette } };
})();
