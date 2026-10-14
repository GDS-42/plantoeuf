# RUNBOOK — Tranche R1

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 6 sessions agent pour les quatre tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

Sur plantoeuf.vercel.app, toute date se saisit et se relit jour, mois, année ; la page Ventes a une section « Véhicules » ; un point de vente qui choisit un véhicule voit son coût du km et le coût de ses séances calculés tout seuls, et chaque véhicule montre ses kilomètres, ses litres et son carburant de la saison. `./verify.sh R1` → code de sortie 0.

## Orientation

- Lecture des dates dans `src/store.js` (`lireDate`), écriture dans `src/ui-commun.js` (`saisieDate`) ; calculs des véhicules dans `src/calc.js` ; saisie des véhicules dans `src/ui-vehicules.js`.
- Tests : `test/dates.test.js`, `test/dates.e2e.js`, `test/vehicules.test.js`, `test/vehicules.e2e.js`.
- Les tests existants ne bougent pas, sauf l'attente du champ date de `test/p2-ferme.e2e.js` (« 01/05/2026 »), accord de l'humain du 14/10/2026. Une ferme sans véhicule doit donner exactement les résultats d'avant R1 (invariant `sans_vehicule_comme_avant`).
- Identifiants : tâches T39 à T42, exigences EX-39 à EX-44, scénarios S10 et S11.
- Mise en ligne : chaque push sur la branche publie plantoeuf.vercel.app ; ne pousser qu'un état où `./verify.sh R1` passe.

## Tranches

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T39 | EX-39, EX-40 | Dates saisies et relues jour, mois, année | `./verify.sh T39` → scénario S10 vert | — |
| T40 | EX-41, EX-42 | Véhicules : modèle, format en version 4, section « Véhicules », véhicule d'un point de vente | `./verify.sh T40` → exit 0 | — |
| T41 | EX-43, EX-44 | Coût du km déduit du véhicule ; bilan de saison de chaque véhicule | `./verify.sh T41` → scénario S11 vert | T40 |
| T42 | toutes | Vérification de bout en bout, puis revue par l'évaluateur séparé | `./verify.sh R1` → exit 0 ; rapport sans écart | T39 à T41 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh P2`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh R1`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire le diff par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique, puis le pousser (mise en ligne).
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche.
- `relecture: true` (T39, T40, T41) : avant le commit, un sous-agent Fable, effort élevé, contexte frais, avec pour seule question : « ce diff est-il conforme à `SPEC.md` et aux limites d'`AGENTS.md` ? ». Un écart → une seule reprise, puis arrêt et compte rendu.
- T42 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain demande que l'agent avance seul : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions). Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md` et choisir la voie la plus prudente (celle qui ne modifie ni un test existant ni la spec) :

- une exigence paraît fausse ou contredit un test ;
- un test existant ne peut redevenir vert qu'en le modifiant (hors la retouche approuvée de `test/p2-ferme.e2e.js`) ;
- une modification de spec, de modèle de données au-delà de la spec, ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté passe en version 4 : un fichier de version 1, 2 ou 3 s'importe par migration (la liste des véhicules y est vide) ; un fichier HTML plus ancien refuse un fichier de version 4. Chaque tâche se défait par `git revert` ; Vercel garde les déploiements précédents (retour en arrière possible depuis son tableau de bord).

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

- T39 · Les dates affichées étaient déjà jj/mm/aaaa ; seuls les champs `type="date"` suivaient la langue du navigateur. Un nom accessible ne se lit pas sur un bouton caché : le test vérifie les boutons calendrier tiroir ouvert.
- T39 · Le crochet de fin de session exige un arbre propre : le commit de T39 a précédé la fin de la relecture Fable (contenu identique au diff relu, verdict CONFORME).

## ✎ Décisions

- T39 · L'écriture d'une date (ISO → jj/mm/aaaa) s'appelle `Store.ecrireDate`, à côté de `Store.lireDate` dans `src/store.js`, au lieu de `saisieDate` dans `src/ui-commun.js` prévue par la spec : même rôle, testable sans navigateur (remarque du relecteur, non bloquante). Le bouton calendrier réutilise l'icône du calendrier des plantations ; il disparaît si le navigateur n'a pas `showPicker`.

## ✎ Bilan de fin de tranche
