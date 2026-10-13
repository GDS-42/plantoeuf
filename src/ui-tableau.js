// Tableau économique « Par culture » (EX-04, EX-09 ; P2, EX-34) : une ligne par culture, une mesure à la
// fois — chiffre d'affaires, marge ou volume — au choix de l'utilisateur. Rendu seulement : les valeurs
// viennent de Calc.tableau.
(function () {
  "use strict";

  const { T, formats, remplir, element, afficherMois, enEuros } = UiCommun;
  const V = T.vueSynthese;
  const TEINTES = 5;

  // Une case : la médiane en gras, la basse et la haute dessous ; data-valeur garde le nombre exact.
  // Une case nulle affiche un tiret, discret, et garde ses valeurs exactes. (Partagée avec ui-ventes.js.)
  function caseFourchette(fourchette, format, attributs) {
    const nulle = fourchette.basse === 0 && fourchette.haute === 0;
    const valeur = (niveau) => element("span", { class: niveau, "data-valeur": String(fourchette[niveau]) },
      nulle ? T.tableau.nul : format(fourchette[niveau]));
    const td = element("td", attributs, valeur("mediane"), element("span", { class: "bornes" }, valeur("basse"), " – ", valeur("haute")));
    if (nulle) td.classList.add("nul");
    return td;
  }

  // EX-14 : le chiffre d'affaires et la marge estimés de la saison, en fourchette, en tête de l'outil.
  function afficherIndicateur(id, fourchette, vide) {
    const indicateur = document.getElementById(id);
    for (const niveau of ["basse", "mediane", "haute"]) {
      const el = indicateur.querySelector(`.${niveau}`);
      el.dataset.valeur = String(fourchette[niveau]);
      el.textContent = vide ? T.synthese.vide : enEuros(fourchette[niveau]);
    }
    indicateur.querySelector(".indicateur-bornes").hidden = vide;
    indicateur.classList.toggle("negatif", !vide && fourchette.mediane < 0);
  }

  function afficherSynthese(tableau) {
    const vide = tableau.lignes.length === 0 && !tableau.poules;
    afficherIndicateur("synthese", tableau.total.total.ca, vide);
    afficherIndicateur("synthese-marge", tableau.total.total.marge, vide);
  }

  // « 1 lot », « 3 lots » : le texte au singulier ou au pluriel selon le nombre.
  function nombreDe(textes, nombre) {
    return remplir(nombre === 1 ? textes.un : textes.plusieurs, { nombre: formats.nombre.format(nombre) });
  }

  // ---- P2 : cases et lignes du tableau « Par culture »

  // Les cases du tableau : les euros sans « € » (l'unité est dans l'en-tête), les volumes à une décimale,
  // les œufs en nombres entiers ; un nombre négatif porte le vrai signe moins. Une fourchette se lit
  // « basse – haute » sous la médiane, ou « basse à haute » quand la basse est négative (« −359 à −225 »).
  const moins = (texte) => texte.replace(/^-/, "−");
  const enNombre = {
    euros: (v) => moins(formats.euros.format(v)),
    volume: (v) => formats.volumes.format(v),
    oeufs: (v) => formats.entiers.format(v),
  };

  function caseDuTableau(fourchette, format, attributs) {
    const nulle = fourchette.basse === 0 && fourchette.haute === 0;
    const valeur = (niveau) => element("span", { class: niveau, "data-valeur": String(fourchette[niveau]) },
      nulle ? T.tableau.nul : format(fourchette[niveau]));
    const td = element("td", attributs, valeur("mediane"), element("span", { class: "bornes" }, valeur("basse"), fourchette.basse < 0 ? V.bornesNegatives : "\u2009–\u2009", valeur("haute")));
    if (nulle) td.classList.add("nul");
    if (fourchette.mediane < 0) td.classList.add("negatif");
    return td;
  }

  // En-tête d'une ligne : le nom visible, l'unité ou une précision dessous, et pour les lecteurs d'écran
  // la mesure en toutes lettres (EX-09 : signalée comme une estimation).
  function enteteDeLigne(nom, { precision = "", lecteur = "" } = {}) {
    return element("th", { scope: "row" },
      element("span", { class: "ligne-nom" }, nom),
      ...(precision ? [element("span", { class: "ligne-precision" }, precision)] : []),
      ...(lecteur ? [element("span", { class: "pour-lecteur-d-ecran" }, ` — ${lecteur}`)] : []));
  }

  // parMois : les cases de la ligne par mois ({ « AAAA-MM » : { ca, marge, volume… } }) ; mesure : celle de la ligne.
  function ligne(attributs, entete, mois, parMois, mesure, total, format) {
    return element("tr", attributs, entete,
      ...mois.map((m) => caseDuTableau(parMois[m][mesure], format, { "data-mois": m })),
      caseDuTableau(total, format, { "data-mois": "total", class: "col-total" }));
  }

  // Une teinte de 1 à 5 proportionnelle à la médiane, rapportée à la plus grande de l'ensemble ;
  // 0 pour une case nulle ou négative. En euros, l'ensemble est toute la mesure (les lignes se comparent) ;
  // en volume, chaque ligne (les unités diffèrent).
  function teinter(lignes) {
    const cases = lignes.flatMap((tr) => [...tr.querySelectorAll("td[data-mois]:not(.col-total)")]);
    const valeurDe = (td) => Number(td.querySelector(".mediane").dataset.valeur);
    const max = Math.max(0, ...cases.map(valeurDe));
    for (const td of cases) {
      const v = valeurDe(td);
      const teinte = max > 0 && v > 0 ? Math.max(1, Math.ceil((TEINTES * v) / max - 1e-9)) : 0;
      td.dataset.teinte = String(teinte);
    }
  }

  // ---- Mesure choisie

  let mesureChoisie = "ca";

  function choisirMesure(mesure) {
    mesureChoisie = mesure;
    const table = document.getElementById("tableau");
    for (const tr of table.tBodies[0].querySelectorAll("tr[data-mesure]")) tr.hidden = tr.dataset.mesure !== mesure;
    table.tFoot.hidden = mesure === "volume";
    table.dataset.mesure = mesure;
    document.querySelectorAll("#tableau-mesures button[data-mesure]").forEach((bouton) => {
      bouton.setAttribute("aria-pressed", String(bouton.dataset.mesure === mesure));
    });
    document.getElementById("tableau-titre").textContent = V.titres[mesure];
    document.getElementById("tableau-legende").textContent = V.legendes[mesure];
    const unite = table.querySelector("thead .col-nom .entete-unite");
    if (unite) unite.textContent = mesure === "volume" ? V.parLigne : V.enEuros;
  }

  let branche = false;
  function brancher() {
    if (branche) return;
    branche = true;
    document.getElementById("tableau-mesures").addEventListener("click", (evenement) => {
      const bouton = evenement.target.closest("button[data-mesure]");
      if (bouton) choisirMesure(bouton.dataset.mesure);
    });
  }

  // ---- Rendu

  function entete(tableau) {
    let annee = null;
    const moisCourt = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" });
    return element("tr", {},
      element("th", { scope: "col", class: "col-nom" },
        element("span", { class: "entete-titre" }, tableau.poules ? T.tableau.cultureOuAtelier : T.tableau.culture),
        element("span", { class: "entete-unite" }, V.enEuros)),
      ...tableau.mois.map((m) => {
        const [a] = m.split("-");
        const nouvelleAnnee = a !== annee;
        annee = a;
        // Le mois abrégé ; l'année sous le premier mois de chaque année, en toutes lettres pour les lecteurs d'écran.
        return element("th", { scope: "col", "data-mois": m, "aria-label": afficherMois(m) },
          element("span", { class: "entete-titre" }, moisCourt.format(new Date(`${m}-01T00:00:00Z`))),
          element("span", { class: nouvelleAnnee ? "entete-unite" : "pour-lecteur-d-ecran" }, ` ${a}`));
      }),
      element("th", { scope: "col", class: "col-total" },
        element("span", { class: "entete-titre" }, T.tableau.total),
        element("span", { class: "entete-unite" }, V.saison)));
  }

  function lignesDesCultures(tableau) {
    return tableau.lignes.flatMap((l) => {
      const unite = T.unitesVente[l.unite];
      const volume = remplir(l.aDebouche ? T.tableau.volumeVendu : T.tableau.volume, { unite });
      return [
        ligne({ "data-culture": l.cultureId, "data-mesure": "ca" }, enteteDeLigne(l.nom, { lecteur: V.lecteur.ca }),
          tableau.mois, l.mois, "ca", l.total.ca, enNombre.euros),
        ligne({ "data-culture": l.cultureId, "data-mesure": "marge" }, enteteDeLigne(l.nom, { lecteur: V.lecteur.marge }),
          tableau.mois, l.mois, "marge", l.total.marge, enNombre.euros),
        ligne({ "data-culture": l.cultureId, "data-mesure": "volume" }, enteteDeLigne(l.nom, { precision: V.unites[l.unite], lecteur: volume }),
          tableau.mois, l.mois, "volume", l.total.volume, enNombre.volume),
      ];
    });
  }

  // S3 (EX-27) : l'atelier poules sous les cultures, après son bandeau. Une ligne par mesure ; l'aliment
  // de l'atelier se lit au pied, pour toute la ferme (sa ligne reste dans le tableau, masquée).
  function lignesDesPoules(tableau, colonnes) {
    const { poules } = tableau;
    if (!poules) return [];
    const nom = T.poules.oeufs;
    return [
      element("tr", { class: "bandeau-atelier", "data-atelier": "poules" },
        element("th", { colspan: String(colonnes), scope: "colgroup" }, element("span", {},
          remplir(T.tableau.atelierPoules, { lots: nombreDe(T.tableau.lots, poules.lots), poules: nombreDe(T.tableau.poules, poules.effectif) })))),
      ligne({ "data-culture": "oeufs", "data-mesure": "ca" }, enteteDeLigne(nom, { lecteur: V.lecteur.ca }),
        tableau.mois, poules.mois, "ca", poules.total.ca, enNombre.euros),
      ligne({ "data-culture": "oeufs", "data-mesure": "marge" }, enteteDeLigne(nom, { precision: V.alimentDeduit, lecteur: T.tableau.margeAtelier }),
        tableau.mois, poules.mois, "marge", poules.total.marge, enNombre.euros),
      ligne({ "data-culture": "oeufs", "data-mesure": "volume" },
        enteteDeLigne(nom, { precision: V.unites.oeufs, lecteur: poules.aDebouche ? T.tableau.oeufsVendus : T.tableau.oeufs }),
        tableau.mois, poules.mois, "volume", poules.total.volume, enNombre.oeufs),
      ligne({ "data-culture": "oeufs", "data-mesure": "aliment" }, enteteDeLigne(nom, { lecteur: T.tableau.aliment }),
        tableau.mois, poules.mois, "aliment", poules.total.aliment, enNombre.euros),
    ];
  }

  // Pied « Toute la ferme » : chiffre d'affaires, coût des séances s'il y en a (EX-23), aliment s'il y a des
  // poules (EX-27), marge de la ferme. Visible en euros ; masqué en volume (des unités différentes ne s'additionnent pas).
  function pied(tableau, colonnes) {
    const avecCouts = tableau.total.total.couts.haute > 0;
    const mesures = ["ca", ...(avecCouts ? ["couts"] : []), ...(tableau.poules ? ["aliment"] : []), "marge"];
    return [
      element("tr", { class: "pied-titre" }, element("th", { colspan: String(colonnes), scope: "colgroup" }, element("span", {}, V.pied.titre))),
      ...mesures.map((mesure) => ligne({ "data-culture": "ferme", "data-mesure": mesure, class: `pied-${mesure}` },
        enteteDeLigne(V.pied[mesure], { lecteur: V.lecteur[mesure] }), tableau.mois, tableau.total.mois, mesure, tableau.total.total[mesure], enNombre.euros)),
    ];
  }

  // tableau : résultat de Calc.tableau.
  function afficher(tableau) {
    brancher();
    afficherSynthese(tableau);
    const vide = tableau.lignes.length === 0 && !tableau.poules;
    for (const id of ["tableau-legende", "tableau-mesures", "tableau-defilement"]) document.getElementById(id).hidden = vide;
    document.getElementById("tableau-vide").hidden = !vide;
    const table = document.getElementById("tableau");
    table.hidden = vide;
    document.getElementById("tableau-titre").textContent = V.titres[mesureChoisie];
    if (vide) return;

    const colonnes = tableau.mois.length + 2;
    table.tHead.replaceChildren(entete(tableau));
    table.tBodies[0].replaceChildren(...lignesDesCultures(tableau), ...lignesDesPoules(tableau, colonnes));
    table.tFoot.replaceChildren(...pied(tableau, colonnes));
    for (const mesure of ["ca", "marge"]) teinter([...table.tBodies[0].querySelectorAll(`tr[data-mesure="${mesure}"]`)]);
    for (const tr of table.tBodies[0].querySelectorAll('tr[data-mesure="volume"]')) teinter([tr]);
    choisirMesure(mesureChoisie);
  }

  globalThis.UiTableau = { afficher, choisirMesure, outils: { caseFourchette } };
})();
