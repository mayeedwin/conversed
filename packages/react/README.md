# @conversed/react

> React 18+ components and hooks for **conversed** rich AI chat UI.

## Installation

```bash
npm install @conversed/react @conversed/core
# or
pnpm add @conversed/react @conversed/core
```

### Import the stylesheet (required)

React ships its CSS separately — import it once at your app root, or blocks render
unstyled (no borders, padding, or sizing):

```tsx
import '@conversed/react/styles.css';
```

The stylesheet is fully driven by `--conversed-*` CSS variables, so `primaryColor` /
`theme` props (and your own `:root` overrides) still restyle everything after import.
See [Theming](../../docs/THEMING.md) for the token list and the iOS gray scale.

## Usage

### Standalone Block Renderer

Render a single AI Metric Card or Table anywhere in your React component tree:

```tsx
import React from 'react';
import { ConversedBlock } from '@conversed/react';

export const DashboardWidget = ({ block }) => (
  <ConversedBlock
    block={block}
    primaryColor="#0071e3"
    onAction={(e) => console.log('Action:', e.action)}
  />
);
```

### Rendering an Assistant Message

Conversed renders **content, not conversations** — it never owns roles, avatars, or
bubbles. Its only input is `blocks`. Parse the raw assistant text and render inside
your own bubble:

```tsx
import { ConversedContent } from '@conversed/react';
import { parseMessageBlocks, AgentActionEvent } from '@conversed/core';

export const AssistantBubble = ({ rawAiResponse }: { rawAiResponse: string }) => (
  <div className="my-chat-bubble assistant">
    <ConversedContent
      blocks={parseMessageBlocks(rawAiResponse, { debug: true })}
      primaryColor="#0071e3"
      debug
      onAction={(e: AgentActionEvent) => console.log('Action:', e.action)}
    />
  </div>
);
```

`ConversedContent` props: `blocks`, `primaryColor?` (defaults to `#0071e3`),
`theme?`, `onAction?`, and `debug?` (logs emitted actions when `true`).
`ConversedBlock` renders a single block. Chart blocks render via **Chart.js**
(bundled dependency).

## Documentation

For full documentation and monorepo source code, visit [github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed).

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
