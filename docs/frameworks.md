# Angular & React Integration Guide

Both renderers take a `blocks` array and render inside your own chat bubble — Conversed renders content, not conversations. Charts render via Chart.js — a dependency of both framework packages, installed automatically (no extra setup). Parse first with `parseMessageBlocks` from `@conversed/core`.

| | React (`@conversed/react`) | Angular (`@conversed/angular`) |
| --- | --- | --- |
| Install | `npm i @conversed/react @conversed/core` | `npm i @conversed/angular @conversed/core` |
| CSS | import `@conversed/react/styles.css` once at app root (else unstyled) | inline styles, zero setup |
| Content | `<ConversedContent blocks primaryColor onAction debug />` | `<conversed-content [blocks] primaryColor [debug] (action)>` |
| Single block | `<ConversedBlock block primaryColor onAction />` | `<conversed-block [block] primaryColor (action)>` |

`debug` (component prop / `{ debug: true }` on `parseMessageBlocks`) logs raw text + parsed blocks. Silent by default.

## React

```tsx
import '@conversed/react/styles.css';
import { ConversedContent } from '@conversed/react';
import { parseMessageBlocks } from '@conversed/core';

export const AssistantBubble = ({ rawAiResponse }) => (
  <div className="my-chat-bubble assistant">
    <ConversedContent
      blocks={parseMessageBlocks(rawAiResponse)}
      primaryColor="#0071e3"
      onAction={(e) => console.log('Action:', e.action)}
    />
  </div>
);
```

## Angular

```html
<div class="my-chat-bubble assistant">
  <conversed-content
    [blocks]="blocks()"
    primaryColor="#0071e3"
    (action)="onAction($event)">
  </conversed-content>
</div>
```

```ts
blocks = computed(() => parseMessageBlocks(this.rawAiResponse()));
```
