# RUNBOOK — Tranche S3

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 11 sessions agent pour les sept tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

La ferme d'exemple élève un lot de poules : le tableau économique montre, sous les cultures, l'atelier poules — œufs, chiffre d'affaires, coût de l'aliment et marge — et la marge de la ferme déduit l'aliment ; les œufs ont leur ligne dans la matrice offre-demande et se vendent aux points de vente. `./verify.sh S3` → code de sortie 0.

## Orientation

- Arborescence : comme en N2. Calculs nouveaux dans `src/calc.js` ; saisie des lots dans `src/ui-poules.js` ; tests unitaires dans `test/poules.test.js`, de bout en bout dans `test/poules.e2e.js`.
- Les tests de N1, de P1 et de N2 ne bougent pas, sauf la ligne du test `[T08]` et les trois assertions des tests `[T18]` qui fixent le numéro de version : elles comparent désormais à la version courante (accord de l'humain du 13/10/2026). Une ferme sans lot doit donner exactement le tableau de N2 (invariant `sans_lot_comme_n2`).
- Identifiants de tâches : T26 à T32.
- Glossaire : lot = des poules arrivées ensemble et réformées ensemble ; ponte = œufs par poule et par jour ; réforme = départ du lot ; atelier = une production de la ferme qui a ses produits et ses charges (le maraîchage, les poules).
- Maquettes : le panneau des lots et le bloc « Atelier poules » se dessinent d'abord sur le canevas de design (Claude Design), puis se codent.

## Tranches (squelette de bout en bout d'abord)

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T26 | EX-25 | Modèle : lots de poules dans le store ; format en version 3, migration des versions 1 et 2 ; export et import à l'identique | `./verify.sh T26` → exit 0 | — |
| T27 | EX-25 | Panneau de saisie des lots ; « Œufs » dans le choix du produit d'un débouché | `./verify.sh T27` → exit 0 | T26 |
| T28 | EX-26 | Ponte et aliment par semaine | `./verify.sh T28` → scénario S7 (semaines) vert | T26 |
| T29 | EX-27 | Atelier poules dans le tableau économique ; aliment déduit de la marge de la ferme ; synthèse | `./verify.sh T29` → scénarios S7 et S9 verts | T28 |
| T30 | EX-28 | Œufs dans les ventes : matrice offre-demande, ventes plafonnées, points de vente | `./verify.sh T30` → scénario S8 vert | T29 |
| T31 | EX-29 | Ferme d'exemple : un lot de poules et des débouchés pour ses œufs | `./verify.sh T31` → exit 0 | T27, T30 |
| T32 | toutes | Vérification de bout en bout de la tranche, puis revue par l'évaluateur séparé, restreinte à la conformité à la spec | `./verify.sh S3` → exit 0 ; rapport sans écart | T26 à T31 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh N2`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh S3`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire le diff par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique.
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche.
- `relecture: true` (T26 modèle, T28 à T30 calculs) : avant le commit, un sous-agent Fable, effort élevé, contexte frais, avec pour seule question : « ce diff est-il conforme à `SPEC.md` et aux limites d'`AGENTS.md` ? ». Un écart → une seule reprise, puis arrêt et compte rendu.
- T32 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain a demandé le 13/10/2026 que l'agent avance seul jusqu'à la livraison : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions) au lieu d'attendre une réponse. Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md`, choisir la voie la plus prudente (celle qui ne modifie ni un test existant ni la spec) et le signaler au bilan de fin de tranche. Le seuil d'alerte, lui, reste un arrêt : l'agent rend compte et ne décide rien (AGENTS.md).

- une exigence paraît fausse ou contredit un test ;
- un test de N1, de P1 ou de N2 ne peut redevenir vert qu'en le modifiant (hors les lignes de version des tests `[T08]` et `[T18]`, accord de l'humain) ;
- une modification de spec, de modèle de données au-delà de la spec, ou de dépendance semble nécessaire ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint, ou le contexte dépasse environ 60 % ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté passe en version 3 : un fichier de N1 (version 1) ou de N2 (version 2) s'importe dans S3 par migration (la liste des lots y est vide) ; un fichier HTML plus ancien refuse un fichier de version 3. Chaque tâche se défait par `git revert`.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

