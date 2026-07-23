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
