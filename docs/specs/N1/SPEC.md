# SPEC — Noyau, tranche N1 « Espaces, cultures, plantations → tableau économique »

Liens : `docs/BRIEF.md`, `docs/adr/ADR-004.md`
Statut : **approuvée** le 13/10/2026 (GDS-42). Fichier en lecture seule pour l'agent.

## Objectif

Le maraîcher décrit sa ferme et ses plantations, et obtient un tableau de chiffre d'affaires et de marge par culture et par mois, en fourchette, qu'il peut faire varier en modifiant son plan.

## Hors périmètre de la tranche

Points de vente et prix par canal (N2), coûts de semences et charges fixes (N3), rotation, Gantt, saisie de récoltes, poules, serveur, synchronisation, comptes utilisateurs.

## Modèle de données du noyau

N1 crée les quatre premiers objets ; les autres sont nommés pour que le schéma les accueille sans migration.

| Objet | Champs en N1 | Prévu pour N2-N3 |
| --- | --- | --- |
| Espace | nom, surface en m², type (plein champ, abri) | — |
| Culture | nom, famille botanique, unité de vente (kg, botte, pièce), rendement par m² en fourchette, prix de vente par unité en fourchette, durée jusqu'à la première récolte (jours), durée de la fenêtre de récolte (semaines), taux de pertes et d'invendus (%) | coûts unitaires de semences, plants et intrants ; heures de travail par m², facultatives |
| Variété | nom, culture parente, surcharge facultative de chaque champ numérique de la culture | — |
| Plantation | variété, espace, surface occupée en m², date de semis ou de plantation ; dates de début et de fin de récolte calculées | — |
| Point de vente, Séance | — | N2 |
| Charge fixe | — | N3 |
| Vente réalisée, Récolte | — | S1, S2 |

Toute valeur estimée est une **fourchette** (basse, médiane, haute) ; saisir un seul nombre remplit les trois. Chaque enregistrement porte un identifiant UUID, une date de création, une date de modification et une suppression logique (`supprimeLe`, nul si actif).

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-01 | QUAND l'utilisateur crée, modifie ou supprime un espace, une culture, une variété ou une plantation, LE SYSTÈME DOIT l'enregistrer dans le navigateur et le retrouver après fermeture et réouverture du fichier | Test de bout en bout : saisie, réouverture, relecture |
| EX-02 | QUAND une plantation est saisie, LE SYSTÈME DOIT calculer sa date de première récolte et sa date de fin de récolte à partir des durées de la variété, ou de la culture à défaut | Test unitaire |
| EX-03 | QUAND une plantation est en récolte, LE SYSTÈME DOIT répartir sa production (surface × rendement × (1 − pertes)) uniformément sur les semaines de sa fenêtre de récolte | Test unitaire, scénario S1 |
| EX-04 | QUAND l'utilisateur ouvre le tableau économique, LE SYSTÈME DOIT afficher par culture et par mois le volume, le CA (volume × prix) et la marge (égale au CA en N1, charges déduites à partir de N3), chacun en fourchette basse, médiane et haute | Scénario S2 |
| EX-05 | QUAND une donnée du plan change, LE SYSTÈME DOIT recalculer le tableau sans action supplémentaire | Test de bout en bout |
| EX-06 | SI la surface des plantations d'un espace dépasse sa surface à une date donnée, ALORS LE SYSTÈME DOIT le signaler sans bloquer | Scénario S3 |
| EX-07 | QUAND l'utilisateur demande « Exporter », LE SYSTÈME DOIT produire un fichier JSON que « Importer » restaure à l'identique, y compris les éléments supprimés logiquement | Test aller-retour |
| EX-08 | SI l'utilisateur n'a pas exporté depuis 7 jours et que des données ont changé, ALORS LE SYSTÈME DOIT le lui rappeler à l'ouverture | Test unitaire avec horloge injectée |
| EX-09 | QUAND une valeur estimée est affichée, LE SYSTÈME DOIT la présenter comme une fourchette et signaler qu'il s'agit d'une estimation | Test de bout en bout : texte des en-têtes |
| EX-10 | QUAND l'utilisateur ouvre le fichier pour la première fois, LE SYSTÈME DOIT proposer une ferme d'exemple de 10 plantations qu'il peut effacer d'un geste | Test de bout en bout |

