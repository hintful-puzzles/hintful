/**
 * Bricks' hint: the game's compiled ladder (`solver.ts`), walked from the
 * player's own colors and said a square at a time, the steps built by the
 * engine from what `bricks.description.yaml` says of a firing. Each step
 * decides one square, by the rule its other color would break: three in a row,
 * a brick with nothing to rest on, a number given too many or left too few.
 */

import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { HintResult } from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import type { Point } from "../../engine/types.ts";
import { SAYS_EACH, type SaysById } from "./bricks.compiled.ts";
import { sentences } from "./hint-text.ts";
import { answerOf, type BricksRung, hintWalk } from "./solver.ts";
import {
  type BricksMove,
  type BricksState,
  COL_MASK,
  executeMove,
  F_SHADE,
  F_UNSHADE,
} from "./state.ts";

/** What the description reads a square as holding: a shaded brick, or a
 * clear one. */
const SHADED = 1;
const CLEAR = 2;

/** A square a step decides and the color it asks, as the description reads it. */
export interface BricksTarget extends Point {
  value: number;
}

/** What a step decides: the square, with its color. */
export type BricksHint = FiringHint<BricksTarget>;

const valueAt = (state: BricksState, cell: number): number => {
  const color = state.grid[cell] & COL_MASK;
  return color === F_SHADE ? SHADED : color === F_UNSHADE ? CLEAR : 0;
};

const described = describedFiringHint<
  BricksState,
  BricksMove,
  BricksTarget,
  SaysById,
  BricksRung,
  BricksHint
>({
  name: "bricks hint",
  walk: hintWalk,
  // A player rarely follows more than a few steps before going their own way,
  // and the plan is asked for again then.
  plan: 40,
  // Every technique decides a square to a step: the evidence is what that
  // square's own rule reads.
  each: SAYS_EACH,
  width: (s) => s.w,
  size: (s) => s.w * s.h,
  valueAt,
  execute: executeMove,
  foreign: (m) => m.kind === "solve",
  target: (at, n) => ({ ...at, value: n }),
  want: (t) => t.value,
  move: (targets, state) => ({
    kind: "paint",
    cells: targets.map((t) => ({
      index: t.y * state.w + t.x,
      to: t.value === SHADED ? "shade" : "unshade",
    })),
  }),
  say: sentences,
});

/** The steps of the ladder's walk from the player's own colors, with no check
 * that the board has the one answer they are guaranteed to agree with. */
export const bricksSteps = described.hint;

export function bricksHint(
  state: BricksState,
): HintResult<BricksMove, BricksHint, BricksRung> {
  // The plan deduces onward from the player's marks, which `findMistakes` has
  // compared with the answer wherever there is one. A board the search found
  // no one answer to has none, and no plan to trust.
  if (answerOf(state).kind !== "one")
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  return bricksSteps(state);
}

export const bricksKeepTrack = described.hintKeepTrack;
export const bricksRefreshHintStep = described.refreshHintStep;
