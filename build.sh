#!/usr/bin/env bash
# Assemble le fichier livrable dist/index.html par simple concaténation :
# le contenu de src/index.html, dans lequel chaque balise
#   <script src="xxx.js"></script>
# est remplacée par le contenu inline de src/xxx.js.
# Aucun outil de build, aucune dépendance.
set -euo pipefail
cd "$(dirname "$0")"

SRC=src/index.html
OUT=dist/index.html
mkdir -p dist

if [ ! -f "$SRC" ]; then
  echo "$SRC absent : rien à assembler (normal avant T01)" >&2
  exit 0
fi

python3 - "$SRC" "$OUT" <<'PY'
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
html = src.read_text(encoding="utf-8")
def inline(m):
    path = src.parent / m.group(1)
    return "<script>\n" + path.read_text(encoding="utf-8") + "\n</script>"
html = re.sub(r'<script\s+src="([^"]+\.js)"\s*></script>', inline, html)
out.write_text(html, encoding="utf-8")
print(f"{out} : {out.stat().st_size} octets")
PY
