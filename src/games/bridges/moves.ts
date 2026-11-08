/**
 * Bridges move application, and the ops a drag's release plays. `index.ts`
 * plays them and `render.ts` previews them, so they sit where both can import
 * them without `render` importing `index`.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import { Dsf } from "../../engine/dsf.ts";
import { findLoops } from "../../engine/findloop.ts";
import type { BridgesSpan } from "./solver.ts";
import {
  type BridgesMove,
  type BridgesOp,
  type BridgesState,
  type BridgesUi,
  G_ISLAND,
  G_LINE,
  G_LINEH,
  G_LINEV,
  G_NOLINEH,
  G_NOLINEV,
  G_WARN,
} from "./state.ts";

// --- the warning overlay (bridges.c map_check's side effect) ---

/**
 * The grid cells a vertex of the bridges' graph touches, for loop finding:
 * an island the islands it has a bridge to, and a square a bridge crosses
 * the two squares it runs between (each edge reported from both ends, as
 * `findLoops` requires).
 */
function bridgeNeighbors(st: BridgesState, v: number): number[] {
  const { w } = st;
  const x = v % w;
  const y = (v / w) | 0;
  const out: number[] = [];
  const is = st.islandAt(x, y);
  if (is) {
    for (const pt of is.points)
      if (st.gridAt(pt.x, pt.y) & (pt.dx ? G_LINEH : G_LINEV))
        out.push(pt.y * w + pt.x);
    return out;
  }
  const line = st.gridAt(x, y) & G_LINE;
  if (!line) return out;
  const [dx, dy] = line & G_LINEV ? [0, 1] : [1, 0];
  for (const s of [-1, 1]) {
    const nx = x + s * dx;
    const ny = y + s * dy;
    if (st.gridAt(nx, ny) & (line | G_ISLAND)) out.push(ny * w + nx);
  }
  return out;
}

/**
 * Light up what breaks the rules at a glance: a group of islands each with
 * all its bridges while some island is not in it, and where loops are not
 * allowed, the bridges of a loop. Written into the grid's `G_WARN` flags,
 * which the renderer reads; whether the board is solved is the answer
 * check's (`bridgesSolved`).
 */
function markWarnings(st: BridgesState): void {
  const { w, h } = st;
  for (let i = 0; i < st.grid.length; i++) st.grid[i] &= ~G_WARN;
  const dsf = new Dsf(w * h);
  for (const is of st.islands) {
    for (let i = 0; i < is.points.length; i++) {
      const pt = is.points[i];
      if (pt.dx === -1 || pt.dy === -1) continue;
      const other = st.islandFindConnection(is, i);
      if (!other) continue;
      for (let k = 1; k <= pt.off; k++)
        dsf.merge(st.idx(is.x, is.y), st.idx(is.x + k * pt.dx, is.y + k * pt.dy));
    }
  }
  const groups = new Map<number, { full: boolean; islands: number }>();
  for (const is of st.islands) {
    const root = dsf.canonify(st.idx(is.x, is.y));
    const g = groups.get(root) ?? { full: true, islands: 0 };
    g.islands++;
    if (st.islandCountbridges(is) !== is.count) g.full = false;
    groups.set(root, g);
  }
  for (let c = 0; c < w * h; c++) {
    const g = groups.get(dsf.canonify(c));
    if (g?.full && g.islands !== st.islands.length) st.grid[c] |= G_WARN;
  }
  if (st.allowloops) return;
  const loops = findLoops(w * h, (v) => bridgeNeighbors(st, v));
  for (let u = 0; u < w * h; u++)
    for (const v of bridgeNeighbors(st, u))
      if (loops.isLoopEdge(u, v)) st.grid[u] |= G_WARN;
}

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
  markWarnings(ret);
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
