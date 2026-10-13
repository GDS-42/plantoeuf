// Points de vente, séances et débouchés : listes et listes déroulantes de leurs panneaux de saisie (N2).
// Les formulaires eux-mêmes passent par la mécanique commune de UiSaisie.
(function () {
  "use strict";

  const { T, formats, remplir, element, afficherFourchette, afficherDate, afficherMois, enEuros, nomDe, parNom } = UiCommun;
  const { afficherListe, remplirChoix } = UiSaisie.outils;
  const { caseFourchette } = UiTableau.outils;
  const jourCourt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

  // ---- Vue « Offre et demande » (EX-20)

  function enteteSemaine(lundi) {
    return element("th", { scope: "col", "data-semaine": lundi },
      remplir(T.offre.semaine, { numero: Calc.numeroDeSemaine(lundi) }), element("br"), jourCourt.format(new Date(lundi + "T00:00:00Z")));
  }

  // format : les volumes d'une culture (une décimale) ou les œufs (en entiers).
  function caseOffre(semaine, lundi, unite, format) {
    const td = caseFourchette(semaine.offre, (v) => format.format(v), { "data-semaine": lundi, "data-etat": semaine.etat, "data-sur": String(semaine.sur) });
    td.classList.add(`etat-${semaine.etat}`);
    const ecart = semaine.ecart === null ? "" : format.format(Math.abs(semaine.ecart));
    let titre = remplir(T.offre.etats[semaine.etat], { ecart, unite });
    if (semaine.sur) titre += ` (${T.offre.sur})`;
    td.setAttribute("title", titre);
    if (semaine.ecart !== null && semaine.etat !== "equilibre") {
      const signe = semaine.ecart > 0 ? "+" : "−";
      td.append(element("span", { class: "ecart", "data-valeur": String(semaine.ecart) }, signe + ecart));
    }
    return td;
  }

  function caseDemande(semaine, lundi, format) {
    if (semaine.demande === null) {
      return element("td", { "data-semaine": lundi, class: "nul", title: T.offre.sansDebouche }, element("span", { class: "mediane" }, T.tableau.nul));
    }
    return caseFourchette(semaine.demande, (v) => format.format(v), { "data-semaine": lundi });
  }

  function afficherOffreDemande(od) {
    const vide = od.lignes.length === 0;
    document.getElementById("matrice-vide").hidden = !vide;
    document.getElementById("matrice-legende").hidden = vide;
    const table = document.getElementById("matrice");
    table.hidden = vide;
    if (vide) return;
    table.tHead.replaceChildren(element("tr", {},
      element("th", { scope: "col" }, od.lignes.some((l) => l.produitId === Calc.OEUFS) ? T.offre.cultureOuOeufs : T.offre.culture),
      element("th", { scope: "col" }, T.offre.estimation),
      ...od.semaines.map(enteteSemaine)));
    table.tBodies[0].replaceChildren(...od.lignes.flatMap((ligne) => {
      const oeufs = ligne.produitId === Calc.OEUFS;
      const unite = oeufs ? T.poules.uniteOeufs : T.unitesVente[ligne.unite];
      const nom = oeufs ? T.poules.oeufs : ligne.nom;
      const format = oeufs ? formats.entiers : formats.volumes;
      return [
        element("tr", { "data-produit": ligne.produitId, "data-mesure": "offre" },
          element("th", { rowspan: "2", scope: "rowgroup" }, nom),
          element("th", { scope: "row" }, remplir(T.offre.offre, { unite })),
          ...od.semaines.map((lundi) => caseOffre(ligne.semaines[lundi], lundi, unite, format))),
        element("tr", { "data-produit": ligne.produitId, "data-mesure": "demande" },
          element("th", { scope: "row" }, remplir(T.offre.demande, { unite })),
          ...od.semaines.map((lundi) => caseDemande(ligne.semaines[lundi], lundi, format))),
      ];
    }));
  }

  // ---- Vue « Points de vente » (EX-22)

  function caseSeances(nombre, mois) {
    if (nombre === 0) return element("td", { "data-mois": mois, class: "nul" }, T.tableau.nul);
    return element("td", { "data-mois": mois }, formats.nombre.format(nombre));
  }

  function afficherPointsDeVente(vue) {
    const vide = vue.points.length === 0;
    document.getElementById("points-vide").hidden = !vide;
    document.getElementById("points-legende").hidden = vide;
    const table = document.getElementById("points");
    table.hidden = vide;
    if (vide) return;
    table.tHead.replaceChildren(element("tr", {},
      element("th", { scope: "col" }, T.points.pointVente),
      element("th", { scope: "col" }, T.points.estimation),
      ...vue.mois.map((m) => element("th", { scope: "col", "data-mois": m }, afficherMois(m))),
      element("th", { scope: "col" }, T.tableau.total)));
    const ligne = (point, mesure, entetes, cases) => element("tr", { "data-point-vente": point.pointVenteId, "data-mesure": mesure }, ...entetes, ...cases);
    const enFourchettes = (point, mesure) => [...vue.mois.map((m) => caseFourchette(point.mois[m][mesure], enEuros, { "data-mois": m })),
      caseFourchette(point.total[mesure], enEuros, { "data-mois": "total" })];
    table.tBodies[0].replaceChildren(...vue.points.flatMap((point) => [
      ligne(point, "seances", [element("th", { rowspan: "4", scope: "rowgroup" }, point.nom), element("th", { scope: "row" }, T.points.seances)],
        [...vue.mois.map((m) => caseSeances(point.mois[m].seances, m)), caseSeances(point.total.seances, "total")]),
      ...["ca", "couts", "resultat"].map((mesure) => ligne(point, mesure, [element("th", { scope: "row" }, T.points[mesure])], enFourchettes(point, mesure))),
    ]));
  }

  function resumePointVente(pointVente) {
    return [pointVente.nom,
      remplir(T.resume.distance, { valeur: formats.nombre.format(pointVente.distanceKm) }),
      remplir(T.resume.coutKm, { valeur: afficherFourchette(pointVente.coutKm) })].join(" · ");
  }

  function resumeSeance(seance, pointsVente) {
    const pointVente = pointsVente.get(seance.pointVenteId);
    const morceaux = [nomDe(pointVente),
      remplir(T.resume.jour, { jour: T.joursSemaine[seance.jour] }),
      remplir(T.resume.periode, { debut: afficherDate(seance.debut), fin: afficherDate(seance.fin) }),
      remplir(T.resume.frais, { valeur: afficherFourchette(seance.frais) })];
    // EX-19 : le nombre de séances datées et le coût de chacune, trajet compris.
    if (pointVente && !pointVente.supprimeLe) {
      morceaux.push(remplir(T.resume.seancesDatees, {
        nombre: Calc.seancesDatees(seance).length,
        cout: afficherFourchette(Calc.coutSeance(seance, pointVente)),
      }));
    }
    return morceaux.join(" · ");
  }

  // Un débouché vend une culture, ou les œufs (S3) : nom du produit et unités de son prix et de son volume.
  function produitDuDebouche(debouche, cultures) {
    if (debouche.produitId === Calc.OEUFS) return { nom: T.poules.oeufs, unitePrix: T.poules.oeuf, uniteVolume: T.poules.uniteOeufs };
    const culture = cultures.get(debouche.produitId);
    const unite = T.unitesVente[culture ? culture.unite : "kg"];
    return { nom: nomDe(culture), unitePrix: unite, uniteVolume: unite };
  }

  function resumeDebouche(debouche, pointsVente, cultures) {
    const produit = produitDuDebouche(debouche, cultures);
    return [remplir(T.resume.debouche, { produit: produit.nom, pointVente: nomDe(pointsVente.get(debouche.pointVenteId)) }),
      remplir(T.resume.prixDebouche, { valeur: afficherFourchette(debouche.prix), unite: produit.unitePrix }),
      remplir(T.resume.volumeParSeance, { valeur: afficherFourchette(debouche.volumeParSeance), unite: produit.uniteVolume })].join(" · ");
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
      remplirChoix(document.getElementById("debouche-produitId"),
        [...cultures.map((c) => ({ valeur: c.id, libelle: c.nom })), { valeur: Calc.OEUFS, libelle: T.poules.oeufs }]);

      afficherOffreDemande(Calc.offreDemande(donnees));
      afficherPointsDeVente(Calc.pointsDeVente(donnees));
    }

    return { afficher };
  }

  globalThis.UiVentes = { creer };
})();
