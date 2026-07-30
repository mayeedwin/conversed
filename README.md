# Conversed

[![npm downloads · core](https://img.shields.io/npm/dm/%40conversed%2Fcore?label=core)](https://www.npmjs.com/package/@conversed/core)
[![npm downloads · react](https://img.shields.io/npm/dm/%40conversed%2Freact?label=react)](https://www.npmjs.com/package/@conversed/react)
[![npm downloads · angular](https://img.shields.io/npm/dm/%40conversed%2Fangular?label=angular)](https://www.npmjs.com/package/@conversed/angular)

Rich, interactive UI for AI chat. Parse an LLM reply into typed content blocks, render them in React or Angular, and get a structured event whenever someone interacts.

▶ **Live playground:** [conversed-web.web.app](https://conversed-web.web.app) — rich blocks + a live **action inspector**.

## Why

Models don't just talk — they emit structured data: tables, stats, charts, lists. Plain text or Markdown can't make any of that interactive. Conversed parses each reply into a **Content Block AST** and renders every block as a real component. It renders **content, not conversations** — drop it inside your own chat bubble and hand it the parsed `blocks`.

## Install

```bash
pnpm add @conversed/core @conversed/react      # React
pnpm add @conversed/core @conversed/angular    # Angular
```

Packages: `@conversed/core` (parser + AST + action protocol), `@conversed/react`, `@conversed/angular`.

## Quick start (React)

```tsx
import '@conversed/react/styles.css';
import { ConversedContent } from '@conversed/react';
import { parseMessageBlocks } from '@conversed/core';

<ConversedContent
  blocks={parseMessageBlocks(reply)}
  primaryColor="#0071e3"
  onAction={(e) => console.log(e.action)}
/>;
```

Angular: `<conversed-content [blocks] primaryColor (action)>`. See the [docs](#docs).

## System prompt

Before `parseMessageBlocks` has anything to parse, the model has to **emit** conversed content — so teach it at the prompt level. `@conversed/core` exports two things:

- `CONVERSED_SYSTEM_PROMPT` — the full instruction string describing every block shape.
- `getSystemPromptInstruction(options?)` — the same instruction, optionally extended with an `allowedActions` list the model is allowed to trigger.

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `You are an AI assistant.
${getSystemPromptInstruction({
  allowedActions: [
    { actionId: 'view-detail', description: 'Deep link to item detail', exampleParams: { id: '123' } }
  ]
})}`;
```

Call it bare — `getSystemPromptInstruction()` — for the base spec. Each `allowedActions` entry becomes a documented `data-action-id` the model may attach to tables, stats, or buttons, and comes back to you as `e.action` in `onAction` (React) / the `(action)` output (Angular). See the [LLM prompt guide](docs/prompts.md).

## Blocks

| Block | What it renders | HTML shape |
| --- | --- | --- |
| `paragraph` | Prose | `<p>` |
| `heading` | h1–h4 titles | `<h1>`…`<h4>` |
| `list` | Ordered or bulleted list; 4 presentations via `listStyle` | `<ul>` / `<ol>` |
| `table` | Data table with per-row action + inline row buttons | `<table>` (rows carry `data-action-*`, cells with `data-row-actions` hold buttons) |
| `stats` | KPI / metric cards with trend + optional tap-through | `<dl>` with `<dt>`/`<dd data-delta data-trend>` |
| `progress` | Labelled meters with tone and custom readouts | `<ul data-progress>` with `<li data-value data-max?>` |
| `callout` | Info / warning / success / critical / note banner | `<blockquote data-tone>` (or GFM `> [!NOTE]`) |
| `chart` | Bar / line / pie chart via chart.js | `<figure data-chart data-labels data-values>` |
| `code` | Language-tagged code block with copy button | `<pre><code class="language-…">` |
| `details` | Collapsible disclosure | `<details><summary>` |
| `steps` | Ordered how-to with bold step titles | `<ol data-steps>` |
| `timeline` | Chronological entries with `data-time` | `<ul data-timeline>` |
| `media` | Plain image with caption (backward-compatible) | `<figure><img></figure>` |
| `image` | Single image with aspect ratio + optional lightbox preview | `<figure data-image data-aspect data-href>` |
| `gallery` | Horizontal snap-scroll or grid of images; shared lightbox with prev/next | `<figure data-gallery data-layout>` |
| `video` | HTML5 `<video>` with poster + native controls | `<figure data-aspect><video src poster>` |
| `product` | Ecommerce card: image, badge, rating, price, CTAs | `<article data-product data-price data-rating>` |
| `products` | Horizontal scroll or grid of full product cards | `<section data-products data-layout>` |
| `cart` | Cart summary: line items, totals, checkout CTAs | `<section data-cart>` with `<ul data-items>` + `<ul data-summary>` |
| `followups` | Suggested reply chips (submit on click) | `<ul data-followups>` |
| `divider` | Horizontal rule | `<hr>` |

Blocks are **flat** by default; opt into filled surfaces with `variant="filled"`. Lists render in four presentations via `listStyle` (`plain` · `card` · `grouped` · `directory`). See [theming](docs/theming.md).

## Action protocol

Interactive parts — table rows & inline row buttons, stat cards, follow-up chips, code copy buttons — emit an `AgentActionEvent` to your `onAction` handler: `{ type, actionId, target?, params? }`.

| `type` | fires when | e.g. |
| --- | --- | --- |
| `navigate` | open a route or target | view detail, open dashboard |
| `custom-command` | run an app-defined command | approve, refresh, complete task |
| `prompt-submit` | send text back as a new prompt | follow-up chips |
| `copy-code` | a code block is copied | code snippets |
| `external-url` | open an external link | — |

Declare actions on elements with `data-action-type` / `data-action-id` / `data-action-target` / `data-action-params`. See [architecture](docs/architecture.md#action-protocol).

CTA buttons carry a lifecycle `status` (`idle` → `pending` → `done` / `failed`) so the chat reflects an action's progress live — transition it with the pure `updateAction(blocks, selector, patch)` helper, which returns new blocks. See [CTA status](docs/architecture.md#cta-status-live-updates).

## Docs

- [Architecture & AST](docs/architecture.md)
- [Frameworks — React & Angular](docs/frameworks.md)
- [LLM prompt guide](docs/prompts.md)
- [Theming](docs/theming.md)
- [Releasing](docs/releasing.md)
- [Contributing](CONTRIBUTING.md) · [Git workflow](docs/git_workflow.md)

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
