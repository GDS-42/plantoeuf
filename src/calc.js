// Logique de calcul pure (dates, répartition hebdomadaire, tableau économique).
// Invariant calcul_sans_dom : ce module s'exécute sous Node, sans navigateur.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Calc = fabrique();
})(globalThis, function () {
  "use strict";

  // Champs numériques de la culture qu'une variété peut surcharger (SPEC, objet Variété).
  const CHAMPS_SURCHARGEABLES = ["rendement", "prix", "joursAvantRecolte", "semainesRecolte", "pertes"];
  // Identifiant réservé du produit « œufs » dans un débouché (SPEC S3) : les œufs de tous les lots.
  const OEUFS = "oeufs";
  const JOUR_MS = 24 * 3600 * 1000;
  const NIVEAUX = ["basse", "mediane", "haute"];

  // ---- Dates : chaînes « AAAA-MM-JJ », comptées en jours UTC pour ignorer fuseaux et heures d'été.

  function versJour(date) {
    const [annee, mois, jour] = date.split("-").map(Number);
    return Date.UTC(annee, mois - 1, jour) / JOUR_MS;
  }

  function depuisJour(numero) {
    return new Date(numero * JOUR_MS).toISOString().slice(0, 10);
  }

  function ajouterJours(date, jours) {
    return depuisJour(versJour(date) + jours);
  }

  // 1 = lundi … 7 = dimanche.
  function jourDeLaSemaine(date) {
    return ((new Date(versJour(date) * JOUR_MS).getUTCDay() + 6) % 7) + 1;
  }

  // Le lundi de la semaine (du lundi au dimanche) qui contient la date.
  function lundiDe(date) {
    return ajouterJours(date, 1 - jourDeLaSemaine(date));
  }

  // ---- Fourchettes : { basse, mediane, haute }

  function fourchetteNulle() {
    return { basse: 0, mediane: 0, haute: 0 };
  }

  function somme(a, b) {
    return { basse: a.basse + b.basse, mediane: a.mediane + b.mediane, haute: a.haute + b.haute };
  }

  // Soustraction de fourchettes : la basse retire la haute, la haute retire la basse (le résultat reste ordonné).
  function soustraire(a, b) {
    return { basse: a.basse - b.haute, mediane: a.mediane - b.mediane, haute: a.haute - b.basse };
  }

  // f × numerateur / denominateur, niveau par niveau.
  function proportion(f, numerateur, denominateur) {
    return {
      basse: (f.basse * numerateur) / denominateur,
      mediane: (f.mediane * numerateur) / denominateur,
      haute: (f.haute * numerateur) / denominateur,
    };
  }

  // ---- Plantations

  // Valeurs qui s'appliquent à une variété : sa surcharge si elle existe, celle de la culture sinon.
  function parametres(culture, variete) {
    const p = {};
    for (const champ of CHAMPS_SURCHARGEABLES) {
      const surcharge = variete ? variete[champ] : null;
      p[champ] = surcharge === null || surcharge === undefined ? culture[champ] : surcharge;
    }
    return p;
  }

  function nombreDeSemaines(p) {
    return Math.max(0, Math.round(p.semainesRecolte));
  }

  // EX-02 : première récolte = semis ou plantation + jours avant récolte ;
  // fin de récolte = dernier jour de la dernière semaine de la fenêtre.
  function datesRecolte(plantation, p) {
    const debut = ajouterJours(plantation.date, p.joursAvantRecolte);
    return { debut, fin: ajouterJours(debut, 7 * nombreDeSemaines(p) - 1) };
  }

  // EX-03 : surface × rendement × (1 − pertes), en fourchette.
  function productionTotale(plantation, p) {
    return proportion(p.rendement, plantation.surface * (100 - p.pertes), 100);
  }

  // EX-03 : les semaines de la fenêtre de récolte, comptées depuis la première récolte,
  // reçoivent chacune une part égale de la production.
  function productionHebdomadaire(plantation, p) {
    const semaines = nombreDeSemaines(p);
    const { debut } = datesRecolte(plantation, p);
    const total = productionTotale(plantation, p);
    const resultat = [];
    for (let i = 0; i < semaines; i++) {
      const debutSemaine = ajouterJours(debut, 7 * i);
      resultat.push({ debut: debutSemaine, fin: ajouterJours(debutSemaine, 6), volume: proportion(total, 1, semaines) });
    }
    return resultat;
  }

  // Production entre deux dates incluses. La répartition se fait à la semaine (SPEC, points tranchés) :
  // une semaine de récolte compte entière dans la période qui contient son jour du milieu,
  // c'est-à-dire la plupart de ses jours. Hors de la fenêtre, rien (production_nulle_hors_fenetre).
  function productionSurPeriode(plantation, p, debut, fin) {
    const premier = versJour(debut);
    const dernier = versJour(fin);
    let total = fourchetteNulle();
    for (const semaine of productionHebdomadaire(plantation, p)) {
      const milieu = versJour(semaine.debut) + 3;
      if (milieu >= premier && milieu <= dernier) total = somme(total, semaine.volume);
    }
    return total;
  }

  // Plantations actives dont la variété et la culture sont actives, avec leurs paramètres.
  function plantationsCalculables({ cultures = [], varietes = [], plantations = [] }) {
    const actifs = (liste) => liste.filter((e) => !e.supprimeLe);
    const culturesParId = new Map(actifs(cultures).map((c) => [c.id, c]));
    const varietesParId = new Map(actifs(varietes).map((v) => [v.id, v]));
    const resultat = [];
    for (const plantation of actifs(plantations)) {
      const variete = varietesParId.get(plantation.varieteId);
      const culture = variete && culturesParId.get(variete.cultureId);
      if (culture) resultat.push({ plantation, culture, p: parametres(culture, variete) });
    }
    return resultat;
  }

  // ---- Tableau économique (EX-04)

  function produit(a, b) {
    return { basse: a.basse * b.basse, mediane: a.mediane * b.mediane, haute: a.haute * b.haute };
  }

  // Mois « AAAA-MM » de la semaine : celui de son jour du milieu, comme pour productionSurPeriode.
  function moisDeLaSemaine(semaine) {
    return ajouterJours(semaine.debut, 3).slice(0, 7);
  }

  function moisSuivant(mois) {
    const [annee, numero] = mois.split("-").map(Number);
    return numero === 12 ? `${annee + 1}-01` : `${annee}-${String(numero + 1).padStart(2, "0")}`;
  }

  function moisEntre(premier, dernier) {
    const liste = [];
    for (let mois = premier; mois <= dernier; mois = moisSuivant(mois)) liste.push(mois);
    return liste;
  }

  function caseVide() {
    return { volume: fourchetteNulle(), ca: fourchetteNulle() };
  }

  function ajouterA(cumul, volume, ca) {
    cumul.volume = somme(cumul.volume, volume);
    cumul.ca = somme(cumul.ca, ca);
  }

  // Volume, chiffre d'affaires et marge par culture et par mois, en fourchette (EX-04).
  // Une culture sans débouché se vend comme en N1 : toute sa production, au prix de sa variété, chaque
  // semaine de récolte dans le mois de son jour du milieu. Une culture avec débouché compte ce qui se vend
  // (Calc.ventes), chaque semaine dans le mois de son jeudi. Le coût des séances se déduit de la marge de
  // la ferme (EX-23) ; la marge d'une culture reste égale à son chiffre d'affaires.
  // S3 (EX-27) : l'atelier poules, à part des cultures (`poules`, null sans lot actif) — œufs, chiffre
  // d'affaires, aliment et marge de l'atelier par mois, chaque semaine dans le mois de son jeudi ; la marge
  // de la ferme déduit aussi l'aliment.
  function tableau(donnees) {
    const ventesParCulture = ventes(donnees);
    const parCulture = new Map();
    const entree = (culture, aDebouche) => {
      if (!parCulture.has(culture.id)) parCulture.set(culture.id, { culture, aDebouche, mois: new Map() });
      return parCulture.get(culture.id).mois;
    };
    const ajouterAuMois = (parMois, mois, volume, ca) => {
      if (!parMois.has(mois)) parMois.set(mois, caseVide());
      ajouterA(parMois.get(mois), volume, ca);
    };

    for (const { plantation, culture, p } of plantationsCalculables(donnees)) {
      const aDebouche = ventesParCulture.has(culture.id);
      const parMois = entree(culture, aDebouche);
      if (aDebouche) continue;
      for (const semaine of productionHebdomadaire(plantation, p)) {
        ajouterAuMois(parMois, moisDeLaSemaine(semaine), semaine.volume, produit(semaine.volume, p.prix));
      }
    }
    for (const [produitId, parSemaine] of ventesParCulture) {
      if (!parCulture.has(produitId)) continue;
      const parMois = parCulture.get(produitId).mois;
      for (const [lundi, vente] of parSemaine) {
        if (vente.vendu.haute > 0) ajouterAuMois(parMois, moisDuJeudi(lundi), vente.vendu, vente.ca);
      }
    }
    const couts = new Map();
    for (const seance of seancesDeLaFerme(donnees)) {
      const mois = moisDuJeudi(lundiDe(seance.date));
      couts.set(mois, somme(couts.get(mois) || fourchetteNulle(), seance.cout));
    }

    // Les œufs avec débouché comptent ce qui se vend (EX-28), sans débouché toute la ponte au prix de l'œuf de son lot.
    const lots = (donnees.lots || []).filter((l) => !l.supprimeLe);
    const ventesOeufs = ventesParCulture.get(OEUFS);
    const poulesParMois = new Map();
    const ajouterAuxPoules = (lundi, volume, ca, aliment) => {
      const m = moisDuJeudi(lundi);
      const c = poulesParMois.get(m) || { volume: fourchetteNulle(), ca: fourchetteNulle(), aliment: fourchetteNulle() };
      poulesParMois.set(m, { volume: somme(c.volume, volume), ca: somme(c.ca, ca), aliment: somme(c.aliment, aliment) });
    };
    const nulle = fourchetteNulle();
    for (const [lundi, semaine] of lots.length ? poulesParSemaine(donnees) : []) {
      if (ventesOeufs) ajouterAuxPoules(lundi, nulle, nulle, semaine.aliment);
      else ajouterAuxPoules(lundi, semaine.oeufs, semaine.valeur, semaine.aliment);
    }
    for (const [lundi, vente] of lots.length && ventesOeufs ? ventesOeufs : []) {
      if (vente.vendu.haute > 0) ajouterAuxPoules(lundi, vente.vendu, vente.ca, nulle);
    }

    const tousLesMois = [...[...parCulture.values()].flatMap((c) => [...c.mois.keys()]), ...couts.keys(), ...poulesParMois.keys()].sort();
    const mois = tousLesMois.length ? moisEntre(tousLesMois[0], tousLesMois[tousLesMois.length - 1]) : [];
    const avecMarge = (c) => ({ volume: c.volume, ca: c.ca, marge: { ...c.ca } });
    const totalFerme = { mois: {}, total: caseVide() };
    for (const m of mois) totalFerme.mois[m] = caseVide();

    const lignes = [...parCulture.values()]
      .sort((a, b) => a.culture.nom.localeCompare(b.culture.nom, "fr"))
      .map(({ culture, aDebouche, mois: parMois }) => {
        const ligne = { cultureId: culture.id, nom: culture.nom, unite: culture.unite, aDebouche, mois: {}, total: caseVide() };
        for (const m of mois) {
          const c = parMois.get(m) || caseVide();
          ligne.mois[m] = avecMarge(c);
          ajouterA(ligne.total, c.volume, c.ca);
          ajouterA(totalFerme.mois[m], c.volume, c.ca);
          ajouterA(totalFerme.total, c.volume, c.ca);
        }
        ligne.total = avecMarge(ligne.total);
        return ligne;
      });

    let poules = null;
    if (lots.length) {
      const vide = () => ({ volume: fourchetteNulle(), ca: fourchetteNulle(), aliment: fourchetteNulle() });
      const avecMargeAtelier = (c) => ({ ...c, marge: soustraire(c.ca, c.aliment) });
      const cumul = vide();
      poules = { lots: lots.length, effectif: lots.reduce((n, l) => n + l.effectif, 0), aDebouche: Boolean(ventesOeufs), mois: {} };
      for (const m of mois) {
        const c = poulesParMois.get(m) || vide();
        poules.mois[m] = avecMargeAtelier(c);
        for (const cle of ["volume", "ca", "aliment"]) cumul[cle] = somme(cumul[cle], c[cle]);
      }
      poules.total = avecMargeAtelier(cumul);
    }

    // Le total de la ferme additionne des unités différentes : seuls le chiffre d'affaires, les coûts et la marge y ont un sens.
    // Marge de la ferme = chiffre d'affaires − coût des séances (− aliment s'il y a des poules), du pire au meilleur.
    const bilan = (ca, cout, atelier) => (atelier
      ? { ca: somme(ca, atelier.ca), couts: cout, aliment: atelier.aliment, marge: soustraire(soustraire(somme(ca, atelier.ca), cout), atelier.aliment) }
      : { ca, couts: cout, marge: soustraire(ca, cout) });
    const total = { mois: {}, total: bilan(totalFerme.total.ca, [...couts.values()].reduce(somme, fourchetteNulle()), poules && poules.total) };
    for (const m of mois) total.mois[m] = bilan(totalFerme.mois[m].ca, couts.get(m) || fourchetteNulle(), poules && poules.mois[m]);

    return { mois, lignes, poules, total };
  }

  // P2 (EX-33) : les chiffres clés de la saison, tirés du tableau — chiffre d'affaires (et sa part des
  // cultures et des œufs), coûts déduits (séances de vente et aliment des poules, chacun et leur somme),
  // marge de la ferme ; les œufs s'il y a des poules (vendus s'ils ont un débouché, sinon toute la ponte).
  // Un coût ou une part absents valent null.
  function chiffresCles(t) {
    const { ca, couts, aliment, marge } = t.total.total;
    const cultures = t.lignes.reduce((cumul, ligne) => somme(cumul, ligne.total.ca), fourchetteNulle());
    const seances = couts.haute > 0 ? couts : null;
    const atelier = aliment && aliment.haute > 0 ? aliment : null;
    const total = [seances, atelier].filter(Boolean).reduce(somme, fourchetteNulle());
    const oeufs = t.poules ? { volume: t.poules.total.volume, vendus: t.poules.aDebouche, effectif: t.poules.effectif, lots: t.poules.lots } : null;
    return { ca, parts: { cultures, oeufs: t.poules ? t.poules.total.ca : null }, couts: { total, seances, aliment: atelier }, marge, oeufs };
  }

  // ---- Sur-occupation des espaces (EX-06)

  // Une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte, incluses.
  // Rend, pour chaque espace actif dont la surface est dépassée à une date : les périodes de
  // dépassement avec la surface occupée, et pour chaque mois touché la plus grande surface occupée.
  // Le calcul signale seulement : il ne modifie ni ne refuse aucune plantation.
  function surOccupations(donnees) {
    const occupations = new Map();
    for (const { plantation, p } of plantationsCalculables(donnees)) {
      if (!occupations.has(plantation.espaceId)) occupations.set(plantation.espaceId, []);
      occupations.get(plantation.espaceId).push({
        debut: versJour(plantation.date),
        fin: versJour(datesRecolte(plantation, p).fin),
        surface: plantation.surface,
      });
    }

    const resultat = {};
    for (const espace of (donnees.espaces || []).filter((e) => !e.supprimeLe)) {
      const liste = occupations.get(espace.id) || [];
      const bornes = [...new Set(liste.flatMap((o) => [o.debut, o.fin + 1]))].sort((a, b) => a - b);
      const periodes = [];
      for (let i = 0; i < bornes.length - 1; i++) {
        const jour = bornes[i];
        const surface = liste.filter((o) => o.debut <= jour && jour <= o.fin).reduce((s, o) => s + o.surface, 0);
        if (surface - espace.surface <= 1e-9) continue;
        const precedente = periodes[periodes.length - 1];
        if (precedente && precedente.fin === jour - 1 && precedente.surface === surface) precedente.fin = bornes[i + 1] - 1;
        else periodes.push({ debut: jour, fin: bornes[i + 1] - 1, surface });
      }
      if (periodes.length === 0) continue;

      const parMois = new Map();
      for (const periode of periodes) {
        for (const mois of moisEntre(depuisJour(periode.debut).slice(0, 7), depuisJour(periode.fin).slice(0, 7))) {
          parMois.set(mois, Math.max(parMois.get(mois) || 0, periode.surface));
        }
      }
      resultat[espace.id] = {
        periodes: periodes.map((o) => ({ debut: depuisJour(o.debut), fin: depuisJour(o.fin), surface: o.surface })),
        mois: [...parMois.entries()].sort().map(([mois, surface]) => ({ mois, surface })),
      };
    }
    return resultat;
  }

  // ---- Séances (EX-19)

  // Les dates d'une séance régulière : chaque semaine, le jour dit, de la première à la dernière date incluses.
  function seancesDatees(seance) {
    const dates = [];
    const decalage = (seance.jour - jourDeLaSemaine(seance.debut) + 7) % 7;
    for (let date = ajouterJours(seance.debut, decalage); date <= seance.fin; date = ajouterJours(date, 7)) dates.push(date);
    return dates;
  }

  // Coût d'une séance datée : ses frais + le trajet aller-retour (2 × distance × coût du km), en fourchette.
  function coutSeance(seance, pointVente) {
    const trajet = proportion(pointVente.coutKm, 2 * pointVente.distanceKm, 1);
    return somme(seance.frais, trajet);
  }

  // Toutes les séances datées de la ferme, avec leur coût : séances actives d'un point de vente actif.
  function seancesDeLaFerme({ pointsVente = [], seances = [] }) {
    const pointsParId = new Map(pointsVente.filter((p) => !p.supprimeLe).map((p) => [p.id, p]));
    const resultat = [];
    for (const seance of seances.filter((s) => !s.supprimeLe)) {
      const pointVente = pointsParId.get(seance.pointVenteId);
      if (!pointVente) continue;
      const cout = coutSeance(seance, pointVente);
      for (const date of seancesDatees(seance)) resultat.push({ seanceId: seance.id, pointVenteId: pointVente.id, date, cout });
    }
    return resultat;
  }

  // ---- Offre et demande par semaine (EX-20)

  const PRECISION = 1e-9;

  function ajouterDans(table, cle, semaine, fourchette) {
    if (!table.has(cle)) table.set(cle, new Map());
    const parSemaine = table.get(cle);
    parSemaine.set(semaine, somme(parSemaine.get(semaine) || fourchetteNulle(), fourchette));
  }

  // Offre de chaque culture, par semaine (son lundi) : une semaine de récolte compte entière dans la
  // semaine du calendrier qui contient son jour du milieu (granularité à la semaine, règle de N1).
  function offreParSemaine(donnees) {
    const offre = new Map();
    for (const { plantation, culture, p } of plantationsCalculables(donnees)) {
      for (const semaine of productionHebdomadaire(plantation, p)) {
        ajouterDans(offre, culture.id, lundiDe(ajouterJours(semaine.debut, 3)), semaine.volume);
      }
    }
    // S3 (EX-28) : les œufs de tous les lots forment un produit de plus.
    for (const [lundi, semaine] of poulesParSemaine(donnees)) {
      if (semaine.oeufs.haute > 0) ajouterDans(offre, OEUFS, lundi, semaine.oeufs);
    }
    return offre;
  }

  // Débouchés qui comptent : actifs, à un point de vente actif, pour une culture active.
  function debouchesActifs({ pointsVente = [], debouches = [], cultures = [] }) {
    const pointsParId = new Map(pointsVente.filter((p) => !p.supprimeLe).map((p) => [p.id, p]));
    const culturesActives = new Set(cultures.filter((c) => !c.supprimeLe).map((c) => c.id));
    return debouches
      .filter((d) => !d.supprimeLe && pointsParId.has(d.pointVenteId) && (culturesActives.has(d.produitId) || d.produitId === OEUFS))
      .map((debouche) => ({ debouche, pointVente: pointsParId.get(debouche.pointVenteId) }));
  }

  // Demande de chaque culture, par semaine : volume vendable de chaque débouché, à chaque séance datée de son point de vente.
  function demandeParSemaine(donnees) {
    const seancesParPoint = new Map();
    for (const seance of seancesDeLaFerme(donnees)) {
      if (!seancesParPoint.has(seance.pointVenteId)) seancesParPoint.set(seance.pointVenteId, []);
      seancesParPoint.get(seance.pointVenteId).push(seance);
    }
    const demande = new Map();
    for (const { debouche } of debouchesActifs(donnees)) {
      if (!demande.has(debouche.produitId)) demande.set(debouche.produitId, new Map());
      for (const seance of seancesParPoint.get(debouche.pointVenteId) || []) {
        ajouterDans(demande, debouche.produitId, lundiDe(seance.date), debouche.volumeParSeance);
      }
    }
    return demande;
  }

  // Numéro de la semaine selon la norme ISO 8601 (celle des calendriers français) : la semaine 1 contient le premier jeudi de l'année.
  function numeroDeSemaine(date) {
    const jeudi = ajouterJours(lundiDe(date), 3);
    const premierJanvier = jeudi.slice(0, 4) + "-01-01";
    return Math.floor((versJour(jeudi) - versJour(premierJanvier)) / 7) + 1;
  }

  // ---- Ventes (EX-21)

  // Ordre de service des débouchés : prix médian décroissant, puis nom du point de vente ; le même aux trois niveaux.
  function parPrixDecroissant(a, b) {
    return b.debouche.prix.mediane - a.debouche.prix.mediane ||
      a.pointVente.nom.localeCompare(b.pointVente.nom, "fr") || a.debouche.id.localeCompare(b.debouche.id);
  }

  function seancesParPointEtSemaine(donnees) {
    const table = new Map();
    for (const seance of seancesDeLaFerme(donnees)) {
      if (!table.has(seance.pointVenteId)) table.set(seance.pointVenteId, new Map());
      const parSemaine = table.get(seance.pointVenteId);
      const lundi = lundiDe(seance.date);
      parSemaine.set(lundi, (parSemaine.get(lundi) || 0) + 1);
    }
    return table;
  }

  // Ventes des cultures qui ont un débouché, par culture puis par semaine (son lundi) :
  // { offre, vendu, ca, debouches: [{ debouche, pointVenteId, demande, vendu, ca }] }. La production de la semaine va aux
  // débouchés dans l'ordre de service, chacun jusqu'à sa demande (séances de la semaine × volume vendable) ;
  // chaque niveau de la fourchette se calcule avec les valeurs de ce niveau.
  function ventes(donnees) {
    const offre = offreParSemaine(donnees);
    const seances = seancesParPointEtSemaine(donnees);
    const parCulture = new Map();
    for (const actif of debouchesActifs(donnees)) {
      if (!parCulture.has(actif.debouche.produitId)) parCulture.set(actif.debouche.produitId, []);
      parCulture.get(actif.debouche.produitId).push(actif);
    }
    const resultat = new Map();
    for (const [produitId, liste] of parCulture) {
      liste.sort(parPrixDecroissant);
      const offreCulture = offre.get(produitId) || new Map();
      const lundis = new Set(offreCulture.keys());
      for (const { pointVente } of liste) for (const lundi of (seances.get(pointVente.id) || new Map()).keys()) lundis.add(lundi);
      const parSemaine = new Map();
      for (const lundi of [...lundis].sort()) {
        const reste = { ...(offreCulture.get(lundi) || fourchetteNulle()) };
        const servis = liste.map(({ debouche, pointVente }) => {
          const nombre = (seances.get(pointVente.id) && seances.get(pointVente.id).get(lundi)) || 0;
          const demande = proportion(debouche.volumeParSeance, nombre, 1);
          const vendu = {};
          const ca = {};
          for (const niveau of NIVEAUX) {
            vendu[niveau] = Math.min(demande[niveau], reste[niveau]);
            reste[niveau] -= vendu[niveau];
            ca[niveau] = vendu[niveau] * debouche.prix[niveau];
          }
          return { debouche, pointVenteId: pointVente.id, demande, vendu, ca };
        });
        parSemaine.set(lundi, {
          offre: offreCulture.get(lundi) || fourchetteNulle(),
          vendu: servis.reduce((total, d) => somme(total, d.vendu), fourchetteNulle()),
          ca: servis.reduce((total, d) => somme(total, d.ca), fourchetteNulle()),
          debouches: servis,
        });
      }
      resultat.set(produitId, parSemaine);
    }
    return resultat;
  }

  function moisDuJeudi(lundi) {
    return ajouterJours(lundi, 3).slice(0, 7);
  }

  // ---- Points de vente (EX-22)

  // Par point de vente actif et par mois (celui du jeudi de la semaine) : nombre de séances, chiffre
  // d'affaires, coût des séances et résultat. Le chiffre d'affaires d'un point pris seul va du cas le moins
  // favorable pour lui (production basse, sa demande basse, demande haute des débouchés servis avant lui)
  // au plus favorable (l'inverse) ; la médiane est celle du calcul médian. Ces fourchettes ne s'additionnent
  // pas d'un point de vente à l'autre.
  function pointsDeVente(donnees) {
    const parPoint = new Map((donnees.pointsVente || []).filter((p) => !p.supprimeLe).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
      .map((pointVente) => [pointVente.id, { pointVente, mois: new Map() }]));
    const caseDuMois = (pointVenteId, mois) => {
      const parMois = parPoint.get(pointVenteId).mois;
      if (!parMois.has(mois)) parMois.set(mois, { seances: 0, ca: fourchetteNulle(), couts: fourchetteNulle() });
      return parMois.get(mois);
    };

    for (const seance of seancesDeLaFerme(donnees)) {
      const c = caseDuMois(seance.pointVenteId, moisDuJeudi(lundiDe(seance.date)));
      c.seances += 1;
      c.couts = somme(c.couts, seance.cout);
    }
    for (const parSemaine of ventes(donnees).values()) {
      for (const [lundi, semaine] of parSemaine) {
        let avant = fourchetteNulle();
        for (const servi of semaine.debouches) {
          const pire = Math.min(servi.demande.basse, Math.max(0, semaine.offre.basse - avant.haute));
          const meilleur = Math.min(servi.demande.haute, Math.max(0, semaine.offre.haute - avant.basse));
          avant = somme(avant, servi.demande);
          if (meilleur === 0) continue;
          const c = caseDuMois(servi.pointVenteId, moisDuJeudi(lundi));
          c.ca = somme(c.ca, { basse: pire * servi.debouche.prix.basse, mediane: servi.ca.mediane, haute: meilleur * servi.debouche.prix.haute });
        }
      }
    }

    const tousLesMois = [...parPoint.values()].flatMap((p) => [...p.mois.keys()]).sort();
    const mois = tousLesMois.length ? moisEntre(tousLesMois[0], tousLesMois[tousLesMois.length - 1]) : [];
    const bilan = (c) => ({ seances: c.seances, ca: c.ca, couts: c.couts, resultat: soustraire(c.ca, c.couts) });
    const points = [...parPoint.values()].map(({ pointVente, mois: parMois }) => {
      const point = { pointVenteId: pointVente.id, nom: pointVente.nom, mois: {} };
      const total = { seances: 0, ca: fourchetteNulle(), couts: fourchetteNulle() };
      for (const m of mois) {
        const c = parMois.get(m) || { seances: 0, ca: fourchetteNulle(), couts: fourchetteNulle() };
        point.mois[m] = bilan(c);
        total.seances += c.seances;
        total.ca = somme(total.ca, c.ca);
        total.couts = somme(total.couts, c.couts);
      }
      point.total = bilan(total);
      return point;
    });
    return { mois, points };
  }

  // ---- Poules pondeuses (S3)

  // Nombre de jours de [debut, fin] (inclus) dans chaque semaine, désignée par son lundi.
  function joursParSemaine(debut, fin) {
    const jours = new Map();
    if (!debut || !fin || fin < debut) return jours;
    for (let lundi = lundiDe(debut); lundi <= fin; lundi = ajouterJours(lundi, 7)) {
      const dimanche = ajouterJours(lundi, 6);
      const premier = debut > lundi ? debut : lundi;
      const dernier = fin < dimanche ? fin : dimanche;
      jours.set(lundi, versJour(dernier) - versJour(premier) + 1);
    }
    return jours;
  }

  // Œufs pondus par un lot en un jour de ponte : effectif × ponte × (1 − pertes).
  function oeufsParJour(lot) {
    return proportion(lot.ponte, lot.effectif * (100 - (lot.pertes || 0)), 100);
  }

  // Œufs d'une semaine entière de ponte.
  function oeufsParSemaine(lot) {
    return proportion(oeufsParJour(lot), 7, 1);
  }

  // Aliment d'un lot en un jour de présence, en kg : effectif × grammes par poule.
  function alimentParJour(lot) {
    return proportion(lot.aliment, lot.effectif, 1000);
  }

  // Coût de l'aliment d'une semaine entière de présence.
  function coutAlimentParSemaine(lot) {
    return produit(proportion(alimentParJour(lot), 7, 1), lot.prixAliment);
  }

  // Par semaine (son lundi), pour les lots actifs : œufs pondus (du début de ponte à la réforme), leur valeur
  // au prix de l'œuf de chaque lot, aliment en kg et son coût (de l'arrivée à la réforme). Invariant
  // ponte_nulle_hors_periode : une semaine ne compte que ses jours dans ces périodes.
  function poulesParSemaine({ lots = [] }) {
    const semaines = new Map();
    const semaine = (lundi) => {
      if (!semaines.has(lundi)) {
        semaines.set(lundi, { oeufs: fourchetteNulle(), valeur: fourchetteNulle(), alimentKg: fourchetteNulle(), aliment: fourchetteNulle() });
      }
      return semaines.get(lundi);
    };
    for (const lot of lots.filter((l) => !l.supprimeLe)) {
      for (const [lundi, jours] of joursParSemaine(lot.debutPonte, lot.reforme)) {
        const s = semaine(lundi);
        const oeufs = proportion(oeufsParJour(lot), jours, 1);
        s.oeufs = somme(s.oeufs, oeufs);
        s.valeur = somme(s.valeur, produit(oeufs, lot.prixOeuf));
      }
      for (const [lundi, jours] of joursParSemaine(lot.arrivee, lot.reforme)) {
        const s = semaine(lundi);
        const kg = proportion(alimentParJour(lot), jours, 1);
        s.alimentKg = somme(s.alimentKg, kg);
        s.aliment = somme(s.aliment, produit(kg, lot.prixAliment));
      }
    }
    return new Map([...semaines].sort(([a], [b]) => a.localeCompare(b)));
  }

  function semainesEntre(premiere, derniere) {
    const liste = [];
    for (let lundi = premiere; lundi <= derniere; lundi = ajouterJours(lundi, 7)) liste.push(lundi);
    return liste;
  }

  // Par culture et par semaine : l'offre, la demande (null pour une culture sans débouché), l'écart des
  // médianes, l'état (depasse, manque, equilibre, sans_debouche) et sa sûreté (fourchettes disjointes).
  function offreDemande(donnees) {
    const offre = offreParSemaine(donnees);
    const demande = demandeParSemaine(donnees);
    const lundis = [...offre.values(), ...demande.values()].flatMap((m) => [...m.keys()]).sort();
    const semaines = lundis.length ? semainesEntre(lundis[0], lundis[lundis.length - 1]) : [];
    const cultures = (donnees.cultures || []).filter((c) => !c.supprimeLe && (offre.has(c.id) || demande.has(c.id)))
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    // Les œufs viennent après les cultures ; leur nom et leur unité sont des textes de l'interface.
    const produits = cultures.map((c) => ({ produitId: c.id, nom: c.nom, unite: c.unite }));
    if (offre.has(OEUFS) || demande.has(OEUFS)) produits.push({ produitId: OEUFS, nom: null, unite: null });

    const lignes = produits.map(({ produitId, nom, unite }) => {
      const ligne = { produitId, nom, unite, semaines: {} };
      for (const lundi of semaines) {
        const o = (offre.get(produitId) && offre.get(produitId).get(lundi)) || fourchetteNulle();
        if (!demande.has(produitId)) {
          ligne.semaines[lundi] = { offre: o, demande: null, ecart: null, etat: "sans_debouche", sur: false };
          continue;
        }
        const d = demande.get(produitId).get(lundi) || fourchetteNulle();
        const ecart = o.mediane - d.mediane;
        const etat = Math.abs(ecart) < PRECISION ? "equilibre" : ecart > 0 ? "depasse" : "manque";
        const sur = etat === "depasse" ? o.basse > d.haute + PRECISION : etat === "manque" ? o.haute < d.basse - PRECISION : false;
        ligne.semaines[lundi] = { offre: o, demande: d, ecart, etat, sur };
      }
      return ligne;
    });
    return { semaines, lignes };
  }

  return {
    CHAMPS_SURCHARGEABLES,
    OEUFS,
    ajouterJours,
    jourDeLaSemaine,
    lundiDe,
    seancesDatees,
    coutSeance,
    seancesDeLaFerme,
    offreDemande,
    ventes,
    pointsDeVente,
    oeufsParSemaine,
    coutAlimentParSemaine,
    poulesParSemaine,
    numeroDeSemaine,
    parametres,
    datesRecolte,
    productionTotale,
    productionSurPeriode,
    productionHebdomadaire,
    tableau,
    chiffresCles,
    surOccupations,
  };
});
