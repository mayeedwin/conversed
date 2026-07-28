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

Block types: `paragraph`, `heading`, `list`, `table`, `code`, `stats`, `progress`, `callout`, `chart`, `followups`, `divider`, `details`, `steps`, `timeline`, `media`, `custom`.

## Stream

`consumeConversedStream(stream, onBlockUpdate?)` adapts a token stream (Genkit, OpenAI, Anthropic, Web `ReadableStream`) into incremental updates, yielding `{ rawText, blocks }`.

## Charts

Core never imports Chart.js — `toChartJsConfig(block, { primaryColor? })` returns a plain config object; the framework packages render it. `CHART_SERIES_COLORS` is the default series palette.

## Actions

`ActionTriggerType` = `'navigate' | 'custom-command' | 'prompt-submit' | 'copy-code' | 'external-url'`; `AgentActionEvent` / `AgentActionPayload` are the event/payload models.

## Theming

`generateCssVariables(theme?)` emits `--conversed-*` declarations; `CONVERSED_GRAY` is the iOS gray ramp (`50`–`900`). Defaults: primary `#0071e3`, border `#e5e5ea`, radius `8px`.

## LLM prompt

Before conversed can parse a reply, the model has to **emit** conversed content. Append the instruction to your system prompt — `CONVERSED_SYSTEM_PROMPT` is the raw spec, and `getSystemPromptInstruction(options?)` returns it optionally extended with the custom actions the model is allowed to trigger:

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `You are an AI assistant.
${getSystemPromptInstruction({
  allowedActions: [
    { actionId: 'view-detail', description: 'Deep link to item detail', exampleParams: { id: '123' } }
  ]
})}`;
```

`allowedActions` is optional — omit it (or call `getSystemPromptInstruction()`) for the base spec. Each entry becomes a documented `data-action-id` the model may attach to tables, stats, or buttons, which surface back to you via `onAction` / `(action)` in the framework packages.

## Docs

[github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed) — full architecture, prompt, and theming guides.

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
