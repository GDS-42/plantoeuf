// Lecture et écriture des données de la ferme dans le navigateur.
// Le stockage est injecté : localStorage dans le fichier HTML, un substitut en mémoire
// dans les tests. Seules getItem et setItem sont utilisées.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Store = fabrique();
})(globalThis, function () {
  "use strict";

  const CLE = "plantoeuf";
  const APPLICATION = "plantoeuf";
  // Version du format enregistré et exporté. L'import accepte les versions précédentes (MIGRATIONS).
  const VERSION = 4;
  // EX-08 : délai sans export, en jours, au-delà duquel un rappel s'affiche si des données ont changé.
  const DELAI_RAPPEL_JOURS = 7;
  const JOUR_MS = 24 * 3600 * 1000;
  // MIGRATIONS[n] transforme un fichier de version n en version n + 1.
  const MIGRATIONS = {
    // Version 2 (N2) : points de vente, séances et débouchés. Un fichier de N1 n'en a pas ; ceux qu'un
    // fichier de version 1 porterait déjà (exporté pendant la construction de N2) sont gardés.
    1: (fichier) => ({
      ...fichier,
      version: 2,
      pointsVente: fichier.pointsVente || [],
      seances: fichier.seances || [],
      debouches: fichier.debouches || [],
    }),
    // Version 3 (S3) : lots de poules.
    2: (fichier) => ({ ...fichier, version: 3, lots: fichier.lots || [] }),
    // Version 4 (R1) : véhicules.
    3: (fichier) => ({ ...fichier, version: 4, vehicules: fichier.vehicules || [] }),
  };
  // Les objets du modèle : ceux de N1 (SPEC N1, « Modèle de données du noyau »), ceux de N2
  // (points de vente, séances, débouchés), ceux de S3 (lots de poules), puis ceux de R1 (véhicules).
  // Un fichier qui n'a pas une liste la reçoit vide.
  const OBJETS = ["espaces", "cultures", "varietes", "plantations", "pointsVente", "seances", "debouches", "lots", "vehicules"];
  // Dates d'un enregistrement qui se suivent, dans l'ordre (un même jour est permis).
  const DATES_ORDONNEES = { lots: ["arrivee", "debutPonte", "reforme"] };
  // Champs tenus par le store, jamais par la saisie.
  const CHAMPS_SYSTEME = ["id", "creeLe", "modifieLe", "supprimeLe"];

  function erreur(code, message) {
    const e = new Error(message);
    e.code = code;
    return e;
  }

  function copie(valeur) {
    return JSON.parse(JSON.stringify(valeur));
  }

  // UUID version 4. crypto.randomUUID n'existe que dans un contexte sécurisé :
  // getRandomValues sert de repli.
  function nouvelId() {
    const c = globalThis.crypto;
    if (typeof c.randomUUID === "function") return c.randomUUID();
    const octets = c.getRandomValues(new Uint8Array(16));
    octets[6] = (octets[6] & 0x0f) | 0x40;
    octets[8] = (octets[8] & 0x3f) | 0x80;
    const h = Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  function verifierDates(objet, enregistrement) {
    const dates = (DATES_ORDONNEES[objet] || []).map((champ) => enregistrement[champ]).filter(Boolean);
    if (dates.some((date, i) => i > 0 && date < dates[i - 1])) {
      throw erreur("dates_desordonnees", "Les dates ne se suivent pas dans l'ordre.");
    }
  }

  // ---- Fourchettes : { basse, mediane, haute }

  // Invariant fourchette_ordonnee : basse ≤ médiane ≤ haute.
  function fourchetteOrdonnee(f) {
    return f.basse <= f.mediane && f.mediane <= f.haute;
  }

  // fourchette(3) → 3 / 3 / 3 : un seul nombre remplit les trois valeurs.
  // fourchette(2, 2.5, 3) → 2 / 2,5 / 3. Toute autre forme est refusée.
  function fourchette(...valeurs) {
    if (valeurs.length === 1) valeurs = [valeurs[0], valeurs[0], valeurs[0]];
    if (valeurs.length !== 3 || !valeurs.every(Number.isFinite)) {
      throw erreur("fourchette_invalide", "Une fourchette s'écrit avec un nombre ou trois.");
    }
    const [basse, mediane, haute] = valeurs;
    const f = { basse, mediane, haute };
    if (!fourchetteOrdonnee(f)) {
      throw erreur("fourchette_desordonnee", "Une fourchette va de la valeur basse à la valeur haute.");
    }
    return f;
  }

  // Nombre saisi à la française : virgule décimale, espaces ignorés. NaN si illisible.
  function lireNombre(texte) {
    const brut = String(texte).replace(/\s/g, "").replace(",", ".");
    return /^-?(\d+(\.\d*)?|\.\d+)$/.test(brut) ? Number(brut) : Number.NaN;
  }

  // Saisie d'une fourchette : « 3 », « 2,5 » ou « 2 / 2,5 / 3 ». Vide → null.
  function lireFourchette(texte) {
    const brut = String(texte).trim();
    if (brut === "") return null;
    return fourchette(...brut.split("/").map(lireNombre));
  }

  // R1 (EX-39) : date saisie jour, mois, année — « 15/03/2026 », « 15-3-26 », « 15.03.2026 »,
  // huit chiffres « 15032026 » (clavier numérique d'un téléphone) ou ISO « 2026-03-15 ».
  // Rend la date ISO enregistrée (AAAA-MM-JJ) ; vide → null ; date illisible ou impossible → date_invalide.
  function lireDate(texte) {
    const brut = String(texte ?? "").trim();
    if (brut === "") return null;
    let morceaux = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(brut);
    let jour, mois, annee;
    if (morceaux) [, annee, mois, jour] = morceaux;
    else if ((morceaux = /^(\d{2})(\d{2})(\d{4})$/.exec(brut))) [, jour, mois, annee] = morceaux;
    else if ((morceaux = /^(\d{1,2})[/.\s-]+(\d{1,2})[/.\s-]+(\d{2}|\d{4})$/.exec(brut))) [, jour, mois, annee] = morceaux;
    else throw erreur("date_invalide", "Une date s'écrit jour/mois/année.");
    [jour, mois, annee] = [Number(jour), Number(mois), Number(annee)];
    if (annee < 100) annee += 2000;
    const date = new Date(Date.UTC(annee, mois - 1, jour));
    if (date.getUTCFullYear() !== annee || date.getUTCMonth() !== mois - 1 || date.getUTCDate() !== jour) {
      throw erreur("date_invalide", "Cette date n'existe pas.");
    }
    return date.toISOString().slice(0, 10);
  }

  // R1 (EX-40) : une date enregistrée (ISO), écrite jour/mois/année dans un champ de saisie.
  function ecrireDate(iso) {
    if (!iso) return "";
    const [annee, mois, jour] = String(iso).split("-");
    return `${jour}/${mois}/${annee}`;
  }

  function estFourchette(valeur) {
    return valeur !== null && typeof valeur === "object" &&
      "basse" in valeur && "mediane" in valeur && "haute" in valeur;
  }

  // ---- Ferme enregistrée

  function lire(stockage) {
    const brut = stockage.getItem(CLE);
    const enregistre = brut ? JSON.parse(brut) : {};
    const donnees = { version: VERSION };
    for (const objet of OBJETS) donnees[objet] = Array.isArray(enregistre[objet]) ? enregistre[objet] : [];
    // État propre à ce navigateur, jamais exporté : dernier export, première modification non exportée,
    // identifiants de la ferme d'exemple chargée (EX-10).
    donnees.etat = { dernierExport: null, nonExporteDepuis: null, exemple: null, ...enregistre.etat };
    return donnees;
  }

  // Vérifie un fichier importé et le met à la version courante ; refuse sans rien changer sinon.
  function verifierImport(fichier) {
    if (!fichier || typeof fichier !== "object" || fichier.application !== APPLICATION) {
      throw erreur("import_invalide", "Ce fichier n'est pas un export plantoeuf.");
    }
    if (!Number.isInteger(fichier.version) || fichier.version < 1) throw erreur("import_invalide", "Version absente.");
    if (fichier.version > VERSION) throw erreur("import_version", "Fichier d'une version plus récente.");
    let migre = copie(fichier);
    for (let version = migre.version; version < VERSION; version++) migre = MIGRATIONS[version](migre);
    for (const objet of OBJETS) {
      const liste = migre[objet] === undefined ? [] : migre[objet];
      const valide = Array.isArray(liste) && liste.every((e) => e && typeof e === "object" && typeof e.id === "string");
      if (!valide) throw erreur("import_invalide", `Liste illisible : ${objet}`);
      for (const enregistrement of liste) {
        for (const valeur of Object.values(enregistrement)) {
          if (estFourchette(valeur)) fourchette(valeur.basse, valeur.mediane, valeur.haute);
        }
        verifierDates(objet, enregistrement);
      }
      migre[objet] = liste;
    }
    return migre;
  }

  // Ouvre la ferme enregistrée dans `stockage`, ou une ferme vide s'il n'y en a pas.
  // options.horloge : fonction qui rend la date courante (injectée par les tests).
  function ouvrir(stockage, options = {}) {
    const horloge = options.horloge || (() => new Date());
    const donnees = lire(stockage);

    function maintenant() {
      return horloge().toISOString();
    }

    function enregistrer() {
      stockage.setItem(CLE, JSON.stringify(donnees));
    }

    // Toute écriture de données date la première modification non exportée.
    function enregistrerModification() {
      if (!donnees.etat.nonExporteDepuis) donnees.etat.nonExporteDepuis = maintenant();
      enregistrer();
    }

    function collection(objet) {
      if (!OBJETS.includes(objet)) throw erreur("objet_inconnu", `Objet absent du modèle : ${objet}`);
      return donnees[objet];
    }

    function trouver(objet, id) {
      const enregistrement = collection(objet).find((e) => e.id === id);
      if (!enregistrement) throw erreur("introuvable", `${objet} : ${id} introuvable`);
      return enregistrement;
    }

    // Champs saisis, sans les champs du store ; refuse une fourchette désordonnée.
    function saisie(champs) {
      const propres = copie(champs);
      for (const champ of CHAMPS_SYSTEME) delete propres[champ];
      for (const valeur of Object.values(propres)) {
        if (estFourchette(valeur)) fourchette(valeur.basse, valeur.mediane, valeur.haute);
      }
      return propres;
    }

    function lister(objet, { avecSupprimes = false } = {}) {
      return copie(collection(objet).filter((e) => avecSupprimes || !e.supprimeLe));
    }

    function obtenir(objet, id) {
      const enregistrement = collection(objet).find((e) => e.id === id);
      return enregistrement ? copie(enregistrement) : null;
    }

    function ajouter(objet, champs) {
      const liste = collection(objet);
      const instant = maintenant();
      const enregistrement = { id: nouvelId(), ...saisie(champs), creeLe: instant, modifieLe: instant, supprimeLe: null };
      verifierDates(objet, enregistrement);
      liste.push(enregistrement);
      enregistrerModification();
      return copie(enregistrement);
    }

    function modifier(objet, id, champs) {
      const enregistrement = trouver(objet, id);
      const propres = saisie(champs);
      verifierDates(objet, { ...enregistrement, ...propres });
      Object.assign(enregistrement, propres, { modifieLe: maintenant() });
      enregistrerModification();
      return copie(enregistrement);
    }

    // Suppression logique seulement : l'enregistrement reste, daté.
    function supprimer(objet, id) {
      const enregistrement = trouver(objet, id);
      if (!enregistrement.supprimeLe) {
        const instant = maintenant();
        enregistrement.supprimeLe = instant;
        enregistrement.modifieLe = instant;
        enregistrerModification();
      }
      return copie(enregistrement);
    }

    // EX-07 : toute la ferme, éléments supprimés compris, dans un document versionné.
    function exporter() {
      const instant = maintenant();
      const fichier = { application: APPLICATION, version: VERSION, exporteLe: instant };
      for (const objet of OBJETS) fichier[objet] = copie(donnees[objet]);
      donnees.etat.dernierExport = instant;
      donnees.etat.nonExporteDepuis = null;
      enregistrer();
      return fichier;
    }

    // EX-07 : remplace toute la ferme par celle du fichier, telle quelle. Les données importées
    // sont celles d'un fichier que l'utilisateur détient déjà : rien n'est à exporter.
    function importer(fichier) {
      const migre = verifierImport(fichier);
      for (const objet of OBJETS) donnees[objet] = migre[objet];
      donnees.etat.nonExporteDepuis = null;
      donnees.etat.exemple = null;
      enregistrer();
    }

    // EX-10 : identifiants créés par la ferme d'exemple, par objet (null si aucune).
    function noterExemple(ids) {
      donnees.etat.exemple = ids ? copie(ids) : null;
      enregistrer();
    }

    function exemple() {
      return donnees.etat.exemple ? copie(donnees.etat.exemple) : null;
    }

    // EX-08 : vrai si des données ont changé sans être exportées et que le dernier export
    // (ou, faute d'export, la première modification) date d'au moins DELAI_RAPPEL_JOURS jours.
    function rappelExport() {
      const { dernierExport, nonExporteDepuis } = donnees.etat;
      if (!nonExporteDepuis) return false;
      const depuis = Date.parse(dernierExport || nonExporteDepuis);
      return horloge().getTime() - depuis >= DELAI_RAPPEL_JOURS * JOUR_MS;
    }

    return {
      lister,
      obtenir,
      ajouter,
      modifier,
      supprimer,
      exporter,
      importer,
      rappelExport,
      noterExemple,
      exemple,
      espaces: () => lister("espaces"),
      ajouterEspace: (champs) => ajouter("espaces", champs),
    };
  }

  return { ouvrir, fourchette, fourchetteOrdonnee, lireFourchette, lireNombre, lireDate, ecrireDate, OBJETS, CLE, VERSION, DELAI_RAPPEL_JOURS };
});
