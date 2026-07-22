---
name: conversed-guide
description: Developer guide and architecture rules for building and extending conversed monorepo packages.
---

# Conversed Agent Skill Guide

When contributing or refactoring code in `conversed`:

1. Keep core AST block types in `packages/core/src/types.ts`.
2. Ensure new HTML element parsing logic is registered in `packages/core/src/parser.ts` or `packages/core/src/registry.ts`.
3. When updating Angular or React block renderers, ensure both framework packages maintain parity.
4. Verify all builds pass via `pnpm build` before submitting PRs.
