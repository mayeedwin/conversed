# conversed

> Rich, interactive UI for AI chat. Parse an LLM reply into typed content blocks, render them in React or Angular, and get a structured event on every interaction.

▶ **Live playground:** [conversed-web.web.app](https://conversed-web.web.app)

conversed renders **content, not conversations** — each renderer takes a `blocks` array and renders rich blocks inside your own chat bubble; your app still owns roles, avatars, and the feed.

## Packages

| Package | Description |
| :--- | :--- |
| [`@conversed/core`](./core) | Parser, AST, theming tokens, Action Protocol — framework-agnostic, zero runtime deps |
| [`@conversed/react`](./react) | React 18+ components & block renderers |
| [`@conversed/angular`](./angular) | Angular 17+ Signals-based components & block renderers |

## Action Protocol

Interactive parts — table rows & inline row buttons, stat cards, follow-up chips, code copy — emit an `AgentActionEvent`: `{ type, actionId, target?, params? }`.

`type`: `navigate` · `custom-command` · `prompt-submit` · `copy-code` · `external-url`.

## Theming

Driven by `--conversed-*` CSS variables — one `primaryColor` prop (or a `:root` override) restyles every block.

```css
:root {
  --conversed-primary: #0071e3;
  --conversed-card-bg: #ffffff;
  --conversed-border-color: #e5e5ea;
  --conversed-radius: 8px;
}
```

## Docs

[Architecture](../docs/architecture.md) · [Frameworks](../docs/frameworks.md) · [Prompt guide](../docs/prompts.md) · [Theming](../docs/theming.md)

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
