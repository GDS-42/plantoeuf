# RUNBOOK — Tranche P1

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 9 sessions agent pour les sept tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

La ferme d'exemple s'ouvre sur un écran de PC en deux volets : les panneaux de saisie à gauche, la synthèse et le tableau économique à droite, toujours visibles. `./verify.sh P1` → code de sortie 0, puis l'humain valide les captures d'écran.

## Orientation

- Arborescence : `src/` (modules ; le rendu se découpe en `src/ui-*.js` dès T11), `test/` (tests ; ceux de P1 dans `test/presentation.e2e.js`), `dist/` (fichier assemblé, non versionné), `docs/specs/P1/`.
- Les tests de N1 ne bougent pas : ils protègent le comportement pendant toute la refonte. Un test de N1 qui casse signale une régression du rendu, jamais un test à adapter.
- Identifiants de tâches : T11 à T17, à la suite de N1, pour que le filtre `[Txx]` de `verify.sh` reste sans ambiguïté.
- Le canevas de design (maquettes) sert à choisir la mise en page avant le code.
- Dans le conteneur cloud : `PLAYWRIGHT_BROWSERS_PATH` vers l'alias local du Chromium installé (voir le runbook de N1, Surprises).

## Tranches (squelette de bout en bout d'abord)

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T11 | — | Rendu découpé en modules `src/ui-*.js`, sans changement de comportement ; `verify.sh` reconnaît les tranches P et S | `./verify.sh T11` et `./verify.sh N1` → exit 0 | — |
| T12 | EX-11, EX-16 (défilement) | Deux volets : saisie à gauche, projection toujours visible à droite ; pas de défilement horizontal de page | `./verify.sh T12` → scénario P1-S1 vert | T11 |
| T13 | EX-12, EX-15 | Panneaux de saisie titrés avec leur nombre d'éléments ; mode modification signalé | `./verify.sh T13` → exit 0 | T12 |
| T14 | EX-13, EX-14 | Tableau : mois et cultures figés au défilement ; synthèse de la saison en tête | `./verify.sh T14` → scénarios P1-S2 et P1-S3 verts | T12 |
| T15 | EX-16 | Lisibilité : tailles de texte, contrastes, focus clavier visible | `./verify.sh T15` → exit 0 | T13, T14 |
| T16 | toutes | Vérification de bout en bout de la tranche, puis revue par l'évaluateur séparé, restreinte à la conformité à la spec | `./verify.sh P1` → exit 0 ; rapport sans écart | T11 à T15 |
| T17 | EX-17 | Captures d'écran envoyées à l'humain, qui valide | validation humaine | T16 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh N1` : rien de N1 ne doit casser).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh N1`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire le diff par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique.
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche.
- `relecture: true` (T11, T12 : la structure dont dépendent N2 et S3) : avant le commit, un sous-agent Fable, effort élevé, contexte frais, avec pour seule question : « ce diff est-il conforme à `SPEC.md` et aux limites d'`AGENTS.md` ? ». Un écart → une seule reprise, puis arrêt et compte rendu.
- T16 : l'évaluateur Fable revoit toute la tranche.
- T17 : seul l'humain met `passe` à `true`, ou dit à l'agent de le faire.

## Conditions d'arrêt — s'arrêter et demander si

- une exigence paraît fausse ou contredit un test ;
- un test de N1 ne peut redevenir vert qu'en le modifiant ;
- une modification de spec, de modèle de données ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint, ou le contexte dépasse environ 60 % ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

La tranche ne touche ni au modèle de données ni au format exporté : une ferme enregistrée ou exportée avec N1 s'ouvre à l'identique. Chaque tâche se défait par `git revert`.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

## ✎ Décisions

## ✎ Bilan de fin de tranche
