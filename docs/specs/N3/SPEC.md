# SPEC — Tranche N3 « Coûts de semences, plants, intrants et charges fixes → du chiffre d'affaires au revenu »

Liens : `docs/BRIEF.md` (tranche N3), `docs/specs/N1/SPEC.md`, `docs/specs/N2/SPEC.md`, `docs/specs/S3/SPEC.md`, `docs/specs/R1/SPEC.md`
Statut : **rédigée par l'agent** le 14/10/2026, plan approuvé par l'humain le 14/10/2026. Lecture seule pour l'agent une fois la tranche commencée.

## Objectif

Le maraîcher sait déjà ce que sa saison peut rapporter. N3 lui dit ce qui lui reste : l'outil déduit de la marge ce que coûtent les semences, les plants et les intrants de chaque plantation, puis les charges fixes de la ferme, et donne le revenu mois par mois. Il liste aussi les graines et plants à prévoir. À la demande de l'humain (retours de R1), le coût du km d'un véhicule compte aussi son entretien et son usure, et la ferme d'exemple reçoit une camionnette.

## Hors périmètre de la tranche

Heures de travail ; trésorerie mensuelle complète (dates réelles de paiement, emprunts, subventions) ; achat des poules, litière et soins (charges fixes au besoin) ; variétés qui changent le prix d'une graine ou d'un plant ; production des plants à la ferme ; comptabilité.

## Modèle de données : ce que N3 ajoute

| Objet (liste enregistrée) | Champs |
| --- | --- |
| Véhicule (`vehicules`, existant) | `fraisKm` (facultatif : entretien, pneus, usure et assurance, en € par km, fourchette) |
| Culture (`cultures`, existant) | quatre champs facultatifs : `implantation` (« semis » ou « plant »), `densite` (graines ou plants par m², nombre), `prixUnite` (prix d'une graine ou d'un plant en €, fourchette), `intrants` (terreau, engrais, paillage… en € par m², fourchette) |
| Charge fixe (`charges`) | `nom`, `montant` (en €, fourchette), `periodicite` (« mois » ou « an ») |

Chaque charge fixe porte, comme en N1, un UUID, ses dates de création et de modification et une suppression logique. Format exporté en version 5.

## Règles de calcul

- **Coût du km d'un véhicule** = consommation × prix du litre ÷ 100 + frais au km (0 s'ils manquent), niveau par niveau. Le coût des séances en découle (règle de R1).
- **Bilan de saison d'un véhicule** : en plus des kilomètres, des litres et du carburant (R1), l'entretien et l'usure = kilomètres × frais au km, et le coût total = carburant + entretien et usure.
- **Coûts de culture d'une plantation** = surface × densité × prix d'une graine ou d'un plant + surface × intrants (un champ manquant compte pour 0). Ils comptent dans le mois de la date de mise en place.
- **Marge d'une culture** = son chiffre d'affaires − ses coûts de culture. **Marge de la ferme** = chiffre d'affaires − coût des séances − coût de l'aliment − coûts de culture. Différences de fourchettes, du pire au meilleur (règle de N2).
- **Charges fixes** : une charge mensuelle compte son montant chaque mois ; une charge annuelle, son montant ÷ 12.
- **Mois de la projection** : ceux des tranches précédentes, plus les mois de mise en place qui portent un coût de culture. Dès que la ferme a une charge fixe, la projection couvre au moins 12 mois d'affilée à partir de son premier mois, et chaque mois porte ses charges.
- **Revenu** = marge de la ferme − charges fixes, mois par mois et sur toute la projection.
- **Besoins en semences et plants** : pour chaque plantation d'une culture qui a une densité, la quantité = surface × densité, à la date de mise en place ; son coût = quantité × prix d'une graine ou d'un plant, en fourchette.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-45 | QUAND l'utilisateur saisit les frais au km d'un véhicule ou les coûts de mise en place d'une culture, ou crée, modifie ou supprime une charge fixe, LE SYSTÈME DOIT les enregistrer dans le navigateur et les retrouver après réouverture, export et import compris | Test unitaire et de bout en bout, test aller-retour |
| EX-46 | QUAND un véhicule a des frais au km, LE SYSTÈME DOIT les ajouter au carburant dans son coût du km, et afficher sur la saison son entretien et son coût total | Test unitaire et de bout en bout, scénario S14 |
| EX-47 | QUAND une culture a des coûts de mise en place, LE SYSTÈME DOIT les déduire de sa marge et de celle de la ferme, au mois de mise en place, et les montrer au pied du tableau et dans la synthèse | Test unitaire et de bout en bout, scénario S12 |
| EX-48 | QUAND la ferme a des charges fixes, LE SYSTÈME DOIT les compter chaque mois, sur au moins 12 mois, et afficher le revenu de chaque mois et de toute la projection | Test unitaire et de bout en bout, scénario S13 |
| EX-49 | QUAND une culture a une densité, LE SYSTÈME DOIT lister, mois par mois, les graines ou plants à prévoir pour chaque plantation, avec leur quantité et leur coût | Test unitaire et de bout en bout, scénario S12 |
| EX-50 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT y inclure un véhicule qui va à ses points de vente et des coûts de mise en place pour ses cultures | Test de bout en bout |

