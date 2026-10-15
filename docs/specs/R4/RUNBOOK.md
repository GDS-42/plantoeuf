# RUNBOOK — Tranche R4

Spec : `SPEC.md` (lecture seule) · Tâches : `features.json` · Journal : `PROGRESS.md` à la racine.

**Seuil d'alerte : 10 sessions agent pour les sept tâches.** Atteint, l'agent s'arrête et rend compte (tâches passées, tâche en cours, ce qui bloque) ; l'humain décide de continuer, de réécrire l'exigence ou de découper la tâche.

## But et résultat observable

Sur plantoeuf.vercel.app, la page Cultures permet de saisir les familles et leur délai de retour, le groupe de chaque culture, les associations (voisinage, précédent) et un ordre de rotation ; une plantation qui revient trop tôt est signalée sur sa ligne, sur celle de son espace et dans le calendrier ; le tiroir d'une plantation dit ce qui la précède et ce qui la voisine ; « Que planter ici ? » propose, pour un espace et une date, des cultures classées avec leurs raisons. La ferme d'exemple porte des règles sourcées. `./verify.sh R4` → code de sortie 0.

## Orientation

- Modèle : `src/store.js` (version 6). Règles : `src/calc.js`, sans DOM. Saisie : `src/ui-saisie.js` et `src/index.html`. Aides : `src/ui-rotation.js` (nouveau), `src/ui-saisie.js` (aperçu, alertes), `src/ui-calendrier.js` (marque).
- Données de l'exemple : `src/exemple.js` ; sources dans `docs/specs/R2/DONNEES.md` (§ 14) et `docs/specs/R2/recherche/`.
- Identifiants : tâches T58 à T64, exigences EX-61 à EX-66, scénarios S18 à S21, invariants `alerte_seulement`, `suggestion_sans_plantation`, `sans_regle_comme_r3`, `famille_par_nom`.
- Mise en ligne : chaque push sur la branche publie plantoeuf.vercel.app ; ne pousser qu'un état où toute la suite passe.

## Tranches

| ID | Exig. | Tâche | Fini quand (commande → attendu) | Dépend de |
| --- | --- | --- | --- | --- |
| T58 | EX-66 | Données de rotation sourcées (recherche, `DONNEES.md` § 14) | relecture Fable sans écart | — |
| T59 | EX-61 | Modèle version 6 | `./verify.sh T59` → exit 0 | — |
| T60 | EX-62 à EX-65 | Règles de calcul | `./verify.sh T60` → exit 0 | T59 |
| T61 | EX-61 | Saisie : familles, groupe, associations, rotations | `./verify.sh T61` → exit 0 | T59 |
| T62 | EX-62 à EX-65 | Affichage des aides : tiroir, lignes, calendrier, « Que planter ici ? » | `./verify.sh T62` → exit 0 | T60, T61 |
| T63 | EX-66 | Règles de la ferme d'exemple | `./verify.sh T63` → exit 0 | T58, T60, T62 |
| T64 | toutes | Vérification de bout en bout, captures, évaluateur séparé | `./verify.sh R4` → exit 0 ; rapport sans écart | T58 à T63 |

## Routine de chaque session

1. Lire `PROGRESS.md`, `git log -10` et `features.json`.
2. Lancer `./init.sh` et le test de fumée (`./verify.sh R3`).
3. Prendre **une seule** tâche non passée dont les dépendances sont passées.
4. Écrire le test (rouge).
5. Implémenter (vert), puis refactorer.
6. Lancer la vérification de la tâche **et** `./verify.sh R4`, coller la sortie comme preuve dans `PROGRESS.md`.
6 bis. Si la tâche porte `relecture: true` : faire relire par le sous-agent relecteur et noter son verdict.
7. Faire un commit atomique, puis le pousser (mise en ligne) et contrôler le déploiement (READY, filtré par sha).
8. Mettre à jour `PROGRESS.md` et le champ `passe` de `features.json`.

## Modèles et relecture (mode simple)

- Opus 5.5 au minimum, effort élevé, pour toute tâche ; les agents de recherche aussi.
- `relecture: true` (T58 à T63) : un sous-agent Fable, effort élevé, contexte frais. T58 : « le dossier est-il fidèle à ses sources, et ses fourchettes cohérentes ? » ; les autres : conformité à `SPEC.md` et aux limites d'`AGENTS.md`. Un écart → une seule reprise, puis arrêt et compte rendu.
- T64 : l'évaluateur Fable revoit toute la tranche.

