# plantoeuf

Outil libre de planification pour petit maraîcher : espaces, cultures, plantations, points de vente, projection économique. Le livrable est **un seul fichier HTML**, sans serveur ni installation, qui stocke ses données dans le navigateur et les exporte en JSON.

État : tranche N1 en cours (espaces, cultures, plantations → tableau économique). Aucun livrable utilisable encore.

## Pour un agent de code

Lire dans l'ordre : `AGENTS.md`, `docs/specs/N1/RUNBOOK.md`, `PROGRESS.md`. Puis suivre la routine de session du runbook : une tâche non passée de `docs/specs/N1/features.json`, test d'abord, preuve, relecture par un autre modèle si la tâche le demande, commit. Une tâche par session.

Prompt de session, identique à chaque lancement :

> Lis `AGENTS.md`, `docs/specs/N1/RUNBOOK.md` et `PROGRESS.md`. Suis la routine de session du runbook : prends la première tâche non passée de `docs/specs/N1/features.json` dont les dépendances sont passées, écris le test d'abord, implémente, colle la preuve dans `PROGRESS.md`. Si la tâche porte `relecture: true`, fais relire le diff par un sous-agent relecteur du modèle `evaluateur`, en contexte frais, restreint à la conformité à `SPEC.md`. Commite, mets `passe` à `true`. Une seule tâche par session. Respecte les conditions d'arrêt du runbook.

## Pour un humain

- `docs/BRIEF.md` : le problème, les hypothèses, les tranches.
- `docs/specs/N1/SPEC.md` : la spec de la tranche en cours, gelée.
- `docs/adr/` : les décisions d'architecture.
- `./init.sh` puis `./verify.sh N1` : tout vérifier.
- `./build.sh` : produire `dist/index.html`, le fichier à ouvrir dans un navigateur.

Documents de travail (brainstorming, pré-cahier des charges complet) : voir les artefacts liés dans `docs/BRIEF.md`.

## Licence

À décider (ADR-002, MIT ou AGPL). En attendant, tous droits réservés.
