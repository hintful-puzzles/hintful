/**
 * Pearl move application and the rules its loop is drawn by — a port of
 * `execute_move` (pearl.c). Whether the board is solved is the description's
 * answer check (`solver.ts`'s `isSolved`), and where it breaks a rule its
 * violations (`render.ts`).
 *
 * Split out of `index.ts` so `render.ts`, which previews the in-progress drag,
 * reads the same rules without an import cycle (docs/rendering.md
 * § "A simulated-release preview lives in `moves.ts`").
 */

import {
  D,
  dirX,
  dirY,
  L,
  opposite,
  R,
  sideOf,
  squareEdges,
  U,
} from "../../engine/board/square-edges.ts";
import { assertNever, rejectMove } from "../../engine/contract/assert-never.ts";
import type { GameStatus } from "../../engine/contract/types.ts";
import {
  CROSS,
  LINE,
  type LineRules,
  OPEN,
} from "../../engine/mechanics/line-drawing.ts";
import { isSolved, pearlSolve } from "./solver.ts";
import { DIFF_COUNT, inGrid, type PearlMove, type PearlState } from "./state.ts";

// --- drawing the loop -----------------------------------------------------

/** What an edge holds, read from its first square, and the loop: two lines a
 * square, closing on itself. */
export const pearlLines: LineRules<PearlState> = {
  mark(state, e) {
    const g = squareEdges(state.w, state.h);
    const i = g.a[e];
    const bit = 1 << sideOf(g, e, i);
    return state.lines[i] & bit ? LINE : state.marks[i] & bit ? CROSS : OPEN;
  },
  takes: () => 2,
  loops: true,
};

// --- move application ------------------------------------------------------

/** Whether every line runs to a square on the board that has it too
 * (upstream `dsf_update_completion`'s check). */
function linesValid(state: PearlState): boolean {
  const { w, h, lines } = state;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (const d of [R, U, L, D]) {
        if (!(lines[y * w + x] & d)) continue;
        const bx = x + dirX(d);
        const by = y + dirY(d);
        if (!inGrid(state, bx, by) || !(lines[by * w + bx] & opposite(d))) return false;
      }
  return true;
}

/** Apply a move purely. Throws on an illegal move (upstream `execute_move`
 * returning NULL). */
export function executeMove(state: PearlState, move: PearlMove): PearlState {
  // A move is an op list, not a union, so there is no discriminant to narrow to
  // `never`: check the one field the dispatch reads (see `rejectMove`).
  if (!Array.isArray(move.ops)) rejectMove(move, "pearl: executeMove");

  const { w, h } = state;
  const lines = state.lines.slice();
  const marks = state.marks.slice();

  for (const op of move.ops) {
    // Labels the Solve command's move; that the solver was used is the
    // midend's record, so the label changes nothing on the board.
    if (op.kind === "solve") continue;
    if (op.kind === "hint") {
      pearlSolve(w, h, state.clues, lines, DIFF_COUNT, true);
      for (let n = 0; n < w * h; n++) marks[n] &= ~lines[n];
      continue;
    }
    const { l, x, y } = op;
    if (!inGrid(state, x, y)) throw new Error("pearl: move off grid");
    if (l < 0 || l > 15) throw new Error("pearl: bad line value");
    const idx = y * w + x;
    if (op.kind === "line") lines[idx] |= l;
    else if (op.kind === "noline") lines[idx] &= ~l;
    else if (op.kind === "replace") {
      lines[idx] = l;
      marks[idx] &= ~l; // erase marks too
    } else if (op.kind === "flip") lines[idx] ^= l;
    else if (op.kind === "mark") marks[idx] ^= l;
    else assertNever(op, "pearl: executeMove");

    // Reject laying a line over a mark (interpret_move should prevent it).
    if (lines[idx] & l && marks[idx] & l) throw new Error("pearl: line over mark");
  }

  const next = { ...state, lines, marks };
  if (!linesValid(next)) throw new Error("pearl: invalid move");
  return next;
}

/** Solved: the lines are the answer the description's rules say. */
export function status(state: PearlState): GameStatus {
  return isSolved(state) ? "solved" : "ongoing";
}