- T26 · Les premiers tests de T26 fixaient « version 3 » en dur, contre la décision même qu'ils appliquaient : relevé par le relecteur, corrigé en une reprise.
- T27 · Avec un 9e raccourci, la barre de raccourcis passe sur trois lignes et cachait le titre du panneau atteint ; la marge de défilement suit désormais la hauteur réelle de la barre.
- T31 · Le test `[T24]` de N2 interdit un débouché qui ne vend pas une culture : il bloque les débouchés d'œufs dans la ferme d'exemple demandés par EX-29 (voie prudente, proposition à l'humain).
- T31 · Le test `[T12]` P1-S1 à 1280 × 720 reste le plus sensible à toute ligne ajoutée au-dessus des cultures dans le tableau.
- T32 · Le test `[T14]` P1-S2 suppose que la dernière culture est la dernière ligne du tableau ; avec l'atelier poules dessous, il ne passe qu'à un pixel près (la ligne visée est sous l'en-tête figé). Proposition consignée dans PROGRESS.md.

## ✎ Décisions

- T26 · Le store vérifie que les dates d'un lot se suivent (arrivée ≤ début de ponte ≤ réforme, le même jour permis) à l'ajout, à la modification et à l'import ; code d'erreur `dates_desordonnees`. Les tests comparent la version du format à `Store.VERSION` : un prochain objet ne touchera plus aucun test.
- T27 · Le panneau « Lots de poules » vient après les débouchés ; ses dix champs sont obligatoires. Le choix du produit d'un débouché propose « Œufs » (identifiant `oeufs`, `Calc.OEUFS`) après les cultures ; un débouché d'œufs se lit « €/œuf » et « œufs par séance ». La marge de défilement des panneaux suit la hauteur de la barre de raccourcis (`--hauteur-raccourcis`, mesurée au démarrage et à chaque changement de taille).
- T27 · Maquettes sur le canevas Claude Design : variante A retenue (bandeaux « Maraîchage » et « Atelier poules » dans le tableau, affichés seulement quand la ferme a au moins un lot).
- T28 · Les œufs et l'aliment se comptent jour par jour, puis par semaine du lundi au dimanche : une semaine entamée ne compte que ses jours de ponte ou de présence. Chaque semaine porte aussi la valeur des œufs au prix de l'œuf de leur lot (pour les œufs sans débouché). La liste des lots donne les œufs d'une semaine pleine de ponte et le coût d'une semaine d'aliment.
- T29 · Maquette A mise en œuvre : avec au moins un lot, un bandeau « Maraîchage · n cultures » (s'il y a des cultures) puis, sous les cultures, un bandeau « Atelier poules · n lots, n poules » et le bloc « Œufs » (œufs, chiffre d'affaires, coût de l'aliment, marge de l'atelier), sur un fond chaud qui le distingue. Le pied ajoute « Coût de l'aliment estimé » ; la marge de la ferme déduit séances et aliment, du pire au meilleur. Œufs affichés en nombres entiers.
- T30 · Les œufs de tous les lots forment un produit `oeufs`, placé après les cultures dans la matrice. Avec au moins un débouché d'œufs actif, le tableau ne compte que les œufs vendus (règles de N2 : demande, meilleur prix d'abord, mois du jeudi) et l'aliment reste compté chaque semaine ; sans débouché, toute la ponte se vend au prix de l'œuf de son lot. Un débouché d'œufs sans lot montre une demande que rien ne couvre.
- T30 · Avec un lot et sans débouché d'œufs, la matrice montre une ligne « Œufs » en état « sans débouché », comme une culture ; l'info-bulle dit désormais « toute la production se vend à son prix estimé ». Avec un débouché, les œufs des semaines sans séance ne comptent pas dans le tableau (seul le vendu compte, comme une culture de N2).
- T31 · Lot de la ferme d'exemple : « Lot de printemps », 100 poulettes prêtes à pondre arrivées le 2 mars, ponte du 6 avril au 25 octobre, 0,6 à 0,8 œuf par poule et par jour, 8 % de pertes, 115 à 135 g d'aliment à 0,70 à 0,95 € le kg (aliment importé), œuf à 0,40 à 0,50 €. Repère du pré-cahier des charges : environ 125 g par poule et par jour. Ses œufs se vendent sans débouché tant que le test `[T24]` n'admet pas les débouchés d'œufs (voir PROGRESS.md).
- T31 · Plus de bandeau « Maraîchage » au-dessus des cultures (P1-S1 à 1280 × 720) ; le bandeau « Atelier poules » reste. Dans la matrice, les œufs s'affichent en entiers et la première colonne devient « Culture ou œufs » quand ils y figurent.

## ✎ Bilan de fin de tranche

**13/10/2026 — tranche S3 livrée en 7 sessions sur 11, avec un écart en attente de l'humain.** T26 à T31 sont passées ; T32 ne l'est pas : son critère est un rapport sans écart, et l'évaluateur Fable relève un écart, connu et consigné, sur EX-29. `./verify.sh S3` → exit 0 (94 tests unitaires, 70 de bout en bout).

- **Ce que la tranche apporte** : les lots de poules se saisissent (panneau « Lots de poules ») ; l'outil estime les œufs pondus et le coût de l'aliment semaine par semaine ; le tableau économique montre l'atelier poules sous les cultures (œufs, chiffre d'affaires, aliment, marge de l'atelier), et la marge de la ferme déduit séances et aliment ; les œufs se vendent comme une culture dès qu'ils ont un débouché (matrice, ventes plafonnées, points de vente) ; le format exporté passe en version 3.
- **Décisions de l'humain** (13/10/2026) : version 3 du format ; les lignes de version des tests `[T08]` et `[T18]` comparent à la version courante ; l'agent avance seul jusqu'à la livraison.
- **Reprises** : T26 (tests qui fixaient « version 3 » en dur, relevés par le relecteur). Relectures Fable conformes pour T28, T29, T30. Retouches après l'évaluation : œufs en entiers dans la liste des lots, aide des débouchés.
- **Écart consigné (seul écart de l'évaluateur)** : EX-29 demande des débouchés pour les œufs dans la ferme d'exemple ; le test `[T24]` de N2 l'interdit. Voie prudente : l'exemple vend ses œufs sans débouché. **À décider par l'humain** : autoriser dans `[T24]` les débouchés d'œufs (une ligne : accepter `produitId === Calc.OEUFS`), puis ajouter les trois débouchés d'œufs préparés à l'exemple et inverser les deux assertions du test `[T31]` qui figent leur absence ; T31 et T32 passeront alors. L'évaluateur juge la voie suivie conforme aux conditions d'arrêt.
- **Design** : deux variantes maquettées sur le canevas Claude Design ; la A (bloc d'atelier sous les cultures, sur fond chaud) est retenue. Son bandeau « Maraîchage » a été retiré : il poussait la courgette sous le pli à 1280 × 720 (P1-S1).
- **À surveiller** : le test `[T12]` P1-S1 à 1280 × 720 reste le plus sensible à toute ligne ajoutée au-dessus des cultures ; Firefox n'est pas testé (Chromium seulement).
