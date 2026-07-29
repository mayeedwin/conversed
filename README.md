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

`paragraph` · `heading` · `list` · `table` · `stats` · `progress` · `callout` · `chart` · `code` · `details` · `steps` · `timeline` · `media` · `followups` · `divider`

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
- [Contributing](CONTRIBUTING.md) · [Git workflow](docs/git_workflow.md)

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
