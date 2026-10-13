// Logique de calcul pure (dates, répartition hebdomadaire, tableau économique).
// Invariant calcul_sans_dom : ce module s'exécute sous Node, sans navigateur.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Calc = fabrique();
})(globalThis, function () {
  "use strict";

  // Champs numériques de la culture qu'une variété peut surcharger (SPEC, objet Variété).
  const CHAMPS_SURCHARGEABLES = ["rendement", "prix", "joursAvantRecolte", "semainesRecolte", "pertes"];
  const JOUR_MS = 24 * 3600 * 1000;

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

  // ---- Fourchettes : { basse, mediane, haute }

  function fourchetteNulle() {
    return { basse: 0, mediane: 0, haute: 0 };
  }

  function somme(a, b) {
    return { basse: a.basse + b.basse, mediane: a.mediane + b.mediane, haute: a.haute + b.haute };
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

  // Volume, CA (volume × prix) et marge (égale au CA en N1) par culture et par mois, en fourchette.
  // Le CA se calcule plantation par plantation, au prix de sa variété. Seuls comptent les
  // enregistrements actifs dont la variété et la culture sont actives.
  function tableau(donnees) {
    const parCulture = new Map();

    for (const { plantation, culture, p } of plantationsCalculables(donnees)) {
      if (!parCulture.has(culture.id)) parCulture.set(culture.id, { culture, mois: new Map() });
      const parMois = parCulture.get(culture.id).mois;
      for (const semaine of productionHebdomadaire(plantation, p)) {
        const mois = moisDeLaSemaine(semaine);
        if (!parMois.has(mois)) parMois.set(mois, caseVide());
        ajouterA(parMois.get(mois), semaine.volume, produit(semaine.volume, p.prix));
      }
    }

    const tousLesMois = [...parCulture.values()].flatMap((c) => [...c.mois.keys()]).sort();
    const mois = tousLesMois.length ? moisEntre(tousLesMois[0], tousLesMois[tousLesMois.length - 1]) : [];
    const avecMarge = (c) => ({ volume: c.volume, ca: c.ca, marge: { ...c.ca } });
    const totalFerme = { mois: {}, total: caseVide() };
    for (const m of mois) totalFerme.mois[m] = caseVide();

    const lignes = [...parCulture.values()]
      .sort((a, b) => a.culture.nom.localeCompare(b.culture.nom, "fr"))
      .map(({ culture, mois: parMois }) => {
        const ligne = { cultureId: culture.id, nom: culture.nom, unite: culture.unite, mois: {}, total: caseVide() };
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

    // Le total de la ferme additionne des unités différentes : seuls le CA et la marge y ont un sens.
    const sansVolume = (c) => ({ ca: c.ca, marge: { ...c.ca } });
    const total = { mois: {}, total: sansVolume(totalFerme.total) };
    for (const m of mois) total.mois[m] = sansVolume(totalFerme.mois[m]);

    return { mois, lignes, total };
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

  return {
    CHAMPS_SURCHARGEABLES,
    ajouterJours,
    jourDeLaSemaine,
    seancesDatees,
    coutSeance,
    seancesDeLaFerme,
    parametres,
    datesRecolte,
    productionTotale,
    productionSurPeriode,
    productionHebdomadaire,
    tableau,
    surOccupations,
  };
});
