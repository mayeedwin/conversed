export type ActionTriggerType =
  | 'navigate'
  | 'custom-command'
  | 'prompt-submit'
  | 'copy-code'
  | 'external-url';

export interface AgentActionPayload<T = unknown> {
  type: ActionTriggerType;
  actionId: string;
  target?: string;
  params?: Record<string, T>;
  metadata?: {
    blockType?: string;
    sourceMessageId?: string;
    timestamp?: number;
  };
}

export interface AgentActionEvent {
  action: AgentActionPayload;
  defaultPrevented?: boolean;
  preventDefault?: () => void;
}

export type ParagraphBlock = {
  type: 'paragraph';
  html: string;
};

export type ListBlock = {
  type: 'list';
  ordered: boolean;
  items: string[];
};

export type DetailsBlock = {
  type: 'details';
  summary: string;
  html: string;
  open: boolean;
};

export type StepItem = {
  title?: string;
  html: string;
};

export type StepsBlock = {
  type: 'steps';
  items: StepItem[];
};

export type TimelineItem = {
  time?: string;
  title?: string;
  html: string;
};

export type TimelineBlock = {
  type: 'timeline';
  items: TimelineItem[];
};

export type MediaBlock = {
  type: 'media';
  src: string;
  alt?: string;
  caption?: string;
};

/**
 * Lifecycle status of an interactive CTA. Drives its visual state and, for
 * `pending`/`done`, whether it still responds to clicks. Defaults to `idle`.
 */
export type ActionStatus = 'idle' | 'pending' | 'done' | 'failed';

export type RowAction = {
  label: string;
  variant?: 'default' | 'primary';
  /** Lifecycle status of this CTA. Defaults to `idle`. Update it live with `updateAction`. */
  status?: ActionStatus;
  action: AgentActionPayload;
};

export type TableRow = {
  cells: string[];
  action?: AgentActionPayload;
  actions?: RowAction[];
};

export type TableBlock = {
  type: 'table';
  headers: string[];
  rows: TableRow[];
};

export type CodeBlock = {
  type: 'code';
  language?: string;
  content: string;
};

export type StatTrend = 'up' | 'down' | 'neutral';

export type StatItem = {
  label: string;
  value: string;
  delta?: string;
  trend?: StatTrend;
  action?: AgentActionPayload;
};

export type StatsBlock = {
  type: 'stats';
  items: StatItem[];
};

export type ProgressTone = 'primary' | 'success' | 'warning' | 'critical' | 'neutral';

export type ProgressItem = {
  label: string;
  /** Filled amount. Interpreted as a percentage (0–100) unless `max` is set. */
  value: number;
  /** Optional scale ceiling; when set, the bar fills `value / max`. */
  max?: number;
  /** Optional custom readout (e.g. "18 / 24" or "on track"). Falls back to a percentage. */
  display?: string;
  tone?: ProgressTone;
  action?: AgentActionPayload;
};

export type ProgressBlock = {
  type: 'progress';
  title?: string;
  items: ProgressItem[];
};

export type CalloutTone = 'info' | 'warning' | 'success' | 'critical' | 'neutral';

export type CalloutBlock = {
  type: 'callout';
  tone: CalloutTone;
  badgeLabel: string;
  title?: string;
  html: string;
};

export type ChartDatasetBlock = {
  label: string;
  values: number[];
  color?: string;
};

export type ChartBlock = {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie';
  title?: string;
  labels: string[];
  datasets: ChartDatasetBlock[];
};

export type HeadingBlock = {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  html: string;
};

export type DividerBlock = {
  type: 'divider';
};

export type FollowUpBlock = {
  type: 'followups';
  items: string[];
};

export type CustomBlock = {
  type: 'custom';
  customType: string;
  payload: Record<string, unknown>;
};

export type ConversedContentBlock =
  | ParagraphBlock
  | ListBlock
  | DetailsBlock
  | StepsBlock
  | TimelineBlock
  | MediaBlock
  | TableBlock
  | CodeBlock
  | StatsBlock
  | ProgressBlock
  | CalloutBlock
  | ChartBlock
  | HeadingBlock
  | DividerBlock
  | FollowUpBlock
  | CustomBlock;
