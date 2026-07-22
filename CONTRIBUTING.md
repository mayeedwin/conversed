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

## 📜 Pull Request Guidelines

1. Ensure code compiles cleanly (`pnpm build`).
2. Follow strict TypeScript typing (avoid `any`).
3. Keep commits atomic and clearly described.
