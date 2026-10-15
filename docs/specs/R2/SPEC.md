# SPEC — Tranche R2 « Une ferme d'exemple du Sud de La Réunion, chiffres sourcés »

Liens : `docs/BRIEF.md` (cas type), `docs/specs/N1/SPEC.md` (EX-10), `docs/specs/N2/SPEC.md` (EX-24), `docs/specs/S3/SPEC.md` (EX-29), `docs/specs/N3/SPEC.md` (EX-50)
Statut : **rédigée par l'agent** le 15/10/2026, à la demande de l'humain du 14/10/2026 (« reprendre les données de la ferme d'exemple pour les adapter à La Réunion — refonte complète — avec les chiffres officiels »), choix de l'humain du 14/10/2026 ci-dessous. Lecture seule pour l'agent une fois la tranche commencée.

## Objectif

La ferme d'exemple montre l'outil sur une ferme crédible. Celle de N1 est un ensemble d'ordres de grandeur jamais relus (180 m², une saison, l'Ouest). R2 la remplace par une ferme du cas type du brief, placée dans le Sud de La Réunion, sur toute l'année, dont chaque rendement, prix et coût vient d'une source publique citée dans un dossier de données.

## Choix de l'humain (14/10/2026)

- **Lieu** : Sud, mi-pente (Le Tampon, Petite-Île, Saint-Joseph).
- **Taille et période** : le cas type du brief — un maraîcher seul, environ 1,5 ha, 200 poules — sur toute l'année, saison chaude et cyclonique comprise.
- **Ajouts** : des charges fixes réelles (la synthèse montre alors la tuile « Revenu ») ; des débouchés pour les œufs (ce qui ferme l'écart EX-29 de S3).
- **Tests** : accord pour aligner les tests qui figent les données de l'ancienne ferme d'exemple sur la nouvelle (voir « Points tranchés »).

## Hors périmètre

Aucun changement du modèle de données ni des règles de calcul ; heures de travail ; rotation pluriannuelle ; trésorerie complète ; aides et subventions ; plusieurs années.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-51 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT présenter une ferme maraîchère du Sud de La Réunion à mi-pente, du cas type du brief (un maraîcher seul, environ 1,5 ha, 200 poules), qui produit sur les douze mois de l'année de chargement, sans sur-occupation, et dont chaque valeur agronomique, prix et coût est une fourchette tirée d'une source citée dans `docs/specs/R2/DONNEES.md` | Test unitaire et de bout en bout ; relecture du dossier |
| EX-52 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT y inclure ses charges fixes réelles, et la synthèse DOIT en donner le revenu | Test unitaire et de bout en bout |
| EX-53 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT y inclure des débouchés pour ses œufs, à des prix et des volumes sourcés | Test unitaire et de bout en bout |
| EX-54 | QUAND l'utilisateur efface la ferme d'exemple, LE SYSTÈME DOIT retirer tout ce qu'elle a créé, charges fixes et débouchés d'œufs compris, et seulement cela | Test unitaire et de bout en bout |

## Règles de la nouvelle ferme

- Toutes ses dates (plantations, séances, lots) tombent dans l'année de chargement, comme aujourd'hui ; les récoltes peuvent déborder sur l'année suivante.
- Chaque culture a ses coûts de mise en place (EX-50 reste vraie) ; un véhicule sert ses points de vente.
- Le dossier `DONNEES.md` donne, pour chaque valeur de `src/exemple.js` : la fourchette, la ou les sources (organisme, titre, lien, date) et le passage de la source à la fourchette ; une référence non réunionnaise est marquée comme telle.
- `src/exemple.js` reste le seul fichier qui porte des valeurs agronomiques et des prix ; son en-tête renvoie au dossier.
- Le texte de proposition de l'exemple garde « La Réunion » et dit « sur toute l'année ».

## Invariants nommés

- Ceux des tranches précédentes.
- `exemple_sans_sur_occupation` : la ferme d'exemple chargée n'a aucune sur-occupation.
- `exemple_tout_sourcé` : aucune valeur de `src/exemple.js` sans ligne dans `DONNEES.md`.

## Fichiers et interfaces

- `docs/specs/R2/DONNEES.md` (nouveau) : le dossier de données.
- `src/exemple.js` : nouvelles données ; `CHARGES` ; débouchés d'œufs ; l'effacement retire aussi les charges.
- `src/i18n.js` : texte de proposition de l'exemple.
- `test/exemple-r2.test.js`, `test/exemple-r2.e2e.js` (nouveaux) ; tests alignés (voir ci-dessous).

## Points tranchés le 14/10/2026

- **Alignement des tests (accord de l'humain).** Un test qui fige une donnée de l'ancienne ferme d'exemple est aligné sur la nouvelle : il garde son identifiant et la propriété qu'il vérifie ; seules changent les valeurs, noms, nombres et dates attendus, et la ligne de l'exemple qui lui sert de support (la culture qu'on rétrécit, la plantation qu'on agrandit, la ligne de la matrice qu'on lit). Fichiers concernés : `test/exemple.test.js`, `test/exemple.e2e.js`, `test/exemple-n3.e2e.js`, `test/exemple-poules.e2e.js`, `test/exemple-ventes.e2e.js`, `test/tranche.e2e.js`, `test/presentation.e2e.js`, `test/p2-socle.e2e.js`, `test/p2-lisibilite.e2e.js`, `test/p2-ventes.e2e.js`, `test/p2-ferme.e2e.js`, `test/p2-synthese.test.js`, `test/p2-synthese.e2e.js`, `test/ventes.test.js`, `test/poules.test.js`. Chaque retouche est listée dans `PROGRESS.md` (fichier, test, avant → après).
- **Œufs vendus par débouchés (EX-53).** Les assertions qui affirmaient que les œufs de l'exemple se vendent sans débouché (tests `[T24]`, `[T31]`, `[T34]`, `[T35]`) affirment l'inverse ; un test qui se servait de la ligne des œufs comme exemple de « sans débouché » prend une autre ligne sans débouché, ou ses propres données.
- **Charges fixes (EX-52).** La synthèse de l'exemple a cinq tuiles ; le point tranché de N3 (« la ferme d'exemple n'a pas de charge fixe ») est levé.
- **Horloge.** `test/p2-synthese.e2e.js` fixe l'horloge (comme `test/p2-ferme.e2e.js`) : ses mois attendus ne dépendent plus du jour où il tourne.

## [À CLARIFIER]

(vide)
