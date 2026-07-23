# LLM Integration & Prompt Guide

Provider-agnostic — works with OpenAI, Anthropic Claude, Google Gemini, Firebase Vertex AI, DeepSeek, etc.

## System Prompt

Two exports from `@conversed/core`:

- `CONVERSED_SYSTEM_PROMPT` — full instruction string describing every block shape.
- `getSystemPromptInstruction(options?)` — same instruction, optionally extended with an `allowedActions` list.

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `You are an AI assistant.
${getSystemPromptInstruction({
  allowedActions: [
    { actionId: 'view-detail', description: 'Deep link to item detail', exampleParams: { id: '123' } }
  ]
})}`;
```

## Block Spec (HTML the model emits)

```html
<p>Paragraph.</p>
<h2>Heading (h1–h4)</h2>

<ul><li>Unordered</li></ul>   <!-- <ol> for ordered -->

<table>
  <thead><tr><th>Coop</th><th>Eggs</th></tr></thead>
  <tbody><tr><td>North</td><td>18</td></tr></tbody>
</table>

<pre><code class="language-ts">const total = eggs.reduce((a, b) => a + b, 0);</code></pre>

<dl>
  <dt>Total eggs</dt><dd data-delta="+12%" data-trend="up">128</dd>
</dl>

<blockquote data-tone="warning"><strong>Low feed</strong> Reorder within 2 days.</blockquote>
<!-- tones: info | warning | success | critical | neutral -->

<ul data-followups><li>Show egg trend</li><li>Compare coops</li></ul>

<details open><summary>Title</summary><p>Body.</p></details>  <!-- omit open to collapse -->

<ol data-steps><li><strong>Collect</strong> Gather eggs.</li></ol>

<ul data-timeline><li data-time="06:00"><strong>Morning</strong> 72 eggs.</li></ul>

<figure><img src="coop.jpg" alt="North coop" /><figcaption>Caption</figcaption></figure>  <!-- bare <img> ok -->

<hr>

<figure data-chart="bar" data-labels="Mon|Tue|Wed" data-values="12|18|15" data-series-label="Eggs">
  <figcaption>Weekly eggs</figcaption>
</figure>
<!-- data-chart: bar | line | pie; labels/values pipe-delimited -->
```

`<strong>` leads the title in `data-steps` / `data-timeline` items.

## Table Row Actions

Add a final `<td data-row-actions>` cell holding per-row `<button>`s, each with its own `data-action-*` attributes. Use `data-variant="primary"` to emphasize. Any non-reserved `data-*` becomes a camelCased param (`data-record-kind` → `params.recordKind`).

## Markdown / GFM Normalizer

Standard Markdown tables (`| Col |`) and GitHub alerts (`> [!WARNING]`) are auto-converted into rich AST blocks — no custom prompt needed.

## Parsing

```typescript
import { parseMessageBlocks } from '@conversed/core';
const blocks = parseMessageBlocks(await callLlmApi(userInput));
```
