# SPEC — Présentation, tranche P1 « Un outil agréable et lisible sur un écran de PC »

Liens : `docs/BRIEF.md`, `docs/specs/N1/SPEC.md`, `docs/adr/ADR-004.md`
Statut : **rédigée par l'agent** le 13/10/2026 à la demande de GDS-42, qui lui a confié l'organisation des tranches suivantes. Lecture seule pour l'agent une fois la tranche commencée. La validation visuelle revient à l'humain (EX-17).

## Objectif

Le maraîcher prépare sa saison sur un PC. Il garde le tableau économique sous les yeux pendant qu'il saisit ou modifie son plan dans des panneaux clairs, et voit tout de suite ce que chaque changement fait à sa projection.

## Hors périmètre de la tranche

Nouveaux objets et nouveaux calculs (points de vente : N2 ; poules : S3), mise en page pensée pour le téléphone (l'outil y reste utilisable, sur une seule colonne), thème sombre, impression, traduction.

## Contraintes héritées de N1

- Un seul fichier HTML livré, sans ressource réseau : aucune police téléchargée, polices du système seulement.
- Les 74 tests de N1 restent verts **sans modification** : les identifiants (`#espace-nom`, `#liste-plantations`, `#tableau`…) et attributs (`data-action`, `data-mesure`, `data-mois`, `data-valeur`…) existants sont conservés, et aucun champ de saisie ne se cache derrière un clic (les tests de N1 remplissent les champs directement).
- Textes de l'interface dans `src/i18n.js`, en français simple.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-11 | QUAND l'écran mesure au moins 1280 × 720 px, LE SYSTÈME DOIT garder le tableau économique visible pendant que l'utilisateur fait défiler les panneaux de saisie, jusqu'au dernier | Test de bout en bout à 1280 × 720, 1366 × 768 et 1920 × 1080 |
| EX-12 | QUAND l'utilisateur ouvre l'outil, LE SYSTÈME DOIT présenter les espaces, les cultures, les variétés, les plantations et la sauvegarde chacun dans un panneau distinct et titré, qui annonce le nombre d'éléments actifs, sans cacher aucun champ de saisie derrière un clic | Test de bout en bout |
| EX-13 | QUAND le tableau économique dépasse la place disponible, LE SYSTÈME DOIT garder visibles les noms des mois et des cultures pendant que l'utilisateur fait défiler le tableau | Test de bout en bout |
| EX-14 | LE SYSTÈME DOIT afficher en permanence, en tête de l'outil, le chiffre d'affaires estimé de la saison en fourchette basse / médiane / haute, signalé comme une estimation, et le recalculer à chaque modification | Test de bout en bout, scénario P1-S3 |
| EX-15 | QUAND l'utilisateur modifie un élément, LE SYSTÈME DOIT signaler le panneau en cours de modification et l'élément concerné dans la liste, jusqu'à l'enregistrement ou l'annulation | Test de bout en bout |
| EX-16 | LE SYSTÈME DOIT rester lisible : aucun défilement horizontal de la page à partir de 1280 px de large, texte courant d'au moins 14 px et mentions secondaires d'au moins 12 px, contraste du texte d'au moins 4,5:1 sur son fond, contour visible autour de l'élément qui a le focus clavier | Test de bout en bout (styles calculés) |
| EX-17 | QUAND la tranche est vérifiée, L'HUMAIN DOIT valider la présentation sur captures d'écran à 1366 × 768 et 1920 × 1080, ferme d'exemple chargée | Validation humaine |

## Scénarios clés

```gherkin
Fonctionnalité: Saisir son plan avec la projection sous les yeux

  Scénario: P1-S1 — le tableau reste sous les yeux
    Soit la ferme d'exemple chargée sur un écran de 1366 × 768
    Quand je fais défiler les panneaux de saisie jusqu'à celui des plantations
    Alors le tableau économique reste visible
    Et quand je réduis la surface d'une plantation de courgette, le chiffre d'affaires de la courgette baisse sous mes yeux

  Scénario: P1-S2 — lire un grand tableau
    Soit la ferme d'exemple chargée sur un écran de 1280 × 720
    Quand je fais défiler le tableau jusqu'à sa dernière colonne et sa dernière ligne
    Alors le nom de la culture et le nom du mois restent visibles

  Scénario: P1-S3 — la saison en un coup d'œil
    Soit la ferme du scénario S2 (une courgette de 100 m², 2 / 2,50 / 3 € le kg)
    Alors la synthèse en tête affiche un chiffre d'affaires estimé de 675 €, entre 540 € et 810 €
    Quand je passe la surface de la plantation à 50 m²
    Alors la synthèse affiche 338 €, entre 270 € et 405 €
```

## Exigences non fonctionnelles

- Mêmes que N1 : un seul fichier, aucune ressource réseau, Firefox et Chrome récents, 200 plantations en moins d'une seconde.
- Le rafraîchissement complet de l'affichage pour la ferme d'exemple reste imperceptible (moins de 100 ms dans Chromium).

## Invariants nommés

- `tests_n1_inchanges` : les tests de N1 passent sans aucune modification.
- `un_seul_fichier` : `dist/index.html` ne charge aucune autre ressource (test `[T01]`).
- `calcul_sans_dom` : toujours vrai ; les modules de rendu n'ajoutent aucun calcul métier, ils appellent `Calc`.

## Fichiers et interfaces

- `src/index.html` : structure de la page, styles, démarrage.
- `src/ui-commun.js` : outils d'affichage partagés (création d'éléments, textes, formats de nombres, de dates et de fourchettes).
- `src/ui-saisie.js` : panneaux de saisie (formulaires, listes, mode modification).
- `src/ui-tableau.js` : tableau économique et synthèse.
- `src/ui-sauvegarde.js` : export, import, rappel d'export.
- `build.sh` intègre chaque module dans `dist/index.html`, comme les autres.
- `AGENTS.md` : la règle « rendu dans `src/index.html` seulement » devient « rendu dans `src/index.html` et les modules `src/ui-*.js` » (découpage prévu par `docs/ORCHESTRATION.md` à partir de N2).

## Points tranchés le 13/10/2026

- Deux volets sur un écran large : les panneaux de saisie dans une colonne à gauche, la projection (synthèse et tableau) à droite, chaque volet avec son propre défilement. En dessous de 1100 px de large, une seule colonne, la projection en premier.
- Tous les panneaux de saisie restent ouverts ; une barre de raccourcis mène à chacun.
- Polices du système, chiffres à chasse fixe dans le tableau ; une couleur d'accent (vert foncé), une couleur d'alerte (ambre), une couleur d'information (bleu).
- Le canevas de design sert à comparer des maquettes avant d'écrire le code ; il ne remplace pas la validation sur captures du vrai fichier.

## Limites pour l'agent

- **TOUJOURS** : écrire le test avant le code ; coller la sortie de test comme preuve ; garder la logique hors du rendu.
- **DEMANDER D'ABORD** : ajouter une dépendance, même en ligne ; changer le modèle de données ; ajouter un objet non listé dans le modèle.
- **JAMAIS** : modifier les tests existants ou les spécifications ; charger une ressource réseau (police comprise) ; envoyer des données hors du navigateur ; coder une valeur agronomique ou un prix en dur ailleurs que dans la ferme d'exemple.

## Vérification de bout en bout

`./verify.sh P1` lance tous les tests (`node --test test/*.test.js`, puis Playwright sur `dist/index.html`) : ceux de N1 inchangés et ceux de P1. Attendu : code de sortie 0. Puis l'humain valide les captures (EX-17).

## [À CLARIFIER]

(vide)
