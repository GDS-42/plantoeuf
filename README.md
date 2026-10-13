# plantoeuf

Outil libre de planification pour petit maraîcher : espaces, cultures, plantations, points de vente, projection économique. Le livrable est **un seul fichier HTML**, sans serveur ni installation, qui stocke ses données dans le navigateur et les exporte en JSON.

État : tranche N1 en cours (espaces, cultures, plantations → tableau économique). Aucun livrable utilisable encore.

## Pour un agent de code

Lire dans l'ordre : `AGENTS.md`, `docs/specs/N1/RUNBOOK.md`, `PROGRESS.md`. Puis suivre la routine de session du runbook : une tâche non passée de `docs/specs/N1/features.json`, test d'abord, preuve, commit.

## Pour un humain

- `docs/BRIEF.md` : le problème, les hypothèses, les tranches.
- `docs/specs/N1/SPEC.md` : la spec de la tranche en cours, gelée.
- `docs/adr/` : les décisions d'architecture.
- `./init.sh` puis `./verify.sh N1` : tout vérifier.
- `./build.sh` : produire `dist/index.html`, le fichier à ouvrir dans un navigateur.

Documents de travail (brainstorming, pré-cahier des charges complet) : voir les artefacts liés dans `docs/BRIEF.md`.

## Licence

À décider (ADR-002, MIT ou AGPL). En attendant, tous droits réservés.
