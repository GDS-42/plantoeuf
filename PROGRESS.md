# PROGRESS — journal de progression

Une entrée par session : date, tâche, modèle et effort utilisés, nombre de reprises, verdict de l'évaluateur (si relecture), résultat, preuve (sortie de `./verify.sh`), commit.
L'agent ajoute en bas ; il ne réécrit jamais les entrées précédentes.

Tranche en cours : N1 · Sessions consommées : 9 / 15 (seuil d'alerte)

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
