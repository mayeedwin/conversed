import { ConversedContentBlock } from './types.js';
import { parseMessageBlocks } from './parser.js';

export interface GenkitStreamChunk {
  text?: string;
  content?: Array<{ text?: string }>;
}

export type GenkitStreamInput = AsyncIterable<GenkitStreamChunk | string> | any;

/**
 * Consumes Firebase Genkit (or standard ReadableStream) token streams in real-time
 * and yields updated ConversedContentBlock[] AST arrays chunk-by-chunk.
 */
export async function* consumeGenkitStream(
  stream: GenkitStreamInput,
  onBlockUpdate?: (blocks: ConversedContentBlock[]) => void
): AsyncGenerator<{ rawText: string; blocks: ConversedContentBlock[] }> {
  let accumulatedText = '';

  const processChunkText = (textChunk: string) => {
    accumulatedText += textChunk;
    const blocks = parseMessageBlocks(accumulatedText);
    if (onBlockUpdate) {
      onBlockUpdate(blocks);
    }
    return { rawText: accumulatedText, blocks };
  };

  if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
    for await (const chunk of stream) {
      const text = typeof chunk === 'string' ? chunk : chunk?.text || chunk?.content?.[0]?.text || '';
      if (text) {
        yield processChunkText(text);
      }
    }
  } else if (stream && typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = typeof value === 'string' ? value : value?.text || value?.content?.[0]?.text || '';
      if (text) {
        yield processChunkText(text);
      }
    }
  }
}
