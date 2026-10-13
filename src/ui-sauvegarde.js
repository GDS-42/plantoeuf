// Sauvegarde : export, import, rappel d'export (EX-07, EX-08).
(function () {
  "use strict";

  const { T, remplir, element } = UiCommun;

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
    zone.textContent = contenu;
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

    async function importer(evenement) {
      const champ = evenement.target;
      const choisi = champ.files[0];
      champ.value = "";
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
      document.getElementById("importer").addEventListener("change", importer);
      // EX-08 : le rappel d'export se décide à l'ouverture.
      document.getElementById("rappel-texte").textContent = remplir(T.sauvegarde.rappel, { jours: Store.DELAI_RAPPEL_JOURS });
      document.getElementById("rappel-export").hidden = !ferme().rappelExport();
    }

    return { brancher };
  }

  globalThis.UiSauvegarde = { creer };
})();
