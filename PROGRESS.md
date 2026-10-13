# PROGRESS — journal de progression

Une entrée par session : date, tâche, modèle et effort utilisés, nombre de reprises, verdict de l'évaluateur (si relecture), résultat, preuve (sortie de `./verify.sh`), commit.
L'agent ajoute en bas ; il ne réécrit jamais les entrées précédentes.

Tranche en cours : N1 · Sessions consommées : 1 / 15 (seuil d'alerte)

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
