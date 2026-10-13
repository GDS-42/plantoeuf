// Sauvegarde : export, import, rappel d'export (EX-07, EX-08) ; page Sauvegarde (P2).
(function () {
  "use strict";

  const { T, formats, remplir, element, icone } = UiCommun;
  const S = T.vueFerme.sauvegarde;
  // Ce que la page compte de la ferme, dans cet ordre.
  const COMPTES = ["espaces", "cultures", "varietes", "plantations", "pointsVente", "lots"];

  function telecharger(nom, contenu) {
    const url = URL.createObjectURL(new Blob([contenu], { type: "application/json" }));
    const lien = element("a", { href: url, download: nom });
    document.body.append(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function messageImport(contenu, estErreur) {
    const zone = document.getElementById("import-message");
    zone.replaceChildren(icone(estErreur ? "alerte" : "valide"), element("span", {}, contenu));
    zone.classList.toggle("erreur", estErreur);
    zone.hidden = false;
  }

  function erreurImport() {
    const e = new Error("Fichier illisible");
    e.code = "import_invalide";
    return e;
  }

  // ferme : fonction qui rend la ferme ouverte ; apresImport : remet l'affichage à jour.
  function creer({ ferme, apresImport }) {
    function exporter() {
      const fichier = ferme().exporter();
      telecharger(`plantoeuf-${fichier.exporteLe.slice(0, 10)}.json`, JSON.stringify(fichier, null, 2));
      document.getElementById("rappel-export").hidden = true;
    }

    // Le fichier choisi dans le sélecteur, ou déposé sur sa zone.
    async function importer(choisi) {
      if (!choisi) return;
      try {
        let contenu;
        try {
          contenu = JSON.parse(await choisi.text());
        } catch (e) {
          throw erreurImport();
        }
        const fermeOccupee = Store.OBJETS.some((objet) => ferme().lister(objet, { avecSupprimes: true }).length > 0);
        if (fermeOccupee && !window.confirm(T.sauvegarde.confirmerImport)) return;
        ferme().importer(contenu);
      } catch (e) {
        if (!T.erreurs[e.code]) console.error(e);
        messageImport(T.erreurs[e.code] || T.erreurs.inconnue, true);
        return;
      }
      apresImport();
      messageImport(remplir(T.sauvegarde.importReussi, { plantations: ferme().lister("plantations").length }), false);
    }

    function brancher() {
      document.getElementById("exporter").addEventListener("click", exporter);
      document.getElementById("rappel-exporter").addEventListener("click", exporter);
      document.getElementById("importer").addEventListener("change", (evenement) => {
        const choisi = evenement.target.files[0];
        evenement.target.value = "";
        importer(choisi);
      });
      // Un fichier déposé sur la zone d'import s'importe comme un fichier choisi.
      const zone = document.getElementById("zone-import");
      zone.addEventListener("dragover", (evenement) => {
        evenement.preventDefault();
        zone.classList.add("survolee");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("survolee"));
      zone.addEventListener("drop", (evenement) => {
        evenement.preventDefault();
        zone.classList.remove("survolee");
        importer(evenement.dataTransfer.files[0]);
      });
      // EX-08 : le rappel d'export se décide à l'ouverture.
      document.getElementById("rappel-texte").textContent = remplir(T.sauvegarde.rappel, { jours: Store.DELAI_RAPPEL_JOURS });
      document.getElementById("rappel-export").hidden = !ferme().rappelExport();
      document.getElementById("sauvegarde-points").replaceChildren(...S.points.map((point) =>
        element("li", {}, remplir(point, { jours: Store.DELAI_RAPPEL_JOURS }))));
    }

    // Ce que contient la ferme, donc le fichier exporté : le nombre de chaque objet actif.
    function afficher(donnees) {
      const comptes = COMPTES.filter((objet) => donnees[objet].length > 0).map((objet) => {
        const n = donnees[objet].length;
        return element("li", {}, element("strong", {}, formats.entiers.format(n)), ` ${n === 1 ? S.comptes[objet].un : S.comptes[objet].plusieurs}`);
      });
      document.getElementById("sauvegarde-contenu").replaceChildren(...(comptes.length ? comptes : [element("li", { class: "sauvegarde-vide" }, S.vide)]));
    }

    return { brancher, afficher };
  }

  globalThis.UiSauvegarde = { creer };
})();
