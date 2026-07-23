import {
  AgentActionPayload,
  CalloutBlock,
  CalloutTone,
  ChartBlock,
  ConversedContentBlock,
  StatItem,
  StatTrend,
  TableBlock,
  TableRow
} from './types.js';

const WRAPPER_TAGS = new Set(['div', 'section', 'article']);

export const parseActionFromElement = (element: Element): AgentActionPayload | undefined => {
  const type = element.getAttribute('data-action-type') as AgentActionPayload['type'] | null;
  const actionId = element.getAttribute('data-action-id') || element.getAttribute('data-link-type') || undefined;

  if (!actionId && !type) return undefined;

  const target = element.getAttribute('data-action-target') || element.getAttribute('data-link-id') || undefined;
  const paramsAttr = element.getAttribute('data-action-params');
  let params: Record<string, unknown> | undefined;

  if (paramsAttr) {
    try {
      params = JSON.parse(paramsAttr);
    } catch {
      // Fallback if not valid JSON
    }
  }

  return {
    type: type || (target ? 'navigate' : 'custom-command'),
    ...(actionId ? { actionId } : { actionId: 'default' }),
    target,
    params
  };
};

const resolveCalloutTone = (element: Element, title?: string): CalloutTone => {
  const toneAttr = element.getAttribute('data-tone') as CalloutTone | null;
  if (toneAttr && ['info', 'warning', 'success', 'critical', 'neutral'].includes(toneAttr)) {
    return toneAttr;
  }
  const checkText = `${title || ''} ${element.textContent || ''}`.toLowerCase();
  if (checkText.includes('warning') || checkText.includes('caution')) return 'warning';
  if (checkText.includes('success') || checkText.includes('complete')) return 'success';
  if (checkText.includes('error') || checkText.includes('critical') || checkText.includes('danger')) return 'critical';
  if (checkText.includes('info') || checkText.includes('note')) return 'info';
  return 'neutral';
};

const getCalloutBadgeLabel = (tone: CalloutTone): string => {
  switch (tone) {
    case 'info': return 'INFO';
    case 'warning': return 'WARNING';
    case 'success': return 'SUCCESS';
    case 'critical': return 'CRITICAL';
    default: return 'NOTE';
  }
};

const parseTableBlock = (tableElement: Element): ConversedContentBlock | null => {
  const tableRows = Array.from(tableElement.querySelectorAll('tr'));
  if (!tableRows.length) return null;

  let headerCells: string[] = [];
  let bodyRowElements = tableRows;

  const theadElement = tableElement.querySelector('thead');
  if (theadElement) {
    headerCells = Array.from(theadElement.querySelectorAll('th')).map((headerCell) =>
      headerCell.innerHTML.trim()
    );
    bodyRowElements = Array.from(tableElement.querySelectorAll('tbody tr'));
    if (!bodyRowElements.length) {
      bodyRowElements = tableRows.filter((row) => !theadElement.contains(row));
    }
  } else {
    const firstRow = tableRows[0];
    const firstRowCells = Array.from(firstRow.querySelectorAll('th, td'));
    const firstRowUsesHeaders = firstRowCells.some((cell) => cell.tagName.toLowerCase() === 'th');
    if (firstRowUsesHeaders) {
      headerCells = firstRowCells.map((cell) => cell.innerHTML.trim());
      bodyRowElements = tableRows.slice(1);
    }
  }

  const rows: TableRow[] = bodyRowElements
    .map((row): TableRow | null => {
      const cells = Array.from(row.querySelectorAll('td, th')).map((cell) =>
        cell.innerHTML.trim()
      );
      if (!cells.some((cell) => cell.length > 0)) return null;
      const action = parseActionFromElement(row);
      return {
        cells,
        ...(action ? { action } : {})
      };
    })
    .filter((row): row is TableRow => row !== null);

  if (!headerCells.length && !rows.length) return null;
  return { type: 'table', headers: headerCells, rows };
};

const resolveStatTrend = (delta: string, rawTrend: string | null): StatTrend | undefined => {
  if (rawTrend === 'up' || rawTrend === 'down' || rawTrend === 'neutral') return rawTrend;
  if (!delta) return undefined;
  if (delta.startsWith('+')) return 'up';
  if (delta.startsWith('-') || delta.startsWith('−')) return 'down';
  return undefined;
};

const parseDefinitionListBlock = (definitionList: Element): ConversedContentBlock | null => {
  const statItems: StatItem[] = [];
  let pendingLabel = '';

  for (const child of Array.from(definitionList.children)) {
    const childTag = child.tagName.toLowerCase();
    if (childTag === 'dt') {
      pendingLabel = child.innerHTML.trim();
      continue;
    }
    if (childTag === 'dd' && pendingLabel) {
      const delta = child.getAttribute('data-delta')?.trim() ?? '';
      const trend = resolveStatTrend(delta, child.getAttribute('data-trend'));
      const action = parseActionFromElement(child);
      statItems.push({
        label: pendingLabel,
        value: child.innerHTML.trim(),
        ...(delta ? { delta } : {}),
        ...(trend ? { trend } : {}),
        ...(action ? { action } : {})
      });
      pendingLabel = '';
    }
  }

  if (!statItems.length) return null;
  return { type: 'stats', items: statItems };
};

