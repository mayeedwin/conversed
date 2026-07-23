# LLM Integration & Prompt Guide

**conversed** is 100% provider-agnostic and works seamlessly with **OpenAI GPT-4o**, **Anthropic Claude 3.5**, **Google Gemini**, **Firebase Vertex AI**, or **DeepSeek**.

---

## 1. System Prompt Helper

Two exports from `@conversed/core` drive the model:

- `CONVERSED_SYSTEM_PROMPT` — the full instruction string describing every block shape the model may emit.
- `getSystemPromptInstruction(options?)` — returns that instruction, optionally extended with an `allowedActions` list so the model knows which actions it may attach to elements.

Append `getSystemPromptInstruction()` to your system prompt:

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `
You are an AI assistant.
${getSystemPromptInstruction({
  allowedActions: [
    { actionId: 'view-detail', description: 'Deep link to item detail', exampleParams: { id: '123' } }
  ]
})}
`;
```

If you don't need action metadata, use the raw constant:

```typescript
import { CONVERSED_SYSTEM_PROMPT } from '@conversed/core';
```

---

## Block Spec Reference

The model emits an HTML fragment. Every block below is parsed into a rich AST block by `parseMessageBlocks`.

### Paragraph

```html
<p>Your flock is laying well this week.</p>
```

### Heading

```html
<h2>Weekly summary</h2>
```

Levels `<h1>`–`<h4>` are supported.

### List

```html
<ul>
  <li>Collect eggs twice daily</li>
  <li>Refill feeders</li>
</ul>
```

Use `<ol>` for ordered lists.

### Table

```html
<table>
  <thead>
    <tr><th>Coop</th><th>Eggs</th></tr>
  </thead>
  <tbody>
    <tr><td>North</td><td>18</td></tr>
    <tr><td>South</td><td>15</td></tr>
  </tbody>
</table>
```

### Code

```html
<pre><code class="language-ts">const total = eggs.reduce((a, b) => a + b, 0);</code></pre>
```

### Stats

```html
<dl>
  <dt>Total eggs</dt>
  <dd data-delta="+12%" data-trend="up">128</dd>
  <dt>Feed used</dt>
  <dd data-delta="-3%" data-trend="down">42kg</dd>
</dl>
```

### Callout

```html
<blockquote data-tone="warning">
  <strong>Low feed</strong>
  Reorder within 2 days to avoid a gap.
</blockquote>
```

Tones: `info`, `warning`, `success`, `critical`, `neutral`.

### Follow-ups

```html
<ul data-followups>
  <li>Show egg trend for last month</li>
  <li>Compare coops</li>
</ul>
```

### Divider

```html
<hr>
```

### Chart

```html
<figure data-chart="bar" data-labels="Mon|Tue|Wed" data-values="12|18|15" data-series-label="Eggs">
  <figcaption>Weekly eggs</figcaption>
</figure>
```

`data-chart` may be `bar`, `line`, or `pie`. `data-labels` and `data-values` are pipe-delimited. A pie example:

```html
<figure data-chart="pie" data-labels="Hens|Roosters|Chicks" data-values="40|10|25">
  <figcaption>Flock breakdown</figcaption>
</figure>
```

---

## 2. Automatic Markdown & GFM Alert Normalizer

Even if an LLM returns standard Markdown tables (`| Col 1 | Col 2 |`) or GitHub-style alerts (`> [!WARNING]`), **conversed** automatically converts them into rich AST blocks without needing custom prompts!

---

## 3. Parsing AI Responses

```typescript
import { parseMessageBlocks } from '@conversed/core';

const rawAiResponse = await callLlmApi(userInput);
const blocks = parseMessageBlocks(rawAiResponse);
```
