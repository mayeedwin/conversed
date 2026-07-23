# Conversed

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

Angular: `<conversed-content [blocks] primaryColor (action)>`. Give the model the block conventions with `getSystemPromptInstruction()`. See the [docs](#docs).

## Blocks

`paragraph` · `heading` · `list` · `table` · `stats` · `callout` · `chart` · `code` · `details` · `steps` · `timeline` · `media` · `followups` · `divider`

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

## Docs

- [Architecture & AST](docs/architecture.md)
- [Frameworks — React & Angular](docs/frameworks.md)
- [LLM prompt guide](docs/prompts.md)
- [Theming](docs/theming.md)
- [Contributing](CONTRIBUTING.md) · [Git workflow](docs/git_workflow.md)

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
