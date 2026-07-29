import React from 'react';
import { Chart, registerables } from 'chart.js';
import type { ConversedContentBlock, ChartBlock, AgentActionEvent, AgentActionPayload, TableRow, RowAction, StatItem, ProgressItem, ProductRating, ProductListItem, CartLine, CartSummaryRow, ConversedThemeTokens } from '@conversed/core';
import { generateCssVariables, toChartJsConfig, logConversedAction } from '@conversed/core';

Chart.register(...registerables);

/** Surface treatment for card-like blocks. `flat` (default) is border-only/transparent. */
export type ConversedVariant = 'flat' | 'filled';

/**
 * Presentation for list blocks. `plain` (default) is borderless clean rows;
 * `card` gives each item its own outlined card; `grouped` is the iOS-style
 * bordered box with row dividers; `directory` adds a leading initial avatar.
 */
export type ConversedListStyle = 'plain' | 'card' | 'grouped' | 'directory';

const variantClass = (variant?: ConversedVariant): string =>
  variant && variant !== 'flat' ? ` conversed-${variant}` : '';

const listStyleClass = (style?: ConversedListStyle): string =>
  style && style !== 'plain' ? ` conversed-list-${style}` : '';

// First visible character of a list item, used as the `directory` avatar glyph.
const listInitial = (html: string): string => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text ? text[0].toUpperCase() : '•';
};

// Bar fill fraction as a clamped 0–100 percentage.
const progressPercent = (item: ProgressItem): number => {
  const raw = item.max && item.max > 0 ? (item.value / item.max) * 100 : item.value;
  return Math.max(0, Math.min(100, raw));
};

// Props that make a non-button element behave as an accessible button: click and
// Enter/Space activation, focusable, and announced as a button. Returns {} when
// there is no action so plain rows/cards stay inert and out of the tab order.
const interactiveProps = (
  payload: AgentActionPayload | undefined,
  handle: (p?: AgentActionPayload) => void
): Record<string, unknown> =>
  payload
    ? {
        onClick: () => handle(payload),
        onKeyDown: (e: { key: string; preventDefault: () => void }) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handle(payload);
          }
        },
        role: 'button',
        tabIndex: 0
      }
    : {};

// ARIA gauge semantics for a progress track so assistive tech announces the fill.
// Reports on the raw value/max scale when `max` is set, else the 0–100 percent;
// `aria-valuetext` carries the custom readout (e.g. "18 / 24", "on track").
const progressAriaProps = (
  item: ProgressItem,
  pct: number,
  readout: string
): Record<string, unknown> => {
  const hasMax = !!(item.max && item.max > 0);
  return {
    role: 'progressbar',
    'aria-label': item.label,
    'aria-valuenow': Math.round(hasMax ? item.value : pct),
    'aria-valuemin': 0,
    'aria-valuemax': hasMax ? item.max : 100,
    'aria-valuetext': readout
  };
};

type DomEvent = {
  currentTarget: HTMLElement;
  target?: EventTarget | null;
  key?: string;
  preventDefault: () => void;
};

type ProductLike = { type: 'product' } & Omit<import('@conversed/core').ProductBlock, 'type'>;

