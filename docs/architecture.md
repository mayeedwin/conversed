# Conversed Architecture & AST Specification

**Conversed renders content, not conversations.** Renderers take a `blocks` array and render rich blocks *inside your own chat bubble* — the host owns roles, avatars, and the feed. Model responses are parsed into a structured **Content Block AST**, and every interactive element carries a standardized **Action Spec**.

## Pipeline

```
model HTML  ->  parseMessageBlocks()  ->  ConversedContentBlock[]  ->  framework renderer
```

- `parseMessageBlocks(rawHtml, { debug? })` lives in the framework-agnostic `@conversed/core`. `debug: true` logs raw text + parsed blocks (styled); silent by default.
- Renderers: `@conversed/react` `ConversedContent`, `@conversed/angular` `ConversedContentComponent`.

## Block Types & Source HTML

`type` is one of: paragraph, heading, list, table, code, stats, callout, chart, followups, divider, details, steps, timeline, media, custom.

| Block | Source HTML |
| --- | --- |
| paragraph | `<p>` |
| heading | `<h1>`–`<h4>` (`level`) |
| list | `<ul>` / `<ol>` (`ordered`, `items[]`) |
| table | `<table><thead><tbody>` (`headers[]`, `rows[]`) |
| code | `<pre><code>` (`language?`, `content`) |
| stats | `<dl><dt><dd data-delta data-trend>` |
| callout | `<blockquote data-tone><strong>title</strong>…</blockquote>` (`tone`: info/warning/success/critical/neutral) |
| chart | `<figure data-chart="bar\|line\|pie" data-labels="A\|B\|C" data-values="1\|2\|3" data-series-label="X">` |
| followups | `<ul data-followups>` |
| divider | `<hr>` |
| details | `<details [open]><summary>Title</summary>…</details>` |
| steps | `<ol data-steps><li><strong>Title</strong> body</li></ol>` |
| timeline | `<ul data-timeline><li data-time="09:00"><strong>Title</strong> body</li></ul>` |
| media | `<figure><img src alt><figcaption></figcaption></figure>` or bare `<img>` |
| custom | app-defined (`customType`, `payload`) |

> `<figure>` → `chart` only with a `data-chart` attribute, else `media`. `<ol>`/`<ul>` become `steps`/`timeline`/`followups` when tagged with the matching `data-*`, else a plain list.

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

## Streaming

`consumeConversedStream(stream, onBlockUpdate?)` buffers chunked LLM tokens (Genkit, OpenAI, Anthropic, Web ReadableStream) and yields `{ rawText, blocks }` without DOM flicker.

```typescript
for await (const { rawText, blocks } of consumeConversedStream(stream)) {
  console.log(blocks);
}
```
