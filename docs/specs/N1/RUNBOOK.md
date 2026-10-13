# RUNBOOK — Tranche N1

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 15 sessions agent pour les dix tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche. Le seuil ne juge pas le travail : les vérifications et l'évaluateur le font.

## But et résultat observable

Une ferme fictive de 10 plantations donne un tableau CA / marge par culture et par mois, en fourchette, qui se recalcule à chaque modification ; export puis import restituent la même ferme. `./verify.sh N1` → code de sortie 0.

## Orientation

- Arborescence : `src/` (modules), `test/` (tests), `dist/` (fichier assemblé, non versionné), `docs/specs/N1/`.
- État initial : `./init.sh` installe les dépendances de développement et vérifie que `node --test` et Playwright répondent.
- `./verify.sh <ID>` lance les tests unitaires puis Playwright, filtrés sur l'identifiant de tâche (les tests portent `[T04]` dans leur nom).
- Glossaire : fourchette = {basse, mediane, haute} ; plantation = une variété sur un espace à une date ; fenêtre de récolte = de la première récolte à la fin de récolte.

## Tranches (squelette de bout en bout d'abord)

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T01 | EX-01 (partiel) | Squelette : `src/index.html` qui charge `store.js` et `calc.js`, un espace créé et retrouvé après réouverture, `build.sh` et `verify.sh` fonctionnels avec un test unitaire et un test de bout en bout | `./verify.sh T01` → exit 0 | — |
| T02 | modèle | Modèle de données : UUID, dates, suppression logique, fourchette avec `fourchette_ordonnee` | `./verify.sh T02` → exit 0 | T01 |
| T03 | EX-01 | Saisie et liste des espaces, cultures, variétés (surcharge des champs) et plantations | `./verify.sh T03` → exit 0 | T02 |
| T04 | EX-02, EX-03 | Dates de récolte et répartition hebdomadaire de la production | `./verify.sh T04` → scénario S1 vert | T02 |
| T05 | EX-04, EX-09 | Tableau économique par culture et par mois, en fourchette, estimation signalée | `./verify.sh T05` → scénario S2 vert | T03, T04 |
| T06 | EX-05 | Recalcul automatique à chaque modification | `./verify.sh T06` → exit 0 | T05 |
| T07 | EX-06 | Signal de sur-occupation d'un espace | `./verify.sh T07` → scénario S3 vert | T04 |
| T08 | EX-07, EX-08 | Export et import JSON à l'identique, rappel d'export à 7 jours | `./verify.sh T08` → aller-retour identique | T02 |
| T09 | EX-10 | Ferme d'exemple de 10 plantations (La Réunion), effaçable d'un geste | `./verify.sh T09` → exit 0 | T05 |
| T10 | toutes | Vérification de bout en bout de la tranche, puis revue par un évaluateur séparé, restreint à la conformité à la spec | `./verify.sh N1` → exit 0 ; rapport de l'évaluateur sans écart à la spec | T01 à T09 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh T01` une fois T01 passée).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche et coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire le diff par le sous-agent relecteur (voir « Modèles et relecture ») et noter son verdict.
7. Faire un commit atomique.
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple, retenu pour N1)

- Une session par tâche, l'humain relance entre chaque. Pas d'orchestrateur ni de parallélisme en N1 (`mode: simple`, `parallelisme_max: 1`).
- Toute tâche s'exécute avec **Opus 5.5 au minimum, effort élevé** (`modele_minimum` dans `features.json`).
- Pour une tâche marquée `relecture: true` (T02, T04, T05, T08), avant le commit, la session lance un sous-agent relecteur avec le modèle de `evaluateur` (Fable, effort élevé), contexte frais, avec pour seule question : « ce diff est-il conforme à `SPEC.md` et aux limites d'`AGENTS.md` ? ». Il ne cherche pas ce qui manque. Un écart → une seule reprise, puis arrêt et compte rendu.
- `PROGRESS.md` note le modèle, l'effort, le nombre de reprises et le verdict du relecteur.
- `docs/ORCHESTRATION.md` décrit le mode orchestré, non activé : il le sera quand le parallélisme aura une raison d'exister (rendu découpé en modules à partir de N2, exécutions sans humain).

## Conditions d'arrêt — s'arrêter et demander si

- une exigence paraît fausse ou contredit un test ;
- une modification de test, de spec, de modèle de données ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- un objet absent du modèle de données paraît nécessaire ;
- le seuil d'alerte de la tranche est atteint, ou le contexte dépasse environ 60 % ;
- le relecteur signale un écart à la spec qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

`init.sh` peut être relancé sans effet de bord ; chaque tâche se défait par `git revert` ; le format JSON exporté porte un numéro de version et l'import accepte les versions précédentes.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

