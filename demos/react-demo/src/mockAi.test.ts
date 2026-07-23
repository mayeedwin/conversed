import { describe, expect, it } from 'vitest';
import { streamConsoleResponse, DEMO_PRESET_PROMPTS } from './mockAi';
import { parseMessageBlocks } from '@conversed/core';

describe('Console AI Mock Engine', () => {
  it('should stream response chunks and parse blocks for developer console', async () => {
    const preset = DEMO_PRESET_PROMPTS[0];
    const states: Array<{ text: string; blockCount: number }> = [];

    for await (const update of streamConsoleResponse(preset.markdown, 0)) {
      states.push({
        text: update.text,
        blockCount: update.blocks.length
      });
    }

    expect(states.length).toBeGreaterThan(1);
    const finalState = states[states.length - 1];
    expect(finalState.text).toBe(preset.markdown);
    expect(finalState.blockCount).toBeGreaterThan(0);

    const directBlocks = parseMessageBlocks(preset.markdown);
    expect(finalState.blockCount).toBe(directBlocks.length);
  });
});
