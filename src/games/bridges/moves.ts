/**
 * Bridges move application, and the ops a drag's release plays. `index.ts`
 * plays them and `render.ts` previews them, so they sit where both can import
 * them without `render` importing `index`.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import { type BridgesSpan, runMapCheck } from "./solver.ts";
import {
  type BridgesMove,
  type BridgesOp,
  type BridgesState,
  type BridgesUi,
  G_LINEH,
  G_LINEV,
  G_NOLINEH,
  G_NOLINEV,
} from "./state.ts";

// --- executeMove (bridges.c execute_move) ---

export function executeMove(s: BridgesState, m: BridgesMove): BridgesState {
  // A move is an op list, not a union, so there is no discriminant to narrow to
  // `never`: check the one field the dispatch reads (see `rejectMove`).
  if (!Array.isArray(m.ops)) rejectMove(m, "bridges: executeMove");

  const ret = s.clone();
  for (const op of m.ops) {
    if (op.op === "S") {
      // The solver's marker: what follows is its answer, played as bridges.
    } else if (op.op === "L" || op.op === "N" || op.op === "C") {
      if (!ret.inGrid(op.x1, op.y1) || !ret.inGrid(op.x2, op.y2))
        throw new Error(`bridges executeMove: ${op.op} endpoint off-grid`);
      if ((op.x1 !== op.x2 ? 1 : 0) + (op.y1 !== op.y2 ? 1 : 0) !== 1)
        throw new Error(`bridges executeMove: ${op.op} not orthogonal`);
      const is1 = ret.islandAt(op.x1, op.y1);
      const is2 = ret.islandAt(op.x2, op.y2);
      if (!is1 || !is2)
        throw new Error(`bridges executeMove: ${op.op} endpoint not an island`);
      if (op.op === "L" && (op.n < 0 || op.n > ret.maxb))
        throw new Error("bridges executeMove: L count out of range");
      if (op.op === "C") {
        // A limit below the bridges already drawn would be a board that
        // contradicts its own marks, which no gesture and no hint produces.
        const dx = Math.sign(op.x2 - op.x1);
        const cx = op.x1 + dx;
        const cy = op.y1 + Math.sign(op.y2 - op.y1);
        const drawn = ret.gridCount(cx, cy, dx ? G_LINEH : G_LINEV);
        if (op.n < 1 || op.n > ret.maxb || op.n < drawn)
          throw new Error("bridges executeMove: C limit out of range");
        ret.islandJoin(is1, is2, op.n, true);
      } else {
        ret.islandJoin(is1, is2, op.op === "L" ? op.n : -1, false);
      }
    } else if (op.op === "M") {
      if (!ret.inGrid(op.x, op.y)) throw new Error("bridges executeMove: M off-grid");
      const is1 = ret.islandAt(op.x, op.y);
      if (!is1) throw new Error("bridges executeMove: M not an island");
      ret.islandTogglemark(is1);
    } else {
      return assertNever(op, "bridges: executeMove");
    }
  }
  ret.mapUpdatePossibles();
  // Run for the group warnings it leaves on the grid.
  runMapCheck(ret);
  return ret;
}

/**
 * The secondary drag lowers the most bridges a span may carry by one:
 * no limit, then each limit down to one, then none at all (the no-line
 * cross), then no limit again. Every stop on the way is weaker than the next,
 * so a player heading for "at most one" or for the cross never passes through a
 * mark that claims more than they mean. A limit never drops below the bridges
 * already drawn, so over a bundle the cycle skips the cross and wraps to no
 * limit instead. `null` when there is nothing to lower: a full bundle with no
 * limit on it.
 */
export function lowerLimit(s: BridgesState, span: BridgesSpan): BridgesOp[] | null {
  const dx = Math.sign(span.x2 - span.x1);
  const cx = span.x1 + dx;
  const cy = span.y1 + Math.sign(span.y2 - span.y1);
  const cross = { op: "N" as const, ...span };
  const limit = (n: number): BridgesOp => ({ op: "C", ...span, n });
  if (s.gridAt(cx, cy) & (dx ? G_NOLINEH : G_NOLINEV)) return [cross];
  const drawn = s.gridCount(cx, cy, dx ? G_LINEH : G_LINEV);
  const now = s.maximum(dx, cx, cy);
  const next = now - 1;
  if (next >= Math.max(drawn, 1)) return [limit(next)];
  const lifted = now < s.maxb ? [limit(s.maxb)] : [];
  if (drawn === 0) return [...lifted, cross];
  return lifted.length ? lifted : null;
}

/**
 * What releasing the drag in `ui` would play: one more bridge along the span,
 * or none once it is at its limit, and for the secondary drag the limit one
 * step lower. `null` when the drag points at no island, or has nothing to do.
 */
export function dragReleaseOps(s: BridgesState, ui: BridgesUi): BridgesOp[] | null {
  const { sx, sy, ex, ey } = ui.drag;
  if (sx === -1 || sy === -1 || ex === -1 || ey === -1) return null;
  const span = { x1: sx, y1: sy, x2: ex, y2: ey };
  if (ui.dragIsNoline) return lowerLimit(s, span);
  const dx = Math.sign(ex - sx);
  const cx = sx + dx;
  const cy = sy + Math.sign(ey - sy);
  const drawn = s.gridCount(cx, cy, dx ? G_LINEH : G_LINEV);
  return [{ op: "L", ...span, n: drawn === s.maximum(dx, cx, cy) ? 0 : drawn + 1 }];
}
