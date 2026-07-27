import type {
  ActionStatus,
  AgentActionPayload,
  ConversedContentBlock,
  RowAction,
  TableRow
} from './types.js';

/**
 * Identifies which CTA(s) to update. A CTA matches when every provided field
 * equals the action's corresponding field — so `{ actionId }` matches every
 * CTA with that id, `{ target }` matches every CTA pointing at that target,
 * and both together narrow to one. An empty selector matches nothing.
 */
export interface ActionSelector {
  actionId?: string;
  target?: string;
}

/** The changes to apply to a matched CTA (and, optionally, its table row). */
export interface ActionPatch {
  /** New lifecycle status for the matched CTA button(s). */
  status?: ActionStatus;
  /** Optional new button label (e.g. swap "Start" → "Completed"). */
  label?: string;
  /** Optional new button variant. */
  variant?: 'default' | 'primary';
  /** Patch cells of the table row containing the matched CTA, keyed by column index. */
  cells?: Record<number, string>;
}

const actionMatches = (
  action: AgentActionPayload | undefined,
  selector: ActionSelector
): boolean => {
  if (!action) return false;
  if (selector.actionId == null && selector.target == null) return false;
  if (selector.actionId != null && action.actionId !== selector.actionId) return false;
  if (selector.target != null && action.target !== selector.target) return false;
  return true;
};

const patchCells = (cells: string[], patch: Record<number, string>): string[] => {
  const next = cells.slice();
  for (const key of Object.keys(patch)) {
    const idx = Number(key);
    if (Number.isInteger(idx) && idx >= 0 && idx < next.length) next[idx] = patch[idx];
  }
  return next;
};

const patchRowAction = (rowAction: RowAction, patch: ActionPatch): RowAction => ({
  ...rowAction,
  ...(patch.status !== undefined ? { status: patch.status } : {}),
  ...(patch.label !== undefined ? { label: patch.label } : {}),
  ...(patch.variant !== undefined ? { variant: patch.variant } : {})
});

/**
 * Return a new blocks array with the CTA(s) matching `selector` transitioned per
 * `patch` — used to reflect an action's progress live in the chat (e.g. a task
 * button going `idle → pending → done`). Pure and immutable: only the touched
 * blocks and rows get new references, and the original array is returned
 * unchanged when nothing matches, so it's cheap to call on every render.
 *
 * Matches CTA buttons (`row.actions[]`) and whole-row actions (`row.action`) in
 * `table` blocks. `status`/`label`/`variant` apply to matched buttons; `cells`
 * patches the containing row (works whether a button or the row itself matched).
 */
export const updateAction = (
  blocks: ConversedContentBlock[],
  selector: ActionSelector,
  patch: ActionPatch
): ConversedContentBlock[] => {
  let changed = false;

  const next = blocks.map((block) => {
    if (block.type !== 'table') return block;

    let blockChanged = false;
    const rows = block.rows.map((row) => {
      const buttonMatch = (row.actions || []).some((ra) => actionMatches(ra.action, selector));
      const rowMatch = actionMatches(row.action, selector);
      if (!buttonMatch && !rowMatch) return row;

      blockChanged = true;
      const nextRow: TableRow = { ...row };
      if (patch.cells) nextRow.cells = patchCells(row.cells, patch.cells);
      if (buttonMatch && row.actions) {
        nextRow.actions = row.actions.map((ra) =>
          actionMatches(ra.action, selector) ? patchRowAction(ra, patch) : ra
        );
      }
      return nextRow;
    });

    if (!blockChanged) return block;
    changed = true;
    return { ...block, rows };
  });

  return changed ? next : blocks;
};
