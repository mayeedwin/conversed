# @conversed/react

> React 18+ components and hooks for **conversed** rich AI chat UI.

## Installation

```bash
npm install @conversed/react @conversed/core
# or
pnpm add @conversed/react @conversed/core
```

## Usage

### Standalone Block Renderer

Render a single AI Metric Card or Table anywhere in your React component tree:

```tsx
import React from 'react';
import { ConversedBlock } from '@conversed/react';

export const DashboardWidget = ({ block }) => (
  <ConversedBlock
    block={block}
    primaryColor="#6366f1"
    onAction={(e) => console.log('Action:', e.action)}
  />
);
```

### Full Chat Feed Component

```tsx
import React, { useState } from 'react';
import { ConversedFeed } from '@conversed/react';
import { ConversedMessage, AgentActionEvent } from '@conversed/core';

export const ChatApp = () => {
  const [messages, setMessages] = useState<ConversedMessage[]>([]);

  return (
    <ConversedFeed
      messages={messages}
      primaryColor="#6366f1"
      onAction={(e: AgentActionEvent) => console.log('Action:', e.action)}
    />
  );
};
```

## Documentation

For full documentation and monorepo source code, visit [github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed).

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
