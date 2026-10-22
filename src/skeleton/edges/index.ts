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
import { click, type PointerAction } from "../../engine/hint-gesture.ts";
import { CROSS, LINE, lineDrawing } from "../../engine/line-drawing.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import { pointAtEdge, squareEdges } from "../../engine/square-edges.ts";
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
  newState,
  paramConfig,
  presets,
  type SkeletonMove,
  type SkeletonParams,
  type SkeletonState,
  type SkeletonUi,
  textFormat,
  validateParams,
} from "./state.ts";

/** An edge marked against the answer: a line the answer does not have, or a
 * cross on one it does. */
export interface SkeletonMistake {
  edge: number;
}

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

/** The lines the answer does not have, and the crosses on lines it does. An
 * open edge is never one, and neither is any edge of a board the ladder
 * cannot finish, which has no answer to compare with. */
function findMistakes(state: SkeletonState): readonly SkeletonMistake[] {
  const answer = answerOf(state.w, state.h, state.walls);
  if (answer === null) return [];
  const out: SkeletonMistake[] = [];
  state.edges.forEach((mark, edge) => {
    if (mark === LINE && answer[edge] !== LINE) out.push({ edge });
    if (mark === CROSS && answer[edge] === LINE) out.push({ edge });
  });
  return out;
}

const difficulty: DifficultyContract<SkeletonParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return solveSkeleton(new SkeletonBoard(s.w, s.h, s.walls, s.edges), cap);
  },
};

// --- the hint's gesture -----------------------------------------------------

/** A click on each edge the step decides: the left button for a line, the
 * right for a cross. */
function hintGesture(
  state: SkeletonState,
  _ui: SkeletonUi,
  ds: SkeletonDrawState,
  move: SkeletonMove,
): readonly PointerAction[] {
  if (move.kind !== "edges") return [];
  return move.changes.map(({ edge, mark }) =>
    click(
      pointAtEdge(squareEdges(state.w, state.h), layout(ds.tileSize), edge),
      mark === LINE ? "primary" : "secondary",
    ),
  );
}

export const skeletonGame: Game<
  SkeletonParams,
  SkeletonState,
  SkeletonMove,
  SkeletonUi,
  SkeletonDrawState,
  SkeletonMistake,
  SkeletonHighlights,
  SkeletonRung
> = {
  id: "skeleton",

  defaultParams,
  presets,
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
        "the squares it reasons from, and the edges a supposed line or cross would force, numbered in the order they follow.",
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
