import { ConversedContentBlock } from './types.js';

export interface ConversedStreamState {
  rawHtml: string;
  blocks: ConversedContentBlock[];
  isDone: boolean;
}

/**
 * Creates a stream accumulator to handle chunk-by-chunk LLM responses cleanly.
 */
export class ConversedStreamAccumulator {
  private rawBuffer = '';
  private parseFn: (html: string) => ConversedContentBlock[];

  constructor(parseFn: (html: string) => ConversedContentBlock[]) {
    this.parseFn = parseFn;
  }

  public appendChunk(chunk: string): ConversedStreamState {
    this.rawBuffer += chunk;
    const blocks = this.parseFn(this.rawBuffer);
    return {
      rawHtml: this.rawBuffer,
      blocks,
      isDone: false
    };
  }

  public reset(): void {
    this.rawBuffer = '';
  }

  public get currentBuffer(): string {
    return this.rawBuffer;
  }
}
