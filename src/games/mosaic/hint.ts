/**
 * Mosaic's hint: the game's deduction (`deduce.ts`), read off the player's own
 * marks and said a step at a time. An Easy board as dealt always has a next
 * step from one number alone; on any other board the hint goes on to compare
 * two numbers, and stops where that decides nothing either.
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
import { deduce, type Firing, type MosaicRung, markOf } from "./deduce.ts";
import { blockOf } from "./hint-marks.ts";
import { say } from "./hint-text.ts";
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

/** A firing's sentence. */
function wordsOf(state: MosaicState, f: Firing): Sentence {
  const { width: w, height: h, board } = state;
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const numbered = (i: number) => ({ clue: at(i), n: board.clues[i] as number });
  const cells = f.cells.map(at);
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
  // The whole plan, on a copy of the board's colors.
  const grid = state.cells.map((v) => v & STATE_MARK_MASK);
  const steps: Step[] = [];
  deduce(state.board, grid, (f) => {
    const mark = markOf(f.rung);
    steps.push(
      narratedStep({
        move: { type: "fill", cells: f.cells, mark },
        rung: f.rung,
        words: wordsOf(state, f),
        highlights: { cells: f.cells, mark, w: state.width },
      }),
    );
  });
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
