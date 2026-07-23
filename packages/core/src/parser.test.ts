import { describe, expect, it } from 'vitest';
import { normalizeMarkdownToHtml } from './markdown-normalizer.js';
import { parseMessageBlocks } from './parser.js';

describe('normalizeMarkdownToHtml', () => {
  it('should normalize markdown headers', () => {
    const raw = '### Hello World';
    const html = normalizeMarkdownToHtml(raw);
    expect(html).toContain('<h3>Hello World</h3>');
  });

  it('should normalize GFM alerts', () => {
    const raw = '> [!NOTE]\n> This is a note';
    const html = normalizeMarkdownToHtml(raw);
    expect(html).toContain('<blockquote data-tone="note">');
    expect(html).toContain('This is a note');
  });

  it('should normalize markdown tables', () => {
    const raw = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n';
    const html = normalizeMarkdownToHtml(raw);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Header 1</th>');
    expect(html).toContain('<td>Cell 1</td>');
  });
});

describe('parseMessageBlocks', () => {
  it('should parse paragraph blocks', () => {
    const blocks = parseMessageBlocks('Hello world');
    expect(blocks).toEqual([{ type: 'paragraph', html: 'Hello world' }]);
  });

  it('should parse heading blocks', () => {
    const blocks = parseMessageBlocks('## Heading 2');
    expect(blocks).toEqual([{ type: 'heading', level: 2, html: 'Heading 2' }]);
  });

  it('should parse GFM callout blocks', () => {
    const blocks = parseMessageBlocks('> [!WARNING]\n> Be careful');
    expect(blocks[0]).toMatchObject({
      type: 'callout',
      tone: 'warning',
      badgeLabel: 'WARNING'
    });
  });
});

describe('parseMessageBlocks — actionable table rows', () => {
  it('extracts inline row-action buttons and excludes the actions cell from cells', () => {
    const html = `
      <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody>
          <tr data-link-type="task" data-link-id="t1">
            <td>Feed goats</td>
            <td>Pending</td>
            <td data-row-actions>
              <button data-action-type="custom-command" data-action-id="task-start" data-action-target="t1">Start</button>
              <button data-action-type="custom-command" data-action-id="task-complete" data-action-target="t1" data-variant="primary">Complete</button>
            </td>
          </tr>
        </tbody>
      </table>`;
    const table = parseMessageBlocks(html)[0];
    expect(table.type).toBe('table');
    if (table.type !== 'table') return;
    const row = table.rows[0];
    expect(row.cells).toEqual(['Feed goats', 'Pending']);
    expect(row.actions).toEqual([
      {
        label: 'Start',
        action: { type: 'custom-command', actionId: 'task-start', target: 't1', params: undefined }
      },
      {
        label: 'Complete',
        variant: 'primary',
        action: { type: 'custom-command', actionId: 'task-complete', target: 't1', params: undefined }
      }
    ]);
  });

  it('folds non-reserved data-* attributes into action params (e.g. data-record-kind)', () => {
    const html = `
      <table>
        <tbody>
          <tr data-link-type="record" data-link-id="r1" data-record-kind="detail">
            <td>Row value</td>
          </tr>
        </tbody>
      </table>`;
    const table = parseMessageBlocks(html)[0];
    expect(table.type).toBe('table');
    if (table.type !== 'table') return;
    expect(table.rows[0].action).toEqual({
      type: 'navigate',
      actionId: 'record',
      target: 'r1',
      params: { recordKind: 'detail' }
    });
  });

  it('leaves ordinary rows without action or actions', () => {
    const html = `
      <table>
        <tbody>
          <tr><td>Plain</td><td>Row</td></tr>
        </tbody>
      </table>`;
    const table = parseMessageBlocks(html)[0];
    expect(table.type).toBe('table');
    if (table.type !== 'table') return;
    expect(table.rows[0]).toEqual({ cells: ['Plain', 'Row'] });
  });
});
