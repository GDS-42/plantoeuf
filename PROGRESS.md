# PROGRESS — journal de progression

Une entrée par session : date, tâche, modèle et effort utilisés, nombre de reprises, verdict de l'évaluateur (si relecture), résultat, preuve (sortie de `./verify.sh`), commit.
L'agent ajoute en bas ; il ne réécrit jamais les entrées précédentes.

Tranche en cours : N2 · Sessions consommées : 9 / 12 (seuil d'alerte) · P1 : 6 / 9, T17 en attente de validation humaine · N1 terminée en 10 / 15

---

## 13/10/2026 · T01 — Squelette

- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T01` → exit 0 ; `./verify.sh N1` → exit 0 (3 tests unitaires, 2 de bout en bout).
- Fichiers : `src/index.html`, `src/store.js`, `src/calc.js`, `src/i18n.js`, `verify.sh`, `test/squelette.test.js`, `test/squelette.e2e.js`.
- Rouge d'abord : `verify.sh` échouait avant tout test (`node --test test/` → `Cannot find module '…/test'` sous Node 22) ; une fois corrigé, rouge sur `Cannot find module '../src/store.js'` ; Playwright rouge sur `net::ERR_FILE_NOT_FOUND …/dist/index.html`.
- Environnement : vérification lancée avec `PLAYWRIGHT_BROWSERS_PATH` pointant vers un dossier local hors dépôt (voir RUNBOOK, Surprises).
- Commit : « T01 — Squelette : modules chargés, un espace retrouvé après réouverture ».

Preuve (`./verify.sh T01`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 5282 octets
== Tests unitaires (node --test) ==
TAP version 13
# Subtest: [T01] un stockage vide donne une ferme sans espace
ok 1 - [T01] un stockage vide donne une ferme sans espace
  ---
  duration_ms: 2.657761
  type: 'test'
  ...
# Subtest: [T01] un espace enregistré est retrouvé après réouverture
ok 2 - [T01] un espace enregistré est retrouvé après réouverture
  ---
  duration_ms: 0.258621
  type: 'test'
  ...
# Subtest: [T01] calc.js se charge sans navigateur et n'accède pas au DOM
ok 3 - [T01] calc.js se charge sans navigateur et n'accède pas au DOM
  ---
  duration_ms: 0.869545
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 78.787274
== Tests de bout en bout (Playwright) ==

Running 2 tests using 1 worker

  ✓  1 test/squelette.e2e.js:4:1 › [T01] un espace créé est retrouvé après fermeture et réouverture du fichier (479ms)
  ✓  2 test/squelette.e2e.js:19:1 › [T01] le fichier assemblé ne charge aucune autre ressource (100ms)

  2 passed (1.3s)
== T01 : vérification verte ==
```

## 13/10/2026 · T02 — Modèle de données

- Session 2 du seuil d'alerte (tâches enchaînées dans une même conversation, à la demande de l'humain ; chaque tâche compte pour une session).
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable (sous-agent, contexte frais) → **CONFORME**. Remarque non bloquante : les messages d'erreur du store ne doivent pas s'afficher tels quels ; le rendu les traduira par leur `code` via `i18n.js`.
- Résultat : **vert**. `./verify.sh T02` → exit 0 (13 tests unitaires, 1 de bout en bout) ; `./verify.sh N1` → exit 0.
- Fichiers : `src/store.js`, `test/store.test.js`, `test/modele.e2e.js`.
- Rouge d'abord : 12 tests unitaires sur 13 rouges (`ferme.ajouter is not a function`…) ; le test de bout en bout rouge sur l'ancien store (`id` absent).
- Ajout hors liste `fichiers` : `test/modele.e2e.js`, car `./verify.sh T02` exige un test Playwright `[T02]` ; il vérifie l'UUID dans le navigateur ouvert en `file://`.
- Commit : « T02 — Modèle de données : UUID, dates, suppression logique, fourchette ordonnée ».

