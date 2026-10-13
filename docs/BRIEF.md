# BRIEF — Outil de planification pour petit maraîcher

Statut : **go** (noyau), 13/10/2026. Revue au bilan de la tranche N1.

## Problème

Cas type, à confirmer en entretien. Un maraîcher seul sur 1,5 ha avec 200 poules refait chaque dimanche son semainier sur papier et compte les œufs dans un carnet. En mars, il ne sait pas si sa trésorerie tiendra jusqu'aux premières grosses récoltes. Il découvre ses invendus au retour du marché sans savoir quel marché est rentable. Les outils existants couvrent chacun un morceau ; aucun ne relie le plan à la trésorerie, ni la demande des points de vente à la production.

## Pour qui, quel progrès

Quand je prépare ma saison, je veux savoir quoi planter, pour quels points de vente, et si l'argent suivra, pour travailler moins dans l'urgence et vivre de ma ferme.

## Hypothèses et critères de succès

- **H0, testée par le noyau** : une projection économique construite depuis les plantations et les points de vente est jugée crédible par un maraîcher et change au moins une décision de son plan. Critère : chaque ferme pilote saisit son plan en moins d'une heure et cite une plantation ou un marché modifié après lecture du tableau.
- **H1, reportée** : si la saisie se limite à confirmer ce que le plan prévoit, l'agriculteur continue à saisir en pleine saison. C'est l'hypothèse la plus risquée du produit complet ; le noyau ne la teste pas, il la prépare.
- **H2** : la comparaison des points de vente, d'abord estimée puis corrigée par les ventes réelles, fait abandonner ou garder un marché en connaissance de cause. Critère : une décision de canal citée au bilan de saison.

## Seuil d'alerte

Chaque tranche porte un nombre de sessions agent au-delà duquel l'agent s'arrête et rend compte, sans rien décider : l'humain choisit entre continuer, réécrire l'exigence qui bloque ou découper la tâche. Le seuil ne juge pas le travail ; il force un point de contrôle humain là où un agent et son relecteur pourraient boucler. N1 : 15 sessions pour dix tâches.

## Esquisse

Un seul fichier HTML, ouvert dans le navigateur d'un PC, sans serveur ni installation (ADR-004). Le maraîcher déclare ses espaces, ses cultures et variétés, ses plantations et ses points de vente ; l'outil en déduit un tableau économique par culture, par point de vente et par mois, et une matrice offre-demande par semaine. Les estimations portent une fourchette. Export et import JSON dès le premier jour. L'application web synchronisée (ADR-001) reste la cible à terme.

Règle d'admission dans le noyau : un objet n'y entre que s'il change une case du tableau de projection.

## Tranches

| ID | Tranche | Objets ajoutés | Fini quand |
| --- | --- | --- | --- |
| N1 | Espaces, cultures, plantations → tableau économique | Espace, Culture, Variété, Plantation | Tableau CA / marge par culture et par mois, en fourchette, recalculé à chaque modification ; export-import identique |
| N2 | Points de vente et séances → prix par canal, demande, matrice offre-demande | Point de vente, Séance, prix et volume vendable par culture et point de vente | CA = min(production, demande) × prix ; matrice culture × semaine ; coût des séances par point de vente |
| N3 | Coûts de semences, plants, intrants et charges fixes → du CA au revenu | Coûts unitaires sur la culture, Charge fixe | Marge brute, charges fixes et revenu mensuel ; liste de besoins en semences et plants |
| N4 | Liste de chargement théorique par séance | aucun | Pour une semaine, chaque séance liste ce qui est récoltable, plafonné par son volume vendable |
| S1 | Ventes réelles par séance, comparées à l'estimation | Vente réalisée | Estimation et réel côte à côte par point de vente |
| S2 | Récoltes réelles qui recalent rendement et calendrier | Récolte | Prévu / réalisé par plantation |
| S3 | Poules pondeuses comme second atelier | Lot, SaisieJour | Les œufs entrent dans la projection |
| S4 | Application web synchronisée (ADR-001, ADR-003) | aucun | Deux appareils partagent les données après 48 h hors ligne |

Plus tard, dans le même modèle : rotation et Gantt, commandes datées, trésorerie mensuelle complète, registres et conformité. Le pré-cahier des charges complet (≈100 fonctions) sert de backlog.

## Hors périmètre (no-gos)

- Comptabilité et déclarations fiscales.
- Télédéclaration sur telepac, BDAvi ou le site de la MSA.
- Caisse enregistreuse certifiée.
- Place de marché ou précommande grand public.
- Cartographie GPS, capteurs connectés, dépendance à une IA pour fonctionner.
- Pour le noyau : serveur, synchronisation, comptes utilisateurs, saisie au champ, atelier poules, registres réglementaires, rotation automatique.

## Pièges connus

Sur-modélisation agronomique ; fausse précision des marges (d'où les fourchettes) ; réglementation changeante (tables versionnées quand elle entrera) ; référentiels réunionnais introuvables en ligne ; données effacées par le navigateur (d'où l'export rappelé).

## Contraintes

RGPD quand des clients entreront (S1) ; données appartenant à l'agriculteur, export ouvert ; français simple, sans vocabulaire comptable ; les contrôles sont des aides, pas des avis juridiques.

## Questions ouvertes

- [ ] Territoire de la première ferme pilote (La Réunion pressenti).
- [ ] Public prioritaire : maraîcher installé ou porteur de projet.
- [ ] Licence (ADR-002) : MIT ou AGPL.
- [ ] Fermes pilotes identifiées pour le test après N3.