## Scénarios clés

```gherkin
Fonctionnalité: Du chiffre d'affaires au revenu

  Contexte:
    Soit la courgette du scénario S1 de N1 : 3 kg/m², 10 % de pertes, 60 jours avant récolte, 8 semaines de récolte, vendue 2,00 / 2,50 / 3,00 € le kg
    Et une plantation de 100 m² le 1er mars 2026 (chiffre d'affaires de la saison : 540 / 675 / 810 €)

  Scénario: S12 — les coûts de culture et les plants à prévoir
    Soit la courgette mise en place en plants, 1 plant par m², à 0,30 / 0,40 / 0,50 € le plant, et 0,20 € d'intrants par m²
    Quand je consulte le tableau économique
    Alors mars 2026 porte 50 / 60 / 70 € de coûts de culture (plants 30 / 40 / 50 €, intrants 20 €)
    Et la marge de la courgette vaut 470 / 615 / 760 € sur la saison
    Et les plants à prévoir sont 100 plants en mars 2026, pour 30 / 40 / 50 €

  Scénario: S13 — les charges fixes et le revenu
    Soit en plus une assurance de 600 € par an et une cotisation de 150 € par mois
    Quand je consulte le tableau économique
    Alors la projection va de mars 2026 à février 2027 (12 mois)
    Et chaque mois porte 200 € de charges fixes, 2 400 € en tout
    Et le revenu de la saison vaut −1 930 / −1 785 / −1 640 €

  Scénario: S14 — l'entretien du véhicule s'ajoute au carburant
    Soit le scénario S11 de R1 (marché de Saint-Paul à 12 km, 9 séances à 15 € de frais, camionnette à 8 L aux 100 km et 1,80 € le litre)
    Et 0,15 € de frais d'entretien et d'usure au km
    Alors le coût du km vaut 0,144 + 0,15 = 0,294 €
    Et une séance coûte 15 + 2 × 12 × 0,294 = 22,056 €
    Et sur la saison la camionnette roule 216 km : 31,104 € de carburant, 32,40 € d'entretien et d'usure, 63,504 € en tout
```

## Exigences non fonctionnelles

- Celles des tranches précédentes. Aucune ressource réseau, aucune dépendance.

## Invariants nommés

- Ceux des tranches précédentes.
- `sans_cout_comme_r1` : une ferme sans coût de culture ni charge fixe donne exactement le tableau et les chiffres clés d'avant N3, sans aucune clé de plus.
- `sans_frais_comme_r1` : un véhicule sans frais au km donne exactement les résultats de R1.

## Fichiers et interfaces

- `src/store.js` : une liste de plus (`charges`) ; format exporté en version 5, un fichier de version 1 à 4 s'importe par migration.
- `src/calc.js` : frais au km ; coûts de culture ; charges fixes et revenu ; besoins en semences et plants.
- `src/ui-charges.js` (page « Charges fixes »), `src/ui-besoins.js` (section de la page Plantations), `src/ui-vehicules.js`, `src/ui-tableau.js`, `src/ui-synthese.js`, `src/ui-saisie.js`.
- `src/index.html`, `src/i18n.js`, `src/ui-navigation.js`.
- `src/exemple.js` : une camionnette et des coûts de mise en place.

## Points tranchés le 14/10/2026

- **Plan approuvé par l'humain** : il vaut accord pour la modification du modèle de données (`fraisKm`, quatre champs de la culture, objet `charges`, version 5). Aucun test existant n'est modifié.
- Les coûts de mise en place sont sur la culture (pas de surcharge par variété) et ne passent pas par les paramètres hérités des variétés.
- Les clés de résultat nouvelles (coûts de culture, charges, revenu) n'apparaissent que lorsqu'elles servent, comme l'aliment en S3 : une ferme sans ces coûts garde exactement les résultats d'avant.
- La synthèse ajoute une tuile « Revenu » seulement si la ferme a une charge fixe ; la ferme d'exemple n'a pas de charge fixe (les chiffres de ses quatre tuiles sont figés par un test de P2).
- Les tâches T43 à T49 remplacent la numérotation provisoire du plan (T43 bis devient T44).

## [À CLARIFIER]

(vide)
