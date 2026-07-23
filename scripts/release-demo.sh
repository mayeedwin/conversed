#!/usr/bin/env bash
set -euo pipefail

# conversed React demo — deploy to Firebase Hosting
#
# The hosting config lives in firebase.json at the repo root:
#   - "hosting.site" = "conversed-web" (the project's default site -> conversed-web.web.app)
#   - "predeploy" runs the demo build (pnpm --filter @conversed/demo-react build)
#
# The default project is set in .firebaserc (conversed-web). Override it with a
# CLI arg (pnpm release:demo other-project) or $FIREBASE_PROJECT if needed.

PROJECT="${1:-${FIREBASE_PROJECT:-}}"

echo "=========================================="
echo " Deploying @conversed/demo-react to Firebase Hosting"
echo "=========================================="

if [ -n "$PROJECT" ]; then
  echo "-> Project: ${PROJECT}"
  firebase deploy --only hosting --project "${PROJECT}"
else
  echo "-> Project: (default from .firebaserc / active CLI project)"
  firebase deploy --only hosting
fi

echo ""
echo "=========================================="
echo " Demo deployed → https://conversed-web.web.app"
echo "=========================================="
