#!/bin/bash
# Smoke test: verify build output exists after `npm run build`
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== SSH Client Build Health Check ==="

REQUIRED_DIRS=(
  "out/main"
  "out/preload"
  "out/renderer"
)

REQUIRED_FILES=(
  "out/main/index.js"
  "out/preload/index.js"
  "out/renderer/index.html"
)

PASS=0
FAIL=0

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir"
    PASS=$((PASS + 1))
  else
    echo "❌ MISSING: $dir"
    FAIL=$((FAIL + 1))
  fi
done

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
    PASS=$((PASS + 1))
  else
    echo "❌ MISSING: $file"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Result: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
  echo "❌ Health check FAILED"
  exit 1
fi

echo "✅ Health check PASSED"
