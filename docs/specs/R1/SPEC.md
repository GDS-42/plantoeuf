# SPEC — Tranche R1 « Retours d'essai : dates à l'européenne et véhicules »

Liens : `docs/BRIEF.md`, `docs/specs/N1/SPEC.md`, `docs/specs/N2/SPEC.md`, `docs/specs/S3/SPEC.md`, `docs/specs/P2/SPEC.md`
Statut : **rédigée par l'agent** le 14/10/2026 à la demande de GDS-42, plan approuvé par l'humain le 14/10/2026. Lecture seule pour l'agent une fois la tranche commencée.

## Objectif

Après avoir essayé l'outil en ligne, l'humain demande en priorité, avant N3 :

1. « Mettre les plannings en ordre européen, c'est-à-dire jour, mois, année. » Les dates affichées le sont déjà (jj/mm/aaaa) ; les six champs de saisie de date, eux, suivent la langue du navigateur (mm/jj/aaaa sur un téléphone réglé en anglais). Toute date se saisit et se relit désormais jour, mois, année, quel que soit le navigateur.
2. « Possibilité de rentrer son véhicule et la consommation du véhicule ainsi que le prix par litre d'essence, ce qui permet de calculer automatiquement les dépenses qui en découlent. » Le maraîcher déclare ses véhicules ; le coût du km d'un point de vente se déduit du véhicule qui y va, et l'outil chiffre les kilomètres, les litres et le carburant de la saison.

## Hors périmètre de la tranche

Coûts de culture et charges fixes (N3, reportée après R1) ; usure, entretien et assurance du véhicule ; trajets qui ne vont pas à un point de vente ; un véhicule par séance (le véhicule se choisit par point de vente) ; ferme d'exemple (inchangée).

## Modèle de données : ce que R1 ajoute

| Objet (liste enregistrée) | Champs |
| --- | --- |
| Véhicule (`vehicules`) | `nom`, `consommation` (litres aux 100 km, fourchette), `prixLitre` (prix du litre de carburant en €, fourchette) |
| Point de vente (`pointsVente`, existant) | `vehiculeId` (facultatif : le véhicule qui fait le trajet) ; `coutKm` devient facultatif quand un véhicule est choisi |

Chaque véhicule porte, comme en N1, un UUID, ses dates de création et de modification et une suppression logique. Les dates restent enregistrées au format ISO (AAAA-MM-JJ) : seuls la saisie et l'affichage dans les champs changent.

## Règles de calcul et de saisie

- **Lecture d'une date saisie** : jour, mois, année, séparés par « / », « - », « . » ou une espace (« 15/03/2026 », « 15/3/26 ») ; huit chiffres sans séparateur se lisent jjmmaaaa (« 15032026 ») ; une date ISO (« 2026-03-15 ») reste acceptée. Une année à deux chiffres se lit 20aa. Une date qui n'existe pas (« 31/02/2026 ») est refusée.
- **Coût du km d'un point de vente** : avec un véhicule actif, consommation × prix du litre ÷ 100, niveau par niveau ; sans véhicule (ou si son véhicule est supprimé), le coût du km saisi, comme en N2.
- **Coût d'une séance** : frais + 2 × distance × coût du km (règle de N2, inchangée).
- **Bilan d'un véhicule sur la saison** : kilomètres = somme, sur les séances datées des points de vente actifs qui l'utilisent, de 2 × distance ; litres = kilomètres × consommation ÷ 100 ; carburant = litres × prix du litre (fourchettes niveau par niveau).
- **Fourchettes** : comme en N2.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-39 | QUAND l'utilisateur saisit une date (plantation, séance, lot de poules), LE SYSTÈME DOIT la lire dans l'ordre jour, mois, année, quels que soient la langue et le navigateur, et refuser une date qui n'existe pas avec un message clair | Test unitaire et de bout en bout, scénario S10 |
| EX-40 | QUAND un formulaire montre une date enregistrée, LE SYSTÈME DOIT l'écrire jj/mm/aaaa, et proposer un calendrier pour la choisir | Test de bout en bout, scénario S10 |
| EX-41 | QUAND l'utilisateur crée, modifie ou supprime un véhicule, LE SYSTÈME DOIT l'enregistrer dans le navigateur et le retrouver après réouverture, export et import compris | Test de bout en bout, test aller-retour |
| EX-42 | QUAND l'utilisateur choisit le véhicule d'un point de vente, LE SYSTÈME DOIT ne plus exiger le coût du km de ce point de vente et l'enregistrer avec ce véhicule | Test de bout en bout |
| EX-43 | QUAND un point de vente a un véhicule, LE SYSTÈME DOIT en déduire le coût du km, et donc le coût de ses séances, partout où il compte (tableau économique, synthèse, points de vente) | Test unitaire et de bout en bout, scénario S11 |
| EX-44 | QUAND la ferme a au moins un véhicule, LE SYSTÈME DOIT afficher pour chacun son coût du km et, sur la saison, ses kilomètres, ses litres et son coût de carburant, en fourchette | Test unitaire et de bout en bout, scénario S11 |

