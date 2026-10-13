// Saisie : listes de chaque objet et formulaires ouverts dans un tiroir (EX-01 ; P2, EX-31).
(function () {
  "use strict";

  const { T, formats, texte, remplir, element, icone, afficherFourchette, saisieFourchette, afficherDate, afficherMois, nomDe, parNom } = UiCommun;
  const CHAMPS_SURCHARGEABLES = Calc.CHAMPS_SURCHARGEABLES;

  // ---- Lignes des listes

  function resumeChamp(champ, valeur, unite) {
    const affiche = typeof valeur === "object" ? afficherFourchette(valeur) : formats.nombre.format(valeur);
    return remplir(T.resume[champ], { valeur: affiche, unite: T.unitesVente[unite] });
  }

  function resumeEspace(espace, surOccupation) {
    const resume = [espace.nom, remplir(T.resume.surface, { valeur: formats.nombre.format(espace.surface) }), T.typesEspace[espace.type]].join(" · ");
    if (!surOccupation) return resume;
    const mois = surOccupation.mois.map((m) => remplir(T.espaces.moisSurOccupe, {
      mois: afficherMois(m.mois), surface: formats.nombre.format(m.surface),
    })).join(", ");
    return [resume, element("span", { class: "sur-occupation", role: "status" },
      remplir(T.espaces.surOccupation, { mois, surface: formats.nombre.format(espace.surface) }))];
  }

  function resumeCulture(culture) {
    const nom = culture.famille ? `${culture.nom} (${culture.famille})` : culture.nom;
    return [nom, T.unitesVente[culture.unite],
      ...CHAMPS_SURCHARGEABLES.map((champ) => resumeChamp(champ, culture[champ], culture.unite))].join(" · ");
  }

  function resumeVariete(variete, cultures) {
    const culture = cultures.get(variete.cultureId);
    const surcharges = CHAMPS_SURCHARGEABLES.filter((champ) => variete[champ] !== null && variete[champ] !== undefined)
      .map((champ) => resumeChamp(champ, variete[champ], culture ? culture.unite : "kg"));
    return [variete.nom, nomDe(culture), ...(surcharges.length ? surcharges : [T.varietes.memesValeurs])].join(" · ");
  }

  function resumePlantation(plantation, varietes, cultures, espaces) {
    const variete = varietes.get(plantation.varieteId);
    const culture = variete && cultures.get(variete.cultureId);
    const nom = variete ? `${nomDe(culture)} ${nomDe(variete)}` : nomDe(variete);
    const morceaux = [nom, nomDe(espaces.get(plantation.espaceId)),
      remplir(T.resume.surface, { valeur: formats.nombre.format(plantation.surface) }),
      remplir(T.resume.date, { valeur: afficherDate(plantation.date) })];
    if (culture) {
      const recolte = Calc.datesRecolte(plantation, Calc.parametres(culture, variete));
      morceaux.push(remplir(T.resume.recolte, { debut: afficherDate(recolte.debut), fin: afficherDate(recolte.fin) }));
    }
    return morceaux.join(" · ");
  }

  // P2 : contenu d'une ligne de liste — un titre et ses puces, puis des faits « libellé : valeur »
  // alignés, puis d'éventuelles alertes. faits : [[libellé, valeur (texte ou élément)], …] ;
  // puces : [{ texte, ton }] avec ton « verte », « oeuf » ou « alerte » ; alertes : éléments.
  function contenuLigne({ titre, puces = [], faits = [], alertes = [] }) {
    return element("div", { class: "ligne-texte" },
      element("div", { class: "ligne-entete" }, element("span", { class: "ligne-titre" }, titre),
        ...puces.map(({ texte: t, ton }) => element("span", { class: ton ? `puce ${ton}` : "puce" }, t))),
      ...(faits.length ? [element("dl", { class: "ligne-faits" }, ...faits.map(([libelle, valeur]) =>
        element("div", {}, element("dt", {}, libelle), element("dd", {}, valeur))))] : []),
      ...alertes);
  }

  // Boutons d'une ligne : une icône, et leur nom pour les lecteurs d'écran.
  function boutonLigne(action, nomIcone, libelle) {
    return element("button", { type: "button", class: "bouton-icone", "data-action": action, title: libelle },
      icone(nomIcone), element("span", { class: "pour-lecteur-d-ecran" }, libelle));
  }

  // Liste d'un objet ; resume(e) rend le contenu de la ligne (texte ou éléments) ;
  // enEdition : identifiant de l'élément en cours de modification (EX-15).
  function afficherListe(objet, enregistrements, resume, enEdition) {
    document.getElementById(`${objet}-vide`).hidden = enregistrements.length > 0;
    const liste = document.getElementById(`liste-${objet}`);
    liste.hidden = enregistrements.length === 0;
    liste.replaceChildren(...enregistrements.map((e) => {
      const contenu = [].concat(resume(e));
      const texteLigne = contenu.length === 1 && contenu[0] instanceof Node && contenu[0].classList && contenu[0].classList.contains("ligne-texte")
        ? contenu[0]
        : element("div", { class: "ligne-texte" }, element("span", { class: "resume" }, ...contenu));
      const li = element("li", { "data-id": e.id }, texteLigne,
        element("div", { class: "ligne-actions" },
          boutonLigne("modifier", "crayon", T.commun.modifier),
          boutonLigne("supprimer", "corbeille", T.commun.supprimer)));
      if (e.id === enEdition) li.setAttribute("aria-current", "true");
      return li;
    }));
    // Le nombre d'éléments actifs, dans le titre de la liste et dans la navigation.
    const compte = document.querySelector(`#section-${objet} .compte`);
    compte.textContent = String(enregistrements.length);
    compte.setAttribute("aria-label", remplir(T.panneaux.compte, { nombre: enregistrements.length }));
    document.querySelectorAll(`.compte-nav[data-objet="${objet}"]`).forEach((el) => {
      el.textContent = String(enregistrements.length);
    });
  }

  // ---- Listes déroulantes

  function remplirChoix(select, options) {
    const courant = select.value;
    select.replaceChildren(element("option", { value: "" }, T.commun.choisir),
      ...options.map((o) => element("option", { value: o.valeur }, o.libelle)));
    select.value = options.some((o) => o.valeur === courant) ? courant : "";
  }

  // ---- Formulaires

  function lireFormulaire(formulaire) {
    const champs = {};
    for (const entree of formulaire.querySelectorAll("[data-champ]")) {
      const champ = entree.dataset.champ;
      if (entree.dataset.format === "nombre") champs[champ] = entree.value === "" ? null : Number(entree.value);
      else if (entree.dataset.format === "fourchette") champs[champ] = Store.lireFourchette(entree.value);
      else champs[champ] = entree.value.trim();
    }
    return champs;
  }

  function ecrireFormulaire(formulaire, enregistrement) {
    for (const entree of formulaire.querySelectorAll("[data-champ]")) {
      const valeur = enregistrement[entree.dataset.champ];
      if (valeur === null || valeur === undefined) entree.value = "";
      else entree.value = entree.dataset.format === "fourchette" ? saisieFourchette(valeur) : String(valeur);
    }
  }

  function boutonValider(formulaire) {
    return formulaire.querySelector('button[type="submit"]');
  }

  function montrerErreur(formulaire, message) {
    const zone = formulaire.querySelector(".erreur");
    zone.textContent = message || "";
    zone.hidden = !message;
  }

  // EX-15 : la liste et l'élément en cours de modification se signalent.
  function signalerEdition(formulaire, id) {
    const panneau = document.getElementById(`section-${formulaire.dataset.objet}`);
    if (id) panneau.dataset.mode = "modification";
    else delete panneau.dataset.mode;
    panneau.querySelectorAll("ul.liste li").forEach((li) => {
      if (li.dataset.id === id) li.setAttribute("aria-current", "true");
      else li.removeAttribute("aria-current");
    });
  }

  // ---- Tiroirs (EX-31) : le formulaire s'ouvre à droite, titré « Ajouter… » ou « Modifier… ».

  function tiroirDe(formulaire) {
    return formulaire.closest("dialog");
  }

  function ouvrirTiroir(formulaire, mode) {
    const tiroir = tiroirDe(formulaire);
    tiroir.querySelector(".tiroir-titre").textContent = T.tiroirs[formulaire.dataset.objet][mode];
    if (!tiroir.open) tiroir.showModal();
    formulaire.querySelector("[data-champ]").focus();
  }

  function quitterEdition(formulaire) {
    formulaire.reset();
    delete formulaire.dataset.id;
    signalerEdition(formulaire, null);
    boutonValider(formulaire).textContent = texte(boutonValider(formulaire).dataset.texte);
    montrerErreur(formulaire, null);
  }

  // Ferme le tiroir et oublie la saisie en cours.
  function fermer(formulaire) {
    const tiroir = tiroirDe(formulaire);
    if (tiroir.open) tiroir.close();
    quitterEdition(formulaire);
  }

  function entrerEdition(formulaire, enregistrement) {
    quitterEdition(formulaire);
    ecrireFormulaire(formulaire, enregistrement);
    formulaire.dataset.id = enregistrement.id;
    signalerEdition(formulaire, enregistrement.id);
    boutonValider(formulaire).textContent = T.commun.enregistrer;
    ouvrirTiroir(formulaire, "modifier");
  }

  // Message bref après un enregistrement ou une suppression.
  let minuterieAnnonce = null;
  function annoncer(message) {
    const zone = document.getElementById("annonce");
    zone.textContent = message;
    zone.hidden = false;
    clearTimeout(minuterieAnnonce);
    minuterieAnnonce = setTimeout(() => { zone.hidden = true; }, 2600);
  }

  // ferme : fonction qui rend la ferme ouverte (elle change si un autre onglet l'a modifiée).
  // rafraichir : recalcule tout l'affichage après un enregistrement.
  function creer({ ferme, rafraichir }) {
    const formulaires = {};

    function brancherFormulaire(formulaire) {
      const objet = formulaire.dataset.objet;
      formulaires[objet] = formulaire;

      formulaire.addEventListener("submit", (evenement) => {
        evenement.preventDefault();
        const modification = Boolean(formulaire.dataset.id);
        try {
          const champs = lireFormulaire(formulaire);
          if (modification) ferme().modifier(objet, formulaire.dataset.id, champs);
          else ferme().ajouter(objet, champs);
        } catch (e) {
          if (!T.erreurs[e.code]) console.error(e);
          montrerErreur(formulaire, T.erreurs[e.code] || T.erreurs.inconnue);
          return;
        }
        fermer(formulaire);
        rafraichir();
        annoncer(modification ? T.annonces.enregistre : T.annonces.ajoute);
      });

      const tiroir = tiroirDe(formulaire);
      formulaire.querySelector(".annuler").addEventListener("click", () => fermer(formulaire));
      tiroir.querySelector('[data-action="fermer"]').addEventListener("click", () => fermer(formulaire));
      // Échap ferme le tiroir (événement « close ») ; un clic sur le voile aussi.
      tiroir.addEventListener("close", () => {
        if (!tiroir.open) quitterEdition(formulaire);
      });
      tiroir.addEventListener("click", (evenement) => {
        if (evenement.target !== tiroir) return;
        const cadre = tiroir.getBoundingClientRect();
        const dedans = evenement.clientX >= cadre.left && evenement.clientX <= cadre.right && evenement.clientY >= cadre.top && evenement.clientY <= cadre.bottom;
        if (!dedans) fermer(formulaire);
      });

      document.getElementById(`liste-${objet}`).addEventListener("click", (evenement) => {
        const bouton = evenement.target.closest("button[data-action]");
        if (!bouton) return;
        const id = bouton.closest("li").dataset.id;
        if (bouton.dataset.action === "modifier") {
          entrerEdition(formulaire, ferme().obtenir(objet, id));
        } else if (bouton.dataset.action === "supprimer") {
          ferme().supprimer(objet, id);
          if (formulaire.dataset.id === id) fermer(formulaire);
          rafraichir();
          annoncer(T.annonces.supprime);
        }
      });
    }

    function brancher(racine) {
      racine.querySelectorAll("form[data-objet]").forEach(brancherFormulaire);
    }

    function quitterToutes() {
      Object.values(formulaires).forEach(fermer);
    }

    // Ouvre le tiroir d'ajout d'un objet, formulaire vide.
    function ouvrir(objet) {
      const formulaire = formulaires[objet];
      quitterEdition(formulaire);
      ouvrirTiroir(formulaire, "ajouter");
    }

    function parId(objet) {
      return new Map(ferme().lister(objet, { avecSupprimes: true }).map((e) => [e.id, e]));
    }

    // Listes et listes déroulantes, depuis les enregistrements actifs.
    function afficher(donnees) {
      const espaces = donnees.espaces.slice().sort(parNom);
      const cultures = donnees.cultures.slice().sort(parNom);
      const varietes = donnees.varietes.slice();
      const plantations = donnees.plantations.slice();
      const tousEspaces = parId("espaces");
      const toutesCultures = parId("cultures");
      const toutesVarietes = parId("varietes");

      const libelleVariete = (v) => `${nomDe(toutesCultures.get(v.cultureId))} — ${v.nom}`;
      const libellePlantation = (p) => resumePlantation(p, toutesVarietes, toutesCultures, tousEspaces);
      varietes.sort((a, b) => libelleVariete(a).localeCompare(libelleVariete(b), "fr"));
      plantations.sort((a, b) => a.date.localeCompare(b.date) || libellePlantation(a).localeCompare(libellePlantation(b), "fr"));

      const surOccupations = Calc.surOccupations(donnees);
      afficherListe("espaces", espaces, (e) => resumeEspace(e, surOccupations[e.id]), enEdition("espaces"));
      afficherListe("cultures", cultures, resumeCulture, enEdition("cultures"));
      afficherListe("varietes", varietes, (v) => resumeVariete(v, toutesCultures), enEdition("varietes"));
      afficherListe("plantations", plantations, libellePlantation, enEdition("plantations"));

      remplirChoix(document.getElementById("variete-cultureId"), cultures.map((c) => ({ valeur: c.id, libelle: c.nom })));
      remplirChoix(document.getElementById("plantation-varieteId"), varietes.map((v) => ({ valeur: v.id, libelle: libelleVariete(v) })));
      remplirChoix(document.getElementById("plantation-espaceId"), espaces.map((e) => ({ valeur: e.id, libelle: e.nom })));
    }

    // Identifiant de l'élément en cours de modification dans le formulaire d'un objet, s'il y en a un.
    function enEdition(objet) {
      return formulaires[objet] && formulaires[objet].dataset.id;
    }

    return { brancher, afficher, quitterToutes, enEdition, ouvrir, annoncer };
  }

  // Outils partagés avec les autres listes (ui-ventes.js, ui-poules.js).
  globalThis.UiSaisie = { creer, outils: { afficherListe, contenuLigne, remplirChoix, annoncer } };
})();
