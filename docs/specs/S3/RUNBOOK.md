# RUNBOOK — Tranche S3

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 11 sessions agent pour les sept tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

La ferme d'exemple élève un lot de poules : le tableau économique montre, sous les cultures, l'atelier poules — œufs, chiffre d'affaires, coût de l'aliment et marge — et la marge de la ferme déduit l'aliment ; les œufs ont leur ligne dans la matrice offre-demande et se vendent aux points de vente. `./verify.sh S3` → code de sortie 0.

## Orientation

- Arborescence : comme en N2. Calculs nouveaux dans `src/calc.js` ; saisie des lots dans `src/ui-poules.js` ; tests unitaires dans `test/poules.test.js`, de bout en bout dans `test/poules.e2e.js`.
- Les tests de N1, de P1 et de N2 ne bougent pas, sauf la ligne du test `[T08]` et les trois assertions des tests `[T18]` qui fixent le numéro de version : elles comparent désormais à la version courante (accord de l'humain du 13/10/2026). Une ferme sans lot doit donner exactement le tableau de N2 (invariant `sans_lot_comme_n2`).
- Identifiants de tâches : T26 à T32.
- Glossaire : lot = des poules arrivées ensemble et réformées ensemble ; ponte = œufs par poule et par jour ; réforme = départ du lot ; atelier = une production de la ferme qui a ses produits et ses charges (le maraîchage, les poules).
- Maquettes : le panneau des lots et le bloc « Atelier poules » se dessinent d'abord sur le canevas de design (Claude Design), puis se codent.

## Tranches (squelette de bout en bout d'abord)

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T26 | EX-25 | Modèle : lots de poules dans le store ; format en version 3, migration des versions 1 et 2 ; export et import à l'identique | `./verify.sh T26` → exit 0 | — |
| T27 | EX-25 | Panneau de saisie des lots ; « Œufs » dans le choix du produit d'un débouché | `./verify.sh T27` → exit 0 | T26 |
| T28 | EX-26 | Ponte et aliment par semaine | `./verify.sh T28` → scénario S7 (semaines) vert | T26 |
| T29 | EX-27 | Atelier poules dans le tableau économique ; aliment déduit de la marge de la ferme ; synthèse | `./verify.sh T29` → scénarios S7 et S9 verts | T28 |
| T30 | EX-28 | Œufs dans les ventes : matrice offre-demande, ventes plafonnées, points de vente | `./verify.sh T30` → scénario S8 vert | T29 |
| T31 | EX-29 | Ferme d'exemple : un lot de poules et des débouchés pour ses œufs | `./verify.sh T31` → exit 0 | T27, T30 |
| T32 | toutes | Vérification de bout en bout de la tranche, puis revue par l'évaluateur séparé, restreinte à la conformité à la spec | `./verify.sh S3` → exit 0 ; rapport sans écart | T26 à T31 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh N2`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh S3`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire le diff par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique.
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche.
- `relecture: true` (T26 modèle, T28 à T30 calculs) : avant le commit, un sous-agent Fable, effort élevé, contexte frais, avec pour seule question : « ce diff est-il conforme à `SPEC.md` et aux limites d'`AGENTS.md` ? ». Un écart → une seule reprise, puis arrêt et compte rendu.
- T32 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain a demandé le 13/10/2026 que l'agent avance seul jusqu'à la livraison : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions) au lieu d'attendre une réponse. Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md`, choisir la voie la plus prudente (celle qui ne modifie ni un test existant ni la spec) et le signaler au bilan de fin de tranche. Le seuil d'alerte, lui, reste un arrêt : l'agent rend compte et ne décide rien (AGENTS.md).

- une exigence paraît fausse ou contredit un test ;
- un test de N1, de P1 ou de N2 ne peut redevenir vert qu'en le modifiant (hors les lignes de version des tests `[T08]` et `[T18]`, accord de l'humain) ;
- une modification de spec, de modèle de données au-delà de la spec, ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint, ou le contexte dépasse environ 60 % ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté passe en version 3 : un fichier de N1 (version 1) ou de N2 (version 2) s'importe dans S3 par migration (la liste des lots y est vide) ; un fichier HTML plus ancien refuse un fichier de version 3. Chaque tâche se défait par `git revert`.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

## ✎ Décisions

- T26 · Le store vérifie que les dates d'un lot se suivent (arrivée ≤ début de ponte ≤ réforme, le même jour permis) à l'ajout, à la modification et à l'import ; code d'erreur `dates_desordonnees`. Les tests comparent la version du format à `Store.VERSION` : un prochain objet ne touchera plus aucun test.

## ✎ Bilan de fin de tranche
