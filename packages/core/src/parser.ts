import {
  AgentActionPayload,
  CalloutBlock,
  CalloutTone,
  ChartBlock,
  ConversedContentBlock,
  RowAction,
  StatItem,
  StatTrend,
  StepItem,
  TableBlock,
  TableRow,
  TimelineItem
} from './types.js';

const WRAPPER_TAGS = new Set(['div', 'section', 'article']);

// data-* attributes with a dedicated meaning elsewhere in the parser; everything
// else on an actionable element is treated as an extra action param.
const RESERVED_ACTION_ATTRS = new Set([
  'data-action-type',
  'data-action-id',
  'data-action-target',
  'data-action-params',
  'data-link-type',
  'data-link-id',
  'data-delta',
  'data-trend',
  'data-tone',
  'data-time',
  'data-chart',
  'data-labels',
  'data-values',
  'data-values-2',
  'data-series-label',
  'data-series-label-2',
  'data-color',
  'data-color-2',
  'data-followups',
  'data-steps',
  'data-timeline',
  'data-row-actions',
  'data-variant'
]);

const toCamelCase = (dashed: string): string =>
  dashed.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());

// Any non-reserved data-* attribute becomes an action param (e.g. data-record-kind
// → params.recordKind), so domain metadata survives alongside the generic action.
const collectExtraParams = (element: Element): Record<string, unknown> | undefined => {
  const extras: Record<string, unknown> = {};
  for (const attr of Array.from(element.attributes)) {
    if (!attr.name.startsWith('data-') || RESERVED_ACTION_ATTRS.has(attr.name)) continue;
    extras[toCamelCase(attr.name.slice('data-'.length))] = attr.value;
  }
  return Object.keys(extras).length ? extras : undefined;
};

export const parseActionFromElement = (element: Element): AgentActionPayload | undefined => {
  const type = element.getAttribute('data-action-type') as AgentActionPayload['type'] | null;
  const actionId = element.getAttribute('data-action-id') || element.getAttribute('data-link-type') || undefined;

  if (!actionId && !type) return undefined;

  const target = element.getAttribute('data-action-target') || element.getAttribute('data-link-id') || undefined;
  const paramsAttr = element.getAttribute('data-action-params');
  let jsonParams: Record<string, unknown> | undefined;

  if (paramsAttr) {
    try {
      jsonParams = JSON.parse(paramsAttr);
    } catch {
      // Fallback if not valid JSON
    }
  }

  const extraParams = collectExtraParams(element);
  const params =
    extraParams || jsonParams ? { ...extraParams, ...jsonParams } : undefined;

  return {
    type: type || (target ? 'navigate' : 'custom-command'),
    ...(actionId ? { actionId } : { actionId: 'default' }),
    target,
    params
  };
};

