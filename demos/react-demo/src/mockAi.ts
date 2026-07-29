import type { ConversedContentBlock } from '@conversed/core';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  blocks?: ConversedContentBlock[];
  isStreaming?: boolean;
  timestamp: string;
}

/** A single Action Protocol event captured by the inspector. */
export interface ActionRecord {
  id: string;
  type: string;
  actionId: string;
  target?: string;
  params?: Record<string, unknown>;
  blockType?: string;
  timestamp: string;
}

export interface DemoPreset {
  id: string;
  title: string;
  userText: string;
  markdown: string;
}

// A tiny self-contained pasture illustration (no network needed) for the media block.
const PASTURE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='200'%3E" +
  "%3Crect width='640' height='200' fill='%23eaeadb'/%3E" +
  "%3Ccircle cx='526' cy='54' r='28' fill='%23e0a94b'/%3E" +
  "%3Cpath d='M0 150 Q160 104 320 140 T640 132 V200 H0 Z' fill='%23a7bd86'/%3E" +
  "%3Cpath d='M0 172 Q200 138 420 170 T640 166 V200 H0 Z' fill='%23829a5e'/%3E" +
  "%3C/svg%3E";

export const DEMO_PRESET_PROMPTS: DemoPreset[] = [
  {
    id: 'herd-overview',
    title: 'Herd overview',
    userText: 'Give me an overview of my herd.',
    markdown: [
      '<h2>Herd overview</h2>',
      '<p>You have <strong>18 healthy animals</strong> across two paddocks. Here are the ones that need attention first.</p>',
      '<ul>',
      '  <li><strong>Babu</strong> — French-Alpine · 4y 11m</li>',
      '  <li><strong>Bessie</strong> — Local-mixed · 1y 3m</li>',
      '  <li><strong>Nyanya</strong> — French-Alpine · 2y 5m</li>',
      '  <li><strong>Tobias</strong> — Merino sheep · 2y 5m</li>',
      '</ul>',
      '<dl>',
      '  <dt>Total animals</dt><dd data-delta="+3" data-trend="up">18</dd>',
      '  <dt>Paddocks</dt><dd>2</dd>',
      '  <dt>Due for checkup</dt>',
      '  <dd data-action-type="navigate" data-action-id="open-checkups" data-action-target="/health/checkups" data-delta="2" data-trend="down">2</dd>',
      '</dl>',
      '<p>Tap the <strong>Due for checkup</strong> card to open the health queue.</p>',
      '<ul data-followups>',
      '  <li>Show milk yield this week</li>',
      '  <li>Which animals are due for vaccination?</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'financials',
    title: 'Financial summary',
    userText: 'Show my financial summary.',
    markdown: [
      '<h2>Financial summary</h2>',
      '<p>Revenue of <strong>523,500 KES</strong> against <strong>253,000 KES</strong> in expenses — a net income of <strong>270,500 KES</strong>.</p>',
      '<dl>',
      '  <dt>Total revenue</dt><dd data-delta="+18%" data-trend="up">523,500 KES</dd>',
      '  <dt>Total expenses</dt><dd data-delta="-4%" data-trend="down">253,000 KES</dd>',
      '  <dt>Net income</dt><dd data-delta="+270,500" data-trend="up">270,500 KES</dd>',
      '</dl>',
      '<p>Income is driven by livestock sales. Tap a row to inspect the entry.</p>',
      '<table>',
      '  <thead><tr><th>Date</th><th>Category</th><th>Amount</th></tr></thead>',
      '  <tbody>',
      '    <tr data-action-type="navigate" data-action-id="open-entry" data-action-target="/ledger/1001" data-action-params=\'{"amount":380000,"category":"Livestock Sale"}\'><td>Jun 26</td><td>Livestock Sale</td><td>380,000 KES</td></tr>',
      '    <tr data-action-type="navigate" data-action-id="open-entry" data-action-target="/ledger/1002" data-action-params=\'{"amount":77000,"category":"Livestock Sale"}\'><td>Jun 26</td><td>Livestock Sale</td><td>77,000 KES</td></tr>',
      '    <tr data-action-type="navigate" data-action-id="open-entry" data-action-target="/ledger/1003" data-action-params=\'{"amount":17000,"category":"Milk"}\'><td>May 22</td><td>Milk</td><td>17,000 KES</td></tr>',
      '  </tbody>',
      '</table>',
      '<figure data-chart="bar" data-labels="Livestock|Milk|Other" data-values="484000|17000|22500" data-series-label="Income (KES)"><figcaption>Income by category</figcaption></figure>',
      '> [!TIP]',
      '> Every row and card here emits an Action Protocol event — watch the inspector on the right.',
      '<ul data-followups>',
      '  <li>Break down expenses</li>',
      '  <li>Compare against last month</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'readiness',
    title: 'Season readiness',
    userText: 'How ready are we for the dry season?',
    markdown: [
      '<h2>Season readiness</h2>',
      '<p>Where the farm stands heading into the dry season — each bar is a live meter.</p>',
      '<ul data-progress data-title="Readiness by area">',
      '  <li data-value="82" data-tone="success">Vaccination coverage</li>',
      '  <li data-value="18" data-max="24" data-display="18 / 24 paddocks">Grazing rotation</li>',
      '  <li data-value="64" data-tone="primary">Feed stockpiled</li>',
      '  <li data-value="46" data-tone="warning" data-action-type="navigate" data-action-id="open-budget" data-action-target="/budget" data-display="46% used">Feed budget</li>',
      '  <li data-value="9" data-max="20" data-tone="critical" data-display="9 / 20 done">Water points serviced</li>',
      '</ul>',
      '<p>Tap the <strong>Feed budget</strong> bar — a tappable meter emits an Action Protocol event.</p>',
      '<ul data-followups>',
      '  <li>Show my financial summary.</li>',
      '  <li>What tasks are pending?</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'vaccination',
    title: 'Vaccination how-to',
    userText: 'How do I vaccinate a new animal?',
    markdown: [
      '<h2>Vaccination protocol</h2>',
      '<p>Follow these steps when a new animal joins the herd.</p>',
      '<ol data-steps>',
      '  <li><strong>Isolate</strong> the animal from the herd for the first 24 hours.</li>',
      '  <li><strong>Record</strong> weight and age in the tracker.</li>',
      '  <li><strong>Administer</strong> the CDT dose based on the weight table below.</li>',
      '  <li>Log the batch number and schedule the booster.</li>',
      '</ol>',
      '<details>',
      '  <summary>Dosage reference</summary>',
      '  <p>Under 25kg: 1ml. 25–40kg: 1.5ml. Over 40kg: 2ml. Store vaccine at 2–8°C.</p>',
      '</details>',
      '> [!WARNING]',
      '> Never re-use needles between animals — it spreads infection across the herd.',
      '<dl>',
      '  <dt>Log vaccination</dt>',
      '  <dd data-action-type="custom-command" data-action-id="log-vaccination" data-action-params=\'{"vaccine":"CDT"}\'>Start</dd>',
      '</dl>'
    ].join('\n')
  },
  {
    id: 'season',
    title: 'Season timeline',
    userText: 'What happened this season?',
    markdown: [
      '<h2>This season at a glance</h2>',
      '<ul data-timeline>',
      '  <li data-time="May 22"><strong>First milk sale</strong> — 17,000 KES to the local co-op.</li>',
      '  <li data-time="Jun 05"><strong>Sold manure</strong> — 17,500 KES.</li>',
      '  <li data-time="Jun 26"><strong>Livestock sale</strong> — 3 goats for 380,000 KES.</li>',
      '  <li data-time="Jul 17"><strong>Restocked</strong> — added 20 layers to Paddock B.</li>',
      '</ul>',
      '<figure>',
      `  <img src="${PASTURE_SVG}" alt="Illustration of a green pasture at sunset" />`,
      '  <figcaption>Paddock B after the July restock</figcaption>',
      '</figure>',
      '<ul data-followups>',
      '  <li>Project next month’s income</li>',
      '  <li>Show the herd overview</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'gallery',
    title: 'Field gallery',
    userText: 'Show me the paddocks in pictures.',
    markdown: [
      '<h2>Field gallery</h2>',
      '<p>A single image, a horizontal strip, and a short walkthrough clip — three new rich media blocks.</p>',
      '<figure data-image data-aspect="16/9" data-href="https://picsum.photos/seed/paddock-hero/1280/720">',
      '  <img src="https://picsum.photos/seed/paddock-hero/1280/720" alt="Aerial view of paddock B at sunrise" />',
      '  <figcaption>Paddock B at sunrise — tap to open the full image</figcaption>',
      '</figure>',
      '<h3>Recent scans</h3>',
      '<figure data-gallery data-layout="scroll">',
      '  <img src="https://picsum.photos/seed/scan-1/480/360" alt="Scan 1" />',
      '  <img src="https://picsum.photos/seed/scan-2/480/360" alt="Scan 2" data-href="https://picsum.photos/seed/scan-2/1600/1200" />',
      '  <img src="https://picsum.photos/seed/scan-3/480/360" alt="Scan 3" />',
      '  <img src="https://picsum.photos/seed/scan-4/480/360" alt="Scan 4" />',
      '  <img src="https://picsum.photos/seed/scan-5/480/360" alt="Scan 5" />',
      '</figure>',
      '<h3>Walkthrough</h3>',
      '<figure data-aspect="16/9">',
      '  <video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" poster="https://picsum.photos/seed/walkthrough-poster/1280/720" controls></video>',
      '  <figcaption>Weekly walkthrough — 30s</figcaption>',
      '</figure>',
      '<ul data-followups>',
      '  <li>Which paddock needs restocking?</li>',
      '  <li>Show the herd overview.</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'shop',
    title: 'Shop the store',
    userText: 'What headphones do you recommend?',
    markdown: [
      '<h2>Top picks</h2>',
      '<p>Scroll the tiles horizontally, or tap Add to cart on any of them.</p>',
      '<section data-products data-layout="scroll">',
      '  <article data-product data-price="$249.00" data-original-price="$299.00" data-badge="-17%" data-rating="4.6" data-rating-count="1204" data-subtitle="ACME · ACM-4711">',
      '    <img src="https://picsum.photos/seed/headphones-a/480/360" alt="ACME Studio Pro Headphones" />',
      '    <h3>ACME Studio Pro Headphones</h3>',
      '    <div data-actions>',
      '      <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-4711" data-variant="primary">Add to cart</button>',
      '      <button data-action-type="navigate" data-action-id="open-product" data-action-target="/products/ACM-4711">Details</button>',
      '    </div>',
      '  </article>',
      '  <article data-product data-price="$129.00" data-rating="4.3" data-rating-count="512" data-subtitle="ACME · ACM-3320">',
      '    <img src="https://picsum.photos/seed/headphones-b/480/360" alt="ACME Everyday Wireless" />',
      '    <h3>ACME Everyday Wireless</h3>',
      '    <div data-actions>',
      '      <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-3320" data-variant="primary">Add to cart</button>',
      '    </div>',
      '  </article>',
      '  <article data-product data-price="$39.00" data-rating="4.1" data-rating-count="88" data-subtitle="ACME · ACM-1001">',
      '    <img src="https://picsum.photos/seed/headphones-c/480/360" alt="ACME Wired Buds" />',
      '    <h3>ACME Wired Buds</h3>',
      '    <div data-actions>',
      '      <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-1001" data-variant="primary">Add to cart</button>',
      '    </div>',
      '  </article>',
      '  <article data-product data-price="$599.00" data-rating="4.8" data-rating-count="203" data-badge="New" data-subtitle="ACME · ACM-9001">',
      '    <img src="https://picsum.photos/seed/headphones-d/480/360" alt="ACME Reference Over-Ear" />',
      '    <h3>ACME Reference Over-Ear</h3>',
      '    <div data-actions>',
      '      <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-9001" data-variant="primary">Add to cart</button>',
      '    </div>',
      '  </article>',
      '</section>',
      '<h3>Your cart</h3>',
      '<section data-cart>',
      '  <ul data-items>',
      '    <li data-item data-price="$249.00" data-quantity="1">',
      '      <img src="https://picsum.photos/seed/headphones-a/120/120" alt="ACME Studio Pro" />',
      '      <span data-title>ACME Studio Pro Headphones</span>',
      '      <span data-note>Midnight blue</span>',
      '    </li>',
      '    <li data-item data-price="$39.00" data-quantity="2">',
      '      <img src="https://picsum.photos/seed/headphones-c/120/120" alt="Wired buds" />',
      '      <span data-title>ACME Wired Buds</span>',
      '    </li>',
      '  </ul>',
      '  <ul data-summary>',
      '    <li><span data-label>Subtotal</span><span data-value>$327.00</span></li>',
      '    <li><span data-label>Shipping</span><span data-value>$5.99</span></li>',
      '    <li data-emphasis><span data-label>Total</span><span data-value>$332.99</span></li>',
      '  </ul>',
      '  <div data-actions>',
      '    <button data-action-type="custom-command" data-action-id="checkout" data-variant="primary">Checkout</button>',
      '    <button data-action-type="navigate" data-action-id="continue-shopping" data-action-target="/shop">Continue shopping</button>',
      '  </div>',
      '</section>',
      '<ul data-followups>',
      '  <li>Show me deals under $50</li>',
      '  <li>What&#39;s in my order history?</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'deals',
    title: 'Deals under $50',
    userText: 'Show me deals under $50',
    markdown: [
      '<h2>Deals under $50</h2>',
      '<p>Two picks under $50 right now — swipe the strip for more.</p>',
      '<section data-products data-layout="scroll">',
      '  <article data-product data-price="$39.00" data-original-price="$59.00" data-badge="-34%" data-rating="4.1" data-rating-count="88" data-subtitle="ACME · ACM-1001">',
      '    <img src="https://picsum.photos/seed/headphones-c/480/360" alt="ACME Wired Buds" />',
      '    <h3>ACME Wired Buds</h3>',
      '    <div data-actions>',
      '      <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-1001" data-variant="primary">Add to cart</button>',
      '    </div>',
      '  </article>',
      '  <article data-product data-price="$24.50" data-rating="4.4" data-rating-count="311" data-badge="Deal" data-subtitle="ACME · ACM-1002">',
      '    <img src="https://picsum.photos/seed/deal-cable/480/360" alt="Braided USB-C cable" />',
      '    <h3>Braided USB-C cable · 2m</h3>',
      '    <div data-actions>',
      '      <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-1002" data-variant="primary">Add to cart</button>',
      '    </div>',
      '  </article>',
      '  <article data-product data-price="$18.00" data-rating="3.9" data-rating-count="46" data-subtitle="ACME · ACM-1003">',
      '    <img src="https://picsum.photos/seed/deal-stand/480/360" alt="Aluminium phone stand" />',
      '    <h3>Aluminium phone stand</h3>',
      '    <div data-actions>',
      '      <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-1003" data-variant="primary">Add to cart</button>',
      '    </div>',
      '  </article>',
      '</section>',
      '<ul data-followups>',
      '  <li>What headphones do you recommend?</li>',
      '  <li>What&#39;s in my order history?</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'orders',
    title: 'Order history',
    userText: "What's in my order history?",
    markdown: [
      '<h2>Recent orders</h2>',
      '<p>Your last three orders — tap a row to open the details.</p>',
      '<table>',
      '  <thead><tr><th>Date</th><th>Order</th><th>Total</th></tr></thead>',
      '  <tbody>',
      '    <tr data-action-type="navigate" data-action-id="open-order" data-action-target="/orders/A-1042" data-action-params=\'{"orderId":"A-1042"}\'><td>Jul 12</td><td>Studio Pro Headphones + cable</td><td>$268.99</td></tr>',
      '    <tr data-action-type="navigate" data-action-id="open-order" data-action-target="/orders/A-0998" data-action-params=\'{"orderId":"A-0998"}\'><td>Jun 24</td><td>Everyday Wireless</td><td>$129.00</td></tr>',
      '    <tr data-action-type="navigate" data-action-id="open-order" data-action-target="/orders/A-0955" data-action-params=\'{"orderId":"A-0955"}\'><td>May 03</td><td>Wired Buds (×2)</td><td>$78.00</td></tr>',
      '  </tbody>',
      '</table>',
      '<ul data-followups>',
      '  <li>Show me deals under $50</li>',
      '  <li>What headphones do you recommend?</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'automate',
    title: 'Automate reports',
    userText: 'How do I automate the daily report?',
    markdown: [
      '<h2>Automate the daily report</h2>',
      '<p>Add this cron job on your server to email the herd summary every morning at 6am.</p>',
      '<pre><code class="language-bash">0 6 * * *  zao export --report daily --email you@farm.co</code></pre>',
      '<hr>',
      '<p>Prefer code? Call the API directly:</p>',
      '<pre><code class="language-ts">await zao.reports.create({ type: \'daily\', delivery: \'email\' });</code></pre>',
      '> [!NOTE]',
      '> Each code block shows its language and a copy button — click it to copy the snippet.',
      '<ul data-followups>',
      '  <li>Show my financial summary.</li>',
      '  <li>What happened this season?</li>',
      '</ul>'
    ].join('\n')
  },
  {
    id: 'tasks',
    title: 'Pending tasks',
    userText: 'What tasks are pending?',
    markdown: [
      '<h2>Pending tasks</h2>',
      '<p>Each row has its own inline actions — tap one to fire an Action Protocol event (watch the inspector).</p>',
      '<p>Each task shows a <strong>single</strong> live CTA that walks its own lifecycle — Start → Complete → a quiet “Completed” badge — instead of stacking buttons.</p>',
      '<table>',
      '  <thead><tr><th>Task</th><th>Status</th></tr></thead>',
      '  <tbody>',
      '    <tr>',
      '      <td>Feed the goats</td><td>Pending</td>',
      '      <td data-row-actions>',
      '        <button data-action-type="custom-command" data-action-id="task-advance" data-action-target="t-101" data-variant="primary">Start</button>',
      '      </td>',
      '    </tr>',
      '    <tr>',
      '      <td>Clean water troughs</td><td>Pending</td>',
      '      <td data-row-actions>',
      '        <button data-action-type="custom-command" data-action-id="task-advance" data-action-target="t-102" data-variant="primary">Start</button>',
      '      </td>',
      '    </tr>',
      '    <tr>',
      '      <td>Restock layer feed</td><td>Blocked</td>',
      '      <td data-row-actions>',
      '        <button data-action-type="navigate" data-action-id="open-supplier" data-action-target="/suppliers/acme" data-record-kind="supplier">Open supplier</button>',
      '      </td>',
      '    </tr>',
      '  </tbody>',
      '</table>',
      '<ul data-followups>',
      '  <li>Show my financial summary.</li>',
      '</ul>'
    ].join('\n')
  }
];

/**
 * Simulates an LLM token stream: yields `{ text }` deltas the way a provider SDK
 * would. Feed it to `consumeConversedStream` from `@conversed/core` to get parsed
 * blocks chunk-by-chunk — the demo uses the real adapter, not a bespoke parser loop.
 */
export async function* mockTokenStream(
  markdownText: string,
  delayMs: number = 20
): AsyncGenerator<{ text: string }> {
  const chunkSize = 12;

  for (let cursor = 0; cursor < markdownText.length; cursor += chunkSize) {
    yield { text: markdownText.slice(cursor, cursor + chunkSize) };

    if (cursor + chunkSize < markdownText.length && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
