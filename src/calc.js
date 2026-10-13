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

  return {
    CHAMPS_SURCHARGEABLES,
    ajouterJours,
    parametres,
    datesRecolte,
    productionTotale,
    productionSurPeriode,
    productionHebdomadaire,
  };
});
