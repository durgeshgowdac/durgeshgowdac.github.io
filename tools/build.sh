#!/usr/bin/env bash
# Rebuild all the art, and the three docs that show it, from the SVG components. Run from anywhere.
#   tools/build.sh                  everything: parts, sheets, scenes, docs
#   tools/build.sh parts            every part (both themes) as SVG, plus PNGs of the characters, and the cutaways
#   tools/build.sh sheets           the group sheets and the character contact sheets
#   tools/build.sh scenes           photograph the scenes   (add --no-bg for transparent strips)
#   tools/build.sh docs             rewrite characters.md, illustrations.md and scenes.md (repo root), and check they match the code
# Steps can be combined: tools/build.sh parts sheets docs
# The first run creates a Python virtualenv in .venv/ and installs Playwright + Chromium into it.
set -euo pipefail
cd "$(dirname "$0")/.."

STEPS=(); FLAGS=()
for a in "$@"; do case "$a" in --*) FLAGS+=("$a") ;; *) STEPS+=("$a") ;; esac; done
[ ${#STEPS[@]} -eq 0 ] && STEPS=(parts sheets scenes docs)

if [ ! -f .venv/.art-ready ]; then
  echo "Creating .venv ..."
  python3 -m venv .venv
  .venv/bin/pip install --quiet --upgrade pip
  .venv/bin/pip install --quiet playwright
  .venv/bin/playwright install chromium
  touch .venv/.art-ready
fi
if [ -f .gitignore ] && ! grep -qx '\.venv/\?' .gitignore; then echo '.venv/' >> .gitignore; fi

# One bundle holds every drawing and every scene (registry.tsx), so a part is rendered once and reused everywhere.
B=tools/.build; mkdir -p "$B"
npx --yes esbuild tools/registry.tsx --bundle --platform=node --format=cjs --jsx=automatic --tsconfig=tsconfig.json \
  --alias:@/app/components/useReducedMotion=./tools/still.ts --outfile="$B/art.cjs" --log-level=error
OUT_JSON="$B/art.json" node "$B/art.cjs" 2> >(grep -v "incorrect casing" >&2)

RENDER=(); DOCS=0
for s in "${STEPS[@]}"; do case "$s" in docs) DOCS=1 ;; parts|sheets|scenes) RENDER+=("$s") ;; *) echo "unknown step: $s" >&2; exit 2 ;; esac; done
[ ${#RENDER[@]} -gt 0 ] && .venv/bin/python tools/render.py "${RENDER[@]}" ${FLAGS[@]+"${FLAGS[@]}"}
[ "$DOCS" = 1 ] && .venv/bin/python tools/build_art.py
exit 0