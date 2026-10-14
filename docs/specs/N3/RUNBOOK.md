# RUNBOOK — Tranche N3

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 10 sessions agent pour les sept tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

Sur plantoeuf.vercel.app : une culture porte ses coûts de mise en place, et la marge les déduit ; la page « Charges fixes » reçoit les charges de la ferme, et la synthèse et le tableau donnent le revenu mois par mois ; la page Plantations liste les graines et plants à prévoir ; le coût du km d'un véhicule compte son entretien ; la ferme d'exemple a une camionnette et des coûts de culture. `./verify.sh N3` → code de sortie 0.

## Orientation

- Calculs nouveaux dans `src/calc.js` (sans DOM) ; saisie des charges dans `src/ui-charges.js`, besoins dans `src/ui-besoins.js`.
- Tests : `test/charges.*`, `test/couts.*`, `test/vehicules.*` (tests `[T44]` ajoutés), `test/exemple-n3.e2e.js`.
- Aucun test existant ne change. Une ferme sans coût de culture ni charge fixe garde exactement ses résultats (invariant `sans_cout_comme_r1`) ; un véhicule sans frais au km aussi (`sans_frais_comme_r1`).
- Identifiants : tâches T43 à T49, exigences EX-45 à EX-50, scénarios S12 à S14.
- Mise en ligne : chaque push sur la branche publie plantoeuf.vercel.app ; ne pousser qu'un état où toute la suite passe.

## Tranches

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T43 | EX-45 | Modèle et saisie : frais au km, coûts de mise en place, charges fixes ; version 5 | `./verify.sh T43` → exit 0 | — |
| T44 | EX-46 | Frais au km dans le coût du km ; entretien et total de la saison | `./verify.sh T44` → scénario S14 vert | T43 |
| T45 | EX-47 | Coûts de culture déduits de la marge | `./verify.sh T45` → scénario S12 (coûts) vert | T43 |
| T46 | EX-48 | Charges fixes et revenu | `./verify.sh T46` → scénario S13 vert | T45 |
| T47 | EX-49 | Besoins en semences et plants | `./verify.sh T47` → scénario S12 (besoins) vert | T43 |
| T48 | EX-50 | Ferme d'exemple : camionnette et coûts de culture | `./verify.sh T48` → exit 0 | T44, T45, T47 |
| T49 | toutes | Vérification de bout en bout, puis revue par l'évaluateur séparé | `./verify.sh N3` → exit 0 ; rapport sans écart | T43 à T48 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh R1`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh N3`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire le diff par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique, puis le pousser (mise en ligne).
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche.
- `relecture: true` (T43 à T47) : avant le commit, un sous-agent Fable, effort élevé, contexte frais, avec pour seule question : « ce diff est-il conforme à `SPEC.md` et aux limites d'`AGENTS.md` ? ». Un écart → une seule reprise, puis arrêt et compte rendu.
- T49 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain demande que l'agent avance seul : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions). Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md` et choisir la voie la plus prudente (celle qui ne modifie ni un test existant ni la spec) :

- une exigence paraît fausse ou contredit un test ;
- un test existant ne peut redevenir vert qu'en le modifiant ;
- une modification de spec, de modèle de données au-delà de la spec, ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté passe en version 5 : un fichier de version 1 à 4 s'importe par migration (la liste des charges y est vide ; les nouveaux champs des véhicules et des cultures sont facultatifs) ; un fichier HTML plus ancien refuse un fichier de version 5. Chaque tâche se défait par `git revert` ; Vercel garde les déploiements précédents.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

## ✎ Décisions

- T47 · La section « Semences et plants à prévoir » ferme la page Plantations ; elle n'apparaît que si une plantation calculable a une culture avec densité. Sans prix d'une graine ou d'un plant, la quantité s'affiche et le coût est dit « prix non saisi » ; les totaux du mois et de la saison ne comptent que les coûts connus. Le regroupement par mois et les totaux viennent de `Calc.besoinsParMois` (reprise demandée par le relecteur).
- T46 · Avec une charge fixe, la projection s'étend au besoin jusqu'au douzième mois après son premier mois (jamais avant) ; une projection plus longue garde ses mois, et chaque mois porte toutes les charges. Le total et chaque mois reçoivent `charges` et `revenu`, les chiffres clés aussi, seulement si une charge existe. La tuile « Revenu » suit la tuile « Marge » dans la synthèse ; le graphique garde le chiffre d'affaires et la marge.
- T45 · Les coûts de culture d'une plantation comptent au mois de sa date de mise en place (`date` de la plantation) ; une culture sans coût de mise en place ne reçoit ni `couts` ni `marge` différente de son chiffre d'affaires, et le total ne reçoit `cultures` que si un coût existe. La tuile « Coûts déduits » liste ses sources (séances, aliment, cultures) ; avec une seule, elle garde l'affichage d'avant. Reprise après relecture : la légende de la marge de la synthèse dit désormais qu'une culture déduit ses coûts de mise en place.
- T44 · Le bilan de saison d'un véhicule porte toujours l'entretien (0 sans frais) et le coût total (= carburant sans frais) ; la ligne du véhicule ne les montre qu'avec des frais au km. Le sous-titre ajoute « x €/km d'entretien ».
- T44 à T47 · Relus en parallèle par quatre relecteurs Fable, chacun sur le diff de sa tâche (fichier de patch et copie du projet à l'étape voulue), avant tout commit.

- T43 · La page « Charges fixes » forme un groupe de navigation « Budget », entre « Atelier » et « Données ». Les coûts de mise en place de la culture forment un bloc « Coûts de mise en place (facultatif) » à la fin de son tiroir ; vidés, ils s'enregistrent vides (`""` ou `null`) et comptent pour 0. Les frais au km du véhicule sont un champ facultatif de son tiroir.
- T44 à T47 · Préparés et vérifiés sur une copie du dépôt pendant la relecture de la tâche précédente, puis appliqués un à un, chacun relu avant son commit.

## ✎ Bilan de fin de tranche