- T01 · Node 22 refuse un dossier en argument de `--test` : `node --test test/` échoue (`Cannot find module '…/test'`). `verify.sh` lance désormais `node --test test/*.test.js`, ce qui écarte aussi les `*.e2e.js` (Node 20 les aurait exécutés via son motif `**/test/**/*.js`). `AGENTS.md` (« tests unitaires ») et le script `test` de `package.json` portent encore l'ancienne commande : à corriger par l'humain, hors périmètre de l'agent.
- T01 · Le conteneur cloud fournit Chromium révision 1194 alors que Playwright 1.64 attend la 1248, et `playwright install` y est proscrit. Vérification lancée avec `PLAYWRIGHT_BROWSERS_PATH` vers un dossier local (hors dépôt) qui fait passer les binaires 1194 pour la 1248. Sur un poste ordinaire, `./init.sh` installe le bon navigateur, mais seulement si le dossier des navigateurs n'existe pas encore : une ancienne installation masque une mise à jour de Playwright.
- T01 · `./init.sh` produit un `package-lock.json` (repli de `npm ci` sur `npm install`, faute de fichier de verrouillage). Non versionné : figer les dépendances relève de « demander d'abord ».
- T02, T04 · `./verify.sh <ID>` filtre aussi Playwright sur `[ID]`, et Playwright échoue quand aucun test ne correspond : une tâche sans test de bout en bout ne peut pas passer. T02 et T04 ont donc reçu un test de bout en bout utile (UUID en `file://`, dates de récolte affichées), hors de leur liste `fichiers`.

## ✎ Décisions

- T01 · Stockage dans `localStorage`, clé `plantoeuf`, document JSON `{ version: 1, espaces: [...] }`. Le stockage est injecté (`Store.ouvrir(stockage)`) pour que `store.js` se teste sous Node avec un substitut en mémoire.
- T01 · Chaque module s'enveloppe pour exporter `module.exports` sous Node et un global dans le navigateur (`Store`, `Calc`, `Textes`) : `build.sh` reste une simple concaténation.
- T01 · Identifiant, dates et suppression logique laissés à T02, tâche dédiée et relue ; un espace T01 porte seulement nom, surface et type.
- T01 · Tests T01 dans `test/squelette.*`, pour laisser `store.test.js` et `calc.test.js` aux tâches qui les nomment. Le test de bout en bout remplit les trois champs de l'espace et cible les champs par identifiant (`#espace-nom`, …) plutôt que par libellé : T03 peut rendre les champs obligatoires et les textes d'`i18n.js` peuvent changer sans toucher au test.
- T02 · Noms de champs : `id`, `creeLe`, `modifieLe`, `supprimeLe` (ISO 8601). Fourchette `{ basse, mediane, haute }`. API du store : `lister(objet, { avecSupprimes })`, `obtenir`, `ajouter`, `modifier`, `supprimer` sur `espaces`, `cultures`, `varietes`, `plantations` ; tout autre objet est refusé (`objet_inconnu`). Les erreurs portent un `code`, traduit par `i18n.js` au rendu.
- T02 · Saisie d'une fourchette dans un seul champ texte : « 3 » ou « 2 / 2,5 / 3 », virgule décimale acceptée (`Store.lireFourchette`). Un seul nombre remplit les trois valeurs ; deux nombres ou un ordre inverse sont refusés.
- T02 · Seuls le rendement et le prix sont des fourchettes, comme le dit le tableau du modèle ; les durées et le taux de pertes sont des nombres simples (scénario S1).
- T03 · Une seule page, une section par objet : formulaire, puis liste. « Modifier » remplit le formulaire, « Supprimer » supprime logiquement, sans confirmation. Après chaque enregistrement, tout l'affichage se recalcule depuis les données enregistrées (`rafraichir`).
- T03 · Une variété enregistre `null` pour chaque champ numérique non surchargé ; la famille botanique est facultative. Un élément dont la référence a été supprimée reste affiché, marqué « (supprimé) ».
- T03 · Identifiants des champs : `<objet>-<champ>` (ex. `#culture-joursAvantRecolte`), listes `#liste-<objets>`, boutons `[data-action="modifier|supprimer"]`.
- T04 · Les semaines de récolte partent de la date de première récolte (semaine 1 = 30 avril–6 mai dans S1), pas des semaines du calendrier : c'est la seule lecture où S1 donne 33,75 kg chaque semaine.
- T04 · Granularité à la semaine (SPEC, points tranchés) : pour une période quelconque (un mois du tableau), une semaine de récolte compte entière dans la période qui contient son jour du milieu, c'est-à-dire la plupart de ses jours. S1 : avril 0, mai 5 semaines, juin 3 semaines. Première version au prorata des jours, corrigée avant commit sur remarque du relecteur.
- T04 · Fin de récolte = première récolte + 7 × semaines − 1 jour (S1 : 30 avril → 24 juin inclus). Dates en « AAAA-MM-JJ », calculées en jours UTC. Production = surface × rendement × (100 − pertes) / 100, sur chaque niveau de la fourchette.
- T04 · Les dates de récolte s'affichent dans la liste des plantations (`test/recolte.e2e.js`, hors liste `fichiers`, car `./verify.sh T04` exige un test Playwright `[T04]`).
- T05 · Le CA se calcule plantation par plantation, au prix de sa variété (surcharge possible), puis s'additionne par culture. Le volume d'une culture additionne ses plantations, toutes dans l'unité de la culture. Le total de la ferme ne donne que CA et marge, les volumes n'ayant pas la même unité.
- T05 · Colonnes : du premier au dernier mois qui reçoit une semaine de récolte. Une ligne par culture qui a au moins une plantation active (variété et culture actives), rangée par nom. Montants arrondis à l'euro, volumes au dixième ; la valeur exacte reste dans `data-valeur`.
- T05 · Le tableau est en tête de page ; chaque case montre la médiane en gras, la basse et la haute en dessous ; la légende et les en-têtes disent « estimation » et « fourchette basse – médiane – haute » (EX-09).
- T06 · Recalcul : chaque enregistrement relance `rafraichir()`, qui recalcule listes et tableau depuis les données enregistrées. Une modification venue d'un autre onglet (événement `storage`) relit la ferme puis rafraîchit : sans cela, l'onglet resté ouvert écrasait les données de l'autre à sa prochaine saisie.
- T07 · Une plantation occupe son espace du jour du semis ou de la plantation jusqu'au dernier jour de sa récolte, inclus. Sur-occupation quand la somme des surfaces dépasse strictement celle de l'espace ; occuper exactement la surface n'est pas signalé. Le signal donne chaque mois touché avec la plus grande surface plantée, dans la ligne de l'espace ; aucune saisie n'est bloquée.
- T08 · Fichier exporté : `{ application: "plantoeuf", version: 1, exporteLe, espaces, cultures, varietes, plantations }`, supprimés compris. L'import accepte les versions 1 à `VERSION` (table `MIGRATIONS`, vide en N1), refuse un fichier d'une autre application, d'une version plus récente, mal formé ou avec une fourchette désordonnée, sans rien changer. Il remplace toute la ferme ; si la ferme ouverte n'est pas vide, il demande confirmation.
- T08 · Le stockage garde un `etat` propre au navigateur, jamais exporté : date du dernier export et date de la première modification non exportée. Rappel à l'ouverture si une modification n'a pas été exportée et que le dernier export, ou à défaut cette première modification, date d'au moins 7 jours. Un import ne déclenche pas de rappel : ses données sont celles d'un fichier déjà détenu. Le relecteur a jugé cet `etat` hors du modèle de données de la spec.
- T09 · La ferme d'exemple est proposée tant que la ferme ne contient aucun élément actif (donc à la première ouverture), dans l'année en cours. Ses enregistrements passent par le store, avec de vrais UUID ; leurs identifiants sont retenus dans l'`etat` du navigateur (jamais exporté, remis à zéro par un import), ce qui évite d'ajouter un champ au modèle. « Effacer la ferme d'exemple » supprime logiquement ces seuls éléments, d'un clic, sans confirmation ; ce que l'utilisateur a ajouté reste.
- T09 · Les valeurs agronomiques et les prix de l'exemple (`src/exemple.js`) sont des ordres de grandeur pour montrer l'outil, pas des références réunionnaises vérifiées : à faire relire par un maraîcher avant de montrer l'outil à une ferme pilote.

