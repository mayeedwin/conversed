# Conversed

A high-performance, composable Rich Content UI library for AI Agents and LLM chat interfaces.

▶ **Live playground (React):** [conversed-web.web.app](https://conversed-web.web.app) — try the blocks and the Action Inspector in a live chat console.

## Overview

Most AI chat interfaces render static text or basic Markdown. But models don't just talk — they generate structured data: tables, metric cards, callouts, charts. A plain-text renderer can't make any of that feel interactive.

**Conversed** parses model responses into a structured **Content Block AST (Abstract Syntax Tree)**, then renders each block as a real, interactive UI component — a table row you can act on, a metric card you can click, a chart drawn straight from the model's output. Works with Claude, OpenAI, Gemini, Firebase Vertex AI, or local models, and it renders **content, not conversations**: drop it inside your existing chat's assistant bubble and hand it the parsed blocks.

### Key Capabilities
- **Interactive Action Protocol**: Attach custom action triggers (e.g. `view-detail`, `approve-transaction`) directly to table rows, metric cards, and prompt chips.
- **Native Charts**: Render bar, line, and pie charts (via Chart.js) directly from model output — no manual chart wiring.
- **Standalone Component Rendering**: Render individual rich blocks anywhere in custom application layouts (dashboards, side drawers, modals) without being constrained to a chat feed container.
- **Provider-Agnostic Engine**: Works with OpenAI, Anthropic Claude, Google Gemini, Firebase Vertex AI, or local models via standard HTML/Markdown parsing.
- **Zero-Config Theming**: Theme components using a single `primaryColor` prop or custom CSS variables.
- **Built-in Debug Mode**: Pass `debug` to log the raw text, parsed blocks, and emitted actions to the console (silent by default).

---

## Demo

Play with it live at **[conversed-web.web.app](https://conversed-web.web.app)**.

A React chat demo lives in [`demos/react-demo`](./demos/react-demo) — it renders every block type
and shows a live **Action Inspector** for the Action Protocol. This is a **pnpm workspace**, so run
it with pnpm from the repo root (npm can't resolve the `workspace:` deps):

```bash
pnpm install
pnpm --filter @conversed/demo-react dev
```

See the [demo README](./demos/react-demo/README.md) for build and Firebase Hosting deployment.

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

## Documentation

- [Architecture & AST Specification](./docs/architecture.md)
- [Git & Workflow Conventions](./docs/git_workflow.md)
- [LLM System Prompt Guide](./docs/prompts.md)
- [Angular & React Integration](./docs/frameworks.md)
- [Theming & Design Tokens](./docs/theming.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [AI Agent Specification](./AGENTS.md)

---

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
