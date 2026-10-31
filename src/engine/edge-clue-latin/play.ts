/**
 * Playing the edge-clue Latin square: input, moves, Solve, the mistake check
 * and the keypad, which Unequal and Adjacent share. Left-click selects a cell
 * for an entry and right-click for pencil marks; on the keyboard, select
 * toggles pencil mode; a digit enters (or pencil-toggles) that number; clicking
 * a clue in the gap between two cells grays it out ("spent"). Rule violations
 * highlight live; Check & Save additionally flags cells that contradict the
 * unique solution.
 */

import { assertNever } from "../assert-never.ts";
import { adaptiveMarkAllMove, applyNoteMove } from "../candidate-hint.ts";
import type { DifficultyContract } from "../difficulty.ts";
import { entryMistakes, gridCell } from "../entry-mistakes.ts";
import { type SolveResult, UI_UPDATE, type UiUpdate } from "../game.ts";
import { clearKey } from "../key-labels.ts";
import { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE, latinVerdict } from "../latin.ts";
import { rowColRegions } from "../latin-hint.ts";
import {
  noOpEntryResult,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../note-taking-cell.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  isCursorMove,
  isMouseDrag,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  moveCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../pointer.ts";
import { MULTIPLE_SOLUTIONS, NO_SOLUTION } from "../solve-failure.ts";
import { beginSweep, dragMarkVerbs, sweepTo } from "../target-verb.ts";
import type { KeyLabel, Point } from "../types.ts";
import { coord, type EdgeClueDrawState, fromCoord } from "./render.ts";
import { solveEdgeClues } from "./solver.ts";
import {
  ADJTHAN,
  adjToSpent,
  type ClueKind,
  charValue,
  cloneState,
  DIFF_RECURSIVE,
  type EdgeClueMove,
  type EdgeClueParams,
  type EdgeClueState,
  type EdgeClueUi,
  F_ADJ_DOWN,
  F_ADJ_LEFT,
  F_ADJ_RIGHT,
  F_ADJ_UP,
  F_SPENT_DOWN,
  F_SPENT_LEFT,
  F_SPENT_RIGHT,
  F_SPENT_UP,
  newState,
} from "./state.ts";

/** A player marking that contradicts the unique solution:
 * - `"cell"` — a filled-in number that is wrong;
 * - `"note"` — an empty cell whose non-empty pencil notes have crossed out the
 *   cell's solution value. */
export interface EdgeClueMistake {
  kind: "cell" | "note";
  x: number;
  y: number;
}

type SpentMove = Extract<EdgeClueMove, { type: "spent" }>;

/** The move that flips the clue in the gap a press at `p` lands in, below or
 * to the right of its cell, or `null` where that gap holds no clue. */
function clueInGap(
  state: EdgeClueState,
  ds: EdgeClueDrawState,
  p: Point,
): SpentMove | null {
  const o = state.order;
  const ts = ds.tileSize;
  const tx = fromCoord(p.x, ts);
  const ty = fromCoord(p.y, ts);
  if (tx < 0 || tx >= o || ty < 0 || ty >= o) return null;
  const gapBelow = p.y - coord(ty, ts) > ts;
  const gapRight = p.x - coord(tx, ts) > ts;
  if (gapBelow === gapRight) return null;
  if (gapBelow) {
    if (state.clueFlags[ty * o + tx] & F_ADJ_DOWN)
      return { type: "spent", x: tx, y: ty, flag: F_SPENT_DOWN };
    if (ty + 1 < o && state.clueFlags[(ty + 1) * o + tx] & F_ADJ_UP)
      return { type: "spent", x: tx, y: ty + 1, flag: F_SPENT_UP };
    return null;
  }
  if (state.clueFlags[ty * o + tx] & F_ADJ_RIGHT)
    return { type: "spent", x: tx, y: ty, flag: F_SPENT_RIGHT };
  if (tx + 1 < o && state.clueFlags[ty * o + tx + 1] & F_ADJ_LEFT)
    return { type: "spent", x: tx + 1, y: ty, flag: F_SPENT_LEFT };
  return null;
}

/** The "this clue is spent" mark, which a drag through the gaps repeats. The
 * target is the move itself: it names its clue. */
export const spentDrag = dragMarkVerbs<
  EdgeClueState,
  EdgeClueUi,
  EdgeClueDrawState,
  SpentMove,
  EdgeClueMove
>({
  noun: "clue",
  target: clueInGap,
  apply: (_state, clue) => clue,
  sweep: {
    holds: (state, { x, y, flag }) => (state.spent[y * state.order + x] & flag ? 1 : 0),
  },
});

export function interpretMove(
  state: EdgeClueState,
  ui: EdgeClueUi,
  ds: EdgeClueDrawState,
  p: Point,
  rawButton: number,
): EdgeClueMove | null | UiUpdate {
  const o = state.order;
  const ts = ds.tileSize;
  const shiftOrCtrl = (rawButton & (MOD_SHFT | MOD_CTRL)) !== 0;
  const button = stripModifiers(rawButton);

  const tx = fromCoord(p.x, ts);
  const ty = fromCoord(p.y, ts);
  const inGrid = tx >= 0 && tx < o && ty >= 0 && ty < o;

  if (isMouseDrag(button)) return sweepTo(spentDrag, state, ui, ds, p);

  if (inGrid && (button === LEFT_BUTTON || button === RIGHT_BUTTON)) {
    // A click in the gap below/right of a cell toggles that clue's spent flag,
    // and a drag on through the gaps marks the clues that looked the same.
    const gapBelow = p.y - coord(ty, ts) > ts;
    const gapRight = p.x - coord(tx, ts) > ts;
    if (gapBelow && gapRight) return null;
    if (gapBelow || gapRight) {
      const clue = clueInGap(state, ds, p);
      if (clue === null) return null;
      // Either button marks, so the drag is opened as the one it declares.
      beginSweep(spentDrag, state, ui, clue, LEFT_BUTTON, p, true);
      return clue;
    }

    pressNoteTakingCell(ui, button, tx, ty, {
      canEnter: !state.immutable[ty * o + tx],
      canMark: state.grid[ty * o + tx] === 0,
    });
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    if (shiftOrCtrl) {
      // Toggle the spent state of the clue between the cursor cell and the cell
      // the arrow points to.
      let nx = ui.cursor.x;
      let ny = ui.cursor.y;
      if (button === CURSOR_LEFT) nx = Math.max(nx - 1, 0);
      else if (button === CURSOR_RIGHT) nx = Math.min(nx + 1, o - 1);
      else if (button === CURSOR_UP) ny = Math.max(ny - 1, 0);
      else if (button === CURSOR_DOWN) ny = Math.min(ny + 1, o - 1);
      ui.cursor.visible = true;
      ui.cursorFromKeyboard = true;

      let i = 0;
      for (; i < 4; i++) {
        if (nx === ui.cursor.x + ADJTHAN[i].dx && ny === ui.cursor.y + ADJTHAN[i].dy)
          break;
      }
      if (i === 4) return UI_UPDATE; // not a single step in a clue direction

      const here = state.clueFlags[ui.cursor.y * o + ui.cursor.x];
      const there = state.clueFlags[ny * o + nx];
      if (!(here & ADJTHAN[i].f || there & ADJTHAN[i].fo)) return UI_UPDATE; // no clue

      // A clue flagged from one end keeps its spent flag there; one flagged from
      // both, on the cell above or left of it, where the gap is drawn from.
      const self = state.kind.bothEnds
        ? ADJTHAN[i].dx >= 0 && ADJTHAN[i].dy >= 0
        : (here & ADJTHAN[i].f) !== 0;
      return self
        ? {
            type: "spent",
            x: ui.cursor.x,
            y: ui.cursor.y,
            flag: adjToSpent(ADJTHAN[i].f),
          }
        : { type: "spent", x: nx, y: ny, flag: adjToSpent(ADJTHAN[i].fo) };
    }
    ui.cursorFromKeyboard = true;
    return moveCursor(ui.cursor, button, o, o) ? UI_UPDATE : null;
  }

  const toggled = toggleNoteTakingMode(ui, button);
  if (toggled) return toggled;

  const n = charValue(button, o);
  if (ui.cursor.visible && n >= 0 && n <= o) {
    const i = ui.cursor.y * o + ui.cursor.x;
    if (state.immutable[i]) return null; // can't edit a given
    if (ui.pencilMode && state.grid[i] > 0) return null; // can't pencil a filled cell

    // No-op: setting a cell to what it already holds (and no pencil marks).
    if ((!ui.pencilMode || n === 0) && state.grid[i] === n && state.pencil[i] === 0)
      return noOpEntryResult(ui);

    const pencil = ui.pencilMode && n > 0;
    releaseHighlightAfterEntry(ui);
    return pencil
      ? { type: "set", x: ui.cursor.x, y: ui.cursor.y, n, pencil }
      : {
          type: "set",
          x: ui.cursor.x,
          y: ui.cursor.y,
          n,
          pencil,
          autoElim: ui.autoPencil,
        };
  }

  return null;
}

/** Fill all pencil marks, then (on a fully-noted board) clean the obvious
 * row/column candidates — the basic-region opening, in one press. */
export function markAll(state: EdgeClueState): EdgeClueMove | null {
  const o = state.order;
  return adaptiveMarkAllMove<EdgeClueMove>(state.grid, state.pencil, o, (x, y) =>
    rowColRegions(x, y, o),
  );
}

export function executeMove(state: EdgeClueState, move: EdgeClueMove): EdgeClueState {
  const o = state.order;
  const next = cloneState(state);

  switch (move.type) {
    case "set": {
      const i = move.y * o + move.x;
      if (state.immutable[i])
        throw new Error(`${state.kind.game}: move into an immutable cell`);
      if (move.pencil && move.n > 0) {
        next.pencil[i] ^= 1 << move.n;
      } else {
        next.grid[i] = move.n;
        next.pencil[i] = 0;
        if (move.autoElim && move.n > 0) {
          const bit = ~(1 << move.n);
          for (let k = 0; k < o; k++) {
            if (k !== move.x) next.pencil[move.y * o + k] &= bit;
            if (k !== move.y) next.pencil[k * o + move.x] &= bit;
          }
        }
      }
      return next;
    }
    case "spent": {
      next.spent[move.y * o + move.x] ^= move.flag;
      return next;
    }
    case "pencilAll":
    case "pencilStrike":
    case "pencilAdd":
      applyNoteMove(move, next.grid, next.pencil, o);
      return next;
    case "solve": {
      for (let i = 0; i < o * o; i++) {
        next.grid[i] = move.grid[i];
        next.pencil[i] = 0;
      }
      return next;
    }
    default:
      return assertNever(move, `${state.kind.game}: executeMove`);
  }
}

export function changedState(
  ui: EdgeClueUi,
  _old: EdgeClueState | null,
  newSt: EdgeClueState,
): void {
  const o = newSt.order;
  if (
    ui.cursor.visible &&
    ui.pencilMode &&
    !ui.cursorFromKeyboard &&
    newSt.grid[ui.cursor.y * o + ui.cursor.x] !== 0
  ) {
    ui.cursor.visible = false;
  }
}

export function solve(
  orig: EdgeClueState,
  _curr: EdgeClueState,
  aux?: string,
): SolveResult<EdgeClueMove> {
  const o = orig.order;
  if (aux) {
    const grid: number[] = [];
    for (let i = 0; i < o * o; i++) grid[i] = charValue(aux.charCodeAt(i + 1), o);
    return { ok: true, move: { type: "solve", grid } };
  }
  const soln = Uint8Array.from(orig.immutable);
  const ret = solveEdgeClues(o, orig.kind, orig.clueFlags, soln, DIFF_RECURSIVE);
  if (ret === DIFF_IMPOSSIBLE) return { ok: false, error: NO_SOLUTION };
  if (ret === DIFF_AMBIGUOUS) return { ok: false, error: MULTIPLE_SOLUTIONS };
  return { ok: true, move: { type: "solve", grid: Array.from(soln) } };
}

export function findMistakes(state: EdgeClueState): readonly EdgeClueMistake[] {
  const o = state.order;
  // The solution is derived from the placed givens only — never from the notes.
  const soln = Uint8Array.from(state.immutable);
  const ret = solveEdgeClues(o, state.kind, state.clueFlags, soln, DIFF_RECURSIVE);
  if (ret === DIFF_IMPOSSIBLE || ret === DIFF_AMBIGUOUS) return [];
  return entryMistakes(
    {
      answer: soln,
      entry: state.grid,
      notes: state.pencil,
      fixed: (i) => state.immutable[i] !== 0,
    },
    gridCell(o),
  );
}

/**
 * The on-screen keypad, faithful to upstream `game_request_keys`. Unlike the
 * shared `digitKeys`, it switches to a `'0'`-based keypad for order ≥ 10
 * (`'0'..'9'` = 1..10, then `'a','b',…` = 11.., mirroring `c2n`), then the
 * clear key.
 */
export function edgeClueKeys(order: number): KeyLabel[] {
  const keys: KeyLabel[] = [];
  let off = (order > 9 ? "0" : "1").charCodeAt(0);
  for (let i = 0; i < order; i++) {
    if (i === 10) off = "a".charCodeAt(0) - 10;
    const button = i + off;
    keys.push({ button, label: String.fromCharCode(button) });
  }
  keys.push(clearKey);
  return keys;
}

/** The difficulty contract (`engine/difficulty.ts`) of a game of `kind`.
 * `solveEdgeClues` follows the shared latin-family return convention — the
 * difficulty reached, or one of `latin.ts`'s sentinels — so `latinVerdict`
 * reads it. Seeded from the immutable givens; the clue flags come from the
 * desc. */
export function edgeClueDifficulty(kind: ClueKind): DifficultyContract<EdgeClueParams> {
  return {
    solveAtCap: (p, desc, cap) => {
      const s = newState(kind, p, desc);
      return latinVerdict(
        solveEdgeClues(s.order, kind, s.clueFlags, Uint8Array.from(s.immutable), cap),
      );
    },
  };
}
