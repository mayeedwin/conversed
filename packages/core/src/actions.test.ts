import { describe, it, expect } from 'vitest';
import { updateAction } from './actions.js';
import type { ConversedContentBlock } from './types.js';

const makeBlocks = (): ConversedContentBlock[] => [
  { type: 'paragraph', html: 'hi' },
  {
    type: 'table',
    headers: ['Task', 'Status'],
    rows: [
      {
        cells: ['Feed the goats', 'Pending'],
        actions: [
          { label: 'Start', action: { type: 'custom-command', actionId: 'task-start', target: 't-101' } },
          { label: 'Complete', variant: 'primary', action: { type: 'custom-command', actionId: 'task-complete', target: 't-101' } }
        ]
      },
      {
        cells: ['Restock feed', 'Blocked'],
        actions: [
          { label: 'Open', action: { type: 'navigate', actionId: 'open', target: '/x' } }
        ]
      }
    ]
  }
];

const firstTable = (blocks: ConversedContentBlock[]) =>
  blocks.find((b): b is Extract<ConversedContentBlock, { type: 'table' }> => b.type === 'table')!;

describe('updateAction', () => {
  it('sets status/label on the CTA matched by actionId + target', () => {
    const next = updateAction(makeBlocks(), { actionId: 'task-start', target: 't-101' }, {
      status: 'pending',
      label: 'Starting…'
    });
    const [start, complete] = firstTable(next).rows[0].actions!;
    expect(start.status).toBe('pending');
    expect(start.label).toBe('Starting…');
    // Sibling CTA in the same row is untouched.
    expect(complete.status).toBeUndefined();
    expect(complete.label).toBe('Complete');
  });

  it('patches the containing row cells by index', () => {
    const next = updateAction(makeBlocks(), { actionId: 'task-complete', target: 't-101' }, {
      status: 'done',
      cells: { 1: 'Done ✓' }
    });
    expect(firstTable(next).rows[0].cells).toEqual(['Feed the goats', 'Done ✓']);
    // Other row unaffected.
    expect(firstTable(next).rows[1].cells).toEqual(['Restock feed', 'Blocked']);
  });

  it('matches every CTA with a given actionId when target is omitted', () => {
    const blocks = makeBlocks();
    const next = updateAction(blocks, { actionId: 'task-start' }, { status: 'done' });
    expect(firstTable(next).rows[0].actions![0].status).toBe('done');
  });

  it('is immutable and returns the same reference when nothing matches', () => {
    const blocks = makeBlocks();
    const next = updateAction(blocks, { actionId: 'nope' }, { status: 'done' });
    expect(next).toBe(blocks);
  });

  it('does not mutate the input blocks', () => {
    const blocks = makeBlocks();
    updateAction(blocks, { actionId: 'task-start', target: 't-101' }, { status: 'pending' });
    expect(firstTable(blocks).rows[0].actions![0].status).toBeUndefined();
  });

  it('matches nothing for an empty selector', () => {
    const blocks = makeBlocks();
    expect(updateAction(blocks, {}, { status: 'done' })).toBe(blocks);
  });
});
