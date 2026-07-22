#!/usr/bin/env bash
set -e

# conversed Multi-Package Release Script

TAG="${1:-rc}"

echo "=========================================="
echo " Building all packages..."
echo "=========================================="
npm run build

echo ""
echo "=========================================="
echo " Publishing packages to npm with tag: ${TAG}"
echo "=========================================="

echo "-> Publishing @conversed/core..."
(cd packages/core && npm publish --access public --tag "${TAG}")

echo "-> Publishing @conversed/angular..."
(cd packages/angular && npm publish --access public --tag "${TAG}")

echo "-> Publishing @conversed/react..."
(cd packages/react && npm publish --access public --tag "${TAG}")

echo ""
echo "=========================================="
echo " All packages published successfully!"
echo "=========================================="
