# conversed

> **conversed** is a high-performance, composable Rich Content UI library designed for AI Agents, LLM Chat interfaces, and dynamic conversational experiences.

Instead of outputting plain text or static markdown bubbles, **conversed** parses model responses into a structured **Content Block AST (Abstract Syntax Tree)** featuring interactive tables with custom row actions, metric cards, native charts, callouts, and prompt follow-up chips.

---

## 📦 Packages in this Monorepo

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@conversed/core`](./core) | `0.0.1-rc1` | Pure TypeScript AST definitions, Markdown/Stream parser engine, and Action Protocol |
| [`@conversed/angular`](./angular) | `0.0.1-rc1` | Angular 17+ Signals-based UI components & block renderers |
| [`@conversed/react`](./react) | `0.0.1-rc1` | React 18+ JSX components, hooks & context providers |

---

## ⚡ Core Concept: Action Protocol

Interactive elements inside blocks (table buttons, metric cards, follow-up chips, links) trigger standardized actions via `AgentActionEvent`:

```typescript
export type ActionTriggerType =
  | 'navigate'       // Routing trigger
  | 'custom-command' // App-defined domain action (e.g., complete task, update status)
  | 'prompt-submit'  // Prompt action (e.g., click follow-up chip)
  | 'copy-code'      // Copy snippet content
  | 'external-url';  // Open external web link

export interface AgentActionPayload<T = unknown> {
  type: ActionTriggerType;
  actionId: string;
  target?: string;
  params?: Record<string, T>;
}
```

---

## 🎨 Theme Engine

Styled via standard CSS custom properties for effortless light, dark, and glassmorphic designs:

```css
:root {
  --conversed-bg: #0f172a;
  --conversed-card-bg: #1e293b;
  --conversed-primary: #6366f1;
  --conversed-text: #f8fafc;
  --conversed-radius: 12px;
}
```
