// Ventes (N2 ; P2, T35) : listes de la page Ventes, vue « Offre et demande » et vue « Points de vente »
// de la synthèse. Rendu seulement : les quantités viennent de calc.js (offreDemande, bilanOffreDemande,
// ventes, pointsDeVente, seancesDatees, coutSeance). Les formulaires passent par la mécanique de UiSaisie.
(function () {
  "use strict";

  const { T, formats, remplir, element, icone, elementFourchette, afficherDate, afficherMois, nomDe, parNom } = UiCommun;
  const { afficherListe, contenuLigne, remplirChoix } = UiSaisie.outils;
  const V = T.vueVentes;

  // ---- Formats : vrai signe moins, montants sans unité dans les tableaux (l'unité est dans l'en-tête).

  const moins = (texte) => texte.replace(/^-/, "−");
  const euros = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0, signDisplay: "negative" });
  const montant = (v) => moins(euros.format(v));
  const enEuros = (v) => remplir(V.euros, { valeur: montant(v) });
  const formatMontant = { format: montant };
  const ecartFin = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1, signDisplay: "exceptZero" });
  const ecartRond = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0, signDisplay: "exceptZero" });
  const jourCourt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
  const moisCourt = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" });
  const moisCourtAnnee = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit", timeZone: "UTC" });
  const date = (iso) => new Date(iso + "T00:00:00Z");

  // « 1 séance », « 9 séances », « aucune séance » : le texte selon le nombre.
  function nombreDe(textes, nombre) {
    if (nombre === 0) return textes.aucune || textes.aucun;
    return remplir(nombre === 1 ? textes.un : textes.plusieurs, { nombre: formats.nombre.format(nombre) });
  }

  // Un modèle « entre {basse} et {haute} » dont les valeurs sont des éléments.
  function gabarit(modele, valeurs) {
    return modele.split(/(\{\w+\})/).filter(Boolean).map((morceau) => {
      const cle = morceau.match(/^\{(\w+)\}$/);
      return cle ? valeurs[cle[1]] : morceau;
    });
  }

  // Une valeur affichée qui garde son nombre exact (data-valeur) : .basse, .mediane ou .haute.
  function valeur(niveau, nombre, format) {
    return element("span", { class: niveau, "data-valeur": String(nombre) }, format(nombre));
  }

  // Fourchette en euros dans une ligne de liste ; un résultat négatif est marqué.
  function fourchetteEuros(f) {
    const el = elementFourchette(f, formatMontant, "€");
    if (f.mediane < 0) el.classList.add("negatif");
    return el;
  }

  // ---- Vue « Points de vente » (EX-22 ; P2, EX-34) : cartes, puis tableau mois par mois

  const MESURES = ["resultat", "ca", "couts", "seances"];

  // Échelle commune aux barres des cartes (rendu) : de la plus basse à la plus haute borne, zéro compris.
  function echelleCommune(points) {
    let min = 0;
    let max = 0;
    for (const p of points) {
      min = Math.min(min, p.total.resultat.basse);
      max = Math.max(max, p.total.resultat.haute);
    }
    return { min, max: max > min ? max : min + 1 };
  }

  // La fourchette du résultat en barre autour de zéro : la part sous zéro en rouge, la médiane en point.
  function barreResultat(point, echelle) {
    const f = point.total.resultat;
    const pourcent = (v) => ((v - echelle.min) / (echelle.max - echelle.min)) * 100;
    const segment = (classe, de, a) => element("span", { class: classe, style: `left: ${pourcent(de)}%; width: ${pourcent(a) - pourcent(de)}%` });
    const morceaux = [];
    if (f.basse < 0) morceaux.push(segment("pv-barre-perte", f.basse, Math.min(f.haute, 0)));
    if (f.haute > 0) morceaux.push(segment("pv-barre-gain", Math.max(f.basse, 0), f.haute));
    const description = remplir(V.points.barre, { nom: point.nom, mediane: enEuros(f.mediane), basse: enEuros(f.basse), haute: enEuros(f.haute) });
    return element("div", { class: "pv-barre", role: "img", "aria-label": description },
      element("span", { class: "pv-barre-piste" }, ...morceaux,
        element("span", { class: "pv-barre-zero", style: `left: ${pourcent(0)}%` }),
        element("span", { class: "pv-barre-mediane", style: `left: ${pourcent(f.mediane)}%` })),
      element("span", { class: "pv-barre-reperes" }, element("span", { class: "pv-barre-zero-texte", style: `left: ${pourcent(0)}%` }, V.points.zero)));
  }

  function carte(point, echelle) {
    const r = point.total.resultat;
    const statut = r.mediane < 0 ? ["rouge", V.points.perteProbable] : r.basse < 0 ? ["alerte", V.points.peutPerdre] : null;
    const fait = (mesure, libelle, f) => element("div", { "data-mesure": mesure }, element("dt", {}, libelle), element("dd", {}, elementFourchette(f, formatMontant, "€")));
    return element("li", { class: r.mediane < 0 ? "pv-carte negatif" : "pv-carte", "data-point-vente": point.pointVenteId },
      element("div", { class: "pv-carte-entete" },
        element("h3", { class: "pv-nom" }, point.nom),
        element("span", { class: "puce pv-seances" }, nombreDe(V.points.seances, point.total.seances))),
      element("div", { class: "pv-resultat", "data-mesure": "resultat" },
        element("span", { class: "pv-libelle" }, V.points.resultat),
        element("span", { class: "pv-valeur-ligne" },
          element("span", { class: "pv-valeur" }, valeur("mediane", r.mediane, enEuros)),
          ...(statut ? [element("span", { class: `puce pv-statut ${statut[0]}` }, icone("alerte"), statut[1])] : [])),
        element("span", { class: "pv-bornes" }, ...gabarit(V.entre, { basse: valeur("basse", r.basse, enEuros), haute: valeur("haute", r.haute, enEuros) }))),
      barreResultat(point, echelle),
      element("dl", { class: "pv-faits" }, fait("ca", V.points.ca, point.total.ca), fait("couts", V.points.couts, point.total.couts)));
  }

  // Une case du tableau : la médiane en évidence, la basse et la haute dessous ; data-valeur garde les nombres exacts.
  function caseMontant(f, mois) {
    const nulle = f.basse === 0 && f.mediane === 0 && f.haute === 0;
    const td = element("td", { "data-mois": mois },
      valeur("mediane", f.mediane, nulle ? () => T.tableau.nul : montant),
      element("span", { class: "bornes" }, valeur("basse", f.basse, montant), ` ${V.a} `, valeur("haute", f.haute, montant)));
    if (nulle) td.classList.add("nul");
    else if (f.basse === f.haute) td.classList.add("fixe");
    if (!nulle && f.mediane < 0) td.classList.add("negatif");
    return td;
  }

  function caseSeances(nombre, mois) {
    const td = element("td", { "data-mois": mois }, valeur("mediane", nombre, (n) => (n === 0 ? T.tableau.nul : formats.nombre.format(n))));
    if (nombre === 0) td.classList.add("nul");
    return td;
  }

  function enteteMois(mois, uneAnnee) {
    return element("th", { scope: "col", "data-mois": mois, title: afficherMois(mois) }, (uneAnnee ? moisCourt : moisCourtAnnee).format(date(mois + "-01")));
  }

  // L'unité d'un produit au singulier ou au pluriel selon la quantité : « 1,5 botte », « 15 bottes ».
  function unitesDe(code) {
    if (code === Calc.OEUFS) return { un: T.poules.oeuf, plusieurs: T.poules.uniteOeufs };
    return { un: T.unitesVente[code], plusieurs: V.pluriels[code] };
  }
  const accord = (unites, v) => (Math.abs(v) >= 2 ? unites.plusieurs : unites.un);

  // ---- Vue « Offre et demande » (EX-20 ; P2, EX-34)

  function produitDeLigne(ligne) {
    const oeufs = ligne.produitId === Calc.OEUFS;
    return {
      nom: oeufs ? T.poules.oeufs : ligne.nom,
      unite: oeufs ? T.poules.uniteOeufs : T.unitesVente[ligne.unite],
      unites: unitesDe(oeufs ? Calc.OEUFS : ligne.unite),
      format: oeufs ? formats.entiers : formats.volumes,
      oeufs,
    };
  }

  // Échelle de couleur (rendu) : l'écart rapporté à la plus grande des deux médianes de la semaine,
  // en trois teintes — moins d'un tiers, moins de deux tiers, au-delà.
  function intensite(s) {
    const reference = Math.max(s.offre.mediane, s.demande.mediane);
    const part = reference > 0 ? Math.abs(s.ecart) / reference : 1;
    return part < 1 / 3 ? 1 : part < 2 / 3 ? 2 : 3;
  }

  function ecartCourt(v, oeufs) {
    return moins((oeufs || Math.abs(v) >= 10 ? ecartRond : ecartFin).format(v));
  }

  const estVide = (s) => s.offre.haute === 0 && (s.demande === null || s.demande.haute === 0);
  const aUnEcart = (s) => s.etat === "depasse" || s.etat === "manque";

  // « 33,8 kg (27 à 40) », ou un seul nombre quand la fourchette n'en a qu'un.
  function texteF(f, format, unite) {
    const mediane = `${format.format(f.mediane)} ${unite}`;
    if (f.basse === f.haute) return mediane;
    return `${mediane} (${format.format(f.basse)} ${V.a} ${format.format(f.haute)})`;
  }
  const texteFourchette = (f, produit) => texteF(f, produit.format, accord(produit.unites, f.mediane));

  function texteSemaine(lundi) {
    return remplir(V.offre.semaineLongue, {
      numero: Calc.numeroDeSemaine(lundi),
      debut: jourCourt.format(date(lundi)),
      fin: jourCourt.format(date(Calc.ajouterJours(lundi, 6))),
    });
  }

  function texteEtat(s) {
    if (estVide(s)) return V.offre.etats.vide;
    if (aUnEcart(s)) return V.offre.etats[s.sur ? `${s.etat}Sur` : s.etat];
    return V.offre.etats[s.etat];
  }

  // Bulle d'aide d'une case : les fourchettes de l'offre et de la demande, et l'état.
  function bulle(s, produit, lundi) {
    const semaine = texteSemaine(lundi);
    if (s.demande === null) return remplir(V.offre.bulleSansDebouche, { produit: produit.nom, semaine, offre: texteFourchette(s.offre, produit) });
    let etat = remplir(T.offre.etats[s.etat], { ecart: produit.format.format(Math.abs(s.ecart)), unite: accord(produit.unites, s.ecart) });
    if (s.sur) etat += ` (${T.offre.sur})`;
    return remplir(V.offre.bulle, { produit: produit.nom, semaine, offre: texteFourchette(s.offre, produit), demande: texteFourchette(s.demande, produit), etat });
  }

  // Case d'un produit : teinte selon l'état et l'écart, écart signé. Sans débouché, pas d'écart : la case
  // donne la production de la semaine en fourchette, médiane et bornes (data-valeur garde les nombres exacts).
  function caseProduit(s, lundi, produit, debutMois) {
    const classes = ["od-case", `od-${s.etat}`];
    if (estVide(s)) classes.push("od-vide");
    if (aUnEcart(s)) classes.push(`od-n${intensite(s)}`);
    if (debutMois) classes.push("od-debut-mois");
    const td = element("td", { class: classes.join(" "), "data-semaine": lundi, "data-etat": s.etat, "data-sur": String(s.sur), tabindex: "-1", title: bulle(s, produit, lundi) });
    if (aUnEcart(s)) td.append(element("span", { class: "ecart", "data-valeur": String(s.ecart) }, ecartCourt(s.ecart, produit.oeufs)));
    else if (s.etat === "equilibre" && !estVide(s)) td.append(element("span", { class: "od-egal", "aria-hidden": "true" }, V.offre.egal));
    if (s.etat === "sans_debouche" && !estVide(s)) {
      const format = (v) => produit.format.format(v);
      const bornes = s.offre.basse === s.offre.haute ? [] : [element("span", { class: "od-offre-bornes" },
        valeur("basse", s.offre.basse, format), V.offre.tiret, valeur("haute", s.offre.haute, format))];
      td.append(element("span", { class: "od-offre" }, valeur("mediane", s.offre.mediane, format), ...bornes));
    }
    return td;
  }

  // Échelle des bandes d'un produit (rendu) : de zéro à un nombre rond au-dessus de la plus haute borne de la saison.
  function echelleBandes(ligne, semaines) {
    let max = 0;
    for (const lundi of semaines) {
      const s = ligne.semaines[lundi];
      max = Math.max(max, s.offre.haute, s.demande ? s.demande.haute : 0);
    }
    if (max <= 0) return 1;
    const puissance = 10 ** Math.floor(Math.log10(max));
    return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((pas) => max <= pas * puissance * (1 + 1e-9)) * puissance;
  }

  // Rangée des fourchettes sous chaque produit (EX-20) : pour chaque semaine, la production et la demande en
  // bandes de la valeur basse à la haute, un trait à la médiane, sur l'échelle du produit. Deux bandes qui se
  // recouvrent : l'écart n'est pas sûr. Chaque borne garde sa valeur exacte (data-valeur).
  function caseBandes(s, lundi, produit, echelle, debutMois) {
    const td = element("td", { class: debutMois ? "od-bande-case od-debut-mois" : "od-bande-case", "data-semaine": lundi });
    if (estVide(s)) return td;
    const position = (v) => `${(v / echelle) * 100}%`;
    const borne = (niveau, v) => element("span", { class: `od-borne-${niveau}`, "data-valeur": String(v), style: `bottom: ${position(v)}` });
    const barre = (mesure, f) => element("span", { class: `od-barre od-barre-${mesure}`, "data-mesure": mesure },
      element("span", { class: "od-plage", style: `bottom: ${position(f.basse)}; height: ${position(f.haute - f.basse)}` }),
      borne("basse", f.basse), borne("haute", f.haute), borne("mediane", f.mediane));
    const semaine = remplir(V.offre.semaine, { numero: Calc.numeroDeSemaine(lundi) });
    const description = s.demande === null
      ? remplir(V.offre.bandes.descriptionSans, { semaine, offre: texteFourchette(s.offre, produit) })
      : remplir(V.offre.bandes.description, { semaine, offre: texteFourchette(s.offre, produit), demande: texteFourchette(s.demande, produit) });
    // Une bande nulle (rien de produit, ou aucune séance cette semaine) ne se dessine pas, comme une barre de zéro.
    const visible = (f) => f !== null && f.haute > 0;
    td.append(element("span", { class: "od-bandes", role: "img", "aria-label": description, title: description },
      ...(visible(s.offre) ? [barre("offre", s.offre)] : [element("span", { class: "od-barre" })]),
      ...(visible(s.demande) ? [barre("demande", s.demande)] : s.demande === null ? [] : [element("span", { class: "od-barre" })])));
    return td;
  }

  // En-tête de la rangée des fourchettes : ce qu'elle montre, l'unité du produit, et son échelle.
  function enteteBandes(produit, echelle) {
    return element("th", { scope: "row", class: "od-bandes-entete" },
      element("span", { class: "od-bandes-corps" },
        element("span", { class: "od-bandes-textes" },
          element("span", {}, V.offre.bandes.titre),
          element("span", { class: "od-bandes-unite" }, remplir(V.offre.bandes.unite, { unite: produit.unites.plusieurs }))),
        element("span", { class: "od-axe", "aria-hidden": "true" },
          element("span", {}, produit.format.format(echelle)), element("span", {}, "0"))));
  }

  function pastille(etat, niveau) {
    return element("span", { class: niveau ? `od-pastille od-${etat} od-n${niveau}` : `od-pastille od-${etat}`, "aria-hidden": "true" });
  }

  // Bilan de la saison d'un produit (Calc.bilanOffreDemande) : semaines en excédent, en manque.
  function caseBilan(b) {
    const ligne = (etat, texte, surs) => {
      const attributs = { class: "od-bilan-ligne", "data-etat": etat };
      if (surs) attributs.title = remplir(V.offre.bilan.sur, { nombre: surs });
      return element("span", attributs, pastille(etat, 2), texte);
    };
    const lignes = [];
    if (b.depasse) lignes.push(ligne("depasse", remplir(V.offre.bilan.depasse, { nombre: b.depasse }), b.depasseSur));
    if (b.manque) lignes.push(ligne("manque", remplir(V.offre.bilan.manque, { nombre: b.manque }), b.manqueSur));
    if (!lignes.length && b.sansDebouche) lignes.push(ligne("sans_debouche", V.offre.bilan.sansDebouche));
    else if (!lignes.length && b.equilibre) lignes.push(ligne("equilibre", V.offre.bilan.equilibre));
    else if (!lignes.length) lignes.push(element("span", { class: "od-bilan-ligne" }, V.offre.bilan.rien));
    return element("td", { class: "od-bilan", rowspan: "2" }, ...lignes);
  }

  function legendeOffre() {
    const L = V.offre.legende;
    const item = (attributs, marque, texte) => element("span", { class: "od-legende-item", ...attributs }, marque, element("span", {}, texte));
    const gamme = (etat) => element("span", { class: "od-gamme" }, pastille(etat, 1), pastille(etat, 2), pastille(etat, 3));
    return [
      item({ "data-etat": "depasse" }, gamme("depasse"), L.depasse),
      item({ "data-etat": "manque" }, gamme("manque"), L.manque),
      item({ "data-etat": "equilibre" }, pastille("equilibre"), L.equilibre),
      item({ "data-etat": "sans_debouche" }, pastille("sans_debouche"), L.sans_debouche),
      item({ "data-sur": "true" }, element("span", { class: "od-pastille od-pastille-sur", "aria-hidden": "true" }), L.sur),
      element("p", { class: "od-legende-note" }, L.intensite),
      item({ "data-bande": "offre" }, element("span", { class: "od-barre-echantillon od-barre-offre", "aria-hidden": "true" }), L.production),
      item({ "data-bande": "demande" }, element("span", { class: "od-barre-echantillon od-barre-demande", "aria-hidden": "true" }), L.demande),
      element("p", { class: "od-legende-note" }, L.bandes),
    ];
  }

  // Un chiffre du détail : la médiane en évidence, « basse à haute » à côté.
  function chiffre(f, produit) {
    const format = (v) => produit.format.format(v);
    const enfants = [valeur("mediane", f.mediane, (v) => `${format(v)} ${accord(produit.unites, v)}`)];
    enfants.push(element("span", { class: f.basse === f.haute ? "od-chiffre-bornes pour-lecteur-d-ecran" : "od-chiffre-bornes" },
      ...gabarit(`{basse} ${V.a} {haute}`, { basse: valeur("basse", f.basse, format), haute: valeur("haute", f.haute, format) })));
    return element("span", { class: "od-chiffre" }, ...enfants);
  }

  // ---- Lignes de la page Ventes (P2) : un titre, puis des faits alignés

  function resumePointVente(pointVente, bilan, debouches) {
    const L = V.lignes;
    const faits = [
      [L.distance, remplir(L.km, { valeur: formats.nombre.format(pointVente.distanceKm) })],
      [L.coutKm, elementFourchette(pointVente.coutKm, formats.nombre, L.parKm)],
      [L.seances, nombreDe(V.points.seances, bilan ? bilan.total.seances : 0)],
      [L.debouches, nombreDe(L.nbDebouches, debouches)],
    ];
    if (bilan) faits.push([L.resultat, fourchetteEuros(bilan.total.resultat)]);
    return contenuLigne({ titre: pointVente.nom, faits });
  }

  function resumeSeance(seance, pointsVente) {
    const L = V.lignes;
    const pointVente = pointsVente.get(seance.pointVenteId);
    const faits = [[L.periode, remplir(L.periodeValeur, { debut: afficherDate(seance.debut), fin: afficherDate(seance.fin) })]];
    // EX-19 : le nombre de séances datées et le coût de chacune, trajet compris.
    if (pointVente && !pointVente.supprimeLe) {
      faits.push([L.seances, nombreDe(V.points.seances, Calc.seancesDatees(seance).length)],
        [L.cout, elementFourchette(Calc.coutSeance(seance, pointVente), formats.nombre, "€")]);
    }
    faits.push([L.frais, elementFourchette(seance.frais, formats.nombre, "€")]);
    return contenuLigne({ titre: nomDe(pointVente), puces: [{ texte: remplir(L.jour, { jour: T.joursSemaine[seance.jour] }), ton: "verte" }], faits });
  }

  // Un débouché vend une culture, ou les œufs (S3) : nom du produit et unités de son prix et de son volume.
  function produitDuDebouche(debouche, cultures) {
    if (debouche.produitId === Calc.OEUFS) return { nom: T.poules.oeufs, unites: unitesDe(Calc.OEUFS), format: formats.entiers };
    const culture = cultures.get(debouche.produitId);
    return { nom: nomDe(culture), unites: unitesDe(culture ? culture.unite : "kg"), format: formats.nombre };
  }

  function resumeDebouche(debouche, pointsVente, cultures) {
    const L = V.lignes;
    const produit = produitDuDebouche(debouche, cultures);
    const titre = element("span", {}, produit.nom,
      element("span", { class: "ligne-titre-suite" }, remplir(L.a, { pointVente: nomDe(pointsVente.get(debouche.pointVenteId)) })));
    return contenuLigne({
      titre,
      faits: [
        [L.prix, elementFourchette(debouche.prix, formats.nombre, remplir(L.parUnite, { unite: produit.unites.un }))],
        [L.volume, elementFourchette(debouche.volumeParSeance, produit.format, remplir(L.parSeance, { unite: accord(produit.unites, debouche.volumeParSeance.mediane) }))],
      ],
    });
  }

  // ferme : fonction qui rend la ferme ouverte ; saisie : le module de saisie (mode modification).
  function creer({ ferme, saisie }) {
    let mesure = "resultat";
    // Vue « Offre et demande » : le dernier calcul et la case choisie ({ produitId, lundi }).
    let od = null;
    let ventes = new Map();
    let nomsPoints = new Map();
    let choix = null;

    function parId(objet) {
      return new Map(ferme().lister(objet, { avecSupprimes: true }).map((e) => [e.id, e]));
    }

    // ---- Points de vente

    function montrerMesure() {
      document.querySelectorAll("#points-mesures button").forEach((bouton) => bouton.setAttribute("aria-pressed", String(bouton.dataset.mesure === mesure)));
      document.querySelectorAll("#points tbody tr").forEach((tr) => { tr.hidden = tr.dataset.mesure !== mesure; });
      const unite = document.querySelector("#points .pv-unite");
      if (unite) unite.textContent = V.points.unite[mesure];
    }

    function afficherPointsDeVente(vue) {
      const vide = vue.points.length === 0;
      document.getElementById("points-vide").hidden = !vide;
      document.getElementById("points-legende").hidden = vide;
      document.getElementById("points-contenu").hidden = vide;
      const table = document.getElementById("points");
      table.hidden = vide;
      if (vide) return;

      // Du meilleur résultat médian au moins bon : ce qui rapporte en tête.
      const points = vue.points.slice().sort((a, b) => b.total.resultat.mediane - a.total.resultat.mediane || a.nom.localeCompare(b.nom, "fr"));
      const echelle = echelleCommune(points);
      const cartes = document.getElementById("points-cartes");
      cartes.style.setProperty("--cartes", String(points.length));
      cartes.replaceChildren(...points.map((p) => carte(p, echelle)));

      const sansSeance = vue.mois.length === 0;
      document.getElementById("points-sans-seance").hidden = !sansSeance;
      document.getElementById("points-defilement").hidden = sansSeance;
      document.getElementById("points-mesures").hidden = sansSeance;

      const uneAnnee = new Set(vue.mois.map((m) => m.slice(0, 4))).size <= 1;
      table.tHead.replaceChildren(element("tr", {},
        element("th", { scope: "col", class: "pv-coin" }, element("span", {}, V.points.pointVente), element("span", { class: "pv-unite" })),
        ...vue.mois.map((m) => enteteMois(m, uneAnnee)),
        element("th", { scope: "col", class: "pv-total" }, V.points.saison)));
      table.tBodies[0].replaceChildren(...points.flatMap((point) => MESURES.map((m) => {
        const cases = m === "seances"
          ? [...vue.mois.map((mois) => caseSeances(point.mois[mois].seances, mois)), caseSeances(point.total.seances, "total")]
          : [...vue.mois.map((mois) => caseMontant(point.mois[mois][m], mois)), caseMontant(point.total[m], "total")];
        cases[cases.length - 1].classList.add("pv-total");
        return element("tr", { "data-point-vente": point.pointVenteId, "data-mesure": m },
          element("th", { scope: "row" }, point.nom), ...cases);
      })));
      montrerMesure();
    }

    // ---- Offre et demande

    function lignesVisibles() {
      return [...document.querySelectorAll('#matrice tbody tr[data-mesure="offre"]')];
    }

    function caseChoisie() {
      if (!choix) return null;
      return document.querySelector(`#matrice tr[data-mesure="offre"][data-produit="${CSS.escape(choix.produitId)}"] td[data-semaine="${choix.lundi}"]`);
    }

    function choixParDefaut() {
      const ligne = od.lignes[0];
      const lundi = od.semaines.find((l) => !estVide(ligne.semaines[l])) || od.semaines[0];
      return { produitId: ligne.produitId, lundi };
    }

    function marquerChoix() {
      const choisie = caseChoisie();
      document.querySelectorAll("#matrice td.od-case").forEach((td) => {
        td.tabIndex = td === choisie ? 0 : -1;
        if (td === choisie) td.setAttribute("aria-current", "true");
        else td.removeAttribute("aria-current");
      });
      document.querySelectorAll("#matrice thead th[data-semaine]").forEach((th) => th.classList.toggle("od-choisie", th.dataset.semaine === choix.lundi));
      lignesVisibles().forEach((tr) => tr.classList.toggle("od-choisie", tr.dataset.produit === choix.produitId));
      // Les bandes de la semaine choisie, sous sa case, sont mises en avant.
      document.querySelectorAll("#matrice td.od-bande-case").forEach((td) => {
        td.classList.toggle("od-choisie", td.dataset.semaine === choix.lundi && td.parentElement.dataset.produit === choix.produitId);
      });
    }

    function afficherDetail() {
      const zone = document.getElementById("offre-detail");
      const ligne = od.lignes.find((l) => l.produitId === choix.produitId);
      const s = ligne.semaines[choix.lundi];
      const produit = produitDeLigne(ligne);
      const O = V.offre;
      zone.dataset.produit = choix.produitId;
      zone.dataset.semaine = choix.lundi;

      const tonEtat = { depasse: "od-puce-depasse", manque: "alerte", equilibre: "", sans_debouche: "" }[s.etat];
      const entete = element("div", { class: "od-detail-entete" },
        element("h3", {}, produit.nom),
        element("span", { class: "od-detail-semaine" }, texteSemaine(choix.lundi)),
        element("span", { class: tonEtat ? `puce ${tonEtat}` : "puce" }, texteEtat(s)));

      const blocs = [element("div", { "data-mesure": "offre" }, element("dt", {}, O.production), element("dd", {}, chiffre(s.offre, produit)))];
      let note;
      if (s.demande === null) {
        note = O.sansDebouche;
      } else {
        blocs.push(element("div", { "data-mesure": "demande" }, element("dt", {}, O.demande), element("dd", {}, chiffre(s.demande, produit))));
        const ecart = element("span", { class: "od-chiffre" }, element("span", { class: "ecart", "data-valeur": String(s.ecart) },
          `${moins(ecartFin.format(s.ecart))} ${accord(produit.unites, s.ecart)}`));
        const explication = estVide(s) ? O.vide : aUnEcart(s) ? (s.sur ? O.sur : O.incertain) : "";
        blocs.push(element("div", { "data-mesure": "ecart", class: aUnEcart(s) ? `od-detail-ecart od-${s.etat}` : "od-detail-ecart" },
          element("dt", {}, O.ecart), element("dd", {}, ecart, ...(explication ? [element("p", { class: "od-note" }, explication)] : []))));
      }

      // Les ventes de la semaine par débouché (Calc.ventes) : ce que chaque point peut prendre, ce qui s'y vend.
      const semaine = ventes.get(choix.produitId) && ventes.get(choix.produitId).get(choix.lundi);
      const servis = semaine ? semaine.debouches.filter((d) => d.demande.haute > 0) : [];
      const volume = (f) => elementFourchette(f, produit.format, accord(produit.unites, f.mediane));
      const C = O.colonnes;
      const parPoint = s.demande === null ? [] : [element("div", { class: "od-detail-debouches" },
        element("h4", {}, O.parPoint),
        servis.length
          ? element("div", { class: "od-mini-boite" }, element("table", { class: "od-mini" },
            element("thead", {}, element("tr", {}, ...[C.point, C.peutPrendre, C.vendu, C.prix].map((titre) => element("th", { scope: "col" }, titre)))),
            element("tbody", {}, ...servis.map((d) => element("tr", { "data-point-vente": d.pointVenteId },
              element("th", { scope: "row" }, nomDe(nomsPoints.get(d.pointVenteId))),
              element("td", { "data-titre": C.peutPrendre }, volume(d.demande)),
              element("td", { "data-titre": C.vendu }, volume(d.vendu)),
              element("td", { "data-titre": C.prix }, elementFourchette(d.debouche.prix, formats.nombre, `€/${produit.unites.un}`)))))))
          : element("p", { class: "od-note" }, O.aucuneSeance))];

      zone.replaceChildren(entete, element("dl", { class: "od-detail-chiffres" }, ...blocs),
        ...(note ? [element("p", { class: "od-note" }, note)] : []), ...parPoint);
    }

    function choisir(td) {
      choix = { produitId: td.parentElement.dataset.produit, lundi: td.dataset.semaine };
      marquerChoix();
      afficherDetail();
    }

    function afficherOffreDemande(resultat) {
      od = resultat;
      const vide = od.lignes.length === 0;
      document.getElementById("matrice-vide").hidden = !vide;
      document.getElementById("matrice-legende").hidden = vide;
      document.getElementById("offre-contenu").hidden = vide;
      const table = document.getElementById("matrice");
      table.hidden = vide;
      if (vide) {
        choix = null;
        return;
      }

      document.getElementById("offre-legende").replaceChildren(...legendeOffre());
      const debuts = new Set(Calc.debutsDeMois(od.semaines));
      table.tHead.replaceChildren(element("tr", {},
        element("th", { scope: "col", class: "od-coin" }, od.lignes.some((l) => l.produitId === Calc.OEUFS) ? T.offre.cultureOuOeufs : T.offre.culture),
        ...od.semaines.map((lundi) => element("th", { scope: "col", "data-semaine": lundi, class: debuts.has(lundi) ? "od-debut-mois" : "", title: texteSemaine(lundi) },
          element("span", { class: "od-date" }, jourCourt.format(date(lundi))),
          element("span", { class: "od-num" }, remplir(V.offre.semaine, { numero: Calc.numeroDeSemaine(lundi) })))),
        element("th", { scope: "col", class: "od-bilan" }, V.offre.saison)));

      const bilans = new Map(Calc.bilanOffreDemande(od).map((b) => [b.produitId, b]));
      table.tBodies[0].replaceChildren(...od.lignes.flatMap((ligne) => {
        const produit = produitDeLigne(ligne);
        const echelle = echelleBandes(ligne, od.semaines);
        return [
          element("tr", { "data-produit": ligne.produitId, "data-mesure": "offre" },
            element("th", { scope: "row" }, produit.nom),
            ...od.semaines.map((lundi) => caseProduit(ligne.semaines[lundi], lundi, produit, debuts.has(lundi))),
            caseBilan(bilans.get(ligne.produitId))),
          element("tr", { "data-produit": ligne.produitId, "data-mesure": "fourchettes", class: "od-bandes-ligne" },
            enteteBandes(produit, echelle),
            ...od.semaines.map((lundi) => caseBandes(ligne.semaines[lundi], lundi, produit, echelle, debuts.has(lundi)))),
        ];
      }));

      if (!caseChoisie()) choix = choixParDefaut();
      marquerChoix();
      afficherDetail();
    }

    // Matrice au clavier : une seule case dans l'ordre de tabulation, les flèches pour se déplacer ;
    // la case qui reçoit le focus (clic ou clavier) devient la semaine détaillée.
    function brancherMatrice() {
      const table = document.getElementById("matrice");
      table.addEventListener("focusin", (evenement) => {
        const td = evenement.target.closest("td.od-case");
        if (td) choisir(td);
      });
      // Un clic sur les bandes d'une semaine choisit la case de cette semaine, juste au-dessus.
      table.addEventListener("click", (evenement) => {
        const bandes = evenement.target.closest("td.od-bande-case");
        if (!bandes) return;
        const ligne = bandes.parentElement.previousElementSibling;
        const td = ligne && ligne.querySelector(`td.od-case[data-semaine="${bandes.dataset.semaine}"]`);
        if (td) td.focus();
      });
      table.addEventListener("keydown", (evenement) => {
        const td = evenement.target.closest("td.od-case");
        if (!td) return;
        const lignes = lignesVisibles();
        const rang = lignes.indexOf(td.parentElement);
        const cases = [...td.parentElement.querySelectorAll("td.od-case")];
        const colonne = cases.indexOf(td);
        const dansLigne = (r) => lignes[r] && lignes[r].querySelectorAll("td.od-case")[colonne];
        const cible = {
          ArrowRight: cases[colonne + 1], ArrowLeft: cases[colonne - 1],
          ArrowDown: dansLigne(rang + 1), ArrowUp: dansLigne(rang - 1),
          Home: cases[0], End: cases[cases.length - 1],
        }[evenement.key];
        if (!cible) return;
        evenement.preventDefault();
        cible.focus();
      });
    }

    // ---- Tiroirs : un bouton « Ajouter un point de vente » (ou une culture) referme d'abord le tiroir ouvert ;
    // le geste [data-ouvrir] mène ensuite à la page de l'objet et ouvre son tiroir.
    document.querySelectorAll(".tiroir-manque [data-ouvrir]").forEach((bouton) => {
      bouton.addEventListener("click", () => bouton.closest("form").querySelector(".annuler").click());
    });
    document.getElementById("points-mesures").addEventListener("click", (evenement) => {
      const bouton = evenement.target.closest("button[data-mesure]");
      if (!bouton) return;
      mesure = bouton.dataset.mesure;
      montrerMesure();
    });
    brancherMatrice();

    function afficher(donnees) {
      const pointsVente = donnees.pointsVente.slice().sort(parNom);
      const cultures = donnees.cultures.slice().sort(parNom);
      const tousPoints = parId("pointsVente");
      const toutesCultures = parId("cultures");
      const vuePoints = Calc.pointsDeVente(donnees);
      const bilans = new Map(vuePoints.points.map((p) => [p.pointVenteId, p]));

      const nombreDeDebouches = Calc.nombreDeDebouches(donnees);
      afficherListe("pointsVente", pointsVente, (p) => resumePointVente(p, bilans.get(p.id), nombreDeDebouches.get(p.id) || 0), saisie.enEdition("pointsVente"));

      const nomPoint = (s) => nomDe(tousPoints.get(s.pointVenteId));
      const seances = donnees.seances.slice().sort((a, b) => nomPoint(a).localeCompare(nomPoint(b), "fr") || a.jour - b.jour || a.debut.localeCompare(b.debut));
      afficherListe("seances", seances, (s) => resumeSeance(s, tousPoints), saisie.enEdition("seances"));

      const cleDebouche = (d) => `${produitDuDebouche(d, toutesCultures).nom}\u0000${nomDe(tousPoints.get(d.pointVenteId))}`;
      const debouches = donnees.debouches.slice().sort((a, b) => cleDebouche(a).localeCompare(cleDebouche(b), "fr"));
      afficherListe("debouches", debouches, (d) => resumeDebouche(d, tousPoints, toutesCultures), saisie.enEdition("debouches"));

      const choixPoints = pointsVente.map((p) => ({ valeur: p.id, libelle: p.nom }));
      remplirChoix(document.getElementById("seance-pointVenteId"), choixPoints);
      remplirChoix(document.getElementById("debouche-pointVenteId"), choixPoints);
      remplirChoix(document.getElementById("debouche-produitId"),
        [...cultures.map((c) => ({ valeur: c.id, libelle: c.nom })), { valeur: Calc.OEUFS, libelle: T.poules.oeufs }]);
      // Tiroirs : dire quoi faire d'abord quand il manque un point de vente ou une culture à choisir.
      document.getElementById("seance-manque-point").hidden = pointsVente.length > 0;
      document.getElementById("debouche-manque-point").hidden = pointsVente.length > 0;
      document.getElementById("debouche-manque-culture").hidden = cultures.length > 0;

      ventes = Calc.ventes(donnees);
      nomsPoints = tousPoints;
      afficherOffreDemande(Calc.offreDemande(donnees));
      afficherPointsDeVente(vuePoints);
    }

    return { afficher };
  }

  globalThis.UiVentes = { creer };
})();
