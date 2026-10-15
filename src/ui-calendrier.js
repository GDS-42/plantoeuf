// Calendriers (P2) : le calendrier de culture de la page Plantations (EX-35) — une ligne par espace,
// une barre par plantation, de la mise en place à la fin de la récolte — et le repère des lots de la
// page Poules — une ligne par lot, de l'arrivée à la réforme.
// Rendu seulement : dates de récolte, sur-occupations et œufs viennent de calc.js. Placer les barres
// (échelle des jours, sous-lignes, étiquettes qui tiennent) est du rendu, fait ici.
(function () {
  "use strict";

  const { T, formats, remplir, element, icone, elementFourchette, afficherDate, parNom } = UiCommun;
  const F = T.vueFerme;
  const JOUR_MS = 24 * 3600 * 1000;
  const moisCourt = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" });
  const jourMois = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
  const jourMoisAnnee = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  // ---- Dates « AAAA-MM-JJ » comptées en jours (positions sur l'axe)

  function jour(iso) {
    const [a, m, j] = iso.split("-").map(Number);
    return Date.UTC(a, m - 1, j) / JOUR_MS;
  }

  function enDate(iso) {
    return new Date(iso + "T00:00:00Z");
  }

  function moisSuivant(mois) {
    const [a, m] = mois.split("-").map(Number);
    return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`;
  }

  // La date du jour, dans le fuseau de l'utilisateur.
  function aujourdhui() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // L'axe : des mois entiers, du mois de la première date à celui de la dernière.
  function axe(premiere, derniere) {
    const mois = [];
    for (let m = premiere.slice(0, 7); m <= derniere.slice(0, 7); m = moisSuivant(m)) mois.push(m);
    const debut = jour(`${mois[0]}-01`);
    const fin = jour(`${moisSuivant(mois[mois.length - 1])}-01`);
    // Position d'un jour (début du jour) en % de la largeur de l'axe.
    const position = (jourNumero) => ((jourNumero - debut) / (fin - debut)) * 100;
    return { mois, debut, fin, position };
  }

  // Sous-lignes : chaque barre prend la première sous-ligne libre à sa date (aucun recouvrement).
  function placer(barres) {
    const finsDesSousLignes = [];
    for (const barre of barres.slice().sort((a, b) => a.debut.localeCompare(b.debut) || a.fin.localeCompare(b.fin))) {
      let i = finsDesSousLignes.findIndex((fin) => fin < barre.debut);
      if (i === -1) i = finsDesSousLignes.length;
      finsDesSousLignes[i] = barre.fin;
      barre.sousLigne = i;
    }
    return Math.max(1, finsDesSousLignes.length);
  }

  const pct = (v) => `${Math.round(v * 1000) / 1000}%`;

  // R3 (EX-59) : la position de chaque frise — le jour au bord gauche de sa piste visible —, gardée d'un
  // affichage à l'autre tant que l'année choisie ne change pas. Un jour, pas des pixels : la position tient
  // quand l'axe s'allonge d'une année ou que la largeur change.
  const positions = new WeakMap();

  // ---- Une frise : en-tête des mois, une ligne par espace (ou par lot), des barres en deux périodes.
  // R3 (EX-59) : l'axe va de janvier de la première année (des barres et des années de la ferme) à
  // décembre de la dernière ; une année prend la largeur de la boîte, qui s'ouvre sur l'année choisie.
  // lignes : [{ attributs, nom, detail, alerte, barres, bandes }] ;
  // barre : { id, objet, debut, milieu (premier jour de la seconde période), fin (inclus), classes: [première, seconde],
  //           nom, second, etiquette (aria-label), infobulle: () => éléments } ;
  // bande : { debut, fin, titre } (sur-occupation).
  function frise(racine, { titreColonne, lignes, repere, annees = [], annee = null }) {
    const toutes = lignes.flatMap((l) => l.barres);
    const premiereAnnee = Math.min(Number(toutes.reduce((m, b) => (b.debut < m ? b.debut : m), toutes[0].debut).slice(0, 4)), ...annees);
    const derniereAnnee = Math.max(Number(toutes.reduce((m, b) => (b.fin > m ? b.fin : m), toutes[0].fin).slice(0, 4)), ...annees);
    const a = axe(`${premiereAnnee}-01-01`, `${derniereAnnee}-12-31`);
    const plusieursAnnees = premiereAnnee !== derniereAnnee;
    const bornes = (debut, finIncluse) => {
      const gauche = a.position(jour(debut));
      return { left: gauche, width: a.position(jour(finIncluse) + 1) - gauche };
    };

    // En-tête : le nom de chaque mois, sur sa largeur.
    const entete = element("div", { class: "cal-ligne cal-axe" },
      element("div", { class: "cal-espace cal-coin" }, titreColonne),
      element("div", { class: "cal-piste cal-piste-mois" }, ...a.mois.map((m) => {
        const gauche = a.position(jour(`${m}-01`));
        const largeur = a.position(jour(`${moisSuivant(m)}-01`)) - gauche;
        const nom = moisCourt.format(enDate(`${m}-01`));
        // L'année, sous le nom du mois, au premier mois et à chaque janvier d'un axe sur plusieurs années.
        const annee = plusieursAnnees && (m === a.mois[0] || m.endsWith("-01")) ? [element("span", { class: "cal-mois-annee" }, m.slice(0, 4))] : [];
        return element("span", { class: "cal-mois", "data-mois": m, style: `left: ${pct(gauche)}; width: ${pct(largeur)}` }, nom, ...annee);
      })));

    // Quadrillage des mois et repère du jour, sous les barres.
    // Un trait plus marqué au 1er janvier de chaque année qui suit la première.
    const traits = a.mois.slice(1).map((m) => element("span", { class: m.endsWith("-01") ? "cal-trait cal-trait-annee" : "cal-trait", style: `left: ${pct(a.position(jour(`${m}-01`)))}` }));
    if (repere && jour(repere) >= a.debut && jour(repere) < a.fin) {
      traits.push(element("span", { class: "cal-aujourdhui", style: `left: ${pct(a.position(jour(repere) + 0.5))}`, title: F.calendrier.aujourdhui }));
    }
    const quadrillage = element("div", { class: "cal-quadrillage", "aria-hidden": "true" }, ...traits);

    const corps = lignes.map((ligne) => {
      const sousLignes = placer(ligne.barres);
      const piste = element("div", { class: "cal-piste", style: `--sous-lignes: ${sousLignes}` },
        ...(ligne.bandes || []).map((bande) => {
          const b = bornes(bande.debut, bande.fin);
          return element("span", { class: "cal-sur-occupation", role: "img", "aria-label": bande.titre, title: bande.titre, style: `left: ${pct(b.left)}; width: ${pct(b.width)}` });
        }),
        ...ligne.barres.map((barre) => {
          const b = bornes(barre.debut, barre.fin);
          const avant = jour(barre.milieu) - jour(barre.debut);
          const total = jour(barre.fin) + 1 - jour(barre.debut);
          // Une étiquette par période (sauf si la barre ne l'admet que dans la seconde) ; ajuster() en montre une.
          const etiquette = (periode) => (barre.etiquetteSeconde && periode === 0 ? [] : [
            element("span", { class: "cal-etiquette", "aria-hidden": "true", hidden: "" },
              element("span", { class: "cal-etiquette-nom" }, barre.nom),
              ...(barre.second ? [element("span", { class: "cal-etiquette-second" }, ` ${barre.second}`)] : []))]);
          const segments = [];
          // Le filet de 2 px entre les deux périodes est pris sur la première : la seconde commence à sa date.
          if (avant > 0) segments.push(element("span", { class: `cal-segment ${barre.classes[0]}`, style: `flex-basis: calc(${pct((avant / total) * 100)} - 2px)` }, ...etiquette(0)));
          if (avant < total) segments.push(element("span", { class: `cal-segment ${barre.classes[1]}` }, ...etiquette(1)));
          return element("button", {
            // R4 (EX-62) : une marque (cal-retour) sur la barre d'une plantation qui revient trop tôt.
            type: "button", class: barre.marque ? `cal-barre ${barre.marque}` : "cal-barre", [`data-${barre.cle}`]: barre.id,
            "data-modifier": barre.objet, "data-id": barre.id, "data-sous-ligne": String(barre.sousLigne),
            "aria-label": barre.etiquette,
            // 1 px de marge de chaque côté : deux barres qui se suivent sur une sous-ligne restent distinctes.
            style: `left: calc(${pct(b.left)} + 1px); width: max(4px, calc(${pct(b.width)} - 2px)); --sous-ligne: ${barre.sousLigne}`,
          }, ...segments);
        }));
      return element("div", { class: "cal-ligne", "data-sous-lignes": String(sousLignes), ...ligne.attributs },
        element("div", { class: "cal-espace" },
          element("span", { class: "cal-espace-nom" }, ligne.nom),
          element("span", { class: "cal-espace-detail" }, ligne.detail),
          ...(ligne.alerte ? [element("span", { class: "puce alerte cal-alerte" }, icone("alerte"), ligne.alerte)] : []),
          ...(ligne.action ? [ligne.action] : [])),
        piste);
    });

    const grille = element("div", { class: "cal-grille", style: `--mois: ${a.mois.length}; --annees: ${derniereAnnee - premiereAnnee + 1}` }, entete, quadrillage, ...corps);
    const defilement = element("div", { class: "cal-defilement" }, grille);
    const infobulle = element("div", { id: `${racine.id}-infobulle`, class: "cal-infobulle", role: "tooltip", hidden: "" });
    const parId = new Map(toutes.map((b) => [b.id, b]));

    // Même année qu'à l'affichage précédent : la frise garde le jour qu'elle montrait ; sinon elle s'ouvre
    // sur le 1er janvier de l'année choisie. Elle se place dès que la boîte a une largeur (une page cachée
    // n'en a pas), et se replace sur le même jour quand la largeur change.
    const avant = positions.get(racine);
    if (avant) avant.lire();
    const position = { annee, jour: avant && avant.annee === annee ? avant.jour : null };
    positions.set(racine, position);
    const piste = () => grille.offsetWidth - grille.querySelector(".cal-coin").offsetWidth;
    position.lire = () => {
      if (defilement.isConnected && defilement.clientWidth > 0) position.jour = a.debut + (defilement.scrollLeft / piste()) * (a.fin - a.debut);
    };
    const placerSurLAnnee = () => {
      if (defilement.clientWidth === 0) return;
      const cible = position.jour !== null ? position.jour : annee !== null ? jour(`${annee}-01-01`) : null;
      if (cible === null) return;
      defilement.scrollLeft = (a.position(cible) / 100) * piste();
      position.attendu = defilement.scrollLeft;
    };
    // Seul un défilement de l'utilisateur change le jour gardé : l'écho d'un placement (arrondi au pixel) ne compte pas.
    defilement.addEventListener("scroll", () => {
      if (defilement.scrollLeft === position.attendu) return;
      position.attendu = null;
      position.lire();
    });

    racine.replaceChildren(defilement, infobulle);
    brancherInfobulle(racine, infobulle, parId);
    surveiller(racine, defilement, placerSurLAnnee);
    return { aujourdhuiVisible: traits.some((t) => t.classList.contains("cal-aujourdhui")) };
  }

  // ---- Étiquettes : le nom s'inscrit en entier dans la première période où il tient, sinon dans la
  // seconde ; sans la variété s'il le faut, ou la variété seule ; sinon pas du tout (l'infobulle et la
  // liste le donnent). Jamais de texte coupé.
  const FORMES = ["", "sans-second", "seul-second"];

  function ajuster(racine) {
    for (const barre of racine.querySelectorAll(".cal-barre")) {
      const etiquettes = [...barre.querySelectorAll(".cal-etiquette")];
      const tient = (e) => {
        e.hidden = false;
        if (e.offsetWidth <= e.parentElement.clientWidth) return true;
        e.hidden = true;
        return false;
      };
      for (const e of etiquettes) e.hidden = true;
      FORMES.some((forme) => {
        for (const e of etiquettes) {
          e.classList.remove(...FORMES.filter(Boolean));
          if (forme) e.classList.add(forme);
        }
        if (forme === "seul-second" && !barre.querySelector(".cal-etiquette-second")) return false;
        return etiquettes.some(tient);
      });
    }
  }

  // Les étiquettes se replacent quand la largeur change, et quand la page devient visible.
  const observateurs = new WeakMap();
  // R3 : apresMesure (placer la frise sur l'année choisie) s'exécute dès que la boîte a une largeur.
  function surveiller(racine, boite, apresMesure = () => {}) {
    if (observateurs.has(racine)) observateurs.get(racine).disconnect();
    if (typeof ResizeObserver !== "function") {
      if (boite.clientWidth > 0) apresMesure();
      return;
    }
    const observateur = new ResizeObserver(() => {
      ajuster(racine);
      apresMesure();
    });
    observateur.observe(boite);
    observateurs.set(racine, observateur);
    if (boite.clientWidth > 0) {
      ajuster(racine);
      apresMesure();
    }
  }

  // ---- Infobulle : au survol ou au focus d'une barre ; elle reste dans la fenêtre.

  const infobulles = new WeakMap();
  function brancherInfobulle(racine, infobulle, parId) {
    infobulles.set(racine, { infobulle, parId });
    if (racine.dataset.infobulle) return;
    racine.dataset.infobulle = "branchee";
    const montrer = (barre, x) => {
      const { infobulle: bulle, parId: donnees } = infobulles.get(racine);
      const d = donnees.get(barre.dataset.id);
      if (!d) return;
      bulle.replaceChildren(...d.infobulle());
      bulle.hidden = false;
      const cadre = barre.getBoundingClientRect();
      const visible = racine.querySelector(".cal-defilement").getBoundingClientRect();
      const centre = x !== undefined ? x : (Math.max(cadre.left, visible.left) + Math.min(cadre.right, visible.right)) / 2;
      const largeur = bulle.offsetWidth;
      const hauteur = bulle.offsetHeight;
      const gauche = Math.min(Math.max(8, centre - largeur / 2), window.innerWidth - largeur - 8);
      const haut = cadre.top - hauteur - 8 >= 8 ? cadre.top - hauteur - 8 : cadre.bottom + 8;
      bulle.style.left = `${Math.round(gauche)}px`;
      bulle.style.top = `${Math.round(haut)}px`;
    };
    const cacher = () => {
      infobulles.get(racine).infobulle.hidden = true;
    };
    racine.addEventListener("pointerover", (e) => {
      const barre = e.target.closest(".cal-barre");
      if (barre) montrer(barre, e.clientX);
    });
    racine.addEventListener("pointerout", (e) => {
      const barre = e.target.closest(".cal-barre");
      if (barre && !barre.contains(e.relatedTarget)) cacher();
    });
    racine.addEventListener("focusin", (e) => {
      const barre = e.target.closest(".cal-barre");
      if (barre && barre.matches(":focus-visible")) montrer(barre);
    });
    racine.addEventListener("focusout", cacher);
    racine.addEventListener("click", cacher);
    document.addEventListener("scroll", cacher, true);
  }

  // Une ligne de l'infobulle : un libellé discret et sa valeur.
  function ligneInfo(libelle, valeur) {
    return element("div", { class: "cal-info-ligne" }, element("span", { class: "cal-info-libelle" }, libelle), element("span", { class: "cal-info-valeur" }, valeur));
  }

  // ---- Légende

  function legende(liste, elements) {
    liste.replaceChildren(...elements.map(([classe, libelle]) =>
      element("li", {}, element("span", { class: `cal-pastille ${classe}`, "aria-hidden": "true" }), libelle)));
  }

  // ---- Calendrier de culture (EX-35)

  function afficherCulture(donnees, repere, choix) {
    const carte = document.getElementById("carte-calendrier");
    const racine = document.getElementById("calendrier");
    const actifs = (liste) => new Map(liste.map((e) => [e.id, e]));
    const cultures = actifs(donnees.cultures);
    const varietes = actifs(donnees.varietes);
    const espaces = donnees.espaces.slice().sort(parNom);
    const parEspace = new Map(espaces.map((e) => [e.id, []]));
    // R4 (EX-62, EX-65) : avec des règles de rotation, les retours trop tôt et « Que planter ici ? ».
    const regles = UiRotation.avecRegles(donnees);
    const retours = regles ? Calc.retoursTropTot(donnees) : {};

    // Une barre par plantation calculable (variété et culture actives), comme dans le tableau.
    for (const plantation of donnees.plantations) {
      const variete = varietes.get(plantation.varieteId);
      const culture = variete && cultures.get(variete.cultureId);
      if (!culture) continue;
      const p = Calc.parametres(culture, variete);
      const recolte = Calc.datesRecolte(plantation, p);
      const espace = espaces.find((e) => e.id === plantation.espaceId);
      const nomEspace = espace ? espace.nom : F.calendrier.espaceSupprime;
      const surface = remplir(T.resume.surface, { valeur: formats.nombre.format(plantation.surface) });
      const production = Calc.productionTotale(plantation, p);
      const retour = retours[plantation.id];
      const etiquette = remplir(F.calendrier.barre, {
        titre: `${culture.nom} ${variete.nom}`, espace: nomEspace, surface: formats.nombre.format(plantation.surface),
        date: afficherDate(plantation.date), debut: afficherDate(recolte.debut), fin: afficherDate(recolte.fin),
      });
      if (!parEspace.has(plantation.espaceId)) parEspace.set(plantation.espaceId, []);
      parEspace.get(plantation.espaceId).push({
        cle: "plantation", id: plantation.id, objet: "plantations",
        debut: plantation.date, milieu: recolte.debut, fin: recolte.fin, classes: ["cal-croissance", "cal-recolte"],
        nom: culture.nom, second: variete.nom,
        marque: retour ? "cal-retour" : "",
        etiquette: retour ? remplir(T.rotation.calendrier.barre, { etiquette, famille: retour.famille }) : etiquette,
        infobulle: () => [
          element("p", { class: "cal-info-titre" }, culture.nom, " ", element("span", { class: "cal-info-second" }, variete.nom)),
          element("p", { class: "cal-info-sous-titre" }, `${nomEspace} · ${surface}`),
          ligneInfo(F.faits.miseEnPlace, afficherDate(plantation.date)),
          ligneInfo(F.faits.recolte, remplir(F.periode, { debut: afficherDate(recolte.debut), fin: afficherDate(recolte.fin) })),
          ligneInfo(F.faits.production, elementFourchette(production, formats.volumes, F.unitesPluriel[culture.unite])),
          ...(retour ? [element("p", { class: "cal-info-alerte" }, icone("alerte"), UiRotation.texteRetour(retour, espace))] : []),
          element("p", { class: "cal-info-action" }, F.calendrier.modifier),
        ],
      });
    }

    const barres = [...parEspace.values()].flat();
    carte.hidden = barres.length === 0;
    if (barres.length === 0) {
      racine.replaceChildren();
      return;
    }

    const surOccupations = Calc.surOccupations(donnees);
    const lignes = [...parEspace.entries()].map(([id, barresEspace]) => {
      const espace = espaces.find((e) => e.id === id);
      const sur = espace && surOccupations[id];
      return {
        attributs: { "data-espace": id },
        nom: espace ? espace.nom : F.calendrier.espaceSupprime,
        detail: espace ? `${remplir(T.resume.surface, { valeur: formats.nombre.format(espace.surface) })} · ${T.typesEspace[espace.type]}` : "",
        alerte: sur ? F.calendrier.surOccupe : null,
        action: regles && espace ? element("button", {
          type: "button", class: "cal-que-planter", "data-que-planter": id,
          "aria-label": remplir(T.rotation.quePlanter.boutonEspace, { espace: espace.nom }),
        }, T.rotation.quePlanter.bouton) : null,
        barres: barresEspace,
        bandes: sur ? sur.periodes.map((periode) => ({
          debut: periode.debut, fin: periode.fin,
          titre: remplir(F.calendrier.bande, {
            debut: afficherDate(periode.debut), fin: afficherDate(periode.fin),
            surface: formats.nombre.format(periode.surface), disponible: formats.nombre.format(espace.surface),
          }),
        })) : [],
      };
    });

    const { aujourdhuiVisible } = frise(racine, { titreColonne: F.calendrier.espaces, lignes, repere, ...choix });

    // Saison : de la première mise en place à la dernière fin de récolte.
    const premiere = barres.reduce((m, b) => (b.debut < m ? b.debut : m), barres[0].debut);
    const derniere = barres.reduce((m, b) => (b.fin > m ? b.fin : m), barres[0].fin);
    const memeAnnee = premiere.slice(0, 4) === derniere.slice(0, 4);
    document.getElementById("calendrier-saison").textContent = memeAnnee
      ? remplir(F.calendrier.saison, { annee: premiere.slice(0, 4), debut: jourMois.format(enDate(premiere)), fin: jourMois.format(enDate(derniere)) })
      : remplir(F.calendrier.saisonAnnees, { debut: jourMoisAnnee.format(enDate(premiere)), fin: jourMoisAnnee.format(enDate(derniere)) });
    legende(document.getElementById("calendrier-legende"), [
      ["cal-pastille-croissance", F.calendrier.croissance],
      ["cal-pastille-recolte", F.calendrier.recolte],
      ["cal-pastille-sur-occupation", F.calendrier.surOccupation],
      ...(barres.some((b) => b.marque) ? [["cal-pastille-retour", T.rotation.calendrier.legende]] : []),
      ...(aujourdhuiVisible ? [["cal-pastille-aujourdhui", `${F.calendrier.aujourdhui}, ${jourMois.format(enDate(repere))}`]] : []),
    ]);
  }

  // ---- Repère des lots de poules (page Poules)

  function afficherLots(donnees, repere, choix) {
    const carte = document.getElementById("carte-calendrier-lots");
    const racine = document.getElementById("calendrier-lots");
    const lots = donnees.lots.slice().sort((a, b) => a.arrivee.localeCompare(b.arrivee) || a.nom.localeCompare(b.nom, "fr"));
    carte.hidden = lots.length === 0;
    if (lots.length === 0) {
      racine.replaceChildren();
      return;
    }
    const effectif = (lot) => remplir(lot.effectif === 1 ? F.effectif.un : F.effectif.plusieurs, { nombre: formats.nombre.format(lot.effectif) });
    const lignes = lots.map((lot) => ({
      attributs: { "data-lot": lot.id },
      nom: lot.nom,
      detail: effectif(lot),
      barres: [{
        cle: "lot-barre", id: lot.id, objet: "lots",
        debut: lot.arrivee, milieu: lot.debutPonte, fin: lot.reforme, classes: ["cal-arrivee", "cal-ponte"],
        // Dans la période de ponte seulement : « Ponte du 06/04/2026 au 25/10/2026 », sinon « Ponte ».
        etiquetteSeconde: true,
        nom: F.calendrierLots.ponte,
        second: remplir(F.periode, { debut: afficherDate(lot.debutPonte), fin: afficherDate(lot.reforme) }),
        etiquette: remplir(F.calendrierLots.barre, {
          nom: lot.nom, effectif: effectif(lot), arrivee: afficherDate(lot.arrivee), debut: afficherDate(lot.debutPonte), fin: afficherDate(lot.reforme),
        }),
        infobulle: () => [
          element("p", { class: "cal-info-titre" }, lot.nom),
          element("p", { class: "cal-info-sous-titre" }, effectif(lot)),
          ligneInfo(F.calendrierLots.libelleArrivee, afficherDate(lot.arrivee)),
          ligneInfo(F.calendrierLots.ponte, remplir(F.periode, { debut: afficherDate(lot.debutPonte), fin: afficherDate(lot.reforme) })),
          ligneInfo(F.calendrierLots.libelleReforme, afficherDate(lot.reforme)),
          ligneInfo(F.calendrierLots.oeufs, elementFourchette(Calc.oeufsParSemaine(lot), formats.entiers)),
          element("p", { class: "cal-info-action" }, F.calendrier.modifier),
        ],
      }],
    }));
    const { aujourdhuiVisible } = frise(racine, { titreColonne: F.calendrierLots.lots, lignes, repere, ...choix });
    legende(document.getElementById("calendrier-lots-legende"), [
      ["cal-pastille-arrivee", F.calendrierLots.arrivee],
      ["cal-pastille-ponte", F.calendrierLots.ponte],
      ...(aujourdhuiVisible ? [["cal-pastille-aujourdhui", `${F.calendrier.aujourdhui}, ${jourMois.format(enDate(repere))}`]] : []),
    ]);
  }

  // donnees : enregistrements actifs de la ferme ; choix (R3) : { annees, annee }, les années de la ferme
  // et l'année choisie.
  function afficher(donnees, choix = {}) {
    // Le focus sur une barre (après une modification) revient sur la barre redessinée.
    const actif = document.activeElement && document.activeElement.closest && document.activeElement.closest(".cal-barre");
    const focus = actif && { racine: actif.closest("[role=group]").id, id: actif.dataset.id };
    const repere = aujourdhui();
    afficherCulture(donnees, repere, choix);
    afficherLots(donnees, repere, choix);
    if (focus) {
      const barre = document.querySelector(`#${focus.racine} .cal-barre[data-id="${focus.id}"]`);
      if (barre) barre.focus({ preventScroll: true });
    }
  }

  globalThis.UiCalendrier = { afficher };
})();
