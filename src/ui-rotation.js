// R4 (EX-62 à EX-65) : les aides de rotation partagées par les listes et le calendrier, et le tiroir
// « Que planter ici ? ». Rendu seulement : les règles viennent de calc.js (retoursTropTot, precedents,
// voisins, associationsDefavorables, surfaceLibre, suggestions). Rien n'est enregistré ici (no-go
// « rotation automatique », invariant suggestion_sans_plantation).
(function () {
  "use strict";

  const { T, formats, remplir, element, icone, nomDe } = UiCommun;
  const R = T.rotation;

  // sans_regle_comme_r3 : tant que la ferme n'a ni famille, ni association, ni rotation, ni culture qui a
  // un groupe, aucune aide de rotation ne s'affiche.
  function avecRegles(donnees) {
    return ["familles", "associations", "rotations"].some((objet) => (donnees[objet] || []).length > 0) ||
      (donnees.cultures || []).some((c) => c.groupe);
  }

  // « 3 ans », « 1 an » : la médiane d'un délai de retour.
  function annees(nombre) {
    return `${formats.nombre.format(nombre)} ${nombre < 2 ? T.familles.an : T.familles.ans}`;
  }

  // « Retour trop tôt des Solanacées : 60 m² ici en moins de 3 ans, pour 30 m². »
  function texteRetour(verdict, espace, modele = R.retourTropTot) {
    return remplir(modele, {
      famille: verdict.famille, surface: formats.nombre.format(verdict.surface),
      delai: annees(verdict.delai.mediane), disponible: formats.nombre.format(espace ? espace.surface : 0),
    });
  }

  // Une alerte de ligne : icône et phrase, d'une autre classe que la sur-occupation.
  function alerte(texte) {
    return element("p", { class: "alerte-rotation", role: "status" }, icone("alerte"), element("span", {}, texte));
  }

  function aujourdhui() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ferme : rend le store ouvert ; planter(champs) : ouvre le tiroir de plantation prérempli.
  function creer({ ferme, planter }) {
    const tiroir = document.getElementById("tiroir-que-planter");
    const titre = document.getElementById("tiroir-que-planter-titre");
    const champDate = document.getElementById("que-planter-date");
    const champSurface = document.getElementById("que-planter-surface");
    const libre = document.getElementById("que-planter-libre");
    const liste = document.getElementById("que-planter-liste");
    const vide = document.getElementById("que-planter-vide");
    let espaceId = null;
    let surfaceSaisie = false;
    let propositions = [];
    let dateLue = null;
    let derniereSaisie = null;

    function donnees() {
      const resultat = {};
      for (const objet of Store.OBJETS) resultat[objet] = ferme().lister(objet);
      return resultat;
    }

    function texteRaison(raison) {
      const valeurs = { ...raison };
      if (raison.delai) valeurs.delai = annees(raison.delai.mediane);
      if (raison.groupe) valeurs.groupe = T.groupes[raison.groupe] || raison.groupe;
      return remplir(R.raisons[raison.code], valeurs);
    }

    function tonRaison(code) {
      if (code === "trop_tot" || code.endsWith("_defavorable")) return "defavorable";
      return "favorable";
    }

    // Les propositions pour l'espace, la date et la surface saisies. Sans changement de la saisie (l'événement
    // « change » d'un champ qu'on quitte pour cliquer « Planter… »), la liste reste telle quelle : la
    // reconstruire ferait perdre le clic. force : les données ont changé.
    function recalculer(force = false) {
      let date = null;
      try {
        date = Store.lireDate(champDate.value);
      } catch {
        date = null;
      }
      const saisie = JSON.stringify([espaceId, date, surfaceSaisie ? champSurface.value : null]);
      if (!force && saisie === derniereSaisie) return;
      derniereSaisie = saisie;
      dateLue = date;
      const d = donnees();
      const espace = d.espaces.find((e) => e.id === espaceId);
      if (!date || !espace) {
        propositions = [];
        liste.replaceChildren();
        libre.textContent = "";
        vide.textContent = R.quePlanter.dateIllisible;
        vide.hidden = false;
        return;
      }
      const surfaceLibre = Calc.surfaceLibre(d, espaceId, date);
      if (!surfaceSaisie) champSurface.value = String(surfaceLibre);
      libre.textContent = remplir(R.quePlanter.libre, { surface: formats.nombre.format(surfaceLibre), total: formats.nombre.format(espace.surface) });
      const surface = champSurface.value === "" ? surfaceLibre : Number(champSurface.value);
      propositions = Calc.suggestions(d, { espaceId, date, surface });
      const varietes = new Map(d.varietes.map((v) => [v.id, v]));
      vide.textContent = R.quePlanter.aucune;
      vide.hidden = propositions.length > 0;
      liste.replaceChildren(...propositions.map((s, i) => element("li", { class: "qp-proposition" },
        element("div", { class: "qp-tete" },
          element("span", { class: "qp-nom" }, s.culture),
          ...(s.groupe ? [element("span", { class: "puce" }, T.groupes[s.groupe] || s.groupe)] : []),
          element("span", { class: "qp-variete" }, remplir(R.quePlanter.variete, { variete: nomDe(varietes.get(s.varieteId)) }))),
        element("ul", { class: "raisons" }, ...(s.raisons.length
          ? s.raisons.map((r) => element("li", { class: `raison ${tonRaison(r.code)}` }, texteRaison(r)))
          : [element("li", { class: "raison" }, R.raisons.aucune)])),
        element("button", { type: "button", class: "bouton", "data-planter": String(i), "aria-label": remplir(R.quePlanter.planterNom, { culture: s.culture }) },
          icone("plus"), R.quePlanter.planter))));
    }

    function ouvrir(id) {
      const espace = ferme().obtenir("espaces", id);
      if (!espace) return;
      espaceId = id;
      surfaceSaisie = false;
      titre.textContent = remplir(R.quePlanter.titre, { espace: espace.nom });
      champDate.value = Store.ecrireDate(aujourdhui());
      champSurface.value = "";
      recalculer(true);
      if (!tiroir.open) tiroir.showModal();
      champDate.focus();
    }

    function fermer() {
      if (tiroir.open) tiroir.close();
    }

    // « Que planter ici ? » : sur la ligne d'un espace ou dans le calendrier de culture.
    document.addEventListener("click", (evenement) => {
      const bouton = evenement.target.closest("[data-que-planter]");
      if (bouton) ouvrir(bouton.dataset.quePlanter);
    });
    champDate.addEventListener("input", () => recalculer());
    champDate.addEventListener("change", () => recalculer());
    champSurface.addEventListener("input", () => {
      surfaceSaisie = true;
      recalculer();
    });
    liste.addEventListener("click", (evenement) => {
      const bouton = evenement.target.closest("[data-planter]");
      if (!bouton) return;
      const s = propositions[Number(bouton.dataset.planter)];
      if (!s || !dateLue) return;
      fermer();
      planter({ varieteId: s.varieteId, espaceId, date: dateLue, surface: s.surface });
    });
    tiroir.querySelectorAll('[data-action="fermer"]').forEach((b) => b.addEventListener("click", fermer));
    tiroir.querySelector("form").addEventListener("submit", (evenement) => evenement.preventDefault());
    // Un clic sur le voile ferme le tiroir, comme les autres.
    tiroir.addEventListener("click", (evenement) => {
      if (evenement.target !== tiroir) return;
      const cadre = tiroir.getBoundingClientRect();
      const dedans = evenement.clientX >= cadre.left && evenement.clientX <= cadre.right && evenement.clientY >= cadre.top && evenement.clientY <= cadre.bottom;
      if (!dedans) fermer();
    });

    // Après un changement des données (un autre onglet), les propositions ouvertes se recalculent.
    function afficher() {
      if (tiroir.open) recalculer(true);
    }

    return { afficher, ouvrir, fermer };
  }

  globalThis.UiRotation = { creer, avecRegles, annees, texteRetour, alerte };
})();
