#!/usr/bin/env bash
# Vérifie une tâche (T01…) ou une tranche (N1…).
# Les tests portent l'identifiant de tâche entre crochets dans leur nom : "[T04] …".
# Une tranche lance tous les tests sans filtre.
# Les tests unitaires sont désignés par motif (test/*.test.js) : Node 22 refuse un dossier
# en argument de --test, et le motif écarte les tests Playwright (*.e2e.js).
set -euo pipefail
cd "$(dirname "$0")"

ID="${1:-}"
if [ -z "$ID" ]; then
  echo "usage : ./verify.sh <T01|…|N1|…>" >&2
  exit 2
fi

case "$ID" in
  T*) FILTER="\\[$ID\\]" ;;
  N*) FILTER="" ;;
  *)  echo "identifiant inconnu : $ID" >&2; exit 2 ;;
esac

echo "== Assemblage de dist/index.html =="
./build.sh

echo "== Tests unitaires (node --test) =="
if ls test/*.test.js >/dev/null 2>&1; then
  if [ -n "$FILTER" ]; then
    node --test --test-name-pattern="$FILTER" test/*.test.js
  else
    node --test test/*.test.js
  fi
else
  echo "aucun test unitaire dans test/ : échec" >&2
  exit 1
fi

echo "== Tests de bout en bout (Playwright) =="
if ls test/*.e2e.js >/dev/null 2>&1 || ls test/*.spec.js >/dev/null 2>&1; then
  if [ -n "$FILTER" ]; then
    npx playwright test --grep "$FILTER"
  else
    npx playwright test
  fi
else
  echo "aucun test de bout en bout dans test/ : échec" >&2
  exit 1
fi

echo "== $ID : vérification verte =="
