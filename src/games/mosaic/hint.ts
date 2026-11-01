/**
 * Mosaic's hint: the game's compiled ladder (`solver.ts`), walked from the
 * player's own marks and said a firing at a time. An Easy board as dealt
 * always has a next step from one number alone; on any other board the hint
 * goes on to compare two numbers, and stops where that decides nothing either.
 */

import {
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  narratedStep,
} from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { blockOf } from "./hint-marks.ts";
import { say } from "./hint-text.ts";
import { type MosaicReason, type MosaicRung, mosaicWalk } from "./solver.ts";
import {
  executeMove,
  type MosaicMove,
  type MosaicState,
  STATE_MARK_MASK,
} from "./state.ts";

/** What a step decides: `cells` (indices into a grid `w` wide), all `mark`. */
export interface MosaicHint {
  cells: number[];
  mark: number;
  w: number;
}

type Step = HintStep<MosaicMove, MosaicHint, MosaicRung>;

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then; each step reads every number on the board, which on a large one is
 * the cost of a hint. */
const PLAN_CAP = 24;

/** A firing's sentence: `f` decides `squares`. */
function wordsOf(state: MosaicState, f: MosaicReason, squares: number[]): Sentence {
  const { width: w, height: h, board } = state;
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const numbered = (i: number) => ({ clue: at(i), n: board.clues[i] as number });
  const cells = squares.map(at);
  if (!("other" in f)) {
    const alone = { ...numbered(f.clue), cells };
    return f.rung === "met"
      ? say.met(alone)
      : say.needsAll(alone, blockOf(alone.clue, w, h).length);
  }
  const pair = {
    ...numbered(f.clue),
    other: numbered(f.other),
    need: f.need,
    by: f.by,
    cells,
  };
  return f.rung === "needsMore" ? say.needsMore(pair) : say.sameNeed(pair);
}

export function mosaicHint(
  state: MosaicState,
): HintResult<MosaicMove, MosaicHint, MosaicRung> {
  // The plan, on a copy of the board's colors.
  const grid = state.cells.map((v) => v & STATE_MARK_MASK);
  const steps: Step[] = [];
  const next = mosaicWalk(state.board, grid);
  while (steps.length < PLAN_CAP) {
    const f = next();
    if (f === null || f === "contradiction") break;
    const cells: number[] = [];
    for (let i = 0; i < f.facts.length; i += 3) cells.push(f.facts[i + 1] as number);
    // Every fact of a firing places the one mark its technique concludes.
    const mark = f.facts[2] as number;
    const reason = f.reasons[0] as MosaicReason;
    steps.push(
      narratedStep({
        move: { type: "fill", cells, mark },
        rung: reason.rung,
        words: wordsOf(state, reason, cells),
        highlights: { cells, mark, w: state.width },
      }),
    );
  }
  if (steps.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps };
}

/** A move follows the step when every square it changes is one of the step's
 * squares, given the step's mark; the step shrinks to the squares still to do,
 * so a later auto-hint fills only those. */
export function mosaicKeepTrack(
  m: MosaicMove,
  step: HintStep<MosaicMove, MosaicHint>,
  state: MosaicState,
): HintTrackVerdict {
  const t = step.highlights;
  if (!t || m.type === "solve") return "off";
  const after = executeMove(state, m).cells;
  const markAt = (cells: Uint8Array, i: number) => cells[i] & STATE_MARK_MASK;
  const { verdict, left } = trackTargets({
    targets: t.cells,
    changes: changedCells(
      state.cells.length,
      (i) => markAt(state.cells, i),
      (i) => markAt(after, i),
    ),
    key: (c) => c,
    want: () => t.mark,
    holds: (c) => markAt(after, c) === t.mark,
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
