# Angular & React Integration Guide

## React Integration (`@conversed/react`)

```bash
npm install @conversed/react @conversed/core
```

**React ships its CSS separately** — import the stylesheet once at your app root,
or the blocks render unstyled:

```tsx
import '@conversed/react/styles.css';
```

Charts render via Chart.js, which is bundled — no extra install or setup.

### Standalone Block Embedding

Render an AI Metric Card or Table anywhere in your custom UI:

```tsx
import React from 'react';
import { ConversedBlock } from '@conversed/react';

export const MyDashboardCard = ({ block }) => (
  <ConversedBlock
    block={block}
    primaryColor="#0071e3"
    onAction={(e) => console.log('Action:', e.action)}
  />
);
```

### Rendering an Assistant Message

Conversed renders content, not conversations — your app owns the feed, roles, and
avatars. Parse the raw assistant text into a `blocks` array and render
`<ConversedContent>` inside your own bubble:

```tsx
import '@conversed/react/styles.css';
import { ConversedContent } from '@conversed/react';
import { parseMessageBlocks } from '@conversed/core';

export const AssistantBubble = ({ rawAiResponse }) => (
  <div className="my-chat-bubble assistant">
    <ConversedContent
      blocks={parseMessageBlocks(rawAiResponse, { debug: true })}
      primaryColor="#0071e3"
      debug
      onAction={(e) => console.log('Action:', e.action)}
    />
  </div>
);
```

Set `debug` on `parseMessageBlocks` (or the `debug` prop on `ConversedContent`) to
log the raw text and parsed blocks to the console while developing. It is silent by
default.

---

## Angular Integration (`@conversed/angular`)

```bash
npm install @conversed/angular @conversed/core
```

Angular components inline their own styles, so there is zero CSS setup. Charts
render via Chart.js, which is bundled — no extra install or setup.

### Standalone Block Component

```html
<conversed-block
  [block]="myBlock"
  primaryColor="#0071e3"
  (action)="onAction($event)">
</conversed-block>
```

### Rendering an Assistant Message

Conversed renders content, not conversations — your app owns the feed, roles, and
avatars. Drop `<conversed-content>` inside your own chat bubble and pass the parsed
`blocks` array (`blocks = computed(() => parseMessageBlocks(rawAiResponse()))`):

```html
<div class="my-chat-bubble assistant">
  <conversed-content
    [blocks]="blocks()"
    primaryColor="#0071e3"
    [debug]="true"
    (action)="onAction($event)">
  </conversed-content>
</div>
```

The `[debug]` input (and the `{ debug: true }` option on `parseMessageBlocks`) logs
the raw text and parsed blocks to the console while developing. It is silent by
default.
