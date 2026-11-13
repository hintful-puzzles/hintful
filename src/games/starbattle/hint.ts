/**
 * Star Battle's explained hint: the game's compiled ladder (`solver.ts`) run one
 * firing at a time from the player's own marks, each firing a step built by
 * the engine from what `starbattle.description.yaml` says of it
 * (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a region's border or a mark the player has
 * made: the ladder reads nothing else. A square is open to it until it holds
 * a star or a cross, so the crosses round a star and in a finished row are
 * steps of their own, and the steps after them can be checked against the
 * board.
 */

import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Point } from "../../engine/types.ts";
import { sentences } from "./hint-text.ts";
import { hintWalk, type StarbattleRung } from "./solver.ts";
import type { SaysById } from "./starbattle.compiled.ts";
import {
  BLANK,
  executeMove,
  type StarbattleMark,
  type StarbattleMove,
  type StarbattleState,
} from "./state.ts";

/** A square a step marks, and the mark it asks. */
export interface StarbattleTarget extends Point {
  value: StarbattleMark;
}

/** What a step decides. */
export type StarbattleHint = FiringHint<StarbattleTarget>;

const described = describedFiringHint<
  StarbattleState,
  StarbattleMove,
  StarbattleTarget,
  SaysById,
  StarbattleRung,
  StarbattleHint
>({
  name: "starbattle hint",
  walk: hintWalk,
  // A player rarely follows more than a few steps before going their own way,
  // and the plan is asked for again then.
  plan: 24,
  width: (s) => s.size,
  size: (s) => s.grid.length,
  valueAt: (s, cell) => s.grid[cell],
  execute: executeMove,
  foreign: (m) => m.kind !== "mark",
  target: (at, n) => ({ ...at, value: n as StarbattleMark }),
  want: (t) => t.value,
  move: (targets, state) => ({
    kind: "mark",
    cells: targets.map((t) => ({ index: t.y * state.size + t.x, mark: t.value })),
  }),
  say: sentences,
});

export const starbattleHint = described.hint;
export const starbattleRefreshHintStep = described.refreshHintStep;

/**
 * Judge a move against the step on show by what it did to the board, so a
 * click, a drag and a key that make the same change are the same
 * (`engine/hint-track.ts`). A step that decides several squares shrinks to
 * the ones left.
 */
export function starbattleKeepTrack(
  move: StarbattleMove,
  step: HintStep<StarbattleMove, StarbattleHint>,
  state: StarbattleState,
): HintTrackVerdict {
  if (move.kind !== "mark" || step.move.kind !== "mark") return "off";
  // A button's second click is the other button's first, so the first click
  // of two on a blank square the step asks for is on the way to its mark.
  const [first, ...more] = move.cells;
  if (
    more.length === 0 &&
    first.mark !== BLANK &&
    state.grid[first.index] === BLANK &&
    step.move.cells.some((t) => t.index === first.index && t.mark !== first.mark)
  )
    return "onTrack";
  return described.hintKeepTrack(move, step, state);
}
