# Angular & React Integration Guide

## React Integration (`@conversed/react`)

```bash
npm install @conversed/react @conversed/core
```

### Standalone Block Embedding

Render an AI Metric Card or Table anywhere in your custom UI:

```tsx
import React from 'react';
import { ConversedBlock } from '@conversed/react';

export const MyDashboardCard = ({ block }) => (
  <ConversedBlock
    block={block}
    primaryColor="#10b981"
    onAction={(e) => console.log('Action:', e.action)}
  />
);
```

### Rendering an Assistant Message

Conversed does not own the feed, roles, or avatars — your app does. Parse the raw
assistant text into blocks and render `<ConversedContent>` inside your own bubble:

```tsx
import { ConversedContent } from '@conversed/react';
import { parseMessageBlocks } from '@conversed/core';

export const AssistantBubble = ({ rawAiResponse }) => (
  <div className="my-chat-bubble assistant">
    <ConversedContent
      blocks={parseMessageBlocks(rawAiResponse)}
      primaryColor="#6366f1"
      onAction={(e) => console.log('Action:', e.action)}
    />
  </div>
);
```

---

## Angular Integration (`@conversed/angular`)

```bash
npm install @conversed/angular @conversed/core
```

### Standalone Block Component

```html
<conversed-block
  [block]="myBlock"
  primaryColor="#10b981"
  (action)="onAction($event)">
</conversed-block>
```

### Rendering an Assistant Message

Drop `<conversed-content>` inside your own chat bubble and pass the parsed blocks
(`blocks = computed(() => parseMessageBlocks(rawAiResponse()))`):

```html
<div class="my-chat-bubble assistant">
  <conversed-content
    [blocks]="blocks()"
    primaryColor="#6366f1"
    (action)="onAction($event)">
  </conversed-content>
</div>
```
