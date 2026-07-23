# @conversed/core

> Pure TypeScript AST definitions, parser engine, theming tokens, and Action Protocol for **conversed**. Framework-agnostic with zero framework dependencies.

## Installation

```bash
npm install @conversed/core
# or
pnpm add @conversed/core
```

## Parsing content

`parseMessageBlocks()` converts a raw HTML/Markdown string into a structured `ConversedContentBlock[]` AST that the framework packages render.

```typescript
import { parseMessageBlocks } from '@conversed/core';

const blocks = parseMessageBlocks(rawAiText);

// Pass { debug: true } to log the raw text and parsed blocks to the
// console (styled). Silent by default.
const debugBlocks = parseMessageBlocks(rawAiText, { debug: true });
```

### Block types

The parser emits these `ConversedContentBlock` variants:

`paragraph`, `heading`, `list`, `details`, `steps`, `timeline`, `media`, `table`, `code`, `stats`, `callout`, `chart`, `followups`, `divider`, `custom`.

## Theming

Conversed is fully driven by `--conversed-*` CSS variables.

- `generateCssVariables(theme?)` — produces the CSS variable declarations from a `ConversedThemeTokens` object.
- `CONVERSED_GRAY` — the iOS gray ramp (`50`–`900`) exposed as `--conversed-gray-*`.

Defaults: primary `#0071e3`, border `#e5e5ea` (gray-200), card background transparent, radius `8px`.

```typescript
import { generateCssVariables, CONVERSED_GRAY } from '@conversed/core';

const css = generateCssVariables({ primaryColor: '#0071e3' });
```

## Charts

`chart` blocks are rendered by the framework packages using Chart.js. Core does **not** import `chart.js` — it only produces the config.

```typescript
import { toChartJsConfig, CHART_SERIES_COLORS } from '@conversed/core';

const config = toChartJsConfig(chartBlock, { primaryColor: '#0071e3' });
```

## Action Protocol

Interactive blocks (table rows, metric cards, follow-up chips, code copy buttons) emit a standardized action event.

- `AgentActionEvent`, `AgentActionPayload` — event/payload models.
- `ActionTriggerType` — `'navigate' | 'custom-command' | 'prompt-submit' | 'copy-code' | 'external-url'`.

## Streaming

`consumeConversedStream(stream, onBlockUpdate?)` adapts a streaming source (Firebase Genkit, OpenAI, Anthropic, or a Web `ReadableStream`) into incremental block updates.

```typescript
import { consumeConversedStream } from '@conversed/core';

await consumeConversedStream(stream, (blocks) => render(blocks));
```

## LLM system prompt

`CONVERSED_SYSTEM_PROMPT` is the ready-to-use instruction that teaches an LLM to emit conversed-compatible content. `getSystemPromptInstruction(options?)` returns a customized variant.

```typescript
import { CONVERSED_SYSTEM_PROMPT, getSystemPromptInstruction } from '@conversed/core';
```

## Debug loggers

- `logConversedPipeline` — logs the parse pipeline.
- `logConversedAction` — logs emitted actions.

## Documentation

For full documentation and monorepo source code, visit [github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed).

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
