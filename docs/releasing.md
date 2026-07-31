# Releasing

How `@conversed/core`, `@conversed/react`, and `@conversed/angular` get published to npm.

## TL;DR

Releases are **tag-triggered**. Merging PRs to `main` does *not* publish anything — only pushing a `v*` git tag fires [`.github/workflows/release.yml`](../.github/workflows/release.yml), which builds, tests, and publishes all three packages together.

```bash
./scripts/bump-version.sh 0.0.1-rc.14   # bumps every package.json + cross-deps
pnpm install --lockfile-only
git commit -am "chore(release): prep 0.0.1-rc.14"
# → PR → merge to main
git checkout main && git pull
git tag v0.0.1-rc.14
git push origin v0.0.1-rc.14            # this line is what publishes
```

## Model

- **Every merge is safe.** You can merge twenty PRs and no release happens. Releases are always a deliberate act — pushing the tag.
- **All three packages move together.** Their versions are always in lockstep, and `@conversed/react` / `@conversed/angular` pin `@conversed/core` to the exact version they ship with. The bump script keeps this invariant true.
- **Dist-tag is derived from the tag name**, not from a workflow input:
  - `v0.0.1-rc.14` (any tag with a `-` prerelease) → `npm dist-tag: rc`
  - `v0.1.0` → `npm dist-tag: latest`
- **Provenance is on** — every publish carries an [npm provenance statement](https://docs.npmjs.com/generating-provenance-statements) linking the tarball to this repo, commit, and workflow run.

## Auth: Trusted Publishing (OIDC)

CI does not use an `NPM_TOKEN` secret. Each `@conversed/*` package is configured on npmjs.com to trust this repo's `release.yml` workflow ([npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers)). GitHub Actions mints a short-lived OIDC token per run; npm verifies it and lets the publish through. Nothing to rotate.

If you add a new `@conversed/*` package, wire up its Trusted Publisher on npm before the first release:

> Package page → **Settings → Publishing access → Trusted Publisher → Add** → GitHub Actions → org `mayeedwin` / repo `conversed` / workflow `release.yml`.

## Step-by-step

### 1. Bump versions

```bash
./scripts/bump-version.sh 0.0.1-rc.14
```

This rewrites the `version` field in the root `package.json` and all three package `package.json` files, and updates the pinned `@conversed/core` dependency in `packages/react/package.json` and `packages/angular/package.json`. Verify with `git diff`.

Refresh the lockfile without reinstalling:

```bash
pnpm install --lockfile-only
```

### 2. PR the bump

Standard flow: branch (`chore/release-rc-14`), commit as `chore(release): prep 0.0.1-rc.14`, open a PR, get it merged.

### 3. Tag and push

Once the bump is on `main`:

```bash
git checkout main && git pull
git tag v0.0.1-rc.14
git push origin v0.0.1-rc.14
```

The workflow starts. It:

1. Installs deps, resolves the version + dist-tag from the tag.
2. **Guards against drift** — fails fast if any `package.json` version disagrees with the tag, or if a cross-dep is stale.
3. Builds all packages (`pnpm run build`).
4. Runs tests (`pnpm run test`).
5. `npm publish --provenance` for `core`, then `angular` (from `packages/angular/dist`), then `react`.
6. Creates a GitHub Release from the tag, marked as prerelease when dist-tag is `rc`.

If any step fails, nothing downstream runs — but note that publishes are ordered, so if `core` succeeded and `angular` failed, `core` is out and you'll need to either fix the failure and re-tag with a bumped patch, or unpublish (npm allows this within 72h for freshly published versions).

## What triggers the workflow (and what doesn't)

`release.yml` listens on `on: push: tags: ['v*']` and `workflow_dispatch`. That's the whole surface. In practice:

- **`git push origin v0.0.1-rc.14` — yes, publishes.** This is the intended path.
- **"Draft a new release" in the GitHub UI — technically yes, but avoid it.** Creating a Release via the UI also creates the underlying tag, which fires the workflow. But the workflow then tries to create its *own* Release for that tag — `softprops/action-gh-release` updates the existing one instead of erroring, which means your handwritten notes get overwritten by the auto-generated ones. Push the tag from your terminal and let CI cut the Release for you.
- **Merging a PR to `main` — no.** Merges never publish. The tag push is the only publishing event.
- **`workflow_dispatch` (Actions → Run workflow) — yes**, and this is how you smoke-test with `dry_run: true`. A dispatch with `dry_run: false` would publish for real from whatever the branch's `package.json` says the version is, so use it deliberately or leave `dry_run: true`.

If you'd rather drive releases from the GitHub UI (write your own notes, click Publish), we can flip the trigger to `on: release: types: [published]` instead. Ask if you want that.

## Smoke test: dry run

Before trusting a real tag, run the workflow manually with `dry_run: true`:

> **Actions → Release → Run workflow** → pick the branch → `dry_run: true` → Run.

It exercises every step and runs `npm publish --dry-run` for all three packages. Green run = OIDC trust is wired correctly on npm and the pipeline works end-to-end. Nothing is published.

## Manual emergency path

If CI is down and a release absolutely must go out, [`scripts/release.sh`](../scripts/release.sh) still works locally:

```bash
npm login                    # once per session
./scripts/release.sh rc      # or: ./scripts/release.sh latest
```

This skips provenance (local `npm publish` can't mint the OIDC token) and requires you to hold publish rights directly. Prefer CI.

## Version scheme

- **Prereleases**: `0.0.1-rc.N` while the API was shaking out. Published under the `rc` dist-tag; consumers opted in with `npm install @conversed/core@rc`.
- **First stable**: `0.0.1` — promotes the rc line to `latest`. Semver-wise, `0.0.1` > `0.0.1-rc.13` because prereleases sort below their base version, so this is a clean promotion with no version-number gymnastics.
- **After stable**: standard [semver](https://semver.org/) — patch for fixes, minor for additive changes, major for breaks. Next expected: `0.0.2` for a fix, or `0.1.0` for the first additive change.
