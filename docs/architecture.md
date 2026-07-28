# Conversed Architecture & AST Specification

**Conversed renders content, not conversations.** Renderers take a `blocks` array and render rich blocks *inside your own chat bubble* — the host owns roles, avatars, and the feed. Model responses are parsed into a structured **Content Block AST**, and every interactive element carries a standardized **Action Spec**.

## Pipeline

```
model HTML  ->  parseMessageBlocks()  ->  ConversedContentBlock[]  ->  framework renderer
```

- `parseMessageBlocks(rawHtml, { debug? })` lives in the framework-agnostic `@conversed/core`. `debug: true` logs raw text + parsed blocks (styled); silent by default.
- Renderers: `@conversed/react` `ConversedContent`, `@conversed/angular` `ConversedContentComponent`.

## Block Types & Source HTML

`type` is one of: paragraph, heading, list, table, code, stats, progress, callout, chart, followups, divider, details, steps, timeline, media, custom.

| Block | Source HTML |
| --- | --- |
| paragraph | `<p>` |
| heading | `<h1>`–`<h4>` (`level`) |
| list | `<ul>` / `<ol>` (`ordered`, `items[]`) |
| table | `<table><thead><tbody>` (`headers[]`, `rows[]`) |
| code | `<pre><code>` (`language?`, `content`) |
| stats | `<dl><dt><dd data-delta data-trend>` |
| progress | `<ul data-progress><li data-value data-max? data-tone? data-display?>Label</li></ul>` |
| callout | `<blockquote data-tone><strong>title</strong>…</blockquote>` (`tone`: info/warning/success/critical/neutral) |
| chart | `<figure data-chart="bar\|line\|pie" data-labels="A\|B\|C" data-values="1\|2\|3" data-series-label="X">` |
| followups | `<ul data-followups>` |
| divider | `<hr>` |
| details | `<details [open]><summary>Title</summary>…</details>` |
| steps | `<ol data-steps><li><strong>Title</strong> body</li></ol>` |
| timeline | `<ul data-timeline><li data-time="09:00"><strong>Title</strong> body</li></ul>` |
| media | `<figure><img src alt><figcaption></figcaption></figure>` or bare `<img>` |
| custom | app-defined (`customType`, `payload`) |

> `<figure>` → `chart` only with a `data-chart` attribute, else `media`. `<ol>`/`<ul>` become `steps`/`timeline`/`followups`/`progress` when tagged with the matching `data-*`, else a plain list.

### Progress items

Each `<li>` in a `data-progress` list becomes a `ProgressItem`: `value` is a percentage (0–100) unless `data-max` is set, in which case the bar fills `value / max`. Optional `data-display` overrides the readout text, `data-tone` (`primary` \| `success` \| `warning` \| `critical` \| `neutral`) sets the bar color, and `data-action-*` attributes make a bar tappable (emitting the Action Protocol event below).

## Charts

`@conversed/core` stays dependency-free and describes charts declaratively — `toChartJsConfig(block, { primaryColor? })` returns a plain Chart.js config object (it never imports Chart.js). `@conversed/react` and `@conversed/angular` declare **Chart.js** as a dependency (installed automatically) and render to `<canvas>`.

## Action Protocol

Interactive elements trigger `AgentActionEvent` actions.

```typescript
type ActionTriggerType =
  | 'navigate'        // routing
  | 'custom-command'  // app-defined domain action
  | 'prompt-submit'   // submit a prompt (e.g. follow-up chip)
  | 'copy-code'       // copy snippet
  | 'external-url';   // open external link

interface AgentActionPayload<T = unknown> {
  type: ActionTriggerType;
  actionId: string;
  target?: string;
  params?: Record<string, T>;
}
```

Declared via data attributes: `data-action-type` → `type`, `data-action-id` → `actionId`, `data-action-target` → `target`, `data-action-params` (JSON) → `params`. Any non-reserved `data-*` becomes a camelCased param (`data-record-kind` → `params.recordKind`). Fallback: `data-link-type` / `data-link-id` map to a `navigate` action.

### CTA status (live updates)

A CTA button (`RowAction`) carries an optional lifecycle `status` so the chat can reflect an action's progress in place — a task going `idle → pending → done`, or `failed`:

```typescript
type ActionStatus = 'idle' | 'pending' | 'done' | 'failed';
```

The renderers style each status (a spinner for `pending`, a check for `done`, the critical tone for `failed`) and stop responding to clicks while `pending` or `done`. `idle` (the default) renders as the plain button.

Transition it with the pure `updateAction` helper from `@conversed/core`, which returns **new blocks** (the original array is returned unchanged when nothing matches, so it's cheap to call every render):

```typescript
import { updateAction } from '@conversed/core';

// Mark the task-complete CTA on row `t-101` done, and update its status cell.
const next = updateAction(
  blocks,
  { actionId: 'task-complete', target: 't-101' },   // selector: matches by actionId and/or target
  { status: 'done', label: 'Completed', variant: 'primary', cells: { 1: 'Done ✓' } }
);
setMessages(/* store `next` */);
```

Because the consumer owns the blocks state, the update is reactive: store the returned array and the reply re-renders. `status`/`label`/`variant` apply to the matched button; `cells` patches the containing table row by column index. See the demo's `handleAction` for an optimistic `pending → done` flow.

Terminal statuses (`done`/`failed`) are non-interactive, so the renderers show them as a quiet, borderless badge (colored glyph + label) rather than a filled button — a completed action recedes instead of competing with live CTAs. The badge colors come from the `--conversed-success` / `--conversed-critical` tokens, which shift to brighter dark-mode variants under `data-conversed-color-scheme="dark"` (see [theming](theming.md)).

### Persisting status across reloads

Because the consumer owns block state, persistence is an app concern — the library never touches storage (that would break SSR / React Native). Persist the **patched blocks**, not the raw reply: re-parsing raw text only restores the model's initial `data-status` and loses every runtime `pending → done` transition. Store the blocks array keyed by chat/message id and rehydrate it on mount:

```typescript
const KEY = `chat:${chatId}`;
const [blocks, setBlocks] = useState(
  () => JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? parseMessageBlocks(reply)
);
useEffect(() => localStorage.setItem(KEY, JSON.stringify(blocks)), [blocks]);
```

The demo's `App.tsx` persists its whole thread this way, so reopening it restores every CTA exactly where the user left it.

## Streaming

`consumeConversedStream(stream, onBlockUpdate?)` buffers chunked LLM tokens (Genkit, OpenAI, Anthropic, Web ReadableStream) and yields `{ rawText, blocks }` without DOM flicker.

```typescript
for await (const { rawText, blocks } of consumeConversedStream(stream)) {
  console.log(blocks);
}
```
