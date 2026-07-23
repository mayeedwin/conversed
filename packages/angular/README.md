# @conversed/angular

> Angular 17+ Signals-based UI components and block renderers for **conversed**.

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
  primaryColor="#6366f1"
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
    primaryColor="#6366f1"
    (action)="onAction($event)">
  </conversed-content>
</div>
```

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
