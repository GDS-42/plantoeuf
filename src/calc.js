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
  // N3 (EX-47) : coûts de mise en place d'une plantation = surface × densité × prix d'une graine ou d'un
  // plant + surface × intrants, en fourchette ; un champ manquant compte pour 0.
  function coutsDeCulture(plantation, culture) {
    let cout = fourchetteNulle();
    if (culture.densite > 0 && culture.prixUnite) cout = somme(cout, proportion(culture.prixUnite, plantation.surface * culture.densite, 1));
    if (culture.intrants) cout = somme(cout, proportion(culture.intrants, plantation.surface, 1));
    return cout;
  }

  // Coût de mise en place d'un m² de la culture ; null si elle n'en a pas.
  function coutParM2(culture) {
    const cout = coutsDeCulture({ surface: 1 }, culture);
    return cout.haute > 0 ? cout : null;
  }

  // N3 (EX-49) : les graines ou plants à prévoir, plantation par plantation, dans l'ordre des dates :
  // quantité = surface × densité, coût = quantité × prix d'une graine ou d'un plant (null sans prix).
  function besoins(donnees) {
    return plantationsCalculables(donnees)
      .filter(({ culture }) => culture.densite > 0)
      .map(({ plantation, culture }) => {
        const quantite = plantation.surface * culture.densite;
        return {
          plantationId: plantation.id, date: plantation.date, mois: plantation.date.slice(0, 7), cultureId: culture.id,
          varieteId: plantation.varieteId, implantation: culture.implantation || "", quantite,
          cout: culture.prixUnite ? proportion(culture.prixUnite, quantite, 1) : null,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.plantationId.localeCompare(b.plantationId));
  }

  // Les besoins regroupés par mois de mise en place, avec le coût connu de chaque mois et de la saison
  // (null si aucun besoin n'a de prix) : { mois: [{ mois, besoins, cout }], cout }.
  // R3 (EX-57) : avec une année, seulement les plantations mises en place dans cette année.
  function besoinsParMois(donnees, { annee } = {}) {
    const coutConnu = (liste) => {
      const avecPrix = liste.filter((b) => b.cout);
      return avecPrix.length ? avecPrix.map((b) => b.cout).reduce(somme, fourchetteNulle()) : null;
    };
    const tous = besoins(donnees).filter((b) => dansLAnnee(annee, b.mois));
    const parMois = new Map();
    for (const b of tous) {
      if (!parMois.has(b.mois)) parMois.set(b.mois, []);
      parMois.get(b.mois).push(b);
    }
    return { mois: [...parMois].map(([mois, liste]) => ({ mois, besoins: liste, cout: coutConnu(liste) })), cout: coutConnu(tous) };
  }

  // ---- Années (R3)

  // Vrai si le mois ou la date (« AAAA-MM… ») tombe dans l'année ; toujours vrai sans année.
  function dansLAnnee(annee, moisOuDate) {
    return annee === undefined || annee === null || moisOuDate.startsWith(`${annee}-`);
  }

  // R3 (EX-55) : les années de la ferme, de la première à la dernière qui porte un mois du tableau (sans le
  // prolongement à 12 mois des charges fixes) ou une barre du calendrier (plantation de sa mise en place à
  // sa fin de récolte, lot de son arrivée à sa réforme). Une ferme vide n'en a aucune.
  function annees(donnees) {
    const bornes = [];
    const { mois } = tableau({ ...donnees, charges: [] });
    if (mois.length) bornes.push(mois[0], mois[mois.length - 1]);
    for (const { plantation, p } of plantationsCalculables(donnees)) bornes.push(plantation.date, datesRecolte(plantation, p).fin);
    for (const lot of (donnees.lots || []).filter((l) => !l.supprimeLe)) bornes.push(lot.arrivee, lot.reforme);
    if (!bornes.length) return [];
    const liste = bornes.map((b) => Number(b.slice(0, 4)));
    const [premiere, derniere] = [Math.min(...liste), Math.max(...liste)];
    return Array.from({ length: derniere - premiere + 1 }, (_, i) => premiere + i);
  }

  // R3 (EX-55) : l'année retenue si elle est encore une année de la ferme, sinon l'année en cours si c'en
  // est une, sinon la plus proche (la plus tardive à égalité) ; null sans année. aujourdhui : « AAAA-MM-JJ ».
  function anneeParDefaut(liste, aujourdhui, retenue) {
    if (!liste.length) return null;
    if (retenue !== undefined && retenue !== null && liste.includes(Number(retenue))) return Number(retenue);
    const courante = Number(String(aujourdhui).slice(0, 4));
    return liste.reduce((meilleure, a) => (Math.abs(a - courante) <= Math.abs(meilleure - courante) ? a : meilleure));
  }

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

  // N3 (EX-48) : une charge fixe comptée chaque mois (montant mensuel, ou annuel ÷ 12), et sur un an.
  function chargeParMois(charge) {
    return charge.periodicite === "an" ? proportion(charge.montant, 1, 12) : charge.montant;
  }

  function chargeParAn(charge) {
    return proportion(chargeParMois(charge), 12, 1);
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
  // la ferme (EX-23). N3 (EX-47) : une culture qui a des coûts de mise en place les déduit de sa marge, au
  // mois de chaque mise en place ; sans coût, sa marge reste égale à son chiffre d'affaires.
  // S3 (EX-27) : l'atelier poules, à part des cultures (`poules`, null sans lot actif) — œufs, chiffre
  // d'affaires, aliment et marge de l'atelier par mois, chaque semaine dans le mois de son jeudi ; la marge
  // de la ferme déduit aussi l'aliment.
  // R3 (EX-56) : avec une année, seules comptent les valeurs de cette année (chacune dans l'année de son
  // mois) ; les mois vont de janvier à décembre si la ferme a une charge fixe, sinon du premier au dernier
  // mois de l'année qui porte une valeur ; une culture ou l'atelier poules n'ont de ligne que s'ils portent
  // une valeur dans l'année. Sans année, le tableau de toute la projection, comme avant R3.
  function tableau(donnees, { annee } = {}) {
    const parAnnee = annee !== undefined && annee !== null;
    const garder = (m) => dansLAnnee(annee, m);
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
    // N3 (EX-47) : coûts de culture, par culture puis par mois de mise en place (ceux qui coûtent).
    const coutsCultures = new Map();
    for (const { plantation, culture } of plantationsCalculables(donnees)) {
      const cout = coutsDeCulture(plantation, culture);
      if (cout.haute <= 0) continue;
      if (!coutsCultures.has(culture.id)) coutsCultures.set(culture.id, new Map());
      const parMois = coutsCultures.get(culture.id);
      const m = plantation.date.slice(0, 7);
      parMois.set(m, somme(parMois.get(m) || fourchetteNulle(), cout));
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

    const cles = (iterable) => [...iterable].filter(garder);
    const tousLesMois = [...[...parCulture.values()].flatMap((c) => cles(c.mois.keys())), ...cles(couts.keys()), ...cles(poulesParMois.keys()),
      ...[...coutsCultures.values()].flatMap((parMois) => cles(parMois.keys()))].sort();
    // N3 (EX-48) : avec au moins une charge fixe, la projection couvre au moins 12 mois d'affilée à partir de
    // son premier mois, pour ne pas sous-compter une charge annuelle.
    const charges = (donnees.charges || []).filter((c) => !c.supprimeLe);
    let dernierMois = tousLesMois[tousLesMois.length - 1];
    if (charges.length && tousLesMois.length && !parAnnee) {
      let douzieme = tousLesMois[0];
      for (let i = 0; i < 11; i++) douzieme = moisSuivant(douzieme);
      if (douzieme > dernierMois) dernierMois = douzieme;
    }
    // R3 (EX-56) : une année avec charges fixes montre ses 12 mois.
    const mois = parAnnee && charges.length ? moisEntre(`${annee}-01`, `${annee}-12`)
      : tousLesMois.length ? moisEntre(tousLesMois[0], dernierMois) : [];
    const avecMarge = (c) => ({ volume: c.volume, ca: c.ca, marge: { ...c.ca } });
    // Une culture qui a des coûts de mise en place les déduit de sa marge (N3) ; sans coût, la case garde sa forme.
    const avecCouts = (c, cout) => ({ volume: c.volume, ca: c.ca, couts: cout, marge: soustraire(c.ca, cout) });
    const totalFerme = { mois: {}, total: caseVide() };
    for (const m of mois) totalFerme.mois[m] = caseVide();
    const coutsFerme = coutsCultures.size ? { mois: Object.fromEntries(mois.map((m) => [m, fourchetteNulle()])), total: fourchetteNulle() } : null;

    const aUneValeur = ({ culture, mois: parMois }) => !parAnnee || cles(parMois.keys()).length > 0 ||
      (coutsCultures.has(culture.id) && cles(coutsCultures.get(culture.id).keys()).length > 0);
    const lignes = [...parCulture.values()]
      .filter(aUneValeur)
      .sort((a, b) => a.culture.nom.localeCompare(b.culture.nom, "fr"))
      .map(({ culture, aDebouche, mois: parMois }) => {
        const ligne = { cultureId: culture.id, nom: culture.nom, unite: culture.unite, aDebouche, mois: {}, total: caseVide() };
        const coutsParMois = coutsCultures.get(culture.id);
        let coutTotal = fourchetteNulle();
        for (const m of mois) {
          const c = parMois.get(m) || caseVide();
          if (coutsParMois) {
            const cout = coutsParMois.get(m) || fourchetteNulle();
            ligne.mois[m] = avecCouts(c, cout);
            coutTotal = somme(coutTotal, cout);
            coutsFerme.mois[m] = somme(coutsFerme.mois[m], cout);
            coutsFerme.total = somme(coutsFerme.total, cout);
          } else {
            ligne.mois[m] = avecMarge(c);
          }
          ajouterA(ligne.total, c.volume, c.ca);
          ajouterA(totalFerme.mois[m], c.volume, c.ca);
          ajouterA(totalFerme.total, c.volume, c.ca);
        }
        ligne.total = coutsParMois ? avecCouts(ligne.total, coutTotal) : avecMarge(ligne.total);
        return ligne;
      });

    let poules = null;
    // R3 (EX-56) : l'année d'un lot va de celle de son arrivée à celle de sa réforme, chacune prise au jeudi de sa semaine.
    const lotsDeLAnnee = parAnnee
      ? lots.filter((l) => moisDuJeudi(lundiDe(l.arrivee)) <= `${annee}-12` && moisDuJeudi(lundiDe(l.reforme)) >= `${annee}-01`) : lots;
    if (lots.length && (!parAnnee || cles(poulesParMois.keys()).length > 0)) {
      const vide = () => ({ volume: fourchetteNulle(), ca: fourchetteNulle(), aliment: fourchetteNulle() });
      const avecMargeAtelier = (c) => ({ ...c, marge: soustraire(c.ca, c.aliment) });
      const cumul = vide();
      poules = { lots: lotsDeLAnnee.length, effectif: lotsDeLAnnee.reduce((n, l) => n + l.effectif, 0), aDebouche: Boolean(ventesOeufs), mois: {} };
      for (const m of mois) {
        const c = poulesParMois.get(m) || vide();
        poules.mois[m] = avecMargeAtelier(c);
        for (const cle of ["volume", "ca", "aliment"]) cumul[cle] = somme(cumul[cle], c[cle]);
      }
      poules.total = avecMargeAtelier(cumul);
    }

    // Le total de la ferme additionne des unités différentes : seuls le chiffre d'affaires, les coûts et la marge y ont un sens.
    // Marge de la ferme = chiffre d'affaires − coût des séances (− aliment s'il y a des poules, − coûts de culture
    // s'il y en a, N3), du pire au meilleur. Les clés aliment et cultures n'existent que si elles servent.
    const bilan = (ca, cout, atelier, cultures) => {
      const resultat = { ca: atelier ? somme(ca, atelier.ca) : ca, couts: cout };
      let marge = soustraire(resultat.ca, cout);
      if (atelier) {
        resultat.aliment = atelier.aliment;
        marge = soustraire(marge, atelier.aliment);
      }
      if (cultures) {
        resultat.cultures = cultures;
        marge = soustraire(marge, cultures);
      }
      resultat.marge = marge;
      return resultat;
    };
    const coutsDesSeances = parAnnee ? [...couts].filter(([m]) => garder(m)).map(([, c]) => c) : [...couts.values()];
    const total = { mois: {}, total: bilan(totalFerme.total.ca, coutsDesSeances.reduce(somme, fourchetteNulle()), poules && poules.total, coutsFerme && coutsFerme.total) };
    for (const m of mois) total.mois[m] = bilan(totalFerme.mois[m].ca, couts.get(m) || fourchetteNulle(), poules && poules.mois[m], coutsFerme && coutsFerme.mois[m]);

    // N3 (EX-48) : revenu = marge de la ferme − charges fixes, chaque mois et sur toute la projection, du
    // pire au meilleur. Les clés charges et revenu n'existent que si la ferme a une charge fixe.
    if (charges.length) {
      const parMois = charges.map(chargeParMois).reduce(somme, fourchetteNulle());
      const avecRevenu = (b, montant) => Object.assign(b, { charges: { ...montant }, revenu: soustraire(b.marge, montant) });
      for (const m of mois) avecRevenu(total.mois[m], parMois);
      avecRevenu(total.total, proportion(parMois, mois.length, 1));
    }

    return { mois, lignes, poules, total };
  }

  // P2 (EX-33) : les chiffres clés de la saison, tirés du tableau — chiffre d'affaires (et sa part des
  // cultures et des œufs), coûts déduits (séances de vente et aliment des poules, chacun et leur somme),
  // marge de la ferme ; les œufs s'il y a des poules (vendus s'ils ont un débouché, sinon toute la ponte).
  // Un coût ou une part absents valent null.
  function chiffresCles(t) {
    const { ca, couts, aliment, marge, cultures: coutsCultures } = t.total.total;
    const cultures = t.lignes.reduce((cumul, ligne) => somme(cumul, ligne.total.ca), fourchetteNulle());
    const seances = couts.haute > 0 ? couts : null;
    const atelier = aliment && aliment.haute > 0 ? aliment : null;
    // N3 (EX-47) : les coûts de culture s'ajoutent aux coûts déduits ; leur clé n'existe que s'il y en a.
    const miseEnPlace = coutsCultures && coutsCultures.haute > 0 ? coutsCultures : null;
    const total = [seances, atelier, miseEnPlace].filter(Boolean).reduce(somme, fourchetteNulle());
    const oeufs = t.poules ? { volume: t.poules.total.volume, vendus: t.poules.aDebouche, effectif: t.poules.effectif, lots: t.poules.lots } : null;
    // Le mois au chiffre d'affaires médian le plus haut (null sans aucune vente), et les mois de marge médiane négative.
    const caMedian = (m) => t.total.mois[m].ca.mediane;
    const meilleurMois = t.mois.reduce((meilleur, m) => (caMedian(m) > (meilleur ? caMedian(meilleur) : 0) ? m : meilleur), null);
    const moisMargeNegative = t.mois.filter((m) => t.total.mois[m].marge.mediane < 0);
    // N3 (EX-48) : les charges fixes et le revenu, seulement si la ferme a une charge fixe.
    const revenu = t.total.total.revenu ? { charges: t.total.total.charges, revenu: t.total.total.revenu } : {};
    return { ca, parts: { cultures, oeufs: t.poules ? t.poules.total.ca : null }, couts: { total, seances, aliment: atelier, ...(miseEnPlace ? { cultures: miseEnPlace } : {}) }, marge, oeufs, meilleurMois, moisMargeNegative, ...revenu };
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

  // R1 (EX-43) : coût du km d'un point de vente. Avec un véhicule actif : consommation (L/100 km) × prix
  // du litre ÷ 100, niveau par niveau, plus ses frais d'entretien et d'usure au km (N3, EX-46) ; sans
  // véhicule, ou si le sien est supprimé : le coût du km saisi (N2), ou 0 s'il manque.
  // vehiculesParId : Map id → véhicule (supprimés compris ou non).
  function coutDuKm(pointVente, vehiculesParId = new Map()) {
    const vehicule = pointVente.vehiculeId ? vehiculesParId.get(pointVente.vehiculeId) : null;
    if (vehicule && !vehicule.supprimeLe) {
      const carburant = proportion(produit(vehicule.consommation, vehicule.prixLitre), 1, 100);
      return vehicule.fraisKm ? somme(carburant, vehicule.fraisKm) : carburant;
    }
    return pointVente.coutKm || fourchetteNulle();
  }

  function vehiculesActifs(vehicules = []) {
    return new Map(vehicules.filter((v) => !v.supprimeLe).map((v) => [v.id, v]));
  }

  // Coût d'une séance datée : ses frais + le trajet aller-retour (2 × distance × coût du km), en fourchette.
  function coutSeance(seance, pointVente, vehiculesParId = new Map()) {
    const trajet = proportion(coutDuKm(pointVente, vehiculesParId), 2 * pointVente.distanceKm, 1);
    return somme(seance.frais, trajet);
  }

  // Toutes les séances datées de la ferme, avec leur coût : séances actives d'un point de vente actif.
  function seancesDeLaFerme({ pointsVente = [], seances = [], vehicules = [] }) {
    const pointsParId = new Map(pointsVente.filter((p) => !p.supprimeLe).map((p) => [p.id, p]));
    const vehiculesParId = vehiculesActifs(vehicules);
    const resultat = [];
    for (const seance of seances.filter((s) => !s.supprimeLe)) {
      const pointVente = pointsParId.get(seance.pointVenteId);
      if (!pointVente) continue;
      const cout = coutSeance(seance, pointVente, vehiculesParId);
      for (const date of seancesDatees(seance)) resultat.push({ seanceId: seance.id, pointVenteId: pointVente.id, date, cout });
    }
    return resultat;
  }

  // R1 (EX-44) : bilan de saison de chaque véhicule actif (Map id → bilan) : son coût du km, le nombre de
  // séances datées des points de vente actifs qui l'utilisent, les kilomètres (2 × distance par séance),
  // les litres (km × consommation ÷ 100) et le coût du carburant (litres × prix du litre), en fourchette ;
  // N3 (EX-46) : l'entretien et l'usure (km × frais au km, 0 sans frais) et le coût total des trajets.
  // R3 (EX-57) : avec une année, les séances dont le jeudi de la semaine tombe dans cette année.
  function vehicules({ vehicules: liste = [], pointsVente = [], seances = [] }, { annee } = {}) {
    const actifs = vehiculesActifs(liste);
    const bilans = new Map([...actifs.values()].map((v) => [v.id, { vehiculeId: v.id, coutKm: coutDuKm({ vehiculeId: v.id }, actifs), seances: 0, km: 0 }]));
    const pointsParId = new Map(pointsVente.filter((p) => !p.supprimeLe).map((p) => [p.id, p]));
    for (const seance of seances.filter((s) => !s.supprimeLe)) {
      const pointVente = pointsParId.get(seance.pointVenteId);
      const bilan = pointVente && bilans.get(pointVente.vehiculeId);
      if (!bilan) continue;
      const nombre = seancesDatees(seance).filter((date) => dansLAnnee(annee, moisDuJeudi(lundiDe(date)))).length;
      bilan.seances += nombre;
      bilan.km += nombre * 2 * pointVente.distanceKm;
    }
    for (const bilan of bilans.values()) {
      const vehicule = actifs.get(bilan.vehiculeId);
      bilan.litres = proportion(vehicule.consommation, bilan.km, 100);
      bilan.carburant = produit(bilan.litres, vehicule.prixLitre);
      bilan.entretien = vehicule.fraisKm ? proportion(vehicule.fraisKm, bilan.km, 1) : fourchetteNulle();
      bilan.total = somme(bilan.carburant, bilan.entretien);
    }
    return bilans;
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

  // Le mois d'une semaine (désignée par son lundi) est celui de son jeudi.
  function moisDuJeudi(lundi) {
    return ajouterJours(lundi, 3).slice(0, 7);
  }

  // P2 (T35) : parmi des semaines qui se suivent, celles dont le mois diffère de celui de la précédente.
  function debutsDeMois(semaines) {
    return semaines.filter((lundi, i) => i > 0 && moisDuJeudi(lundi) !== moisDuJeudi(semaines[i - 1]));
  }

  // P2 (T35) : nombre de débouchés actifs de chaque point de vente (Map pointVenteId → nombre).
  function nombreDeDebouches({ debouches = [] }) {
    const nombres = new Map();
    for (const d of debouches.filter((d) => !d.supprimeLe)) nombres.set(d.pointVenteId, (nombres.get(d.pointVenteId) || 0) + 1);
    return nombres;
  }

  // ---- Points de vente (EX-22)

  // Par point de vente actif et par mois (celui du jeudi de la semaine) : nombre de séances, chiffre
  // d'affaires, coût des séances et résultat. Le chiffre d'affaires d'un point pris seul va du cas le moins
  // favorable pour lui (production basse, sa demande basse, demande haute des débouchés servis avant lui)
  // au plus favorable (l'inverse) ; la médiane est celle du calcul médian. Ces fourchettes ne s'additionnent
  // pas d'un point de vente à l'autre.
  // R3 (EX-57) : avec une année, les mois de cette année seulement.
  function pointsDeVente(donnees, { annee } = {}) {
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

    const tousLesMois = [...parPoint.values()].flatMap((p) => [...p.mois.keys()]).filter((m) => dansLAnnee(annee, m)).sort();
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
  // R3 (EX-57) : avec une année, les semaines dont le jeudi tombe dans cette année, et les produits qui y ont
  // une offre ou une demande.
  function offreDemande(donnees, { annee } = {}) {
    const parAnnee = annee !== undefined && annee !== null;
    const garder = (lundi) => dansLAnnee(annee, moisDuJeudi(lundi));
    const offre = offreParSemaine(donnees);
    const demande = demandeParSemaine(donnees);
    const lundis = [...offre.values(), ...demande.values()].flatMap((m) => [...m.keys()]).filter(garder).sort();
    const semaines = lundis.length ? semainesEntre(lundis[0], lundis[lundis.length - 1]) : [];
    const present = (parSemaine) => (parAnnee ? Boolean(parSemaine) && [...parSemaine.keys()].some(garder) : Boolean(parSemaine));
    const cultures = (donnees.cultures || []).filter((c) => !c.supprimeLe && (present(offre.get(c.id)) || present(demande.get(c.id))))
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    // Les œufs viennent après les cultures ; leur nom et leur unité sont des textes de l'interface.
    const produits = cultures.map((c) => ({ produitId: c.id, nom: c.nom, unite: c.unite }));
    if (present(offre.get(OEUFS)) || present(demande.get(OEUFS))) produits.push({ produitId: OEUFS, nom: null, unite: null });

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

  // P2 (T35) : bilan de la saison par produit, à partir du résultat de offreDemande — nombre de semaines
  // en excédent et en manque (et combien de chacune sont sûres), à l'équilibre (avec une offre ou une
  // demande non nulle) et sans débouché (avec une production). Une semaine sans offre ni demande ne compte pas.
  function bilanOffreDemande(od) {
    return od.lignes.map((ligne) => {
      const bilan = { produitId: ligne.produitId, depasse: 0, depasseSur: 0, manque: 0, manqueSur: 0, equilibre: 0, sansDebouche: 0 };
      for (const lundi of od.semaines) {
        const s = ligne.semaines[lundi];
        if (s.etat === "depasse" || s.etat === "manque") {
          bilan[s.etat] += 1;
          if (s.sur) bilan[`${s.etat}Sur`] += 1;
        } else if (s.etat === "equilibre") {
          if (s.offre.haute > 0 || s.demande.haute > 0) bilan.equilibre += 1;
        } else if (s.offre.haute > 0) {
          bilan.sansDebouche += 1;
        }
      }
      return bilan;
    });
  }

  return {
    CHAMPS_SURCHARGEABLES,
    OEUFS,
    ajouterJours,
    jourDeLaSemaine,
    lundiDe,
    seancesDatees,
    coutSeance,
    coutDuKm,
    seancesDeLaFerme,
    vehicules,
    offreDemande,
    bilanOffreDemande,
    moisDuJeudi,
    debutsDeMois,
    nombreDeDebouches,
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
    coutsDeCulture,
    coutParM2,
    chargeParMois,
    chargeParAn,
    besoins,
    besoinsParMois,
    surOccupations,
    annees,
    anneeParDefaut,
  };
});
