# @conversed/angular

> Angular 17+ Signals-based components for **conversed** rich AI chat UI.

▶ **Live playground:** [conversed-web.web.app](https://conversed-web.web.app) (React build)

## Install

```bash
pnpm add @conversed/angular @conversed/core
```

Styles are inlined — zero CSS setup. Charts render via **Chart.js** (a dependency, installed automatically).

## Usage

Conversed renders **content, not conversations** — parse the reply and drop `<conversed-content>` inside your own bubble:

```html
<div class="my-chat-bubble assistant">
  <conversed-content
    [blocks]="blocks()"
    primaryColor="#0071e3"
    variant="filled"
    (action)="onAction($event)">
  </conversed-content>
</div>
```

```ts
blocks = computed(() => parseMessageBlocks(this.rawAiResponse()));
```

- `<conversed-content>` inputs: `[blocks]`, `[primaryColor]` (`#0071e3`), `[theme]`, `[variant]` (`'flat'` | `'filled'`), `[debug]`; output `(action)`.
- `<conversed-block [block]>` renders a single block anywhere.

## System prompt

`parseMessageBlocks` only works if the model actually emits conversed content — so teach it at the **prompt level**. Append `getSystemPromptInstruction()` (from `@conversed/core`) to your system prompt, optionally declaring the custom actions the model may trigger:

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `You are an AI assistant.
${getSystemPromptInstruction({
  allowedActions: [
    { actionId: 'view-detail', description: 'Deep link to item detail', exampleParams: { id: '123' } }
  ]
})}`;
```

Those `allowedActions` come back to you via the `(action)` output. Omit the argument for the base spec.

## Docs

[github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed) · [Frameworks guide](../../docs/frameworks.md)

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