## Scénarios clés

```gherkin
Fonctionnalité: Projection économique depuis les plantations

  Scénario: S1 — la production se répartit sur la fenêtre de récolte
    Soit une culture « courgette » à 3 kg/m², 10 % de pertes, 60 jours avant récolte et 8 semaines de récolte
    Et une plantation de 100 m² le 1er mars
    Quand je consulte la production hebdomadaire
    Alors elle vaut 33,75 kg par semaine du 30 avril au 24 juin
    Et 0 kg les autres semaines

  Scénario: S2 — le tableau donne une fourchette par mois
    Soit la plantation du scénario S1
    Et un prix de vente de 2,00 / 2,50 / 3,00 € le kg
    Quand je consulte le tableau économique pour mai
    Alors la ligne « courgette » affiche un CA compris entre la valeur basse et la valeur haute
    Et la valeur médiane vaut le volume de mai × 2,50 €

  Scénario: S3 — un espace sur-occupé est signalé
    Soit un espace « planche 4 » de 30 m²
    Et deux plantations de 20 m² qui s'y chevauchent en juin
    Quand je consulte les espaces
    Alors « planche 4 » porte un signal de sur-occupation pour juin
    Et les deux plantations restent enregistrées
```

## Exigences non fonctionnelles

- Un seul fichier HTML livré, sans ressource réseau.
- Fonctionne dans Firefox et Chrome récents sur PC.
- Une ferme de 200 plantations se recalcule en moins d'une seconde.
- Textes de l'interface regroupés dans `src/i18n.js` pour une traduction future ; français simple, sans vocabulaire comptable.

## Invariants nommés

- `fourchette_ordonnee` : basse ≤ médiane ≤ haute.
- `production_nulle_hors_fenetre`.
- `suppression_logique_seulement`.
- `export_import_identite`.
- `calcul_sans_dom` : la logique s'exécute sans navigateur.

## Fichiers et interfaces

- `src/index.html` : rendu et saisie.
- `src/calc.js` : logique pure (dates, répartition hebdomadaire, tableau).
- `src/store.js` : lecture, écriture, export, import.
- `src/i18n.js` : textes.
- `src/exemple.js` : ferme d'exemple (La Réunion).
- `test/` : tests unitaires (`node --test`) de `calc.js` et `store.js` ; tests Playwright du fichier HTML.
- `build.sh` concatène les modules dans `dist/index.html`, sans outil de build.

## Limites pour l'agent

- **TOUJOURS** : écrire le test avant le code ; coller la sortie de test comme preuve ; garder la logique hors du rendu.
- **DEMANDER D'ABORD** : ajouter une dépendance, même en ligne ; changer le modèle de données ; ajouter un objet non listé dans le modèle.
- **JAMAIS** : modifier les tests ou la spec ; charger une ressource réseau ; envoyer des données hors du navigateur ; coder une valeur agronomique ou un prix en dur ailleurs que dans la ferme d'exemple.

## Vérification de bout en bout

`./verify.sh N1` lance `node --test test/`, puis Playwright qui ouvre `dist/index.html`, charge la ferme d'exemple, modifie une plantation et vérifie que le tableau change, puis exporte et réimporte. Attendu : code de sortie 0.

## Points tranchés le 13/10/2026

- Lanceur des tests : Node et son module de test intégré pour `calc.js` et `store.js` ; Playwright pour le fichier HTML. Seules dépendances de développement ; le fichier livré n'en a aucune.
- Granularité de la répartition : la semaine.
- Ferme d'exemple : La Réunion (calendrier sans gel, saison cyclonique).

## [À CLARIFIER]

(vide)
