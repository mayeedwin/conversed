import { describe, expect, it } from 'vitest';
import { mockTokenStream, DEMO_PRESET_PROMPTS } from './mockAi';
import { consumeConversedStream, parseMessageBlocks } from '@conversed/core';

describe('demo streaming via consumeConversedStream', () => {
  it('streams token deltas and parses blocks chunk-by-chunk', async () => {
    const preset = DEMO_PRESET_PROMPTS[0];
    const states: Array<{ text: string; blockCount: number }> = [];

    for await (const update of consumeConversedStream(mockTokenStream(preset.markdown, 0))) {
      states.push({ text: update.rawText, blockCount: update.blocks.length });
    }

    expect(states.length).toBeGreaterThan(1);

    const finalState = states[states.length - 1];
    expect(finalState.text).toBe(preset.markdown);
    expect(finalState.blockCount).toBe(parseMessageBlocks(preset.markdown).length);
  });

  it('covers code and divider blocks in the automate preset', () => {
    const preset = DEMO_PRESET_PROMPTS.find((p) => p.id === 'automate');
    expect(preset).toBeDefined();
    const types = parseMessageBlocks(preset!.markdown).map((b) => b.type);
    expect(types).toContain('code');
    expect(types).toContain('divider');
  });
});
