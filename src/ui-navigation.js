// Navigation entre les pages de l'outil (P2, EX-30) : une page visible à la fois, choisie dans la barre
// de navigation. L'adresse (#espaces, #plantations…) garde la page ouverte au rechargement.
(function () {
  "use strict";

  const PAGES = ["synthese", "espaces", "cultures", "plantations", "ventes", "poules", "sauvegarde"];
  // La page où se trouve la liste de chaque objet du modèle : « Ajouter » et « Modifier » y mènent.
  const PAGE_DE = {
    espaces: "espaces", cultures: "cultures", varietes: "cultures", plantations: "plantations",
    pointsVente: "ventes", seances: "ventes", debouches: "ventes", lots: "poules",
  };

  function creer() {
    let courante = null;

    // focus : déplacer le focus sur le titre de la page, pour le clavier et les lecteurs d'écran.
    // adresse : inscrire la page dans l'adresse (pas à l'ouverture : l'adresse reste celle du fichier).
    function aller(page, { focus = true, adresse = true } = {}) {
      if (!PAGES.includes(page)) page = "synthese";
      if (page !== courante) {
        for (const p of PAGES) document.getElementById(`page-${p}`).hidden = p !== page;
        document.querySelectorAll("#navigation [data-page]").forEach((lien) => {
          if (lien.dataset.page === page) lien.setAttribute("aria-current", "page");
          else lien.removeAttribute("aria-current");
        });
        document.getElementById("contenu").scrollTop = 0;
        if (focus && courante !== null) document.querySelector(`#page-${page} h1`).focus({ preventScroll: true });
        courante = page;
      }
      if (adresse && decodeURIComponent(location.hash.slice(1)) !== page) history.replaceState(null, "", `#${page}`);
    }

    function brancher() {
      // Les liens de la navigation changent l'adresse ; l'adresse choisit la page.
      window.addEventListener("hashchange", () => aller(decodeURIComponent(location.hash.slice(1))));
      aller(decodeURIComponent(location.hash.slice(1)), { focus: false, adresse: false });
    }

    return { brancher, aller, courante: () => courante };
  }

  globalThis.UiNavigation = { creer, PAGES, PAGE_DE };
})();
