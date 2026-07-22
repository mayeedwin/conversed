import { ConversedContentBlock } from './types.js';
import { parseMessageBlocks } from './parser.js';

export interface ConversedStreamChunk {
  text?: string;
  content?: Array<{ text?: string }>;
  delta?: string | { content?: string };
}

export type ConversedStreamInput =
  | AsyncIterable<ConversedStreamChunk | string>
  | ReadableStream<ConversedStreamChunk | string>
  | any;

/**
 * Consumes any LLM token stream (Firebase Genkit, OpenAI, Anthropic, Vercel AI SDK,
 * Firebase Cloud Functions, or standard ReadableStream) in real-time and yields
 * updated ConversedContentBlock[] AST arrays chunk-by-chunk.
 */
export async function* consumeConversedStream(
  stream: ConversedStreamInput,
  onBlockUpdate?: (blocks: ConversedContentBlock[]) => void
): AsyncGenerator<{ rawText: string; blocks: ConversedContentBlock[] }> {
  let accumulatedText = '';

  const extractTextFromChunk = (chunk: any): string => {
    if (typeof chunk === 'string') return chunk;
    if (!chunk) return '';
    if (chunk.text) return chunk.text;
    if (chunk.delta) {
      return typeof chunk.delta === 'string' ? chunk.delta : chunk.delta.content || '';
    }
    if (Array.isArray(chunk.content) && chunk.content[0]?.text) {
      return chunk.content[0].text;
    }
    return '';
  };

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
      const text = extractTextFromChunk(chunk);
      if (text) {
        yield processChunkText(text);
      }
    }
  } else if (stream && typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = extractTextFromChunk(value);
      if (text) {
        yield processChunkText(text);
      }
    }
  }
}

/** @deprecated Alias for backward compatibility. Use consumeConversedStream instead. */
export const consumeGenkitStream = consumeConversedStream;