const renderProductCard = (
  product: ProductLike,
  handleAction: (p?: AgentActionPayload) => void,
  key?: number
): unknown => {
  const wholeCardInteractive = !!product.action && !(product.actions && product.actions.length);
  const cardProps: Record<string, unknown> = {
    ...(key !== undefined ? { key } : {}),
    className: `conversed-product${wholeCardInteractive ? ' interactive' : ''}`,
    ...(wholeCardInteractive ? interactiveProps(product.action, handleAction) : {})
  };
  return React.createElement(
    'article',
    cardProps,
    product.image &&
      React.createElement(
        'div',
        { className: 'conversed-product-media' },
        React.createElement('img', {
          className: 'conversed-product-img',
          src: product.image,
          alt: product.title,
          loading: 'lazy'
        }),
        product.badge &&
          React.createElement('span', { className: 'conversed-product-badge' }, product.badge)
      ),
    React.createElement(
      'div',
      { className: 'conversed-product-body' },
      React.createElement('h4', { className: 'conversed-product-title' }, product.title),
      product.subtitle &&
        React.createElement('div', { className: 'conversed-product-subtitle' }, product.subtitle),
      product.rating && renderRatingStars(product.rating),
      React.createElement(
        'div',
        { className: 'conversed-product-price-row' },
        React.createElement('span', { className: 'conversed-product-price' }, product.price),
        product.originalPrice &&
          React.createElement(
            'span',
            { className: 'conversed-product-price-original' },
            product.originalPrice
          )
      ),
      product.actions &&
        product.actions.length > 0 &&
        React.createElement(
          'div',
          { className: 'conversed-product-actions' },
          product.actions.map((cta: RowAction, i: number) => {
            const status = cta.status && cta.status !== 'idle' ? cta.status : null;
            const locked = status === 'pending' || status === 'done';
            return React.createElement(
              'button',
              {
                key: i,
                type: 'button',
                className: `conversed-product-cta${cta.variant === 'primary' ? ' primary' : ''}${status ? ` conversed-status-${status}` : ''}`,
                disabled: locked,
                'aria-busy': status === 'pending' || undefined,
                onClick: locked
                  ? undefined
                  : (e: { stopPropagation: () => void }) => {
                      e.stopPropagation();
                      handleAction(cta.action);
                    }
              },
              status &&
                React.createElement('span', {
                  key: 'icon',
                  className: `conversed-action-icon conversed-action-icon-${status}`,
                  'aria-hidden': true
                }),
              cta.label
            );
          })
        )
    )
  );
};

const renderRatingStars = (rating: ProductRating): unknown => {
  const max = rating.max && rating.max > 0 ? rating.max : 5;
  const value = Math.max(0, Math.min(max, rating.value));
  const filled = Math.round(value);
  const stars = Array.from({ length: max }, (_, i) =>
    React.createElement(
      'span',
      { key: i, className: `conversed-product-star${i < filled ? ' filled' : ''}`, 'aria-hidden': true },
      '★'
    )
  );
  const readout =
    rating.count !== undefined
      ? `${value.toFixed(1)} · ${rating.count} reviews`
      : `${value.toFixed(1)} / ${max}`;
  return React.createElement(
    'div',
    { className: 'conversed-product-rating', 'aria-label': readout, title: readout },
    stars,
    React.createElement('span', { className: 'conversed-product-rating-text' }, readout)
  );
};

type PreviewItem = { url: string; alt: string };

const findGalleryDialog = (el: HTMLElement | null): HTMLDialogElement | null => {
  const container = el?.closest('.conversed-gallery, figure.conversed-image');
  return (container?.querySelector('dialog.conversed-image-modal') as HTMLDialogElement | null) ?? null;
};

const updateGalleryImage = (dialog: HTMLDialogElement) => {
  let items: PreviewItem[] = [];
  try {
    items = JSON.parse(dialog.getAttribute('data-items') || '[]');
  } catch {
    items = [];
  }
  if (!items.length) return;
  const rawIdx = Number(dialog.getAttribute('data-index') || '0');
  const idx = Math.max(0, Math.min(items.length - 1, Number.isNaN(rawIdx) ? 0 : rawIdx));
  dialog.setAttribute('data-index', String(idx));
  const img = dialog.querySelector('img.conversed-image-modal-img') as HTMLImageElement | null;
  const counter = dialog.querySelector('.conversed-image-modal-counter') as HTMLElement | null;
  const prev = dialog.querySelector('.conversed-image-modal-prev') as HTMLButtonElement | null;
  const next = dialog.querySelector('.conversed-image-modal-next') as HTMLButtonElement | null;
  if (img) {
    img.src = items[idx].url;
    img.alt = items[idx].alt;
  }
  if (counter) counter.textContent = `${idx + 1} / ${items.length}`;
  if (prev) prev.disabled = idx === 0;
  if (next) next.disabled = idx === items.length - 1;
  dialog.classList.remove('zoomed');
};

const openPreviewAtIndex = (e: DomEvent) => {
  const trigger = e.currentTarget;
  const dialog = findGalleryDialog(trigger);
  if (!dialog) return;
  const idx = Number(trigger.getAttribute('data-preview-index') || '0');
  dialog.setAttribute('data-index', String(Number.isNaN(idx) ? 0 : idx));
  updateGalleryImage(dialog);
  dialog.showModal();
};

const openImagePreview = (e: DomEvent) => {
  const dialog = findGalleryDialog(e.currentTarget);
  if (!dialog) return;
  updateGalleryImage(dialog);
  dialog.showModal();
};

