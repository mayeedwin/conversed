# Conversed Architecture & AST Specification

## Core Philosophy: AST Block Engine

**Conversed renders content, not conversations.** Components take a `blocks` array and render rich blocks *inside the host app's own message bubble*. The host owns roles, avatars, and the feed — conversed only renders the content within a turn.

Instead of outputting plain text or static markdown bubbles, **conversed** parses model responses into a structured **Content Block AST (Abstract Syntax Tree)**.

Every interactive element within a block (buttons, links, charts, metric cards, follow-up chips) carries a standardized **Action Spec**.

---

## The Pipeline

```
model HTML  ->  parseMessageBlocks()  ->  ConversedContentBlock[]  ->  framework renderer
```

1. The model emits an HTML fragment (see the source shapes below).
2. `parseMessageBlocks(rawHtml, options?)` in the pure, framework-agnostic `@conversed/core` package parses it into a `ConversedContentBlock[]` AST.
3. A framework renderer (`@conversed/angular` `ConversedContentComponent`, `@conversed/react` `ConversedContent`) renders the blocks inside the host's bubble.

```typescript
import { parseMessageBlocks } from '@conversed/core';

// { debug: true } logs the raw text + parsed blocks to the console (styled).
// Default is silent.
const blocks = parseMessageBlocks(rawHtml, { debug: true });
```

---

## Content Block Types

```typescript
export type ConversedContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | TableBlock
  | CodeBlock
  | StatsBlock
  | CalloutBlock
  | ChartBlock
  | FollowUpBlock
  | DividerBlock
  | CustomBlock;
```

### Block shapes

```typescript
interface ParagraphBlock { type: 'paragraph'; html: string; }
interface HeadingBlock   { type: 'heading'; level: 1 | 2 | 3 | 4; html: string; }
interface ListBlock      { type: 'list'; ordered: boolean; items: string[]; }
interface CodeBlock      { type: 'code'; language?: string; content: string; }
interface DividerBlock   { type: 'divider'; }

interface DetailsBlock   { type: 'details'; summary: string; html: string; open: boolean; }

interface StepsBlock {
  type: 'steps';
  items: { title?: string; html: string }[];
}

interface TimelineBlock {
  type: 'timeline';
  items: { time?: string; title?: string; html: string }[];
}

interface MediaBlock { type: 'media'; src: string; alt?: string; caption?: string; }

interface TableBlock {
  type: 'table';
  headers: string[];
  rows: { cells: string[]; action?: AgentActionPayload }[];
}

interface StatsBlock {
  type: 'stats';
  items: {
    label: string;
    value: string;
    delta?: string;
    trend?: string;
    action?: AgentActionPayload;
  }[];
}

interface CalloutBlock {
  type: 'callout';
  tone: 'info' | 'warning' | 'success' | 'critical' | 'neutral';
  badgeLabel: string;
  title?: string;
  html: string;
}

interface ChartBlock {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie';
  title?: string;
  labels: string[];
  datasets: { label: string; values: number[]; color?: string }[];
}

interface FollowUpBlock { type: 'followups'; items: string[]; }
interface CustomBlock   { type: 'custom'; customType: string; payload: unknown; }
```

---

## Source HTML Shapes

The parser reads these HTML shapes emitted by the model:

| Block | Source HTML |
| --- | --- |
| paragraph | `<p>` |
| heading | `<h1>`–`<h4>` |
| list | `<ul>` / `<ol>` (rendered as a div-based grouped list) |
| code | `<pre><code>` |
| divider | `<hr>` |
| table | `<table><thead><tbody>` |
| stats | `<dl><dt><dd>` (`<dd data-delta data-trend>`) |
| callout | `<blockquote data-tone><strong>title</strong>...</blockquote>` |
| followups | `<ul data-followups>` |
| details | `<details [open]><summary>Title</summary>...</details>` |
| steps | `<ol data-steps><li><strong>Title</strong> body</li></ol>` |
| timeline | `<ul data-timeline><li data-time="09:00"><strong>Title</strong> body</li></ul>` |
| media | `<figure><img src alt><figcaption>Caption</figcaption></figure>` or a bare `<img>` |
| chart | `<figure data-chart="bar\|line\|pie" data-labels="A\|B\|C" data-values="1\|2\|3" data-series-label="X"><figcaption>Title</figcaption></figure>` |

> **Note:** `<figure>` routes to `chart` only when it carries a `data-chart` attribute; otherwise it becomes a `media` block. `<ol>`/`<ul>` become `steps`/`timeline`/`followups` when tagged with the matching `data-*` attribute, and a plain list otherwise.

---

## Charts

`ChartBlock` describes chart data declaratively; `@conversed/core` stays dependency-free and does **not** import Chart.js. The core helper `toChartJsConfig(block, { primaryColor? })` converts a `ChartBlock` into a Chart.js config object.

Rendering happens in the framework packages: `@conversed/angular` and `@conversed/react` bundle Chart.js and render charts onto a `<canvas>`.

```typescript
import { toChartJsConfig } from '@conversed/core';

const config = toChartJsConfig(chartBlock, { primaryColor: '#0071e3' });
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

Actions are declared on elements via data attributes:

- `data-action-type` → `type`
- `data-action-id` → `actionId`
- `data-action-target` → `target`
- `data-action-params` → `params` (JSON)

As a fallback, `data-link-type` / `data-link-id` map to a `navigate` action.

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
