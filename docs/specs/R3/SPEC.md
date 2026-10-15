# SPEC — Tranche R3 « Plusieurs années »

Liens : `docs/BRIEF.md`, `docs/specs/N2/SPEC.md` (semaine dans le mois de son jeudi), `docs/specs/N3/SPEC.md` (EX-48, charges fixes), `docs/specs/P2/SPEC.md` (EX-33 à EX-35), `docs/specs/R2/SPEC.md` (ferme d'exemple)
Statut : **rédigée par l'agent** le 15/10/2026, plan approuvé par l'humain le 15/10/2026. Lecture seule pour l'agent une fois la tranche commencée.

## Objectif

L'outil ne connaît qu'une « saison » : de la première à la dernière donnée de la ferme. Dès que la ferme déborde d'une année sur l'autre, la synthèse mélange deux années ; et une ferme chargée en 2027 voit apparaître une colonne « déc. 2026 » (la semaine du 1er janvier 2027 compte dans le mois de son jeudi, le 31 décembre) avec un treizième mois de charges fixes. R3 donne à l'outil des années : la synthèse et les ventes montrent une année à la fois, de janvier à décembre, choisie par l'utilisateur ; le calendrier de culture devient une bande continue sur toutes les années de la ferme, ouverte sur l'année choisie, qu'on fait défiler pour voir les cultures qui suivent.

## Choix de l'humain (15/10/2026)

- **Années** : « Calendrier continu + année » — le calendrier de culture est une bande continue sur toutes les années de la ferme ; il s'ouvre sur l'année choisie et on le fait défiler vers les années suivantes ; la synthèse et les ventes montrent une année à la fois, choisie par « ‹ 2026 › » ; la colonne « déc. 2026 » disparaît de 2027.
- **Ordre** : R3 avant R4 « Rotation et associations ».

## Hors périmètre de la tranche

Rotation et associations (R4) ; dates de début et de fin des charges fixes ; comparaison de deux années côte à côte ; report d'un stock d'une année sur l'autre ; trésorerie ; changement de la règle du jeudi.

## Modèle de données

Inchangé (format exporté en version 5). L'année choisie est un état propre au navigateur, comme le dernier export : elle n'est ni exportée, ni comptée comme une modification de la ferme.

## Règles de calcul

- **Année d'une valeur** : celle de son mois, tel que les tranches précédentes le fixent — le mois du jeudi de la semaine pour les ventes, les séances et les poules (N2, S3) ; le mois du jour du milieu de chaque semaine de récolte pour une culture sans débouché (N1) ; le mois de mise en place pour les coûts de culture (N3). La semaine du lundi 28 décembre 2026 au dimanche 3 janvier 2027 appartient donc à 2026.
- **Années de la ferme** : de la première à la dernière année qui porte un mois du tableau (sans le prolongement à 12 mois des charges fixes) ou une barre du calendrier (plantation, de sa mise en place à sa fin de récolte ; lot, de son arrivée à sa réforme). Les années sans donnée entre deux années de la ferme en font partie. Une ferme vide n'a aucune année.
- **Année proposée** : l'année retenue par l'utilisateur si elle est encore une année de la ferme ; sinon l'année en cours si c'en est une ; sinon l'année de la ferme la plus proche de l'année en cours (la plus tardive à égalité).
- **Tableau d'une année** : seules comptent les valeurs de l'année. Mois montrés : les 12 mois de l'année si la ferme a une charge fixe ; sinon du premier au dernier mois de l'année qui porte une valeur. Une culture n'a de ligne que si elle a une valeur dans l'année ; l'atelier poules, de même ; son effectif et son nombre de lots sont ceux des lots présents dans l'année. Les charges fixes comptent leur montant mensuel chaque mois montré (12 mois). Le revenu, les chiffres clés, la barre du haut et le graphique se tirent du tableau de l'année.
- **Ventes d'une année** : le tableau des points de vente garde les mois de l'année, du premier au dernier qui porte une séance ou une vente ; la matrice offre-demande et son bilan gardent les semaines dont le jeudi tombe dans l'année, de la première à la dernière qui porte une offre ou une demande ; le bilan d'un véhicule compte les séances dont le jeudi de la semaine tombe dans l'année.
- **Besoins en semences et plants d'une année** : les plantations mises en place dans l'année.
- **Sans année choisie** (appel sans année) : chaque calcul donne exactement le résultat d'avant R3.
- **Bornes de l'année de la ferme d'exemple** : début le 1er janvier s'il tombe du lundi au jeudi, sinon le lundi suivant ; fin le 31 décembre s'il tombe du jeudi au dimanche, sinon le dimanche précédent. Les séances et les lots de l'exemple, qui couraient du 1er janvier au 31 décembre, prennent ces bornes ; en 2026 rien ne change.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-55 | QUAND la ferme a des données, LE SYSTÈME DOIT proposer ses années et en choisir une (l'année retenue, sinon l'année en cours, sinon la plus proche), et l'utilisateur DOIT pouvoir passer à l'année précédente ou suivante d'un geste | Test unitaire et de bout en bout |
| EX-56 | QUAND une année est choisie, LE SYSTÈME DOIT limiter à cette année la barre du haut et la synthèse (tuiles, tableau, graphique), chaque valeur comptant dans une seule année, et les charges fixes sur ses 12 mois | Test unitaire et de bout en bout, scénarios S15 et S16 |
| EX-57 | QUAND une année est choisie, LE SYSTÈME DOIT limiter à cette année le tableau des points de vente, la matrice offre-demande et son bilan, le bilan des véhicules et les besoins en semences et plants | Test unitaire et de bout en bout |
| EX-58 | QUAND l'utilisateur rouvre l'outil, LE SYSTÈME DOIT retrouver l'année qu'il avait choisie, sans la compter comme une modification de la ferme et sans l'exporter | Test de bout en bout |
| EX-59 | QUAND la ferme s'étend sur plusieurs années, LE SYSTÈME DOIT montrer le calendrier de culture et celui des poules comme une bande continue de janvier de la première année à décembre de la dernière, une année à la largeur de sa boîte, ouverte sur l'année choisie et qui défile vers les autres années dans sa boîte, sans que la page défile en largeur | Test de bout en bout, scénario S17 |
| EX-60 | QUAND la ferme d'exemple est chargée une année donnée, LE SYSTÈME DOIT placer toutes ses valeurs dans cette année : la synthèse en montre les 12 mois, de janvier à décembre, sans mois d'une autre année | Test unitaire et de bout en bout |

## Scénarios clés

```gherkin
Fonctionnalité: Une année à la fois

  Contexte:
    Soit la courgette du scénario S12 de N3 (100 m² le 1er mars 2026, coûts de culture 50 / 60 / 70 €)
    Et les charges fixes du scénario S13 de N3 (assurance 600 € par an, cotisation 150 € par mois)

  Scénario: S15 — la semaine du nouvel an compte dans l'année de son jeudi
    Soit un marché ouvert le samedi, du 2 janvier au 27 mars 2027, qui vend la courgette
    Quand je choisis l'année 2026
    Alors décembre 2026 porte la séance du samedi 2 janvier 2027
    Quand je choisis l'année 2027
    Alors le tableau va de janvier à décembre 2027 et ne compte pas cette séance

  Scénario: S16 — deux années, chacune avec ses 12 mois de charges
    Soit en plus une seconde plantation de courgette de 100 m² le 1er mars 2027
    Quand je choisis l'année 2026
    Alors le tableau va de janvier à décembre 2026, avec 2 400 € de charges fixes
    Et le revenu de 2026 vaut −1 930 / −1 785 / −1 640 €
    Quand je choisis l'année 2027
    Alors le revenu de 2027 vaut aussi −1 930 / −1 785 / −1 640 €
    Et le chiffre d'affaires de 2026 et celui de 2027 font ensemble celui de toute la projection

  Scénario: S17 — le calendrier défile d'une année à l'autre
    Soit la ferme du scénario S16, à 1366 px de large, l'année 2027 choisie
    Quand j'ouvre la page Plantations
    Alors le calendrier va de janvier 2026 à décembre 2027, une année à la largeur de sa boîte
    Et il s'ouvre sur janvier 2027
    Et en le faisant défiler, je vois 2026, sans que la page défile en largeur
```

## Exigences non fonctionnelles

- Celles des tranches précédentes. Aucune ressource réseau, aucune dépendance.
- Le choix de l'année tient dans la barre du haut de 360 à 1920 px sans chevauchement ni défilement de la page en largeur ; à défaut, il est placé dans l'en-tête des pages qui suivent l'année.
- Les flèches du choix de l'année se manient au clavier et portent un nom lisible par un lecteur d'écran.

## Invariants nommés

- Ceux des tranches précédentes.
- `sans_annee_comme_r2` : sans année choisie, `Calc.tableau`, `Calc.pointsDeVente`, `Calc.offreDemande`, `Calc.vehicules` et `Calc.besoinsParMois` donnent exactement leur résultat d'avant R3.
- `somme_des_annees` : pour chaque ligne et chaque niveau de fourchette, la somme des années de la ferme égale le total de toute la projection (volumes, chiffre d'affaires, coût des séances, aliment, coûts de culture, marge) ; seules les charges fixes, qui n'ont pas de date, en sont exclues.
- `exemple_dans_son_annee` : la ferme d'exemple chargée l'année A n'a qu'une année, A.

## Fichiers et interfaces

- `src/calc.js` : `annees(donnees)`, `anneeParDefaut(annees, aujourdhui, retenue)`, `bornesDeLAnnee(annee)` ; option `{ annee }` de `tableau`, `pointsDeVente`, `offreDemande`, `vehicules`, `besoinsParMois`.
- `src/store.js` : l'année retenue dans l'état du navigateur (`annee()`, `retenirAnnee(annee)`), hors export et hors rappel d'export.
- `src/exemple.js` : séances et lots aux bornes de l'année ; `docs/specs/R2/DONNEES.md` reçoit une note (§ 0, 7 et 9).
- `src/ui-annee.js` (nouveau) : le choix de l'année ; `src/index.html` (`rafraichir`, barre du haut, CSS), `src/ui-tableau.js`, `src/ui-synthese.js`, `src/ui-ventes.js`, `src/ui-vehicules.js`, `src/ui-besoins.js`, `src/ui-calendrier.js`, `src/i18n.js`.
- Tests nouveaux : `test/annees.test.js`, `test/annees.e2e.js`.

## Points tranchés le 15/10/2026

- **Plan approuvé par l'humain** : la règle du jeudi est gardée ; la colonne « déc. » de l'année précédente disparaît par la vue d'une année et par les bornes de l'année de la ferme d'exemple. Aucun test existant n'est modifié ; si l'un devait l'être, l'agent s'arrête et le soumet à l'humain.
- Les charges fixes n'ont pas de date : une année en compte 12 mois ; la vue sans année garde la règle de N3 (au moins 12 mois à partir du premier mois).
- Les listes d'enregistrements (séances, plantations, lots…) et la page Charges fixes ne suivent pas l'année : elles montrent ce qui est enregistré.
- On ne peut pas choisir une année au-delà de la dernière année de la ferme : pour préparer une année nouvelle, on y date une plantation.
- La ferme d'exemple reste sur une année (51 plantations) : les tests de R2 restent valables.

## [À CLARIFIER]

(vide)
