# RUNBOOK — Tranche R5

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 8 sessions agent pour les quatre tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

Sur plantoeuf.vercel.app, dans le calendrier de culture, on saisit la barre d'une plantation et on la pose à une autre date ou sur un autre espace ; pendant le geste, une étiquette dit la date, l'espace et les alertes que le déplacement ferait apparaître ; au lâcher, la plantation est enregistrée et « Annuler » la remet en place. Le même geste se fait au clavier et au doigt. La ferme d'exemple couvre deux années et son calendrier défile de l'une à l'autre. `./verify.sh R5` → code de sortie 0.

## Orientation

- Calcul : `src/calc.js` (`consequencesDeplacement`), sans DOM. Geste : `src/ui-calendrier.js` ; message « Annuler » : `src/ui-saisie.js` (`annoncer`). Ferme d'exemple : `src/exemple.js` ; choix de la deuxième année : `docs/specs/R2/DONNEES.md` § 15.
- Base de la deuxième année : le prototype de l'étude « rotation d'un clic » (17/10/2026, plan B : mêmes dates, surfaces et variétés, espaces choisis selon les critères de « Que planter ici ? », abri gardé pour les cultures d'abri, chouchou sur sa treille).
- Identifiants : tâches T65 à T68, exigences EX-67 à EX-71, scénarios S22 à S24, invariants `deplacement_sans_effet`, `annuler_retablit`, `premiere_annee_comme_r4`.
- Mise en ligne : chaque push sur la branche publie plantoeuf.vercel.app ; ne pousser qu'un état où toute la suite passe.

## Tranches

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T65 | EX-68 | Conséquences d'un déplacement | `./verify.sh T65` → exit 0 | — |
| T67 | EX-71 | Ferme d'exemple sur deux ans, tests découplés | `./verify.sh T67` → exit 0, puis toute la suite | — |
| T66 | EX-67 à EX-70 | Glisser-déposer : souris, doigt, clavier, étiquette, « Annuler » | `./verify.sh T66` → exit 0 | T65, T67 |
| T68 | toutes | Vérification de bout en bout, captures, évaluateur séparé | `./verify.sh R5` → exit 0 ; rapport sans écart | T65 à T67 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh R4`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées, dans l'ordre T65, T67, T66, T68.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** toute la suite, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire par le sous-agent relecteur (Fable) et noter son verdict.
7. Faire un commit atomique, puis le pousser (mise en ligne) et contrôler le déploiement (READY, filtré par sha).
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche. Pas d'agents d'implémentation en parallèle (décision du 17/10 consignée dans le plan : une seule paire indépendante, gain inférieur au coût des fusions).
- `relecture: true` (T65 à T67) : un sous-agent Fable, effort élevé, contexte frais, sur la conformité à `SPEC.md` et aux limites d'`AGENTS.md`. Un écart → une seule reprise, puis arrêt et compte rendu.
- T68 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain demande que l'agent avance seul : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions). Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md` et choisir la voie la plus prudente :

- un test existant hors de la liste de `SPEC.md` (« Tests existants modifiés ») devrait être modifié ;
- un chiffre de la première année de la ferme d'exemple change ;
- une exigence paraît fausse ou contredit une règle d'une tranche précédente ;
- une modification du modèle de données semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté ne change pas (version 6). Chaque tâche se défait par `git revert` ; Vercel garde les déploiements précédents. Une ferme d'exemple chargée avant R5 reste d'une seule année jusqu'à ce que l'utilisateur l'efface et la recharge.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

## ✎ Décisions

- T65 · « Alertes que le déplacement fait apparaître » se lit à la lettre : présentes après et pas avant, la plantation déplacée comprise ; une alerte qu'elle avait déjà à sa place d'origine n'apparaît pas et n'est pas levée. `levees` est un nombre. Une sur-occupation qui baisse sans disparaître compte comme levée.
- T65 · Pour tenir les 30 ms sur une ferme de deux ans, `associationsDefavorables` lit les plantations de chaque espace une seule fois (aides internes `precedentsParmi`, `voisinsParmi`) : mêmes résultats qu'en R4, seul l'ordre des clés de l'objet rendu change (par espace puis date).

## ✎ Bilan de fin de tranche
