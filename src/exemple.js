// Ferme d'exemple (La Réunion) : 5 espaces, 7 cultures, 10 plantations sur la saison fraîche,
// d'avril à octobre, la plus favorable au maraîchage (sèche, sans cyclone).
// C'est le seul fichier où figurent des valeurs agronomiques et des prix : ce sont des ordres
// de grandeur pour montrer l'outil, pas des références.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Exemple = fabrique();
})(globalThis, function () {
  "use strict";

  function f(basse, mediane, haute) {
    return { basse, mediane, haute };
  }

  const ESPACES = {
    planche1: { nom: "Planche 1", surface: 30, type: "plein_champ" },
    planche2: { nom: "Planche 2", surface: 30, type: "plein_champ" },
    planche3: { nom: "Planche 3", surface: 30, type: "plein_champ" },
    planche4: { nom: "Planche 4", surface: 30, type: "plein_champ" },
    tunnel: { nom: "Tunnel", surface: 60, type: "abri" },
  };

  const CULTURES = {
    tomate: { nom: "Tomate", famille: "Solanacées", unite: "kg", rendement: f(4, 6, 8), prix: f(2.5, 3, 3.5), joursAvantRecolte: 75, semainesRecolte: 10, pertes: 15 },
    laitue: { nom: "Laitue batavia", famille: "Astéracées", unite: "piece", rendement: f(8, 10, 12), prix: f(0.8, 1, 1.2), joursAvantRecolte: 45, semainesRecolte: 3, pertes: 20 },
    brede: { nom: "Brède chou de Chine", famille: "Brassicacées", unite: "botte", rendement: f(6, 8, 10), prix: f(1, 1.5, 2), joursAvantRecolte: 35, semainesRecolte: 3, pertes: 15 },
    carotte: { nom: "Carotte", famille: "Apiacées", unite: "kg", rendement: f(2.5, 3.5, 4.5), prix: f(2, 2.5, 3), joursAvantRecolte: 90, semainesRecolte: 4, pertes: 15 },
    haricot: { nom: "Haricot vert", famille: "Fabacées", unite: "kg", rendement: f(0.8, 1.2, 1.5), prix: f(4, 5, 6), joursAvantRecolte: 55, semainesRecolte: 5, pertes: 10 },
    courgette: { nom: "Courgette", famille: "Cucurbitacées", unite: "kg", rendement: f(2, 3, 4), prix: f(2, 2.5, 3), joursAvantRecolte: 50, semainesRecolte: 8, pertes: 10 },
    piment: { nom: "Piment", famille: "Solanacées", unite: "kg", rendement: f(0.5, 1, 1.5), prix: f(8, 10, 12), joursAvantRecolte: 90, semainesRecolte: 16, pertes: 10 },
  };

  const SANS_SURCHARGE = { rendement: null, prix: null, joursAvantRecolte: null, semainesRecolte: null, pertes: null };

  const VARIETES = {
    heatmaster: { nom: "Heatmaster", culture: "tomate", ...SANS_SURCHARGE, joursAvantRecolte: 70 },
    blonde: { nom: "Blonde de Paris", culture: "laitue", ...SANS_SURCHARGE },
    pakchoi: { nom: "Pak-choï", culture: "brede", ...SANS_SURCHARGE },
    nantaise: { nom: "Nantaise", culture: "carotte", ...SANS_SURCHARGE },
    contender: { nom: "Contender", culture: "haricot", ...SANS_SURCHARGE },
    blackBeauty: { nom: "Black Beauty", culture: "courgette", ...SANS_SURCHARGE },
    zoizo: { nom: "Zoizo", culture: "piment", ...SANS_SURCHARGE, rendement: f(0.3, 0.6, 1), prix: f(12, 15, 18) },
  };

  // Dates « MM-JJ », placées dans l'année choisie au chargement.
  const PLANTATIONS = [
    { variete: "heatmaster", espace: "tunnel", surface: 30, date: "04-15" },
    { variete: "heatmaster", espace: "tunnel", surface: 30, date: "05-15" },
    { variete: "blackBeauty", espace: "planche1", surface: 30, date: "05-01" },
    { variete: "blonde", espace: "planche2", surface: 15, date: "05-01" },
    { variete: "blonde", espace: "planche2", surface: 15, date: "05-22" },
    { variete: "pakchoi", espace: "planche3", surface: 10, date: "04-01" },
    { variete: "pakchoi", espace: "planche3", surface: 10, date: "06-01" },
    { variete: "nantaise", espace: "planche3", surface: 20, date: "04-15" },
    { variete: "contender", espace: "planche4", surface: 15, date: "05-01" },
    { variete: "zoizo", espace: "planche4", surface: 15, date: "03-15" },
  ];

  // Enregistre la ferme d'exemple dans `ferme` (store ouvert) pour l'année `annee`, et retient
  // les identifiants créés pour pouvoir l'effacer d'un geste.
  function charger(ferme, annee) {
    const ids = { espaces: [], cultures: [], varietes: [], plantations: [] };
    const cree = (objet, champs) => {
      const enregistrement = ferme.ajouter(objet, champs);
      ids[objet].push(enregistrement.id);
      return enregistrement.id;
    };
    const espaces = {};
    for (const [cle, espace] of Object.entries(ESPACES)) espaces[cle] = cree("espaces", espace);
    const cultures = {};
    for (const [cle, culture] of Object.entries(CULTURES)) cultures[cle] = cree("cultures", culture);
    const varietes = {};
    for (const [cle, { culture, ...variete }] of Object.entries(VARIETES)) {
      varietes[cle] = cree("varietes", { ...variete, cultureId: cultures[culture] });
    }
    for (const plantation of PLANTATIONS) {
      cree("plantations", {
        varieteId: varietes[plantation.variete],
        espaceId: espaces[plantation.espace],
        surface: plantation.surface,
        date: `${annee}-${plantation.date}`,
      });
    }
    ferme.noterExemple(ids);
    return ids;
  }

  // Vrai tant qu'un élément de la ferme d'exemple est encore actif.
  function estAffichee(ferme) {
    const ids = ferme.exemple();
    if (!ids) return false;
    return Object.entries(ids).some(([objet, liste]) => liste.some((id) => {
      const enregistrement = ferme.obtenir(objet, id);
      return enregistrement && !enregistrement.supprimeLe;
    }));
  }

  // Efface d'un geste la ferme d'exemple : suppression logique de ce qu'elle a créé, rien d'autre.
  function effacer(ferme) {
    const ids = ferme.exemple();
    if (!ids) return;
    for (const objet of ["plantations", "varietes", "cultures", "espaces"]) {
      for (const id of ids[objet] || []) {
        const enregistrement = ferme.obtenir(objet, id);
        if (enregistrement && !enregistrement.supprimeLe) ferme.supprimer(objet, id);
      }
    }
    ferme.noterExemple(null);
  }

  return { charger, estAffichee, effacer, NOMBRE_DE_PLANTATIONS: PLANTATIONS.length };
});
