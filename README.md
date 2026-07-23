# Conversed

A high-performance, composable Rich Content UI library for AI Agents and LLM chat interfaces.

## Overview

Standard AI chat interfaces render static text or basic Markdown. When models generate structured data like tables, metric cards, callouts, or charts, plain text renderers fail to provide interactive UX.

**Conversed** solves this by parsing model responses into a structured **Content Block AST (Abstract Syntax Tree)**.

### Key Capabilities
- **Interactive Action Protocol**: Attach custom action triggers (e.g. `view-detail`, `approve-transaction`) directly to table rows, metric cards, and prompt chips.
- **Native Charts**: Render bar, line, and pie charts (via Chart.js) directly from model output — no manual chart wiring.
- **Standalone Component Rendering**: Render individual rich blocks anywhere in custom application layouts (dashboards, side drawers, modals) without being constrained to a chat feed container.
- **Provider-Agnostic Engine**: Works with OpenAI, Anthropic Claude, Google Gemini, Firebase Vertex AI, or local models via standard HTML/Markdown parsing.
- **Zero-Config Theming**: Theme components using a single `primaryColor` prop or custom CSS variables.
- **Built-in Debug Mode**: Pass `debug` to log the raw text, parsed blocks, and emitted actions to the console (silent by default).

---

## Packages

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@conversed/core`](./packages/core) | `0.0.1-rc.1` | Pure TypeScript AST definitions, stream parser engine, and Action Protocol |
| [`@conversed/angular`](./packages/angular) | `0.0.1-rc.1` | Angular 17+ Signals-based UI components and block renderers |
| [`@conversed/react`](./packages/react) | `0.0.1-rc.1` | React 18+ JSX components and block renderers |

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

> Conversed renders **content, not conversations**. It never owns roles, avatars,
> or message bubbles — you drop `<ConversedContent>` inside your existing chat's
> assistant bubble and hand it the parsed blocks. Its only input is `blocks`.

### React

```tsx
// Import the stylesheet once at your app root (React ships CSS separately).
import '@conversed/react/styles.css';
import { ConversedContent } from '@conversed/react';
import { parseMessageBlocks } from '@conversed/core';

export const AssistantBubble = ({ rawAiResponse }: { rawAiResponse: string }) => {
  const blocks = parseMessageBlocks(rawAiResponse);

  return (
    // Your own chat bubble — Conversed only fills the content.
    <div className="my-chat-bubble assistant">
      <ConversedContent
        blocks={blocks}
        primaryColor="#0071e3"
        onAction={(e) => console.log('Action:', e.action)}
        debug
      />
    </div>
  );
};
```

### Angular

```typescript
import { Component, computed, input } from '@angular/core';
import { ConversedContentComponent } from '@conversed/angular';
import { parseMessageBlocks, AgentActionEvent } from '@conversed/core';

@Component({
  selector: 'app-assistant-bubble',
  standalone: true,
  imports: [ConversedContentComponent],
  template: `
    <!-- Your own chat bubble — Conversed only fills the content. -->
    <div class="my-chat-bubble assistant">
      <conversed-content
        [blocks]="blocks()"
        primaryColor="#0071e3"
        [debug]="true"
        (action)="onAction($event)">
      </conversed-content>
    </div>
  `
})
export class AssistantBubbleComponent {
  rawAiResponse = input.required<string>();
  blocks = computed(() => parseMessageBlocks(this.rawAiResponse()));

  onAction(event: AgentActionEvent) {
    console.log('Action triggered:', event.action);
  }
}
```

---

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
