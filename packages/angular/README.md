# @conversed/angular

> Angular 17+ Signals-based UI components and block renderers for **conversed**.

▶ **Live playground (React):** [conversed-web.web.app](https://conversed-web.web.app)

## Installation

```bash
npm install @conversed/angular @conversed/core
# or
pnpm add @conversed/angular @conversed/core
```

## Usage

### Standalone Block Renderer

Render a single AI Metric Card or Table anywhere in your Angular layout:

```html
<conversed-block
  [block]="myBlock"
  primaryColor="#0071e3"
  (action)="onAction($event)">
</conversed-block>
```

### Rendering an Assistant Message

Conversed renders **content, not conversations** — it never owns roles, avatars, or
bubbles. Its only input is `blocks`. Drop `<conversed-content>` inside your own bubble:

```html
<div class="my-chat-bubble assistant">
  <conversed-content
    [blocks]="blocks()"
    primaryColor="#0071e3"
    [debug]="true"
    (action)="onAction($event)">
  </conversed-content>
</div>
```

`ConversedContentComponent` inputs: `[blocks]`, `[primaryColor]`, `[theme]`,
`[debug]` (defaults to `false`; logs emitted actions when `true`), and the
`(action)` output. `primaryColor` defaults to `#0071e3`.

Chart blocks render via **Chart.js** (bundled dependency), and all styles are
inlined — zero CSS setup required.

```typescript
import { Component, computed, input } from '@angular/core';
import { ConversedContentComponent } from '@conversed/angular';
import { parseMessageBlocks, AgentActionEvent } from '@conversed/core';

@Component({
  selector: 'app-assistant-bubble',
  standalone: true,
  imports: [ConversedContentComponent],
  templateUrl: './assistant-bubble.component.html'
})
export class AssistantBubbleComponent {
  rawAiResponse = input.required<string>();
  blocks = computed(() => parseMessageBlocks(this.rawAiResponse()));

  onAction(event: AgentActionEvent) {
    console.log('Action triggered:', event.action);
  }
}
```

## Documentation

For full documentation and monorepo source code, visit [github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed).

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
