#!/usr/bin/env bash
set -euo pipefail

# Bump the monorepo to a new version.
#
# Updates the version field in the root and every publishable package,
# and rewrites the pinned "@conversed/core" cross-deps in react/angular
# so all four package.json files stay in lockstep.
#
# Usage: scripts/bump-version.sh <version>
#   scripts/bump-version.sh 0.0.1-rc.14
#   scripts/bump-version.sh 0.1.0

VERSION="${1:-}"
if [[ -z "${VERSION}" ]]; then
  echo "usage: $0 <version>" >&2
  exit 2
fi

# Loose semver check — accepts prerelease/build metadata.
if ! [[ "${VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$ ]]; then
  echo "error: '${VERSION}' does not look like a semver version" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

FILES=(
  "${ROOT}/package.json"
  "${ROOT}/packages/core/package.json"
  "${ROOT}/packages/react/package.json"
  "${ROOT}/packages/angular/package.json"
)

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || { echo "error: missing $f" >&2; exit 1; }
done

node - "$VERSION" "${FILES[@]}" <<'NODE'
const fs = require('fs');
const [, , version, ...files] = process.argv;

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const pkg = JSON.parse(raw);
  pkg.version = version;

  for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const deps = pkg[key];
    if (!deps) continue;
    if (deps['@conversed/core']) deps['@conversed/core'] = version;
    if (deps['@conversed/react']) deps['@conversed/react'] = version;
    if (deps['@conversed/angular']) deps['@conversed/angular'] = version;
  }

  // Preserve trailing newline if the file had one.
  const trailingNewline = raw.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + trailingNewline);
  console.log(`  bumped ${file} -> ${version}`);
}
NODE

echo ""
echo "Bumped all packages to ${VERSION}."
echo "Next: pnpm install --lockfile-only, commit, and tag v${VERSION}."
