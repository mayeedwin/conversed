# Contributing to Conversed

Thank you for your interest in contributing to **conversed**! We welcome bug fixes, documentation improvements, and feature requests.

---

## 🛠️ Local Development Setup

### 1. Clone the repository:
```bash
git clone https://github.com/mayeedwin/conversed.git
cd conversed
```

### 2. Install dependencies:
```bash
pnpm install
```

### 3. Build all packages:
```bash
pnpm build
```

---

## 📦 Package Architecture

- [`packages/core`](./packages/core): Pure TypeScript AST definitions, Markdown/Stream parser engine, and Action Protocol.
- [`packages/angular`](./packages/angular): Angular 17+ Signals-based UI components & block renderers.
- [`packages/react`](./packages/react): React 18+ JSX components & block renderers.

---

## 🔗 Consuming Conversed in an App: Local Build vs Published Package

When you develop against Conversed from another app (e.g. your product), you want
**localhost to run your local build** and **production to use the published npm
package**. Because resolution is decided at install time, you switch the dependency
per environment.

### Why `link:`, not `file:`

The framework packages import `@conversed/core` at runtime. `file:` **copies** a
package into the consumer's store, severing it from this monorepo — so
`@conversed/angular`'s transitive `@conversed/core` resolves to the *published* core,
not your local build (stale theme, stale API).

`link:` **symlinks** to the real package directory, so the transitive
`@conversed/core` resolves *inside this workspace* to your local build (via
`linkWorkspacePackages: true` in `pnpm-workspace.yaml`). Always use `link:` for local
consumption.

> Cross-package deps are pinned to exact versions (e.g. `"@conversed/core":
> "0.0.1-rc.3"`), never `file:../core` or `workspace:*`. Exact versions link locally
> via `linkWorkspacePackages` **and** stay correct for `npm publish` (which does not
> rewrite the `workspace:` protocol).

### Local development (localhost → local build)

In the consuming app's `package.json`:

```json
{
  "dependencies": {
    "@conversed/core": "link:../path/to/conversed/packages/core",
    "@conversed/angular": "link:../path/to/conversed/packages/angular"
  }
}
```

```bash
# in the consuming app
pnpm install
```

Iterating on the library after that is fast — no reinstall needed:

```bash
# in this repo, after editing the lib
pnpm build
# then in the consuming app: clear framework caches and restart the dev server
```

### Production (deploy → published package)

Publish the packages, then point the consuming app at the published versions:

```bash
# in this repo, once per release
pnpm build
pnpm --filter @conversed/core --filter @conversed/angular --filter @conversed/react publish
```

```json
{
  "dependencies": {
    "@conversed/core": "^0.0.1-rc.3",
    "@conversed/angular": "^0.0.1-rc.3"
  }
}
```

CI and production run a plain `pnpm install` and resolve everything from npm. Keep the
`link:` entries out of committed production config — they are machine-relative and
resolve only where this repo sits alongside the consuming app.

---

## 📜 Git & Commit Conventions

Please follow our [Git & Workflow Conventions](./docs/GIT_WORKFLOW.md):
- **Branch Naming**: `type/short-description` (e.g. `feature/block-ast-parser`, `fix/table-action`).
- **Commit Format**: `type(scope): #issue_number description` where `scope` strictly matches your branch name.

---

## 📜 Pull Request Guidelines

1. Ensure code compiles cleanly (`pnpm build`).
2. Follow strict TypeScript typing (avoid `any`).
3. Keep commits atomic and clearly described.