const onImagePreviewKey = (e: DomEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (e.currentTarget.hasAttribute('data-preview-index')) openPreviewAtIndex(e);
    else openImagePreview(e);
  }
};

const closeDialogOnBackdrop = (e: DomEvent) => {
  if (e.target === e.currentTarget) {
    const dialog = e.currentTarget as HTMLDialogElement;
    dialog.classList.remove('zoomed');
    dialog.close();
  }
};

const closeDialogFromButton = (e: DomEvent) => {
  const dialog = e.currentTarget.closest('dialog') as HTMLDialogElement | null;
  dialog?.classList.remove('zoomed');
  dialog?.close();
};

const toggleModalZoom = (e: DomEvent) => {
  const dialog = e.currentTarget.closest('dialog') as HTMLDialogElement | null;
  dialog?.classList.toggle('zoomed');
};

const stepDialog = (delta: number) => (e: DomEvent) => {
  const dialog = e.currentTarget.closest('dialog') as HTMLDialogElement | null;
  if (!dialog) return;
  const cur = Number(dialog.getAttribute('data-index') || '0');
  dialog.setAttribute('data-index', String((Number.isNaN(cur) ? 0 : cur) + delta));
  updateGalleryImage(dialog);
};

const onDialogKey = (e: DomEvent) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    stepDialog(-1)(e);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    stepDialog(1)(e);
  }
};

const renderPreviewDialog = (items: PreviewItem[]): unknown => {
  if (!items.length) return null;
  const multi = items.length > 1;
  return React.createElement(
    'dialog',
    {
      className: 'conversed-image-modal',
      'data-items': JSON.stringify(items),
      'data-index': '0',
      onClick: closeDialogOnBackdrop,
      onKeyDown: onDialogKey,
      'aria-label': 'Image preview'
    },
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'conversed-image-modal-close',
        'aria-label': 'Close preview',
        onClick: closeDialogFromButton
      },
      '×'
    ),
    multi &&
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'conversed-image-modal-prev',
          'aria-label': 'Previous image',
          onClick: stepDialog(-1)
        },
        '‹'
      ),
    multi &&
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'conversed-image-modal-next',
          'aria-label': 'Next image',
          onClick: stepDialog(1)
        },
        '›'
      ),
    multi && React.createElement('span', { className: 'conversed-image-modal-counter' }, `1 / ${items.length}`),
    React.createElement('img', {
      className: 'conversed-image-modal-img',
      src: items[0].url,
      alt: items[0].alt,
      onClick: toggleModalZoom
    })
  );
};

const ConversedChart: React.FC<{ block: ChartBlock; primaryColor?: string }> = ({ block, primaryColor }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resolved =
      primaryColor ||
      getComputedStyle(canvas).getPropertyValue('--conversed-primary').trim() ||
      '#0071e3';
    const chart = new Chart(canvas, toChartJsConfig(block, { primaryColor: resolved }) as never);
    return () => chart.destroy();
  }, [block, primaryColor]);

  return React.createElement(
    'figure',
    { className: 'conversed-chart' },
    block.title && React.createElement('figcaption', { className: 'conversed-chart-title' }, block.title),
    React.createElement(
      'div',
      { className: 'conversed-chart-canvas' },
      React.createElement('canvas', { ref: canvasRef })
    )
  );
};

export interface ConversedBlockProps {
  block: ConversedContentBlock;
  primaryColor?: string;
  theme?: ConversedThemeTokens;
  /** Surface treatment: `flat` (default, border-only) or `filled` (adds a surface). */
  variant?: ConversedVariant;
  /** List presentation: `plain` (default), `card`, `grouped`, or `directory`. */
  listStyle?: ConversedListStyle;
  onAction?: (event: AgentActionEvent) => void;
}

