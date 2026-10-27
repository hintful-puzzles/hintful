/**
 * Skeleton: draw one loop through every square, along the edges between
 * them, never crossing a wall.
 *
 * This file is the `Game` object and the glue around it: the input, the
 * answer, the hint's gesture. The rules a line obeys are in
 * [`solver.ts`](./solver.ts), and the board in [`state.ts`](./state.ts).
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import type { Game, SolveResult } from "../../engine/game.ts";
import {
  type EdgeMistake,
  edgeMistakes,
  lineDrawing,
} from "../../engine/line-drawing.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import type { GameStatus } from "../../engine/types.ts";
import { newSkeletonDesc } from "./generator.ts";
import { type SkeletonHighlights, skeletonHint, skeletonKeepTrack } from "./hint.ts";
import { skeletonLines } from "./moves.ts";
import {
  colors,
  computeSize,
  layout,
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
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  newState,
  paramConfig,
  type SkeletonMove,
  type SkeletonParams,
  type SkeletonState,
  type SkeletonUi,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: SkeletonState): SkeletonUi {
  return { cursor: newCursor(), drag: null };
}

// --- input ------------------------------------------------------------------

const input = lineDrawing<SkeletonState, SkeletonUi, SkeletonDrawState, SkeletonMove>(
  skeletonLines,
  {
    layout: (ds) => layout(ds.tileSize),
    move: (_state, changes) => ({ kind: "edges", changes }),
  },
);

/** The right button's drag, which crosses every edge it passes. Not a `Game`
 * member, so the test of it imports it from here. */
export const crossDrag = input.crossDrag;

// --- the answer -------------------------------------------------------------

function status(s: SkeletonState): GameStatus {
  return isComplete(s.w, s.h, s.walls, s.edges) ? "solved" : "ongoing";
}

function solve(orig: SkeletonState): SolveResult<SkeletonMove> {
  const edges = answerOf(orig.w, orig.h, orig.walls);
  if (edges === null) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solve", edges } };
}

/** No edge of a board the ladder cannot finish is a mistake: it has no
 * answer to compare with. */
function findMistakes(state: SkeletonState): readonly EdgeMistake[] {
  const answer = answerOf(state.w, state.h, state.walls);
  return answer === null ? [] : edgeMistakes(state.edges, answer);
}

const difficulty: DifficultyContract<SkeletonParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return solveSkeleton(new SkeletonBoard(s.w, s.h, s.walls, s.edges), cap);
  },
};

export const skeletonGame: Game<
  SkeletonParams,
  SkeletonState,
  SkeletonMove,
  SkeletonUi,
  SkeletonDrawState,
  EdgeMistake,
  SkeletonHighlights,
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

  interpretMove: input.interpretMove,
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
      ring: "the edges the step decides, drawn as the line or cross it asks for.",
      outline:
        "the squares it reasons from, and the edges a supposed line or cross would force, drawn thin.",
    },
  },
  hintKeepTrack: skeletonKeepTrack,
  hintGesture: (state, _ui, ds, move) =>
    move.kind === "edges" ? input.hintGesture(state, ds, move.changes) : [],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};
