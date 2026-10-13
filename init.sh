#!/usr/bin/env bash
# Prépare l'environnement de développement. Relançable sans effet de bord.
set -euo pipefail
cd "$(dirname "$0")"

echo "== Node =="
node --version

if [ -f package.json ]; then
  if [ ! -d node_modules ]; then
    echo "== Installation des dépendances de développement =="
    npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund
  fi
  if [ ! -d "${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}" ] && [ -z "${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-}" ]; then
    echo "== Navigateur Playwright =="
    npx playwright install chromium
  fi
fi

mkdir -p dist test src
echo "== Prêt. Prochaine étape : ./verify.sh <ID> =="
