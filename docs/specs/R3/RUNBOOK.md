# RUNBOOK — Tranche R3

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 7 sessions agent pour les cinq tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

Sur plantoeuf.vercel.app, une ferme qui s'étend sur 2026 et 2027 montre « ‹ 2026 › » dans la barre du haut ; la synthèse et les ventes ne montrent que l'année choisie, de janvier à décembre ; le calendrier de culture va de janvier 2026 à décembre 2027 et défile d'une année à l'autre. La ferme d'exemple chargée en 2027 n'a plus de colonne « déc. 2026 ». `./verify.sh R3` → code de sortie 0.

## Orientation

- Calcul par année dans `src/calc.js`, sans DOM ; l'appel sans année garde les résultats d'avant (`sans_annee_comme_r2`).
- Choix de l'année : `src/ui-annee.js`, appelé par `rafraichir()` de `src/index.html`, qui passe l'année à chaque affichage.
- Calendriers : `src/ui-calendrier.js` (fonction `frise`), largeur d'une année = largeur de la boîte.
- Identifiants : tâches T53 à T57, exigences EX-55 à EX-60, scénarios S15 à S17, invariants `sans_annee_comme_r2`, `somme_des_annees`, `exemple_dans_son_annee`.
- Mise en ligne : chaque push sur la branche publie plantoeuf.vercel.app ; ne pousser qu'un état où toute la suite passe.

## Tranches

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T53 | EX-55, EX-56, EX-57 | Calcul par année | `./verify.sh T53` → exit 0 | — |
| T54 | EX-60 | Ferme d'exemple dans son année | `./verify.sh T54` → exit 0 | T53 |
| T55 | EX-55 à EX-58, EX-60 | Choix de l'année ; pages qui la suivent | `./verify.sh T55` → exit 0 | T53 |
| T56 | EX-59 | Calendriers continus | `./verify.sh T56` → exit 0 | T55 |
| T57 | toutes | Vérification de bout en bout, captures, évaluateur séparé | `./verify.sh R3` → exit 0 ; rapport sans écart | T53 à T56 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh R2`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh R3`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique, puis le pousser (mise en ligne) et contrôler le déploiement (READY, filtré par sha).
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche.
- `relecture: true` (T53 à T56) : un sous-agent Fable, effort élevé, contexte frais, restreint à la conformité à `SPEC.md` et aux limites d'`AGENTS.md`. Un écart → une seule reprise, puis arrêt et compte rendu.
- T57 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain demande que l'agent avance seul : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions). Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md` et choisir la voie la plus prudente :

- un test existant devrait être modifié ;
- une exigence paraît fausse ou contredit une règle d'une tranche précédente ;
- une modification du modèle de données ou de la règle du jeudi semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté ne change pas (version 5) ; l'année choisie vit dans l'état du navigateur, qu'un retour arrière ignore. Chaque tâche se défait par `git revert` ; Vercel garde les déploiements précédents.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

## ✎ Décisions

- T56 · `src/ui-annee.js` (fichier de T55) rend `{ annees, annee }` : `rafraichir` passe les années de la ferme au calendrier sans les recalculer. La position d'un calendrier est un jour, pas des pixels. Une ferme d'une seule année montre l'année entière, même si ses plantations n'en couvrent qu'une partie ; l'année s'écrit sous le nom du mois pour tenir au téléphone.
- T55 · Les lignes des points de vente et des véhicules montrent les bilans de l'année choisie (ce sont des calculs, pas des enregistrements) ; les listes d'enregistrements et la page Charges fixes restent entières. Une année sans donnée entre deux années de la ferme montre l'état vide de la synthèse, sans ses charges fixes (règle d'avant R3 : un tableau sans ligne est vide) ; la spec ne tranche pas ce cas, laissé tel quel.
- T54 · Même cas pour T54 : son test de bout en bout (exemple chargé en 2027) va dans `test/annees.e2e.js`. Les bornes de l'année ne s'appliquent qu'aux séances et aux lots de l'exemple, pas à ses plantations.
- T53 · Le test de bout en bout de T53 (calcul par année dans le fichier livré) va dans `test/annees.e2e.js`, fichier listé pour T55 et T56 : `./verify.sh T53` exige au moins un test de bout en bout de la tâche.

## ✎ Bilan de fin de tranche

Tranche terminée le 15/10/2026 en 5 sessions sur 7 : T53 (0 reprise), T54 (0), T55 (0), T56 (1 reprise), T57. `./verify.sh R3` → exit 0 (155 tests unitaires, 177 de bout en bout). Évaluateur Fable : CONFORME, aucun écart. Déploiements READY sur plantoeuf.vercel.app.

Résultat : une commande « ‹ 2026 › » dans la barre du haut ; la synthèse, les ventes, les véhicules et les besoins montrent une année à la fois, de janvier à décembre, chaque valeur dans une seule année (règle du jeudi gardée) ; le calendrier de culture et celui des poules vont de janvier de la première année à décembre de la dernière, s'ouvrent sur l'année choisie et défilent d'une année à l'autre ; la ferme d'exemple chargée en 2027 n'a plus de colonne « déc. 2026 ».

À suivre :
- Une année sans donnée entre deux années de la ferme montre l'état vide de la synthèse, sans ses charges fixes : montrer ses charges et son revenu, ou un message propre à l'année ?
- Prolonger un plan sur l'année suivante demande de redater chaque séance et chaque lot : une reconduction d'une année sur l'autre aiderait (hors périmètre).
- Les libellés « saison » désignent désormais l'année choisie.
