// Outils d'affichage partagés par les modules de rendu (ui-*.js) : éléments, textes, formats.
// Aucun calcul métier ici : les calculs sont dans calc.js.
(function () {
  "use strict";

  const T = Textes;
  const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
  const jour = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" });
  const euros = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0, signDisplay: "negative" });
  const volumes = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  const nomDuMois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

  function texte(chemin) {
    return chemin.split(".").reduce((objet, cle) => objet[cle], T);
  }

  function remplir(modele, valeurs) {
    return modele.replace(/\{(\w+)\}/g, (_, cle) => valeurs[cle]);
  }

  function element(balise, attributs, ...enfants) {
    const el = document.createElement(balise);
    for (const [nom, valeur] of Object.entries(attributs || {})) el.setAttribute(nom, valeur);
    el.append(...enfants);
    return el;
  }

  function afficherFourchette(f) {
    return [f.basse, f.mediane, f.haute].map((v) => nombre.format(v)).join(" / ");
  }

  // Une fourchette dans un champ de saisie : un seul nombre si les trois sont égaux.
  function saisieFourchette(f) {
    const valeurs = f.basse === f.mediane && f.mediane === f.haute ? [f.mediane] : [f.basse, f.mediane, f.haute];
    return valeurs.map((v) => String(v).replace(".", ",")).join(" / ");
  }

  function afficherDate(iso) {
    return jour.format(new Date(iso + "T00:00:00Z"));
  }

  function afficherMois(mois) {
    return nomDuMois.format(new Date(mois + "-01T00:00:00Z"));
  }

  function enEuros(valeur) {
    return remplir(T.tableau.euros, { valeur: euros.format(valeur) });
  }

  // Nom d'un enregistrement référencé, marqué s'il a été supprimé.
  function nomDe(enregistrement) {
    if (!enregistrement) return T.commun.supprime;
    return enregistrement.supprimeLe ? `${enregistrement.nom} ${T.commun.supprime}` : enregistrement.nom;
  }

  function parNom(a, b) {
    return a.nom.localeCompare(b.nom, "fr");
  }

  // Textes de la page (data-texte), libellés pour lecteur d'écran (data-texte-aria) et options fixes
  // des listes déroulantes (data-options).
  function traduire(racine) {
    racine.querySelectorAll("[data-texte]").forEach((el) => {
      el.textContent = texte(el.dataset.texte);
    });
    racine.querySelectorAll("[data-texte-aria]").forEach((el) => {
      el.setAttribute("aria-label", texte(el.dataset.texteAria));
    });
    racine.querySelectorAll("select[data-options]").forEach((select) => {
      for (const [valeur, libelle] of Object.entries(T[select.dataset.options])) {
        select.append(element("option", { value: valeur }, libelle));
      }
    });
  }

  // Onglets : un clic montre le panneau de l'onglet et cache les autres.
  function brancherOnglets(liste) {
    const onglets = [...liste.querySelectorAll('[role="tab"]')];
    for (const onglet of onglets) {
      onglet.addEventListener("click", () => {
        for (const autre of onglets) {
          const choisi = autre === onglet;
          autre.setAttribute("aria-selected", String(choisi));
          document.getElementById(autre.getAttribute("aria-controls")).hidden = !choisi;
        }
      });
    }
  }

  globalThis.UiCommun = {
    T,
    formats: { nombre, euros, volumes },
    texte,
    remplir,
    element,
    afficherFourchette,
    saisieFourchette,
    afficherDate,
    afficherMois,
    enEuros,
    nomDe,
    parNom,
    traduire,
    brancherOnglets,
  };
})();
