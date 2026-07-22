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

### Full Chat Feed

```tsx
import React from 'react';
import { ConversedFeed } from '@conversed/react';

export const ChatPage = ({ messages }) => (
  <ConversedFeed
    messages={messages}
    primaryColor="#6366f1"
    onAction={(e) => console.log('Action:', e.action)}
  />
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

### Full Chat Feed Component

```html
<conversed-feed
  [messages]="messages()"
  primaryColor="#6366f1"
  (action)="onAction($event)">
</conversed-feed>
```
