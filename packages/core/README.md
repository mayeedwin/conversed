# @conversed/core

> Pure TypeScript Abstract Syntax Tree (AST) definitions, Markdown/Stream Parser Engine, and Action Protocol for **conversed**.

## Installation

```bash
npm install @conversed/core
# or
pnpm add @conversed/core
```

## Features

- **AST Block Parser**: Converts HTML and Markdown strings/streams into structured `ConversedContentBlock[]`.
- **Stream Consumer**: Real-time `consumeConversedStream()` adapter for Firebase Genkit, OpenAI, Anthropic, or Web `ReadableStream` objects.
- **Action Protocol**: Standardized `AgentActionPayload` and `AgentActionEvent` models for interactive table rows, metric cards, and follow-up chips.
- **LLM System Prompt Helper**: `getSystemPromptInstruction()` for OpenAI GPT-4o, Claude 3.5, Gemini, and DeepSeek.
- **Design Token Engine**: Single-line `primaryColor` palette generator.

## Documentation

For full documentation and monorepo source code, visit [github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed).

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
