# Conversed Architecture & AST Specification

## Core Philosophy: AST Block Engine

Instead of outputting plain text or static markdown bubbles, **conversed** parses model responses into a structured **Content Block AST (Abstract Syntax Tree)**.

Every interactive element within a block (buttons, links, charts, metric cards, follow-up chips) carries a standardized **Action Spec**.

---

## Content Block Types

```typescript
export type ConversedContentBlock =
  | ParagraphBlock
  | ListBlock
  | TableBlock
  | CodeBlock
  | StatsBlock
  | CalloutBlock
  | ChartBlock
  | HeadingBlock
  | DividerBlock
  | FollowUpBlock
  | CustomBlock;
```

---

## Action Protocol

Interactive elements inside blocks (table buttons, metric cards, follow-up chips, links) trigger standardized actions via `AgentActionEvent`:

```typescript
export type ActionTriggerType =
  | 'navigate'       // Routing trigger
  | 'custom-command' // App-defined domain action (e.g., complete task, update status)
  | 'prompt-submit'  // Prompt action (e.g., click follow-up chip)
  | 'copy-code'      // Copy snippet content
  | 'external-url';  // Open external web link

export interface AgentActionPayload<T = unknown> {
  type: ActionTriggerType;
  actionId: string;
  target?: string;
  params?: Record<string, T>;
}
```

---

## Stream Accumulator & Stream Consumer

When streaming tokens chunk-by-chunk from LLMs, HTML tags arrive incomplete. **conversed** provides `consumeConversedStream` and `ConversedStreamAccumulator` to buffer raw stream tokens and update AST blocks without DOM flickering:

```typescript
import { consumeConversedStream } from '@conversed/core';

// Works with Firebase Genkit, OpenAI, Anthropic, or Web ReadableStreams
for await (const state of consumeConversedStream(stream)) {
  console.log('Updated AST blocks:', state.blocks);
}
```
