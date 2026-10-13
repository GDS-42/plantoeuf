// Page Synthèse (P2, EX-33) : chiffres clés de la saison et graphique mois par mois.
// Rendu seulement : les valeurs viennent de Calc.tableau et Calc.chiffresCles ; ici, seulement des
// échelles, des positions et des couleurs (par les jetons de index.html).
(function () {
  "use strict";

  const { T, formats, remplir, element, svg, afficherMois, enEuros } = UiCommun;
  const V = T.vueSynthese;
  // Des euros, un nombre négatif avec le vrai signe moins (« −500 € »).
  const euros = (v) => enEuros(v).replace(/^-/, "−");

  // ---- Chiffres clés

  // Échelle linéaire d'un repère : position en % d'une valeur entre min et max.
  function echelle(min, max) {
    const etendue = max - min || 1;
    return { min, max, pc: (v) => Math.min(100, Math.max(0, ((v - min) / etendue) * 100)) };
  }

  // Les trois valeurs d'une fourchette en éléments porteurs de data-valeur (contrat des tests).
  function valeurEl(niveau, f, format, attributs = {}) {
    return element("span", { class: niveau, "data-valeur": String(f[niveau]), ...attributs }, format(f[niveau]));
  }

  // Repère visuel : la piste de l'échelle, la fourchette de la basse à la haute, la médiane marquée ;
  // le zéro quand l'échelle descend sous zéro.
  function repere(f, ech, format) {
    const debut = ech.pc(f.basse);
    const fourchette = element("span", { class: "repere-fourchette" });
    fourchette.style.left = `${debut}%`;
    fourchette.style.width = `${Math.max(0, ech.pc(f.haute) - debut)}%`;
    const mediane = element("span", { class: "repere-mediane" });
    mediane.style.left = `${ech.pc(f.mediane)}%`;
    const enfants = [element("span", { class: "repere-piste" }), fourchette, mediane];
    if (ech.min < 0) {
      const zero = element("span", { class: "repere-zero" });
      zero.style.left = `${ech.pc(0)}%`;
      enfants.push(zero);
    }
    return element("div", { class: "tuile-repere", role: "img",
      "aria-label": remplir(V.repere, { basse: format(f.basse), haute: format(f.haute), mediane: format(f.mediane) }) }, ...enfants);
  }

  // Une tuile : libellé, médiane en grand, « entre X et Y » dessous et son repère, puis un détail éventuel.
  // Une valeur sans fourchette (basse = haute) le dit au lieu de « entre X et X ».
  // formatBornes : la basse et la haute, sans l'unité quand la médiane la porte déjà (« 13 447 œufs, entre 11 206 et 14 941 »).
  function tuile({ chiffre, titre, f, format, formatBornes = format, ech, detail = null, note = null }) {
    const sansFourchette = f.basse === f.haute;
    const bornes = sansFourchette
      ? element("p", { class: "tuile-bornes" }, note || V.sur,
        valeurEl("basse", f, formatBornes, { hidden: "" }), valeurEl("haute", f, formatBornes, { hidden: "" }))
      : element("p", { class: "tuile-bornes" }, ...remplirEnElements(V.entre, {
        basse: valeurEl("basse", f, formatBornes), haute: valeurEl("haute", f, formatBornes) }));
    const article = element("article", { class: "tuile", "data-chiffre": chiffre },
      element("h3", { class: "tuile-titre" }, element("span", { class: "tuile-pastille", "aria-hidden": "true" }), titre),
      element("p", { class: "tuile-valeur" }, valeurEl("mediane", f, format)),
      bornes,
      repere(f, ech, format),
      ...(detail ? [detail] : []));
    article.classList.toggle("negatif", f.mediane < 0);
    return article;
  }

  // remplir() pour des éléments : « entre {basse} et {haute} » → [texte, élément, texte, élément].
  function remplirEnElements(modele, valeurs) {
    return modele.split(/(\{\w+\})/).filter(Boolean).map((morceau) => {
      const cle = morceau.match(/^\{(\w+)\}$/);
      return cle ? valeurs[cle[1]] : morceau;
    });
  }

  // Le détail d'une tuile : une ligne par part, sa médiane et sa fourchette en plus petit.
  // lignes : [[attribut, clé, libellé, fourchette]].
  function detail(lignes) {
    const nombre = (v) => formats.euros.format(v);
    return element("dl", { class: "tuile-detail" }, ...lignes.map(([attribut, cle, libelle, f]) => element("div", { [attribut]: cle },
      element("dt", {}, libelle),
      element("dd", {}, valeurEl("mediane", f, euros), " ",
        element("span", { class: "detail-bornes" }, ...remplirEnElements(V.detail.bornes, {
          basse: valeurEl("basse", f, nombre), haute: valeurEl("haute", f, nombre) }))))));
  }

  // Chiffre d'affaires : la part des cultures et celle des œufs, s'il y a des poules.
  function detailCa(parts) {
    if (!parts.oeufs) return null;
    return detail([["data-part", "cultures", V.detail.cultures, parts.cultures], ["data-part", "oeufs", V.detail.oeufs, parts.oeufs]]);
  }

  // Coûts : séances de vente et aliment, chacun en fourchette, quand les deux existent.
  function detailCouts(couts) {
    const { seances, aliment } = couts;
    if (seances && aliment) {
      return detail([["data-cout", "seances", V.detail.seances, seances], ["data-cout", "aliment", V.detail.aliment, aliment]]);
    }
    if (seances) return element("p", { class: "tuile-note", "data-cout": "seances" }, V.detail.seulesSeances);
    if (aliment) return element("p", { class: "tuile-note", "data-cout": "aliment" }, V.detail.seulAliment);
    return null;
  }

  function nombreDe(textes, nombre) {
    return remplir(nombre === 1 ? textes.un : textes.plusieurs, { nombre: formats.nombre.format(nombre) });
  }

  function afficherTuiles(cles) {
    const conteneur = document.getElementById("tuiles");
    // Les euros partagent une échelle : la longueur des repères se compare d'une tuile à l'autre.
    const montants = [cles.ca, cles.couts.total, cles.marge];
    const ech = echelle(Math.min(0, ...montants.map((f) => f.basse)), Math.max(0, ...montants.map((f) => f.haute)));
    const tuiles = [
      tuile({ chiffre: "ca", titre: V.chiffres.ca, f: cles.ca, format: euros, ech, detail: detailCa(cles.parts) }),
      tuile({ chiffre: "couts", titre: V.chiffres.couts, f: cles.couts.total, format: euros, ech,
        detail: detailCouts(cles.couts), note: cles.couts.seances || cles.couts.aliment ? null : V.detail.aucunCout }),
      tuile({ chiffre: "marge", titre: V.chiffres.marge, f: cles.marge, format: euros, ech,
        detail: element("p", { class: "tuile-note" }, V.detail.marge) }),
    ];
    if (cles.oeufs) {
      const { volume, vendus, effectif, lots } = cles.oeufs;
      const enOeufs = (v) => remplir(V.oeufs, { valeur: formats.entiers.format(v) });
      tuiles.push(tuile({ chiffre: "oeufs", titre: vendus ? V.chiffres.oeufsVendus : V.chiffres.oeufs, f: volume, format: enOeufs, formatBornes: (v) => formats.entiers.format(v),
        ech: echelle(0, Math.max(volume.haute, 1)),
        detail: element("p", { class: "tuile-note" }, remplir(V.detail.poules, { poules: nombreDe(T.tableau.poules, effectif), lots: nombreDe(T.tableau.lots, lots) })) }));
    }
    conteneur.replaceChildren(...tuiles);
    conteneur.dataset.nombre = String(tuiles.length);
  }

  // ---- Graphique mois par mois

  let mois = [];       // [{ mois, ca, marge }] du tableau
  let actif = null;    // rang du mois montré par l'infobulle
  let largeurDessinee = 0;
  const moisCourt = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" });
  const nomMois = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" });
  const dateDe = (m) => new Date(`${m}-01T00:00:00Z`);

  // Graduations rondes (1, 2, 2,5 ou 5 × 10ⁿ) : le pas qui donne le nombre d'intervalles le plus proche
  // de la cible, sans gaspiller la hauteur du graphique.
  function graduations(min, max, cible) {
    const etendue = max - min || Math.abs(max) || 1;
    const puissance = 10 ** Math.floor(Math.log10(etendue / cible));
    let meilleur = null;
    for (const p of [0.1, 1, 10]) {
      for (const m of [1, 2, 2.5, 5]) {
        const pas = m * p * puissance;
        const bas = Math.floor(min / pas - 1e-9) * pas;
        const haut = Math.ceil(max / pas - 1e-9) * pas;
        const intervalles = Math.round((haut - bas) / pas);
        if (intervalles < 2) continue;
        const score = Math.abs(intervalles - cible) + 4 * (1 - etendue / (haut - bas));
        if (!meilleur || score < meilleur.score) meilleur = { score, pas, bas, haut, intervalles };
      }
    }
    const { pas, bas, intervalles } = meilleur;
    return Array.from({ length: intervalles + 1 }, (_, i) => Math.round((bas + i * pas) * 1e6) / 1e6);
  }

  function chemin(points) {
    return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  }

  // Barre arrondie en haut (4 px), carrée sur la ligne de base.
  function barre(x, y0, y1, largeur) {
    const h = y0 - y1;
    const r = Math.min(4, largeur / 2, Math.max(0, h));
    return `M${x},${y0}V${y1 + r}Q${x},${y1} ${x + r},${y1}H${x + largeur - r}Q${x + largeur},${y1} ${x + largeur},${y1 + r}V${y0}Z`;
  }

  function texteSvg(attributs, contenu) {
    const t = svg("text", attributs);
    t.textContent = contenu;
    return t;
  }

  function cleLegende(type) {
    const icone = type === "ca"
      ? svg("svg", { width: "18", height: "16", viewBox: "0 0 18 16", "aria-hidden": "true", class: "cle" },
        svg("rect", { class: "cle-fourchette-ca", x: "1", y: "1", width: "16", height: "11", rx: "3" }),
        svg("path", { class: "cle-barre-ca", d: barre(5, 16, 5, 8) }))
      : svg("svg", { width: "22", height: "16", viewBox: "0 0 22 16", "aria-hidden": "true", class: "cle" },
        svg("rect", { class: "cle-bande-marge", x: "0", y: "3", width: "22", height: "10", rx: "2" }),
        svg("path", { class: "cle-ligne-marge", d: "M1,10L21,6" }),
        svg("circle", { class: "cle-point-marge", cx: "11", cy: "8", r: "3.5" }));
    return element("span", { class: "cle-legende" }, icone, type === "ca" ? V.graphique.legendeCa : V.graphique.legendeMarge);
  }

  function infobulleDe(m) {
    const ligneBulle = (cle, libelle, f) => element("div", { class: "infobulle-ligne" },
      element("dt", {}, element("span", { class: `infobulle-cle ${cle}`, "aria-hidden": "true" }), libelle),
      element("dd", {}, element("strong", {}, euros(f.mediane)),
        element("span", {}, remplir(V.graphique.bornes, { basse: euros(f.basse), haute: euros(f.haute) }))));
    return [element("p", { class: "infobulle-titre" }, afficherMois(m.mois)),
      element("dl", {}, ligneBulle("cle-ca", V.graphique.ca, m.ca), ligneBulle("cle-marge", V.graphique.marge, m.marge))];
  }

  function dessiner() {
    const boite = document.getElementById("graphique");
    const largeur = Math.floor(boite.clientWidth - parseFloat(getComputedStyle(boite).paddingLeft) - parseFloat(getComputedStyle(boite).paddingRight));
    if (!mois.length || largeur < 120) return;
    largeurDessinee = boite.clientWidth;
    actif = null;

    const etroit = largeur < 560;
    const hauteur = etroit ? 236 : 300;
    const n = mois.length;
    const valeurs = mois.flatMap((m) => [m.ca.basse, m.ca.haute, m.marge.basse, m.marge.haute]);
    const graduation = graduations(Math.min(0, ...valeurs), Math.max(0, ...valeurs), etroit ? 4 : 6);
    const dmin = graduation[0];
    const dmax = graduation[graduation.length - 1];
    const etiquettes = graduation.map((v) => euros(v));
    const gauche = Math.ceil(Math.max(...etiquettes.map((e) => e.length)) * 7.2) + 14;
    const marge = { haut: 14, bas: 44, gauche, droite: 6 };
    const largeurTrace = largeur - marge.gauche - marge.droite;
    const hauteurTrace = hauteur - marge.haut - marge.bas;
    const y = (v) => marge.haut + hauteurTrace * (1 - (v - dmin) / (dmax - dmin));
    const pas = largeurTrace / n;
    const centre = (i) => marge.gauche + pas * (i + 0.5);
    const largeurBarre = Math.max(6, Math.min(28, pas * 0.36));
    const largeurHalo = largeurBarre + Math.min(12, Math.max(6, pas * 0.14));
    const y0 = y(0);

    const titreId = "graphique-svg-titre";
    const descId = "graphique-svg-desc";
    const resume = (cle) => mois.map((m) => remplir(V.graphique.moisValeur, { mois: afficherMois(m.mois), valeur: euros(m[cle].mediane) })).join(", ");
    const titre = svg("title", { id: titreId });
    titre.textContent = `${V.graphique.titre}. ${V.graphique.clavier}`;
    const desc = svg("desc", { id: descId });
    desc.textContent = remplir(V.graphique.description, { debut: afficherMois(mois[0].mois), fin: afficherMois(mois[n - 1].mois), ca: resume("ca"), marge: resume("marge") });
    const racine = svg("svg", { role: "img", tabindex: "0", width: String(largeur), height: String(hauteur), viewBox: `0 0 ${largeur} ${hauteur}`,
      "aria-labelledby": `${titreId} ${descId}`, class: "graphique-svg" }, titre, desc);

    // Grille : des lignes fines et discrètes ; le zéro, plus marqué, à part.
    const grille = svg("g", { class: "grille-graphique", "aria-hidden": "true" });
    for (const [i, v] of graduation.entries()) {
      if (v !== 0) grille.append(svg("line", { x1: String(marge.gauche), x2: String(largeur - marge.droite), y1: String(y(v)), y2: String(y(v)) }));
      grille.append(texteSvg({ class: "graduation", x: String(marge.gauche - 8), y: String(y(v) + 4), "text-anchor": "end" }, etiquettes[i]));
    }
    racine.append(grille);

    const surlignages = svg("g", { class: "surlignages", "aria-hidden": "true" },
      ...mois.map((m, i) => svg("rect", { class: "surlignage", "data-mois": m.mois, x: String(centre(i) - pas / 2 + 2), y: String(marge.haut - 6),
        width: String(Math.max(0, pas - 4)), height: String(hauteurTrace + 6), rx: "6" })));
    racine.append(surlignages);

    // Fourchette de la marge : une bande claire de la basse à la haute.
    const xs = n === 1 ? [centre(0) - largeurHalo, centre(0) + largeurHalo] : mois.map((_, i) => centre(i));
    const fourchettes = n === 1 ? [mois[0].marge, mois[0].marge] : mois.map((m) => m.marge);
    racine.append(svg("path", { class: "bande-marge", "aria-hidden": "true",
      d: `${chemin(xs.map((x, i) => [x, y(fourchettes[i].haute)]))}${chemin(xs.map((x, i) => [x, y(fourchettes[i].basse)]).reverse()).replace(/^M/, "L")}Z` }));

    // Chiffre d'affaires : la barre jusqu'à la médiane, le halo de la basse à la haute.
    const colonnes = svg("g", { class: "colonnes", "aria-hidden": "true" });
    const sautEtiquette = pas < 34 ? 2 : 1;
    for (const [i, m] of mois.entries()) {
      const c = centre(i);
      const g = svg("g", { class: "graphique-mois", "data-mois": m.mois },
        svg("rect", { class: "fourchette-ca", "data-basse": String(m.ca.basse), "data-haute": String(m.ca.haute),
          x: String(c - largeurHalo / 2), y: String(y(m.ca.haute)), width: String(largeurHalo), height: String(Math.max(0, y(m.ca.basse) - y(m.ca.haute))), rx: "4" }),
        svg("path", { class: "barre-ca", "data-valeur": String(m.ca.mediane), d: barre(c - largeurBarre / 2, y0, Math.min(y0, y(m.ca.mediane)), largeurBarre) }));
      const date = dateDe(m.mois);
      if (i % sautEtiquette === 0) g.append(texteSvg({ class: "etiquette-mois", x: String(c), y: String(hauteur - marge.bas + 20), "text-anchor": "middle" }, moisCourt.format(date)));
      if (i === 0 || date.getUTCMonth() === 0) g.append(texteSvg({ class: "etiquette-annee", x: String(c), y: String(hauteur - marge.bas + 37), "text-anchor": "middle" }, String(date.getUTCFullYear())));
      colonnes.append(g);
    }
    racine.append(colonnes);
    racine.append(svg("line", { class: "ligne-zero", "aria-hidden": "true", x1: String(marge.gauche), x2: String(largeur - marge.droite), y1: String(y0), y2: String(y0) }));

    // Marge : la ligne des médianes et ses points, cerclés du fond de la carte.
    racine.append(svg("path", { class: "ligne-marge", "aria-hidden": "true", d: chemin(mois.map((m, i) => [centre(i), y(m.marge.mediane)])) }));
    racine.append(svg("g", { class: "points", "aria-hidden": "true" }, ...mois.map((m, i) => svg("circle", { class: "point-marge", "data-mois": m.mois,
      "data-valeur": String(m.marge.mediane), cx: String(centre(i)), cy: String(y(m.marge.mediane)), r: "4.5" }))));

    // Zones de survol : toute la colonne du mois, bien plus grande que les marques.
    const zones = svg("g", { class: "zones" });
    for (const [i, m] of mois.entries()) {
      const zone = svg("rect", { class: "zone-survol", "data-mois": m.mois, x: String(centre(i) - pas / 2), y: "0", width: String(pas), height: String(hauteur) });
      zone.addEventListener("pointerenter", () => activer(i));
      zone.addEventListener("pointerdown", () => activer(i));
      zones.append(zone);
    }
    racine.append(zones);
    // Une souris qui sort efface l'infobulle ; un doigt qui se lève la laisse lisible.
    racine.addEventListener("pointerleave", (evenement) => {
      if (evenement.pointerType === "mouse" && document.activeElement !== racine) masquer();
    });
    racine.addEventListener("focus", () => activer(actif === null ? 0 : actif));
    racine.addEventListener("blur", masquer);
    racine.addEventListener("keydown", (evenement) => {
      const cibles = { ArrowRight: (actif ?? -1) + 1, ArrowLeft: (actif ?? n) - 1, Home: 0, End: n - 1 };
      if (evenement.key === "Escape") { masquer(); return; }
      if (!(evenement.key in cibles)) return;
      evenement.preventDefault();
      activer(Math.min(n - 1, Math.max(0, cibles[evenement.key])), true);
    });

    // Au téléphone, l'infobulle se lit sous le graphique au lieu de le recouvrir.
    const bulle = element("div", { class: etroit ? "infobulle sous-graphique" : "infobulle", hidden: "" });
    const zone = element("div", { class: "graphique-zone" }, racine, bulle);
    const annonce = element("p", { class: "pour-lecteur-d-ecran", "aria-live": "polite", id: "graphique-annonce" });
    const legende = element("div", { class: "legende-graphique" }, cleLegende("ca"), cleLegende("marge"),
      element("span", { class: "legende-lecture" }, V.graphique.lecture));
    boite.replaceChildren(legende, zone, annonce);

    function activer(i, clavier = false) {
      actif = i;
      const m = mois[i];
      racine.querySelectorAll(".surlignage").forEach((r, j) => r.classList.toggle("actif", j === i));
      bulle.replaceChildren(...infobulleDe(m));
      bulle.hidden = false;
      if (clavier) annonce.textContent = bulle.textContent;
      if (etroit) return;
      // À droite de la colonne, ou à gauche si la place manque.
      const largeurBulle = bulle.offsetWidth;
      const droite = centre(i) + pas / 2 + 4;
      const x = droite + largeurBulle <= largeur ? droite : Math.max(0, centre(i) - pas / 2 - 4 - largeurBulle);
      bulle.style.left = `${x}px`;
      bulle.style.top = `${marge.haut}px`;
    }

    function masquer() {
      actif = null;
      bulle.hidden = true;
      racine.querySelectorAll(".surlignage.actif").forEach((r) => r.classList.remove("actif"));
    }
  }

  function afficherGraphique(tableau) {
    mois = tableau.mois.map((m) => ({ mois: m, ca: tableau.total.mois[m].ca, marge: tableau.total.mois[m].marge }));
    // Le résumé : le meilleur mois, et les mois où la marge médiane est négative (repérés par Calc.chiffresCles).
    const { meilleurMois, moisMargeNegative } = Calc.chiffresCles(tableau);
    const resume = [];
    if (meilleurMois) {
      const ca = tableau.total.mois[meilleurMois].ca;
      resume.push(remplir(V.graphique.meilleurMois, { mois: nomMois.format(dateDe(meilleurMois)),
        mediane: euros(ca.mediane), basse: euros(ca.basse), haute: euros(ca.haute) }));
    }
    if (moisMargeNegative.length) resume.push(remplir(V.graphique.margeNegative, { mois: liste(moisMargeNegative.map((m) => nomMois.format(dateDe(m)))) }));
    document.getElementById("graphique-resume").textContent = resume.join(" ");
    largeurDessinee = 0;
    dessiner();
  }

  // « mars », « mars et avril », « mars, avril et mai » : la conjonction vient de la langue de l'outil.
  const conjonction = new Intl.ListFormat("fr-FR", { style: "long", type: "conjunction" });
  function liste(noms) {
    return conjonction.format(noms);
  }

  // Redessiner quand la carte change de largeur (fenêtre, page qui redevient visible).
  let observateur = null;
  function observer() {
    if (observateur || typeof ResizeObserver === "undefined") return;
    const boite = document.getElementById("graphique");
    observateur = new ResizeObserver(() => {
      if (boite.clientWidth !== largeurDessinee) dessiner();
    });
    observateur.observe(boite);
  }

  // ---- Vue « Par culture » vide : le geste suivant est la première étape qui manque (EX-36).

  function afficherGesteSuivant(donnees) {
    const etape = !donnees.espaces.length ? "espaces" : !donnees.cultures.length ? "cultures"
      : !donnees.varietes.length ? "varietes" : "plantations";
    const bouton = document.getElementById("tableau-vide-action");
    bouton.dataset.ouvrir = etape;
    bouton.querySelector("span").textContent = V.vide[etape];
  }

  // tableau : résultat de Calc.tableau ; donnees : enregistrements actifs de la ferme.
  function afficher(tableau, donnees) {
    const vide = tableau.lignes.length === 0 && !tableau.poules;
    const tuiles = document.getElementById("tuiles");
    const carte = document.getElementById("carte-graphique");
    afficherGesteSuivant(donnees);
    tuiles.hidden = vide;
    carte.hidden = vide || tableau.mois.length === 0;
    if (vide) {
      tuiles.replaceChildren();
      mois = [];
      return;
    }
    afficherTuiles(Calc.chiffresCles(tableau));
    if (!carte.hidden) {
      observer();
      afficherGraphique(tableau);
    }
  }

  globalThis.UiSynthese = { afficher };
})();
