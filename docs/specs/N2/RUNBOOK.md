# RUNBOOK — Tranche N2

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 12 sessions agent pour les huit tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

La ferme d'exemple vend sur des marchés réunionnais : la vue « Offre et demande » montre, semaine par semaine, où la production dépasse ou manque ; le tableau économique ne compte que ce qui se vend, et déduit le coût des séances de la marge de la ferme ; la vue « Points de vente » donne le résultat de chacun. `./verify.sh N2` → code de sortie 0.

## Orientation

- Arborescence : comme en P1. Calculs nouveaux dans `src/calc.js` ; saisie et vues nouvelles dans `src/ui-ventes.js` ; tests unitaires dans `test/ventes.test.js`, de bout en bout dans `test/ventes.e2e.js`.
- Les tests de N1 et de P1 ne bougent pas. Une ferme sans débouché doit donner exactement le tableau de N1 (invariant `sans_debouche_comme_n1`).
- Identifiants de tâches : T18 à T25.
- Glossaire : point de vente = un lieu ou un client (marché, panier, magasin) ; séance = une vente régulière, un jour de la semaine, sur une période ; séance datée = une occurrence de la séance ; débouché = une culture vendue à un point de vente, avec son prix et son volume vendable par séance ; semaine = du lundi au dimanche.

## Tranches (squelette de bout en bout d'abord)

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T18 | EX-18 | Modèle : points de vente, séances, débouchés dans le store ; export et import à l'identique | `./verify.sh T18` → exit 0 | — |
| T19 | EX-18 | Panneau de saisie des points de vente, de leurs séances et de leurs débouchés | `./verify.sh T19` → exit 0 | T18 |
| T20 | EX-19 | Séances datées et coût de chaque séance | `./verify.sh T20` → scénario S6 (coûts) vert | T18 |
| T21 | EX-20 | Offre et demande par culture et par semaine ; vue « Offre et demande » | `./verify.sh T21` → scénario S4 (matrice) vert | T20 |
| T22 | EX-21, EX-23 | Ventes plafonnées par la demande, au meilleur prix ; tableau : volume vendu, coût des séances, marge de la ferme | `./verify.sh T22` → scénarios S4 et S5 verts | T21 |
| T23 | EX-22 | Vue « Points de vente » : séances, chiffre d'affaires, coûts, résultat par mois | `./verify.sh T23` → scénario S6 vert | T22 |
| T24 | EX-24 | Ferme d'exemple : points de vente réunionnais, séances et débouchés | `./verify.sh T24` → exit 0 | T19, T23 |
| T25 | toutes | Vérification de bout en bout de la tranche, puis revue par l'évaluateur séparé, restreinte à la conformité à la spec | `./verify.sh N2` → exit 0 ; rapport sans écart | T18 à T24 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh P1`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh N2`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire le diff par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique.
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche.
- `relecture: true` (T18 modèle, T20 à T22 calculs) : avant le commit, un sous-agent Fable, effort élevé, contexte frais, avec pour seule question : « ce diff est-il conforme à `SPEC.md` et aux limites d'`AGENTS.md` ? ». Un écart → une seule reprise, puis arrêt et compte rendu.
- T25 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt — s'arrêter et demander si

- une exigence paraît fausse ou contredit un test ;
- un test de N1 ou de P1 ne peut redevenir vert qu'en le modifiant ;
- une modification de spec, de modèle de données au-delà de la spec, ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint, ou le contexte dépasse environ 60 % ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté reste en version 1 : un fichier de N1 s'importe dans N2 (les nouvelles listes y sont vides). Chaque tâche se défait par `git revert`.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

## ✎ Décisions

- T19 · Trois panneaux de plus dans le volet de saisie, après les plantations, sur le modèle des autres (titre, nombre, formulaire, liste, mode modification). La mécanique des formulaires reste dans `UiSaisie` ; `UiVentes` affiche les listes et remplit les listes déroulantes (point de vente, culture vendue). Le jour d'une séance s'enregistre comme un nombre, de 1 (lundi) à 7 (dimanche).
- T20 · Une séance régulière donne ses séances datées : le premier jour dit à partir de la première date, puis toutes les semaines jusqu'à la dernière, incluse. Coût d'une séance datée = frais + 2 × distance × coût du km, niveau par niveau ; il s'affiche dans la liste des séances avec leur nombre.

## ✎ Bilan de fin de tranche
