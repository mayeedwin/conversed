# @conversed/core

> Parser, AST, theming tokens, and Action Protocol for **conversed**. Framework-agnostic, zero runtime dependencies.

▶ **Live playground:** [conversed-web.web.app](https://conversed-web.web.app)

## Install

```bash
pnpm add @conversed/core
```

## Parse

`parseMessageBlocks(rawHtml, { debug? })` turns an HTML/Markdown reply into a `ConversedContentBlock[]` AST that the framework packages render.

```typescript
import { parseMessageBlocks } from '@conversed/core';

const blocks = parseMessageBlocks(rawAiText);   // { debug: true } logs the pipeline
```

Block types: `paragraph`, `heading`, `list`, `table`, `code`, `stats`, `callout`, `chart`, `followups`, `divider`, `details`, `steps`, `timeline`, `media`, `custom`.

## Stream

`consumeConversedStream(stream, onBlockUpdate?)` adapts a token stream (Genkit, OpenAI, Anthropic, Web `ReadableStream`) into incremental updates, yielding `{ rawText, blocks }`.

## Charts

Core never imports Chart.js — `toChartJsConfig(block, { primaryColor? })` returns a plain config object; the framework packages render it. `CHART_SERIES_COLORS` is the default series palette.

## Actions

`ActionTriggerType` = `'navigate' | 'custom-command' | 'prompt-submit' | 'copy-code' | 'external-url'`; `AgentActionEvent` / `AgentActionPayload` are the event/payload models.

## Theming

`generateCssVariables(theme?)` emits `--conversed-*` declarations; `CONVERSED_GRAY` is the iOS gray ramp (`50`–`900`). Defaults: primary `#0071e3`, border `#e5e5ea`, radius `8px`.

## LLM prompt

`CONVERSED_SYSTEM_PROMPT` teaches a model to emit conversed content; `getSystemPromptInstruction(options?)` returns a customizable variant.

## Docs

[github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed) — full architecture, prompt, and theming guides.

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