const parseChartBlock = (figureElement: Element): ConversedContentBlock | null => {
  const chartType = figureElement.getAttribute('data-chart');
  if (chartType !== 'bar' && chartType !== 'line' && chartType !== 'pie') return null;

  const labels =
    figureElement
      .getAttribute('data-labels')
      ?.split('|')
      .map((label) => label.trim())
      .filter(Boolean) ?? [];
  const primaryValues =
    figureElement
      .getAttribute('data-values')
      ?.split('|')
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value)) ?? [];
  if (!labels.length || !primaryValues.length) return null;

  const pointCount = Math.min(labels.length, primaryValues.length);
  const datasets = [
    {
      label: figureElement.getAttribute('data-series-label')?.trim() || 'Value',
      values: primaryValues.slice(0, pointCount),
      color: figureElement.getAttribute('data-color')?.trim() || undefined
    }
  ];

  return {
    type: 'chart',
    chartType,
    title: figureElement.querySelector('figcaption')?.textContent?.trim() || undefined,
    labels: labels.slice(0, pointCount),
    datasets
  };
};

const parseCalloutBlock = (blockquoteElement: Element): ConversedContentBlock | null => {
  const firstChild = blockquoteElement.children[0];
  let title: string | undefined;
  let bodyHtml = blockquoteElement.innerHTML.trim();

  if (firstChild?.tagName.toLowerCase() === 'strong') {
    title = firstChild.innerHTML.trim();
    bodyHtml =
      blockquoteElement.children.length > 1
        ? Array.from(blockquoteElement.children)
            .slice(1)
            .map((child) => child.outerHTML)
            .join('')
            .trim()
        : '';
  }

  if (!title && !bodyHtml) return null;
  const tone = resolveCalloutTone(blockquoteElement, title);
  return {
    type: 'callout',
    tone,
    badgeLabel: getCalloutBadgeLabel(tone),
    title,
    html: bodyHtml
  };
};

const parseElementNode = (element: Element, blocks: ConversedContentBlock[]) => {
  const tag = element.tagName.toLowerCase();

  if (WRAPPER_TAGS.has(tag)) {
    for (const childNode of Array.from(element.childNodes)) {
      parseNode(childNode, blocks);
    }
    return;
  }

  if (tag === 'p') {
    const innerHtml = element.innerHTML.trim();
    if (innerHtml) blocks.push({ type: 'paragraph', html: innerHtml });
    return;
  }

  if (tag === 'ul' && element.hasAttribute('data-followups')) {
    const items = Array.from(element.querySelectorAll(':scope > li'))
      .map((listItem) => (listItem.textContent ?? '').trim())
      .filter(Boolean)
      .slice(0, 5);
    if (items.length) blocks.push({ type: 'followups', items });
    return;
  }

  if (tag === 'ul' || tag === 'ol') {
    const listItems = Array.from(element.querySelectorAll(':scope > li')).map((listItem) =>
      listItem.innerHTML.trim()
    );
    if (listItems.length) {
      blocks.push({ type: 'list', ordered: tag === 'ol', items: listItems });
    }
    return;
  }

  if (tag === 'table') {
    const tableBlock = parseTableBlock(element);
    if (tableBlock) blocks.push(tableBlock);
    return;
  }

  if (tag === 'pre') {
    const codeElement = element.querySelector('code');
    const codeContent = (codeElement?.textContent ?? element.textContent ?? '').trim();
    const language = codeElement?.className.replace('language-', '') || undefined;
    if (codeContent) blocks.push({ type: 'code', language, content: codeContent });
    return;
  }

  if (tag === 'dl') {
    const statsBlock = parseDefinitionListBlock(element);
    if (statsBlock) blocks.push(statsBlock);
    return;
  }

  if (tag === 'blockquote') {
    const calloutBlock = parseCalloutBlock(element);
    if (calloutBlock) blocks.push(calloutBlock);
    return;
  }

  if (tag === 'figure') {
    const chartBlock = parseChartBlock(element);
    if (chartBlock) blocks.push(chartBlock);
    return;
  }

  if (/^h[1-6]$/.test(tag)) {
    const headingHtml = element.innerHTML.trim();
    if (headingHtml) {
      blocks.push({
        type: 'heading',
        level: Math.min(parseInt(tag[1], 10), 4) as 1 | 2 | 3 | 4,
        html: headingHtml
      });
    }
    return;
  }

  if (tag === 'hr') {
    blocks.push({ type: 'divider' });
    return;
  }

  const fallbackHtml = element.innerHTML.trim();
  if (fallbackHtml) blocks.push({ type: 'paragraph', html: fallbackHtml });
};

const parseNode = (node: Node, blocks: ConversedContentBlock[]) => {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    const textContent = (node.textContent ?? '').trim();
    if (textContent) blocks.push({ type: 'paragraph', html: textContent });
    return;
  }

  if (node.nodeType !== 1 /* ELEMENT_NODE */) return;
  parseElementNode(node as Element, blocks);
};

import { normalizeMarkdownToHtml } from './markdown-normalizer.js';
import { logConversedPipeline } from './debug.js';

export interface ParseOptions {
  /** When true, logs the raw text and the parsed blocks to the console. */
  debug?: boolean;
}

export const parseMessageBlocks = (
  rawHtml: string,
  options?: ParseOptions
): ConversedContentBlock[] => {
  if (!rawHtml || !rawHtml.trim()) return [];

  const html = normalizeMarkdownToHtml(rawHtml);
  let blocks: ConversedContentBlock[];

  if (typeof DOMParser === 'undefined') {
    // Basic fallback for environments without DOMParser
    blocks = [{ type: 'paragraph', html: rawHtml.trim() }];
  } else {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.querySelector('div');
    if (!container) {
      blocks = [{ type: 'paragraph', html: html.trim() }];
    } else {
      blocks = [];
      for (const node of Array.from(container.childNodes)) {
        parseNode(node, blocks);
      }
      if (!blocks.length) {
        blocks.push({ type: 'paragraph', html: rawHtml.trim() });
      }
    }
  }

  if (options?.debug) logConversedPipeline(rawHtml, blocks);

  return blocks;
};
