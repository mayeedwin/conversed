# conversed

> **conversed** is a high-performance, composable Rich Content UI library designed for AI Agents, LLM Chat interfaces, and dynamic conversational experiences.

▶ **Live playground (React):** [conversed-web.web.app](https://conversed-web.web.app)

Instead of outputting plain text or static markdown bubbles, **conversed** parses model responses into a structured **Content Block AST (Abstract Syntax Tree)** featuring interactive tables with custom row actions, metric cards, native charts (bar / line / pie via Chart.js), callouts, and prompt follow-up chips.

conversed **renders content, not conversations** — components take a `blocks` array and render rich blocks _inside_ your app's own message bubble. Your host app still owns roles, avatars, and the message feed. Pass `debug` to any renderer to log the raw text, parsed blocks, and emitted actions to the console (silent by default).

---

## 📦 Packages in this Monorepo

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@conversed/core`](./core) | `0.0.1-rc1` | Pure TypeScript AST definitions, Markdown/Stream parser engine, and Action Protocol |
| [`@conversed/angular`](./angular) | `0.0.1-rc1` | Angular 17+ Signals-based UI components & block renderers |
| [`@conversed/react`](./react) | `0.0.1-rc1` | React 18+ JSX components & block renderers |

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
  --conversed-primary: #0071e3;
  --conversed-text: #f8fafc;
  --conversed-radius: 12px;
}
```
