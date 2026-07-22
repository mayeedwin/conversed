import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversedContentBlock, ConversedMessage, AgentActionEvent, AgentActionPayload, ConversedThemeTokens, generateCssVariables } from '@conversed/core';

@Component({
  selector: 'conversed-block',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [ngSwitch]="block.type">
      <!-- Paragraph -->
      <p *ngSwitchCase="'paragraph'" class="conversed-p" [innerHTML]="block.html"></p>

      <!-- Heading -->
      <div *ngSwitchCase="'heading'" [class]="'conversed-h conversed-h' + block.level" [innerHTML]="block.html"></div>

      <!-- List -->
      <ul *ngSwitchCase="'list'" [class.conversed-ol]="block.ordered" [class.conversed-ul]="!block.ordered">
        <li *ngFor="let item of block.items" [innerHTML]="item"></li>
      </ul>

      <!-- Code -->
      <div *ngSwitchCase="'code'" class="conversed-code-wrapper">
        <div class="conversed-code-header" *ngIf="block.language">
          <span>{{ block.language }}</span>
          <button (click)="copyCode(block.content)">Copy</button>
        </div>
        <pre class="conversed-code"><code>{{ block.content }}</code></pre>
      </div>

      <!-- Callout -->
      <div *ngSwitchCase="'callout'" [class]="'conversed-callout conversed-callout-' + block.tone">
        <span class="conversed-callout-badge">{{ block.badgeLabel }}</span>
        <strong *ngIf="block.title" class="conversed-callout-title">{{ block.title }}</strong>
        <div class="conversed-callout-body" [innerHTML]="block.html"></div>
      </div>

      <!-- Stats -->
      <div *ngSwitchCase="'stats'" class="conversed-stats-grid">
        <div
          *ngFor="let item of block.items"
          class="conversed-stat-card"
          [class.interactive]="!!item.action"
          (click)="handleAction(item.action)"
        >
          <span class="conversed-stat-label">{{ item.label }}</span>
          <span class="conversed-stat-value">{{ item.value }}</span>
          <span *ngIf="item.delta" [class]="'conversed-stat-delta conversed-trend-' + (item.trend || 'neutral')">
            {{ item.delta }}
          </span>
        </div>
      </div>

      <!-- Table -->
      <div *ngSwitchCase="'table'" class="conversed-table-container">
        <table class="conversed-table">
          <thead *ngIf="block.headers?.length">
            <tr>
              <th *ngFor="let header of block.headers">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let row of block.rows"
              [class.interactive]="!!row.action"
              (click)="handleAction(row.action)"
            >
              <td *ngFor="let cell of row.cells" [innerHTML]="cell"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Followups -->
      <div *ngSwitchCase="'followups'" class="conversed-followups">
        <button
          *ngFor="let chip of block.items"
          class="conversed-followup-chip"
          (click)="handleAction({ type: 'prompt-submit', actionId: 'submit-prompt', target: chip })"
        >
          {{ chip }}
        </button>
      </div>

      <!-- Divider -->
      <hr *ngSwitchCase="'divider'" class="conversed-divider" />
    </ng-container>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #6366f1);
      --card-bg: var(--conversed-card-bg, rgba(255,255,255,0.04));
      --border: var(--conversed-border-color, rgba(255,255,255,0.1));
      --radius: var(--conversed-radius, 12px);
      display: block;
      color: var(--conversed-text, inherit);
      font-family: var(--conversed-font-family, inherit);
    }
    .conversed-p { margin: 0.5rem 0; line-height: 1.5; }
    .conversed-code-wrapper { background: #1e1e1e; color: #fff; border-radius: var(--radius); overflow: hidden; margin: 0.75rem 0; }
    .conversed-code-header { display: flex; justify-content: space-between; padding: 0.5rem 1rem; background: #2d2d2d; font-size: 0.8rem; }
    .conversed-code { padding: 1rem; margin: 0; overflow-x: auto; font-family: monospace; }
    .conversed-callout { padding: 0.85rem 1rem; border-radius: var(--radius); border-left: 4px solid var(--primary); background: var(--card-bg); margin: 0.75rem 0; }
    .conversed-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin: 0.75rem 0; }
    .conversed-stat-card { padding: 0.75rem; border-radius: var(--radius); background: var(--card-bg); border: 1px solid var(--border); }
    .conversed-stat-card.interactive { cursor: pointer; transition: transform 0.15s ease; }
    .conversed-stat-card.interactive:hover { transform: translateY(-2px); border-color: var(--primary); }
    .conversed-followups { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
    .conversed-followup-chip { background: var(--card-bg); color: var(--primary); border: 1px solid var(--border); border-radius: 16px; padding: 0.35rem 0.85rem; cursor: pointer; font-size: 0.85rem; }
    .conversed-followup-chip:hover { border-color: var(--primary); }
    .conversed-table-container { overflow-x: auto; margin: 0.75rem 0; }
    .conversed-table { width: 100%; border-collapse: collapse; }
    .conversed-table th, .conversed-table td { padding: 0.6rem; border-bottom: 1px solid var(--border); text-align: left; }
    .conversed-table tr.interactive { cursor: pointer; }
    .conversed-table tr.interactive:hover { background: var(--card-bg); }
  `]
})
export class ConversedBlockComponent {
  @Input({ required: true }) block!: ConversedContentBlock;
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  @Output() action = new EventEmitter<AgentActionEvent>();

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }

  handleAction(payload?: AgentActionPayload) {
    if (!payload) return;
    this.action.emit({
      action: payload,
      defaultPrevented: false
    });
  }

  copyCode(content: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }
  }
}

@Component({
  selector: 'conversed-feed',
  standalone: true,
  imports: [CommonModule, ConversedBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="conversed-feed">
      <div *ngFor="let msg of messages" [class]="'conversed-message conversed-role-' + msg.role">
        <div class="conversed-avatar">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
        <div class="conversed-content">
          <div *ngIf="msg.imageUrl" class="conversed-image">
            <img [src]="msg.imageUrl" alt="Attachment" />
          </div>
          <ng-container *ngIf="msg.blocks?.length; else textFallback">
            <conversed-block
              *ngFor="let block of msg.blocks"
              [block]="block"
              [theme]="theme"
              [primaryColor]="primaryColor"
              (action)="action.emit($event)"
            ></conversed-block>
          </ng-container>
          <ng-template #textFallback>
            <p class="conversed-p">{{ msg.text }}</p>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #6366f1);
      --card-bg: var(--conversed-card-bg, rgba(255,255,255,0.03));
      --border: var(--conversed-border-color, rgba(255,255,255,0.08));
      --radius: var(--conversed-radius, 12px);
      display: block;
    }
    .conversed-feed { display: flex; flex-direction: column; gap: 1rem; }
    .conversed-message { display: flex; gap: 0.75rem; width: 100%; }
    .conversed-message.conversed-role-user { flex-direction: row-reverse; }
    .conversed-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem; flex-shrink: 0; }
    .conversed-content { max-width: 80%; background: var(--card-bg); border-radius: var(--radius); padding: 0.85rem 1.1rem; border: 1px solid var(--border); }
    .conversed-role-user .conversed-content { background: var(--card-bg); border-color: var(--primary); }
    .conversed-image img { max-width: 100%; border-radius: var(--radius); margin-bottom: 0.5rem; }
  `]
})
export class ConversedFeedComponent {
  @Input({ required: true }) messages: ConversedMessage[] = [];
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  @Output() action = new EventEmitter<AgentActionEvent>();

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }
}
