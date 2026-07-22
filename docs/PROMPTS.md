# LLM Integration & Prompt Guide

**conversed** is 100% provider-agnostic and works seamlessly with **OpenAI GPT-4o**, **Anthropic Claude 3.5**, **Google Gemini**, **Firebase Vertex AI**, or **DeepSeek**.

---

## 1. System Prompt Helper

Append `getSystemPromptInstruction()` to your system prompt:

```typescript
import { getSystemPromptInstruction } from '@conversed/core';

const systemPrompt = `
You are an AI assistant.
${getSystemPromptInstruction({
  allowedActions: [
    { actionId: 'view-detail', description: 'Deep link to item detail', exampleParams: { id: '123' } }
  ]
})}
`;
```

---

## 2. Automatic Markdown & GFM Alert Normalizer

Even if an LLM returns standard Markdown tables (`| Col 1 | Col 2 |`) or GitHub-style alerts (`> [!WARNING]`), **conversed** automatically converts them into rich AST blocks without needing custom prompts!

---

## 3. Parsing AI Responses

```typescript
import { parseMessageBlocks } from '@conversed/core';

const rawAiResponse = await callLlmApi(userInput);
const blocks = parseMessageBlocks(rawAiResponse);
```
