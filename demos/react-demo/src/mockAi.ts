import { parseMessageBlocks } from '@conversed/core';
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
  }
];

export async function* streamConsoleResponse(
  markdownText: string,
  delayMs: number = 20
): AsyncGenerator<{ text: string; blocks: ConversedContentBlock[] }> {
  let accumulated = '';
  const chunkSize = 12;
  let cursor = 0;

  while (cursor < markdownText.length) {
    const nextCursor = Math.min(cursor + chunkSize, markdownText.length);
    accumulated += markdownText.slice(cursor, nextCursor);
    cursor = nextCursor;

    yield {
      text: accumulated,
      blocks: parseMessageBlocks(accumulated)
    };

    if (cursor < markdownText.length && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
