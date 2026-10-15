// Ferme d'exemple (La Réunion) — tranche R2 : une ferme maraîchère des hauts de Petite-Île, dans le
// Sud, à mi-pente, du cas type du brief (un maraîcher seul, environ 1,5 ha, 200 poules), qui produit
// toute l'année et vend au marché forain de Saint-Pierre, à celui de Saint-Joseph, en paniers et à une
// épicerie. Chaque valeur agronomique, prix et coût vient du dossier `docs/specs/R2/DONNEES.md`, qui en
// donne les sources (DAAF de La Réunion, ARMEFLHOR, Chambre d'agriculture, CGSS, préfecture…).
// C'est le seul fichier où figurent des valeurs agronomiques et des prix ; ce sont des repères pour
// montrer l'outil, pas des références pour une ferme réelle.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Exemple = fabrique();
})(globalThis, function () {
  "use strict";

  function f(basse, mediane, haute) {
    return { basse, mediane, haute };
  }

  // Les œufs (identifiant de produit des débouchés d'œufs, comme Calc.OEUFS).
  const OEUFS = "oeufs";

  // Espaces : deux tunnels, cinq parcelles de plein champ, la treille de chouchou et la parcelle haute
  // (ail, puis engrais vert). Le reste des 1,5 ha : parcours des poules, engrais verts, chemins, bâtiments.
  const ESPACES = {
    tunnel1: { nom: "Tunnel 1", surface: 200, type: "abri" },
    tunnel2: { nom: "Tunnel 2", surface: 200, type: "abri" },
    parcelle1: { nom: "Parcelle 1", surface: 600, type: "plein_champ" },
    parcelle2: { nom: "Parcelle 2", surface: 600, type: "plein_champ" },
    parcelle3: { nom: "Parcelle 3", surface: 600, type: "plein_champ" },
    parcelle4: { nom: "Parcelle 4", surface: 600, type: "plein_champ" },
    parcelle5: { nom: "Parcelle 5", surface: 600, type: "plein_champ" },
    treille: { nom: "Treille de chouchou", surface: 300, type: "plein_champ" },
    haute: { nom: "Parcelle haute", surface: 500, type: "plein_champ" },
  };

  // Cultures : rendement commercialisable par m² et par cycle (barème des calamités agricoles 2023-2025
  // de la DAAF, issu du référentiel technico-économique de La Réunion), prix de détail sur les marchés
  // forains (mercuriales de la DAAF), délais et durées de récolte, pertes.
  const CULTURES = {
    tomate: { nom: "Tomate", famille: "Solanacées", unite: "kg", rendement: f(8, 12, 16), prix: f(2, 3.5, 7.5), joursAvantRecolte: 70, semainesRecolte: 11, pertes: 15 },
    salade: { nom: "Salade batavia", famille: "Astéracées", unite: "piece", rendement: f(6.5, 9, 11), prix: f(1, 1.15, 1.5), joursAvantRecolte: 42, semainesRecolte: 2, pertes: 20 },
    brede: { nom: "Brède petsaï", famille: "Brassicacées", unite: "botte", rendement: f(2, 3, 4), prix: f(1, 1.25, 2.2), joursAvantRecolte: 40, semainesRecolte: 2, pertes: 20 },
    chou: { nom: "Chou pommé", famille: "Brassicacées", unite: "piece", rendement: f(2, 3, 4), prix: f(1, 1.85, 3.5), joursAvantRecolte: 85, semainesRecolte: 3, pertes: 15 },
    carotte: { nom: "Carotte", famille: "Apiacées", unite: "kg", rendement: f(2, 3, 4), prix: f(2.3, 2.7, 3.5), joursAvantRecolte: 105, semainesRecolte: 3, pertes: 15 },
    haricot: { nom: "Haricot vert", famille: "Fabacées", unite: "kg", rendement: f(0.6, 0.9, 1.2), prix: f(5, 5.5, 7), joursAvantRecolte: 60, semainesRecolte: 4, pertes: 20 },
    courgette: { nom: "Courgette", famille: "Cucurbitacées", unite: "kg", rendement: f(1.5, 2, 3), prix: f(1.5, 2, 4.1), joursAvantRecolte: 50, semainesRecolte: 6, pertes: 20 },
    concombre: { nom: "Concombre", famille: "Cucurbitacées", unite: "piece", rendement: f(20, 30, 50), prix: f(0.75, 1.17, 3), joursAvantRecolte: 40, semainesRecolte: 6, pertes: 20 },
    piment: { nom: "Piment", famille: "Solanacées", unite: "kg", rendement: f(0.5, 0.8, 1.1), prix: f(12.5, 19, 25), joursAvantRecolte: 105, semainesRecolte: 26, pertes: 15 },
    chouchou: { nom: "Chouchou", famille: "Cucurbitacées", unite: "kg", rendement: f(3.9, 5, 6.7), prix: f(1, 1.5, 5.5), joursAvantRecolte: 105, semainesRecolte: 35, pertes: 20 },
    ail: { nom: "Ail péi", famille: "Amaryllidacées", unite: "kg", rendement: f(0.3, 0.6, 0.8), prix: f(15, 20, 25), joursAvantRecolte: 150, semainesRecolte: 8, pertes: 20 },
  };

  // Coûts de mise en place : semis ou plants, graines ou plants par m², prix d'une graine ou d'un plant,
  // intrants (engrais, amendements, traitements) en € par m² et par cycle.
  const INTRANTS = f(0.08, 0.12, 0.19);
  const COUTS = {
    tomate: { implantation: "plant", densite: 2.5, prixUnite: f(0.29, 0.39, 0.55), intrants: INTRANTS },
    salade: { implantation: "plant", densite: 11, prixUnite: f(0.074, 0.087, 0.12), intrants: INTRANTS },
    brede: { implantation: "plant", densite: 10, prixUnite: f(0.074, 0.087, 0.12), intrants: INTRANTS },
    chou: { implantation: "plant", densite: 4, prixUnite: f(0.13, 0.18, 0.32), intrants: INTRANTS },
    carotte: { implantation: "semis", densite: 150, prixUnite: f(0.0019, 0.0029, 0.0038), intrants: INTRANTS },
    haricot: { implantation: "semis", densite: 25, prixUnite: f(0.004, 0.006, 0.008), intrants: INTRANTS },
    courgette: { implantation: "plant", densite: 1, prixUnite: f(0.29, 0.39, 0.55), intrants: INTRANTS },
    concombre: { implantation: "plant", densite: 1.6, prixUnite: f(0.29, 0.39, 0.55), intrants: INTRANTS },
    piment: { implantation: "plant", densite: 2, prixUnite: f(0.29, 0.39, 0.55), intrants: INTRANTS },
    chouchou: { implantation: "plant", densite: 0.15, prixUnite: f(0.4, 0.6, 2.2), intrants: f(0.15, 0.24, 0.38) },
    ail: { implantation: "plant", densite: 33, prixUnite: f(0.06, 0.08, 0.1), intrants: INTRANTS },
  };

  const SANS_SURCHARGE = { rendement: null, prix: null, joursAvantRecolte: null, semainesRecolte: null, pertes: null };

  // Variétés cultivées à La Réunion ; Goldorac, laitue d'été à récolte étalée, se récolte une semaine de plus.
  const VARIETES = {
    heatmaster: { nom: "Heatmaster", culture: "tomate", ...SANS_SURCHARGE },
    goldorac: { nom: "Goldorac", culture: "salade", ...SANS_SURCHARGE, semainesRecolte: 3 },
    petsai: { nom: "Petsaï", culture: "brede", ...SANS_SURCHARGE },
    farao: { nom: "Farao F1", culture: "chou", ...SANS_SURCHARGE },
    nantaise: { nom: "Nantaise", culture: "carotte", ...SANS_SURCHARGE },
    nain: { nom: "Haricot nain", culture: "haricot", ...SANS_SURCHARGE },
    sofia: { nom: "Sofia F1", culture: "courgette", ...SANS_SURCHARGE },
    lambert: { nom: "Lambert", culture: "concombre", ...SANS_SURCHARGE },
    zoizo: { nom: "Zoizo", culture: "piment", ...SANS_SURCHARGE },
    chouchouPei: { nom: "Chouchou péi", culture: "chouchou", ...SANS_SURCHARGE },
    vacoa: { nom: "Vacoa", culture: "ail", ...SANS_SURCHARGE },
  };

  // Dates « MM-JJ », placées dans l'année choisie au chargement.
  const PLANTATIONS = [
    // Tunnels : tomate presque toute l'année (deux cycles par tunnel), concombre et courgette à côté. Toutes les
    // récoltes finissent dans l'année : après le 31 décembre, aucune séance ne les vendrait.
    { variete: "heatmaster", espace: "tunnel1", surface: 120, date: "01-10" },
    { variete: "heatmaster", espace: "tunnel1", surface: 120, date: "06-10" },
    { variete: "heatmaster", espace: "tunnel2", surface: 120, date: "03-01" },
    { variete: "heatmaster", espace: "tunnel2", surface: 120, date: "08-01" },
    { variete: "lambert", espace: "tunnel1", surface: 15, date: "01-10" },
    { variete: "lambert", espace: "tunnel1", surface: 15, date: "04-10" },
    { variete: "lambert", espace: "tunnel2", surface: 15, date: "10-01" },
    { variete: "sofia", espace: "tunnel2", surface: 60, date: "02-01" },
    { variete: "sofia", espace: "tunnel1", surface: 60, date: "09-01" },
    // Salades et brèdes : une plantation toutes les trois semaines, de janvier à octobre (Goldorac, laitue d'été).
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "01-05" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "01-26" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "02-16" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "03-09" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "03-30" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "04-20" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "05-11" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "06-01" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "06-22" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "07-13" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "08-03" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "08-24" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "09-14" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "10-05" },
    { variete: "goldorac", espace: "parcelle1", surface: 40, date: "10-26" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "01-08" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "01-29" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "02-19" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "03-12" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "04-02" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "04-23" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "05-14" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "06-04" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "06-25" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "07-16" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "08-06" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "08-27" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "09-17" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "10-08" },
    { variete: "petsai", espace: "parcelle2", surface: 80, date: "10-29" },
    // Saison fraîche en plein champ : choux, carottes, haricots, courgette.
    { variete: "farao", espace: "parcelle3", surface: 80, date: "04-01" },
    { variete: "farao", espace: "parcelle3", surface: 80, date: "06-01" },
    { variete: "farao", espace: "parcelle3", surface: 80, date: "08-01" },
    { variete: "nantaise", espace: "parcelle4", surface: 100, date: "03-15" },
    { variete: "nantaise", espace: "parcelle4", surface: 100, date: "05-15" },
    { variete: "nantaise", espace: "parcelle4", surface: 100, date: "07-15" },
    { variete: "nain", espace: "parcelle5", surface: 150, date: "04-15" },
    { variete: "nain", espace: "parcelle5", surface: 150, date: "08-01" },
    { variete: "sofia", espace: "parcelle3", surface: 100, date: "05-15" },
    // Cultures longues : piment, chouchou, ail.
    { variete: "zoizo", espace: "parcelle5", surface: 40, date: "03-01" },
    { variete: "chouchouPei", espace: "treille", surface: 300, date: "01-15" },
    { variete: "vacoa", espace: "haute", surface: 300, date: "04-25" },
  ];

  // La fourgonnette de la ferme (utilitaire compact diesel) : consommation, prix réglementé du gazole,
  // frais au km hors carburant (entretien, pneus, assurance, usure).
  const VEHICULES = {
    fourgonnette: { nom: "Fourgonnette", consommation: f(6, 7, 8.5), prixLitre: f(1.25, 1.55, 1.85), fraisKm: f(0.15, 0.25, 0.4) },
  };

  // Points de vente : distance aller depuis la ferme ; le coût du km saisi ne sert que si le véhicule
  // est supprimé (même valeur que celle de la fourgonnette).
  const COUT_KM = f(0.23, 0.36, 0.56);
  const POINTS_VENTE = {
    saintPierre: { nom: "Marché forain de Saint-Pierre", distanceKm: 13, coutKm: COUT_KM, vehicule: "fourgonnette" },
    saintJoseph: { nom: "Marché forain de Saint-Joseph", distanceKm: 13, coutKm: COUT_KM, vehicule: "fourgonnette" },
    paniers: { nom: "Paniers de l'AMAPéi", distanceKm: 12, coutKm: COUT_KM, vehicule: "fourgonnette" },
    epicerie: { nom: "Épicerie de Saint-Pierre", distanceKm: 12, coutKm: COUT_KM, vehicule: "fourgonnette" },
  };

  // Une séance par semaine et par point de vente, toute l'année : jour (1 = lundi … 7 = dimanche),
  // frais par séance (droit de place).
  const SEANCES = [
    { point: "saintPierre", jour: 6, debut: "01-01", fin: "12-31", frais: f(12, 15, 20) },
    { point: "saintJoseph", jour: 5, debut: "01-01", fin: "12-31", frais: f(5, 10, 15) },
    { point: "paniers", jour: 4, debut: "01-01", fin: "12-31", frais: f(0, 0, 0) },
    { point: "epicerie", jour: 2, debut: "01-01", fin: "12-31", frais: f(0, 0, 0) },
  ];

  // Débouchés : prix et volume vendable par séance. Marché : prix de détail forain ; paniers : prix de
  // détail médian ; épicerie : prix payé au producteur (marché de gros de Saint-Pierre).
  const DEBOUCHES = [
    { point: "saintPierre", produit: "tomate", prix: f(2, 3.5, 7.5), volumeParSeance: f(15, 30, 60) },
    { point: "saintPierre", produit: "salade", prix: f(1, 1.15, 1.5), volumeParSeance: f(20, 40, 80) },
    { point: "saintPierre", produit: "brede", prix: f(1, 1.25, 2.2), volumeParSeance: f(15, 30, 60) },
    { point: "saintPierre", produit: "chou", prix: f(1, 1.85, 3.5), volumeParSeance: f(10, 20, 40) },
    { point: "saintPierre", produit: "carotte", prix: f(2.3, 2.7, 3.5), volumeParSeance: f(10, 20, 40) },
    { point: "saintPierre", produit: "haricot", prix: f(5, 5.5, 7), volumeParSeance: f(4, 8, 15) },
    { point: "saintPierre", produit: "courgette", prix: f(1.5, 2, 4.1), volumeParSeance: f(8, 15, 30) },
    { point: "saintPierre", produit: "concombre", prix: f(0.75, 1.17, 3), volumeParSeance: f(12, 25, 50) },
    { point: "saintPierre", produit: "piment", prix: f(12.5, 19, 25), volumeParSeance: f(0.2, 0.5, 1) },
    { point: "saintPierre", produit: "chouchou", prix: f(1, 1.5, 5.5), volumeParSeance: f(10, 25, 50) },
    { point: "saintPierre", produit: OEUFS, prix: f(0.35, 0.45, 0.53), volumeParSeance: f(150, 300, 600) },
    { point: "saintJoseph", produit: "tomate", prix: f(2, 3.5, 7.5), volumeParSeance: f(8, 15, 30) },
    { point: "saintJoseph", produit: "salade", prix: f(1, 1.15, 1.5), volumeParSeance: f(10, 20, 40) },
    { point: "saintJoseph", produit: "brede", prix: f(1, 1.25, 2.2), volumeParSeance: f(8, 15, 30) },
    { point: "saintJoseph", produit: "chou", prix: f(1, 1.85, 3.5), volumeParSeance: f(5, 10, 20) },
    { point: "saintJoseph", produit: "carotte", prix: f(2.3, 2.7, 3.5), volumeParSeance: f(5, 10, 20) },
    { point: "saintJoseph", produit: "haricot", prix: f(5, 5.5, 7), volumeParSeance: f(2, 4, 8) },
    { point: "saintJoseph", produit: "courgette", prix: f(1.5, 2, 4.1), volumeParSeance: f(4, 8, 15) },
    { point: "saintJoseph", produit: "concombre", prix: f(0.75, 1.17, 3), volumeParSeance: f(6, 12, 25) },
    { point: "saintJoseph", produit: "piment", prix: f(12.5, 19, 25), volumeParSeance: f(0.1, 0.25, 0.5) },
    { point: "saintJoseph", produit: "chouchou", prix: f(1, 1.5, 5.5), volumeParSeance: f(5, 12, 25) },
    { point: "saintJoseph", produit: OEUFS, prix: f(0.35, 0.45, 0.53), volumeParSeance: f(75, 150, 300) },
    { point: "paniers", produit: "tomate", prix: f(3.5, 3.5, 3.5), volumeParSeance: f(20, 35, 60) },
    { point: "paniers", produit: "salade", prix: f(1.15, 1.15, 1.15), volumeParSeance: f(20, 35, 60) },
    { point: "paniers", produit: "brede", prix: f(1.25, 1.25, 1.25), volumeParSeance: f(20, 35, 60) },
    { point: "paniers", produit: "carotte", prix: f(2.7, 2.7, 2.7), volumeParSeance: f(10, 17.5, 30) },
    { point: "paniers", produit: "chou", prix: f(1.85, 1.85, 1.85), volumeParSeance: f(10, 17.5, 30) },
    { point: "paniers", produit: "haricot", prix: f(5.5, 5.5, 5.5), volumeParSeance: f(5, 8.75, 15) },
    { point: "paniers", produit: "courgette", prix: f(2, 2, 2), volumeParSeance: f(10, 17.5, 30) },
    { point: "paniers", produit: "chouchou", prix: f(1.5, 1.5, 1.5), volumeParSeance: f(20, 35, 60) },
    { point: "paniers", produit: OEUFS, prix: f(0.5, 0.5, 0.5), volumeParSeance: f(120, 210, 360) },
    { point: "epicerie", produit: "tomate", prix: f(1.5, 2.5, 4), volumeParSeance: f(10, 20, 40) },
    { point: "epicerie", produit: "salade", prix: f(0.5, 0.75, 0.8), volumeParSeance: f(8, 15, 30) },
    { point: "epicerie", produit: "brede", prix: f(0.9, 1, 1.45), volumeParSeance: f(5, 10, 20) },
    { point: "epicerie", produit: "carotte", prix: f(1.75, 2, 2.5), volumeParSeance: f(10, 20, 40) },
    { point: "epicerie", produit: "chou", prix: f(1.2, 1.75, 3), volumeParSeance: f(5, 10, 20) },
    { point: "epicerie", produit: "haricot", prix: f(2, 2.5, 4), volumeParSeance: f(2, 4, 8) },
    { point: "epicerie", produit: "piment", prix: f(9, 10, 12), volumeParSeance: f(0.2, 0.5, 1) },
  ];

  // Deux lots de 100 poules décalés de six mois, pour avoir des œufs toute l'année sans jamais dépasser
  // 200 poules (vente directe sans centre d'emballage sous 250 poules). Le lot d'octobre, arrivé l'année
  // précédente, pond dès janvier et part à la réforme mi-novembre ; le lot d'avril pond jusqu'à la fin
  // de l'année (sa réforme tombe en mai de l'année suivante).
  const LOT = { ponte: f(0.66, 0.72, 0.8), pertes: 6, aliment: f(105, 115, 130), prixAliment: f(0.6, 0.8, 1), prixOeuf: f(0.3, 0.35, 0.45) };
  const LOTS = [
    { nom: "Lot d'octobre (arrivé l'an passé)", effectif: 100, arrivee: "01-01", debutPonte: "01-01", reforme: "11-15", ...LOT },
    { nom: "Lot d'avril", effectif: 100, arrivee: "04-06", debutPonte: "04-27", reforme: "12-31", ...LOT },
  ];

  // Charges fixes de la ferme : cotisations sociales (CGSS Réunion), assurance, eau, électricité,
  // fermage, comptabilité, amortissements, et l'achat des poulettes des deux lots.
  const CHARGES = [
    { nom: "Cotisations sociales de l'exploitant (CGSS)", montant: f(800, 1650, 2750), periodicite: "an" },
    { nom: "Assurance de l'exploitation", montant: f(400, 900, 1800), periodicite: "an" },
    { nom: "Eau d'irrigation (périmètre du Sud)", montant: f(130, 340, 600), periodicite: "an" },
    { nom: "Eau du réseau (lavage, poules)", montant: f(80, 220, 410), periodicite: "an" },
    { nom: "Électricité", montant: f(30, 55, 95), periodicite: "mois" },
    { nom: "Fermage", montant: f(200, 450, 900), periodicite: "an" },
    { nom: "Comptabilité", montant: f(200, 900, 2000), periodicite: "an" },
    { nom: "Amortissement du matériel et de l'irrigation", montant: f(1000, 3200, 7000), periodicite: "an" },
    { nom: "Amortissement des tunnels", montant: f(1800, 3320, 6680), periodicite: "an" },
    { nom: "Achat des poulettes", montant: f(1700, 2210, 3100), periodicite: "an" },
  ];

  // Enregistre la ferme d'exemple dans `ferme` (store ouvert) pour l'année `annee`, et retient
  // les identifiants créés pour pouvoir l'effacer d'un geste.
  function charger(ferme, annee) {
    const ids = { espaces: [], cultures: [], varietes: [], plantations: [], pointsVente: [], seances: [], debouches: [], lots: [], vehicules: [], charges: [] };
    const cree = (objet, champs) => {
      const enregistrement = ferme.ajouter(objet, champs);
      ids[objet].push(enregistrement.id);
      return enregistrement.id;
    };
    const espaces = {};
    for (const [cle, espace] of Object.entries(ESPACES)) espaces[cle] = cree("espaces", espace);
    const cultures = {};
    for (const [cle, culture] of Object.entries(CULTURES)) cultures[cle] = cree("cultures", { ...culture, ...COUTS[cle] });
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
    const vehicules = {};
    for (const [cle, vehicule] of Object.entries(VEHICULES)) vehicules[cle] = cree("vehicules", vehicule);
    const points = {};
    for (const [cle, { vehicule, ...point }] of Object.entries(POINTS_VENTE)) points[cle] = cree("pointsVente", { ...point, vehiculeId: vehicules[vehicule] });
    for (const { point, debut, fin, ...seance } of SEANCES) {
      cree("seances", { ...seance, pointVenteId: points[point], debut: `${annee}-${debut}`, fin: `${annee}-${fin}` });
    }
    for (const { point, produit, ...debouche } of DEBOUCHES) {
      cree("debouches", { ...debouche, pointVenteId: points[point], produitId: produit === OEUFS ? OEUFS : cultures[produit] });
    }
    for (const { arrivee, debutPonte, reforme, ...lot } of LOTS) {
      cree("lots", { ...lot, arrivee: `${annee}-${arrivee}`, debutPonte: `${annee}-${debutPonte}`, reforme: `${annee}-${reforme}` });
    }
    for (const charge of CHARGES) cree("charges", charge);
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
    for (const objet of ["charges", "lots", "debouches", "seances", "pointsVente", "vehicules", "plantations", "varietes", "cultures", "espaces"]) {
      for (const id of ids[objet] || []) {
        const enregistrement = ferme.obtenir(objet, id);
        if (enregistrement && !enregistrement.supprimeLe) ferme.supprimer(objet, id);
      }
    }
    ferme.noterExemple(null);
  }

  return { charger, estAffichee, effacer, NOMBRE_DE_PLANTATIONS: PLANTATIONS.length };
});