export const ConversedBlock: React.FC<ConversedBlockProps> = (props: ConversedBlockProps) => {
  const { block, primaryColor, theme, variant, listStyle, onAction } = props;
  const activeTheme = theme || (primaryColor ? { primaryColor } : undefined);
  const styleVars = activeTheme ? generateCssVariables(activeTheme) : {};

  const handleAction = (payload?: AgentActionPayload) => {
    if (!payload || !onAction) return;
    onAction({
      action: payload,
      defaultPrevented: false
    });
  };

  const renderContent = () => {
    switch (block.type) {
      case 'paragraph':
        return React.createElement('p', {
          className: 'conversed-p',
          dangerouslySetInnerHTML: { __html: block.html }
        });
      case 'heading':
        return React.createElement('div', {
          className: `conversed-h conversed-h${block.level}`,
          dangerouslySetInnerHTML: { __html: block.html }
        });
      case 'list':
        return React.createElement(
          'div',
          {
            className: `conversed-list ${block.ordered ? 'conversed-list-ordered' : 'conversed-list-unordered'}${listStyleClass(listStyle)}`,
            role: 'list'
          },
          block.items.map((item: string, idx: number) =>
            React.createElement(
              'div',
              { key: idx, className: 'conversed-list-row', role: 'listitem' },
              React.createElement(
                'span',
                { className: 'conversed-list-marker', 'aria-hidden': true },
                block.ordered
                  ? `${idx + 1}`
                  : listStyle === 'directory'
                    ? listInitial(item)
                    : ''
              ),
              React.createElement('span', {
                className: 'conversed-list-content',
                dangerouslySetInnerHTML: { __html: item }
              })
            )
          )
        );
      case 'details':
        return React.createElement(
          'details',
          { className: 'conversed-details', open: block.open },
          React.createElement('summary', {
            className: 'conversed-details-summary',
            dangerouslySetInnerHTML: { __html: block.summary }
          }),
          React.createElement('div', {
            className: 'conversed-details-body',
            dangerouslySetInnerHTML: { __html: block.html }
          })
        );
      case 'steps':
        return React.createElement(
          'div',
          { className: 'conversed-steps' },
          block.items.map((step, idx: number) =>
            React.createElement(
              'div',
              { key: idx, className: 'conversed-step' },
              React.createElement('span', { className: 'conversed-step-index', 'aria-hidden': true }, `${idx + 1}`),
              React.createElement(
                'div',
                { className: 'conversed-step-content' },
                step.title &&
                  React.createElement('div', {
                    className: 'conversed-step-title',
                    dangerouslySetInnerHTML: { __html: step.title }
                  }),
                React.createElement('div', {
                  className: 'conversed-step-body',
                  dangerouslySetInnerHTML: { __html: step.html }
                })
              )
            )
          )
        );
      case 'timeline':
        return React.createElement(
          'div',
          { className: 'conversed-timeline' },
          block.items.map((entry, idx: number) =>
            React.createElement(
              'div',
              { key: idx, className: 'conversed-timeline-item' },
              React.createElement('span', { className: 'conversed-timeline-dot', 'aria-hidden': true }),
              React.createElement(
                'div',
                { className: 'conversed-timeline-content' },
                entry.time &&
                  React.createElement('span', { className: 'conversed-timeline-time' }, entry.time),
                entry.title &&
                  React.createElement('div', {
                    className: 'conversed-timeline-title',
                    dangerouslySetInnerHTML: { __html: entry.title }
                  }),
                React.createElement('div', {
                  className: 'conversed-timeline-body',
                  dangerouslySetInnerHTML: { __html: entry.html }
                })
              )
            )
          )
        );
      case 'media':
        return React.createElement(
          'figure',
          { className: 'conversed-media' },
          React.createElement('img', {
            className: 'conversed-media-img',
            src: block.src,
            alt: block.alt || '',
            loading: 'lazy'
          }),
          block.caption &&
            React.createElement('figcaption', { className: 'conversed-media-caption' }, block.caption)
        );
      case 'image': {
        const hasAspect = block.aspect && block.aspect !== 'auto';
        const frameStyle = hasAspect
          ? ({ ['--conversed-image-aspect']: block.aspect!.replace('/', ' / ') } as Record<string, string>)
          : undefined;
        const imgEl = React.createElement('img', {
          className: 'conversed-image-img',
          src: block.src,
          alt: block.alt || '',
          loading: 'lazy'
        });
        const previewUrl = block.href;
        const frame = React.createElement(
          'div',
          {
            className: `conversed-image-frame${hasAspect ? ' has-aspect' : ''}${previewUrl ? ' conversed-image-preview' : ''}`,
            style: frameStyle,
            ...(previewUrl
              ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': `Open preview${block.alt ? `: ${block.alt}` : ''}`,
                  onClick: openImagePreview,
                  onKeyDown: onImagePreviewKey
                }
              : {})
          },
          imgEl
        );
        return React.createElement(
          'figure',
          { className: 'conversed-image' },
          frame,
          block.caption &&
            React.createElement('figcaption', { className: 'conversed-image-caption' }, block.caption),
          previewUrl && renderPreviewDialog([{ url: previewUrl, alt: block.alt || block.caption || '' }])
        );
      }
      case 'gallery': {
        const layout = block.layout || 'scroll';
        const previewItems: PreviewItem[] = block.items
          .filter((item) => item.href)
          .map((item) => ({ url: item.href!, alt: item.alt || item.caption || '' }));
        const previewIndexFor = (idx: number): number => {
          let count = 0;
          for (let i = 0; i < idx; i++) if (block.items[i].href) count++;
          return count;
        };
        return React.createElement(
          'div',
          { className: `conversed-gallery conversed-gallery-${layout}` },
          block.items.map((item, idx: number) =>
            React.createElement(
              'div',
              {
                key: idx,
                className: `conversed-gallery-item${item.href ? ' interactive' : ''}`,
                ...(item.href
                  ? {
                      role: 'button',
                      tabIndex: 0,
                      'aria-label': `Open preview${item.alt ? `: ${item.alt}` : ''}`,
                      'data-preview-index': String(previewIndexFor(idx)),
                      onClick: openPreviewAtIndex,
                      onKeyDown: onImagePreviewKey
                    }
                  : {})
              },
              React.createElement('img', {
                className: 'conversed-gallery-img',
                src: item.src,
                alt: item.alt || '',
                loading: 'lazy'
              }),
              item.caption &&
                React.createElement('div', { className: 'conversed-gallery-caption' }, item.caption)
            )
          ),
          renderPreviewDialog(previewItems)
        );
      }
      case 'video': {
        const hasAspect = block.aspect && block.aspect !== 'auto';
        const frameStyle = hasAspect
          ? ({ ['--conversed-video-aspect']: block.aspect!.replace('/', ' / ') } as Record<string, string>)
          : undefined;
        return React.createElement(
          'figure',
          { className: 'conversed-video' },
          React.createElement(
            'div',
            {
              className: `conversed-video-frame${hasAspect ? ' has-aspect' : ''}`,
              style: frameStyle
            },
            React.createElement('video', {
              className: 'conversed-video-el',
              src: block.src,
              poster: block.poster,
              controls: true,
              preload: 'metadata',
              autoPlay: block.autoplay || undefined,
              muted: block.autoplay ? true : undefined,
              playsInline: true,
              'aria-label': block.alt
            })
          ),
          block.caption &&
            React.createElement('figcaption', { className: 'conversed-video-caption' }, block.caption)
        );
      }
      case 'code':
        return React.createElement(
          'div',
          { className: 'conversed-code-wrapper' },
          block.language &&
            React.createElement(
              'div',
              { className: 'conversed-code-header' },
              React.createElement('span', null, block.language),
              React.createElement(
                'button',
                {
                  onClick: () => {
                    navigator.clipboard?.writeText(block.content);
                    handleAction({
                      type: 'copy-code',
                      actionId: 'copy-code',
                      ...(block.language ? { params: { language: block.language } } : {})
                    });
                  }
                },
                'Copy'
              )
            ),
          React.createElement(
            'pre',
            { className: 'conversed-code' },
            React.createElement('code', null, block.content)
          )
        );
      case 'callout':
        return React.createElement(
          'div',
          { className: `conversed-callout conversed-callout-${block.tone}` },
          React.createElement('span', { className: 'conversed-callout-badge' }, block.badgeLabel),
          block.title &&
            React.createElement('strong', { className: 'conversed-callout-title' }, block.title),
          React.createElement('div', {
            className: 'conversed-callout-body',
            dangerouslySetInnerHTML: { __html: block.html }
          })
        );
      case 'stats':
        return React.createElement(
          'div',
          { className: 'conversed-stats-grid' },
          block.items.map((item: StatItem, idx: number) =>
            React.createElement(
              'div',
              {
                key: idx,
                className: `conversed-stat-card ${item.action ? 'interactive' : ''}`,
                ...interactiveProps(item.action, handleAction)
              },
              React.createElement('span', { className: 'conversed-stat-label' }, item.label),
              React.createElement('span', { className: 'conversed-stat-value' }, item.value),
              item.delta &&
                React.createElement(
                  'span',
                  { className: `conversed-stat-delta conversed-trend-${item.trend || 'neutral'}` },
                  item.delta
                )
            )
          )
        );
      case 'progress':
        return React.createElement(
          'div',
          { className: 'conversed-progress' },
          block.title &&
            React.createElement('div', { className: 'conversed-progress-title' }, block.title),
          block.items.map((item: ProgressItem, idx: number) => {
            const pct = progressPercent(item);
            const readout = item.display || `${Math.round(pct)}%`;
            return React.createElement(
              'div',
              {
                key: idx,
                className: `conversed-progress-item ${item.action ? 'interactive' : ''}`,
                ...interactiveProps(item.action, handleAction)
              },
              React.createElement(
                'div',
                { className: 'conversed-progress-head' },
                React.createElement('span', { className: 'conversed-progress-label' }, item.label),
                React.createElement('span', { className: 'conversed-progress-value' }, readout)
              ),
              React.createElement(
                'div',
                { className: 'conversed-progress-track', ...progressAriaProps(item, pct, readout) },
                React.createElement('div', {
                  className: `conversed-progress-bar conversed-tone-${item.tone || 'primary'}`,
                  style: { width: `${pct}%` }
                })
              )
            );
          })
        );
      case 'table': {
        const hasRowActions = block.rows.some(
          (r: TableRow) => !!r.actions && r.actions.length > 0
        );
        return React.createElement(
          'div',
          { className: 'conversed-table-container' },
          React.createElement(
            'div',
            { className: 'conversed-data-table' },
            block.headers &&
              block.headers.length > 0 &&
              React.createElement(
                'div',
                { className: 'conversed-table-header' },
                block.headers.map((h: string, i: number) =>
                  React.createElement('div', { key: i, className: 'conversed-cell th-cell' }, h)
                ),
                hasRowActions &&
                  React.createElement('div', {
                    key: 'actions-head',
                    className: 'conversed-cell th-cell actions-head',
                    'aria-hidden': true
                  })
              ),
            React.createElement(
              'div',
              { className: 'conversed-table-body' },
              block.rows.map((row: TableRow, rIdx: number) =>
                React.createElement(
                  'div',
                  {
                    key: rIdx,
                    className: `conversed-table-row ${row.action ? 'interactive' : ''}`,
                    ...interactiveProps(row.action, handleAction)
                  },
                  row.cells.map((cell: string, cIdx: number) =>
                    React.createElement('div', {
                      key: cIdx,
                      className: 'conversed-cell td-cell',
                      dangerouslySetInnerHTML: { __html: cell }
                    })
                  ),
                  hasRowActions &&
                    React.createElement(
                      'div',
                      { key: 'actions', className: 'conversed-cell actions-cell' },
                      (row.actions || []).map((rowAction: RowAction, aIdx: number) => {
                        const status =
                          rowAction.status && rowAction.status !== 'idle' ? rowAction.status : null;
                        const locked = status === 'pending' || status === 'done';
                        return React.createElement(
                          'button',
                          {
                            key: aIdx,
                            type: 'button',
                            className: `conversed-row-action ${rowAction.variant === 'primary' ? 'primary' : ''}${status ? ` conversed-status-${status}` : ''}`,
                            disabled: locked,
                            'aria-busy': status === 'pending' || undefined,
                            onClick: locked
                              ? undefined
                              : (e: { stopPropagation: () => void }) => {
                                  e.stopPropagation();
                                  handleAction(rowAction.action);
                                }
                          },
                          status &&
                            React.createElement('span', {
                              key: 'icon',
                              className: `conversed-action-icon conversed-action-icon-${status}`,
                              'aria-hidden': true
                            }),
                          rowAction.label
                        );
                      })
                    )
                )
              )
            )
          )
        );
      }
      case 'followups':
        return React.createElement(
          'div',
          { className: 'conversed-followups' },
          block.items.map((chip: string, idx: number) =>
            React.createElement(
              'button',
              {
                key: idx,
                className: 'conversed-followup-chip',
                onClick: () =>
                  handleAction({ type: 'prompt-submit', actionId: 'submit-prompt', target: chip })
              },
              chip
            )
          )
        );
      case 'product':
        return renderProductCard(block, handleAction);
      case 'products': {
        const layout = block.layout || 'scroll';
        return React.createElement(
          'div',
          { className: `conversed-products conversed-products-${layout}` },
          block.items.map((item: ProductListItem, i: number) =>
            renderProductCard({ type: 'product', ...item }, handleAction, i)
          )
        );
      }
      case 'cart':
        return React.createElement(
          'section',
          { className: 'conversed-cart' },
          block.title &&
            React.createElement('h3', { className: 'conversed-cart-title' }, block.title),
          React.createElement(
            'ul',
            { className: 'conversed-cart-lines' },
            block.items.map((line: CartLine, i: number) =>
              React.createElement(
                'li',
                {
                  key: i,
                  className: `conversed-cart-line${line.action ? ' interactive' : ''}`,
                  ...(line.action ? interactiveProps(line.action, handleAction) : {})
                },
                line.image &&
                  React.createElement('img', {
                    className: 'conversed-cart-thumb',
                    src: line.image,
                    alt: line.title,
                    loading: 'lazy'
                  }),
                React.createElement(
                  'div',
                  { className: 'conversed-cart-line-body' },
                  React.createElement('div', { className: 'conversed-cart-line-title' }, line.title),
                  line.note &&
                    React.createElement('div', { className: 'conversed-cart-line-note' }, line.note),
                  (line.quantity !== undefined) &&
                    React.createElement(
                      'div',
                      { className: 'conversed-cart-line-qty' },
                      `Qty ${line.quantity}`
                    )
                ),
                React.createElement('div', { className: 'conversed-cart-line-price' }, line.price)
              )
            )
          ),
          block.summary && block.summary.length > 0 &&
            React.createElement(
              'ul',
              { className: 'conversed-cart-summary' },
              block.summary.map((row: CartSummaryRow, i: number) =>
                React.createElement(
                  'li',
                  {
                    key: i,
                    className: `conversed-cart-summary-row${row.emphasis ? ' emphasis' : ''}`
                  },
                  React.createElement('span', { className: 'conversed-cart-summary-label' }, row.label),
                  React.createElement('span', { className: 'conversed-cart-summary-value' }, row.value)
                )
              )
            ),
          block.actions && block.actions.length > 0 &&
            React.createElement(
              'div',
              { className: 'conversed-cart-actions' },
              block.actions.map((cta: RowAction, i: number) => {
                const status = cta.status && cta.status !== 'idle' ? cta.status : null;
                const locked = status === 'pending' || status === 'done';
                return React.createElement(
                  'button',
                  {
                    key: i,
                    type: 'button',
                    className: `conversed-cart-cta${cta.variant === 'primary' ? ' primary' : ''}${status ? ` conversed-status-${status}` : ''}`,
                    disabled: locked,
                    'aria-busy': status === 'pending' || undefined,
                    onClick: locked ? undefined : () => handleAction(cta.action)
                  },
                  status &&
                    React.createElement('span', {
                      key: 'icon',
                      className: `conversed-action-icon conversed-action-icon-${status}`,
                      'aria-hidden': true
                    }),
                  cta.label
                );
              })
            )
        );
      case 'chart':
        return React.createElement(ConversedChart, { block, primaryColor });
      case 'divider':
        return React.createElement('hr', { className: 'conversed-divider' });
      default:
        return null;
    }
  };

  return React.createElement(
    'div',
    { className: `conversed-block-wrapper${variantClass(variant)}`, style: styleVars },
    renderContent()
  );
};

export interface ConversedContentProps {
  blocks: ConversedContentBlock[];
  primaryColor?: string;
  theme?: ConversedThemeTokens;
  /** Surface treatment applied to every block: `flat` (default) or `filled`. */
  variant?: ConversedVariant;
  /** List presentation applied to every list block: `plain` (default), `card`, `grouped`, or `directory`. */
  listStyle?: ConversedListStyle;
  onAction?: (event: AgentActionEvent) => void;
  debug?: boolean;
}

export const ConversedContent: React.FC<ConversedContentProps> = (props: ConversedContentProps) => {
  const { blocks, primaryColor, theme, variant, listStyle, onAction, debug } = props;
  const activeTheme = theme || (primaryColor ? { primaryColor } : undefined);
  const styleVars = activeTheme ? generateCssVariables(activeTheme) : {};

  const handleAction = (event: AgentActionEvent) => {
    if (debug) logConversedAction(event);
    onAction?.(event);
  };

  return React.createElement(
    'div',
    { className: `conversed-content${variantClass(variant)}`, style: styleVars },
    blocks.map((block: ConversedContentBlock, idx: number) =>
      React.createElement(ConversedBlock, { key: idx, block, primaryColor, theme, variant, listStyle, onAction: handleAction })
    )
  );
};
