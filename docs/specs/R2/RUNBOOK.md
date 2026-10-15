# RUNBOOK — Tranche R2

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 6 sessions agent pour les trois tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

Sur plantoeuf.vercel.app, « Charger l'exemple » montre une ferme maraîchère du Sud de La Réunion (cas type : un maraîcher seul, environ 1,5 ha, 200 poules) qui produit toute l'année, vend ses légumes et ses œufs au marché, en paniers et à une épicerie, et porte ses charges fixes ; la synthèse en donne le revenu. Chaque chiffre renvoie à `docs/specs/R2/DONNEES.md`. `./verify.sh R2` → code de sortie 0.

## Orientation

- Données dans `src/exemple.js` seulement ; dossier des sources dans `docs/specs/R2/DONNEES.md`.
- Recherche documentaire par quatre agents en parallèle (cultures ; prix de vente ; poules ; débouchés, trajets et charges), rapports dans le dossier de travail de l'agent, synthèse par l'agent principal.
- Tests : `test/exemple-r2.*` (nouveaux) ; tests alignés listés dans la spec, chaque retouche consignée dans `PROGRESS.md`.
- Identifiants : tâches T50 à T52, exigences EX-51 à EX-54, invariants `exemple_sans_sur_occupation` et `exemple_tout_sourcé`.
- Mise en ligne : chaque push sur la branche publie plantoeuf.vercel.app ; ne pousser qu'un état où toute la suite passe.

## Tranches

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T50 | EX-51 | Dossier de données sourcées (`DONNEES.md`) | relecture Fable sans écart | — |
| T51 | EX-51 à EX-54 | Nouvelle ferme d'exemple ; alignement des tests | `./verify.sh T51` → exit 0 ; `./verify.sh R2` → exit 0 | T50 |
| T52 | toutes | Vérification de bout en bout, puis revue par l'évaluateur séparé | `./verify.sh R2` → exit 0 ; rapport sans écart | T50, T51 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh N3`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh R2`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique, puis le pousser (mise en ligne).
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche ; les agents de recherche aussi.
- `relecture: true` (T50, T51) : un sous-agent Fable, effort élevé, contexte frais. T50 : « le dossier est-il fidèle à ses sources, et ses fourchettes cohérentes ? » ; T51 : « ce diff est-il conforme à `SPEC.md`, au dossier et aux limites d'`AGENTS.md`, et les tests alignés vérifient-ils toujours la même propriété ? ». Un écart → une seule reprise, puis arrêt et compte rendu.
- T52 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain demande que l'agent avance seul : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions). Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md` et choisir la voie la plus prudente :

- une exigence paraît fausse ou contredit un test qui n'est pas dans la liste des tests à aligner ;
- un test aligné ne peut redevenir vert qu'en changeant la propriété qu'il vérifie ;
- une modification de modèle de données, de règle de calcul ou de dépendance semble nécessaire ;
- une valeur ne trouve aucune source, même non réunionnaise ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté ne change pas (version 5). Une ferme d'exemple déjà chargée avant R2 s'efface comme avant (les identifiants retenus ne portent pas de charges). Chaque tâche se défait par `git revert` ; Vercel garde les déploiements précédents.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

- T50 · Le proxy de l'environnement refuse l'ouverture directe des sites officiels (DAAF, Agreste, ARMEFLHOR, INSEE) : les agents n'ont lu que les extraits du moteur de recherche. Le quota de recherches d'un tour (200) se partage entre les agents lancés ensemble ; les compléments ont été lancés au tour suivant.
- T50 · Une culture plantée à l'automne (gingembre) se récolte l'année suivante, hors de l'année modélisée et sans séance : elle est écartée de la ferme.

## ✎ Décisions

- T50 · Ferme dans les hauts de Petite-Île ; 0,42 ha de légumes à un instant donné (0,36 ha par actif selon la DAAF), le reste des 1,5 ha en parcours des poules, engrais verts et chemins. Tomate sous abri seulement (flétrissement en plein champ). Ail vendu sans débouché détaillé (Fête de l'ail, collecteurs), ce qui garde une ligne « sans débouché » dans la matrice. Pas d'œufs à l'épicerie (vente à un revendeur hors de la dérogation des moins de 250 poules). Deux lots de 100 poules décalés, dates ramenées à l'année. L'achat des poulettes compte parmi les charges fixes. Quand une source ne donne qu'une moyenne, bornes aux deux tiers et aux quatre tiers.
- T50 · Le relecteur a signalé, à la relecture de la reprise, une attribution de source introduite par la reprise ; elle est corrigée selon son texte, sans troisième relecture (aucune valeur touchée).

## ✎ Bilan de fin de tranche
