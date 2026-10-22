/**
 * Pearl move application, the rules its loop is drawn by, and completion
 * checking — ports of `execute_move` and `check_completion` /
 * `dsf_update_completion` (pearl.c).
 *
 * Split out of `index.ts` so `render.ts`, which previews the in-progress drag,
 * reads the same rules without an import cycle (docs/rendering.md
 * § "A simulated-release preview lives in `moves.ts`").
 */
import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import { Dsf } from "../../engine/dsf.ts";
import { CROSS, LINE, type LineRules, OPEN } from "../../engine/line-drawing.ts";
import {
  D,
  dirCount,
  dirX,
  dirY,
  opposite,
  R,
  sideOf,
  squareEdges,
} from "../../engine/square-edges.ts";
import type { GameStatus } from "../../engine/types.ts";
import { pearlSolve } from "./solver.ts";
import {
  BLANK,
  bLD,
  bLR,
  bLU,
  bRD,
  bRU,
  bUD,
  CORNER,
  DIFF_COUNT,
  ERROR_CLUE,
  inGrid,
  NOCLUE,
  type PearlMove,
  type PearlState,
  STRAIGHT,
} from "./state.ts";

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

// --- completion checking ---------------------------------------------------
const COMP_NONE = 0;
const COMP_LOOP = 1;
const COMP_PATH = 2;
const COMP_SILLY = 3;
const COMP_EMPTY = 4;

/** Merge the two squares an edge connects, or report the state invalid
 * (upstream `dsf_update_completion`). */
function dsfUpdateCompletion(
  state: PearlState,
  ax: number,
  ay: number,
  dir: number,
  dsf: Dsf,
): boolean {
  const w = state.w;
  const ac = ay * w + ax;
  if (!(state.lines[ac] & dir)) return true; // no link
  const bx = ax + dirX(dir);
  const by = ay + dirY(dir);
  if (!inGrid(state, bx, by)) return false; // link off grid
  const bc = by * w + bx;
  if (!(state.lines[bc] & opposite(dir))) return false; // no reciprocal link
  dsf.merge(ac, bc);
  return true;
}

interface CompletionResult {
  /** False when the line data is structurally invalid (a bad move). */
  valid: boolean;
  completed: boolean;
  errors: Uint8Array;
}

/** Classify the loop and mark errors (upstream `check_completion` with
 * `mark = true`). Pure: builds and returns a fresh `errors` array. */
function checkCompletion(state: PearlState): CompletionResult {
  const { w, h, lines, clues } = state;
  const errors = new Uint8Array(w * h);
  let hadError = false;
  let completed = false;

  const error = (x: number, y: number, e: number): void => {
    hadError = true;
    errors[y * w + x] |= e;
  };

  const dsf = new Dsf(w * h);
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      if (
        !dsfUpdateCompletion(state, x, y, R, dsf) ||
        !dsfUpdateCompletion(state, x, y, D, dsf)
      ) {
        return { valid: false, completed, errors };
      }
    }

  const compState = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++)
    compState[i] = dsf.canonify(i) === i ? COMP_LOOP : COMP_NONE;

  // Classify components; mark squares of degree > 2.
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      const type = lines[y * w + x];
      const degree = dirCount(type);
      const comp = dsf.canonify(y * w + x);
      if (degree > 2) {
        error(x, y, type);
        compState[comp] = COMP_SILLY;
      } else if (degree === 0) {
        compState[comp] = COMP_EMPTY;
      } else if (degree === 1) {
        if (compState[comp] !== COMP_SILLY) compState[comp] = COMP_PATH;
      }
    }

  // Count components, find the largest sensible one.
  let nsilly = 0;
  let nloop = 0;
  let npath = 0;
  let totalPathsize = 0;
  let largestComp = -1;
  let largestSize = -1;
  for (let i = 0; i < w * h; i++) {
    if (compState[i] === COMP_SILLY) {
      nsilly++;
    } else if (compState[i] === COMP_PATH) {
      totalPathsize += dsf.size(i);
      npath = 1;
    } else if (compState[i] === COMP_LOOP) {
      nloop++;
      const thisSize = dsf.size(i);
      if (thisSize > largestSize) {
        largestComp = i;
        largestSize = thisSize;
      }
    }
  }
  if (largestSize < totalPathsize) {
    largestComp = -1; // means the paths
    largestSize = totalPathsize;
  }

  if (nloop > 0 && nloop + npath > 1) {
    // Highlight every sensible component that isn't the largest.
    for (let i = 0; i < w * h; i++) {
      const comp = dsf.canonify(i);
      if (
        (compState[comp] === COMP_PATH && largestComp !== -1) ||
        (compState[comp] === COMP_LOOP && comp !== largestComp)
      )
        error(i % w, (i / w) | 0, lines[i]);
    }
  }

  // Check no clues are contradicted.
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      const type = lines[y * w + x];
      if (clues[y * w + x] === CORNER) {
        if ((bLR | bUD) & (1 << type)) error(x, y, ERROR_CLUE); // actually straight
        for (let d = 1; d <= 8; d += d)
          if (type & d) {
            const xx = x + dirX(d);
            const yy = y + dirY(d);
            if (!inGrid(state, xx, yy)) {
              error(x, y, d); // leads off grid
            } else if ((bLU | bLD | bRU | bRD) & (1 << lines[yy * w + xx])) {
              error(x, y, ERROR_CLUE); // touches a corner
            }
          }
      } else if (clues[y * w + x] === STRAIGHT) {
        if ((bLU | bLD | bRU | bRD) & (1 << type)) error(x, y, ERROR_CLUE); // a corner
        let straightTouches = 0;
        for (let d = 1; d <= 8; d += d)
          if (type & d) {
            const xx = x + dirX(d);
            const yy = y + dirY(d);
            if (!inGrid(state, xx, yy)) {
              error(x, y, d); // leads off grid
            } else if ((bLR | bUD) & (1 << lines[yy * w + xx])) {
              straightTouches++;
            }
          }
        if (straightTouches >= 2 && dirCount(type) >= 2) error(x, y, ERROR_CLUE);
      }
    }

  if (nloop === 1 && nsilly === 0 && npath === 0) {
    // A potentially-complete single loop: ensure no clue was left out.
    for (let x = 0; x < w; x++)
      for (let y = 0; y < h; y++) {
        if (lines[y * w + x] === BLANK && clues[y * w + x] !== NOCLUE)
          error(x, y, ERROR_CLUE);
      }
    if (!hadError) completed = true;
  }

  return { valid: true, completed, errors };
}

// --- move application ------------------------------------------------------
/** Apply a move purely, recompute completion/errors. Throws on an illegal
 * move (upstream `execute_move` returning NULL). */
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
  const check = checkCompletion(next);
  if (!check.valid) throw new Error("pearl: invalid move");
  return { ...next, errors: check.errors };
}

/** Solved: one loop, through every clue, contradicting none. */
export function status(state: PearlState): GameStatus {
  const check = checkCompletion(state);
  return check.valid && check.completed ? "solved" : "ongoing";
}
