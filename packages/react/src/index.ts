import React from 'react';
import { Chart, registerables } from 'chart.js';
import type { ConversedContentBlock, ChartBlock, AgentActionEvent, AgentActionPayload, TableRow, StatItem, ConversedThemeTokens } from '@conversed/core';
import { generateCssVariables, toChartJsConfig } from '@conversed/core';

Chart.register(...registerables);

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
  onAction?: (event: AgentActionEvent) => void;
}

export const ConversedBlock: React.FC<ConversedBlockProps> = (props: ConversedBlockProps) => {
  const { block, primaryColor, theme, onAction } = props;
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
          block.ordered ? 'ol' : 'ul',
          { className: block.ordered ? 'conversed-ol' : 'conversed-ul' },
          block.items.map((item: string, idx: number) =>
            React.createElement('li', { key: idx, dangerouslySetInnerHTML: { __html: item } })
          )
        );
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
                { onClick: () => navigator.clipboard?.writeText(block.content) },
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
                onClick: () => handleAction(item.action)
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
      case 'table':
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
                )
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
                    onClick: () => handleAction(row.action)
                  },
                  row.cells.map((cell: string, cIdx: number) =>
                    React.createElement('div', {
                      key: cIdx,
                      className: 'conversed-cell td-cell',
                      dangerouslySetInnerHTML: { __html: cell }
                    })
                  )
                )
              )
            )
          )
        );
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
      case 'chart':
        return React.createElement(ConversedChart, { block, primaryColor });
      case 'divider':
        return React.createElement('hr', { className: 'conversed-divider' });
      default:
        return null;
    }
  };

  return React.createElement('div', { className: 'conversed-block-wrapper', style: styleVars }, renderContent());
};

export interface ConversedContentProps {
  blocks: ConversedContentBlock[];
  primaryColor?: string;
  theme?: ConversedThemeTokens;
  onAction?: (event: AgentActionEvent) => void;
}

export const ConversedContent: React.FC<ConversedContentProps> = (props: ConversedContentProps) => {
  const { blocks, primaryColor, theme, onAction } = props;
  const activeTheme = theme || (primaryColor ? { primaryColor } : undefined);
  const styleVars = activeTheme ? generateCssVariables(activeTheme) : {};

  return React.createElement(
    'div',
    { className: 'conversed-content', style: styleVars },
    blocks.map((block: ConversedContentBlock, idx: number) =>
      React.createElement(ConversedBlock, { key: idx, block, primaryColor, theme, onAction })
    )
  );
};
