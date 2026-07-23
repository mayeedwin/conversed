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

export type RowAction = {
  label: string;
  variant?: 'default' | 'primary';
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
  | CalloutBlock
  | ChartBlock
  | HeadingBlock
  | DividerBlock
  | FollowUpBlock
  | CustomBlock;
