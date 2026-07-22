import React from 'react';
import type { ConversedContentBlock, ConversedMessage, AgentActionEvent, AgentActionPayload, TableRow, StatItem, ConversedThemeTokens } from '@conversed/core';
import { generateCssVariables } from '@conversed/core';

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
            'table',
            { className: 'conversed-table' },
            block.headers &&
              block.headers.length > 0 &&
              React.createElement(
                'thead',
                null,
                React.createElement(
                  'tr',
                  null,
                  block.headers.map((h: string, i: number) => React.createElement('th', { key: i }, h))
                )
              ),
            React.createElement(
              'tbody',
              null,
              block.rows.map((row: TableRow, rIdx: number) =>
                React.createElement(
                  'tr',
                  {
                    key: rIdx,
                    className: row.action ? 'interactive' : '',
                    onClick: () => handleAction(row.action)
                  },
                  row.cells.map((cell: string, cIdx: number) =>
                    React.createElement('td', { key: cIdx, dangerouslySetInnerHTML: { __html: cell } })
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
      case 'divider':
        return React.createElement('hr', { className: 'conversed-divider' });
      default:
        return null;
    }
  };

  return React.createElement('div', { className: 'conversed-block-wrapper', style: styleVars }, renderContent());
};

export interface ConversedFeedProps {
  messages: ConversedMessage[];
  primaryColor?: string;
  theme?: ConversedThemeTokens;
  onAction?: (event: AgentActionEvent) => void;
}

export const ConversedFeed: React.FC<ConversedFeedProps> = (props: ConversedFeedProps) => {
  const { messages, primaryColor, theme, onAction } = props;
  const activeTheme = theme || (primaryColor ? { primaryColor } : undefined);
  const styleVars = activeTheme ? generateCssVariables(activeTheme) : {};

  return React.createElement(
    'div',
    { className: 'conversed-feed', style: styleVars },
    messages.map((msg: ConversedMessage) =>
      React.createElement(
        'div',
        { key: msg.id, className: `conversed-message conversed-role-${msg.role}` },
        React.createElement(
          'div',
          { className: 'conversed-avatar' },
          msg.role === 'user' ? 'U' : 'AI'
        ),
        React.createElement(
          'div',
          { className: 'conversed-content' },
          msg.imageUrl &&
            React.createElement(
              'div',
              { className: 'conversed-image' },
              React.createElement('img', { src: msg.imageUrl, alt: 'Attachment' })
            ),
          msg.blocks && msg.blocks.length > 0
            ? msg.blocks.map((block: ConversedContentBlock, bIdx: number) =>
                React.createElement(ConversedBlock, { key: bIdx, block, primaryColor, theme, onAction })
              )
            : React.createElement('p', { className: 'conversed-p' }, msg.text)
        )
      )
    )
  );
};
