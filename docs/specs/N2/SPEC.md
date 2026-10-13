# SPEC — Tranche N2 « Points de vente et séances → prix par point de vente, demande, matrice offre-demande »

Liens : `docs/BRIEF.md` (tranche N2), `docs/specs/N1/SPEC.md`, `docs/specs/P1/SPEC.md`
Statut : **rédigée par l'agent** le 13/10/2026 à la demande de GDS-42. Lecture seule pour l'agent une fois la tranche commencée.
Modifiée le 13/10/2026 sur décision de l'humain : différence de fourchettes, version du format exporté, écart de la matrice (voir Points tranchés).

## Objectif

Le maraîcher déclare où il vend (marchés, paniers, magasins), quels jours, à quel coût, à quel prix et combien il peut y vendre à chaque fois. L'outil confronte sa production à cette demande semaine par semaine, montre où elle dépasse ou manque, et en déduit le chiffre d'affaires vendable, le coût des séances et le résultat de chaque point de vente.

## Hors périmètre de la tranche

Ventes réalisées (S1), liste de chargement par séance (N4), séances annulées une à une (jour férié, cyclone), commandes datées, coûts de semences et charges fixes (N3), temps de travail, atelier poules (S3).

## Modèle de données : ce que N2 ajoute

| Objet (liste enregistrée) | Champs |
| --- | --- |
| Point de vente (`pointsVente`) | `nom`, `distanceKm` (distance aller), `coutKm` (coût du km en €, fourchette) |
| Séance (`seances`) | `pointVenteId`, `jour` (1 = lundi … 7 = dimanche), `debut` et `fin` (première et dernière date, incluses), `frais` (frais par séance en €, fourchette : place, adhésion, commission fixe) |
| Débouché (`debouches`) | `pointVenteId`, `produitId` (la culture vendue ; en S3, aussi les œufs), `prix` (prix de vente par unité en €, fourchette), `volumeParSeance` (volume vendable par séance, fourchette, dans l'unité de la culture) |

Chaque enregistrement porte, comme en N1, un UUID, ses dates de création et de modification et une suppression logique. Une séance est régulière : elle se répète chaque semaine, le jour dit, de la première à la dernière date incluses ; chaque occurrence est une **séance datée**.

## Règles de calcul

- **Coût d'une séance datée** = frais de la séance + 2 × distance × coût du km.
- **Semaine** : du lundi au dimanche. L'offre d'une culture une semaine est la production des semaines de récolte dont le jour du milieu tombe dans cette semaine (règle de N1, granularité à la semaine).
- **Demande** d'une culture une semaine = somme, sur les séances datées de la semaine, du volume vendable du débouché (point de vente de la séance, culture).
- **Vente** d'une culture une semaine : volume vendu = min(offre, demande), niveau par niveau de la fourchette. La production va d'abord au débouché qui paie le mieux (prix médian décroissant, puis nom du point de vente), dans le même ordre aux trois niveaux. Le chiffre d'affaires est la somme des volumes vendus à chaque point de vente × son prix.
- **Culture sans débouché** (aucun débouché actif à un point de vente actif) : elle se vend comme en N1 — toute sa production, au prix de sa variété ou de la culture, rangée par mois selon la règle de N1. Une ferme sans débouché se calcule donc exactement comme en N1.
- **Mois** : une semaine compte entière, ses ventes comme le coût de ses séances, dans le mois de son jeudi (le jour du milieu). Rattacher chaque vente au mois de sa séance pourrait donner une fourchette désordonnée pour un mois quand une semaine est à cheval sur deux mois ; la règle du jeudi garde chaque case ordonnée.
- **Marge** : celle d'une culture reste égale à son chiffre d'affaires ; celle de la ferme = chiffre d'affaires − coûts des séances (charges de N3 à venir).
- **Fourchettes** : basse, médiane et haute se calculent chacune avec les valeurs basses, médianes ou hautes. Pour un point de vente pris seul, la fourchette va du cas le moins favorable pour lui (production basse, sa demande basse, demande haute des débouchés servis avant lui) au plus favorable (production haute, sa demande haute, demande basse des débouchés servis avant lui), la médiane restant celle du calcul médian ; ces fourchettes-là ne s'additionnent pas d'un point de vente à l'autre.
- **Différence de fourchettes** (marge de la ferme, résultat d'un point de vente, et toute marge à venir) : elle va du pire au meilleur — basse = basse du premier terme − haute du second ; haute = haute du premier terme − basse du second ; médiane = différence des médianes. Elle reste ainsi ordonnée (`fourchette_ordonnee`), ce que la soustraction niveau par niveau ne garantit pas (un mois avec des séances et sans vente : CA 0 €, coûts 22 / 25 / 27 € donneraient −22 / −25 / −27 €).

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-18 | QUAND l'utilisateur crée, modifie ou supprime un point de vente, une séance ou un débouché, LE SYSTÈME DOIT l'enregistrer dans le navigateur et le retrouver après réouverture, export et import compris | Test de bout en bout, test aller-retour |
| EX-19 | QUAND une séance est saisie, LE SYSTÈME DOIT en déduire ses séances datées et le coût de chacune (frais + transport aller-retour), en fourchette | Test unitaire, scénario S6 |
| EX-20 | QUAND l'utilisateur consulte l'offre et la demande, LE SYSTÈME DOIT afficher, par culture et par semaine, l'offre et la demande en fourchette et signaler si la production dépasse, manque ou équilibre, et si c'est sûr (fourchettes disjointes) | Test unitaire et de bout en bout, scénario S4 |
| EX-21 | QUAND une culture a au moins un débouché, LE SYSTÈME DOIT limiter son volume vendu à la demande et calculer son chiffre d'affaires au prix de chaque point de vente, en servant d'abord celui qui paie le mieux | Test unitaire, scénarios S4 et S5 |
| EX-22 | QUAND l'utilisateur consulte les points de vente, LE SYSTÈME DOIT afficher pour chacun et par mois le nombre de séances, le chiffre d'affaires, le coût des séances et le résultat, en fourchette | Test unitaire et de bout en bout, scénario S6 |
| EX-23 | LE SYSTÈME DOIT déduire le coût des séances de la marge de la ferme dans le tableau économique | Test unitaire et de bout en bout |
| EX-24 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT y inclure des points de vente réunionnais, leurs séances et leurs débouchés | Test de bout en bout |

## Scénarios clés

```gherkin
Fonctionnalité: Vendre ce qu'on produit

  Contexte:
    Soit la courgette et la plantation du scénario S1 (33,75 kg par semaine du 30 avril au 24 juin 2026)
    Et un point de vente « marché de Saint-Paul » à 12 km, à 0,40 € du km
    Et une séance le samedi du 2 mai au 27 juin 2026, à 15 € de frais
    Et un débouché courgette à ce marché : 2,50 € le kg, 20 kg par séance

  Scénario: S4 — la demande plafonne les ventes
    Quand je consulte l'offre et la demande
    Alors la courgette dépasse de 13,75 kg la semaine du 27 avril, sûrement
    Et elle manque de 20 kg la semaine du 22 juin, sûrement
    Et le tableau économique donne 160 kg vendus et 400 € de chiffre d'affaires sur la saison, au lieu de 675 €
    Et 20 kg en avril (la semaine du 27 avril, dont le jeudi est le 30), 80 kg en mai, 60 kg en juin

  Scénario: S5 — la production va d'abord au point de vente qui paie le mieux
    Soit en plus un panier « AMAP du mardi » : séance le mardi du 28 avril au 30 juin, débouché courgette à 3 € le kg, 10 kg par séance
    Et la plantation réduite à 50 m² (16,875 kg par semaine)
    Quand je consulte la semaine du 4 mai
    Alors 10 kg partent à l'AMAP et 6,875 kg au marché
    Et le chiffre d'affaires de la semaine vaut 10 × 3 + 6,875 × 2,50 = 47,19 €

  Scénario: S6 — chaque séance coûte
    Quand je consulte les points de vente
    Alors le marché de Saint-Paul compte 9 séances, chacune à 15 + 2 × 12 × 0,40 = 24,60 €
    Et son coût sur la saison vaut 221,40 € : 24,60 € en avril, 98,40 € en mai, 98,40 € en juin
    Et son résultat vaut 400 − 221,40 = 178,60 €
    Et la marge de la ferme dans le tableau économique vaut 400 − 221,40 = 178,60 €
```

## Exigences non fonctionnelles

- Celles de N1 et de P1. Une ferme de 200 plantations, 10 points de vente, 20 séances et 100 débouchés se recalcule en moins d'une seconde.

## Invariants nommés

- Ceux de N1 (`fourchette_ordonnee`, `production_nulle_hors_fenetre`, `suppression_logique_seulement`, `export_import_identite`, `calcul_sans_dom`) et de P1.
- `vendu_borne` : volume vendu ≤ offre et ≤ demande, à chaque niveau.
- `sans_debouche_comme_n1` : une ferme sans débouché donne exactement le tableau de N1.

## Fichiers et interfaces

- `src/store.js` : trois listes de plus ; le format exporté passe en version 2, et un fichier de version 1 s'importe par migration (voir Points tranchés).
- `src/calc.js` : séances datées, coûts, offre et demande par semaine, ventes, tableau par point de vente.
- `src/ui-ventes.js` : panneau de saisie des points de vente, séances et débouchés ; vue « Offre et demande » ; vue « Points de vente ».
- `src/ui-tableau.js` : ligne des coûts des séances et marge de la ferme.
- `src/exemple.js` : points de vente de la ferme d'exemple.

## Points tranchés le 13/10/2026 (par l'agent, l'humain ayant demandé d'avancer sauf blocage réel)

- **Version du format exporté : 2** (décision de l'humain du 13/10/2026, qui remplace le choix initial de l'agent de garder la version 1). Un fichier de version 1 (N1) s'importe par migration : ses trois listes de vente y sont vides. Un ancien `plantoeuf.html` (N1) refuse un fichier de version 2 au lieu de perdre les points de vente sans prévenir. La ligne du test `[T08]` qui exigeait « version 1 » et celle du test `[T18]` qui reprenait ce choix passent à 2, avec l'accord de l'humain.
- **Nom de la liste : `pointsVente`.** Le test `[T02]` prend `pointsDeVente` comme exemple d'objet refusé ; ce nom reste donc refusé. Proposé à l'humain : renommer en `pointsDeVente` avec la version 2 et changer l'exemple du test ; non retenu le 13/10/2026, le nom reste `pointsVente`.
- Une culture sans débouché se vend comme en N1 : on peut décrire ses points de vente petit à petit sans voir chuter le chiffre d'affaires des autres cultures.
- Les séances sont régulières (une par jour de la semaine et par période) ; annuler une séance précise viendra plus tard.
- Interface : trois panneaux de saisie de plus, après les plantations (Points de vente, Séances, Débouchés), sur le modèle des autres. Le volet de projection gagne des onglets : « Par culture » (le tableau économique, affiché à l'ouverture), « Offre et demande », « Points de vente ».
- **Écart d'une case de la matrice** : il s'affiche en un seul nombre, l'écart des médianes, et un cadre signale qu'il est sûr ; exception à « jamais un chiffre seul » d'AGENTS.md, décidée par l'humain le 13/10/2026 pour la lisibilité.
- Dans le tableau économique, la ligne de volume d'une culture vendue à des points de vente donne le volume **vendu** ; le pied du tableau ajoute le coût des séances entre le chiffre d'affaires et la marge de la ferme.

## [À CLARIFIER]

(vide)