## Conditions d'arrêt

L'humain demande que l'agent avance seul : sauf seuil d'alerte atteint, l'agent tranche lui-même, au plus près de la spec, et consigne sa décision (✎ Décisions). Les conditions ci-dessous l'obligent à suspendre la tâche, consigner le problème dans `PROGRESS.md` et choisir la voie la plus prudente :

- un test existant devrait être modifié ;
- une exigence paraît fausse ou contredit une règle d'une tranche précédente ;
- une modification du modèle de données autre que celle de la spec semble nécessaire ;
- une valeur de la ferme d'exemple ne trouve aucune source ;
- deux tentatives de correction successives échouent ;
- le seuil d'alerte est atteint ;
- le relecteur signale un écart qu'une reprise n'a pas résolu.

## Idempotence et retour arrière

Le format exporté passe en version 6 ; un fichier de version 1 à 5 s'importe par migration. Un fichier de version 6 n'est pas lu par une version antérieure de l'outil (refus « version plus récente ») : un retour arrière du code demande de réimporter un export d'avant R4. Chaque tâche se défait par `git revert` ; Vercel garde les déploiements précédents.

## ✎ Journal de progression

(voir `PROGRESS.md` à la racine)

## ✎ Surprises et découvertes

- T63 · Sur la ferme d'exemple, la ligne de la Parcelle 2 nomme huit fois « Brède petsaï du … » dans son alerte de retour trop tôt : lisible, mais longue. Un regroupement par culture (« Brède petsaï × 8, du 04/06/2026 au 29/10/2026 ») a été retiré de T63 (hors de sa liste de fichiers, sans test) ; il est proposé à l'humain comme suite, avec son propre test.
- T58 · Aucune source réunionnaise ne chiffre un délai de retour ni n'énonce une association entre les cultures de l'exemple ; tout vient de sources non réunionnaises ou nationales, lues dans les extraits du moteur de recherche (proxy).

## ✎ Décisions

- T63 · Chaque famille et chaque association de l'exemple porte une note qui renvoie au § 14 du dossier de données et à ses sources (K1 à K30). L'effacement de l'exemple retire associations, rotations et familles avant les cultures.
- T62 · `sans_regle_comme_r3` à l'écran : tant que la ferme n'a ni famille, ni association, ni rotation, ni culture avec un groupe, aucune aide ne s'affiche (ni alerte, ni marque du calendrier, ni « Avant / À côté » dans le tiroir, ni bouton « Que planter ici ? »). « Que planter ici ? » est sur la ligne de chaque espace et sous son nom dans le calendrier ; la date proposée est celle du jour, la surface est la surface libre tant que l'utilisateur ne la change pas. Une alerte de rotation a sa classe (`alerte-rotation`), la barre sa marque (`cal-retour`), légendée seulement quand une barre la porte.
- T61 · Les familles nommées par une culture et sans fiche s'affichent en tête de la liste des familles, chacune avec un bouton qui ouvre le tiroir, nom écrit : c'est une invitation à saisir, pas une alerte de rotation (elle paraît aussi sur une ferme d'avant R4). Dans la ligne d'une famille, `data-fait` est porté par la valeur du fait, pour que la liste des cultures se lise seule. Une rotation saisie avec un rang vide garde les groupes choisis, dans l'ordre. Le fait « Groupe » d'une culture n'apparaît que si le groupe est donné (`sans_regle_comme_r3`).
- T60 · « La dernière culture de l'espace » (groupe suivant) est celle dont la récolte s'est achevée en dernier avant la date, sans limite de temps ; une plantation encore en place n'en est pas une. Une plantation en cours de saisie vient après celles du même jour. Un précédent finit strictement avant la date de mise en place (une récolte qui finit le jour même est un voisin, période inclusive de N1). Ajout de `associationsDefavorables`, qui regroupe par plantation les précédents et voisins défavorables (EX-64).
- T59 · Une association lie deux cultures différentes (une culture après elle-même relève du délai de famille ; un voisinage d'une culture avec elle-même n'a pas de sens). La borne haute d'une rotation est le nombre de groupes du vocabulaire (6).
- T58 · Quand le rapport proposait une borne estimée et qu'une variante entièrement sourcée existait, la variante sourcée est retenue (Astéracées 3 / 3 / 4, Amaryllidacées 4 / 5 / 5, Fabacées 5 / 5 / 5). Associations retenues : seulement celles appuyées par un essai ou une fiche technique ; aucune avec le chouchou.

## ✎ Bilan de fin de tranche