Preuve (`./verify.sh T02`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 10399 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/squelette.test.js
ok 1 - test/squelette.test.js
  ---
  duration_ms: 68.739658
  type: 'test'
  ...
# Subtest: [T02] un enregistrement reçoit un UUID, ses dates de création et de modification, et supprimeLe nul
ok 2 - [T02] un enregistrement reçoit un UUID, ses dates de création et de modification, et supprimeLe nul
  ---
  duration_ms: 6.528827
  type: 'test'
  ...
# Subtest: [T02] chaque enregistrement a un identifiant distinct
ok 3 - [T02] chaque enregistrement a un identifiant distinct
  ---
  duration_ms: 1.653654
  type: 'test'
  ...
# Subtest: [T02] les quatre objets du noyau sont enregistrés et retrouvés après réouverture
ok 4 - [T02] les quatre objets du noyau sont enregistrés et retrouvés après réouverture
  ---
  duration_ms: 2.500968
  type: 'test'
  ...
# Subtest: [T02] un objet absent du modèle est refusé
ok 5 - [T02] un objet absent du modèle est refusé
  ---
  duration_ms: 1.807317
  type: 'test'
  ...
# Subtest: [T02] modifier change les champs et la date de modification, pas la date de création
ok 6 - [T02] modifier change les champs et la date de modification, pas la date de création
  ---
  duration_ms: 0.606488
  type: 'test'
  ...
# Subtest: [T02] l'identifiant et les dates ne se changent pas par la saisie
ok 7 - [T02] l'identifiant et les dates ne se changent pas par la saisie
  ---
  duration_ms: 0.322872
  type: 'test'
  ...
# Subtest: [T02] suppression_logique_seulement : supprimer date l'enregistrement sans l'effacer
ok 8 - [T02] suppression_logique_seulement : supprimer date l'enregistrement sans l'effacer
  ---
  duration_ms: 0.624478
  type: 'test'
  ...
# Subtest: [T02] supprimer à nouveau garde la première date de suppression
ok 9 - [T02] supprimer à nouveau garde la première date de suppression
  ---
  duration_ms: 0.229556
  type: 'test'
  ...
# Subtest: [T02] un enregistrement rendu par le store ne change pas les données enregistrées
ok 10 - [T02] un enregistrement rendu par le store ne change pas les données enregistrées
  ---
  duration_ms: 0.508073
  type: 'test'
  ...
# Subtest: [T02] un seul nombre remplit les trois valeurs de la fourchette
ok 11 - [T02] un seul nombre remplit les trois valeurs de la fourchette
  ---
  duration_ms: 0.382734
  type: 'test'
  ...
# Subtest: [T02] fourchette_ordonnee : basse ≤ médiane ≤ haute, sinon refus
ok 12 - [T02] fourchette_ordonnee : basse ≤ médiane ≤ haute, sinon refus
  ---
  duration_ms: 0.244351
  type: 'test'
  ...
# Subtest: [T02] fourchette_ordonnee : le store refuse d'enregistrer une fourchette désordonnée
ok 13 - [T02] fourchette_ordonnee : le store refuse d'enregistrer une fourchette désordonnée
  ---
  duration_ms: 0.293668
  type: 'test'
  ...
# Subtest: [T02] la saisie d'une fourchette accepte un nombre ou trois, avec la virgule décimale
ok 14 - [T02] la saisie d'une fourchette accepte un nombre ou trois, avec la virgule décimale
  ---
  duration_ms: 0.531397
  type: 'test'
  ...
1..14
# tests 14
# suites 0
# pass 14
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 119.515014
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/modele.e2e.js:6:1 › [T02] dans le fichier ouvert, un espace enregistré porte un UUID, ses dates et supprimeLe nul (237ms)

  1 passed (884ms)
== T02 : vérification verte ==
```

## 13/10/2026 · T03 — Saisie et liste des espaces, cultures, variétés et plantations

- Session 3 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T03` → exit 0 (5 tests de bout en bout) ; `./verify.sh N1` → exit 0.
- Fichiers : `src/index.html`, `src/i18n.js`, `test/saisie.e2e.js`.
- Rouge d'abord : les 5 tests `[T03]` échouaient (champs `#culture-nom`, `#variete-nom`… absents).
- Les erreurs du store s'affichent par leur `code`, traduit dans `i18n.js` (remarque du relecteur de T02).
- Commit : « T03 — Saisie et liste des espaces, cultures, variétés et plantations ».

Preuve (`./verify.sh T03`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 27018 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/squelette.test.js
ok 1 - test/squelette.test.js
  ---
  duration_ms: 61.497155
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 2 - test/store.test.js
  ---
  duration_ms: 93.538906
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 109.15854
== Tests de bout en bout (Playwright) ==

Running 5 tests using 1 worker

  ✓  1 test/saisie.e2e.js:73:1 › [T03] espaces, cultures, variétés et plantations sont saisis, listés et retrouvés après réouverture (718ms)
  ✓  2 test/saisie.e2e.js:94:1 › [T03] une variété ne garde que les champs numériques surchargés, les autres viennent de la culture (496ms)
  ✓  3 test/saisie.e2e.js:110:1 › [T03] une modification est enregistrée et retrouvée après réouverture (870ms)
  ✓  4 test/saisie.e2e.js:142:1 › [T03] une suppression retire l'élément des listes, même après réouverture, sans l'effacer du stockage (668ms)
  ✓  5 test/saisie.e2e.js:165:1 › [T03] une fourchette désordonnée est refusée avec un message, sans rien enregistrer (230ms)

  5 passed (3.8s)
== T03 : vérification verte ==
```

## 13/10/2026 · T04 — Dates de récolte et répartition hebdomadaire

- Session 4 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 (aucun écart) · Relecteur : Fable, deux passages en contexte frais.
  - 1er passage → **CONFORME**, avec une remarque : la première version répartissait au jour près dans une semaine, alors que la spec tranche « Granularité de la répartition : la semaine ». Corrigé avant commit : une semaine compte entière dans la période qui contient la plupart de ses jours ; le test au prorata des jours a été remplacé (avant tout commit) par un test de granularité, rouge puis vert.
  - 2e passage, sur le diff final → **CONFORME**.
- Résultat : **vert**. `./verify.sh T04` → exit 0 (8 tests unitaires, 1 de bout en bout) ; `./verify.sh N1` → exit 0.
- Fichiers : `src/calc.js`, `test/calc.test.js`, et hors liste `fichiers` : `src/index.html`, `src/i18n.js`, `test/recolte.e2e.js` (affichage des dates de récolte ; `./verify.sh T04` exige un test Playwright `[T04]`).
- Rouge d'abord : 7 tests `[T04]` rouges (`Calc.ajouterJours is not a function`…), test de bout en bout rouge (dates absentes de la liste).
- Commit : « T04 — Dates de récolte et répartition hebdomadaire de la production ».

Preuve (`./verify.sh T04`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 30942 octets
== Tests unitaires (node --test) ==
TAP version 13
# Subtest: [T04] les dates se calculent au jour près, y compris d'une année sur l'autre
ok 1 - [T04] les dates se calculent au jour près, y compris d'une année sur l'autre
  ---
  duration_ms: 1.228803
  type: 'test'
  ...
# Subtest: [T04] EX-02 : une variété sans surcharge reprend les durées de la culture
ok 2 - [T04] EX-02 : une variété sans surcharge reprend les durées de la culture
  ---
  duration_ms: 1.312022
  type: 'test'
  ...
# Subtest: [T04] EX-02 : les durées surchargées par la variété priment sur celles de la culture
ok 3 - [T04] EX-02 : les durées surchargées par la variété priment sur celles de la culture
  ---
  duration_ms: 0.27455
  type: 'test'
  ...
# Subtest: [T04] EX-03 : production = surface × rendement × (1 − pertes), en fourchette
ok 4 - [T04] EX-03 : production = surface × rendement × (1 − pertes), en fourchette
  ---
  duration_ms: 0.300821
  type: 'test'
  ...
# Subtest: [T04] S1 : 33,75 kg par semaine du 30 avril au 24 juin
ok 5 - [T04] S1 : 33,75 kg par semaine du 30 avril au 24 juin
  ---
  duration_ms: 2.340266
  type: 'test'
  ...
# Subtest: [T04] S1 : 0 kg les autres semaines (production_nulle_hors_fenetre)
ok 6 - [T04] S1 : 0 kg les autres semaines (production_nulle_hors_fenetre)
  ---
  duration_ms: 0.407455
  type: 'test'
  ...
# Subtest: [T04] EX-03 : la répartition est uniforme, à la semaine, et rend toute la production sur la fenêtre
ok 7 - [T04] EX-03 : la répartition est uniforme, à la semaine, et rend toute la production sur la fenêtre
  ---
  duration_ms: 0.39838
  type: 'test'
  ...
# Subtest: [T04] granularité à la semaine : une semaine compte entière dans la période qui contient la plupart de ses jours
ok 8 - [T04] granularité à la semaine : une semaine compte entière dans la période qui contient la plupart de ses jours
  ---
  duration_ms: 0.372851
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 2 - test/squelette.test.js
  ---
  duration_ms: 76.037782
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 3 - test/store.test.js
  ---
  duration_ms: 74.309539
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 100.924522
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/recolte.e2e.js:9:1 › [T04] une plantation saisie affiche ses dates de première et de dernière récolte (606ms)

  1 passed (1.5s)
== T04 : vérification verte ==
```

## 13/10/2026 · T05 — Tableau économique par culture et par mois

- Session 5 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable, contexte frais → **CONFORME**.
- Résultat : **vert**. `./verify.sh T05` → exit 0 (7 tests unitaires, 4 de bout en bout) ; `./verify.sh N1` → exit 0.
- Fichiers : `src/calc.js`, `src/index.html`, `src/i18n.js`, `test/calc.test.js`, `test/tableau.e2e.js`, et `test/outils.js` (aides de saisie partagées par les nouveaux tests de bout en bout, ni test unitaire ni test Playwright).
- Rouge d'abord : 7 tests unitaires rouges (`Calc.tableau is not a function`), 4 de bout en bout rouges (tableau absent).
- S2 : mai = 5 semaines × 33,75 kg = 168,75 kg ; CA 337,5 / 421,875 / 506,25 € ; médiane = volume de mai × 2,50 €. 200 plantations : bien moins d'une seconde (test unitaire).
- Commit : « T05 — Tableau économique par culture et par mois, en fourchette ».

Preuve (`./verify.sh T05`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 39829 octets
== Tests unitaires (node --test) ==
TAP version 13
# Subtest: [T05] S2 : en mai, le CA de la courgette est une fourchette dont la médiane vaut le volume de mai × 2,50 €
ok 1 - [T05] S2 : en mai, le CA de la courgette est une fourchette dont la médiane vaut le volume de mai × 2,50 €
  ---
  duration_ms: 5.914736
  type: 'test'
  ...
# Subtest: [T05] EX-04 : par culture et par mois, volume, CA et marge en fourchette ; marge égale au CA en N1
ok 2 - [T05] EX-04 : par culture et par mois, volume, CA et marge en fourchette ; marge égale au CA en N1
  ---
  duration_ms: 2.552361
  type: 'test'
  ...
# Subtest: [T05] le CA se calcule plantation par plantation, au prix de sa variété
ok 3 - [T05] le CA se calcule plantation par plantation, au prix de sa variété
  ---
  duration_ms: 0.615032
  type: 'test'
  ...
# Subtest: [T05] une ligne par culture, rangée par nom, et le total de la ferme par mois
ok 4 - [T05] une ligne par culture, rangée par nom, et le total de la ferme par mois
  ---
  duration_ms: 7.478891
  type: 'test'
  ...
# Subtest: [T05] les plantations supprimées, ou dont la variété ou la culture est supprimée, ne comptent pas
ok 5 - [T05] les plantations supprimées, ou dont la variété ou la culture est supprimée, ne comptent pas
  ---
  duration_ms: 0.520548
  type: 'test'
  ...
# Subtest: [T05] une ferme sans plantation donne un tableau vide
ok 6 - [T05] une ferme sans plantation donne un tableau vide
  ---
  duration_ms: 0.203347
  type: 'test'
  ...
# Subtest: [T05] une ferme de 200 plantations se calcule en moins d'une seconde
ok 7 - [T05] une ferme de 200 plantations se calcule en moins d'une seconde
  ---
  duration_ms: 16.327764
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 2 - test/squelette.test.js
  ---
  duration_ms: 77.785701
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 3 - test/store.test.js
  ---
  duration_ms: 92.116708
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 125.160207
== Tests de bout en bout (Playwright) ==

Running 4 tests using 1 worker

  ✓  1 test/tableau.e2e.js:5:1 › [T05] S2 : en mai, la ligne courgette donne un CA en fourchette dont la médiane vaut le volume de mai × 2,50 € (592ms)
  ✓  2 test/tableau.e2e.js:19:1 › [T05] EX-04 : le tableau donne pour chaque mois le volume, le chiffre d'affaires et la marge (502ms)
  ✓  3 test/tableau.e2e.js:34:1 › [T05] EX-09 : les en-têtes signalent des estimations en fourchette basse / médiane / haute (492ms)
  ✓  4 test/tableau.e2e.js:45:1 › [T05] sans plantation, le tableau annonce qu'aucune récolte n'est prévue (111ms)

  4 passed (2.4s)
== T05 : vérification verte ==
```

## 13/10/2026 · T06 — Recalcul automatique du tableau

- Session 6 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T06` → exit 0 (3 tests de bout en bout) ; `./verify.sh N1` → exit 0.
- Fichiers : `src/index.html`, `test/tableau.e2e.js` (tests ajoutés à la fin, ceux de T05 inchangés).
- Rouge d'abord, en partie seulement : les deux tests de modification dans la même page étaient **verts dès l'écriture**, car le rafraîchissement unique (T03), branché sur le tableau en T05, recalculait déjà tout ; ils figent l'exigence. Le test « autre onglet » était rouge (tableau de l'autre onglet resté à 421,875 € au lieu de 210,94 €). Un défaut de mon propre test (boutons détachés après rafraîchissement) a été corrigé avant le commit.
- Ajout : la page écoute l'événement `storage` ; une modification faite dans un autre onglet recalcule le tableau et évite qu'une saisie dans l'onglet resté ouvert n'écrase les données.
- Commit : « T06 — Recalcul automatique du tableau à chaque modification ».

Preuve (`./verify.sh T06`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 40209 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 79.190076
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 2 - test/squelette.test.js
  ---
  duration_ms: 73.437948
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 3 - test/store.test.js
  ---
  duration_ms: 90.170999
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 110.786315
== Tests de bout en bout (Playwright) ==

Running 3 tests using 1 worker

  ✓  1 test/tableau.e2e.js:59:1 › [T06] modifier la surface d'une plantation recalcule le tableau sans autre action (685ms)
  ✓  2 test/tableau.e2e.js:71:1 › [T06] changer un prix, ajouter ou supprimer une plantation recalcule le tableau (767ms)
  ✓  3 test/tableau.e2e.js:89:1 › [T06] une modification faite dans un autre onglet recalcule le tableau ouvert, sans l'écraser ensuite (862ms)

  3 passed (3.0s)
== T06 : vérification verte ==
```

## 13/10/2026 · T07 — Signal de sur-occupation d'un espace

- Session 7 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T07` → exit 0 (6 tests unitaires, 2 de bout en bout) ; `./verify.sh N1` → exit 0.
- Fichiers : `src/calc.js`, `src/index.html`, `src/i18n.js`, `test/calc.test.js`, `test/espaces.e2e.js`.
- Rouge d'abord : 6 tests unitaires rouges (`Calc.surOccupations is not a function`) ; test S3 de bout en bout rouge (signal absent). Le second test de bout en bout passait à vide : précondition « signal d'abord visible » ajoutée avant le commit.
- Refactor : `Calc.tableau` et `Calc.surOccupations` partagent la résolution des plantations calculables.
- Commit : « T07 — Signal de sur-occupation d'un espace ».

Preuve (`./verify.sh T07`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 43653 octets
== Tests unitaires (node --test) ==
TAP version 13
# Subtest: [T07] S3 : deux plantations de 20 m² qui se chevauchent en juin sur 30 m² signalent juin
ok 1 - [T07] S3 : deux plantations de 20 m² qui se chevauchent en juin sur 30 m² signalent juin
  ---
  duration_ms: 2.958989
  type: 'test'
  ...
# Subtest: [T07] une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte
ok 2 - [T07] une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte
  ---
  duration_ms: 0.541641
  type: 'test'
  ...
# Subtest: [T07] occuper exactement la surface de l'espace n'est pas une sur-occupation
ok 3 - [T07] occuper exactement la surface de l'espace n'est pas une sur-occupation
  ---
  duration_ms: 0.377038
  type: 'test'
  ...
# Subtest: [T07] chaque période garde la surface occupée, et chaque mois la plus grande
ok 4 - [T07] chaque période garde la surface occupée, et chaque mois la plus grande
  ---
  duration_ms: 0.312075
  type: 'test'
  ...
# Subtest: [T07] une sur-occupation sur deux mois les signale tous les deux ; les espaces sont indépendants
ok 5 - [T07] une sur-occupation sur deux mois les signale tous les deux ; les espaces sont indépendants
  ---
  duration_ms: 0.37884
  type: 'test'
  ...
# Subtest: [T07] les plantations supprimées, ou dont la variété est supprimée, n'occupent rien
ok 6 - [T07] les plantations supprimées, ou dont la variété est supprimée, n'occupent rien
  ---
  duration_ms: 0.260912
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 2 - test/squelette.test.js
  ---
  duration_ms: 82.576982
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 3 - test/store.test.js
  ---
  duration_ms: 77.61338
  type: 'test'
  ...
1..8
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 99.675541
== Tests de bout en bout (Playwright) ==

Running 2 tests using 1 worker

  ✓  1 test/espaces.e2e.js:18:1 › [T07] S3 : « planche 4 » porte un signal de sur-occupation pour juin, et les deux plantations restent enregistrées (790ms)
  ✓  2 test/espaces.e2e.js:33:1 › [T07] le signal disparaît dès que la sur-occupation est corrigée (852ms)

  2 passed (2.3s)
== T07 : vérification verte ==
```

## 13/10/2026 · T08 — Export et import JSON, rappel d'export

- Session 8 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable, contexte frais → **CONFORME**.
- Résultat : **vert**. `./verify.sh T08` → exit 0 (7 tests unitaires, 4 de bout en bout) ; `./verify.sh N1` → exit 0.
- Fichiers : `src/store.js`, `src/index.html`, `src/i18n.js`, `test/store.test.js` (tests ajoutés à la fin), `test/export.e2e.js`.
- Rouge d'abord : 7 tests unitaires rouges (`ferme.exporter is not a function`…), 4 de bout en bout rouges (boutons absents).
- Aller-retour vérifié par un vrai téléchargement d'un navigateur vers un autre, vide : réexport identique hors date d'export, supprimés compris. Rappel vérifié à l'ouverture avec l'horloge de Playwright (6 jours : rien ; 7 jours : rappel ; après export : plus rien).
- Commit : « T08 — Export et import JSON à l'identique, rappel d'export à 7 jours ».

Preuve (`./verify.sh T08`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 51486 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 71.185043
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 2 - test/squelette.test.js
  ---
  duration_ms: 69.781088
  type: 'test'
  ...
# Subtest: [T08] EX-07 : export puis import restituent la ferme à l'identique, y compris les éléments supprimés
ok 3 - [T08] EX-07 : export puis import restituent la ferme à l'identique, y compris les éléments supprimés
  ---
  duration_ms: 8.039331
  type: 'test'
  ...
# Subtest: [T08] le fichier exporté porte l'application, un numéro de version et sa date
ok 4 - [T08] le fichier exporté porte l'application, un numéro de version et sa date
  ---
  duration_ms: 0.712807
  type: 'test'
  ...
# Subtest: [T08] l'import remplace toute la ferme actuelle
ok 5 - [T08] l'import remplace toute la ferme actuelle
  ---
  duration_ms: 0.502278
  type: 'test'
  ...
# Subtest: [T08] un fichier qui n'est pas un export plantoeuf, ou d'une version plus récente, est refusé sans rien changer
ok 6 - [T08] un fichier qui n'est pas un export plantoeuf, ou d'une version plus récente, est refusé sans rien changer
  ---
  duration_ms: 2.143234
  type: 'test'
  ...
# Subtest: [T08] EX-08 : rappel à l'ouverture quand rien n'a été exporté depuis 7 jours et que des données ont changé
ok 7 - [T08] EX-08 : rappel à l'ouverture quand rien n'a été exporté depuis 7 jours et que des données ont changé
  ---
  duration_ms: 0.320995
  type: 'test'
  ...
# Subtest: [T08] EX-08 : après un export, le rappel revient 7 jours après cet export si des données ont changé
ok 8 - [T08] EX-08 : après un export, le rappel revient 7 jours après cet export si des données ont changé
  ---
  duration_ms: 0.312319
  type: 'test'
  ...
# Subtest: [T08] EX-08 : ni une ferme vide ni une ferme tout juste importée ne déclenchent de rappel
ok 9 - [T08] EX-08 : ni une ferme vide ni une ferme tout juste importée ne déclenchent de rappel
  ---
  duration_ms: 0.378659
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 97.764484
== Tests de bout en bout (Playwright) ==

Running 4 tests using 1 worker

  ✓  1 test/export.e2e.js:17:1 › [T08] EX-07 : Exporter produit un fichier JSON que Importer restaure à l'identique, y compris les supprimés (894ms)
  ✓  2 test/export.e2e.js:43:1 › [T08] l'import remplace la ferme ouverte après confirmation (648ms)
  ✓  3 test/export.e2e.js:55:1 › [T08] un fichier illisible est refusé avec un message, et la ferme reste intacte (209ms)
  ✓  4 test/export.e2e.js:68:1 › [T08] EX-08 : le rappel d'export s'affiche à l'ouverture après 7 jours de modifications non exportées (372ms)

  4 passed (2.8s)
== T08 : vérification verte ==
```

## 13/10/2026 · T09 — Ferme d'exemple (La Réunion)

- Session 9 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T09` → exit 0 (4 tests unitaires, 3 de bout en bout) ; `./verify.sh N1` → exit 0 (48 tests unitaires, 25 de bout en bout).
- Fichiers : `src/exemple.js`, `src/index.html`, `src/i18n.js`, `test/exemple.e2e.js`, et hors liste `fichiers` : `src/store.js` (deux méthodes pour retenir les identifiants de l'exemple), `test/exemple.test.js` (contrôle de la ferme d'exemple sans navigateur).
- Rouge d'abord : `test/exemple.test.js` rouge (`Cannot find module '../src/exemple.js'`), 3 tests de bout en bout rouges (proposition absente).
- Ferme d'exemple : 5 espaces (4 planches de 30 m², un tunnel de 60 m²), 7 cultures, 7 variétés dont 2 qui surchargent leur culture, 10 plantations d'avril à octobre, sans sur-occupation ; tableau de mai à septembre.
- Commit : « T09 — Ferme d'exemple de La Réunion, effaçable d'un geste ».

Preuve (`./verify.sh T09`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 59755 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 66.424304
  type: 'test'
  ...
# Subtest: [T09] la ferme d'exemple compte 10 plantations, toutes calculables, sans sur-occupation
ok 2 - [T09] la ferme d'exemple compte 10 plantations, toutes calculables, sans sur-occupation
  ---
  duration_ms: 19.853971
  type: 'test'
  ...
# Subtest: [T09] la ferme d'exemple montre une variété qui surcharge sa culture
ok 3 - [T09] la ferme d'exemple montre une variété qui surcharge sa culture
  ---
  duration_ms: 1.031152
  type: 'test'
  ...
# Subtest: [T09] effacer l'exemple supprime logiquement ce qu'il a créé, et seulement cela
ok 4 - [T09] effacer l'exemple supprime logiquement ce qu'il a créé, et seulement cela
  ---
  duration_ms: 2.907031
  type: 'test'
  ...
# Subtest: [T09] l'exemple chargé est reconnu après réouverture, et oublié après un import
ok 5 - [T09] l'exemple chargé est reconnu après réouverture, et oublié après un import
  ---
  duration_ms: 1.232628
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 64.646151
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 78.129503
  type: 'test'
  ...
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 153.985341
== Tests de bout en bout (Playwright) ==

Running 3 tests using 1 worker

  ✓  1 test/exemple.e2e.js:6:1 › [T09] à la première ouverture, la ferme d'exemple est proposée et se charge d'un clic : 10 plantations et le tableau (277ms)
  ✓  2 test/exemple.e2e.js:19:1 › [T09] la ferme d'exemple s'efface d'un geste, sans toucher à ce que l'utilisateur a ajouté (344ms)
  ✓  3 test/exemple.e2e.js:37:1 › [T09] une ferme commencée ne propose plus l'exemple, même après réouverture ; une ferme vidée le propose de nouveau (343ms)

  3 passed (1.6s)
== T09 : vérification verte ==
```

## 13/10/2026 · T10 — Vérification de bout en bout de la tranche et évaluation

- Session 10 du seuil d'alerte.
- Modèle : Opus 5.5, effort élevé, pour le test de parcours et la vérification ; **Fable** (contexte frais, autre modèle que le générateur) pour l'évaluation de la tranche, rôle que `features.json` attribue à `fable` pour T10. Reprises : 0.
- Verdict de l'évaluateur : **CONFORME**, aucun écart. EX-01 à EX-10, S1 à S3, les cinq invariants et les limites sont conformes. Seule exigence non vérifiable ici : « Fonctionne dans Firefox et Chrome récents » (seul Chromium est disponible dans le conteneur). Remarques non bloquantes : la commande `node --test test/` d'`AGENTS.md` et de `package.json` reste à corriger ; après effacement de l'exemple, une ferme vide propose de nouveau l'exemple, ce qui est cohérent avec EX-10.
- Résultat : **vert**. `./verify.sh N1` → exit 0 (48 tests unitaires, 26 de bout en bout).
- Fichiers : `test/tranche.e2e.js` (parcours décrit par la spec : ferme d'exemple, plantation modifiée, tableau recalculé, export puis réimport dans un autre navigateur, réexport identique). Test **vert dès l'écriture** : il assemble des fonctions déjà livrées et testées une à une.
- Commits : « T10 — Test de parcours de bout en bout de la tranche N1 » (poussé pendant l'évaluation), puis « T10 — Tranche N1 vérifiée et évaluée conforme ».

Preuve (`./verify.sh N1`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 59755 octets
== Tests unitaires (node --test) ==
TAP version 13
# Subtest: [T04] les dates se calculent au jour près, y compris d'une année sur l'autre
ok 1 - [T04] les dates se calculent au jour près, y compris d'une année sur l'autre
  ---
  duration_ms: 2.310555
  type: 'test'
  ...
# Subtest: [T04] EX-02 : une variété sans surcharge reprend les durées de la culture
ok 2 - [T04] EX-02 : une variété sans surcharge reprend les durées de la culture
  ---
  duration_ms: 1.087316
  type: 'test'
  ...
# Subtest: [T04] EX-02 : les durées surchargées par la variété priment sur celles de la culture
ok 3 - [T04] EX-02 : les durées surchargées par la variété priment sur celles de la culture
  ---
  duration_ms: 0.18375
  type: 'test'
  ...
# Subtest: [T04] EX-03 : production = surface × rendement × (1 − pertes), en fourchette
ok 4 - [T04] EX-03 : production = surface × rendement × (1 − pertes), en fourchette
  ---
  duration_ms: 0.174074
  type: 'test'
  ...
# Subtest: [T04] S1 : 33,75 kg par semaine du 30 avril au 24 juin
ok 5 - [T04] S1 : 33,75 kg par semaine du 30 avril au 24 juin
  ---
  duration_ms: 0.897583
  type: 'test'
  ...
# Subtest: [T04] S1 : 0 kg les autres semaines (production_nulle_hors_fenetre)
ok 6 - [T04] S1 : 0 kg les autres semaines (production_nulle_hors_fenetre)
  ---
  duration_ms: 0.308982
  type: 'test'
  ...
# Subtest: [T04] EX-03 : la répartition est uniforme, à la semaine, et rend toute la production sur la fenêtre
ok 7 - [T04] EX-03 : la répartition est uniforme, à la semaine, et rend toute la production sur la fenêtre
  ---
  duration_ms: 0.410455
  type: 'test'
  ...
# Subtest: [T04] granularité à la semaine : une semaine compte entière dans la période qui contient la plupart de ses jours
ok 8 - [T04] granularité à la semaine : une semaine compte entière dans la période qui contient la plupart de ses jours
  ---
  duration_ms: 0.373043
  type: 'test'
  ...
# Subtest: [T05] S2 : en mai, le CA de la courgette est une fourchette dont la médiane vaut le volume de mai × 2,50 €
ok 9 - [T05] S2 : en mai, le CA de la courgette est une fourchette dont la médiane vaut le volume de mai × 2,50 €
  ---
  duration_ms: 0.839229
  type: 'test'
  ...
# Subtest: [T05] EX-04 : par culture et par mois, volume, CA et marge en fourchette ; marge égale au CA en N1
ok 10 - [T05] EX-04 : par culture et par mois, volume, CA et marge en fourchette ; marge égale au CA en N1
  ---
  duration_ms: 0.513903
  type: 'test'
  ...
# Subtest: [T05] le CA se calcule plantation par plantation, au prix de sa variété
ok 11 - [T05] le CA se calcule plantation par plantation, au prix de sa variété
  ---
  duration_ms: 0.331055
  type: 'test'
  ...
# Subtest: [T05] une ligne par culture, rangée par nom, et le total de la ferme par mois
ok 12 - [T05] une ligne par culture, rangée par nom, et le total de la ferme par mois
  ---
  duration_ms: 5.859666
  type: 'test'
  ...
# Subtest: [T05] les plantations supprimées, ou dont la variété ou la culture est supprimée, ne comptent pas
ok 13 - [T05] les plantations supprimées, ou dont la variété ou la culture est supprimée, ne comptent pas
  ---
  duration_ms: 0.355221
  type: 'test'
  ...
# Subtest: [T05] une ferme sans plantation donne un tableau vide
ok 14 - [T05] une ferme sans plantation donne un tableau vide
  ---
  duration_ms: 0.168234
  type: 'test'
  ...
# Subtest: [T05] une ferme de 200 plantations se calcule en moins d'une seconde
ok 15 - [T05] une ferme de 200 plantations se calcule en moins d'une seconde
  ---
  duration_ms: 13.138243
  type: 'test'
  ...
# Subtest: [T07] S3 : deux plantations de 20 m² qui se chevauchent en juin sur 30 m² signalent juin
ok 16 - [T07] S3 : deux plantations de 20 m² qui se chevauchent en juin sur 30 m² signalent juin
  ---
  duration_ms: 0.534149
  type: 'test'
  ...
# Subtest: [T07] une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte
ok 17 - [T07] une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte
  ---
  duration_ms: 0.32824
  type: 'test'
  ...
# Subtest: [T07] occuper exactement la surface de l'espace n'est pas une sur-occupation
ok 18 - [T07] occuper exactement la surface de l'espace n'est pas une sur-occupation
  ---
  duration_ms: 0.155074
  type: 'test'
  ...
# Subtest: [T07] chaque période garde la surface occupée, et chaque mois la plus grande
ok 19 - [T07] chaque période garde la surface occupée, et chaque mois la plus grande
  ---
  duration_ms: 0.193191
  type: 'test'
  ...
# Subtest: [T07] une sur-occupation sur deux mois les signale tous les deux ; les espaces sont indépendants
ok 20 - [T07] une sur-occupation sur deux mois les signale tous les deux ; les espaces sont indépendants
  ---
  duration_ms: 0.723071
  type: 'test'
  ...
# Subtest: [T07] les plantations supprimées, ou dont la variété est supprimée, n'occupent rien
ok 21 - [T07] les plantations supprimées, ou dont la variété est supprimée, n'occupent rien
  ---
  duration_ms: 0.229025
  type: 'test'
  ...
# Subtest: [T09] la ferme d'exemple compte 10 plantations, toutes calculables, sans sur-occupation
ok 22 - [T09] la ferme d'exemple compte 10 plantations, toutes calculables, sans sur-occupation
  ---
  duration_ms: 19.166495
  type: 'test'
  ...
# Subtest: [T09] la ferme d'exemple montre une variété qui surcharge sa culture
ok 23 - [T09] la ferme d'exemple montre une variété qui surcharge sa culture
  ---
  duration_ms: 0.965883
  type: 'test'
  ...
# Subtest: [T09] effacer l'exemple supprime logiquement ce qu'il a créé, et seulement cela
ok 24 - [T09] effacer l'exemple supprime logiquement ce qu'il a créé, et seulement cela
  ---
  duration_ms: 2.69702
  type: 'test'
  ...
# Subtest: [T09] l'exemple chargé est reconnu après réouverture, et oublié après un import
ok 25 - [T09] l'exemple chargé est reconnu après réouverture, et oublié après un import
  ---
  duration_ms: 1.194627
  type: 'test'
  ...
# Subtest: [T01] un stockage vide donne une ferme sans espace
ok 26 - [T01] un stockage vide donne une ferme sans espace
  ---
  duration_ms: 2.680133
  type: 'test'
  ...
# Subtest: [T01] un espace enregistré est retrouvé après réouverture
ok 27 - [T01] un espace enregistré est retrouvé après réouverture
  ---
  duration_ms: 5.941987
  type: 'test'
  ...
# Subtest: [T01] calc.js se charge sans navigateur et n'accède pas au DOM
ok 28 - [T01] calc.js se charge sans navigateur et n'accède pas au DOM
  ---
  duration_ms: 1.902442
  type: 'test'
  ...
# Subtest: [T02] un enregistrement reçoit un UUID, ses dates de création et de modification, et supprimeLe nul
ok 29 - [T02] un enregistrement reçoit un UUID, ses dates de création et de modification, et supprimeLe nul
  ---
  duration_ms: 5.306781
  type: 'test'
  ...
# Subtest: [T02] chaque enregistrement a un identifiant distinct
ok 30 - [T02] chaque enregistrement a un identifiant distinct
  ---
  duration_ms: 1.143508
  type: 'test'
  ...
# Subtest: [T02] les quatre objets du noyau sont enregistrés et retrouvés après réouverture
ok 31 - [T02] les quatre objets du noyau sont enregistrés et retrouvés après réouverture
  ---
  duration_ms: 2.278205
  type: 'test'
  ...
# Subtest: [T02] un objet absent du modèle est refusé
ok 32 - [T02] un objet absent du modèle est refusé
  ---
  duration_ms: 0.413787
  type: 'test'
  ...
# Subtest: [T02] modifier change les champs et la date de modification, pas la date de création
ok 33 - [T02] modifier change les champs et la date de modification, pas la date de création
  ---
  duration_ms: 0.223345
  type: 'test'
  ...
# Subtest: [T02] l'identifiant et les dates ne se changent pas par la saisie
ok 34 - [T02] l'identifiant et les dates ne se changent pas par la saisie
  ---
  duration_ms: 0.357641
  type: 'test'
  ...
# Subtest: [T02] suppression_logique_seulement : supprimer date l'enregistrement sans l'effacer
ok 35 - [T02] suppression_logique_seulement : supprimer date l'enregistrement sans l'effacer
  ---
  duration_ms: 0.431216
  type: 'test'
  ...
# Subtest: [T02] supprimer à nouveau garde la première date de suppression
ok 36 - [T02] supprimer à nouveau garde la première date de suppression
  ---
  duration_ms: 0.246997
  type: 'test'
  ...
# Subtest: [T02] un enregistrement rendu par le store ne change pas les données enregistrées
ok 37 - [T02] un enregistrement rendu par le store ne change pas les données enregistrées
  ---
  duration_ms: 0.449045
  type: 'test'
  ...
# Subtest: [T02] un seul nombre remplit les trois valeurs de la fourchette
ok 38 - [T02] un seul nombre remplit les trois valeurs de la fourchette
  ---
  duration_ms: 0.263028
  type: 'test'
  ...
# Subtest: [T02] fourchette_ordonnee : basse ≤ médiane ≤ haute, sinon refus
ok 39 - [T02] fourchette_ordonnee : basse ≤ médiane ≤ haute, sinon refus
  ---
  duration_ms: 0.173398
  type: 'test'
  ...
# Subtest: [T02] fourchette_ordonnee : le store refuse d'enregistrer une fourchette désordonnée
ok 40 - [T02] fourchette_ordonnee : le store refuse d'enregistrer une fourchette désordonnée
  ---
  duration_ms: 0.285634
  type: 'test'
  ...
# Subtest: [T02] la saisie d'une fourchette accepte un nombre ou trois, avec la virgule décimale
ok 41 - [T02] la saisie d'une fourchette accepte un nombre ou trois, avec la virgule décimale
  ---
  duration_ms: 0.391266
  type: 'test'
  ...
# Subtest: [T08] EX-07 : export puis import restituent la ferme à l'identique, y compris les éléments supprimés
ok 42 - [T08] EX-07 : export puis import restituent la ferme à l'identique, y compris les éléments supprimés
  ---
  duration_ms: 0.699536
  type: 'test'
  ...
# Subtest: [T08] le fichier exporté porte l'application, un numéro de version et sa date
ok 43 - [T08] le fichier exporté porte l'application, un numéro de version et sa date
  ---
  duration_ms: 0.233434
  type: 'test'
  ...
# Subtest: [T08] l'import remplace toute la ferme actuelle
ok 44 - [T08] l'import remplace toute la ferme actuelle
  ---
  duration_ms: 0.218232
  type: 'test'
  ...
# Subtest: [T08] un fichier qui n'est pas un export plantoeuf, ou d'une version plus récente, est refusé sans rien changer
ok 45 - [T08] un fichier qui n'est pas un export plantoeuf, ou d'une version plus récente, est refusé sans rien changer
  ---
  duration_ms: 0.445419
  type: 'test'
  ...
# Subtest: [T08] EX-08 : rappel à l'ouverture quand rien n'a été exporté depuis 7 jours et que des données ont changé
ok 46 - [T08] EX-08 : rappel à l'ouverture quand rien n'a été exporté depuis 7 jours et que des données ont changé
  ---
  duration_ms: 0.141505
  type: 'test'
  ...
# Subtest: [T08] EX-08 : après un export, le rappel revient 7 jours après cet export si des données ont changé
ok 47 - [T08] EX-08 : après un export, le rappel revient 7 jours après cet export si des données ont changé
  ---
  duration_ms: 0.088808
  type: 'test'
  ...
# Subtest: [T08] EX-08 : ni une ferme vide ni une ferme tout juste importée ne déclenchent de rappel
ok 48 - [T08] EX-08 : ni une ferme vide ni une ferme tout juste importée ne déclenchent de rappel
  ---
  duration_ms: 0.255709
  type: 'test'
  ...
1..48
# tests 48
# suites 0
# pass 48
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 187.046168
== Tests de bout en bout (Playwright) ==

Running 26 tests using 2 workers

  ✓   2 test/exemple.e2e.js:6:1 › [T09] à la première ouverture, la ferme d'exemple est proposée et se charge d'un clic : 10 plantations et le tableau (305ms)
  ✓   3 test/exemple.e2e.js:19:1 › [T09] la ferme d'exemple s'efface d'un geste, sans toucher à ce que l'utilisateur a ajouté (410ms)
  ✓   1 test/espaces.e2e.js:18:1 › [T07] S3 : « planche 4 » porte un signal de sur-occupation pour juin, et les deux plantations restent enregistrées (977ms)
  ✓   4 test/exemple.e2e.js:37:1 › [T09] une ferme commencée ne propose plus l'exemple, même après réouverture ; une ferme vidée le propose de nouveau (429ms)
  ✓   5 test/espaces.e2e.js:33:1 › [T07] le signal disparaît dès que la sur-occupation est corrigée (923ms)
  ✓   7 test/modele.e2e.js:6:1 › [T02] dans le fichier ouvert, un espace enregistré porte un UUID, ses dates et supprimeLe nul (218ms)
  ✓   6 test/export.e2e.js:17:1 › [T08] EX-07 : Exporter produit un fichier JSON que Importer restaure à l'identique, y compris les supprimés (999ms)
  ✓   8 test/recolte.e2e.js:9:1 › [T04] une plantation saisie affiche ses dates de première et de dernière récolte (563ms)
  ✓   9 test/export.e2e.js:43:1 › [T08] l'import remplace la ferme ouverte après confirmation (744ms)
  ✓  11 test/export.e2e.js:55:1 › [T08] un fichier illisible est refusé avec un message, et la ferme reste intacte (264ms)
  ✓  10 test/saisie.e2e.js:73:1 › [T03] espaces, cultures, variétés et plantations sont saisis, listés et retrouvés après réouverture (789ms)
  ✓  12 test/export.e2e.js:68:1 › [T08] EX-08 : le rappel d'export s'affiche à l'ouverture après 7 jours de modifications non exportées (457ms)
  ✓  13 test/saisie.e2e.js:94:1 › [T03] une variété ne garde que les champs numériques surchargés, les autres viennent de la culture (550ms)
  ✓  14 test/squelette.e2e.js:4:1 › [T01] un espace créé est retrouvé après fermeture et réouverture du fichier (359ms)
  ✓  16 test/squelette.e2e.js:19:1 › [T01] le fichier assemblé ne charge aucune autre ressource (153ms)
  ✓  17 test/tableau.e2e.js:5:1 › [T05] S2 : en mai, la ligne courgette donne un CA en fourchette dont la médiane vaut le volume de mai × 2,50 € (579ms)
  ✓  15 test/saisie.e2e.js:110:1 › [T03] une modification est enregistrée et retrouvée après réouverture (1.1s)
  ✓  18 test/tableau.e2e.js:19:1 › [T05] EX-04 : le tableau donne pour chaque mois le volume, le chiffre d'affaires et la marge (663ms)
  ✓  19 test/saisie.e2e.js:142:1 › [T03] une suppression retire l'élément des listes, même après réouverture, sans l'effacer du stockage (834ms)
  ✓  20 test/tableau.e2e.js:34:1 › [T05] EX-09 : les en-têtes signalent des estimations en fourchette basse / médiane / haute (652ms)
  ✓  21 test/saisie.e2e.js:165:1 › [T03] une fourchette désordonnée est refusée avec un message, sans rien enregistrer (301ms)
  ✓  22 test/tableau.e2e.js:45:1 › [T05] sans plantation, le tableau annonce qu'aucune récolte n'est prévue (183ms)
  ✓  23 test/tranche.e2e.js:22:1 › [T10] parcours de la tranche : ferme d'exemple, plantation modifiée, tableau recalculé, export puis réimport à l'identique (747ms)
  ✓  24 test/tableau.e2e.js:59:1 › [T06] modifier la surface d'une plantation recalcule le tableau sans autre action (699ms)
  ✓  25 test/tableau.e2e.js:71:1 › [T06] changer un prix, ajouter ou supprimer une plantation recalcule le tableau (780ms)
  ✓  26 test/tableau.e2e.js:89:1 › [T06] une modification faite dans un autre onglet recalcule le tableau ouvert, sans l'écraser ensuite (867ms)

  26 passed (9.6s)
== N1 : vérification verte ==
```

## 13/10/2026 · Sécurisation de N1 et pull request

- Demande de l'humain : un commit par tâche de T02 à T09, `passe` à `true`, relectures Fable de T02, T04, T05 et T08, T10, bilan de fin de tranche, pull request vers `main`. Tout cela était déjà fait et poussé : un commit par tâche de T01 à T09 ; T10 en deux commits (le test de parcours, poussé pendant l'évaluation, puis la clôture après le verdict) ; relectures et bilan consignés ci-dessus et dans le runbook de N1.
- `main` contenait déjà T01, fusionné par la PR #1. Les commits T02 à T10 ont été rejoués au-dessus de `main` (contenu identique : diff vide avec l'état d'avant ; `./verify.sh N1` → exit 0, 48 tests unitaires et 26 de bout en bout), puis poussés.
- Pull request #2 ouverte de la branche `n1` vers `main` : https://github.com/GDS-42/plantoeuf/pull/2. La suite du travail continue sur la branche de développement.

---

# Tranche P1 — Présentation

Ordre retenu pour la suite, choisi par l'agent comme le plus sûr : **P1** (présentation : réorganiser le rendu sous la protection des tests de N1 avant d'y ajouter quoi que ce soit), puis **N2** (points de vente et séances, comme le prévoit le BRIEF), puis **S3** (atelier poules, dont les œufs passent par les points de vente). Chaque tranche a sa spec, son runbook et son seuil dans `docs/specs/<tranche>/`.

## 13/10/2026 · T11 — Rendu découpé en modules

- Session 1 / 9 du seuil d'alerte de P1.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable, contexte frais → **CONFORME**. Il a comparé l'ancien et le nouveau rendu sur cinq états (page vierge, ferme d'exemple, modification en cours, plantation modifiée, cas construit) : HTML affiché, listes déroulantes et titre identiques, aucune erreur de console. Seul écart relevé, sans effet visible : les plantations passent à `Calc` dans l'ordre du stockage et non plus triées, ce qui peut changer le dernier bit d'une somme flottante (au plus 8 × 10⁻¹⁶ en relatif dans un cas construit).
- Résultat : **vert**. `./verify.sh T11` → exit 0 ; `./verify.sh N1` → exit 0 (48 tests unitaires, 27 de bout en bout : les 26 de N1, inchangés, et `[T11]`).
- Fichiers : `src/index.html` (le script inline devient un démarrage de 60 lignes), `src/ui-commun.js`, `src/ui-saisie.js`, `src/ui-tableau.js`, `src/ui-sauvegarde.js`, `verify.sh` (tranches P et S reconnues), `AGENTS.md` (règle de rendu, comme prévu par la spec), `test/presentation.e2e.js`.
- Rouge d'abord : `[T11]` rouge (modules absents : `undefined` au lieu de `object`) ; `./verify.sh P1` → « identifiant inconnu : P1 ».
- Commit : « T11 — Rendu découpé en modules ui-*.js, sans changement de comportement ».

Preuve (`./verify.sh T11`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 62450 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 80.946486
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 71.635836
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 62.317961
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 87.776812
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 167.786088
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/presentation.e2e.js:14:1 › [T11] le rendu est découpé en modules, et l'outil s'utilise sans aucune erreur (422ms)

  1 passed (1.0s)
== T11 : vérification verte ==
```

## 13/10/2026 · T12 — Deux volets : la saisie à gauche, le tableau toujours visible à droite

- Session 2 / 9 du seuil d'alerte de P1.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable, contexte frais → **CONFORME**. Ses mesures : volets côte à côte à 1280, 1366 et 1920 px ; aucun débordement horizontal de la page de 1100 à 1920 px ; aucune police téléchargée. Remarques hors verdict : la colonne Total figée à droite anticipe T14 ; la légende du tableau, coupée à droite parce qu'elle défile avec lui, est reprise en T14.
- Résultat : **vert**. `./verify.sh T12` → exit 0 (5 tests) ; `./verify.sh P1` → exit 0 (48 tests unitaires, 32 de bout en bout dont les 26 de N1 inchangés).
- Fichiers : `src/index.html` (mise en page et styles : couleurs en variables, polices du système), `src/i18n.js` (marque, sous-titre), `test/presentation.e2e.js`.
- Rouge d'abord : les trois scénarios P1-S1 rouges (le tableau sortait de la fenêtre au défilement des panneaux). Deux garde-fous verts dès l'écriture : la page de N1 ne débordait pas horizontalement et mettait déjà le tableau en premier. Après la mise en page, P1-S1 restait rouge à 1280 et 1366 px : la case Total de la courgette sortait de la boîte du tableau ; la colonne Total est désormais figée au bord droit.
- Commit : « T12 — Deux volets : saisie à gauche, tableau toujours visible à droite ».

Preuve (`./verify.sh T12`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 66068 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 76.155085
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 72.5293
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 74.323985
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 90.88182
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 180.495645
== Tests de bout en bout (Playwright) ==

Running 5 tests using 1 worker

  ✓  1 test/presentation.e2e.js:43:3 › [T12] P1-S1 à 1280 × 720 : le tableau reste visible pendant le défilement des panneaux de saisie (739ms)
  ✓  2 test/presentation.e2e.js:43:3 › [T12] P1-S1 à 1366 × 768 : le tableau reste visible pendant le défilement des panneaux de saisie (645ms)
  ✓  3 test/presentation.e2e.js:43:3 › [T12] P1-S1 à 1920 × 1080 : le tableau reste visible pendant le défilement des panneaux de saisie (663ms)
  ✓  4 test/presentation.e2e.js:68:1 › [T12] EX-16 : aucun défilement horizontal de la page de 1280 à 1920 px de large, ferme d'exemple chargée (552ms)
  ✓  5 test/presentation.e2e.js:78:1 › [T12] sous 1100 px de large, une seule colonne, la projection en premier (237ms)

  5 passed (3.6s)
== T12 : vérification verte ==
```

## 13/10/2026 · T13 — Panneaux de saisie titrés, mode modification signalé

- Session 3 / 9 du seuil d'alerte de P1.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T13` → exit 0 (5 tests) ; `./verify.sh P1` → exit 0 (48 tests unitaires, 37 de bout en bout dont les 26 de N1 inchangés).
- Fichiers : `src/index.html` (panneaux, barre de raccourcis dans le volet de saisie, boutons regroupés, styles), `src/ui-saisie.js` (nombre d'éléments, mode modification), `src/ui-commun.js` (libellés pour lecteur d'écran), `src/i18n.js`, `test/presentation.e2e.js`.
- Rouge d'abord : les 5 tests `[T13]` rouges (classe `panneau`, compte, `data-mode`, `aria-current` et raccourcis absents).
- Commit : « T13 — Panneaux de saisie titrés avec leur nombre d'éléments, mode modification signalé ».

Preuve (`./verify.sh T13`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 72111 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 74.706174
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 79.561981
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 88.700226
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 67.853959
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 156.423869
== Tests de bout en bout (Playwright) ==

Running 5 tests using 1 worker

  ✓  1 test/presentation.e2e.js:89:1 › [T13] EX-12 : chaque objet a son panneau titré, avec le nombre d'éléments actifs, et tous ses champs visibles (393ms)
  ✓  2 test/presentation.e2e.js:103:1 › [T13] le nombre d'éléments d'un panneau suit les ajouts et les suppressions (247ms)
  ✓  3 test/presentation.e2e.js:115:1 › [T13] EX-15 : le panneau et l'élément modifiés sont signalés jusqu'à l'enregistrement (331ms)
  ✓  4 test/presentation.e2e.js:129:1 › [T13] EX-15 : … ou jusqu'à l'annulation (303ms)
  ✓  5 test/presentation.e2e.js:138:1 › [T13] une barre de raccourcis mène à chaque panneau de saisie (474ms)

  5 passed (2.5s)
== T13 : vérification verte ==
```

## 13/10/2026 · T14 — Tableau lisible et synthèse de la saison

- Session 4 / 9 du seuil d'alerte de P1.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T14` → exit 0 (4 tests) ; `./verify.sh P1` → exit 0 (48 tests unitaires, 41 de bout en bout dont les 26 de N1 inchangés).
- Fichiers : `src/index.html` (synthèse dans la barre du haut, légende hors du tableau, en-têtes et colonnes figés), `src/ui-tableau.js` (synthèse, cases nulles), `src/i18n.js`, `test/presentation.e2e.js`.
- Rouge d'abord : les 4 tests `[T14]` rouges (noms et mois sortis de la vue au défilement, synthèse absente, cases nulles en « 0 »).
- Scénario P1-S3 : 675 € entre 540 € et 810 € pour la ferme de S2, puis 338 € entre 270 € et 405 € à 50 m².
- Commit : « T14 — Tableau : mois et noms figés au défilement ; synthèse de la saison en tête ».

Preuve (`./verify.sh T14`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 75164 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 68.594048
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 69.782872
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 65.588461
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 61.905029
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 139.95897
== Tests de bout en bout (Playwright) ==

Running 4 tests using 1 worker

  ✓  1 test/presentation.e2e.js:151:1 › [T14] P1-S2 : les mois et les cultures restent visibles pendant le défilement du tableau (281ms)
  ✓  2 test/presentation.e2e.js:169:1 › [T14] P1-S3 : la synthèse donne le chiffre d'affaires estimé de la saison en fourchette, et suit les modifications (582ms)
  ✓  3 test/presentation.e2e.js:188:1 › [T14] la synthèse reste en tête quel que soit le défilement (249ms)
  ✓  4 test/presentation.e2e.js:196:1 › [T14] une case vide du tableau s'affiche discrètement (217ms)

  4 passed (2.0s)
== T14 : vérification verte ==
```

## 13/10/2026 · T15 — Lisibilité : tailles de texte, contrastes, focus clavier

- Session 5 / 9 du seuil d'alerte de P1.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T15` → exit 0 (3 tests) ; `./verify.sh P1` → exit 0 (48 tests unitaires, 44 de bout en bout dont les 26 de N1 inchangés).
- Fichiers : `src/index.html` (contour de focus), `test/presentation.e2e.js`.
- Rouge d'abord, en partie seulement : les deux audits de taille et de contraste (chaque texte affiché, comparé au fond réellement peint dessous, ferme vide puis ferme d'exemple avec une modification en cours, une sur-occupation et une erreur) étaient **verts dès l'écriture** : la palette posée en T12 respectait déjà 4,5:1 et 12 px. Le test du focus clavier était rouge (contour du navigateur : `auto`, 1 px).
- Commit : « T15 — Lisibilité : focus clavier visible ; audits de taille et de contraste ».

Preuve (`./verify.sh T15`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 75440 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 68.901084
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 65.241926
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 71.23742
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 60.049835
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 138.874682
== Tests de bout en bout (Playwright) ==

Running 3 tests using 1 worker

  ✓  1 test/presentation.e2e.js:260:1 › [T15] EX-16 : texte courant d'au moins 14 px, aucun texte sous 12 px ni sous un contraste de 4,5:1 — ferme vide (149ms)
  ✓  2 test/presentation.e2e.js:266:1 › [T15] EX-16 : mêmes règles avec la ferme d'exemple, une modification en cours, une sur-occupation et une erreur (510ms)
  ✓  3 test/presentation.e2e.js:283:1 › [T15] EX-16 : l'élément qui a le focus clavier porte un contour visible (309ms)

  3 passed (1.7s)
== T15 : vérification verte ==
```

## 13/10/2026 · T16 — Vérification de bout en bout de P1 et évaluation

- Session 6 / 9 du seuil d'alerte de P1.
- Modèle : Opus 5.5, effort élevé, pour la vérification et la retouche ; **Fable** (contexte frais) pour l'évaluation de la tranche. Reprises : 0.
- Verdict de l'évaluateur : **CONFORME**, aucun écart. EX-11 à EX-16, P1-S1 à P1-S3, les invariants (`tests_n1_inchanges` vérifié par diff de `test/` : aucun fichier de N1 touché), les contraintes héritées et les limites sont conformes. Rafraîchissement complet de la ferme d'exemple mesuré entre 8 et 19 ms. Non vérifiable ici : Firefox. EX-17 revient à l'humain. Remarque hors périmètre : sous 1100 px, la barre du haut (et la synthèse) défile avec la page.
- Retouche trouvée en relisant les captures : à 1920 px, le tableau n'occupait que 982 px de sa boîte de 1397 px. Test `[T16]` rouge, puis vert avec `min-width: 100%`.
- Résultat : **vert**. `./verify.sh P1` → exit 0 (48 tests unitaires, 45 de bout en bout : 26 de N1 inchangés, 19 de P1).
- Fichiers : `src/index.html`, `test/presentation.e2e.js`.
- Commit : « T16 — Tranche P1 vérifiée et évaluée conforme ; le tableau occupe toute sa boîte ».

Preuve (`./verify.sh P1`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 75457 octets
== Tests unitaires (node --test) ==
TAP version 13
# Subtest: [T04] les dates se calculent au jour près, y compris d'une année sur l'autre
ok 1 - [T04] les dates se calculent au jour près, y compris d'une année sur l'autre
  ---
  duration_ms: 2.51333
  type: 'test'
  ...
# Subtest: [T04] EX-02 : une variété sans surcharge reprend les durées de la culture
ok 2 - [T04] EX-02 : une variété sans surcharge reprend les durées de la culture
  ---
  duration_ms: 1.386338
  type: 'test'
  ...
# Subtest: [T04] EX-02 : les durées surchargées par la variété priment sur celles de la culture
ok 3 - [T04] EX-02 : les durées surchargées par la variété priment sur celles de la culture
  ---
  duration_ms: 0.314917
  type: 'test'
  ...
# Subtest: [T04] EX-03 : production = surface × rendement × (1 − pertes), en fourchette
ok 4 - [T04] EX-03 : production = surface × rendement × (1 − pertes), en fourchette
  ---
  duration_ms: 0.245656
  type: 'test'
  ...
# Subtest: [T04] S1 : 33,75 kg par semaine du 30 avril au 24 juin
ok 5 - [T04] S1 : 33,75 kg par semaine du 30 avril au 24 juin
  ---
  duration_ms: 1.177449
  type: 'test'
  ...
# Subtest: [T04] S1 : 0 kg les autres semaines (production_nulle_hors_fenetre)
ok 6 - [T04] S1 : 0 kg les autres semaines (production_nulle_hors_fenetre)
  ---
  duration_ms: 0.42752
  type: 'test'
  ...
# Subtest: [T04] EX-03 : la répartition est uniforme, à la semaine, et rend toute la production sur la fenêtre
ok 7 - [T04] EX-03 : la répartition est uniforme, à la semaine, et rend toute la production sur la fenêtre
  ---
  duration_ms: 1.584268
  type: 'test'
  ...
# Subtest: [T04] granularité à la semaine : une semaine compte entière dans la période qui contient la plupart de ses jours
ok 8 - [T04] granularité à la semaine : une semaine compte entière dans la période qui contient la plupart de ses jours
  ---
  duration_ms: 0.406869
  type: 'test'
  ...
# Subtest: [T05] S2 : en mai, le CA de la courgette est une fourchette dont la médiane vaut le volume de mai × 2,50 €
ok 9 - [T05] S2 : en mai, le CA de la courgette est une fourchette dont la médiane vaut le volume de mai × 2,50 €
  ---
  duration_ms: 1.096716
  type: 'test'
  ...
# Subtest: [T05] EX-04 : par culture et par mois, volume, CA et marge en fourchette ; marge égale au CA en N1
ok 10 - [T05] EX-04 : par culture et par mois, volume, CA et marge en fourchette ; marge égale au CA en N1
  ---
  duration_ms: 0.785027
  type: 'test'
  ...
# Subtest: [T05] le CA se calcule plantation par plantation, au prix de sa variété
ok 11 - [T05] le CA se calcule plantation par plantation, au prix de sa variété
  ---
  duration_ms: 0.423474
  type: 'test'
  ...
# Subtest: [T05] une ligne par culture, rangée par nom, et le total de la ferme par mois
ok 12 - [T05] une ligne par culture, rangée par nom, et le total de la ferme par mois
  ---
  duration_ms: 6.905286
  type: 'test'
  ...
# Subtest: [T05] les plantations supprimées, ou dont la variété ou la culture est supprimée, ne comptent pas
ok 13 - [T05] les plantations supprimées, ou dont la variété ou la culture est supprimée, ne comptent pas
  ---
  duration_ms: 0.493794
  type: 'test'
  ...
# Subtest: [T05] une ferme sans plantation donne un tableau vide
ok 14 - [T05] une ferme sans plantation donne un tableau vide
  ---
  duration_ms: 0.120374
  type: 'test'
  ...
# Subtest: [T05] une ferme de 200 plantations se calcule en moins d'une seconde
ok 15 - [T05] une ferme de 200 plantations se calcule en moins d'une seconde
  ---
  duration_ms: 21.186908
  type: 'test'
  ...
# Subtest: [T07] S3 : deux plantations de 20 m² qui se chevauchent en juin sur 30 m² signalent juin
ok 16 - [T07] S3 : deux plantations de 20 m² qui se chevauchent en juin sur 30 m² signalent juin
  ---
  duration_ms: 0.817159
  type: 'test'
  ...
# Subtest: [T07] une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte
ok 17 - [T07] une plantation occupe son espace du semis ou de la plantation à la fin de sa récolte
  ---
  duration_ms: 0.513971
  type: 'test'
  ...
# Subtest: [T07] occuper exactement la surface de l'espace n'est pas une sur-occupation
ok 18 - [T07] occuper exactement la surface de l'espace n'est pas une sur-occupation
  ---
  duration_ms: 0.308257
  type: 'test'
  ...
# Subtest: [T07] chaque période garde la surface occupée, et chaque mois la plus grande
ok 19 - [T07] chaque période garde la surface occupée, et chaque mois la plus grande
  ---
  duration_ms: 0.323019
  type: 'test'
  ...
# Subtest: [T07] une sur-occupation sur deux mois les signale tous les deux ; les espaces sont indépendants
ok 20 - [T07] une sur-occupation sur deux mois les signale tous les deux ; les espaces sont indépendants
  ---
  duration_ms: 0.510169
  type: 'test'
  ...
# Subtest: [T07] les plantations supprimées, ou dont la variété est supprimée, n'occupent rien
ok 21 - [T07] les plantations supprimées, ou dont la variété est supprimée, n'occupent rien
  ---
  duration_ms: 0.297584
  type: 'test'
  ...
# Subtest: [T09] la ferme d'exemple compte 10 plantations, toutes calculables, sans sur-occupation
ok 22 - [T09] la ferme d'exemple compte 10 plantations, toutes calculables, sans sur-occupation
  ---
  duration_ms: 20.180331
  type: 'test'
  ...
# Subtest: [T09] la ferme d'exemple montre une variété qui surcharge sa culture
ok 23 - [T09] la ferme d'exemple montre une variété qui surcharge sa culture
  ---
  duration_ms: 1.419359
  type: 'test'
  ...
# Subtest: [T09] effacer l'exemple supprime logiquement ce qu'il a créé, et seulement cela
ok 24 - [T09] effacer l'exemple supprime logiquement ce qu'il a créé, et seulement cela
  ---
  duration_ms: 3.317067
  type: 'test'
  ...
# Subtest: [T09] l'exemple chargé est reconnu après réouverture, et oublié après un import
ok 25 - [T09] l'exemple chargé est reconnu après réouverture, et oublié après un import
  ---
  duration_ms: 1.499807
  type: 'test'
  ...
# Subtest: [T01] un stockage vide donne une ferme sans espace
ok 26 - [T01] un stockage vide donne une ferme sans espace
  ---
  duration_ms: 3.002239
  type: 'test'
  ...
# Subtest: [T01] un espace enregistré est retrouvé après réouverture
ok 27 - [T01] un espace enregistré est retrouvé après réouverture
  ---
  duration_ms: 6.376605
  type: 'test'
  ...
# Subtest: [T01] calc.js se charge sans navigateur et n'accède pas au DOM
ok 28 - [T01] calc.js se charge sans navigateur et n'accède pas au DOM
  ---
  duration_ms: 1.803843
  type: 'test'
  ...
# Subtest: [T02] un enregistrement reçoit un UUID, ses dates de création et de modification, et supprimeLe nul
ok 29 - [T02] un enregistrement reçoit un UUID, ses dates de création et de modification, et supprimeLe nul
  ---
  duration_ms: 6.173204
  type: 'test'
  ...
# Subtest: [T02] chaque enregistrement a un identifiant distinct
ok 30 - [T02] chaque enregistrement a un identifiant distinct
  ---
  duration_ms: 2.28933
  type: 'test'
  ...
# Subtest: [T02] les quatre objets du noyau sont enregistrés et retrouvés après réouverture
ok 31 - [T02] les quatre objets du noyau sont enregistrés et retrouvés après réouverture
  ---
  duration_ms: 1.809937
  type: 'test'
  ...
# Subtest: [T02] un objet absent du modèle est refusé
ok 32 - [T02] un objet absent du modèle est refusé
  ---
  duration_ms: 0.52508
  type: 'test'
  ...
# Subtest: [T02] modifier change les champs et la date de modification, pas la date de création
ok 33 - [T02] modifier change les champs et la date de modification, pas la date de création
  ---
  duration_ms: 0.282319
  type: 'test'
  ...
# Subtest: [T02] l'identifiant et les dates ne se changent pas par la saisie
ok 34 - [T02] l'identifiant et les dates ne se changent pas par la saisie
  ---
  duration_ms: 0.327954
  type: 'test'
  ...
# Subtest: [T02] suppression_logique_seulement : supprimer date l'enregistrement sans l'effacer
ok 35 - [T02] suppression_logique_seulement : supprimer date l'enregistrement sans l'effacer
  ---
  duration_ms: 0.323159
  type: 'test'
  ...
# Subtest: [T02] supprimer à nouveau garde la première date de suppression
ok 36 - [T02] supprimer à nouveau garde la première date de suppression
  ---
  duration_ms: 0.132579
  type: 'test'
  ...
# Subtest: [T02] un enregistrement rendu par le store ne change pas les données enregistrées
ok 37 - [T02] un enregistrement rendu par le store ne change pas les données enregistrées
  ---
  duration_ms: 0.404124
  type: 'test'
  ...
# Subtest: [T02] un seul nombre remplit les trois valeurs de la fourchette
ok 38 - [T02] un seul nombre remplit les trois valeurs de la fourchette
  ---
  duration_ms: 0.322725
  type: 'test'
  ...
# Subtest: [T02] fourchette_ordonnee : basse ≤ médiane ≤ haute, sinon refus
ok 39 - [T02] fourchette_ordonnee : basse ≤ médiane ≤ haute, sinon refus
  ---
  duration_ms: 0.205819
  type: 'test'
  ...
# Subtest: [T02] fourchette_ordonnee : le store refuse d'enregistrer une fourchette désordonnée
ok 40 - [T02] fourchette_ordonnee : le store refuse d'enregistrer une fourchette désordonnée
  ---
  duration_ms: 0.301898
  type: 'test'
  ...
# Subtest: [T02] la saisie d'une fourchette accepte un nombre ou trois, avec la virgule décimale
ok 41 - [T02] la saisie d'une fourchette accepte un nombre ou trois, avec la virgule décimale
  ---
  duration_ms: 0.616847
  type: 'test'
  ...
# Subtest: [T08] EX-07 : export puis import restituent la ferme à l'identique, y compris les éléments supprimés
ok 42 - [T08] EX-07 : export puis import restituent la ferme à l'identique, y compris les éléments supprimés
  ---
  duration_ms: 0.958316
  type: 'test'
  ...
# Subtest: [T08] le fichier exporté porte l'application, un numéro de version et sa date
ok 43 - [T08] le fichier exporté porte l'application, un numéro de version et sa date
  ---
  duration_ms: 0.390816
  type: 'test'
  ...
# Subtest: [T08] l'import remplace toute la ferme actuelle
ok 44 - [T08] l'import remplace toute la ferme actuelle
  ---
  duration_ms: 0.409461
  type: 'test'
  ...
# Subtest: [T08] un fichier qui n'est pas un export plantoeuf, ou d'une version plus récente, est refusé sans rien changer
ok 45 - [T08] un fichier qui n'est pas un export plantoeuf, ou d'une version plus récente, est refusé sans rien changer
  ---
  duration_ms: 0.632963
  type: 'test'
  ...
# Subtest: [T08] EX-08 : rappel à l'ouverture quand rien n'a été exporté depuis 7 jours et que des données ont changé
ok 46 - [T08] EX-08 : rappel à l'ouverture quand rien n'a été exporté depuis 7 jours et que des données ont changé
  ---
  duration_ms: 0.185091
  type: 'test'
  ...
# Subtest: [T08] EX-08 : après un export, le rappel revient 7 jours après cet export si des données ont changé
ok 47 - [T08] EX-08 : après un export, le rappel revient 7 jours après cet export si des données ont changé
  ---
  duration_ms: 0.115082
  type: 'test'
  ...
# Subtest: [T08] EX-08 : ni une ferme vide ni une ferme tout juste importée ne déclenchent de rappel
ok 48 - [T08] EX-08 : ni une ferme vide ni une ferme tout juste importée ne déclenchent de rappel
  ---
  duration_ms: 0.179236
  type: 'test'
  ...
1..48
# tests 48
# suites 0
# pass 48
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 214.546992
== Tests de bout en bout (Playwright) ==

Running 45 tests using 2 workers

  ✓   1 test/exemple.e2e.js:6:1 › [T09] à la première ouverture, la ferme d'exemple est proposée et se charge d'un clic : 10 plantations et le tableau (349ms)
  ✓   3 test/exemple.e2e.js:19:1 › [T09] la ferme d'exemple s'efface d'un geste, sans toucher à ce que l'utilisateur a ajouté (494ms)
  ✓   2 test/espaces.e2e.js:18:1 › [T07] S3 : « planche 4 » porte un signal de sur-occupation pour juin, et les deux plantations restent enregistrées (1.0s)
  ✓   4 test/exemple.e2e.js:37:1 › [T09] une ferme commencée ne propose plus l'exemple, même après réouverture ; une ferme vidée le propose de nouveau (467ms)
  ✓   5 test/espaces.e2e.js:33:1 › [T07] le signal disparaît dès que la sur-occupation est corrigée (1.0s)
  ✓   7 test/modele.e2e.js:6:1 › [T02] dans le fichier ouvert, un espace enregistré porte un UUID, ses dates et supprimeLe nul (248ms)
  ✓   6 test/export.e2e.js:17:1 › [T08] EX-07 : Exporter produit un fichier JSON que Importer restaure à l'identique, y compris les supprimés (1.0s)
  ✓   9 test/presentation.e2e.js:14:1 › [T11] le rendu est découpé en modules, et l'outil s'utilise sans aucune erreur (534ms)
  ✓   8 test/export.e2e.js:43:1 › [T08] l'import remplace la ferme ouverte après confirmation (831ms)
  ✓  11 test/export.e2e.js:55:1 › [T08] un fichier illisible est refusé avec un message, et la ferme reste intacte (291ms)
  ✓  10 test/presentation.e2e.js:43:3 › [T12] P1-S1 à 1280 × 720 : le tableau reste visible pendant le défilement des panneaux de saisie (719ms)
  ✓  12 test/export.e2e.js:68:1 › [T08] EX-08 : le rappel d'export s'affiche à l'ouverture après 7 jours de modifications non exportées (503ms)
  ✓  13 test/presentation.e2e.js:43:3 › [T12] P1-S1 à 1366 × 768 : le tableau reste visible pendant le défilement des panneaux de saisie (729ms)
  ✓  14 test/recolte.e2e.js:9:1 › [T04] une plantation saisie affiche ses dates de première et de dernière récolte (522ms)
  ✓  15 test/presentation.e2e.js:43:3 › [T12] P1-S1 à 1920 × 1080 : le tableau reste visible pendant le défilement des panneaux de saisie (830ms)
  ✓  16 test/saisie.e2e.js:73:1 › [T03] espaces, cultures, variétés et plantations sont saisis, listés et retrouvés après réouverture (772ms)
  ✓  17 test/presentation.e2e.js:68:1 › [T12] EX-16 : aucun défilement horizontal de la page de 1280 à 1920 px de large, ferme d'exemple chargée (803ms)
  ✓  18 test/saisie.e2e.js:94:1 › [T03] une variété ne garde que les champs numériques surchargés, les autres viennent de la culture (683ms)
  ✓  19 test/presentation.e2e.js:78:1 › [T12] sous 1100 px de large, une seule colonne, la projection en premier (364ms)
  ✓  21 test/presentation.e2e.js:89:1 › [T13] EX-12 : chaque objet a son panneau titré, avec le nombre d'éléments actifs, et tous ses champs visibles (408ms)
  ✓  22 test/presentation.e2e.js:103:1 › [T13] le nombre d'éléments d'un panneau suit les ajouts et les suppressions (292ms)
  ✓  20 test/saisie.e2e.js:110:1 › [T03] une modification est enregistrée et retrouvée après réouverture (1.1s)
  ✓  23 test/presentation.e2e.js:115:1 › [T13] EX-15 : le panneau et l'élément modifiés sont signalés jusqu'à l'enregistrement (400ms)
  ✓  25 test/presentation.e2e.js:129:1 › [T13] EX-15 : … ou jusqu'à l'annulation (312ms)
  ✓  24 test/saisie.e2e.js:142:1 › [T03] une suppression retire l'élément des listes, même après réouverture, sans l'effacer du stockage (868ms)
  ✓  27 test/saisie.e2e.js:165:1 › [T03] une fourchette désordonnée est refusée avec un message, sans rien enregistrer (309ms)
  ✓  26 test/presentation.e2e.js:138:1 › [T13] une barre de raccourcis mène à chaque panneau de saisie (501ms)
  ✓  28 test/presentation.e2e.js:151:1 › [T14] P1-S2 : les mois et les cultures restent visibles pendant le défilement du tableau (381ms)
  ✓  29 test/squelette.e2e.js:4:1 › [T01] un espace créé est retrouvé après fermeture et réouverture du fichier (455ms)
  ✓  31 test/squelette.e2e.js:19:1 › [T01] le fichier assemblé ne charge aucune autre ressource (168ms)
  ✓  30 test/presentation.e2e.js:169:1 › [T14] P1-S3 : la synthèse donne le chiffre d'affaires estimé de la saison en fourchette, et suit les modifications (829ms)
  ✓  32 test/tableau.e2e.js:5:1 › [T05] S2 : en mai, la ligne courgette donne un CA en fourchette dont la médiane vaut le volume de mai × 2,50 € (666ms)
  ✓  33 test/presentation.e2e.js:188:1 › [T14] la synthèse reste en tête quel que soit le défilement (360ms)
  ✓  35 test/presentation.e2e.js:196:1 › [T14] une case vide du tableau s'affiche discrètement (238ms)
  ✓  36 test/presentation.e2e.js:260:1 › [T15] EX-16 : texte courant d'au moins 14 px, aucun texte sous 12 px ni sous un contraste de 4,5:1 — ferme vide (147ms)
  ✓  34 test/tableau.e2e.js:19:1 › [T05] EX-04 : le tableau donne pour chaque mois le volume, le chiffre d'affaires et la marge (663ms)
  ✓  37 test/presentation.e2e.js:266:1 › [T15] EX-16 : mêmes règles avec la ferme d'exemple, une modification en cours, une sur-occupation et une erreur (592ms)
  ✓  38 test/tableau.e2e.js:34:1 › [T05] EX-09 : les en-têtes signalent des estimations en fourchette basse / médiane / haute (657ms)
  ✓  40 test/tableau.e2e.js:45:1 › [T05] sans plantation, le tableau annonce qu'aucune récolte n'est prévue (174ms)
  ✓  39 test/presentation.e2e.js:283:1 › [T15] EX-16 : l'élément qui a le focus clavier porte un contour visible (449ms)
  ✓  42 test/presentation.e2e.js:298:1 › [T16] à 1920 × 1080, le tableau occupe toute la largeur de sa boîte (294ms)
  ✓  41 test/tableau.e2e.js:59:1 › [T06] modifier la surface d'une plantation recalcule le tableau sans autre action (715ms)
  ✓  43 test/tranche.e2e.js:22:1 › [T10] parcours de la tranche : ferme d'exemple, plantation modifiée, tableau recalculé, export puis réimport à l'identique (737ms)
  ✓  44 test/tableau.e2e.js:71:1 › [T06] changer un prix, ajouter ou supprimer une plantation recalcule le tableau (882ms)
  ✓  45 test/tableau.e2e.js:89:1 › [T06] une modification faite dans un autre onglet recalcule le tableau ouvert, sans l'écraser ensuite (909ms)

  45 passed (14.6s)
== P1 : vérification verte ==
```

## 13/10/2026 · T17 — Captures envoyées, en attente de validation

- Captures à 1366 × 768 et 1920 × 1080, ferme d'exemple chargée, et fichier `plantoeuf.html` de P1 envoyés à l'humain. `passe` reste à `false` jusqu'à sa validation (EX-17).
- La suite ne bloque pas sur cette validation : les panneaux de N2 se logent dans la mise en page de P1, qui reste retouchable.

---

# Tranche N2 — Points de vente et séances

- Spec, runbook et tâches (T18 à T25, seuil de 12 sessions) dans `docs/specs/N2/`.
- Deux questions posées à l'humain sans réponse à ce jour (version du format exporté, nom de la liste des points de vente) : l'agent avance avec la voie qui ne modifie aucun test (version 1 conservée, liste `pointsVente`), consignée dans la spec ; la voie plus propre (version 2 avec migration, `pointsDeVente`) attend son accord.

## 13/10/2026 · T18 — Modèle : points de vente, séances, débouchés

- Session 1 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable, contexte frais → **CONFORME** (noms et champs conformes à la spec, version 1 conservée, `pointsDeVente` toujours refusé, invariants de N1 tenus). Observation : une ferme qui ne contient que des points de vente n'est plus « vide » pour la proposition de l'exemple, ce qui est cohérent.
- Résultat : **vert**. `./verify.sh T18` → exit 0 (5 tests unitaires, 1 de bout en bout) ; `./verify.sh N2` → exit 0 (53 tests unitaires, 46 de bout en bout).
- Fichiers : `src/store.js` (trois listes de plus), `test/ventes.test.js`, `test/ventes.e2e.js`.
- Rouge d'abord : 5 tests unitaires rouges et le test de bout en bout rouge (« Objet absent du modèle : pointsVente »).
- Commit : « T18 — Modèle : points de vente, séances et débouchés dans le store ».

Preuve (`./verify.sh T18`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 75619 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 75.780234
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 75.527244
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 76.405279
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 69.475225
  type: 'test'
  ...
# Subtest: [T18] points de vente, séances et débouchés reçoivent un UUID et leurs dates, et sont retrouvés après réouverture
ok 5 - [T18] points de vente, séances et débouchés reçoivent un UUID et leurs dates, et sont retrouvés après réouverture
  ---
  duration_ms: 7.672554
  type: 'test'
  ...
# Subtest: [T18] leur suppression est logique
ok 6 - [T18] leur suppression est logique
  ---
  duration_ms: 0.648923
  type: 'test'
  ...
# Subtest: [T18] une fourchette désordonnée y est refusée
ok 7 - [T18] une fourchette désordonnée y est refusée
  ---
  duration_ms: 0.79574
  type: 'test'
  ...
# Subtest: [T18] export puis import restituent points de vente, séances et débouchés à l'identique, supprimés compris
ok 8 - [T18] export puis import restituent points de vente, séances et débouchés à l'identique, supprimés compris
  ---
  duration_ms: 0.941916
  type: 'test'
  ...
# Subtest: [T18] un fichier exporté avant N2, sans ces listes, s'importe toujours
ok 9 - [T18] un fichier exporté avant N2, sans ces listes, s'importe toujours
  ---
  duration_ms: 0.312851
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 169.295226
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/ventes.e2e.js:5:1 › [T18] dans le fichier ouvert, points de vente, séances et débouchés sont enregistrés, retrouvés et exportés (296ms)

  1 passed (929ms)
== T18 : vérification verte ==
```

## 13/10/2026 · T19 — Saisie des points de vente, séances et débouchés

- Session 2 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T19` → exit 0 (3 tests de bout en bout) ; `./verify.sh N2` → exit 0 (53 tests unitaires, 49 de bout en bout).
- Fichiers : `src/index.html` (trois panneaux et leurs raccourcis), `src/ui-ventes.js` (listes et listes déroulantes), `src/ui-saisie.js` (outils partagés, nombre lu aussi dans une liste déroulante), `src/i18n.js`, `test/ventes.e2e.js`.
- Rouge d'abord : les 3 tests `[T19]` rouges (champs absents).
- Commit : « T19 — Panneaux de saisie des points de vente, séances et débouchés ».

Preuve (`./verify.sh T19`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 86025 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 73.604709
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 71.431899
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 72.461676
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 77.991655
  type: 'test'
  ...
1..0
# Subtest: test/ventes.test.js
ok 5 - test/ventes.test.js
  ---
  duration_ms: 64.134008
  type: 'test'
  ...
1..5
# tests 5
# suites 0
# pass 5
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 162.110836
== Tests de bout en bout (Playwright) ==

Running 3 tests using 1 worker

  ✓  1 test/ventes.e2e.js:57:1 › [T19] points de vente, séances et débouchés se saisissent, se listent et sont retrouvés après réouverture (991ms)
  ✓  2 test/ventes.e2e.js:85:1 › [T19] un point de vente se modifie, une séance se supprime logiquement (977ms)
  ✓  3 test/ventes.e2e.js:108:1 › [T19] une fourchette désordonnée est refusée avec un message, sans rien enregistrer (200ms)

  3 passed (2.9s)
== T19 : vérification verte ==
```

## 13/10/2026 · T20 — Séances datées et coût de chaque séance

- Session 3 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · **Reprises : 1** · Relecteur : Fable, contexte frais.
  - 1er passage → **ÉCART** : une fonction `lundiDe` ajoutée et exportée sans test ni usage (AGENTS.md : « test avant code »). Reprise : la fonction quitte T20 ; elle revient en T21, où elle sert, avec son test.
  - 2e passage, sur le diff corrigé → **CONFORME**.
- Résultat : **vert**. `./verify.sh T20` → exit 0 (4 tests unitaires, 1 de bout en bout) ; `./verify.sh N2` → exit 0 (57 tests unitaires, 50 de bout en bout).
- Fichiers : `src/calc.js` (`jourDeLaSemaine`, `seancesDatees`, `coutSeance`, `seancesDeLaFerme`), `src/ui-ventes.js` et `src/i18n.js` (nombre de séances et coût dans la liste), `test/ventes.test.js`, `test/ventes.e2e.js`.
- Rouge d'abord : 4 tests unitaires rouges (`Calc.seancesDatees is not a function`…), test de bout en bout rouge (« 9 séances » absent).
- Commit : « T20 — Séances datées et coût de chaque séance ».

Preuve (`./verify.sh T20`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 88116 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 71.2912
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 79.013161
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 59.880122
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 66.647643
  type: 'test'
  ...
# Subtest: [T20] une séance du samedi du 2 mai au 27 juin 2026 donne 9 séances datées
ok 5 - [T20] une séance du samedi du 2 mai au 27 juin 2026 donne 9 séances datées
  ---
  duration_ms: 2.382145
  type: 'test'
  ...
# Subtest: [T20] les séances datées tombent le jour dit, dans la période, bornes comprises
ok 6 - [T20] les séances datées tombent le jour dit, dans la période, bornes comprises
  ---
  duration_ms: 0.2843
  type: 'test'
  ...
# Subtest: [T20] S6 : chaque séance coûte 15 + 2 × 12 × 0,40 = 24,60 €
ok 7 - [T20] S6 : chaque séance coûte 15 + 2 × 12 × 0,40 = 24,60 €
  ---
  duration_ms: 1.323204
  type: 'test'
  ...
# Subtest: [T20] S6 : les séances datées de la ferme, avec leur coût ; une séance ou un point de vente supprimé ne compte plus
ok 8 - [T20] S6 : les séances datées de la ferme, avec leur coût ; une séance ou un point de vente supprimé ne compte plus
  ---
  duration_ms: 0.486133
  type: 'test'
  ...
1..8
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 157.299813
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/ventes.e2e.js:120:1 › [T20] S6 : la liste des séances donne le nombre de séances datées et le coût de chacune (827ms)

  1 passed (1.5s)
== T20 : vérification verte ==
```

## 13/10/2026 · T21 — Offre et demande par culture et par semaine ; vue « Offre et demande »

- Session 4 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · **Reprises : 0** · Relecteur : Fable, contexte frais → **CONFORME**.
  - Remarques non retenues comme écarts : (1) l'écart affiché dans une case de la matrice est l'écart des médianes, un seul nombre, alors qu'AGENTS.md veut des fourchettes ; le scénario S4 l'écrit ainsi (« dépasse de 13,75 kg … sûrement ») et la légende le dit — **question posée à l'humain** ; (2) le diff touche aussi `src/ui-commun.js` et `src/ui-tableau.js`, absents du champ `fichiers` de T21 ; (3) « au prix de la culture » simplifie « au prix de sa variété ou de la culture », comme les textes de T19.
- Résultat : **vert**. `./verify.sh T21` → exit 0 (6 tests unitaires, 2 de bout en bout) ; `./verify.sh N2` → exit 0 (63 tests unitaires, 52 de bout en bout).
- Fichiers : `src/calc.js` (`lundiDe`, `offreParSemaine`, `demandeParSemaine`, `numeroDeSemaine`, `semainesEntre`, `offreDemande`), `src/ui-ventes.js` (matrice offre-demande), `src/ui-commun.js` (onglets), `src/ui-tableau.js` (la colonne Total fixée ne vaut que pour le tableau économique), `src/index.html` (onglets « Par culture » et « Offre et demande »), `src/i18n.js`, `test/ventes.test.js`, `test/ventes.e2e.js`.
- Rouge d'abord : 6 tests unitaires rouges (`Calc.offreDemande is not a function`…), 2 tests de bout en bout rouges (onglet « Offre et demande » absent).
- Commit : « T21 — Offre et demande par culture et par semaine ; vue « Offre et demande » ».

Preuve (`./verify.sh T21`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 99604 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 85.225527
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 68.335102
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 52.077125
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 54.971071
  type: 'test'
  ...
# Subtest: [T21] une semaine va du lundi au dimanche ; son numéro suit la norme ISO 8601
ok 5 - [T21] une semaine va du lundi au dimanche ; son numéro suit la norme ISO 8601
  ---
  duration_ms: 2.514069
  type: 'test'
  ...
# Subtest: [T21] S4 : la courgette dépasse de 13,75 kg la semaine du 27 avril, sûrement
ok 6 - [T21] S4 : la courgette dépasse de 13,75 kg la semaine du 27 avril, sûrement
  ---
  duration_ms: 1.24171
  type: 'test'
  ...
# Subtest: [T21] S4 : elle manque de 20 kg la semaine du 22 juin, sûrement ; les semaines vont du 27 avril au 22 juin
ok 7 - [T21] S4 : elle manque de 20 kg la semaine du 22 juin, sûrement ; les semaines vont du 27 avril au 22 juin
  ---
  duration_ms: 1.708768
  type: 'test'
  ...
# Subtest: [T21] quand les fourchettes se recouvrent, l'état suit la médiane mais n'est pas sûr
ok 8 - [T21] quand les fourchettes se recouvrent, l'état suit la médiane mais n'est pas sûr
  ---
  duration_ms: 0.833326
  type: 'test'
  ...
# Subtest: [T21] la demande additionne les séances de la semaine ; une culture sans débouché est signalée comme telle
ok 9 - [T21] la demande additionne les séances de la semaine ; une culture sans débouché est signalée comme telle
  ---
  duration_ms: 8.04518
  type: 'test'
  ...
# Subtest: [T21] séances, débouchés et points de vente supprimés ne font plus de demande
ok 10 - [T21] séances, débouchés et points de vente supprimés ne font plus de demande
  ---
  duration_ms: 0.736209
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 162.817329
== Tests de bout en bout (Playwright) ==

Running 2 tests using 1 worker

  ✓  1 test/ventes.e2e.js:131:1 › [T21] S4 : la vue « Offre et demande » montre, semaine par semaine, où la production dépasse ou manque (924ms)
  ✓  2 test/ventes.e2e.js:155:1 › [T21] EX-09 : offre et demande s'affichent en fourchette, signalées comme estimations (780ms)

  2 passed (2.4s)
== T21 : vérification verte ==
```

## 13/10/2026 · T22 — Ventes plafonnées par la demande, au meilleur prix ; tableau : volume vendu, coût des séances, marge de la ferme · **ARRÊT, question posée**

- Session 5 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable, contexte frais → **ÉCART** (un seul, de calcul ; le reste conforme : vente = min(offre, demande) niveau par niveau, ordre de service, culture sans débouché comme en N1, règle du jeudi, scénarios S4, S5, S6).
  - Écart : la marge de la ferme se calcule en croisant les niveaux (basse = CA bas − coûts hauts ; haute = CA haut − coûts bas), alors que la spec dit : « Fourchettes : basse, médiane et haute se calculent chacune avec les valeurs basses, médianes ou hautes. »
  - Pourquoi aucune reprise ne peut le résoudre : niveau par niveau, la marge peut sortir désordonnée et violer l'invariant `fourchette_ordonnee` que la même spec reprend de N1. Exemple réel : un mois avec des séances et aucune vente (avril, avant les récoltes) — CA 0, coûts 22 / 25 / 27 € → marge −22 / −25 / −27 €, la « basse » au-dessus de la « haute ». La spec se contredit ; la corriger revient à l'humain (AGENTS.md : jamais modifier la spec). Le relecteur conclut de même.
- Conformément au runbook (« une exigence paraît fausse » ; « un écart … puis arrêt et compte rendu »), l'agent s'arrête et pose la question. **`passe` reste à `false`.**
- Résultat des tests : **vert**. `./verify.sh T22` → exit 0 (6 tests unitaires, 1 de bout en bout) ; `./verify.sh N2` → exit 0 (69 tests unitaires, 53 de bout en bout).
- Rouge d'abord : 4 tests unitaires rouges (`Calc.ventes is not a function`, `couts` absent du total), 1 test de bout en bout rouge (« vendu » absent).
- Fichiers : `src/calc.js` (`soustraire`, `ventes`, `moisDuJeudi`, `tableau` avec ventes et coûts), `src/ui-tableau.js` (volume vendu, ligne des coûts des séances), `src/i18n.js`, `test/ventes.test.js`, `test/ventes.e2e.js`.
- Commit : « T22 — en cours, arrêtée sur une question de spec (marge de la ferme) » — commité pour mettre le travail à l'abri, la tâche n'est pas passée. La règle retenue par l'humain se change en un seul endroit (`soustraire`, `src/calc.js`) et dans une ligne du test « [T22] S6 et EX-23 ».
- Remarques non bloquantes du relecteur : la ligne « Coût des séances » n'apparaît que si des séances coûtent quelque chose ; un troisième critère de tri (identifiant du débouché) départage deux débouchés de même prix et même point de vente ; les mois des séances étendent les colonnes du tableau.

Preuve (`./verify.sh T22`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 104567 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 70.05193
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 84.021238
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 56.138168
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 76.700412
  type: 'test'
  ...
# Subtest: [T22] S4 : la demande plafonne les ventes : 160 kg et 400 € sur la saison au lieu de 675 €
ok 5 - [T22] S4 : la demande plafonne les ventes : 160 kg et 400 € sur la saison au lieu de 675 €
  ---
  duration_ms: 4.293458
  type: 'test'
  ...
# Subtest: [T22] S5 : la production va d'abord au point de vente qui paie le mieux
ok 6 - [T22] S5 : la production va d'abord au point de vente qui paie le mieux
  ---
  duration_ms: 0.756974
  type: 'test'
  ...
# Subtest: [T22] vendu_borne : le volume vendu ne dépasse ni l'offre ni la demande, à chaque niveau ; chaque case reste ordonnée
ok 7 - [T22] vendu_borne : le volume vendu ne dépasse ni l'offre ni la demande, à chaque niveau ; chaque case reste ordonnée
  ---
  duration_ms: 3.208276
  type: 'test'
  ...
# Subtest: [T22] sans_debouche_comme_n1 : une culture sans débouché se calcule exactement comme en N1
ok 8 - [T22] sans_debouche_comme_n1 : une culture sans débouché se calcule exactement comme en N1
  ---
  duration_ms: 7.759379
  type: 'test'
  ...
# Subtest: [T22] S6 et EX-23 : le coût des séances se déduit de la marge de la ferme, mois par mois
ok 9 - [T22] S6 et EX-23 : le coût des séances se déduit de la marge de la ferme, mois par mois
  ---
  duration_ms: 1.402412
  type: 'test'
  ...
# Subtest: [T22] 200 plantations, 10 points de vente, 20 séances et 100 débouchés se calculent en moins d'une seconde
ok 10 - [T22] 200 plantations, 10 points de vente, 20 séances et 100 débouchés se calculent en moins d'une seconde
  ---
  duration_ms: 115.184107
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 290.708588
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/ventes.e2e.js:170:1 › [T22] S4 et S6 : le tableau donne le volume vendu, et la marge de la ferme déduit le coût des séances (889ms)

  1 passed (1.6s)
== T22 : vérification verte ==
```

## 13/10/2026 · Décisions de l'humain sur les questions de N2

- **Marge de la ferme, et toute différence de fourchettes** : du pire au meilleur (basse = CA bas − coûts hauts ; haute = CA haut − coûts bas). Règle ajoutée à `docs/specs/N2/SPEC.md` (« Différence de fourchettes ») ; elle lève la contradiction relevée par le relecteur de T22.
- **Format exporté** : version 2, avec migration des fichiers de version 1. L'humain accepte que la ligne du test `[T08]` qui exige « version 1 » passe à 2, ainsi que celle du test `[T18]`. Travail fait en reprise de T18. Le nom de la liste reste `pointsVente`.
- **Écart d'une case de la matrice** : un seul nombre (écart des médianes), le cadre portant la sûreté ; exception à « jamais un chiffre seul » consignée dans la spec.

## 13/10/2026 · T22 (suite) — Reprise après la décision de l'humain : CONFORME

- Session 6 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · **Reprises : 1** (la règle de la spec, pas le code : l'humain a tranché « du pire au meilleur », inscrit dans `SPEC.md` au commit « N2 — Décisions de l'humain ») · Relecteur : Fable, contexte frais, 2e passage sur le diff de T22 (`git diff 75b2f9b 7849169 -- src test`) → **CONFORME**.
  - Remarques non bloquantes : (1) un 3e critère de tri (identifiant du débouché) ne sert qu'au déterminisme ; (2) les ventes par débouché de `Calc.ventes` sont niveau par niveau : la vue « Points de vente » (T23) doit calculer à part la fourchette d'un point pris seul ; (3) une ferme avec des séances et sans débouché voit leurs coûts déduits : `sans_debouche_comme_n1` tient pour les lignes des cultures, pas pour le pied ; (4) la ligne de version du test `[T18]` attend la reprise de T18.
- Résultat : **vert**, code inchangé depuis le commit de l'arrêt. `./verify.sh T22` → exit 0 ; `./verify.sh N2` → exit 0 (69 tests unitaires, 53 de bout en bout).
- Commit : « T22 — Ventes plafonnées par la demande, au meilleur prix ; coût des séances déduit de la marge de la ferme ».

Preuve (`./verify.sh T22`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 104567 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 70.05193
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 84.021238
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 56.138168
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 76.700412
  type: 'test'
  ...
# Subtest: [T22] S4 : la demande plafonne les ventes : 160 kg et 400 € sur la saison au lieu de 675 €
ok 5 - [T22] S4 : la demande plafonne les ventes : 160 kg et 400 € sur la saison au lieu de 675 €
  ---
  duration_ms: 4.293458
  type: 'test'
  ...
# Subtest: [T22] S5 : la production va d'abord au point de vente qui paie le mieux
ok 6 - [T22] S5 : la production va d'abord au point de vente qui paie le mieux
  ---
  duration_ms: 0.756974
  type: 'test'
  ...
# Subtest: [T22] vendu_borne : le volume vendu ne dépasse ni l'offre ni la demande, à chaque niveau ; chaque case reste ordonnée
ok 7 - [T22] vendu_borne : le volume vendu ne dépasse ni l'offre ni la demande, à chaque niveau ; chaque case reste ordonnée
  ---
  duration_ms: 3.208276
  type: 'test'
  ...
# Subtest: [T22] sans_debouche_comme_n1 : une culture sans débouché se calcule exactement comme en N1
ok 8 - [T22] sans_debouche_comme_n1 : une culture sans débouché se calcule exactement comme en N1
  ---
  duration_ms: 7.759379
  type: 'test'
  ...
# Subtest: [T22] S6 et EX-23 : le coût des séances se déduit de la marge de la ferme, mois par mois
ok 9 - [T22] S6 et EX-23 : le coût des séances se déduit de la marge de la ferme, mois par mois
  ---
  duration_ms: 1.402412
  type: 'test'
  ...
# Subtest: [T22] 200 plantations, 10 points de vente, 20 séances et 100 débouchés se calculent en moins d'une seconde
ok 10 - [T22] 200 plantations, 10 points de vente, 20 séances et 100 débouchés se calculent en moins d'une seconde
  ---
  duration_ms: 115.184107
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 290.708588
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/ventes.e2e.js:170:1 › [T22] S4 et S6 : le tableau donne le volume vendu, et la marge de la ferme déduit le coût des séances (889ms)

  1 passed (1.6s)
== T22 : vérification verte ==
```

## 13/10/2026 · T18 (reprise) — Format exporté en version 2, migration des fichiers de version 1

- Session 7 / 12 du seuil d'alerte de N2. Reprise décidée par l'humain (voir « Décisions de l'humain sur les questions de N2 ») ; T18 reste passée.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecteur : Fable, contexte frais → **CONFORME** (migration vérifiée sur un vrai export du store de N1 ; le store de N1 refuse un fichier de version 2 avec `import_version`, ferme intacte ; seules les deux lignes de test autorisées changent ; identité export → import → export vérifiée).
  - Remarque non bloquante : la migration garde les listes de vente qu'un fichier de version 1 porterait déjà (exporté pendant la construction de N2) ; la spec ne décrit que le cas de N1, sans le contredire.
- Résultat : **vert**. `./verify.sh T18` → exit 0 (10 tests unitaires, 1 de bout en bout) ; `./verify.sh T08` → exit 0 ; `./verify.sh N2` → exit 0 (70 tests unitaires, 53 de bout en bout).
- Fichiers : `src/store.js` (`VERSION = 2`, `MIGRATIONS[1]`), `test/export.e2e.js` (ligne `[T08]` : version 2, accord de l'humain), `test/ventes.test.js` (ligne `[T18]` : version 2, accord de l'humain ; un test `[T18]` ajouté).
- Rouge d'abord : 2 tests unitaires rouges (version exportée 1 au lieu de 2).
- Preuve complémentaire : un export de N2 importé par le store de N1 (`origin/n1`) → « N1 refuse : import_version — Fichier d'une version plus récente. »
- Commit : « T18 (reprise) — Format exporté en version 2, migration des fichiers de version 1 ».

Preuve (`./verify.sh T18`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 104938 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 70.67372
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 69.704318
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 70.844676
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 59.011312
  type: 'test'
  ...
# Subtest: [T18] points de vente, séances et débouchés reçoivent un UUID et leurs dates, et sont retrouvés après réouverture
ok 5 - [T18] points de vente, séances et débouchés reçoivent un UUID et leurs dates, et sont retrouvés après réouverture
  ---
  duration_ms: 6.702585
  type: 'test'
  ...
# Subtest: [T18] leur suppression est logique
ok 6 - [T18] leur suppression est logique
  ---
  duration_ms: 0.617586
  type: 'test'
  ...
# Subtest: [T18] une fourchette désordonnée y est refusée
ok 7 - [T18] une fourchette désordonnée y est refusée
  ---
  duration_ms: 1.207881
  type: 'test'
  ...
# Subtest: [T18] export puis import restituent points de vente, séances et débouchés à l'identique, supprimés compris
ok 8 - [T18] export puis import restituent points de vente, séances et débouchés à l'identique, supprimés compris
  ---
  duration_ms: 0.645805
  type: 'test'
  ...
# Subtest: [T18] le format exporté passe en version 2 ; un fichier de version 1 qui porte déjà des listes de vente les garde
ok 9 - [T18] le format exporté passe en version 2 ; un fichier de version 1 qui porte déjà des listes de vente les garde
  ---
  duration_ms: 1.642574
  type: 'test'
  ...
# Subtest: [T18] un fichier exporté avant N2, sans ces listes, s'importe toujours
ok 10 - [T18] un fichier exporté avant N2, sans ces listes, s'importe toujours
  ---
  duration_ms: 0.271107
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 160.089651
== Tests de bout en bout (Playwright) ==

Running 1 test using 1 worker

  ✓  1 test/ventes.e2e.js:5:1 › [T18] dans le fichier ouvert, points de vente, séances et débouchés sont enregistrés, retrouvés et exportés (299ms)

  1 passed (1.0s)
== T18 : vérification verte ==
```

## 13/10/2026 · T23 — Vue « Points de vente » : séances, chiffre d'affaires, coûts et résultat par mois

- Session 8 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T23` → exit 0 (3 tests unitaires, 2 de bout en bout) ; `./verify.sh N2` → exit 0 (73 tests unitaires, 55 de bout en bout).
- Fichiers : `src/calc.js` (`pointsDeVente` ; `ventes` rend aussi l'offre de la semaine et la demande de chaque débouché), `src/ui-ventes.js` (vue « Points de vente »), `src/index.html` (onglet et section), `src/i18n.js`, `src/ui-commun.js` (un montant arrondi à zéro s'affiche « 0 € », pas « -0 € »), `test/ventes.test.js`, `test/ventes.e2e.js`.
- Rouge d'abord : 3 tests unitaires rouges (`Calc.pointsDeVente is not a function`), 2 de bout en bout rouges (onglet absent ; « -0 € » au lieu de « 0 € »).
- Trouvé en relisant une capture : un résultat de −0,3 € s'affichait « -0 € ». Test ajouté, puis correction (`signDisplay: "negative"`).
- Commit : « T23 — Vue « Points de vente » : séances, chiffre d'affaires, coûts et résultat par mois ».

Preuve (`./verify.sh T23`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 111373 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 67.988974
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 71.134248
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 80.451153
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 68.635531
  type: 'test'
  ...
# Subtest: [T23] S6 : le marché de Saint-Paul compte 9 séances, coûte 221,40 € et rapporte 400 − 221,40 = 178,60 €
ok 5 - [T23] S6 : le marché de Saint-Paul compte 9 séances, coûte 221,40 € et rapporte 400 − 221,40 = 178,60 €
  ---
  duration_ms: 4.555705
  type: 'test'
  ...
# Subtest: [T23] la fourchette d'un point de vente va du cas le moins favorable pour lui au plus favorable, médiane comprise
ok 6 - [T23] la fourchette d'un point de vente va du cas le moins favorable pour lui au plus favorable, médiane comprise
  ---
  duration_ms: 9.864781
  type: 'test'
  ...
# Subtest: [T23] un point de vente sans débouché n'a que des coûts ; un point supprimé disparaît
ok 7 - [T23] un point de vente sans débouché n'a que des coûts ; un point supprimé disparaît
  ---
  duration_ms: 0.7742
  type: 'test'
  ...
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 164.393828
== Tests de bout en bout (Playwright) ==

Running 2 tests using 1 worker

  ✓  1 test/ventes.e2e.js:187:1 › [T23] S6 : la vue « Points de vente » donne, par mois, les séances, le chiffre d'affaires, les coûts et le résultat (884ms)
  ✓  2 test/ventes.e2e.js:204:1 › [T23] un résultat arrondi à zéro s'affiche comme zéro, sans signe moins (114ms)

  2 passed (1.7s)
== T23 : vérification verte ==
```

## 13/10/2026 · T24 — Ferme d'exemple : points de vente réunionnais, séances et débouchés

- Session 9 / 12 du seuil d'alerte de N2.
- Modèle : Opus 5.5, effort élevé · Reprises : 0 · Relecture : non requise (`relecture: false`).
- Résultat : **vert**. `./verify.sh T24` → exit 0 (2 tests unitaires, 2 de bout en bout) ; `./verify.sh N2` → exit 0 (75 tests unitaires, 57 de bout en bout), dont les tests de N1 et de P1 qui chargent l'exemple (`[T09]`, `[T10]`, `[T12]` P1-S1 aux trois tailles d'écran, `[T14]`, `[T15]`).
- Fichiers : `src/exemple.js` (3 points de vente, 3 séances, 14 débouchés ; `effacer` couvre les trois listes), `test/ventes.test.js`, `test/exemple-ventes.e2e.js`.
- Rouge d'abord : 2 tests unitaires rouges, 1 test de bout en bout rouge (aucun point de vente dans l'exemple). Le second test de bout en bout (effacer l'exemple vide aussi les panneaux de vente) passait déjà, faute de données de vente à effacer ; il garde le comportement.
- Contrainte tenue : la demande de courgette reste au-dessus de sa production, pour que les tests `[T10]` et `[T12]` (le chiffre d'affaires baisse quand la plantation de courgette rétrécit) restent valables.
- Commit : « T24 — Ferme d'exemple : points de vente réunionnais, séances et débouchés ».

Preuve (`./verify.sh T24`) :

```text
== Assemblage de dist/index.html ==
dist/index.html : 114321 octets
== Tests unitaires (node --test) ==
TAP version 13
1..0
# Subtest: test/calc.test.js
ok 1 - test/calc.test.js
  ---
  duration_ms: 78.01149
  type: 'test'
  ...
1..0
# Subtest: test/exemple.test.js
ok 2 - test/exemple.test.js
  ---
  duration_ms: 69.198777
  type: 'test'
  ...
1..0
# Subtest: test/squelette.test.js
ok 3 - test/squelette.test.js
  ---
  duration_ms: 62.907651
  type: 'test'
  ...
1..0
# Subtest: test/store.test.js
ok 4 - test/store.test.js
  ---
  duration_ms: 59.732435
  type: 'test'
  ...
# Subtest: [T24] la ferme d'exemple a des points de vente, leurs séances et leurs débouchés, tous calculables
ok 5 - [T24] la ferme d'exemple a des points de vente, leurs séances et leurs débouchés, tous calculables
  ---
  duration_ms: 31.529652
  type: 'test'
  ...
# Subtest: [T24] effacer l'exemple efface aussi ses points de vente, séances et débouchés, et seulement eux
ok 6 - [T24] effacer l'exemple efface aussi ses points de vente, séances et débouchés, et seulement eux
  ---
  duration_ms: 6.327045
  type: 'test'
  ...
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 188.655034
== Tests de bout en bout (Playwright) ==

Running 2 tests using 1 worker

  ✓  1 test/exemple-ventes.e2e.js:4:1 › [T24] la ferme d'exemple remplit les points de vente, les séances, les débouchés et les deux vues de vente (403ms)
  ✓  2 test/exemple-ventes.e2e.js:23:1 › [T24] effacer la ferme d'exemple vide aussi les panneaux de vente, et l'exemple est proposé de nouveau (338ms)

  2 passed (1.4s)
== T24 : vérification verte ==
```
