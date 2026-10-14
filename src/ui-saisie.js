// Saisie : listes de chaque objet et formulaires ouverts dans un tiroir (EX-01 ; P2, EX-31).
(function () {
  "use strict";

  const { T, formats, texte, remplir, element, icone, elementFourchette, saisieFourchette, afficherDate, afficherMois, nomDe, parNom } = UiCommun;
  const F = T.vueFerme;

  // ---- Morceaux des lignes (P2) : chaque valeur se lit seule, sans phrase à déchiffrer.

  // formes : { un, plusieurs } ; « {nombre} » reçoit le nombre écrit à la française.
  function accorder(nombre, formes) {
    return remplir(nombre === 1 ? formes.un : formes.plusieurs, { nombre: formats.nombre.format(nombre) });
  }

  function enM2(surface) {
    return remplir(T.resume.surface, { valeur: formats.nombre.format(surface) });
  }

  function rendement(f, unite) {
    return elementFourchette(f, formats.nombre, remplir(F.parM2, { unite: F.unitesPluriel[unite] }));
  }

  function prix(f, unite) {
    return elementFourchette(f, formats.nombre, remplir(F.prixUnite, { unite: T.unitesVente[unite] }));
  }

  const estDonne = (valeur) => valeur !== null && valeur !== undefined;

  // Des morceaux de texte qui ne se coupent qu'entre eux : « après 75 jours, » | « pendant 10 semaines ».
  function morceaux(textes, separateur) {
    return element("span", {}, ...textes.flatMap((t, i) => [
      ...(i ? [separateur] : []), element("span", { class: "insecable" }, t)]));
  }

  // « après 75 jours, pendant 10 semaines » : chaque morceau seulement s'il est donné.
  function recolte(jours, semaines) {
    const textes = [];
    if (estDonne(jours)) textes.push(accorder(jours, F.apres));
    if (estDonne(semaines)) textes.push(accorder(semaines, F.pendant));
    return morceaux(textes, ", ");
  }

  function pertes(valeur) {
    return remplir(F.pourcent, { valeur: formats.nombre.format(valeur) });
  }

  // « du 20/06/2026 au 14/08/2026 », qui ne se coupe qu'avant « au ».
  function periode(debut, fin) {
    return morceaux([remplir(F.du, { date: afficherDate(debut) }), remplir(F.au, { date: afficherDate(fin) })], " ");
  }

  // ---- Lignes des listes

  // occupants : noms des cultures des plantations actives de l'espace, dans l'ordre des dates.
  // Chaque culture une fois, avec son nombre de plantations s'il y en a plusieurs.
  function resumeEspace(espace, surOccupation, occupants) {
    const parCulture = new Map();
    for (const nom of occupants) parCulture.set(nom, (parCulture.get(nom) || 0) + 1);
    const plantations = occupants.length
      ? [...parCulture].map(([culture, nombre]) => (nombre > 1 ? remplir(F.fois, { culture, nombre }) : culture)).join(", ")
      : element("span", { class: "ligne-vide" }, F.aucunePlantation);
    const alertes = [];
    if (surOccupation) {
      const mois = surOccupation.mois.map((m) => remplir(T.espaces.moisSurOccupe, {
        mois: afficherMois(m.mois), surface: formats.nombre.format(m.surface),
      })).join(", ");
      alertes.push(element("p", { class: "sur-occupation", role: "status" }, icone("alerte"),
        element("span", {}, remplir(T.espaces.surOccupation, { mois, surface: formats.nombre.format(espace.surface) }))));
    }
    return contenuLigne({
      titre: espace.nom,
      puces: [{ texte: T.typesEspace[espace.type], ton: espace.type === "abri" ? "bleue" : "verte" }],
      faits: [[F.faits.surface, enM2(espace.surface), "surface"], [F.faits.plantations, plantations, "plantations"]],
      alertes,
    });
  }

  function resumeCulture(culture) {
    return contenuLigne({
      titre: culture.nom,
      puces: culture.famille ? [{ texte: culture.famille }] : [],
      sousTitre: F.vendue[culture.unite],
      faits: [
        [F.faits.rendement, rendement(culture.rendement, culture.unite), "rendement"],
        [F.faits.prix, prix(culture.prix, culture.unite), "prix"],
        [F.faits.recolte, recolte(culture.joursAvantRecolte, culture.semainesRecolte), "recolte"],
        [F.faits.pertes, pertes(culture.pertes), "pertes"],
      ],
    });
  }

  // Une variété ne montre que ce qui diffère de sa culture, chaque fait dans la colonne de la culture.
  function resumeVariete(variete, cultures) {
    const culture = cultures.get(variete.cultureId);
    const unite = culture ? culture.unite : "kg";
    const faits = [];
    if (estDonne(variete.rendement)) faits.push([F.faits.rendement, rendement(variete.rendement, unite), "rendement"]);
    if (estDonne(variete.prix)) faits.push([F.faits.prix, prix(variete.prix, unite), "prix"]);
    if (estDonne(variete.joursAvantRecolte) || estDonne(variete.semainesRecolte)) {
      faits.push([F.faits.recolte, recolte(variete.joursAvantRecolte, variete.semainesRecolte), "recolte"]);
    }
    if (estDonne(variete.pertes)) faits.push([F.faits.pertes, pertes(variete.pertes), "pertes"]);
    return contenuLigne({
      titre: variete.nom,
      puces: [{ texte: nomDe(culture) }],
      faits,
      note: faits.length ? null : T.varietes.memesValeurs,
    });
  }

  // Le nom d'une plantation, sa culture puis sa variété : en texte, pour trier.
  function nomPlantation(plantation, varietes, cultures) {
    const variete = varietes.get(plantation.varieteId);
    return variete ? `${nomDe(cultures.get(variete.cultureId))} ${nomDe(variete)}` : nomDe(variete);
  }

  function resumePlantation(plantation, varietes, cultures, espaces) {
    const variete = varietes.get(plantation.varieteId);
    const culture = variete && cultures.get(variete.cultureId);
    const titre = variete
      ? element("span", {}, nomDe(culture), " ", element("span", { class: "ligne-titre-second" }, nomDe(variete)))
      : nomDe(variete);
    const faits = [
      [F.faits.surface, enM2(plantation.surface), "surface"],
      [F.faits.miseEnPlace, afficherDate(plantation.date), "miseEnPlace"],
    ];
    if (culture) {
      const p = Calc.parametres(culture, variete);
      const dates = Calc.datesRecolte(plantation, p);
      faits.push([F.faits.recolte, periode(dates.debut, dates.fin), "recolte"]);
      faits.push([F.faits.production, elementFourchette(Calc.productionTotale(plantation, p), formats.volumes, F.unitesPluriel[culture.unite]), "production"]);
    }
    return contenuLigne({ titre, puces: [{ texte: nomDe(espaces.get(plantation.espaceId)) }], faits });
  }

  // P2 : contenu d'une ligne de liste — un titre et ses puces, un sous-titre facultatif, puis des faits
  // « libellé : valeur » alignés (ou une note quand il n'y en a pas), puis d'éventuelles alertes.
  // titre : texte ou élément ; faits : [[libellé, valeur (texte ou élément), clé facultative], …], la clé
  // devenant data-fait (pour aligner un fait sur sa colonne) ; puces : [{ texte, ton }] avec ton « verte »,
  // « bleue », « oeuf » ou « alerte » ; alertes : éléments.
  function contenuLigne({ titre, puces = [], sousTitre = null, faits = [], note = null, alertes = [] }) {
    const entete = element("div", { class: "ligne-entete" }, element("span", { class: "ligne-titre" }, titre),
      ...puces.map(({ texte: t, ton }) => element("span", { class: ton ? `puce ${ton}` : "puce" }, t)));
    return element("div", { class: "ligne-texte" },
      // Avec un sous-titre, l'en-tête et le sous-titre forment ensemble la tête de la ligne.
      sousTitre ? element("div", { class: "ligne-tete" }, entete, element("p", { class: "ligne-sous-titre" }, sousTitre)) : entete,
      ...(faits.length ? [element("dl", { class: "ligne-faits" }, ...faits.map(([libelle, valeur, cle]) =>
        element("div", cle ? { "data-fait": cle } : {}, element("dt", {}, libelle), element("dd", {}, valeur))))] : []),
      ...(note ? [element("p", { class: "ligne-note" }, note)] : []),
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
    const vide = document.getElementById(`${objet}-vide`);
    vide.hidden = enregistrements.length > 0;
    // EX-36 : l'état vide propose le geste suivant, le même bouton « Ajouter » que l'en-tête de la liste.
    if (!vide.querySelector("[data-ouvrir]")) {
      vide.append(element("button", { type: "button", class: "bouton principal", "data-ouvrir": objet },
        icone("plus"), T.tiroirs[objet].ajouter));
    }
    const liste = document.getElementById(`liste-${objet}`);
    liste.hidden = enregistrements.length === 0;
    // Le bouton qui avait le focus (celui d'une ligne qu'on vient de modifier) le retrouve après le rendu.
    const actif = liste.contains(document.activeElement) && document.activeElement.closest("li[data-id] [data-action]");
    const focus = actif && { id: actif.closest("li").dataset.id, action: actif.dataset.action };
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
    if (focus) {
      const li = [...liste.children].find((l) => l.dataset.id === focus.id);
      if (li) li.querySelector(`[data-action="${focus.action}"]`).focus({ preventScroll: true });
    }
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
      else if (entree.dataset.format === "date") champs[champ] = Store.lireDate(entree.value);
      else champs[champ] = entree.value.trim();
    }
    return champs;
  }

  function ecrireFormulaire(formulaire, enregistrement) {
    for (const entree of formulaire.querySelectorAll("[data-champ]")) {
      const valeur = enregistrement[entree.dataset.champ];
      if (valeur === null || valeur === undefined) entree.value = "";
      else if (entree.dataset.format === "fourchette") entree.value = saisieFourchette(valeur);
      else if (entree.dataset.format === "date") entree.value = Store.ecrireDate(valeur);
      else entree.value = String(valeur);
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
    // La ligne de la liste, et la barre de l'enregistrement dans un calendrier (EX-35).
    const signales = [...panneau.querySelectorAll("ul.liste li"), ...document.querySelectorAll(`[data-modifier="${formulaire.dataset.objet}"][data-id]`)];
    signales.forEach((el) => {
      if (el.dataset.id === id) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
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
    // Le formulaire est rempli (vide ou avec l'enregistrement) : ce qui en dépend se met à jour.
    formulaire.dispatchEvent(new Event("ouverture"));
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

    // Dans le tiroir des plantations : la récolte que donneront la variété, la date et la surface
    // choisies, avant même d'enregistrer (dates et volumes calculés par calc.js).
    function apercuPlantation(formulaire) {
      const zone = document.getElementById("plantation-apercu");
      let champs;
      try {
        champs = lireFormulaire(formulaire);
      } catch {
        champs = {}; // date en cours de saisie : pas d'aperçu tant qu'elle n'est pas lisible
      }
      const variete = champs.varieteId && ferme().obtenir("varietes", champs.varieteId);
      const culture = variete && ferme().obtenir("cultures", variete.cultureId);
      zone.hidden = !culture || !/^\d{4}-\d{2}-\d{2}$/.test(champs.date);
      if (zone.hidden) return;
      const p = Calc.parametres(culture, variete);
      const dates = Calc.datesRecolte({ date: champs.date }, p);
      const faits = [[F.apercu.recolte, periode(dates.debut, dates.fin)]];
      if (champs.surface > 0) {
        const production = Calc.productionTotale({ date: champs.date, surface: champs.surface }, p);
        faits.push([F.faits.production, elementFourchette(production, formats.volumes, F.unitesPluriel[culture.unite])]);
      }
      zone.replaceChildren(icone("plantations"), element("dl", {}, ...faits.map(([libelle, valeur]) =>
        element("div", {}, element("dt", {}, libelle), element("dd", {}, valeur)))));
    }

    function brancherFormulaire(formulaire) {
      const objet = formulaire.dataset.objet;
      formulaires[objet] = formulaire;
      if (objet === "plantations") {
        for (const type of ["input", "change", "ouverture"]) formulaire.addEventListener(type, () => apercuPlantation(formulaire));
      }

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
      // Le focus clavier reste dans le tiroir ouvert : Tab après le dernier élément revient au premier,
      // Maj+Tab avant le premier va au dernier.
      tiroir.addEventListener("keydown", (evenement) => {
        if (evenement.key !== "Tab") return;
        const atteignables = [...tiroir.querySelectorAll("button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])")]
          .filter((el) => !el.disabled && el.checkVisibility());
        if (!atteignables.length) return;
        const premier = atteignables[0];
        const dernier = atteignables[atteignables.length - 1];
        if (evenement.shiftKey && document.activeElement === premier) {
          evenement.preventDefault();
          dernier.focus();
        } else if (!evenement.shiftKey && document.activeElement === dernier) {
          evenement.preventDefault();
          premier.focus();
        }
      });
      tiroir.addEventListener("click", (evenement) => {
        // Un lien « Ajouter un espace… » du tiroir (EX-36) referme d'abord ce tiroir ; la page et le
        // tiroir de l'autre objet s'ouvrent ensuite (gestionnaire [data-ouvrir] du document).
        if (evenement.target.closest("[data-ouvrir]")) {
          fermer(formulaire);
          return;
        }
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

    // R1 (EX-39, EX-40) : un champ de date se saisit en texte, jour/mois/année, quel que soit le
    // navigateur. Quitter le champ réécrit une date lisible jj/mm/aaaa ; le bouton voisin ouvre le
    // calendrier du navigateur (un champ date invisible), dont le choix revient jj/mm/aaaa.
    function brancherDate(entree) {
      entree.placeholder = T.dates.modele;
      const lire = () => {
        try {
          return Store.lireDate(entree.value);
        } catch {
          return null;
        }
      };
      entree.addEventListener("blur", () => {
        const iso = lire();
        if (iso) entree.value = Store.ecrireDate(iso);
      });

      const enveloppe = element("span", { class: "champ-date" });
      entree.replaceWith(enveloppe);
      const selecteur = element("input", { type: "date", class: "selecteur-date", tabindex: "-1", "aria-hidden": "true", "data-calendrier-de": entree.id });
      const bouton = element("button", { type: "button", class: "bouton-icone bouton-calendrier", "data-calendrier": entree.id, title: T.dates.calendrier, "aria-label": T.dates.calendrier },
        icone("plantations"));
      enveloppe.append(entree, bouton, selecteur);
      if (typeof selecteur.showPicker !== "function") bouton.hidden = true;
      bouton.addEventListener("click", () => {
        selecteur.value = lire() || "";
        try {
          selecteur.showPicker();
        } catch {
          entree.focus(); // calendrier indisponible : on saisit au clavier
        }
      });
      selecteur.addEventListener("change", () => {
        if (!selecteur.value) return;
        entree.value = Store.ecrireDate(selecteur.value);
        entree.dispatchEvent(new Event("input", { bubbles: true }));
        entree.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    function brancher(racine) {
      racine.querySelectorAll('input[data-format="date"]').forEach(brancherDate);
      racine.querySelectorAll("form[data-objet]").forEach(brancherFormulaire);
      // Hors des listes, un élément [data-modifier="<objet>"][data-id] ouvre la modification de cet
      // enregistrement : les barres des calendriers de culture et des lots (EX-35).
      racine.addEventListener("click", (evenement) => {
        const cible = evenement.target.closest("[data-modifier][data-id]");
        if (!cible || !formulaires[cible.dataset.modifier]) return;
        const enregistrement = ferme().obtenir(cible.dataset.modifier, cible.dataset.id);
        if (enregistrement) entrerEdition(formulaires[cible.dataset.modifier], enregistrement);
      });
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
      const nom = (p) => nomPlantation(p, toutesVarietes, toutesCultures);
      const nomEspace = (p) => nomDe(tousEspaces.get(p.espaceId));
      varietes.sort((a, b) => libelleVariete(a).localeCompare(libelleVariete(b), "fr"));
      plantations.sort((a, b) => a.date.localeCompare(b.date) || nom(a).localeCompare(nom(b), "fr") || nomEspace(a).localeCompare(nomEspace(b), "fr"));

      // Ce qui pousse sur chaque espace : le nom de la culture de ses plantations, par date.
      const occupants = new Map(espaces.map((e) => [e.id, []]));
      for (const p of plantations) {
        const variete = toutesVarietes.get(p.varieteId);
        if (occupants.has(p.espaceId)) occupants.get(p.espaceId).push(variete ? nomDe(toutesCultures.get(variete.cultureId)) : nomDe(variete));
      }

      const surOccupations = Calc.surOccupations(donnees);
      afficherListe("espaces", espaces, (e) => resumeEspace(e, surOccupations[e.id], occupants.get(e.id)), enEdition("espaces"));
      afficherListe("cultures", cultures, resumeCulture, enEdition("cultures"));
      afficherListe("varietes", varietes, (v) => resumeVariete(v, toutesCultures), enEdition("varietes"));
      afficherListe("plantations", plantations, (p) => resumePlantation(p, toutesVarietes, toutesCultures, tousEspaces), enEdition("plantations"));

      remplirChoix(document.getElementById("variete-cultureId"), cultures.map((c) => ({ valeur: c.id, libelle: c.nom })));
      remplirChoix(document.getElementById("plantation-varieteId"), varietes.map((v) => ({ valeur: v.id, libelle: libelleVariete(v) })));
      remplirChoix(document.getElementById("plantation-espaceId"), espaces.map((e) => ({ valeur: e.id, libelle: e.nom })));
      afficherPrealable(espaces.length > 0, cultures.length > 0, varietes.length > 0);
      document.getElementById("espaces-voir-calendrier").hidden = plantations.length === 0;
    }

    // EX-36 : tant qu'il manque un espace ou une variété, le tiroir des plantations dit quoi faire d'abord,
    // avec un lien vers la page concernée, qui ouvre aussi son tiroir d'ajout.
    function afficherPrealable(avecEspace, avecCulture, avecVariete) {
      const zone = document.getElementById("plantation-prealable");
      const manques = [];
      const lien = (page, objet, libelle) => element("a", { href: `#${page}`, class: "prealable-lien", "data-ouvrir": objet }, libelle, icone("fleche"));
      if (!avecEspace) manques.push([F.prealable.espace, lien("espaces", "espaces", F.prealable.lienEspace)]);
      if (!avecCulture) manques.push([F.prealable.culture, lien("cultures", "cultures", F.prealable.lienCulture)]);
      else if (!avecVariete) manques.push([F.prealable.variete, lien("cultures", "varietes", F.prealable.lienVariete)]);
      zone.hidden = manques.length === 0;
      zone.replaceChildren(icone("info"), element("div", {},
        element("p", {}, F.prealable.texte),
        element("ul", {}, ...manques.map(([quoi, a]) => element("li", {}, element("span", {}, quoi), a)))));
    }

    // Identifiant de l'élément en cours de modification dans le formulaire d'un objet, s'il y en a un.
    function enEdition(objet) {
      return formulaires[objet] && formulaires[objet].dataset.id;
    }

    return { brancher, afficher, quitterToutes, enEdition, ouvrir, annoncer };
  }

  // Outils partagés avec les autres listes (ui-ventes.js, ui-poules.js).
  // morceaux et periode : des textes qui ne se coupent qu'entre leurs morceaux (lignes des lots).
  globalThis.UiSaisie = { creer, outils: { afficherListe, contenuLigne, remplirChoix, annoncer, morceaux, periode } };
})();
