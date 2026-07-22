# Conversed

A high-performance, composable Rich Content UI library for AI Agents and LLM chat interfaces.

## Overview

Standard AI chat interfaces render static text or basic Markdown. When models generate structured data like tables, metric cards, callouts, or charts, plain text renderers fail to provide interactive UX.

**Conversed** solves this by parsing model responses into a structured **Content Block AST (Abstract Syntax Tree)**.

### Key Capabilities
- **Interactive Action Protocol**: Attach custom action triggers (e.g. `view-detail`, `approve-transaction`) directly to table rows, metric cards, and prompt chips.
- **Standalone Component Rendering**: Render individual rich blocks anywhere in custom application layouts (dashboards, side drawers, modals) without being constrained to a chat feed container.
- **Provider-Agnostic Engine**: Works with OpenAI, Anthropic Claude, Google Gemini, Firebase Vertex AI, or local models via standard HTML/Markdown parsing.
- **Zero-Config Theming**: Theme components using a single `primaryColor` prop or custom CSS variables.

---

## Packages

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@conversed/core`](./packages/core) | `0.0.1-rc1` | Pure TypeScript AST definitions, stream parser engine, and Action Protocol |
| [`@conversed/angular`](./packages/angular) | `0.0.1-rc1` | Angular 17+ Signals-based UI components and block renderers |
| [`@conversed/react`](./packages/react) | `0.0.1-rc1` | React 18+ JSX components and block renderers |

---

## Documentation

- [Architecture & AST Specification](./docs/ARCHITECTURE.md)
- [Git & Workflow Conventions](./docs/GIT_WORKFLOW.md)
- [LLM System Prompt Guide](./docs/PROMPTS.md)
- [Angular & React Integration](./docs/FRAMEWORKS.md)
- [Theming & Design Tokens](./docs/THEMING.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [AI Agent Specification](./AGENTS.md)

---

## Quickstart

### LLM System Prompt

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `
You are an AI assistant.
${getSystemPromptInstruction()}
`;
```

### React

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

### Angular

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

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
