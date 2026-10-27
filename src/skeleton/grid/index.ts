/**
 * Skeleton: shade squares so that every number counts the shaded squares
 * sharing a side with it. A numbered square is never shaded.
 *
 * This file is the `Game` object and the glue around it. The rules a square
 * obeys are in [`solver.ts`](./solver.ts), and the board in
 * [`state.ts`](./state.ts).
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { entryMistakes, gridCell } from "../../engine/entry-mistakes.ts";
import type { Game, HintStep, SolveResult } from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { SHADED_NAME } from "../../engine/piece.ts";
import { newCursor } from "../../engine/pointer.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  ERASE_KEYS,
  interpretTargetVerbs,
  squareGrid,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newSkeletonDesc } from "./generator.ts";
import { skeletonHint, skeletonKeepTrack } from "./hint.ts";
import {
  border,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SkeletonDrawState,
} from "./render.ts";
import {
  answerOf,
  isComplete,
  SKELETON_RUNGS,
  SkeletonBoard,
  type SkeletonRung,
  solveSkeleton,
} from "./solver.ts";
import {
  BLANK,
  CROSSED,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  FILLED,
  menu,
  NO_CLUE,
  newState,
  paramConfig,
  type SkeletonMark,
  type SkeletonMove,
  type SkeletonParams,
  type SkeletonState,
  type SkeletonUi,
  textFormat,
  validateParams,
} from "./state.ts";

/** A square whose mark is not the answer's. */
export interface SkeletonMistake extends Point {
  kind: "cell" | "note";
}

function newUi(_state: SkeletonState): SkeletonUi {
  return { cursor: newCursor() };
}

// --- input ------------------------------------------------------------------

type SkeletonVerb = TargetVerb<SkeletonState, SkeletonUi, Point, SkeletonMove>;

/** A verb that gives the square `to(old)`: nothing on a number, and nothing
 * where the square would stay as it is. */
const markWith =
  (to: (old: SkeletonMark) => SkeletonMark) =>
  (s: SkeletonState, { x, y }: Point): SkeletonMove | null => {
    const index = y * s.w + x;
    if (s.clues[index] !== NO_CLUE) return null;
    const old = s.grid[index] as SkeletonMark;
    const mark = to(old);
    return mark === old ? null : { kind: "mark", cells: [{ index, mark }] };
  };

/** One click of a button: blank, then `first`, then the other mark, then
 * blank again. */
const cycle =
  (first: SkeletonMark, second: SkeletonMark) =>
  (old: SkeletonMark): SkeletonMark =>
    old === BLANK ? first : old === first ? second : BLANK;

const shade: SkeletonVerb = {
  does: `make it ${SHADED_NAME} (click again to cross it out, and again to clear it)`,
  apply: markWith(cycle(FILLED, CROSSED)),
};
const cross: SkeletonVerb = {
  does: `cross it out (click again to make it ${SHADED_NAME}, and again to clear it)`,
  apply: markWith(cycle(CROSSED, FILLED)),
};

const targetVerbs: TargetVerbs<
  SkeletonState,
  SkeletonUi,
  SkeletonDrawState,
  Point,
  SkeletonMove
> = {
  geometry: squareGrid({ size: (s) => s, border: (ts) => border(ts) }),
  sweep: { holds: (s, { x, y }) => s.grid[y * s.w + x] },
  primary: shade,
  secondary: cross,
  keyOnly: [
    {
      does: "clear it",
      keys: ERASE_KEYS,
      apply: markWith(() => BLANK),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
};

// --- the answer -------------------------------------------------------------

function status(s: SkeletonState): GameStatus {
  return isComplete(s.w, s.h, s.clues, s.grid) ? "solved" : "ongoing";
}

function solve(orig: SkeletonState): SolveResult<SkeletonMove> {
  const grid = answerOf(orig.w, orig.h, orig.clues);
  if (grid === null) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solve", grid } };
}

/** The squares marked against the answer. A blank square is never one, and
 * neither is any square of a board the ladder cannot finish, which has no
 * answer to compare with. */
function findMistakes(state: SkeletonState): readonly SkeletonMistake[] {
  const { w, h, clues, grid } = state;
  const answer = answerOf(w, h, clues);
  if (answer === null) return [];
  return entryMistakes(
    { answer, entry: grid, fixed: (i) => clues[i] !== NO_CLUE },
    gridCell(w),
  );
}

const difficulty: DifficultyContract<SkeletonParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return solveSkeleton(new SkeletonBoard(s.w, s.h, s.clues, s.grid), cap);
  },
};

// --- the hint's gesture -----------------------------------------------------

/** A click on each square the step decides, with the button that marks it
 * the way the step asks. */
function hintGesture(
  state: SkeletonState,
  ui: SkeletonUi,
  ds: SkeletonDrawState,
  move: SkeletonMove,
  step: HintStep<SkeletonMove>,
): readonly PointerAction[] {
  if (move.kind !== "mark") return [];
  const { w } = state;
  return verbClicks(
    targetVerbs,
    { executeMove, hintKeepTrack: skeletonKeepTrack },
    state,
    ui,
    ds,
    step,
    move.cells.map(({ index }) => ({ x: index % w, y: (index / w) | 0 })),
  );
}

export const skeletonGame: Game<
  SkeletonParams,
  SkeletonState,
  SkeletonMove,
  SkeletonUi,
  SkeletonDrawState,
  SkeletonMistake,
  unknown,
  SkeletonRung
> = {
  id: "skeleton",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSkeletonDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove: (state, ui, ds, p, button) =>
    interpretTargetVerbs(targetVerbs, state, ui, ds, p, button),
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  textFormat,

  hint: skeletonHint,
  hintRungs: SKELETON_RUNGS,
  hintMarks: {
    roles: {
      ring: "the squares the step decides. The sentence says what they must be.",
      outline: "the numbers it reasons from.",
      stripes: "the squares two numbers share, where a step reads them together.",
    },
  },
  hintKeepTrack: skeletonKeepTrack,
  hintGesture,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};