## ✎ Bilan de fin de tranche

- **Résultat** : les dix tâches passent ; `./verify.sh N1` → exit 0 (48 tests unitaires, 26 de bout en bout). Le résultat observable du runbook est atteint : la ferme d'exemple de 10 plantations donne le tableau CA / marge par culture et par mois, en fourchette, recalculé à chaque modification ; l'export puis l'import restituent la même ferme.
- **Coût** : 10 sessions sur 15 (seuil d'alerte non atteint), T02 à T10 enchaînées dans une même conversation à la demande de l'humain. Aucune reprise : chaque relecture Fable (T02, T04, T05, T08) a conclu « conforme » ; T04 a été relue deux fois, la première relecture ayant signalé un risque sur la granularité à la semaine, corrigé avant commit.
- **Ce qui a résisté** : l'outillage plus que le code — `node --test test/` refusé par Node 22, révision de Chromium du conteneur différente de celle de Playwright, et `./verify.sh <ID>` qui exige au moins un test Playwright par tâche (d'où des tests de bout en bout pour T02 et T04, hors de leur liste `fichiers`).
- **À trancher par l'humain** : corriger la commande `node --test test/` dans `AGENTS.md` et `package.json` ; versionner ou non `package-lock.json` ; tester dans Firefox (non disponible ici, exigence non fonctionnelle non vérifiée) ; faire relire les valeurs de la ferme d'exemple par un maraîcher réunionnais ; licence (ADR-002).
- **Pour N2** : `index.html` fait désormais environ 600 lignes ; le découper en modules d'écran (`src/ui-*.js`), comme le prévoit `docs/ORCHESTRATION.md`, ouvrira le parallélisme.
