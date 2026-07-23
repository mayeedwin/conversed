import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import {
  ConversedContentBlock,
  StatsBlock,
  TableBlock,
  CalloutBlock,
  CodeBlock,
  ChartBlock,
  FollowUpBlock,
  ListBlock,
  HeadingBlock,
  ParagraphBlock,
  AgentActionEvent,
  AgentActionPayload,
  ConversedThemeTokens,
  generateCssVariables
} from '@conversed/core';

/**
 * <conversed-stats>
 * iOS-inspired flat metric grid with clean borders (no box shadows).
 */
@Component({
  selector: 'conversed-stats',
  standalone: true,
  template: `
    <div class="conversed-stats-grid">
      @for (item of block?.items || items; track $index) {
        <div
          class="conversed-stat-card"
          [class.interactive]="!!item.action"
          (click)="handleAction(item.action)"
        >
          <span class="conversed-stat-label">{{ item.label }}</span>
          <span class="conversed-stat-value">{{ item.value }}</span>
          @if (item.delta) {
            <span [class]="'conversed-stat-delta conversed-trend-' + (item.trend || 'neutral')">
              {{ item.delta }}
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      --card-bg: var(--conversed-card-bg, transparent);
      --border: var(--conversed-border-color, #e5e5ea);
      --radius: var(--conversed-radius, 8px);
      display: block;
    }
    .conversed-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(104px, 1fr)); gap: 0.35rem; margin: 0.35rem 0; }
    .conversed-stat-card {
      padding: 0.4rem 0.55rem;
      border-radius: var(--radius);
      background: var(--card-bg);
      border: 1px solid var(--border);
      box-shadow: none !important;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .conversed-stat-card.interactive { cursor: pointer; }
    .conversed-stat-card.interactive:hover { border-color: var(--primary); background: #0071e30a; }
    .conversed-stat-label { font-size: 0.62rem; opacity: 0.75; font-weight: 500; display: block; margin-bottom: 0.1rem; }
    .conversed-stat-value { font-size: 0.95rem; font-weight: 600; display: block; letter-spacing: -0.01em; }
    .conversed-stat-delta { font-size: 0.62rem; font-weight: 500; margin-top: 0.1rem; display: inline-block; }
    .conversed-trend-up { color: #34c759; }
    .conversed-trend-down { color: #ff3b30; }
    .conversed-trend-neutral { color: var(--primary); }
  `]
})
export class ConversedStatsComponent {
  @Input() block?: StatsBlock;
  @Input() items: StatsBlock['items'] = [];
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
    this.action.emit({ action: payload, defaultPrevented: false });
  }
}

/**
 * <conversed-table>
 * iOS-inspired <div> flex table container with gray-200 (#e5e5ea) borders and zero box-shadow.
 */
@Component({
  selector: 'conversed-table',
  standalone: true,
  template: `
    <div class="conversed-table-container">
      <div class="conversed-data-table">
        @if (headers.length || block?.headers?.length) {
          <div class="conversed-table-header">
            @for (header of (block?.headers || headers); track $index) {
              <div class="conversed-cell th-cell">{{ header }}</div>
            }
          </div>
        }
        <div class="conversed-table-body">
          @for (row of (block?.rows || rows); track $index) {
            <div class="conversed-table-row" [class.interactive]="!!row.action" (click)="handleAction(row.action)">
              @for (cell of row.cells; track $index) {
                <div class="conversed-cell td-cell" [innerHTML]="cell"></div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --card-bg: var(--conversed-card-bg, transparent);
      --border: var(--conversed-border-color, #e5e5ea);
      --radius: var(--conversed-radius, 8px);
      display: block;
    }
    .conversed-table-container {
      overflow-x: auto;
      margin: 0.35rem 0;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--card-bg);
      box-shadow: none !important;
    }
    .conversed-data-table { display: flex; flex-direction: column; width: 100%; min-width: 220px; font-size: 0.7rem; }
    .conversed-table-header { display: flex; border-bottom: 1px solid var(--border); background: var(--conversed-gray-100, #f2f2f7); font-weight: 600; }
    .conversed-table-row { display: flex; border-bottom: 1px solid var(--border); transition: background 0.15s ease; }
    .conversed-table-row:last-child { border-bottom: none; }
    .conversed-table-row.interactive { cursor: pointer; }
    .conversed-table-row.interactive:hover { background: #0071e30a; }
    .conversed-cell { flex: 1; min-width: 0; padding: 0.3rem 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border-right: 1px solid var(--border); }
    .conversed-cell:last-child { border-right: none; }
    .th-cell { text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.58rem; opacity: 0.65; }
  `]
})
export class ConversedTableComponent {
  @Input() block?: TableBlock;
  @Input() headers: string[] = [];
  @Input() rows: TableBlock['rows'] = [];
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
    this.action.emit({ action: payload, defaultPrevented: false });
  }
}

/**
 * <conversed-callout>
 * iOS-inspired callout block with solid left accent and zero box shadow.
 */
