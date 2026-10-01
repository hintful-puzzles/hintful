/**
 * Mosaic's hint: the game's one deduction rule, read off the player's own
 * marks. A number whose block already holds its black squares makes the rest
 * of the block white; a number whose block has only as many squares left that
 * are not white as it needs makes those black. Generation keeps a board only
 * when these two alone solve it (`solver.ts`'s `solveCell`), so a board whose
 * marks are all correct always has a next step.
 */

import {
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  narratedStep,
} from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import type { Narration } from "../../engine/hint-words.ts";
import { blockOf } from "./hint-marks.ts";
import { say } from "./hint-text.ts";
import {
  executeMove,
  type MosaicMove,
  type MosaicState,
  STATE_BLANK,
  STATE_MARK_MASK,
  STATE_MARKED,
  STATE_UNMARKED,
} from "./state.ts";

/** What a step decides: `cells` (indices into a grid `w` wide), all `mark`. */
export interface MosaicHint {
  cells: number[];
  mark: number;
  w: number;
}

type Step = HintStep<MosaicMove, MosaicHint>;

/** What the number at index `i` decides of its block's empty squares on
 * `grid` (each square's color, as `STATE_*`), and why; `null` when it decides
 * nothing yet. */
function firingAt(
  state: MosaicState,
  grid: Uint8Array,
  i: number,
): { hint: MosaicHint; words: Narration } | null {
  const { width: w, height: h, board } = state;
  const n = board.clues[i];
  if (n < 0) return null;
  const cx = i % w;
  const cy = Math.floor(i / w);
  // Counted in place: the plan asks every number at least once per hint.
  let black = 0;
  let white = 0;
  let size = 0;
  for (let y = Math.max(0, cy - 1); y <= Math.min(h - 1, cy + 1); y++)
    for (let x = Math.max(0, cx - 1); x <= Math.min(w - 1, cx + 1); x++) {
      size++;
      const m = grid[y * w + x];
      if (m === STATE_MARKED) black++;
      else if (m === STATE_BLANK) white++;
    }
  if (black + white === size) return null;
  const mark = black === n ? STATE_BLANK : size - white === n ? STATE_MARKED : null;
  if (mark === null) return null;
  const clue = { x: cx, y: cy };
  const open = blockOf(clue, w, h).filter(
    (p) => grid[p.y * w + p.x] === STATE_UNMARKED,
  );
  const marked = { clue, n, cells: open };
  const hint = { cells: open.map((p) => p.y * w + p.x), mark, w };
  return {
    hint,
    words: mark === STATE_BLANK ? say.met(marked) : say.needsAll(marked, size),
  };
}

export function mosaicHint(state: MosaicState): HintResult<MosaicMove, MosaicHint> {
  // The whole plan, on a copy of the board's colors: the numbers in reading
  // order, and after each firing the numbers whose blocks it filled, since
  // only those can newly decide anything.
  const { width: w, height: h } = state;
  const grid = state.cells.map((v) => v & STATE_MARK_MASK);
  const queue = Array.from({ length: w * h }, (_, i) => i);
  const queued = new Uint8Array(w * h).fill(1);
  const steps: Step[] = [];
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    queued[i] = 0;
    const f = firingAt(state, grid, i);
    if (f === null) continue;
    const { cells, mark } = f.hint;
    steps.push(
      narratedStep({
        move: { type: "fill", cells, mark },
        words: f.words,
        highlights: f.hint,
      }),
    );
    for (const c of cells) {
      grid[c] = mark;
      for (const p of blockOf({ x: c % w, y: Math.floor(c / w) }, w, h)) {
        const j = p.y * w + p.x;
        if (!queued[j]) {
          queued[j] = 1;
          queue.push(j);
        }
      }
    }
  }
  if (steps.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps };
}

/** A move follows the step when every square it changes is one of the step's
 * squares, given the step's mark; the step shrinks to the squares still to do,
 * so a later auto-hint fills only those. */
export function mosaicKeepTrack(
  m: MosaicMove,
  step: Step,
  state: MosaicState,
): HintTrackVerdict {
  const t = step.highlights;
  if (!t || m.type === "solve") return "off";
  const after = executeMove(state, m).cells;
  const markOf = (cells: Uint8Array, i: number) => cells[i] & STATE_MARK_MASK;
  const { verdict, left } = trackTargets({
    targets: t.cells,
    changes: changedCells(
      state.cells.length,
      (i) => markOf(state.cells, i),
      (i) => markOf(after, i),
    ),
    key: (c) => c,
    want: () => t.mark,
    holds: (c) => markOf(after, c) === t.mark,
  });
  if (verdict === "onTrack") {
    const kept = new Set(left.map((c) => `${c % t.w},${Math.floor(c / t.w)}`));
    step.highlights = { ...t, cells: left };
    step.move = { type: "fill", cells: left, mark: t.mark };
    if (step.words) {
      step.words = step.words.narrow(
        (role, _kind, key) => role !== "ring" || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}
