# conversed

> **conversed** is a high-performance, composable Rich Content UI library designed for AI Agents, LLM Chat interfaces, and dynamic conversational experiences.

### What Problem Does Conversed Solve?
Standard AI chat components render static markdown text or plain chat bubbles. When LLMs generate complex data (tables, metric cards, callouts, or charts), standard parsers fail to make them interactive.

**conversed** bridges this gap by parsing model responses into a structured **Content Block AST (Abstract Syntax Tree)**. It allows developers to:
- Render interactive tables with custom row action triggers (e.g. "Approve Transaction", "View Detail").
- Embed metric/stats cards, callouts, native charts, and prompt chips directly into AI streams.
- Render standalone rich blocks anywhere in custom application layouts (dashboards, drawers, modals) without being forced into a fixed chat feed container.
- Theme components instantly using a single `primaryColor` prop or CSS design tokens.

---

## 📚 Documentation & Guides

- 📐 [**Architecture & AST Protocol**](./docs/ARCHITECTURE.md) — AST Block types, Action event model, and Stream Accumulator.
- 🔀 [**Git & Workflow Conventions**](./docs/GIT_WORKFLOW.md) — Branch naming, commit message scope rules, and PR guidelines.
- 🤖 [**LLM System Prompt Guide**](./docs/PROMPTS.md) — Provider-agnostic prompt setup for OpenAI, Gemini, Claude & Firebase Vertex AI.
- ⚛️ [**Angular & React Integration**](./docs/FRAMEWORKS.md) — Standalone block rendering & chat feed usage guide.
- 🎨 [**Theming & Design Tokens**](./docs/THEMING.md) — Single-line primary color and CSS variable overrides.
- 🤝 [**Contribution Guide**](./CONTRIBUTING.md) — Development workflow and setup instructions.
- 🤖 [**AI Agent Guide**](./AGENTS.md) — Architectural guidelines for AI coding assistants.

---

## 📦 Packages in this Monorepo

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@conversed/core`](./packages/core) | `0.0.1-rc1` | Pure TypeScript AST definitions, Markdown/Stream parser engine, and Action Protocol |
| [`@conversed/angular`](./packages/angular) | `0.0.1-rc1` | Angular 17+ Signals-based UI components & block renderers |
| [`@conversed/react`](./packages/react) | `0.0.1-rc1` | React 18+ JSX components, hooks & context providers |

---

## 🚀 Quickstart

### LLM System Prompt Integration

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `
You are an AI assistant.
${getSystemPromptInstruction()}
`;
```

---

### React Integration

```tsx
import React from 'react';
import { ConversedFeed, ConversedBlock } from '@conversed/react';
import { parseMessageBlocks } from '@conversed/core';

export const ChatApp = () => {
  const blocks = parseMessageBlocks(rawAiResponse);

  return (
    <ConversedFeed
      messages={messages}
      primaryColor="#6366f1"
      onAction={(e) => console.log('Action:', e.action)}
    />
  );
};
```

---

### Angular Integration

```typescript
import { Component, signal } from '@angular/core';
import { ConversedFeedComponent } from '@conversed/angular';
import { ConversedMessage, AgentActionEvent } from '@conversed/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ConversedFeedComponent],
  template: `
    <conversed-feed
      [messages]="messages()"
      primaryColor="#6366f1"
      (action)="onAction($event)">
    </conversed-feed>
  `
})
export class ChatComponent {
  messages = signal<ConversedMessage[]>([]);

  onAction(event: AgentActionEvent) {
    console.log('Action triggered:', event.action);
  }
}
```

---

## 📄 License
MIT © [Maye Edwin](https://github.com/mayeedwin)
