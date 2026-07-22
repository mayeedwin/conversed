import { ConversedContentBlock } from './types.js';

export class ConversedParserRegistry {
  private static instance: ConversedParserRegistry;
  private customParsers: Array<(element: Element) => ConversedContentBlock | null> = [];

  static getInstance(): ConversedParserRegistry {
    if (!ConversedParserRegistry.instance) {
      ConversedParserRegistry.instance = new ConversedParserRegistry();
    }
    return ConversedParserRegistry.instance;
  }

  registerParser(parser: (element: Element) => ConversedContentBlock | null): void {
    this.customParsers.push(parser);
  }

  runCustomParsers(element: Element): ConversedContentBlock | null {
    for (const parser of this.customParsers) {
      const result = parser(element);
      if (result) return result;
    }
    return null;
  }
}
