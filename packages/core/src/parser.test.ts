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

  it('reads a valid data-status onto a row-action button and drops an invalid one', () => {
    const html = `
      <table>
        <tbody>
          <tr>
            <td>Feed goats</td>
            <td data-row-actions>
              <button data-action-type="custom-command" data-action-id="task-complete" data-action-target="t1" data-status="pending">Complete</button>
              <button data-action-type="custom-command" data-action-id="task-cancel" data-action-target="t1" data-status="bogus">Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>`;
    const table = parseMessageBlocks(html)[0];
    expect(table.type).toBe('table');
    if (table.type !== 'table') return;
    const actions = table.rows[0].actions ?? [];
    expect(actions[0].status).toBe('pending');
    // Invalid status is ignored (no status key), and never leaks into action params.
    expect(actions[1].status).toBeUndefined();
    expect(actions[1].action.params).toBeUndefined();
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

  it('parses an image block with aspect and href', () => {
    const html = `
      <figure data-image data-aspect="16/9" data-href="/paddocks/b">
        <img src="https://example.com/paddock.jpg" alt="Paddock B" />
        <figcaption>Paddock B at sunrise</figcaption>
      </figure>`;
    const block = parseMessageBlocks(html)[0];
    expect(block).toEqual({
      type: 'image',
      src: 'https://example.com/paddock.jpg',
      alt: 'Paddock B',
      caption: 'Paddock B at sunrise',
      aspect: '16/9',
      href: '/paddocks/b'
    });
  });

  it('parses a scroll gallery with per-item href', () => {
    const html = `
      <figure data-gallery data-layout="scroll">
        <img src="https://example.com/a.jpg" alt="A" />
        <img src="https://example.com/b.jpg" alt="B" data-href="/b/large" />
        <img src="https://example.com/c.jpg" alt="C" />
      </figure>`;
    const block = parseMessageBlocks(html)[0];
    expect(block.type).toBe('gallery');
    if (block.type !== 'gallery') return;
    expect(block.layout).toBe('scroll');
    expect(block.items).toHaveLength(3);
    expect(block.items[1]).toEqual({
      src: 'https://example.com/b.jpg',
      alt: 'B',
      href: '/b/large'
    });
  });

  it('parses a grid gallery when data-layout="grid"', () => {
    const html = `
      <div data-gallery data-layout="grid">
        <img src="https://example.com/a.jpg" alt="A" />
        <img src="https://example.com/b.jpg" alt="B" />
      </div>`;
    const block = parseMessageBlocks(html)[0];
    expect(block.type).toBe('gallery');
    if (block.type !== 'gallery') return;
    expect(block.layout).toBe('grid');
    expect(block.items.map((i) => i.src)).toEqual([
      'https://example.com/a.jpg',
      'https://example.com/b.jpg'
    ]);
  });

  it('parses a native <video> element as a video block', () => {
    const html = `
      <figure data-aspect="16/9">
        <video src="https://example.com/clip.mp4" poster="https://example.com/poster.jpg" controls></video>
        <figcaption>Weekly walkthrough</figcaption>
      </figure>`;
    const block = parseMessageBlocks(html)[0];
    expect(block).toEqual({
      type: 'video',
      src: 'https://example.com/clip.mp4',
      poster: 'https://example.com/poster.jpg',
      caption: 'Weekly walkthrough',
      aspect: '16/9'
    });
  });

  it('parses a product card with rating, actions, and pricing', () => {
    const html = `
      <article data-product data-price="$49.99" data-original-price="$69.99" data-badge="-29%" data-rating="4.5" data-rating-count="342" data-subtitle="ACME · ACM-4711">
        <img src="https://example.com/p.jpg" alt="ACME Pro" />
        <h3>ACME Pro Headphones</h3>
        <div data-actions>
          <button data-action-type="custom-command" data-action-id="add-to-cart" data-action-target="ACM-4711" data-variant="primary">Add to cart</button>
          <button data-action-type="navigate" data-action-id="details" data-action-target="/p/ACM-4711">Details</button>
        </div>
      </article>`;
    const block = parseMessageBlocks(html)[0];
    expect(block.type).toBe('product');
    if (block.type !== 'product') return;
    expect(block.title).toBe('ACME Pro Headphones');
    expect(block.price).toBe('$49.99');
    expect(block.originalPrice).toBe('$69.99');
    expect(block.badge).toBe('-29%');
    expect(block.subtitle).toBe('ACME · ACM-4711');
    expect(block.image).toBe('https://example.com/p.jpg');
    expect(block.rating).toEqual({ value: 4.5, count: 342 });
    expect(block.actions).toHaveLength(2);
    expect(block.actions?.[0]).toMatchObject({ label: 'Add to cart', variant: 'primary' });
  });

  it('parses a product list as a products block with layout', () => {
    const html = `
      <section data-products data-layout="scroll">
        <article data-product data-price="$1"><h3>A</h3></article>
        <article data-product data-price="$2"><h3>B</h3></article>
        <article data-product data-price="$3"><h3>C</h3></article>
      </section>`;
    const block = parseMessageBlocks(html)[0];
    expect(block.type).toBe('products');
    if (block.type !== 'products') return;
    expect(block.layout).toBe('scroll');
    expect(block.items.map((i) => i.title)).toEqual(['A', 'B', 'C']);
  });

  it('parses a cart summary with lines, summary rows, and CTAs', () => {
    const html = `
      <section data-cart>
        <h3 data-title>Your cart</h3>
        <ul data-items>
          <li data-item data-price="$99.98" data-quantity="2">
            <img src="https://example.com/h.jpg" alt="Headphones" />
            <span data-title>Headphones</span>
            <span data-note>Blue</span>
          </li>
        </ul>
        <ul data-summary>
          <li><span data-label>Subtotal</span><span data-value>$99.98</span></li>
          <li data-emphasis><span data-label>Total</span><span data-value>$99.98</span></li>
        </ul>
        <div data-actions>
          <button data-action-type="custom-command" data-action-id="checkout" data-variant="primary">Checkout</button>
        </div>
      </section>`;
    const block = parseMessageBlocks(html)[0];
    expect(block.type).toBe('cart');
    if (block.type !== 'cart') return;
    expect(block.title).toBe('Your cart');
    expect(block.items).toHaveLength(1);
    expect(block.items[0]).toEqual({
      title: 'Headphones',
      price: '$99.98',
      quantity: 2,
      image: 'https://example.com/h.jpg',
      note: 'Blue'
    });
    expect(block.summary).toEqual([
      { label: 'Subtotal', value: '$99.98' },
      { label: 'Total', value: '$99.98', emphasis: true }
    ]);
    expect(block.actions?.[0]).toMatchObject({ label: 'Checkout', variant: 'primary' });
  });

  it('keeps a plain <figure><img> as a media block for backward compatibility', () => {
    const html = `<figure><img src="https://example.com/x.jpg" alt="X" /></figure>`;
    const block = parseMessageBlocks(html)[0];
    expect(block).toEqual({ type: 'media', src: 'https://example.com/x.jpg', alt: 'X' });
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
