/**
 * Conversed System Prompt Spec & Instruction Generator
 *
 * Developers can append this instruction string into system prompts for
 * OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5/2.0, or Firebase Vertex AI.
 */

export interface SystemPromptOptions {
  /** Optional custom domain action ids the AI is allowed to trigger */
  allowedActions?: Array<{
    actionId: string;
    description: string;
    exampleParams?: Record<string, string>;
  }>;
}

export const CONVERSED_SYSTEM_PROMPT = `
You format rich responses using standard HTML block tags so the client can render interactive UI components.
Use the following specifications for rich blocks:

1. **Tables with Action Triggers**:
<table data-action-type="custom-command" data-action-id="YOUR_ACTION_ID">
  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>
  <tbody>
    <tr data-action-target="/detail/123" data-action-params='{"id":"123"}'>
      <td>Row Value 1</td><td>Row Value 2</td>
    </tr>
  </tbody>
</table>
For per-row buttons, add a final cell marked data-row-actions containing one or more <button> elements (each with its own data-action-* attributes; add data-variant="primary" to emphasise one). Optionally set data-status ("idle" | "pending" | "done" | "failed") to show a button's lifecycle state — "pending" renders a spinner and "done" a check, and both stop responding to clicks. The buttons render in a trailing actions column and are excluded from the row's data cells:
<tr>
  <td>Feed the goats</td><td>Pending</td>
  <td data-row-actions>
    <button data-action-type="custom-command" data-action-id="task-start" data-action-target="123">Start</button>
    <button data-action-type="custom-command" data-action-id="task-complete" data-action-target="123" data-variant="primary" data-status="pending">Complete</button>
  </td>
</tr>

2. **Metric / Stats Cards**:
<dl>
  <dt>Total Revenue</dt>
  <dd data-delta="+15%" data-trend="up" data-action-type="navigate" data-action-target="/finance">$45,200</dd>
</dl>

3. **Callout Boxes**:
<blockquote data-tone="warning">
  <strong>System Notice</strong>
  <p>Operation completed with minor warnings.</p>
</blockquote>

4. **Follow-up Chips**:
<ul data-followups="true">
  <li>Show detailed report</li>
  <li>Export as CSV</li>
</ul>

5. **Code Snippets**:
<pre><code class="language-typescript">const x = 10;</code></pre>

6. **Charts** (bar, line, or pie — pipe-separated labels and values):
<figure data-chart="bar" data-labels="Mon|Tue|Wed" data-values="12|18|15" data-series-label="Eggs"><figcaption>Weekly eggs</figcaption></figure>
<figure data-chart="pie" data-labels="Hens|Roosters|Chicks" data-values="40|10|25"><figcaption>Flock breakdown</figcaption></figure>

7. **Collapsible Details** (use for supplementary info that can stay hidden; add "open" to expand by default):
<details open><summary>Assumptions</summary><p>Figures assume current feed prices.</p></details>

8. **Steps** (an ordered how-to; optional bold lead-in per step):
<ol data-steps>
  <li><strong>Isolate</strong> the affected animal from the herd.</li>
  <li><strong>Call</strong> the vet within 24 hours.</li>
</ol>

9. **Timeline** (chronological events; optional data-time and bold title per entry):
<ul data-timeline>
  <li data-time="2026-07-20"><strong>Vaccinated</strong> — full herd.</li>
  <li data-time="2026-07-22"><strong>Restocked</strong> — 20 layers added.</li>
</ul>

10. **Media** (an image with optional caption — a <figure> WITHOUT data-chart):
<figure><img src="https://.../scan.jpg" alt="Ultrasound scan" /><figcaption>Pregnancy scan — day 45</figcaption></figure>

11. **Progress / Meters** (labelled bars for coverage, completion, or budget usage). Each <li> needs data-value (a percentage 0–100, or a raw number paired with data-max). Optional data-tone ("primary" | "success" | "warning" | "critical" | "neutral"), data-display for a custom readout, and action attributes to make a bar tappable. Add data-title on the list for an optional heading:
<ul data-progress data-title="Season readiness">
  <li data-value="82" data-tone="success">Vaccination coverage</li>
  <li data-value="18" data-max="24" data-display="18 / 24 paddocks">Grazing rotation</li>
  <li data-value="46" data-tone="warning" data-action-type="navigate" data-action-target="/budget">Feed budget used</li>
</ul>

12. **Image** (a richer image than the plain Media block — supports an aspect ratio hint and an optional click-through URL). Mark the <figure> with data-image; optional data-aspect ("16/9" | "4/3" | "1/1" | "3/4" | "9/16" | "auto") and data-href for a link:
<figure data-image data-aspect="16/9" data-href="/paddocks/b">
  <img src="https://.../paddock.jpg" alt="Paddock B after the July restock" />
  <figcaption>Paddock B — post-restock</figcaption>
</figure>

13. **Gallery** (horizontal scroll strip or responsive grid of images). Wrap images in a <figure data-gallery> (or <div data-gallery>); data-layout defaults to "scroll" — use "grid" for a wrapping grid. Per-image click-through works via data-href on the <img> or a wrapping <a>:
<figure data-gallery data-layout="scroll">
  <img src="https://.../field-1.jpg" alt="Field one" />
  <img src="https://.../field-2.jpg" alt="Field two" data-href="/paddocks/2" />
  <img src="https://.../field-3.jpg" alt="Field three" />
</figure>

14. **Video** (inline HTML5 video with native controls). Provide src (and optionally poster for a preview frame). Wrap in a <figure> to add a caption; optional data-aspect for consistent framing:
<figure data-aspect="16/9">
  <video src="https://.../demo.mp4" poster="https://.../demo-poster.jpg" controls></video>
  <figcaption>Product walkthrough</figcaption>
</figure>

15. **Product card** (ecommerce-style tile with image, price, rating, and CTAs). Use <article data-product> with data-price on the article; add data-original-price for a strike-through, data-badge for a corner tag, data-rating (0–5, with optional data-rating-max and data-rating-count), data-subtitle for a short line under the title. Buttons go inside a <div data-actions> container; add data-variant="primary" to emphasise the main CTA:
<article data-product data-price="$49.99" data-original-price="$69.99" data-badge="-29%" data-rating="4.5" data-rating-count="342" data-subtitle="ACME · sku ACM-4711">
  <img src="https://.../headphones.jpg" alt="Noise-cancelling headphones" />
  <h3>ACME Studio Pro Headphones</h3>
  <div data-actions>
    <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-4711" data-variant="primary">Add to cart</button>
    <button data-action-type="navigate" data-action-id="open-product" data-action-target="/products/ACM-4711">Details</button>
  </div>
</article>

To show several products together, wrap them in <section data-products> — data-layout defaults to "scroll" (horizontal snap strip) or use "grid" for a wrapping grid:
<section data-products data-layout="scroll">
  <article data-product ...>...</article>
  <article data-product ...>...</article>
</section>

16. **Cart summary** (line items plus a totals block and checkout CTAs). Use <section data-cart>: an inner <ul data-items> holds one <li data-item> per line (each with data-price and data-quantity, an inner element carrying data-title, optional data-note, and an <img> for the thumbnail). A <ul data-summary> holds label/value rows using [data-label] and [data-value], add data-emphasis on the grand total. Buttons go in a <div data-actions>:
<section data-cart>
  <h3 data-title>Your cart</h3>
  <ul data-items>
    <li data-item data-price="$99.98" data-quantity="2">
      <img src="https://.../headphones.jpg" alt="Headphones" />
      <span data-title>ACME Studio Pro Headphones</span>
      <span data-note>Midnight blue</span>
    </li>
    <li data-item data-price="$19.99" data-quantity="1">
      <img src="https://.../cable.jpg" alt="Cable" />
      <span data-title>Braided USB-C cable · 2m</span>
    </li>
  </ul>
  <ul data-summary>
    <li><span data-label>Subtotal</span><span data-value>$119.97</span></li>
    <li><span data-label>Shipping</span><span data-value>$5.99</span></li>
    <li data-emphasis><span data-label>Total</span><span data-value>$125.96</span></li>
  </ul>
  <div data-actions>
    <button data-action-type="custom-command" data-action-id="checkout" data-variant="primary">Checkout</button>
    <button data-action-type="navigate" data-action-id="continue-shopping" data-action-target="/shop">Continue shopping</button>
  </div>
</section>
`;

export const getSystemPromptInstruction = (options?: SystemPromptOptions): string => {
  if (!options?.allowedActions?.length) {
    return CONVERSED_SYSTEM_PROMPT;
  }

  const actionsList = options.allowedActions
    .map(a => `- \`${a.actionId}\`: ${a.description} (Params: ${JSON.stringify(a.exampleParams || {})})`)
    .join('\n');

  return `${CONVERSED_SYSTEM_PROMPT}\n\nAllowed Custom Actions:\n${actionsList}`;
};