## Scénarios clés

```gherkin
Fonctionnalité: Dates à l'européenne et véhicules

  Scénario: S10 — une date se saisit jour, mois, année
    Soit une variété et un espace
    Quand j'ajoute une plantation datée « 15/03/2026 »
    Alors elle est enregistrée au 2026-03-15 et la liste affiche 15/03/2026
    Et en la modifiant, le champ montre « 15/03/2026 »
    Et « 15032026 » donne la même date
    Et « 31/02/2026 » est refusé avec le message « Écrivez la date jour/mois/année, par exemple 15/03/2026. »

  Scénario: S11 — le véhicule chiffre les trajets
    Soit le marché de Saint-Paul de N2 (12 km, le samedi du 2 mai au 27 juin 2026, 15 € de frais, 9 séances)
    Et un véhicule « Camionnette » à 8 litres aux 100 km et 1,80 € le litre
    Quand le marché utilise la camionnette
    Alors son coût du km vaut 8 × 1,80 ÷ 100 = 0,144 €
    Et une séance coûte 15 + 2 × 12 × 0,144 = 18,456 €
    Et la camionnette roule 9 × 24 = 216 km sur la saison, consomme 17,28 L et 31,104 € de carburant
```

## Exigences non fonctionnelles

- Celles de N1, de P1, de N2, de S3 et de P2. Aucune ressource réseau, aucune dépendance.
- Les champs de date gardent leurs identifiants ; le calendrier du navigateur reste accessible par un bouton, sans être la seule façon de saisir.

## Invariants nommés

- Ceux des tranches précédentes.
- `date_enregistree_iso` : toute date enregistrée ou exportée reste au format AAAA-MM-JJ.
- `sans_vehicule_comme_avant` : une ferme sans véhicule donne exactement les mêmes résultats qu'avant R1.

## Fichiers et interfaces

- `src/store.js` : `lireDate` ; une liste de plus (`vehicules`) ; format exporté en version 4, un fichier de version 1 à 3 s'importe par migration.
- `src/ui-commun.js` : `saisieDate` (ISO → jj/mm/aaaa).
- `src/ui-saisie.js` : lecture et écriture des champs `data-format="date"`, bouton calendrier.
- `src/calc.js` : `coutDuKm`, `vehicules` ; les séances prennent en compte les véhicules.
- `src/ui-vehicules.js` : section « Véhicules » de la page Ventes.
- `src/ui-ventes.js` : choix du véhicule d'un point de vente.
- `src/index.html`, `src/i18n.js` : champs, section, textes.

## Points tranchés le 14/10/2026

- **Plan approuvé par l'humain** : il vaut accord pour la modification du modèle de données (objet `vehicules`, champ `vehiculeId`, format en version 4) et pour une seule retouche de test existant : dans `test/p2-ferme.e2e.js`, le champ date d'une plantation ouverte en modification affiche « 01/05/2026 » au lieu de « 2026-05-01 ».
- « Les plannings » désigne les dates saisies : les dates affichées étaient déjà au format jj/mm/aaaa.
- Le véhicule se choisit par point de vente (on va au même marché avec le même véhicule) ; plusieurs véhicules sont possibles.
- Seul le carburant est compté ; l'ancien « coût du km » saisi reste disponible pour un point de vente sans véhicule.

## [À CLARIFIER]

(vide)
