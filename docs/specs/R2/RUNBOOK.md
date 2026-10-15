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
- T51 · Les récoltes qui débordaient sur janvier suivant (dernières salades et brèdes, fin de tunnel) n'étaient vendues à aucune séance et portaient le calendrier à quatorze mois, plus large que sa boîte à 1366 px (test [T36] d'ajustement). La synthèse ne compte que les ventes des séances de l'année.
- T51 · Avec le pied du tableau qui porte charges fixes et revenu (N3), la dernière ligne du corps sort de la boîte défilée aux petites hauteurs (1280 × 720, 1000 × 700) : les tests de défilement prennent la ligne « revenu » du pied pour support.

## ✎ Décisions

- T50 · Ferme dans les hauts de Petite-Île ; 0,42 ha de légumes à un instant donné (0,36 ha par actif selon la DAAF), le reste des 1,5 ha en parcours des poules, engrais verts et chemins. Tomate sous abri seulement (flétrissement en plein champ). Ail vendu sans débouché détaillé (Fête de l'ail, collecteurs), ce qui garde une ligne « sans débouché » dans la matrice. Pas d'œufs à l'épicerie (vente à un revendeur hors de la dérogation des moins de 250 poules). Deux lots de 100 poules décalés, dates ramenées à l'année. L'achat des poulettes compte parmi les charges fixes. Quand une source ne donne qu'une moyenne, bornes aux deux tiers et aux quatre tiers.
- T50 · Le relecteur a signalé, à la relecture de la reprise, une attribution de source introduite par la reprise ; elle est corrigée selon son texte, sans troisième relecture (aucune valeur touchée).
- T51 · Toutes les récoltes finissent dans l'année de chargement (au plus tard le 30/12) : 55 → 51 plantations. `DONNEES.md` (fichier de T50, hors de la liste `fichiers` de T51) suit la ferme (§ 5 et § 11 : dates et surfaces [E], chiffres calculés) pour tenir l'invariant `exemple_tout_sourcé` ; aucune valeur sourcée ne change. En janvier, la ferme ne vend que ses œufs.
- T51 · Tests alignés : quand la nouvelle ferme n'offre plus le cas qu'un test examinait (variété qui change rendement et prix ; saison qui ne contient pas aujourd'hui), le test ajoute ses propres données plutôt que de perdre le cas.
- T52 · L'évaluateur juge que les deux tests de défilement ([T34] à 1000 × 700, [T14] à 1280 × 720) ont changé de propriété en T51 (dernière ligne de culture → ligne « revenu » du pied). Condition d'arrêt : T52 suspendue, mise en page inchangée, site en ligne inchangé ; décision demandée à l'humain (garder et consigner, ou corriger la mise en page et rétablir les assertions d'origine).
- T52 · **Décision de l'humain, 15/10/2026 : garder l'alignement et le consigner.** Les tests [T34] (1000 × 700) et [T14] (1280 × 720) vérifient sur la dernière ligne du tableau, celle du revenu dans le pied, que les colonnes des noms et des totaux restent figées et que rien ne les recouvre. La propriété « la dernière ligne de culture reste visible en bas de défilement » est abandonnée aux hauteurs de 700 à 768 px quand le pied porte les charges fixes et le revenu. Mise en page inchangée.

## ✎ Bilan de fin de tranche

Tranche terminée le 15/10/2026 en 3 sessions sur 6 : T50 (1 reprise), T51 (1 reprise), T52 (suspendue, puis close sur décision de l'humain). `./verify.sh R2` → exit 0 (143 tests unitaires, 165 de bout en bout). Évaluateur Fable : EX-51 à EX-54, invariants et fidélité au dossier conformes ; un écart sur deux tests de défilement, tranché par l'humain (voir ✎ Décisions). Déploiement du commit 14dab97 READY sur plantoeuf.vercel.app.

Résultat : la ferme d'exemple des hauts de Petite-Île (9 espaces, 11 cultures, 51 plantations de janvier à décembre, 200 poules en deux lots, quatre points de vente dont deux marchés, des paniers et une épicerie, dix charges fixes) donne 44 600 € de chiffre d'affaires et 18 200 € de revenu en médiane, chaque valeur renvoyant à `DONNEES.md`. L'écart EX-29 de S3 (œufs sans débouché) est levé par EX-53.

À suivre (points de l'évaluateur) :
- Calibrage offre-demande : la demande des débouchés dépasse la production presque toute l'année pour le chouchou, la courgette, la carotte, le chou et le haricot ; volumes estimés [E], à faire relire par un maraîcher.
- En janvier, la ferme ne vend que ses œufs (les récoltes de janvier viennent de plantations de l'année précédente, hors de l'année modélisée).
- « 200 poules » écrit en clair dans le texte de proposition (un gabarit `{poules}` demanderait de toucher `src/index.html`).
- Le test `exemple_tout_sourcé` vérifie les noms ; les valeurs sont prouvées par les relectures.
- Passage d'année : en 2027, le tableau aurait une colonne « déc. 2026 » (règle du jeudi) ; traité par la tranche R3 « Plusieurs années », décidée par l'humain le 15/10.
