# conversed

> **conversed** is a high-performance, composable Rich Content UI library designed for AI Agents, LLM Chat interfaces, and dynamic conversational experiences.

Instead of outputting plain text or static markdown bubbles, **conversed** parses model responses into a structured **Content Block AST (Abstract Syntax Tree)** featuring interactive tables with custom row actions, metric cards, native charts, callouts, and prompt follow-up chips.

---

## 📦 Packages in this Monorepo

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@conversed/core`](./packages/core) | `0.0.1-rc1` | Pure TypeScript AST definitions, Markdown/Stream parser engine, and Action Protocol |
| [`@conversed/angular`](./packages/angular) | `0.0.1-rc1` | Angular 17+ Signals-based UI components & block renderers |
| [`@conversed/react`](./packages/react) | `0.0.1-rc1` | React 18+ JSX components, hooks & context providers |

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

## 🚀 Quickstart

### LLM System Prompt Integration (Provider-Agnostic)

Works out-of-the-box with **OpenAI GPT-4o**, **Anthropic Claude 3.5**, **Google Gemini**, **Firebase Vertex AI**, or **DeepSeek**:

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `
You are an AI assistant.
${getSystemPromptInstruction()}
`;
```

---

### React Integration

```bash
npm install @conversed/react @conversed/core
```

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

```bash
npm install @conversed/angular @conversed/core
```

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

## 🎨 Theme Engine

Styled via standard CSS custom properties for effortless light, dark, and glassmorphic designs:

```css
:root {
  --conversed-primary: #6366f1;
  --conversed-card-bg: rgba(255, 255, 255, 0.04);
  --conversed-border-color: rgba(255, 255, 255, 0.1);
  --conversed-radius: 12px;
}
```

---

## 📄 License
MIT © [Maye Edwin](https://github.com/mayeedwin)
