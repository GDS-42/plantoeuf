// Lecture et écriture des données de la ferme dans le navigateur.
// Le stockage est injecté : localStorage dans le fichier HTML, un substitut en mémoire
// dans les tests. Seules getItem et setItem sont utilisées.
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Store = fabrique();
})(globalThis, function () {
  "use strict";

  const CLE = "plantoeuf";
  const VERSION = 1;
  // Les objets du noyau en N1 (SPEC, « Modèle de données du noyau »).
  const OBJETS = ["espaces", "cultures", "varietes", "plantations"];
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
    return donnees;
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
      liste.push(enregistrement);
      enregistrer();
      return copie(enregistrement);
    }

    function modifier(objet, id, champs) {
      const enregistrement = trouver(objet, id);
      Object.assign(enregistrement, saisie(champs), { modifieLe: maintenant() });
      enregistrer();
      return copie(enregistrement);
    }

    // Suppression logique seulement : l'enregistrement reste, daté.
    function supprimer(objet, id) {
      const enregistrement = trouver(objet, id);
      if (!enregistrement.supprimeLe) {
        const instant = maintenant();
        enregistrement.supprimeLe = instant;
        enregistrement.modifieLe = instant;
        enregistrer();
      }
      return copie(enregistrement);
    }

    return {
      lister,
      obtenir,
      ajouter,
      modifier,
      supprimer,
      espaces: () => lister("espaces"),
      ajouterEspace: (champs) => ajouter("espaces", champs),
    };
  }

  return { ouvrir, fourchette, fourchetteOrdonnee, lireFourchette, lireNombre, OBJETS, CLE, VERSION };
});
