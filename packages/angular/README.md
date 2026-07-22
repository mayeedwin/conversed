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

### Full Chat Feed Component

```html
<conversed-feed
  [messages]="messages()"
  primaryColor="#6366f1"
  (action)="onAction($event)">
</conversed-feed>
```

```typescript
import { Component, signal } from '@angular/core';
import { ConversedFeedComponent, ConversedBlockComponent } from '@conversed/angular';
import { ConversedMessage, AgentActionEvent } from '@conversed/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ConversedFeedComponent, ConversedBlockComponent],
  templateUrl: './chat.component.html'
})
export class ChatComponent {
  messages = signal<ConversedMessage[]>([]);

  onAction(event: AgentActionEvent) {
    console.log('Action triggered:', event.action);
  }
}
```

## Documentation

For full documentation and monorepo source code, visit [github.com/mayeedwin/conversed](https://github.com/mayeedwin/conversed).

## License

MIT © [Maye Edwin](https://github.com/mayeedwin)