// Extracts the inline action buttons declared in a row's `data-row-actions` cell.
const parseRowActions = (actionCell: Element): RowAction[] =>
  Array.from(actionCell.querySelectorAll('button, a'))
    .map((element): RowAction | null => {
      const action = parseActionFromElement(element);
      const label = (element.textContent ?? '').trim();
      if (!action || !label) return null;
      const variant = element.getAttribute('data-variant') === 'primary' ? 'primary' : undefined;
      return { label, ...(variant ? { variant } : {}), action };
    })
    .filter((rowAction): rowAction is RowAction => rowAction !== null);

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
      const actionCell = Array.from(row.children).find((child) =>
        child.hasAttribute('data-row-actions')
      );
      const cells = Array.from(row.querySelectorAll('td, th'))
        .filter((cell) => cell !== actionCell)
        .map((cell) => cell.innerHTML.trim());
      if (!cells.some((cell) => cell.length > 0)) return null;
      const action = parseActionFromElement(row);
      const actions = actionCell ? parseRowActions(actionCell) : [];
      return {
        cells,
        ...(action ? { action } : {}),
        ...(actions.length ? { actions } : {})
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

/** Splits an <li> into an optional leading <strong> title and the remaining HTML body. */
const splitTitleBody = (listItem: Element): { title?: string; html: string } => {
  const fullHtml = listItem.innerHTML.trim();
  const firstChild = listItem.firstElementChild;
  if (
    firstChild &&
    firstChild.tagName.toLowerCase() === 'strong' &&
    fullHtml.startsWith(firstChild.outerHTML)
  ) {
    return {
      title: firstChild.innerHTML.trim(),
      html: fullHtml.slice(firstChild.outerHTML.length).trim()
    };
  }
  return { html: fullHtml };
};

const parseDetailsBlock = (element: Element): ConversedContentBlock | null => {
  const summaryElement = element.querySelector(':scope > summary');
  const summary = summaryElement?.innerHTML.trim() || 'Details';
  const bodyHtml = Array.from(element.children)
    .filter((child) => child.tagName.toLowerCase() !== 'summary')
    .map((child) => child.outerHTML)
    .join('')
    .trim();

  if (!summaryElement && !bodyHtml) return null;
  return {
    type: 'details',
    summary,
    html: bodyHtml,
    open: element.hasAttribute('open')
  };
};

const parseStepsBlock = (element: Element): ConversedContentBlock | null => {
  const items: StepItem[] = Array.from(element.querySelectorAll(':scope > li'))
    .map((listItem) => splitTitleBody(listItem))
    .filter((step) => step.title || step.html);
  if (!items.length) return null;
  return { type: 'steps', items };
};

const parseTimelineBlock = (element: Element): ConversedContentBlock | null => {
  const items: TimelineItem[] = Array.from(element.querySelectorAll(':scope > li'))
    .map((listItem): TimelineItem => {
      const { title, html } = splitTitleBody(listItem);
      const time = listItem.getAttribute('data-time')?.trim() || undefined;
      return {
        ...(time ? { time } : {}),
        ...(title ? { title } : {}),
        html
      };
    })
    .filter((entry) => entry.title || entry.html || entry.time);
  if (!items.length) return null;
  return { type: 'timeline', items };
};

const parseMediaBlock = (element: Element): ConversedContentBlock | null => {
  const isImg = element.tagName.toLowerCase() === 'img';
  const imgElement = isImg ? element : element.querySelector('img');
  const src = imgElement?.getAttribute('src')?.trim();
  if (!src) return null;

  const alt = imgElement?.getAttribute('alt')?.trim() || undefined;
  const caption = isImg
    ? undefined
    : element.querySelector('figcaption')?.textContent?.trim() || undefined;

  return {
    type: 'media',
    src,
    ...(alt ? { alt } : {}),
    ...(caption ? { caption } : {})
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
    const onlyImage =
      element.children.length === 1 &&
      element.children[0].tagName.toLowerCase() === 'img' &&
      (element.textContent ?? '').trim() === '';
    if (onlyImage) {
      const mediaBlock = parseMediaBlock(element.children[0]);
      if (mediaBlock) {
        blocks.push(mediaBlock);
        return;
      }
    }
    const innerHtml = element.innerHTML.trim();
    if (innerHtml) blocks.push({ type: 'paragraph', html: innerHtml });
    return;
  }

  if ((tag === 'ul' || tag === 'ol') && element.hasAttribute('data-followups')) {
    const items = Array.from(element.querySelectorAll(':scope > li'))
      .map((listItem) => (listItem.textContent ?? '').trim())
      .filter(Boolean)
      .slice(0, 5);
    if (items.length) blocks.push({ type: 'followups', items });
    return;
  }

  if ((tag === 'ul' || tag === 'ol') && element.hasAttribute('data-steps')) {
    const stepsBlock = parseStepsBlock(element);
    if (stepsBlock) blocks.push(stepsBlock);
    return;
  }

  if ((tag === 'ul' || tag === 'ol') && element.hasAttribute('data-timeline')) {
    const timelineBlock = parseTimelineBlock(element);
    if (timelineBlock) blocks.push(timelineBlock);
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

  if (tag === 'details') {
    const detailsBlock = parseDetailsBlock(element);
    if (detailsBlock) blocks.push(detailsBlock);
    return;
  }

  if (tag === 'figure') {
    if (element.hasAttribute('data-chart')) {
      const chartBlock = parseChartBlock(element);
      if (chartBlock) blocks.push(chartBlock);
      return;
    }
    const mediaBlock = parseMediaBlock(element);
    if (mediaBlock) blocks.push(mediaBlock);
    return;
  }

  if (tag === 'img') {
    const mediaBlock = parseMediaBlock(element);
    if (mediaBlock) blocks.push(mediaBlock);
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
