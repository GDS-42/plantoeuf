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

## ✎ Décisions

- T01 · Stockage dans `localStorage`, clé `plantoeuf`, document JSON `{ version: 1, espaces: [...] }`. Le stockage est injecté (`Store.ouvrir(stockage)`) pour que `store.js` se teste sous Node avec un substitut en mémoire.
- T01 · Chaque module s'enveloppe pour exporter `module.exports` sous Node et un global dans le navigateur (`Store`, `Calc`, `Textes`) : `build.sh` reste une simple concaténation.
- T01 · Identifiant, dates et suppression logique laissés à T02, tâche dédiée et relue ; un espace T01 porte seulement nom, surface et type.
- T01 · Tests T01 dans `test/squelette.*`, pour laisser `store.test.js` et `calc.test.js` aux tâches qui les nomment. Le test de bout en bout remplit les trois champs de l'espace et cible les champs par identifiant (`#espace-nom`, …) plutôt que par libellé : T03 peut rendre les champs obligatoires et les textes d'`i18n.js` peuvent changer sans toucher au test.

## ✎ Bilan de fin de tranche
