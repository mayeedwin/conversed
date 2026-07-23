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

export interface ConsoleLogEntry {
  id: string;
  type: 'info' | 'action' | 'parser' | 'stream';
  message: string;
  data?: unknown;
  timestamp: string;
}

export const DEMO_PRESET_PROMPTS = [
  {
    id: 'market-report',
    title: '📊 Market Intelligence Report',
    userText: 'Generate a Q3 market report with actionable financial tables.',
    markdown: [
      '# 📊 Q3 Market Intelligence Summary',
      '',
      'Here is the real-time breakdown across strategic investment portfolios:',
      '',
      '> [!NOTE]',
      '> Parsed in real-time by `@conversed/core` AST engine without provider lock-in.',
      '',
      '### Portfolio Allocation & Risk Breakdown',
      '',
      '| Asset Class | Q3 Allocation | Yield | Status | Action |',
      '| --- | --- | --- | --- | --- |',
      '| Green Tech Index | $1.45M | +18.4% | Low Risk | <button data-action-type="navigate" data-action-id="rebalance-green" data-action-target="/portfolio/green">Rebalance</button> |',
      '| Cloud AI Compute | $2.80M | +32.1% | Medium Risk | <button data-action-type="custom-command" data-action-id="buy-dip">Buy Dip</button> |',
      '| Solid-State Battery | $850K | +9.2% | High Risk | <button data-action-type="prompt-submit" data-action-id="deep-dive">Deep Dive</button> |',
      '',
      '> [!TIP]',
      '> Click any action button directly within the table to emit client-side **Action Protocol** events!',
      '',
      '### Strategic Takeaways',
      '- **Expand GPU Capacity**: Scale cloud nodes prior to Q4.',
      '- **Hedge High Yields**: Transfer profits to green tech reserves.'
    ].join('\n')
  },
  {
    id: 'system-diagnostics',
    title: '⚡ Cluster Health Diagnostics',
    userText: 'Run full system health scan on worker fleet Alpha & Beta.',
    markdown: [
      '# 🛡️ Agent Infrastructure Diagnostic Scan',
      '',
      'Automated diagnostic sweep completed across multi-region compute clusters.',
      '',
      '> [!WARNING]',
      '> High memory utilization detected on **Worker Fleet Beta (us-east-4)**.',
      '',
      '### Cluster Status Summary',
      '',
      '<div data-tone="success">',
      '  <strong>Fleet Alpha:</strong> 128 / 128 Nodes Online (0 Latency Spikes)',
      '</div>',
      '',
      '<div data-tone="warning">',
      '  <strong>Fleet Beta:</strong> 64 / 64 Nodes Online (High Memory: 91%)',
      '</div>',
      '',
      '### Quick Action Protocol Commands',
      '',
      '<button data-action-type="custom-command" data-action-id="autoscale-cluster">Autoscale (+32 Nodes)</button>',
      '<button data-action-type="prompt-submit" data-action-id="flush-cache">Flush Memory Cache</button>',
      '<button data-action-type="navigate" data-action-id="open-grafana" data-action-target="/grafana">Open Metrics</button>'
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
