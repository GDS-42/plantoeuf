# SPEC — Tranche R5 « Déplacer les plantations et exemple sur deux ans »

Liens : `docs/specs/N1/SPEC.md` (plantation, dates de récolte, sur-occupation EX-06), `docs/specs/P2/SPEC.md` (EX-35, calendrier ; EX-37, lisibilité et clavier), `docs/specs/R3/SPEC.md` (plusieurs années, calendrier continu), `docs/specs/R4/SPEC.md` (règles de rotation), `docs/specs/R2/SPEC.md` et `DONNEES.md` (ferme d'exemple)
Statut : **rédigée par l'agent** le 17/10/2026, plan approuvé par l'humain le 17/10/2026. Lecture seule pour l'agent une fois la tranche commencée.

## Objectif

Le calendrier de culture montre où et quand chaque plantation occupe un espace, mais pour la déplacer il faut ouvrir son tiroir et retaper une date ou choisir un autre espace. R5 permet de saisir la barre et de la poser ailleurs : plus tôt, plus tard, sur un autre espace. Pendant le geste, l'outil dit ce que le déplacement créerait (sur-occupation, retour trop tôt, mauvais précédent ou voisin) ; au lâcher, il enregistre et propose d'annuler. La ferme d'exemple passe à deux ans : sa deuxième année reprend les mêmes cultures aux mêmes saisons, sur des espaces choisis selon ses règles de rotation, et montre le calendrier qui défile d'une année à l'autre.

## Choix de l'humain (17/10/2026)

- **Ce que change le geste** : la date (glisser à gauche ou à droite) et l'espace (glisser vers une autre ligne).
- **Au lâcher** : enregistré tout de suite, avec « Annuler » pendant quelques secondes.
- **Pendant le geste** : les conséquences sur la rotation et l'occupation s'affichent en direct ; ce sont des alertes, le lâcher reste permis.
- **Ferme d'exemple** : une deuxième année ; les tests existants sont découplés du nombre de plantations de l'exemple (accord donné pour les modifier, voir « Tests existants modifiés »).
- **Méthode** : tâches enchaînées par l'agent principal, sans agents en parallèle (évaluation consignée dans le plan) ; relecture Fable de chaque tâche, évaluateur Fable de la tranche.

## Hors périmètre de la tranche

Déplacer plusieurs plantations à la fois ; changer la durée d'une plantation en tirant son bord ; glisser les lots de poules ou les lignes des listes ; création automatique d'une rotation (tranche R6, après décision de l'humain sur le no-go du BRIEF) ; documentation de l'outil (tranche ultérieure).

## Modèle de données

Inchangé (version 6). Un déplacement modifie la `date` et l'`espaceId` d'une plantation, comme le tiroir de modification ; sa date de modification change.

## Règles

- **Déplacement** : la barre posée commence au jour visé — la nouvelle date de mise en place ; ses dates de récolte se recalculent (règle de N1) ; l'espace est celui de la ligne visée. Un jour qui tombe dans une autre année que celle choisie est permis.
- **Conséquences d'un déplacement** (`Calc.consequencesDeplacement`) : les alertes que le déplacement fait apparaître, et celles qu'il fait disparaître, en comparant la ferme avant et après sur les deux espaces concernés (celui de départ et celui d'arrivée) :
  - sur-occupation : les mois où un de ces espaces devient sur-occupé, ou plus sur-occupé ;
  - retour trop tôt (R4) : les plantations de ces espaces qui reviennent trop tôt après le déplacement et pas avant (la plantation déplacée comprise) ;
  - précédent ou voisin défavorable (R4) : de même.
  Le calcul ne modifie aucun enregistrement.
- **Annuler** : rétablit la date et l'espace d'avant le déplacement, et rien d'autre.
- **Ferme d'exemple sur deux ans** :
  - la première année est celle de R2 et R4, sans aucun changement de chiffre ;
  - la deuxième année reprend chaque plantation de la première, même variété, même surface, même jour et mois, sur un espace choisi selon les règles de rotation de l'exemple ; le choix et les alertes qui restent sont expliqués dans `DONNEES.md` § 15 ;
  - les séances vont du début de la première année à la fin de la deuxième ; les lots de poules de la deuxième année reprennent le schéma de la première ;
  - les charges fixes sont les mêmes chaque année.

## Exigences

| ID | Exigence | Vérification |
| --- | --- | --- |
| EX-67 | QUAND l'utilisateur fait glisser la barre d'une plantation dans le calendrier de culture et la lâche, LE SYSTÈME DOIT enregistrer sa nouvelle date de mise en place (le jour visé) et son nouvel espace (la ligne visée), et recalculer tout l'affichage, sans rien refuser | Test de bout en bout, scénario S22 |
| EX-68 | QUAND l'utilisateur glisse une barre, LE SYSTÈME DOIT montrer en direct la date et l'espace visés, et les alertes que le déplacement ferait apparaître (sur-occupation, retour trop tôt, précédent ou voisin défavorable) | Test unitaire et de bout en bout, scénario S22 |
| EX-69 | QUAND une plantation vient d'être déplacée, LE SYSTÈME DOIT proposer « Annuler » pendant quelques secondes, qui rétablit sa date et son espace d'avant | Test de bout en bout, scénario S23 |
| EX-70 | QUAND l'utilisateur se sert du clavier ou d'un écran tactile, LE SYSTÈME DOIT permettre le même déplacement (clavier : touche D, flèches, Entrée, Échap ; tactile : appui long), et un simple clic ou la touche Entrée hors déplacement DOIT toujours ouvrir la modification | Test de bout en bout |
| EX-71 | QUAND la ferme d'exemple est chargée, LE SYSTÈME DOIT y inclure une deuxième année qui reprend les cultures, surfaces et dates de la première sur des espaces choisis selon ses règles de rotation, avec ses séances et ses lots, sans changer aucun chiffre de la première année ; l'effacement de l'exemple DOIT tout retirer | Test unitaire et de bout en bout, scénario S24 |

## Scénarios clés

```gherkin
Fonctionnalité: Déplacer une plantation dans le calendrier

  Contexte:
    Soit la famille « Solanacées » avec un délai de retour de 2 / 3 / 4 ans
    Et la culture tomate (« Solanacées »), 70 jours avant récolte, 11 semaines de récolte, et sa variété Heatmaster
    Et les planches « planche 1 » et « planche 2 » de 30 m²
    Et une tomate de 30 m² sur la planche 1 le 1er mars 2026
    Et une tomate de 30 m² sur la planche 2 le 1er mars 2027

  Scénario: S22 — glisser vers une autre date et un autre espace
    Quand je saisis la barre de la tomate de 2027 et la glisse sur la ligne de la planche 1, au 15 mars 2027
    Alors l'étiquette du geste dit « 15/03/2027 · planche 1 » et « Retour trop tôt des Solanacées »
    Quand je la lâche
    Alors la plantation est enregistrée sur la planche 1 au 15/03/2027
    Et sa barre est dans la ligne de la planche 1, marquée « retour trop tôt »

  Scénario: S23 — annuler
    Quand je lâche la barre puis choisis « Annuler » dans le message
    Alors la plantation est revenue sur la planche 2 au 01/03/2027

  Scénario: S24 — la ferme d'exemple sur deux ans
    Soit la ferme d'exemple chargée en 2026
    Alors le calendrier de culture va de janvier 2026 à décembre 2027 et défile de l'une à l'autre
    Et la synthèse de 2026 donne les mêmes chiffres qu'avant R5
    Et la synthèse de 2027 a ses ventes, ses lots et ses charges
    Et les alertes de rotation de 2027 sont celles que décrit le § 15 du dossier de données
```

## Exigences non fonctionnelles

- Celles des tranches précédentes (dont EX-37 : tailles, contrastes, thèmes clair et sombre, aucun défilement de page de 360 à 1920 px, contour de focus visible). Aucune ressource réseau, aucune dépendance.
- Le calcul des conséquences d'un déplacement sur la ferme d'exemple reste sous 30 ms, pour suivre le pointeur.

## Invariants nommés

- Ceux des tranches précédentes, dont `alerte_seulement` (R4) : aucun déplacement n'est refusé.
- `deplacement_sans_effet` : calculer les conséquences d'un déplacement ne crée, ne modifie et ne supprime aucun enregistrement.
- `annuler_retablit` : après « Annuler », la date et l'espace de la plantation sont ceux d'avant le déplacement.
- `premiere_annee_comme_r4` : avec la ferme d'exemple sur deux ans, le tableau, les ventes et les aides de la première année sont ceux de la ferme d'exemple d'une seule année.

## Tests existants modifiés (accord de l'humain du 17/10/2026)

La ferme d'exemple passe de 51 à 102 plantations et de une à deux années. Sont modifiés, et seulement eux :
- les tests qui écrivent en dur le nombre de plantations de l'exemple (51) : ils le lisent dans `Exemple.NOMBRE_DE_PLANTATIONS` ;
- les tests qui exigent un exemple d'une seule année : [T54] `exemple_dans_son_annee` et « en 2026, la ferme d'exemple ne change pas », [T55] « la ferme d'exemple chargée en 2027 n'a qu'une année », [T36] « à 1366 px le calendrier tient sans défilement » (qui le vérifie sur une ferme d'une seule année), [T51] « la ferme produit et vend sur les douze mois de l'année de chargement », [T31] « deux lots de poules dans l'année choisie », [T63] décompte des alertes de rotation ; chacun garde sa règle pour la première année et la complète pour la deuxième.

Chaque modification est listée dans `PROGRESS.md`, avant et après. Tout autre test existant à modifier arrête la tâche et revient à l'humain.

## Fichiers et interfaces

- `src/calc.js` : `consequencesDeplacement(donnees, plantationId, { date, espaceId })`.
- `src/ui-calendrier.js` (geste à la souris, au doigt et au clavier ; étiquette ; ligne visée ; défilement près des bords), `src/ui-saisie.js` (`annoncer` avec une action « Annuler »), `src/index.html` (styles, câblage), `src/i18n.js`.
- `src/exemple.js` (deuxième année), `docs/specs/R2/DONNEES.md` (§ 15).
- Tests nouveaux : `test/deplacement.test.js`, `test/deplacement.e2e.js`, `test/exemple-r5.test.js`, `test/exemple-r5.e2e.js`.

## [À CLARIFIER]

(vide)
