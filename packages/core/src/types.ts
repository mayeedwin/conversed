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

/** Common aspect ratios for image/video blocks. `auto` lets intrinsic size drive layout. */
export type MediaAspect = '16/9' | '4/3' | '1/1' | '3/4' | '9/16' | 'auto';

export type ImageBlock = {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  aspect?: MediaAspect;
  /** Optional click-through URL; renders the image as a link. */
  href?: string;
};

export type GalleryItem = {
  src: string;
  alt?: string;
  caption?: string;
  href?: string;
};

export type GalleryBlock = {
  type: 'gallery';
  /** `scroll` is a horizontal snap-scrolling strip; `grid` is a responsive auto-fit grid. */
  layout?: 'scroll' | 'grid';
  items: GalleryItem[];
};

export type VideoBlock = {
  type: 'video';
  src: string;
  /** Preview image shown before playback and while loading. */
  poster?: string;
  alt?: string;
  caption?: string;
  aspect?: MediaAspect;
  autoplay?: boolean;
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

export type ProductRating = {
  /** Score, usually 0–5. */
  value: number;
  /** Optional total review count for the label (e.g. "342 reviews"). */
  count?: number;
  /** Ceiling of the scale — defaults to 5. */
  max?: number;
};

export type ProductListItem = Omit<ProductBlock, 'type'>;

export type ProductListBlock = {
  type: 'products';
  /** `scroll` (default) is a horizontal snap strip; `grid` is a responsive auto-fill grid. */
  layout?: 'scroll' | 'grid';
  items: ProductListItem[];
};

export type ProductBlock = {
  type: 'product';
  title: string;
  /** Optional short line under the title (brand, seller, or model). */
  subtitle?: string;
  /** Preformatted display price (e.g. "$49.99"). */
  price: string;
  /** Optional preformatted list/original price for a strike-through. */
  originalPrice?: string;
  currency?: string;
  image?: string;
  /** Short tag rendered as a corner ribbon (e.g. "Best seller", "-20%"). */
  badge?: string;
  rating?: ProductRating;
  /** One or two CTA buttons for the card (Add to cart, Buy now, etc.). */
  actions?: RowAction[];
  /** Optional single-action fallback when a whole-card tap should fire. */
  action?: AgentActionPayload;
};

export type CartLine = {
  title: string;
  /** Preformatted per-unit or line-total display (e.g. "$19.99" or "$59.97"). */
  price: string;
  quantity?: number;
  image?: string;
  /** Optional short line under the title (variant, size, color). */
  note?: string;
  /** Optional per-line action (Remove, Save for later). */
  action?: AgentActionPayload;
};

export type CartSummaryRow = {
  label: string;
  value: string;
  /** Emphasize this row (used for the grand total). */
  emphasis?: boolean;
};

export type CartBlock = {
  type: 'cart';
  title?: string;
  items: CartLine[];
  /** Ordered rows for subtotal, shipping, tax, discount, total, etc. */
  summary?: CartSummaryRow[];
  /** CTAs at the bottom (Checkout, Continue shopping). */
  actions?: RowAction[];
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
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | TableBlock
  | CodeBlock
  | StatsBlock
  | ProgressBlock
  | CalloutBlock
  | ChartBlock
  | HeadingBlock
  | DividerBlock
  | FollowUpBlock
  | ProductBlock
  | ProductListBlock
  | CartBlock
  | CustomBlock;
