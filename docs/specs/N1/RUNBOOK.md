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
7. Faire un commit atomique.
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Conditions d'arrêt — s'arrêter et demander si

- une exigence paraît fausse ou contredit un test ;
- une modification de test, de spec, de modèle de données ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- un objet absent du modèle de données paraît nécessaire ;
- le seuil d'alerte de la tranche est atteint, ou le contexte dépasse environ 60 %.

## Idempotence et retour arrière

`init.sh` peut être relancé sans effet de bord ; chaque tâche se défait par `git revert` ; le format JSON exporté porte un numéro de version et l'import accepte les versions précédentes.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

## ✎ Décisions

## ✎ Bilan de fin de tranche
