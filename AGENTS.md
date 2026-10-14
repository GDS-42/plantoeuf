# AGENTS.md

(< 200 lignes ; revu comme du code)

## Projet

Outil libre de planification pour petit maraîcher : espaces, cultures, plantations,
points de vente, projection économique. Le noyau est un fichier HTML seul (ADR-004) :
JavaScript sans dépendance ni outil de build, données dans le navigateur, export JSON.
Cible à terme : application web installable et synchronisée (ADR-001).

## Commandes

- init : `./init.sh`
- tests unitaires : `node --test test/`
- bout en bout : `npx playwright test`
- vérifier une tâche : `./verify.sh <ID>` (ex. `./verify.sh T04`)
- vérifier une tranche : `./verify.sh <N1|N2|…>`
- assembler le fichier livrable : `./build.sh` (simple concaténation des modules dans `dist/index.html`)
- mettre en ligne : `git push` sur `ccr-997aaccf-xva49c` publie plantoeuf.vercel.app (Vercel relié au dépôt, réglages dans `vercel.json`).
  Le build Vercel relance les tests unitaires : s'ils échouent, le site en ligne ne change pas. Contrôle : connecteur Vercel,
  `list_deployments` filtré par le sha du commit, état READY.

## Conventions non évidentes

- Exigences au format « QUAND …, LE SYSTÈME DOIT … » ; identifiants EX-xx.
- Toute estimation est une fourchette basse / médiane / haute ; jamais un chiffre seul.
  Saisir un seul nombre remplit les trois.
- UUID, date de création, date de modification et suppression logique sur chaque enregistrement.
- Logique de calcul dans `src/calc.js`, sans aucun accès au DOM ; rendu dans `src/index.html` et les modules `src/ui-*.js` seulement.
- Aucune valeur agronomique ni prix codé en dur hors de la ferme d'exemple (`src/exemple.js`).
- Textes d'interface dans `src/i18n.js`, français simple, pas de jargon comptable.
- Production d'une plantation répartie uniformément par semaine sur sa fenêtre de récolte.

## Décisions structurantes

- ADR-004 Noyau en HTML seul — acceptée (`docs/adr/ADR-004.md`)
- ADR-001 Cible : application web synchronisée — acceptée, tranche S4 (`docs/adr/ADR-001.md`)
- ADR-002 Licence — à clarifier
- ADR-003 Moteur de synchronisation — reportée à S4 (`docs/adr/ADR-003.md`)

## Méthode de travail

- Spec et runbook de la tranche en cours dans `docs/specs/<tranche>/` : `SPEC.md`, `RUNBOOK.md`, `features.json`.
- Une tâche par session, dans l'ordre des dépendances de `features.json`.
- Test d'abord (rouge), implémentation (vert), refactor, preuve collée dans `PROGRESS.md`, commit atomique.
- L'agent ne modifie dans `features.json` que le champ `passe`, et dans `RUNBOOK.md` que les sections marquées ✎.
- Seuil d'alerte de la tranche atteint : s'arrêter et rendre compte, ne rien décider.
- Modèle : Opus 5.5 au minimum, effort élevé, pour toute tâche (`modele_minimum` de `features.json`).
- Tâche marquée `relecture: true` : avant le commit, faire relire le diff par un sous-agent relecteur du modèle `evaluateur` (Fable), restreint à la conformité à la spec ; l'évaluateur est toujours un autre modèle que le générateur.
- Mode orchestré (`docs/ORCHESTRATION.md`) : non activé en N1.

## Limites

- TOUJOURS : test avant code ; preuve de vérification ; logique hors du rendu.
- DEMANDER D'ABORD : ajouter une dépendance, même en ligne ; changer le modèle de données ; ajouter un objet absent du modèle.
- JAMAIS : modifier les tests ou la spec ; charger une ressource réseau depuis le fichier HTML ; envoyer des données hors du navigateur ; secrets dans le dépôt.

## Compaction

Conserver : tâche en cours, fichiers modifiés, commandes de vérification, décisions du jour.
