# SPEC — Tranche S3 « Poules pondeuses comme second atelier → les œufs entrent dans la projection »

Liens : `docs/BRIEF.md` (tranche S3), `docs/specs/N1/SPEC.md`, `docs/specs/N2/SPEC.md`, `docs/specs/P1/SPEC.md`
Statut : **rédigée par l'agent** le 13/10/2026 à la demande de GDS-42. Lecture seule pour l'agent une fois la tranche commencée.

## Objectif

L'éleveur déclare ses lots de poules pondeuses : combien de poules, quand elles arrivent, pondent et partent, combien elles pondent et mangent, à quel prix il achète l'aliment et vend l'œuf. L'outil en déduit les œufs pondus et le coût de l'aliment semaine par semaine, et fait entrer les œufs dans le tableau économique, la matrice offre-demande et les points de vente, comme une culture.

## Hors périmètre de la tranche

Comptage réel des œufs jour par jour (objet SaisieJour du brief : il viendra avec le réel des tranches S1 et S2), courbe de ponte et mue, mortalité, achat des poules, litière, soins et bâtiment (charges de N3), vente des poules de réforme, calibres, temps de travail.

## Modèle de données : ce que S3 ajoute

| Objet (liste enregistrée) | Champs |
| --- | --- |
| Lot de poules (`lots`) | `nom`, `effectif` (nombre de poules), `arrivee` (date d'arrivée), `debutPonte` (premier jour de ponte), `reforme` (dernier jour du lot, inclus), `ponte` (œufs par poule et par jour, fourchette), `pertes` (% des œufs cassés, sales ou consommés à la ferme, comme les pertes d'une culture), `aliment` (grammes d'aliment par poule et par jour, fourchette), `prixAliment` (€ le kg, fourchette), `prixOeuf` (prix de vente d'un œuf en €, fourchette, quand les œufs n'ont pas de débouché) |

Chaque lot porte, comme en N1, un UUID, ses dates de création et de modification et une suppression logique ; `arrivee` ≤ `debutPonte` ≤ `reforme`.

Les œufs de tous les lots forment un seul produit, désigné dans un débouché par l'identifiant réservé `produitId: "oeufs"` (prévu par la spec de N2) ; son unité est l'œuf.

## Règles de calcul

- **Œufs pondus** par un lot un jour de sa période de ponte (de `debutPonte` à `reforme`, inclus) = effectif × ponte × (1 − pertes). Ceux d'une semaine (du lundi au dimanche) sont la somme de ses jours ; l'offre d'œufs de la ferme une semaine additionne ses lots.
- **Aliment** d'un lot un jour de sa présence (de `arrivee` à `reforme`, inclus) = effectif × aliment ; son coût = ce poids en kg × prix de l'aliment. Les poules mangent avant de pondre.
- **Mois** : une semaine compte entière dans le mois de son jeudi, pour les œufs comme pour l'aliment (règle de N2).
- **Œufs sans débouché** : toute la ponte se vend, au prix de l'œuf de chaque lot (comme une culture sans débouché en N2).
- **Œufs avec débouché** (au moins un débouché actif `oeufs` à un point de vente actif) : mêmes règles que les cultures en N2 — demande, vente = min(offre, demande) niveau par niveau, meilleur prix d'abord, chiffre d'affaires par point de vente.
- **Marge de l'atelier poules** = chiffre d'affaires des œufs − coût de l'aliment. **Marge de la ferme** = chiffre d'affaires (cultures et œufs) − coût des séances − coût de l'aliment. Ce sont des différences de fourchettes : elles vont du pire au meilleur (règle de N2).
- **Fourchettes** : comme en N2.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-25 | QUAND l'utilisateur crée, modifie ou supprime un lot de poules, LE SYSTÈME DOIT l'enregistrer dans le navigateur et le retrouver après réouverture, export et import compris | Test de bout en bout, test aller-retour |
| EX-26 | QUAND un lot est saisi, LE SYSTÈME DOIT estimer en fourchette, semaine par semaine, les œufs pondus et le coût de l'aliment | Test unitaire, scénario S7 |
| EX-27 | QUAND la ferme a au moins un lot, LE SYSTÈME DOIT afficher dans le tableau économique l'atelier poules — œufs, chiffre d'affaires, coût de l'aliment et marge de l'atelier, par mois — et déduire l'aliment de la marge de la ferme | Test unitaire et de bout en bout, scénarios S7 et S9 |
| EX-28 | QUAND les œufs ont un débouché, LE SYSTÈME DOIT les traiter comme une culture : matrice offre-demande, ventes plafonnées par la demande, chiffre d'affaires par point de vente | Test unitaire et de bout en bout, scénario S8 |
| EX-29 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT y inclure un lot de poules et des débouchés pour ses œufs | Test de bout en bout |

## Scénarios clés

```gherkin
Fonctionnalité: Les œufs entrent dans la projection

  Contexte:
    Soit un lot « Lot 1 » de 100 poules arrivées le lundi 30 mars 2026
    Et une ponte du lundi 6 avril au dimanche 10 mai 2026, à 0,8 œuf par poule et par jour, avec 5 % de pertes
    Et 120 g d'aliment par poule et par jour, à 0,60 € le kg
    Et un prix de l'œuf de 0,40 €

  Scénario: S7 — un lot pond et mange
    Quand je consulte le tableau économique
    Alors le lot pond 100 × 0,8 × 7 × 0,95 = 532 œufs par semaine
    Et 2 128 œufs en avril (4 semaines) et 532 en mai (la semaine du 4 mai, dont le jeudi est le 7)
    Et le chiffre d'affaires des œufs vaut 2 660 × 0,40 = 1 064 €
    Et l'aliment coûte 100 × 0,120 × 7 × 0,60 = 50,40 € par semaine, sur 6 semaines : 252 € en avril, 50,40 € en mai, 302,40 € en tout
    Et la marge de l'atelier poules vaut 1 064 − 302,40 = 761,60 €

  Scénario: S8 — les œufs se vendent comme une culture
    Soit en plus le marché de Saint-Paul de N2 (12 km, 0,40 € du km, le samedi du 2 mai au 27 juin, 15 € de frais)
    Et un débouché œufs à ce marché : 0,50 € l'œuf, 300 œufs par séance
    Quand je consulte l'offre et la demande
    Alors les œufs dépassent de 232 la semaine du 27 avril et celle du 4 mai, sûrement
    Et ils manquent de 300 la semaine du 11 mai, sûrement
    Et le tableau économique donne 600 œufs vendus et 300 € de chiffre d'affaires : 150 € en avril, 150 € en mai

  Scénario: S9 — la marge de la ferme déduit l'aliment
    Quand je consulte le tableau économique avec le seul lot du contexte
    Alors la marge de la ferme vaut 1 064 − 302,40 = 761,60 €
```

## Exigences non fonctionnelles

- Celles de N1, de P1 et de N2. Une ferme de N2 à sa taille limite, plus 10 lots, se recalcule en moins d'une seconde.

## Invariants nommés

- Ceux de N1, de P1 et de N2.
- `ponte_nulle_hors_periode` : un lot ne pond qu'entre son début de ponte et sa réforme, et ne mange qu'entre son arrivée et sa réforme.
- `sans_lot_comme_n2` : une ferme sans lot donne exactement le tableau de N2.

## Fichiers et interfaces

- `src/store.js` : une liste de plus (`lots`) ; format exporté en version 3, un fichier de version 1 ou 2 s'importe par migration (voir Points tranchés).
- `src/calc.js` : ponte et aliment par semaine ; offre d'œufs dans l'offre et la demande, les ventes, le tableau et les points de vente.
- `src/ui-poules.js` : panneau de saisie des lots ; option « Œufs » dans le choix du produit d'un débouché.
- `src/ui-tableau.js` : bloc « Atelier poules » et ligne du coût de l'aliment au pied du tableau.
- `src/exemple.js` : un lot de poules de la ferme d'exemple et des débouchés pour ses œufs.

## Points tranchés le 13/10/2026 (par l'agent)

- Le tableau économique garde une ligne par culture ; l'atelier poules forme un bloc à part, sous les cultures, sur le modèle des cultures (volume, chiffre d'affaires, coût de l'aliment, marge). Le résultat de calcul le range hors de la liste des cultures (`tableau.poules`), pour qu'une ferme sans lot reste identique à N2.
- Le choix du produit d'un débouché propose « Œufs » en plus des cultures, même sans lot : la matrice montrera alors une demande que rien ne couvre.
- La ponte est constante sur toute la période : la fourchette couvre la baisse de fin de lot. Une courbe de ponte viendra si les fermes pilotes la demandent.

- **Version du format exporté : 3** ; un fichier de version 1 ou 2 s'importe par migration (la liste des lots y est vide) ; un fichier HTML plus ancien refuse un fichier de version 3 au lieu de perdre les lots.
- **Tests qui fixaient le numéro de version** (décision de l'humain du 13/10/2026) : la ligne du test `[T08]` et les trois assertions des tests `[T18]` qui exigeaient « version 2 » comparent désormais à la version courante de l'outil (`Store.VERSION`) ; rien d'autre ne change dans ces tests. Les prochains changements de version ne toucheront plus aucun test.
- L'humain a demandé le 13/10/2026 que l'agent avance seul jusqu'à la livraison de S3 : les questions qui surgiront seront tranchées par l'agent et consignées ici ou dans `RUNBOOK.md` (✎ Décisions).

## [À CLARIFIER]

(vide)
