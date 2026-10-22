/**
 * Path (Numberlink): join each pair of like numbers with a line, so that
 * lines never cross or branch and every square has a line through it.
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
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import { pointAtEdge, squareEdges } from "../../engine/square-edges.ts";
import type { GameStatus } from "../../engine/types.ts";
import { newPathDesc } from "./generator.ts";
import { type PathHighlights, pathHint, pathKeepTrack } from "./hint.ts";
import { pathLines } from "./moves.ts";
import {
  colors,
  computeSize,
  layout,
  newDrawState,
  type PathDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  isComplete,
  PATH_RUNGS,
  PathBoard,
  type PathRung,
  solvePath,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  newState,
  type PathMove,
  type PathParams,
  type PathState,
  type PathUi,
  paramConfig,
  presets,
  textFormat,
  validateParams,
} from "./state.ts";

/** An edge marked against the answer: a line the answer does not have, or a
 * cross on one it does. */
export interface PathMistake {
  edge: number;
}

function newUi(_state: PathState): PathUi {
  return { cursor: newCursor(), drag: null };
}

// --- input ------------------------------------------------------------------

const input = lineDrawing<PathState, PathUi, PathDrawState, PathMove>(pathLines, {
  layout: (ds) => layout(ds.tileSize),
  move: (_state, changes) => ({ kind: "edges", changes }),
});

/** The right button's drag, which crosses every edge it passes. */
export const crossDrag = input.crossDrag;

// --- the answer -------------------------------------------------------------

function status(s: PathState): GameStatus {
  return isComplete(s.w, s.h, s.ends, s.edges) ? "solved" : "ongoing";
}

function solve(orig: PathState): SolveResult<PathMove> {
  const edges = answerOf(orig.w, orig.h, orig.ends);
  if (edges === null) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solve", edges } };
}

/** The lines the answer does not have, and the crosses on lines it does. An
 * open edge is never one, and neither is any edge of a board the ladder
 * cannot finish, which has no answer to compare with. */
function findMistakes(state: PathState): readonly PathMistake[] {
  const answer = answerOf(state.w, state.h, state.ends);
  if (answer === null) return [];
  const out: PathMistake[] = [];
  state.edges.forEach((mark, edge) => {
    if (mark === LINE && answer[edge] !== LINE) out.push({ edge });
    if (mark === CROSS && answer[edge] === LINE) out.push({ edge });
  });
  return out;
}

const difficulty: DifficultyContract<PathParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return solvePath(new PathBoard(s.w, s.h, s.ends, s.edges), cap);
  },
};

// --- the hint's gesture -----------------------------------------------------

/** A click on each edge the step decides: the left button for a line, the
 * right for a cross. */
function hintGesture(
  state: PathState,
  _ui: PathUi,
  ds: PathDrawState,
  move: PathMove,
): readonly PointerAction[] {
  if (move.kind !== "edges") return [];
  return move.changes.map(({ edge, mark }) =>
    click(
      pointAtEdge(squareEdges(state.w, state.h), layout(ds.tileSize), edge),
      mark === LINE ? "primary" : "secondary",
    ),
  );
}

export const pathGame: Game<
  PathParams,
  PathState,
  PathMove,
  PathUi,
  PathDrawState,
  PathMistake,
  PathHighlights,
  PathRung
> = {
  id: "path",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newPathDesc,
  newState,
  newUi,

  interpretMove: input.interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  textFormat,

  hint: pathHint,
  hintRungs: PATH_RUNGS,
  hintMarks: {
    roles: {
      ring: "the edges the step decides, drawn as the line or cross it asks for.",
      outline:
        "the squares it reasons from, and the edges a supposed line or cross would force, numbered in the order they follow.",
    },
  },
  hintKeepTrack: pathKeepTrack,
  hintGesture,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(pathGame);
