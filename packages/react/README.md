# @conversed/react

> React 18+ components for **conversed** rich AI chat UI.

▶ **Live playground:** [conversed-web.web.app](https://conversed-web.web.app) — built with this package.

## Install

```bash
pnpm add @conversed/react @conversed/core
```

Import the stylesheet once at your app root (required — blocks are unstyled without it):

```tsx
import '@conversed/react/styles.css';
```

It's driven by `--conversed-*` variables, so `primaryColor` / `theme` props and your own `:root` overrides restyle everything. See [Theming](../../docs/theming.md).

## Usage

Conversed renders **content, not conversations** — parse the reply and render inside your own bubble:

```tsx
import { ConversedContent } from '@conversed/react';
import { parseMessageBlocks } from '@conversed/core';

<ConversedContent
  blocks={parseMessageBlocks(reply)}
  primaryColor="#0071e3"
  onAction={(e) => console.log(e.action)}
/>;
```

- `<ConversedContent>` props: `blocks`, `primaryColor?` (`#0071e3`), `theme?`, `variant?` (`'flat'` \| `'filled'`), `onAction?`, `debug?`.
- `<ConversedBlock block />` renders a single block anywhere (dashboard, drawer, modal).
- Charts render via **Chart.js** (a dependency, installed automatically).

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

Those `allowedActions` come back to you as `e.action` in `onAction`. Omit the argument for the base spec.

## Docs

[github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed) · [Frameworks guide](../../docs/frameworks.md)

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
