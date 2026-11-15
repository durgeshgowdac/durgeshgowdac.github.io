#!/usr/bin/env bash
# Re-render every character in cast/ from the SVG components. Run from anywhere.
# First run creates a Python virtualenv in .venv/ and installs Playwright + Chromium into it.
set -euo pipefail
cd "$(dirname "$0")/../.."

if [ ! -f .venv/.cast-ready ]; then
  echo "Creating .venv ..."
  python3 -m venv .venv
  .venv/bin/pip install --quiet --upgrade pip
  .venv/bin/pip install --quiet playwright
  .venv/bin/playwright install chromium
  touch .venv/.cast-ready
fi
if [ -f .gitignore ] && ! grep -qx '\.venv/\?' .gitignore; then echo '.venv/' >> .gitignore; fi

B=tools/cast/.build; mkdir -p "$B"
npx --yes esbuild tools/cast/render-cast.tsx --bundle --platform=node --format=cjs \
  --jsx=automatic --tsconfig=tsconfig.json --outfile="$B/bundle.cjs" --log-level=error
OUT_JSON="$B/parts.json" node "$B/bundle.cjs" 2>/dev/null
.venv/bin/python tools/cast/export.py
