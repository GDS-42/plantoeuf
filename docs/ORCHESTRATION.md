# ORCHESTRATION — répartition des tâches entre modèles et sous-agents

Ce document fixe comment une session orchestratrice distribue les tâches d'une tranche. Tout y est paramètre de `features.json`, jamais règle codée : un niveau peut être supprimé sans rien casser, parce que les harnais se périment avec les modèles.

## Principe

Le critère de répartition n'est pas la difficulté apparente d'une tâche mais la **force de sa vérification**.

- Une tâche dont un test déterministe décide du vert va à un modèle économique : le test fait le tri.
- Une tâche qui fixe une structure dont tout dépend (modèle de données, calcul, export) ou dont les scénarios sont exigeants va au modèle le plus fort, en effort élevé, et reçoit une relecture.
- L'évaluateur est **toujours un autre modèle** que le générateur : celui qui fait le travail ne le note pas.

## Champs de `features.json`

| Champ | Valeurs | Rôle |
| --- | --- | --- |
| `modele` | `haiku`, `sonnet`, `opus`, `fable` | Modèle du sous-agent qui exécute la tâche |
| `effort` | `low`, `medium`, `high` | Effort de raisonnement du sous-agent |
| `relecture` | `true` / `false` | Si vrai, l'évaluateur relit la tâche avant le commit, en plus de la vérification mécanique |
| `fichiers` | chemins | Fichiers que la tâche touche ; deux tâches ne tournent en parallèle que si leurs listes sont disjointes |
| `parallelisme_max` (tranche) | entier | Nombre maximal de sous-agents simultanés ; 2 en N1 |
| `evaluateur` (tranche) | `{modele, effort}` | Modèle et effort de l'évaluateur |

## Routine de la session orchestratrice

1. Lire `AGENTS.md`, `docs/specs/<tranche>/RUNBOOK.md`, `PROGRESS.md`, `features.json` ; `git log -10` ; `./init.sh`.
2. Lister les tâches **prêtes** : non passées, dépendances passées.
3. En choisir au plus `parallelisme_max`, dont les `fichiers` sont disjoints deux à deux. S'il n'y a pas de paire disjointe, une seule tâche.
4. Pour chaque tâche choisie, lancer un sous-agent avec son `modele` et son `effort`, dans un worktree git isolé, avec la consigne de la routine de session du runbook (test d'abord, implémentation, preuve). Le sous-agent ne modifie ni la spec ni les tests existants.
5. À son retour : lancer `./verify.sh <ID>` soi-même dans le worktree ; rouge → une seule reprise par le même sous-agent, puis arrêt et compte rendu.
6. Si `relecture` est vrai : lancer l'évaluateur (`evaluateur.modele`, `evaluateur.effort`) sur le diff, avec pour seule question : « ce diff est-il conforme à SPEC.md et aux limites d'AGENTS.md ? ». Il ne cherche pas ce qui manque. Un écart → retour au sous-agent, une fois.
7. Fusionner le worktree dans `main` (rebase), relancer `./verify.sh <ID>` après fusion, commit atomique, `passe: true`, entrée dans `PROGRESS.md` avec le modèle utilisé.
8. Reprendre à l'étape 2 tant qu'il reste des tâches prêtes et que le seuil d'alerte n'est pas atteint.

## Comptage et conditions d'arrêt

- Chaque sous-agent lancé compte pour une session dans le seuil d'alerte de la tranche. L'évaluateur ne compte pas.
- Les conditions d'arrêt du runbook s'appliquent à l'orchestrateur comme aux sous-agents. En plus : une fusion qui ne passe pas en rebase propre est une condition d'arrêt, pas un conflit à résoudre à la main.

## Mesure

`PROGRESS.md` note pour chaque tâche : modèle, effort, nombre de reprises, verdict de l'évaluateur. Au bilan de tranche, on compare le taux de passage du premier coup entre modèles. C'est cette mesure, pas l'intuition, qui règle la répartition de la tranche suivante.

## Ce qu'on attend de N1

Le parallélisme y est presque nul : presque toutes les tâches touchent `src/index.html`. Une seule paire est disjointe, T03 et T04. Le gain de cette tranche vient de la répartition par modèle, pas du parallélisme. À partir de N2, séparer le rendu en modules par écran (`src/ui-*.js`) pour ouvrir le parallélisme.