@Component({
  selector: 'conversed-callout',
  standalone: true,
  imports: [UpperCasePipe],
  template: `
    <div [class]="'conversed-callout conversed-callout-' + (block?.tone || tone)">
      <span class="conversed-callout-badge">{{ block?.badgeLabel || badgeLabel || (tone | uppercase) }}</span>
      @if (block?.title || title) {
        <strong class="conversed-callout-title">{{ block?.title || title }}</strong>
      }
      <div class="conversed-callout-body" [innerHTML]="block?.html || html"></div>
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      --card-bg: var(--conversed-card-bg, transparent);
      --border: var(--conversed-border-color, #e5e5ea);
      --radius: var(--conversed-radius, 8px);
      display: block;
    }
    .conversed-callout {
      padding: 0.5rem 0.65rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      border-left: 3px solid var(--primary);
      background: var(--card-bg);
      margin: 0.35rem 0;
      box-shadow: none !important;
    }
    .conversed-callout-badge { font-size: 0.58rem; font-weight: 700; opacity: 0.7; text-transform: uppercase; display: block; margin-bottom: 0.1rem; }
    .conversed-callout-title { font-weight: 600; font-size: 0.75rem; display: block; margin-bottom: 0.1rem; }
    .conversed-callout-body { font-size: 0.72rem; line-height: 1.4; }
  `]
})
export class ConversedCalloutComponent {
  @Input() block?: CalloutBlock;
  @Input() tone: CalloutBlock['tone'] = 'info';
  @Input() badgeLabel?: string;
  @Input() title?: string;
  @Input() html: string = '';
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }
}

/**
 * <conversed-followups>
 * iOS-inspired CTA chips with gray-200 (#e5e5ea) borders and zero box shadow.
 */
@Component({
  selector: 'conversed-followups',
  standalone: true,
  template: `
    <div class="conversed-followups">
      @for (chip of (block?.items || items); track $index) {
        <button
          class="conversed-followup-chip"
          (click)="handleAction({ type: 'prompt-submit', actionId: 'submit-prompt', target: chip })"
        >
          {{ chip }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      --card-bg: var(--conversed-card-bg, #ffffff);
      --border: var(--conversed-border-color, #e5e5ea);
      display: block;
    }
    .conversed-followups { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.35rem; }
    .conversed-followup-chip {
      background: var(--card-bg);
      color: var(--primary);
      border: 1px solid var(--border) !important;
      border-radius: 14px;
      padding: 0.25rem 0.65rem;
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 500;
      box-shadow: none !important;
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .conversed-followup-chip:hover {
      background: #0071e30d;
      border-color: var(--primary) !important;
    }
  `]
})
export class ConversedFollowupsComponent {
  @Input() block?: FollowUpBlock;
  @Input() items: string[] = [];
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
    this.action.emit({ action: payload, defaultPrevented: false });
  }
}

/**
 * <conversed-block>
 * Polymorphic block router for Conversed AST blocks.
 */
@Component({
  selector: 'conversed-block',
  standalone: true,
  imports: [
    ConversedStatsComponent,
    ConversedTableComponent,
    ConversedCalloutComponent,
    ConversedFollowupsComponent
  ],
  template: `
    @switch (block.type) {
      @case ('paragraph') {
        <p class="conversed-p" [innerHTML]="block.html"></p>
      }
      @case ('heading') {
        <div [class]="'conversed-h conversed-h' + block.level" [innerHTML]="block.html"></div>
      }
      @case ('list') {
        <ul [class.conversed-ol]="block.ordered" [class.conversed-ul]="!block.ordered">
          @for (item of block.items; track $index) {
            <li [innerHTML]="item"></li>
          }
        </ul>
      }
      @case ('code') {
        <div class="conversed-code-wrapper">
          @if (block.language) {
            <div class="conversed-code-header">
              <span>{{ block.language }}</span>
              <button (click)="copyCode(block.content)">Copy</button>
            </div>
          }
          <pre class="conversed-code"><code>{{ block.content }}</code></pre>
        </div>
      }
      @case ('callout') {
        <conversed-callout [block]="block" [theme]="theme" [primaryColor]="primaryColor"></conversed-callout>
      }
      @case ('stats') {
        <conversed-stats [block]="block" [theme]="theme" [primaryColor]="primaryColor" (action)="action.emit($event)"></conversed-stats>
      }
      @case ('table') {
        <conversed-table [block]="block" [theme]="theme" [primaryColor]="primaryColor" (action)="action.emit($event)"></conversed-table>
      }
      @case ('followups') {
        <conversed-followups [block]="block" [theme]="theme" [primaryColor]="primaryColor" (action)="action.emit($event)"></conversed-followups>
      }
      @case ('divider') {
        <hr class="conversed-divider" />
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .conversed-p { margin: 0; padding: 0; line-height: 1.45; font-size: 0.8rem; }
    .conversed-code-wrapper { background: #1c1c1e; color: #ffffff; border-radius: 8px; overflow: hidden; margin: 0.35rem 0; box-shadow: none !important; }
    .conversed-code-header { display: flex; justify-content: space-between; padding: 0.3rem 0.6rem; background: #2c2c2e; font-size: 0.68rem; }
    .conversed-code { padding: 0.55rem; margin: 0; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, SF Pro Text, monospace; font-size: 0.72rem; }
    .conversed-divider { border: 0; border-top: 1px solid var(--conversed-border-color, #e5e5ea); margin: 0.55rem 0; }
  `]
})
export class ConversedBlockComponent {
  @Input() block!: ConversedContentBlock;
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  @Output() action = new EventEmitter<AgentActionEvent>();

  copyCode(content: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }
  }
}

/**
 * <conversed-content>
 * Block list renderer. Drop it inside your existing chat's message bubble and
 * pass the parsed blocks; the host owns the conversation, roles, and avatars.
 */
@Component({
  selector: 'conversed-content',
  standalone: true,
  imports: [ConversedBlockComponent],
  template: `
    <div class="conversed-content">
      @for (block of blocks; track $index) {
        <conversed-block
          [block]="block"
          [theme]="theme"
          [primaryColor]="primaryColor"
          (action)="action.emit($event)"
        ></conversed-block>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .conversed-content { display: flex; flex-direction: column; gap: 0.3rem; }
  `]
})
export class ConversedContentComponent {
  @Input() blocks: ConversedContentBlock[] = [];
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  @Output() action = new EventEmitter<AgentActionEvent>();
}
