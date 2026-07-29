import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {
  ConversedContentBlock,
  StatsBlock,
  TableBlock,
  CalloutBlock,
  CodeBlock,
  ChartBlock,
  FollowUpBlock,
  ListBlock,
  DetailsBlock,
  StepsBlock,
  TimelineBlock,
  MediaBlock,
  ProgressBlock,
  ProgressItem,
  HeadingBlock,
  ParagraphBlock,
  AgentActionEvent,
  AgentActionPayload,
  ConversedThemeTokens,
  toChartJsConfig,
  logConversedAction,
  generateCssVariables
} from '@conversed/core';

Chart.register(...registerables);

/** Surface treatment for card-like blocks. `flat` (default) is border-only/transparent. */
export type ConversedVariant = 'flat' | 'filled';

/**
 * Presentation for list blocks. `plain` (default) is borderless clean rows;
 * `card` gives each item its own outlined card; `grouped` is the iOS-style
 * bordered box with row dividers; `directory` adds a leading initial avatar.
 */
export type ConversedListStyle = 'plain' | 'card' | 'grouped' | 'directory';

// First visible character of a list item, used as the `directory` avatar glyph.
export const conversedListInitial = (html: string): string => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text ? text[0].toUpperCase() : '•';
};

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
          [attr.role]="item.action ? 'button' : null"
          [attr.tabindex]="item.action ? 0 : null"
          (click)="handleAction(item.action)"
          (keydown)="onActivate($event, item.action)"
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
      box-shadow: none;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .conversed-stat-card.interactive { cursor: pointer; }
    .conversed-stat-card.interactive:hover { border-color: var(--primary); background: var(--conversed-primary-alpha15, #0071e314); }
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

  onActivate(event: KeyboardEvent, payload?: AgentActionPayload) {
    if (!payload) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleAction(payload);
    }
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
            @if (hasRowActions) {
              <div class="conversed-cell th-cell actions-head" aria-hidden="true"></div>
            }
          </div>
        }
        <div class="conversed-table-body">
          @for (row of (block?.rows || rows); track $index) {
            <div class="conversed-table-row" [class.interactive]="!!row.action" [attr.role]="row.action ? 'button' : null" [attr.tabindex]="row.action ? 0 : null" (click)="handleAction(row.action)" (keydown)="onActivate($event, row.action)">
              @for (cell of row.cells; track $index) {
                <div class="conversed-cell td-cell" [innerHTML]="cell"></div>
              }
              @if (hasRowActions) {
                <div class="conversed-cell actions-cell">
                  @for (rowAction of row.actions; track $index) {
                    <button
                      type="button"
                      class="conversed-row-action"
                      [class.primary]="rowAction.variant === 'primary'"
                      [class.conversed-status-pending]="rowAction.status === 'pending'"
                      [class.conversed-status-done]="rowAction.status === 'done'"
                      [class.conversed-status-failed]="rowAction.status === 'failed'"
                      [attr.aria-busy]="rowAction.status === 'pending' ? true : null"
                      [disabled]="rowAction.status === 'pending' || rowAction.status === 'done'"
                      (click)="handleRowAction(rowAction.action, $event)"
                    >
                      @if (rowAction.status && rowAction.status !== 'idle') {
                        <span
                          class="conversed-action-icon"
                          [class.conversed-action-icon-pending]="rowAction.status === 'pending'"
                          [class.conversed-action-icon-done]="rowAction.status === 'done'"
                          [class.conversed-action-icon-failed]="rowAction.status === 'failed'"
                          aria-hidden="true"
                        ></span>
                      }
                      {{ rowAction.label }}
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
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
    .conversed-table-container {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--card-bg);
      box-shadow: none;
    }
    .conversed-data-table { display: flex; flex-direction: column; width: 100%; min-width: 220px; font-size: 0.7rem; }
    .conversed-table-header { display: flex; border-bottom: 1px solid var(--border); background: var(--conversed-gray-100, #f2f2f7); font-weight: 600; }
    .conversed-table-row { display: flex; border-bottom: 1px solid var(--border); transition: background 0.15s ease; }
    .conversed-table-row:last-child { border-bottom: none; }
    .conversed-table-row.interactive { cursor: pointer; }
    .conversed-table-row.interactive:hover { background: var(--conversed-primary-alpha15, #0071e314); }
    .conversed-cell { flex: 1; min-width: 0; padding: 0.3rem 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border-right: 1px solid var(--border); }
    .conversed-cell:last-child { border-right: none; }
    .th-cell { text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.58rem; opacity: 0.65; }
    .actions-cell, .actions-head { flex: 0 0 10.5rem; width: 10.5rem; }
    .actions-cell { display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; justify-content: flex-end; overflow: visible; white-space: normal; }
    .conversed-row-action {
      font: inherit;
      font-size: 0.62rem;
      font-weight: 600;
      line-height: 1;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--conversed-button-border-color, var(--border));
      background: var(--conversed-button-bg, var(--card-bg));
      color: var(--conversed-button-text, var(--primary));
      cursor: pointer;
      box-shadow: none;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .conversed-row-action:not([disabled]):hover { border-color: var(--primary); }
    .conversed-row-action.primary { background: var(--primary); border-color: var(--primary); color: var(--conversed-primary-contrast, #fff); }
    .conversed-row-action[disabled] { cursor: default; }
    .conversed-row-action.conversed-status-pending { opacity: 0.75; }
    /* Terminal states recede into a quiet, borderless badge (no fill/outline). */
    .conversed-row-action.conversed-status-done, .conversed-row-action.conversed-status-done.primary { color: var(--conversed-success, #34c759); border-color: transparent; background: transparent; padding-inline: 0.15rem; }
    .conversed-row-action.conversed-status-failed { color: var(--conversed-critical, #ff3b30); border-color: transparent; background: transparent; padding-inline: 0.15rem; }
    .conversed-action-icon { display: inline-block; vertical-align: middle; margin-right: 0.3rem; width: 0.7rem; height: 0.7rem; line-height: 0.7rem; text-align: center; font-size: 0.66rem; }
    /* The glyph carries the semantic color explicitly, so it stays green/red when the label goes white in dark mode. */
    .conversed-action-icon-done { color: var(--conversed-success, #34c759); }
    .conversed-action-icon-done::before { content: '✓'; }
    .conversed-action-icon-failed { color: var(--conversed-critical, #ff3b30); }
    .conversed-action-icon-failed::before { content: '!'; font-weight: 700; }
    .conversed-action-icon-pending { border: 1.5px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: conversed-spin 0.6s linear infinite; }
    @keyframes conversed-spin { to { transform: rotate(360deg); } }
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

  get hasRowActions() {
    return (this.block?.rows || this.rows).some((row) => !!row.actions?.length);
  }

  handleAction(payload?: AgentActionPayload) {
    if (!payload) return;
    this.action.emit({ action: payload, defaultPrevented: false });
  }

  handleRowAction(payload: AgentActionPayload, event: Event) {
    event.stopPropagation();
    this.action.emit({ action: payload, defaultPrevented: false });
  }

  onActivate(event: KeyboardEvent, payload?: AgentActionPayload) {
    if (!payload) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleAction(payload);
    }
  }
}

/**
 * <conversed-callout>
 * iOS-inspired callout block with a full border and a tone-colored status dot
 * at the top-left (no left accent bar), matching zero box shadow.
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
      position: relative;
      padding: 0.5rem 0.65rem 0.5rem 1.4rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--card-bg);
      margin: 0.35rem 0;
      box-shadow: none;
    }
    .conversed-callout::before {
      content: '';
      position: absolute;
      top: 0.72rem;
      left: 0.55rem;
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: var(--conversed-callout-accent, var(--primary));
    }
    /* Tone accents drive the dot color */
    .conversed-callout-info { --conversed-callout-accent: var(--primary); }
    .conversed-callout-success { --conversed-callout-accent: #34c759; }
    .conversed-callout-warning { --conversed-callout-accent: #ff9f0a; }
    .conversed-callout-critical { --conversed-callout-accent: #ff3b30; }
    .conversed-callout-neutral { --conversed-callout-accent: var(--conversed-gray-500, #aeaeb2); }
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
      --card-bg: var(--conversed-card-bg, transparent);
      --border: var(--conversed-border-color, #e5e5ea);
      display: block;
    }
    .conversed-followups { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.35rem; }
    .conversed-followup-chip {
      background: var(--conversed-button-bg, var(--card-bg));
      color: var(--conversed-button-text, var(--primary));
      border: 1px solid var(--conversed-button-border-color, var(--border));
      border-radius: 14px;
      padding: 0.25rem 0.65rem;
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 500;
      box-shadow: none;
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .conversed-followup-chip:hover {
      background: var(--conversed-primary-alpha15, #0071e314);
      border-color: var(--primary);
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
 * <conversed-chart>
 * Renders a ChartBlock as a Chart.js bar/line/pie chart on a canvas.
 */
@Component({
  selector: 'conversed-chart',
  standalone: true,
  template: `
    <figure class="conversed-chart">
      @if (block.title) {
        <figcaption class="conversed-chart-title">{{ block.title }}</figcaption>
      }
      <div class="conversed-chart-canvas">
        <canvas #canvas></canvas>
      </div>
    </figure>
  `,
  styles: [`
    :host { display: block; }
    .conversed-chart { margin: 0.5rem 0; }
    .conversed-chart-title { font-size: 0.75rem; font-weight: 600; margin-bottom: 0.35rem; }
    .conversed-chart-canvas { position: relative; height: 200px; width: 100%; }
  `]
})
export class ConversedChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) block!: ChartBlock;
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private _chart?: Chart;

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges() {
    if (this.canvasRef) this.renderChart();
  }

  ngOnDestroy() {
    this._chart?.destroy();
  }

  private renderChart() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this._chart?.destroy();
    const config = toChartJsConfig(this.block, { primaryColor: this.resolvePrimary(canvas) });
    this._chart = new Chart(canvas, config as never);
  }

  private resolvePrimary(canvas: HTMLElement) {
    if (this.primaryColor) return this.primaryColor;
    const resolved = getComputedStyle(canvas).getPropertyValue('--conversed-primary').trim();
    return resolved || '#0071e3';
  }
}

/**
 * <conversed-list>
 * One markup, four presentations selected via `listStyle`: plain (default,
 * borderless clean rows), card, grouped (iOS-style bordered box), directory
 * (leading initial avatar).
 */
@Component({
  selector: 'conversed-list',
  standalone: true,
  template: `
    <div
      class="conversed-list"
      [class.conversed-list-ordered]="block?.ordered"
      [class.conversed-list-unordered]="!block?.ordered"
      [class.conversed-list-card]="listStyle === 'card'"
      [class.conversed-list-grouped]="listStyle === 'grouped'"
      [class.conversed-list-directory]="listStyle === 'directory'"
      role="list"
    >
      @for (item of block?.items || items; track $index) {
        <div class="conversed-list-row" role="listitem">
          <span class="conversed-list-marker" aria-hidden="true">
            {{ markerText(item, $index) }}
          </span>
          <span class="conversed-list-content" [innerHTML]="item"></span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      --primary-alpha15: var(--conversed-primary-alpha15, rgba(0, 113, 227, 0.15));
      --card-bg: var(--conversed-card-bg, transparent);
      --border: var(--conversed-border-color, #e5e5ea);
      --radius: var(--conversed-radius, 8px);
      display: block;
    }
    .conversed-list { display: flex; flex-direction: column; gap: 0.1rem; margin: 0.4rem 0; }
    .conversed-list-row { display: flex; align-items: baseline; gap: 0.55rem; padding: 0.15rem 0.1rem; font-size: 0.8rem; line-height: 1.5; }
    .conversed-list-marker { flex: none; min-width: 0.9rem; font-size: 0.72rem; font-weight: 600; color: var(--primary); text-align: right; }
    .conversed-list-unordered .conversed-list-marker::before { content: '•'; color: var(--primary); }
    .conversed-list-content { flex: 1; min-width: 0; }

    /* A · grouped — iOS-style bordered box with hairline row dividers */
    .conversed-list-grouped { gap: 0; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card-bg); overflow: hidden; }
    .conversed-list-grouped .conversed-list-row { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--border); }
    .conversed-list-grouped .conversed-list-row:last-child { border-bottom: none; }
    .conversed-list-grouped.conversed-list-unordered .conversed-list-marker { display: none; }

    /* C · card — each item is its own outlined, tappable-looking card */
    .conversed-list-card { gap: 0.4rem; }
    .conversed-list-card .conversed-list-row { padding: 0.5rem 0.7rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card-bg); }
    .conversed-list-card.conversed-list-unordered .conversed-list-marker { display: none; }

    /* D · directory — leading initial avatar + content, for named entities */
    .conversed-list-directory { gap: 0.15rem; }
    .conversed-list-directory .conversed-list-row { align-items: center; gap: 0.6rem; padding: 0.25rem 0.1rem; }
    .conversed-list-directory .conversed-list-marker { min-width: 0; width: 1.55rem; height: 1.55rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--primary-alpha15); color: var(--primary); font-size: 0.68rem; text-align: center; }
    .conversed-list-directory.conversed-list-unordered .conversed-list-marker::before { content: none; }
  `]
})
export class ConversedListComponent {
  @Input() block?: ListBlock;
  @Input() items: string[] = [];
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  /** List presentation: `plain` (default), `card`, `grouped`, or `directory`. */
  @Input() listStyle?: ConversedListStyle;

  markerText(item: string, index: number): string {
    if (this.block?.ordered) return `${index + 1}`;
    return this.listStyle === 'directory' ? conversedListInitial(item) : '';
  }

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }
}

/**
 * <conversed-details>
 * Collapsible disclosure built on the native <details>/<summary> element.
 */
@Component({
  selector: 'conversed-details',
  standalone: true,
  template: `
    <details class="conversed-details" [open]="block?.open ?? open">
      <summary class="conversed-details-summary" [innerHTML]="block?.summary || summary"></summary>
      <div class="conversed-details-body" [innerHTML]="block?.html || html"></div>
    </details>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      --card-bg: var(--conversed-card-bg, transparent);
      --border: var(--conversed-border-color, #e5e5ea);
      --radius: var(--conversed-radius, 8px);
      display: block;
    }
    .conversed-details { margin: 0.35rem 0; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card-bg); overflow: hidden; }
    .conversed-details-summary { cursor: pointer; list-style: none; padding: 0.45rem 0.6rem; font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }
    .conversed-details-summary::-webkit-details-marker { display: none; }
    .conversed-details-summary::before { content: '›'; color: var(--primary); font-weight: 700; transition: transform 0.15s ease; }
    .conversed-details[open] .conversed-details-summary::before { transform: rotate(90deg); }
    .conversed-details-body { padding: 0 0.6rem 0.5rem 1.4rem; font-size: 0.75rem; line-height: 1.45; }
  `]
})
export class ConversedDetailsComponent {
  @Input() block?: DetailsBlock;
  @Input() summary = 'Details';
  @Input() html = '';
  @Input() open = false;
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }
}

/**
 * <conversed-steps>
 * Numbered sequential steps with a badge and connector line.
 */
@Component({
  selector: 'conversed-steps',
  standalone: true,
  template: `
    <div class="conversed-steps">
      @for (step of block?.items || items; track $index) {
        <div class="conversed-step">
          <span class="conversed-step-index" aria-hidden="true">{{ $index + 1 }}</span>
          <div class="conversed-step-content">
            @if (step.title) {
              <div class="conversed-step-title" [innerHTML]="step.title"></div>
            }
            <div class="conversed-step-body" [innerHTML]="step.html"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      --border: var(--conversed-border-color, #e5e5ea);
      display: block;
    }
    .conversed-steps { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.35rem 0; }
    .conversed-step { display: flex; gap: 0.55rem; position: relative; }
    .conversed-step:not(:last-child)::before { content: ''; position: absolute; left: 0.68rem; top: 1.4rem; bottom: -0.5rem; width: 1px; background: var(--border); }
    .conversed-step-index { flex: none; width: 1.35rem; height: 1.35rem; border-radius: 50%; background: var(--primary); color: var(--conversed-primary-contrast, #fff); font-size: 0.68rem; font-weight: 600; display: flex; align-items: center; justify-content: center; z-index: 1; }
    .conversed-step-content { flex: 1; min-width: 0; padding-top: 0.1rem; }
    .conversed-step-title { font-size: 0.78rem; font-weight: 600; margin-bottom: 0.05rem; }
    .conversed-step-body { font-size: 0.75rem; line-height: 1.45; }
  `]
})
export class ConversedStepsComponent {
  @Input() block?: StepsBlock;
  @Input() items: StepsBlock['items'] = [];
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }
}

/**
 * <conversed-timeline>
 * Vertical timeline of events with a dot marker and connector line.
 */
@Component({
  selector: 'conversed-timeline',
  standalone: true,
  template: `
    <div class="conversed-timeline">
      @for (entry of block?.items || items; track $index) {
        <div class="conversed-timeline-item">
          <span class="conversed-timeline-dot" aria-hidden="true"></span>
          <div class="conversed-timeline-content">
            @if (entry.time) {
              <span class="conversed-timeline-time">{{ entry.time }}</span>
            }
            @if (entry.title) {
              <div class="conversed-timeline-title" [innerHTML]="entry.title"></div>
            }
            <div class="conversed-timeline-body" [innerHTML]="entry.html"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      --card-bg: var(--conversed-card-bg, transparent);
      --border: var(--conversed-border-color, #e5e5ea);
      display: block;
    }
    .conversed-timeline { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.35rem 0; padding-left: 0.1rem; }
    .conversed-timeline-item { display: flex; gap: 0.55rem; position: relative; }
    .conversed-timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 0.28rem; top: 0.85rem; bottom: -0.5rem; width: 1px; background: var(--border); }
    .conversed-timeline-dot { flex: none; width: 0.6rem; height: 0.6rem; margin-top: 0.28rem; border-radius: 50%; background: var(--card-bg); border: 2px solid var(--primary); z-index: 1; }
    .conversed-timeline-content { flex: 1; min-width: 0; }
    .conversed-timeline-time { display: block; font-size: 0.62rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.65; }
    .conversed-timeline-title { font-size: 0.78rem; font-weight: 600; }
    .conversed-timeline-body { font-size: 0.75rem; line-height: 1.45; }
  `]
})
export class ConversedTimelineComponent {
  @Input() block?: TimelineBlock;
  @Input() items: TimelineBlock['items'] = [];
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }
}

/**
 * <conversed-media>
 * Image block with an optional caption and flat rounded border.
 */
@Component({
  selector: 'conversed-media',
  standalone: true,
  template: `
    <figure class="conversed-media">
      <img class="conversed-media-img" [src]="block?.src || src" [alt]="block?.alt || alt || ''" loading="lazy" />
      @if (block?.caption || caption) {
        <figcaption class="conversed-media-caption">{{ block?.caption || caption }}</figcaption>
      }
    </figure>
  `,
  styles: [`
    :host {
      --border: var(--conversed-border-color, #e5e5ea);
      --radius: var(--conversed-radius, 8px);
      display: block;
    }
    .conversed-media { margin: 0.35rem 0; }
    .conversed-media-img { display: block; max-width: 100%; height: auto; border: 1px solid var(--border); border-radius: var(--radius); }
    .conversed-media-caption { margin-top: 0.25rem; font-size: 0.66rem; opacity: 0.7; text-align: center; }
  `]
})
export class ConversedMediaComponent {
  @Input() block?: MediaBlock;
  @Input() src = '';
  @Input() alt?: string;
  @Input() caption?: string;
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }
}

/**
 * <conversed-progress>
 * Labelled meters / completion bars. Each item's bar fills `value` as a
 * percentage, or `value / max` when `max` is set, and can carry a tone.
 */
@Component({
  selector: 'conversed-progress',
  standalone: true,
  template: `
    <div class="conversed-progress">
      @if (block?.title || title) {
        <div class="conversed-progress-title">{{ block?.title || title }}</div>
      }
      @for (item of block?.items || items; track $index) {
        <div
          class="conversed-progress-item"
          [class.interactive]="!!item.action"
          [attr.role]="item.action ? 'button' : null"
          [attr.tabindex]="item.action ? 0 : null"
          (click)="handleAction(item.action)"
          (keydown)="onActivate($event, item.action)"
        >
          <div class="conversed-progress-head">
            <span class="conversed-progress-label">{{ item.label }}</span>
            <span class="conversed-progress-value">{{ item.display || readout(item) }}</span>
          </div>
          <div
            class="conversed-progress-track"
            role="progressbar"
            [attr.aria-label]="item.label"
            [attr.aria-valuenow]="ariaValueNow(item)"
            aria-valuemin="0"
            [attr.aria-valuemax]="item.max && item.max > 0 ? item.max : 100"
            [attr.aria-valuetext]="item.display || readout(item)"
          >
            <div
              [class]="'conversed-progress-bar conversed-tone-' + (item.tone || 'primary')"
              [style.width.%]="percent(item)"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: var(--conversed-primary, #0071e3);
      display: block;
    }
    .conversed-progress { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.35rem 0; }
    .conversed-progress-title { font-size: 0.75rem; font-weight: 600; }
    .conversed-progress-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .conversed-progress-item.interactive { cursor: pointer; }
    .conversed-progress-head { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; font-size: 0.72rem; }
    .conversed-progress-label { font-weight: 500; }
    .conversed-progress-value { font-size: 0.66rem; font-weight: 600; opacity: 0.75; font-variant-numeric: tabular-nums; flex: none; }
    .conversed-progress-item.interactive:hover .conversed-progress-label { color: var(--primary); }
    .conversed-progress-track { height: 0.4rem; border-radius: 999px; background: var(--conversed-gray-100, #f2f2f7); overflow: hidden; }
    .conversed-progress-bar { height: 100%; border-radius: inherit; background: var(--primary); transition: width 0.35s ease; }
    .conversed-progress-bar.conversed-tone-primary { background: var(--primary); }
    .conversed-progress-bar.conversed-tone-success { background: #34c759; }
    .conversed-progress-bar.conversed-tone-warning { background: #ff9f0a; }
    .conversed-progress-bar.conversed-tone-critical { background: #ff3b30; }
    .conversed-progress-bar.conversed-tone-neutral { background: var(--conversed-gray-500, #aeaeb2); }
  `]
})
export class ConversedProgressComponent {
  @Input() block?: ProgressBlock;
  @Input() title?: string;
  @Input() items: ProgressItem[] = [];
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  @Output() action = new EventEmitter<AgentActionEvent>();

  @HostBinding('style')
  get styleBindings() {
    const activeTheme = this.theme || (this.primaryColor ? { primaryColor: this.primaryColor } : undefined);
    return activeTheme ? generateCssVariables(activeTheme) : {};
  }

  /** Bar fill fraction as a clamped 0–100 percentage. */
  percent(item: ProgressItem): number {
    const raw = item.max && item.max > 0 ? (item.value / item.max) * 100 : item.value;
    return Math.max(0, Math.min(100, raw));
  }

  /** Default readout when the item has no custom `display`. */
  readout(item: ProgressItem): string {
    return `${Math.round(this.percent(item))}%`;
  }

  /** `aria-valuenow` on the raw value/max scale when `max` is set, else percent. */
  ariaValueNow(item: ProgressItem): number {
    const hasMax = !!(item.max && item.max > 0);
    return Math.round(hasMax ? item.value : this.percent(item));
  }

  handleAction(payload?: AgentActionPayload) {
    if (!payload) return;
    this.action.emit({ action: payload, defaultPrevented: false });
  }

  onActivate(event: KeyboardEvent, payload?: AgentActionPayload) {
    if (!payload) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleAction(payload);
    }
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
    ConversedFollowupsComponent,
    ConversedChartComponent,
    ConversedListComponent,
    ConversedDetailsComponent,
    ConversedStepsComponent,
    ConversedTimelineComponent,
    ConversedMediaComponent,
    ConversedProgressComponent
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
        <conversed-list [block]="block" [theme]="theme" [primaryColor]="primaryColor" [listStyle]="listStyle"></conversed-list>
      }
      @case ('details') {
        <conversed-details [block]="block" [theme]="theme" [primaryColor]="primaryColor"></conversed-details>
      }
      @case ('steps') {
        <conversed-steps [block]="block" [theme]="theme" [primaryColor]="primaryColor"></conversed-steps>
      }
      @case ('timeline') {
        <conversed-timeline [block]="block" [theme]="theme" [primaryColor]="primaryColor"></conversed-timeline>
      }
      @case ('media') {
        <conversed-media [block]="block" [theme]="theme" [primaryColor]="primaryColor"></conversed-media>
      }
      @case ('code') {
        <div class="conversed-code-wrapper">
          @if (block.language) {
            <div class="conversed-code-header">
              <span>{{ block.language }}</span>
              <button (click)="copyCode(block.content, block.language)">Copy</button>
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
      @case ('progress') {
        <conversed-progress [block]="block" [theme]="theme" [primaryColor]="primaryColor" (action)="action.emit($event)"></conversed-progress>
      }
      @case ('table') {
        <conversed-table [block]="block" [theme]="theme" [primaryColor]="primaryColor" (action)="action.emit($event)"></conversed-table>
      }
      @case ('followups') {
        <conversed-followups [block]="block" [theme]="theme" [primaryColor]="primaryColor" (action)="action.emit($event)"></conversed-followups>
      }
      @case ('chart') {
        <conversed-chart [block]="block" [theme]="theme" [primaryColor]="primaryColor"></conversed-chart>
      }
      @case ('divider') {
        <hr class="conversed-divider" />
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .conversed-p { margin: 0; padding: 0; line-height: 1.45; font-size: 0.8rem; }
    .conversed-code-wrapper { background: var(--conversed-code-bg, #1c1c1e); color: var(--conversed-code-text, #ffffff); border-radius: var(--conversed-radius, 8px); overflow: hidden; margin: 0.35rem 0; box-shadow: none; }
    .conversed-code-header { display: flex; justify-content: space-between; padding: 0.3rem 0.6rem; background: color-mix(in srgb, var(--conversed-code-text, #ffffff) 10%, transparent); font-size: 0.68rem; }
    .conversed-code { padding: 0.55rem; margin: 0; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, SF Pro Text, monospace; font-size: 0.72rem; }
    .conversed-divider { border: 0; border-top: 1px solid var(--conversed-border-color, #e5e5ea); margin: 0.55rem 0; }
  `]
})
export class ConversedBlockComponent {
  @Input() block!: ConversedContentBlock;
  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  /** List presentation forwarded to list blocks: `plain` (default), `card`, `grouped`, or `directory`. */
  @Input() listStyle?: ConversedListStyle;
  @Output() action = new EventEmitter<AgentActionEvent>();

  copyCode(content: string, language?: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }
    this.action.emit({
      action: {
        type: 'copy-code',
        actionId: 'copy-code',
        ...(language ? { params: { language } } : {})
      },
      defaultPrevented: false
    });
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
    <div class="conversed-content" [class.conversed-filled]="variant === 'filled'">
      @for (block of blocks; track $index) {
        <conversed-block
          [block]="block"
          [theme]="theme"
          [primaryColor]="primaryColor"
          [listStyle]="listStyle"
          (action)="emitAction($event)"
        ></conversed-block>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .conversed-content { display: flex; flex-direction: column; gap: 0.3rem; }
    /*
     * Surface token for the opt-in \`filled\` variant.
     *
     * Defaults to a light-safe fill and, deliberately, does NOT follow the OS
     * color scheme — a component library must inherit the host app's theme, not
     * the machine's, or an app in light mode on a dark-OS device would get dark
     * surfaces it never asked for. Precedence: the theme's \`surface\` token wins;
     * else \`data-conversed-color-scheme="dark"\` on any ancestor follows the app's
     * own dark mode; \`="auto"\` opts back into OS-driven dark. Custom properties
     * inherit past Angular's emulated encapsulation, so setting them on the
     * content wrapper cascades into every leaf block.
     */
    .conversed-content { --conversed-surface: var(--conversed-gray-50, #f9f9fb); }
    /* App-controlled dark, independent of the OS (:host-context sees ancestors).
       Semantic status colors also shift to brighter dark-mode variants so a
       done/failed badge stays legible on a dark surface. */
    :host-context([data-conversed-color-scheme='dark']) .conversed-content { --conversed-surface: #2c2c2e; --conversed-success: #30d158; --conversed-critical: #ff453a; }
    /* Dark mode: the terminal label switches to white for contrast (the glyph keeps its semantic color). */
    :host-context([data-conversed-color-scheme='dark']) .conversed-content :is(.conversed-status-done, .conversed-status-failed) { color: #fff; }
    /* Opt-in: follow the OS color scheme. */
    @media (prefers-color-scheme: dark) {
      :host-context([data-conversed-color-scheme='auto']) .conversed-content { --conversed-surface: #2c2c2e; --conversed-success: #30d158; --conversed-critical: #ff453a; }
      :host-context([data-conversed-color-scheme='auto']) .conversed-content :is(.conversed-status-done, .conversed-status-failed) { color: #fff; }
    }
    /* \`filled\` gives card-like blocks a real surface (vs. the default transparent). */
    .conversed-content.conversed-filled { --conversed-card-bg: var(--conversed-surface); }
  `]
})
export class ConversedContentComponent {
  private _blocks: ConversedContentBlock[] = [];

  @Input()
  set blocks(value: ConversedContentBlock[] | null | undefined) {
    this._blocks = value ?? [];
  }
  get blocks() {
    return this._blocks;
  }

  @Input() primaryColor?: string;
  @Input() theme?: ConversedThemeTokens;
  /** Surface treatment applied to every block: `flat` (default) or `filled`. */
  @Input() variant?: ConversedVariant;
  /** List presentation applied to every list block: `plain` (default), `card`, `grouped`, or `directory`. */
  @Input() listStyle?: ConversedListStyle;
  @Input() debug = false;
  @Output() action = new EventEmitter<AgentActionEvent>();

  emitAction(event: AgentActionEvent) {
    if (this.debug) logConversedAction(event);
    this.action.emit(event);
  }
}
