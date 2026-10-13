# PROGRESS — journal de progression

Une entrée par session : date, tâche, modèle et effort utilisés, nombre de reprises, verdict de l'évaluateur (si relecture), résultat, preuve (sortie de `./verify.sh`), commit.
L'agent ajoute en bas ; il ne réécrit jamais les entrées précédentes.

Tranche en cours : N1 · Sessions consommées : 3 / 15 (seuil d'alerte)

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
