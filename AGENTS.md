# Conversed AI Coding Assistant Guidelines

This repository is a monorepo for **conversed**, a high-performance, composable Rich Content UI library for AI Agents and LLM Chat interfaces.

---

## 🏗️ Repository Architecture

```
conversed/
├── packages/
│   ├── core/      # Pure TypeScript AST, Parser Engine, Stream Accumulator & Action Protocol
│   ├── angular/   # Angular 17+ Signals-based components & standalone block renderers
│   └── react/     # React 18+ components & standalone block renderers
├── docs/          # Technical specifications, Architecture, LLM Prompt & Theming guides
└── .docs/         # Agentic skills & developer context
```

---

## 🎯 Key Design Constraints

1. **Framework Independence**: All AST structures and parsing logic MUST remain inside `@conversed/core`. Never add framework-specific dependencies to `@conversed/core`.
2. **Provider-Agnostic**: `@conversed` must work with any LLM (OpenAI, Gemini, Claude, Firebase, Ollama) without provider lock-in.
3. **Un-trumped Composability**: Components must support standalone rendering (`<conversed-block>` / `<ConversedBlock>`) so developers can embed them anywhere in custom UIs.
4. **Zero-Config Theming**: Support 1-line `primaryColor` styling while exposing CSS variables for advanced theme overrides.

---

## 🛠️ Build Commands

```bash
# Build all monorepo packages
pnpm build

# Build individual package
pnpm --filter @conversed/core build
```
