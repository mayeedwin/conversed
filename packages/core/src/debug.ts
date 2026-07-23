import { AgentActionEvent, ConversedContentBlock } from './types.js';

const BADGE = 'background:#0071e3;color:#fff;border-radius:4px;padding:2px 8px;font-weight:700';
const BADGE_L =
  'background:#0071e3;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px;font-weight:700';
const BADGE_R = 'background:#e5e5ea;color:#1c1c1e;border-radius:0 4px 4px 0;padding:2px 6px';
const DIM = 'color:#8e8e93;font-weight:600';
const BLUE = 'color:#0071e3;font-weight:600';

const blockPreview = (block: ConversedContentBlock): string => {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return block.html.replace(/<[^>]+>/g, '').trim().slice(0, 70);
    case 'list':
      return `${block.items.length} items`;
    case 'table':
      return `${block.rows.length} rows × ${block.headers.length} cols`;
    case 'stats':
      return `${block.items.length} metric${block.items.length === 1 ? '' : 's'}`;
    case 'callout':
      return `${block.tone}${block.title ? ' · ' + block.title : ''}`;
    case 'code':
      return block.language ?? 'code';
    case 'chart':
      return `${block.chartType} · ${block.labels.length} pts`;
    case 'followups':
      return `${block.items.length} chips`;
    case 'divider':
      return '—';
    case 'custom':
      return block.customType;
    default:
      return '';
  }
};

const summarize = (blocks: ConversedContentBlock[]): string =>
  blocks
    .reduce((acc, block) => {
      const found = acc.find((entry) => entry.type === block.type);
      if (found) found.count++;
      else acc.push({ type: block.type, count: 1 });
      return acc;
    }, [] as { type: string; count: number }[])
    .map((entry) => `${entry.type}×${entry.count}`)
    .join('   ') || 'no blocks';

/** Logs the raw model text alongside the blocks Conversed parsed it into. */
export const logConversedPipeline = (rawText: string, blocks: ConversedContentBlock[]) => {
  console.groupCollapsed('%cCONVERSED%c  pipeline   ·   %s', BADGE, DIM, summarize(blocks));
  console.log('%c① DEFAULT RESPONSE  ·  raw model output (plain text / HTML)', DIM);
  console.log(rawText);
  console.log('%c② CONVERSED BLOCKS  ·  parsed AST the renderer draws', BLUE);
  console.table(
    blocks.map((block, index) => ({ '#': index, type: block.type, preview: blockPreview(block) }))
  );
  console.groupEnd();
};

/** Logs an action emitted by an interactive block. */
export const logConversedAction = (event: AgentActionEvent) => {
  const action = event?.action;
  console.log('%c CONVERSED %c (action) emitted ', BADGE_L, BADGE_R, {
    type: action?.type,
    actionId: action?.actionId,
    target: action?.target,
    params: action?.params
  });
};
